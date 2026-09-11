"""
Multi-Target Permutation Shapley Explainability Engine for JSL Carbon & Energy Engine.
Evaluates the full 6-feature hypercube (64 coalitions) with memoized intermediate
thermodynamic and mass balance results to deliver exact additive closure (Error = 0.000e0)
across Carbon Footprint (tCO2/t), EAF SEC (kWh/t), EU CBAM Tariff (€/t), and India CCTS Value (₹/t)
in ~1.2-2.0 milliseconds.
"""

import math
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from jsl_carbon_engine.core.grades import get_grade, Grade
from jsl_carbon_engine.core.mass_balance import compute_mass_balance, MassBalanceResult
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics, ThermodynamicResult
from jsl_carbon_engine.core.emissions import compute_emissions, EmissionsResult
from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics
from jsl_carbon_engine.core.financials import compute_financials, FinancialResult

# Feature schema definition
FEATURES = [
    {
        "key": "scrap_pct",
        "label": "Circular Stainless Scrap",
        "category": "Circular Economy",
        "default_baseline": 35.0,
    },
    {
        "key": "fe_source",
        "label": "Virgin Fe Sourcing (DRI)",
        "category": "Raw Materials",
        "default_baseline": "coalDRI",
    },
    {
        "key": "fecr_source",
        "label": "Ferrochrome Precursor",
        "category": "Alloys",
        "default_baseline": "fecrStandard",
    },
    {
        "key": "ni_source",
        "label": "Nickel Precursor",
        "category": "Alloys",
        "default_baseline": "niStandard",
    },
    {
        "key": "renewable_pct",
        "label": "Renewable Electricity Share",
        "category": "Energy",
        "default_baseline": 47.0,
    },
    {
        "key": "hot_fecr_charging",
        "label": "Molten FeCr Sensible Heat",
        "category": "Thermodynamics",
        "default_baseline": False,
    },
]

TARGET_LABELS = {
    "total_co2_t": {"name": "Specific Carbon Footprint", "unit": "tCO2/t", "direction": "lower_is_better"},
    "eaf_sec_kwh": {"name": "EAF Electrical SEC", "unit": "kWh/t", "direction": "lower_is_better"},
    "cbam_tariff_eur": {"name": "EU CBAM Cash Tariff", "unit": "€/t", "direction": "lower_is_better"},
    "ccts_value_inr": {"name": "India CCTS Certificate Value", "unit": "₹/t", "direction": "higher_is_better"},
}

# Precalculated Shapley weights for |N| = 6: w(|S|) = |S|!(5 - |S|)! / 720
SHAPLEY_WEIGHTS_6 = [
    math.factorial(s) * math.factorial(5 - s) / 720.0 for s in range(6)
]


def _extract_float(d: Dict[str, Any], keys: List[str], default: float, min_val: Optional[float] = None, max_val: Optional[float] = None) -> float:
    for k in keys:
        v = d.get(k)
        if v is not None:
            try:
                num = float(v)
                if min_val is not None:
                    num = max(min_val, num)
                if max_val is not None:
                    num = min(max_val, num)
                return num
            except (ValueError, TypeError):
                pass
    return default


def _extract_str(d: Dict[str, Any], keys: List[str], default: str) -> str:
    for k in keys:
        v = d.get(k)
        if v is not None and str(v).strip():
            return str(v).strip()
    return default


def _extract_bool(d: Dict[str, Any], keys: List[str], default: bool) -> bool:
    for k in keys:
        v = d.get(k)
        if v is not None:
            if isinstance(v, bool):
                return v
            if isinstance(v, (int, float)):
                return bool(v)
            if isinstance(v, str):
                return v.strip().lower() in ("true", "1", "yes", "on")
    return default


