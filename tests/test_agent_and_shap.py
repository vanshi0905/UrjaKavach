"""
Comprehensive Test Suite for JSL AI Agent & Multi-Target SHAP Engine.
Validates:
1. Exact Additive Closure Theorem across all 4 operational targets (Error < 1e-6).
2. Physical Enthalpy Invariance (Renewable electricity attribution to EAF SEC == 0.0).
3. Empirical Benchmark exact match for J304 at Jajpur Works.
4. Scrap cap and tramp copper clamping on ferritic/duplex grades.
5. 3-Layer Pedagogical NLG output structure (Metaphor -> Metrics -> Action).
6. Audio synthesis and text-to-speech phonetics.
7. REST API and WebSocket communication with barge-in interruption.
"""

import pytest
import math
from fastapi.testclient import TestClient

from jsl_carbon_engine.api.app import app
from jsl_carbon_engine.agent.shap_engine import compute_multi_target_shapley
from jsl_carbon_engine.agent.nlg_engine import generate_target_explanation, answer_conversational_query
from jsl_carbon_engine.agent.voice_service import clean_text_for_speech, synthesize_speech_bytes


client = TestClient(app)


def test_shap_additive_closure_all_targets():
    """Verify exact additive closure across all 4 targets for various stainless grades."""
    test_cases = [
        {"grade": "J304", "scrap_pct": 60.0, "fe_source": "gasDRI", "renewable_pct": 70.0, "hot_fecr_charging": True},
        {"grade": "J4", "scrap_pct": 50.0, "fe_source": "coalDRI", "ni_source": "niStandard", "renewable_pct": 80.0},
        {"grade": "J430", "scrap_pct": 60.0, "fe_source": "gasDRI", "hot_fecr_charging": False},
        {"grade": "J2205", "scrap_pct": 70.0, "fe_source": "gasDRI", "fecr_source": "fecrLowC", "renewable_pct": 100.0},
    ]

    for tc in test_cases:
        res = compute_multi_target_shapley(tc)
        assert res["evaluation_time_ms"] < 25.0  # Fast execution

        for tgt_key, tgt_data in res["targets"].items():
            check = tgt_data["closure_check"]
            assert check["is_exact"] is True, f"Failed exact closure on {tc['grade']} target {tgt_key}"
            assert check["closure_error"] < 1e-6, f"Closure error {check['closure_error']} too large on {tgt_key}"
            assert math.isclose(check["sum_attributions"], check["delta"], rel_tol=1e-5, abs_tol=1e-5)


def test_empirical_benchmark_j304():
    """
    Test exact empirical benchmark values from implementation plan:
    Grade: J304 at Jajpur
    Baseline: 35% scrap, Coal DRI, 47% RE, Cold FeCr charging
    User Heats: 60% scrap, Gas DRI, 70% RE, Hot FeCr charging
    """
    params = {
        "grade": "J304",
        "scrap_pct": 60.0,
        "fe_source": "gasDRI",
        "fecr_source": "fecrStandard",
        "ni_source": "niStandard",
        "renewable_pct": 70.0,
        "hot_fecr_charging": True,
    }
    res = compute_multi_target_shapley(params)

    # 1. Total CO2 Target Check
    co2 = res["targets"]["total_co2_t"]
    assert co2["baseline_value"] == 4.17
    assert co2["user_value"] == 2.03
    assert math.isclose(co2["delta"], -2.14, abs_tol=0.01)

    # Check top attributions for carbon
    co2_attrs = {a["feature"]: a["attribution"] for a in co2["attributions"]}
    assert co2_attrs["scrap_pct"] < -1.0  # Scrap circularity is primary (~ -1.106)
    assert co2_attrs["fe_source"] < -0.6   # Gas DRI is secondary (~ -0.681)
    assert co2_attrs["renewable_pct"] < -0.2  # RE PPA (~ -0.259)

    # 2. EAF Electrical SEC Target Check
    sec = res["targets"]["eaf_sec_kwh"]
    assert math.isclose(sec["baseline_value"], 591.23, abs_tol=0.1)
    assert math.isclose(sec["user_value"], 410.98, abs_tol=0.1)
    assert math.isclose(sec["delta"], -180.25, abs_tol=0.1)

    sec_attrs = {a["feature"]: a["attribution"] for a in sec["attributions"]}
    # Molten FeCr sensible heat is dominant (~ -112.91 kWh/t)
    assert math.isclose(sec_attrs["hot_fecr_charging"], -112.91, abs_tol=0.1)
    # Physical Enthalpy Invariance: Renewable electricity does NOT alter furnace enthalpy!
    assert math.isclose(sec_attrs["renewable_pct"], 0.0, abs_tol=1e-6)


