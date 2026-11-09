"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Save,
  Download,
  ShieldAlert,
  FileCheck2,
  RotateCw,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Clock,
  History,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Sliders,
  ExternalLink,
  Plus,
  Trash2,
  HelpCircle,
  Hash,
  Wand2,
} from "lucide-react";
import {
  Paper,
  PaperSection,
  PaperSource,
  OriginalityFinding,
  OriginalityReport,
  ExportMeta,
  paperApi
} from "@/lib/api";
import { PaperOriginalityModal } from "./PaperOriginalityModal";

interface PaperEditorViewProps {
  paper: Paper;
  sections: PaperSection[];
  sources: PaperSource[];
  onUpdateSection: (sectionId: string, content: string) => Promise<void>;
  onRegenerateSection: (sectionKey: string) => Promise<void>;
  onTransformSection: (sectionKey: string, action: "clarity" | "expand" | "shorten") => Promise<void>;
  onChangeCitationStyle: (style: string) => Promise<void>;
  onExport: (format: "markdown" | "docx" | "pdf", meta?: ExportMeta) => Promise<void>;
  onSaveRevision: (label?: string) => Promise<void>;
  onRestoreRevision: (revId: string) => Promise<void>;
  onRefreshPaper: () => Promise<void>;
}

export const PaperEditorView: React.FC<PaperEditorViewProps> = ({
  paper,
  sections,
  sources,
  onUpdateSection,
  onRegenerateSection,
  onTransformSection,
  onChangeCitationStyle,
  onExport,
  onSaveRevision,
  onRestoreRevision,
  onRefreshPaper,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || ""
  );
  const [activeSectionContent, setActiveSectionContent] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string>("Just now");
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Side drawers / modals
  const [activeTab, setActiveTab] = useState<"editor" | "references" | "evidence" | "history">("editor");
  const [isOriginalityModalOpen, setIsOriginalityModalOpen] = useState(false);
  const [originalityFindings, setOriginalityFindings] = useState<OriginalityFinding[]>([]);
  const [originalityReport, setOriginalityReport] = useState<OriginalityReport | null>(paper.originality_report || null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Revisions state
  const [revisions, setRevisions] = useState<Array<{ id: string; revision_label: string; created_at: string }>>([]);
  const [revisionLabelInput, setRevisionLabelInput] = useState("");
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);

  // References state
  const [formattedReferences, setFormattedReferences] = useState<string>("");
  const [copiedRef, setCopiedRef] = useState(false);

  // Active section tracking
  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  useEffect(() => {
    if (activeSection) {
      setActiveSectionContent(activeSection.content || "");
    }
  }, [activeSectionId, sections]);

  // Load revisions and evidence on mount
  useEffect(() => {
    if (paper.id) {
      paperApi.getRevisions(paper.id).then(setRevisions).catch(() => {});
      paperApi.getReferences(paper.id).then((r) => setFormattedReferences(r.references)).catch(() => {});
      paperApi.getEvidence(paper.id).then((e) => {
        if (e.originality_findings) setOriginalityFindings(e.originality_findings);
      }).catch(() => {});
    }
  }, [paper.id]);

  // Debounced Auto-save
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = (val: string) => {
    setActiveSectionContent(val);
    setSaveStatus("unsaved");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (activeSection) {
        setSaveStatus("saving");
        try {
          await onUpdateSection(activeSection.id, val);
          setSaveStatus("saved");
          setLastSavedAt(new Date().toLocaleTimeString());
        } catch (err) {
          console.error("Auto-save failed:", err);
          setSaveStatus("unsaved");
        }
      }
    }, 1200);
  };

  const handleManualSave = async () => {
    if (!activeSection) return;
    setSaveStatus("saving");
    try {
      await onUpdateSection(activeSection.id, activeSectionContent);
      setSaveStatus("saved");
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setSaveStatus("unsaved");
    }
  };

  const handleCreateSnapshot = async () => {
    setIsCreatingRevision(true);
    try {
      await onSaveRevision(revisionLabelInput.trim() || undefined);
      setRevisionLabelInput("");
      const revs = await paperApi.getRevisions(paper.id);
      setRevisions(revs);
    } finally {
      setIsCreatingRevision(false);
    }
  };

  const handleRestore = async (revId: string) => {
    await onRestoreRevision(revId);
    await onRefreshPaper();
  };

  const handleAuditOriginality = async () => {
    setIsAuditing(true);
    try {
      await paperApi.runOriginalityCheck(paper.id);
      const ev = await paperApi.getEvidence(paper.id);
      setOriginalityFindings(ev.originality_findings || []);
      const p = await paperApi.getPaper(paper.id);
      setOriginalityReport(p.originality_report || null);
      setIsOriginalityModalOpen(true);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyOriginalitySuggestion = (finding: OriginalityFinding) => {
    if (finding.suggestion && activeSection) {
      const updated = activeSectionContent.replace(
        finding.passage,
        `${finding.passage} [Ref: ${finding.matched_source || "Peer-Reviewed Source"}]`
      );
      handleContentChange(updated);
    }
  };

  const insertCitation = (citationTag: string) => {
    const updated = activeSectionContent + ` ${citationTag}`;
    handleContentChange(updated);
  };

  const totalWords = sections.reduce((acc, s) => acc + (s.word_count || 0), 0);
  const targetWords = paper.target_word_count || 5000;
  const wordProgress = Math.min(100, Math.round((totalWords / targetWords) * 100));

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#090d16] text-[#f1f5f9] overflow-hidden">
      {/* Top Studio Control Bar */}
      <div className="bg-[#0b0f19] border-b border-[#1e293b] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Paper Title & Telemetry */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h1 className="font-serif text-sm sm:text-base text-white font-medium truncate max-w-sm sm:max-w-md">
              {paper.title}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-[#1e293b] pl-3">
            <span className="text-amber-300 font-medium">{paper.paper_type}</span>
            <span>•</span>
            <span className="text-sky-300 font-medium">{paper.field}</span>
          </div>
        </div>

        {/* Center: Citation Style Quick Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline font-medium">Style:</span>
          <select
            value={paper.citation_style || "APA 7"}
            onChange={(e) => onChangeCitationStyle(e.target.value)}
            className="bg-[#141c2e] border border-[#1e293b] hover:border-sky-500/50 px-2.5 py-1 text-xs text-sky-300 rounded-md focus:outline-none cursor-pointer font-medium"
            title="Change citation format"
          >
            <option value="APA 7">APA 7th</option>
            <option value="IEEE">IEEE [1]</option>
            <option value="MLA 9">MLA 9th</option>
            <option value="Chicago">Chicago</option>
            <option value="Harvard">Harvard</option>
            <option value="Vancouver">Vancouver</option>
          </select>

          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141c2e] border border-[#1e293b] text-xs rounded-md">
            {saveStatus === "saving" ? (
              <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Saving...</span>
              </span>
            ) : saveStatus === "saved" ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            ) : (
              <button
                onClick={handleManualSave}
                className="text-rose-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Audit Originality Button */}
          <button
            onClick={handleAuditOriginality}
            disabled={isAuditing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-amber-500/40 text-xs font-medium text-amber-300 transition-all cursor-pointer disabled:opacity-50 rounded-lg"
            title="Check for missing citations and originality"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Originality Check</span>
          </button>

          {/* Revisions Button */}
          <button
            onClick={() => setActiveTab(activeTab === "history" ? "editor" : "history")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-all cursor-pointer rounded-lg ${
              activeTab === "history"
                ? "bg-sky-500/20 border-sky-500/40 text-sky-300 font-semibold"
                : "bg-[#141c2e] border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600"
            }`}
            title="Saved versions"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Versions ({revisions.length})</span>
          </button>

          {/* References & Evidence Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === "references" ? "editor" : "references")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-all cursor-pointer rounded-lg ${
              activeTab === "references"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold"
                : "bg-[#141c2e] border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600"
            }`}
            title="View References"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">References</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0f1523] border border-[#1e293b] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 p-1.5 text-xs">
              <button
                onClick={async () => {
                  setIsExporting("docx");
                  await onExport("docx");
                  setIsExporting(null);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-[#141c2e] hover:text-sky-300 flex items-center justify-between rounded-lg transition-colors cursor-pointer"
              >
                <span>Word (.docx)</span>
                {isExporting === "docx" && <span className="animate-spin text-xs">⟳</span>}
              </button>
              <button
                onClick={async () => {
                  setIsExporting("pdf");
                  await onExport("pdf");
                  setIsExporting(null);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-[#141c2e] hover:text-sky-300 flex items-center justify-between rounded-lg transition-colors cursor-pointer"
              >
                <span>PDF Document (.pdf)</span>
                {isExporting === "pdf" && <span className="animate-spin text-xs">⟳</span>}
              </button>
              <button
                onClick={async () => {
                  setIsExporting("markdown");
                  await onExport("markdown");
                  setIsExporting(null);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-[#141c2e] hover:text-sky-300 flex items-center justify-between rounded-lg transition-colors cursor-pointer"
              >
                <span>Markdown (.md)</span>
                {isExporting === "markdown" && <span className="animate-spin text-xs">⟳</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Section Navigator */}
        <aside className="w-64 sm:w-72 bg-[#0b0f19] border-r border-[#1e293b] flex flex-col shrink-0 overflow-y-auto">
          {/* Word count progress bar */}
          <div className="p-4 border-b border-[#1e293b] bg-[#0f1523]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-400">TOTAL LENGTH</span>
              <span className="text-white font-mono">
                {totalWords.toLocaleString()} / {targetWords.toLocaleString()} w
              </span>
            </div>
            <div className="w-full bg-[#141c2e] h-2 rounded-full overflow-hidden border border-[#1e293b]">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${wordProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{sections.length} sections</span>
              <span className="font-mono text-emerald-400">{wordProgress}% of target</span>
            </div>
          </div>

          {/* Section List Items */}
          <div className="p-2 space-y-1 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 px-3 py-1.5 font-semibold">
              Paper Sections
            </div>
            {sections.map((sec, idx) => {
              const isSelected = sec.id === activeSection?.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSectionId(sec.id);
                    setActiveTab("editor");
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/10 border border-sky-500/30 text-white font-medium"
                      : "border border-transparent hover:bg-[#141c2e] text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-mono text-sky-400">§ {idx + 1}</span>
                      {sec.status === "edited" && (
                        <span className="text-emerald-400">• edited</span>
                      )}
                      {sec.status === "pending_user" && (
                        <span className="text-rose-400">• user input</span>
                      )}
                    </div>
                    <div className="text-xs truncate font-medium">
                      {sec.title}
                    </div>
                  </div>

                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    {sec.word_count || 0}w
                  </span>
                </button>
              );
            })}
          </div>

          {/* Discovered Sources Mini Registry */}
          <div className="p-3.5 border-t border-[#1e293b] bg-[#0f1523]">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-medium">
              <span>QUICK INSERT CITATION</span>
              <span>{sources.length} sources</span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {sources.slice(0, 8).map((src, idx) => (
                <button
                  key={src.id || idx}
                  onClick={() => insertCitation(`[${idx + 1}]`)}
                  className="w-full text-left p-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] rounded-md text-[11px] truncate text-slate-300 hover:text-sky-300 flex items-center justify-between transition-colors"
                  title={`Click to insert citation [${idx + 1}]`}
                >
                  <span className="truncate">{idx + 1}. {src.title}</span>
                  <Plus className="w-3 h-3 text-sky-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Active Section Editor */}
        {activeTab === "editor" && (
          <main className="flex-1 flex flex-col bg-[#090d16] overflow-hidden">
            {/* Section Action Toolbar */}
            <div className="bg-[#0b0f19] border-b border-[#1e293b] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  Editing Section:
                </span>
                <span className="font-serif text-base text-white font-medium">
                  {activeSection?.title || "Select a section"}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({activeSectionContent.split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>

              {/* Section AI Transformation Cluster */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => activeSection && onTransformSection(activeSection.section_key, "clarity")}
                  className="px-2.5 py-1 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-sky-500/40 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer font-medium"
                  title="Rewrite to make writing clearer and more academic"
                >
                  Improve Clarity
                </button>
                <button
                  onClick={() => activeSection && onTransformSection(activeSection.section_key, "expand")}
                  className="px-2.5 py-1 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-md transition-colors cursor-pointer font-medium"
                  title="Add more depth and detail from sources"
                >
                  Expand
                </button>
                <button
                  onClick={() => activeSection && onTransformSection(activeSection.section_key, "shorten")}
                  className="px-2.5 py-1 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-md transition-colors cursor-pointer font-medium"
                  title="Make text more concise and direct"
                >
                  Shorten
                </button>
                <button
                  onClick={() => activeSection && onRegenerateSection(activeSection.section_key)}
                  className="px-2.5 py-1 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-sky-500/40 text-sky-400 hover:text-sky-300 rounded-md transition-colors cursor-pointer font-medium"
                  title="Regenerate this section from sources"
                >
                  Regenerate
                </button>
              </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-4xl w-full mx-auto">
              <div className="bg-[#0f1523] border border-[#1e293b] shadow-2xl p-6 sm:p-10 rounded-2xl min-h-[70vh] flex flex-col">
                {/* Academic Section Heading */}
                <h2 className="font-serif text-2xl text-white font-normal mb-6 pb-3 border-b border-[#1e293b]">
                  {activeSection?.title}
                </h2>

                {/* Section Body Textarea */}
                <textarea
                  value={activeSectionContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Draft content for this section..."
                  className="flex-1 w-full bg-transparent text-slate-100 text-sm leading-relaxed font-sans placeholder-slate-500 focus:outline-none resize-none min-h-[500px]"
                />
              </div>
            </div>
          </main>
        )}

        {/* Tab: Formatted Bibliography */}
        {activeTab === "references" && (
          <main className="flex-1 flex flex-col bg-[#090d16] overflow-hidden">
            <div className="bg-[#0b0f19] border-b border-[#1e293b] px-6 py-3 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  References &amp; Citations
                </span>
                <h2 className="font-serif text-lg text-white font-medium">
                  Formatted in {paper.citation_style || "APA 7"} Style
                </h2>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(formattedReferences);
                  setCopiedRef(true);
                  setTimeout(() => setCopiedRef(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-xs font-medium text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? "Copied" : "Copy References"}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto">
              <div className="bg-[#0f1523] border border-[#1e293b] p-8 rounded-2xl shadow-lg space-y-4 font-serif text-sm text-slate-200 leading-relaxed">
                {formattedReferences ? (
                  formattedReferences.split("\n\n").map((entry, idx) => (
                    <div key={idx} className="pl-6 -indent-6 border-b border-[#1e293b]/50 pb-3">
                      {entry}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic font-sans">No references generated yet.</p>
                )}
              </div>
            </div>
          </main>
        )}

        {/* Tab: Draft Version History & Revisions */}
        {activeTab === "history" && (
          <main className="flex-1 flex flex-col bg-[#090d16] overflow-hidden">
            <div className="bg-[#0b0f19] border-b border-[#1e293b] px-6 py-3 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                  Version Archive
                </span>
                <h2 className="font-serif text-lg text-white font-medium">
                  Save draft checkpoints and restore previous versions
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 max-w-3xl w-full mx-auto space-y-6">
              {/* Snapshot Creator */}
              <div className="bg-[#0f1523] border border-[#1e293b] p-5 rounded-2xl space-y-3 shadow-sm">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white">
                  Save Version Checkpoint
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={revisionLabelInput}
                    onChange={(e) => setRevisionLabelInput(e.target.value)}
                    placeholder="e.g., Draft with refined methodology and literature review"
                    className="flex-1 bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 px-3.5 py-2 text-xs text-white focus:outline-none rounded-xl"
                  />
                  <button
                    onClick={handleCreateSnapshot}
                    disabled={isCreatingRevision}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-50 rounded-xl transition-all shadow-sm"
                  >
                    {isCreatingRevision ? "Saving..." : "Save Version"}
                  </button>
                </div>
              </div>

              {/* Saved Snapshots List */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Saved Versions ({revisions.length})
                </div>
                {revisions.length === 0 ? (
                  <div className="p-8 text-center bg-[#0f1523] border border-[#1e293b] text-xs text-slate-400 rounded-2xl">
                    No saved checkpoints yet. Click 'Save Version' to checkpoint your current draft.
                  </div>
                ) : (
                  revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-[#0f1523] border border-[#1e293b] p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs text-white font-medium">
                          {rev.revision_label}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {new Date(rev.created_at).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestore(rev.id)}
                        className="px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-sky-500/40 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer rounded-lg"
                      >
                        Restore Version
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Originality Audit Modal */}
      <PaperOriginalityModal
        isOpen={isOriginalityModalOpen}
        onClose={() => setIsOriginalityModalOpen(false)}
        report={originalityReport}
        findings={originalityFindings}
        onApplySuggestion={handleApplyOriginalitySuggestion}
        onRerunCheck={handleAuditOriginality}
        isLoading={isAuditing}
      />
    </div>
  );
};
