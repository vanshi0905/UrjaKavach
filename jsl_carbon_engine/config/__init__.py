"""
Configuration module for JSL Carbon Engine.
"""

from jsl_carbon_engine.config.jsl_facilities import FACILITIES, JAJPUR_WORKS, HISAR_WORKS, get_facility, FacilityProfile
from jsl_carbon_engine.config.emission_factors import (
    RAW_MATERIALS,
    NATURAL_GAS_EF,
    GRAPHITE_ELECTRODE_CONSUMPTION_KG_T,
    ELECTRODE_CARBON_PCT,
    METALLURGICAL_RECOVERIES,
    PRODUCTS,
    CASTING_ROUTES,
    REFINING_ROUTES,
    GRID_FACTORS,
    BENCHMARKS,
    RawMaterialEF,
    ProductDefinition,
    CastingProcess,
    RefiningProcess,
)

__all__ = [
    "FACILITIES",
    "JAJPUR_WORKS",
    "HISAR_WORKS",
    "get_facility",
    "FacilityProfile",
    "RAW_MATERIALS",
    "NATURAL_GAS_EF",
    "GRAPHITE_ELECTRODE_CONSUMPTION_KG_T",
    "ELECTRODE_CARBON_PCT",
    "METALLURGICAL_RECOVERIES",
    "PRODUCTS",
    "CASTING_ROUTES",
    "REFINING_ROUTES",
    "GRID_FACTORS",
    "BENCHMARKS",
    "RawMaterialEF",
    "ProductDefinition",
    "CastingProcess",
    "RefiningProcess",
]
