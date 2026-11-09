"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  AlertTriangle,
  ExternalLink,
  RotateCw,
  FileText,
  Copy,
  Info,
  X,
} from "lucide-react";
import { OriginalityFinding, OriginalityReport } from "@/lib/api";

interface PaperOriginalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: OriginalityReport | null;
  findings: OriginalityFinding[];
  onApplySuggestion: (finding: OriginalityFinding) => void;
  onRerunCheck: () => void;
  isLoading: boolean;
}

export const PaperOriginalityModal: React.FC<PaperOriginalityModalProps> = ({
  isOpen,
  onClose,
  report,
  findings,
  onApplySuggestion,
  onRerunCheck,
  isLoading,
}) => {
  const [filter, setFilter] = useState<"all" | "missing_citation" | "high_overlap" | "duplicates">("all");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleApply = (f: OriginalityFinding) => {
    onApplySuggestion(f);
    setAppliedIds((prev) => new Set([...prev, f.id]));
  };

  const filteredFindings = findings.filter((f) => {
    if (filter === "missing_citation") return f.needs_citation;
    if (filter === "high_overlap") return f.matched_source && !f.matched_source.includes("Duplicate");
    if (filter === "duplicates") return f.matched_source && f.matched_source.includes("Duplicate");
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-[#0f1523] border border-[#1e293b] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <span>Originality &amp; Citation Integrity</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400">Corpus Overlap Analysis</span>
              </div>
              <h2 className="font-serif text-lg text-white font-medium">
                Paragraph-by-Paragraph Attribution Review
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRerunCheck}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Audit Again</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistical Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-4 bg-[#141c2e] border-b border-[#1e293b] text-xs">
          <div className="bg-[#0f1523] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">PASSAGES AUDITED</span>
            <span className="text-white font-bold font-mono text-base">
              {report?.passages_reviewed ?? findings.length}
            </span>
          </div>
          <div className="bg-[#0f1523] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">SOURCE OVERLAPS</span>
            <span className="text-amber-400 font-bold font-mono text-base">
              {report?.potential_matches ?? findings.filter((f) => f.matched_source && !f.matched_source.includes("Duplicate")).length}
            </span>
          </div>
          <div className="bg-[#0f1523] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">NEEDS ATTRIBUTION</span>
            <span className="text-rose-400 font-bold font-mono text-base">
              {report?.missing_citations ?? findings.filter((f) => f.needs_citation).length}
            </span>
          </div>
          <div className="bg-[#0f1523] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">REPEATED TEXT</span>
            <span className="text-sky-300 font-bold font-mono text-base">
              {report?.duplicate_passages ?? findings.filter((f) => f.matched_source?.includes("Duplicate")).length}
            </span>
          </div>
          <div className="bg-[#0f1523] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">TOTAL FLAGS</span>
            <span className="text-white font-bold font-mono text-base">
              {findings.length}
            </span>
          </div>
        </div>

        {/* Disclosure Notice */}
        <div className="px-6 py-2.5 bg-[#0b0f19] border-b border-[#1e293b] flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            {report?.note ||
              "This analysis cross-verifies drafted sentences against source summaries and verifies formal attribution. Standard scientific jargon and cited quotes may exhibit similarity."}
          </span>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#0f1523] border-b border-[#1e293b] text-xs">
          <span className="text-slate-400 font-medium">Filter:</span>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({findings.length})
          </button>
          <button
            onClick={() => setFilter("missing_citation")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === "missing_citation"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Needs Citation ({findings.filter((f) => f.needs_citation).length})
          </button>
          <button
            onClick={() => setFilter("high_overlap")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === "high_overlap"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Source Matches ({findings.filter((f) => f.matched_source && !f.matched_source.includes("Duplicate")).length})
          </button>
          <button
            onClick={() => setFilter("duplicates")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === "duplicates"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Repeated Text ({findings.filter((f) => f.matched_source?.includes("Duplicate")).length})
          </button>
        </div>

        {/* Findings List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {filteredFindings.length === 0 ? (
            <div className="text-center py-12 bg-[#141c2e] border border-[#1e293b] rounded-2xl">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm text-white font-medium">No Missing Citations or Overlaps Found</div>
              <p className="text-xs text-slate-400 mt-1">
                Draft paragraphs exhibit solid academic originality and appropriate citations.
              </p>
            </div>
          ) : (
            filteredFindings.map((finding) => {
              const isApplied = appliedIds.has(finding.id);
              return (
                <div
                  key={finding.id}
                  className={`border rounded-xl transition-all ${
                    isApplied
                      ? "bg-[#141c2e]/50 border-emerald-500/30 opacity-70"
                      : "bg-[#141c2e] border-[#1e293b] hover:border-slate-700"
                  } p-4.5 space-y-3 shadow-sm`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#0f1523] border border-[#1e293b] text-slate-300 font-mono text-[11px] rounded-md">
                        Section: {finding.section_key}
                      </span>
                      {finding.needs_citation ? (
                        <span className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-semibold rounded-full">
                          NEEDS CITATION
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold rounded-full">
                          SIMILAR TEXT
                        </span>
                      )}
                    </div>
                    {finding.similarity_note && (
                      <span className="text-slate-400 text-xs">{finding.similarity_note}</span>
                    )}
                  </div>

                  {/* Flag Reason */}
                  <div className="text-xs text-rose-300 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span>{finding.flag_reason}</span>
                  </div>

                  {/* Draft Passage */}
                  <div className="p-3 bg-[#0f1523] border-l-2 border-amber-400 rounded-r-lg text-xs text-slate-200 font-sans leading-relaxed">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                      Draft Passage:
                    </span>
                    &ldquo;{finding.passage}&rdquo;
                  </div>

                  {/* Matched Source Info */}
                  {finding.matched_source && (
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Source: <strong className="text-slate-200">{finding.matched_source}</strong></span>
                      {finding.matched_url && (
                        <a
                          href={finding.matched_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 hover:underline"
                        >
                          <span>Open Reference</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Suggested Correction */}
                  {finding.suggestion && (
                    <div className="p-3 bg-[#0f1523] border-l-2 border-emerald-400 rounded-r-lg text-xs text-slate-300 font-sans leading-relaxed">
                      <span className="text-emerald-400 block text-[10px] uppercase font-semibold mb-1">
                        Suggested Paraphrasing / Attribution:
                      </span>
                      {finding.suggestion}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Suggestion Applied</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(finding)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Suggestion</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0b0f19] border-t border-[#1e293b] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {findings.length} passages evaluated against corpus
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
