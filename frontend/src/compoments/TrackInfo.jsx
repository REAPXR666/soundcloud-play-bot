import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Music, User, Clock, Play, Loader2, AlertCircle } from 'lucide-react'

const API = 'http://127.0.0.1:8899'

export default function TrackInfo({ track, setTrack }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookup = async () => {
    if (!input.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/track`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_input: input.trim() })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setTrack(null) }
      else setTrack(data)
    } catch (e) { setError('Backend not running') }
    setLoading(false)
  }

  const fmtDuration = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-4">
        <input
          className="input-field shadow-xl shadow-black/5"
          placeholder="Enter SoundCloud Track URL or ID..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookup()}
        />
        <motion.button
          onClick={lookup}
          className="btn-primary px-8 whitespace-nowrap"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'ANALYZE TARGET'}
        </motion.button>
      </div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-sm font-bold flex items-center gap-2 px-2">
          <AlertCircle size={14} /> {error}
        </motion.p>
      )}
      {track && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-8 items-center p-6 glass-card border-white/20 shadow-2xl"
        >
          <div className="relative group overflow-hidden rounded-2xl flex-shrink-0">
            {track.artwork_url ? (
              <img src={track.artwork_url} alt="" className="w-28 h-28 object-cover shadow-2xl transform transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                <Music size={40} className="text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <h4 className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight">{track.title}</h4>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
              <User size={14} className="text-orange-500" /> {track.artist}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 italic">
                <Clock size={12} /> {fmtDuration(track.duration_ms)}
              </span>
              <span className="flex items-center gap-2 text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/10 italic">
                <Play size={12} /> {track.playback_count?.toLocaleString()} PLAYS
              </span>
              {track.genre && (
                <span className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/10">
                  {track.genre}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
