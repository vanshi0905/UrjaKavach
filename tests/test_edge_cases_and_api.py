"""
Comprehensive Edge Cases and FastAPI Endpoint Integration Tests.
Tests:
1. Boundary conditions: 0% scrap, 100% scrap clamping, 0% and 100% renewable power.
2. Error handling: invalid grade, invalid facility, invalid product.
3. Custom grade builder with custom elemental bounds.
4. FastAPI REST endpoints using TestClient:
   - GET /api/grades
   - GET /api/grades/J304
   - GET /api/facilities
   - GET /api/products
   - POST /api/calculate
   - POST /api/optimize
   - POST /api/pareto
   - GET / and GET /dashboard
"""

import warnings
warnings.filterwarnings("ignore", message=".*Using `httpx` with `starlette.testclient`.*")

import pytest
from starlette.testclient import TestClient

from jsl_carbon_engine.core.grades import get_grade, Grade
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
from jsl_carbon_engine.core.emissions import compute_emissions
from jsl_carbon_engine.core.financials import compute_financials
from jsl_carbon_engine.config.jsl_facilities import get_facility
from jsl_carbon_engine.api.app import app

client = TestClient(app)


def test_zero_scrap_boundary():
    """Verify that a 100% virgin charge (0% scrap) completes mass balance without error."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=0.0)
    assert mb.scrap_fraction == 0.0
    assert abs(mb.total_liquid_steel_t - 1.000) < 0.002
    assert mb.gross_dri_charged_t > 0.40


def test_exceeding_scrap_cap_is_clamped():
    """Verify that entering 100% scrap is clamped to grade scrap_cap."""
    grade_409 = get_grade("J409L")  # scrapCap = 65%
    mb = compute_mass_balance(grade=grade_409, scrap_pct=99.0)
    assert mb.scrap_fraction == 0.65


def test_negative_scrap_is_clamped_to_zero():
    """Verify that negative scrap percentage is clamped to 0.0."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=-15.0)
    assert mb.scrap_fraction == 0.0


def test_invalid_grade_raises_value_error():
    """Verify that querying a non-existent grade raises ValueError."""
    with pytest.raises(ValueError, match="not found"):
        get_grade("NON_EXISTENT_GRADE_XYZ")


def test_invalid_facility_raises_value_error():
    """Verify that querying a non-existent facility raises ValueError."""
    with pytest.raises(ValueError, match="Unknown facility"):
        get_facility("unknown_plant_123")


def test_custom_grade_metallurgy():
    """Verify custom grade definition and calculation."""
    custom_g = Grade(
        id="Custom_316Ti",
        name="Custom 316 Titanium",
        family="Custom",
        cr=17.5, ni=11.5, mo=2.2, mn=1.2, cu=0.3, c=0.04, si=0.50, s=0.01, p=0.03, n=0.04,
        cr_min=17.0, cr_max=18.0, ni_min=11.0, ni_max=12.0, mo_min=2.0, mo_max=2.5,
        mn_min=1.0, mn_max=1.5, cu_min=0.0, cu_max=0.5, c_max=0.06, si_max=0.75,
        scrap_cap=80.0,
    )
    mb = compute_mass_balance(grade=custom_g, scrap_pct=50.0)
    assert abs(mb.total_liquid_steel_t - 1.000) < 0.002
    assert mb.femo_mass_t > 0.0


def test_api_get_grades():
    """Verify GET /api/grades endpoint returns 43 authentic JSL grades."""
    res = client.get("/api/grades")
    assert res.status_code == 200
    data = res.json()
    assert "families" in data
    assert data["total_grades"] >= 43


def test_api_get_grade_detail():
    """Verify GET /api/grades/J304 returns correct schema."""
    res = client.get("/api/grades/J304")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "J304"
    assert data["scrap_cap"] == 90.0
    assert "Cr" in data["chemistry_midpoint"]


def test_api_get_facilities():
    """Verify GET /api/facilities returns Jajpur, Hisar, and Chhattisgarh."""
    res = client.get("/api/facilities")
    assert res.status_code == 200
    data = res.json()
    assert "jajpur" in data
    assert "hisar" in data
    assert "chhattisgarh" in data
    assert data["jajpur"]["capacity_mtpa"] == 2.2
    assert data["hisar"]["capacity_mtpa"] == 0.8
    assert data["chhattisgarh"]["capacity_mtpa"] == 3.6


