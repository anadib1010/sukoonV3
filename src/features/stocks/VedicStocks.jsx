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
const JUP_SQ   = {0:68,1:72,2:62,3:80,4:74,5:55,6:65,7:58,8:92,9:38,10:68,11:88};
const SAT_SQ   = {0:42,1:58,2:62,3:38,4:44,5:68,6:90,7:55,8:52,9:88,10:85,11:60};

function mod360(v){return((v%360)+360)%360;}
function toRad(d){return d*Math.PI/180;}

function jdFromDate(y,m,d,h,mn){
  const ut=h+mn/60; let Y=y,M=m;
  if(M<=2){Y--;M+=12;}
  const A=Math.floor(Y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(Y+4716))+Math.floor(30.6001*(M+1))+d+B-1524.5+ut/24;
}
function ayanamsha(JD){const T=(JD-2415020)/36524.22;return 22.460148+50.2564249*T/3600;}

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
    antarSeq.push({planet:DASHA_ORD[idx],start:c2,end:c2+yrs*365.25});
    c2+=yrs*365.25;
  }
  const antar=antarSeq.find(d=>currentJD>=d.start&&currentJD<d.end)||antarSeq[0];
  return{maha:maha.planet,antar:antar.planet};
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
  const BAV={Sun:{Sun:[1,2,4,7,8,9,10,11],Moon:[3,6,10,11],Mars:[1,2,4,7,8,9,10,11],Mercury:[5,6,9,11],Jupiter:[5,6,9,11],Venus:[6,7,12],Saturn:[1,2,4,7,8,9,10,11]},Moon:{Sun:[3,6,7,8,10,11],Moon:[1,3,6,7,10,11],Mars:[2,3,5,6,9,10,11],Mercury:[1,3,4,5,7,8,10,11],Jupiter:[1,4,7,8,10,11,12],Venus:[3,4,5,7,9,10,11],Saturn:[3,5,6,11]},Jupiter:{Sun:[1,2,3,4,7,8,9,10,11],Moon:[2,5,7,9,11],Mars:[1,2,4,7,8,10,11],Mercury:[1,2,4,5,6,9,10,11],Jupiter:[1,2,3,4,7,8,10,11],Venus:[2,5,6,9,10,11],Saturn:[3,5,6,12]}};
  const res={};
  ['Sun','Moon','Jupiter'].forEach(p=>{
    const table=BAV[p];let score=0;
    const pSign=planets[p].sign;
    Object.entries(table).forEach(([c,houses])=>{
      const cSign=planets[c].sign;
      houses.forEach(h=>{if(((pSign-cSign+12)%12)+1===h)score++;});
    });
    res[p]=score;
  });
  return res;
}

