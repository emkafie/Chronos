# Chronos — Aplikasi Produktivitas

Chronos adalah aplikasi produktivitas desktop berbasis **Electron** + **React (TypeScript)** + **Vite** yang dirancang dengan estetika visual **macOS Glassmorphism** yang mewah. Aplikasi ini mengkombinasikan pengatur tugas harian (*Task Manager*) dengan pembuat laporan mingguan otomatis (*Weekly Logbook Report Maker*) yang dilengkapi fitur formalisasi teks berbasis AI lokal yang aman serta ekspor dokumen kustom multi-format (PDF, Excel, Word).

---

## 🌟 Fitur Utama

1. **Mac-style Glassmorphism UI**
   * Antarmuka transparan dengan efek buram (*backdrop blur*) asli sistem operasi:
     * **Windows**: Efek Windows 11 **Acrylic** (`backgroundMaterial: 'acrylic'`).
     * **macOS**: Efek **Vibrancy** (`vibrancy: 'under-window'`).
   * Panel dan kartu bergaya *frosted glass* yang disempurnakan dengan animasi mikro yang memanjakan mata.

2. **Custom Frameless Titlebar**
   * Desain tanpa bingkai jendela bawaan sistem operasi.
   * Tombol kontrol jendela (Minimize, Maximize, Close) bergaya bulatan *traffic light* macOS yang interaktif.

3. **Smart Task Manager**
   * Manajemen daur hidup tugas yang interaktif dengan alur status terstruktur: **To-Do ➔ In Progress ➔ Done**.
   * Klasifikasi tugas dengan tag berwarna khusus.
   * Tombol penghapusan dan filter pencarian instan berdasarkan status.

4. **Weekly Report Maker & Custom Templates**
   * Mengumpulkan semua tugas yang berstatus **Done** (Selesai) secara otomatis untuk minggu berjalan.
   * Judul laporan mingguan yang dapat disunting langsung (*inline edit*).
   * **Dropdown Pilihan Templat Laporan**:
     * **Laporan Umum**: Daftar tugas harian standar terstruktur.
     * **Tugas Praktikum**: Format akademik dengan pembagian sub-bab "Prosedur & Implementasi Tugas" serta "Analisis & Pembahasan Hasil Praktikum".
     * **Proposal Inovasi**: Format profesional untuk proyek/hackathon yang otomatis melampirkan tabel **Market Analysis (TAM, SAM, SOM)** dan kesesuaian **SDG (Sustainable Development Goals)** di bagian bawah laporan.

5. **Arsitektur Ekspor Jendela Native (Tanpa `file-saver`)**
   * Dokumen di-render langsung ke memori sebagai `ArrayBuffer` di thread Renderer.
   * Dikirim secara aman melewati IPC barrier menuju Electron Main Process.
   * Menggunakan dialog penyimpanan native OS (`dialog.showSaveDialog`) yang memungkinkan pengguna memilih folder tujuan penyimpanan mana saja di sistem mereka secara dinamis.

6. **Integrasi Folder OS ("Buka Lokasi")**
   * Setiap dokumen yang berhasil diekspor akan mencatat absolut path penyimpanannya di dalam log riwayat.
   * Halaman **History Log** kini dilengkapi tombol kustom **"Buka Lokasi"** untuk masing-masing baris ekspor.
   * Menekan tombol ini akan membuka File Explorer (Windows) atau Finder (macOS) secara native dan langsung menyoroti/menyeleksi berkas tersebut menggunakan API `shell.showItemInFolder`.

7. **Embedded Offline AI (Transformers.js)**
   * Menggunakan pustaka `@xenova/transformers` dengan model `Xenova/LaMini-Flan-T5-248M` (~480MB) untuk fitur **✨ Formalize** (mengubah deskripsi tugas kasual menjadi kalimat formal profesional).
   * **Dedicated Web Worker**: Proses inferensi AI berjalan di thread latar belakang terpisah (`ai.worker.ts`) agar UI utama React tetap responsif dan bebas macet.
   * **Local Caching**: Model diunduh otomatis sekali pada pemakaian pertama dari CDN Hugging Face dan langsung disimpan di Cache Browser untuk digunakan secara offline seterusnya.
   * **Row-Level Shimmer Loading**: Status pemrosesan AI disajikan secara dinamis lewat efek animasi *shimmer* lokal pada baris tugas yang sedang diproses.

---

## 🛠️ Tech Stack & Dependensi

* **Core**: Electron (v30), React (v18), TypeScript, Vite (v5)
* **Styling**: Tailwind CSS (v4) dengan konfigurasi custom theme glassmorphic
* **Export Engines**:
  * `jspdf` & `jspdf-autotable` (Generator PDF)
  * `xlsx` (Generator Excel)
  * `docx` (Generator Word)

---

## 📂 Struktur Folder Utama

```tree
chronos/
├── electron/
│   ├── main.ts             # Jendela utama, konfigurasi glassmorphism, & IPC handler database/native saving
│   ├── preload.ts          # Ekspos API sistem (Window Controls, Database, & Save/Open File API) ke React
│   └── electron-env.d.ts   # Definisi tipe global Electron untuk proses Renderer
├── src/
│   ├── components/
│   │   ├── Titlebar.tsx    # Komponen titlebar seret/drag kustom
│   │   └── Sidebar.tsx     # Panel navigasi glassmorphism samping
│   ├── pages/
│   │   ├── TaskManager.tsx # Manajemen tugas
│   │   ├── ReportMaker.tsx # Dropdown templat, AI formalizer, & ekspor berkas laporan
│   │   ├── HistoryLog.tsx  # Riwayat ekspor berkas dengan fitur "Buka Lokasi"
│   │   └── Settings.tsx    # Informasi & preferensi aplikasi
│   ├── hooks/
│   │   └── useAI.ts        # Custom React hook untuk manajemen komunikasi Web Worker AI
│   ├── ai.worker.ts        # Kode Web Worker untuk pengolahan model AI offline (Transformers.js)
│   ├── store.tsx           # Global State (Context + Reducer) & penanganan penyimpanan JSON
│   ├── types.ts            # Jenis data model bersama (Task, ExportRecord, dll.)
│   ├── index.css           # Sistem desain css, variabel glass, & keyframes animasi
│   ├── App.tsx             # Shell layout & Router halaman sederhana
│   └── vite-env.d.ts       # Type declaration window API untuk build Vite
├── package.json            # Daftar skrip & dependensi proyek
└── tsconfig.json           # Konfigurasi ketat TypeScript compiler
```

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat
Pastikan Anda telah memasang [Node.js](https://nodejs.org/) di komputer Anda.

### 2. Memasang Dependensi
Jalankan perintah berikut di direktori proyek Anda:
```bash
npm install
```

### 3. Mode Pengembangan (Development)
Jalankan perintah ini untuk memulai Vite dev server bersama dengan Electron:
```bash
npm run dev
```
*Catatan: Jika Anda merubah konfigurasi di folder `electron/` (seperti `main.ts` atau `preload.ts`), silakan matikan proses (`Ctrl+C`) lalu jalankan `npm run dev` kembali agar perubahan Electron main process diterapkan.*

### 4. Melakukan Uji Kompilasi TypeScript
Untuk memastikan tidak ada kesalahan tipe dalam kode Anda:
```bash
npx tsc --noEmit
```

### 5. Membangun & Mengemas Aplikasi (Build & Package)
Untuk mengompilasi dan mengemas aplikasi menjadi aplikasi desktop `.exe` / `.dmg` siap instal:
```bash
npm run build
```
Hasil kemasan aplikasi akan berada di folder `/dist` atau `/dist_electron`.
