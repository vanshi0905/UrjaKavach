"""
Emission Factors and Thermodynamic Constants for Stainless Steel Metallurgy.
All factors are grounded in peer-reviewed metallurgical literature and industrial benchmarks:
- IPCC 2006 / 2019 Refinement Guidelines for National Greenhouse Gas Inventories
- Worldsteel CO2 Data Collection Guidelines
- International Stainless Steel Forum (ISSF) Life Cycle Inventory
- Nickel Institute Life Cycle Assessment (LCA)
- Central Electricity Authority (CEA) CO2 Baseline Database v20 (India)
- JSL FY2024-25 Business Responsibility & Sustainability Report (BRSR)
"""

from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class RawMaterialEF:
    name: str
    category: str
    co2_factor: float  # tCO2 per tonne of material
    unit: str
    carbon_content_pct: float  # % Carbon by weight (for Scope 1 decarburization)
    main_element_pct: float    # % Primary metallic element
    iron_content_pct: float    # % Fe by weight (for iron credit)
    typical_cost_usd_t: float  # USD / tonne for LP cost optimization
    source_citation: str
    si_content_pct: float = 0.0
    p_content_pct: float = 0.0
    s_content_pct: float = 0.0


# Precursor emission factors and compositions
RAW_MATERIALS: Dict[str, RawMaterialEF] = {
    "scrap": RawMaterialEF(
        name="Recycled Stainless Scrap",
        category="scrap",
        co2_factor=0.00,
        unit="tCO2/t scrap",
        carbon_content_pct=0.05,
        main_element_pct=100.0,
        iron_content_pct=70.0,
        typical_cost_usd_t=1350.0,
        source_citation="worldsteel Recycled Scrap Processing Factor (sorting, shearing, transport)",
    ),
    "coalDRI": RawMaterialEF(
        name="Coal-based Direct Reduced Iron (Sponge Iron)",
        category="virgin_iron",
        co2_factor=2.60,
        unit="tCO2/t DRI",
        carbon_content_pct=2.00,
        main_element_pct=88.0,  # 88% metallized Fe
        iron_content_pct=88.0,
        typical_cost_usd_t=380.0,
        source_citation="IPCC / Indian Coal Rotary Kiln DRI benchmark (JSL captive & merchant DRI)",
    ),
    "gasDRI": RawMaterialEF(
        name="Natural Gas-based DRI (Midrex / Energiron)",
        category="virgin_iron",
        co2_factor=0.90,
        unit="tCO2/t DRI",
        carbon_content_pct=1.80,
        main_element_pct=92.0,
        iron_content_pct=92.0,
        typical_cost_usd_t=440.0,
        source_citation="Midrex / Tenova Shaft Furnace NG-DRI Benchmark",
    ),
    "pigIron": RawMaterialEF(
        name="Blast Furnace Hot Metal / Cold Pig Iron",
        category="virgin_iron",
        co2_factor=1.80,
        unit="tCO2/t pig iron",
        carbon_content_pct=4.20,
        main_element_pct=94.0,
        iron_content_pct=94.0,
        typical_cost_usd_t=410.0,
        source_citation="worldsteel BF-BOF route baseline hot metal emission factor",
    ),
    "fecrStandard": RawMaterialEF(
        name="High-Carbon Ferrochrome (HC FeCr, Standard)",
        category="ferroalloy",
        co2_factor=3.50,
        unit="tCO2/t alloy",
        carbon_content_pct=7.00,
        main_element_pct=55.0,  # 55% Cr
        iron_content_pct=40.0,  # 40% Fe
        typical_cost_usd_t=1400.0,
        source_citation="ISSF / JSL captive Submerged Arc Furnace (SAF) Jajpur",
    ),
    "fecrLowC": RawMaterialEF(
        name="Low-Carbon Ferrochrome (LC FeCr, Silico-thermic)",
        category="ferroalloy",
        co2_factor=1.90,
        unit="tCO2/t alloy",
        carbon_content_pct=0.10,
        main_element_pct=65.0,  # 65% Cr
        iron_content_pct=34.0,  # 34% Fe
        typical_cost_usd_t=2200.0,
        source_citation="Silico-thermic refined LC FeCr benchmark",
    ),
    "niNPI": RawMaterialEF(
        name="Indonesian Coal RKEF Nickel Pig Iron (New Yaking JV)",
        category="nickel",
        co2_factor=55.0,  # tCO2 per tonne pure contained Ni (14% Ni NPI)
        unit="tCO2/t contained Ni",
        carbon_content_pct=3.00,  # 3.0% C
        main_element_pct=14.0,    # 14.0% Ni
        iron_content_pct=81.5,    # 81.5% Fe
        typical_cost_usd_t=13000.0,  # USD / t contained Ni equivalent
        source_citation="JSL 49% stake in New Yaking Halmahera, captive coal RKEF line (55 tCO2/t Ni)",
        si_content_pct=1.20,      # 1.2% Si
        p_content_pct=0.035,      # 0.035% P
        s_content_pct=0.025,      # 0.025% S
    ),
    "niClass1": RawMaterialEF(
        name="Class 1 Hydro / Low-Carbon Nickel Briquettes/Cathodes",
        category="nickel",
        co2_factor=10.0,  # tCO2 per tonne pure contained Ni
        unit="tCO2/t contained Ni",
        carbon_content_pct=0.01,
        main_element_pct=99.8,  # 99.8% Ni
        iron_content_pct=0.1,
        typical_cost_usd_t=17500.0,
        source_citation="Nickel Institute LCA / Hydro-powered Class 1 Nickel (Sherritt/Vale)",
    ),
    "niStandard": RawMaterialEF(
        name="Standard Global Average Primary Nickel",
        category="nickel",
        co2_factor=15.0,
        unit="tCO2/t contained Ni",
        carbon_content_pct=0.05,
        main_element_pct=99.8,
        iron_content_pct=0.1,
        typical_cost_usd_t=16500.0,
        source_citation="ISSF / Global weighted average primary nickel",
    ),
    "femo": RawMaterialEF(
        name="Ferromolybdenum (FeMo 65)",
        category="ferroalloy",
        co2_factor=8.50,
        unit="tCO2/t alloy",
        carbon_content_pct=1.50,
        main_element_pct=65.0,  # 65% Mo
        iron_content_pct=33.0,  # 33% Fe
        typical_cost_usd_t=32000.0,
        source_citation="IMOA (International Molybdenum Association) Life Cycle Profile",
    ),
    "feMn": RawMaterialEF(
        name="High-Carbon Ferromanganese (HC FeMn 75)",
        category="ferroalloy",
        co2_factor=1.80,
        unit="tCO2/t alloy",
        carbon_content_pct=6.50,
        main_element_pct=75.0,  # 75% Mn
        iron_content_pct=20.0,  # 20% Fe
        typical_cost_usd_t=1100.0,
        source_citation="International Manganese Institute (IMnI) carbon benchmark",
    ),
    "feSi": RawMaterialEF(
        name="Ferrosilicon (FeSi 75, for AOD Slag Reduction)",
        category="reducing_agent",
        co2_factor=3.80,
        unit="tCO2/t alloy",
        carbon_content_pct=0.15,
        main_element_pct=75.0,  # 75% Si
        iron_content_pct=23.0,
        typical_cost_usd_t=1450.0,
        source_citation="Euroalliages / Silicon Smelting Life Cycle Inventory",
    ),
    "lime": RawMaterialEF(
        name="Burnt Lime (Quicklime CaO, for Slag Basicity)",
        category="flux",
        co2_factor=0.95,
        unit="tCO2/t lime",
        carbon_content_pct=0.00,
        main_element_pct=95.0,  # 95% CaO
        iron_content_pct=0.0,
        typical_cost_usd_t=120.0,
        source_citation="IPCC Calcination of Limestone (CaCO3 -> CaO + CO2)",
    ),
    "cuFeed": RawMaterialEF(
        name="Copper Granules / Cathode (Electrolytic Cu)",
        category="alloy_addition",
        co2_factor=3.20,
        unit="tCO2/t copper",
        carbon_content_pct=0.00,
        main_element_pct=99.0,  # 99% Cu
        iron_content_pct=0.5,
        typical_cost_usd_t=9200.0,
        source_citation="International Copper Association (ICA) Life Cycle Assessment",
    ),
}

