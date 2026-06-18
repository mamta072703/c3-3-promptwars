/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { UserProfile } from '../types';
import { Sparkles, MapPin, User, GraduationCap, Briefcase, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('mumbai');
  const [lifestyle, setLifestyle] = useState<'student' | 'professional' | 'homemaker'>('student');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      city,
      lifestyle,
      onboarded: true
    });
  };

  return (
    <div id="onboarding_box" className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel w-full max-w-lg rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl"
      >
        {/* Ambient background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-neon-green/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-electric-blue/10 blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-neon-green to-electric-blue p-0.5 shadow-lg shadow-neon-green/20 mb-4"
          >
            <div className="w-full h-full bg-[#061a14] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-neon-green" />
            </div>
          </motion.div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-[#00FF87] to-[#0096FF] bg-clip-text text-transparent">EcoPulse</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Discover and curb your everyday carbon footprint. Let's calibrate your daily dashboard based on your personal lifestyle and locale.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="onboard_name_input" className="block text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-2 flex items-center gap-2 cursor-pointer">
              <User className="w-3.5 h-3.5 text-neon-green" /> Your Name
            </label>
            <input
              type="text"
              required
              id="onboard_name_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#060b1a]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
              placeholder="What should we call you?"
            />
          </div>

          <div>
            <label htmlFor="onboard_city_select" className="block text-[11px] font-mono tracking-widest text-[#0096FF] uppercase mb-2 flex items-center gap-2 cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-electric-blue" /> Your City / Region
            </label>
            <select
              id="onboard_city_select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#060b1a]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
            >
              <option value="mumbai">Mumbai, Maharashtra (Suburban trains / BEST)</option>
              <option value="delhi">Delhi / NCR (Solar Metro network / High-Grid AC)</option>
              <option value="pune">Pune, Maharashtra (Hills protection / Rooftop solar)</option>
              <option value="bangalore">Bangalore, Karnataka (IT express / Moderate temps)</option>
              <option value="chennai">Chennai, Tamil Nadu (Coastal cool roof / MRTS)</option>
              <option value="hyderabad">Hyderabad, Telangana (Gachibowli solar adoption)</option>
              <option value="other">Other City (Standard India calculations factor)</option>
            </select>
          </div>

          <div>
            <span className="block text-[11px] font-mono tracking-widest text-[#0096FF] uppercase mb-2">
              My Lifestyle Segment
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                id="select_student"
                onClick={() => setLifestyle('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  lifestyle === 'student'
                    ? 'border-neon-green bg-neon-green/10 text-white shadow-lg shadow-neon-green/5'
                    : 'border-white/5 bg-slate-950/20 text-slate-400 hover:border-white/15'
                }`}
              >
                <GraduationCap className={`w-6 h-6 mb-1.5 ${lifestyle === 'student' ? 'text-neon-green' : ''}`} />
                <span className="text-xs font-bold font-display">Student</span>
                <span className="text-[10px] text-slate-500 mt-0.5 leading-none">High Transit</span>
              </button>

              <button
                type="button"
                id="select_professional"
                onClick={() => setLifestyle('professional')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  lifestyle === 'professional'
                    ? 'border-neon-green bg-neon-green/10 text-white shadow-lg shadow-neon-green/5'
                    : 'border-white/5 bg-slate-950/20 text-slate-400 hover:border-white/15'
                }`}
              >
                <Briefcase className={`w-6 h-6 mb-1.5 ${lifestyle === 'professional' ? 'text-neon-green' : ''}`} />
                <span className="text-xs font-bold font-display">Employee</span>
                <span className="text-[10px] text-slate-500 mt-0.5 leading-none">High Digital</span>
              </button>

              <button
                type="button"
                id="select_homemaker"
                onClick={() => setLifestyle('homemaker')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  lifestyle === 'homemaker'
                    ? 'border-neon-green bg-neon-green/10 text-white shadow-lg shadow-neon-green/5'
                    : 'border-white/5 bg-slate-950/20 text-slate-400 hover:border-white/15'
                }`}
              >
                <Home className={`w-6 h-6 mb-1.5 ${lifestyle === 'homemaker' ? 'text-neon-green' : ''}`} />
                <span className="text-xs font-bold font-display">Homemaker</span>
                <span className="text-[10px] text-slate-500 mt-0.5 leading-none">High Energy</span>
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            id="onboard_submit"
            className="w-full h-11 bg-gradient-to-r from-neon-green to-electric-blue hover:opacity-95 text-slate-950 font-bold font-display text-sm rounded-xl cursor-pointer shadow-lg shadow-neon-green/15 transition-all mt-4"
          >
            Launch EcoPulse Dashboard 🚀
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
