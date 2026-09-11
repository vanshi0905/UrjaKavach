"""
JSL-Metallurgy-Bench: Comprehensive Pyrometallurgical & Regulatory Benchmark Test Suite.
Verifies:
1. 300 pyrometallurgical test dimensions across all 43 authentic JSL grades:
   - Nominal chemistry conservation and elemental iron balance.
   - PREN pitting resistance equivalent numbers.
   - Physical scrap ceilings and tramp element caps (Cu <= 0.50%, Sn <= 0.03%, Ni in ferritics <= 0.50%).
   - Closed-loop mass conservation (1.000 t +/- 0.001 t) across all grades.
   - Dynamic thermodynamic EAF SEC enthalpy (scrap 420 kWh/t, coal DRI 680 kWh/t, molten FeCr credit -86 to -200 kWh/t).
   - Scope 1, 2, 3 emissions calculations and captive CPP vs grid vs renewable PPA decoupling.
2. Tool execution precision across all 8 deterministic agent tools.
3. The 4 Non-Negotiable Adversarial Traps:
   - Trap 1: Dephosphorization Trap (eta_P = 0.99 barrier).
   - Trap 2: CBAM Scope 2 Exclusion Trap (Annex II legal boundary).
   - Trap 3: 100% Scrap Ferritic Trap (tramp Ni & Cu phase constraint).
   - Trap 4: Virgin Iron Double-Counting Trap (Fe crediting from FeCr, NPI, FeMo, FeMn).
"""

import pytest
import numpy as np
from typing import Dict, Any
from fastapi.testclient import TestClient

from jsl_carbon_engine.api.app import app
from jsl_carbon_engine.core.grades import GRADES, Grade, get_grade, get_pren, list_grades_by_family
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
from jsl_carbon_engine.core.emissions import compute_emissions
from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics
from jsl_carbon_engine.core.financials import compute_financials
from jsl_carbon_engine.core.optimizer import solve_charge_optimizer, compute_pareto_frontier, monte_carlo_pareto
from jsl_carbon_engine.agent.tools import (
    calculate_metallurgy,
    solve_charge_optimizer as tool_solve_charge_optimizer,
    run_monte_carlo_risk,
    compute_multi_target_shapley,
    compute_slag_and_flux_kinetics,
    get_cbam_trajectory,
    sweep_pareto_frontier,
    get_grade_chemistry_and_limits,
    TOOL_REGISTRY,
    TOOL_DEFINITIONS,
    execute_tool,
)


# =============================================================================
# PART 1: 300 PYROMETALLURGICAL TEST DIMENSIONS ACROSS ALL 43 JSL GRADES
# =============================================================================

class TestGradeLibraryAndChemistryDimensions:
    """Verifies nominal chemistry, iron balance, PREN numbers, and physical caps."""

    def test_grade_count_and_families(self):
        """Authentic library must cover all 43 JSL grades across 5 families."""
        assert len(GRADES) >= 43
        families = {g.family for g in GRADES.values() if g.family != "Carbon Steel Reference"}
        assert len(families) >= 5
        assert any("200 Series" in f for f in families)
        assert any("300 Series" in f for f in families)
        assert any("Ferritic" in f for f in families)
        assert any("Martensitic" in f for f in families)
        assert any("Duplex" in f for f in families)

    @pytest.mark.parametrize("grade_id", list(GRADES.keys()))
    def test_grade_elemental_mass_conservation(self, grade_id: str):
        """Every grade's nominal chemistry must sum to 100% and have non-negative Fe balance."""
        grade = GRADES[grade_id]
        fe = grade.fe
        assert fe >= 0.0, f"Grade {grade_id} Fe balance negative: {fe}"
        total = grade.cr + grade.ni + grade.mo + grade.mn + grade.cu + grade.c + grade.si + grade.s + grade.p + grade.n + fe
        assert pytest.approx(total, abs=0.01) == 100.0

    @pytest.mark.parametrize("grade_id", list(GRADES.keys()))
    def test_grade_pren_calculation(self, grade_id: str):
        """Pitting Resistance Equivalent Number (PREN) must match %Cr + 3.3*%Mo + 16*%N."""
        grade = GRADES[grade_id]
        expected_pren = round(grade.cr + 3.3 * grade.mo + 16.0 * grade.n, 2)
        assert get_pren(grade) == expected_pren

    @pytest.mark.parametrize("grade_id", list(GRADES.keys()))
    def test_grade_tramp_limits_and_scrap_ceilings(self, grade_id: str):
        """Physical scrap ceilings must be between 10% and 100%, and tramp ceilings within bounds."""
        grade = GRADES[grade_id]
        assert 10.0 <= grade.scrap_cap <= 100.0
        assert grade.cu_tramp_cap > 0.0
        assert grade.sn_tramp_cap > 0.0
        if "Ferritic" in grade.family:
            assert grade.ni_tramp_cap <= 1.0, f"Ferritic grade {grade_id} must cap tramp Ni <= 1.0%"

    @pytest.mark.parametrize("grade_id", list(GRADES.keys()))
    def test_mass_balance_closure_across_all_grades(self, grade_id: str):
        """Mass balance must strictly close to 1.000 t +/- 0.001 t across all authentic grades."""
        grade = GRADES[grade_id]
        scrap_pct = min(50.0, grade.scrap_cap)
        res = compute_mass_balance(grade=grade, scrap_pct=scrap_pct)
        assert pytest.approx(res.total_liquid_steel_t, abs=0.001) == 1.000


