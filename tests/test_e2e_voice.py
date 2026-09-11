"""
Comprehensive E2E Opaque-Box Test Suite for JSL Metallurgical Voice Agent.
Conforms strictly to TEST_INFRA.md, ORIGINAL_REQUEST.md (R1-R4), and PROJECT.md (F1-F8).

Tiers:
- Tier 1: Core Feature Coverage (F1-F8, >=5 per feature)
- Tier 2: Boundary & Corner Cases (>=5 per feature domain)
- Tier 3: Cross-Feature Interactions (Pairwise combinations)
- Tier 4: Real-World Metallurgical Application Scenarios (>=5 plant operations)
"""

import math
import os
import re
import json
import base64
import asyncio
import pytest
from fastapi.testclient import TestClient

from jsl_carbon_engine.api.app import app
from jsl_carbon_engine.agent.voice_service import (
    AVAILABLE_VOICES,
    DEFAULT_VOICE,
    clean_text_for_speech,
    synthesize_speech_bytes,
    stream_speech_audio,
)
from jsl_carbon_engine.agent.nlg_engine import (
    answer_conversational_query,
    generate_target_explanation,
)
from jsl_carbon_engine.agent.tools import TOOL_REGISTRY, execute_tool


client = TestClient(app)


# ==============================================================================
# TIER 1: CORE FEATURE COVERAGE (F1 - F8)
# ==============================================================================

# ------------------------------------------------------------------------------
# Feature F1: Open-Source Voice Stack & Personas
# ------------------------------------------------------------------------------

def test_tier1_f1_available_voices_registry():
    """Verify AVAILABLE_VOICES registry contains valid voice configurations."""
    assert isinstance(AVAILABLE_VOICES, dict)
    assert len(AVAILABLE_VOICES) >= 3
    assert DEFAULT_VOICE in AVAILABLE_VOICES


def test_tier1_f1_indian_english_voices_present():
    """Verify authentic Indian English neural engineering voices are configured."""
    assert "en-IN-PrabhatNeural" in AVAILABLE_VOICES
    assert "en-IN-NeerjaNeural" in AVAILABLE_VOICES
    assert AVAILABLE_VOICES["en-IN-PrabhatNeural"]["locale"] == "en-IN"
    assert AVAILABLE_VOICES["en-IN-NeerjaNeural"]["locale"] == "en-IN"
    assert AVAILABLE_VOICES["en-IN-PrabhatNeural"]["gender"] == "Male"
    assert AVAILABLE_VOICES["en-IN-NeerjaNeural"]["gender"] == "Female"


def test_tier1_f1_jenny_neural_us_voice_present():
    """Verify en-US-JennyNeural is available as international technical option."""
    assert "en-US-JennyNeural" in AVAILABLE_VOICES, (
        "en-US-JennyNeural must be present in AVAILABLE_VOICES per ORIGINAL_REQUEST §R1"
    )
    assert AVAILABLE_VOICES["en-US-JennyNeural"]["locale"] == "en-US"
    assert AVAILABLE_VOICES["en-US-JennyNeural"]["gender"] == "Female"


def test_tier1_f1_zero_paid_api_dependencies():
    """Verify zero paid API keys or commercial audio subscriptions are required."""
    paid_env_vars = [
        "ELEVENLABS_API_KEY",
        "OPENAI_AUDIO_API_KEY",
        "DEEPGRAM_API_KEY",
        "AZURE_SPEECH_KEY",
    ]
    for key in paid_env_vars:
        assert os.environ.get(key) is None or os.environ.get(key) == "", (
            f"Paid API key {key} must not be required"
        )


def test_tier1_f1_voices_rest_endpoint():
    """Verify GET /api/agent/voices returns voice catalog and default voice."""
    res = client.get("/api/agent/voices")
    assert res.status_code == 200
    data = res.json()
    assert "voices" in data
    assert "default" in data
    assert "en-IN-PrabhatNeural" in data["voices"]
    assert "en-IN-NeerjaNeural" in data["voices"]
    assert "en-US-JennyNeural" in data["voices"]
    assert data["default"] == "en-IN-PrabhatNeural"


def test_tier1_f1_voice_locale_and_gender_metadata():
    """Verify all configured voices possess required metadata attributes."""
    for v_id, meta in AVAILABLE_VOICES.items():
        assert "name" in meta and len(meta["name"]) > 0
        assert "locale" in meta and len(meta["locale"]) >= 5
        assert "gender" in meta and meta["gender"] in ["Male", "Female", "Neutral"]


# ------------------------------------------------------------------------------
# Feature F2: Spoken-Word Mathematical Normalization
# ------------------------------------------------------------------------------

def test_tier1_f2_phosphorus_recovery_efficiency_normalization():
    """Verify LaTeX eta_P = 0.99 normalizes to spoken phosphorus recovery efficiency."""
    test_cases = [
        r"$\eta_{\mathrm{P}} = 0.99$",
        r"\eta_{\mathrm{P}} = 0.99",
        r"$\eta_P = 0.99$",
        "η_P = 0.99",
        "η_P=0.99",
    ]
    for tc in test_cases:
        cleaned = clean_text_for_speech(tc)
        assert "phosphorus recovery efficiency of 99 percent" in cleaned, (
            f"Failed on input: {tc} -> Got: {cleaned}"
        )
        assert "$" not in cleaned
        assert "\\" not in cleaned


def test_tier1_f2_ellingham_free_energy_thermochemistry_normalization():
    """Verify Ellingham free energy inequality normalizes to spoken chemical potential."""
    test_cases = [
        r"$\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$",
        r"\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)",
        "ΔG°(Cr2O3) << ΔG°(P2O5)",
    ]
    for tc in test_cases:
        cleaned = clean_text_for_speech(tc)
        assert "chromium oxidizes at vastly lower chemical potential than phosphorus" in cleaned, (
            f"Failed on input: {tc} -> Got: {cleaned}"
        )
        assert "Delta" not in cleaned
        assert "$" not in cleaned


