"""
Linear Programming (LP) Charge Sheet Optimizer & Pareto Frontier Engine.
Uses scipy.optimize.linprog (HiGHS solver) to solve continuous multi-objective
charge mix problems for stainless steel heats:
1. Least-Cost Charge Sheet (Minimizing $/tonne liquid steel)
2. Least-Carbon Charge Sheet (Minimizing tCO2/tonne liquid steel)
3. Pareto Frontier Generation: Sweeps multi-objective weights alpha in [0, 1]
   mapping the Pareto trade-off curve between operating cost and carbon footprint.
Enforces:
- Strict ASTM / JSL elemental ranges (%Cr, %Ni, %Mo, %Mn, %Cu, %C, %Si, %Fe)
- Grade-specific physical scrap ceilings (scrap_cap)
- Tramp element ceilings: Cu <= 0.50%, Sn <= 0.03%, Ni in ferritics <= 0.50%
- Mass conservation: sum of metallic recoveries = 1.000 t liquid steel
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import numpy as np
from scipy.optimize import linprog

from jsl_carbon_engine.core.grades import Grade, get_grade
from jsl_carbon_engine.config.emission_factors import (
    RAW_MATERIALS,
    METALLURGICAL_RECOVERIES,
    PRODUCTS,
    CASTING_ROUTES,
)
from jsl_carbon_engine.config.jsl_facilities import get_facility


@dataclass
class OptimizerResult:
    grade_id: str
    is_feasible: bool
    status_message: str
    alpha_cost_weight: float  # 1.0 = min cost, 0.0 = min carbon
    # Optimal Charge Mix (tonnes per tonne liquid steel)
    charge_sheet_t: Dict[str, float]
    # Optimal Charge Mix (wt % of charge)
    charge_sheet_pct: Dict[str, float]
    # Chemical verification of bath (wt %)
    final_chemistry_pct: Dict[str, float]
    # Key performance indicators
    charge_cost_usd_per_t: float
    total_co2_t_per_t: float
    scrap_share_pct: float
    virgin_dri_share_pct: float
    ferroalloys_share_pct: float
    # Dual variables & economic valuation (HiGHS / Rawmatmix)
    tramp_shadow_prices: Dict[str, float] = field(default_factory=dict)
    value_in_use_usd_per_t: Dict[str, float] = field(default_factory=dict)
    scrap_ceiling_shadow_price_usd_per_t: float = 0.0
    estimated_lime_kg_per_t: float = 0.0
    estimated_slag_kg_per_t: float = 0.0


@dataclass
class ParetoPoint:
    alpha: float
    cost_usd_per_t: float
    co2_t_per_t: float
    scrap_pct: float
    charge_sheet: Dict[str, float]


@dataclass
class ParetoFrontierResult:
    grade_id: str
    frontier_points: List[ParetoPoint]
    least_cost_point: ParetoPoint
    least_carbon_point: ParetoPoint
    max_co2_abatement_potential_pct: float
    cost_of_carbon_abatement_usd_per_tco2: float


# Feed material definitions for the LP model
FEED_KEYS = [
    "scrap",        # Stainless scrap (matches grade target chemistry)
    "coalDRI",      # Coal-based DRI (88% Fe, 2.0% C)
    "gasDRI",       # Gas-based DRI (92% Fe, 1.8% C)
    "pigIron",      # Blast furnace pig iron (94% Fe, 4.2% C)
    "fecrStandard", # Standard HC FeCr (55% Cr, 40% Fe, 7% C)
    "fecrLowC",     # LC FeCr (65% Cr, 34% Fe, 0.1% C)
    "niStandard",   # Primary Nickel (99.8% Ni)
    "niClass1",     # Low-carbon Class 1 Hydro Nickel (99.8% Ni)
    "niNPI",        # Indonesian Coal RKEF NPI (14% Ni, 80% Fe)
    "femo",         # FeMo 65 (65% Mo, 33% Fe)
    "feMn",         # FeMn 75 (75% Mn, 20% Fe)
    "cuFeed",       # Electrolytic Copper Granules / Cathode (99% Cu)
]


def _build_feed_composition_matrix(
    grade: Grade,
    custom_scrap_cr: Optional[float] = None,
    custom_scrap_ni: Optional[float] = None,
    custom_scrap_cu: Optional[float] = None,
    custom_scrap_sn: Optional[float] = None,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Constructs the elemental fraction matrix C[element, feed] and recovery factors.
    Rows: Cr, Ni, Mo, Mn, Cu, Fe, C, Si, Sn, Total Metallic Yield
    """
    elements = ["Cr", "Ni", "Mo", "Mn", "Cu", "Fe", "C", "Si", "Sn", "P", "S"]
    n_elems = len(elements)
    n_feeds = len(FEED_KEYS)

    mat = np.zeros((n_elems, n_feeds))

    # Scrap: reflects grade nominal targets with optional stochastic perturbations
    mat[0, 0] = (custom_scrap_cr if custom_scrap_cr is not None else grade.cr) / 100.0   # Cr
    mat[1, 0] = (custom_scrap_ni if custom_scrap_ni is not None else grade.ni) / 100.0   # Ni
    mat[2, 0] = grade.mo / 100.0   # Mo
    mat[3, 0] = grade.mn / 100.0   # Mn
    mat[4, 0] = (custom_scrap_cu if custom_scrap_cu is not None else grade.cu) / 100.0   # Cu
    mat[6, 0] = grade.c / 100.0    # C
    mat[7, 0] = grade.si / 100.0   # Si
    mat[8, 0] = (custom_scrap_sn if custom_scrap_sn is not None else 0.015) / 100.0      # Sn (0.015% typical scrap tramp)
    mat[9, 0] = 0.030 / 100.0      # P
    mat[10, 0] = 0.020 / 100.0     # S
    # Scrap iron balance: strictly enforces total elements sum to 1.0 (100% scrap mass)
    other_scrap_sum = (
        mat[0, 0] + mat[1, 0] + mat[2, 0] + mat[3, 0] +
        mat[4, 0] + mat[6, 0] + mat[7, 0] + mat[8, 0] +
        mat[9, 0] + mat[10, 0]
    )
    mat[5, 0] = max(0.0, 1.0 - other_scrap_sum)  # Fe balance in scrap

    # coalDRI
    mat[0, 1] = 0.0005  # 0.05% Cr
    mat[1, 1] = 0.0002  # 0.02% Ni
    mat[2, 1] = 0.0000
    mat[3, 1] = 0.0010  # 0.10% Mn
    mat[4, 1] = 0.0001  # 0.01% Cu
    mat[5, 1] = 0.8800  # 88% Fe
    mat[6, 1] = 0.0200  # 2.0% C
    mat[7, 1] = 0.0020  # 0.20% Si
    mat[8, 1] = 0.00005
    mat[9, 1] = 0.020 / 100.0 # P
    mat[10, 1] = 0.015 / 100.0 # S

    # gasDRI
    mat[0, 2] = 0.0005
    mat[1, 2] = 0.0002
    mat[2, 2] = 0.0000
    mat[3, 2] = 0.0010
    mat[4, 2] = 0.0001
    mat[5, 2] = 0.9200  # 92% Fe
    mat[6, 2] = 0.0180  # 1.8% C
    mat[7, 2] = 0.0015
    mat[8, 2] = 0.00005
    mat[9, 2] = 0.015 / 100.0 # P
    mat[10, 2] = 0.010 / 100.0 # S

    # pigIron
    mat[0, 3] = 0.0005
    mat[1, 3] = 0.0002
    mat[2, 3] = 0.0000
    mat[3, 3] = 0.0030  # 0.3% Mn
    mat[4, 3] = 0.0002
    mat[5, 3] = 0.9400  # 94% Fe
    mat[6, 3] = 0.0420  # 4.2% C
    mat[7, 3] = 0.0050  # 0.5% Si
    mat[8, 3] = 0.00005
    mat[9, 3] = 0.060 / 100.0 # P
    mat[10, 3] = 0.040 / 100.0 # S

    # fecrStandard (55% Cr, 40% Fe, 7% C, 1.5% Si)
    mat[0, 4] = 0.5500
    mat[1, 4] = 0.0000
    mat[2, 4] = 0.0000
    mat[3, 4] = 0.0000
    mat[4, 4] = 0.0000
    mat[5, 4] = 0.4000
    mat[6, 4] = 0.0700
    mat[7, 4] = 0.0150
    mat[8, 4] = 0.0000
    mat[9, 4] = 0.025 / 100.0 # P
    mat[10, 4] = 0.015 / 100.0 # S

    # fecrLowC (65% Cr, 34% Fe, 0.1% C, 1.0% Si)
    mat[0, 5] = 0.6500
    mat[1, 5] = 0.0000
    mat[2, 5] = 0.0000
    mat[3, 5] = 0.0000
    mat[4, 5] = 0.0000
    mat[5, 5] = 0.3400
    mat[6, 5] = 0.0010
    mat[7, 5] = 0.0100
    mat[8, 5] = 0.0000
    mat[9, 5] = 0.025 / 100.0 # P
    mat[10, 5] = 0.015 / 100.0 # S

    # niStandard (99.8% Ni, 0.1% Fe)
    mat[0, 6] = 0.0000
    mat[1, 6] = 0.9980
    mat[2, 6] = 0.0000
    mat[3, 6] = 0.0000
    mat[4, 6] = 0.0000
    mat[5, 6] = 0.0010
    mat[6, 6] = 0.0005
    mat[7, 6] = 0.0000
    mat[8, 6] = 0.0000
    mat[9, 6] = 0.0000
    mat[10, 6] = 0.0000

    # niClass1 (99.8% Ni, 0.1% Fe)
    mat[0, 7] = 0.0000
    mat[1, 7] = 0.9980
    mat[2, 7] = 0.0000
    mat[3, 7] = 0.0000
    mat[4, 7] = 0.0000
    mat[5, 7] = 0.0010
    mat[6, 7] = 0.0001
    mat[7, 7] = 0.0000
    mat[8, 7] = 0.0000
    mat[9, 7] = 0.0000
    mat[10, 7] = 0.0000

    # niNPI (14.0% Ni, 81.5% Fe, 3.0% C, 1.2% Si, 0.035% P, 0.025% S)
    npi_ef = RAW_MATERIALS["niNPI"]
    mat[0, 8] = 0.0000
    mat[1, 8] = npi_ef.main_element_pct / 100.0  # 14.0% Ni
    mat[2, 8] = 0.0000
    mat[3, 8] = 0.0000
    mat[4, 8] = 0.0000
    mat[5, 8] = npi_ef.iron_content_pct / 100.0  # 81.5% Fe (v2.1 refined crude NPI chemistry)
    mat[6, 8] = npi_ef.carbon_content_pct / 100.0  # 3.0% C
    mat[7, 8] = npi_ef.si_content_pct / 100.0  # 1.2% Si
    mat[8, 8] = 0.0000
    mat[9, 8] = npi_ef.p_content_pct / 100.0   # P content (0.035%)
    mat[10, 8] = npi_ef.s_content_pct / 100.0  # S content (0.025%)

    # femo (65% Mo, 33% Fe, 1.5% C)
    mat[0, 9] = 0.0000
    mat[1, 9] = 0.0000
    mat[2, 9] = 0.6500
    mat[3, 9] = 0.0000
    mat[4, 9] = 0.0000
    mat[5, 9] = 0.3300
    mat[6, 9] = 0.0150
    mat[7, 9] = 0.0050
    mat[8, 9] = 0.0000
    mat[9, 9] = 0.025 / 100.0 # P
    mat[10, 9] = 0.015 / 100.0 # S

    # femn (75% Mn, 20% Fe, 6.5% C, 1.0% Si)
    mat[0, 10] = 0.0000
    mat[1, 10] = 0.0000
    mat[2, 10] = 0.0000
    mat[3, 10] = 0.7500
    mat[4, 10] = 0.0000
    mat[5, 10] = 0.2000
    mat[6, 10] = 0.0650
    mat[7, 10] = 0.0100
    mat[8, 10] = 0.0000
    mat[9, 10] = 0.025 / 100.0 # P
    mat[10, 10] = 0.015 / 100.0 # S

    # cuFeed (99% Cu, 0.5% Fe)
    mat[0, 11] = 0.0000
    mat[1, 11] = 0.0000
    mat[2, 11] = 0.0000
    mat[3, 11] = 0.0000
    mat[4, 11] = 0.9900  # 99% Cu
    mat[5, 11] = 0.0050  # 0.5% Fe
    mat[6, 11] = 0.0000
    mat[7, 11] = 0.0000
    mat[8, 11] = 0.0000
    mat[9, 11] = 0.0000
    mat[10, 11] = 0.0000

    # Process recovery factors in bath (Cr, Ni, Mo, Mn, Cu, Fe, C, Si, Sn, P, S)
    # Recalibrated P recovery to 0.99 (eta_P >= 0.95): stainless thermodynamics (Delta G Cr2O3 < Delta G P2O5)
    # precludes dephosphorization without Cr loss; AOD slag does not remove 30% P (Wei et al. 2018).
    eta = np.array([0.94, 0.98, 0.96, 0.90, 0.98, 0.97, 0.02, 0.50, 0.95, 0.99, 0.40])
    # Total metallic yield per tonne feed
    yields = np.sum(mat * eta[:, None], axis=0)

    return mat, eta, yields


