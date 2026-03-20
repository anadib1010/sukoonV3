import React, { useState, useRef, useEffect } from 'react';
import { PageNav } from '../../components/SharedUI';
import { creditSession } from '../../utils/activity';

const creditMetta = () => {
  try {
    const count = parseInt(localStorage.getItem('jsukoon_metta_count') || '0');
    localStorage.setItem('jsukoon_metta_count', (count + 1).toString());
  } catch {}
};

// ─── 10 COLOR PALETTES ────────────────────────────────────────────────────────
const PALETTES = [
  { id:'rose',      name:'Rose',      nameH:'गुलाबी',    rings:['#C88A8E','#d4a0a4','#e0b8bc','#ecd0d2','#f5e8e8'], bg:'#0f0608', accent:'#C88A8E' },
  { id:'gold',      name:'Gold',      nameH:'सुनहरा',    rings:['#D4A373','#ddb88a','#e6cba0','#efdcb8','#f7eed8'], bg:'#0a0802', accent:'#D4A373' },
  { id:'teal',      name:'Teal',      nameH:'नीला-हरा',  rings:['#7A9EA8','#8fb2bc','#a4c4cc','#bad6dc','#d0e8ec'], bg:'#020a0c', accent:'#7A9EA8' },
  { id:'sage',      name:'Sage',      nameH:'हरा',       rings:['#8aaa7a','#9ebb8c','#b2cc9e','#c6ddb0','#daeec2'], bg:'#030802', accent:'#8aaa7a' },
  { id:'violet',    name:'Violet',    nameH:'बैंगनी',    rings:['#726FBA','#8886c8','#9e9cd4','#b4b2e0','#cac8ec'], bg:'#040208', accent:'#726FBA' },
  { id:'peach',     name:'Peach',     nameH:'आड़ू',      rings:['#E8A090','#eeB4a4','#f4c8b8','#f8d8cc','#fce8e0'], bg:'#0c0604', accent:'#E8A090' },
  { id:'sky',       name:'Sky',       nameH:'आसमानी',    rings:['#6aacdc','#82bce4','#9acaec','#b2d8f4','#cae8fa'], bg:'#02060c', accent:'#6aacdc' },
  { id:'lavender',  name:'Lavender',  nameH:'लैवेंडर',   rings:['#B09AC8','#c0aeD4','#d0c2de','#e0d6e8','#f0eaf4'], bg:'#070408', accent:'#B09AC8' },
  { id:'amber',     name:'Amber',     nameH:'अंबर',      rings:['#E8B840','#eec860','#f4d880','#f8e8a0','#fcf4c0'], bg:'#0a0800', accent:'#E8B840' },
  { id:'blush',     name:'Blush',     nameH:'ब्लश',      rings:['#D4889C','#dc9cae','#e4b0c0','#ecc4d2','#f4d8e4'], bg:'#0a0408', accent:'#D4889C' },
];

