import { useEffect, useRef, useState } from 'react'
import AIWorker from '../ai.worker?worker'

export function useAI() {
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  
  const workerRef = useRef<Worker | null>(null)
  const callbacksRef = useRef<Record<string, (result: string) => void>>({})

  useEffect(() => {
    let worker: Worker
    try {
      // Set status menjadi loading segera saat thread dibuat
      setModelStatus('loading')

      // Inisiasi worker menggunakan bundle constructor virtual dari Vite
      worker = new AIWorker()
      workerRef.current = worker
    } catch (err: any) {
      console.error('Gagal membuat background thread worker AI:', err)
      setError(`Gagal memuat background thread worker AI: ${err.message}`)
      setModelStatus('error')
      return
    }

    // Mulai inisialisasi / muat model AI
    worker.postMessage({ type: 'init' })

    worker.onmessage = (event: MessageEvent) => {
      const { type, status, taskId, text, error: errMsg, progress } = event.data

      if (type === 'status') {
        setModelStatus(status)
        if (status === 'ready') {
          setError(null)
          setDownloadProgress(100)
        }
      } else if (type === 'progress') {
        setDownloadProgress(Math.round(progress))
      } else if (type === 'result') {
        // Matikan efek loading untuk tugas tertentu
        setLoadingTasks((prev) => ({ ...prev, [taskId]: false }))
        
        // Panggil callback yang terdaftar untuk tugas ini
        if (callbacksRef.current[taskId]) {
          callbacksRef.current[taskId](text)
          delete callbacksRef.current[taskId]
        }
      } else if (type === 'error') {
        if (taskId) {
          setLoadingTasks((prev) => ({ ...prev, [taskId]: false }))
        }
        setError(errMsg)
        setModelStatus('error')
      }
    }

    worker.onerror = (err) => {
      console.error('Thread Worker error event:', err)
      setError(`Thread AI error: ${err.message || 'Gagal memuat thread worker.'}`)
      setModelStatus('error')
    }

    return () => {
      worker.terminate()
    }
  }, [])

  const formalizeTask = (taskId: string, text: string, onDone: (result: string) => void) => {
    if (!workerRef.current) return
    
    // Set status loading untuk task ID ini
    setLoadingTasks((prev) => ({ ...prev, [taskId]: true }))
    
    // Daftarkan callback penyelesaian tugas
    callbacksRef.current[taskId] = onDone

    // Kirim pesan untuk formalisasi
    workerRef.current.postMessage({ type: 'formalize', taskId, text })
  }

  return {
    modelStatus,
    loadingTasks,
    error,
    downloadProgress,
    formalizeTask,
  }
}
