/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UserProfile, Badge } from '../types';
import { Share2, Link, Copy, Check, Download, Award, Shield, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareCardProps {
  profile: UserProfile;
  ecoScore: number;
  grade: string;
  badges: Badge[];
  totalSavedCo2: number;
}

export default function ShareCard({ profile, ecoScore, grade, badges, totalSavedCo2 }: ShareCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const unlockedCount = badges.filter(b => b.unlockedAt !== null).length;
  const topBadge = badges.find(b => b.unlockedAt !== null)?.title || 'Earth Steward';

  // Format date helper
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedName = profile.name || 'Planet Steward';
  const formattedCity = profile.city ? profile.city.toUpperCase() : 'COMMON REGION';
  const cleanCo2 = totalSavedCo2.toFixed(2);

  // SVG Certificate Content Definition
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" style="border-radius:12px;display:block;">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#02110c" />
      <stop offset="50%" stop-color="#051c14" />
      <stop offset="100%" stop-color="#040b17" />
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE07D" />
      <stop offset="50%" stop-color="#F3B144" />
      <stop offset="100%" stop-color="#F2DF8E" />
    </linearGradient>
    <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00FF87" />
      <stop offset="100%" stop-color="#0096FF" />
    </linearGradient>
  </defs>

  <!-- Base Background -->
  <rect width="800" height="600" fill="url(#bg-grad)" />

  <!-- Outer Elegant Border Frame -->
  <rect x="25" y="25" width="750" height="550" fill="none" stroke="url(#gold-grad)" stroke-width="3" rx="10" />
  <rect x="35" y="35" width="730" height="530" fill="none" stroke="#22c55e" stroke-width="1" stroke-opacity="0.3" rx="8" />

  <!-- Corner Ornamental Accents -->
  <!-- Top Left -->
  <path d="M25 60 L60 25 M25 80 L80 25 M25 100 L100 25" stroke="url(#gold-grad)" stroke-width="1.5" stroke-linecap="round" />
  <!-- Top Right -->
  <path d="M775 60 L740 25 M775 80 L720 25 M775 100 L700 25" stroke="url(#gold-grad)" stroke-width="1.5" stroke-linecap="round" />
  <!-- Bottom Left -->
  <path d="M25 540 L60 575 M25 520 L80 575 M25 500 L100 575" stroke="url(#gold-grad)" stroke-width="1.5" stroke-linecap="round" />
  <!-- Bottom Right -->
  <path d="M775 540 L740 575 M775 520 L720 575 M775 500 L700 575" stroke="url(#gold-grad)" stroke-width="1.5" stroke-linecap="round" />

  <circle cx="50" cy="50" r="2" fill="#00FF87" opacity="0.5" />
  <circle cx="750" cy="50" r="2" fill="#00FF87" opacity="0.5" />
  <circle cx="50" cy="550" r="2" fill="#00FF87" opacity="0.5" />
  <circle cx="750" cy="550" r="2" fill="#00FF87" opacity="0.5" />

  <!-- Certificate Core Headers -->
  <g transform="translate(400, 110)">
    <!-- Logo Symbol -->
    <g transform="translate(0, -35) scale(1.3)">
      <circle cx="0" cy="0" r="16" fill="#061a14" stroke="url(#brand-grad)" stroke-width="2" />
      <path d="M0 -8 A8 8 0 0 1 8 0 C8 4 4 8 0 8 C-4 8 -8 4 -8 0 A8 8 0 0 1 0 -8 Z" fill="#00FF87" fill-opacity="0.2" />
      <path d="M-6 3 C-6 -1 0 -5 4 -7 C2 -3 -1 4 -4 5 C-5 5 -6 4 -6 3 Z" fill="#00FF87" />
    </g>
    
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="url(#brand-grad)" letter-spacing="4">ECOPULSE CLIMATE CONSORTIUM</text>
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-weight="700" font-size="24" fill="#ffffff" letter-spacing="1" y="32">CERTIFICATE OF RECOGNITION</text>
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-weight="400" font-size="10" fill="#94a3b8" letter-spacing="2" y="55">THIS IS PROUDLY PRESENTED TO</text>
  </g>

  <!-- Recipient Name -->
  <g transform="translate(400, 235)">
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="url(#gold-grad)">${formattedName}</text>
    <line x1="-180" y1="12" x2="180" y2="12" stroke="url(#gold-grad)" stroke-width="2" stroke-linecap="round" />
    <line x1="-120" y1="16" x2="120" y2="16" stroke="url(#gold-grad)" stroke-width="1" stroke-opacity="0.6" stroke-linecap="round" />
  </g>

  <!-- Certificate Text Content -->
  <g transform="translate(400, 310)">
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" fill="#cbd5e1" font-weight="400">
      for outstanding ecological awareness and active participation in the reduction of daily greenhouse gas output.
    </text>
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" fill="#cbd5e1" font-weight="400" y="22">
      Through careful tracking, this steward maintained a safe emission plan corresponding to global targets.
    </text>
  </g>

  <!-- Stats Grid -->
  <g transform="translate(400, 400)">
    <!-- Box 1: EcoScore -->
    <g transform="translate(-150, 0)">
      <rect x="-70" y="-30" width="140" height="60" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="1" rx="8" />
      <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" fill="#94a3b8" font-weight="600" letter-spacing="1" y="-12">ECO RATING SCORE</text>
      <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="18" fill="#00FF87" font-weight="700" y="16">${ecoScore}/100</text>
    </g>

    <!-- Box 2: Grade -->
    <g transform="translate(0, 0)">
      <rect x="-70" y="-30" width="140" height="60" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="1" rx="8" />
      <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" fill="#94a3b8" font-weight="600" letter-spacing="1" y="-12">ACHIEVEMENT GRADE</text>
      <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="20" fill="#0096FF" font-weight="800" y="16">${grade}</text>
    </g>

    <!-- Box 3: Saved CO2 -->
    <g transform="translate(150, 0)">
      <rect x="-70" y="-30" width="140" height="60" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="1" rx="8" />
      <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" fill="#94a3b8" font-weight="600" letter-spacing="1" y="-12">CO₂ EMISSIONS SAVED</text>
      <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" fill="#ffffff" font-weight="700" y="15">${cleanCo2} kg</text>
    </g>
  </g>

  <!-- Attestation Dates & Signatures -->
  <!-- Left Side: Issue Date -->
  <g transform="translate(150, 500)">
    <line x1="-70" y1="0" x2="70" y2="0" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="11" fill="#ffffff" font-weight="500" y="-8">${today}</text>
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" fill="#64748b" font-weight="500" letter-spacing="1" y="14">DATE OF RECORD</text>
  </g>

  <!-- Center Seal (Gold Security Crest) -->
  <g transform="translate(400, 485)">
    <circle cx="0" cy="0" r="30" fill="url(#gold-grad)" />
    <circle cx="0" cy="0" r="22" fill="#051c14" />
    <circle cx="0" cy="0" r="20" fill="none" stroke="url(#gold-grad)" stroke-width="1" stroke-dasharray="2,2" />
    <path d="M-4 3 C-4 -1 0 -5 4 -7 C2 -3 -1 4 -4 5 C-5 5 -6 4 -6 3 Z" fill="#00FF87" transform="scale(1.4)" />
  </g>

  <!-- Right Side: Signature -->
  <g transform="translate(650, 500)">
    <line x1="-70" y1="0" x2="70" y2="0" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <path d="M-40 -12 Q-15 -35 0 -10 T30 -20" stroke="#00FF87" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.85" />
    <path d="M-20 -8 Q0 -25 15 -3" stroke="url(#gold-grad)" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.75" />
    <text text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-size="11" fill="#ffffff" font-weight="600" y="-6">EcoPulse System</text>
    <text text-anchor="middle" font-family="'Inter', sans-serif" font-size="9" fill="#64748b" font-weight="500" letter-spacing="1" y="14">VERIFIED TELEMETRY AUTHORITY</text>
  </g>
</svg>`;

  // Handle Copy of ONLY the web sharing link / URL
  const handleCopyLink = () => {
    const webUrl = window.location.href;
    navigator.clipboard.writeText(webUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle Copy of the structured textual climate report
  const handleCopyReport = () => {
    const webUrl = window.location.href;
    const shareText = `🌍 EcoPulse Climate Report 🌍
Steward: ${formattedName}
Region: ${formattedCity}
EcoScore: ${ecoScore}/100 (Grade ${grade})
Milestones Unlocked: ${unlockedCount}/5
Total CO₂ Offset: ${cleanCo2} kg to Date!
Track and curb footprints of everyday actions on EcoPulse platform:
👉 ${webUrl} 🌱`;

    navigator.clipboard.writeText(shareText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // High-fidelity download function using base64 representation to secure sandboxed iframe compatibility
  const handleDownload = () => {
    try {
      // Direct base64 encoding to escape iframe restrictions
      const cleanSvg = svgContent.replace('width="100%" height="100%" style="border-radius:12px;display:block;"', 'width="800" height="600"');
      const base64Data = btoa(unescape(encodeURIComponent(cleanSvg)));
      
      const link = document.createElement('a');
      link.href = `data:image/svg+xml;base64,${base64Data}`;
      link.download = `Climate_Certificate_${formattedName.replace(/\s+/g, '_')}.svg`;
      link.target = '_blank'; // Force open backup tab structure if needed
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // In case btoa fails, fall back to pure SVG content blob
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Climate_Certificate_${formattedName.replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        id="trigger_share_card"
        className="w-full sm:w-auto h-11 bg-white/5 hover:bg-white/10 text-white font-medium px-5 rounded-xl border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-sans"
      >
        <Share2 className="w-4 h-4 text-neon-green" /> Generate Shareable Eco Certificate
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060b1a]/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel w-full max-w-2xl rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Orb glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF87]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0096FF]/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer z-10 w-8 h-8 flex items-center justify-center bg-slate-950/40 rounded-full border border-white/5"
                aria-label="Close dialog"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF87] bg-neon-green/10 px-2.5 py-1 rounded border border-[#00FF87]/20">
                  climate rating card
                </span>
                <h4 className="font-display font-bold text-xl text-white mt-3">EcoPulse Climate Steward</h4>
                <p className="text-xs text-slate-400">Verifiably computed with local footprint metrics</p>
              </div>

              {/* STYLISH CARD CANVAS MOCKUP OR LOCKED SCREEN */}
              {ecoScore <= 50 ? (
                <div className="text-center py-8 my-auto">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-500" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-white mb-2">Certificate Locked</h4>
                  <p className="text-xs text-slate-400 mb-6 px-4 leading-relaxed max-w-md mx-auto">
                    You need an Eco Score above <span className="text-neon-green font-bold">50</span> to unlock, view, and download your Climate Certificate.
                    <br /><br />
                    Your current sustainability score is <span className="text-red-400 font-bold font-mono">{ecoScore}/100</span>. Log more green choices to increase your score!
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-10 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar gap-5">
                  {/* LIVE CERTIFICATE SVG PREVIEW CONTAINER */}
                  <div 
                    className="border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-[#02110c] relative select-none w-full mx-auto max-w-[560px]"
                    style={{ aspectRatio: '4/3' }}
                    dangerouslySetInnerHTML={{ __html: svgContent }} 
                  />

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    🌟 This accredited digital certificate recognizes your leadership and commitment towards building an emission-aware society.
                  </p>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 mt-auto">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      id="action_copy_link"
                      className="h-10 rounded-xl bg-slate-900 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-neon-green" /> Copied Link!
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 text-slate-400" /> Copy Share Link
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyReport}
                      id="action_copy_report"
                      className="h-10 rounded-xl bg-slate-900 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedReport ? (
                        <>
                          <Check className="w-4 h-4 text-neon-green" /> Copied Report!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-400" /> Copy Report Text
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      id="action_download_cert"
                      className="h-10 rounded-xl bg-gradient-to-r from-neon-green to-electric-blue text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-neon-green/10 hover:opacity-95 transition-all sm:col-span-1"
                    >
                      <Download className="w-4 h-4" /> Download (.SVG)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
