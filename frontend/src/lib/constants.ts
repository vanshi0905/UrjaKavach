/**
 * Pyrometallurgical Constants, Emission Factors & Digital Twin Facilities
 * Grounded in peer-reviewed metallurgical literature and industrial benchmarks:
 * - IPCC 2006 / 2019 Refinement Guidelines
 * - Worldsteel CO2 Data Collection Guidelines
 * - International Stainless Steel Forum (ISSF) Life Cycle Inventory
 * - Central Electricity Authority (CEA) CO2 Baseline Database v20 (India)
 * - JSL FY2024-25 Business Responsibility & Sustainability Report (BRSR)
 * - BEE June 2026 CCTS Draft Benchmarks
 */

export interface RawMaterialEF {
  name: string;
  category: 'scrap' | 'virgin_iron' | 'ferroalloy' | 'nickel' | 'flux' | 'reducing_agent' | 'alloy_addition';
  co2_factor: number; // tCO2 per tonne material (or per tonne contained element for Ni)
  unit: string;
  carbon_content_pct: number;
  main_element_pct: number;
  iron_content_pct: number;
  typical_cost_usd_t: number;
  source_citation: string;
  si_content_pct?: number;
  p_content_pct?: number;
  s_content_pct?: number;
}

export const RAW_MATERIALS: Record<string, RawMaterialEF> = {
  scrap: {
    name: "Recycled Stainless Scrap",
    category: "scrap",
    co2_factor: 0.12,
    unit: "tCO2/t scrap",
    carbon_content_pct: 0.05,
    main_element_pct: 100.0,
    iron_content_pct: 70.0,
    typical_cost_usd_t: 1350.0,
    source_citation: "worldsteel Recycled Scrap Processing Factor (sorting, shearing, transport)",
  },
  coalDRI: {
    name: "Coal-based Direct Reduced Iron (Sponge Iron)",
    category: "virgin_iron",
    co2_factor: 2.60,
    unit: "tCO2/t DRI",
    carbon_content_pct: 2.00,
    main_element_pct: 88.0,
    iron_content_pct: 88.0,
    typical_cost_usd_t: 380.0,
    source_citation: "IPCC / Indian Coal Rotary Kiln DRI benchmark (JSL captive & merchant DRI)",
  },
  gasDRI: {
    name: "Natural Gas-based DRI (Midrex / Energiron)",
    category: "virgin_iron",
    co2_factor: 0.90,
    unit: "tCO2/t DRI",
    carbon_content_pct: 1.80,
    main_element_pct: 92.0,
    iron_content_pct: 92.0,
    typical_cost_usd_t: 440.0,
    source_citation: "Midrex / Tenova Shaft Furnace NG-DRI Benchmark",
  },
  pigIron: {
    name: "Blast Furnace Hot Metal / Cold Pig Iron",
    category: "virgin_iron",
    co2_factor: 1.80,
    unit: "tCO2/t pig iron",
    carbon_content_pct: 4.20,
    main_element_pct: 94.0,
    iron_content_pct: 94.0,
    typical_cost_usd_t: 410.0,
    source_citation: "worldsteel BF-BOF route baseline hot metal emission factor",
  },
  fecrStandard: {
    name: "High-Carbon Ferrochrome (HC FeCr, Standard)",
    category: "ferroalloy",
    co2_factor: 3.50,
    unit: "tCO2/t alloy",
    carbon_content_pct: 7.00,
    main_element_pct: 55.0,
    iron_content_pct: 40.0,
    typical_cost_usd_t: 1400.0,
    source_citation: "ISSF / JSL captive Submerged Arc Furnace (SAF) Jajpur",
  },
  fecrLowC: {
    name: "Low-Carbon Ferrochrome (LC FeCr, Silico-thermic)",
    category: "ferroalloy",
    co2_factor: 1.90,
    unit: "tCO2/t alloy",
    carbon_content_pct: 0.10,
    main_element_pct: 65.0,
    iron_content_pct: 34.0,
    typical_cost_usd_t: 2200.0,
    source_citation: "Silico-thermic refined LC FeCr benchmark",
  },
  niNPI: {
    name: "Indonesian Coal RKEF Nickel Pig Iron (New Yaking JV)",
    category: "nickel",
    co2_factor: 55.0, // tCO2 / t pure contained Ni
    unit: "tCO2/t contained Ni",
    carbon_content_pct: 3.00,
    main_element_pct: 14.0,
    iron_content_pct: 81.5,
    typical_cost_usd_t: 13000.0, // USD/t contained Ni equiv
    source_citation: "JSL 49% stake in New Yaking Halmahera, captive coal RKEF line",
    si_content_pct: 1.20,
    p_content_pct: 0.035,
    s_content_pct: 0.025,
  },
  niClass1: {
    name: "Class 1 Hydro / Low-Carbon Nickel Briquettes",
    category: "nickel",
    co2_factor: 10.0,
    unit: "tCO2/t contained Ni",
    carbon_content_pct: 0.01,
    main_element_pct: 99.8,
    iron_content_pct: 0.1,
    typical_cost_usd_t: 17500.0,
    source_citation: "Nickel Institute LCA / Hydro-powered Class 1 Nickel (Sherritt/Vale)",
  },
  niStandard: {
    name: "Standard Global Average Primary Nickel",
    category: "nickel",
    co2_factor: 15.0,
    unit: "tCO2/t contained Ni",
    carbon_content_pct: 0.05,
    main_element_pct: 99.8,
    iron_content_pct: 0.1,
    typical_cost_usd_t: 16500.0,
    source_citation: "ISSF / Global weighted average primary nickel",
  },
  femo: {
    name: "Ferromolybdenum (FeMo 65)",
    category: "ferroalloy",
    co2_factor: 8.50,
    unit: "tCO2/t alloy",
    carbon_content_pct: 1.50,
    main_element_pct: 65.0,
    iron_content_pct: 33.0,
    typical_cost_usd_t: 32000.0,
    source_citation: "IMOA (International Molybdenum Association) Life Cycle Profile",
  },
  feMn: {
    name: "High-Carbon Ferromanganese (HC FeMn 75)",
    category: "ferroalloy",
    co2_factor: 1.80,
    unit: "tCO2/t alloy",
    carbon_content_pct: 6.50,
    main_element_pct: 75.0,
    iron_content_pct: 20.0,
    typical_cost_usd_t: 1100.0,
    source_citation: "International Manganese Institute (IMnI) carbon benchmark",
  },
  feSi: {
    name: "Ferrosilicon (FeSi 75, for Slag Reduction)",
    category: "reducing_agent",
    co2_factor: 3.80,
    unit: "tCO2/t alloy",
    carbon_content_pct: 0.15,
    main_element_pct: 75.0,
    iron_content_pct: 23.0,
    typical_cost_usd_t: 1450.0,
    source_citation: "Euroalliages / Silicon Smelting Life Cycle Inventory",
  },
  lime: {
    name: "Burnt Lime (Quicklime CaO, for Basicity)",
    category: "flux",
    co2_factor: 0.95,
    unit: "tCO2/t lime",
    carbon_content_pct: 0.00,
    main_element_pct: 95.0,
    iron_content_pct: 0.0,
    typical_cost_usd_t: 120.0,
    source_citation: "IPCC Calcination of Limestone (CaCO3 -> CaO + CO2)",
  },
  cuFeed: {
    name: "Copper Granules / Cathode (Electrolytic Cu)",
    category: "alloy_addition",
    co2_factor: 3.20,
    unit: "tCO2/t copper",
    carbon_content_pct: 0.00,
    main_element_pct: 99.0,
    iron_content_pct: 0.5,
    typical_cost_usd_t: 9200.0,
    source_citation: "International Copper Association (ICA) Life Cycle Assessment",
  },
};

