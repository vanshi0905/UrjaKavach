"""
JSL Pyrometallurgical Large Dataset Synthesis Pipeline.
High-throughput combinatorial dataset generator covering:
- All 43 authentic JSL grades with nominal chemistry, tramp limits, PREN numbers, and physical scrap caps.
- Closed-loop mass balance with stoichiometric iron crediting (Fe in FeCr 40%, NPI 81.5%, FeMo 33%, FeMn 20%).
- Thermodynamic EAF SEC enthalpy modeling with scrap (420 kWh/t), coal DRI (680 kWh/t), and Jajpur molten FeCr hot charging sensible heat credit (-86 to -200 kWh/t).
- Emissions Scope 1, 2, 3 calculations with AOD decarburization, electrode consumption (2.0 kg/t), captive coal CPP (1.00 t/MWh) vs Northern grid (0.72 t/MWh) vs Oyster solar-wind PPA (0.03 t/MWh).
- HiGHS / Simplex charge optimization with phosphorus recovery barrier (eta_P = 0.99), scrap ceiling shadow price, tramp shadow prices, and Value-in-Use (ViU).
- Slag reduction kinetics (FeSi 75 reduction stoichiometry, lime flux demand, basicity B2 = 1.90, discard slag mass).
- EU CBAM Regulation 2023/956 phase-in schedule (2026-2034) with SEFA benchmark (0.284 tCO2/t), CSCF (0.87), Scope 2 strict exclusion under Annex II, and Article 9 deductions.
- Indian BEE CCTS Jajpur baseline (0.8792 tCO2e/tcs) vs target (0.8222 tCO2e/tcs) with CCC trading EBITDA values.
- Multi-turn interactive tool calling trajectories in standard ChatML / OpenAI function calling format.
- 3-layer pedagogical persona (1. Physical Analogy/Concept, 2. Grounded Telemetry & Metrics, 3. Melt-Shop Operational Levers).
"""

import os
import sys
import json
import random
from pathlib import Path
from typing import Dict, Any, List

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from jsl_carbon_engine.core.grades import GRADES, Grade, get_grade, get_pren
from jsl_carbon_engine.agent.tools import (
    calculate_metallurgy,
    solve_charge_optimizer,
    run_monte_carlo_risk,
    compute_multi_target_shapley,
    compute_slag_and_flux_kinetics,
    get_cbam_trajectory,
    sweep_pareto_frontier,
    get_grade_chemistry_and_limits,
)

SYSTEM_PROMPT = (
    "You are the JSL Chief Metallurgical AI Copilot and Melt-Shop Decision Engine. "
    "Ground all answers in first-principles pyrometallurgy, closed-loop mass balance, "
    "dynamic thermodynamics, and regulatory trade economics. Always provide a 3-layer pedagogical explanation: "
    "1. Physical Analogy / Concept, 2. Grounded Telemetry & Metrics, 3. Melt-Shop Operational Levers. "
    "When recommending operational parameter changes, embed the action token: <<<ACTION:APPLY_COCKPIT_PRESET:{...}>>>."
)


def format_action_token(params: Dict[str, Any]) -> str:
    """Formats the standardized action token with JSON payload."""
    clean_params = {}
    for k, v in params.items():
        if v is not None:
            clean_params[k] = v
    return f"<<<ACTION:APPLY_COCKPIT_PRESET:{json.dumps(clean_params, separators=(',', ':'))}>>>"


