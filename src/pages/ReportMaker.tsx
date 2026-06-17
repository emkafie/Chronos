import { useState } from 'react'
import { useTasks, useExportHistory } from '../store'
import { TAG_COLORS } from '../types'
import type { Task, ExportFormat } from '../types'
import { useAI } from '../hooks/useAI'

// ─── Week Range Helper ───────────────────────────────────────────────────────

function getCurrentWeekRange(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return date >= monday && date <= sunday
}

// ─── In-Memory Export Generators ──────────────────────────────────────────────

async function generatePDFBuffer(tasks: Task[], template: string): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  // Header Title berdasarkan Templat
  let title = 'Chronos — Weekly Logbook Report'
  if (template === 'praktikum') {
    title = 'LAPORAN PRAKTIKUM MINGGUAN: CHRONOS'
  } else if (template === 'inovasi') {
    title = 'PROPOSAL INOVASI PROYEK — CHRONOS'
  }

  doc.setFontSize(18)
  doc.setTextColor(30, 41, 59)
  doc.text(title, 14, 22)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(getCurrentWeekRange(), 14, 30)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36)

  // Header kolom tabel tugas harian
  let tableHeader = ['#', 'Task', 'Tags', 'Completed']
  if (template === 'praktikum') {
    tableHeader = ['#', 'Prosedur & Implementasi Tugas', 'Kategori', 'Selesai']
  } else if (template === 'inovasi') {
    tableHeader = ['#', 'Rencana Implementasi Tugas', 'Kategori', 'Selesai']
  }

  autoTable(doc, {
    startY: 44,
    head: [tableHeader],
    body: tasks.map((t, i) => [
      String(i + 1),
      t.formalTitle || t.title,
      t.tags.join(', '),
      t.completedAt
        ? new Date(t.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '-',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
  })

  let currentY = (doc as any).lastAutoTable.finalY + 15

  // Sesi Tambahan Templat
  if (template === 'praktikum') {
    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text('2. Analisis & Pembahasan Hasil Praktikum', 14, currentY)
    
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)
    doc.text('Hasil pengamatan dan kesimpulan dari pengerjaan modul praktikum ini adalah sebagai berikut:', 14, currentY + 6)
    
    autoTable(doc, {
      startY: currentY + 10,
      head: [['Kategori Evaluasi', 'Hasil Analisis & Pembahasan Pengamatan']],
      body: [
        ['Evaluasi Kinerja', 'Implementasi sistem berjalan lancar sesuai dengan standar prosedur operasional.'],
        ['Stabilitas Sistem', 'Pengujian lokal menunjukkan performa AI responsif dan konsumsi memori stabil.']
      ],
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    })
  } else if (template === 'inovasi') {
    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text('2. Market Analysis (TAM, SAM, SOM)', 14, currentY)

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Market Segment', 'Deskripsi Target Pasar', 'Estimasi Nilai Pasar']],
      body: [
        ['TAM (Total Addressable Market)', 'Target pasar global pengguna aplikasi produktivitas digital secara umum.', '$10.0 Billion'],
        ['SAM (Serviceable Addressable Market)', 'Target pasar regional pekerja lepas, pengembang, dan tim proyek lokal.', '$500 Million'],
        ['SOM (Serviceable Obtainable Market)', 'Target realistis perolehan awal pengguna aktif segmentasi lokal (2 tahun).', '$50 Million']
      ],
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    })

    currentY = (doc as any).lastAutoTable.finalY + 12

    doc.setFontSize(13)
    doc.setTextColor(30, 41, 59)
    doc.text('3. Sustainable Development Goals (SDG) Alignment', 14, currentY)

    autoTable(doc, {
      startY: currentY + 5,
      head: [['SDG Goal', 'Kesesuaian & Dampak Inovasi terhadap Keberlanjutan']],
      body: [
        ['SDG 8: Decent Work & Economic Growth', 'Meningkatkan produktivitas kerja melalui otomatisasi penyusunan laporan kerja mingguan.'],
        ['SDG 9: Industry, Innovation & Infrastructure', 'Penerapan teknologi AI offline lokal untuk keamanan data dan infrastruktur terdistribusi.'],
        ['SDG 12: Responsible Consumption', 'Mendukung kelestarian lingkungan dengan menekan pemakaian kertas lewat digitalisasi laporan.']
      ],
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    })
  }

  return doc.output('arraybuffer')
}

