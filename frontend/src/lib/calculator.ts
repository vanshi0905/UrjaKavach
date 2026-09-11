/**
 * Complete First-Principles Pyrometallurgical Calculator Engine
 * Implements:
 * 1. Closed-loop stoichiometric mass balance with iron crediting & NPI balancing
 * 2. Dynamic EAF-AOD Enthalpy model with chemical heat & hot FeCr sensible heat
 * 3. Scope 1 (stack decarb + fuel), Scope 2 (grid/CPP + PPA), Scope 3 (precursors)
 * 4. Dual Financial Engine: EU CBAM (SEFA 2026 cash vs 2034 unhedged) + India CCTS (BEE June 2026)
 */

import { Grade, getGrade } from './grades';
import {
  RAW_MATERIALS,
  FACILITIES,
  PRODUCTS,
  CASTING_ROUTES,
  REFINING_ROUTES,
  NATURAL_GAS_EF,
  DEFAULT_EU_ETS_PRICE_EUR_T,
  DEFAULT_EU_CBAM_BENCHMARK_TCO2,
  DEFAULT_EU_CBAM_CSCF,
  DEFAULT_CBAM_PHASE_IN_2026,
  DEFAULT_INDIA_CCC_PRICE_INR_T,
  DEFAULT_EUR_TO_INR,
  DEFAULT_JSL_EU_EXPORTS_TPA,
  DEFAULT_JSL_TOTAL_CAPACITY_TPA,
  FacilityProfile,
} from './constants';

export interface CalculatorInputs {
  gradeId: string;
  scrapPct: number;
  facilityId: string;
  feSource: 'coalDRI' | 'gasDRI' | 'pigIron';
  fecrSource: 'fecrStandard' | 'fecrLowC';
  niSource: 'niStandard' | 'niClass1' | 'niNPI';
  refiningRoute: 'aod' | 'aodvod';
  castingRoute: 'continuous' | 'ingot';
  product: 'crCoil' | 'hrCoil' | 'slab' | 'plate' | 'specialty' | 'rebar' | 'wireRod' | 'bloom';
  renewablePct: number;
  hotFecrCharging?: boolean;
  euEtsPriceEur?: number;
  indiaCccPriceInr?: number;
  euExportsTpa?: number;
  totalCapacityTpa?: number;
  recoveryMode?: 'standard' | 'optimised';
}

export interface MassBalanceResult {
  gradeId: string;
  scrapFraction: number;
  scrapMassT: number;
  fecrMassT: number;
  niMassT: number;
  npiMassT: number;
  pureNiMassT: number;
  femoMassT: number;
  femnMassT: number;
  cuMassT: number;
  feFromScrapT: number;
  feFromFecrT: number;
  feFromNiT: number;
  feFromFemoT: number;
  feFromFemnT: number;
  feFromCuT: number;
  totalFeFromAlloysT: number;
  netVirginFeT: number;
  grossDriChargedT: number;
  totalLiquidSteelT: number;
  castPerFinished: number;
  finishedProduct: string;
  scaledInputs: Record<string, number>;
}

export interface ThermodynamicResult {
  eafSecKwhLiquid: number;
  refiningSecKwhLiquid: number;
  castingSecKwhLiquid: number;
  meltshopSecLiquid: number;
  downstreamElecKwhFinished: number;
  downstreamFuelGjFinished: number;
  totalElecKwhFinished: number;
  totalFuelGjFinished: number;
  totalEnergyGjFinished: number;
  hotFecrCreditApplied: boolean;
  hotFecrSavingsKwhT: number;
  qThermalKwhT: number;
  breakdownKwh: Record<string, number>;
}

export interface EmissionsResult {
  gradeId: string;
  product: string;
  facilityId: string;
  scope1DirectTco2: number;
  scope2ElectricityTco2: number;
  scope3PrecursorsTco2: number;
  totalCo2T: number;
  gridEfBlended: number;
  renewableSharePct: number;
  scope1StackDecarbTco2: number;
  scope1FuelCombustionTco2: number;
  scope3FeVirginTco2: number;
  scope3ScrapTco2: number;
  scope3FecrTco2: number;
  scope3NickelTco2: number;
  scope3FemoTco2: number;
  scope3FemnTco2: number;
  scope3CopperTco2: number;
  scope3FluxesTco2: number;
  breakdownPct: Record<string, number>;
}

