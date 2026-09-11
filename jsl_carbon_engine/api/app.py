"""
FastAPI Application and RESTful Service Layer for JSL Carbon & Energy Engine.
Exposes endpoints for calculation, LP charge optimization, Pareto frontier mapping,
facility profiles, and metallurgical grade library.
"""

from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from jsl_carbon_engine.core.grades import GRADES, Grade, get_grade, list_grades_by_family, get_pren
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
from jsl_carbon_engine.core.emissions import compute_emissions
from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics
from jsl_carbon_engine.core.financials import compute_financials
from jsl_carbon_engine.core.optimizer import solve_charge_optimizer, compute_pareto_frontier, monte_carlo_pareto
from jsl_carbon_engine.config.jsl_facilities import FACILITIES, get_facility
from jsl_carbon_engine.config.emission_factors import PRODUCTS, BENCHMARKS, RAW_MATERIALS

from jsl_carbon_engine.api.schemas import (
    CalculationRequest,
    CalculationResponse,
    OptimizationRequest,
    OptimizationResponse,
    ParetoRequest,
    ParetoResponse,
    CustomGradeRequest,
    MonteCarloRequest,
    MonteCarloResponse,
)

app = FastAPI(
    title="JSL Stainless Steel Carbon & Energy Engine",
    description="Industrial-grade pyrometallurgical carbon footprint, thermodynamics, and LP optimization engine for Jindal Stainless Limited.",
    version="1.0.0",
)

# Enable CORS for cross-origin web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from jsl_carbon_engine.api.agent_routes import router as agent_router, voice_agent_websocket
app.include_router(agent_router, prefix="/api/agent")

from fastapi import WebSocket as _WebSocket

@app.websocket("/voice/ws")
async def voice_ws_root_alias(websocket: _WebSocket):
    """Root-level WebSocket alias for /api/agent/voice/ws — enables direct frontend connect."""
    await voice_agent_websocket(websocket)


@app.get("/api/grades")
def list_grades():
    """List all 43 authentic JSL grades grouped by family."""
    families = list_grades_by_family()
    result = {}
    for fam, glist in families.items():
        result[fam] = [
            {
                "id": g.id,
                "name": g.name,
                "cr": g.cr,
                "ni": g.ni,
                "mo": g.mo,
                "mn": g.mn,
                "cu": g.cu,
                "c": g.c,
                "scrap_cap": g.scrap_cap,
                "pren": get_pren(g),
                "description": g.description,
                "applications": g.mechanical_applications,
            }
            for g in glist
        ]
    return {"families": result, "total_grades": len(GRADES)}


