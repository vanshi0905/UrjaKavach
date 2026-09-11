"""
Core metallurgical, thermodynamic, emissions, financial, and optimization engines.
"""

from jsl_carbon_engine.core.grades import GRADES, Grade, get_grade, list_grades_by_family, get_pren
from jsl_carbon_engine.core.mass_balance import compute_mass_balance, MassBalanceResult
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics, ThermodynamicResult
from jsl_carbon_engine.core.emissions import compute_emissions, EmissionsResult
from jsl_carbon_engine.core.slag_kinetics import compute_slag_kinetics, SlagKineticsResult
from jsl_carbon_engine.core.financials import compute_financials, FinancialResult
from jsl_carbon_engine.core.optimizer import (
    solve_charge_optimizer,
    compute_pareto_frontier,
    monte_carlo_pareto,
    OptimizerResult,
    ParetoPoint,
    ParetoFrontierResult,
    MonteCarloResult,
)

__all__ = [
    "GRADES",
    "Grade",
    "get_grade",
    "list_grades_by_family",
    "get_pren",
    "compute_mass_balance",
    "MassBalanceResult",
    "compute_thermodynamics",
    "ThermodynamicResult",
    "compute_emissions",
    "EmissionsResult",
    "compute_slag_kinetics",
    "SlagKineticsResult",
    "compute_financials",
    "FinancialResult",
    "solve_charge_optimizer",
    "compute_pareto_frontier",
    "monte_carlo_pareto",
    "OptimizerResult",
    "ParetoPoint",
    "ParetoFrontierResult",
    "MonteCarloResult",
]