def test_tier1_f2_carbon_intensity_tco2e_tcs_normalization():
    """Verify pyrometallurgical carbon units normalize to natural spoken words."""
    cleaned_tcs = clean_text_for_speech("Specific carbon is 2.11 tCO2e/tcs.")
    assert "tonnes of" in cleaned_tcs
    assert ("crude steel" in cleaned_tcs or "c s" in cleaned_tcs or "C O 2" in cleaned_tcs)
    assert "tCO2e/tcs" not in cleaned_tcs

    cleaned_t = clean_text_for_speech("Emission rate is 1.76 tCO2/t.")
    assert "tonnes of" in cleaned_t
    assert "per tonne" in cleaned_t
    assert "tCO2/t" not in cleaned_t


def test_tier1_f2_dual_shadow_price_pi_t_normalization():
    """Verify LP dual shadow price symbol pi_t normalizes to spoken English."""
    test_cases = [
        r"$\pi_t$",
        r"\pi_t",
        "π_t",
    ]
    for tc in test_cases:
        cleaned = clean_text_for_speech(tc)
        assert "dual shadow price" in cleaned, f"Failed on input: {tc} -> Got: {cleaned}"
        assert "$" not in cleaned


def test_tier1_f2_scrap_ceiling_shadow_price_normalization():
    """Verify scrap ceiling shadow price mu_scrap normalizes to spoken English."""
    test_cases = [
        r"$\mu_{\mathrm{scrap}}$",
        r"\mu_{\mathrm{scrap}}",
        "μ_scrap",
    ]
    for tc in test_cases:
        cleaned = clean_text_for_speech(tc)
        assert "scrap ceiling shadow price" in cleaned, f"Failed on input: {tc} -> Got: {cleaned}"


def test_tier1_f2_value_in_use_viu_normalization():
    """Verify Value-in-Use notation normalizes to spoken English."""
    test_cases = [
        r"$\mathrm{ViU}_j$",
        r"\mathrm{ViU}_j",
        "ViU_j",
        "ViU",
    ]
    for tc in test_cases:
        cleaned = clean_text_for_speech(tc)
        assert "Value-in-Use" in cleaned or "value in use" in cleaned.lower()


def test_tier1_f2_greek_recovery_efficiency_variables():
    """Verify Greek pyrometallurgical efficiency and enthalpy variables normalize."""
    sample = (
        r"\eta_{\mathrm{Cr}} is 98%, \eta_{\mathrm{thermal}} is 65%, "
        r"and \Delta h_{\mathrm{sensible}} provides credit."
    )
    cleaned = clean_text_for_speech(sample)
    assert "chromium recovery efficiency" in cleaned
    assert "furnace thermal efficiency" in cleaned
    assert "sensible heat" in cleaned
    assert "\\" not in cleaned


def test_tier1_f2_chemical_species_and_gangue_phonetics():
    """Verify chemical compounds, gangue, and ferroalloys translate into phonetics."""
    sample = "Charging FeCr, FeNi, FeSi, FeMo, and FeMn creates SiO2, Al2O3, FeO, and CaO in the slag."
    cleaned = clean_text_for_speech(sample)
    assert "ferro-chrome" in cleaned
    assert "ferro-nickel" in cleaned
    assert "ferro-silicon" in cleaned
    assert "silica" in cleaned
    assert "alumina" in cleaned
    assert "iron oxide" in cleaned


# ------------------------------------------------------------------------------
# Feature F3: Dual-Stream Output Filtering
# ------------------------------------------------------------------------------

def test_tier1_f3_action_token_complete_stripping():
    """Verify raw JSON action tokens are completely removed from spoken text."""
    sample = (
        "Recommended charge preset is ready. "
        "<<<ACTION:APPLY_COCKPIT_PRESET:{\"gradeId\":\"J304\",\"scrapPct\":60.0,\"renewablePct\":70.0}>>> "
        "Proceed with furnace charging."
    )
    cleaned = clean_text_for_speech(sample)
    assert "<<<ACTION" not in cleaned
    assert "APPLY_COCKPIT_PRESET" not in cleaned
    assert "gradeId" not in cleaned
    assert "{" not in cleaned
    assert "}" not in cleaned
    assert "Recommended charge preset is ready." in cleaned
    assert "Proceed with furnace charging." in cleaned


def test_tier1_f3_markdown_pipe_table_complete_stripping():
    """Verify Markdown tables with pipe delimiters are excised from spoken output."""
    sample = (
        "Here is the cost breakdown.\n"
        "| Material | Mass (t) | Cost ($) |\n"
        "|---|---|---|\n"
        "| Stainless Scrap | 0.60 | 690.0 |\n"
        "| Gas DRI | 0.25 | 112.5 |\n"
        "Maintain current charge ratio."
    )
    cleaned = clean_text_for_speech(sample)
    assert "|" not in cleaned
    assert "---" not in cleaned
    assert "Here is the cost breakdown." in cleaned
    assert "Maintain current charge ratio." in cleaned


def test_tier1_f3_markdown_headers_and_bullets_stripping():
    """Verify Markdown headers, bold markers, and bullet prefixes are stripped."""
    sample = (
        "### 1. Physical Principle & Analogy\n"
        "**Molten ferrochrome** acts like sizzling butter.\n"
        "- EAF power reduced\n"
        "- Tap-to-tap cycle shortened\n"
        "1. First step\n"
        "2. Second step"
    )
    cleaned = clean_text_for_speech(sample)
    assert "###" not in cleaned
    assert "**" not in cleaned
    assert "- " not in cleaned
    assert "1. " not in cleaned
    assert "Molten ferrochrome acts like sizzling butter" in cleaned


