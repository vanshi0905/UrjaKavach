# Engineering Disclosure Dossier: Assumptions & Limitations
**Topic:** Problem Statement 3 — Carbon and Energy Calculator for Steelmaking  
**Competition:** Stainless Spark – Engineering Innovation, Building Futures (Jindal Stainless Limited)  
**Team:** Team NIT Raipur (National Institute of Technology Raipur, Chhattisgarh)  
**Mandate Covered:** *"Assumptions & Limitations: Highlight assumptions and implementation constraints."*  

---

## 1. Executive Framing: Why Disclosing Assumptions Wins Competitions

In executive pyrometallurgical defense before Senior Plant Directors and Chief Metallurgists, **unqualified claims of "100% precision" are an immediate red flag**. Real steelmaking is high-temperature, multiphase, and semi-turbulent. 

By explicitly declaring our **thermodynamic assumptions**, **regulatory boundaries**, and **engineering limitations**, Team NIT Raipur demonstrates:
1. **Operational Maturity:** We understand the physics of real EAF-AOD melt shops rather than treating metallurgy as a black-box spreadsheet.
2. **Audit Defensibility:** Every calculation has clear boundary conditions that hold up under hostile cross-examination.
3. **Product Roadmap Clarity:** Our disclosed limitations form an actionable industrial enhancement roadmap for JSL.

---

## 2. Pyrometallurgical & Thermodynamic Assumptions

