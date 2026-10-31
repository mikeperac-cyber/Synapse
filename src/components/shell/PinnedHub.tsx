"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Task, Lesson } from "@/lib/types";
import {
  Play,
  Pause,
  RotateCcw,
  Mic,
  Square,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  GraduationCap,
  DollarSign,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface PinnedHubProps {
  tasks: Task[];
  lessons: Lesson[];
  metrics: {
    netCash: number;
    monthlyBurn: number;
    runwayMonths: string | number;
  };
  onRefreshData: () => void;
}

export const PinnedHub: React.FC<PinnedHubProps> = ({
  tasks,
  lessons,
  metrics,
  onRefreshData,
}) => {
  const {
    pinnedWidgets,
    activeTaskId,
    activeTaskTitle,
    isTimerRunning,
    timerSeconds,
    timerMode,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    tickTimer,
    showToast,
    setActiveModule,
  } = useAppStore();

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [memoInputText, setMemoInputText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Collapsed hides the strip down to a single summary line.
  const [collapsed, setCollapsed] = useState(false);

  // Restore the saved collapse preference after mount.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("pinnedhub_collapsed") === "1");
    } catch {
      // Ignore storage failures (private mode, disabled storage).
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pinnedhub_collapsed", next ? "1" : "0");
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  };

  // Interval for active timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  // Audio recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      const remMins = mins % 60;
      return `${hrs}:${remMins < 10 ? "0" : ""}${remMins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Log active timer session to Task
  const handleLogActiveTime = async () => {
    if (!activeTaskId) {
      showToast("Select a task first before logging time");
      return;
    }
    const loggedMinutes = Math.max(1, Math.round(timerSeconds / 60));
    try {
      const res = await fetch(`/api/tasks/${activeTaskId}/timelog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: loggedMinutes,
          note: `Session logged via Pinned Hub (${timerMode})`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`⏱️ Successfully logged ${loggedMinutes}m to "${activeTaskTitle}"!`);
        resetTimer();
        onRefreshData();
      }
    } catch {
      showToast("Failed to record time log");
    }
  };

  // Complete a task directly
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ Task marked as completed!");
        onRefreshData();
      }
    } catch {
      showToast("Failed to update task");
    }
  };

  // Start microphone capture & audio wave visualization
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await handleProcessVoiceMemo(audioBlob, recordDuration || 15);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);

      // Web Audio wave visualizer setup
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawWaveform();
    } catch (err) {
      console.warn("Microphone access denied or unavailable, falling back to instant memo simulation:", err);
      setIsRecording(true);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = "#2563EB";
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    render();
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    } else {
      // Manual simulated recording stop
      handleProcessVoiceMemo(null, recordDuration || 20);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
  };

  // Process voice memo
  const handleProcessVoiceMemo = async (blob: Blob | null, duration: number) => {
    setIsTranscribing(true);
    try {
      const simulatedSample =
        memoInputText.trim() ||
        "Need to prepare inversion grammar drill for Elena before tomorrow morning. Also review Sophie's passive voice report. Follow up with Marcus on IELTS exam date booking.";

      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Voice Memo (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
          durationSeconds: duration,
          transcription: simulatedSample,
          autoExtractTasks: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎙️ Voice memo ingested! Extracted ${data.extractedCount} action items to Todos.`);
        setMemoInputText("");
        onRefreshData();
      }
    } catch {
      showToast("Failed to transcribe voice memo");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Priority tasks due today or urgent
  const priorityTasks = tasks
    .filter((t) => t.status !== "DONE" && (t.priority === "URGENT" || t.priority === "HIGH"))
    .slice(0, 3);

  // Next scheduled lesson
  const nextLesson = lessons.find(
    (l) => l.status === "SCHEDULED" && new Date(l.scheduledAt) > new Date()
  );

  return (
    <div className="w-full shrink-0 border-b border-nordic-border bg-nordic-surface/60 dark:border-zen-border dark:bg-zen-surface/60">
      {/* Collapsed: one-line summary */}
      {collapsed ? (
        <div className="flex h-10 items-center gap-4 px-6 text-xs text-nordic-muted dark:text-zen-muted">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono tabular-nums">{formatTime(timerSeconds)}</span>
          <span>
            {priorityTasks.length > 0
              ? `${priorityTasks.length} priority task${priorityTasks.length === 1 ? "" : "s"}`
              : "Nothing urgent"}
          </span>
          <span className="font-mono">${metrics.netCash.toLocaleString()}</span>
          {nextLesson ? (
            <span className="truncate">
              {new Date(nextLesson.scheduledAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}{" "}
              {nextLesson.student?.name}
            </span>
          ) : (
            <span>No lesson</span>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="ml-auto shrink-0 rounded-md p-1.5 transition-colors hover:bg-nordic-card hover:text-nordic-text dark:hover:bg-zen-card dark:hover:text-zen-text"
            title="Expand pinned widgets"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Expanded: single compact toolbar row */
        <div className="flex h-14 items-center gap-4 px-6">
          {pinnedWidgets.showPomodoro && (
            <div className="flex shrink-0 items-center gap-2">
              <Clock className="h-4 w-4 text-nordic-teal dark:text-zen-mint" />
              <span className="w-12 font-mono text-sm font-semibold tabular-nums text-nordic-text dark:text-zen-text">
                {formatTime(timerSeconds)}
              </span>
              {isTimerRunning ? (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="rounded-md bg-amber-500/15 p-1.5 text-amber-600 transition-colors hover:bg-amber-500/25 dark:text-amber-400"
                  title="Pause"
                >
                  <Pause className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeTimer}
                  className="rounded-md bg-emerald-500/15 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-500/25 dark:text-emerald-400"
                  title="Start / Resume"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={resetTimer}
                className="rounded-md p-1.5 text-nordic-muted transition-colors hover:bg-nordic-card dark:hover:bg-zen-card"
                title="Reset"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              {activeTaskId && timerSeconds > 0 && (
                <button
                  type="button"
                  onClick={handleLogActiveTime}
                  className="rounded-md bg-nordic-teal px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 dark:bg-zen-mint dark:text-zen-bg"
                >
                  Save
                </button>
              )}
              {activeTaskTitle && (
                <span
                  title={activeTaskTitle}
                  className="max-w-[130px] truncate text-xs text-nordic-muted dark:text-zen-muted"
                >
                  {activeTaskTitle}
                </span>
              )}
            </div>
          )}

          {pinnedWidgets.showQuickMemo && (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {isRecording ? (
                <>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    {formatTime(recordDuration)}
                  </span>
                  <canvas ref={canvasRef} width={140} height={20} className="h-5 w-24 shrink-0" />
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-rose-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-600"
                  >
                    <Square className="h-3 w-3" /> Stop
                  </button>
                </>
              ) : isTranscribing ? (
                <span className="flex items-center gap-2 text-xs text-nordic-teal dark:text-zen-mint">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" /> Pulling out your to-dos…
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex shrink-0 items-center gap-1.5 rounded-md border border-nordic-border px-2 py-1.5 text-xs font-medium text-nordic-text transition-colors hover:border-nordic-teal dark:border-zen-border dark:text-zen-text dark:hover:border-zen-mint"
                    title="Record a voice note"
                  >
                    <Mic className="h-3.5 w-3.5 text-rose-500" /> Record
                  </button>
                  <input
                    type="text"
                    value={memoInputText}
                    onChange={(e) => setMemoInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && memoInputText.trim()) {
                        handleProcessVoiceMemo(null, 15);
                      }
                    }}
                    placeholder="Quick thought…"
                    className="min-w-0 flex-1 rounded-md border border-nordic-border bg-transparent px-2.5 py-1.5 text-sm text-nordic-text outline-none placeholder:text-nordic-muted/60 dark:border-zen-border dark:text-zen-text dark:placeholder:text-zen-muted/60"
                  />
                  {memoInputText.trim() && (
                    <button
                      type="button"
                      onClick={() => handleProcessVoiceMemo(null, 15)}
                      className="shrink-0 rounded-md bg-nordic-teal px-2 py-1.5 text-white dark:bg-zen-mint dark:text-zen-bg"
                      title="Save text memo"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {pinnedWidgets.showPriorityTasks && (
            <div className="flex shrink-0 items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-nordic-teal dark:text-zen-mint" />
              {priorityTasks.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(priorityTasks[0].id)}
                    className="text-nordic-muted transition-colors hover:text-emerald-500"
                    title="Mark complete"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                  <span
                    title={priorityTasks[0].title}
                    className="max-w-[110px] truncate text-xs text-nordic-text dark:text-zen-text"
                  >
                    {priorityTasks[0].title}
                  </span>
                  {priorityTasks.length > 1 && (
                    <span className="text-xs text-nordic-muted dark:text-zen-muted">
                      +{priorityTasks.length - 1}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => startTimer(priorityTasks[0].id, priorityTasks[0].title, "STOPWATCH")}
                    className="text-nordic-teal transition-colors hover:underline dark:text-zen-mint"
                    title="Start a focus timer on this task"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-nordic-muted dark:text-zen-muted">Nothing urgent</span>
              )}
              <button
                type="button"
                onClick={() => setActiveModule("tasks")}
                className="text-xs text-nordic-teal transition-colors hover:underline dark:text-zen-mint"
              >
                All tasks
              </button>
            </div>
          )}

          {pinnedWidgets.showCashBalance && (
            <button
              type="button"
              onClick={() => setActiveModule("finance")}
              className="flex shrink-0 items-center gap-2 text-left"
              title="Open finances"
            >
              <DollarSign className="h-4 w-4 text-nordic-teal dark:text-zen-mint" />
              <span className="font-mono text-sm font-semibold text-nordic-text dark:text-zen-text">
                ${metrics.netCash.toLocaleString()}
              </span>
              <span className="text-xs text-nordic-muted dark:text-zen-muted">{metrics.runwayMonths} mo</span>
            </button>
          )}

          {pinnedWidgets.showNextLesson && (
            <button
              type="button"
              onClick={() => setActiveModule("education")}
              className="flex shrink-0 items-center gap-2 text-left"
              title="Open lessons"
            >
              <GraduationCap className="h-4 w-4 text-nordic-teal dark:text-zen-mint" />
              {nextLesson ? (
                <>
                  <span className="text-xs text-nordic-muted dark:text-zen-muted">
                    {new Date(nextLesson.scheduledAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="max-w-[90px] truncate text-xs text-nordic-text dark:text-zen-text">
                    {nextLesson.student?.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-nordic-muted dark:text-zen-muted">No lesson</span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            className="ml-auto shrink-0 rounded-md p-1.5 text-nordic-muted transition-colors hover:bg-nordic-card hover:text-nordic-text dark:hover:bg-zen-card dark:hover:text-zen-text"
            title="Collapse pinned widgets"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};