export interface FinancialResult {
  cbamEmbeddedIntensityTco2: number; // Scope 1 + 3 (excludes Scope 2)
  seeIncludingScope2: number;
  cbamEuBenchmarkTco2: number;
  cbamCscf: number;
  cbamPhaseInFactor2026: number;
  cbamSefaTco2: number;
  cbamTaxableGapFullTco2: number;
  cbamCashTariff2026EurPerT: number;
  cbamTariff2034UnhedgedEurPerT: number;
  cbamArticle9DeductionEurPerT: number;
  cbamTrajectoryEurPerT: Record<number, number>;
  cbamAnnualLiability2026Eur: number;
  cbamAnnualLiability2026InrCr: number;
  cbamAnnualLiability2034FullEur: number;
  cctsScope12IntensityTco2: number;
  cctsTargetTco2: number;
  cctsCarbonDeltaTco2: number;
  cctsStatus: 'SURPLUS_CREDIT' | 'DEFICIT_LIABILITY';
  cctsValueInrPerT: number;
  cctsAnnualEbitdaInrCr: number;
  executiveSummary: string;
}

export interface FullCalculationResult {
  grade: Grade;
  facility: FacilityProfile;
  massBalance: MassBalanceResult;
  thermo: ThermodynamicResult;
  emissions: EmissionsResult;
  financials: FinancialResult;
  inputs: CalculatorInputs;
}

