"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Sparkles,
  Layers,
  History,
  FolderOpen,
  FileCheck2,
  ListTree,
  FileEdit,
  RotateCw,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  Paper,
  PaperSection,
  PaperSource,
  PaperJob,
  paperApi,
} from "@/lib/api";
import { PaperConfigView } from "./PaperConfigView";
import { PaperPlanView } from "./PaperPlanView";
import { PaperSourceView } from "./PaperSourceView";
import { PaperEditorView } from "./PaperEditorView";
import { PaperArchiveModal } from "./PaperArchiveModal";
import { PaperExportPanel } from "./PaperExportPanel";
import { ExportMeta } from "@/lib/api";

interface PaperStudioProps {
  onBackToArchival?: () => void;
}

export const PaperStudio: React.FC<PaperStudioProps> = ({ onBackToArchival }) => {
  const [currentPaperId, setCurrentPaperId] = useState<string | null>(null);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [sections, setSections] = useState<PaperSection[]>([]);
  const [sources, setSources] = useState<PaperSource[]>([]);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<PaperJob | null>(null);
  const [studioStage, setStudioStage] = useState<"config" | "plan" | "sources" | "editor">("config");
  const [showExportPanel, setShowExportPanel] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load papers on mount
  useEffect(() => {
    loadAllPapers();
  }, []);

  const loadAllPapers = async () => {
    try {
      const papers = await paperApi.listPapers();
      setAllPapers(papers);
      // If there's at least one paper and none selected, or current paper was updated
      if (papers.length > 0 && !currentPaperId) {
        // We can either start in config or load the latest
      }
    } catch (e) {
      console.error("Failed to load papers:", e);
    }
  };

  const loadPaper = async (paperId: string) => {
    try {
      setIsLoading(true);
      const paper = await paperApi.getPaper(paperId);
      setCurrentPaper(paper);
      setCurrentPaperId(paper.id);

      const [secs, ev] = await Promise.all([
        paperApi.getSections(paperId).catch(() => []),
        paperApi.getEvidence(paperId).catch(() => ({ sources: [], originality_findings: [] })),
      ]);
      setSections(secs);
      setSources(ev.sources || []);

      // Determine stage
      if (paper.status === "completed" || secs.length > 0) {
        setStudioStage("editor");
      } else if (paper.current_stage === "sources" || (ev.sources && ev.sources.length > 0)) {
        setStudioStage("sources");
      } else if (paper.current_stage === "plan" || paper.plan) {
        setStudioStage("plan");
      } else {
        setStudioStage("config");
      }
    } catch (e) {
      console.error("Error loading paper:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Job Polling
  const startJobPolling = (paperId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const st = await paperApi.getPaperStatus(paperId);
        if (st.job) {
          setActiveJob(st.job);
          if (st.job.stage?.startsWith("drafting")) {
            // Live progressive load of drafted sections
            const secs = await paperApi.getSections(paperId);
            if (secs && secs.length > 0) {
              setSections(secs);
            }
          }
          if (st.job.status === "done" || st.job.status === "failed") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsLoading(false);
            await loadPaper(paperId);
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // 1. Create Paper & Generate Plan
  const handleStartPlanning = async (config: Partial<Paper>) => {
    try {
      setIsLoading(true);
      const newPaper = await paperApi.createPaper(config);
      setCurrentPaperId(newPaper.id);
      setCurrentPaper(newPaper);

      // Trigger plan generation
      await paperApi.generatePlan(newPaper.id);
      startJobPolling(newPaper.id);
      setStudioStage("plan");
    } catch (e) {
      console.error("Failed to start plan:", e);
      setIsLoading(false);
    }
  };

  // 2. Approve Plan & Collect Sources
  const handleApprovePlan = async (updatedPlan: any) => {
    if (!currentPaperId) return;
    try {
      setIsLoading(true);
      // Save updated plan
      await paperApi.updatePaper(currentPaperId, {
        plan: updatedPlan,
        current_stage: "sources",
      });

      // Start source discovery
      await paperApi.collectSources(currentPaperId);
      startJobPolling(currentPaperId);
      setStudioStage("sources");
    } catch (e) {
      console.error("Failed to approve plan:", e);
      setIsLoading(false);
    }
  };

  // Regenerate Plan
  const handleRegeneratePlan = async () => {
    if (!currentPaperId) return;
    try {
      setIsLoading(true);
      await paperApi.generatePlan(currentPaperId);
      startJobPolling(currentPaperId);
    } catch (e) {
      console.error("Failed to regenerate plan:", e);
      setIsLoading(false);
    }
  };

  // 3. Draft Complete Paper
  const handleDraftPaper = async () => {
    if (!currentPaperId) return;
    try {
      setIsLoading(true);
      await paperApi.generatePaper(currentPaperId);
      startJobPolling(currentPaperId);
      setStudioStage("editor");
    } catch (e) {
      console.error("Failed to start drafting:", e);
      setIsLoading(false);
    }
  };

  // Manual source addition
  const handleAddManualSource = async (src: Partial<PaperSource>) => {
    if (!currentPaperId) return;
    const added = await paperApi.addSource(currentPaperId, src);
    setSources((prev) => [added, ...prev]);
  };

  // Section Updates
  const handleUpdateSection = async (sectionId: string, content: string) => {
    if (!currentPaperId) return;
    const updated = await paperApi.updateSection(currentPaperId, sectionId, content);
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? updated : s))
    );
  };

  // Transform Section
  const handleTransformSection = async (sectionKey: string, action: "clarity" | "expand" | "shorten") => {
    if (!currentPaperId) return;
    setIsLoading(true);
    try {
      const updated = await paperApi.transformSection(currentPaperId, sectionKey, action);
      setSections((prev) =>
        prev.map((s) => (s.section_key === sectionKey ? updated : s))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate Single Section
  const handleRegenerateSection = async (sectionKey: string) => {
    if (!currentPaperId) return;
    setIsLoading(true);
    try {
      const updated = await paperApi.regenerateSection(currentPaperId, sectionKey);
      setSections((prev) =>
        prev.map((s) => (s.section_key === sectionKey ? updated : s))
      );
    } catch (e) {
      console.error("Failed to regenerate section:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Change Citation Style
  const handleChangeCitationStyle = async (style: string) => {
    if (!currentPaperId) return;
    try {
      const res = await paperApi.changeCitationStyle(currentPaperId, style);
      if (currentPaper) {
        setCurrentPaper({ ...currentPaper, citation_style: style });
      }
      // Refresh sections to pick up updated References
      const secs = await paperApi.getSections(currentPaperId);
      setSections(secs);
    } catch (e) {
      console.error("Failed to change citation style:", e);
    }
  };

  // Export Paper
  const handleExport = async (format: "markdown" | "docx" | "pdf", meta: ExportMeta = {}) => {
    if (!currentPaperId || !currentPaper) return;
    try {
      const blob = await paperApi.exportPaperWithMeta(currentPaperId, format, meta);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = currentPaper.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
      const ext = format === "markdown" ? "md" : format;
      a.download = `${safeTitle}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e: any) {
      console.error("Export error:", e);
      throw e; // Re-throw so PaperExportPanel can show the error
    }
  };

  // Save Revision Snapshot
  const handleSaveRevision = async (label?: string) => {
    if (!currentPaperId) return;
    await paperApi.createRevision(currentPaperId, label);
  };

  // Restore Revision Snapshot
  const handleRestoreRevision = async (revId: string) => {
    if (!currentPaperId) return;
    await paperApi.restoreRevision(currentPaperId, revId);
    await loadPaper(currentPaperId);
  };

  const handleDeletePaper = async (paperId: string) => {
    await paperApi.deletePaper(paperId);
    if (currentPaperId === paperId) {
      setCurrentPaperId(null);
      setCurrentPaper(null);
      setSections([]);
      setSources([]);
      setStudioStage("config");
    }
    loadAllPapers();
  };

  const handleNewPaper = () => {
    setCurrentPaperId(null);
    setCurrentPaper(null);
    setSections([]);
    setSources([]);
    setActiveJob(null);
    setStudioStage("config");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#090d16]">
      {/* Top Header / Stage Nav */}
      <div className="bg-[#0b0f19] border-b border-[#1e293b] px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Research Paper Studio</span>
          </div>

          {/* Stepper */}
          {currentPaper && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs border-l border-[#1e293b] pl-3">
              {[
                { id: "config", label: "1. Scope" },
                { id: "plan", label: "2. Plan" },
                { id: "sources", label: "3. Sources" },
                { id: "editor", label: "4. Editor" },
              ].map((step, idx) => (
                <React.Fragment key={step.id}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                  <button
                    onClick={() => setStudioStage(step.id as any)}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer font-medium ${
                      studioStage === step.id
                        ? "text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {step.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              loadAllPapers();
              setIsArchiveOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer rounded-lg font-medium"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Saved Papers ({allPapers.length})</span>
          </button>

          {studioStage === "editor" && currentPaper && (
            <button
              onClick={() => setShowExportPanel((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                showExportPanel
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-[#141c2e] hover:bg-[#1a243a] border-[#1e293b] hover:border-amber-500/30 text-slate-300 hover:text-white"
              }`}
              title="Open / close export panel"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export Paper</span>
            </button>
          )}

          <button
            onClick={handleNewPaper}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-amber-500/40 text-slate-300 hover:text-white transition-all cursor-pointer rounded-lg font-medium"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">New Paper</span>
          </button>
        </div>
      </div>

      {/* Generation Job Status Notification Banner */}
      {activeJob && activeJob.status === "running" && (
        <div className="bg-[#141c2e] border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Autonomous Pipeline Running: Stage [{activeJob.stage}] ({activeJob.progress}%)</span>
          </div>
          <span className="text-slate-400">{activeJob.stage} in progress...</span>
        </div>
      )}

      {/* Main View Area based on stage */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Export Panel overlay when in editor stage */}
        {studioStage === "editor" && currentPaper && showExportPanel && (
          <div className="flex-1">
            <PaperExportPanel
              paper={currentPaper}
              sections={sections}
              sources={sources}
              onExport={handleExport}
              onClose={() => setShowExportPanel(false)}
            />
          </div>
        )}

        {!showExportPanel && (
          <>
            {studioStage === "config" && (
              <PaperConfigView
                onStartPlanning={handleStartPlanning}
                isLoading={isLoading}
              />
            )}

            {studioStage === "plan" && currentPaper && (
              <PaperPlanView
                paper={currentPaper}
                onApprovePlan={handleApprovePlan}
                onRegeneratePlan={handleRegeneratePlan}
                onBackToConfig={() => setStudioStage("config")}
                isLoading={isLoading}
              />
            )}

            {studioStage === "sources" && currentPaper && (
              <PaperSourceView
                paper={currentPaper}
                sources={sources}
                onDraftPaper={handleDraftPaper}
                onAddManualSource={handleAddManualSource}
                onDiscoverMore={() => currentPaperId && paperApi.collectSources(currentPaperId)}
                onBackToPlan={() => setStudioStage("plan")}
                isLoading={isLoading}
              />
            )}

            {studioStage === "editor" && currentPaper && (
              <PaperEditorView
                paper={currentPaper}
                sections={sections}
                sources={sources}
                onUpdateSection={handleUpdateSection}
                onRegenerateSection={handleRegenerateSection}
                onTransformSection={handleTransformSection}
                onChangeCitationStyle={handleChangeCitationStyle}
                onExport={handleExport}
                onSaveRevision={handleSaveRevision}
                onRestoreRevision={handleRestoreRevision}
                onRefreshPaper={() => currentPaperId ? loadPaper(currentPaperId) : Promise.resolve()}
              />
            )}
          </>
        )}
      </div>

      {/* Archive Modal */}
      <PaperArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        papers={allPapers}
        onSelectPaper={(id) => loadPaper(id)}
        onDeletePaper={handleDeletePaper}
        onNewPaper={handleNewPaper}
      />
    </div>
  );
};
