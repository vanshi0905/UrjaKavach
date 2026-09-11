"""
Dual Financial Liability Engine: EU CBAM and India CCTS.
Translates physical decarbonization into balance-sheet economics:
1. EU Carbon Border Adjustment Mechanism (CBAM):
   - Calculates import certificate liability (€/tonne exported and annual exposure)
   - Benchmarks against EU ETS free allocation phase-out (2026-2034)
   - Evaluates risk on JSL's ~600,000 MT/year European export corridor.
2. India Carbon Credit Trading Scheme (CCTS / BEE):
   - Computes Carbon Credit Certificate (CCC) surplus or deficit (₹/tonne produced)
   - Evaluates annual EBITDA impact across JSL's 3.0 MTPA domestic capacity.
"""

from dataclasses import dataclass
from typing import Dict, Optional
from jsl_carbon_engine.core.emissions import EmissionsResult


# Default Market Benchmarks & Price Assumptions (2026 baseline)
DEFAULT_EU_ETS_PRICE_EUR_T = 80.0       # €80 / tCO2 EU Allowance (EUA) price
DEFAULT_EU_CBAM_BENCHMARK_TCO2 = 0.284  # tCO2/t EU ETS Scrap-EAF benchmark for stainless flat
DEFAULT_INDIA_CCTS_TARGET_TCO2 = 0.8222 # tCO2e/t BEE June 2026 draft notification for JSL Kalinga Nagar (Jajpur)
DEFAULT_INDIA_CCTS_BASELINE_TCO2 = 0.8792 # tCO2e/t baseline
DEFAULT_INDIA_CCC_PRICE_INR_T = 1500.0  # ₹1,500 / tCO2 Carbon Credit Certificate trading price
DEFAULT_EUR_TO_INR = 92.0               # Exchange rate 1 EUR = 92 INR
DEFAULT_JSL_EU_EXPORTS_TPA = 600000.0   # 600,000 MTPA exported to EU
DEFAULT_JSL_TOTAL_CAPACITY_TPA = 3000000.0  # 3.0 MTPA total JSL group capacity
DEFAULT_EU_CBAM_CSCF = 0.87
DEFAULT_CBAM_PHASE_IN_2026 = 0.025


@dataclass
class FinancialResult:
    # EU CBAM Metrics
    cbam_embedded_intensity_tco2: float     # Scope 1 + Precursors (tCO2/t) - excludes Scope 2
    see_including_scope2: float             # scope1 + scope2 + scope3
    cbam_eu_benchmark_tco2: float           # EU ETS free allocation threshold
    cbam_cscf: float
    cbam_phase_in_factor_2026: float
    cbam_sefa_tco2: float
    cbam_taxable_gap_full_tco2: float
    cbam_taxable_carbon_gap_tco2: float     # 2026 taxable carbon per tonne (SEE - Benchmark * 0.975)
    cbam_tariff_eur_per_t: float            # Specific tariff (€/t exported) in 2026
    cbam_cash_tariff_2026_eur_per_t: float
    cbam_tariff_2034_unhedged_eur_per_t: float
    cbam_article9_deduction_eur_per_t: float
    cbam_trajectory_eur_per_t: Dict[int, float]
    cbam_tariff_inr_per_t: float            # Specific tariff (₹/t exported) in 2026
    cbam_annual_liability_eur: float        # Total annual liability in 2026 (€)
    cbam_liability_2026: float              # 2026 liability under EU SEFA formula (€)
    cbam_liability_2034_full: float         # 2034 liability at 100% phase-in (€)
    cbam_annual_liability_inr_cr: float     # Total annual liability in 2026 (₹ Crore)
    # India CCTS Metrics
    ccts_scope12_intensity_tco2: float      # Scope 1 + Scope 2 intensity (tCO2/t)
    ccts_target_tco2: float                 # Regulatory compliance target (0.8222 for Jajpur)
    ccts_carbon_delta_tco2: float           # Positive = surplus credits, Negative = deficit
    ccts_status: str                        # 'SURPLUS_CREDIT' or 'DEFICIT_LIABILITY'
    ccts_value_inr_per_t: float             # Value per tonne (positive = gain, negative = penalty)
    ccts_surplus_base: float                # CCTS surplus base
    ccts_annual_ebitda_inr_cr: float        # Annual group balance sheet impact (₹ Crore)
    ccts_trajectory_tco2: Dict[int, float]  # CCTS statutory annual reduction trajectories
    # Combined Summary
    financial_summary: str
    cbam_tariff_2034_eur_per_t: float = 0.0  # Specific tariff (€/t exported) at 100% phase-in (2034)


