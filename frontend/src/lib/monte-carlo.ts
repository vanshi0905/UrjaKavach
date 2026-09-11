/**
 * Monte Carlo Stochastic Scrap Perturbation Engine
 * Simulates scrap variability across 500-1,000 industrial heats:
 * - Correlated Cr-Ni variation (rho = 0.70)
 * - Correlated Cu-Sn tramp variation (rho = 0.50)
 * - Computes P10 / P50 / P90 percentiles, histogram distributions, and compliance probability
 */

import { Grade } from './grades';
import { solveChargeOptimizer, OptimizerOptions } from './optimizer';

export interface MonteCarloHistogramBin {
  binStart: number;
  binEnd: number;
  count: number;
  label: string;
}

export interface MonteCarloResult {
  gradeId: string;
  runs: number;
  compliantRuns: number;
  complianceProbabilityPct: number;
  p10CostUsdPerT: number;
  p50CostUsdPerT: number;
  p90CostUsdPerT: number;
  p10Co2TPerT: number;
  p50Co2TPerT: number;
  p90Co2TPerT: number;
  costHistogram: MonteCarloHistogramBin[];
  carbonHistogram: MonteCarloHistogramBin[];
}

function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function buildHistogram(values: number[], numBins: number = 10): MonteCarloHistogramBin[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const binWidth = span / numBins;

  const bins: MonteCarloHistogramBin[] = Array.from({ length: numBins }, (_, i) => {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    return {
      binStart: Math.round(binStart * 100) / 100,
      binEnd: Math.round(binEnd * 100) / 100,
      count: 0,
      label: `${(binStart).toFixed(1)}–${(binEnd).toFixed(1)}`,
    };
  });

  for (const val of values) {
    let bIndex = Math.floor((val - min) / binWidth);
    if (bIndex >= numBins) bIndex = numBins - 1;
    if (bIndex < 0) bIndex = 0;
    bins[bIndex].count++;
  }

  return bins;
}

export function runMonteCarloSimulation(
  grade: Grade,
  runs: number = 1000,
  alpha: number = 0.5,
  options: OptimizerOptions = {}
): MonteCarloResult {
  const std_cr = 0.8;
  const std_ni = 0.4;
  const std_cu = 0.04;
  const std_sn = 0.003;

  const corr_cr_ni = 0.70;
  const corr_cu_sn = 0.50;

  const base_cu = grade.cu > 0 ? grade.cu : 0.15;
  const base_sn = 0.015;
  const cu_upper = grade.cu_min > 0.4 ? grade.cu_max : Math.min(grade.cu_max, grade.cu_tramp_cap);

  const costs: number[] = [];
  const carbons: number[] = [];
  let compliantRuns = 0;

  for (let i = 0; i < runs; i++) {
    // Correlated sampling via Cholesky / bivariate transform
    const z1 = randomNormal();
    const z2 = randomNormal();
    const cr_p = Math.max(0, grade.cr + std_cr * z1);
    const ni_p = Math.max(0, grade.ni + std_ni * (corr_cr_ni * z1 + Math.sqrt(1 - corr_cr_ni * corr_cr_ni) * z2));

    const z3 = randomNormal();
    const z4 = randomNormal();
    const cu_p = Math.max(0, base_cu + std_cu * z3);
    const sn_p = Math.max(0, base_sn + std_sn * (corr_cu_sn * z3 + Math.sqrt(1 - corr_cu_sn * corr_cu_sn) * z4));

    const sol = solveChargeOptimizer(grade, {
      ...options,
      alpha,
      customScrapCr: cr_p,
      customScrapNi: ni_p,
      customScrapCu: cu_p,
      customScrapSn: sn_p,
    });

    if (sol.isFeasible) {
      const chem = sol.finalChemistryPct;
      const cu_val = chem.Cu || 0;
      const cu_comp = grade.cu_min <= 0 ? cu_val <= cu_upper + 0.05 : (grade.cu_min - 0.05 <= cu_val && cu_val <= cu_upper + 0.05);
      let is_compliant = (
        (chem.Cr >= grade.cr_min - 0.05 && chem.Cr <= grade.cr_max + 0.1) &&
        (chem.Ni >= grade.ni_min - 0.05 && chem.Ni <= grade.ni_max + 0.1) &&
        (chem.Mo >= grade.mo_min - 0.05 && chem.Mo <= grade.mo_max + 0.1) &&
        (chem.Mn >= grade.mn_min - 0.05 && chem.Mn <= grade.mn_max + 0.1) &&
        cu_comp &&
        ((chem.Sn || 0) <= grade.sn_tramp_cap + 0.002) &&
        ((chem.P || 0) <= (grade.p_max || 0.040) + 0.002) &&
        ((chem.S || 0) <= (grade.s_max || 0.030) + 0.002)
      );
      if (grade.family.includes('Ferritic')) {
        is_compliant = is_compliant && ((chem.Ni || 0) <= grade.ni_tramp_cap + 0.05);
      }

      if (is_compliant) {
        compliantRuns++;
        costs.push(sol.chargeCostUsdPerT);
        carbons.push(sol.totalCo2TPerT);
      }
    }
  }

  const complianceProb = runs > 0 ? Math.round((compliantRuns / runs) * 1000) / 10 : 0;

  return {
    gradeId: grade.id,
    runs,
    compliantRuns,
    complianceProbabilityPct: complianceProb,
    p10CostUsdPerT: Math.round(percentile(costs, 10) * 100) / 100,
    p50CostUsdPerT: Math.round(percentile(costs, 50) * 100) / 100,
    p90CostUsdPerT: Math.round(percentile(costs, 90) * 100) / 100,
    p10Co2TPerT: Math.round(percentile(carbons, 10) * 1000) / 1000,
    p50Co2TPerT: Math.round(percentile(carbons, 50) * 1000) / 1000,
    p90Co2TPerT: Math.round(percentile(carbons, 90) * 1000) / 1000,
    costHistogram: buildHistogram(costs, 8),
    carbonHistogram: buildHistogram(carbons, 8),
  };
}
