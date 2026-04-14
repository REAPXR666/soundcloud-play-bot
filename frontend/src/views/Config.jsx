import { motion } from 'framer-motion';
import { Globe, Shield, Info } from 'lucide-react';
import ProxyManager from '../components/ProxyManager';

export default function Config({ proxies, setProxies, useProxies, setUseProxies }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl space-y-6 pb-20">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Proxy Settings</h2>
        <p className="text-slate-500 mt-1 text-sm">Configure residential proxies for IP rotation. Each play uses a unique IP address.</p>
      </div>

      {/* Proxy toggle card */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              useProxies ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {useProxies ? 'Proxy mode enabled' : 'Direct mode'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {useProxies ? 'Each play gets a unique residential IP' : 'All plays from your IP (limited to 1 play)'}
              </p>
            </div>
          </div>
          <button onClick={() => setUseProxies(!useProxies)}
            className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${
              useProxies ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}>
            <motion.div animate={{ x: useProxies ? 20 : 0 }}
              className="w-5 h-5 bg-white rounded-full shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </button>
        </div>
      </div>

      {/* Proxy manager */}
      <motion.div animate={{ opacity: useProxies ? 1 : 0.4 }}
        className={`glass-panel p-6 space-y-5 ${!useProxies ? 'pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3">
          <Globe size={18} className="text-orange-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Proxy List</h3>
        </div>
        <ProxyManager proxies={proxies} setProxies={setProxies} />
      </motion.div>

      {/* Help card */}
      <div className="glass-panel p-5 flex gap-4">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-500 space-y-2">
          <p><strong className="text-slate-700 dark:text-slate-300">Session-based proxies</strong> (like Nettify or IPRoyal) automatically get a fresh session ID for each play, ensuring unique IPs.</p>
          <p><strong className="text-slate-700 dark:text-slate-300">Supported formats:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">user:pass@host:port</code> · <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">host:port:user:pass</code> · <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">host:port</code></p>
        </div>
      </div>
    </motion.div>
  );
}
