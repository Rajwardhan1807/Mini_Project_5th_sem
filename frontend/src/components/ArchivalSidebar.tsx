"use client";

import React from "react";
import {
  Home,
  PlusCircle,
  History,
  FileCheck2,
  FileText,
  UploadCloud,
  Settings,
  Cpu,
  ShieldCheck,
  X,
  Plus,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export type DocketTab =
  | "home"
  | "new_research"
  | "history"
  | "reports"
  | "documents"
  | "settings"
  | "paper_studio"
  | "briefing"
  | "sources"
  | "contradictions"
  | "report";

interface ArchivalSidebarProps {
  activeTab: DocketTab;
  onSelectTab: (tab: DocketTab) => void;
  backendHealth: {
    status?: string;
    backend?: string;
    database?: string;
    search_service?: string;
    ollama?: { connected: boolean; model?: string; error?: string };
    cost?: string;
  } | null;
  onNewResearch: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  sourcesCount?: number;
  claimsCount?: number;
  hasReport?: boolean;
}

export const ArchivalSidebar: React.FC<ArchivalSidebarProps> = ({
  activeTab,
  onSelectTab,
  backendHealth,
  onNewResearch,
  isOpenMobile,
  onCloseMobile,
  sourcesCount = 0,
  claimsCount = 0,
  hasReport = false,
}) => {
  const isOllamaConnected = backendHealth?.ollama?.connected ?? false;
  const modelName = backendHealth?.ollama?.model || "qwen3.5:latest";

  const primaryNavItems: Array<{
    id: DocketTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="w-4 h-4 shrink-0" />,
    },
    {
      id: "new_research",
      label: "New Research",
      icon: <PlusCircle className="w-4 h-4 shrink-0 text-[#ffb77d]" />,
    },
    {
      id: "history",
      label: "Research History",
      icon: <History className="w-4 h-4 shrink-0" />,
    },
    {
      id: "reports",
      label: "My Reports",
      icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
      badge: hasReport ? "READY" : undefined,
    },
    {
      id: "documents",
      label: "Documents",
      icon: <UploadCloud className="w-4 h-4 shrink-0" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 bg-[#0b0e14] border-r border-[#222735] text-[#e1e2eb]">
      {/* Brand & Masthead */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-[#222735]">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => {
                onSelectTab("home");
                if (isOpenMobile) onCloseMobile();
              }}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold text-[#ffb77d] tracking-tight group-hover:text-[#ffdcc3]">
                  ResearchForge
                </span>
              </div>
            </button>
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1 text-[#a38c7c] hover:text-[#e1e2eb]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-[#a38c7c] leading-relaxed">
            Local Multi-Agent Research Assistant
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-[#4edea3]">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span>100% Private &bull; &euro;0 Cost</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#a38c7c] px-3 py-1">
            Navigation
          </div>
          <nav aria-label="Main Navigation" className="space-y-1">
            {primaryNavItems.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === "home" && activeTab === "briefing") ||
                (item.id === "reports" && activeTab === "report");

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium tracking-wide transition-colors cursor-pointer text-left rounded-sm ${
                    isActive
                      ? "bg-[#1d2026] text-[#ffb77d] border-l-2 border-[#ffb77d]"
                      : "text-[#dbc2b0] hover:text-[#e1e2eb] hover:bg-[#191c22] border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 text-[10px] font-mono shrink-0 border ${
                        isActive
                          ? "bg-[#272a31] text-[#ffb77d] border-[#d97706]/40"
                          : "bg-[#131720] text-[#94a3b8] border-[#222735]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Advanced Section */}
        <div className="pt-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#a38c7c] px-3 py-1">
            Advanced Tools
          </div>
          <button
            onClick={() => {
              onSelectTab("paper_studio");
              if (isOpenMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium tracking-wide transition-colors cursor-pointer text-left rounded-sm ${
              activeTab === "paper_studio"
                ? "bg-[#1d2026] text-[#ffb77d] border-l-2 border-[#ffb77d]"
                : "text-[#dbc2b0] hover:text-[#e1e2eb] hover:bg-[#191c22] border-l-2 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <GraduationCap className="w-4 h-4 shrink-0 text-[#ffb77d]" />
              <span className="truncate">Research Paper Studio</span>
            </div>
            <span className="text-[9px] font-mono text-[#ffb77d] bg-[#d97706]/10 border border-[#d97706]/40 px-1 py-0.5">
              PRO
            </span>
          </button>
        </div>
      </div>

      {/* Footer Diagnostic & Quick Action */}
      <div className="space-y-4 pt-4 border-t border-[#222735]">
        <div className="space-y-2 text-xs text-[#dbc2b0]">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-[#a38c7c]">
              <Cpu className="w-3.5 h-3.5 text-[#a38c7c]" />
              <span>Model:</span>
            </span>
            <span className="text-[#e1e2eb] truncate max-w-[120px]">{modelName}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-[#a38c7c]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#a38c7c]" />
              <span>Status:</span>
            </span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                isOllamaConnected ? "text-[#4edea3]" : "text-[#ffb4ab]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOllamaConnected ? "bg-[#4edea3]" : "bg-[#ffb4ab]"
                }`}
              />
              {isOllamaConnected ? "Ready" : "Offline"}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onNewResearch();
            if (isOpenMobile) onCloseMobile();
          }}
          className="w-full bg-[#d97706] hover:bg-[#ffb77d] text-[#08090b] text-xs font-bold py-2.5 px-3 text-center transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer rounded-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Research</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed SideNavBar */}
      <aside className="fixed top-0 left-0 h-screen w-72 z-40 hidden md:block border-r border-[#222735]">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Overlay Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 h-full z-10 border-r border-[#222735]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
