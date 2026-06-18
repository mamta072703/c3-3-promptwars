/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActivityLog, UserProfile, WeeklyChallenge } from '../types';
import { calculateEcoScore } from '../utils';
import { Flame, Trophy, Award, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartDashboardProps {
  logs: ActivityLog[];
  profile: UserProfile;
  weeklyChallenges: RegularWeeklyChallenge[];
  onRollChallenge: () => void;
}

interface RegularWeeklyChallenge {
  id: string;
  title: string;
  description: string;
  currentCount: number;
  targetCount: number;
  rewardPoints: number;
}

export default function SmartDashboard({ logs, profile, weeklyChallenges, onRollChallenge }: SmartDashboardProps) {
  const [dailyTotal, setDailyTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);

  // Calculate daily totals for today in local timezone
  useEffect(() => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const sum = logs
      .filter(l => l.timestamp.substring(0, 10) === todayStr)
      .reduce((acc, curr) => acc + curr.co2, 0);
    setDailyTotal(parseFloat(sum.toFixed(3)));
  }, [logs]);

  // Calculate streak based on local timezone date records
  useEffect(() => {
    if (logs.length === 0) {
      setStreak(0);
      return;
    }

    const dailySums: Record<string, number> = {};
    logs.forEach(l => {
      const day = l.timestamp.substring(0, 10);
      dailySums[day] = (dailySums[day] || 0) + l.co2;
    });

    let currentStreak = 0;
    const checkDate = new Date();

    // Check yesterday and previous days backwards
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().substring(0, 10);
      const daySum = dailySums[dateStr];

      // If user active today, we can count today. If they logged today and it's under limit, streak is active.
      // If it's today and they haven't logged yet, we skip today and check from yesterday.
      if (i === 0 && daySum === undefined) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (daySum !== undefined && daySum <= 7.7) {
        currentStreak++;
      } else if (daySum !== undefined && daySum > 7.7) {
        // Streak broken
        break;
      } else {
        // No logs on this day, breaks streak
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    setStreak(currentStreak);
  }, [logs]);

  // Handle active challenge progress calculation dynamically from logs!
  const activeChallenge = weeklyChallenges[activeChallengeIndex] || weeklyChallenges[0];
  
  let dynamicProgress = 0;
  if (activeChallengeIndex === 0) {
    // Meatless commits: food items with vegan/vegetarian sub-items
    dynamicProgress = logs.filter(l => l.category === 'food' && (l.details.includes('Vegan') || l.details.includes('Vegetarian'))).length;
  } else if (activeChallengeIndex === 1) {
    // Transit: local trains or metros ridden in km
    const trainLogs = logs.filter(l => l.category === 'transport' && (l.details.includes('Metro') || l.details.includes('Suburban')));
    dynamicProgress = Math.round(trainLogs.reduce((sum, l) => sum + l.amount, 0));
  } else if (activeChallengeIndex === 2) {
    // Digital diet: stream logged items kept minimal (count digital logs under 3 hours)
    const digitalLogs = logs.filter(l => l.category === 'digital' && l.amount < 3);
    dynamicProgress = digitalLogs.length;
  } else {
    // AC saver: ac hours logged under 4 hours
    const acLogs = logs.filter(l => l.category === 'energy' && l.details.includes('Air') && l.amount <= 4);
    dynamicProgress = acLogs.length;
  }

  const completeRatio = Math.min(activeChallenge.targetCount, dynamicProgress);
  const percent = Math.round((completeRatio / activeChallenge.targetCount) * 100);

  // Carbon safety target standard
  const targetCg = 7.7;
  const scoreObj = calculateEcoScore(dailyTotal);

  // Compute progress ring SVG attributes
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2
  const ratio = Math.min(1, dailyTotal / targetCg);
  const strokeDashoffset = circumference - ratio * circumference;

  const getRingColor = () => {
    const ratio = dailyTotal / targetCg;
    if (ratio < 0.6) return 'stroke-neon-green text-[#00FF87]';
    if (ratio < 0.95) return 'stroke-yellow-400 text-yellow-500';
    return 'stroke-red-500 text-red-500';
  };

  const getCircularLabelElement = () => {
    const ratio = dailyTotal / targetCg;
    if (ratio < 0.6) {
      return (
        <span className="text-[10px] font-semibold mt-1.5 text-[#00FF87] hover:opacity-90">
          Pristine Safe Balance
        </span>
      );
    }
    if (ratio < 1) {
      return (
        <span className="text-[10px] font-semibold mt-1.5 text-yellow-400">
          接近 Safe Limit Caution
        </span>
      );
    }
    return (
      <span className="text-[9px] font-extrabold mt-1.5 text-white bg-red-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-500/30 shadow-md shadow-red-950/30">
        Exceeded Safe Daily Target!
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6" id="dashboard_stats">
      
      {/* SECTION A: SCOREPLATE RING */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden h-full">
        <div className="absolute top-0 left-0 w-32 h-32 bg-neon-green/5 blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[11px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-neon-green" /> Today's Quota
          </h4>
          <div className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1 rounded-full border border-white/5 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            <span id="overall_streak_indicator" className="text-xs font-mono font-bold text-orange-400">Streak: {streak} Day{streak !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Circular SVG Ring */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="7"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              className={`${getRingColor()} transition-all`}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.span
              key={dailyTotal}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl font-display font-extrabold text-white leading-none mb-1"
            >
              {dailyTotal.toFixed(2)}
            </motion.span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">KG CO₂ / DAY</span>
            {getCircularLabelElement()}
          </div>
        </div>

        {/* Scorecard values */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5 uppercase tracking-wide">Overall Rating Score</span>
            <h5 className="font-display font-bold text-base text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-400" /> Eco Score: {scoreObj.score}/100
            </h5>
          </div>

          <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-display text-lg font-bold bg-slate-900/40 relative shadow-inner ${scoreObj.colorClass}`}>
            {scoreObj.grade}
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF87]"></span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION B: CHALLENGE CARD CONTAINER */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/5 blur-3xl pointer-events-none"></div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[11px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-electric-blue" /> Weekly Challenge Target
            </h4>
            <span className="text-[9px] bg-electric-blue/15 text-electric-blue border border-electric-blue/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Active Focus
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeChallenge.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-display font-bold text-lg text-white mb-1.5">{activeChallenge.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md">{activeChallenge.description}</p>
              </div>

              {/* Progress Bar slider design */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neon-green font-bold">{completeRatio} / {activeChallenge.targetCount} units completed</span>
                  <span className="text-slate-400">{percent}% Done</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950/70 border border-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-neon-green to-electric-blue shadow-lg"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-5 bg-slate-900/5 p-2 rounded-xl">
          <div>
            <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-mono">Success Reward</span>
            <span className="text-xs font-bold text-neon-green flex items-center gap-1 font-display">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} /> +{activeChallenge.rewardPoints} Steward Credits
            </span>
          </div>

          <button
            onClick={() => setActiveChallengeIndex(prev => (prev + 1) % weeklyChallenges.length)}
            id="roll_active_challenge"
            className="text-xs bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 text-white font-medium px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Rotate Focus Goal
          </button>
        </div>
      </div>

    </div>
  );
}