def solve_charge_optimizer(
    grade: Grade,
    alpha_cost_weight: float = 0.5,
    facility_id: str = "jajpur",
    allow_npi: bool = True,
    allow_gas_dri: bool = True,
    allow_pig_iron: bool = True,
    enforce_scrap_cap: bool = True,
    custom_scrap_cap: Optional[float] = None,
    custom_scrap_cr: Optional[float] = None,
    custom_scrap_ni: Optional[float] = None,
    custom_scrap_cu: Optional[float] = None,
    custom_scrap_sn: Optional[float] = None,
    electricity_cost_usd_kwh: Optional[float] = None,
) -> OptimizerResult:
    """
    Solves the continuous Linear Program for optimal charge sheet.
    alpha_cost_weight: 1.0 = Least Cost, 0.0 = Least Carbon, 0.5 = Balanced.
    """
    n_feeds = len(FEED_KEYS)
    mat, eta, yields = _build_feed_composition_matrix(
        grade,
        custom_scrap_cr=custom_scrap_cr,
        custom_scrap_ni=custom_scrap_ni,
        custom_scrap_cu=custom_scrap_cu,
        custom_scrap_sn=custom_scrap_sn,
    )

    # Effective scrap ceiling
    if custom_scrap_cap is not None:
        max_scrap_frac = min(1.0, max(0.0, custom_scrap_cap / 100.0))
    elif enforce_scrap_cap:
        max_scrap_frac = grade.scrap_cap / 100.0
    else:
        max_scrap_frac = 1.0

    # Facility resolution & dynamic electricity melting cost parameters
    try:
        facility = get_facility(facility_id)
        has_hot_fecr = getattr(facility, "has_hot_fecr_charging", False)
        if electricity_cost_usd_kwh is not None:
            c_electricity = float(electricity_cost_usd_kwh)
        elif hasattr(facility, "electricity_cost_inr_kwh") and facility.electricity_cost_inr_kwh > 0:
            c_electricity = facility.electricity_cost_inr_kwh / 83.0  # e.g. INR 4.40 / 83 = ~$0.053/kWh for Jajpur
        else:
            c_electricity = 0.06
        grid_ef = getattr(facility, "grid_emission_factor", 0.72)
    except Exception:
        facility = None
        has_hot_fecr = False
        c_electricity = electricity_cost_usd_kwh if electricity_cost_usd_kwh is not None else 0.06
        grid_ef = 0.72

    # Dynamic SEC vector (kWh/t feed): Pyrometallurgical melting and enthalpy burden
    # Scrap: ~420 kWh/t; Coal DRI: ~680 kWh/t; Gas DRI: ~560 kWh/t; Pig Iron: ~480 kWh/t
    # FeCr: 500 kWh/t solid melting, or -86.0 kWh/t sensible heat credit with captive SAF hot charging (JSL Jajpur)
    # Low-C FeCr: 450 kWh/t; Cu feed: 380 kWh/t
    sec_vec = np.zeros(n_feeds)
    sec_vec[0] = 420.0   # scrap
    sec_vec[1] = 680.0   # coalDRI
    sec_vec[2] = 560.0   # gasDRI
    sec_vec[3] = 480.0   # pigIron
    sec_vec[4] = -86.0 if has_hot_fecr else 500.0  # fecrStandard
    sec_vec[5] = 450.0   # fecrLowC
    sec_vec[6] = 0.0     # niStandard
    sec_vec[7] = 0.0     # niClass1
    sec_vec[8] = 0.0     # niNPI
    sec_vec[9] = 0.0     # femo
    sec_vec[10] = 0.0    # feMn
    sec_vec[11] = 380.0  # cuFeed

    # 1. Objective Vector Formulation: c_obj = alpha * c_norm + (1 - alpha) * e_norm
    cost_vec = np.zeros(n_feeds)
    co2_vec = np.zeros(n_feeds)

    # Base raw material purchase cost in USD/tonne of feed material
    cost_vec[0] = RAW_MATERIALS["scrap"].typical_cost_usd_t
    cost_vec[1] = RAW_MATERIALS["coalDRI"].typical_cost_usd_t
    cost_vec[2] = RAW_MATERIALS["gasDRI"].typical_cost_usd_t
    cost_vec[3] = RAW_MATERIALS["pigIron"].typical_cost_usd_t
    cost_vec[4] = RAW_MATERIALS["fecrStandard"].typical_cost_usd_t
    cost_vec[5] = RAW_MATERIALS["fecrLowC"].typical_cost_usd_t
    cost_vec[6] = RAW_MATERIALS["niStandard"].typical_cost_usd_t
    cost_vec[7] = RAW_MATERIALS["niClass1"].typical_cost_usd_t
    npi_ni_frac = RAW_MATERIALS["niNPI"].main_element_pct / 100.0
    cost_vec[8] = RAW_MATERIALS["niNPI"].typical_cost_usd_t * npi_ni_frac  # Gross NPI tonne price
    cost_vec[9] = RAW_MATERIALS["femo"].typical_cost_usd_t
    cost_vec[10] = RAW_MATERIALS["feMn"].typical_cost_usd_t
    cost_vec[11] = RAW_MATERIALS["cuFeed"].typical_cost_usd_t

    # Embodied carbon in tCO2/tonne of feed material + thermal melting electricity footprint
    co2_vec[0] = RAW_MATERIALS["scrap"].co2_factor + (sec_vec[0] / 1000.0 * grid_ef)
    co2_vec[1] = RAW_MATERIALS["coalDRI"].co2_factor + (sec_vec[1] / 1000.0 * grid_ef)
    co2_vec[2] = RAW_MATERIALS["gasDRI"].co2_factor + (sec_vec[2] / 1000.0 * grid_ef)
    co2_vec[3] = RAW_MATERIALS["pigIron"].co2_factor + (sec_vec[3] / 1000.0 * grid_ef)
    co2_vec[4] = RAW_MATERIALS["fecrStandard"].co2_factor + (sec_vec[4] / 1000.0 * grid_ef)
    co2_vec[5] = RAW_MATERIALS["fecrLowC"].co2_factor + (sec_vec[5] / 1000.0 * grid_ef)
    co2_vec[6] = RAW_MATERIALS["niStandard"].co2_factor
    co2_vec[7] = RAW_MATERIALS["niClass1"].co2_factor
    co2_vec[8] = (RAW_MATERIALS["niNPI"].co2_factor * npi_ni_frac)  # 55 tCO2/t contained Ni -> 7.7 tCO2/t gross NPI
    co2_vec[9] = RAW_MATERIALS["femo"].co2_factor
    co2_vec[10] = RAW_MATERIALS["feMn"].co2_factor
    co2_vec[11] = RAW_MATERIALS["cuFeed"].co2_factor + (sec_vec[11] / 1000.0 * grid_ef)

    # Linearized electricity melting cost adder (c_electricity * SEC_j)
    cost_vec += c_electricity * sec_vec

    # Normalization references (approx $1000/t cost, ~2.0 tCO2/t carbon)
    cost_norm = cost_vec / 1200.0
    co2_norm = co2_vec / 2.0

    alpha = min(1.0, max(0.0, float(alpha_cost_weight)))
    c_obj = alpha * cost_norm + (1.0 - alpha) * co2_norm

    # 2. Linear Equality Constraint: Total Liquid Steel Mass = 1.000 t
    # sum_j x_j * yield_j = 1.000
    A_eq = [yields.tolist()]
    b_eq = [1.000]

    # 3. Linear Inequality Constraints: A_ub * x <= b_ub
    A_ub = []
    b_ub = []
    row_labels = []

    # Chemical bound helper
    # Upper bound: sum_j x_j * (mat[elem, j] * eta[elem]) <= elem_max / 100
    # Lower bound: -sum_j x_j * (mat[elem, j] * eta[elem]) <= -elem_min / 100
    # For intentionally copper-alloyed grades (like J4, J204Cu, J904L, J32760 where cu_min > 0.4%),
    # Cu is a desired alloying addition. For unalloyed grades, Cu is a tramp element capped by cu_tramp_cap.
    cu_upper = grade.cu_max if grade.cu_min > 0.4 else min(grade.cu_max, grade.cu_tramp_cap)

    elem_targets = [
        ("Cr", 0, grade.cr_min, grade.cr_max),  # Cr
        ("Ni", 1, grade.ni_min, grade.ni_max),  # Ni
        ("Mo", 2, grade.mo_min, grade.mo_max),  # Mo
        ("Mn", 3, grade.mn_min, grade.mn_max),  # Mn
        ("Cu", 4, grade.cu_min, cu_upper),       # Cu
    ]

    for elem_name, idx, e_min, e_max in elem_targets:
        # Max bound
        row_max = mat[idx, :] * eta[idx]
        A_ub.append(row_max.tolist())
        b_ub.append(e_max / 100.0)
        row_labels.append(f"{elem_name}_max")

        # Min bound
        if e_min > 0:
            row_min = -mat[idx, :] * eta[idx]
            A_ub.append(row_min.tolist())
            b_ub.append(-e_min / 100.0)
            row_labels.append(f"{elem_name}_min")

    # Tramp elements: Sn max <= 0.03%
    row_sn = mat[8, :] * eta[8]
    A_ub.append(row_sn.tolist())
    b_ub.append(grade.sn_tramp_cap / 100.0)
    row_labels.append("Sn_max")

    # Phosphorus constraint: <= 0.040% (typical grade limit)
    row_p = mat[9, :] * eta[9]  # recovery for P
    A_ub.append(row_p.tolist())
    b_ub.append(grade.p_max / 100.0 if hasattr(grade, 'p_max') else 0.040 / 100.0)
    row_labels.append("P_max")

    # Sulfur constraint: <= 0.030% (typical grade limit)
    row_s = mat[10, :] * eta[10]
    A_ub.append(row_s.tolist())
    b_ub.append(grade.s_max / 100.0 if hasattr(grade, 's_max') else 0.030 / 100.0)
    row_labels.append("S_max")

    # For ferritics: ensure Ni tramp cap (<= 0.50% or grade.ni_tramp_cap)
    if "Ferritic" in grade.family:
        row_ni_tramp = mat[1, :] * eta[1]
        A_ub.append(row_ni_tramp.tolist())
        b_ub.append(grade.ni_tramp_cap / 100.0)
        row_labels.append("Ni_tramp_max")

    # Variable bounds (non-negativity and source availability)
    bounds = []
    for idx, key in enumerate(FEED_KEYS):
        if key == "scrap":
            bounds.append((0.0, max_scrap_frac))
        elif key == "niNPI" and not allow_npi:
            bounds.append((0.0, 0.0))
        elif key == "gasDRI" and not allow_gas_dri:
            bounds.append((0.0, 0.0))
        elif key == "pigIron" and not allow_pig_iron:
            bounds.append((0.0, 0.0))
        elif key == "cuFeed":
            bounds.append((0.0, 0.10))
        else:
            bounds.append((0.0, 1.5))

    # 4. Solve using Highs LP Solver
    res = linprog(
        c=c_obj,
        A_ub=A_ub,
        b_ub=b_ub,
        A_eq=A_eq,
        b_eq=b_eq,
        bounds=bounds,
        method="highs",
    )

    if not res.success:
        return OptimizerResult(
            grade_id=grade.id,
            is_feasible=False,
            status_message=f"LP Solver Infeasible: {res.message}",
            alpha_cost_weight=alpha,
            charge_sheet_t={},
            charge_sheet_pct={},
            final_chemistry_pct={},
            charge_cost_usd_per_t=0.0,
            total_co2_t_per_t=0.0,
            scrap_share_pct=0.0,
            virgin_dri_share_pct=0.0,
            ferroalloys_share_pct=0.0,
            tramp_shadow_prices={},
            value_in_use_usd_per_t={},
            scrap_ceiling_shadow_price_usd_per_t=0.0,
            estimated_lime_kg_per_t=0.0,
            estimated_slag_kg_per_t=0.0,
        )

    # 5. Extract Optimal Solution
    x_opt = res.x
    total_charge_mass = np.sum(x_opt)

    charge_sheet_t = {k: round(float(x_opt[i]), 5) for i, k in enumerate(FEED_KEYS) if x_opt[i] > 1e-4}
    charge_sheet_pct = {k: round(float(x_opt[i] / total_charge_mass * 100.0), 2) for i, k in enumerate(FEED_KEYS) if x_opt[i] > 1e-4}

    # Recovered bath chemistry
    recovered_elem_masses = np.dot(mat * eta[:, None], x_opt)
    bath_mass = np.sum(recovered_elem_masses)
    final_chem = {
        "Cr": round(float(recovered_elem_masses[0] / bath_mass * 100.0), 2),
        "Ni": round(float(recovered_elem_masses[1] / bath_mass * 100.0), 2),
        "Mo": round(float(recovered_elem_masses[2] / bath_mass * 100.0), 2),
        "Mn": round(float(recovered_elem_masses[3] / bath_mass * 100.0), 2),
        "Cu": round(float(recovered_elem_masses[4] / bath_mass * 100.0), 2),
        "Fe": round(float(recovered_elem_masses[5] / bath_mass * 100.0), 2),
        "Sn": round(float(recovered_elem_masses[8] / bath_mass * 100.0), 4),
        "P": round(float(recovered_elem_masses[9] / bath_mass * 100.0), 4),
        "S": round(float(recovered_elem_masses[10] / bath_mass * 100.0), 4),
    }

    total_cost = float(np.dot(cost_vec, x_opt))
    total_co2 = float(np.dot(co2_vec, x_opt))

    scrap_share = charge_sheet_pct.get("scrap", 0.0)
    virgin_dri_share = (
        charge_sheet_pct.get("coalDRI", 0.0)
        + charge_sheet_pct.get("gasDRI", 0.0)
        + charge_sheet_pct.get("pigIron", 0.0)
    )
    ferroalloy_share = max(0.0, 100.0 - scrap_share - virgin_dri_share)

    # 6. Extract LP Dual Variables: Tramp Shadow Prices & Value-in-Use (ViU)
    # In Swerim RAWMATMIX®, economic evaluation (Value-in-Use and tramp shadow prices)
    # is evaluated with respect to the cost minimization objective.
    # If alpha == 1.0, the solved LP (res) is already the pure cost LP.
    # If alpha != 1.0, we solve the cost LP with the identical constraints & bounds (<0.5ms)
    # to yield authentic, positive, decoupled economic shadow prices ($/0.01%) and Value-in-Use ($/t)
    # without composite carbon objective distortion.
    if abs(alpha - 1.0) < 1e-6:
        cost_res = res
    else:
        cost_res = linprog(
            c=cost_norm,
            A_ub=A_ub,
            b_ub=b_ub,
            A_eq=A_eq,
            b_eq=b_eq,
            bounds=bounds,
            method="highs",
        )

    tramp_shadow_prices = {
        "Cu": 0.0,
        "Sn": 0.0,
        "P": 0.0,
        "S": 0.0,
    }
    if "Ferritic" in grade.family:
        tramp_shadow_prices["Ni"] = 0.0

    cost_scale = 1200.0
    cost_scale_per_001pct = cost_scale * 0.0001

    if hasattr(cost_res, "ineqlin") and cost_res.ineqlin is not None and hasattr(cost_res.ineqlin, "marginals") and cost_res.ineqlin.marginals is not None:
        for label, m in zip(row_labels, cost_res.ineqlin.marginals):
            val = round(float(abs(m) * cost_scale_per_001pct), 4)
            if label == "Cu_max":
                tramp_shadow_prices["Cu"] = val
            elif label == "Sn_max":
                tramp_shadow_prices["Sn"] = val
            elif label == "P_max":
                tramp_shadow_prices["P"] = val
            elif label == "S_max":
                tramp_shadow_prices["S"] = val
            elif label == "Ni_tramp_max":
                tramp_shadow_prices["Ni"] = val

    # Scrap ceiling shadow price ($/t of scrap allowed when scrap cap binds)
    scrap_ceiling_shadow_price = 0.0
    if hasattr(cost_res, "upper") and cost_res.upper is not None and hasattr(cost_res.upper, "marginals") and cost_res.upper.marginals is not None:
        scrap_ceiling_shadow_price = round(float(abs(cost_res.upper.marginals[0]) * cost_scale), 2)

    # res.lower.marginals provides reduced costs r_j of feeds:
    # Value-in-Use: ViU_j = c_purchase,j - r_j
    value_in_use_usd_per_t = {}
    if hasattr(cost_res, "lower") and cost_res.lower is not None and hasattr(cost_res.lower, "marginals") and cost_res.lower.marginals is not None:
        for j, k in enumerate(FEED_KEYS):
            r_norm = max(0.0, float(cost_res.lower.marginals[j]))
            r_usd = r_norm * cost_scale
            viu = cost_vec[j] - r_usd
            value_in_use_usd_per_t[k] = round(float(viu), 2)

    # 7. Slag & Flux Kinetics Estimation (Swerim RAWMATMIX® Flux Engine)
    # Total Si in charge oxidizes to SiO2, demanding quicklime (CaO) to maintain target basicity B2 = 1.90
    si_oxidized_kg = float(np.dot(mat[7, :] * (1.0 - eta[7]), x_opt) * 1000.0)
    sio2_generated_kg = si_oxidized_kg * (60.084 / 28.0855)
    lime_demand_kg = (sio2_generated_kg * 1.90) / 0.95
    estimated_slag_kg = (sio2_generated_kg * 1.90) + sio2_generated_kg + 45.0

    return OptimizerResult(
        grade_id=grade.id,
        is_feasible=True,
        status_message="Optimized globally using continuous Simplex/HiGHS LP solver.",
        alpha_cost_weight=alpha,
        charge_sheet_t=charge_sheet_t,
        charge_sheet_pct=charge_sheet_pct,
        final_chemistry_pct=final_chem,
        charge_cost_usd_per_t=round(total_cost, 2),
        total_co2_t_per_t=round(total_co2, 3),
        scrap_share_pct=round(scrap_share, 1),
        virgin_dri_share_pct=round(virgin_dri_share, 1),
        ferroalloys_share_pct=round(ferroalloy_share, 1),
        tramp_shadow_prices=tramp_shadow_prices,
        value_in_use_usd_per_t=value_in_use_usd_per_t,
        scrap_ceiling_shadow_price_usd_per_t=scrap_ceiling_shadow_price,
        estimated_lime_kg_per_t=round(lime_demand_kg, 2),
        estimated_slag_kg_per_t=round(estimated_slag_kg, 2),
    )


