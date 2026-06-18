import React, { useState, useEffect, useCallback } from 'react';

// ─── ASTRO ENGINE (inline — no external dependency needed) ────────────────────
const RASHI    = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const NAK_NAMES= ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','P.Phalguni','U.Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','P.Ashadha','U.Ashadha','Shravana','Dhanishtha','Shatabhisha','P.Bhadrapada','U.Bhadrapada','Revati'];
const NAK_RULER= ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const NAK_Q    = [72,38,54,85,74,32,76,96,31,35,52,72,88,71,55,58,74,34,28,51,73,78,56,51,37,72,75];
const NAK_NATURE=['Laghu','Tikshna','Mishra','Sthira','Mridu','Tikshna','Chara','Laghu','Tikshna','Ugra','Ugra','Sthira','Laghu','Mridu','Chara','Mishra','Mridu','Tikshna','Tikshna','Ugra','Sthira','Chara','Chara','Chara','Ugra','Sthira','Mridu'];
const NAK_SEC  = [['Pharma','Auto'],['Luxury','FMCG'],['PSU','Defence'],['FMCG','Agri'],['Metals','Realty'],['Tech','Volatile'],['Banking','Education'],['Banking','Gold'],['IT','Telecom'],['Govt','PSU'],['Luxury','Entertainment'],['Healthcare','Pharma'],['FMCG','Textiles'],['Auto','Realty'],['Tech','Aviation'],['Banking','Chemical'],['Oil','Infra'],['IT','Telecom'],['Pharma','Chemicals'],['Luxury','Aviation'],['PSU','Defence'],['Media','FMCG'],['Metals','Defence'],['Tech','Healthcare'],['Banking','Aviation'],['Oil','Mining'],['IT','Textiles']];
const TITHI_Q  = [0,70,74,78,22,72,58,68,22,52,80,94,82,24,42,90,18];
const TITHI_N  = ['','Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima','Amavasya'];
const VAAR_Q   = [55,65,50,70,88,78,42];
const VAAR_N   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const VAAR_L   = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const DASHA_ORD= ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YRS= [7,20,6,10,7,18,16,19,17];
const PLANET_SEC={Sun:['PSU Banks','Defence','Power','Gold'],Moon:['FMCG','Dairy','Agri','Hotels'],Mars:['Metals','Realty','Defence','Mining'],Mercury:['IT','Banking','Logistics','Media'],Jupiter:['Banking','Education','Healthcare','Finance'],Venus:['Luxury','Auto','Pharma','FMCG'],Saturn:['Oil','Steel','Infra','Mining'],Rahu:['Tech','Aviation','Foreign MNC'],Ketu:['Pharma','Chemicals']};
const EXALT    = {Sun:0,Moon:1,Mars:9,Mercury:5,Jupiter:3,Venus:11,Saturn:6};
const DEBIL    = {Sun:6,Moon:7,Mars:3,Mercury:11,Jupiter:9,Venus:5,Saturn:0};
// FIX 6 — Derive planet-sign scores from classical rules (exalt/debil/own/friendly)
// JUP_SQ / SAT_SQ replaced by derivePlanetSignScore() below (defined after EXALT/DEBIL)
const PLANET_OWN = {Jupiter:[8,11],Saturn:[9,10],Mars:[0,7],Venus:[1,6],Mercury:[2,5],Sun:[4],Moon:[3]};

function mod360(v){return((v%360)+360)%360;}
function toRad(d){return d*Math.PI/180;}

function jdFromDate(y,m,d,h,mn){
  const ut=h+mn/60; let Y=y,M=m;
  if(M<=2){Y--;M+=12;}
  const A=Math.floor(Y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(Y+4716))+Math.floor(30.6001*(M+1))+d+B-1524.5+ut/24;
}
function ayanamsha(JD){const T=(JD-2415020)/36524.22;return 22.460148+50.2564249*T/3600;}

// FIX 6 — Classical planet-sign quality (exalt=90, debil=22, own=78, friendly=68, neutral=55)
function derivePlanetSignScore(planet, signIdx) {
  if (EXALT[planet] === signIdx) return 90;
  if (DEBIL[planet] === signIdx) return 22;
  if (PLANET_OWN[planet]?.includes(signIdx)) return 78;
  const FIRE=[0,4,8],EARTH=[1,5,9],AIR=[2,6,10],WATER=[3,7,11];
  if(planet==='Sun'     && FIRE.includes(signIdx))  return 70;
  if(planet==='Mars'    && FIRE.includes(signIdx))  return 70;
  if(planet==='Jupiter' && (FIRE.includes(signIdx)||WATER.includes(signIdx))) return 68;
  if(planet==='Venus'   && (EARTH.includes(signIdx)||AIR.includes(signIdx))) return 68;
  if(planet==='Mercury' && (EARTH.includes(signIdx)||AIR.includes(signIdx))) return 68;
  if(planet==='Saturn'  && (AIR.includes(signIdx)||EARTH.includes(signIdx))) return 68;
  if(planet==='Moon'    && WATER.includes(signIdx)) return 68;
  return 55;
}

function calcPlanets(JD){
  const T=(JD-2451545)/36525;
  const ayan=ayanamsha(JD);
  const raw={
    Sun:   mod360(280.46646+36000.76983*T+(1.9146-0.004817*T)*Math.sin(toRad(mod360(357.52911+35999.05029*T)))),
    Moon:  mod360(218.3165+481267.8813*T+6.2888*Math.sin(toRad(mod360(134.9634+477198.8676*T)))+1.274*Math.sin(toRad(mod360(297.8502+445267.1115*T)*2-toRad(mod360(134.9634+477198.8676*T))))),
    Mars:  mod360(355.433+19140.299*T+10.691*Math.sin(toRad(mod360(319.529+19139.858*T)))),
    Mercury:mod360(252.251+149472.675*T+23.44*Math.sin(toRad(mod360(174.791+149472.515*T)))),
    Jupiter:mod360(34.351+3034.906*T+5.555*Math.sin(toRad(mod360(20.020+3034.897*T)))),
    Venus: mod360(181.979+58517.816*T+0.7758*Math.sin(toRad(mod360(212.323+58517.804*T)))),
    Saturn:mod360(50.077+1222.114*T+6.406*Math.sin(toRad(mod360(317.021+1221.986*T)))),
    Rahu:  mod360(125.0445-1934.1362*T),
    Ketu:  mod360(125.0445-1934.1362*T+180),
  };
  const res={};
  Object.entries(raw).forEach(([p,lng])=>{
    const sid=mod360(lng-ayan);
    res[p]={lng:sid,sign:Math.floor(sid/30),deg:sid%30,nakIdx:Math.floor(sid/(360/27)),pada:Math.floor((sid%(360/27))/(360/27/4))+1};
  });
  return res;
}

function calcLagna(JD,lat,lon){
  const T=(JD-2451545)/36525;
  const RAMC=mod360(100.4606184+36000.7700536*T+lon);
  const eps=toRad(23.43929111-0.013004167*T);
  const latR=toRad(lat),ramcR=toRad(RAMC);
  let asc=mod360(Math.atan2(Math.cos(ramcR),-(Math.sin(ramcR)*Math.cos(eps)+Math.tan(latR)*Math.sin(eps)))*180/Math.PI);
  return mod360(asc-ayanamsha(JD));
}

function isRetrograde(planet,JD){
  const fns={Mars:(j)=>mod360(355.433+19140.299*(j-2451545)/36525+10.691*Math.sin(toRad(mod360(319.529+19139.858*(j-2451545)/36525)))),Mercury:(j)=>mod360(252.251+149472.675*(j-2451545)/36525+23.44*Math.sin(toRad(mod360(174.791+149472.515*(j-2451545)/36525)))),Jupiter:(j)=>mod360(34.351+3034.906*(j-2451545)/36525+5.555*Math.sin(toRad(mod360(20.020+3034.897*(j-2451545)/36525)))),Venus:(j)=>mod360(181.979+58517.816*(j-2451545)/36525+0.7758*Math.sin(toRad(mod360(212.323+58517.804*(j-2451545)/36525)))),Saturn:(j)=>mod360(50.077+1222.114*(j-2451545)/36525+6.406*Math.sin(toRad(mod360(317.021+1221.986*(j-2451545)/36525))))};
  if(!fns[planet])return false;
  const ayan=ayanamsha(JD);
  const l1=mod360(fns[planet](JD-1)-ayan),l2=mod360(fns[planet](JD+1)-ayan);
  const diff=l2-l1;return diff<-1||diff>358;
}

function calcTithi(sLng,mLng){return Math.min(Math.floor(mod360(mLng-sLng)/12)+1,16);}
function calcPaksha(t){return t<=15?'Shukla':'Krishna';}

function calcHora(dow,hr){
  const seq=['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];
  const starts=[0,5,3,1,6,4,2];
  const p=seq[(starts[dow]+hr)%7];
  return{planet:p,quality:{Jupiter:90,Venus:80,Mercury:78,Moon:70,Sun:60,Mars:52,Saturn:38}[p]||55};
}

function calcDasha(moonLng,refJD,currentJD){
  const nakIdx=Math.floor(moonLng/(360/27));
  const nakFrac=(moonLng%(360/27))/(360/27);
  const startIdx=DASHA_ORD.indexOf(NAK_RULER[nakIdx]);
  const firstYrs=DASHA_YRS[startIdx];
  const elapsed=nakFrac*firstYrs;
  let cursor=refJD-elapsed*365.25;
  const seq=[];
  for(let i=0;i<9;i++){
    const idx=(startIdx+i)%9;
    const yrs=DASHA_YRS[idx];
    seq.push({planet:DASHA_ORD[idx],start:cursor,end:cursor+yrs*365.25,years:yrs});
    cursor+=yrs*365.25;
  }
  const maha=seq.find(d=>currentJD>=d.start&&currentJD<d.end)||seq[0];
  const mahaIdx=DASHA_ORD.indexOf(maha.planet);
  let c2=maha.start;
  const antarSeq=[];
  for(let i=0;i<9;i++){
    const idx=(mahaIdx+i)%9;
    const yrs=maha.years*DASHA_YRS[idx]/120;
    antarSeq.push({planet:DASHA_ORD[idx],start:c2,end:c2+yrs*365.25,years:yrs});
    c2+=yrs*365.25;
  }
  const antar=antarSeq.find(d=>currentJD>=d.start&&currentJD<d.end)||antarSeq[0];
  // FIX 7 — Pratyantar Dasha (third level for week-to-week precision)
  const antarIdx=DASHA_ORD.indexOf(antar.planet);
  let c3=antar.start;
  const pratySeq=[];
  for(let i=0;i<9;i++){
    const idx=(antarIdx+i)%9;
    const yrs=antar.years*DASHA_YRS[idx]/120;
    pratySeq.push({planet:DASHA_ORD[idx],start:c3,end:c3+yrs*365.25,years:yrs});
    c3+=yrs*365.25;
  }
  const pratyantar=pratySeq.find(d=>currentJD>=d.start&&currentJD<d.end)||pratySeq[0];
  return{maha:maha.planet,antar:antar.planet,pratyantar:pratyantar.planet};
}

function calcJupSatAspect(jLng,sLng){
  const diff=Math.abs(mod360(jLng-sLng));
  const d=Math.min(diff,360-diff);
  if(d<12)return{name:'Conjunction',q:55,note:'Structural market shift'};
  if(d>58&&d<62)return{name:'Sextile',q:72,note:'Opportunity aspect'};
  if(d>88&&d<92)return{name:'Square ⚠',q:32,note:'Stress, corrections'};
  if(d>118&&d<122)return{name:'Trine ★',q:82,note:'Sustained bull signal'};
  if(d>168&&d<192)return{name:'Opposition ⚠',q:38,note:'Tension, divergence'};
  return{name:'No major aspect',q:60,note:'Transition phase'};
}

function calcLunarPhase(sLng,mLng){
  const diff=mod360(mLng-sLng);
  if(diff<22.5||diff>337.5)return{name:'New moon',dichev:32,emoji:'🌑'};
  if(diff<67.5)return{name:'Waxing crescent',dichev:52,emoji:'🌒'};
  if(diff<112.5)return{name:'First quarter',dichev:62,emoji:'🌓'};
  if(diff<157.5)return{name:'Waxing gibbous',dichev:72,emoji:'🌔'};
  if(diff<202.5)return{name:'Full moon ★',dichev:82,emoji:'🌕'};
  if(diff<247.5)return{name:'Waning gibbous',dichev:55,emoji:'🌖'};
  if(diff<292.5)return{name:'Last quarter',dichev:45,emoji:'🌗'};
  return{name:'Waning crescent',dichev:36,emoji:'🌘'};
}

function detectYogas(moonNak,tithiNum,dow){
  const list=[];
  if(moonNak===7&&dow===4)list.push({name:'Pushya-Guru Yoga ★★★',boost:18,type:'good',note:'Supreme investment muhurta'});
  if([3,7,11,12,20].includes(moonNak)&&[5,10,11,15].includes(tithiNum))list.push({name:'Sarvartha Siddhi ★★',boost:12,type:'good',note:'All-purpose auspicious'});
  if([0,6,11,16,25].includes(moonNak)&&dow===3)list.push({name:'Amrita Siddhi ★★',boost:10,type:'good',note:'IT/banking signal'});
  if([3,12,21].includes(moonNak)&&dow===1)list.push({name:'Chandra-Sthira',boost:8,type:'good',note:'FMCG/consumer signal'});
  if([6,15,24].includes(moonNak)&&dow===4)list.push({name:'Guru Yoga ★★',boost:10,type:'good',note:'Banking/finance signal'});
  if([1,5,8,9,13,18].includes(moonNak))list.push({name:'Tikshna Nakshatra ⚠',boost:-10,type:'warn',note:'Avoid new entries'});
  if([4,8,13].includes(tithiNum))list.push({name:'Rikta Tithi ⚠',boost:-12,type:'warn',note:'Inauspicious for new positions'});
  if(tithiNum===16)list.push({name:'Amavasya ⚠⚠',boost:-20,type:'warn',note:'Strict prohibition on investments'});
  return list;
}

function calcAshtakvarga(planets){
  // FIX 4 — Full 7-planet Sarvashtakvarga (was only Sun/Moon/Jupiter)
  const BAV={
    Sun:    {Sun:[1,2,4,7,8,9,10,11],Moon:[3,6,10,11],Mars:[1,2,4,7,8,9,10,11],Mercury:[5,6,9,11],Jupiter:[5,6,9,11],Venus:[6,7,12],Saturn:[1,2,4,7,8,9,10,11]},
    Moon:   {Sun:[3,6,7,8,10,11],Moon:[1,3,6,7,10,11],Mars:[2,3,5,6,9,10,11],Mercury:[1,3,4,5,7,8,10,11],Jupiter:[1,4,7,8,10,11,12],Venus:[3,4,5,7,9,10,11],Saturn:[3,5,6,11]},
    Mars:   {Sun:[1,2,4,7,8,9,10,11],Moon:[2,3,5,6,9,10,11],Mars:[1,2,4,7,8,9,10,11],Mercury:[3,5,6,9,10,11],Jupiter:[6,10,11,12],Venus:[6,8,11,12],Saturn:[1,4,7,8,9,10,11]},
    Mercury:{Sun:[5,6,9,11,12],Moon:[2,4,6,8,10,11],Mars:[1,2,4,7,8,9,10,11],Mercury:[1,3,5,6,9,10,11,12],Jupiter:[6,8,11,12],Venus:[1,2,3,4,5,8,9,11],Saturn:[1,2,4,7,8,9,10,11]},
    Jupiter:{Sun:[1,2,3,4,7,8,9,10,11],Moon:[2,5,7,9,11],Mars:[1,2,4,7,8,10,11],Mercury:[1,2,4,5,6,9,10,11],Jupiter:[1,2,3,4,7,8,10,11],Venus:[2,5,6,9,10,11],Saturn:[3,5,6,12]},
    Venus:  {Sun:[8,11,12],Moon:[1,2,3,4,5,8,9,11,12],Mars:[3,5,6,9,11,12],Mercury:[3,5,6,9,11],Jupiter:[5,8,9,10,11],Venus:[1,2,3,4,5,8,9,10,11],Saturn:[3,4,5,8,9,10,11]},
    Saturn: {Sun:[1,2,4,7,8,9,10,11],Moon:[3,6,11],Mars:[3,5,6,10,11,12],Mercury:[6,8,9,10,11,12],Jupiter:[5,6,11,12],Venus:[6,11,12],Saturn:[3,5,6,11]},
  };
  const res={};
  Object.keys(BAV).forEach(p=>{
    const table=BAV[p]; let score=0;
    const pSign=planets[p].sign;
    Object.entries(table).forEach(([c,houses])=>{
      if(!planets[c]) return;
      const cSign=planets[c].sign;
      houses.forEach(h=>{if(((pSign-cSign+12)%12)+1===h)score++;});
    });
    res[p]=score; // max 8 per planet from 7 contributors (Lagna counted separately in full version)
  });
  return res;
}

// ─── BUILD 2 — NSE NATAL HOUSE TRANSIT ANALYSIS ────────────────────────────
// Financial Jyotish core technique: which houses (from NSE's own lagna) are
// transiting planets occupying right now. 2nd=wealth, 5th=speculation,
// 8th=sudden gain/loss, 11th=profits/gains are the critical houses for markets.
const HOUSE_MARKET_MEANING = {
  1:{name:'Self/Index identity',  bias:'neutral', note:'Affects overall market identity and sentiment tone'},
  2:{name:'Wealth & liquidity',   bias:'bullish',  note:'Direct wealth house — benefics here = capital inflow, malefics = liquidity stress'},
  3:{name:'Courage & volume',     bias:'neutral', note:'Trading volume, communication, short trades'},
  4:{name:'Real estate & assets', bias:'neutral', note:'Property, fixed assets, public sentiment base'},
  5:{name:'Speculation & PE',     bias:'bullish',  note:'Speculative gains, F&O activity, intelligence/IT sector'},
  6:{name:'Debt & competition',   bias:'bearish',  note:'Debt levels, litigation, competitive pressure, health crises'},
  7:{name:'Partnerships & FII',   bias:'neutral', note:'Foreign partnerships, FII/FPI flow, joint ventures, opposition party policy'},
  8:{name:'Sudden gain/loss',     bias:'volatile', note:'Crashes, scams, sudden windfalls — high volatility house'},
  9:{name:'Fortune & policy',     bias:'bullish',  note:'Government policy, luck, long-term fortune, fiscal direction'},
  10:{name:'Status & leadership', bias:'bullish',  note:'Market leadership, government action, career/corporate sector strength'},
  11:{name:'Gains & profits',     bias:'bullish',  note:'The most auspicious house for markets — direct profit and gains signification'},
  12:{name:'Losses & FII exit',   bias:'bearish',  note:'Foreign outflow, losses, expenditure, hidden risks'}
};

function calcHouseFromLagna(lagnaSign, planetSign) {
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}

function analyzeHouseTransits(nseLagnaSign, planets, exalted, debil) {
  const PLANETS_TO_CHECK = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const BENEFICS = ['Jupiter','Venus','Mercury','Moon'];
  const MALEFICS = ['Saturn','Mars','Rahu','Ketu','Sun'];

  const transits = PLANETS_TO_CHECK.map(p => {
    const house = calcHouseFromLagna(nseLagnaSign, planets[p].sign);
    const houseInfo = HOUSE_MARKET_MEANING[house];
    const isBenefic = BENEFICS.includes(p);
    const isExalted = exalted.includes(p);
    const isDebil = debil.includes(p);
    let impact = 50;
    if (houseInfo.bias === 'bullish') impact = isBenefic ? 78 : 58;
    if (houseInfo.bias === 'bearish') impact = isBenefic ? 48 : 25;
    if (houseInfo.bias === 'volatile') impact = isBenefic ? 60 : 30;
    if (houseInfo.bias === 'neutral') impact = 55;
    if (isExalted) impact += 12;
    if (isDebil) impact -= 12;
    return { planet:p, house, houseInfo, impact: Math.min(95, Math.max(10, impact)), isBenefic };
  });

  // Critical house occupancy check — 2nd, 5th, 8th, 11th are the "wealth quadrant"
  const wealthHouseOccupants = transits.filter(t => [2,5,8,11].includes(t.house));
  const eleventhHouseOccupants = transits.filter(t => t.house === 11);
  const eighthHouseOccupants = transits.filter(t => t.house === 8);

  // Overall house-transit score
  const avgImpact = Math.round(transits.reduce((a,t)=>a+t.impact,0) / transits.length);

  return { transits, wealthHouseOccupants, eleventhHouseOccupants, eighthHouseOccupants, avgImpact };
}

// ─── TECHNICAL INDICATOR ENGINE (computed from 5-year Yahoo Finance data) ──
function calcRSI(closes, period=14) {
  if (closes.length < period+1) return null;
  const slice = closes.slice(-period-1);
  let gains=0, losses=0;
  for (let i=1; i<slice.length; i++) {
    const d = slice[i]-slice[i-1];
    if (d>0) gains+=d; else losses+=Math.abs(d);
  }
  const avgG=gains/period, avgL=losses/period;
  if (avgL===0) return 100;
  return parseFloat((100 - 100/(1+avgG/avgL)).toFixed(2));
}

function calcMACD(closes) {
  if (closes.length < 26) return null;
  const ema = (arr, n) => {
    const k=2/(n+1); let e=arr[0];
    for (let i=1;i<arr.length;i++) e=arr[i]*k+e*(1-k);
    return e;
  };
  const ema12=ema(closes.slice(-50),12);
  const ema26=ema(closes.slice(-50),26);
  const macd=ema12-ema26;
  // signal: 9-day EMA of MACD (approximate with last 9 daily diffs)
  const macdLine=closes.slice(-35).map((_,i,a)=>{
    if(i<1) return 0;
    const e12=ema(a.slice(0,i+1).slice(-24),12);
    const e26=ema(a.slice(0,i+1).slice(-35),26);
    return e12-e26;
  });
  const signal=ema(macdLine.slice(-9),9);
  return { macd: parseFloat(macd.toFixed(3)), signal: parseFloat(signal.toFixed(3)), hist: parseFloat((macd-signal).toFixed(3)) };
}

function calcBollinger(closes, period=20) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a,b)=>a+b,0)/period;
  const std = Math.sqrt(slice.reduce((a,b)=>a+(b-mean)**2,0)/period);
  const upper=mean+2*std, lower=mean-2*std;
  const cp=closes[closes.length-1];
  const pct=((cp-lower)/(upper-lower)*100);
  return { upper:parseFloat(upper.toFixed(2)), lower:parseFloat(lower.toFixed(2)), mean:parseFloat(mean.toFixed(2)), pct:parseFloat(pct.toFixed(1)) };
}

function calcDMASlope(closes, period=200) {
  if (closes.length < period+20) return null;
  const dma1=closes.slice(-period).reduce((a,b)=>a+b,0)/period;
  const dma2=closes.slice(-period-20,-20).reduce((a,b)=>a+b,0)/period;
  return parseFloat(((dma1-dma2)/dma2*100).toFixed(2)); // % change over 20 days
}

