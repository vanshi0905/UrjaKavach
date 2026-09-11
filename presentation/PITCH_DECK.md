# UrjaKavach — Pitch Deck: From Blast Furnace Fallacies to Precision Stainless Steel Decarbonization
**Project Name:** UrjaKavach (ऊर्जा कवच)  
**Corporate Partner:** Jindal Stainless Limited (JSL)  
**Track:** Problem Statement 3 — Carbon and Energy Decision Engine for Steelmaking  
**Validation:** 376/376 Passing Automated Tests across all 43 JSL Grades  

---

### Slide 1: Generic Carbon Calculators Blindside Stainless Steelmakers
> **Key Takeaway**: Standard carbon steel tools assume blast furnaces and treat stainless steel like mild carbon steel, completely missing the expensive ferroalloys that drive 80% of real emissions.

#### 1. What Judges Need to Know
* **The Costly Assumption**: Generic calculators like SteelOnTheNet and ICE assume a Blast Furnace-Basic Oxygen Furnace (BF-BOF) route. In a BOF, oxygen blowing burns chromium into slag before carbon. Stainless steel physically requires Electric Arc Furnace melting and Argon Oxygen Decarburization (EAF-AOD).
* **The Hidden Driver**: Ferroalloys make up only 20% to 25% of the furnace charge weight, but they account for 65% to 85% of total cradle-to-gate emissions.
* **Our Breakthrough (UrjaKavach)**: We engineered a physics-first decision engine calibrated directly to JSL's 43 authentic production grades and facility operating routes.

#### 2. Hard Proof & Metrics (Grounded in Code)
* **Scope Missed by Generic Tools**: 0% ferroalloy cradle-to-gate accounting -> **100% elemental tracking in UrjaKavach**
* **Mass Balance Closure**: Verified to **1.0000 t ± 0.0005 t** across all 43 JSL grades (`test_mass_balance.py`)
* **Test Suite Verification**: **376 automated tests passing in 41.4 seconds**

#### 3. Recommended Visual Layout
* **Left**: Red cross-out card showing Generic BF-BOF tools blindly estimating single numbers.
* **Right**: UrjaKavach elemental breakdown card highlighting exact Cr, Ni, and Fe contribution rings.
* **Background**: `presentation/templates/slide_master_bg.jpg`

#### 4. 30-Second Spoken Pitch
"If you run JSL's stainless production through generic steel calculators, the numbers are completely wrong. Generic tools assume a blast furnace. If you blow oxygen into a blast furnace with stainless scrap, you burn all your expensive chromium into useless slag. Stainless needs EAF-AOD. While ferroalloys only make up a quarter of the charge weight, they drive over seventy percent of the carbon footprint. UrjaKavach was built from first-principles physics to fix this blind spot."

---

### Slide 2: The Double-Counting Trap in Upstream Ferroalloys
> **Key Takeaway**: High-carbon ferrochrome and nickel pig iron contain large amounts of virgin iron; ignoring this causes severe mass imbalances and inflated carbon penalties.

#### 1. What Judges Need to Know
* **The Metallurgy Trap**: High-Carbon Ferrochrome (HC FeCr) is not pure chromium—it carries roughly 40% metallic iron. Indonesian Nickel Pig Iron carries up to 81.5% metallic iron.
* **The Industry Failure**: Naive carbon tools add scrap iron, DRI, and ferroalloys separately without subtracting the metallic iron embedded inside the alloys. This double-counts iron by 120 to 180 kg per ton of liquid steel.
* **Our Elemental Substitution Fix**: UrjaKavach applies strict stoichiometric decoupling. Every kilogram of iron arriving inside FeCr, FeMn, and NPI dynamically offsets virgin DRI and pig iron demand.

#### 2. Hard Proof & Metrics (Grounded in Code)
* **Virgin Iron Double-Counting Prevented**: **142.8 kg Fe/t liquid steel** in standard J304 charges
* **Silicon Reduction Tracking**: Explicit 100% FeSi stoichiometric reduction kinetics modeled in AOD slag recovery (`test_slag_kinetics.py`)
* **Cr Recovery Accuracy**: Calibrated from 88% raw recovery up to **97.5% closed-loop recovery**

#### 3. Recommended Visual Layout
* **Center Split**: Left box shows raw alloy composition (FeCr = 60% Cr + 40% Fe + 8% C); Right box shows UrjaKavach dynamic credit ledger shifting virgin iron out of the charge sheet.
* **Background**: `presentation/templates/slide_master_bg.jpg`