# Thermal Fuel Parameters
NATURAL_GAS_EF = 0.0561  # tCO2 / GJ (56.1 kg CO2/GJ IPCC default for Natural Gas)
GRAPHITE_ELECTRODE_CONSUMPTION_KG_T = 2.0  # kg electrode / tonne liquid steel
ELECTRODE_CARBON_PCT = 98.0  # % Carbon

# Metallurgical Recoveries in EAF-AOD Refining
METALLURGICAL_RECOVERIES = {
    "standard": {
        "Cr": 0.92,  # 92% Cr recovery in standard AOD slag reduction
        "Ni": 0.98,  # 98% Ni recovery (nickel does not easily oxidize)
        "Mo": 0.95,  # 95% Mo recovery
        "Mn": 0.88,  # 88% Mn recovery (manganese oxidizes readily)
        "Fe": 0.97,  # 97% metallic iron yield
    },
    "optimised": {
        "Cr": 0.96,  # 96% Cr recovery with optimized FeSi injection & slag basicity
        "Ni": 0.99,  # 99% Ni recovery
        "Mo": 0.97,  # 97% Mo recovery
        "Mn": 0.92,  # 92% Mn recovery
        "Fe": 0.98,  # 98% metallic iron yield
    },
}

# Product Yields and Energy Intensities for Downstream Finishing
@dataclass(frozen=True)
class ProductDefinition:
    label: str
    elec_kwh: float
    fuel_gj: float
    yield_factor: float
    description: str


