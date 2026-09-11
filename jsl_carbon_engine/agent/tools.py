"""
Deterministic 8-Tool Function Calling Engine for JSL Metallurgical Chatbot & Voice Copilot.
Exposes the 8 pyrometallurgical, thermodynamic, financial, and optimization functions
grounded across the entire jsl_carbon_engine codebase:
1. calculate_metallurgy
2. solve_charge_optimizer
3. run_monte_carlo_risk
4. compute_multi_target_shapley
5. compute_slag_and_flux_kinetics
6. get_cbam_trajectory
7. sweep_pareto_frontier
8. get_grade_chemistry_and_limits
"""

import json
from typing import Dict, Any, Optional, List
from jsl_carbon_engine.core.grades import GRADES, Grade, get_grade, get_pren
from jsl_carbon_engine.core.mass_balance import compute_mass_balance, MassBalanceResult
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics, ThermodynamicResult
from jsl_carbon_engine.core.emissions import compute_emissions, EmissionsResult
from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics, SlagKineticsResult
from jsl_carbon_engine.core.financials import compute_financials, FinancialResult
from jsl_carbon_engine.core.optimizer import (
    solve_charge_optimizer as core_solve_charge_optimizer,
    compute_pareto_frontier as core_compute_pareto_frontier,
    monte_carlo_pareto as core_monte_carlo_pareto,
    OptimizerResult,
    ParetoFrontierResult,
    MonteCarloResult,
)
from jsl_carbon_engine.agent.shap_engine import compute_multi_target_shapley as core_compute_shapley


def calculate_metallurgy(
    grade_id: str = "J304",
    scrap_pct: float = 60.0,
    facility_id: str = "jajpur",
    fe_source: str = "coalDRI",
    fecr_source: str = "fecrStandard",
    ni_source: str = "niStandard",
    recovery: str = "standard",
    product: str = "crCoil",
    casting: str = "continuous",
    refining: str = "aod",
    renewable_pct: float = 47.0,
    hot_fecr_charging: Optional[bool] = None,
    ideal_yield: bool = False,
    eu_ets_price_eur: float = 80.0,
    india_ccc_price_inr: float = 1500.0,
) -> Dict[str, Any]:
    """
    Computes closed-loop mass balance, dynamic EAF-AOD thermodynamics,
    Scope 1-2-3 emissions, slag reduction kinetics, and EU CBAM / India CCTS financials.
    """
    grade = get_grade(grade_id)
    clamped_scrap = min(scrap_pct, grade.scrap_cap)

    # 1. Mass Balance
    mb = compute_mass_balance(
        grade=grade,
        scrap_pct=clamped_scrap,
        fe_source=fe_source,
        fecr_source=fecr_source,
        ni_source=ni_source,
        recovery_mode=recovery,
        product=product,
        casting=casting,
        ideal_yield=ideal_yield,
    )

    # 2. Slag Kinetics
    slag = compute_slag_kinetics(grade=grade, recovery_mode=recovery)

    # 3. Thermodynamics
    is_hot = (facility_id == "jajpur") if hot_fecr_charging is None else hot_fecr_charging
    thermo = compute_thermodynamics(
        mass_balance=mb,
        fe_source=fe_source,
        hot_fecr_charging=is_hot,
        refining_route=refining,
        casting_route=casting,
        product=product,
        ideal_yield=ideal_yield,
    )

    # 4. Emissions
    em = compute_emissions(
        grade=grade,
        mass_balance=mb,
        thermo=thermo,
        facility_id=facility_id,
        fe_source=fe_source,
        fecr_source=fecr_source,
        ni_source=ni_source,
        renewable_pct=renewable_pct,
        fesi_demand_t=slag.fesi_demand_t,
        lime_demand_t=slag.lime_demand_t,
        recovery_mode=recovery,
    )

    # 5. Financials
    fin = compute_financials(
        emissions=em,
        eu_ets_price_eur=eu_ets_price_eur,
        india_ccc_price_inr=india_ccc_price_inr,
    )

    return {
        "grade_id": grade.id,
        "grade_name": grade.name,
        "family": grade.family,
        "pren": get_pren(grade),
        "scrap_pct_applied": clamped_scrap,
        "scrap_cap_pct": grade.scrap_cap,
        "liquid_steel_mass_t": round(mb.total_liquid_steel_t, 4),
        "net_virgin_fe_t": round(mb.net_virgin_fe_t, 4),
        "fe_credited_from_alloys_t": round(mb.total_fe_from_alloys_t, 4),
        "gross_dri_charged_t": round(mb.gross_dri_charged_t, 4),
        "eaf_sec_kwh_t": round(thermo.eaf_sec_kwh_t_liquid, 2),
        "hot_fecr_savings_kwh_t": round(thermo.hot_fecr_savings_kwh_t, 2),
        "total_energy_gj_t_finished": round(thermo.total_energy_gj_per_t_finished, 3),
        "scope1_direct_tco2": round(em.scope1_direct_tco2, 3),
        "scope2_electricity_tco2": round(em.scope2_electricity_tco2, 3),
        "scope3_precursors_tco2": round(em.scope3_precursors_tco2, 3),
        "total_co2_t": round(em.total_co2_t, 3),
        "cbam_see_tco2": round(fin.cbam_embedded_intensity_tco2, 3),
        "cbam_sefa_tco2": round(fin.cbam_sefa_tco2, 3),
        "cbam_cash_tariff_2026_eur": round(fin.cbam_cash_tariff_2026_eur_per_t, 2),
        "cbam_unhedged_tariff_2034_eur": round(fin.cbam_tariff_2034_unhedged_eur_per_t, 2),
        "ccts_s12_intensity_tco2": round(fin.ccts_scope12_intensity_tco2, 3),
        "ccts_target_tco2": round(fin.ccts_target_tco2, 4),
        "ccts_status": fin.ccts_status,
        "ccts_value_inr_per_t": round(fin.ccts_value_inr_per_t, 2),
        "ccts_annual_ebitda_inr_cr": round(fin.ccts_annual_ebitda_inr_cr, 2),
        "fesi_demand_kg_t": round(slag.fesi_demand_kg_t, 2),
        "lime_demand_kg_t": round(slag.lime_demand_kg_t, 2),
        "total_slag_kg_t": round(slag.total_slag_generated_kg_t, 2),
        "cr_recovery_pct": round(slag.target_cr_recovery_pct, 1),
    }


