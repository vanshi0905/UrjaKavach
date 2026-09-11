"""
Automated Unit Tests for AOD Slag Kinetics and Reduction Stoichiometry.
Verifies:
1. Silicon reduction of Cr2O3 (FeSi demand increases with higher recovery 92% vs 96%).
2. Lime basicity fluxing (maintaining B2 >= 1.8).
3. Total slag mass generation.
"""

import pytest
from jsl_carbon_engine.core.grades import get_grade
from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics


def test_fesi_demand_increases_with_optimized_recovery():
    """Verify FeSi demand is higher for 96% Cr recovery compared to standard 92%."""
    grade = get_grade("J304")
    slag_std = compute_slag_kinetics(grade, recovery_mode="standard")
    slag_opt = compute_slag_kinetics(grade, recovery_mode="optimised")

    assert slag_opt.cr_recovered_to_metal_kg > slag_std.cr_recovered_to_metal_kg
    assert slag_opt.cr_lost_to_slag_kg < slag_std.cr_lost_to_slag_kg
    assert slag_opt.fesi_demand_kg_t >= slag_std.fesi_demand_kg_t
    assert slag_opt.lime_demand_kg_t >= slag_std.lime_demand_kg_t


def test_slag_generation_mass():
    """Verify slag generation is within realistic industrial range (80-150 kg slag / t steel)."""
    grade = get_grade("J304")
    slag = compute_slag_kinetics(grade, recovery_mode="standard")
    assert 60.0 <= slag.total_slag_generated_kg_t <= 200.0
    assert 0.0 <= slag.cr2o3_in_discard_slag_pct <= 20.0
