"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  Task,
  Project,
  Goal,
  Student,
  Lesson,
  Homework,
  FinancialRecord,
  VoiceMemo,
  Note,
  InstagramPost,
  RepoBundle,
  Tag,
  AgentActionLog,
} from "@/lib/types";

import { Header } from "@/components/shell/Header";
import { Sidebar } from "@/components/shell/Sidebar";
import { PinnedHub } from "@/components/shell/PinnedHub";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { UniversalTagDrawer } from "@/components/shell/UniversalTagDrawer";
import { AutonomousAuditDrawer } from "@/components/shell/AutonomousAuditDrawer";

import { DashboardOverview } from "@/components/modules/DashboardOverview";
import { TasksAndProjectsView } from "@/components/modules/TasksAndProjectsView";
import { EducationAcademyView } from "@/components/modules/EducationAcademyView";
import { FinancialMatrixView } from "@/components/modules/FinancialMatrixView";
import { VoiceAndNotesView } from "@/components/modules/VoiceAndNotesView";
import { RepoBundlerView } from "@/components/modules/RepoBundlerView";
import { InstagramEngineView } from "@/components/modules/InstagramEngineView";
import { AutonomousDaemonView } from "@/components/modules/AutonomousDaemonView";

export default function OmniSpherePage() {
  const { activeModule, toastMessage, clearToast, theme } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    tasks: Task[];
    projects: Project[];
    goals: Goal[];
    students: Student[];
    lessons: Lesson[];
    homeworks: Homework[];
    finances: FinancialRecord[];
    voiceMemos: VoiceMemo[];
    notes: Note[];
    instagramPosts: InstagramPost[];
    repoBundles: RepoBundle[];
    tags: Tag[];
    agentLogs: AgentActionLog[];
    metrics: {
      netCash: number;
      totalIncome: number;
      totalExpense: number;
      totalDebt: number;
      monthlyBurn: number;
      runwayMonths: string | number;
      weeklyTrackedHours: number;
      weeklyCapacityLimit: number;
      pendingTasksCount: number;
      activeStudentsCount: number;
      urgentTasksCount: number;
      nextLesson: Lesson | null;
    };
  }>({
    tasks: [],
    projects: [],
    goals: [],
    students: [],
    lessons: [],
    homeworks: [],
    finances: [],
    voiceMemos: [],
    notes: [],
    instagramPosts: [],
    repoBundles: [],
    tags: [],
    agentLogs: [],
    metrics: {
      netCash: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalDebt: 0,
      monthlyBurn: 0,
      runwayMonths: "12+",
      weeklyTrackedHours: 0,
      weeklyCapacityLimit: 40,
      pendingTasksCount: 0,
      activeStudentsCount: 0,
      urgentTasksCount: 0,
      nextLesson: null,
    },
  });

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/overview");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Initial theme sync from localStorage; light professional theme is the default
    const savedTheme = localStorage.getItem("omnisphere_theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      useAppStore.getState().setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      useAppStore.getState().setTheme("light");
    }

    // Set up autonomous background interval (every 15 minutes, or periodic heartbeat)
    const autonomousInterval = setInterval(async () => {
      try {
        console.log("⏰ Running scheduled assistant pass...");
        await fetch("/api/autonomous", { method: "POST" });
        loadData();
      } catch (e) {
        console.warn("Scheduled assistant pass skipped:", e);
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(autonomousInterval);
  }, [loadData]);

  return (
    <div className="h-screen overflow-hidden bg-nordic-bg dark:bg-zen-bg text-nordic-text dark:text-zen-text flex flex-col">
      {/* Top operational bar */}
      <Header onRefreshData={loadData} />

      {/* High-frequency dockable pinned workspace */}
      <PinnedHub
        tasks={data.tasks}
        lessons={data.lessons}
        metrics={data.metrics}
        onRefreshData={loadData}
      />

      {/* Main split: sidebar + dynamic module workspace */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar metrics={data.metrics} tags={data.tags} />

        <main className="dashboard min-h-0 min-w-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-nordic-muted dark:text-zen-muted text-base">
              <span className="animate-pulse">Gathering your day…</span>
            </div>
          ) : (
            <>
              {activeModule === "overview" && (
                <DashboardOverview
                  tasks={data.tasks}
                  projects={data.projects}
                  goals={data.goals}
                  students={data.students}
                  lessons={data.lessons}
                  finances={data.finances}
                  notes={data.notes}
                  instagramPosts={data.instagramPosts}
                  metrics={data.metrics}
                  onRefreshData={loadData}
                />
              )}

              {activeModule === "tasks" && (
                <TasksAndProjectsView
                  tasks={data.tasks}
                  projects={data.projects}
                  goals={data.goals}
                  onRefreshData={loadData}
                />
              )}

              {activeModule === "education" && (
                <EducationAcademyView
                  students={data.students}
                  lessons={data.lessons}
                  homeworks={data.homeworks}
                  onRefreshData={loadData}
                />
              )}

              {activeModule === "finance" && (
                <FinancialMatrixView
                  finances={data.finances}
                  students={data.students}
                  projects={data.projects}
                  onRefreshData={loadData}
                />
              )}

              {activeModule === "voice-notes" && (
                <VoiceAndNotesView
                  voiceMemos={data.voiceMemos}
                  notes={data.notes}
                  onRefreshData={loadData}
                />
              )}

              {activeModule === "bundler" && (
                <RepoBundlerView
                  bundles={data.repoBundles}
                  onRefreshData={loadData}
                />
              )}

              {activeModule === "instagram" && (
                <InstagramEngineView
                  posts={data.instagramPosts}
                  onRefreshData={loadData}
                />
              )}

              {activeModule === "agent" && (
                <AutonomousDaemonView
                  agentLogs={data.agentLogs}
                  onRefreshData={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global interactive Drawers & Dialogs */}
      <CommandPalette onRefreshData={loadData} />
      <UniversalTagDrawer />
      <AutonomousAuditDrawer onRefreshData={loadData} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-nordic-surface dark:bg-zen-surface border border-nordic-teal dark:border-zen-mint text-nordic-text dark:text-zen-text text-sm shadow-card">
            <span>{toastMessage}</span>
            <button
              onClick={clearToast}
              className="text-nordic-muted hover:text-nordic-text dark:hover:text-zen-text"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