async function generateExcelBuffer(tasks: Task[], template: string): Promise<ArrayBuffer> {
  const XLSX = await import('xlsx')

  const wb = XLSX.utils.book_new()

  // Sheet 1: Rencana/Hasil Kerja
  const tasksData = tasks.map((t, i) => ({
    No: i + 1,
    Tugas: t.formalTitle || t.title,
    Deskripsi: t.description,
    Kategori: t.tags.join(', '),
    Status: t.status,
    Selesai: t.completedAt
      ? new Date(t.completedAt).toLocaleDateString('en-US')
      : '-',
  }))

  const ws = XLSX.utils.json_to_sheet(tasksData)
  ws['!cols'] = [
    { wch: 4 }, { wch: 40 }, { wch: 50 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
  ]

  let sheetName = 'Laporan Mingguan'
  if (template === 'praktikum') {
    sheetName = 'Prosedur & Hasil'
  } else if (template === 'inovasi') {
    sheetName = 'Rencana Kerja'
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Tambahan Sheet berdasarkan jenis templat
  if (template === 'praktikum') {
    const analysisData = [
      { 'Kategori Evaluasi': 'Evaluasi Kinerja', 'Hasil Analisis & Pembahasan': 'Implementasi sistem berjalan lancar sesuai dengan standar prosedur operasional.' },
      { 'Kategori Evaluasi': 'Stabilitas Sistem', 'Hasil Analisis & Pembahasan': 'Pengujian lokal menunjukkan performa AI responsif dan konsumsi memori stabil.' }
    ]
    const wsAnalysis = XLSX.utils.json_to_sheet(analysisData)
    wsAnalysis['!cols'] = [{ wch: 25 }, { wch: 70 }]
    XLSX.utils.book_append_sheet(wb, wsAnalysis, 'Analisis & Pembahasan')
  } else if (template === 'inovasi') {
    const marketData = [
      { 'Market Level': 'TAM (Total Addressable Market)', 'Deskripsi Target': 'Target pasar global pengguna aplikasi produktivitas', 'Estimasi Nilai ($)': '$10,000,000,000' },
      { 'Market Level': 'SAM (Serviceable Addressable Market)', 'Deskripsi Target': 'Target pasar regional pekerja lepas, pengembang, dan tim proyek', 'Estimasi Nilai ($)': '$500,000,000' },
      { 'Market Level': 'SOM (Serviceable Obtainable Market)', 'Deskripsi Target': 'Target perolehan awal pengguna aktif segmentasi lokal (2 tahun)', 'Estimasi Nilai ($)': '$50,000,000' }
    ]
    const sdgData = [
      { 'SDG Goal': 'SDG 8: Decent Work & Economic Growth', 'Dampak Keberlanjutan': 'Meningkatkan produktivitas kerja melalui otomatisasi penyusunan laporan kerja mingguan.' },
      { 'SDG Goal': 'SDG 9: Industry, Innovation & Infrastructure', 'Dampak Keberlanjutan': 'Penerapan teknologi AI offline lokal untuk keamanan data dan infrastruktur terdistribusi.' },
      { 'SDG Goal': 'SDG 12: Responsible Consumption', 'Dampak Keberlanjutan': 'Mendukung kelestarian lingkungan dengan menekan pemakaian kertas lewat digitalisasi laporan.' }
    ]
    
    const wsMarket = XLSX.utils.json_to_sheet(marketData)
    wsMarket['!cols'] = [{ wch: 40 }, { wch: 60 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsMarket, 'Analisis Pasar')

    const wsSdg = XLSX.utils.json_to_sheet(sdgData)
    wsSdg['!cols'] = [{ wch: 40 }, { wch: 80 }]
    XLSX.utils.book_append_sheet(wb, wsSdg, 'Penyelarasan SDG')
  }

  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
}

async function generateWordBuffer(tasks: Task[], template: string): Promise<ArrayBuffer> {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, HeadingLevel } = await import('docx')

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
  }

  let docTitle = 'Chronos — Weekly Logbook Report'
  if (template === 'praktikum') {
    docTitle = 'LAPORAN PRAKTIKUM MINGGUAN: CHRONOS'
  } else if (template === 'inovasi') {
    docTitle = 'PROPOSAL INOVASI PROYEK — CHRONOS'
  }

  const sectionsChildren: any[] = [
    new Paragraph({
      children: [new TextRun({ text: docTitle, bold: true, size: 32, color: '1e293b' })],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: getCurrentWeekRange(), color: '64748b', size: 20 })],
      spacing: { after: 300 },
    })
  ]

  // Section 1: Daftar Tugas
  const tableHeader = ['#', 'Task', 'Tags', 'Completed']
  const taskRows = [
    new TableRow({
      children: tableHeader.map((h) =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, size: 18, color: 'ffffff' })],
            alignment: AlignmentType.LEFT,
          })],
          shading: { fill: '334155' },
          borders: borderNone,
        })
      ),
    }),
    ...tasks.map((t, i) =>
      new TableRow({
        children: [
          String(i + 1),
          t.formalTitle || t.title,
          t.tags.join(', '),
          t.completedAt
            ? new Date(t.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '-',
        ].map((text) =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text, size: 18, color: '1e293b' })],
            })],
            shading: { fill: i % 2 === 0 ? 'f1f5f9' : 'ffffff' },
            borders: borderNone,
          })
        ),
      })
    )
  ]

  sectionsChildren.push(
    new Paragraph({
      children: [
        new TextRun({ 
          text: template === 'praktikum' 
            ? 'I. Prosedur & Implementasi Tugas' 
            : template === 'inovasi' 
            ? 'I. Rencana Implementasi Proyek' 
            : 'Daftar Tugas Mingguan', 
          bold: true, 
          size: 24, 
          color: '334155' 
        })
      ],
      spacing: { before: 200, after: 150 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: taskRows,
    })
  )

  // Sesi Tambahan
  if (template === 'praktikum') {
    sectionsChildren.push(
      new Paragraph({
        children: [new TextRun({ text: 'II. Analisis & Pembahasan Hasil Praktikum', bold: true, size: 24, color: '334155' })],
        spacing: { before: 400, after: 150 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Berdasarkan pelaksanaan prosedur kerja praktikum di atas, diperoleh evaluasi pengamatan sebagai berikut:', size: 20, color: '475569' })],
        spacing: { after: 200 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: ['Kategori Evaluasi', 'Hasil Analisis & Pembahasan Pengamatan'].map((h) =>
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 18, color: 'ffffff' })],
                })],
                shading: { fill: '475569' },
                borders: borderNone,
              })
            ),
          }),
          new TableRow({
            children: ['Evaluasi Kinerja', 'Implementasi sistem berjalan lancar sesuai dengan standar prosedur operasional.'].map((text) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, size: 18, color: '1e293b' })] })],
                shading: { fill: 'f8fafc' },
                borders: borderNone,
              })
            ),
          }),
          new TableRow({
            children: ['Stabilitas Sistem', 'Pengujian lokal menunjukkan performa AI responsif dan konsumsi memori stabil.'].map((text) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, size: 18, color: '1e293b' })] })],
                shading: { fill: 'ffffff' },
                borders: borderNone,
              })
            ),
          }),
        ],
      })
    )
  } else if (template === 'inovasi') {
    sectionsChildren.push(
      // Market Analysis
      new Paragraph({
        children: [new TextRun({ text: 'II. Market Analysis (TAM, SAM, SOM)', bold: true, size: 24, color: '334155' })],
        spacing: { before: 400, after: 150 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: ['Market Level', 'Deskripsi Target Pasar', 'Estimasi Nilai'].map((h) =>
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 18, color: 'ffffff' })],
                })],
                shading: { fill: '475569' },
                borders: borderNone,
              })
            ),
          }),
          ...[
            ['TAM (Total Addressable Market)', 'Target pasar global pengguna aplikasi produktivitas digital secara umum.', '$10.0 Billion'],
            ['SAM (Serviceable Addressable Market)', 'Target pasar regional pekerja lepas, pengembang, dan tim proyek lokal.', '$500 Million'],
            ['SOM (Serviceable Obtainable Market)', 'Target perolehan awal pengguna aktif segmentasi lokal (2 tahun).', '$50 Million']
          ].map((row, idx) =>
            new TableRow({
              children: row.map((text) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, size: 18, color: '1e293b' })] })],
                  shading: { fill: idx % 2 === 0 ? 'f8fafc' : 'ffffff' },
                  borders: borderNone,
                })
              ),
            })
          )
        ],
      }),
      // SDG Alignment
      new Paragraph({
        children: [new TextRun({ text: 'III. Sustainable Development Goals (SDG) Alignment', bold: true, size: 24, color: '334155' })],
        spacing: { before: 400, after: 150 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: ['SDG Goal', 'Kesesuaian & Dampak Inovasi terhadap Keberlanjutan'].map((h) =>
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 18, color: 'ffffff' })],
                })],
                shading: { fill: '475569' },
                borders: borderNone,
              })
            ),
          }),
          ...[
            ['SDG 8: Decent Work & Economic Growth', 'Meningkatkan produktivitas kerja melalui otomatisasi penyusunan laporan kerja mingguan.'],
            ['SDG 9: Industry, Innovation & Infrastructure', 'Penerapan teknologi AI offline lokal untuk keamanan data dan infrastruktur terdistribusi.'],
            ['SDG 12: Responsible Consumption', 'Mendukung gerakan pelestarian lingkungan dengan digitalisasi laporan tanpa kertas.']
          ].map((row, idx) =>
            new TableRow({
              children: row.map((text) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, size: 18, color: '1e293b' })] })],
                  shading: { fill: idx % 2 === 0 ? 'f8fafc' : 'ffffff' },
                  borders: borderNone,
                })
              ),
            })
          )
        ],
      })
    )
  }

  const doc = new Document({
    sections: [{
      children: sectionsChildren,
    }],
  })

  const docBlob = await Packer.toBlob(doc)
  return await docBlob.arrayBuffer()
}

