"""
Dynamic Thermodynamic EAF-AOD Enthalpy and Energy Engine.
Replaces static 550 kWh/t assumptions with a first-principles pyrometallurgical
enthalpy balance coupling charge metallurgy to electric arc furnace specific
electrical consumption (SEC):
1. Sensible & latent heat of stainless scrap melting: ~420 kWh/t
2. Endothermic FeO reduction in DRI (+159 kJ/mol): adds ~0.615 kWh/kg FeO
3. Gangue slag melting (SiO2 + Al2O3 neutralized with CaO flux): ~680 kWh/t
4. Exothermic oxidation of carbon & silicon in hot metal / pig iron: chemical heat credit
5. JSL Jajpur molten FeCr hot-charging sensible heat credit: ~200 kWh/t
"""

from dataclasses import dataclass
from typing import Dict, Optional
from jsl_carbon_engine.config.emission_factors import (
    PRODUCTS,
    CASTING_ROUTES,
    REFINING_ROUTES,
)
from jsl_carbon_engine.core.mass_balance import MassBalanceResult


# Thermodynamic Enthalpy Benchmarks (First-principles sensible + latent heat + chemical reactions)
# Thermal enthalpy Q_thermal (kWh_th / tonne of component melted/reduced)
Q_SCRAP_MELTING = 285.6       # Sensible + latent heat of solid stainless scrap to 1600°C (420 kWh_e @ 68% eta)
Q_COAL_DRI = 462.4           # Coal DRI (88% met, 12% FeO reduction + 5% acidic gangue; 680 kWh_e @ 68% eta)
Q_GAS_DRI = 380.8            # Gas DRI (92% met, lower gangue; 560 kWh_e @ 68% eta)
Q_PIG_IRON = 326.4           # Pig Iron / Hot Metal (exothermic C & Si oxidation credit; 480 kWh_e @ 68% eta)
Q_SOLID_FECR = 340.0         # Melting solid HC FeCr charge lumps (500 kWh_e @ 68% eta)
Q_SOLID_NI = 353.6           # Melting solid nickel cathodes/briquettes (520 kWh_e @ 68% eta)
Q_SOLID_FEMN = 326.4         # Melting solid HC FeMn lumps (480 kWh_e @ 68% eta)
Q_SOLID_FEMO = 353.6         # Melting solid FeMo 65 lumps (520 kWh_e @ 68% eta)
Q_SOLID_CU = 258.4           # Melting solid copper additions (380 kWh_e @ 68% eta)

# Molten FeCr hot-charging sensible + latent heat delivered (kWh_th / tonne molten FeCr)
HOT_FECR_SPECIFIC_SAVINGS_THERMAL = 400.0 # kWh_th sensible + latent heat savings per tonne molten FeCr
HOT_FECR_THERMAL_CEILING_JAJPUR = 200.0   # kWh_th thermal sensible heat ceiling per tonne steel

# Enthalpy of FeO carbothermic reduction: FeO + C -> Fe + CO (kJ/mol = +159.2)
DELTA_H_FEO_REDUCTION_KJ_MOL = 159.2
MOLAR_MASS_FEO_G_MOL = 71.85


@dataclass
class ThermodynamicResult:
    eaf_sec_kwh_t_liquid: float      # Primary melting SEC (kWh/t liquid steel)
    refining_sec_kwh_t_liquid: float # AOD or AOD+VOD electrical energy
    casting_sec_kwh_t_liquid: float  # Caster electrical energy
    downstream_elec_kwh_t_finished: float # Rolling and annealing electricity
    downstream_fuel_gj_t_finished: float  # Rolling and reheat fuel (GJ/t finished)
    total_elec_kwh_per_t_finished: float  # Total electrical energy per tonne finished steel
    total_fuel_gj_per_t_finished: float   # Total fuel energy per tonne finished steel
    total_energy_gj_per_t_finished: float # Total primary energy (GJ/t finished)
    hot_fecr_credit_applied: bool
    hot_fecr_savings_kwh_t: float
    breakdown_kwh: Dict[str, float]
    q_thermal_kwh_t: float = 0.0     # Charge thermal enthalpy (kWh_th / t liquid steel)
    e_aux_kwh_t: float = 0.0         # Auxiliary electrical consumption (kWh/t liquid steel)


