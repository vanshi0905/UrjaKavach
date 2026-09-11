"""
Neural Voice Streaming Service for JSL Interactive Voice Agent.
Utilizes edge-tts (100% open source, zero paid APIs) to stream high-fidelity
neural audio with Indian English process engineer personas (en-IN-PrabhatNeural / en-IN-NeerjaNeural).
Includes metallurgical text preprocessor for natural industrial speech cadence.
"""

import re
import asyncio
from typing import AsyncGenerator, Dict, List
import edge_tts

DEFAULT_VOICE = "en-IN-PrabhatNeural"

AVAILABLE_VOICES: Dict[str, Dict[str, str]] = {
    "en-IN-PrabhatNeural": {
        "name": "Prabhat (Indian English - Male Process Engineer)",
        "locale": "en-IN",
        "gender": "Male",
    },
    "en-IN-NeerjaNeural": {
        "name": "Neerja (Indian English - Female Metallurgist)",
        "locale": "en-IN",
        "gender": "Female",
    },
    "en-US-JennyNeural": {
        "name": "Jenny (US English - Technical Specialist)",
        "locale": "en-US",
        "gender": "Female",
    },
    "en-GB-RyanNeural": {
        "name": "Ryan (UK English - Industrial Consultant)",
        "locale": "en-GB",
        "gender": "Male",
    },
    "hi-IN-MadhurNeural": {
        "name": "Madhur (Hindi - Process Specialist)",
        "locale": "hi-IN",
        "gender": "Male",
    },
}


