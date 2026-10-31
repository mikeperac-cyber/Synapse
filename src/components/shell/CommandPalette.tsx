"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ModuleId } from "@/lib/types";
import {
  Search,
  CheckSquare,
  GraduationCap,
  DollarSign,
  Mic,
  FolderGit2,
  Instagram,
  Bot,
  Sun,
  Moon,
  Zap,
  Plus,
  ArrowRight,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  onRefreshData?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onRefreshData }) => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveModule,
    toggleTheme,
    theme,
    startTimer,
    showToast,
    setAgentDrawerOpen,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Keyboard shortcut listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const navigateTo = (mod: ModuleId) => {
    setActiveModule(mod);
    setCommandPaletteOpen(false);
  };

  const handleQuickCreateTask = async () => {
    if (!quickTaskTitle.trim()) return;
    setIsCreatingTask(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTaskTitle.trim(),
          priority: "HIGH",
          status: "TODO",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✨ Created task: "${quickTaskTitle}"`);
        setQuickTaskTitle("");
        if (onRefreshData) onRefreshData();
        setCommandPaletteOpen(false);
      }
    } catch {
      showToast("Failed to create quick task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const runAgentNow = async () => {
    setCommandPaletteOpen(false);
    showToast("Running Autonomous Cycle...");
    try {
      const res = await fetch("/api/autonomous", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("⚡ Autonomous Cycle completed successfully!");
        if (onRefreshData) onRefreshData();
      }
    } catch {
      showToast("Error running agent cycle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-nordic-border dark:border-zen-border gap-2.5">
          <Search className="w-4 h-4 text-nordic-muted dark:text-zen-muted" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, jump to a domain, or type a task name..."
            className="flex-1 bg-transparent text-sm text-nordic-text dark:text-zen-text outline-none placeholder:text-nordic-muted/60 dark:placeholder:text-zen-muted/60"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded text-nordic-muted hover:text-nordic-text dark:hover:text-zen-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List & Actions */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3 text-xs">
          {/* Quick Task Creation shortcut */}
          <div className="p-2.5 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border">
            <div className="text-[11px] font-medium text-nordic-muted dark:text-zen-muted mb-1.5 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-nordic-teal dark:text-zen-mint" />
              <span>Instant Task Creator</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickCreateTask()}
                placeholder="e.g. Schedule mock test with Marcus..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border text-xs outline-none text-nordic-text dark:text-zen-text"
              />
              <button
                onClick={handleQuickCreateTask}
                disabled={!quickTaskTitle.trim() || isCreatingTask}
                className="px-3 py-1.5 rounded-lg bg-nordic-teal dark:bg-zen-mint text-white dark:text-zen-bg font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>

          {/* Jump to Modules */}
          <div>
            <div className="px-2 pb-1 text-[10px] uppercase font-mono font-semibold text-nordic-muted dark:text-zen-muted">
              Jump to Module
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => navigateTo("tasks")}
                className="flex items-center gap-2 p-2 rounded-lg bg-nordic-card/60 dark:bg-zen-card/60 hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                <span className="font-medium text-nordic-text dark:text-zen-text">Tasks & Projects</span>
              </button>
              <button
                onClick={() => navigateTo("education")}
                className="flex items-center gap-2 p-2 rounded-lg bg-nordic-card/60 dark:bg-zen-card/60 hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                <span className="font-medium text-nordic-text dark:text-zen-text">Academy & Lessons</span>
              </button>
              <button
                onClick={() => navigateTo("finance")}
                className="flex items-center gap-2 p-2 rounded-lg bg-nordic-card/60 dark:bg-zen-card/60 hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <DollarSign className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                <span className="font-medium text-nordic-text dark:text-zen-text">Financial Matrix</span>
              </button>
              <button
                onClick={() => navigateTo("voice-notes")}
                className="flex items-center gap-2 p-2 rounded-lg bg-nordic-card/60 dark:bg-zen-card/60 hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <Mic className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                <span className="font-medium text-nordic-text dark:text-zen-text">Voice & Notes</span>
              </button>
              <button
                onClick={() => navigateTo("bundler")}
                className="flex items-center gap-2 p-2 rounded-lg bg-nordic-card/60 dark:bg-zen-card/60 hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <FolderGit2 className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                <span className="font-medium text-nordic-text dark:text-zen-text">Repo Bundler</span>
              </button>
              <button
                onClick={() => navigateTo("instagram")}
                className="flex items-center gap-2 p-2 rounded-lg bg-nordic-card/60 dark:bg-zen-card/60 hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <Instagram className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                <span className="font-medium text-nordic-text dark:text-zen-text">Instagram Planner</span>
              </button>
            </div>
          </div>

          {/* Quick System Actions */}
          <div>
            <div className="px-2 pb-1 text-[10px] uppercase font-mono font-semibold text-nordic-muted dark:text-zen-muted">
              System Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={runAgentNow}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-nordic-text dark:text-zen-text">Run Autonomous Reconciliation Cycle</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-nordic-muted dark:text-zen-muted" />
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                  setCommandPaletteOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-nordic-teal" />
                  )}
                  <span className="text-nordic-text dark:text-zen-text">
                    Toggle Theme ({theme === "dark" ? "Switch to Nordic Coastal Light" : "Switch to Zen Studio Dark"})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-nordic-muted dark:text-zen-muted">Theme</span>
              </button>

              <button
                onClick={() => {
                  startTimer(undefined, "Deep Focus Session", "POMODORO");
                  setCommandPaletteOpen(false);
                  showToast("🍅 Started 25-minute Pomodoro timer");
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🍅</span>
                  <span className="text-nordic-text dark:text-zen-text">Start 25m Pomodoro Sprint</span>
                </div>
                <span className="text-[10px] font-mono text-nordic-muted dark:text-zen-muted">Timer</span>
              </button>

              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  setAgentDrawerOpen(true);
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-nordic-card dark:hover:bg-zen-card text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                  <span className="text-nordic-text dark:text-zen-text">Open Autonomous Agent Audit Drawer</span>
                </div>
                <span className="text-[10px] font-mono text-nordic-muted dark:text-zen-muted">Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-nordic-card/50 dark:bg-zen-card/50 border-t border-nordic-border dark:border-zen-border flex items-center justify-between text-[11px] text-nordic-muted dark:text-zen-muted">
          <span>Navigate with mouse or shortcuts</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
