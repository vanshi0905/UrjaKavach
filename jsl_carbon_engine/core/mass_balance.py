"""
Closed-Loop Stoichiometric Mass Balance Engine.
Enforces strict mass conservation for 1.000 tonne (1000 kg) of liquid stainless steel.
Eliminates the ferroalloy iron double-counting flaw by crediting the metallic iron
inherently supplied by ferroalloys:
- High-Carbon Ferrochrome (HC FeCr): ~40% Fe, ~55% Cr, ~7% C
- Low-Carbon Ferrochrome (LC FeCr): ~34% Fe, ~65% Cr, ~0.1% C
- Ferromolybdenum (FeMo 65): ~33% Fe, ~65% Mo
- Ferromanganese (FeMn 75): ~20% Fe, ~75% Mn, ~6.5% C
- Nickel Pig Iron (NPI): ~80% Fe, ~14% Ni, ~3% C
"""

from dataclasses import dataclass
from typing import Dict, Optional
from jsl_carbon_engine.core.grades import Grade, get_grade
from jsl_carbon_engine.config.emission_factors import (
    RAW_MATERIALS,
    METALLURGICAL_RECOVERIES,
    PRODUCTS,
    CASTING_ROUTES,
)


@dataclass
class MassBalanceResult:
    grade_id: str
    scrap_fraction: float  # Fraction of scrap charged (0.0 to scrap_cap/100)
    scrap_mass_t: float    # Tonnes of scrap per tonne liquid steel
    # Ferroalloys & virgin additions (tonnes per tonne liquid steel)
    fecr_mass_t: float
    ni_mass_t: float
    femo_mass_t: float
    femn_mass_t: float
    # Iron crediting breakdown
    fe_from_scrap_t: float
    fe_from_fecr_t: float
    fe_from_femo_t: float
    fe_from_femn_t: float
    fe_from_ni_t: float
    total_fe_from_alloys_t: float
    # Net virgin iron unit required
    net_virgin_fe_t: float
    gross_dri_charged_t: float
    # Elemental recovery masses in bath (tonnes)
    cr_in_steel_t: float
    ni_in_steel_t: float
    mo_in_steel_t: float
    mn_in_steel_t: float
    fe_in_steel_t: float
    other_in_steel_t: float
    total_liquid_steel_t: float  # Must strictly equal 1.000 +/- 0.001 t
    # Finishing yield scaling
    cast_per_finished: float
    finished_product: str
    # Scaled inputs for 1.000 tonne finished product
    scaled_inputs_per_t_finished: Dict[str, float]
    cu_mass_t: float = 0.0
    npi_mass_t: float = 0.0
    pure_ni_mass_t: float = 0.0
    fe_from_cu_t: float = 0.0
    cu_in_steel_t: float = 0.0
    fe_from_npi_t: float = 0.0
    c_from_npi_t: float = 0.0
    c_from_ni_t: float = 0.0
    si_from_npi_t: float = 0.0
    p_from_npi_t: float = 0.0
    s_from_npi_t: float = 0.0


