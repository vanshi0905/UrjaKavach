# Jindal Stainless Carbon & Energy Pyrometallurgical Cockpit

### JINDAL STAINLESS ENGINEERING CASE STUDY COMPETITION 2026
**Problem Statement 3**: *Carbon and Energy Calculator for Steelmaking*  
**Engineered by**: Team NIT Raipur  
**Deployment**: 100% Vercel Serverless / Edge Native (0ms Latency, Zero Python Server Dependency)

---

## Executive Summary
This enterprise-grade Next.js 14 web application is an interactive digital twin cockpit and continuous charge sheet optimizer built specifically for **Jindal Stainless Limited (JSL)**, India's premier stainless steel manufacturer with over 3 million tonnes annual melt capacity across **Jajpur (Odisha)** and **Hisar (Haryana)**.

Unlike generic carbon estimation tools that oversimplify steelmaking into linear scrap ratios, this cockpit implements **closed-loop pyrometallurgical thermodynamics**, enforces **43 authentic JSL grade chemistry specifications**, clamps to metallurgical **tramp element scrap ceilings**, and directly monetizes decarbonization through **EU CBAM (Definitive 2026 SEFA vs 2034 Unhedged Exposure)** and **India CCTS (BEE June 2026 Mandate)**.

---

## Key Capabilities & Page Architecture

### 1. Overview & Trilemma (`/`)
- **The Stainless Steel Trilemma**: Interactive analysis of the trade-off between Carbon Abatement, Pyrometallurgical Integrity, and Financial Sovereignty.
- **Interactive Live Demonstration**: Grade J304 at Jajpur Works demonstrating a **-67.2% specific emissions reduction** (from 2.87 down to 0.94 tCO2/t finished steel).
- **Asset Digital Twins**: Jajpur (250 MW coal CPP, captive SAF molten FeCr charging, 315.6 MW hybrid PPA) vs Hisar (Northern Grid, India's 1st commercial 95 Nm3/hr green hydrogen plant in bright annealing).

### 2. Calculator Cockpit (`/calculator`)
- **43-Grade Master Selector**: Filterable across 5 families (200 Series Lean-Austenitic, 300 Series Austenitic, 400 Series Ferritic, 400 Series Martensitic, Duplex & Super Duplex).
- **Physical Scrap Ceiling Clamping**: Slider automatically bounded to grade-specific scrap limits (e.g., 90% for 304, 75% for J4, 65% for 430, 50% for 2507).
- **10-Driver Emissions Waterfall**: Real-time stacked chart isolating decarb stack, reheat fuel, electricity generation, virgin iron unit, scrap, FeCr, Nickel, FeMo/FeMn, and slag fluxes.
- **Statutory Benchmarks**: Real-time comparison against EU Scrap-EAF (0.288 t), BEE CCTS Target (0.8222 t), JSL BRSR Baseline (1.760 t), and Global Average (2.930 t).
- **Closed-Loop Mass Balance**: Complete verification table guaranteeing 1.000 t liquid bath mass conservation with ferroalloy iron crediting.

### 3. Optimizer & Risk Engine (`/optimizer`)
- **Continuous Multi-Objective Simplex LP**: Fast Two-Phase Simplex algorithm with Bland's rule solving for the optimal charge mix across 12 raw materials.
- **25-Point Pareto Frontier**: Interactive trade-off curve between raw material cost ($/t) and carbon footprint (tCO2/t).
- **1,000-Heat Monte Carlo Simulation**: Correlated stochastic scrap perturbation (Cr-Ni correlation 0.70, Cu-Sn correlation 0.50) measuring chance-constrained compliance probability and P10/P50/P90 distributions.
- **EU CBAM 10-Year Ramp Trajectory (2026→2034)**: Dynamic financial schedule modeling the phase-out of free allocation with custom export volume controls.

### 4. Methodology & Case Evidence (`/methodology`)
- **5-Slide Presentation Deck Companion**: Complete slide-by-slide brief structured according to the JSL competition guidelines.
- **Open-Box Formulations**: Full mathematical equations for iron crediting, dynamic SEC enthalpy balance, SEFA CBAM formula, and CCTS EBITDA impact.
- **Master Chemistry Table**: Searchable matrix of 43 grades detailing Cr, Ni, Mo, Mn, PREN numbers, scrap limits, and mechanical applications.
- **Verified Audit Citations**: Comprehensive citations from IPCC 2019, worldsteel, ISSF, Nickel Institute, and Central Electricity Authority (CEA v20).

---

## Local Development & Vercel Deployment

### Local Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the cockpit.

### Production Build
```bash
# Build optimized static and serverless bundles
npm run build

# Start production server
npm run start
```

### Vercel Deployment
This project is configured for **zero-configuration 1-click deployment to Vercel**:
1. Push this repository to GitHub/GitLab.
2. Import the `frontend` directory into Vercel.
3. Framework Preset: **Next.js**.
4. Build Command: `npm run build`.
5. Output Directory: `.next`.
6. Deploy!