// ─── 10 CHARACTERS ────────────────────────────────────────────────────────────
const CHARACTERS = [
  {
    id:'diya', emoji:'🪔', name:'Diya', nameH:'दीया',
    desc:'A glowing oil lamp', descH:'जलता हुआ दीपक',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      const halo = ctx.createRadialGradient(cx, cy, sz*0.1, cx, cy, sz*0.85);
      halo.addColorStop(0,'rgba(255,180,30,0.28)'); halo.addColorStop(1,'rgba(255,180,30,0)');
      ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(cx,cy,sz*0.85,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx,cy+sz*0.32,sz*0.52,sz*0.2,0,0,Math.PI*2);
      ctx.fillStyle='#b8740a'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx,cy+sz*0.28,sz*0.46,sz*0.15,0,0,Math.PI*2);
      ctx.fillStyle='#d9920e'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx,cy+sz*0.22,sz*0.28,sz*0.08,0,0,Math.PI*2);
      ctx.fillStyle='#e8a820'; ctx.fill();
      const flameG = ctx.createRadialGradient(cx,cy-sz*0.08,sz*0.04,cx,cy-sz*0.08,sz*0.38);
      flameG.addColorStop(0,'rgba(255,255,200,1)');
      flameG.addColorStop(0.3,'rgba(255,180,30,0.9)');
      flameG.addColorStop(0.7,'rgba(255,80,0,0.6)');
      flameG.addColorStop(1,'rgba(255,80,0,0)');
      ctx.fillStyle=flameG;
      ctx.beginPath();
      ctx.moveTo(cx,cy-sz*0.52);
      ctx.bezierCurveTo(cx+sz*0.16,cy-sz*0.2,cx+sz*0.14,cy+sz*0.08,cx,cy+sz*0.14);
      ctx.bezierCurveTo(cx-sz*0.14,cy+sz*0.08,cx-sz*0.16,cy-sz*0.2,cx,cy-sz*0.52);
      ctx.fill();
      ctx.strokeStyle='#5a3a00'; ctx.lineWidth=sz*0.04; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx,cy+sz*0.18); ctx.lineTo(cx,cy-sz*0.08); ctx.stroke();
      ctx.restore();
    },
  },
  {
    id:'sun', emoji:'☀️', name:'Sun', nameH:'सूरज',
    desc:'Radiant and warm', descH:'चमकता सूरज',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      const og=ctx.createRadialGradient(cx,cy,sz*0.3,cx,cy,sz*0.9);
      og.addColorStop(0,'rgba(255,210,50,0.22)'); og.addColorStop(1,'rgba(255,210,50,0)');
      ctx.fillStyle=og; ctx.beginPath(); ctx.arc(cx,cy,sz*0.9,0,Math.PI*2); ctx.fill();
      for(let i=0;i<16;i++){
        const a=(i/16)*Math.PI*2, isLong=i%2===0;
        const r1=sz*0.42, r2=sz*(isLong?0.76:0.62);
        ctx.strokeStyle=`rgba(255,${isLong?200:220},${isLong?40:80},${isLong?0.85:0.55})`;
        ctx.lineWidth=sz*(isLong?0.07:0.045); ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);
        ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);
        ctx.stroke();
      }
      const dg=ctx.createRadialGradient(cx-sz*0.12,cy-sz*0.12,0,cx,cy,sz*0.38);
      dg.addColorStop(0,'#fffac0'); dg.addColorStop(0.5,'#ffd020'); dg.addColorStop(1,'#f59000');
      ctx.fillStyle=dg; ctx.beginPath(); ctx.arc(cx,cy,sz*0.38,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(120,60,0,0.4)';
      ctx.beginPath(); ctx.arc(cx-sz*0.1,cy-sz*0.08,sz*0.045,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+sz*0.1,cy-sz*0.08,sz*0.045,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(120,60,0,0.4)'; ctx.lineWidth=sz*0.04; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(cx,cy+sz*0.06,sz*0.1,0,Math.PI); ctx.stroke();
      ctx.restore();
    },
  },
  {
    id:'lotus', emoji:'🪷', name:'Lotus', nameH:'कमल',
    desc:'Rising from still water', descH:'शांत जल से उगता',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      ctx.strokeStyle='rgba(100,180,220,0.25)'; ctx.lineWidth=1;
      for(let i=1;i<=3;i++){
        ctx.beginPath(); ctx.ellipse(cx,cy+sz*0.62,sz*(0.3+i*0.15),sz*0.06,0,0,Math.PI*2); ctx.stroke();
      }
      ctx.strokeStyle='#4a8a3a'; ctx.lineWidth=sz*0.07; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx,cy+sz*0.18); ctx.lineTo(cx,cy+sz*0.6); ctx.stroke();
      ctx.save(); ctx.translate(cx+sz*0.28,cy+sz*0.46); ctx.rotate(-0.5);
      ctx.beginPath(); ctx.ellipse(0,0,sz*0.22,sz*0.1,0,0,Math.PI*2);
      ctx.fillStyle='#4a8a3a88'; ctx.fill(); ctx.restore();
      const pc=['#e898b4','#d06888','#f0bcc8','#c04870','#eaaac0'];
      for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2-Math.PI/2;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0,-sz*0.36,sz*0.12,sz*0.28,0,0,Math.PI*2);
        ctx.fillStyle=pc[i%pc.length]+'cc'; ctx.fill(); ctx.restore();
      }
      for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2-Math.PI/6;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0,-sz*0.22,sz*0.09,sz*0.2,0,0,Math.PI*2);
        ctx.fillStyle='#f8d8e8ee'; ctx.fill(); ctx.restore();
      }
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*0.14);
      cg.addColorStop(0,'#ffe060'); cg.addColorStop(1,'#e8a000');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,sz*0.14,0,Math.PI*2); ctx.fill();
      ctx.restore();
    },
  },
  {
    id:'firefly', emoji:'✨', name:'Firefly', nameH:'जुगनू',
    desc:'A tiny light in the dark', descH:'अंधेरे में रोशनी',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      const flies=[
        {dx:0,dy:0,r:sz*0.09,op:1.0},
        {dx:sz*0.4,dy:-sz*0.32,r:sz*0.065,op:0.8},
        {dx:-sz*0.38,dy:-sz*0.22,r:sz*0.055,op:0.7},
        {dx:sz*0.22,dy:sz*0.38,r:sz*0.06,op:0.65},
        {dx:-sz*0.28,dy:sz*0.28,r:sz*0.05,op:0.55},
        {dx:sz*0.5,dy:sz*0.14,r:sz*0.04,op:0.45},
        {dx:-sz*0.5,dy:sz*0.08,r:sz*0.035,op:0.4},
      ];
      flies.forEach(f=>{
        const g=ctx.createRadialGradient(cx+f.dx,cy+f.dy,0,cx+f.dx,cy+f.dy,f.r*5);
        g.addColorStop(0,`rgba(180,255,110,${f.op*0.45})`);
        g.addColorStop(1,'rgba(180,255,110,0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx+f.dx,cy+f.dy,f.r*5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=`rgba(210,255,140,${f.op})`;
        ctx.beginPath(); ctx.arc(cx+f.dx,cy+f.dy,f.r,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=`rgba(200,255,180,${f.op*0.35})`; ctx.lineWidth=f.r*0.5;
        ctx.beginPath(); ctx.ellipse(cx+f.dx-f.r*1.6,cy+f.dy-f.r*0.5,f.r*1.3,f.r*0.55,-0.4,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx+f.dx+f.r*1.6,cy+f.dy-f.r*0.5,f.r*1.3,f.r*0.55,0.4,0,Math.PI*2); ctx.stroke();
      });
      ctx.restore();
    },
  },
  {
    id:'paperboat', emoji:'⛵', name:'Paper Boat', nameH:'कागज़ी नाव',
    desc:'Something sent, something hopeful', descH:'उम्मीद की नाव',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      for(let i=1;i<=4;i++){
        ctx.strokeStyle=`rgba(100,170,220,${0.22-i*0.04})`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.ellipse(cx,cy+sz*0.42,sz*(0.42+i*0.13),sz*0.07,0,0,Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle='#f2f2f2';
      ctx.beginPath();
      ctx.moveTo(cx-sz*0.5,cy+sz*0.24);
      ctx.quadraticCurveTo(cx-sz*0.52,cy+sz*0.42,cx,cy+sz*0.46);
      ctx.quadraticCurveTo(cx+sz*0.52,cy+sz*0.42,cx+sz*0.5,cy+sz*0.24);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#ccc'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.strokeStyle='#ddd'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx-sz*0.5,cy+sz*0.24); ctx.lineTo(cx+sz*0.5,cy+sz*0.24); ctx.stroke();
      ctx.strokeStyle='#aaa'; ctx.lineWidth=sz*0.045; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx,cy+sz*0.24); ctx.lineTo(cx,cy-sz*0.42); ctx.stroke();
      ctx.fillStyle='rgba(245,245,245,0.95)';
      ctx.beginPath();
      ctx.moveTo(cx-sz*0.03,cy+sz*0.22);
      ctx.lineTo(cx-sz*0.03,cy-sz*0.36);
      ctx.lineTo(cx-sz*0.44,cy+sz*0.22);
      ctx.closePath(); ctx.fill(); ctx.strokeStyle='#ddd'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='rgba(238,238,238,0.9)';
      ctx.beginPath();
      ctx.moveTo(cx+sz*0.03,cy+sz*0.22);
      ctx.lineTo(cx+sz*0.03,cy-sz*0.32);
      ctx.lineTo(cx+sz*0.38,cy+sz*0.22);
      ctx.closePath(); ctx.fill(); ctx.strokeStyle='#ddd'; ctx.lineWidth=1; ctx.stroke();
      ctx.restore();
    },
  },
  {
    id:'marigold', emoji:'🌼', name:'Marigold', nameH:'गेंदा',
    desc:'The flower of every celebration', descH:'हर उत्सव का फूल',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      ctx.strokeStyle='#4a8a3a'; ctx.lineWidth=sz*0.07; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(cx,cy+sz*0.18); ctx.lineTo(cx,cy+sz*0.62); ctx.stroke();
      ctx.save(); ctx.translate(cx+sz*0.2,cy+sz*0.44); ctx.rotate(-0.55);
      ctx.beginPath(); ctx.ellipse(0,0,sz*0.2,sz*0.09,0,0,Math.PI*2);
      ctx.fillStyle='#4a8a3a77'; ctx.fill(); ctx.restore();
      for(let i=0;i<20;i++){
        const a=(i/20)*Math.PI*2;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0,-sz*0.36,sz*0.095,sz*0.22,0,0,Math.PI*2);
        ctx.fillStyle=i%2===0?'#f5a400cc':'#e07000bb'; ctx.fill(); ctx.restore();
      }
      for(let i=0;i<14;i++){
        const a=(i/14)*Math.PI*2+Math.PI/14;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0,-sz*0.22,sz*0.08,sz*0.15,0,0,Math.PI*2);
        ctx.fillStyle='#ffcc10dd'; ctx.fill(); ctx.restore();
      }
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*0.16);
      cg.addColorStop(0,'#6a3800'); cg.addColorStop(1,'#b86800');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,sz*0.16,0,Math.PI*2); ctx.fill();
      ctx.restore();
    },
  },
  {
    id:'butterfly', emoji:'🦋', name:'Butterfly', nameH:'तितली',
    desc:'Lightness and transformation', descH:'हल्कापन और बदलाव',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      const drawWing=(flip,col1,col2,big)=>{
        ctx.save(); ctx.translate(cx,cy); if(flip) ctx.scale(-1,1);
        const g=ctx.createRadialGradient(sz*0.22,-sz*0.1,0,sz*0.22,-sz*0.1,sz*(big?0.52:0.38));
        g.addColorStop(0,col1+'ee'); g.addColorStop(0.6,col2+'aa'); g.addColorStop(1,col2+'22');
        ctx.fillStyle=g;
        if(big){
          ctx.beginPath(); ctx.moveTo(0,0);
          ctx.bezierCurveTo(sz*0.1,-sz*0.52,sz*0.58,-sz*0.48,sz*0.54,-sz*0.08);
          ctx.bezierCurveTo(sz*0.5,sz*0.16,sz*0.1,sz*0.1,0,0); ctx.fill();
        } else {
          ctx.beginPath(); ctx.moveTo(0,0);
          ctx.bezierCurveTo(sz*0.08,sz*0.14,sz*0.44,sz*0.44,sz*0.32,sz*0.4);
          ctx.bezierCurveTo(sz*0.2,sz*0.44,sz*0.02,sz*0.3,0,0); ctx.fill();
        }
        ctx.restore();
      };
      drawWing(false,'#5a3ab8','#8060d8',true); drawWing(true,'#5a3ab8','#8060d8',true);
      drawWing(false,'#7848d0','#a078e8',false); drawWing(true,'#7848d0','#a078e8',false);
      [[sz*0.3,-sz*0.25],[sz*0.2,-sz*0.06],[-sz*0.3,-sz*0.25],[-sz*0.2,-sz*0.06]].forEach(([dx,dy])=>{
        ctx.beginPath(); ctx.arc(cx+dx,cy+dy,sz*0.05,0,Math.PI*2);
        ctx.fillStyle='rgba(255,220,100,0.75)'; ctx.fill();
      });
      ctx.fillStyle='#1e1228';
      ctx.beginPath(); ctx.ellipse(cx,cy,sz*0.045,sz*0.3,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#1e1228'; ctx.lineWidth=sz*0.03; ctx.lineCap='round';
      [[-0.2,-0.52],[0.2,-0.52]].forEach(([dx,dy])=>{
        ctx.beginPath(); ctx.moveTo(cx,cy-sz*0.25); ctx.quadraticCurveTo(cx+dx*sz*1.1,cy+dy*sz*0.7,cx+dx*sz*1.0,cy+dy*sz); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx+dx*sz,cy+dy*sz,sz*0.04,0,Math.PI*2); ctx.fillStyle='#1e1228'; ctx.fill();
      });
      ctx.restore();
    },
  },
  {
    id:'moon', emoji:'🌙', name:'Crescent Moon', nameH:'चाँद',
    desc:'Quiet nocturnal peace', descH:'रात की शांति',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      const ag=ctx.createRadialGradient(cx,cy,sz*0.2,cx,cy,sz*0.85);
      ag.addColorStop(0,'rgba(255,248,190,0.22)'); ag.addColorStop(1,'rgba(255,248,190,0)');
      ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(cx,cy,sz*0.85,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff8d0';
      ctx.beginPath(); ctx.arc(cx,cy,sz*0.44,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#06060f';
      ctx.beginPath(); ctx.arc(cx+sz*0.18,cy-sz*0.1,sz*0.36,0,Math.PI*2); ctx.fill();
      const starPos=[[sz*0.55,-sz*0.42],[sz*0.46,-sz*0.08],[sz*0.3,-sz*0.58],[sz*0.62,sz*0.1],[-sz*0.12,-sz*0.62]];
      starPos.forEach(([dx,dy],i)=>{
        const r=sz*(0.045-i*0.006);
        if(r<=0) return;
        ctx.fillStyle=`rgba(255,248,180,${0.95-i*0.15})`;
        ctx.beginPath(); ctx.arc(cx+dx,cy+dy,r,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();
    },
  },
  {
    id:'peacock', emoji:'🦚', name:'Peacock', nameH:'मोर',
    desc:'Pride and color', descH:'रंग और शान',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      const fcols=['#1a9a50','#0a7acc','#8a44cc','#cc7a10','#c83040'];
      for(let i=0;i<11;i++){
        const a=-Math.PI*0.65+(i/10)*Math.PI*1.3;
        const ex=cx+Math.cos(a)*sz*0.62, ey=cy+Math.sin(a)*sz*0.62+sz*0.08;
        ctx.strokeStyle=fcols[i%fcols.length]+'cc'; ctx.lineWidth=sz*0.055; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(cx,cy+sz*0.12);
        ctx.quadraticCurveTo(cx+Math.cos(a)*sz*0.3,cy+Math.sin(a)*sz*0.3+sz*0.04,ex,ey);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(ex,ey,sz*0.08,0,Math.PI*2);
        ctx.fillStyle=fcols[i%fcols.length]+'88'; ctx.fill();
        ctx.beginPath(); ctx.arc(ex,ey,sz*0.045,0,Math.PI*2);
        ctx.fillStyle='#081828'; ctx.fill();
        ctx.beginPath(); ctx.arc(ex,ey,sz*0.02,0,Math.PI*2);
        ctx.fillStyle='rgba(120,220,255,0.85)'; ctx.fill();
      }
      const bg=ctx.createRadialGradient(cx,cy+sz*0.1,0,cx,cy+sz*0.1,sz*0.22);
      bg.addColorStop(0,'#2ac870'); bg.addColorStop(1,'#0a6840');
      ctx.fillStyle=bg; ctx.beginPath(); ctx.ellipse(cx,cy+sz*0.12,sz*0.16,sz*0.24,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#188860'; ctx.beginPath(); ctx.ellipse(cx,cy-sz*0.14,sz*0.08,sz*0.2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#18a870'; ctx.beginPath(); ctx.arc(cx,cy-sz*0.32,sz*0.1,0,Math.PI*2); ctx.fill();
      for(let i=0;i<3;i++){
        const a=-Math.PI/2+(-0.28+i*0.28);
        ctx.strokeStyle='#20cc88'; ctx.lineWidth=sz*0.03;
        ctx.beginPath(); ctx.moveTo(cx,cy-sz*0.4); ctx.lineTo(cx+Math.cos(a)*sz*0.14,cy-sz*0.4+Math.sin(a)*sz*0.16); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*sz*0.14,cy-sz*0.4+Math.sin(a)*sz*0.16,sz*0.03,0,Math.PI*2);
        ctx.fillStyle='#20cc88'; ctx.fill();
      }
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx+sz*0.05,cy-sz*0.33,sz*0.032,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(cx+sz*0.052,cy-sz*0.33,sz*0.016,0,Math.PI*2); ctx.fill();
      ctx.restore();
    },
  },
  {
    id:'raincloud', emoji:'🌧️', name:'Rain Cloud', nameH:'बारिश',
    desc:'Your storm is seen too', descH:'तुम्हारा दर्द भी जाना है',
    draw(ctx, cx, cy, sz) {
      ctx.save();
      const drops=[{dx:-sz*0.32,dy:sz*0.3},{dx:-sz*0.14,dy:sz*0.42},{dx:sz*0.06,dy:sz*0.32},{dx:sz*0.28,dy:sz*0.44},{dx:-sz*0.22,dy:sz*0.56},{dx:sz*0.18,dy:sz*0.56},{dx:sz*0.42,dy:sz*0.36},{dx:-sz*0.44,dy:sz*0.44}];
      drops.forEach(d=>{
        ctx.strokeStyle='rgba(110,170,230,0.72)'; ctx.lineWidth=sz*0.042; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(cx+d.dx,cy+d.dy); ctx.lineTo(cx+d.dx-sz*0.04,cy+d.dy+sz*0.16); ctx.stroke();
      });
      const puffs=[{dx:-sz*0.26,dy:0,r:sz*0.22},{dx:0,dy:-sz*0.13,r:sz*0.28},{dx:sz*0.26,dy:0,r:sz*0.22},{dx:-sz*0.44,dy:sz*0.06,r:sz*0.17},{dx:sz*0.44,dy:sz*0.06,r:sz*0.17}];
      puffs.forEach(p=>{
        ctx.fillStyle='rgba(175,200,225,0.88)';
        ctx.beginPath(); ctx.arc(cx+p.dx,cy+p.dy,p.r,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle='rgba(155,185,215,0.85)';
      ctx.fillRect(cx-sz*0.58,cy+sz*0.02,sz*1.16,sz*0.22);
      ctx.restore();
    },
  },
];

// ─── IMAGE GENERATOR ──────────────────────────────────────────────────────────
const generateWarmthImage = (recipient, sender, lang, paletteId, characterId) => new Promise(resolve => {
  const W = 800, H = 800;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const palette = PALETTES.find(p => p.id === paletteId) || PALETTES[0];
  const hi = lang === 'Hindi';

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);

  const [ar,ag,ab] = hexToRgb(palette.accent);
  const bgGlow = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.55);
  bgGlow.addColorStop(0,`rgba(${ar},${ag},${ab},0.14)`);
  bgGlow.addColorStop(1,`rgba(${ar},${ag},${ab},0)`);
  ctx.fillStyle=bgGlow; ctx.fillRect(0,0,W,H);

  const rings = [...palette.rings].reverse();
  const radii = [300, 240, 185, 135, 90];
  rings.forEach((col, i) => {
    const r = radii[i] || 60;
    const [rr,rg,rb] = hexToRgb(col);
    ctx.beginPath(); ctx.arc(W/2, H/2, r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${rr},${rg},${rb},0.09)`; ctx.fill();
    ctx.beginPath(); ctx.arc(W/2, H/2, r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(${rr},${rg},${rb},0.55)`;
    ctx.lineWidth = 1.5; ctx.stroke();
  });

  if (characterId) {
    const char = CHARACTERS.find(c => c.id === characterId);
    if (char && char.draw) char.draw(ctx, W/2, H/2, W * 0.25);
  }

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = `rgba(${ar},${ag},${ab},0.6)`;
  ctx.shadowBlur = 12;
  ctx.font = '500 28px Georgia, serif';
  ctx.fillStyle = `rgba(${ar},${ag},${ab},0.92)`;
  ctx.fillText('a moment of warmth, from JSukoon', W/2, 54);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.28)`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W*0.2, 66); ctx.lineTo(W*0.8, 66); ctx.stroke();

  const displayName = recipient || (hi ? 'आपको' : 'You');
  ctx.font = '300 58px Georgia, serif'; ctx.fillStyle = palette.accent;
  ctx.fillText(displayName, W/2, 132);

  const msg = hi ? 'को प्रेम, शांति और सुख मिले।' : 'May you be at peace. May you be well.';
  ctx.font = 'italic 24px Georgia, serif'; ctx.fillStyle='rgba(255,255,255,0.82)';
  ctx.fillText(msg, W/2, 172);

  const fromText = sender
    ? (hi ? `— ${sender} की ओर से 💛` : `— with love from ${sender} 💛`)
    : '— JSukoon 💛';
  ctx.font = '500 20px Georgia, serif'; ctx.fillStyle=`rgba(${ar},${ag},${ab},0.65)`;
  ctx.fillText(fromText, W/2, H - 42);

  ctx.strokeStyle=`rgba(${ar},${ag},${ab},0.35)`; ctx.lineWidth=1;
  ctx.strokeRect(22,22,W-44,H-44);

  canvas.toBlob(blob => resolve(blob), 'image/png');
});

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return [200,200,200];
  return [parseInt(hex.slice(1,3),16)||0, parseInt(hex.slice(3,5),16)||0, parseInt(hex.slice(5,7),16)||0];
}

// ─── PALETTE PICKER ───────────────────────────────────────────────────────────
function PalettePicker({ selected, onSelect, T, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hi = lang === 'Hindi';
  const sel = PALETTES.find(p => p.id === selected) || PALETTES[0];

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); document.addEventListener('touchstart', h);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); };
  }, []);

  const s = {
    wrapper:   { position: 'relative', zIndex: 30 },
    trigger:   { width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: T.surface, border: `1px solid ${open ? T.accent+'55' : T.border}`, borderRadius: 11, padding: '9px 13px', cursor: 'pointer', transition: 'all 0.2s' },
    swatches:  { display: 'flex', gap: 3 },
    swatch:    (c) => ({ width: 12, height: 12, borderRadius: '50%', background: c }),
    label:     { flex: 1, textAlign: 'left', fontSize: 13, color: T.text, fontWeight: 500 },
    arrow:     { fontSize: 11, color: T.muted, transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' },
    dropdown:  { position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.18)', maxHeight: 280, overflowY: 'auto', zIndex: 40 },
    option:    (isSelected) => ({ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: isSelected ? `${T.accent}12` : 'transparent', border: 'none', borderBottom: `1px solid ${T.border}20`, padding: '10px 13px', cursor: 'pointer', textAlign: 'left' }),
    optLabel:  (isSelected) => ({ fontSize: 13, color: T.text, fontWeight: isSelected ? 600 : 400 }),
    check:     { marginLeft: 'auto', color: T.accent },
  };

  return (
    <div ref={ref} style={s.wrapper}>
      <button onClick={() => setOpen(o => !o)} style={s.trigger}>
        <div style={s.swatches}>
          {sel.rings.slice(0,4).map((c,i) => <div key={i} style={s.swatch(c)} />)}
        </div>
        <span style={s.label}>{hi ? sel.nameH : sel.name}</span>
        <span style={s.arrow}>▼</span>
      </button>
      {open && (
        <div style={s.dropdown}>
          {PALETTES.map(p => (
            <button key={p.id} onClick={() => { onSelect(p.id); setOpen(false); }} style={s.option(selected === p.id)}>
              <div style={s.swatches}>
                {p.rings.slice(0,5).map((c,i) => <div key={i} style={s.swatch(c)} />)}
              </div>
              <span style={s.optLabel(selected === p.id)}>{hi ? p.nameH : p.name}</span>
              {selected === p.id && <span style={s.check}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CHARACTER PICKER ─────────────────────────────────────────────────────────
function CharacterPicker({ selected, onSelect, T, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hi = lang === 'Hindi';
  const sel = CHARACTERS.find(c => c.id === selected);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); document.addEventListener('touchstart', h);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); };
  }, []);

  const s = {
    wrapper:    { position: 'relative', zIndex: 20 },
    trigger:    { width: '100%', display: 'flex', alignItems: 'center', gap: 9, background: T.surface, border: `1px solid ${open ? T.accent+'55' : T.border}`, borderRadius: 11, padding: '9px 13px', cursor: 'pointer', transition: 'all 0.2s' },
    trigEmoji:  { fontSize: 20 },
    trigInfo:   { flex: 1, textAlign: 'left' },
    trigName:   { fontSize: 13, color: T.text, fontWeight: 500 },
    trigDesc:   { fontSize: 11, color: T.muted },
    arrow:      { fontSize: 11, color: T.muted, transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' },
    dropdown:   { position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.18)', maxHeight: 300, overflowY: 'auto', zIndex: 30 },
    noneBtn:    { width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: !selected ? `${T.accent}12` : 'transparent', border: 'none', borderBottom: `1px solid ${T.border}`, padding: '10px 13px', cursor: 'pointer', textAlign: 'left' },
    noneEmoji:  { fontSize: 20, opacity: 0.35 },
    noneLabel:  { fontSize: 13, color: T.muted },
    option:     (isSelected) => ({ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: isSelected ? `${T.accent}12` : 'transparent', border: 'none', borderBottom: `1px solid ${T.border}20`, padding: '10px 13px', cursor: 'pointer', textAlign: 'left' }),
    optEmoji:   { fontSize: 22 },
    optName:    (isSelected) => ({ fontSize: 13, color: T.text, fontWeight: isSelected ? 600 : 400 }),
    optDesc:    { fontSize: 11, color: T.muted },
    check:      { marginLeft: 'auto', color: T.accent },
  };

  return (
    <div ref={ref} style={s.wrapper}>
      <button onClick={() => setOpen(o => !o)} style={s.trigger}>
        <span style={s.trigEmoji}>{sel ? sel.emoji : '○'}</span>
        <div style={s.trigInfo}>
          <div style={s.trigName}>{sel ? (hi ? sel.nameH : sel.name) : (hi ? 'कोई चरित्र नहीं' : 'No character')}</div>
          {sel && <div style={s.trigDesc}>{hi ? sel.descH : sel.desc}</div>}
        </div>
        <span style={s.arrow}>▼</span>
      </button>
      {open && (
        <div style={s.dropdown}>
          <button onClick={() => { onSelect(null); setOpen(false); }} style={s.noneBtn}>
            <span style={s.noneEmoji}>○</span>
            <span style={s.noneLabel}>{hi ? 'कोई नहीं' : 'None'}</span>
          </button>
          {CHARACTERS.map(c => (
            <button key={c.id} onClick={() => { onSelect(c.id); setOpen(false); }} style={s.option(selected === c.id)}>
              <span style={s.optEmoji}>{c.emoji}</span>
              <div>
                <div style={s.optName(selected === c.id)}>{hi ? c.nameH : c.name}</div>
                <div style={s.optDesc}>{hi ? c.descH : c.desc}</div>
              </div>
              {selected === c.id && <span style={s.check}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WARMTH CARD ──────────────────────────────────────────────────────────────
function WarmthCard({ T, lang }) {
  const hi = lang === 'Hindi';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [recipientName, setRecipientName] = useState('');
  const [senderName,    setSenderName]    = useState('');
  const [paletteId,     setPaletteId]     = useState('rose');
  const [characterId,   setCharacterId]   = useState(null);
  const [imageURL,      setImageURL]      = useState(null);
  const [imageBlob,     setImageBlob]     = useState(null);
  const [shared,        setShared]        = useState(false);
  const [generating,    setGenerating]    = useState(false);
  const [shareError,    setShareError]    = useState('');
  const [isRecording,   setIsRecording]   = useState(false);
  const [audioURL,      setAudioURL]      = useState(null);
  const [micBlocked,    setMicBlocked]    = useState(false);
  const [visible,       setVisible]       = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const getBestMime = () => {
    const types = isMobile
      ? ['audio/ogg;codecs=opus','audio/mp4','audio/webm;codecs=opus','audio/webm']
      : ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const blob = await generateWarmthImage(recipientName.trim()||null, senderName.trim()||null, lang, paletteId, characterId);
      if (!cancelled) {
        if (imageURL) URL.revokeObjectURL(imageURL);
        setImageURL(URL.createObjectURL(blob));
        setImageBlob(blob);
        setShared(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => { cancelled=true; clearTimeout(t); };
  }, [recipientName, senderName, paletteId, characterId, lang]);

  const startRecording = async () => {
    setMicBlocked(false); setShareError('');
    try {
      if (navigator.permissions) {
        const perm = await navigator.permissions.query({ name:'microphone' });
        if (perm.state==='denied') { setMicBlocked(true); return; }
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      chunksRef.current = [];
      const mime = getBestMime();
      const mr = new MediaRecorder(stream, mime?{mimeType:mime}:{});
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t=>t.stop());
        const finalMime = mr.mimeType||mime||'audio/webm';
        const blob = new Blob(chunksRef.current,{type:finalMime});
        setAudioURL(URL.createObjectURL(blob));
      };
      mr.start(); setIsRecording(true);
    } catch(e) {
      if(e.name==='NotAllowedError') setMicBlocked(true);
      else setShareError(hi?'माइक्रोफ़ोन उपलब्ध नहीं।':'Microphone unavailable.');
    }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const handleShare = async () => {
    if (!imageBlob) return;
    setShareError(''); setGenerating(true);
    const recipient = recipientName.trim()||(hi?'आपको':'you');
    const sender    = senderName.trim();
    const fromPart  = sender?(hi?` — ${sender} की ओर से`:` — with love from ${sender}`):(hi?' — JSukoon से':' — from JSukoon');
    const text = hi
      ? `💛 ${recipient} के लिए गर्माहट${fromPart}\n\n✨ JSukoon से भेजा गया — jsukoon.vercel.app पर आएं`
      : `💛 A message of warmth for ${recipient}${fromPart}\n\n✨ Sent with JSukoon — find your sukoon at jsukoon.vercel.app`;
    const safeR = recipient.replace(/[^a-zA-Z0-9]/g,'-').slice(0,30);
    const imgFile = new File([imageBlob],`warmth-for-${safeR}.png`,{type:'image/png'});

    if (navigator.share && navigator.canShare && navigator.canShare({files:[imgFile]})) {
      try {
        await navigator.share({files:[imgFile], text});
        setShared(true); creditSession(4); creditMetta();
        setGenerating(false); return;
      } catch(e) { if(e.name==='AbortError'){setGenerating(false);return;} }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(imageBlob);
    a.download = `warmth-for-${safeR}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setShared(true); creditSession(4); creditMetta();
    setGenerating(false);
  };

  const reset = () => {
    setRecipientName(''); setSenderName(''); setCharacterId(null); setPaletteId('rose');
    setImageURL(null); setImageBlob(null); setShared(false); setAudioURL(null); setShareError('');
  };

  const palette = PALETTES.find(p=>p.id===paletteId)||PALETTES[0];

  // ─── STYLES ───
  const s = {
    card: {
      background: T.surface,
      border: `1px solid ${T.borderWarm}`,
      borderRadius: 20,
      padding: '20px 18px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    },
    header: { textAlign: 'center', marginBottom: 20 },
    headerEmoji: { fontSize: 36, display: 'block', marginBottom: 8 },
    headerTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: T.accentSoft, fontWeight: 400, margin: '0 0 6px' },
    headerSub: { fontSize: 13, color: T.textSoft, margin: 0, lineHeight: 1.6 },
    input: {
      width: '100%',
      background: T.surfaceAlt,
      border: `1px solid ${T.border}`,
      borderRadius: 11,
      padding: '11px 14px',
      color: T.text,
      fontSize: 13,
      outline: 'none',
      fontFamily: "'DM Sans', sans-serif",
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    },
    dropdownLabel: { fontSize: 11, color: T.muted, margin: '0 0 6px', letterSpacing: 0.5 },
    dropdownWrap: { marginBottom: 12 },
    preview: {
      marginBottom: 16,
      borderRadius: 14,
      overflow: 'hidden',
      border: `1px solid ${T.border}`,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    },
    previewImg: { width: '100%', display: 'block' },
    micBlocked: {
      background: 'rgba(224,102,102,0.08)',
      border: '1px solid #e0666630',
      borderRadius: 11,
      padding: '10px 14px',
    },
    micBlockedText: { fontSize: 13, color: '#e06666', margin: 0, lineHeight: 1.6 },
    voiceBtn: (recording) => ({
      width: '100%',
      background: recording ? 'rgba(224,102,102,0.1)' : T.surfaceAlt,
      border: `1px solid ${recording ? '#e06666' : T.border}`,
      borderRadius: 11,
      padding: '11px 14px',
      color: recording ? '#e06666' : T.textSoft,
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      cursor: 'pointer',
      boxSizing: 'border-box',
    }),
    audio: { width: '100%', height: 34, marginTop: 8 },
    errorText: { fontSize: 12, color: '#e06666', textAlign: 'center', margin: '0 0 10px' },
    shareBtn: {
      width: '100%',
      background: shared ? `${T.accent}25` : `${palette.accent}22`,
      border: `1px solid ${palette.accent}55`,
      color: palette.accent,
      fontSize: 15,
      fontWeight: 600,
      padding: '14px',
      borderRadius: 13,
      cursor: 'pointer',
      transition: 'all 0.2s',
      letterSpacing: 0.3,
      boxSizing: 'border-box',
    },
    shareHint: { fontSize: 11, color: T.muted, textAlign: 'center', marginTop: 10, lineHeight: 1.7 },
    resetBtn: {
      display: 'block',
      margin: '14px auto 0',
      background: 'transparent',
      border: `1px solid ${T.border}`,
      color: T.muted,
      fontSize: 12,
      padding: '8px 22px',
      borderRadius: 99,
      cursor: 'pointer',
    },
  };

  return (
    <div style={s.card}>

      <div style={s.header}>
        <span style={s.headerEmoji}>💛</span>
        <h3 style={s.headerTitle}>{hi ? 'गर्माहट भेजें' : 'Send Warmth'}</h3>
        <p style={s.headerSub}>
          {hi ? 'किसी के लिए एक सुंदर संदेश बनाएं।' : 'Create a beautiful image for someone you care about.'}
        </p>
      </div>

      <input
        value={recipientName}
        onChange={e => setRecipientName(e.target.value)}
        placeholder={hi ? 'किसे भेजना है? (नाम या रिश्ता)' : 'Who is this for? (name or relationship)'}
        style={{ ...s.input, marginBottom: 9 }}
      />
      <input
        value={senderName}
        onChange={e => setSenderName(e.target.value)}
        placeholder={hi ? 'आपका नाम (वैकल्पिक)' : 'Your name (optional)'}
        style={{ ...s.input, marginBottom: 14 }}
      />

      <div style={s.dropdownWrap}>
        <p style={s.dropdownLabel}>{hi ? '✦ रंग चुनें' : '✦ Choose a colour'}</p>
        <PalettePicker selected={paletteId} onSelect={setPaletteId} T={T} lang={lang} />
      </div>

      <div style={s.dropdownWrap}>
        <p style={s.dropdownLabel}>{hi ? '✦ एक चरित्र जोड़ें (वैकल्पिक)' : '✦ Add a character (optional)'}</p>
        <CharacterPicker selected={characterId} onSelect={setCharacterId} T={T} lang={lang} />
      </div>

      {imageURL && (
        <div style={s.preview}>
          <img src={imageURL} alt="warmth preview" style={s.previewImg} />
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        {micBlocked ? (
          <div style={s.micBlocked}>
            <p style={s.micBlockedText}>
              {hi ? 'माइक्रोफ़ोन की अनुमति नहीं है।' : 'Microphone blocked. Click 🔒 in your browser address bar to allow.'}
            </p>
          </div>
        ) : (
          <button onClick={isRecording ? stopRecording : startRecording} style={s.voiceBtn(isRecording)}>
            {isRecording
              ? `🛑 ${hi ? 'रिकॉर्डिंग रोकें' : 'Stop recording'}`
              : audioURL
                ? `🔄 ${hi ? 'फिर से रिकॉर्ड करें' : 'Re-record'}`
                : `🎙️ ${hi ? 'आवाज़ में संदेश जोड़ें' : 'Add a voice message'}`}
          </button>
        )}
        {audioURL && <audio controls src={audioURL} style={s.audio} />}
      </div>

      {shareError && <p style={s.errorText}>{shareError}</p>}

      <button onClick={handleShare} disabled={generating} style={s.shareBtn}>
        {generating ? '…' : shared
          ? (hi ? '✓ भेज दिया!' : '✓ Sent!')
          : (hi ? '💛 गर्माहट भेजें' : '💛 Send this warmth')}
      </button>

      {shared && (
        <p style={s.shareHint}>
          {isMobile
            ? (hi ? '📱 WhatsApp चुनें।' : '📱 Choose WhatsApp from the share sheet.')
            : (hi ? '💻 WhatsApp Web → अटैचमेंट → फ़ाइल।' : '💻 Open WhatsApp Web → attachment → choose the file.')}
        </p>
      )}

      {shared && (
        <button onClick={reset} style={s.resetBtn}>
          {hi ? 'फिर से' : 'Start over'}
        </button>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function WarmthPage({ setTab, goBack, T, lang }) {
  const s = {
    page: { height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden' },
    scroll: { flex: 1, overflowY: 'auto', padding: '0 0 60px' },
    inner: { padding: '16px 18px' },
  };

  return (
    <div style={s.page}>
      <PageNav
        onBack={goBack || (() => setTab('home'))}
        onHome={() => setTab('home')}
        backLabel={lang === 'Hindi' ? 'वापस' : 'Back'}
        T={T}
        lang={lang}
      />
      <div className="scroll-area fade-up" style={s.scroll}>
        <div style={s.inner}>
          <WarmthCard T={T} lang={lang} />
        </div>
      </div>
    </div>
  );
}

export default WarmthPage;
