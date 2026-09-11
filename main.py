"""
Main CLI and Entry Point for JSL Carbon & Energy Engine.
Usage Examples:
    python main.py --grade J304 --product crCoil --facility jajpur
    python main.py --grade J430 --optimize
    python main.py --grade J2205 --pareto
    python main.py --serve --port 8000
"""

import argparse
import sys
from pathlib import Path

# Configure stdout for UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from jsl_carbon_engine.core.grades import get_grade, GRADES, list_grades_by_family, get_pren
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
from jsl_carbon_engine.core.emissions import compute_emissions
from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics
from jsl_carbon_engine.core.financials import compute_financials
from jsl_carbon_engine.core.optimizer import solve_charge_optimizer, compute_pareto_frontier, monte_carlo_pareto
from jsl_carbon_engine.config.jsl_facilities import get_facility


def run_cli_calculation(args):
    print("\n" + "=" * 78)
    print(" JINDAL STAINLESS LIMITED (JSL) — CARBON & ENERGY ENGINE")
    print(" Team NIT Raipur | Case Study Competition 2026")
    print("=" * 78)

    grade = get_grade(args.grade)
    facility = get_facility(args.facility)

    print(f"\n[METALLURGY] Selected Grade: {grade.name} ({grade.family})")
    print(f"             PREN: {get_pren(grade)} | Scrap Tramp Ceiling: {grade.scrap_cap}%")
    print(f"             Nominal Chemistry: {grade.cr}% Cr, {grade.ni}% Ni, {grade.mo}% Mo, {grade.mn}% Mn, {grade.cu}% Cu")
    print(f"[FACILITY]   Plant: {facility.name} ({facility.location})")
    print(f"             Molten FeCr Hot Charging: {'Active (-200 kWh/t)' if facility.has_hot_fecr_charging else 'Not Available'}")
    print(f"             Grid Baseline: {facility.grid_emission_factor} tCO2/MWh | Renewable Share: {args.renewable}%")

    # 1. Slag Kinetics
    slag = compute_slag_kinetics(grade, recovery_mode=args.recovery)

    # 2. Mass Balance
    mb = compute_mass_balance(
        grade=grade,
        scrap_pct=args.scrap,
        fe_source=args.fe_source,
        fecr_source=args.fecr_source,
        ni_source=args.ni_source,
        recovery_mode=args.recovery,
        product=args.product,
        casting=args.casting,
    )

    # 3. Thermodynamics
    thermo = compute_thermodynamics(
        mass_balance=mb,
        fe_source=args.fe_source,
        hot_fecr_charging=facility.has_hot_fecr_charging,
        product=args.product,
    )

    # 4. Emissions
    emissions = compute_emissions(
        grade=grade,
        mass_balance=mb,
        thermo=thermo,
        facility_id=args.facility,
        fe_source=args.fe_source,
        fecr_source=args.fecr_source,
        ni_source=args.ni_source,
        renewable_pct=args.renewable,
        fesi_demand_t=slag.fesi_demand_t,
        lime_demand_t=slag.lime_demand_t,
    )

    # 5. Financials
    fin = compute_financials(emissions)

    print("\n" + "-" * 78)
    print(f" 1. CLOSED-LOOP MASS CONSERVATION (Liquid Steel Mass: {mb.total_liquid_steel_t:.4f} t)")
    print("-" * 78)
    print(f" * Recycled Scrap Charged:        {mb.scrap_mass_t:.4f} t ({mb.scrap_fraction*100:.1f}%)")
    print(f" * Ferrochrome (HC FeCr):         {mb.fecr_mass_t:.4f} t (Credits {mb.fe_from_fecr_t:.4f} t metallic Fe!)")
    if mb.npi_mass_t > 0.0001:
        print(f" * Blended Nickel Mix:            {mb.npi_mass_t:.4f} t NPI + {mb.pure_ni_mass_t:.4f} t Pure Ni (Iron-balanced)")
    else:
        print(f" * Primary Nickel Addition:       {mb.ni_mass_t:.4f} t")
    print(f" * Ferromolybdenum (FeMo 65):     {mb.femo_mass_t:.4f} t")
    print(f" * Ferromanganese (FeMn 75):      {mb.femn_mass_t:.4f} t")
    if mb.cu_mass_t > 0.0001:
        print(f" * Copper Addition (Cu Granules): {mb.cu_mass_t:.4f} t ({grade.cu}% Cu target)")
    print(f" * Total Iron Credited from All.: {mb.total_fe_from_alloys_t:.4f} t (Double-counting eliminated!)")
    print(f" * Net Virgin Iron Required:      {mb.net_virgin_fe_t:.4f} t")
    print(f" * Gross DRI Charged:             {mb.gross_dri_charged_t:.4f} t")
    print(f" * Finishing Yield Multiplier:    {mb.cast_per_finished:.4f}x (Product: {args.product})")

    print("\n" + "-" * 78)
    print(" 2. DYNAMIC THERMODYNAMIC SEC & ENTHALPY BALANCE")
    print("-" * 78)
    print(f" * Dynamic EAF Melting SEC:       {thermo.eaf_sec_kwh_t_liquid:.1f} kWh/t liquid steel")
    if thermo.hot_fecr_credit_applied:
        print(f"   -> Jajpur Molten FeCr Credit:  -{thermo.hot_fecr_savings_kwh_t:.1f} kWh/t thermal savings")
    print(f" * Secondary Refining (AOD):      {thermo.refining_sec_kwh_t_liquid:.1f} kWh/t")
    print(f" * Total Electrical Energy:       {thermo.total_elec_kwh_per_t_finished:.1f} kWh/t finished")
    print(f" * Total Reheating Fuel:          {thermo.total_fuel_gj_per_t_finished:.2f} GJ/t finished")
    print(f" * Total Primary Energy:          {thermo.total_energy_gj_per_t_finished:.2f} GJ/t finished")

    print("\n" + "-" * 78)
    print(" 3. COMPLETE GHG PROTOCOL EMISSIONS BREAKDOWN")
    print("-" * 78)
    print(f" * Scope 1 (Direct Process Stack): {emissions.scope1_stack_decarb_tco2:.4f} tCO2/t (AOD Decarburization)")
    print(f" * Scope 1 (Reheat Fuel):          {emissions.scope1_fuel_combustion_tco2:.4f} tCO2/t")
    print(f" * Scope 1 Subtotal:               {emissions.scope1_direct_tco2:.4f} tCO2/t ({emissions.breakdown_pct['scope1_pct']}%)")
    print(f" * Scope 2 (Electricity):         {emissions.scope2_electricity_tco2:.4f} tCO2/t ({emissions.breakdown_pct['scope2_pct']}%) [Grid: {emissions.grid_emission_factor_blended:.3f} t/MWh]")
    print(f" * Scope 3 (Precursor Upstream):   {emissions.scope3_precursors_tco2:.4f} tCO2/t ({emissions.breakdown_pct['scope3_pct']}%)")
    print(f"   -> Virgin Iron Unit (DRI):      {emissions.scope3_fe_virgin_tco2:.4f} tCO2/t")
    print(f"   -> High-Carbon FeCr:            {emissions.scope3_fecr_tco2:.4f} tCO2/t")
    print(f"   -> Primary Nickel:              {emissions.scope3_nickel_tco2:.4f} tCO2/t")
    print(f"   -> Recycled Scrap Processing:   {emissions.scope3_scrap_tco2:.4f} tCO2/t")
    print(f"   -> FeMo & FeMn & Cu:            {emissions.scope3_femo_tco2 + emissions.scope3_femn_tco2 + emissions.scope3_copper_tco2:.4f} tCO2/t")
    print(f" * TOTAL SPECIFIC EMISSIONS:       {emissions.total_co2_t:.4f} tCO2 / tonne finished")

    print("\n" + "-" * 78)
    print(" 4. DUAL REGULATORY & FINANCIAL LIABILITY ENGINE")
    print("-" * 78)
    print(f" * EU CBAM 2026 Cash Duty:       €{fin.cbam_cash_tariff_2026_eur_per_t:.2f} / tonne (2.5% phase-in)")
    print(f" * EU CBAM 2034 Unhedged Exposure: €{fin.cbam_tariff_2034_unhedged_eur_per_t:.2f} / tonne (100% phase-in)")
    traj = fin.cbam_trajectory_eur_per_t
    print(f" * CBAM Ramp Trajectory:  2026→€{traj[2026]:.2f} | 2027→€{traj[2027]:.2f} | 2028→€{traj[2028]:.2f} | 2030→€{traj[2030]:.2f} | 2034→€{traj[2034]:.2f} (all €/t)")
    print(f" * India CCTS Carbon Position:    {fin.ccts_status} -> {fin.ccts_value_inr_per_t:+.1f} INR/tonne")
    print(f"   -> JSL Annual Group Impact:    {fin.ccts_annual_ebitda_inr_cr:+.2f} INR Crore / year")

    if args.optimize:
        print("\n" + "-" * 78)
        print(" 5. CONTINUOUS LINEAR PROGRAMMING (LP) CHARGE OPTIMIZATION")
        print("-" * 78)
        opt = solve_charge_optimizer(grade, alpha_cost_weight=args.alpha, facility_id=args.facility)
        if opt.is_feasible:
            print(f" [OK] Solver Status: Optimal charge sheet found (Highs Simplex/Interior-Point)")
            print(f" * Charge Cost: ${opt.charge_cost_usd_per_t:.2f} / tonne liquid steel")
            print(f" * Charge CO2:  {opt.total_co2_t_per_t:.3f} tCO2 / tonne")
            print(" * Optimal Charge Sheet Recipe:")
            for mat_key, pct in opt.charge_sheet_pct.items():
                print(f"   - {mat_key:15s}: {pct:5.2f}% ({opt.charge_sheet_t[mat_key]:.4f} t/t)")
            print(f" * Recovered Bath Chemistry: Cr={opt.final_chemistry_pct['Cr']}%, Ni={opt.final_chemistry_pct['Ni']}%, Mo={opt.final_chemistry_pct['Mo']}%, Mn={opt.final_chemistry_pct['Mn']}%, Cu={opt.final_chemistry_pct.get('Cu', 0.0)}%, Fe={opt.final_chemistry_pct['Fe']}%")
        else:
            print(f" [FAIL] LP Solver Infeasible: {opt.status_message}")

    if args.pareto:
        print("\n" + "-" * 78)
        print(" 6. PARETO OPTIMAL FRONTIER (COST VS. CARBON TRADE-OFF)")
        print("-" * 78)
        pf = compute_pareto_frontier(grade, steps=9, facility_id=args.facility)
        print(f" Alpha | Cost ($/t) | CO2 (t/t) | Scrap % | Primary Fe Unit")
        print(" " + "-" * 60)
        for pt in pf.frontier_points:
            print(f"  {pt.alpha:4.2f} |  ${pt.cost_usd_per_t:7.2f} |  {pt.co2_t_per_t:6.3f}   |  {pt.scrap_pct:5.1f}% | {list(pt.charge_sheet.keys())[:3]}")
        print(f"\n * Max CO2 Abatement Potential: {pf.max_co2_abatement_potential_pct:.1f}%")
        print(f" * Marginal Abatement Cost:     ${pf.cost_of_carbon_abatement_usd_per_tco2:.2f} per tCO2 avoided")

    if args.monte_carlo:
        print("\n" + "-" * 78)
        print(f" 7. MONTE CARLO STOCHASTIC ROBUSTNESS SIMULATION ({args.mc_runs} HEATS)")
        print("-" * 78)
        mc = monte_carlo_pareto(grade, runs=args.mc_runs, alpha_cost_weight=args.alpha, facility_id=args.facility)
        print(f" * Compliance Probability:       {mc.compliance_probability_pct:.1f}% ({mc.compliant_runs}/{mc.runs} compliant heats)")
        print(f" * Charge Cost Distribution:     P10=${mc.p10_cost_usd_per_t:.2f} | P50=${mc.p50_cost_usd_per_t:.2f} | P90=${mc.p90_cost_usd_per_t:.2f} per tonne")
        print(f" * Carbon Intensity Distribution: P10={mc.p10_co2_t_per_t:.3f} | P50={mc.p50_co2_t_per_t:.3f} | P90={mc.p90_co2_t_per_t:.3f} tCO2/t")

    print("\n" + "=" * 78 + "\n")


