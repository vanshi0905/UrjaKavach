# Test Infrastructure & Strategy: JSL Metallurgical Voice Agent

## 1. Test Philosophy

The testing framework for the JSL Metallurgical Voice Agent is engineered according to an **opaque-box, requirement-driven, specification-authoritative philosophy** derived directly from `ORIGINAL_REQUEST.md` and `PROJECT.md`.

### 1.1 Core Principles
1. **Opaque-Box Verification**: Tests validate observable external behaviors, interface contracts, protocol frames, and phonetic outputs without depending on private implementation details.
2. **Authoritative Derivation**: Every test assertion is derived from the explicit acceptance criteria in `ORIGINAL_REQUEST.md`:
   - Zero paid cloud API dependencies (100% open-source `edge-tts` and Web Speech API).
   - Authentic Indian English neural voices (`en-IN-PrabhatNeural`, `en-IN-NeerjaNeural`) and international US English voice (`en-US-JennyNeural`).
   - Spoken-word pyrometallurgical normalization:
     - `$\eta_{\mathrm{P}} = 0.99$` $\rightarrow$ `"phosphorus recovery efficiency of 99 percent"`
     - `$\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$` $\rightarrow$ `"chromium oxidizes at vastly lower chemical potential than phosphorus"`
     - `tCO2e/tcs` $\rightarrow$ `"tonnes of CO2 equivalent per tonne of crude steel"`
     - `$\pi_t$` $\rightarrow$ `"dual shadow price"`
     - `$\mu_{\mathrm{scrap}}$` $\rightarrow$ `"scrap ceiling shadow price"`
     - `$\mathrm{ViU}_j$` $\rightarrow$ `"Value-in-Use"`
   - Complete suppression of raw LaTeX code, raw JSON action tokens (`<<<ACTION:...>>>`), and Markdown pipe tables from spoken audio.
   - Executive briefing format: Concise ~15–25 second spoken bursts (35–55 words) combining Layer 1 Metaphor $\rightarrow$ Layer 2 Grounded SHAP Delta $\rightarrow$ Layer 3 Melt Shop Lever.
   - Full-duplex WebSocket communication on `/voice/ws` and `/api/agent/voice/ws` with instantaneous barge-in interruption.
3. **Progressive Testability & Zero Regressions**: All 302 existing pyrometallurgical unit tests must remain 100% passing, with new E2E voice tests self-contained and independently verifiable.
4. **Adversarial Hardening**: The test suite actively injects malformed inputs, nested delimiters, consecutive action tokens, extreme text blocks, and rapid asynchronous interrupt signals.

---

## 2. Feature Inventory (F1 – F8)

| Feature ID | Feature Name | Description & Acceptance Requirement | Authoritative Source |
|---|---|---|---|
| **F1** | Open-Source Voice Stack & Personas | 100% open-source neural TTS via `edge-tts`; zero paid API keys or external subscriptions; neural voices `en-IN-PrabhatNeural`, `en-IN-NeerjaNeural`, `en-US-JennyNeural`. | ORIGINAL_REQUEST §R1, PROJECT.md §F1 |
| **F2** | Spoken-Word Mathematical Normalization | Translates complex LaTeX equations, thermochemical potentials ($\eta_P=0.99$, $\Delta G^\circ$, $\pi_t$, $\mu_{\mathrm{scrap}}$, $\mathrm{ViU}_j$), Greek letters, and pyrometallurgical units ($tCO2e/tcs$, $kWh/t$) into natural spoken English. | ORIGINAL_REQUEST §R2, PROJECT.md §F2 |
| **F3** | Dual-Stream Output Filtering | Strips raw action tokens (`<<<ACTION:...>>>`), Markdown tables (`\|...\|`), bullet points, and headers from spoken audio while preserving visual rich chat data. | ORIGINAL_REQUEST §R2, PROJECT.md §F3 |
| **F4** | Executive Briefing Formatting | Condenses metallurgical explanations into concise 15–25 second bursts (35–55 words) following *Metaphor $\rightarrow$ Grounded SHAP Delta $\rightarrow$ Operational Lever*. | ORIGINAL_REQUEST §R2, PROJECT.md §F4 |
| **F5** | Latency Management & Acoustic Fillers | Ensures TTFA < 300ms; streams acoustic filler cues during heavy Monte Carlo or Pareto LP solving to eliminate dead air. | ORIGINAL_REQUEST §R3, PROJECT.md §F5 |
| **F6** | WebSocket Root & Router Aliasing | Exposes WebSocket endpoint at both root `/voice/ws` and prefixed `/api/agent/voice/ws` routes. | ORIGINAL_REQUEST §R3, PROJECT.md §F6 |
| **F7** | Full-Duplex Voice & Interruption Protocol | Bi-directional JSON frame protocol (`query`, `interrupt`, `status`, `response`, `audio_start`, `audio_chunk`, `audio_end`, `interrupted`); sub-15ms client silencing. | ORIGINAL_REQUEST §R3, PROJECT.md §F7 |
| **F8** | Automated Suite & Regression Gate | 100% pass on 302 baseline pytest tests; Next.js static build clean; complete automated test suite in `tests/test_e2e_voice.py`. | ORIGINAL_REQUEST §R4, PROJECT.md §F8 |