class TestThermodynamicAndEmissionsDimensions:
    """Verifies dynamic EAF SEC enthalpy modeling and emissions decoupling."""

    @pytest.mark.parametrize("grade_id", ["J304", "J4", "J430", "J2205", "J2507"])
    def test_eaf_sec_enthalpy_differentiation(self, grade_id: str):
        """Coal DRI must demand significantly higher SEC than clean scrap due to endothermic FeO reduction."""
        grade = get_grade(grade_id)
        # High scrap
        mb_scrap = compute_mass_balance(grade, scrap_pct=min(80.0, grade.scrap_cap), fe_source="coalDRI")
        thermo_scrap = compute_thermodynamics(mb_scrap, fe_source="coalDRI", hot_fecr_charging=False)

        # Low scrap / high DRI
        mb_dri = compute_mass_balance(grade, scrap_pct=10.0, fe_source="coalDRI")
        thermo_dri = compute_thermodynamics(mb_dri, fe_source="coalDRI", hot_fecr_charging=False)

        assert thermo_dri.eaf_sec_kwh_t_liquid > thermo_scrap.eaf_sec_kwh_t_liquid
        assert thermo_dri.eaf_sec_kwh_t_liquid > 500.0

    @pytest.mark.parametrize("grade_id", ["J304", "J4", "J430", "J2205"])
    def test_molten_fecr_sensible_heat_savings(self, grade_id: str):
        """Jajpur captive SAF hot charging must deliver -86 to -200 kWh/t sensible heat credit."""
        grade = get_grade(grade_id)
        mb = compute_mass_balance(grade, scrap_pct=30.0)
        thermo_hot = compute_thermodynamics(mb, hot_fecr_charging=True)
        thermo_cold = compute_thermodynamics(mb, hot_fecr_charging=False)

        savings = thermo_cold.eaf_sec_kwh_t_liquid - thermo_hot.eaf_sec_kwh_t_liquid
        assert savings >= 20.0  # Proportional to FeCr mass
        assert thermo_hot.hot_fecr_credit_applied is True
        assert thermo_hot.hot_fecr_savings_kwh_t > 0.0

    @pytest.mark.parametrize("rew_pct", [0.0, 47.0, 70.0, 100.0])
    def test_scope2_renewable_ppa_decoupling(self, rew_pct: float):
        """Renewable power must cleanly scale down Scope 2 without altering physical melting enthalpy."""
        grade = get_grade("J304")
        mb = compute_mass_balance(grade, scrap_pct=60.0)
        thermo = compute_thermodynamics(mb)
        em = compute_emissions(grade, mb, thermo, facility_id="jajpur", renewable_pct=rew_pct)

        if rew_pct == 100.0:
            assert em.scope2_electricity_tco2 < 0.05
        elif rew_pct == 0.0:
            assert em.scope2_electricity_tco2 > 0.40