export interface FacilityProfile {
  id: string;
  name: string;
  location: string;
  capacity_mtpa: number;
  grid_emission_factor: number; // tCO2 / MWh
  electricity_cost_inr_kwh: number;
  ppa_available: boolean;
  ppa_emission_factor: number;
  ppa_cost_inr_kwh: number;
  ppa_capacity_mw: number;
  has_hot_fecr_charging: boolean;
  hot_fecr_sec_credit_kwh_t: number;
  has_green_hydrogen: boolean;
  green_h2_co2_abatement_t_yr: number;
  primary_products: string[];
  description: string;
  ccts_target_tco2: number;
  ccts_baseline_tco2: number;
}

export const FACILITIES: Record<string, FacilityProfile> = {
  jajpur: {
    id: "jajpur",
    name: "JSL Jajpur Integrated Stainless Complex",
    location: "Kalinganagar Industrial Complex, Jajpur, Odisha",
    capacity_mtpa: 2.2,
    grid_emission_factor: 1.00, // Captive 250 MW coal thermal CPP
    electricity_cost_inr_kwh: 4.40,
    ppa_available: true,
    ppa_emission_factor: 0.03, // 315.6 MW hybrid wind-solar PPA
    ppa_cost_inr_kwh: 3.60,
    ppa_capacity_mw: 315.6,
    has_hot_fecr_charging: true, // Adjacent SAF smelter: 200 kWh/t sensible heat saving
    hot_fecr_sec_credit_kwh_t: 200.0,
    has_green_hydrogen: false,
    green_h2_co2_abatement_t_yr: 0.0,
    primary_products: ["crCoil", "hrCoil", "slab", "plate"],
    description: "JSL's flagship mega-facility. Operates captive 250 MW coal CPP, large EAF-AOD lines, on-site Submerged Arc Furnaces (SAF) for direct molten FeCr hot charging, and 315.6 MW hybrid PPA.",
    ccts_target_tco2: 0.8222,
    ccts_baseline_tco2: 0.8792,
  },
  hisar: {
    id: "hisar",
    name: "JSL Hisar Specialty & Precision Works",
    location: "Hisar, Haryana, India",
    capacity_mtpa: 0.8,
    grid_emission_factor: 0.72, // Northern Regional Grid
    electricity_cost_inr_kwh: 6.80,
    ppa_available: true,
    ppa_emission_factor: 0.03,
    ppa_cost_inr_kwh: 4.10,
    ppa_capacity_mw: 50.0,
    has_hot_fecr_charging: false,
    hot_fecr_sec_credit_kwh_t: 0.0,
    has_green_hydrogen: true, // India's 1st commercial green H2 plant (95 Nm3/hr)
    green_h2_co2_abatement_t_yr: 2700.0,
    primary_products: ["crCoil", "specialty", "rebar", "wireRod", "bloom"],
    description: "Specialty & precision division. Produces razor blade steel, coin blanks, and hosts India's first commercial green hydrogen plant eliminating fossil fuel in bright annealing.",
    ccts_target_tco2: 0.8222,
    ccts_baseline_tco2: 0.8792,
  },
  chhattisgarh: {
    id: "chhattisgarh",
    name: "Jindal Chhattisgarh Industrial & Sponge Iron Hub",
    location: "Raipur-Raigarh Industrial Belt, Chhattisgarh",
    capacity_mtpa: 3.6,
    grid_emission_factor: 0.73, // CSPDCL Western Grid / Pithead Coal
    electricity_cost_inr_kwh: 6.50,
    ppa_available: true,
    ppa_emission_factor: 0.03,
    ppa_cost_inr_kwh: 3.40,
    ppa_capacity_mw: 250.0,
    has_hot_fecr_charging: false,
    hot_fecr_sec_credit_kwh_t: 0.0,
    has_green_hydrogen: false,
    green_h2_co2_abatement_t_yr: 0.0,
    primary_products: ["crCoil", "hrCoil", "slab", "plate", "rebar"],
    description: "India's sponge iron capital. Features rotary kiln DRI operations, SECL coal pithead power, and emerging CREDA solar open-access PPAs.",
    ccts_target_tco2: 0.8222,
    ccts_baseline_tco2: 0.8792,
  },
};