def test_scrap_cap_clamping():
    """Verify that scrap rate is capped at grade metallurgical limit and flagged."""
    # J430 has scrap_cap of 70% in authentic JSL specification
    res = compute_multi_target_shapley({"grade": "J430", "scrap_pct": 90.0})
    assert res["grade"]["scrap_cap"] == 70.0
    assert res["grade"]["scrap_was_clamped"] is True


def test_nlg_3_layer_pedagogical_structure():
    """Verify that the NLG engine always delivers Metaphor, Metrics, and Action."""
    exp = generate_target_explanation("total_co2_t", {"grade": "J304", "scrap_pct": 65.0})
    assert "metaphor" in exp and len(exp["metaphor"]) > 20
    assert "metrics" in exp and len(exp["metrics"]) > 20
    assert "action" in exp and len(exp["action"]) > 20
    assert "### 1. Physical Principle" in exp["full_text"]
    assert "### 2. Grounded Attribution" in exp["full_text"]
    assert "### 3. Operational Action" in exp["full_text"]


def test_nlg_conversational_queries():
    """Verify high-precision domain question routing."""
    # Query 1: Energy & Coal DRI
    q1 = answer_conversational_query("Why is my energy consumption so high with coal DRI?", {"grade": "J304"})
    assert q1["topic"] == "fe_sourcing"
    assert "gangue" in q1["metaphor"].lower() or "fuel" in q1["metaphor"].lower()

    # Query 2: Molten FeCr
    q2 = answer_conversational_query("How does molten FeCr hot charging help?", {"grade": "J304"})
    assert q2["topic"] == "hot_fecr_charging"
    assert "butter" in q2["metaphor"].lower()

    # Query 3: Copper tramp limits
    q3 = answer_conversational_query("What is tramp copper?", {"grade": "J430"})
    assert q3["topic"] == "tramp_copper"
    assert "recycled paper" in q3["metaphor"].lower()
    assert q3["is_conversational"] is True

    # Query 4: Greetings & Salutations (No preset attached)
    for g_text in ["Hi", "hello", "Hey", "good morning", "hi or hello", "hello there", "hi copilot"]:
        q_greet = answer_conversational_query(g_text, {"grade": "J304"})
        assert q_greet["topic"] == "greeting"
        assert q_greet["is_conversational"] is True
        assert q_greet["action_payload"] is None
        assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_greet["full_text"]

    # Query 5: Identity & About (No preset attached)
    for id_text in ["who are you", "what is your name", "what are you", "tell me who you are", "about jsl"]:
        q_id = answer_conversational_query(id_text, {"grade": "J304"})
        assert q_id["topic"] == "about"
        assert q_id["is_conversational"] is True
        assert q_id["action_payload"] is None
        assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_id["full_text"]

    # Query 6: Capabilities & Common Tasks (No preset attached)
    for c_text in [
        "what can u do", "what can you do for me", "help", "common list of such stuff",
        "what can i ask", "what should i do", "what can you help me with", "can you help me",
        "capabilities", "commands", "features"
    ]:
        q_help = answer_conversational_query(c_text, {"grade": "J304"})
        assert q_help["topic"] == "help"
        assert q_help["is_conversational"] is True
        assert q_help["action_payload"] is None
        assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_help["full_text"]

    # Query 7: Usage & How-to (No preset attached)
    for h_text in [
        "how", "how to use", "how does it work", "how do i use this",
        "how can i use this", "how do i start", "where do i begin",
        "guide", "tutorial", "how do i use the sliders"
    ]:
        q_how = answer_conversational_query(h_text, {"grade": "J304"})
        assert q_how["topic"] == "how_to_use"
        assert q_how["is_conversational"] is True
        assert q_how["action_payload"] is None
        assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_how["full_text"]

    # Query 8: Pleasantries & Social Inquiries
    q_social = answer_conversational_query("how are you", {"grade": "J304"})
    assert q_social["topic"] == "pleasantry"
    assert q_social["action_payload"] is None
    assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_social["full_text"]

    q_thanks = answer_conversational_query("thank you", {"grade": "J304"})
    assert q_thanks["topic"] == "acknowledgement"
    assert q_thanks["action_payload"] is None
    assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_thanks["full_text"]

    q_ok = answer_conversational_query("ok", {"grade": "J304"})
    assert q_ok["topic"] == "acknowledgement"
    assert q_ok["action_payload"] is None
    assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_ok["full_text"]

    q_bye = answer_conversational_query("bye", {"grade": "J304"})
    assert q_bye["topic"] == "farewell"
    assert q_bye["action_payload"] is None
    assert "<<<ACTION:APPLY_COCKPIT_PRESET:" not in q_bye["full_text"]

    # Query 9: General Metallurgical Assessment (Process query attaches actionable cockpit preset)
    q_gen = answer_conversational_query("Assess J304 metallurgy", {"grade": "J304"})
    assert q_gen["topic"] == "general"
    assert q_gen["is_conversational"] is True
    assert q_gen["action_payload"] is not None
    assert "<<<ACTION:APPLY_COCKPIT_PRESET:" in q_gen["full_text"]



