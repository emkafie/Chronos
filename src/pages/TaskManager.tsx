import { useState } from 'react'
import { useTasks } from '../store'
import type { Task, TaskStatus, TaskTag } from '../types'
import { TAG_COLORS, STATUS_CONFIG } from '../types'

// ─── Available Tags ──────────────────────────────────────────────────────────

const ALL_TAGS: TaskTag[] = [
  'Development', 'Academic', 'Design', 'Research',
  'Meeting', 'Personal', 'Bug Fix', 'Documentation',
]

// ─── Status Filter ───────────────────────────────────────────────────────────

type FilterStatus = 'all' | TaskStatus

// ─── TaskManager Page ────────────────────────────────────────────────────────

export default function TaskManager() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newTags, setNewTags] = useState<TaskTag[]>([])

  // Filter tasks
  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filter)

  // Count per status
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  // Add task handler
  const handleAddTask = () => {
    if (!newTitle.trim()) return
    addTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      tags: newTags.length > 0 ? newTags : ['Personal'],
      status: 'todo',
    })
    setNewTitle('')
    setNewDesc('')
    setNewTags([])
    setShowAddForm(false)
  }

  // Cycle status forward
  const cycleStatus = (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo',
    }
    const newStatus = nextStatus[task.status]
    updateTask(task.id, {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
    })
  }

  // Toggle tag in add form
  const toggleTag = (tag: TaskTag) => {
    setNewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // Format date
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ── Header ── */}
      <div className="shrink-0 px-8 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Task Manager</h2>
            <p className="text-xs text-white/35 mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <button
            id="btn-add-task"
            onClick={() => setShowAddForm(!showAddForm)}
            className="glass-button-primary glass-button px-4 py-2 text-sm flex items-center gap-2"
          >
            <span className="text-lg leading-none">{showAddForm ? '✕' : '+'}</span>
            <span>{showAddForm ? 'Cancel' : 'Add Task'}</span>
          </button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex gap-2 mt-4">
          {(['all', 'todo', 'in-progress', 'done'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${filter === f
                  ? 'bg-white/12 text-white border border-white/15'
                  : 'text-white/40 hover:text-white/65 hover:bg-white/5 border border-transparent'
                }
              `}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
              <span className="ml-1.5 text-[10px] opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Add Task Form ── */}
      {showAddForm && (
        <div className="shrink-0 px-8 py-5 border-b border-white/5 animate-fade-in">
          <div className="glass-card p-5 space-y-4">
            <input
              id="input-task-title"
              type="text"
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="glass-input w-full px-4 py-2.5 text-sm"
              autoFocus
            />
            <textarea
              id="input-task-desc"
              placeholder="Description (optional)..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="glass-input w-full px-4 py-2.5 text-sm resize-none h-20"
            />
            {/* Tag selector */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-semibold">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TAGS.map((tag) => {
                  const isSelected = newTags.includes(tag)
                  const colors = TAG_COLORS[tag]
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`
                        pill text-[11px] cursor-pointer transition-all duration-200
                        ${isSelected
                          ? `${colors.bg} ${colors.text} ring-1 ring-current/30`
                          : 'bg-white/5 text-white/35 hover:bg-white/10 hover:text-white/55'
                        }
                      `}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                id="btn-submit-task"
                onClick={handleAddTask}
                className="glass-button-primary glass-button px-5 py-2 text-sm"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task List ── */}
      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <span className="text-4xl mb-3">🎯</span>
            <p className="text-sm text-white/50">No tasks found</p>
            <p className="text-xs text-white/30 mt-1">
              {filter !== 'all' ? 'Try a different filter' : 'Click "Add Task" to get started'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onCycleStatus={() => cycleStatus(task)}
              onDelete={() => deleteTask(task.id)}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Task Card Sub-component ─────────────────────────────────────────────────

interface TaskCardProps {
  task: Task
  index: number
  onCycleStatus: () => void
  onDelete: () => void
  formatDate: (iso: string) => string
}

function TaskCard({ task, index, onCycleStatus, onDelete, formatDate }: TaskCardProps) {
  const statusCfg = STATUS_CONFIG[task.status]
  const isDone = task.status === 'done'

  return (
    <div
      className={`
        glass-card p-4 flex items-start gap-4
        ${isDone ? 'opacity-60' : ''}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Status toggle button */}
      <button
        id={`task-status-${task.id}`}
        onClick={onCycleStatus}
        className={`
          mt-0.5 w-5 h-5 rounded-full border-2 shrink-0
          flex items-center justify-center transition-all duration-300
          ${isDone
            ? 'bg-emerald-500/30 border-emerald-400/60'
            : task.status === 'in-progress'
              ? 'border-amber-400/50 bg-amber-400/10'
              : 'border-white/20 hover:border-white/40 bg-transparent'
          }
        `}
        title={`Status: ${statusCfg.label} (click to advance)`}
      >
        {isDone && (
          <svg className="w-3 h-3 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {task.status === 'in-progress' && (
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-white/40' : 'text-white/90'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`pill ${statusCfg.bg} ${statusCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        {task.description && (
          <p className={`text-xs mt-1.5 leading-relaxed ${isDone ? 'text-white/25' : 'text-white/40'}`}>
            {task.description}
          </p>
        )}

        {/* Tags + Meta */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => {
              const colors = TAG_COLORS[tag]
              return (
                <span key={tag} className={`pill ${colors.bg} ${colors.text}`}>
                  {tag}
                </span>
              )
            })}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/25">
              {formatDate(task.createdAt)}
            </span>
            <button
              id={`task-delete-${task.id}`}
              onClick={onDelete}
              className="text-white/15 hover:text-red-400/70 transition-colors duration-200"
              title="Delete task"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
