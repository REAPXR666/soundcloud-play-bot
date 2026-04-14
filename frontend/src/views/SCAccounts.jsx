import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Zap, Square, Key, Globe, Mail,
  CheckCircle2, XCircle, Send, Hash, Cpu,
  AlertCircle, Loader2, Music2, Shield
} from 'lucide-react'

const API = 'http://127.0.0.1:8899'
const SC = `${API}/api/sc_accounts`

// ── Style helpers (orange accent) ────────────────────────────────────────────
const oBtn =
  'px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed'

const oBtnSm =
  'px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-sm shadow-orange-500/15 active:scale-[0.97] transition-all duration-200 flex items-center gap-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed'

const stopBtn =
  'px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300 dark:hover:border-red-500/30 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed'

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-400 transition-all duration-200 text-sm'

// ── Mini stat card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'orange' }) {
  const colors = {
    orange: 'text-orange-500 bg-orange-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
  }
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-lg font-black ${colors[color].split(' ')[0]}`}>{value ?? '—'}</p>
      </div>
    </div>
  )
}

function ProgressBar({ sent, target }) {
  const pct = target > 0 ? Math.round((sent / target) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
        <span>{sent} / {target || '∞'}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"
          animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  )
}

function RunningBadge({ operation }) {
  const labels = {
    generate: 'Generating Accounts',
    follow: 'Sending Follows',
    mass_follow: 'Mass Following',
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400">
      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_6px_#f97316]" />
      {labels[operation] || 'Running'}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIG TAB
// ══════════════════════════════════════════════════════════════════════════════
function ConfigTab({ scStats }) {
  const [smtpKey, setSmtpKey] = useState('')
  const [smtpDomain, setSmtpDomain] = useState('')
  const [captchaKey, setCaptchaKey] = useState('')
  const [proxy, setProxy] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${SC}/config`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_dev_key: smtpKey.trim() || undefined,
          smtp_domain: smtpDomain.trim() || undefined,
          captcha_key: captchaKey.trim() || undefined,
          proxy: proxy.trim(),
        })
      })
      const data = await res.json()
      if (data.error) setMsg(`⚠ ${data.error}`)
      else setMsg('✓ Configuration saved!')
    } catch { setMsg('⚠ Backend not running') }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Accounts" value={scStats?.accounts ?? 0} color="orange" />
        <StatCard icon={Mail} label="smtp.dev" value={scStats?.config?.smtp_dev_key ? '✓ Set' : '✗ Missing'} color={scStats?.config?.smtp_dev_key ? 'emerald' : 'rose'} />
        <StatCard icon={Key} label="2Captcha" value={scStats?.config?.captcha_key ? '✓ Set' : '✗ Missing'} color={scStats?.config?.captcha_key ? 'emerald' : 'rose'} />
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-orange-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Configuration</h3>
        </div>
        <p className="text-xs text-slate-400">All settings are saved automatically and persist between restarts.</p>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Mail size={11} className="text-orange-400" /> smtp.dev API Key
          </label>
          <input className={inputCls} placeholder="smtplabs_your_api_key_here" type="password"
            value={smtpKey} onChange={e => setSmtpKey(e.target.value)} />
          <p className="text-[10px] text-slate-400 mt-1">Get from <a href="https://smtp.dev" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">smtp.dev</a> — used for creating email addresses and receiving verification emails.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Globe size={11} className="text-orange-400" /> smtp.dev Domain
          </label>
          <input className={inputCls} placeholder="e.g. yourdomain.com (from smtp.dev dashboard)"
            value={smtpDomain} onChange={e => setSmtpDomain(e.target.value)} />
          <p className="text-[10px] text-slate-400 mt-1">The domain you registered on smtp.dev. Emails will be created as random@yourdomain.com</p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Key size={11} className="text-orange-400" /> 2Captcha API Key
          </label>
          <input className={inputCls} placeholder="Your 2captcha API key..." type="password"
            value={captchaKey} onChange={e => setCaptchaKey(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Globe size={11} className="text-orange-400" /> Proxy (optional)
          </label>
          <input className={inputCls} placeholder="user:pass@host:port"
            value={proxy} onChange={e => setProxy(e.target.value)} />
        </div>

        <button className={`${oBtn} w-full`} onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          Save Configuration
        </button>
        {msg && <p className={`text-xs font-semibold ${msg.startsWith('✓') ? 'text-emerald-500' : 'text-amber-500'}`}>{msg}</p>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE TAB
// ══════════════════════════════════════════════════════════════════════════════
function GenerateTab({ scStats }) {
  const [count, setCount] = useState(5)
  const [threads, setThreads] = useState(2)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = scStats?.running && scStats?.operation === 'generate'

  const start = async () => {
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${SC}/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, threads })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${SC}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Generate Accounts</h3>
        <p className="text-sm text-slate-400 mt-0.5">Create SoundCloud accounts with real email verification via smtp.dev + 2Captcha solving.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Hash size={11} className="text-orange-400" /> Accounts to create
            </label>
            <input type="number" className={inputCls} value={count} min={1} max={50}
              onChange={e => setCount(parseInt(e.target.value) || 1)} disabled={running} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5"><Cpu size={11} className="text-orange-400" /> Threads</span>
              <span className="text-orange-500 font-black">{threads}</span>
            </label>
            <input type="range" className="w-full accent-orange-600" min={1} max={3}
              value={threads} onChange={e => setThreads(parseInt(e.target.value))} disabled={running} />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>1</span><span>3 (max — each thread = 1 Chrome)</span></div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
          ⚡ Each account takes ~45-90s (browser-based signup with captcha solving + email verification)
        </div>

        <div className="flex gap-3 pt-1">
          <button className={`${oBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Users size={15} />}
            {running ? 'Generating...' : 'Start Generating'}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {(running || (scStats?.operation === 'generate' && scStats?.sent > 0)) && (
        <div className="glass-panel p-5 space-y-3">
          {running && <RunningBadge operation="generate" />}
          <ProgressBar sent={scStats?.sent || 0} target={scStats?.target || count} />
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Send} label="Attempted" value={scStats?.sent ?? 0} color="blue" />
            <StatCard icon={CheckCircle2} label="Created" value={scStats?.success ?? 0} color="emerald" />
            <StatCard icon={XCircle} label="Failed" value={scStats?.failed ?? 0} color="rose" />
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FOLLOW TAB
// ══════════════════════════════════════════════════════════════════════════════
function FollowTab({ scStats }) {
  const [target, setTarget] = useState('')
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = scStats?.running && scStats?.operation === 'follow'

  const start = async () => {
    if (!target.trim()) { setErr('Enter a username or URL'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${SC}/follow`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim(), count })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${SC}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Follow a User</h3>
        <p className="text-sm text-slate-400 mt-0.5">Send follows from your created SC accounts. Tries API first, falls back to browser.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <UserPlus size={11} className="text-orange-400" /> Target Username or URL
          </label>
          <input className={inputCls} placeholder="username or https://soundcloud.com/username" value={target}
            onChange={e => setTarget(e.target.value)} disabled={running} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Hash size={11} className="text-orange-400" /> Number of follows
          </label>
          <input type="number" className={inputCls} value={count} min={1} max={1000}
            onChange={e => setCount(parseInt(e.target.value) || 1)} disabled={running} />
        </div>

        <div className="flex gap-3 pt-1">
          <button className={`${oBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {running ? 'Following...' : 'Start Following'}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {(running || (scStats?.operation === 'follow' && scStats?.sent > 0)) && (
        <div className="glass-panel p-5 space-y-3">
          {running && <RunningBadge operation="follow" />}
          <ProgressBar sent={scStats?.sent || 0} target={scStats?.target || count} />
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Send} label="Attempted" value={scStats?.sent ?? 0} color="blue" />
            <StatCard icon={CheckCircle2} label="Sent" value={scStats?.success ?? 0} color="emerald" />
            <StatCard icon={XCircle} label="Failed" value={scStats?.failed ?? 0} color="rose" />
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MASS FOLLOW TAB
// ══════════════════════════════════════════════════════════════════════════════
function MassFollowTab({ scStats }) {
  const [target, setTarget] = useState('')
  const [threads, setThreads] = useState(2)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = scStats?.running && scStats?.operation === 'mass_follow'

  const start = async () => {
    if (!target.trim()) { setErr('Enter a username'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${SC}/mass_follow`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim(), threads })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${SC}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Mass Follow</h3>
        <p className="text-sm text-slate-400 mt-0.5">Continuous follow loop — runs until stopped. Uses API + browser fallback.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <UserPlus size={11} className="text-orange-400" /> Target Username
          </label>
          <input className={inputCls} placeholder="soundcloud_username" value={target}
            onChange={e => setTarget(e.target.value)} disabled={running} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5"><Cpu size={11} className="text-orange-400" /> Threads</span>
            <span className="text-orange-500 font-black">{threads}</span>
          </label>
          <input type="range" className="w-full accent-orange-600" min={1} max={3}
            value={threads} onChange={e => setThreads(parseInt(e.target.value))} disabled={running} />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>1</span><span>3</span></div>
        </div>

        <div className="flex gap-3 pt-1">
          <button className={`${oBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            {running ? 'Mass Following...' : 'Start Mass Follow'}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {running && (
        <div className="glass-panel p-5 space-y-3">
          <RunningBadge operation="mass_follow" />
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={CheckCircle2} label="Follows Sent" value={scStats?.success ?? 0} color="emerald" />
            <StatCard icon={Send} label="Total Attempts" value={scStats?.sent ?? 0} color="blue" />
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN VIEW
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'config',      label: 'Config',      icon: Shield },
  { id: 'generate',    label: 'Generate',     icon: Users },
  { id: 'follow',      label: 'Follow',       icon: UserPlus },
  { id: 'mass_follow', label: 'Mass Follow',  icon: Zap },
]

export default function SCAccountsView({ scStats }) {
  const [tab, setTab] = useState('config')
  const running = scStats?.running || false

  const renderTab = () => {
    switch (tab) {
      case 'config':      return <ConfigTab scStats={scStats} />
      case 'generate':    return <GenerateTab scStats={scStats} />
      case 'follow':      return <FollowTab scStats={scStats} />
      case 'mass_follow': return <MassFollowTab scStats={scStats} />
      default:            return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center">
              <Music2 size={22} className="text-orange-500" />
            </span>
            SC Accounts
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 ml-1">
            SoundCloud account creator & follower — browser-automated with email verification
          </p>
        </div>
        {running && <RunningBadge operation={scStats?.operation} />}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => {
          const active = tab === t.id
          const TabIcon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                active
                  ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}>
              <TabIcon size={13} />
              {t.label}
              {t.id !== 'config' && scStats?.running && scStats?.operation === t.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse ml-1" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}>
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
