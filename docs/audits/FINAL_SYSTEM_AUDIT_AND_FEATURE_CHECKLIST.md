# JSL Carbon & Energy Engine — Master System Audit & Feature Verification Specification

This document provides a comprehensive, component-by-component audit checklist for the entire **JSL Carbon & Energy Engine**, covering pyrometallurgical physics, continuous LP optimization, regulatory compliance models (EU CBAM & India BEE CCTS), the 1,050-sample chatbot training dataset, deterministic function calling tools, the neural voice agent, and the Next.js frontend cockpit.

---

## 1. Executive Summary of Audit Scope

| Domain | Files / Modules | Critical Invariants to Audit |
|---|---|---|
| **Metallurgical Master Data** | `core/grades.py` | 43 authentic JSL grades + J316 alias; tramp limits (Cu, Sn, P, S); PREN formulas; physical scrap caps (70% ferritic, 85% austenitic). |
| **Mass Balance & Stoichiometry** | `core/mass_balance.py` | Closed-loop 1.000t liquid steel closure; stoichiometric iron crediting from FeCr (~40%), NPI (81.5%), FeMo (33%), FeMn (20%); zero virgin Fe double-counting. |
| **Thermodynamics & Enthalpy** | `core/thermodynamics.py` | Dynamic EAF SEC scaling; cold DRI endothermic penalty (+1.2 kWh/t per 1% DRI); Jajpur molten FeCr sensible heat credit (-86.0 to -113.0 kWh/t). |
| **Emissions Accounting** | `core/emissions.py` | Scope 1 decarburization + 2.0 kg/t electrode oxidation; Scope 2 captive coal CPP (1.00 t/MWh) vs Northern grid (0.72 t/MWh) vs PPA (0.03 t/MWh); Scope 3 upstream. |
| **AOD Slag Kinetics** | `core/slag_kinetics.py` | FeSi 75 stoichiometric reduction of Cr2O3; quicklime flux demand; binary basicity $B_2 = 1.90$; discard slag mass. |
| **Charge Optimization (LP)** | `core/optimizer.py`, `frontend/src/lib/simplex.ts` | Continuous Simplex / HiGHS; multi-objective $\alpha \in [0, 1]$; phosphorus partition barrier ($\eta_{\mathrm{P}} = 0.99$); tramp shadow prices ($\pi_t$); scrap ceiling marginal ($\mu_{\mathrm{scrap}}$); Value-in-Use ($\mathrm{ViU}_j$). |
| **Stochastic Risk** | `core/monte_carlo.py` | 1,000-run correlated Gaussian scrap variations; P10/P50/P90 compliance distributions. |
| **Regulatory & Financials** | `core/financials.py` | EU CBAM Regulation 2023/956 phase-in schedule (2026–2034); SEFA benchmark ($0.284\ \mathrm{tCO_2/t}$); Scope 2 strict legal exclusion; Article 9 Indian credit deduction; BEE CCTS plant baseline (0.8792 Jajpur, 0.7600 Hisar) compounding trajectory down to 0.8222 tCO2e/tcs; CCC trading EBITDA. |
| **Chatbot & 8 Tools** | `agent/tools.py`, `agent/nlg_engine.py`, `agent/shap_engine.py` | 8 deterministic tools; exact Permutation Shapley with additive closure check; 3-layer pedagogical persona (Metaphor $\to$ Metrics $\to$ Levers); bidirectional `<<<ACTION:APPLY_COCKPIT_PRESET:...>>>` tokens. |
| **Voice Agent Pipeline** | `agent/voice_service.py`, `api/agent_routes.py`, `frontend/src/lib/voice-agent.ts` | 100% free open-source stack (Microsoft `edge-tts` + W3C Web Speech API); Indian English personas (`en-IN-PrabhatNeural`, `en-IN-NeerjaNeural`); spoken math normalizer; $<300\text{ ms}$ TTFA; $<15\text{ ms}$ barge-in cancellation. |
| **Web API & WebSockets** | `api/app.py`, `api/agent_routes.py` | REST endpoints; dual WebSocket routing (`/voice/ws` root alias + `/api/agent/voice/ws`); exception resilience; malformed JSON recovery. |
| **Frontend Cockpit UI** | `frontend/src/app/*`, `frontend/src/components/*` | Decarbonization Cockpit sliders; dynamic PPA blending; live tramp element audit; 50-point Pareto frontier; interactive Assistant Drawer; Voice Orb. |

