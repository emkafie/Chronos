// ─── Chronos Type Definitions ────────────────────────────────────────────────

export type Page = 'tasks' | 'reports' | 'history' | 'settings'

export type TaskStatus = 'todo' | 'in-progress' | 'done'

export type TaskTag =
  | 'Development'
  | 'Academic'
  | 'Design'
  | 'Research'
  | 'Meeting'
  | 'Personal'
  | 'Bug Fix'
  | 'Documentation'

export interface Task {
  id: string
  title: string
  description: string
  tags: TaskTag[]
  status: TaskStatus
  createdAt: string      // ISO string
  completedAt?: string   // ISO string
  formalTitle?: string    // AI-formalized version
}

export type ExportFormat = 'pdf' | 'xlsx' | 'docx'

export interface ExportRecord {
  id: string
  date: string           // ISO string
  weekRange: string      // e.g. "June 14 – June 20, 2026"
  format: ExportFormat
  filename: string
  filePath?: string
}

// ─── Tag Color Map ───────────────────────────────────────────────────────────

export const TAG_COLORS: Record<TaskTag, { bg: string; text: string }> = {
  'Development':   { bg: 'bg-blue-500/20',    text: 'text-blue-300' },
  'Academic':      { bg: 'bg-purple-500/20',   text: 'text-purple-300' },
  'Design':        { bg: 'bg-pink-500/20',     text: 'text-pink-300' },
  'Research':      { bg: 'bg-amber-500/20',    text: 'text-amber-300' },
  'Meeting':       { bg: 'bg-green-500/20',    text: 'text-green-300' },
  'Personal':      { bg: 'bg-cyan-500/20',     text: 'text-cyan-300' },
  'Bug Fix':       { bg: 'bg-red-500/20',      text: 'text-red-300' },
  'Documentation': { bg: 'bg-slate-500/20',    text: 'text-slate-300' },
}

// ─── Status Config ───────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  'todo':        { label: 'To-Do',       bg: 'bg-slate-500/20',  text: 'text-slate-300',  dot: 'bg-slate-400' },
  'in-progress': { label: 'In Progress', bg: 'bg-amber-500/20',  text: 'text-amber-300',  dot: 'bg-amber-400' },
  'done':        { label: 'Done',        bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
}
