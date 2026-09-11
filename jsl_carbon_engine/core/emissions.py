"""
Comprehensive Scope 1, Scope 2, and Scope 3 Emissions Engine.
Grounded in GHG Protocol Corporate Standard, ISO 14064, and EU CBAM Guidance:
1. Scope 1 (Direct Process & Fuel):
   - Stoichiometric AOD decarburization: oxidation of carbon in FeCr (7% C),
     DRI (2% C), graphite electrodes (2 kg/t), and scrap to CO2 via (44/12) factor.
   - Natural gas reheating furnaces, ladle preheaters, and annealing lines (0.0561 tCO2/GJ).
2. Scope 2 (Indirect Electricity):
   - Coupled to JSL facility profile (Jajpur 250 MW coal CPP @ 1.00 vs Hisar grid @ 0.72)
     and renewable PPA blending (Oyster 315.6 MW hybrid PPA @ 0.03 tCO2/MWh).
3. Scope 3 (Upstream Precursors):
   - Granular ferroalloys: FeCr, FeMo, FeMn (critical for JSL 200-series).
   - High-resolution Nickel sourcing: Indonesian Coal RKEF NPI (55 tCO2/t Ni)
     vs Class 1 Hydro-powered Nickel (10 tCO2/t Ni) vs Global Average (15 tCO2/t Ni).
"""

from dataclasses import dataclass
from typing import Dict, Optional
from jsl_carbon_engine.config.emission_factors import (
    RAW_MATERIALS,
    NATURAL_GAS_EF,
    GRAPHITE_ELECTRODE_CONSUMPTION_KG_T,
    ELECTRODE_CARBON_PCT,
    GRID_FACTORS,
)
from jsl_carbon_engine.config.jsl_facilities import get_facility, FacilityProfile
from jsl_carbon_engine.core.mass_balance import MassBalanceResult
from jsl_carbon_engine.core.thermodynamics import ThermodynamicResult
from jsl_carbon_engine.core.grades import Grade


@dataclass
class EmissionsResult:
    grade_id: str
    product: str
    facility_id: str
    scope1_direct_tco2: float  # Grouped as direct_melt_shop
    scope2_electricity_tco2: float  # Grouped as electricity_generation (includes CPP & Grid)
    scope3_precursors_tco2: float  # Grouped as upstream_precursors
    total_co2_t: float
    grid_emission_factor_blended: float  # tCO2 / MWh
    renewable_share_pct: float
    # Detailed Scope 1 breakdown
    scope1_stack_decarb_tco2: float
    scope1_fuel_combustion_tco2: float
    # Detailed Scope 3 breakdown
    scope3_fe_virgin_tco2: float
    scope3_scrap_tco2: float
    scope3_fecr_tco2: float
    scope3_nickel_tco2: float
    scope3_femo_tco2: float
    scope3_femn_tco2: float
    scope3_fluxes_tco2: float
    breakdown_pct: Dict[str, float]
    scope3_copper_tco2: float = 0.0
    fecr_oxidized_co2_t: float = 0.0
    aod_physical_co2_t: float = 0.0
    aod_physical_co_t: float = 0.0