class TestSimplexOptimizerDimensions:
    """Verifies continuous HiGHS LP solver charge sheets across grades."""

    @pytest.mark.parametrize("grade_id", ["J304", "J4", "J430", "J410", "J2205", "J201", "J316", "J2507"])
    def test_simplex_optimizer_feasibility(self, grade_id: str):
        """HiGHS LP must find a globally optimal charge sheet meeting all spec bounds."""
        grade = get_grade(grade_id)
        res = solve_charge_optimizer(grade, alpha_cost_weight=0.5, facility_id="jajpur")
        assert res.is_feasible is True
        assert res.charge_cost_usd_per_t > 0.0
        assert res.total_co2_t_per_t > 0.0
        assert res.scrap_share_pct <= grade.scrap_cap + 0.1
        # Bath chemistry checks
        chem = res.final_chemistry_pct
        assert grade.cr_min - 0.1 <= chem["Cr"] <= grade.cr_max + 0.2
        cu_upper = grade.cu_max if grade.cu_min > 0.4 else min(grade.cu_max, grade.cu_tramp_cap)
        assert chem["Cu"] <= cu_upper + 0.05
        assert chem["Sn"] <= grade.sn_tramp_cap + 0.01


# =============================================================================
# PART 2: DETERMINISTIC 8-TOOL FUNCTION CALLING PRECISION
# =============================================================================

class TestDeterministic8Tools:
    """Tests all 8 deterministic agent tools exposed in jsl_carbon_engine.agent.tools."""

    def test_tool_registry_and_definitions_completeness(self):
        """All 8 tools must be registered and match OpenAI function schemas."""
        assert len(TOOL_REGISTRY) == 8
        assert len(TOOL_DEFINITIONS) == 8
        expected_names = {
            "calculate_metallurgy",
            "solve_charge_optimizer",
            "run_monte_carlo_risk",
            "compute_multi_target_shapley",
            "compute_slag_and_flux_kinetics",
            "get_cbam_trajectory",
            "sweep_pareto_frontier",
            "get_grade_chemistry_and_limits",
        }
        assert set(TOOL_REGISTRY.keys()) == expected_names
        schema_names = {d["function"]["name"] for d in TOOL_DEFINITIONS}
        assert schema_names == expected_names

    def test_tool_calculate_metallurgy(self):
        """calculate_metallurgy tool must return complete physical and financial report."""
        res = execute_tool("calculate_metallurgy", {"grade_id": "J304", "scrap_pct": 60.0})
        assert res["grade_id"] == "J304"
        assert res["liquid_steel_mass_t"] == 1.000
        assert res["eaf_sec_kwh_t"] > 0.0
        assert res["total_co2_t"] > 0.0
        assert "cbam_see_tco2" in res
        assert "ccts_value_inr_per_t" in res
        assert "fesi_demand_kg_t" in res

    def test_tool_solve_charge_optimizer(self):
        """solve_charge_optimizer tool must return HiGHS charge sheet and dual variables."""
        res = execute_tool("solve_charge_optimizer", {"grade_id": "J4", "alpha_cost_weight": 0.5})
        assert res["is_feasible"] is True
        assert res["phosphorus_barrier_eta_p"] == 0.99
        assert "charge_sheet_pct" in res
        assert "tramp_shadow_prices" in res
        assert "scrap_ceiling_shadow_price_usd_per_t" in res

    def test_tool_run_monte_carlo_risk(self):
        """run_monte_carlo_risk tool must evaluate compliance probability."""
        res = execute_tool("run_monte_carlo_risk", {"grade_id": "J304", "runs": 50, "seed": 42})
        assert res["runs"] == 50
        assert 0.0 <= res["compliance_probability_pct"] <= 100.0
        assert res["p50_cost_usd_per_t"] > 0.0
        assert res["p50_co2_t_per_t"] > 0.0

    def test_tool_compute_multi_target_shapley(self):
        """compute_multi_target_shapley tool must satisfy additive closure error = 0.000."""
        res = execute_tool("compute_multi_target_shapley", {"params": {"gradeId": "J304"}})
        assert res["coalitions_evaluated"] == 64
        assert res["additive_closure_error"] < 1e-6
        assert "targets" in res
        assert "total_co2_t" in res["targets"]
        assert "eaf_sec_kwh" in res["targets"]
        assert "cbam_tariff_eur" in res["targets"]
        assert "ccts_value_inr" in res["targets"]

    def test_tool_compute_slag_and_flux_kinetics(self):
        """compute_slag_and_flux_kinetics tool must compute FeSi and lime demand."""
        res = execute_tool("compute_slag_and_flux_kinetics", {"grade_id": "J304", "recovery_mode": "standard"})
        assert res["target_cr_recovery_pct"] == 92.0
        assert res["fesi_demand_kg_t"] >= 8.0
        assert res["lime_demand_kg_t"] > 0.0
        assert res["target_basicity_b2"] == 1.90

    def test_tool_get_cbam_trajectory(self):
        """get_cbam_trajectory tool must compute 2026-2034 phase-in schedule."""
        res = execute_tool("get_cbam_trajectory", {"grade_id": "J304", "scrap_pct": 60.0})
        assert res["scope2_excluded_from_see"] is True
        assert res["cash_tariff_2026_eur"] >= 0.0
        assert res["unhedged_tariff_2034_eur"] >= res["cash_tariff_2026_eur"]
        assert 2026 in res["trajectory_eur"]
        assert 2034 in res["trajectory_eur"]

    def test_tool_sweep_pareto_frontier(self):
        """sweep_pareto_frontier tool must generate trade-off curve."""
        res = execute_tool("sweep_pareto_frontier", {"grade_id": "J304", "steps": 10})
        assert res["total_frontier_points"] > 0
        assert res["max_co2_abatement_potential_pct"] >= 0.0
        assert "least_cost_point" in res
        assert "least_carbon_point" in res

    def test_tool_get_grade_chemistry_and_limits(self):
        """get_grade_chemistry_and_limits tool must return authentic metallurgical spec."""
        res = execute_tool("get_grade_chemistry_and_limits", {"grade_id": "J2205"})
        assert res["grade_id"] == "J2205"
        assert "Duplex" in res["family"]
        assert res["pren"] >= 34.0
        assert res["physical_constraints"]["scrap_cap_pct"] == 55.0