// 1. MASS BALANCE
export function computeMassBalance(
  grade: Grade,
  scrapPct: number,
  feSource: string = 'coalDRI',
  fecrSource: string = 'fecrStandard',
  niSource: string = 'niStandard',
  recoveryMode: 'standard' | 'optimised' = 'standard',
  product: string = 'crCoil',
  casting: string = 'continuous',
  idealYield: boolean = false
): MassBalanceResult {
  const effScrapPct = Math.min(Math.max(0, scrapPct), grade.scrap_cap);
  const scrapFraction = effScrapPct / 100.0;

  const rec = recoveryMode === 'optimised'
    ? { Cr: 0.96, Ni: 0.99, Mo: 0.97, Mn: 0.92, Fe: 0.98, Cu: 0.98 }
    : { Cr: 0.92, Ni: 0.98, Mo: 0.95, Mn: 0.88, Fe: 0.97, Cu: 0.98 };

  const w_cr = grade.cr / 100.0;
  const w_ni = grade.ni / 100.0;
  const w_mo = grade.mo / 100.0;
  const w_mn = grade.mn / 100.0;
  const w_cu = grade.cu / 100.0;
  const w_other = (grade.c + grade.si + grade.s + grade.p + grade.n) / 100.0;
  const w_fe = grade.fe / 100.0;

  const cr_from_scrap = scrapFraction * w_cr;
  const ni_from_scrap = scrapFraction * w_ni;
  const mo_from_scrap = scrapFraction * w_mo;
  const mn_from_scrap = scrapFraction * w_mn;
  const cu_from_scrap = scrapFraction * w_cu;
  const fe_from_scrap = scrapFraction * w_fe;

  // FeCr
  const fecr_info = RAW_MATERIALS[fecrSource] || RAW_MATERIALS.fecrStandard;
  const c_cr_fecr = fecr_info.main_element_pct / 100.0;
  const c_fe_fecr = fecr_info.iron_content_pct / 100.0;
  const net_cr_needed = Math.max(0, (1.0 - scrapFraction) * w_cr);
  const fecr_mass = c_cr_fecr > 0 ? net_cr_needed / (rec.Cr * c_cr_fecr) : 0;
  const fe_from_fecr = fecr_mass * c_fe_fecr * rec.Fe;

  // FeMo
  const femo_info = RAW_MATERIALS.femo;
  const c_mo_femo = femo_info.main_element_pct / 100.0;
  const c_fe_femo = femo_info.iron_content_pct / 100.0;
  const net_mo_needed = Math.max(0, (1.0 - scrapFraction) * w_mo);
  const femo_mass = c_mo_femo > 0 && net_mo_needed > 0 ? net_mo_needed / (rec.Mo * c_mo_femo) : 0;
  const fe_from_femo = femo_mass * c_fe_femo * rec.Fe;

  // FeMn
  const femn_info = RAW_MATERIALS.feMn;
  const c_mn_femn = femn_info.main_element_pct / 100.0;
  const c_fe_femn = femn_info.iron_content_pct / 100.0;
  const net_mn_needed = Math.max(0, (1.0 - scrapFraction) * w_mn);
  const femn_mass = c_mn_femn > 0 && net_mn_needed > 0 ? net_mn_needed / (rec.Mn * c_mn_femn) : 0;
  const fe_from_femn = femn_mass * c_fe_femn * rec.Fe;

  // Cu
  const net_cu_needed = Math.max(0, (1.0 - scrapFraction) * w_cu);
  const cu_mass = net_cu_needed > 0.0001 ? net_cu_needed / (rec.Cu * 0.99) : 0;
  const fe_from_cu = cu_mass * 0.005 * rec.Fe;

  // Iron crediting & Nickel (NPI blending)
  const target_virgin_fe = (1.0 - scrapFraction) * w_fe;
  const fe_from_other_alloys = fe_from_fecr + fe_from_femo + fe_from_femn + fe_from_cu;
  const allowable_fe_for_ni = Math.max(0, target_virgin_fe - fe_from_other_alloys);

  const ni_info = RAW_MATERIALS[niSource] || RAW_MATERIALS.niStandard;
  const c_ni = ni_info.main_element_pct / 100.0;
  const c_fe_ni = ni_info.iron_content_pct / 100.0;
  const net_ni_needed = Math.max(0, (1.0 - scrapFraction) * w_ni);

  let npi_mass = 0;
  let pure_ni_mass = 0;
  let ni_mass = 0;
  let fe_from_ni = 0;

  if (niSource === 'niNPI' && c_fe_ni > 0) {
    const potential_npi_mass = c_ni > 0 ? net_ni_needed / (rec.Ni * c_ni) : 0;
    const potential_fe = potential_npi_mass * c_fe_ni * rec.Fe;
    if (potential_fe > allowable_fe_for_ni) {
      npi_mass = (c_fe_ni * rec.Fe) > 0 ? allowable_fe_for_ni / (c_fe_ni * rec.Fe) : 0;
      const ni_from_npi = npi_mass * c_ni * rec.Ni;
      const rem_ni = Math.max(0, net_ni_needed - ni_from_npi);
      pure_ni_mass = rem_ni / (rec.Ni * 0.998);
      ni_mass = npi_mass + pure_ni_mass;
      fe_from_ni = npi_mass * c_fe_ni * rec.Fe + pure_ni_mass * 0.001 * rec.Fe;
    } else {
      npi_mass = potential_npi_mass;
      pure_ni_mass = 0;
      ni_mass = potential_npi_mass;
      fe_from_ni = potential_fe;
    }
  } else {
    ni_mass = c_ni > 0 ? net_ni_needed / (rec.Ni * c_ni) : 0;
    pure_ni_mass = ni_mass;
    fe_from_ni = ni_mass * c_fe_ni * rec.Fe;
  }

  const total_fe_from_alloys = fe_from_other_alloys + fe_from_ni;
  const net_virgin_fe = Math.max(0, target_virgin_fe - total_fe_from_alloys);

  // Gross DRI
  const dri_info = RAW_MATERIALS[feSource] || RAW_MATERIALS.coalDRI;
  const dri_met_fe = (dri_info.main_element_pct / 100.0) * rec.Fe;
  const gross_dri_charged = dri_met_fe > 0 ? net_virgin_fe / dri_met_fe : 0;

  // Check liquid steel sum
  const cr_in_steel = cr_from_scrap + fecr_mass * c_cr_fecr * rec.Cr;
  let ni_in_steel = ni_from_scrap;
  if (npi_mass > 0) {
    ni_in_steel += npi_mass * (RAW_MATERIALS.niNPI.main_element_pct / 100.0) * rec.Ni + pure_ni_mass * 0.998 * rec.Ni;
  } else {
    ni_in_steel += ni_mass * c_ni * rec.Ni;
  }
  const mo_in_steel = mo_from_scrap + femo_mass * c_mo_femo * rec.Mo;
  const mn_in_steel = mn_from_scrap + femn_mass * c_mn_femn * rec.Mn;
  const cu_in_steel = cu_from_scrap + cu_mass * 0.99 * rec.Cu;
  const fe_in_steel = fe_from_scrap + total_fe_from_alloys + net_virgin_fe;
  const other_in_steel = scrapFraction * w_other + (1.0 - scrapFraction) * w_other;
  const total_liquid_steel = cr_in_steel + ni_in_steel + mo_in_steel + mn_in_steel + cu_in_steel + fe_in_steel + other_in_steel;

  // Finishing yield cascade
  const cast_proc = CASTING_ROUTES[casting as keyof typeof CASTING_ROUTES] || CASTING_ROUTES.continuous;
  const prod_def = PRODUCTS[product as keyof typeof PRODUCTS] || PRODUCTS.crCoil;
  const cast_per_finished = idealYield ? 1.0 : 1.0 / (cast_proc.yield_factor * prod_def.yield_factor);

  const scaled_inputs: Record<string, number> = {
    scrap_t: scrapFraction * cast_per_finished,
    fecr_t: fecr_mass * cast_per_finished,
    ni_t: ni_mass * cast_per_finished,
    femo_t: femo_mass * cast_per_finished,
    femn_t: femn_mass * cast_per_finished,
    cu_t: cu_mass * cast_per_finished,
    net_virgin_fe_t: net_virgin_fe * cast_per_finished,
    dri_gross_t: gross_dri_charged * cast_per_finished,
  };
  if (npi_mass > 0) {
    scaled_inputs.npi_t = npi_mass * cast_per_finished;
    scaled_inputs.pure_ni_t = pure_ni_mass * cast_per_finished;
  }

  return {
    gradeId: grade.id,
    scrapFraction,
    scrapMassT: scrapFraction,
    fecrMassT: fecr_mass,
    niMassT: ni_mass,
    npiMassT: npi_mass,
    pureNiMassT: pure_ni_mass,
    femoMassT: femo_mass,
    femnMassT: femn_mass,
    cuMassT: cu_mass,
    feFromScrapT: fe_from_scrap,
    feFromFecrT: fe_from_fecr,
    feFromNiT: fe_from_ni,
    feFromFemoT: fe_from_femo,
    feFromFemnT: fe_from_femn,
    feFromCuT: fe_from_cu,
    totalFeFromAlloysT: total_fe_from_alloys,
    netVirginFeT: net_virgin_fe,
    grossDriChargedT: gross_dri_charged,
    totalLiquidSteelT: Math.round(total_liquid_steel * 1000) / 1000,
    castPerFinished: Math.round(cast_per_finished * 1000) / 1000,
    finishedProduct: product,
    scaledInputs: scaled_inputs,
  };
}