// ─── ReportMaker Page ────────────────────────────────────────────────────────

export default function ReportMaker() {
  const { tasks, updateTask } = useTasks()
  const { addExportRecord } = useExportHistory()
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)
  const [template, setTemplate] = useState<'umum' | 'praktikum' | 'inovasi'>('umum')

  // Offline AI Worker hook
  const { modelStatus, loadingTasks, formalizeTask, error: aiError, downloadProgress } = useAI()

  // Get done tasks from this week
  const doneTasks = tasks.filter(
    (t) => t.status === 'done' && t.completedAt && isThisWeek(t.completedAt)
  )

  const weekRange = getCurrentWeekRange()

  // AI formalize handler
  const handleFormalize = (task: Task) => {
    formalizeTask(task.id, task.title, (formalText) => {
      updateTask(task.id, { formalTitle: formalText })
    })
  }

  // Export handler
  const handleExport = async (format: ExportFormat) => {
    if (doneTasks.length === 0) return
    setExportingFormat(format)

    try {
      let buffer: ArrayBuffer
      let mimeType: string
      let filename: string

      switch (format) {
        case 'pdf':
          buffer = await generatePDFBuffer(doneTasks, template)
          mimeType = 'application/pdf'
          filename = `chronos-report-${Date.now()}.pdf`
          break
        case 'xlsx':
          buffer = await generateExcelBuffer(doneTasks, template)
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          filename = `chronos-report-${Date.now()}.xlsx`
          break
        case 'docx':
          buffer = await generateWordBuffer(doneTasks, template)
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          filename = `chronos-report-${Date.now()}.docx`
          break
      }

      // Kirim array buffer ke Main process via preload script
      const savedPath = await window.chronosAPI.saveFile(filename, buffer, mimeType)
      
      if (!savedPath) {
        // Pengguna menekan tombol 'Cancel' pada dialog simpan berkas
        return
      }

      // Ambil nama file dari absolute path
      const displayFilename = savedPath.split(/[\\/]/).pop() || filename

      // Catat rekam riwayat ekspor
      addExportRecord({
        date: new Date().toISOString(),
        weekRange,
        format,
        filename: displayFilename,
        filePath: savedPath,
      })

      // Kirim notifikasi desktop keberhasilan
      window.chronosAPI.notifDesktop(
        `Laporan berhasil diekspor ke: ${displayFilename}`
      )
    } catch (err) {
      console.error('Export failed:', err)
      window.chronosAPI.notifDesktop('Gagal mengekspor laporan.')
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ── Header ── */}
      <div className="shrink-0 px-8 py-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Report Maker</h2>
          <p className="text-xs text-white/35 mt-0.5">Weekly Logbook — {weekRange}</p>
        </div>

        {/* AI Offline Status Pill */}
        {modelStatus === 'loading' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/20 text-purple-300 text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Memuat Model AI{downloadProgress > 0 ? ` (${downloadProgress}%)` : ''}...</span>
          </div>
        )}
        {modelStatus === 'ready' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI Offline Siap</span>
          </div>
        )}
        {modelStatus === 'error' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>AI Gagal</span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6">
        
        {/* Banner Error AI */}
        {aiError && (
          <div className="glass-card p-4 bg-red-500/10 border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>Gagal memuat model AI offline ({aiError}). Menggunakan opsi teks standar.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Summary Card */}
          <div className="glass-card p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                Completed Tasks This Week
              </p>
              <p className="text-3xl font-bold text-white mt-1">
                {doneTasks.length}
                <span className="text-sm font-normal text-white/30 ml-2">tasks</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(96,165,250,0.2))' }}>
              <span className="text-2xl">📊</span>
            </div>
          </div>

          {/* Template Selector Card */}
          <div className="glass-card p-5 flex flex-col justify-center">
            <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2 block">
              Format Templat Laporan
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="glass-input w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs text-white/80 focus:outline-none focus:border-blue-400/50"
            >
              <option value="umum">Laporan Umum (Daftar Tugas Standar)</option>
              <option value="praktikum">Tugas Praktikum (Format Akademik)</option>
              <option value="inovasi">Proposal Inovasi (Market TAM/SAM/SOM & SDG)</option>
            </select>
          </div>
        </div>

        {/* Task list for report */}
        {doneTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm text-white/50">No completed tasks this week</p>
            <p className="text-xs text-white/30 mt-1">
              Mark tasks as "Done" in the Task Manager to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-3">
              Tasks for Report
            </p>
            {doneTasks.map((task, index) => (
              <div key={task.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in"
                   style={{ animationDelay: `${index * 50}ms` }}>
                {/* Number */}
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-white/40">{index + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {loadingTasks[task.id] ? (
                    <div className="space-y-2 py-1">
                      <div className="animate-shimmer h-4 w-3/4 rounded" />
                      <div className="animate-shimmer h-3 w-1/2 rounded" />
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm ${task.formalTitle ? 'text-emerald-300/80' : 'text-white/75'}`}>
                        {task.formalTitle || task.title}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        {task.tags.map((tag) => {
                          const colors = TAG_COLORS[tag]
                          return (
                            <span key={tag} className={`pill ${colors.bg} ${colors.text}`}>
                              {tag}
                            </span>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Formalize button */}
                {!task.formalTitle && !loadingTasks[task.id] && (
                  <button
                    id={`formalize-${task.id}`}
                    onClick={() => handleFormalize(task)}
                    disabled={modelStatus !== 'ready'}
                    className={`glass-button px-3 py-1.5 text-xs flex items-center gap-1.5
                               disabled:opacity-40 disabled:cursor-not-allowed
                               hover:bg-purple-500/15 hover:border-purple-400/25 hover:text-purple-300`}
                    title={modelStatus !== 'ready' ? 'Menunggu model AI offline siap...' : 'Ubah deskripsi tugas ke bahasa formal'}
                  >
                    <span>✨</span>
                    <span>Formalize</span>
                  </button>
                )}
                {task.formalTitle && (
                  <span className="text-[10px] text-emerald-400/60 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Formalized
                  </span>
                )}
                {loadingTasks[task.id] && (
                  <span className="text-[10px] text-purple-300/60 animate-pulse shrink-0">AI Menulis...</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Export Section */}
        {doneTasks.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-4">
              Export Report
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* PDF */}
              <button
                id="export-pdf"
                onClick={() => handleExport('pdf')}
                disabled={exportingFormat !== null}
                className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer
                           hover:bg-red-500/8 hover:border-red-400/15 group disabled:opacity-40"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center
                              group-hover:bg-red-500/20 transition-colors">
                  <span className="text-lg">📄</span>
                </div>
                <span className="text-xs font-medium text-white/60 group-hover:text-red-300 transition-colors">
                  {exportingFormat === 'pdf' ? 'Exporting...' : 'Export to PDF'}
                </span>
              </button>

              {/* Excel */}
              <button
                id="export-xlsx"
                onClick={() => handleExport('xlsx')}
                disabled={exportingFormat !== null}
                className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer
                           hover:bg-green-500/8 hover:border-green-400/15 group disabled:opacity-40"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center
                              group-hover:bg-green-500/20 transition-colors">
                  <span className="text-lg">📊</span>
                </div>
                <span className="text-xs font-medium text-white/60 group-hover:text-green-300 transition-colors">
                  {exportingFormat === 'xlsx' ? 'Exporting...' : 'Export to Excel'}
                </span>
              </button>

              {/* Word */}
              <button
                id="export-docx"
                onClick={() => handleExport('docx')}
                disabled={exportingFormat !== null}
                className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer
                           hover:bg-blue-500/8 hover:border-blue-400/15 group disabled:opacity-40"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center
                              group-hover:bg-blue-500/20 transition-colors">
                  <span className="text-lg">📝</span>
                </div>
                <span className="text-xs font-medium text-white/60 group-hover:text-blue-300 transition-colors">
                  {exportingFormat === 'docx' ? 'Exporting...' : 'Export to Word'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
