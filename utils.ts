/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityCategory, ActivityLog, UserProfile, Badge, WeeklyChallenge } from './types';
import { EMISSION_FACTORS, CITIES_DATA } from './data';

// Computes CO2 based on category, specific type element, and quantity
export function calculateCO2(
  category: ActivityCategory,
  type: string,
  amount: number
): { co2: number; label: string } {
  let co2 = 0;
  let label = '';

  const factors = EMISSION_FACTORS[category] as Record<string, number>;
  const factor = factors[type] !== undefined ? factors[type] : 0;
  co2 = amount * factor;

  // Pretty labelling
  switch (category) {
    case 'transport':
      label = `${type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Transit (${amount} km)`;
      break;
    case 'food':
      label = `${type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Meal (${amount} serving${amount > 1 ? 's' : ''})`;
      break;
    case 'energy':
      if (type === 'solar_credit') {
        label = `Solar Excess Generated Benefit (-${amount} kWh)`;
      } else if (type === 'electricity_kwh') {
        label = `Grid Power Consumption (${amount} kWh)`;
      } else if (type === 'ac_hour') {
        label = `Air Conditioner Usage (${amount} hrs)`;
      } else {
        label = `LPG cylinder usage (${amount} unit)`;
      }
      break;
    case 'shopping':
      label = `Purchased ${type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} (${amount} qty)`;
      break;
    case 'flights':
      label = `${type.replace(/\b\w/g, c => c.toUpperCase())}-Haul Flight Travel (${amount} hrs)`;
      break;
    case 'digital':
      label = `${type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} (${amount} ${type === 'ai_prompt' ? 'queries' : 'hrs'})`;
      break;
  }

  return { co2: parseFloat(co2.toFixed(3)), label };
}

// Generate an equivalency sentence
export function getComparativeFact(co2Kg: number): string {
  const absCo2 = Math.abs(co2Kg);
  if (absCo2 < 0.01) return "Virtually zero carbon footprint. Excellent job!";

  // 1 tree absorbs ~0.06 kg of CO2 per day (22 kg per year)
  // 1 smartphone charge is ~0.008 kg. E.g. 1 kg CO2 = 125 charges
  // 1 lightbulb (60W) lit for 1 hr in India ~0.048 kg CO2 (at 0.8 kg/kWh)
  const trees = Math.round(absCo2 / 0.06);
  const smartphones = Math.round(absCo2 / 0.008);
  const lightbulbHours = Math.round(absCo2 / 0.048);
  const carKm = Math.round(absCo2 / 0.18); // 180g / km

  const facts = [
    `Equal to charging ${smartphones.toLocaleString()} smartphones!`,
    `Takes ${trees.toLocaleString()} mature trees a full 24 hours to offset.`,
    `Same as leaving a standard 60W lightbulb turned on for ${lightbulbHours.toLocaleString()} hours.`,
    `Equivalent to driving a medium petrol sedan for ${carKm.toLocaleString()} kilometers.`
  ];

  // Pick a fact based on size
  if (absCo2 < 0.5) {
    return facts[0]; // smartphones for tiny values
  } else if (absCo2 < 5) {
    return facts[2]; // lightbulbs for medium
  } else if (absCo2 < 20) {
    return facts[1]; // trees for significant
  } else {
    return facts[3]; // car ride for large
  }
}

// Calculate eco score out of 100
// Standard carbon safety target is 7.7 kg per day
export function calculateEcoScore(dailyEmissions: number): { score: number; grade: string; colorClass: string } {
  const safeDailyLimit = 7.7;
  
  // High score when below limit. Lower score as limit is breached.
  let score = 100;
  
  if (dailyEmissions > 0) {
    const ratio = dailyEmissions / safeDailyLimit;
    if (ratio <= 1) {
      // 100 to 80
      score = 100 - (ratio * 20);
    } else {
      // Бреaches limit, score drops. At 4x limit (30kg), score is around 20.
      score = Math.max(10, 80 - ((ratio - 1) * 20));
    }
  }
  
  const finalScore = Math.round(score);
  
  let grade = 'A+';
  let colorClass = 'text-neon-green border-neon-green/30';
  
  if (finalScore >= 95) {
    grade = 'A+';
    colorClass = 'text-emerald-400 border-emerald-400/30';
  } else if (finalScore >= 85) {
    grade = 'A';
    colorClass = 'text-neon-green border-neon-green/30';
  } else if (finalScore >= 75) {
    grade = 'B';
    colorClass = 'text-electric-blue border-electric-blue/30';
  } else if (finalScore >= 60) {
    grade = 'C';
    colorClass = 'text-yellow-400 border-yellow-400/30';
  } else if (finalScore >= 45) {
    grade = 'D';
    colorClass = 'text-orange-400 border-orange-400/30';
  } else {
    grade = 'F';
    colorClass = 'text-red-500 border-red-500/30';
  }
  
  return { score: finalScore, grade, colorClass };
}

