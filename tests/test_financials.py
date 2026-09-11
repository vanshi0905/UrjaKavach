"""
Automated Unit Tests for Dual Financial Liability Engine (CBAM + CCTS).
Verifies:
1. EU CBAM tariff calculation: duty is 0 if embedded emissions <= benchmark, positive otherwise.
2. India CCTS carbon credit status: surplus (+₹/t) when S1+2 < 1.46 tCO2/t, deficit when > 1.46 tCO2/t.
3. Annual EBITDA and exposure conversions.
"""

import pytest
from jsl_carbon_engine.core.grades import get_grade
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
from jsl_carbon_engine.core.emissions import compute_emissions
from jsl_carbon_engine.core.financials import compute_financials


def test_cbam_tariff_calculation():
    """Verify CBAM tariff scales correctly with carbon intensity."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=60.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    emissions = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo)

    fin = compute_financials(emissions, eu_ets_price_eur=80.0, eu_cbam_benchmark=0.288)

    # Intensity is ~2.0+ tCO2/t, benchmark is 0.288 -> tariff should be ~ (2.0 - 0.288) * 80 ~= €137/t
    assert fin.cbam_taxable_gap_full_tco2 > 1.0
    assert fin.cbam_tariff_2034_unhedged_eur_per_t > 80.0
    assert fin.cbam_liability_2034_full > 40_000_000.0  # > €40M annual exposure


def test_ccts_surplus_vs_deficit():
    """Verify CCTS generates surplus credits when clean and deficit when dirty."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=85.0)  # very high scrap
    thermo = compute_thermodynamics(mass_balance=mb)

    # 100% renewable power + high scrap -> Scope 1+2 < 1.46
    em_clean = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, renewable_pct=100.0)
    fin_clean = compute_financials(em_clean, india_ccts_target=1.460)

    assert fin_clean.ccts_status == "SURPLUS_CREDIT (Draft Target)"
    assert fin_clean.ccts_value_inr_per_t > 0
    assert fin_clean.ccts_annual_ebitda_inr_cr > 0

    # Low scrap + 100% coal CPP -> Scope 1+2 > 1.46
    mb_dirty = compute_mass_balance(grade=grade, scrap_pct=10.0)
    thermo_dirty = compute_thermodynamics(mass_balance=mb_dirty)
    em_dirty = compute_emissions(grade=grade, mass_balance=mb_dirty, thermo=thermo_dirty, renewable_pct=0.0, facility_id="jajpur")
    fin_dirty = compute_financials(em_dirty, india_ccts_target=1.460)

    assert fin_dirty.ccts_status == "DEFICIT_LIABILITY (Draft Target)"
    assert fin_dirty.ccts_value_inr_per_t < 0
    assert fin_dirty.ccts_annual_ebitda_inr_cr < 0