@app.get("/api/grades/{grade_id}")
def grade_detail(grade_id: str):
    """Retrieve full chemical and tramp specifications of a specific grade."""
    try:
        g = get_grade(grade_id)
        return {
            "id": g.id,
            "name": g.name,
            "family": g.family,
            "chemistry_midpoint": {
                "Cr": g.cr, "Ni": g.ni, "Mo": g.mo, "Mn": g.mn, "Cu": g.cu,
                "C": g.c, "Si": g.si, "S": g.s, "P": g.p, "N": g.n, "Fe": g.fe,
            },
            "bounds": {
                "cr_min": g.cr_min, "cr_max": g.cr_max,
                "ni_min": g.ni_min, "ni_max": g.ni_max,
                "mo_min": g.mo_min, "mo_max": g.mo_max,
                "mn_min": g.mn_min, "mn_max": g.mn_max,
                "cu_min": g.cu_min, "cu_max": g.cu_max,
                "c_max": g.c_max, "si_max": g.si_max,
            },
            "scrap_cap": g.scrap_cap,
            "pren": get_pren(g),
            "applications": g.mechanical_applications,
            "description": g.description,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/facilities")
def list_facilities():
    """Retrieve profiles for JSL Jajpur and Hisar facilities."""
    return {
        fid: {
            "id": f.id,
            "name": f.name,
            "location": f.location,
            "capacity_mtpa": f.capacity_mtpa,
            "grid_emission_factor": f.grid_emission_factor,
            "electricity_cost_inr_kwh": f.electricity_cost_inr_kwh,
            "ppa_available": f.ppa_available,
            "ppa_emission_factor": f.ppa_emission_factor,
            "ppa_cost_inr_kwh": f.ppa_cost_inr_kwh,
            "ppa_capacity_mw": f.ppa_capacity_mw,
            "has_hot_fecr_charging": f.has_hot_fecr_charging,
            "hot_fecr_sec_credit_kwh_t": f.hot_fecr_sec_credit_kwh_t,
            "has_green_hydrogen": f.has_green_hydrogen,
            "green_h2_co2_abatement_t_yr": f.green_h2_co2_abatement_t_yr,
            "ccts_target_tco2": f.ccts_target_tco2,
            "ccts_baseline_tco2": f.ccts_baseline_tco2,
            "description": f.description,
        }
        for fid, f in FACILITIES.items()
    }


@app.get("/api/products")
def list_products():
    """List finishing products with yield factors and energy intensities."""
    return {
        pid: {
            "label": p.label,
            "yield_factor": p.yield_factor,
            "elec_kwh": p.elec_kwh,
            "fuel_gj": p.fuel_gj,
            "description": p.description,
        }
        for pid, p in PRODUCTS.items()
    }


@app.post("/api/calculate")
def calculate_emissions_endpoint(req: CalculationRequest):
    """
    Executes the full pyrometallurgical pipeline:
    Mass balance -> Thermodynamics -> Emissions -> Slag kinetics -> Financial liabilities.
    """
    try:
        grade = get_grade(req.grade)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    facility = get_facility(req.facility)
    hot_fecr = req.hot_fecr_charging if req.hot_fecr_charging is not None else facility.has_hot_fecr_charging

    # 1. Slag Kinetics & Reducing Agent Demands
    slag_res = compute_slag_kinetics(grade=grade, recovery_mode=req.recovery)

    # 2. Closed-Loop Stoichiometric Mass Balance
    mb_res = compute_mass_balance(
        grade=grade,
        scrap_pct=req.scrap_pct,
        fe_source=req.fe_source,
        fecr_source=req.fecr_source,
        ni_source=req.ni_source,
        recovery_mode=req.recovery,
        product=req.product,
        casting=req.casting,
        ideal_yield=req.ideal_yield,
    )

    # 3. Dynamic EAF SEC Thermodynamics
    thermo_res = compute_thermodynamics(
        mass_balance=mb_res,
        fe_source=req.fe_source,
        hot_fecr_charging=hot_fecr,
        refining_route=req.refining,
        casting_route=req.casting,
        product=req.product,
        ideal_yield=req.ideal_yield,
    )

    # 4. Comprehensive Emissions Model
    emissions_res = compute_emissions(
        grade=grade,
        mass_balance=mb_res,
        thermo=thermo_res,
        facility_id=req.facility,
        fe_source=req.fe_source,
        fecr_source=req.fecr_source,
        ni_source=req.ni_source,
        renewable_pct=req.renewable_pct,
        fesi_demand_t=slag_res.fesi_demand_t,
        lime_demand_t=slag_res.lime_demand_t,
    )

    # 5. Financial Liabilities (CBAM + CCTS)
    fin_res = compute_financials(
        emissions=emissions_res,
        eu_ets_price_eur=req.eu_ets_price_eur,
        india_ccc_price_inr=req.india_ccc_price_inr,
    )

    # Benchmark comparisons
    comp = {
        "global_stainless_avg_2_93": round(emissions_res.total_co2_t - 2.93, 3),
        "global_stainless_avg_pct_diff": round((emissions_res.total_co2_t - 2.93) / 2.93 * 100.0, 1),
        "jsl_fy26_baseline_1_76": round((emissions_res.scope1_direct_tco2 + emissions_res.scope2_electricity_tco2) - 1.76, 3),
        "india_ccts_target_1_46": round((emissions_res.scope1_direct_tco2 + emissions_res.scope2_electricity_tco2) - 1.46, 3),
        "india_ccts_target_0_8222": round((emissions_res.scope1_direct_tco2 + emissions_res.scope2_electricity_tco2) - fin_res.ccts_target_tco2, 3),
        "eu_ets_high_alloy_benchmark_0_176": round(emissions_res.scope1_direct_tco2 - 0.176, 3),
    }

    return {
        "grade": {
            "id": grade.id,
            "name": grade.name,
            "family": grade.family,
            "scrap_cap": grade.scrap_cap,
            "pren": get_pren(grade),
            "cu_tramp_cap": grade.cu_tramp_cap,
        },
        "facility": {
            "id": facility.id,
            "name": facility.name,
            "hot_fecr_applied": hot_fecr,
        },
        "mass_balance": {
            "scrap_pct_effective": round(mb_res.scrap_fraction * 100.0, 1),
            "scrap_mass_t": round(mb_res.scrap_mass_t, 4),
            "fecr_mass_t": round(mb_res.fecr_mass_t, 4),
            "ni_mass_t": round(mb_res.ni_mass_t, 4),
            "femo_mass_t": round(mb_res.femo_mass_t, 4),
            "femn_mass_t": round(mb_res.femn_mass_t, 4),
            "cu_mass_t": round(mb_res.cu_mass_t, 4),
            "fe_credit_from_alloys_t": round(mb_res.total_fe_from_alloys_t, 4),
            "net_virgin_fe_t": round(mb_res.net_virgin_fe_t, 4),
            "gross_dri_charged_t": round(mb_res.gross_dri_charged_t, 4),
            "total_liquid_steel_t": round(mb_res.total_liquid_steel_t, 4),
            "cast_per_finished": round(mb_res.cast_per_finished, 4),
            "scaled_inputs_per_t_finished": {k: round(v, 4) for k, v in mb_res.scaled_inputs_per_t_finished.items()},
        },
        "thermodynamics": {
            "eaf_sec_kwh_t_liquid": thermo_res.eaf_sec_kwh_t_liquid,
            "refining_sec_kwh_t_liquid": thermo_res.refining_sec_kwh_t_liquid,
            "casting_sec_kwh_t_liquid": thermo_res.casting_sec_kwh_t_liquid,
            "total_elec_kwh_per_t_finished": thermo_res.total_elec_kwh_per_t_finished,
            "total_fuel_gj_per_t_finished": thermo_res.total_fuel_gj_per_t_finished,
            "total_energy_gj_per_t_finished": thermo_res.total_energy_gj_per_t_finished,
            "hot_fecr_savings_kwh_t": thermo_res.hot_fecr_savings_kwh_t,
            "breakdown_kwh": thermo_res.breakdown_kwh,
        },
        "emissions": {
            "scope1_total_tco2": emissions_res.scope1_direct_tco2,
            "scope1_stack_decarb_tco2": emissions_res.scope1_stack_decarb_tco2,
            "scope1_fuel_combustion_tco2": emissions_res.scope1_fuel_combustion_tco2,
            "scope2_total_tco2": emissions_res.scope2_electricity_tco2,
            "scope2_grid_ef_blended": emissions_res.grid_emission_factor_blended,
            "scope3_total_tco2": emissions_res.scope3_precursors_tco2,
            "scope3_breakdown": {
                "fe_virgin_tco2": emissions_res.scope3_fe_virgin_tco2,
                "scrap_tco2": emissions_res.scope3_scrap_tco2,
                "fecr_tco2": emissions_res.scope3_fecr_tco2,
                "nickel_tco2": emissions_res.scope3_nickel_tco2,
                "femo_tco2": emissions_res.scope3_femo_tco2,
                "femn_tco2": emissions_res.scope3_femn_tco2,
                "copper_tco2": emissions_res.scope3_copper_tco2,
                "fluxes_tco2": emissions_res.scope3_fluxes_tco2,
            },
            "total_co2_t": emissions_res.total_co2_t,
            "breakdown_pct": emissions_res.breakdown_pct,
        },
        "slag_kinetics": {
            "recovery_mode": slag_res.recovery_mode,
            "cr_recovery_pct": slag_res.target_cr_recovery_pct,
            "cr_recovered_kg": slag_res.cr_recovered_to_metal_kg,
            "cr_lost_to_slag_kg": slag_res.cr_lost_to_slag_kg,
            "fesi_demand_kg_t": slag_res.fesi_demand_kg_t,
            "lime_demand_kg_t": slag_res.lime_demand_kg_t,
            "total_slag_generated_kg_t": slag_res.total_slag_generated_kg_t,
            "cr2o3_in_slag_pct": slag_res.cr2o3_in_discard_slag_pct,
        },
        "financials": {
            "cbam_embedded_intensity_tco2": fin_res.cbam_embedded_intensity_tco2,
            "cbam_taxable_carbon_gap_tco2": fin_res.cbam_taxable_carbon_gap_tco2,
            "cbam_tariff_eur_per_t": fin_res.cbam_tariff_eur_per_t,
            "cbam_tariff_inr_per_t": fin_res.cbam_tariff_inr_per_t,
            "cbam_annual_exposure_eur": fin_res.cbam_annual_liability_eur,
            "cbam_annual_exposure_inr_cr": fin_res.cbam_annual_liability_inr_cr,
            "cbam_liability_2026": fin_res.cbam_liability_2026,
            "cbam_liability_2034_full": fin_res.cbam_liability_2034_full,
            "cbam_tariff_2034_eur_per_t": fin_res.cbam_tariff_2034_eur_per_t,
            "cbam_cscf": fin_res.cbam_cscf,
            "cbam_phase_in_factor_2026": fin_res.cbam_phase_in_factor_2026,
            "cbam_sefa_tco2": fin_res.cbam_sefa_tco2,
            "cbam_taxable_gap_full_tco2": fin_res.cbam_taxable_gap_full_tco2,
            "cbam_cash_tariff_2026_eur_per_t": fin_res.cbam_cash_tariff_2026_eur_per_t,
            "cbam_tariff_2034_unhedged_eur_per_t": fin_res.cbam_tariff_2034_unhedged_eur_per_t,
            "cbam_article9_deduction_eur_per_t": fin_res.cbam_article9_deduction_eur_per_t,
            "cbam_trajectory_eur_per_t": fin_res.cbam_trajectory_eur_per_t,
            "see_including_scope2": fin_res.see_including_scope2,
            "ccts_intensity_tco2": fin_res.ccts_scope12_intensity_tco2,
            "ccts_target_tco2": fin_res.ccts_target_tco2,
            "ccts_carbon_delta_tco2": fin_res.ccts_carbon_delta_tco2,
            "ccts_status": fin_res.ccts_status,
            "ccts_value_inr_per_t": fin_res.ccts_value_inr_per_t,
            "ccts_annual_ebitda_inr_cr": fin_res.ccts_annual_ebitda_inr_cr,
            "summary": fin_res.financial_summary,
        },
        "benchmarks_comparison": comp,
    }


@app.post("/api/optimize")
def optimize_charge_endpoint(req: OptimizationRequest):
    """
    Continuous Simplex/HiGHS LP solver for optimal stainless steel charge mix.
    """
    try:
        grade = get_grade(req.grade)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    res = solve_charge_optimizer(
        grade=grade,
        alpha_cost_weight=req.alpha_cost_weight,
        facility_id=req.facility,
        allow_npi=req.allow_npi,
        allow_gas_dri=req.allow_gas_dri,
        allow_pig_iron=req.allow_pig_iron,
        enforce_scrap_cap=req.enforce_scrap_cap,
        custom_scrap_cap=req.custom_scrap_cap,
        electricity_cost_usd_kwh=req.electricity_cost_usd_kwh,
    )

    return {
        "grade_id": res.grade_id,
        "is_feasible": res.is_feasible,
        "status_message": res.status_message,
        "alpha_cost_weight": res.alpha_cost_weight,
        "charge_sheet_pct": res.charge_sheet_pct,
        "charge_sheet_t": res.charge_sheet_t,
        "final_chemistry_pct": res.final_chemistry_pct,
        "charge_cost_usd_per_t": res.charge_cost_usd_per_t,
        "total_co2_t_per_t": res.total_co2_t_per_t,
        "scrap_share_pct": res.scrap_share_pct,
        "virgin_dri_share_pct": res.virgin_dri_share_pct,
        "ferroalloys_share_pct": res.ferroalloys_share_pct,
        "tramp_shadow_prices": res.tramp_shadow_prices,
        "value_in_use_usd_per_t": res.value_in_use_usd_per_t,
        "scrap_ceiling_shadow_price_usd_per_t": res.scrap_ceiling_shadow_price_usd_per_t,
        "estimated_lime_kg_per_t": res.estimated_lime_kg_per_t,
        "estimated_slag_kg_per_t": res.estimated_slag_kg_per_t,
    }


@app.post("/api/pareto")
def pareto_endpoint(req: ParetoRequest):
    """
    Sweeps multi-objective weights to construct the Pareto Frontier.
    """
    try:
        grade = get_grade(req.grade)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    res = compute_pareto_frontier(grade=grade, steps=req.steps, facility_id=req.facility)

    return {
        "grade_id": res.grade_id,
        "frontier_points": [
            {
                "alpha": p.alpha,
                "cost_usd_per_t": p.cost_usd_per_t,
                "co2_t_per_t": p.co2_t_per_t,
                "scrap_pct": p.scrap_pct,
                "charge_sheet": p.charge_sheet,
            }
            for p in res.frontier_points
        ],
        "least_cost_point": {
            "alpha": res.least_cost_point.alpha,
            "cost_usd_per_t": res.least_cost_point.cost_usd_per_t,
            "co2_t_per_t": res.least_cost_point.co2_t_per_t,
            "scrap_pct": res.least_cost_point.scrap_pct,
        },
        "least_carbon_point": {
            "alpha": res.least_carbon_point.alpha,
            "cost_usd_per_t": res.least_carbon_point.cost_usd_per_t,
            "co2_t_per_t": res.least_carbon_point.co2_t_per_t,
            "scrap_pct": res.least_carbon_point.scrap_pct,
        },
        "max_co2_abatement_potential_pct": res.max_co2_abatement_potential_pct,
        "cost_of_carbon_abatement_usd_per_tco2": res.cost_of_carbon_abatement_usd_per_tco2,
    }


@app.post("/api/monte-carlo", response_model=MonteCarloResponse)
def monte_carlo_endpoint(req: MonteCarloRequest):
    """
    Monte Carlo stochastic robustness simulation for charge sheet compliance.
    """
    try:
        grade = get_grade(req.grade)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    res = monte_carlo_pareto(
        grade=grade,
        runs=req.runs,
        alpha_cost_weight=req.alpha_cost_weight,
        std_dev_cr=req.std_dev_cr,
        std_dev_ni=req.std_dev_ni,
        std_dev_cu=req.std_dev_cu,
        std_dev_sn=req.std_dev_sn,
        facility_id=req.facility,
        seed=req.seed,
    )
    return MonteCarloResponse(
        grade_id=res.grade_id,
        runs=res.runs,
        p10_cost_usd_per_t=res.p10_cost_usd_per_t,
        p50_cost_usd_per_t=res.p50_cost_usd_per_t,
        p90_cost_usd_per_t=res.p90_cost_usd_per_t,
        p10_co2_t_per_t=res.p10_co2_t_per_t,
        p50_co2_t_per_t=res.p50_co2_t_per_t,
        p90_co2_t_per_t=res.p90_co2_t_per_t,
        compliance_probability_pct=res.compliance_probability_pct,
        compliant_runs=res.compliant_runs,
    )


@app.get("/", response_class=HTMLResponse)
@app.get("/dashboard", response_class=HTMLResponse)
def serve_dashboard():
    """Serves pure headless REST API status page."""
    return HTMLResponse("<!DOCTYPE html><html><head><title>JSL Carbon & Energy Engine</title></head><body><h1>JSL Carbon & Energy Engine - Headless REST API</h1><p>Interactive Swagger documentation available at <a href='/docs'>/docs</a>.</p></body></html>")
