"""
AOD Slag Reduction and Chromium Recovery Kinetics Engine.
Models the silicon reduction stoichiometry of chromium oxide:
    Cr2O3 + (3/2)Si -> 2Cr + (3/2)SiO2
Quantifies:
1. Ferrosilicon (FeSi 75% Si) demand for standard (92%) vs optimized (96%) Cr recovery.
2. Slag basicity fluxing (burnt lime CaO) to maintain B2 = CaO / SiO2 >= 1.8.
3. Slag mass generation (kg/t) and Cr2O3 loss in slag.
"""

from dataclasses import dataclass
from typing import Dict
from jsl_carbon_engine.core.grades import Grade


# Stoichiometric constants
# Cr: 51.996 g/mol, Si: 28.0855 g/mol, O: 16.0 g/mol, SiO2: 60.084 g/mol
# 1 mole Cr2O3 (151.99 g) + 1.5 moles Si (42.13 g) -> 2 moles Cr (103.99 g) + 1.5 moles SiO2 (90.13 g)
SI_PER_CR_REDUCED = 42.128 / 103.992    # 0.4051 kg Si / kg Cr reduced
SIO2_PER_CR_REDUCED = 90.126 / 103.992  # 0.8667 kg SiO2 / kg Cr reduced
SI_UTILIZATION_EFFICIENCY = 0.85        # 85% of silicon participates in Cr reduction (balance oxidizes with dissolved O2)
FESI_SI_CONTENT = 0.75                  # 75% Si in FeSi 75 alloy
LIME_CAO_CONTENT = 0.95                 # 95% CaO in calcined quicklime
TARGET_SLAG_BASICITY_B2 = 1.90          # Target B2 = CaO / SiO2 ratio for stable AOD slag


@dataclass
class SlagKineticsResult:
    recovery_mode: str
    target_cr_recovery_pct: float
    total_cr_charged_kg: float
    cr_recovered_to_metal_kg: float
    cr_lost_to_slag_kg: float
    fesi_demand_kg_t: float
    lime_demand_kg_t: float
    sio2_generated_kg_t: float
    total_slag_generated_kg_t: float
    cr2o3_in_discard_slag_pct: float
    fesi_demand_t: float
    lime_demand_t: float


def compute_slag_kinetics(
    grade: Grade,
    recovery_mode: str = "standard",
    target_basicity_b2: float = TARGET_SLAG_BASICITY_B2,
) -> SlagKineticsResult:
    """
    Calculates FeSi demand, lime consumption, and slag generation for AOD reduction.

    Parameters:
    -----------
    grade: Target stainless grade
    recovery_mode: 'standard' (92% Cr recovery) or 'optimised' (96% Cr recovery)
    target_basicity_b2: Desired binary basicity ratio (CaO / SiO2)
    """
    cr_target_wt_pct = grade.cr
    total_cr_charged_kg = cr_target_wt_pct * 10.0  # kg Cr per 1000 kg steel

    if recovery_mode == "optimised":
        cr_recovery_pct = 96.0
        # In optimized slag reduction, a deeper slag wash is performed
        initial_cr_in_slag_pct = 12.0  # 12% Cr was oxidized during decarburization
    else:
        cr_recovery_pct = 92.0
        initial_cr_in_slag_pct = 10.0  # 10% Cr oxidized

    # Amount of Cr oxidized into slag prior to reduction
    cr_oxidized_kg = total_cr_charged_kg * (initial_cr_in_slag_pct / 100.0)

    # Net Cr recovered back into metal by silicon reduction
    cr_recovery_fraction = cr_recovery_pct / 100.0
    cr_recovered_kg = total_cr_charged_kg * cr_recovery_fraction
    cr_lost_to_slag_kg = max(0.0, total_cr_charged_kg - cr_recovered_kg)

    # Cr reduced from slag back to metal
    cr_reduced_from_slag_kg = max(0.0, cr_oxidized_kg - cr_lost_to_slag_kg)

    # Stoichiometric silicon requirement
    stoich_si_kg = cr_reduced_from_slag_kg * SI_PER_CR_REDUCED
    actual_si_kg = stoich_si_kg / SI_UTILIZATION_EFFICIENCY if SI_UTILIZATION_EFFICIENCY > 0 else stoich_si_kg

    # FeSi 75 demand
    fesi_demand_kg = actual_si_kg / FESI_SI_CONTENT if FESI_SI_CONTENT > 0 else 0.0

    # Base base additions for deoxidation: minimum 8 kg FeSi/t for dissolved oxygen kill
    fesi_demand_kg = max(8.0, fesi_demand_kg)

    # SiO2 generated from Si oxidation
    sio2_generated_kg = (fesi_demand_kg * FESI_SI_CONTENT) * (60.084 / 28.0855)

    # Lime flux required to maintain basicity B2 = CaO / SiO2
    cao_required_kg = target_basicity_b2 * sio2_generated_kg
    lime_demand_kg = cao_required_kg / LIME_CAO_CONTENT

    # Slag mass estimate (CaO + SiO2 + Al2O3 + MgO + Cr2O3 + EAF carryover)
    # Cr2O3 in slag = Cr lost * (151.992 / 103.992)
    cr2o3_in_slag_kg = cr_lost_to_slag_kg * (151.992 / 103.992)
    refractory_erosion_mgo_kg = 8.0  # typical MgO wear from refractory lining
    al2o3_gangue_kg = 5.0
    eaf_carryover_slag_kg = 45.0     # Industrial EAF tapping carryover slag (FeO, MnO, CaF2, CaO)

    total_slag_kg = cao_required_kg + sio2_generated_kg + cr2o3_in_slag_kg + refractory_erosion_mgo_kg + al2o3_gangue_kg + eaf_carryover_slag_kg
    cr2o3_pct = (cr2o3_in_slag_kg / total_slag_kg * 100.0) if total_slag_kg > 0 else 0.0

    return SlagKineticsResult(
        recovery_mode=recovery_mode,
        target_cr_recovery_pct=cr_recovery_pct,
        total_cr_charged_kg=round(total_cr_charged_kg, 2),
        cr_recovered_to_metal_kg=round(cr_recovered_kg, 2),
        cr_lost_to_slag_kg=round(cr_lost_to_slag_kg, 2),
        fesi_demand_kg_t=round(fesi_demand_kg, 2),
        lime_demand_kg_t=round(lime_demand_kg, 2),
        sio2_generated_kg_t=round(sio2_generated_kg, 2),
        total_slag_generated_kg_t=round(total_slag_kg, 2),
        cr2o3_in_discard_slag_pct=round(cr2o3_pct, 2),
        fesi_demand_t=round(fesi_demand_kg / 1000.0, 5),
        lime_demand_t=round(lime_demand_kg / 1000.0, 5),
    )
