# UrjaKavach — 3-Minute Hackathon Pitch Script (Speaker Notes)
**Delivery Time:** 3 Minutes (30 Seconds per slide)  
**Style:** Conversational, assertive engineer speaking to a smart colleague. No buzzwords, no stiff reading.  
**Companion Deck:** `presentation/PITCH_DECK.md`  
**Master Slide Background:** `presentation/templates/slide_master_bg.jpg`  

---

### [00:00 - 00:30] Slide 1: The Blind Spot in Generic Steel Tools
> **Slide Title:** Generic Carbon Calculators Blindside Stainless Steelmakers  
> **Visual Reference:** Cross-out of generic BF-BOF vs. UrjaKavach elemental breakdown.

**Spoken Script:**
"Judges, if you run JSL’s stainless steel operations through generic carbon calculators like SteelOnTheNet or ICE, every single calculation is wrong. Generic tools assume a traditional blast furnace. But if you blow oxygen into a blast furnace with stainless scrap, you burn all your chromium into useless slag before you ever touch the carbon. 

Stainless steel requires electric arc furnace melting and argon oxygen decarburization. More importantly, while ferroalloys make up just one-quarter of the furnace weight, they drive over seventy percent of the total carbon footprint. UrjaKavach is built from first-principles metallurgy to eliminate this multi-million dollar blind spot."

---

### [00:30 - 01:00] Slide 2: The Double-Counting Trap
> **Slide Title:** The Double-Counting Trap in Upstream Ferroalloys  
> **Visual Reference:** HC FeCr rock breakdown (60% Cr, 40% Fe) offsetting virgin DRI ledger.

**Spoken Script:**
"Here is a technical trap that trips up almost every generic data model: ferroalloys are not pure chemicals. When you buy high-carbon ferrochrome, forty percent of that rock is metallic iron. Nickel pig iron carries up to eighty percent iron. 

If your software adds ferroalloys and virgin DRI separately without subtracting that metallic iron, you are double-counting virgin iron by up to one hundred and forty kilograms on every ton of steel. That ruins both procurement budgets and carbon audits. UrjaKavach enforces strict mass balance closure to within half a kilogram per ton, verified across all forty-three authentic JSL grades."

---

### [01:00 - 01:30] Slide 3: Simplex LP Optimization in 8 Milliseconds
> **Slide Title:** Real-Time Charge Optimization via SciPy HiGHS Simplex LP  
> **Visual Reference:** 50-point live Pareto frontier (Cost vs Carbon trade-off).

**Spoken Script:**
"During an active heat, a furnace operator cannot spend twenty minutes adjusting spreadsheet sliders. They have to balance scrap prices against strict limits on tramp elements like copper and tin, which cause hot-shortness cracking if exceeded. 

UrjaKavach formulates this as a continuous Simplex Linear Program that solves in eight milliseconds. It sweeps a fifty-point Pareto curve showing the true frontier between lowest cost and lowest carbon. Instead of guessing, management can choose the exact optimal charge recipe that satisfies chemistry and saves up to thirty-four percent carbon."

---

### [01:30 - 02:00] Slide 4: Real Plant Calibration (Jajpur & Hisar)
> **Slide Title:** Plant-Specific Calibration at Jajpur Works and Hisar  
> **Visual Reference:** Side-by-side facility cards (Jajpur hot molten FeCr vs Hisar green hydrogen).

**Spoken Script:**
"A ton of stainless steel made in Jajpur does not have the same footprint as a ton made in Hisar. In Jajpur, JSL has a dedicated ferrochrome plant right next door, allowing operators to pour liquid molten ferrochrome straight into the electric arc furnace at fifteen hundred degrees. 

That sensible heat saves eighty-six kilowatt-hours of electrical power per ton, cutting sixty-two kilograms of carbon on grade 304. UrjaKavach models these facility-specific physics natively, including campaign refractory wear and auxiliary plant loads."

---

### [02:00 - 02:30] Slide 5: Dual Regulatory Radar (CBAM & CCTS)
> **Slide Title:** Dual Regulatory Radar: EU CBAM SEFA & India BEE CCTS  
> **Visual Reference:** Dual financial dials: EU CBAM liability (€158/t) vs India CCTS surplus (+₹37 Cr/yr).

**Spoken Script:**
"A decarbonization tool must speak to the Chief Financial Officer. Under the European Union’s Carbon Border Adjustment Mechanism, JSL faces an unhedged tariff exposure of up to ninety-five million euros per year on grade 304 exports by 2026. 

At the same time, under India’s new Bureau of Energy Efficiency targets, JSL’s modern operations beat the benchmark, generating thirty-seven crore rupees annually in tradable domestic carbon credits. UrjaKavach tracks both ledgers side by side, turning regulatory risk into a clear commercial advantage."

---

### [02:30 - 03:00] Slide 6: Shopfloor Ready (Monte Carlo & Voice)
> **Slide Title:** Risk-Aware Deployment: 1,000-Run Monte Carlo & Voice Copilot  
> **Visual Reference:** Bell curve risk envelope and SCADA dark-mode cockpit with voice waveform.

**Spoken Script:**
"Finally, real scrap shipments have uncertain chemistry. One contaminated batch of scrap can ruin sixty tons of steel. UrjaKavach runs a thousand Monte Carlo simulations in one point one seconds, giving operators a ninety-eight percent statistical confidence guarantee before the crane drops the charge. 

Coupled with an industrial SCADA dashboard and a hands-free voice engine for operators wearing protective gear, UrjaKavach is validated by three hundred and seventy-six automated tests and is ready for production. Thank you, and we welcome your questions."
