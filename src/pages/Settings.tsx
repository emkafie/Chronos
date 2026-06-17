// ─── Settings Page ───────────────────────────────────────────────────────────

export default function Settings() {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ── Header ── */}
      <div className="shrink-0 px-8 py-5 border-b border-white/5">
        <h2 className="text-xl font-semibold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-white/35 mt-0.5">Configure your Chronos experience</p>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-5">
        {/* About */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Chronos</h3>
              <p className="text-xs text-white/40 mt-0.5">Version 1.0.0</p>
              <p className="text-xs text-white/30 mt-0.5">
                Personal Productivity & Logbook Manager
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <span>🎨</span> Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Theme</p>
                <p className="text-[11px] text-white/30 mt-0.5">Glassmorphism Dark (Default)</p>
              </div>
              <div className="glass-button px-3 py-1.5 text-xs cursor-default opacity-50">
                Coming Soon
              </div>
            </div>
            <div className="border-t border-white/5" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Window Transparency</p>
                <p className="text-[11px] text-white/30 mt-0.5">Native acrylic/vibrancy blur</p>
              </div>
              <div className="w-9 h-5 rounded-full bg-blue-500/30 flex items-center justify-end px-0.5">
                <div className="w-4 h-4 rounded-full bg-blue-400 shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Export Preferences */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <span>📤</span> Export Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Default Export Format</p>
                <p className="text-[11px] text-white/30 mt-0.5">Used when quick-exporting</p>
              </div>
              <select className="glass-input px-3 py-1.5 text-xs bg-white/5 cursor-pointer"
                      defaultValue="pdf">
                <option value="pdf" className="bg-slate-800">PDF</option>
                <option value="xlsx" className="bg-slate-800">Excel</option>
                <option value="docx" className="bg-slate-800">Word</option>
              </select>
            </div>
            <div className="border-t border-white/5" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Auto-formalize on export</p>
                <p className="text-[11px] text-white/30 mt-0.5">
                  Automatically run AI formalization before exporting
                </p>
              </div>
              <div className="w-9 h-5 rounded-full bg-white/10 flex items-center justify-start px-0.5 cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </h3>
          <div className="space-y-2.5">
            {[
              { keys: ['Ctrl', 'N'], action: 'New Task' },
              { keys: ['Ctrl', 'E'], action: 'Export Report' },
              { keys: ['Ctrl', '1'], action: 'Task Manager' },
              { keys: ['Ctrl', '2'], action: 'Report Maker' },
              { keys: ['Ctrl', '3'], action: 'History Log' },
            ].map(({ keys, action }) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-xs text-white/50">{action}</span>
                <div className="flex gap-1">
                  {keys.map((key) => (
                    <kbd key={key}
                         className="px-2 py-0.5 rounded bg-white/5 border border-white/10
                                    text-[10px] text-white/40 font-mono">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-white/20">
            Built with Electron + React + Tailwind CSS
          </p>
          <p className="text-[10px] text-white/15 mt-1">
            © 2026 Chronos App
          </p>
        </div>
      </div>
    </div>
  )
}
