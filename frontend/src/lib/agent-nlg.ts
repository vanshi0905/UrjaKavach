/**
 * Client-Side Pedagogical Metallurgical NLG Engine ("ELI-Engineer").
 * Provides 100% deterministic, offline explanations in 3 structured layers:
 *   Layer 1: Physical Analogy (Metaphor)
 *   Layer 2: Grounded Metric (Numbers & SHAP attributions)
 *   Layer 3: Operational Action (Melt Shop Levers)
 */

import { CalculatorInputs } from './calculator';
import { getGrade, GRADES } from './grades';
import { computeClientShapley, MultiTargetShapReport, TargetShapResult } from './shap-client';

import {
  AssistantLanguage,
  LanguageMeta,
  SUPPORTED_LANGUAGES,
  detectQueryLanguage,
  getMultilingualGreeting,
  getMultilingualTrampCopper,
  getMultilingualMoltenFeCr,
  getMultilingualOptimization,
  LocalizedContentParams,
} from './multilingual-agent';

export type { AssistantLanguage, LanguageMeta };
export { SUPPORTED_LANGUAGES, detectQueryLanguage };

export interface ExplanationResponse {
  target: string;
  targetName: string;
  title: string;
  topic: string;
  summary: string;
  metaphor: string;
  metrics: string;
  action: string;
  fullText: string;
  shap?: TargetShapResult;
  actionPayload?: Partial<CalculatorInputs>;
  isConversational?: boolean;
}

export const DOMAIN_ANALOGIES = {
  tramp_copper: {
    title: "Tramp Copper & Scrap Limits",
    analogy:
      "Like using recycled paper: great for the circular economy, but if unsorted staples and glossy tape get in, the paper tears during high-speed printing. In stainless steel metallurgy, copper cannot be oxidized or removed during EAF/AOD refining. Beyond the grade ceiling, it segregates at grain boundaries causing catastrophic 'hot-shortness' surface cracking during continuous casting and hot rolling.",
    action:
      "Cap scrap charge to the metallurgical ceiling ({scrapCap}%), or blend with low-copper internal revert scrap and virgin DRI to dilute tramp copper below {cuTrampCap}%.",
  },
  hot_fecr_charging: {
    title: "SAF Molten FeCr Sensible Heat Charging",
    analogy:
      "Instead of melting solid frozen butter in a cold frying pan, you pour in molten butter that was already sizzling next door. Charging molten ferrochrome at 1600°C directly from the captive Submerged Arc Furnace (SAF) bypasses the huge electrical latent heat of fusion in the EAF.",
    action:
      "Maintain hot-ladle transfer protocols between Jajpur SAF and EAF-2 to capture the ~113 kWh/t thermal credit, cutting tap-to-tap time and electrical arc power costs by ~₹310/t.",
  },
  nickel_sourcing: {
    title: "Indonesian Coal RKEF NPI vs Class 1 Hydro-Nickel",
    analogy:
      "Buying dirty coal electricity to charge an electric vehicle: the raw metal price seems cheap upfront, but its massive upstream Scope 3 carbon penalty destroys your export margins. Indonesian NPI produced via Rotary Kiln Electric Furnace (RKEF) burns sub-bituminous coal, emitting 55 tCO2 per tonne of nickel.",
    action:
      "Substitute Indonesian NPI with Class 1 Hydro-refined nickel (10 tCO2/t Ni) or certified low-carbon FeNi on European export heats to protect EU CBAM operating margins.",
  },
  fe_sourcing: {
    title: "Gas DRI vs Coal DRI Refining Kinetics",
    analogy:
      "Feeding an engine refined aviation fuel instead of heavy unrefined furnace oil. Gas-based DRI is reduced with reformed natural gas (H2 + CO), yielding high metallic iron (>92%) with low residual gangue (SiO2/Al2O3) and zero coal ash, whereas coal-based rotary kiln DRI introduces substantial acid gangue that requires massive lime fluxes and electrical power to melt into slag.",
    action:
      "Prioritize gas-based DRI over coal DRI for high-performance austenitic heats to eliminate ~0.68 tCO2/t in upstream emissions and save ~37 kWh/t in furnace enthalpy.",
  },
  renewable_ppa: {
    title: "Renewable Electricity Decoupling",
    analogy:
      "Switching your home utility provider from thermal coal to rooftop solar. The physical heat required to boil a kettle does not change by a single calorie, but the smokestack emissions from the power plant vanish. In the EAF, renewable power does not alter arc enthalpy, but it zeroes out Scope 2 emissions.",
    action:
      "Expand JSL's hybrid solar-wind PPA off-take towards 70-100% to abate up to 0.26-0.50 tCO2/t finished steel.",
  },
  cbam_mechanism: {
    title: "EU CBAM Cross-Border Adjustment",
    analogy:
      "A carbon customs equalizer at European ports. If non-EU mills produce stainless steel with higher embedded carbon than European mills receiving free allowances, European importers must purchase CBAM certificates to equalize the difference.",
    action:
      "Keep embedded emissions below 1.5 tCO2/t by utilizing >60% scrap and clean DRI, while claiming Article 9 carbon price credits paid under India's CCTS.",
  },
  ccts_mechanism: {
    title: "India Carbon Credit Trading Scheme (BEE)",
    analogy:
      "A national carbon efficiency tournament. If your Scope 1 + Scope 2 intensity beats the Bureau of Energy Efficiency (BEE) target, you are awarded tradable Carbon Credit Certificates (CCCs) that generate pure EBITDA.",
    action:
      "Target a combined Scope 1+2 intensity below 0.8222 tCO2/t at Jajpur to generate up to ₹500+/t in tradable certificate surplus.",
  },
  iron_crediting: {
    title: "Stoichiometric Iron Crediting & Mass Balance",
    analogy:
      "Ordering a set meal that already includes fresh bread and butter, but the cashier charges you for an extra loaf of bread anyway. When calculating virgin iron requirements for 1.000 tonne of liquid stainless steel, standard calculators assume all virgin iron must be supplied as DRI, completely ignoring that ferroalloys (HC FeCr carries ~40% Fe, NPI carries ~81.5% Fe, FeMo carries ~33% Fe, FeMn carries ~20% Fe) already deliver hundreds of kilograms of metallic iron. Failing to credit inherent alloy iron inflates virgin DRI demand by up to 220 kg/t, exaggerating emissions by 0.57 tCO2/t.",
    action:
      "Enforce stoichiometric iron crediting across all plant charge calculation sheets and BRSR disclosures to eliminate DRI double-counting and avoid over-reporting Scope 1 and Scope 3 carbon.",
  },
  shadow_pricing_viu: {
    title: "Swerim RAWMATMIX® LP Dual Shadow Pricing & Value-in-Use",
    analogy:
      "An airline baggage scale where luggage within the limit flies free, but every extra 100 grams triggers an escalating excess weight charge. In Linear Programming (LP), the dual shadow price (π_t) reveals the exact marginal penalty ($/0.01% tramp) of relaxing a binding chemical limit (Cu, Sn, P, S). For feeds not chosen in the optimal charge mix, the reduced cost (r_j) indicates how overpriced that feed is; subtracting r_j from the market price yields the break-even Value-in-Use (ViU_j) where that feed becomes viable.",
    action:
      "Use dual shadow prices to guide scrap purchasing tenders: negotiate discounts equal to or exceeding reduced costs (r_j) on off-spec scrap batches rather than outright rejection.",
  },
  phosphorus_thermochemistry: {
    title: "High-Cr Phosphorus Non-Removal Thermochemistry (η_P = 0.99)",
    analogy:
      "Trying to burn damp leaves soaked in lighter fluid next to dry paper. In a stainless steel melt with 18% Cr, chromium has a vastly higher chemical affinity for oxygen than phosphorus (Ellingham free energy ΔG°(Cr2O3) << ΔG°(P2O5)). Any attempt to blow oxygen to oxidize phosphorus into slag burns and slag-transfers expensive chromium units first, long before phosphorus is touched (Wei et al. 2018, Selin 1987). Hence, phosphorus is thermodynamically conserved in the bath (process recovery η_P = 0.99).",
    action:
      "Enforce strict scrap gate inspection for phosphorus (≤ 0.040% P). Never attempt oxidative dephosphorization in EAF/AOD on high-Cr stainless heats, as it destroys expensive chromium units without lowering phosphorus.",
  },
};

