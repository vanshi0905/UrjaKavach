# UrjaKavach (ऊर्जा कवच)
## Physics-Informed Stainless Steel Decarbonization & Charge-Sheet Optimization Engine
**Corporate Partner:** Jindal Stainless Limited (JSL)  
**Competition Track:** Problem Statement 3 — Carbon and Energy Decision Engine for Steelmaking  
**Validation Status:** Production-Grade (**376/376 Automated Tests Passing in 41.4s**)  
**Pitch & Deck Assets:** [`presentation/PITCH_DECK.md`](presentation/PITCH_DECK.md) | [`presentation/SPEAKER_NOTES.md`](presentation/SPEAKER_NOTES.md)

---

## 🌟 Executive Overview & The 3-Layer Architecture

Unlike generic carbon steel calculators that model Blast Furnace–Basic Oxygen Furnace (BF-BOF) $\text{Fe} + \text{C}$ routes, **UrjaKavach** is built from first principles for the **Electric Arc Furnace – Argon Oxygen Decarburization (EAF-AOD)** stainless steelmaking route across all **43 authentic JSL production grades**.

Our solution is structured into 3 distinct engineering layers:
1. **Layer 1: First-Principles Physics & Closed-Loop Mass Conservation**  
   - Conserves mass strictly to $1.0000\text{ t} \pm 0.0005\text{ t}$ across all 43 JSL grades.
   - **Elemental Substitution Accounting**: Eliminates the virgin iron double-counting trap by tracking metallic iron embedded inside ferroalloys (40% Fe in HC FeCr, 33% Fe in FeMo, 20% Fe in FeMn, and 81.5% Fe in Indonesian coal NPI), dynamically offsetting raw DRI demand.
2. **Layer 2: Operational Plant Calibration & Dynamic Enthalpy**  
   - Decouples theoretical thermal enthalpy ($Q_{\text{thermal}}$) from electrical SEC: $\text{SEC} = Q_{\text{thermal}}/\eta_{\text{thermal}} + E_{\text{aux}}$.
   - Features Jajpur Works molten FeCr hot-charging sensible heat credit (saving $-86.0\text{ kWh/t}$ on J304), acidic gangue slag fluxing, and refractory wear degradation across furnace campaigns.
3. **Layer 3: Constrained Optimization & Stochastic Risk Management**  
   - **Continuous Simplex LP (via SciPy HiGHS)**: Solves in under 12ms to generate a high-resolution 50-point **Pareto Frontier** balancing Charge Cost (\$/t) vs. Scope 1+2+3 Carbon Footprint ($\text{tCO}_2/\text{t}$).
   - **1,000-Run Monte Carlo Stochastic Engine**: Evaluates scrap chemistry variance ($\text{Cr}, \text{Ni}, \text{Cu}, \text{Sn}$) and reports **Chance-Constrained Compliance Probability** ($P(\text{specs met}) = 98.2\%$) alongside P10/P50/P90 risk-adjusted cost bands.

---

## 💰 Dual Regulatory Financial Engine (CBAM & CCTS)

- **Legal EU CBAM SEFA Engine (Regulation EU 2023/956)**:  
  Correctly applies the definitive period free allocation benchmark deduction:  
  $$\text{Taxable Emissions}_{2026} = \max\left(0, \, \text{SEE} - 0.975 \cdot BM\right)$$  
  Excludes Scope 2 electricity per official EU steel guidelines. For J304, duty is **€158.34/t** (€95.0M annual EU export risk), expanding to **€180.80/t** by 2034.
- **India CCTS Installation Target (BEE June 2026 Draft Grounding)**:  
  Calibrated to the Bureau of Energy Efficiency (BEE) draft target for **JSL Kalinga Nagar, Jajpur** ($0.8222\text{ tCO}_2\text{e/t equivalent product}$, baseline 0.8792). J304 achieves a **+₹123.3/t carbon credit surplus** (+₹36.99 Cr/yr EBITDA gain).

---

## 📁 Repository Structure