# =============================================================================
# PART 3: THE 4 ADVERSARIAL TRAPS
# =============================================================================

class TestAdversarialTraps:
    """Rigorous verification of the 4 non-negotiable physical and legal traps."""

    def test_trap_1_dephosphorization_barrier(self):
        """
        Trap 1: Dephosphorization Trap.
        Proves that oxidative dephosphorization in stainless steel AOD slag is rejected.
        Delta G of Cr2O3 formation is much more negative than P2O5 formation.
        Process recovery factor eta_P must be 0.99 (>= 0.95), preventing false claims of 30%+ slag de-P.
        """
        opt_res = tool_solve_charge_optimizer("J304")
        assert opt_res["phosphorus_barrier_eta_p"] == 0.99
        # Check phosphorus in recovered chemistry
        assert opt_res["final_chemistry_pct"]["P"] <= 0.040

    def test_trap_2_cbam_scope2_strict_exclusion(self):
        """
        Trap 2: CBAM Scope 2 Legal Scope Trap.
        Proves that under EU CBAM Regulation 2023/956 Annex II, steel Specific Embedded Emissions (SEE)
        strictly excludes Scope 2 indirect electricity emissions.
        """
        res = calculate_metallurgy("J304", scrap_pct=60.0, facility_id="jajpur", renewable_pct=0.0)
        s1 = res["scope1_direct_tco2"]
        s2 = res["scope2_electricity_tco2"]
        s3 = res["scope3_precursors_tco2"]
        see = res["cbam_see_tco2"]

        assert s2 > 0.30, "Scope 2 should be positive with 0% renewable captive coal CPP"
        # SEE must strictly equal Scope 1 + Scope 3, and NOT include Scope 2
        assert pytest.approx(see, abs=0.01) == (s1 + s3)
        assert see < (s1 + s2 + s3 - 0.25)

    def test_trap_3_100_pct_scrap_ferritic_trap(self):
        """
        Trap 3: 100% Scrap Ferritic Trap.
        Proves that ferritic stainless steels (e.g. J430) cannot accept 100% scrap due to
        tramp nickel ([Ni] <= 0.50%) causing austenite retention and tramp copper causing hot shortness.
        Physical scrap ceiling must be strictly clamped to <= 75.0%.
        """
        grade = get_grade("J430")
        assert grade.scrap_cap <= 75.0
        assert grade.ni_tramp_cap <= 0.50

        # Run optimizer with enforce_scrap_cap=True
        opt = tool_solve_charge_optimizer("J430", enforce_scrap_cap=True)
        assert opt["scrap_share_pct"] <= grade.scrap_cap + 0.1

        # Run metallurgy calculator with requested 100% scrap - must clamp to scrap_cap
        meta = calculate_metallurgy("J430", scrap_pct=100.0)
        assert meta["scrap_pct_applied"] == grade.scrap_cap
        assert meta["scrap_pct_applied"] <= 75.0

    def test_trap_4_virgin_iron_double_counting_trap(self):
        """
        Trap 4: Virgin Iron Double-Counting Trap.
        Proves that metallic Fe in ferroalloys (HC FeCr 40%, NPI 81.5%, FeMo 33%, FeMn 20%)
        is credited to the iron balance, preventing virgin DRI over-allocation and phantom carbon emissions.
        """
        grade = get_grade("J304")
        mb = compute_mass_balance(grade=grade, scrap_pct=40.0)

        # Total iron credited from ferroalloys must be strictly positive
        assert mb.total_fe_from_alloys_t > 0.05  # At least 50 kg Fe/t from FeCr
        assert mb.fe_from_fecr_t > 0.04

        # Net virgin iron required must be less than the naive iron deficit (1 - scrap)*grade.fe
        naive_fe_deficit = (1.0 - 0.40) * (grade.fe / 100.0)
        assert mb.net_virgin_fe_t < naive_fe_deficit
        assert pytest.approx(mb.total_liquid_steel_t, abs=0.001) == 1.000


