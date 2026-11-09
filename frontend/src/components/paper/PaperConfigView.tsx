"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Sliders,
  Compass,
  FileText,
  Target,
  GraduationCap,
  Scale,
  Hash,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Paper } from "@/lib/api";

interface PaperConfigViewProps {
  onStartPlanning: (config: Partial<Paper>) => void;
  isLoading: boolean;
}

export const PaperConfigView: React.FC<PaperConfigViewProps> = ({
  onStartPlanning,
  isLoading,
}) => {
  const [title, setTitle] = useState("");
  const [researchQuestion, setResearchQuestion] = useState("");
  const [objectives, setObjectives] = useState("");
  const [field, setField] = useState("Computer Science & AI");
  const [paperType, setPaperType] = useState("Literature Review");
  const [citationStyle, setCitationStyle] = useState("APA 7");
  const [targetWordCount, setTargetWordCount] = useState<number>(5000);
  const [academicLevel, setAcademicLevel] = useState("Master's / Graduate");
  const [methodology, setMethodology] = useState("Systematic Literature Review (PRISMA)");
  const [researchDepth, setResearchDepth] = useState<"quick" | "standard" | "deep">("deep");
  const [language, setLanguage] = useState("English");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onStartPlanning({
      title: title.trim(),
      research_question: researchQuestion.trim() || `Investigation into ${title.trim()}`,
      objectives: objectives.trim() || `Synthesize state-of-the-art literature, identify research gaps, and propose an analytical framework for ${title.trim()}.`,
      field,
      paper_type: paperType,
      citation_style: citationStyle,
      target_word_count: Number(targetWordCount),
      research_depth: researchDepth,
      language,
      target_audience: `${academicLevel} Academic Peers`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 sm:p-7 mb-6 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>Academic Paper Studio</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400">Private On-Device Generation</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">
          Formulate a New Research Paper
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Configure research objectives, paper structure, and citation standards. ResearchForge will generate a structured outline, extract peer-reviewed sources, and draft complete academic sections.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Topic & Question */}
        <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
              <Target className="w-4 h-4 text-sky-400" />
              <span>1. Paper Title &amp; Topic</span>
            </div>
            <span className="text-[11px] text-slate-400">Step 1 of 5</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Working Paper Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., A Comparative Evaluation of Post-Quantum Cryptographic Migration in Financial Networks"
              className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 text-white placeholder-slate-500 text-sm p-3 rounded-lg focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary Research Question (Optional)
              </label>
              <textarea
                rows={3}
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="What specific question or hypothesis does this paper investigate?"
                className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 text-white placeholder-slate-500 text-xs p-3 rounded-lg focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Core Objectives &amp; Scope (Optional)
              </label>
              <textarea
                rows={3}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="What are the key goals, limitations, and methodological boundaries?"
                className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 text-white placeholder-slate-500 text-xs p-3 rounded-lg focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Paper Typology & Methodology */}
        <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>2. Paper Typology &amp; Discipline</span>
            </div>
            <span className="text-[11px] text-slate-400">Step 2 of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Academic Discipline
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full bg-[#141c2e] border border-[#1e293b] text-white text-xs p-3 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="Computer Science & AI">Computer Science &amp; Artificial Intelligence</option>
                <option value="Economics & Finance">Economics &amp; Quantitative Finance</option>
                <option value="Medicine & Biomedical Sciences">Medicine &amp; Biomedical Sciences</option>
                <option value="Engineering & Materials Science">Engineering &amp; Materials Science</option>
                <option value="Environmental Science & Energy">Environmental Science &amp; Energy Transition</option>
                <option value="Law & Public Policy">Law &amp; Technology Policy</option>
                <option value="Social Sciences & Education">Social Sciences &amp; Cognitive Psychology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Paper Typology
              </label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                className="w-full bg-[#141c2e] border border-[#1e293b] text-white text-xs p-3 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="Literature Review">Comprehensive Literature Review</option>
                <option value="Systematic Review">Systematic Literature Review (PRISMA)</option>
                <option value="Original Research">Empirical / Experimental Research Paper</option>
                <option value="Position Paper">Analytical Position / Perspective Paper</option>
                <option value="Case Study">Qualitative Comparative Case Study</option>
                <option value="Methodology Paper">Technical Method &amp; Algorithm Proposal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Citation Format & Target Length */}
        <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
              <Scale className="w-4 h-4 text-sky-400" />
              <span>3. Citation Standard &amp; Length</span>
            </div>
            <span className="text-[11px] text-slate-400">Step 3 of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Citation Standard
              </label>
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value)}
                className="w-full bg-[#141c2e] border border-[#1e293b] text-white text-xs p-3 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="APA 7">APA 7th Edition (Author, Year)</option>
                <option value="IEEE">IEEE Format [Numerical]</option>
                <option value="Nature">Nature / Vancouver [Superscript]</option>
                <option value="Harvard">Harvard Referencing</option>
                <option value="Chicago Author-Date">Chicago (Author-Date)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Word Count
              </label>
              <select
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(Number(e.target.value))}
                className="w-full bg-[#141c2e] border border-[#1e293b] text-white text-xs p-3 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value={3000}>3,000 words (~6-8 pages)</option>
                <option value={5000}>5,000 words (~10-12 pages - Recommended)</option>
                <option value={8000}>8,000 words (~16-18 pages - Long Form)</option>
                <option value={12000}>12,000 words (~25 pages - Monograph)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Academic Rigor Level
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full bg-[#141c2e] border border-[#1e293b] text-white text-xs p-3 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="Undergraduate">Undergraduate Honors</option>
                <option value="Master's / Graduate">Graduate / Master's Level</option>
                <option value="Doctoral / Post-Doc">Doctoral / Peer-Review Quality</option>
              </select>
            </div>
          </div>
        </div>

        {/* Research Depth Selection */}
        <div className="bg-[#0f1523] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>4. Source Discovery Scope</span>
            </div>
            <span className="text-[11px] text-slate-400">Step 4 of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: "quick",
                title: "Accelerated Synthesis",
                desc: "8-12 sources, rapid generation of primary claims and initial draft.",
              },
              {
                id: "standard",
                title: "Standard Academic Review",
                desc: "15-25 verified sources, deep synthesis, standard literature gap analysis.",
              },
              {
                id: "deep",
                title: "Exhaustive Corpus Mining",
                desc: "30+ verified sources, full cross-validation and rigorous debate mapping.",
              },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setResearchDepth(lvl.id as any)}
                className={`p-4 text-left border rounded-xl transition-all cursor-pointer ${
                  researchDepth === lvl.id
                    ? "bg-sky-500/10 border-sky-500 text-white ring-1 ring-sky-500/20"
                    : "bg-[#141c2e] border-[#1e293b] hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className={`font-medium text-xs ${
                  researchDepth === lvl.id ? "text-sky-300 font-semibold" : "text-white"
                }`}>
                  {lvl.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {lvl.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Private • Runs Locally with On-Device Inference</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-amber-500/20"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Formulating Plan...</span>
              </>
            ) : (
              <>
                <span>Generate Research Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
