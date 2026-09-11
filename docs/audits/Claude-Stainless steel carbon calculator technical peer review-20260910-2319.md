# Stainless steel carbon calculator technical peer review

**Created:** 9/10/2026 23:10:33  
**Updated:** 9/10/2026 23:14:32  
**Exported:** 9/10/2026 23:19:40  
**Link:** [https://claude.ai/chat/3ef174a0-e3e3-4f91-98b6-99f6ba17bac9](https://claude.ai/chat/3ef174a0-e3e3-4f91-98b6-99f6ba17bac9)  

## User:

> 9/10/2026 23:10:37

> File: 1789062032029_walkthrough.md

> File: 1789062032029_backend_architecture_plan.md

> File: 1789062032030_CHATBOT_REVIEW_PACKET.md

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

## Assistant:

> 9/10/2026 23:14:32

> Assembled a thorough, well-organized critique for the audit.
>
> - Planning targeted searches to confirm plant and policy claims.
> - Jindal Stainless New Yaking Indonesia nickel stake
> - Verifying details of a joint venture investment deal.
> - Jindal Stainless Jajpur captive power plant 250 MW Oyster Renewable PPA
> - Verifying power plant capacities and commissioning details.
> - Jindal Stainless Hisar green hydrogen plant first commercial
> - Verifying the plant's real use in industrial heat treatment.
> - Jindal Stainless BRSR FY26 scope 1 2 emissions intensity tCO2e scrap rate renewable power
> - Questioning whether captive power emissions were misclassified.
> - EU CBAM steel definitive period 2026 status certificates purchase requirement
> - Working out CBAM's carbon accounting rules for steel imports.
> - India CCTS Carbon Credit Trading Scheme steel sector target 2026 compliance mechanism
> - Assembled a thorough, well-organized critique for the audit.
> - Updating memory
> - **Done**

# Independent Technical Peer Review: `jsl_carbon_engine` — JSL "Stainless Spark" Case Study Competition 2026

Reviewed as requested against real-world EAF-AOD metallurgy, GHG Protocol boundary rules, and the actual current status of EU CBAM and India CCTS (verified against primary sources, not just your dossier's assertions). Verdict up front: **this is a genuinely strong, well-researched submission with real technical depth — but it has one structural flaw that could unravel your headline financial numbers under cross-examination, and several places where precision is being manufactured rather than earned.** Details below.

---

## 1. Technical Strengths & Competitive Moat

**Where you beat worldsteel/ISO 14404/Sphera/SteelOnTheNet — genuinely, not just on paper:**

- **The "Crude Steel Fallacy" framing is correct and matters.** Most academic calculators really do treat steel as Fe+C in a BF-BOF. Modeling stainless as an EAF-AOD ferroalloy system with grade-specific Cr/Ni/Mo/Mn/Cu bounds is the right foundation — this isn't a cosmetic differentiation, it changes which levers dominate the carbon footprint (upstream ferroalloy/nickel sourcing genuinely does dominate stainless LCA, more than melt-shop energy).
- **Iron crediting in the mass balance is metallurgically sound.** Real melt shops do account for the iron delivered by FeCr/FeMo/FeMn rather than double-counting virgin iron on top of alloy additions — your elimination of the "1.073 t bug" reflects an actual industry practice, not an invented one.
- **AOD stack emissions are a real, commonly-missed gap.** Treating slabs as zero-Scope-1 because "only rolling fuel counts" is a genuine failure mode in cruder tools. Stoichiometric carbon oxidation from FeCr/DRI/graphite electrodes producing 50–90 kg CO₂/t is the right order of magnitude and the right mechanism.
- **Your EAF SEC benchmarks are realistic.** 408–430 kWh/t for scrap-heavy charges up to 660–720 kWh/t for coal-DRI-heavy charges sits inside the range reported in IPPC BREF / worldsteel EAF energy literature. The direction (DRI raises SEC via endothermic FeO reduction and gangue melting) is textbook-correct.
- **The JSL asset grounding is real, and this is your best differentiator.** I checked the specific claims rather than assuming they were dressing:
  - JSL's 49% stake in New Yaking Pte Ltd (Halmahera, Indonesia), $157M, 200,000 t/yr NPI at ~14% Ni — **confirmed**, and is a genuinely distinctive, non-obvious lever most competing teams won't know to model.
  - Jajpur's 250 MW captive coal CPP, commissioned 2007 — **confirmed**.
  - Oyster Renewable Energy 315.6 MW hybrid PPA across Jajpur/Hisar — **confirmed** (JSL's own FY26 update calls this its "largest renewable energy investment to date").
  - Hisar's green hydrogen plant with Hygenco — **confirmed** as India's first commercial-scale unit in the stainless sector (though see §2 for how it's actually used, which weakens one of your claims).
  - JSL's FY26-disclosed ~70% EAF scrap utilization and ~47% renewable electricity share — **both confirmed**, matching your parameters closely.

  This level of facility-specific grounding is unusual for a hackathon submission and is a legitimate competitive moat — most teams will use generic CEA grid factors and a flat nickel number. You didn't.
- **The LP optimizer choice is sound engineering, not decoration.** `scipy.optimize.linprog` with HiGHS is a real, current, production-grade simplex/interior-point solver — this isn't a toy claim.

---

## 2. Critical Flaw & Vulnerability Audit

This is where I have to be direct: **your financial engine has a methodology problem that a JSL Chief Metallurgist or CFO's team would catch immediately**, and it's fixable but not cosmetic.

### 🔴 Flaw 1 — CBAM scope mismatch (the big one)
Under the CBAM definitive regime (in force since **1 January 2026**), the rules for iron and steel are specific: **only direct embedded emissions are priced and surrendered — indirect electricity emissions are explicitly excluded** for this sector (unlike cement and fertilizer, which do include indirect emissions). Your dossier's financials engine is described as pricing "exact EU CBAM import duty" without specifying that it isolates direct process emissions from Scope 2 electricity. If your €/t calculation is running off total Scope 1+2+3 (or even just Scope 1+2) rather than the CBAM-defined direct-emissions-only boundary, **the €205.34/t and €123.2M figures are not CBAM-compliant numbers** — they're something else wearing CBAM's name.

There's a second, larger problem stacked on top of this: **CBAM's 2026 certificate liability is only 2.5% of the full carbon price**, because EU domestic producers still receive 97.5% free allocation this year (the factor climbs 2.5% → 5% → 10% → 22.5% → 48.5% → 100% by 2034, per the phase-out schedule). If your €205.34/t is a full, undiscounted carbon-price-times-embedded-emissions number, it overstates *actual 2026 exposure* by roughly 40x. Certificates for 2026 imports also don't even go on sale until February 2027. None of this means your model is worthless — but presenting a single "€123.2M annual EU export risk" figure without disclosing which scenario (2026 actual vs. full 2034 exposure) it represents is the kind of thing that gets a submission marked down for overclaiming rather than up for rigor.

**Fix:** Show two numbers explicitly — "2026 actual liability (2.5% factor, direct-emissions-only)" vs. "full 2034-equivalent exposure" — and cite the phase-in schedule. This turns a vulnerability into a display of regulatory literacy.

### 🔴 Flaw 2 — Scope 1/2 boundary for the captive power plant
Your `emissions.py` bundles "Scope 2 (grid/CPP/PPA)" as one category. Under GHG Protocol operational-control rules, emissions from an **owned, on-site captive power plant supplying the same industrial complex** are generally Scope 1 (direct), not Scope 2 — Scope 2 is for *purchased* grid electricity. Jajpur's 250 MW coal CPP sits inside the same fence line as the melt shop; lumping it with grid and PPA power under "Scope 2" is a boundary error, and it's not academic: it interacts directly with Flaw 1, because if CPP-sourced melting power is misclassified as Scope 2 and excluded from your CBAM calc, but CBAM only wants *direct* emissions, you may be excluding exactly the emissions CBAM cares about, or double-including them elsewhere. This needs an explicit, defended boundary decision, not an implicit one.

### 🟠 Flaw 3 — CCTS numbers are precise about an imprecise scheme
As of mid-2026, **India's iron & steel sector CCTS targets were still in draft** — the Ministry issued a draft notification on 26 June 2026 (public 2 July), with final entity-specific baselines and targets for steel (unlike the 7 sectors already binding since FY2025-26) still pending, and first CCC trading only expected mid-2026. Presenting "+₹1,098.9/tonne, +₹329.7 Cr annual upside" as a fixed number implies a finalized baseline, target, and credit price that **did not exist for steel at the time you'd have been calibrating this**. This isn't wrong reasoning, but it is stated with false confidence. A scenario band (low/base/high credit price, keyed explicitly to the FY2023-24 baseline methodology used elsewhere) would be more defensible and, frankly, more impressive to a judge who knows the policy is still moving.

### 🟡 Flaw 4 — Slag kinetics oversimplification
`Cr₂O₃ + 1.5Si → 2Cr + 1.5SiO₂` is correct stoichiometry, but real AOD Cr recovery (92% vs 96%) is governed primarily by **oxygen-blow ratio, temperature, and slag basicity/optical basicity**, not just FeSi dosing. Treating recovery as a function of silicon addition alone is a simplification a process metallurgist will immediately probe.

### 🟡 Flaw 5 — Precision theater
Publishing outputs to 4–5 significant figures (₹1,098.9/t, €205.34/t, 408.4 kWh/t) built on literature-sourced emission factors (not JSL's own verified plant MRV data) creates an impression of certainty the underlying data doesn't support. Real plant-level carbon accounting carries meaningful uncertainty bands. Consider reporting ranges or confidence bands for headline numbers — it reads as more credible, not less.

### 🟡 Flaw 6 — Validation gap
Your 43 tests validate internal consistency (mass conservation, monotonic SEC scaling) — that's good practice — but I don't see evidence the dossier reconciles a single-grade output (J304 at 2.8547 tCO₂/t) against JSL's own disclosed corporate baseline (1.76 tCO₂e/t, Scope 1+2). These aren't necessarily inconsistent (1.76 is likely a production-mix-weighted, Scope-1+2-only average, while your 2.8547 includes Scope 3 for one grade), but the dossier doesn't show that reconciliation math, and it should — see Jury Question 3 below.

---

## 3. Evaluation of Your Disclosed Limitations

Your 6 self-admitted limitations (scrap assay variance, stoichiometric-vs-kinetic slag modeling, refractory campaign drift, freight-boundary exclusion, revert-scrap lag, infeasibility handling) are **honest and appropriately scoped** — they read as genuine engineering humility rather than hedge-covering, and the infeasibility-halts-cleanly disclosure (#6) is exactly the kind of thing that builds trust with a technical judge.

That said, your biggest actual blind spots aren't on this list:
- **Regulatory immaturity of the instruments you're pricing against** (CBAM phase-in factor, CCTS draft status for steel) — this is a bigger business-relevance risk than furnace refractory drift, and it's currently invisible in your "honest disclosure" section.
- **Scope boundary classification of captive generation** — a methodology choice, not a data limitation, and it should be stated as an assumption rather than buried in code.
- **No uncertainty quantification on emission factors** — you disclose structural limitations but not data-quality ones.

I'd swap "furnace refractory campaign age" (real, but low materiality for a competition-scale demonstrator) for one of these in your next revision — it would read as more relevant self-awareness to this specific jury.

For an industrial decision-support tool, your existing limitations are acceptable *if* the tool is positioned as a directional/scenario engine rather than a bankable, audit-grade figure generator — which is exactly the positioning gap driving the CBAM/CCTS critique above.

---

## 4. Formal Unstop Evaluation Scoring

| Parameter | Weight | Score | Rationale |
|---|---|---|---|
| Problem Understanding | 20% | 17/20 | Correct, sophisticated framing of stainless as ferroalloy chemistry via EAF-AOD; loses points for not fully reckoning with the mechanics of the regulatory instruments it invokes |
| Innovation & Originality | 20% | 17/20 | LP optimizer + Indonesian NPI sourcing lever + facility-level digital twin is a genuinely differentiated assembly for this competition; underlying physics is textbook, but the synthesis is original |
| Technical Excellence | 20% | 13/20 | Solid architecture and test discipline, but real, verifiable errors in CBAM scope handling and Scope 1/2 boundary treatment, plus oversimplified slag kinetics |
| Business Relevance & Impact | 20% | 13/20 | Strong instinct to translate physics into €/₹ terms; headline numbers currently rest on regulatory mechanics that are either misapplied (CBAM phase-in) or not yet finalized (CCTS for steel) |
| Feasibility & Scalability | 10% | 8/10 | Actually built, tested, and deployable (FastAPI + CLI + dashboard) — one of your stronger dimensions |
| Presentation & Communication | 10% | 8/10 | Clean, well-organized; minor cross-document numeric drift (408–430 vs 408–420 kWh/t across your own docs) worth tightening before submission |
| **Total** | **100%** | **76/100** | Strong, above-average technical submission held back by a fixable but material regulatory-methodology gap |

---

## 5. The 5 Killer Jury Questions (Mock Defense)

**1. "Your CBAM output is €205.34/tonne. Walk me through whether that includes Scope 2 electricity — because for iron and steel, CBAM's definitive regime only prices *direct* embedded emissions. And are you using the 2026 phase-in factor of 2.5%, or a full carbon price?"**
*Ideal answer:* Show the calculation isolating furnace/AOD/reheat direct carbon from purchased-grid emissions, and present both a "2026 actual liability" (2.5% factor) and a "full 2034-equivalent exposure" figure, explicitly labeled. Cite the phase-out schedule. This converts a gap into a display of regulatory fluency.

**2. "Is Jajpur's captive coal CPP Scope 1 or Scope 2 in your model, and why?"**
*Ideal answer:* State the boundary assumption explicitly (operational-control approach → owned on-site generation = Scope 1) and show it's a configurable parameter, not a hardcoded guess, with a one-line GHG Protocol citation.

**3. "Your J304 output is 2.8547 tCO₂/t, but JSL's own FY26 disclosure is 1.76 tCO₂e/t Scope 1+2. Reconcile these."**
*Ideal answer:* Show a production-mix-weighted blend across all 43 grades and both facilities, separate out Scope 3 (74.5% of your own 2.8547 figure) to isolate the Scope 1+2 comparable, and demonstrate the blended number converges toward 1.76 — or explain precisely why it doesn't.

**4. "92% vs 96% Cr recovery — that's an AOD blow-practice outcome in the real world, not just a FeSi dosing outcome. Defend the simplification."**
*Ideal answer:* Acknowledge stoichiometric FeSi addition is necessary but not sufficient, frame it explicitly as a boundary/lever assumption pending plant MRV data, and note this as the natural next-iteration item (slag-metal partition/K-value modeling).

**5. "You present a precise ₹329.7 Cr annual CCTS upside — but iron and steel targets under CCTS were still in draft as of mid-2026. How can you be this precise about a scheme that isn't finalized?"**
*Ideal answer:* Reframe as a scenario band tied explicitly to the FY2023-24 baseline methodology already operative for other CCTS sectors, present low/base/high credit-price cases, and state plainly that this is a forward-looking projection contingent on final notification — not a settled number. Owning the uncertainty here reads as more credible than hiding it.

---

**Bottom line:** the metallurgy and mass-balance work is genuinely strong and well beyond typical hackathon depth. The vulnerability is concentrated almost entirely in the financial-regulatory layer, where the numbers are more confident than the underlying policy currently permits. Fix the CBAM scope/phase-in handling and the Scope 1/2 boundary explicitly, reframe CCTS as scenario bands, and this moves from a 76 toward the low-to-mid 80s.

---

**Sources:**

- [Jindal Stainless to acquire 49% stake in Indonesian company to secure nickel supply](https://www.businesstoday.in/amp/latest/corporate/story/jindal-stainless-to-acquire-49-stake-in-indonesian-company-to-secure-nickel-supply-375224-2023-03-29)
- [Jindal Stainless acquires 49% stake in New Yaking Pte. Ltd. an Indonesia-based nickel pig iron company](https://news.railanalysis.com/tag/new-yaking-pte-ltd/)
- [jindal stainless invests in indonesian nickel smelter](https://investmentmonitor.ai/news/jindal-stainless-invests-in-indonesian-nickel-smelter)
- [India's Jindal Stainless buys 49% stake in Indonesian nickel pig iron maker for $157 mln](https://www.kitco.com/news/off-the-wire/2023-03-28/indiaaposs-jindal-stainless-buys-49-stake-indonesian-nickel-pig-iron)
- [jsl becomes first indian company to secure stake in nickel reserves globally](https://www.icicidirect.com/research/equity/blog/jsl-becomes-first-indian-company-to-secure-stake-in-nickel-reserves-globally)
- [- 29 Mar 2023](https://www.icicidirect.com/research/equity/trending-news/jindal-stainless-acquires-49-percent-stake-in-indonesia-based-nickel-pig-iron-company)
- [Jindal Stainless acquires 49% stake in Indonesia-based nickel pig iron company](https://www.maritimegateway.com/jindal-stainless-acquires-49-stake-in-indonesia-based-nickel-pig-iron-company/)
- [jindal acquires new yaking](https://www.nsenergybusiness.com/news/jindal-acquires-new-yaking/)
- [Jindal Stainless moves to secure long-term Indonesian nickel pig iron supply](https://projectblue.com/blue/news-analysis/394/jindal-stainless-moves-to-secure-long-term-indonesian-nickel-pig-iron-supply)
- [www.nsenergybusiness.com](https://www.nsenergybusiness.com/?p=325885)
- [Jindal Stainless Begins Sourcing Power from Oyster Renewable Energy](https://www.outlookbusiness.com/corporate/jindal-stainless-begins-sourcing-power-from-oyster-renewable-energy)
- [jindal stainless begins sourcing power from oyster renewable energy](https://www.outlookbusiness.com/amp/story/corporate/jindal-stainless-begins-sourcing-power-from-oyster-renewable-energy)
- [jindal stainless to procure 282 mw wind solar hybrid power from oyster renewable energy](https://www.energetica-india.net/news/jindal-stainless-to-procure-282-mw-wind-solar-hybrid-power-from-oyster-renewable-energy)
- [www.energymonitor.ai](https://www.energymonitor.ai/?p=118461)
- [jindal stainless](https://www.energetica-india.net/keyword/jindal-stainless)
- [jindal stainless unveils odishas largest in house solar power facility](https://themachinemaker.com/news/jindal-stainless-unveils-odishas-largest-in-house-solar-power-facility/)
- [jindal stainless and ab energia set new benchmark with odishas largest captive industrial solar plant](https://solarquarter.com/2025/04/22/jindal-stainless-and-ab-energia-set-new-benchmark-with-odishas-largest-captive-industrial-solar-plant/)
- [Jindal Stainless and ReNew Power collaborate for renewable energy projects](https://renewablewatch.in/tag/jindal-steel-and-power/)
- [www.epcworld.in](https://www.epcworld.in/?p=9240)
- [hydrogen central](https://hydrogen-central.com/?p=57509)
- [Jindal Stainless goes green with Hydrogen](https://www.maritimegateway.com/jindal-stainless-goes-green-with-hydrogen/)
- [maritimegateway.com](https://maritimegateway.com/?p=70378)
- [jsls hisar plant to start green hydrogen production](https://themachinemaker.com/news/jsls-hisar-plant-to-start-green-hydrogen-production/)
- [jindal stainless inaugurates first green hydrogen plant in stainless sector 0324](https://kallanish.com/en/news/steel/market-reports/article-details/jindal-stainless-inaugurates-first-green-hydrogen-plant-in-stainless-sector-0324)
- [scindia inaugurates indias first green hydrogen plant in stainless steel sector by jindal stainless](https://energetica-india.net/news/scindia-inaugurates-indias-first-green-hydrogen-plant-in-stainless-steel-sector-by-jindal-stainless)
- [Stainless steel sector’s first green hydrogen unit installed at JSL](https://www.iamrenew.com/?p=15494)
- [jindal stainless to build green hydrogen plant](https://www.steeltimesint.com/news/jindal-stainless-to-build-green-hydrogen-plant)
- [By on Tuesday, 05 March 2024](https://etn.news/buzz/jindal-stainless-hisar-plant-green-hydrogen?format=amp)
- [Jindal group company installs Indian stainless steel sector’s first green hydrogen plant](https://compad.in/investment-news/jindal-group-company-installs-indian-stainless-steel-sectors-first-green-hydrogen-plant)
- [jindal stainless unveils fy26 roadmap for sustainable growth](https://themachinemaker.com/news/jindal-stainless-unveils-fy26-roadmap-for-sustainable-growth/)
- [themachinemaker.com](https://themachinemaker.com/?p=108824)
- [jindal stainless hisar unit honoured with times internet ecopreneur award 2026](https://themachinemaker.com/news/jindal-stainless-hisar-unit-honoured-with-times-internet-ecopreneur-award-2026/)
- [jindal stainless targets 50 carbon emissions reduction before 2035](https://www.outlookbusiness.com/amp/story/news/jindal-stainless-targets-50-carbon-emissions-reduction-before-2035)
- [jindal stainless share price update stock rises 5 96 as jsl super steel signs 11 mw solar deal to cut 12 million kg carbon emission](https://www.angelone.in/news/share-market/jindal-stainless-share-price-update-stock-rises-5-96-as-jsl-super-steel-signs-11-mw-solar-deal-to-cut-12-million-kg-carbon-emission)
- [Jindal Stainless Reports Strong FY26 Results; Profit Rises 27% on Robust Demand](https://themachinemaker.com/?p=100805)
- [www.epcworld.in](https://www.epcworld.in/?p=28482)
- [✨ Unlock Data Exports And Disclosure Access. Start Your 30-Day Free Trial Today →](https://tracenable.com/company/jindal-stainless/ghg-emissions)
- [CBAM: the start of the definitive period and the requirement to become a CBAM Authorised Declarant](https://cm.twobirds.com/en/insights/2026/italy/cbam-lavvio-del-periodo-definitivo-e-lobbligo-di-ottenere-lo-status-di-dichiarante-cbam-autorizzato)
- [preparing for eu cbam the 20262027 transition explained](https://www.bsigroup.com/en-GB/insights-and-media/insights/blogs/preparing-for-eu-cbam-the-20262027-transition-explained)
- [Start of the definitive period of the CBAM in the EU](https://trade.ec.europa.eu/access-to-markets/en/news/start-definitive-period-cbam-eu)
- [Carbon Border Adjustment Mechanism (CBAM)](https://osapiens.com/en/regulations/cbam)
- [[SMM Iron & Steel] EU Carbon Border Adjustment Mechanism (CBAM) Enters Definitive Regime](https://news.metal.com/newscontent/103701703)
- [EU adopts proposed CBAM changes, 2026 start remains](https://eurometal.net/eu-adopts-proposed-cbam-changes-2026-start-remains/)
- [www.shinkim.com](https://www.shinkim.com/eng/media/lawinfo/566)
- [www.shinkim.com](https://www.shinkim.com/eng/media/lawinfo/pdf/566)
- [CBAM Definitive Regime: Compliance Requirements, Costs, and Key Changes (2026 Onwards)](https://www.nusconsulting.com/energy-news/cbam-definitive-regime-compliance-costs-changes-2026/)
- [cbam 2026 cla weglowe ue poradnik](https://www.celna24.pl/en/articles/regulations/cbam-2026-cla-weglowe-ue-poradnik)
- [indias iron and steel sector moves closer to ccts compliance will larger decarbonisation follow](https://www.downtoearth.org.in/amp/story/economy/indias-iron-and-steel-sector-moves-closer-to-ccts-compliance-will-larger-decarbonisation-follow)
- [India’s iron and steel sector moves closer to CCTS compliance: Will larger decarbonisation follow?](https://www.downtoearth.org.in/economy/indias-iron-and-steel-sector-moves-closer-to-ccts-compliance-will-larger-decarbonisation-follow)
- [Featured Topics](https://www.spglobal.com/energy/en/news-research/latest-news/energy-transition/020525-indias-carbon-credits-banking-limit-to-be-announced-soon-2027-emission-targets-by-end-of-fy2025-bee)
- [indias carbon market targets too weak to drive industrial transformation report](https://www.downtoearth.org.in/amp/story/climate-change/indias-carbon-market-targets-too-weak-to-drive-industrial-transformation-report)
- [compliance obligations under indias carbon credit trading scheme enter force seven sectors](https://icapcarbonaction.com/en/news/compliance-obligations-under-indias-carbon-credit-trading-scheme-enter-force-seven-sectors)
- [carbon credit trading scheme ccts](https://laex.in/prelims-fact-sheet/carbon-credit-trading-scheme-ccts/)
- [www.taxtmi.com](https://www.taxtmi.com/article/detailed?id=17153)
- [India’s Compliance Carbon Market Faces Its First Real Test This Week](https://www.iamrenew.com/?p=18575)
- [Ease My PrepEase My Prep](https://easemyprep.in/news/2748-centre-issues-fresh-draft-emission-cut-targets-for-iron-and-steel-sector)

Powered by Claude Exporter (https://www.ai-chat-exporter.net)
