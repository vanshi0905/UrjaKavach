"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScopeBreakdownPoint {
  scenario: string;
  scope1: number;
  scope2: number;
  scope3_raw: number;
  scope3_scrap: number;
}

export interface ScopeChannel {
  key: keyof Omit<ScopeBreakdownPoint, "scenario">;
  label: string;
  color: string;
  desc: string;
}

export interface EmissionsBreakdownWidgetProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  data?: ScopeBreakdownPoint[];
  channels?: ScopeChannel[];
  onActionClick?: () => void;
  className?: string;
}

const defaultEmissionsData: ScopeBreakdownPoint[] = [
  { scenario: "Standard BF-BOF", scope1: 1.48, scope2: 0.28, scope3_raw: 0.52, scope3_scrap: 0.04 },
  { scenario: "Industry Baseline EAF", scope1: 0.42, scope2: 0.58, scope3_raw: 0.44, scope3_scrap: 0.05 },
  { scenario: "Current Heat", scope1: 0.31, scope2: 0.41, scope3_raw: 0.35, scope3_scrap: 0.06 },
  { scenario: "UrjaKavach Green Pilot", scope1: 0.18, scope2: 0.12, scope3_raw: 0.22, scope3_scrap: 0.07 },
];

const defaultScopeChannels: ScopeChannel[] = [
  {
    key: "scope1",
    label: "Scope 1 (Stack + Burners)",
    color: "#f97316",
    desc: "Direct pyrometallurgical decarburization",
  },
  {
    key: "scope2",
    label: "Scope 2 (Power Plant)",
    color: "#06b6d4",
    desc: "EAF transformer and captive power plant",
  },
  {
    key: "scope3_raw",
    label: "Scope 3 (Virgin Alloys)",
    color: "#a855f7",
    desc: "Upstream virgin FeCr, Ni and pig iron",
  },
  {
    key: "scope3_scrap",
    label: "Scope 3 (Scrap Supply)",
    color: "#10b981",
    desc: "Circular stainless scrap logistics",
  },
];

interface CustomTooltipPayload {
  name: string;
  value: number;
  fill: string;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string> & { payload?: CustomTooltipPayload[] }) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, item) => sum + (item.value ?? 0), 0);

  return (
    <div className="bg-obsidian-950/95 border border-steel-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px]">
      <p className="text-white text-xs font-bold uppercase tracking-wider mb-2 border-b border-steel-800 pb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] text-cyanPulse-400 font-mono">tCO2/t Steel</span>
      </p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ background: entry.fill }}
              />
              <span className="text-steel-300 text-[11px] font-medium">{entry.name}</span>
            </div>
            <span className="text-white font-mono font-bold tabular-nums text-xs">
              {Number(entry.value).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 pt-2 border-t border-steel-800 flex justify-between items-center text-xs">
        <span className="text-steel-400 font-semibold">Total Specific Intensity:</span>
        <span className="text-thermal-400 font-mono font-bold text-sm tabular-nums">
          {total.toFixed(2)} <span className="text-[10px] font-normal text-steel-400">tCO2/t</span>
        </span>
      </div>
    </div>
  );
}

export function EmissionsBreakdownWidget({
  title = "Scope 1, 2 and 3 Emissions Architecture",
  subtitle = "Specific carbon intensity breakdown (tCO2e / t stainless crude steel)",
  actionLabel = "CBAM Audit",
  data = defaultEmissionsData,
  channels = defaultScopeChannels,
  onActionClick,
  className,
}: EmissionsBreakdownWidgetProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-steel-800 bg-obsidian-900/90 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide text-white font-sans uppercase">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              GHG Protocol Verified
            </span>
          </div>
          <p className="text-xs text-steel-400 mt-1 font-sans">{subtitle}</p>
        </div>

        {onActionClick && (
          <button
            onClick={onActionClick}
            className="flex items-center gap-1 rounded-lg border border-steel-700 bg-obsidian-800 px-2.5 py-1.5 text-xs font-semibold text-steel-300 hover:text-white hover:border-thermal-500 transition-colors shrink-0"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="scenario"
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
                fontWeight: 500,
              }}
            />
            <YAxis
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 10,
              }}
              unit=" t"
            />
            <Tooltip content={<CustomTooltip />} />
            {channels.map((channel) => (
              <Bar
                key={channel.key}
                dataKey={channel.key}
                name={channel.label}
                stackId="emissions"
                fill={channel.color}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-steel-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {channels.map((channel) => (
          <div key={channel.key} className="flex items-center gap-2 p-1.5 rounded-lg bg-obsidian-950/60 border border-steel-800/50">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-xs"
              style={{ backgroundColor: channel.color }}
            />
            <div className="overflow-hidden text-left">
              <div className="text-[11px] font-semibold text-white truncate">
                {channel.label.split(" ")[0]} {channel.label.split(" ")[1]}
              </div>
              <div className="text-[9px] text-steel-400 truncate">{channel.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmissionsBreakdownWidget;