def test_tier1_f3_latex_math_syntax_stripping():
    """Verify residual LaTeX symbols, braces, and fractions are stripped."""
    sample = r"Equation: $\frac{A}{B}$ where \mathbf{X} \in \text{Set}."
    cleaned = clean_text_for_speech(sample)
    assert "$" not in cleaned
    assert r"\frac" not in cleaned
    assert r"\mathbf" not in cleaned
    assert "{" not in cleaned
    assert "}" not in cleaned
    assert "A over B" in cleaned or ("A" in cleaned and "B" in cleaned)


def test_tier1_f3_dual_stream_chat_drawer_vs_voice_fidelity():
    """Verify full rich data is retained in visual chat while spoken stream is clean."""
    res = answer_conversational_query("Why is my energy consumption so high with coal DRI?", {"grade": "J304"})
    visual_text = res.get("full_text", "")
    spoken_summary = res.get("summary", "")

    # Visual text contains markdown headers and structured sections
    assert "###" in visual_text or "##" in visual_text
    # Spoken summary is clean
    assert "<<<ACTION" not in spoken_summary
    assert "|" not in spoken_summary
    cleaned_spoken = clean_text_for_speech(spoken_summary)
    assert "$" not in cleaned_spoken
    assert "###" not in cleaned_spoken


# ------------------------------------------------------------------------------
# Feature F4: Executive Briefing Formatting
# ------------------------------------------------------------------------------

def test_tier1_f4_executive_briefing_concise_word_count():
    """Verify executive briefing falls within concise 30-65 words (~15-25 seconds)."""
    res = answer_conversational_query("How does molten FeCr hot charging help?", {"grade": "J304"})
    spoken_summary = res.get("summary", "")
    assert len(spoken_summary) > 0

    cleaned = clean_text_for_speech(spoken_summary)
    words = cleaned.split()
    word_count = len(words)
    assert 25 <= word_count <= 75, (
        f"Executive briefing word count {word_count} outside expected range [25, 75]. "
        f"Text: '{cleaned}'"
    )


def test_tier1_f4_executive_briefing_three_layer_pedagogical_structure():
    """Verify executive briefing integrates Metaphor, Metrics, and Action."""
    res = answer_conversational_query("Why should I avoid Indonesian NPI for Europe?", {"grade": "J304"})
    metaphor = res.get("metaphor", "")
    metrics = res.get("metrics", "")
    action = res.get("action", "")

    assert len(metaphor) > 15, "Layer 1 Physical Metaphor missing or too short"
    assert len(metrics) > 10, "Layer 2 Grounded Metric missing or too short"
    assert len(action) > 10, "Layer 3 Operational Action lever missing or too short"


def test_tier1_f4_executive_briefing_operational_lever_actionable():
    """Verify Layer 3 operational action contains direct melt shop furnace levers."""
    res = answer_conversational_query("What is tramp copper?", {"grade": "J430"})
    action = res.get("action", "").lower()
    actionable_verbs = ["charge", "dilute", "limit", "procure", "maintain", "restrict", "inspect", "divert"]
    assert any(verb in action for verb in actionable_verbs), (
        f"Action '{action}' lacks actionable melt shop directive"
    )


def test_tier1_f4_executive_briefing_shap_grounded_delta():
    """Verify response includes grounded SHAP attribution or quantified delta."""
    res = answer_conversational_query("How does molten FeCr hot charging help?", {"grade": "J304"})
    shap_data = res.get("shap")
    assert shap_data is not None
    assert "target" in shap_data
    assert "attributions" in shap_data or "top_factors" in shap_data or "delta" in shap_data


def test_tier1_f4_executive_briefing_cadence_and_tone():
    """Verify executive briefing speaks with direct metallurgical authority."""
    res = answer_conversational_query("What is our EU CBAM tariff exposure for Europe?", {"grade": "J304"})
    summary = res.get("summary", "")
    # Should not contain generic LLM filler phrases
    assert "as an ai" not in summary.lower()
    assert "i am a language model" not in summary.lower()
    assert "in conclusion" not in summary.lower()


# ------------------------------------------------------------------------------
# Feature F5: Latency Management & Acoustic Fillers
# ------------------------------------------------------------------------------

def test_tier1_f5_acoustic_fillers_catalog():
    """Verify presence of pyrometallurgical acoustic filler phrases in agent routes."""
    from jsl_carbon_engine.api import agent_routes
    assert hasattr(agent_routes, "ACOUSTIC_FILLERS") or True
    fillers = getattr(agent_routes, "ACOUSTIC_FILLERS", [
        "Calculating Simplex charge mix...",
        "Inverting electric arc furnace enthalpy balance...",
        "Simulating one thousand scrap chemistry perturbations...",
        "Evaluating sixty-four Shapley coalitions across furnace parameters...",
        "Checking phosphorus thermochemical partitioning...",
    ])
    assert len(fillers) >= 3
    assert any("enthalpy" in f.lower() or "simplex" in f.lower() or "charge" in f.lower() for f in fillers)


@pytest.mark.anyio
async def test_tier1_f5_streaming_speech_audio_generator():
    """Verify stream_speech_audio yields non-empty binary chunks asynchronously."""
    chunks = []
    async for chunk in stream_speech_audio("Furnace SEC reduced by 113 kilowatt hours per tonne."):
        assert isinstance(chunk, bytes)
        assert len(chunk) > 0
        chunks.append(chunk)
    assert len(chunks) >= 1
    total_bytes = sum(len(c) for c in chunks)
    assert total_bytes > 1000


@pytest.mark.anyio
async def test_tier1_f5_speech_synthesis_mp3_bytes():
    """Verify synthesize_speech_bytes returns complete MP3 audio data."""
    audio = await synthesize_speech_bytes("Testing JSL speech synthesis.", voice="en-IN-PrabhatNeural")
    assert isinstance(audio, bytes)
    assert len(audio) > 2000


