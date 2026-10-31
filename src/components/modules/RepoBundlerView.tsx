"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { RepoBundle } from "@/lib/types";
import {
  FolderGit2,
  Download,
  Copy,
  FileCode,
  Layers,
  Sparkles,
  Check,
  Loader2,
  Trash2,
  Plus,
  GitBranch,
} from "lucide-react";

interface RepoBundlerViewProps {
  bundles: RepoBundle[];
  onRefreshData: () => void;
}

export const RepoBundlerView: React.FC<RepoBundlerViewProps> = ({ bundles, onRefreshData }) => {
  const { showToast } = useAppStore();

  const [bundleName, setBundleName] = useState("OmniSphere Production Monorepo Pack");
  const [repoUrls, setRepoUrls] = useState<string[]>([
    "https://github.com/omnisphere/core-engine",
    "https://github.com/omnisphere/academy-hub",
  ]);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [outputFormat, setOutputFormat] = useState<"ZIP" | "XML_PROMPT" | "MARKDOWN">("ZIP");

  const [isBundling, setIsBundling] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleAddRepoUrl = () => {
    if (!newUrlInput.trim()) return;
    setRepoUrls([...repoUrls, newUrlInput.trim()]);
    setNewUrlInput("");
  };

  const handleRemoveRepoUrl = (index: number) => {
    setRepoUrls(repoUrls.filter((_, i) => i !== index));
  };

  const handleExecuteBundling = async () => {
    setIsBundling(true);
    setGeneratedPrompt(null);
    try {
      const res = await fetch("/api/bundler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bundleName.trim(),
          repoUrls,
          outputFormat,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `📦 Bundle ready! Estimated ${data.tokenEstimate.toLocaleString()} tokens across ${data.fileCount} standardized files.`
        );

        if (outputFormat === "ZIP" && data.zipBase64) {
          // Trigger browser download of generated zip
          const link = document.createElement("a");
          link.href = `data:application/zip;base64,${data.zipBase64}`;
          link.download = `${bundleName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.zip`;
          link.click();
        }

        if (data.xmlPrompt) {
          setGeneratedPrompt(data.xmlPrompt);
        }

        onRefreshData();
      }
    } catch {
      showToast("Failed to bundle repository archives");
    } finally {
      setIsBundling(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setHasCopied(true);
    showToast("📋 LLM Context Prompt copied to clipboard!");
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-nordic-border dark:border-zen-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-nordic-text dark:text-zen-text flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-nordic-teal dark:text-zen-mint" />
          <span>Repository Bundler & Monorepo Merger</span>
        </h1>
        <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
          Ingest multi-repo pipelines, standardize trees, consolidate dependencies, and export ZIPs or LLM context packs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Bundler Configuration */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
              Configure Monorepo Pipeline
            </h3>

            <div>
              <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                Bundle Project Name
              </label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
              />
            </div>

            <div>
              <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                Export Target Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as "ZIP" | "XML_PROMPT" | "MARKDOWN")}
                className="w-full px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text font-medium"
              >
                <option value="ZIP">Full Monorepo Archive (.zip)</option>
                <option value="XML_PROMPT">Consolidated LLM Context Pack (.xml)</option>
                <option value="MARKDOWN">Markdown Monorepo Summary (.md)</option>
              </select>
            </div>

            {/* Input repo URLs */}
            <div className="space-y-2">
              <label className="text-[10px] text-nordic-muted dark:text-zen-muted block">
                Target Git Repositories
              </label>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRepoUrl()}
                  placeholder="https://github.com/org/repo..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
                <button
                  type="button"
                  onClick={handleAddRepoUrl}
                  className="p-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border hover:bg-nordic-surface"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {repoUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-nordic-card/60 dark:bg-zen-card/60 border border-nordic-border/50 text-[11px]"
                  >
                    <span className="truncate max-w-[200px] text-nordic-text dark:text-zen-text font-mono">
                      {url}
                    </span>
                    <button
                      onClick={() => handleRemoveRepoUrl(i)}
                      className="text-nordic-muted hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecuteBundling}
              disabled={isBundling || repoUrls.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold text-xs shadow-soft hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {isBundling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Standardizing & Bundling...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Combiner & Export</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Inspection & LLM Context Prompt Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Generated XML Prompt View */}
          {generatedPrompt && (
            <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                  <span className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
                    Consolidated LLM Context Pack
                  </span>
                </div>

                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg text-xs font-medium"
                >
                  {hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopied ? "Copied!" : "Copy Context XML"}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={generatedPrompt}
                rows={10}
                className="w-full p-3 rounded-xl bg-nordic-card dark:bg-zen-card font-mono text-xs text-nordic-text dark:text-zen-text border border-nordic-border dark:border-zen-border outline-none leading-relaxed"
              />
            </div>
          )}

          {/* Historical Bundles */}
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
              Generated Repository Archives
            </h3>

            <div className="space-y-2">
              {bundles.map((b) => {
                const urls = JSON.parse(b.repoUrlsJson || "[]");
                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border/70 dark:border-zen-border/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-nordic-text dark:text-zen-text">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-nordic-muted dark:text-zen-muted mt-0.5 flex items-center gap-2 font-mono">
                        <span>{b.fileCount} files</span>
                        <span>•</span>
                        <span>{(b.totalSize / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="text-nordic-teal dark:text-zen-mint font-bold">
                          ~{b.tokenEstimate.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nordic-surface dark:bg-zen-surface text-nordic-teal dark:text-zen-mint font-bold uppercase">
                      {b.outputFormat}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
