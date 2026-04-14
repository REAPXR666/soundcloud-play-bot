import { motion } from 'framer-motion';
import { Music2, LayoutDashboard, Globe, ScrollText, HelpCircle, Radio, UserPlus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ activeView, setActiveView, connected }) {
  const nav = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'sc_accounts', icon: UserPlus, label: 'SC Accounts', accent: 'orange' },
    { id: 'mixcloud', icon: Radio, label: 'Mixcloud', accent: 'violet' },
    { id: 'config', icon: Globe, label: 'Proxies' },
    { id: 'logs', icon: ScrollText, label: 'Logs' },
    { id: 'credits', icon: HelpCircle, label: 'About' },
  ];

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-64 flex-shrink-0 flex flex-col h-full border-r border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/20 backdrop-blur-xl z-20"
    >
      {/* Logo */}
      <div className="px-6 pt-7 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Music2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">PlayBot</h1>
            <p className="text-[11px] text-slate-400 font-medium">SoundCloud Automation</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {nav.map((item) => {
          const active = activeView === item.id;
          return (
            <button key={item.id} onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              active && item.accent === 'violet'
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                  : active && item.accent === 'orange'
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : active
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
              }`}>
              <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {active && (
                <motion.div layoutId="nav-dot"
                  className={`ml-auto w-1.5 h-1.5 rounded-full ${item.accent === 'violet' ? 'bg-violet-500' : 'bg-orange-500'}`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-5 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span className="text-xs text-slate-400 font-medium">{connected ? 'Connected' : 'Offline'}</span>
        </div>
        <ThemeToggle />
      </div>
    </motion.aside>
  );
}
