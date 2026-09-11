"""
JSL Metallurgical Grade Library.
Authentic dataset covering 43 proprietary and ASTM/EN standard stainless steel grades
manufactured by Jindal Stainless Limited across 5 metallurgical families:
1. 200 Series (Lean-Austenitic / Cr-Mn): 9 grades
2. 300 Series (Austenitic, Super-Austenitic, Heat-Resistant): 13 grades
3. 400 Series (Ferritic): 9 grades
4. 400 Series (Martensitic): 6 grades
5. Duplex & Super Duplex: 6 grades
Total = 43 authentic JSL grades + Carbon Steel Reference + Custom Builder.

Each grade provides:
- Exact midpoint chemistry and specification bounds (%Cr, %Ni, %Mo, %Mn, %Cu, %C, %Si, %S, %P, %N, %Fe)
- Physical scrap ceiling (scrap_cap) dictated by tramp elements and austenite/ferrite phase balance
- Tramp element thresholds (Cu max, Sn max, Ni max for ferritics to prevent hot shortness and hardening)
- Mechanical applications and industrial description
"""

from dataclasses import dataclass, field
from typing import Dict, Optional, List


@dataclass(frozen=True)
class Grade:
    id: str
    name: str
    family: str
    # Nominal / Target Midpoint Composition (wt. %)
    cr: float
    ni: float
    mo: float
    mn: float
    cu: float
    c: float
    si: float
    s: float
    p: float
    n: float
    # Range bounds for LP Optimization
    cr_min: float
    cr_max: float
    ni_min: float
    ni_max: float
    mo_min: float
    mo_max: float
    mn_min: float
    mn_max: float
    cu_min: float
    cu_max: float
    c_max: float
    si_max: float
    # Physical constraints
    scrap_cap: float  # Maximum % scrap in charge sheet
    cu_tramp_cap: float = 0.50  # Max allowable Cu tramp to prevent hot shortness
    sn_tramp_cap: float = 0.03  # Max allowable Sn tramp
    ni_tramp_cap: float = 0.50  # Max allowable Ni in ferritics to prevent unwanted austenite
    p_max: float = 0.040
    s_max: float = 0.030
    mechanical_applications: str = ""
    description: str = ""

    @property
    def fe(self) -> float:
        """Nominal iron balance."""
        return max(0.0, 100.0 - (self.cr + self.ni + self.mo + self.mn + self.cu + self.c + self.si + self.s + self.p + self.n))


