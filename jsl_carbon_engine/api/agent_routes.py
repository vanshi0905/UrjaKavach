"""
FastAPI REST and WebSocket Router for JSL AI Agent & Voice Assistant.
Exposes endpoints for:
  1. POST /api/agent/shap - Multi-Target Permutation Shapley calculations
  2. POST /api/agent/explain - 3-Layer Pedagogical Plain-English Explanations
  3. POST /api/agent/query - Metallurgical Conversational Assistant
  4. POST /api/agent/tts - Direct Neural Audio Synthesis (MP3)
  5. GET  /api/agent/voices - Available Neural Voices
  6. WS   /api/agent/voice/ws - Real-Time Full-Duplex Voice WebSocket with Sub-15ms Barge-in
"""

import json
import base64
import asyncio
from typing import Dict, Any, Optional, Tuple
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field

from jsl_carbon_engine.agent.shap_engine import compute_multi_target_shapley
from jsl_carbon_engine.agent.nlg_engine import generate_target_explanation, answer_conversational_query
from jsl_carbon_engine.agent.tools import (
    TOOL_DEFINITIONS,
    TOOL_REGISTRY,
    execute_tool,
)
from jsl_carbon_engine.agent.voice_service import (
    stream_speech_audio,
    synthesize_speech_bytes,
    AVAILABLE_VOICES,
    DEFAULT_VOICE,
    clean_text_for_speech,
)
from jsl_carbon_engine.api.schemas import CalculationRequest

router = APIRouter(tags=["Agent & Voice Copilot"])


def parse_tool_call_spec(tool_call: Optional[Dict[str, Any]]) -> Tuple[Optional[str], Any]:
    """
    Normalizes tool call specification supporting both flat dicts and standard OpenAI function calling format:
    {"name": ..., "arguments": ...} or {"type": "function", "function": {"name": ..., "arguments": ...}}
    Handles arguments as dict, JSON string, or None.
    """
    if not tool_call or not isinstance(tool_call, dict):
        return None, {}
    func_obj = tool_call.get("function") if isinstance(tool_call.get("function"), dict) else {}
    tool_name = tool_call.get("name") or tool_call.get("tool_name") or func_obj.get("name")
    raw_args = tool_call.get("arguments")
    if raw_args is None and func_obj:
        raw_args = func_obj.get("arguments")
    if raw_args is None:
        raw_args = {}
    return tool_name, raw_args


class ExplainRequest(BaseModel):
    target: Optional[str] = Field(default="total_co2_t", description="total_co2_t, eaf_sec_kwh, cbam_tariff_eur, ccts_value_inr")
    query: Optional[str] = Field(default=None, description="Optional conversational question")
    params: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Cockpit calculation parameters")


class ToolExecuteRequest(BaseModel):
    tool_name: str = Field(description="Name of the deterministic tool to execute")
    arguments: Optional[Any] = Field(default_factory=dict, description="Tool arguments (dict or JSON string)")



class QueryRequest(BaseModel):
    query: str = Field(description="Conversational question from user")
    params: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Cockpit calculation parameters")
    tool_call: Optional[Dict[str, Any]] = Field(default=None, description="Optional deterministic tool call request")


class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = Field(default=DEFAULT_VOICE)


@router.post("/shap")
def get_shap_attributions(req: Optional[Dict[str, Any]] = None):
    """
    Computes exact Permutation Shapley attributions across all 4 operational targets
    with mathematical additive closure verification.
    """
    params = req or {}
    try:
        return compute_multi_target_shapley(params)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/explain")
def get_pedagogical_explanation(req: ExplainRequest):
    """
    Generates structured 3-layer pedagogical explanation:
    Physical Metaphor -> Grounded Metric -> Operational Action.
    """
    params = req.params or {}
    try:
        if req.query:
            return answer_conversational_query(req.query, params)
        target = req.target or "total_co2_t"
        return generate_target_explanation(target, params)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tools")
def list_deterministic_tools():
    """
    Returns OpenAI function calling schemas for all 8 deterministic metallurgical tools.
    """
    return {
        "tools": TOOL_DEFINITIONS,
        "tool_names": list(TOOL_REGISTRY.keys()),
        "count": len(TOOL_DEFINITIONS),
    }


