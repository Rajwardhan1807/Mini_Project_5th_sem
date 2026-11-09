"use client";

import React, { useState } from "react";
import { ExternalLink, Search, Globe, Filter, BookOpen } from "lucide-react";
import { Source } from "@/lib/api";

interface SourceExplorerProps {
  sources: Source[];
}

export const SourceExplorer: React.FC<SourceExplorerProps> = ({ sources }) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const types = ["ALL", "Government", "Academic", "Research Paper", "News", "Industry", "Documentation"];

  const filteredSources = sources.filter((s) => {
    const matchesType =
      filterType === "ALL" || s.source_type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.snippet && s.snippet.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* ── Masthead ────────────────────────────────────────────────────────── */}
      <section className="border border-[#1e293b] bg-[#0f1523] p-5 sm:p-6 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-sky-400 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Evidence Repository</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-tight font-normal">
              Sources &amp; Academic Evidence
            </h2>
            <p className="text-sm text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
              All web pages, articles, and documents gathered by the research agents, checked for quality, and cited in the report.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0 text-xs border border-[#1e293b] p-3.5 bg-[#141c2e] rounded-xl">
            <div className="text-slate-400 text-xs font-medium">Total Sources Consulted</div>
            <div className="text-sky-400 font-bold text-lg mt-0.5">
              {sources.length} Verified Sources
            </div>
          </div>
        </div>

        {/* Filter Ribbon & Search Bar */}
        <div className="pt-3 border-t border-[#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Source Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Type:</span>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                  filterType.toLowerCase() === t.toLowerCase()
                    ? "bg-sky-500 text-slate-950 border-sky-400 font-semibold shadow-sm"
                    : "bg-[#141c2e] text-slate-300 border-[#1e293b] hover:border-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in sources..."
              className="w-full bg-[#141c2e] border border-[#1e293b] focus:border-sky-500/50 text-xs py-2 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none rounded-lg transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ── Sources List ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        {filteredSources.length === 0 ? (
          <div className="p-12 border border-[#1e293b] bg-[#0f1523] text-center text-xs text-slate-400 rounded-xl">
            No sources match the selected criteria.
          </div>
        ) : (
          filteredSources.map((source, idx) => {
            const relPct = Math.round(source.reliability * 100);
            return (
              <article
                key={source.id || idx}
                className="border border-[#1e293b] hover:border-slate-700 bg-[#0f1523] p-5 transition-all rounded-xl space-y-2.5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-sky-400 font-semibold">#{idx + 1}</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{source.domain}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-300 px-2 py-0.5 rounded bg-slate-800 text-[11px] border border-slate-700 font-medium">
                        {source.source_type}
                      </span>
                      <span>&bull;</span>
                      <span
                        className={`font-semibold text-xs ${
                          relPct >= 75
                            ? "text-emerald-400"
                            : relPct >= 50
                            ? "text-sky-400"
                            : "text-rose-400"
                        }`}
                      >
                        {relPct}% Quality Score
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg text-white font-medium leading-snug">
                      {source.title}
                    </h3>
                  </div>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-sky-500/40 text-sky-400 hover:text-sky-300 text-xs font-medium transition-all shrink-0 rounded-lg"
                      title="Open source in new tab"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {source.snippet && (
                  <p className="text-xs text-slate-300 font-sans leading-relaxed pt-2 border-t border-[#1e293b]/70">
                    &ldquo;{source.snippet}&rdquo;
                  </p>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};
