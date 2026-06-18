/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { Trash2, Film, Coffee, ShieldAlert, Cpu, Car, Zap, ShoppingBag, Plane, AlertCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogHistoryProps {
  logs: ActivityLog[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function LogHistory({ logs, onRemove, onClear }: LogHistoryProps) {
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    if (!confirmWipe) return;
    const timer = setTimeout(() => {
      setConfirmWipe(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [confirmWipe]);

  const handleWipeClick = () => {
    if (confirmWipe) {
      setConfirmWipe(false);
      onClear();
    } else {
      setConfirmWipe(true);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Car className="w-4 h-4 text-neon-green" />;
      case 'food': return <Coffee className="w-4 h-4 text-teal-400" />;
      case 'energy': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4 text-pink-400" />;
      case 'flights': return <Plane className="w-4 h-4 text-violet-400" />;
      case 'digital': return <Cpu className="w-4 h-4 text-sky-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  // Focus only on latest 8 logs to avoid clutter
  const recentLogs = [...logs].reverse().slice(0, 8);

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden" id="log_history_block">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Logged Trajectory History</h3>
          <p className="text-xs text-slate-400">Verifiably logged records saved to browser offline cookie database</p>
        </div>
        
        {logs.length > 0 && (
          <button
            type="button"
            onClick={handleWipeClick}
            id="clear_all_trajectory"
            className={`text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              confirmWipe
                ? 'text-yellow-400 bg-yellow-950/20 border border-yellow-500/30 animate-pulse'
                : 'text-red-400 bg-red-950/10 hover:bg-neutral-900 border border-red-500/15'
            }`}
          >
            {confirmWipe ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" /> Confirm Wipe? (5s)
              </>
            ) : (
              <>
                🗑️ Wipe Cache Data
              </>
            )}
          </button>
        )}
      </div>

      <div className="overflow-x-auto w-full">
        {logs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-slate-900/40 flex items-center justify-center border border-white/5 shadow-inner mb-4">
              <AlertCircle className="w-8 h-8 text-slate-500" />
            </div>
            <h5 className="font-display font-semibold text-sm text-slate-300 mb-1">Awaiting Carbon Inputs</h5>
            <p className="text-xs text-slate-500 max-w-xs">No entries reported. Try logging high-impact flights, transport transits, or streaming sessions above.</p>
          </motion.div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 uppercase font-mono text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Calculation Specifics</th>
                <th className="py-2.5 px-3">CO₂ Impact Allocation</th>
                <th className="py-2.5 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody id="trajectory_tbody">
              <AnimatePresence initial={false}>
                {recentLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors duration-150"
                  >
                    <td className="py-3 px-3 font-semibold flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-950/40 border border-white/5">
                        {getCategoryIcon(log.category)}
                      </div>
                      <span className="font-display text-[11px] uppercase tracking-wide">{log.category}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 align-middle">
                      {log.details}
                    </td>
                    <td className={`py-3 px-3 font-mono font-bold align-middle ${log.co2 <= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {log.co2 > 0 ? '+' : ''}{log.co2.toFixed(3)} kg
                    </td>
                    <td className="py-3 px-3 text-right align-middle">
                      <button
                        onClick={() => onRemove(log.id)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:scale-110 transition-transform cursor-pointer"
                        title="Remove Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {logs.length > 8 && (
        <p className="text-[10px] text-center text-slate-500 font-mono mt-4 pt-1 border-t border-white/5">
          Showing 8 most recent logs. total records matching locally: {logs.length}
        </p>
      )}
    </div>
  );
}