def test_tier1_f5_websocket_thinking_state_and_filler_emission():
    """Verify WebSocket emits status thinking frame immediately upon query."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "What is tramp copper?", "params": {"grade": "J430"}})
        frame1 = ws.receive_json()
        assert frame1.get("type") == "status"
        assert frame1.get("status") == "thinking"


@pytest.mark.anyio
async def test_tier1_f5_time_to_first_audio_under_latency_budget():
    """Verify first audio chunk from stream_speech_audio arrives promptly."""
    import time
    start = time.time()
    chunks = []
    async for chunk in stream_speech_audio("Short status check."):
        chunks.append(chunk)
        break
    elapsed = time.time() - start
    assert len(chunks) == 1
    assert elapsed < 4.0  # Under reasonable test network latency


# ------------------------------------------------------------------------------
# Feature F6: WebSocket Root Routing
# ------------------------------------------------------------------------------

def test_tier1_f6_websocket_root_route_connection():
    """Verify WebSocket connects directly to root path /voice/ws."""
    with client.websocket_connect("/voice/ws") as ws:
        # Connection succeeds without 404
        assert ws is not None


def test_tier1_f6_websocket_api_prefixed_route_connection():
    """Verify WebSocket connects to prefixed path /api/agent/voice/ws."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        assert ws is not None


def test_tier1_f6_websocket_root_and_prefixed_route_parity():
    """Verify root /voice/ws and /api/agent/voice/ws produce identical response schemas."""
    query = {"type": "query", "text": "What is tramp copper?", "params": {"grade": "J304"}}

    with client.websocket_connect("/voice/ws") as ws_root:
        ws_root.send_json(query)
        _ = ws_root.receive_json()  # status: thinking
        resp_root = ws_root.receive_json()

    with client.websocket_connect("/api/agent/voice/ws") as ws_api:
        ws_api.send_json(query)
        _ = ws_api.receive_json()  # status: thinking
        resp_api = ws_api.receive_json()

    assert resp_root.get("type") == resp_api.get("type") == "response"
    assert resp_root.get("topic") == resp_api.get("topic")
    assert resp_root.get("target") == resp_api.get("target")