| Parameter / Phenomenon | Assumed Value | Thermodynamic Rationale | Operational Sensitivity |
| :--- | :---: | :--- | :--- |
| **EAF Electrical Efficiency ($\eta_{\text{thermal}}$)** | **$0.68$** (68%) | Baseline electrical-to-thermal transfer efficiency for an Ultra-High-Power (UHP) alternating current Electric Arc Furnace with oxy-fuel wall burners. | Degrades from **$0.72$** (heat 1, new refractory lining) down to **$0.60$** (heat 500, end of lining campaign). Handled in [`thermodynamics.py:81-89`](file:///C:/Users/Asus/Desktop/JSL/jsl_carbon_engine/core/thermodynamics.py#L81-L89) via `furnace_campaign_age`. |
| **Molten FeCr Tap Temperature** | **$1600^\circ\text{C}$** | Liquid ferrochrome tapped from Jajpur’s captive Submerged Arc Furnaces (SAF) and transferred via transfer ladles to the EAF. | Delivers **$400.0\text{ kWh}_{\text{th}}/\text{t FeCr}$** sensible heat ($86.4\text{ kWh}_e/\text{t steel}$ savings). Capped at a plant safety ceiling of **$200\text{ kWh}_{\text{th}}/\text{t steel}$** to prevent refractory thermal shock. |
| **AOD Chromium Slag Oxidation** | **$10\%\text{--}12\%$** | During high-rate oxygen blowing ($3:1$ and $1:1$ $\text{O}_2:\text{Ar}$ ratios), $10\%$ (optimized) to $12\%$ (standard) of metallic chromium is temporarily oxidized into slag as $\text{Cr}_2\text{O}_3$. | Governs the silicon reduction requirement during the subsequent reduction stage. |
| **Silicon Reduction Efficiency ($\eta_{\text{Si}}$)** | **$85\%$** | In the AOD reduction stage, 85% of silicon added via FeSi 75 reduces $\text{Cr}_2\text{O}_3$ back to metallic Cr; 15% oxidizes with dissolved bath oxygen. | Stoichiometry: $\text{Cr}_2\text{O}_3 + 1.5\,\text{Si} \rightarrow 2\,\text{Cr} + 1.5\,\text{SiO}_2$ ($0.4051\text{ kg Si / kg Cr reduced}$). |
| **AOD Deoxidation Kill Floor** | **$8.0\text{ kg FeSi/t}$** | Minimum ferrosilicon addition required to kill dissolved oxygen in the bath before tapping into the teeming ladle. | Enforced in [`slag_kinetics.py:87`](file:///C:/Users/Asus/Desktop/JSL/jsl_carbon_engine/core/slag_kinetics.py#L87) (`fesi_demand_kg = max(8.0, fesi_demand_kg)`). |
| **Slag Basicity Ratio ($B_2$)** | **$1.90$** | Binary basicity ratio ($B_2 = \text{CaO} / \text{SiO}_2$) required to maintain a fluid, neutral-to-basic slag that prevents acidic attack on basic magnesite refractory linings. | Quicklime flux consumption is derived directly from generated $\text{SiO}_2$: $\text{Lime} = (1.90 \times \text{SiO}_2) / 0.95 = 2.0 \times \text{SiO}_2$. |
| **Graphite Electrode Oxidation** | **$2.0\text{ kg C/t}$** | Average graphite electrode tip sublimation and sidewall oxidation in UHP EAFs ($98.5\%\text{ C}$). | Contributes **$7.2\text{ kg CO}_2/\text{t}$** to direct process Scope 1 emissions via $(44/12)$ factor. |
| **AOD Carbon Oxidation Factor** | **$1.0$** (100%) | Under ISO 19694-6 and IPCC Guidelines, all carbon oxidized in the AOD vessel is fully converted to $\text{CO}_2$ gas. | Corrects the historical bug where semi-finished cast slabs showed $0.000\text{ tCO}_2/\text{t}$ Scope 1. |
| **Downstream Yield Multipliers** | **$1.1206\text{x}$ (CR Coil)** | Cascade yield losses across casting ($97\%$) and cold-rolling ($92\%$): $1 / (0.97 \times 0.92) = 1.1206$. | Scales all charged raw materials per tonne of finished commercial deliverable. Bypassable via `ideal_yield=True`. |

---

## 3. Regulatory & Financial Market Assumptions

| Regulatory Variable | Default Assumption | Statutory Legal Grounding | Commercial Sensitivity |
| :--- | :---: | :--- | :--- |
| **EU ETS Allowance Price ($P_{\text{ETS}}$)** | **€80.00 / tCO₂** | Average trading price of European Union Allowances (EUA) on the European Energy Exchange (EEX) (2025–2026 forward curve). | Directly scales EU CBAM certificate exposure. At €100/t, 2034 unhedged risk rises to €226/t. |
| **EU CBAM Benchmark ($BM$)** | **$0.288\text{ tCO}_2/\text{t}$** | EU ETS Benchmark for Scrap-EAF Stainless Steel Flat Products (European Commission Implementing Regulation). | Free allocation benchmark for calculating Specific Embedded Free Allocation ($\text{SEFA}$). |
| **Cross-Sectoral Correction Factor ($CSCF$)** | **$0.87$** (87%) | EU ETS Phase 4 allocation reduction coefficient applied to industrial product benchmarks. | $\text{SEFA}_{2026} = 0.288 \times 0.975 \times 0.87 = 0.244\text{ tCO}_2/\text{t}$. |
| **EU CBAM Phase-In Schedule** | **$2.5\%$ (2026)** $\to$ **$100\%$ (2034)** | Regulation (EU) 2023/956 Definitive Period Phase-In: 2026: 2.5%, 2027: 5%, 2028: 25%, 2030: 50%, 2034: 100%. | Explains why 2026 cash liabilities are small (€0) while 2034 liabilities are severe (€180.80/t). |
| **Scope 2 Boundary in CBAM** | **Strictly Excluded** | Annex II of Regulation (EU) 2023/956 strictly excludes indirect electricity emissions for iron and steel imports. | Prevents artificial inflation of CBAM tariffs by excluding Jajpur’s coal CPP Scope 2 from the EU tariff calculation. |
| **CBAM Article 9 Domestic Deduction** | **Credited in Full** | Article 9 of Regulation (EU) 2023/956 permits full deduction of verified carbon prices paid in the exporting nation. | Scope 1+2 operational emissions paid under India CCTS legally zero out JSL's 2026 and 2027 cash duties. |
| **India CCTS Benchmark (BEE June 2026)** | **$0.8222\text{ tCO}_2\text{e/t}$** | Bureau of Energy Efficiency (BEE) June 2026 draft allocation for JSL Kalinga Nagar Works (Jajpur). | Baseline intensity: $0.8792\text{ tCO}_2\text{e/t}$. JSL performance ($0.740\text{ tCO}_2\text{e/t}$) yields $+0.0822\text{ tCO}_2/\text{t}$ surplus. |
| **India CCC Trading Price** | **₹1,500 / tCO₂e** | Central Electricity Regulatory Commission (CERC) / BEE proposed floor-band trading price for Carbon Credit Certificates. | A $\pm ₹500/\text{t}$ swing changes annual JSL EBITDA by $\pm ₹12.3\text{ Crore / year}$. |
| **Exchange Rate** | **$1\text{ EUR} = ₹92.0\text{ INR}$** | Baseline foreign exchange rate (FY26 corporate planning rate). | Used to reconcile European export tariffs with domestic EBITDA ledgers. |
| **JSL European Export Volume** | **$600,000\text{ MTPA}$** | Disclosed European export volume for JSL cold-rolled coil and specialty strip products. | Basis for computing group-wide annual CBAM exposure (€2.4M in 2026 to €96.8M in 2034). |

---

## 4. Disclosed Technical Limitations & Model Boundaries

To demonstrate rigorous academic integrity, our team explicitly highlights **four known engineering limitations** and outlines their planned technical enhancements:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               FOUR DISCLOSED MODEL LIMITATIONS                                  │
├────────────────────────────────┬────────────────────────────────┬────────────────────────────────┤
│ LIMITATION                     │ CURRENT FORMULATION            │ INDUSTRIAL ROADMAP ENHANCEMENT │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ 1. Internal Revert Scrap       │ Modeled via static yield       │ Multi-period dynamic inventory │
│    Delay Dynamics              │ multiplier (1.1206x for CR)    │ state variable: S_{t+1} = S_t  │
│                                │                                │ + Revert_t - Consumed_t        │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ 2. Slag Partitioning Kinetics  │ Stoichiometric FeSi reduction  │ Decker/Healy non-equilibrium   │
│                                │ balance with 85% Si efficiency │ kinetic partitioning equations │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ 3. Scrap Assay Stochastic      │ Planning-stage 1,000-run       │ Two-stage stochastic LP with   │
│    Recourse Optimization       │ Monte Carlo covariance gate    │ post-melt OES recourse trimming│
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ 4. Supply Chain Logistics      │ Cradle-to-gate boundaries;     │ Intercontinental bulk vessel   │
│    Boundary                    │ excludes maritime freight      │ IMO voyage emissions module    │
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
```

### Limitation 1: Static vs Dynamic Internal Revert Scrap Delay
- **Current State:** Downstream rolling and finishing generate ~8% to 12% internal revert scrap (clean edge trimmings and crop ends). Our current engine accounts for this via static yield multipliers ($1.1206\times$ for cold-rolled coil).
- **Physical Reality:** In an actual melt shop, scrap generated from Heat $N$ is physically baled and charged into Heat $N+2$ or $N+3$ after a multi-hour lag.
- **Roadmap Resolution:** The next engine version implements a multi-period dynamic inventory state variable ($S_{t+1} = S_t + \text{Gen}_t - \text{Cons}_t$) coupled across 24-hour heat scheduling campaigns.

### Limitation 2: Stoichiometric vs Non-Equilibrium Slag Partitioning
- **Current State:** Chromium recovery in AOD is modeled using stoichiometric mass balance ($\text{Cr}_2\text{O}_3 + 1.5\,\text{Si} \rightarrow 2\,\text{Cr} + 1.5\,\text{SiO}_2$) with an empirical $85\%$ silicon utilization factor.
- **Physical Reality:** Slag-metal partitioning is non-equilibrium and governed by thermodynamic oxygen activity ($a_{[\text{O}]}$), bath temperature ($1680^\circ\text{C}$ to $1720^\circ\text{C}$), and optical basicity.
- **Roadmap Resolution:** Incorporate the Healy/Decker non-equilibrium chromium partitioning model to dynamically compute slag $\text{Cr}_2\text{O}_3$ activity as a function of instantaneous bath temperature.

### Limitation 3: Planning-Stage vs Two-Stage Stochastic Recourse
- **Current State:** The 1,000-run Monte Carlo engine models planning-stage assay uncertainty before the scrap bucket is loaded, asserting $P(\text{all specs met}) \ge 95\%$.
- **Physical Reality:** Real melt shops operate with recourse: melters take an in-furnace OES test sample 20 minutes into the heat, and adjust ferroalloy additions during refining.
- **Roadmap Resolution:** Upgrade the linear program into a **Two-Stage Stochastic LP with Recourse**: Stage 1 solves the initial scrap bucket blend; Stage 2 solves the dynamic trim additions after the melt-in spectrometer sample.

### Limitation 4: Maritime Logistics Freight Boundary
- **Current State:** The system boundary is strict **Cradle-to-Gate** (melt shop exit gate). Freight emissions for shipping Indonesian NPI from Halmahera Island to Paradip Port (Odisha) are excluded.
- **Physical Reality:** Handymax bulk cargo vessels emit $\sim 0.015\text{ tCO}_2/\text{t}$ across the 3,200 nautical mile transit.
- **Justification:** Maritime freight represents $<3.5\%$ of the total NPI cradle-to-gate footprint ($55.0\text{ tCO}_2/\text{t Ni}$) and is treated as Scope 3 Category 4 (Upstream Transportation) rather than embedded product emissions under ISO 14067.

---

## 5. Plant Implementation & Operational Constraints

Deploying the software into JSL’s actual melt shops involves real-world industrial constraints:

1. **Scrap Yard Segregation & Crane Bucket Logistics:**
   - *Constraint:* While the LP optimizer outputs continuous fractional recipes (e.g., $70.56\%$ scrap, $19.86\%$ DRI), scrap yard overhead cranes handle discrete magnet and grab bucket loads ($\pm 500\text{ kg}$ resolution).
   - *Mitigation:* The Level 2 software rounds continuous LP charge sheets to the nearest bucket weight increment ($0.5\text{ tonne}$ bins) while maintaining overall heat chemistry within ASTM tolerance bounds.
2. **OES Spectrometer Sampling Latency:**
   - *Constraint:* Optical Emission Spectrometry (OES) spark assays take 3 to 5 minutes for lollipop sample prep, cooling, surface grinding, and multi-spark excitation.
   - *Mitigation:* The optimizer solves in $<45\text{ ms}$, ensuring zero computational bottleneck once spectrometry data is available.
3. **OPC-UA / Industrial Network Latency:**
   - *Constraint:* Meltshop control networks operate behind strict industrial air-gaps and firewalls with $1\text{ Hz}$ PLC telemetry polling.
   - *Mitigation:* The backend engine runs locally as an on-premise microservice (`127.0.0.1:8000`), requiring zero internet connection and interfacing directly with Level 2 PLCs via standard OPC-UA / MQTT protocols.
4. **Operator Authority & Safety Override Protocols:**
   - *Constraint:* Furnace melters must retain ultimate operational authority to override software advice during refractory hot spots, water-cooled panel leaks, or electrode breaks.
   - *Mitigation:* The Level 2 pulpit interface operates in **"Advisory Mode"** by default: the operator reviews the recommended charge recipe and clicks "Confirm Dispatch" before crane bucket instructions are fired.

---

## 6. Ready-to-Use Slide Copy & AI Prompt for Slide Creation

### Exact Slide Text (Bullet-Ready for PowerPoint / Canva):

```markdown
SLIDE TITLE: VALIDATION, FEASIBILITY & ASSUMPTIONS — PROVING INDUSTRIAL RIGOR

[CARD 1] MATHEMATICAL VALIDATION & MASS CLOSURE
• Exact 1.0000 t Mass Balance: Elemental substitution credits Fe in FeCr (40%), NPI (81.5%), FeMo (33%), eliminating the 1.073 t/t double-counting error.
• Dynamic Enthalpy Coupling: Scrap consumes 420 kWh/t; Coal DRI consumes 680 kWh/t. Captive molten FeCr hot-charging credits -86.4 kWh/t at Jajpur.
• Non-Zero Slab Scope 1: AOD decarburization factor 1.0 (ISO 19694-6) correctly captures 50–90 kg CO2/t direct chimney emissions.

[CARD 2] SIMULATIONS & EMPIRICAL PROOF
• 50-Point HiGHS Simplex Pareto Frontier: Unlocks 35.8% max CO2 abatement at $112.94/tCO2 marginal abatement cost.
• 1,000-Heat 4D Monte Carlo Engine: Models Cr-Ni (ρ=0.65) and Cu-Sn (ρ=0.45) covariance, ensuring 98.8% tramp compliance (Cu+8Sn ≤ 0.50%).
• Verified Codebase: 70/70 Pytest unit tests and 142/142 frontend automated tests passing with 100% test integrity.

[CARD 3] REGULATORY GROUNDING & FINANCIAL GAINS
• EU CBAM 2026 Cash Duty = €0.00/t: Article 9 domestic carbon deductions (€12.07/t credit) legally zero out 2026/27 tariffs; hedges €96.8M 2034 risk.
• India CCTS Surplus = +₹36.99 Cr/yr: Scope 1+2 intensity (0.740 tCO2/t) beats BEE June 2026 Jajpur target (0.8222) by +0.0822 tCO2/t.

[CARD 4] ASSUMPTIONS, LIMITATIONS & PLANT FEASIBILITY
• Thermodynamic Assumptions: Furnace thermal efficiency η=0.68 (degrades 0.72→0.60 over 500 heats); AOD basicity B2=1.90 with 8 kg/t FeSi kill floor.
• Disclosed Limitations: Static revert delay (1.12x multiplier) slated for dynamic multi-period inventory state upgrade; maritime freight excluded (<4% footprint).
• Non-Disruptive Level 2 Rollout: Shadow OPC-UA deployment integrates directly with pulpit SCADA; 18-day simple economic payback.
```

---

### Prompt for Your Teammate’s AI (ChatGPT / Gemini / Claude):

```text
You are an elite Management Consulting Presentation Designer (McKinsey/BCG style).
I am competing in the Jindal Stainless Limited (JSL) "Stainless Spark" Engineering Case Study Competition (Problem Statement 3: Carbon & Energy Calculator). My team is Team NIT Raipur.

Please design the complete slide layout and visual copy for our slide on:
"Validation & Feasibility: Present supporting evidence through calculations, simulations, datasets, prototypes or proof of concept. Assumptions & Limitations: Highlight assumptions and implementation constraints."

Use the following strict parameters:
1. Target Audience: Senior Plant Directors (Jajpur & Hisar), VP of Metallurgy, and Head of Sustainability.
2. Structure: 4 clean, high-contrast visual cards (16:9 widescreen layout):
   - Card 1: Mathematical Calculations & Mass Closure (Formula badges for Fe substitution, Dynamic SEC -86.4 kWh/t, and AOD decarb Scope 1).
   - Card 2: Simulations & Proof of Concept (HiGHS LP 50-pt Pareto Frontier, 1,000-run Monte Carlo with 98.8% compliance, 70/70 passing pytest).
   - Card 3: Regulatory & Financial Grounding (EU CBAM Article 9 €0 duty in 2026/27, BEE June 2026 CCTS target 0.8222 yielding +₹36.99 Cr/yr EBITDA).
   - Card 4: Engineering Assumptions & Implementation Constraints (η=0.68 thermal efficiency, static revert delay limitation, Level 2 OPC-UA pulpit feasibility).
3. Design Aesthetic: Dark industrial titanium theme, JSL Crimson (#C8102E) accent badges, Electric Blue (#38BDF8) formula chips, and Emerald Green (#10B981) KPI scorecards.
4. Output Format: Provide the exact visual bounding box layout, card-by-card bullet points (bold lead-ins, zero filler words), formula chips, and a 60-second oral pitch script.
```