// Generate the fully compilable and standalone HTML file content representing EcoPulse offline SaaS app
export function generateStandaloneHTML(logs: ActivityLog[], profile: UserProfile): string {
  const loggedEntriesJson = JSON.stringify(logs, null, 2);
  const userProfileJson = JSON.stringify(profile, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoPulse - Carbon Footprint Awareness</title>
  
  <!-- Tailwind CSS v3 Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'neon-green': '#00FF87',
            'electric-blue': '#0096FF',
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['Space Grotesk', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Chart.js CDN (required by task) -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  
  <style>
    /* Absolute defaults or offline fallbacks to prevent huge unstyled elements */
    html, body {
      background-color: #000000 !important;
      background: #000000 !important;
    }
    body {
      color: #f3f4f6;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Set maximum size bounds for any SVGs to prevent browser blowout before Tailwind loads */
    svg {
      max-width: 100%;
      height: auto;
    }

    .font-display {
      font-family: 'Space Grotesk', sans-serif;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .glass-panel {
      background: rgba(6, 26, 20, 0.45);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }

    .glass-panel-light {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .neon-border-green {
      border-color: rgba(0, 255, 135, 0.2);
    }
    .neon-border-green:hover {
      border-color: rgba(0, 255, 135, 0.5);
      box-shadow: 0 0 15px rgba(0, 255, 135, 0.15);
    }

    .pulse-glow {
      animation: pulse-glow-ani 2s infinite ease-in-out;
    }
    @keyframes pulse-glow-ani {
      0%, 100% { box-shadow: 0 0 8px rgba(0, 255, 135, 0.2); }
      50% { box-shadow: 0 0 20px rgba(0, 255, 135, 0.5); }
    }

    input[type="range"] {
      accent-color: #00FF87;
    }
  </style>
</head>
<body class="p-0 m-0 bg-black text-white">

  <!-- Background Blur Orbs -->
  <div class="fixed top-[-20%] left-[-15%] w-[60%] h-[50%] rounded-full bg-[#00FF87]/10 filter blur-[120px] pointer-events-none z-0"></div>
  <div class="fixed bottom-[-15%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[#0096FF]/10 filter blur-[120px] pointer-events-none z-0"></div>

  <!-- Main Container -->
  <div class="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-10">
    
    <!-- HEADER -->
    <header class="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
      <div class="flex items-center gap-3">
        <!-- Pulse leaf logo -->
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00FF87] to-[#0096FF] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.4)]">
          <div class="w-full h-full bg-[#061a14] rounded-2xl flex items-center justify-center">
            <svg class="w-5 h-5 text-[#00FF87]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z"></path>
              <path d="M9 22v-4h4"></path>
            </svg>
          </div>
        </div>
        <div>
          <h1 class="font-display text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#00FF87] to-[#0096FF] bg-clip-text text-transparent">EcoPulse</h1>
          <span class="text-[10px] text-slate-400 font-mono tracking-widest uppercase block mt-0.5">Carbon Footprint Awareness</span>
        </div>
      </div>
      
      <div id="userInfoHeader" class="hidden text-right">
        <p class="text-sm font-semibold text-white" id="userNameLabel"></p>
        <p class="text-[10px] text-slate-400 font-mono uppercase tracking-wide" id="userCityLabel"></p>
      </div>
    </header>

    <!-- LOADING SCREEN -->
    <div id="loaderScreen" class="glass-panel rounded-3xl p-12 text-center my-12 max-w-lg mx-auto">
      <div class="relative w-20 h-20 mx-auto mb-6">
        <div class="absolute inset-0 rounded-full border-4 border-emerald-500/10"></div>
        <div class="absolute inset-0 rounded-full border-4 border-t-[#00FF87] border-r-[#0096FF] animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-[#00FF87] text-2xl">🌍</span>
        </div>
      </div>
      <h3 class="font-display text-2xl font-semibold mb-2">Powering up EcoPulse</h3>
      <p class="text-slate-400 text-sm">Calibrating carbon factors for your locale...</p>
    </div>

    <!-- ONBOARDING FORM -->
    <div id="onboardingScreen" class="hidden glass-panel rounded-3xl p-8 md:p-12 mb-12 max-w-lg mx-auto shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 right-0 p-8" style="opacity: 0.03;">
        <svg style="width: 120px; height: 120px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
      </div>
      
      <h2 class="font-display text-3xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Hello Planet Steward!</h2>
      <p class="text-slate-300 text-sm mb-6 leading-relaxed">Let's craft your personalized green dashboard. Your daily CO2 emission target is capped at India's safe average trajectory.</p>
      
      <form id="onboardingForm" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2 font-mono">Your Full Name</label>
          <input type="text" id="onboardName" required class="w-full bg-[#061a14]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00FF87] transition-all" placeholder="Enter first name">
        </div>
        
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2 font-mono">Select Location / City</label>
          <select id="onboardCity" class="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FF87] transition-all">
            <option value="mumbai">Mumbai, Maharashtra (Local rail, BEST buses)</option>
            <option value="delhi">Delhi / NCR (Highly integrated Metro network)</option>
            <option value="pune">Pune, Maharashtra (Hill conservation, solar grids)</option>
            <option value="bangalore">Bangalore, Karnataka (IT hubs, Namma metro)</option>
            <option value="chennai">Chennai, Tamil Nadu (Coastal cool roofs, electric scooters)</option>
            <option value="hyderabad">Hyderabad, Telangana (Gachibowli, Solar rooftops)</option>
            <option value="other">Other City (Standard India calculation basis)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2 font-mono">My Lifestyle Segment</label>
          <div class="grid grid-cols-3 gap-3">
            <label class="cursor-pointer">
              <input type="radio" name="lifestyle" value="student" checked class="sr-only peer">
              <div class="peer-checked:bg-[#00FF87]/10 peer-checked:border-[#00FF87] border border-white/10 rounded-xl p-3 text-center transition-all bg-slate-950/25">
                <span class="block text-lg mb-1">🎓</span>
                <span class="text-xs font-bold font-display">Student</span>
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="lifestyle" value="professional" class="sr-only peer">
              <div class="peer-checked:bg-[#00FF87]/10 peer-checked:border-[#00FF87] border border-white/10 rounded-xl p-3 text-center transition-all bg-slate-950/25">
                <span class="block text-lg mb-1">💻</span>
                <span class="text-xs font-bold font-display">Professional</span>
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="lifestyle" value="homemaker" class="sr-only peer">
              <div class="peer-checked:bg-[#00FF87]/10 peer-checked:border-[#00FF87] border border-white/10 rounded-xl p-3 text-center transition-all bg-slate-950/25">
                <span class="block text-lg mb-1">🏡</span>
                <span class="text-xs font-bold font-display">Homemaker</span>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-[#00FF87] to-[#0096FF] text-slate-950 font-bold font-display py-3 rounded-xl hover:opacity-90 filter transition-all cursor-pointer">
          Establish My Dashboard
        </button>
      </form>
    </div>

    <!-- MAIN DASHBOARD CONTENT (Initially hidden) -->
    <div id="dashboardArea" class="hidden space-y-8">
      
      <!-- GRID 1: COMPRESSION / STATUS CIRCLE -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- CIRCULAR SCORECARD AND STREAK -->
        <div class="md:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-sm font-semibold tracking-wide uppercase text-slate-400 font-mono">Daily Safe Status</h3>
            <span class="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 font-mono" id="streakLabel">🔥 Streak: 0d</span>
          </div>

          <!-- Circular Ring Component -->
          <div class="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <!-- Grid path -->
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.04)" stroke-width="8" fill="transparent"></circle>
              <!-- Filled ring -->
              <circle id="dailyProgressRing" cx="50" cy="50" r="40" stroke="#00FF87" stroke-width="8" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="180" class="transition-all duration-700"></circle>
            </svg>
            
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-display font-extrabold" id="dailyCo2Text">0.0</span>
              <span class="text-[10px] text-slate-400 tracking-wide font-mono uppercase">kg CO₂ / Day</span>
              <span class="text-[10px] text-[#00FF87] tracking-tighter" id="safeQuotaComparison">Under limit</span>
            </div>
          </div>

          <!-- Score Card Grade -->
          <div class="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
            <div>
              <p class="text-xs text-slate-400 font-mono">EcoScore & Rating</p>
              <h4 class="text-lg font-bold font-display" id="ecoScoreRating">A+ Stable</h4>
            </div>
            <div class="w-10 h-10 rounded-full border border-[#00FF87]/20 flex items-center justify-center font-display text-xl font-bold bg-[#00FF87]/5" id="gradeBadge">
              A+
            </div>
          </div>
        </div>

        <!-- ACTIVITY TRACKER AND LOGGER SYSTEM -->
        <div class="md:col-span-8 glass-panel rounded-3xl p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="font-display text-xl font-bold">Log Today's Activities</h2>
              <p class="text-slate-400 text-xs">Instantly offset or log transit, digital streaming, or food footprints</p>
            </div>
            <span class="bg-[#00FF87]/15 text-[#00FF87] font-mono text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">Quick Factors</span>
          </div>

          <!-- Quick category pills -->
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
            <button onclick="switchLoggerCategory('transport')" id="tab_transport" class="logger-tab py-2.5 px-2 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer">
              <span>🚗</span> <span class="font-medium font-display">Transport</span>
            </button>
            <button onclick="switchLoggerCategory('food')" id="tab_food" class="logger-tab py-2.5 px-2 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer">
              <span>🥗</span> <span class="font-medium font-display">Food</span>
            </button>
            <button onclick="switchLoggerCategory('energy')" id="tab_energy" class="logger-tab py-2.5 px-2 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer">
              <span>⚡</span> <span class="font-medium font-display">Energy</span>
            </button>
            <button onclick="switchLoggerCategory('shopping')" id="tab_shopping" class="logger-tab py-2.5 px-2 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer">
              <span>🛍️</span> <span class="font-medium font-display">Shopping</span>
            </button>
            <button onclick="switchLoggerCategory('flights')" id="tab_flights" class="logger-tab py-2.5 px-2 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer">
              <span>✈️</span> <span class="font-medium font-display">Flights</span>
            </button>
            <button onclick="switchLoggerCategory('digital')" id="tab_digital" class="logger-tab py-2.5 px-2 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer">
              <span>📱</span> <span class="font-medium font-display">Digital</span>
            </button>
          </div>

          <!-- Subform selectors based on active category -->
          <form id="activityForm" onsubmit="submitLoggedActivity(event)" class="space-y-4">
            <input type="hidden" id="loggerCategory" value="transport">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1 shadow-sm" id="subitemLabel">Transit Mode</label>
                <select id="loggerSubItem" class="w-full bg-slate-950/60 border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF87] transition-all">
                  <!-- Injected dynamically -->
                </select>
              </div>
              
              <div>
                <label class="block text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1" id="amountLabel">Distance in Km</label>
                <div class="relative">
                  <input type="number" id="loggerAmount" value="10" min="0.1" step="any" required class="w-full bg-slate-950/60 border border-white/15 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00FF87] transition-all">
                  <span class="absolute right-3 top-2.5 text-slate-400 text-xs font-mono" id="unitLabel">km</span>
                </div>
              </div>
            </div>

            <!-- COMPARISON PREVIEW INSIGHT -->
            <div class="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/10 flex items-center gap-3">
              <span class="text-xl">💡</span>
              <div class="text-xs">
                <span class="text-slate-400">Equivalent math: </span>
                <span class="font-semibold text-emerald-400" id="liveFactLabel">Estimating footprints ...</span>
              </div>
            </div>

            <!-- LOG ENTRY BUTTON -->
            <button type="submit" class="w-full bg-gradient-to-r from-[#00FF87] to-emerald-500 text-slate-950 hover:scale-[1.01] transition-transform font-bold font-display text-xs py-3 rounded-xl cursor-pointer">
              ➕ Save Log to Daily Balance
            </button>
          </form>
        </div>

      </div>

      <!-- GRID 2: INTERACTIVE CHARTS & GRAPHS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- CHART A: WEEKLY OUTLOOK -->
        <div class="glass-panel rounded-3xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-display font-bold text-sm tracking-wide uppercase text-slate-300">Weekly Tracker Outlook</h3>
            <span class="text-[10px] text-[#0096FF] font-mono">Chart.js Visual</span>
          </div>
          <div class="relative w-full h-56">
            <canvas id="weeklyBarChart"></canvas>
          </div>
        </div>

        <!-- CHART B: CATEGORICAL SHARE -->
        <div class="glass-panel rounded-3xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-display font-bold text-sm tracking-wide uppercase text-slate-300">Category Emission Share</h3>
            <span class="text-[10px] text-[#00FF87] font-mono">Donut Distribution</span>
          </div>
          <div class="relative w-full h-56 flex items-center justify-center">
            <canvas id="categoryDonutChart"></canvas>
          </div>
        </div>

      </div>

      <!-- GRID 3: GAMIFICATION & DEEPER METRICS -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- CHANNELS & BADGES -->
        <div class="md:col-span-7 glass-panel rounded-3xl p-6">
          <h3 class="font-display font-bold text-lg mb-4">Seward Badges Archive</h3>
          <p class="text-xs text-slate-400 mb-6">Uncover milestone awards by maintaining a low-footprint streak or making sustainable logs.</p>
          
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3" id="badgesDisplay">
            <!-- Badges dynamically pre-rendered -->
          </div>
        </div>

        <!-- CHALLENGE TICKER -->
        <div class="md:col-span-5 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-display font-bold text-base">Weekly Sustainable Goal</h3>
              <span class="text-[9px] font-bold font-mono uppercase bg-[#00FF87]/15 text-[#00FF87] px-2 py-0.5 rounded">Active</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4" id="challengeDescText">Try logging 3 vegetarian or vegan meals instead of meat/heavy dairy to protect resources!</p>
            
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between text-xs">
                <div>
                  <span class="font-bold inline-block text-emerald-400 font-mono" id="challengeProgressNum">0/3 Completed</span>
                </div>
                <div class="text-right text-slate-400 font-mono font-semibold" id="challengePercent">
                  0%
                </div>
              </div>
              <div class="overflow-hidden h-2 text-xs flex rounded bg-white/5">
                <div id="challengeProgressBar" style="width:0%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#00FF87] to-[#0096FF] transition-all duration-500"></div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-white/5 mt-4 flex justify-between items-center bg-slate-900/10">
            <div>
              <span class="block text-[10px] text-slate-400 uppercase font-mono tracking-wider">Reward Bonus</span>
              <span class="text-xs font-semibold text-[#00FF87]">+25 Steward Points</span>
            </div>
            <button onclick="rollNextChallenge()" class="text-xs bg-white/5 border border-white/10 hover:border-white/30 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
              Next Goal 🔄
            </button>
          </div>
        </div>

      </div>

      <!-- GRID 4: DYNAMIC LOCALIZED INTERACTIVE INSIGHTS -->
      <div class="glass-panel rounded-3xl p-6 md:p-8">
        <h3 class="font-display font-bold text-xl mb-2 flex items-center gap-2">
          <span>🧠</span> AI Climate Audit & Local Insights
        </h3>
        <p class="text-slate-400 text-xs mb-6">Specific tips customized to your profile and highest emission category</p>
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <!-- TIP CONTENT BOX -->
          <div class="md:col-span-8 space-y-4">
            <div id="primaryLocalTip" class="p-5 rounded-2xl bg-white/3 border border-white/5 space-y-3">
              <span class="inline-block text-[#00FF87] text-xs font-semibold uppercase tracking-wider font-mono">⚡ Urban Focus Sector</span>
              <h4 class="font-display text-lg font-bold" id="localTipTitle">Transportation Efficiency</h4>
              <p class="text-slate-300 text-sm leading-relaxed" id="localTipDesc">Tip loading...</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-slate-950/20 border border-white/5">
                <span class="text-lg">🇮🇳</span>
                <h5 class="text-xs font-bold font-display mt-2 mb-1">vs India Standard</h5>
                <p class="text-slate-300 text-xs" id="nationalComparisonText">Our carbon trajectory is 1.9 tonnes per year per person.</p>
              </div>
              <div class="p-4 rounded-xl bg-slate-950/20 border border-white/5">
                <span class="text-lg">🌳</span>
                <h5 class="text-xs font-bold font-display mt-2 mb-1">Banyan Canopy Equivalent</h5>
                <p class="text-slate-300 text-xs" id="banyanEquivalentText">Curing this offset requires planting young banyan trees.</p>
              </div>
            </div>
          </div>

          <!-- OFFSET DIRECTORY CARD -->
          <div class="md:col-span-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/15 to-emerald-900/5 border border-emerald-500/20 relative overflow-hidden">
            <h4 class="font-display font-bold text-base mb-2">Compensate / Offset In India</h4>
            <p class="text-xs text-slate-300 mb-4 leading-relaxed">Directly fund audited tree restoration schemes run by NGOs such as SankalpTaru, SayTrees or Grow-Trees on the soil of Maharashtra & Punjab.</p>
            
            <a href="https://sankalptaru.org" target="_blank" class="block w-full text-center bg-emerald-400 hover:bg-emerald-500 text-slate-950 py-2 rounded-xl text-xs font-bold transition-all mt-4">
              Explore Tree NGO Portal 🔗
            </a>
          </div>
        </div>
      </div>

      <!-- GRID 5: LOG HISTORY RECAP -->
      <div class="glass-panel rounded-3xl p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="font-display font-bold text-lg">Logged Activities Checklist</h3>
            <p class="text-xs text-slate-400">Chronological history stored locally in your web cache</p>
          </div>
          <button onclick="clearAllLoggedData()" class="text-xs text-red-400 bg-red-950/10 hover:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-500/10 transition-colors cursor-pointer">
            🗑️ Wipe Cache Data
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                <th class="py-3 px-2">Type</th>
                <th class="py-3 px-2">Details</th>
                <th class="py-3 px-2">Impact (kg CO₂)</th>
                <th class="py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody id="logsTableBody">
              <!-- Dynamically rendered -->
            </tbody>
          </table>
          
          <div id="noLogsPlaceholder" class="hidden text-center py-10">
            <span class="text-3xl block mb-2">🍃</span>
            <p class="text-slate-400 text-xs">No logged items. Choose options above to feed indicators!</p>
          </div>
        </div>
      </div>

      <!-- GLOBAL UTILITY: PORTABLE EXPORTS -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-white/5">
        <span class="text-xs text-slate-400 font-mono">System compiled on: June 2026</span>
        <button onclick="triggerAppZipExport()" class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-[#0096FF] font-display font-bold text-xs px-6 py-3 rounded-xl hover:scale-105 transition-all text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/15">
          💾 Download EcoPulse Standalone HTML file (For offline use)
        </button>
      </div>

    </div> <!-- END DASHBOARD AREA -->

  </div> <!-- END MAIN CONTAINER -->

  <!-- TOAST NOTIFICATION STACK -->
  <div id="toastStack" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"></div>

  <!-- CONFETTI CANVAS -->
  <div class="fixed inset-0 pointer-events-none z-50 overflow-hidden" id="confettiOverlay"></div>

  <!-- SCRIPTING FOR SYSTEM -->
  <script>
    // Injected current logs and profile from main app session
    let logs = ${loggedEntriesJson};
    let profile = ${userProfileJson};
    
    const EMISSION_FACTORS = {
      transport: {
        petrol_car: 0.18,
        diesel_car: 0.20,
        electric_car: 0.05,
        two_wheeler: 0.07,
        auto_rickshaw: 0.09,
        metro_train: 0.02,
        local_train: 0.015,
        bus_transit: 0.025
      },
      food: {
        vegan: 0.45,
        vegetarian: 0.95,
        dairy_eggs: 1.40,
        poultry_fish: 2.30,
        heavy_meat: 5.50
      },
      energy: {
        electricity_kwh: 0.82,
        ac_hour: 0.75,
        lpg_day: 1.25,
        solar_credit: -0.82
      },
      shopping: {
        clothing: 10.50,
        packaging_box: 0.85,
        smartphone: 55.00,
        plastic_bottle: 0.24
      },
      flights: {
        domestic: 130.00,
        international: 110.00
      },
      digital: {
        streaming_hd: 0.10,
        ai_prompt: 0.002,
        video_call: 0.06
      }
    };

    const CITIES_DATA = {
      mumbai: {
        name: "Mumbai",
        transportTip: "Take the iconic BEST electric buses or the local trains over private taxis. They represent some of the most power-efficient transit options in Maharashtra!",
        altEnergyTip: "Many Mumbai high-rises are adopting solar grid systems. Ask your housing society about rooftop net metering.",
        averageComp: "Your monthly carbon emissions are equivalent to driving the Bandra-Worli Sea Link 12 times."
      },
      delhi: {
        name: "Delhi",
        transportTip: "Swap driving for the clean, highly integrated Delhi Metro! Parts of the network run directly on solar energy generated at Rewa.",
        altEnergyTip: "Delhi's extreme summers push air conditioner loads. Set your temperature to 24°C to save 6-8% energy per degree.",
        averageComp: "Your monthly footprint is equivalent to the cooling energy needed for 4 entire residential cooling towers."
      },
      pune: {
        name: "Pune",
        transportTip: "Pune is expanding its dedicated cycle lanes around BMCC/JM road. Consider pedaling or take Pune Mahanagar Parivahan electric buses.",
        altEnergyTip: "Pune gets supreme solar insulation. Installing a solar water heater on your terrace pays off in less than 2 years!",
        averageComp: "Your emissions savings are equivalent to protecting the direct carbon sink of the beautiful Tekdi hills!"
      },
      bangalore: {
        name: "Bangalore",
        transportTip: "Use the Namma Metro for your office commute to avoid heavy gridlock and save over 80% emissions compared to single cabs.",
        altEnergyTip: "Take advantage of Bangalore's moderate climate—opening windows for cross-ventilation instead of running continuous fans or ACs.",
        averageComp: "Your monthly savings keep the Garden City clean and help prevent heavy urban-heat island traps."
      },
      chennai: {
        name: "Chennai",
        transportTip: "Hop onto the Chennai Suburban Railway or the MRTS. Share rides with app-based electric scooters for short-distance routes.",
        altEnergyTip: "To beat Chennai's coastal heat, apply cool-reflective white paint on your terrace to drop indoor temps by up to 5°C.",
        averageComp: "Your carbon reduction plays a direct role in minimizing local thermal pollution along the Coromandel Coast."
      },
      hyderabad: {
        name: "Hyderabad",
        transportTip: "Take the Hyderabad Metro Rail or TSRTC's new fleet of direct electric luxury airport buses.",
        altEnergyTip: "Hyderabad has immense solar potential. Check the solar rooftop subsidy with TSSPDCL to offset home energy completely.",
        averageComp: "Your carbon-saving journey keeps Hyderabad's historic rock formations and green zones clean!"
      },
      other: {
        name: "Other City",
        transportTip: "Opt for public electric buses, carpools, or walk/cycle for any distance under 2 kilometers.",
        altEnergyTip: "Switch to 5-star BEE rated appliances and ensure your geysers are turned off right after heating.",
        averageComp: "Every kilogram of CO2 you save helps India match its net-zero goals ahead of the 2070 target!"
      }
    };

    let badges = [
      { id: "green_commuter", title: "Eco Commuter", requirement: "transport", unlocked: false },
      { id: "plant_hero", title: "Plant-Based Ally", requirement: "food", unlocked: false },
      { id: "energy_saver", title: "Grid Guardian", requirement: "energy", unlocked: false },
      { id: "digital_minimalist", title: "Byte Sized Footprint", requirement: "digital", unlocked: false }
    ];

    let currentWeeklyChallengeIndex = 0;
    const weeklyChallenges = [
      { id: "chal_1", title: "Meatless Mondays commitment", desc: "Keep heavy meat logs to absolute zero and substitute with veggie/vegan meals." },
      { id: "chal_2", title: "Transit Switch Over", desc: "Choose Metro, railways, or clean electric walking for short transits." },
      { id: "chal_3", title: "Unplug High Consumption Electronics", desc: "Power down high-grid AC loads during night hours completely!" }
    ];

    let barChartInstance = null;
    let donutChartInstance = null;

    // Initialization routine
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.getElementById('loaderScreen').classList.add('hidden');
        
        // Load data from localStorage if exists
        const cachedProfile = localStorage.getItem('ecopulse_offline_profile');
        const cachedLogs = localStorage.getItem('ecopulse_offline_logs');
        
        if (cachedProfile) {
          profile = JSON.parse(cachedProfile);
        }
        if (cachedLogs) {
          logs = JSON.parse(cachedLogs);
        }
        
        if (profile && profile.onboarded) {
          showDashboard();
        } else {
          document.getElementById('onboardingScreen').classList.remove('hidden');
        }
      }, 1000);
    });

    // Handle onboarding submit
    document.getElementById('onboardingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('onboardName').value.trim();
      const city = document.getElementById('onboardCity').value;
      const lifestyle = document.querySelector('input[name="lifestyle"]:checked').value;
      
      profile = { name, city, lifestyle, onboarded: true };
      localStorage.setItem('ecopulse_offline_profile', JSON.stringify(profile));
      
      showToast("🌸 Welcome aboard, " + name + "! Setting up your grid dashboard...");
      showDashboard();
    });

    function showDashboard() {
      document.getElementById('onboardingScreen').classList.add('hidden');
      document.getElementById('dashboardArea').classList.remove('hidden');
      
      // Update Header
      document.getElementById('userInfoHeader').classList.remove('hidden');
      document.getElementById('userNameLabel').innerText = "Steward: " + profile.name;
      document.getElementById('userCityLabel').innerText = CITIES_DATA[profile.city].name + " | " + profile.lifestyle.toUpperCase();
      
      // Re-populate layout
      switchLoggerCategory('transport');
      recalculateAllData();
    }

    // Logger Tab Switcher
    const subCategories = {
      transport: [
        { val: "petrol_car", label: "Petrol Car", factor: "0.18 kg CO₂/km", unit: "km" },
        { val: "diesel_car", label: "Diesel Car", factor: "0.20 kg CO₂/km", unit: "km" },
        { val: "electric_car", label: "Electric Vehicle (EV)", factor: "0.05 kg CO₂/km", unit: "km" },
        { val: "two_wheeler", label: "Scooter / Motorcycle", factor: "0.07 kg CO₂/km", unit: "km" },
        { val: "auto_rickshaw", label: "Auto-Rickshaw", factor: "0.09 kg CO₂/km", unit: "km" },
        { val: "metro_train", label: "Metro train ride", factor: "0.02 kg CO₂/km", unit: "km" },
        { val: "local_train", label: "Suburban train (Local)", factor: "0.015 kg CO₂/km", unit: "km" },
        { val: "bus_transit", label: "BEST / Transit Bus", factor: "0.025 kg CO₂/km", unit: "km" }
      ],
      food: [
        { val: "vegan", label: "Vegan food portion", factor: "0.45 kg/serving", unit: "servings" },
        { val: "vegetarian", label: "Vegetarian portion (Dairy/Paneer)", factor: "0.95 kg/serving", unit: "servings" },
        { val: "dairy_eggs", label: "Dairy & Egg portion", factor: "1.40 kg/serving", unit: "servings" },
        { val: "poultry_fish", label: "Poultry or Fish portion", factor: "2.30 kg/serving", unit: "servings" },
        { val: "heavy_meat", label: "Mutton / Red Heavy Meat portion", factor: "5.50 kg/serving", unit: "servings" }
      ],
      energy: [
        { val: "electricity_kwh", label: "Grid Electricity usage", factor: "0.82 kg/kWh", unit: "kWh" },
        { val: "ac_hour", label: "Air Conditioner operational", factor: "0.75 kg/hour", unit: "hours" },
        { val: "lpg_day", label: "LPG stove daily cooking cycle", factor: "1.25 kg/day", unit: "days" },
        { val: "solar_credit", label: "Rooftop solar solar output generated", factor: "-0.82 kg/kWh", unit: "kWh" }
      ],
      shopping: [
        { val: "clothing", label: "Fashion / Clothing garment", factor: "10.50 kg/item", unit: "items" },
        { val: "packaging_box", label: "Online retail order delivery box", factor: "0.85 kg/box", unit: "boxes" },
        { val: "smartphone", label: "New smart electronic device bought", factor: "55.00 kg/unit", unit: "units" },
        { val: "plastic_bottle", label: "Single-use mineral water bottle", factor: "0.24 kg/bottle", unit: "bottles" }
      ],
      flights: [
        { val: "domestic", label: "Domestic Flight (Under 4 hours duration)", factor: "130.00 kg/hr", unit: "hours" },
        { val: "international", label: "International Flight journey", factor: "110.00 kg/hr", unit: "hours" }
      ],
      digital: [
        { val: "streaming_hd", label: "HD video stream (Netflix/Youtube)", factor: "0.10 kg/hr", unit: "hours" },
        { val: "ai_prompt", label: "AI queries generated", factor: "0.002 kg/query", unit: "queries" },
        { val: "video_call", label: "Zoom/Meet video presentation call", factor: "0.06 kg/hr", unit: "hours" }
      ]
    };

    function switchLoggerCategory(cat) {
      document.getElementById('loggerCategory').value = cat;
      
      // Update Tab Styles
      document.querySelectorAll('.logger-tab').forEach(t => {
        t.classList.remove('bg-white/5', 'border-[#00FF87]/40', 'shadow-md');
        t.classList.add('border-white/5');
      });
      document.getElementById('tab_' + cat).classList.add('bg-white/5', 'border-[#00FF87]/40', 'shadow-md');
      
      // Update Options
      const subSelect = document.getElementById('loggerSubItem');
      subSelect.innerHTML = '';
      
      subCategories[cat].forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.val;
        opt.innerText = o.label + " (" + o.factor + ")";
        subSelect.appendChild(opt);
      });
      
      // Update Labels
      document.getElementById('subitemLabel').innerText = cat.substring(0, 1).toUpperCase() + cat.substring(1) + " Type";
      document.getElementById('unitLabel').innerText = subCategories[cat][0].unit;
      document.getElementById('amountLabel').innerText = "Quantity (" + subCategories[cat][0].unit + ")";
      document.getElementById('loggerAmount').value = cat === 'digital' && subCategories[cat][0].val === 'ai_prompt' ? "20" : "10";
      
      subSelect.onchange = () => {
        const chosen = subSelect.value;
        const oMatch = subCategories[cat].find(x => x.val === chosen);
        if (oMatch) {
          document.getElementById('unitLabel').innerText = oMatch.unit;
          document.getElementById('amountLabel').innerText = "Quantity (" + oMatch.unit + ")";
        }
        updateImpactPreview();
      };
      
      updateImpactPreview();
    }

    function updateImpactPreview() {
      const cat = document.getElementById('loggerCategory').value;
      const subVal = document.getElementById('loggerSubItem').value;
      const amt = parseFloat(document.getElementById('loggerAmount').value) || 0;
      
      const factorMap = EMISSION_FACTORS[cat];
      const factor = factorMap[subVal] || 0;
      const computed = amt * factor;
      
      const text = getLiveFactSentence(computed);
      document.getElementById('liveFactLabel').innerText = text;
    }

    document.getElementById('loggerAmount').addEventListener('input', updateImpactPreview);

    function getLiveFactSentence(co2Kg) {
      const abs = Math.abs(co2Kg);
      if (abs < 0.005) return "Completely negligible impact.";
      
      const phones = Math.round(abs / 0.008);
      const trees = Math.round(abs / 0.06);
      
      if (co2Kg < 0) {
        return "Offsetting equivalent: Saves " + phones + " phone charges, removing active load.";
      }
      return "Comparable to charging " + phones.toLocaleString() + " smartphones or requiring " + trees + " young plants a whole day to digest!";
    }

    function submitLoggedActivity(e) {
      e.preventDefault();
      
      const cat = document.getElementById('loggerCategory').value;
      const itemVal = document.getElementById('loggerSubItem').value;
      const amt = parseFloat(document.getElementById('loggerAmount').value) || 0;
      
      if (amt <= 0) return;
      
      const factor = EMISSION_FACTORS[cat][itemVal] || 0;
      const finalCo2 = amt * factor;
      
      const optionDetails = subCategories[cat].find(x => x.val === itemVal);
      const detailedStr = optionDetails ? optionDetails.label : itemVal;

      const newLog = {
        id: "l_" + Date.now(),
        timestamp: new Date().toISOString(),
        category: cat,
        amount: amt,
        unit: optionDetails ? optionDetails.unit : "units",
        co2: parseFloat(finalCo2.toFixed(3)),
        details: detailedStr + " (" + amt + " " + (optionDetails ? optionDetails.unit : "") + ")"
      };

      logs.push(newLog);
      localStorage.setItem('ecopulse_offline_logs', JSON.stringify(logs));
      
      const factSentence = getLiveFactSentence(finalCo2);
      showToast("✅ Logged: " + detailedStr + "! Impact: " + finalCo2.toFixed(2) + " kg CO₂. " + factSentence);
      
      recalculateAllData();
      triggerConfettiCheck(cat, finalCo2);
    }

    function recalculateAllData() {
      // 1. Group daily totals for today
      const todayStr = new Date().toISOString().substring(0, 10);
      let todayCo2 = 0;
      
      logs.forEach(l => {
        const itemDateStr = l.timestamp.substring(0, 10);
        if (itemDateStr === todayStr) {
          todayCo2 += l.co2;
        }
      });
      
      // Daily Target limit is 7.7
      todayCo2 = Math.max(0, parseFloat(todayCo2.toFixed(3)));
      document.getElementById('dailyCo2Text').innerText = todayCo2.toFixed(2);
      
      // Update progress ring offset (r=40; circum=251.2)
      let percent = Math.min(100, Math.round((todayCo2 / 7.7) * 100));
      const dashOffset = 251.2 - (251.2 * percent / 100);
      const progressRing = document.getElementById('dailyProgressRing');
      
      progressRing.setAttribute('stroke-dashoffset', dashOffset);
      
      if (percent < 60) {
        progressRing.setAttribute('stroke', '#00FF87');
        document.getElementById('safeQuotaComparison').innerText = "Sustainable Quota Safe";
        document.getElementById('safeQuotaComparison').className = "text-[10px] text-neon-green font-semibold uppercase tracking-wider mt-1";
      } else if (percent < 90) {
        progressRing.setAttribute('stroke', '#FACC15');
        document.getElementById('safeQuotaComparison').innerText = "Approaching Red Threshold";
        document.getElementById('safeQuotaComparison').className = "text-[10px] text-yellow-400 font-semibold uppercase tracking-wider mt-1";
      } else {
        progressRing.setAttribute('stroke', '#EF4444');
        document.getElementById('safeQuotaComparison').innerText = "Over Daily Target Limit!";
        document.getElementById('safeQuotaComparison').className = "text-[10px] text-red-500 font-semibold uppercase tracking-wider mt-1 animate-pulse";
      }

      // Calculate Eco score
      const calcObj = calcDashboardScore(todayCo2);
      document.getElementById('ecoScoreRating').innerText = calcObj.grade + " Score: " + calcObj.score + "/100";
      
      const gradeBadge = document.getElementById('gradeBadge');
      gradeBadge.innerText = calcObj.grade;
      gradeBadge.className = "w-10 h-10 rounded-full border flex items-center justify-center font-display text-xl font-bold " + calcObj.colorClass + " bg-slate-900/40";

      // Re-render Table
      renderTable();
      
      // Update Tip based on highest category
      renderTipSection();

      // Render Charts
      updateCharts();

      // Badges unlocks check
      renderBadges();

      // Challenges check
      renderChallengeProgress();
    }

    function calcDashboardScore(dailyCo2) {
      let score = 100;
      if (dailyCo2 > 0) {
        const ratio = dailyCo2 / 7.7;
        if (ratio <= 1) {
          score = 100 - (ratio * 15);
        } else {
          score = Math.max(8, 85 - ((ratio - 1) * 18));
        }
      }
      
      score = Math.round(score);
      let grade = 'A+';
      let colorClass = 'text-neon-green border-neon-green/30';
      
      if (score >= 95) {
        grade = 'A+';
        colorClass = 'text-[#00FF87] border-[#00FF87]/30';
      } else if (score >= 85) {
        grade = 'A';
        colorClass = 'text-teal-400 border-teal-400/30';
      } else if (score >= 70) {
        grade = 'B';
        colorClass = 'text-sky-400 border-sky-400/30';
      } else if (score >= 55) {
        grade = 'C';
        colorClass = 'text-yellow-400 border-yellow-400/30';
      } else {
        grade = 'F';
        colorClass = 'text-red-500 border-red-500/30';
      }
      
      return { score, grade, colorClass };
    }

    function renderTable() {
      const tbody = document.getElementById('logsTableBody');
      tbody.innerHTML = '';
      
      if (logs.length === 0) {
        document.getElementById('noLogsPlaceholder').classList.remove('hidden');
        return;
      }
      
      document.getElementById('noLogsPlaceholder').classList.add('hidden');
      
      // Render latest 6 items
      const displayedLogs = [...logs].reverse().slice(0, 8);
      
      displayedLogs.forEach(l => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-white/5 text-[11px] text-slate-300 hover:bg-white/2 transition-colors";
        
        let emoji = '🚗';
        if (l.category === 'food') emoji = '🥗';
        else if (l.category === 'energy') emoji = '⚡';
        else if (l.category === 'shopping') emoji = '🛍️';
        else if (l.category === 'flights') emoji = '✈️';
        else if (l.category === 'digital') emoji = '📱';
        
        tr.innerHTML = \`
          <td class="py-2.5 px-2 font-semibold">
            <span class="mr-1.5">\${emoji}</span>\${l.category.toUpperCase()}
          </td>
          <td class="py-2.5 px-2 text-slate-400">\${l.details}</td>
          <td class="py-2.5 px-2 font-mono font-bold \${l.co2 <= 0 ? 'text-emerald-400' : 'text-orange-400'}">
            \${l.co2 > 0 ? '+' : ''}\${l.co2.toFixed(2)}
          </td>
          <td class="py-2.5 px-2 text-right">
            <button onclick="removeLog('\${l.id}')" class="text-xs text-slate-500 hover:text-red-400 hover:scale-105 transition-all cursor-pointer">✕</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function removeLog(id) {
      logs = logs.filter(l => l.id !== id);
      localStorage.setItem('ecopulse_offline_logs', JSON.stringify(logs));
      showToast("🗑️ Entry deleted. Restructuring balances...");
      recalculateAllData();
    }

    function clearAllLoggedData() {
      if (confirm("Are you sure you want to purge your offline logged trajectory cache? This action is irreversible.")) {
        logs = [];
        localStorage.setItem('ecopulse_offline_logs', JSON.stringify([]));
        showToast("🧹 Data cache fully cleared.");
        recalculateAllData();
      }
    }

    function renderTipSection() {
      // Find highest category emission sum
      const sums = { transport: 0, food: 0, energy: 0, shopping: 0, flights: 0, digital: 0 };
      logs.forEach(l => { sums[l.category] += l.co2; });
      
      let maxCat = 'transport';
      let maxSum = sums.transport;
      
      Object.keys(sums).forEach(k => {
        if (sums[k] > maxSum) {
          maxSum = sums[k];
          maxCat = k;
        }
      });
      
      const cityConfig = CITIES_DATA[profile.city] || CITIES_DATA.other;
      let title = "Transit Stewardship";
      let desc = cityConfig.transportTip;
      
      if (maxCat === 'food') {
        title = "Diet & Resources Alignment";
        desc = "Your highest emissions show diet impact. In India, switching paneer or heavy dairy dishes to millet (Ragi, Bajra) bowls or vegan curries once daily slashes your footprint by up to 50%! Plant-based protein has 10x lower atmospheric footprints.";
      } else if (maxCat === 'energy') {
        title = "Carbon Smart Grid Management";
        desc = cityConfig.altEnergyTip;
      } else if (maxCat === 'shopping') {
        title = "Sovereign Conservation & Circularity";
        desc = "Fast fashion and packaging create massive micro-waste. Buy clothes with organic local textiles, bypass single-use packaging box delivery cycles, and opt for recycled plastic certifications.";
      } else if (maxCat === 'flights') {
        title = "Long Haul Compensating Options";
        desc = "Frequent flights release mass-level concentrated overhead carbon. Try grouping business travel or purchase official carbon-offset credits that build rural biogas ecosystems in Madhya Pradesh.";
      } else if (maxCat === 'digital') {
        title = "Cloud Emission Reduction";
        desc = "Streaming high-definition video utilizes mega data-hubs. Lower your default display rendering to 1080p, bypass unnecessary AI query redundancy, and unplug home chargers after charging completion.";
      }
      
      document.getElementById('localTipTitle').innerText = title;
      document.getElementById('localTipDesc').innerText = desc;
      
      const carbonYearlyRatio = (sums[maxCat] * 365) / 1000;
      document.getElementById('nationalComparisonText').innerText = 
        "Your current rate of daily reporting puts you on pace for " + carbonYearlyRatio.toFixed(1) + " tonnes CO₂ per year. India's national average safe quota is 1.9 tonnes.";
      
      const banyans = Math.ceil((sums[maxCat] * 365) / 22);
      document.getElementById('banyanEquivalentText').innerText =
        "Compensating this categorical output demands " + banyans + " mature local banyan trees functioning continuously for 12 months.";
    }

    // Charting System
    function updateCharts() {
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyEmissions = [1.2, 0, 0, 0, 0, 0, 0]; // default layout fallback
      
      // Group last 7 days of logs
      const daySum = {};
      const today = new Date();
      
      for(let i=0; i<7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const code = d.toISOString().substring(0, 10);
        daySum[code] = { dayName: dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1], sum: 0 };
      }
      
      logs.forEach(l => {
        const code = l.timestamp.substring(0, 10);
        if (daySum[code]) {
          daySum[code].sum += l.co2;
        }
      });
      
      const chartValues = [];
      const chartLabels = [];
      Object.keys(daySum).reverse().forEach(key => {
        chartLabels.push(daySum[key].dayName);
        chartValues.push(parseFloat(daySum[key].sum.toFixed(2)));
      });

      // Categories sums
      const catSums = { transport: 0, food: 0, energy: 0, shopping: 0, flights: 0, digital: 0 };
      logs.forEach(l => { catSums[l.category] += Math.max(0, l.co2); }); // do not count credits as negative on share graph
      
      const catValues = Object.values(catSums);
      const catNames = ['Transport', 'Food', 'Energy', 'Shopping', 'Flights', 'Digital'];

      // Destroy old chart instances to prevent canvas collision
      if (barChartInstance) barChartInstance.destroy();
      if (donutChartInstance) donutChartInstance.destroy();
      
      const ctxBar = document.getElementById('weeklyBarChart').getContext('2d');
      barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [{
            label: 'Daily Footprint (kg CO₂)',
            data: chartValues,
            backgroundColor: 'rgba(0, 150, 255, 0.4)',
            borderColor: '#0096FF',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });

      const ctxDonut = document.getElementById('categoryDonutChart').getContext('2d');
      donutChartInstance = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
          labels: catNames,
          datasets: [{
            data: catValues,
            backgroundColor: [
              '#00FF87', // Transport
              '#38bdf8', // Food
              '#fbbf24', // Energy
              '#f472b6', // Shopping
              '#818cf8', // Flights
              '#a78bfa'  // Digital
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#cbd5e1', font: { size: 9 } }
            }
          }
        }
      });
    }

    // Unlocking Badges logic
    function renderBadges() {
      const badgesContainer = document.getElementById('badgesDisplay');
      badgesContainer.innerHTML = '';
      
      const categoryCounters = { transport: 0, food: 0, energy: 0, digital: 0 };
      logs.forEach(l => {
        if (categoryCounters[l.category] !== undefined) {
          categoryCounters[l.category] += 1;
        }
      });

      badges.forEach(b => {
        let isUnlocked = false;
        
        if (b.requirement === 'transport' && categoryCounters.transport >= 2) isUnlocked = true;
        if (b.requirement === 'food' && categoryCounters.food >= 2) isUnlocked = true;
        if (b.requirement === 'energy' && categoryCounters.energy >= 2) isUnlocked = true;
        if (b.requirement === 'digital' && categoryCounters.digital >= 2) isUnlocked = true;

        if (isUnlocked && !b.unlocked) {
          b.unlocked = true;
          showToast("🏆 Milestones Unlocked! Badge Earned: " + b.title);
          triggerConfettiBlast();
        }

        const div = document.createElement('div');
        div.className = "flex flex-col items-center justify-center p-3.5 rounded-2xl glass-panel-light text-center transition-transform hover:scale-105 " + (b.unlocked ? 'border-[#00FF87]/30 bg-emerald-950/10' : 'opacity-40');
        
        let emoji = '🎗️';
        if (b.id === 'green_commuter') emoji = '🚴';
        else if (b.id === 'plant_hero') emoji = '🌱';
        else if (b.id === 'energy_saver') emoji = '🔋';
        else if (b.id === 'digital_minimalist') emoji = '📵';

        div.innerHTML = \`
          <span class="text-2xl mb-1.5">\${emoji}</span>
          <h5 class="text-[10px] font-bold text-white leading-tight font-display">\${b.title}</h5>
          <span class="text-[8px] text-slate-400 mt-1 uppercase font-mono tracking-wider">\${b.unlocked ? 'Unlocked' : 'Locked'}</span>
        \`;
        badgesContainer.appendChild(div);
      });
    }

    // Rolling challenge goals
    function rollNextChallenge() {
      currentWeeklyChallengeIndex = (currentWeeklyChallengeIndex + 1) % weeklyChallenges.length;
      showToast("🔄 Loaded new weekly goal focus context.");
      recalculateAllData();
    }

    function renderChallengeProgress() {
      const chal = weeklyChallenges[currentWeeklyChallengeIndex];
      document.getElementById('challengeDescText').innerText = chal.desc;
      document.getElementById('challengeDescText').previousElementSibling.firstElementChild.innerText = chal.title;
      
      // Calculate mock progress based on logged items
      let count = 0;
      if (currentWeeklyChallengeIndex === 0) { // meatless
        logs.forEach(l => { if (l.category === 'food' && (l.details.includes('vegan') || l.details.includes('vegetarian'))) count++; });
      } else if (currentWeeklyChallengeIndex === 1) { // transit Metro
        logs.forEach(l => { if (l.category === 'transport' && l.details.includes('train')) count++; });
      } else { // digital limit
        count = Math.max(0, 3 - logs.filter(l => l.category === 'digital').length);
      }
      
      const target = 3;
      count = Math.min(target, count);
      
      const pct = Math.round((count / target) * 100);
      document.getElementById('challengeProgressNum').innerText = count + " / " + target + " Completed";
      document.getElementById('challengePercent').innerText = pct + "%";
      document.getElementById('challengeProgressBar').style.width = pct + "%";
    }

    // Custom lightweight particles client confetti generator (offline compatible!)
    function triggerConfettiCheck(category, val) {
      if (category === 'energy' && val < 0) {
        showToast("🌟 Solar electricity reward! Clean grid credits injected.");
        triggerConfettiBlast();
      }
    }

    function triggerConfettiBlast() {
      const container = document.getElementById('confettiOverlay');
      for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = "absolute w-2 h-2 rounded-sm pointer-events-none";
        p.style.backgroundColor = ['#00FF87', '#0096FF', '#FFDF00', '#FF4B4B'][Math.floor(Math.random() * 4)];
        p.style.left = Math.random() * 100 + "%";
        p.style.top = "-10px";
        p.style.opacity = Math.random() * 0.7 + 0.3;
        p.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
        p.style.transition = "all " + (Math.random() * 2 + 1) + "s cubic-bezier(0.1, 0.8, 0.3, 1)";
        
        container.appendChild(p);
        
        // Animating procedurally
        setTimeout(() => {
          p.style.top = Math.random() * 60 + 40 + "vh";
          p.style.left = (parseFloat(p.style.left) + (Math.random() * 20 - 10)) + "%";
          p.style.transform = "rotate(" + (Math.random() * 720) + "deg) scale(0)";
          p.style.opacity = "0";
        }, 50);

        // Delete elements
        setTimeout(() => { p.remove(); }, 3000);
      }
    }

    // Helper: Toast Popups
    function showToast(msg) {
      const stack = document.getElementById('toastStack');
      const toast = document.createElement('div');
      toast.className = "p-3.5 rounded-xl border border-[#00FF87]/20 bg-slate-950/90 text-white text-xs shadow-xl min-w-[280px] hover:translate-y-[-2px] transition-transform flex items-start gap-2.5 pointer-events-auto cursor-pointer alert";
      
      toast.innerHTML = \`
        <span class="text-sm">🍃</span>
        <div class="flex-1">
          <p class="font-medium font-sans leading-relaxed text-slate-100">\${msg}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-[10px] text-slate-500 hover:text-white">✕</button>
      \`;
      
      stack.appendChild(toast);
      setTimeout(() => { toast.remove(); }, 6000);
    }

    // Standard Direct App download of single self-contained HTML file!
    function triggerAppZipExport() {
      // Create a cloned instance of the direct source containing state!
      const finalHtmlString = document.documentElement.outerHTML;
      const blob = new Blob([finalHtmlString], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'EcoPulse_Carbon_Dashboard.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast("💾 EcoPulse Standalone HTML file successfully generated and downloaded! Access it offline anytime.");
    }
  </script>
</body>
</html>`;
}