---

## 3. Test Architecture & 4-Tier Methodology

The test suite is structured into 4 hierarchical tiers to ensure complete breadth, extreme edge resilience, and operational fidelity:

```
┌────────────────────────────────────────────────────────┐
│  Tier 4: Real-World Metallurgical Scenarios (>=5)       │
│  - J304 Hot FeCr Charging Briefing                     │
│  - Scrap Optimization with Shadow Price & P-Barrier    │
│  - EU CBAM 2026-2034 Executive Financial Briefing      │
│  - Tramp Copper Clamping & Dilution Protocol           │
│  - India BEE CCTS Specific Emission Trading Briefing   │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│  Tier 3: Cross-Feature Interactions (Pairwise >= 8)     │
│  - Math Normalization + Table Stripping + Action Token │
│  - Executive Briefing + SHAP Delta + Audio Synthesis   │
│  - Acoustic Filler Trigger + Rapid Barge-in Interrupt  │
│  - Voice Persona Selection + Normalized Math Audio     │
│  - Dual Route Interoperability (/voice/ws vs /api...)  │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│  Tier 2: Boundary & Corner Cases (>=5 per Feature)      │
│  - Empty strings, whitespace, None inputs              │
│  - Huge text payloads (>10,000 characters)             │
│  - Malformed & unclosed LaTeX delimiters ($...$)       │
│  - Consecutive, nested, and malformed action tokens    │
│  - Multiline, malformed, and irregular markdown tables │
│  - Rapid multiple interrupt frames in succession       │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│  Tier 1: Feature Coverage (>=5 per Feature F1 - F8)     │
│  - F1: Prabhat, Neerja, Jenny, Ryan, zero paid keys    │
│  - F2: eta_P=0.99, Delta G, tCO2e/tcs, pi_t, ViU       │
│  - F3: Action token strip, pipe table strip, bullets   │
│  - F4: Word count (35-55 words), 3-layer persona       │
│  - F5: Acoustic fillers, streaming MP3 chunks          │
│  - F6: /voice/ws connection, /api/agent/voice/ws conn  │
│  - F7: Full duplex query/response/audio handshake      │
│  - F8: Synthesis byte integrity, MP3 headers           │
└────────────────────────────────────────────────────────┘
```

### 3.1 Minimum Test Count Thresholds
- **Tier 1 (Feature Coverage)**: $\ge 5$ test cases per feature across F1–F8 ($\ge 40$ test assertions/cases).
- **Tier 2 (Boundary & Corner Cases)**: $\ge 5$ boundary test cases per feature domain ($\ge 25$ boundary cases).
- **Tier 3 (Cross-Feature Interactions)**: Pairwise combinatoric coverage ($\ge 8$ interaction workflows).
- **Tier 4 (Real-World Scenarios)**: $\ge 5$ authentic pyrometallurgical plant operational scenarios.

---

## 4. Test Suite Specification (`tests/test_e2e_voice.py`)

### 4.1 Tier 1: Core Feature Coverage
1. **F1 (Open-Source Voices & Personas)**:
   - Verify `AVAILABLE_VOICES` contains `en-IN-PrabhatNeural` (male process engineer).
   - Verify `AVAILABLE_VOICES` contains `en-IN-NeerjaNeural` (female metallurgist).
   - Verify `AVAILABLE_VOICES` contains `en-US-JennyNeural` (US technical specialist).
   - Verify zero paid API keys required in environment (no `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`).
   - Verify voice registry metadata includes correct locale and gender attributes.
