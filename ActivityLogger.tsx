/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { ActivityCategory, ActivityLog } from '../types';
import { calculateCO2, getComparativeFact } from '../utils';
import { Car, Utensils, Zap, ShoppingBag, Plane, Cpu, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityLoggerProps {
  onLog: (log: ActivityLog) => void;
}

// Subcategory configuration driving fields
const SUBCATEGORIES = {
  transport: [
    { val: "petrol_car", label: "Petrol Sedan", unit: "km", defaultAmt: 15, max: 100 },
    { val: "diesel_car", label: "Diesel SUV", unit: "km", defaultAmt: 15, max: 100 },
    { val: "electric_car", label: "Electric Vehicle (EV)", unit: "km", defaultAmt: 20, max: 200 },
    { val: "two_wheeler", label: "Scooter / Motorcycle", unit: "km", defaultAmt: 10, max: 80 },
    { val: "auto_rickshaw", label: "Auto-Rickshaw Ride", unit: "km", defaultAmt: 5, max: 50 },
    { val: "metro_train", label: "Delhi/Namma Metro", unit: "km", defaultAmt: 15, max: 80 },
    { val: "local_train", label: "Suburban train (Local)", unit: "km", defaultAmt: 20, max: 100 },
  ],
  food: [
    { val: "vegan", label: "Vegan Meal", unit: "meals", defaultAmt: 1, max: 5 },
    { val: "vegetarian", label: "Vegetarian Portion (Paneer/Butter)", unit: "meals", defaultAmt: 1, max: 5 },
    { val: "dairy_eggs", label: "Dairy & Egg Rich Diet", unit: "meals", defaultAmt: 1, max: 5 },
    { val: "poultry_fish", label: "Chicken / Fish Delicacy", unit: "meals", defaultAmt: 1, max: 5 },
    { val: "heavy_meat", label: "Heavy Mutton / Red Meat portion", unit: "meals", defaultAmt: 1, max: 4 }
  ],
  energy: [
    { val: "electricity_kwh", label: "Grid Electricity usage", unit: "kWh", defaultAmt: 10, max: 50 },
    { val: "ac_hour", label: "Air Conditioner running", unit: "hours", defaultAmt: 4, max: 24 },
    { val: "lpg_day", label: "Stove LPG Cooking cycle", unit: "days", defaultAmt: 1, max: 5 },
    { val: "solar_credit", label: "Excess Rooftop Solar Offloaded", unit: "kWh", defaultAmt: 5, max: 30 }
  ],
  shopping: [
    { val: "clothing", label: "Fast Fashion / Garment", unit: "items", defaultAmt: 1, max: 10 },
    { val: "packaging_box", label: "Online Delivery cardboard/parcel", unit: "boxes", defaultAmt: 1, max: 10 },
    { val: "smartphone", label: "New Tech Device / Smart Phone", unit: "units", defaultAmt: 1, max: 3 },
    { val: "plastic_bottle", label: "Disposable Plastic Bottled Drink", unit: "bottles", defaultAmt: 2, max: 24 }
  ],
  flights: [
    { val: "domestic", label: "Domestic Flight (e.g. Mumbai to Goa)", unit: "hours", defaultAmt: 2, max: 12 },
    { val: "international", label: "International flight journey", unit: "hours", defaultAmt: 6, max: 24 }
  ],
  digital: [
    { val: "streaming_hd", label: "HD Video Streaming (Netflix/YouTube)", unit: "hours", defaultAmt: 2, max: 12 },
    { val: "ai_prompt", label: "Complex AI query prompts", unit: "queries", defaultAmt: 15, max: 100 },
    { val: "video_call", label: "High-Quality Zoom/Team meeting", unit: "hours", defaultAmt: 1, max: 8 }
  ]
};

export default function ActivityLogger({ onLog }: ActivityLoggerProps) {
  const [category, setCategory] = useState<ActivityCategory>('transport');
  const [subItem, setSubItem] = useState('');
  const [amount, setAmount] = useState<number>(10);
  const [co2Impact, setCo2Impact] = useState(0);

  // Sync default values when switching category
  useEffect(() => {
    const list = SUBCATEGORIES[category];
    const first = list[0];
    setSubItem(first.val);
    setAmount(first.defaultAmt);
  }, [category]);

  // Recalculate preview CO2 real-time
  useEffect(() => {
    if (!subItem) return;
    const calc = calculateCO2(category, subItem, amount);
    setCo2Impact(calc.co2);
  }, [category, subItem, amount]);

  const activeCategoryList = SUBCATEGORIES[category];
  const activeSubItemObj = activeCategoryList.find(x => x.val === subItem) || activeCategoryList[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const calc = calculateCO2(category, subItem, amount);
    
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      category,
      amount,
      unit: activeSubItemObj.unit,
      co2: calc.co2,
      details: calc.label
    };

    onLog(newLog);
  };

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'transport': return <Car className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'flights': return <Plane className="w-4 h-4" />;
      case 'digital': return <Cpu className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat: ActivityCategory) => {
    switch (cat) {
      case 'transport': return 'text-neon-green bg-neon-green/10 border-neon-green/30';
      case 'food': return 'text-teal-400 bg-teal-400/10 border-teal-400/30';
      case 'energy': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'shopping': return 'text-pink-400 bg-pink-400/10 border-pink-400/30';
      case 'flights': return 'text-violet-400 bg-violet-400/10 border-violet-400/30';
      case 'digital': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Log New Sustenance</h3>
            <p className="text-xs text-slate-400">Record an activity to adjust your safe quota projection</p>
          </div>
          <span className="text-[10px] bg-slate-900 border border-white/5 font-mono text-slate-400 px-2 py-0.5 rounded-full">
            Local Calculator
          </span>
        </div>

        {/* Category selector capsules */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {(Object.keys(SUBCATEGORIES) as ActivityCategory[]).map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                id={`tab_${cat}`}
                onClick={() => setCategory(cat)}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-neon-green bg-gradient-to-tr from-neon-green/15 to-electric-blue/5 text-white active-tab scale-[1.02]'
                    : 'border-white/5 bg-slate-950/25 text-slate-400 hover:bg-slate-900/40 hover:border-white/10'
                }`}
              >
                <div className={`p-1.5 rounded-lg border border-white/5 transition-colors ${isActive ? 'bg-neon-green/15 text-neon-green-web' : 'bg-slate-950/40'}`}>
                  {getCategoryIcon(cat)}
                </div>
                <span className="text-[10px] font-display font-medium tracking-tight whitespace-nowrap">
                  {cat.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="logger_subitem_select" className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1.5 cursor-pointer">
                Activity Specifics
              </label>
              <select
                id="logger_subitem_select"
                value={subItem}
                onChange={(e) => {
                  setSubItem(e.target.value);
                  const found = SUBCATEGORIES[category].find(x => x.val === e.target.value);
                  if (found) setAmount(found.defaultAmt);
                }}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-neon-green transition-all"
              >
                {activeCategoryList.map(o => (
                  <option key={o.val} value={o.val} className="bg-slate-900 text-slate-200">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="logger_amount_slider" className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1.5 flex justify-between cursor-pointer">
                <span>Value Quantity</span>
                <span className="text-neon-green lowercase font-normal">
                  {amount} {activeSubItemObj?.unit}
                </span>
              </label>
              
              <div className="relative flex items-center gap-3">
                <input
                  type="range"
                  id="logger_amount_slider"
                  min={activeSubItemObj?.val === 'ai_prompt' ? 5 : 1}
                  max={activeSubItemObj?.max || 50}
                  step={category === 'transport' || category === 'digital' ? 1 : 0.5}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="flex-1 cursor-pointer"
                />
                <input
                  type="number"
                  id="logger_amount_number"
                  min={0.1}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-950/60 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs focus:outline-none focus:border-neon-green"
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={co2Impact + category}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-xl border border-white/5 bg-slate-950/30 flex items-start gap-3"
            >
              <div className={`p-1.5 rounded-lg border ${getCategoryColor(category)}`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs leading-relaxed">
                <span className="text-slate-400 font-sans block mb-0.5">Atmospheric Equivalencies:</span>
                <span className="font-semibold text-slate-200 block">
                  {co2Impact > 0 ? '+' : ''}{co2Impact.toFixed(3)} kg CO₂ emissions.
                </span>
                <span className="text-[11px] text-slate-400">
                  {getComparativeFact(co2Impact)}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            id="logger_log_button"
            className="w-full h-11 bg-gradient-to-r from-neon-green to-emerald-500 hover:opacity-95 text-slate-950 font-bold font-display text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-neon-green/10 hover:shadow-neon-green/15 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add to Daily Trajectory Balance
          </motion.button>
        </form>
      </div>
    </div>
  );
}