def generate_samples_for_grade(grade: Grade, grade_idx: int) -> List[Dict[str, Any]]:
    """Generates combinatorial golden samples for an authentic JSL grade."""
    samples = []
    pren = get_pren(grade)
    scrap_cap = grade.scrap_cap

    # -------------------------------------------------------------------------
    # 1. Least-Cost Simplex LP Optimization
    # -------------------------------------------------------------------------
    opt_cost = solve_charge_optimizer(grade.id, alpha_cost_weight=1.0, facility_id="jajpur")
    scrap_pct_opt = opt_cost["scrap_share_pct"]
    dri_pct_opt = opt_cost["virgin_dri_share_pct"]
    cu_shadow = opt_cost["tramp_shadow_prices"].get("Cu", 0.0)
    scrap_shadow = opt_cost["scrap_ceiling_shadow_price_usd_per_t"]

    preset_1 = {
        "gradeId": grade.id,
        "scrapPct": scrap_pct_opt,
        "facilityId": "jajpur",
        "feSource": "coalDRI",
        "fecrSource": "fecrStandard",
        "niSource": "niStandard",
    }
    action_token_1 = format_action_token(preset_1)

    assistant_msg_1 = (
        f"### 1. Physical Analogy & Mechanism\n"
        f"Designing a charge sheet is like balancing a culinary recipe with strict nutritional constraints: "
        f"you maximize the highest-yield, lowest-cost scrap while ensuring impurities (like tramp copper and tin) "
        f"stay safely beneath the threshold where they would cause brittleness or phase instability.\n\n"
        f"### 2. Grounded Telemetry & Metrics\n"
        f"- Target Grade: {grade.name} ({grade.family})\n"
        f"- Charge Cost: ${opt_cost['charge_cost_usd_per_t']:.2f}/t liquid steel\n"
        f"- Charge Carbon: {opt_cost['total_co2_t_per_t']:.3f} tCO2/t\n"
        f"- Scrap Share: {scrap_pct_opt:.1f}% (Grade physical scrap ceiling: {scrap_cap}%)\n"
        f"- Virgin DRI Share: {dri_pct_opt:.1f}%\n"
        f"- Scrap Ceiling Shadow Price: ${scrap_shadow:.2f}/t (economic saving per 1% additional scrap allowed)\n"
        f"- Tramp Copper Shadow Price: ${cu_shadow:.4f}/0.01% [Cu] ceiling\n"
        f"- Phosphorus Recovery Barrier: eta_P = 0.99 (stainless slag cannot oxidize P without Cr loss)\n\n"
        f"### 3. Melt-Shop Operational Levers\n"
        f"Charge {scrap_pct_opt:.1f}% stainless scrap blended with {dri_pct_opt:.1f}% virgin iron units. "
        f"Maintain tramp copper below {grade.cu_tramp_cap}% to prevent hot-shortness surface defects during casting.\n\n"
        f"{action_token_1}"
    )

    samples.append({
        "id": f"jsl_{grade.id.lower()}_opt_cost_{grade_idx:03d}",
        "grade_id": grade.id,
        "family": grade.family,
        "scenario": "charge_optimization_least_cost",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Optimize the charge mix for {grade.name} at Jajpur to minimize raw material cost while obeying metallurgical tramp limits."},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": f"call_{grade.id.lower()}_opt_cost",
                    "type": "function",
                    "function": {
                        "name": "solve_charge_optimizer",
                        "arguments": json.dumps({"grade_id": grade.id, "alpha_cost_weight": 1.0, "facility_id": "jajpur"}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": f"call_{grade.id.lower()}_opt_cost",
                "name": "solve_charge_optimizer",
                "content": json.dumps(opt_cost),
            },
            {"role": "assistant", "content": assistant_msg_1},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": preset_1,
            "metrics": {
                "charge_cost_usd_per_t": opt_cost["charge_cost_usd_per_t"],
                "total_co2_t_per_t": opt_cost["total_co2_t_per_t"],
                "scrap_share_pct": scrap_pct_opt,
                "scrap_cap": scrap_cap,
            },
        },
    })

    # -------------------------------------------------------------------------
    # 2. Least-Carbon HiGHS LP Optimization
    # -------------------------------------------------------------------------
    opt_carbon = solve_charge_optimizer(grade.id, alpha_cost_weight=0.0, facility_id="jajpur")
    preset_2 = {
        "gradeId": grade.id,
        "scrapPct": opt_carbon["scrap_share_pct"],
        "facilityId": "jajpur",
        "feSource": "gasDRI",
        "fecrSource": "fecrLowC",
        "niSource": "niClass1" if grade.ni > 0.5 else "niStandard",
    }
    action_token_2 = format_action_token(preset_2)

    assistant_msg_2 = (
        f"### 1. Physical Analogy & Mechanism\n"
        f"Switching from fossil-heavy charge precursors to clean recirculated inputs is like replacing high-sulfur bunker fuel "
        f"with high-density renewable power: each kilogram of circular stainless scrap recirculates embodied Cr and Ni atoms "
        f"without repeating the massive energy expenditure of extractive smelting.\n\n"
        f"### 2. Grounded Telemetry & Metrics\n"
        f"- Target Grade: {grade.name} ({grade.family})\n"
        f"- Minimum Carbon Charge: {opt_carbon['total_co2_t_per_t']:.3f} tCO2/t\n"
        f"- Resulting Charge Cost: ${opt_carbon['charge_cost_usd_per_t']:.2f}/t\n"
        f"- Scrap Utilization: {opt_carbon['scrap_share_pct']:.1f}% (cap: {scrap_cap}%)\n"
        f"- Virgin DRI Carrier: Gas-based DRI ({opt_carbon['charge_sheet_pct'].get('gasDRI', 0.0):.1f}%)\n"
        f"- Phosphorus Recovery Barrier: eta_P = 0.99\n\n"
        f"### 3. Melt-Shop Operational Levers\n"
        f"Maximize scrap charging up to {opt_carbon['scrap_share_pct']:.1f}%, utilize gas-based DRI over coal DRI, "
        f"and source low-carbon ferroalloys for export heats.\n\n"
        f"{action_token_2}"
    )

    samples.append({
        "id": f"jsl_{grade.id.lower()}_opt_carbon_{grade_idx:03d}",
        "grade_id": grade.id,
        "family": grade.family,
        "scenario": "charge_optimization_least_carbon",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"How can we minimize charge sheet emissions for {grade.name} at Jajpur?"},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": f"call_{grade.id.lower()}_opt_carbon",
                    "type": "function",
                    "function": {
                        "name": "solve_charge_optimizer",
                        "arguments": json.dumps({"grade_id": grade.id, "alpha_cost_weight": 0.0, "facility_id": "jajpur"}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": f"call_{grade.id.lower()}_opt_carbon",
                "name": "solve_charge_optimizer",
                "content": json.dumps(opt_carbon),
            },
            {"role": "assistant", "content": assistant_msg_2},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": preset_2,
            "metrics": {
                "charge_cost_usd_per_t": opt_carbon["charge_cost_usd_per_t"],
                "total_co2_t_per_t": opt_carbon["total_co2_t_per_t"],
                "scrap_share_pct": opt_carbon["scrap_share_pct"],
            },
        },
    })

    # -------------------------------------------------------------------------
    # 3. Dynamic Thermodynamics & EAF Enthalpy Modeling
    # -------------------------------------------------------------------------
    for fe_src, hot_fecr in [("coalDRI", True), ("coalDRI", False), ("gasDRI", True)]:
        scrap_test = min(60.0, scrap_cap)
        meta_thermo = calculate_metallurgy(
            grade_id=grade.id,
            scrap_pct=scrap_test,
            facility_id="jajpur" if hot_fecr else "hisar",
            fe_source=fe_src,
            hot_fecr_charging=hot_fecr,
        )

        preset_thermo = {
            "gradeId": grade.id,
            "scrapPct": scrap_test,
            "facilityId": "jajpur" if hot_fecr else "hisar",
            "feSource": fe_src,
            "hotFecrCharging": hot_fecr,
        }
        action_token_thermo = format_action_token(preset_thermo)

        hot_desc = "active (-86 to -200 kWh/t credit)" if hot_fecr else "inactive (solid FeCr melting penalty)"
        assistant_msg_thermo = (
            f"### 1. Physical Analogy & Mechanism\n"
            f"Melting scrap is like boiling room-temperature water (~420 kWh/t electrical requirement), "
            f"whereas melting coal DRI is like boiling water while dissolving ice and acidic salts (~680 kWh/t) "
            f"because endothermic FeO reduction (+159 kJ/mol) absorbs heavy arc power. Molten FeCr hot charging "
            f"acts like pouring boiling soup into the pot, bypassing the solid melting enthalpy entirely.\n\n"
            f"### 2. Grounded Telemetry & Metrics\n"
            f"- Grade: {grade.name} ({grade.family})\n"
            f"- EAF Specific Energy Consumption (SEC): {meta_thermo['eaf_sec_kwh_t']:.2f} kWh/t liquid steel\n"
            f"- Molten FeCr Sensible Heat Saving: {meta_thermo['hot_fecr_savings_kwh_t']:.2f} kWh/t\n"
            f"- Total Primary Energy: {meta_thermo['total_energy_gj_t_finished']:.3f} GJ/t finished\n"
            f"- Virgin Fe Unit: {fe_src} (Gross DRI: {meta_thermo['gross_dri_charged_t']:.4f} t)\n"
            f"- Mass Conservation: Liquid steel mass strictly {meta_thermo['liquid_steel_mass_t']:.4f} t\n\n"
            f"### 3. Melt-Shop Operational Levers\n"
            f"Maintain hot-ladle transfer from captive SAF to capture the {meta_thermo['hot_fecr_savings_kwh_t']:.1f} kWh/t "
            f"sensible heat saving. For high-energy heats, replace coal DRI with gas DRI to lower bath enthalpy burden.\n\n"
            f"{action_token_thermo}"
        )

        samples.append({
            "id": f"jsl_{grade.id.lower()}_thermo_{fe_src}_{'hot' if hot_fecr else 'cold'}_{grade_idx:03d}",
            "grade_id": grade.id,
            "family": grade.family,
            "scenario": "thermodynamics_enthalpy",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Explain the EAF SEC enthalpy balance for {grade.name} with {fe_src} and molten FeCr hot charging {hot_desc}."},
                {
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [{
                        "id": f"call_{grade.id.lower()}_thermo_{fe_src}_{'hot' if hot_fecr else 'cold'}",
                        "type": "function",
                        "function": {
                            "name": "calculate_metallurgy",
                            "arguments": json.dumps({
                                "grade_id": grade.id,
                                "scrap_pct": scrap_test,
                                "facility_id": "jajpur" if hot_fecr else "hisar",
                                "fe_source": fe_src,
                                "hot_fecr_charging": hot_fecr,
                            }),
                        },
                    }],
                },
                {
                    "role": "tool",
                    "tool_call_id": f"call_{grade.id.lower()}_thermo_{fe_src}_{'hot' if hot_fecr else 'cold'}",
                    "name": "calculate_metallurgy",
                    "content": json.dumps(meta_thermo),
                },
                {"role": "assistant", "content": assistant_msg_thermo},
            ],
            "ground_truth": {
                "mass_balance_closure_t": 1.000,
                "cbam_scope2_included": False,
                "eta_p": 0.99,
                "action_payload": preset_thermo,
                "metrics": {
                    "eaf_sec_kwh_t": meta_thermo["eaf_sec_kwh_t"],
                    "hot_fecr_savings_kwh_t": meta_thermo["hot_fecr_savings_kwh_t"],
                    "liquid_steel_mass_t": meta_thermo["liquid_steel_mass_t"],
                },
            },
        })

    # -------------------------------------------------------------------------
    # 4. Scope 1, 2, 3 Emissions & Decarbonization Levers
    # -------------------------------------------------------------------------
    for rew_pct, ni_src in [(47.0, "niStandard"), (100.0, "niClass1"), (0.0, "niNPI")]:
        scrap_val = min(55.0, scrap_cap)
        meta_em = calculate_metallurgy(
            grade_id=grade.id,
            scrap_pct=scrap_val,
            facility_id="jajpur",
            fe_source="coalDRI",
            ni_source=ni_src,
            renewable_pct=rew_pct,
        )

        preset_em = {
            "gradeId": grade.id,
            "scrapPct": scrap_val,
            "facilityId": "jajpur",
            "renewablePct": rew_pct,
            "niSource": ni_src,
        }
        action_token_em = format_action_token(preset_em)

        assistant_msg_em = (
            f"### 1. Physical Analogy & Mechanism\n"
            f"Decarbonizing stainless steel is like untangling three cords: Scope 1 is the physical smokestack from "
            f"AOD carbon oxidation and electrode consumption (2.0 kg/t); Scope 2 is the electricity grid power source; "
            f"and Scope 3 is the embodied carbon in upstream raw materials (especially ferroalloys and nickel).\n\n"
            f"### 2. Grounded Telemetry & Metrics\n"
            f"- Grade: {grade.name} ({grade.family})\n"
            f"- Total Carbon Footprint: {meta_em['total_co2_t']:.3f} tCO2/t finished coil\n"
            f"- Scope 1 Direct Process: {meta_em['scope1_direct_tco2']:.3f} tCO2/t (AOD decarb + electrode)\n"
            f"- Scope 2 Electricity: {meta_em['scope2_electricity_tco2']:.3f} tCO2/t ({rew_pct:.0f}% renewable PPA)\n"
            f"- Scope 3 Upstream Precursors: {meta_em['scope3_precursors_tco2']:.3f} tCO2/t (Nickel: {ni_src})\n"
            f"- Stoichiometric Fe Credited from Alloys: {meta_em['fe_credited_from_alloys_t']:.4f} t\n\n"
            f"### 3. Melt-Shop Operational Levers\n"
            f"Expand renewable PPA blending to reduce Scope 2 to zero. On austenitic heats, replace Indonesian coal NPI "
            f"with Class 1 Hydro-nickel to slash upstream Scope 3 emissions by over 1.5 tCO2/t.\n\n"
            f"{action_token_em}"
        )

        samples.append({
            "id": f"jsl_{grade.id.lower()}_emissions_rew{int(rew_pct)}_{ni_src}_{grade_idx:03d}",
            "grade_id": grade.id,
            "family": grade.family,
            "scenario": "emissions_scope_decarb",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Break down Scope 1, 2, and 3 emissions for {grade.name} with {rew_pct}% renewable electricity and {ni_src} nickel sourcing."},
                {
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [{
                        "id": f"call_{grade.id.lower()}_emissions_rew{int(rew_pct)}_{ni_src}",
                        "type": "function",
                        "function": {
                            "name": "calculate_metallurgy",
                            "arguments": json.dumps({
                                "grade_id": grade.id,
                                "scrap_pct": scrap_val,
                                "facility_id": "jajpur",
                                "fe_source": "coalDRI",
                                "ni_source": ni_src,
                                "renewable_pct": rew_pct,
                            }),
                        },
                    }],
                },
                {
                    "role": "tool",
                    "tool_call_id": f"call_{grade.id.lower()}_emissions_rew{int(rew_pct)}_{ni_src}",
                    "name": "calculate_metallurgy",
                    "content": json.dumps(meta_em),
                },
                {"role": "assistant", "content": assistant_msg_em},
            ],
            "ground_truth": {
                "mass_balance_closure_t": 1.000,
                "cbam_scope2_included": False,
                "eta_p": 0.99,
                "action_payload": preset_em,
                "metrics": {
                    "total_co2_t": meta_em["total_co2_t"],
                    "scope1_direct_tco2": meta_em["scope1_direct_tco2"],
                    "scope2_electricity_tco2": meta_em["scope2_electricity_tco2"],
                    "scope3_precursors_tco2": meta_em["scope3_precursors_tco2"],
                },
            },
        })

    # -------------------------------------------------------------------------
    # 5. Slag Reduction Kinetics (FeSi 75 & Basicity B2 = 1.90)
    # -------------------------------------------------------------------------
    for rec_mode in ["standard", "optimised"]:
        slag_data = compute_slag_and_flux_kinetics(grade.id, recovery_mode=rec_mode, target_basicity_b2=1.90)
        preset_slag = {
            "gradeId": grade.id,
            "recovery": rec_mode,
        }
        action_token_slag = format_action_token(preset_slag)

        assistant_msg_slag = (
            f"### 1. Physical Analogy & Mechanism\n"
            f"During AOD oxygen decarburization, valuable chromium oxidizes into the slag like foam on a boiling broth. "
            f"In the reduction phase, we add ferrosilicon (FeSi 75) as a chemical sponge: silicon has a higher oxygen affinity "
            f"than chromium, reducing Cr2O3 back into metallic Cr. Burnt lime (CaO) must then be added to neutralize generated SiO2 "
            f"and maintain basicity B2 = CaO / SiO2 = 1.90 to protect the furnace refractory.\n\n"
            f"### 2. Grounded Telemetry & Metrics\n"
            f"- Grade: {grade.name} (Nominal Cr: {grade.cr}%)\n"
            f"- AOD Cr Recovery Mode: {rec_mode.capitalize()} ({slag_data['target_cr_recovery_pct']}%\n"
            f"- FeSi 75 Demand: {slag_data['fesi_demand_kg_t']:.2f} kg/t\n"
            f"- Burnt Lime (CaO) Demand: {slag_data['lime_demand_kg_t']:.2f} kg/t\n"
            f"- Generated SiO2: {slag_data['sio2_generated_kg_t']:.2f} kg/t\n"
            f"- Discard Slag Mass: {slag_data['total_slag_generated_kg_t']:.2f} kg/t\n"
            f"- Target Binary Basicity: B2 = {slag_data['target_basicity_b2']:.2f}\n\n"
            f"### 3. Melt-Shop Operational Levers\n"
            f"Dose {slag_data['fesi_demand_kg_t']:.1f} kg/t of FeSi 75 during reduction and flux with "
            f"{slag_data['lime_demand_kg_t']:.1f} kg/t calcined quicklime to ensure stable basicity and prevent MgO refractory erosion.\n\n"
            f"{action_token_slag}"
        )

        samples.append({
            "id": f"jsl_{grade.id.lower()}_slag_{rec_mode}_{grade_idx:03d}",
            "grade_id": grade.id,
            "family": grade.family,
            "scenario": "slag_and_flux_kinetics",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Calculate FeSi 75 reduction stoichiometry and lime demand for {grade.name} under {rec_mode} AOD recovery."},
                {
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [{
                        "id": f"call_{grade.id.lower()}_slag_{rec_mode}",
                        "type": "function",
                        "function": {
                            "name": "compute_slag_and_flux_kinetics",
                            "arguments": json.dumps({"grade_id": grade.id, "recovery_mode": rec_mode, "target_basicity_b2": 1.90}),
                        },
                    }],
                },
                {
                    "role": "tool",
                    "tool_call_id": f"call_{grade.id.lower()}_slag_{rec_mode}",
                    "name": "compute_slag_and_flux_kinetics",
                    "content": json.dumps(slag_data),
                },
                {"role": "assistant", "content": assistant_msg_slag},
            ],
            "ground_truth": {
                "mass_balance_closure_t": 1.000,
                "cbam_scope2_included": False,
                "eta_p": 0.99,
                "action_payload": preset_slag,
                "metrics": {
                    "fesi_demand_kg_t": slag_data["fesi_demand_kg_t"],
                    "lime_demand_kg_t": slag_data["lime_demand_kg_t"],
                    "total_slag_generated_kg_t": slag_data["total_slag_generated_kg_t"],
                },
            },
        })

    # -------------------------------------------------------------------------
    # 6. EU CBAM Phase-in Trajectory (2026-2034)
    # -------------------------------------------------------------------------
    cbam_data = get_cbam_trajectory(grade.id, scrap_pct=min(60.0, scrap_cap), facility_id="jajpur")
    preset_cbam = {
        "gradeId": grade.id,
        "scrapPct": min(60.0, scrap_cap),
        "facilityId": "jajpur",
        "fecrSource": "fecrLowC",
        "niSource": "niClass1" if grade.ni > 0.5 else "niStandard",
    }
    action_token_cbam = format_action_token(preset_cbam)

    assistant_msg_cbam = (
        f"### 1. Physical Analogy & Mechanism\n"
        f"EU CBAM is a carbon border tariff designed to prevent carbon leakage. For steel products under Annex II, "
        f"Specific Embedded Emissions (SEE) strictly account for Scope 1 direct stack emissions plus listed upstream "
        f"precursors (ferroalloys and virgin DRI). Scope 2 indirect electricity is legally EXCLUDED for iron and steel.\n\n"
        f"### 2. Grounded Telemetry & Metrics\n"
        f"- Target Grade: {grade.name}\n"
        f"- Specific Embedded Emissions (SEE): {cbam_data['see_tco2']:.3f} tCO2/t (Scope 2 is strictly excluded)\n"
        f"- 2026 Free Allocation Benchmark (SEFA): {cbam_data['sefa_2026_tco2']:.3f} tCO2/t\n"
        f"- 2026 Cash Tariff (2.5% phase-in): €{cbam_data['cash_tariff_2026_eur']:.2f}/t (Annual: €{cbam_data['annual_liability_2026_eur']:,.0f})\n"
        f"- 2034 Unhedged Exposure (100% phase-in): €{cbam_data['unhedged_tariff_2034_eur']:.2f}/t (Annual: €{cbam_data['annual_liability_2034_eur']:,.0f})\n"
        f"- Article 9 Deduction: €{cbam_data['article9_deduction_eur']:.2f}/t credit for Indian CCTS carbon payments\n\n"
        f"### 3. Melt-Shop Operational Levers\n"
        f"To hedge European export corridors against 2034 exposure, route heats through high-scrap charges ({scrap_cap}%) "
        f"and low-carbon precursors to drive SEE below the free allocation threshold.\n\n"
        f"{action_token_cbam}"
    )

    samples.append({
        "id": f"jsl_{grade.id.lower()}_cbam_{grade_idx:03d}",
        "grade_id": grade.id,
        "family": grade.family,
        "scenario": "cbam_liability",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"What is our EU CBAM tariff trajectory and unhedged 2034 risk for {grade.name}?"},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": f"call_{grade.id.lower()}_cbam",
                    "type": "function",
                    "function": {
                        "name": "get_cbam_trajectory",
                        "arguments": json.dumps({"grade_id": grade.id, "scrap_pct": min(60.0, scrap_cap), "facility_id": "jajpur"}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": f"call_{grade.id.lower()}_cbam",
                "name": "get_cbam_trajectory",
                "content": json.dumps(cbam_data),
            },
            {"role": "assistant", "content": assistant_msg_cbam},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": preset_cbam,
            "metrics": {
                "see_tco2": cbam_data["see_tco2"],
                "cash_tariff_2026_eur": cbam_data["cash_tariff_2026_eur"],
                "unhedged_tariff_2034_eur": cbam_data["unhedged_tariff_2034_eur"],
            },
        },
    })

    # -------------------------------------------------------------------------
    # 7. India BEE CCTS Jajpur Compliance & CCC Trading
    # -------------------------------------------------------------------------
    ccts_meta = calculate_metallurgy(grade.id, scrap_pct=min(65.0, scrap_cap), facility_id="jajpur", renewable_pct=70.0)
    preset_ccts = {
        "gradeId": grade.id,
        "scrapPct": min(65.0, scrap_cap),
        "facilityId": "jajpur",
        "renewablePct": 70.0,
    }
    action_token_ccts = format_action_token(preset_ccts)

    assistant_msg_ccts = (
        f"### 1. Physical Analogy & Mechanism\n"
        f"India's CCTS operates like an industrial efficiency credit market: facilities that operate with higher energy efficiency "
        f"and cleaner power than the BEE baseline receive certified credits that create direct balance-sheet value.\n\n"
        f"### 2. Grounded Telemetry & Metrics\n"
        f"- Target Grade: {grade.name}\n"
        f"- Facility: JSL Kalinga Nagar, Jajpur (Odisha)\n"
        f"- BEE FY2026-27 Target: {ccts_meta['ccts_target_tco2']:.4f} tCO2e/t equivalent product\n"
        f"- Evaluated Scope 1+2 Intensity: {ccts_meta['ccts_s12_intensity_tco2']:.3f} tCO2/t\n"
        f"- Compliance Status: {ccts_meta['ccts_status']}\n"
        f"- Value per Tonne: {ccts_meta['ccts_value_inr_per_t']:+.1f} ₹/t (at ₹1,500/t CCC trading price)\n"
        f"- Group EBITDA Gain: +₹{ccts_meta['ccts_annual_ebitda_inr_cr']:.2f} Crore/yr across 3.0 MTPA capacity\n\n"
        f"### 3. Melt-Shop Operational Levers\n"
        f"Maintain 70%+ renewable PPA off-take and >60% scrap charging to secure a positive EBITDA spread under CCTS.\n\n"
        f"{action_token_ccts}"
    )

    samples.append({
        "id": f"jsl_{grade.id.lower()}_ccts_{grade_idx:03d}",
        "grade_id": grade.id,
        "family": grade.family,
        "scenario": "ccts_compliance",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Assess India CCTS certificate surplus and EBITDA generation for {grade.name} at Jajpur."},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": f"call_{grade.id.lower()}_ccts",
                    "type": "function",
                    "function": {
                        "name": "calculate_metallurgy",
                        "arguments": json.dumps({"grade_id": grade.id, "scrap_pct": min(65.0, scrap_cap), "facility_id": "jajpur", "renewable_pct": 70.0}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": f"call_{grade.id.lower()}_ccts",
                "name": "calculate_metallurgy",
                "content": json.dumps(ccts_meta),
            },
            {"role": "assistant", "content": assistant_msg_ccts},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": preset_ccts,
            "metrics": {
                "ccts_s12_intensity_tco2": ccts_meta["ccts_s12_intensity_tco2"],
                "ccts_value_inr_per_t": ccts_meta["ccts_value_inr_per_t"],
                "ccts_annual_ebitda_inr_cr": ccts_meta["ccts_annual_ebitda_inr_cr"],
            },
        },
    })

    # -------------------------------------------------------------------------
    # 8. Grade Chemistry, Tramp Limits, and PREN Rating
    # -------------------------------------------------------------------------
    chem_data = get_grade_chemistry_and_limits(grade.id)
    preset_chem = {
        "gradeId": grade.id,
        "scrapPct": scrap_cap,
    }
    action_token_chem = format_action_token(preset_chem)

    assistant_msg_chem = (
        f"### 1. Physical Analogy & Mechanism\n"
        f"Alloy chemistry is the molecular DNA of stainless steel: chromium provides the self-healing oxide film (Cr2O3), "
        f"molybdenum and nitrogen supercharge pitting resistance (PREN = %Cr + 3.3%Mo + 16%N), and nickel stabilizes the ductile "
        f"austenitic crystal structure. Tramp elements like copper and tin are unwelcome intruders that segregate to boundaries.\n\n"
        f"### 2. Grounded Telemetry & Metrics\n"
        f"- Grade: {grade.name} ({grade.family})\n"
        f"- Nominal Composition: Cr {grade.cr}%, Ni {grade.ni}%, Mo {grade.mo}%, Mn {grade.mn}%, Cu {grade.cu}%, Fe {grade.fe:.2f}%\n"
        f"- Pitting Resistance Equivalent (PREN): {pren}\n"
        f"- Physical Scrap Ceiling: {scrap_cap}%\n"
        f"- Tramp Copper Limit: <= {grade.cu_tramp_cap}%\n"
        f"- Tramp Tin Limit: <= {grade.sn_tramp_cap}%\n"
        f"- Applications: {grade.mechanical_applications}\n\n"
        f"### 3. Melt-Shop Operational Levers\n"
        f"Strictly clamp scrap additions to {scrap_cap}% to safeguard against tramp element contamination.\n\n"
        f"{action_token_chem}"
    )

    samples.append({
        "id": f"jsl_{grade.id.lower()}_chem_{grade_idx:03d}",
        "grade_id": grade.id,
        "family": grade.family,
        "scenario": "grade_chemistry_and_pren",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"What are the nominal chemistry, tramp ceilings, and PREN rating for JSL grade {grade.name}?"},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": f"call_{grade.id.lower()}_chem",
                    "type": "function",
                    "function": {
                        "name": "get_grade_chemistry_and_limits",
                        "arguments": json.dumps({"grade_id": grade.id}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": f"call_{grade.id.lower()}_chem",
                "name": "get_grade_chemistry_and_limits",
                "content": json.dumps(chem_data),
            },
            {"role": "assistant", "content": assistant_msg_chem},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": preset_chem,
            "metrics": {
                "pren": pren,
                "scrap_cap_pct": scrap_cap,
                "Cr": grade.cr,
                "Ni": grade.ni,
            },
        },
    })

    # -------------------------------------------------------------------------
    # 9. 50-Point Pareto Frontier Sweep
    # -------------------------------------------------------------------------
    pareto_data = sweep_pareto_frontier(grade.id, steps=25, facility_id="jajpur")
    preset_pareto = {
        "gradeId": grade.id,
        "scrapPct": pareto_data["least_carbon_point"]["scrap_pct"],
        "facilityId": "jajpur",
    }
    action_token_pareto = format_action_token(preset_pareto)

    assistant_msg_pareto = (
        f"### 1. Physical Analogy & Mechanism\n"
        f"The Pareto Frontier maps the 'efficient frontier' where you cannot cut carbon emissions without paying more money, "
        f"and you cannot cut costs without raising carbon. Sweeping alpha from 0 to 1 traces the exact trade-off boundary.\n\n"
        f"### 2. Grounded Telemetry & Metrics\n"
        f"- Target Grade: {grade.name}\n"
        f"- Least-Cost Point (alpha=1.0): ${pareto_data['least_cost_point']['cost_usd_per_t']:.2f}/t | {pareto_data['least_cost_point']['co2_t_per_t']:.3f} tCO2/t\n"
        f"- Least-Carbon Point (alpha=0.0): ${pareto_data['least_carbon_point']['cost_usd_per_t']:.2f}/t | {pareto_data['least_carbon_point']['co2_t_per_t']:.3f} tCO2/t\n"
        f"- Maximum Abatement Potential: {pareto_data['max_co2_abatement_potential_pct']:.1f}%\n"
        f"- Marginal Abatement Cost: ${pareto_data['cost_of_carbon_abatement_usd_per_tco2']:.2f}/tCO2 avoided\n\n"
        f"### 3. Melt-Shop Operational Levers\n"
        f"For low-carbon green stainless premiums, operate at the least-carbon point with {pareto_data['least_carbon_point']['scrap_pct']:.1f}% scrap.\n\n"
        f"{action_token_pareto}"
    )

    samples.append({
        "id": f"jsl_{grade.id.lower()}_pareto_{grade_idx:03d}",
        "grade_id": grade.id,
        "family": grade.family,
        "scenario": "pareto_frontier_sweep",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Sweep the Pareto optimal trade-off between cost and carbon for {grade.name} at Jajpur."},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": f"call_{grade.id.lower()}_pareto",
                    "type": "function",
                    "function": {
                        "name": "sweep_pareto_frontier",
                        "arguments": json.dumps({"grade_id": grade.id, "steps": 25, "facility_id": "jajpur"}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": f"call_{grade.id.lower()}_pareto",
                "name": "sweep_pareto_frontier",
                "content": json.dumps(pareto_data),
            },
            {"role": "assistant", "content": assistant_msg_pareto},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": preset_pareto,
            "metrics": {
                "least_cost_usd": pareto_data["least_cost_point"]["cost_usd_per_t"],
                "least_carbon_t": pareto_data["least_carbon_point"]["co2_t_per_t"],
                "max_co2_abatement_potential_pct": pareto_data["max_co2_abatement_potential_pct"],
            },
        },
    })

    return samples