---

## 2. Detailed Audit Checklist by Module

### A. Pyrometallurgical Core Engine

#### A1. Grade Chemistry & Tramp Ceiling Integrity (`core/grades.py`)
- [ ] **Grade Coverage**: Verify all 43 authentic JSL commercial grades exist across 4 families (Austenitic, Ferritic, Martensitic, Duplex).
- [ ] **Alias Consistency**: Confirm `J316` is the canonical ID (with alias compatibility for `J316L`).
- [ ] **Scrap Caps**:
  - Ferritic 400-series (e.g. J430) scrap ceiling capped at $\le 70\%$ due to tramp copper accumulation.
  - Austenitic 300-series (e.g. J304) capped at $\le 85\%$.
  - High-performance duplex (e.g. J2205) capped at $\le 60\%$.
- [ ] **PREN Calculation**: Verify $\mathrm{PREN} = \mathrm{Cr} + 3.3 \cdot \mathrm{Mo} + 16 \cdot \mathrm{N}$ is non-negative and matches published datasheets.

#### A2. Stoichiometric Mass Balance & Iron Crediting (`core/mass_balance.py`)
- [ ] **Closure Condition**: Verify $\sum \gamma_j \cdot x_j = 1.000\text{ t} \pm 10^{-5}\text{ t}$ across all 43 grades.
- [ ] **Inherent Iron Crediting**: Confirm that virgin iron required ($x_{\mathrm{Fe, virgin}}$) strictly deducts metallic iron delivered by ferroalloys:
  - HC FeCr: $\sim 40\%\ \mathrm{Fe}$
  - Indonesian NPI: $\sim 81.5\%\ \mathrm{Fe}$
  - FeMo: $\sim 33.0\%\ \mathrm{Fe}$
  - FeMn: $\sim 20.0\%\ \mathrm{Fe}$
- [ ] **Double-Counting Trap**: Ensure no heat double-counts virgin DRI when ferroalloys already provide the necessary iron units.

#### A3. Enthalpy & Dynamic SEC (`core/thermodynamics.py`)
- [ ] **Scrap vs DRI Enthalpy**: Verify scrap baseline is $\sim 420\ \mathrm{kWh/t}$, coal DRI is $\sim 680\ \mathrm{kWh/t}$, and gas DRI is $\sim 560\ \mathrm{kWh/t}$.
- [ ] **Monotonicity**: Increasing DRI percentage must monotonically increase EAF electrical consumption.
- [ ] **Hot Charging Credit**: Confirm Jajpur captive SAF molten FeCr charging delivers a sensible heat deduction of $-86.0$ to $-113.0\ \mathrm{kWh/t}$ liquid steel.

#### A4. Emissions Model (`core/emissions.py`)
- [ ] **Scope 1**: Includes AOD oxidation decarburization ($(\%C_{\mathrm{melt}} - \%C_{\mathrm{final}}) \times \frac{44}{12}$), graphite electrode consumption ($2.0\ \mathrm{kg/t} \times 3.664\ \mathrm{tCO_2/t}$), and natural gas preheating.
- [ ] **Scope 2**: Blended grid factor correctly weights captive coal CPP ($1.00\ \mathrm{t/MWh}$ for Jajpur), state grid ($0.72\ \mathrm{t/MWh}$ for Hisar, $0.79\ \mathrm{t/MWh}$ for national grid), and renewable PPA ($0.03\ \mathrm{t/MWh}$).
- [ ] **Scope 3**: Upstream precursor factors match worldsteel / Ecoinvent guidelines (Indonesian NPI: $55.0\ \mathrm{tCO_2/t\ Ni}$, Class 1 Hydro-Ni: $10.0\ \mathrm{tCO_2/t\ Ni}$).

#### A5. AOD Slag Reduction & Flux Basicity (`core/slag_kinetics.py`)
- [ ] **FeSi 75 Demand**: Verifies stoichiometric reduction of oxidized $\mathrm{Cr}_2\mathrm{O}_3$ ($0.4051\text{ kg Si / kg Cr reduced}$ adjusted for silicon recovery $\varepsilon_{\mathrm{Si}} = 0.85$).
- [ ] **Lime Fluxing**: Quicklime addition strictly enforces target binary basicity $B_2 = \frac{w_{\mathrm{CaO}}}{w_{\mathrm{SiO}_2}} = 1.90$.