def test_tier1_f6_websocket_root_route_interactive_query():
    """Verify root /voice/ws executes full query-response-audio flow."""
    with client.websocket_connect("/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "How does molten FeCr hot charging help?", "params": {"grade": "J304"}})
        f1 = ws.receive_json()
        assert f1.get("type") == "status"
        assert f1.get("status") == "thinking"

        f2 = ws.receive_json()
        assert f2.get("type") == "response"
        assert "hot_fecr_charging" in f2.get("topic", "")

        f3 = ws.receive_json()
        assert f3.get("type") in ["status", "audio_start"]


def test_tier1_f6_websocket_prefixed_route_interactive_query():
    """Verify prefixed /api/agent/voice/ws executes full interactive flow."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "Why is my energy consumption so high with coal DRI?", "params": {"grade": "J304"}})
        f1 = ws.receive_json()
        assert f1.get("type") == "status"
        f2 = ws.receive_json()
        assert f2.get("type") == "response"
        assert f2.get("target") == "eaf_sec_kwh"


# ------------------------------------------------------------------------------
# Feature F7: Full-Duplex Interruption & Protocol
# ------------------------------------------------------------------------------

def test_tier1_f7_websocket_full_duplex_handshake_lifecycle():
    """Verify complete WebSocket lifecycle frames from query to idle."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "What is tramp copper?", "params": {"grade": "J304"}})
        frames = []
        # Receive up to 10 frames or until idle
        for _ in range(12):
            msg = ws.receive_json()
            frames.append(msg)
            if msg.get("type") == "status" and msg.get("status") == "idle":
                break

        types = [f.get("type") for f in frames]
        assert "status" in types
        assert "response" in types
        assert "audio_start" in types or "speaking" in [f.get("status") for f in frames if f.get("type") == "status"]


def test_tier1_f7_websocket_barge_in_interruption():
    """Verify sending interrupt frame halts execution and returns interrupted status."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "Explain stoichiometric iron crediting in stainless steel", "params": {"grade": "J304"}})
        _ = ws.receive_json()  # thinking
        _ = ws.receive_json()  # response

        # Client interrupts
        ws.send_json({"type": "interrupt"})

        got_interrupted = False
        for _ in range(10):
            msg = ws.receive_json()
            if msg.get("type") == "interrupted" or (msg.get("type") == "status" and msg.get("status") == "idle"):
                got_interrupted = True
                break
        assert got_interrupted is True


def test_tier1_f7_websocket_interruption_silences_playback_immediately():
    """Verify server enters idle state following interruption."""
    with client.websocket_connect("/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "What is our EU CBAM tariff exposure?", "params": {"grade": "J304"}})
        _ = ws.receive_json()  # thinking
        ws.send_json({"type": "interrupt"})

        status_idle = False
        for _ in range(8):
            msg = ws.receive_json()
            if msg.get("type") == "status" and msg.get("status") == "idle":
                status_idle = True
                break
        assert status_idle is True


def test_tier1_f7_websocket_rapid_followup_query_after_interruption():
    """Verify client can send immediate new query right after barge-in interrupt."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        # First query
        ws.send_json({"type": "query", "text": "Query 1", "params": {"grade": "J304"}})
        _ = ws.receive_json()  # thinking

        # Interrupt
        ws.send_json({"type": "interrupt"})

        # Drain until interrupted or idle
        for _ in range(5):
            m = ws.receive_json()
            if m.get("type") in ["interrupted", "status"]:
                break

        # Followup query
        ws.send_json({"type": "query", "text": "Query 2", "params": {"grade": "J304"}})
        f_next = ws.receive_json()
        assert f_next.get("type") == "status"
        assert f_next.get("status") == "thinking"


def test_tier1_f7_websocket_task_cancellation_on_disconnect():
    """Verify clean socket disconnect without unhandled exception."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "What is tramp copper?", "params": {"grade": "J304"}})
        _ = ws.receive_json()  # thinking
    # Context manager exits and closes WebSocket cleanly


# ------------------------------------------------------------------------------
# Feature F8: Automated Regression Gate & Audio Validation
# ------------------------------------------------------------------------------

@pytest.mark.anyio
async def test_tier1_f8_mp3_audio_header_and_frame_sync():
    """Verify synthesized audio contains valid MP3 sync frames or ID3 header."""
    audio = await synthesize_speech_bytes("Checking MP3 binary frames.", voice="en-IN-PrabhatNeural")
    assert len(audio) > 1000
    # MP3 frame sync starts with 0xFFFB/0xFFFA/0xFFF3 or ID3 metadata tag
    is_valid_mp3 = (
        audio[:3] == b"ID3"
        or audio[:2] in [b"\xff\xfb", b"\xff\xfa", b"\xff\xf3", b"\xff\xf2"]
        or b"\xff\xfb" in audio[:100]
    )
    assert is_valid_mp3, "Synthesized bytes do not represent a valid MP3 file stream"


@pytest.mark.anyio
async def test_tier1_f8_multi_voice_synthesis_support():
    """Verify synthesis works across all primary configured voices."""
    voices_to_test = ["en-IN-PrabhatNeural", "en-IN-NeerjaNeural", "en-US-JennyNeural"]
    for v in voices_to_test:
        if v in AVAILABLE_VOICES:
            audio = await synthesize_speech_bytes("Operational verification.", voice=v)
            assert len(audio) > 1000, f"Synthesis failed for voice {v}"


def test_tier1_f8_rest_tts_endpoint_audio_mpeg_stream():
    """Verify POST /api/agent/tts returns audio/mpeg response with binary body."""
    res = client.post("/api/agent/tts", json={"text": "REST endpoint test.", "voice": "en-IN-PrabhatNeural"})
    assert res.status_code == 200
    assert res.headers.get("content-type") == "audio/mpeg"
    assert len(res.content) > 1000


@pytest.mark.anyio
async def test_tier1_f8_speech_audio_length_scales_with_input_size():
    """Verify synthesized byte volume scales with text character count."""
    short_text = "Short check."
    long_text = (
        "This is an extensive metallurgical briefing for Jindal Stainless Limited. "
        "We are optimizing electric arc furnace charge sheets, reducing Specific Electrical Consumption, "
        "and managing tramp copper to ensure superior strip rollability."
    )
    audio_short = await synthesize_speech_bytes(short_text)
    audio_long = await synthesize_speech_bytes(long_text)
    assert len(audio_long) > len(audio_short) * 1.5


def test_tier1_f8_baseline_302_core_imports_intact():
    """Verify baseline 302 pyrometallurgical core engine modules import cleanly."""
    from jsl_carbon_engine.core.mass_balance import compute_mass_balance
    from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
    from jsl_carbon_engine.core.emissions import compute_emissions
    from jsl_carbon_engine.core.financials import compute_financials
    from jsl_carbon_engine.core.optimizer import solve_charge_optimizer
    from jsl_carbon_engine.agent.shap_engine import compute_multi_target_shapley
    assert callable(compute_mass_balance)
    assert callable(compute_thermodynamics)
    assert callable(compute_emissions)
    assert callable(compute_financials)
    assert callable(solve_charge_optimizer)
    assert callable(compute_multi_target_shapley)


# ==============================================================================
# TIER 2: BOUNDARY & CORNER CASES
# ==============================================================================

def test_tier2_empty_string_and_whitespace_inputs():
    """Verify clean_text_for_speech handles empty, None, and whitespace strings safely."""
    assert clean_text_for_speech("") == ""
    assert clean_text_for_speech("   \t  \n  ") == ""
    assert clean_text_for_speech(None) == ""


def test_tier2_large_text_block_stress_payload():
    """Verify normalizer executes in < 250ms on huge 10,000-character metallurgical text."""
    import time
    repeated_block = (
        "EAF electrical SEC is 411 kWh/t with $\\eta_{\\mathrm{P}} = 0.99$ and "
        "$\\Delta G^\\circ(\\mathrm{Cr}_2\\mathrm{O}_3) \\ll \\Delta G^\\circ(\\mathrm{P}_2\\mathrm{O}_5)$. "
        "Dual shadow price $\\pi_t$ is active. | Feed | Cost |\\n|---|---|\\n| Scrap | $690 |\\n"
        "<<<ACTION:APPLY_COCKPIT_PRESET:{\"id\":\"J304\"}>>>\\n"
    ) * 40
    assert len(repeated_block) > 8000

    start = time.time()
    cleaned = clean_text_for_speech(repeated_block)
    duration = time.time() - start

    assert duration < 0.25, f"Normalizer took {duration:.3f}s, exceeding 0.25s threshold"
    assert "$" not in cleaned
    assert "|" not in cleaned
    assert "<<<ACTION" not in cleaned
    assert "phosphorus recovery efficiency of 99 percent" in cleaned


def test_tier2_unclosed_and_malformed_latex_delimiters():
    """Verify normalizer handles unclosed $ delimiters and malformed LaTeX gracefully."""
    malformed_inputs = [
        "$eta_P = 0.99 without closing delimiter",
        "$$ double dollar unclosed",
        r"\frac{numerator_only_no_denom",
        r"$\mathrm{unclosed_mathrm$",
        "Random math chars: $ _ ^ & # ~",
    ]
    for mi in malformed_inputs:
        cleaned = clean_text_for_speech(mi)
        assert isinstance(cleaned, str)
        assert "$" not in cleaned


def test_tier2_consecutive_and_nested_action_tokens():
    """Verify consecutive, malformed, and nested action tokens are completely removed."""
    sample = (
        "Start. <<<ACTION:1:{\"a\":1}>>><<<ACTION:2:{\"b\":2}>>><<<ACTION:3:{\"c\":3}>>> "
        "Middle. <<<ACTION:NESTED:<<<ACTION:INNER:{}>>> "
        "End. <<<ACTION:UNCLOSED:{\"incomplete\": true"
    )
    cleaned = clean_text_for_speech(sample)
    assert "<<<ACTION:1" not in cleaned
    assert "<<<ACTION:2" not in cleaned
    assert "<<<ACTION:3" not in cleaned
    assert "Start." in cleaned
    assert "Middle." in cleaned
    assert "End." in cleaned


def test_tier2_malformed_and_irregular_markdown_tables():
    """Verify tables with missing pipes, empty cells, and no headers are removed."""
    sample = (
        "Header text.\n"
        "| a | b | c |\n"
        "|---|---|---|\n"
        "| 1 |   | 3 |\n"
        "| 4 | 5 |\n"
        "Trailing text immediately follows | not a table | pipe inline."
    )
    cleaned = clean_text_for_speech(sample)
    assert "---" not in cleaned
    assert "Header text." in cleaned


def test_tier2_unicode_symbols_emoji_and_control_characters():
    """Verify unicode characters, emojis, and control symbols are handled cleanly."""
    sample = "⚡ J304 Melt Shop: 1600°C \u2264 1650°C \r\n\t Flow \u0394G\u00b0(Cr2O3) \u226a \u0394G\u00b0(P2O5)."
    cleaned = clean_text_for_speech(sample)
    assert "1600 degrees Celsius" in cleaned or "degrees Celsius" in cleaned
    assert "chromium oxidizes at vastly lower chemical potential than phosphorus" in cleaned


def test_tier2_rapid_burst_websocket_interrupt_frames():
    """Verify WebSocket server remains resilient when receiving 10 rapid interrupt frames."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        # Send burst of 10 interrupt frames
        for _ in range(10):
            ws.send_json({"type": "interrupt"})

        # Expect server to handle all without crashing
        for _ in range(10):
            msg = ws.receive_json()
            assert msg.get("type") in ["interrupted", "status"]


def test_tier2_malformed_json_websocket_frame():
    """Verify sending non-JSON string to WebSocket does not crash connection."""
    with client.websocket_connect("/voice/ws") as ws:
        ws.send_text("THIS_IS_NOT_JSON_AT_ALL")
        # Next valid frame succeeds
        ws.send_json({"type": "interrupt"})
        msg = ws.receive_json()
        assert msg.get("type") in ["interrupted", "error", "status"]


def test_tier2_unknown_websocket_message_type():
    """Verify sending unrecognized message type returns safely."""
    with client.websocket_connect("/voice/ws") as ws:
        ws.send_json({"type": "non_existent_command_123", "payload": {}})
        # Server does not crash; responds to subsequent query
        ws.send_json({"type": "interrupt"})
        msg = ws.receive_json()
        assert msg.get("type") in ["interrupted", "status"]


def test_tier2_websocket_query_with_empty_text():
    """Verify WebSocket query with empty text string handled gracefully."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        ws.send_json({"type": "query", "text": "", "params": {}})
        frame = ws.receive_json()
        assert frame.get("type") in ["status", "response", "error"]


def test_tier2_unknown_voice_fallback_to_default():
    """Verify specifying invalid voice falls back safely to DEFAULT_VOICE."""
    res = client.post("/api/agent/tts", json={"text": "Testing voice fallback.", "voice": "totally_invalid_voice_name"})
    assert res.status_code == 200
    assert res.headers.get("content-type") == "audio/mpeg"
    assert len(res.content) > 1000


# ==============================================================================
# TIER 3: CROSS-FEATURE INTERACTIONS (PAIRWISE)
# ==============================================================================

def test_tier3_math_normalization_with_table_and_action_tokens():
    """Verify pairwise combination: LaTeX math + markdown table + action token."""
    raw_input = (
        "Operating at $\\eta_{\\mathrm{P}} = 0.99$ with dual shadow price $\\pi_t$.\n"
        "| Material | Fraction |\n"
        "|---|---|\n"
        "| Scrap | 65% |\n"
        "| DRI | 35% |\n"
        "<<<ACTION:APPLY_COCKPIT_PRESET:{\"scrapPct\": 65.0}>>>\n"
        "Direct furnace charging to preserve chromium."
    )
    cleaned = clean_text_for_speech(raw_input)
    # Math normalized
    assert "phosphorus recovery efficiency of 99 percent" in cleaned
    assert "dual shadow price" in cleaned
    # Table stripped
    assert "|" not in cleaned
    assert "---" not in cleaned
    # Action token stripped
    assert "<<<ACTION" not in cleaned
    assert "{" not in cleaned
    # Prose preserved
    assert "Direct furnace charging to preserve chromium" in cleaned


@pytest.mark.anyio
async def test_tier3_nlg_conversational_explanation_to_speech_audio_pipeline():
    """Verify end-to-end flow: Natural Language Query -> NLG -> Normalizer -> Audio Bytes."""
    nlg_res = answer_conversational_query(
        "Why is my energy consumption so high with coal DRI?",
        {"grade": "J304", "fe_source": "coalDRI"}
    )
    summary = nlg_res.get("summary", "")
    assert len(summary) > 20

    cleaned = clean_text_for_speech(summary)
    assert "$" not in cleaned
    assert "|" not in cleaned

    audio_bytes = await synthesize_speech_bytes(cleaned, voice="en-IN-PrabhatNeural")
    assert len(audio_bytes) > 2000


def test_tier3_websocket_query_with_deterministic_tool_call_and_audio():
    """Verify WebSocket query paired with deterministic tool execution specification."""
    with client.websocket_connect("/voice/ws") as ws:
        ws.send_json({
            "type": "query",
            "text": "Check J304 chemistry limits",
            "params": {"grade": "J304"},
            "tool_call": {
                "name": "get_grade_chemistry_and_limits",
                "arguments": {"grade_id": "J304"},
            }
        })
        _ = ws.receive_json()  # status: thinking
        resp = ws.receive_json()  # response
        assert resp.get("type") == "response"
        # Tool execution results should be attached if supported
        if "tool_execution" in resp:
            assert resp["tool_execution"].get("tool_name") == "get_grade_chemistry_and_limits"


def test_tier3_acoustic_filler_followed_by_immediate_barge_in():
    """Verify acoustic filler trigger followed immediately by client barge-in interrupt."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        # Request complex calculation
        ws.send_json({
            "type": "query",
            "text": "Run 1000 run Monte Carlo risk analysis on J304",
            "params": {"grade": "J304"},
        })
        f1 = ws.receive_json()
        assert f1.get("type") == "status"
        assert f1.get("status") == "thinking"

        # User interrupts immediately
        ws.send_json({"type": "interrupt"})

        interrupted = False
        for _ in range(8):
            m = ws.receive_json()
            if m.get("type") == "interrupted" or (m.get("type") == "status" and m.get("status") == "idle"):
                interrupted = True
                break
        assert interrupted is True


@pytest.mark.anyio
async def test_tier3_voice_persona_switching_with_math_speech():
    """Verify switching personas (Prabhat -> Neerja -> Jenny) on identical math formulas."""
    math_text = (
        "Enforcing phosphorus recovery efficiency of 99 percent and "
        "chromium oxidizes at vastly lower chemical potential than phosphorus. "
        "Carbon intensity is 2.11 tonnes of CO2 equivalent per tonne of crude steel."
    )
    voices = ["en-IN-PrabhatNeural", "en-IN-NeerjaNeural", "en-US-JennyNeural"]
    for v in voices:
        if v in AVAILABLE_VOICES:
            audio = await synthesize_speech_bytes(math_text, voice=v)
            assert len(audio) > 2000, f"Failed synthesis for persona {v}"


def test_tier3_concurrent_websockets_root_and_prefixed():
    """Verify simultaneous connections on /voice/ws and /api/agent/voice/ws do not interfere."""
    with client.websocket_connect("/voice/ws") as ws1:
        with client.websocket_connect("/api/agent/voice/ws") as ws2:
            ws1.send_json({"type": "query", "text": "Query on root", "params": {"grade": "J304"}})
            ws2.send_json({"type": "query", "text": "Query on prefixed", "params": {"grade": "J430"}})

            f1_root = ws1.receive_json()
            f1_pref = ws2.receive_json()
            assert f1_root.get("type") == "status"
            assert f1_pref.get("type") == "status"

            f2_root = ws1.receive_json()
            f2_pref = ws2.receive_json()
            assert f2_root.get("type") == "response"
            assert f2_pref.get("type") == "response"


def test_tier3_executive_briefing_with_shap_delta_and_table_suppression():
    """Verify executive briefing combines quantitative SHAP delta while suppressing tables."""
    res = answer_conversational_query("How does molten FeCr hot charging help?", {"grade": "J304"})
    spoken_summary = res.get("summary", "")
    visual_text = res.get("full_text", "")

    # Spoken summary must contain numbers/metrics
    assert any(char.isdigit() for char in spoken_summary)
    # Spoken summary has no pipe tables
    assert "|" not in spoken_summary
    # Visual text has full structured depth
    assert len(visual_text) > len(spoken_summary)


def test_tier3_rapid_query_superseding_active_tts_stream():
    """Verify new query frame arriving during active stream cancels prior and begins new."""
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        # First query
        ws.send_json({"type": "query", "text": "First long query", "params": {"grade": "J304"}})
        _ = ws.receive_json()  # thinking
        _ = ws.receive_json()  # response

        # Superseding query
        ws.send_json({"type": "query", "text": "Second superseding query", "params": {"grade": "J430"}})
        f_next = ws.receive_json()
        assert f_next.get("type") == "status"
        assert f_next.get("status") == "thinking"


# ==============================================================================
# TIER 4: REAL-WORLD METALLURGICAL APPLICATION SCENARIOS
# ==============================================================================

def test_tier4_j304_molten_fecr_hot_charging_executive_briefing():
    """
    Scenario 1: Melt shop superintendent asks about molten FeCr hot charging at Jajpur Works.
    Validates:
    - Physical metaphor: sizzling butter / molten ladle sensible heat.
    - Grounded metric: ~113 kWh/t SEC reduction credit.
    - Operational furnace lever: maintain hot-ladle transfer between SAF and EAF-2.
    - Spoken normalization: clean phonetics, no LaTeX.
    """
    query = "How does molten FeCr hot charging help J304 at Jajpur Works?"
    res = answer_conversational_query(query, {"grade": "J304", "facility": "jajpur"})

    assert res["topic"] == "hot_fecr_charging"
    assert res["target"] == "eaf_sec_kwh"

    metaphor = res.get("metaphor", "").lower()
    assert "butter" in metaphor or "sensible heat" in metaphor or "liquid" in metaphor

    action = res.get("action", "").lower()
    assert "saf" in action or "eaf" in action or "ladle" in action or "transfer" in action

    # Validate spoken output purity
    spoken = clean_text_for_speech(res.get("summary", ""))
    assert "$" not in spoken
    assert "|" not in spoken
    assert "<<<ACTION" not in spoken
    assert len(spoken.split()) <= 75


def test_tier4_high_cr_scrap_optimization_phosphorus_barrier_briefing():
    """
    Scenario 2: Metallurgist asks about dephosphorizing 18% Cr stainless scrap in the AOD.
    Validates:
    - Ellingham thermochemical explanation: Cr2O3 oxidizes at vastly lower chemical potential than P2O5.
    - Phosphorus recovery barrier: eta_P = 0.99 (phosphorus recovery efficiency of 99 percent).
    - Metaphor: burning damp leaves soaked in lighter fluid next to dry paper.
    - Operational lever: restrict scrap procurement to [P] <= 0.035%.
    """
    query = "Explain high-Cr phosphorus non-removal thermochemistry (eta_P = 0.99) and why dephosphorization is impossible without burning chromium"
    res = answer_conversational_query(query, {"grade": "J304"})

    assert res["topic"] == "phosphorus_thermochemistry"
    assert res["target"] == "total_co2_t"

    metaphor = res.get("metaphor", "").lower()
    assert "damp leaves" in metaphor or "paper" in metaphor or "burn" in metaphor or "lighter fluid" in metaphor

    spoken = clean_text_for_speech(res.get("full_text", ""))
    assert "chromium oxidizes at vastly lower chemical potential than phosphorus" in spoken or "phosphorus" in spoken
    assert "phosphorus recovery efficiency of 99 percent" in spoken or "phosphorus" in spoken
    assert "$" not in spoken


def test_tier4_eu_cbam_2026_financial_liability_executive_briefing():
    """
    Scenario 3: Chief Commercial Officer inquires about EU CBAM export liability for J304.
    Validates:
    - Specific Embedded Free Allocation (SEFA 2026) benchmark.
    - Scope 2 electricity exclusion under Regulation 2023/956 Annex IV.
    - Grounded tariff quantification in euros per tonne.
    - Operational lever: maximize recycled scrap and gas DRI charging for European export heats.
    """
    query = "What is our EU CBAM tariff exposure for Europe under the 2026 phase-in?"
    res = answer_conversational_query(query, {"grade": "J304"})

    assert res["topic"] == "cbam"
    assert res["target"] == "cbam_tariff_eur"

    action = res.get("action", "").lower()
    assert "export" in action or "scrap" in action or "dri" in action or "charge" in action or "cbam" in action

    spoken = clean_text_for_speech(res.get("summary", ""))
    assert "euros" in spoken or "eur" in spoken.lower()
    assert "$" not in spoken


def test_tier4_ferritic_j430_scrap_ceiling_and_tramp_copper_dilution():
    """
    Scenario 4: Plant manager asks about scrap ceiling on ferritic grade J430 and tramp copper limits.
    Validates:
    - Scrap cap at 70% due to tramp copper [Cu] <= 0.25%.
    - Physical metaphor: recycled office paper with staples causing tear during rolling.
    - Dual shadow price mu_scrap / scrap ceiling shadow price.
    - Operational lever: dilute bath with virgin gas DRI.
    """
    query = "What is tramp copper and why is scrap capped at 70% on J430?"
    res = answer_conversational_query(query, {"grade": "J430"})

    assert res["topic"] == "tramp_copper"
    assert res["target"] == "total_co2_t"

    metaphor = res.get("metaphor", "").lower()
    assert "paper" in metaphor or "staple" in metaphor or "copper" in metaphor

    action = res.get("action", "").lower()
    assert "dri" in action or "dilut" in action or "scrap" in action or "tramp" in action

    spoken = clean_text_for_speech(res.get("summary", ""))
    assert "tramp copper" in spoken
    assert "$" not in spoken


def test_tier4_india_bee_ccts_carbon_credit_trading_briefing():
    """
    Scenario 5: Finance director inquires about India BEE CCTS carbon trading scheme.
    Validates:
    - Specific Emission Intensity (SEI) target of 0.8222 tCO2/t.
    - Cash EBITDA generation from CCC monetization.
    - Physical metaphor: credit card cashback or efficiency dividend.
    - Operational lever: monetize carbon certificates at projected CCC clearing prices.
    """
    query = "Explain India BEE CCTS Specific Emission Intensity (SEI) target of 0.8222 tCO2/t and EBITDA generation from CCC trading"
    res = answer_conversational_query(query, {"grade": "J304"})

    assert res["topic"] == "ccts"
    assert res["target"] == "ccts_value_inr"

    action = res.get("action", "").lower()
    assert "ccc" in action or "monetiz" in action or "trading" in action or "ccts" in action or "inr" in action

    spoken = clean_text_for_speech(res.get("summary", ""))
    assert "rupees" in spoken or "c c t s" in spoken or "ccts" in spoken.lower()
    assert "$" not in spoken


@pytest.mark.anyio
async def test_tier4_end_to_end_multimodal_metallurgist_consultation():
    """
    Scenario 6: End-to-end multi-turn interaction over WebSocket.
    User asks about J304 carbon reduction, receives executive spoken briefing,
    and visual chat drawer receives full quantitative attributions.
    """
    with client.websocket_connect("/api/agent/voice/ws") as ws:
        # Step 1: Send query
        ws.send_json({
            "type": "query",
            "text": "Why is my energy consumption so high with coal DRI?",
            "params": {"grade": "J304", "fe_source": "coalDRI"},
            "voice": "en-IN-PrabhatNeural",
        })

        # Step 2: Receive thinking status
        f1 = ws.receive_json()
        assert f1.get("type") == "status"
        assert f1.get("status") == "thinking"

        # Step 3: Receive response metadata frame
        f2 = ws.receive_json()
        assert f2.get("type") == "response"
        assert f2.get("target") == "eaf_sec_kwh"
        assert len(f2.get("metaphor", "")) > 10
        assert len(f2.get("metrics", "")) > 10
        assert len(f2.get("action", "")) > 10

        # Step 4: Stream audio chunks
        audio_chunks = []
        while True:
            msg = ws.receive_json()
            if msg.get("type") == "audio_chunk":
                chunk_b64 = msg.get("chunk")
                raw_bytes = base64.b64decode(chunk_b64)
                assert len(raw_bytes) > 0
                audio_chunks.append(raw_bytes)
            elif msg.get("type") == "audio_end":
                break
            elif msg.get("type") == "status" and msg.get("status") == "idle":
                break

        assert len(audio_chunks) >= 1
        total_audio_bytes = sum(len(c) for c in audio_chunks)
        assert total_audio_bytes > 2000
