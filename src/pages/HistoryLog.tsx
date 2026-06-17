import { useExportHistory } from '../store'

// ─── Format Icons ────────────────────────────────────────────────────────────

const FORMAT_ICON: Record<string, { icon: string; color: string }> = {
  pdf:  { icon: '📄', color: 'text-red-300' },
  xlsx: { icon: '📊', color: 'text-green-300' },
  docx: { icon: '📝', color: 'text-blue-300' },
}

// ─── HistoryLog Page ─────────────────────────────────────────────────────────

export default function HistoryLog() {
  const { exportHistory } = useExportHistory()

  const handleOpenFolder = (filePath?: string) => {
    if (filePath) {
      window.chronosAPI.openFileFolder(filePath)
    } else {
      window.chronosAPI.notifDesktop('Buka lokasi hanya tersedia untuk dokumen ekspor baru.')
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ── Header ── */}
      <div className="shrink-0 px-8 py-5 border-b border-white/5">
        <h2 className="text-xl font-semibold text-white tracking-tight">History Log</h2>
        <p className="text-xs text-white/35 mt-0.5">Previously exported reports</p>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        {exportHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <span className="text-5xl mb-4">📂</span>
            <p className="text-sm text-white/50">No exports yet</p>
            <p className="text-xs text-white/30 mt-1 max-w-xs">
              Head over to the Report Maker to generate and export your first weekly logbook report
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Week Range</th>
                  <th>Format</th>
                  <th>Filename</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((record, index) => {
                  const fmt = FORMAT_ICON[record.format] || FORMAT_ICON.pdf
                  return (
                    <tr key={record.id} className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td>{record.weekRange}</td>
                      <td>
                        <span className={`flex items-center gap-1.5 ${fmt.color}`}>
                          <span>{fmt.icon}</span>
                          <span className="uppercase text-[11px] font-semibold tracking-wider">
                            {record.format}
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-white/40 font-mono">
                          {record.filename}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          id={`open-folder-${record.id}`}
                          onClick={() => handleOpenFolder(record.filePath)}
                          className={`glass-button px-3 py-1 text-[11px] ${
                            !record.filePath ? 'opacity-40 hover:bg-transparent cursor-help' : ''
                          }`}
                          title={!record.filePath ? 'Lokasi berkas tidak tersedia untuk rekam ekspor lama' : undefined}
                        >
                          Buka Lokasi
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