class MetallurgicalSpokenNormalizer:
    """
    Normalizes complex pyrometallurgical, thermodynamic, financial,
    and mathematical expressions into natural spoken English for neural TTS.
    """

    @classmethod
    def strip_action_tokens(cls, text: str) -> str:
        """Strip raw action tokens completely: <<<ACTION:[^>]+>>> -> ''."""
        if not text:
            return ""
        return re.sub(r"<<<ACTION:[^>]+>>>", "", text)

    @classmethod
    def strip_markdown_tables(cls, text: str) -> str:
        """Strip markdown tables: both full lines and inline pipe-delimited segments."""
        if not text:
            return ""
        # Remove full lines that are markdown table rows or separators
        lines = text.split("\n")
        filtered = [
            line for line in lines
            if not (line.strip().startswith("|") and line.strip().endswith("|"))
        ]
        t = "\n".join(filtered)
        # Also strip any surviving inline pipe-table segments (e.g. embedded \n as literal)
        t = re.sub(r"\|[^\n]*\|", "", t)
        # Strip leftover separator lines: |---|---|
        t = re.sub(r"\|[-\s|]+\|", "", t)
        return t

    @classmethod
    def normalize_formulas_and_latex(cls, text: str) -> str:
        """
        Converts pyrometallurgical LaTeX formulas, Greek thermochemical variables,
        and mathematical operators into natural phonetic spoken English.
        """
        if not text:
            return ""
        t = text

        # Step 0: Pre-clean LaTeX font wrappers, degree superscripts, and bracketed indices
        for _ in range(2):
            t = re.sub(r"\\(?:mathrm|text|mathbf|mathit)\{([^{}]+)\}", r"\1", t)
        t = re.sub(r"\^\{?\\?circ\}?", " degrees ", t)
        t = re.sub(r"\\circ\b", " degrees ", t)
        t = re.sub(r"_\{([^{}]+)\}", r"_\1", t)

        # 1. High-Cr Phosphorus Non-Removal Thermochemistry:
        # $\eta_{\mathrm{P}} = 0.99$, \eta_{\mathrm{P}} = 0.99, η_P = 0.99, eta_P = 0.99
        t = re.sub(
            r"\$?\\?(?:eta|η)(?:_P)?\s*=\s*0\.99\$?",
            "phosphorus recovery efficiency of 99 percent",
            t,
            flags=re.IGNORECASE,
        )

        # 2. Ellingham Free Energy / Chemical Potential Inequality:
        # $\Delta G^\circ(\mathrm{Cr}_2\mathrm{O}_3) \ll \Delta G^\circ(\mathrm{P}_2\mathrm{O}_5)$
        t = re.sub(
            r"\$?\\?(?:Delta|Δ)\s*G\s*(?:degrees|°)?\s*\(\s*Cr_?2\s*O_?3\s*\)\s*(?:\\ll|<<|≪|\u226a)\s*\\?(?:Delta|Δ)\s*G\s*(?:degrees|°)?\s*\(\s*P_?2\s*O_?5\s*\)\$?",
            "chromium oxidizes at vastly lower chemical potential than phosphorus",
            t,
            flags=re.IGNORECASE,
        )
        t = re.sub(
            r"\$?(?:ΔG°|Delta\s*G\s*(?:degrees|°)?|ΔG)\s*\(\s*Cr_?2\s*O_?3\s*\)\s*(?:<<|\\ll|≪|\u226a)\s*(?:ΔG°|Delta\s*G\s*(?:degrees|°)?|ΔG)\s*\(\s*P_?2\s*O_?5\s*\)\$?",
            "chromium oxidizes at vastly lower chemical potential than phosphorus",
            t,
            flags=re.IGNORECASE,
        )

        # 3. Dual Shadow Prices and Scrap Ceiling
        # $\pi_t$, \pi_t, π_t
        t = re.sub(r"\$?\\?(?:pi|π)_\{?t\}?\$?", "dual shadow price", t)
        # $\mu_{\mathrm{scrap}}$, \mu_{scrap}, μ_scrap
        t = re.sub(r"\$?\\?(?:mu|μ)_\{?\\?(?:mathrm\{)?scrap\}?\}?\$?", "scrap ceiling shadow price", t, flags=re.IGNORECASE)
        # $\mathrm{ViU}_j$, ViU_j, ViU
        t = re.sub(r"\$?\\?(?:mathrm\{)?ViU\}?_\{?[a-zA-Z0-9]+\}?\$?", "Value-in-Use", t)
        t = re.sub(r"\bViU\b", "Value-in-Use", t)

        # 4. Pyrometallurgical Greek Recovery and Enthalpy Variables
        # \eta_{Cr}, \eta_{\mathrm{Cr}}, η_Cr
        t = re.sub(r"\\?(?:eta|η)_\{?\\?(?:mathrm\{)?Cr\}?\}?", "chromium recovery efficiency", t)
        # \eta_{thermal}, \eta_{\mathrm{thermal}}, η_thermal
        t = re.sub(r"\\?(?:eta|η)_\{?\\?(?:mathrm\{)?thermal\}?\}?", "furnace thermal efficiency", t)
        # \eta_{Si}, \eta_{\mathrm{Si}}, η_Si
        t = re.sub(r"\\?(?:eta|η)_\{?\\?(?:mathrm\{)?Si\}?\}?", "silicon reduction efficiency", t)
        # \eta_{transfer}
        t = re.sub(r"\\?(?:eta|η)_\{?\\?(?:mathrm\{)?transfer\}?\}?", "ladle transfer thermal efficiency", t)
        # \Delta h_{sensible}, \Delta h_{\mathrm{sensible}}, Δh_sensible
        t = re.sub(r"\\?(?:Delta|Δ)\s*h_\{?\\?(?:mathrm\{)?sensible\}?\}?", "molten ferro-chrome sensible heat credit", t)
        # \Delta SEC, ΔSEC
        t = re.sub(r"\\?(?:Delta|Δ)\s*SEC\b", "electrical energy reduction", t)
        # \gamma_j, γ_j
        t = re.sub(r"\\?(?:gamma|γ)_\{?[a-zA-Z0-9]+\}?", "metallic yield factor", t)
        # \phi_{scrap}, \phi_{\mathrm{scrap}}, ϕ_scrap
        t = re.sub(r"\\?(?:phi|ϕ)_\{?\\?(?:mathrm\{)?scrap\}?\}?", "scrap charge share", t, flags=re.IGNORECASE)

        # 5. LaTeX Structural Syntax Stripping
        # Fractions: \frac{a}{b} -> a over b
        t = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"\1 over \2", t)
        # Degrees: \circ
        t = re.sub(r"\^?\\circ", " degrees ", t)
        # Relations and operators
        t = re.sub(r"\\ll\b|≪|\u226a", " vastly less than ", t)
        t = re.sub(r"\\gg\b|≫|\u226b", " vastly greater than ", t)
        t = re.sub(r"\\leq?\b|\\le\b|≤|\u2264", " less than or equal to ", t)
        t = re.sub(r"\\geq?\b|\\ge\b|≥|\u2265", " greater than or equal to ", t)
        t = re.sub(r"\\approx\b", " approximately ", t)
        t = re.sub(r"\\times\b", " times ", t)
        t = re.sub(r"\\pm\b", " plus or minus ", t)
        t = re.sub(r"\\rightarrow\b|\\to\b", " yields ", t)
        # Font wrappers: \mathrm{...}, \text{...}, \mathbf{...}, \mathit{...}
        t = re.sub(r"\\mathrm\{([^{}]+)\}", r"\1", t)
        t = re.sub(r"\\text\{([^{}]+)\}", r"\1", t)
        t = re.sub(r"\\mathbf\{([^{}]+)\}", r"\1", t)
        t = re.sub(r"\\mathit\{([^{}]+)\}", r"\1", t)

        # Isolated Greek symbols
        t = re.sub(r"\\alpha\b|α", "alpha ", t)
        t = re.sub(r"\\beta\b|β", "beta ", t)
        t = re.sub(r"\\Delta\b|Δ", "delta ", t)
        t = re.sub(r"\\eta\b|η", "eta ", t)
        t = re.sub(r"\\mu\b|μ", "mu ", t)
        t = re.sub(r"\\pi\b|π", "pi ", t)
        t = re.sub(r"\\phi\b|ϕ", "phi ", t)
        t = re.sub(r"\\gamma\b|γ", "gamma ", t)

        # Strip math mode delimiters ($) and braces
        t = re.sub(r"\$([^$]*)\$", r"\1", t)
        t = t.replace("$", "")
        t = re.sub(r"[{}]", "", t)

        return t

    @classmethod
    def normalize_compounds_and_terms(cls, text: str) -> str:
        """Translates chemical formulas and pyrometallurgical abbreviations."""
        if not text:
            return ""
        t = text

        t = re.sub(r"\bCr2O3\b", " chromium oxide ", t)
        t = re.sub(r"\bP2O5\b", " phosphorus pentoxide ", t)
        t = re.sub(r"\bSiO2\b", " silica ", t)
        t = re.sub(r"\bAl2O3\b", " alumina ", t)
        t = re.sub(r"\bFeO\b", " iron oxide ", t)
        t = re.sub(r"\bCaO\b", " calcium oxide ", t)
        t = re.sub(r"\bFeCr\b", " ferro-chrome ", t)
        t = re.sub(r"\bFeNi\b", " ferro-nickel ", t)
        t = re.sub(r"\bFeSi\b", " ferro-silicon ", t)
        t = re.sub(r"\bFeMo\b", " ferro-moly ", t)
        t = re.sub(r"\bFeMn\b", " ferro-manganese ", t)
        t = re.sub(r"\bNPI\b", " nickel pig iron ", t)
        t = re.sub(r"\bDRI\b", " D R I ", t)
        t = re.sub(r"\bEAF\b", " E A F ", t)
        t = re.sub(r"\bAOD\b", " A O D ", t)
        t = re.sub(r"\bSAF\b", " S A F ", t)
        t = re.sub(r"\bCBAM\b", " C-BAM ", t)
        t = re.sub(r"\bCCTS\b", " C C T S ", t)
        t = re.sub(r"\bBEE\b", " B E E ", t)
        t = re.sub(r"\bPREN\b", " P-ren ", t)
        t = re.sub(r"\bSEFA\b", " Specific Embedded Free Allocation ", t)
        t = re.sub(r"\bSEI\b", " Specific Emission Intensity ", t)
        t = re.sub(r"\bSEC\b", " S E C ", t)
        t = re.sub(r"\bPPA\b", " P P A ", t)

        # Tramp elements in brackets
        t = re.sub(r"\[Cu\]\s*(?:<=|less than or equal to)\s*", "tramp copper under ", t)
        t = re.sub(r"\[Cu\]", "tramp copper", t)
        t = re.sub(r"\[Sn\]", "tramp tin", t)
        t = re.sub(r"\[P\]", "bath phosphorus", t)

        return t

    @classmethod
    def normalize_units_and_currency(cls, text: str) -> str:
        """Translates units, currency symbols, and mathematical comparison operators."""
        if not text:
            return ""
        t = text

        # Crude steel unit: tCO2e/tcs (while keeping tCO2e/t, tCO2/t)
        t = re.sub(r"\btCO[2₂]e/tcs\b", " tonnes of CO2 equivalent per tonne of crude steel ", t)
        t = re.sub(r"tCO2e/tcs", " tonnes of CO2 equivalent per tonne of crude steel ", t)

        # General emissions units
        t = re.sub(r"tCO2e/t", " tonnes of C O 2 equivalent per tonne ", t)
        t = re.sub(r"tCO2/t", " tonnes of C O 2 per tonne ", t)
        t = re.sub(r"tCO2e\b", " tonnes of C O 2 equivalent ", t)
        t = re.sub(r"tCO2\b", " tonnes of C O 2 ", t)

        # Energy and financial units
        t = re.sub(r"kWh/t", " kilowatt hours per tonne ", t)
        t = re.sub(r"GJ/t", " gigajoules per tonne ", t)
        t = re.sub(r"Cr/yr", " crore rupees per year ", t)
        t = re.sub(r"\bwt%\b|\bwt\s*%\b", " weight percent ", t)
        t = re.sub(r"\bppm\b", " parts per million ", t)
        t = re.sub(r"/t\b", " per tonne ", t)
        t = re.sub(r"kg/t\b", " kilograms per tonne ", t)

        # Currencies: ₹, €, $
        t = re.sub(r"₹\s*([0-9,.]+)", r"\1 rupees ", t)
        t = re.sub(r"€\s*([0-9,.]+)", r"\1 euros ", t)
        t = re.sub(r"\$\s*([0-9,.]+)", r"\1 dollars ", t)
        t = re.sub(r"₹", " rupees ", t)
        t = re.sub(r"€", " euros ", t)

        # Temperatures and symbols
        t = re.sub(r"1600°C", "1600 degrees Celsius", t)
        t = re.sub(r"°C", " degrees Celsius", t)
        t = re.sub(r"~", "approximately ", t)
        t = re.sub(r"%", " percent ", t)
        t = re.sub(r"\+", " plus ", t)
        t = re.sub(r"(?:>=|≥|\u2265)", " greater than or equal to ", t)
        t = re.sub(r"(?:<=|≤|\u2264)", " less than or equal to ", t)
        t = re.sub(r">", " greater than ", t)
        t = re.sub(r"<", " less than ", t)
        t = re.sub(r"(\w+)/(\w+)", r"\1 and \2", t)

        return t

    @classmethod
    def normalize(cls, text: str) -> str:
        """Full pipeline normalization."""
        if not text or not isinstance(text, str) or not text.strip():
            return ""
        t = text

        # Step 1: Strip raw action tokens
        t = cls.strip_action_tokens(t)

        # Step 2: Strip markdown tables
        t = cls.strip_markdown_tables(t)

        # Step 3: Markdown syntax stripping
        t = re.sub(r"^\s*[-=_]{3,}\s*$", "", t, flags=re.MULTILINE)
        t = re.sub(r"^\s*>\s*", "", t, flags=re.MULTILINE)
        t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
        t = re.sub(r"###\s*\d*\.?\s*", "", t)
        t = re.sub(r"##\s*", "", t)
        t = re.sub(r"#\s*", "", t)
        t = re.sub(r"\*\*([^*]+)\*\*", r"\1", t)
        t = re.sub(r"\*([^*]+)\*", r"\1", t)
        t = re.sub(r"^\s*[-*]\s+", "", t, flags=re.MULTILINE)
        t = re.sub(r"^\s*\d+\.\s+", "", t, flags=re.MULTILINE)

        # Step 4: Normalizations
        t = cls.normalize_formulas_and_latex(t)
        t = cls.normalize_compounds_and_terms(t)
        t = cls.normalize_units_and_currency(t)

        # Step 5: Clean spacing and punctuation
        t = re.sub(r"\n+", ". ", t)
        t = re.sub(r"\s+", " ", t).strip()
        t = re.sub(r"\s+([.,;:!?])", r"\1", t)
        t = re.sub(r"\.{2,}", ".", t)

        if not re.sub(r"[.\s\-_=+]+", "", t):
            return ""

        return t


