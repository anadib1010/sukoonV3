import React, { useState, useEffect, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';
import { creditSession } from '../../utils/activity';

const creditMetta = () => {
  try {
    const count = parseInt(localStorage.getItem("jsukoon_metta_count") || "0");
    localStorage.setItem("jsukoon_metta_count", (count + 1).toString());
  } catch {}
};

// ─── 10 CHARACTERS ────────────────────────────────────────────────────────────
// Each has: id, emoji, name, nameH, desc, descH
// drawFn receives (ctx, cx, cy, size) and draws the illustrated element
const CHARACTERS = [
  {
    id: 'diya',
    emoji: '🪔',
    name: 'Diya',
    nameH: 'दीया',
    desc: 'A glowing oil lamp',
    descH: 'जलता हुआ दीपक',
    draw: (ctx, cx, cy, sz) => {
      // base dish
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy+sz*0.3, sz*0.55, sz*0.22, 0, 0, Math.PI*2);
      ctx.fillStyle = '#c8860a'; ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy+sz*0.28, sz*0.5, sz*0.18, 0, 0, Math.PI*2);
      ctx.fillStyle = '#e8a020'; ctx.fill();
      // wick flame
      const flameGrad = ctx.createRadialGradient(cx, cy-sz*0.1, 2, cx, cy-sz*0.1, sz*0.32);
      flameGrad.addColorStop(0,   'rgba(255,255,180,0.95)');
      flameGrad.addColorStop(0.4, 'rgba(255,160,20,0.85)');
      flameGrad.addColorStop(1,   'rgba(255,80,0,0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy-sz*0.45);
      ctx.bezierCurveTo(cx+sz*0.18, cy-sz*0.15, cx+sz*0.12, cy+sz*0.1, cx, cy+sz*0.15);
      ctx.bezierCurveTo(cx-sz*0.12, cy+sz*0.1, cx-sz*0.18, cy-sz*0.15, cx, cy-sz*0.45);
      ctx.fill();
      // glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz*0.7);
      glow.addColorStop(0, 'rgba(255,180,30,0.18)');
      glow.addColorStop(1, 'rgba(255,180,30,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.7, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    },
  },
  {
    id: 'sun',
    emoji: '☀️',
    name: 'Sun',
    nameH: 'सूरज',
    desc: 'Radiant and warm',
    descH: 'चमकता सूरज',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // rays
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const inner = sz * 0.38, outer = sz * 0.62 + (i%2)*sz*0.08;
        ctx.strokeStyle = `rgba(255,210,50,${0.7+0.3*(i%2)})`;
        ctx.lineWidth = sz*0.07;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(angle)*inner, cy+Math.sin(angle)*inner);
        ctx.lineTo(cx+Math.cos(angle)*outer, cy+Math.sin(angle)*outer);
        ctx.stroke();
      }
      // disk
      const sg = ctx.createRadialGradient(cx-sz*0.1, cy-sz*0.1, 0, cx, cy, sz*0.35);
      sg.addColorStop(0, '#fff7a0'); sg.addColorStop(1, '#f5a800');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.34, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    },
  },
  {
    id: 'lotus',
    emoji: '🪷',
    name: 'Lotus',
    nameH: 'कमल',
    desc: 'Rising from still water',
    descH: 'शांत जल से उगता',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      const petalColors = ['#e8a0b4','#d4708a','#f0bcc8','#c85878','#eaaabb'];
      // outer petals
      for (let i = 0; i < 6; i++) {
        const angle = (i/6)*Math.PI*2 - Math.PI/2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -sz*0.35, sz*0.14, sz*0.32, 0, 0, Math.PI*2);
        ctx.fillStyle = petalColors[i%petalColors.length]+'cc'; ctx.fill();
        ctx.restore();
      }
      // inner petals
      for (let i = 0; i < 5; i++) {
        const angle = (i/5)*Math.PI*2 - Math.PI/4;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -sz*0.22, sz*0.10, sz*0.22, 0, 0, Math.PI*2);
        ctx.fillStyle = '#f5d0dc'; ctx.fill();
        ctx.restore();
      }
      // center
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.12, 0, Math.PI*2);
      ctx.fillStyle = '#f5e040'; ctx.fill();
      // stem
      ctx.strokeStyle = '#5a9a4a'; ctx.lineWidth = sz*0.06; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx, cy+sz*0.12); ctx.lineTo(cx, cy+sz*0.52); ctx.stroke();
      // leaf
      ctx.beginPath();
      ctx.ellipse(cx+sz*0.22, cy+sz*0.38, sz*0.18, sz*0.1, -0.5, 0, Math.PI*2);
      ctx.fillStyle = '#5a9a4a88'; ctx.fill();
      ctx.restore();
    },
  },
  {
    id: 'firefly',
    emoji: '✨',
    name: 'Firefly',
    nameH: 'जुगनू',
    desc: 'A tiny light in the dark',
    descH: 'अंधेरे में रोशनी',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // multiple fireflies
      const flies = [
        {dx:0,    dy:0,    r:sz*0.06, op:1.0},
        {dx:sz*0.35,  dy:-sz*0.28, r:sz*0.04, op:0.75},
        {dx:-sz*0.32, dy:-sz*0.18, r:sz*0.035,op:0.65},
        {dx:sz*0.18,  dy:sz*0.32,  r:sz*0.04, op:0.55},
        {dx:-sz*0.22, dy:sz*0.22,  r:sz*0.03, op:0.45},
      ];
      flies.forEach(f => {
        // glow halo
        const g = ctx.createRadialGradient(cx+f.dx, cy+f.dy, 0, cx+f.dx, cy+f.dy, f.r*4);
        g.addColorStop(0, `rgba(180,255,120,${f.op*0.4})`);
        g.addColorStop(1, 'rgba(180,255,120,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx+f.dx, cy+f.dy, f.r*4, 0, Math.PI*2); ctx.fill();
        // body
        ctx.fillStyle = `rgba(200,255,140,${f.op})`;
        ctx.beginPath(); ctx.arc(cx+f.dx, cy+f.dy, f.r, 0, Math.PI*2); ctx.fill();
        // wings hint
        ctx.strokeStyle = `rgba(200,255,200,${f.op*0.4})`;
        ctx.lineWidth = f.r*0.5;
        ctx.beginPath();
        ctx.ellipse(cx+f.dx-f.r*1.5, cy+f.dy-f.r*0.5, f.r*1.2, f.r*0.6, -0.4, 0, Math.PI*2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx+f.dx+f.r*1.5, cy+f.dy-f.r*0.5, f.r*1.2, f.r*0.6, 0.4, 0, Math.PI*2);
        ctx.stroke();
      });
      ctx.restore();
    },
  },
  {
    id: 'paperboat',
    emoji: '⛵',
    name: 'Paper Boat',
    nameH: 'कागज़ी नाव',
    desc: 'Something sent, something hopeful',
    descH: 'उम्मीद की नाव',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // water ripple
      for (let i = 1; i <= 3; i++) {
        ctx.strokeStyle = `rgba(100,180,220,${0.25-i*0.06})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy+sz*0.38, sz*(0.45+i*0.12), sz*0.08, 0, 0, Math.PI*2);
        ctx.stroke();
      }
      // boat hull
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.moveTo(cx-sz*0.45, cy+sz*0.22);
      ctx.quadraticCurveTo(cx-sz*0.48, cy+sz*0.38, cx, cy+sz*0.42);
      ctx.quadraticCurveTo(cx+sz*0.48, cy+sz*0.38, cx+sz*0.45, cy+sz*0.22);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ccc'; ctx.lineWidth=1; ctx.stroke();
      // sail — left triangle
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.moveTo(cx-sz*0.04, cy+sz*0.22);
      ctx.lineTo(cx-sz*0.04, cy-sz*0.32);
      ctx.lineTo(cx-sz*0.38, cy+sz*0.22);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#ddd';ctx.lineWidth=1;ctx.stroke();
      // sail — right triangle
      ctx.fillStyle = '#efefef';
      ctx.beginPath();
      ctx.moveTo(cx+sz*0.04, cy+sz*0.22);
      ctx.lineTo(cx+sz*0.04, cy-sz*0.28);
      ctx.lineTo(cx+sz*0.34, cy+sz*0.22);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#ddd';ctx.lineWidth=1;ctx.stroke();
      // mast
      ctx.strokeStyle='#aaa'; ctx.lineWidth=sz*0.04; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx, cy+sz*0.22); ctx.lineTo(cx, cy-sz*0.36); ctx.stroke();
      ctx.restore();
    },
  },
  {
    id: 'marigold',
    emoji: '🌼',
    name: 'Marigold',
    nameH: 'गेंदा',
    desc: 'The flower of every celebration',
    descH: 'हर उत्सव का फूल',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // petals — outer ring
      for (let i = 0; i < 16; i++) {
        const angle = (i/16)*Math.PI*2;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -sz*0.33, sz*0.1, sz*0.2, 0, 0, Math.PI*2);
        ctx.fillStyle = i%2===0 ? '#f5a800dd' : '#f07800cc'; ctx.fill();
        ctx.restore();
      }
      // petals — inner ring
      for (let i = 0; i < 10; i++) {
        const angle = (i/10)*Math.PI*2 + Math.PI/10;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -sz*0.2, sz*0.09, sz*0.15, 0, 0, Math.PI*2);
        ctx.fillStyle = '#ffcc20dd'; ctx.fill();
        ctx.restore();
      }
      // center
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz*0.14);
      cg.addColorStop(0, '#7a4200'); cg.addColorStop(1, '#c87000');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.14, 0, Math.PI*2); ctx.fill();
      // stem
      ctx.strokeStyle='#5a9a4a'; ctx.lineWidth=sz*0.07; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx, cy+sz*0.14); ctx.lineTo(cx, cy+sz*0.52); ctx.stroke();
      ctx.restore();
    },
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    name: 'Butterfly',
    nameH: 'तितली',
    desc: 'Lightness and transformation',
    descH: 'हल्कापन और बदलाव',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // upper wings
      const uw = (col, flip) => {
        ctx.save();
        ctx.translate(cx, cy);
        if (flip) ctx.scale(-1,1);
        const g = ctx.createRadialGradient(sz*0.2, -sz*0.1, 0, sz*0.2, -sz*0.1, sz*0.4);
        g.addColorStop(0, col+'ee'); g.addColorStop(1, col+'44');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sz*0.1,-sz*0.45, sz*0.52,-sz*0.42, sz*0.48,-sz*0.08);
        ctx.bezierCurveTo(sz*0.44, sz*0.12, sz*0.1, sz*0.08, 0, 0);
        ctx.fill();
        ctx.restore();
      };
      uw('#6a4ac8', false); uw('#6a4ac8', true);
      // lower wings
      const lw = (col, flip) => {
        ctx.save(); ctx.translate(cx, cy);
        if (flip) ctx.scale(-1,1);
        ctx.fillStyle = col+'bb';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sz*0.08, sz*0.12, sz*0.38, sz*0.38, sz*0.28, sz*0.35);
        ctx.bezierCurveTo(sz*0.18, sz*0.38, sz*0.02, sz*0.28, 0, 0);
        ctx.fill();
        ctx.restore();
      };
      lw('#9060e0', false); lw('#9060e0', true);
      // spots
      [[sz*0.28,-sz*0.22],[sz*0.18,-sz*0.08],[-sz*0.28,-sz*0.22],[-sz*0.18,-sz*0.08]].forEach(([dx,dy])=>{
        ctx.beginPath(); ctx.arc(cx+dx,cy+dy,sz*0.04,0,Math.PI*2);
        ctx.fillStyle='rgba(255,220,120,0.7)'; ctx.fill();
      });
      // body
      ctx.fillStyle='#2a1a3a';
      ctx.beginPath(); ctx.ellipse(cx, cy, sz*0.04, sz*0.28, 0, 0, Math.PI*2); ctx.fill();
      // antennae
      ctx.strokeStyle='#2a1a3a'; ctx.lineWidth=sz*0.025; ctx.lineCap='round';
      [[-0.18,-0.5],[0.18,-0.5]].forEach(([dx,dy])=>{
        ctx.beginPath(); ctx.moveTo(cx,cy-sz*0.22); ctx.quadraticCurveTo(cx+dx*sz*1.2,cy+dy*sz*0.7,cx+dx*sz,cy+dy*sz); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx+dx*sz,cy+dy*sz,sz*0.035,0,Math.PI*2); ctx.fillStyle='#2a1a3a'; ctx.fill();
      });
      ctx.restore();
    },
  },
  {
    id: 'moon',
    emoji: '🌙',
    name: 'Crescent Moon',
    nameH: 'चाँद',
    desc: 'Quiet nocturnal peace',
    descH: 'रात की शांति',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // glow
      const mg = ctx.createRadialGradient(cx, cy, sz*0.2, cx, cy, sz*0.65);
      mg.addColorStop(0,'rgba(255,248,200,0.18)'); mg.addColorStop(1,'rgba(255,248,200,0)');
      ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(cx,cy,sz*0.65,0,Math.PI*2); ctx.fill();
      // crescent
      ctx.fillStyle='#fff8d0';
      ctx.beginPath(); ctx.arc(cx,cy,sz*0.38,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0a0a18';
      ctx.beginPath(); ctx.arc(cx+sz*0.16,cy-sz*0.08,sz*0.30,0,Math.PI*2); ctx.fill();
      // stars nearby
      [[sz*0.5,-sz*0.35],[sz*0.42,-sz*0.08],[sz*0.28,-sz*0.5]].forEach(([dx,dy],i)=>{
        const r=sz*0.035-i*sz*0.007;
        ctx.fillStyle=`rgba(255,248,180,${0.9-i*0.2})`;
        ctx.beginPath(); ctx.arc(cx+dx,cy+dy,r,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    },
  },
  {
    id: 'peacock',
    emoji: '🦚',
    name: 'Peacock',
    nameH: 'मोर',
    desc: 'Pride and color',
    descH: 'रंग और शान',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // tail feathers — fan
      const featherCols = ['#1a9a50','#0a7acc','#8a44cc','#1a9a50','#0a7acc'];
      for (let i = 0; i < 9; i++) {
        const angle = -Math.PI*0.6 + (i/8)*Math.PI*1.2;
        const ex = cx + Math.cos(angle)*sz*0.55;
        const ey = cy + Math.sin(angle)*sz*0.55 + sz*0.1;
        ctx.strokeStyle = featherCols[i%5]+'cc';
        ctx.lineWidth = sz*0.05;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(cx, cy+sz*0.15);
        ctx.quadraticCurveTo(
          cx + Math.cos(angle)*sz*0.3, cy + Math.sin(angle)*sz*0.3 + sz*0.05,
          ex, ey
        );
        ctx.stroke();
        // eye spot
        ctx.beginPath(); ctx.arc(ex,ey,sz*0.065,0,Math.PI*2);
        ctx.fillStyle=featherCols[i%5]+'99'; ctx.fill();
        ctx.beginPath(); ctx.arc(ex,ey,sz*0.035,0,Math.PI*2);
        ctx.fillStyle='#0a2a4a'; ctx.fill();
        ctx.beginPath(); ctx.arc(ex,ey,sz*0.015,0,Math.PI*2);
        ctx.fillStyle='rgba(100,200,255,0.8)'; ctx.fill();
      }
      // body
      const bg = ctx.createRadialGradient(cx, cy+sz*0.08, 0, cx, cy+sz*0.08, sz*0.22);
      bg.addColorStop(0,'#2ab870'); bg.addColorStop(1,'#0a6a40');
      ctx.fillStyle=bg;
      ctx.beginPath(); ctx.ellipse(cx, cy+sz*0.1, sz*0.14, sz*0.22, 0, 0, Math.PI*2); ctx.fill();
      // neck
      ctx.fillStyle='#1a8860';
      ctx.beginPath(); ctx.ellipse(cx, cy-sz*0.12, sz*0.07, sz*0.18, 0, 0, Math.PI*2); ctx.fill();
      // head
      ctx.fillStyle='#1a9870';
      ctx.beginPath(); ctx.arc(cx, cy-sz*0.28, sz*0.09, 0, Math.PI*2); ctx.fill();
      // crest
      for (let i=0;i<3;i++){
        const a=-Math.PI/2+(-0.3+i*0.3);
        ctx.strokeStyle='#22cc88'; ctx.lineWidth=sz*0.025;
        ctx.beginPath();
        ctx.moveTo(cx,cy-sz*0.34);
        ctx.lineTo(cx+Math.cos(a)*sz*0.12, cy-sz*0.34+Math.sin(a)*sz*0.14);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*sz*0.12, cy-sz*0.34+Math.sin(a)*sz*0.14, sz*0.025,0,Math.PI*2);
        ctx.fillStyle='#22cc88'; ctx.fill();
      }
      // eye
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.arc(cx+sz*0.04, cy-sz*0.29, sz*0.028,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#000';
      ctx.beginPath(); ctx.arc(cx+sz*0.042, cy-sz*0.29, sz*0.014,0,Math.PI*2); ctx.fill();
      ctx.restore();
    },
  },
  {
    id: 'raincloud',
    emoji: '🌧️',
    name: 'Rain Cloud',
    nameH: 'बारिश',
    desc: 'Your storm is seen too',
    descH: 'तुम्हारा दर्द भी जाना है',
    draw: (ctx, cx, cy, sz) => {
      ctx.save();
      // rain drops
      const drops = [
        {dx:-sz*0.28,dy:sz*0.28},{dx:-sz*0.1,dy:sz*0.38},{dx:sz*0.08,dy:sz*0.28},
        {dx:sz*0.26,dy:sz*0.38},{dx:-sz*0.18,dy:sz*0.5},{dx:sz*0.16,dy:sz*0.5},
      ];
      drops.forEach(d=>{
        ctx.strokeStyle='rgba(100,160,220,0.7)'; ctx.lineWidth=sz*0.04; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(cx+d.dx,cy+d.dy); ctx.lineTo(cx+d.dx-sz*0.03,cy+d.dy+sz*0.14); ctx.stroke();
      });
      // cloud puffs
      const puffs=[{dx:-sz*0.22,dy:0,r:sz*0.2},{dx:0,dy:-sz*0.1,r:sz*0.26},{dx:sz*0.22,dy:0,r:sz*0.2},{dx:-sz*0.38,dy:sz*0.08,r:sz*0.16},{dx:sz*0.38,dy:sz*0.08,r:sz*0.16}];
      puffs.forEach(p=>{
        ctx.fillStyle='rgba(180,200,220,0.88)';
        ctx.beginPath(); ctx.arc(cx+p.dx,cy+p.dy,p.r,0,Math.PI*2); ctx.fill();
      });
      // cloud base flat
      ctx.fillStyle='rgba(160,185,210,0.82)';
      ctx.fillRect(cx-sz*0.52, cy+sz*0.04, sz*1.04, sz*0.2);
      ctx.restore();
    },
  },
];

// ─── CHARACTER DROPDOWN ────────────────────────────────────────────────────────
function CharacterPicker({ selected, onSelect, T, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hi = lang === 'Hindi';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, []);

  const sel = CHARACTERS.find(c => c.id === selected);

  return (
    <div ref={ref} style={{ position:'relative', zIndex:20 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:8,
          background: open ? `${T.accent}20` : T.surface,
          border:`1px solid ${open ? T.accent+'60' : T.border}`,
          borderRadius:12, padding:'9px 14px',
          color:T.text, fontSize:13, cursor:'pointer',
          transition:'all 0.2s', width:'100%',
        }}
      >
        <span style={{fontSize:18}}>{sel ? sel.emoji : '✨'}</span>
        <div style={{flex:1, textAlign:'left'}}>
          <div style={{fontSize:13, color:T.text, fontWeight:500}}>
            {sel ? (hi ? sel.nameH : sel.name) : (hi ? 'एक चरित्र चुनें' : 'Add a character')}
          </div>
          {sel && <div style={{fontSize:11, color:T.muted}}>{hi ? sel.descH : sel.desc}</div>}
        </div>
        <span style={{fontSize:11, color:T.muted, transform:open?'rotate(180deg)':'none', transition:'0.2s'}}>▼</span>
      </button>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
          background:T.surface, border:`1px solid ${T.border}`,
          borderRadius:14, overflow:'hidden',
          boxShadow:`0 8px 32px rgba(0,0,0,0.18)`,
          maxHeight:320, overflowY:'auto',
        }}>
          {/* None option */}
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              background: !selected ? `${T.accent}12` : 'transparent',
              border:'none', borderBottom:`1px solid ${T.border}`,
              padding:'10px 14px', cursor:'pointer', textAlign:'left',
            }}
          >
            <span style={{fontSize:18, opacity:0.4}}>○</span>
            <div>
              <div style={{fontSize:13, color:T.muted}}>{hi ? 'कोई नहीं' : 'None'}</div>
            </div>
          </button>
          {CHARACTERS.map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c.id); setOpen(false); }}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:10,
                background: selected===c.id ? `${T.accent}12` : 'transparent',
                border:'none', borderBottom:`1px solid ${T.border}20`,
                padding:'10px 14px', cursor:'pointer', textAlign:'left',
                transition:'background 0.15s',
              }}
            >
              <span style={{fontSize:22}}>{c.emoji}</span>
              <div>
                <div style={{fontSize:13, color:T.text, fontWeight:selected===c.id?600:400}}>
                  {hi ? c.nameH : c.name}
                </div>
                <div style={{fontSize:11, color:T.muted}}>{hi ? c.descH : c.desc}</div>
              </div>
              {selected===c.id && <span style={{marginLeft:'auto', color:T.accent, fontSize:14}}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WARMTH IMAGE GENERATOR ───────────────────────────────────────────────────
const generateWarmthImage = (recipient, sender, lang, characterId) => new Promise((resolve) => {
  const W = 800, H = 800;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const CIRCLES_DEF = [
    { color:'#C88A8E', r:60  },
    { color:'#D4A373', r:120 },
    { color:'#7A9EA8', r:180 },
    { color:'#8aaa7a', r:240 },
    { color:'#726FBA', r:300 },
  ];

  // Background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 320);
  glow.addColorStop(0, 'rgba(212,163,115,0.12)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Metta circles
  [...CIRCLES_DEF].reverse().forEach(c => {
    ctx.beginPath();
    ctx.arc(W/2, H/2+30, c.r, 0, Math.PI*2);
    ctx.strokeStyle = c.color+'70'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle = c.color+'10'; ctx.fill();
  });

  // Heart center
  const cx = W/2, cy = H/2+30;
  ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2);
  ctx.fillStyle='#C88A8E50'; ctx.fill();
  ctx.strokeStyle='#C88A8E'; ctx.lineWidth=2; ctx.stroke();
  ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#fff'; ctx.fillText('🫀', cx, cy);

  // Branding
  ctx.font='500 15px sans-serif'; ctx.fillStyle='#ffffff40'; ctx.textAlign='center';
  ctx.fillText('JSukoon  •  jsukoon.vercel.app', W/2, 42);

  // Recipient
  const displayName = recipient || (lang==='Hindi'?'आपको':'You');
  ctx.font='300 52px Georgia, serif'; ctx.fillStyle='#D4A373'; ctx.textAlign='center';
  ctx.fillText(displayName, W/2, 118);

  const msg = lang==='Hindi'?'को प्रेम, शांति और सुख मिले।':'May you be at peace. May you be well.';
  ctx.font='italic 22px Georgia, serif'; ctx.fillStyle='#ffffff90';
  ctx.fillText(msg, W/2, 158);

  // Sender
  ctx.font='16px sans-serif'; ctx.fillStyle='#ffffff50';
  const fromText = sender
    ? (lang==='Hindi'?`— ${sender} की ओर से 💛`:`— with love from ${sender} 💛`)
    : '— from JSukoon 💛';
  ctx.fillText(fromText, W/2, H-52);

  // Border
  ctx.strokeStyle='#D4A37340'; ctx.lineWidth=1;
  ctx.strokeRect(24,24,W-48,H-48);

  // ── Character illustration ─────────────────────────────────────────────────
  if (characterId) {
    const char = CHARACTERS.find(c => c.id === characterId);
    if (char && char.draw) {
      // Place character in bottom-right area, clear of text
      const charCX = W * 0.82;
      const charCY = H * 0.72;
      const charSZ = 58; // size units
      char.draw(ctx, charCX, charCY, charSZ);
    }
  }

  canvas.toBlob(blob => resolve(blob), 'image/png');
});

// ─── METTA CIRCLES COMPONENT ──────────────────────────────────────────────────
function MettaCircles({ T, lang }) {
  const [step, setStep]               = useState(0);
  const [sent, setSent]               = useState([]);
  const [done, setDone]               = useState(false);
  const [glowing, setGlowing]         = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName]   = useState('');
  const [characterId, setCharacterId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob]     = useState(null);
  const [audioURL, setAudioURL]       = useState(null);
  const [imageURL, setImageURL]       = useState(null);
  const [shared, setShared]           = useState(false);
  const [shareError, setShareError]   = useState('');
  const [micBlocked, setMicBlocked]   = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const hi = lang === 'Hindi';

  const getBestMime = () => {
    const types = isMobile
      ? ['audio/ogg;codecs=opus','audio/mp4','audio/webm;codecs=opus','audio/webm']
      : ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

  const CIRCLES = [
    { label:hi?'स्वयं':'Yourself',       sub:hi?'केंद्र से शुरू करें':'Start at the center',   color:'#C88A8E', r:30 },
    { label:hi?'प्रिय लोग':'Loved ones', sub:hi?'जो आपके करीब हैं':'Those closest to you',     color:'#D4A373', r:60 },
    { label:hi?'परिचित':'Acquaintances', sub:hi?'जिन्हें आप जानते हैं':'People you know',       color:'#7A9EA8', r:90 },
    { label:hi?'अजनबी':'Strangers',      sub:hi?'अनजान लोग':'Those you have never met',         color:'#8aaa7a', r:120 },
    { label:hi?'कठिन लोग':'Difficult ones',sub:hi?'जो कठिन लगते हैं':'Those who challenge you', color:'#726FBA', r:150 },
  ];

  const startRecording = async () => {
    setMicBlocked(false); setShareError('');
    try {
      if (navigator.permissions) {
        const perm = await navigator.permissions.query({ name:'microphone' });
        if (perm.state === 'denied') { setMicBlocked(true); return; }
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      chunksRef.current = [];
      const mime = getBestMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType:mime } : {});
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size>0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t=>t.stop());
        const finalMime = mr.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type:finalMime });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      mr.start(); setIsRecording(true);
    } catch(e) {
      if (e.name==='NotAllowedError') setMicBlocked(true);
      else setShareError(hi?'माइक्रोफ़ोन उपलब्ध नहीं।':'Microphone unavailable.');
    }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const shareWarmth = async () => {
    setShareError('');
    const recipient = recipientName.trim() || (hi?'आपको':'you');
    const sender    = senderName.trim();
    const fromPart  = sender
      ? (hi?` — ${sender} की ओर से`:` — with love from ${sender}`)
      : (hi?' — JSukoon से':' — from JSukoon');
    const text = hi
      ? `💛 ${recipient} के लिए गर्माहट का संदेश${fromPart}\n\n✨ JSukoon से भेजा गया — jsukoon.vercel.app पर आएं`
      : `💛 A message of warmth for ${recipient}${fromPart}\n\n✨ Sent with JSukoon — find your sukoon at jsukoon.vercel.app`;

    const safeRecipient = recipient.replace(/[^a-zA-Z0-9]/g,'-').slice(0,30);
    const imgBlob = await generateWarmthImage(recipient, sender, lang, characterId);
    const imgURL  = URL.createObjectURL(imgBlob);
    setImageURL(imgURL);
    const imgFile = new File([imgBlob], `warmth-for-${safeRecipient}.png`, { type:'image/png' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files:[imgFile] })) {
      try {
        await navigator.share({ files:[imgFile], text });
        setShared(true); return;
      } catch(e) { if (e.name==='AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = imgURL; a.download = `warmth-for-${safeRecipient}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setShared(true);
  };

  const sendWarmth = () => {
    setGlowing(true);
    if (navigator.vibrate) navigator.vibrate([30,60,30]);
    setTimeout(() => {
      setGlowing(false);
      setSent(p => [...p, step]);
      if (step < CIRCLES.length-1) setStep(s=>s+1);
      else { setDone(true); creditSession(4); creditMetta(); }
    }, 800);
  };

  const reset = () => {
    setStep(0); setSent([]); setDone(false); setGlowing(false);
    setRecipientName(''); setSenderName(''); setCharacterId(null);
    setAudioBlob(null); setAudioURL(null); setImageURL(null);
    setShared(false); setShareError(''); setMicBlocked(false);
  };

  const current = CIRCLES[step];

  // ── DONE SCREEN ─────────────────────────────────────────────────────────────
  if (done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:'32px 20px', textAlign:'center' }}>
      <span style={{ fontSize:48, display:'block', marginBottom:16 }}>💛</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>
        {hi?'गर्माहट फैल गई।':'Warmth has spread.'}
      </h3>
      <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.7, margin:'0 auto 24px', maxWidth:260 }}>
        {hi?'आपने खुद से शुरू करके सबको प्रेम दिया। यह साहस है।':'You sent warmth from yourself outward to all. That is courage.'}
      </p>

      <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:16, padding:'18px', marginBottom:20, textAlign:'left' }}>
        <p style={{ fontSize:11, color:T.accent, letterSpacing:1.5, textTransform:'uppercase', margin:'0 0 14px', fontWeight:500 }}>
          💛 {hi?'किसी को भेजें':'Send to someone'}
        </p>

        {/* Recipient + Sender */}
        <input value={recipientName} onChange={e=>setRecipientName(e.target.value)}
          placeholder={hi?'किसे भेजना है? नाम या रिश्ता…':'Who is this for? (e.g. Mum, best friend)'}
          style={{ width:'100%', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', color:T.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif", marginBottom:8, boxSizing:'border-box' }}
        />
        <input value={senderName} onChange={e=>setSenderName(e.target.value)}
          placeholder={hi?'आपका नाम (वैकल्पिक)':'Your name (optional)'}
          style={{ width:'100%', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', color:T.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif", marginBottom:12, boxSizing:'border-box' }}
        />

        {/* Character picker */}
        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:11, color:T.muted, margin:'0 0 6px', letterSpacing:0.5 }}>
            {hi?'✦ चित्र में एक चरित्र जोड़ें':'✦ Add a character to the image'}
          </p>
          <CharacterPicker selected={characterId} onSelect={setCharacterId} T={T} lang={lang} />
        </div>

        {/* Image preview */}
        {imageURL && (
          <div style={{ marginBottom:12, borderRadius:10, overflow:'hidden', border:`1px solid ${T.border}` }}>
            <img src={imageURL} alt="warmth" style={{ width:'100%', display:'block' }} />
          </div>
        )}

        {/* Mic blocked */}
        {micBlocked ? (
          <div style={{ background:'rgba(224,102,102,0.1)', border:'1px solid #e0666640', borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
            <p style={{ fontSize:13, color:'#e06666', margin:0, lineHeight:1.6 }}>
              {hi?'माइक्रोफ़ोन की अनुमति नहीं है। ब्राउज़र के address bar में 🔒 पर क्लिक करें।':'Microphone blocked. Click 🔒 in your browser address bar to allow.'}
            </p>
          </div>
        ) : (
          <button onClick={isRecording?stopRecording:startRecording}
            style={{ width:'100%', background:isRecording?'rgba(224,102,102,0.15)':T.surface, border:`1px solid ${isRecording?'#e06666':T.border}`, borderRadius:12, padding:'11px', color:isRecording?'#e06666':T.textSoft, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:audioURL?10:12, boxSizing:'border-box', cursor:'pointer' }}>
            {isRecording ? `🛑 ${hi?'रिकॉर्डिंग रोकें':'Stop recording'}`
              : audioURL  ? `🔄 ${hi?'फिर से रिकॉर्ड करें':'Re-record message'}`
              :             `🎙️ ${hi?'आवाज़ में संदेश रिकॉर्ड करें':'Record a voice message'}`}
          </button>
        )}

        {audioURL && (
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:11, color:T.muted, margin:'0 0 6px' }}>{hi?'सुनें:':'Preview:'}</p>
            <audio controls src={audioURL} style={{ width:'100%', height:36 }} />
          </div>
        )}

        {shareError && <p style={{ fontSize:12, color:'#e06666', margin:'0 0 8px', textAlign:'center' }}>{shareError}</p>}

        <button onClick={shareWarmth}
          style={{ width:'100%', background:`${T.accent}18`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:14, fontWeight:500, padding:'12px', borderRadius:12, boxSizing:'border-box', cursor:'pointer' }}>
          {shared
            ? (hi?'✓ भेज दिया / डाउनलोड हुआ':'✓ Shared / Downloaded!')
            : (hi?'💛 गर्माहट साझा करें':'💛 Share this warmth')}
        </button>

        {shared && (
          <p style={{ fontSize:11, color:T.muted, textAlign:'center', marginTop:8, lineHeight:1.6 }}>
            {isMobile
              ? (hi?'📱 WhatsApp से भेजें।':'📱 Choose WhatsApp from the share sheet.')
              : (hi?'💻 WhatsApp Web खोलें → अटैचमेंट → फ़ाइल चुनें।':'💻 Open WhatsApp Web → attachment → choose the file.')}
          </p>
        )}
      </div>

      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:'10px 28px', borderRadius:99, cursor:'pointer' }}>
        {hi?'फिर से करें':'Begin again'}
      </button>
    </div>
  );

  // ── RITUAL SCREEN ────────────────────────────────────────────────────────────
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:'24px 20px' }}>
      {step === 1 && (
        <div style={{ marginBottom:16 }}>
          <input value={recipientName} onChange={e=>setRecipientName(e.target.value)}
            placeholder={hi?'किसका नाम सोच रहे हैं? (वैकल्पिक)':'Who are you thinking of? (optional)'}
            style={{ width:'100%', background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', color:T.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box' }}
          />
        </div>
      )}

      {/* Circles visualisation */}
      <div style={{ position:'relative', height:180, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        {[...CIRCLES].reverse().map((c,i)=>{
          const idx=CIRCLES.length-1-i;
          const isSent=sent.includes(idx), isCurr=idx===step;
          return (
            <div key={i} style={{ position:'absolute', width:c.r*2, height:c.r*2, borderRadius:'50%', border:`1.5px solid ${isSent||isCurr?c.color+'80':T.border}`, background:isSent?`${c.color}12`:'transparent', transition:'all 0.6s ease', boxShadow:isCurr&&glowing?`0 0 20px ${c.color}50`:'none' }} />
          );
        })}
        <div style={{ position:'absolute', width:30, height:30, borderRadius:'50%', background:`${CIRCLES[0].color}40`, border:`2px solid ${CIRCLES[0].color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🫀</div>
      </div>

      {/* Current ring label */}
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <p style={{ fontSize:12, color:T.textSoft, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>
          {hi?'अभी भेजें':'Sending warmth to'}
        </p>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:current.color, fontWeight:400, marginBottom:4 }}>
          {step===1&&recipientName.trim()?recipientName.trim():current.label}
        </h3>
        <p style={{ fontSize:12, color:T.muted }}>{current.sub}</p>
      </div>

      {/* Mantra */}
      <div style={{ background:T.surfaceAlt, borderRadius:14, padding:'12px 16px', marginBottom:20, textAlign:'center' }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:14, color:T.textSoft, lineHeight:1.7, margin:0 }}>
          {hi
            ? `"${step===1&&recipientName.trim()?recipientName.trim():current.label} को प्रेम, शांति और सुख मिले।"`
            : `"May ${step===1&&recipientName.trim()?recipientName.trim():current.label.toLowerCase()} be at peace. May they be well."`}
        </p>
      </div>

      {/* Send button */}
      <button onClick={sendWarmth}
        style={{ width:'100%', background:glowing?`${current.color}35`:`${current.color}18`, border:`1px solid ${current.color}50`, color:current.color, fontSize:14, fontWeight:500, padding:'13px', borderRadius:14, transition:'all 0.3s ease', boxShadow:glowing?`0 0 20px ${current.color}40`:'none', cursor:'pointer' }}>
        {glowing?(hi?'भेज रहे हैं…':'Sending…'):(hi?'गर्माहट भेजें 💛':'Send Warmth 💛')}
      </button>
      <p style={{ fontSize:12, color:T.textSoft, textAlign:'center', marginTop:10, letterSpacing:1, textTransform:'uppercase', opacity:.6 }}>
        {hi?`${step+1} / ${CIRCLES.length}`:`${step+1} of ${CIRCLES.length}`}
      </p>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function WarmthPage({ setTab, goBack, T, lang }) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:T.bg, overflow:'hidden' }}>
      <PageNav onBack={goBack||(()=>setTab('home'))} onHome={()=>setTab('home')} backLabel={lang==='Hindi'?'वापस':'Back'} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:'auto', padding:'0 0 60px' }}>
        <div style={{ padding:'16px 18px' }}>
          <MettaCircles T={T} lang={lang} />
        </div>
      </div>
    </div>
  );
}

export default WarmthPage;