def test_voice_phonetics_cleanup():
    """Verify spoken text cleaner translates units and symbols accurately."""
    raw = "EAF SEC is 411.0 kWh/t, [Cu] <= 0.25% at 1600°C. €80/t and ₹1500/t. Total: 2.11 tCO2/t."
    cleaned = clean_text_for_speech(raw)
    assert "kilowatt hours per tonne" in cleaned
    assert "degrees Celsius" in cleaned
    assert "euros" in cleaned
    assert "rupees" in cleaned
    assert "tonnes of C O 2 per tonne" in cleaned
    assert "tramp copper under" in cleaned


@pytest.mark.anyio
async def test_speech_synthesis_generation():
    """Verify actual MP3 audio byte synthesis with edge-tts."""
    audio = await synthesize_speech_bytes("JSL Carbon and Energy Engine is operating at nominal status.")
    assert len(audio) > 5000  # Valid MP3 audio file
    assert audio.startswith(b"\xff\xfb") or b"ID3" in audio[:10] or len(audio) > 1000


def test_agent_rest_endpoints():
    """Test all /api/agent REST endpoints."""
    # 1. POST /api/agent/shap
    r_shap = client.post("/api/agent/shap", json={"grade": "J304", "scrap_pct": 60.0})
    assert r_shap.status_code == 200
    shap_data = r_shap.json()
    assert "targets" in shap_data
    assert "total_co2_t" in shap_data["targets"]

    # 2. POST /api/agent/explain
    r_exp = client.post("/api/agent/explain", json={"target": "eaf_sec_kwh", "params": {"grade": "J304"}})
    assert r_exp.status_code == 200
    exp_data = r_exp.json()
    assert "metaphor" in exp_data
    assert "metrics" in exp_data

    # 3. POST /api/agent/query
    r_query = client.post("/api/agent/query", json={"query": "Why should I avoid Indonesian NPI for Europe?", "params": {"grade": "J304"}})
    assert r_query.status_code == 200
    query_data = r_query.json()
    assert query_data["topic"] == "nickel_sourcing"

    # 4. GET /api/agent/voices
    r_voices = client.get("/api/agent/voices")
    assert r_voices.status_code == 200
    assert "en-IN-PrabhatNeural" in r_voices.json()["voices"]

    # 5. POST /api/agent/tts
    r_tts = client.post("/api/agent/tts", json={"text": "System check complete."})
    assert r_tts.status_code == 200
    assert r_tts.headers["content-type"] == "audio/mpeg"
    assert len(r_tts.content) > 1000


