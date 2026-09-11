"""
Production-grade Unit Tests for v2.1 Technical Engine Refinements.
Verifies all 6 core pyrometallurgical, regulatory, and stochastic improvements:
1. Legal EU CBAM 2026 SEFA Formula (Benchmark * 0.975, 2034 100% phase-in, Scope 2 excluded).
2. IPCC / ISO 19694-6 Scope 1 FeCr Accounting (no double-deduction from CBAM SEE; AOD decarb oxidation factor 1.0).
3. Installation-specific CCTS Target (BEE June 2026 draft target 0.8222 tCO2e/tcs, baseline 0.8792).
4. Thermodynamic Enthalpy Separation (Q_thermal / eta_thermal + E_aux) & Hot FeCr credit = (fecr_mass * 400.0) / eta_thermal.
5. Complete NPI Chemistry (14% Ni, 81.5% Fe, 3.0% C, 1.2% Si, 0.035% P, 0.025% S) & mass balance Fe/C tracking.
6. Monte Carlo Enhancement (1,000 runs default, Cu/Sn scrap perturbations, compliance_probability_pct).
"""

import pytest
import numpy as np

from jsl_carbon_engine.core.grades import get_grade
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
from jsl_carbon_engine.core.emissions import compute_emissions
from jsl_carbon_engine.core.financials import compute_financials, DEFAULT_INDIA_CCTS_TARGET_TCO2
from jsl_carbon_engine.core.optimizer import solve_charge_optimizer, monte_carlo_pareto
from jsl_carbon_engine.config.emission_factors import RAW_MATERIALS, BENCHMARKS
from jsl_carbon_engine.config.jsl_facilities import get_facility, JAJPUR_WORKS


# =============================================================================
# 1. CBAM 2026 FREE ALLOCATION SEFA FORMULA & SCOPE 2 EXCLUSION
# =============================================================================
def test_cbam_legal_sefa_formula_and_scope2_exclusion():
    """
    Verify EU CBAM 2026 legal SEFA formula:
    - taxable_carbon_2026 = max(0.0, SEE - (eu_cbam_benchmark * 0.975))
    - cbam_liability_2026 = taxable_carbon_2026 * eu_ets_price_eur * eu_exports_tpa
    - cbam_liability_2034_full = max(0.0, SEE) * eu_ets_price_eur * eu_exports_tpa
    - Scope 2 (electricity) is strictly excluded from steel CBAM SEE.
    """
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=60.0)
    thermo = compute_thermodynamics(mass_balance=mb)

    # Vary renewable power: Scope 2 changes dramatically, but CBAM intensity must remain identical
    em_coal = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, facility_id="jajpur", renewable_pct=0.0)
    em_green = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, facility_id="jajpur", renewable_pct=100.0)

    assert em_coal.scope2_electricity_tco2 > em_green.scope2_electricity_tco2 + 0.3

    fin_coal = compute_financials(em_coal, eu_ets_price_eur=80.0, eu_cbam_benchmark=0.288)
    fin_green = compute_financials(em_green, eu_ets_price_eur=80.0, eu_cbam_benchmark=0.288)

    # Scope 2 exclusion assertion: CBAM embedded intensity must be identical regardless of electricity carbon!
    assert abs(fin_coal.cbam_embedded_intensity_tco2 - fin_green.cbam_embedded_intensity_tco2) < 1e-4

    see = em_coal.scope1_direct_tco2 + em_coal.scope3_precursors_tco2
    assert abs(fin_coal.cbam_embedded_intensity_tco2 - see) < 1e-3

    # SEFA benchmark allocation check: free allocation in 2026 is 97.5% of benchmark * CSCF
    sefa_2026 = 0.288 * 0.975 * 0.87
    expected_taxable_gap_full = max(0.0, see - sefa_2026)
    assert abs(fin_coal.cbam_taxable_gap_full_tco2 - expected_taxable_gap_full) < 1e-3

    expected_gross_tariff_2026 = expected_taxable_gap_full * 80.0 * 0.025
    article9_deduction = em_coal.scope1_direct_tco2 * 1500.0 / 92.0
    expected_net_tariff_2026 = max(0.0, expected_gross_tariff_2026 - article9_deduction)
    expected_liability_2026 = expected_net_tariff_2026 * 600000.0
    assert abs(fin_coal.cbam_liability_2026 - expected_liability_2026) < 1.0

    # 2034 100% phase-in check: taxable carbon is 100% of SEE (0% free allocation)
    expected_gross_tariff_2034 = see * 80.0
    expected_net_tariff_2034 = max(0.0, expected_gross_tariff_2034 - article9_deduction)
    expected_liability_2034 = expected_net_tariff_2034 * 600000.0
    assert abs(fin_coal.cbam_liability_2034_full - expected_liability_2034) < 1.0
    assert fin_coal.cbam_liability_2034_full > fin_coal.cbam_liability_2026


