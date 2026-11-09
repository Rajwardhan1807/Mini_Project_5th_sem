"use client";

import React, { useState } from "react";
import {
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { Paper, PaperSource } from "@/lib/api";

interface PaperSourceViewProps {
  paper: Paper;
  sources: PaperSource[];
  onDraftPaper: () => void;
  onAddManualSource: (source: Partial<PaperSource>) => Promise<void>;
  onDiscoverMore: () => void;
  onBackToPlan: () => void;
  isLoading: boolean;
}

export const PaperSourceView: React.FC<PaperSourceViewProps> = ({
  paper,
  sources,
  onDraftPaper,
  onAddManualSource,
  onDiscoverMore,
  onBackToPlan,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "academic" | "verified">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Manual source form state
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthors, setManualAuthors] = useState("");
  const [manualYear, setManualYear] = useState(new Date().getFullYear().toString());
  const [manualJournal, setManualJournal] = useState("");
  const [manualDoi, setManualDoi] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualAbstract, setManualAbstract] = useState("");

  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.authors && s.authors.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.abstract && s.abstract.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === "academic") return s.source_type === "Academic" || !!s.doi;
    if (filterType === "verified") return !!s.verified;
    return true;
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    await onAddManualSource({
      title: manualTitle.trim(),
      authors: manualAuthors.trim(),
      year: manualYear.trim(),
      journal: manualJournal.trim(),
      doi: manualDoi.trim(),
      url: manualUrl.trim() || (manualDoi ? `https://doi.org/${manualDoi.trim()}` : ""),
      abstract: manualAbstract.trim(),
      snippet: manualAbstract.slice(0, 300),
      source_type: manualDoi ? "Academic" : "Manual",
      verified: !!manualDoi,
      reliability: manualDoi ? 0.9 : 0.8,
      relevance: 0.85,
    });
    // Reset
    setManualTitle("");
    setManualAuthors("");
    setManualJournal("");
    setManualDoi("");
    setManualUrl("");
    setManualAbstract("");
    setIsAddModalOpen(false);
  };

  const verifiedCount = sources.filter((s) => s.verified).length;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Banner */}
      <div className="bg-[#0f1523] border border-[#1e293b] p-6 sm:p-7 rounded-2xl relative shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <FolderOpen className="w-4 h-4 text-emerald-400" />
            <span>Step 3: Discovered Sources &amp; Citations</span>
          </div>
          <button
            onClick={onBackToPlan}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Plan</span>
          </button>
        </div>
        <h1 className="font-serif text-2xl text-white mt-2 font-normal">
          Identified Sources &amp; Academic Bibliography
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Academic studies, official proceedings, and technical records collected for your topic. These will be cited directly throughout each paper section.
        </p>

        {/* Telemetry Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-[#1e293b] text-xs">
          <div className="bg-[#141c2e] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">TOTAL SOURCES</span>
            <span className="text-white font-bold font-mono text-base">{sources.length}</span>
          </div>
          <div className="bg-[#141c2e] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">VERIFIED ACADEMIC</span>
            <span className="text-emerald-400 font-bold font-mono text-base">{verifiedCount}</span>
          </div>
          <div className="bg-[#141c2e] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">CITATION FORMAT</span>
            <span className="text-sky-300 font-bold text-base">{paper.citation_style}</span>
          </div>
          <div className="bg-[#141c2e] p-3 rounded-xl border border-[#1e293b]">
            <span className="text-slate-400 block text-[11px] font-medium">RESEARCH DEPTH</span>
            <span className="text-amber-300 font-bold text-base capitalize">{paper.research_depth}</span>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, author, or keyword..."
              className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 pl-9 pr-3 py-2 text-xs text-white focus:outline-none rounded-xl"
            />
          </div>

          <div className="flex items-center border border-[#1e293b] bg-[#141c2e] p-1 rounded-xl">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterType === "all" ? "bg-sky-500/20 text-sky-300" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({sources.length})
            </button>
            <button
              onClick={() => setFilterType("verified")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterType === "verified" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"
              }`}
            >
              Verified ({verifiedCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-xs font-medium text-white transition-all cursor-pointer rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Source Manually</span>
          </button>

          <button
            onClick={onDiscoverMore}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer rounded-xl"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Find More Sources</span>
          </button>
        </div>
      </div>

      {/* Source Cards List */}
      <div className="space-y-3">
        {filteredSources.length === 0 ? (
          <div className="bg-[#0f1523] border border-[#1e293b] p-12 text-center rounded-2xl">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <div className="text-sm text-white font-medium">No matching sources found</div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, or click "Find More Sources" to query external databases.
            </p>
          </div>
        ) : (
          filteredSources.map((source, idx) => (
            <div
              key={source.id || idx}
              className="bg-[#0f1523] border border-[#1e293b] hover:border-slate-700 p-5 rounded-2xl transition-all shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-sky-400 font-semibold">[{idx + 1}]</span>
                    {source.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Peer-Reviewed</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Web Citation
                      </span>
                    )}

                    {source.year && (
                      <span className="text-slate-400 font-mono text-xs">({source.year})</span>
                    )}

                    {source.journal && (
                      <span className="text-slate-300 italic text-xs truncate max-w-xs">
                        {source.journal}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-base text-white font-medium leading-snug">
                    {source.title}
                  </h3>

                  {source.authors && (
                    <p className="text-xs text-slate-400">
                      Authors: <span className="text-slate-300">{source.authors}</span>
                    </p>
                  )}
                </div>

                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-sky-500/40 text-sky-400 hover:text-sky-300 text-xs font-medium rounded-lg transition-all shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {source.abstract && (
                <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3 pt-1 border-t border-[#1e293b]/70">
                  {source.abstract}
                </p>
              )}

              {source.doi && (
                <div className="text-[11px] font-mono text-slate-400">
                  DOI: <span className="text-sky-300">{source.doi}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e293b]">
        <button
          type="button"
          onClick={onBackToPlan}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-xs font-medium text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Outline</span>
        </button>

        <button
          type="button"
          onClick={onDraftPaper}
          disabled={isLoading || sources.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md hover:shadow-amber-500/20"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Drafting Sections...</span>
            </>
          ) : (
            <>
              <span>Begin Drafting Academic Paper</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Manual Source Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f1523] border border-[#1e293b] p-6 max-w-lg w-full text-white rounded-2xl shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-medium">Add Academic Citation</h3>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Article Title *</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g., Deep Residual Learning for Image Recognition"
                  className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-2.5 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Authors</label>
                  <input
                    type="text"
                    value={manualAuthors}
                    onChange={(e) => setManualAuthors(e.target.value)}
                    placeholder="e.g., He, Zhang, Ren, Sun"
                    className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-2.5 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Publication Year</label>
                  <input
                    type="text"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                    className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-2.5 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Journal / Venue</label>
                  <input
                    type="text"
                    value={manualJournal}
                    onChange={(e) => setManualJournal(e.target.value)}
                    placeholder="e.g., IEEE CVPR"
                    className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-2.5 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">DOI</label>
                  <input
                    type="text"
                    value={manualDoi}
                    onChange={(e) => setManualDoi(e.target.value)}
                    placeholder="e.g., 10.1109/CVPR.2016.90"
                    className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-2.5 rounded-lg text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">URL</label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-2.5 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Abstract / Excerpt</label>
                <textarea
                  rows={3}
                  value={manualAbstract}
                  onChange={(e) => setManualAbstract(e.target.value)}
                  placeholder="Paste excerpt or summary..."
                  className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 p-2.5 rounded-lg text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Add Citation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
