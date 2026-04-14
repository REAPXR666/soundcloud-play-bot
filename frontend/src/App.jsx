import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useWebSocket } from './hooks/useWebSocket'
import Sidebar from './components/Sidebar'
import Dashboard from './views/Dashboard'
import Config from './views/Config'
import Credits from './views/Credits'
import Logs from './views/Logs'
import MixcloudView from './views/Mixcloud'
import SCAccountsView from './views/SCAccounts'

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [track, setTrack] = useState(null)
  const [proxies, setProxies] = useState([])
  const [useProxies, setUseProxies] = useState(true)

  const { stats, mxStats, scAccountsStats, connected, logs, sendCommand } = useWebSocket()
  const running = stats?.running || false

  // Theme is managed by ThemeContext (adds/removes 'dark' on <html>)

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-[#0c0f1a]">
      <div className="mesh-bg hidden dark:block" />
      <Sidebar activeView={activeView} setActiveView={setActiveView} connected={connected} />
      <main className="flex-1 overflow-y-auto relative h-screen">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10 w-full relative z-10">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <Dashboard key="dashboard" stats={stats} running={running}
                track={track} setTrack={setTrack}
                proxies={proxies} useProxies={useProxies} />
            )}
            {activeView === 'config' && (
              <Config key="config"
                proxies={proxies} setProxies={setProxies}
                useProxies={useProxies} setUseProxies={setUseProxies} />
            )}
            {activeView === 'logs' && <Logs key="logs" logs={logs} />}
            {activeView === 'credits' && <Credits key="credits" />}
            {activeView === 'sc_accounts' && <SCAccountsView key="sc_accounts" scStats={scAccountsStats} />}
            {activeView === 'mixcloud' && <MixcloudView key="mixcloud" mxStats={mxStats} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