// 2. THERMODYNAMICS
export function computeThermodynamics(
  mb: MassBalanceResult,
  feSource: string = 'coalDRI',
  hotFecrCharging: boolean = false,
  refiningRoute: string = 'aod',
  castingRoute: string = 'continuous',
  product: string = 'crCoil',
  etaThermal: number = 0.68
): ThermodynamicResult {
  const Q_SCRAP = 285.6; // 420 kWh_e @ 68%
  let q_fe_unit = 462.4; // coal DRI base
  if (feSource === 'gasDRI') q_fe_unit = 380.8;
  else if (feSource === 'pigIron') q_fe_unit = 326.4;

  const q_scrap_part = mb.scrapFraction * Q_SCRAP;
  const q_dri_part = mb.grossDriChargedT * q_fe_unit;
  const q_fecr_part = mb.fecrMassT * 340.0;
  const q_ni_part = mb.niMassT * 353.6;
  const q_femo_part = mb.femoMassT * 353.6;
  const q_femn_part = mb.femnMassT * 326.4;
  const q_cu_part = mb.cuMassT * 258.4;

  const q_thermal = q_scrap_part + q_dri_part + q_fecr_part + q_ni_part + q_femo_part + q_femn_part + q_cu_part;
  const raw_eaf_sec = q_thermal / etaThermal;

  let hot_credit_elec = 0;
  if (hotFecrCharging && mb.fecrMassT > 0.001) {
    const elec_savings = (mb.fecrMassT * 400.0) / etaThermal;
    const max_credit_elec = 200.0 / etaThermal;
    hot_credit_elec = Math.min(elec_savings, max_credit_elec, raw_eaf_sec * 0.40);
  }
  const eaf_sec = Math.max(0, raw_eaf_sec - hot_credit_elec);

  const ref_proc = REFINING_ROUTES[refiningRoute as keyof typeof REFINING_ROUTES] || REFINING_ROUTES.aod;
  const cast_proc = CASTING_ROUTES[castingRoute as keyof typeof CASTING_ROUTES] || CASTING_ROUTES.continuous;
  const prod_def = PRODUCTS[product as keyof typeof PRODUCTS] || PRODUCTS.crCoil;

  const refining_sec = ref_proc.elec_kwh;
  const casting_sec = cast_proc.elec_kwh;
  const meltshop_sec_liquid = eaf_sec + refining_sec + casting_sec;

  const downstream_elec = prod_def.elec_kwh;
  const downstream_fuel = prod_def.fuel_gj + cast_proc.fuel_gj * mb.castPerFinished;

  const total_elec_kwh = meltshop_sec_liquid * mb.castPerFinished + downstream_elec;
  const total_fuel_gj = downstream_fuel;
  const total_energy_gj = (total_elec_kwh / 1000.0) * 3.6 + total_fuel_gj;

  const breakdown = {
    eaf_scrap_kwh: Math.round((q_scrap_part / etaThermal) * mb.castPerFinished),
    eaf_dri_kwh: Math.round((q_dri_part / etaThermal) * mb.castPerFinished),
    eaf_alloys_kwh: Math.round(((q_fecr_part + q_ni_part + q_femo_part + q_femn_part + q_cu_part) / etaThermal) * mb.castPerFinished),
    eaf_hot_credit_kwh: Math.round(-hot_credit_elec * mb.castPerFinished),
    eaf_net_kwh: Math.round(eaf_sec * mb.castPerFinished),
    refining_kwh: Math.round(refining_sec * mb.castPerFinished),
    casting_kwh: Math.round(casting_sec * mb.castPerFinished),
    downstream_rolling_kwh: Math.round(downstream_elec),
  };

  return {
    eafSecKwhLiquid: Math.round(eaf_sec * 10) / 10,
    refiningSecKwhLiquid: refining_sec,
    castingSecKwhLiquid: casting_sec,
    meltshopSecLiquid: Math.round(meltshop_sec_liquid * 10) / 10,
    downstreamElecKwhFinished: downstream_elec,
    downstreamFuelGjFinished: Math.round(downstream_fuel * 100) / 100,
    totalElecKwhFinished: Math.round(total_elec_kwh * 10) / 10,
    totalFuelGjFinished: Math.round(total_fuel_gj * 100) / 100,
    totalEnergyGjFinished: Math.round(total_energy_gj * 100) / 100,
    hotFecrCreditApplied: hotFecrCharging,
    hotFecrSavingsKwhT: Math.round(hot_credit_elec * 10) / 10,
    qThermalKwhT: Math.round(q_thermal * 10) / 10,
    breakdownKwh: breakdown,
  };
}

