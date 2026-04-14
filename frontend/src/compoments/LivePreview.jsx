import { motion, AnimatePresence } from 'framer-motion'
import { MonitorPlay, X, Maximize2 } from 'lucide-react'

export default function LivePreview({ previewData, onClose }) {
  if (!previewData) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="fixed bottom-10 right-10 w-[450px] z-50 overflow-hidden glass-panel border border-white/20 dark:border-slate-700/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 dark:border-slate-800/50">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
            <MonitorPlay size={16} className="text-orange-500" />
            V3 SENTINEL FEED
            <span className="flex h-2.5 w-2.5 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
        <div className="relative aspect-video bg-zinc-900 flex items-center justify-center p-0.5">
          <img
            src={`data:image/png;base64,${previewData}`}
            alt="Browser Preview"
            className="w-full h-full object-contain rounded border border-zinc-800"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