@router.post("/tools/execute")
def execute_deterministic_tool(req: ToolExecuteRequest):
    """
    Directly executes one of the 8 deterministic pyrometallurgical tools.
    """
    try:
        res = execute_tool(req.tool_name, req.arguments or {})
        return {
            "tool_name": req.tool_name,
            "arguments": req.arguments,
            "result": res,
            "status": "success",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/query")
def process_agent_query(req: QueryRequest):
    """
    Processes natural language metallurgical queries with first-principles reasoning
    and deterministic tool execution.
    """
    params = req.params or {}
    tool_execution = None
    if req.tool_call:
        t_name, t_args = parse_tool_call_spec(req.tool_call)
        if t_name in TOOL_REGISTRY:
            try:
                tool_execution = {
                    "tool_name": t_name,
                    "result": execute_tool(t_name, t_args),
                    "status": "success",
                }
            except Exception as e:
                tool_execution = {"tool_name": t_name, "error": str(e), "status": "error"}
        elif t_name:
            tool_execution = {
                "tool_name": t_name,
                "error": f"Tool '{t_name}' not found in registry. Available: {list(TOOL_REGISTRY.keys())}",
                "status": "error",
            }

    try:
        res = answer_conversational_query(req.query, params)
        if tool_execution:
            res["tool_execution"] = tool_execution
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/voices")
def list_available_voices():
    """Returns available open-source neural TTS voices."""
    return {"voices": AVAILABLE_VOICES, "default": DEFAULT_VOICE}


@router.post("/tts")
async def generate_tts_audio(req: TTSRequest):
    """
    Synthesizes speech audio using neural edge-tts and streams the resulting MP3 bytes.
    """
    voice = req.voice or DEFAULT_VOICE
    if voice not in AVAILABLE_VOICES:
        voice = DEFAULT_VOICE

    try:
        audio_bytes = await synthesize_speech_bytes(req.text, voice=voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")


@router.websocket("/voice/ws")
async def voice_agent_websocket(websocket: WebSocket):
    """
    Full-duplex WebSocket endpoint for interactive voice conversation.
    Supports instant sub-15ms client barge-in interruption via asynchronous task cancellation.
    """
    await websocket.accept()

    active_tts_task: Optional[asyncio.Task] = None
    idle_timer_task: Optional[asyncio.Task] = None

    async def send_idle_later(delay: float = 0.03):
        try:
            await asyncio.sleep(delay)
            await websocket.send_json({"type": "status", "status": "idle"})
        except asyncio.CancelledError:
            pass

    async def run_query_and_stream(
        query_text: str,
        cockpit_params: Dict[str, Any],
        voice: str,
        tool_call_spec: Optional[Dict[str, Any]] = None,
    ):
        try:
            # 1. Send Thinking state
            await websocket.send_json({"type": "status", "status": "thinking"})
            await asyncio.sleep(0.01)

            # Optional Tool Execution
            tool_res = None
            if tool_call_spec:
                t_name, t_args = parse_tool_call_spec(tool_call_spec)
                if t_name in TOOL_REGISTRY:
                    try:
                        tool_res = {
                            "tool_name": t_name,
                            "result": execute_tool(t_name, t_args),
                        }
                    except Exception as e:
                        tool_res = {"tool_name": t_name, "error": str(e)}
                elif t_name:
                    tool_res = {"tool_name": t_name, "error": f"Tool '{t_name}' not found in registry."}

            # 2. Generate Pedagogical NLG & SHAP attribution
            res = answer_conversational_query(query_text, cockpit_params)

            if res.get("is_conversational") or res.get("topic") in ("greeting", "help", "how_to_use"):
                spoken_summary = res.get("summary") or res.get("title", "JSL Assistant")
            else:
                spoken_summary = (
                    f"{res.get('title', 'Metallurgical Assessment')}. "
                    f"{res.get('metaphor', '')}. "
                    f"{res.get('action', '')}"
                )

            # 3. Send Text and Structured Metadata Frame
            resp_frame = {
                "type": "response",
                "text": res.get("full_text", ""),
                "summary": spoken_summary,
                "title": res.get("title", "JSL Assistant"),
                "topic": res.get("topic", "general"),
                "target": res.get("target", "total_co2_t"),
                "target_name": res.get("target_name", "Carbon Footprint"),
                "metaphor": res.get("metaphor", ""),
                "metrics": res.get("metrics", ""),
                "action": res.get("action", ""),
                "is_conversational": res.get("is_conversational", False),
                "shap": res.get("shap", None),
                "action_payload": res.get("action_payload", None),
            }
            if tool_res:
                resp_frame["tool_execution"] = tool_res
            await websocket.send_json(resp_frame)

            # Cooperative yield: allow barge-in interrupt or superseding query before emitting speaking
            await asyncio.sleep(0.01)

            # 4. Stream Audio Chunks over WebSocket
            await websocket.send_json({"type": "status", "status": "speaking"})
            await websocket.send_json({"type": "audio_start"})

            clean_speech = clean_text_for_speech(spoken_summary)
            async for chunk in stream_speech_audio(clean_speech, voice=voice):
                chunk_b64 = base64.b64encode(chunk).decode("utf-8")
                await websocket.send_json({
                    "type": "audio_chunk",
                    "chunk": chunk_b64,
                })

            await websocket.send_json({"type": "audio_end"})
            await websocket.send_json({"type": "status", "status": "idle"})

        except asyncio.CancelledError:
            pass
        except Exception as e:
            try:
                await websocket.send_json({"type": "error", "error": str(e)})
                await websocket.send_json({"type": "status", "status": "idle"})
            except Exception:
                pass

    try:
        while True:
            raw_msg = await websocket.receive_text()
            try:
                data = json.loads(raw_msg)
            except (json.JSONDecodeError, ValueError):
                await websocket.send_json({"type": "error", "error": "Invalid JSON frame"})
                await websocket.send_json({"type": "status", "status": "idle"})
                continue
            msg_type = data.get("type", "query")

            # Barge-in Interruption Frame
            if msg_type == "interrupt":
                if idle_timer_task and not idle_timer_task.done():
                    idle_timer_task.cancel()
                    idle_timer_task = None
                if active_tts_task and not active_tts_task.done():
                    active_tts_task.cancel()
                    try:
                        await asyncio.wait_for(active_tts_task, timeout=0.05)
                    except (asyncio.CancelledError, asyncio.TimeoutError, Exception):
                        pass
                    active_tts_task = None
                await websocket.send_json({"type": "interrupted"})
                idle_timer_task = asyncio.create_task(send_idle_later(0.03))
                continue

            # Conversational Query Frame
            elif msg_type == "query":
                if idle_timer_task and not idle_timer_task.done():
                    idle_timer_task.cancel()
                    idle_timer_task = None

                # Cancel any existing playback task and yield to let it flush CancelledError
                if active_tts_task and not active_tts_task.done():
                    active_tts_task.cancel()
                    try:
                        await asyncio.wait_for(active_tts_task, timeout=0.05)
                    except (asyncio.CancelledError, asyncio.TimeoutError, Exception):
                        pass
                    active_tts_task = None
                # One more yield so cancelled task's except block runs before new task starts
                await asyncio.sleep(0)

                q_text = data.get("text", "")
                c_params = data.get("params", {})
                voice_choice = data.get("voice", DEFAULT_VOICE)
                t_call = data.get("tool_call", None)

                active_tts_task = asyncio.create_task(
                    run_query_and_stream(q_text, c_params, voice_choice, t_call)
                )

            else:
                # Unknown frame type — acknowledge and stay idle
                await websocket.send_json({"type": "status", "status": "idle"})

    except WebSocketDisconnect:
        if idle_timer_task and not idle_timer_task.done():
            idle_timer_task.cancel()
        if active_tts_task and not active_tts_task.done():
            active_tts_task.cancel()
    except Exception:
        if idle_timer_task and not idle_timer_task.done():
            idle_timer_task.cancel()
        if active_tts_task and not active_tts_task.done():
            active_tts_task.cancel()

