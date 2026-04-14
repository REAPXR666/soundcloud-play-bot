import { motion } from 'framer-motion';
import { Terminal, Clock, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Logs({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return 'text-red-500';
      case 'WARNING': return 'text-amber-500';
      case 'SUCCESS': return 'text-emerald-500';
      default: return 'text-zinc-500 dark:text-zinc-400';
    }
  };

  const getLogIcon = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return <ShieldAlert size={14} className="text-red-500" />;
      case 'WARNING': return <ShieldAlert size={14} className="text-amber-500" />;
      case 'SUCCESS': return <CheckCircle2 size={14} className="text-emerald-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-10 max-w-6xl mx-auto h-[calc(100vh-10rem)] flex flex-col"
    >
      <div className="flex-shrink-0">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Neural Feedback</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-base">Real-time orchestration diagnostics and node telemetry.</p>
      </div>

      <div className="glass-panel p-8 flex-1 flex flex-col overflow-hidden bg-slate-950/40 border-white/10 shadow-2xl">
        <div className="flex items-center gap-4 mb-6 text-slate-400 border-b border-white/5 pb-6 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5">
            <Terminal size={18} className="text-orange-500" />
          </div>
          <div>
            <span className="font-black text-xs tracking-[0.2em] uppercase text-slate-300">V3_ SENTINEL_TERMINAL</span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              LIVE_STREAM_ACTIVE
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-4 font-mono text-xs custom-scrollbar">
          {!logs || logs.length === 0 ? (
            <div className="text-slate-600 flex items-center justify-center h-full italic font-bold tracking-widest uppercase opacity-40">
              Awaiting system initiation...
            </div>
          ) : (
            logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4 py-2 group border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-[130px] text-slate-500 font-black opacity-60">
                  <Clock size={12} />
                  <span>{new Date(log.time * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 1 })}</span>
                </div>
                <div className="mt-0.5 flex-shrink-0">{getLogIcon(log.level)}</div>
                <div className={`flex-1 break-words font-medium leading-relaxed ${getLogColor(log.level)}`}>
                  {log.message}
                </div>
              </motion.div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>
    </motion.div>
  );
}
