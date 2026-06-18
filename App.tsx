/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile, ActivityLog, Badge, WeeklyChallenge } from './types';
import { INITIAL_BADGES, INITIAL_CHALLENGES } from './data';
import { generateStandaloneHTML, calculateEcoScore } from './utils';
import Onboarding from './components/Onboarding';
import SmartDashboard from './components/SmartDashboard';
import ActivityLogger from './components/ActivityLogger';
import AnalyticsCharts from './components/AnalyticsCharts';
import InsightsPanel from './components/InsightsPanel';
import BadgesSect from './components/BadgesSect';
import LogHistory from './components/LogHistory';
import ShareCard from './components/ShareCard';
import { Leaf, Award, Compass, RefreshCw, LayoutDashboard, Globe, ShieldAlert, CheckCircle, Save, Trash2, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(INITIAL_CHALLENGES);
  
  // Custom Toast state
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'badge' | 'info' }[]>([]);

  // Add a toast notification to the screen
  const triggerToast = (msg: string, type: 'success' | 'badge' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5500);
  };

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      // Profile load
      const cachedProfile = localStorage.getItem('ecopulse_profile');
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile);
          if (parsed.onboarded) setProfile(parsed);
        } catch (e) {
          console.error("Error parsing profile", e);
        }
      }
      
      // Logs load
      const cachedLogs = localStorage.getItem('ecopulse_logs');
      if (cachedLogs) {
        try {
          setLogs(JSON.parse(cachedLogs));
        } catch (e) {
          console.error("Error parsing logs", e);
        }
      }

      setLoading(false);
    }, 1500); // PremiumCalibration 1.5s loader simulation

    return () => clearTimeout(timer);
  }, []);

  // 2. Sync to localStorage on update
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('ecopulse_profile', JSON.stringify(newProfile));
    triggerToast(`Welcome aboard, ${newProfile.name}! EcoPulse calibrated for ${newProfile.city.toUpperCase()}`, 'info');
  };

  // 3. Activity Logging Event Callback
  const handleAddNewLog = (newLog: ActivityLog) => {
    const updated = [...logs, newLog];
    setLogs(updated);
    localStorage.setItem('ecopulse_logs', JSON.stringify(updated));
    
    // Trigger relative toasts
    const signLabel = newLog.co2 > 0 ? '+' : '';
    triggerToast(`Logged: ${newLog.details}. Impact: ${signLabel}${newLog.co2.toFixed(2)} kg CO₂!`);
    
    // Check and update milestones unlock
    checkAndUnlockBadges(updated);
  };

  // 4. Delete individual log
  const handleRemoveLog = (id: string) => {
    const filtered = logs.filter(l => l.id !== id);
    setLogs(filtered);
    localStorage.setItem('ecopulse_logs', JSON.stringify(filtered));
    triggerToast("Entry deleted successfully.", "info");
    checkAndUnlockBadges(filtered);
  };

  // 5. Purge local indices
  const handleClearAllData = () => {
    setLogs([]);
    localStorage.setItem('ecopulse_logs', JSON.stringify([]));
    setBadges(INITIAL_BADGES.map(b => ({ ...b, unlockedAt: null })));
    triggerToast("All reports scrubbed from local cache.", "info");
  };

  // 6. Badges dynamic unlocks routine
  const checkAndUnlockBadges = (currentLogs: ActivityLog[]) => {
    const totalTransitKm = currentLogs
      .filter(l => l.category === 'transport')
      .reduce((sum, l) => sum + l.amount, 0);

    const isEcoTransit = currentLogs.some(
      l => l.category === 'transport' && 
      (l.details.includes('Metro') || l.details.includes('Suburban') || l.details.includes('Vehicle'))
    );

    const vegMealsCount = currentLogs.filter(
      l => l.category === 'food' && 
      (l.details.includes('Vegan') || l.details.includes('Vegetarian'))
    ).length;

    const hasSolarCredit = currentLogs.some(
      l => l.category === 'energy' && l.details.includes('Solar')
    );

    const digitalLogsCount = currentLogs.filter(l => l.category === 'digital').length;

    // Derived updates
    const updatedBadges = badges.map(b => {
      if (b.unlockedAt !== null) return b; // already unlocked

      let unlockConditionMet = false;
      if (b.id === 'green_commuter' && (totalTransitKm >= 50 || isEcoTransit)) unlockConditionMet = true;
      if (b.id === 'plant_hero' && vegMealsCount >= 3) unlockConditionMet = true;
      if (b.id === 'energy_saver' && hasSolarCredit) unlockConditionMet = true;
      if (b.id === 'digital_minimalist' && digitalLogsCount >= 3) unlockConditionMet = true;

      // Overall dynamic carbon hero grade check
      const todayStr = new Date().toISOString().substring(0, 10);
      const todayTotal = currentLogs
        .filter(l => l.timestamp.substring(0, 10) === todayStr)
        .reduce((sum, l) => sum + l.co2, 0);
      const scoreObj = calculateEcoScore(todayTotal);
      if (b.id === 'zero_champion' && scoreObj.score >= 85 && currentLogs.length >= 5) unlockConditionMet = true;

      if (unlockConditionMet) {
        triggerToast(`🏆 Award Unlocked: ${b.title}!`, 'badge');
        return {
          ...b,
          unlockedAt: new Date().toISOString()
        };
      }
      return b;
    });

    setBadges(updatedBadges);
  };

  // Standalone Single File Downloader triggered inside React SPA
  const handleExportStandaloneApp = () => {
    if (!profile) return;
    const compiledString = generateStandaloneHTML(logs, profile);
    const blob = new Blob([compiledString], { type: 'text/html' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'EcoPulse_Carbon_Tracker_Dashboard.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    triggerToast("💾 Portable Standalone HTML compiled and downloaded!", "info");
  };

  // Combined scoregrade calculation
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayTotal = logs
    .filter(l => l.timestamp.substring(0, 10) === todayStr)
    .reduce((sum, l) => sum + l.co2, 0);
  const scoreObj = calculateEcoScore(todayTotal);

  // Compute total Co2 saved via solar or public transport decisions compared to a standard car
  const totalCleanTransitSaved = logs
    .filter(l => l.category === 'transport' && (l.details.includes('Metro') || l.details.includes('Suburban') || l.details.includes('Bus')))
    .reduce((sum, l) => sum + (l.amount * 0.18 - l.co2), 0); // standard car avg (180g) minus metro co2

  const solarOffsetCredit = Math.abs(
    logs.filter(l => l.category === 'energy' && l.co2 < 0).reduce((sum, l) => sum + l.co2, 0)
  );

  const totalCarbonOffsetCalculated = totalCleanTransitSaved + solarOffsetCredit;

  return (
    <div className="min-h-screen text-slate-100 font-sans antialiased bg-gradient-to-br from-[#061a14] to-[#060b1a] flex flex-col relative overflow-hidden">
      
      {/* Decorative pulse blur vectors */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[50%] rounded-full bg-[#00FF87]/10 filter blur-[120px] pointer-events-none animate-pulse-slow z-0"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[#0096FF]/10 filter blur-[120px] pointer-events-none animate-pulse-slow-reverse z-0"></div>

      <AnimatePresence mode="wait">
        {loading ? (
          /* PREMIUM HYDRATING SCREEN LOADER */
          <motion.div
            key="loader"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center h-screen z-10"
            id="loading_screen"
          >
            <div className="relative w-24 h-24 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#00FF87]/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-dashed border-[#0096FF]/20"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[#061a14]/80 rounded-full backdrop-blur-md">
                <Leaf className="w-8 h-8 text-neon-green animate-pulse" />
              </div>
            </div>

            <h3 className="font-display text-2xl font-extrabold tracking-tight text-white mb-2">
              EcoPulse <span className="text-neon-green">Energy Control</span>
            </h3>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
              Calibrating Standard Emission Benchmarks ...
            </p>
          </motion.div>
        ) : !profile ? (
          /* ONBOARDING ENTRY FLOW */
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 z-10"
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        ) : (
          /* MAIN WEB DASHBOARD COMPLETED */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 z-10 max-w-7xl mx-auto px-4 py-6 md:py-8 w-full flex flex-col justify-between"
          >
            
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-neon-green to-electric-blue p-0.5 shadow-[0_0_20px_rgba(0,255,135,0.4)] flex items-center justify-center">
                  <div className="w-full h-full bg-[#061a14] rounded-2xl flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-neon-green" />
                  </div>
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">EcoPulse</h1>
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-electric-blue" /> Carbon Footprint Awareness
                  </span>
                </div>
              </div>

              {/* Steward Bio badge */}
              <div id="bio_status_pills" className="flex items-center gap-3">
                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-200 block">Steward: {profile.name}</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wide">
                    {profile.city.toUpperCase()} | {profile.lifestyle}
                  </span>
                </div>
                <div className="h-9 w-px bg-white/10 hidden sm:block"></div>
                <ShareCard
                  profile={profile}
                  ecoScore={scoreObj.score}
                  grade={scoreObj.grade}
                  badges={badges}
                  totalSavedCo2={totalCarbonOffsetCalculated}
                />
              </div>
            </header>

            {/* INTERACTIVE COMPONENT GRID LAYOUT */}
            <main className="space-y-8 flex-1">
              
              {/* Row 1: Dashboard circle stats & Activity Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-4">
                  <SmartDashboard
                    logs={logs}
                    profile={profile}
                    weeklyChallenges={challenges}
                    onRollChallenge={() => triggerToast("Loading new focus contexts")}
                  />
                </div>
                
                <div className="lg:col-span-8">
                  <ActivityLogger onLog={handleAddNewLog} />
                </div>
              </div>

              {/* Row 2: Custom SVG high-performance AnalyticsCharts */}
              <AnalyticsCharts logs={logs} />

              {/* Row 3: Stewardship Badges Milestone Panel */}
              <BadgesSect badges={badges} />

              {/* Row 4: AI Insights local tips based on Highest emitting Category */}
              <InsightsPanel logs={logs} profile={profile} />

              {/* Row 5: Logs Historical review items */}
              <LogHistory logs={logs} onRemove={handleRemoveLog} onClear={handleClearAllData} />

            </main>

            {/* SAAS PORTABLE EXPORTS BAR FOOTER */}
            <footer className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-neon-green" /> 
                <span>EcoPulse Carbon Engine — Built for a Sustainable Future</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportStandaloneApp}
                id="export_html_button"
                className="w-full sm:w-auto h-11 bg-gradient-to-r from-blue-500 to-electric-blue text-white font-bold font-display text-xs px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 hover:shadow-blue-500/15 transition-all text-center"
              >
                <Save className="w-4 h-4" /> Download Standalone Portable HTML Application (.html)
              </motion.button>
            </footer>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST POPUPS STACK */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              className="p-4 rounded-xl border border-white/10 bg-slate-950/95 text-white text-xs shadow-2xl flex items-start gap-2.5 pointer-events-auto cursor-pointer border-l-4 border-l-neon-green alert max-w-[320px]"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              <div className="p-1 rounded-md bg-neon-green/10 text-neon-green border border-neon-green/20">
                {toast.type === 'badge' ? <Award className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-neon-green" />}
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="font-bold text-[11px] font-display text-white">
                  {toast.type === 'badge' ? 'Milestone Unlocked!' : toast.type === 'info' ? 'System Notice' : 'Activity Recorded'}
                </p>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">{toast.msg}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