---

### B. Linear Programming Charge Optimization (`core/optimizer.py`)

- [ ] **High-Cr Phosphorus Barrier**: Process phosphorus recovery is constrained to $\eta_{\mathrm{P}} = 0.99$ based on Ellingham inequality $\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$. No false dephosphorization claims.
- [ ] **Linearized Electricity Cost in Objective**: Cost vector $\mathbf{c}_{\mathrm{cost}} = \mathbf{c}_{\mathrm{purchase}} + c_{\mathrm{electricity}} \cdot \mathbf{SEC}$ accounts for electrical melting differences between scrap, sponge iron, and hot FeCr.
- [ ] **LP Duality & Shadow Prices**:
  - Extracts dual multipliers $\pi_t = \lambda_t^* \cdot C_0 \cdot 10^{-4}$ for binding tramp elements (Cu, Sn, P, S).
  - Extracts scrap ceiling marginal $\mu_{\mathrm{scrap}} = \nu_{\mathrm{scrap}}^* \cdot C_0$ ($\approx \$330.38/\mathrm{t}$ for J304).
  - Extracts reduced costs $r_j$ and Value-in-Use $\mathrm{ViU}_j = c_{\mathrm{purchase}, j} - r_j$ for unselected feeds.
- [ ] **Continuous Pareto Frontier**: Multi-objective sweep $\alpha \in [0, 1]$ smoothly traces the trade-off between purchase cost and carbon footprint across 50 steps.
- [ ] **Industrial Parity**: Matches Outokumpu Tornio METEC 2011 18/8 benchmark heat within $0.25\%$ (€3,298.24/t vs €3,306.00/t).

---

### C. Regulatory & Financial Compliance Models (`core/financials.py`)

- [ ] **EU CBAM Regulation (EU) 2023/956**:
  - Uses the official high-alloy specific benchmark $\mathrm{BM}_{\mathrm{CBAM, high-alloy}} = 0.284\ \mathrm{tCO_2/t}$ (not generic carbon steel $1.328\ \mathrm{tCO_2/t}$).
  - Multiplies by Cross-Sectoral Correction Factor $\mathrm{CSCF} = 0.87$.
  - Adjusts for circular scrap share: $\mathrm{SEFA} = \mathrm{BM} \cdot \mathrm{CSCF} \cdot (1 - \phi_{\mathrm{scrap}})$.
  - **Strict Scope 2 Exclusion**: Verifies zero indirect electricity emissions are included in iron & steel CBAM duties per Annex II.
  - Phase-in trajectory follows the official schedule: $2.5\%$ in 2026, $10.0\%$ in 2028, $48.5\%$ in 2030, $77.5\%$ in 2032, $100.0\%$ in 2034.
  - Article 9 third-country carbon price deductions are properly subtracted.
- [ ] **India BEE CCTS Scheme**:
  - Includes both Scope 1 direct + Scope 2 net imported grid electricity in $\mathrm{SEI}$.
  - Applies plant-specific historical baselines ($0.8792\ \mathrm{tCO_2e/tcs}$ for Jajpur, $0.7600\ \mathrm{tCO_2e/tcs}$ for Hisar).
  - Models statutory compounding reduction trajectory down to $0.8222\ \mathrm{tCO_2e/tcs}$ for Jajpur.
  - Computes surplus/deficit Carbon Credit Certificates (CCCs) monetized at $\text{INR } 1,000\text{–}1,500/\mathrm{tCO_2e}$.

---

### D. Chatbot, 8 Deterministic Tools & Training Dataset

- [ ] **1,050 Golden Samples**:
  - `data/jsl_training_dataset.jsonl` contains exactly 1,050 validated samples.
  - Covers all 43 JSL grades $\times$ 9 distinct operational scenarios (charge optimization, thermodynamics, CBAM, CCTS, slag kinetics, grade chemistry, Pareto sweep, Monte Carlo risk, adversarial traps).
  - Structured in standard ChatML / OpenAI function calling format.