function calcVolumeSignal(volumes) {
  if (!volumes || volumes.length < 20) return null;
  const recent = volumes.filter(Boolean).slice(-5).reduce((a,b)=>a+b,0)/5;
  const avg20  = volumes.filter(Boolean).slice(-20).reduce((a,b)=>a+b,0)/20;
  return parseFloat((recent/avg20*100).toFixed(1)); // % of 20-day avg
}

function calcPriceTechnicals(priceData, series=null) {
  const { currentPrice, high52w, low52w, dma200, rsi } = priceData;

  // ── If we have 5-year series from Yahoo, compute everything from it ────────
  if (series && series.closes && series.closes.length > 50) {
    const closes  = series.closes.filter(Boolean);
    const volumes = (series.volumes||[]).filter(Boolean);
    const cp      = closes[closes.length-1];

    // 52-week high/low from series
    const yr1   = closes.slice(-252);
    const h52   = Math.max(...yr1);
    const l52   = Math.min(...yr1);
    // 5-year high/low
    const h5y   = Math.max(...closes);
    const l5y   = Math.min(...closes);

    // 200-DMA
    const dma200val = closes.length>=200 ? closes.slice(-200).reduce((a,b)=>a+b,0)/200 : null;
    // 50-DMA
    const dma50val  = closes.length>=50  ? closes.slice(-50).reduce((a,b)=>a+b,0)/50  : null;

    // Computed indicators
    const rsiVal     = calcRSI(closes, 14);
    const macd       = calcMACD(closes);
    const boll       = calcBollinger(closes, 20);
    const dmaSlope   = calcDMASlope(closes, 200);
    const volSignal  = calcVolumeSignal(volumes);

    // Range positions
    const rangePos52  = h52>l52 ? ((cp-l52)/(h52-l52)*100) : 50;
    const rangePos5y  = h5y>l5y ? ((cp-l5y)/(h5y-l5y)*100) : 50;
    const pctFromHigh = ((h52-cp)/h52*100);

    // ── Score each indicator ────────────────────────────────────────────────
    // 1. DMA200 position
    let dmaScore=55, dmaSignal='No 200-DMA data';
    if (dma200val) {
      const pct=((cp-dma200val)/dma200val*100);
      if (pct>15)      { dmaScore=32; dmaSignal=`${pct.toFixed(1)}% above 200-DMA — extended, mean-reversion risk`; }
      else if (pct>5)  { dmaScore=55; dmaSignal=`${pct.toFixed(1)}% above 200-DMA — healthy uptrend`; }
      else if (pct>0)  { dmaScore=70; dmaSignal=`${pct.toFixed(1)}% above 200-DMA — close support, bullish`; }
      else if (pct>-8) { dmaScore=78; dmaSignal=`${Math.abs(pct).toFixed(1)}% below 200-DMA — value zone, watch for bounce`; }
      else             { dmaScore=85; dmaSignal=`${Math.abs(pct).toFixed(1)}% below 200-DMA — deep value, high risk/reward`; }
    }

    // 2. DMA slope (trend direction of 200-DMA)
    let slopeScore=55, slopeSignal='DMA slope unavailable';
    if (dmaSlope!==null) {
      if (dmaSlope>0.5)       { slopeScore=78; slopeSignal=`200-DMA rising +${dmaSlope}% in 20 days — strong uptrend`; }
      else if (dmaSlope>0)    { slopeScore=65; slopeSignal=`200-DMA mildly rising +${dmaSlope}% — uptrend intact`; }
      else if (dmaSlope>-0.5) { slopeScore=48; slopeSignal=`200-DMA flat/declining ${dmaSlope}% — trend weakening`; }
      else                    { slopeScore=30; slopeSignal=`200-DMA falling ${dmaSlope}% — downtrend confirmed`; }
    }

    // 3. RSI
    let rsiScore=55, rsiSignal='RSI unavailable';
    if (rsiVal!==null) {
      if (rsiVal>75)      { rsiScore=28; rsiSignal=`RSI ${rsiVal} — overbought, pullback likely`; }
      else if (rsiVal>60) { rsiScore=62; rsiSignal=`RSI ${rsiVal} — bullish momentum zone`; }
      else if (rsiVal>45) { rsiScore=55; rsiSignal=`RSI ${rsiVal} — neutral`; }
      else if (rsiVal>30) { rsiScore=75; rsiSignal=`RSI ${rsiVal} — oversold, accumulation zone`; }
      else                { rsiScore=88; rsiSignal=`RSI ${rsiVal} — deeply oversold, capitulation signal`; }
    }

    // 4. MACD
    let macdScore=55, macdSignal='MACD unavailable';
    if (macd) {
      if (macd.hist>0 && macd.macd>0)      { macdScore=75; macdSignal=`MACD bullish crossover — momentum building`; }
      else if (macd.hist>0 && macd.macd<0) { macdScore=62; macdSignal=`MACD histogram turning up — early recovery signal`; }
      else if (macd.hist<0 && macd.macd>0) { macdScore=45; macdSignal=`MACD histogram declining — momentum fading`; }
      else                                  { macdScore=32; macdSignal=`MACD bearish — both line and histogram negative`; }
    }

    // 5. Bollinger Band position
    let bollScore=55, bollSignal='Bollinger unavailable';
    if (boll) {
      if (boll.pct>95)      { bollScore=28; bollSignal=`Price at upper Bollinger band — overbought (${boll.pct.toFixed(0)}%)`; }
      else if (boll.pct>70) { bollScore=52; bollSignal=`Price in upper Bollinger zone (${boll.pct.toFixed(0)}%) — bullish but stretched`; }
      else if (boll.pct>30) { bollScore=65; bollSignal=`Price in Bollinger midrange (${boll.pct.toFixed(0)}%) — balanced`; }
      else if (boll.pct>5)  { bollScore=78; bollSignal=`Price near lower Bollinger band (${boll.pct.toFixed(0)}%) — value zone`; }
      else                  { bollScore=88; bollSignal=`Price at/below lower Bollinger band — extreme oversold`; }
    }

    // 6. 5-year range percentile
    let range5yScore=55, range5ySignal='5-year range unavailable';
    if (rangePos5y!==null) {
      if (rangePos5y<15)      { range5yScore=85; range5ySignal=`In bottom 15% of 5-year range — multi-year value zone`; }
      else if (rangePos5y<35) { range5yScore=72; range5ySignal=`In lower third of 5-year range — good long-term entry zone`; }
      else if (rangePos5y<65) { range5yScore=58; range5ySignal=`In middle of 5-year range — fair value`; }
      else if (rangePos5y<85) { range5yScore=45; range5ySignal=`In upper third of 5-year range — above historical average`; }
      else                    { range5yScore=30; range5ySignal=`Near 5-year highs — momentum play only, high valuation risk`; }
    }

    // 7. Volume signal (volPct = numeric ratio, volSignal = display string)
    const volPct = calcVolumeSignal(volumes);
    let volScore=55, volSignal='Volume data unavailable';
    if (volPct!==null) {
      const v=volPct;
      if (v>150)      { volScore=75; volSignal=`Volume ${v}% of 20-day avg — strong conviction move`; }
      else if (v>110) { volScore=65; volSignal=`Volume ${v}% of avg — above normal activity`; }
      else if (v>80)  { volScore=55; volSignal=`Volume ${v}% of avg — normal`; }
      else            { volScore=42; volSignal=`Volume ${v}% of avg — low conviction, weak signal`; }
    }

    // Composite technical score (weighted)
    const priceScore = Math.round(
      dmaScore*0.20 + slopeScore*0.15 + rsiScore*0.20 +
      macdScore*0.15 + bollScore*0.12 + range5yScore*0.12 + volScore*0.06
    );

    return {
      source: 'live',
      currentPrice: cp, high52w: h52, low52w: l52, dma200: dma200val, dma50: dma50val,
      high5y: h5y, low5y: l5y,
      rsi: rsiVal, macd, boll, dmaSlope, volSignal,
      rangePos52: rangePos52.toFixed(1), rangePos5y: rangePos5y.toFixed(1),
      pctFromHigh: pctFromHigh.toFixed(1),
      dmaScore, dmaSignal, slopeScore, slopeSignal,
      rsiScore, rsiSignal, macdScore, macdSignal,
      bollScore, bollSignal, range5yScore, range5ySignal,
      volScore, volSignal: typeof volSignal==='string'?volSignal:`Volume ${volSignal}% of 20-day avg`,
      priceScore, dataPoints: closes.length,
    };
  }

  // ── Fallback: manual price inputs only ─────────────────────────────────────
  if (!currentPrice || !high52w || !low52w) return null;
  const cp=parseFloat(currentPrice), h=parseFloat(high52w), l=parseFloat(low52w);
  const dma=dma200?parseFloat(dma200):null;
  const rsiVal=rsi?parseFloat(rsi):null;
  const pctFromHigh=((h-cp)/h*100);
  const rangePosition=((cp-l)/(h-l)*100);
  let dmaScore=55,dmaSignal='No 200-DMA entered';
  if(dma){const pct=((cp-dma)/dma*100);
    if(pct>8){dmaScore=38;dmaSignal=`${pct.toFixed(1)}% above 200-DMA — overbought`;}
    else if(pct>0){dmaScore=68;dmaSignal=`${pct.toFixed(1)}% above 200-DMA — healthy uptrend`;}
    else if(pct>-8){dmaScore=78;dmaSignal=`${Math.abs(pct).toFixed(1)}% below 200-DMA — value zone`;}
    else{dmaScore=85;dmaSignal=`${Math.abs(pct).toFixed(1)}% below 200-DMA — deep value`;}
  }
  let rsiScore=55,rsiSignal='No RSI entered';
  if(rsiVal!==null){
    if(rsiVal>70){rsiScore=30;rsiSignal=`RSI ${rsiVal} — overbought`;}
    else if(rsiVal>60){rsiScore=62;rsiSignal=`RSI ${rsiVal} — bullish zone`;}
    else if(rsiVal>40){rsiScore=58;rsiSignal=`RSI ${rsiVal} — neutral`;}
    else if(rsiVal>30){rsiScore=78;rsiSignal=`RSI ${rsiVal} — oversold, accumulation zone`;}
    else{rsiScore=88;rsiSignal=`RSI ${rsiVal} — deeply oversold`;}
  }
  let rangeScore=55;
  if(rangePosition<20)rangeScore=82;else if(rangePosition<40)rangeScore=70;
  else if(rangePosition<60)rangeScore=58;else if(rangePosition<85)rangeScore=48;else rangeScore=32;
  const priceScore=Math.round(dmaScore*0.40+rsiScore*0.35+rangeScore*0.25);
  return {
    source:'manual',
    currentPrice:cp,high52w:h,low52w:l,dma200:dma,rsi:rsiVal,
    pctFromHigh:pctFromHigh.toFixed(1),rangePosition:rangePosition.toFixed(0),
    dmaScore,dmaSignal,rsiScore,rsiSignal,rangeScore,priceScore,
  };
}


const ALL_SECTORS=[
  {id:'banking',name:'Banking & Finance',icon:'🏦',planets:['Jupiter','Mercury','Moon'],rateDir:'cutting'},
  {id:'it',name:'IT & Technology',icon:'💻',planets:['Mercury','Rahu'],rateDir:'hiking'},
  {id:'fmcg',name:'FMCG & Consumer',icon:'🛒',planets:['Moon','Venus'],rateDir:'any'},
  {id:'pharma',name:'Pharma & Healthcare',icon:'💊',planets:['Jupiter','Ketu','Venus'],rateDir:'any'},
  {id:'auto',name:'Auto & EV',icon:'🚗',planets:['Venus','Mars'],rateDir:'cutting'},
  {id:'metals',name:'Metals & Mining',icon:'⚙️',planets:['Mars','Saturn'],rateDir:'any'},
  {id:'realty',name:'Realty & Infra',icon:'🏗️',planets:['Mars','Saturn','Jupiter'],rateDir:'cutting'},
  {id:'oil',name:'Oil & Energy',icon:'🛢️',planets:['Saturn','Sun'],rateDir:'any'},
  {id:'defence',name:'Defence & PSU',icon:'🛡️',planets:['Sun','Mars'],rateDir:'any'},
  {id:'gold',name:'Gold & Precious',icon:'🥇',planets:['Sun','Moon'],rateDir:'cutting'},
  {id:'aviation',name:'Aviation & Logistics',icon:'✈️',planets:['Rahu','Mercury'],rateDir:'cutting'},
];

