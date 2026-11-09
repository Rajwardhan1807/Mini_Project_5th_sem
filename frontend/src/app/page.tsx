"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { ArchivalSidebar, DocketTab } from "@/components/ArchivalSidebar";
import { HeroSection } from "@/components/HeroSection";
import { AgentTimeline } from "@/components/AgentTimeline";
import { MetricsBar } from "@/components/MetricsBar";
import { ReportView } from "@/components/ReportView";
import { ClaimConflictExplorer } from "@/components/ClaimConflictExplorer";
import { SourceExplorer } from "@/components/SourceExplorer";
import { DocumentModal } from "@/components/DocumentModal";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { SystemStatusModal } from "@/components/SystemStatusModal";
import { PaperStudio } from "@/components/paper/PaperStudio";
import {
  api,
  ResearchSession,
  Source,
  Claim,
  Report,
  TimelineEvent,
} from "@/lib/api";
import {
  FileText,
  FolderOpen,
  ArrowLeft,
  Plus,
  Loader2,
  GitCompare,
  FileCheck2,
  Download,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Navigation state
  const [activeDocketTab, setActiveDocketTab] = useState<DocketTab>("home");
  const [activeSubTab, setActiveSubTab] = useState<"report" | "claims" | "sources">("report");

  // All completed sessions for "My Reports" view
  const [allSessions, setAllSessions] = useState<ResearchSession[]>([]);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Initial Health & History Check
  useEffect(() => {
    api.getHealth()
      .then((h) => setHealth(h))
      .catch((e) => console.error("Health check error:", e));

    loadAllSessions();
  }, []);

  const loadAllSessions = () => {
    api.getHistory()
      .then((sess) => setAllSessions(sess))
      .catch(() => {});
  };

  // Fetch full session data
  const loadFullSession = async (id: string) => {
    try {
      const sess = await api.getSession(id);
      setSession(sess);

      const [srcs, clms] = await Promise.all([
        api.getSources(id).catch(() => []),
        api.getClaims(id).catch(() => []),
      ]);
      setSources(srcs);
      setClaims(clms);

      if (sess.status === "completed") {
        const rep = await api.getReport(id).catch(() => null);
        setReport(rep);
      }

      const events = await api.getTimeline(id).catch(() => []);
      setTimelineEvents(events);
    } catch (err) {
      console.error("Error loading session:", err);
    }
  };

  // Connect to SSE stream for live updates
  const connectSSE = (researchId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sse = new EventSource(api.getStreamUrl(researchId));
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "agent_progress") {
          setTimelineEvents((prev) => [
            ...prev,
            {
              agent: data.agent,
              step: data.step,
              detail: data.detail,
              timestamp: data.timestamp,
            },
          ]);
          setSession((prev) =>
            prev ? { ...prev, current_step: `${data.agent}: ${data.step}` } : prev
          );
        } else if (data.type === "state_update") {
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  statistics: data.statistics || prev.statistics,
                  agents: data.agents || prev.agents,
                  confidence: data.confidence !== undefined ? data.confidence : prev.confidence,
                }
              : prev
          );
          // Refetch sources and claims as they populate
          api.getSources(researchId).then(setSources).catch(() => {});
          api.getClaims(researchId).then(setClaims).catch(() => {});
        } else if (data.type === "completed") {
          setIsLoading(false);
          loadFullSession(researchId);
          loadAllSessions();
          sse.close();
        } else if (data.type === "error") {
          setIsLoading(false);
          sse.close();
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    sse.onerror = () => {
      // Stream closed or error
    };
  };

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Polling fallback to guarantee state completes even if SSE drops
  useEffect(() => {
    if (!activeSessionId || !isLoading) return;

    const interval = setInterval(async () => {
      try {
        const sess = await api.getSession(activeSessionId);
        setSession(sess);

        if (sess.status === "completed" || sess.status === "failed") {
          setIsLoading(false);
          loadFullSession(activeSessionId);
          loadAllSessions();
          clearInterval(interval);
        }
      } catch (e) {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSessionId, isLoading]);

  // Start research handler
  const handleStartResearch = async (
    query: string,
    mode: "quick" | "deep" | "document",
    documentIds: string[] = []
  ) => {
    setIsLoading(true);
    setSession(null);
    setSources([]);
    setClaims([]);
    setReport(null);
    setTimelineEvents([]);
    setActiveDocketTab("home");
    setActiveSubTab("report");

    try {
      const res = await api.startResearch(query, mode, documentIds);
      setActiveSessionId(res.research_id);

      // Initialize local state immediately
      const initialSession: ResearchSession = {
        id: res.research_id,
        query,
        mode,
        status: "started",
        confidence: 0,
        statistics: {
          sources_discovered: 0,
          sources_relevant: 0,
          claims_identified: 0,
          claims_verified: 0,
          conflicts_detected: 0,
          overall_confidence: 0,
        },
        agents: {
          researcher: "running",
          fact_checker: "waiting",
          writer: "waiting",
        },
        current_step: "Initializing ResearchForge agents...",
        created_at: new Date().toISOString(),
      };
      setSession(initialSession);

      connectSSE(res.research_id);
    } catch (err: any) {
      alert("Failed to start research: " + err.message);
      setIsLoading(false);
    }
  };

  const handleDocumentReady = (docId: string, filename: string) => {
    handleStartResearch(
      `Document Analysis: ${filename}`,
      "document",
      [docId]
    );
  };

  const handleSelectHistorySession = (id: string) => {
    setActiveSessionId(id);
    setActiveDocketTab("home");
    loadFullSession(id);
  };

  const handleResetToHome = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setActiveSessionId(null);
    setSession(null);
    setSources([]);
    setClaims([]);
    setReport(null);
    setTimelineEvents([]);
    setIsLoading(false);
    setActiveDocketTab("home");
  };

  const handleDownloadSessionPdf = async (sessId: string, title: string) => {
    setDownloadingReportId(sessId);
    try {
      const blob = await api.downloadResearchReport(sessId, "pdf");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 35) || "Report";
      a.download = `ResearchForge_${safeTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("PDF download failed: " + (err.message || "Unknown error"));
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleDocketSelect = (tab: DocketTab) => {
    if (tab === "home") {
      setActiveDocketTab("home");
      return;
    }
    if (tab === "new_research") {
      handleResetToHome();
      return;
    }
    if (tab === "documents") {
      setIsDocumentModalOpen(true);
      return;
    }
    if (tab === "history") {
      setIsHistoryOpen(true);
      return;
    }
    if (tab === "settings") {
      setIsSystemModalOpen(true);
      return;
    }
    if (tab === "reports") {
      loadAllSessions();
      setActiveDocketTab("reports");
      return;
    }
    setActiveDocketTab(tab);
  };

  const isResearchActive = Boolean(session && activeSessionId);

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f1f5f9] font-sans antialiased flex flex-col">
      {/* Clean Simplified Sidebar */}
      <ArchivalSidebar
        activeTab={activeDocketTab}
        onSelectTab={handleDocketSelect}
        backendHealth={health}
        onNewResearch={handleResetToHome}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        sourcesCount={sources.length}
        claimsCount={claims.length}
        hasReport={Boolean(report)}
      />

      {/* Top Header Bar */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDocuments={() => setIsDocumentModalOpen(true)}
        onNewResearch={handleResetToHome}
        onOpenPaperStudio={() => setActiveDocketTab("paper_studio")}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        activeSessionId={activeSessionId}
        mode={session?.mode}
        backendHealth={health}
      />

      {/* Main Content Area */}
      <main className="md:pl-72 pt-13 min-h-screen flex-1 flex flex-col bg-[#090d16]">
        {activeDocketTab === "paper_studio" ? (
          <PaperStudio onBackToArchival={() => setActiveDocketTab("home")} />
        ) : activeDocketTab === "reports" ? (
          /* ── My Reports View ─────────────────────────────────────────────── */
          <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="border border-[#1e293b] bg-[#0f1523] p-6 sm:p-7 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Research Library</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                  Completed Research Reports
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Browse, review, and download formatted PDF dossiers for all completed research sessions.
                </p>
              </div>

              <button
                onClick={handleResetToHome}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Research</span>
              </button>
            </div>

            {/* Reports List */}
            {allSessions.filter((s) => s.status === "completed").length === 0 ? (
              <div className="p-12 border border-[#1e293b] bg-[#0f1523] text-center space-y-3 rounded-2xl">
                <FileCheck2 className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-semibold text-white">
                  No Completed Reports Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Submit a research inquiry from the home screen. Once the autonomous agents finish collecting and checking evidence, your report will appear here.
                </p>
                <button
                  onClick={handleResetToHome}
                  className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Start First Research
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allSessions
                  .filter((s) => s.status === "completed")
                  .map((sess) => (
                    <article
                      key={sess.id}
                      className="border border-[#1e293b] hover:border-slate-700 bg-[#0f1523] p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all shadow-sm"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/25 bg-sky-500/10 font-medium">
                            {sess.mode} Research
                          </span>
                          <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                            <Calendar className="w-3 h-3" />
                            {new Date(sess.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg text-white font-medium leading-snug">
                          {sess.query}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                          <span>{sess.statistics?.sources_relevant || 0} sources</span>
                          <span>&bull;</span>
                          <span className="text-emerald-400 font-semibold">
                            {sess.confidence ? `${Math.round(sess.confidence)}% confidence` : "Verified"}
                          </span>
                        </div>
                      </div>

                      {/* Download & View Actions */}
                      <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleSelectHistorySession(sess.id)}
                          className="px-3.5 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-slate-200 hover:text-white text-xs font-medium transition-all cursor-pointer rounded-lg"
                        >
                          View Report
                        </button>

                        <button
                          onClick={() => handleDownloadSessionPdf(sess.id, sess.query)}
                          disabled={downloadingReportId === sess.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all cursor-pointer rounded-lg disabled:opacity-50 shadow-sm"
                        >
                          {downloadingReportId === sess.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {!isResearchActive ? (
              /* ── Redesigned Home Screen ─────────────────────────────────── */
              <HeroSection
                onStartResearch={handleStartResearch}
                isLoading={isLoading}
                onOpenDocuments={() => setIsDocumentModalOpen(true)}
                onSelectSession={handleSelectHistorySession}
                onOpenPaperStudio={() => setActiveDocketTab("paper_studio")}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onViewReports={() => {
                  loadAllSessions();
                  setActiveDocketTab("reports");
                }}
              />
            ) : (
              /* ── Active Research Dossier ────────────────────────────────── */
              <div className="space-y-6">
                {/* Top Dossier Title & Navigation Banner */}
                <div className="p-4 sm:p-5 bg-[#0f1523] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={handleResetToHome}
                      className="p-2 border border-[#1e293b] bg-[#141c2e] hover:border-sky-500/40 text-slate-400 hover:text-white transition-all cursor-pointer mt-0.5 shrink-0 rounded-lg"
                      title="Back to Overview"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-[11px] text-sky-300 uppercase px-2.5 py-0.5 border border-sky-500/25 bg-sky-500/10 font-semibold rounded-full">
                          {session?.mode} Research
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Ref: {session?.id.slice(0, 12)}
                        </span>
                      </div>
                      <h1 className="font-serif text-xl sm:text-2xl text-white mt-1 tracking-tight font-normal">
                        {session?.query}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick Download PDF button if report is already available */}
                    {report && (
                      <button
                        onClick={() => session && handleDownloadSessionPdf(session.id, session.query)}
                        disabled={downloadingReportId === session?.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all cursor-pointer rounded-lg disabled:opacity-50 shadow-sm"
                        title="Download complete research report as PDF"
                      >
                        {downloadingReportId === session?.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>PDF...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={handleResetToHome}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-white transition-all text-xs font-medium cursor-pointer rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-400" />
                      <span>New Research</span>
                    </button>
                  </div>
                </div>

                {/* Step 4: Simple, Clear Research Progress Timeline */}
                {session && (
                  <AgentTimeline
                    agents={session.agents}
                    events={timelineEvents}
                    currentStep={session.current_step}
                  />
                )}

                {/* Metrics Summary Strip */}
                {session && (
                  <MetricsBar
                    statistics={session.statistics}
                    modelName={health?.ollama?.model}
                  />
                )}

                {/* Operational Sub-Tabs */}
                <div className="border-b border-[#1e293b] flex items-center gap-6 text-xs font-medium">
                  <button
                    onClick={() => setActiveSubTab("report")}
                    className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                      activeSubTab === "report"
                        ? "border-sky-400 text-sky-300 font-semibold"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Research Report</span>
                    {report && <span className="text-emerald-400 font-medium text-[11px]">&bull; Ready</span>}
                  </button>

                  <button
                    onClick={() => setActiveSubTab("claims")}
                    className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                      activeSubTab === "claims"
                        ? "border-sky-400 text-sky-300 font-semibold"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>Fact-Checking &amp; Conflicts ({claims.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab("sources")}
                    className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                      activeSubTab === "sources"
                        ? "border-sky-400 text-sky-300 font-semibold"
                        : "border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Sources &amp; Evidence ({sources.length})</span>
                  </button>
                </div>

                {/* Active Sub-Tab View */}
                {activeSubTab === "report" && (
                  <div>
                    {report ? (
                      <ReportView
                        report={report}
                        query={session?.query || ""}
                        researchId={session?.id}
                        sources={sources}
                        claims={claims}
                      />
                    ) : (
                      <div className="p-10 border border-[#1e293b] bg-[#0f1523] text-center space-y-3 rounded-xl shadow-sm">
                        <Loader2 className="w-6 h-6 text-sky-400 animate-spin mx-auto" />
                        <h3 className="text-sm font-semibold text-slate-100">
                          Preparing Your Research Report...
                        </h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                          Our Writer Agent is currently synthesizing collected findings, cross-checking facts, and formatting the downloadable report.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeSubTab === "claims" && (
                  <ClaimConflictExplorer claims={claims} />
                )}

                {activeSubTab === "sources" && (
                  <SourceExplorer sources={sources} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onDocumentReady={handleDocumentReady}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectHistorySession}
      />

      <SystemStatusModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        backendHealth={health}
      />
    </div>
  );
}
