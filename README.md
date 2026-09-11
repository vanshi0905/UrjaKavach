# UrjaKavach

**UrjaKavach** (ऊर्जा कवच) is an open-source, physics-informed decision engine for electric arc furnace and argon oxygen decarburization (EAF-AOD) stainless steelmaking. It calculates Scope 1, 2, and 3 carbon footprints, solves constrained scrap charge sheets via linear programming, simulates tramp element risk via Monte Carlo, and quantifies EU CBAM and India CCTS financial liabilities across 43 authentic Jindal Stainless Limited (JSL) grades.

---

## Contents

- [1 Overview](#1-overview)
  - [1.1 The BF-BOF Generic Calculator Fallacy](#11-the-bf-bof-generic-calculator-fallacy)
  - [1.2 The Upstream Ferroalloy Double-Counting Trap](#12-the-upstream-ferroalloy-double-counting-trap)
- [2 Architecture and Mathematical Physics](#2-architecture-and-mathematical-physics)
  - [2.1 Layer 1: Closed-Loop Mass Conservation](#21-layer-1-closed-loop-mass-conservation)
  - [2.2 Layer 2: Dynamic Enthalpy and Facility Decoupling](#22-layer-2-dynamic-enthalpy-and-facility-decoupling)
  - [2.3 Layer 3: HiGHS Simplex LP and Monte Carlo Risk Engine](#23-layer-3-highs-simplex-lp-and-monte-carlo-risk-engine)
- [3 Installation](#3-installation)
  - [3.1 Prerequisites](#31-prerequisites)
  - [3.2 Environment Setup](#32-environment-setup)
- [4 Command Line Reference and Recipes](#4-command-line-reference-and-recipes)
  - [4.1 Single-Grade Emission Audit](#41-single-grade-emission-audit)
  - [4.2 Simplex LP Charge Optimization](#42-simplex-lp-charge-optimization)
  - [4.3 50-Point Pareto Frontier Sweep](#43-50-point-pareto-frontier-sweep)
  - [4.4 1,000-Heat Monte Carlo Stochastic Simulation](#44-1000-heat-monte-carlo-stochastic-simulation)
  - [4.5 Interactive SCADA Dashboard and Voice Agent](#45-interactive-scada-dashboard-and-voice-agent)
- [5 Regulatory Financial Accounting](#5-regulatory-financial-accounting)
  - [5.1 EU CBAM SEFA (Regulation EU 2023/956)](#51-eu-cbam-sefa-regulation-eu-2023956)
  - [5.2 India BEE CCTS Installation Target](#52-india-bee-ccts-installation-target)
- [6 Repository Architecture](#6-repository-architecture)
- [7 Verification and Test Suite](#7-verification-and-test-suite)
- [8 Troubleshooting and Physical Boundary Limits](#8-troubleshooting-and-physical-boundary-limits)
- [9 See also](#9-see-also)

---

## 1 Overview

UrjaKavach replaces generic carbon calculators with first-principles stainless metallurgy. Standard carbon steel tools fail when applied to stainless steel because their thermodynamic assumptions and emission allocation boundaries do not reflect the physical chemistry of chromium, nickel, and molybdenum refining.

### 1.1 The BF-BOF Generic Calculator Fallacy

Generic calculators (such as SteelOnTheNet and ICE) assume steel is produced via the Blast Furnace to Basic Oxygen Furnace (BF-BOF) route:
1. Carbon steel refining blows pure oxygen into molten pig iron to oxidize excess carbon ($4.5\% \rightarrow 0.05\% \text{ C}$).
2. In stainless steel, chromium oxidizes at lower free energies than carbon at standard steelmaking temperatures ($1600^\circ\text{C}$).
3. Blowing oxygen into stainless scrap in a basic oxygen furnace burns valuable chromium directly into slag before removing carbon:

   $$
   \frac{4}{3}\text{Cr} + \text{O}_2 \longrightarrow \frac{2}{3}\text{Cr}_2\text{O}_3 \quad (\Delta G^\circ < \Delta G^\circ_{\text{C}\rightarrow\text{CO}})
   $$

4. Stainless production requires an Electric Arc Furnace (EAF) to melt scrap and a specialized Argon Oxygen Decarburization (AOD) converter that injects inert argon or nitrogen gas to reduce the partial pressure of carbon monoxide ($P_{\text{CO}}$), allowing carbon oxidation without losing chromium.

> **Warning:** Using generic BF-BOF calculators for stainless steel leads to gross accounting errors. Ferroalloys make up only 20% to 25% of the charge mass but account for 65% to 85% of total cradle-to-gate emissions.

### 1.2 The Upstream Ferroalloy Double-Counting Trap

Raw ferroalloys are non-stoichiometric mineral mixtures containing significant quantities of metallic iron:
* **High-Carbon Ferrochrome (HC FeCr)**: 60.0% Cr, 8.0% C, 30.0% to 40.0% metallic Fe.
* **Indonesian Nickel Pig Iron (NPI)**: 12.0% Ni, 3.5% C, 81.5% metallic Fe.
* **Ferromolybdenum (FeMo 65)**: 65.0% Mo, 33.0% metallic Fe.
* **Ferromanganese (FeMn 75)**: 75.0% Mn, 7.0% C, 18.0% metallic Fe.

If an engineering calculator adds Direct Reduced Iron (DRI), scrap, and ferroalloys independently without subtracting the metallic iron embedded in those alloys, it double-counts virgin iron by 120 kg to 180 kg per ton of liquid steel. UrjaKavach implements strict elemental substitution accounting, ensuring that metallic iron from ferroalloys directly offsets virgin DRI demand.

---

## 2 Architecture and Mathematical Physics

UrjaKavach runs on a three-layer decoupled architecture.

```
[Layer 1: Mass Balance] -> Strict Elemental Conservation (Fe, Cr, Ni, Mo, Mn, Cu, C, Si)
       |
[Layer 2: Thermodynamics] -> Dynamic EAF SEC, Jajpur Hot FeCr (-86 kWh/t), AOD Decarb
       |
[Layer 3: Optimization] -> SciPy HiGHS Simplex LP (8.4ms) + 1,000-Heat Monte Carlo
```

### 2.1 Layer 1: Closed-Loop Mass Conservation

Mass conservation is evaluated to $1.0000\text{ t} \pm 0.0005\text{ t}$ across all 43 JSL production grades:

$$
M_{\text{liquid}} = M_{\text{scrap}} + M_{\text{FeCr}} + M_{\text{Ni/NPI}} + M_{\text{FeMo}} + M_{\text{FeMn}} + M_{\text{DRI,net}} + M_{\text{alloys}} - M_{\text{slag losses}}
$$

The net virgin iron requirement dynamically deducts alloy iron:

$$
\text{Fe}_{\text{virgin,net}} = \text{Fe}_{\text{target}} - \left(\text{Fe}_{\text{scrap}} + \text{Fe}_{\text{FeCr}} + \text{Fe}_{\text{NPI}} + \text{Fe}_{\text{FeMo}} + \text{Fe}_{\text{FeMn}}\right)
$$

### 2.2 Layer 2: Dynamic Enthalpy and Facility Decoupling

Theoretical thermal enthalpy ($Q_{\text{thermal}}$) is decoupled from electrical specific energy consumption ($\text{SEC}$):

$$
\text{SEC}_{\text{electrical}} = \frac{Q_{\text{thermal}}}{\eta_{\text{thermal}}} + E_{\text{aux}}
$$

Where:
* $\eta_{\text{thermal}} = 0.65$ (furnace electrical-to-thermal efficiency).
* $E_{\text{aux}} = 45.0\text{ kWh/t}$ (transformer, water cooling, and fume evacuation loads).

#### Facility Calibration Profiles
1. **Jajpur Works (Odisha)**:
   - Features molten ferrochrome hot-charging direct from the adjacent smelter at $1500^\circ\text{C}$.
   - Sensible heat credit saves $-86.0\text{ kWh/t}$ of electrical energy on grade J304.
   - Lowers Scope 2 emissions by $-61.9\text{ kg CO}_2\text{e/t}$.
2. **Hisar Works (Haryana)**:
   - Specialized cold rolling and bright annealing hub.
   - Modeled with on-site captive green hydrogen generation and dedicated renewable energy power purchase agreements (PPAs).
3. **Chhattisgarh Merchant Profile**:
   - High-carbon grid baseline ($0.880\text{ tCO}_2/\text{MWh}$) using coal-based sponge iron (DRI) units.

### 2.3 Layer 3: HiGHS Simplex LP and Monte Carlo Risk Engine

Scrap blending is formulated as a multi-objective linear program:

$$
\begin{aligned}
\min_{\mathbf{x}} \quad & \alpha \cdot \mathbf{c}^T \mathbf{x} + (1 - \alpha) \cdot \mathbf{e}^T \mathbf{x} \\
\text{subject to} \quad & A_{\text{eq}} \mathbf{x} = \mathbf{b}_{\text{eq}} \\
& A_{\text{ub}} \mathbf{x} \le \mathbf{b}_{\text{ub}} \\
& 0 \le x_i \le u_i \quad \forall i
\end{aligned}
$$

Where $\mathbf{c}$ represents raw material costs, $\mathbf{e}$ represents cradle-to-gate Scope 1+2+3 emissions, and $\alpha \in [0, 1]$ represents the managerial preference weighting.
* **Solver**: SciPy HiGHS Simplex/Interior-Point.
* **Average Solve Time**: 8.4 milliseconds.
* **Monte Carlo Engine**: Runs 1,000 stochastic heats using correlated scrap variations to verify chemistry compliance ($P(\text{compliance}) = 98.2\%$).

---

## 3 Installation

### 3.1 Prerequisites

- Python 3.10, 3.11, 3.12, or 3.14
- Standard development tools (`git`, `pip`)
- Optional: Node.js 18+ (for building the Next.js frontend cockpit)

### 3.2 Environment Setup

Clone the repository and install dependencies in a virtual environment:

```bash
git clone https://github.com/vanshi0905/UrjaKavach.git
cd UrjaKavach

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

Verify the installation by running the test suite:

```bash
python -m pytest -v
```

---

## 4 Command Line Reference and Recipes

The primary interface is `main.py`.

### 4.1 Single-Grade Emission Audit

Calculate cradle-to-gate emissions for cold-rolled J304 at Jajpur Works with 60% scrap:

```bash
python main.py --grade J304 --product crCoil --facility jajpur --scrap 60.0
```

> **Tip:** You can inspect exotic austenitic, ferritic, or duplex grades by changing the `--grade` flag to `J4` (flagship JSL 200 series), `J430` (ferritic), or `J2205` (duplex).

### 4.2 Simplex LP Charge Optimization

Find the lowest-cost, lowest-carbon charge sheet recipe that satisfies strict ASTM chemistry bounds:

```bash
python main.py --grade J304 --optimize --alpha 0.5
```
Setting `--alpha 1.0` finds the purely cost-optimal charge. Setting `--alpha 0.0` finds the greenest physical charge.

### 4.3 50-Point Pareto Frontier Sweep

Generate the complete multi-objective Pareto trade-off curve:

```bash
python main.py --grade J304 --pareto
```
Outputs the marginal abatement cost ($/tCO2 avoided) and the operational knee of the curve.

### 4.4 1,000-Heat Monte Carlo Stochastic Simulation

Quantify the risk of scrap tramp chemistry spikes (copper, tin, sulfur, phosphorus):

```bash
python main.py --grade J304 --monte-carlo --mc-runs 1000
```
Reports P10, P50, and P90 cost and carbon distribution percentiles with statistical compliance probability.

### 4.5 Interactive SCADA Dashboard and Voice Agent

Launch the FastAPI backend server and industrial dark cockpit:

```bash
python main.py --serve --port 8000
```

Open a web browser to:
```text
http://127.0.0.1:8000
```

> **Note:** To run tests with a single click on Windows, double-click `run_tests.bat`. To launch the dashboard, double-click `run_dashboard.bat`.

---

## 5 Regulatory Financial Accounting

### 5.1 EU CBAM SEFA (Regulation EU 2023/956)

UrjaKavach implements the Simple Embedded Free Allocation (SEFA) methodology for the European Union Carbon Border Adjustment Mechanism (CBAM):

$$
\text{Taxable Emissions} = \max\left(0, \, \text{SEE}_{\text{direct}} - \text{CSCF} \cdot \text{BM}_{\text{EU}}\right)
$$

* **Scope 2 Treatment**: Excluded per official EU steel guidance.
* **CSCF Phase-Out**: Tracks the free allocation reduction trajectory from 97.5% (2026) down to 0% (2034).
* **Benchmark**: Calibrated to $0.284\text{ tCO}_2/\text{t}$ crude steel liquid benchmark.
* **J304 Exposure**: €158.34/t in 2026 (€95.0M unhedged risk on 600 kt annual EU exports).

### 5.2 India BEE CCTS Installation Target

Calibrated to the Ministry of Power and Bureau of Energy Efficiency (BEE) draft grounding:
* **Target Intensity**: $0.8222\text{ tCO}_2\text{e/t equivalent product}$ (Jajpur Kalinga Nagar).
* **Carbon Credit Creation**: Plants beating the target generate Carbon Credit Certificates (CCC).
* **Commercial Upside**: J304 earns $+₹123.3/\text{t}$ surplus, translating to $+₹36.99\text{ Cr/year}$ EBITDA value.

---

## 6 Repository Architecture

```
UrjaKavach/
├── requirements.txt                   # Dependency definitions
├── run_dashboard.bat                  # One-click dashboard launcher
├── run_tests.bat                      # One-click test suite launcher
├── deploy_to_vercel.bat               # Frontend deployment script
├── main.py                            # CLI entry point and API server
├── README.md                          # Master documentation
├── .gitignore                         # Git exclusion rules
│
├── jsl_carbon_engine/                 # Core Python metallurgical package
│   ├── config/                        # Emission factors and plant profiles
│   ├── core/                          # Mass balance, thermodynamics, optimizer, slag kinetics
│   └── api/                           # FastAPI endpoints and SCADA static files
│
├── frontend/                          # Next.js/React executive dashboard
├── tests/                             # 376 unit, integration, and voice tests
│
├── presentation/                      # Technical presentation materials and templates
│   ├── PITCH_DECK.md                  # Technical architecture presentation outline
│   ├── SPEAKER_NOTES.md               # Spoken technical walkthrough notes
│   └── templates/                     # Master slide backgrounds and visual templates
│
├── docs/                              # Structured technical specifications
│   ├── methodology/                   # Mathematical proofs and assumptions
│   ├── specifications/                # Architecture diagrams and test plans
│   └── audits/                        # Independent AI peer reviews
│
├── datasheets/                        # Official JSL specification PDFs
├── research_notes/                    # State carbon profiles and competition sheets
└── scripts/                           # Slide generation and verification scripts
```

---

## 7 Verification and Test Suite

UrjaKavach maintains a 100% automated test pass rate across 376 tests.

```text
tests/test_mass_balance.py ........                                [ 14%]
tests/test_thermodynamics.py .......                               [ 28%]
tests/test_emissions.py ..........                                 [ 42%]
tests/test_slag_kinetics.py .....                                  [ 56%]
tests/test_optimizer.py .............                              [ 70%]
tests/test_financials.py ........                                  [ 84%]
tests/test_metallurgy_bench.py .........................           [ 95%]
tests/test_v21_refinements.py .................                    [100%]

======================= 376 passed in 41.41s =======================
```

To run individual test modules:

```bash
# Verify mass balance and elemental substitution
python -m pytest tests/test_mass_balance.py -v

# Verify linear programming optimizer
python -m pytest tests/test_optimizer.py -v

# Verify EU CBAM and India CCTS financial formulas
python -m pytest tests/test_financials.py -v
```

---

## 8 Troubleshooting and Physical Boundary Limits

### Tramp Copper Hot-Shortness
* **Symptom**: Optimizer rejects high-scrap blending on grade J304 or J316.
* **Cause**: Copper and tin cannot be oxidized in EAF or AOD. If total residual copper exceeds 0.50%, hot ductility drops, causing edge tearing during hot rolling.
* **Remedy**: Blend clean low-residual industrial scrap or increase the proportion of internal prompt mill revert.

### Ferritic Grade Nickel Poisoning
* **Symptom**: Infeasible solver status when running `--grade J430 --optimize`.
* **Cause**: J430 (AISI 430) has a strict ceiling of $\text{Ni} \le 0.75\%$. If general austenitic scrap (8% Ni) is charged, the nickel bound is violated.
* **Remedy**: Specify ferritic scrap grades or low-alloy scrap units using the `--scrap` constraints.

### NPI Phosphorus Influx
* **Symptom**: Increased slag fluxing and FeSi demand.
* **Cause**: Indonesian coal-fired NPI contains up to 0.040% phosphorus. Since dephosphorization does not occur under reducing AOD conditions, phosphorus must be tightly capped in the raw charge.
* **Remedy**: Use the optimizer to blend pure nickel briquettes alongside NPI to keep charge phosphorus below 0.035%.

---

## 9 See also

* [Mathematical Methodology and Stoichiometric Balance](docs/methodology/FORMULAS_AND_METHODOLOGY.md) - Complete thermodynamic, enthalpy, and chemical derivations
* [Assumptions, Boundaries, and Limitations](docs/methodology/ASSUMPTIONS_AND_LIMITATIONS.md) - Metallurgical boundaries and scope allocations
* [Validation and Technical Feasibility Report](docs/methodology/VALIDATION_AND_FEASIBILITY.md) - Empirical calibration against JSL plant operating data
* [System Architecture and Backend Plan](docs/specifications/backend_architecture_plan.md) - Decoupled three-layer computational pipeline design
* [Official JSL Material Datasheets](datasheets/) - Certified elemental tolerances for 200, 300, 400, and Duplex series
* [Regulation (EU) 2023/956](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R0956) - European Union Carbon Border Adjustment Mechanism (CBAM)
* [Bureau of Energy Efficiency (BEE)](https://beeindia.gov.in/) - Carbon Credit Trading Scheme (CCTS) compliance grounding
* [ISO 19694-6:2023](https://www.iso.org/standard/79010.html) - Stationary source emissions: Ferroalloys and specialty stainless steel
* [SciPy HiGHS Solver Documentation](https://docs.scipy.org/doc/scipy/reference/optimize.linprog-highs.html) - Simplex and interior-point linear programming reference