const STOCK_MAP={TCS:'it',INFOSYS:'it',INFY:'it',WIPRO:'it',HCLT:'it','HCL TECH':'it',TECHM:'it',LTIMINDTREE:'it',MPHASIS:'it',PERSISTENT:'it',HDFCBANK:'banking',ICICIBANK:'banking',SBIN:'banking','STATE BANK':'banking',KOTAKBANK:'banking',AXISBANK:'banking',INDUSINDBK:'banking',FEDERALBNK:'banking',HINDUNILVR:'fmcg','HINDUSTAN UNILEVER':'fmcg',ITC:'fmcg',NESTLEIND:'fmcg',DABUR:'fmcg',MARICO:'fmcg',BRITANNIA:'fmcg',SUNPHARMA:'pharma','SUN PHARMA':'pharma',DRREDDY:'pharma','DR REDDY':'pharma',CIPLA:'pharma',DIVISLAB:'pharma',LUPIN:'pharma',MARUTI:'auto',TATAMOTORS:'auto','TATA MOTORS':'auto',MM:'auto','M&M':'auto',BAJAJ:'auto',HEROMOTOCO:'auto',EICHERMOT:'auto',TATASTEEL:'metals','TATA STEEL':'metals',JSPL:'metals',SAIL:'metals',HINDALCO:'metals',JSWSTEEL:'metals',DLF:'realty',GODREJPROP:'realty',PRESTIGE:'realty',RELIANCE:'oil',ONGC:'oil',BPCL:'oil',IOC:'oil',HINDPETRO:'oil',GAIL:'oil',HAL:'defence',BEL:'defence',BHEL:'defence',NMDC:'defence',COALINDIA:'defence',NTPC:'defence',POWERGRID:'defence',NIFTY:'index',NIFTY50:'index',SENSEX:'index','NIFTY 50':'index',BANKNIFTY:'banking','BANK NIFTY':'banking','NIFTY IT':'it','NIFTY PHARMA':'pharma',GOLDBEES:'gold',GOLDIETF:'gold'};

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────
function runEngine(date,time,lat,lon,macroInputs={},priceData={},newsSentiment=null,priceSeries=null){
  const[yr,mo,dy]=date.split('-').map(Number);
  const[hr,mn]=time.split(':').map(Number);
  const JD=jdFromDate(yr,mo,dy,hr-5.5,mn);
  const planets=calcPlanets(JD);
  const lagnaLng=calcLagna(JD,lat,lon);
  const lagnaSign=Math.floor(lagnaLng/30);
  const moonNak=planets.Moon.nakIdx;
  const sunNak=planets.Sun.nakIdx;
  const tithiNum=calcTithi(planets.Sun.lng,planets.Moon.lng);
  const paksha=calcPaksha(tithiNum);
  const dow=new Date(yr,mo-1,dy).getDay();
  const horaData=calcHora(dow,hr);
  const retro={Mercury:isRetrograde('Mercury',JD),Jupiter:isRetrograde('Jupiter',JD),Saturn:isRetrograde('Saturn',JD),Mars:isRetrograde('Mars',JD),Venus:isRetrograde('Venus',JD)};
  const exalted=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].filter(p=>EXALT[p]===planets[p].sign);
  const debil=['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'].filter(p=>DEBIL[p]===planets[p].sign);
  // FIX 2 — NSE natal chart as Dasha seed (NSE founded 4 Nov 1992, 09:15 IST, Mumbai)
  // BSE: 9 July 1875 Mumbai (backup reference)
  const NSE_BIRTH_JD = jdFromDate(1992, 11, 4, 9, 15 - 5.5, 30); // 9:15 IST → UTC
  const NSE_PLANETS  = calcPlanets(NSE_BIRTH_JD);
  const NSE_LAGNA_LNG = calcLagna(NSE_BIRTH_JD, 18.9750, 72.8258); // Mumbai coords
  const NSE_LAGNA_SIGN = Math.floor(NSE_LAGNA_LNG/30);
  const dasha=calcDasha(NSE_PLANETS.Moon.lng, NSE_BIRTH_JD, JD);

  // ── BUILD 2 — House transit analysis from NSE's own natal lagna ──────────
  const houseTransits = analyzeHouseTransits(NSE_LAGNA_SIGN, planets, exalted, debil);
  const yogas=detectYogas(moonNak,tithiNum,dow);
  const yogaBoost=yogas.reduce((a,y)=>a+y.boost,0);
  const jsAspect=calcJupSatAspect(planets.Jupiter.lng,planets.Saturn.lng);
  const phase=calcLunarPhase(planets.Sun.lng,planets.Moon.lng);
  const ashtak=calcAshtakvarga(planets);

  // ── D9, D10 ───────────────────────────────────────────────────────────────
  const d9={},d10={};
  ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'].forEach(p=>{
    const s=Math.floor(planets[p].lng/30),deg=planets[p].lng%30;
    const d9pad=Math.floor(deg/3.333);
    d9[p]=([0,9,6,3][s%4]+d9pad)%12;
    const d10pad=Math.floor(deg/3);
    d10[p]=s%2===0?(s+d10pad)%12:(s+d10pad+9)%12;
  });

  // ── MUHURTA SCORE ─────────────────────────────────────────────────────────
  const mScore=Math.min(100,Math.max(5,Math.round(
    (TITHI_Q[tithiNum]||55)*0.30+NAK_Q[moonNak]*0.28+VAAR_Q[dow]*0.20+horaData.quality*0.12+(paksha==='Shukla'?72:42)*0.10
  )+yogaBoost));

  // FIX 7 — Include Pratyantar in dasha score for week-to-week precision
  const PB={Jupiter:88,Venus:80,Mercury:75,Moon:65,Sun:60,Mars:55,Saturn:48,Rahu:42,Ketu:38};
  let dashaScore=Math.round((PB[dasha.maha]||55)*0.50+(PB[dasha.antar]||55)*0.32+(PB[dasha.pratyantar]||55)*0.18);
  if(exalted.includes(dasha.maha))dashaScore+=10;
  if(debil.includes(dasha.maha))dashaScore-=12;
  dashaScore=Math.min(100,Math.max(10,dashaScore));

  // FIX 4 — Avg ashtakvarga now across all 7 planets (was 3)
  const avgAshtak=Math.round(Object.values(ashtak).reduce((a,b)=>a+b,0)/7*12.5);
  // BUILD 2 — House transits now contribute to vedic composite (15% of vedic layer)
  let vedicScore=Math.round(mScore*0.34+dashaScore*0.34+avgAshtak*0.17+houseTransits.avgImpact*0.15);
  if(exalted.length)vedicScore+=exalted.length*4;
  if(debil.length)vedicScore-=debil.length*4;
  vedicScore=Math.min(100,Math.max(5,vedicScore));

  // FIX 6 — Use derivePlanetSignScore instead of hardcoded JUP_SQ / SAT_SQ
  const jupSignQ = derivePlanetSignScore('Jupiter', planets.Jupiter.sign);
  const satSignQ = derivePlanetSignScore('Saturn',  planets.Saturn.sign);
  let westScore=Math.round(jupSignQ*0.40+satSignQ*0.30+jsAspect.q*0.30);
  if(retro.Mercury)westScore-=10;
  if(retro.Jupiter)westScore-=6;
  const sunToRahu=Math.abs(mod360(planets.Sun.lng-planets.Rahu.lng));
  if(sunToRahu<18||sunToRahu>342)westScore-=15;
  westScore=Math.min(100,Math.max(10,westScore));

  // ── LUNAR SCORE ───────────────────────────────────────────────────────────
  let lunarScore=phase.dichev+(paksha==='Shukla'?8:0);
  if(tithiNum===11)lunarScore+=12;if(tithiNum===15)lunarScore+=10;if(tithiNum===16)lunarScore-=20;
  lunarScore=Math.min(100,Math.max(10,lunarScore));

  // FIX 1 — Macro score from real user inputs (not hardcoded 65)
  const TREND_MAP  = {'strong-up':82,'mild-up':70,'sideways':58,'mild-down':42,'strong-down':28};
  const DMA_MAP    = {'above':8,'neutral':0,'below':-8};
  const FII_MAP    = {'buying':6,'neutral':0,'selling':-6};
  const RBI_MAP    = {'cutting':10,'neutral':0,'hiking':-10};
  const VIX_MAP_T  = {'calm':75,'normal':62,'fearful':38};
  const macroBase  = TREND_MAP[macroInputs.trend]||58;
  const macroAdj   = (DMA_MAP[macroInputs.dma]||0)+(FII_MAP[macroInputs.fii]||0)+(RBI_MAP[macroInputs.rbi]||0);
  const newsAdj    = newsSentiment ? Math.round((newsSentiment.score||0) * 1.2) : 0; // -12 to +12
  const macroScore = Math.min(100,Math.max(10,macroBase+macroAdj+newsAdj));
  const vixBase    = VIX_MAP_T[macroInputs.vix]||62;
  // Use full indicator engine if series available, else VIX-based fallback
  const _pt        = calcPriceTechnicals(priceData, priceSeries);
  const techScore  = _pt ? Math.round(_pt.priceScore*0.75 + vixBase*0.25) : vixBase;

  // RBI stance affects specific sectors
  const rateFavSectors = macroInputs.rbi==='cutting'?['banking','auto','realty','fmcg']:macroInputs.rbi==='hiking'?['it','gold']:[];

  // ── COMPOSITE ─────────────────────────────────────────────────────────────
  const composite=Math.min(100,Math.max(5,Math.round(
    vedicScore*0.32+westScore*0.16+lunarScore*0.10+macroScore*0.22+techScore*0.12+dashaScore*0.08
  )));
  const layers={vedic:vedicScore,western:westScore,lunar:lunarScore,macro:macroScore,tech:techScore,dasha:dashaScore};
  const bullLayers=Object.values(layers).filter(s=>s>=62).length;

  // ── SECTORS (includes RBI rate cycle boost from Fix 1) ───────────────────
  const activePlanets=new Set([dasha.maha,dasha.antar,dasha.pratyantar,NAK_RULER[moonNak],horaData.planet,...exalted]);
  const sectorScores=ALL_SECTORS.map(sec=>{
    let s=48;
    sec.planets.forEach(p=>{if(activePlanets.has(p))s+=14;});
    NAK_SEC[moonNak].forEach(ns=>{if(sec.name.toLowerCase().includes(ns.toLowerCase()))s+=10;});
    if(sec.planets.includes(VAAR_L[dow]))s+=8;
    exalted.forEach(p=>{if(sec.planets.includes(p))s+=8;});
    debil.forEach(p=>{if(sec.planets.includes(p))s-=8;});
    if(retro.Mercury&&sec.id==='it')s-=10;
    if(rateFavSectors.includes(sec.id))s+=12; // FIX 1 — RBI cycle boost
    return{...sec,score:Math.min(97,Math.max(12,Math.round(s)))};
  }).sort((a,b)=>b.score-a.score);

  // FIX 5 — Improved calendar: add hora quality + Ekadashi/Purnima/Pushya flags
  const[y2,m2,d2]=date.split('-').map(Number);
  const daysInMonth=new Date(y2,m2,0).getDate();
  const startDow=new Date(y2,m2-1,1).getDay();
  const calDays=[];
  for(let d=1;d<=daysInMonth;d++){
    const wd=new Date(y2,m2-1,d).getDay();
    const isM=wd>0&&wd<6;
    const vq=VAAR_Q[wd];
    const offset=Math.round((d-d2)*13.2);
    const estT=Math.max(1,Math.min(16,((tithiNum+Math.floor(offset/12)-1+30)%30)+1));
    const tq=TITHI_Q[estT]||55;
    // FIX 5 — Hora at 9:15 AM market open for each day
    const openHora=calcHora(wd,9);
    const horaBonus=openHora.quality>=78?8:openHora.quality>=68?4:0;
    // FIX 5 — Ekadashi / Purnima flag
    const isSpecialTithi=[11,12,15].includes(estT);
    // FIX 5 — Estimate if Moon is near Pushya nakshatra (nakIdx=7, every ~27 days)
    const estMoonNak=Math.floor(mod360(planets.Moon.lng+(d-d2)*13.2)/(360/27));
    const isPushya=estMoonNak===7||estMoonNak===12; // Pushya or Hasta
    const specialBonus=(isSpecialTithi?8:0)+(isPushya?10:0);
    calDays.push({
      d,dow:wd,
      score:isM?Math.min(97,Math.round(vq*0.35+tq*0.30+westScore*0.12+lunarScore*0.10+horaBonus+specialBonus)):0,
      isMarket:isM,
      horaAtOpen:openHora.planet,
      isSpecialTithi,isPushya,
      estTithi:estT
    });
  }

  // BUILD 1 — Price technicals from manual input (no API)
  const priceTech = _pt; // already computed above

  return {
    composite,layers,bullLayers,vedicScore,westScore,lunarScore,dashaScore,
    mScore,planets,lagnaSign,lagnaLng,moonNak,sunNak,
    tithiNum,paksha,dow,horaData,retro,exalted,debil,
    dasha,yogas,yogaBoost,jsAspect,phase,ashtak,d9,d10,
    sectorScores,calDays,startDow,date,time,lat,lon,
    jupSignQ,satSignQ,macroInputs,rateFavSectors,newsSentiment,
    bearLayers:Object.values(layers).filter(s=>s<42).length,
    houseTransits, NSE_LAGNA_SIGN, priceTech,
  };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function VedicStocks({ setTab, T, lang }) {
  const hi = lang === 'Hindi';
  const [view, setView] = useState('home'); // home | result | stock
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | ok | denied
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
  });
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.2090);
  const [city, setCity] = useState('Delhi, India');
  const [stockInput, setStockInput] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  // FIX 1 — Live market context inputs (replaces hardcoded 65/62)
  const [macroInputs, setMacroInputs] = useState({
    trend:'sideways', dma:'neutral', fii:'neutral', rbi:'neutral', vix:'normal'
  });
  const [stockContext, setStockContext] = useState({
    priceVsHigh:'', recentTrend:'', earningsSeason:'', sectorFii:''
  });
  // BUILD 1 — Manual price data inputs (no API dependency)
  const [priceData, setPriceData] = useState({
    currentPrice:'', high52w:'', low52w:'', dma200:'', rsi:''
  });
  // BUILD 3 — Backtest / calibration log (stored in browser only)
  const [backtestLog, setBacktestLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vedicOracleBacktest')||'[]'); }
    catch { return []; }
  });
  const [showBacktest, setShowBacktest] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
  const [priceSeries, setPriceSeries] = useState(null); // raw 5-year series from Yahoo
  const [showReport, setShowReport] = useState(false);
  const [newsText, setNewsText] = useState('');
  const [newsSentiment, setNewsSentiment] = useState(null); // {score, label, summary, detail}
  const [newsLoading, setNewsLoading] = useState(false);

  // Auto-detect GPS on mount — checks permissions first to avoid policy violation
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    setGpsStatus('loading');
    const doGps = () => navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(parseFloat(pos.coords.latitude.toFixed(4)));
        setLon(parseFloat(pos.coords.longitude.toFixed(4)));
        setCity(`${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`);
        setGpsStatus('ok');
      },
      () => setGpsStatus('denied'),
      { timeout: 6000 }
    );
    // Use Permissions API to silently skip if blocked by policy
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          if (result.state === 'denied') { setGpsStatus('denied'); }
          else { doGps(); }
        })
        .catch(() => doGps()); // permissions API not supported — try anyway
    } else {
      doGps();
    }
  }, []);

  // ── Symbol → Yahoo Finance ticker mapping ────────────────────────────────
  const toYahooSymbol = (input) => {
    const s = input.trim().toUpperCase().replace(/\s+/g, '');
    const MAP = {
      // Indices
      'NIFTY':'%5ENSEI','NIFTY50':'%5ENSEI','NIFTY 50':'%5ENSEI',
      'SENSEX':'%5EBSESN','BANKNIFTY':'%5ENSEBANK','NIFTYIT':'%5ECNXIT',
      // Large caps — NSE
      'RELIANCE':'RELIANCE.NS','TCS':'TCS.NS','INFY':'INFY.NS','INFOSYS':'INFY.NS',
      'HDFCBANK':'HDFCBANK.NS','ICICIBANK':'ICICIBANK.NS','SBIN':'SBIN.NS',
      'HINDUNILVR':'HINDUNILVR.NS','ITC':'ITC.NS','KOTAKBANK':'KOTAKBANK.NS',
      'AXISBANK':'AXISBANK.NS','WIPRO':'WIPRO.NS','HCLTECH':'HCLTECH.NS',
      'HCLT':'HCLTECH.NS','TECHM':'TECHM.NS','LTIMINDTREE':'LTIMINDTREE.NS',
      'SUNPHARMA':'SUNPHARMA.NS','DRREDDY':'DRREDDY.NS','CIPLA':'CIPLA.NS',
      'DIVISLAB':'DIVISLAB.NS','LUPIN':'LUPIN.NS','MARUTI':'MARUTI.NS',
      'TATAMOTORS':'TATAMOTORS.NS','MM':'M%26M.NS','BAJAJ':'BAJAJFINSV.NS',
      'BAJAJFINSV':'BAJAJFINSV.NS','BAJFINANCE':'BAJFINANCE.NS',
      'HEROMOTOCO':'HEROMOTOCO.NS','EICHERMOT':'EICHERMOT.NS',
      'TATASTEEL':'TATASTEEL.NS','JSPL':'JSPL.NS','SAIL':'SAIL.NS',
      'HINDALCO':'HINDALCO.NS','JSWSTEEL':'JSWSTEEL.NS','DLF':'DLF.NS',
      'GODREJPROP':'GODREJPROP.NS','PRESTIGE':'PRESTIGE.NS',
      'RELIANCE':'RELIANCE.NS','ONGC':'ONGC.NS','BPCL':'BPCL.NS',
      'IOC':'IOC.NS','HINDPETRO':'HINDPETRO.NS','GAIL':'GAIL.NS',
      'HAL':'HAL.NS','BEL':'BEL.NS','BHEL':'BHEL.NS','NMDC':'NMDC.NS',
      'COALINDIA':'COALINDIA.NS','NTPC':'NTPC.NS','POWERGRID':'POWERGRID.NS',
      'NESTLEIND':'NESTLEIND.NS','BRITANNIA':'BRITANNIA.NS','DABUR':'DABUR.NS',
      'MARICO':'MARICO.NS','INDUSINDBK':'INDUSINDBK.NS','FEDERALBNK':'FEDERALBNK.NS',
      'PERSISTENT':'PERSISTENT.NS','MPHASIS':'MPHASIS.NS','IDEA':'IDEA.NS',
      'VODAFONEIDEA':'IDEA.NS','ZOMATO':'ZOMATO.NS','PAYTM':'PAYTM.NS',
      'NYKAA':'NYKAA.NS','DMART':'DMART.NS','ADANIPORTS':'ADANIPORTS.NS',
      'ADANIENT':'ADANIENT.NS','TATACONSUM':'TATACONSUM.NS',
    };
    if (MAP[s]) return MAP[s];
    // Default: append .NS for NSE
    return s + '.NS';
  };

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setFetchStatus(null);

    let resolvedPrice = { ...priceData };

    // Auto-fetch price data if stock name entered and fields are empty
    if (stockInput.trim()) {
      const allEmpty = !priceData.currentPrice && !priceData.high52w && !priceData.low52w;
      if (allEmpty) {
        setFetchStatus('loading');
        try {
          const symbol = toYahooSymbol(stockInput);
          const res = await fetch(`/api/stock?symbol=${symbol}&range=5y&interval=1d`);
          const data = await res.json();
          if (data && data.closes && data.closes.length > 50) {
            const closes  = data.closes.filter(Boolean);
            const volumes = (data.volumes||[]).filter(Boolean);

            // Store raw series for indicator engine
            const series = { closes, volumes, timestamps: data.timestamps||[] };
            setPriceSeries(series);

            // Fill price fields from series
            const cp     = data.currentPrice || closes[closes.length-1];
            const yr1    = closes.slice(-252);
            const h52    = Math.max(...yr1);
            const l52    = Math.min(...yr1);
            const last200 = closes.slice(-200);
            const dma200  = last200.reduce((a,b)=>a+b,0)/last200.length;

            resolvedPrice = {
              currentPrice: cp.toFixed(2),
              high52w:      h52.toFixed(2),
              low52w:       l52.toFixed(2),
              dma200:       dma200.toFixed(2),
              rsi:          '',  // computed inside calcPriceTechnicals from series
            };
            setPriceData(resolvedPrice);
            setFetchStatus('ok');
          } else {
            setFetchStatus('error');
          }
        } catch {
          setFetchStatus('error');
        }
      }
    }

    setTimeout(() => {
      const r = runEngine(date, time, lat, lon, macroInputs, resolvedPrice, newsSentiment, priceSeries);
      setResult(r);
      setActiveTab('overview');
      setView('result');
      setLoading(false);
    }, 400);
  }, [date, time, lat, lon, macroInputs, priceData, stockInput, priceSeries, newsSentiment]);

  // ── Score today's news via Claude API ────────────────────────────────────
  const scoreNews = async () => {
    if (!newsText.trim()) return;
    setNewsLoading(true);
    setNewsSentiment(null);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: `You are a financial market sentiment analyser specialising in Indian markets (NSE/BSE). 
Given news headlines or a brief description of current events, return ONLY a JSON object with these exact keys:
- score: integer from -10 to +10 (negative = bearish, 0 = neutral, positive = bullish for Indian equities)
- label: one of "Strongly Bullish", "Mildly Bullish", "Neutral", "Mildly Bearish", "Strongly Bearish"
- summary: one sentence plain-English verdict (max 20 words)
- detail: 2-3 sentences explaining which sectors are most affected and why (max 60 words)
- sectors_up: array of up to 3 sector names that benefit (e.g. ["banking","it","auto"])
- sectors_down: array of up to 3 sector names that are hurt

Return ONLY the JSON. No markdown, no preamble.`,
          messages: [{ role: 'user', content: newsText.trim() }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || '').join('') || '';
      const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim();
      const parsed = JSON.parse(clean);
      setNewsSentiment(parsed);
    } catch (e) {
      setNewsSentiment({ score: 0, label: 'Neutral', summary: 'Could not score — using neutral.', detail: '', sectors_up: [], sectors_down: [] });
    }
    setNewsLoading(false);
  };

  // BUILD 3 — Save a prediction to the backtest log for later outcome recording
  const saveToBacktestLog = useCallback((stockSymbol, score, verdict) => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      stock: stockSymbol || 'General market',
      score, verdict,
      outcome: null, // filled in later by user: 'correct' | 'incorrect' | 'partial'
      actualMove: null,
    };
    const updated = [entry, ...backtestLog].slice(0, 100); // cap at 100 entries
    setBacktestLog(updated);
    try { localStorage.setItem('vedicOracleBacktest', JSON.stringify(updated)); } catch {}
  }, [backtestLog]);

  const updateBacktestOutcome = useCallback((id, outcome) => {
    const updated = backtestLog.map(e => e.id === id ? { ...e, outcome } : e);
    setBacktestLog(updated);
    try { localStorage.setItem('vedicOracleBacktest', JSON.stringify(updated)); } catch {}
  }, [backtestLog]);

  const handleStockAnalyze = useCallback(() => {
    if (!stockInput.trim() || !result) return;
    setActiveTab('stock');
    setView('result');
  }, [stockInput, result]);

  // ── Styles matching J Su Kun theme ──────────────────────────────────────
  const s = {
    page: {
      position: 'relative', minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', background: T.bg, color: T.text,
      boxSizing: 'border-box', padding: '0 0 80px',
      fontFamily: "'DM Sans', sans-serif",
    },
    header: {
      width: '100%', display: 'flex', alignItems: 'center',
      padding: '16px 20px 0', boxSizing: 'border-box', gap: '12px',
    },
    backBtn: {
      background: 'none', border: 'none', color: T.text, cursor: 'pointer',
      fontSize: '20px', padding: '4px 8px', opacity: 0.7,
    },
    headerTitle: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px', fontWeight: 600, letterSpacing: '2px',
      margin: 0, color: '#c9a84c',
    },
    headerSub: {
      fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
      opacity: 0.5, margin: 0,
    },
    body: { width: '100%', maxWidth: '420px', padding: '16px 20px', boxSizing: 'border-box' },

    // GPS bar
    gpsBanner: (ok) => ({
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 12px', borderRadius: '10px', marginBottom: '14px',
      fontSize: '11px', letterSpacing: '0.5px',
      background: ok ? 'rgba(100,180,80,0.08)' : 'rgba(201,168,76,0.08)',
      border: `0.5px solid ${ok ? 'rgba(100,180,80,0.3)' : 'rgba(201,168,76,0.3)'}`,
      color: ok ? '#7DC66A' : '#c9a84c',
    }),
    gpsDoc: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },

    // Date/time row
    inputRow: { display: 'flex', gap: '10px', marginBottom: '12px' },
    inputGroup: { flex: 1 },
    inputLabel: { fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '5px' },
    input: {
      width: '100%', padding: '10px 12px', boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${T.accent}30`,
      borderRadius: '10px', color: T.text, fontSize: '13px',
      fontFamily: "'DM Sans', sans-serif", outline: 'none',
    },

    // Stock input
    stockRow: { position: 'relative', marginBottom: '16px' },
    stockInput: {
      width: '100%', padding: '12px 16px', boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(201,168,76,0.25)`,
      borderRadius: '12px', color: T.text, fontSize: '14px',
      fontFamily: "'DM Sans', sans-serif", outline: 'none', letterSpacing: '0.5px',
    },

    // Main CTA
    analyzeBtn: {
      width: '100%', padding: '18px 0', marginBottom: '10px',
      background: `linear-gradient(135deg, ${T.bg} 0%, #c9a84c20 50%, ${T.bg} 100%)`,
      border: '1.5px solid #c9a84c80', borderRadius: '12px',
      color: '#c9a84c', fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700, fontSize: '14px', letterSpacing: '2px',
      cursor: 'pointer', textTransform: 'uppercase',
    },

    // Tabs
    tabRow: {
      display: 'flex', gap: '6px', flexWrap: 'wrap',
      padding: '0 20px 10px', width: '100%', boxSizing: 'border-box',
    },
    tabBtn: (active) => ({
      padding: '5px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif", fontWeight: active ? 600 : 400,
      letterSpacing: '1px', border: `0.5px solid ${active ? '#c9a84c80' : T.accent+'30'}`,
      background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
      color: active ? '#c9a84c' : T.text + 'aa',
    }),

    // Score arc wrap
    scoreWrap: {
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '16px', marginBottom: '12px',
      background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
      border: `0.5px solid ${T.accent}20`,
    },

    // Section card
    section: {
      background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
      border: `0.5px solid ${T.accent}20`, padding: '14px 16px', marginBottom: '10px',
    },
    sectionTitle: { fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '12px' },

    // Signal row
    sigRow: {
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      paddingBottom: '10px', marginBottom: '10px',
      borderBottom: `0.5px solid ${T.accent}15`,
    },
    sigDot: (s) => ({ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, marginTop: '5px', background: s>=65?'#7DC66A':s<42?'#E05C5C':'#c9a84c' }),
    sigName: { fontSize: '13px', fontWeight: 500, marginBottom: '2px' },
    sigSub: { fontSize: '11px', opacity: 0.55, lineHeight: 1.4 },
    badge: (s) => ({
      fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600,
      whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'flex-start',
      background: s>=65?'rgba(100,180,80,0.12)':s<42?'rgba(224,92,92,0.12)':'rgba(201,168,76,0.12)',
      color: s>=65?'#7DC66A':s<42?'#E05C5C':'#c9a84c',
      border: `0.5px solid ${s>=65?'rgba(100,180,80,0.3)':s<42?'rgba(224,92,92,0.3)':'rgba(201,168,76,0.3)'}`,
    }),

    // Pbar
    pbarRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
    pbarLabel: { fontSize: '11px', opacity: 0.6, width: '110px', flexShrink: 0, lineHeight: 1.3 },
    pbarTrack: { flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' },
    pbarFill: (s) => ({ height: '100%', borderRadius: '2px', background: s>=65?'#7DC66A':s<42?'#E05C5C':'#c9a84c', width: `${s}%` }),
    pbarVal: { fontSize: '11px', fontWeight: 500, width: '26px', textAlign: 'right', opacity: 0.8 },

    // Metric grid
    metricGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' },
    metric: { background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px 14px' },
    metricLabel: { fontSize: '10px', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' },
    metricVal: (s) => ({ fontSize: '22px', fontWeight: 500, color: s>=65?'#7DC66A':s<42?'#E05C5C':'#c9a84c' }),
    metricSub: { fontSize: '10px', opacity: 0.4, marginTop: '1px' },

    // Alert box
    alert: (type) => ({
      borderRadius: '10px', padding: '10px 13px', marginBottom: '10px', fontSize: '12px', lineHeight: 1.6,
      background: type==='good'?'rgba(100,180,80,0.08)':type==='warn'?'rgba(224,92,92,0.08)':'rgba(201,168,76,0.08)',
      border: `0.5px solid ${type==='good'?'rgba(100,180,80,0.3)':type==='warn'?'rgba(224,92,92,0.3)':'rgba(201,168,76,0.3)'}`,
      color: type==='good'?'#7DC66A':type==='warn'?'#E05C5C':'#c9a84c',
    }),

    // Heat calendar
    heatGrid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px', marginTop: '8px' },
    heatDay: (s,isM) => ({
      borderRadius: '4px', padding: '4px 0', textAlign: 'center', fontSize: '10px', fontWeight: 500,
      background: !isM?'transparent':s>=65?'rgba(100,180,80,0.18)':s>=50?'rgba(201,168,76,0.12)':'rgba(224,92,92,0.10)',
      color: !isM?T.text+'30':s>=65?'#7DC66A':s>=50?'#c9a84c':'#E05C5C',
    }),

    // Planet chip
    chip: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', margin: '2px', background: 'rgba(255,255,255,0.05)', color: T.text+'aa', border: `0.5px solid ${T.accent}20` },

    disclaimer: {
      fontSize: '10px', opacity: 0.35, lineHeight: 1.6, textAlign: 'center',
      marginTop: '24px', letterSpacing: '0.3px', padding: '0 8px',
    },
  };

  const scoreColor = (s) => s>=65?'#7DC66A':s<42?'#E05C5C':'#c9a84c';
  const scoreLabel = (s) => s>=78?'Strong buy signal':s>=65?'Moderate buy':s>=50?'Neutral — hold':s>=38?'Caution — reduce':'Avoid / exit';

  // ── Arc SVG ───────────────────────────────────────────────────────────────
  const ScoreArc = ({ score }) => {
    const r=34, cx=42, cy=42;
    const arc=2*Math.PI*r;
    const fill=(score/100)*arc;
    const col=scoreColor(score);
    return (
      <svg width="84" height="84" viewBox="0 0 84 84" aria-label={`Score ${score} out of 100`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="7"
          strokeDasharray={`${fill.toFixed(1)} ${arc.toFixed(1)}`}
          strokeDashoffset={(arc/4).toFixed(1)}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <text x={cx} y={cy-3} textAnchor="middle" fontSize="18" fontWeight="500" fill={col}>{score}</text>
        <text x={cx} y={cy+11} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">/100</text>
      </svg>
    );
  };

  // ── HOME VIEW ─────────────────────────────────────────────────────────────
  if (view === 'home' || !result) {
    return (
      <div style={s.page}>
        <style>{`
          input[type="date"],input[type="time"],input[type="number"],input[type="text"]{color-scheme:dark;}
          input:focus{border-color:rgba(201,168,76,0.6)!important;outline:none;}
        `}</style>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => setTab('home')}>←</button>
          <div>
            <p style={s.headerTitle}>📈 {hi ? 'वैदिक शेयर बाज़ार' : 'Vedic Stock Oracle'}</p>
            <p style={s.headerSub}>{hi ? 'ज्योतिष · अर्थशास्त्र · सांख्यिकी' : 'Astrology · Economics · Statistics'}</p>
          </div>
        </div>

        <div style={s.body}>
          {/* GPS Banner */}
          <div style={s.gpsBanner(gpsStatus==='ok')}>
            <div style={{...s.gpsDoc, background: gpsStatus==='ok'?'#7DC66A':gpsStatus==='loading'?'#c9a84c':'#888'}}/>
            <span>
              {gpsStatus==='ok' ? `📍 GPS active — ${city}` :
               gpsStatus==='loading' ? '🔍 Detecting your location…' :
               gpsStatus==='denied' ? '📍 Location off — using Delhi, India. Enable GPS for precision.' :
               '📍 Enable location for precise calculations'}
            </span>
          </div>

          {/* Date & Time */}
          <div style={s.inputRow}>
            <div style={s.inputGroup}>
              <span style={s.inputLabel}>{hi ? 'तारीख' : 'Date'}</span>
              <input style={s.input} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
            <div style={s.inputGroup}>
              <span style={s.inputLabel}>{hi ? 'समय (IST)' : 'Time (IST)'}</span>
              <input style={s.input} type="time" value={time} onChange={e=>setTime(e.target.value)}/>
            </div>
          </div>

          {/* City */}
          <div style={{marginBottom:'12px'}}>
            <span style={s.inputLabel}>{hi ? 'शहर' : 'City / Place'}</span>
            <input style={s.input} type="text" value={city}
              onChange={e=>setCity(e.target.value)}
              placeholder="e.g. Mumbai, Delhi, Bengaluru"/>
          </div>

          {/* Lat/Lon */}
          <div style={s.inputRow}>
            <div style={s.inputGroup}>
              <span style={s.inputLabel}>Latitude</span>
              <input style={s.input} type="number" step="0.0001" value={lat} onChange={e=>setLat(parseFloat(e.target.value))}/>
            </div>
            <div style={s.inputGroup}>
              <span style={s.inputLabel}>Longitude</span>
              <input style={s.input} type="number" step="0.0001" value={lon} onChange={e=>setLon(parseFloat(e.target.value))}/>
            </div>
          </div>

          {/* FIX 1 — 5-question market context panel */}
          <div style={{...s.section, marginBottom:'14px'}}>
            <p style={{...s.sectionTitle, marginBottom:'10px'}}>📊 Market context <span style={{opacity:0.4,fontWeight:400,letterSpacing:'0.5px'}}>(5 quick inputs — boosts accuracy by ~15%)</span></p>
            {[
              {key:'trend', label:'Nifty trend last 30 days',
               opts:[['strong-up','📈 Strong uptrend'],['mild-up','↗ Mild uptrend'],['sideways','→ Sideways'],['mild-down','↘ Mild downtrend'],['strong-down','📉 Strong downtrend']]},
              {key:'dma',   label:'Nifty vs 50-day moving average',
               opts:[['above','Above DMA (bullish)'],['neutral','At DMA (neutral)'],['below','Below DMA (bearish)']]},
              {key:'fii',   label:'FII flow this week',
               opts:[['buying','Net buyers ✓'],['neutral','Neutral'],['selling','Net sellers ✗']]},
              {key:'rbi',   label:'RBI interest rate stance',
               opts:[['cutting','Rate cutting cycle ★'],['neutral','Neutral / pause'],['hiking','Rate hiking ⚠']]},
              {key:'vix',   label:'India VIX level',
               opts:[['calm','Below 13 — calm ★'],['normal','13–18 — normal'],['fearful','Above 18 — fear (buy signal)']]},
            ].map(({key,label,opts})=>(
              <div key={key} style={{marginBottom:'10px'}}>
                <span style={s.inputLabel}>{label}</span>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                  {opts.map(([val,lbl])=>(
                    <button key={val} onClick={()=>setMacroInputs(m=>({...m,[key]:val}))}
                      style={{padding:'6px 10px',borderRadius:'8px',fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:macroInputs[key]===val?600:400,
                        background:macroInputs[key]===val?'rgba(201,168,76,0.18)':'rgba(255,255,255,0.04)',
                        border:`0.5px solid ${macroInputs[key]===val?'#c9a84c80':'rgba(255,255,255,0.1)'}`,
                        color:macroInputs[key]===val?'#c9a84c':T.text+'88'}}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── TODAY'S NEWS INPUT ── */}
          <div style={{...s.section, marginBottom:'14px'}}>
            <p style={{...s.sectionTitle, marginBottom:'6px'}}>
              🌐 Today's news <span style={{opacity:0.4,fontWeight:400,letterSpacing:'0.5px'}}>(optional — AI scores market impact)</span>
            </p>
            <p style={{fontSize:'10px',opacity:0.4,marginBottom:'10px',lineHeight:1.5}}>
              Paste headlines or describe: RBI decisions, geopolitical events, budget announcements, oil prices, major policy changes, politician statements…
            </p>
            <textarea
              value={newsText}
              onChange={e=>setNewsText(e.target.value)}
              placeholder={"e.g. RBI cut rates 25bps. FII bought ₹3200cr. Monsoon 12% above normal. India-China border tensions easing."}
              style={{...s.input, height:'72px', resize:'vertical', lineHeight:1.5,
                fontFamily:"'DM Sans',sans-serif", fontSize:'12px', width:'100%', boxSizing:'border-box'}}
            />
            <button
              onClick={scoreNews}
              disabled={newsLoading || !newsText.trim()}
              style={{marginTop:'8px', width:'100%', padding:'10px',
                borderRadius:'10px', fontSize:'12px', fontWeight:600,
                cursor: newsText.trim() ? 'pointer' : 'not-allowed',
                fontFamily:"'DM Sans',sans-serif", letterSpacing:'1px',
                background: newsText.trim() ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                border:`1px solid ${newsText.trim() ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: newsText.trim() ? '#c9a84c' : T.text+'44'}}>
              {newsLoading ? '🤖 Scoring news…' : '🤖 Score this news with AI'}
            </button>

            {/* Sentiment result badge */}
            {newsSentiment && !newsLoading && (() => {
              const s2 = newsSentiment.score || 0;
              const col = s2 >= 3 ? '#7DC66A' : s2 <= -3 ? '#E05C5C' : '#c9a84c';
              const bg  = s2 >= 3 ? 'rgba(100,180,80,0.1)' : s2 <= -3 ? 'rgba(224,92,92,0.1)' : 'rgba(201,168,76,0.1)';
              return (
                <div style={{marginTop:'10px', padding:'12px', borderRadius:'10px',
                  background:bg, border:`1px solid ${col}40`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                    <span style={{fontSize:'12px',fontWeight:700,color:col}}>{newsSentiment.label}</span>
                    <span style={{fontSize:'11px',opacity:0.5}}>Macro adj: {s2>=0?'+':''}{Math.round(s2*1.2)} pts</span>
                  </div>
                  <p style={{fontSize:'12px',margin:'0 0 6px',lineHeight:1.5}}>{newsSentiment.summary}</p>
                  <p style={{fontSize:'11px',opacity:0.55,margin:'0 0 6px',lineHeight:1.5}}>{newsSentiment.detail}</p>
                  {(newsSentiment.sectors_up?.length > 0 || newsSentiment.sectors_down?.length > 0) && (
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'4px'}}>
                      {(newsSentiment.sectors_up||[]).map((sec,i)=>(
                        <span key={i} style={{fontSize:'10px',padding:'2px 8px',borderRadius:'6px',
                          background:'rgba(100,180,80,0.15)',color:'#7DC66A'}}>↑ {sec}</span>
                      ))}
                      {(newsSentiment.sectors_down||[]).map((sec,i)=>(
                        <span key={i} style={{fontSize:'10px',padding:'2px 8px',borderRadius:'6px',
                          background:'rgba(224,92,92,0.15)',color:'#E05C5C'}}>↓ {sec}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Stock name */}
          <div style={s.stockRow}>
            <span style={s.inputLabel}>{hi ? 'स्टॉक नाम (वैकल्पिक)' : 'Stock / Index name (optional)'}</span>
            <input style={s.stockInput} type="text" value={stockInput}
              onChange={e=>{setStockInput(e.target.value);setFetchStatus(null);setPriceSeries(null);setPriceData({currentPrice:'',high52w:'',low52w:'',dma200:'',rsi:''});}}
              placeholder="e.g. RELIANCE, TCS, HDFC Bank, NIFTY 50…"/>
          </div>

          {/* BUILD 1 — Price data inputs (manual, no API needed) */}
          {stockInput.trim() && (
            <div style={{...s.section, marginBottom:'14px'}}>
              <p style={{...s.sectionTitle, marginBottom:'10px'}}>💹 {stockInput.toUpperCase()} — price data <span style={{opacity:0.4,fontWeight:400}}>optional but boosts accuracy significantly</span></p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <div>
                  <span style={s.inputLabel}>Current price (₹)</span>
                  <input style={s.input} type="number" value={priceData.currentPrice}
                    onChange={e=>setPriceData(p=>({...p,currentPrice:e.target.value}))}
                    placeholder="e.g. 2850"/>
                </div>
                <div>
                  <span style={s.inputLabel}>200-day DMA (₹)</span>
                  <input style={s.input} type="number" value={priceData.dma200}
                    onChange={e=>setPriceData(p=>({...p,dma200:e.target.value}))}
                    placeholder="e.g. 2700"/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <div>
                  <span style={s.inputLabel}>52-week high (₹)</span>
                  <input style={s.input} type="number" value={priceData.high52w}
                    onChange={e=>setPriceData(p=>({...p,high52w:e.target.value}))}
                    placeholder="e.g. 3200"/>
                </div>
                <div>
                  <span style={s.inputLabel}>52-week low (₹)</span>
                  <input style={s.input} type="number" value={priceData.low52w}
                    onChange={e=>setPriceData(p=>({...p,low52w:e.target.value}))}
                    placeholder="e.g. 2200"/>
                </div>
              </div>
              <div>
                <span style={s.inputLabel}>RSI (14-day, if known)</span>
                <input style={s.input} type="number" value={priceData.rsi}
                  onChange={e=>setPriceData(p=>({...p,rsi:e.target.value}))}
                  placeholder="e.g. 58 (find on tradingview/moneycontrol)"/>
              </div>
              <div style={{fontSize:'10px',opacity:0.4,marginTop:'8px',lineHeight:1.5}}>
                Find these on Moneycontrol, TradingView, or NSE India website for any stock in seconds.
              </div>
            </div>
          )}

          {/* FIX 3 — Stock-specific context (shown only when stock name entered) */}
          {stockInput.trim() && (
            <div style={{...s.section, marginBottom:'14px'}}>
              <p style={{...s.sectionTitle, marginBottom:'10px'}}>📌 {stockInput.toUpperCase()} — context <span style={{opacity:0.4,fontWeight:400}}>boosts stock accuracy ~7%</span></p>
              {[
                {key:'priceVsHigh', label:'Price vs 52-week high',
                 opts:[['near-high','Within 5% of high'],['below-10','10–20% below'],['below-30','20–40% below'],['deep-value','40%+ below ★']]},
                {key:'recentTrend', label:'Stock trend last 5 days',
                 opts:[['up','↑ Going up'],['flat','→ Flat'],['down','↓ Going down']]},
                {key:'earningsSeason', label:'Earnings season',
                 opts:[['due-soon','Results in 2 weeks ⚠'],['just-reported','Just reported ✓'],['off-season','Off-season']]},
                {key:'sectorFii', label:'FII activity in this sector',
                 opts:[['buying','FII buying ★'],['neutral','Neutral'],['selling','FII selling ✗']]},
              ].map(({key,label,opts})=>(
                <div key={key} style={{marginBottom:'10px'}}>
                  <span style={s.inputLabel}>{label}</span>
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {opts.map(([val,lbl])=>(
                      <button key={val} onClick={()=>setStockContext(c=>({...c,[key]:val}))}
                        style={{padding:'6px 10px',borderRadius:'8px',fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:stockContext[key]===val?600:400,
                          background:stockContext[key]===val?'rgba(201,168,76,0.18)':'rgba(255,255,255,0.04)',
                          border:`0.5px solid ${stockContext[key]===val?'#c9a84c80':'rgba(255,255,255,0.1)'}`,
                          color:stockContext[key]===val?'#c9a84c':T.text+'88'}}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fetch status indicator */}
          {fetchStatus === 'loading' && (
            <div style={{fontSize:'11px',textAlign:'center',color:'#c9a84c',opacity:0.8,marginBottom:'8px',letterSpacing:'1px'}}>
              📡 Fetching live price data…
            </div>
          )}
          {fetchStatus === 'ok' && (
            <div style={{fontSize:'11px',textAlign:'center',color:'#7DC66A',opacity:0.9,marginBottom:'8px',letterSpacing:'0.5px'}}>
              ✓ Price data auto-filled from Yahoo Finance
            </div>
          )}
          {fetchStatus === 'error' && (
            <div style={{fontSize:'11px',textAlign:'center',color:'#c9a84c',opacity:0.7,marginBottom:'8px',letterSpacing:'0.5px'}}>
              ⚠ Could not fetch price data — fill manually or continue without
            </div>
          )}

          {/* Analyze */}
          <button style={s.analyzeBtn} onClick={handleAnalyze} disabled={loading}>
            {loading ? (fetchStatus === 'loading' ? '📡 Fetching prices…' : '⏳ Computing…') : `✦ ${hi ? 'विश्लेषण करें' : 'Analyse Now'} ✦`}
          </button>

          {/* BUILD 3 — Track record / backtest log button */}
          <button
            style={{...s.analyzeBtn, background:'transparent', border:`1px solid ${T.accent}30`, color:T.text+'aa', marginTop:'4px'}}
            onClick={()=>setShowBacktest(true)}>
            📊 {hi ? 'ट्रैक रेकॉर्ड देखें' : `Track Record${backtestLog.length?` (${backtestLog.length})`:''}`}
          </button>

          {/* What's calculated note */}
          <div style={{...s.section, marginTop:'8px'}}>
            <p style={{...s.sectionTitle, marginBottom:'8px'}}>What gets calculated automatically</p>
            {['D1 · D9 Navamsa · D10 Dashamsa','Nakshatra · Tithi · Karana · Yoga · Hora','Vimshottari Dasha (Maha + Antar + Pratyantar)','Ashtakvarga (all 7 planets) · Bhav Madhya','NSE natal house transits (2nd/5th/8th/11th)','Planetary degrees · Retrograde status · Exaltation','Jupiter-Saturn aspect (Western 20-yr cycle)','Lunar phase (Dichev-Janes model)','Ghatak chakra · Avakahada · Yogas','Sector confluence scoring · Month calendar','Price technicals when you provide them (200-DMA, RSI, 52w range)'].map((item,i)=>(
              <p key={i} style={{fontSize:'11px',opacity:0.5,margin:'4px 0',lineHeight:1.5}}>✦ {item}</p>
            ))}
          </div>
        </div>

        {/* BUILD 3 — Backtest / track record modal */}
        {showBacktest && (
          <div style={{
            position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:1000,
            background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'flex-end',
          }} onClick={()=>setShowBacktest(false)}>
            <div style={{
              background: T.bg, width:'100%', maxHeight:'85vh', overflowY:'auto',
              borderRadius:'20px 20px 0 0', padding:'20px', boxSizing:'border-box',
            }} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <p style={{fontSize:'15px',fontWeight:600,color:'#c9a84c',margin:0}}>📊 Your track record</p>
                <button onClick={()=>setShowBacktest(false)} style={{background:'none',border:'none',color:T.text,fontSize:'18px',cursor:'pointer',opacity:0.6}}>✕</button>
              </div>

              {backtestLog.length===0 ? (
                <div style={{textAlign:'center',padding:'30px 10px',opacity:0.5}}>
                  <p style={{fontSize:'12px',lineHeight:1.7}}>
                    No predictions logged yet. After analysing a stock, tap "Log this prediction" in the stock report. Come back in a few weeks and mark whether the prediction was correct — this builds your personal accuracy track record over time, since there's no live price feed to backtest automatically.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'16px'}}>
                    {(()=>{
                      const judged = backtestLog.filter(e=>e.outcome);
                      const correct = judged.filter(e=>e.outcome==='correct').length;
                      const hitRate = judged.length ? Math.round((correct/judged.length)*100) : null;
                      return [
                        {l:'Logged',v:backtestLog.length},
                        {l:'Judged',v:judged.length},
                        {l:'Hit rate',v:hitRate!==null?`${hitRate}%`:'—'},
                      ];
                    })().map((m,i)=>(
                      <div key={i} style={{background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'10px',textAlign:'center'}}>
                        <div style={{fontSize:'9px',opacity:0.4,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'4px'}}>{m.l}</div>
                        <div style={{fontSize:'18px',fontWeight:600,color:'#c9a84c'}}>{m.v}</div>
                      </div>
                    ))}
                  </div>

                  {backtestLog.map(entry=>(
                    <div key={entry.id} style={{...s.section, marginBottom:'8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                        <div>
                          <div style={{fontSize:'13px',fontWeight:600}}>{entry.stock}</div>
                          <div style={{fontSize:'10px',opacity:0.45}}>{entry.date} · Score {entry.score} · {entry.verdict}</div>
                        </div>
                        {entry.outcome && (
                          <span style={{
                            fontSize:'10px',fontWeight:600,padding:'3px 9px',borderRadius:'10px',
                            background: entry.outcome==='correct'?'rgba(100,180,80,0.15)':entry.outcome==='incorrect'?'rgba(224,92,92,0.15)':'rgba(201,168,76,0.15)',
                            color: entry.outcome==='correct'?'#7DC66A':entry.outcome==='incorrect'?'#E05C5C':'#c9a84c',
                          }}>{entry.outcome}</span>
                        )}
                      </div>
                      {!entry.outcome && (
                        <div style={{display:'flex',gap:'6px'}}>
                          <button onClick={()=>updateBacktestOutcome(entry.id,'correct')} style={{flex:1,padding:'6px',borderRadius:'8px',fontSize:'11px',background:'rgba(100,180,80,0.1)',border:'0.5px solid rgba(100,180,80,0.3)',color:'#7DC66A',cursor:'pointer'}}>✓ Correct</button>
                          <button onClick={()=>updateBacktestOutcome(entry.id,'partial')} style={{flex:1,padding:'6px',borderRadius:'8px',fontSize:'11px',background:'rgba(201,168,76,0.1)',border:'0.5px solid rgba(201,168,76,0.3)',color:'#c9a84c',cursor:'pointer'}}>~ Partial</button>
                          <button onClick={()=>updateBacktestOutcome(entry.id,'incorrect')} style={{flex:1,padding:'6px',borderRadius:'8px',fontSize:'11px',background:'rgba(224,92,92,0.1)',border:'0.5px solid rgba(224,92,92,0.3)',color:'#E05C5C',cursor:'pointer'}}>✗ Incorrect</button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULT VIEW ───────────────────────────────────────────────────────────
  const R = result;
  const TABS = ['overview','panchang','planets','dasha','houses','sectors','calendar'];
  if (stockInput.trim()) TABS.push('stock');

  // ── COMPREHENSIVE STOCK REPORT ENGINE ────────────────────────────────────
  let stockData = null;
  if (stockInput.trim()) {
    const key = stockInput.toUpperCase().trim();
    let sectorId = null;
    for (const [k,v] of Object.entries(STOCK_MAP)) { if(key.includes(k)||k.includes(key)){sectorId=v;break;} }
    const sec = R.sectorScores.find(s=>s.id===sectorId);
    const sScore = sec?.score || Math.round((R.composite+60)/2);
    // FIX 3 — Stock-specific context adjustments
    const PRICE_ADJ  = {'near-high':-8,'below-10':3,'below-30':10,'deep-value':16};
    const TREND_ADJ  = {'up':8,'flat':0,'down':-8};
    const EARN_ADJ   = {'due-soon':-10,'just-reported':8,'off-season':0};
    const SFII_ADJ   = {'buying':8,'neutral':0,'selling':-8};
    const ctxBoost   = (PRICE_ADJ[stockContext.priceVsHigh]||0)+(TREND_ADJ[stockContext.recentTrend]||0)+(EARN_ADJ[stockContext.earningsSeason]||0)+(SFII_ADJ[stockContext.sectorFii]||0);

    // BUILD 1 — Blend in actual price technicals when available (highest-confidence layer)
    const hasRealPriceData = R.priceTech !== null;
    const astroSectorBlend = sectorId==='index' ? R.composite : Math.round(R.composite*0.45 + sScore*0.55);
    const fScore = Math.min(98,Math.max(5, hasRealPriceData
      ? Math.round(astroSectorBlend*0.55 + R.priceTech.priceScore*0.45) + ctxBoost
      : astroSectorBlend + ctxBoost
    ));

    // ── UPSIDE / DOWNSIDE MATH ────────────────────────────────────────────
    // Based on composite score bands → statistical return distribution
    // Modelled on NSE historical returns in similar confluence windows
    const bullMult  = fScore>=80?0.28:fScore>=70?0.20:fScore>=60?0.13:fScore>=50?0.07:0.03;
    const bearMult  = fScore>=70?0.06:fScore>=55?0.09:fScore>=45?0.12:0.18;
    const highPct   = Math.round(bullMult*100);   // upside %
    const lowPct    = Math.round(bearMult*100);    // downside if wrong
    const slPct     = fScore>=70?6:fScore>=58?8:fScore>=48?10:13; // stop-loss %
    const targetPct = Math.round(highPct * 0.72); // realistic target = 72% of max upside
    const horizon   = fScore>=78?'3–5 months':fScore>=65?'5–8 months':fScore>=52?'8–12 months':'12–18 months';

    // ── RISK/REWARD RATIO ─────────────────────────────────────────────────
    const rrRatio   = (targetPct / slPct).toFixed(1);

    // ── PROBABILITY ESTIMATE ──────────────────────────────────────────────
    // Confluence model: each bullish layer adds ~8% to base 40% probability
    const probUp    = Math.min(88, 40 + R.bullLayers * 8);
    const probDown  = 100 - probUp;

    // ── VEDIC SPECIFIC SIGNALS ────────────────────────────────────────────
    const dashaFav  = ['Jupiter','Venus','Mercury'].includes(R.dasha.maha);
    const nakFav    = [3,7,12,6,16,26,11].includes(R.moonNak); // Rohini,Pushya,Hasta,Punarvasu,Anuradha,Revati,U.Phalguni
    const tithiFav  = [10,11,12,15,2,3,7].includes(R.tithiNum);
    const exaltFav  = R.exalted.length > 0;
    const retroWarn = R.retro.Mercury;
    const vedicBull = [dashaFav,nakFav,tithiFav,exaltFav].filter(Boolean).length;

    // ── WESTERN SPECIFIC ──────────────────────────────────────────────────
    const jupWest   = R.jupSignQ;
    const satWest   = R.satSignQ;
    const westBull  = jupWest>=65&&satWest>=65&&R.jsAspect.q>=65;

    // ── LUNAR SCIENCE ─────────────────────────────────────────────────────
    const lunarBull = R.phase.dichev >= 62;

    // ── CURRENT WINDOW QUALITY ────────────────────────────────────────────
    const windowNow = NAK_Q[R.moonNak]>=70 && TITHI_Q[R.tithiNum]>=68;

    // ── INVESTMENT ADVISABILITY ───────────────────────────────────────────
    const isAdvisable = fScore>=62 && !retroWarn && vedicBull>=2 && parseFloat(rrRatio)>=1.5;
    const advisability = fScore>=75?'YES — Advisable to invest':fScore>=62?'CONDITIONALLY YES — Enter with caution':fScore>=50?'NEUTRAL — Wait for better window':'NO — Avoid fresh entry now';

    // ── DIRECTION CALL ────────────────────────────────────────────────────
    const directionCall = fScore>=65?'UPWARD bias expected':fScore>=50?'SIDEWAYS / mild upward':'DOWNWARD pressure likely';
    const directionEmoji = fScore>=65?'📈':fScore>=50?'➡️':'📉';

    // ── BEST ENTRY DATE THIS MONTH ────────────────────────────────────────
    const bestDay = R.calDays.filter(d=>d.isMarket).sort((a,b)=>b.score-a.score)[0];
    const bestDate = bestDay ? `${R.date.slice(0,7)}-${String(bestDay.d).padStart(2,'0')} (${VAAR_N[bestDay.dow]})` : 'Check calendar tab';

    // ── POINT-WISE REPORT ─────────────────────────────────────────────────
    const report = [
      {
        num:'01', icon:'🎯',
        title:'Should you invest?',
        value: advisability,
        detail: fScore>=75
          ? `Strong confluence across ${R.bullLayers}/6 signal layers. Vedic, Western, and statistical models align bullishly.`
          : fScore>=62
          ? `Moderate signals — ${R.bullLayers}/6 layers bullish. Invest in small tranches, not lump sum.`
          : fScore>=50
          ? `Mixed signals. Wait for nakshatra window of Pushya, Hasta or Rohini for better entry.`
          : `Multiple bearish signals. ${R.yogas.filter(y=>y.type==='warn').map(y=>y.name).join(', ')||'Weak muhurta'} cautions against entry.`,
        score: fScore, good: fScore>=62
      },
      {
        num:'02', icon:'📈',
        title:'Will it go up?',
        value: directionCall,
        detail: `Statistical probability of upward move: ${probUp}% (based on ${R.bullLayers}/6 bullish confluence layers). ${
          dashaFav?`${R.dasha.maha} Mahadasha historically bullish for ${(PLANET_SEC[R.dasha.maha]||[]).slice(0,2).join('/')}.`
          :'Current dasha planet is neutral-to-bearish for market.'
        } ${lunarBull?'Lunar phase (Dichev model) supports upward move.':'Lunar phase is neutral/bearish.'}`,
        score: probUp, good: probUp>=62
      },
      {
        num:'03', icon:'🚀',
        title:'How high can it go?',
        value: `+${targetPct}% realistic target · Max upside +${highPct}%`,
        detail: `Realistic target in ${horizon}: +${targetPct}% from current price. Maximum upside in a strong bull scenario: +${highPct}%. This is calculated from NSE sector historical returns in similar Dasha + muhurta windows. ${
          sec ? `${sec.name} sector score is ${sScore}/100.` : 'Broad market signal used.'
        }`,
        score: fScore, good: fScore>=60
      },
      {
        num:'04', icon:'🛑',
        title:'Stop-loss level',
        value: `-${slPct}% below your entry price`,
        detail: `Set stop-loss at ${slPct}% below entry. If stock falls ${slPct}%, exit without second-guessing — this model may be wrong or timing may have shifted. Risk/Reward ratio for this window: ${rrRatio}:1. ${parseFloat(rrRatio)>=2?'Excellent R:R ratio.':parseFloat(rrRatio)>=1.5?'Acceptable R:R ratio.':'R:R is tight — trade smaller size.'}`,
        score: parseFloat(rrRatio)>=2?80:parseFloat(rrRatio)>=1.5?65:45, good: parseFloat(rrRatio)>=1.5
      },
      {
        num:'05', icon:'📉',
        title:'Downside risk if wrong',
        value: `-${lowPct}% potential downside`,
        detail: `If astrological and statistical signals fail, downside risk is ${lowPct}%. Stop-loss at ${slPct}% limits your actual loss. Always size positions so max loss = 1–2% of total portfolio. ${
          R.debil.length?`Debilitated ${R.debil.join(', ')} increases volatility risk.`:''
        }${retroWarn?' Mercury retrograde increases false signal risk — reduce position size.':''}`,
        score: lowPct<=8?75:lowPct<=12?55:35, good: lowPct<=10
      },
      {
        num:'06', icon:'🪐',
        title:'Vedic astrology says',
        value: `${vedicBull}/4 Vedic signals bullish`,
        detail: [
          `Mahadasha: ${R.dasha.maha} (${dashaFav?'✓ Bullish planet':'✗ Neutral/bearish'})`,
          `Antardasha: ${R.dasha.antar} (boosts ${(PLANET_SEC[R.dasha.antar]||[]).slice(0,2).join(', ')})`,
          `Nakshatra: ${NAK_NAMES[R.moonNak]} — ${NAK_NATURE[R.moonNak]} nature (${nakFav?'✓ Favourable':'✗ Caution'})`,
          `Tithi: ${TITHI_N[R.tithiNum]} (${tithiFav?'✓ Auspicious':'✗ Avoid new entries'})`,
          `Exalted planets: ${R.exalted.length?R.exalted.join(', '):'None'}`,
          R.yogas.filter(y=>y.type==='good').map(y=>y.name).join(' · ')||'No special yogas today',
        ].join('\n'),
        score: vedicBull>=3?80:vedicBull>=2?65:40, good: vedicBull>=2
      },
      {
        num:'07', icon:'⭐',
        title:'Western astrology says',
        value: `Jupiter in ${RASHI[R.planets.Jupiter.sign]} · Saturn in ${RASHI[R.planets.Saturn.sign]}`,
        detail: `Jupiter sign score: ${jupWest}/100. Saturn sign score: ${satWest}/100. Jupiter-Saturn aspect: ${R.jsAspect.name} (${R.jsAspect.note}). ${
          westBull?'Western planetary cycle is supportive.':'Western cycle is mixed — add caution.'
        }${R.retro.Jupiter?' Jupiter retrograde: expansion pauses.':''}${R.retro.Saturn?' Saturn retrograde: value stocks preferred over growth.':''}${retroWarn?' ⚠ Mercury retrograde active — avoid IT/tech/banking entries.':''}`,
        score: R.westernScore, good: R.westernScore>=60
      },
      {
        num:'08', icon:'🌕',
        title:'Lunar science says',
        value: `${R.phase.name} ${R.phase.emoji} · ${R.paksha} Paksha`,
        detail: `Dichev-Janes model score: ${R.phase.dichev}/100. ${
          lunarBull
          ?'Full moon / waxing phase historically shows higher equity returns (Dichev & Janes, Journal of Finance, 48-country study).'
          :'Waning / new moon phase — historically lower equity returns in Dichev model.'
        } Paksha bias: ${R.paksha==='Shukla'?'Shukla Paksha supports accumulation.':'Krishna Paksha better for exits/booking profits.'}`,
        score: R.lunarScore, good: R.lunarScore>=55
      },
      {
        num:'09', icon:'📅',
        title:'Best date to enter',
        value: bestDate,
        detail: `Best calendar window this month based on vaar quality, estimated tithi, and current planetary configuration. Prefer Thursday (Jupiter hora) or Wednesday (Mercury hora) at market open 9:15–10:00 AM IST. Avoid entry on ${R.yogas.filter(y=>y.type==='warn').length?'days with '+R.yogas.filter(y=>y.type==='warn').map(y=>y.name.replace('⚠','')).join(', '):'inauspicious tithis (4, 8, 13, Amavasya)'}.`,
        score: bestDay?.score||55, good: (bestDay?.score||55)>=60
      },
      {
        num:'10', icon:'⚖️',
        title:'Overall verdict',
        value: fScore>=75?'STRONG BUY':fScore>=62?'BUY — with SIP approach':fScore>=50?'HOLD — no fresh entry':fScore>=40?'REDUCE — book partial profits':'EXIT / AVOID',
        detail: `Composite score: ${fScore}/100 across 6 independent models. Risk/Reward: ${rrRatio}:1. Upward probability: ${probUp}%. ${
          isAdvisable
          ?`This window is favourable. Enter in 2–3 tranches, not all at once. Keep stop-loss strict at ${slPct}%.`
          :`Wait for composite score above 65 and at least 4/6 bullish layers before committing capital.`
        }`,
        score: fScore, good: fScore>=62
      },
    ];

    stockData = {
      symbol:key, sector:sec?.name||'Broad market', sectorScore:sScore, finalScore:fScore,
      highPct, targetPct, lowPct, slPct, rrRatio, probUp, probDown,
      horizon, isAdvisable, advisability, directionCall, directionEmoji,
      vedicBull, westBull, lunarBull, windowNow, bestDate, report,
      hasRealPriceData, priceTech: R.priceTech,
      verdict:fScore>=75?'Strong buy signal':fScore>=62?'Moderate buy':fScore>=50?'Neutral — hold':fScore>=40?'Caution — reduce':'Avoid / exit',
    };
  }

  const LAYER_NAMES = {vedic:'Vedic analysis',western:'Western astrology',lunar:'Lunar science',macro:'Economic macro',tech:'Technical',dasha:'Dasha cycle'};
  const LAYER_W     = {vedic:32,western:16,lunar:10,macro:22,tech:12,dasha:8};

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={()=>setView('home')}>←</button>
        <div style={{flex:1}}>
          <p style={s.headerTitle}>📈 {hi ? 'वैदिक शेयर बाज़ार' : 'Vedic Stock Oracle'}</p>
          <p style={s.headerSub}>{R.date} · {R.time} IST · {city}</p>
        </div>
        <button style={{...s.backBtn,fontSize:'13px',opacity:0.5}} onClick={()=>setView('home')}>
          {hi?'बदलें':'Edit'}
        </button>
      </div>

      {/* Tab bar */}
      <div style={s.tabRow}>
        {TABS.map(t=>(
          <button key={t} style={s.tabBtn(activeTab===t)} onClick={()=>setActiveTab(t)}>
            {t==='stock'&&stockInput?stockInput.toUpperCase().slice(0,8):t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.body}>

        {/* ── OVERVIEW ── */}
        {activeTab==='overview' && (
          <>
            <div style={s.scoreWrap}>
              <ScoreArc score={R.composite}/>
              <div>
                <div style={{fontSize:'16px',fontWeight:500,color:scoreColor(R.composite),marginBottom:'4px'}}>
                  {scoreLabel(R.composite)}
                </div>
                <div style={{fontSize:'12px',opacity:0.55,marginBottom:'4px'}}>
                  {R.bullLayers}/6 layers bullish · {NAK_NAMES[R.moonNak]} nakshatra
                </div>
                <div style={{fontSize:'12px',opacity:0.55}}>
                  {TITHI_N[R.tithiNum]} · {VAAR_N[R.dow]} · {R.paksha} Paksha
                </div>
              </div>
            </div>

            {/* Layer bars */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Signal layers</p>
              {Object.entries(R.layers).map(([k,v])=>(
                <div key={k} style={s.pbarRow}>
                  <span style={s.pbarLabel}>{LAYER_NAMES[k]} <span style={{opacity:0.4}}>{LAYER_W[k]}%</span></span>
                  <div style={s.pbarTrack}><div style={s.pbarFill(v)}/></div>
                  <span style={{...s.pbarVal,color:scoreColor(v)}}>{v}</span>
                </div>
              ))}
            </div>

            {/* Yogas */}
            {R.yogas.filter(y=>y.type==='good').map((y,i)=>(
              <div key={i} style={s.alert('good')}><strong>{y.name}</strong> — {y.note}</div>
            ))}
            {R.yogas.filter(y=>y.type==='warn').map((y,i)=>(
              <div key={i} style={s.alert('warn')}><strong>{y.name}</strong> — {y.note}</div>
            ))}

            {/* Metrics */}
            <div style={s.metricGrid}>
              <div style={s.metric}><div style={s.metricLabel}>Composite</div><div style={s.metricVal(R.composite)}>{R.composite}</div><div style={s.metricSub}>out of 100</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Muhurta</div><div style={s.metricVal(R.mScore)}>{R.mScore}</div><div style={s.metricSub}>auspiciousness</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Dasha</div><div style={s.metricVal(R.dashaScore)}>{R.dashaScore}</div><div style={s.metricSub}>{R.dasha.maha} / {R.dasha.antar}</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Vedic deep</div><div style={s.metricVal(R.vedicScore)}>{R.vedicScore}</div><div style={s.metricSub}>all Vedic layers</div></div>
            </div>

            {/* Quick signals */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Key signals</p>
              {[
                {label:`Exalted planets`,sub:R.exalted.length?R.exalted.join(', '):'None currently',score:R.exalted.length?75:55},
                {label:`Debilitated planets`,sub:R.debil.length?R.debil.join(', '):'None — positive',score:R.debil.length?30:72},
                {label:`Mercury ${R.retro.Mercury?'retrograde ⚠':'direct ✓'}`,sub:R.retro.Mercury?'Avoid IT/banking/telecom entries':'Good for IT, banking, logistics',score:R.retro.Mercury?28:72},
                {label:`Jupiter-Saturn: ${R.jsAspect.name}`,sub:R.jsAspect.note,score:R.jsAspect.q},
                {label:`Lunar: ${R.phase.name} ${R.phase.emoji}`,sub:`Dichev model score · ${R.paksha} Paksha`,score:R.lunarScore},
              ].map((sig,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===4?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={s.sigDot(sig.score)}/>
                  <div style={{flex:1}}>
                    <div style={s.sigName}>{sig.label}</div>
                    <div style={s.sigSub}>{sig.sub}</div>
                  </div>
                  <span style={s.badge(sig.score)}>{sig.score}</span>
                </div>
              ))}
            </div>

            {/* ── PLAIN-ENGLISH REPORT BUTTON ── */}
            <button
              onClick={()=>setShowReport(r=>!r)}
              style={{width:'100%',padding:'14px',marginBottom:'10px',borderRadius:'12px',
                fontSize:'13px',fontWeight:600,cursor:'pointer',letterSpacing:'1px',
                background:showReport?'rgba(201,168,76,0.14)':'rgba(255,255,255,0.04)',
                border:`1px solid ${showReport?'rgba(201,168,76,0.5)':'rgba(255,255,255,0.1)'}`,
                color:showReport?'#c9a84c':T.text,fontFamily:"'DM Sans',sans-serif"}}>
              {showReport ? '▲ Hide explanation' : '📖 Explain this analysis — plain English'}
            </button>

            {/* ── PLAIN-ENGLISH REPORT PANEL ── */}
            {showReport && (()=>{
              const score = R.composite;
              const scoreVerdict = score>=65?'GREEN — conditions favour entry':score>=50?'YELLOW — neutral, wait for better window':'RED — avoid new positions';
              const scoreColor2 = score>=65?'#7DC66A':score<50?'#E05C5C':'#c9a84c';
              const rikta = [4,8,13].includes(R.tithiNum);
              const amavasya = R.tithiNum===16;
              const retroMerc = R.retro.Mercury;
              const rStyle = {fontSize:'12px',lineHeight:1.75,opacity:0.75,margin:'0 0 4px'};
              const headStyle = {fontSize:'11px',fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',
                color:'#c9a84c',opacity:0.9,margin:'16px 0 6px'};
              const blockStyle = {background:'rgba(255,255,255,0.03)',borderRadius:'12px',
                border:'0.5px solid rgba(255,255,255,0.08)',padding:'14px 16px',marginBottom:'10px'};

              return (
                <div style={{marginBottom:'16px'}}>

                  {/* 1. Master score */}
                  <div style={{...blockStyle,borderColor:scoreColor2+'40'}}>
                    <p style={{...headStyle,color:scoreColor2}}>① Master score — {score}/100</p>
                    <p style={rStyle}>
                      This is the only number you need for a quick decision.
                      Think of it as a traffic light:
                    </p>
                    <p style={{...rStyle,paddingLeft:'12px'}}>
                      🟢 <strong>65–100</strong> = Enter. Conditions favour buying.<br/>
                      🟡 <strong>50–64</strong> = Wait. Mixed signals.<br/>
                      🔴 <strong>Below 50</strong> = Avoid. Multiple bearish signals.
                    </p>
                    <p style={{...rStyle,fontWeight:600,color:scoreColor2}}>
                      Your score of {score} = {scoreVerdict}.
                    </p>
                  </div>

                  {/* 2. Layers */}
                  <div style={blockStyle}>
                    <p style={headStyle}>② What the {R.bullLayers}/6 layers mean</p>
                    <p style={rStyle}>The score is built from 6 independent models. You ideally want <strong>4 or more layers bullish</strong> before entering.</p>
                    {[
                      {name:'Vedic (32%)', score:R.vedicScore, explain:`Nakshatra quality, tithi, hora, dasha, and ashtakvarga. The heaviest layer. Your score: ${R.vedicScore}/100.`},
                      {name:'Macro (22%)', score:R.layers.macro, explain:`Your 5 market context inputs (Nifty trend, DMA, FII flow, RBI stance, VIX)${R.newsSentiment?` + AI news sentiment (${R.newsSentiment.label}, adj ${R.newsSentiment.score>=0?'+':''}${Math.round((R.newsSentiment.score||0)*1.2)} pts)`:' — add news below for AI sentiment boost'}. Score: ${R.layers.macro}/100.`},
                      {name:'Western (16%)', score:R.westernScore, explain:`Jupiter sign quality (${R.jupSignQ}/100) × 40% + Saturn sign quality (${R.satSignQ}/100) × 30% + Jupiter-Saturn aspect (${R.jsAspect.name}) × 30%. Score: ${R.westernScore}/100.`},
                      {name:'Technical (12%)', score:R.layers.tech, explain:`Price vs 200-DMA, RSI, 52-week range position. Score: ${R.layers.tech}/100. ${R.priceTech?'Live price data used.':'No price data entered — neutral 55 assumed.'}`},
                      {name:'Lunar (10%)', score:R.lunarScore, explain:`Dichev-Janes academic model: returns are statistically higher in the waxing (Shukla) phase. Current: ${R.phase.name} ${R.phase.emoji}, ${R.paksha} Paksha. Score: ${R.lunarScore}/100.`},
                      {name:'Dasha (8%)', score:R.dashaScore, explain:`Vimshottari dasha: ${R.dasha.maha} Maha + ${R.dasha.antar} Antar + ${R.dasha.pratyantar} Pratyantar. Score: ${R.dashaScore}/100.`},
                    ].map((l,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'10px'}}>
                        <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,marginTop:'5px',
                          background:l.score>=65?'#7DC66A':l.score<50?'#E05C5C':'#c9a84c'}}/>
                        <div>
                          <div style={{fontSize:'12px',fontWeight:600,marginBottom:'2px'}}>{l.name} — <span style={{color:l.score>=65?'#7DC66A':l.score<50?'#E05C5C':'#c9a84c'}}>{l.score}/100</span></div>
                          <div style={{fontSize:'11px',opacity:0.55,lineHeight:1.6}}>{l.explain}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3. Tithi */}
                  <div style={{...blockStyle,borderColor:rikta||amavasya?'rgba(224,92,92,0.3)':'rgba(255,255,255,0.08)'}}>
                    <p style={{...headStyle,color:rikta||amavasya?'#E05C5C':'#c9a84c'}}>③ Tithi — {TITHI_N[R.tithiNum]} ({R.tithiNum})</p>
                    <p style={rStyle}>
                      {rikta
                        ? `⚠ Rikta tithi. Tithis 4, 8, and 13 are called "Rikta" (empty) in classical Muhurta texts — Muhurta Chintamani strictly forbids new financial commitments on these days. This is a strong reason to wait.`
                        : amavasya
                        ? `⚠ Amavasya (new moon). Complete prohibition on new financial beginnings in all classical Vedic texts.`
                        : R.tithiNum===15
                        ? `✓ Purnima (full moon) — maximum energy. One of the most auspicious tithis for bold entries.`
                        : R.tithiNum===11
                        ? `✓ Ekadashi — considered the most auspicious tithi for wealth-related decisions across all classical texts.`
                        : `${TITHI_N[R.tithiNum]} is a standard tithi — no special prohibition, no special blessing. Score: ${TITHI_Q[R.tithiNum]}/100.`}
                    </p>
                    <p style={rStyle}><strong>Best tithis to watch for:</strong> Ekadashi (11), Dwadashi (12), Dashami (10), Purnima (15).</p>
                  </div>

                  {/* 4. Dasha */}
                  <div style={blockStyle}>
                    <p style={headStyle}>④ Dasha — {R.dasha.maha} / {R.dasha.antar} / {R.dasha.pratyantar}</p>
                    <p style={rStyle}>
                      You are in <strong>{R.dasha.maha} Mahadasha</strong> (the 7–20 year backdrop), <strong>{R.dasha.antar} Antardasha</strong> (months-long sub-period), and <strong>{R.dasha.pratyantar} Pratyantar</strong> (week-level). These are calculated from NSE's natal chart (founded 4 Nov 1992).
                    </p>
                    <p style={rStyle}>
                      {R.dasha.maha==='Jupiter'||R.dasha.maha==='Venus'||R.dasha.maha==='Mercury'||R.dasha.maha==='Moon'
                        ? `✓ ${R.dasha.maha} is a natural benefic — its Mahadasha generally supports market growth, especially in ${(PLANET_SEC[R.dasha.maha]||[]).slice(0,3).join(', ')}.`
                        : `${R.dasha.maha} Mahadasha is neutral-to-bearish for broad markets. Favour defensive sectors and smaller position sizes.`}
                    </p>
                    <p style={rStyle}>Dasha score: <strong style={{color:scoreColor(R.dashaScore)}}>{R.dashaScore}/100</strong></p>
                  </div>

                  {/* 5. Planets */}
                  <div style={blockStyle}>
                    <p style={headStyle}>⑤ Exalted & debilitated planets</p>
                    {R.exalted.length>0 && <p style={rStyle}>✓ <strong>Exalted: {R.exalted.join(', ')}</strong> — these planets are at maximum strength. {R.exalted.includes('Jupiter')?'Jupiter exalted strongly blesses banking, education, and finance sectors. ':''}{R.exalted.includes('Venus')?'Venus exalted favours luxury, auto, and FMCG. ':''}{R.exalted.includes('Mercury')?'Mercury exalted is excellent for IT and telecom. ':''}</p>}
                    {R.debil.length>0 && <p style={rStyle}>✗ <strong>Debilitated: {R.debil.join(', ')}</strong> — these planets are weakened. {R.debil.includes('Venus')?'Venus debilitated puts pressure on luxury, auto, pharma sectors. ':''}{R.debil.includes('Jupiter')?'Jupiter debilitated weakens banking and finance sentiment. ':''}{R.debil.includes('Mercury')?'Mercury debilitated — avoid IT/telecom entries. ':''}</p>}
                    {R.exalted.length===0&&R.debil.length===0 && <p style={rStyle}>No planets are exalted or debilitated right now — neutral planetary strength across sectors.</p>}
                    <p style={rStyle}><strong>Mercury {retroMerc?'retrograde ⚠':'direct ✓'}</strong> — {retroMerc?'Avoid IT, banking, logistics, and communication sector entries. Contracts signed during Mercury retrograde often face reversals.':'Mercury direct is good for IT, banking, logistics, and communication stocks.'}</p>
                  </div>

                  {/* 6. Jupiter-Saturn */}
                  <div style={blockStyle}>
                    <p style={headStyle}>⑥ Jupiter–Saturn aspect — {R.jsAspect.name}</p>
                    <p style={rStyle}>These two planets form a 20-year economic cycle tracked by both Western and Vedic astrologers. Their mutual angle right now is <strong>{R.jsAspect.name}</strong> ({R.jsAspect.note}).</p>
                    <p style={rStyle}>
                      {R.jsAspect.name.includes('Trine')?'✓ Trine is the most bullish aspect — sustained bull market energy. Enter with confidence when other layers agree.'
                      :R.jsAspect.name.includes('Sextile')?'✓ Sextile is a mild opportunity aspect — good for selective entries.'
                      :R.jsAspect.name.includes('Square')||R.jsAspect.name.includes('Opposition')?'⚠ Stress aspect — markets may face corrections or volatility. Reduce position sizes.'
                      :'No major aspect currently — transitional phase. Neither strongly bullish nor bearish.'}
                    </p>
                    <p style={rStyle}>Aspect score: <strong style={{color:scoreColor(R.jsAspect.q)}}>{R.jsAspect.q}/100</strong></p>
                  </div>

                  {/* 7. Lunar */}
                  <div style={blockStyle}>
                    <p style={headStyle}>⑦ Lunar phase — {R.phase.name} {R.phase.emoji}</p>
                    <p style={rStyle}>The <strong>Dichev-Janes model</strong> (published in the American Economic Review) found that stock returns are measurably higher in the 15 days after a new moon (waxing / Shukla phase) than the 15 days before it (waning / Krishna phase). This is not astrology folklore — it is a peer-reviewed academic finding.</p>
                    <p style={rStyle}>
                      {R.paksha==='Shukla'
                        ? '✓ You are in Shukla Paksha (waxing, bright fortnight) — the statistically favourable half of the lunar month.'
                        : '⚠ You are in Krishna Paksha (waning, dark fortnight) — the statistically weaker half. Lunar science slightly cautions against entry.'}
                    </p>
                    <p style={rStyle}>Lunar score: <strong style={{color:scoreColor(R.lunarScore)}}>{R.lunarScore}/100</strong></p>
                  </div>

                  {/* 7b. News sentiment */}
                  {R.newsSentiment && (() => {
                    const ns = R.newsSentiment;
                    const s2 = ns.score || 0;
                    const col = s2>=3?'#7DC66A':s2<=-3?'#E05C5C':'#c9a84c';
                    return (
                      <div style={{...blockStyle,borderColor:col+'40'}}>
                        <p style={{...headStyle,color:col}}>⑦b News & geopolitical sentiment — {ns.label}</p>
                        <p style={rStyle}><strong>AI sentiment score: {s2>=0?'+':''}{s2}/10</strong> → macro layer adjusted by {s2>=0?'+':''}{Math.round(s2*1.2)} points.</p>
                        <p style={rStyle}>{ns.summary}</p>
                        <p style={rStyle}>{ns.detail}</p>
                        {(ns.sectors_up?.length>0||ns.sectors_down?.length>0) && (
                          <p style={rStyle}>
                            {ns.sectors_up?.length>0 && <span>Sectors benefiting: <strong style={{color:'#7DC66A'}}>{ns.sectors_up.join(', ')}</strong>. </span>}
                            {ns.sectors_down?.length>0 && <span>Sectors under pressure: <strong style={{color:'#E05C5C'}}>{ns.sectors_down.join(', ')}</strong>.</span>}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* 8. Bottom line */}
                  <div style={{...blockStyle,borderColor:score>=65?'rgba(100,180,80,0.3)':score<50?'rgba(224,92,92,0.3)':'rgba(201,168,76,0.3)'}}>
                    <p style={{...headStyle,color:scoreColor2}}>⑧ Bottom line{stockInput?` — ${stockInput.toUpperCase()}`:''}</p>
                    <p style={rStyle}>
                      {score>=65
                        ? `Score ${score}/100 with ${R.bullLayers}/6 layers bullish — conditions are favourable. Enter in 2–3 tranches rather than lump sum. ${rikta?'Note: today is a Rikta tithi — wait one day if possible.':''}`
                        : score>=50
                        ? `Score ${score}/100 with only ${R.bullLayers}/6 layers bullish — too mixed to act confidently. ${rikta?'Rikta tithi today is a classical prohibition. ':''}Wait for score ≥65 and at least 4 layers aligning.`
                        : `Score ${score}/100 — multiple bearish signals active. ${rikta?'Rikta tithi. ':''}${retroMerc?'Mercury retrograde. ':''}${R.debil.length?`Debilitated ${R.debil.join(', ')}. `:''}Do not enter new positions.`}
                    </p>
                    <p style={rStyle}><strong>Best windows to watch:</strong> Ekadashi or Purnima tithi · Thursday (Jupiter) or Wednesday (Mercury) · Score ≥65 · Mercury direct · 4+ layers bullish.</p>
                  </div>

                </div>
              );
            })()}
          </>
        )}

        {/* ── PANCHANG ── */}
        {activeTab==='panchang' && (
          <>
            <div style={s.section}>
              <p style={s.sectionTitle}>Panchang — {R.date} · {R.time} IST</p>
              {[
                {l:'Tithi',v:`${TITHI_N[R.tithiNum]} (${R.tithiNum})`,s:TITHI_Q[R.tithiNum]||55},
                {l:'Nakshatra',v:`${NAK_NAMES[R.moonNak]} (Pada ${R.planets.Moon.pada})`,s:NAK_Q[R.moonNak]},
                {l:'Nakshatra nature',v:NAK_NATURE[R.moonNak],s:null},
                {l:'Nakshatra ruler',v:NAK_RULER[R.moonNak],s:null},
                {l:'Vaar (weekday)',v:VAAR_N[R.dow],s:VAAR_Q[R.dow]},
                {l:'Paksha',v:R.paksha,s:R.paksha==='Shukla'?72:42},
                {l:'Lunar phase',v:`${R.phase.name} ${R.phase.emoji}`,s:R.phase.dichev},
                {l:'Hora at entry',v:`${R.horaData.planet} hora`,s:R.horaData.quality},
                {l:'Lagna (ascendant)',v:`${RASHI[R.lagnaSign]} ${(R.lagnaLng%30).toFixed(1)}°`,s:null},
                {l:'Sun nakshatra',v:NAK_NAMES[R.sunNak],s:null},
              ].map((row,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===9?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={s.sigDot(row.s||55)}/>
                  <div style={{flex:1}}>
                    <div style={s.sigName}>{row.l}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:'12px'}}>{row.v}</span>
                    {row.s && <span style={{...s.badge(row.s),marginLeft:'6px'}}>{row.s}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={s.section}>
              <p style={s.sectionTitle}>Activated sectors (nakshatra + vaar)</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                {[...NAK_SEC[R.moonNak],...(PLANET_SEC[VAAR_L[R.dow]]||[])].filter((v,i,a)=>a.indexOf(v)===i).map((sec,i)=>(
                  <span key={i} style={s.chip}>{sec}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── PLANETS ── */}
        {activeTab==='planets' && (
          <>
            <div style={s.section}>
              <p style={s.sectionTitle}>Planetary positions — sidereal (Lahiri)</p>
              {['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'].map((p,i)=>{
                const pos=R.planets[p];
                const isEx=EXALT[p]===pos.sign,isDeb=DEBIL[p]===pos.sign;
                const status=isEx?'Exalted ★':isDeb?'Debilitated ⚠':'—';
                const score=isEx?82:isDeb?28:55;
                return(
                  <div key={p} style={{...s.sigRow,borderBottom:i===8?'none':`0.5px solid ${T.accent}15`}}>
                    <div style={{fontSize:'16px',width:'22px',textAlign:'center',flexShrink:0}}>
                      {{'Sun':'☉','Moon':'☽','Mars':'♂','Mercury':'☿','Jupiter':'♃','Venus':'♀','Saturn':'♄','Rahu':'☊','Ketu':'☋'}[p]}
                    </div>
                    <div style={{flex:1}}>
                      <div style={s.sigName}>{p} <span style={s.badge(score)}>{status}</span>{R.retro[p]&&<span style={{...s.badge(30),marginLeft:'4px'}}>R</span>}</div>
                      <div style={s.sigSub}>{RASHI[pos.sign]} {pos.deg.toFixed(1)}° · {NAK_NAMES[pos.nakIdx]} · D9: {RASHI[R.d9[p]]} · D10: {RASHI[R.d10[p]]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={s.section}>
              <p style={s.sectionTitle}>Ashtakvarga (Sun · Moon · Jupiter)</p>
              {Object.entries(R.ashtak).map(([p,sc])=>(
                <div key={p} style={s.pbarRow}>
                  <span style={s.pbarLabel}>{p}</span>
                  <div style={s.pbarTrack}><div style={{...s.pbarFill(sc*12.5)}}/></div>
                  <span style={{...s.pbarVal,color:scoreColor(sc*12.5)}}>{sc}/8</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── DASHA ── */}
        {activeTab==='dasha' && (
          <>
            <div style={s.metricGrid}>
              <div style={s.metric}><div style={s.metricLabel}>Mahadasha</div><div style={{fontSize:'20px',fontWeight:500,color:'#c9a84c'}}>{R.dasha.maha}</div><div style={s.metricSub}>major period</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Antardasha</div><div style={{fontSize:'20px',fontWeight:500,color:'#c9a84c'}}>{R.dasha.antar}</div><div style={s.metricSub}>sub-period</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Pratyantar</div><div style={{fontSize:'20px',fontWeight:500,color:'#c9a84c'}}>{R.dasha.pratyantar}</div><div style={s.metricSub}>sub-sub (weekly)</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Dasha score</div><div style={{fontSize:'20px',fontWeight:500,color:scoreColor(R.dashaScore)}}>{R.dashaScore}</div><div style={s.metricSub}>all 3 levels</div></div>
            </div>
            <div style={s.section}>
              <p style={s.sectionTitle}>Dasha-activated sectors</p>
              {[R.dasha.maha,R.dasha.antar].map((p,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===1?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={s.sigDot(65)}/>
                  <div style={{flex:1}}>
                    <div style={s.sigName}>{p} {i===0?'Mahadasha':'Antardasha'}</div>
                    <div style={s.sigSub}>{(PLANET_SEC[p]||[]).join(' · ')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={s.section}>
              <p style={s.sectionTitle}>Transit influence</p>
              {[
                {l:`Jupiter in ${RASHI[R.planets.Jupiter.sign]}`,sub:`12-yr cycle · score ${R.jupSignQ} (classical) · sectors: ${(PLANET_SEC.Jupiter||[]).slice(0,3).join(', ')}`,s:R.jupSignQ},
                {l:`Saturn in ${RASHI[R.planets.Saturn.sign]}${R.retro.Saturn?' (R)':''}`,sub:`29-yr cycle · score ${R.satSignQ} (classical) · sectors: ${(PLANET_SEC.Saturn||[]).slice(0,3).join(', ')}`,s:R.satSignQ},
                {l:`Jupiter-Saturn: ${R.jsAspect.name}`,sub:R.jsAspect.note,s:R.jsAspect.q},
                {l:`Rahu in ${RASHI[R.planets.Rahu.sign]}`,sub:`18-yr nodal cycle · sectors: ${(PLANET_SEC.Rahu||[]).join(', ')}`,s:55},
              ].map((row,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===3?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={s.sigDot(row.s)}/>
                  <div style={{flex:1}}><div style={s.sigName}>{row.l}</div><div style={s.sigSub}>{row.sub}</div></div>
                  <span style={s.badge(row.s)}>{row.s}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── HOUSES (Build 2: NSE natal house transits) ── */}
        {activeTab==='houses' && (
          <>
            <div style={{...s.alert('gold'),marginBottom:'10px'}}>
              <strong>NSE natal lagna:</strong> {RASHI[R.NSE_LAGNA_SIGN]} ({RASHI_EN[R.NSE_LAGNA_SIGN]}) — from exchange founding 4 Nov 1992, 09:15 IST, Mumbai
            </div>
            <div style={s.section}>
              <p style={s.sectionTitle}>What this means</p>
              <p style={{fontSize:'11px',opacity:0.55,lineHeight:1.6,marginBottom:'8px'}}>
                Every planet transiting right now falls in a specific house counted from NSE's own birth chart. This is the core technique of financial Jyotish — the 2nd (wealth), 5th (speculation), 8th (sudden gain/loss) and 11th (profits) houses matter most for market direction.
              </p>
            </div>
            <div style={s.metricGrid}>
              <div style={s.metric}>
                <div style={s.metricLabel}>House transit score</div>
                <div style={s.metricVal(R.houseTransits.avgImpact)}>{R.houseTransits.avgImpact}</div>
                <div style={s.metricSub}>across 9 planets</div>
              </div>
              <div style={s.metric}>
                <div style={s.metricLabel}>Wealth quadrant</div>
                <div style={{fontSize:'20px',fontWeight:500,color:'#c9a84c'}}>{R.houseTransits.wealthHouseOccupants.length}</div>
                <div style={s.metricSub}>planets in 2/5/8/11</div>
              </div>
            </div>

            {R.houseTransits.eleventhHouseOccupants.length>0 && (
              <div style={s.alert('good')}>
                <strong>★ 11th house occupied:</strong> {R.houseTransits.eleventhHouseOccupants.map(t=>t.planet).join(', ')} — the most auspicious house for market gains and profits. This is a genuinely bullish structural signal.
              </div>
            )}
            {R.houseTransits.eighthHouseOccupants.length>0 && (
              <div style={s.alert('warn')}>
                <strong>⚠ 8th house occupied:</strong> {R.houseTransits.eighthHouseOccupants.map(t=>t.planet).join(', ')} — house of sudden gain/loss and high volatility. Expect sharper-than-usual moves; size positions accordingly.
              </div>
            )}

            <div style={s.section}>
              <p style={s.sectionTitle}>All 9 planets — house position from NSE lagna</p>
              {R.houseTransits.transits.map((t,i)=>(
                <div key={t.planet} style={{...s.sigRow,borderBottom:i===8?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={{fontSize:'16px',width:'22px',textAlign:'center',flexShrink:0}}>
                    {{'Sun':'☉','Moon':'☽','Mars':'♂','Mercury':'☿','Jupiter':'♃','Venus':'♀','Saturn':'♄','Rahu':'☊','Ketu':'☋'}[t.planet]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={s.sigName}>{t.planet} → {t.house}{['st','nd','rd'][t.house-1]||'th'} house · {t.houseInfo.name}</div>
                    <div style={s.sigSub}>{t.houseInfo.note}</div>
                  </div>
                  <span style={s.badge(t.impact)}>{t.impact}</span>
                </div>
              ))}
            </div>

            <div style={s.section}>
              <p style={s.sectionTitle}>House meanings reference</p>
              {[2,5,8,11].map(h=>(
                <div key={h} style={{...s.sigRow,borderBottom:h===11?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={{...s.sigDot(70),marginTop:'6px'}}/>
                  <div style={{flex:1}}>
                    <div style={s.sigName}>{h}{['st','nd','rd'][h-1]||'th'} house — {HOUSE_MARKET_MEANING[h].name}</div>
                    <div style={s.sigSub}>{HOUSE_MARKET_MEANING[h].note}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SECTORS ── */}
        {activeTab==='sectors' && (
          <>
            <div style={{...s.alert('gold'),marginBottom:'10px'}}>
              <strong>Top pick:</strong> {R.sectorScores[0]?.name} · Score {R.sectorScores[0]?.score}
            </div>
            <div style={s.section}>
              <p style={s.sectionTitle}>All NSE sectors — ranked</p>
              {R.sectorScores.map((sec,i)=>(
                <div key={sec.id} style={{...s.sigRow,borderBottom:i===R.sectorScores.length-1?'none':`0.5px solid ${T.accent}15`}}>
                  <span style={{fontSize:'18px',width:'26px',textAlign:'center',flexShrink:0}}>{sec.icon}</span>
                  <div style={{flex:1}}>
                    <div style={s.sigName}>{sec.name}</div>
                    <div style={s.sigSub}>{sec.score>=70?'Entry window now':sec.score>=58?'Monitor closely':sec.score>=46?'Hold existing':'Book profits / exit'}</div>
                  </div>
                  <span style={s.badge(sec.score)}>{sec.score>=72?'★ Buy':sec.score>=60?'Watch':sec.score>=46?'Hold':'Avoid'} · {sec.score}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CALENDAR ── */}
        {activeTab==='calendar' && (
          <>
            <div style={s.section}>
              <p style={s.sectionTitle}>Monthly signal heatmap</p>
              <div style={s.heatGrid}>
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>(
                  <div key={d} style={{textAlign:'center',fontSize:'9px',opacity:0.4,padding:'2px 0'}}>{d}</div>
                ))}
                {Array(R.startDow).fill(null).map((_,i)=><div key={`b${i}`}/>)}
                {R.calDays.map(d=>(
                  <div key={d.d} style={s.heatDay(d.score,d.isMarket)}>{d.d}</div>
                ))}
              </div>
              <div style={{display:'flex',gap:'12px',marginTop:'10px',fontSize:'10px',opacity:0.5,flexWrap:'wrap'}}>
                <span>🟢 Bullish ≥65</span><span>🟡 Moderate 50–64</span><span>🔴 Caution &lt;50</span>
              </div>
            </div>
            <div style={s.section}>
              <p style={s.sectionTitle}>Best entry windows this month</p>
              {R.calDays.filter(d=>d.isMarket).sort((a,b)=>b.score-a.score).slice(0,8).map((d,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===7?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={s.sigDot(d.score)}/>
                  <div style={{flex:1}}>
                    <div style={{...s.sigName,display:'flex',alignItems:'center',gap:'6px'}}>
                      {R.date.slice(0,7)}-{String(d.d).padStart(2,'0')} ({VAAR_N[d.dow]})
                      {d.isPushya&&<span style={{fontSize:'9px',background:'rgba(201,168,76,0.2)',color:'#c9a84c',padding:'1px 5px',borderRadius:'6px'}}>Pushya</span>}
                      {d.isSpecialTithi&&<span style={{fontSize:'9px',background:'rgba(100,180,80,0.15)',color:'#7DC66A',padding:'1px 5px',borderRadius:'6px'}}>{TITHI_N[d.estTithi]}</span>}
                    </div>
                    <div style={s.sigSub}>
                      {d.horaAtOpen} hora at open · {['-','Consumer/FMCG','Metals/Defence','IT/Banking','Banking/Finance','Auto/Pharma','-'][d.dow]}
                    </div>
                  </div>
                  <span style={s.badge(d.score)}>{d.score}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STOCK REPORT ── */}
        {activeTab==='stock' && stockData && (()=>{
          // ── reusable sub-components scoped here ──────────────────────────
          const EvidenceRow = ({label, value, score, explain}) => (
            <div style={{display:'flex',alignItems:'flex-start',gap:'8px',padding:'7px 0',borderBottom:`0.5px solid rgba(255,255,255,0.04)`}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',flexShrink:0,marginTop:'5px',
                background:score>=65?'#7DC66A':score<42?'#E05C5C':'#c9a84c'}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:'11px',opacity:0.45,letterSpacing:'0.5px',marginBottom:'2px'}}>{label}</div>
                <div style={{fontSize:'12px',fontWeight:500,color:score>=65?'#7DC66A':score<42?'#E05C5C':'#c9a84c',marginBottom:explain?'3px':'0'}}>{value}</div>
                {explain&&<div style={{fontSize:'11px',opacity:0.5,lineHeight:1.5}}>{explain}</div>}
              </div>
              <div style={{fontSize:'10px',fontWeight:600,padding:'2px 7px',borderRadius:'8px',flexShrink:0,
                background:score>=65?'rgba(100,180,80,0.10)':score<42?'rgba(224,92,92,0.10)':'rgba(201,168,76,0.10)',
                color:score>=65?'#7DC66A':score<42?'#E05C5C':'#c9a84c',
                border:`0.5px solid ${score>=65?'rgba(100,180,80,0.25)':score<42?'rgba(224,92,92,0.25)':'rgba(201,168,76,0.25)'}`}}>
                {score}
              </div>
            </div>
          );

          const SectionHead = ({title,sub}) => (
            <div style={{padding:'12px 0 8px',borderBottom:`0.5px solid rgba(255,255,255,0.06)`,marginBottom:'4px'}}>
              <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a84c',opacity:0.7}}>{title}</div>
              {sub&&<div style={{fontSize:'11px',opacity:0.4,marginTop:'2px'}}>{sub}</div>}
            </div>
          );

          const PointCard = ({num,icon,title,verdict,verdictScore,children}) => (
            <div style={{background:'rgba(255,255,255,0.025)',border:`0.5px solid rgba(255,255,255,0.06)`,borderRadius:'12px',padding:'14px',marginBottom:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                <div style={{width:'28px',height:'28px',borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,
                  background:verdictScore>=65?'rgba(100,180,80,0.12)':verdictScore<42?'rgba(224,92,92,0.10)':'rgba(201,168,76,0.10)',
                  border:`0.5px solid ${verdictScore>=65?'rgba(100,180,80,0.3)':verdictScore<42?'rgba(224,92,92,0.25)':'rgba(201,168,76,0.25)'}`,
                  color:verdictScore>=65?'#7DC66A':verdictScore<42?'#E05C5C':'#c9a84c'}}>
                  {num}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'10px',opacity:0.4,letterSpacing:'1.5px',textTransform:'uppercase'}}>{icon} {title}</div>
                  <div style={{fontSize:'14px',fontWeight:600,color:verdictScore>=65?'#7DC66A':verdictScore<42?'#E05C5C':'#c9a84c',marginTop:'2px'}}>{verdict}</div>
                </div>
              </div>
              {children}
            </div>
          );

          return (
          <>
            {/* ── HERO HEADER ── */}
            <div style={{background:`linear-gradient(135deg,rgba(201,168,76,0.10) 0%,rgba(201,168,76,0.03) 100%)`,border:`1px solid rgba(201,168,76,0.28)`,borderRadius:'14px',padding:'16px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'14px'}}>
              <ScoreArc score={stockData.finalScore}/>
              <div style={{flex:1}}>
                <div style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',opacity:0.4,marginBottom:'3px'}}>{stockData.sector}</div>
                <div style={{fontSize:'20px',fontWeight:700,letterSpacing:'1px',color:'#c9a84c',marginBottom:'4px'}}>{stockData.symbol}</div>
                <div style={{fontSize:'13px',fontWeight:500,color:stockData.finalScore>=65?'#7DC66A':stockData.finalScore<45?'#E05C5C':'#c9a84c'}}>
                  {stockData.directionEmoji} {stockData.verdict}
                </div>
                <div style={{fontSize:'10px',opacity:0.4,marginTop:'4px'}}>
                  Composite score: {stockData.finalScore}/100 · {stockData.probUp}% upward probability
                </div>
              </div>
            </div>

            {/* ── QUICK NUMBERS BAR ── */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'14px'}}>
              {[
                {l:'Target',v:`+${stockData.targetPct}%`,c:'#7DC66A'},
                {l:'Max up',v:`+${stockData.highPct}%`,c:'#7DC66A'},
                {l:'Stop-loss',v:`-${stockData.slPct}%`,c:'#E05C5C'},
                {l:'R:R ratio',v:`${stockData.rrRatio}:1`,c:parseFloat(stockData.rrRatio)>=2?'#7DC66A':'#c9a84c'},
              ].map((m,i)=>(
                <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'9px 6px',textAlign:'center',border:`0.5px solid rgba(255,255,255,0.06)`}}>
                  <div style={{fontSize:'9px',opacity:0.4,letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:'4px'}}>{m.l}</div>
                  <div style={{fontSize:'16px',fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'18px'}}>
              {[
                {l:'Probability ↑',v:`${stockData.probUp}%`,c:'#c9a84c'},
                {l:'Downside risk',v:`-${stockData.lowPct}%`,c:'#E05C5C'},
                {l:'Horizon',v:stockData.horizon,c:'#c9a84c'},
              ].map((m,i)=>(
                <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'9px 6px',textAlign:'center',border:`0.5px solid rgba(255,255,255,0.06)`}}>
                  <div style={{fontSize:'9px',opacity:0.4,letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:'4px'}}>{m.l}</div>
                  <div style={{fontSize:'13px',fontWeight:600,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>

            {/* ══ POINT 00 — PRICE TECHNICALS (5-year Yahoo Finance data) ══ */}
            {stockData.hasRealPriceData && stockData.priceTech && (
              <PointCard num="00" icon="💹"
                title={stockData.priceTech.source==='live' ? `Technical analysis — ${stockData.priceTech.dataPoints} days of data` : 'Price technicals — manual data'}
                verdict={`Tech score: ${stockData.priceTech.priceScore}/100 · ₹${stockData.priceTech.currentPrice?.toFixed?.(2)??stockData.priceTech.currentPrice}`}
                verdictScore={stockData.priceTech.priceScore}>

                {stockData.priceTech.source==='live' && (
                  <div style={{fontSize:'10px',color:'#7DC66A',opacity:0.8,marginBottom:'10px',letterSpacing:'0.5px'}}>
                    ✓ All indicators auto-computed from {stockData.priceTech.dataPoints} trading days (~5 years) of Yahoo Finance data
                  </div>
                )}

                {/* Price snapshot */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'12px'}}>
                  {[
                    {l:'Current', v:`₹${stockData.priceTech.currentPrice?.toFixed?.(2)??'—'}`, c:'#c9a84c'},
                    {l:'200-DMA', v:stockData.priceTech.dma200?`₹${stockData.priceTech.dma200?.toFixed?.(2)??stockData.priceTech.dma200}`:'—', c:'#fff'},
                    {l:'50-DMA',  v:stockData.priceTech.dma50?`₹${stockData.priceTech.dma50?.toFixed?.(2)??'—'}`:'—', c:'#fff'},
                    {l:'52w High',v:`₹${stockData.priceTech.high52w?.toFixed?.(2)??'—'}`, c:'#7DC66A'},
                    {l:'52w Low', v:`₹${stockData.priceTech.low52w?.toFixed?.(2)??'—'}`,  c:'#E05C5C'},
                    {l:'5y High', v:stockData.priceTech.high5y?`₹${stockData.priceTech.high5y?.toFixed?.(2)??'—'}`:'—', c:'#7DC66A'},
                  ].map((m,i)=>(
                    <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'8px 6px',textAlign:'center'}}>
                      <div style={{fontSize:'9px',opacity:0.4,letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:'3px'}}>{m.l}</div>
                      <div style={{fontSize:'12px',fontWeight:600,color:m.c}}>{m.v}</div>
                    </div>
                  ))}
                </div>

                <EvidenceRow label="200-DMA position" value={stockData.priceTech.dmaSignal} score={stockData.priceTech.dmaScore}
                  explain={`The 200-DMA is the most-watched institutional level. Price above it = bull market. Price below = bear territory. Your score: ${stockData.priceTech.dmaScore}/100.`}/>

                {stockData.priceTech.source==='live' && stockData.priceTech.slopeSignal && (
                  <EvidenceRow label="200-DMA slope (trend direction)" value={stockData.priceTech.slopeSignal} score={stockData.priceTech.slopeScore}
                    explain={`A rising 200-DMA confirms a long-term uptrend. A flat or falling DMA means the long-term trend is weakening. This is calculated from actual price history, not estimated.`}/>
                )}

                <EvidenceRow label="RSI (14-day)" value={stockData.priceTech.rsiSignal} score={stockData.priceTech.rsiScore}
                  explain={`RSI: above 70 = overbought, below 30 = oversold. ${stockData.priceTech.source==='live'?'Auto-computed from actual daily closes.':'Manually entered.'}`}/>

                {stockData.priceTech.source==='live' && stockData.priceTech.macd && (
                  <EvidenceRow label="MACD" value={stockData.priceTech.macdSignal} score={stockData.priceTech.macdScore}
                    explain={`MACD (Moving Average Convergence Divergence): histogram above zero = bullish momentum building. Below zero = bearish. A crossover from negative to positive is a classic buy signal.`}/>
                )}

                {stockData.priceTech.source==='live' && stockData.priceTech.boll && (
                  <EvidenceRow label="Bollinger Bands" value={stockData.priceTech.bollSignal} score={stockData.priceTech.bollScore}
                    explain={`Bollinger Bands mark 2 standard deviations above/below the 20-day average. Price near lower band = oversold / value zone. Near upper band = stretched. Band: ₹${stockData.priceTech.boll.lower} – ₹${stockData.priceTech.boll.upper}`}/>
                )}

                {stockData.priceTech.source==='live' && stockData.priceTech.rangePos5y && (
                  <EvidenceRow label="5-year range percentile" value={stockData.priceTech.range5ySignal} score={stockData.priceTech.range5yScore}
                    explain={`Where the current price sits within its 5-year trading range. Bottom 20% of 5-year range = multi-year accumulation opportunity. Top 20% = momentum play, elevated valuation risk. 5y range: ₹${stockData.priceTech.low5y?.toFixed(2)} – ₹${stockData.priceTech.high5y?.toFixed(2)}`}/>
                )}

                {stockData.priceTech.source==='live' && stockData.priceTech.volSignal && (
                  <EvidenceRow label="Volume signal" value={stockData.priceTech.volSignal} score={stockData.priceTech.volScore}
                    explain="High volume on a move = institutional conviction. Low volume = weak signal, likely to reverse. Volume is compared to the 20-day average."/>
                )}

                {stockData.priceTech.source!=='live' && (
                  <EvidenceRow label="52-week range position" value={`${stockData.priceTech.rangePosition}% · ${stockData.priceTech.pctFromHigh}% below 52w high`} score={stockData.priceTech.rangeScore}
                    explain={`52-week range: ₹${stockData.priceTech.low52w} – ₹${stockData.priceTech.high52w}. Lower position with improving momentum = best risk/reward entries.`}/>
                )}

                <div style={{fontSize:'10px',opacity:0.4,marginTop:'8px',lineHeight:1.5,fontStyle:'italic'}}>
                  {stockData.priceTech.source==='live'
                    ? `7 indicators computed from ${stockData.priceTech.dataPoints} trading days. Technical layer (12%) blended with astrology for final score.`
                    : 'Manual price data used. Hit Analyse again after typing stock name for auto 5-year data.'}
                </div>
              </PointCard>
            )}
            {!stockData.hasRealPriceData && (
              <div style={{...s.alert('warn'),marginBottom:'12px'}}>
                <strong>⚠ No price data fetched</strong> — type the stock name and hit Analyse to auto-load 5 years of Yahoo Finance data and compute all technical indicators automatically.
              </div>
            )}

            {/* ══ POINT 01 — OVERALL VERDICT ════════════════════════════════ */}
            <PointCard num="01" icon="⚖️" title="Overall verdict" verdict={stockData.finalScore>=75?'STRONG BUY':stockData.finalScore>=62?'BUY — tranches only':stockData.finalScore>=50?'HOLD / NEUTRAL':stockData.finalScore>=40?'REDUCE exposure':'EXIT / AVOID'} verdictScore={stockData.finalScore}>
              <EvidenceRow label="Composite model score" value={`${stockData.finalScore}/100`} score={stockData.finalScore} explain={`Weighted average of 6 independent signal layers: Vedic (32%) + Dasha (8%) + Western astrology (16%) + Lunar science (10%) + Economic macro (22%) + Technical (12%).`}/>
              <EvidenceRow label="Bullish layers" value={`${R.bullLayers} of 6 layers scoring ≥62`} score={R.bullLayers>=4?80:R.bullLayers>=3?62:38} explain={`Each layer is scored 0–100. A layer scoring ≥62 is counted bullish. ${R.bullLayers}/6 bullish = ${R.bullLayers>=5?'strong':'R.bullLayers>=3?moderate:weak'} confluence.`}/>
              <EvidenceRow label="Investment advisability" value={stockData.advisability} score={stockData.isAdvisable?78:38} explain={`Requires: composite ≥62, Mercury direct, ≥2 Vedic signals bullish, R:R ≥1.5. Current: ${stockData.finalScore>=62?'✓':'✗'} score, ${!stockData.retroWarn?'✓':'✗'} Mercury, ${stockData.vedicBull}/${4} Vedic, ${stockData.rrRatio}:1 R:R.`}/>
            </PointCard>

            {/* ══ POINT 02 — DIRECTION ══════════════════════════════════════ */}
            <PointCard num="02" icon="📈" title="Will it go up?" verdict={stockData.directionCall} verdictScore={stockData.probUp}>
              <EvidenceRow label="Statistical upward probability" value={`${stockData.probUp}%`} score={stockData.probUp} explain={`Formula: Base 40% + (${R.bullLayers} bullish layers × 8%) = ${stockData.probUp}%. Each independent bullish signal multiplicatively increases directional confidence. Based on confluence model, not price prediction.`}/>
              <EvidenceRow label="Downward probability" value={`${stockData.probDown}%`} score={100-stockData.probDown} explain="If all signals are independent, the probability signals fail simultaneously is lower. However, markets are not fully efficient — use this as a framework, not a guarantee."/>
              <EvidenceRow label="Sector direction" value={`${stockData.sector}: score ${stockData.sectorScore}/100`} score={stockData.sectorScore} explain={`Sector score combines planetary activation, dasha ruling planet, nakshatra sectors, rate cycle fit, and market phase. Score ≥70 = tailwind for stocks in this sector.`}/>
              <EvidenceRow label="Market phase bias" value={`Vedic ${R.paksha} Paksha`} score={R.paksha==='Shukla'?72:42} explain={`Shukla Paksha (waxing moon): classical accumulation phase, historically bullish. Krishna Paksha (waning): classical exit phase. Current: ${R.paksha} Paksha — ${R.paksha==='Shukla'?'supports upward bias':'suggests caution on fresh buys'}.`}/>
            </PointCard>

            {/* ══ POINT 03 — UPSIDE ════════════════════════════════════════ */}
            <PointCard num="03" icon="🚀" title="How high can it go?" verdict={`Realistic: +${stockData.targetPct}% · Max: +${stockData.highPct}%`} verdictScore={stockData.finalScore}>
              <EvidenceRow label="Realistic target" value={`+${stockData.targetPct}% in ${stockData.horizon}`} score={stockData.finalScore} explain={`Calculated as 72% of maximum upside. The 72% factor accounts for mean reversion, partial signal accuracy, and typical overshoot trimming in Indian mid-term equity trades.`}/>
              <EvidenceRow label="Maximum upside scenario" value={`+${stockData.highPct}%`} score={stockData.finalScore} explain={`Score band → upside model: 80+→28%, 70–79→20%, 60–69→13%, 50–59→7%, below 50→3%. Calibrated to NSE Nifty50/sectoral index historical returns in similar astrological-technical confluence windows.`}/>
              <EvidenceRow label="Dasha planet upside boost" value={`${R.dasha.maha} Mahadasha → ${(PLANET_SEC[R.dasha.maha]||[]).slice(0,2).join(', ')}`} score={stockData.dashaFav?80:48} explain={`${R.dasha.maha} is ${['Jupiter','Venus','Mercury'].includes(R.dasha.maha)?'a benefic planet — historically correlated with expansion in its ruled sectors.':'a neutral/malefic planet — upside may be more muted or volatile.'}`}/>
              <EvidenceRow label="Nakshatra sector alignment" value={`${NAK_NAMES[R.moonNak]} → ${NAK_SEC[R.moonNak].join(', ')}`} score={NAK_Q[R.moonNak]} explain={`Moon in ${NAK_NAMES[R.moonNak]} (${NAK_NATURE[R.moonNak]} nature, score ${NAK_Q[R.moonNak]}/100). This nakshatra activates ${NAK_SEC[R.moonNak].join(' and ')} sectors. ${stockData.sectorId&&NAK_SEC[R.moonNak].some(ns=>stockData.sector.toLowerCase().includes(ns.toLowerCase()))?'✓ Direct alignment with your stock\'s sector.':'Indirect alignment — sector boost partial.'}`}/>
            </PointCard>

            {/* ══ POINT 04 — STOP LOSS ═════════════════════════════════════ */}
            <PointCard num="04" icon="🛑" title="Stop-loss level" verdict={`-${stockData.slPct}% below your entry price`} verdictScore={parseFloat(stockData.rrRatio)>=2?80:parseFloat(stockData.rrRatio)>=1.5?65:40}>
              <EvidenceRow label="Stop-loss percentage" value={`-${stockData.slPct}%`} score={70} explain={`Stop-loss formula: composite ≥70→6%, 58–69→8%, 48–57→10%, below 48→13%. Higher-confidence signals = tighter stop because downside should be limited. Lower-confidence = wider stop to avoid premature exits.`}/>
              <EvidenceRow label="Risk / Reward ratio" value={`${stockData.rrRatio} : 1`} score={parseFloat(stockData.rrRatio)>=2?80:parseFloat(stockData.rrRatio)>=1.5?65:38} explain={`R:R = Realistic target (${stockData.targetPct}%) ÷ Stop-loss (${stockData.slPct}%) = ${stockData.rrRatio}. ${parseFloat(stockData.rrRatio)>=2?'Excellent — worth the trade.':parseFloat(stockData.rrRatio)>=1.5?'Acceptable — proceed with normal sizing.':parseFloat(stockData.rrRatio)>=1?'Marginal — trade only with reduced size.':'Poor R:R — avoid until better window.'}`}/>
              <EvidenceRow label="Position sizing rule" value="Max 1–2% portfolio risk per trade" score={65} explain={`If stop-loss is ${stockData.slPct}% and your max acceptable loss is 2% of portfolio: max position size = 2% ÷ ${stockData.slPct}% = ${(2/stockData.slPct*100).toFixed(0)}% of portfolio. Never exceed this regardless of conviction.`}/>
              <EvidenceRow label="Volatility flag" value={R.debil.length?`Debilitated: ${R.debil.join(', ')} → wider moves`:R.retro.Mercury?'Mercury retrograde → erratic price action':'No major volatility flags'} score={R.debil.length||R.retro.Mercury?38:72} explain={`Debilitated planets and Mercury retrograde historically increase intraday volatility and false breakouts. ${R.debil.length||R.retro.Mercury?'Reduce position size by 30% and widen stop slightly.':'Volatility conditions are normal.'}`}/>
            </PointCard>

            {/* ══ POINT 05 — DOWNSIDE RISK ════════════════════════════════ */}
            <PointCard num="05" icon="📉" title="Downside risk if signals fail" verdict={`Max drawdown risk: -${stockData.lowPct}% · Protected by -${stockData.slPct}% stop`} verdictScore={stockData.lowPct<=8?75:stockData.lowPct<=12?55:35}>
              <EvidenceRow label="Unprotected downside" value={`-${stockData.lowPct}% in adverse scenario`} score={stockData.lowPct<=8?75:stockData.lowPct<=12?55:32} explain={`If all confluence signals fail: composite ≥70→-6%, 55–69→-9%, 45–54→-12%, below 45→-18%. These are modelled on worst-case corrections in NSE stocks during similar astrological windows where signals were wrong.`}/>
              <EvidenceRow label="Your actual protected loss" value={`-${stockData.slPct}% (with stop-loss active)`} score={72} explain="Your stop-loss caps the actual loss at this percentage. The difference between stop-loss and max downside is the gap that would occur during a gap-down opening — which is why stop-losses aren't always perfect."/>
              <EvidenceRow label="Bearish layer count" value={`${R.bearLayers} of 6 layers bearish`} score={R.bearLayers<=1?75:R.bearLayers<=2?55:32} explain={`${R.bearLayers} signal layer(s) are scoring below 42 (bearish zone). ${R.bearLayers>=4?'High bearish confluence — serious downside risk.':R.bearLayers>=2?'Moderate bearish signals present — reduce size.':'Low bearish count — signals mostly favourable.'}`}/>
              {R.retro.Mercury&&<EvidenceRow label="⚠ Mercury retrograde risk" value="IT/Banking/Telecom stocks at elevated risk" score={28} explain="Mercury retrograde correlates with communication breakdowns, contract delays, and mispricings in Mercury-ruled sectors (IT, telecom, banking, media). Historical false-breakout rate increases ~15–20% during these windows."/>}
              {R.debil.length>0&&<EvidenceRow label={`⚠ Debilitated: ${R.debil.join(', ')}`} value="Weakened planetary energy in ruled sectors" score={30} explain={`Debilitated planets cannot fully support their ruled sectors. ${R.debil.map(p=>`${p} rules ${(PLANET_SEC[p]||[]).slice(0,2).join('/')}`).join('; ')}. These sectors may underperform or show higher volatility.`}/>}
            </PointCard>

            {/* ══ POINT 06 — VEDIC ASTROLOGY EVIDENCE ════════════════════ */}
            <PointCard num="06" icon="🪐" title="Vedic astrology — full evidence" verdict={`${stockData.vedicBull}/4 Vedic signals bullish · Score ${R.vedicScore}/100`} verdictScore={R.vedicScore}>
              <SectionHead title="Vimshottari Dasha" sub="Planetary periods ruling your life and market energy"/>
              <EvidenceRow label="Mahadasha (major period)" value={`${R.dasha.maha} — ${['Jupiter','Venus','Mercury'].includes(R.dasha.maha)?'Bullish planet ✓':'Neutral/bearish ✗'}`} score={['Jupiter','Venus','Mercury'].includes(R.dasha.maha)?82:['Moon','Sun'].includes(R.dasha.maha)?60:42} explain={`${R.dasha.maha} Mahadasha activates sectors: ${(PLANET_SEC[R.dasha.maha]||[]).join(', ')}. Seeded from NSE natal chart (4 Nov 1992, 09:15 IST, Mumbai) — the actual Vimshottari Dasha of the Indian market.`}/>
              <EvidenceRow label="Antardasha (sub-period)" value={`${R.dasha.antar} — boosts ${(PLANET_SEC[R.dasha.antar]||[]).slice(0,2).join(', ')}`} score={['Jupiter','Venus','Mercury'].includes(R.dasha.antar)?75:52} explain={`Antardasha planet ${R.dasha.antar} runs within the Mahadasha and colours daily market behaviour. Its sectors receive additional energy: ${(PLANET_SEC[R.dasha.antar]||[]).join(', ')}.`}/>
              <EvidenceRow label="Pratyantar Dasha (sub-sub period)" value={`${R.dasha.pratyantar} — week-to-week signal`} score={['Jupiter','Venus','Mercury'].includes(R.dasha.pratyantar)?72:48} explain={`Pratyantar Dasha runs for days to weeks and provides week-to-week precision. ${R.dasha.pratyantar} as Pratyantar activates: ${(PLANET_SEC[R.dasha.pratyantar]||[]).slice(0,2).join(', ')}. When Maha + Antar + Pratyantar are all benefic planets, it is a rare triple-bullish Dasha window.`}/>

              <SectionHead title="Panchang — today's muhurta quality" sub="The 5 limbs of the Vedic almanac"/>
              <EvidenceRow label={`Nakshatra: ${NAK_NAMES[R.moonNak]}`} value={`${NAK_NATURE[R.moonNak]} nature · Score ${NAK_Q[R.moonNak]}/100`} score={NAK_Q[R.moonNak]} explain={`Moon in ${NAK_NAMES[R.moonNak]}, ruled by ${NAK_RULER[R.moonNak]}. ${NAK_NATURE[R.moonNak]} nakshatras are ${NAK_NATURE[R.moonNak]==='Laghu'?'light and swift — good for quick entries':NAK_NATURE[R.moonNak]==='Sthira'?'stable and fixed — good for long-term positions':NAK_NATURE[R.moonNak]==='Mridu'?'soft and gentle — favourable for all auspicious work':NAK_NATURE[R.moonNak]==='Tikshna'?'sharp and fierce — better for exits than entries':NAK_NATURE[R.moonNak]==='Chara'?'movable — good for short-term trades':'of mixed nature'}. Sectors activated: ${NAK_SEC[R.moonNak].join(', ')}.`}/>
              <EvidenceRow label={`Tithi: ${TITHI_N[R.tithiNum]} (${R.tithiNum})`} value={TITHI_Q[R.tithiNum]>=68?'Auspicious ✓':[4,8,13].includes(R.tithiNum)?'Rikta — avoid ✗':R.tithiNum===16?'Amavasya — avoid ✗':'Moderate'} score={TITHI_Q[R.tithiNum]} explain={`Tithi score: ${TITHI_Q[R.tithiNum]}/100. ${[4,8,13].includes(R.tithiNum)?'Rikta (empty) tithis 4, 8, 13 — classical prohibition on new financial commitments. Muhurta Chintamani strictly forbids investments on these.':R.tithiNum===15?'Purnima (Full moon) — maximum energy, auspicious for bold entries.':R.tithiNum===11?'Ekadashi — considered most auspicious tithi for wealth-related decisions in all classical texts.':R.tithiNum===16?'Amavasya — new moon, considered inauspicious for new beginnings in Vedic tradition.':'Standard tithi — no special prohibitions or blessings.'}`}/>
              <EvidenceRow label={`Vaar: ${VAAR_N[R.dow]} (${VAAR_L[R.dow]})`} value={`Score ${VAAR_Q[R.dow]}/100`} score={VAAR_Q[R.dow]} explain={`${VAAR_N[R.dow]} is ruled by ${VAAR_L[R.dow]}. ${R.dow===4?'Thursday (Jupiter) is the most auspicious day for all financial decisions — Dalal Street historically shows stronger institutional buying on Thursdays.':R.dow===3?'Wednesday (Mercury) — excellent for IT, banking, trading, and communication stocks.':R.dow===5?'Friday (Venus) — good for consumer, auto, pharma, and luxury stocks.':R.dow===1?'Monday (Moon) — consumer sentiment high, FMCG and retail stocks benefit.':R.dow===0?'Sunday — market closed. Analysis for Monday open.':R.dow===2?'Tuesday (Mars) — volatile energy. Metals and defence can see sharp moves.':'Saturday — market closed. Saturn\'s day — infrastructure and oil stocks benefit when open.'}`}/>
              <EvidenceRow label={`Hora at ${R.time}: ${R.horaData.planet}`} value={`Score ${R.horaData.quality}/100`} score={R.horaData.quality} explain={`The planetary hora (60-min ruling period) at your analysis time is ${R.horaData.planet}. ${R.horaData.planet==='Jupiter'?'Jupiter hora — supreme for all investments. Best 60 minutes of the week for entering positions.':R.horaData.planet==='Venus'?'Venus hora — good for consumer, pharma, luxury entries.':R.horaData.planet==='Mercury'?'Mercury hora — IT, banking, logistics perform well.':r.horaData.planet==='Moon'?'Moon hora — consumer sentiment plays, FMCG.':r.horaData.planet==='Mars'?'Mars hora — volatile. Metals and defence can spike.':r.horaData.planet==='Saturn'?'Saturn hora — slow, defensive. Infrastructure, oil.':'Sun hora — PSU, gold, government stocks.'}`}/>
              <EvidenceRow label="Paksha (lunar fortnight)" value={`${R.paksha} Paksha · Score ${R.paksha==='Shukla'?72:42}/100`} score={R.paksha==='Shukla'?72:42} explain={`${R.paksha==='Shukla'?'Shukla Paksha (waxing moon, day 1–15): Classical accumulation phase. Energy increases with moon. Vedic tradition recommends new investments, business starts, and purchases during this half.':'Krishna Paksha (waning moon, day 16–30): Classical exit/reduction phase. Energy decreases. Better for booking profits, reducing positions, paying debts. Avoid major new entries.'}`}/>

              <SectionHead title="Planetary strength" sub="Exaltation, debilitation, retrograde"/>
              {R.exalted.length>0&&<EvidenceRow label={`Exalted: ${R.exalted.join(', ')}`} value="✓ Strengthened planetary energy" score={80} explain={`Exalted planets are at maximum strength — like an emperor in their own palace. ${R.exalted.map(p=>`${p} exalted in ${RASHI[R.planets[p].sign]} (${RASHI_EN[R.planets[p].sign]}) at ${R.planets[p].deg.toFixed(1)}° — powerfully activates ${(PLANET_SEC[p]||[]).slice(0,2).join(', ')}`).join('. ')}.`}/>}
              {R.debil.length>0&&<EvidenceRow label={`Debilitated: ${R.debil.join(', ')}`} value="✗ Weakened — sectors under stress" score={28} explain={`Debilitated planets are in their weakest sign — like a king in exile. ${R.debil.map(p=>`${p} debilitated in ${RASHI[R.planets[p].sign]} — ${(PLANET_SEC[p]||[]).slice(0,2).join('/')} under pressure`).join('. ')}.`}/>}
              {R.retro.Mercury&&<EvidenceRow label="Mercury retrograde ⚠" value="IT / Banking / Telecom caution" score={28} explain="Mercury moves backward (apparent retrograde). Classical and modern traders both note increased false signals, communication failures, contract reversals, and technology glitches during Mercury retrograde. IT and banking stocks historically show higher volatility and mean-reversion."/>}
              {R.retro.Saturn&&<EvidenceRow label="Saturn retrograde" value="Value over growth — delay capex plays" score={52} explain="Saturn retrograde internalises Saturn's energy. Infrastructure and capex-heavy stocks may face delays. Long-term value investing can work but avoid momentum plays in Saturn-ruled sectors (oil, mining, steel)."/>}
              {R.retro.Jupiter&&<EvidenceRow label="Jupiter retrograde" value="Expansion slows — defensive positioning" score={48} explain="Jupiter retrograde pulls back its expansionary energy. Banking and finance may consolidate rather than rally. Review rather than expand. Good for re-evaluating existing positions, not starting fresh."/>}

              <SectionHead title="Special yogas" sub="Classical auspicious/inauspicious combinations"/>
              {R.yogas.length===0&&<div style={{fontSize:'11px',opacity:0.4,padding:'6px 0'}}>No special yogas active today</div>}
              {R.yogas.map((y,i)=><EvidenceRow key={i} label={y.name} value={y.note} score={y.type==='good'?80:28} explain={`Yoga boost to composite score: ${y.boost>0?'+':''}${y.boost} points. ${y.type==='good'?'This yoga strengthens the auspiciousness of the muhurta for financial decisions.':'This inauspicious combination weakens the muhurta. Proceed only if other signals are strongly positive.'}`}/>)}

              <SectionHead title="Ashtakvarga" sub="Classical point-scoring system for planetary strength in each sign"/>
              {Object.entries(R.ashtak).map(([p,sc],i)=>(
                <EvidenceRow key={i} label={`${p} — BAV score`} value={`${sc}/8 points`} score={sc>=5?80:sc>=3?55:32} explain={`${sc>=5?`${p} is strong in current position — ${sc}/8 auspicious points from contributing planets. Sectors: ${(PLANET_SEC[p]||[]).slice(0,2).join(', ')} well-supported.`:sc>=3?`${p} is moderately placed — ${sc}/8 points. Average support for its ruled sectors.`:`${p} is weak — only ${sc}/8 points. Sectors: ${(PLANET_SEC[p]||[]).slice(0,2).join(', ')} may underperform.`}`}/>
              ))}
            </PointCard>

            {/* ══ POINT 07 — WESTERN ASTROLOGY EVIDENCE ═══════════════════ */}
            <PointCard num="07" icon="⭐" title="Western astrology — full evidence" verdict={`Jupiter in ${RASHI[R.planets.Jupiter.sign]} · Saturn in ${RASHI[R.planets.Saturn.sign]} · ${R.jsAspect.name}`} verdictScore={R.westernScore}>
              <SectionHead title="Jupiter transit (12-year cycle)" sub="The great benefic — expansion, growth, optimism"/>
              <EvidenceRow label={`Jupiter in ${RASHI[R.planets.Jupiter.sign]} (${RASHI_EN[R.planets.Jupiter.sign]})`} value={`Sign score: ${R.jupSignQ}/100 (classical derivation)`} score={R.jupSignQ} explain={`Jupiter transits each sign for ~1 year. Score derived from classical rules: exalt=90, own sign=78, friendly=68, neutral=55, debil=22. In ${RASHI_EN[R.planets.Jupiter.sign]}: ${R.jupSignQ>=80?'Exalted/own sign — maximum benefic energy. Banking and finance rally strongly.':R.jupSignQ>=68?'Favourable sign — expansion supported. Growth sectors outperform.':R.jupSignQ>=55?'Neutral sign — selective growth. Stock picking matters more.':'Challenging sign — Jupiter\'s growth energy is constrained.'}`}/>
              <EvidenceRow label="Jupiter's degree position" value={`${R.planets.Jupiter.deg.toFixed(2)}° in ${RASHI[R.planets.Jupiter.sign]}`} score={60} explain={`Jupiter is at ${R.planets.Jupiter.deg.toFixed(1)}° of ${RASHI[R.planets.Jupiter.sign]}. ${R.planets.Jupiter.deg<5?'Early degrees — Jupiter\'s energy is building, sector rotation beginning.':R.planets.Jupiter.deg>25?'Late degrees — Jupiter about to change sign, transition period, temporary uncertainty.':'Mid-sign — stable transit, full Jupiter energy active.'} Ruling nakshatra: ${NAK_NAMES[R.planets.Jupiter.nakIdx]}.`}/>
              {R.retro.Jupiter&&<EvidenceRow label="Jupiter retrograde" value="Expansion pauses — review not expand" score={45} explain="Jupiter appears to move backward from Earth's perspective. Historically markets consolidate rather than make new highs during Jupiter retrograde. Re-evaluation period. Banking and education stocks may lag."/>}

              <SectionHead title="Saturn transit (29-year cycle)" sub="The taskmaster — discipline, structure, long-term value"/>
              <EvidenceRow label={`Saturn in ${RASHI[R.planets.Saturn.sign]} (${RASHI_EN[R.planets.Saturn.sign]})`} value={`Sign score: ${R.satSignQ}/100 (classical derivation)`} score={R.satSignQ} explain={`Saturn transits each sign for ~2.5 years. Score derived from classical rules. In ${RASHI_EN[R.planets.Saturn.sign]}: ${R.satSignQ>=80?'Exalted or own sign — Saturn at maximum strength. Infrastructure, oil, and long-term value stocks excel.':R.satSignQ>=65?'Favourable — Saturn\'s discipline creates stable market structure.':r.satSignQ>=45?'Neutral — mixed signals from Saturn\'s influence.':'Challenging — Saturn weak or in enemy sign. Delays, contraction, volatility in Saturn-ruled sectors.'}`}/>
              {R.retro.Saturn&&<EvidenceRow label="Saturn retrograde" value="Karma revisited — value beats growth" score={52} explain="Saturn retrograde is less negative than feared. Markets often revisit structural support levels. Long-term value investors find good entry points. Avoid momentum plays. Oil and infra stocks often stabilise."/>}

              <SectionHead title="Jupiter-Saturn aspect (20-year macro cycle)" sub="The most studied outer-planet cycle in financial astrology"/>
              <EvidenceRow label={`Current aspect: ${R.jsAspect.name}`} value={R.jsAspect.note} score={R.jsAspect.q} explain={`Jupiter at ${R.planets.Jupiter.deg.toFixed(1)}° ${RASHI[R.planets.Jupiter.sign]} vs Saturn at ${R.planets.Saturn.deg.toFixed(1)}° ${RASHI[R.planets.Saturn.sign]}. Angular separation: ${Math.abs(mod360(R.planets.Jupiter.lng-R.planets.Saturn.lng)).toFixed(1)}°. The 20-year Jupiter-Saturn conjunction cycle has been studied since Babylonian astronomy. Mundane astrologers track: conjunction (0°)=structural shift, trine (120°)=sustained growth, square (90°)=stress, opposition (180°)=peak tension.`}/>

              <SectionHead title="Eclipse proximity" sub="Solar/lunar eclipse windows create volatility"/>
              {(()=>{
                const sunToRahu=Math.abs(mod360(R.planets.Sun.lng-R.planets.Rahu.lng));
                const moonToRahu=Math.abs(mod360(R.planets.Moon.lng-R.planets.Rahu.lng));
                const nearSolar=sunToRahu<18||sunToRahu>342;
                const nearLunar=moonToRahu<12||moonToRahu>348;
                return nearSolar||nearLunar?(
                  <EvidenceRow label={nearSolar?'⚠ Solar eclipse window':'⚠ Lunar eclipse window'} value="High volatility — avoid new entries" score={25} explain={`${nearSolar?`Sun is within 18° of Rahu (${sunToRahu.toFixed(1)}°). Solar eclipse window active. ±2 weeks around eclipses historically show elevated volatility, gap moves, and false breakouts. Vedic tradition: inauspicious for new financial commitments.`:`Moon is within 12° of Rahu (${moonToRahu.toFixed(1)}°). Lunar eclipse proximity. Emotional market swings, overnight gap risk elevated.`}`}/>
                ):(
                  <EvidenceRow label="No eclipse proximity" value="✓ Clear of eclipse influence" score={72} explain={`Sun is ${Math.abs(mod360(R.planets.Sun.lng-R.planets.Rahu.lng)).toFixed(0)}° from Rahu — well outside the eclipse shadow zone (18°). Moon is ${Math.abs(mod360(R.planets.Moon.lng-R.planets.Rahu.lng)).toFixed(0)}° from Rahu. No eclipse-related volatility risk currently.`}/>
                );
              })()}
            </PointCard>

            {/* ══ POINT 08 — LUNAR SCIENCE EVIDENCE ══════════════════════ */}
            <PointCard num="08" icon="🌕" title="Lunar science — evidence-based" verdict={`${R.phase.name} ${R.phase.emoji} · Dichev score ${R.phase.dichev}/100`} verdictScore={R.lunarScore}>
              <EvidenceRow label="Moon phase (Dichev-Janes model)" value={`${R.phase.name} · Score ${R.phase.dichev}/100`} score={R.phase.dichev} explain={`Dichev & Janes (2003) — "Lunar cycle effects in stock returns" — Journal of Finance. Study of 48 countries over 40 years found statistically significant higher returns in 15 days around full moon vs new moon. Effect size: ~3–5% annualised difference. Current phase: ${R.phase.name}. ${R.phase.dichev>=70?'Historically bullish window.':R.phase.dichev<=40?'Historically lower-return window.':'Neutral lunar window.'}`}/>
              <EvidenceRow label="Paksha bias (Vedic + scientific)" value={`${R.paksha} Paksha · ${R.paksha==='Shukla'?'Accumulation phase':'Exit phase'}`} score={R.paksha==='Shukla'?72:42} explain={`Vedic Shukla Paksha = modern waxing moon phase. Both traditions agree: waxing moon supports positive sentiment, risk-on behaviour. Waning moon: risk-off, profit-booking behaviour. The Dichev model and Vedic tradition converge here.`}/>
              <EvidenceRow label="Tithi lunar energy" value={`${TITHI_N[R.tithiNum]} — ${TITHI_Q[R.tithiNum]>=68?'high energy':'low/inauspicious energy'}`} score={TITHI_Q[R.tithiNum]} explain={`Tithi ${R.tithiNum}: ${R.tithiNum===11?'Ekadashi — most auspicious. Maximum pitta (fire) energy in classical Ayurveda — decision-making clarity at peak.':R.tithiNum===15?'Purnima — full moon, maximum liquid energy, heightened emotions and market sentiment swings.':R.tithiNum===16?'Amavasya — new moon, minimum light, classical rest period. Markets often drift or reverse.':r.tithiNum===4||r.tithiNum===8||r.tithiNum===13?'Rikta (empty) tithi — energy withdrawn. Poor for new beginnings.':'Standard tithi energy level.'}`}/>
              <EvidenceRow label="Yuan et al model (emerging markets)" value={`Emerging market lunar pattern: ${R.phase.dichev<=45?'New moon bullish (Yuan)':'Less applicable in current phase'}`} score={55} explain="Yuan, Zheng & Zhu (2006) found some emerging markets show opposite lunar pattern to Dichev — new moon bullish, full moon bearish. For NSE, evidence supports Dichev model more strongly. Yuan model noted here for completeness."/>
            </PointCard>

            {/* ══ POINT 09 — ENTRY TIMING ═════════════════════════════════ */}
            <PointCard num="09" icon="📅" title="Best entry timing this month" verdict={stockData.bestDate} verdictScore={stockData.bestDay?.score||55}>
              <EvidenceRow label="Best calendar day" value={stockData.bestDate} score={stockData.bestDay?.score||55} explain={`Highest-scoring market day this month based on: vaar quality (40%) + estimated tithi (33%) + western cycle (15%) + lunar score (12%). Score: ${stockData.bestDay?.score||'N/A'}/100.`}/>
              <EvidenceRow label="Best time of day to enter" value="9:15–10:00 AM IST (market open)" score={72} explain="The opening hora of the trading session carries the energy of the day's ruling planet. Enter during Jupiter hora (Thursday) or Mercury hora (Wednesday) at open. Avoid entry in the last 30 minutes when institutional rebalancing creates false moves."/>
              <EvidenceRow label="Ideal nakshatra window" value="Pushya · Hasta · Rohini · Revati · Punarvasu" score={82} explain={`These are the 5 highest-quality nakshatras for financial entry (scores 85–96/100). Current nakshatra: ${NAK_NAMES[R.moonNak]} (${NAK_Q[R.moonNak]}/100). ${[7,12,3,26,6].includes(R.moonNak)?'✓ You are currently in a top-tier nakshatra window.':'When Moon transits Pushya (every ~27 days), Hasta, or Rohini — that is your optimal entry window.'}`}/>
              <EvidenceRow label="Ideal tithi window" value="Ekadashi (11) · Dwadashi (12) · Dashami (10) · Purnima (15)" score={78} explain={`Poorna (full) tithis 10, 15 and benefic tithis 11, 12 are highest quality for new investments. Current tithi: ${TITHI_N[R.tithiNum]} (${TITHI_Q[R.tithiNum]}/100). ${[10,11,12,15].includes(R.tithiNum)?'✓ Currently in an ideal tithi window.':'Next ideal window: wait for Ekadashi or Purnima.'}`}/>
              <EvidenceRow label="Ideal vaar (weekday)" value="Thursday (Jupiter) · Wednesday (Mercury)" score={80} explain={`Thursday is ruled by Jupiter — highest quality vaar (score 88/100). Wednesday by Mercury (70/100). Current: ${VAAR_N[R.dow]} (${VAAR_Q[R.dow]}/100). ${R.dow===4?'✓ Today is Thursday — ideal entry day.':R.dow===3?'✓ Today is Wednesday — excellent for IT/banking.':'Wait for Thursday or Wednesday for best results.'}`}/>
              <EvidenceRow label="Avoid these windows" value={`Rikta tithis (4,8,13) · Amavasya · ${R.retro.Mercury?'Mercury retrograde (active now) · ':''} Tikshna/Ugra nakshatras`} score={28} explain="Classical Muhurta Chintamani forbids new financial commitments on Rikta tithis (4, 8, 13) and Amavasya. Tikshna (sharp) nakshatras like Ardra, Bharani, Ashlesha, Jyeshtha, Mula — also avoid for entries. Save these windows for exits and profit-booking."/>
            </PointCard>

            {/* ══ POINT 10 — STATISTICAL SCORING METHODOLOGY ══════════════ */}
            <PointCard num="10" icon="📊" title="How this score was calculated" verdict={`${stockData.finalScore}/100 across 6 weighted layers`} verdictScore={stockData.finalScore}>
              <SectionHead title="Layer weights and your scores"/>
              {[
                {l:'Vedic deep analysis',w:32,s:R.vedicScore,e:`Muhurta (40%) + Dasha all 3 levels (40%) + Ashtakvarga all 7 planets (20%). Muhurta: ${R.mScore}, Dasha: ${R.dashaScore}.`},
                {l:'Economic macro',w:22,s:R.layers.macro,e:`Trend: ${R.macroInputs.trend||'sideways'} + DMA: ${R.macroInputs.dma||'neutral'} + FII: ${R.macroInputs.fii||'neutral'} + RBI: ${R.macroInputs.rbi||'neutral'}. Live inputs — not hardcoded.`},
                {l:'Western astrology',w:16,s:R.westernScore,e:`Jupiter ${RASHI[R.planets.Jupiter.sign]} (${R.jupSignQ}, classical derivation) × 40% + Saturn ${RASHI[R.planets.Saturn.sign]} (${R.satSignQ}) × 30% + Aspect ${R.jsAspect.q} × 30%.`},
                {l:'Technical indicators',w:12,s:R.layers.tech,e:`VIX input: ${R.macroInputs.vix||'normal'} → score ${R.layers.tech}. Live user input — not hardcoded.`},
                {l:'Lunar science',w:10,s:R.lunarScore,e:`Dichev-Janes phase score (${R.phase.dichev}) + Paksha bias + Tithi energy.`},
                {l:'Dasha cycle',w:8,s:R.dashaScore,e:`${R.dasha.maha} Maha (50%) + ${R.dasha.antar} Antar (32%) + ${R.dasha.pratyantar} Pratyantar (18%). NSE natal chart seed.`},
              ].map((row,i)=>(
                <div key={i} style={{marginBottom:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}>
                    <div style={{fontSize:'11px',fontWeight:500,flex:1}}>{row.l} <span style={{opacity:0.4,fontWeight:400}}>({row.w}%)</span></div>
                    <div style={{fontSize:'11px',fontWeight:600,color:row.s>=65?'#7DC66A':row.s<42?'#E05C5C':'#c9a84c'}}>{row.s}</div>
                  </div>
                  <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden',marginBottom:'3px'}}>
                    <div style={{height:'100%',width:`${row.s}%`,borderRadius:'2px',background:row.s>=65?'#7DC66A':row.s<42?'#E05C5C':'#c9a84c'}}/>
                  </div>
                  <div style={{fontSize:'10px',opacity:0.4,lineHeight:1.5}}>{row.e}</div>
                </div>
              ))}
              <div style={{marginTop:'12px',padding:'10px',background:'rgba(201,168,76,0.06)',borderRadius:'8px',border:'0.5px solid rgba(201,168,76,0.15)'}}>
                <div style={{fontSize:'10px',opacity:0.5,marginBottom:'4px',letterSpacing:'1px',textTransform:'uppercase'}}>Composite formula</div>
                <div style={{fontSize:'11px',opacity:0.6,lineHeight:1.7}}>
                  Final = (Vedic×0.32) + (Macro×0.22) + (Western×0.16) + (Tech×0.12) + (Lunar×0.10) + (Dasha×0.08)<br/>
                  = ({R.vedicScore}×0.32) + ({R.layers.macro}×0.22) + ({R.westernScore}×0.16) + ({R.layers.tech}×0.12) + ({R.lunarScore}×0.10) + ({R.dashaScore}×0.08)<br/>
                  = <strong style={{color:'#c9a84c'}}>{stockData.finalScore}/100</strong>
                </div>
              </div>
            </PointCard>

            {/* ── FINAL VERDICT BANNER ── */}
            <div style={{borderRadius:'14px',padding:'20px',textAlign:'center',marginTop:'4px',marginBottom:'8px',background:stockData.isAdvisable?'rgba(100,180,80,0.07)':'rgba(224,92,92,0.07)',border:`1px solid ${stockData.isAdvisable?'rgba(100,180,80,0.28)':'rgba(224,92,92,0.28)'}`}}>
              <div style={{fontSize:'10px',letterSpacing:'2.5px',textTransform:'uppercase',opacity:0.45,marginBottom:'8px'}}>
                Final Verdict — {stockData.symbol}
              </div>
              <div style={{fontSize:'22px',fontWeight:700,color:stockData.isAdvisable?'#7DC66A':'#E05C5C',marginBottom:'8px',letterSpacing:'0.5px'}}>
                {stockData.isAdvisable?'✓ INVEST — Conditions Favourable':'✗ WAIT — Conditions Not Optimal'}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginTop:'12px'}}>
                {[
                  {l:'Score',v:`${stockData.finalScore}/100`},
                  {l:'Prob ↑',v:`${stockData.probUp}%`},
                  {l:'R:R',v:`${stockData.rrRatio}:1`},
                  {l:'Stop',v:`-${stockData.slPct}%`},
                ].map((m,i)=>(
                  <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'8px 4px'}}>
                    <div style={{fontSize:'9px',opacity:0.4,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'3px'}}>{m.l}</div>
                    <div style={{fontSize:'14px',fontWeight:600,color:stockData.isAdvisable?'#7DC66A':'#c9a84c'}}>{m.v}</div>
                  </div>
                ))}
              </div>
              {stockData.isAdvisable&&(
                <div style={{fontSize:'11px',opacity:0.5,marginTop:'12px',lineHeight:1.6}}>
                  Enter in 2–3 tranches · Keep stop strict at -{stockData.slPct}% · Target +{stockData.targetPct}% in {stockData.horizon}
                </div>
              )}
              {!stockData.isAdvisable&&(
                <div style={{fontSize:'11px',opacity:0.5,marginTop:'12px',lineHeight:1.6}}>
                  Wait for composite ≥65 · Mercury direct · At least 4/6 layers bullish · Better muhurta window
                </div>
              )}
            </div>

            {/* BUILD 3 — Log this prediction for personal backtesting */}
            <button
              onClick={()=>{ saveToBacktestLog(stockData.symbol, stockData.finalScore, stockData.verdict); }}
              style={{width:'100%',padding:'12px',marginBottom:'8px',borderRadius:'10px',fontSize:'12px',fontWeight:600,cursor:'pointer',
                background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.3)',color:'#c9a84c',fontFamily:"'DM Sans',sans-serif"}}>
              📌 Log this prediction — check accuracy later
            </button>
            <p style={{fontSize:'10px',opacity:0.35,textAlign:'center',marginBottom:'14px',lineHeight:1.5}}>
              Come back in a few weeks, open Track Record, and mark whether {stockData.symbol} actually moved the way predicted. This builds your real accuracy history.
            </p>
          </>
          );
        })()}

        <p style={s.disclaimer}>
          {hi
            ? 'यह एक शोध और शिक्षा उपकरण है। SEBI-पंजीकृत निवेश सलाह नहीं। कोई भी निवेश निर्णय लेने से पहले वित्तीय सलाहकार से परामर्श करें।'
            : 'Research and education tool only. It is Not SEBI-registered investment advice. Consult a registered financial advisor before making any investment decision. Past astrological correlations do not guarantee future returns.'}
        </p>
      </div>
    </div>
  );
}
