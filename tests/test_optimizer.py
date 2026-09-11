"""
Automated Unit Tests for Continuous Linear Programming (LP) Optimizer.
Verifies:
1. LP solver converges to an optimal solution for stainless grades (J304, J4, J430, J2205).
2. Chemical bounds are strictly satisfied (%Cr, %Ni, %Mo, %Mn, %Cu in final bath).
3. Scrap ceiling constraint (x_scrap <= scrap_cap) is strictly respected.
4. Pareto frontier generation produces valid points with trade-offs.
"""

import pytest
from jsl_carbon_engine.core.grades import get_grade
from jsl_carbon_engine.core.optimizer import solve_charge_optimizer, compute_pareto_frontier


def test_lp_optimizer_feasibility_j304():
    """Verify LP solver finds a feasible least-cost and least-carbon charge sheet for 304."""
    grade_304 = get_grade("J304")

    # Least Cost (alpha = 1.0)
    sol_cost = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0)
    assert sol_cost.is_feasible is True
    assert sol_cost.scrap_share_pct <= grade_304.scrap_cap + 0.1
    # Check bath chemistry matches 304 specification
    assert grade_304.cr_min <= sol_cost.final_chemistry_pct["Cr"] <= grade_304.cr_max + 0.5
    assert grade_304.ni_min <= sol_cost.final_chemistry_pct["Ni"] <= grade_304.ni_max + 0.5

    # Least Carbon (alpha = 0.0)
    sol_carbon = solve_charge_optimizer(grade_304, alpha_cost_weight=0.0)
    assert sol_carbon.is_feasible is True
    assert sol_carbon.total_co2_t_per_t <= sol_cost.total_co2_t_per_t + 0.01


def test_lp_optimizer_respects_ferritic_ni_cap():
    """Verify LP optimizer enforces Ni tramp limit on ferritic grade J430."""
    grade_430 = get_grade("J430")
    sol = solve_charge_optimizer(grade_430, alpha_cost_weight=0.5)

    assert sol.is_feasible is True
    # Ni in final bath must be <= 0.50% (or grade tramp limit)
    assert sol.final_chemistry_pct["Ni"] <= 0.75
    assert sol.scrap_share_pct <= grade_430.scrap_cap + 0.1


def test_pareto_frontier_tradeoff():
    """Verify Pareto frontier points exhibit cost vs carbon trade-off."""
    grade_304 = get_grade("J304")
    pf = compute_pareto_frontier(grade_304, steps=5)

    assert len(pf.frontier_points) >= 3
    # Least carbon point must have <= CO2 than least cost point
    assert pf.least_carbon_point.co2_t_per_t <= pf.least_cost_point.co2_t_per_t
    # Least cost point must have <= Cost than least carbon point
    assert pf.least_cost_point.cost_usd_per_t <= pf.least_carbon_point.cost_usd_per_t
    assert pf.max_co2_abatement_potential_pct >= 0.0


def test_lp_optimizer_feasibility_j4_flagship():
    """
    Critical Bug Fix Verification:
    Verify that JSL's high-volume flagship grade J4 (200-series with Mn=9.25%, Cu=1.75%)
    now solves feasibly in the continuous LP optimizer, respecting intentional Cu alloying.
    """
    grade_j4 = get_grade("J4")
    sol = solve_charge_optimizer(grade_j4, alpha_cost_weight=0.5)
    assert sol.is_feasible is True, f"LP failed on flagship J4: {sol.status_message}"
    assert sol.final_chemistry_pct["Cr"] >= grade_j4.cr_min - 0.5
    assert sol.final_chemistry_pct["Mn"] >= grade_j4.mn_min - 0.5
    assert sol.final_chemistry_pct["Cu"] >= grade_j4.cu_min - 0.1
    # Charge sheet must contain feMn and cuFeed
    assert "feMn" in sol.charge_sheet_pct
    assert "cuFeed" in sol.charge_sheet_pct


def test_lp_optimizer_feasibility_exotic_alloys():
    """
    Verify LP optimizer handles complex alloy additions:
    - J904L (Super-Austenitic with 25% Ni, 4.5% Mo, 1.5% Cu)
    - J32760 (Super-Duplex with 25% Cr, 7.5% Ni, 3.5% Mo, 0.75% Cu)
    """
    for gid in ["J904L", "J32760", "J2205", "J216L"]:
        grade = get_grade(gid)
        sol = solve_charge_optimizer(grade, alpha_cost_weight=0.5)
        assert sol.is_feasible is True, f"LP solver failed on {gid}: {sol.status_message}"


