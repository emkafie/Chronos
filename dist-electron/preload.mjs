"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("chronosAPI", {
  // Desktop notification
  notifDesktop: (pesan) => electron.ipcRenderer.send("kirim-notifikasi", pesan),
  // Window controls (for frameless window)
  minimizeWindow: () => electron.ipcRenderer.send("window-minimize"),
  maximizeWindow: () => electron.ipcRenderer.send("window-maximize"),
  closeWindow: () => electron.ipcRenderer.send("window-close"),
  // Platform info
  getPlatform: () => process.platform,
  loadData: () => electron.ipcRenderer.invoke("load-data"),
  saveData: (data) => electron.ipcRenderer.send("save-data", data),
  saveFile: (filename, buffer, mimeType) => electron.ipcRenderer.invoke("save-file", { filename, buffer, mimeType }),
  openFileFolder: (filePath) => electron.ipcRenderer.send("open-file-folder", filePath)
});
