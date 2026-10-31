"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { ModuleId, Tag } from "@/lib/types";
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  DollarSign,
  Mic,
  FolderGit2,
  Instagram,
  Bot,
  Hash,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface SidebarProps {
  metrics?: {
    pendingTasksCount: number;
    urgentTasksCount: number;
    weeklyTrackedHours: number;
    weeklyCapacityLimit: number;
  };
  tags?: Tag[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  metrics = {
    pendingTasksCount: 0,
    urgentTasksCount: 0,
    weeklyTrackedHours: 0,
    weeklyCapacityLimit: 40,
  },
  tags = [],
}) => {
  const { activeModule, setActiveModule, openTagDrawer } = useAppStore();

  const navItems: Array<{
    id: ModuleId;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: "overview",
      label: "Today",
      icon: LayoutDashboard,
    },
    {
      id: "tasks",
      label: "Tasks & Projects",
      icon: CheckSquare,
      badge: metrics.urgentTasksCount > 0 ? `${metrics.urgentTasksCount} urgent` : undefined,
      badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    {
      id: "education",
      label: "Lessons",
      icon: GraduationCap,
    },
    {
      id: "finance",
      label: "Finances",
      icon: DollarSign,
    },
    {
      id: "voice-notes",
      label: "Notes",
      icon: Mic,
    },
    {
      id: "bundler",
      label: "Code Bundler",
      icon: FolderGit2,
    },
    {
      id: "instagram",
      label: "Social Planner",
      icon: Instagram,
    },
    {
      id: "agent",
      label: "Assistant Log",
      icon: Bot,
      badge: "LIVE",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
  ];

  const utilization = Math.min(
    100,
    Math.round((metrics.weeklyTrackedHours / metrics.weeklyCapacityLimit) * 100)
  );

  return (
    <aside className="sidebar min-h-0 shrink-0 overflow-y-auto border-r border-nordic-border dark:border-zen-border flex flex-col justify-between p-4 select-none">
      {/* Top Nav List */}
      <div className="space-y-1">
        <div className="px-2 pb-2 text-xs font-semibold text-nordic-muted dark:text-zen-muted">
          Your workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`sidebar-item w-full flex items-center justify-between gap-2 text-sm transition-all ${
                isActive ? "active" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${
                    item.badgeColor || "bg-nordic-card text-nordic-text border-nordic-border"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Polymorphic Tags Section */}
        {tags.length > 0 && (
          <div className="pt-4">
            <div className="px-2 pb-2 flex items-center justify-between text-xs font-semibold text-nordic-muted dark:text-zen-muted">
              <span>Tags</span>
              <Hash className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-wrap gap-1 px-1 max-h-24 overflow-y-auto">
              {tags.slice(0, 8).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => openTagDrawer(tag)}
                  className="tag hover:border-nordic-teal dark:hover:border-zen-mint transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tag.color || "#0F766E" }}
                  />
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Capacity Guardian Live Bar */}
      <div className="card p-5 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 font-medium text-nordic-text dark:text-zen-text">
            <Activity className="w-3.5 h-3.5 text-nordic-teal dark:text-zen-mint" />
            <span>Weekly Capacity</span>
          </div>
          <span className="text-sm text-nordic-muted dark:text-zen-muted">
            {metrics.weeklyTrackedHours}h / {metrics.weeklyCapacityLimit}h
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-nordic-surface dark:bg-zen-surface rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              utilization > 90
                ? "bg-rose-500"
                : utilization > 75
                ? "bg-amber-500"
                : "bg-nordic-teal dark:bg-zen-mint"
            }`}
            style={{ width: `${Math.max(4, utilization)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-nordic-muted dark:text-zen-muted">
          <span>{utilization}% of your week</span>
          {utilization > 90 ? (
            <span className="text-rose-500 flex items-center gap-0.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Nearly full
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">Comfortable pace</span>
          )}
        </div>
      </div>
    </aside>
  );
};