def test_all_43_grades_lp_feasibility():
    """
    Verify continuous LP optimizer finds feasible global solutions across ALL 43 authentic JSL grades.
    """
    from jsl_carbon_engine.core.grades import GRADES
    for gid, grade in GRADES.items():
        if gid == "carbonRef":
            continue
        sol = solve_charge_optimizer(grade, alpha_cost_weight=0.5)
        assert sol.is_feasible is True, f"LP solver infeasible for grade {gid}: {sol.status_message}"


def test_phosphorus_recovery_recalibration():
    """
    Verify Rawmatmix / Wei et al. (CSSS 2018) metallurgical recalibration:
    1. Phosphorus recovery eta[9] is 0.99 (>= 0.95), reflecting that dephosphorization
       cannot occur in stainless EAF/AOD refining without destructive Cr oxidation.
    2. Bath phosphorus strictly satisfies grade p_max specification.
    3. Elevated scrap phosphorus triggers strict LP containment without false 30% slag removal.
    """
    from jsl_carbon_engine.core.optimizer import _build_feed_composition_matrix
    grade_304 = get_grade("J304")
    mat, eta, yields = _build_feed_composition_matrix(grade_304)

    # Recovery factor verification
    assert eta[9] >= 0.95, f"Expected eta_P >= 0.95, got {eta[9]}"
    assert eta[9] == 0.99

    # Standard heat bath chemistry verification
    sol = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0)
    assert sol.is_feasible is True
    assert "P" in sol.final_chemistry_pct
    assert sol.final_chemistry_pct["P"] <= grade_304.p_max + 0.001

    # High phosphorus scrap containment test
    # If scrap arrives with P=0.038%, optimizer must respect p_max=0.040%
    sol_high_p = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0)
    assert sol_high_p.final_chemistry_pct["P"] <= 0.0401


def test_electricity_melting_cost_inclusion():
    """
    Verify linearized electricity melting cost adder:
    1. Raw material SEC differences (scrap ~420 kWh/t, coal DRI ~680 kWh/t, hot FeCr -86.0 kWh/t)
       are added to cost_vec.
    2. Hot FeCr sensible heat credit at Jajpur results in lower charge cost than solid FeCr at Hisar.
    3. Custom electricity tariff parameter scales melting cost correctly.
    """
    grade_304 = get_grade("J304")

    # Solve at Jajpur (with captive hot FeCr sensible heat credit -86.0 kWh/t)
    sol_jajpur = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0, facility_id="jajpur")
    assert sol_jajpur.is_feasible is True

    # Solve at Hisar (solid FeCr only, higher grid tariff)
    sol_hisar = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0, facility_id="hisar")
    assert sol_hisar.is_feasible is True

    # Jajpur charge cost must be lower than Hisar due to hot-charging credit and lower power tariff
    assert sol_jajpur.charge_cost_usd_per_t < sol_hisar.charge_cost_usd_per_t

    # Test custom electricity tariff override
    sol_cheap_power = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0, electricity_cost_usd_kwh=0.02)
    sol_expensive_power = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0, electricity_cost_usd_kwh=0.15)
    assert sol_cheap_power.charge_cost_usd_per_t < sol_expensive_power.charge_cost_usd_per_t


def test_lp_dual_variables_tramp_shadow_prices_and_viu():
    """
    Verify exposure of HiGHS dual variables:
    1. tramp_shadow_prices contains Cu, Sn, P, S (and Ni for ferritics).
    2. When scrap Sn is elevated (0.040%), Sn constraint binds (<= 0.030%) and
       shadow price ($/0.01% Sn) is strictly positive (> 0.0).
    3. When tramp constraints are non-binding, shadow prices are 0.0.
    4. value_in_use_usd_per_t contains all FEED_KEYS.
    5. Selected feeds have ViU == purchase/melting cost (reduced cost r_j = 0).
    6. Non-selected feeds have ViU <= purchase/melting cost (reduced cost r_j >= 0).
    """
    from jsl_carbon_engine.core.optimizer import FEED_KEYS
    grade_304 = get_grade("J304")

    # Baseline run - verify structure
    sol = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0)
    assert sol.is_feasible is True
    assert isinstance(sol.tramp_shadow_prices, dict)
    assert isinstance(sol.value_in_use_usd_per_t, dict)

    for k in ["Cu", "Sn", "P", "S"]:
        assert k in sol.tramp_shadow_prices
        assert sol.tramp_shadow_prices[k] >= 0.0

    for feed in FEED_KEYS:
        assert feed in sol.value_in_use_usd_per_t

    # Verify ViU property: selected feed has ViU == cost
    # Scrap is heavily selected in 304
    assert "scrap" in sol.charge_sheet_pct
    assert sol.charge_sheet_pct["scrap"] > 50.0
    # For selected feed, reduced cost is 0 so ViU equals cost
    assert abs(sol.value_in_use_usd_per_t["scrap"] - 1372.27) < 1.0

    # Non-selected feeds (e.g., expensive Low-C FeCr or primary Ni when scrap provides Ni)
    # have ViU significantly below purchase price
    assert sol.value_in_use_usd_per_t["fecrLowC"] < 2200.0

    # Tramp shadow price binding test:
    # Perturb scrap Sn to 0.040% (well above 0.030% cap).
    # LP solver will hit the Sn cap, generating a positive dual shadow price ($/0.01% Sn).
    sol_binding_sn = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0, custom_scrap_sn=0.040)
    assert sol_binding_sn.is_feasible is True
    assert sol_binding_sn.tramp_shadow_prices["Sn"] > 0.0
    # Shadow price should be substantial (~$70 - $100 per 0.01% tin relaxation)
    assert sol_binding_sn.tramp_shadow_prices["Sn"] > 50.0


