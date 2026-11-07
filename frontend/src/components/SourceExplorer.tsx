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
      <section className="border border-[#222735] bg-[#0b0e14] p-5 sm:p-6 space-y-4 rounded-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-[#ffb77d] uppercase">
              <BookOpen className="w-3.5 h-3.5 text-[#ffb77d]" />
              <span>Evidence Repository</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#f1f5f9] tracking-tight font-normal">
              Sources &amp; Evidence
            </h2>
            <p className="text-sm text-[#dbc2b0] font-sans mt-1 max-w-2xl leading-relaxed">
              All web pages, articles, and documents gathered by the research agents, checked for quality, and cited in the report.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0 font-mono text-xs border border-[#222735] p-3 bg-[#101319] rounded-sm">
            <div className="text-[#a38c7c] uppercase text-[10px]">Total Sources Analyzed</div>
            <div className="text-[#ffb77d] font-bold text-lg mt-0.5">
              {sources.length} Verified Sources
            </div>
          </div>
        </div>

        {/* Filter Ribbon & Search Bar */}
        <div className="pt-3 border-t border-[#222735] flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
          {/* Source Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[#a38c7c] text-[11px] uppercase mr-1">Type:</span>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 border transition-colors cursor-pointer rounded-sm ${
                  filterType.toLowerCase() === t.toLowerCase()
                    ? "bg-[#ffb77d] text-[#08090b] border-[#ffb77d] font-bold"
                    : "bg-[#101319] text-[#dbc2b0] border-[#222735] hover:border-[#a38c7c]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#a38c7c] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in sources..."
              className="w-full bg-[#101319] border border-[#222735] focus:border-[#ffb77d] text-xs py-1.5 pl-8 pr-3 text-[#f1f5f9] placeholder-[#a38c7c]/50 focus:outline-none rounded-sm"
            />
          </div>
        </div>
      </section>

      {/* ── Sources List ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        {filteredSources.length === 0 ? (
          <div className="p-10 border border-[#222735] bg-[#0e1117] text-center text-xs font-mono text-[#a38c7c] rounded-sm">
            No sources match the selected filter.
          </div>
        ) : (
          filteredSources.map((source, idx) => {
            const relPct = Math.round(source.reliability * 100);
            return (
              <article
                key={source.id || idx}
                className="border border-[#222735] hover:border-[#32353c] bg-[#0e1117] p-5 transition-colors rounded-sm space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="text-[#a38c7c]">#{idx + 1}</span>
                      <span className="text-[#b9c8de] flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{source.domain}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="text-[#ffb77d]">{source.source_type}</span>
                      <span>&bull;</span>
                      <span
                        className={`font-semibold ${
                          relPct >= 75
                            ? "text-[#4edea3]"
                            : relPct >= 50
                            ? "text-[#ffb77d]"
                            : "text-[#ffb4ab]"
                        }`}
                      >
                        {relPct}% Quality Score
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg text-[#f1f5f9] font-medium leading-snug">
                      {source.title}
                    </h3>
                  </div>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#101319] hover:bg-[#191c22] border border-[#222735] hover:border-[#ffb77d] text-[#ffb77d] font-mono text-xs transition-colors shrink-0 rounded-sm"
                      title="Open source in new tab"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {source.snippet && (
                  <p className="text-xs text-[#dbc2b0] font-sans leading-relaxed pt-1 border-t border-[#222735]/60">
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
