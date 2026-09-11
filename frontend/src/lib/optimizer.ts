/**
 * Continuous Multi-Objective Charge Sheet Optimizer & Pareto Frontier
 * Uses Two-Phase Simplex to solve:
 *   min alpha * Cost_norm + (1 - alpha) * Carbon_norm
 * Subject to:
 *   - Total metallic bath mass = 1.000 t
 *   - ASTM / JSL metallurgical specifications (Cr, Ni, Mo, Mn, Cu)
 *   - Tramp element limits (Sn <= 0.03%, P <= 0.04%, S <= 0.03%)
 *   - Ni tramp in ferritic grades <= 0.50%
 *   - Physical scrap ceiling (grade.scrap_cap)
 */

import { Grade } from './grades';
import { RAW_MATERIALS, FACILITIES } from './constants';
import { solveLP } from './simplex';

export const FEED_KEYS = [
  'scrap',
  'coalDRI',
  'gasDRI',
  'pigIron',
  'fecrStandard',
  'fecrLowC',
  'niStandard',
  'niClass1',
  'niNPI',
  'femo',
  'feMn',
  'cuFeed',
] as const;

export type FeedKey = typeof FEED_KEYS[number];

export interface OptimizerOptions {
  alpha?: number; // 1.0 = min cost, 0.0 = min carbon, 0.5 = balanced
  facilityId?: string;
  electricityCostUsdKwh?: number;
  allowNpi?: boolean;
  allowGasDri?: boolean;
  allowPigIron?: boolean;
  allowCoalDri?: boolean;
  enforceScrapCap?: boolean;
  customScrapCap?: number;
  customScrapCr?: number;
  customScrapNi?: number;
  customScrapCu?: number;
  customScrapSn?: number;
}

export interface OptimizerResult {
  gradeId: string;
  isFeasible: boolean;
  statusMessage: string;
  alphaCostWeight: number;
  chargeSheetT: Record<string, number>;
  chargeSheetPct: Record<string, number>;
  finalChemistryPct: Record<string, number>;
  chargeCostUsdPerT: number;
  totalCo2TPerT: number;
  scrapSharePct: number;
  virginDriSharePct: number;
  ferroalloysSharePct: number;
  trampShadowPrices?: Record<string, number>;
  valueInUseUsdPerT?: Record<string, number>;
  scrapCeilingShadowPriceUsdPerT?: number;
  estimatedLimeKgPerT?: number;
  estimatedSlagKgPerT?: number;
  marketPricesUsdPerT?: Record<string, number>;
  electricityCostUsdKwh?: number;
}

export function getFeedSecVector(hasHotFecr: boolean): number[] {
  return [
    420.0,
    680.0,
    560.0,
    480.0,
    hasHotFecr ? -86.0 : 500.0,
    450.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    380.0,
  ];
}

export function getFeedMarketPrice(
  feedKey: FeedKey,
  c_electricity: number,
  hasHotFecr: boolean
): number {
  const idx = FEED_KEYS.indexOf(feedKey);
  const sec = getFeedSecVector(hasHotFecr)[idx] || 0;
  if (feedKey === 'niNPI') {
    return (
      RAW_MATERIALS.niNPI.typical_cost_usd_t *
        (RAW_MATERIALS.niNPI.main_element_pct / 100.0) +
      c_electricity * sec
    );
  }
  const baseCost = RAW_MATERIALS[feedKey]?.typical_cost_usd_t ?? 0;
  return baseCost + c_electricity * sec;
}

export interface ParetoPoint {
  alpha: number;
  costUsdPerT: number;
  co2TPerT: number;
  scrapPct: number;
  chargeSheetPct: Record<string, number>;
}

export interface ParetoFrontierResult {
  gradeId: string;
  frontierPoints: ParetoPoint[];
  leastCostPoint: ParetoPoint;
  leastCarbonPoint: ParetoPoint;
  maxCo2AbatementPotentialPct: number;
  costOfCarbonAbatementUsdPerTco2: number;
}

