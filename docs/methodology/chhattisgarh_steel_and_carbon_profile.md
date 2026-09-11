# Chhattisgarh Steel, Sponge Iron & Carbon Profile
## Team NIT Raipur — JSL Engineering Case Study Competition 2026
**Facility Profile:** `chhattisgarh` (Aliases: `raigarh`, `raipur`)  
**Integration:** [`jsl_carbon_engine/config/jsl_facilities.py`](file:///C:/Users/Asus/Desktop/JSL/jsl_carbon_engine/config/jsl_facilities.py)  
**Location:** Raigarh & Raipur Industrial Belt, Chhattisgarh, India  

---

## 1. Why Chhattisgarh Matters: The Industrial & Jindal Legacy

For Team **NIT Raipur**, incorporating **Chhattisgarh** into your calculation engine is both a **defining competitive advantage** and a tribute to the industrial roots of the Jindal family:

1. **The Cradle of Jindal Steel**:
   - Sri O.P. Jindal established the landmark steel, power, and machinery manufacturing complex in **Raigarh, Chhattisgarh** (home to Jindal Steel & Power Ltd, Nalwa Steel & Power, and the world's largest coal-gasification DRI plant).
2. **India's Sponge Iron (DRI) Capital**:
   - The Raipur-Raigarh-Bilaspur industrial corridor (notably the Siltara, Urla, and Taraimal industrial clusters) produces over **30% of India's sponge iron (Direct Reduced Iron - DRI)**.
   - Any stainless steelmaker sourcing domestic iron units inevitably relies on the sponge iron kilns of Chhattisgarh.
3. **NIT Raipur Hometown Advantage**:
   - Demonstrating deep empirical understanding of Chhattisgarh’s local raw materials, high-ash thermal coal, power tariffs, and state solar open-access rules shows authentic, boots-on-the-ground engineering knowledge that no outside university team can match.

---

## 2. Technical Operational Parameters: Chhattisgarh Profile

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             CHHATTISGARH FACILITY PROFILE                                        │
├───────────────────────────┬───────────────────────────────┬──────────────────────────────────────┤
│ PARAMETER                 │ VALUE                         │ INDUSTRIAL & EMPIRICAL CONTEXT       │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Facility ID               │ `chhattisgarh`                │ Also aliased to `raigarh`, `raipur`. │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Industrial Hub            │ Raipur & Raigarh Belt         │ Major sponge iron, EAF, & mills.     │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Rated Steel Capacity      │ 3.6 MTPA                      │ Integrated sponge iron & melt shops. │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Regional Grid Factor      │ 0.730 tCO2 / MWh              │ CSPDCL / Western Regional Grid (WR). │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Grid Electricity Tariff   │ ₹6.50 / kWh                   │ Industrial High-Tension (HT) tariff. │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Renewable PPA Potential   │ 250.0 MW                      │ CREDA Solar Open Access projects.    │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ PPA Landed Cost           │ ₹3.40 / kWh                   │ Significant OPEX savings vs CSPDCL.  │
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Primary Iron Units        │ Coal-based Rotary Kiln DRI    │ Sourced from SECL Korba/Raigarh coal.│
├───────────────────────────┼───────────────────────────────┼──────────────────────────────────────┤
│ Coal DRI Carbon Intensity │ 2.65 – 2.80 tCO2 / t DRI      │ High ash (38–44%) thermal coal.      │
└───────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. The Chhattisgarh Metallurgical Reality

### A. The High-Ash Coal & DRI Enthalpy Penalty
Chhattisgarh sponge iron kilns operate using non-coking thermal coal from **South Eastern Coalfields Limited (SECL)** (Korba, Raigarh, and Mand-Raigarh coalfields). 
- **The Ash Reality**: Domestic thermal coal in this belt typically has an ash content of **38% to 44%** with high gangue content ($\text{SiO}_2 + \text{Al}_2\text{O}_3$).
- **The Melting Penalty**: When Chhattisgarh coal DRI is charged into an Electric Arc Furnace, melting that acidic gangue requires basic flux additions ($\text{CaO}$ lime) to maintain a basicity ratio $B_2 = \frac{\text{CaO}}{\text{SiO}_2} \approx 1.8\text{–}2.2$.
- **Thermodynamic Impact**: In `jsl_carbon_engine/core/thermodynamics.py`, our dynamic SEC engine calculates that a 100% Chhattisgarh coal DRI charge pushes EAF electricity consumption up to **$525\text{–}680\text{ kWh/t liquid steel}$**, compared to only **$410\text{ kWh/t}$** for recycled scrap!

### B. The Power Decarbonization Lever: CSPDCL Grid vs. CREDA Solar PPAs
- **State Grid Baseline**: Sourcing power from CSPDCL (predominantly pithead thermal power from NTPC Sipat, Korba, and CSPGCL) carries an intensity of $\sim 0.73\text{ tCO}_2/\text{MWh}$ at ₹6.50/kWh.
- **Solar Open Access**: Under the Chhattisgarh State Solar Energy Policy administered by **CREDA (Chhattisgarh State Renewable Energy Development Agency)**, industrial consumers can wheel solar power under long-term open access at **₹3.40/kWh**.
- **Dual Win**: Transitioning a 100 MW industrial load in Chhattisgarh from the state grid to solar open access abates **$120,000+\text{ tCO}_2/\text{year}$** while saving **₹27+ Crore annually in power OPEX**!

---

## 4. How to Run Chhattisgarh Calculations in the Engine

### A. Command Line Interface (CLI):
```bash
# 1. Run baseline calculation for J304 in Chhattisgarh:
python main.py --facility chhattisgarh --grade J304

# 2. Run continuous LP optimization for JSL's 200-series flagship J4 in Chhattisgarh:
python main.py --facility chhattisgarh --grade J4 --optimize

# 3. Generate the Pareto Frontier (Cost vs Carbon trade-off) in Chhattisgarh:
python main.py --facility chhattisgarh --grade J304 --pareto
```

### B. Sample Output for J304 in Chhattisgarh:
```
[FACILITY]   Plant: Jindal Chhattisgarh Industrial & Sponge Iron Hub (Raigarh & Raipur Industrial Belt, Chhattisgarh, India)
             Molten FeCr Hot Charging: Not Available
             Grid Baseline: 0.73 tCO2/MWh | Renewable Share: 47.0%

1. CLOSED-LOOP MASS CONSERVATION (Liquid Steel Mass: 1.0000 t)
   * Recycled Scrap Charged:        0.6000 t (60.0%)
   * Ferrochrome (HC FeCr):         0.1462 t (Credits 0.0567 t metallic Fe!)
   * Primary Nickel Addition:       0.0378 t
   * Net Virgin Iron Required:      0.2206 t
   * Gross DRI Charged:             0.2584 t

2. DYNAMIC THERMODYNAMIC SEC & ENTHALPY BALANCE
   * Dynamic EAF Melting SEC:       525.4 kWh/t liquid steel
   * Secondary Refining (AOD):      150.0 kWh/t
   * Total Electrical Energy:       1220.4 kWh/t finished

3. GHG PROTOCOL EMISSIONS BREAKDOWN
   * Scope 1:                       0.1347 tCO2/t (4.9%)
   * Scope 2 (CSPDCL + Solar PPA):  0.4894 tCO2/t (17.8%)
   * Scope 3 (Precursors):          2.1273 tCO2/t (77.3%)
   * TOTAL SPECIFIC EMISSIONS:       2.7514 tCO2 / tonne finished

4. DUAL REGULATORY & FINANCIAL LIABILITY ENGINE
   * EU CBAM Import Duty:           EUR 197.07 / tonne exported
   * India CCTS Carbon Position:    SURPLUS_CREDIT -> +1253.8 INR/tonne (+376.15 INR Crore/year)
```

### C. In the Web SCADA Dashboard:
Launch `python main.py --serve --port 8000` and select:
**"Chhattisgarh Hub (Raigarh & Raipur Sponge Iron Belt)"** directly from the *Manufacturing Facility* dropdown.

---

## 5. Winning Talking Points for NIT Raipur Presentation

During the jury Q&A, you can use these tailored points to score maximum points under *Problem Understanding* and *Business Relevance*:

1. *"As students of NIT Raipur, we recognize that stainless steel decarbonization is inextricably linked to Chhattisgarh's sponge iron economy. Over 30% of India's DRI kilns operate in our backyard."*
2. *"Because SECL coal carries 38–44% ash, Chhattisgarh coal DRI incurs an enthalpy melting penalty of ~115 kWh/t in the EAF. Our calculator models this dynamic thermodynamic coupling directly."*
3. *"By modeling Chhattisgarh's CSPDCL tariff (₹6.50/kWh) against CREDA's solar open-access PPA (₹3.40/kWh), our tool demonstrates how regional steelmakers can slash both Scope 2 carbon and electricity OPEX simultaneously."*
