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
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium rounded-full">
            <Check className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case "running":
        return (
          <span className="flex items-center gap-1.5 text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 text-xs font-medium rounded-full animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>In Progress</span>
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-xs font-medium rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2.5 py-0.5 text-xs font-medium rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Queued</span>
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
    <section className="w-full border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-lg">
      {/* Top Status Header */}
      <div className="px-5 py-3.5 border-b border-[#1e293b] bg-[#141c2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Pipeline Execution Monitor
          </span>
        </div>

        {currentStep && (
          <div className="text-xs text-sky-300 flex items-center gap-2 truncate max-w-lg bg-[#0b0f19] px-3 py-1 rounded-full border border-[#1e293b]">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
            <span className="truncate font-medium">{friendlyCurrentStep}</span>
          </div>
        )}
      </div>

      {/* 3 Human-Friendly Step Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1e293b]">
        {/* Step 1: Collecting Evidence */}
        <div
          className={`p-5 flex flex-col justify-between transition-colors ${
            agents.researcher === "running"
              ? "bg-[#141c2e]/60"
              : "bg-[#0f1523]"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs font-bold text-sky-400">STAGE 01</span>
              {getStatusBadge(agents.researcher)}
            </div>
            <h3 className="font-serif text-base text-white mb-1 font-medium flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Evidence Discovery</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Discovering relevant academic papers, official records, and verified articles.
            </p>

            {/* Recent Progress Snippets */}
            <div className="space-y-1.5 min-h-[56px] text-xs border-t border-[#1e293b] pt-2.5">
              {researcherEvents.slice(-2).map((ev, i) => (
                <div key={i} className="text-slate-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">&bull;</span>
                  <span className="line-clamp-2 text-[11px]">{ev.step}</span>
                </div>
              ))}
              {researcherEvents.length === 0 && agents.researcher === "running" && (
                <div className="text-slate-400 italic text-xs flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                  <span>Scanning repositories...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Checking Facts */}
        <div
          className={`p-5 flex flex-col justify-between transition-colors ${
            agents.fact_checker === "running"
              ? "bg-[#141c2e]/60"
              : "bg-[#0f1523]"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs font-bold text-sky-400">STAGE 02</span>
              {getStatusBadge(agents.fact_checker)}
            </div>
            <h3 className="font-serif text-base text-white mb-1 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Fact Verification</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Verifying claims against evidence, detecting conflicts, and scoring confidence.
            </p>

            {/* Recent Progress Snippets */}
            <div className="space-y-1.5 min-h-[56px] text-xs border-t border-[#1e293b] pt-2.5">
              {factCheckerEvents.slice(-2).map((ev, i) => (
                <div key={i} className="text-slate-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">&bull;</span>
                  <span className="line-clamp-2 text-[11px]">{ev.step}</span>
                </div>
              ))}
              {factCheckerEvents.length === 0 && agents.fact_checker === "running" && (
                <div className="text-slate-400 italic text-xs flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                  <span>Auditing evidentiary citations...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Preparing Report */}
        <div
          className={`p-5 flex flex-col justify-between transition-colors ${
            agents.writer === "running"
              ? "bg-[#141c2e]/60"
              : "bg-[#0f1523]"
          }`}
        >
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs font-bold text-sky-400">STAGE 03</span>
              {getStatusBadge(agents.writer)}
            </div>
            <h3 className="font-serif text-base text-white mb-1 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Report Synthesis</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Composing structured findings, formatting bibliography, and preparing downloadable files.
            </p>

            {/* Recent Progress Snippets */}
            <div className="space-y-1.5 min-h-[56px] text-xs border-t border-[#1e293b] pt-2.5">
              {writerEvents.slice(-2).map((ev, i) => (
                <div key={i} className="text-slate-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">&bull;</span>
                  <span className="line-clamp-2 text-[11px]">{ev.step}</span>
                </div>
              ))}
              {writerEvents.length === 0 && agents.writer === "running" && (
                <div className="text-slate-400 italic text-xs flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                  <span>Writing structured academic report...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details Toggle */}
      <div className="border-t border-[#1e293b] bg-[#141c2e] px-5 py-2.5">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {showTechnicalDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          <span>{showTechnicalDetails ? "Hide" : "Show"} detailed pipeline events ({events.length} records)</span>
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-3.5 bg-[#090d16] border border-[#1e293b] rounded-lg max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs text-slate-300">
            {events.length === 0 ? (
              <p className="text-slate-500 italic text-xs">No pipeline events recorded yet.</p>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2 py-0.5 text-[11px]">
                  <span className="text-slate-500 shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-sky-400 font-semibold shrink-0">[{ev.agent}]</span>
                  <span className="text-slate-200">{ev.step}</span>
                  {ev.detail && <span className="text-slate-500 truncate">&mdash; {ev.detail}</span>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
