// ─── Shared Vedic Chart Components ───────────────────────────────────────────
// Used by both Horoscope.jsx and Horary.jsx
// Place at: src/features/horoscope/VedicCharts.jsx

import React from 'react';

export const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const SIGNS_HI = ['मेष','वृष','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'];
export const PS = {Sun:'Su',Moon:'Mo',Mars:'Ma',Mercury:'Me',Jupiter:'Ju',Venus:'Ve',Saturn:'Sa',Rahu:'Ra',Ketu:'Ke'};

const NI = [null,[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[2,0],[1,0],[0,0]];
const SI = [[11,0,1,2],[10,-1,-1,3],[9,-1,-1,4],[8,7,6,5]];

export function NorthChart({ chart }) {
  const W   = 280;
  const OCH = '#C17B2B';
  const BG  = '#FFFDF8';

  const ai = SIGNS.indexOf(chart.ascendant.sign);
  const hd = {};
  for (let h = 1; h <= 12; h++) {
    hd[h] = { sn: (ai + h - 1) % 12 + 1, p: [] };
  }
  Object.entries(chart.planets).forEach(([n, p]) => {
    if (!hd[p.house]) return;
    const abbr = PS[n] || n.slice(0, 2);
    const sym = (p.is_exalted ? '↑' : '') + (p.is_debilitated ? '↓' : '') + (p.is_retrograde ? 'ᴿ' : '') + (p.is_combust ? '☌' : '') + (p.is_vargottama ? '□' : '');
    hd[p.house].p.push(abbr + sym);
  });

  const C = {
    1:  { cx:140, cy:65  },
    2:  { cx:68,  cy:22  },
    3:  { cx:22,  cy:78  },
    4:  { cx:65,  cy:140 },
    5:  { cx:22,  cy:202 },
    6:  { cx:68,  cy:258 },
    7:  { cx:140, cy:215 },
    8:  { cx:212, cy:258 },
    9:  { cx:258, cy:202 },
    10: { cx:215, cy:140 },
    11: { cx:258, cy:78  },
    12: { cx:212, cy:22  },
  };

  return (
    <svg width="280" height="280" viewBox={`0 0 ${W} ${W}`} style={{ display:'block', width:'100%', maxWidth:280, margin:'0 auto' }}>
      <rect width={W} height={W} fill={BG} />
      <polygon points="140,0 210,70 140,140 70,70" fill={`${OCH}15`} />
      <rect x="1" y="1" width={W-2} height={W-2} fill="none" stroke={OCH} strokeWidth="1.5" />
      <line x1="0"   y1="0"   x2="280" y2="280" stroke={`${OCH}90`} strokeWidth="1" />
      <line x1="280" y1="0"   x2="0"   y2="280" stroke={`${OCH}90`} strokeWidth="1" />
      <polygon points="140,0 280,140 140,280 0,140" fill="none" stroke={OCH} strokeWidth="1.3" />
      {Object.entries(C).map(([h, { cx, cy }]) => {
        const house = parseInt(h);
        const { sn, p } = hd[house];
        const isLagna = house === 1;
        return (
          <g key={house}>
            <text x={cx} y={cy + (p.length ? -6 : 4)} textAnchor="middle"
              fill={isLagna ? OCH : '#1A1A1A'}
              fontSize={isLagna ? '13' : '11'}
              fontWeight={isLagna ? '800' : '600'}
              fontFamily="DM Sans,sans-serif">
              {sn}
            </text>
            {p.length > 0 && (
              <text x={cx} y={cy + 14} textAnchor="middle"
                fill="#7A4A1A"
                fontSize={isLagna ? '13' : '11'}
                fontWeight="600"
                fontFamily="DM Sans,sans-serif">
                {p.join(' ')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function SouthChart({ chart }) {
  const C   = 70;
  const W   = C * 4;
  const OCH = '#C17B2B';
  const BG  = '#FFFDF8';

  const ai = SIGNS.indexOf(chart.ascendant.sign);
  const sp = {};
  for (let i = 0; i < 12; i++) sp[i] = [];
  Object.entries(chart.planets).forEach(([n, p]) => {
    const si = SIGNS.indexOf(p.sign);
    if (si >= 0) sp[si].push(PS[n] || n.slice(0, 2));
  });

  return (
    <svg width="280" height="280" viewBox={`0 0 ${W} ${W}`} style={{ display:'block', width:'100%', maxWidth:280, margin:'0 auto' }}>
      <rect width={W} height={W} fill={BG} />
      <rect x="1" y="1" width={W-2} height={W-2} fill="none" stroke={OCH} strokeWidth="1.5" />
      <line x1="0" y1={C}   x2={W} y2={C}   stroke={OCH} strokeWidth="1" />
      <line x1="0" y1={3*C} x2={W} y2={3*C} stroke={OCH} strokeWidth="1" />
      <line x1="0" y1={2*C} x2={C}   y2={2*C} stroke={OCH} strokeWidth="1" />
      <line x1={3*C} y1={2*C} x2={W} y2={2*C} stroke={OCH} strokeWidth="1" />
      <line x1={C}   y1="0" x2={C}   y2={W} stroke={OCH} strokeWidth="1" />
      <line x1={3*C} y1="0" x2={3*C} y2={W} stroke={OCH} strokeWidth="1" />
      <line x1={2*C} y1="0" x2={2*C} y2={C}   stroke={OCH} strokeWidth="1" />
      <line x1={2*C} y1={3*C} x2={2*C} y2={W} stroke={OCH} strokeWidth="1" />
      <rect x={C} y={C} width={2*C} height={2*C} fill={`${OCH}06`} stroke={OCH} strokeWidth="1" />
      {SI.map((row, ri) =>
        row.map((sIdx, ci) => {
          if (sIdx === -1) return null;
          const isAsc = sIdx === ai;
          const x = ci * C;
          const y = ri * C;
          const signNum = sIdx + 1;
          const planets = sp[sIdx];
          return (
            <g key={`${ri}${ci}`}>
              {isAsc && (
                <rect x={x+1} y={y+1} width={C-2} height={C-2}
                  fill={`${OCH}15`} stroke={OCH} strokeWidth="1.5" />
              )}
              <text x={x+5} y={y+14}
                fill={isAsc ? OCH : '#1A1A1A'}
                fontSize="11"
                fontWeight={isAsc ? '800' : '600'}
                fontFamily="DM Sans,sans-serif">
                {signNum}{isAsc ? '↑' : ''}
              </text>
              {planets.length > 0 && (
                <text x={x+C/2} y={y+C/2+10} textAnchor="middle"
                  fill="#7A4A1A" fontSize="11" fontWeight="600" fontFamily="DM Sans,sans-serif">
                  {planets.join(' ')}
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

// ── Chandra Lagna builder ──────────────────────────────────────────────────────
export function buildChandraChart(chart) {
  const moonSign = chart.planets['Moon']?.sign || chart.ascendant.sign;
  const moonIdx  = SIGNS.indexOf(moonSign);
  const newPlanets = {};
  Object.entries(chart.planets).forEach(([name, p]) => {
    const pSignIdx    = SIGNS.indexOf(p.sign);
    const houseOffset = ((pSignIdx - moonIdx) + 12) % 12 + 1;
    newPlanets[name]  = { ...p, house: houseOffset };
  });
  return {
    ascendant: { ...chart.ascendant, sign: moonSign },
    planets:   newPlanets,
  };
}

// ── Four Chart Grid (D1 · D9 · D10 · Chandra Lagna) ──────────────────────────
export function FourChartGrid({ chart, style = 'north', hi = false }) {
  const chandraChart = buildChandraChart(chart);
  const ChartComp    = style === 'north' ? NorthChart : SouthChart;
  const labels = [
    { key: 'D1',  label: hi ? 'D1 · लग्न कुंडली' : 'D1 · Lagna',      data: chart           },
    { key: 'D9',  label: hi ? 'D9 · नवांश'        : 'D9 · Navamsha',    data: chart.navamsa   },
    { key: 'D10', label: hi ? 'D10 · दशांश'       : 'D10 · Dashamsha',  data: chart.dashamsha },
    { key: 'CL',  label: hi ? 'चंद्र लग्न'        : 'Chandra Lagna',    data: chandraChart    },
  ];
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', letterSpacing:'1.5px', textTransform:'uppercase', color:'#8B5E3C', textAlign:'center', margin:'0 0 12px', opacity:0.7 }}>
        {style === 'north' ? (hi ? 'उत्तर भारतीय शैली' : 'North Indian Style') : (hi ? 'दक्षिण भारतीय शैली' : 'South Indian Style')}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        {labels.map(({ key, label, data }) => (
          <div key={key} style={{ background:'#FFFDF8', border:'1px solid #C17B2B25', borderRadius:'12px', padding:'8px 6px 6px', boxShadow:'0 2px 8px rgba(193,123,43,0.08)' }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:700, color:'#C17B2B', textAlign:'center', margin:'0 0 6px', letterSpacing:'0.5px' }}>
              {label}
            </p>
            {data ? <ChartComp chart={data} /> : (
              <p style={{ textAlign:'center', fontSize:'11px', color:'#8B5E3C', padding:'20px 0' }}>—</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Two Chart Row (D1 + D9 side by side) — used by Horary ────────────────────
export function TwoChartRow({ chart, navamsa, style = 'north', hi = false, label1, label2 }) {
  const ChartComp = style === 'north' ? NorthChart : SouthChart;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
      <div style={{ background:'#FFFDF8', border:'1px solid #9B59B625', borderRadius:'12px', padding:'8px 6px 6px' }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:700, color:'#9B59B6', textAlign:'center', margin:'0 0 6px', letterSpacing:'0.5px' }}>
          {label1 || (hi ? 'D1 · प्रश्न कुंडली' : 'D1 · Prashna Chart')}
        </p>
        <ChartComp chart={chart} />
      </div>
      <div style={{ background:'#FFFDF8', border:'1px solid #9B59B625', borderRadius:'12px', padding:'8px 6px 6px' }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:700, color:'#9B59B6', textAlign:'center', margin:'0 0 6px', letterSpacing:'0.5px' }}>
          {label2 || (hi ? 'D9 · नवांश' : 'D9 · Navamsha')}
        </p>
        {navamsa ? <ChartComp chart={navamsa} /> : (
          <p style={{ textAlign:'center', fontSize:'11px', color:'#8B5E3C', padding:'20px 0' }}>—</p>
        )}
      </div>
    </div>
  );
}