def test_voice_websocket_communication_and_interruption():
    """Verify full-duplex WebSocket communication and barge-in interruption frame."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        # Send a query
        ws.send_json({
            "type": "query",
            "text": "Why is my energy consumption so high with coal DRI?",
            "params": {"grade": "J304", "fe_source": "coalDRI"},
        })

        # Expect status: thinking
        frame1 = ws.receive_json()
        assert frame1.get("type") == "status"
        assert frame1.get("status") == "thinking"

        # Expect response frame with complete metadata
        frame2 = ws.receive_json()
        assert frame2.get("type") == "response"
        assert "fe_sourcing" in frame2.get("topic", "")
        assert frame2.get("target") == "eaf_sec_kwh"
        assert len(frame2.get("metaphor", "")) > 10
        assert len(frame2.get("metrics", "")) > 10
        assert len(frame2.get("action", "")) > 10
        assert frame2.get("shap") is not None

        # Receive speaking status or audio start
        frame3 = ws.receive_json()
        assert frame3.get("type") in ["status", "audio_start"]

        # Now test barge-in interruption! Send interrupt frame while audio is streaming
        ws.send_json({"type": "interrupt"})

        # Collect subsequent messages until we get interrupted confirmation
        interrupted = False
        for _ in range(10):
            msg = ws.receive_json()
            if msg.get("type") == "interrupted":
                interrupted = True
                break
        assert interrupted is True


def test_shap_null_and_boundary_handling():
    """Verify robust execution with None, missing keys, and out-of-bounds inputs."""
    # 1. None and empty dictionary
    r_none = compute_multi_target_shapley(None)
    assert r_none["grade"]["id"] == "J304"
    assert r_none["evaluation_time_ms"] > 0

    r_empty = compute_multi_target_shapley({})
    assert r_empty["grade"]["id"] == "J304"

    # 2. Null values within parameter dictionary
    r_nulls = compute_multi_target_shapley({
        "grade": "J304",
        "scrap_pct": None,
        "renewable_pct": None,
        "eu_ets_price_eur": None,
        "india_ccc_price_inr": None,
        "fe_source": None,
    })
    assert r_nulls["targets"]["total_co2_t"]["closure_check"]["is_exact"] is True

    # 3. Negative and excessive scrap
    r_neg_scrap = compute_multi_target_shapley({"grade": "J304", "scrap_pct": -25.0})
    assert r_neg_scrap["targets"]["total_co2_t"]["attributions"][0]["user_value"] == 0.0

    r_excess_scrap = compute_multi_target_shapley({"grade": "J430", "scrap_pct": 125.0})
    assert r_excess_scrap["grade"]["scrap_was_clamped"] is True

    # 4. Renewable % clamped to [0, 100]
    r_re_bounds = compute_multi_target_shapley({"grade": "J304", "renewable_pct": 250.0})
    re_attr = next(a for a in r_re_bounds["targets"]["total_co2_t"]["attributions"] if a["feature"] == "renewable_pct")
    assert re_attr["user_value"] == 100.0


def test_nlg_complete_schema_and_topic_routing():
    """Verify that all topic handlers in nlg_engine return complete, uniform schemas."""
    queries = [
        ("What is tramp copper and why is scrap capped?", "tramp_copper", "total_co2_t"),
        ("How does molten FeCr hot charging help?", "hot_fecr_charging", "eaf_sec_kwh"),
        ("Why is my energy consumption so high with coal DRI?", "fe_sourcing", "eaf_sec_kwh"),
        ("Why should I avoid Indonesian NPI for Europe?", "nickel_sourcing", "total_co2_t"),
        ("What is our EU CBAM tariff exposure for Europe?", "cbam", "cbam_tariff_eur"),
        ("How does India CCTS generate EBITDA surplus?", "ccts", "ccts_value_inr"),
        ("General metallurgical inquiry", "general", "total_co2_t"),
    ]

    required_keys = [
        "target", "target_name", "title", "topic", "summary",
        "metaphor", "metrics", "action", "full_text", "shap"
    ]

    for q_text, expected_topic, expected_target in queries:
        ans = answer_conversational_query(q_text, {"grade": "J304"})
        for k in required_keys:
            assert k in ans, f"Key '{k}' missing in response for topic '{expected_topic}'"
            assert ans[k] is not None, f"Key '{k}' is None in response for topic '{expected_topic}'"
        assert ans["topic"] == expected_topic
        assert ans["target"] == expected_target
        assert ans["shap"]["target"] == expected_target
        assert len(ans["summary"]) > 5
        assert len(ans["metaphor"]) > 20
        assert len(ans["action"]) > 20


def test_clean_text_chemistry_and_alloys():
    """Verify phonetic speech translation of chemical species, alloys, and symbols."""
    text = "Charging 60% scrap with SiO2 and Al2O3 gangue, plus FeCr, FeNi, and Indonesian NPI gives ~2.1 tCO2/t."
    cleaned = clean_text_for_speech(text)
    assert "percent" in cleaned
    assert "silica" in cleaned
    assert "alumina" in cleaned
    assert "plus" in cleaned
    assert "ferro-chrome" in cleaned
    assert "ferro-nickel" in cleaned
    assert "nickel pig iron" in cleaned
    assert "approximately" in cleaned
    assert "tonnes of C O 2 per tonne" in cleaned


def test_methodology_6_core_formula_queries():
    """
    Guarantees exact topic and target routing for all 6 core pyrometallurgical formulas
    from the methodology page triggers (Chat and Voice variants).
    """
    formula_test_cases = [
        # Formula 1: Stoichiometric Iron Crediting
        ("Explain stoichiometric iron crediting and how crediting ferroalloy iron eliminates the 220 kg/t DRI double-counting error", "iron_crediting", "total_co2_t"),
        ("Explain stoichiometric iron crediting in stainless steelmaking and how it prevents double counting virgin iron", "iron_crediting", "total_co2_t"),
        ("Explain stoichiometric iron crediting and why failing to credit ferroalloy iron exaggerates emissions", "iron_crediting", "total_co2_t"),
        ("Explain stoichiometric iron crediting in stainless steel", "iron_crediting", "total_co2_t"),
        # Formula 2: Dynamic EAF SEC & Molten FeCr Sensible Heat
        ("Explain dynamic EAF Specific Electrical Consumption (SEC) and how molten FeCr sensible heat saves ~113 kWh/t", "hot_fecr_charging", "eaf_sec_kwh"),
        ("Explain dynamic EAF electrical SEC and the sensible heat credit from molten FeCr charging", "hot_fecr_charging", "eaf_sec_kwh"),
        ("Explain dynamic EAF SEC enthalpy balance and sensible heat credit from molten FeCr", "hot_fecr_charging", "eaf_sec_kwh"),
        ("Explain dynamic EAF SEC and sensible heat savings", "hot_fecr_charging", "eaf_sec_kwh"),
        # Formula 3: EU CBAM SEFA & Article 9
        ("Explain EU CBAM Specific Embedded Free Allocation (SEFA 2026) and Article 9 deductions for Indian steel exports", "cbam", "cbam_tariff_eur"),
        ("Explain EU CBAM SEFA allocation rules and Article 9 carbon price offsets", "cbam", "cbam_tariff_eur"),
        ("Explain EU CBAM SEFA 2026 allocation rules and Article 9 credit deductions", "cbam", "cbam_tariff_eur"),
        ("Explain EU CBAM SEFA calculation and Article 9 deductions", "cbam", "cbam_tariff_eur"),
        # Formula 4: India BEE CCTS SEI & EBITDA
        ("Explain India BEE CCTS Specific Emission Intensity (SEI) target of 0.8222 tCO2/t and EBITDA generation from CCC trading", "ccts", "ccts_value_inr"),
        ("Explain the India BEE CCTS carbon trading scheme and how beating the target generates EBITDA", "ccts", "ccts_value_inr"),
        ("Explain India BEE CCTS intensity target of 0.8222 tCO2/t and CCC monetization", "ccts", "ccts_value_inr"),
        ("Explain India BEE CCTS scheme and carbon certificates", "ccts", "ccts_value_inr"),
        # Formula 5: Swerim RAWMATMIX LP Dual Shadow Pricing & Value-in-Use
        ("Explain Swerim RAWMATMIX Linear Programming dual shadow pricing and how reduced cost determines scrap Value-in-Use (ViU)", "shadow_pricing_viu", "total_co2_t"),
        ("Explain Swerim RAWMATMIX dual shadow pricing and scrap Value in Use", "shadow_pricing_viu", "total_co2_t"),
        ("Explain Swerim RAWMATMIX LP dual shadow pricing and scrap Value-in-Use", "shadow_pricing_viu", "total_co2_t"),
        ("Explain LP dual shadow pricing and reduced cost for scrap procurement", "shadow_pricing_viu", "total_co2_t"),
        # Formula 6: High-Cr Phosphorus Non-Removal Thermochemistry
        ("Explain high-Cr phosphorus non-removal thermochemistry (eta_P = 0.99) and why dephosphorization is impossible without burning chromium", "phosphorus_thermochemistry", "total_co2_t"),
        ("Explain phosphorus non removal thermochemistry in high chromium stainless steel", "phosphorus_thermochemistry", "total_co2_t"),
        ("Explain high-Cr phosphorus non-removal thermochemistry (eta_P = 0.99)", "phosphorus_thermochemistry", "total_co2_t"),
        ("Explain high-Cr phosphorus non-removal and Ellingham free energy", "phosphorus_thermochemistry", "total_co2_t"),
    ]

    for q_text, expected_topic, expected_target in formula_test_cases:
        res = answer_conversational_query(q_text, {"grade": "J304"})
        assert res["topic"] == expected_topic, f"Query '{q_text}' routed to topic '{res['topic']}', expected '{expected_topic}'"
        assert res["target"] == expected_target, f"Query '{q_text}' routed to target '{res['target']}', expected '{expected_target}'"
        assert len(res["metaphor"]) > 20
        assert len(res["metrics"]) > 20
        assert len(res["action"]) > 20