// 3. EMISSIONS
export function computeEmissions(
  grade: Grade,
  mb: MassBalanceResult,
  thermo: ThermodynamicResult,
  facilityId: string = 'jajpur',
  feSource: string = 'coalDRI',
  fecrSource: string = 'fecrStandard',
  niSource: string = 'niStandard',
  renewablePct: number = 47.0
): EmissionsResult {
  const facility = FACILITIES[facilityId] || FACILITIES.jajpur;
  const castFactor = mb.castPerFinished;

  // Scope 1: Stack Decarburization
  const fecr_c_pct = (RAW_MATERIALS[fecrSource] || RAW_MATERIALS.fecrStandard).carbon_content_pct;
  const c_from_fecr = mb.fecrMassT * (fecr_c_pct / 100.0);
  const dri_c_pct = (RAW_MATERIALS[feSource] || RAW_MATERIALS.coalDRI).carbon_content_pct;
  const c_from_dri = mb.grossDriChargedT * (dri_c_pct / 100.0);
  const c_from_femn = mb.femnMassT * (RAW_MATERIALS.feMn.carbon_content_pct / 100.0);
  const c_from_femo = mb.femoMassT * (RAW_MATERIALS.femo.carbon_content_pct / 100.0);

  let c_from_ni = 0;
  if (mb.npiMassT > 0) {
    c_from_ni = mb.npiMassT * (RAW_MATERIALS.niNPI.carbon_content_pct / 100.0) + mb.pureNiMassT * 0.0001;
  } else {
    c_from_ni = mb.niMassT * ((RAW_MATERIALS[niSource] || RAW_MATERIALS.niStandard).carbon_content_pct / 100.0);
  }
  const c_from_scrap = mb.scrapMassT * (RAW_MATERIALS.scrap.carbon_content_pct / 100.0);

  const total_c_charged = c_from_fecr + c_from_dri + c_from_femn + c_from_femo + c_from_ni + c_from_scrap;
  const c_retained = grade.c / 100.0;
  const c_oxidized = Math.max(0, total_c_charged - c_retained);

  const decarb_co2e_liquid = c_oxidized * (44.0 / 12.0);
  const electrode_co2_liquid = (2.0 / 1000.0) * (44.0 / 12.0); // 2 kg graphite electrode/t
  const process_stack_co2_liquid = decarb_co2e_liquid + electrode_co2_liquid;

  const scope1_fuel = thermo.totalFuelGjFinished * NATURAL_GAS_EF;
  const scope1_stack = process_stack_co2_liquid * castFactor;
  const scope1_total = scope1_stack + scope1_fuel;

  // Scope 2: Electricity
  const base_grid_ef = facility.grid_emission_factor;
  const eff_renew = Math.min(100.0, Math.max(0.0, renewablePct));
  const f_renew = eff_renew / 100.0;
  const ppa_ef = facility.ppa_emission_factor;
  const blended_grid_ef = f_renew * ppa_ef + (1.0 - f_renew) * base_grid_ef;

  const total_mwh = thermo.totalElecKwhFinished / 1000.0;
  const scope2_total = total_mwh * blended_grid_ef;

  // Scope 3: Upstream Precursors
  const dri_ef = (RAW_MATERIALS[feSource] || RAW_MATERIALS.coalDRI).co2_factor;
  const co2_fe_virgin = mb.grossDriChargedT * dri_ef * castFactor;
  const co2_scrap = mb.scrapMassT * RAW_MATERIALS.scrap.co2_factor * castFactor;
  const fecr_ef = (RAW_MATERIALS[fecrSource] || RAW_MATERIALS.fecrStandard).co2_factor;
  const co2_fecr = mb.fecrMassT * fecr_ef * castFactor;

  let co2_ni = 0;
  if (mb.npiMassT > 0) {
    const contained_npi = mb.npiMassT * (RAW_MATERIALS.niNPI.main_element_pct / 100.0);
    co2_ni = (contained_npi * RAW_MATERIALS.niNPI.co2_factor + mb.pureNiMassT * RAW_MATERIALS.niClass1.co2_factor) * castFactor;
  } else if (niSource === 'niNPI') {
    const contained_ni = mb.niMassT * (RAW_MATERIALS.niNPI.main_element_pct / 100.0);
    co2_ni = contained_ni * RAW_MATERIALS.niNPI.co2_factor * castFactor;
  } else {
    co2_ni = mb.niMassT * (RAW_MATERIALS[niSource] || RAW_MATERIALS.niStandard).co2_factor * castFactor;
  }

  const co2_femo = mb.femoMassT * RAW_MATERIALS.femo.co2_factor * castFactor;
  const co2_femn = mb.femnMassT * RAW_MATERIALS.feMn.co2_factor * castFactor;
  const co2_cu = mb.cuMassT * RAW_MATERIALS.cuFeed.co2_factor * castFactor;

  // AOD Slag fluxing (FeSi + Lime)
  const fesi_kg = Math.max(8.0, (grade.cr * 10.0 * 0.10 * 0.4051) / (0.85 * 0.75));
  const lime_kg = 1.90 * (fesi_kg * 0.75 * (60.084 / 28.0855)) / 0.95;
  const co2_fluxes = ((fesi_kg / 1000.0) * RAW_MATERIALS.feSi.co2_factor + (lime_kg / 1000.0) * RAW_MATERIALS.lime.co2_factor) * castFactor;

  const scope3_total = co2_fe_virgin + co2_scrap + co2_fecr + co2_ni + co2_femo + co2_femn + co2_cu + co2_fluxes;
  const total_co2 = scope1_total + scope2_total + scope3_total;

  const breakdownPct = {
    scope1_pct: total_co2 > 0 ? Math.round((scope1_total / total_co2) * 1000) / 10 : 0,
    scope2_pct: total_co2 > 0 ? Math.round((scope2_total / total_co2) * 1000) / 10 : 0,
    scope3_pct: total_co2 > 0 ? Math.round((scope3_total / total_co2) * 1000) / 10 : 0,
    nickel_share_scope3_pct: scope3_total > 0 ? Math.round((co2_ni / scope3_total) * 1000) / 10 : 0,
    fecr_share_scope3_pct: scope3_total > 0 ? Math.round((co2_fecr / scope3_total) * 1000) / 10 : 0,
  };

  return {
    gradeId: grade.id,
    product: mb.finishedProduct,
    facilityId,
    scope1DirectTco2: Math.round(scope1_total * 1000) / 1000,
    scope2ElectricityTco2: Math.round(scope2_total * 1000) / 1000,
    scope3PrecursorsTco2: Math.round(scope3_total * 1000) / 1000,
    totalCo2T: Math.round(total_co2 * 1000) / 1000,
    gridEfBlended: Math.round(blended_grid_ef * 1000) / 1000,
    renewableSharePct: eff_renew,
    scope1StackDecarbTco2: Math.round(scope1_stack * 1000) / 1000,
    scope1FuelCombustionTco2: Math.round(scope1_fuel * 1000) / 1000,
    scope3FeVirginTco2: Math.round(co2_fe_virgin * 1000) / 1000,
    scope3ScrapTco2: Math.round(co2_scrap * 1000) / 1000,
    scope3FecrTco2: Math.round(co2_fecr * 1000) / 1000,
    scope3NickelTco2: Math.round(co2_ni * 1000) / 1000,
    scope3FemoTco2: Math.round(co2_femo * 1000) / 1000,
    scope3FemnTco2: Math.round(co2_femn * 1000) / 1000,
    scope3CopperTco2: Math.round(co2_cu * 1000) / 1000,
    scope3FluxesTco2: Math.round(co2_fluxes * 1000) / 1000,
    breakdownPct,
  };
}

