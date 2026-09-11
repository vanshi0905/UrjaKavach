"""
JSL Facility Profiles and Operational Parameters.
Models Jindal Stainless Limited's primary manufacturing hubs:
1. Jajpur Works (Odisha): 2.2 MTPA expanding to 3.2 MTPA, integrated ferroalloy smelters,
   250 MW coal CPP, 315.6 MW hybrid PPA, and captive SAF molten FeCr hot charging.
2. Hisar Works (Haryana): 0.8 MTPA precision strips, long products, specialty finishes,
   Northern Grid connection, and India's 1st commercial green hydrogen plant.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass(frozen=True)
class FacilityProfile:
    id: str
    name: str
    location: str
    capacity_mtpa: float
    grid_emission_factor: float  # tCO2 / MWh (CPP or regional grid)
    electricity_cost_inr_kwh: float  # INR / kWh
    ppa_available: bool
    ppa_emission_factor: float  # tCO2 / MWh
    ppa_cost_inr_kwh: float  # INR / kWh
    ppa_capacity_mw: float
    has_hot_fecr_charging: bool
    hot_fecr_sec_credit_kwh_t: float  # Sensible heat savings in EAF
    has_green_hydrogen: bool
    green_h2_co2_abatement_t_yr: float  # Direct thermal abatement
    primary_products: List[str]
    description: str
    ccts_target_tco2: float = 0.8222  # BEE June 2026 draft target (tCO2e/tcs)
    ccts_baseline_tco2: float = 0.8792  # BEE baseline specific emission intensity


JAJPUR_WORKS = FacilityProfile(
    id="jajpur",
    name="JSL Jajpur Integrated Stainless Steel Complex",
    location="Kalinganagar Industrial Complex, Jajpur, Odisha, India",
    capacity_mtpa=2.2,
    # 250 MW (2x125 MW) coal-based thermal Captive Power Plant (CPP)
    grid_emission_factor=1.00,  # ~1.00 tCO2/MWh for subcritical coal CPP
    electricity_cost_inr_kwh=4.40,  # CPP generation cost
    ppa_available=True,
    # 315.6 MW Wind-Solar Hybrid PPA (Oyster Renewable) + ReNew Power (700M units/yr)
    ppa_emission_factor=0.03,  # Life-cycle renewable emission factor
    ppa_cost_inr_kwh=3.60,  # Landed tariff INR 3.60/kWh (cheaper than CPP!)
    ppa_capacity_mw=315.6,
    has_hot_fecr_charging=True,  # Captive Submerged Arc Furnaces (SAF) adjacent to melt shop
    hot_fecr_sec_credit_kwh_t=200.0,  # Direct ladle transfer delivers ~200 kWh/t sensible heat credit
    has_green_hydrogen=False,
    green_h2_co2_abatement_t_yr=0.0,
    primary_products=["crCoil", "hrCoil", "slab", "plate"],
    description=(
        "JSL's flagship mega-facility. Operates captive coal thermal CPP (250 MW), "
        "large-scale EAF-AOD lines, on-site Submerged Arc Furnaces (SAF) for direct molten FeCr "
        "hot charging, and a 315.6 MW hybrid renewable PPA."
    ),
    ccts_target_tco2=0.8222,  # BEE June 2026 draft notification for JSL Kalinga Nagar
    ccts_baseline_tco2=0.8792,
)

HISAR_WORKS = FacilityProfile(
    id="hisar",
    name="JSL Hisar Specialty & Precision Works",
    location="Hisar, Haryana, India",
    capacity_mtpa=0.8,
    # Northern Regional Grid (CEA CO2 baseline database v20)
    grid_emission_factor=0.72,  # CEA weighted average grid factor
    electricity_cost_inr_kwh=6.80,  # Industrial state grid tariff
    ppa_available=True,
    ppa_emission_factor=0.03,
    ppa_cost_inr_kwh=4.10,
    ppa_capacity_mw=50.0,
    has_hot_fecr_charging=False,  # Solid charge chrome only
    hot_fecr_sec_credit_kwh_t=0.0,
    has_green_hydrogen=True,  # Commercial 95 Nm3/hr alkaline electrolyzer plant
    green_h2_co2_abatement_t_yr=2700.0,  # Displaces ammonia dissociation in Bright Annealing lines
    primary_products=["crCoil", "specialty", "rebar", "wireRod", "bloom"],
    description=(
        "Specialty and precision steel division. Focuses on high-value razor blade steel, coin blanks, "
        "precision strips, and houses India's first commercial green hydrogen plant in stainless steel, "
        "eliminating fossil fuels in bright annealing lines."
    ),
    ccts_target_tco2=0.7107,
    ccts_baseline_tco2=0.7600,
)

CHHATTISGARH_WORKS = FacilityProfile(
    id="chhattisgarh",
    name="Jindal Chhattisgarh Industrial & Sponge Iron Hub",
    location="Raigarh & Raipur Industrial Belt, Chhattisgarh, India",
    capacity_mtpa=3.6,
    # Western Regional Grid (CSPDCL / CEA CO2 Baseline Database v20) & Pithead Coal CPPs
    grid_emission_factor=0.73,  # CSPDCL state grid factor (~0.73 tCO2/MWh) or SECL-coal captive CPP (~1.08 tCO2/MWh)
    electricity_cost_inr_kwh=6.50,  # Industrial High-Tension (HT) tariff under CSPDCL
    ppa_available=True,
    # CREDA (Chhattisgarh Renewable Energy Development Agency) & Solar Open Access PPAs
    ppa_emission_factor=0.03,
    ppa_cost_inr_kwh=3.40,  # Landed solar open-access tariff in Chhattisgarh (INR 3.40/kWh)
    ppa_capacity_mw=250.0,
    has_hot_fecr_charging=False,  # Solid charge chrome / merchant ferroalloys
    hot_fecr_sec_credit_kwh_t=0.0,
    has_green_hydrogen=False,
    green_h2_co2_abatement_t_yr=0.0,
    primary_products=["crCoil", "hrCoil", "slab", "plate", "rebar", "wireRod"],
    description=(
        "Chhattisgarh Steel & Sponge Iron Hub (Raipur-Raigarh belt). India's sponge iron capital, "
        "utilizing SECL non-coking thermal coal for rotary kiln DRI production, pithead captive power, "
        "and emerging CREDA solar open-access PPAs. Home to NIT Raipur's industrial research ecosystem."
    ),
    ccts_target_tco2=0.8222,
    ccts_baseline_tco2=0.8792,
)

FACILITIES: Dict[str, FacilityProfile] = {
    "jajpur": JAJPUR_WORKS,
    "hisar": HISAR_WORKS,
    "chhattisgarh": CHHATTISGARH_WORKS,
    "raigarh": CHHATTISGARH_WORKS,
    "raipur": CHHATTISGARH_WORKS,
}


def get_facility(facility_id: str) -> FacilityProfile:
    f_id = facility_id.lower().strip()
    if f_id in FACILITIES:
        return FACILITIES[f_id]
    raise ValueError(f"Unknown facility '{facility_id}'. Available: {list(FACILITIES.keys())}")

