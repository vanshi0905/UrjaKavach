# EXECUTIVE CASE SUMMARY: JSL CARBON & ENERGY DECISION ENGINE
## Problem Statement 3: Carbon and Energy Calculator for Steelmaking
**Target Enterprise:** Jindal Stainless Limited (Jajpur, Hisar, Chhattisgarh)  
**Engineering Team:** Team NIT Raipur (National Institute of Technology Raipur)  
**System Status:** Production-Grade | 376/376 Pytest Pass Rate | 1,050 Golden Samples Validated | Next.js 14 Cockpit Deployed  

---

# SLIDE 1: APPROACH, MATHEMATICAL ARCHITECTURE & VERIFIED 5-GATE AUDIT METRICS

### The Core Problem: Deconstructing the "Crude Carbon Steel Fallacy"
Standard industry carbon tools (worldsteel, ISO 14404, Sphera GaBi, SteelOnTheNet) model crude steel as elemental iron with carbon ($\text{Fe} + \text{C}$) produced via the Blast Furnace–Basic Oxygen Furnace (BF-BOF) route. Applying crude steel logic to Jindal Stainless is fundamentally flawed:
1. **Thermodynamic Impossibility:** Blowing oxygen in a BOF oxidizes chromium before carbon ($\Delta G^\circ(\text{Cr}_2\text{O}_3) \ll \Delta G^\circ(\text{CO})$); stainless refining strictly requires the EAF-AOD route where inert gas dilution lowers $P_{\text{CO}}$ to preserve chromium.
2. **Alloy Precursor Dominance:** Ferroalloys ($\text{FeCr}, \text{Ni}, \text{FeMo}, \text{FeMn}$) account for 20–25% of physical mass but dictate **65% to 80% of cradle-to-gate emissions** (Scope 3).
3. **Tramp Element Ceilings:** 100% scrap sliders are unphysical; unoxidizable tramp copper ($\text{Cu} > 0.50\%$) and tin ($\text{Sn} > 0.03\%$) cause severe hot-shortness cracking during hot rolling. Ferritic grades (J430) cannot tolerate $>0.50\%$ Ni contamination.

---

### 4-Card System Architecture & Mathematical Validation

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [CARD 1] CLOSED-LOOP MASS BALANCE & IRON CREDITING                                                     │
│ • Exact 1.000t Mass Balance Closure: Enforces ∑ γ_j · x_j = 1.000 t ± 10^-5 t across all 43 JSL grades.│
│ • Stoichiometric Fe Crediting: Credits metallic Fe in ferroalloys—HC FeCr (40%), Indonesian NPI (81.5%),│
│   FeMo (33%), FeMn (20%)—eliminating the industry-wide 1.073 t/t virgin iron double-counting flaw.     │
│ • Net Virgin Iron Formula: Fe_net = max(0, (1 - S)·w_Fe - ∑ f_Fe,j · M_j), preserving mass conservation.│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [CARD 2] THERMODYNAMIC ENTHALPY & DYNAMIC EAF SEC                                                      │
│ • First-Principles SEC Coupling: Scrap melts at 420 kWh_e/t (285.6 kWh_th/t, η=0.68); high-ash coal   │
│   DRI consumes 680 kWh_e/t due to endothermic FeO reduction (+159.2 kJ/mol) and gangue melting.        │
│ • Jajpur Captive Molten FeCr Credit: Sensible heat from captive Submerged Arc Furnaces (SAF) tapped at │
│   1,600°C delivers -86.0 to -113.0 kWh/t liquid steel electrical reduction (400 kWh_th/t FeCr).       │
│ • AOD Stack Scope 1 Balance: Decarburization oxidation factor 1.0 (ISO 19694-6) captures 50–90 kg CO2/t│
│   direct stack emissions from FeCr (7% C), DRI (2% C), NPI (3% C), and electrodes (2 kg C/t).          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [CARD 3] AOD SLAG KINETICS & PHOSPHORUS PARTITION BARRIER                                              │
│ • Strict Phosphorus Barrier: Process recovery clamped to η_P = 0.99 based on Ellingham inequality     │
│   ΔG°(Cr2O3) << ΔG°(P2O5); strictly disproves false claims of oxidative dephosphorization into slag.   │
│ • FeSi 75 Stoichiometric Reduction: m_Si = 0.4051 · m_Cr,reduced / ε_Si (ε_Si = 0.85); 8.0 kg/t kill   │
│   floor; burnt lime flux enforces binary basicity B_2 = CaO/SiO2 = 1.90 (12.3 kg/t lime on J304).      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [CARD 4] EXPLAINABLE SHAPLEY & NEURAL VOICE INTERACTION                                                │
│ • Multi-Target Permutation Shapley: Evaluates 64 coalitions across 6 features with memoized caching;  │
│   guarantees exact additive closure (|∑ φ_i - Δ| < 10^-6, Error = 0.000e0) across 4 targets in 1.5 ms. │
│ • 100% Free Open-Source Voice Agent: Powered by edge-tts with authentic Indian English personas        │
│   (en-IN-PrabhatNeural, en-IN-NeerjaNeural); spoken math normalizer; sub-15ms barge-in interruption.   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Summary Verification Metrics Table

