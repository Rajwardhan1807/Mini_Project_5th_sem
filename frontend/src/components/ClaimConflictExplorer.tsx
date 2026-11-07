"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  BarChart3,
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
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#4edea3] bg-[#10b981]/10 border border-[#10b981]/30 rounded-sm">
            Verified Fact
          </span>
        );
      case "PARTIALLY VERIFIED":
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffb77d] bg-[#d97706]/10 border border-[#d97706]/30 rounded-sm">
            Partially Verified
          </span>
        );
      case "CONTRADICTED":
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffb4ab] bg-[#93000a]/20 border border-[#dc2626]/30 rounded-sm">
            Contradicted / Conflicting
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#a38c7c] bg-[#131720] border border-[#222735] rounded-sm">
            Needs More Evidence
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
      <section className="border border-[#222735] bg-[#0b0e14] p-5 sm:p-6 space-y-4 rounded-sm">
        {/* Status Alert Banner */}
        <div
          className={`border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs rounded-sm ${
            conflictCount > 0
              ? "border-[#d97706]/50 bg-[#d97706]/10 text-[#ffb77d]"
              : "border-[#10b981]/50 bg-[#10b981]/10 text-[#4edea3]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {conflictCount > 0 ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span className="tracking-wider uppercase font-semibold">
              {conflictCount > 0
                ? `${conflictCount} Conflicting Perspectives Detected &bull; Fact-Checking Complete`
                : "All Consulted Sources in Agreement &bull; Zero Conflicts Detected"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>{verifiedCount} Verified</span>
            <span>&bull;</span>
            <span>{claims.length} Total Claims Checked</span>
          </div>
        </div>

        {/* Titles */}
        <div className="pt-2">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#f1f5f9] tracking-tight font-normal">
            Fact-Checking &amp; Contradictions
          </h2>
          <p className="text-sm text-[#dbc2b0] font-sans mt-1 max-w-3xl leading-relaxed">
            Review which statements are corroborated across multiple sources and where opinions or data diverge.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#222735] font-mono text-xs">
          <span className="text-[#a38c7c] text-[11px] uppercase mr-1">Filter:</span>
          {[
            { id: "ALL", label: `All Claims (${claims.length})` },
            { id: "CONFLICTS", label: `Conflicts (${conflictCount})` },
            { id: "VERIFIED", label: `Verified (${verifiedCount})` },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1 border transition-colors cursor-pointer rounded-sm ${
                filter === btn.id
                  ? "bg-[#ffb77d] text-[#08090b] border-[#ffb77d] font-bold"
                  : "bg-[#101319] text-[#dbc2b0] border-[#222735] hover:border-[#a38c7c]"
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
          <div className="p-10 border border-[#222735] bg-[#0e1117] text-center text-xs font-mono text-[#a38c7c] rounded-sm">
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
                className={`border bg-[#0e1117] transition-colors rounded-sm overflow-hidden ${
                  hasConflict
                    ? "border-[#d97706]/40 hover:border-[#d97706]"
                    : "border-[#222735] hover:border-[#32353c]"
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(claim.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#131720] transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(claim.status)}
                      <span className="text-xs font-mono text-[#a38c7c]">
                        Confidence: <strong className="text-[#f1f5f9]">{claim.confidence}%</strong>
                      </span>
                      <span className="text-xs font-mono text-[#a38c7c] hidden sm:inline">
                        ({supSources.length} supporting, {conSources.length} contradicting)
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg text-[#f1f5f9] font-medium leading-snug">
                      {claim.claim}
                    </h3>
                  </div>

                  <button
                    className="p-1 text-[#a38c7c] hover:text-[#e1e2eb] shrink-0 mt-1"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#222735] bg-[#0b0e14] space-y-4 text-xs font-mono">
                    {/* Analysis */}
                    {claim.analysis && (
                      <div className="p-3.5 bg-[#101319] border border-[#222735] rounded-sm space-y-1">
                        <span className="text-[11px] text-[#ffb77d] uppercase tracking-wider font-semibold block">
                          Fact-Check Analysis:
                        </span>
                        <p className="font-sans text-sm text-[#dbc2b0] leading-relaxed">
                          {claim.analysis}
                        </p>
                      </div>
                    )}

                    {/* Sources Comparison Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Supporting Sources */}
                      <div className="p-3 bg-[#101319] border border-[#10b981]/30 rounded-sm space-y-2">
                        <div className="flex items-center gap-1.5 text-[#4edea3] font-semibold text-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Supporting Sources ({supSources.length})</span>
                        </div>
                        {supSources.length === 0 ? (
                          <p className="text-[#a38c7c] italic text-[11px]">No direct supporting links recorded.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {supSources.map((s, idx) => (
                              <div key={s.id || idx} className="text-[11px] text-[#dbc2b0]">
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#ffb77d] hover:underline flex items-center gap-1 truncate"
                                >
                                  <span className="truncate">{s.title}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <span className="text-[#a38c7c] text-[10px]">
                                  {s.domain} &bull; Quality: {Math.round(s.reliability * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Contradicting Sources */}
                      <div className="p-3 bg-[#101319] border border-[#d97706]/30 rounded-sm space-y-2">
                        <div className="flex items-center gap-1.5 text-[#ffb77d] font-semibold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Contradicting Sources ({conSources.length})</span>
                        </div>
                        {conSources.length === 0 ? (
                          <p className="text-[#a38c7c] italic text-[11px]">No contradicting evidence identified.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {conSources.map((s, idx) => (
                              <div key={s.id || idx} className="text-[11px] text-[#dbc2b0]">
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#ffb77d] hover:underline flex items-center gap-1 truncate"
                                >
                                  <span className="truncate">{s.title}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                                <span className="text-[#a38c7c] text-[10px]">
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
