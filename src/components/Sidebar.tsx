import type { Page } from '../types'

// ─── Navigation Items ────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'tasks',   label: 'Task Manager',  icon: '📋' },
  { id: 'reports', label: 'Report Maker',  icon: '📊' },
  { id: 'history', label: 'History Log',   icon: '📜' },
]

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="glass-sidebar w-60 flex flex-col shrink-0 select-none">
      {/* ── Brand Header (draggable area) ── */}
      <div className="drag-region px-5 pt-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
               style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <span className="text-base font-bold text-white">C</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide"
                style={{ background: 'linear-gradient(135deg, #93c5fd, #c4b5fd)',
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent' }}>
              Chronos
            </h1>
            <p className="text-[10px] text-white/30 font-medium tracking-widest uppercase -mt-0.5">
              Productivity
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-white/25">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`
                no-drag w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200 text-left
                ${isActive
                  ? 'bg-white/10 text-white border-l-2 border-blue-400 shadow-sm'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/5 border-l-2 border-transparent'
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-glow" />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Bottom: Settings ── */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5">
        <button
          id="nav-settings"
          onClick={() => onNavigate('settings')}
          className={`
            no-drag w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-sm font-medium transition-all duration-200 text-left
            ${activePage === 'settings'
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }
          `}
        >
          <span className="text-base">⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}
