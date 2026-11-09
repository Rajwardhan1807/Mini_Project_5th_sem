"use client";

import React from "react";
import { FileUp, History, Plus, Menu, GraduationCap, Shield } from "lucide-react";

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenDocuments: () => void;
  onNewResearch?: () => void;
  onOpenPaperStudio?: () => void;
  onToggleMobileMenu?: () => void;
  activeSessionId?: string | null;
  mode?: string;
  backendHealth: {
    status?: string;
    ollama?: { connected: boolean; model: string };
    cost?: string;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenDocuments,
  onNewResearch,
  onOpenPaperStudio,
  onToggleMobileMenu,
  activeSessionId,
  mode,
  backendHealth,
}) => {
  const modeDisplay = mode
    ? mode === "deep"
      ? "Deep Investigation"
      : mode === "quick"
      ? "Quick Briefing"
      : "Document Analysis"
    : "Research Mode";

  return (
    <header className="fixed top-0 left-0 w-full z-30 md:pl-72 bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#1e293b]">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 h-13">
        {/* Left: Mobile Toggle & Status */}
        <div className="flex items-center gap-3 text-xs">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-300 hover:text-white border border-[#1e293b] bg-[#141c2e] rounded-md cursor-pointer transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Active Session Status */}
          {activeSessionId ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-medium shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Session</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium text-slate-300">Ready</span>
            </div>
          )}

          {/* Mode label */}
          {activeSessionId && (
            <span className="text-slate-400 border-l border-[#1e293b] pl-3 hidden sm:inline shrink-0 font-medium">
              {modeDisplay}
            </span>
          )}

          {/* Privacy & Local AI label */}
          <span className="text-slate-400 border-l border-[#1e293b] pl-3 hidden lg:flex items-center gap-1.5 shrink-0 text-[11px]">
            <Shield className="w-3 h-3 text-sky-400" />
            <span>Private &amp; Local Inference</span>
          </span>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {onNewResearch && (
            <button
              onClick={onNewResearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-sky-500/40 text-slate-200 hover:text-white transition-all cursor-pointer rounded-md font-medium"
              title="Start a new research query"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">New Research</span>
            </button>
          )}

          <button
            onClick={onOpenDocuments}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer rounded-md font-medium"
            title="Upload a document for research"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Documents</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141c2e] hover:bg-[#1a243a] border border-[#1e293b] hover:border-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer rounded-md font-medium"
            title="View past research sessions"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">History</span>
          </button>

          {onOpenPaperStudio && (
            <button
              onClick={onOpenPaperStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 transition-all cursor-pointer rounded-md font-medium"
              title="Open Research Paper Studio"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Paper Studio</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