def compute_emissions(
    grade: Grade,
    mass_balance: MassBalanceResult,
    thermo: ThermodynamicResult,
    facility_id: str = "jajpur",
    fe_source: str = "coalDRI",
    fecr_source: str = "fecrStandard",
    ni_source: str = "niStandard",
    renewable_pct: float = 47.0,  # JSL disclosed baseline renewable share
    grid_region: Optional[str] = None,
    fesi_demand_t: Optional[float] = None,
    lime_demand_t: Optional[float] = None,
    recovery_mode: str = "standard",
) -> EmissionsResult:
    """
    Computes rigorous Scope 1, Scope 2, and Scope 3 emissions for 1 tonne finished stainless steel.
    """
    mb = mass_balance
    cast_factor = mb.cast_per_finished

    # Auto-resolve slag reduction fluxes if not explicitly passed
    if fesi_demand_t is None or lime_demand_t is None:
        from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics
        slag_calc = compute_slag_kinetics(grade=grade, recovery_mode=recovery_mode)
        if fesi_demand_t is None:
            fesi_demand_t = slag_calc.fesi_demand_t
        if lime_demand_t is None:
            lime_demand_t = slag_calc.lime_demand_t

    # =========================================================================
    # 1. SCOPE 1: DIRECT PROCESS STACK + REHEAT FUEL
    # =========================================================================
    # Carbon inputs to melt shop (tonnes C per tonne liquid steel)
    fecr_c_pct = RAW_MATERIALS[fecr_source].carbon_content_pct
    c_from_fecr = mb.fecr_mass_t * (fecr_c_pct / 100.0)

    dri_c_pct = RAW_MATERIALS.get(fe_source, RAW_MATERIALS["coalDRI"]).carbon_content_pct
    c_from_dri = mb.gross_dri_charged_t * (dri_c_pct / 100.0)

    # Electrode consumption: default 2.0 kg/t.
    electrode_kg_per_t = 2.0
    # We remove electrode carbon from total_c_charged to calculate it separately.

    femn_c_pct = RAW_MATERIALS["feMn"].carbon_content_pct
    c_from_femn = mb.femn_mass_t * (femn_c_pct / 100.0)

    femo_c_pct = RAW_MATERIALS["femo"].carbon_content_pct
    c_from_femo = mb.femo_mass_t * (femo_c_pct / 100.0)

    # Nickel carbon input (critical: NPI contains ~3% C)
    if mb.npi_mass_t > 0:
        c_from_ni = (mb.npi_mass_t * (RAW_MATERIALS["niNPI"].carbon_content_pct / 100.0)) + (mb.pure_ni_mass_t * (RAW_MATERIALS["niClass1"].carbon_content_pct / 100.0))
    else:
        ni_c_pct = RAW_MATERIALS[ni_source].carbon_content_pct
        c_from_ni = mb.ni_mass_t * (ni_c_pct / 100.0)

    scrap_c_pct = RAW_MATERIALS["scrap"].carbon_content_pct
    c_from_scrap = mb.scrap_mass_t * (scrap_c_pct / 100.0)

    total_c_charged = c_from_fecr + c_from_dri + c_from_femn + c_from_femo + c_from_ni + c_from_scrap
    c_retained_in_steel = grade.c / 100.0

    # Carbon oxidized during AOD oxygen-argon blowing to CO and CO2
    c_oxidized = max(0.0, total_c_charged - c_retained_in_steel)
    
    # Physical off-gas composition: 80% CO2, 20% CO
    co2_split_fraction = 0.8
    direct_co2_physical = c_oxidized * co2_split_fraction * (44.0 / 12.0)
    indirect_co_physical = c_oxidized * (1.0 - co2_split_fraction) * (28.0 / 12.0)
    
    # Scope 1 GHG accounting under IPCC / ISO 19694-6:
    # Carbon oxidation factor = 1.0, reporting 100% of oxidized carbon as CO2e via (44/12).
    decarb_co2e_liquid = c_oxidized * (44.0 / 12.0)
    electrode_co2 = (electrode_kg_per_t / 1000.0) * (44.0 / 12.0)
    
    process_stack_co2_liquid = decarb_co2e_liquid + electrode_co2
    
    # FeCr carbon oxidized during AOD refining (retained as informational metric;
    # under IPCC / ISO 19694-6, SAF factors deduct tapped C, so this is legitimate Scope 1 and NOT subtracted from CBAM)
    fecr_fraction = c_from_fecr / total_c_charged if total_c_charged > 0 else 0.0
    fecr_oxidized = c_oxidized * fecr_fraction
    fecr_oxidized_co2 = fecr_oxidized * (44.0 / 12.0)

    # Reheating and finishing fuel combustion
    total_fuel_gj = thermo.total_fuel_gj_per_t_finished
    fuel_combustion_co2 = total_fuel_gj * NATURAL_GAS_EF

    # Total Scope 1 per tonne finished steel
    scope1_stack = process_stack_co2_liquid * cast_factor
    scope1_fuel = fuel_combustion_co2
    scope1_total = scope1_stack + scope1_fuel

    # =========================================================================
    # 2. SCOPE 2: INDIRECT ELECTRICITY CONSUMPTION
    # =========================================================================
    # Determine base power emission factor
    facility = get_facility(facility_id)
    if grid_region and grid_region in GRID_FACTORS:
        base_grid_ef = GRID_FACTORS[grid_region]["value"]
    else:
        base_grid_ef = facility.grid_emission_factor

    # Blend with renewable PPA
    eff_renew_pct = min(100.0, max(0.0, float(renewable_pct)))
    f_renew = eff_renew_pct / 100.0
    ppa_ef = facility.ppa_emission_factor if facility.ppa_available else 0.03
    blended_grid_ef = (f_renew * ppa_ef) + ((1.0 - f_renew) * base_grid_ef)

    # Scope 2 calculation
    total_mwh = thermo.total_elec_kwh_per_t_finished / 1000.0
    scope2_total = total_mwh * blended_grid_ef

    # =========================================================================
    # 3. SCOPE 3: EMBODIED PRECURSORS
    # =========================================================================
    # Virgin iron unit (DRI or Pig Iron)
    dri_ef = RAW_MATERIALS.get(fe_source, RAW_MATERIALS["coalDRI"]).co2_factor
    co2_fe_virgin = mb.gross_dri_charged_t * dri_ef * cast_factor

    # Recycled stainless scrap
    scrap_ef = RAW_MATERIALS["scrap"].co2_factor
    co2_scrap = mb.scrap_mass_t * scrap_ef * cast_factor

    # Ferrochrome
    fecr_ef = RAW_MATERIALS[fecr_source].co2_factor
    co2_fecr = mb.fecr_mass_t * fecr_ef * cast_factor

    # Nickel (Crucial JSL lever: Indonesian coal NPI vs Class 1 hydro)
    if mb.npi_mass_t > 0:
        contained_npi_ni = mb.npi_mass_t * (RAW_MATERIALS["niNPI"].main_element_pct / 100.0)
        co2_npi = (contained_npi_ni * RAW_MATERIALS["niNPI"].co2_factor) * cast_factor
        co2_pure_ni = (mb.pure_ni_mass_t * RAW_MATERIALS["niClass1"].co2_factor) * cast_factor
        co2_ni = co2_npi + co2_pure_ni
    elif ni_source == "niNPI":
        contained_ni_t = mb.ni_mass_t * (RAW_MATERIALS["niNPI"].main_element_pct / 100.0)
        co2_ni = contained_ni_t * RAW_MATERIALS["niNPI"].co2_factor * cast_factor
    else:
        co2_ni = mb.ni_mass_t * RAW_MATERIALS[ni_source].co2_factor * cast_factor

    # Ferromolybdenum
    femo_ef = RAW_MATERIALS["femo"].co2_factor
    co2_femo = mb.femo_mass_t * femo_ef * cast_factor

    # Ferromanganese (200-series flagship)
    femn_ef = RAW_MATERIALS["feMn"].co2_factor
    co2_femn = mb.femn_mass_t * femn_ef * cast_factor

    # Copper additions
    cu_mass = getattr(mb, "cu_mass_t", 0.0)
    cu_ef = RAW_MATERIALS.get("cuFeed", RAW_MATERIALS["scrap"]).co2_factor
    co2_cu = cu_mass * cu_ef * cast_factor

    # Slag reduction & basicity fluxes (FeSi + Lime)
    fesi_ef = RAW_MATERIALS["feSi"].co2_factor
    lime_ef = RAW_MATERIALS["lime"].co2_factor
    co2_fluxes = (fesi_demand_t * fesi_ef + lime_demand_t * lime_ef) * cast_factor

    scope3_total = co2_fe_virgin + co2_scrap + co2_fecr + co2_ni + co2_femo + co2_femn + co2_cu + co2_fluxes

    # =========================================================================
    # 4. TOTAL EMISSIONS & PROPORTIONAL BREAKDOWN
    # =========================================================================
    total_co2 = scope1_total + scope2_total + scope3_total

    breakdown_pct = {
        "direct_melt_shop_pct": round((scope1_total / total_co2) * 100.0, 1) if total_co2 > 0 else 0.0,
        "electricity_generation_pct": round((scope2_total / total_co2) * 100.0, 1) if total_co2 > 0 else 0.0,
        "upstream_precursors_pct": round((scope3_total / total_co2) * 100.0, 1) if total_co2 > 0 else 0.0,
        "scope1_pct": round((scope1_total / total_co2) * 100.0, 1) if total_co2 > 0 else 0.0,
        "scope2_pct": round((scope2_total / total_co2) * 100.0, 1) if total_co2 > 0 else 0.0,
        "scope3_pct": round((scope3_total / total_co2) * 100.0, 1) if total_co2 > 0 else 0.0,
        "nickel_share_of_scope3_pct": round((co2_ni / scope3_total) * 100.0, 1) if scope3_total > 0 else 0.0,
        "fecr_share_of_scope3_pct": round((co2_fecr / scope3_total) * 100.0, 1) if scope3_total > 0 else 0.0,
        "aod_co2_physical_t": round(direct_co2_physical * cast_factor, 4),
        "aod_co_physical_t": round(indirect_co_physical * cast_factor, 4),
    }

    return EmissionsResult(
        grade_id=grade.id,
        product=mb.finished_product,
        facility_id=facility_id,
        scope1_direct_tco2=round(scope1_total, 2),
        scope2_electricity_tco2=round(scope2_total, 2),
        scope3_precursors_tco2=round(scope3_total, 2),
        total_co2_t=round(total_co2, 2),
        grid_emission_factor_blended=round(blended_grid_ef, 2),
        renewable_share_pct=round(eff_renew_pct, 1),
        scope1_stack_decarb_tco2=round(scope1_stack, 2),
        scope1_fuel_combustion_tco2=round(scope1_fuel, 2),
        scope3_fe_virgin_tco2=round(co2_fe_virgin, 2),
        scope3_scrap_tco2=round(co2_scrap, 2),
        scope3_fecr_tco2=round(co2_fecr, 2),
        scope3_nickel_tco2=round(co2_ni, 2),
        scope3_femo_tco2=round(co2_femo, 2),
        scope3_femn_tco2=round(co2_femn, 2),
        scope3_fluxes_tco2=round(co2_fluxes, 2),
        breakdown_pct=breakdown_pct,
        scope3_copper_tco2=round(co2_cu, 2),
        fecr_oxidized_co2_t=round(fecr_oxidized_co2 * cast_factor, 2),
        aod_physical_co2_t=round(direct_co2_physical * cast_factor, 4),
        aod_physical_co_t=round(indirect_co_physical * cast_factor, 4),
    )
