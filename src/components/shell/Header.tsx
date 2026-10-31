"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  Sun,
  Moon,
  Bot,
  Search,
  Zap,
  Clock,
  Mic,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Layers,
} from "lucide-react";

interface HeaderProps {
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefreshData }) => {
  const {
    theme,
    toggleTheme,
    setCommandPaletteOpen,
    pinnedWidgets,
    togglePinnedWidget,
    setAgentDrawerOpen,
    showToast,
  } = useAppStore();

  const [isRunningCycle, setIsRunningCycle] = useState(false);

  const handleRunAgent = async () => {
    setIsRunningCycle(true);
    try {
      const res = await fetch("/api/autonomous", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(`⚡ All tidied up! ${data.result.actionsTaken.length} things reviewed.`);
        if (onRefreshData) onRefreshData();
      } else {
        showToast("⚠️ Something went wrong while tidying up");
      }
    } catch {
      showToast("❌ Could not reach the assistant");
    } finally {
      setIsRunningCycle(false);
    }
  };

  return (
    <header className="header sticky top-0 z-40 w-full px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nordic-teal text-white font-bold shadow-soft">
              Ω
            </div>
            <div>
              <span className="font-semibold tracking-tight text-base text-nordic-text dark:text-zen-text">
                OmniSphere
              </span>
            </div>
          </div>

          {/* Assistant status pill */}
          <button
            onClick={() => setAgentDrawerOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border transition-all"
            title="See what the assistant has been doing"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-nordic-text dark:text-zen-text">Assistant:</span>
            <span className="text-nordic-teal dark:text-zen-mint font-semibold">On</span>
          </button>
        </div>

        {/* Center: Global Search & Shortcuts */}
        <div className="flex-1 max-w-sm hidden md:block">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="search w-full flex items-center justify-between px-4 text-sm text-nordic-muted dark:text-zen-muted"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 shrink-0" />
              <span className="truncate whitespace-nowrap">Search or jump...</span>
            </div>
            <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs rounded bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shrink-0 ml-2">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Tools & Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Pinned Hub Widgets Toggle Dropdown / Buttons */}
          <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border">
            <span className="text-xs text-nordic-muted dark:text-zen-muted px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Pinned:
            </span>
            <button
              onClick={() => togglePinnedWidget("showPomodoro")}
              className={`rounded-lg p-2 text-sm transition-colors ${
                pinnedWidgets.showPomodoro
                  ? "bg-nordic-soft text-nordic-teal dark:bg-zen-soft dark:text-zen-mint"
                  : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
              }`}
              title="Toggle Pomodoro / Timer widget"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => togglePinnedWidget("showQuickMemo")}
              className={`rounded-lg p-2 text-sm transition-colors ${
                pinnedWidgets.showQuickMemo
                  ? "bg-nordic-soft text-nordic-teal dark:bg-zen-soft dark:text-zen-mint"
                  : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
              }`}
              title="Toggle Quick Voice Memo widget"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => togglePinnedWidget("showPriorityTasks")}
              className={`rounded-lg p-2 text-sm transition-colors ${
                pinnedWidgets.showPriorityTasks
                  ? "bg-nordic-soft text-nordic-teal dark:bg-zen-soft dark:text-zen-mint"
                  : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
              }`}
              title="Toggle Priority Tasks widget"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => togglePinnedWidget("showCashBalance")}
              className={`rounded-lg p-2 text-sm transition-colors ${
                pinnedWidgets.showCashBalance
                  ? "bg-nordic-soft text-nordic-teal dark:bg-zen-soft dark:text-zen-mint"
                  : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
              }`}
              title="Toggle Cash Balance widget"
            >
              <DollarSign className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => togglePinnedWidget("showNextLesson")}
              className={`rounded-lg p-2 text-sm transition-colors ${
                pinnedWidgets.showNextLesson
                  ? "bg-nordic-soft text-nordic-teal dark:bg-zen-soft dark:text-zen-mint"
                  : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
              }`}
              title="Toggle Next Lesson widget"
            >
              <GraduationCap className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ask the assistant to tidy things up */}
          <button
            onClick={handleRunAgent}
            disabled={isRunningCycle}
            className="btn-primary flex items-center gap-1.5 text-sm"
            title="Let the assistant tidy up your workspace"
          >
            <Zap className={`w-4 h-4 ${isRunningCycle ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Tidy up</span>
          </button>

          {/* Autonomous Audit Drawer Trigger */}
          <button
            onClick={() => setAgentDrawerOpen(true)}
            className="p-2 rounded-lg text-nordic-text dark:text-zen-text hover:bg-nordic-card dark:hover:bg-zen-card border border-nordic-border dark:border-zen-border transition-colors"
            title="See the assistant's recent activity"
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-nordic-text dark:text-zen-text hover:bg-nordic-card dark:hover:bg-zen-card border border-nordic-border dark:border-zen-border transition-all"
            title={`Switch to ${theme === "dark" ? "light mode" : "dark mode"}`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-nordic-teal transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
