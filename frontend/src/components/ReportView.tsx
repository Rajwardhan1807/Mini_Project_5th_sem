"use client";

import React, { useState } from "react";
import { marked } from "marked";
import {
  Download,
  Copy,
  Check,
  Award,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  HelpCircle,
  FileDown,
  Loader2,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Report, Source, Claim, api } from "@/lib/api";

interface ReportViewProps {
  report: Report;
  query: string;
  researchId?: string;
  sources?: Source[];
  claims?: Claim[];
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  query,
  researchId,
  sources = [],
  claims = [],
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Section collapse states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    findings: true,
    verified: true,
    conflicts: true,
    sources: false,
    limitations: false,
  });

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report.full_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([report.full_markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = query.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 35) || "Report";
    link.download = `ResearchForge_Report_${safeTitle}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!researchId) {
      window.print();
      return;
    }
    setIsDownloadingPdf(true);
    setDownloadError(null);
    try {
      const blob = await api.downloadResearchReport(researchId, "pdf");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = query.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 35) || "Research_Report";
      a.download = `ResearchForge_${safeTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      console.error("PDF download error:", err);
      setDownloadError(err?.message || "Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const rawMarkdown = report.full_markdown || "";
  const parsedHtml = marked.parse(rawMarkdown) as string;

  const verifiedClaims = claims.filter((c) => c.status === "VERIFIED" || c.status === "PARTIALLY VERIFIED");
  const conflictingClaims = claims.filter(
    (c) => c.status === "CONTRADICTED" || (c.contradicting_sources && c.contradicting_sources.length > 0)
  );

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* ── Top Header & Action Toolbar ───────────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] p-5 sm:p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-sky-300 border border-sky-500/30 px-2 py-0.5 bg-sky-500/10 font-semibold rounded-md">
              SYNTHESIZED REPORT
            </span>
            <span>Verified • {new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-white tracking-tight mt-1.5 font-normal">
            {report.title.replace("Research Report: ", "")}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer rounded-lg"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer rounded-lg"
            title="Download source markdown file"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Markdown (.md)</span>
          </button>

          {/* Primary Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-md hover:shadow-sky-500/20"
            title="Download professionally formatted PDF research report"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </section>

      {downloadError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* ── Section 1: Research Summary ───────────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("summary")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#141c2e] transition-colors cursor-pointer text-left border-b border-[#1e293b]"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-sky-400" />
            <h3 className="font-serif text-lg text-white font-medium">1. Executive Summary</h3>
          </div>
          {expandedSections.summary ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.summary && (
          <div className="p-5 sm:p-6 bg-[#0b0f19] text-sm text-slate-300 leading-relaxed">
            <p className="font-sans text-base leading-relaxed text-slate-200">
              {report.executive_summary || "No summary provided."}
            </p>
          </div>
        )}
      </section>

      {/* ── Section 2: Key Findings ───────────────────────────────────────────── */}
      {report.key_findings && report.key_findings.length > 0 && (
        <section className="border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection("findings")}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#141c2e] transition-colors cursor-pointer text-left border-b border-[#1e293b]"
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg text-white font-medium">2. Core Synthesized Findings</h3>
                <span className="text-xs text-slate-400 font-medium">
                  ({report.key_findings.length} findings)
                </span>
              </div>
            </div>
            {expandedSections.findings ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expandedSections.findings && (
            <div className="p-5 sm:p-6 bg-[#0b0f19] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.key_findings.map((finding, idx) => (
                  <article
                    key={idx}
                    className="border border-[#1e293b] bg-[#141c2e] p-4.5 rounded-xl flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e293b] text-xs">
                        <span className="font-mono text-slate-400 font-medium">FINDING #{String(idx + 1).padStart(2, "0")}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            finding.confidence >= 70
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : finding.confidence >= 50
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {finding.confidence}% Confidence
                        </span>
                      </div>
                      <h4 className="font-serif text-base text-white mb-1.5 font-medium leading-snug">
                        {finding.finding}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {finding.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
                      <span>{finding.evidence_sources_count} supporting sources</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Section 3: Verified Information ───────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("verified")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#141c2e] transition-colors cursor-pointer text-left border-b border-[#1e293b]"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-serif text-lg text-white font-medium">
              3. Verified Claims &amp; Evidentiary Analysis
            </h3>
          </div>
          {expandedSections.verified ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.verified && (
          <div className="p-5 sm:p-6 bg-[#0b0f19] space-y-4">
            {verifiedClaims.length > 0 ? (
              <div className="space-y-3">
                {verifiedClaims.map((vc, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#141c2e] border border-[#1e293b] rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Verified Claim</span>
                      </span>
                      <span className="font-mono text-slate-400">{vc.confidence}% confidence</span>
                    </div>
                    <p className="text-sm text-white font-medium">{vc.claim}</p>
                    {vc.analysis && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {vc.analysis}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {report.evidence_and_analysis || "Detailed evidence synthesized from consulted sources."}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Section 4: Conflicting Information ────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("conflicts")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#141c2e] transition-colors cursor-pointer text-left border-b border-[#1e293b]"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-white font-medium">
                4. Conflicting Assertions &amp; Academic Debate
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                ({conflictingClaims.length} points)
              </span>
            </div>
          </div>
          {expandedSections.conflicts ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.conflicts && (
          <div className="p-5 sm:p-6 bg-[#0b0f19] space-y-3">
            {conflictingClaims.length > 0 ? (
              conflictingClaims.map((cc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#141c2e] border border-[#1e293b] border-l-4 border-l-amber-500 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-semibold">Opposing Perspectives</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {cc.supporting_sources?.length || 0} supporting vs{" "}
                      {cc.contradicting_sources?.length || 0} counter
                    </span>
                  </div>
                  <h4 className="text-sm text-white font-medium">{cc.claim}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cc.analysis || "Sources hold differing positions on this assertion."}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                {report.conflicting_evidence || "No critical contradictions detected among consulted sources."}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Section 5: Sources & Evidence ─────────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("sources")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#141c2e] transition-colors cursor-pointer text-left border-b border-[#1e293b]"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-white font-medium">5. Sources &amp; Citations</h3>
              <span className="text-xs text-slate-400 font-medium">
                ({sources.length > 0 ? sources.length : "Full list"})
              </span>
            </div>
          </div>
          {expandedSections.sources ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.sources && (
          <div className="p-5 sm:p-6 bg-[#0b0f19] space-y-3">
            {sources.length > 0 ? (
              <div className="space-y-2.5">
                {sources.map((src, idx) => (
                  <div
                    key={src.id || idx}
                    className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <span className="font-mono text-sky-400">[{idx + 1}]</span>
                        <span className="text-slate-300">{src.domain}</span>
                        <span>&bull;</span>
                        <span>{src.source_type}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-400 font-mono">{Math.round(src.reliability * 100)}% quality</span>
                      </div>
                      <h4 className="text-xs sm:text-sm text-white font-medium truncate mt-0.5">
                        {src.title}
                      </h4>
                    </div>

                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f1523] hover:bg-[#1a243a] border border-[#1e293b] text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors shrink-0"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Refer to report document for full bibliography.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Section 6: Limitations ────────────────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection("limitations")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#141c2e] transition-colors cursor-pointer text-left border-b border-[#1e293b]"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <h3 className="font-serif text-lg text-white font-medium">6. Research Scope &amp; Limitations</h3>
          </div>
          {expandedSections.limitations ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.limitations && (
          <div className="p-5 sm:p-6 bg-[#0b0f19] text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p className="font-sans leading-relaxed">
              {report.limitations ||
                "This research reflects open public domain web indexing, official gazettes, and academic documents available at execution time. Proprietary or confidential agreements remain outside public verification."}
            </p>
          </div>
        )}
      </section>

      {/* ── Full Document Reading View ────────────────────────────────────────── */}
      <article className="border border-[#1e293b] bg-[#0f1523] p-6 sm:p-10 rounded-2xl shadow-lg">
        <div className="border-b border-[#1e293b] pb-4 mb-6 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Complete Synthesized Report
          </span>
          <button
            onClick={handleDownloadPdf}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>

        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      </article>
    </div>
  );
};