// 4. FINANCIALS (EU CBAM + INDIA CCTS)
export function computeFinancials(
  emissions: EmissionsResult,
  euEtsPriceEur: number = DEFAULT_EU_ETS_PRICE_EUR_T,
  euCbamBenchmark: number = DEFAULT_EU_CBAM_BENCHMARK_TCO2,
  cscf: number = DEFAULT_EU_CBAM_CSCF,
  cbamPhaseIn2026: number = DEFAULT_CBAM_PHASE_IN_2026,
  indiaCccPriceInr: number = DEFAULT_INDIA_CCC_PRICE_INR_T,
  euExportsTpa: number = DEFAULT_JSL_EU_EXPORTS_TPA,
  totalCapacityTpa: number = DEFAULT_JSL_TOTAL_CAPACITY_TPA,
  eurToInr: number = DEFAULT_EUR_TO_INR
): FinancialResult {
  // 1. EU CBAM: Specific Embedded Emissions = Scope 1 + Scope 3 (Scope 2 excluded)
  const see = emissions.scope1DirectTco2 + emissions.scope3PrecursorsTco2;
  const see_including_scope2 = emissions.totalCo2T;

  const facility = FACILITIES[emissions.facilityId] || FACILITIES.jajpur;
  const target_ccts = facility.ccts_target_tco2;

  // CCTS (Scope 1 + Scope 2 intensity)
  const s12_intensity = emissions.scope1DirectTco2 + emissions.scope2ElectricityTco2;
  const ccts_delta = target_ccts - s12_intensity;
  const ccts_status: 'SURPLUS_CREDIT' | 'DEFICIT_LIABILITY' = ccts_delta >= 0 ? 'SURPLUS_CREDIT' : 'DEFICIT_LIABILITY';
  const ccts_value_inr = ccts_delta * indiaCccPriceInr;
  const annual_ccts_inr_cr = (ccts_value_inr * totalCapacityTpa) / 1e7;

  // Article 9 credit for domestic carbon price paid in India
  const article9_deduction_eur = (s12_intensity * indiaCccPriceInr) / eurToInr;

  // SEFA 2026 formula: benchmark * 0.975 * cscf
  const sefa_2026 = euCbamBenchmark * 0.975 * cscf;
  const taxable_gap_full = Math.max(0, see - sefa_2026);

  // 2026 Cash Tariff = taxable_gap * €80 * 0.025 - Article 9 credit
  const gross_cbam_tariff_2026 = taxable_gap_full * euEtsPriceEur * cbamPhaseIn2026;
  const net_cbam_tariff_2026 = Math.max(0, gross_cbam_tariff_2026 - article9_deduction_eur);

  // 2034 Unhedged Exposure = (SEE - 0.0) * €80 - Article 9 credit
  const gross_cbam_tariff_2034 = Math.max(0, see * euEtsPriceEur);
  const net_cbam_tariff_2034 = Math.max(0, gross_cbam_tariff_2034 - article9_deduction_eur);

  const trajectory: Record<number, number> = {
    2026: Math.round(net_cbam_tariff_2026 * 100) / 100,
    2027: Math.round(Math.max(0, taxable_gap_full * euEtsPriceEur * 0.050 - article9_deduction_eur) * 100) / 100,
    2028: Math.round(Math.max(0, taxable_gap_full * euEtsPriceEur * 0.250 - article9_deduction_eur) * 100) / 100,
    2030: Math.round(Math.max(0, taxable_gap_full * euEtsPriceEur * 0.500 - article9_deduction_eur) * 100) / 100,
    2034: Math.round(net_cbam_tariff_2034 * 100) / 100,
  };

  const annual_cbam_eur = net_cbam_tariff_2026 * euExportsTpa;
  const annual_cbam_inr_cr = (annual_cbam_eur * eurToInr) / 1e7;
  const annual_cbam_2034_eur = net_cbam_tariff_2034 * euExportsTpa;

  const cbam_desc = `CBAM 2026 Cash: €${net_cbam_tariff_2026.toFixed(2)}/t | 2034 Unhedged: €${gross_cbam_tariff_2034.toFixed(2)}/t`;
  const ccts_desc = ccts_delta >= 0
    ? `CCTS Surplus: +₹${ccts_value_inr.toFixed(1)}/t (+₹${annual_ccts_inr_cr.toFixed(1)} Cr/yr EBITDA gain)`
    : `CCTS Deficit: -₹${Math.abs(ccts_value_inr).toFixed(1)}/t (-₹${Math.abs(annual_ccts_inr_cr).toFixed(1)} Cr/yr liability)`;

  return {
    cbamEmbeddedIntensityTco2: Math.round(see * 1000) / 1000,
    seeIncludingScope2: Math.round(see_including_scope2 * 1000) / 1000,
    cbamEuBenchmarkTco2: euCbamBenchmark,
    cbamCscf: cscf,
    cbamPhaseInFactor2026: cbamPhaseIn2026,
    cbamSefaTco2: Math.round(sefa_2026 * 1000) / 1000,
    cbamTaxableGapFullTco2: Math.round(taxable_gap_full * 1000) / 1000,
    cbamCashTariff2026EurPerT: Math.round(net_cbam_tariff_2026 * 100) / 100,
    cbamTariff2034UnhedgedEurPerT: Math.round(gross_cbam_tariff_2034 * 100) / 100,
    cbamArticle9DeductionEurPerT: Math.round(article9_deduction_eur * 100) / 100,
    cbamTrajectoryEurPerT: trajectory,
    cbamAnnualLiability2026Eur: Math.round(annual_cbam_eur),
    cbamAnnualLiability2026InrCr: Math.round(annual_cbam_inr_cr * 10) / 10,
    cbamAnnualLiability2034FullEur: Math.round(annual_cbam_2034_eur),
    cctsScope12IntensityTco2: Math.round(s12_intensity * 1000) / 1000,
    cctsTargetTco2: target_ccts,
    cctsCarbonDeltaTco2: Math.round(ccts_delta * 1000) / 1000,
    cctsStatus: ccts_status,
    cctsValueInrPerT: Math.round(ccts_value_inr * 10) / 10,
    cctsAnnualEbitdaInrCr: Math.round(annual_ccts_inr_cr * 10) / 10,
    executiveSummary: `${cbam_desc} | ${ccts_desc}`,
  };
}

