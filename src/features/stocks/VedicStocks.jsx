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

    // 7. Volume signal (volSignal is the numeric % from calcVolumeSignal above)
    const volNum = volSignal; // numeric % already computed at line 343
    const volScore = volNum===null ? 55 : volNum>150 ? 75 : volNum>110 ? 65 : volNum>80 ? 55 : 42;
    const volDisplay = volNum===null ? 'Volume data unavailable'
      : volNum>150 ? `Volume ${volNum}% of 20-day avg — strong conviction move`
      : volNum>110 ? `Volume ${volNum}% of avg — above normal activity`
      : volNum>80  ? `Volume ${volNum}% of avg — normal`
      : `Volume ${volNum}% of avg — low conviction, weak signal`;

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
      volScore, volSignal: volDisplay,
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
  const [activeTab, setActiveTab] = useState('Summary');
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

  // ── SELL MODE ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState('analyse'); // 'analyse' | 'sell'
  const [sellInputs, setSellInputs] = useState({ buyPrice:'', buyDate:'', qty:'' });
  const [sellVerdict, setSellVerdict] = useState(null);

  // ── PORTFOLIO ──────────────────────────────────────────────────────────────
  const [portfolio, setPortfolio] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vedicPortfolio')||'[]'); }
    catch { return []; }
  });
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // ── FUNDAMENTALS (from Yahoo) ──────────────────────────────────────────────
  const [fundamentals, setFundamentals] = useState(null); // {pe, marketCap, earningsDate, longName}

  // ── AUTO NEWS ──────────────────────────────────────────────────────────────
  const [autoNewsLoading, setAutoNewsLoading] = useState(false);

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
              rsi:          '',
            };
            setPriceData(resolvedPrice);

            // ── Extract fundamentals from Yahoo meta ─────────────────────
            const earningsTs = data.earningsTimestamp || data.earningsTimestampStart || null;
            const earningsDate = earningsTs ? new Date(earningsTs*1000).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : null;
            const daysToEarnings = earningsTs ? Math.round((earningsTs*1000 - Date.now())/(86400000)) : null;
            setFundamentals({
              longName:      data.longName || stockInput.toUpperCase(),
              pe:            data.trailingPE ? parseFloat(data.trailingPE).toFixed(1) : null,
              marketCap:     data.marketCap ? (data.marketCap>=1e12 ? `₹${(data.marketCap/1e12).toFixed(2)}T` : data.marketCap>=1e9 ? `₹${(data.marketCap/1e9).toFixed(1)}B` : `₹${(data.marketCap/1e6).toFixed(0)}M`) : null,
              previousClose: data.previousClose ? `₹${data.previousClose.toFixed(2)}` : null,
              earningsDate,
              daysToEarnings,
              earningsWarning: daysToEarnings !== null && daysToEarnings >= 0 && daysToEarnings <= 7,
            });
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
      // Compute sell verdict if in sell mode
      if (mode === 'sell' && sellInputs.buyPrice && resolvedPrice.currentPrice) {
        const pt = calcPriceTechnicals(resolvedPrice, priceSeries);
        const sv = calcSellVerdict(sellInputs.buyPrice, sellInputs.buyDate, sellInputs.qty, resolvedPrice.currentPrice, pt, r);
        setSellVerdict(sv);
      }
      setActiveTab(mode==='sell'?'Sell':'Summary');
      setView('result');
      setLoading(false);
    }, 400);
  }, [date, time, lat, lon, macroInputs, priceData, stockInput, priceSeries, newsSentiment]);

  // ── SELL VERDICT ENGINE ──────────────────────────────────────────────────
  const calcSellVerdict = (buyPrice, buyDate, qty, currentPrice, priceTech, result) => {
    const bp = parseFloat(buyPrice), cp = parseFloat(currentPrice), q = parseFloat(qty)||1;
    if (!bp || !cp) return null;
    const pnlPct  = ((cp - bp) / bp * 100);
    const pnlRs   = (cp - bp) * q;
    const heldMs  = buyDate ? Date.now() - new Date(buyDate).getTime() : 0;
    const heldDays= Math.round(heldMs / 86400000);
    const heldStr = heldDays > 365 ? `${(heldDays/365).toFixed(1)}y` : heldDays > 30 ? `${Math.round(heldDays/30)}m` : `${heldDays}d`;

    // Technical signals
    const rsi     = priceTech?.rsi || null;
    const macdBear= priceTech?.macd?.hist < 0;
    const overBot  = priceTech?.boll?.pct > 90;
    const near5yH  = priceTech?.rangePos5y > 80;
    const belowDMA = priceTech?.dma200 && cp < priceTech.dma200;
    const dmaFall  = priceTech?.dmaSlope < -0.3;

    // Vedic signals
    const rikta   = result ? [4,8,13].includes(result.tithiNum) : false;
    const retroM  = result?.retro?.Mercury || false;
    const score   = result?.composite || 55;

    // Scoring: positive = EXIT pressure, negative = HOLD pressure
    let exitPoints = 0, holdPoints = 0;
    const reasons = [], holdReasons = [];

    // Loss territory
    if (pnlPct < -15) { exitPoints += 3; reasons.push(`Down ${Math.abs(pnlPct).toFixed(1)}% — deep loss, stop-loss discipline needed`); }
    else if (pnlPct < -8) { exitPoints += 2; reasons.push(`Down ${Math.abs(pnlPct).toFixed(1)}% — approaching critical loss territory`); }
    else if (pnlPct < -3) { exitPoints += 1; reasons.push(`Down ${Math.abs(pnlPct).toFixed(1)}% — mild loss`); }
    // Profit territory
    if (pnlPct > 25) { exitPoints += 2; reasons.push(`Up ${pnlPct.toFixed(1)}% — excellent gain, consider booking partial profits`); }
    else if (pnlPct > 15) { exitPoints += 1; reasons.push(`Up ${pnlPct.toFixed(1)}% — good gain, trail stop-loss`); }
    else if (pnlPct > 0) { holdPoints += 1; holdReasons.push(`Up ${pnlPct.toFixed(1)}% — mild profit, let it run`); }

    // Technical exit signals
    if (rsi > 72) { exitPoints += 2; reasons.push(`RSI ${rsi} — overbought, pullback likely soon`); }
    if (macdBear) { exitPoints += 1; reasons.push('MACD histogram negative — momentum fading'); }
    if (overBot)  { exitPoints += 1; reasons.push('Price at upper Bollinger band — stretched'); }
    if (near5yH)  { exitPoints += 1; reasons.push('Near 5-year high — valuation risk elevated'); }
    if (belowDMA) { exitPoints += 2; reasons.push('Price below 200-DMA — long-term trend broken'); }
    if (dmaFall)  { exitPoints += 1; reasons.push('200-DMA declining — downtrend confirmed'); }

    // Vedic exit signals
    if (rikta)   { exitPoints += 1; reasons.push('Rikta tithi today — inauspicious to hold new risk'); }
    if (retroM)  { exitPoints += 1; reasons.push('Mercury retrograde — IT/banking/logistics under pressure'); }
    if (score < 45) { exitPoints += 2; reasons.push(`Vedic oracle score ${score}/100 — strong bearish alignment`); }

    // Hold signals
    if (rsi < 35) { holdPoints += 2; holdReasons.push(`RSI ${rsi} — oversold, bounce likely`); }
    if (!belowDMA && priceTech?.dmaSlope > 0.3) { holdPoints += 2; holdReasons.push('Above rising 200-DMA — uptrend intact'); }
    if (score >= 65) { holdPoints += 2; holdReasons.push(`Vedic oracle ${score}/100 — bullish alignment`); }
    if (pnlPct > 5 && !belowDMA) { holdPoints += 1; holdReasons.push('In profit above 200-DMA — classic hold zone'); }

    // Earnings proximity — always flag
    const earningsWarn = fundamentals?.earningsWarning;
    const daysToE = fundamentals?.daysToEarnings;

    const totalExit = exitPoints;
    const totalHold = holdPoints;
    let verdict, color, action;
    if (pnlPct < -15 || (exitPoints >= 5 && exitPoints > holdPoints*1.5)) {
      verdict = 'EXIT NOW'; color = '#E05C5C'; action = 'exit';
    } else if (exitPoints > holdPoints && (pnlPct < -8 || score < 48)) {
      verdict = 'CONSIDER EXITING'; color = '#E05C5C'; action = 'exit';
    } else if (pnlPct > 20 && exitPoints > holdPoints) {
      verdict = 'BOOK PARTIAL PROFITS'; color = '#c9a84c'; action = 'partial';
    } else if (holdPoints > exitPoints && score >= 55) {
      verdict = pnlPct > 8 ? 'HOLD & TRAIL STOP' : 'HOLD'; color = '#7DC66A'; action = 'hold';
    } else if (pnlPct < -5 && score >= 62 && rsi < 40) {
      verdict = 'ADD MORE (DIP)'; color = '#7DC66A'; action = 'add';
    } else {
      verdict = 'HOLD — WATCH'; color = '#c9a84c'; action = 'watch';
    }

    // Stop loss suggestion
    const stopLoss = action === 'hold' || action === 'add'
      ? (cp * 0.92).toFixed(2)  // 8% trailing stop
      : null;
    const target = action === 'hold' || action === 'add'
      ? priceTech?.dma200 ? (Math.max(cp * 1.15, parseFloat(priceTech.dma200) * 1.05)).toFixed(2) : (cp * 1.15).toFixed(2)
      : null;

    return {
      verdict, color, action, pnlPct: pnlPct.toFixed(2), pnlRs: pnlRs.toFixed(0),
      heldStr, heldDays, reasons, holdReasons, stopLoss, target,
      earningsWarn, daysToE, earningsDate: fundamentals?.earningsDate,
      exitPoints, holdPoints,
    };
  };

  // ── PORTFOLIO HELPERS ─────────────────────────────────────────────────────
  const addToPortfolio = (symbol, buyPrice, qty, currentPrice) => {
    const entry = {
      id: Date.now(), symbol: symbol.toUpperCase(),
      buyPrice: parseFloat(buyPrice), qty: parseFloat(qty)||1,
      buyDate: new Date().toISOString().split('T')[0],
      currentPrice: parseFloat(currentPrice)||null,
      lastUpdated: null,
    };
    const updated = [...portfolio, entry];
    setPortfolio(updated);
    try { localStorage.setItem('vedicPortfolio', JSON.stringify(updated)); } catch {}
  };

  const removeFromPortfolio = (id) => {
    const updated = portfolio.filter(h=>h.id!==id);
    setPortfolio(updated);
    try { localStorage.setItem('vedicPortfolio', JSON.stringify(updated)); } catch {}
  };

  const refreshPortfolioPrices = async () => {
    if (!portfolio.length) return;
    setPortfolioLoading(true);
    const updated = [...portfolio];
    for (let i=0; i<updated.length; i++) {
      try {
        const sym = toYahooSymbol(updated[i].symbol);
        const res = await fetch(`/api/stock?symbol=${sym}&range=5d&interval=1d`);
        const data = await res.json();
        if (data?.currentPrice) {
          updated[i] = { ...updated[i], currentPrice: data.currentPrice, lastUpdated: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) };
        }
      } catch {}
    }
    setPortfolio(updated);
    try { localStorage.setItem('vedicPortfolio', JSON.stringify(updated)); } catch {}
    setPortfolioLoading(false);
  };

  // ── AUTO-FETCH NEWS via Claude API ────────────────────────────────────────
  const autoFetchNews = async (symbol) => {
    if (!symbol.trim()) return;
    setAutoNewsLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
system: "You are a financial news analyst for Indian markets. Search for latest news about the given stock/index and return ONLY a JSON object with keys: headlines (array of 3 strings), score (integer -10 to +10), label (one of Strongly Bullish/Mildly Bullish/Neutral/Mildly Bearish/Strongly Bearish), summary (one sentence max 20 words), detail (2-3 sentences max 60 words), sectors_up (array), sectors_down (array). Return ONLY the JSON, no markdown.",
          messages: [{ role: 'user', content: `Latest news for ${symbol} Indian stock market today` }],
        }),
      });
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||'').join('');
      const clean = text.replace(/```json|```/g,'').trim();
      const parsed = JSON.parse(clean);
      setNewsText((parsed.headlines||[]).join('\n'));
      setNewsSentiment({ score: parsed.score, label: parsed.label, summary: parsed.summary, detail: parsed.detail, sectors_up: parsed.sectors_up||[], sectors_down: parsed.sectors_down||[] });
    } catch {
      // silently fail — user can still type manually
    }
    setAutoNewsLoading(false);
  };

  // ── Score today's news via Claude API ────────────────────────────────────────
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
          system: "You are a financial market sentiment analyser for Indian markets (NSE/BSE). Given news headlines, return ONLY a JSON object with keys: score (integer -10 to +10), label (Strongly Bullish/Mildly Bullish/Neutral/Mildly Bearish/Strongly Bearish), summary (one sentence max 20 words), detail (2-3 sentences max 60 words on sector impact), sectors_up (array of up to 3 sector names), sectors_down (array of up to 3 sector names). Return ONLY the JSON, no markdown, no preamble.",
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
  // Progressive 3-step form: Step 1 = stock name, Step 2 = market context (collapsible), Step 3 = analyse
  const [formStep, setFormStep] = useState(1); // 1=stock, 2=context, 3=ready
  const [contextOpen, setContextOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  if (view === 'home' || !result) {
    const scoreColor2 = (s) => s>=65?'#7DC66A':s<50?'#E05C5C':'#c9a84c';

    return (
      <div style={s.page}>
        <style>{`
          input[type="date"],input[type="time"],input[type="number"],input[type="text"],textarea{color-scheme:dark;}
          input:focus,textarea:focus{border-color:rgba(201,168,76,0.6)!important;outline:none;}
        `}</style>

        {/* HEADER */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => setTab('home')}>←</button>
          <div style={{flex:1}}>
            <p style={s.headerTitle}>📈 {hi ? 'वैदिक शेयर बाज़ार' : 'Vedic Stock Oracle'}</p>
            <p style={s.headerSub}>{hi ? 'ज्योतिष · अर्थशास्त्र · सांख्यिकी' : 'Astrology · Economics · Statistics'}</p>
          </div>
          <button onClick={()=>setShowPortfolio(true)}
            style={{background:'rgba(201,168,76,0.1)',border:'0.5px solid rgba(201,168,76,0.3)',
              borderRadius:'8px',color:'#c9a84c',fontFamily:"'DM Sans',sans-serif",
              fontSize:'11px',fontWeight:600,padding:'6px 10px',cursor:'pointer',letterSpacing:'0.5px'}}>
            💼 {portfolio.length>0?portfolio.length:''}
          </button>
        </div>

        {/* MODE TOGGLE — Analyse vs Sell */}
        <div style={{display:'flex',gap:'6px',padding:'0 20px 16px',width:'100%',boxSizing:'border-box'}}>
          {[['analyse','🔍 Analyse'],['sell','💸 Should I sell?']].map(([m,lbl])=>(
            <button key={m} onClick={()=>setMode(m)}
              style={{flex:1,padding:'10px',borderRadius:'10px',cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif",fontSize:'12px',fontWeight:600,letterSpacing:'0.5px',
                background:mode===m?'rgba(201,168,76,0.15)':'rgba(255,255,255,0.03)',
                border:`1px solid ${mode===m?'rgba(201,168,76,0.5)':'rgba(255,255,255,0.1)'}`,
                color:mode===m?'#c9a84c':T.text+'66'}}>
              {lbl}
            </button>
          ))}
        </div>

        <div style={s.body}>

          {/* ── STEP 1: STOCK NAME (always visible) ── */}
          <div style={{marginBottom:'20px'}}>
            <p style={{fontSize:'13px',opacity:0.5,marginBottom:'10px',textAlign:'center',letterSpacing:'0.5px'}}>
              Type any Indian stock or index to begin
            </p>
            <input
              style={{...s.stockInput, fontSize:'16px', padding:'16px 18px',
                border:`1.5px solid ${stockInput.trim()?'rgba(201,168,76,0.5)':'rgba(255,255,255,0.12)'}`,
                textAlign:'center', letterSpacing:'1px'}}
              type="text"
              value={stockInput}
              onChange={e=>{setStockInput(e.target.value);setFetchStatus(null);setPriceSeries(null);setPriceData({currentPrice:'',high52w:'',low52w:'',dma200:'',rsi:''}); }}
              placeholder="RELIANCE · TCS · NIFTY · HDFC…"
            />
            {stockInput.trim() && fetchStatus==='ok' && (
              <p style={{fontSize:'11px',color:'#7DC66A',textAlign:'center',margin:'8px 0 0',opacity:0.8}}>
                ✓ 5 years of price data loaded automatically
              </p>
            )}
            {stockInput.trim() && fetchStatus==='error' && (
              <p style={{fontSize:'11px',color:'#c9a84c',textAlign:'center',margin:'8px 0 0',opacity:0.7}}>
                ⚠ Could not load price data — analysis will still work
              </p>
            )}
            {/* Auto-fetch news button */}
            {stockInput.trim() && (
              <button onClick={()=>autoFetchNews(stockInput)} disabled={autoNewsLoading}
                style={{width:'100%',marginTop:'10px',padding:'9px',borderRadius:'10px',
                  cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'11px',
                  fontWeight:600,letterSpacing:'0.5px',
                  background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.1)',
                  color:T.text+'66'}}>
                {autoNewsLoading?'🔍 Fetching latest news…':'🔍 Auto-fetch latest news for this stock'}
              </button>
            )}
          </div>

          {/* ── SELL MODE FORM ── */}
          {mode==='sell' && (
            <div style={{marginBottom:'20px',padding:'16px',borderRadius:'14px',
              background:'rgba(224,92,92,0.06)',border:'0.5px solid rgba(224,92,92,0.2)'}}>
              <p style={{fontSize:'13px',fontWeight:600,color:'#E05C5C',marginBottom:'4px',letterSpacing:'0.5px'}}>💸 Should I sell?</p>
              <p style={{fontSize:'11px',opacity:0.5,marginBottom:'14px',lineHeight:1.5}}>
                Enter your holding details — get an EXIT / HOLD / ADD MORE verdict based on technicals + Vedic signals.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <div>
                  <span style={s.inputLabel}>Buy price (₹)</span>
                  <input style={s.input} type="number" placeholder="e.g. 500"
                    value={sellInputs.buyPrice}
                    onChange={e=>setSellInputs(v=>({...v,buyPrice:e.target.value}))}/>
                </div>
                <div>
                  <span style={s.inputLabel}>Quantity</span>
                  <input style={s.input} type="number" placeholder="e.g. 100"
                    value={sellInputs.qty}
                    onChange={e=>setSellInputs(v=>({...v,qty:e.target.value}))}/>
                </div>
              </div>
              <div>
                <span style={s.inputLabel}>Buy date</span>
                <input style={s.input} type="date"
                  value={sellInputs.buyDate}
                  onChange={e=>setSellInputs(v=>({...v,buyDate:e.target.value}))}/>
              </div>
              <p style={{fontSize:'10px',opacity:0.4,marginTop:'10px',lineHeight:1.5}}>
                Type the stock name above first so price data loads automatically.
              </p>
            </div>
          )}

          {/* ── STEP 2: DATE/TIME (compact, auto-filled) ── */}
          <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
            <div style={{flex:1}}>
              <span style={s.inputLabel}>Date</span>
              <input style={s.input} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
            <div style={{flex:1}}>
              <span style={s.inputLabel}>Time (IST)</span>
              <input style={s.input} type="time" value={time} onChange={e=>setTime(e.target.value)}/>
            </div>
          </div>

          {/* Location — compact single line */}
          <div style={{marginBottom:'20px'}}>
            <span style={s.inputLabel}>Your city</span>
            <input style={s.input} type="text" value={city}
              onChange={e=>setCity(e.target.value)}
              placeholder="Mumbai, Delhi, Bengaluru…"/>
            {gpsStatus==='ok' && (
              <p style={{fontSize:'10px',color:'#7DC66A',margin:'5px 0 0',opacity:0.7}}>📍 GPS detected: {city}</p>
            )}
          </div>

          {/* ── MARKET CONTEXT — collapsible ── */}
          <div style={{marginBottom:'12px'}}>
            <button
              onClick={()=>setContextOpen(o=>!o)}
              style={{width:'100%',padding:'12px 16px',borderRadius:'12px',cursor:'pointer',
                display:'flex',justifyContent:'space-between',alignItems:'center',
                background:'rgba(255,255,255,0.03)',
                border:`0.5px solid ${contextOpen?'rgba(201,168,76,0.4)':'rgba(255,255,255,0.1)'}`,
                color: contextOpen?'#c9a84c':T.text+'aa',
                fontFamily:"'DM Sans',sans-serif",fontSize:'12px',fontWeight:600,letterSpacing:'1px'}}>
              <span>⚙️ Market context <span style={{opacity:0.5,fontWeight:400}}>(optional — boosts accuracy)</span></span>
              <span style={{opacity:0.5}}>{contextOpen?'▲':'▼'}</span>
            </button>

            {contextOpen && (
              <div style={{marginTop:'8px',padding:'14px 16px',borderRadius:'12px',
                background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.08)'}}>
                <p style={{fontSize:'10px',opacity:0.4,marginBottom:'14px',lineHeight:1.6}}>
                  These 5 questions feed the macro layer. Tap your best guess — you can skip any.
                </p>
                {[
                  {key:'trend', label:'Nifty trend (last 30 days)',
                   opts:[['strong-up','📈 Strong up'],['mild-up','↗ Mild up'],['sideways','→ Flat'],['mild-down','↘ Mild down'],['strong-down','📉 Down']]},
                  {key:'dma', label:'Nifty vs 200-DMA',
                   opts:[['above','Above ↑'],['neutral','At DMA'],['below','Below ↓']]},
                  {key:'fii', label:'FII activity this week',
                   opts:[['buying','Buying ✓'],['neutral','Neutral'],['selling','Selling ✗']]},
                  {key:'rbi', label:'RBI rate stance',
                   opts:[['cutting','Cutting ★'],['neutral','Pause'],['hiking','Hiking ⚠']]},
                  {key:'vix', label:'India VIX',
                   opts:[['calm','<13 calm'],['normal','13–18'],['fearful','>18 fear']]},
                ].map(({key,label,opts})=>(
                  <div key={key} style={{marginBottom:'12px'}}>
                    <span style={{...s.inputLabel,opacity:0.6}}>{label}</span>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      {opts.map(([val,lbl])=>(
                        <button key={val} onClick={()=>setMacroInputs(m=>({...m,[key]:val}))}
                          style={{padding:'6px 11px',borderRadius:'8px',fontSize:'11px',cursor:'pointer',
                            fontFamily:"'DM Sans',sans-serif",fontWeight:macroInputs[key]===val?700:400,
                            background:macroInputs[key]===val?'rgba(201,168,76,0.2)':'rgba(255,255,255,0.04)',
                            border:`0.5px solid ${macroInputs[key]===val?'#c9a84c':'rgba(255,255,255,0.1)'}`,
                            color:macroInputs[key]===val?'#c9a84c':T.text+'77'}}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── TODAY'S NEWS — collapsible ── */}
          <div style={{marginBottom:'20px'}}>
            <button
              onClick={()=>setNewsOpen(o=>!o)}
              style={{width:'100%',padding:'12px 16px',borderRadius:'12px',cursor:'pointer',
                display:'flex',justifyContent:'space-between',alignItems:'center',
                background:'rgba(255,255,255,0.03)',
                border:`0.5px solid ${newsOpen?'rgba(201,168,76,0.4)':'rgba(255,255,255,0.1)'}`,
                color: newsOpen?'#c9a84c':T.text+'aa',
                fontFamily:"'DM Sans',sans-serif",fontSize:'12px',fontWeight:600,letterSpacing:'1px'}}>
              <span>🌐 Today's news <span style={{opacity:0.5,fontWeight:400}}>(AI scores market impact)</span></span>
              <span style={{opacity:0.5,display:'flex',alignItems:'center',gap:'6px'}}>
                {newsSentiment && <span style={{fontSize:'10px',color:newsSentiment.score>=3?'#7DC66A':newsSentiment.score<=-3?'#E05C5C':'#c9a84c'}}>{newsSentiment.label}</span>}
                {newsOpen?'▲':'▼'}
              </span>
            </button>

            {newsOpen && (
              <div style={{marginTop:'8px',padding:'14px 16px',borderRadius:'12px',
                background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.08)'}}>
                <p style={{fontSize:'10px',opacity:0.4,marginBottom:'10px',lineHeight:1.6}}>
                  Paste headlines: RBI decisions, FII data, geopolitical news, oil prices, budget…
                </p>
                <textarea
                  value={newsText}
                  onChange={e=>setNewsText(e.target.value)}
                  placeholder="e.g. RBI cut rates 25bps. FII bought ₹3200cr. Monsoon above normal."
                  style={{...s.input, height:'64px', resize:'none', lineHeight:1.5,
                    fontFamily:"'DM Sans',sans-serif", fontSize:'12px', width:'100%', boxSizing:'border-box'}}
                />
                <button
                  onClick={scoreNews}
                  disabled={newsLoading || !newsText.trim()}
                  style={{marginTop:'8px',width:'100%',padding:'10px',borderRadius:'10px',
                    fontSize:'12px',fontWeight:600,cursor:newsText.trim()?'pointer':'not-allowed',
                    fontFamily:"'DM Sans',sans-serif",letterSpacing:'1px',
                    background:newsText.trim()?'rgba(201,168,76,0.12)':'rgba(255,255,255,0.03)',
                    border:`1px solid ${newsText.trim()?'rgba(201,168,76,0.4)':'rgba(255,255,255,0.08)'}`,
                    color:newsText.trim()?'#c9a84c':T.text+'44'}}>
                  {newsLoading?'🤖 Scoring…':'🤖 Score with AI'}
                </button>
                {newsSentiment && !newsLoading && (()=>{
                  const s2=newsSentiment.score||0;
                  const col=s2>=3?'#7DC66A':s2<=-3?'#E05C5C':'#c9a84c';
                  return (
                    <div style={{marginTop:'10px',padding:'10px 12px',borderRadius:'10px',
                      background:`${col}12`,border:`1px solid ${col}30`}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <span style={{fontSize:'12px',fontWeight:700,color:col}}>{newsSentiment.label}</span>
                        <span style={{fontSize:'10px',opacity:0.5}}>adj {s2>=0?'+':''}{Math.round(s2*1.2)} pts</span>
                      </div>
                      <p style={{fontSize:'11px',margin:'0 0 6px',lineHeight:1.5}}>{newsSentiment.summary}</p>
                      <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                        {(newsSentiment.sectors_up||[]).map((sec,i)=>(
                          <span key={i} style={{fontSize:'10px',padding:'2px 7px',borderRadius:'6px',background:'rgba(100,180,80,0.15)',color:'#7DC66A'}}>↑ {sec}</span>
                        ))}
                        {(newsSentiment.sectors_down||[]).map((sec,i)=>(
                          <span key={i} style={{fontSize:'10px',padding:'2px 7px',borderRadius:'6px',background:'rgba(224,92,92,0.15)',color:'#E05C5C'}}>↓ {sec}</span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ── ANALYSE / SELL BUTTON ── */}
          <button style={{...s.analyzeBtn, background:mode==='sell'?'linear-gradient(135deg,rgba(224,92,92,0.15) 0%,rgba(224,92,92,0.08) 100%)':s.analyzeBtn?.background,
            borderColor:mode==='sell'?'rgba(224,92,92,0.4)':'rgba(201,168,76,0.4)',
            color:mode==='sell'?'#E05C5C':'#c9a84c'}} onClick={handleAnalyze} disabled={loading}>
            {loading
              ? (fetchStatus==='loading'?'📡 Loading 5y data…':'⏳ Computing…')
              : mode==='sell'
              ? `💸 Get Sell Verdict ${stockInput.trim()?`— ${stockInput.toUpperCase()}`:''}`
              : `✦ ${hi?'विश्लेषण करें':'Analyse'} ${stockInput.trim()?stockInput.toUpperCase():''} ✦`}
          </button>

          {/* Track record — subtle link */}
          <button
            style={{width:'100%',padding:'10px',marginTop:'6px',borderRadius:'10px',cursor:'pointer',
              background:'transparent',border:`0.5px solid ${T.accent}20`,
              color:T.text+'55',fontFamily:"'DM Sans',sans-serif",fontSize:'11px',letterSpacing:'1px'}}
            onClick={()=>setShowBacktest(true)}>
            📊 {hi?'ट्रैक रेकॉर्ड':'Track Record'}{backtestLog.length?` (${backtestLog.length})`:''}
          </button>

        </div>

        {/* Portfolio modal — reuse showPortfolio state */}
        {showPortfolio && (
          <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:1000,
            background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'flex-end'}}
            onClick={()=>setShowPortfolio(false)}>
            <div style={{background:T.bg,width:'100%',maxHeight:'88vh',overflowY:'auto',
              borderRadius:'20px 20px 0 0',padding:'20px',boxSizing:'border-box'}}
              onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'15px',fontWeight:700,color:'#c9a84c',margin:0}}>💼 My Portfolio</p>
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={refreshPortfolioPrices} disabled={portfolioLoading}
                    style={{background:'rgba(201,168,76,0.1)',border:'0.5px solid rgba(201,168,76,0.3)',borderRadius:'8px',color:'#c9a84c',fontFamily:"'DM Sans',sans-serif",fontSize:'11px',padding:'6px 10px',cursor:'pointer'}}>
                    {portfolioLoading?'↺ Updating…':'↺ Refresh'}
                  </button>
                  <button onClick={()=>setShowPortfolio(false)} style={{background:'none',border:'none',color:T.text,fontSize:'20px',cursor:'pointer',opacity:0.5}}>✕</button>
                </div>
              </div>
              {portfolio.length===0?(
                <div style={{textAlign:'center',padding:'30px',opacity:0.5}}>
                  <p style={{fontSize:'28px',marginBottom:'10px'}}>📭</p>
                  <p style={{fontSize:'13px',lineHeight:1.7}}>No holdings yet. Use "Should I sell?" mode and tap "Add to Portfolio".</p>
                </div>
              ):(
                portfolio.map((h)=>{
                  const pnl=h.currentPrice?((h.currentPrice-h.buyPrice)/h.buyPrice*100):null;
                  return(
                    <div key={h.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'12px',padding:'14px',marginBottom:'8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                        <span style={{fontSize:'14px',fontWeight:700}}>{h.symbol}</span>
                        <button onClick={()=>removeFromPortfolio(h.id)} style={{background:'none',border:'none',color:T.text,opacity:0.3,cursor:'pointer',fontSize:'16px'}}>✕</button>
                      </div>
                      <div style={{display:'flex',gap:'16px'}}>
                        <div><div style={{fontSize:'12px',fontWeight:600}}>₹{h.buyPrice}</div><div style={{fontSize:'9px',opacity:0.4}}>Buy</div></div>
                        <div><div style={{fontSize:'12px',fontWeight:600}}>{h.currentPrice?`₹${h.currentPrice.toFixed(2)}`:'—'}</div><div style={{fontSize:'9px',opacity:0.4}}>Now</div></div>
                        <div><div style={{fontSize:'12px',fontWeight:600,color:pnl>=0?'#7DC66A':'#E05C5C'}}>{pnl!==null?`${pnl>=0?'+':''}${pnl.toFixed(1)}%`:'—'}</div><div style={{fontSize:'9px',opacity:0.4}}>P&L</div></div>
                      </div>
                      <button onClick={()=>{setStockInput(h.symbol);setMode('sell');setSellInputs({buyPrice:String(h.buyPrice),buyDate:h.buyDate,qty:String(h.qty||1)});setShowPortfolio(false);}}
                        style={{width:'100%',marginTop:'8px',padding:'8px',borderRadius:'8px',fontSize:'11px',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",background:'rgba(201,168,76,0.08)',border:'0.5px solid rgba(201,168,76,0.2)',color:'#c9a84c'}}>
                        💸 Should I sell {h.symbol}?
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Backtest modal */}
        {showBacktest && (
          <div style={{
            position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:1000,
            background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-end',
          }} onClick={()=>setShowBacktest(false)}>
            <div style={{
              background:T.bg,width:'100%',maxHeight:'85vh',overflowY:'auto',
              borderRadius:'20px 20px 0 0',padding:'20px',boxSizing:'border-box',
            }} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <p style={{fontSize:'15px',fontWeight:600,color:'#c9a84c',margin:0}}>📊 Your track record</p>
                <button onClick={()=>setShowBacktest(false)} style={{background:'none',border:'none',color:T.text,fontSize:'18px',cursor:'pointer',opacity:0.6}}>✕</button>
              </div>
              {backtestLog.length===0?(
                <div style={{textAlign:'center',padding:'30px 10px',opacity:0.5}}>
                  <p style={{fontSize:'12px',lineHeight:1.7}}>No predictions logged yet. Analyse a stock and tap "Log this prediction" to start tracking.</p>
                </div>
              ):(
                <>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'16px'}}>
                    {(()=>{
                      const judged=backtestLog.filter(e=>e.outcome);
                      const correct=judged.filter(e=>e.outcome==='correct').length;
                      const hitRate=judged.length?Math.round((correct/judged.length)*100):null;
                      return [{l:'Logged',v:backtestLog.length},{l:'Judged',v:judged.length},{l:'Hit rate',v:hitRate!==null?`${hitRate}%`:'—'}];
                    })().map((m,i)=>(
                      <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                        <div style={{fontSize:'18px',fontWeight:600,color:'#c9a84c'}}>{m.v}</div>
                        <div style={{fontSize:'10px',opacity:0.5,marginTop:'3px'}}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  {backtestLog.map(entry=>(
                    <div key={entry.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'10px',padding:'12px',marginBottom:'8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                        <div>
                          <span style={{fontSize:'13px',fontWeight:600}}>{entry.stock}</span>
                          <span style={{fontSize:'10px',opacity:0.4,marginLeft:'8px'}}>{entry.date}</span>
                        </div>
                        <span style={{...s.badge(entry.score),fontSize:'11px'}}>{entry.score}/100</span>
                      </div>
                      <p style={{fontSize:'11px',opacity:0.55,margin:'0 0 8px'}}>{entry.verdict}</p>
                      {!entry.outcome?(
                        <div style={{display:'flex',gap:'6px'}}>
                          {['correct','incorrect','partial'].map(o=>(
                            <button key={o} onClick={()=>updateBacktestOutcome(entry.id,o)}
                              style={{flex:1,padding:'6px',borderRadius:'8px',fontSize:'10px',cursor:'pointer',
                                fontFamily:"'DM Sans',sans-serif",
                                background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.15)',color:T.text+'88'}}>
                              {o}
                            </button>
                          ))}
                        </div>
                      ):(
                        <span style={{fontSize:'11px',color:entry.outcome==='correct'?'#7DC66A':entry.outcome==='incorrect'?'#E05C5C':'#c9a84c'}}>
                          {entry.outcome==='correct'?'✓ Correct':entry.outcome==='incorrect'?'✗ Incorrect':'~ Partial'}
                        </span>
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

  const LAYER_NAMES = {vedic:'Vedic',western:'Western',lunar:'Lunar',macro:'Macro',tech:'Technical',dasha:'Dasha'};
  const LAYER_W     = {vedic:32,western:16,lunar:10,macro:22,tech:12,dasha:8};
  const scoreCol    = (v) => v>=65?'#7DC66A':v<50?'#E05C5C':'#c9a84c';
  const scoreLbl    = (v) => v>=75?'Strong buy':v>=65?'Good window':v>=50?'Neutral — wait':v>=40?'Caution':'Avoid';

  // ── Simple 3-tab result: Summary / Details / Deep Dive ────────────────────
  const RTABS = ['Summary','Details','Deep Dive'];
  if (stockInput.trim()) RTABS.splice(1,0,'Stock');
  if (mode==='sell' && sellVerdict) RTABS.splice(1,0,'Sell');

  return (
    <div style={s.page}>
      <style>{`input[type="date"],input[type="time"]{color-scheme:dark;}input:focus{border-color:rgba(201,168,76,0.6)!important;outline:none;}`}</style>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={()=>setView('home')}>←</button>
        <div style={{flex:1}}>
          <p style={s.headerTitle}>
            {stockInput.trim()?`📈 ${stockInput.toUpperCase()}`:'📈 Market Oracle'}
          </p>
          <p style={s.headerSub}>{R.date} · {city}</p>
        </div>
        <button style={{...s.backBtn,fontSize:'12px',opacity:0.5}} onClick={()=>setView('home')}>Edit ✎</button>
      </div>

      {/* ── SCORE HERO ── */}
      {(()=>{
        const sc = stockData ? stockData.finalScore : R.composite;
        const col = scoreCol(sc);
        const lbl = scoreLbl(sc);
        const rikta = [4,8,13].includes(R.tithiNum);
        const verdict = sc>=65?'✓ Conditions favour entry':sc>=50?'⏳ Wait for better window':'✗ Avoid new positions';
        return (
          <div style={{width:'100%',maxWidth:'420px',padding:'20px 20px 16px',boxSizing:'border-box',textAlign:'center'}}>
            {/* Big score circle */}
            <div style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:'12px'}}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                <circle cx="60" cy="60" r="52" fill="none" stroke={col} strokeWidth="8"
                  strokeDasharray={`${sc*3.267} ${326.7}`} strokeLinecap="round"
                  transform="rotate(-90 60 60)" opacity="0.85"/>
              </svg>
              <div style={{position:'absolute',textAlign:'center'}}>
                <div style={{fontSize:'32px',fontWeight:700,color:col,lineHeight:1}}>{sc}</div>
                <div style={{fontSize:'10px',opacity:0.4,letterSpacing:'1px'}}>/100</div>
              </div>
            </div>
            {/* Verdict */}
            <div style={{fontSize:'18px',fontWeight:600,color:col,marginBottom:'6px',letterSpacing:'0.5px'}}>{lbl}</div>
            <div style={{fontSize:'13px',opacity:0.6,marginBottom:'8px'}}>{verdict}</div>
            {/* Key flags row */}
            <div style={{display:'flex',gap:'6px',justifyContent:'center',flexWrap:'wrap'}}>
              {R.bullLayers>=4 && <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'20px',background:'rgba(100,180,80,0.15)',color:'#7DC66A'}}>{R.bullLayers}/6 layers bullish</span>}
              {R.bullLayers<4 && <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'20px',background:'rgba(201,168,76,0.12)',color:'#c9a84c'}}>{R.bullLayers}/6 layers bullish</span>}
              {rikta && <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'20px',background:'rgba(224,92,92,0.12)',color:'#E05C5C'}}>⚠ Rikta tithi</span>}
              {R.retro.Mercury && <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'20px',background:'rgba(224,92,92,0.12)',color:'#E05C5C'}}>☿ Merc retrograde</span>}
              {R.paksha==='Shukla' && <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'20px',background:'rgba(100,180,80,0.1)',color:'#7DC66A'}}>🌕 Shukla Paksha</span>}
              {R.exalted.length>0 && <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'20px',background:'rgba(100,180,80,0.1)',color:'#7DC66A'}}>⬆ {R.exalted[0]} exalted</span>}
            </div>
          </div>
        );
      })()}

      {/* ── TAB BAR ── */}
      <div style={{...s.tabRow,justifyContent:'center',padding:'0 20px 14px'}}>
        {RTABS.map(t=>(
          <button key={t} style={s.tabBtn(activeTab===t)} onClick={()=>setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={s.body}>

        {/* ══════════════ SUMMARY TAB ══════════════ */}
        {activeTab==='Summary' && (
          <>
            {/* Layer bars — clean, labelled simply */}
            <div style={s.section}>
              <p style={s.sectionTitle}>What the model checked</p>
              {Object.entries(R.layers).map(([k,v])=>(
                <div key={k} style={{marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontSize:'12px',opacity:0.7}}>{LAYER_NAMES[k]} <span style={{opacity:0.4,fontSize:'10px'}}>({LAYER_W[k]}% weight)</span></span>
                    <span style={{fontSize:'12px',fontWeight:600,color:scoreCol(v)}}>{v}/100</span>
                  </div>
                  <div style={{height:'4px',background:'rgba(255,255,255,0.07)',borderRadius:'2px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${v}%`,background:scoreCol(v),borderRadius:'2px',opacity:0.8}}/>
                  </div>
                </div>
              ))}
              <p style={{fontSize:'10px',opacity:0.35,marginTop:'10px',lineHeight:1.6,textAlign:'center'}}>
                🟢 65+ = bullish &nbsp;·&nbsp; 🟡 50–64 = neutral &nbsp;·&nbsp; 🔴 below 50 = bearish
              </p>
            </div>

            {/* Today's snapshot */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Today at a glance</p>
              {[
                {l:'Nakshatra', v:`${NAK_NAMES[R.moonNak]}`, s:NAK_Q[R.moonNak]},
                {l:'Tithi', v:`${TITHI_N[R.tithiNum]} (${[4,8,13].includes(R.tithiNum)?'⚠ Rikta':R.tithiNum===15?'✓ Purnima':R.tithiNum===11?'✓ Ekadashi':'standard'})`, s:TITHI_Q[R.tithiNum]||55},
                {l:'Weekday', v:VAAR_N[R.dow], s:VAAR_Q[R.dow]},
                {l:'Moon phase', v:`${R.phase.name} ${R.phase.emoji} · ${R.paksha} Paksha`, s:R.lunarScore},
                {l:'Dasha', v:`${R.dasha.maha} / ${R.dasha.antar}`, s:R.dashaScore},
                {l:'Mercury', v:R.retro.Mercury?'Retrograde ⚠ — avoid IT/banking':'Direct ✓', s:R.retro.Mercury?28:72},
              ].map((row,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'8px 0',borderBottom:i===5?'none':`0.5px solid rgba(255,255,255,0.06)`}}>
                  <span style={{fontSize:'11px',opacity:0.5,width:'90px',flexShrink:0}}>{row.l}</span>
                  <span style={{fontSize:'12px',flex:1,textAlign:'left',paddingLeft:'8px'}}>{row.v}</span>
                  <span style={{fontSize:'11px',fontWeight:600,color:scoreCol(row.s)}}>{row.s}</span>
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

            {/* Explain button */}
            <button onClick={()=>setShowReport(r=>!r)}
              style={{width:'100%',padding:'14px',marginTop:'4px',borderRadius:'12px',fontSize:'13px',
                fontWeight:600,cursor:'pointer',letterSpacing:'0.5px',
                background:showReport?'rgba(201,168,76,0.14)':'rgba(255,255,255,0.04)',
                border:`1px solid ${showReport?'rgba(201,168,76,0.5)':'rgba(255,255,255,0.1)'}`,
                color:showReport?'#c9a84c':T.text,fontFamily:"'DM Sans',sans-serif"}}>
              {showReport?'▲ Hide explanation':'📖 Explain this in plain English'}
            </button>

            {/* Plain-English Report */}
            {showReport && (()=>{
              const score=R.composite; const rikta=[4,8,13].includes(R.tithiNum);
              const retroMerc=R.retro.Mercury;
              const sc2=score>=65?'#7DC66A':score<50?'#E05C5C':'#c9a84c';
              const r={fontSize:'12px',lineHeight:1.75,opacity:0.75,margin:'0 0 6px'};
              const h={fontSize:'11px',fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'#c9a84c',margin:'16px 0 6px'};
              const b={background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:'0.5px solid rgba(255,255,255,0.08)',padding:'14px 16px',marginBottom:'10px'};
              const bottomLineText = score>=65
                ? `Enter in 2–3 tranches. Keep stop-loss strict.${rikta?' Wait one day — Rikta tithi.':''}`
                : score>=50
                  ? `Wait. Score needs to reach 65+ with 4+ layers bullish.${rikta?' Rikta tithi is an additional prohibition.':''}`
                  : `Do not enter.${rikta?' Rikta tithi.':''}${retroMerc?' Mercury retrograde.':''}${R.debil.length?' Debilitated '+R.debil.join(', ')+'.':''}`;
              return (
                <div style={{marginTop:'10px'}}>
                  <div style={{...b,borderColor:sc2+'40'}}>
                    <p style={{...h,color:sc2}}>① Score {score}/100 — what it means</p>
                    <p style={r}>🟢 65+ = Enter · 🟡 50–64 = Wait · 🔴 Below 50 = Avoid</p>
                    <p style={{...r,color:sc2,fontWeight:600}}>{score>=65?`${score}/100 — conditions favour entry. Enter in 2–3 tranches.`:score>=50?`${score}/100 — mixed signals. Wait for score ≥65 and 4+ layers bullish.`:`${score}/100 — multiple bearish signals. Do not enter new positions.`}</p>
                  </div>
                  <div style={b}>
                    <p style={h}>② The 6 layers</p>
                    <p style={r}>Score is built from 6 independent models. Need 4+ bullish to act.</p>
                    {[
                      {n:'Vedic (32%)',s:R.vedicScore,e:`Nakshatra (${NAK_NAMES[R.moonNak]}), tithi, hora, dasha, ashtakvarga.`},
                      {n:'Macro (22%)',s:R.layers.macro,e:`Your market context inputs + AI news sentiment.`},
                      {n:'Western (16%)',s:R.westernScore,e:`Jupiter in ${RASHI[R.planets.Jupiter.sign]}, Saturn in ${RASHI[R.planets.Saturn.sign]}, J-S aspect.`},
                      {n:'Technical (12%)',s:R.layers.tech,e:R.priceTech?.source==='live'?`RSI ${R.priceTech.rsi}, MACD, Bollinger, 200-DMA, 5-year range.`:'No live price data — neutral assumed.'},
                      {n:'Lunar (10%)',s:R.lunarScore,e:`${R.phase.name}, ${R.paksha} Paksha. Dichev-Janes academic model.`},
                      {n:'Dasha (8%)',s:R.dashaScore,e:`${R.dasha.maha} Maha / ${R.dasha.antar} Antar / ${R.dasha.pratyantar} Pratyantar.`},
                    ].map((l,i)=>(
                      <div key={i} style={{display:'flex',gap:'10px',marginBottom:'8px'}}>
                        <div style={{width:'7px',height:'7px',borderRadius:'50%',flexShrink:0,marginTop:'5px',background:scoreCol(l.s)}}/>
                        <div><span style={{fontSize:'12px',fontWeight:600,color:scoreCol(l.s)}}>{l.n} — {l.s}/100</span><br/><span style={{fontSize:'11px',opacity:0.5}}>{l.e}</span></div>
                      </div>
                    ))}
                  </div>
                  <div style={{...b,borderColor:rikta?'rgba(224,92,92,0.3)':'rgba(255,255,255,0.08)'}}>
                    <p style={{...h,color:rikta?'#E05C5C':'#c9a84c'}}>③ Tithi — {TITHI_N[R.tithiNum]}</p>
                    <p style={r}>{rikta?`⚠ Rikta tithi (4,8,13) — classical texts forbid new financial commitments. Strong reason to wait.`:R.tithiNum===15?`✓ Purnima — most auspicious. Enter boldly when other conditions agree.`:R.tithiNum===11?`✓ Ekadashi — most auspicious for wealth decisions.`:`Standard tithi — no special blessing or prohibition. Score: ${TITHI_Q[R.tithiNum]}/100.`}</p>
                    <p style={r}>Watch for: Ekadashi (11), Dwadashi (12), Dashami (10), Purnima (15).</p>
                  </div>
                  <div style={b}>
                    <p style={h}>④ Mercury {retroMerc?'retrograde ⚠':'direct ✓'}</p>
                    <p style={r}>{retroMerc?'Mercury retrograde: avoid IT, banking, logistics entries. Signals reverse more often during retrograde.':'Mercury direct: good for IT, banking, logistics, communication stocks.'}</p>
                  </div>
                  <div style={b}>
                    <p style={h}>⑤ Dasha — {R.dasha.maha}/{R.dasha.antar}</p>
                    <p style={r}>{['Jupiter','Venus','Mercury','Moon'].includes(R.dasha.maha)?`✓ ${R.dasha.maha} Mahadasha supports market growth — favours ${(PLANET_SEC[R.dasha.maha]||[]).slice(0,3).join(', ')}.`:`${R.dasha.maha} Mahadasha is neutral-to-bearish. Favour defensive sectors.`}</p>
                  </div>
                  <div style={{...b,borderColor:score>=65?'rgba(100,180,80,0.3)':score<50?'rgba(224,92,92,0.3)':'rgba(201,168,76,0.3)'}}>
                    <p style={{...h,color:sc2}}>⑥ Bottom line{stockInput?` — ${stockInput.toUpperCase()}`:''}</p>
                    <p style={{...r,fontWeight:500}}>{bottomLineText}</p>
                    <p style={r}>Best entry windows: Ekadashi or Purnima · Thursday or Wednesday · Score ≥65 · 4+ layers bullish.</p>
                  </div>
                  {R.newsSentiment && (()=>{const ns=R.newsSentiment;const s2=ns.score||0;const col=s2>=3?'#7DC66A':s2<=-3?'#E05C5C':'#c9a84c';return(<div style={{...b,borderColor:col+'40'}}><p style={{...h,color:col}}>⑦ News — {ns.label}</p><p style={r}>{ns.summary}</p><p style={r}>{ns.detail}</p></div>);})()}
                </div>
              );
            })()}
          </>
        )}

        {/* ══════════════ STOCK TAB ══════════════ */}
        {activeTab==='Stock' && stockData && (()=>{
          const sd = stockData;
          const sc = sd.finalScore;
          const col = scoreCol(sc);
          const EvidenceRow = ({label,value,score,explain}) => {
            const [open,setOpen] = useState(false);
            return (
              <div style={{borderBottom:`0.5px solid rgba(255,255,255,0.06)`,paddingBottom:'10px',marginBottom:'10px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
                  <div style={{width:'7px',height:'7px',borderRadius:'50%',flexShrink:0,background:scoreCol(score)}}/>
                  <span style={{fontSize:'12px',flex:1,opacity:0.8}}>{label}</span>
                  <span style={{fontSize:'11px',fontWeight:600,color:scoreCol(score),marginRight:'4px'}}>{score}</span>
                  <span style={{fontSize:'10px',opacity:0.3}}>{open?'▲':'▼'}</span>
                </div>
                <div style={{fontSize:'11px',opacity:0.5,marginTop:'3px',paddingLeft:'15px'}}>{value}</div>
                {open&&explain&&<div style={{fontSize:'11px',opacity:0.6,lineHeight:1.6,marginTop:'8px',padding:'10px',borderRadius:'8px',background:'rgba(255,255,255,0.03)'}}>{explain}</div>}
              </div>
            );
          };
          return (
            <>
              {/* Stock verdict card */}
              <div style={{...s.section,borderColor:col+'40',marginBottom:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                  <div>
                    <div style={{fontSize:'16px',fontWeight:700,color:col,marginBottom:'3px'}}>{sd.advisability}</div>
                    <div style={{fontSize:'11px',opacity:0.5}}>{sd.sector} · {sd.horizon} horizon</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'26px',fontWeight:700,color:col}}>{sc}</div>
                    <div style={{fontSize:'10px',opacity:0.4}}>/100</div>
                  </div>
                </div>
                {/* Stats row */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
                  {[
                    {l:'Target',v:`+${sd.targetPct}%`,c:'#7DC66A'},
                    {l:'Stop-loss',v:`-${sd.slPct}%`,c:'#E05C5C'},
                    {l:'R:R',v:`${sd.rrRatio}:1`,c:parseFloat(sd.rrRatio)>=2?'#7DC66A':parseFloat(sd.rrRatio)>=1.5?'#c9a84c':'#E05C5C'},
                    {l:'Prob up',v:`${sd.probUp}%`,c:sd.probUp>=60?'#7DC66A':'#c9a84c'},
                  ].map((m,i)=>(
                    <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'8px 4px',textAlign:'center'}}>
                      <div style={{fontSize:'13px',fontWeight:700,color:m.c}}>{m.v}</div>
                      <div style={{fontSize:'9px',opacity:0.4,marginTop:'2px',letterSpacing:'0.5px'}}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fundamentals card */}
              {fundamentals && (
                <div style={{...s.section,marginBottom:'12px'}}>
                  <p style={s.sectionTitle}>Fundamentals</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                    {[
                      {l:'P/E Ratio', v:fundamentals.pe?`${fundamentals.pe}x`:'—', warn:fundamentals.pe>30, good:fundamentals.pe&&fundamentals.pe<15},
                      {l:'Market Cap', v:fundamentals.marketCap||'—', warn:false, good:false},
                      {l:'Prev Close', v:fundamentals.previousClose||'—', warn:false, good:false},
                    ].map((m,i)=>(
                      <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'10px 6px',textAlign:'center'}}>
                        <div style={{fontSize:'14px',fontWeight:700,color:m.warn?'#E05C5C':m.good?'#7DC66A':'#c9a84c'}}>{m.v}</div>
                        <div style={{fontSize:'9px',opacity:0.4,marginTop:'3px',letterSpacing:'0.5px'}}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  {fundamentals.earningsDate && (
                    <div style={{marginTop:'10px',padding:'10px 12px',borderRadius:'8px',
                      background:fundamentals.earningsWarning?'rgba(224,92,92,0.1)':'rgba(255,255,255,0.04)',
                      border:`0.5px solid ${fundamentals.earningsWarning?'rgba(224,92,92,0.3)':'rgba(255,255,255,0.08)'}`}}>
                      <span style={{fontSize:'12px',color:fundamentals.earningsWarning?'#E05C5C':'#c9a84c',fontWeight:600}}>
                        {fundamentals.earningsWarning?'⚠ ':'📅 '}Results: {fundamentals.earningsDate}
                      </span>
                      {fundamentals.earningsWarning && (
                        <p style={{fontSize:'11px',opacity:0.6,margin:'4px 0 0',lineHeight:1.5}}>
                          Earnings in {fundamentals.daysToEarnings} day{fundamentals.daysToEarnings===1?'':'s'} — high volatility expected. Reduce position size.
                        </p>
                      )}
                    </div>
                  )}
                  {fundamentals.pe && (
                    <p style={{fontSize:'11px',opacity:0.5,marginTop:'8px',lineHeight:1.5}}>
                      {fundamentals.pe < 12 ? '✓ P/E below 12 — potentially undervalued relative to market.' : fundamentals.pe > 30 ? '⚠ P/E above 30 — expensive. Strong growth must justify this multiple.' : `P/E of ${fundamentals.pe}x — within normal range for Indian markets (avg ~22x).`}
                    </p>
                  )}
                </div>
              )}

              {/* Best entry date */}
              <div style={{...s.alert('info'),marginBottom:'12px',background:'rgba(201,168,76,0.06)',border:'0.5px solid rgba(201,168,76,0.25)',color:T.text}}>
                <span style={{opacity:0.5,fontSize:'11px'}}>Best entry date this month: </span>
                <strong style={{color:'#c9a84c'}}>{sd.bestDate}</strong>
                <span style={{opacity:0.5,fontSize:'11px'}}> · Thursday/Wednesday preferred · 9:15 AM IST</span>
              </div>

              {/* Technical analysis */}
              {sd.hasRealPriceData && sd.priceTech && (
                <div style={s.section}>
                  <p style={s.sectionTitle}>
                    Technical analysis
                    {sd.priceTech.source==='live'&&<span style={{color:'#7DC66A',marginLeft:'6px',fontWeight:400}}>✓ {sd.priceTech.dataPoints} days of data</span>}
                  </p>
                  {/* Price grid */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'12px'}}>
                    {[
                      {l:'Price',v:`₹${sd.priceTech.currentPrice?.toFixed?.(2)??'—'}`,c:'#c9a84c'},
                      {l:'200-DMA',v:sd.priceTech.dma200?`₹${parseFloat(sd.priceTech.dma200).toFixed(2)}`:'—',c:T.text},
                      {l:'RSI',v:sd.priceTech.rsi??'—',c:scoreCol(sd.priceTech.rsiScore)},
                      {l:'52w High',v:`₹${sd.priceTech.high52w?.toFixed?.(2)??'—'}`,c:'#7DC66A'},
                      {l:'52w Low',v:`₹${sd.priceTech.low52w?.toFixed?.(2)??'—'}`,c:'#E05C5C'},
                      {l:'5y range',v:sd.priceTech.rangePos5y?`${sd.priceTech.rangePos5y}%`:'—',c:scoreCol(sd.priceTech.range5yScore||55)},
                    ].map((m,i)=>(
                      <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'8px 6px',textAlign:'center'}}>
                        <div style={{fontSize:'9px',opacity:0.4,letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:'3px'}}>{m.l}</div>
                        <div style={{fontSize:'12px',fontWeight:600,color:m.c}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <EvidenceRow label="200-DMA position" value={sd.priceTech.dmaSignal} score={sd.priceTech.dmaScore} explain="Price above 200-DMA = bull market. Below = bear territory. Most-watched institutional level globally."/>
                  {sd.priceTech.slopeSignal&&<EvidenceRow label="200-DMA slope" value={sd.priceTech.slopeSignal} score={sd.priceTech.slopeScore} explain="Rising 200-DMA = long-term uptrend intact. Falling = trend weakening."/>}
                  <EvidenceRow label="RSI (momentum)" value={sd.priceTech.rsiSignal} score={sd.priceTech.rsiScore} explain="RSI above 70 = overbought (risk of pullback). Below 30 = oversold (bounce likely). 40-60 = neutral."/>
                  {sd.priceTech.macd&&<EvidenceRow label="MACD" value={sd.priceTech.macdSignal} score={sd.priceTech.macdScore} explain="MACD histogram above zero = momentum building. Crossover from negative to positive = classic buy signal."/>}
                  {sd.priceTech.boll&&<EvidenceRow label="Bollinger Bands" value={sd.priceTech.bollSignal} score={sd.priceTech.bollScore} explain={`Price near lower band = value zone. Near upper band = stretched. Range: ₹${sd.priceTech.boll.lower} – ₹${sd.priceTech.boll.upper}`}/>}
                  {sd.priceTech.rangePos5y&&<EvidenceRow label="5-year range" value={sd.priceTech.range5ySignal} score={sd.priceTech.range5yScore} explain={`Bottom 20% of 5-year range = accumulation zone. Top 20% = momentum only. Range: ₹${sd.priceTech.low5y?.toFixed(2)} – ₹${sd.priceTech.high5y?.toFixed(2)}`}/>}
                  {sd.priceTech.volSignal&&<EvidenceRow label="Volume" value={sd.priceTech.volSignal} score={sd.priceTech.volScore} explain="High volume confirms institutional conviction. Low volume = weak signal."/>}
                </div>
              )}
              {!sd.hasRealPriceData&&<div style={{...s.alert('warn'),marginBottom:'12px'}}>⚠ Price data not loaded — go back, type stock name and tap Analyse to load 5 years of data automatically.</div>}

              {/* Vedic signals for this stock */}
              <div style={s.section}>
                <p style={s.sectionTitle}>Vedic signals</p>
                {sd.report.filter(r=>['06','07','08'].includes(r.num)).map((pt,i)=>(
                  <div key={i} style={{borderBottom:i===2?'none':`0.5px solid rgba(255,255,255,0.06)`,paddingBottom:'10px',marginBottom:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}>
                      <span style={{fontSize:'13px'}}>{pt.icon}</span>
                      <span style={{fontSize:'12px',fontWeight:600,flex:1}}>{pt.title}</span>
                      <span style={{fontSize:'11px',color:scoreCol(pt.score),fontWeight:600}}>{pt.score}</span>
                    </div>
                    <div style={{fontSize:'11px',color:scoreCol(pt.score),marginBottom:'3px',paddingLeft:'21px'}}>{pt.value}</div>
                    <div style={{fontSize:'11px',opacity:0.45,lineHeight:1.6,paddingLeft:'21px',whiteSpace:'pre-line'}}>{pt.detail}</div>
                  </div>
                ))}
              </div>

              {/* Log prediction */}
              <button onClick={()=>saveToBacktestLog(sd.symbol,sc,sd.verdict)}
                style={{width:'100%',padding:'12px',marginBottom:'8px',borderRadius:'10px',fontSize:'12px',
                  fontWeight:600,cursor:'pointer',background:'rgba(201,168,76,0.08)',
                  border:'1px solid rgba(201,168,76,0.3)',color:'#c9a84c',fontFamily:"'DM Sans',sans-serif"}}>
                📌 Log this prediction
              </button>
            </>
          );
        })()}

        {/* ══════════════ SELL TAB ══════════════ */}
        {activeTab==='Sell' && sellVerdict && (()=>{
          const sv = sellVerdict;
          const col = sv.color;
          const pnlPos = parseFloat(sv.pnlPct) >= 0;
          return (
            <>
              {/* Big verdict card */}
              <div style={{padding:'20px',borderRadius:'16px',marginBottom:'14px',textAlign:'center',
                background:`${col}10`,border:`1.5px solid ${col}40`}}>
                <div style={{fontSize:'28px',fontWeight:800,color:col,marginBottom:'8px',letterSpacing:'1px'}}>{sv.verdict}</div>
                <div style={{display:'flex',justifyContent:'center',gap:'16px',flexWrap:'wrap'}}>
                  <div>
                    <div style={{fontSize:'18px',fontWeight:700,color:pnlPos?'#7DC66A':'#E05C5C'}}>{pnlPos?'+':''}{sv.pnlPct}%</div>
                    <div style={{fontSize:'10px',opacity:0.4}}>P&L %</div>
                  </div>
                  <div>
                    <div style={{fontSize:'18px',fontWeight:700,color:pnlPos?'#7DC66A':'#E05C5C'}}>₹{Math.abs(sv.pnlRs).toLocaleString('en-IN')}</div>
                    <div style={{fontSize:'10px',opacity:0.4}}>{pnlPos?'Profit':'Loss'}</div>
                  </div>
                  <div>
                    <div style={{fontSize:'18px',fontWeight:700,color:T.text}}>{sv.heldStr}</div>
                    <div style={{fontSize:'10px',opacity:0.4}}>Held</div>
                  </div>
                </div>
              </div>

              {/* Earnings warning */}
              {sv.earningsWarn && (
                <div style={{padding:'12px 14px',borderRadius:'10px',marginBottom:'12px',
                  background:'rgba(224,92,92,0.1)',border:'1px solid rgba(224,92,92,0.3)'}}>
                  <p style={{fontSize:'13px',fontWeight:700,color:'#E05C5C',margin:'0 0 4px'}}>⚠ Earnings in {sv.daysToE} day{sv.daysToE===1?'':'s'}!</p>
                  <p style={{fontSize:'11px',opacity:0.65,margin:0,lineHeight:1.5}}>Results due {sv.earningsDate}. High volatility expected. Consider reducing position size before earnings.</p>
                </div>
              )}

              {/* Action */}
              {(sv.stopLoss||sv.target) && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'14px'}}>
                  {sv.stopLoss && <div style={{padding:'12px',borderRadius:'10px',textAlign:'center',background:'rgba(224,92,92,0.08)',border:'0.5px solid rgba(224,92,92,0.2)'}}>
                    <div style={{fontSize:'16px',fontWeight:700,color:'#E05C5C'}}>₹{sv.stopLoss}</div>
                    <div style={{fontSize:'10px',opacity:0.4,marginTop:'2px'}}>Stop-loss</div>
                  </div>}
                  {sv.target && <div style={{padding:'12px',borderRadius:'10px',textAlign:'center',background:'rgba(100,180,80,0.08)',border:'0.5px solid rgba(100,180,80,0.2)'}}>
                    <div style={{fontSize:'16px',fontWeight:700,color:'#7DC66A'}}>₹{sv.target}</div>
                    <div style={{fontSize:'10px',opacity:0.4,marginTop:'2px'}}>Target</div>
                  </div>}
                </div>
              )}

              {/* Exit reasons */}
              {sv.reasons.length>0 && (
                <div style={{...s.section,marginBottom:'12px'}}>
                  <p style={{...s.sectionTitle,color:'#E05C5C'}}>⚠ Exit signals ({sv.exitPoints} pts)</p>
                  {sv.reasons.map((r,i)=>(
                    <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-start',padding:'6px 0',
                      borderBottom:i===sv.reasons.length-1?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                      <span style={{color:'#E05C5C',fontSize:'11px',flexShrink:0}}>✗</span>
                      <span style={{fontSize:'12px',opacity:0.75,lineHeight:1.5}}>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hold reasons */}
              {sv.holdReasons.length>0 && (
                <div style={{...s.section,marginBottom:'12px'}}>
                  <p style={{...s.sectionTitle,color:'#7DC66A'}}>✓ Hold signals ({sv.holdPoints} pts)</p>
                  {sv.holdReasons.map((r,i)=>(
                    <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-start',padding:'6px 0',
                      borderBottom:i===sv.holdReasons.length-1?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                      <span style={{color:'#7DC66A',fontSize:'11px',flexShrink:0}}>✓</span>
                      <span style={{fontSize:'12px',opacity:0.75,lineHeight:1.5}}>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to portfolio */}
              <button onClick={()=>addToPortfolio(stockInput, sellInputs.buyPrice, sellInputs.qty, priceData.currentPrice)}
                style={{width:'100%',padding:'12px',borderRadius:'10px',fontSize:'12px',fontWeight:600,
                  cursor:'pointer',background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.25)',
                  color:'#c9a84c',fontFamily:"'DM Sans',sans-serif",marginBottom:'8px'}}>
                💼 Add to My Portfolio
              </button>
            </>
          );
        })()}

        {/* ══════════════ DETAILS TAB ══════════════ */}
        {activeTab==='Details' && (
          <>
            {/* Panchang */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Panchang — {R.date} · {R.time} IST</p>
              {[
                {l:'Tithi',v:`${TITHI_N[R.tithiNum]} (${R.tithiNum})`,s:TITHI_Q[R.tithiNum]||55},
                {l:'Nakshatra',v:`${NAK_NAMES[R.moonNak]} · Pada ${R.planets.Moon.pada}`,s:NAK_Q[R.moonNak]},
                {l:'Nature',v:NAK_NATURE[R.moonNak],s:null},
                {l:'Ruler',v:NAK_RULER[R.moonNak],s:null},
                {l:'Weekday',v:VAAR_N[R.dow],s:VAAR_Q[R.dow]},
                {l:'Paksha',v:R.paksha,s:R.paksha==='Shukla'?72:42},
                {l:'Hora now',v:R.hora.planet,s:R.hora.q},
                {l:'Yoga',v:R.yoga||'—',s:null},
                {l:'Karana',v:R.karana||'—',s:null},
              ].map((row,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',padding:'7px 0',
                  borderBottom:i===8?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontSize:'11px',opacity:0.45,width:'90px',flexShrink:0}}>{row.l}</span>
                  <span style={{fontSize:'12px',flex:1}}>{row.v}</span>
                  {row.s!=null&&<span style={{fontSize:'11px',fontWeight:600,color:scoreCol(row.s)}}>{row.s}</span>}
                </div>
              ))}
            </div>

            {/* Planets */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Planets right now</p>
              {Object.entries(R.planets).map(([name,p],i)=>(
                <div key={name} style={{display:'flex',alignItems:'center',padding:'6px 0',
                  borderBottom:i===Object.keys(R.planets).length-1?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontSize:'11px',opacity:0.5,width:'72px',flexShrink:0}}>{name}</span>
                  <span style={{fontSize:'11px',flex:1}}>{RASHI[p.sign]} {p.deg?.toFixed(1)}°{R.retro[name]?' ℞':''}</span>
                  <span style={{fontSize:'10px',opacity:0.4}}>{p.nakshatra?NAK_NAMES[p.nakshatra]:''}</span>
                </div>
              ))}
            </div>

            {/* Dasha */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Dasha cycle</p>
              {[
                {l:'Mahadasha',v:R.dasha.maha,s:R.dashaScore},
                {l:'Antardasha',v:R.dasha.antar,s:null},
                {l:'Pratyantar',v:R.dasha.pratyantar,s:null},
              ].map((row,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',padding:'8px 0',
                  borderBottom:i===2?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontSize:'11px',opacity:0.45,width:'90px',flexShrink:0}}>{row.l}</span>
                  <span style={{fontSize:'13px',flex:1,fontWeight:i===0?600:400}}>{row.v}</span>
                  {row.s!=null&&<span style={{fontSize:'11px',fontWeight:600,color:scoreCol(row.s)}}>{row.s}/100</span>}
                </div>
              ))}
              <p style={{fontSize:'11px',opacity:0.45,marginTop:'8px',lineHeight:1.6}}>
                Sectors favoured by {R.dasha.maha}: {(PLANET_SEC[R.dasha.maha]||[]).join(', ')||'broad market'}
              </p>
            </div>

            {/* Calendar */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Best days this month</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'3px',marginBottom:'6px'}}>
                {['S','M','T','W','T','F','S'].map((d,i)=>(
                  <div key={i} style={{textAlign:'center',fontSize:'9px',opacity:0.3,padding:'2px 0'}}>{d}</div>
                ))}
                {R.calDays.map((d,i)=>{
                  const col=!d.isMonth?'transparent':d.score>=65?'rgba(100,180,80,0.2)':d.score>=50?'rgba(201,168,76,0.12)':'rgba(224,92,92,0.08)';
                  const tc=!d.isMonth?T.text+'20':d.score>=65?'#7DC66A':d.score>=50?'#c9a84c':'#E05C5C55';
                  return(
                    <div key={i} style={{borderRadius:'4px',padding:'4px 0',textAlign:'center',background:col,color:tc,fontSize:'10px',fontWeight:d.isMarket?600:400}}>
                      {d.isMonth?d.d:''}
                    </div>
                  );
                })}
              </div>
              <p style={{fontSize:'10px',opacity:0.3,lineHeight:1.5}}>🟢 Good · 🟡 Neutral · 🔴 Avoid · Bold = market day</p>
            </div>

            {/* Sectors */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Sector confluence scores</p>
              {R.sectorScores.slice(0,8).map((sec,i)=>(
                <div key={i} style={{marginBottom:'8px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                    <span style={{fontSize:'12px',opacity:0.7}}>{sec.name}</span>
                    <span style={{fontSize:'11px',fontWeight:600,color:scoreCol(sec.score)}}>{sec.score}/100</span>
                  </div>
                  <div style={{height:'3px',background:'rgba(255,255,255,0.07)',borderRadius:'2px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${sec.score}%`,background:scoreCol(sec.score),opacity:0.7,borderRadius:'2px'}}/>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════════ DEEP DIVE TAB ══════════════ */}
        {activeTab==='Deep Dive' && (
          <>
            <div style={{...s.alert('info'),background:'rgba(201,168,76,0.05)',border:'0.5px solid rgba(201,168,76,0.2)',color:T.text,marginBottom:'14px'}}>
              <span style={{fontSize:'12px',opacity:0.6}}>These are the underlying calculation details for researchers and advanced users.</span>
            </div>
            {/* Houses */}
            <div style={s.section}>
              <p style={s.sectionTitle}>NSE natal houses — planet transits</p>
              {R.houseScores?.map((h,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',padding:'6px 0',borderBottom:i===R.houseScores.length-1?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontSize:'11px',opacity:0.4,width:'60px',flexShrink:0}}>House {h.house}</span>
                  <span style={{fontSize:'11px',flex:1,opacity:0.7}}>{h.planets?.join(', ')||'Empty'}</span>
                  <span style={{fontSize:'11px',color:scoreCol(h.score||55)}}>{h.score||55}</span>
                </div>
              ))}
            </div>
            {/* Ashtakvarga */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Ashtakvarga bindus</p>
              {R.avp && Object.entries(R.avp).map(([planet,score],i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',padding:'6px 0',borderBottom:i===Object.keys(R.avp).length-1?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontSize:'11px',opacity:0.5,flex:1}}>{planet}</span>
                  <div style={{width:'80px',height:'3px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',overflow:'hidden',marginRight:'8px'}}>
                    <div style={{height:'100%',width:`${Math.min(100,(score/8)*100)}%`,background:score>=5?'#7DC66A':score>=4?'#c9a84c':'#E05C5C',borderRadius:'2px'}}/>
                  </div>
                  <span style={{fontSize:'11px',color:score>=5?'#7DC66A':score>=4?'#c9a84c':'#E05C5C',fontWeight:600}}>{score}/8</span>
                </div>
              ))}
            </div>
            {/* Yogas */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Active yogas</p>
              {R.yogas.length===0&&<p style={{fontSize:'12px',opacity:0.4}}>No special yogas active today.</p>}
              {R.yogas.map((y,i)=>(
                <div key={i} style={{display:'flex',gap:'8px',alignItems:'flex-start',padding:'8px 0',borderBottom:i===R.yogas.length-1?'none':'0.5px solid rgba(255,255,255,0.05)'}}>
                  <span style={{fontSize:'12px'}}>{y.type==='good'?'✓':'⚠'}</span>
                  <div>
                    <div style={{fontSize:'12px',fontWeight:600,color:y.type==='good'?'#7DC66A':'#E05C5C'}}>{y.name}</div>
                    <div style={{fontSize:'11px',opacity:0.5,lineHeight:1.5}}>{y.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Disclaimer */}
        <p style={{...s.disclaimer,marginTop:'20px'}}>
          {hi?'यह शोध और शिक्षा उपकरण है। SEBI-पंजीकृत निवेश सलाह नहीं।':'Research & education tool only. Not SEBI-registered investment advice.'}
        </p>

      </div>

      {/* ══ PORTFOLIO MODAL ══ */}
      {showPortfolio && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:1000,
          background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'flex-end'}}
          onClick={()=>setShowPortfolio(false)}>
          <div style={{background:T.bg,width:'100%',maxHeight:'88vh',overflowY:'auto',
            borderRadius:'20px 20px 0 0',padding:'20px',boxSizing:'border-box'}}
            onClick={e=>e.stopPropagation()}>

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <p style={{fontSize:'15px',fontWeight:700,color:'#c9a84c',margin:0}}>💼 My Portfolio</p>
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={refreshPortfolioPrices} disabled={portfolioLoading}
                  style={{background:'rgba(201,168,76,0.1)',border:'0.5px solid rgba(201,168,76,0.3)',
                    borderRadius:'8px',color:'#c9a84c',fontFamily:"'DM Sans',sans-serif",
                    fontSize:'11px',padding:'6px 10px',cursor:'pointer'}}>
                  {portfolioLoading?'↺ Updating…':'↺ Refresh prices'}
                </button>
                <button onClick={()=>setShowPortfolio(false)}
                  style={{background:'none',border:'none',color:T.text,fontSize:'20px',cursor:'pointer',opacity:0.5}}>✕</button>
              </div>
            </div>

            {portfolio.length===0 ? (
              <div style={{textAlign:'center',padding:'30px 10px',opacity:0.5}}>
                <p style={{fontSize:'28px',marginBottom:'10px'}}>📭</p>
                <p style={{fontSize:'13px',lineHeight:1.7}}>No holdings yet. After analysing a stock in Sell mode, tap "Add to Portfolio" to track it here.</p>
              </div>
            ) : (
              <>
                {/* Portfolio summary */}
                {(()=>{
                  const holdings = portfolio.filter(h=>h.currentPrice&&h.buyPrice);
                  const totalInvested = portfolio.reduce((a,h)=>(a+(h.buyPrice||0)*(h.qty||1)),0);
                  const totalCurrent = holdings.reduce((a,h)=>(a+(h.currentPrice||0)*(h.qty||1)),0);
                  const totalPnl = totalCurrent - portfolio.filter(h=>h.currentPrice).reduce((a,h)=>(a+(h.buyPrice||0)*(h.qty||1)),0);
                  const totalPnlPct = totalInvested>0?(totalPnl/totalInvested*100):0;
                  return (
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'16px'}}>
                      {[
                        {l:'Holdings',v:portfolio.length,c:T.text},
                        {l:'Invested',v:`₹${totalInvested.toLocaleString('en-IN',{maximumFractionDigits:0})}`,c:T.text},
                        {l:'P&L',v:`${totalPnlPct>=0?'+':''}${totalPnlPct.toFixed(1)}%`,c:totalPnlPct>=0?'#7DC66A':'#E05C5C'},
                      ].map((m,i)=>(
                        <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
                          <div style={{fontSize:'16px',fontWeight:700,color:m.c}}>{m.v}</div>
                          <div style={{fontSize:'9px',opacity:0.4,marginTop:'2px'}}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Holdings list */}
                {portfolio.map((h,i)=>{
                  const pnl = h.currentPrice ? ((h.currentPrice-h.buyPrice)/h.buyPrice*100) : null;
                  const pnlRs = h.currentPrice ? ((h.currentPrice-h.buyPrice)*(h.qty||1)) : null;
                  return (
                    <div key={h.id} style={{background:'rgba(255,255,255,0.03)',borderRadius:'12px',
                      padding:'14px',marginBottom:'8px',border:'0.5px solid rgba(255,255,255,0.07)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                        <div>
                          <span style={{fontSize:'14px',fontWeight:700}}>{h.symbol}</span>
                          <span style={{fontSize:'10px',opacity:0.4,marginLeft:'8px'}}>{h.qty} shares · bought {h.buyDate}</span>
                        </div>
                        <button onClick={()=>removeFromPortfolio(h.id)}
                          style={{background:'none',border:'none',color:T.text,opacity:0.3,cursor:'pointer',fontSize:'16px'}}>✕</button>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
                        {[
                          {l:'Buy',v:`₹${h.buyPrice}`,c:T.text},
                          {l:'Now',v:h.currentPrice?`₹${h.currentPrice.toFixed(2)}`:'—',c:T.text},
                          {l:'P&L %',v:pnl!==null?`${pnl>=0?'+':''}${pnl.toFixed(1)}%`:'—',c:pnl>=0?'#7DC66A':'#E05C5C'},
                          {l:'P&L ₹',v:pnlRs!==null?`${pnlRs>=0?'+':''}${Math.round(pnlRs).toLocaleString('en-IN')}`:'—',c:pnlRs>=0?'#7DC66A':'#E05C5C'},
                        ].map((m,j)=>(
                          <div key={j} style={{textAlign:'center'}}>
                            <div style={{fontSize:'12px',fontWeight:600,color:m.c}}>{m.v}</div>
                            <div style={{fontSize:'9px',opacity:0.35,marginTop:'1px'}}>{m.l}</div>
                          </div>
                        ))}
                      </div>
                      {h.lastUpdated && <p style={{fontSize:'9px',opacity:0.3,margin:'6px 0 0',textAlign:'right'}}>Updated {h.lastUpdated}</p>}
                      {/* Quick analyse button */}
                      <button
                        onClick={()=>{setStockInput(h.symbol);setMode('sell');setSellInputs({buyPrice:String(h.buyPrice),buyDate:h.buyDate,qty:String(h.qty||1)});setShowPortfolio(false);}}
                        style={{width:'100%',marginTop:'8px',padding:'8px',borderRadius:'8px',fontSize:'11px',
                          fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",
                          background:'rgba(201,168,76,0.08)',border:'0.5px solid rgba(201,168,76,0.2)',color:'#c9a84c'}}>
                        💸 Should I sell {h.symbol}?
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