// Elemental fraction matrix: rows = [Cr, Ni, Mo, Mn, Cu, Fe, C, Si, Sn, P, S]
export function buildFeedMatrix(
  grade: Grade,
  customCr?: number,
  customNi?: number,
  customCu?: number,
  customSn?: number
) {
  const n_elems = 11;
  const n_feeds = FEED_KEYS.length;
  const mat: number[][] = Array.from({ length: n_elems }, () => new Array(n_feeds).fill(0));

  // 0: scrap
  mat[0][0] = (customCr !== undefined ? customCr : grade.cr) / 100.0;
  mat[1][0] = (customNi !== undefined ? customNi : grade.ni) / 100.0;
  mat[2][0] = grade.mo / 100.0;
  mat[3][0] = grade.mn / 100.0;
  mat[4][0] = (customCu !== undefined ? customCu : grade.cu) / 100.0;
  mat[6][0] = grade.c / 100.0;
  mat[7][0] = grade.si / 100.0;
  mat[8][0] = (customSn !== undefined ? customSn : 0.015) / 100.0;
  mat[9][0] = 0.030 / 100.0;
  mat[10][0] = 0.020 / 100.0;
  const otherSum = mat[0][0] + mat[1][0] + mat[2][0] + mat[3][0] + mat[4][0] + mat[6][0] + mat[7][0] + mat[8][0] + mat[9][0] + mat[10][0];
  mat[5][0] = Math.max(0, 1.0 - otherSum);

  // 1: coalDRI
  mat[0][1] = 0.0005; mat[1][1] = 0.0002; mat[3][1] = 0.001; mat[4][1] = 0.0001; mat[5][1] = 0.88; mat[6][1] = 0.02; mat[7][1] = 0.002; mat[8][1] = 0.00005; mat[9][1] = 0.0002; mat[10][1] = 0.00015;

  // 2: gasDRI
  mat[0][2] = 0.0005; mat[1][2] = 0.0002; mat[3][2] = 0.001; mat[4][2] = 0.0001; mat[5][2] = 0.92; mat[6][2] = 0.018; mat[7][2] = 0.0015; mat[8][2] = 0.00005; mat[9][2] = 0.00015; mat[10][2] = 0.0001;

  // 3: pigIron
  mat[0][3] = 0.0005; mat[1][3] = 0.0002; mat[3][3] = 0.003; mat[4][3] = 0.0002; mat[5][3] = 0.94; mat[6][3] = 0.042; mat[7][3] = 0.005; mat[8][3] = 0.00005; mat[9][3] = 0.0006; mat[10][3] = 0.0004;

  // 4: fecrStandard
  mat[0][4] = 0.55; mat[5][4] = 0.40; mat[6][4] = 0.07; mat[7][4] = 0.015; mat[9][4] = 0.00025; mat[10][4] = 0.00015;

  // 5: fecrLowC
  mat[0][5] = 0.65; mat[5][5] = 0.34; mat[6][5] = 0.001; mat[7][5] = 0.01; mat[9][5] = 0.00025; mat[10][5] = 0.00015;

  // 6: niStandard
  mat[1][6] = 0.998; mat[5][6] = 0.001; mat[6][6] = 0.0005;

  // 7: niClass1
  mat[1][7] = 0.998; mat[5][7] = 0.001; mat[6][7] = 0.0001;

  // 8: niNPI
  const npi_ef = RAW_MATERIALS.niNPI;
  mat[1][8] = npi_ef.main_element_pct / 100.0;
  mat[5][8] = npi_ef.iron_content_pct / 100.0;
  mat[6][8] = npi_ef.carbon_content_pct / 100.0;
  mat[7][8] = 0.012;
  mat[9][8] = 0.00035;
  mat[10][8] = 0.00025;

  // 9: femo
  mat[2][9] = 0.65; mat[5][9] = 0.33; mat[6][9] = 0.015; mat[7][9] = 0.005; mat[9][9] = 0.00025; mat[10][9] = 0.00015;

  // 10: feMn
  mat[3][10] = 0.75; mat[5][10] = 0.20; mat[6][10] = 0.065; mat[7][10] = 0.01; mat[9][10] = 0.00025; mat[10][10] = 0.00015;

  // 11: cuFeed
  mat[4][11] = 0.99; mat[5][11] = 0.005;

  // Process recoveries: [Cr, Ni, Mo, Mn, Cu, Fe, C, Si, Sn, P, S]
  // Recalibrated P recovery to 0.99: AOD does not remove 30% P without severe Cr oxidation
  const eta = [0.94, 0.98, 0.96, 0.90, 0.98, 0.97, 0.02, 0.50, 0.95, 0.99, 0.40];

  // Yield per feed: sum_i (mat[i][j] * eta[i])
  const yields = new Array(n_feeds).fill(0);
  for (let j = 0; j < n_feeds; j++) {
    for (let i = 0; i < n_elems; i++) {
      yields[j] += mat[i][j] * eta[i];
    }
  }

  return { mat, eta, yields };
}