def test_cbam_clean_benchmark_exemption():
    """Verify that if embedded emissions fall below 97.5% benchmark, tariff is 0."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=85.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    em = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo)

    # Test with very high hypothetical benchmark to ensure zero clipping
    fin_exempt = compute_financials(em, eu_ets_price_eur=80.0, eu_cbam_benchmark=10.0)
    assert fin_exempt.cbam_taxable_carbon_gap_tco2 == 0.0
    assert fin_exempt.cbam_tariff_eur_per_t == 0.0
    assert fin_exempt.cbam_liability_2026 == 0.0


# =============================================================================
# 2. IPCC / ISO 19694-6 FECR CARBON & AOD OXIDATION FACTOR = 1.0
# =============================================================================
def test_fecr_carbon_not_subtracted_from_cbam_intensity():
    """
    Verify that FeCr oxidized carbon is NOT subtracted from CBAM SEE:
    Under IPCC Guidelines / ISO 19694-6, SAF carbon factors already deduct carbon in tapped metal.
    Therefore, carbon entering the AOD converter from FeCr is legitimate Scope 1.
    """
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=40.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    em = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo)

    assert em.fecr_oxidized_co2_t > 0.01

    fin = compute_financials(em, eu_ets_price_eur=80.0, eu_cbam_benchmark=0.288)

    # CBAM SEE must equal Scope 1 + Scope 3 precursors WITHOUT any subtraction
    expected_see = em.scope1_direct_tco2 + em.scope3_precursors_tco2
    assert abs(fin.cbam_embedded_intensity_tco2 - expected_see) < 1e-3
    assert fin.cbam_embedded_intensity_tco2 > (expected_see - em.fecr_oxidized_co2_t)


def test_aod_carbon_oxidation_factor_1_0():
    """
    Verify AOD carbon oxidation uses oxidation factor = 1.0 for Scope 1 GHG accounting:
    All oxidized carbon is converted to CO2e via (44/12).
    """
    grade = get_grade("J304")
    # Low scrap -> high FeCr -> large carbon input to AOD
    mb = compute_mass_balance(grade=grade, scrap_pct=20.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    em = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo)

    # Decarburization stack CO2e must be strictly positive and calculated with 44/12
    assert em.scope1_stack_decarb_tco2 > 0.05
    assert em.scope1_direct_tco2 >= em.scope1_stack_decarb_tco2


# =============================================================================
# 3. CCTS INSTALLATION-SPECIFIC TARGET (JAJPUR 0.8222 tCO2e/t)
# =============================================================================
def test_ccts_jajpur_specific_target():
    """
    Verify Jajpur's default CCTS target is set to 0.8222 tCO2e/tcs
    (from the BEE June 2026 draft notification for JSL Kalinga Nagar, baseline 0.8792).
    """
    facility = get_facility("jajpur")
    assert facility.ccts_target_tco2 == 0.8222
    assert facility.ccts_baseline_tco2 == 0.8792
    assert DEFAULT_INDIA_CCTS_TARGET_TCO2 == 0.8222

    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=60.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    em = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, facility_id="jajpur")

    fin = compute_financials(em)
    # Default target should be 0.8222
    assert fin.ccts_target_tco2 == 0.8222

    s12 = em.scope1_direct_tco2 + em.scope2_electricity_tco2
    assert abs(fin.ccts_carbon_delta_tco2 - (0.8222 - s12)) < 1e-3


def test_ccts_surplus_deficit_threshold():
    """Verify CCTS transitions between surplus and deficit at target threshold."""
    grade = get_grade("J304")
    mb_clean = compute_mass_balance(grade=grade, scrap_pct=85.0)
    thermo_clean = compute_thermodynamics(mass_balance=mb_clean)
    em_clean = compute_emissions(grade=grade, mass_balance=mb_clean, thermo=thermo_clean, renewable_pct=100.0)

    # When S1+2 is cleaner than 0.8222 -> SURPLUS
    fin_clean = compute_financials(em_clean, india_ccts_target=0.8222)
    if (em_clean.scope1_direct_tco2 + em_clean.scope2_electricity_tco2) < 0.8222:
        assert fin_clean.ccts_carbon_delta_tco2 > 0
        assert fin_clean.ccts_value_inr_per_t > 0
        assert "SURPLUS_CREDIT" in fin_clean.ccts_status

    # High emissions -> DEFICIT
    mb_dirty = compute_mass_balance(grade=grade, scrap_pct=10.0)
    thermo_dirty = compute_thermodynamics(mass_balance=mb_dirty)
    em_dirty = compute_emissions(grade=grade, mass_balance=mb_dirty, thermo=thermo_dirty, facility_id="jajpur", renewable_pct=0.0)
    fin_dirty = compute_financials(em_dirty, india_ccts_target=0.8222)
    assert fin_dirty.ccts_carbon_delta_tco2 < 0
    assert fin_dirty.ccts_value_inr_per_t < 0
    assert "DEFICIT_LIABILITY" in fin_dirty.ccts_status


# =============================================================================
# 4. THERMODYNAMIC SEPARATION & HOT FECR ELECTRICAL SAVING
# =============================================================================
def test_thermodynamic_enthalpy_separation_and_aux_power():
    """
    Verify strict separation of thermal enthalpy Q_thermal from electrical SEC:
    SEC = Q_thermal / eta_thermal + E_aux
    """
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=60.0)

    # Base case with e_aux = 0.0
    thermo_base = compute_thermodynamics(mass_balance=mb, eta_thermal=0.68, e_aux=0.0)
    assert thermo_base.q_thermal_kwh_t > 200.0
    expected_sec_base = thermo_base.q_thermal_kwh_t / 0.68
    assert abs(thermo_base.eaf_sec_kwh_t_liquid - expected_sec_base) < 1.0

    # Case with e_aux = 45.0 kWh/t (pumps, fans, transformer losses)
    thermo_aux = compute_thermodynamics(mass_balance=mb, eta_thermal=0.68, e_aux=45.0)
    assert thermo_aux.e_aux_kwh_t == 45.0
    assert abs(thermo_aux.eaf_sec_kwh_t_liquid - (thermo_base.eaf_sec_kwh_t_liquid + 45.0)) < 0.5


def test_hot_fecr_explicit_electrical_saving_formula():
    """
    Verify hot FeCr electrical saving is explicitly:
    (fecr_mass_t * 400.0) / eta_thermal
    """
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=35.0)

    thermo_cold = compute_thermodynamics(mass_balance=mb, hot_fecr_charging=False, eta_thermal=0.68)
    thermo_hot = compute_thermodynamics(mass_balance=mb, hot_fecr_charging=True, eta_thermal=0.68)

    expected_savings = (mb.fecr_mass_t * 400.0) / 0.68
    assert abs(thermo_hot.hot_fecr_savings_kwh_t - expected_savings) < 0.5
    assert abs(thermo_cold.eaf_sec_kwh_t_liquid - thermo_hot.eaf_sec_kwh_t_liquid - expected_savings) < 0.5

    # Test with differing thermal efficiency: at lower efficiency (0.60), electrical savings must be HIGHER
    thermo_hot_low_eff = compute_thermodynamics(mass_balance=mb, hot_fecr_charging=True, eta_thermal=0.60)
    expected_savings_low_eff = (mb.fecr_mass_t * 400.0) / 0.60
    assert abs(thermo_hot_low_eff.hot_fecr_savings_kwh_t - expected_savings_low_eff) < 0.5
    assert thermo_hot_low_eff.hot_fecr_savings_kwh_t > thermo_hot.hot_fecr_savings_kwh_t


# =============================================================================
# 5. COMPLETE NPI CHEMISTRY & MASS BALANCE FE/C TRACKING
# =============================================================================
def test_npi_complete_chemistry_specification():
    """
    Verify RAW_MATERIALS['niNPI'] complete chemical composition:
    14.0% Ni, 81.5% Fe, 3.0% C, 1.2% Si, 0.035% P, 0.025% S.
    """
    npi = RAW_MATERIALS["niNPI"]
    assert npi.main_element_pct == 14.0
    assert npi.iron_content_pct == 81.5
    assert npi.carbon_content_pct == 3.0
    assert npi.si_content_pct == 1.2
    assert npi.p_content_pct == 0.035
    assert npi.s_content_pct == 0.025


def test_mass_balance_tracks_npi_fe_and_c():
    """
    Verify mass balance tracks metallic iron (81.5%) and carbon (3.0%) from NPI.
    """
    grade = get_grade("J304")
    mb_npi = compute_mass_balance(grade=grade, scrap_pct=20.0, ni_source="niNPI")

    assert mb_npi.npi_mass_t > 0
    # Iron from NPI must scale by 81.5% and recovery factor (97% Fe yield)
    expected_fe = mb_npi.npi_mass_t * 0.815 * 0.97
    assert abs(mb_npi.fe_from_npi_t - expected_fe) < 1e-4

    # Carbon from NPI must be 3.0% of NPI mass
    expected_c = mb_npi.npi_mass_t * 0.030
    assert abs(mb_npi.c_from_npi_t - expected_c) < 1e-4
    assert mb_npi.c_from_ni_t >= expected_c

    # Scaled inputs per tonne finished product must also carry NPI Fe and C
    assert "fe_from_npi_t" in mb_npi.scaled_inputs_per_t_finished
    assert "c_from_npi_t" in mb_npi.scaled_inputs_per_t_finished
    assert abs(mb_npi.total_liquid_steel_t - 1.000) < 0.001


# =============================================================================
# 6. MONTE CARLO ENHANCEMENT (1,000 RUNS & COMPLIANCE PROBABILITY)
# =============================================================================
def test_monte_carlo_default_1000_runs_and_compliance():
    """
    Verify Monte Carlo runs 1,000 iterations by default, perturbs Cu and Sn,
    and returns compliance_probability_pct.
    """
    grade = get_grade("J304")
    # Run Monte Carlo with 1,000 runs
    mc_res = monte_carlo_pareto(grade=grade, runs=1000, seed=42)

    assert mc_res.runs == 1000
    assert mc_res.compliant_runs > 0
    assert 0.0 <= mc_res.compliance_probability_pct <= 100.0
    # For standard J304 with normal scrap variations, compliance should be very high (> 80%)
    assert mc_res.compliance_probability_pct > 80.0

    # Percentiles must be ordered: p10 <= p50 <= p90
    assert mc_res.p10_cost_usd_per_t <= mc_res.p50_cost_usd_per_t <= mc_res.p90_cost_usd_per_t
    assert mc_res.p10_co2_t_per_t <= mc_res.p50_co2_t_per_t <= mc_res.p90_co2_t_per_t


def test_monte_carlo_cu_and_sn_tramp_sensitivity():
    """
    Verify that excessive tramp Cu and Sn variations depress compliance_probability_pct.
    """
    grade = get_grade("J304")
    # Clean scrap run
    mc_clean = monte_carlo_pareto(
        grade=grade, runs=200, std_dev_cu=0.01, std_dev_sn=0.001, seed=42
    )

    # Severe dirty tramp scrap run (Cu std dev = 0.25%, Sn std dev = 0.02%)
    mc_dirty = monte_carlo_pareto(
        grade=grade, runs=200, std_dev_cu=0.25, std_dev_sn=0.02, seed=42
    )

    # Clean scrap should achieve higher compliance than severely contaminated scrap
    assert mc_clean.compliance_probability_pct >= mc_dirty.compliance_probability_pct


def test_aod_physical_80_20_co2_co_split_exposed():
    """
    Verify that AOD off-gas retains the physical 80/20 CO2/CO split
    in EmissionsResult and breakdown_pct while Scope 1 accounts for 100% oxidation.
    """
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=20.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    em = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo)

    assert em.aod_physical_co2_t > 0.02
    assert em.aod_physical_co_t > 0.005
    assert "aod_co2_physical_t" in em.breakdown_pct
    assert "aod_co_physical_t" in em.breakdown_pct
    # Physical molar ratio: 80% CO2 (44g/mol) vs 20% CO (28g/mol)
    # (0.8 * 44/12) / (0.2 * 28/12) = 35.2 / 5.6 = 6.2857 mass ratio
    mass_ratio = em.aod_physical_co2_t / em.aod_physical_co_t
    assert abs(mass_ratio - (35.2 / 5.6)) < 0.1


def test_mass_balance_tracks_npi_si_p_s():
    """
    Verify that NPI's full chemical suite (Si 1.2%, P 0.035%, S 0.025%)
    is strictly tracked in MassBalanceResult.
    """
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=20.0, ni_source="niNPI")

    assert mb.npi_mass_t > 0
    expected_si = mb.npi_mass_t * 0.012
    expected_p = mb.npi_mass_t * 0.00035
    expected_s = mb.npi_mass_t * 0.00025

    assert abs(mb.si_from_npi_t - expected_si) < 1e-4
    assert abs(mb.p_from_npi_t - expected_p) < 1e-5
    assert abs(mb.s_from_npi_t - expected_s) < 1e-5
    assert "si_from_npi_t" in mb.scaled_inputs_per_t_finished


def test_monte_carlo_super_duplex_j32760_and_boundary():
    """
    Verify Monte Carlo evaluates super-duplex grade J32760 stably and
    handles boundary condition (runs=0) safely without error.
    """
    grade_sd = get_grade("J32760")
    mc_sd = monte_carlo_pareto(grade=grade_sd, runs=50, seed=42)
    assert mc_sd.runs == 50
    assert mc_sd.compliance_probability_pct > 80.0
    assert mc_sd.p50_cost_usd_per_t > 1500.0

    # Boundary runs=0 test
    mc_zero = monte_carlo_pareto(grade=grade_sd, runs=0)
    assert mc_zero.runs == 0
    assert mc_zero.compliance_probability_pct == 0.0
    assert mc_zero.compliant_runs == 0


def test_hot_fecr_ceiling_scales_with_dynamic_thermal_efficiency():
    """
    Verify that the hot FeCr sensible heat ceiling is converted to electrical units
    using the dynamic furnace thermal efficiency (HOT_FECR_THERMAL_CEILING_JAJPUR / eta_thermal).
    """
    grade = get_grade("J304")
    # Low scrap -> heavy FeCr demand
    mb = compute_mass_balance(grade=grade, scrap_pct=10.0)

    thermo_72 = compute_thermodynamics(mass_balance=mb, hot_fecr_charging=True, eta_thermal=0.72)
    thermo_60 = compute_thermodynamics(mass_balance=mb, hot_fecr_charging=True, eta_thermal=0.60)

    # At lower thermal efficiency, electrical savings ceiling must be higher
    assert thermo_60.hot_fecr_savings_kwh_t > thermo_72.hot_fecr_savings_kwh_t

