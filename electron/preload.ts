import { ipcRenderer, contextBridge } from 'electron'

// ─── Expose IPC Renderer to the Renderer process ──────────────────────────────
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// ─── Expose Chronos API ───────────────────────────────────────────────────────
contextBridge.exposeInMainWorld('chronosAPI', {
  // Desktop notification
  notifDesktop: (pesan: string) => ipcRenderer.send('kirim-notifikasi', pesan),

  // Window controls (for frameless window)
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Platform info
  getPlatform: () => process.platform,

  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data: any) => ipcRenderer.send('save-data', data),
  saveFile: (filename: string, buffer: ArrayBuffer, mimeType: string) => ipcRenderer.invoke('save-file', { filename, buffer, mimeType }),
  openFileFolder: (filePath: string) => ipcRenderer.send('open-file-folder', filePath),
})