export function solveChargeOptimizer(
  grade: Grade,
  options: OptimizerOptions = {}
): OptimizerResult {
  const alpha = options.alpha !== undefined ? Math.min(1.0, Math.max(0.0, options.alpha)) : 0.5;
  const allowNpi = options.allowNpi !== undefined ? options.allowNpi : true;
  const allowGasDri = options.allowGasDri !== undefined ? options.allowGasDri : true;
  const allowPigIron = options.allowPigIron !== undefined ? options.allowPigIron : true;
  const allowCoalDri = options.allowCoalDri !== undefined ? options.allowCoalDri : true;

  const { mat, eta, yields } = buildFeedMatrix(
    grade,
    options.customScrapCr,
    options.customScrapNi,
    options.customScrapCu,
    options.customScrapSn
  );

  let max_scrap_frac = grade.scrap_cap / 100.0;
  if (options.customScrapCap !== undefined) {
    max_scrap_frac = Math.min(1.0, Math.max(0.0, options.customScrapCap / 100.0));
  } else if (options.enforceScrapCap === false) {
    max_scrap_frac = 1.0;
  }

  const n_feeds = FEED_KEYS.length;

  const facilityId = options.facilityId || "jajpur";
  const facility = FACILITIES[facilityId] || FACILITIES["jajpur"];
  const has_hot_fecr = facility?.has_hot_fecr_charging ?? false;
  const c_electricity =
    options.electricityCostUsdKwh !== undefined
      ? options.electricityCostUsdKwh
      : facility?.electricity_cost_inr_kwh
      ? facility.electricity_cost_inr_kwh / 83.0
      : 0.053;
  const grid_ef = facility?.grid_emission_factor ?? 0.72;

  // Dynamic SEC vector (kWh/t feed): Scrap 420, Coal DRI 680, Gas DRI 560, Pig Iron 480, FeCr -86 (Jajpur hot charging) or 500 (cold solid FeCr), FeCr LC 450, Cu 380
  const sec_vec = getFeedSecVector(has_hot_fecr);

  // Cost and CO2 vectors
  const cost_vec = FEED_KEYS.map((k) => getFeedMarketPrice(k, c_electricity, has_hot_fecr));

  const co2_vec = [
    RAW_MATERIALS.scrap.co2_factor + (sec_vec[0] / 1000.0) * grid_ef,
    RAW_MATERIALS.coalDRI.co2_factor + (sec_vec[1] / 1000.0) * grid_ef,
    RAW_MATERIALS.gasDRI.co2_factor + (sec_vec[2] / 1000.0) * grid_ef,
    RAW_MATERIALS.pigIron.co2_factor + (sec_vec[3] / 1000.0) * grid_ef,
    RAW_MATERIALS.fecrStandard.co2_factor + (sec_vec[4] / 1000.0) * grid_ef,
    RAW_MATERIALS.fecrLowC.co2_factor + (sec_vec[5] / 1000.0) * grid_ef,
    RAW_MATERIALS.niStandard.co2_factor,
    RAW_MATERIALS.niClass1.co2_factor,
    RAW_MATERIALS.niNPI.co2_factor * (RAW_MATERIALS.niNPI.main_element_pct / 100.0),
    RAW_MATERIALS.femo.co2_factor,
    RAW_MATERIALS.feMn.co2_factor,
    RAW_MATERIALS.cuFeed.co2_factor + (sec_vec[11] / 1000.0) * grid_ef,
  ];

  const marketPricesUsdPerT: Record<string, number> = {};
  FEED_KEYS.forEach((k, idx) => {
    marketPricesUsdPerT[k] = Math.round(cost_vec[idx] * 100) / 100;
  });

  // Objective vector
  const c_obj = new Array(n_feeds).fill(0);
  for (let j = 0; j < n_feeds; j++) {
    const cost_norm = cost_vec[j] / 1200.0;
    const co2_norm = co2_vec[j] / 2.0;
    c_obj[j] = alpha * cost_norm + (1.0 - alpha) * co2_norm;
  }

  // Equality: sum_j yields[j] * x_j = 1.000
  const A_eq = [[...yields]];
  const b_eq = [1.000];

  // Inequality constraints
  const A_ub: number[][] = [];
  const b_ub: number[] = [];
  const row_labels: string[] = [];

  const cu_upper = grade.cu_min > 0.4 ? grade.cu_max : Math.min(grade.cu_max, grade.cu_tramp_cap);

  const targets = [
    { elem: 0, name: "Cr", min: grade.cr_min, max: grade.cr_max },
    { elem: 1, name: "Ni", min: grade.ni_min, max: grade.ni_max },
    { elem: 2, name: "Mo", min: grade.mo_min, max: grade.mo_max },
    { elem: 3, name: "Mn", min: grade.mn_min, max: grade.mn_max },
    { elem: 4, name: "Cu", min: grade.cu_min, max: cu_upper },
  ];

  for (const t of targets) {
    // Upper bound
    const row_max = new Array(n_feeds).fill(0);
    for (let j = 0; j < n_feeds; j++) row_max[j] = mat[t.elem][j] * eta[t.elem];
    A_ub.push(row_max);
    b_ub.push(t.max / 100.0);
    row_labels.push(`${t.name}_max`);

    // Lower bound
    if (t.min > 0) {
      const row_min = new Array(n_feeds).fill(0);
      for (let j = 0; j < n_feeds; j++) row_min[j] = -mat[t.elem][j] * eta[t.elem];
      A_ub.push(row_min);
      b_ub.push(-t.min / 100.0);
      row_labels.push(`${t.name}_min`);
    }
  }

  // Tramp element: Sn max
  const row_sn = new Array(n_feeds).fill(0);
  for (let j = 0; j < n_feeds; j++) row_sn[j] = mat[8][j] * eta[8];
  A_ub.push(row_sn);
  b_ub.push(grade.sn_tramp_cap / 100.0);
  row_labels.push("Sn_max");

  // P max
  const row_p = new Array(n_feeds).fill(0);
  for (let j = 0; j < n_feeds; j++) row_p[j] = mat[9][j] * eta[9];
  A_ub.push(row_p);
  b_ub.push(grade.p_max / 100.0);
  row_labels.push("P_max");

  // S max
  const row_s = new Array(n_feeds).fill(0);
  for (let j = 0; j < n_feeds; j++) row_s[j] = mat[10][j] * eta[10];
  A_ub.push(row_s);
  b_ub.push(grade.s_max / 100.0);
  row_labels.push("S_max");

  // Ferritic Ni tramp cap
  if (grade.family.includes('Ferritic')) {
    const row_ni_tramp = new Array(n_feeds).fill(0);
    for (let j = 0; j < n_feeds; j++) row_ni_tramp[j] = mat[1][j] * eta[1];
    A_ub.push(row_ni_tramp);
    b_ub.push(grade.ni_tramp_cap / 100.0);
    row_labels.push("Ni_tramp_max");
  }

  // Bounds
  const bounds: [number, number][] = [
    [0.0, max_scrap_frac], // scrap
    [0.0, allowCoalDri ? 1.5 : 0.0], // coalDRI
    [0.0, allowGasDri ? 1.5 : 0.0],
    [0.0, allowPigIron ? 1.5 : 0.0],
    [0.0, 1.5],            // fecrStandard
    [0.0, 1.5],            // fecrLowC
    [0.0, 1.5],            // niStandard
    [0.0, 1.5],            // niClass1
    [0.0, allowNpi ? 1.5 : 0.0],
    [0.0, 1.5],            // femo
    [0.0, 1.5],            // feMn
    [0.0, 0.10],           // cuFeed
  ];

  const sol = solveLP(c_obj, A_ub, b_ub, A_eq, b_eq, bounds);

  if (!sol.feasible) {
    return {
      gradeId: grade.id,
      isFeasible: false,
      statusMessage: sol.message,
      alphaCostWeight: alpha,
      chargeSheetT: {},
      chargeSheetPct: {},
      finalChemistryPct: {},
      chargeCostUsdPerT: 0,
      totalCo2TPerT: 0,
      scrapSharePct: 0,
      virginDriSharePct: 0,
      ferroalloysSharePct: 0,
      marketPricesUsdPerT,
      electricityCostUsdKwh: Math.round(c_electricity * 1000) / 1000,
    };
  }

  const x_opt = sol.x;
  const total_mass = x_opt.reduce((a, b) => a + b, 0);

  const charge_sheet_t: Record<string, number> = {};
  const charge_sheet_pct: Record<string, number> = {};

  FEED_KEYS.forEach((k, idx) => {
    if (x_opt[idx] > 1e-4) {
      charge_sheet_t[k] = Math.round(x_opt[idx] * 10000) / 10000;
      charge_sheet_pct[k] = Math.round((x_opt[idx] / total_mass) * 10000) / 100;
    }
  });

  // Chemistry in bath
  const recovered = new Array(11).fill(0);
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < n_feeds; j++) {
      recovered[i] += mat[i][j] * eta[i] * x_opt[j];
    }
  }
  const bath_mass = recovered.reduce((a, b) => a + b, 0);

  const final_chem: Record<string, number> = {
    Cr: Math.round((recovered[0] / bath_mass) * 10000) / 100,
    Ni: Math.round((recovered[1] / bath_mass) * 10000) / 100,
    Mo: Math.round((recovered[2] / bath_mass) * 10000) / 100,
    Mn: Math.round((recovered[3] / bath_mass) * 10000) / 100,
    Cu: Math.round((recovered[4] / bath_mass) * 10000) / 100,
    Fe: Math.round((recovered[5] / bath_mass) * 10000) / 100,
    Sn: Math.round((recovered[8] / bath_mass) * 100000) / 1000,
    P: Math.round((recovered[9] / bath_mass) * 100000) / 1000,
    S: Math.round((recovered[10] / bath_mass) * 100000) / 1000,
  };

  let total_cost = 0;
  let total_co2 = 0;
  for (let j = 0; j < n_feeds; j++) {
    total_cost += cost_vec[j] * x_opt[j];
    total_co2 += co2_vec[j] * x_opt[j];
  }

  const scrap_share = charge_sheet_pct.scrap || 0;
  const virgin_dri_share = (charge_sheet_pct.coalDRI || 0) + (charge_sheet_pct.gasDRI || 0) + (charge_sheet_pct.pigIron || 0);
  const ferroalloys_share = Math.max(0, Math.round((100.0 - scrap_share - virgin_dri_share) * 10) / 10);

  // Decoupled economic evaluation for Value-in-Use and Tramp Shadow Prices (Swerim RAWMATMIX)
  const c_cost = cost_vec.map((c) => c / 1200.0);
  const costSol = Math.abs(alpha - 1.0) < 1e-6 ? sol : solveLP(c_cost, A_ub, b_ub, A_eq, b_eq, bounds);

  const cost_scale = 1200.0;
  const cost_scale_per_001pct = cost_scale * 0.0001;

  const trampShadowPrices: Record<string, number> = {
    Cu: 0.0,
    Sn: 0.0,
    P: 0.0,
    S: 0.0,
  };
  if (grade.family.includes('Ferritic')) {
    trampShadowPrices.Ni = 0.0;
  }

  if (costSol.feasible && costSol.slackMarginals) {
    row_labels.forEach((lbl, idx) => {
      const m = costSol.slackMarginals![idx] || 0;
      const val = Math.round(Math.abs(m) * cost_scale_per_001pct * 10000) / 10000;
      if (lbl === "Cu_max") trampShadowPrices.Cu = val;
      else if (lbl === "Sn_max") trampShadowPrices.Sn = val;
      else if (lbl === "P_max") trampShadowPrices.P = val;
      else if (lbl === "S_max") trampShadowPrices.S = val;
      else if (lbl === "Ni_tramp_max") trampShadowPrices.Ni = val;
    });
  }

  // Scrap ceiling shadow price ($/t scrap allowed)
  let scrapCeilingShadowPrice = 0.0;
  if (costSol.feasible && costSol.slackMarginals && costSol.slackMarginals.length > row_labels.length) {
    const scrapSlack = costSol.slackMarginals[row_labels.length] || 0;
    scrapCeilingShadowPrice = Math.round(Math.abs(scrapSlack) * cost_scale * 100) / 100;
  }

  // Value-in-Use: ViU_j = c_purchase,j - r_j
  const valueInUseUsdPerT: Record<string, number> = {};
  if (costSol.feasible && costSol.reducedCosts) {
    FEED_KEYS.forEach((k, j) => {
      const r_norm = Math.max(0, costSol.reducedCosts![j] || 0);
      const r_usd = r_norm * cost_scale;
      const viu = cost_vec[j] - r_usd;
      valueInUseUsdPerT[k] = Math.round(viu * 100) / 100;
    });
  }

  // Slag & Lime flux estimation (Swerim RAWMATMIX Flux Engine)
  let si_oxidized_kg = 0;
  for (let j = 0; j < n_feeds; j++) {
    si_oxidized_kg += mat[7][j] * (1.0 - eta[7]) * x_opt[j] * 1000.0;
  }
  const sio2_generated_kg = si_oxidized_kg * (60.084 / 28.0855);
  const lime_demand_kg = (sio2_generated_kg * 1.90) / 0.95;
  const estimated_slag_kg = (sio2_generated_kg * 1.90) + sio2_generated_kg + 45.0;

  return {
    gradeId: grade.id,
    isFeasible: true,
    statusMessage: "Optimized globally using continuous Two-Phase Simplex LP.",
    alphaCostWeight: alpha,
    chargeSheetT: charge_sheet_t,
    chargeSheetPct: charge_sheet_pct,
    finalChemistryPct: final_chem,
    chargeCostUsdPerT: Math.round(total_cost * 100) / 100,
    totalCo2TPerT: Math.round(total_co2 * 1000) / 1000,
    scrapSharePct: Math.round(scrap_share * 10) / 10,
    virginDriSharePct: Math.round(virgin_dri_share * 10) / 10,
    ferroalloysSharePct: ferroalloys_share,
    trampShadowPrices,
    valueInUseUsdPerT,
    scrapCeilingShadowPriceUsdPerT: scrapCeilingShadowPrice,
    estimatedLimeKgPerT: Math.round(lime_demand_kg * 100) / 100,
    estimatedSlagKgPerT: Math.round(estimated_slag_kg * 100) / 100,
    marketPricesUsdPerT,
    electricityCostUsdKwh: Math.round(c_electricity * 1000) / 1000,
  };
}