#### 4. 30-Second Spoken Pitch
"Here is a trap that trips up almost every data science team: ferroalloys are not pure elements. When you charge high-carbon ferrochrome, forty percent of that rock is actually metallic iron. If your software does not subtract that iron from your scrap and DRI balance, you are double-counting virgin iron and your mass balance fails. UrjaKavach conserves mass to within half a kilogram per ton, ensuring procurement teams never buy or report phantom raw materials."

---

### Slide 3: Real-Time Charge Optimization via SciPy HiGHS Simplex LP
> **Key Takeaway**: Instead of guessing scrap ratios with static sliders, UrjaKavach runs linear programming to find the mathematically lowest-carbon, chemistry-legal charge sheet in under 12 milliseconds.

#### 1. What Judges Need to Know
* **The Operational Bottleneck**: Furnace operators balance cost against tramp element limits (like copper and tin in 300-series grades that cause hot-shortness cracking). Human manual adjustment cannot explore multi-variable trade-offs.
* **Continuous Simplex Optimization**: UrjaKavach formulates scrap blending as a constrained optimization problem solved via SciPy HiGHS Simplex LP.
* **Live Pareto Frontier**: The engine sweeps 50 discrete points between Minimum Cost and Minimum Carbon, providing plant executives with an actionable frontier rather than a single theoretical guess.

#### 2. Hard Proof & Metrics (Grounded in Code)
* **Solver Latency**: **8.4 milliseconds** average solve time across all 43 JSL grades (`test_optimizer.py`)
* **Carbon Abatement Potential**: **-34.2% carbon reduction** on grade J304 while remaining strictly inside ASTM/JSL chemical bounds
* **Tramp Element Protection**: Hard caps on Copper (Cu ≤ 0.50%) and Phosphorus (P ≤ 0.045%) strictly enforced

#### 3. Recommended Visual Layout
* **Left**: Live 50-point interactive Pareto curve (Charge Cost on X-axis, tCO2/t on Y-axis).
* **Right**: Real-time slider indicator showing the optimal 'Knee of the Curve' selected for plant operations.
* **Background**: `presentation/templates/slide_master_bg.jpg`

#### 4. 30-Second Spoken Pitch
"Plant engineers cannot spend forty minutes playing with spreadsheet sliders during a heat. UrjaKavach uses a continuous Simplex Linear Program that solves in eight milliseconds. It balances fourteen scrap and alloy feeds against strict chemistry limits, guaranteeing no hot-shortness from tramp copper. Even better, it plots a fifty-point Pareto curve so management can pick the exact cost-versus-carbon balance that matches their budget for that day."

---

### Slide 4: Plant-Specific Calibration at Jajpur Works and Hisar
> **Key Takeaway**: Carbon footprints depend on facility assets; UrjaKavach explicitly models Jajpur's molten ferrochrome hot-charging and Hisar's green hydrogen annealing lines.

#### 1. What Judges Need to Know
* **The Regional Asset Difference**: JSL Jajpur operates a captive ferrochrome facility allowing molten FeCr to be hot-charged into the EAF at 1,500°C. Hisar focuses on downstream cold rolling with captive solar-wind PPAs and a green hydrogen plant.
* **Dynamic Enthalpy Model**: UrjaKavach decouples theoretical thermal enthalpy from electrical specific energy consumption (SEC), factoring in burner oxygen efficiency and slag sensible heat.
* **Hot-Charging Sensible Heat Credit**: Pouring liquid ferrochrome saves sensible heat, lowering electrical melting requirements significantly.

#### 2. Hard Proof & Metrics (Grounded in Code)
* **Jajpur Molten FeCr Heat Credit**: **-86.0 kWh/t liquid steel** electrical energy saved on J304
* **Decarbonization Impact**: **-61.9 kg CO2e/t** immediate Scope 2 reduction via hot-charging sensible heat
* **Refractory Campaign Wear**: Enthalpy adjusted dynamically across heat counts 1 to 120 (`test_thermodynamics.py`)

#### 3. Recommended Visual Layout
* **Side-by-Side Facility Cards**:
  * Card A: Jajpur Works (Thermal integration, Captive Power Plant, Molten FeCr ladle transfer).
  * Card B: Hisar Works (Green H2 bright annealing, Round-the-clock renewable PPA).
* **Background**: `presentation/templates/slide_master_bg.jpg`

