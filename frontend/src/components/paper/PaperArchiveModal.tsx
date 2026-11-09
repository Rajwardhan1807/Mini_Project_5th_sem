"use client";

import React, { useState } from "react";
import {
  History,
  Trash2,
  ArrowRight,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  X
} from "lucide-react";
import { Paper } from "@/lib/api";

interface PaperArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: Paper[];
  onSelectPaper: (paperId: string) => void;
  onDeletePaper: (paperId: string) => void;
  onNewPaper: () => void;
}

export const PaperArchiveModal: React.FC<PaperArchiveModalProps> = ({
  isOpen,
  onClose,
  papers,
  onSelectPaper,
  onDeletePaper,
  onNewPaper,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-[#0f1523] border border-[#1e293b] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <span>Research Paper Archive</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-normal">SQLite Local Database</span>
              </div>
              <h2 className="font-serif text-lg text-white font-medium">
                Saved Papers &amp; Draft Revisions
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNewPaper();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Paper</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Papers List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {papers.length === 0 ? (
            <div className="text-center py-16 bg-[#141c2e] border border-[#1e293b] rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <div className="text-sm text-white font-medium">No Saved Research Papers</div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Generate your first academic paper using the Research Paper Studio. All drafts are preserved locally.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onNewPaper();
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Configure First Paper</span>
              </button>
            </div>
          ) : (
            papers.map((p) => {
              const dateStr = p.updated_at
                ? new Date(p.updated_at).toLocaleString()
                : "Recent";
              const isConfirming = confirmDeleteId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-[#141c2e] border border-[#1e293b] hover:border-slate-700 p-4.5 rounded-xl transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[#0f1523] border border-[#1e293b] text-amber-300 font-medium">
                        {p.paper_type || "Paper"}
                      </span>
                      {p.field && (
                        <span className="text-sky-300 truncate max-w-xs">{p.field}</span>
                      )}
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-medium">{p.citation_style || "APA 7"}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-mono">{p.target_word_count || 5000} words</span>
                    </div>

                    <h3 className="font-serif text-base text-white font-medium leading-snug truncate">
                      {p.title}
                    </h3>

                    {p.research_question && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic font-sans">
                        RQ: {p.research_question}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{dateStr}</span>
                      </span>
                      <span>•</span>
                      <span className="uppercase text-emerald-400 font-medium">Stage: {p.current_stage || p.status}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          onClick={() => {
                            onDeletePaper(p.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-500 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 bg-[#0f1523] border border-[#1e293b] text-slate-300 rounded-lg hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-[#0f1523] transition-colors"
                        title="Delete paper draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectPaper(p.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0f1523] hover:bg-[#1a243a] border border-[#1e293b] hover:border-amber-500/40 text-xs font-medium text-white transition-all cursor-pointer rounded-lg"
                    >
                      <span>Resume Draft</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0b0f19] border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
          <span>{papers.length} total saved papers</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