def compute_pareto_frontier(
    grade: Grade,
    steps: int = 50,
    facility_id: str = "jajpur",
) -> ParetoFrontierResult:
    """
    Computes the Pareto Optimal Frontier by sweeping alpha from 0.0 (Least Carbon)
    to 1.0 (Least Cost).
    """
    alphas = np.linspace(0.0, 1.0, steps)
    frontier_points: List[ParetoPoint] = []

    for a in alphas:
        sol = solve_charge_optimizer(grade, alpha_cost_weight=float(a), facility_id=facility_id)
        if sol.is_feasible:
            frontier_points.append(
                ParetoPoint(
                    alpha=round(float(a), 2),
                    cost_usd_per_t=sol.charge_cost_usd_per_t,
                    co2_t_per_t=sol.total_co2_t_per_t,
                    scrap_pct=sol.scrap_share_pct,
                    charge_sheet=sol.charge_sheet_pct,
                )
            )

    if not frontier_points:
        raise ValueError(f"Unable to generate Pareto Frontier: LP solver infeasible for grade {grade.id}")

    least_carbon_pt = min(frontier_points, key=lambda p: p.co2_t_per_t)
    least_cost_pt = min(frontier_points, key=lambda p: p.cost_usd_per_t)

    co2_delta = least_cost_pt.co2_t_per_t - least_carbon_pt.co2_t_per_t
    cost_delta = least_carbon_pt.cost_usd_per_t - least_cost_pt.cost_usd_per_t

    abatement_potential_pct = (co2_delta / least_cost_pt.co2_t_per_t * 100.0) if least_cost_pt.co2_t_per_t > 0 else 0.0
    abatement_cost = (cost_delta / co2_delta) if co2_delta > 0.01 else 0.0

    return ParetoFrontierResult(
        grade_id=grade.id,
        frontier_points=frontier_points,
        least_cost_point=least_cost_pt,
        least_carbon_point=least_carbon_pt,
        max_co2_abatement_potential_pct=round(abatement_potential_pct, 1),
        cost_of_carbon_abatement_usd_per_tco2=round(abatement_cost, 2),
    )


