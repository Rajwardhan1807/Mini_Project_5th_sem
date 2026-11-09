"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ListTree,
  Tag,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  FileText,
  Search,
} from "lucide-react";
import { Paper } from "@/lib/api";

interface PaperPlanViewProps {
  paper: Paper;
  onApprovePlan: (updatedPlan: any) => void;
  onRegeneratePlan: () => void;
  onBackToConfig: () => void;
  isLoading: boolean;
}

export const PaperPlanView: React.FC<PaperPlanViewProps> = ({
  paper,
  onApprovePlan,
  onRegeneratePlan,
  onBackToConfig,
  isLoading,
}) => {
  const initialPlan = (paper.plan as any) || {};

  const [problemStatement, setProblemStatement] = useState<string>(
    initialPlan.problem_statement || `Investigating: ${paper.research_question || paper.title}`
  );
  const [researchGaps, setResearchGaps] = useState<string[]>(
    initialPlan.research_gaps || [
      `Limited systematic empirical benchmarks for ${paper.title}`,
      `Unresolved trade-offs between accuracy and speed in local deployment`,
    ]
  );
  const [newGap, setNewGap] = useState("");

  const [researchQuestions, setResearchQuestions] = useState<string[]>(
    initialPlan.research_questions || [
      paper.research_question || `What are the primary factors influencing ${paper.title}?`,
    ]
  );
  const [newQuestion, setNewQuestion] = useState("");

  const [objectives, setObjectives] = useState<string[]>(
    initialPlan.objectives || [
      `Synthesize contemporary peer-reviewed literature.`,
      `Evaluate empirical trade-offs and build a comparative taxonomy.`,
    ]
  );
  const [newObjective, setNewObjective] = useState("");

  const [keywords, setKeywords] = useState<string[]>(
    initialPlan.search_keywords || [
      paper.title,
      paper.field,
      "empirical analysis",
      "methodology",
      "benchmarks",
    ]
  );
  const [newKeyword, setNewKeyword] = useState("");

  const [methodology, setMethodology] = useState<string>(
    initialPlan.methodology_approach ||
      "Systematic Literature Review following PRISMA guidelines with empirical claim verification."
  );

  const [outline, setOutline] = useState<string[]>(
    initialPlan.outline || [
      "Abstract",
      "Introduction",
      "Background and Related Work",
      "Methodology",
      "Results and Evidence Synthesis",
      "Discussion and Open Questions",
      "Limitations",
      "Conclusion",
      "References",
    ]
  );

  const addGap = () => {
    if (newGap.trim()) {
      setResearchGaps([...researchGaps, newGap.trim()]);
      setNewGap("");
    }
  };

  const removeGap = (idx: number) => {
    setResearchGaps(researchGaps.filter((_, i) => i !== idx));
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setResearchQuestions([...researchQuestions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const removeQuestion = (idx: number) => {
    setResearchQuestions(researchQuestions.filter((_, i) => i !== idx));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleApprove = () => {
    const updatedPlan = {
      ...initialPlan,
      problem_statement: problemStatement,
      research_gaps: researchGaps,
      research_questions: researchQuestions,
      objectives: objectives,
      search_keywords: keywords,
      methodology_approach: methodology,
      outline: outline,
      approved_at: new Date().toISOString(),
    };
    onApprovePlan(updatedPlan);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 sm:p-7 rounded-2xl relative shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <ListTree className="w-4 h-4 text-amber-400" />
            <span>Step 2: Review &amp; Approve Research Plan</span>
          </div>
          <button
            onClick={onBackToConfig}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </button>
        </div>
        <h1 className="font-serif text-2xl text-white mt-2 font-normal">
          Review &amp; Refine Research Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          The autonomous strategist formulated this research roadmap. Audit the problem statement, open research questions, and search keywords before launching evidence discovery.
        </p>

        {/* Paper Metadata Badge Ribbon */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-[#1e293b] text-xs text-slate-400">
          <span className="px-2.5 py-0.5 rounded-full bg-[#141c2e] border border-[#1e293b] text-amber-300 font-medium">
            {paper.paper_type}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#141c2e] border border-[#1e293b] text-sky-300 font-medium">
            {paper.field}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#141c2e] border border-[#1e293b] text-emerald-400 font-medium">
            {paper.citation_style}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#141c2e] border border-[#1e293b] font-mono">
            Target: ~{paper.target_word_count} words
          </span>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white uppercase tracking-wider">
            Problem Statement
          </label>
          <span className="text-[11px] text-slate-400">Editable</span>
        </div>
        <textarea
          rows={3}
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-3 text-sm text-white focus:outline-none rounded-xl transition-colors"
        />
      </div>

      {/* Candidate Research Gaps */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Key Research Gaps &amp; Open Questions</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {researchGaps.length} gaps defined
          </span>
        </div>

        <div className="space-y-2.5">
          {researchGaps.map((gap, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl"
            >
              <div className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="font-mono text-amber-400 font-semibold">GAP-{idx + 1}:</span>
                <span>{gap}</span>
              </div>
              <button
                type="button"
                onClick={() => removeGap(idx)}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Remove gap"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newGap}
              onChange={(e) => setNewGap(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGap())}
              placeholder="Add another research gap or limitation..."
              className="flex-1 bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 px-3.5 py-2.5 text-xs text-white focus:outline-none rounded-xl"
            />
            <button
              type="button"
              onClick={addGap}
              className="px-4 py-2.5 bg-[#1a243a] hover:bg-slate-800 border border-[#1e293b] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Gap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Research Questions */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Research Questions</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {researchQuestions.length} questions
          </span>
        </div>

        <div className="space-y-2.5">
          {researchQuestions.map((q, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl"
            >
              <div className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <span className="font-mono text-emerald-400 font-semibold">RQ-{idx + 1}:</span>
                <span>{q}</span>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(idx)}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Remove question"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQuestion())}
              placeholder="Add another research question..."
              className="flex-1 bg-[#141c2e] border border-[#1e293b] focus:border-emerald-500/50 px-3.5 py-2.5 text-xs text-white focus:outline-none rounded-xl"
            />
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2.5 bg-[#1a243a] hover:bg-slate-800 border border-[#1e293b] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Keywords (Crossref & Web Search) */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
            <Search className="w-4 h-4 text-sky-400" />
            <span>Search Keywords (Academic Databases)</span>
          </div>
          <span className="text-xs text-slate-400">
            Used to query scientific indexes and repositories
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141c2e] border border-[#1e293b] text-xs text-slate-200 rounded-lg"
            >
              <Tag className="w-3 h-3 text-sky-400" />
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="text-slate-400 hover:text-rose-400 ml-1 text-sm leading-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
            placeholder="Type keyword and press Enter..."
            className="flex-1 bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 px-3.5 py-2.5 text-xs text-white focus:outline-none rounded-xl"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-4 py-2.5 bg-[#1a243a] hover:bg-slate-800 border border-[#1e293b] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Add Keyword</span>
          </button>
        </div>
      </div>

      {/* Section Outline Preview */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Paper Sections Outline</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {outline.length} sections planned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {outline.map((sec, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-3 bg-[#141c2e] border border-[#1e293b] text-xs rounded-xl"
            >
              <span className="text-sky-400 font-mono font-semibold w-6">{idx + 1}.</span>
              <span className="text-white font-medium">{sec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e293b]">
        <button
          type="button"
          onClick={onRegeneratePlan}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-xs font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer rounded-xl"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Regenerate Plan</span>
        </button>

        <button
          type="button"
          onClick={handleApprove}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md hover:shadow-emerald-500/20"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Discovering Sources...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Plan &amp; Find Sources</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
