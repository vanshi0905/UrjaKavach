# ASTM Stainless Steel Grade Specifications & Metallurgical Limit Matrix

## 1. Overview & Purpose
This document establishes the official chemical boundary specifications, physical constants, and tramp element tolerance limits used by **UrjaKavach** for real-time charge mix optimization, thermodynamic mass balance closure, and continuous casting quality gating across primary melt shops.

All specifications conform to **ASTM A240 / A240M** (Standard Specification for Chromium and Chromium-Nickel Stainless Steel Plate, Sheet, and Strip for Pressure Vessels and for General Applications) and calibrated plant practice at Jindal Stainless Limited (JSL Jajpur & Hisar facilities).

---

## 2. Master Grade Chemistry Bounds (Weight %)

| Grade Designation | Unified Numbering (UNS) | Cr (wt%) | Ni (wt%) | C max (%) | Mn max (%) | Si max (%) | P max (%) | S max (%) | Mo (wt%) | Cu max (%) | N max (%) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **J304 (Custom JSL)** | S30400-JSL | 17.50–19.00 | 8.00–9.50 | 0.055 | 1.80 | 0.75 | 0.040 | 0.015 | — | **0.40** | 0.080 |
| **AISI 304** | S30400 | 18.00–20.00 | 8.00–10.50 | 0.070 | 2.00 | 0.75 | 0.045 | 0.030 | — | 0.75 | 0.100 |
| **AISI 304L** | S30403 | 18.00–20.00 | 8.00–12.00 | 0.030 | 2.00 | 0.75 | 0.045 | 0.030 | — | 0.75 | 0.100 |
| **AISI 316** | S31600 | 16.00–18.00 | 10.00–14.00 | 0.070 | 2.00 | 0.75 | 0.045 | 0.030 | 2.00–3.00 | 0.75 | 0.100 |
| **AISI 316L** | S31603 | 16.00–18.00 | 10.00–14.00 | 0.030 | 2.00 | 0.75 | 0.045 | 0.030 | 2.00–3.00 | 0.75 | 0.100 |
| **AISI 430 (Ferritic)**| S43000 | 16.00–18.00 | ≤0.50 | 0.080 | 1.00 | 0.75 | 0.040 | 0.030 | — | 0.50 | — |
| **JSL 201 (Austenitic)**| S20100 | 16.00–18.00 | 3.50–5.50 | 0.120 | 5.50–7.50 | 0.75 | 0.045 | 0.015 | — | 1.50–2.00 | 0.200 |

---

## 3. Tramp Element Quality Defense & Hot-Shortness Prevention

Residual tramp elements (principally Copper $[\text{Cu}]$ and Tin $[\text{Sn}]$) exhibit virtually zero oxidation during AOD refining, partitioning almost entirely into the liquid steel bath. During slab reheating in the hot rolling mill ($1150^\circ\text{C}$ to $1250^\circ\text{C}$):

1. **Selective Grain Boundary Oxidation**: Selective oxidation of iron preferentially enriches copper and tin at the scale-metal interface.
2. **Liquid Phase Formation**: When local interfacial concentration exceeds solubility, a molten Cu-Sn liquid phase forms (melting point $\approx 1083^\circ\text{C}$), penetrating austenite grain boundaries.
3. **Hot-Shortness Defect**: Under rolling shear stress, grain boundary decohesion occurs, causing severe surface transverse tearing and slab edge cracking.

### UrjaKavach Hard Gating Constraints:
* **Primary Austenite Cu Cap**: $[\text{Cu}] \le 0.40\text{ wt}\%$ (tighter than ASTM $0.75\%$ to assure rolling yields $>98.0\%$).
* **Tin Residual Cap**: $[\text{Sn}] \le 0.025\text{ wt}\%$.
* **Combined Tramp Equivalent Equation**:
  $$\text{Tramp Equivalent (TE)} = [\text{Cu}] + 8 \times [\text{Sn}] \le 0.55\text{ wt}\%$$
Any scrap charge combination with $\text{TE} > 0.55\%$ is automatically rejected by the HiGHS Simplex LP solver prior to crane drop schedule generation.

---

## 4. Casting Yield Factors & Energy Constants

* **Continuous Casting Solidification Yield**: $97.0\%$ ($0.9700$)
* **Slab Cut & Crop Yield**: $98.0\%$ ($0.9800$)
* **Overall Slab Cast Factor**:
  $$\text{Cast Factor} = \frac{1}{0.9700 \times 0.9800} = 1.0520\text{ tonnes liquid steel / tonne finished slab}$$
* **Sensible Heat of Molten Ferrochrome ($1600^\circ\text{C}$ SAF tap)**:
  $$\Delta H_{\text{sensible}} = 1.28\text{ MJ/kg} \equiv 355\text{ kWh/tonne liquid FeCr}$$
* **EAF Electrical Energy Displacement**: Charging $92.34\text{ kg/t slab}$ liquid FeCr from Jajpur Submerged Arc Furnaces credits **$86\text{ kWh/t liquid}$** in arc power and saves **$6,000\text{ tCO}_2\text{e/year}$**.

---

## 5. Slag Basicity & Liquidus Kinetic Standards

To guarantee chromium recovery $>92\%$ during AOD reduction and prevent refractory lining erosion:
* **Binary Basicity ($B_2$)**:
  $$B_2 = \frac{\% \text{CaO}}{\% \text{SiO}_2} \in [1.50, 1.80]$$
* **Quaternary Basicity ($B_4$)**:
  $$B_4 = \frac{\% \text{CaO} + \% \text{MgO}}{\% \text{SiO}_2 + \% \text{Al}_2\text{O}_3} \in [1.60, 2.10]$$
* **Refractory Wear Constraint**: Slag liquidus temperature must be maintained at least $30^\circ\text{C}$ below bulk bath tapping temperature ($1680^\circ\text{C}$) to form a protective freeze-coating on dolomite/magnesite-carbon furnace hearth brickwork.
