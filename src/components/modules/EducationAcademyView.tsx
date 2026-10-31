"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Student, Lesson, Homework } from "@/lib/types";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  Loader2,
  Award,
} from "lucide-react";

interface EducationAcademyViewProps {
  students: Student[];
  lessons: Lesson[];
  homeworks: Homework[];
  onRefreshData: () => void;
}

export const EducationAcademyView: React.FC<EducationAcademyViewProps> = ({
  students,
  lessons,
  homeworks,
  onRefreshData,
}) => {
  const { showToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<"STUDENTS" | "PLANNER" | "HOMEWORK">("STUDENTS");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(students[0] || null);

  // New Student state
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentLevel, setNewStudentLevel] = useState("C1 Academic");
  const [newStudentRate, setNewStudentRate] = useState(75);
  const [newStudentNotes, setNewStudentNotes] = useState("");

  // New Lesson state
  const [lessonStudentId, setLessonStudentId] = useState(students[0]?.id || "");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDate, setLessonDate] = useState("");
  const [lessonObjectives, setLessonObjectives] = useState("");
  const [vocabDrillWord, setVocabDrillWord] = useState("");
  const [vocabDrillDef, setVocabDrillDef] = useState("");

  // Generating homework loading state
  const [isGeneratingHw, setIsGeneratingHw] = useState(false);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    try {
      const res = await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STUDENT",
          name: newStudentName.trim(),
          email: newStudentEmail.trim(),
          level: newStudentLevel,
          ratePerHour: newStudentRate,
          diagnosticNotes: newStudentNotes.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎓 Student ${newStudentName} registered!`);
        setNewStudentName("");
        setNewStudentEmail("");
        setNewStudentNotes("");
        onRefreshData();
      }
    } catch {
      showToast("Failed to create student");
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonDate) return;

    const drills = vocabDrillWord
      ? [{ term: vocabDrillWord.trim(), definition: vocabDrillDef.trim() }]
      : [];

    try {
      const res = await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LESSON",
          studentId: lessonStudentId,
          title: lessonTitle.trim(),
          scheduledAt: lessonDate,
          objectives: lessonObjectives.trim(),
          vocabDrills: drills,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("📅 Lesson scheduled!");
        setLessonTitle("");
        setLessonObjectives("");
        setVocabDrillWord("");
        setVocabDrillDef("");
        onRefreshData();
      }
    } catch {
      showToast("Failed to schedule lesson");
    }
  };

  const handleGenerateTargetedHomework = async (studentId: string) => {
    setIsGeneratingHw(true);
    try {
      const res = await fetch("/api/education/generate-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✨ ${data.message}`);
        onRefreshData();
      }
    } catch {
      showToast("Failed to autonomously generate assignment");
    } finally {
      setIsGeneratingHw(false);
    }
  };

  const handleGradeHomework = async (hwId: string, score: number) => {
    try {
      const res = await fetch("/api/education", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "HOMEWORK",
          id: hwId,
          status: "GRADED",
          score,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Awarded ${score}/100 to submission`);
        onRefreshData();
      }
    } catch {
      showToast("Failed to grade homework");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-nordic-border dark:border-zen-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nordic-text dark:text-zen-text flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-500" />
            <span>Education & Academy Hub</span>
          </h1>
          <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
            Diagnostic coaching, lesson plan templates, vocabulary drills, and autonomous homework generation.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border">
          <button
            onClick={() => setActiveTab("STUDENTS")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "STUDENTS"
                ? "bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold shadow-xs"
                : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Students ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("PLANNER")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "PLANNER"
                ? "bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold shadow-xs"
                : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lesson Planner ({lessons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("HOMEWORK")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "HOMEWORK"
                ? "bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-semibold shadow-xs"
                : "text-nordic-muted dark:text-zen-muted hover:text-nordic-text dark:hover:text-zen-text"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Homework & Nags ({homeworks.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENT ROSTER & PROFILES */}
      {activeTab === "STUDENTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Student List & Creation */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
                Enroll New Student
              </h3>
              <form onSubmit={handleCreateStudent} className="space-y-2 text-xs">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Full Name..."
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="Email address..."
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newStudentLevel}
                    onChange={(e) => setNewStudentLevel(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced (IELTS 7.5)">Advanced (IELTS 7.5)</option>
                    <option value="C1 Academic">C1 Academic</option>
                  </select>
                  <input
                    type="number"
                    value={newStudentRate}
                    onChange={(e) => setNewStudentRate(Number(e.target.value))}
                    placeholder="Rate $/h"
                    className="px-2 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                  />
                </div>
                <textarea
                  value={newStudentNotes}
                  onChange={(e) => setNewStudentNotes(e.target.value)}
                  placeholder="Diagnostic weak spots (e.g. Inversions, Task 1 charts)..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
                <button
                  type="submit"
                  disabled={!newStudentName.trim() || !newStudentEmail.trim()}
                  className="w-full py-2 rounded-lg bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-medium disabled:opacity-50"
                >
                  Enroll Student
                </button>
              </form>
            </div>

            {/* List */}
            <div className="space-y-2">
              {students.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudent(st)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedStudent?.id === st.id
                      ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                      : "border-nordic-border dark:border-zen-border bg-nordic-surface dark:bg-zen-surface hover:bg-nordic-card dark:hover:bg-zen-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-nordic-text dark:text-zen-text">
                      {st.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-nordic-card dark:bg-zen-card text-amber-600 dark:text-amber-400 font-bold">
                      ${st.ratePerHour}/h
                    </span>
                  </div>

                  <div className="text-[11px] text-nordic-muted dark:text-zen-muted">{st.level}</div>
                  <div className="text-[10px] text-nordic-muted dark:text-zen-muted mt-1 truncate">
                    {st.email}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 Columns: Selected Student Diagnostic File & Autonomous Homework Trigger */}
          <div className="lg:col-span-2 space-y-4">
            {selectedStudent ? (
              <div className="p-5 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-5">
                <div className="flex items-start justify-between pb-3 border-b border-nordic-border dark:border-zen-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-nordic-text dark:text-zen-text">
                        {selectedStudent.name}
                      </h2>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                        {selectedStudent.status}
                      </span>
                    </div>
                    <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
                      {selectedStudent.level} • ${selectedStudent.ratePerHour}/hr Retainer Rate
                    </p>
                  </div>

                  {/* Autonomous Homework Generator Button */}
                  <button
                    onClick={() => handleGenerateTargetedHomework(selectedStudent.id)}
                    disabled={isGeneratingHw}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-xs shadow-soft hover:opacity-95 transition-opacity disabled:opacity-50"
                    title="Analyze diagnostic notes and generate tailored weak-spot drill"
                  >
                    {isGeneratingHw ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Autonomous Homework Generator</span>
                  </button>
                </div>

                {/* Diagnostic Weak Spots Log */}
                <div className="p-4 rounded-xl bg-nordic-card/60 dark:bg-zen-card/60 border border-nordic-border dark:border-zen-border space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-nordic-text dark:text-zen-text">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Diagnostic Log & Linguistic Weak Spots</span>
                  </div>
                  <p className="text-xs text-nordic-text dark:text-zen-text leading-relaxed bg-nordic-surface dark:bg-zen-surface p-3 rounded-lg border border-nordic-border/60 dark:border-zen-border/60">
                    {selectedStudent.diagnosticNotes ||
                      "No diagnostic notes logged yet. Run an initial diagnostic test to map linguistic weak spots."}
                  </p>
                </div>

                {/* Scheduled Lessons & Past Records */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-nordic-text dark:text-zen-text">
                    Recent & Upcoming Lessons
                  </h3>
                  <div className="space-y-2">
                    {lessons
                      .filter((l) => l.studentId === selectedStudent.id)
                      .map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-3 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-nordic-text dark:text-zen-text">
                              {lesson.title}
                            </div>
                            <div className="text-[11px] text-nordic-muted dark:text-zen-muted mt-0.5">
                              {new Date(lesson.scheduledAt).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              • {lesson.durationMinutes}m
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              ${lesson.feeAmount}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                lesson.status === "COMPLETED"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-nordic-surface dark:bg-zen-surface text-nordic-muted"
                              }`}
                            >
                              {lesson.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-nordic-muted dark:text-zen-muted text-xs">
                Select a student to view diagnostic profiles.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LESSON PLANNER */}
      {activeTab === "PLANNER" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Create Lesson Schedule */}
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-nordic-text dark:text-zen-text">
              Plan Structured Lesson
            </h3>
            <form onSubmit={handleCreateLesson} className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  Student
                </label>
                <select
                  value={lessonStudentId}
                  onChange={(e) => setLessonStudentId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${s.ratePerHour}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Inversions & C1 Cohesion Drills"
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
              </div>

              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={lessonDate}
                  onChange={(e) => setLessonDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-nordic-muted dark:text-zen-muted block mb-1">
                  Objective Mapping
                </label>
                <textarea
                  value={lessonObjectives}
                  onChange={(e) => setLessonObjectives(e.target.value)}
                  placeholder="Measurable objectives (e.g. Master negative adverbial inversions)..."
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg bg-nordic-card dark:bg-zen-card border border-nordic-border dark:border-zen-border outline-none text-nordic-text dark:text-zen-text"
                />
              </div>

              {/* Linked Vocab Drill */}
              <div className="p-2.5 rounded-xl bg-nordic-card/60 dark:bg-zen-card/60 border border-nordic-border/50 dark:border-zen-border/50 space-y-1.5">
                <div className="text-[10px] font-semibold text-nordic-text dark:text-zen-text uppercase font-mono">
                  Linked Vocabulary / Paraphrase Drill
                </div>
                <input
                  type="text"
                  value={vocabDrillWord}
                  onChange={(e) => setVocabDrillWord(e.target.value)}
                  placeholder="Target colocation / structure (e.g. Under no circumstances)"
                  className="w-full px-2.5 py-1 rounded bg-nordic-surface dark:bg-zen-surface border border-nordic-border text-xs text-nordic-text dark:text-zen-text"
                />
                <input
                  type="text"
                  value={vocabDrillDef}
                  onChange={(e) => setVocabDrillDef(e.target.value)}
                  placeholder="Definition & syntactic rule"
                  className="w-full px-2.5 py-1 rounded bg-nordic-surface dark:bg-zen-surface border border-nordic-border text-xs text-nordic-text dark:text-zen-text"
                />
              </div>

              <button
                type="submit"
                disabled={!lessonTitle.trim() || !lessonDate}
                className="w-full py-2 rounded-lg bg-nordic-teal text-white dark:bg-zen-mint dark:text-zen-bg font-medium disabled:opacity-50"
              >
                Save Scheduled Lesson
              </button>
            </form>
          </div>

          {/* Lessons Grid List */}
          <div className="lg:col-span-2 space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-nordic-teal dark:text-zen-mint">
                      {lesson.student?.name}
                    </span>
                    <h3 className="text-sm font-bold text-nordic-text dark:text-zen-text">
                      {lesson.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      ${lesson.feeAmount}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        lesson.status === "COMPLETED"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {lesson.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-nordic-muted dark:text-zen-muted">
                  <span className="font-medium text-nordic-text dark:text-zen-text">Objectives:</span>{" "}
                  {lesson.objectives || "Comprehensive review and fluency drills."}
                </div>

                {lesson.vocabDrillJson && (
                  <div className="p-2.5 rounded-xl bg-nordic-card dark:bg-zen-card border border-nordic-border/60 dark:border-zen-border/60 text-xs">
                    <span className="text-[10px] uppercase font-mono font-bold text-nordic-teal dark:text-zen-mint block mb-1">
                      Vocabulary Drill Module:
                    </span>
                    <div className="space-y-1">
                      {JSON.parse(lesson.vocabDrillJson).map(
                        (drill: { term: string; definition?: string; example?: string }, idx: number) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-semibold text-nordic-text dark:text-zen-text">
                              {drill.term}:
                            </span>{" "}
                            <span className="text-nordic-muted dark:text-zen-muted">
                              {drill.definition || drill.example}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-nordic-muted dark:text-zen-muted pt-1 border-t border-nordic-border/50 dark:border-zen-border/50">
                  <span>
                    📅 {new Date(lesson.scheduledAt).toLocaleString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>{lesson.durationMinutes} minutes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HOMEWORK & SUBMISSIONS TRACKER */}
      {activeTab === "HOMEWORK" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-nordic-surface dark:bg-zen-surface border border-nordic-border dark:border-zen-border shadow-soft flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-nordic-text dark:text-zen-text flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-nordic-teal dark:text-zen-mint" />
                <span>Submissions Tracker & 24h Nag Engine</span>
              </h2>
              <p className="text-xs text-nordic-muted dark:text-zen-muted mt-0.5">
                Autonomostly flags submissions due within 24 hours and queues reminder notifications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homeworks.map((hw) => {
              const isDueWithin24h =
                new Date(hw.dueDate).getTime() - Date.now() <= 24 * 60 * 60 * 1000 &&
                hw.status === "ASSIGNED";
              return (
                <div
                  key={hw.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    isDueWithin24h
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100"
                      : "bg-nordic-surface dark:bg-zen-surface border-nordic-border dark:border-zen-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-nordic-teal dark:text-zen-mint">
                      {hw.student?.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                        hw.status === "GRADED"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : isDueWithin24h
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {hw.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-nordic-text dark:text-zen-text leading-tight">
                      {hw.title}
                    </h4>
                    {hw.description && (
                      <p className="text-[11px] text-nordic-muted dark:text-zen-muted mt-1 leading-snug line-clamp-3">
                        {hw.description}
                      </p>
                    )}
                  </div>

                  {/* Weak Spot badge */}
                  {hw.weakSpotCategory && (
                    <div className="text-[10px] px-2 py-0.5 rounded bg-nordic-card dark:bg-zen-card font-mono text-nordic-teal dark:text-zen-mint border border-nordic-border/50 dark:border-zen-border/50">
                      Weak Spot: {hw.weakSpotCategory}
                    </div>
                  )}

                  {/* Submission status & grading */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-nordic-border/50 dark:border-zen-border/50">
                    <div className="text-[10px] text-nordic-muted dark:text-zen-muted font-mono">
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </div>

                    {hw.score !== null ? (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs">
                        <Award className="w-3.5 h-3.5" />
                        {hw.score}/100
                      </span>
                    ) : (
                      <button
                        onClick={() => handleGradeHomework(hw.id, 92)}
                        className="px-2 py-1 rounded text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-500/25 transition-colors"
                      >
                        Grade (92/100)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
