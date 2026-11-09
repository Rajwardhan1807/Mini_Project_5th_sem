"use client";

import React from "react";
import {
  Compass,
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
  BookOpen,
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
      label: "Home & Overview",
      icon: <Compass className="w-4 h-4 shrink-0" />,
    },
    {
      id: "new_research",
      label: "New Research",
      icon: <PlusCircle className="w-4 h-4 shrink-0 text-sky-400" />,
    },
    {
      id: "reports",
      label: "My Reports",
      icon: <FileCheck2 className="w-4 h-4 shrink-0" />,
      badge: hasReport ? "READY" : undefined,
    },
    {
      id: "history",
      label: "Research History",
      icon: <History className="w-4 h-4 shrink-0" />,
    },
    {
      id: "documents",
      label: "Document Library",
      icon: <UploadCloud className="w-4 h-4 shrink-0" />,
    },
    {
      id: "settings",
      label: "System Status",
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 bg-[#0b0f19] border-r border-[#1e293b] text-[#f1f5f9]">
      {/* Brand & Masthead */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-[#1e293b]">
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => {
                onSelectTab("home");
                if (isOpenMobile) onCloseMobile();
              }}
              className="text-left group cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif text-lg font-semibold text-white tracking-tight group-hover:text-sky-300 transition-colors block">
                  ResearchForge
                </span>
              </div>
            </button>
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 pl-9.5">
            Autonomous Academic Workspace
          </p>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-emerald-400 font-medium pl-9.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Private • On-Device Engine</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
            Platform
          </div>
          <nav aria-label="Main Navigation" className="space-y-0.5">
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all cursor-pointer text-left rounded-md ${
                    isActive
                      ? "bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/25"
                      : "text-slate-300 hover:text-white hover:bg-[#141c2e] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? "text-sky-400" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-1.5 py-0.2 text-[10px] font-mono shrink-0 rounded ${
                        isActive
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
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

        {/* Paper Studio Advanced Section */}
        <div className="pt-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
            Academic Authoring
          </div>
          <button
            onClick={() => {
              onSelectTab("paper_studio");
              if (isOpenMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-all cursor-pointer text-left rounded-md ${
              activeTab === "paper_studio"
                ? "bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/30"
                : "text-slate-300 hover:text-white hover:bg-[#141c2e] border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <GraduationCap className={`w-4 h-4 shrink-0 ${activeTab === "paper_studio" ? "text-amber-400" : "text-amber-400/80"}`} />
              <span className="truncate font-medium">Research Paper Studio</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
              STUDIO
            </span>
          </button>
        </div>
      </div>

      {/* Footer Diagnostic & Quick Action */}
      <div className="space-y-3.5 pt-4 border-t border-[#1e293b]">
        <div className="p-2.5 rounded-lg bg-[#0e1422] border border-[#1e293b] space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>Model:</span>
            </span>
            <span className="text-slate-200 font-mono truncate max-w-[120px]">{modelName}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Inference:</span>
            </span>
            <span
              className={`font-medium flex items-center gap-1.5 ${
                isOllamaConnected ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOllamaConnected ? "bg-emerald-400" : "bg-rose-400"
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
          className="w-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold py-2 px-3 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-sky-500/20"
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
      <aside className="fixed top-0 left-0 h-screen w-72 z-40 hidden md:block border-r border-[#1e293b]">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Overlay Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 h-full z-10 border-r border-[#1e293b]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
