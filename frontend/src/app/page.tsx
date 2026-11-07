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
    <div className="min-h-screen bg-[#08090b] text-[#e1e2eb] font-sans antialiased flex flex-col">
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
      <main className="md:pl-72 pt-12 min-h-screen flex-1 flex flex-col bg-[#08090b]">
        {activeDocketTab === "paper_studio" ? (
          <PaperStudio onBackToArchival={() => setActiveDocketTab("home")} />
        ) : activeDocketTab === "reports" ? (
          /* ── My Reports View ─────────────────────────────────────────────── */
          <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="border border-[#222735] bg-[#0b0e14] p-6 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#ffb77d] mb-1">
                  <FileCheck2 className="w-4 h-4 text-[#ffb77d]" />
                  <span>My Reports</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#f1f5f9] font-normal">
                  Completed Research Reports
                </h1>
                <p className="text-sm text-[#dbc2b0] mt-1 max-w-xl">
                  Browse, review, and download PDF reports for all completed research sessions.
                </p>
              </div>

              <button
                onClick={handleResetToHome}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#d97706] hover:bg-[#ffb77d] text-[#08090b] font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Research</span>
              </button>
            </div>

            {/* Reports List */}
            {allSessions.filter((s) => s.status === "completed").length === 0 ? (
              <div className="p-12 border border-[#222735] bg-[#0e1117] text-center space-y-3 font-mono rounded-sm">
                <FileCheck2 className="w-8 h-8 text-[#a38c7c] mx-auto" />
                <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">
                  No Completed Reports Yet
                </h3>
                <p className="text-xs text-[#a38c7c] max-w-md mx-auto">
                  Start a research query from the home screen. Once the research process completes, your report will appear here.
                </p>
                <button
                  onClick={handleResetToHome}
                  className="mt-2 px-4 py-2 bg-[#d97706] hover:bg-[#ffb77d] text-[#08090b] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-sm"
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
                      className="border border-[#222735] hover:border-[#32353c] bg-[#0e1117] p-5 rounded-sm flex flex-col justify-between space-y-4 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#ffb77d] uppercase px-2 py-0.5 border border-[#d97706]/40 bg-[#d97706]/10 rounded-sm">
                            {sess.mode} Research
                          </span>
                          <span className="text-[#a38c7c] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(sess.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg text-[#f1f5f9] font-medium leading-snug">
                          {sess.query}
                        </h3>

                        <div className="flex items-center gap-3 text-xs font-mono text-[#a38c7c] pt-1">
                          <span>{sess.statistics?.sources_relevant || 0} sources</span>
                          <span>&bull;</span>
                          <span className="text-[#4edea3]">
                            {sess.confidence ? `${Math.round(sess.confidence)}% confidence` : "Verified"}
                          </span>
                        </div>
                      </div>

                      {/* Download & View Actions */}
                      <div className="pt-3 border-t border-[#222735] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleSelectHistorySession(sess.id)}
                          className="px-3 py-1.5 bg-[#14171e] hover:bg-[#1d2026] border border-[#222735] hover:border-[#ffb77d] text-[#e1e2eb] font-mono text-xs transition-colors cursor-pointer rounded-sm"
                        >
                          View Report
                        </button>

                        <button
                          onClick={() => handleDownloadSessionPdf(sess.id, sess.query)}
                          disabled={downloadingReportId === sess.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d97706] hover:bg-[#ffb77d] text-[#08090b] font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-sm disabled:opacity-50"
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
              />
            ) : (
              /* ── Active Research Dossier ────────────────────────────────── */
              <div className="space-y-6">
                {/* Top Dossier Title & Navigation Banner */}
                <div className="p-4 sm:p-5 bg-[#0b0e14] border border-[#222735] flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={handleResetToHome}
                      className="p-1.5 border border-[#222735] bg-[#101319] hover:border-[#ffb77d] text-[#a38c7c] hover:text-[#f1f5f9] transition-colors cursor-pointer mt-0.5 shrink-0 rounded-sm"
                      title="Back to Home"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-[#ffb77d] uppercase px-2 py-0.5 border border-[#d97706]/40 bg-[#d97706]/10 font-bold rounded-sm">
                          {session?.mode} Research
                        </span>
                        <span className="text-[#a38c7c]">
                          Ref: {session?.id.slice(0, 12)}
                        </span>
                      </div>
                      <h1 className="font-serif text-xl sm:text-2xl text-[#f1f5f9] mt-1 tracking-tight font-medium">
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d97706] hover:bg-[#ffb77d] text-[#08090b] font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-sm disabled:opacity-50"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#191c22] hover:bg-[#272a31] border border-[#222735] hover:border-[#a38c7c] text-[#f1f5f9] transition-colors font-mono text-xs uppercase cursor-pointer rounded-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#ffb77d]" />
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
                <div className="border-b border-[#222735] flex items-center gap-4 text-xs font-mono">
                  <button
                    onClick={() => setActiveSubTab("report")}
                    className={`pb-2.5 border-b-2 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeSubTab === "report"
                        ? "border-[#ffb77d] text-[#ffb77d] font-bold"
                        : "border-transparent text-[#a38c7c] hover:text-[#f1f5f9]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Research Report</span>
                    {report && <span className="text-[#4edea3] font-bold">&bull; Ready</span>}
                  </button>

                  <button
                    onClick={() => setActiveSubTab("claims")}
                    className={`pb-2.5 border-b-2 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeSubTab === "claims"
                        ? "border-[#ffb77d] text-[#ffb77d] font-bold"
                        : "border-transparent text-[#a38c7c] hover:text-[#f1f5f9]"
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Fact-Checking &amp; Conflicts ({claims.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab("sources")}
                    className={`pb-2.5 border-b-2 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeSubTab === "sources"
                        ? "border-[#ffb77d] text-[#ffb77d] font-bold"
                        : "border-transparent text-[#a38c7c] hover:text-[#f1f5f9]"
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
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
                      <div className="p-10 border border-[#222735] bg-[#0e1117] text-center space-y-3 font-mono rounded-sm">
                        <Loader2 className="w-6 h-6 text-[#ffb77d] animate-spin mx-auto" />
                        <h3 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">
                          Preparing Your Research Report...
                        </h3>
                        <p className="text-xs text-[#a38c7c] max-w-md mx-auto">
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
