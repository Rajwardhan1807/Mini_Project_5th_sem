"use client";

import React, { useState, useRef } from "react";
import { X, UploadCloud, FileText, Check, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentReady: (docId: string, filename: string) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onDocumentReady }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ id: string; filename: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    try {
      const res = await api.uploadDocument(file);
      setUploadResult({ id: res.id, filename: res.filename, pages: res.pages });
    } catch (err: any) {
      setError(err.message || "Failed to parse document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#0f1523] border border-[#1e293b] p-6 sm:p-7 text-white rounded-2xl shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Private &amp; Local Ingestion</span>
          </div>
          <h3 className="font-serif text-2xl text-white font-normal">
            Upload &amp; Interrogate Documents
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload PDF reports, research papers, Word documents, or text files.
            All documents are parsed and indexed locally on your machine with zero external data sharing.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 border-2 border-dashed p-8 text-center cursor-pointer rounded-xl transition-all flex flex-col items-center justify-center ${
            dragActive
              ? "border-sky-400 bg-sky-500/10"
              : "border-[#1e293b] hover:border-slate-600 bg-[#141c2e]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">
            Click to upload or drag &amp; drop document
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports PDF, Word (.docx), Text (.txt, .md) up to 50MB
          </p>
          <div className="mt-3 text-[11px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-medium">
            Air-Gapped Local Parsing
          </div>
        </div>

        {/* Uploading Status */}
        {isUploading && (
          <div className="mt-4 p-3.5 bg-[#141c2e] border border-[#1e293b] rounded-xl flex items-center gap-3 text-xs text-slate-300">
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
            <span>Reading pages and extracting textual evidence...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Success Result */}
        {uploadResult && (
          <div className="mt-4 p-4 bg-[#141c2e] border border-emerald-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white truncate">{uploadResult.filename}</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-mono shrink-0">
                {uploadResult.pages} Page(s) Read
              </span>
            </div>

            <button
              onClick={() => {
                onDocumentReady(uploadResult.id, uploadResult.filename);
                onClose();
              }}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-md hover:shadow-sky-500/20"
            >
              Start Research on this Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