def clean_text_for_speech(text: str) -> str:
    """
    Cleans markdown formatting and translates technical industrial units,
    mathematical formulas, Greek variables, and chemical terms into natural spoken English.
    Delegates to MetallurgicalSpokenNormalizer.
    """
    return MetallurgicalSpokenNormalizer.normalize(text)


async def stream_speech_audio(
    text: str,
    voice: str = DEFAULT_VOICE,
    rate: str = "+0%",
    pitch: str = "+0Hz",
) -> AsyncGenerator[bytes, None]:
    """
    Streams raw MP3 audio chunks asynchronously from edge-tts.
    Allows immediate early cancellation if the client interrupts (barge-in).
    """
    cleaned_text = clean_text_for_speech(text)
    if not cleaned_text:
        return

    selected_voice = voice if voice in AVAILABLE_VOICES else DEFAULT_VOICE
    communicate = edge_tts.Communicate(cleaned_text, voice=selected_voice, rate=rate, pitch=pitch)

    async for chunk in communicate.stream():
        # Edge-tts sends both audio chunks and word-boundary metadata
        if chunk["type"] == "audio":
            yield chunk["data"]
            # Brief yield to asyncio event loop to allow immediate cancellation on barge-in
            await asyncio.sleep(0.001)


async def synthesize_speech_bytes(
    text: str,
    voice: str = DEFAULT_VOICE,
    rate: str = "+0%",
) -> bytes:
    """
    Synthesizes complete MP3 audio bytes for direct HTTP download/streaming.
    """
    audio_parts = []
    async for chunk in stream_speech_audio(text, voice=voice, rate=rate):
        audio_parts.append(chunk)
    return b"".join(audio_parts)
