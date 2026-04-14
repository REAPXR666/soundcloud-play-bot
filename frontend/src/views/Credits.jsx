import { motion } from 'framer-motion';
import { Disc3, Heart, Code2, Globe } from 'lucide-react';

export default function Credits() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl space-y-10"
    >
      <div>
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Credits & Infrastructure</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-base">Architectural documentation of the PlayBot Engine.</p>
      </div>

      <div className="glass-panel p-16 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-rose-600 to-indigo-600" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(249,115,22,0.4)] mb-12 relative z-10 p-0.5"
        >
          <div className="w-full h-full rounded-[2.8rem] bg-slate-950 flex items-center justify-center backdrop-blur-3xl">
            <Disc3 size={80} className="text-orange-500 animate-[spin_4s_linear_infinite]" />
          </div>
        </motion.div>

        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 relative z-10 tracking-tight">PlayBot v3.0 Engine</h3>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl relative z-10 font-medium leading-relaxed">
          A high-performance Python-driven orchestration layer fused with a premium, glassmorphic React interface. Engineered for maximum stealth and 100% verified engagement loops.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative z-10 w-full max-w-2xl">
          <div className="flex flex-col items-center gap-4 group cursor-default p-6 glass-card hover:bg-white/10 dark:hover:bg-slate-800/40 transition-all duration-5100">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:-translate-y-2 group-hover:text-orange-500 transition-all duration-300 border border-white/10">
              <Code2 size={32} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">HYBRID_CORE</span>
          </div>
          <div className="flex flex-col items-center gap-4 group cursor-default p-6 glass-card hover:bg-white/10 dark:hover:bg-slate-800/40 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:-translate-y-2 group-hover:text-rose-500 transition-all duration-300 border border-white/10">
              <Heart size={32} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">PREMIUM_UX</span>
          </div>
          <div className="flex flex-col items-center gap-4 group cursor-default p-6 glass-card hover:bg-white/10 dark:hover:bg-slate-800/40 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:-translate-y-2 group-hover:text-emerald-500 transition-all duration-300 border border-white/10">
              <Globe size={32} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">STEALTH_NET</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
