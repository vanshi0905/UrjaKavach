# Original User Request

## 2026-09-11T07:29:07Z

Train and condition the JSL Metallurgical Voice Agent to share the complete 1,050-sample domain dataset, deterministic 8-tool pyrometallurgical engine, and 3-layer pedagogical persona (*Physical Metaphor → Grounded Metrics → Melt Shop Action*), powered by 100% free and open-source neural voice technology (`edge-tts` and Web Speech API) with full-duplex interactive conversation, spoken-word math normalization, and sub-15ms barge-in interruption.

Working directory: C:\Users\Asus\Desktop\JSL
Integrity mode: development

## Requirements

### R1. Verify 100% Free & Open-Source Voice Stack
Audit and confirm zero paid API dependencies (no ElevenLabs, OpenAI Audio, or paid cloud subscriptions):
- **TTS Engine**: Open-source Microsoft `edge-tts` in Python (`jsl_carbon_engine/agent/voice_service.py`) configured with authentic Indian English neural engineering voices (`en-IN-PrabhatNeural` / `en-IN-NeerjaNeural`) as the primary default, plus `en-US-JennyNeural` as an international option.
- **STT Engine**: Standard W3C Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) running directly inside the client's browser at zero cost and low latency.
- **Client Offline Fallback**: Browser-native `SpeechSynthesisUtterance` with zero-latency speech generation when offline.

### R2. Spoken-Word Conditioning & Mathematical Normalization
Condition the conversational voice stream so the agent speaks naturally like a Chief Metallurgist:
- Normalize mathematical formulas and Greek pyrometallurgical variables into natural spoken English:
  - Convert `$\eta_{\mathrm{P}} = 0.99$` to "phosphorus recovery efficiency of 99 percent".
  - Convert `$\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$` to "chromium oxidizes at vastly lower chemical potential than phosphorus".
  - Convert `tCO2e/tcs` to "tonnes of CO2 equivalent per tonne of crude steel".
  - Convert `$\pi_t$` to "dual shadow price".
- Format responses as **Concise Executive Briefings (~15–25 seconds)**: Crisp physical metaphor, key carbon/cost delta, and 1 direct furnace lever.
- Automatically strip Markdown tables, raw JSON action tokens (`<<<ACTION:...>>>`), and bullet formatting from the spoken audio pipeline while preserving full rich data in the accompanying visual chat drawer.

### R3. Acoustic Latency Management & Full-Duplex Barge-In
- Stream conversational audio in small MP3 chunks over WebSocket `/voice/ws` to ensure time-to-first-audio $< 300\text{ ms}$.
- Provide auditory acoustic fillers (*"Calculating Simplex charge mix...", "Inverting electric arc furnace enthalpy balance..."*) during heavy stochastic Monte Carlo or 50-point Pareto LP sweeping to prevent dead air.
- Maintain instantaneous client-side barge-in interruption ($< 15\text{ ms}$) that immediately cancels backend TTS generation and silences audio playback when the user starts speaking.

### R4. Automated Testing & Zero Regression
- Add automated end-to-end voice route unit tests verifying WebSocket handshake, speech audio generation, and math normalization.
- Ensure all 302 automated pytest tests and Next.js static production build pass with 0 errors.

## Acceptance Criteria

### Open-Source Compliance
- [ ] No paid third-party voice APIs or secret keys required; `edge-tts` and Web Speech API operate 100% out of the box with zero external subscription costs.
- [ ] Available voices include authentic Indian English neural voices (`en-IN-PrabhatNeural` and `en-IN-NeerjaNeural`).

### Speech Quality & Spoken Math
- [ ] Spoken text output contains zero raw LaTeX code (`$`, `\frac`, `\mathrm`), zero raw JSON strings, and zero Markdown hashes.
- [ ] Voice agent speaks directly to the user in a natural, authoritative engineering tone in concise ~15–25 second bursts.

### Two-Way Conversation & Interruption
- [ ] Microphone input captures user speech queries and dispatches them to the voice WebSocket.
- [ ] Voice agent speaks back to the user through their speakers or headphones.
- [ ] Interrupt frame halts backend TTS generation and silences client audio within 50ms.

### Build & Test Suite
- [ ] All 302 automated backend pytest tests pass (100% pass rate).
- [ ] Next.js static production build completes with 0 errors (`npm run build`).

## 2026-09-11T09:45:14Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: A full multi-agent team

Evaluate the current state of the JSL Carbon Engine against the "Round 1: Executive Case Summary" requirements, generate a 1-2 slide executive summary in Markdown format outlining our approach and initial recommendations, and finally package the entire final project into a ZIP file on the Desktop.

Working directory: C:\Users\Asus\Desktop\JSL
Integrity mode: development

## Requirements

### R1. Executive Summary Generation
Generate the text for a 1-2 slide executive summary (in Markdown) that can be easily copied and pasted into a presentation. Save this as `ROUND_1_EXECUTIVE_SUMMARY.md` in the project root.

### R2. Feature Hard Metrics
The summary MUST explicitly highlight the exact mathematical achievements and verified metrics from the recent 5-Gate Audit (e.g., 1.000t mass balance closure, ~113 kWh/t hot charging savings, CBAM 0.284 tCO2/t high-alloy benchmark compliance, exact additive closure of Shapley values).

### R3. Recommendations
Provide 2-3 initial, actionable business recommendations for JSL based on the engine's capabilities.

### R4. Final ZIP Packaging
After generating the summary, create a ZIP archive of the entire `C:\Users\Asus\Desktop\JSL` project directory (excluding heavy node_modules if possible) and save it as `JSL_Carbon_Engine_Round_1_Submission.zip` directly on the user's Desktop (`C:\Users\Asus\Desktop`).

## Acceptance Criteria

### Formatting & Completeness
- [ ] The output is provided as raw Markdown text in `ROUND_1_EXECUTIVE_SUMMARY.md`, distinctly split into "Slide 1" and "Slide 2".
- [ ] The content explicitly cites the hard metrics from the audit (Mass Balance, SEC savings, CBAM/CCTS alignment).
- [ ] The project is confirmed to be "complete" and ready for Round 1 submission.
- [ ] A ZIP file named `JSL_Carbon_Engine_Round_1_Submission.zip` is successfully created on the Desktop and contains the latest code and the summary.
