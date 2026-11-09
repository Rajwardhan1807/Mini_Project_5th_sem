"use client";

import React, { useState, useEffect, useRef } from "react";
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
  GitCompare,
  FileCheck2,
  FolderOpen,
  Check,
  ChevronRight,
  Download,
  Cpu,
  Bookmark,
  Share2,
} from "lucide-react";
import { api, ResearchSession } from "@/lib/api";

interface HeroSectionProps {
  onStartResearch: (query: string, mode: "quick" | "deep" | "document") => void;
  isLoading: boolean;
  onOpenDocuments?: () => void;
  onSelectSession?: (id: string) => void;
  onOpenPaperStudio?: () => void;
  onOpenHistory?: () => void;
  onViewReports?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartResearch,
  isLoading,
  onOpenDocuments,
  onSelectSession,
  onOpenPaperStudio,
  onOpenHistory,
  onViewReports,
}) => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"quick" | "deep" | "document">("deep");
  const [recentSessions, setRecentSessions] = useState<ResearchSession[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadingRecent(true);
    api.getHistory()
      .then((sess) => setRecentSessions(sess.slice(0, 4)))
      .catch(() => setRecentSessions([]))
      .finally(() => setLoadingRecent(false));

    api.getHealth()
      .then(setHealth)
      .catch(() => {});
  }, []);

  const demoPresets = [
    "Economic viability of thorium nuclear reactors vs grid-scale solar storage",
    "Empirical effects of AI code generation assistants on enterprise software quality",
    "Solid-state battery electrolytes vs lithium-ion for commercial transport",
    "Post-quantum cryptographic migration timelines for financial institutions",
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

  const focusInputWithQuery = (sampleText: string) => {
    setQuery(sampleText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isModelConnected = health?.ollama?.connected ?? true;
  const activeModel = health?.ollama?.model || "qwen3.5:latest";

  return (
    <div className="w-full flex flex-col space-y-12 pb-16">
      {/* ── 1. Hero & Interactive Research Console ────────────────────────────── */}
      <section className="relative rounded-2xl bg-gradient-to-b from-[#0f1523] to-[#090d16] border border-[#1e293b] p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden">
        {/* Subtle accent backdrop pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Status indicators */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#141c2e] border border-[#1e293b] text-slate-200 rounded-full font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  isModelConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              <span>Engine: {isModelConnected ? activeModel : "Connecting..."}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141c2e] border border-[#1e293b] text-slate-300 rounded-full font-medium">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>100% Private Local Inference</span>
            </span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight font-normal leading-[1.15]">
            Autonomous Academic Research &amp; Paper Formulation
          </h1>

          {/* Supporting Pitch */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Enter a research inquiry. ResearchForge coordinates autonomous agents to discover peer-reviewed evidence, verify claims, detect conflicting findings, and compose publication-ready papers with formal citations.
          </p>

          {/* Quick CTA Shortcuts */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (inputRef.current) inputRef.current.focus();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>Start New Research</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {onOpenPaperStudio && (
              <button
                onClick={onOpenPaperStudio}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Paper Studio</span>
              </button>
            )}
            {onOpenDocuments && (
              <button
                onClick={onOpenDocuments}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-slate-300 text-xs font-medium rounded-lg transition-all cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-slate-400" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Research Input Console ────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-3.5 relative z-10">
          <div className="border border-[#26354f] focus-within:border-sky-500/70 focus-within:ring-2 focus-within:ring-sky-500/20 bg-[#0b0f19] transition-all rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center px-4 sm:px-5 py-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a research topic, academic thesis, or scientific inquiry..."
                disabled={isLoading}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base sm:text-lg py-3 font-sans"
              />
            </div>

            {/* Bottom Controls Bar inside Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-[#0e1422] border-t border-[#1e293b]">
              {/* Depth Selection Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 text-xs font-medium mr-1 hidden sm:inline">
                  Depth:
                </span>

                <button
                  type="button"
                  onClick={() => setMode("quick")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all cursor-pointer font-medium ${
                    mode === "quick"
                      ? "bg-sky-500 text-slate-950 border-sky-400 font-semibold shadow-sm"
                      : "bg-[#141c2e] text-slate-300 border-[#1e293b] hover:border-slate-600"
                  }`}
                  title="Quick overview with 5-8 verified sources"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quick Briefing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("deep")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all cursor-pointer font-medium ${
                    mode === "deep"
                      ? "bg-sky-500 text-slate-950 border-sky-400 font-semibold shadow-sm"
                      : "bg-[#141c2e] text-slate-300 border-[#1e293b] hover:border-slate-600"
                  }`}
                  title="Comprehensive exploration with 10-20 sources and deep fact cross-examination"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Deep Investigation</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("document");
                    if (onOpenDocuments) onOpenDocuments();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all cursor-pointer font-medium ${
                    mode === "document"
                      ? "bg-sky-500 text-slate-950 border-sky-400 font-semibold shadow-sm"
                      : "bg-[#141c2e] text-slate-300 border-[#1e293b] hover:border-slate-600"
                  }`}
                  title="Upload a PDF or Word document to analyze"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Document Analysis</span>
                </button>
              </div>

              {/* Start Research Button */}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md hover:shadow-sky-500/20"
              >
                <span>{isLoading ? "Executing Pipeline..." : "Start Research"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium mr-1">
              Sample Inquiries:
            </span>
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => focusInputWithQuery(preset)}
                className="px-2.5 py-1 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-sky-500/40 text-slate-300 hover:text-white transition-all text-left cursor-pointer rounded-md text-[11px]"
              >
                {preset}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* ── 2. How ResearchForge Works (7-Step Sequential Workflow) ───────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#1e293b] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Autonomous Workflow</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
              How ResearchForge Works
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            A sequential, 7-stage verification and authoring pipeline designed for strict academic integrity.
          </p>
        </div>

        {/* 7-Step Horizontal / Stacked Visual Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {[
            {
              step: "01",
              title: "Topic Definition",
              desc: "Formulate research hypotheses, scope objectives, and select citation formats.",
              tag: "Inquiry",
            },
            {
              step: "02",
              title: "Source Discovery",
              desc: "Autonomous retrieval across academic databases, official repositories, and open web.",
              tag: "Retrieval",
            },
            {
              step: "03",
              title: "Evidence Extraction",
              desc: "Ingest content, extract structured data, metadata, and formal bibliographic details.",
              tag: "Parsing",
            },
            {
              step: "04",
              title: "Fact Cross-Check",
              desc: "Audit claims against retrieved sources, detect contradictions, and score confidence.",
              tag: "Verification",
            },
            {
              step: "05",
              title: "Report Synthesis",
              desc: "Synthesize findings into an evidence-backed structured research dossier.",
              tag: "Synthesis",
            },
            {
              step: "06",
              title: "Paper Studio",
              desc: "Formulate complete multi-section academic papers with section-by-section writing.",
              tag: "Authoring",
            },
            {
              step: "07",
              title: "Multi-Format Export",
              desc: "Download publication-ready documents in styled PDF, editable Word (.docx), or Markdown.",
              tag: "Export",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-4 rounded-xl bg-[#0f1523] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-serif text-sm font-medium text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {idx < 6 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Getting Started Walkthrough ───────────────────────────────────── */}
      <section className="rounded-2xl bg-[#0f1523] border border-[#1e293b] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Bookmark className="w-4 h-4" />
              <span>Researcher's Onboarding Guide</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-white font-normal">
              Getting Started with ResearchForge
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            4 Simple Practices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#141c2e] border border-[#1e293b] space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-mono text-xs font-bold">
              1
            </div>
            <h4 className="font-medium text-sm text-white">Frame a Focused Question</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start with a specific thesis or comparative topic rather than broad single words. Alternatively, click <strong>Upload Document</strong> to interrogate your own PDF or Word file.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141c2e] border border-[#1e293b] space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-mono text-xs font-bold">
              2
            </div>
            <h4 className="font-medium text-sm text-white">Choose Investigation Scope</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select <strong>Quick Briefing</strong> for fast 5-8 source overviews, or <strong>Deep Investigation</strong> for comprehensive literature review and multi-source cross-examination.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141c2e] border border-[#1e293b] space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-mono text-xs font-bold">
              3
            </div>
            <h4 className="font-medium text-sm text-white">Audit Claims &amp; Conflicts</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore the <strong>Fact-Checking &amp; Conflicts</strong> tab. Review verified statements, examine detected contradictions between sources, and evaluate reliability metrics.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141c2e] border border-[#1e293b] space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-mono text-xs font-bold">
              4
            </div>
            <h4 className="font-medium text-sm text-white">Transition to Paper Studio</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Elevate your research into a formal paper. Open <strong>Research Paper Studio</strong> to outline sections, generate academic prose, manage citations, and export to PDF or DOCX.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Explore Main Features (Interactive Feature Cards) ─────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#1e293b] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Full Capabilities</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
              Platform Features
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            Built exclusively around genuine application features. Click any card to navigate directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Feature 1: Multi-Agent Architecture */}
          <div className="p-5 rounded-xl bg-[#0f1523] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-white">Multi-Agent Orchestration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous specialist agents: Researcher discovers sources, Fact-Checker verifies claims and identifies contradictions, and Writer drafts structured academic reports.
              </p>
            </div>
            <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
              <span>Automated DAG Pipeline</span>
            </div>
          </div>

          {/* Feature 2: Paper Studio */}
          <div
            onClick={onOpenPaperStudio}
            className="p-5 rounded-xl bg-[#0f1523] border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-medium text-white group-hover:text-amber-300 transition-colors">
                  Research Paper Studio
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
                  STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step authoring environment. Configure paper typology (Experimental, Review, Comparative), formulate research outlines, and write section-by-section.
              </p>
            </div>
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 group-hover:underline">
              <span>Open Paper Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3: Fact-Checking & Contradictions */}
          <div className="p-5 rounded-xl bg-[#0f1523] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <GitCompare className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-white">Fact-Checking &amp; Conflicts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cross-validates factual assertions across multiple external sources. Detects discrepancies, opposing viewpoints, and provides confidence score metrics.
              </p>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span>Objective Verification</span>
            </div>
          </div>

          {/* Feature 4: Document Ingestion */}
          <div
            onClick={onOpenDocuments}
            className="p-5 rounded-xl bg-[#0f1523] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <FileUp className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-white group-hover:text-purple-300 transition-colors">
                Document Upload Chamber
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your research PDFs, Word documents (.docx), or text files. The system parses text, extracts key evidence, and grounds research in your proprietary data.
              </p>
            </div>
            <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1 group-hover:underline">
              <span>Upload Documents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 5: Multi-Format Exports */}
          <div
            onClick={onViewReports}
            className="p-5 rounded-xl bg-[#0f1523] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-white group-hover:text-sky-300 transition-colors">
                PDF, Word &amp; Markdown Exports
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download completed research reports as styled PDFs with formatted tables and citation lists, or export full academic papers in DOCX and raw Markdown.
              </p>
            </div>
            <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1 group-hover:underline">
              <span>View Completed Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 6: Research History */}
          <div
            onClick={onOpenHistory}
            className="p-5 rounded-xl bg-[#0f1523] border border-[#1e293b] hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-medium text-white group-hover:text-slate-200 transition-colors">
                Session History &amp; Archive
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every research query, collected source, verified claim, and generated paper is persistently recorded in your local SQLite database for instant retrieval.
              </p>
            </div>
            <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1 group-hover:underline">
              <span>Browse History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Recent Research Sessions ──────────────────────────────────────── */}
      {recentSessions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <History className="w-4 h-4 text-slate-400" />
              <span>Recent Research Sessions</span>
            </div>
            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
              >
                View All Sessions ({recentSessions.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {recentSessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => onSelectSession && onSelectSession(sess.id)}
                className="text-left p-4 rounded-xl bg-[#0f1523] hover:bg-[#141c2e] border border-[#1e293b] hover:border-sky-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1a243a] text-sky-300 font-medium border border-sky-500/20">
                      {sess.mode === "deep" ? "Deep" : sess.mode === "quick" ? "Quick" : "Document"} Mode
                    </span>
                    <span className="text-[11px] font-mono">
                      {new Date(sess.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-medium text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
                    {sess.query}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{sess.statistics?.sources_relevant || 0} sources</span>
                  <span className="text-emerald-400 font-medium">
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