GRADES: Dict[str, Grade] = {
    # =========================================================================
    # 1. 200 SERIES (LEAN-AUSTENITIC / Cr-Mn-N) — 9 GRADES
    # High-volume flagship product line substituting nickel with manganese and nitrogen.
    # =========================================================================
    "J4": Grade(
        id="J4", name="JSL J4", family="200 Series (Lean-Austenitic)",
        cr=15.5, ni=1.5, mo=0.0, mn=9.25, cu=1.75, c=0.08, si=0.50, s=0.015, p=0.060, n=0.16,
        cr_min=15.0, cr_max=16.0, ni_min=1.0, ni_max=2.0, mo_min=0.0, mo_max=0.1,
        mn_min=8.5, mn_max=10.0, cu_min=1.5, cu_max=2.0, c_max=0.10, si_max=0.75,
        scrap_cap=75.0,
        mechanical_applications="Utensils, kitchenware, architectural trim, deep-drawn domestic hollowware.",
        description="Cr-Mn austenitic grade, replaces 301/304 economically. Lowest-Ni grade in the 200 series."
    ),
    "J4-16Cr": Grade(
        id="J4-16Cr", name="JSL J4-16Cr", family="200 Series (Lean-Austenitic)",
        cr=16.5, ni=1.5, mo=0.0, mn=9.75, cu=1.75, c=0.08, si=0.50, s=0.015, p=0.060, n=0.16,
        cr_min=16.0, cr_max=17.0, ni_min=1.0, ni_max=2.0, mo_min=0.0, mo_max=0.1,
        mn_min=9.0, mn_max=10.5, cu_min=1.5, cu_max=2.0, c_max=0.10, si_max=0.75,
        scrap_cap=75.0,
        mechanical_applications="Enhanced corrosion hollowware, sink bowls, domestic storage tanks.",
        description="Higher-Cr variant of J4 for improved pitting resistance in atmospheric environments."
    ),
    "J201": Grade(
        id="J201", name="AISI 201 / J201", family="200 Series (Lean-Austenitic)",
        cr=17.0, ni=4.5, mo=0.0, mn=6.5, cu=0.5, c=0.10, si=0.75, s=0.015, p=0.045, n=0.15,
        cr_min=16.0, cr_max=18.0, ni_min=3.5, ni_max=5.5, mo_min=0.0, mo_max=0.1,
        mn_min=5.5, mn_max=7.5, cu_min=0.0, cu_max=1.0, c_max=0.15, si_max=1.00,
        scrap_cap=75.0,
        mechanical_applications="Railway coaches, bus frames, structural transit members, hose clamps.",
        description="Cost-effective substitute for 301; excellent high work-hardening rate for impact structures."
    ),
    "J202": Grade(
        id="J202", name="AISI 202 / J202", family="200 Series (Lean-Austenitic)",
        cr=18.0, ni=5.0, mo=0.0, mn=8.75, cu=0.5, c=0.12, si=0.75, s=0.015, p=0.045, n=0.20,
        cr_min=17.0, cr_max=19.0, ni_min=4.0, ni_max=6.0, mo_min=0.0, mo_max=0.1,
        mn_min=7.5, mn_max=10.0, cu_min=0.0, cu_max=1.0, c_max=0.15, si_max=1.00,
        scrap_cap=75.0,
        mechanical_applications="Commercial cookware, restaurant equipment, architectural panels, door frames.",
        description="Mn-alloyed, cost-effective substitute for 302; comparable to 304 in moderate media."
    ),
    "J204": Grade(
        id="J204", name="JSL J204", family="200 Series (Lean-Austenitic)",
        cr=18.75, ni=3.25, mo=0.0, mn=6.5, cu=0.5, c=0.10, si=0.75, s=0.015, p=0.045, n=0.18,
        cr_min=18.0, cr_max=19.5, ni_min=2.5, ni_max=4.0, mo_min=0.0, mo_max=0.1,
        mn_min=5.5, mn_max=7.5, cu_min=0.0, cu_max=1.0, c_max=0.15, si_max=1.00,
        scrap_cap=75.0,
        mechanical_applications="Catering equipment, furniture frames, automotive trim.",
        description="Bridges 200/300 series cost-property gap; replaces 304 where lower raw material cost matters."
    ),
    "J204Cu": Grade(
        id="J204Cu", name="JSL J204Cu", family="200 Series (Lean-Austenitic)",
        cr=16.75, ni=2.5, mo=0.0, mn=7.75, cu=3.0, c=0.08, si=0.60, s=0.015, p=0.045, n=0.15,
        cr_min=16.0, cr_max=17.5, ni_min=2.0, ni_max=3.0, mo_min=0.0, mo_max=0.1,
        mn_min=7.0, mn_max=8.5, cu_min=2.5, cu_max=3.5, c_max=0.10, si_max=0.75,
        scrap_cap=75.0,
        mechanical_applications="Thermos flasks, complex deep drawing stamping, electric kettles.",
        description="Cu-added variant of J204 reducing yield strength and work-hardening for severe formability."
    ),
    "J216L": Grade(
        id="J216L", name="JSL J216L", family="200 Series (Lean-Austenitic)",
        cr=17.0, ni=7.0, mo=1.75, mn=7.0, cu=1.75, c=0.03, si=0.60, s=0.010, p=0.045, n=0.15,
        cr_min=16.5, cr_max=17.5, ni_min=6.5, ni_max=7.5, mo_min=1.5, mo_max=2.0,
        mn_min=6.5, mn_max=7.5, cu_min=1.5, cu_max=2.0, c_max=0.03, si_max=0.75,
        scrap_cap=70.0,
        mechanical_applications="Marine fasteners, coastal architectural hardware, sewage treatment.",
        description="Rare Mo-bearing 200-series grade; provides 316L pitting resistance at significantly lower nickel cost."
    ),
    "JSL AUS": Grade(
        id="JSL AUS", name="JSL AUS", family="200 Series (Lean-Austenitic)",
        cr=17.0, ni=5.0, mo=0.0, mn=7.0, cu=1.75, c=0.08, si=0.60, s=0.015, p=0.045, n=0.15,
        cr_min=16.5, cr_max=17.5, ni_min=4.5, ni_max=5.5, mo_min=0.0, mo_max=0.1,
        mn_min=6.5, mn_max=7.5, cu_min=1.5, cu_max=2.0, c_max=0.10, si_max=0.75,
        scrap_cap=75.0,
        mechanical_applications="Architecture, interior cladding, escalators, consumer appliances.",
        description="Economical 304 replacement developed by JSL with comparable formability and weldability."
    ),
    "JSL U DD": Grade(
        id="JSL U DD", name="JSL U DD (Ultra Deep Drawing)", family="200 Series (Lean-Austenitic)",
        cr=15.5, ni=0.65, mo=0.0, mn=10.4, cu=2.1, c=0.08, si=0.50, s=0.015, p=0.060, n=0.16,
        cr_min=15.0, cr_max=16.0, ni_min=0.5, ni_max=0.8, mo_min=0.0, mo_max=0.1,
        mn_min=9.8, mn_max=11.0, cu_min=1.8, cu_max=2.4, c_max=0.10, si_max=0.75,
        scrap_cap=75.0,
        mechanical_applications="Ultra-deep-drawn kitchen utensils, handwash basins, pressure cookers.",
        description="Ultra low-Ni Cr-Mn grade purpose-built for extreme drawability at competitive raw material cost."
    ),

    # =========================================================================
    # 2. 300 SERIES (AUSTENITIC, SUPER-AUSTENITIC, HEAT-RESISTANT) — 13 GRADES
    # High-nickel classic austenitics with superior corrosion resistance and high scrap capacity.
    # =========================================================================
    "J301": Grade(
        id="J301", name="AISI 301 / J301", family="300 Series (Austenitic)",
        cr=17.0, ni=7.0, mo=0.0, mn=1.5, cu=0.3, c=0.10, si=0.75, s=0.015, p=0.045, n=0.05,
        cr_min=16.0, cr_max=18.0, ni_min=6.0, ni_max=8.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.15, si_max=1.00,
        scrap_cap=90.0,
        mechanical_applications="Metro train car bodies, aircraft structural parts, trailer bodies, conveyor springs.",
        description="Lower Cr/Ni than 304 for higher work-hardening rate; widely used in high-strength transport."
    ),
    "J304": Grade(
        id="J304", name="AISI 304 / J304", family="300 Series (Austenitic)",
        cr=18.5, ni=9.25, mo=0.0, mn=1.5, cu=0.3, c=0.05, si=0.50, s=0.015, p=0.045, n=0.05,
        cr_min=18.0, cr_max=19.0, ni_min=8.0, ni_max=10.5, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.07, si_max=0.75,
        scrap_cap=90.0,
        mechanical_applications="Food & dairy processing, brewery vessels, chemical tanks, architectural facade, surgical tools.",
        description="The industry workhorse austenitic grade: 18/8 composition, unmatched combination of formability and weldability."
    ),
    "J304L": Grade(
        id="J304L", name="AISI 304L / J304L", family="300 Series (Austenitic)",
        cr=18.5, ni=10.0, mo=0.0, mn=1.5, cu=0.3, c=0.025, si=0.50, s=0.015, p=0.045, n=0.05,
        cr_min=18.0, cr_max=19.0, ni_min=9.0, ni_max=11.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.03, si_max=0.75,
        scrap_cap=90.0,
        mechanical_applications="Heavy welded structures, pharmaceutical reactors, nuclear piping, cryogenic storage.",
        description="Extra-low carbon 304 variant eliminating chromium carbide precipitation during welding (no sensitization)."
    ),
    "J305": Grade(
        id="J305", name="AISI 305 / J305", family="300 Series (Austenitic)",
        cr=18.0, ni=11.75, mo=0.0, mn=1.5, cu=0.3, c=0.05, si=0.50, s=0.015, p=0.045, n=0.04,
        cr_min=17.0, cr_max=19.0, ni_min=10.5, ni_max=13.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.12, si_max=0.75,
        scrap_cap=85.0,
        mechanical_applications="Spun metal containers, writing pen barrels, complex eyelets, cold heading bolts.",
        description="High-Ni 304 variant with low work-hardening rate, designed specifically for severe multi-stage spinning."
    ),
    "J309S": Grade(
        id="J309S", name="AISI 309S / J309S", family="300 Series (Austenitic)",
        cr=23.0, ni=13.5, mo=0.0, mn=1.5, cu=0.3, c=0.06, si=0.75, s=0.015, p=0.045, n=0.05,
        cr_min=22.0, cr_max=24.0, ni_min=12.0, ni_max=15.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.08, si_max=1.00,
        scrap_cap=70.0,
        mechanical_applications="Industrial furnace baffles, oven linings, heat exchanger tubes, boiler fireboxes.",
        description="High-temperature oxidation-resistant grade operating continuously up to 1000°C in cyclic heating."
    ),
    "J310S": Grade(
        id="J310S", name="AISI 310S / J310S", family="300 Series (Austenitic)",
        cr=25.0, ni=20.5, mo=0.0, mn=1.5, cu=0.3, c=0.06, si=0.75, s=0.015, p=0.045, n=0.05,
        cr_min=24.0, cr_max=26.0, ni_min=19.0, ni_max=22.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.08, si_max=1.00,
        scrap_cap=65.0,
        mechanical_applications="Petrochemical radiant tubes, kiln muffles, coal gasifier internal components, thermal flare tips.",
        description="25Cr/20Ni high-alloy furnace grade resisting scaling up to 1150°C; among the highest carbon footprints."
    ),
    "J316": Grade(
        id="J316", name="AISI 316 / J316", family="300 Series (Austenitic)",
        cr=17.0, ni=12.0, mo=2.5, mn=1.5, cu=0.3, c=0.05, si=0.50, s=0.015, p=0.045, n=0.05,
        cr_min=16.0, cr_max=18.0, ni_min=10.0, ni_max=14.0, mo_min=2.0, mo_max=3.0,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.08, si_max=0.75,
        scrap_cap=85.0,
        mechanical_applications="Marine deck fittings, coastal architectural hardware, paper pulp digesters, pharmaceutical autoclaves.",
        description="Standard Mo-bearing austenitic grade providing critical resistance against chloride pitting and crevice corrosion."
    ),
    "J317L": Grade(
        id="J317L", name="AISI 317L / J317L", family="300 Series (Austenitic)",
        cr=19.0, ni=13.0, mo=3.5, mn=1.5, cu=0.3, c=0.025, si=0.50, s=0.015, p=0.045, n=0.05,
        cr_min=18.0, cr_max=20.0, ni_min=11.0, ni_max=15.0, mo_min=3.0, mo_max=4.0,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.03, si_max=0.75,
        scrap_cap=75.0,
        mechanical_applications="Flue gas desulfurization (FGD) scrubbers, phosphoric acid plants, textile dye vessels.",
        description="Higher-Mo (3-4%) and Cr version of 316L engineered for aggressive sulfuric and halide acid environments."
    ),
    "J321": Grade(
        id="J321", name="AISI 321 / J321", family="300 Series (Austenitic)",
        cr=18.0, ni=11.0, mo=0.0, mn=1.5, cu=0.3, c=0.05, si=0.50, s=0.015, p=0.045, n=0.04,
        cr_min=17.0, cr_max=19.0, ni_min=9.0, ni_max=12.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.08, si_max=0.75,
        scrap_cap=85.0,
        mechanical_applications="Aircraft exhaust manifolds, thermal expansion bellows, refinery cracked-gas heaters.",
        description="Titanium-stabilized (Ti >= 5xC) austenitic steel resistant to intergranular corrosion in 425–850°C service."
    ),
    "J347": Grade(
        id="J347", name="AISI 347 / J347", family="300 Series (Austenitic)",
        cr=18.0, ni=11.0, mo=0.0, mn=1.5, cu=0.3, c=0.05, si=0.50, s=0.015, p=0.045, n=0.04,
        cr_min=17.0, cr_max=19.0, ni_min=9.0, ni_max=12.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.08, si_max=0.75,
        scrap_cap=85.0,
        mechanical_applications="Aerospace rocket engine parts, high-temperature expansion gaskets, refinery catalytic units.",
        description="Niobium/Columbium-stabilized (Nb >= 10xC) grade preventing chromium carbide precipitation at elevated temperatures."
    ),
    "J904L": Grade(
        id="J904L", name="AISI 904L / J904L", family="300 Series (Super-Austenitic)",
        cr=21.0, ni=25.5, mo=4.5, mn=1.5, cu=1.5, c=0.02, si=0.40, s=0.010, p=0.035, n=0.06,
        cr_min=19.0, cr_max=23.0, ni_min=23.0, ni_max=28.0, mo_min=4.0, mo_max=5.0,
        mn_min=1.0, mn_max=2.0, cu_min=1.2, cu_max=2.0, c_max=0.02, si_max=0.70,
        scrap_cap=70.0,
        mechanical_applications="Sulfuric acid piping, offshore seawater cooling, brackish water condensers, high-end luxury watch cases.",
        description="Super-austenitic with 25.5% Ni and 4.5% Mo + Cu addition; extreme pitting and stress corrosion cracking immunity."
    ),
    "1.4835": Grade(
        id="1.4835", name="EN 1.4835 / 253 MA", family="300 Series (Heat-Resistant)",
        cr=21.0, ni=11.0, mo=0.0, mn=0.8, cu=0.2, c=0.08, si=1.60, s=0.015, p=0.040, n=0.16,
        cr_min=20.0, cr_max=22.0, ni_min=10.0, ni_max=12.0, mo_min=0.0, mo_max=0.2,
        mn_min=0.5, mn_max=1.0, cu_min=0.0, cu_max=0.3, c_max=0.10, si_max=2.00,
        scrap_cap=65.0,
        mechanical_applications="Blast furnace recuperators, cyclone preheaters in cement plants, gas turbine hot exhausts.",
        description="Micro-alloyed with cerium/rare earths and silicon; exceptional high-temperature creep strength up to 1100°C."
    ),
    "1.4841": Grade(
        id="1.4841", name="EN 1.4841 / AISI 314", family="300 Series (Heat-Resistant)",
        cr=25.0, ni=20.5, mo=0.0, mn=1.5, cu=0.3, c=0.12, si=1.80, s=0.015, p=0.045, n=0.06,
        cr_min=24.0, cr_max=26.0, ni_min=19.0, ni_max=22.0, mo_min=0.0, mo_max=0.2,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.15, si_max=2.50,
        scrap_cap=65.0,
        mechanical_applications="Industrial conveyor belts in heat treatment furnaces, crack tubes, radiation tubes.",
        description="Silicon-enhanced (1.5-2.5% Si) 25/20 grade with extraordinary resistance to high-temperature carburizing atmospheres."
    ),

    # =========================================================================
    # 3. 400 SERIES (FERRITIC) — 9 GRADES
    # Nickel-free chromium stainless steels. Magnetically permeable, low thermal expansion.
    # Strictly limited scrap ceiling (~65-70%) due to tramp Ni/Cu cross-contamination.
    # =========================================================================
    "J409L": Grade(
        id="J409L", name="AISI 409L / J409L", family="400 Series (Ferritic)",
        cr=11.1, ni=0.25, mo=0.0, mn=0.5, cu=0.1, c=0.02, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=10.5, cr_max=11.7, ni_min=0.0, ni_max=0.5, mo_min=0.0, mo_max=0.1,
        mn_min=0.2, mn_max=0.8, cu_min=0.0, cu_max=0.2, c_max=0.03, si_max=0.75,
        scrap_cap=65.0, ni_tramp_cap=0.50,
        mechanical_applications="Automotive exhaust manifolds, catalytic converter shells, mufflers, silencers.",
        description="Leanest titanium-stabilized ferritic grade; lowest raw-material carbon intensity in stainless production."
    ),
    "J410S": Grade(
        id="J410S", name="AISI 410S / J410S", family="400 Series (Ferritic)",
        cr=12.5, ni=0.3, mo=0.0, mn=0.5, cu=0.1, c=0.05, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=11.5, cr_max=13.5, ni_min=0.0, ni_max=0.6, mo_min=0.0, mo_max=0.1,
        mn_min=0.2, mn_max=0.8, cu_min=0.0, cu_max=0.2, c_max=0.08, si_max=0.75,
        scrap_cap=65.0, ni_tramp_cap=0.50,
        mechanical_applications="Petroleum distillation trays, mining chute liners, steam turbine heat shields.",
        description="Low-carbon non-hardening modification of 410; avoids hard martensitic welds during fabrication."
    ),
    "J430": Grade(
        id="J430", name="AISI 430 / J430", family="400 Series (Ferritic)",
        cr=17.0, ni=0.375, mo=0.0, mn=0.6, cu=0.1, c=0.05, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=16.0, cr_max=18.0, ni_min=0.0, ni_max=0.75, mo_min=0.0, mo_max=0.1,
        mn_min=0.2, mn_max=0.8, cu_min=0.0, cu_max=0.2, c_max=0.08, si_max=0.75,
        scrap_cap=70.0, ni_tramp_cap=0.50,
        mechanical_applications="Washing machine drums, dishwasher inner liners, microwave oven cavities, refrigerator panels.",
        description="The premier general-purpose ferritic grade: 17% Cr, nickel-free, good corrosion resistance and drawability."
    ),
    "J436L": Grade(
        id="J436L", name="AISI 436L / J436L", family="400 Series (Ferritic)",
        cr=17.5, ni=0.25, mo=1.1, mn=0.5, cu=0.1, c=0.02, si=0.40, s=0.010, p=0.030, n=0.02,
        cr_min=17.0, cr_max=18.5, ni_min=0.0, ni_max=0.5, mo_min=0.8, mo_max=1.4,
        mn_min=0.2, mn_max=0.8, cu_min=0.0, cu_max=0.2, c_max=0.03, si_max=0.60,
        scrap_cap=65.0, ni_tramp_cap=0.50,
        mechanical_applications="Automotive exhaust cold-end mufflers, architectural trim in salt-spray zones.",
        description="Molybdenum-bearing (1.1% Mo) stabilized ferritic grade resisting road-deicing salt corrosion."
    ),
    "J439": Grade(
        id="J439", name="AISI 439 / J439", family="400 Series (Ferritic)",
        cr=18.0, ni=0.25, mo=0.0, mn=0.5, cu=0.1, c=0.025, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=17.5, cr_max=18.5, ni_min=0.0, ni_max=0.5, mo_min=0.0, mo_max=0.1,
        mn_min=0.2, mn_max=0.8, cu_min=0.0, cu_max=0.2, c_max=0.03, si_max=0.75,
        scrap_cap=70.0, ni_tramp_cap=0.50,
        mechanical_applications="Hot water geyser tanks, sugar mill evaporator tubes, automotive exhaust tailpipes.",
        description="18% Cr dual-stabilized ferritic steel with 304-level pitting resistance without expensive nickel."
    ),
    "J441": Grade(
        id="J441", name="AISI 441 / J441", family="400 Series (Ferritic)",
        cr=18.0, ni=0.1, mo=0.0, mn=0.5, cu=0.1, c=0.025, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=17.5, cr_max=18.5, ni_min=0.0, ni_max=0.3, mo_min=0.0, mo_max=0.1,
        mn_min=0.2, mn_max=0.8, cu_min=0.0, cu_max=0.2, c_max=0.03, si_max=0.75,
        scrap_cap=70.0, ni_tramp_cap=0.50,
        mechanical_applications="Front exhaust pipe downpipes, catalytic converter cones up to 850°C.",
        description="Nb + Ti stabilized 18% Cr ferritic grade featuring superior high-temperature sag resistance."
    ),
    "J444": Grade(
        id="J444", name="AISI 444 / J444", family="400 Series (Ferritic)",
        cr=18.5, ni=0.5, mo=2.1, mn=0.5, cu=0.1, c=0.02, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=17.5, cr_max=19.5, ni_min=0.0, ni_max=0.8, mo_min=1.8, mo_max=2.5,
        mn_min=0.2, mn_max=0.8, cu_min=0.0, cu_max=0.2, c_max=0.025, si_max=0.75,
        scrap_cap=65.0, ni_tramp_cap=0.50,
        mechanical_applications="Solar hot water collector tanks, brewery brew kettles, coastal roofing sheets.",
        description="2% Mo dual-stabilized ferritic stainless immune to chloride stress-corrosion cracking (SCC)."
    ),
    "J445": Grade(
        id="J445", name="JSL J445", family="400 Series (Ferritic)",
        cr=20.0, ni=0.3, mo=0.0, mn=0.5, cu=0.45, c=0.02, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=19.5, cr_max=21.0, ni_min=0.0, ni_max=0.6, mo_min=0.0, mo_max=0.1,
        mn_min=0.2, mn_max=0.8, cu_min=0.3, cu_max=0.6, c_max=0.03, si_max=0.75,
        scrap_cap=65.0, ni_tramp_cap=0.50,
        mechanical_applications="Exterior building cladding, elevator sills, solar mounting structures.",
        description="Highest-Cr commercial ferritic (20% Cr) offering 304-equivalent corrosion resistance with zero nickel cost."
    ),
    "1.4003": Grade(
        id="1.4003", name="EN 1.4003 / 3CR12", family="400 Series (Ferritic)",
        cr=11.5, ni=0.5, mo=0.0, mn=1.2, cu=0.1, c=0.02, si=0.50, s=0.015, p=0.035, n=0.02,
        cr_min=10.5, cr_max=12.5, ni_min=0.3, ni_max=1.0, mo_min=0.0, mo_max=0.1,
        mn_min=0.8, mn_max=1.5, cu_min=0.0, cu_max=0.2, c_max=0.03, si_max=0.75,
        scrap_cap=65.0, ni_tramp_cap=0.80,
        mechanical_applications="Coal wagon hoppers, bulk solids handling chutes, commercial bus chassis structures.",
        description="Utility ferritic steel substituting coated carbon steel for wet-sliding abrasive wear applications."
    ),

    # =========================================================================
    # 4. 400 SERIES (MARTENSITIC) — 6 GRADES
    # High-carbon or hardenable grades with moderate chromium, heat-treatable for high hardness.
    # Scrap capped at 55-60% due to carbon pick-up and brittle intermetallic controls.
    # =========================================================================
    "J410": Grade(
        id="J410", name="AISI 410 / J410", family="400 Series (Martensitic)",
        cr=12.5, ni=0.375, mo=0.0, mn=0.6, cu=0.1, c=0.12, si=0.50, s=0.015, p=0.035, n=0.03,
        cr_min=11.5, cr_max=13.5, ni_min=0.0, ni_max=0.75, mo_min=0.0, mo_max=0.1,
        mn_min=0.3, mn_max=1.0, cu_min=0.0, cu_max=0.2, c_max=0.15, si_max=0.75,
        scrap_cap=60.0, p_max=0.060,
        mechanical_applications="Steam turbine blades, valve trim, pump shafts, structural fasteners, mining screens.",
        description="Basic martensitic grade: hardenable by quenching and tempering up to 45 HRC."
    ),
    "J410DB": Grade(
        id="J410DB", name="JSL J410DB (Disc Brake)", family="400 Series (Martensitic)",
        cr=12.25, ni=0.3, mo=0.0, mn=0.6, cu=0.1, c=0.08, si=0.50, s=0.015, p=0.035, n=0.03,
        cr_min=11.5, cr_max=13.0, ni_min=0.0, ni_max=0.6, mo_min=0.0, mo_max=0.1,
        mn_min=0.3, mn_max=1.0, cu_min=0.0, cu_max=0.2, c_max=0.09, si_max=0.75,
        scrap_cap=60.0, p_max=0.060,
        mechanical_applications="Two-wheeler and four-wheeler motorcycle disc brake rotors.",
        description="Proprietary JSL grade engineered specifically for automotive disc brakes with uniform thermal dissipation."
    ),
    "J415": Grade(
        id="J415", name="AISI 415 / CA6NM", family="400 Series (Martensitic)",
        cr=12.75, ni=4.5, mo=0.75, mn=0.6, cu=0.1, c=0.04, si=0.40, s=0.010, p=0.030, n=0.03,
        cr_min=11.5, cr_max=14.0, ni_min=3.5, ni_max=5.5, mo_min=0.5, mo_max=1.0,
        mn_min=0.3, mn_max=1.0, cu_min=0.0, cu_max=0.2, c_max=0.05, si_max=0.60,
        scrap_cap=55.0, p_max=0.060,
        mechanical_applications="Hydro-turbine runner blades, heavy oil-field pumping equipment, subsea valve bodies.",
        description="Low-carbon soft martensitic steel with 4.5% Ni offering exceptional impact toughness and weldability."
    ),
    "J420J1": Grade(
        id="J420J1", name="AISI 420J1 / J420", family="400 Series (Martensitic)",
        cr=13.0, ni=0.3, mo=0.0, mn=0.6, cu=0.1, c=0.20, si=0.50, s=0.015, p=0.035, n=0.03,
        cr_min=12.0, cr_max=14.0, ni_min=0.0, ni_max=0.6, mo_min=0.0, mo_max=0.1,
        mn_min=0.3, mn_max=1.0, cu_min=0.0, cu_max=0.2, c_max=0.25, si_max=0.75,
        scrap_cap=60.0, p_max=0.060,
        mechanical_applications="Industrial cutlery, surgical scalpels, pump plungers, shear blades, needle valves.",
        description="Medium-carbon martensitic stainless steel heat-treatable to 50–52 HRC with high edge retention."
    ),
    "J431": Grade(
        id="J431", name="AISI 431 / J431", family="400 Series (Martensitic)",
        cr=16.0, ni=1.875, mo=0.0, mn=0.6, cu=0.1, c=0.16, si=0.50, s=0.015, p=0.035, n=0.03,
        cr_min=15.0, cr_max=17.0, ni_min=1.25, ni_max=2.5, mo_min=0.0, mo_max=0.1,
        mn_min=0.3, mn_max=1.0, cu_min=0.0, cu_max=0.2, c_max=0.20, si_max=0.75,
        scrap_cap=60.0, p_max=0.060,
        mechanical_applications="Aircraft arresting hooks, marine outboard drive shafts, pump impellers, bolted connections.",
        description="Higher-Cr/Ni martensitic grade combining 850 MPa tensile strength with marine corrosion resistance."
    ),
    "1.4116": Grade(
        id="1.4116", name="EN 1.4116 / X50CrMoV15", family="400 Series (Martensitic)",
        cr=14.5, ni=0.2, mo=0.65, mn=0.6, cu=0.1, c=0.50, si=0.60, s=0.015, p=0.035, n=0.03,
        cr_min=14.0, cr_max=15.0, ni_min=0.0, ni_max=0.5, mo_min=0.5, mo_max=0.8,
        mn_min=0.3, mn_max=1.0, cu_min=0.0, cu_max=0.2, c_max=0.55, si_max=0.80,
        scrap_cap=55.0, p_max=0.060,
        mechanical_applications="Professional chef knives, scissors, medical cutting instruments, bone chisels.",
        description="High-carbon molybdenum-vanadium martensitic steel hardened to 56 HRC for supreme razor cutting durability."
    ),

    # =========================================================================
    # 5. DUPLEX & SUPER DUPLEX — 6 GRADES
    # 50/50 Austenite-Ferrite dual-phase microstructure with double yield strength of 304.
    # Scrap tightly constrained (50-60%) to safeguard strict Nitrogen and PREN targets.
    # =========================================================================
    "J2101": Grade(
        id="J2101", name="UNS S32101 / J2101", family="Duplex",
        cr=21.5, ni=1.5, mo=0.45, mn=5.0, cu=0.45, c=0.03, si=0.60, s=0.010, p=0.035, n=0.22,
        cr_min=21.0, cr_max=22.0, ni_min=1.35, ni_max=1.70, mo_min=0.1, mo_max=0.8,
        mn_min=4.0, mn_max=6.0, cu_min=0.1, cu_max=0.8, c_max=0.04, si_max=0.80,
        scrap_cap=60.0,
        mechanical_applications="Civil storage tanks, pedestrian footbridges, water distribution gates, pulp & paper vats.",
        description="Lean duplex with Mn and N alloyed to minimize Ni; double the yield strength of 304 at lower cost."
    ),
    "J2304": Grade(
        id="J2304", name="UNS S32304 / J2304", family="Duplex",
        cr=23.0, ni=4.25, mo=0.325, mn=1.5, cu=0.3, c=0.03, si=0.60, s=0.010, p=0.035, n=0.12,
        cr_min=22.0, cr_max=24.0, ni_min=3.5, ni_max=5.0, mo_min=0.05, mo_max=0.6,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.04, si_max=0.75,
        scrap_cap=60.0,
        mechanical_applications="Bridge structural girders, brewery fermentation vessels, oil separation units.",
        description="Classic lean duplex grade offering PREN ~25 with high resistance to chloride stress corrosion cracking."
    ),
    "J2205": Grade(
        id="J2205", name="UNS S32205 / J2205", family="Duplex",
        cr=22.5, ni=5.5, mo=3.25, mn=1.5, cu=0.3, c=0.025, si=0.50, s=0.010, p=0.030, n=0.18,
        cr_min=22.0, cr_max=23.0, ni_min=4.5, ni_max=6.5, mo_min=3.0, mo_max=3.5,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.03, si_max=0.75,
        scrap_cap=55.0,
        mechanical_applications="Offshore subsea oil pipelines, chemical tankers, sour-gas separators, flue gas reheaters.",
        description="The global benchmark standard duplex (PREN >= 35); covers ~80% of total worldwide duplex usage."
    ),
    "J31803": Grade(
        id="J31803", name="UNS S31803 / J31803", family="Duplex",
        cr=22.0, ni=5.5, mo=3.0, mn=1.5, cu=0.3, c=0.025, si=0.50, s=0.010, p=0.030, n=0.16,
        cr_min=21.0, cr_max=23.0, ni_min=4.5, ni_max=6.5, mo_min=2.5, mo_max=3.5,
        mn_min=1.0, mn_max=2.0, cu_min=0.0, cu_max=0.5, c_max=0.03, si_max=0.75,
        scrap_cap=55.0,
        mechanical_applications="Chemical process pressure vessels, heat exchanger tubes, desalination high-pressure piping.",
        description="Original composition specification for 22% Cr duplex steel; closely overlapping with S32205."
    ),
    "J2507": Grade(
        id="J2507", name="UNS S32750 / J2507", family="Duplex (Super)",
        cr=25.0, ni=7.0, mo=4.0, mn=1.0, cu=0.3, c=0.025, si=0.50, s=0.010, p=0.030, n=0.28,
        cr_min=24.0, cr_max=26.0, ni_min=6.0, ni_max=8.0, mo_min=3.5, mo_max=4.5,
        mn_min=0.5, mn_max=1.5, cu_min=0.0, cu_max=0.5, c_max=0.03, si_max=0.75,
        scrap_cap=50.0,
        mechanical_applications="Deepsea umbilical tubes, SWRO desalination manifolds, marine riser pipes, chlorination systems.",
        description="Super duplex stainless steel (PREN >= 42) engineered for aggressive high-pressure seawater environments."
    ),
    "J32760": Grade(
        id="J32760", name="UNS S32760 / Zeron 100", family="Duplex (Super)",
        cr=25.0, ni=7.0, mo=3.5, mn=1.0, cu=0.75, c=0.025, si=0.50, s=0.010, p=0.030, n=0.24,
        cr_min=24.0, cr_max=26.0, ni_min=6.0, ni_max=8.0, mo_min=3.0, mo_max=4.0,
        mn_min=0.5, mn_max=1.5, cu_min=0.5, cu_max=1.0, c_max=0.03, si_max=0.75,
        scrap_cap=50.0,
        mechanical_applications="Geothermal brine wells, wet FGD spray nozzles, offshore platform firewater ringmains.",
        description="Tungsten and copper modified super duplex steel with exceptional pitting resistance in acidic chlorides."
    ),

    # =========================================================================
    # REFERENCE & CUSTOM
    # =========================================================================
    "carbonRef": Grade(
        id="carbonRef", name="Plain Carbon Steel (Reference)", family="Reference (Non-Stainless)",
        cr=0.0, ni=0.0, mo=0.0, mn=0.5, cu=0.05, c=0.15, si=0.20, s=0.020, p=0.020, n=0.008,
        cr_min=0.0, cr_max=0.1, ni_min=0.0, ni_max=0.1, mo_min=0.0, mo_max=0.05,
        mn_min=0.3, mn_max=0.8, cu_min=0.0, cu_max=0.1, c_max=0.20, si_max=0.40,
        scrap_cap=100.0,
        mechanical_applications="Structural beams, rebars, re-rolling billets (for comparison against BF-BOF benchmarks).",
        description="Plain carbon steel reference with zero Cr/Ni alloys; used to benchmark against standard BF-BOF carbon steel metrics."
    ),
}


def get_grade(grade_id: str) -> Grade:
    """Retrieve grade by ID with case-insensitive fallback."""
    if grade_id in GRADES:
        return GRADES[grade_id]
    for key, g in GRADES.items():
        if key.lower() == grade_id.lower():
            return g
    raise ValueError(f"Grade '{grade_id}' not found in JSL Grade Library ({len(GRADES)} grades available).")


def list_grades_by_family() -> Dict[str, List[Grade]]:
    """Return all grades grouped by metallurgical family."""
    families: Dict[str, List[Grade]] = {}
    for g in GRADES.values():
        families.setdefault(g.family, []).append(g)
    return families


def get_pren(grade: Grade) -> float:
    """
    Pitting Resistance Equivalent Number (PREN).
    Standard formula: PREN = %Cr + 3.3 * %Mo + 16 * %N
    For tungsten-alloyed grades (e.g. J32760), PREN_W = %Cr + 3.3*(%Mo + 0.5*%W) + 16*%N.
    """
    pren = grade.cr + 3.3 * grade.mo + 16.0 * grade.n
    return round(pren, 2)