export interface ProductDef {
  label: string;
  elec_kwh: number;
  fuel_gj: number;
  yield_factor: number;
  description: string;
}

export const PRODUCTS: Record<string, ProductDef> = {
  crCoil: {
    label: "Cold Rolled (CR) Coil",
    elec_kwh: 430.0,
    fuel_gj: 1.10,
    yield_factor: 0.92,
    description: "HR coil cold-reduced, annealed and pickled. Highest-volume flat product.",
  },
  hrCoil: {
    label: "Hot Rolled (HR) Coil",
    elec_kwh: 150.0,
    fuel_gj: 0.80,
    yield_factor: 0.95,
    description: "Slab reheated & rolled on hot strip mill. Feedstock for CR.",
  },
  slab: {
    label: "Slab (semi-finished flat)",
    elec_kwh: 0.0,
    fuel_gj: 0.0,
    yield_factor: 0.98,
    description: "Cast slab only. Semi-finished product.",
  },
  plate: {
    label: "Heavy Plate",
    elec_kwh: 140.0,
    fuel_gj: 0.75,
    yield_factor: 0.94,
    description: "Thick plate for structural, process plant, and defense applications.",
  },
  specialty: {
    label: "Specialty / Coated Finish",
    elec_kwh: 510.0,
    fuel_gj: 1.10,
    yield_factor: 0.90,
    description: "Bright Annealed (BA), mirror, titanium-coated, precision strips.",
  },
  rebar: {
    label: "Stainless Rebar",
    elec_kwh: 140.0,
    fuel_gj: 0.70,
    yield_factor: 0.93,
    description: "Corrosion-resistant rebar for coastal infrastructure.",
  },
  wireRod: {
    label: "Wire Rod",
    elec_kwh: 130.0,
    fuel_gj: 0.65,
    yield_factor: 0.92,
    description: "Coiled rod for fasteners, welding electrodes, and wire drawing.",
  },
  bloom: {
    label: "Bloom (semi-finished long)",
    elec_kwh: 0.0,
    fuel_gj: 0.0,
    yield_factor: 0.97,
    description: "Cast bloom only. Feeds long-product rolling mills.",
  },
};

