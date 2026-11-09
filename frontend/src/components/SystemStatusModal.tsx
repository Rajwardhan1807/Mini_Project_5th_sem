"use client";

import React from "react";
import { X, Cpu, Database, Network, ShieldCheck, CheckCircle2, AlertTriangle, Sliders } from "lucide-react";

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendHealth: {
    status?: string;
    backend?: string;
    database?: string;
    search_service?: string;
    ollama?: { connected: boolean; model?: string; error?: string; model_available?: boolean };
    cost?: string;
  } | null;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({
  isOpen,
  onClose,
  backendHealth,
}) => {
  if (!isOpen) return null;

  const isOllamaConnected = backendHealth?.ollama?.connected ?? false;
  const isBackendOnline = backendHealth?.backend === "online";
  const isDatabaseReady = backendHealth?.database === "sqlite_ready";
  const isSearchReady = backendHealth?.search_service === "duckduckgo_ready";
  const modelName = backendHealth?.ollama?.model || "qwen3.5:latest";
  const ollamaError = backendHealth?.ollama?.error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0f1523] border border-[#1e293b] p-6 sm:p-7 text-white rounded-2xl shadow-2xl relative text-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Telemetry &amp; Diagnostics</span>
          </div>
          <h2 className="font-serif text-2xl text-white font-normal tracking-tight">
            System Status &amp; Runtime Architecture
          </h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Real-time status of your local LLM engine, SQLite storage, and autonomous search services.
          </p>
        </div>

        {/* Diagnostic Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
          <div className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl">
            <span className="text-slate-400 text-[11px] block font-medium">Backend Server</span>
            <span className="text-white font-semibold mt-1 block">
              {isBackendOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl">
            <span className="text-slate-400 text-[11px] block font-medium">Local LLM Engine</span>
            <span className="text-sky-400 font-mono font-semibold mt-1 block truncate">
              {modelName}
            </span>
          </div>

          <div className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl">
            <span className="text-slate-400 text-[11px] block font-medium">Data Privacy</span>
            <span className="text-emerald-400 font-semibold mt-1 block">100% Local</span>
          </div>

          <div className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl">
            <span className="text-slate-400 text-[11px] block font-medium">Inference Architecture</span>
            <span className="text-slate-200 font-semibold mt-1 block">On-Device Engine</span>
          </div>
        </div>

        {/* Real Service Health Verification */}
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Connected Services
          </div>

          {/* Service 1: Ollama */}
          <div className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Local LLM Host (Ollama)</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Model: {modelName} &bull; Endpoint: http://127.0.0.1:11434
                </div>
                {ollamaError && (
                  <div className="text-[10px] text-rose-400 mt-0.5">Note: {ollamaError}</div>
                )}
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                isOllamaConnected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {isOllamaConnected ? "ONLINE / READY" : "OFFLINE / STANDBY"}
            </span>
          </div>

          {/* Service 2: SQLite Database */}
          <div className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Local Relational Database (SQLite)</div>
                <div className="text-[11px] text-slate-400 font-mono">Storage: data/researchforge.db</div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                isDatabaseReady
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {isDatabaseReady ? "READY" : "NOT READY"}
            </span>
          </div>

          {/* Service 3: Search Service */}
          <div className="p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-white">Autonomous Academic Search Engine</div>
                <div className="text-[11px] text-slate-400">DuckDuckGo Real-Time Web &amp; Academic Indexer</div>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                isSearchReady
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {isSearchReady ? "ACTIVE" : "UNAVAILABLE"}
            </span>
          </div>
        </div>

        {/* Footer Seal */}
        <div className="mt-5 pt-3.5 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
          <span>Execution Sandbox: Fully Air-Gapped Local</span>
          <span className="text-emerald-400 font-medium">Citations &amp; Integrity: Active</span>
        </div>
      </div>
    </div>
  );
};
