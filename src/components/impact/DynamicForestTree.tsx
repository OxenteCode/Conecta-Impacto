import React, { useState, useEffect } from 'react';

interface DynamicForestTreeProps {
  level: number; // 1 to 6
  isSuffering: boolean; // true if 30+ days without donations
  className?: string;
}

export function DynamicForestTree({ level, isSuffering, className = '' }: DynamicForestTreeProps) {
  const [isSwaying, setIsSwaying] = useState(false);
  const [key, setKey] = useState(0);

  // Trigger a temporary vigorous sway animation when level changes
  useEffect(() => {
    setIsSwaying(true);
    const timer = setTimeout(() => setIsSwaying(false), 1200);
    return () => clearTimeout(timer);
  }, [level]);

  // Handle click on tree to shake it manually (micro-interaction)
  const handleTreeClick = () => {
    setIsSwaying(true);
    setKey(prev => prev + 1); // Reset animation if clicked repeatedly
  };

  useEffect(() => {
    if (isSwaying) {
      const timer = setTimeout(() => setIsSwaying(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isSwaying, key]);

  // Color palettes based on health
  const trunkColor = isSuffering ? '#78350F' : '#4E3629'; // Dry brown vs deep chocolate brown
  const getCanopyColor = () => {
    if (isSuffering) return '#B45309'; // Amber dry
    switch (level) {
      case 1:
      case 2: return '#10B981'; // Bright emerald
      case 3: return '#059669'; // Emerald dark
      case 4: return '#047857'; // Forest green
      case 5: return '#065F46'; // Deep forest
      case 6:
      default: return '#064E3B'; // Deep rich forest
    }
  };

  const getSubCanopyColor = () => {
    if (isSuffering) return '#D97706'; // Dry light amber
    return level >= 5 ? '#34D399' : '#10B981'; // Bright accents
  };

  const canopyColor = getCanopyColor();
  const subCanopyColor = getSubCanopyColor();

  return (
    <div 
      onClick={handleTreeClick}
      className={`relative flex items-center justify-center bg-gradient-to-b ${
        isSuffering 
          ? 'from-amber-50/60 to-amber-100/40 dark:from-amber-950/10 dark:to-yellow-950/5' 
          : 'from-emerald-50/50 to-emerald-100/30 dark:from-slate-900 dark:to-slate-950'
      } p-6 rounded-[2.5rem] border border-slate-100/80 dark:border-slate-800 shadow-inner overflow-hidden select-none cursor-pointer group ${className}`}
    >
      {/* ── BACKGROUND LAYER: GLOWS AND CLOUDS ── */}
      {level === 6 && !isSuffering && (
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2),transparent_70%)] animate-[pulse_6s_infinite]" />
      )}

      {/* Floating background clouds (Only healthy) */}
      {!isSuffering && (
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes driftCloudLeft {
                0% { transform: translateX(220px); }
                100% { transform: translateX(-150px); }
              }
              @keyframes driftCloudRight {
                0% { transform: translateX(-100px); }
                100% { transform: translateX(250px); }
              }
              .cloud-1 { animation: driftCloudLeft 45s linear infinite; }
              .cloud-2 { animation: driftCloudRight 60s linear infinite; }
            `}</style>
            <path d="M10,20 Q20,10 35,15 Q45,10 50,20 Q60,20 55,30 Q45,35 10,30 Z" fill="#FFF" className="cloud-1" transform="translate(0, 10)" />
            <path d="M10,20 Q25,8 40,16 Q55,10 65,22 Q75,25 70,35 Q50,42 10,35 Z" fill="#FFF" className="cloud-2" transform="translate(0, 40)" opacity="0.8" />
          </svg>
        </div>
      )}

      {/* SVG Container */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-auto drop-shadow-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Light Beam Gradient */}
          <linearGradient id="lightBeam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.0" />
          </linearGradient>

          {/* Diamond Shine */}
          <radialGradient id="diamondShine" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
          </radialGradient>

          {/* Soil Gradient */}
          <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isSuffering ? '#854D0E' : '#3F2314'} />
            <stop offset="100%" stopColor={isSuffering ? '#451A03' : '#1C1917'} />
          </linearGradient>

          {/* Leaf Gradient */}
          <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={subCanopyColor} />
            <stop offset="100%" stopColor={canopyColor} />
          </linearGradient>

          {/* ── KEYFRAME ANIMATIONS ── */}
          <style>{`
            /* Wind Sway */
            @keyframes windSway {
              0%, 100% { transform: rotate(0deg); }
              33% { transform: rotate(1.2deg) skewX(0.5deg); }
              66% { transform: rotate(-0.8deg) skewX(-0.3deg); }
            }
            /* Vigorous sway (manual click or level transition) */
            @keyframes vigorousSway {
              0% { transform: rotate(0deg) scale(1); }
              20% { transform: rotate(6deg) scale(0.97) skewX(2deg); }
              45% { transform: rotate(-5deg) scale(1.02) skewX(-1.5deg); }
              70% { transform: rotate(3deg) scale(0.99) skewX(1deg); }
              85% { transform: rotate(-1.5deg) scale(1.01) skewX(-0.5deg); }
              100% { transform: rotate(0deg) scale(1); }
            }
            /* Pulsing Beam of Light */
            @keyframes pulseBeam {
              0%, 100% { opacity: 0.35; transform: scaleX(0.95); }
              50% { opacity: 0.85; transform: scaleX(1.08); }
            }
            /* Drifting Fireflies */
            @keyframes fireflyFloat {
              0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translate(var(--ff-x, 20px), var(--ff-y, -60px)) scale(1.2); opacity: 0; }
            }
            /* Flapping wings of butterfly */
            @keyframes wingFlap {
              0%, 100% { transform: scaleX(1); }
              50% { transform: scaleX(0.15); }
            }
            /* Flapping butterfly path flight */
            @keyframes butterflyFlight {
              0%, 100% { transform: translate(0, 0) rotate(-5deg); }
              33% { transform: translate(-8px, -12px) rotate(5deg); }
              66% { transform: translate(5px, -6px) rotate(-10deg); }
            }
            /* Diamond floating & spinning pulse */
            @keyframes diamondFloat {
              0%, 100% { transform: translateY(0) rotate(45deg); filter: drop-shadow(0 0 3px #38bdf8); }
              50% { transform: translateY(-6px) rotate(45deg) scale(1.12); filter: drop-shadow(0 0 10px #7dd3fc); }
            }
            /* Falling leaves */
            @keyframes leafFall {
              0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
              10% { opacity: 0.7; }
              90% { opacity: 0.7; }
              100% { transform: translate(-35px, 90px) rotate(320deg); opacity: 0; }
            }
            /* General transition class for organic growth */
            .growth-transition {
              transition: all 0.9s cubic-bezier(0.34, 1.6, 0.64, 1);
              transform-origin: 100px 160px;
            }
            /* Animation triggers */
            .sway-idle {
              transform-origin: 100px 160px;
              animation: windSway 6s ease-in-out infinite;
            }
            .sway-active {
              transform-origin: 100px 160px;
              animation: vigorousSway 1.2s cubic-bezier(0.25, 1, 0.5, 1) 1;
            }
            .animate-beam {
              transform-origin: 100px 0;
              animation: pulseBeam 3.5s ease-in-out infinite;
            }
            .firefly {
              animation: fireflyFloat 5s infinite ease-out;
            }
            .butterfly-flight {
              animation: butterflyFlight 5s ease-in-out infinite;
            }
            .butterfly-wing {
              transform-origin: center;
              animation: wingFlap 0.35s ease-in-out infinite;
            }
            .diamond-float {
              transform-origin: 100px 28px;
              animation: diamondFloat 3s ease-in-out infinite;
            }
            .leaf-falling-1 { animation: leafFall 6s infinite linear 1s; transform-origin: center; }
            .leaf-falling-2 { animation: leafFall 7.5s infinite linear 3.5s; transform-origin: center; }
          `}</style>
        </defs>

        {/* ──────── LAYER 1: BACKGROUND BIOME ──────── */}
        <g 
          className="growth-transition"
          style={{
            opacity: level === 6 ? (isSuffering ? 0.3 : 0.75) : 0,
            transform: level === 6 ? 'scale(1)' : 'scale(0.8)'
          }}
        >
          {/* Biome trees at back left */}
          <path d="M 35,160 L 35,115 L 22,115 L 40,85 L 58,115 L 45,115 Z" fill={isSuffering ? '#854D0E' : '#046A38'} opacity="0.6" />
          <path d="M 55,160 L 55,125 L 47,125 L 60,105 L 73,125 L 65,125 Z" fill={isSuffering ? '#92400E' : '#065F46'} opacity="0.4" />
          {/* Biome trees at back right */}
          <path d="M 165,160 L 165,110 L 152,110 L 170,80 L 188,110 L 175,110 Z" fill={isSuffering ? '#854D0E' : '#027A48'} opacity="0.6" />
          <path d="M 145,160 L 145,120 L 138,120 L 150,100 L 162,120 L 152,120 Z" fill={isSuffering ? '#92400E' : '#065F46'} opacity="0.4" />
        </g>

        {/* Level 1: Light Beam (Pulsing) */}
        <g className="growth-transition" style={{ opacity: level === 1 ? 1 : 0 }}>
          <polygon
            points="75,0 125,0 112,160 88,160"
            fill="url(#lightBeam)"
            className="animate-beam"
          />
        </g>

        {/* ──────── LAYER 2: ROOT SYSTEM (Nível 4, 5, 6) ──────── */}
        <g 
          className="growth-transition" 
          style={{ 
            opacity: level >= 4 ? 0.95 : 0,
            transform: level >= 4 ? 'scale(1)' : 'scale(0.6)'
          }}
        >
          {/* Detailed root system branching downwards */}
          <path
            d="M 100,158 C 96,168 83,171 72,179 M 100,158 C 104,168 117,172 128,179 M 97,160 C 93,174 100,181 104,192 M 103,160 C 109,172 107,183 117,188 M 85,170 C 80,175 72,176 65,181 M 115,171 C 120,176 128,178 135,183"
            stroke={trunkColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* ──────── LAYER 3: SOIL & GRASS ──────── */}
        <path
          d="M 10,160 Q 100,143 190,160 L 190,195 L 10,195 Z"
          fill="url(#soilGrad)"
        />
        {/* Living grass boundary (fades in from level 2) */}
        <path
          d="M 10,160 Q 100,143 190,160"
          stroke={isSuffering ? '#D97706' : '#10B981'}
          strokeWidth="3"
          fill="none"
          className="growth-transition"
          style={{ opacity: level > 1 ? 0.95 : 0 }}
        />

        {/* ──────── LAYER 4: STAGES / GROWTH EVOLUTION ──────── */}
        
        {/* Group to hold the main tree structure with active sway class */}
        <g className={isSwaying ? 'sway-active' : 'sway-idle'}>

          {/* STAGE 1: SEMENTE DA ESPERANÇA */}
          <g 
            className="growth-transition"
            style={{
              opacity: level === 1 ? 1 : 0,
              transform: level === 1 ? 'scale(1)' : 'scale(0)'
            }}
          >
            {/* The seed nestled in soil */}
            <path
              d="M 100,153 C 94,153 91,157 94,161 C 97,164 103,164 106,161 C 109,157 106,153 100,153 Z"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            {/* Seed magic aura */}
            <circle cx="100" cy="157" r="6" fill="#FEF08A" opacity="0.3" className="animate-pulse" />
          </g>

          {/* STAGE 2: BROTO SUSTENTÁVEL */}
          <g 
            className="growth-transition"
            style={{
              opacity: level === 2 ? 1 : 0,
              transform: level === 2 ? 'scale(1)' : 'scale(0)'
            }}
          >
            {/* Main stem */}
            <path
              d="M 100,160 Q 94,138 101,118"
              stroke={isSuffering ? '#D97706' : '#10B981'}
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Stem branches / leaves */}
            <path d="M 97,141 C 84,138 84,127 96,132 Z" fill="url(#leafGrad)" stroke={isSuffering ? '#B45309' : '#047857'} strokeWidth="1" />
            <path d="M 101,118 C 111,110 118,121 106,124 Z" fill="url(#leafGrad)" stroke={isSuffering ? '#B45309' : '#047857'} strokeWidth="1" />
          </g>

          {/* STAGE 3: ÁRVORE JOVEM */}
          <g 
            className="growth-transition"
            style={{
              opacity: level === 3 ? 1 : 0,
              transform: level === 3 ? 'scale(1)' : 'scale(0.3)'
            }}
          >
            {/* Young trunk */}
            <path d="M 93,160 Q 97,128 95,102 Q 103,128 107,160 Z" fill={trunkColor} />
            {/* Layered compact canopy */}
            <circle cx="100" cy="80" r="28" fill="url(#leafGrad)" />
            <circle cx="80" cy="85" r="18" fill={canopyColor} />
            <circle cx="120" cy="85" r="18" fill={canopyColor} />
            <circle cx="100" cy="68" r="20" fill={subCanopyColor} opacity="0.85" />
          </g>

          {/* STAGES 4, 5, 6: THE GUARDIAN OAK (Shares base, scales up decoration) */}
          <g 
            className="growth-transition"
            style={{
              opacity: level >= 4 ? 1 : 0,
              transform: level >= 4 ? 'scale(1)' : 'scale(0.5)'
            }}
          >
            {/* Main thick trunk with branches */}
            <path
              d="M 87,160 C 91,130 83,115 76,98 C 84,101 92,108 96,116 C 98,103 94,90 89,80 C 95,88 99,100 100,112 C 103,100 109,90 117,82 C 113,93 107,103 104,116 C 109,108 117,102 127,99 C 119,111 110,123 113,160 Z"
              fill={trunkColor}
            />
            {/* Giant canopy circles */}
            <circle cx="70" cy="86" r="28" fill={canopyColor} />
            <circle cx="130" cy="88" r="28" fill={canopyColor} />
            <circle cx="100" cy="64" r="38" fill="url(#leafGrad)" />
            <circle cx="86" cy="45" r="24" fill={subCanopyColor} opacity="0.9" />
            <circle cx="114" cy="52" r="22" fill={subCanopyColor} opacity="0.85" />

            {/* Falling Leaves Animation (only healthy, level 4+) */}
            {!isSuffering && (
              <g>
                <path d="M 90,65 Q 85,75 80,72" stroke="#10B981" strokeWidth="1.5" fill="none" className="leaf-falling-1" />
                <path d="M 120,68 Q 115,78 110,75" stroke="#34D399" strokeWidth="1.5" fill="none" className="leaf-falling-2" />
              </g>
            )}
          </g>

        </g> {/* END OF SWAYING GROUP */}


        {/* ──────── LAYER 5: LEVEL-SPECIFIC DECORATIONS (POP-UPS) ──────── */}

        {/* Grass tufts & ground flowers (Level 5 & 6) */}
        <g 
          className="growth-transition"
          style={{
            opacity: level >= 5 ? 1 : 0,
            transform: level >= 5 ? 'scale(1)' : 'scale(0)'
          }}
        >
          {/* Tufts of wild grass */}
          <g fill={isSuffering ? '#9A3412' : '#059669'} opacity="0.85">
            <path d="M 32,160 L 35,148 L 38,160 Z" />
            <path d="M 36,160 L 40,145 L 43,160 Z" />
            <path d="M 158,160 L 161,149 L 164,160 Z" />
            <path d="M 163,161 L 167,146 L 170,161 Z" />
          </g>

          {/* Flowers on ground (Only healthy) */}
          {!isSuffering && (
            <g>
              {/* Left Flower */}
              <path d="M 52,160 L 52,151" stroke="#047857" strokeWidth="1.5" />
              <circle cx="52" cy="149" r="3.5" fill="#F43F5E" />
              <circle cx="52" cy="149" r="1.5" fill="#FCD34D" />

              {/* Right Flower */}
              <path d="M 144,160 L 144,153" stroke="#047857" strokeWidth="1.5" />
              <circle cx="144" cy="151" r="3" fill="#EC4899" />
              <circle cx="144" cy="151" r="1" fill="#FFF" />
              
              {/* Center flower */}
              <path d="M 124,160 L 124,154" stroke="#047857" strokeWidth="1.5" />
              <circle cx="124" cy="152" r="2.5" fill="#A855F7" />
              <circle cx="124" cy="152" r="0.8" fill="#FCD34D" />
            </g>
          )}
        </g>

        {/* Level 5 Butterfly (Only healthy) */}
        {!isSuffering && level === 5 && (
          <g className="butterfly-flight" style={{ transformOrigin: '150px 85px' }}>
            <g transform="translate(150, 80) scale(0.65)">
              <path d="M 0,0 C -9,-11 -13,-3 0,5 Z" fill="#F59E0B" className="butterfly-wing" />
              <path d="M 0,0 C 9,-11 13,-3 0,5 Z" fill="#F59E0B" className="butterfly-wing" style={{ animationDelay: '0.12s' }} />
              <line x1="0" y1="-5" x2="0" y2="6" stroke="#1E293B" strokeWidth="1.5" />
            </g>
          </g>
        )}

        {/* Level 6 Floating Diamond & Sparkles (Only level 6) */}
        <g 
          className="growth-transition"
          style={{
            opacity: level === 6 ? 1 : 0,
            transform: level === 6 ? 'scale(1)' : 'scale(0)'
          }}
        >
          {/* Diamond overlay on top */}
          {!isSuffering ? (
            <g className="diamond-float">
              {/* Radiating shine glow */}
              <circle cx="100" cy="28" r="22" fill="url(#diamondShine)" className="animate-pulse" />
              {/* Shimmering Diamond Polygon */}
              <polygon
                points="100,16 109,28 100,40 91,28"
                fill="#F0F9FF"
                stroke="#0284C7"
                strokeWidth="1.5"
              />
              <polygon
                points="100,16 95,28 100,40"
                fill="#38BDF8"
                opacity="0.3"
              />
            </g>
          ) : (
            // Darkened/inactive diamond icon during churn
            <polygon
              points="100,18 107,28 100,38 93,28"
              fill="#64748B"
              stroke="#334155"
              strokeWidth="1.5"
              opacity="0.4"
              transform="translate(0, 10)"
            />
          )}

          {/* Fireflies / Magic Dust (Only healthy, floating dynamically) */}
          {!isSuffering && (
            <g pointerEvents="none">
              {/* Firefly 1 (Left) */}
              <circle cx="50" cy="120" r="2.5" fill="#38BDF8" className="firefly" style={{ '--ff-x': '30px', '--ff-y': '-70px', animationDelay: '0.5s' } as React.CSSProperties} />
              {/* Firefly 2 (Right) */}
              <circle cx="150" cy="100" r="2" fill="#7DD3FC" className="firefly" style={{ '--ff-x': '-25px', '--ff-y': '-60px', animationDelay: '2s' } as React.CSSProperties} />
              {/* Firefly 3 (Center) */}
              <circle cx="95" cy="130" r="3" fill="#34D399" className="firefly" style={{ '--ff-x': '15px', '--ff-y': '-85px', animationDelay: '0s' } as React.CSSProperties} />
              {/* Firefly 4 (Top Canopy) */}
              <circle cx="110" cy="70" r="2" fill="#FCD34D" className="firefly" style={{ '--ff-x': '-15px', '--ff-y': '-45px', animationDelay: '3.5s' } as React.CSSProperties} />
            </g>
          )}
        </g>

      </svg>

      {/* Floating Instructions (Encourages user to touch/click) */}
      <div className="absolute top-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="bg-slate-900/80 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border border-slate-700/50 backdrop-blur-sm shadow-md">
          🖱️ Clique para ventar
        </span>
      </div>

      {/* Health Overlay Alert */}
      {isSuffering && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
          <span className="bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-[10px] tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-amber-400/50 backdrop-blur-md animate-pulse flex items-center gap-1.5">
            ⚠️ FLORESTA SECANDO (ALERTA ESG)
          </span>
        </div>
      )}
    </div>
  );
}
