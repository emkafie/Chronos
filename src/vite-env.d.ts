/// <reference types="vite/client" />

interface Window {
  ipcRenderer: import('electron').IpcRenderer
  chronosAPI: {
    notifDesktop: (pesan: string) => void
    minimizeWindow: () => void
    maximizeWindow: () => void
    closeWindow: () => void
    getPlatform: () => string
    loadData: () => Promise<any>
    saveData: (data: any) => void
    saveFile: (filename: string, buffer: ArrayBuffer, mimeType: string) => Promise<string | null>
    openFileFolder: (filePath: string) => void
  }
}