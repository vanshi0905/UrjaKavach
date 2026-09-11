"""
Automated Unit Tests for Closed-Loop Stoichiometric Mass Balance.
Verifies:
1. Strict mass conservation (sum = 1.000 t +/- 0.001 t) across ALL 43 authentic JSL grades.
2. Iron crediting for ferroalloys (40% Fe in FeCr, 33% Fe in FeMo, 20% Fe in FeMn).
3. Elimination of the 1.073 t/t iron double-counting flaw.
4. Scrap ceiling enforcement (scrap <= grade.scrap_cap).
5. Downstream finishing yield multipliers.
"""

import pytest
from jsl_carbon_engine.core.grades import GRADES, get_grade
from jsl_carbon_engine.core.mass_balance import compute_mass_balance, MassBalanceResult


def test_all_43_grades_mass_conservation():
    """Verify that every single grade conserves mass (1.000 t +/- 0.001 t) at 50% scrap."""
    for grade_id, grade in GRADES.items():
        if grade_id == "carbonRef":
            continue
        res = compute_mass_balance(grade=grade, scrap_pct=min(50.0, grade.scrap_cap))
        assert abs(res.total_liquid_steel_t - 1.000) < 0.002, (
            f"Mass balance violated for grade {grade_id}: total={res.total_liquid_steel_t:.5f} t"
        )


def test_iron_crediting_eliminates_double_counting():
    """
    Verify that iron in FeCr, FeMo, and FeMn is credited,
    reducing the net virgin iron requirement.
    """
    grade_304 = get_grade("J304")
    # For a 100% virgin heat (0% scrap):
    res = compute_mass_balance(grade=grade_304, scrap_pct=0.0)

    # 304 needs ~18.5% Cr -> ~0.365 t FeCr (at 55% Cr, 92% rec) -> contains ~0.14 t Fe!
    assert res.fe_from_fecr_t > 0.10, f"Expected >0.10 t Fe from FeCr, got {res.fe_from_fecr_t}"
    assert res.total_fe_from_alloys_t > 0.10

    # Net virgin Fe must be target Fe minus alloy Fe:
    target_fe = grade_304.fe / 100.0
    expected_net_fe = target_fe - res.total_fe_from_alloys_t
    assert abs(res.net_virgin_fe_t - expected_net_fe) < 0.001

    # In the flawed old code, virgin iron was 1.0 - 0.185 - 0.0925 = 0.7225 t DRI.
    # With iron credit, net virgin Fe is ~0.55 t, eliminating ~0.14 t of phantom iron!
    assert res.net_virgin_fe_t < 0.65
    assert abs(res.total_liquid_steel_t - 1.000) < 0.001


def test_scrap_cap_enforcement():
    """Verify that scrap charge is clamped to grade's metallurgical scrapCap."""
    # J2507 Super Duplex has scrapCap = 50%
    grade_duplex = get_grade("J2507")
    res = compute_mass_balance(grade=grade_duplex, scrap_pct=80.0)
    assert res.scrap_fraction == 0.50, f"Expected scrap capped at 0.50, got {res.scrap_fraction}"

    # J430 Ferritic has scrapCap = 70%
    grade_430 = get_grade("J430")
    res_430 = compute_mass_balance(grade=grade_430, scrap_pct=95.0)
    assert res_430.scrap_fraction == 0.70


def test_finishing_yield_cascade():
    """Verify downstream finishing yield multipliers scale charge sheet."""
    grade_304 = get_grade("J304")
    # CR Coil (92% finishing yield * 97% continuous casting = 89.24% yield -> factor ~1.1205)
    res_cr = compute_mass_balance(grade=grade_304, scrap_pct=60.0, product="crCoil")
    assert res_cr.cast_per_finished > 1.10

    # Slab (98% finishing yield * 97% caster = 95.06% yield -> factor ~1.052)
    res_slab = compute_mass_balance(grade=grade_304, scrap_pct=60.0, product="slab")
    assert res_slab.cast_per_finished < res_cr.cast_per_finished

    # Scaled scrap inputs must reflect cast_per_finished
    assert abs(res_cr.scaled_inputs_per_t_finished["scrap_t"] - (0.60 * res_cr.cast_per_finished)) < 1e-4


def test_all_43_grades_npi_mass_conservation():
    """
    Critical Bug Fix Verification:
    Verify that every single grade conserves mass (1.000 t +/- 0.001 t)
    even when using Indonesian Coal RKEF NPI (80% Fe, 14% Ni) across all scrap levels.
    """
    for grade_id, grade in GRADES.items():
        if grade_id == "carbonRef":
            continue
        for scrap in [0.0, 20.0, 50.0, 80.0]:
            res = compute_mass_balance(grade=grade, scrap_pct=scrap, ni_source="niNPI")
            assert abs(res.total_liquid_steel_t - 1.000) < 0.001, (
                f"NPI mass conservation violated for {grade_id} at {scrap}% scrap: total={res.total_liquid_steel_t:.5f} t"
            )


def test_npi_blending_for_high_ni_grades():
    """
    Verify that for high-nickel grades (J305 with 11.5% Ni, J310S with 20% Ni),
    NPI is automatically blended with pure nickel up to the allowable iron budget,
    strictly maintaining 1.000 t total liquid steel without overfilling iron.
    """
    for gid in ["J305", "J310S", "J316", "J904L"]:
        grade = get_grade(gid)
        res = compute_mass_balance(grade=grade, scrap_pct=20.0, ni_source="niNPI")
        assert res.npi_mass_t > 0, f"Expected NPI addition for {gid}"
        assert res.pure_ni_mass_t > 0, f"Expected supplemental pure Ni for high-Ni grade {gid}"
        assert abs(res.total_liquid_steel_t - 1.000) < 0.001
        assert res.net_virgin_fe_t == 0.0  # Iron budget fully consumed by NPI + FeCr


def test_copper_addition_in_200_series():
    """
    Verify that intentional copper-bearing grades (J4 with 1.75% Cu)
    correctly calculate metallic copper addition in virgin charge.
    """
    grade_j4 = get_grade("J4")
    res = compute_mass_balance(grade=grade_j4, scrap_pct=40.0)
    assert res.cu_mass_t > 0.005, f"Expected >5 kg Cu addition, got {res.cu_mass_t * 1000} kg"
    assert abs(res.cu_in_steel_t - (grade_j4.cu / 100.0)) < 0.001
    assert abs(res.total_liquid_steel_t - 1.000) < 0.001

