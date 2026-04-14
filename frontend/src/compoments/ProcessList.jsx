import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Play, AlertTriangle, Activity, Globe, Music } from 'lucide-react'

const statusConfig = {
  starting: { icon: Loader2, color: 'text-gray-400', bg: 'bg-gray-400/10', spin: true },
  launching: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', spin: true },
  verifying_ip: { icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-400/10', spin: true },
  loading: { icon: Loader2, color: 'text-cyan-400', bg: 'bg-cyan-400/10', spin: true },
  playing: { icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-400/10', spin: false },
  verified: { icon: CheckCircle2, color: 'text-sc-orange', bg: 'bg-sc-orange/10', spin: false },
  done: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', spin: false },
  done_unverified: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', spin: false },
  blocked: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', spin: false },
  ip_fail: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', spin: false },
  no_audio: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', spin: false },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', spin: false },
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.error
  const Icon = cfg.icon
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${cfg.bg}`}>
      <Icon size={12} className={`${cfg.color} ${cfg.spin ? 'animate-spin' : ''}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{status}</span>
    </div>
  )
}

export default function ProcessList({ stats }) {
  const processes = stats?.processes || []
  const sorted = [...processes].sort((a, b) => {
    const active = ['starting', 'launching', 'loading', 'playing']
    const aActive = active.includes(a.status) ? 0 : 1
    const bActive = active.includes(b.status) ? 0 : 1
    return aActive - bActive || b.id - a.id
  }).slice(0, 25)

  const activeCount = processes.filter(p => ['starting', 'launching', 'loading', 'playing'].includes(p.status)).length;

  return (
    <div className="glass-panel p-6 flex flex-col gap-4 max-h-[400px] overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
          <Activity size={16} className="text-orange-500" /> Processes
        </div>
        <div className="flex gap-3 text-[10px] font-bold text-slate-400">
          <span>{activeCount} active</span>
          <span>{processes.length} total</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5">
        <AnimatePresence>
          {sorted.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-400 text-center py-12 italic">
              No processes yet — start a run above
            </motion.div>
          ) : (
            sorted.map((p, idx) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center justify-between py-2.5 px-4 rounded-xl glass-card hover:bg-white/10 dark:hover:bg-slate-800/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-mono text-[11px] font-bold text-slate-500">
                    {p.id}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono text-[11px]">{p.proxy}</span>
                  {p.elapsed > 0 && <span className="text-slate-400">{p.elapsed}s</span>}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
