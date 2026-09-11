# Project: JSL Metallurgical Voice Agent

## Architecture
- **Backend**: FastAPI (`jsl_carbon_engine/api/app.py`), WebSocket routes (`/voice/ws` and `/api/agent/voice/ws`), Neural TTS service (`jsl_carbon_engine/agent/voice_service.py`), Pyrometallurgical Agent & NLG Engine (`jsl_carbon_engine/agent/nlg_engine.py`).
- **Frontend**: Next.js 14 App Router (`frontend/src`), Web Speech API & Web Audio visualizer (`frontend/src/lib/voice-agent.ts`, `frontend/src/components/agent/VoiceOrb.tsx`), Global Assistant Drawer (`frontend/src/components/agent/AssistantDrawer.tsx`).
- **Data Flow**:
  1. User speaks -> Browser Web Speech API (`webkitSpeechRecognition`) captures audio -> dispatches text query over WebSocket (`/voice/ws`).
  2. Backend receives query -> `agent_routes.py` generates 3-layer pedagogical persona (`nlg_engine.py`) -> extracts structured visual response and spoken summary.
  3. Spoken summary normalized via `clean_text_for_speech` (LaTeX -> spoken English, Greek -> English, action tokens & markdown tables stripped).
  4. Audio streamed in real-time MP3 chunks via Microsoft `edge-tts` over WebSocket (TTFA < 300ms, acoustic fillers during long-running solvers).
  5. User barge-in sends `interrupt` frame -> backend cancels active TTS task (<1ms) -> client silences audio playback instantly (<1.5ms).
  6. Offline fallback: Browser-native `SpeechSynthesisUtterance` + local deterministic NLG.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Open-Source Voice Stack & Personas | 100% free open-source; verify zero paid API keys; add `en-US-JennyNeural` alongside Indian English voices `en-IN-PrabhatNeural` and `en-IN-NeerjaNeural` | M1, M2 | ORIGINAL_REQUEST §R1 |
| F2 | Spoken-Word Mathematical Normalization | Convert LaTeX formulas, Greek pyrometallurgical variables, thermochemical potentials ($\eta_P=0.99$, $\Delta G^\circ$, $\pi_t$), units ($tCO2e/tcs$) to natural spoken English | M1 | ORIGINAL_REQUEST §R2 |
| F3 | Dual-Stream Output Filtering | Strip raw action tokens (`<<<ACTION:...>>>`), markdown tables, headers, and bullet markup from spoken audio while preserving visual chat fidelity | M1 | ORIGINAL_REQUEST §R2 |
| F4 | Executive Briefing Format | Concise 15-25 second audio briefings (35-55 words): Layer 1 Metaphor -> Layer 2 Grounded SHAP Delta -> Layer 3 Melt Shop Lever | M1 | ORIGINAL_REQUEST §R2 |
| F5 | Acoustic Fillers & Latency Management | Time-to-First-Audio < 300ms; auditory acoustic fillers streamed during heavy Monte Carlo / Pareto LP solvers | M1 | ORIGINAL_REQUEST §R3 |
| F6 | WebSocket Root Routing | Mount `@app.websocket("/voice/ws")` alias at root level in FastAPI `app.py` | M1 | ORIGINAL_REQUEST §R3 |
| F7 | Frontend Voice Interface & Barge-In | Streaming playback, hands-free continuous barge-in re-arming, sub-15ms client silencing, offline SpeechSynthesisUtterance | M2 | ORIGINAL_REQUEST §R3 |
| F8 | Automated Unit & Integration Tests | Tests for WebSocket handshake, voice generation, math normalization; 100% pass on 302 existing tests; Next.js build clean | M3 | ORIGINAL_REQUEST §R4 |
| F9 | E2E Opaque-Box Acceptance Suite | Comprehensive Tier 1-4 test suite derived independently from requirements; 100% pass rate | M4 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Voice Engine & Spoken Normalizer | `voice_service.py`, `agent_routes.py`, `app.py`: JennyNeural voice, MetallurgicalSpokenNormalizer, executive briefing formatting, acoustic fillers, `/voice/ws` root route | None | PLANNED |
| M2 | Frontend Voice Interface & Hands-Free Barge-In | `voice-agent.ts`, `AssistantDrawer.tsx`: JennyNeural option, streaming audio playback, continuous recognition re-arming, client normalization sync | M1 | PLANNED |
| M3 | Automated Voice Route Unit Tests & Regression Gate | `tests/test_agent_and_shap.py` (or new test file): WebSocket `/voice/ws` test, math normalization assertions, table/action token stripping, 302 pytest tests pass, Next.js build passes | M1, M2 | PLANNED |
| M4 | Final Milestone: E2E Acceptance & Adversarial Hardening | Phase 1: 100% pass of E2E test suite (Tiers 1-4). Phase 2: Adversarial coverage hardening (Tier 5) with Challenger -> Worker -> Reviewer -> Auditor | M3 | PLANNED |

## Interface Contracts
### Client WebSocket <-> Backend `/voice/ws`
- **Client Frame**:
  - `{"type": "query", "text": str, "params": dict, "voice": Optional[str]}`
  - `{"type": "interrupt"}`
- **Server Frame**:
  - `{"type": "status", "status": "thinking" | "speaking" | "idle", "filler_text": Optional[str]}`
  - `{"type": "response", "target": str, "title": str, "metaphor": str, "metrics": str, "action": str, "shap": dict, "action_payload": Optional[dict]}`
  - `{"type": "audio_start"}`
  - `{"type": "audio_chunk", "chunk": "<base64_mp3>"}`
  - `{"type": "audio_end"}`
  - `{"type": "interrupted"}`

### Normalizer Contract
- `clean_text_for_speech(text: str) -> str`:
  - Input: Raw text containing potential LaTeX, markdown tables, action tokens, pyrometallurgical units.
  - Output: Pure phonetic English text free of `$`, `\`, `|`, `<<<ACTION:...>>>`.

## Code Layout
- `jsl_carbon_engine/agent/voice_service.py`: Open-source neural TTS engine (`edge-tts`), voice registry, `clean_text_for_speech`.
- `jsl_carbon_engine/api/agent_routes.py`: Voice agent WebSocket handler `/api/agent/voice/ws`, executive briefing formatting, acoustic fillers.
- `jsl_carbon_engine/api/app.py`: FastAPI application setup, root alias `/voice/ws`.
- `frontend/src/lib/voice-agent.ts`: Browser Web Speech API, audio player, WebSocket client, barge-in controller.
- `frontend/src/components/agent/AssistantDrawer.tsx`: Global voice assistant drawer UI, voice selection dropdown.
- `tests/test_agent_and_shap.py`: Automated pytest suite covering agent, SHAP, and voice pipelines.