export const CASTING_ROUTES = {
  continuous: { label: "Continuous Slab/Billet Caster", elec_kwh: 30.0, fuel_gj: 0.0, yield_factor: 0.97 },
  ingot: { label: "Ingot Bottom-Pouring Casting", elec_kwh: 50.0, fuel_gj: 0.30, yield_factor: 0.90 },
};

export const REFINING_ROUTES = {
  aod: { label: "AOD Converter Only", elec_kwh: 150.0 },
  aodvod: { label: "AOD + VOD (Vacuum Oxygen Decarburization)", elec_kwh: 250.0 },
};

export const NATURAL_GAS_EF = 0.0561; // tCO2 / GJ
export const DEFAULT_EU_ETS_PRICE_EUR_T = 80.0;
export const DEFAULT_EU_CBAM_BENCHMARK_TCO2 = 0.288;
export const DEFAULT_EU_CBAM_CSCF = 0.87;
export const DEFAULT_CBAM_PHASE_IN_2026 = 0.025;
export const DEFAULT_INDIA_CCC_PRICE_INR_T = 1500.0;
export const DEFAULT_EUR_TO_INR = 92.0;
export const DEFAULT_JSL_EU_EXPORTS_TPA = 600000.0;
export const DEFAULT_JSL_TOTAL_CAPACITY_TPA = 3000000.0;

export const STATUTORY_BENCHMARKS = [
  { key: "scrap_eaf", label: "EU CBAM Scrap-EAF Benchmark", value: 0.288, color: "#10b981", desc: "Best-in-class 100% scrap route" },
  { key: "ccts_target", label: "India CCTS Jajpur 2026 Target", value: 0.8222, color: "#0ea5e9", desc: "BEE June 2026 statutory mandate" },
  { key: "ccts_baseline", label: "India CCTS Jajpur Baseline", value: 0.8792, color: "#38bdf8", desc: "BEE June 2026 baseline intensity" },
  { key: "cbam_drieaf", label: "EU CBAM DRI-EAF Benchmark", value: 1.033, color: "#f59e0b", desc: "Direct reduced iron default factor" },
  { key: "jsl_fy26", label: "JSL Verified FY24-26 Baseline", value: 1.760, color: "#f97316", desc: "Disclosed group S1+S2 performance" },
  { key: "cbam_bfbof", label: "EU CBAM BF-BOF Benchmark", value: 1.530, color: "#ef4444", desc: "Blast Furnace - Basic Oxygen Furnace" },
  { key: "global_avg", label: "Global Stainless Avg (ISSF)", value: 2.930, color: "#dc2626", desc: "International Stainless Steel Forum" },
];
