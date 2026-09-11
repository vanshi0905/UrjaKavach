# Stainless Spark Hackathon Carbon Calculator Review

**User:** Anonymous  
**Created:** 9/10/2026 23:11:05  
**Updated:** 9/10/2026 23:15:09  
**Exported:** 9/10/2026 23:20:44  
**Link:** [https://grok.com/c/53095b77-e917-4c5f-9072-b85be6879dbc?rid=132e7bd4-e210-462d-8416-1c0e97813ca6](https://grok.com/c/53095b77-e917-4c5f-9072-b85be6879dbc?rid=132e7bd4-e210-462d-8416-1c0e97813ca6)  

## Prompt:
9/10/2026, 11:15:09 PM

You are an expert Chief Metallurgist, Steelmaking Process Consultant, and Senior Life Cycle Assessment (LCA) Auditor with 25+ years of experience in
  stainless steel pyrometallurgy, EAF-AOD melt shop operations, and global decarbonization economics (EU CBAM and India CCTS).
    You have been hired to conduct an independent, brutally honest, and unbiased technical peer review of our team's hackathon project for:
    Competition: "Stainless Spark – Engineering Innovation, Building Futures"
    Host: Jindal Stainless Limited (JSL) on Unstop
    Track: Problem Statement 3 — "Carbon and Energy Calculator for Steelmaking"
    Submitting Team: Team NIT Raipur (Chhattisgarh, India)
    We have built a production-grade Python calculation and optimization engine called "jsl_carbon_engine" with an interactive Level 2 SCADA pulpit
  dashboard.
    Attached / pasted is our complete Technical Review Dossier ("CHATBOT_REVIEW_PACKET.md").
    Carefully evaluate our technical architecture, pyrometallurgical equations, competitor gap analysis, and honest limitations against real-world
  steelmaking physics and JSL's actual corporate operating assets.
    Please conduct your review under the following 5 structured sections:
    1. Technical Strengths & Competitive Moat:
       - What does our solution do that standard steel calculators (worldsteel Climate Action, ISO 14404, Sphera GaBi, SteelOnTheNet, Climate TRACE) fail
  to do?
       - How well does our first-principles mass balance (FeCr/FeMo/FeMn iron crediting) and dynamic thermodynamic EAF SEC model hold up against
  metallurgical reality?
    2. Critical Flaw & Vulnerability Audit:
       - Did we make any thermodynamic, chemical, or operational mistakes in our mass/energy balances, AOD decarburization stack emissions, or LP
  optimization formulations?
       - Point out any edge cases where our numbers might be vulnerable to skepticism from JSL's Chief Metallurgist.
    3. Evaluation of Our Disclosed Limitations:
       - Review our 6 self-admitted limitations (scrap yard tramp assay variance, stoichiometric slag basicity kinetics, furnace refractory campaign age
  drift, Scope 3 rail/sea freight exclusions, downstream revert scrap temporal lag, and extreme custom bound handling).
       - Are these limitations acceptable for an industrial decision-support tool, and what are our biggest remaining blind spots?
    4. Formal Unstop Evaluation Scoring (Out of 100):
       Score our submission strictly across the 6 official "Stainless Spark" evaluation parameters:
       - Problem Understanding (Weight: 20%)
       - Innovation & Originality (Weight: 20%)
       - Technical Excellence (Weight: 20%)
       - Business Relevance & Impact (Weight: 20%)
       - Feasibility & Scalability (Weight: 10%)
       - Presentation & Communication (Weight: 10%)
    5. The "5 Killer Jury Questions" (Mock Defense):
       - As a senior metallurgical evaluator from Jindal Stainless, what are the 5 toughest, most aggressive questions you would grill our team on during
  the live presentation?
       - Provide the ideal mathematically-backed responses we should give to win maximum points.
    Be rigorous, highly technical, and completely unbiased. Do not hold back on constructive criticism.

[Attachment: walkthrough.md]

[Attachment: backend_architecture_plan.md]

[Attachment: CHATBOT_REVIEW_PACKET.md]

## Response:
9/10/2026, 11:15:09 PM

> **Thoughts:**
>
> - Thinking about your request
> - Gathering real-world facts about JSL
> - Searched web - Jindal Stainless Jajpur captive power plant MW Oyster Renewable PPA
> - Searched web - Jindal Stainless Scope 1 Scope 2 emissions intensity tCO2e per tonne BRSR FY25 FY26 scrap rate renewable
> - Searched web - New Yaking Pte Ltd Halmahera Jindal Stainless nickel pig iron stake
> - Searched web - India CCTS carbon credit trading scheme steel sector baseline stainless steel
> - Searched web - EU CBAM stainless steel default values emission intensity ferrochrome nickel
> - Searching for technical emission data
> - Searched web - Jindal Stainless Jajpur 250 MW captive power plant ferrochrome hot charging SAF
> - Searched web - typical EAF specific energy consumption stainless steel kWh/t AOD decarburization CO2 electrode
> - Searched web - Indonesian RKEF NPI emission factor tCO2 per t nickel vs Class 1 nickel
> - Searched web - Jindal Stainless melt capacity Jajpur Hisar MTPA 2026

I’ll ground the review in JSL’s published assets and real EAF–AOD / CBAM physics before scoring the engine. Checking facility claims, emission factors, and a few thermodynamic numbers first.This is a strong student submission with a real metallurgical spine. It is **not** “scientifically unassailable.” The architecture is the right one for JSL. Several headline numbers would not survive a melt-shop or CBAM audit without restatement. Below is the review a JSL chief metallurgist / LCA verifier should give you before the jury.

---

## 1. Technical Strengths & Competitive Moat

### What this engine does that generic tools do not

Worldsteel Climate Action, ISO 14404, Sphera/GaBi product datasets, SteelOnTheNet factor tables, and Climate TRACE inventories are built around **crude steel as Fe + C**. They can be forced onto stainless, but they do not natively treat the melt shop as a **constrained ferroalloy blending problem**. Your framing is correct and is the single most important intellectual contribution.

The useful differentiators versus those tools:

| Capability | Typical industry calculator | Your engine |
|---|---|---|
| Chemistry | One “stainless” or 304 proxy | 43 JSL grades with Cr–Ni–Mo–Mn–Cu bounds and tramp caps |
| Route | BF–BOF default or generic EAF | EAF–AOD only (correct for JSL stainless) |
| Scrap | Unconstrained 0–100% slider | Grade `scrapCap` + Cu/Sn hot-shortness ceilings |
| Electricity | Flat 500–550 kWh/t | Charge-mix-dependent enthalpy (directionally right) |
| Scope 1 melt shop | Often rolling fuel only | Charge-carbon + electrode carbon in the AOD/EAF stack |
| Nickel | One factor (~8–15 tCO₂/t Ni) | NPI vs Class 1 split tied to New Yaking |
| Plant | National grid factor | Jajpur CPP / PPA vs Hisar grid |
| Decision layer | Reporting | Charge LP + Pareto + CBAM/CCTS translation |

That last row is the moat. A factor table cannot recommend a charge sheet. A GaBi model rarely knows that Jajpur can hot-charge liquid HC FeCr from adjacent SAFs.

### Asset grounding is real, not brochure fiction

The plant twin is the part a JSL engineer will respect:

- Jajpur **2 × 125 MW = 250 MW** coal CPP is documented. [Jindalstainless](https://www.jindalstainless.com/product-brochure/)
- Captive SAF ferrochrome (historically 2 × 60 MVA + 3 × 27.6 MVA class units, ~0.25 MTPA Fe-alloy complex) is documented, and Odisha consent documents explicitly describe **charging liquid ferrochrome into the EAF**. That is a genuine Jajpur peculiarity. Most university teams will miss it. [Ospcboard](https://ospcboard.odisha.gov.in/wp-content/plugins/hearing/uploads/files_1537957200_26375.pdf)
- Oyster hybrid PPA at **315.6 MW** class (MP + Gujarat legs, ~700 GWh/yr design) is a live JSL contract, not a generic “RE slider.” [Outlookbusiness](https://www.outlookbusiness.com/corporate/jindal-stainless-begins-sourcing-power-from-oyster-renewable-energy)
- New Yaking **49% / ~$157M**, Halmahera, **200 kt NPI @ ~14% Ni**, RKEF, commissioned ahead of schedule — correct. [Bssa](https://bssa.org.uk/jindal-stainless-acquires-49-stake-in-indonesia-based-nickel-pig-iron-company/)
- FY26 corporate markers you cite — **1.76 tCO₂e/tcs S1+S2**, ~**70% scrap**, ~**47% renewable electricity**, 50% S1+S2 cut by 2035 / net zero 2050 — match recent JSL disclosures. [Scanx](https://scanx.trade/stock-market-news/companies/jindal-stainless-fy26-results-pat-up-27-4-yoy-to-3-185-crore-ebitda-rises-19-2/47748045)

That is more corporate specificity than 90% of case-competition calculators.

### Mass balance: the *idea* is right

Iron crediting on FeCr / FeMo / FeMn is the correct fix for the prototype’s ~1.07 t/t inflation. HC FeCr is not a chromium bottle; it is a **Cr–Fe–C–Si** alloy. If you demand 18% Cr from 55% Cr FeCr and then *also* buy a full tonne of virgin iron, you double-count the Fe that arrived with the chrome. Writing

$$
M_{\mathrm{Fe,net}}=\max\bigl(0,\,(1-S)w_{\mathrm{Fe}}-0.40M_{\mathrm{FeCr}}-0.33M_{\mathrm{FeMo}}-0.20M_{\mathrm{FeMn}}\bigr)
$$

is the right *structure*.

Recovery-adjusted ferroalloy demand

$$
M_{\mathrm{FeCr}}=\frac{(1-S)\,w_{\mathrm{Cr}}}{\eta_{\mathrm{Cr}}\,C_{\mathrm{Cr,FeCr}}}
$$

is also the right structure, provided $\eta_{\mathrm{Cr}}$ is an **AOD-practice variable**, not a constant (see §2).

### Thermodynamic SEC: right physics family, optimistic calibration

The qualitative model is what a process metallurgist wants:

- scrap melting enthalpy is roughly **380–430 kWh/t** electrical at good yield and chemical-energy credit;
- coal DRI adds **FeO reduction** ($\Delta H \approx +159\,\mathrm{kJ/mol}$ FeO in the usual textbook figure) plus gangue fluxing;
- hot metal / hot FeCr subtracts sensible heat.

Published stainless EAF balances (ThyssenKrupp Nirosta class furnaces) sit near **494–510 kWh/t electrical** on austenitic charges, with total energy input ~750–780 kWh/t once chemical energy, burners, and losses are counted. [Researchgate](https://www.researchgate.net/publication/276409173_Mass_and_energy_balances_of_stainless_steel_EAF)
Indian EAF audits span roughly **420–775 kWh/t** depending on DRI fraction and practice. [Sameeeksha](https://www.sameeeksha.org/books/Electric-Arc-Furnace-Compendium.pdf)
Your 408 → 678 kWh/t monotonic scrap-to-DRI curve is therefore **in the right church**. The 408 kWh/t J304 + Jajpur hot-FeCr case is the *best-practice tail*, not a plant average. That is acceptable if you label it as such.

### LP charge optimizer

A continuous simplex on cost / CO₂ subject to ASTM/JSL windows, tramp caps, and mass is a legitimate OR formulation:

$$
\min_x\; Z=\alpha\,\mathrm{Cost}(x)+(1-\alpha)\lambda\,\mathrm{CO}_2(x)
$$
$$
\sum_j x_j = 1,\quad
w_{i,\min}\le (Ax)_i \le w_{i,\max},\quad
x_{\mathrm{scrap}}\le S_{\mathrm{cap}}(g)
$$

For two linear objectives, a weighted-sum sweep **does** trace the Pareto front. Nine $\alpha$ points are enough for a slide. Blocking induction-furnace “cheap stainless” is the correct operational constraint: IF cannot run a proper AOD chromium-recovery practice at JSL quality.

**Bottom line on moat:** you built a *JSL-specific charge-and-carbon DSS*, not another worldsteel wrapper. That is the right problem.

---

## 2. Critical Flaw & Vulnerability Audit

These are the points a JSL chief metallurgist will press. None of them sink the project. Any one of them, unanswered, will puncture “43/43 tests = truth.”

### 2.1 The mass-conservation identity is partly tautological

The dossier writes a verification identity of the form

$$
M_{\mathrm{total}}=S+M_{\mathrm{Fe,net}}+(M_{\mathrm{FeCr}}C_{\mathrm{Cr}})+\cdots+M_{\mathrm{Ni}}\equiv 1.000\,\mathrm{t}.
$$

Two issues.

**Algebra.** If $M_{\mathrm{Fe,net}}$ is already the *residual* Fe after crediting ferroalloy iron, you must not mix residual Fe with *only the Cr/Mo/Mn *contents* of those alloys. Either:

- add **full alloy masses** and subtract slag/fume/yield losses, or
- add **recovered metallic contributions** of every element and close on 1.000 t liquid.

Mixing residual Fe + elemental alloy contents will close by construction if you defined $M_{\mathrm{Fe,net}}$ that way. Closing to $1.0000\pm0.0005\,\mathrm{t}$ across 43 grades is then a **unit test of your algebra**, not an empirical proof that the melt shop conserves mass.

**Chemistry of HC FeCr.** 55% Cr + 40% Fe = 95%. Real HC FeCr is typically ~60–65% Cr in many Indian SAF specs, **6–8% C**, 1–4% Si, balance Fe (often closer to 25–32% Fe). Your 40% Fe credit is optimistic for many lots. That over-credits iron, under-buys DRI/HMS, and quietly understates both cost and DRI-linked CO₂.

**NPI is not “nickel plus a footnote.”** 14% Ni NPI is ~3% C, high Fe, residual Si/P. Treating Ni demand as $M_{\mathrm{Ni}}=(1-S)w_{\mathrm{Ni}}/\eta_{\mathrm{Ni}}$ and then swapping a “niNPI” emission factor **without putting NPI mass, Fe credit, and C load into the same charge vector** will break both mass and AOD blow time on high-Ni grades (304, 316, 904L). You have an NPI mass-conservation test in the suite; the published equations in the packet still look like metallic-Ni demand. Align the paper with the code before the defense.

### 2.2 Hot-FeCr credit of 800 kWh/t FeCr is high

Liquid steel enthalpy at ~1600–1650 °C is on the order of **380–400 kWh/t**. Liquid HC FeCr is the same order of magnitude (sensible + latent already paid in the SAF).

The correct credit versus *cold solid* FeCr is approximately:

$$
\Delta h_{\mathrm{hot}}\approx \int_{T_0}^{T_{\mathrm{tap}}}c_p\,\mathrm{d}T + \Delta h_{\mathrm{fusion}}
\;\approx\; 350\text{–}450\,\mathrm{kWh/t_{\mathrm{FeCr}}}
$$

not 800 kWh/t. 800 kWh/t looks like a **gross electrical SAF specific consumption** (or a double-counted melt + superheat figure), not the enthalpy delivered into the EAF bath.

Worked check using your own slide number: 800 kWh/t FeCr × ~0.15 t FeCr/t LS ≈ 120 kWh/t LS, which matches your “−117 kWh/t.” If the physical credit is ~400 kWh/t FeCr, the plant-level saving is ~60 kWh/t LS. That still matters. It does not justify advertising 408.4 kWh/t as a *measured* Jajpur SEC.

Ask Jajpur SMS for last-12-month **kWh/t liquid, by grade family, with and without hot FeCr**. If you cannot show that table, present 408 as a *thermodynamic lower bound*, not an operating point.

### 2.3 AOD stack: C → CO₂ is a policy convention, not bath chemistry

Bath reaction in the decarb blow is predominantly

$$
\underline{\mathrm{C}}+\tfrac12\mathrm{O}_2 \rightarrow \mathrm{CO},\qquad
K = f(T,\,a_{\mathrm{C}},\,p_{\mathrm{CO}}).
$$

Early AOD gas is CO-rich; CO₂ rises as C falls and after-combustion / hood combustion convert CO. EU ETS / IPCC product rules usually count **carbon oxidized × 44/12** after assuming full oxidation to CO₂ in the inventory boundary. That is defensible **if you say so**.

What is not defensible:

- implying the AOD *bath* evolves 50–90 kg CO₂/t as CO₂ gas;
- ignoring that oxygen also oxidizes Cr, Si, Mn before the reduction mix is added;
- treating graphite electrode C (typically ~2–3 kg C/t → ~8–11 kg CO₂/t) as if it were in the same league as HC FeCr carbon.

Order-of-magnitude check that *does* support you: 150 kg HC FeCr/t × 7% C = 10.5 kg C → **38.5 kg CO₂/t** if fully oxidized, plus DRI/NPI C and electrodes. **0.050–0.085 tCO₂/t** process + some burner fuel is a believable *slab* process-emission band. Keep it. Change the language from “AOD stack CO₂” to “inventory-equivalent CO₂ from charge carbon + electrodes + fuel, IPCC oxidation fraction = 1.”

Healy / Decker-type Cr–C–T relations are absent. Silicon-reduction stoichiometry

$$
\mathrm{Cr_2O_3}+\tfrac32\mathrm{Si}\rightarrow 2\mathrm{Cr}+\tfrac32\mathrm{SiO_2}
$$

is the **reduction-mix** step, not the decarb step. You have split those modules in the repo; the packet still lets a reader think Si stoich *is* the AOD model. It is only the recovery-mix model. Say that.

### 2.4 The 1.76 vs 2.85 problem (this is the kill-shot if unanswered)

JSL FY26 **S1+S2 = 1.76 tCO₂e/tcs**. [Scanx](https://scanx.trade/stock-market-news/companies/jindal-stainless-fy26-results-pat-up-27-4-yoy-to-3-185-crore-ebitda-rises-19-2/47748045)

Your worked J304 / Jajpur case:

- total **2.8547 tCO₂/t** finished  
- S1 4.7% + S2 20.8% ⇒ **S1+S2 ≈ 0.73 tCO₂/t**

That is **not a calibration**. It is a **boundary mismatch**.

Corporate BRSR S1 at Jajpur includes, in whole or in part:

- 250 MW coal CPP (often S1 if generation is captive);
- SAF FeCr / FeMn / SiMn process + power;
- lime–dolo calcination;
- reheat / annealing fuel;
- possibly coke / other upstream on-site units.

Product LCA / CBAM embedded emissions put many of those tonnes into **precursor S3** or into **electricity S2**, and they are per *finished product tonne after yield*, not per *crude steel tonne* on a corporate denominator.

Until you publish a **reconciliation table** —

| Bucket | BRSR organizational (t/tcs) | Engine product (t/t product) | Why they differ |
|---|---|---|---|
| CPP coal | S1 | S2 (or S1 if you reclass) | … |
| SAF FeCr | S1 plant | S3 precursor | … |
| AOD + electrodes | S1 | S1 | … |
| PPA / grid | S2 | S2 | … |

— a JSL sustainability auditor will treat 1.76 as name-dropped, not calibrated.

Also note: FY25 standalone S1+S2 was **1.85 tCO₂e/tcs**; Hisar and Jajpur intensities differ materially in the integrated report tables. A single 1.76 applied to every heat is a corporate average, not a digital twin. [Jindalstainless](https://www.jindalstainless.com/annualreport/2024-2025/natural-capital.php)

### 2.5 CBAM math is the weakest “business impact” number

Definitive-phase CBAM for iron and steel is **direct emissions + specified precursors** (pig iron, DRI, FeCr, FeMn, FeNi, etc.). **Indirect electricity is generally not in the steel CBAM liability at this stage.** [Outokumpu](https://outokumpu.com/en/expertise/2026/cbam-q-and-a)

The certificate obligation looks like:

$$
N_{\mathrm{cert}}=\bigl[\mathrm{SEE}_{\mathrm{dir+prec}}-BM\cdot \phi_{\mathrm{CBAM}}(y)-C_{\mathrm{paid}}\bigr]_+
$$
$$
€/\mathrm{t}=N_{\mathrm{cert}}\times P_{\mathrm{ETS}}
$$

where $\phi_{\mathrm{CBAM}}$ is the free-allocation phase-down (97.5% in 2026, then 95%, 90%, …). [Taxation-customs](https://taxation-customs.ec.europa.eu/document/download/030fe146-38e5-46b8-82b5-5f72da089a7b_en?filename=GUIDANCE%20ON%20CBAM%20VERIFICATION%20AND%20ACCREDITATION%20FOR%20VERIFIERS%20AND%20NATIONAL%20ACCREDITATION%20BODIES.pdf)

Implications:

- Putting **Scope 2 PPA/CPP electricity** and **mining/freight S3** into a CBAM €/t will **overstate EU duty**.
- Stainless SEE is dominated by **FeCr and Ni precursors**, not by EAF kWh. Your NPI lever is therefore *more* CBAM-relevant than your SEC model — but only if precursor EFs follow the CBAM methodology act, not a generic LCA packet.
- Transitional default totals for some stainless semis were on the order of **~4–5 tCO₂e/t** (direct + indirect). Actual verified values for a high-scrap EAF route will be much lower on the *direct* side and still heavy on ferroalloys. [Taxation-customs](https://taxation-customs.ec.europa.eu/document/download/017e46f1-dd1a-4235-b2d7-dafcc6692acf_en?filename=Default%20values%20transitional%20period.pdf)
- **€205.34/t** and **€123.2M/yr** require three disclosed assumptions you do not show in the packet: (i) SEE definition, (ii) ETS price, (iii) **export tonnes to EU**. Without (iii) the crore figure is theatre.

Route benchmarks circulating for 2026 (BF–BOF 1.370 / DRI–EAF 0.481 / scrap-EAF 0.072 tCO₂e/t) are **crude-steel route benchmarks**, not “304 coil including FeCr.” Applying 0.072 to stainless is how you get a cartoon duty. Do not do that. [Cbamguide](https://cbamguide.com/sectors/steel/benchmarks/)

### 2.6 CCTS ₹329 Cr is a scenario, not a balance-sheet line

India CCTS is an **intensity baseline-and-credit** system. Iron & steel targets have been the slowest to harden; data-quality resets were publicly reported, and final GEI notifications have lagged other sectors. [Livemint](https://www.livemint.com/industry/carbon-trading-market-india-steel-industry-emissions-data-gaps-eu-cbam-11773980686569.html)

Stainless EAF plants sit in the **low-intensity cluster** of draft steel unit data. A surplus versus a *sector* steel average (~2.3–2.5 t/tcs class numbers in commentary) is directionally plausible. [Lse](https://www.lse.ac.uk/granthaminstitute/wp-content/uploads/2025/08/What-does-the-CCTS-mean-for-the-Indian-steel-sector.pdf)

Your +₹1,098.9/t looks like

$$
(I_{\mathrm{baseline}}-I_{\mathrm{JSL}})\times P_{\mathrm{CCC}}
\approx (2.3\text{–}2.5-1.76)\times \sim₹1{,}800
$$

That mixes:

- corporate S1+S2 intensity,
- a carbon-steel-heavy sector benchmark,
- an assumed CCC price still in price discovery (public ranges have been roughly ₹1,000–2,000/t in early outlooks, with wide uncertainty). [Insights](https://insights.climate-decode.com/ccts-iron-steel)

It is a **useful what-if**. It is not “FY26 CCTS P&L.”

### 2.7 NPI swing arithmetic does not match 1.85 tCO₂/t

Literature on coal RKEF NPI is ugly: roughly **40–70 tCO₂e/t Ni** is common; some Halmahera coal-captive points print **higher**; hydro / sulfide Class 1 is roughly **8–15 tCO₂e/t Ni**. Your 55 vs 10 is a fair *scenario pair*. [Ceder](https://ceder.berkeley.edu/publications/2024_Basuhi_Perspective.pdf)

But a **full** swap on 304 (8% Ni) is

$$
0.08\times(55-10)=3.6\,\mathrm{tCO_2/t}
$$

not 1.85. 1.85 is consistent with ~4% contained Ni, a 50% NPI blend on 304, or a 200-series grade. JSL historically said only **15–16% of Ni units** came via NPI. Use that operating mix unless you are modelling a policy shock. [Reuters](https://www.reuters.com/markets/deals/indias-jindal-stainless-strikes-157-mln-deal-secure-nickel-supply-2023-03-28/)

Also: New Yaking is JSL’s **own precursor**. Under GHG Protocol consolidation and under CBAM precursor rules, those tonnes are not an external “Scope 3 lever” you can toggle without touching equity share, first-right-of-refusal tonnes, and allocation. The 49% stake makes the lever *more* important, not cleaner.

### 2.8 LP / operational edge cases

- Scrap is **not** target-grade stainless. 304 revert ≠ HMS ≠ bundle. Your limitation #1 is correct; the optimizer still treats scrap as a single column with grade chemistry. That will recommend illegal tramp on a real day.
- $\eta_{\mathrm{Cr}}=92\%$ vs $96\%$ is a **practice choice** (reduction-mix Si, slag basicity, temperature, tap-to-reduction time), not a free LP variable without a FeSi and lime cost.
- Cu 0.50% / Sn 0.03% are sensible hot-shortness fences; real JSL melt cards are grade-specific and often tighter on 400-series and on bright-bar.
- Yield cascade 98% / 94% / 92% is optimistic for stainless CR (grind, pickle, edge trim, thickness). Sensitivity on yield moves S1+S2+S3 more than a 20 kWh/t SEC argument.
- **Missing asset (2026):** JSL commissioned a **1.2 MTPA Indonesia SMS**; group melt is **4.2 MTPA**, not “3.0+ MTPA India only.” A JSL digital twin that stops at Jajpur + Hisar is already incomplete. [Thehindu](https://www.thehindu.com/business/jsl-jv-unit-starts-stainless-steel-melt-shop-in-indonesia/article70780421.ece)

### 2.9 “43/43 tests” overclaim

The suite is a virtue. It proves internal consistency. It does not prove:

- Jajpur kWh/t,
- BRSR reconciliation,
- CBAM Regulation (EU) 2023/956 arithmetic,
- CCTS draft GEI tables,
- New Yaking measured EF.

Say that out loud. Jury members who have signed an ETS or BRSR statement will otherwise assume you do not know the difference between unit tests and verification.

---

## 3. Evaluation of Disclosed Limitations

Your six caveats are adult. Keep them. They are not enough.

| # | Your limitation | Verdict | What a plant actually needs next |
|---|---|---|---|
| 1 | Scrap assay homogeneity | Acceptable for v1 DSS | Multi-scrap library (SS revert, HMS, bundle, turnings) with assay σ and chance-constrained tramp |
| 2 | Stoichiometric slag vs optical basicity / kinetics | Acceptable | At least a C–Cr–T stop-point (Healy) and a basicity–V-ratio effect on Cr recovery |
| 3 | Refractory campaign / $\eta=68\%$ freeze | Acceptable | SEC = f(heat number) or a ±8% band; 408 kWh/t as P10 not P50 |
| 4 | Sea/rail freight omitted | Acceptable (<5% story) | Indonesia NPI and EU coil freight *do* matter for CBAM actuals and for landed cost; put a toggle |
| 5 | Revert scrap time lag | Acceptable | For CCTS year-on-year, revert is same-year enough; for working capital it is not |
| 6 | Infeasibility halt | Correct behaviour | Return the binding constraint (Ni max, Cu cap, scrap cap) in plain language for the pulpit |

**Blind spots you did not list, and should:**

1. **Inventory standard collision** — GHG Protocol corporate, ISO 14404 / worldsteel, CBAM methodology act, and CCTS GEI rules are four different system boundaries. One engine emitting one “tCO₂/t” will be wrong for three of the four users unless you tag every output with a standard.
2. **Captive FeCr and lime kilns** — on-site calcination and SAF CO₂ are first-class Jajpur S1. If they sit only in S3 emission factors, Jajpur vs Hisar comparison is distorted.
3. **No uncertainty.** Point estimates to four decimals (2.8547 t, €205.34, ₹1,098.9) signal false precision. Monte Carlo on EF ±20% and scrap assay ±0.1% Cu is a one-week upgrade that would impress the jury more than another Chart.js widget.
4. **No measured EF pedigree.** Cite IPCC / CEA / Nickel Institute / IAI is fine for a hackathon; an industrial tool needs a data-quality pedigree and a year stamp. CEA grid factor and a 2015 Nickel Institute factor cannot live in the same heat without a footnote.
5. **Scrap market is not an LP slack variable.** 70% scrap is a *corporate average* in a tight SS-scrap market. The optimizer will always want more scrap on the carbon objective. Reality is availability, residual radioactivity, and tramp — and JSL already runs ~70–72%. The carbon “win” from 70 → 85% may not be purchasable.
6. **Green H₂ at Hisar** is in the story and almost invisible in the equations. Annealing H₂ displaces LPG/HSD on a small S1 slice (~kt CO₂, not melt-shop scale). Do not let the dashboard imply H₂ decarbonizes the EAF.
7. **Allocation of 315 MW PPA** across Jajpur vs Hisar vs future Kharagpur, and across melt vs rolling, is an accounting policy, not a physics parameter. It will move S2 more than hot FeCr will.

**Are the six limitations acceptable for an industrial decision-support tool?**  
Yes — for a **Level-3 offline charge-mix / carbon scenario tool**.  
No — if you keep calling it a “Level 2 SCADA pulpit.” Level 2 implies heat-by-heat coupling to Level 1 PLC, chemistry from OES, and a tap-time model. You have a FastAPI + Chart.js dashboard. That is a very good prototype. It is not a pulpit.

---

## 4. Formal Unstop Scoring (out of 100)

Scoring as a hostile-but-fair technical juror, against the six official weights, and against what a JSL process team can verify in 2026 — not against other student HTML sliders.

| Parameter | Weight | Score | Weighted | Rationale |
|---|---:|---:|---:|---|
| Problem Understanding | 20% | **18 / 20** | 18.0 | Correct object (Fe–Cr–Ni–Mo–Mn–Cu, EAF–AOD), correct JSL assets, correct “65–85% is upstream.” Deduct for stale 3.0 MTPA framing and for conflating BRSR S1+S2 with product totals. |
| Innovation & Originality | 20% | **17 / 20** | 17.0 | Integration is original in this competition: LP + hot-FeCr twin + NPI lever + dual regulatory. Individual pieces (simplex blending, enthalpy SEC) exist in vendor MES. Still clearly above the field. |
| Technical Excellence | 20% | **15 / 20** | 15.0 | Modular engine, 43-grade library, test harness, and closed-loop intent are excellent. Deduct for tautological mass tests, hot-FeCr 800 kWh/t, CBAM boundary, 1.76 vs 0.73 S1+S2, NPI 1.85 arithmetic. |
| Business Relevance & Impact | 20% | **16 / 20** | 16.0 | This is usable by a JSL carbon / RM / melt-shop triad. €123M and ₹329 Cr are over-specified. The *levers* (PPA dispatch, NPI vs Class 1, scrap cap, hot FeCr, Cr recovery) are the real product. |
| Feasibility & Scalability | 10% | **8 / 10** | 8.0 | Python + FastAPI + HiGHS is deployable. Path to plant data (LIMS, power SCADA, RM receipts) is undescribed. Indonesia SMS / Kharagpur not in the twin. |
| Presentation & Communication | 10% | **8 / 10** | 8.0 | Dossier is unusually literate. “Scientifically unassailable,” four-decimal rupees, and “Level 2 SCADA” oversell. Five slides will need to drop swagger and show one reconciliation table. |
| **Total** | **100%** | | **74 / 100** | |

**How to read 74.**  
In a national student case competition this is a **shortlist / finalist** score, not a polite mid-table score. The ceiling from *this codebase* is about **82–85** if you (i) publish the BRSR reconciliation, (ii) retune CBAM to direct + precursors only, (iii) cut financial figures to ranges, (iv) correct FeCr enthalpy and NPI stoichiometry, and (v) add EF uncertainty. The floor, if a juror treats €123M as a claim rather than a scenario, is the mid-60s.

Relative to the official rubric: you are strongest on **problem understanding** and **innovation**, which is the correct shape. Technical excellence is where a metallurgist will not give you 18/20 on the current packet.

---

## 5. Five Killer Jury Questions — and the answers that score

### Q1. “Your J304 Jajpur run prints 2.85 tCO₂/t but only ~0.73 t S1+S2. Our FY26 BRSR is 1.76 tCO₂e/tcs. Which number should I put in a customer EPD?”

**Winning answer**

They are different legal objects.

- **1.76** is organizational S1+S2 per tonne crude steel under BRSR / GHG Protocol. At Jajpur it carries captive CPP, SAF ferroalloys, and lime kilns inside the fence.
- **2.85** is a cradle-to-gate product footprint with ferroalloy precursors in S3 and electricity in S2.
- An EPD / customer declaration should follow the PCR you name (e.g. worldsteel / EN 15804 + stainless PCR), not BRSR.
- A CBAM declaration should follow the methodology act: **direct + listed precursors**, not our 2.85.

Then put one table on the slide: same heat, four columns (BRSR, ISO 14404, CBAM SEE, CCTS GEI). If you cannot fill it live, say so and show the mapping rules. That answer scores higher than defending 2.8547.

---

### Q2. “Walk the CBAM formula that produces €205/t and €123 million.”

**Winning answer**

Write the regulation, not the dashboard:

$$
€/\mathrm{t}=P_{\mathrm{ETS}}\times\bigl[\mathrm{SEE}_{\mathrm{direct+FeCr+FeMn+Ni\;prec}}-BM\cdot\phi(y)-C_{\mathrm{India}}\bigr]_+
$$

State, out loud:

- Steel CBAM in the definitive phase does **not** currently bill EAF electricity the way our S2 chart does. [Outokumpu](https://outokumpu.com/en/expertise/2026/cbam-q-and-a)
- $BM$ for stainless is precursor-inclusive and is **not** the 0.072 scrap-EAF crude benchmark.
- $\phi(2026)\approx97.5\%$ free-allocation residual, so year-1 cash duty is a fraction of full ETS price. [Taxation-customs](https://taxation-customs.ec.europa.eu/document/download/030fe146-38e5-46b8-82b5-5f72da089a7b_en?filename=GUIDANCE%20ON%20CBAM%20VERIFICATION%20AND%20ACCREDITATION%20FOR%20VERIFIERS%20AND%20NATIONAL%20ACCREDITATION%20BODIES.pdf)
- €123M = (duty €/t) × (**disclosed** EU-bound tonnes). If we assumed 0.6 Mt × €205, we will say so. If EU volume is X, the risk is 205X, not a branded constant.

Then give a **range**: default-value exposure vs verified-actual exposure. JSL’s 70% scrap + captive FeCr + rising PPA is an argument for **verified actuals**, which is the real recommendation.

---

### Q3. “Jajpur already hot-charges liquid FeCr. Prove your −117 kWh/t and 408 kWh/t.”

**Winning answer**

Do not defend 800 kWh/t FeCr as gospel.

Physical credit versus cold FeCr:

$$
\Delta E \approx \frac{M_{\mathrm{FeCr}}}{\eta_{\mathrm{th}}}\cdot \Delta h_{\mathrm{liquid@1650^\circ C}}
$$

with $\Delta h \approx 0.35$–$0.45\,\mathrm{MWh/t_{FeCr}}$, not 0.80.

Published stainless EAF electrical SEC on austenitic charges is ~**500 kWh/t** class; 408 is a **thermodynamic floor** with high scrap, hot FeCr, and 68% thermal efficiency. [Researchgate](https://www.researchgate.net/publication/276409173_Mass_and_energy_balances_of_stainless_steel_EAF)

Ask the jury (politely) for Jajpur SMS last-year kWh/t by grade. Until then, report **408–500 kWh/t** as a band and show that the *derivative* $\partial\mathrm{SEC}/\partial x_{\mathrm{DRI}}$ is the decision variable, not the intercept.

---

### Q4. “New Yaking is our 49% RKEF. You swing finished steel by 1.85 tCO₂/t between NPI and Class 1. Show the tonnes.”

**Winning answer**

Per contained nickel:

$$
\Delta I = w_{\mathrm{Ni}}\left(\mathrm{EF}_{\mathrm{NPI}}-\mathrm{EF}_{\mathrm{Cl1}}\right)
$$

With 55 vs 10 tCO₂/t Ni: **304 full swap = 0.08 × 45 = 3.6 t/t**, not 1.85.  
J4 (~1% Ni) full swap ≈ **0.45 t/t**.  
Operating case: JSL historically sourced **~15–16% of Ni units** via NPI → 304 swing ≈ **0.5–0.6 t/t**.

Also put the Fe and C of 14% NPI into the charge: you cannot buy “green nickel” or “dirty nickel” as a scalar. You buy a **C-bearing Fe–Ni alloy** that changes AOD blow and DRI demand.

Offer the strategic line JSL actually cares about: New Yaking is RM security first; the carbon hedge is to **measure** the Halmahera EF and, if the EU buyer pays, to divert Class 1 / hydro Ni onto EU heats while NPI stays on domestic 200-series. That is a *product allocation* policy, which your engine can run tomorrow if you expose Ni-source as a constraint, not only as an EF switch.

---

### Q5. “Your LP puts 70% scrap in J4 and hits Cu 1.5% / Mn 8.5%. What happens when the scrap yard’s Cu is 0.35% not 0.10%, and AOD Cr recovery is 91% not 96%?”

**Winning answer**

This is where you use Limitation #1 and #2 as a weapon, not an apology.

- Today the model is **deterministic LP** with a homogeneous scrap column and fixed $\eta$.
- If incoming Cu is 0.35% and the grade window is 1.5% max with intentional Cu addition, the slack on tramp shrinks; the solver must cut scrap or the heat is hot-short. We already clamp `scrapCap` for that reason.
- Cr recovery 91% vs 96% is a **FeSi + lime + time** cost. Show the stoich:

$$
\Delta M_{\mathrm{FeSi}}\propto (0.96-0.91)\,w_{\mathrm{Cr}}\times \tfrac{3}{4}\cdot\frac{M_{\mathrm{Si}}}{M_{\mathrm{Cr}}}
$$

and the extra S3 of FeSi plus extra slag.

Ideal close: “The industrial next step is two-stage: LP for *planned* charge, then a Monte Carlo on assay and $\eta_{\mathrm{Cr}}$ before the heat is released. We did not fake that with a 43rd passing test.”

That sentence will buy more trust than another Pareto screenshot.

---

## Cross-examination extras (if they still have time)

- **Why is lime calcination not a first-class Jajpur S1 node?** You have a lime–dolo plant on the same site.
- **Who owns Indonesia SMS carbon?** 1.2 MTPA is now in the group boundary. If the dashboard cannot run an Indonesian grid + NPI-adjacent melt shop, the twin is already one year late. [Thehindu](https://www.thehindu.com/business/jsl-jv-unit-starts-stainless-steel-melt-shop-in-indonesia/article70780421.ece)
- **Show one heat that the LP declared infeasible and why.** A solver that always returns “optimal” on 43 grades has not been shown a hostile constraint set.
- **What is the data pipeline from OES / weighbridge / CEA factor update?** Without it this is a thesis, not a pulpit.

---

## Closing verdict

You solved the correct problem: **stainless as a ferroalloy LP with JSL’s actual kilns, wires, and regulators**, not “steel + a Cr factor.” The mass-credit idea, AOD charge-carbon, NPI lever, Jajpur hot-FeCr, and dual CBAM/CCTS layer are the right seven USPs.

What is not yet true:

- the mass tests do not prove plant physics;
- 408 kWh/t and 800 kWh/t FeCr over-claim enthalpy;
- 1.76 is not calibrated to the worked example;
- €205 / €123M / ₹329 Cr are scenario outputs wearing audit clothing;
- 1.85 t NPI swing does not match 8% Ni arithmetic;
- the 2026 company includes an Indonesian melt shop the twin ignores.

Fix those in the five slides: **one physics identity, one boundary reconciliation, one LP Pareto, one regulatory formula with ranges, one 12-month rollout** (LIMS + weighbridge + CBAM precursor file + New Yaking measured EF). Drop “unassailable.” Keep the limitations slide. That is how this engine wins the room rather than winning pytest.

> **Sources:**
>
> 1. [Jindal Stainless Commissions Odisha's Largest Captive Solar Plant | Autocar Professional](https://www.autocarpro.in/news/jindal-stainless-commissions-odishas-largest-captive-solar-plant-126016)
> 2. [Oyster Renewable Commissions 52.8 MW Wind Project for Jindal Stainless, Marks Gujarat Entry](https://www.saurenergy.com/solar-energy-news/oyster-renewable-commissions-528-mw-wind-project-for-jindal-stainless-marks-gujarat-entry-12234499)
> 3. [Jindal Stainless Begins Sourcing Power from Oyster Renewable Energy – Outlook Business](https://www.outlookbusiness.com/corporate/jindal-stainless-begins-sourcing-power-from-oyster-renewable-energy)
> 4. [Jindal Stainless Seals 282-MW Hybrid Renewable Power Deal With Oyster](https://list.solar/news/jindal-stainless-2/)
> 5. [AB Energia Commissions 30 MWp Captive Solar Projects at Jindal Stainless’ Manufacturing Unit in Odisha - Asia Pacific | Energetica India Magazine](https://www.energetica-india.net/news/ab-energia-commissions-30-mwp-captive-solar-projects-at-jindal-stainless-manufacturing-unit-in-odisha)
> 6. [Jindal Stainless and AB Energia commission Odisha's largest captive solar plant, ETManufacturing](https://manufacturing.economictimes.indiatimes.com/news/industry/jindal-stainless-and-ab-energia-commission-odishas-largest-captive-solar-plant/120517699)
> 7. [Jindal Stainless completes $14.2m investment in Oyster Green](https://www.power-technology.com/news/jindal-stainless-oyster-green/)
> 8. [Jindal Stainless partners with Oyster Renewable for 282 MW wind-solar hybrid project for self-consumption - pv magazine India](https://www.pv-magazine-india.com/2025/06/05/jindal-stainless-partners-with-oyster-renewable-for-282-mw-wind-solar-hybrid-project-for-self-consumption/)
> 9. [https://www.jindalstainless.com/annualreport/2024-2025/assets/pdf/statutory-reports.pdf](https://www.jindalstainless.com/annualreport/2024-2025/assets/pdf/statutory-reports.pdf)
> 10. [Jindal Stainless FY26 PAT up 27.4% to ₹3,185 crore; outlines strategic roadmap](https://scanx.trade/stock-market-news/companies/jindal-stainless-fy26-results-pat-up-27-4-yoy-to-3-185-crore-ebitda-rises-19-2/47748045)
> 11. [Jindal Stainless Accelerates Shift Toward Low-Carbon Stainless Steel in FY25 - Stainless Today](https://stainlesstoday.com/jindal-stainless-accelerates-shift-toward-low-carbon-stainless-steel-in-fy25/)
> 12. [Interview: Kalyan Bhattacherjee, Chief Sustainability Officer, Jindal Stainless - India's Top Construction magazine | construction industry magazines](https://www.epcworld.in/interview-kalyan-bhattacherjee-chief-sustainability-officer-jindal-stainless/)
> 13. [Rating Rationale](https://www.crisil.com/mnt/winshare/Ratings/RatingList/RatingDocs/JindalStainlessLimited_March%2020_%202026_RR_391359.html)
> 14. [Jindal Stainless](https://www.jindalstainless.com/annualreport/2024-2025/natural-capital.php)
> 15. [Jindal Stainless Limited (JSL) Q4 2026 Earnings Call Transcript | AlphaStreet](https://alphastreet.com/india/jindal-stainless-limited-jsl-q4-2026-earnings-call-transcript/)
> 16. [Jindal Stainless investing ₹900 cr to boost cold rolling capacity to 2.67 MT by FY28 - The HinduBusinessLine](https://www.thehindubusinessline.com/companies/jindal-stainless-investing-900-cr-to-boost-cold-rolling-capacity-to-267-mt-by-fy28/article71352126.ece)
> 17. [Jindal Stainless Acquires 49% Stake in Indonesia Based Nickel Pig Iron Company – British Stainless Steel Association](https://bssa.org.uk/jindal-stainless-acquires-49-stake-in-indonesia-based-nickel-pig-iron-company/)
> 18. [India's Jindal Stainless strikes $157 mln deal to secure nickel supply | Reuters](https://www.reuters.com/markets/deals/indias-jindal-stainless-strikes-157-mln-deal-secure-nickel-supply-2023-03-28/)
> 19. [Jindal Stainless to invest Rs 1,290 crore in nickel pig iron JV in Indonesia, ETCFO](https://cfo.economictimes.indiatimes.com/news/corporate-finance/jindal-stainless-to-invest-rs-1290-crore-in-nickel-pig-iron-jv-in-indonesia/99089280?utm_source=top_news&utm_medium=tagListing)
> 20. [India’s JSL Limited picks up equity in Indonesian nickel pig iron producer](https://www.steelorbis.com/steel-news/latest-news/indias-jsl-limited-picks-up-equity-in-indonesian-nickel-pig-iron-producer-1284472.htm)
> 21. [Jindal Stainless acquires 49% stake in Indonesian firm for $157 million - Industry News | The Financial Express](https://www.financialexpress.com/business/industry-jindal-stainless-acquires-49-stake-in-indonesian-firm-for-157-million-3025173/)
> 22. [I am delighted to share a major milestone for @Jindal_Official! We have commissioned our Nickel Pig Iron smelter facility in the Halmahera Islands, Indonesia, a full eight months ahead of schedule. This achievement, part of our joint venture with New Yaking Pte. Ltd., marks a historic first for an Indian stainless steel manufacturer in securing raw material reserves outside India. This is particularly significant given India's limited nickel resources. I am extremely proud of this partnership, which is more than just a business; it is a celebration of human relationships and inter-cultural richness. We eagerly look forward to further strengthening our bonds and starting commercial production from the facility soon.](https://x.com/abhyudayjindal/status/1823977025398354277)
> 23. [https://www.jindalstainless.com/press-releases/jindal-stainless-commissions-its-nickel-pig-iron-facility-in-indonesia-ahead-of-schedule/](https://www.jindalstainless.com/press-releases/jindal-stainless-commissions-its-nickel-pig-iron-facility-in-indonesia-ahead-of-schedule/)
> 24. [jindal stainless acquires 49 percent stake in indonesia based nickel pig iron company | ICICI Direct](https://www.icicidirect.com/research/equity/trending-news/jindal-stainless-acquires-49-percent-stake-in-indonesia-based-nickel-pig-iron-company)
> 25. [Indian Carbon Credit Trading Scheme | International Carbon Action Partnership](https://icapcarbonaction.com/en/ets/indian-carbon-credit-trading-scheme)
> 26. [Understanding How Carbon and Trade Policies can Impact the Steel Sector Transition  - RMI](https://rmi.org/resources/understanding-how-carbon-and-trade-policies-can-impact-the-steel-sector-transition/)
> 27. [India’s carbon trading plan for steel industry slows as emissions data gaps force reset | Mint](https://www.livemint.com/industry/carbon-trading-market-india-steel-industry-emissions-data-gaps-eu-cbam-11773980686569.html)
> 28. [https://www.climatepolicyinitiative.org/wp-content/uploads/2025/12/CCUS-in-Indian-Steel-Sector_Final.pdf](https://www.climatepolicyinitiative.org/wp-content/uploads/2025/12/CCUS-in-Indian-Steel-Sector_Final.pdf)
> 29. [Transitioning from energy saving certificates to carbon credits: Evidence from India’s integrated steel industry - ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2772826926000179)
> 30. [https://www.lse.ac.uk/granthaminstitute/wp-content/uploads/2025/08/What-does-the-CCTS-mean-for-the-Indian-steel-sector.pdf](https://www.lse.ac.uk/granthaminstitute/wp-content/uploads/2025/08/What-does-the-CCTS-mean-for-the-Indian-steel-sector.pdf)
> 31. [https://climatecatalyst.org/wp-content/uploads/2026/02/Catalysing-Demand-for-Green-Steel-through-Public-Procurement-in-India-Report.pdf](https://climatecatalyst.org/wp-content/uploads/2026/02/Catalysing-Demand-for-Green-Steel-through-Public-Procurement-in-India-Report.pdf)
> 32. [Iron & Steel: Core Demand Anchor of India's CCTS](https://insights.climate-decode.com/ccts-iron-steel)
> 33. [https://taxation-customs.ec.europa.eu/document/download/3eb64513-8255-4c71-875a-bd0a8c7ff772_en?filename=Guidance%20No.%205..](https://taxation-customs.ec.europa.eu/document/download/3eb64513-8255-4c71-875a-bd0a8c7ff772_en?filename=Guidance%20No.%205..)
> 34. [https://taxation-customs.ec.europa.eu/document/download/c6cca669-7cad-4cbf-b677-cded116def9f_en?filename=IA%20on%20Default%20Values_0.pdf&prefLang=bg](https://taxation-customs.ec.europa.eu/document/download/c6cca669-7cad-4cbf-b677-cded116def9f_en?filename=IA%20on%20Default%20Values_0.pdf&prefLang=bg)
> 35. [https://taxation-customs.ec.europa.eu/document/download/017e46f1-dd1a-4235-b2d7-dafcc6692acf_en?filename=Default%20values%20transitional%20period.pdf](https://taxation-customs.ec.europa.eu/document/download/017e46f1-dd1a-4235-b2d7-dafcc6692acf_en?filename=Default%20values%20transitional%20period.pdf)
> 36. [CBAM Q and A | Outokumpu](https://outokumpu.com/en/expertise/2026/cbam-q-and-a)
> 37. [Implementing regulation - EU - 2025/2621 - EN - EUR-Lex](https://eur-lex.europa.eu/eli/reg_impl/2025/2621/oj/eng)
> 38. [CBAM Steel Benchmarks 2026: Official Values from IR 2025/2621 | CBAM Guide](https://cbamguide.com/sectors/steel/benchmarks/)
> 39. [https://taxation-customs.ec.europa.eu/document/download/030fe146-38e5-46b8-82b5-5f72da089a7b_en?filename=GUIDANCE%20ON%20CBAM%20VERIFICATION%20AND%20ACCREDITATION%20FOR%20VERIFIERS%20AND%20NATIONAL%20ACCREDITATION%20BODIES.pdf](https://taxation-customs.ec.europa.eu/document/download/030fe146-38e5-46b8-82b5-5f72da089a7b_en?filename=GUIDANCE%20ON%20CBAM%20VERIFICATION%20AND%20ACCREDITATION%20FOR%20VERIFIERS%20AND%20NATIONAL%20ACCREDITATION%20BODIES.pdf)
> 40. [Carbon Border Adjustment Mechanism (CBAM) - Finnish Customs](https://tulli.fi/en/carbon-border-adjustment-mechanism)
> 41. [https://www.jindalstainless.com/product-brochure/](https://www.jindalstainless.com/product-brochure/)
> 42. [https://www.jindalstainless.com/wp-content/uploads/2023/11/JSL-_-Annual-Environment-Statement-2022-23.pdf](https://www.jindalstainless.com/wp-content/uploads/2023/11/JSL-_-Annual-Environment-Statement-2022-23.pdf)
> 43. [https://environmentclearance.nic.in/writereaddata/Form-1A/Minutes/1111202222735081ApprovedMinutesof16thEACMeetingheldonNovember3%2C2022.pdf](https://environmentclearance.nic.in/writereaddata/Form-1A/Minutes/1111202222735081ApprovedMinutesof16thEACMeetingheldonNovember3%2C2022.pdf)
> 44. [https://ospcboard.odisha.gov.in/wp-content/plugins/hearing/uploads/files_1537957200_26375.pdf](https://ospcboard.odisha.gov.in/wp-content/plugins/hearing/uploads/files_1537957200_26375.pdf)
> 45. [https://www.jindalstainless.com/annualreport-2023/pdf/directors_report.pdf](https://www.jindalstainless.com/annualreport-2023/pdf/directors_report.pdf)
> 46. [Jindal Stainless Jajpur steel plant - Global Energy Monitor](https://www.gem.wiki/Jindal_Stainless_Odisha_steel_plant)
> 47. [(PDF) Mass and energy balances of stainless steel EAF](https://www.researchgate.net/publication/276409173_Mass_and_energy_balances_of_stainless_steel_EAF)
> 48. [https://www.sameeeksha.org/books/Electric-Arc-Furnace-Compendium.pdf](https://www.sameeeksha.org/books/Electric-Arc-Furnace-Compendium.pdf)
> 49. [https://jernkontoret.se/globalassets/publicerat/nytt-fran-jk/nyheter/2023/ppt/6.-wenjing_iillustrative-examples.pdf](https://jernkontoret.se/globalassets/publicerat/nytt-fran-jk/nyheter/2023/ppt/6.-wenjing_iillustrative-examples.pdf)
> 50. [(PDF) Influence of Metallics and EAF Type on Specific Consumptions and Productivity](https://www.researchgate.net/publication/317007828_Influence_of_Metallics_and_EAF_Type_on_Specific_Consumptions_and_Productivity)
> 51. [https://www.millennium-steel.com/wp-content/uploads/2025/03/cb412843-829b-4022-ade4-125cde35630c.pdf](https://www.millennium-steel.com/wp-content/uploads/2025/03/cb412843-829b-4022-ade4-125cde35630c.pdf)
> 52. [The Influence of Electric-Arc-Furnace Input Feeds on its Electrical Energy Consumption | Journal of Sustainable Metallurgy | Springer Nature Link](https://link.springer.com/article/10.1007/s40831-021-00390-y)
> 53. [https://energyandcleanair.org/wp/wp-content/uploads/2026/04/EN-CREA_Indonesias-nickel_-Aimed-at-EVs-but-still-parked-in-stainless-steel.pdf](https://energyandcleanair.org/wp/wp-content/uploads/2026/04/EN-CREA_Indonesias-nickel_-Aimed-at-EVs-but-still-parked-in-stainless-steel.pdf)
> 54. [Dynamics of land transformation and carbon stock loss from nickel laterite open-pit mining in Indonesia - IOPscience](https://iopscience.iop.org/article/10.1088/1748-9326/ae318f)
> 55. [https://ceder.berkeley.edu/publications/2024_Basuhi_Perspective.pdf](https://ceder.berkeley.edu/publications/2024_Basuhi_Perspective.pdf)
> 56. [The rapid growth in Indonesian nickel production may lead to surging greenhouse gas emissions | IEEFA](https://ieefa.org/articles/rapid-growth-indonesian-nickel-production-may-lead-surging-greenhouse-gas-emissions)
> 57. [https://static-content.springer.com/esm/art%3A10.1038%2Fs44296-025-00059-7/MediaObjects/44296_2025_59_MOESM1_ESM.pdf](https://static-content.springer.com/esm/art%3A10.1038%2Fs44296-025-00059-7/MediaObjects/44296_2025_59_MOESM1_ESM.pdf)
> 58. [Proses RKEF dan Kebutuhan Bijih Nikel untuk Smelter NPI Indonesia | Indoalam](https://indoalam.co.id/id/articles/proses-rkef-kebutuhan-bijih-nikel-smelter-npi)
> 59. [JSL JV unit starts stainless steel melt shop in Indonesia - The Hindu](https://www.thehindu.com/business/jsl-jv-unit-starts-stainless-steel-melt-shop-in-indonesia/article70780421.ece)
> 60. [Jindal Stainless Targets 3.5 MTPA Sales by FY29, Rs 2,600 Cr Capex](https://www.newkerala.com/news/a/jindal-stainless-targets-35-mtpa-sales-fy29-lines-798.htm)
> 61. [Jindal Stainless gains on commissioning Indonesia melt shop, ramps up capacity expansion | Capital Market News - Business Standard](https://www.business-standard.com/markets/capital-market-news/jindal-stainless-gains-on-commissioning-indonesia-melt-shop-ramps-up-capacity-expansion-126032400802_1.html)
> 62. [Jindal Stainless commissions 1.2 MTPA stainless steel melting shop project in Indonesia, ETManufacturing](https://manufacturing.economictimes.indiatimes.com/news/industry/jindal-stainless-commissions-1-2-mtpa-stainless-steel-melting-shop-project-in-indonesia/129790127)
> 63. [Jindal Stainless commissions Indonesia melt shop; commits ₹900 crore to augment downstream capacities](https://www.fortuneindia.com/business-news/jindal-stainless-commissions-indonesia-melt-shop-commits-900-crore-to-augmentdownstream-capacities/131548)



---
Powered by [Grok Exporter](https://www.grokexporter.com)