import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Square, Cpu, Hash, Send, CheckCircle2, XCircle, Zap, TrendingUp, Monitor, Loader2, Youtube } from 'lucide-react'

const API = 'http://127.0.0.1:8899'

function AnimatedNumber({ value }) {
  return (
    <motion.span key={value} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="tabular-nums">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </motion.span>
  )
}

export default function YouTubeView({ ytStats, proxies, useProxies }) {
  const [url, setUrl] = useState('')
  const [video, setVideo] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [numViews, setNumViews] = useState(50)
  const [threads, setThreads] = useState(2)
  const [maxThreads, setMaxThreads] = useState(5)

  const running = ytStats?.running || false
  const stats = ytStats || {}

  useEffect(() => {
    fetch(`${API}/api/system`).then(r => r.json()).then(d => {
      setThreads(Math.min(d.recommended_threads, 3))
      setMaxThreads(Math.min(d.max_threads, 5))
    }).catch(() => {})
  }, [])

  const lookup = async () => {
    if (!url.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/yt/track`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: url.trim() })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setVideo(null) }
      else setVideo(data)
    } catch { setError('Backend not running') }
    setLoading(false)
  }

  const start = async () => {
    if (!video) return
    try {
      await fetch(`${API}/api/yt/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: video.url, num_views: numViews, concurrency: threads,
          proxies: useProxies ? proxies : [], use_proxies: useProxies
        })
      })
    } catch {}
  }

  const stop = async () => {
    try { await fetch(`${API}/api/yt/stop`, { method: 'POST' }) } catch {}
  }

  const canStart = video && (!useProxies || proxies.length > 0) && !running
  const sent = stats.sent || 0
  const target = stats.target || 0
  const progressPercent = target > 0 ? Math.round((sent / target) * 100) : 0
  const successRate = sent > 0 ? Math.round(((stats.success || 0) / sent) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-20">
      <div>
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
          <Youtube size={36} className="text-red-500" /> YouTube
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Video view generation engine</p>
        <p className="text-xs text-amber-500 mt-2 font-bold">⚠ YouTube has aggressive bot detection. ~30-60% of views may be filtered. Views take up to 24h to appear.</p>
      </div>

      {/* Video Lookup */}
      <div className="glass-panel p-8 space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Video Lookup</h3>
        <div className="flex gap-2">
          <input className="input-field" placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
            value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookup()} />
          <motion.button onClick={lookup} className="btn-primary whitespace-nowrap" whileTap={{ scale: 0.95 }} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Lookup
          </motion.button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {video && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 items-center">
            {video.thumbnail && <img src={video.thumbnail} alt="" className="w-32 h-20 rounded-xl object-cover shadow-lg" />}
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{video.title}</p>
              <p className="text-sm text-slate-500">{video.author}</p>
              <p className="text-xs text-slate-400 mt-1">ID: {video.video_id}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="glass-panel p-8 space-y-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
              <Hash size={12} /> Number of views
            </label>
            <input type="number" className="input-field" value={numViews} min={1} max={5000}
              onChange={e => setNumViews(parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-1"><Cpu size={12} /> Concurrency</span>
              <span className="text-red-500">{threads}</span>
            </label>
            <input type="range" className="w-full accent-red-500" min={1} max={maxThreads}
              value={threads} onChange={e => setThreads(parseInt(e.target.value))} />
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button onClick={start} disabled={!canStart}
            className={`btn-primary flex-1 bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20 ${!canStart ? 'opacity-30 cursor-not-allowed' : ''}`}
            whileTap={canStart ? { scale: 0.95 } : {}}>
            <Play size={16} /> Start Views
          </motion.button>
          <motion.button onClick={stop} disabled={!running}
            className={`btn-secondary ${!running ? 'opacity-30' : ''}`} whileTap={running ? { scale: 0.95 } : {}}>
            <Square size={16} /> Stop
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      {target > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-card p-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Send size={12} className="text-blue-500" /> Sent</div>
              <div className="text-2xl font-black text-blue-500"><AnimatedNumber value={sent} /></div>
              <div className="text-xs text-slate-400">/ {target}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Success</div>
              <div className="text-2xl font-black text-emerald-500"><AnimatedNumber value={stats.success || 0} /></div>
            </div>
            <div className="glass-card p-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><XCircle size={12} className="text-red-500" /> Failed</div>
              <div className="text-2xl font-black text-red-500"><AnimatedNumber value={stats.failed || 0} /></div>
            </div>
            <div className="glass-card p-5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Zap size={12} className="text-amber-500" /> Rate</div>
              <div className="text-2xl font-black text-amber-500">{stats.rate || 0}/min</div>
            </div>
          </div>

          {/* Progress */}
          <div className="glass-panel p-6">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Progress</span>
              <span>{sent}/{target} ({progressPercent}%) — {successRate}% success rate</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          {/* Processes */}
          <div className="glass-panel p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Monitor size={14} /> Processes
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(stats.processes || []).slice(-15).reverse().map(p => (
                <div key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                  p.status === 'watching' ? 'bg-emerald-500/10 text-emerald-500' :
                  p.status === 'done' ? 'bg-emerald-500/5 text-emerald-400' :
                  p.status === 'error' || p.status === 'no_playback' ? 'bg-red-500/10 text-red-500' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  <span className="font-mono">#{p.id}</span>
                  <span className="text-slate-400">{p.proxy}</span>
                  <span className="ml-auto font-bold">{p.status}</span>
                  {p.elapsed > 0 && <span className="text-slate-400">{p.elapsed}s</span>}
                </div>
              ))}
              {(!stats.processes || stats.processes.length === 0) && (
                <p className="text-slate-400 text-center py-4 text-xs">No processes yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
