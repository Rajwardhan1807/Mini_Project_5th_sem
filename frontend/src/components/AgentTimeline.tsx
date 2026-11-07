"use client";

import React, { useState } from "react";
import {
  Check,
  Loader2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
} from "lucide-react";
import { AgentStates, TimelineEvent } from "@/lib/api";

interface AgentTimelineProps {
  agents: AgentStates;
  events: TimelineEvent[];
  currentStep?: string;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({
  agents,
  events,
  currentStep,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Helper to translate status into friendly badge
  const getStatusBadge = (state: "waiting" | "running" | "completed" | "failed") => {
    switch (state) {
      case "completed":
        return (
          <span className="flex items-center gap-1.5 text-[#4edea3] bg-[#10b981]/10 border border-[#10b981]/30 px-2.5 py-0.5 text-xs font-mono font-medium rounded-sm">
            <Check className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case "running":
        return (
          <span className="flex items-center gap-1.5 text-[#ffb77d] bg-[#d97706]/10 border border-[#d97706]/40 px-2.5 py-0.5 text-xs font-mono font-medium animate-pulse rounded-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>In Progress</span>
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1.5 text-[#ffb4ab] bg-[#93000a]/20 border border-[#dc2626]/40 px-2.5 py-0.5 text-xs font-mono font-medium rounded-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Error</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-[#a38c7c] bg-[#131720] border border-[#222735] px-2.5 py-0.5 text-xs font-mono font-medium rounded-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>Waiting</span>
          </span>
        );
    }
  };

  const researcherEvents = events.filter((e) => e.agent === "Research Agent");
  const factCheckerEvents = events.filter((e) => e.agent === "Fact-Check Agent");
  const writerEvents = events.filter((e) => e.agent === "Writer Agent");

  // Format current step in user-friendly language
  const friendlyCurrentStep = currentStep
    ? currentStep
        .replace(/Research Agent/g, "Researcher")
        .replace(/Fact-Check Agent/g, "Fact-Checker")
        .replace(/Writer Agent/g, "Writer")
        .replace(/Synthesizing Epistemic Ledger/g, "Preparing your report")
        .replace(/DAG Mode.*$/g, "")
    : "Research in progress...";

  return (
    <section className="w-full border border-[#222735] bg-[#0e1117] rounded-sm">
      {/* Top Status Header */}
      <div className="px-5 py-3.5 border-b border-[#222735] bg-[#101319] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ffb77d]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e1e2eb]">
            Research Progress
          </span>
        </div>

        {currentStep && (
          <div className="font-mono text-xs text-[#ffb77d] flex items-center gap-1.5 truncate max-w-lg bg-[#14171e] px-3 py-1 border border-[#222735] rounded-sm">
            <span className="w-2 h-2 rounded-full bg-[#ffb77d] animate-ping shrink-0" />
            <span className="truncate">{friendlyCurrentStep}</span>
          </div>
        )}
      </div>

      {/* 3 Human-Friendly Step Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#222735]">
        {/* Step 1: Collecting Evidence */}
        <div
          className={`p-5 flex flex-col justify-between transition-colors ${
            agents.researcher === "running"
              ? "bg-[#131720] border-l-2 border-[#ffb77d]"
              : "bg-[#0e1117]"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs font-bold text-[#ffb77d]">STEP 1</span>
              {getStatusBadge(agents.researcher)}
            </div>
            <h3 className="font-serif text-base text-[#f1f5f9] mb-1 font-medium flex items-center gap-2">
              <Search className="w-4 h-4 text-[#a38c7c]" />
              <span>Collecting Evidence</span>
            </h3>
            <p className="text-xs text-[#dbc2b0] mb-3 leading-relaxed">
              Finding relevant sources, official records, and academic articles.
            </p>

            {/* Recent Progress Snippets */}
            <div className="space-y-1.5 min-h-[60px] font-mono text-xs border-t border-[#222735] pt-2.5">
              {researcherEvents.slice(-2).map((ev, i) => (
                <div key={i} className="text-[#dbc2b0] flex items-start gap-1.5">
                  <span className="text-[#4edea3] mt-0.5">&bull;</span>
                  <span className="line-clamp-2 text-[11px]">{ev.step}</span>
                </div>
              ))}
              {researcherEvents.length === 0 && agents.researcher === "running" && (
                <div className="text-[#a38c7c] italic text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[#ffb77d]" />
                  <span>Searching sources...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Checking Facts */}
        <div
          className={`p-5 flex flex-col justify-between transition-colors ${
            agents.fact_checker === "running"
              ? "bg-[#131720] border-l-2 border-[#ffb77d]"
              : "bg-[#0e1117]"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs font-bold text-[#ffb77d]">STEP 2</span>
              {getStatusBadge(agents.fact_checker)}
            </div>
            <h3 className="font-serif text-base text-[#f1f5f9] mb-1 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
              <span>Checking Facts</span>
            </h3>
            <p className="text-xs text-[#dbc2b0] mb-3 leading-relaxed">
              Verifying claims, scoring source quality, and finding conflicting views.
            </p>

            {/* Recent Progress Snippets */}
            <div className="space-y-1.5 min-h-[60px] font-mono text-xs border-t border-[#222735] pt-2.5">
              {factCheckerEvents.slice(-2).map((ev, i) => (
                <div key={i} className="text-[#dbc2b0] flex items-start gap-1.5">
                  <span className="text-[#4edea3] mt-0.5">&bull;</span>
                  <span className="line-clamp-2 text-[11px]">{ev.step}</span>
                </div>
              ))}
              {factCheckerEvents.length === 0 && agents.fact_checker === "running" && (
                <div className="text-[#a38c7c] italic text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[#ffb77d]" />
                  <span>Checking claims against evidence...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Preparing Report */}
        <div
          className={`p-5 flex flex-col justify-between transition-colors ${
            agents.writer === "running"
              ? "bg-[#131720] border-l-2 border-[#ffb77d]"
              : "bg-[#0e1117]"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs font-bold text-[#ffb77d]">STEP 3</span>
              {getStatusBadge(agents.writer)}
            </div>
            <h3 className="font-serif text-base text-[#f1f5f9] mb-1 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#b9c8de]" />
              <span>Preparing Report</span>
            </h3>
            <p className="text-xs text-[#dbc2b0] mb-3 leading-relaxed">
              Synthesizing key findings and compiling the downloadable report with citations.
            </p>

            {/* Recent Progress Snippets */}
            <div className="space-y-1.5 min-h-[60px] font-mono text-xs border-t border-[#222735] pt-2.5">
              {writerEvents.slice(-2).map((ev, i) => (
                <div key={i} className="text-[#dbc2b0] flex items-start gap-1.5">
                  <span className="text-[#4edea3] mt-0.5">&bull;</span>
                  <span className="line-clamp-2 text-[11px]">{ev.step}</span>
                </div>
              ))}
              {writerEvents.length === 0 && agents.writer === "running" && (
                <div className="text-[#a38c7c] italic text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-[#ffb77d]" />
                  <span>Writing structured research report...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details Toggle */}
      <div className="border-t border-[#222735] bg-[#101319] px-5 py-2">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center gap-1.5 text-[11px] font-mono text-[#a38c7c] hover:text-[#e1e2eb] transition-colors cursor-pointer"
        >
          {showTechnicalDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          <span>{showTechnicalDetails ? "Hide" : "Show"} detailed event log ({events.length} events)</span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-3 bg-[#08090b] border border-[#222735] max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs text-[#dbc2b0]">
            {events.length === 0 ? (
              <p className="text-[#a38c7c] italic text-[11px]">No events recorded yet.</p>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2 py-0.5 text-[11px]">
                  <span className="text-[#a38c7c] shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[#ffb77d] font-bold shrink-0">[{ev.agent}]</span>
                  <span className="text-[#f1f5f9]">{ev.step}</span>
                  {ev.detail && <span className="text-[#a38c7c] truncate">&mdash; {ev.detail}</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
