export type ThemeMode = "light" | "dark";

export type ModuleId =
  | "overview"
  | "tasks"
  | "education"
  | "finance"
  | "voice-notes"
  | "bundler"
  | "instagram"
  | "agent";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface EntityTag {
  id: string;
  tagId: string;
  tag: Tag;
  entityType: string;
  entityId: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  stage: "IDEATION" | "BUILD" | "TRACK";
  velocityScore: number;
  healthScore: number;
  targetDate: string | null;
  budget: number;
  hourlyRate: number;
  markdownDoc: string | null;
  tasks?: Task[];
  timeLogs?: TimeLog[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CLARIFY_OR_DISCARD";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  estimatedMinutes: number;
  trackedMinutes: number;
  isStale: boolean;
  projectId: string | null;
  project?: Project | null;
  studentId: string | null;
  student?: Student | null;
  timeLogs?: TimeLog[];
  createdAt: string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  projectId: string | null;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  billableAmount: number;
  note: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  targetCategory: "DEVELOPMENT" | "BUSINESS" | "ACADEMY" | "HEALTH";
  targetHoursPerWeek: number;
  targetDate: string | null;
  smartSpecific: string | null;
  smartMeasurable: string | null;
  smartAchievable: string | null;
  smartRelevant: string | null;
  smartTimeBound: string | null;
  realismStatus: "REALISTIC" | "OVERCAPACITY" | "UNDERUTILIZED";
  rationale: string | null;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  level: string;
  targetExamDate: string | null;
  ratePerHour: number;
  status: "ACTIVE" | "INACTIVE";
  diagnosticNotes: string | null;
  lessons?: Lesson[];
  homeworks?: Homework[];
  tasks?: Task[];
}

export interface Lesson {
  id: string;
  studentId: string;
  student?: Student;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  objectives: string | null;
  vocabDrillJson: string | null;
  feeAmount: number;
  isPaid: boolean;
  homeworks?: Homework[];
}

export interface Homework {
  id: string;
  studentId: string;
  student?: Student;
  lessonId: string | null;
  lesson?: Lesson | null;
  title: string;
  description: string | null;
  assignedDate: string;
  dueDate: string;
  status: "ASSIGNED" | "SUBMITTED" | "GRADED" | "OVERDUE";
  score: number | null;
  weakSpotCategory: string | null;
  reminderQueued: boolean;
}

export interface FinancialRecord {
  id: string;
  type: "INCOME" | "EXPENSE" | "DEBT";
  category: string;
  description: string;
  amount: number;
  dueDate: string | null;
  isRecurring: boolean;
  aprRate: number | null;
  isPaid: boolean;
  studentId: string | null;
  projectId: string | null;
}

export interface VoiceMemo {
  id: string;
  title: string;
  audioUrl: string | null;
  durationSeconds: number;
  transcription: string;
  actionItemsJson: string | null;
  clusteredTagsJson: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  backlinksJson: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramPost {
  id: string;
  hook: string;
  body: string;
  cta: string;
  visualAssetListJson: string | null;
  audioTrack: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  scheduledFor: string | null;
  hashtagClusterJson: string | null;
  charCount: number;
  estScore: number;
  studentAcquisitionGoal: string | null;
}

export interface RepoBundle {
  id: string;
  name: string;
  repoUrlsJson: string;
  directoryStructureJson: string | null;
  fileCount: number;
  totalSize: number;
  tokenEstimate: number;
  outputFormat: "ZIP" | "XML_PROMPT" | "MARKDOWN";
  createdAt: string;
}

export interface AgentActionLog {
  id: string;
  timestamp: string;
  actionType: "RECONCILE_LEDGER" | "STALE_TASK_AUDIT" | "HOMEWORK_NAG" | "CAPACITY_GUARDIAN";
  description: string;
  status: "SUCCESS" | "WARNING" | "INFO";
  metadataJson: string | null;
}
