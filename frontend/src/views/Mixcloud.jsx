import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Zap, Heart, Radio, MessageSquare, Play, Square,
  Key, Search, CheckCircle2, XCircle, Send, Hash, Cpu, Globe,
  AlertCircle, Loader2, ChevronRight, Eye, Star, Wallet, Shield,
  RefreshCw, Copy, Check
} from 'lucide-react'

const API = 'http://127.0.0.1:8899'
const MX = `${API}/api/mx`

// ── Violet accent helpers ────────────────────────────────────────────────────
const vBtn =
  'px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed'

const vBtnSm =
  'px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm shadow-violet-500/15 active:scale-[0.97] transition-all duration-200 flex items-center gap-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed'

const stopBtn =
  'px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300 dark:hover:border-red-500/30 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed'

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 transition-all duration-200 text-sm'

// ── Mini stat card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'violet' }) {
  const colors = {
    violet: 'text-violet-500 bg-violet-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
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

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${value ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <motion.div animate={{ x: value ? 20 : 0 }}
          className="w-5 h-5 bg-white rounded-full shadow-sm"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </button>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ sent, target }) {
  const pct = target > 0 ? Math.round((sent / target) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
        <span>{sent} / {target || '∞'}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
          animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  )
}

// ── Running indicator ─────────────────────────────────────────────────────────
function RunningBadge({ operation }) {
  const labels = {
    generate: 'Generating Accounts',
    follow: 'Sending Follows',
    mass_follow: 'Mass Following',
    live_viewers: 'Live Viewers Active',
    live_chat: 'Chat Bot Active',
    play: 'Play Botter Active',
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400">
      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_6px_#8b5cf6]" />
      {labels[operation] || 'Running'}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════════════════════════

// ── [Overview] ───────────────────────────────────────────────────────────────
function OverviewTab({ mxStats }) {
  const [captchaKey, setCaptchaKey] = useState('')
  const [proxy, setProxy] = useState('')
  const [csrfTokens, setCsrfTokens] = useState('')
  const [saving, setSaving] = useState(false)
  const [proxyLoading, setProxyLoading] = useState(false)
  const [csrfSaving, setCsrfSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [proxyMsg, setProxyMsg] = useState('')
  const [csrfMsg, setCsrfMsg] = useState('')

  // Load existing CSRF tokens on mount
  useEffect(() => {
    fetch(`${MX}/csrf_tokens`).then(r => r.json()).then(d => {
      if (d.tokens) setCsrfTokens(d.tokens)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (mxStats?.proxy) setProxy(mxStats.proxy)
  }, [mxStats?.proxy])

  const saveCsrfTokens = async () => {
    setCsrfSaving(true); setCsrfMsg('')
    try {
      const res = await fetch(`${MX}/csrf_tokens`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: csrfTokens })
      })
      const data = await res.json()
      if (data.error) setCsrfMsg(`⚠ ${data.error}`)
      else setCsrfMsg(`✓ Saved ${data.count} token(s)`)
    } catch { setCsrfMsg('⚠ Backend not running') }
    setCsrfSaving(false)
  }

  const saveCaptchaKey = async () => {
    if (!captchaKey.trim()) return
    setSaving(true); setMsg('')
    try {
      const res = await fetch(`${MX}/captcha/key`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: captchaKey.trim() })
      })
      const data = await res.json()
      if (data.error) setMsg(`⚠ ${data.error}`)
      else setMsg(`✓ Saved! Balance: $${data.balance?.toFixed(5) ?? 0}`)
    } catch { setMsg('Backend not running') }
    setSaving(false)
  }

  const saveProxy = async () => {
    if (!proxy.trim()) return
    setProxyLoading(true); setProxyMsg('')
    try {
      await fetch(`${MX}/proxy`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxy: proxy.trim() })
      })
      setProxyMsg('✓ Proxy updated')
    } catch { setProxyMsg('Backend not running') }
    setProxyLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Accounts" value={mxStats?.accounts ?? 0} color="violet" />
        <StatCard icon={Wallet} label="Captcha Balance" value={mxStats?.captcha_balance ? `$${mxStats.captcha_balance.toFixed(5)}` : '$0.00'} color="emerald" />
        <StatCard icon={Shield} label="CSRF Tokens" value={mxStats?.csrf_tokens ?? 0} color={mxStats?.csrf_tokens > 0 ? 'blue' : 'rose'} />
        <StatCard icon={CheckCircle2} label="Success" value={mxStats?.success ?? 0} color="emerald" />
      </div>

      {/* Status */}
      {mxStats?.running && (
        <div className="glass-panel p-4 flex items-center justify-between">
          <RunningBadge operation={mxStats.operation} />
          <div className="text-right">
            <ProgressBar sent={mxStats.sent || 0} target={mxStats.target || 0} />
          </div>
        </div>
      )}

      {/* Captcha key */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Key size={16} className="text-violet-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">2Captcha Key</h3>
        </div>
        <p className="text-xs text-slate-400">Required for unlocking jailed accounts during follow/generate operations.</p>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="Your 2captcha API key..."
            type="password" value={captchaKey} onChange={e => setCaptchaKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveCaptchaKey()} />
          <button className={vBtnSm} onClick={saveCaptchaKey} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
          </button>
        </div>
        {msg && <p className={`text-xs font-semibold ${msg.startsWith('✓') ? 'text-emerald-500' : 'text-amber-500'}`}>{msg}</p>}
      </div>

      {/* Proxy */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-violet-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Mixcloud Proxy</h3>
        </div>
        <p className="text-xs text-slate-400">Single residential proxy for all Mixcloud API requests. Format: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">user:pass@host:port</code></p>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="user:pass@host:port"
            value={proxy} onChange={e => setProxy(e.target.value)} />
          <button className={vBtnSm} onClick={saveProxy} disabled={proxyLoading}>
            {proxyLoading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Set
          </button>
        </div>
        {proxyMsg && <p className="text-xs font-semibold text-emerald-500">{proxyMsg}</p>}
      </div>

      {/* CSRF Tokens */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-violet-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">CSRF Tokens</h3>
        </div>
        <p className="text-xs text-slate-400">Required for Mixcloud session bootstrap. Paste one token per line. Get them by logging into Mixcloud in your browser and copying the <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">csrftoken</code> cookie.</p>
        <textarea className={`${inputCls} min-h-[100px] font-mono text-xs`}
          placeholder={"Paste CSRF tokens here (one per line)...\ne.g. 9cymrLYBoZjNNN0POjDeykNKRyhgxmJ2"}
          value={csrfTokens} onChange={e => setCsrfTokens(e.target.value)} />
        <button className={`${vBtnSm} w-full justify-center`} onClick={saveCsrfTokens} disabled={csrfSaving}>
          {csrfSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save CSRF Tokens
        </button>
        {csrfMsg && <p className={`text-xs font-semibold ${csrfMsg.startsWith('✓') ? 'text-emerald-500' : 'text-amber-500'}`}>{csrfMsg}</p>}
      </div>
    </div>
  )
}

// ── [1] Generate Accounts ─────────────────────────────────────────────────────
function GenerateTab({ mxStats }) {
  const [count, setCount] = useState(10)
  const [threads, setThreads] = useState(3)
  const [followRandom, setFollowRandom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = mxStats?.running && mxStats?.operation === 'generate'

  const start = async () => {
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${MX}/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, threads, follow_random: followRandom })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${MX}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Generate Accounts</h3>
        <p className="text-sm text-slate-400 mt-0.5">Create new Mixcloud accounts and store them in mx2.txt. A captcha key is required.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Hash size={11} className="text-violet-400" /> Accounts to create
            </label>
            <input type="number" className={inputCls} value={count} min={1} max={500}
              onChange={e => setCount(parseInt(e.target.value) || 1)} disabled={running} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5"><Cpu size={11} className="text-violet-400" /> Threads</span>
              <span className="text-violet-500 font-black">{threads}</span>
            </label>
            <input type="range" className="w-full accent-violet-600" min={1} max={10}
              value={threads} onChange={e => setThreads(parseInt(e.target.value))} disabled={running} />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>1</span><span>10</span></div>
          </div>
        </div>
        <Toggle value={followRandom} onChange={setFollowRandom} label="Follow random users for legitimacy" />

        <div className="flex gap-3 pt-1">
          <button className={`${vBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Users size={15} />}
            {running ? 'Generating...' : 'Start Generating'}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {(running || (mxStats?.operation === 'generate' && mxStats?.sent > 0)) && (
        <div className="glass-panel p-5 space-y-3">
          {running && <RunningBadge operation="generate" />}
          <ProgressBar sent={mxStats?.sent || 0} target={mxStats?.target || count} />
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Send} label="Attempted" value={mxStats?.sent ?? 0} color="blue" />
            <StatCard icon={CheckCircle2} label="Created" value={mxStats?.success ?? 0} color="emerald" />
            <StatCard icon={XCircle} label="Failed" value={mxStats?.failed ?? 0} color="rose" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── [2] Follow User ───────────────────────────────────────────────────────────
function FollowTab({ mxStats }) {
  const [username, setUsername] = useState('')
  const [count, setCount] = useState(10)
  const [followRandom, setFollowRandom] = useState(false)
  const [solveCaptcha, setSolveCaptcha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = mxStats?.running && mxStats?.operation === 'follow'

  const start = async () => {
    if (!username.trim()) { setErr('Enter a username'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${MX}/follow`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), count, follow_random: followRandom, solve_captcha: solveCaptcha })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${MX}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Follow a User</h3>
        <p className="text-sm text-slate-400 mt-0.5">Send a set number of follows from your account database.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <UserPlus size={11} className="text-violet-400" /> Target Username
          </label>
          <input className={inputCls} placeholder="mixcloud_username" value={username}
            onChange={e => setUsername(e.target.value)} disabled={running} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Hash size={11} className="text-violet-400" /> Number of followers to send (max = accounts in db)
          </label>
          <input type="number" className={inputCls} value={count} min={1} max={10000}
            onChange={e => setCount(parseInt(e.target.value) || 1)} disabled={running} />
        </div>
        <div className="space-y-3 pt-1">
          <Toggle value={followRandom} onChange={setFollowRandom} label="Follow random users for legitimacy" />
          <Toggle value={solveCaptcha} onChange={setSolveCaptcha} label="Unlock jailed accounts (uses captcha balance)" />
        </div>

        <div className="flex gap-3 pt-1">
          <button className={`${vBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
            {running ? 'Following...' : 'Start Following'}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {(running || (mxStats?.operation === 'follow' && mxStats?.sent > 0)) && (
        <div className="glass-panel p-5 space-y-3">
          {running && <RunningBadge operation="follow" />}
          <ProgressBar sent={mxStats?.sent || 0} target={mxStats?.target || count} />
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Send} label="Attempted" value={mxStats?.sent ?? 0} color="blue" />
            <StatCard icon={CheckCircle2} label="Sent" value={mxStats?.success ?? 0} color="emerald" />
            <StatCard icon={XCircle} label="Failed" value={mxStats?.failed ?? 0} color="rose" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── [3] Mass Follow ───────────────────────────────────────────────────────────
function MassFollowTab({ mxStats }) {
  const [username, setUsername] = useState('')
  const [threads, setThreads] = useState(3)
  const [solveCaptcha, setSolveCaptcha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = mxStats?.running && mxStats?.operation === 'mass_follow'

  const start = async () => {
    if (!username.trim()) { setErr('Enter a username'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${MX}/mass_follow`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), threads, solve_captcha: solveCaptcha })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${MX}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Mass Follow <span className="text-xs font-semibold bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full ml-1">FAST</span></h3>
        <p className="text-sm text-slate-400 mt-0.5">Continuous multi-threaded follow loop — runs until stopped.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <UserPlus size={11} className="text-violet-400" /> Target Username
          </label>
          <input className={inputCls} placeholder="mixcloud_username" value={username}
            onChange={e => setUsername(e.target.value)} disabled={running} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5"><Cpu size={11} className="text-violet-400" /> Threads</span>
            <span className="text-violet-500 font-black">{threads}</span>
          </label>
          <input type="range" className="w-full accent-violet-600" min={1} max={20}
            value={threads} onChange={e => setThreads(parseInt(e.target.value))} disabled={running} />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>1</span><span>20</span></div>
        </div>
        <Toggle value={solveCaptcha} onChange={setSolveCaptcha} label="Use captcha solving to unlock jailed accounts" />

        <div className="flex gap-3 pt-1">
          <button className={`${vBtn} flex-1`} onClick={start} disabled={running || loading}>
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
            <StatCard icon={CheckCircle2} label="Follows Sent" value={mxStats?.success ?? 0} color="emerald" />
            <StatCard icon={Send} label="Total Attempts" value={mxStats?.sent ?? 0} color="blue" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── [4] Favourite (coming soon) ───────────────────────────────────────────────
function FavouriteTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Favourite a Track</h3>
        <p className="text-sm text-slate-400 mt-0.5">Add favourites/likes to a Mixcloud track.</p>
      </div>
      <div className="glass-panel p-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">
          <Star size={36} className="text-violet-400" />
        </div>
        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Coming Soon</h4>
        <p className="text-slate-400 text-sm max-w-xs">Track favouriting is currently in development and will be available in a future update.</p>
        <div className="mt-6 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400">
          COMING SOON
        </div>
      </div>
    </div>
  )
}

// ── [5] Live Viewers ──────────────────────────────────────────────────────────
function LiveViewersTab({ mxStats }) {
  const [url, setUrl] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = mxStats?.running && mxStats?.operation === 'live_viewers'

  const start = async () => {
    if (!url.trim()) { setErr('Enter a Mixcloud Live URL'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${MX}/live_viewers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), count })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${MX}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Live Viewers</h3>
        <p className="text-sm text-slate-400 mt-0.5">Send logged-in viewers to a Mixcloud live stream. Viewers remain active until stopped.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Radio size={11} className="text-violet-400" /> Mixcloud Live URL
          </label>
          <input className={inputCls} placeholder="https://www.mixcloud.com/live/username" value={url}
            onChange={e => setUrl(e.target.value)} disabled={running} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Eye size={11} className="text-violet-400" /> Number of viewers
          </label>
          <input type="number" className={inputCls} value={count} min={1} max={50}
            onChange={e => setCount(parseInt(e.target.value) || 1)} disabled={running} />
        </div>

        <div className="flex gap-3 pt-1">
          <button className={`${vBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
            {running ? `${mxStats?.success ?? 0} Viewers Active` : 'Start Viewers'}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {running && (
        <div className="glass-panel p-5 space-y-3">
          <RunningBadge operation="live_viewers" />
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Eye} label="Active Viewers" value={mxStats?.success ?? 0} color="violet" />
            <StatCard icon={XCircle} label="Failed" value={mxStats?.failed ?? 0} color="rose" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── [6] Live Chat Botter ──────────────────────────────────────────────────────
function LiveChatTab({ mxStats }) {
  const [url, setUrl] = useState('')
  const [count, setCount] = useState(3)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = mxStats?.running && mxStats?.operation === 'live_chat'

  const start = async () => {
    if (!url.trim()) { setErr('Enter a Mixcloud Live URL'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${MX}/live_chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), count })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${MX}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Live Chat Botter</h3>
        <p className="text-sm text-slate-400 mt-0.5">Send automated chat messages to a Mixcloud live stream using random accounts.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Radio size={11} className="text-violet-400" /> Mixcloud Live URL
          </label>
          <input className={inputCls} placeholder="https://www.mixcloud.com/live/username" value={url}
            onChange={e => setUrl(e.target.value)} disabled={running} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <MessageSquare size={11} className="text-violet-400" /> Number of chat bots
          </label>
          <input type="number" className={inputCls} value={count} min={1} max={20}
            onChange={e => setCount(parseInt(e.target.value) || 1)} disabled={running} />
        </div>

        <div className="flex gap-3 pt-1">
          <button className={`${vBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
            {running ? 'Chat Bot Active' : 'Start Chat Bot'}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {running && (
        <div className="glass-panel p-5 space-y-3">
          <RunningBadge operation="live_chat" />
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={MessageSquare} label="Messages Sent" value={mxStats?.sent ?? 0} color="violet" />
            <StatCard icon={CheckCircle2} label="Bots Active" value={mxStats?.success ?? 0} color="emerald" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── [7] Play Botter ───────────────────────────────────────────────────────────
function PlayTab({ mxStats }) {
  const [url, setUrl] = useState('')
  const [threads, setThreads] = useState(2)
  const [viewsPerThread, setViewsPerThread] = useState(5)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const running = mxStats?.running && mxStats?.operation === 'play'
  const total = threads * viewsPerThread

  const start = async () => {
    if (!url.trim()) { setErr('Enter a Mixcloud URL'); return }
    setLoading(true); setErr('')
    try {
      const res = await fetch(`${MX}/play`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), threads, views_per_thread: viewsPerThread })
      })
      const d = await res.json()
      if (d.error) setErr(d.error)
    } catch { setErr('Backend not running') }
    setLoading(false)
  }

  const stop = async () => {
    try { await fetch(`${MX}/stop`, { method: 'POST' }) } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Play Botter</h3>
        <p className="text-sm text-slate-400 mt-0.5">Drive plays to a Mixcloud mix using logged-in accounts via real Chrome browsers.</p>
      </div>

      <div className="glass-panel p-6 space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Play size={11} className="text-violet-400" /> Mixcloud Mix URL
          </label>
          <input className={inputCls} placeholder="https://www.mixcloud.com/username/mix-name/" value={url}
            onChange={e => setUrl(e.target.value)} disabled={running} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5"><Cpu size={11} className="text-violet-400" /> Threads</span>
              <span className="text-violet-500 font-black">{threads}</span>
            </label>
            <input type="range" className="w-full accent-violet-600" min={1} max={10}
              value={threads} onChange={e => setThreads(parseInt(e.target.value))} disabled={running} />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>1</span><span>10</span></div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Hash size={11} className="text-violet-400" /> Views per thread
            </label>
            <input type="number" className={inputCls} value={viewsPerThread} min={1} max={100}
              onChange={e => setViewsPerThread(parseInt(e.target.value) || 1)} disabled={running} />
          </div>
        </div>
        <p className="text-xs text-violet-400 font-semibold">Total plays: {total.toLocaleString()}</p>

        <div className="flex gap-3 pt-1">
          <button className={`${vBtn} flex-1`} onClick={start} disabled={running || loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            {running ? 'Playing...' : `Start ${total} Plays`}
          </button>
          <button className={stopBtn} onClick={stop} disabled={!running}>
            <Square size={15} /> Stop
          </button>
        </div>
        {err && <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
      </div>

      {(running || (mxStats?.operation === 'play' && mxStats?.sent > 0)) && (
        <div className="glass-panel p-5 space-y-3">
          {running && <RunningBadge operation="play" />}
          <ProgressBar sent={mxStats?.sent || 0} target={mxStats?.target || total} />
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Send} label="Attempted" value={mxStats?.sent ?? 0} color="blue" />
            <StatCard icon={CheckCircle2} label="Played" value={mxStats?.success ?? 0} color="emerald" />
            <StatCard icon={XCircle} label="Failed" value={mxStats?.failed ?? 0} color="rose" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── [Captcha Tools] ───────────────────────────────────────────────────────────
function CaptchaToolsTab() {
  // Key checker
  const [checkKey, setCheckKey] = useState('')
  const [checkType, setCheckType] = useState('2captcha')
  const [checkResult, setCheckResult] = useState(null)
  const [checkLoading, setCheckLoading] = useState(false)

  // Scraper
  const [ghToken, setGhToken] = useState('')
  const [query, setQuery] = useState('2captcha')
  const [pages, setPages] = useState(3)
  const [scrapeResult, setScrapeResult] = useState(null)
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const checkBalance = async () => {
    if (!checkKey.trim()) return
    setCheckLoading(true); setCheckResult(null)
    try {
      const res = await fetch(`${MX}/captcha/check_balance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: checkKey.trim(), type: checkType })
      })
      setCheckResult(await res.json())
    } catch { setCheckResult({ error: 'Backend not running' }) }
    setCheckLoading(false)
  }

  const scrape = async () => {
    if (!ghToken.trim()) return
    setScrapeLoading(true); setScrapeResult(null)
    try {
      const res = await fetch(`${MX}/captcha/scrape`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, pages, github_token: ghToken.trim() })
      })
      setScrapeResult(await res.json())
    } catch { setScrapeResult({ error: 'Backend not running', keys: [] }) }
    setScrapeLoading(false)
  }

  const copyKeys = () => {
    if (!scrapeResult?.keys?.length) return
    navigator.clipboard.writeText(scrapeResult.keys.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Captcha Tools</h3>
        <p className="text-sm text-slate-400 mt-0.5">Check captcha key balances and scrape leaked keys from GitHub.</p>
      </div>

      {/* Key Balance Checker */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet size={15} className="text-violet-400" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Key Balance Checker</h4>
          <span className="text-[10px] text-slate-400 font-medium ml-auto">checkkey.py + capmonsterscrape.py</span>
        </div>
        <div className="flex gap-2">
          <select className={`${inputCls} flex-shrink-0 w-36`} value={checkType} onChange={e => setCheckType(e.target.value)}>
            <option value="2captcha">2captcha</option>
            <option value="capmonster">CapMonster</option>
          </select>
          <input className={inputCls} placeholder="Paste API key..." value={checkKey}
            onChange={e => setCheckKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkBalance()} />
          <button className={vBtnSm} onClick={checkBalance} disabled={checkLoading}>
            {checkLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />} Check
          </button>
        </div>
        <AnimatePresence>
          {checkResult && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-sm font-semibold ${checkResult.error
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
              {checkResult.error
                ? `⚠ ${checkResult.error}`
                : `✓ Balance: $${typeof checkResult.balance === 'number' ? checkResult.balance.toFixed(5) : checkResult.balance} — ${checkResult.type}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GitHub Key Scraper */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Search size={15} className="text-violet-400" />
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">GitHub Key Scraper</h4>
          <span className="text-[10px] text-slate-400 font-medium ml-auto">2capscrape.py</span>
        </div>
        <p className="text-xs text-slate-400">Searches GitHub code for leaked 2captcha / CapMonster API keys using the GitHub Code Search API.</p>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">GitHub Personal Access Token (required)</label>
          <input className={inputCls} placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            type="password" value={ghToken} onChange={e => setGhToken(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Search Query</label>
            <input className={inputCls} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="2captcha" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Pages to scan</label>
            <input type="number" className={inputCls} value={pages} min={1} max={20}
              onChange={e => setPages(parseInt(e.target.value) || 1)} />
          </div>
        </div>
        <button className={`${vBtn} w-full`} onClick={scrape} disabled={scrapeLoading || !ghToken.trim()}>
          {scrapeLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {scrapeLoading ? 'Scraping GitHub...' : 'Scrape Keys'}
        </button>

        <AnimatePresence>
          {scrapeResult && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {scrapeResult.error && (
                <p className="text-xs text-rose-500 font-semibold">⚠ {scrapeResult.error}</p>
              )}
              {scrapeResult.keys?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-500">✓ {scrapeResult.count} keys found</p>
                    <button className={vBtnSm} onClick={copyKeys}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-3 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-0.5 border border-white/5">
                    {scrapeResult.keys.map((k, i) => (
                      <div key={i} className="flex items-center gap-2 hover:text-white">
                        <span className="text-slate-600">{i + 1}.</span>
                        <span className="flex-1 break-all">{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {scrapeResult.count === 0 && !scrapeResult.error && (
                <p className="text-xs text-slate-400">No keys found — try a different query or more pages.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN VIEW
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { id: 'overview',     label: 'Overview',      icon: Radio },
  { id: 'generate',     label: 'Generate',      icon: Users },
  { id: 'follow',       label: 'Follow',        icon: UserPlus },
  { id: 'mass_follow',  label: 'Mass Follow',   icon: Zap },
  { id: 'favourite',    label: 'Favourite',     icon: Heart },
  { id: 'live_viewers', label: 'Live Viewers',  icon: Eye },
  { id: 'live_chat',    label: 'Live Chat',     icon: MessageSquare },
  { id: 'play',         label: 'Play Botter',   icon: Play },
  { id: 'captcha',      label: 'Captcha Tools', icon: Key },
]

export default function MixcloudView({ mxStats }) {
  const [tab, setTab] = useState('overview')
  const running = mxStats?.running || false

  const renderTab = () => {
    switch (tab) {
      case 'overview':     return <OverviewTab mxStats={mxStats} />
      case 'generate':     return <GenerateTab mxStats={mxStats} />
      case 'follow':       return <FollowTab mxStats={mxStats} />
      case 'mass_follow':  return <MassFollowTab mxStats={mxStats} />
      case 'favourite':    return <FavouriteTab />
      case 'live_viewers': return <LiveViewersTab mxStats={mxStats} />
      case 'live_chat':    return <LiveChatTab mxStats={mxStats} />
      case 'play':         return <PlayTab mxStats={mxStats} />
      case 'captcha':      return <CaptchaToolsTab />
      default:             return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-20"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
              <Radio size={22} className="text-violet-500" />
            </span>
            Mixcloud
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 ml-1">
            Automation suite — accounts, follows, live viewers, chat, plays
          </p>
        </div>
        {running && <RunningBadge operation={mxStats?.operation} />}
      </div>

      {/* ── Sub-tab bar ── */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {TABS.map(t => {
          const active = tab === t.id
          const TabIcon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                active
                  ? 'bg-violet-600/10 text-violet-500 border border-violet-500/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}>
              <TabIcon size={13} />
              {t.label}
              {t.id !== 'overview' && t.id !== 'captcha' && t.id !== 'favourite' &&
                mxStats?.running && mxStats?.operation === t.id.replace('mass_follow', 'mass_follow').replace('live_viewers', 'live_viewers').replace('live_chat', 'live_chat') && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse ml-1" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}>
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
