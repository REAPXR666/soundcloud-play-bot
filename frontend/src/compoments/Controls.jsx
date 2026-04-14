import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Cpu, Hash } from 'lucide-react'

const API = 'http://127.0.0.1:8899'

export default function Controls({ track, proxies, useProxies, running, onStart }) {
  const [threads, setThreads] = useState(3)
  const [maxThreads, setMaxThreads] = useState(10)
  const [numPlays, setNumPlays] = useState(100)

  useEffect(() => {
    fetch(`${API}/api/system`).then(r => r.json()).then(data => {
      setThreads(data.recommended_threads)
      setMaxThreads(data.max_threads)
    }).catch(() => { })
  }, [])

  const start = async () => {
    if (!track) return
    if (useProxies && !proxies.length) return

    try {
      await fetch(`${API}/api/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track.id,
          num_plays: numPlays,
          concurrency: threads,
          proxies: useProxies ? proxies : [],
          use_proxies: useProxies
        })
      })
      onStart?.()
    } catch { }
  }

  const stop = async () => {
    try { await fetch(`${API}/api/stop`, { method: 'POST' }) } catch { }
  }

  const canStart = track && (!useProxies || proxies.length > 0) && !running

  return (
    <div className="space-y-10 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2 italic">
            <Hash size={14} className="text-orange-500" /> ENGAGEMENT QUOTA
          </label>
          <input type="number" className="input-field" value={numPlays} min={1} max={10000}
            onChange={e => setNumPlays(parseInt(e.target.value) || 1)} />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] flex items-center justify-between mb-2 italic">
            <span className="flex items-center gap-2"><Cpu size={14} className="text-rose-500" /> CLUSTER CONCURRENCY</span>
            <span className="font-black text-rose-500">{threads} CORES</span>
          </label>
          <div className="relative pt-1">
            <input type="range" className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500" min={1} max={maxThreads}
              value={threads} onChange={e => setThreads(parseInt(e.target.value))} />
            <div className="flex justify-between text-[9px] font-black text-slate-500 mt-2 tracking-widest">
              <span>MIN_INIT</span><span>MAX_CAPA_{maxThreads}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <motion.button
          onClick={start} disabled={!canStart}
          className={`btn-primary flex-1 py-5 text-lg tracking-tighter ${!canStart ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
          whileTap={canStart ? { scale: 0.98 } : {}}
        >
          <Play size={20} fill="currentColor" /> INITIATE DEPLOYMENT
        </motion.button>
        <motion.button
          onClick={stop} disabled={!running}
          className={`btn-secondary px-10 py-5 ${!running ? 'opacity-30 cursor-not-allowed' : 'hover:border-rose-500/50 hover:text-rose-500'}`}
          whileTap={running ? { scale: 0.98 } : {}}
        >
          <Square size={20} fill={running ? "currentColor" : "none"} /> EMER_STOP
        </motion.button>
      </div>

      <div className="flex gap-3">
        {!track && <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic opacity-70">Awaiting target selection...</p>}
        {track && useProxies && !proxies.length && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic opacity-70">Identity pool required for deployment</p>}
      </div>
    </div>
  )
}
