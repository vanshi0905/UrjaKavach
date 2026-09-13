/**
 * UrjaSaathi Multilingual Pyrometallurgical NLG Engine
 * Supported Languages:
 *   - en: English (Global engineering standard)
 *   - hi: हिन्दी (National industrial melt-shop standard)
 *   - hn: Hinglish (Plant-floor conversational mix)
 *   - cg: छत्तीसगढ़ी (NIT Raipur team region & JSL Raigarh DRI corridor)
 *   - bho: भोजपुरी (Purvanchal & melt-shop crane workforce)
 *   - od: ଓଡ଼ିଆ (JSL Jajpur flagship 3.0 MTPA hub)
 *   - de: Deutsch (EU CBAM statutory export compliance)
 *   - fr: Français (EU CBAM & international trade)
 */

export type AssistantLanguage =
  | "en"
  | "hi"
  | "hn"
  | "cg"
  | "bho"
  | "od"
  | "de"
  | "fr";

export interface LanguageMeta {
  id: AssistantLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  short: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { id: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", short: "EN", region: "Global Engineering" },
  { id: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳", short: "HI", region: "National Melt-Shop" },
  { id: "hn", label: "Hinglish", nativeLabel: "Hinglish", flag: "🛠️", short: "HN", region: "Plant Floor Mix" },
  { id: "cg", label: "Chhattisgarhi", nativeLabel: "छत्तीसगढ़ी", flag: "🌾", short: "CG", region: "NIT Raipur / Raigarh DRI" },
  { id: "bho", label: "Bhojpuri", nativeLabel: "भोजपुरी", flag: "⚡", short: "BHO", region: "Purvanchal Melt-Shop" },
  { id: "od", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", flag: "🏛️", short: "OD", region: "Jajpur Hub (3.0 MTPA)" },
  { id: "de", label: "Deutsch", nativeLabel: "Deutsch", flag: "🇩🇪", short: "DE", region: "EU CBAM / Export" },
  { id: "fr", label: "Français", nativeLabel: "Français", flag: "🇫🇷", short: "FR", region: "EU CBAM / Global" },
];

export const SUGGESTED_QUERIES_BY_LANG: Record<AssistantLanguage, string[]> = {
  en: [
    "Why is my energy consumption so high with coal DRI?",
    "What is tramp copper and why is scrap capped?",
    "How does molten FeCr hot charging help?",
    "What is our EU CBAM tariff exposure for Europe?",
    "How does India CCTS generate EBITDA surplus?",
  ],
  hi: [
    "कोयला DRI के साथ बिजली की खपत इतनी अधिक क्यों है?",
    "ट्रैम्प कॉपर क्या है और स्क्रैप उपयोग पर सीमा क्यों है?",
    "पिघले हुए FeCr की हॉट चार्जिंग से क्या लाभ होता है?",
    "यूरोप के लिए हमारा EU CBAM टैरिफ जोखिम क्या है?",
    "भारत CCTS योजना से EBITDA सरप्लस कैसे बनता है?",
  ],
  hn: [
    "Coal DRI use karne se EAF power consumption itna high kyu hai?",
    "Tramp copper kya hai aur scrap ratio kyu cap kiya hai?",
    "Jajpur me molten FeCr hot charging se kitna power bachta hai?",
    "Europe export ke liye EU CBAM ka kitna tax lagega?",
    "India CCTS se tradable carbon credits kaise kamayein?",
  ],
  cg: [
    "कोयला DRI म भट्ठी के बिजली खरचा एतका जादा काबर हे?",
    "ट्रैम्प कॉपर का होथे अउ स्क्रैप ल 65% म काबर रोके गे हे?",
    "जाजपुर म पिघले FeCr डाले ले भट्ठी म का फायदा होथे?",
    "यूरोप भेजे बर CBAM टैक्स के का असर परिहि?",
    "CCTS ले कार्बन क्रेडिट कइसे मिलहि अउ फायदा कइसे होहि?",
  ],
  bho: [
    "कोयला DRI से भट्ठी में एतना जादे बिजली काहे लागेला?",
    "ट्रैम्प कॉपर का हवे आ स्क्रैप पर रोक काहे लगावल गइल बा?",
    "जाजपुर में गरम FeCr डाले से बिजली केतना बची?",
    "यूरोप एक्सपोर्ट पर CBAM के का टैक्स लागी?",
    "भारत CCTS से कार्बन क्रेडिट कइसे मिली आ नफ़ा कइसे होई?",
  ],
  od: [
    "କୋଇଲା DRI ବ୍ୟବହାରରେ ବିଦ୍ୟୁତ ଖର୍ଚ୍ଚ ଏତେ ଅଧିକ କାହିଁକି?",
    "ଟ୍ରାମ୍ପ ତମ୍ବା କ'ଣ ଏବଂ ସ୍କ୍ରାପ୍ କାହିଁକି ସୀମିତ ଅଛି?",
    "ଯାଜପୁର SAF ରୁ ତରଳ FeCr ହଟ୍ ଚାର୍ଜିଂ କିପରି ସାହାଯ୍ୟ କରେ?",
    "ୟୁରୋପ ପାଇଁ ଆମର EU CBAM ଟାରିଫ୍ କେତେ ହେବ?",
    "ଭାରତ CCTS ଯୋଜନାରୁ EBITDA ଲାଭ କିପରି ମିଳିବ?",
  ],
  de: [
    "Warum ist der spezifische Energiebedarf mit Kohle-DRI so hoch?",
    "Was ist Tramp-Kupfer und warum ist die Schrottrate begrenzt?",
    "Welchen thermischen Vorteil bringt flüssiges FeCr Hot-Charging?",
    "Wie hoch ist unsere EU-CBAM-Zollexposition für 2026?",
    "Wie generiert der indische CCTS-Mechanismus einen EBITDA-Überschuss?",
  ],
  fr: [
    "Pourquoi la consommation d'énergie est-elle si élevée avec le DRI charbon ?",
    "Qu'est-ce que le cuivre tramp et pourquoi la ferraille est-elle plafonnée ?",
    "Comment l'enfournement de FeCr liquide aide-t-il le bilan thermique ?",
    "Quelle est notre exposition tarifaire au MACF européen (CBAM) ?",
    "Comment le mécanisme indien CCTS génère-t-il un surplus d'EBITDA ?",
  ],
};

export const INPUT_PLACEHOLDERS_BY_LANG: Record<AssistantLanguage, string> = {
  en: "Ask about scrap limits, tramp copper, CBAM tariffs, or molten FeCr...",
  hi: "स्क्रैप सीमा, ट्रैम्प कॉपर, CBAM टैरिफ या मोल्टन FeCr के बारे में पूछें...",
  hn: "Scrap limits, tramp copper, CBAM tax ya molten FeCr ke baare me poochein...",
  cg: "स्क्रैप सीमा, ट्रैम्प कॉपर, CBAM टैक्स या गरम FeCr के बारे म पूछव...",
  bho: "स्क्रैप सीमा, ट्रैम्प कॉपर, CBAM टैक्स भा गरम FeCr के बारे में पूछीं...",
  od: "ସ୍କ୍ରାପ୍ ସୀମା, ଟ୍ରାମ୍ପ ତମ୍ବା, CBAM ଟ୍ୟାରିଫ୍ କିମ୍ବା ତରଳ FeCr ବିଷୟରେ ପଚାରନ୍ତୁ...",
  de: "Fragen Sie zu Schrottgrenzen, Tramp-Kupfer, CBAM-Zöllen oder FeCr...",
  fr: "Posez une question sur la ferraille, le cuivre résiduel, le CBAM ou le FeCr...",
};

export function detectQueryLanguage(
  query: string,
  preferredLang?: AssistantLanguage
): AssistantLanguage {
  if (preferredLang && preferredLang !== "en") {
    return preferredLang;
  }
  const q = query.trim();
  // Chhattisgarhi specific markers
  if (/(काबर|का होथे|संगी|करव|डारबो|अंव|लागत हे|होवत हे|हमन|कइसे|कहावत|झन)/i.test(q)) {
    return "cg";
  }
  // Bhojpuri specific markers
  if (/(काहे|का हवे|हईं|राउर|बानी|बा|होई|करीं|पूछीं|एतना|केतना|हमनी)/i.test(q)) {
    return "bho";
  }
  // Odia script or Odia words
  if (/[\u0B00-\u0B7F]/.test(q) || /(କ'ଣ|କାହିଁକି|ନମସ୍କାର|ପାଇଁ|କରନ୍ତୁ|ହେବ|କେତେ|ଭାଟି|ତମ୍ବା)/i.test(q)) {
    return "od";
  }
  // Devanagari script (Hindi fallback if not CG/BHO)
  if (/[\u0900-\u097F]/.test(q)) {
    return "hi";
  }
  // Hinglish markers
  if (/\b(kya hai|kaise|kyu|kyun|batao|bachta|karo|karna|chahiye|kitna|hoga|hoti hai|hota hai|lagta hai|kijiye|sangi|hamar)\b/i.test(q)) {
    return "hn";
  }
  // German markers
  if (/\b(guten tag|hallo|warum|wie|schrott|energieverbrauch|zoll|enthalpie|kupfer|stromverbrauch|auswirkung)\b/i.test(q)) {
    return "de";
  }
  // French markers
  if (/\b(bonjour|pourquoi|comment|ferraille|consommation|énergie|taxe|cuivre|laitier|carbone)\b/i.test(q)) {
    return "fr";
  }
  return preferredLang || "en";
}

export interface LocalizedContentParams {
  facility: string;
  gradeName: string;
  gradeId: string;
  scrapCap: number;
  cuTrampCap: number;
  currentScrap: number;
  currentCo2: number;
  currentSec: number;
  recScrap: number;
  query?: string;
  feSrc?: string;
}

export function getMultilingualGreeting(
  lang: AssistantLanguage,
  p: LocalizedContentParams
): { summary: string; fullText: string } {
  switch (lang) {
    case "hi":
      return {
        summary: "नमस्ते! मैं ऊर्जासाथी AI हूँ — जिंदल स्टेनलेस के लिए आपका 24/7 मेल्ट सलाहकार।",
        fullText: `नमस्ते! 👋 मैं **ऊर्जासाथी AI** हूँ — *जिंदल स्टेनलेस मेल्ट शॉप के लिए आपका 24/7 शिफ्ट साथी और प्रोसेस सलाहकार*।\n\nमैं वर्तमान में **${p.facility}** में **${p.gradeName} (${p.gradeId})** के परिचालन की निगरानी कर रहा हूँ (वर्तमान में ${p.currentScrap}% स्क्रैप और ~${p.currentCo2.toFixed(2)} tCO₂/t कार्बन फुटप्रिंट)।\n\n### 🛠️ मैं निम्नलिखित कार्यों में सहायता कर सकता हूँ:\n- 🎯 **चार्ज ऑप्टिमाइज़ेशन**: *'${p.gradeId} के लिए सबसे कम लागत वाला चार्ज मिक्स तैयार करें'*\n- ⚡ **EAF बिजली बचत**: *'जाजपुर में पिघले FeCr की हॉट चार्जिंग से ~113 kWh/t बिजली कैसे बचती है?'*\n- ⚖️ **CBAM और CCTS**: *'2026 में यूरोप के लिए हमारा EU CBAM टैक्स कितना होगा?'*\n- 🧪 **स्लैग काइनेटिक्स**: *'बेसिसिटी 1.90 के लिए FeSi 75 और चूने की मात्रा की गणना करें'*\n\nआप मुझसे क्या पूछना चाहते हैं?`,
      };
    case "hn":
      return {
        summary: "Namaste! Main UrjaSaathi AI hoon — Aapka 24/7 Shift Companion & Melt Shop Advisor.",
        fullText: `Namaste! 👋 Main hoon **UrjaSaathi AI** — *Aapka 24/7 Shift Companion & Melt Shop Advisor* for **UrjaKavach**.\n\nMain abhi **${p.facility}** plant me **${p.gradeName} (${p.gradeId})** ke run ko monitor kar raha hoon (abhi set hai ${p.currentScrap}% scrap aur ~${p.currentCo2.toFixed(2)} tCO₂/t carbon footprint).\n\n### 🛠️ Common tasks jisme main help kar sakta hoon:\n- 🎯 **Charge Optimization**: *'Optimize charge mix for ${p.gradeId} to minimize cost'*\n- ⚡ **EAF Power Savings**: *'Jajpur me molten FeCr hot charging se ~113 kWh/t power kaise bachti hai?'*\n- ⚖️ **EU CBAM & India CCTS**: *'Europe export ke liye 2026 me kitna CBAM tax lagega?'*\n- 🧪 **Slag Kinetics**: *'Basicity 1.90 ke liye FeSi 75 reduction aur lime calculation'*\n\nAapko kis process parameter me help chahiye?`,
      };
    case "cg":
      return {
        summary: "जय जोहार संगी! मैं ऊर्जासाथी AI अंव — जिंदल स्टेनलेस बर राउर 24/7 भट्ठी सलाहकार।",
        fullText: `जय जोहार संगी! 🙏 मैं **ऊर्जासाथी AI** अंव — *जिंदल स्टेनलेस बर राउर 24/7 भट्ठी अउ मेल्ट सलाहकार* (NIT रायपुर अउ रायगढ़ DRI बेल्ट बर समर्पित)।\n\nअभी हमन **${p.facility}** म **${p.gradeName} (${p.gradeId})** के काम देखत हन (अभी ${p.currentScrap}% स्क्रैप अउ ~${p.currentCo2.toFixed(2)} tCO₂/t कार्बन फुटप्रिंट हे)।\n\n### 🛠️ मैं ये सब काम म राउर मदद कर सकथंव:\n- 🎯 **चार्ज सुधारव**: *'${p.gradeId} बर सबले सस्ता अउ कम कार्बन वाला चार्ज बनाव'*\n- ⚡ **बिजली बचत**: *'जाजपुर SAF ले गरम FeCr डाले ले ~113 kWh/t बिजली कइसे बचथे?'*\n- ⚖️ **CBAM अउ CCTS**: *'यूरोप एक्सपोर्ट म CBAM टैक्स अउ भारत CCTS ले फायदा'*\n- 🧪 **स्लैग अउ चूना**: *'FeSi 75 अउ चूना के सही हिसाब'*\n\nबतावव संगी, अभी भट्ठी बर का हिसाब-किताब देखना हे?`,
      };
    case "bho":
      return {
        summary: "प्रणाम मालिक! हम ऊर्जासाथी AI हईं — जिंदल स्टेनलेस खातिर राउर 24/7 मेल्ट सलाहकार।",
        fullText: `प्रणाम मालिक! 🙏 हम **ऊर्जासाथी AI** हईं — *जिंदल स्टेनलेस खातिर राउर 24/7 मेल्ट शॉप आ भट्ठी सलाहकार*।\n\nअभी हम **${p.facility}** में **${p.gradeName} (${p.gradeId})** खातिर काम देख रहल बानी (अभी सेट बा ${p.currentScrap}% स्क्रैप आ ~${p.currentCo2.toFixed(2)} tCO₂/t कार्बन)।\n\n### 🛠️ हम राउर एह सब काम में मदद कर सकेनी:\n- 🎯 **चार्ज ऑप्टिमाइज़ेशन**: *'${p.gradeId} खातिर सबसे सस्ता आ बढ़ियां चार्ज रेसिपी निकालीं'*\n- ⚡ **बिजली बचत**: *'जाजपुर में गरम FeCr डाले से ~113 kWh/t बिजली कइसे बची?'*\n- ⚖️ **CBAM आ CCTS**: *'यूरोप भेजे पर CBAM टैक्स आ भारत CCTS से मुनाफा'*\n- 🧪 **स्लैग आ चूना**: *'FeSi 75 आ चूना के सही मात्रा'*\n\nबताईं मालिक, भट्ठी में का सलाह चाहीं?`,
      };
    case "od":
      return {
        summary: "ନମସ୍କାର! ମୁଁ ଉର୍ଜାସାଥୀ AI — ଯାଜପୁର ଓ ହିସାର ପ୍ଲାଣ୍ଟ ପାଇଁ ଆପଣଙ୍କର ୨୪/୭ ମେଲ୍ଟ ପରାମର୍ଶଦାତା।",
        fullText: `ନମସ୍କାର! 🙏 ମୁଁ **ଉର୍ଜାସାଥୀ AI** — *ଜିନ୍ଦଲ ଷ୍ଟେନଲେସ ଯାଜପୁର ଓ ହିସାର ପ୍ଲାଣ୍ଟ ପାଇଁ ଆପଣଙ୍କର ୨୪/୭ ଡିଜିଟାଲ ମେଲ୍ଟ ପରାମର୍ଶଦାତା*।\n\nବର୍ତ୍ତମାନ ମୁଁ **${p.facility}** ପ୍ଲାଣ୍ଟରେ **${p.gradeName} (${p.gradeId})** ପରିଚାଳନା ଉପରେ ନଜର ରଖିଛି (ବର୍ତ୍ତମାନ ${p.currentScrap}% ସ୍କ୍ରାପ୍ ଏବଂ ~${p.currentCo2.toFixed(2)} tCO₂/t କାର୍ବନ ଫୁଟପ୍ରିଣ୍ଟ ରହିଛି)।\n\n### 🛠️ ମୁଁ ଆପଣଙ୍କୁ ନିମ୍ନଲିଖିତ କାର୍ଯ୍ୟରେ ସାହାଯ୍ୟ କରିପାରିବି:\n- 🎯 **ଚାର୍ଜ ଅପ୍ଟିମାଇଜେସନ**: *'${p.gradeId} ପାଇଁ ସର୍ବନିମ୍ନ ଖର୍ଚ୍ଚ ଏବଂ କମ କାର୍ବନ ଚାର୍ଜ ପ୍ରସ୍ତୁତ କରନ୍ତୁ'*\n- ⚡ **EAF ବିଦ୍ୟୁତ ସଞ୍ଚୟ**: *'ଯାଜପୁର SAF ରୁ ତରଳ FeCr ହଟ୍ ଚାର୍ଜିଂ ଦ୍ୱାରା କିପରି ~୧୧୩ kWh/t ବିଦ୍ୟୁତ ସଞ୍ଚୟ ହୁଏ?'*\n- ⚖️ **CBAM ଓ CCTS**: *'ୟୁରୋପ ରପ୍ତାନି ପାଇଁ EU CBAM ଟାରିଫ୍ ଏବଂ ଭାରତ CCTS ଲାଭ'*\n- 🧪 **ସ୍ଲାଗ୍ କାଇନେଟିକ୍ସ**: *'FeSi 75 ଏବଂ ଚୂନର ସଠିକ୍ ପରିମାଣ ନିର୍ଣ୍ଣୟ'*\n\nକହନ୍ତୁ, ଭାଟି ପରିଚାଳନାରେ କି ସାହାଯ୍ୟ ଦରକାର?`,
      };
    case "de":
      return {
        summary: "Guten Tag! Ich bin UrjaSaathi AI — Ihr 24/7 Prozessbegleiter und Schmelzberater.",
        fullText: `Guten Tag! 👋 Ich bin **UrjaSaathi AI** — *Ihr 24/7 Prozessbegleiter und Schmelzberater* für **UrjaKavach**.\n\nIch überwache derzeit unsere Anlagen in **${p.facility}** für **${p.gradeName} (${p.gradeId})** (aktuell ${p.currentScrap}% Schrott und ~${p.currentCo2.toFixed(2)} tCO₂/t CO2-Bilanz).\n\n### 🛠️ Wobei ich Sie unterstützen kann:\n- 🎯 **Chargenoptimierung**: *'Chargenmischung für ${p.gradeId} kosten- oder CO2-optimal berechnen'*\n- ⚡ **EAF-Stromverbrauch**: *'Wie flüssiges FeCr in Jajpur ~113 kWh/t Strom einspart'*\n- ⚖️ **EU-CBAM & CCTS**: *'Wie hoch ist die CBAM-Zollbelastung für Europa ab 2026?'*\n- 🧪 **Schlackenkinetik**: *'Berechnung von FeSi 75 Reduktion und Kalkzugabe für Basizität 1.90'*\n\nWie kann ich Ihre Schmelzbetriebsplanung jetzt unterstützen?`,
      };
    case "fr":
      return {
        summary: "Bonjour ! Je suis UrjaSaathi AI — Votre conseiller métallurgique et décarbonation 24/7.",
        fullText: `Bonjour ! 👋 Je suis **UrjaSaathi AI** — *Votre conseiller métallurgique et décarbonation 24/7* pour **UrjaKavach**.\n\nJe surveille actuellement les opérations à **${p.facility}** pour la nuance **${p.gradeName} (${p.gradeId})** (${p.currentScrap}% de ferraille et ~${p.currentCo2.toFixed(2)} tCO₂/t d'empreinte carbone).\n\n### 🛠️ Mes domaines d'assistance :\n- 🎯 **Optimisation de charge** : *'Optimiser le mélange pour ${p.gradeId} au moindre coût'*\n- ⚡ **Énergie du four EAF** : *'Comment l'enfournement de FeCr liquide à Jajpur économise ~113 kWh/t'*\n- ⚖️ **MACF européen (CBAM)** : *'Quelle est notre exposition tarifaire aux frontières européennes ?'*\n- 🧪 **Cinétique du laitier** : *'Calcul du flux de chaux et réduction au FeSi 75 pour basicité 1.90'*\n\nQue souhaitez-vous explorer pour cette coulée ?`,
      };
    default:
      return {
        summary: "Namaste! I am UrjaSaathi AI — Aapka 24/7 Shift Companion & Melt Advisor. How can I assist your operations today?",
        fullText: `Namaste! 👋 I am **UrjaSaathi AI** — *Aapka 24/7 Shift Companion & Melt Advisor* for **UrjaKavach**.\n\nI am actively monitoring our **${p.facility}** operations for **${p.gradeName} (${p.gradeId})** (currently set to ${p.currentScrap}% scrap with ~${p.currentCo2.toFixed(2)} tCO₂/t footprint).\n\n### 🛠️ Common tasks I can assist you with:\n- 🎯 **Charge Optimization**: *'Optimize charge mix for ${p.gradeId} to minimize cost'* or *'Minimize carbon footprint'*\n- ⚡ **EAF Enthalpy & Power**: *'How does molten FeCr hot charging save ~113 kWh/t at Jajpur?'*\n- ⚖️ **Trade & Regulations**: *'What is our EU CBAM tariff exposure for Europe in 2026?'* or *'How does India CCTS generate EBITDA?'*\n- 🧪 **Slag Kinetics**: *'Calculate FeSi 75 reduction and lime flux for basicity 1.90'*\n- 🔬 **Grade Specifications**: *'What is the nominal chemistry and scrap cap for J4 or J316L?'*\n\nHow can I assist you right now?`,
      };
  }
}

export function getMultilingualTrampCopper(
  lang: AssistantLanguage,
  p: LocalizedContentParams
): { summary: string; fullText: string } {
  switch (lang) {
    case "hi":
      return {
        summary: `ट्रैम्प कॉपर सीमा: ग्रेड ${p.gradeId} पर अधिकतम ${p.scrapCap}% स्क्रैप`,
        fullText: `### 1. भौतिक सिद्धांत (एनालॉजी)\nजैसे रद्दी कागज में स्टेपलर पिन या गोंद रह जाने से तेज रफ्तार छपाई के दौरान कागज फट जाता है, वैसे ही स्टेनलेस स्टील में तांबा (कॉपर) AOD/EAF में बाहर नहीं निकाला जा सकता। यह ग्रेन बाउंड्रीज पर जमा हो जाता है और हॉट रोलिंग के दौरान दरारें (hot-shortness cracking) पैदा करता है।\n\n### 2. धातु विज्ञान सीमा\nग्रेड ${p.gradeName} (${p.gradeId}) के लिए स्क्रैप की अधिकतम सीमा ${p.scrapCap}% और कॉपर की अधिकतम सीमा [Cu] ≤ ${p.cuTrampCap}% है।\n\n### 3. भट्ठी के लिए निर्देश\nस्क्रैप को ${p.scrapCap}% पर सीमित रखें या कॉपर को तनु (dilute) करने के लिए आंतरिक रीवर्ट स्क्रैप और गैस DRI का उपयोग करें।`,
      };
    case "hn":
      return {
        summary: `Tramp Copper Limit: Max ${p.scrapCap}% scrap on ${p.gradeId}`,
        fullText: `### 1. Physical Principle & Analogy\nJaise recycled paper me agar staple pin reh jaye to printing ke time paper phat jata hai, waise hi stainless steel metallurgy me copper EAF/AOD refining me oxidize hokar bahar nahi nikalta. Limit cross hone par grain boundaries par jama hokar hot-shortness surface cracking kar deta hai.\n\n### 2. Metallurgical Grounding\nGrade ${p.gradeName} (${p.gradeId}) ke liye scrap limit strictly ${p.scrapCap}% hai aur tramp copper limit [Cu] <= ${p.cuTrampCap}% hai.\n\n### 3. Melt Shop Action\nScrap charge ko ${p.scrapCap}% ke andar rakhein ya low-copper internal revert scrap aur Gas DRI ke sath blend karke copper dilute karein.`,
      };
    case "cg":
      return {
        summary: `ट्रैम्प कॉपर सीमा: ग्रेड ${p.gradeId} बर अधिकतम ${p.scrapCap}% स्क्रैप`,
        fullText: `### 1. भौतिक सिद्धांत (एनालॉजी)\nजैसे रद्दी कागज म आलपिन अउ गोंद फंस जाथे त छपाई के बेरा कागज पट-पट फट जाथे, वइसने स्टेनलेस स्टील म तांबा (कॉपर) बाहर नइ निकल सके। अगर कॉपर 0.40% ले जादा हो जाहि, त रोलिंग के बेरा स्लैब म दरार (hot-shortness cracking) आ जाहि! एही खातिर स्क्रैप ल सीमा म रखना जरूरी हे।\n\n### 2. धातु विज्ञान सीमा\nग्रेड ${p.gradeName} (${p.gradeId}) बर स्क्रैप के सीमा ${p.scrapCap}% अउ कॉपर के सीमा [Cu] ≤ ${p.cuTrampCap}% हे।\n\n### 3. भट्ठी बर काम\nस्क्रैप ल ${p.scrapCap}% ले जादा झन डारव, अउ कॉपर कम करे बर गैस DRI मिलावव।`,
      };
    case "bho":
      return {
        summary: `ट्रैम्प कॉपर सीमा: ग्रेड ${p.gradeId} खातिर अधिकतम ${p.scrapCap}% स्क्रैप`,
        fullText: `### 1. भौतिक सिद्धांत (एनालॉजी)\nजैसे रद्दी कागज में स्टेपलर के पिन रह गइला पर प्रिंटिंग के घरी कागज फाट जाला, ओइसहीं स्टेनलेस स्टील में तांबा (कॉपर) भट्ठी में से उड़ ना पावेला। जदी कॉपर 0.40% से बेसी हो गइल, त रोलिंग के घरी स्लैब बीच से फाट जाई (hot shortness cracking)। एह से स्क्रैप के सीमा में राखल बहुत जरूरी बा!\n\n### 2. धातु विज्ञान सीमा\nग्रेड ${p.gradeName} (${p.gradeId}) खातिर स्क्रैप के लिमिट ${p.scrapCap}% आ कॉपर लिमिट [Cu] ≤ ${p.cuTrampCap}% बा।\n\n### 3. भट्ठी खातिर सलाह\nस्क्रैप के ${p.scrapCap}% से बेसी ना डालीं, आ गैस DRI मिला के कॉपर के असर कम करीं।`,
      };
    case "od":
      return {
        summary: `ଟ୍ରାମ୍ପ ତମ୍ବା ସୀମା: ଗ୍ରେଡ୍ ${p.gradeId} ପାଇଁ ସର୍ବାଧିକ ${p.scrapCap}% ସ୍କ୍ରାପ୍`,
        fullText: `### 1. ଭୌତିକ ସିଦ୍ଧାନ୍ତ (ଏନାଲୋଜି)\nଯେପରି ପୁରୁଣା କାଗଜରେ ଷ୍ଟାପଲର ପିନ୍ ରହିଗଲେ ଛାପିବା ସମୟରେ କାଗଜ ଚିରିଯାଏ, ସେହିପରି ଷ୍ଟେନଲେସ ଷ୍ଟିଲରେ ତମ୍ବା (କପର) ଅକ୍ସିଡାଇଜ୍ ହୋଇ ବାହାରି ପାରେ ନାହିଁ। ଯଦି ଏହା ୦.୪୦% ରୁ ଅଧିକ ହୁଏ, ତେବେ ରୋଲିଂ ବେଳେ ଫାଟ (hot shortness cracking) ସୃଷ୍ଟି ହୁଏ। ତେଣୁ ସ୍କ୍ରାପ୍ କ୍ୟାପ୍ ରଖିବା ନିତାନ୍ତ ଜରୁରୀ।\n\n### 2. ଧାତବ ସୀମା\nଗ୍ରେଡ୍ ${p.gradeName} (${p.gradeId}) ପାଇଁ ସର୍ବାଧିକ ସ୍କ୍ରାପ୍ ସୀମା ${p.scrapCap}% ଏବଂ ଟ୍ରାମ୍ପ କପର ସୀମା [Cu] ≤ ${p.cuTrampCap}%।\n\n### 3. ଭାଟି ପାଇଁ ନିର୍ଦ୍ଦେଶ\nସ୍କ୍ରାପ୍ କୁ ${p.scrapCap}% ଭିତରେ ସୀମିତ ରଖନ୍ତୁ ଏବଂ କପର କମାଇବା ପାଇଁ ଗ୍ୟାସ-ଆଧାରିତ DRI ବ୍ୟବହାର କରନ୍ତୁ।`,
      };
    case "de":
      return {
        summary: `Tramp-Kupfer-Grenze: Max. ${p.scrapCap}% Schrott für ${p.gradeId}`,
        fullText: `### 1. Physikalisches Prinzip (Analogie)\nWie Heftklammern im Altpapier: Beim Hochgeschwindigkeitsdruck reißt das Papier. In der Edelstahlmetallurgie kann Kupfer im EAF/AOD nicht oxidiert werden. Oberhalb des Grenzwerts segregiert Kupfer an den Korngrenzen und führt zu Heißbrüchigkeit (Rotbruch) beim Warmwalzen.\n\n### 2. Metallurgische Grenzwerte\nFür Sorte ${p.gradeName} (${p.gradeId}) liegt die Schrottobergrenze strikt bei ${p.scrapCap}% und die Kupfergrenze bei [Cu] <= ${p.cuTrampCap}%.\n\n### 3. Schmelzbetriebsempfehlung\nSchrottzugabe auf ${p.scrapCap}% deckeln oder mit kupferarmem Kreislaufschrott und Gas-DRI verdünnen.`,
      };
    case "fr":
      return {
        summary: `Limite Cuivre Tramp : Max. ${p.scrapCap}% de ferraille pour ${p.gradeId}`,
        fullText: `### 1. Principe physique (Analogie)\nComme des agrafes dans du papier recyclé : le papier se déchire lors de l'impression haute vitesse. En métallurgie de l'acier inoxydable, le cuivre ne peut pas être oxydé lors du convertisseur AOD. Au-delà de 0,40% pour le J304, il ségrège aux joints de grains et entraîne des criques catastrophiques au laminage à chaud.\n\n### 2. Limites métallurgiques\nPour la nuance ${p.gradeName} (${p.gradeId}), le plafond de ferraille est fixé à ${p.scrapCap}% et le cuivre résiduel à [Cu] <= ${p.cuTrampCap}%.\n\n### 3. Action pour l'aciérie\nPlafonner la ferraille à ${p.scrapCap}% ou diluer le cuivre avec du DRI propre au gaz naturel.`,
      };
    default:
      return {
        summary: `Tramp Copper Boundary: Max ${p.scrapCap}% scrap on ${p.gradeId}`,
        fullText: `### 1. Physical Principle\nLike using recycled paper: great for circular economy, but if staples get in, paper tears during printing. In stainless metallurgy, copper cannot be oxidized during EAF/AOD refining, causing hot-shortness surface cracking during continuous casting.\n\n### 2. Metallurgical Grounding\nFor Grade ${p.gradeName} (${p.gradeId}), the metallurgical tramp scrap cap is strictly ${p.scrapCap}%. Tramp copper limit is [Cu] <= ${p.cuTrampCap}%.\n\n### 3. Recommendation\nCap scrap charge to ${p.scrapCap}% or blend with low-copper internal revert scrap and Gas DRI.`,
      };
  }
}

export function getMultilingualMoltenFeCr(
  lang: AssistantLanguage,
  p: LocalizedContentParams
): { summary: string; fullText: string } {
  switch (lang) {
    case "hi":
      return {
        summary: "जाजपुर SAF से पिघला FeCr EAF बिजली में ~113 kWh/t की सीधी बचत करता है",
        fullText: `### 1. भौतिक सिद्धांत\nठंडी कड़ाही में मक्खन पिघलाने के बजाय सीधे गर्म पिघला हुआ मक्खन डालना! जाजपुर के SAF से 1600°C पर पिघला हुआ फेरोक्रोम सीधे EAF में डालने से भारी लेटेंट हीट बचती है।\n\n### 2. ऊर्जा बचत आंकड़े\nजाजपुर EAF-2 में पिघले FeCr की हॉट चार्जिंग से ~113 kWh/t बिजली की बचत होती है और टैप-टू-टैप समय में 12 मिनट की कमी आती है।\n\n### 3. भट्ठी संचालन निर्देश\nSAF से EAF के बीच हॉट-लैडल प्रोटोकॉल बनाए रखें ताकि प्रति टन ₹310 की सीधी बिजली बचत प्राप्त हो सके।`,
      };
    case "hn":
      return {
        summary: "Jajpur SAF se molten FeCr ~113 kWh/t arc power save karta hai",
        fullText: `### 1. Physical Principle & Analogy\nCold frying pan me frozen butter melt karne ke badle, direct garam molten butter daalna! Jajpur SAF se 1600°C par molten FeCr seedhe EAF me daalne se ~113 kWh/t arc power bachti hai aur tap-to-tap time fast hota hai.\n\n### 2. Energy & Carbon Metrics\nMolten FeCr hot transfer eliminates solid alloy melting latency, saving ~113 kWh/t SEC and abating ~0.07 tCO2/t.\n\n### 3. Melt Shop Action\nMaintain hot-ladle transfer between Jajpur SAF and EAF-2 to capture ₹310/t electricity cost savings.`,
      };
    case "cg":
      return {
        summary: "जाजपुर SAF ले पिघले FeCr डाले ले ~113 kWh/t बिजली बचथे",
        fullText: `### 1. भौतिक सिद्धांत\nठंढा कड़ाही म जमे घीव पिघलाय के जगह अगर सिधवा खउलत घीव डार देबो, त बिजली अउ समय दुनो बचहि! जाजपुर SAF ले 1600°C म पिघले फेरोक्रोम EAF भट्ठी म डाले ले भारी फायदा होथे।\n\n### 2. बिजली बचत के आंकड़ा\nजाजपुर म पिघले FeCr डाले ले भट्ठी के बिजली खरचा म ~113 kWh/t के कमी आथे अउ ₹310 प्रति टन के बचत होथे।\n\n### 3. भट्ठी बर काम\nSAF ले EAF तक गरम लैडल के सही व्यवस्था राखव ताकि बिजली अउ समय दुनो बचे।`,
      };
    case "bho":
      return {
        summary: "जाजपुर SAF से गरम FeCr डाले से ~113 kWh/t बिजली बची",
        fullText: `### 1. भौतिक सिद्धांत\nजमल घीव कड़ाही में पिघलावे के जगह सीधे गरम पिघलल घीव डालल! जाजपुर SAF से 1600°C पर गरम पिघलल फेरोक्रोम सीधे भट्ठी में डालल जाला त बिजली आ समय दुन्नो बचेला।\n\n### 2. बिजली बचत के हिसाब\nजाजपुर EAF में गरम FeCr डाले से ~113 kWh/t बिजली के बचत होला आ ₹310 प्रति टन के मुनाफा मिलेला।\n\n### 3. भट्ठी खातिर सलाह\nSAF से EAF के बीच गरम लैडल के आवागमन बना के राखीं ताकि बिजली के भारी बचत होखे।`,
      };
    case "od":
      return {
        summary: "ଯାଜପୁର SAF ରୁ ତରଳ FeCr EAF ବିଦ୍ୟୁତରେ ~୧୧୩ kWh/t ସଞ୍ଚୟ କରେ",
        fullText: `### 1. ଭୌତିକ ସିଦ୍ଧାନ୍ତ\nଥଣ୍ଡା କଡ଼ାଇରେ ଘିଅ ତରଳାଇବା ବଦଳରେ ସିଧାସଳଖ ତାତିଲା ତରଳ ଘିଅ ଢାଳିବା ପରି! ଯାଜପୁର SAF ରୁ ୧୬୦୦°C ତାପମାତ୍ରାରେ ତରଳ ଫେରୋକ୍ରୋମ୍ EAF ଭାଟିରେ ଚାର୍ଜ କଲେ ବିଦ୍ୟୁତ ଶକ୍ତିର ବଡ଼ ସଞ୍ଚୟ ହୁଏ।\n\n### 2. ବିଦ୍ୟୁତ ସଞ୍ଚୟ ତଥ୍ୟ\nଯାଜପୁର EAF-2 ରେ ତରଳ FeCr ହଟ୍ ଚାର୍ଜିଂ ଦ୍ୱାରା ~୧୧୩ kWh/t ବିଦ୍ୟୁତ ସଞ୍ଚୟ ହୁଏ ଏବଂ ଟ୍ୟାପ୍ ସମୟ ୧୨ ମିନିଟ୍ କମିଯାଏ।\n\n### 3. ପରିଚାଳନା ନିର୍ଦ୍ଦେଶ\nSAF ରୁ EAF ମଧ୍ୟରେ ହଟ୍-ଲାଡଲ୍ ନିୟମ ପାଳନ କରନ୍ତୁ ଏବଂ ଟନ୍ ପିଛା ପ୍ରାୟ ₹୩୧୦ ବିଦ୍ୟୁତ ଖର୍ଚ୍ଚ ବଞ୍ଚାନ୍ତୁ।`,
      };
    case "de":
      return {
        summary: "Flüssiges FeCr aus Jajpur SAF spart ~113 kWh/t Schmelzstrom",
        fullText: `### 1. Physikalisches Prinzip\nStatt gefrorene Butter in einer kalten Pfanne zu schmelzen, gießt man heiße flüssige Butter hinein. Flüssiges Ferrochrom bei 1600°C direkt aus dem SAF in den EAF einzubringen spart die enorme Schmelzenthalpie.\n\n### 2. Energieeinsparung\nIm Werk Jajpur spart flüssiges FeCr ~113 kWh/t spezifischen Stromverbrauch und verkürzt die Schmelzfolge um 12 Minuten.\n\n### 3. Betriebsempfehlung\nHeißpfannen-Transport zwischen SAF und EAF beibehalten, um Stromkosten um ca. ₹310/t zu senken.`,
      };
    case "fr":
      return {
        summary: "Le FeCr liquide de Jajpur économise ~113 kWh/t au four à arc",
        fullText: `### 1. Principe physique\nAu lieu de faire fondre du beurre dur dans une poêle froide, verser directement du beurre chaud liquide. Charger le ferrochrome liquide à 1600°C directement depuis le four SAF évite la chaleur latente de fusion dans le four EAF.\n\n### 2. Économies d'énergie\nÀ l'usine de Jajpur, le chargement liquide permet d'économiser ~113 kWh/t d'électricité et réduit le temps de coulée de 12 minutes.\n\n### 3. Recommandation\nMaintenir le protocole de poche chaude entre le SAF et l'EAF pour réduire les coûts d'électricité d'environ ₹310/t.`,
      };
    default:
      return {
        summary: "Molten FeCr sensible heat charging saves ~113 kWh/t electrical enthalpy",
        fullText: `### 1. Physical Principle\nInstead of melting cold solid ferrochrome, pouring 1600°C molten ferrochrome directly from the captive SAF bypasses latent heat of fusion in the EAF.\n\n### 2. Energy Metrics\nCaptures ~113 kWh/t thermal credit at Jajpur EAF-2, abating ~0.07 tCO2/t.\n\n### 3. Operational Action\nMaintain hot-ladle transfer between Jajpur SAF and EAF-2 to save ~₹310/t in power costs.`,
      };
  }
}

export function getMultilingualOptimization(
  lang: AssistantLanguage,
  p: LocalizedContentParams
): { summary: string; fullText: string } {
  switch (lang) {
    case "hi":
      return {
        summary: `ग्रेड ${p.gradeName} के लिए अनुशंसित चार्ज: ${p.recScrap}% स्क्रैप, गैस DRI, 70% सौर-पवन ऊर्जा`,
        fullText: `### 🎯 इष्टतम चार्ज रेसिपी: ${p.gradeName} (${p.gradeId})\n\nकम से कम लागत और न्यूनतम कार्बन उत्सर्जन के लिए अनुशंसित पैरामीटर:\n- **स्क्रैप प्रतिशत**: **${p.recScrap}%** (धातु विज्ञान सीमा के भीतर सुरक्षित)\n- **आयरन स्रोत**: **गैस आधारित DRI** (कोयला DRI की तुलना में 37 kWh/t की बचत)\n- **हरित ऊर्जा**: **70% रिन्यूएबल PPA** (Scope 2 उत्सर्जन में भारी कमी)\n- **जाजपुर SAF**: **हॉट चार्जिंग सक्षम** (~113 kWh/t बिजली बचत)\n\nनीचे दिए गए बटन पर क्लिक करके इन सेटिंग्स को सीधे कॉकपिट स्लाइडर्स पर लागू करें!`,
      };
    case "hn":
      return {
        summary: `Optimal charge recipe for ${p.gradeName}: ${p.recScrap}% scrap, Gas DRI, 70% RE PPA`,
        fullText: `### 🎯 Optimal Charge Recipe: ${p.gradeName} (${p.gradeId})\n\nLeast cost aur least carbon footprint achieve karne ke liye recommended settings:\n- **Scrap Ratio**: **${p.recScrap}%** (Chemistry limits ke andar fully compliant)\n- **Virgin Iron**: **Gas DRI** (Eliminates coal gangue and saves ~37 kWh/t)\n- **Green Power**: **70% Renewable PPA** (Drastically cuts Scope 2 emissions)\n- **Molten FeCr**: **Enabled** (~113 kWh/t thermal credit at Jajpur)\n\nClick below to apply these optimized setpoints directly to your cockpit sliders!`,
      };
    case "cg":
      return {
        summary: `ग्रेड ${p.gradeName} बर बढ़िया नुस्खा: ${p.recScrap}% स्क्रैप, गैस DRI, 70% ग्रीन पावर`,
        fullText: `### 🎯 भट्ठी बर सबले बढ़िया नुस्खा: ${p.gradeName} (${p.gradeId})\n\nखरचा अउ कार्बन दुनो कम करे बर ये सेटिंग्स लगावव:\n- **स्क्रैप**: **${p.recScrap}%** (धातु विज्ञान सीमा के भीतर एकदम्मे सुरक्षित)\n- **कच्चा लोहा**: **गैस आधारित DRI** (कोयला DRI ले 37 kWh/t बिजली बचहि)\n- **हरियर बिजली**: **70% सौर-पवन ऊर्जा** (Scope 2 कार्बन घट जाहि)\n- **पिघले FeCr**: **चालू राखव** (~113 kWh/t बिजली बचत जाजपुर म)\n\nसंगी, नीचे के बटन दबा के ये सब मान ल कॉकपिट म सेट कर सकथस!`,
      };
    case "bho":
      return {
        summary: `ग्रेड ${p.gradeName} खातिर सबसे बढ़ियां नुस्खा: ${p.recScrap}% स्क्रैप, गैस DRI, 70% ग्रीन बिजली`,
        fullText: `### 🎯 सबसे बढ़ियां चार्ज नुस्खा: ${p.gradeName} (${p.gradeId})\n\nखर्चा आ कार्बन दुन्नो घटावे खातिर अनुशंसित सेटिंग्स:\n- **स्क्रैप**: **${p.recScrap}%** (केमिकल सीमा में पूरा सुरक्षित)\n- **कच्चा लोहा**: **गैस DRI** (कोयला DRI से 37 kWh/t बिजली के बचत)\n- **हरियर बिजली**: **70% रिन्यूएबल PPA** (कार्बन में भारी कमी)\n- **गरम FeCr**: **चालू राखीं** (~113 kWh/t बिजली बचत जाजपुर में)\n\nमालिक, नीचे दिहल बटन दबा के एह सेटिंग के तुरंत भट्ठी पर लागू करीं!`,
      };
    case "od":
      return {
        summary: `ଗ୍ରେଡ୍ ${p.gradeName} ପାଇଁ ସର୍ବୋତ୍ତମ ଚାର୍ଜ: ${p.recScrap}% ସ୍କ୍ରାପ୍, ଗ୍ୟାସ DRI, ୭୦% ଅକ୍ଷୟ ଶକ୍ତି`,
        fullText: `### 🎯 ସର୍ବୋତ୍ତମ ଚାର୍ଜ ରେସିପି: ${p.gradeName} (${p.gradeId})\n\nସର୍ବନିମ୍ନ ଖର୍ଚ୍ଚ ଏବଂ ସର୍ବନିମ୍ନ କାର୍ବନ ପାଇଁ ଅନୁମୋଦିତ ସେଟିଙ୍ଗ୍:\n- **ସ୍କ୍ରାପ୍ ପରିମାଣ**: **${p.recScrap}%** (ରାସାୟନିକ ସୀମା ଭିତରେ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ)\n- **ଲୁହା ଉତ୍ସ**: **ଗ୍ୟାସ-ଆଧାରିତ DRI** (କୋଇଲା DRI ଠାରୁ ୩୭ kWh/t ବିଦ୍ୟୁତ ସଞ୍ଚୟ)\n- **ଅକ୍ଷୟ ଶକ୍ତି**: **୭୦% PPA** (Scope 2 କାର୍ବନ ନିର୍ଗମନ କମାଇଥାଏ)\n- **ତରଳ FeCr**: **ସକ୍ଷମ ରଖନ୍ତୁ** (ଯାଜପୁର ପ୍ଲାଣ୍ଟରେ ~୧୧୩ kWh/t ସଞ୍ଚୟ)\n\nତଳେ ଥିବା ବଟନ୍ ଦବାଇ ଏହି ମାନଗୁଡ଼ିକୁ ସିଧାସଳଖ କକପିଟ୍ ସ୍ଲାଇଡର୍ସରେ ପ୍ରୟୋଗ କରନ୍ତୁ!`,
      };
    case "de":
      return {
        summary: `Optimiertes Rezept für ${p.gradeName}: ${p.recScrap}% Schrott, Gas-DRI, 70% Grünstrom`,
        fullText: `### 🎯 Optimiertes Chargenrezept: ${p.gradeName} (${p.gradeId})\n\nEmpfohlene Prozessparameter für minimale Kosten und minimale CO2-Zölle:\n- **Schrottrate**: **${p.recScrap}%** (vollständig konform mit ASTM-Grenzstrukturen)\n- **Eisenträger**: **Gas-DRI** (spart ~37 kWh/t Enthalpie gegenüber Kohle-DRI)\n- **Ökostrom-Anteil**: **70% PPA** (senkt Scope-2-Emissionen signifikant)\n- **Flüssiges FeCr**: **Aktiviert** (~113 kWh/t thermischer Vorteil in Jajpur)\n\nKlicken Sie unten, um diese Parameter direkt auf die Schieberegler des Cockpits anzuwenden!`,
      };
    case "fr":
      return {
        summary: `Recette optimale pour ${p.gradeName} : ${p.recScrap}% de ferraille, DRI gaz, 70% EnR`,
        fullText: `### 🎯 Recette de charge optimisée : ${p.gradeName} (${p.gradeId})\n\nParamètres recommandés pour minimiser le coût et l'empreinte carbone :\n- **Taux de ferraille** : **${p.recScrap}%** (sécurisé sous le plafond métallurgique)\n- **Minerai de fer pré-réduit** : **DRI au gaz** (économise ~37 kWh/t face au DRI charbon)\n- **Électricité verte** : **70% PPA renouvelable** (réduction drastique du Scope 2)\n- **FeCr liquide** : **Activé** (~113 kWh/t de crédit thermique à Jajpur)\n\nCliquez ci-dessous pour appliquer ces consignes directement aux curseurs du cockpit !`,
      };
    default:
      return {
        summary: `Optimal charge recipe for ${p.gradeName}: ${p.recScrap}% scrap, Gas DRI, 70% RE PPA`,
        fullText: `### 🎯 Optimal Charge Recipe: ${p.gradeName} (${p.gradeId})\n\nRecommended setpoints for least-cost and least-carbon operation:\n- **Scrap Ratio**: **${p.recScrap}%** (metallurgically verified within ASTM limits)\n- **Virgin Fe**: **Gas DRI** (saves ~37 kWh/t enthalpy over coal DRI)\n- **Green Power**: **70% Renewable PPA** (mitigates Scope 2 emissions)\n- **Molten FeCr**: **Enabled** (~113 kWh/t thermal credit at Jajpur)\n\nClick below to apply these recommended parameters directly to the cockpit sliders!`,
      };
  }
}