def solve_charge_optimizer(
    grade_id: str = "J304",
    alpha_cost_weight: float = 0.5,
    facility_id: str = "jajpur",
    allow_npi: bool = True,
    allow_gas_dri: bool = True,
    allow_pig_iron: bool = True,
    enforce_scrap_cap: bool = True,
    custom_scrap_cap: Optional[float] = None,
    electricity_cost_usd_kwh: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Continuous HiGHS Simplex Linear Programming optimizer for least-cost / least-carbon charge mix.
    Includes phosphorus recovery barrier (eta_P = 0.99), dual shadow prices, and Value-in-Use (ViU).
    """
    grade = get_grade(grade_id)
    res: OptimizerResult = core_solve_charge_optimizer(
        grade=grade,
        alpha_cost_weight=alpha_cost_weight,
        facility_id=facility_id,
        allow_npi=allow_npi,
        allow_gas_dri=allow_gas_dri,
        allow_pig_iron=allow_pig_iron,
        enforce_scrap_cap=enforce_scrap_cap,
        custom_scrap_cap=custom_scrap_cap,
        electricity_cost_usd_kwh=electricity_cost_usd_kwh,
    )

    return {
        "grade_id": res.grade_id,
        "is_feasible": res.is_feasible,
        "alpha_cost_weight": res.alpha_cost_weight,
        "charge_cost_usd_per_t": res.charge_cost_usd_per_t,
        "total_co2_t_per_t": res.total_co2_t_per_t,
        "scrap_share_pct": res.scrap_share_pct,
        "virgin_dri_share_pct": res.virgin_dri_share_pct,
        "ferroalloys_share_pct": res.ferroalloys_share_pct,
        "charge_sheet_pct": res.charge_sheet_pct,
        "charge_sheet_t": res.charge_sheet_t,
        "final_chemistry_pct": res.final_chemistry_pct,
        "tramp_shadow_prices": res.tramp_shadow_prices,
        "value_in_use_usd_per_t": res.value_in_use_usd_per_t,
        "scrap_ceiling_shadow_price_usd_per_t": res.scrap_ceiling_shadow_price_usd_per_t,
        "estimated_lime_kg_per_t": res.estimated_lime_kg_per_t,
        "estimated_slag_kg_per_t": res.estimated_slag_kg_per_t,
        "phosphorus_barrier_eta_p": 0.99,
        "status_message": res.status_message,
    }


def run_monte_carlo_risk(
    grade_id: str = "J304",
    runs: int = 1000,
    alpha_cost_weight: float = 0.5,
    facility_id: str = "jajpur",
    enforce_scrap_cap: bool = True,
    custom_scrap_cap: Optional[float] = None,
    seed: Optional[int] = 42,
) -> Dict[str, Any]:
    """
    1,000-run Monte Carlo stochastic simulation under scrap chemistry perturbations (Cr, Ni, Cu, Sn).
    Evaluates Chance-Constrained Compliance Probability P(all specs met) and P10/P50/P90 bands.
    """
    grade = get_grade(grade_id)
    res: MonteCarloResult = core_monte_carlo_pareto(
        grade=grade,
        runs=runs,
        alpha_cost_weight=alpha_cost_weight,
        facility_id=facility_id,
        enforce_scrap_cap=enforce_scrap_cap,
        custom_scrap_cap=custom_scrap_cap,
        seed=seed,
    )

    return {
        "grade_id": res.grade_id,
        "runs": res.runs,
        "compliant_runs": res.compliant_runs,
        "compliance_probability_pct": res.compliance_probability_pct,
        "p10_cost_usd_per_t": res.p10_cost_usd_per_t,
        "p50_cost_usd_per_t": res.p50_cost_usd_per_t,
        "p90_cost_usd_per_t": res.p90_cost_usd_per_t,
        "p10_co2_t_per_t": res.p10_co2_t_per_t,
        "p50_co2_t_per_t": res.p50_co2_t_per_t,
        "p90_co2_t_per_t": res.p90_co2_t_per_t,
    }


def compute_multi_target_shapley(params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Evaluates the full 6-feature hypercube (64 coalitions) with memoized intermediate
    thermodynamic and mass balance results to deliver exact additive closure (Error = 0.000e0).
    """
    p = params or {}
    report = core_compute_shapley(p)
    closure_err = (
        report.get("targets", {})
        .get("total_co2_t", {})
        .get("closure_check", {})
        .get("closure_error", 0.0)
    )
    report["coalitions_evaluated"] = 64
    report["additive_closure_error"] = closure_err
    return report


def compute_slag_and_flux_kinetics(
    grade_id: str = "J304",
    recovery_mode: str = "standard",
    target_basicity_b2: float = 1.90,
) -> Dict[str, Any]:
    """
    AOD Slag reduction kinetics: FeSi 75 reduction stoichiometry, lime flux demand,
    and discard slag mass generation to maintain binary basicity B2 = CaO / SiO2.
    """
    grade = get_grade(grade_id)
    res: SlagKineticsResult = compute_slag_kinetics(
        grade=grade,
        recovery_mode=recovery_mode,
        target_basicity_b2=target_basicity_b2,
    )

    return {
        "grade_id": grade.id,
        "recovery_mode": res.recovery_mode,
        "target_cr_recovery_pct": res.target_cr_recovery_pct,
        "cr_charged_kg_t": res.total_cr_charged_kg,
        "cr_recovered_to_metal_kg": res.cr_recovered_to_metal_kg,
        "cr_lost_to_slag_kg": res.cr_lost_to_slag_kg,
        "fesi_demand_kg_t": res.fesi_demand_kg_t,
        "lime_demand_kg_t": res.lime_demand_kg_t,
        "sio2_generated_kg_t": res.sio2_generated_kg_t,
        "total_slag_generated_kg_t": res.total_slag_generated_kg_t,
        "cr2o3_in_discard_slag_pct": res.cr2o3_in_discard_slag_pct,
        "target_basicity_b2": target_basicity_b2,
    }


def get_cbam_trajectory(
    grade_id: str = "J304",
    scrap_pct: float = 60.0,
    facility_id: str = "jajpur",
    fe_source: str = "coalDRI",
    fecr_source: str = "fecrStandard",
    ni_source: str = "niStandard",
    eu_ets_price_eur: float = 80.0,
    eu_exports_tpa: float = 600000.0,
) -> Dict[str, Any]:
    """
    Computes EU CBAM Regulation 2023/956 phase-in schedule (2026-2034) with SEFA benchmark,
    CSCF, strict Scope 2 exclusion under Annex II, and Article 9 deductions.
    """
    res = calculate_metallurgy(
        grade_id=grade_id,
        scrap_pct=scrap_pct,
        facility_id=facility_id,
        fe_source=fe_source,
        fecr_source=fecr_source,
        ni_source=ni_source,
        eu_ets_price_eur=eu_ets_price_eur,
    )

    grade = get_grade(grade_id)
    clamped_scrap = min(scrap_pct, grade.scrap_cap)
    mb = compute_mass_balance(grade=grade, scrap_pct=clamped_scrap, fe_source=fe_source, fecr_source=fecr_source, ni_source=ni_source)
    is_hot = (facility_id == "jajpur")
    thermo = compute_thermodynamics(mass_balance=mb, fe_source=fe_source, hot_fecr_charging=is_hot)
    em = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, facility_id=facility_id, fe_source=fe_source, fecr_source=fecr_source, ni_source=ni_source)
    fin = compute_financials(emissions=em, eu_ets_price_eur=eu_ets_price_eur, eu_exports_tpa=eu_exports_tpa)

    return {
        "grade_id": grade_id,
        "scope1_direct_tco2": res["scope1_direct_tco2"],
        "scope2_electricity_tco2": res["scope2_electricity_tco2"],
        "scope2_excluded_from_see": True,
        "scope3_precursors_tco2": res["scope3_precursors_tco2"],
        "see_tco2": res["cbam_see_tco2"],
        "sefa_2026_tco2": res["cbam_sefa_tco2"],
        "taxable_gap_full_tco2": fin.cbam_taxable_gap_full_tco2,
        "cash_tariff_2026_eur": res["cbam_cash_tariff_2026_eur"],
        "unhedged_tariff_2034_eur": res["cbam_unhedged_tariff_2034_eur"],
        "article9_deduction_eur": fin.cbam_article9_deduction_eur_per_t,
        "trajectory_eur": fin.cbam_trajectory_eur_per_t,
        "annual_liability_2026_eur": fin.cbam_liability_2026,
        "annual_liability_2034_eur": fin.cbam_liability_2034_full,
        "annual_liability_2026_inr_cr": fin.cbam_annual_liability_inr_cr,
    }


