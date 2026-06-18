/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Badge } from '../types';
import { Award, Leaf, Zap, Cpu, Train, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface BadgesSectProps {
  badges: Badge[];
}

export default function BadgesSect({ badges }: BadgesSectProps) {
  
  const getBadgeIcon = (icon: string, unlocked: boolean) => {
    const cls = `w-7 h-7 ${unlocked ? 'text-neon-green' : 'text-slate-500'}`;
    switch (icon) {
      case 'Train': return <Train className={cls} />;
      case 'Leaf': return <Leaf className={cls} />;
      case 'Zap': return <Zap className={cls} />;
      case 'Cpu': return <Cpu className={cls} />;
      default: return <Award className={cls} />;
    }
  };

  const getBadgeGrad = (unlocked: boolean) => {
    return unlocked
      ? 'from-emerald-950/20 to-slate-900/40 border-neon-green/30 text-white'
      : 'from-slate-950/20 to-slate-950/40 border-white/5 text-slate-500';
  };

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden" id="badges_arch_panel">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Steward Milestones</h3>
          <p className="text-xs text-slate-400">Adopt sustainability practices to reach safe carbon scores</p>
        </div>
        <div className="flex items-center gap-1 bg-[#00FF87]/10 text-neon-green px-2.5 py-1 rounded-lg text-[10px] font-mono border border-neon-green/20 uppercase font-semibold">
          🏆 awards index
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {badges.map((b) => {
          const isUnlocked = b.unlockedAt !== null;
          return (
            <motion.div
              key={b.id}
              whileHover={{ scale: isUnlocked ? 1.03 : 1 }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-2xl border bg-gradient-to-tr ${getBadgeGrad(isUnlocked)} text-center transition-all flex flex-col items-center justify-between min-h-[140px]`}
            >
              <div className="relative mb-3 flex items-center justify-center">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center relative shadow-inner ${
                  isUnlocked ? 'bg-neon-green/10 border-neon-green/20' : 'bg-slate-950/50 border-white/5'
                }`}>
                  {getBadgeIcon(b.icon, isUnlocked)}
                </div>
                {isUnlocked && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-green border border-slate-950 flex items-center justify-center"
                  >
                    <ShieldCheck className="w-3 h-3 text-slate-950 stroke-[3]" />
                  </motion.span>
                )}
              </div>

              <div className="space-y-1">
                <h5 className="font-display font-semibold text-xs leading-snug">{b.title}</h5>
                <p className="text-[9px] text-slate-400 font-mono leading-tight max-w-[110px] mx-auto">
                  {isUnlocked ? b.description : `Unlock: ${b.requirement.split('total')[0]}`}
                </p>
              </div>

              <div className="mt-2 w-full">
                <span className={`inline-block text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${
                  isUnlocked ? 'bg-neon-green/10 text-neon-green font-bold' : 'bg-white/5 text-slate-500'
                }`}>
                  {isUnlocked ? 'Unlocked' : 'Pending'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
