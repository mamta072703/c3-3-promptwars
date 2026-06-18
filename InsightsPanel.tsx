/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityLog, UserProfile } from '../types';
import { CITIES_DATA } from '../data';
import { Compass, ShieldCheck, TreePine, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

interface InsightsPanelProps {
  logs: ActivityLog[];
  profile: UserProfile;
}

export default function InsightsPanel({ logs, profile }: InsightsPanelProps) {
  // Find highest category
  const categorySums = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
    flights: 0,
    digital: 0
  };

  logs.forEach(l => {
    categorySums[l.category] += l.co2;
  });

  let highestCategory = 'transport';
  let highestSum = categorySums.transport;

  Object.entries(categorySums).forEach(([cat, sum]) => {
    if (sum > highestSum) {
      highestSum = sum;
      highestCategory = cat;
    }
  });

  const cityConfig = CITIES_DATA[profile.city] || CITIES_DATA.other;
  const yearlyPace = highestSum * 365 / 1000; // estimated yearly tonnes

  let categoryTitle = "Clean Transit Mobility";
  let categoryTip = cityConfig.transportTip;

  if (highestCategory === 'food') {
    categoryTitle = "Smart Plate & Millet Ecology";
    categoryTip = "Switching heavy dairy products, paneer, and mutton meals to healthy millet (Ragi, Jowar) mixes or legume-based plant bowls drops meal overhead by up to 60%! Grains grown locally in Maharashtra & Karnataka require 14x less water and carbon.";
  } else if (highestCategory === 'energy') {
    categoryTitle = "BEE Star-Rating Optimization";
    categoryTip = cityConfig.altEnergyTip;
  } else if (highestCategory === 'shopping') {
    categoryTitle = "Packaging-Free Circularity";
    categoryTip = "Online ordering wraps small items in excessive cardboard and bubble wrap. Try buying locally from traditional bazaars in your neighborhood or look for certified plastic-net neutrality.";
  } else if (highestCategory === 'flights') {
    categoryTitle = "Aviation Offsets & Direct Lines";
    categoryTip = "Jets dump massive CO2 directly into the stratosphere. Combine business flights or co-fund biogas schemes and solar installations through certified credit platforms standard in Punjab/Tamil Nadu.";
  } else if (highestCategory === 'digital') {
    categoryTitle = "Green Bytes & Ambient Screens";
    categoryTip = "Large servers serving Netflix and cloud processing consume vast amounts of state energy. Set default resolutions to 1080p, bypass unnecessary complex AI chatbots prompts, and unplug power banks.";
  }

  // Calculate banyan canopy equivalent
  // 1 mature Banyan tree can process around 22 kg of CO2 per year
  const banyanTreesNeeded = Math.ceil((highestSum * 365) / 22);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden" id="insights_section">
      <div className="absolute top-0 right-0 w-48 h-48 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-neon-green" /> AI Climate Audit & Local Insights
          </h3>
          <p className="text-xs text-slate-400">Custom recommendations based on {cityConfig.name} standards and lifestyle segment</p>
        </div>
        <span className="px-3 py-1 text-[10px] font-mono rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20 uppercase tracking-wider font-semibold">
          {highestCategory} audit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Dynamic Tip Panel */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-ping"></div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#00FF87]">{cityConfig.name} Focus Area</span>
            </div>
            <h4 className="font-display font-bold text-lg text-white">{categoryTitle}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{categoryTip}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h5 className="font-bold font-display text-white mb-0.5">VS National Trajectory</h5>
                <p className="text-slate-400 leading-relaxed">
                  Your pace of {highestCategory} emits <span className="text-white font-semibold font-mono">{yearlyPace.toFixed(2)}t</span> CO2/year. India average is <span className="text-neon-green font-semibold">1.9t</span> limit.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                <TreePine className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h5 className="font-bold font-display text-white mb-0.5">Banyan Tree Equivalent</h5>
                <p className="text-slate-400 leading-relaxed">
                  Compensating this log overhead requires planting <span className="text-[#00FF87] font-semibold font-mono">{banyanTreesNeeded}</span> mature Banyan trees to offset it for a year.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Offset Opportunity Box */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/15 via-emerald-900/5 to-transparent border border-emerald-500/15 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          {/* subtle pattern */}
          <div className="absolute inset-0 bg-grid opacity-5"></div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono uppercase text-slate-300">Audited India Offsets</span>
            </div>
            <h4 className="font-display font-bold text-base text-white mb-2">Fund Native Reforestation</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Directly sponsor community banyan, neem, or mango plantations across dry zones in Maharashtra & Gujarat with registered ESG-accredited platforms.
            </p>
          </div>

          <motion.a
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            href="https://sankalptaru.org"
            target="_blank"
            rel="noreferrer"
            className="relative w-full h-10 mt-2 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-bold font-display text-[11px] rounded-xl flex items-center justify-center gap-1 shadows cursor-pointer"
          >
            Interact with SankalpTaru Portal 🔗
          </motion.a>
        </div>

      </div>
    </div>
  );
}