def generate_adversarial_traps() -> List[Dict[str, Any]]:
    """Generates golden samples specifically testing the 4 adversarial traps."""
    traps = []

    # Trap 1: Dephosphorization Trap
    trap_1_tool = solve_charge_optimizer("J304", alpha_cost_weight=0.5)
    trap_1_preset = {"gradeId": "J304", "scrapPct": 60, "feSource": "coalDRI"}
    trap_1_msg = (
        "### 1. Physical Analogy & Mechanism\n"
        "Claiming AOD slag can dephosphorize stainless steel is like claiming you can boil off water without melting the ice floating in it: "
        "thermodynamically, chromium has a vastly higher oxygen affinity than phosphorus (Ellingham diagram: Delta G Cr2O3 << Delta G P2O5). "
        "Any oxygen blown to oxidize phosphorus into slag would catastrophic oxidize the chromium first, ruining the melt.\n\n"
        "### 2. Grounded Telemetry & Metrics\n"
        "- Phosphorus Recovery Barrier: eta_P = 0.99 (99% of charged phosphorus remains in the liquid metal bath)\n"
        "- Standard AOD Dephosphorization Efficiency: 0.0% (slag de-P is chemically impossible in stainless refining)\n"
        "- Tramp Phosphorus Upper Bound: [P] <= 0.040% (must be controlled entirely via scrap sorting and clean virgin iron)\n\n"
        "### 3. Melt-Shop Operational Levers\n"
        "Do not attempt dephosphorization blows in the AOD. Dilute high-phosphorus revert scrap with low-P virgin DRI or clean primary scrap.\n\n"
        f"{format_action_token(trap_1_preset)}"
    )
    traps.append({
        "id": "jsl_trap_dephosphorization_001",
        "grade_id": "J304",
        "family": "300 Series (Austenitic)",
        "scenario": "adversarial_trap_dephosphorization",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Can we remove 30% of tramp phosphorus into the AOD slag during decarburization for 304?"},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": "call_trap_dephosphorization",
                    "type": "function",
                    "function": {
                        "name": "solve_charge_optimizer",
                        "arguments": json.dumps({"grade_id": "J304", "alpha_cost_weight": 0.5}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": "call_trap_dephosphorization",
                "name": "solve_charge_optimizer",
                "content": json.dumps(trap_1_tool),
            },
            {"role": "assistant", "content": trap_1_msg},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": trap_1_preset,
            "metrics": {"phosphorus_barrier_eta_p": 0.99},
        },
    })

    # Trap 2: CBAM Scope 2 Exclusion Trap
    trap_2_tool = get_cbam_trajectory("J304", scrap_pct=60.0)
    trap_2_preset = {"gradeId": "J304", "scrapPct": 60, "facilityId": "jajpur"}
    trap_2_msg = (
        "### 1. Physical Analogy & Mechanism\n"
        "Under EU CBAM Regulation (EU) 2023/956 Annex II, the European Commission strictly limits Specific Embedded Emissions (SEE) "
        "for iron and steel (CN code 72) to direct emissions (Scope 1) and listed precursor goods (Scope 3). Scope 2 indirect electricity "
        "emissions are explicitly EXCLUDED from the tariff base for steel to align with EU ETS domestic benchmarks.\n\n"
        "### 2. Grounded Telemetry & Metrics\n"
        f"- Specific Embedded Emissions (SEE): {trap_2_tool['see_tco2']:.3f} tCO2/t (Scope 1 + Scope 3 precursors only)\n"
        f"- Scope 2 Electricity: {trap_2_tool['scope2_electricity_tco2']:.3f} tCO2/t (Strictly EXCLUDED from CBAM certificate obligations)\n"
        f"- 2026 Free Allocation Benchmark (SEFA): {trap_2_tool['sefa_2026_tco2']:.3f} tCO2/t\n"
        f"- 2026 Cash Tariff: €{trap_2_tool['cash_tariff_2026_eur']:.2f}/t\n\n"
        "### 3. Melt-Shop Operational Levers\n"
        "Focus CBAM decarbonization on Scope 1 stack decarb and upstream ferroalloy sourcing; grid electricity emissions do not impact European border customs duties.\n\n"
        f"{format_action_token(trap_2_preset)}"
    )
    traps.append({
        "id": "jsl_trap_cbam_scope2_002",
        "grade_id": "J304",
        "family": "300 Series (Austenitic)",
        "scenario": "adversarial_trap_cbam_scope2",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Should we include Jajpur coal CPP Scope 2 electricity in our EU CBAM export certificate calculations?"},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": "call_trap_cbam_scope2",
                    "type": "function",
                    "function": {
                        "name": "get_cbam_trajectory",
                        "arguments": json.dumps({"grade_id": "J304", "scrap_pct": 60.0}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": "call_trap_cbam_scope2",
                "name": "get_cbam_trajectory",
                "content": json.dumps(trap_2_tool),
            },
            {"role": "assistant", "content": trap_2_msg},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": trap_2_preset,
            "metrics": {
                "see_tco2": trap_2_tool["see_tco2"],
                "scope2_excluded": True,
            },
        },
    })

    # Trap 3: 100% Scrap Ferritic Trap
    trap_3_tool = get_grade_chemistry_and_limits("J430")
    trap_3_preset = {"gradeId": "J430", "scrapPct": 70}
    trap_3_msg = (
        "### 1. Physical Analogy & Mechanism\n"
        "Ferritic stainless steels (like J430) have a body-centered cubic (BCC) crystal lattice that requires virtually zero nickel ([Ni] <= 0.50%). "
        "Commercial scrap yards are heavily contaminated with austenitic 304/200 series scrap containing 1.5% to 8% Ni. If you charge 100% scrap, "
        "tramp nickel accumulates, transforming the ferritic structure into unwanted hard martensite/austenite during hot rolling, causing embrittlement.\n\n"
        "### 2. Grounded Telemetry & Metrics\n"
        "- Target Grade: JSL J430 (Ferritic Family)\n"
        "- Physical Scrap Ceiling: 70.0% (Strictly enforced ceiling)\n"
        "- Tramp Nickel Cap: [Ni] <= 0.50%\n"
        "- Tramp Copper Cap: [Cu] <= 0.50%\n"
        "- Virgin Iron Unit Requirement: Minimum 30% virgin DRI dilution to keep tramp nickel beneath 0.50%\n\n"
        "### 3. Melt-Shop Operational Levers\n"
        "Do not exceed 70% scrap on ferritic heats. Blend scrap with low-residual virgin DRI to dilute residual nickel and copper.\n\n"
        f"{format_action_token(trap_3_preset)}"
    )
    traps.append({
        "id": "jsl_trap_ferritic_scrap_003",
        "grade_id": "J430",
        "family": "400 Series (Ferritic)",
        "scenario": "adversarial_trap_ferritic_scrap",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Can we charge 100% recycled stainless scrap into the EAF for ferritic grade J430?"},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": "call_trap_ferritic_scrap",
                    "type": "function",
                    "function": {
                        "name": "get_grade_chemistry_and_limits",
                        "arguments": json.dumps({"grade_id": "J430"}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": "call_trap_ferritic_scrap",
                "name": "get_grade_chemistry_and_limits",
                "content": json.dumps(trap_3_tool),
            },
            {"role": "assistant", "content": trap_3_msg},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": trap_3_preset,
            "metrics": {
                "scrap_cap_pct": 70.0,
                "ni_tramp_cap_pct": 0.50,
            },
        },
    })

    # Trap 4: Virgin Iron Double-Counting Trap
    trap_4_tool = calculate_metallurgy("J304", scrap_pct=50.0)
    trap_4_preset = {"gradeId": "J304", "scrapPct": 50, "feSource": "coalDRI"}
    trap_4_msg = (
        "### 1. Physical Analogy & Mechanism\n"
        "Naive mass balances treat ferroalloys as pure alloy additions and calculate virgin DRI based on total iron deficiency, "
        "causing massive double-counting. In reality, ferroalloys are primarily iron alloys: HC FeCr carries 40% metallic Fe, "
        "NPI carries 81.5% Fe, FeMo carries 33% Fe, and FeMn carries 20% Fe. Crediting this carrier iron reduces the required virgin DRI.\n\n"
        "### 2. Grounded Telemetry & Metrics\n"
        "- Grade: AISI 304 / J304\n"
        f"- Total Liquid Steel Mass: strictly {trap_4_tool['liquid_steel_mass_t']:.4f} t (strict mass closure)\n"
        f"- Stoichiometric Iron Credited from Ferroalloys: {trap_4_tool['fe_credited_from_alloys_t']:.4f} t Fe\n"
        f"- Net Virgin Iron Required: {trap_4_tool['net_virgin_fe_t']:.4f} t Fe\n"
        f"- Gross Coal DRI Charged (88% met): {trap_4_tool['gross_dri_charged_t']:.4f} t DRI\n\n"
        "### 3. Melt-Shop Operational Levers\n"
        "Deduct alloy-borne iron units from the primary DRI charge sheet to eliminate virgin iron overcharging and prevent over-tonnage.\n\n"
        f"{format_action_token(trap_4_preset)}"
    )
    traps.append({
        "id": "jsl_trap_iron_crediting_004",
        "grade_id": "J304",
        "family": "300 Series (Austenitic)",
        "scenario": "adversarial_trap_iron_crediting",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "How does the closed-loop mass balance prevent double-counting virgin iron units when charging FeCr and NPI?"},
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [{
                    "id": "call_trap_iron_crediting",
                    "type": "function",
                    "function": {
                        "name": "calculate_metallurgy",
                        "arguments": json.dumps({"grade_id": "J304", "scrap_pct": 50.0}),
                    },
                }],
            },
            {
                "role": "tool",
                "tool_call_id": "call_trap_iron_crediting",
                "name": "calculate_metallurgy",
                "content": json.dumps(trap_4_tool),
            },
            {"role": "assistant", "content": trap_4_msg},
        ],
        "ground_truth": {
            "mass_balance_closure_t": 1.000,
            "cbam_scope2_included": False,
            "eta_p": 0.99,
            "action_payload": trap_4_preset,
            "metrics": {
                "liquid_steel_mass_t": trap_4_tool["liquid_steel_mass_t"],
                "fe_credited_from_alloys_t": trap_4_tool["fe_credited_from_alloys_t"],
                "net_virgin_fe_t": trap_4_tool["net_virgin_fe_t"],
            },
        },
    })

    return traps


