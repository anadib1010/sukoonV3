import React, { useState } from 'react';

const ACCENT = '#9B59B6';
const API    = 'https://jsukoon-api.duckdns.org/horoscope';

const SIGNS  = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SS     = ['Ar','Ta','Ge','Ca','Le','Vi','Li','Sc','Sa','Cp','Aq','Pi'];
const PS     = {Sun:'Su',Moon:'Mo',Mars:'Ma',Mercury:'Me',Jupiter:'Ju',Venus:'Ve',Saturn:'Sa',Rahu:'Ra',Ketu:'Ke'};
const PH     = {Sun:'सूर्य',Moon:'चंद्र',Mars:'मंगल',Mercury:'बुध',Jupiter:'गुरु',Venus:'शुक्र',Saturn:'शनि',Rahu:'राहु',Ketu:'केतु'};
const DH     = {Ketu:'केतु',Venus:'शुक्र',Sun:'सूर्य',Moon:'चंद्र',Mars:'मंगल',Rahu:'राहु',Jupiter:'गुरु',Saturn:'शनि',Mercury:'बुध'};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS = {Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17};
const REPORT_SECTIONS = [
  { id:'overview',     icon:'☉', title:'Chart Overview'        },
  { id:'career',       icon:'♃', title:'Career & Profession'   },
  { id:'wealth',       icon:'₹', title:'Wealth & Finances'     },
  { id:'health',       icon:'♄', title:'Health & Vitality'     },
  { id:'family',       icon:'☽', title:'Family & Relationships'},
  { id:'spirituality', icon:'☊', title:'Spiritual Path'        },
  { id:'dasha',        icon:'⏳', title:'Current Dasha Period'  },
];

