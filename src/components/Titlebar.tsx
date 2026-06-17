// ─── Custom Frameless Titlebar ───────────────────────────────────────────────

export default function Titlebar() {
  const handleMinimize = () => window.chronosAPI.minimizeWindow()
  const handleMaximize = () => window.chronosAPI.maximizeWindow()
  const handleClose = () => window.chronosAPI.closeWindow()

  return (
    <div className="drag-region h-10 flex items-center justify-between px-4 select-none shrink-0"
         style={{ background: 'rgba(2, 6, 23, 0.50)' }}>
      {/* Left: App title in drag area */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}>
          <span className="text-[8px] font-bold text-white">C</span>
        </div>
        <span className="text-[11px] font-medium tracking-wider text-white/40 uppercase">
          Chronos
        </span>
      </div>

      {/* Right: Window controls */}
      <div className="no-drag flex items-center gap-1.5">
        {/* Minimize */}
        <button
          id="titlebar-minimize"
          onClick={handleMinimize}
          className="group w-3 h-3 rounded-full bg-white/10 hover:bg-amber-400/80
                     transition-all duration-200 flex items-center justify-center"
          title="Minimize"
        >
          <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="5.5" width="8" height="1" rx="0.5" fill="#000" fillOpacity="0.6" />
          </svg>
        </button>

        {/* Maximize */}
        <button
          id="titlebar-maximize"
          onClick={handleMaximize}
          className="group w-3 h-3 rounded-full bg-white/10 hover:bg-green-400/80
                     transition-all duration-200 flex items-center justify-center"
          title="Maximize"
        >
          <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 12 12" fill="none">
            <rect x="2.5" y="2.5" width="7" height="7" rx="1" stroke="#000" strokeOpacity="0.6" strokeWidth="1" fill="none" />
          </svg>
        </button>

        {/* Close */}
        <button
          id="titlebar-close"
          onClick={handleClose}
          className="group w-3 h-3 rounded-full bg-white/10 hover:bg-red-400/80
                     transition-all duration-200 flex items-center justify-center"
          title="Close"
        >
          <svg className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 12 12" fill="none">
            <path d="M3 3L9 9M9 3L3 9" stroke="#000" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