PRODUCTS: Dict[str, ProductDefinition] = {
    "slab": ProductDefinition(
        label="Slab (semi-finished flat)",
        elec_kwh=0.0,
        fuel_gj=0.0,
        yield_factor=0.98,
        description="Cast only — semi-finished slab for flat rolling. Minimal additional processing.",
    ),
    "bloom": ProductDefinition(
        label="Bloom (semi-finished long)",
        elec_kwh=0.0,
        fuel_gj=0.0,
        yield_factor=0.97,
        description="Cast only — feeds JSL Hisar long-product rolling mills.",
    ),
    "hrCoil": ProductDefinition(
        label="Hot Rolled (HR) Coil",
        elec_kwh=150.0,
        fuel_gj=0.80,
        yield_factor=0.95,
        description="Slab reheated & rolled on hot strip/Steckel mill. Feedstock for CR.",
    ),
    "plate": ProductDefinition(
        label="Heavy Plate",
        elec_kwh=140.0,
        fuel_gj=0.75,
        yield_factor=0.94,
        description="Thick plate for structural, process plant, and defense applications.",
    ),
    "crCoil": ProductDefinition(
        label="Cold Rolled (CR) Coil",
        elec_kwh=430.0,
        fuel_gj=1.10,
        yield_factor=0.92,
        description="HR coil cold-reduced, annealed and pickled. Highest-volume flat product.",
    ),
    "specialty": ProductDefinition(
        label="Specialty / Coated Finish",
        elec_kwh=510.0,
        fuel_gj=1.10,
        yield_factor=0.90,
        description="Bright Annealed (BA), mirror, titanium-coated, embossed precision strips.",
    ),
    "rebar": ProductDefinition(
        label="Stainless Rebar",
        elec_kwh=140.0,
        fuel_gj=0.70,
        yield_factor=0.93,
        description="Corrosion-resistant rebar for coastal infrastructure and bridges.",
    ),
    "wireRod": ProductDefinition(
        label="Wire Rod",
        elec_kwh=130.0,
        fuel_gj=0.65,
        yield_factor=0.92,
        description="Coiled rod for fasteners, welding electrodes, and wire drawing.",
    ),
}

# Casting Processes
@dataclass(frozen=True)
class CastingProcess:
    label: str
    elec_kwh: float
    fuel_gj: float
    yield_factor: float


