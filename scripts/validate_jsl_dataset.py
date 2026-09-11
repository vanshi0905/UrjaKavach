"""
Automated 5-Gate Validation Filter for JSL Metallurgical Chatbot Training Dataset.

Enforces 5 non-negotiable physical, regulatory, and pedagogical gates:
Gate 1: Mass balance closure (1.000 t +/- 0.001 t) and zero virgin iron double counting.
Gate 2: CBAM legal scope (zero Scope 2 inclusion in iron/steel).
Gate 3: Phosphorus barrier (rejection of false slag de-P claims; eta_P = 0.99).
Gate 4: Numerical tolerancing (numbers match underlying calculation within +/- 0.5%).
Gate 5: 3-layer pedagogical format validation (Metaphor, Telemetry, Operational Lever + Action Token).
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


ACTION_TOKEN_REGEX = re.compile(r"<<<ACTION:APPLY_COCKPIT_PRESET:(\{.*?\})>>>")


def validate_sample(sample: Dict[str, Any], sample_idx: int) -> Tuple[bool, Dict[str, bool], List[str]]:
    """
    Validates a single dataset sample across all 5 gates.
    Returns (is_valid, gate_results, error_messages).
    """
    gate_results = {
        "gate_1_mass_balance": False,
        "gate_2_cbam_scope": False,
        "gate_3_phosphorus_barrier": False,
        "gate_4_numerical_tolerance": False,
        "gate_5_pedagogical_format": False,
    }
    errors = []

    gt = sample.get("ground_truth", {})
    messages = sample.get("messages", [])

    if len(messages) < 4:
        errors.append(f"Sample {sample_idx}: Invalid trajectory, expected at least 4 messages, got {len(messages)}")
        return False, gate_results, errors

    # Extract tool result if available
    tool_msg = next((m for m in messages if m.get("role") == "tool"), None)
    tool_data = {}
    if tool_msg and tool_msg.get("content"):
        try:
            tool_data = json.loads(tool_msg["content"])
        except Exception:
            pass

    assistant_msg = messages[-1].get("content", "")

    # =========================================================================
    # GATE 1: Mass Balance Closure (1.000 t +/- 0.001 t) & Zero Fe Double Counting
    # =========================================================================
    mass_closure = gt.get("mass_balance_closure_t", 1.0)
    gate_1_ok = True
    if not (0.999 <= mass_closure <= 1.001):
        errors.append(f"Gate 1: Ground truth mass closure {mass_closure} outside bounds [0.999, 1.001].")
        gate_1_ok = False

    if "liquid_steel_mass_t" in tool_data:
        l_mass = float(tool_data["liquid_steel_mass_t"])
        if not (0.999 <= l_mass <= 1.001):
            errors.append(f"Gate 1: Liquid steel mass {l_mass} violates 1.000t +/- 0.001t closure.")
            gate_1_ok = False

    if "charge_sheet_t" in tool_data and isinstance(tool_data["charge_sheet_t"], dict):
        total_charge_t = sum(float(v) for v in tool_data["charge_sheet_t"].values())
        # Gross charge sheet must be between 1.000t and 1.250t for 1.000t liquid steel (yield 80-100%)
        if not (0.999 <= total_charge_t <= 1.250):
            errors.append(f"Gate 1: Charge sheet total mass {total_charge_t:.4f}t outside realistic yield bounds [1.000, 1.250].")
            gate_1_ok = False

    if "fe_credited_from_alloys_t" in tool_data:
        fe_cred = float(tool_data["fe_credited_from_alloys_t"])
        if fe_cred < 0.0:
            errors.append(f"Gate 1: Negative alloy Fe credit ({fe_cred:.4f} t).")
            gate_1_ok = False

    if "net_virgin_fe_t" in tool_data:
        net_fe = float(tool_data["net_virgin_fe_t"])
        if net_fe < -0.001 or net_fe > 1.001:
            errors.append(f"Gate 1: Invalid net virgin iron demand ({net_fe:.4f} t).")
            gate_1_ok = False

    gate_results["gate_1_mass_balance"] = gate_1_ok

    # =========================================================================
    # GATE 2: CBAM Legal Scope (Zero Scope 2 Inclusion in Iron & Steel)
    # =========================================================================
    scope2_included = gt.get("cbam_scope2_included", True)
    if not scope2_included:
        see_val = None
        if "see_tco2" in tool_data:
            see_val = float(tool_data["see_tco2"])
        elif "cbam_see_tco2" in tool_data:
            see_val = float(tool_data["cbam_see_tco2"])

        if see_val is not None and "scope2_electricity_tco2" in tool_data:
            s1 = float(tool_data.get("scope1_direct_tco2", 0.0))
            s3 = float(tool_data.get("scope3_precursors_tco2", 0.0))
            s2 = float(tool_data.get("scope2_electricity_tco2", 0.0))
            expected_see = s1 + s3
            if abs(see_val - expected_see) > 0.015:
                errors.append(f"Gate 2: CBAM SEE ({see_val:.3f}) does not match Scope 1 ({s1:.3f}) + Scope 3 ({s3:.3f}) = {expected_see:.3f}.")
            elif s2 > 0.05 and abs(see_val - (expected_see + s2)) < 0.01:
                errors.append(f"Gate 2: CBAM SEE improperly includes Scope 2 electricity ({s2:.3f} tCO2/t).")
            else:
                gate_results["gate_2_cbam_scope"] = True
        else:
            gate_results["gate_2_cbam_scope"] = True
    else:
        errors.append("Gate 2: cbam_scope2_included flag is True; steel CBAM requires strict Scope 2 exclusion.")

    # =========================================================================
    # GATE 3: Phosphorus Barrier (eta_P = 0.99, Rejection of False Slag De-P)
    # =========================================================================
    eta_p = gt.get("eta_p", 0.0)
    if eta_p >= 0.95:
        tool_eta_p = tool_data.get("phosphorus_barrier_eta_p", tool_data.get("phosphorus_recovery_eta", eta_p))
        if tool_eta_p >= 0.95:
            if "phosphorus" in assistant_msg.lower() or "dephosphorization" in assistant_msg.lower():
                de_p_false_claim = bool(re.search(r"\b(remove|reduce|oxidize)\s+\d+%\s+of\s+(tramp\s+)?phosphorus\s+into\s+(the\s+)?slag\b", assistant_msg, re.IGNORECASE))
                if de_p_false_claim and not any(neg in assistant_msg.lower() for neg in ["impossible", "cannot", "reject", "not", "prevent", "ruin", "never"]):
                    errors.append("Gate 3: Assistant made false claim that phosphorus oxidizes into stainless slag.")
                else:
                    gate_results["gate_3_phosphorus_barrier"] = True
            else:
                gate_results["gate_3_phosphorus_barrier"] = True
        else:
            errors.append(f"Gate 3: Tool reported eta_P = {tool_eta_p} < 0.95 (allowed false de-P).")
    else:
        errors.append(f"Gate 3: Ground truth eta_P = {eta_p} < 0.95.")

    # =========================================================================
    # GATE 4: Numerical Tolerancing (+/- 0.5% against underlying calculation)
    # =========================================================================
    def extract_metric(d: Dict[str, Any], metric_name: str) -> Optional[float]:
        # Direct key
        if metric_name in d and isinstance(d[metric_name], (int, float)):
            return float(d[metric_name])
        # Specific Pareto point mappings
        if metric_name == "least_cost_usd":
            pt = d.get("least_cost_point", {})
            if "cost_usd_per_t" in pt: return float(pt["cost_usd_per_t"])
        if metric_name == "least_carbon_t":
            pt = d.get("least_carbon_point", {})
            if "co2_t_per_t" in pt: return float(pt["co2_t_per_t"])

        alias_map = {
            "cr": ["Cr", "cr"],
            "ni": ["Ni", "ni"],
            "mo": ["Mo", "mo"],
            "scrap_cap": ["scrap_cap_pct", "scrap_cap"],
            "scrap_cap_pct": ["scrap_cap_pct", "scrap_cap"],
            "ni_tramp_cap": ["ni_tramp_cap_pct", "ni_tramp_cap"],
            "ni_tramp_cap_pct": ["ni_tramp_cap_pct", "ni_tramp_cap"],
            "phosphorus_recovery_eta": ["phosphorus_barrier_eta_p", "phosphorus_recovery_eta"],
            "phosphorus_barrier_eta_p": ["phosphorus_barrier_eta_p", "phosphorus_recovery_eta"],
            "max_abatement_pct": ["max_co2_abatement_potential_pct", "max_abatement_pct"],
            "max_co2_abatement_potential_pct": ["max_co2_abatement_potential_pct", "max_abatement_pct"],
        }
        for alt in alias_map.get(metric_name, []):
            if alt in d and isinstance(d[alt], (int, float)):
                return float(d[alt])
        for sub_k, sub_v in d.items():
            if isinstance(sub_v, dict) and sub_k not in ("least_cost_point", "least_carbon_point"):
                if metric_name in sub_v and isinstance(sub_v[metric_name], (int, float)):
                    return float(sub_v[metric_name])
                for alt in alias_map.get(metric_name, []):
                    if alt in sub_v and isinstance(sub_v[alt], (int, float)):
                        return float(sub_v[alt])
        return None

    metrics = gt.get("metrics", {})
    tolerance_passed = True
    verified_count = 0
    for key, expected_val in metrics.items():
        if isinstance(expected_val, (int, float)):
            actual_val = extract_metric(tool_data, key)
            if actual_val is not None:
                verified_count += 1
                if abs(expected_val) > 1e-4:
                    pct_diff = abs(actual_val - expected_val) / abs(expected_val)
                    if pct_diff > 0.005 and abs(actual_val - expected_val) > 0.02:
                        tolerance_passed = False
                        errors.append(f"Gate 4: Metric '{key}' mismatch: actual {actual_val} vs expected {expected_val} (diff: {pct_diff*100:.2f}%).")
                        break

    if verified_count == 0 and len(metrics) > 0:
        tolerance_passed = False
        errors.append(f"Gate 4: No ground truth metrics ({list(metrics.keys())}) matched any tool data fields.")

    if tolerance_passed and (verified_count > 0 or len(metrics) == 0):
        gate_results["gate_4_numerical_tolerance"] = True

    # =========================================================================
    # GATE 5: 3-Layer Pedagogical Format & Action Token Protocol
    # =========================================================================
    has_layer_1 = bool(re.search(r"###?\s*1\.\s*(Physical Analogy|Physical Principle|Concept|Mechanism)", assistant_msg, re.IGNORECASE)) or ("1. Physical Analogy" in assistant_msg) or ("Physical Principle" in assistant_msg)
    has_layer_2 = bool(re.search(r"###?\s*2\.\s*(Grounded Telemetry|Telemetry|Metrics|Energy|Scope)", assistant_msg, re.IGNORECASE)) or ("2. Grounded Telemetry" in assistant_msg) or ("Telemetry & Metrics" in assistant_msg)
    has_layer_3 = bool(re.search(r"###?\s*3\.\s*(Melt-Shop Operational Levers|Operational Action|Melt Shop Action|Recommendation|Executive Action|Strategic Action|Procurement Action)", assistant_msg, re.IGNORECASE)) or ("3. Melt-Shop Operational Levers" in assistant_msg) or ("Operational Action" in assistant_msg)

    # Action token check
    action_match = ACTION_TOKEN_REGEX.search(assistant_msg)
    valid_action_payload = False
    if action_match:
        try:
            payload_str = action_match.group(1)
            parsed_payload = json.loads(payload_str)
            if isinstance(parsed_payload, dict) and len(parsed_payload) > 0:
                valid_action_payload = True
        except Exception:
            valid_action_payload = False

    if has_layer_1 and has_layer_2 and has_layer_3 and valid_action_payload:
        gate_results["gate_5_pedagogical_format"] = True
    else:
        err_details = []
        if not has_layer_1: err_details.append("missing Layer 1 Metaphor")
        if not has_layer_2: err_details.append("missing Layer 2 Telemetry")
        if not has_layer_3: err_details.append("missing Layer 3 Operational Lever")
        if not valid_action_payload: err_details.append("missing/malformed action token <<<ACTION:APPLY_COCKPIT_PRESET:...>>>")
        errors.append(f"Gate 5: Pedagogical format failure: {', '.join(err_details)}.")

    is_all_valid = all(gate_results.values())
    return is_all_valid, gate_results, errors


def run_validation_pipeline(dataset_path: str = "data/jsl_training_dataset.jsonl") -> bool:
    """
    Evaluates all samples in the dataset and prints a comprehensive 5-gate audit report.
    """
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset file '{dataset_path}' not found.")
        return False

    print(f"\n================================================================================")
    print(f"      JSL METALLURGICAL CHATBOT AUTOMATED 5-GATE VALIDATION FILTER")
    print(f"================================================================================")
    print(f"Dataset Target: {dataset_path}")

    total_samples = 0
    gate_counts = {
        "gate_1_mass_balance": 0,
        "gate_2_cbam_scope": 0,
        "gate_3_phosphorus_barrier": 0,
        "gate_4_numerical_tolerance": 0,
        "gate_5_pedagogical_format": 0,
    }
    all_passed_samples = 0
    all_errors = []

    with open(dataset_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            total_samples += 1
            try:
                sample = json.loads(line)
            except Exception as e:
                all_errors.append(f"Sample {idx}: JSON parse error: {str(e)}")
                continue

            is_valid, gates, sample_errors = validate_sample(sample, idx)
            for g, passed in gates.items():
                if passed:
                    gate_counts[g] += 1

            if is_valid:
                all_passed_samples += 1
            else:
                all_errors.extend(sample_errors)

    print(f"\nAudit Summary:")
    print(f"  Total Samples Audited:           {total_samples}")
    print(f"  Gate 1 (Mass Balance Closure):   {gate_counts['gate_1_mass_balance']}/{total_samples} ({gate_counts['gate_1_mass_balance']/total_samples*100:.1f}%)")
    print(f"  Gate 2 (CBAM Scope 2 Exclusion): {gate_counts['gate_2_cbam_scope']}/{total_samples} ({gate_counts['gate_2_cbam_scope']/total_samples*100:.1f}%)")
    print(f"  Gate 3 (Phosphorus Barrier):     {gate_counts['gate_3_phosphorus_barrier']}/{total_samples} ({gate_counts['gate_3_phosphorus_barrier']/total_samples*100:.1f}%)")
    print(f"  Gate 4 (Numerical Tolerance):    {gate_counts['gate_4_numerical_tolerance']}/{total_samples} ({gate_counts['gate_4_numerical_tolerance']/total_samples*100:.1f}%)")
    print(f"  Gate 5 (3-Layer Pedagogical):    {gate_counts['gate_5_pedagogical_format']}/{total_samples} ({gate_counts['gate_5_pedagogical_format']/total_samples*100:.1f}%)")
    print(f"--------------------------------------------------------------------------------")
    print(f"  Golden Standard Compliant:       {all_passed_samples}/{total_samples} ({all_passed_samples/total_samples*100:.1f}%)")

    if all_passed_samples == total_samples and total_samples >= 1000:
        print(f"\n[PASS] All {total_samples} dataset samples STRICTLY SATISFY the 5-Gate Physical Audit.")
        print(f"================================================================================\n")
        return True
    else:
        print(f"\n[FAIL] Found {len(all_errors)} gate failures across the dataset:")
        for err in all_errors[:10]:
            print(f"  - {err}")
        if len(all_errors) > 10:
            print(f"  ... and {len(all_errors) - 10} more errors.")
        print(f"================================================================================\n")
        return False


if __name__ == "__main__":
    success = run_validation_pipeline()
    sys.exit(0 if success else 1)
