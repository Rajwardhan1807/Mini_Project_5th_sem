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
    accentColor: "text-rose-400",
    btnColor: "bg-rose-500 hover:bg-rose-400",
    btnHover: "",
    btnText: "text-white",
  },
  {
    key: "docx",
    label: "Word Document",
    ext: ".docx",
    description:
      "Editable Microsoft Word document with proper heading styles, headers, footers, and formatted references.",
    features: ["Editable Styles", "Header & Footer", "Cover Page", "Formatted References", "Hyperlinks"],
    accentColor: "text-sky-400",
    btnColor: "bg-sky-500 hover:bg-sky-400",
    btnHover: "",
    btnText: "text-slate-950 font-semibold",
  },
  {
    key: "markdown",
    label: "Markdown",
    ext: ".md",
    description:
      "Structured source document with full metadata front-matter, table of contents, and formatted bibliography.",
    features: ["Full Metadata", "Table of Contents", "Portable Format", "Version Control Friendly"],
    accentColor: "text-emerald-400",
    btnColor: "bg-emerald-600 hover:bg-emerald-500",
    btnHover: "",
    btnText: "text-white font-semibold",
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
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#0f1523] border-b border-[#1e293b] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-sky-400 block font-semibold">
              Export Research Paper
            </span>
            <h2 className="text-base text-slate-100 font-semibold leading-tight line-clamp-1">
              {paper.title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded bg-[#141c2e] border border-[#1e293b] font-mono text-[11px] text-slate-300">
            {sections.length} sections
          </span>
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#141c2e] border border-[#1e293b] font-mono text-[11px] text-emerald-400">
            {totalWords.toLocaleString()} words
          </span>
          <span className="hidden sm:inline px-2 py-0.5 rounded bg-[#141c2e] border border-[#1e293b] font-mono text-[11px] text-sky-400">
            {sources.length} sources
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded-lg hover:bg-[#141c2e] text-slate-400 hover:text-slate-100 transition-colors cursor-pointer border border-transparent hover:border-[#1e293b]"
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
          <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden">
            <button
              onClick={() => setMetaOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#141c2e]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-200">
                <User className="w-4 h-4 text-sky-400" />
                <span>Author &amp; Institution Details</span>
                <span className="text-slate-400 font-normal normal-case tracking-normal ml-2">
                  (optional — added to title page)
                </span>
              </div>
              {metaOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {metaOpen && (
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#1e293b] pt-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    <User className="w-3 h-3 inline mr-1 text-slate-400" />
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={meta.author_name || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, author_name: e.target.value }))}
                    placeholder="e.g., Jane Doe"
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-sky-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none placeholder-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    <Building2 className="w-3 h-3 inline mr-1 text-slate-400" />
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={meta.institution || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, institution: e.target.value }))}
                    placeholder="e.g., Stanford University"
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-sky-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none placeholder-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    <GraduationCap className="w-3 h-3 inline mr-1 text-slate-400" />
                    Department
                    <span className="text-slate-500 ml-1 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={meta.department || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, department: e.target.value }))}
                    placeholder="e.g., Computer Science & AI"
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-sky-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none placeholder-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1 text-slate-400" />
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={meta.submission_date || ""}
                    onChange={(e) => setMeta((m) => ({ ...m, submission_date: e.target.value }))}
                    className="w-full bg-[#090d16] border border-[#1e293b] focus:border-sky-500 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Format Cards ─────────────────────────────────────────────────── */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
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
                    className={`bg-[#0f1523] border rounded-xl flex flex-col transition-all overflow-hidden ${
                      isSuccess
                        ? "border-emerald-500/50 ring-1 ring-emerald-500/30"
                        : isError
                        ? "border-rose-500/50 ring-1 ring-rose-500/30"
                        : "border-[#1e293b] hover:border-slate-700 hover:shadow-lg hover:shadow-black/20"
                    }`}
                  >
                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-[#141c2e] border border-[#1e293b] ${fmt.accentColor}`}>
                          {fmt.key === "pdf" && <File className="w-5 h-5" />}
                          {fmt.key === "docx" && <FileText className="w-5 h-5" />}
                          {fmt.key === "markdown" && <FileCode className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-100">{fmt.label}</div>
                          <div className="font-mono text-[11px] text-slate-400">{fmt.ext}</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{fmt.description}</p>

                      <ul className="space-y-1.5">
                        {fmt.features.map((f) => (
                          <li
                            key={f}
                            className={`flex items-center gap-1.5 text-xs`}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${fmt.accentColor}`} />
                            <span className="text-slate-300">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isError && errMsg && (
                      <div className="px-5 pb-3 flex items-start gap-1.5 text-xs text-rose-400 bg-rose-500/10 border-t border-rose-500/20 pt-2.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{errMsg}</span>
                      </div>
                    )}

                    <div className="px-5 pb-5 pt-2">
                      <button
                        onClick={() => handleGenerate(fmt.key)}
                        disabled={isGenerating}
                        className={`w-full py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
                          isSuccess
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : `${fmt.btnColor} ${fmt.btnHover} ${fmt.btnText} shadow-sm`
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Compiling…</span>
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
          <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e293b] bg-[#141c2e]/40">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-200">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Generated Export History</span>
                <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">
                  ({downloads.length} {downloads.length === 1 ? "file" : "files"} available)
                </span>
              </div>
              <button
                onClick={loadDownloads}
                disabled={loadingDownloads}
                className="p-1.5 rounded-lg hover:bg-[#141c2e] text-slate-400 hover:text-slate-100 transition-colors cursor-pointer border border-transparent hover:border-[#1e293b]"
                title="Refresh download list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDownloads ? "animate-spin" : ""}`} />
              </button>
            </div>

            {downloads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-sans">
                No exports saved yet for this session. Generate a document format above to download and preserve it here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-slate-400 uppercase tracking-wider text-[10px] bg-[#141c2e]/20 font-semibold">
                      <th className="px-5 py-3 text-left">Format</th>
                      <th className="px-5 py-3 text-left">Version</th>
                      <th className="px-5 py-3 text-left">Size</th>
                      <th className="px-5 py-3 text-left">Citation</th>
                      <th className="px-5 py-3 text-left">Generated</th>
                      <th className="px-5 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]/60">
                    {downloads.map((exp) => {
                      const fmtDef = FORMAT_DEFS.find((f) => f.key === exp.format);
                      return (
                        <tr
                          key={exp.id}
                          className="hover:bg-[#141c2e]/50 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {fmtDef && exp.format === "pdf" && (
                                <File className={`w-3.5 h-3.5 ${fmtDef.accentColor}`} />
                              )}
                              {fmtDef && exp.format === "docx" && (
                                <FileText className={`w-3.5 h-3.5 ${fmtDef.accentColor}`} />
                              )}
                              {fmtDef && exp.format === "markdown" && (
                                <FileCode className={`w-3.5 h-3.5 ${fmtDef.accentColor}`} />
                              )}
                              <span className="text-slate-200 font-semibold uppercase">{exp.format}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">v{exp.version}</td>
                          <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                            {exp.file_size_human || _humanSize(exp.file_size)}
                          </td>
                          <td className="px-5 py-3 text-slate-300">{exp.citation_style || "—"}</td>
                          <td className="px-5 py-3 text-slate-400">
                            {new Date(exp.created_at).toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            {exp.file_exists ? (
                              <button
                                onClick={() => handleDownloadSaved(exp.format)}
                                className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
                                title="Re-download this file"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            ) : (
                              <span className="text-rose-400/80 flex items-center gap-1 text-[11px]">
                                <AlertCircle className="w-3 h-3" />
                                Missing
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
          <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 text-xs text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Paper Type</div>
              <div className="text-slate-200 font-medium">{paper.paper_type || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Citation Style</div>
              <div className="text-amber-400 font-medium">{paper.citation_style || "APA 7"}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Total Words</div>
              <div className="text-emerald-400 font-mono font-medium">{totalWords.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Audited Sources</div>
              <div className="text-sky-400 font-mono font-medium">{sources.length}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