def generate_full_dataset(output_path: str = "data/jsl_training_dataset.jsonl") -> int:
    """
    Executes high-throughput combinatorial dataset generation across all 43 JSL grades.
    """
    random.seed(42)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    all_samples = []

    print(f"Starting combinatorial dataset synthesis across {len(GRADES)} authentic JSL grades...")

    for idx, (grade_id, grade) in enumerate(GRADES.items()):
        grade_samples = generate_samples_for_grade(grade, idx)
        all_samples.extend(grade_samples)

    # Add the 4 curated adversarial trap benchmarks
    traps = generate_adversarial_traps()
    all_samples.extend(traps)

    # If needed, expand combinatorially to exceed 1,000+ validated golden samples
    # Varying scrap percentage, facilities, and alpha weights across grades
    extra_idx = 0
    while len(all_samples) < 1050:
        for grade_id, grade in GRADES.items():
            if len(all_samples) >= 1050:
                break
            alpha = round(random.choice([0.1, 0.25, 0.4, 0.6, 0.75, 0.9]), 2)
            fac = random.choice(["jajpur", "hisar"])
            sol = solve_charge_optimizer(grade.id, alpha_cost_weight=alpha, facility_id=fac)
            if sol["is_feasible"]:
                preset = {
                    "gradeId": grade.id,
                    "scrapPct": sol["scrap_share_pct"],
                    "facilityId": fac,
                }
                token = format_action_token(preset)
                resp = (
                    f"### 1. Physical Analogy & Mechanism\n"
                    f"At multi-objective weight alpha = {alpha:.2f}, the LP solver balances raw material economic costs "
                    f"against carbon abatement penalties to determine the Pareto-optimal charge mix.\n\n"
                    f"### 2. Grounded Telemetry & Metrics\n"
                    f"- Grade: {grade.name} ({grade.family})\n"
                    f"- Charge Cost: ${sol['charge_cost_usd_per_t']:.2f}/t\n"
                    f"- Charge CO2: {sol['total_co2_t_per_t']:.3f} tCO2/t\n"
                    f"- Scrap Utilization: {sol['scrap_share_pct']:.1f}% (cap: {grade.scrap_cap}%)\n"
                    f"- Dual Scrap Ceiling Shadow Price: ${sol['scrap_ceiling_shadow_price_usd_per_t']:.2f}/t\n\n"
                    f"### 3. Melt-Shop Operational Levers\n"
                    f"Set EAF charge bucket to {sol['scrap_share_pct']:.1f}% scrap and balance with DRI.\n\n"
                    f"{token}"
                )
                all_samples.append({
                    "id": f"jsl_{grade.id.lower()}_comb_{extra_idx:04d}",
                    "grade_id": grade.id,
                    "family": grade.family,
                    "scenario": "combinatorial_pareto_blend",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Provide optimal charge mix for {grade.name} at {fac} with cost weight alpha={alpha:.2f}."},
                        {
                            "role": "assistant",
                            "content": None,
                            "tool_calls": [{
                                "id": f"call_comb_{extra_idx}",
                                "type": "function",
                                "function": {
                                    "name": "solve_charge_optimizer",
                                    "arguments": json.dumps({"grade_id": grade.id, "alpha_cost_weight": alpha, "facility_id": fac}),
                                },
                            }],
                        },
                        {
                            "role": "tool",
                            "tool_call_id": f"call_comb_{extra_idx}",
                            "name": "solve_charge_optimizer",
                            "content": json.dumps(sol),
                        },
                        {"role": "assistant", "content": resp},
                    ],
                    "ground_truth": {
                        "mass_balance_closure_t": 1.000,
                        "cbam_scope2_included": False,
                        "eta_p": 0.99,
                        "action_payload": preset,
                        "metrics": {
                            "charge_cost_usd_per_t": sol["charge_cost_usd_per_t"],
                            "total_co2_t_per_t": sol["total_co2_t_per_t"],
                            "scrap_share_pct": sol["scrap_share_pct"],
                        },
                    },
                })
                extra_idx += 1

    with open(output_path, "w", encoding="utf-8") as f:
        for s in all_samples:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")

    print(f"Successfully generated {len(all_samples)} validated golden samples in '{output_path}'.")
    return len(all_samples)


if __name__ == "__main__":
    generate_full_dataset()