// Master orchestrator function
export function calculateSteelmaking(inputs: CalculatorInputs): FullCalculationResult {
  const grade = getGrade(inputs.gradeId);
  const facility = FACILITIES[inputs.facilityId] || FACILITIES.jajpur;

  const hotFecr = inputs.hotFecrCharging !== undefined ? inputs.hotFecrCharging : facility.has_hot_fecr_charging;

  const mb = computeMassBalance(
    grade,
    inputs.scrapPct,
    inputs.feSource,
    inputs.fecrSource,
    inputs.niSource,
    inputs.recoveryMode || 'standard',
    inputs.product,
    inputs.castingRoute
  );

  const thermo = computeThermodynamics(
    mb,
    inputs.feSource,
    hotFecr,
    inputs.refiningRoute,
    inputs.castingRoute,
    inputs.product
  );

  const emissions = computeEmissions(
    grade,
    mb,
    thermo,
    inputs.facilityId,
    inputs.feSource,
    inputs.fecrSource,
    inputs.niSource,
    inputs.renewablePct
  );

  const financials = computeFinancials(
    emissions,
    inputs.euEtsPriceEur || DEFAULT_EU_ETS_PRICE_EUR_T,
    DEFAULT_EU_CBAM_BENCHMARK_TCO2,
    DEFAULT_EU_CBAM_CSCF,
    DEFAULT_CBAM_PHASE_IN_2026,
    inputs.indiaCccPriceInr || DEFAULT_INDIA_CCC_PRICE_INR_T,
    inputs.euExportsTpa || DEFAULT_JSL_EU_EXPORTS_TPA,
    inputs.totalCapacityTpa || DEFAULT_JSL_TOTAL_CAPACITY_TPA,
    DEFAULT_EUR_TO_INR
  );

  return {
    grade,
    facility,
    massBalance: mb,
    thermo,
    emissions,
    financials,
    inputs,
  };
}
