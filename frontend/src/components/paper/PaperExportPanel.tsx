"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  FileCode,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Paper, PaperSection, PaperSource, ExportRecord, ExportMeta, paperApi } from "@/lib/api";

interface PaperExportPanelProps {
  paper: Paper;
  sections: PaperSection[];
  sources: PaperSource[];
  onExport: (format: "markdown" | "docx" | "pdf", meta: ExportMeta) => Promise<void>;
  onClose?: () => void;
}

type FormatKey = "pdf" | "docx" | "markdown";
type ExportState = "idle" | "generating" | "success" | "error";

interface FormatDef {
  key: FormatKey;
  label: string;
  ext: string;
  description: string;
  features: string[];
  accentColor: string;
  btnColor: string;
  btnHover: string;
  btnText: string;
}

const FORMAT_DEFS: FormatDef[] = [
  {
    key: "pdf",
    label: "Academic PDF",
    ext: ".pdf",
    description:
      "Professionally formatted, print-ready academic paper with cover page, TOC, page numbers, and bibliography.",
    features: ["Cover Page", "Table of Contents", "Page Numbers", "Bibliography", "Headers & Footers"],
    accentColor: "text-[#ff8fa3]",
    btnColor: "bg-[#ffb77d]",
    btnHover: "hover:bg-[#ffdcc3]",
    btnText: "text-[#4d2600]",
  },
  {
    key: "docx",
    label: "Word Document",
    ext: ".docx",
    description:
      "Editable Microsoft Word document with proper heading styles, headers, footers, and formatted references.",
    features: ["Editable Styles", "Header & Footer", "Cover Page", "Formatted References", "Hyperlinks"],
    accentColor: "text-[#b9c8de]",
    btnColor: "bg-[#2d4a8a]",
    btnHover: "hover:bg-[#3b5998]",
    btnText: "text-white",
  },
  {
    key: "markdown",
    label: "Markdown",
    ext: ".md",
    description:
      "Structured source document with full metadata front-matter, table of contents, and formatted bibliography.",
    features: ["Full Metadata", "Table of Contents", "Portable Format", "Version Control Friendly"],
    accentColor: "text-[#4edea3]",
    btnColor: "bg-[#1a4d3a]",
    btnHover: "hover:bg-[#256149]",
    btnText: "text-[#4edea3]",
  },
];

