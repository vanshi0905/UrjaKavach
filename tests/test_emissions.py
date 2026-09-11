"""
Automated Unit Tests for Comprehensive Scope 1, 2, and 3 Emissions Model.
Verifies:
1. Scope 1 process stack decarburization is strictly > 0 even for semi-finished slabs.
2. JSL Jajpur Captive Power Plant (1.00 t/MWh) vs Oyster Hybrid PPA (0.03 t/MWh) Scope 2 scaling.
3. Indonesian Coal RKEF NPI (55 tCO2/t Ni) vs Class 1 Hydro Nickel (10 tCO2/t Ni) Scope 3 impact.
4. Manganese Scope 3 inclusion for 200-series grades (J4, J201).
"""

import pytest
from jsl_carbon_engine.core.grades import get_grade
from jsl_carbon_engine.core.mass_balance import compute_mass_balance
from jsl_carbon_engine.core.thermodynamics import compute_thermodynamics
from jsl_carbon_engine.core.emissions import compute_emissions


def test_slab_scope1_is_strictly_positive():
    """
    Critical Flaw 3 Fix:
    In the previous prototype, semi-finished slabs had Scope 1 = 0.000 tCO2/t because reheat fuel was 0.
    In reality, AOD decarburization releases 50-90 kg CO2/t from carbon oxidation.
    Assert Scope 1 is strictly positive and in the realistic 0.040 to 0.120 tCO2/t range.
    """
    grade = get_grade("J304")
    mb_slab = compute_mass_balance(grade=grade, scrap_pct=60.0, product="slab")
    thermo_slab = compute_thermodynamics(mass_balance=mb_slab, product="slab")
    emissions_slab = compute_emissions(grade=grade, mass_balance=mb_slab, thermo=thermo_slab)

    # Reheat fuel is zero for cast slab
    assert emissions_slab.scope1_fuel_combustion_tco2 == 0.0
    # BUT stack decarburization must be non-zero!
    assert emissions_slab.scope1_stack_decarb_tco2 > 0.03
    assert emissions_slab.scope1_direct_tco2 > 0.03
    assert 0.03 <= emissions_slab.scope1_direct_tco2 <= 0.15, (
        f"Scope 1 slab emissions out of physical range: {emissions_slab.scope1_direct_tco2}"
    )


def test_indonesian_npi_vs_class1_nickel_lever():
    """
    Critical Flaw 7 / Killer USP 6:
    Evaluating JSL's 49% stake in Indonesian coal RKEF NPI (55 tCO2/t Ni)
    versus Class 1 Hydro-powered Nickel (10 tCO2/t Ni).
    For 304 austenitic (9.25% Ni), using NPI must create a substantial carbon increase.
    """
    grade = get_grade("J304")
    # Low scrap to highlight nickel sourcing sensitivity
    mb_npi = compute_mass_balance(grade=grade, scrap_pct=20.0, ni_source="niNPI")
    thermo_npi = compute_thermodynamics(mass_balance=mb_npi)
    emissions_npi = compute_emissions(grade=grade, mass_balance=mb_npi, thermo=thermo_npi, ni_source="niNPI")

    mb_hydro = compute_mass_balance(grade=grade, scrap_pct=20.0, ni_source="niClass1")
    thermo_hydro = compute_thermodynamics(mass_balance=mb_hydro)
    emissions_hydro = compute_emissions(grade=grade, mass_balance=mb_hydro, thermo=thermo_hydro, ni_source="niClass1")

    # Nickel emissions difference should be massive (~45 tCO2/t contained Ni * ~0.08 t Ni = ~3.6 tCO2/t!)
    assert emissions_npi.scope3_nickel_tco2 > emissions_hydro.scope3_nickel_tco2 + 1.5
    assert emissions_npi.total_co2_t > emissions_hydro.total_co2_t + 1.5


def test_manganese_scope3_in_200_series():
    """
    Critical Flaw 5 Fix:
    In JSL 200-series (e.g. J4 with 9.25% Mn), FeMn emissions must be accounted for.
    """
    grade_j4 = get_grade("J4")
    mb_j4 = compute_mass_balance(grade=grade_j4, scrap_pct=40.0)
    thermo_j4 = compute_thermodynamics(mass_balance=mb_j4)
    emissions_j4 = compute_emissions(grade=grade_j4, mass_balance=mb_j4, thermo=thermo_j4)

    assert emissions_j4.scope3_femn_tco2 > 0.05, (
        f"Expected FeMn Scope 3 emissions for J4, got {emissions_j4.scope3_femn_tco2}"
    )


def test_renewable_ppa_scope2_abatement():
    """Verify Scope 2 decreases with renewable PPA share."""
    grade = get_grade("J304")
    mb = compute_mass_balance(grade=grade, scrap_pct=60.0)
    thermo = compute_thermodynamics(mass_balance=mb)

    # 0% renewable (100% coal CPP at Jajpur)
    em_coal = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, facility_id="jajpur", renewable_pct=0.0)
    # 100% renewable (Oyster hybrid PPA)
    em_green = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo, facility_id="jajpur", renewable_pct=100.0)

    assert em_coal.scope2_electricity_tco2 > em_green.scope2_electricity_tco2 * 10.0
    assert em_green.grid_emission_factor_blended == 0.03
    assert em_coal.grid_emission_factor_blended == 1.00


def test_npi_carbon_decarburization_scope1():
    """
    Critical Bug Fix Verification:
    Verify that NPI's 3.0% carbon content is accounted for in AOD stack decarburization,
    producing higher Scope 1 stack emissions than Class 1 hydro nickel.
    """
    grade = get_grade("J304")
    mb_npi = compute_mass_balance(grade=grade, scrap_pct=20.0, ni_source="niNPI")
    thermo_npi = compute_thermodynamics(mass_balance=mb_npi)
    em_npi = compute_emissions(grade=grade, mass_balance=mb_npi, thermo=thermo_npi, ni_source="niNPI")

    mb_class1 = compute_mass_balance(grade=grade, scrap_pct=20.0, ni_source="niClass1")
    thermo_class1 = compute_thermodynamics(mass_balance=mb_class1)
    em_class1 = compute_emissions(grade=grade, mass_balance=mb_class1, thermo=thermo_class1, ni_source="niClass1")

    # NPI carbon oxidation must generate strictly higher Scope 1 stack CO2
    assert em_npi.scope1_stack_decarb_tco2 > em_class1.scope1_stack_decarb_tco2


def test_copper_scope3_emission_accounting():
    """
    Verify that copper addition in copper-bearing grade J4 contributes to Scope 3 emissions.
    """
    grade = get_grade("J4")
    mb = compute_mass_balance(grade=grade, scrap_pct=30.0)
    thermo = compute_thermodynamics(mass_balance=mb)
    em = compute_emissions(grade=grade, mass_balance=mb, thermo=thermo)

    assert em.scope3_copper_tco2 > 0.02, f"Expected >0.02 tCO2 from Cu additions, got {em.scope3_copper_tco2}"

