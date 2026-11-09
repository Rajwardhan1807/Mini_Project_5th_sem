"use client";

import React from "react";
import { ResearchStatistics } from "@/lib/api";

interface MetricsBarProps {
  statistics: ResearchStatistics;
  modelName?: string;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ statistics }) => {
  const confidenceScore = statistics.overall_confidence || 0;

  const getConfidenceStyle = (score: number) => {
    if (score >= 75) return { color: "#34d399", label: "HIGH CONFIDENCE" };
    if (score >= 50) return { color: "#38bdf8", label: "MODERATE" };
    return { color: "#fb7185", label: "NEEDS REVIEW" };
  };

  const confInfo = getConfidenceStyle(confidenceScore);

  return (
    <div className="w-full border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#1e293b]">
        {/* Cell 1: Sources Found */}
        <div className="p-4 bg-[#0f1523] flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Sources Discovered
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {statistics.sources_discovered}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Indexed</span>
          </div>
        </div>

        {/* Cell 2: Relevant Sources */}
        <div className="p-4 bg-[#0f1523] flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Relevant Sources
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-sky-400 tabular-nums">
              {statistics.sources_relevant}
            </span>
            <span className="text-[10px] text-sky-400/70 font-medium">Analyzed</span>
          </div>
        </div>

        {/* Cell 3: Facts Checked */}
        <div className="p-4 bg-[#0f1523] flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Claims Audited
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {statistics.claims_identified}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Claims</span>
          </div>
        </div>

        {/* Cell 4: Verified Facts */}
        <div className="p-4 bg-[#0f1523] flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Verified Claims
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {statistics.claims_verified}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-medium">Validated</span>
          </div>
        </div>

        {/* Cell 5: Conflicting Points */}
        <div className="p-4 bg-[#0f1523] flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Contradictions
          </span>
          <div className="flex items-baseline justify-between">
            <span
              className={`font-mono text-2xl font-bold tabular-nums ${
                statistics.conflicts_detected > 0 ? "text-amber-400" : "text-slate-300"
              }`}
            >
              {statistics.conflicts_detected}
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium">Debated</span>
          </div>
        </div>

        {/* Cell 6: Overall Confidence */}
        <div className="p-4 bg-[#141c2e] flex flex-col justify-between border-l border-sky-500/20">
          <span className="text-[11px] font-medium text-slate-300 block mb-1">
            Overall Confidence
          </span>
          <div className="flex items-baseline justify-between">
            <span
              className="font-mono text-2xl font-bold tabular-nums"
              style={{ color: confInfo.color }}
            >
              {confidenceScore}%
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: confInfo.color }}
            >
              {confInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