| Verification Parameter | Industrial Value / Range | Ground Truth Verification & Standard |
|---|:---:|---|
| **Grade Library Coverage** | 43 Authentic JSL Grades | 5 families (200, 300, 400 ferritic, 400 martensitic, Duplex) from official catalogues |
| **Mass Balance Closure** | $1.0000\text{ t} \pm 10^{-5}\text{ t}$ | Verified across all 43 grades in `test_mass_balance.py` |
| **Dynamic EAF Melting SEC** | $420\text{--}680\text{ kWh/t}$ | Sensible scrap vs endothermic DRI enthalpy in `test_thermodynamics.py` |
| **Jajpur Molten FeCr Credit** | $-86.0\text{ to } -113.0\text{ kWh/t}$ | Captive SAF liquid transfer at $1,600^\circ\text{C}$ in `test_thermodynamics.py` |
| **Phosphorus Recovery Barrier** | $\eta_{\mathrm{P}} = 0.99$ | Ellingham thermochemical barrier confirmed in `test_optimizer.py` |
| **Automated Test Suite** | 376 / 376 Passed (100%) | Full pytest suite passing in 43.45s (`tests/`) |
| **Golden Chatbot Dataset** | 1,050 / 1,050 Validated | 100% pass across all 5 physical gates (`scripts/validate_jsl_dataset.py`) |
| **Frontend Production Build** | 0 Errors, 7 Pages Static | Next.js 14.2.15 App Router production compilation (`frontend/`) |

---

# SLIDE 2: CAPABILITIES, IMPACT & ACTIONABLE BUSINESS RECOMMENDATIONS

### Multi-Objective Continuous Optimization & Risk Quantification
Rather than heuristic trial-and-error, `jsl_carbon_engine` deploys a continuous **HiGHS Simplex Linear Programming (LP)** solver and a **1,000-heat correlated 4D Monte Carlo** stochastic engine:
- **50-Point Continuous Pareto Frontier:** Sweeps multi-objective weight $\alpha \in [0, 1]$, achieving up to **35.8% carbon reduction** at an attractive Marginal Abatement Cost of **$112.94 / \text{tCO}_2\text{ avoided}$**.
- **LP Duality & Procurement Analytics:** Extracts exact shadow prices for binding tramp constraints ($\pi_{\text{Cu}}, \pi_{\text{Sn}}, \pi_{\text{P}}, \pi_{\text{S}}$) and the scrap ceiling marginal **$\mu_{\text{scrap}} = \$330.38/\text{t}$** for J304, quantifying the exact economic value of expanding scrap availability.
- **Value-in-Use ($\text{ViU}_j$):** Calculates break-even procurement prices for unselected feeds ($c_{\text{purchase},j} - r_j$).
- **Correlated 4D Monte Carlo Risk:** Ingests multivariate scrap assay variations ($\rho_{\text{Cr,Ni}} = +0.65, \rho_{\text{Cu,Sn}} = +0.45$), guaranteeing **98.8% chance-constrained compliance** against tramp element embrittlement ($\text{Cu} + 8\text{Sn} \le 0.50\%$).

---

### Dual Regulatory Balance Sheets: EU CBAM vs India BEE CCTS