export function computeParetoFrontier(
  grade: Grade,
  steps: number = 50,
  options: OptimizerOptions = {}
): ParetoFrontierResult {
  const frontierPoints: ParetoPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const alpha = i / steps;
    const sol = solveChargeOptimizer(grade, { ...options, alpha });
    if (sol.isFeasible) {
      frontierPoints.push({
        alpha: Math.round(alpha * 100) / 100,
        costUsdPerT: sol.chargeCostUsdPerT,
        co2TPerT: sol.totalCo2TPerT,
        scrapPct: sol.scrapSharePct,
        chargeSheetPct: sol.chargeSheetPct,
      });
    }
  }

  if (frontierPoints.length === 0) {
    throw new Error(`Unable to generate Pareto Frontier: LP solver infeasible for grade ${grade.id}`);
  }

  // Find least carbon and least cost points
  let least_carbon_pt = frontierPoints[0];
  let least_cost_pt = frontierPoints[0];

  for (const pt of frontierPoints) {
    if (pt.co2TPerT < least_carbon_pt.co2TPerT) least_carbon_pt = pt;
    if (pt.costUsdPerT < least_cost_pt.costUsdPerT) least_cost_pt = pt;
  }

  const co2_delta = least_cost_pt.co2TPerT - least_carbon_pt.co2TPerT;
  const cost_delta = least_carbon_pt.costUsdPerT - least_cost_pt.costUsdPerT;

  const max_abatement = least_cost_pt.co2TPerT > 0 ? (co2_delta / least_cost_pt.co2TPerT) * 100.0 : 0;
  const abatement_cost = co2_delta > 0.01 ? cost_delta / co2_delta : 0;

  return {
    gradeId: grade.id,
    frontierPoints,
    leastCostPoint: least_cost_pt,
    leastCarbonPoint: least_carbon_pt,
    maxCo2AbatementPotentialPct: Math.round(max_abatement * 10) / 10,
    costOfCarbonAbatementUsdPerTco2: Math.round(abatement_cost * 10) / 10,
  };
}
