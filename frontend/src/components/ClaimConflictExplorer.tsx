"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Claim } from "@/lib/api";

interface ClaimConflictExplorerProps {
  claims: Claim[];
}

export const ClaimConflictExplorer: React.FC<ClaimConflictExplorerProps> = ({ claims }) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const conflictCount = claims.filter(
    (c) => c.status === "CONTRADICTED" || (c.contradicting_sources || []).length > 0
  ).length;

  const verifiedCount = claims.filter(
    (c) => c.status === "VERIFIED" || c.status === "PARTIALLY VERIFIED"
  ).length;

  const filteredClaims = claims.filter((c) => {
    const conCount = (c.contradicting_sources || []).length;
    if (filter === "ALL") return true;
    if (filter === "CONFLICTS") return c.status === "CONTRADICTED" || conCount > 0;
    return c.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Verified Claim</span>
          </span>
        );
      case "PARTIALLY VERIFIED":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded-full">
            Partially Verified
          </span>
        );
      case "CONTRADICTED":
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Contradicted / Debated</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-full">
            Needs Additional Evidence
          </span>
        );
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Summary Masthead ────────────────────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] p-5 sm:p-6 rounded-xl space-y-4 shadow-sm">
        {/* Status Alert Banner */}
        <div
          className={`border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs rounded-xl ${
            conflictCount > 0
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {conflictCount > 0 ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span className="font-semibold">
              {conflictCount > 0
                ? `${conflictCount} Conflicting Perspectives Detected • Fact-Checking Complete`
                : "All Consulted Sources in Consensus • Zero Contradictions Detected"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>{verifiedCount} Verified</span>
            <span>&bull;</span>
            <span>{claims.length} Total Claims Audited</span>
          </div>
        </div>

        {/* Titles */}
        <div className="pt-2">
          <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-tight font-normal">
            Fact-Checking &amp; Evidentiary Conflicts
          </h2>
          <p className="text-sm text-slate-300 font-sans mt-1 max-w-3xl leading-relaxed">
            Review which statements are corroborated across multiple sources and where empirical data diverges.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1e293b] text-xs">
          <span className="text-slate-400 font-medium mr-1">Filter:</span>
          {[
            { id: "ALL", label: `All Claims (${claims.length})` },
            { id: "CONFLICTS", label: `Conflicts (${conflictCount})` },
            { id: "VERIFIED", label: `Verified (${verifiedCount})` },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                filter === btn.id
                  ? "bg-sky-500 text-slate-950 border-sky-400 font-semibold shadow-sm"
                  : "bg-[#141c2e] text-slate-300 border-[#1e293b] hover:border-slate-600"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Claims List ─────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="p-12 border border-[#1e293b] bg-[#0f1523] text-center text-xs text-slate-400 rounded-xl">
            No claims matching the selected filter.
          </div>
        ) : (
          filteredClaims.map((claim) => {
            const isExpanded = expandedId === claim.id;
            const supSources = claim.supporting_sources || [];
            const conSources = claim.contradicting_sources || [];
            const hasConflict = claim.status === "CONTRADICTED" || conSources.length > 0;

            return (
              <div
                key={claim.id}
                className={`border bg-[#0f1523] transition-all rounded-xl overflow-hidden shadow-sm ${
                  hasConflict
                    ? "border-amber-500/30 hover:border-amber-500/50"
                    : "border-[#1e293b] hover:border-slate-700"
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(claim.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#141c2e] transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(claim.status)}
                      <span className="text-xs text-slate-400">
                        Confidence: <strong className="text-white font-mono">{claim.confidence}%</strong>
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        ({supSources.length} supporting, {conSources.length} contradicting)
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg text-white font-medium leading-snug">
                      {claim.claim}
                    </h3>
                  </div>

                  <button
                    className="p-1.5 text-slate-400 hover:text-white shrink-0 mt-0.5 rounded-md hover:bg-slate-800 transition-colors"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#1e293b] bg-[#0b0f19] space-y-4 text-xs">
                    {/* Analysis */}
                    {claim.analysis && (
                      <div className="p-4 bg-[#141c2e] border border-[#1e293b] rounded-xl space-y-1.5">
                        <span className="text-xs text-sky-400 font-semibold block">
                          Fact-Check Analysis:
                        </span>
                        <p className="font-sans text-sm text-slate-200 leading-relaxed">
                          {claim.analysis}
                        </p>
                      </div>
                    )}

                    {/* Sources Comparison Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                      {/* Supporting Sources */}
                      <div className="p-4 bg-[#141c2e] border border-emerald-500/20 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Supporting Sources ({supSources.length})</span>
                        </div>
                        {supSources.length === 0 ? (
                          <p className="text-slate-500 italic text-xs">No direct supporting links recorded.</p>
                        ) : (
                          <div className="space-y-2">
                            {supSources.map((s, idx) => (
                              <div key={s.id || idx} className="text-xs text-slate-300">
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 truncate font-medium"
                                >
                                  <span className="truncate">{s.title}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <span className="text-slate-400 text-[11px]">
                                  {s.domain} &bull; Quality: {Math.round(s.reliability * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Contradicting Sources */}
                      <div className="p-4 bg-[#141c2e] border border-amber-500/20 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Contradicting Sources ({conSources.length})</span>
                        </div>
                        {conSources.length === 0 ? (
                          <p className="text-slate-500 italic text-xs">No contradicting evidence identified.</p>
                        ) : (
                          <div className="space-y-2">
                            {conSources.map((s, idx) => (
                              <div key={s.id || idx} className="text-xs text-slate-300">
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 truncate font-medium"
                                >
                                  <span className="truncate">{s.title}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <span className="text-slate-400 text-[11px]">
                                  {s.domain} &bull; Quality: {Math.round(s.reliability * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
