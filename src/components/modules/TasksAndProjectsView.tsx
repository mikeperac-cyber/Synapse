"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Task, Project, Goal } from "@/lib/types";
import {
  Plus,
  Play,
  CheckCircle2,
  CheckSquare,
  Clock,
  FolderGit2,
  Target,
  Sparkles,
  AlertTriangle,
  FileCode2,
  Kanban,
  TrendingUp,
  RotateCcw,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";

interface TasksAndProjectsViewProps {
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  onRefreshData: () => void;
}

export const TasksAndProjectsView: React.FC<TasksAndProjectsViewProps> = ({
  tasks,
  projects,
  goals,
  onRefreshData,
}) => {
  const { startTimer, showToast, openTagDrawer } = useAppStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<"KANBAN" | "PROJECTS" | "GOALS">("KANBAN");

  // Create Task Form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [newTaskEst, setNewTaskEst] = useState(30);
  const [newTaskProject, setNewTaskProject] = useState("");

  // Create Project Form
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjStage, setNewProjStage] = useState<"IDEATION" | "BUILD" | "TRACK">("BUILD");
  const [newProjRate, setNewProjRate] = useState(85);

  // Selected Project for Ideation Markdown canvas
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(
    projects[0] || null
  );
  const [markdownDocText, setMarkdownDocText] = useState(
    selectedProjectForEdit?.markdownDoc || ""
  );

  const filteredTasks = tasks.filter((t) => {
    if (selectedProjectId === "ALL") return true;
    return t.projectId === selectedProjectId;
  });

  const columns = [
    { id: "TODO", label: "To Do", color: "border-slate-400/50" },
    { id: "IN_PROGRESS", label: "In Progress", color: "border-nordic-blue/60 dark:border-zen-ice/60" },
    { id: "DONE", label: "Completed", color: "border-emerald-500/60" },
    { id: "CLARIFY_OR_DISCARD", label: "Clarify / Stale Inbox", color: "border-rose-500/60" },
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          estimatedMinutes: newTaskEst,
          projectId: newTaskProject || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✨ Task created!");
        setNewTaskTitle("");
        onRefreshData();
      }
    } catch {
      showToast("Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
      }
    } catch {
      showToast("Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Task deleted");
        onRefreshData();
      }
    } catch {
      showToast("Failed to delete task");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProjTitle.trim(),
          description: newProjDesc.trim(),
          stage: newProjStage,
          hourlyRate: newProjRate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("🚀 Project created!");
        setNewProjTitle("");
        setNewProjDesc("");
        onRefreshData();
      }
    } catch {
      showToast("Failed to create project");
    }
  };

  const handleSaveMarkdownCanvas = async () => {
    if (!selectedProjectForEdit) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectForEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdownDoc: markdownDocText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("💾 Ideation canvas saved!");
        onRefreshData();
      }
    } catch {
      showToast("Failed to save markdown canvas");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-nordic-border dark:border-zen-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nordic-text dark:text-zen-text flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-nordic-teal dark:text-zen-mint" />
            <span>Tasks, Projects & Realistic Goals</span>
          </h1>
          <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
            Three-stage project lifecycle, stopwatch task roll-up, and S.M.A.R.T. capacity audits.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border">
          <button
            onClick={() => setActiveTab("KANBAN")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "KANBAN"
                ? "bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold shadow-xs"
                : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setActiveTab("PROJECTS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "PROJECTS"
                ? "bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold shadow-xs"
                : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Project Lifecycle ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("GOALS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "GOALS"
                ? "bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold shadow-xs"
                : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>S.M.A.R.T. Goals ({goals.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === "KANBAN" && (
        <div className="space-y-4">
          {/* Quick Create Task Bar & Project Filter */}
          <div className="p-3 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <form onSubmit={handleCreateTask} className="w-full md:w-auto flex-1 flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add new task..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
                className="px-2 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <select
                value={newTaskProject}
                onChange={(e) => setNewTaskProject(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-medium disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-nordic-muted dark:text-zen-muted">Filter:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text font-medium"
              >
                <option value="ALL">All Projects ({tasks.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="rounded-2xl bg-nordic-card/50 dark:bg-zen-card/50 border border-nordic-border dark:border-zen-border flex flex-col min-h-[500px]"
                >
                  {/* Column Header */}
                  <div
                    className={`p-3 border-b border-nordic-border dark:border-zen-border flex items-center justify-between border-t-2 ${col.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-nordic-text dark:text-zen-text">
                        {col.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-nordic-surface dark:bg-zen-surface text-nordic-muted dark:text-zen-muted font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-nordic-muted dark:text-zen-muted">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const isStale = task.isStale || task.status === "CLARIFY_OR_DISCARD";
                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl bg-nordic-surface dark:bg-zen-surface border transition-all shadow-soft space-y-2 ${
                              isStale
                                ? "border-rose-500/40 bg-rose-500/5"
                                : "border-nordic-border dark:border-zen-border hover:border-nordic-teal/50 dark:hover:border-zen-mint/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span
                                className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                                  task.priority === "URGENT"
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                    : task.priority === "HIGH"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {task.priority}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startTimer(task.id, task.title, "STOPWATCH")}
                                  className="p-1 rounded text-nordic-teal dark:text-zen-mint hover:bg-nordic-card dark:hover:bg-zen-card"
                                  title="Start stopwatch for this task"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded text-nordic-muted hover:text-rose-500"
                                  title="Delete task"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs font-semibold text-nordic-text dark:text-zen-text leading-snug">
                              {task.title}
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-nordic-muted dark:text-zen-muted line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {task.project && (
                              <div className="text-[10px] text-nordic-teal dark:text-zen-mint font-medium flex items-center gap-1">
                                <FolderGit2 className="w-3 h-3" />
                                <span>{task.project.title}</span>
                              </div>
                            )}

                            {/* Tracked time and roll-up rate */}
                            <div className="flex items-center justify-between text-[10px] text-nordic-muted dark:text-zen-muted pt-1 border-t border-nordic-border/50 dark:border-zen-border/50 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-nordic-teal dark:text-zen-mint" />
                                {task.trackedMinutes}m logged
                              </span>

                              {/* Status Select dropdown */}
                              <select
                                value={task.status}
                                onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                className="bg-transparent text-[10px] font-mono uppercase text-nordic-text dark:text-zen-text outline-none cursor-pointer"
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                                <option value="CLARIFY_OR_DISCARD">Clarify</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECT LIFECYCLE (Ideation, Build, Track) */}
      {activeTab === "PROJECTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Projects List & Creation */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
                Create New Project
              </h3>
              <form onSubmit={handleCreateProject} className="space-y-2 text-xs">
                <input
                  type="text"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  placeholder="Project name..."
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
                <textarea
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Scope and purpose..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newProjStage}
                    onChange={(e) => setNewProjStage(e.target.value as "IDEATION" | "BUILD" | "TRACK")}
                    className="px-2 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                  >
                    <option value="IDEATION">1. Ideation</option>
                    <option value="BUILD">2. Build</option>
                    <option value="TRACK">3. Track</option>
                  </select>
                  <input
                    type="number"
                    value={newProjRate}
                    onChange={(e) => setNewProjRate(Number(e.target.value))}
                    placeholder="Rate $/h"
                    className="px-2 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newProjTitle.trim()}
                  className="w-full py-2 rounded-lg bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-medium disabled:opacity-50"
                >
                  Create Project
                </button>
              </form>
            </div>

            {/* List of Projects */}
            <div className="space-y-2">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectForEdit(proj);
                    setMarkdownDocText(proj.markdownDoc || "");
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedProjectForEdit?.id === proj.id
                      ? "border-nordic-teal dark:border-zen-mint bg-nordic-teal/5 dark:bg-zen-mint/5"
                      : "border-nordic-border dark:border-zen-border bg-nordic-surface dark:bg-zen-surface hover:bg-nordic-card dark:hover:bg-zen-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-nordic-text dark:text-zen-text">
                      {proj.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-nordic-card dark:bg-zen-card text-nordic-teal dark:text-zen-mint font-bold">
                      {proj.stage}
                    </span>
                  </div>

                  <p className="text-[11px] text-nordic-muted dark:text-zen-muted line-clamp-2">
                    {proj.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-nordic-muted dark:text-zen-muted mt-2 font-mono">
                    <span>Velocity: {proj.velocityScore}%</span>
                    <span>Health: {proj.healthScore}%</span>
                    <span>Rate: ${proj.hourlyRate}/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Lifecycle Details & Ideation Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {selectedProjectForEdit ? (
              <div className="p-5 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-nordic-border dark:border-zen-border">
                  <div>
                    <h2 className="text-base font-bold text-nordic-text dark:text-zen-text">
                      {selectedProjectForEdit.title}
                    </h2>
                    <p className="text-xs text-nordic-muted dark:text-zen-muted">
                      Three-stage lifecycle editor & auto-diagramming canvas
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProjectForEdit.stage}
                      onChange={async (e) => {
                        const newStage = e.target.value;
                        await fetch(`/api/projects/${selectedProjectForEdit.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ stage: newStage }),
                        });
                        onRefreshData();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border text-xs font-mono font-bold text-nordic-teal dark:text-zen-mint outline-none"
                    >
                      <option value="IDEATION">Stage 1: Ideation</option>
                      <option value="BUILD">Stage 2: Build</option>
                      <option value="TRACK">Stage 3: Track</option>
                    </select>

                    <button
                      onClick={handleSaveMarkdownCanvas}
                      className="px-3 py-1 rounded-lg bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg text-xs font-medium"
                    >
                      Save Canvas
                    </button>
                  </div>
                </div>

                {/* Markdown Canvas with Auto-Diagramming Note */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-nordic-text dark:text-zen-text">
                    <span className="flex items-center gap-1.5">
                      <FileCode2 className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                      <span>Stage 1: Markdown Blueprint & Architecture Mindmap</span>
                    </span>
                    <span className="text-[10px] text-nordic-muted dark:text-zen-muted font-mono">
                      Markdown + Mermaid supported
                    </span>
                  </div>

                  <textarea
                    value={markdownDocText}
                    onChange={(e) => setMarkdownDocText(e.target.value)}
                    rows={12}
                    className="w-full p-3 rounded-xl bg-nordic-card/60 dark:bg-zen-card/60 border border-nordic-border dark:border-zen-border font-mono text-xs text-nordic-text dark:text-zen-text outline-none leading-relaxed"
                  />
                </div>

                {/* Milestone Health & Velocity Scoring */}
                <div className="p-4 rounded-xl bg-nordic-card/60 dark:bg-zen-card/60 border border-nordic-border dark:border-zen-border grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] text-nordic-muted dark:text-zen-muted uppercase font-mono">
                      Milestone Velocity
                    </div>
                    <div className="text-lg font-mono font-bold text-nordic-teal dark:text-zen-mint">
                      {selectedProjectForEdit.velocityScore}%
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Pace is on-track</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-nordic-muted dark:text-zen-muted uppercase font-mono">
                      Health Metric
                    </div>
                    <div className="text-lg font-mono font-bold text-nordic-blue dark:text-zen-ice">
                      {selectedProjectForEdit.healthScore}%
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Zero blockers</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-nordic-muted dark:text-zen-muted uppercase font-mono">
                      Hourly Cost Basis
                    </div>
                    <div className="text-lg font-mono font-bold text-nordic-text dark:text-zen-text">
                      ${selectedProjectForEdit.hourlyRate}
                    </div>
                    <div className="text-[10px] text-nordic-muted dark:text-zen-muted">Auto-rolled up to ledger</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-nordic-muted dark:text-zen-muted">
                Select a project to inspect its lifecycle canvas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: S.M.A.R.T. REALISTIC GOAL ENGINE */}
      {activeTab === "GOALS" && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-nordic-text dark:text-zen-text flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>S.M.A.R.T. Validation & Capacity Auditor</span>
              </h2>
              <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
                Automated auditing of goal feasibility against total weekly available hours (40h human capacity limit).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Autonomous Feasibility Layer
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const isOver = goal.realismStatus === "OVERCAPACITY";
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    isOver
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
                      : "bg-nordic-surface dark:bg-zen-surface border-nordic-border dark:border-zen-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-nordic-text dark:text-zen-text leading-tight">
                      {goal.title}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                        isOver
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {goal.realismStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-nordic-muted dark:text-zen-muted">
                      <span>Domain:</span>
                      <span className="font-mono text-nordic-text dark:text-zen-text font-medium">
                        {goal.targetCategory}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-nordic-muted dark:text-zen-muted">
                      <span>Weekly Allocation:</span>
                      <span className="font-mono font-bold text-nordic-teal dark:text-zen-mint">
                        {goal.targetHoursPerWeek} hrs / week
                      </span>
                    </div>
                  </div>

                  {/* S.M.A.R.T. breakdown */}
                  <div className="p-2.5 rounded-xl bg-nordic-card/60 dark:bg-zen-card/60 border border-nordic-border/50 dark:border-zen-border/50 space-y-1 text-[11px]">
                    {goal.smartSpecific && (
                      <div>
                        <span className="font-bold">Specific:</span> {goal.smartSpecific}
                      </div>
                    )}
                    {goal.smartMeasurable && (
                      <div>
                        <span className="font-bold">Measurable:</span> {goal.smartMeasurable}
                      </div>
                    )}
                    {goal.smartAchievable && (
                      <div>
                        <span className="font-bold">Achievable:</span> {goal.smartAchievable}
                      </div>
                    )}
                  </div>

                  {goal.rationale && (
                    <div
                      className={`p-2 rounded-lg text-[10px] leading-relaxed ${
                        isOver
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 font-medium"
                          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {goal.rationale}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