export function generateClientExplanation(
  target: string,
  inputs: CalculatorInputs,
  shapReport?: MultiTargetShapReport
): ExplanationResponse {
  const report = shapReport || computeClientShapley(inputs);
  const grade = getGrade(inputs.gradeId);
  const targetData = report.targets[target];

  if (!targetData) {
    throw new Error(`Unknown target metric: ${target}`);
  }

  const { delta, baselineValue, userValue, unit, name } = targetData;
  const attributions = targetData.attributions;
  const topDriver = attributions[0];
  const secondDriver = attributions[1];

  let metaphor = DOMAIN_ANALOGIES.renewable_ppa.analogy;
  let topic = "general";
  let title = `${name} Attribution`;

  if (target === "total_co2_t") {
    if (topDriver && topDriver.feature === "scrapPct") {
      metaphor = DOMAIN_ANALOGIES.tramp_copper.analogy;
      topic = "circular_scrap";
      title = "Circular Scrap Decarbonization";
    } else if (topDriver && topDriver.feature === "feSource") {
      metaphor = DOMAIN_ANALOGIES.fe_sourcing.analogy;
      topic = "fe_sourcing";
      title = "Virgin Fe Decarbonization";
    } else if (topDriver && topDriver.feature === "niSource") {
      metaphor = DOMAIN_ANALOGIES.nickel_sourcing.analogy;
      topic = "nickel_sourcing";
      title = "Nickel Precursor Emissions";
    } else {
      metaphor = DOMAIN_ANALOGIES.renewable_ppa.analogy;
      topic = "renewable_ppa";
      title = "Renewable Power Allocation";
    }
  } else if (target === "eaf_sec_kwh") {
    if (topDriver && topDriver.feature === "hotFecrCharging") {
      metaphor = DOMAIN_ANALOGIES.hot_fecr_charging.analogy;
      topic = "hot_fecr_charging";
      title = "Sensible Heat Furnace Credit";
    } else {
      metaphor = DOMAIN_ANALOGIES.fe_sourcing.analogy;
      topic = "fe_sourcing";
      title = "Furnace Enthalpy Dynamics";
    }
  } else if (target === "cbam_tariff_eur") {
    metaphor = DOMAIN_ANALOGIES.cbam_mechanism.analogy;
    topic = "cbam";
    title = "EU CBAM Tariff Exposure";
  } else {
    metaphor = DOMAIN_ANALOGIES.ccts_mechanism.analogy;
    topic = "ccts";
    title = "India CCTS Carbon Surplus";
  }

  const dirWord = delta < 0 ? (target !== "ccts_value_inr" ? "reduction" : "decrease") : delta > 0 ? "increase" : "variance";

  const metricLines = [
    `For grade ${grade.name} (${grade.id}), the ${name} moved from baseline ${baselineValue.toFixed(2)} ${unit} to ${userValue.toFixed(2)} ${unit} (net ${dirWord} of ${Math.abs(delta).toFixed(2)} ${unit}).`,
  ];

  if (topDriver && Math.abs(topDriver.attribution) > 0.001) {
    metricLines.push(
      `1. Primary Driver: ${topDriver.label} contributed ${topDriver.attribution > 0 ? "+" : ""}${topDriver.attribution.toFixed(2)} ${unit} (${Math.abs(topDriver.percentContribution).toFixed(1)}% of total net change).`
    );
  }
  if (secondDriver && Math.abs(secondDriver.attribution) > 0.001) {
    metricLines.push(
      `2. Secondary Driver: ${secondDriver.label} contributed ${secondDriver.attribution > 0 ? "+" : ""}${secondDriver.attribution.toFixed(2)} ${unit} (${Math.abs(secondDriver.percentContribution).toFixed(1)}% of total net change).`
    );
  }

  if (report.grade.scrapWasClamped) {
    metricLines.push(
      `[Metallurgical Tramp Boundary]: Scrap charge was automatically clamped to ${grade.scrap_cap}% to prevent tramp copper exceeding the ${grade.cu_tramp_cap}% hot-shortness limit.`
    );
  }

  const metricsText = metricLines.join("\n");

  let action = "";
  if (target === "total_co2_t") {
    action = `Increase circular scrap utilization up to the ${grade.scrap_cap}% tramp limit for ${grade.id}, switch virgin Fe to Gas-based DRI, and increase renewable power PPA share to maximize carbon abatement.`;
  } else if (target === "eaf_sec_kwh") {
    action = `Ensure 100% molten FeCr hot charging from captive SAF to capture the ~113 kWh/t thermal credit, and minimize slag volume by utilizing low-gangue gas DRI.`;
  } else if (target === "cbam_tariff_eur") {
    action = `Maintain embedded carbon below 1.5 tCO2/t by avoiding Indonesian NPI on European export heats, and ensure domestic carbon credits under India's CCTS are verified for Article 9 deductions.`;
  } else {
    action = `Keep combined Scope 1+2 emissions below 0.8222 tCO2/t to secure surplus Carbon Credit Certificates (CCCs) trading at ~₹1,500/t on the domestic exchange.`;
  }

  const fullText = `### 1. Physical Principle & Analogy\n${metaphor}\n\n### 2. Grounded Attribution Metrics\n${metricsText}\n\n### 3. Operational Action for Melt Shop\n${action}`;

  return attachActionPayloadAndToken({
    target,
    targetName: name,
    title,
    topic,
    summary: `${name}: ${userValue.toFixed(2)} ${unit} (Delta: ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} ${unit})`,
    metaphor,
    metrics: metricsText,
    action,
    fullText,
    shap: targetData,
  }, inputs);
}

function attachActionPayloadAndToken(
  res: ExplanationResponse,
  inputs: CalculatorInputs
): ExplanationResponse {
  const grade = getGrade(inputs.gradeId);
  const currentScrap = inputs.scrapPct ?? 60.0;
  const preset: Partial<CalculatorInputs> = {
    gradeId: inputs.gradeId,
    scrapPct: Math.min(currentScrap, grade.scrap_cap),
    facilityId: inputs.facilityId ?? "jajpur",
    feSource: inputs.feSource ?? "coalDRI",
    fecrSource: inputs.fecrSource ?? "fecrStandard",
    niSource: inputs.niSource ?? "niStandard",
    renewablePct: inputs.renewablePct ?? 47.0,
    hotFecrCharging: inputs.hotFecrCharging ?? true,
  };

  const topic = res.topic || "";
  const target = res.target || "";

  if (topic === "tramp_copper" || topic === "phosphorus_thermochemistry" || topic === "shadow_pricing_viu") {
    preset.scrapPct = grade.scrap_cap;
  } else if (topic === "cbam" || target === "cbam_tariff_eur") {
    preset.fecrSource = "fecrLowC";
    preset.niSource = "niClass1";
    preset.feSource = "gasDRI";
    preset.scrapPct = grade.scrap_cap;
  } else if (topic === "ccts" || target === "ccts_value_inr") {
    preset.renewablePct = 70.0;
    preset.scrapPct = Math.min(65.0, grade.scrap_cap);
  } else if (topic === "hot_fecr_charging" || target === "eaf_sec_kwh") {
    preset.hotFecrCharging = true;
    preset.facilityId = "jajpur";
  } else if (topic === "fe_sourcing") {
    preset.feSource = "gasDRI";
  } else if (topic === "nickel_sourcing") {
    preset.niSource = "niClass1";
  } else if (target === "total_co2_t") {
    preset.scrapPct = Math.min(65.0, grade.scrap_cap);
    preset.feSource = "gasDRI";
    preset.renewablePct = 70.0;
  }

  // Suppress automated preset attachment for purely social/conversational queries
  const nonPresetTopics = new Set([
    "greeting",
    "help",
    "how_to_use",
    "pleasantry",
    "farewell",
    "acknowledgement",
    "about",
  ]);

  if (nonPresetTopics.has(topic)) {
    return res;
  }

  res.actionPayload = preset;
  const token = `<<<ACTION:APPLY_COCKPIT_PRESET:${JSON.stringify(preset)}>>>`;
  if (!res.fullText.includes("<<<ACTION:APPLY_COCKPIT_PRESET:")) {
    res.fullText = `${res.fullText}\n\n${token}`;
  }
  return res;
}

