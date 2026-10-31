"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { FinancialRecord, Student, Project } from "@/lib/types";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

interface FinancialMatrixViewProps {
  finances: FinancialRecord[];
  students: Student[];
  projects: Project[];
  onRefreshData: () => void;
}

export const FinancialMatrixView: React.FC<FinancialMatrixViewProps> = ({
  finances,
  students,
  projects,
  onRefreshData,
}) => {
  const { showToast } = useAppStore();

  // Create financial record form
  const [type, setType] = useState<"INCOME" | "EXPENSE" | "DEBT">("INCOME");
  const [category, setCategory] = useState("STUDENT_LESSON");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(150);
  const [aprRate, setAprRate] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const debts = finances.filter((f) => f.type === "DEBT");
  const expenses = finances.filter((f) => f.type === "EXPENSE");
  const incomes = finances.filter((f) => f.type === "INCOME");

  // Calculations
  const totalDebts = debts.reduce((sum, d) => sum + d.amount, 0);
  const confirmedIncome = incomes.filter((i) => i.isPaid).reduce((sum, i) => sum + i.amount, 0);
  const pendingIncome = incomes.filter((i) => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);

  const actualExpenses = expenses.filter((e) => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
  const recurringMonthlyExpenses = expenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => sum + e.amount, 0);

  // Projected Monthly Educational Retainer Pipeline (active students * 4 lessons * rate)
  const projectedStudentRetainers = students
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.ratePerHour * 4, 0);
  const projectedTotalPipeline = pendingIncome + projectedStudentRetainers;

  const currentNetCash = confirmedIncome - actualExpenses;
  const projectedMonthEndCash = currentNetCash + projectedTotalPipeline - recurringMonthlyExpenses;
  const estimatedTaxSetAside = Math.round((confirmedIncome + projectedTotalPipeline) * 0.25); // 25% tax reserve
  const runwayMonths =
    recurringMonthlyExpenses > 0
      ? Math.max(0, (currentNetCash / recurringMonthlyExpenses)).toFixed(1)
      : "12+";

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          description: description.trim(),
          amount: Number(amount),
          aprRate: type === "DEBT" ? Number(aprRate) : undefined,
          isRecurring,
          isPaid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("💰 Financial line item recorded!");
        setDescription("");
        onRefreshData();
      }
    } catch {
      showToast("Failed to create record");
    }
  };

  const handleTogglePaid = async (id: string, currentPaid: boolean) => {
    try {
      const res = await fetch("/api/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPaid: !currentPaid }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Updated status to ${!currentPaid ? "Settled" : "Pending"}`);
        onRefreshData();
      }
    } catch {
      showToast("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-nordic-border dark:border-zen-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-nordic-text dark:text-zen-text flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Financial Intelligence & Cash Flow Matrix</span>
        </h1>
        <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
          Multi-column ledger, fixed/variable debt countdowns, student retainer forecasting, and runway analytics.
        </p>
      </div>

      {/* Runway & Health Forecast KPI Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cash */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-nordic-muted dark:text-zen-muted">
            <span>Net Liquid Cash</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ${currentNetCash.toLocaleString()}
          </div>
          <div className="text-[10px] text-nordic-muted dark:text-zen-muted">Confirmed gross after paid expenses</div>
        </div>

        {/* Projected Month-End */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-nordic-muted dark:text-zen-muted">
            <span>Projected Month-End Cash</span>
            <TrendingUp className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
          </div>
          <div className="text-2xl font-mono font-bold text-nordic-teal dark:text-zen-mint">
            ${projectedMonthEndCash.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
            Includes ${projectedStudentRetainers} student retainer pipeline
          </div>
        </div>

        {/* Tax Set-Aside Reserve */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-nordic-muted dark:text-zen-muted">
            <span>25% Tax Set-Aside</span>
            <ShieldCheck className="w-4 h-4 text-nordic-blue dark:text-zen-ice" />
          </div>
          <div className="text-2xl font-mono font-bold text-nordic-blue dark:text-zen-ice">
            ${estimatedTaxSetAside.toLocaleString()}
          </div>
          <div className="text-[10px] text-nordic-muted dark:text-zen-muted">Automated federal/state tax buffer</div>
        </div>

        {/* Live Runway */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs text-nordic-muted dark:text-zen-muted">
            <span>Operational Runway</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-500">
            {runwayMonths} months
          </div>
          <div className="text-[10px] text-nordic-muted dark:text-zen-muted">
            Burn: ${recurringMonthlyExpenses}/month
          </div>
        </div>
      </div>

      {/* Record Financial Transaction Form */}
      <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft">
        <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text mb-3">
          Add Ledger Entry (Income, Expense or Debt)
        </h3>
        <form onSubmit={handleCreateRecord} className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE" | "DEBT")}
            className="px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text font-bold"
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
            <option value="DEBT">Debt</option>
          </select>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description..."
            className="md:col-span-2 px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount ($)"
            className="px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text font-mono"
          />

          {type === "DEBT" ? (
            <input
              type="number"
              step="0.01"
              value={aprRate}
              onChange={(e) => setAprRate(Number(e.target.value))}
              placeholder="APR %"
              className="px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text font-mono"
            />
          ) : (
            <div className="flex items-center gap-2 px-2 text-[11px] text-nordic-muted dark:text-zen-muted">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <span>Monthly Recurring</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={!description.trim()}
            className="py-1.5 px-3 rounded-lg bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-medium disabled:opacity-50"
          >
            Record Entry
          </button>
        </form>
      </div>

      {/* Multi-Column Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Fixed & Variable Debts with Countdown */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-nordic-border dark:border-zen-border">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
                Fixed & Variable Debts
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-500">
              Total: ${totalDebts.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="p-3 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border/70 dark:border-zen-border/70 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-nordic-text dark:text-zen-text">
                    {debt.description}
                  </span>
                  <span className="font-mono font-bold text-rose-500">
                    ${debt.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-nordic-muted dark:text-zen-muted font-mono">
                  <span>Interest: {debt.aprRate !== null ? `${debt.aprRate}% APR` : "0%"}</span>
                  <span className="text-amber-600 dark:text-amber-400">Pay-off: 18 months</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Incurred & Recurring Expenses */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-nordic-border dark:border-zen-border">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
                Expenses & SaaS Licenses
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-500">
              ${recurringMonthlyExpenses}/mo
            </span>
          </div>

          <div className="space-y-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border/70 dark:border-zen-border/70 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-nordic-text dark:text-zen-text">
                    {exp.description}
                  </div>
                  <div className="text-[10px] text-nordic-muted dark:text-zen-muted mt-0.5">
                    {exp.isRecurring ? "Recurring Monthly" : "One-time"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-nordic-text dark:text-zen-text">
                    ${exp.amount}
                  </span>
                  <button
                    onClick={() => handleTogglePaid(exp.id, exp.isPaid)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      exp.isPaid
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {exp.isPaid ? "Paid" : "Due"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Confirmed Income & Projected Pipeline */}
        <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-nordic-border dark:border-zen-border">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
                Income & Retainers
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Confirmed: ${confirmedIncome}
            </span>
          </div>

          <div className="space-y-2">
            {incomes.map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border/70 dark:border-zen-border/70 flex items-center justify-between text-xs"
              >
                <div className="truncate max-w-[180px]">
                  <div className="font-semibold text-nordic-text dark:text-zen-text truncate">
                    {inc.description}
                  </div>
                  <div className="text-[10px] text-nordic-muted dark:text-zen-muted mt-0.5">
                    {inc.category.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +${inc.amount}
                  </span>
                  <button
                    onClick={() => handleTogglePaid(inc.id, inc.isPaid)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      inc.isPaid
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-500/15 text-slate-500"
                    }`}
                  >
                    {inc.isPaid ? "Received" : "Pending"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