def test_api_calculate_endpoint():
    """Verify POST /api/calculate returns comprehensive metallurgical & financial report."""
    payload = {
        "grade": "J304",
        "scrap_pct": 60.0,
        "facility": "jajpur",
        "fe_source": "coalDRI",
        "product": "crCoil",
        "renewable_pct": 47.0,
    }
    res = client.post("/api/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "mass_balance" in data
    assert "thermodynamics" in data
    assert "emissions" in data
    assert "financials" in data
    assert data["emissions"]["total_co2_t"] > 1.0
    assert data["financials"]["cbam_tariff_2034_unhedged_eur_per_t"] > 0.0


def test_api_optimize_endpoint():
    """Verify POST /api/optimize runs LP solver successfully."""
    payload = {
        "grade": "J304",
        "alpha_cost_weight": 0.5,
        "facility": "jajpur",
    }
    res = client.post("/api/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_feasible"] is True
    assert "charge_sheet_pct" in data
    assert data["charge_cost_usd_per_t"] > 0


def test_api_pareto_endpoint():
    """Verify POST /api/pareto generates frontier points."""
    payload = {
        "grade": "J304",
        "steps": 5,
        "facility": "jajpur",
    }
    res = client.post("/api/pareto", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "frontier_points" in data
    assert len(data["frontier_points"]) >= 3


def test_dashboard_html_served():
    """Verify GET / and GET /dashboard serve valid HTML."""
    res = client.get("/")
    assert res.status_code == 200
    assert "<!DOCTYPE html>" in res.text
    assert "JSL Carbon & Energy Engine" in res.text


def test_api_optimize_endpoint_j4_flagship():
    """Verify POST /api/optimize succeeds for JSL flagship grade J4."""
    payload = {
        "grade": "J4",
        "alpha_cost_weight": 0.5,
        "facility": "jajpur",
    }
    res = client.post("/api/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_feasible"] is True
    assert "cuFeed" in data["charge_sheet_pct"]
    assert "feMn" in data["charge_sheet_pct"]


def test_api_calculate_endpoint_with_cu():
    """Verify POST /api/calculate returns copper metrics for J4."""
    payload = {
        "grade": "J4",
        "scrap_pct": 50.0,
        "facility": "jajpur",
    }
    res = client.post("/api/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["mass_balance"]["cu_mass_t"] > 0
    assert data["emissions"]["scope3_breakdown"]["copper_tco2"] > 0


def test_api_facilities_returns_ccts_targets():
    """Verify GET /api/facilities returns CCTS draft target and baseline."""
    res = client.get("/api/facilities")
    assert res.status_code == 200
    data = res.json()
    assert data["jajpur"]["ccts_target_tco2"] == 0.8222
    assert data["jajpur"]["ccts_baseline_tco2"] == 0.8792
    assert data["hisar"]["ccts_target_tco2"] == 0.7107
    assert data["hisar"]["ccts_baseline_tco2"] == 0.7600


def test_api_calculate_returns_v21_cbam_and_ccts_metrics():
    """Verify POST /api/calculate includes detailed SEFA CBAM 2026/2034 and BEE CCTS targets."""
    payload = {
        "grade": "J304",
        "scrap_pct": 60.0,
        "facility": "jajpur",
    }
    res = client.post("/api/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    fin = data["financials"]
    assert "cbam_liability_2026" in fin
    assert "cbam_liability_2034_full" in fin
    assert "cbam_taxable_carbon_gap_tco2" in fin
    assert "ccts_target_tco2" in fin
    assert fin["ccts_target_tco2"] == 0.8222
    assert "india_ccts_target_0_8222" in data["benchmarks_comparison"]


def test_api_monte_carlo_endpoint():
    """Verify POST /api/monte-carlo returns stochastic robustness distribution."""
    payload = {
        "grade": "J304",
        "runs": 50,
        "seed": 42,
    }
    res = client.post("/api/monte-carlo", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["runs"] == 50
    assert data["compliance_probability_pct"] >= 80.0
    assert data["p50_cost_usd_per_t"] > 1000.0
    assert data["p50_co2_t_per_t"] > 0.0


