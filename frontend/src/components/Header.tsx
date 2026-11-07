"use client";

import React from "react";
import { FileUp, History, Plus, Menu, Shield, GraduationCap, Sparkles } from "lucide-react";

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
  const modelName = backendHealth?.ollama?.model || "qwen3.5:latest";
  const modeDisplay = mode
    ? mode === "deep"
      ? "Deep Research"
      : mode === "quick"
      ? "Quick Research"
      : "Document Research"
    : "Research Mode";

  return (
    <header className="fixed top-0 left-0 w-full z-30 md:pl-72 bg-[#101319] border-b border-[#222735]">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 h-12">
        {/* Left: Mobile Toggle & Status */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1 text-[#dbc2b0] hover:text-[#e1e2eb] border border-[#222735] bg-[#0b0e14] rounded-sm cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Active Session Status */}
          {activeSessionId ? (
            <span className="text-[#4edea3] tracking-wider uppercase flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
              <span>Session: Active</span>
            </span>
          ) : (
            <span className="text-[#a38c7c] tracking-wider uppercase flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb77d]" />
              <span>Ready</span>
            </span>
          )}

          {/* Mode label */}
          {activeSessionId && (
            <span className="text-[#dbc2b0] border-l border-[#222735] pl-3 hidden sm:inline shrink-0">
              {modeDisplay}
            </span>
          )}

          {/* Privacy & Zero Cost */}
          <span className="text-[#a38c7c] border-l border-[#222735] pl-3 hidden lg:inline shrink-0">
            Local AI &bull; ₹0 Cost
          </span>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {onNewResearch && (
            <button
              onClick={onNewResearch}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#191c22] hover:bg-[#272a31] border border-[#222735] hover:border-[#ffb77d] text-[#e1e2eb] transition-colors cursor-pointer rounded-sm"
              title="Start a new research query"
            >
              <Plus className="w-3.5 h-3.5 text-[#ffb77d]" />
              <span className="hidden sm:inline">New Research</span>
            </button>
          )}

          <button
            onClick={onOpenDocuments}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#191c22] hover:bg-[#272a31] border border-[#222735] hover:border-[#a38c7c] text-[#e1e2eb] transition-colors cursor-pointer rounded-sm"
            title="Upload a document for research"
          >
            <FileUp className="w-3.5 h-3.5 text-[#ffb77d]" />
            <span className="hidden md:inline">Documents</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#191c22] hover:bg-[#272a31] border border-[#222735] hover:border-[#a38c7c] text-[#e1e2eb] transition-colors cursor-pointer rounded-sm"
            title="View past research sessions"
          >
            <History className="w-3.5 h-3.5 text-[#b9c8de]" />
            <span className="hidden md:inline">History</span>
          </button>

          {onOpenPaperStudio && (
            <button
              onClick={onOpenPaperStudio}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#191c22] border border-[#ffb77d]/40 hover:border-[#ffb77d] text-[#ffb77d] transition-colors cursor-pointer rounded-sm"
              title="Open Research Paper Studio"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#ffb77d]" />
              <span className="hidden sm:inline">Paper Studio</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