```
UrjaKavach/
├── requirements.txt                           <- Python dependencies (scipy, fastapi, uvicorn, pytest)
├── run_dashboard.bat                          <- Fast launcher for the Web SCADA Dashboard
├── run_tests.bat                              <- One-click automated test runner (376 tests)
├── deploy_to_vercel.bat                       <- Vercel deployment helper
├── main.py                                    <- CLI simulator & REST API launcher
├── README.md                                  <- Master documentation (this file)
├── .gitignore                                 <- Comprehensive Git exclusion rules
│
├── jsl_carbon_engine/                         <- Core Python Engine
│   ├── config/
│   │   ├── emission_factors.py                <- 13 raw materials, Indonesian NPI, electricity emission factors
│   │   └── jsl_facilities.py                  <- Jajpur (CPP, PPA, hot FeCr), Hisar (green H2), Chhattisgarh
│   ├── core/
│   │   ├── grades.py                          <- 43 authentic JSL grades (200, 300, 400, Duplex)
│   │   ├── mass_balance.py                    <- Closed-loop stoichiometry & elemental substitution
│   │   ├── thermodynamics.py                  <- Dynamic EAF SEC enthalpy model
│   │   ├── slag_kinetics.py                   <- FeSi reduction, slag fluxing, Cr recovery
│   │   ├── emissions.py                       <- Scope 1 stack (IPCC/ISO 19694-6), Scope 2, Scope 3
│   │   ├── financials.py                      <- EU CBAM SEFA & BEE CCTS liabilities
│   │   └── optimizer.py                       <- 50-point LP Pareto & 1,000-run Monte Carlo
│   └── api/
│       ├── app.py                             <- FastAPI REST endpoints (/api/calculate, /api/optimize, etc.)
│       ├── schemas.py                         <- Pydantic v2 data models
│       └── static/index.html                  <- Industrial SCADA Dark UI Dashboard
│
├── frontend/                                  <- Next.js/React Enterprise Dashboard
├── tests/                                     <- 376 Automated Unit, Integration & E2E Voice Tests
│
├── presentation/                              <- Pitch & Presentation Suite (Skill: ppt-pitch-crafter)
│   ├── PITCH_DECK.md                          <- 6-Slide Judge-Ready Master Pitch Deck
│   ├── SPEAKER_NOTES.md                       <- 3-Minute conversational spoken pitch scripts
│   └── templates/                             <- 4K 16:9 Clean Slide Master Backgrounds
│
├── docs/                                      <- Structured Engineering Documentation
│   ├── methodology/                           <- FORMULAS, THERMODYNAMICS, ASSUMPTIONS, FEASIBILITY
│   ├── specifications/                        <- System architecture, test infra, solution audit
│   └── audits/                                <- Independent audits & AI Peer Reviews (Claude, DeepSeek, Grok)
│
├── datasheets/                                <- Official JSL technical specification PDFs
├── research_notes/                            <- Case study competition briefs & state carbon profiles
└── scripts/                                   <- Utility & slide template generation scripts
```

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Automated Test Suite (376/376 Tests)
```bash
python -m pytest -v
# or simply double-click run_tests.bat
```

### 3. Run CLI Simulations
- **Calculate emissions for standard AISI 304 at Jajpur Works**:
  ```bash
  python main.py --grade J304 --product crCoil --facility jajpur
  ```
- **Run Linear Programming Optimization on JSL Flagship J4**:
  ```bash
  python main.py --grade J4 --optimize
  ```
- **Generate 50-Point Pareto Frontier**:
  ```bash
  python main.py --grade J304 --pareto
  ```
- **Run 1,000-Heat Monte Carlo Stochastic Scrap Risk Simulation**:
  ```bash
  python main.py --grade J304 --monte-carlo --mc-runs 1000
  ```

### 4. Launch Interactive SCADA Dashboard
```bash
python main.py --serve --port 8000
# or double-click run_dashboard.bat
```
Then open your browser to: **http://localhost:8000**

---

## 🔬 Benchmark Competitor Comparison Matrix

| Feature | Standard Web Tools (e.g. SteelOnTheNet) | Enterprise LCA (e.g. Sphera / GaBi) | UrjaKavach (Decarbonization Engine) |
| :--- | :--- | :--- | :--- |
| **Stainless Chemistry** | ❌ Crude carbon steel only | ⚠️ Generic library profiles | ✅ **43 authentic JSL grades with strict elemental bounds** |
| **Mass Balance** | ❌ None | ⚠️ Static inventory lists | ✅ **Closed-loop mass closure with elemental substitution** |
| **Thermodynamic SEC** | ❌ Fixed assumption (~550 kWh/t) | ❌ Static database coefficients | ✅ **Dynamic enthalpy (DRI penalty, hot FeCr $-86\text{ kWh/t}$)** |
| **Charge Optimization**| ❌ None | ❌ None (retrospective only) | ✅ **50-point Simplex LP Pareto frontier in 8.4ms** |
| **Scrap Uncertainty** | ❌ Deterministic only | ❌ Static averages | ✅ **1,000-run Monte Carlo ($P(\text{specs met}) = 98.2\%$)** |
| **Regulatory Realism** | ❌ None | ⚠️ High-level estimates | ✅ **Legal EU CBAM SEFA benchmark & BEE June 2026 CCTS** |
| **JSL Asset Footprint**| ❌ Generic | ❌ Generic | ✅ **Jajpur (CPP, PPA, hot FeCr), Hisar (green H2), NPI** |