- [ ] **5-Gate Validation Filter (`scripts/validate_jsl_dataset.py`)**:
  - 100.0% pass rate on Mass Balance Closure ($1.000\text{ t} \pm 0.001\text{ t}$).
  - 100.0% pass rate on CBAM Scope 2 Exclusion.
  - 100.0% pass rate on Phosphorus Partition Barrier ($\eta_{\mathrm{P}} = 0.99$).
  - 100.0% pass rate on Numerical Tolerancing ($\pm 0.5\%$).
  - 100.0% pass rate on 3-Layer Pedagogical Format.
- [ ] **8 Deterministic Tools (`agent/tools.py`)**:
  1. `calculate_metallurgy`
  2. `solve_charge_optimizer`
  3. `run_monte_carlo_risk`
  4. `compute_multi_target_shapley`
  5. `compute_slag_and_flux_kinetics`
  6. `get_cbam_trajectory`
  7. `sweep_pareto_frontier`
  8. `get_grade_chemistry_and_limits`
- [ ] **Permutation Shapley Engine (`agent/shap_engine.py`)**:
  - Evaluates all 64 coalitions across 6 furnace parameters.
  - Enforces exact additive closure ($|\sum \phi_i - \Delta| < 10^{-4}$) across all 4 targets (`total_co2_t`, `eaf_sec_kwh`, `cbam_tariff_eur`, `ccts_value_inr`).
- [ ] **Bidirectional Cockpit Action Protocol**:
  - Chat responses embed `<<<ACTION:APPLY_COCKPIT_PRESET:{...}>>>`.
  - Visual chat drawer renders interactive "Apply Recommended Preset to Cockpit Sliders" button.
  - Clicking dispatches `APPLY_COCKPIT_PARAMS_EVENT` to update live cockpit sliders.

---

### E. Neural Voice Agent Architecture

- [ ] **100% Free & Open-Source Stack**:
  - Zero paid API keys, zero external subscriptions (no ElevenLabs, OpenAI Audio, or paid cloud APIs).
  - Python Microsoft `edge-tts` generates neural audio out of the box.
  - Browser W3C Web Speech API handles STT with zero server transcription cost.
  - Client-side `SpeechSynthesisUtterance` provides zero-latency offline fallback.
- [ ] **Personas**:
  - Default: `en-IN-PrabhatNeural` (Indian English Male Process Engineer).
  - Alternative: `en-IN-NeerjaNeural` (Indian English Female Metallurgist).
  - International: `en-US-JennyNeural` (Technical Specialist).
- [ ] **Spoken-Word Normalizer (`agent/voice_service.py`)**:
  - Converts LaTeX formulas into spoken words (e.g. `$\eta_{\mathrm{P}} = 0.99$` $\to$ *"phosphorus recovery efficiency of 99 percent"*).
  - Translates Ellingham inequality $\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$ into *"chromium oxidizes at vastly lower chemical potential than phosphorus"*.
  - Normalizes Greek variables ($\pi_t \to$ *"dual shadow price"*, $\mu_{\mathrm{scrap}} \to$ *"scrap ceiling shadow price"*).
  - Translates chemical species (`FeCr` $\to$ *"ferro-chrome"*, `NPI` $\to$ *"nickel pig iron"*, `Cr2O3` $\to$ *"chromium oxide"*).
  - Completely strips raw markdown tables, action tokens, and markdown hashes from audio stream while preserving them in the visual chat drawer.
  - Enforces concise **15–25 second executive briefing** format.
- [ ] **Full-Duplex Interactive WebSocket (`/voice/ws` and `/api/agent/voice/ws`)**:
  - Real-time MP3 streaming with Time-to-First-Audio $< 300\text{ ms}$.
  - Auditory acoustic fillers (*"Calculating Simplex charge mix...", "Inverting EAF enthalpy balance..."*) emitted during heavy compute.
  - Instant barge-in interruption ($< 15\text{ ms}$) — immediately cancels active asyncio task and silences playback when user speaks.

---

### F. Frontend Cockpit & Build Verification

- [ ] **Next.js 14 Production Build**:
  - `npm run build` in `frontend/` succeeds with 0 errors and 0 warnings.
  - All 7 static pages prerendered cleanly (`/`, `/calculator`, `/optimizer`, `/methodology`, `/_not-found`).