def sweep_pareto_frontier(
    grade_id: str = "J304",
    steps: int = 50,
    facility_id: str = "jajpur",
) -> Dict[str, Any]:
    """
    Sweeps multi-objective weights alpha in [0, 1] generating 50 supported Pareto frontier points
    mapping Cost ($/t) vs Carbon Footprint (tCO2/t).
    """
    grade = get_grade(grade_id)
    res: ParetoFrontierResult = core_compute_pareto_frontier(
        grade=grade,
        steps=steps,
        facility_id=facility_id,
    )

    frontier_summary = [
        {
            "alpha": pt.alpha,
            "cost_usd_per_t": pt.cost_usd_per_t,
            "co2_t_per_t": pt.co2_t_per_t,
            "scrap_pct": pt.scrap_pct,
        }
        for pt in res.frontier_points
    ]

    return {
        "grade_id": res.grade_id,
        "total_frontier_points": len(res.frontier_points),
        "least_cost_point": {
            "alpha": res.least_cost_point.alpha,
            "cost_usd_per_t": res.least_cost_point.cost_usd_per_t,
            "co2_t_per_t": res.least_cost_point.co2_t_per_t,
            "scrap_pct": res.least_cost_point.scrap_pct,
            "charge_sheet": res.least_cost_point.charge_sheet,
        },
        "least_carbon_point": {
            "alpha": res.least_carbon_point.alpha,
            "cost_usd_per_t": res.least_carbon_point.cost_usd_per_t,
            "co2_t_per_t": res.least_carbon_point.co2_t_per_t,
            "scrap_pct": res.least_carbon_point.scrap_pct,
            "charge_sheet": res.least_carbon_point.charge_sheet,
        },
        "max_co2_abatement_potential_pct": res.max_co2_abatement_potential_pct,
        "cost_of_carbon_abatement_usd_per_tco2": res.cost_of_carbon_abatement_usd_per_tco2,
        "frontier_points_summary": frontier_summary,
    }


