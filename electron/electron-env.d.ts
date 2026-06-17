/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
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
