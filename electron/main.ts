import { app, BrowserWindow, ipcMain, Notification, dialog, shell } from 'electron'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(app.getPath('userData'), 'chronos_data.json')

ipcMain.handle('load-data', () => {
  try {
    if (!fs.existsSync(dbPath)) {
      return null
    }
    const rawData = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(rawData)
  } catch (error) {
    console.error('Gagal membaca database:', error)
    return null
  }
})

ipcMain.on('save-data', (_event, data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Gagal menyimpan database:', error)
  }
})

ipcMain.handle('save-file', async (event, { filename, buffer, mimeType }) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null

    const ext = path.extname(filename).toLowerCase().substring(1)

    const { filePath, canceled } = await dialog.showSaveDialog(win, {
      title: 'Simpan Laporan',
      defaultPath: path.join(app.getPath('downloads'), filename),
      filters: [
        { 
          name: mimeType === 'application/pdf' 
            ? 'PDF Files' 
            : mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            ? 'Excel/Spreadsheet Files' 
            : 'Word/Document Files', 
          extensions: [ext] 
        }
      ]
    })

    if (canceled || !filePath) {
      return null
    }

    fs.writeFileSync(filePath, Buffer.from(buffer))
    return filePath
  } catch (error) {
    console.error('Gagal menyimpan berkas:', error)
    return null
  }
})

ipcMain.on('open-file-folder', (_event, filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath)
    } else {
      new Notification({
        title: 'Chronos App',
        body: 'Berkas tidak ditemukan di lokasi penyimpanan.',
      }).show()
    }
  } catch (error) {
    console.error('Gagal membuka lokasi berkas:', error)
  }
})

// ─── Directory Structure ─────────────────────────────────────────────────────
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
//
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  // ─── Platform-specific glassmorphism options ─────────────────────────
  const isMac = process.platform === 'darwin'
  const isWin = process.platform === 'win32'

  const platformOptions: Electron.BrowserWindowConstructorOptions = {}

  if (isMac) {
    platformOptions.vibrancy = 'under-window'
    platformOptions.visualEffectState = 'active'
    platformOptions.titleBarStyle = 'hiddenInset'
    platformOptions.trafficLightPosition = { x: 15, y: 14 }
  }

  if (isWin) {
    platformOptions.backgroundMaterial = 'acrylic'
  }

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    ...platformOptions,
  })

  // ─── Window control IPC handlers ─────────────────────────────────────
  ipcMain.on('window-minimize', () => {
    win?.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    win?.close()
  })

  // ─── Desktop notification handler ────────────────────────────────────
  ipcMain.on('kirim-notifikasi', (_event, pesan: string) => {
    new Notification({
      title: 'Chronos App',
      body: pesan,
    }).show()
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