// ─── SECTOR UNIVERSE ─────────────────────────────────────────────────────────
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
function runEngine(date,time,lat,lon){
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
  const refJD=jdFromDate(yr-40,mo,dy,0,0);
  const dasha=calcDasha(planets.Moon.lng,refJD,JD);
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

  // ── DASHA SCORE ───────────────────────────────────────────────────────────
  const PB={Jupiter:88,Venus:80,Mercury:75,Moon:65,Sun:60,Mars:55,Saturn:48,Rahu:42,Ketu:38};
  let dashaScore=Math.round((PB[dasha.maha]||55)*0.60+(PB[dasha.antar]||55)*0.40);
  if(exalted.includes(dasha.maha))dashaScore+=10;
  if(debil.includes(dasha.maha))dashaScore-=12;
  dashaScore=Math.min(100,Math.max(10,dashaScore));

  // ── VEDIC DEEP ────────────────────────────────────────────────────────────
  const avgAshtak=Math.round(Object.values(ashtak).reduce((a,b)=>a+b,0)/3*12.5);
  let vedicScore=Math.round(mScore*0.40+dashaScore*0.40+avgAshtak*0.20);
  if(exalted.length)vedicScore+=exalted.length*4;
  if(debil.length)vedicScore-=debil.length*4;
  vedicScore=Math.min(100,Math.max(5,vedicScore));

  // ── WESTERN SCORE ─────────────────────────────────────────────────────────
  let westScore=Math.round((JUP_SQ[planets.Jupiter.sign]||55)*0.40+(SAT_SQ[planets.Saturn.sign]||55)*0.30+jsAspect.q*0.30);
  if(retro.Mercury)westScore-=10;
  if(retro.Jupiter)westScore-=6;
  const sunToRahu=Math.abs(mod360(planets.Sun.lng-planets.Rahu.lng));
  if(sunToRahu<18||sunToRahu>342)westScore-=15;
  westScore=Math.min(100,Math.max(10,westScore));

  // ── LUNAR SCORE ───────────────────────────────────────────────────────────
  let lunarScore=phase.dichev+(paksha==='Shukla'?8:0);
  if(tithiNum===11)lunarScore+=12;if(tithiNum===15)lunarScore+=10;if(tithiNum===16)lunarScore-=20;
  lunarScore=Math.min(100,Math.max(10,lunarScore));

  // ── MACRO (estimated — Indian market defaults 2025) ───────────────────────
  const macroScore=65; // moderate — user can note current macro conditions

  // ── TECHNICAL (estimated) ─────────────────────────────────────────────────
  const techScore=62;

  // ── COMPOSITE ─────────────────────────────────────────────────────────────
  const composite=Math.min(100,Math.max(5,Math.round(
    vedicScore*0.32+westScore*0.16+lunarScore*0.10+macroScore*0.22+techScore*0.12+dashaScore*0.08
  )));
  const layers={vedic:vedicScore,western:westScore,lunar:lunarScore,macro:macroScore,tech:techScore,dasha:dashaScore};
  const bullLayers=Object.values(layers).filter(s=>s>=62).length;

  // ── SECTORS ───────────────────────────────────────────────────────────────
  const activePlanets=new Set([dasha.maha,dasha.antar,NAK_RULER[moonNak],horaData.planet,...exalted]);
  const sectorScores=ALL_SECTORS.map(sec=>{
    let s=48;
    sec.planets.forEach(p=>{if(activePlanets.has(p))s+=14;});
    NAK_SEC[moonNak].forEach(ns=>{if(sec.name.toLowerCase().includes(ns.toLowerCase()))s+=10;});
    if(sec.planets.includes(VAAR_L[dow]))s+=8;
    exalted.forEach(p=>{if(sec.planets.includes(p))s+=8;});
    debil.forEach(p=>{if(sec.planets.includes(p))s-=8;});
    if(retro.Mercury&&sec.id==='it')s-=10;
    return{...sec,score:Math.min(97,Math.max(12,Math.round(s)))};
  }).sort((a,b)=>b.score-a.score);

  // ── MONTH CALENDAR ────────────────────────────────────────────────────────
  const[y2,m2,d2]=date.split('-').map(Number);
  const daysInMonth=new Date(y2,m2,0).getDate();
  const startDow=new Date(y2,m2-1,1).getDay();
  const calDays=[];
  for(let d=1;d<=daysInMonth;d++){
    const wd=new Date(y2,m2-1,d).getDay();
    const isM=wd>0&&wd<6;
    const vq=VAAR_Q[wd];
    const offset=Math.round((d-d2)*13.2);
    const estT=((tithiNum+Math.floor(offset/12)-1)%30)+1||1;
    const tq=TITHI_Q[Math.min(estT,16)]||55;
    calDays.push({d,dow:wd,score:isM?Math.min(95,Math.round(vq*0.40+tq*0.33+westScore*0.15+lunarScore*0.12)):0,isMarket:isM});
  }

  return {
    composite,layers,bullLayers,vedicScore,westScore,lunarScore,dashaScore,
    mScore,planets,lagnaSign,lagnaLng,moonNak,sunNak,
    tithiNum,paksha,dow,horaData,retro,exalted,debil,
    dasha,yogas,yogaBoost,jsAspect,phase,ashtak,d9,d10,
    sectorScores,calDays,startDow,date,time,lat,lon,
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

  // Auto-detect GPS on mount
  useEffect(() => {
    setGpsStatus('loading');
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(parseFloat(pos.coords.latitude.toFixed(4)));
        setLon(parseFloat(pos.coords.longitude.toFixed(4)));
        setCity(`${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`);
        setGpsStatus('ok');
      },
      () => setGpsStatus('denied'),
      { timeout: 6000 }
    );
  }, []);

  const handleAnalyze = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const r = runEngine(date, time, lat, lon);
      setResult(r);
      setActiveTab('overview');
      setView('result');
      setLoading(false);
    }, 400);
  }, [date, time, lat, lon]);

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

          {/* Stock name */}
          <div style={s.stockRow}>
            <span style={s.inputLabel}>{hi ? 'स्टॉक नाम (वैकल्पिक)' : 'Stock / Index name (optional)'}</span>
            <input style={s.stockInput} type="text" value={stockInput}
              onChange={e=>setStockInput(e.target.value)}
              placeholder="e.g. RELIANCE, TCS, HDFC Bank, NIFTY 50…"/>
          </div>

          {/* Analyze */}
          <button style={s.analyzeBtn} onClick={handleAnalyze} disabled={loading}>
            {loading ? '⏳ Computing…' : `✦ ${hi ? 'विश्लेषण करें' : 'Analyse Now'} ✦`}
          </button>

          {/* What's calculated note */}
          <div style={{...s.section, marginTop:'8px'}}>
            <p style={{...s.sectionTitle, marginBottom:'8px'}}>What gets calculated automatically</p>
            {['D1 · D9 Navamsa · D10 Dashamsa','Nakshatra · Tithi · Karana · Yoga · Hora','Vimshottari Dasha (Maha + Antar + Pratyantar)','Ashtakvarga · Shadbala · Bhav Madhya','Planetary degrees · Retrograde status · Exaltation','Jupiter-Saturn aspect (Western 20-yr cycle)','Lunar phase (Dichev-Janes model)','Ghatak chakra · Avakahada · Yogas','Sector confluence scoring · Month calendar'].map((item,i)=>(
              <p key={i} style={{fontSize:'11px',opacity:0.5,margin:'4px 0',lineHeight:1.5}}>✦ {item}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT VIEW ───────────────────────────────────────────────────────────
  const R = result;
  const TABS = ['overview','panchang','planets','dasha','sectors','calendar'];
  if (stockInput.trim()) TABS.push('stock');

  // Stock analysis
  let stockData = null;
  if (stockInput.trim()) {
    const key = stockInput.toUpperCase().trim();
    let sectorId = null;
    for (const [k,v] of Object.entries(STOCK_MAP)) { if(key.includes(k)||k.includes(key)){sectorId=v;break;} }
    const sec = R.sectorScores.find(s=>s.id===sectorId);
    const sScore = sec?.score || Math.round((R.composite+60)/2);
    const fScore = sectorId==='index'?R.composite:Math.round(R.composite*0.45+sScore*0.55);
    stockData = {
      symbol:key, sector:sec?.name||'Broad market', sectorScore:sScore, finalScore:fScore,
      verdict:fScore>=75?'Strong buy signal':fScore>=62?'Moderate buy':fScore>=50?'Neutral — hold':fScore>=40?'Caution — reduce':'Avoid / exit',
      target:fScore>=78?'15–22%':fScore>=65?'8–14%':fScore>=52?'4–8%':'2–4%',
      horizon:fScore>=72?'3–5 months':fScore>=58?'5–9 months':'9–15 months',
      stopLoss:fScore>=70?'5–7%':fScore>=55?'7–10%':'10–12%',
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
                {l:`Jupiter in ${RASHI[R.planets.Jupiter.sign]}`,sub:`12-yr cycle · sectors: ${(PLANET_SEC.Jupiter||[]).slice(0,3).join(', ')}`,s:JUP_SQ[R.planets.Jupiter.sign]||55},
                {l:`Saturn in ${RASHI[R.planets.Saturn.sign]}${R.retro.Saturn?' (R)':''}`,sub:`29-yr cycle · sectors: ${(PLANET_SEC.Saturn||[]).slice(0,3).join(', ')}`,s:SAT_SQ[R.planets.Saturn.sign]||55},
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
              <p style={s.sectionTitle}>Best market days this month</p>
              {R.calDays.filter(d=>d.isMarket).sort((a,b)=>b.score-a.score).slice(0,6).map((d,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===5?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={s.sigDot(d.score)}/>
                  <div style={{flex:1}}>
                    <div style={s.sigName}>{R.date.slice(0,7)}-{String(d.d).padStart(2,'0')} ({VAAR_N[d.dow]})</div>
                    <div style={s.sigSub}>Best for: {['-','Consumer/FMCG','Metals/Defence','IT/Banking','Banking/Finance','Auto/Pharma','-'][d.dow]}</div>
                  </div>
                  <span style={s.badge(d.score)}>{d.score}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STOCK ── */}
        {activeTab==='stock' && stockData && (
          <>
            <div style={s.scoreWrap}>
              <ScoreArc score={stockData.finalScore}/>
              <div>
                <div style={{fontSize:'15px',fontWeight:500,color:scoreColor(stockData.finalScore),marginBottom:'4px'}}>{stockData.verdict}</div>
                <div style={{fontSize:'13px',opacity:0.6,marginBottom:'2px'}}>{stockData.symbol}</div>
                <div style={{fontSize:'11px',opacity:0.45}}>{stockData.sector}</div>
              </div>
            </div>

            <div style={s.metricGrid}>
              <div style={s.metric}><div style={s.metricLabel}>Target</div><div style={{fontSize:'18px',fontWeight:500,color:'#7DC66A'}}>+{stockData.target}</div><div style={s.metricSub}>{stockData.horizon}</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Stop-loss</div><div style={{fontSize:'18px',fontWeight:500,color:'#E05C5C'}}>-{stockData.stopLoss}</div><div style={s.metricSub}>risk management</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Sector score</div><div style={s.metricVal(stockData.sectorScore)}>{stockData.sectorScore}</div><div style={s.metricSub}>sector signal</div></div>
              <div style={s.metric}><div style={s.metricLabel}>Final score</div><div style={s.metricVal(stockData.finalScore)}>{stockData.finalScore}</div><div style={s.metricSub}>composite</div></div>
            </div>

            <div style={s.section}>
              <p style={s.sectionTitle}>Astrological basis</p>
              {[
                {l:`${R.dasha.maha} Maha + ${R.dasha.antar} Antardasha`,sub:`Activated sectors: ${(PLANET_SEC[R.dasha.maha]||[]).slice(0,2).join(', ')}`,s:R.dashaScore},
                {l:`${NAK_NAMES[R.moonNak]} nakshatra`,sub:`Sectors: ${NAK_SEC[R.moonNak].join(', ')}`,s:NAK_Q[R.moonNak]},
                {l:`Exalted planets: ${R.exalted.length?R.exalted.join(', '):'None'}`,sub:R.exalted.length?'Strengthening their ruled sectors':'No exaltation boost currently',s:R.exalted.length?75:55},
                {l:`Mercury ${R.retro.Mercury?'retrograde ⚠':'direct ✓'}`,sub:R.retro.Mercury?'Caution on IT/fintech names':'Positive for IT, banking, logistics',s:R.retro.Mercury?28:72},
                {l:`Jupiter-Saturn: ${R.jsAspect.name}`,sub:R.jsAspect.note,s:R.jsAspect.q},
              ].map((row,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===4?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={s.sigDot(row.s)}/>
                  <div style={{flex:1}}><div style={s.sigName}>{row.l}</div><div style={s.sigSub}>{row.sub}</div></div>
                </div>
              ))}
            </div>

            <div style={s.section}>
              <p style={s.sectionTitle}>Best entry timing for {stockData.symbol}</p>
              {[
                {l:'Preferred nakshatra',v:'Pushya · Hasta · Rohini · Revati · Punarvasu'},
                {l:'Preferred tithi',v:'Ekadashi (11) · Dwadashi (12) · Dashami (10) · Purnima (15)'},
                {l:'Preferred vaar',v:'Thursday (Jupiter) · Wednesday (Mercury) · Friday (Venus)'},
                {l:'Best hora for entry',v:'Jupiter hora or Venus hora (first 60 min of the session)'},
              ].map((row,i)=>(
                <div key={i} style={{...s.sigRow,borderBottom:i===3?'none':`0.5px solid ${T.accent}15`}}>
                  <div style={{...s.sigDot(65),marginTop:'6px'}}/>
                  <div style={{flex:1}}><div style={s.sigName}>{row.l}</div><div style={s.sigSub}>{row.v}</div></div>
                </div>
              ))}
            </div>
          </>
        )}

        <p style={s.disclaimer}>
          {hi
            ? 'यह एक शोध और शिक्षा उपकरण है। SEBI-पंजीकृत निवेश सलाह नहीं। कोई भी निवेश निर्णय लेने से पहले वित्तीय सलाहकार से परामर्श करें।'
            : 'Research and education tool only. Not SEBI-registered investment advice. Consult a registered financial advisor before making any investment decision. Past astrological correlations do not guarantee future returns.'}
        </p>
      </div>
    </div>
  );
}
