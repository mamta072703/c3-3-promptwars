/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ActivityLog } from '../types';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsChartsProps {
  logs: ActivityLog[];
}

export default function AnalyticsCharts({ logs }: AnalyticsChartsProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // 1. WEEKLY BAR GRAPH COMPILATION
  // Get last 7 days including today
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const isoStr = d.toISOString().substring(0, 10);
    // Sum logs on this specific calendar day
    const sum = logs
      .filter(l => l.timestamp.substring(0, 10) === isoStr)
      .reduce((acc, curr) => acc + Math.max(0, curr.co2), 0); // exclude negative solar credits on chart heights for scaling
    
    // dayIndex
    const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return {
      dateCode: isoStr,
      dayLabel: dayNames[dayIndex],
      co2: parseFloat(sum.toFixed(2))
    };
  });

  const maxWeeklyCo2 = Math.max(...last7DaysData.map(d => d.co2), 5); // scale threshold at least 5

  // 2. CATEGORY BREAKDOWN COMPILATION
  const categories: { name: string; key: ActivityLog['category']; color: string; hoverColor: string; emoji: string }[] = [
    { name: 'Transport', key: 'transport', color: '#00FF87', hoverColor: '#60a5fa', emoji: '🚗' },
    { name: 'Food', key: 'food', color: '#2dd4bf', hoverColor: '#14b8a6', emoji: '🥗' },
    { name: 'Energy', key: 'energy', color: '#facc15', hoverColor: '#eab308', emoji: '⚡' },
    { name: 'Shopping', key: 'shopping', color: '#f472b6', hoverColor: '#ec4899', emoji: '🛍️' },
    { name: 'Flights', key: 'flights', color: '#a78bfa', hoverColor: '#8b5cf6', emoji: '✈️' },
    { name: 'Digital', key: 'digital', color: '#38bdf8', hoverColor: '#0ea5e9', emoji: '📱' }
  ];

  const categoryShares = categories.map(cat => {
    const sum = logs
      .filter(l => l.category === cat.key)
      .reduce((acc, curr) => acc + Math.max(0, curr.co2), 0);
    return {
      ...cat,
      value: parseFloat(sum.toFixed(2))
    };
  });

  const totalShareSum = categoryShares.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Let's compute donut cumulative percentages for SVG paths
  let cumulativeAngle = 0;
  const donutSlices = categoryShares.map(slice => {
    const percentage = slice.value / totalShareSum;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    // SVG coordinates for arc representation
    const radius = 35;
    const center = 50;

    const getCoordinates = (degrees: number) => {
      const radians = (degrees - 90) * Math.PI / 180;
      return {
        x: center + radius * Math.cos(radians),
        y: center + radius * Math.sin(radians)
      };
    };

    const start = getCoordinates(startAngle);
    const end = getCoordinates(cumulativeAngle);
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Path command 'd'
    const pathData = percentage >= 0.999
      ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius}`
      : `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;

    return {
      ...slice,
      percentage,
      pathData,
      angle,
      valueStr: slice.value.toFixed(1)
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard_visual_charts">
      
      {/* CHART A: WEEKLY BAR GRAPH */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[11px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-electric-blue" /> Weekly Emissions Outlook
            </h4>
            <span className="text-[10px] text-[#0096FF] font-mono font-bold flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-400/20">
              <TrendingUp className="w-3 h-3" /> Live aggregates
            </span>
          </div>

          {/* SVG representation graph */}
          <div className="relative w-full h-[180px] mt-4 flex items-end justify-between px-2">
            
            {/* Grid Line rules background */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-[25px]">
              <div className="border-t border-white/5 w-full h-0 select-none"></div>
              <div className="border-t border-white/5 w-full h-0 select-none"></div>
              <div className="border-t border-white/5 w-full h-0 select-none"></div>
            </div>

            {last7DaysData.map((day, idx) => {
              const rectHeight = (day.co2 / maxWeeklyCo2) * 120; // safe scale capping
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={day.dateCode}
                  className="flex flex-col items-center flex-1 relative group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Interactive Tooltip bubble */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: -5 }}
                      className="absolute bottom-[100%] mb-1 z-20 bg-slate-950/95 border border-white/10 px-2.5 py-1.5 rounded-lg text-center shadow-2xl text-[10px]"
                    >
                      <span className="text-white block font-semibold">{day.co2.toFixed(1)} kg CO₂</span>
                      <span className="text-slate-500 font-mono text-[9px]">{day.dateCode}</span>
                    </motion.div>
                  )}

                  {/* Rectangle block */}
                  <div className="w-8 sm:w-10 bg-slate-900/30 rounded-t-lg h-[130px] flex items-end relative overflow-hidden">
                    <motion.div
                      style={{ height: `${Math.max(4, rectHeight)}px` }}
                      initial={false}
                      animate={{ height: `${Math.max(4, rectHeight)}px` }}
                      transition={{ duration: 0.6 }}
                      className={`w-full rounded-t-md transition-colors ${
                        isHovered
                          ? 'bg-gradient-to-t from-electric-blue to-cyan-400 shadow-lg shadow-electric-blue/15'
                          : 'bg-gradient-to-t from-sky-950 to-electric-blue/40'
                      }`}
                    />
                  </div>

                  {/* Day Label text */}
                  <span className="text-[10px] font-mono text-slate-400 mt-2 font-semibold">
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHART B: CATEGORICAL SHARE DONUT */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[11px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1">
              <PieChart className="w-4 h-4 text-neon-green" /> Category Distribution share
            </h4>
            <span className="text-[10px] text-neon-green font-mono font-bold bg-neon-green/10 px-20.5 px-2 py-0.5 rounded-md border border-neon-green/20">
              % carbon load
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            
            {/* Donut Chart SVG */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="11" fill="transparent" />
                {donutSlices.map((slice) => {
                  if (slice.value <= 0) return null;
                  const isHovered = hoveredSlice === slice.key;

                  return (
                    <motion.path
                      key={slice.key}
                      onClick={() => setHoveredSlice(slice.key)}
                      onMouseEnter={() => setHoveredSlice(slice.key)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      d={slice.pathData}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? "14" : "11"}
                      className="cursor-pointer transition-all duration-200"
                      initial={{ strokeDasharray: 220, strokeDashoffset: 220 }}
                      animate={{ strokeDasharray: 220, strokeDashoffset: 0 }}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Centered slice detail display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {hoveredSlice ? (
                  <>
                    <span className="text-lg">
                      {categories.find(c => c.key === hoveredSlice)?.emoji}
                    </span>
                    <span className="text-[11px] font-display font-semibold text-white">
                      {categories.find(c => c.key === hoveredSlice)?.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neon-green">
                      {((categoryShares.find(c => c.key === hoveredSlice)?.value || 0) / totalShareSum * 100).toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🍂</span>
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wide">Report Summary</span>
                    <span className="text-[11px] text-slate-300 font-bold mt-1">
                      {totalShareSum.toFixed(1)} kg total
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Explanatory Legend indexes */}
            <div className="space-y-2">
              {categoryShares.map(slice => {
                const isHovered = hoveredSlice === slice.key;
                return (
                  <div
                    key={slice.key}
                    className={`flex items-center justify-between p-1 rounded-lg transition-colors cursor-pointer ${
                      isHovered ? 'bg-white/5' : ''
                    }`}
                    onMouseEnter={() => setHoveredSlice(slice.key)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                      <span className="text-[11px] font-medium text-slate-300">
                        {slice.emoji} {slice.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {slice.value.toFixed(1)} kg
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