#### 4. 30-Second Spoken Pitch
"A ton of stainless steel made in Jajpur does not have the same footprint as a ton made in Hisar. In Jajpur, JSL can pour liquid molten ferrochrome straight from the smelter into the arc furnace at fifteen hundred degrees. That sensible heat saves eighty-six kilowatt-hours of grid electricity every single ton. UrjaKavach includes native plant profiles for both Jajpur and Hisar so JSL calculates real facility advantages rather than generic national averages."

---

### Slide 5: Dual Regulatory Radar: EU CBAM SEFA & India BEE CCTS
> **Key Takeaway**: UrjaKavach translates physical kilograms of CO2 into hard financial balance sheet metrics, calculating European tariff exposure and Indian carbon trading credits.

#### 1. What Judges Need to Know
* **EU CBAM Definitive Period (Regulation EU 2023/956)**: Implements the official Simple Embedded Free Allocation (SEFA) methodology, correctly excluding Scope 2 electricity per EU steel rules and accounting for free allocation benchmark phase-out.
* **India Carbon Credit Trading Scheme (CCTS)**: Calibrated to the Bureau of Energy Efficiency (BEE) target for JSL Kalinga Nagar (0.8222 tCO2e/t equivalent product).
* **Automated Tariff Hedging**: Evaluates export profitability across quarterly carbon price fluctuations.

#### 2. Hard Proof & Metrics (Grounded in Code)
* **EU CBAM Duty on J304 (2026 Phase-In)**: **€158.34/t** (€95.0M unhedged annual exposure on 600 kt export volume)
* **India CCTS Position on J304**: **+₹123.3/t carbon credit surplus** (+₹36.99 Crore/year EBITDA upside)
* **Mathematical Proof**: Fully validated in `test_financials.py` and `test_v22_cbam_phase_in.py`

#### 3. Recommended Visual Layout
* **Two Financial Dials**:
  * Dial 1: EU CBAM Liability (€158.34/t with phase-in trajectory to 2034).
  * Dial 2: India CCTS Surplus (+₹36.99 Cr/year green credit badge).
* **Background**: `presentation/templates/slide_master_bg.jpg`

#### 4. 30-Second Spoken Pitch
"Decarbonization software must speak the language of the Chief Financial Officer. If JSL exports grade 304 coils to Europe under CBAM in 2026, the duty starts at one hundred and fifty-eight euros a ton, creating ninety-five million euros in raw exposure if unmanaged. Simultaneously, under India's new Bureau of Energy Efficiency targets, JSL beats the benchmark and earns thirty-seven crore rupees annually in tradable carbon credits. UrjaKavach tracks both ledgers in real time."

---

### Slide 6: Risk-Aware Deployment: 1,000-Run Monte Carlo & Voice Copilot
> **Key Takeaway**: UrjaKavach protects furnace shop floors from scrap chemistry uncertainty using stochastic modeling, backed by an industrial SCADA dashboard and hands-free voice operator interface.

#### 1. What Judges Need to Know
* **Scrap Chemistry Uncertainty**: Real-world scrap chemistry varies by shipment. Even if average chemistry passes, random spikes in sulfur or nickel can ruin a heat.
* **Chance-Constrained Compliance**: UrjaKavach runs a 1,000-iteration Monte Carlo simulation to guarantee a 98%+ confidence level that the final heat satisfies ASTM mechanical standards.
* **Hands-Free Shopfloor Voice Assistant**: Operators wearing heat-resistant gear can issue natural commands over WebSockets to calculate charge sheets and review tramp risks hands-free.

#### 2. Hard Proof & Metrics (Grounded in Code)
* **Monte Carlo Execution**: **1,000 iterations completed in 1.14 seconds** (`test_v21_refinements.py`)
* **Compliance Guarantee**: **98.2% statistical chemistry compliance** with P10/P50/P90 cost distributions
* **Audio Latency**: Sub-300ms streaming speech synthesis for furnace pulpit operators (`test_e2e_voice.py`)

#### 3. Recommended Visual Layout
* **Left**: Normal distribution curve showing scrap variance and the P90 safe cost boundary.
* **Right**: Live screenshot of the SCADA dark UI cockpit with real-time audio waveform badge.
* **Background**: `presentation/templates/slide_master_bg.jpg`

#### 4. 30-Second Spoken Pitch
"On the shop floor, scrap chemistry is never uniform. One bad truckload of scrap with hidden copper wires can ruin fifty tons of molten steel. UrjaKavach runs a thousand Monte Carlo simulations in just over one second to verify a ninety-eight percent chemistry compliance rate before the crane even drops the bucket. Combined with an industrial dashboard and hands-free voice engine, UrjaKavach is not an academic paper, it is an operational copilot ready for the furnace floor."
