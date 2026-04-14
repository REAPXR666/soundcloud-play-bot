import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Search, Music, User, Clock, Loader2, Cpu, Hash, AlertCircle } from 'lucide-react';
import StatsCards from '../components/StatsCards';
import ProcessList from '../components/ProcessList';

const API = 'http://127.0.0.1:8899';

export default function Dashboard({ stats, running, track, setTrack, proxies, useProxies }) {
  const [input, setInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [numPlays, setNumPlays] = useState(100);
  const [threads, setThreads] = useState(2);
  const [maxThreads, setMaxThreads] = useState(5);

  const target = stats?.target || 0;
  const sent = stats?.sent || 0;
  const success = stats?.success || 0;
  const progressPercent = target > 0 ? Math.round((sent / target) * 100) : 0;

  useEffect(() => {
    fetch(`${API}/api/system`).then(r => r.json()).then(d => {
      setThreads(d.recommended_threads);
      setMaxThreads(d.max_threads);
    }).catch(() => {});
  }, []);

  const lookup = async () => {
    if (!input.trim()) return;
    setLookupLoading(true); setLookupError('');
    try {
      const res = await fetch(`${API}/api/track`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_input: input.trim() })
      });
      const data = await res.json();
      if (data.error) { setLookupError(data.error); setTrack(null); }
      else setTrack(data);
    } catch { setLookupError('Cannot connect to backend'); }
    setLookupLoading(false);
  };

  const start = async () => {
    if (!track || running) return;
    try {
      await fetch(`${API}/api/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track.id, num_plays: numPlays, concurrency: threads,
          proxies: useProxies ? proxies : [], use_proxies: useProxies
        })
      });
    } catch {}
  };

  const stop = async () => {
    try { await fetch(`${API}/api/stop`, { method: 'POST' }); } catch {}
  };

  const fmtDuration = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const canStart = track && (!useProxies || proxies.length > 0) && !running;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-20">

      {/* ── Header ── */}
      <div>
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          {running ? 'Engine is running — plays are being delivered' : 'Configure your target and launch'}
        </p>
      </div>

      {/* ── Track Lookup + Track Card ── */}
      <div className="glass-panel p-8 relative overflow-hidden">
        {/* Decorative blur */}
        {track?.artwork_url && (
          <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
            style={{ backgroundImage: `url(${track.artwork_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px)' }} />
        )}
        <div className="relative z-10 space-y-6">
          <div className="flex gap-3">
            <input className="input-field" placeholder="Paste SoundCloud URL or Track ID..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()} />
            <motion.button onClick={lookup} className="btn-primary px-8 whitespace-nowrap" whileTap={{ scale: 0.95 }} disabled={lookupLoading}>
              {lookupLoading ? <Loader2 className="animate-spin" size={18} /> : <><Search size={16} /> Find Track</>}
            </motion.button>
          </div>
          {lookupError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={14} /> {lookupError}
            </motion.p>
          )}
          <AnimatePresence>
            {track && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex gap-6 items-center">
                <div className="relative group overflow-hidden rounded-2xl flex-shrink-0 shadow-2xl shadow-black/20">
                  {track.artwork_url ? (
                    <img src={track.artwork_url} alt="" className="w-24 h-24 object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center"><Music size={36} className="text-white" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white truncate">{track.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <User size={13} className="text-orange-500" /> {track.artist}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                      <Clock size={11} /> {fmtDuration(track.duration_ms)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">
                      <Play size={11} /> {track.playback_count?.toLocaleString()} plays
                    </span>
                    {track.genre && (
                      <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg">{track.genre}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Command Center: Settings + Start/Stop ── */}
      <div className="glass-panel p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
              <Hash size={13} className="text-orange-500" /> Number of plays
            </label>
            <input type="number" className="input-field text-lg font-bold" value={numPlays} min={1} max={10000}
              onChange={e => setNumPlays(parseInt(e.target.value) || 1)} disabled={running} />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-2"><Cpu size={13} className="text-rose-500" /> Concurrency</span>
              <span className="text-orange-500 font-black text-sm">{threads}</span>
            </label>
            <input type="range" className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500"
              min={1} max={maxThreads} value={threads} onChange={e => setThreads(parseInt(e.target.value))} disabled={running} />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>1</span><span>{maxThreads}</span></div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button onClick={start} disabled={!canStart}
            className={`btn-primary flex-1 py-4 text-base font-black tracking-tight ${!canStart ? 'opacity-30 cursor-not-allowed' : ''}`}
            whileTap={canStart ? { scale: 0.97 } : {}}>
            <Play size={18} fill="currentColor" /> {running ? 'Running...' : 'Start Plays'}
          </motion.button>
          <motion.button onClick={stop} disabled={!running}
            className={`btn-secondary px-8 py-4 font-black ${!running ? 'opacity-30 cursor-not-allowed' : 'hover:border-rose-500/50 hover:text-rose-500'}`}
            whileTap={running ? { scale: 0.97 } : {}}>
            <Square size={18} /> Stop
          </motion.button>
        </div>

        {/* Inline warnings */}
        {!track && !running && <p className="text-xs text-orange-500 font-semibold">Search for a track above to get started</p>}
        {track && useProxies && !proxies.length && !running && (
          <p className="text-xs text-rose-500 font-semibold">Load proxies in the Proxies tab first</p>
        )}
      </div>

      {/* ── Progress Ring + Stats ── */}
      {(running || target > 0) && (
        <>
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
            <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
              {/* Progress ring */}
              <div className="w-40 h-40 relative flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-white/5" />
                  <motion.circle cx="80" cy="80" r="70" stroke="url(#prog-grad)" strokeWidth="12" fill="transparent"
                    strokeDasharray="439.82" animate={{ strokeDashoffset: 439.82 - (439.82 * progressPercent) / 100 }}
                    strokeLinecap="round" transition={{ duration: 0.8, ease: 'easeOut' }} />
                  <defs><linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#e11d48" />
                  </linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{progressPercent}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">complete</span>
                </div>
              </div>
              {/* Summary text */}
              <div className="flex-1 text-center lg:text-left space-y-3">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {running ? 'Engine Active' : sent >= target && target > 0 ? 'Run Complete' : 'Ready'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Delivered <span className="text-orange-500 font-bold">{sent.toLocaleString()}</span> of <span className="font-bold">{target.toLocaleString()}</span> plays
                  {success > 0 && <> — <span className="text-emerald-500 font-bold">{success}</span> verified</>}
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${running
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/10'}`}>
                    {running ? '● RUNNING' : '○ IDLE'}
                  </div>
                  {stats?.rate > 0 && (
                    <div className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {stats.rate}/min
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 italic">Play count updates may be delayed up to 24h by SoundCloud</p>
              </div>
            </div>
          </div>

          <StatsCards stats={stats} />
          <ProcessList stats={stats} />
        </>
      )}
    </motion.div>
  );
}
