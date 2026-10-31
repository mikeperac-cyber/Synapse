"use client";

import React, { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import {
  Task,
  Project,
  Goal,
  Student,
  Lesson,
  FinancialRecord,
  Note,
  InstagramPost,
} from "@/lib/types";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  DollarSign,
  FolderGit2,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Target,
} from "lucide-react";

type AccentKey = "blue" | "amber" | "emerald" | "purple" | "rose";

interface DashboardMetrics {
  netCash: number;
  monthlyBurn: number;
  runwayMonths: string | number;
  weeklyTrackedHours: number;
  weeklyCapacityLimit: number;
}

interface DashboardOverviewProps {
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  students: Student[];
  lessons: Lesson[];
  finances: FinancialRecord[];
  notes: Note[];
  instagramPosts: InstagramPost[];
  metrics: DashboardMetrics;
  onRefreshData: () => void;
}

/** Tailwind classes per domain accent. Keeps colour choices in one place. */
const ACCENTS: Record<AccentKey, { icon: string; soft: string; text: string; border: string; solid: string }> = {
  blue: {
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    soft: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200/70 dark:border-blue-900/50",
    solid: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    soft: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200/70 dark:border-amber-900/50",
    solid: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/70 dark:border-emerald-900/50",
    solid: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
  },
  purple: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    soft: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200/70 dark:border-violet-900/50",
    solid: "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    soft: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200/70 dark:border-rose-900/50",
    solid: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400",
  },
};

const CARD = "card p-8";

function greetingForHour(hour: number): { text: string; emoji: string } {
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 18) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

