"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { AgentActionLog } from "@/lib/types";
import {
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  RefreshCw,
  Activity,
  ShieldCheck,
  Calendar,
  Layers,
} from "lucide-react";

interface AutonomousDaemonViewProps {
  agentLogs: AgentActionLog[];
  onRefreshData: () => void;
}

export const AutonomousDaemonView: React.FC<AutonomousDaemonViewProps> = ({
  agentLogs,
  onRefreshData,
}) => {
  const { showToast } = useAppStore();

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<AgentActionLog[]>(agentLogs);
  const [capacity, setCapacity] = useState<{
    weeklyTrackedHours: number;
    weeklyTargetHours: number;
    utilizationPercent: number;
  }>({
    weeklyTrackedHours: 1.3,
    weeklyTargetHours: 40,
    utilizationPercent: 3,
  });

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/autonomous");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.capacity) setCapacity(data.capacity);
      }
    } catch (err) {
      console.error("Failed to load autonomous status:", err);
    }
  };

  useEffect(() => {
    setLogs(agentLogs);
  }, [agentLogs]);

  const handleRunImmediateCycle = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/autonomous", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("⚡ Autonomous Cycle completed successfully!");
        fetchStatus();
        onRefreshData();
      }
    } catch {
      showToast("Failed to execute autonomous run");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-nordic-border dark:border-zen-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nordic-text dark:text-zen-text flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-500" />
            <span>Autonomostly Autonomous Engine & Worker Daemon</span>
          </h1>
          <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
            15-minute background loop: ledger reconciliation, task snooze audits, homework 24h nags, and capacity guardian.
          </p>
        </div>

        <button
          onClick={handleRunImmediateCycle}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold text-xs shadow-soft hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
          <span>{isRunning ? "Executing Autonomous Rules..." : "Trigger Full Autonomous Cycle Now"}</span>
        </button>
      </div>

      {/* 4 Autonomous Pillars Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-nordic-teal dark:text-zen-mint">Pillar 1</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-semibold text-xs text-nordic-text dark:text-zen-text">
            End-of-Day Ledger Reconciler
          </div>
          <p className="text-[11px] text-nordic-muted dark:text-zen-muted leading-snug">
            Scans active students and completed lessons to automatically generate draft income line items.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-nordic-teal dark:text-zen-mint">Pillar 2</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-semibold text-xs text-nordic-text dark:text-zen-text">
            Task Prioritization & Snooze
          </div>
          <p className="text-[11px] text-nordic-muted dark:text-zen-muted leading-snug">
            Detects stale tasks (&gt;3 days in progress) and moves them into the &ldquo;Clarify or Discard&rdquo; inbox.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-nordic-teal dark:text-zen-mint">Pillar 3</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-semibold text-xs text-nordic-text dark:text-zen-text">
            Homework 24h Nag Engine
          </div>
          <p className="text-[11px] text-nordic-muted dark:text-zen-muted leading-snug">
            Flags pending student submissions 24 hours prior to upcoming lessons and queues reminder alerts.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-nordic-teal dark:text-zen-mint">Pillar 4</span>
            <Activity className="w-4 h-4 text-nordic-blue dark:text-zen-ice" />
          </div>
          <div className="font-semibold text-xs text-nordic-text dark:text-zen-text">
            Capacity Guardian
          </div>
          <p className="text-[11px] text-nordic-muted dark:text-zen-muted leading-snug">
            Compares total tracked time against the 40h weekly target ceiling and warns of burn-out risks.
          </p>
        </div>
      </div>

      {/* Chronological Audit Log Table */}
      <div className="p-5 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-nordic-border dark:border-zen-border">
          <div>
            <h3 className="text-sm font-bold text-nordic-text dark:text-zen-text">
              Real-Time Audit Timeline
            </h3>
            <p className="text-xs text-nordic-muted dark:text-zen-muted">
              Chronological log of every automated reconciliation and system evaluation.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border text-xs text-nordic-muted dark:text-zen-muted hover:text-nordic-text"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {logs.map((log) => {
            const isWarning = log.status === "WARNING";
            const isSuccess = log.status === "SUCCESS";
            return (
              <div
                key={log.id}
                className={`p-3.5 rounded-xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isWarning
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                    : isSuccess
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                    : "bg-nordic-card dark:bg-zen-card border-nordic-border dark:border-zen-border text-nordic-text dark:text-zen-text"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Info className="w-4 h-4 text-nordic-blue dark:text-zen-ice" />
                    )}
                    <span className="font-mono font-bold text-xs uppercase">
                      {log.actionType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="opacity-90">{log.description}</p>
                </div>

                <div className="text-[11px] font-mono text-nordic-muted dark:text-zen-muted shrink-0">
                  {new Date(log.timestamp).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
