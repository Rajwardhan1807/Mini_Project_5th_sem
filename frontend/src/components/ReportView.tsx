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
  Layers,
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
      // Fallback: print/pdf window
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

  // Parse markdown into sections if available
  const rawMarkdown = report.full_markdown || "";
  const parsedHtml = marked.parse(rawMarkdown) as string;

  // Extract sections
  const verifiedClaims = claims.filter((c) => c.status === "VERIFIED" || c.status === "PARTIALLY VERIFIED");
  const conflictingClaims = claims.filter(
    (c) => c.status === "CONTRADICTED" || (c.contradicting_sources && c.contradicting_sources.length > 0)
  );

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* ── Top Header & Action Toolbar ───────────────────────────────────────── */}
      <section className="border border-[#222735] bg-[#0b0e14] p-5 sm:p-6 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#a38c7c] uppercase">
            <span className="text-[#ffb77d] border border-[#d97706]/60 px-2 py-0.5 bg-[#d97706]/10 font-semibold rounded-sm">
              RESEARCH REPORT
            </span>
            <span>VERIFIED &bull; {new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#f1f5f9] tracking-tight mt-1.5 font-normal">
            {report.title.replace("Research Report: ", "")}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#101319] hover:bg-[#191c22] border border-[#222735] hover:border-[#a38c7c] text-[#dbc2b0] hover:text-[#f1f5f9] font-mono text-xs transition-colors cursor-pointer rounded-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5 text-[#a38c7c]" />}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#101319] hover:bg-[#191c22] border border-[#222735] hover:border-[#a38c7c] text-[#dbc2b0] hover:text-[#f1f5f9] font-mono text-xs transition-colors cursor-pointer rounded-sm"
            title="Download source markdown file"
          >
            <FileDown className="w-3.5 h-3.5 text-[#b9c8de]" />
            <span>Markdown (.md)</span>
          </button>

          {/* Primary Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-[#d97706] hover:bg-[#ffb77d] text-[#08090b] font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 rounded-sm shadow-md"
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
        <div className="p-3 bg-[#93000a]/20 border border-[#dc2626] text-[#ffb4ab] text-xs font-mono rounded-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* ── Section 1: Research Summary ───────────────────────────────────────── */}
      <section className="border border-[#222735] bg-[#0e1117] rounded-sm overflow-hidden">
        <button
          onClick={() => toggleSection("summary")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#131720] transition-colors cursor-pointer text-left border-b border-[#222735]"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#ffb77d]" />
            <h3 className="font-serif text-lg text-[#f1f5f9] font-medium">1. Research Summary</h3>
          </div>
          {expandedSections.summary ? (
            <ChevronUp className="w-4 h-4 text-[#a38c7c]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a38c7c]" />
          )}
        </button>

        {expandedSections.summary && (
          <div className="p-5 sm:p-6 bg-[#0b0e14] text-sm text-[#dbc2b0] leading-relaxed">
            <p className="font-sans text-base leading-relaxed text-[#e1e2eb]">
              {report.executive_summary || "No summary provided."}
            </p>
          </div>
        )}
      </section>

      {/* ── Section 2: Key Findings ───────────────────────────────────────────── */}
      {report.key_findings && report.key_findings.length > 0 && (
        <section className="border border-[#222735] bg-[#0e1117] rounded-sm overflow-hidden">
          <button
            onClick={() => toggleSection("findings")}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#131720] transition-colors cursor-pointer text-left border-b border-[#222735]"
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-[#4edea3]" />
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg text-[#f1f5f9] font-medium">2. Key Findings</h3>
                <span className="text-xs font-mono text-[#a38c7c]">
                  ({report.key_findings.length} findings)
                </span>
              </div>
            </div>
            {expandedSections.findings ? (
              <ChevronUp className="w-4 h-4 text-[#a38c7c]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#a38c7c]" />
            )}
          </button>

          {expandedSections.findings && (
            <div className="p-5 sm:p-6 bg-[#0b0e14] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.key_findings.map((finding, idx) => (
                  <article
                    key={idx}
                    className="border border-[#222735] bg-[#101319] p-4 flex flex-col justify-between rounded-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222735] font-mono">
                        <span className="text-xs text-[#a38c7c]">FINDING #{String(idx + 1).padStart(2, "0")}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 border rounded-sm uppercase ${
                            finding.confidence >= 70
                              ? "bg-[#10b981]/10 text-[#4edea3] border-[#10b981]/40"
                              : finding.confidence >= 50
                              ? "bg-[#d97706]/10 text-[#ffb77d] border-[#d97706]/40"
                              : "bg-[#93000a]/20 text-[#ffb4ab] border-[#dc2626]/40"
                          }`}
                        >
                          {finding.confidence}% Confidence
                        </span>
                      </div>
                      <h4 className="font-serif text-base text-[#f1f5f9] mb-1.5 font-medium leading-snug">
                        {finding.finding}
                      </h4>
                      <p className="text-xs text-[#dbc2b0] leading-relaxed">
                        {finding.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#222735] flex items-center justify-between font-mono text-[11px] text-[#a38c7c]">
                      <span>{finding.evidence_sources_count} supporting sources</span>
                      <span className="text-[#4edea3]">&bull; Verified</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Section 3: Verified Information ───────────────────────────────────── */}
      <section className="border border-[#222735] bg-[#0e1117] rounded-sm overflow-hidden">
        <button
          onClick={() => toggleSection("verified")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#131720] transition-colors cursor-pointer text-left border-b border-[#222735]"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
            <h3 className="font-serif text-lg text-[#f1f5f9] font-medium">
              3. Verified Information &amp; Analysis
            </h3>
          </div>
          {expandedSections.verified ? (
            <ChevronUp className="w-4 h-4 text-[#a38c7c]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a38c7c]" />
          )}
        </button>

        {expandedSections.verified && (
          <div className="p-5 sm:p-6 bg-[#0b0e14] space-y-4">
            {verifiedClaims.length > 0 ? (
              <div className="space-y-3">
                {verifiedClaims.map((vc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#101319] border border-[#222735] rounded-sm space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#4edea3] font-bold">&bull; Verified Point</span>
                      <span className="text-[#a38c7c]">{vc.confidence}% confidence</span>
                    </div>
                    <p className="text-sm text-[#f1f5f9] font-medium">{vc.claim}</p>
                    {vc.analysis && (
                      <p className="text-xs text-[#a38c7c] leading-relaxed pt-1">
                        {vc.analysis}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#a38c7c] italic">
                {report.evidence_and_analysis || "Detailed evidence synthesized from consulted sources."}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Section 4: Conflicting Information ────────────────────────────────── */}
      <section className="border border-[#222735] bg-[#0e1117] rounded-sm overflow-hidden">
        <button
          onClick={() => toggleSection("conflicts")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#131720] transition-colors cursor-pointer text-left border-b border-[#222735]"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ffb77d]" />
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-[#f1f5f9] font-medium">
                4. Conflicting Information &amp; Debate
              </h3>
              <span className="text-xs font-mono text-[#a38c7c]">
                ({conflictingClaims.length} debated points)
              </span>
            </div>
          </div>
          {expandedSections.conflicts ? (
            <ChevronUp className="w-4 h-4 text-[#a38c7c]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a38c7c]" />
          )}
        </button>

        {expandedSections.conflicts && (
          <div className="p-5 sm:p-6 bg-[#0b0e14] space-y-3">
            {conflictingClaims.length > 0 ? (
              conflictingClaims.map((cc, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#101319] border border-[#222735] border-l-2 border-l-[#d97706] rounded-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#ffb77d] font-bold">Conflicting Perspectives</span>
                    <span className="text-[#a38c7c]">
                      {cc.supporting_sources?.length || 0} supporting vs{" "}
                      {cc.contradicting_sources?.length || 0} counter
                    </span>
                  </div>
                  <h4 className="text-sm text-[#f1f5f9] font-medium">{cc.claim}</h4>
                  <p className="text-xs text-[#dbc2b0] leading-relaxed">
                    {cc.analysis || "Sources hold differing positions on this assertion."}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#a38c7c] italic">
                {report.conflicting_evidence || "No critical contradictions detected among consulted sources."}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Section 5: Sources & Evidence ─────────────────────────────────────── */}
      <section className="border border-[#222735] bg-[#0e1117] rounded-sm overflow-hidden">
        <button
          onClick={() => toggleSection("sources")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#131720] transition-colors cursor-pointer text-left border-b border-[#222735]"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#b9c8de]" />
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-[#f1f5f9] font-medium">5. Sources &amp; Citations</h3>
              <span className="text-xs font-mono text-[#a38c7c]">
                ({sources.length > 0 ? sources.length : "Full list"})
              </span>
            </div>
          </div>
          {expandedSections.sources ? (
            <ChevronUp className="w-4 h-4 text-[#a38c7c]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a38c7c]" />
          )}
        </button>

        {expandedSections.sources && (
          <div className="p-5 sm:p-6 bg-[#0b0e14] space-y-3">
            {sources.length > 0 ? (
              <div className="space-y-2">
                {sources.map((src, idx) => (
                  <div
                    key={src.id || idx}
                    className="p-3 bg-[#101319] border border-[#222735] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#a38c7c]">
                        <span>[{idx + 1}]</span>
                        <span className="text-[#b9c8de]">{src.domain}</span>
                        <span>&bull;</span>
                        <span>{src.source_type}</span>
                        <span>&bull;</span>
                        <span className="text-[#4edea3]">{Math.round(src.reliability * 100)}% quality</span>
                      </div>
                      <h4 className="text-xs sm:text-sm text-[#f1f5f9] font-medium truncate mt-0.5">
                        {src.title}
                      </h4>
                    </div>

                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#ffb77d] hover:text-[#ffdcc3] transition-colors shrink-0"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#a38c7c] italic">
                Refer to report document for full bibliography.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── Section 6: Limitations ────────────────────────────────────────────── */}
      <section className="border border-[#222735] bg-[#0e1117] rounded-sm overflow-hidden">
        <button
          onClick={() => toggleSection("limitations")}
          className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#131720] transition-colors cursor-pointer text-left border-b border-[#222735]"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#a38c7c]" />
            <h3 className="font-serif text-lg text-[#f1f5f9] font-medium">6. Research Limitations</h3>
          </div>
          {expandedSections.limitations ? (
            <ChevronUp className="w-4 h-4 text-[#a38c7c]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#a38c7c]" />
          )}
        </button>

        {expandedSections.limitations && (
          <div className="p-5 sm:p-6 bg-[#0b0e14] text-xs sm:text-sm text-[#dbc2b0] leading-relaxed">
            <p className="font-sans leading-relaxed">
              {report.limitations ||
                "This research reflects public domain web indexing, official gazettes, and academic documents available at execution time. Proprietary or confidential agreements remain outside public verification."}
            </p>
          </div>
        )}
      </section>

      {/* ── Full Document Reading View ────────────────────────────────────────── */}
      <article className="border border-[#222735] bg-[#0b0e14] p-6 sm:p-10 rounded-sm">
        <div className="border-b border-[#222735] pb-3 mb-6 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-[#a38c7c]">
            Complete Written Report
          </span>
          <button
            onClick={handleDownloadPdf}
            className="text-xs font-mono text-[#ffb77d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download as PDF</span>
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