function formatMoney(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString()}`;
}

/** One metric in the horizontal stats bar. */
const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  accent: AccentKey;
  hint?: string;
  /** `bar` = compact stat inside the horizontal bar; `card` = full KPI tile. */
  variant?: "bar" | "card";
}> = ({ label, value, accent, hint, variant = "bar" }) => {
  if (variant === "card") {
    return (
      <div className="kpi-card flex flex-col justify-between">
        <div>
          <div className="kpi-label">{label}</div>
          <div className={`kpi-value ${ACCENTS[accent].text}`}>{value}</div>
        </div>
        {hint ? <div className="mt-2 text-xs text-nordic-muted dark:text-zen-muted">{hint}</div> : null}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="kpi-label">{label}</div>
      <div className={`mt-2 text-3xl font-bold leading-tight tracking-tight ${ACCENTS[accent].text}`}>
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-nordic-muted dark:text-zen-muted">{hint}</div>
      ) : null}
    </div>
  );
};

/** Section shell: heading row with domain colour, optional "see all" action. */
const SectionCard: React.FC<{
  accent: AccentKey;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}> = ({ accent, icon: Icon, title, subtitle, actionLabel, onAction, children }) => (
  <section className={`${CARD} space-y-5`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent].icon}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-nordic-text dark:text-zen-text">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-nordic-muted dark:text-zen-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={`flex shrink-0 items-center gap-1 text-sm font-medium hover:underline ${ACCENTS[accent].text}`}
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
    {children}
  </section>
);

/** Friendly empty state: icon, headline, hint, optional primary action. */
const EmptyState: React.FC<{
  icon: React.ElementType;
  accent: AccentKey;
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon: Icon, accent, title, hint, actionLabel, onAction }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-nordic-border dark:border-zen-border px-6 py-10 text-center">
    <Icon className={`h-12 w-12 ${ACCENTS[accent].text} opacity-70`} aria-hidden />
    <h3 className="mt-4 text-base font-semibold text-nordic-text dark:text-zen-text">{title}</h3>
    <p className="mt-1 max-w-xs text-sm text-nordic-muted dark:text-zen-muted">{hint}</p>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className={`mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors ${ACCENTS[accent].solid}`}
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
);

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  projects,
  goals,
  students,
  lessons,
  finances,
  notes,
  instagramPosts,
  metrics,
  onRefreshData,
}) => {
  const { setActiveModule, startTimer } = useAppStore();

  // All list work is memoised so the dashboard stays cheap on every render tick.
  const view = useMemo(() => {
    const pending = tasks.filter((t) => t.status !== "DONE");
    const urgent = pending.filter((t) => t.priority === "URGENT");

    const now = Date.now();
    const upcoming = lessons
      .filter((l) => l.status === "SCHEDULED" && new Date(l.scheduledAt).getTime() > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const capacityLimit = metrics.weeklyCapacityLimit > 0 ? metrics.weeklyCapacityLimit : 40;
    const capacityPct = Math.round((metrics.weeklyTrackedHours / capacityLimit) * 100);

    return {
      pending,
      urgent: urgent.slice(0, 4),
      urgentCount: urgent.length,
      nextLesson: upcoming[0] ?? null,
      laterLessons: upcoming.slice(1, 3),
      upcomingCount: upcoming.length,
      activeProjects: projects.slice(0, 3),
      activeStudents: students.filter((s) => s.status === "ACTIVE").length,
      overcommittedGoals: goals.filter((g) => g.realismStatus === "OVERCAPACITY"),
      debts: finances.filter((f) => f.type === "DEBT" && !f.isPaid).slice(0, 2),
      recentNotes: notes.slice(0, 2),
      recentPosts: instagramPosts.slice(0, 2),
      capacityLimit,
      capacityPct: Math.min(100, Math.max(0, capacityPct)),
    };
  }, [tasks, projects, goals, students, lessons, finances, notes, instagramPosts, metrics]);

  const { text: greeting, emoji } = greetingForHour(new Date().getHours());

  // Progressive disclosure order: urgent work, then next lesson, then capacity,
  // and only fall back to a calm summary when nothing needs attention.
  const showUrgent = view.urgentCount > 0;
  const showLesson = view.nextLesson !== null;
  const showCapacity = view.capacityPct > 90;
  const nothingNeedsAttention = !showUrgent && !showLesson && !showCapacity;

  const focusActions: Array<{ label: string; hint: string; module: "tasks" | "education" | "finance" }> = [
    { label: "Start a task", hint: "Pick up your action queue", module: "tasks" },
    {
      label: "Review lessons",
      hint: view.upcomingCount > 0 ? `${view.upcomingCount} coming up` : "Plan your teaching week",
      module: "education",
    },
    { label: "Check finances", hint: "Cash, burn and runway", module: "finance" },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-16">
      {/* 1. Welcoming hero */}
      <header className="flex flex-wrap items-start justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic-text dark:text-zen-text">
            {greeting}, Mike {emoji}
          </h1>
          <p className="mt-2 text-base text-nordic-muted dark:text-zen-muted">
            Here&apos;s what&apos;s happening today across your work, students, and projects.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefreshData}
          className="rounded-xl border border-nordic-border px-4 py-2 text-sm font-medium text-nordic-muted transition-colors hover:border-nordic-teal hover:text-nordic-text dark:border-zen-border dark:text-zen-muted dark:hover:border-zen-mint dark:hover:text-zen-text"
        >
          Refresh
        </button>
      </header>

      {/* 7. Single primary action */}
      <section className="focus-panel">
        <div className="flex items-center gap-2 text-sm font-medium text-nordic-teal dark:text-zen-mint">
          <Sparkles className="h-4 w-4" aria-hidden />
          What should I do now?
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-nordic-text dark:text-zen-text">
          What&apos;s your focus today?
        </h2>
        <p className="mt-1 text-sm text-nordic-muted dark:text-zen-muted">
          Pick one thread to move forward. You can always come back to the rest.
        </p>
        <div className="quick-actions mt-6 flex-col sm:flex-row sm:flex-wrap">
          {focusActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => setActiveModule(action.module)}
              className="quick-action flex flex-1 flex-col"
            >
              <span className="text-sm font-semibold text-nordic-text dark:text-zen-text">{action.label}</span>
              <span className="mt-0.5 text-xs text-nordic-muted dark:text-zen-muted">{action.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 8. Quick stats bar */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-4 border-b border-nordic-border py-4 pb-6 dark:border-zen-border">
        <Stat
          label="Open tasks"
          value={view.pending.length}
          accent="blue"
          hint={view.urgentCount > 0 ? `${view.urgentCount} urgent` : "Nothing urgent"}
        />
          <Stat
            label="Upcoming lessons"
            value={view.upcomingCount}
            accent="amber"
            hint={
              view.activeStudents > 0 ? `${view.activeStudents} active students` : "No active students"
            }
          />
          <Stat
            label="Net cash"
            value={formatMoney(metrics.netCash)}
            accent="emerald"
            hint={`${metrics.runwayMonths} months runway`}
          />
          <Stat
            label="Capacity"
            value={`${metrics.weeklyTrackedHours}h`}
            accent={showCapacity ? "rose" : "purple"}
            hint={`${view.capacityPct}% of ${view.capacityLimit}h`}
          />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 2a. Urgent tasks */}
        {showUrgent ? (
          <SectionCard
            accent="blue"
            icon={CheckSquare}
            title="Needs you now"
            subtitle={`${view.urgentCount} urgent ${view.urgentCount === 1 ? "task" : "tasks"}`}
            actionLabel="Open task board"
            onAction={() => setActiveModule("tasks")}
          >
            <ul className="space-y-3">
              {view.urgent.map((task) => (
                <li
                  key={task.id}
                  className={`flex items-center justify-between gap-4 rounded-xl border border-nordic-border/70 bg-nordic-card p-4 dark:border-zen-border/70 dark:bg-zen-card`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-nordic-text dark:text-zen-text">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-nordic-muted dark:text-zen-muted">
                      {task.estimatedMinutes} min estimated
                      {task.dueDate
                        ? ` · due ${new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startTimer(task.id, task.title, "STOPWATCH")}
                    title={`Start focus timer for ${task.title}`}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-transform hover:scale-105 ${ACCENTS.blue.solid}`}
                  >
                    <Clock className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            {view.pending.length > view.urgent.length ? (
              <p className="text-sm text-nordic-muted dark:text-zen-muted">
                {view.pending.length - view.urgent.length} more open{" "}
                {view.pending.length - view.urgent.length === 1 ? "task" : "tasks"} waiting in your board.
              </p>
            ) : null}
          </SectionCard>
        ) : null}

        {/* 2b. Next lesson */}
        {showLesson && view.nextLesson ? (
          <SectionCard
            accent="amber"
            icon={GraduationCap}
            title="Your next lesson"
            subtitle={
              view.nextLesson.student?.name
                ? `With ${view.nextLesson.student.name}`
                : "Scheduled session"
            }
            actionLabel="Open academy"
            onAction={() => setActiveModule("education")}
          >
            <div className={`rounded-xl border p-5 ${ACCENTS.amber.border} ${ACCENTS.amber.soft}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold">{view.nextLesson.title}</p>
                  {view.nextLesson.objectives ? (
                    <p className="mt-1 line-clamp-2 text-sm opacity-90">{view.nextLesson.objectives}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {new Date(view.nextLesson.scheduledAt).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="mt-1 text-xs opacity-90">
                    {view.nextLesson.durationMinutes} min ·{" "}
                    {view.nextLesson.isPaid ? "paid" : formatMoney(view.nextLesson.feeAmount)}
                  </div>
                </div>
              </div>
            </div>
            {view.laterLessons.length > 0 ? (
              <ul className="space-y-2">
                {view.laterLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 text-sm text-nordic-muted dark:text-zen-muted"
                  >
                    <span className="truncate">
                      {lesson.student?.name ?? "Session"} · {lesson.title}
                    </span>
                    <span className="shrink-0 text-xs">
                      {new Date(lesson.scheduledAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </SectionCard>
        ) : null}

        {/* 2c. Capacity warning */}
        {showCapacity ? (
          <SectionCard
            accent="rose"
            icon={AlertTriangle}
            title="Your week is nearly full"
            subtitle={`${view.capacityPct}% of your ${view.capacityLimit}h weekly limit`}
            actionLabel="Review workload"
            onAction={() => setActiveModule("tasks")}
          >
            <p className="text-sm text-nordic-muted dark:text-zen-muted">
              You&apos;ve tracked {metrics.weeklyTrackedHours}h against a {view.capacityLimit}h limit. Consider
              moving one commitment or protecting a recovery block.
            </p>
            {view.overcommittedGoals.length > 0 ? (
              <p className="text-sm text-nordic-muted dark:text-zen-muted">
                {view.overcommittedGoals.length}{" "}
                {view.overcommittedGoals.length === 1 ? "goal is" : "goals are"} currently over-committed.
              </p>
            ) : null}
          </SectionCard>
        ) : null}

        {/* 2d. Quiet-day summary */}
        {nothingNeedsAttention ? (
          <SectionCard
            accent="emerald"
            icon={PartyPopper}
            title="A clear day ahead"
            subtitle="No urgent work, no upcoming lessons, and plenty of capacity."
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Stat variant="card" label="Open tasks" value={view.pending.length} accent="blue" />
              <Stat variant="card" label="Projects" value={view.activeProjects.length} accent="purple" />
              <Stat variant="card" label="Students" value={view.activeStudents} accent="amber" />
            </div>
            <p className="text-sm text-nordic-muted dark:text-zen-muted">
              Good moment for deep work on a project, catching up on notes, or planning next week.
            </p>
          </SectionCard>
        ) : null}

        {/* Projects */}
        <SectionCard
          accent="purple"
          icon={FolderGit2}
          title="Your projects"
          subtitle={view.activeProjects.length > 0 ? "Active work" : "Nothing in flight yet"}
          actionLabel={view.activeProjects.length > 0 ? "Open projects" : undefined}
          onAction={view.activeProjects.length > 0 ? () => setActiveModule("tasks") : undefined}
        >
          {view.activeProjects.length > 0 ? (
            <ul className="space-y-3">
              {view.activeProjects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-xl border border-nordic-border/70 bg-nordic-card p-4 dark:border-zen-border/70 dark:bg-zen-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-base font-medium text-nordic-text dark:text-zen-text">{project.title}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ACCENTS.purple.soft}`}
                    >
                      {project.stage.toLowerCase()}
                    </span>
                  </div>
                  {project.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-nordic-muted dark:text-zen-muted">
                      {project.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-nordic-muted dark:text-zen-muted">
                    {project.healthScore}% health · {project.velocityScore}% velocity ·{" "}
                    {formatMoney(project.hourlyRate)}/h
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FolderGit2}
              accent="purple"
              title="No projects yet"
              hint="Start tracking your work so progress and hours land in one place."
              actionLabel="Create your first project"
              onAction={() => setActiveModule("tasks")}
            />
          )}
        </SectionCard>

        {/* Goals — only surfaced when something needs adjusting */}
        {view.overcommittedGoals.length > 0 ? (
          <SectionCard
            accent="rose"
            icon={Target}
            title="Goals to revisit"
            subtitle="These targets no longer fit your available hours"
            actionLabel="Open projects"
            onAction={() => setActiveModule("tasks")}
          >
            <ul className="space-y-3">
              {view.overcommittedGoals.slice(0, 3).map((goal) => (
                <li
                  key={goal.id}
                  className="rounded-xl border border-nordic-border/70 bg-nordic-card p-4 dark:border-zen-border/70 dark:bg-zen-card"
                >
                  <p className="text-base font-medium text-nordic-text dark:text-zen-text">{goal.title}</p>
                  <p className="mt-1 text-xs text-nordic-muted dark:text-zen-muted">
                    {goal.targetHoursPerWeek}h/week · {goal.targetCategory.toLowerCase()}
                  </p>
                  {goal.rationale ? (
                    <p className="mt-2 text-sm text-nordic-muted dark:text-zen-muted">{goal.rationale}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {/* Finances */}
        <SectionCard
          accent="emerald"
          icon={DollarSign}
          title="Money at a glance"
          subtitle={`${metrics.monthlyBurn} monthly burn · ${metrics.runwayMonths} months runway`}
          actionLabel="Open finances"
          onAction={() => setActiveModule("finance")}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Stat variant="card" label="Net cash" value={formatMoney(metrics.netCash)} accent="emerald" />
            <Stat variant="card" label="Monthly burn" value={formatMoney(metrics.monthlyBurn)} accent="rose" />
          </div>
          {view.debts.length > 0 ? (
            <ul className="space-y-2">
              {view.debts.map((debt) => (
                <li
                  key={debt.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-nordic-border/70 bg-nordic-card px-4 py-3 text-sm dark:border-zen-border/70 dark:bg-zen-card"
                >
                  <span className="truncate text-nordic-text dark:text-zen-text">{debt.description}</span>
                  <span className="shrink-0 font-medium text-rose-600 dark:text-rose-400">
                    {formatMoney(debt.amount)}
                    {debt.aprRate ? ` · ${debt.aprRate}%` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-nordic-border px-4 py-5 text-sm text-nordic-muted dark:border-zen-border">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
              No open debts recorded. Nice.
            </div>
          )}
        </SectionCard>

        {/* Notes and content */}
        <SectionCard
          accent="blue"
          icon={Sparkles}
          title="Notes & content"
          subtitle={
            view.recentNotes.length > 0 || view.recentPosts.length > 0
              ? "Recent notes and drafts"
              : "A quiet place to think"
          }
          actionLabel="Open notes"
          onAction={() => setActiveModule("voice-notes")}
        >
          {view.recentNotes.length > 0 || view.recentPosts.length > 0 ? (
            <div className="space-y-4">
              {view.recentNotes.length > 0 ? (
                <ul className="space-y-2">
                  {view.recentNotes.map((note) => (
                    <li key={note.id}>
                      <p className="text-sm font-medium text-nordic-text dark:text-zen-text">{note.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-nordic-muted dark:text-zen-muted">
                        {note.content.replace(/[#*`_]/g, "").slice(0, 110)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}
              {view.recentPosts.length > 0 ? (
                <ul className="space-y-2 border-t border-nordic-border pt-4 dark:border-zen-border">
                  {view.recentPosts.map((post) => (
                    <li key={post.id} className="text-sm text-nordic-muted dark:text-zen-muted">
                      <span className="font-medium capitalize text-nordic-text dark:text-zen-text">
                        {post.status.toLowerCase()}
                      </span>{" "}
                      · {post.hook}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              accent="blue"
              title="No notes yet"
              hint="Capture a thought by voice or text and it will show up here."
              actionLabel="Write your first note"
              onAction={() => setActiveModule("voice-notes")}
            />
          )}
        </SectionCard>
      </div>

      <p className="pt-2 text-xs text-nordic-muted dark:text-zen-muted">
        Showing what matters most right now. Everything else lives in the sidebar.
      </p>
    </div>
  );
};