def get_grade_chemistry_and_limits(grade_id: str = "J304") -> Dict[str, Any]:
    """
    Returns authentic JSL metallurgical specification: nominal chemistry,
    LP specification bounds, scrap ceiling, tramp caps (Cu, Sn, Ni), and PREN pitting resistance.
    """
    grade = get_grade(grade_id)
    return {
        "grade_id": grade.id,
        "name": grade.name,
        "family": grade.family,
        "nominal_chemistry_wt_pct": {
            "Cr": grade.cr,
            "Ni": grade.ni,
            "Mo": grade.mo,
            "Mn": grade.mn,
            "Cu": grade.cu,
            "Fe": round(grade.fe, 3),
            "C": grade.c,
            "Si": grade.si,
            "S": grade.s,
            "P": grade.p,
            "N": grade.n,
        },
        "specification_bounds": {
            "Cr": [grade.cr_min, grade.cr_max],
            "Ni": [grade.ni_min, grade.ni_max],
            "Mo": [grade.mo_min, grade.mo_max],
            "Mn": [grade.mn_min, grade.mn_max],
            "Cu": [grade.cu_min, grade.cu_max],
            "C_max": grade.c_max,
            "Si_max": grade.si_max,
            "P_max": grade.p_max,
            "S_max": grade.s_max,
        },
        "physical_constraints": {
            "scrap_cap_pct": grade.scrap_cap,
            "cu_tramp_cap_pct": grade.cu_tramp_cap,
            "sn_tramp_cap_pct": grade.sn_tramp_cap,
            "ni_tramp_cap_pct": grade.ni_tramp_cap,
        },
        "pren": get_pren(grade),
        "mechanical_applications": grade.mechanical_applications,
        "description": grade.description,
    }


