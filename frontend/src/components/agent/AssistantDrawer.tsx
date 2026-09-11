"use client";

import { useState, useEffect, useRef } from "react";
import { CalculatorInputs } from "@/lib/calculator";
import { computeClientShapley, MultiTargetShapReport } from "@/lib/shap-client";
import {
  generateClientExplanation,
  answerClientConversationalQuery,
  ExplanationResponse,
} from "@/lib/agent-nlg";
import { VoiceAgentClient, VoiceState } from "@/lib/voice-agent";
import { VoiceOrb } from "./VoiceOrb";
import { ShapWaterfallChart } from "./ShapWaterfallChart";
import {
  OPEN_ASSISTANT_EVENT,
  SYNC_ASSISTANT_INPUTS_EVENT,
  OpenAssistantDetail,
  dispatchApplyCockpitParams,
} from "./InlineExplainButton";
import {
  MessageSquare,
  Mic,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronRight,
  Bot,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  explanation?: ExplanationResponse;
  shapReport?: MultiTargetShapReport;
  actionPayload?: Partial<CalculatorInputs> | null;
  timestamp: string;
  isTargetExplain?: boolean;
}

export function parseActionPayload(
  text?: string,
  explanation?: ExplanationResponse
): Partial<CalculatorInputs> | null {
  if (explanation?.actionPayload) {
    return explanation.actionPayload;
  }
  const source = `${text || ""} ${explanation?.fullText || ""}`;
  const match = source.match(/<<<ACTION:APPLY_COCKPIT_PRESET:([\s\S]*?)>>>/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export function cleanDisplayText(text?: string): string {
  if (!text) return "";
  return text.replace(/<<<ACTION:APPLY_COCKPIT_PRESET:[\s\S]*?>>>/g, "").trim();
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-steel-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="px-1 py-0.5 rounded bg-steel-800 text-thermal-300 font-mono text-[10px]">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function FormattedMarkdown({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs text-steel-200 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-0.5" />;
        }

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-xs font-bold text-thermal-300 mt-2.5 mb-1 flex items-center gap-1.5">
              {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-sm font-bold text-white mt-3 mb-1 text-thermal-400">
              {renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        // Bullet lists
        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-thermal-400 shrink-0 font-bold">•</span>
              <span className="text-steel-300 leading-relaxed">
                {renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}
              </span>
            </div>
          );
        }

        // Numbered lists
        if (/^\d+\.\s+/.test(trimmed)) {
          const num = trimmed.match(/^\d+\./)?.[0];
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-cyanPulse-400 shrink-0 font-mono font-bold text-[11px]">{num}</span>
              <span className="text-steel-300 leading-relaxed">
                {renderInlineMarkdown(trimmed.replace(/^\d+\.\s+/, ""))}
              </span>
            </div>
          );
        }

        // Table divider
        if (/^\|[-| :]+\|$/.test(trimmed)) {
          return null;
        }

        // Table rows
        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
          return (
            <div key={idx} className="grid grid-cols-3 gap-2 p-1.5 rounded bg-obsidian-950/70 border border-steel-800 text-[10px] my-1 font-mono">
              {cells.map((cell, cIdx) => (
                <span key={cIdx} className={cIdx === 0 ? "font-bold text-steel-200" : "text-steel-400"}>
                  {renderInlineMarkdown(cell)}
                </span>
              ))}
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed text-steel-300">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}


const DEFAULT_INPUTS: CalculatorInputs = {
  gradeId: "J304",
  scrapPct: 60,
  facilityId: "jajpur",
  feSource: "coalDRI",
  fecrSource: "fecrStandard",
  niSource: "niStandard",
  refiningRoute: "aod",
  castingRoute: "continuous",
  product: "crCoil",
  renewablePct: 47,
  hotFecrCharging: true,
};

const SUGGESTED_QUERIES = [
  "Why is my energy consumption so high with coal DRI?",
  "What is tramp copper and why is scrap capped?",
  "How does molten FeCr hot charging help?",
  "What is our EU CBAM tariff exposure for Europe?",
  "How does India CCTS generate EBITDA surplus?",
];

export function AssistantDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat");
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Voice Agent State
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("en-IN-PrabhatNeural");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const voiceAgentRef = useRef<VoiceAgentClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Voice Client
  useEffect(() => {
    const client = new VoiceAgentClient(inputs, {
      voice: selectedVoice,
      onStateChange: (state) => setVoiceState(state),
      onTranscript: (text) => setTranscript(text),
      onAudioLevel: (lvl) => setAudioLevel(lvl),
      onResponse: (resp) => {
        handleIncomingAgentResponse(resp);
      },
      onError: (err) => {
        console.warn("Voice agent error:", err);
      },
    });

    voiceAgentRef.current = client;

    // Check backend health
    fetch("http://localhost:8000/api/agent/voices")
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => {
        setIsBackendConnected(false);
      });

    return () => {
      client.destroy();
    };
  }, []);

  // Update voice agent inputs when changed
  useEffect(() => {
    if (voiceAgentRef.current) {
      voiceAgentRef.current.updateInputs(inputs);
    }
  }, [inputs]);

  // Update voice agent persona when selectedVoice changes
  useEffect(() => {
    if (voiceAgentRef.current) {
      voiceAgentRef.current.setVoice(selectedVoice);
    }
  }, [selectedVoice]);

  // Listen for global open and sync events from InlineExplainButton and cockpit pages
  useEffect(() => {
    const handleOpen = (e: any) => {
      const detail: OpenAssistantDetail = e.detail || {};
      setIsOpen(true);
      const targetTab = detail.tab || (detail as any).mode;
      if (targetTab === "chat" || targetTab === "voice") {
        setActiveTab(targetTab);
      }

      const activeInputs = detail.inputs || inputs;
      if (detail.inputs) {
        setInputs(detail.inputs);
      }

      if (targetTab === "voice") {
        if (detail.query) {
          setTranscript(detail.query);
          const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: "user",
            text: detail.query,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, userMsg]);
          if (voiceAgentRef.current) {
            voiceAgentRef.current.processUserQuery(detail.query);
          }
        }
      } else {
        if (detail.query) {
          handleSendQuery(detail.query, activeInputs);
        } else if (detail.target) {
          handleExplainTarget(detail.target, activeInputs);
        }
      }
    };

    const handleSync = (e: any) => {
      if (e.detail?.inputs) {
        setInputs(e.detail.inputs);
      }
    };

    window.addEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
    window.addEventListener(SYNC_ASSISTANT_INPUTS_EVENT, handleSync);
    return () => {
      window.removeEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
      window.removeEventListener(SYNC_ASSISTANT_INPUTS_EVENT, handleSync);
    };
  }, [inputs]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleApplyCockpitPreset = (preset: Partial<CalculatorInputs>) => {
    dispatchApplyCockpitParams(preset);
    setInputs((prev) => ({ ...prev, ...preset }));
    if (voiceAgentRef.current) {
      voiceAgentRef.current.updateInputs({ ...inputs, ...preset });
    }
  };

  const handleIncomingAgentResponse = (resp: ExplanationResponse) => {
    const shapReport = computeClientShapley(inputs);
    const actionPayload = parseActionPayload(resp.fullText || resp.summary, resp);
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "assistant",
      text: resp.fullText || resp.summary,
      explanation: resp,
      shapReport,
      actionPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isTargetExplain: false,
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  const handleExplainTarget = async (target: string, overrideInputs?: CalculatorInputs) => {
    const activeInputs = overrideInputs || inputs;
    setIsProcessing(true);
    try {
      // Try backend first
      let resp: ExplanationResponse;
      try {
        const res = await fetch("http://localhost:8000/api/agent/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target, params: activeInputs }),
        });
        if (res.ok) {
          const data = await res.json();
          resp = {
            target: data.target || target,
            targetName: data.target_name || data.title || target,
            title: data.title || data.summary || `${target} Attribution`,
            topic: data.topic || target,
            summary: data.summary || "",
            metaphor: data.metaphor || "",
            metrics: data.metrics || "",
            action: data.action || "",
            fullText: data.full_text || "",
            shap: data.shap,
            actionPayload: data.action_payload || data.actionPayload,
            isConversational: false,
          };
        } else {
          throw new Error("Backend offline");
        }
      } catch (e) {
        resp = generateClientExplanation(target, activeInputs);
      }

      const shapReport = computeClientShapley(activeInputs);
      const actionPayload = parseActionPayload(resp.fullText || resp.summary, resp);
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "assistant",
        text: resp.fullText || resp.summary,
        explanation: resp,
        shapReport,
        actionPayload,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isTargetExplain: true,
      };

      setMessages((prev) => [...prev, newMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendQuery = async (queryText?: string, overrideInputs?: CalculatorInputs) => {
    const activeInputs = overrideInputs || inputs;
    const text = queryText || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);

    try {
      let resp: ExplanationResponse;
      try {
        const res = await fetch("http://localhost:8000/api/agent/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text, params: activeInputs }),
        });
        if (res.ok) {
          const data = await res.json();
          resp = {
            target: data.target || "total_co2_t",
            targetName: data.target_name || data.title || "Process Query",
            title: data.title || "Metallurgical Intelligence",
            topic: data.topic || "general",
            summary: data.summary || "",
            metaphor: data.metaphor || "",
            metrics: data.metrics || "",
            action: data.action || "",
            fullText: data.full_text || "",
            shap: data.shap,
            actionPayload: data.action_payload || data.actionPayload,
            isConversational: data.is_conversational ?? true,
          };
        } else {
          throw new Error("Backend offline");
        }
      } catch (e) {
        resp = answerClientConversationalQuery(text, activeInputs);
      }

      const shapReport = computeClientShapley(activeInputs);
      const actionPayload = parseActionPayload(resp.fullText || resp.summary, resp);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: resp.fullText || resp.summary,
        explanation: resp,
        shapReport,
        actionPayload,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isTargetExplain: false,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-thermal-600 via-thermal-500 to-amber-500 text-white font-semibold text-xs shadow-2xl shadow-thermal-500/40 hover:scale-105 active:scale-95 transition-all border border-thermal-400/50 group"
          title="Open JSL AI Metallurgical Assistant & Voice Agent"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-white animate-spin" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyanPulse-400 animate-ping"></span>
          </div>
          <span className="tracking-wide">SCADA AI Copilot</span>
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div
            className="w-full max-w-2xl h-full bg-obsidian-950 border-l border-steel-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-steel-800 flex items-center justify-between bg-obsidian-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-thermal-500/20 border border-thermal-500/40 text-thermal-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      JSL Process AI Copilot & Voice Agent
                    </h3>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                        isBackendConnected
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-cyanPulse-500/10 text-cyanPulse-400 border-cyanPulse-500/30"
                      }`}
                    >
                      {isBackendConnected ? "Mode 1: Neural WebSocket" : "Mode 2: Serverless Edge"}
                    </span>
                  </div>
                  <p className="text-[11px] text-steel-400">
                    Exact Multi-Target SHAP & ELI-Engineer Pedagogical Explanations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-steel-400 hover:text-white hover:bg-steel-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-steel-800 bg-obsidian-950 px-4 pt-2 gap-2">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 py-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "chat"
                    ? "border-thermal-500 text-white"
                    : "border-transparent text-steel-400 hover:text-steel-200"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>SCADA Text Chat & SHAP</span>
              </button>
              <button
                onClick={() => setActiveTab("voice")}
                className={`flex items-center gap-2 py-2 px-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === "voice"
                    ? "border-cyanPulse-500 text-white"
                    : "border-transparent text-steel-400 hover:text-steel-200"
                }`}
              >
                <Mic className="w-4 h-4 text-cyanPulse-400" />
                <span>Interactive Voice Agent</span>
              </button>
            </div>

            {/* TAB 1: SCADA TEXT CHAT & SHAP */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="p-4 rounded-full bg-thermal-500/10 border border-thermal-500/30 text-thermal-400">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="max-w-md space-y-1">
                        <h4 className="text-sm font-bold text-white">Ask Anything About Metallurgy & Carbon</h4>
                        <p className="text-xs text-steel-400 leading-relaxed">
                          Grounded in exact Permutation Shapley attributions, thermodynamics, and physical mass balance.
                        </p>
                      </div>

                      {/* Suggested Prompts */}
                      <div className="w-full max-w-md space-y-2 pt-2 text-left">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-steel-500">
                          Recommended Industrial Questions:
                        </span>
                        <div className="space-y-1.5">
                          {SUGGESTED_QUERIES.map((sq, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendQuery(sq)}
                              className="w-full p-2 rounded-lg bg-steel-900/60 border border-steel-800 hover:border-thermal-500/50 hover:bg-steel-800/50 text-left text-xs text-steel-300 transition-all flex items-center justify-between group"
                            >
                              <span>{sq}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-steel-600 group-hover:text-thermal-400 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {m.sender === "assistant" && (
                          <div className="w-7 h-7 rounded-lg bg-thermal-500/20 border border-thermal-500/40 text-thermal-300 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-xl p-3.5 text-xs space-y-3 ${
                            m.sender === "user"
                              ? "bg-thermal-600 text-white rounded-tr-none"
                              : "bg-steel-900/90 border border-steel-800 text-steel-200 rounded-tl-none shadow-xl"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-steel-400 border-b border-steel-800/40 pb-1">
                            <span className="font-semibold text-white">
                              {m.sender === "user" ? "Melt Shop Operator" : m.explanation?.title || "JSL Copilot"}
                            </span>
                            <span>{m.timestamp}</span>
                          </div>

                          {/* Pedagogical 3-Layer Display vs Clean Formatted Message */}
                          {m.sender === "user" ? (
                            <p className="leading-relaxed text-white whitespace-pre-wrap">{m.text}</p>
                          ) : m.isTargetExplain && m.explanation && !m.explanation.isConversational && m.explanation.metaphor && m.explanation.metrics ? (
                            <div className="space-y-3">
                              {/* Layer 1: Metaphor */}
                              <div className="p-2.5 rounded-lg bg-obsidian-950/80 border border-thermal-500/30 space-y-1">
                                <span className="text-[10px] font-mono uppercase font-bold text-thermal-400 flex items-center gap-1">
                                  <span>1. Physical Analogy & Mechanism</span>
                                </span>
                                <p className="text-[11px] text-steel-300 leading-relaxed italic">
                                  "{m.explanation.metaphor}"
                                </p>
                              </div>

                              {/* Layer 2: Grounded Metrics */}
                              <div className="p-2.5 rounded-lg bg-obsidian-950/80 border border-cyanPulse-500/30 space-y-1">
                                <span className="text-[10px] font-mono uppercase font-bold text-cyanPulse-400 flex items-center gap-1">
                                  <span>2. Grounded Telemetry & Metrics</span>
                                </span>
                                <pre className="text-[11px] font-mono text-steel-300 whitespace-pre-wrap leading-relaxed">
                                  {m.explanation.metrics}
                                </pre>
                              </div>

                              {/* Embedded SHAP Waterfall Chart */}
                              {m.shapReport && (
                                <div className="p-3 rounded-lg bg-obsidian-950/90 border border-steel-800 space-y-2">
                                  <span className="text-[10px] font-mono uppercase font-bold text-steel-400 block">
                                    Exact Multi-Target SHAP Attributions (Closure Error = 0.0000)
                                  </span>
                                  <ShapWaterfallChart
                                    report={m.shapReport}
                                    initialTarget={m.explanation.target || "total_co2_t"}
                                  />
                                </div>
                              )}

                              {/* Layer 3: Actionable Lever */}
                              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                                  <span>3. Operational Action for Furnace</span>
                                </span>
                                <p className="text-[11px] text-emerald-200 font-semibold leading-relaxed">
                                  {cleanDisplayText(m.explanation.action)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <FormattedMarkdown content={cleanDisplayText(m.text)} />
                          )}

                          {/* Interactive Cockpit Preset Action Button */}
                          {m.sender === "assistant" && (() => {
                            const preset = m.actionPayload || parseActionPayload(m.text, m.explanation);
                            if (!preset) return null;
                            const nonPresetTopics = [
                              "greeting",
                              "help",
                              "how_to_use",
                              "pleasantry",
                              "farewell",
                              "acknowledgement",
                              "about",
                            ];
                            if (nonPresetTopics.includes(m.explanation?.topic || "")) {
                              return null;
                            }
                            const hasPresetValues = Boolean(
                              preset.scrapPct !== undefined ||
                              preset.feSource ||
                              preset.renewablePct !== undefined ||
                              preset.hotFecrCharging !== undefined
                            );
                            if (!hasPresetValues) return null;
                            return (
                              <div className="pt-2.5 mt-2 border-t border-steel-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-obsidian-950/80 p-2.5 rounded-lg border border-amber-500/30">
                                <div className="flex items-center gap-2 text-amber-400">
                                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                                  <div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold block text-amber-300">
                                      Recommended Process Preset
                                    </span>
                                    <span className="text-[10px] text-steel-400">
                                      {preset.scrapPct !== undefined ? `Scrap: ${preset.scrapPct}%` : ""}
                                      {preset.feSource ? ` • Fe: ${preset.feSource}` : ""}
                                      {preset.renewablePct !== undefined ? ` • Green: ${preset.renewablePct}%` : ""}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleApplyCockpitPreset(preset)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-thermal-600 via-thermal-500 to-amber-500 hover:scale-[1.02] active:scale-95 text-white font-bold text-[11px] shadow-lg shadow-thermal-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Apply Recommended Preset to Cockpit Sliders</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })()}
                        </div>

                        {m.sender === "user" && (
                          <div className="w-7 h-7 rounded-lg bg-thermal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isProcessing && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-7 h-7 rounded-lg bg-thermal-500/20 border border-thermal-500/40 text-thermal-300 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="rounded-xl p-3 bg-steel-900 border border-steel-800 text-xs text-steel-400 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-thermal-400 animate-spin" />
                        <span>Evaluating 64 Permutation Coalitions in SHAP Engine...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-steel-800 bg-obsidian-900/80 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendQuery();
                      }
                    }}
                    placeholder="Ask about scrap limits, tramp copper, CBAM tariffs, or molten FeCr..."
                    className="flex-1 bg-obsidian-950 border border-steel-700 rounded-xl px-3 py-2 text-xs text-white placeholder-steel-500 focus:outline-none focus:border-thermal-500"
                  />
                  <button
                    onClick={() => handleSendQuery()}
                    disabled={isProcessing || !inputText.trim()}
                    className="p-2 rounded-xl bg-thermal-500 hover:bg-thermal-400 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE VOICE AGENT */}
            {activeTab === "voice" && (
              <div className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-white">Full-Duplex Interactive Voice Agent</h4>
                  <p className="text-xs text-steel-400 max-w-sm mx-auto">
                    Sub-15ms client barge-in interruption, Indian English neural acoustics, and zero paid API costs.
                  </p>
                </div>

                {/* 60 FPS Animated Canvas Voice Orb */}
                <div className="my-auto py-4">
                  <VoiceOrb
                    state={voiceState}
                    audioLevel={audioLevel}
                    onToggleListen={() => {
                      if (voiceState === "listening") {
                        voiceAgentRef.current?.stopListening();
                      } else {
                        voiceAgentRef.current?.startListening();
                      }
                    }}
                    onInterrupt={() => {
                      voiceAgentRef.current?.interrupt();
                    }}
                    size={240}
                  />
                </div>

                {/* Real-time Transcription Display */}
                <div className="w-full max-w-md p-3.5 rounded-xl bg-steel-900/80 border border-steel-800 space-y-2 text-center">
                  <div className="flex items-center justify-between text-[10px] text-steel-500 uppercase tracking-wider font-mono">
                    <span>Live Transcript</span>
                    <span>{voiceState.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-steel-200 min-h-[36px] flex items-center justify-center italic">
                    {transcript || (voiceState === "listening" ? "Listening to microphone..." : "Tap the orb above to begin speaking")}
                  </p>
                </div>

                {/* Settings & Voice Accent Persona Picker */}
                <div className="w-full max-w-md pt-2 border-t border-steel-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-steel-400" />
                    <span className="text-steel-400 text-[11px]">Voice Persona:</span>
                  </div>

                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="bg-obsidian-950 border border-steel-700 text-steel-300 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-thermal-500"
                  >
                    <option value="en-IN-PrabhatNeural">Prabhat (Indian English Male Engineer)</option>
                    <option value="en-IN-NeerjaNeural">Neerja (Indian English Female Metallurgist)</option>
                    <option value="en-GB-RyanNeural">Ryan (UK English Industrial)</option>
                    <option value="hi-IN-MadhurNeural">Madhur (Hindi Process Expert)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