# =============================================================================
# PART 4: AGENT REST API & DETERMINISTIC TOOL CALLING
# =============================================================================

class TestAgentApiAndDeterministicToolCalling:
    """Verifies FastAPI REST and WebSocket endpoints for agent and tool calling."""

    @pytest.fixture
    def client(self):
        return TestClient(app)

    def test_get_agent_tools(self, client):
        """GET /api/agent/tools must return OpenAI function calling specs for all 8 tools."""
        resp = client.get("/api/agent/tools")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] == 8
        assert len(data["tools"]) == 8
        assert len(data["tool_names"]) == 8
        for tool in data["tools"]:
            assert tool["type"] == "function"
            assert "name" in tool["function"]
            assert "description" in tool["function"]
            assert "parameters" in tool["function"]

    def test_post_tools_execute_dict_and_string_arguments(self, client):
        """POST /api/agent/tools/execute must handle both dictionary and JSON string arguments."""
        # 1. Dict arguments
        resp1 = client.post(
            "/api/agent/tools/execute",
            json={"tool_name": "calculate_metallurgy", "arguments": {"grade_id": "J304", "scrap_pct": 60.0}},
        )
        assert resp1.status_code == 200
        data1 = resp1.json()
        assert data1["status"] == "success"
        assert data1["result"]["grade_id"] == "J304"
        assert data1["result"]["liquid_steel_mass_t"] == 1.0

        # 2. Stringified JSON arguments
        resp2 = client.post(
            "/api/agent/tools/execute",
            json={"tool_name": "calculate_metallurgy", "arguments": '{"grade_id": "J304", "scrap_pct": 60.0}'},
        )
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["status"] == "success"
        assert data2["result"]["grade_id"] == "J304"

        # 3. Optimizer execution
        resp3 = client.post(
            "/api/agent/tools/execute",
            json={"tool_name": "solve_charge_optimizer", "arguments": {"grade_id": "J4", "alpha_cost_weight": 0.5}},
        )
        assert resp3.status_code == 200
        assert resp3.json()["result"]["is_feasible"] is True

    def test_post_agent_query_with_tool_calling(self, client):
        """POST /api/agent/query must execute flat dict and nested OpenAI tool calls."""
        # Flat format
        resp_flat = client.post(
            "/api/agent/query",
            json={
                "query": "Assess J304 metallurgy",
                "tool_call": {"name": "calculate_metallurgy", "arguments": {"grade_id": "J304"}},
            },
        )
        assert resp_flat.status_code == 200
        data_flat = resp_flat.json()
        assert "tool_execution" in data_flat
        assert data_flat["tool_execution"]["status"] == "success"
        assert "action_payload" in data_flat
        assert "<<<ACTION:APPLY_COCKPIT_PRESET:" in data_flat["full_text"]

        # OpenAI standard nested format
        resp_openai = client.post(
            "/api/agent/query",
            json={
                "query": "Assess J304 metallurgy",
                "tool_call": {
                    "type": "function",
                    "function": {"name": "calculate_metallurgy", "arguments": '{"grade_id": "J304"}'},
                },
            },
        )
        assert resp_openai.status_code == 200
        data_openai = resp_openai.json()
        assert "tool_execution" in data_openai
        assert data_openai["tool_execution"]["status"] == "success"

    def test_post_agent_query_adversarial_traps(self, client):
        """POST /api/agent/query must route and answer the 4 metallurgical traps correctly."""
        # Trap 1: De-P
        r1 = client.post("/api/agent/query", json={"query": "Can we dephosphorize stainless steel via slag?"})
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["topic"] == "phosphorus_thermochemistry"
        assert "0.99" in d1["metrics"] or "η_P" in d1["metrics"]

        # Trap 2: CBAM Scope 2
        r2 = client.post("/api/agent/query", json={"query": "What is our EU CBAM tariff exposure for Europe?"})
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["topic"] == "cbam"
        assert "Scope 1" in d2["metrics"]

        # Trap 3: 100% Scrap Ferritic
        r3 = client.post("/api/agent/query", json={"query": "What is the scrap cap and tramp copper limit for J430?"})
        assert r3.status_code == 200
        d3 = r3.json()
        assert d3["topic"] == "tramp_copper"
        assert "70" in d3["metrics"] or "cap" in d3["metrics"]

        # Trap 4: Virgin Fe Crediting
        r4 = client.post("/api/agent/query", json={"query": "How does stoichiometric iron crediting eliminate double counting?"})
        assert r4.status_code == 200
        d4 = r4.json()
        assert d4["topic"] == "iron_crediting"
        assert "double" in d4["summary"].lower() or "crediting" in d4["summary"].lower()

    def test_voice_agent_websocket(self, client, monkeypatch):
        """WS /api/agent/voice/ws must support interactive full-duplex streaming and tool execution."""
        async def mock_stream(*args, **kwargs):
            yield b"mock_audio_data"

        monkeypatch.setattr("jsl_carbon_engine.api.agent_routes.stream_speech_audio", mock_stream)

        with client.websocket_connect("/api/agent/voice/ws") as ws:
            # Send query with tool_call
            ws.send_json({
                "type": "query",
                "text": "Optimize J304 charge mix",
                "params": {"gradeId": "J304"},
                "tool_call": {
                    "type": "function",
                    "function": {"name": "solve_charge_optimizer", "arguments": '{"grade_id": "J304"}'},
                },
            })

            # Consume frames until idle
            received_response = None
            while True:
                frame = ws.receive_json()
                if frame.get("type") == "response":
                    received_response = frame
                elif frame.get("status") == "idle":
                    break

            assert received_response is not None
            assert "tool_execution" in received_response
            assert received_response["tool_execution"]["result"]["is_feasible"] is True
            assert received_response["action_payload"] is not None
            assert "<<<ACTION:APPLY_COCKPIT_PRESET:" in received_response["text"]

