import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react'
import type { Task, ExportRecord } from './types'

// ─── State Shape ─────────────────────────────────────────────────────────────

interface AppState {
  tasks: Task[]
  exportHistory: ExportRecord[]
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_EXPORT_RECORD'; payload: ExportRecord }
  | { type: 'SET_INITIAL_DATA'; payload: AppState }

// ─── Helper ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, ...action.payload.updates }
            : t
        ),
      }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      }

    case 'ADD_EXPORT_RECORD':
      return {
        ...state,
        exportHistory: [action.payload, ...state.exportHistory],
      }

    case 'SET_INITIAL_DATA':
      return action.payload

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, { tasks: [], exportHistory: [] })
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Ambil data saat aplikasi pertama kali dibuka
  useEffect(() => {
    const fetchData = async () => {
      const savedData = await window.chronosAPI.loadData()
      if (savedData) {
        // Sanitasi data yang dimuat untuk mengatasi perbedaan nama field atau file korup
        const sanitizedData: AppState = {
          tasks: Array.isArray(savedData.tasks) ? savedData.tasks : [],
          exportHistory: Array.isArray(savedData.exportHistory)
            ? savedData.exportHistory
            : Array.isArray(savedData.history) // Tangani migrasi dari field 'history' lama
            ? savedData.history
            : [], 
        }
        dispatch({ type: 'SET_INITIAL_DATA', payload: sanitizedData })
      }
      setIsLoaded(true)
    }
    fetchData()
  }, [])

  // 2. Simpan data secara otomatis setiap kali 'state' berubah
  useEffect(() => {
    if (isLoaded) {
      window.chronosAPI.saveData(state)
    }
  }, [state, isLoaded])

  // Jangan render anak-anaknya sebelum data selesai dimuat agar UI tidak berkedip
  if (!isLoaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white bg-black/20 backdrop-blur-md">
        <div className="text-lg font-medium tracking-wide">Memuat database...</div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}

export function useTasks() {
  const { state, dispatch } = useAppContext()

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'ADD_TASK',
      payload: {
        ...task,
        id: generateId(),
        createdAt: new Date().toISOString(),
      },
    })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
  }

  return { tasks: state.tasks || [], addTask, updateTask, deleteTask }
}

export function useExportHistory() {
  const { state, dispatch } = useAppContext()

  const addExportRecord = (record: Omit<ExportRecord, 'id'>) => {
    dispatch({
      type: 'ADD_EXPORT_RECORD',
      payload: { ...record, id: generateId() },
    })
  }

  return { exportHistory: state.exportHistory || [], addExportRecord }
}