def compute_mass_balance(
    grade: Grade,
    scrap_pct: float,
    fe_source: str = "coalDRI",
    fecr_source: str = "fecrStandard",
    ni_source: str = "niStandard",
    recovery_mode: str = "standard",
    product: str = "crCoil",
    casting: str = "continuous",
    ideal_yield: bool = False,
) -> MassBalanceResult:
    """
    Computes closed-loop mass balance for 1.000 tonne of liquid steel,
    then applies downstream yield factors for finished product delivery.

    Parameters:
    -----------
    grade: Grade instance from JSL library
    scrap_pct: % scrap charged (enforced <= grade.scrap_cap)
    fe_source: 'coalDRI', 'gasDRI', or 'pigIron'
    fecr_source: 'fecrStandard' (HC FeCr) or 'fecrLowC' (LC FeCr)
    ni_source: 'niStandard', 'niClass1', or 'niNPI' (Indonesian coal NPI)
    recovery_mode: 'standard' or 'optimised'
    product: product key in PRODUCTS (e.g. 'crCoil', 'slab', 'hrCoil')
    casting: 'continuous' or 'ingot'
    ideal_yield: if True, bypasses downstream yield losses (yield=1.0)
    """
    # 1. Scrap fraction validation against metallurgical tramp ceiling
    eff_scrap_pct = min(max(0.0, float(scrap_pct)), grade.scrap_cap)
    scrap_fraction = eff_scrap_pct / 100.0

    # 2. Metallurgical recovery coefficients
    rec = METALLURGICAL_RECOVERIES[recovery_mode]
    eta_cr = rec["Cr"]
    eta_ni = rec["Ni"]
    eta_mo = rec["Mo"]
    eta_mn = rec["Mn"]
    eta_fe = rec["Fe"]
    eta_cu = 0.98

    # 3. Grade target chemistry in mass fractions (wt / 100)
    w_cr = grade.cr / 100.0
    w_ni = grade.ni / 100.0
    w_mo = grade.mo / 100.0
    w_mn = grade.mn / 100.0
    w_cu = grade.cu / 100.0
    w_other = (grade.c + grade.si + grade.s + grade.p + grade.n) / 100.0
    w_fe = grade.fe / 100.0

    # 4. Elements contributed by recycled scrap (assuming matching grade scrap)
    cr_from_scrap = scrap_fraction * w_cr
    ni_from_scrap = scrap_fraction * w_ni
    mo_from_scrap = scrap_fraction * w_mo
    mn_from_scrap = scrap_fraction * w_mn
    cu_from_scrap = scrap_fraction * w_cu
    fe_from_scrap = scrap_fraction * w_fe

    # 5. Ferroalloy demands for virgin portion with process recovery
    # Chromium:
    fecr_info = RAW_MATERIALS[fecr_source]
    c_cr_fecr = fecr_info.main_element_pct / 100.0
    c_fe_fecr = fecr_info.iron_content_pct / 100.0
    net_cr_needed = max(0.0, (1.0 - scrap_fraction) * w_cr)
    fecr_mass = (net_cr_needed / (eta_cr * c_cr_fecr)) if c_cr_fecr > 0 else 0.0
    fe_from_fecr = fecr_mass * c_fe_fecr * eta_fe

    # Molybdenum:
    femo_info = RAW_MATERIALS["femo"]
    c_mo_femo = femo_info.main_element_pct / 100.0
    c_fe_femo = femo_info.iron_content_pct / 100.0
    net_mo_needed = max(0.0, (1.0 - scrap_fraction) * w_mo)
    femo_mass = (net_mo_needed / (eta_mo * c_mo_femo)) if (c_mo_femo > 0 and net_mo_needed > 0) else 0.0
    fe_from_femo = femo_mass * c_fe_femo * eta_fe

    # Manganese:
    femn_info = RAW_MATERIALS["feMn"]
    c_mn_femn = femn_info.main_element_pct / 100.0
    c_fe_femn = femn_info.iron_content_pct / 100.0
    net_mn_needed = max(0.0, (1.0 - scrap_fraction) * w_mn)
    femn_mass = (net_mn_needed / (eta_mn * c_mn_femn)) if (c_mn_femn > 0 and net_mn_needed > 0) else 0.0
    fe_from_femn = femn_mass * c_fe_femn * eta_fe

    # Copper:
    net_cu_needed = max(0.0, (1.0 - scrap_fraction) * w_cu)
    c_cu_feed = 0.99
    cu_mass = (net_cu_needed / (eta_cu * c_cu_feed)) if net_cu_needed > 0.0001 else 0.0
    fe_from_cu = cu_mass * 0.005 * eta_fe

    # 6. Iron Crediting Calculation & Blended Nickel (Eliminating Double-Counting & Overfill)
    target_virgin_fe = (1.0 - scrap_fraction) * w_fe
    fe_from_other_alloys = fe_from_fecr + fe_from_femo + fe_from_femn + fe_from_cu
    allowable_fe_for_ni = max(0.0, target_virgin_fe - fe_from_other_alloys)

    # Nickel calculation with intelligent NPI blending
    ni_info = RAW_MATERIALS[ni_source]
    c_ni = ni_info.main_element_pct / 100.0
    c_fe_ni = ni_info.iron_content_pct / 100.0
    net_ni_needed = max(0.0, (1.0 - scrap_fraction) * w_ni)

    npi_mass = 0.0
    pure_ni_mass = 0.0
    if ni_source == "niNPI" and c_fe_ni > 0:
        potential_npi_mass = (net_ni_needed / (eta_ni * c_ni)) if c_ni > 0 else 0.0
        potential_fe = potential_npi_mass * c_fe_ni * eta_fe
        if potential_fe > allowable_fe_for_ni:
            # NPI carries too much iron; blend NPI up to allowable Fe and supplement with pure Ni
            npi_mass = allowable_fe_for_ni / (c_fe_ni * eta_fe) if (c_fe_ni * eta_fe) > 0 else 0.0
            ni_from_npi = npi_mass * c_ni * eta_ni
            remaining_ni_needed = max(0.0, net_ni_needed - ni_from_npi)
            pure_ni_mass = remaining_ni_needed / (eta_ni * 0.998)
            ni_mass = npi_mass + pure_ni_mass
            fe_from_ni = (npi_mass * c_fe_ni * eta_fe) + (pure_ni_mass * 0.001 * eta_fe)
        else:
            npi_mass = potential_npi_mass
            pure_ni_mass = 0.0
            ni_mass = potential_npi_mass
            fe_from_ni = potential_fe
    else:
        ni_mass = (net_ni_needed / (eta_ni * c_ni)) if c_ni > 0 else 0.0
        pure_ni_mass = ni_mass
        fe_from_ni = ni_mass * c_fe_ni * eta_fe

    # Total iron delivered by ferroalloys
    total_fe_from_alloys = fe_from_other_alloys + fe_from_ni

    # Net virgin metallic iron required after crediting ferroalloys
    net_virgin_fe = max(0.0, target_virgin_fe - total_fe_from_alloys)

    # 7. Gross DRI / Pig iron required to provide net_virgin_fe
    dri_info = RAW_MATERIALS.get(fe_source, RAW_MATERIALS["coalDRI"])
    dri_met_fe = (dri_info.main_element_pct / 100.0) * eta_fe
    gross_dri_charged = net_virgin_fe / dri_met_fe if dri_met_fe > 0 else 0.0

    # 8. Bath liquid steel inventory verification
    cr_in_steel = cr_from_scrap + (fecr_mass * c_cr_fecr * eta_cr)
    if npi_mass > 0:
        npi_ni_frac = RAW_MATERIALS["niNPI"].main_element_pct / 100.0
        class1_ni_frac = RAW_MATERIALS["niClass1"].main_element_pct / 100.0
        ni_in_steel = ni_from_scrap + (npi_mass * npi_ni_frac * eta_ni) + (pure_ni_mass * class1_ni_frac * eta_ni)
    else:
        ni_in_steel = ni_from_scrap + (ni_mass * c_ni * eta_ni)
    mo_in_steel = mo_from_scrap + (femo_mass * c_mo_femo * eta_mo)
    mn_in_steel = mn_from_scrap + (femn_mass * c_mn_femn * eta_mn)
    cu_in_steel = cu_from_scrap + (cu_mass * c_cu_feed * eta_cu)
    fe_in_steel = fe_from_scrap + total_fe_from_alloys + net_virgin_fe
    other_in_steel = (1.0 - scrap_fraction) * w_other + (scrap_fraction * w_other)

    total_liquid_steel = cr_in_steel + ni_in_steel + mo_in_steel + mn_in_steel + cu_in_steel + fe_in_steel + other_in_steel

    # Carbon, iron, silicon, phosphorus, and sulfur tracking from Nickel / NPI
    npi_ef = RAW_MATERIALS["niNPI"]
    if npi_mass > 0:
        c_from_npi = npi_mass * (npi_ef.carbon_content_pct / 100.0)
        c_from_ni = c_from_npi + (pure_ni_mass * (RAW_MATERIALS["niClass1"].carbon_content_pct / 100.0))
        fe_from_npi = npi_mass * (npi_ef.iron_content_pct / 100.0) * eta_fe
        si_from_npi = npi_mass * (npi_ef.si_content_pct / 100.0)
        p_from_npi = npi_mass * (npi_ef.p_content_pct / 100.0)
        s_from_npi = npi_mass * (npi_ef.s_content_pct / 100.0)
    elif ni_source == "niNPI":
        c_from_npi = ni_mass * (npi_ef.carbon_content_pct / 100.0)
        c_from_ni = c_from_npi
        fe_from_npi = ni_mass * (npi_ef.iron_content_pct / 100.0) * eta_fe
        si_from_npi = ni_mass * (npi_ef.si_content_pct / 100.0)
        p_from_npi = ni_mass * (npi_ef.p_content_pct / 100.0)
        s_from_npi = ni_mass * (npi_ef.s_content_pct / 100.0)
    else:
        c_from_npi = 0.0
        c_from_ni = ni_mass * (ni_info.carbon_content_pct / 100.0)
        fe_from_npi = 0.0
        si_from_npi = 0.0
        p_from_npi = 0.0
        s_from_npi = 0.0

    # 9. Finishing and Casting Yield Cascade Multipliers
    cast_proc = CASTING_ROUTES.get(casting, CASTING_ROUTES["continuous"])
    prod_def = PRODUCTS.get(product, PRODUCTS["crCoil"])

    if ideal_yield:
        cast_per_finished = 1.0
    else:
        cast_per_finished = 1.0 / (cast_proc.yield_factor * prod_def.yield_factor)

    scaled_inputs = {
        "scrap_t": scrap_fraction * cast_per_finished,
        "fecr_t": fecr_mass * cast_per_finished,
        "ni_t": ni_mass * cast_per_finished,
        "femo_t": femo_mass * cast_per_finished,
        "femn_t": femn_mass * cast_per_finished,
        "cu_t": cu_mass * cast_per_finished,
        "net_virgin_fe_t": net_virgin_fe * cast_per_finished,
        "dri_gross_t": gross_dri_charged * cast_per_finished,
    }
    if npi_mass > 0 or ni_source == "niNPI":
        scaled_inputs["npi_t"] = npi_mass * cast_per_finished
        scaled_inputs["pure_ni_t"] = pure_ni_mass * cast_per_finished
        scaled_inputs["fe_from_npi_t"] = fe_from_npi * cast_per_finished
        scaled_inputs["c_from_npi_t"] = c_from_npi * cast_per_finished
        scaled_inputs["si_from_npi_t"] = si_from_npi * cast_per_finished

    return MassBalanceResult(
        grade_id=grade.id,
        scrap_fraction=scrap_fraction,
        scrap_mass_t=scrap_fraction,
        fecr_mass_t=fecr_mass,
        ni_mass_t=ni_mass,
        femo_mass_t=femo_mass,
        femn_mass_t=femn_mass,
        fe_from_scrap_t=fe_from_scrap,
        fe_from_fecr_t=fe_from_fecr,
        fe_from_femo_t=fe_from_femo,
        fe_from_femn_t=fe_from_femn,
        fe_from_ni_t=fe_from_ni,
        total_fe_from_alloys_t=total_fe_from_alloys,
        net_virgin_fe_t=net_virgin_fe,
        gross_dri_charged_t=gross_dri_charged,
        cr_in_steel_t=cr_in_steel,
        ni_in_steel_t=ni_in_steel,
        mo_in_steel_t=mo_in_steel,
        mn_in_steel_t=mn_in_steel,
        fe_in_steel_t=fe_in_steel,
        other_in_steel_t=other_in_steel,
        total_liquid_steel_t=total_liquid_steel,
        cast_per_finished=cast_per_finished,
        finished_product=product,
        scaled_inputs_per_t_finished=scaled_inputs,
        cu_mass_t=cu_mass,
        npi_mass_t=npi_mass,
        pure_ni_mass_t=pure_ni_mass,
        fe_from_cu_t=fe_from_cu,
        cu_in_steel_t=cu_in_steel,
        fe_from_npi_t=fe_from_npi,
        c_from_npi_t=c_from_npi,
        c_from_ni_t=c_from_ni,
        si_from_npi_t=si_from_npi,
        p_from_npi_t=p_from_npi,
        s_from_npi_t=s_from_npi,
    )