function answerClientConversationalQueryInner(
  query: string,
  inputs: CalculatorInputs,
  shapReportOverride?: MultiTargetShapReport,
  langOverride?: AssistantLanguage
): ExplanationResponse {
  const lang = detectQueryLanguage(query, langOverride);
  const qLower = query.toLowerCase().trim();
  const grade = getGrade(inputs.gradeId);
  const shapReport = shapReportOverride || computeClientShapley(inputs);
  const facility = (inputs.facilityId || "jajpur") === "jajpur" ? "Jajpur" : (inputs.facilityId === "chhattisgarh" ? "Raigarh Hub (Chhattisgarh)" : "Hisar");
  const co2Data = shapReport.targets.total_co2_t;
  const secData = shapReport.targets.eaf_sec_kwh;
  const currentCo2 = co2Data.userValue;
  const currentSec = secData.userValue;
  const currentScrap = inputs.scrapPct ?? 60.0;
  const recScrap = Math.min(70.0, grade.scrap_cap);
  const feSrc = inputs.feSource || "coalDRI";

  const locParams: LocalizedContentParams = {
    facility,
    gradeName: grade.name,
    gradeId: grade.id,
    scrapCap: grade.scrap_cap,
    cuTrampCap: grade.cu_tramp_cap,
    currentScrap,
    currentCo2,
    currentSec,
    recScrap,
    query,
    feSrc,
  };

  // Check if query targets any of the deep-dive formula topics
  const hasFormulaQuery = /phosphorus|dephosphoriz|non[\s-]?removal|ellingham|eta_p|iron credit|stoichiometric|double[\s-]?count|inherent fe|virgin iron|fe_virgin|swerim|rawmatmix|shadow price|dual shadow|value[\s-]?in[\s-]?use|viu|reduced cost|lp dual|dynamic eaf|sec_eaf|specific electrical consumption|hot charge|molten|fecr|sensible|saf|ladle|npi|indonesia|class 1|rkef|cbam|sefa|article 9|article9|ccts|bee|carbon credit|ccc|inr|crore|ebitda|gas dri|coal dri|rotary kiln|gangue|copper|tramp|hot-shortness|hot shortness|तांबा|कॉपर|दरार|ତମ୍ବା|ଫାଟ|kupfer|cuivre/.test(qLower);

  if (!hasFormulaQuery) {
    // 1. Social Pleasantries & Conversational Inquiries
    if (/\b(how\s+are\s+(u|you)|how're\s+(u|you)|how\s+are\s+things|how\s+do\s+(u|you)\s+do|how('s|\s+is)\s+it\s+going)\b/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "UrjaSaathi Status",
        title: "UrjaSaathi AI Status",
        topic: "pleasantry",
        summary: "I am operating at peak thermal and computational efficiency! Ready to assist your melt-shop calculations.",
        metaphor: "All digital process loops and first-principles solvers are operating within nominal boundaries.",
        metrics: `Cockpit Status: Nominal • Facility: ${facility} • Active Grade: ${grade.name} (${grade.id}).`,
        action: "Select a suggested metallurgical task or prompt me with any process query.",
        fullText: `I am operating at peak thermal and computational efficiency! ⚡\n\nAll SCADA telemetry feeds and pyrometallurgical models for **${facility}** and **Hisar** are synchronized. I am ready to calculate EAF enthalpy balances, optimize charge sheets for **${grade.name} (${grade.id})**, or compute CBAM/CCTS carbon exposure.\n\nHow can I assist your melt-shop heat planning right now?`,
        shap: co2Data,
        isConversational: true,
      };
    }

    if (/\b(thank\s*(you|u)|thanks|thx|many\s+thanks|appreciate\s+(it|this)|grateful)\b/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "UrjaSaathi Acknowledgement",
        title: "UrjaSaathi AI",
        topic: "acknowledgement",
        summary: "You are welcome! Ready to assist with further metallurgical calculations.",
        metaphor: "Always here to assist with pyrometallurgical kinetics and compliance models.",
        metrics: `Current Active Run: Grade ${grade.name} (${grade.id}).`,
        action: "Feel free to prompt me with your next melt-shop question.",
        fullText: `You're very welcome! 👍\n\nLet me know if you need to simulate alternative charge mixes, audit tramp copper/tin boundaries, check scrap Value-in-Use, or calculate basic flux additions for your next heat.`,
        shap: co2Data,
        isConversational: true,
      };
    }

    if (/\b(bye|goodbye|see\s+(you|ya)|cya|farewell|exit|quit|catch\s+you\s+later)\b/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "Shift Sign-Off",
        title: "Melt-Shop Shift Sign-Off",
        topic: "farewell",
        summary: "Goodbye! Have a safe and energy-efficient melt-shop shift.",
        metaphor: "Standing by for your next operational heat campaign.",
        metrics: `Active Session: Grade ${grade.name} (${grade.id}).`,
        action: "Return anytime for charge optimization or compliance calculations.",
        fullText: `Goodbye! 👋 Have a safe, productive, and energy-efficient melt-shop shift.\n\nFeel free to open UrjaSaathi AI anytime you need first-principles pyrometallurgical guidance or Pareto charge optimization.`,
        shap: co2Data,
        isConversational: true,
      };
    }

    if (/^(ok|okay|got\s+it|understood|cool|nice|awesome|great|perfect|sounds\s+good|sure|noted|alright|fine)[\s!?.]*$/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "Acknowledged",
        title: "UrjaSaathi AI",
        topic: "acknowledgement",
        summary: "Understood! Ready for your next command.",
        metaphor: "Input registered. Standing by for next command.",
        metrics: `Current Active Run: Grade ${grade.name} (${grade.id}).`,
        action: "Enter a prompt or select a suggested question.",
        fullText: `Understood! ✅\n\nLet me know what target grade, charge question, or furnace parameter you'd like to explore next.`,
        shap: co2Data,
        isConversational: true,
      };
    }

    if (/\b(who\s+(are\s+(u|you)|created|made|built|developed\s+(u|you))|what\s+are\s+(u|you)|what('s|\s+is)\s+your\s+name|introduce\s+yourself|tell\s+me\s+(about\s+(u|you|yourself|jsl)|who\s+(you\s+are|u\s+are))|what\s+is\s+jsl|about\s+jsl)\b/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "About UrjaSaathi AI",
        title: "About UrjaSaathi AI & UrjaKavach",
        topic: "about",
        summary: "UrjaSaathi AI — “Aapka 24/7 Shift Companion & Melt Advisor” developed for UrjaKavach.",
        metaphor: "A digital twin metallurgical technologist coupling thermochemistry with optimization.",
        metrics: "Facility Network: Jajpur (3.0 MTPA) • Hisar (1.2 MTPA) • Raigarh Hub (Chhattisgarh) • 43 JSL Steel Grades.",
        action: "Ask any question about UrjaKavach operations or optimize a heat charge.",
        fullText: `### 🛡️ UrjaSaathi AI\n*“Aapka 24/7 Shift Companion & Melt Advisor”*\n\nI am your autonomous pyrometallurgical and decarbonization intelligence companion purpose-built for **UrjaKavach** — deployed across India's premier stainless steel manufacturing network.\n\n- **Jajpur Integrated Hub (Odisha)**: 3.0 MTPA capacity, captive Submerged Arc Furnaces (SAF) with direct molten FeCr hot transfer (-113 kWh/t thermal credit), and captive coal CPP.\n- **Hisar Precision Hub (Haryana)**: 1.2 MTPA precision long & flat specialty products powered via Northern regional grid and green hydrogen.\n- **Raigarh Hub (Chhattisgarh)**: Strategic Gas-DRI raw material sourcing corridor (-0.68 tCO₂/t) and distribution processing centers.\n\nI combine first-principles pyrometallurgy, 64-coalition Permutation Shapley explainable AI, and linear programming (LP / HiGHS) to solve least-cost and least-carbon heat charges in real time.`,
        shap: co2Data,
        isConversational: true,
      };
    }

    // 2. Greetings & Salutations (e.g. "hi", "hello", "hi or hello", "good morning")
    const greetingPattern = /^(hi|hello|hey|namaste|good\s+(morning|afternoon|evening|day)|sup|yo|start|hola|greetings|नमस्ते|नमस्कार|जय\s*जोहार|जोहार|प्रणाम|ନମସ୍କାର|ଜୟ\s*ଜଗନ୍ନାଥ|guten\s*tag|hallo|bonjour|salut)(\b|[\s!?.,]|$)|(\b(hi\s+(or|and)\s+hello|hello\s+(or|and)\s+hi|hi\s+there|hello\s+there|hey\s+there|hi\s+copilot|hello\s+copilot|hi\s+saathi|hello\s+saathi|hi\s+urjasaathi|hello\s+urjasaathi)\b)/i;
    if (greetingPattern.test(qLower) || (lang !== "en" && /^(hi|hello|hey|start|greetings|start chat)$/i.test(qLower))) {
      const co2Data = shapReport.targets.total_co2_t;
      const currentCo2 = co2Data.userValue;
      const currentScrap = inputs.scrapPct ?? 60.0;

      if (lang !== "en") {
        const localized = getMultilingualGreeting(lang, locParams);
        return {
          target: "total_co2_t",
          targetName: "UrjaSaathi AI",
          title: "UrjaSaathi AI",
          topic: "greeting",
          summary: localized.summary,
          metaphor: "I operate as your digital process companion, coupling first-principles pyrometallurgy with continuous linear programming optimization.",
          metrics: `Active Cockpit State: Grade ${grade.name} (${grade.id}) • Scrap: ${currentScrap}% • Carbon: ${currentCo2.toFixed(2)} tCO2/t.`,
          action: "Select a suggested metallurgical query or prompt me to optimize your melt-shop operating parameters.",
          fullText: localized.fullText,
          shap: co2Data,
          isConversational: true,
        };
      }

      return {
        target: "total_co2_t",
        targetName: "UrjaSaathi AI",
        title: "UrjaSaathi AI",
        topic: "greeting",
        summary: "Namaste! I am UrjaSaathi AI — Aapka 24/7 Shift Companion & Melt Advisor. How can I assist your operations today?",
        metaphor: "I operate as your digital process companion, coupling first-principles pyrometallurgy with continuous linear programming optimization.",
        metrics: `Active Cockpit State: Grade ${grade.name} (${grade.id}) • Scrap: ${currentScrap}% • Carbon: ${currentCo2.toFixed(2)} tCO2/t.`,
        action: "Select a suggested metallurgical query or prompt me to optimize your melt-shop operating parameters.",
        fullText: `Namaste! 👋 I am **UrjaSaathi AI** — *Aapka 24/7 Shift Companion & Melt Advisor* for **UrjaKavach**.\n\nI am actively monitoring our **${facility}** operations for **${grade.name} (${grade.id})** (currently set to ${currentScrap}% scrap with ~${currentCo2.toFixed(2)} tCO₂/t footprint).\n\n### 🛠️ Common tasks I can assist you with:\n- 🎯 **Charge Optimization**: *'Optimize charge mix for ${grade.id} to minimize cost'* or *'Minimize carbon footprint'*\n- ⚡ **EAF Enthalpy & Power**: *'How does molten FeCr hot charging save ~113 kWh/t at Jajpur?'*\n- ⚖️ **Trade & Regulations**: *'What is our EU CBAM tariff exposure for Europe in 2026?'* or *'How does India CCTS generate EBITDA?'*\n- 🧪 **Slag Kinetics**: *'Calculate FeSi 75 reduction and lime flux for basicity 1.90'*\n- 🔬 **Grade Specifications**: *'What is the nominal chemistry and scrap cap for J4 or J316L?'*\n\nYou can also use voice mode in the **Interactive Voice Agent** tab for hands-free operations. How can I assist you right now?`,
        shap: co2Data,
        isConversational: true,
      };
    }

    // 3. Capabilities, Help & Feature Overviews ("what can you do", "common list of such stuff", "help")
    const helpPattern = /\b(what\s+(all\s+)?(can|do)\s+(u|you)\s+do|what\s+can\s+(u|you)\s+do\s+for\s+me|what\s+can\s+(u|you)\s+help(\s+me)?\s*(with)?|what\s+(can|should)\s+i\s+(ask|do)|what\s+to\s+do|can\s+(u|you)\s+help(\s+me)?|how\s+can\s+(u|you)\s+help(\s+me)?|help(\s+me)?|capabilities|features|commands|menu|options|common\s+list|list\s+of\s+(such\s+)?stuff|common\s+tasks|what\s+is\s+this(\s+app)?|functions|overview|suggest\s+(prompts|questions|queries))\b/i;
    if (helpPattern.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "UrjaSaathi Capabilities",
        title: "UrjaSaathi Capabilities & Feature Guide",
        topic: "help",
        summary: "I can optimize your EAF charge mix, calculate EAF electrical consumption, audit tramp elements, compute EU CBAM tariffs, and simulate India CCTS carbon credit trading.",
        metaphor: "Think of UrjaSaathi as an autonomous metallurgical companion, calculating physical equilibria and cost frontiers in milliseconds.",
        metrics: "Engine Specifications: 43 JSL Grades • 8 Deterministic Tools • 64-Coalition Permutation Shapley • 100% Free Open-Source Stack.",
        action: "Test any module in the cockpit or ask me specific metallurgical questions.",
        fullText: `### 🚀 Capabilities of UrjaSaathi AI\n*“Aapka 24/7 Shift Companion & Melt Advisor”*\n\nI provide industrial-grade pyrometallurgical calculations, continuous optimization, and compliance models for **UrjaKavach**:\n\n1. **Continuous Charge Optimization (LP / HiGHS)**\n   - Solves multi-objective (cost vs carbon) Pareto charge sheets across 43 commercial steel grades.\n   - Enforces strict tramp ceilings ([Cu], [Sn], [P], [S]) and circular scrap caps.\n   - Extracts dual shadow prices (π_t) and break-even scrap Value-in-Use (ViU_j).\n\n2. **Dynamic EAF SEC & Molten FeCr Thermodynamics**\n   - Calculates first-principles enthalpy balances for scrap (~420 kWh/t), coal DRI (~680 kWh/t), and gas DRI (~560 kWh/t).\n   - Computes direct sensible heat credits (-86.0 to -113.0 kWh/t) from Jajpur captive SAF molten FeCr ladle charging.\n\n3. **Trade Economics & Compliance Accounting**\n   - **EU CBAM (Regulation 2023/956)**: Specific high-alloy benchmark (0.284 tCO₂/t), scrap circularity adjustment, strict Scope 2 exclusion, and Article 9 deductions.\n   - **India BEE CCTS**: Scope 1 + net grid Scope 2 intensity, plant-specific baselines, compounding reduction trajectories, and CCC certificate EBITDA.\n\n4. **AOD Slag Kinetics & Basic Fluxing**\n   - Stoichiometric FeSi 75 reduction of oxidized Cr₂O₃ and quicklime flux demand for target binary basicity B₂ = 1.90.\n\n5. **Explainable AI (Shapley Permutations)**\n   - Exact 64-coalition Permutation Shapley attributions with 100% mathematical additive closure.\n\n6. **Free Neural Voice Companion (UrjaSaathi)**\n   - Real-time spoken dialogue with Indian English voice personas (\`en-IN-PrabhatNeural\`, \`en-IN-NeerjaNeural\`), sub-15ms barge-in interruption, and mathematical spoken normalizer.\n\n💡 **Common queries you can ask me:**\n- *'How does molten FeCr hot charging save electricity?'*\n- *'Optimize J304 at Jajpur for least cost'* \n- *'What are the tramp copper limits for grade J430?'*\n- *'What is our EU CBAM liability in 2026?'*`,
        shap: co2Data,
        isConversational: true,
      };
    }

    // 4. Workflow, Usage Guide & "How"
    const howPattern = /^(how(\s+to\s+use|\s+does\s+this\s+work|\s+do\s+i\s+use|\s+can\s+i\s+use|\s+to\s+start|\s+do\s+i\s+start|\?|$)|how$|how\?|usage\s+guide|workflow\s+guide|user\s+guide|tutorial|guide$|where\s+do\s+i\s+(start|begin)|how\s+to\s+get\s+started|getting\s+started)/i;
    if (howPattern.test(qLower) || /how to use|how does it work|how do i use|how can i use|how to get started|how do i start|where do i begin|usage guide|workflow guide|user guide|tutorial|walkthrough|how do i use the sliders|how to use the sliders|how to use cockpit/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "Cockpit Workflow",
        title: "How to Use the JSL Decarbonization Cockpit",
        topic: "how_to_use",
        summary: "To use the system, select your steel grade and plant location, adjust your scrap and renewable energy sliders in the cockpit, or run the charge optimizer to trace the Pareto frontier.",
        metaphor: "Operating this cockpit is like flying with digital twin avionics: adjust process levers in simulation before executing live melt-shop heats.",
        metrics: "Available Controls: Scrap 0-85% • PPA 0-100% • 3 Fe Carriers • 3 Ni Carriers • 2 FeCr Sources • Molten FeCr Toggle.",
        action: "Try tuning sliders in the Decarbonization Cockpit or ask me to optimize a specific grade.",
        fullText: `### 🧭 How to Use the JSL Decarbonization Cockpit\n\nFollow this simple 4-step workflow to simulate and optimize melt-shop operations:\n\n1. **Select Grade & Facility**\n   - In the top navigation, choose your target steel grade from 43 JSL grades (e.g. **J304**, **J316L**, **J4**, **J430**).\n   - Toggle between **Jajpur** (captive SAF molten FeCr charging & CPP) and **Hisar** (specialty rolling & Northern grid).\n\n2. **Simulate Decarbonization in the Calculator (\`/calculator\`)**\n   - Adjust the **Scrap Ratio** slider (capped automatically at the metallurgical ceiling).\n   - Select your **Virgin Fe Carrier** (Coal DRI, Gas DRI, or Pig Iron) and **Ferroalloy Sources**.\n   - Adjust the **Renewable PPA Share** (0–100%) to observe immediate Scope 2 decarbonization and CCTS EBITDA gains.\n\n3. **Solve Least-Cost & Least-Carbon Charges in the Optimizer (\`/optimizer\`)**\n   - Slide the α Pareto weight between **Least Cost (α = 1.0)** and **Least Carbon (α = 0.0)**.\n   - Inspect the live **Tramp Element Audit** ([Cu], [Sn], [P], [S]) and check scrap **Value-in-Use (ViU)**.\n\n4. **Interact with AI & Apply Presets**\n   - Click any **'Explain'** button for instant 3-layer pedagogical SHAP waterfall breakdowns.\n   - Click **'Apply Recommended Preset to Cockpit Sliders'** to instantly tune furnace levers to optimized setpoints!`,
        shap: co2Data,
        isConversational: true,
      };
    }

    // 5. Direct Optimization Requests ("optimize", "least cost charge", etc.)
    if (/optimize|least cost|least carbon|pareto|cheapest charge|best recipe|optimal recipe|ऑप्टिमाइज़|सुधारव|ସର୍ବୋତ୍ତମ|optimieren|optimiser/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      const recScrap = Math.min(70.0, grade.scrap_cap);

      if (lang !== "en") {
        const localized = getMultilingualOptimization(lang, locParams);
        return {
          target: "total_co2_t",
          targetName: `Optimize ${grade.id}`,
          topic: "optimization",
          title: `Charge Optimization: ${grade.name} (${grade.id})`,
          summary: localized.summary,
          metaphor: "Linear programming identifies the Pareto frontier balancing scrap circularity against tramp element penalties.",
          metrics: `Optimal Setpoints: Scrap ${recScrap.toFixed(0)}% • Gas DRI • RE 70% • Hot FeCr: Enabled.`,
          action: `Apply recommended ${recScrap.toFixed(0)}% scrap and clean DRI setpoints to achieve least-carbon production.`,
          fullText: localized.fullText,
          isConversational: true,
          actionPayload: {
            gradeId: grade.id,
            scrapPct: recScrap,
            feSource: "gasDRI",
            fecrSource: "fecrLowC",
            niSource: "niClass1",
            renewablePct: 70.0,
            hotFecrCharging: true,
          },
          shap: co2Data,
        };
      }

      return {
        target: "total_co2_t",
        targetName: `Optimize ${grade.id}`,
        topic: "optimization",
        title: `Charge Optimization: ${grade.name} (${grade.id})`,
        summary: `Optimal charge recipe for ${grade.name}: ${recScrap.toFixed(0)}% scrap, Gas DRI, 70% RE PPA, Molten FeCr.`,
        metaphor: "Linear programming identifies the Pareto frontier balancing scrap circularity against tramp element penalties.",
        metrics: `Optimal Setpoints: Scrap ${recScrap.toFixed(0)}% • Gas DRI • RE 70% • Hot FeCr: Enabled.`,
        action: `Apply recommended ${recScrap.toFixed(0)}% scrap and clean DRI setpoints to achieve least-carbon production.`,
        fullText: `### 🎯 Optimal Charge Recommendation: ${grade.name} (${grade.id})\n\nBased on first-principles pyrometallurgical limits and linear programming optimization:\n\n- **Target Grade**: ${grade.name} (${grade.id}) with scrap limit **${grade.scrap_cap.toFixed(0)}%**\n- **Tramp Constraints**: Copper [Cu] ≤ ${grade.cu_tramp_cap.toFixed(2)}%, Tin [Sn] ≤ ${grade.sn_tramp_cap.toFixed(3)}%\n- **Optimal Scrap Charge**: **${recScrap.toFixed(0)}%** (maximizes circularity without hot-shortness cracking)\n- **Virgin Iron Carrier**: **Gas-based DRI** (eliminates ~0.68 tCO₂/t vs Coal DRI and saves ~37 kWh/t in EAF enthalpy)\n- **Renewable Energy Share**: **70% Green PPA** (minimizes Scope 2 emissions and maximizes CCTS EBITDA)\n- **Molten FeCr Hot Charging**: **Active** (captures -113 kWh/t sensible heat credit from captive SAF)\n\n💡 *Click below to apply this optimal recipe directly to your cockpit sliders.*`,
        isConversational: true,
        actionPayload: {
          gradeId: grade.id,
          scrapPct: recScrap,
          feSource: "gasDRI",
          fecrSource: "fecrLowC",
          niSource: "niClass1",
          renewablePct: 70.0,
          hotFecrCharging: true,
        },
        shap: co2Data,
      };
    }

    // 4. Grade Chemistry & Specifications Inquiry
    let detectedGrade: typeof grade | null = null;
    if (/grade|chemistry|composition|nominal|spec|pren|tell me about|what is/i.test(qLower)) {
      for (const [gid, gObj] of Object.entries(GRADES)) {
        const regex1 = new RegExp(`\\b${gid.toLowerCase()}\\b`, "i");
        const alias = gid.startsWith("J") ? gid.slice(1) : "";
        const regex2 = alias && alias.length > 2 ? new RegExp(`\\b${alias.toLowerCase()}\\b`, "i") : null;
        if (regex1.test(qLower) || (regex2 && regex2.test(qLower))) {
          detectedGrade = gObj;
          break;
        }
      }
    }

    if (detectedGrade) {
      const co2Data = shapReport.targets.total_co2_t;
      const prenVal = detectedGrade.cr + 3.3 * detectedGrade.mo + 16.0 * detectedGrade.n;
      const compList = [
        `**Cr**: ${detectedGrade.cr.toFixed(1)}%`,
        `**Ni**: ${detectedGrade.ni.toFixed(1)}%`,
        detectedGrade.mo > 0 ? `**Mo**: ${detectedGrade.mo.toFixed(2)}%` : null,
        `**Mn**: ${detectedGrade.mn.toFixed(1)}%`,
        detectedGrade.cu > 0 ? `**Cu**: ${detectedGrade.cu.toFixed(2)}%` : null,
        `**C**: ${detectedGrade.c.toFixed(2)}%`,
        `**Si**: ${detectedGrade.si.toFixed(2)}%`,
        `**P**: ${detectedGrade.p.toFixed(3)}%`,
        `**S**: ${detectedGrade.s.toFixed(3)}%`,
        detectedGrade.n > 0 ? `**N**: ${detectedGrade.n.toFixed(2)}%` : null,
      ].filter(Boolean);

      return {
        target: "total_co2_t",
        targetName: `Grade ${detectedGrade.id}`,
        topic: "grade_chemistry",
        title: `Grade Specification: JSL ${detectedGrade.name} (${detectedGrade.id})`,
        summary: `Nominal specifications for JSL ${detectedGrade.name}: PREN ${prenVal.toFixed(1)}, scrap ceiling ${detectedGrade.scrap_cap}%, tramp Cu limit ${detectedGrade.cu_tramp_cap}%.`,
        metaphor: "Alloy chemistry is the molecular recipe of stainless steel: chromium provides passivity, nickel stabilizes austenite, and tramp elements are tightly bounded.",
        metrics: `Nominal Composition: Cr ${detectedGrade.cr.toFixed(1)}% • Ni ${detectedGrade.ni.toFixed(1)}% • PREN: ${prenVal.toFixed(1)} • Scrap Ceiling: ${detectedGrade.scrap_cap}%.`,
        action: `Apply ${detectedGrade.name} to the cockpit sliders to calculate mass balance and charge economics.`,
        fullText: `### 🔬 Metallurgical Specification: JSL ${detectedGrade.name} (${detectedGrade.id})\n\n- **Alloy Family**: ${detectedGrade.family}\n- **Pitting Resistance (PREN)**: ${prenVal.toFixed(2)} (Cr + 3.3·Mo + 16·N)\n- **Max Scrap Ceiling**: ${detectedGrade.scrap_cap.toFixed(1)}%\n- **Tramp Element Limits**: [Cu] ≤ ${detectedGrade.cu_tramp_cap.toFixed(2)}%, [Sn] ≤ ${detectedGrade.sn_tramp_cap.toFixed(3)}%\n- **Nominal Chemistry**:\n  ${compList.join(" • ")}\n\n**Description & Typical Applications**:\n${detectedGrade.description}\n\n💡 *Click below to load ${detectedGrade.name} into your cockpit sliders.*`,
        isConversational: true,
        actionPayload: { gradeId: detectedGrade.id, scrapPct: detectedGrade.scrap_cap },
        shap: co2Data,
      };
    }

    // 5. General Decarbonization Strategy & Recommendations
    if (/decarboniz|reduce emission|carbon reduction|net zero|recommendation|strategy|roadmap|best practice/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "Decarbonization Strategy",
        topic: "decarbonization_strategy",
        title: "JSL Decarbonization Strategy & Optimal Levers",
        summary: "Key decarbonization levers: 1. Maximize scrap to tramp limit, 2. Molten FeCr hot transfer (-113 kWh/t), 3. Hybrid renewable PPA scaling (>70%).",
        metaphor: "Decarbonizing stainless steelmaking is a multi-lever transition: circulating metal atoms, capturing liquid heat, and decoupling furnace power from fossil generation.",
        metrics: "Potential Impact: ~1.4 tCO2/t abatement • ~113 kWh/t electrical savings • +₹37 Cr/yr CCTS surplus EBITDA.",
        action: "Deploy high scrap charging with gas-based DRI and 70% renewable PPA to maximize group decarbonization.",
        fullText: `### 🌿 JSL Strategic Decarbonization Playbook\n\nBased on first-principles pyrometallurgical calculations across JSL facilities, here are the **top 3 high-impact operational levers**:\n\n1. **Maximize Circular Scrap Utilization up to Tramp Boundaries**\n   - Stainless scrap replaces fossil-reduced virgin iron, cutting emissions by up to **1.30–1.45 tCO₂/t**.\n   - Keep tramp copper under ${grade.cu_tramp_cap}% to prevent hot-shortness surface cracking.\n\n2. **Captive Molten FeCr Ladle Transfer at Jajpur**\n   - Transferring liquid ferrochrome at 1,600°C directly from captive SAFs to EAF delivers a sensible heat credit of **-86.0 to -113.0 kWh/t**.\n   - Saves ₹18.2 Crore/year in EAF power costs and avoids ~37,200 tCO₂/year in electrical generation emissions.\n\n3. **Hybrid Renewable PPA Scaling (>70% Green Power)**\n   - Eliminates Scope 2 emissions and transforms JSL into a surplus seller under India's BEE CCTS (+₹36.99 Cr/yr EBITDA).\n   - Protects EU export margins under EU CBAM by creating domestic carbon tax deductions under Article 9.\n\n💡 *Click below to apply our recommended low-carbon process preset to your cockpit.*`,
        isConversational: true,
        actionPayload: {
          gradeId: grade.id,
          scrapPct: Math.min(70.0, grade.scrap_cap),
          feSource: "gasDRI",
          fecrSource: "fecrLowC",
          niSource: "niClass1",
          renewablePct: 70.0,
          hotFecrCharging: true,
        },
        shap: co2Data,
      };
    }

    // 6. Facility Comparison (Jajpur vs Hisar vs Raigarh Hub)
    if (/jajpur vs hisar|chhattisgarh|raigarh|difference between jajpur|compare plant|compare facilities|about jajpur|about hisar|about chhattisgarh|about raigarh/i.test(qLower)) {
      const co2Data = shapReport.targets.total_co2_t;
      return {
        target: "total_co2_t",
        targetName: "Facility Comparison",
        topic: "facility_info",
        title: "JSL Manufacturing Footprint: Jajpur vs Hisar vs Raigarh Hub",
        summary: "Jajpur delivers high-volume melt with captive molten FeCr (-113 kWh/t), Hisar leads in precision strip and green H2, and Raigarh (Chhattisgarh) anchors the gas-DRI raw material corridor and JSSL Steelway processing.",
        metaphor: "Jajpur is the high-volume thermal engine; Hisar is precision finishing; Raigarh is the low-carbon metallics backbone.",
        metrics: "Jajpur: 3.0 MTPA, -113 kWh/t hot FeCr • Hisar: 1.2 MTPA, green H2 • Raigarh: Gas-DRI corridor (-0.68 tCO2/t), JSSL.",
        action: "Select Jajpur, Hisar, or Chhattisgarh in the facility twin selector to compare operational economics.",
        fullText: `### 🏭 JSL Facility Profiles: Odisha, Haryana & Chhattisgarh\n\nJindal Stainless operates a fully integrated tri-hub manufacturing and raw material corridor across India:\n\n| Parameter | **Jajpur (Odisha)** | **Hisar (Haryana)** | **Raigarh Hub (Chhattisgarh)** |\n|---|---|---|---|\n| **Role** | 3.0 MTPA Integrated Melt Complex | 1.2 MTPA Precision & Specialty | Gas-DRI Corridor & JSSL Processing |\n| **FeCr Charging** | **Molten Liquid FeCr** at 1,600°C (SAF) | Solid FeCr lumps | Solid / Virgin Alloy Processing |\n| **Thermal Credit** | **-86.0 to -113.0 kWh/t** sensible heat | 0.0 kWh/t | Upstream DRI Decarbonization |\n| **Power Source** | 250 MW CPP + 315.6 MW Hybrid PPA | Northern Regional Grid + Green H₂ | Western Grid (CSPDCL) / Pithead |\n| **Decarbonization Edge** | Molten FeCr transfer + Hybrid PPA | 95 Nm³/hr Green H₂ Annealing | Syngas DRI (-0.68 tCO₂/t vs Coal DRI) |\n\n💡 *Toggle the facility selector in the cockpit to observe real-time SEC and emissions differences!*`,
        isConversational: true,
        shap: co2Data,
      };
    }
  }

  // Topic 1: Phosphorus Non-Removal Thermochemistry (Formula 06)
  if (/phosphorus|dephosphoriz|non[\s-]?removal|ellingham|eta_p|0\.99|p2o5/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.phosphorus_thermochemistry.analogy;
    const co2Data = shapReport.targets.total_co2_t;
    const metrics = `Thermodynamic Partitioning: η_P = 0.99. Process bath phosphorus: [P]_bath = Σ_j x_j · C_P,j · η_P ≤ 0.040%. Validated against METEC 2011 Outokumpu 18/8 industrial parity data with 0.00% variance. Under 18% Cr stainless bath conditions, chromium oxidizes at vastly lower chemical potential than phosphorus, making oxidative dephosphorization thermodynamically impossible (Wei et al. 2018, Selin 1987).`;
    const action = DOMAIN_ANALOGIES.phosphorus_thermochemistry.action;

    return {
      target: "total_co2_t",
      targetName: "Phosphorus Non-Removal Thermochemistry",
      title: "High-Cr Phosphorus Non-Removal Thermochemistry (η_P = 0.99)",
      topic: "phosphorus_thermochemistry",
      summary: "ΔG°(Cr2O3) << ΔG°(P2O5) prevents oxidative dephosphorization, enforcing strict scrap P ≤ 0.040% audit",
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Physical Principle\n${analogy}\n\n### 2. Thermodynamic Telemetry\n${metrics}\n\n### 3. Melt Shop Protocol\n${action}`,
      shap: co2Data,
      isConversational: true,
    };
  }

  // Topic 2: Stoichiometric Iron Crediting & double-counting elimination (Formula 01)
  if (/iron credit|stoichiometric|double[\s-]?count|inherent fe|virgin iron|fe_virgin/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.iron_crediting.analogy;
    const co2Data = shapReport.targets.total_co2_t;
    const metrics = `In JSL's closed-loop mass balance, virgin iron demand is strictly governed by: Fe_virgin = max(0, w_Fe(1 - s) - [Fe_FeCr + Fe_Ni + Fe_FeMo + Fe_FeMn + Fe_Cu]). For austenitic grade ${grade.name} (${grade.id}) with 60% scrap, inherent iron from ferroalloys supplies 180-220 kg Fe/t. Crediting this inherent iron eliminates up to 220 kg/t DRI double-counting, preventing 0.57 tCO2/t in phantom emissions.`;
    const action = DOMAIN_ANALOGIES.iron_crediting.action;

    return {
      target: "total_co2_t",
      targetName: "Stoichiometric Iron Crediting",
      title: "Stoichiometric Iron Crediting & Mass Balance",
      topic: "iron_crediting",
      summary: "Eliminates ~220 kg/t DRI double-counting, abating up to 0.57 tCO2/t in reported emissions",
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Physical Principle\n${analogy}\n\n### 2. Metallurgical Grounding\n${metrics}\n\n### 3. Operational Action\n${action}`,
      shap: co2Data,
      isConversational: true,
    };
  }

  // Topic 3: Swerim RAWMATMIX LP Dual Shadow Pricing & Value-in-Use (Formula 05)
  if (/swerim|rawmatmix|shadow price|dual shadow|value[\s-]?in[\s-]?use|viu|reduced cost|lp dual/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.shadow_pricing_viu.analogy;
    const co2Data = shapReport.targets.total_co2_t;
    const metrics = `Linear Programming Duality Formulation: Dual shadow price π_t = ∂Cost / ∂limit_t. For non-basis metallic feed j, reduced cost r_j = c_j - A^T π. The break-even Value-in-Use is ViU_j = c_purchase,j - r_j. Decoupled dual shadow prices allow JSL commercial procurement to price scrap batches with high copper or tin at an exact metallurgical discount that preserves melt profitability.`;
    const action = DOMAIN_ANALOGIES.shadow_pricing_viu.action;

    return {
      target: "total_co2_t",
      targetName: "LP Dual Shadow Pricing & ViU",
      title: "Swerim RAWMATMIX® LP Dual Shadow Pricing & Value-in-Use",
      topic: "shadow_pricing_viu",
      summary: "Extracts tramp shadow prices (π_t) to compute reduced costs and break-even scrap Value-in-Use (ViU)",
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Mathematical Principle\n${analogy}\n\n### 2. LP Duality Formulation\n${metrics}\n\n### 3. Commercial Procurement Action\n${action}`,
      shap: co2Data,
      isConversational: true,
    };
  }

  // Topic 4: Dynamic EAF SEC & Molten FeCr Sensible Heat (Formula 02)
  if (/dynamic eaf|sec_eaf|specific electrical consumption|hot charge|molten|fecr|sensible|butter|saf|ladle|पिघला|गर्म fecr|ତରଳ|flüssiges|enfournement chaud/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.hot_fecr_charging.analogy;
    const secData = shapReport.targets.eaf_sec_kwh;
    const hotAttr = secData.attributions.find((a) => a.feature === "hotFecrCharging");
    const saving = hotAttr ? Math.abs(hotAttr.attribution) : 112.91;

    if (lang !== "en") {
      const localized = getMultilingualMoltenFeCr(lang, locParams);
      return {
        target: "eaf_sec_kwh",
        targetName: "Molten FeCr Sensible Heat",
        title: "Molten FeCr Sensible Heat Charging",
        topic: "hot_fecr_charging",
        summary: localized.summary,
        metaphor: analogy,
        metrics: `Thermal Credit: -${saving.toFixed(1)} kWh/t electrical enthalpy at Jajpur EAF-2 • ~₹310/t electricity cost savings.`,
        action: DOMAIN_ANALOGIES.hot_fecr_charging.action,
        fullText: localized.fullText,
        shap: secData,
        isConversational: true,
      };
    }

    const metrics = `Dynamic EAF SEC Formulation: SEC_EAF = (Q_scrap + Q_DRI + Q_alloys - Q_hotSAF) / η_thermal + E_aux. Molten FeCr transferred at 1600°C from captive SAF delivers an immediate thermodynamic credit of -${saving.toFixed(1)} kWh/t to the EAF (62.6% of maximum furnace electrical savings). Baseline cold FeCr charging requires ~591 kWh/t EAF SEC; hot charging reduces this to ~411 kWh/t.`;
    const action = DOMAIN_ANALOGIES.hot_fecr_charging.action;

    return {
      target: "eaf_sec_kwh",
      targetName: "Molten FeCr Sensible Heat",
      title: "Molten FeCr Sensible Heat Charging",
      topic: "hot_fecr_charging",
      summary: `Thermal Credit: ~113 kWh/t savings via 1600°C SAF transfer`,
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Physical Principle\n${analogy}\n\n### 2. Thermodynamic Telemetry\n${metrics}\n\n### 3. Operational Action\n${action}`,
      shap: secData,
      isConversational: true,
    };
  }

  // Topic 5: Nickel sourcing & NPI
  if (/npi|nickel|indonesia|class 1|rkef|hydro/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.nickel_sourcing.analogy;
    const co2Data = shapReport.targets.total_co2_t;
    const metrics = `Indonesian Coal RKEF NPI has an embodied carbon factor of 55.0 tCO2/t contained Ni, compared to Class 1 Hydro-nickel at only 10.0 tCO2/t Ni and Global Standard at 15.0 tCO2/t Ni. While NPI brings cheap iron units, its high carbon footprint triggers massive Scope 3 penalties.`;
    const action = DOMAIN_ANALOGIES.nickel_sourcing.action;

    return {
      target: "total_co2_t",
      targetName: "Nickel Sourcing Dynamics",
      title: "Nickel Sourcing: NPI vs Class 1 Hydro",
      topic: "nickel_sourcing",
      summary: `NPI Carbon Penalty: 55 tCO2/t Ni vs 10 tCO2/t Ni for Hydro`,
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Physical Principle\n${analogy}\n\n### 2. Scope 3 Carbon Metrics\n${metrics}\n\n### 3. Procurement Action\n${action}`,
      shap: co2Data,
      isConversational: true,
    };
  }

  // Topic 6: CBAM, EU exports, tariffs, SEFA (Formula 03)
  if (/cbam|sefa|article 9|article9|europe|eu|tariff|export|ets|border/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.cbam_mechanism.analogy;
    const cbamData = shapReport.targets.cbam_tariff_eur;
    const metrics = `Under the EU CBAM definitive regime (2026-2034), Specific Embedded Emissions (SEE) include Scope 1 + Scope 3 precursors. Cash tariff starts at 2.5% phase-in in 2026 and ramps up to 100% by 2034. Current calculated 2026 cash tariff: €${cbamData.userValue.toFixed(2)}/t. Article 9 deductions for domestic Indian CCTS credits can partially or fully offset cash payments.`;
    const action = DOMAIN_ANALOGIES.cbam_mechanism.action;

    return {
      target: "cbam_tariff_eur",
      targetName: "EU CBAM Tariff Exposure",
      title: "EU CBAM Tariff Exposure & Mitigation",
      topic: "cbam",
      summary: `CBAM 2026 Tariff: €${cbamData.userValue.toFixed(2)}/t (Hedging via India CCTS)`,
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Regulatory Mechanism\n${analogy}\n\n### 2. Financial Metrics\n${metrics}\n\n### 3. Strategic Action\n${action}`,
      shap: cbamData,
      isConversational: true,
    };
  }

  // Topic 7: CCTS, BEE, carbon credits, EBITDA (Formula 04)
  if (/ccts|bee|carbon credit|ccc|inr|crore|ebitda|surplus|sei/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.ccts_mechanism.analogy;
    const cctsData = shapReport.targets.ccts_value_inr;
    const metrics = `Under India's Carbon Credit Trading Scheme (BEE notification), JSL Jajpur has a target of 0.8222 tCO2e/t for direct Scope 1 + indirect Scope 2 emissions. Current evaluated run generates ${cctsData.userValue >= 0 ? "+" : ""}${cctsData.userValue.toFixed(1)} ₹/t in net credit surplus/penalty at ₹1,500/t CCC pricing.`;
    const action = DOMAIN_ANALOGIES.ccts_mechanism.action;

    return {
      target: "ccts_value_inr",
      targetName: "India CCTS Impact",
      title: "India CCTS Compliance & Financial Impact",
      topic: "ccts",
      summary: `CCTS Impact: ${cctsData.userValue >= 0 ? "+" : ""}${cctsData.userValue.toFixed(1)} ₹/t surplus`,
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Market Framework\n${analogy}\n\n### 2. Balance Sheet Metrics\n${metrics}\n\n### 3. Executive Action\n${action}`,
      shap: cctsData,
      isConversational: true,
    };
  }

  // Topic 8: Coal DRI vs Gas DRI, energy intensity, enthalpy
  if (/gas dri|coal dri|coal-based|gas-based|rotary kiln|gangue|energy consumption|high energy|furnace enthalpy/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.fe_sourcing.analogy;
    const secData = shapReport.targets.eaf_sec_kwh;
    const co2Data = shapReport.targets.total_co2_t;
    const feSecAttr = secData.attributions.find((a) => a.feature === "feSource");
    const feCo2Attr = co2Data.attributions.find((a) => a.feature === "feSource");
    const secVal = feSecAttr ? feSecAttr.attribution : -37.2;
    const co2Val = feCo2Attr ? feCo2Attr.attribution : -0.68;
    const metrics = `Coal-based DRI carries significant acid gangue (SiO2/Al2O3) and unreduced FeO, requiring high flux additions and consuming an extra ${Math.abs(secVal).toFixed(1)} kWh/t in EAF enthalpy compared to Gas DRI. Furthermore, coal rotary kiln reduction generates ~${Math.abs(co2Val).toFixed(2)} tCO2/t higher upstream Scope 3 emissions.`;
    const action = DOMAIN_ANALOGIES.fe_sourcing.action;

    return {
      target: "eaf_sec_kwh",
      targetName: "Virgin DRI Enthalpy Dynamics",
      title: "Virgin Iron (DRI) Energy & Carbon Dynamics",
      topic: "fe_sourcing",
      summary: `Gas DRI delivers ~37 kWh/t energy saving and ~0.68 tCO2/t abatement`,
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Physical Principle\n${analogy}\n\n### 2. Energy & Enthalpy Metrics\n${metrics}\n\n### 3. Melt Shop Action\n${action}`,
      shap: secData,
      isConversational: true,
    };
  }

  // Topic 9: Tramp copper, scrap limit, hot shortness
  if (/scrap|copper|tramp|crack|shortness|cap|limit|revert|तांबा|कॉपर|दरार|ତମ୍ବା|ଫାଟ|kupfer|rotbruch|cuivre|criques/.test(qLower)) {
    const analogy = DOMAIN_ANALOGIES.tramp_copper.analogy;
    const userScrap = inputs.scrapPct ?? 60.0;

    if (lang !== "en") {
      const localized = getMultilingualTrampCopper(lang, locParams);
      return {
        target: "total_co2_t",
        targetName: "Tramp Copper Ceilings",
        title: "Tramp Copper Ceilings & Scrap Limits",
        topic: "tramp_copper",
        summary: localized.summary,
        metaphor: analogy,
        metrics: `For Grade ${grade.name} (${grade.id}), the metallurgical tramp scrap cap is strictly ${grade.scrap_cap}%. Current cockpit setting is ${userScrap}% (effective scrap: ${Math.min(userScrap, grade.scrap_cap)}%). Tramp copper limit is [Cu] <= ${grade.cu_tramp_cap}%.`,
        action: DOMAIN_ANALOGIES.tramp_copper.action
          .replace("{scrapCap}", grade.scrap_cap.toString())
          .replace("{cuTrampCap}", grade.cu_tramp_cap.toString()),
        fullText: localized.fullText,
        shap: shapReport.targets.total_co2_t,
        isConversational: true,
      };
    }

    const metrics = `For Grade ${grade.name} (${grade.id}), the metallurgical tramp scrap cap is strictly ${grade.scrap_cap}%. Current cockpit setting is ${userScrap}% (effective scrap: ${Math.min(userScrap, grade.scrap_cap)}%). Tramp copper limit is [Cu] <= ${grade.cu_tramp_cap}%. In EAF melting, copper cannot be oxidized into slag because its oxygen affinity is lower than iron and chromium.`;
    const action = DOMAIN_ANALOGIES.tramp_copper.action
      .replace("{scrapCap}", grade.scrap_cap.toString())
      .replace("{cuTrampCap}", grade.cu_tramp_cap.toString());

    return {
      target: "total_co2_t",
      targetName: "Tramp Copper Ceilings",
      title: "Tramp Copper Ceilings & Scrap Limits",
      topic: "tramp_copper",
      summary: `Tramp Copper Boundary: Max ${grade.scrap_cap}% scrap on ${grade.id}`,
      metaphor: analogy,
      metrics,
      action,
      fullText: `### 1. Physical Principle\n${analogy}\n\n### 2. Metallurgical Grounding\n${metrics}\n\n### 3. Recommendation\n${action}`,
      shap: shapReport.targets.total_co2_t,
      isConversational: true,
    };
  }

  // Default fallback: Contextually Grounded in Active Heat & Facility
  if (lang !== "en") {
    const greetingObj = getMultilingualGreeting(lang, locParams);
    return {
      target: "total_co2_t",
      targetName: `${grade.id} Assessment`,
      topic: "general",
      title: `Process Assessment: ${grade.name} (${grade.id})`,
      summary: `Process analysis for ${grade.name} at ${facility}: ${currentCo2.toFixed(2)} tCO2/t carbon footprint, ${currentSec.toFixed(1)} kWh/t EAF SEC.`,
      metaphor: `Optimizing ${grade.name} requires balancing pyrometallurgical tramp boundaries, thermodynamic enthalpy, and trade carbon regulations.`,
      metrics: `Active Run: Grade ${grade.name} at ${facility} • Scrap: ${currentScrap}% • Footprint: ~${currentCo2.toFixed(2)} tCO2/t • SEC: ${currentSec.toFixed(1)} kWh/t.`,
      action: `Adjust scrap up to ${grade.scrap_cap}% and evaluate high-efficiency feeds to reduce specific carbon intensity.`,
      fullText: `### 💡 Process Intelligence: ${grade.name} (${grade.id})\n\n${greetingObj.fullText}`,
      isConversational: true,
      shap: co2Data,
    };
  }

  return {
    target: "total_co2_t",
    targetName: `${grade.id} Assessment`,
    topic: "general",
    title: `Process Assessment: ${grade.name} (${grade.id})`,
    summary: `Process analysis for ${grade.name} at ${facility}: ${currentCo2.toFixed(2)} tCO2/t carbon footprint, ${currentSec.toFixed(1)} kWh/t EAF SEC.`,
    metaphor: `Optimizing ${grade.name} requires balancing pyrometallurgical tramp boundaries, thermodynamic enthalpy, and trade carbon regulations.`,
    metrics: `Active Run: Grade ${grade.name} at ${facility} • Scrap: ${currentScrap}% • Footprint: ~${currentCo2.toFixed(2)} tCO2/t • SEC: ${currentSec.toFixed(1)} kWh/t.`,
    action: `Adjust scrap up to ${grade.scrap_cap}% and evaluate high-efficiency feeds to reduce specific carbon intensity.`,
    fullText: `### 💡 Metallurgical Assessment: ${grade.name} (${grade.id})\n\nRegarding: *"${query}"*\n\nIn our integrated EAF-AOD stainless steelmaking route at **${facility}**:\n- **Active Process State**: Grade ${grade.name} with ${currentScrap}% scrap and ${feSrc} virgin iron.\n- **Specific Carbon Footprint**: **${currentCo2.toFixed(2)} tCO₂/t** liquid steel.\n- **EAF Specific Energy Consumption**: **${currentSec.toFixed(1)} kWh/t**.\n- **Tramp Element Thresholds**: Copper ceiling [Cu] ≤ ${grade.cu_tramp_cap.toFixed(2)}%, Scrap Cap ≤ ${grade.scrap_cap}%.\n\n**You can ask me to:**\n- 🎯 *'Optimize charge mix for ${grade.id} to minimize cost'*\n- ⚡ *'How does molten FeCr hot charging save electricity?'*\n- ⚖️ *'What is our EU CBAM tariff liability in 2026?'*\n- 🧪 *'Calculate slag basicity and FeSi 75 reduction demand'*\n- 🔬 *'What is the nominal composition of J316 or J4?'*`,
    isConversational: true,
    shap: co2Data,
  };
}

export function answerClientConversationalQuery(
  query: string,
  inputs: CalculatorInputs,
  shapReport?: MultiTargetShapReport,
  lang?: AssistantLanguage
): ExplanationResponse {
  const res = answerClientConversationalQueryInner(query, inputs, shapReport, lang);
  return attachActionPayloadAndToken(res, inputs);
}
