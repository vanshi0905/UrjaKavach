
import pytest
from jsl_carbon_engine.core.emissions import compute_emissions, EmissionsResult
from jsl_carbon_engine.core.financials import compute_financials
from jsl_carbon_engine.core.optimizer import solve_charge_optimizer, monte_carlo_pareto
from jsl_carbon_engine.core.grades import get_grade

from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics

@pytest.fixture
def j304_emissions():
    grade = get_grade('J304')
    mb = compute_mass_balance(grade=grade, scrap_pct=60.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    return compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, facility_id="jajpur")

def test_cbam_2026_cash_tariff_is_small(j304_emissions):
    fin = compute_financials(j304_emissions, india_ccc_price_inr=0.0)
    assert fin.cbam_cash_tariff_2026_eur_per_t < 10.0
    assert fin.cbam_cash_tariff_2026_eur_per_t > 0.0

def test_cbam_cscf_applied_to_sefa(j304_emissions):
    fin = compute_financials(j304_emissions, eu_cbam_benchmark=0.288, cscf=0.87)
    # SEFA = 0.288 * 0.975 * 0.87 = 0.244296
    assert abs(fin.cbam_sefa_tco2 - 0.244) < 0.01

def test_cbam_2034_unhedged_exposure(j304_emissions):
    fin = compute_financials(j304_emissions)
    assert fin.cbam_tariff_2034_unhedged_eur_per_t > 150.0

def test_cbam_trajectory_has_5_waypoints(j304_emissions):
    fin = compute_financials(j304_emissions)
    keys = list(fin.cbam_trajectory_eur_per_t.keys())
    assert keys == [2026, 2027, 2028, 2030, 2034]

def test_cbam_trajectory_is_monotonically_increasing(j304_emissions):
    fin = compute_financials(j304_emissions)
    t = fin.cbam_trajectory_eur_per_t
    assert t[2026] <= t[2027] <= t[2028] <= t[2030] <= t[2034]

def test_cbam_article9_deduction_reduces_net_tariff(j304_emissions):
    fin_no_deduction = compute_financials(j304_emissions, india_ccc_price_inr=0)
    fin_deduction = compute_financials(j304_emissions, india_ccc_price_inr=1500.0)
    assert fin_deduction.cbam_cash_tariff_2026_eur_per_t < fin_no_deduction.cbam_cash_tariff_2026_eur_per_t
    assert fin_deduction.cbam_tariff_2034_unhedged_eur_per_t == fin_no_deduction.cbam_tariff_2034_unhedged_eur_per_t

def test_monte_carlo_correlated_sampling_still_feasible():
    grade = get_grade('J304')
    mc = monte_carlo_pareto(grade, runs=50, alpha_cost_weight=0.5)
    assert mc.compliance_probability_pct > 90.0

def test_lp_p_s_constraints_for_npi_grades():
    grade = get_grade('J4')
    sol = solve_charge_optimizer(grade, facility_id='jajpur', allow_npi=True)
    assert sol.is_feasible
    assert 'P' in sol.final_chemistry_pct
    assert 'S' in sol.final_chemistry_pct
    assert sol.final_chemistry_pct['P'] <= 0.041
    assert sol.final_chemistry_pct['S'] <= 0.031
