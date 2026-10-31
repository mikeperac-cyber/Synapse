import { create } from "zustand";
import { ThemeMode, ModuleId, Tag } from "./types";

interface PinnedHubState {
  showPomodoro: boolean;
  showQuickMemo: boolean;
  showPriorityTasks: boolean;
  showCashBalance: boolean;
  showNextLesson: boolean;
}

interface AppStore {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Active module view
  activeModule: ModuleId;
  setActiveModule: (mod: ModuleId) => void;

  // Pinned Hub toggles
  pinnedWidgets: PinnedHubState;
  togglePinnedWidget: (key: keyof PinnedHubState) => void;

  // Global Timer / Pomodoro
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  timerMode: "STOPWATCH" | "POMODORO";
  isTimerRunning: boolean;
  timerSeconds: number; // For stopwatch: elapsed; For pomodoro: remaining
  timerIntervalId: number | null;
  startTimer: (taskId?: string, taskTitle?: string, mode?: "STOPWATCH" | "POMODORO") => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;

  // Command Palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Universal Tag Drawer
  selectedTag: Tag | null;
  tagDrawerOpen: boolean;
  openTagDrawer: (tag: Tag) => void;
  closeTagDrawer: () => void;

  // Autonomous Agent Drawer
  agentDrawerOpen: boolean;
  setAgentDrawerOpen: (open: boolean) => void;

  // Notification / Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Defaults to the light professional theme
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("omnisphere_theme", theme);
    }
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  activeModule: "overview",
  setActiveModule: (activeModule) => set({ activeModule }),

  pinnedWidgets: {
    showPomodoro: true,
    showQuickMemo: true,
    showPriorityTasks: true,
    showCashBalance: true,
    showNextLesson: true,
  },
  togglePinnedWidget: (key) =>
    set((state) => ({
      pinnedWidgets: {
        ...state.pinnedWidgets,
        [key]: !state.pinnedWidgets[key],
      },
    })),

  // Timer
  activeTaskId: null,
  activeTaskTitle: null,
  timerMode: "STOPWATCH",
  isTimerRunning: false,
  timerSeconds: 0,
  timerIntervalId: null,

  startTimer: (taskId, taskTitle, mode = "STOPWATCH") => {
    set({
      activeTaskId: taskId || null,
      activeTaskTitle: taskTitle || "Unassigned Deep Work",
      timerMode: mode,
      isTimerRunning: true,
      timerSeconds: mode === "POMODORO" ? 25 * 60 : 0,
    });
  },

  pauseTimer: () => set({ isTimerRunning: false }),
  resumeTimer: () => set({ isTimerRunning: true }),
  resetTimer: () =>
    set((state) => ({
      isTimerRunning: false,
      timerSeconds: state.timerMode === "POMODORO" ? 25 * 60 : 0,
    })),

  tickTimer: () => {
    const state = get();
    if (!state.isTimerRunning) return;

    if (state.timerMode === "STOPWATCH") {
      set({ timerSeconds: state.timerSeconds + 1 });
    } else {
      if (state.timerSeconds <= 1) {
        set({ timerSeconds: 0, isTimerRunning: false });
        state.showToast("🔔 Pomodoro session completed! Time for a recharge.");
      } else {
        set({ timerSeconds: state.timerSeconds - 1 });
      }
    }
  },

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  // Universal Tag Drawer
  selectedTag: null,
  tagDrawerOpen: false,
  openTagDrawer: (tag) => set({ selectedTag: tag, tagDrawerOpen: true }),
  closeTagDrawer: () => set({ tagDrawerOpen: false, selectedTag: null }),

  // Agent Drawer
  agentDrawerOpen: false,
  setAgentDrawerOpen: (agentDrawerOpen) => set({ agentDrawerOpen }),

  // Toasts
  toastMessage: null,
  showToast: (toastMessage) => {
    set({ toastMessage });
    setTimeout(() => {
      if (get().toastMessage === toastMessage) {
        set({ toastMessage: null });
      }
    }, 4000);
  },
  clearToast: () => set({ toastMessage: null }),
}));