```
┌────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ EU CBAM REGULATION (EU) 2023/956                       │ INDIA BEE CCTS COMPLIANCE LEDGER                       │
├────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ • Official Benchmark: BM_high-alloy = 0.284 tCO2/t     │ • Plant Baselines: Jajpur = 0.8792 tCO2e/tcs; Hisar =  │
│   (Annex IV; distinct from carbon steel 1.328 tCO2/t). │   0.7600 tCO2e/tcs (includes Scope 1 + net Scope 2).   │
│ • Scrap Crediting: SEFA = BM · CSCF(0.87) · (1 - φ_sc).│ • Statutory Target Trajectory: Compounding reduction   │
│ • Strict Scope 2 Exclusion: Zero electricity emissions │   down to 0.8222 tCO2e/tcs for Jajpur Works.           │
│   taxed on steel imports per Annex II legal mandate.   │ • JSL Performance: 0.7400 tCO2e/tcs under hybrid PPA.  │
│ • Article 9 Domestic Carbon Credit: India carbon price │ • Surplus Credit Generation: +0.0822 tCO2e/t surplus   │
│   deductions (€12.07/t credit) legally zero out JSL's  │   Carbon Credit Certificates (CCCs).                   │
│   cash duty in 2026/27 (€0.00/t net duty).             │ • Recurring Financial Gain: +₹36.99 Crore / year       │
│ • 2034 Unhedged Exposure: €180.80/t (€96.8M group risk │   recurring EBITDA upside (at ₹1,500/tCO2e across      │
│   on 600,000 MTPA EU exports) without alloy hedging.   │   Jajpur's 3.0 MTPA crude stainless capacity).         │
└────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

### 3 Initial Actionable Business Recommendations for Jindal Stainless Limited

#### 1. Dual-Market Nickel Sourcing Arbitrage (CBAM vs CCTS Segregation)
- **Insight:** Indonesian coal RKEF NPI carries $55\text{ tCO}_2/\text{t Ni}$ (cost $11,500/t), while Class 1 Hydro Nickel carries $10\text{ tCO}_2/\text{t Ni}$ (cost $17,500/t). Sourcing NPI adds $+1.85\text{ tCO}_2/\text{t finished steel}$ on J304.
- **Strategy:** Bifurcate supply chains: allocate JSL's 49% equity stake in New Yaking (Indonesia) NPI strictly to domestic and Asian product lines where BEE CCTS evaluates only Scope 1+2 operational intensity. Concurrently, mandate 100% Class 1 Hydro Nickel and segregated scrap for EU-destined export heats.
- **Enterprise Impact:** Legally insulates JSL from **€180.80/tonne** in 2034 CBAM duties, protecting **€96.8 Million/year** in European export EBITDA while preserving high-margin NPI cost structures domestically.

#### 2. Institutionalize Captive Molten FeCr Sensible Heat Transfer at Jajpur
- **Insight:** Transporting molten ferrochrome from Jajpur's captive Submerged Arc Furnaces (SAF) directly to the EAF ladle at $1,600^\circ\text{C}$ delivers $400\text{ kWh}_{\text{th}}/\text{t FeCr}$ of sensible and latent heat.
- **Strategy:** Upgrade ladle preheating and crane scheduling to maintain hot charging sensible credits of **$-86.0\text{ to } -113.0\text{ kWh/t liquid steel}$** across all austenitic and ferritic heats.
- **Enterprise Impact:** Yields a net electrical saving of **₹18.2 Crore/year** in EAF power tariffs, shortens power-on tap-to-tap cycles by ~6.5 minutes per heat, and reduces graphite electrode oxidation by 0.15 kg/t.

#### 3. Scale Hybrid Renewable PPAs to Maximize CCTS Carbon Credit Trading
- **Insight:** Jajpur's captive coal CPP emits $1.00\text{ tCO}_2/\text{MWh}$, whereas the Oyster hybrid renewable PPA emits only $0.03\text{ tCO}_2/\text{MWh}$ at a landed tariff of ₹3.60/kWh.
- **Strategy:** Increase renewable PPA blending from 46.8% toward 80%, maintaining Scope 1+2 operational intensity at $\le 0.7400\text{ tCO}_2/\text{tcs}$ against the BEE benchmark of $0.8222\text{ tCO}_2\text{e/tcs}$.
- **Enterprise Impact:** Unlocks **+₹36.99 Crore/year** in recurring CCC trading revenue. Combined with LP charge optimization (₹42.6 Cr/yr) and molten FeCr power savings (₹18.2 Cr/yr), total recurring enterprise gains exceed **>₹95 Crore/year**, achieving full software and Level 2 SCADA payback in **under 18 days**.

---

### Non-Disruptive 16-Week Level 2 Meltshop Implementation Plan

```
Week 1 - 4: Shadow OPC-UA Deployment (Read-only data ingestion from OES spark spectrometers and crane scales; zero melt shop disruption)
Week 5 - 8: EAF/AOD Pulpit Advisory Screen (Touchscreen interface providing real-time charge optimization and tramp copper alerts to melters)
Week 9 - 12: Molten FeCr Telemetry & ERP Sync (Connect SAF ladle load cells and sync real-time inventories with SAP S/4HANA MM/PP)
Week 13 - 16: Multi-Site Expansion & Regulatory Engine (Roll out to Hisar specialty works and activate automated EU CBAM & BEE CCTS XML ledgers)
```
