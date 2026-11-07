"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  Zap,
  BookOpen,
  FileUp,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  FileText,
  GraduationCap,
} from "lucide-react";
import { api, ResearchSession } from "@/lib/api";

interface HeroSectionProps {
  onStartResearch: (query: string, mode: "quick" | "deep" | "document") => void;
  isLoading: boolean;
  onOpenDocuments?: () => void;
  onSelectSession?: (id: string) => void;
  onOpenPaperStudio?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartResearch,
  isLoading,
  onOpenDocuments,
  onSelectSession,
  onOpenPaperStudio,
}) => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"quick" | "deep" | "document">("deep");
  const [recentSessions, setRecentSessions] = useState<ResearchSession[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    // Fetch recent sessions
    setLoadingRecent(true);
    api.getHistory()
      .then((sess) => setRecentSessions(sess.slice(0, 4)))
      .catch(() => setRecentSessions([]))
      .finally(() => setLoadingRecent(false));

    // Fetch health
    api.getHealth()
      .then(setHealth)
      .catch(() => {});
  }, []);

  const demoPresets = [
    "Economic viability of nuclear energy vs solar in India",
    "Impact of AI code assistants on software developer jobs by 2030",
    "Solid-state batteries vs lithium-ion for commercial electric vehicles",
    "Post-quantum cryptography readiness for enterprise data",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    if (mode === "document" && onOpenDocuments) {
      onOpenDocuments();
      return;
    }
    onStartResearch(query.trim(), mode);
  };

  const isModelConnected = health?.ollama?.connected ?? true;
  const activeModel = health?.ollama?.model || "qwen3.5:latest";

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* ── Main Hero Masthead ────────────────────────────────────────────────── */}
      <section className="bg-[#101319] border border-[#222735] p-6 sm:p-10 rounded-sm">
        <div className="max-w-3xl space-y-3">
          {/* Local AI Availability Indicator */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#131720] border border-[#222735] text-[#e1e2eb] rounded-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  isModelConnected ? "bg-[#4edea3] animate-pulse" : "bg-[#ffb4ab]"
                }`}
              />
              <span>Local AI: {isModelConnected ? activeModel : "Connecting..."}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#191c22] border border-[#222735] text-[#4edea3] rounded-sm">
              <Shield className="w-3 h-3 text-[#4edea3]" />
              <span>100% Private &bull; &euro;0 Cost</span>
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#f1f5f9] tracking-tight font-normal leading-tight pt-1">
            What would you like to research today?
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-[#dbc2b0] font-sans leading-relaxed max-w-2xl">
            Enter a topic, and ResearchForge will find information, check evidence, and prepare a
            structured research report.
          </p>
        </div>

        {/* ── Research Input Box ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="border border-[#2a3142] focus-within:border-[#ffb77d] bg-[#0b0e14] transition-colors rounded-sm shadow-lg">
            <div className="flex items-center px-4 py-1.5">
              <Search className="w-5 h-5 text-[#a38c7c] shrink-0 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a research topic, question, or thesis statement..."
                disabled={isLoading}
                className="w-full bg-transparent text-[#f1f5f9] placeholder-[#a38c7c]/50 focus:outline-none text-base sm:text-lg py-3 font-sans"
              />
            </div>

            {/* Bottom Controls Bar inside Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#101319] border-t border-[#222735]">
              {/* Research Depth Options */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <span className="text-[#a38c7c] text-[11px] uppercase mr-1 hidden sm:inline">
                  Depth:
                </span>

                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border transition-colors cursor-pointer rounded-sm ${
                    mode === "quick"
                      ? "bg-[#ffb77d] text-[#08090b] border-[#ffb77d] font-bold"
                      : "bg-[#0b0e14] text-[#dbc2b0] border-[#222735] hover:border-[#a38c7c]"
                  }`}
                  title="Quick overview with 5-8 verified sources"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quick Research</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("deep")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border transition-colors cursor-pointer rounded-sm ${
                    mode === "deep"
                      ? "bg-[#ffb77d] text-[#08090b] border-[#ffb77d] font-bold"
                      : "bg-[#0b0e14] text-[#dbc2b0] border-[#222735] hover:border-[#a38c7c]"
                  }`}
                  title="Comprehensive exploration with 10-20 sources and full cross-examination"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Deep Research</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("document");
                    if (onOpenDocuments) onOpenDocuments();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border transition-colors cursor-pointer rounded-sm ${
                    mode === "document"
                      ? "bg-[#ffb77d] text-[#08090b] border-[#ffb77d] font-bold"
                      : "bg-[#0b0e14] text-[#dbc2b0] border-[#222735] hover:border-[#a38c7c]"
                  }`}
                  title="Upload a PDF or Word document to analyze"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Document Research</span>
                </button>
              </div>

              {/* Start Research Button */}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#d97706] hover:bg-[#ffb77d] text-[#08090b] font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 rounded-sm"
              >
                <span>{isLoading ? "Starting Research..." : "Start Research"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preset Prompts / Sample Questions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-[#a38c7c] font-mono text-[11px] uppercase mr-1">
              Sample topics:
            </span>
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(preset)}
                className="px-2.5 py-1 bg-[#14171e] hover:bg-[#1d2026] border border-[#222735] hover:border-[#ffb77d] text-[#dbc2b0] hover:text-[#ffb77d] transition-colors text-left cursor-pointer rounded-sm"
              >
                {preset}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* ── Direct Access: Academic Paper Studio ────────────────────────── */}
      {onOpenPaperStudio && (
        <section className="bg-gradient-to-r from-[#191c22] via-[#101319] to-[#191c22] border border-[#ffb77d]/30 p-5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-lg">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#ffb77d] uppercase tracking-wider font-bold">
              <GraduationCap className="w-4 h-4 text-[#ffb77d]" />
              <span>Need a Full Academic Research Paper?</span>
            </div>
            <p className="text-xs sm:text-sm text-[#dbc2b0] max-w-xl">
              Open the <strong>Research Paper Studio</strong> to formulate complete, multi-section papers with APA/IEEE citations, literature reviews, and downloadable PDF or Word (.docx) files.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPaperStudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffb77d] hover:bg-[#ffdcc3] text-[#4d2600] font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer shrink-0 rounded-sm relative z-10 shadow-md"
          >
            <span>Open Paper Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* ── How It Works: Step-by-Step Overview ────────────────────────────── */}
      <section className="bg-[#0e1117] border border-[#222735] p-6 rounded-sm">
        <div className="flex items-center justify-between border-b border-[#222735] pb-3 mb-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#ffb77d] font-semibold">
            <Layers className="w-4 h-4 text-[#ffb77d]" />
            <span>How ResearchForge Works</span>
          </div>
          <span className="text-xs text-[#a38c7c] font-mono">Simple 3-Stage Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#101319] border border-[#222735] space-y-2 rounded-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#ffb77d]">STEP 1</span>
              <Search className="w-4 h-4 text-[#a38c7c]" />
            </div>
            <h3 className="font-serif text-base text-[#f1f5f9] font-medium">Finding Sources</h3>
            <p className="text-xs text-[#a38c7c] leading-relaxed">
              Autonomous search discovers relevant academic papers, official records, and high-quality web articles.
            </p>
          </div>

          <div className="p-4 bg-[#101319] border border-[#222735] space-y-2 rounded-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#ffb77d]">STEP 2</span>
              <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
            </div>
            <h3 className="font-serif text-base text-[#f1f5f9] font-medium">Checking Facts</h3>
            <p className="text-xs text-[#a38c7c] leading-relaxed">
              Fact-check agent verifies claims against evidence, detects contradictions, and scores reliability.
            </p>
          </div>

          <div className="p-4 bg-[#101319] border border-[#222735] space-y-2 rounded-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#ffb77d]">STEP 3</span>
              <FileText className="w-4 h-4 text-[#b9c8de]" />
            </div>
            <h3 className="font-serif text-base text-[#f1f5f9] font-medium">Preparing Report</h3>
            <p className="text-xs text-[#a38c7c] leading-relaxed">
              Writer agent synthesizes clear findings and generates a downloadable PDF report with complete citations.
            </p>
          </div>
        </div>
      </section>

      {/* ── Recent Research Sessions ────────────────────────────────────────── */}
      {recentSessions.length > 0 && (
        <section className="bg-[#0e1117] border border-[#222735] p-6 rounded-sm">
          <div className="flex items-center justify-between border-b border-[#222735] pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#e1e2eb] font-semibold">
              <History className="w-4 h-4 text-[#b9c8de]" />
              <span>Recent Research Sessions</span>
            </div>
            <span className="text-xs text-[#a38c7c] font-mono">
              {recentSessions.length} sessions available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentSessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => onSelectSession && onSelectSession(sess.id)}
                className="text-left p-4 bg-[#101319] hover:bg-[#191c22] border border-[#222735] hover:border-[#ffb77d] transition-colors cursor-pointer group flex flex-col justify-between rounded-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#a38c7c] mb-1.5">
                    <span className="text-[#ffb77d] uppercase">{sess.mode} Mode</span>
                    <span>{new Date(sess.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-serif text-sm text-[#f1f5f9] group-hover:text-[#ffb77d] font-normal leading-snug line-clamp-2">
                    {sess.query}
                  </h4>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#222735]/60 flex items-center justify-between text-[11px] font-mono text-[#a38c7c]">
                  <span>{sess.statistics?.sources_relevant || 0} sources</span>
                  <span className="text-[#4edea3]">
                    {sess.confidence ? `${Math.round(sess.confidence)}% confidence` : "Completed"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
