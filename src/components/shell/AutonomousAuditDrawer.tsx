"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { AgentActionLog } from "@/lib/types";
import {
  X,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  RefreshCw,
  Activity,
  ShieldCheck,
} from "lucide-react";

interface AutonomousAuditDrawerProps {
  onRefreshData?: () => void;
}

export const AutonomousAuditDrawer: React.FC<AutonomousAuditDrawerProps> = ({ onRefreshData }) => {
  const { agentDrawerOpen, setAgentDrawerOpen, showToast } = useAppStore();

  const [logs, setLogs] = useState<AgentActionLog[]>([]);
  const [capacity, setCapacity] = useState<{
    weeklyTrackedHours: number;
    weeklyTargetHours: number;
    utilizationPercent: number;
  }>({
    weeklyTrackedHours: 0,
    weeklyTargetHours: 40,
    utilizationPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/autonomous");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.capacity) setCapacity(data.capacity);
      }
    } catch (err) {
      console.error("Failed to load autonomous logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (agentDrawerOpen) {
      fetchLogs();
    }
  }, [agentDrawerOpen]);

  const handleRunCycle = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/autonomous", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("⚡ Autonomous Cycle completed successfully!");
        fetchLogs();
        if (onRefreshData) onRefreshData();
      }
    } catch {
      showToast("Failed to execute autonomous run");
    } finally {
      setIsRunning(false);
    }
  };

  if (!agentDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg h-full bg-nordic-surface dark:bg-zen-surface border-l border-nordic-border dark:border-zen-border shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-nordic-border dark:border-zen-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-nordic-text dark:text-zen-text">
                  Autonomostly Background Engine
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-nordic-muted dark:text-zen-muted">
                15-minute autonomous loop for ledger, tasks & capacity
              </p>
            </div>
          </div>

          <button
            onClick={() => setAgentDrawerOpen(false)}
            className="p-1 rounded-lg text-nordic-muted hover:text-nordic-text dark:hover:text-zen-text hover:bg-nordic-card dark:hover:bg-zen-card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Dashboard & Trigger */}
        <div className="p-4 bg-nordic-card/40 dark:bg-zen-card/40 border-b border-nordic-border dark:border-zen-border space-y-3">
          {/* Rules Summary Card */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border">
              <div className="flex items-center gap-1.5 font-medium text-nordic-text dark:text-zen-text mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-nordic-teal dark:text-zen-mint" />
                <span>Active Rules</span>
              </div>
              <div className="text-[11px] text-nordic-muted dark:text-zen-muted space-y-0.5">
                <div>• Ledger Reconciler</div>
                <div>• Task Snooze Auditor</div>
                <div>• Homework 24h Nag</div>
                <div>• Capacity Guardian</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border">
              <div className="flex items-center gap-1.5 font-medium text-nordic-text dark:text-zen-text mb-1">
                <Activity className="w-3.5 h-3.5 text-nordic-blue dark:text-zen-ice" />
                <span>Weekly Utilization</span>
              </div>
              <div className="text-lg font-mono font-bold text-nordic-text dark:text-zen-text">
                {capacity.weeklyTrackedHours}h{" "}
                <span className="text-xs font-normal text-nordic-muted dark:text-zen-muted">
                  / {capacity.weeklyTargetHours}h
                </span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                {capacity.utilizationPercent}% safe cognitive bandwidth
              </div>
            </div>
          </div>

          <button
            onClick={handleRunCycle}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-nordic-teal hover:bg-nordic-tealHover dark:bg-zen-mint dark:hover:bg-teal-400 text-white dark:text-zen-bg font-medium text-xs transition-all shadow-soft active:scale-98 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Executing Autonomous Rules..." : "Trigger Full Autonomous Cycle Now"}</span>
          </button>
        </div>

        {/* Chronological Audit Logs */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] uppercase font-mono font-semibold text-nordic-muted dark:text-zen-muted tracking-wider">
              Chronological Audit Trail
            </span>
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="text-[10px] text-nordic-muted dark:text-zen-muted hover:text-nordic-text flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-nordic-muted dark:text-zen-muted text-xs">
              No audit logs recorded yet. Trigger a cycle to see real-time updates.
            </div>
          ) : (
            logs.map((log) => {
              const isWarning = log.status === "WARNING";
              const isSuccess = log.status === "SUCCESS";
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isWarning
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                      : isSuccess
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                      : "bg-nordic-card dark:bg-zen-card border-nordic-border dark:border-zen-border text-nordic-text dark:text-zen-text"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {isWarning ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-nordic-blue dark:text-zen-ice shrink-0" />
                      )}
                      <span className="font-mono text-[11px] uppercase tracking-wide">
                        {log.actionType.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-nordic-muted dark:text-zen-muted font-mono shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-90">{log.description}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-nordic-border dark:border-zen-border bg-nordic-card/50 dark:bg-zen-card/50 text-[11px] text-nordic-muted dark:text-zen-muted flex items-center justify-between">
          <span>Loop Interval: 15 minutes</span>
          <span className="font-mono text-[10px]">Worker ID: autonomostly-01</span>
        </div>
      </div>
    </div>
  );
};