function _humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const PaperExportPanel: React.FC<PaperExportPanelProps> = ({
  paper,
  sections,
  sources,
  onExport,
  onClose,
}) => {
  const [meta, setMeta] = useState<ExportMeta>({
    author_name: "",
    institution: "",
    department: "",
    submission_date: new Date().toISOString().slice(0, 10),
  });
  const [metaOpen, setMetaOpen] = useState(true);
  const [exportStates, setExportStates] = useState<Record<FormatKey, ExportState>>({
    pdf: "idle",
    docx: "idle",
    markdown: "idle",
  });
  const [exportErrors, setExportErrors] = useState<Record<FormatKey, string>>({
    pdf: "",
    docx: "",
    markdown: "",
  });
  const [downloads, setDownloads] = useState<ExportRecord[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);

  const totalWords = sections.reduce((acc, s) => acc + (s.word_count || 0), 0);

  useEffect(() => {
    loadDownloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper.id]);

  async function loadDownloads() {
    setLoadingDownloads(true);
    try {
      const result = await paperApi.getDownloads(paper.id);
      setDownloads(result.exports || []);
    } catch {
      setDownloads([]);
    } finally {
      setLoadingDownloads(false);
    }
  }

  async function handleGenerate(fmt: FormatKey) {
    setExportStates((prev) => ({ ...prev, [fmt]: "generating" }));
    setExportErrors((prev) => ({ ...prev, [fmt]: "" }));
    try {
      await onExport(fmt, meta);
      setExportStates((prev) => ({ ...prev, [fmt]: "success" }));
      await loadDownloads();
      setTimeout(() => {
        setExportStates((prev) =>
          prev[fmt] === "success" ? { ...prev, [fmt]: "idle" } : prev
        );
      }, 3000);
    } catch (e: any) {
      setExportStates((prev) => ({ ...prev, [fmt]: "error" }));
      setExportErrors((prev) => ({
        ...prev,
        [fmt]: e?.message || "Export failed. Please try again.",
      }));
    }
  }

  function handleDownloadSaved(fmt: string) {
    const url = paperApi.getDownloadUrl(paper.id, fmt);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="flex flex-col h-full bg-[#101319] text-[#e1e2eb] overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#191c22] border-b border-[#222735] px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Download className="w-4 h-4 text-[#ffb77d]" />
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#ffb77d] block">
              Export Research Paper
            </span>
            <h2 className="font-serif text-lg text-[#e1e2eb] font-normal leading-tight">
              {paper.title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-[#a38c7c]">
          <span>{sections.length} sections</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{totalWords.toLocaleString()} words</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{sources.length} sources</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-3 p-1.5 hover:bg-[#222735] text-[#a38c7c] hover:text-[#e1e2eb] transition-colors cursor-pointer"
              title="Close export panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* ── Author & Institution ─────────────────────────────────────────── */}
          <div className="bg-[#191c22] border border-[#222735]">
            <button
              onClick={() => setMetaOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#1d2026] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#e1e2eb]">
                <User className="w-3.5 h-3.5 text-[#ffb77d]" />
                <span>Author &amp; Institution</span>
                <span className="text-[#a38c7c] normal-case tracking-normal ml-2">
                  (optional — appears on cover page)
                </span>
              </div>
              {metaOpen ? (
                <ChevronUp className="w-4 h-4 text-[#a38c7c]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#a38c7c]" />
              )}
            </button>

            {metaOpen && (
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#222735] pt-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#a38c7c] mb-1.5">
                    <User className="w-3 h-3 inline mr-1" />
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={meta.author_name || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, author_name: e.target.value }))}
                    placeholder="e.g., Jane Doe"
                    className="w-full bg-[#101319] border border-[#222735] focus:border-[#ffb77d] px-3 py-2 text-sm text-[#e1e2eb] focus:outline-none placeholder-[#a38c7c]/50"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#a38c7c] mb-1.5">
                    <Building2 className="w-3 h-3 inline mr-1" />
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={meta.institution || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, institution: e.target.value }))}
                    placeholder="e.g., MIT"
                    className="w-full bg-[#101319] border border-[#222735] focus:border-[#ffb77d] px-3 py-2 text-sm text-[#e1e2eb] focus:outline-none placeholder-[#a38c7c]/50"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#a38c7c] mb-1.5">
                    <GraduationCap className="w-3 h-3 inline mr-1" />
                    Department
                    <span className="text-[#a38c7c]/60 ml-1 normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={meta.department || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, department: e.target.value }))}
                    placeholder="e.g., Computer Science"
                    className="w-full bg-[#101319] border border-[#222735] focus:border-[#ffb77d] px-3 py-2 text-sm text-[#e1e2eb] focus:outline-none placeholder-[#a38c7c]/50"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#a38c7c] mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={meta.submission_date || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, submission_date: e.target.value }))}
                    className="w-full bg-[#101319] border border-[#222735] focus:border-[#ffb77d] px-3 py-2 text-sm text-[#e1e2eb] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Format Cards ─────────────────────────────────────────────────── */}
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#a38c7c] mb-3">
              Select Export Format
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FORMAT_DEFS.map((fmt) => {
                const state = exportStates[fmt.key];
                const isGenerating = state === "generating";
                const isSuccess = state === "success";
                const isError = state === "error";
                const errMsg = exportErrors[fmt.key];

                return (
                  <div
                    key={fmt.key}
                    className={`bg-[#191c22] border flex flex-col transition-colors ${
                      isSuccess
                        ? "border-[#4edea3]"
                        : isError
                        ? "border-[#ffb4ab]"
                        : "border-[#222735] hover:border-[#32353c]"
                    }`}
                  >
                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-2.5 mb-3">
                        {fmt.key === "pdf" && <File className={`w-5 h-5 ${fmt.accentColor}`} />}
                        {fmt.key === "docx" && <FileText className={`w-5 h-5 ${fmt.accentColor}`} />}
                        {fmt.key === "markdown" && <FileCode className={`w-5 h-5 ${fmt.accentColor}`} />}
                        <div>
                          <div className="font-mono text-sm font-bold text-[#e1e2eb]">{fmt.label}</div>
                          <div className="font-mono text-[10px] text-[#a38c7c]">{fmt.ext}</div>
                        </div>
                      </div>

                      <p className="text-xs text-[#a38c7c] leading-relaxed mb-4">{fmt.description}</p>

                      <ul className="space-y-1.5">
                        {fmt.features.map((f) => (
                          <li
                            key={f}
                            className={`flex items-center gap-1.5 text-[11px] font-mono ${fmt.accentColor}`}
                          >
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="text-[#dbc2b0]">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isError && errMsg && (
                      <div className="px-5 pb-2 flex items-start gap-1.5 text-[11px] text-[#ffb4ab]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{errMsg}</span>
                      </div>
                    )}

                    <div className="px-5 pb-5">
                      <button
                        onClick={() => handleGenerate(fmt.key)}
                        disabled={isGenerating}
                        className={`w-full py-2.5 font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
                          isSuccess
                            ? "bg-[#4edea3] text-[#0d3325]"
                            : `${fmt.btnColor} ${fmt.btnHover} ${fmt.btnText}`
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating…</span>
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Downloaded!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Generate &amp; Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Export History ────────────────────────────────────────────────── */}
          <div className="bg-[#191c22] border border-[#222735]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#222735]">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#e1e2eb]">
                <Clock className="w-3.5 h-3.5 text-[#b9c8de]" />
                <span>Export History</span>
                <span className="text-[#a38c7c] normal-case tracking-normal ml-1">
                  ({downloads.length} files saved)
                </span>
              </div>
              <button
                onClick={loadDownloads}
                disabled={loadingDownloads}
                className="p-1.5 hover:bg-[#222735] text-[#a38c7c] hover:text-[#e1e2eb] transition-colors cursor-pointer"
                title="Refresh download list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDownloads ? "animate-spin" : ""}`} />
              </button>
            </div>

            {downloads.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-[#a38c7c]">
                No exports yet. Generate a document above to save it here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#222735] text-[#a38c7c] uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-2.5 text-left">Format</th>
                      <th className="px-5 py-2.5 text-left">Version</th>
                      <th className="px-5 py-2.5 text-left">Size</th>
                      <th className="px-5 py-2.5 text-left">Citation</th>
                      <th className="px-5 py-2.5 text-left">Generated</th>
                      <th className="px-5 py-2.5 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map((exp) => {
                      const fmtDef = FORMAT_DEFS.find((f) => f.key === exp.format);
                      return (
                        <tr
                          key={exp.id}
                          className="border-b border-[#222735]/50 hover:bg-[#1d2026] transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {fmtDef && exp.format === "pdf" && (
                                <File className={`w-3.5 h-3.5 ${fmtDef.accentColor}`} />
                              )}
                              {fmtDef && exp.format === "docx" && (
                                <FileText className={`w-3.5 h-3.5 ${fmtDef.accentColor}`} />
                              )}
                              {fmtDef && exp.format === "markdown" && (
                                <FileCode className={`w-3.5 h-3.5 ${fmtDef.accentColor}`} />
                              )}
                              <span className="text-[#e1e2eb] uppercase">{exp.format}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[#a38c7c]">v{exp.version}</td>
                          <td className="px-5 py-3 text-[#a38c7c]">
                            {exp.file_size_human || _humanSize(exp.file_size)}
                          </td>
                          <td className="px-5 py-3 text-[#a38c7c]">{exp.citation_style || "—"}</td>
                          <td className="px-5 py-3 text-[#a38c7c]">
                            {new Date(exp.created_at).toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            {exp.file_exists ? (
                              <button
                                onClick={() => handleDownloadSaved(exp.format)}
                                className="flex items-center gap-1 text-[#ffb77d] hover:text-[#ffdcc3] transition-colors cursor-pointer"
                                title="Re-download this file"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            ) : (
                              <span className="text-[#ffb4ab]/60 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                File missing
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Paper Summary ────────────────────────────────────────────────── */}
          <div className="bg-[#14171e] border border-[#222735] p-5 font-mono text-xs text-[#a38c7c] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1">Paper Type</div>
              <div className="text-[#e1e2eb]">{paper.paper_type || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1">Citation Style</div>
              <div className="text-[#ffb77d]">{paper.citation_style || "APA 7"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1">Total Words</div>
              <div className="text-[#4edea3]">{totalWords.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1">Sources</div>
              <div className="text-[#b9c8de]">{sources.length}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