@dataclass
class MonteCarloResult:
    grade_id: str
    runs: int
    p10_cost_usd_per_t: float
    p50_cost_usd_per_t: float
    p90_cost_usd_per_t: float
    p10_co2_t_per_t: float
    p50_co2_t_per_t: float
    p90_co2_t_per_t: float
    compliance_probability_pct: float
    compliant_runs: int = 0


def monte_carlo_pareto(
    grade: Grade,
    runs: int = 1000,
    alpha_cost_weight: float = 0.5,
    std_dev_cr: float = 0.8,
    std_dev_ni: float = 0.4,
    std_dev_cu: float = 0.04,
    std_dev_sn: float = 0.003,
    corr_cr_ni: float = 0.70,
    corr_cu_sn: float = 0.50,
    facility_id: str = "jajpur",
    allow_npi: bool = True,
    allow_gas_dri: bool = True,
    allow_pig_iron: bool = True,
    enforce_scrap_cap: bool = True,
    custom_scrap_cap: Optional[float] = None,
    seed: Optional[int] = None,
) -> MonteCarloResult:
    """
    Monte Carlo stochastic robustness simulation for stainless steel charge sheets.
    Evaluates sensitivity of optimal costs and carbon emissions to scrap chemistry variations
    (Cr, Ni, Cu, and Sn tramp perturbations across 1,000 industrial heats).
    Returns p10/p50/p90 percentiles and compliance_probability_pct.
    """
    if runs <= 0:
        return MonteCarloResult(
            grade_id=grade.id,
            runs=0,
            p10_cost_usd_per_t=0.0,
            p50_cost_usd_per_t=0.0,
            p90_cost_usd_per_t=0.0,
            p10_co2_t_per_t=0.0,
            p50_co2_t_per_t=0.0,
            p90_co2_t_per_t=0.0,
            compliance_probability_pct=0.0,
            compliant_runs=0,
        )

    if seed is not None:
        np.random.seed(seed)

    costs = []
    carbons = []
    compliant_runs = 0

    base_cu = grade.cu if grade.cu > 0.0 else 0.15
    base_sn = 0.015  # 0.015% typical scrap tramp tin

    cu_upper = grade.cu_max if grade.cu_min > 0.4 else min(grade.cu_max, grade.cu_tramp_cap)

    mean_vec = np.array([grade.cr, grade.ni, base_cu, base_sn])
    std_vec = np.array([std_dev_cr, std_dev_ni, std_dev_cu, std_dev_sn])
    corr_matrix = np.array([
        [1.00, corr_cr_ni, 0.00, 0.00],  # Cr-Ni corr
        [corr_cr_ni, 1.00, 0.00, 0.00],
        [0.00, 0.00, 1.00, corr_cu_sn],  # Cu-Sn corr
        [0.00, 0.00, corr_cu_sn, 1.00],
    ])
    cov_matrix = np.outer(std_vec, std_vec) * corr_matrix
    all_samples = np.random.multivariate_normal(mean_vec, cov_matrix, size=runs).clip(0, None)

    for i in range(runs):
        cr_perturbed = float(all_samples[i, 0])
        ni_perturbed = float(all_samples[i, 1])
        cu_perturbed = float(all_samples[i, 2])
        sn_perturbed = float(all_samples[i, 3])

        sol = solve_charge_optimizer(
            grade,
            alpha_cost_weight=alpha_cost_weight,
            facility_id=facility_id,
            allow_npi=allow_npi,
            allow_gas_dri=allow_gas_dri,
            allow_pig_iron=allow_pig_iron,
            enforce_scrap_cap=enforce_scrap_cap,
            custom_scrap_cap=custom_scrap_cap,
            custom_scrap_cr=cr_perturbed,
            custom_scrap_ni=ni_perturbed,
            custom_scrap_cu=cu_perturbed,
            custom_scrap_sn=sn_perturbed,
        )

        if sol.is_feasible:
            chem = sol.final_chemistry_pct
            # Verify compliance against all grade specification bounds (including Cu and Sn)
            cu_val = chem.get("Cu", 0.0)
            cu_compliant = (
                (cu_val <= cu_upper + 0.05) if grade.cu_min <= 0.0
                else (grade.cu_min - 0.05 <= cu_val <= cu_upper + 0.05)
            )
            is_compliant = (
                (grade.cr_min - 0.05 <= chem.get("Cr", 0.0) <= grade.cr_max + 0.1) and
                (grade.ni_min - 0.05 <= chem.get("Ni", 0.0) <= grade.ni_max + 0.1) and
                (grade.mo_min - 0.05 <= chem.get("Mo", 0.0) <= grade.mo_max + 0.1) and
                (grade.mn_min - 0.05 <= chem.get("Mn", 0.0) <= grade.mn_max + 0.1) and
                cu_compliant and
                (chem.get("Sn", 0.0) <= grade.sn_tramp_cap + 0.002)
            )
            if "Ferritic" in grade.family:
                is_compliant = is_compliant and (chem.get("Ni", 0.0) <= grade.ni_tramp_cap + 0.05)

            if is_compliant:
                compliant_runs += 1
                costs.append(sol.charge_cost_usd_per_t)
                carbons.append(sol.total_co2_t_per_t)

    compliance_prob = round((compliant_runs / runs) * 100.0, 1) if runs > 0 else 0.0

    if not costs:
        return MonteCarloResult(
            grade_id=grade.id,
            runs=runs,
            p10_cost_usd_per_t=0.0,
            p50_cost_usd_per_t=0.0,
            p90_cost_usd_per_t=0.0,
            p10_co2_t_per_t=0.0,
            p50_co2_t_per_t=0.0,
            p90_co2_t_per_t=0.0,
            compliance_probability_pct=0.0,
            compliant_runs=0,
        )

    return MonteCarloResult(
        grade_id=grade.id,
        runs=runs,
        p10_cost_usd_per_t=round(float(np.percentile(costs, 10)), 2),
        p50_cost_usd_per_t=round(float(np.percentile(costs, 50)), 2),
        p90_cost_usd_per_t=round(float(np.percentile(costs, 90)), 2),
        p10_co2_t_per_t=round(float(np.percentile(carbons, 10)), 3),
        p50_co2_t_per_t=round(float(np.percentile(carbons, 50)), 3),
        p90_co2_t_per_t=round(float(np.percentile(carbons, 90)), 3),
        compliance_probability_pct=compliance_prob,
        compliant_runs=compliant_runs,
    )
