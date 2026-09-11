"""
Automated Unit Tests for Dynamic Thermodynamic Enthalpy Model.
Verifies:
1. Dynamic EAF SEC scales with scrap vs DRI ratio (monotonically increases with DRI).
2. Scrap melting sensible heat (~420 kWh/t) vs Coal DRI (~680 kWh/t).
3. JSL Jajpur molten FeCr hot-charging sensible heat credit (~200 kWh/t).
4. Refining electrical energy (AOD 150 kWh/t vs AOD+VOD 250 kWh/t).
"""

import pytest
from jsl_carbon_engine.core.grades import get_grade
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics


def test_eaf_sec_monotonic_scaling_with_dri():
    """Verify that EAF SEC increases as DRI replaces scrap."""
    grade = get_grade("J304")

    # High scrap charge (80% scrap)
    mb_high_scrap = compute_mass_balance(grade=grade, scrap_pct=80.0)
    thermo_high_scrap = compute_thermodynamics(mass_balance=mb_high_scrap, fe_source="coalDRI")

    # Low scrap charge (20% scrap, 80% virgin DRI)
    mb_low_scrap = compute_mass_balance(grade=grade, scrap_pct=20.0)
    thermo_low_scrap = compute_thermodynamics(mass_balance=mb_low_scrap, fe_source="coalDRI")

    # 100% virgin charge (0% scrap)
    mb_zero_scrap = compute_mass_balance(grade=grade, scrap_pct=0.0)
    thermo_zero_scrap = compute_thermodynamics(mass_balance=mb_zero_scrap, fe_source="coalDRI")

    assert thermo_high_scrap.eaf_sec_kwh_t_liquid < thermo_low_scrap.eaf_sec_kwh_t_liquid
    assert thermo_low_scrap.eaf_sec_kwh_t_liquid < thermo_zero_scrap.eaf_sec_kwh_t_liquid

    # High scrap EAF SEC should be around 430-470 kWh/t
    assert 400.0 <= thermo_high_scrap.eaf_sec_kwh_t_liquid <= 480.0
    # Zero scrap coal DRI SEC should be > 600 kWh/t
    assert thermo_zero_scrap.eaf_sec_kwh_t_liquid >= 600.0


def test_jajpur_molten_fecr_hot_charging_credit():
    """Verify sensible heat credit when charging liquid FeCr at Jajpur."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=40.0)

    # Without hot charging (Hisar or cold FeCr charge)
    thermo_cold = compute_thermodynamics(mass_balance=mb, hot_fecr_charging=False)

    # With hot charging (Jajpur captive SAF)
    thermo_hot = compute_thermodynamics(mass_balance=mb, hot_fecr_charging=True)

    assert thermo_hot.hot_fecr_credit_applied is True
    assert thermo_hot.hot_fecr_savings_kwh_t >= 80.0
    assert thermo_hot.eaf_sec_kwh_t_liquid < thermo_cold.eaf_sec_kwh_t_liquid
    assert abs(thermo_cold.eaf_sec_kwh_t_liquid - thermo_hot.eaf_sec_kwh_t_liquid - thermo_hot.hot_fecr_savings_kwh_t) < 1.0


def test_refining_routes_energy():
    """Verify AOD vs AOD+VOD electrical energy difference."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=60.0)

    thermo_aod = compute_thermodynamics(mass_balance=mb, refining_route="aod")
    thermo_vod = compute_thermodynamics(mass_balance=mb, refining_route="aodvod")

    assert thermo_aod.refining_sec_kwh_t_liquid == 150.0
    assert thermo_vod.refining_sec_kwh_t_liquid == 250.0
    assert thermo_vod.total_elec_kwh_per_t_finished > thermo_aod.total_elec_kwh_per_t_finished


def test_jajpur_hot_fecr_credit_scales_with_fecr_mass():
    """
    Critical Bug Fix Verification:
    Verify that hot FeCr credit is physically proportional to the mass of molten FeCr charged,
    preventing the thermodynamic impossibility of getting 160 kWh credit for 50 kg FeCr.
    """
    grade = get_grade("J304")
    # Low scrap (20% scrap) -> high FeCr (~0.29 t FeCr)
    mb_low_scrap = compute_mass_balance(grade=grade, scrap_pct=20.0)
    thermo_low_scrap = compute_thermodynamics(mass_balance=mb_low_scrap, hot_fecr_charging=True)

    # High scrap (85% scrap) -> low FeCr (~0.05 t FeCr)
    mb_high_scrap = compute_mass_balance(grade=grade, scrap_pct=85.0)
    thermo_high_scrap = compute_thermodynamics(mass_balance=mb_high_scrap, hot_fecr_charging=True)

    # Low scrap should get near the 200 kWh/t ceiling
    assert thermo_low_scrap.hot_fecr_savings_kwh_t >= 100.0
    # High scrap must have savings scaled down to ~40-50 kWh/t
    assert thermo_high_scrap.hot_fecr_savings_kwh_t < 60.0
    assert thermo_high_scrap.hot_fecr_savings_kwh_t < thermo_low_scrap.hot_fecr_savings_kwh_t * 0.35


def test_alloys_melting_sec_contribution():
    """
    Verify that FeMn, FeMo, and Cu additions properly contribute to the EAF enthalpy balance.
    """
    grade_j4 = get_grade("J4")  # 9.25% Mn -> large FeMn demand
    mb_j4 = compute_mass_balance(grade=grade_j4, scrap_pct=20.0)
    thermo_j4 = compute_thermodynamics(mass_balance=mb_j4)

    assert thermo_j4.breakdown_kwh["eaf_alloys_kwh"] > 100.0, (
        f"Expected FeMn + FeCr melting energy > 100 kWh, got {thermo_j4.breakdown_kwh['eaf_alloys_kwh']}"
    )