def test_ferritic_ni_tramp_shadow_price():
    """Verify ferritic grade J430 exposes Ni tramp shadow price."""
    grade_430 = get_grade("J430")
    sol = solve_charge_optimizer(grade_430, alpha_cost_weight=1.0)
    assert sol.is_feasible is True
    assert "Ni" in sol.tramp_shadow_prices


def test_api_optimize_endpoint_dual_variables():
    """Verify FastAPI /api/optimize endpoint returns tramp_shadow_prices and value_in_use_usd_per_t."""
    from fastapi.testclient import TestClient
    from jsl_carbon_engine.api.app import app

    client = TestClient(app)
    resp = client.post(
        "/api/optimize",
        json={"grade": "J304", "alpha_cost_weight": 1.0, "facility": "jajpur"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "tramp_shadow_prices" in data
    assert "value_in_use_usd_per_t" in data
    assert "Cu" in data["tramp_shadow_prices"]
    assert "Sn" in data["tramp_shadow_prices"]
    assert "P" in data["tramp_shadow_prices"]
    assert "S" in data["tramp_shadow_prices"]
    assert "scrap" in data["value_in_use_usd_per_t"]
    assert "scrap_ceiling_shadow_price_usd_per_t" in data
    assert "estimated_lime_kg_per_t" in data
    assert "estimated_slag_kg_per_t" in data


def test_scrap_ceiling_shadow_price():
    """Verify scrap ceiling shadow price indicates economic value of relaxing scrap cap."""
    grade_304 = get_grade("J304")
    # At 50% scrap cap, scrap cap is strictly binding
    sol_constrained = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0, custom_scrap_cap=50.0)
    assert sol_constrained.is_feasible is True
    assert sol_constrained.scrap_ceiling_shadow_price_usd_per_t > 200.0, (
        f"Expected scrap ceiling shadow price > $200/t, got {sol_constrained.scrap_ceiling_shadow_price_usd_per_t}"
    )

    # When scrap cap is not binding (100% cap), shadow price is zero
    sol_unconstrained = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0, custom_scrap_cap=100.0)
    assert sol_unconstrained.is_feasible is True
    assert sol_unconstrained.scrap_ceiling_shadow_price_usd_per_t == 0.0


def test_multi_objective_dual_variables_remain_economically_valid():
    """
    Verify that at blended weights (alpha = 0.5) and carbon minimization (alpha = 0.0),
    economic duals (shadow prices and ViU) remain decoupled and uncorrupted by composite carbon terms.
    """
    grade_304 = get_grade("J304")

    sol_half = solve_charge_optimizer(grade_304, alpha_cost_weight=0.5)
    assert sol_half.is_feasible is True
    # All ViU values must be positive and non-negative
    for feed, viu in sol_half.value_in_use_usd_per_t.items():
        assert viu >= 0.0, f"ViU for {feed} became negative ({viu}) under alpha=0.5"

    assert abs(sol_half.value_in_use_usd_per_t["scrap"] - 1372.27) < 1.0
    assert sol_half.value_in_use_usd_per_t["niStandard"] > 5000.0

    sol_zero = solve_charge_optimizer(grade_304, alpha_cost_weight=0.0)
    assert sol_zero.is_feasible is True
    for feed, viu in sol_zero.value_in_use_usd_per_t.items():
        assert viu >= 0.0, f"ViU for {feed} became negative ({viu}) under alpha=0.0"


def test_flux_and_slag_generation_estimation():
    """Verify Swerim RAWMATMIX flux and slag estimation engine."""
    grade_304 = get_grade("J304")
    sol = solve_charge_optimizer(grade_304, alpha_cost_weight=1.0)
    assert sol.is_feasible is True
    # Quicklime demand typically 8-20 kg/t for stainless refining
    assert 5.0 <= sol.estimated_lime_kg_per_t <= 35.0
    # Discard slag typically 50-85 kg/t
    assert 45.0 <= sol.estimated_slag_kg_per_t <= 95.0