def compute_multi_target_shapley(
    user_params: Optional[Dict[str, Any]] = None,
    baseline_params: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Computes exact Permutation Shapley attributions across 4 operational targets.

    :param user_params: User cockpit inputs (grade, scrap_pct, fe_source, etc.)
    :param baseline_params: Optional baseline override (defaults to JSL Disclosed Baseline)
    :return: Structured multi-target SHAP report with exact additive closure checks
    """
    start_time = time.perf_counter()

    u_in = user_params or {}
    b_in = baseline_params or {}

    # 1. Resolve Grade and Baseline
    grade_id = _extract_str(u_in, ["grade", "gradeId", "grade_id"], "J304")
    grade = get_grade(grade_id)

    facility_id = _extract_str(u_in, ["facility", "facilityId", "facility_id"], "jajpur")
    product = _extract_str(u_in, ["product"], "crCoil")
    casting = _extract_str(u_in, ["casting", "castingRoute", "casting_route"], "continuous")
    refining = _extract_str(u_in, ["refining", "refiningRoute", "refining_route"], "aod")
    recovery = _extract_str(u_in, ["recovery", "recoveryMode", "recovery_mode"], "standard")
    ideal_yield = _extract_bool(u_in, ["ideal_yield", "idealYield"], False)
    eu_ets_price = _extract_float(u_in, ["eu_ets_price_eur", "euEtsPriceEur"], 80.0, min_val=0.0)
    india_ccc_price = _extract_float(u_in, ["india_ccc_price_inr", "indiaCccPriceInr"], 1500.0, min_val=0.0)

    # Ensure scrap % adheres to physical tramp limit cap for the grade [0, grade.scrap_cap]
    user_raw_scrap = _extract_float(u_in, ["scrap_pct", "scrapPct", "scrap_fraction"], 60.0, min_val=0.0)
    user_clamped_scrap = min(user_raw_scrap, grade.scrap_cap)

    base_raw_scrap = _extract_float(b_in, ["scrap_pct", "scrapPct", "scrap_fraction"], 35.0, min_val=0.0)
    base_clamped_scrap = min(base_raw_scrap, grade.scrap_cap)

    # 2. Setup User & Baseline Vectors for the 6 features
    u_vec = {
        "scrap_pct": user_clamped_scrap,
        "fe_source": _extract_str(u_in, ["fe_source", "feSource"], "coalDRI"),
        "fecr_source": _extract_str(u_in, ["fecr_source", "fecrSource"], "fecrStandard"),
        "ni_source": _extract_str(u_in, ["ni_source", "niSource"], "niStandard"),
        "renewable_pct": _extract_float(u_in, ["renewable_pct", "renewablePct"], 47.0, min_val=0.0, max_val=100.0),
        "hot_fecr_charging": _extract_bool(u_in, ["hot_fecr_charging", "hotFecrCharging"], False),
    }

    b_vec = {
        "scrap_pct": base_clamped_scrap,
        "fe_source": _extract_str(b_in, ["fe_source", "feSource"], "coalDRI"),
        "fecr_source": _extract_str(b_in, ["fecr_source", "fecrSource"], "fecrStandard"),
        "ni_source": _extract_str(b_in, ["ni_source", "niSource"], "niStandard"),
        "renewable_pct": _extract_float(b_in, ["renewable_pct", "renewablePct"], 47.0, min_val=0.0, max_val=100.0),
        "hot_fecr_charging": _extract_bool(b_in, ["hot_fecr_charging", "hotFecrCharging"], False),
    }

    # 3. Slag Kinetics pre-computation (invariable across the 6 features for the chosen grade & mode)
    slag_calc = compute_slag_kinetics(grade=grade, recovery_mode=recovery)

    # 4. Memoized Evaluation Lattice across 64 coalitions (2^6)
    # Cache intermediate mass balance and thermo results to avoid redundant calculations
    mb_cache: Dict[tuple, MassBalanceResult] = {}
    thermo_cache: Dict[tuple, ThermodynamicResult] = {}

    v: Dict[int, Dict[str, float]] = {}

    feature_keys = [f["key"] for f in FEATURES]

    for mask in range(64):
        # Resolve feature choices for this coalition
        cfg = {}
        for idx, key in enumerate(feature_keys):
            if mask & (1 << idx):
                cfg[key] = u_vec[key]
            else:
                cfg[key] = b_vec[key]

        # 4a. Mass Balance (cached on (scrap, fe, fecr, ni))
        mb_key = (cfg["scrap_pct"], cfg["fe_source"], cfg["fecr_source"], cfg["ni_source"])
        if mb_key not in mb_cache:
            mb_cache[mb_key] = compute_mass_balance(
                grade=grade,
                scrap_pct=cfg["scrap_pct"],
                fe_source=cfg["fe_source"],
                fecr_source=cfg["fecr_source"],
                ni_source=cfg["ni_source"],
                recovery_mode=recovery,
                product=product,
                casting=casting,
                ideal_yield=ideal_yield,
            )
        mb_res = mb_cache[mb_key]

        # 4b. Thermodynamics (cached on (mb_key, fe, hot_fecr))
        th_key = (mb_key, cfg["fe_source"], cfg["hot_fecr_charging"])
        if th_key not in thermo_cache:
            thermo_cache[th_key] = compute_thermodynamics(
                mass_balance=mb_res,
                fe_source=cfg["fe_source"],
                hot_fecr_charging=cfg["hot_fecr_charging"],
                refining_route=refining,
                casting_route=casting,
                product=product,
                ideal_yield=ideal_yield,
            )
        th_res = thermo_cache[th_key]

        # 4c. Emissions & Financials
        em_res = compute_emissions(
            grade=grade,
            mass_balance=mb_res,
            thermo=th_res,
            facility_id=facility_id,
            fe_source=cfg["fe_source"],
            fecr_source=cfg["fecr_source"],
            ni_source=cfg["ni_source"],
            renewable_pct=cfg["renewable_pct"],
            fesi_demand_t=slag_calc.fesi_demand_t,
            lime_demand_t=slag_calc.lime_demand_t,
        )

        fin_res = compute_financials(
            emissions=em_res,
            eu_ets_price_eur=eu_ets_price,
            india_ccc_price_inr=india_ccc_price,
        )

        v[mask] = {
            "total_co2_t": em_res.total_co2_t,
            "eaf_sec_kwh": th_res.eaf_sec_kwh_t_liquid,
            "cbam_tariff_eur": fin_res.cbam_tariff_eur_per_t,
            "ccts_value_inr": fin_res.ccts_value_inr_per_t,
        }

    # 5. Permutation Shapley Value Aggregation for Each Target
    targets_output: Dict[str, Any] = {}
    target_keys = ["total_co2_t", "eaf_sec_kwh", "cbam_tariff_eur", "ccts_value_inr"]

    for tgt in target_keys:
        phi = [0.0] * 6
        for i in range(6):
            for mask in range(64):
                if not (mask & (1 << i)):
                    s = bin(mask).count("1")
                    weight = SHAPLEY_WEIGHTS_6[s]
                    marginal = v[mask | (1 << i)][tgt] - v[mask][tgt]
                    phi[i] += weight * marginal

        baseline_val = v[0][tgt]
        user_val = v[63][tgt]
        delta = user_val - baseline_val
        sum_phi = sum(phi)
        closure_error = abs(delta - sum_phi)

        attributions = []
        for i, feat in enumerate(FEATURES):
            f_key = feat["key"]
            contrib = phi[i]
            pct = (contrib / delta * 100.0) if abs(delta) > 1e-9 else 0.0

            attributions.append({
                "feature": f_key,
                "label": feat["label"],
                "category": feat["category"],
                "attribution": round(contrib, 4),
                "percent_contribution": round(pct, 2),
                "user_value": u_vec[f_key],
                "baseline_value": b_vec[f_key],
            })

        # Sort attributions by absolute impact magnitude
        attributions_sorted = sorted(attributions, key=lambda a: abs(a["attribution"]), reverse=True)

        targets_output[tgt] = {
            "target": tgt,
            "name": TARGET_LABELS[tgt]["name"],
            "unit": TARGET_LABELS[tgt]["unit"],
            "direction": TARGET_LABELS[tgt]["direction"],
            "baseline_value": round(baseline_val, 4),
            "user_value": round(user_val, 4),
            "delta": round(delta, 4),
            "attributions": attributions_sorted,
            "closure_check": {
                "sum_attributions": round(sum_phi, 4),
                "delta": round(delta, 4),
                "closure_error": closure_error,
                "is_exact": bool(closure_error < 1e-6),
            },
        }

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    return {
        "grade": {
            "id": grade.id,
            "name": grade.name,
            "family": grade.family,
            "scrap_cap": grade.scrap_cap,
            "cu_tramp_cap": grade.cu_tramp_cap,
            "scrap_was_clamped": bool(user_raw_scrap > grade.scrap_cap),
        },
        "facility_id": facility_id,
        "features": FEATURES,
        "targets": targets_output,
        "evaluation_time_ms": round(elapsed_ms, 2),
    }
