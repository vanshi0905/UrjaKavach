"""
Pydantic v2 Schemas and Data Models for JSL Carbon Engine API.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class CalculationRequest(BaseModel):
    grade: str = Field(default="J304", description="JSL grade ID (e.g. J304, J4, J430, J2205)")
    scrap_pct: float = Field(default=60.0, ge=0.0, le=100.0, description="% recycled stainless scrap")
    facility: str = Field(default="jajpur", description="Facility profile ('jajpur' or 'hisar')")
    fe_source: str = Field(default="coalDRI", description="'coalDRI', 'gasDRI', or 'pigIron'")
    fecr_source: str = Field(default="fecrStandard", description="'fecrStandard' (HC) or 'fecrLowC' (LC)")
    ni_source: str = Field(default="niStandard", description="'niStandard', 'niClass1' (Hydro), or 'niNPI' (Indonesian coal RKEF)")
    recovery: str = Field(default="standard", description="'standard' (92% Cr) or 'optimised' (96% Cr)")
    product: str = Field(default="crCoil", description="Finished product (crCoil, hrCoil, slab, plate, specialty, rebar, wireRod)")
    casting: str = Field(default="continuous", description="'continuous' or 'ingot'")
    refining: str = Field(default="aod", description="'aod' or 'aodvod'")
    renewable_pct: float = Field(default=47.0, ge=0.0, le=100.0, description="% renewable power PPA share")
    hot_fecr_charging: Optional[bool] = Field(default=None, description="Hot molten FeCr sensible heat charging (auto if Jajpur)")
    ideal_yield: bool = Field(default=False, description="If True, bypass downstream finishing yield loss")
    eu_ets_price_eur: float = Field(default=80.0, ge=0.0, description="EU ETS carbon allowance price (€/tCO2)")
    india_ccc_price_inr: float = Field(default=1500.0, ge=0.0, description="India CCTS Carbon Credit Certificate price (₹/tCO2)")


class CalculationResponse(BaseModel):
    grade: Dict[str, Any]
    facility: Dict[str, Any]
    mass_balance: Dict[str, Any]
    thermodynamics: Dict[str, Any]
    emissions: Dict[str, Any]
    slag_kinetics: Dict[str, Any]
    financials: Dict[str, Any]
    benchmarks_comparison: Dict[str, Any]


class OptimizationRequest(BaseModel):
    grade: str = Field(default="J304", description="Target stainless grade")
    alpha_cost_weight: float = Field(default=0.5, ge=0.0, le=1.0, description="1.0 = Least Cost, 0.0 = Least Carbon")
    facility: str = Field(default="jajpur", description="Facility profile ('jajpur' or 'hisar')")
    allow_npi: bool = Field(default=True, description="Allow Indonesian Coal RKEF NPI")
    allow_gas_dri: bool = Field(default=True, description="Allow Gas-based DRI")
    allow_pig_iron: bool = Field(default=True, description="Allow Blast Furnace Pig Iron")
    enforce_scrap_cap: bool = Field(default=True, description="Enforce grade-specific tramp scrap cap")
    custom_scrap_cap: Optional[float] = Field(default=None, ge=0.0, le=100.0, description="Override scrap cap %")
    electricity_cost_usd_kwh: Optional[float] = Field(default=None, ge=0.0, description="Optional electricity tariff override in USD/kWh")


class OptimizationResponse(BaseModel):
    grade_id: str
    is_feasible: bool
    status_message: str
    alpha_cost_weight: float
    charge_sheet_pct: Dict[str, float]
    charge_sheet_t: Dict[str, float]
    final_chemistry_pct: Dict[str, float]
    charge_cost_usd_per_t: float
    total_co2_t_per_t: float
    scrap_share_pct: float
    virgin_dri_share_pct: float
    ferroalloys_share_pct: float
    tramp_shadow_prices: Dict[str, float] = Field(default_factory=dict)
    value_in_use_usd_per_t: Dict[str, float] = Field(default_factory=dict)
    scrap_ceiling_shadow_price_usd_per_t: float = 0.0
    estimated_lime_kg_per_t: float = 0.0
    estimated_slag_kg_per_t: float = 0.0


class ParetoRequest(BaseModel):
    grade: str = Field(default="J304", description="Target stainless grade")
    steps: int = Field(default=11, ge=3, le=51, description="Number of alpha evaluation steps")
    facility: str = Field(default="jajpur", description="Facility profile")


class ParetoPointModel(BaseModel):
    alpha: float
    cost_usd_per_t: float
    co2_t_per_t: float
    scrap_pct: float
    charge_sheet: Dict[str, float]


class ParetoResponse(BaseModel):
    grade_id: str
    frontier_points: List[ParetoPointModel]
    least_cost_point: ParetoPointModel
    least_carbon_point: ParetoPointModel
    max_co2_abatement_potential_pct: float
    cost_of_carbon_abatement_usd_per_tco2: float


class CustomGradeRequest(BaseModel):
    name: str = "Custom Stainless"
    family: str = "Build Your Own"
    cr: float = Field(ge=0.0, le=35.0)
    ni: float = Field(ge=0.0, le=35.0)
    mo: float = Field(ge=0.0, le=10.0, default=0.0)
    mn: float = Field(ge=0.0, le=15.0, default=1.0)
    cu: float = Field(ge=0.0, le=5.0, default=0.2)
    c: float = Field(ge=0.0, le=1.2, default=0.05)
    si: float = Field(ge=0.0, le=3.0, default=0.50)
    scrap_cap: float = Field(ge=0.0, le=100.0, default=80.0)


class MonteCarloRequest(BaseModel):
    grade: str = Field(default="J304", description="Target stainless grade")
    runs: int = Field(default=1000, ge=10, le=5000, description="Number of Monte Carlo heats")
    alpha_cost_weight: float = Field(default=0.5, ge=0.0, le=1.0, description="Cost vs Carbon weight")
    std_dev_cr: float = Field(default=0.8, ge=0.0, le=5.0)
    std_dev_ni: float = Field(default=0.4, ge=0.0, le=5.0)
    std_dev_cu: float = Field(default=0.04, ge=0.0, le=1.0)
    std_dev_sn: float = Field(default=0.003, ge=0.0, le=0.1)
    facility: str = Field(default="jajpur", description="Facility profile")
    seed: Optional[int] = Field(default=None, description="Random seed for reproducibility")


class MonteCarloResponse(BaseModel):
    grade_id: str
    runs: int
    p10_cost_usd_per_t: float
    p50_cost_usd_per_t: float
    p90_cost_usd_per_t: float
    p10_co2_t_per_t: float
    p50_co2_t_per_t: float
    p90_co2_t_per_t: float
    compliance_probability_pct: float
    compliant_runs: int