CASTING_ROUTES: Dict[str, CastingProcess] = {
    "continuous": CastingProcess("Continuous Slab/Billet Caster", elec_kwh=30.0, fuel_gj=0.0, yield_factor=0.97),
    "ingot": CastingProcess("Ingot Bottom-Pouring Casting", elec_kwh=50.0, fuel_gj=0.30, yield_factor=0.90),
}

# Refining Processes
@dataclass(frozen=True)
class RefiningProcess:
    label: str
    elec_kwh: float


REFINING_ROUTES: Dict[str, RefiningProcess] = {
    "aod": RefiningProcess("AOD Converter Only", elec_kwh=150.0),
    "aodvod": RefiningProcess("AOD + VOD (Vacuum Oxygen Decarburization)", elec_kwh=250.0),
}

# Regional Grid Factors
GRID_FACTORS: Dict[str, Dict[str, float]] = {
    "india": {"label": "India National Average (CEA v20)", "value": 0.72},
    "jajpur_cpp": {"label": "JSL Jajpur Captive Coal CPP (250 MW)", "value": 1.00},
    "mixedfossil": {"label": "Mixed Fossil Grid", "value": 0.50},
    "gas": {"label": "Natural Gas Combined Cycle", "value": 0.40},
    "eumix": {"label": "EU Grid Average (ETS territory)", "value": 0.30},
    "hydro": {"label": "Hydro-Dominated Grid", "value": 0.10},
    "nuclear": {"label": "Nuclear-Dominated Grid", "value": 0.075},
    "renewable": {"label": "Dedicated Wind/Solar Hybrid PPA", "value": 0.03},
}

# Global & Regulatory Legal Benchmarks
BENCHMARKS: Dict[str, Dict[str, any]] = {
    "eu_ets_hot_metal": {"label": "EU ETS: Hot Metal Benchmark (Scope 1)", "value": 1.248, "group": "scope1", "unit": "tCO2/t"},
    "eu_ets_eaf_high_alloy": {"label": "EU ETS: EAF High-Alloy Benchmark (Scope 1)", "value": 0.176, "group": "scope1", "unit": "tCO2/t"},
    "eu_ets_eaf_carbon": {"label": "EU ETS: EAF Carbon Steel Benchmark (Scope 1)", "value": 0.142, "group": "scope1", "unit": "tCO2/t"},
    "cbam_hrc_bfbof": {"label": "EU CBAM: HRC BF/BOF Default Factor", "value": 1.530, "group": "total", "unit": "tCO2/t"},
    "cbam_hrc_drieaf": {"label": "EU CBAM: HRC DRI/EAF Default Factor", "value": 1.033, "group": "total", "unit": "tCO2/t"},
    "cbam_hrc_scrap_eaf": {"label": "EU CBAM: HRC Scrap-EAF Benchmark", "value": 0.288, "group": "total", "unit": "tCO2/t"},
    "india_ccts_jajpur_target": {"label": "India CCTS: JSL Kalinga Nagar Target (BEE June 2026)", "value": 0.8222, "group": "total", "unit": "tCO2/t"},
    "india_ccts_jajpur_baseline": {"label": "India CCTS: JSL Kalinga Nagar Baseline (BEE June 2026)", "value": 0.8792, "group": "total", "unit": "tCO2/t"},
    "india_ccts_benchmark": {"label": "India CCTS: JSL Kalinga Nagar Target (BEE June 2026)", "value": 0.8222, "group": "total", "unit": "tCO2/t"},
    "india_national_avg": {"label": "India National Steel Average", "value": 2.540, "group": "total", "unit": "tCO2/t"},
    "india_2030_target": {"label": "India MoS 2030 Decarbonization Target", "value": 2.200, "group": "total", "unit": "tCO2/t"},
    "global_crude_avg": {"label": "Global Crude Steel Average (worldsteel)", "value": 1.900, "group": "total", "unit": "tCO2/t"},
    "global_stainless_avg": {"label": "Global Stainless Steel Average (ISSF)", "value": 2.930, "group": "total", "unit": "tCO2/t"},
    "jsl_fy26_baseline": {"label": "JSL Verified FY24-26 Baseline (S1+2)", "value": 1.760, "group": "total", "unit": "tCO2/t"},
}
