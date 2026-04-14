import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle2, XCircle, Zap, Music, TrendingUp } from 'lucide-react'

function AnimatedNumber({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="tabular-nums"
    >
      {typeof value === 'number' ? value.toLocaleString() : value}
    </motion.span>
  )
}

function Card({ icon: Icon, label, value, color, sub }) {
  return (
    <motion.div
      className="glass-card p-5 flex flex-col gap-1.5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Icon size={14} className={color} />
        {label}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        <AnimatedNumber value={value} />
      </div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </motion.div>
  )
}

export default function StatsCards({ stats }) {
  if (!stats) return null
  const delta = stats.play_count - (stats.play_count_start || 0)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <Card icon={Send} label="Sent" value={stats.sent} color="text-blue-500" sub={`/ ${stats.target}`} />
      <Card icon={CheckCircle2} label="Success" value={stats.success} color="text-emerald-500" />
      <Card icon={XCircle} label="Failed" value={stats.failed} color="text-red-500" />
      <Card icon={Zap} label="Rate" value={`${stats.rate}/min`} color="text-amber-500" />
      <Card icon={Music} label="Play Count" value={stats.play_count} color="text-purple-500"
        sub={delta > 0 ? `+${delta} this session` : 'Waiting for update...'} />
      <Card icon={TrendingUp} label="Elapsed" value={`${Math.floor((stats.elapsed || 0) / 60)}m ${Math.floor((stats.elapsed || 0) % 60)}s`} color="text-cyan-500" />
    </div>
  )
}