2. **F2 (Spoken Math Normalization)**:
   - Verify `$\eta_{\mathrm{P}} = 0.99$` and unicode `η_P = 0.99` $\rightarrow$ `"phosphorus recovery efficiency of 99 percent"`.
   - Verify `$\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$` $\rightarrow$ `"chromium oxidizes at vastly lower chemical potential than phosphorus"`.
   - Verify `tCO2e/tcs` $\rightarrow$ `"tonnes of CO2 equivalent per tonne of crude steel"`.
   - Verify `$\pi_t$` $\rightarrow$ `"dual shadow price"`.
   - Verify `$\mu_{\mathrm{scrap}}$` $\rightarrow$ `"scrap ceiling shadow price"`.
   - Verify `$\mathrm{ViU}_j$` $\rightarrow$ `"Value-in-Use"`.
   - Verify Greek thermochemical efficiency variables ($\eta_{\mathrm{Cr}}$, $\eta_{\mathrm{thermal}}$, $\eta_{\mathrm{Si}}$).
3. **F3 (Dual-Stream Output Filtering)**:
   - Verify single and multiple `<<<ACTION:APPLY_COCKPIT_PRESET:{...}>>>` tokens are completely removed.
   - Verify multi-row Markdown pipe tables (`| Metric | Value |`) are completely excised from speech.
   - Verify Markdown headers (`#`, `##`, `###`) and list bullets (`-`, `*`, `1.`) are stripped.
   - Verify visual chat text retains complete markdown structure while audio summary is cleanly normalized.
4. **F4 (Executive Briefing Format)**:
   - Verify executive audio summary word count falls between 35 and 55 words (~15–25 seconds spoken).
   - Verify 3-layer structure presence: Metaphor $\rightarrow$ Grounded Delta $\rightarrow$ Action.
   - Verify presence of quantitative metrics and actionable furnace levers.
5. **F5 (Acoustic Latency & Fillers)**:
   - Verify acoustic filler catalog contains authentic pyrometallurgical phrases.
   - Verify streaming speech yields valid base64-encoded audio chunks.
   - Verify time-to-first-chunk latency on standard requests.
6. **F6 (WebSocket Route Aliasing)**:
   - Verify root WebSocket `@app.websocket("/voice/ws")` connects successfully.
   - Verify prefixed WebSocket `@router.websocket("/api/agent/voice/ws")` connects successfully.
   - Verify identical protocol behavior on both endpoints.
7. **F7 (Full-Duplex Protocol & Interruption)**:
   - Verify standard handshake: query $\rightarrow$ status `thinking` $\rightarrow$ response metadata $\rightarrow$ status `speaking` $\rightarrow$ `audio_start` $\rightarrow$ `audio_chunk` $\rightarrow$ `audio_end` $\rightarrow$ status `idle`.
   - Verify barge-in frame: client sends `interrupt` $\rightarrow$ server responds `interrupted` $\rightarrow$ status `idle`.
8. **F8 (Audio Synthesis & Byte Verification)**:
   - Verify direct MP3 synthesis generates non-empty audio bytes with valid MP3 frame sync (`0xFFFB`) or ID3 header.
   - Verify synthesis for different voice options (`en-IN-PrabhatNeural`, `en-US-JennyNeural`).

### 4.2 Tier 2: Boundary & Corner Cases
1. **Empty & Whitespace Inputs**:
   - `clean_text_for_speech("")` $\rightarrow$ `""`.
   - `clean_text_for_speech("   \n\t  ")` $\rightarrow$ `""`.
   - Synthesize speech with empty string returns empty bytes.
2. **Large Text Payloads**:
   - Clean and synthesize text block with >10,000 characters and hundreds of formulas.
3. **Malformed & Unclosed LaTeX Delimiters**:
   - Unclosed `$` markers (e.g. `"$eta_P = 0.99 without closing"`).
   - Mismatched braces (e.g. `\frac{numerator}{denominator`).
   - Lone backslashes and special characters.
4. **Consecutive & Nested Action Tokens**:
   - Multiple back-to-back `<<<ACTION:...>>><<<ACTION:...>>>`.
   - Malformed action tokens with missing closing brackets `<<<ACTION:INVALID`.
5. **Complex Markdown Tables**:
   - Markdown tables embedded between sentences.
   - Tables with alignment colons, empty cells, and escaped pipes.
   - Trailing tables without newline.
