import { useState } from 'react'
import { AppProvider } from './store'
import type { Page } from './types'
import Titlebar from './components/Titlebar'
import Sidebar from './components/Sidebar'
import TaskManager from './pages/TaskManager'
import ReportMaker from './pages/ReportMaker'
import HistoryLog from './pages/HistoryLog'
import Settings from './pages/Settings'
import './App.css'

// ─── Page Router ─────────────────────────────────────────────────────────────

function PageContent({ page }: { page: Page }) {
  switch (page) {
    case 'tasks':   return <TaskManager />
    case 'reports': return <ReportMaker />
    case 'history': return <HistoryLog />
    case 'settings': return <Settings />
    default:        return <TaskManager />
  }
}

// ─── App Shell ───────────────────────────────────────────────────────────────

function App() {
  const [activePage, setActivePage] = useState<Page>('tasks')

  return (
    <AppProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden rounded-xl"
           style={{ background: 'rgba(8, 12, 28, 0.17)' }}>
        {/* ── Custom Titlebar ── */}
        <Titlebar />

        {/* ── Main Layout ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar activePage={activePage} onNavigate={setActivePage} />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <PageContent page={activePage} />
          </main>
        </div>
      </div>
    </AppProvider>
  )
}

export default App
