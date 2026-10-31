"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Task, Project, Student, Lesson, FinancialRecord, Note } from "@/lib/types";
import {
  X,
  Hash,
  CheckSquare,
  FolderGit2,
  GraduationCap,
  DollarSign,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";

export const UniversalTagDrawer: React.FC = () => {
  const { selectedTag, tagDrawerOpen, closeTagDrawer, setActiveModule } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [entities, setEntities] = useState<{
    tasks: Task[];
    projects: Project[];
    students: Student[];
    lessons: Lesson[];
    finances: FinancialRecord[];
    notes: Note[];
  }>({
    tasks: [],
    projects: [],
    students: [],
    lessons: [],
    finances: [],
    notes: [],
  });

  useEffect(() => {
    if (selectedTag && tagDrawerOpen) {
      setIsLoading(true);
      fetch(`/api/tags/${selectedTag.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.linkedEntities) {
            setEntities(data.linkedEntities);
          }
        })
        .catch((err) => console.error("Failed to load tag details:", err))
        .finally(() => setIsLoading(false));
    }
  }, [selectedTag, tagDrawerOpen]);

  if (!tagDrawerOpen || !selectedTag) return null;

  const totalLinked =
    entities.tasks.length +
    entities.projects.length +
    entities.students.length +
    entities.lessons.length +
    entities.finances.length +
    entities.notes.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-nordic-surface dark:bg-zen-surface border-l border-nordic-border dark:border-zen-border shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-nordic-border dark:border-zen-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedTag.color || "#0F766E" }}
            />
            <h2 className="text-base font-semibold text-nordic-text dark:text-zen-text flex items-center gap-1">
              <Hash className="w-4 h-4 text-nordic-muted dark:text-zen-muted" />
              <span>{selectedTag.name}</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-nordic-card dark:bg-zen-card text-nordic-muted dark:text-zen-muted font-mono">
              {totalLinked} linked
            </span>
          </div>

          <button
            onClick={closeTagDrawer}
            className="p-1 rounded-lg text-nordic-muted hover:text-nordic-text dark:hover:text-zen-text hover:bg-nordic-card dark:hover:bg-zen-card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-nordic-muted dark:text-zen-muted">
              <Loader2 className="w-6 h-6 animate-spin text-nordic-teal dark:text-zen-mint mb-2" />
              <span>Resolving polymorphic relations...</span>
            </div>
          ) : totalLinked === 0 ? (
            <div className="text-center py-12 text-nordic-muted dark:text-zen-muted">
              No entities currently tagged with #{selectedTag.name}.
            </div>
          ) : (
            <>
              {/* Linked Tasks */}
              {entities.tasks.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-nordic-text dark:text-zen-text">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-nordic-teal dark:text-zen-mint" />
                      <span>Tasks ({entities.tasks.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        closeTagDrawer();
                        setActiveModule("tasks");
                      }}
                      className="text-[10px] text-nordic-teal dark:text-zen-mint hover:underline flex items-center gap-0.5"
                    >
                      <span>Jump</span> <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {entities.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border/60 dark:border-zen-border/60 flex items-center justify-between"
                      >
                        <span className="font-medium text-nordic-text dark:text-zen-text truncate">
                          {task.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-nordic-surface dark:bg-zen-surface">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Projects */}
              {entities.projects.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-nordic-text dark:text-zen-text">
                    <span className="flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-nordic-blue dark:text-zen-ice" />
                      <span>Projects ({entities.projects.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        closeTagDrawer();
                        setActiveModule("tasks");
                      }}
                      className="text-[10px] text-nordic-blue dark:text-zen-ice hover:underline flex items-center gap-0.5"
                    >
                      <span>Jump</span> <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {entities.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-2 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border/60 dark:border-zen-border/60 flex items-center justify-between"
                      >
                        <span className="font-medium text-nordic-text dark:text-zen-text truncate">
                          {proj.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-nordic-surface dark:bg-zen-surface">
                          {proj.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Students */}
              {entities.students.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-nordic-text dark:text-zen-text">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Students ({entities.students.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        closeTagDrawer();
                        setActiveModule("education");
                      }}
                      className="text-[10px] text-amber-500 hover:underline flex items-center gap-0.5"
                    >
                      <span>Jump</span> <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {entities.students.map((st) => (
                      <div
                        key={st.id}
                        className="p-2 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border/60 dark:border-zen-border/60 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-nordic-text dark:text-zen-text">{st.name}</div>
                          <div className="text-[10px] text-nordic-muted dark:text-zen-muted">{st.level}</div>
                        </div>
                        <span className="text-[10px] font-mono">${st.ratePerHour}/h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Lessons */}
              {entities.lessons.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-nordic-text dark:text-zen-text">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Lessons ({entities.lessons.length})</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    {entities.lessons.map((ls) => (
                      <div
                        key={ls.id}
                        className="p-2 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border/60 dark:border-zen-border/60"
                      >
                        <div className="font-medium text-nordic-text dark:text-zen-text">{ls.title}</div>
                        <div className="text-[10px] text-nordic-muted dark:text-zen-muted mt-0.5">
                          {new Date(ls.scheduledAt).toLocaleDateString()} • {ls.durationMinutes}m
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Notes */}
              {entities.notes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-nordic-text dark:text-zen-text">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Notes ({entities.notes.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        closeTagDrawer();
                        setActiveModule("voice-notes");
                      }}
                      className="text-[10px] text-emerald-500 hover:underline flex items-center gap-0.5"
                    >
                      <span>Jump</span> <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {entities.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border/60 dark:border-zen-border/60"
                      >
                        <div className="font-medium text-nordic-text dark:text-zen-text">{note.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Financial Records */}
              {entities.finances.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-nordic-text dark:text-zen-text">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                      <span>Financial Items ({entities.finances.length})</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    {entities.finances.map((f) => (
                      <div
                        key={f.id}
                        className="p-2 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border/60 dark:border-zen-border/60 flex items-center justify-between"
                      >
                        <span className="font-medium text-nordic-text dark:text-zen-text truncate">
                          {f.description}
                        </span>
                        <span className="font-mono text-nordic-text dark:text-zen-text">
                          ${f.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-nordic-border dark:border-zen-border bg-nordic-card/50 dark:bg-zen-card/50 text-[11px] text-nordic-muted dark:text-zen-muted text-center">
          Polymorphic Cross-Linking Engine
        </div>
      </div>
    </div>
  );
};