def compute_financials(
    emissions: EmissionsResult,
    eu_ets_price_eur: float = DEFAULT_EU_ETS_PRICE_EUR_T,
    eu_cbam_benchmark: float = DEFAULT_EU_CBAM_BENCHMARK_TCO2,
    cscf: float = DEFAULT_EU_CBAM_CSCF,
    cbam_phase_in_2026: float = DEFAULT_CBAM_PHASE_IN_2026,
    india_ccts_target: Optional[float] = None,
    india_ccc_price_inr: float = DEFAULT_INDIA_CCC_PRICE_INR_T,
    domestic_carbon_tax_eur: float = 0.0,  # Credit for domestic carbon price paid in India
    eu_exports_tpa: float = DEFAULT_JSL_EU_EXPORTS_TPA,
    total_capacity_tpa: float = DEFAULT_JSL_TOTAL_CAPACITY_TPA,
    eur_to_inr: float = DEFAULT_EUR_TO_INR,
) -> FinancialResult:
    """
    Computes EU CBAM duty and India CCTS financial valuations from emissions data.
    """
    if india_ccts_target is None:
        try:
            from jsl_carbon_engine.config.jsl_facilities import get_facility
            fac = get_facility(emissions.facility_id)
            target_ccts = getattr(fac, "ccts_target_tco2", DEFAULT_INDIA_CCTS_TARGET_TCO2)
            baseline_ccts = getattr(fac, "ccts_baseline_tco2", DEFAULT_INDIA_CCTS_BASELINE_TCO2)
        except Exception:
            target_ccts = DEFAULT_INDIA_CCTS_TARGET_TCO2
            baseline_ccts = DEFAULT_INDIA_CCTS_BASELINE_TCO2
    else:
        target_ccts = india_ccts_target
        baseline_ccts = DEFAULT_INDIA_CCTS_BASELINE_TCO2

    ccts_trajectory = {
        2024: baseline_ccts,
        2025: round(baseline_ccts - (baseline_ccts - target_ccts) * 0.5, 4),
        2026: target_ccts,
        2027: round(target_ccts * 0.985, 4),
        2028: round(target_ccts * (0.985**2), 4),
        2030: round(target_ccts * (0.985**4), 4)
    }

    # 1. EU CBAM Tariff (€/t exported)
    # Under CBAM definitive regime for steel (Annex II), specific embedded emissions (SEE) = Scope 1 + Precursors (Scope 3).
    # Scope 2 (electricity) is strictly excluded for steel.
    # Under IPCC Guidelines / ISO 19694-6, SAF emission factors already account for carbon in tapped metal.
    # Carbon entering the AOD converter from FeCr is legitimately Scope 1 and is NOT subtracted.
    see = emissions.scope1_direct_tco2 + emissions.scope3_precursors_tco2
    cbam_embedded_intensity = see
    see_including_scope2 = emissions.scope1_direct_tco2 + emissions.scope2_electricity_tco2 + emissions.scope3_precursors_tco2

    # 2. India CCTS / BEE Compliance (₹/t produced)
    # CCTS monitors direct Scope 1 + indirect Scope 2 intensity against installation target
    s12_intensity = emissions.scope1_direct_tco2 + emissions.scope2_electricity_tco2
    ccts_delta = target_ccts - s12_intensity  # positive = beat target!

    if ccts_delta >= 0:
        ccts_status = "SURPLUS_CREDIT (Draft Target)"
        ccts_value_inr = ccts_delta * india_ccc_price_inr
    else:
        ccts_status = "DEFICIT_LIABILITY (Draft Target)"
        ccts_value_inr = ccts_delta * india_ccc_price_inr  # negative value represents liability

    ccts_surplus_base = ccts_value_inr
    annual_ccts_inr_cr = (ccts_value_inr * total_capacity_tpa) / 1e7

    # CBAM Article 9 strictly limits deductions to the carbon price paid on *embedded* emissions (Scope 1 + Scope 3).
    # Since CCTS covers Scope 1 + 2 and NOT Scope 3, we can only deduct the Scope 1 portion.
    article9_deduction_eur = (emissions.scope1_direct_tco2 * india_ccc_price_inr) / eur_to_inr
    
    # Legal EU SEFA (Specific Embedded Free Allocation) formula:
    # SEFA_2026 = eu_cbam_benchmark * 0.975 * CSCF
    sefa_2026 = eu_cbam_benchmark * 0.975 * cscf
    taxable_gap_full = max(0.0, see - sefa_2026)
    
    # 2026 cash tariff = taxable_gap_full * €80 * 0.025
    gross_cbam_tariff_2026 = taxable_gap_full * eu_ets_price_eur * cbam_phase_in_2026
    net_cbam_tariff_2026 = max(0.0, gross_cbam_tariff_2026 - article9_deduction_eur)
    net_cbam_tariff_inr = net_cbam_tariff_2026 * eur_to_inr

    cbam_liability_2026 = net_cbam_tariff_2026 * eu_exports_tpa

    # By 2034: 100% phase-out of free allocation (benchmark free allocation = 0.0)
    taxable_carbon_2034 = max(0.0, see - 0.0)
    gross_cbam_tariff_2034 = taxable_carbon_2034 * eu_ets_price_eur
    net_cbam_tariff_2034 = max(0.0, gross_cbam_tariff_2034 - article9_deduction_eur)
    cbam_liability_2034_full = net_cbam_tariff_2034 * eu_exports_tpa
    
    cbam_trajectory = {
        2026: max(0.0, taxable_gap_full * eu_ets_price_eur * 0.025 - article9_deduction_eur),
        2027: max(0.0, taxable_gap_full * eu_ets_price_eur * 0.050 - article9_deduction_eur),
        2028: max(0.0, taxable_gap_full * eu_ets_price_eur * 0.250 - article9_deduction_eur),
        2030: max(0.0, taxable_gap_full * eu_ets_price_eur * 0.500 - article9_deduction_eur),
        2034: net_cbam_tariff_2034,
    }

    annual_cbam_eur = cbam_liability_2026
    annual_cbam_inr_cr = (annual_cbam_eur * eur_to_inr) / 1e7  # 1 Crore = 10,000,000 INR


    # 3. Plain English Executive Summary
    if net_cbam_tariff_2026 > 0:
        cbam_desc = f"CBAM 2026 CASH duty = €{net_cbam_tariff_2026:.2f}/t | 2034 UNHEDGED EXPOSURE = €{gross_cbam_tariff_2034:.2f}/t"
    else:
        cbam_desc = f"CBAM 2026 CASH duty = €{net_cbam_tariff_2026:.2f}/t | 2034 UNHEDGED EXPOSURE = €{gross_cbam_tariff_2034:.2f}/t"

    if ccts_delta >= 0:
        ccts_desc = f"CCTS net generator: +₹{ccts_value_inr:.1f}/t (+₹{annual_ccts_inr_cr:.1f} Cr/yr EBITDA gain vs target {target_ccts:.4f})"
    else:
        ccts_desc = f"CCTS compliance penalty: -₹{abs(ccts_value_inr):.1f}/t (-₹{abs(annual_ccts_inr_cr):.1f} Cr/yr liability vs target {target_ccts:.4f})"

    summary = f"{cbam_desc} | {ccts_desc}"

    return FinancialResult(
        cbam_embedded_intensity_tco2=round(cbam_embedded_intensity, 3),
        see_including_scope2=round(see_including_scope2, 3),
        cbam_eu_benchmark_tco2=round(eu_cbam_benchmark, 3),
        cbam_cscf=cscf,
        cbam_phase_in_factor_2026=cbam_phase_in_2026,
        cbam_sefa_tco2=round(sefa_2026, 3),
        cbam_taxable_gap_full_tco2=round(taxable_gap_full, 3),
        cbam_taxable_carbon_gap_tco2=round(taxable_gap_full * cbam_phase_in_2026, 3),
        cbam_tariff_eur_per_t=round(net_cbam_tariff_2026, 2),
        cbam_cash_tariff_2026_eur_per_t=round(net_cbam_tariff_2026, 2),
        cbam_tariff_2034_unhedged_eur_per_t=round(gross_cbam_tariff_2034, 2),
        cbam_article9_deduction_eur_per_t=round(article9_deduction_eur, 2),
        cbam_trajectory_eur_per_t={y: round(v, 2) for y, v in cbam_trajectory.items()},
        cbam_tariff_inr_per_t=round(net_cbam_tariff_inr, 2),
        cbam_annual_liability_eur=round(annual_cbam_eur, 2),
        cbam_liability_2026=round(cbam_liability_2026, 2),
        cbam_liability_2034_full=round(cbam_liability_2034_full, 2),
        cbam_annual_liability_inr_cr=round(annual_cbam_inr_cr, 2),
        ccts_scope12_intensity_tco2=round(s12_intensity, 3),
        ccts_target_tco2=round(target_ccts, 4),
        ccts_carbon_delta_tco2=round(ccts_delta, 3),
        ccts_status=ccts_status,
        ccts_value_inr_per_t=round(ccts_value_inr, 2),
        ccts_surplus_base=round(max(0.0, ccts_delta * total_capacity_tpa), 2),
        ccts_annual_ebitda_inr_cr=round(annual_ccts_inr_cr, 2),
        ccts_trajectory_tco2=ccts_trajectory,
        financial_summary=summary,
        cbam_tariff_2034_eur_per_t=round(net_cbam_tariff_2034, 2),
    )