- [ ] **Decarbonization Cockpit (`/calculator`)**:
  - Interactive sliders for scrap ratio (0–85%), raw material sources, and hybrid renewable PPA share (0–100%).
  - Real-time Scope 1, Scope 2, Scope 3 balance sheets.
  - Live CBAM tariff (€/t) and CCTS CCC EBITDA balance (₹ Cr/yr).
- [ ] **Charge Optimizer Cockpit (`/optimizer`)**:
  - Interactive $\alpha$ cost-carbon slider.
  - Facility toggle (Jajpur with molten FeCr credit vs Hisar).
  - Live Tramp Element Integrity Audit (Cu, Sn, P, S).
  - Value-in-Use table showing break-even procurement prices.
  - Interactive 50-point Pareto frontier chart.
- [ ] **Methodology & Formulas (`/methodology`)**:
  - Clean presentation of all 8 core formulas with derivations.
  - Outokumpu Tornio METEC 2011 benchmark table.
  - Searchable 43-grade metallurgical master table.
  - AI Assistant Drawer and Voice Orb integration with one-click prompt triggers.

---

## 3. Automated Test Verification Matrix

Run these commands to verify the entire system:

```bash
# 1. Run all 376 automated backend tests
python -m pytest tests/ -v

# 2. Run Voice Agent E2E suite (69 tests)
python -m pytest tests/test_e2e_voice.py -v

# 3. Run Metallurgy Benchmark suite (216 tests)
python -m pytest tests/test_metallurgy_bench.py -v

# 4. Run 5-Gate Dataset Physical Validator on 1,050 samples
python scripts/validate_jsl_dataset.py

# 5. Compile Next.js 14 frontend production build
cd frontend && npm run build
```

---

## 4. Ready-to-Use Audit Execution Prompt

Copy and paste this prompt to launch a complete independent audit:

```markdown
Audit the complete JSL Carbon & Energy Engine codebase at C:\Users\Asus\Desktop\JSL against the comprehensive specifications in FINAL_SYSTEM_AUDIT_AND_FEATURE_CHECKLIST.md.

Perform the following 5 verification gates:

Gate 1: Pyrometallurgical & Thermodynamic Verification
- Verify closed-loop mass conservation across all 43 JSL grades in jsl_carbon_engine/core/mass_balance.py.
- Confirm stoichiometric iron crediting eliminates DRI double-counting.
- Verify EAF SEC thermodynamics and Jajpur molten FeCr hot charging sensible heat credit (-86 to -113 kWh/t) in core/thermodynamics.py.
- Verify high-Cr phosphorus recovery barrier (eta_P = 0.99) in core/optimizer.py.

Gate 2: Regulatory & Financial Compliance Verification
- Verify EU CBAM Regulation 2023/956 calculations in core/financials.py: specific high-alloy benchmark (0.284 tCO2/t), CSCF (0.87), scrap crediting, strict Scope 2 legal exclusion, and Article 9 Indian credit deductions.
- Verify India BEE CCTS calculations: Scope 1 + Scope 2 net grid inclusion, Jajpur/Hisar plant-specific baselines, and statutory annual reduction trajectories.

Gate 3: Chatbot Dataset & Tool Engine Verification
- Verify data/jsl_training_dataset.jsonl has 1,050 golden samples.
- Run python scripts/validate_jsl_dataset.py and verify 100% pass rate across all 5 physical gates.
- Verify all 8 deterministic tools in jsl_carbon_engine/agent/tools.py execute correctly.
- Verify Permutation Shapley attributions in agent/shap_engine.py satisfy exact additive closure.

Gate 4: Open-Source Neural Voice Agent Verification
- Verify voice_service.py uses Microsoft edge-tts with zero paid API keys.
- Confirm Indian English personas (en-IN-PrabhatNeural, en-IN-NeerjaNeural).
- Verify MetallurgicalSpokenNormalizer cleanly converts LaTeX, Greek variables, and Ellingham inequalities into natural spoken English, while stripping markdown tables and action tokens.
- Run python -m pytest tests/test_e2e_voice.py and confirm all 69 tests pass with sub-15ms barge-in and WebSocket support on both /voice/ws and /api/agent/voice/ws.

Gate 5: Frontend Build & Test Suite Verification
- Run python -m pytest tests/ and verify all 376 tests pass (100% pass rate).
- In frontend/, run npm run build and confirm 0 errors with all 7 static pages prerendered.

Generate a comprehensive audit report with pass/fail status for every item.
```