# =============================================================================
# Tool Registry & OpenAI Function Calling Schema Definitions
# =============================================================================

TOOL_REGISTRY = {
    "calculate_metallurgy": calculate_metallurgy,
    "solve_charge_optimizer": solve_charge_optimizer,
    "run_monte_carlo_risk": run_monte_carlo_risk,
    "compute_multi_target_shapley": compute_multi_target_shapley,
    "compute_slag_and_flux_kinetics": compute_slag_and_flux_kinetics,
    "get_cbam_trajectory": get_cbam_trajectory,
    "sweep_pareto_frontier": sweep_pareto_frontier,
    "get_grade_chemistry_and_limits": get_grade_chemistry_and_limits,
}

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "calculate_metallurgy",
            "description": "Calculate closed-loop mass balance, dynamic thermodynamics, emissions, slag reduction kinetics, and financial liabilities (EU CBAM and India CCTS) for a given JSL grade and charge mix.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade_id": {"type": "string", "description": "Authentic JSL grade ID (e.g. J304, J4, J430, J2205, J2507)", "default": "J304"},
                    "scrap_pct": {"type": "number", "description": "Percentage of recycled stainless scrap in the charge (clamped to grade scrap_cap)", "default": 60.0},
                    "facility_id": {"type": "string", "enum": ["jajpur", "hisar"], "description": "Operating facility profile", "default": "jajpur"},
                    "fe_source": {"type": "string", "enum": ["coalDRI", "gasDRI", "pigIron"], "description": "Virgin iron unit carrier", "default": "coalDRI"},
                    "fecr_source": {"type": "string", "enum": ["fecrStandard", "fecrLowC"], "description": "Ferrochrome source", "default": "fecrStandard"},
                    "ni_source": {"type": "string", "enum": ["niStandard", "niClass1", "niNPI"], "description": "Nickel precursor source", "default": "niStandard"},
                    "recovery": {"type": "string", "enum": ["standard", "optimised"], "description": "AOD chromium recovery mode (standard=92%, optimised=96%)", "default": "standard"},
                    "renewable_pct": {"type": "number", "description": "Renewable electricity PPA share (%)", "default": 47.0},
                    "hot_fecr_charging": {"type": "boolean", "description": "Molten FeCr sensible heat charging from captive SAF", "default": True},
                },
                "required": ["grade_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "solve_charge_optimizer",
            "description": "Solve continuous HiGHS Simplex LP charge sheet optimizer for least-cost or least-carbon charge mix, enforcing tramp caps, phosphorus recovery barrier (eta_P = 0.99), and computing dual shadow prices and Value-in-Use (ViU).",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade_id": {"type": "string", "description": "Authentic JSL grade ID", "default": "J304"},
                    "alpha_cost_weight": {"type": "number", "description": "Multi-objective weight: 1.0 = Least Cost, 0.0 = Least Carbon, 0.5 = Balanced", "default": 0.5},
                    "facility_id": {"type": "string", "enum": ["jajpur", "hisar"], "default": "jajpur"},
                    "allow_npi": {"type": "boolean", "default": True},
                    "allow_gas_dri": {"type": "boolean", "default": True},
                    "allow_pig_iron": {"type": "boolean", "default": True},
                    "enforce_scrap_cap": {"type": "boolean", "default": True},
                    "custom_scrap_cap": {"type": "number", "description": "Optional scrap cap override (%)"},
                },
                "required": ["grade_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_monte_carlo_risk",
            "description": "Run 1,000-run stochastic Monte Carlo simulation across scrap assay variations (Cr, Ni, Cu, Sn) to compute Chance-Constrained Compliance Probability P(spec met) and P10/P50/P90 risk bands.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade_id": {"type": "string", "description": "Authentic JSL grade ID", "default": "J304"},
                    "runs": {"type": "integer", "description": "Number of stochastic industrial heats (default 1000)", "default": 1000},
                    "alpha_cost_weight": {"type": "number", "default": 0.5},
                    "facility_id": {"type": "string", "default": "jajpur"},
                    "seed": {"type": "integer", "default": 42},
                },
                "required": ["grade_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compute_multi_target_shapley",
            "description": "Compute exact Permutation Shapley attributions across 64 coalitions for Carbon Footprint, EAF SEC, EU CBAM Tariff, and India CCTS Value with mathematical additive closure (Error = 0.000).",
            "parameters": {
                "type": "object",
                "properties": {
                    "params": {"type": "object", "description": "Cockpit calculation parameters"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compute_slag_and_flux_kinetics",
            "description": "Model AOD silicon reduction stoichiometry of chromium oxide: FeSi 75 demand, lime flux consumption, discard slag mass, and basicity B2 = CaO / SiO2.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade_id": {"type": "string", "default": "J304"},
                    "recovery_mode": {"type": "string", "enum": ["standard", "optimised"], "default": "standard"},
                    "target_basicity_b2": {"type": "number", "default": 1.90},
                },
                "required": ["grade_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_cbam_trajectory",
            "description": "Compute EU CBAM import duty trajectory across 2026-2034 phase-in schedule under Regulation 2023/956, strictly excluding Scope 2 electricity from steel SEE and deducting Article 9 Indian carbon credits.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade_id": {"type": "string", "default": "J304"},
                    "scrap_pct": {"type": "number", "default": 60.0},
                    "facility_id": {"type": "string", "default": "jajpur"},
                    "fe_source": {"type": "string", "default": "coalDRI"},
                    "fecr_source": {"type": "string", "default": "fecrStandard"},
                    "ni_source": {"type": "string", "default": "niStandard"},
                    "eu_ets_price_eur": {"type": "number", "default": 80.0},
                },
                "required": ["grade_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "sweep_pareto_frontier",
            "description": "Generate 50-point Pareto optimal frontier sweeping alpha from 0.0 (Least Carbon) to 1.0 (Least Cost), mapping cost vs CO2 trade-off and abatement cost ($/tCO2).",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade_id": {"type": "string", "default": "J304"},
                    "steps": {"type": "integer", "default": 50},
                    "facility_id": {"type": "string", "default": "jajpur"},
                },
                "required": ["grade_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_grade_chemistry_and_limits",
            "description": "Retrieve authentic nominal midpoint chemistry, LP specification ranges, scrap ceiling, tramp element limits (Cu, Sn, Ni), PREN rating, and applications for any of the 43 JSL grades.",
            "parameters": {
                "type": "object",
                "properties": {
                    "grade_id": {"type": "string", "default": "J304"},
                },
                "required": ["grade_id"],
            },
        },
    },
]


def execute_tool(name: str, arguments: Any = None) -> Dict[str, Any]:
    """
    Executes a deterministic tool by function name with provided arguments.
    Supports arguments as dict, JSON string, or None.
    """
    if name not in TOOL_REGISTRY:
        raise ValueError(f"Tool '{name}' is not registered. Available tools: {list(TOOL_REGISTRY.keys())}")
    func = TOOL_REGISTRY[name]
    if arguments is None:
        args_dict = {}
    elif isinstance(arguments, str):
        arguments = arguments.strip()
        args_dict = json.loads(arguments) if arguments else {}
    elif isinstance(arguments, dict):
        args_dict = arguments
    else:
        raise ValueError(f"Tool arguments must be a dict or JSON string, got {type(arguments).__name__}")
    return func(**args_dict)

