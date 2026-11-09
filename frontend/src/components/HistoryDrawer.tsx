"use client";

import React, { useEffect, useState } from "react";
import { X, History, RotateCcw, ArrowRight } from "lucide-react";
import { api, ResearchSession } from "@/lib/api";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSession,
}) => {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-[#0b0f19] border-l border-[#1e293b] p-5 sm:p-6 flex flex-col justify-between text-white shadow-2xl">
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg text-white font-medium">Research History</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={fetchHistory}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2.5">
            All past research inquiries, sources, and verified reports stored locally.
          </p>

          {/* Session List */}
          <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {loading && (
              <p className="text-xs text-slate-400 italic py-6 text-center">Loading past sessions...</p>
            )}
            {!loading && sessions.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                <p>No past research sessions found.</p>
                <p className="mt-1 text-[11px] text-slate-500">Submit a query to generate your first session.</p>
              </div>
            )}

            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSession(s.id);
                  onClose();
                }}
                className="p-4 rounded-xl bg-[#0f1523] border border-[#1e293b] hover:border-sky-500/40 hover:bg-[#141c2e] cursor-pointer transition-all group space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="text-sky-400 font-medium">
                    REF: {s.id.slice(0, 8)}
                  </span>
                  <span>{s.created_at ? s.created_at.slice(0, 10) : ""}</span>
                </div>

                <h4 className="font-serif text-sm text-white group-hover:text-sky-300 line-clamp-2 leading-snug font-medium transition-colors">
                  {s.query}
                </h4>

                <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] uppercase font-medium text-slate-300">{s.mode} mode</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-medium font-mono">{s.confidence}% Conf.</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1e293b] text-center text-xs text-slate-500">
          Saved locally in SQLite • 100% Private
        </div>
      </div>
    </div>
  );
};
