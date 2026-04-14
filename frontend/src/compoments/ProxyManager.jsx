import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react'

const API = 'http://127.0.0.1:8899'

export default function ProxyManager({ proxies, setProxies }) {
  const [text, setText] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const loadFromText = () => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    setProxies(lines)
    setResult(null)
  }

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').map(l => l.trim()).filter(Boolean)
      setText(lines.join('\n'))
      setProxies(lines)
      setResult(null)
    }
    reader.readAsText(file)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file?.name?.endsWith('.txt')) handleFile(file)
  }

  const checkAll = async () => {
    if (!proxies.length) return
    setChecking(true); setResult(null)
    try {
      const res = await fetch(`${API}/api/proxies/check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxies })
      })
      setResult(await res.json())
    } catch { setResult({ error: 'Cannot reach backend' }) }
    setChecking(false)
  }

  return (
    <div className="space-y-5">
      {/* Textarea with drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors duration-200 ${
          dragOver ? 'border-orange-400 bg-orange-500/5' : 'border-slate-200 dark:border-slate-700'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <textarea
          className="w-full min-h-[180px] px-4 py-3 bg-transparent text-sm font-mono text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none resize-none"
          placeholder={"Paste proxies here, one per line\nOr drag & drop a .txt file\n\nSupported formats:\n  user:pass@host:port\n  host:port:user:pass\n  host:port"}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-orange-500/10 rounded-xl pointer-events-none">
            <p className="text-orange-500 font-semibold text-sm">Drop .txt file here</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <motion.button onClick={loadFromText} className="btn-primary" whileTap={{ scale: 0.96 }}>
          Load {text.split('\n').filter(l => l.trim()).length} proxies
        </motion.button>
        <motion.button onClick={() => fileRef.current?.click()} className="btn-secondary" whileTap={{ scale: 0.96 }}>
          <Upload size={15} /> Import file
        </motion.button>
        <motion.button onClick={checkAll} className="btn-secondary" whileTap={{ scale: 0.96 }}
          disabled={checking || !proxies.length}>
          {checking ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          {checking ? 'Checking...' : 'Validate'}
        </motion.button>
        <input ref={fileRef} type="file" accept=".txt" className="hidden"
          onChange={e => handleFile(e.target.files?.[0])} />
      </div>

      {/* Results */}
      {proxies.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500"><strong className="text-slate-700 dark:text-slate-200">{proxies.length}</strong> proxies loaded</span>
          {result && !result.error && (
            <>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> {result.working} working
              </span>
              {result.dead > 0 && (
                <span className="text-red-500 flex items-center gap-1">
                  <XCircle size={13} /> {result.dead} failed
                </span>
              )}
              {result.detected_format && (
                <span className="text-slate-400 text-xs">Format: {result.detected_format}</span>
              )}
            </>
          )}
        </div>
      )}
      {result?.error && <p className="text-red-500 text-sm">{result.error}</p>}
    </div>
  )
}