def compute_thermodynamics(
    mass_balance: MassBalanceResult,
    fe_source: str = "coalDRI",
    hot_fecr_charging: bool = False,
    refining_route: str = "aod",
    casting_route: str = "continuous",
    product: str = "crCoil",
    ideal_yield: bool = False,
    eta_thermal: float = 0.68,
    metallization: float = 0.88,
    furnace_campaign_age: Optional[int] = None,
    e_aux: float = 0.0,
) -> ThermodynamicResult:
    """
    Computes dynamic electrical energy (SEC) and thermal fuel demand based on charge mix.
    Separates thermal enthalpy Q_thermal from electrical SEC:
        SEC = Q_thermal / eta_thermal + E_aux
    Hot FeCr electrical savings:
        Savings_elec = (fecr_mass_t * 400.0) / eta_thermal
    """
    if furnace_campaign_age is not None:
        # e.g., degrades from 72% at heat 1 down to 60% at heat 500
        if furnace_campaign_age <= 1:
            eta_thermal = 0.72
        elif furnace_campaign_age >= 500:
            eta_thermal = 0.60
        else:
            eta_thermal = 0.72 - (0.12 * (furnace_campaign_age - 1) / 499.0)

    mb = mass_balance
    s_frac = mb.scrap_fraction
    dri_mass = mb.gross_dri_charged_t
    fecr_mass = mb.fecr_mass_t
    ni_mass = mb.ni_mass_t
    femo_mass = mb.femo_mass_t
    femn_mass = mb.femn_mass_t
    cu_mass = getattr(mb, "cu_mass_t", 0.0)

    # 1. Thermal Enthalpy Balance Q_thermal (kWh_th per tonne liquid steel)
    q_scrap_part = s_frac * Q_SCRAP_MELTING

    # Virgin iron unit melting and reduction thermal enthalpy
    if fe_source == "coalDRI":
        base_feo_energy = (1.0 - 0.88) * 1000.0 * 0.615
        new_feo_energy = (1.0 - metallization) * 1000.0 * 0.615
        q_fe_unit = Q_COAL_DRI - base_feo_energy + new_feo_energy
    elif fe_source == "gasDRI":
        base_feo_energy = (1.0 - 0.92) * 1000.0 * 0.615
        new_feo_energy = (1.0 - metallization) * 1000.0 * 0.615
        q_fe_unit = Q_GAS_DRI - base_feo_energy + new_feo_energy
    elif fe_source == "pigIron":
        q_fe_unit = Q_PIG_IRON
    else:
        q_fe_unit = Q_COAL_DRI

    q_dri_part = dri_mass * q_fe_unit
    q_fecr_part = fecr_mass * Q_SOLID_FECR
    q_ni_part = ni_mass * Q_SOLID_NI
    q_femo_part = femo_mass * Q_SOLID_FEMO
    q_femn_part = femn_mass * Q_SOLID_FEMN
    q_cu_part = cu_mass * Q_SOLID_CU

    # Total Thermal Enthalpy Q_thermal
    q_thermal = q_scrap_part + q_dri_part + q_fecr_part + q_ni_part + q_femo_part + q_femn_part + q_cu_part

    # 2. Electrical Specific Energy Consumption: SEC = Q_thermal / eta_thermal + E_aux
    raw_eaf_sec = (q_thermal / eta_thermal) + e_aux

    # 3. Hot-Charging Sensible Heat Credit (JSL Jajpur Edge)
    # When molten FeCr is charged directly at 1650°C from Jajpur's captive SAF smelter:
    # Explicit electrical SEC saving = (fecr_mass_t * 400.0) / eta_thermal
    hot_credit_elec = 0.0
    if hot_fecr_charging and fecr_mass > 0.001:
        elec_savings = (fecr_mass * HOT_FECR_SPECIFIC_SAVINGS_THERMAL) / eta_thermal
        max_credit_elec = (HOT_FECR_THERMAL_CEILING_JAJPUR / eta_thermal)
        hot_credit_elec = min(elec_savings, max_credit_elec, raw_eaf_sec * 0.40)
        eaf_sec = max(0.0, raw_eaf_sec - hot_credit_elec)
    else:
        eaf_sec = raw_eaf_sec

    # 3. Refining Energy (AOD vs AOD+VOD)
    ref_proc = REFINING_ROUTES.get(refining_route, REFINING_ROUTES["aod"])
    refining_sec = ref_proc.elec_kwh

    # 4. Casting Energy
    cast_proc = CASTING_ROUTES.get(casting_route, CASTING_ROUTES["continuous"])
    casting_sec = cast_proc.elec_kwh
    casting_fuel_gj = 0.0 if ideal_yield else cast_proc.fuel_gj

    # 5. Meltshop Total SEC (per tonne liquid steel)
    meltshop_sec_liquid = eaf_sec + refining_sec + casting_sec

    # 6. Downstream Rolling and Finishing (per tonne finished product)
    prod_def = PRODUCTS.get(product, PRODUCTS["crCoil"])
    downstream_elec = prod_def.elec_kwh
    downstream_fuel = prod_def.fuel_gj

    # 7. Total Electricity per Tonne Finished Product (scaled by finishing yield)
    cast_per_finished = mb.cast_per_finished
    total_elec_kwh = (meltshop_sec_liquid * cast_per_finished) + downstream_elec
    total_fuel_gj = (casting_fuel_gj * cast_per_finished) + downstream_fuel

    # 8. Total Primary Energy (GJ/t finished steel): 1 MWh = 3.6 GJ
    total_energy_gj = (total_elec_kwh / 1000.0) * 3.6 + total_fuel_gj

    breakdown = {
        "q_thermal_total_kwh": round(q_thermal * cast_per_finished, 2),
        "eaf_scrap_kwh": (q_scrap_part / eta_thermal) * cast_per_finished,
        "eaf_dri_kwh": (q_dri_part / eta_thermal) * cast_per_finished,
        "eaf_alloys_kwh": ((q_fecr_part + q_ni_part + q_femo_part + q_femn_part + q_cu_part) / eta_thermal) * cast_per_finished,
        "eaf_aux_kwh": e_aux * cast_per_finished,
        "eaf_hot_credit_kwh": -hot_credit_elec * cast_per_finished if hot_fecr_charging else 0.0,
        "eaf_net_kwh": eaf_sec * cast_per_finished,
        "refining_kwh": refining_sec * cast_per_finished,
        "casting_kwh": casting_sec * cast_per_finished,
        "downstream_rolling_kwh": downstream_elec,
    }

    return ThermodynamicResult(
        eaf_sec_kwh_t_liquid=round(eaf_sec, 2),
        refining_sec_kwh_t_liquid=round(refining_sec, 2),
        casting_sec_kwh_t_liquid=round(casting_sec, 2),
        downstream_elec_kwh_t_finished=round(downstream_elec, 2),
        downstream_fuel_gj_t_finished=round(downstream_fuel, 2),
        total_elec_kwh_per_t_finished=round(total_elec_kwh, 2),
        total_fuel_gj_per_t_finished=round(total_fuel_gj, 2),
        total_energy_gj_per_t_finished=round(total_energy_gj, 2),
        hot_fecr_credit_applied=hot_fecr_charging,
        hot_fecr_savings_kwh_t=round(hot_credit_elec, 2),
        breakdown_kwh=breakdown,
        q_thermal_kwh_t=round(q_thermal, 2),
        e_aux_kwh_t=round(e_aux, 2),
    )