6. **Rapid Multiple Interruption Frames**:
   - WebSocket client sends burst of 5 `interrupt` frames in rapid succession.
   - Verify server handles all frames cleanly without uncaught exceptions or socket disconnects.

### 4.3 Tier 3: Cross-Feature Interactions
1. **Math Normalization + Markdown Table + Action Token Fusion**:
   - Input containing pyrometallurgical equation, pipe table, and action token processed in one pass.
   - Assert zero pipes, zero brackets, zero LaTeX symbols, and correct phonetic replacements.
2. **Executive Briefing Generation + Spoken Text Normalization + Audio Synthesis**:
   - Generate conversational NLG response, extract spoken summary, pass through normalizer, synthesize to MP3 bytes.
   - Verify end-to-end pipeline integrity from high-level agent response to physical sound.
3. **Acoustic Filler Dispatch + Concurrent Interrupt**:
   - Dispatch heavy query, receive acoustic filler notification, send immediate interrupt frame.
   - Verify clean cancellation and transition to `idle`.
4. **Voice Persona Switching + Spoken Formula Synthesis**:
   - Synthesize identical pyrometallurgical formulas using Prabhat, Neerja, and Jenny.
   - Verify successful audio byte generation for all supported voices.
5. **Dual Route WebSocket Interoperability**:
   - Connect client 1 to `/voice/ws` and client 2 to `/api/agent/voice/ws`.
   - Verify parallel operation without route conflict or interference.

### 4.4 Tier 4: Real-World Metallurgical Operational Scenarios
1. **Scenario 1: J304 Molten FeCr Hot Charging Executive Briefing**:
   - Query: *"How does molten FeCr hot charging help J304 at Jajpur Works?"*
   - Verify physical metaphor (sizzling butter / ladle thermal credit).
   - Verify grounded metric: $\approx 113\text{ kWh/t}$ electrical SEC reduction.
   - Verify operational lever: maintain hot-ladle transfer between SAF and EAF-2.
   - Spoken text must be free of LaTeX, tables, or raw JSON tokens.
2. **Scenario 2: High-Cr Scrap Optimization with Phosphorus Barrier**:
   - Query: *"Can we dephosphorize stainless scrap in the AOD with slag fluxes?"*
   - Verify Ellingham thermochemical explanation ($\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$).
   - Verify spoken translation: *"chromium oxidizes at vastly lower chemical potential than phosphorus"*.
   - Verify $\eta_{\mathrm{P}} = 0.99$ normalized to *"phosphorus recovery efficiency of 99 percent"*.
3. **Scenario 3: EU CBAM 2026–2034 Executive Financial Briefing**:
   - Query: *"What is our EU CBAM tariff liability for J304 exports under the 2026 phase-in?"*
   - Verify Specific Embedded Free Allocation (SEFA) explanation.
   - Verify strict Scope 2 exclusion under EU Regulation 2023/956 Annex IV.
   - Verify normalized financial units (euros per tonne, tonnes of CO2 equivalent).
4. **Scenario 4: Ferritic J430 Scrap Ceiling & Tramp Copper Dilution**:
   - Query: *"Why is scrap capped at 70% on J430 and how does tramp copper affect rollability?"*
   - Verify scrap ceiling shadow price $\mu_{\mathrm{scrap}}$ vocalized naturally.
   - Verify tramp copper [Cu] $\le 0.25\%$ translated to spoken English.
   - Verify operational lever: charge virgin gas DRI to dilute tramp copper.
5. **Scenario 5: India BEE CCTS Carbon Credit Trading Briefing**:
   - Query: *"How does beating the BEE CCTS benchmark of 0.8222 tCO2/t generate cash EBITDA?"*
   - Verify CCTS target vocalization and CCC carbon certificate monetization.
   - Verify dual shadow price $\pi_t$ translated to *"dual shadow price"*.
   - Verify spoken word count within executive briefing constraints.

---

## 5. Execution Environment & Verification Commands

### 5.1 Test Execution Command
```powershell
python -m pytest tests/test_e2e_voice.py -v --tb=short
```

### 5.2 Full Regression Gate Command
```powershell
python -m pytest tests/ -v
```

### 5.3 Acceptance Verification Criteria
- All tests in `tests/test_e2e_voice.py` pass with 0 failures and 0 errors.
- All 302 existing backend tests pass without regressions.
- All test assertions are opaque-box, verifiable, and strictly derived from the requirements.