const BADGE_COLORS = {
  'Strongly Indicated': '#4A9B6F',
  'Favourable':         '#4A9B6F',
  'Mixed':              '#C17B2B',
  'Challenging':        '#C0544A',
  'Needs Vigilance':    '#C17B2B',
  'Irregular':          '#C17B2B',
  'Complex':            '#7C5CBF',
  'Transformative':     '#7C5CBF',
};
const NI     = [null,[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[2,0],[1,0],[0,0]];
const SI     = [[11,0,1,2],[10,-1,-1,3],[9,-1,-1,4],[8,7,6,5]];

function NorthChart({ chart }) {
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
    <svg width="100%" viewBox={`0 0 ${W} ${W}`} style={{ display:'block', maxWidth:300, margin:'0 auto' }}>
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

function SouthChart({ chart }) {
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
    <svg width="100%" viewBox={`0 0 ${W} ${W}`} style={{ display:'block', maxWidth:300, margin:'0 auto' }}>
      <rect width={W} height={W} fill={BG} />

      {/* Outer border */}
      <rect x="1" y="1" width={W-2} height={W-2} fill="none" stroke={OCH} strokeWidth="1.5" />

      {/* Horizontal lines — full width at rows 1 and 3 */}
      <line x1="0" y1={C}   x2={W} y2={C}   stroke={OCH} strokeWidth="1" />
      <line x1="0" y1={3*C} x2={W} y2={3*C} stroke={OCH} strokeWidth="1" />

      {/* Horizontal line at row 2 — skip center */}
      <line x1="0" y1={2*C} x2={C}   y2={2*C} stroke={OCH} strokeWidth="1" />
      <line x1={3*C} y1={2*C} x2={W} y2={2*C} stroke={OCH} strokeWidth="1" />

      {/* Vertical lines — full height at cols 1 and 3 */}
      <line x1={C}   y1="0" x2={C}   y2={W} stroke={OCH} strokeWidth="1" />
      <line x1={3*C} y1="0" x2={3*C} y2={W} stroke={OCH} strokeWidth="1" />

      {/* Vertical line at col 2 — skip center */}
      <line x1={2*C} y1="0" x2={2*C} y2={C}   stroke={OCH} strokeWidth="1" />
      <line x1={2*C} y1={3*C} x2={2*C} y2={W} stroke={OCH} strokeWidth="1" />

      {/* Center empty square — one big box, no inner lines */}
      <rect x={C} y={C} width={2*C} height={2*C} fill={`${OCH}06`} stroke={OCH} strokeWidth="1" />

      {/* Houses */}
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
              {/* Sign number top-left */}
              <text x={x+5} y={y+14}
                fill={isAsc ? OCH : '#1A1A1A'}
                fontSize="11"
                fontWeight={isAsc ? '800' : '600'}
                fontFamily="DM Sans,sans-serif">
                {signNum}{isAsc ? '↑' : ''}
              </text>
              {/* Planets centered */}
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
export function Horoscope({ setTab, T: _T, lang = 'English' }) {
  const hi = lang === 'Hindi';
  const T = { bg: '#FFFDF8', text: '#2C1810', accent: '#C17B2B', textSoft: '#8B5E3C' };
  const [step,      setStep]      = useState('form');
  const [chartView, setChartView] = useState('north');
  const [chart,     setChart]     = useState(null);
  const [error,     setError]     = useState('');
  const [form,      setForm]      = useState({
    name:'', day:'', month:'', year:'',
    hour:'12', minute:'0', city:'', tz:'5.5', tz_name:'', tz_label:'',
  });
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedMD, setSelectedMD] = useState(null);
  const [selectedAD, setSelectedAD] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [reportLang, setReportLang] = useState(lang === 'Hindi' ? 'Hindi' : 'English');
  const [report,        setReport]        = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError,   setReportError]   = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [mainView,      setMainView]      = useState('chart');
  const calcPratyantara = (adStart, adEnd, adLord) => {
    const adMs = new Date(adEnd) - new Date(adStart);
    const adYears = adMs / (365.25 * 24 * 60 * 60 * 1000);
    const startIdx = DASHA_ORDER.indexOf(adLord);
    const result = [];
    let cur = new Date(adStart);
    for (let i = 0; i < 9; i++) {
      const lord = DASHA_ORDER[(startIdx + i) % 9];
      const days = (adYears * DASHA_YEARS[lord] / 120) * 365.25;
      const end = new Date(cur.getTime() + days * 86400000);
      result.push({ lord, start: cur.toISOString().slice(0,10), end: end.toISOString().slice(0,10) });
      cur = end;
    }
    return result;
  };
  const generateReport = async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const res = await fetch(`${API}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, language: reportLang }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Report generation failed');
      setReport(data.report);
      setMainView('report');
    } catch (e) {
      setReportError(e.message);
    }
    setReportLoading(false);
  };
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.day || !form.month || !form.year || !form.city) {
      setError(hi ? 'कृपया सभी जानकारी भरें।' : 'Please fill all required fields.');
      return;
    }
    setError('');
      setStep('loading');
      setMainView('chart');
      setReport(null);
      window.scrollTo(0, 0);
    const chartHash = btoa(
        `${form.day}-${form.month}-${form.year}-${form.hour}-${form.minute}-${form.city.toLowerCase().trim()}`
      );
    try {
      let lat, lon;
if (form._lat && form._lon) {
  lat = parseFloat(form._lat);
  lon = parseFloat(form._lon);
} else {
  const geo = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.city)}&format=json&limit=1`,
    { headers: { 'User-Agent': 'JSuKun-Horoscope/1.0' } }
  );
  const gd = await geo.json();
  if (!gd.length) throw new Error(hi ? 'शहर नहीं मिला।' : 'City not found. Try a nearby major city.');
  lat = parseFloat(gd[0].lat);
  lon = parseFloat(gd[0].lon);
}
      const res = await fetch(`${API}/chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: +form.year, month: +form.month, day: +form.day,
          hour: +form.hour, minute: +form.minute,
          lat, lon, tz_offset: +form.tz, tz_name: form.tz_name,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Chart calculation failed');
      setChart(data.chart);
      setStep('result');
    } catch (e) {
      setError(e.message);
      setStep('form');
    }
  };

  const s = {
    page:        { minHeight:'100dvh', background:'#FFFDF8', color:'#2C1810', display:'flex', flexDirection:'column' },
    header:      { padding:'52px 20px 16px', borderBottom:'1px solid #C17B2B22', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', background:'linear-gradient(180deg, #FDF0DC 0%, #FFFDF8 100%)' },
    backBtn:     { background:'none', border:'none', color:'#C17B2B', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
    hCenter:     { textAlign:'center', position:'absolute', left:'50%', transform:'translateX(-50%)' },
    hTitle:      { fontFamily:"'Cormorant Garamond',serif", fontSize:'22px', fontWeight:700, color:'#2C1810', margin:0 },
    hSub:        { fontSize:'10px', opacity:0.5, marginTop:'2px', fontFamily:"'DM Sans',sans-serif", letterSpacing:'1px', color:'#8B5E3C' },
    scroll:      { padding:'20px 16px 56px', flex:1, overflowY:'auto' },
    label:       { display:'block', fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#8B5E3C', marginBottom:'6px' },
    input:       { width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #C17B2B40', background:'#FDF6EC', color:'#2C1810', fontFamily:"'DM Sans',sans-serif", fontSize:'14px', boxSizing:'border-box', outline:'none' },
    select:      { flex:1, padding:'12px 8px', borderRadius:'10px', border:'1px solid #C17B2B40', background:'#FDF6EC', color:'#2C1810', fontFamily:"'DM Sans',sans-serif", fontSize:'14px', outline:'none', minWidth:0 },
    row:         { display:'flex', gap:'10px', marginBottom:'14px' },
    submitBtn:   { width:'100%', padding:'16px', borderRadius:'12px', background:'linear-gradient(135deg, #C17B2B, #E09B4B)', border:'none', color:'#fff', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'15px', letterSpacing:'2px', cursor:'pointer', marginTop:'8px', boxShadow:'0 4px 16px rgba(193,123,43,0.35)' },
    error:       { color:'#C0544A', fontSize:'12px', fontFamily:"'DM Sans',sans-serif", textAlign:'center', marginTop:'8px' },
    card:        { background:'#FFFBF5', border:'1px solid #C17B2B20', borderRadius:'14px', padding:'16px', marginBottom:'16px', boxShadow:'0 2px 12px rgba(193,123,43,0.06)' },
    cardTitle:   { fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'#C17B2B', margin:'0 0 12px', opacity:0.9 },
    toggleBtn:   a => ({ flex:1, padding:'10px', borderRadius:'10px', border:`1px solid ${a ? '#C17B2B' : '#C17B2B33'}`, background: a ? '#C17B2B' : 'transparent', color: a ? '#FFFFFF' : '#8B5E3C', fontFamily:"'DM Sans',sans-serif", fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }),
    planetRow:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #C17B2B10', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", gap:'8px' },
    reading:     { fontFamily:"'Cormorant Garamond',serif", fontSize:'16px', lineHeight:1.85, opacity:0.9, color:'#2C1810', fontStyle:'italic', whiteSpace:'pre-wrap' },
    dashaActive: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'10px', background:'linear-gradient(135deg, #C17B2B22, #E09B4B22)', border:'1px solid #C17B2B', cursor:'pointer' },
    dashaPast:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'10px', background:'transparent', border:'1px solid #C17B2B20', opacity:0.4, cursor:'pointer' },
    dashaFuture: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'10px', background:'transparent', border:'1px solid #C17B2B25', cursor:'pointer' },
    disclaimer:  { fontFamily:"'DM Sans',sans-serif", fontSize:'10px', opacity:0.35, textAlign:'center', color:'#8B5E3C', lineHeight:1.6, marginTop:'12px' },
  };
return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes gentlePulse { 0%,100%{opacity:0.65} 50%{opacity:1} }
        select option { background: #FDF6EC; color: #2C1810; }
        @media print {
          @page { size: A4; margin-top:20mm; margin-bottom:20mm; margin-left:25mm; margin-right:15mm; }
          body { font-family: 'Cormorant Garamond', serif; font-size:12pt; color:#2C1810; }
          button, .no-print { display: none !important; }
        }
      `}</style>

      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setTab('home')}>← {hi ? 'वापस' : 'Back'}</button>
        <div style={s.hCenter}>
          <p style={s.hTitle}>🔮 {hi ? 'जन्म कुंडली' : 'Vedic Birth Chart'}</p>
          <p style={{ ...s.hSub, color:T.text }}>{hi ? 'Swiss Ephemeris · सटीक ग्रह गणना' : 'Swiss Ephemeris · Precise Planetary Calculation'}</p>
        </div>
        <div style={{ width:50 }} />
      </div>

      <div style={s.scroll}>

        {step === 'form' && (
          <div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'18px', fontStyle:'italic', opacity:0.7, textAlign:'center', marginBottom:'24px', color:T.text, lineHeight:1.45 }}>
              {hi ? 'अपना जन्म विवरण दर्ज करें — ग्रहों की सटीक गणना होगी।' : 'Enter your exact birth details for a personalised Vedic reading.'}
            </p>

            <div style={{ marginBottom:'14px' }}>
              <label style={s.label}>{hi ? 'नाम (वैकल्पिक)' : 'Name (optional)'}</label>
              <input style={s.input} placeholder={hi ? 'आपका नाम' : 'Your name'} value={form.name} onChange={set('name')} />
            </div>

            <label style={s.label}>{hi ? 'जन्म तिथि' : 'Date of Birth'}</label>
            <div style={s.row}>
              <select style={s.select} value={form.day} onChange={set('day')}>
                <option value="">{hi ? 'दिन' : 'Day'}</option>
                {Array.from({ length:31 }, (_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
              <select style={s.select} value={form.month} onChange={set('month')}>
                <option value="">{hi ? 'माह' : 'Month'}</option>
                {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <select style={s.select} value={form.year} onChange={set('year')}>
                <option value="">{hi ? 'वर्ष' : 'Year'}</option>
                {Array.from({ length:100 }, (_,i) => { const y = new Date().getFullYear()-i; return <option key={y} value={y}>{y}</option>; })}
              </select>
            </div>

            <label style={s.label}>{hi ? 'जन्म समय' : 'Birth Time'}</label>
            <div style={s.row}>
              <select style={s.select} value={form.hour} onChange={set('hour')}>
                {Array.from({ length:24 }, (_,i) => <option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}
              </select>
              <select style={s.select} value={form.minute} onChange={set('minute')}>
                {Array.from({ length:60 }, (_,i) => <option key={i} value={i}>:{String(i).padStart(2,'0')}</option>)}
              </select>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', opacity:0.4, color:T.text, marginTop:'-8px', marginBottom:'14px' }}>
              {hi ? '* जन्म समय जितना सटीक, उतना सटीक लग्न।' : '* More precise birth time = more accurate Lagna.'}
            </p>

            <div style={{ marginBottom:'14px', position:'relative' }}>
  <label style={s.label}>{hi ? 'जन्म स्थान' : 'Birth City'}</label>
  <input
    style={s.input}
    placeholder={hi ? 'जैसे: मुंबई, दिल्ली, चेन्नई' : 'e.g. Mumbai, Delhi, London'}
    value={form.city}
    onChange={e => {
      set('city')(e);
      const q = e.target.value;
      if (q.length < 3) { setCitySuggestions([]); return; }
      clearTimeout(window._cityTimer);
      window._cityTimer = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&featuretype=city`, { headers: { 'User-Agent': 'JSuKun-Horoscope/1.0' } });
          const data = await res.json();
          setCitySuggestions(data.map(d => ({ label: d.display_name.split(',').slice(0,3).join(','), lat: d.lat, lon: d.lon })));
        } catch { setCitySuggestions([]); }
      }, 400);
    }}
    onBlur={() => setTimeout(() => setCitySuggestions([]), 200)}
  />
  {citySuggestions.length > 0 && (
    <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#FFFDF8', border:`1px solid #C17B2B60`, borderRadius:'10px', zIndex:999, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}>
      {citySuggestions.map((c, i) => (
        <div key={i}
          onMouseDown={async () => {
            setForm(f => ({ ...f, city: c.label, _lat: c.lat, _lon: c.lon, tz_label: 'Detecting timezone...', tz_name: '' }));
            setCitySuggestions([]);
            try {
              const tzRes = await fetch(`https://timeapi.io/api/timezone/coordinate?latitude=${c.lat}&longitude=${c.lon}`);
              const tzData = await tzRes.json();
              if (tzData.timeZone) {
                const totalSeconds = tzData.currentUtcOffset?.seconds || 0;
                const totalOffset = totalSeconds / 3600;
                const sign = totalOffset >= 0 ? '+' : '-';
                const absTotal = Math.abs(totalSeconds);
                const absH = Math.floor(absTotal / 3600);
                const absM = Math.floor((absTotal % 3600) / 60);
                const label = `${tzData.timeZone} (UTC ${sign}${String(absH).padStart(2,'0')}:${String(absM).padStart(2,'0')})`;
                setForm(f => ({ ...f, tz: String(totalOffset), tz_name: tzData.timeZone, tz_label: label }));
              }
            } catch {
              setForm(f => ({ ...f, tz_label: 'Could not detect — please select manually' }));
            }
          }}
          style={{ padding:'10px 14px', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", color:'#1A1A1A', cursor:'pointer', borderBottom: i < citySuggestions.length-1 ? '1px solid #C17B2B20' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background='#F5EDE0'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          {c.label}
        </div>
      ))}
    </div>
  )}
</div>

            <div style={{ marginBottom:'22px' }}>
              <label style={s.label}>{hi ? 'समय क्षेत्र' : 'Timezone'}</label>
              {form.tz_label ? (
                <div style={{ padding:'12px', borderRadius:'10px', border:'1px solid #C17B2B40', background:'#FDF6EC', color:'#2C1810', fontFamily:"'DM Sans',sans-serif", fontSize:'13px' }}>
                  🌍 {form.tz_label}
                </div>
              ) : (
                <select style={{ ...s.select, flex:'unset', width:'100%' }} value={form.tz} onChange={set('tz')}>
                  <option value="5.5">IST +5:30 (India, Sri Lanka)</option>
                  <option value="0">UTC +0:00 (UK, Ghana)</option>
                  <option value="1">CET +1:00 (Germany, France)</option>
                  <option value="3">AST +3:00 (Saudi Arabia)</option>
                  <option value="5">PKT +5:00 (Pakistan)</option>
                  <option value="6">BST +6:00 (Bangladesh)</option>
                  <option value="7">ICT +7:00 (Thailand, Vietnam)</option>
                  <option value="8">CST +8:00 (China, Singapore)</option>
                  <option value="-5">EST -5:00 (USA Eastern)</option>
                  <option value="-8">PST -8:00 (USA Pacific)</option>
                </select>
              )}
            </div>

            {error && <p style={s.error}>{error}</p>}
            <button style={s.submitBtn} onClick={submit}>
              {hi ? '🔮 कुंडली बनाएं' : '🔮 CALCULATE MY CHART'}
            </button>
            <div style={{ marginBottom:'14px' }}>
              <label style={s.label}>Report Language</label>
              <select style={{ ...s.select, flex:'unset', width:'100%' }}
                value={reportLang} onChange={e => setReportLang(e.target.value)}>
                <option value="English">English</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
                <option value="German">Deutsch (German)</option>
                <option value="Portuguese">Português (Portuguese)</option>
                <option value="Russian">Русский (Russian)</option>
                <option value="Italian">Italiano (Italian)</option>
              </select>
            </div>
            <p style={s.disclaimer}>
              {hi ? 'Swiss Ephemeris द्वारा गणना · केवल आध्यात्मिक अन्वेषण के लिए' : 'Calculated using Swiss Ephemeris · For spiritual exploration only'}
            </p>
          </div>
        )}

        {step === 'result' && chart && (
          <div>
            {mainView === 'report' && report && (
              <button
                onClick={() => window.print()}
                style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'2px solid #C17B2B', background:'transparent', color:'#C17B2B', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'13px', cursor:'pointer', marginBottom:'12px' }}>
                ⬇️ {hi ? 'रिपोर्ट डाउनलोड करें' : 'DOWNLOAD FULL REPORT'}
              </button>
            )}
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              <button
                onClick={() => setMainView('chart')}
                style={{ flex:1, padding:'12px', borderRadius:'12px', border:`1px solid #C17B2B${mainView==='chart'?'':'40'}`, background: mainView==='chart' ? '#C17B2B22' : 'transparent', color: mainView==='chart' ? '#C17B2B' : '#1A1A1A', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                🔮 Chart View
              </button>
              <button
              onClick={() => report ? setMainView('report') : generateReport()}
              style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', background: reportLoading ? '#A0622A' : mainView==='report' ? '#A0622A' : '#C17B2B', color:'#FFFFFF', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 16px rgba(193,123,43,0.4)', letterSpacing:'0.5px' }}>
              {reportLoading ? '⏳ Generating...' : report ? '📜 Prediction Report' : '📜 Generate Report'}
            </button>
          </div>
<div style={{ textAlign:'center', marginTop:'8px', marginBottom:'4px' }}>
  <span
    onClick={() => setShowDisclaimer(d => !d)}
    style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#8B5E3C', opacity:0.6, cursor:'pointer', borderBottom:'1px dashed #8B5E3C50' }}>
    ⓘ AI-generated reading · not professional advice
  </span>
  {showDisclaimer && (
    <div style={{ marginTop:'8px', padding:'12px', background:'#FDF6EC', borderRadius:'10px', border:'1px solid #C17B2B20', fontSize:'11px', color:'#8B5E3C', lineHeight:1.7, textAlign:'left' }}>
      This horoscope is generated by AI using classical Vedic astrology rules. While it may be fairly accurate, please do not make major life decisions — medical, financial, legal or personal — based solely on this reading. It is intended for reflection and guidance only.
    </div>
  )}
</div>
{reportError && <p style={{ color:'#C0544A', fontSize:'12px', textAlign:'center', marginBottom:'12px', fontFamily:"'DM Sans',sans-serif" }}>{reportError}</p>}
            {mainView === 'chart' && <>
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'24px', fontWeight:600, color:T.text, margin:'0 0 4px' }}>
                {form.name ? `${form.name}${hi ? ' की कुंडली' : "'s Chart"}` : (hi ? 'आपकी जन्म कुंडली' : 'Your Birth Chart')}
              </p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'8px' }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', opacity:0.45, color:T.text, margin:0 }}>
                  {form.day} {MONTHS[+form.month-1]} {form.year} · {form.city}
                </p>
                <button
                  onClick={() => { setStep('form'); setChart(null); setReport(null); setMainView('chart'); window.scrollTo(0,0); }}
                  style={{ background:'none', border:`1px solid #C17B2B50`, borderRadius:'6px', color:'#C17B2B', fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:600, cursor:'pointer', padding:'2px 8px', letterSpacing:'0.5px' }}>
                  ✏️ Edit
                </button>
              </div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'13px', color:ACCENT, fontWeight:700 }}>
                {hi ? 'लग्न:' : 'Lagna:'} {chart.ascendant.sign} · {chart.ascendant.nakshatra} Nakshatra Pada {chart.ascendant.pada}
              </p>
            </div>

            <div style={{ marginBottom:'16px' }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'#C17B2B', opacity:0.7, margin:'0 0 6px' }}>
                {hi ? 'उत्तर भारतीय' : 'North Indian'}
              </p>
              <div style={{ display:'flex', gap:'6px', marginBottom:'10px' }}>
                <button style={s.toggleBtn(chartView === 'north')} onClick={() => setChartView('north')}>D1 Lagna</button>
                <button style={s.toggleBtn(chartView === 'north_d9')} onClick={() => setChartView('north_d9')}>D9 Navamsha</button>
                <button style={s.toggleBtn(chartView === 'north_d10')} onClick={() => setChartView('north_d10')}>D10 Dashamsha</button>
              </div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'#C17B2B', opacity:0.7, margin:'0 0 6px' }}>
                {hi ? 'दक्षिण भारतीय' : 'South Indian'}
              </p>
              <div style={{ display:'flex', gap:'6px' }}>
                <button style={s.toggleBtn(chartView === 'south')} onClick={() => setChartView('south')}>D1 Lagna</button>
                <button style={s.toggleBtn(chartView === 'south_d9')} onClick={() => setChartView('south_d9')}>D9 Navamsha</button>
                <button style={s.toggleBtn(chartView === 'south_d10')} onClick={() => setChartView('south_d10')}>D10 Dashamsha</button>
              </div>
            </div>

            <div style={{ ...s.card, padding:'16px 12px' }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', opacity:0.45, textAlign:'center', margin:'0 0 10px', color:'#1A1A1A', letterSpacing:'1px', textTransform:'uppercase' }}>
                {chartView === 'north' && 'D1 — Lagna Chart'}
                {chartView === 'north_d9' && 'D9 — Navamsha Chart'}
                {chartView === 'north_d10' && 'D10 — Dashamsha Chart'}
                {chartView === 'south' && 'D1 — Lagna Chart'}
                {chartView === 'south_d9' && 'D9 — Navamsha Chart'}
                {chartView === 'south_d10' && 'D10 — Dashamsha Chart'}
              </p>
              {chartView === 'north'     && <NorthChart chart={chart} />}
              {chartView === 'north_d9'  && <NorthChart chart={chart.navamsa} />}
              {chartView === 'north_d10' && <NorthChart chart={chart.dashamsha} />}
              {chartView === 'south'     && <SouthChart chart={chart} />}
              {chartView === 'south_d9'  && <SouthChart chart={chart.navamsa} />}
              {chartView === 'south_d10' && <SouthChart chart={chart.dashamsha} />}
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', color:'#7A4A1A', opacity:0.7, textAlign:'center', marginBottom:'16px', lineHeight:1.8 }}>
              ↑ Exalted · ↓ Debilitated · ᴿ Retrograde · ☌ Combust · □ Vargottama
            </p>
            <div style={s.card}>
              <p style={s.cardTitle}>🌟 {hi ? 'ग्रह स्थिति' : 'Planetary Positions'}</p>
              {[['Ascendant',{ sign:chart.ascendant.sign, nakshatra:chart.ascendant.nakshatra, nakshatra_lord:chart.ascendant.nakshatra_lord, house:1, degrees_in_sign:chart.ascendant.degrees }], ...Object.entries(chart.planets)].map(([name, p]) => (
                <div key={name} style={s.planetRow}>
                  <span style={{ color:ACCENT, fontWeight:700, minWidth:70 }}>{hi ? (PH[name] || name) : name}</span>
                  <span style={{ opacity:0.75, flex:1 }}>
  {p.sign}{p.house ? ` · H${p.house}` : ''} · {Math.floor(p.degrees_in_sign)}°{Math.floor((p.degrees_in_sign % 1) * 60)}′
</span>
                  <span style={{ opacity:0.45, fontSize:'11px', textAlign:'right' }}>{p.nakshatra || ''}{p.nakshatra_lord ? ` · ${p.nakshatra_lord}` : ''}</span>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <p style={s.cardTitle}>⏳ {hi ? 'विंशोत्तरी दशा' : 'Vimshottari Dasha'}</p>
              <div style={{ padding:'12px', background:`${ACCENT}18`, borderRadius:'10px', marginBottom:'14px', border:`1px solid ${ACCENT}40` }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'10px', opacity:0.55, color:T.text, margin:'0 0 4px', letterSpacing:'1px', textTransform:'uppercase' }}>
                  {hi ? 'अभी चल रहा है' : 'Currently Running'}
                </p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'19px', color:ACCENT, margin:0, fontWeight:600 }}>
                  {hi ? DH[chart.current_dasha.mahadasha] : chart.current_dasha.mahadasha} {hi ? 'महादशा' : 'Mahadasha'} / {hi ? DH[chart.current_dasha.antadasha] : chart.current_dasha.antadasha} {hi ? 'अंतर्दशा' : 'Antardasha'}
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', opacity:0.45, color:T.text, margin:'4px 0 0' }}>
                  {chart.current_dasha.ad_start} → {chart.current_dasha.ad_end}
                </p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {chart.dashas.map(d => {
                  const today = new Date();
                  const isActive = new Date(d.start) <= today && today <= new Date(d.end);
                  const isPast   = new Date(d.end) < today;
                  const isMDSel  = selectedMD === d.lord;
                  return (
                    <div key={d.lord}>
                      <div onClick={() => { setSelectedMD(isMDSel ? null : d.lord); setSelectedAD(null); }}
                        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'10px', cursor:'pointer', background: isActive ? `${ACCENT}22` : isMDSel ? `${ACCENT}10` : 'transparent', border: isActive ? `1px solid ${ACCENT}` : `1px solid ${ACCENT}20`, opacity: isPast ? 0.45 : 1 }}>
                        <span style={{ fontWeight: isActive ? 700 : 500, color: isActive ? ACCENT : T.text, fontSize:'13px', fontFamily:"'DM Sans',sans-serif" }}>
                          {hi ? DH[d.lord] : d.lord} {hi ? 'महादशा' : 'MD'}
                        </span>
                        <span style={{ fontSize:'11px', opacity:0.55, fontFamily:"'DM Sans',sans-serif", color:T.text }}>
                          {d.start.slice(0,4)}–{d.end.slice(0,4)} {isMDSel ? '▲' : '▼'}
                        </span>
                      </div>
                      {isMDSel && (
                        <div style={{ marginLeft:'12px', marginTop:'4px', display:'flex', flexDirection:'column', gap:'3px' }}>
                          {d.antadashas.map(ad => {
                            const adActive = new Date(ad.start) <= today && today <= new Date(ad.end);
                            const adKey    = `${d.lord}_${ad.lord}`;
                            const isADSel  = selectedAD === adKey;
                            const pds      = isADSel ? calcPratyantara(ad.start, ad.end, ad.lord) : [];
                            return (
                              <div key={ad.lord}>
                                <div onClick={() => setSelectedAD(isADSel ? null : adKey)}
                                  style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', borderRadius:'8px', cursor:'pointer', background: adActive ? `${ACCENT}18` : isADSel ? `${ACCENT}08` : 'transparent', border: adActive ? `1px solid ${ACCENT}80` : `1px solid ${ACCENT}15` }}>
                                  <span style={{ fontSize:'12px', color: adActive ? ACCENT : T.text, fontFamily:"'DM Sans',sans-serif", fontWeight: adActive ? 700 : 400 }}>
                                    {hi ? DH[ad.lord] : ad.lord} {hi ? 'अंतर्दशा' : 'AD'}
                                  </span>
                                  <span style={{ fontSize:'10px', opacity:0.5, fontFamily:"'DM Sans',sans-serif", color:T.text }}>
                                    {ad.start} → {ad.end} {isADSel ? '▲' : '▼'}
                                  </span>
                                </div>
                                {isADSel && (
                                  <div style={{ marginLeft:'12px', marginTop:'3px', display:'flex', flexDirection:'column', gap:'2px' }}>
                                    {pds.map(pd => {
                                      const pdActive = new Date(pd.start) <= today && today <= new Date(pd.end);
                                      return (
                                        <div key={pd.lord} style={{ display:'flex', justifyContent:'space-between', padding:'5px 8px', borderRadius:'6px', background: pdActive ? `${ACCENT}12` : 'transparent', border:`1px solid ${ACCENT}10` }}>
                                          <span style={{ fontSize:'11px', color: pdActive ? ACCENT : T.text, fontFamily:"'DM Sans',sans-serif", fontWeight: pdActive ? 700 : 400 }}>
                                            {hi ? DH[pd.lord] : pd.lord} {hi ? 'प्रत्यंतर' : 'PD'}
                                          </span>
                                          <span style={{ fontSize:'10px', opacity:0.45, fontFamily:"'DM Sans',sans-serif", color:T.text }}>
                                            {pd.start} → {pd.end}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            </div>
            </>}
            {mainView === 'report' && report && (
              <div>
                {report.highlights && report.highlights.length > 0 && (
                  <div style={{ background:'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border:'1px solid #4A9B6F40', borderRadius:'14px', padding:'18px', marginBottom:'20px' }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'#4A9B6F', margin:'0 0 12px' }}>✨ Chart Highlights</p>
                    {report.highlights.map((h, i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom: i < report.highlights.length-1 ? '8px' : 0 }}>
                        <span style={{ color:'#4A9B6F', fontWeight:700, fontSize:'14px', marginTop:'1px' }}>✓</span>
                        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'15px', color:'#1A3A2A', lineHeight:1.6, margin:0 }}>{h}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'16px' }}>
                  {REPORT_SECTIONS.map(sec => (
                    <button key={sec.id}
                      onClick={() => setActiveSection(sec.id)}
                      style={{ padding:'6px 12px', borderRadius:'20px', border:`1px solid ${activeSection===sec.id ? '#C17B2B' : '#C17B2B33'}`, background: activeSection===sec.id ? '#C17B2B22' : 'transparent', color: activeSection===sec.id ? '#C17B2B' : '#6B5B45', fontFamily:"'DM Sans',sans-serif", fontSize:'11px', fontWeight:600, cursor:'pointer' }}>
                      {sec.icon} {sec.title}
                    </button>
                  ))}
                </div>
                {REPORT_SECTIONS.map(sec => {
                  const data = report[sec.id];
                  if (!data) return null;
                  const badgeColor = BADGE_COLORS[data.badge] || '#C17B2B';
                  return (
                    <div key={sec.id} id={`section-${sec.id}`} style={{ background:'#FFFDF8', border:'1px solid #C17B2B22', borderRadius:'14px', marginBottom:'16px', overflow:'hidden', boxShadow:'0 2px 12px rgba(193,123,43,0.08)' }}>
                      <div style={{ padding:'14px 18px', borderBottom:'1px solid #C17B2B15', display:'flex', alignItems:'center', gap:'12px', background:'#FDF8F0' }}>
                        <span style={{ fontSize:'20px' }}>{sec.icon}</span>
                        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'18px', fontWeight:600, color:'#1A1A1A', flex:1 }}>{sec.title}</span>
                        <span style={{ padding:'3px 10px', borderRadius:'20px', background:`${badgeColor}18`, border:`1px solid ${badgeColor}55`, color:badgeColor, fontSize:'10px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{data.badge}</span>
                      </div>
                      <div style={{ padding:'18px' }}>
                        {data.content.split('\n\n').map((para, pi) => (
                          <p key={pi} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'15px', color:'#3A2A1A', lineHeight:1.9, marginBottom: pi < data.content.split('\n\n').length-1 ? '14px' : 0 }}>
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div style={{ padding:'18px', background:'#FDF6EC', borderRadius:'12px', border:'2px solid #C17B2B40', marginBottom:'16px' }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', fontWeight:700, color:'#C17B2B', margin:'0 0 6px', letterSpacing:'0.5px' }}>⚠️ Important Disclaimer</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#8B5E3C', lineHeight:1.8, margin:0 }}>
                    This report is generated by AI using classical Vedic astrology principles and may reflect genuine karmic patterns. However, astrology indicates tendencies — not fixed outcomes. Do not make medical, financial, legal or major personal decisions based solely on this reading. For serious matters, consult a qualified Jyotish practitioner and appropriate professionals.
                  </p>
                </div>
                <div style={{ textAlign:'center', padding:'20px 16px', background:'#FDF6EC', borderRadius:'14px', border:'1px solid #C17B2B20', marginBottom:'16px' }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', color:'#2C1810', margin:'0 0 4px', fontWeight:600 }}>🙏 Dakshina</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'#8B5E3C', margin:'0 0 16px', lineHeight:1.6 }}>
                    If this reading resonated with you, consider offering a small dakshina to support this work. Scan with any UPI app.
                  </p>
                  <img src="/upi-qr.png" alt="UPI QR Code" style={{ width:180, height:180, borderRadius:'12px', border:'2px solid #C17B2B30' }} />
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#8B5E3C', marginTop:'10px', opacity:0.7 }}>anadib1010-2@okicici</p>
                </div>
              </div>
            )}    
            {chart.reading ? (
              <div style={s.card}>
                <p style={s.cardTitle}>✨ {hi ? 'आपका व्यक्तिगत विश्लेषण' : 'Your Personal Reading'}</p>
                <p style={s.reading}>{chart.reading}</p>
              </div>
            ) : (
              <div style={{ ...s.card, textAlign:'center', opacity:0.5 }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'16px', color:T.text, fontStyle:'italic' }}>
                  {hi ? 'AI रीडिंग शीघ्र उपलब्ध होगी।' : 'AI Reading will appear once the API key is configured.'}
                </p>
              </div>
            )}
            {chart.reading && (
              <div style={{ textAlign:'center', padding:'20px 16px', background:'#FDF6EC', borderRadius:'14px', border:'1px solid #C17B2B20', marginBottom:'16px' }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', color:'#2C1810', margin:'0 0 4px', fontWeight:600 }}>🙏 Dakshina</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'12px', color:'#8B5E3C', margin:'0 0 16px', lineHeight:1.6 }}>
                  If this reading resonated with you, consider offering a small dakshina to support this work. Scan with any UPI app.
                </p>
                <img src="/upi-qr.png" alt="UPI QR Code" style={{ width:180, height:180, borderRadius:'12px', border:'2px solid #C17B2B30' }} />
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:'11px', color:'#8B5E3C', marginTop:'10px', opacity:0.7 }}>anadib1010-2@okicici</p>
              </div>
            )}
            <button onClick={() => { setStep('form'); setChart(null); setError(''); }}
              style={{ ...s.submitBtn, background:`${ACCENT}20`, color:ACCENT, marginTop:'4px' }}>
              {hi ? '↩ नई कुंडली बनाएं' : '↩ CALCULATE ANOTHER CHART'}
            </button>
            <button
              onClick={() => window.print()}
              style={{ ...s.submitBtn, background:'transparent', color:'#C17B2B', border:'2px solid #C17B2B', marginBottom:'8px' }}>
              ⬇️ {hi ? 'चार्ट डाउनलोड करें' : 'DOWNLOAD CHART'}
            </button>
            <p style={s.disclaimer}>
              {hi ? 'यह ज्योतिष केवल आध्यात्मिक अन्वेषण के लिए है।' : 'For spiritual exploration only. Not a substitute for professional advice.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}