def main():
    parser = argparse.ArgumentParser(description="JSL Industrial Stainless Steel Carbon & Energy Engine CLI")
    parser.add_argument("--grade", default="J304", help="JSL Grade ID (e.g. J304, J4, J430, J2205)")
    parser.add_argument("--product", default="crCoil", help="Finished product (crCoil, hrCoil, slab, plate)")
    parser.add_argument("--scrap", type=float, default=60.0, help="Scrap charge %%")
    parser.add_argument("--facility", default="jajpur", choices=["jajpur", "hisar", "chhattisgarh"], help="Facility profile")
    parser.add_argument("--fe-source", default="coalDRI", choices=["coalDRI", "gasDRI", "pigIron"], help="Virgin iron unit")
    parser.add_argument("--fecr-source", default="fecrStandard", choices=["fecrStandard", "fecrLowC"], help="FeCr grade")
    parser.add_argument("--ni-source", default="niStandard", choices=["niStandard", "niClass1", "niNPI"], help="Nickel source")
    parser.add_argument("--recovery", default="standard", choices=["standard", "optimised"], help="AOD slag recovery")
    parser.add_argument("--casting", default="continuous", choices=["continuous", "ingot"], help="Casting route")
    parser.add_argument("--renewable", type=float, default=47.0, help="Renewable power %%")
    parser.add_argument("--alpha", type=float, default=0.5, help="LP Cost vs Carbon weight (1.0=cost, 0.0=carbon)")
    parser.add_argument("--optimize", action="store_true", help="Run continuous LP charge optimizer")
    parser.add_argument("--pareto", action="store_true", help="Generate complete Pareto Frontier")
    parser.add_argument("--monte-carlo", action="store_true", help="Run Monte Carlo stochastic robustness simulation")
    parser.add_argument("--mc-runs", type=int, default=1000, help="Number of Monte Carlo heats (default 1000)")
    parser.add_argument("--serve", action="store_true", help="Launch FastAPI REST server & dashboard")
    parser.add_argument("--host", default="127.0.0.1", help="Server host")
    parser.add_argument("--port", type=int, default=8000, help="Server port")

    args = parser.parse_args()

    if args.serve:
        import uvicorn
        print(f"Starting JSL Carbon Engine Server at http://{args.host}:{args.port}")
        uvicorn.run("jsl_carbon_engine.api.app:app", host=args.host, port=args.port, reload=False)
    else:
        run_cli_calculation(args)


if __name__ == "__main__":
    main()
