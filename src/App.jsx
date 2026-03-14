// JSukoon — Version 3.2.0 — Complete Rebuild
import React, { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";

// ─── AUDIO — Vercel Blob CDN ─────────────────────────────────────────
// Upload audio files once using scripts/upload-audio.mjs
// then paste the resulting Blob URLs here.
// Vercel Blob is a proper global CDN — no soft caps, no GitHub rate limits.
const BLOB = "https://ktqkxfj3pddbxgnf.public.blob.vercel-storage.com";
const AUDIO_URLS = {
  "birds.mp3":  `${BLOB}/audio/birds.mp3`,
  "flute.mp3":  `${BLOB}/audio/flute.mp3`,
  "forest.mp3": `${BLOB}/audio/forest.mp3`,
  "waves.mp3":  `${BLOB}/audio/waves.mp3`,
  "wind.mp3":   `${BLOB}/audio/wind.mp3`,
};

// Guided meditation audio — one per session
const MEDITATION_AUDIO = {
  1:  `${BLOB}/meditation/session_1_morning_light.mp3`,
  2:  `${BLOB}/meditation/session_2_heavy_heart.mp3`,
  3:  `${BLOB}/meditation/session_3_earth_rest.mp3`,
  4:  `${BLOB}/meditation/session_4_loving_kindness.mp3`,
  5:  `${BLOB}/meditation/session_5_drifting_to_sleep.mp3`,
  6:  `${BLOB}/meditation/session_6_quick_return.mp3`,
  7:  `${BLOB}/meditation/session_7_still_water.mp3`,
  8:  `${BLOB}/meditation/session_8_forest_walk.mp3`,
  9:  `${BLOB}/meditation/session_9_heart_warmth.mp3`,
  10: `${BLOB}/meditation/session_10_nightly_release.mp3`,
  11: `${BLOB}/meditation/session_11_breath_anchor.mp3`,
  12: `${BLOB}/meditation/session_12_compassion_rain.mp3`,
};

// Robust audio loader — uses Vercel Blob, fails silently if unavailable
async function loadAudio(audioEl, file, volume=0.45) {
  if (!audioEl) return false;
  const url = AUDIO_URLS[file];
  if (!url || url.includes("PASTE_BLOB_URL_HERE")) {
    console.warn("Audio URL not configured for:", file);
    return false;
  }
  audioEl.volume = volume;
  audioEl.loop = true;
  try {
    audioEl.src = url;
    await audioEl.play();
    return true;
  } catch {
    audioEl.src = "";
    return false;
  }
}

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error) { return { hasError:true, error }; }
  componentDidCatch(error, info) { console.error("JSukoon Error:", error, info); }
  render() {
    if (this.state.hasError) {
      const T = this.props.T || { bg:"#0a0a0a", text:"#e0e0e0", accent:"#888888", surface:"#111111", border:"#ffffff15", muted:"#666666" };
      return (
        <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:T.bg, padding:32, textAlign:"center" }}>
          <span style={{ fontSize:48, marginBottom:20 }}>🌿</span>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.text, fontWeight:300, marginBottom:12 }}>Something went quiet.</p>
          <p style={{ fontSize:14, color:T.muted, lineHeight:1.7, marginBottom:28, maxWidth:280 }}>The sanctuary encountered an unexpected moment. This has been noted.</p>
          <button onClick={() => { this.setState({ hasError:false, error:null }); window.location.reload(); }}
            style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:14, padding:"12px 28px", borderRadius:99 }}>
            Return to Sanctuary
          </button>
          {this.state.error && (
            <p style={{ fontSize:10, color:T.muted, marginTop:20, opacity:.4, fontFamily:"monospace" }}>{this.state.error.message}</p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── THEMES ──────────────────────────────────────────────────────────
const THEMES = {
  "Void":           { bg:"#000000", bgWarm:"#0a0a0a", surface:"#111111", surfaceAlt:"#1a1a1a", border:"#ffffff08", borderWarm:"#88888830", accent:"#888888", accentSoft:"#aaaaaa", text:"#e0e0e0", textSoft:"#b0b0b0", muted:"#666666", name:"The Void",        nameH:"शून्य" },
  "PinkChampagne":  { bg:"#F8DECD", bgWarm:"#f5d4c0", surface:"rgba(255,255,255,0.5)", surfaceAlt:"rgba(255,255,255,0.3)", border:"#00000008", borderWarm:"#c88a8e30", accent:"#C88A8E", accentSoft:"#d4a0a4", text:"#5A3A42", textSoft:"#7a5a62", muted:"#9a7a82", name:"Pink Champagne",  nameH:"गुलाबी चाँदनी" },
  "FirstLight":     { bg:"#FDFBF7", bgWarm:"#f9f5ef", surface:"rgba(255,255,255,0.6)", surfaceAlt:"rgba(255,255,255,0.4)", border:"#00000006", borderWarm:"#d4a37330", accent:"#D4A373", accentSoft:"#e0b888", text:"#4A4A4A", textSoft:"#6a6a6a", muted:"#8a8a8a", name:"First Light",      nameH:"पहली किरण" },
  "SeaGlass":       { bg:"#E5EDF0", bgWarm:"#dce6ea", surface:"rgba(255,255,255,0.5)", surfaceAlt:"rgba(255,255,255,0.3)", border:"#00000008", borderWarm:"#7a9ea830", accent:"#7A9EA8", accentSoft:"#96b4be", text:"#4A5D66", textSoft:"#6a7d86", muted:"#8a9da6", name:"Sea Glass",        nameH:"समुद्री काँच" },
  "SageSanctuary":  { bg:"#E3E7E0", bgWarm:"#d9ddd6", surface:"rgba(255,255,255,0.45)", surfaceAlt:"rgba(255,255,255,0.25)", border:"#00000008", borderWarm:"#6b765f30", accent:"#6B765F", accentSoft:"#848f78", text:"#3E4735", textSoft:"#5e6755", muted:"#7e8775", name:"Sage Sanctuary",  nameH:"ऋषि अभयारण्य" },
  "Terracotta":     { bg:"#F2ECE7", bgWarm:"#ede5de", surface:"rgba(255,255,255,0.45)", surfaceAlt:"rgba(255,255,255,0.25)", border:"#00000008", borderWarm:"#b07d6230", accent:"#B07D62", accentSoft:"#c69278", text:"#5C4033", textSoft:"#7c6053", muted:"#9c8073", name:"Terracotta",       nameH:"मिट्टी" },
  "DeepSage":       { bg:"#1E2720", bgWarm:"#1a2218", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#7b907530", accent:"#7B9075", accentSoft:"#96ab90", text:"#D3DDD0", textSoft:"#b3bdb0", muted:"#738070", name:"Deep Sage",        nameH:"गहरा ऋषि" },
  "OceanBlue":      { bg:"#122840", bgWarm:"#0e2038", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#5d93c430", accent:"#5D93C4", accentSoft:"#78a8d8", text:"#CFE2F3", textSoft:"#afcae0", muted:"#6a8fa8", name:"Ocean Blue",       nameH:"नीला सागर" },
  "TwilightBlue":   { bg:"#181830", bgWarm:"#141428", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#726fba30", accent:"#726FBA", accentSoft:"#8c89cc", text:"#D6D5F2", textSoft:"#b6b5d8", muted:"#6a69a0", name:"Twilight Blue",    nameH:"संध्या नीला" },
  "Maroon":         { bg:"#2A0E13", bgWarm:"#240c10", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#9b3d4f30", accent:"#9B3D4F", accentSoft:"#b45868", text:"#EFD1D6", textSoft:"#cfb1b6", muted:"#7a5560", name:"Maroon",            nameH:"मरून" },
  "ChampagneGold":  { bg:"#FBF5ED", bgWarm:"#f5eee3", surface:"rgba(255,255,255,0.55)", surfaceAlt:"rgba(255,255,255,0.35)", border:"#00000008", borderWarm:"#c5a05930", accent:"#C5A059", accentSoft:"#d4b474", text:"#4A4036", textSoft:"#6a6056", muted:"#8a8070", name:"Champagne Gold",  nameH:"सोने की चाँदनी" },
  "SocialBlue":     { bg:"#0D2137", bgWarm:"#0a1c2e", surface:"rgba(255,255,255,0.05)", surfaceAlt:"rgba(255,255,255,0.09)", border:"#ffffff0a", borderWarm:"#4a9ebb35", accent:"#4A9EBB", accentSoft:"#6ab8d4", text:"#D6EAF2", textSoft:"#a8cede", muted:"#5a8fa8", name:"Deep Sky",         nameH:"गहरा आकाश" },
};

const MOOD_THEMES = {
  // Legacy energy states
  "Racing Thoughts":"DeepSage", "Restless Mind":"OceanBlue", "Overwhelmed":"Void",
  "Heavy Thoughts":"FirstLight", "Tired Mind":"SeaGlass", "Need Quiet":"TwilightBlue",
  // 12 moods — each maps to a distinct theme
  "Numb":       "Void",
  "Heavy":      "Maroon",
  "Anxious":    "TwilightBlue",
  "Frustrated": "OceanBlue",
  "Exhausted":  "DeepSage",
  "Unsettled":  "Terracotta",
  "Quiet":      "SeaGlass",
  "Okay":       "SageSanctuary",
  "Gentle":     "FirstLight",
  "Warm":       "PinkChampagne",
  "Grateful":   "ChampagneGold",
  "Radiant":    "SocialBlue",
};

// ─── GLOBAL STYLES ───────────────────────────────────────────────────
const makeStyles = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html,body,#root{height:100%;width:100%;overflow:hidden;}
  body{background:${T.bg};font-family:'DM Sans',sans-serif;overscroll-behavior:none;transition:background 0.8s ease;}
  .scroll-area{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}
  .scroll-area::-webkit-scrollbar{display:none;}
  button{cursor:pointer;font-family:'DM Sans',sans-serif;}
  button:active{opacity:0.75;transform:scale(0.96);}
  @keyframes orbFloat{0%,100%{transform:scale(1) translateY(0);opacity:.75}50%{transform:scale(1.12) translateY(-6px);opacity:1}}
  @keyframes orbRing{0%,100%{transform:scale(1);opacity:.2}50%{transform:scale(1.25);opacity:.05}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes auraBreath{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.08);opacity:0.8}}
  @keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.9}}
  @keyframes curtainFade{0%{opacity:1}85%{opacity:1}100%{opacity:0;pointer-events:none}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  .fade-up{animation:fadeUp 0.45s ease forwards;}
  .fade-in{animation:fadeIn 0.6s ease forwards;}
`;

// ─── DATA ─────────────────────────────────────────────────────────────
const PARK_BENCH_QUOTES = [
  "You do not have to have a single productive thought right now.",
  "The world will keep spinning if you close your eyes for two minutes.",
  "Notice the silence underneath the noise.",
  "You are allowed to just exist today.",
  "Rest is not a reward. It is a necessity.",
  "Some days move slowly. That is okay.",
  "A quiet moment can change the rhythm of a day.",
  "Not every thought needs an answer.",
  "A pause can be enough for now.",
  "Silence sometimes says what words cannot.",
  "The mind often softens when it rests.",
  "This moment does not need to be solved.",
  "A few calm breaths can shift the day.",
  "Stillness can appear in simple moments.",
  "Even busy days contain small pauses.",
  "Nothing urgent is required from this moment.",
  "A gentle breath can begin again.",
  "Quiet moments often arrive unnoticed.",
  "The mind can rest for a while.",
  "Some thoughts pass when given space.",
  "A calm moment is never wasted.",
  "The day can unfold at its own pace.",
  "A pause can bring a different perspective.",
  "This moment can simply exist.",
  "Breathing slowly often changes the mood.",
  "Not every moment needs improvement.",
  "Sometimes a pause is the answer.",
  "A quiet breath can be enough.",
  "Stillness often hides in ordinary moments.",
  "The day can continue gently from here.",
  "A calm mind does not rush.",
  "Small pauses can carry quiet strength.",
  "The present moment can hold its own balance.",
  "The mind can soften with patience.",
  "Even brief silence can refresh the mind.",
  "Nothing needs to be rushed right now.",
  "A quiet pause often brings clarity.",
  "The mind sometimes settles on its own.",
  "The present moment asks very little.",
  "A slow breath can create space.",
  "Calm moments are often simple.",
  "Silence can carry gentle comfort.",
  "Even a short pause can help.",
  "Thoughts may fade when left alone.",
  "A moment of stillness can be enough.",
  "Calm often appears when nothing is forced.",
  "This moment does not require judgment.",
  "Some thoughts simply come and go.",
  "Nothing urgent needs to happen here.",
  "Stillness can live inside ordinary time.",
  "Even a single breath matters.",
  "Silence often carries peace.",
  "Calm can appear in small breaths.",
  "The mind can settle quietly.",
  "Even a short pause has value.",
  "Silence may soften the day.",
  "Thoughts may fade naturally.",
  "This moment can simply be.",
  "आराम करना कोई इनाम नहीं है। यह आपकी ज़रूरत है।",
  "कुछ दिन धीमी गति से गुज़रते हैं। यह ठीक है।",
  "हर विचार का उत्तर देना आवश्यक नहीं है।",
  "यह पल बस ऐसे ही अस्तित्व में रह सकता है।",
  "मन को कभी-कभी बस एक ठहराव की ज़रूरत होती है।",
  "शांति अक्सर खामोशी से आती है।",
  "एक शांत पल आपका अपना है।",
  "वर्तमान क्षण पहले से ही यहाँ है।",
  "कुछ विचार अपने आप गुज़र जाते हैं।",
  "बिना जल्दी के, बस यहाँ रहें।",
  "मन को थोड़ा विश्राम दें।",
  "इस पल में कुछ सुलझाना ज़रूरी नहीं।",
  "एक धीमी सांस काफी हो सकती है।",
  "शांति को खोजने की ज़रूरत नहीं — वह पहले से यहाँ है।",
];

const MEDITATIONS = [
  { id:1,  title:"Morning Light",     titleH:"सुबह की रोशनी",   dur:5,  cat:"Morning",    catH:"सुबह",       emoji:"🌄", desc:"Greet the day with warmth and intention.",              descH:"गर्माहट और इरादे के साथ दिन का स्वागत करें।",      col:"#f0c080" },
  { id:2,  title:"Heavy Heart",       titleH:"भारी दिल",         dur:4,  cat:"Calm",       catH:"शांति",      emoji:"🫶", desc:"Hold yourself gently through difficult feelings.",      descH:"कठिन भावनाओं में खुद को धीरे से थामें।",            col:"#d4806a" },
  { id:3,  title:"Earth Rest",        titleH:"धरती का आराम",     dur:10, cat:"Relaxation", catH:"विश्राम",    emoji:"🌿", desc:"Feel rooted and at ease from head to toe.",             descH:"सिर से पाँव तक जड़ें और सुकून महसूस करें।",         col:"#8aaa7a" },
  { id:4,  title:"Loving Kindness",   titleH:"प्रेम और करुणा",   dur:8,  cat:"Heart",      catH:"हृदय",       emoji:"🕯️", desc:"Soften toward yourself and the world around you.",      descH:"खुद और दुनिया के प्रति नरम हों।",                   col:"#d4845a" },
  { id:5,  title:"Drifting to Sleep", titleH:"नींद की ओर",        dur:15, cat:"Sleep",      catH:"नींद",       emoji:"🌙", desc:"Let go of the day and sink into rest.",                 descH:"दिन को जाने दें और आराम में डूब जाएं।",             col:"#8899cc" },
  { id:6,  title:"Quick Return",      titleH:"त्वरित वापसी",      dur:2,  cat:"Urgent",     catH:"तत्काल",     emoji:"🌱", desc:"Come back to earth. Right here, right now.",            descH:"वापस आएं। ठीक यहाँ, ठीक अभी।",                     col:"#8aaa7a" },
  { id:7,  title:"Still Water",       titleH:"शांत जल",           dur:6,  cat:"Calm",       catH:"शांति",      emoji:"💧", desc:"Watch your thoughts pass like ripples on still water.", descH:"विचारों को शांत पानी की लहरों की तरह गुज़रते देखें।", col:"#5D93C4" },
  { id:8,  title:"Forest Walk",       titleH:"जंगल की सैर",       dur:12, cat:"Relaxation", catH:"विश्राम",    emoji:"🌲", desc:"A slow wander through a forest that holds no demands.", descH:"एक जंगल में धीमी सैर — बिना किसी माँग के।",         col:"#6B765F" },
  { id:9,  title:"Heart Warmth",      titleH:"दिल की गर्माहट",    dur:5,  cat:"Heart",      catH:"हृदय",       emoji:"☀️", desc:"A short practice of warmth for yourself and others.",   descH:"खुद और दूसरों के लिए गर्माहट का एक छोटा अभ्यास।",  col:"#D4A373" },
  { id:10, title:"Nightly Release",   titleH:"रात का विसर्जन",     dur:10, cat:"Sleep",      catH:"नींद",       emoji:"🌌", desc:"Gently dissolve the weight of the day.",                descH:"दिन का बोझ धीरे से घुलने दें।",                     col:"#726FBA" },
  { id:11, title:"Breath Anchor",     titleH:"सांस का लंगर",      dur:3,  cat:"Morning",    catH:"सुबह",       emoji:"⚓", desc:"Three minutes of settled breath to start your day.",    descH:"दिन की शुरुआत के लिए तीन मिनट की स्थिर सांस।",    col:"#7A9EA8" },
  { id:12, title:"Compassion Rain",   titleH:"करुणा की बारिश",    dur:7,  cat:"Heart",      catH:"हृदय",       emoji:"🌧️", desc:"Let compassion fall on every part of yourself.",        descH:"खुद के हर हिस्से पर करुणा को बरसने दें।",           col:"#9B3D4F" },
];

const BREATHE_PATTERNS = [
  { name:"Anchor",     inhale:4, hold1:2, exhale:6, hold2:0, desc:"4-2-6 · Daily calm" },
  { name:"Box Breathing", inhale:4, hold1:4, exhale:4, hold2:4, desc:"4-4-4-4 · Used by soldiers to calm the mind instantly", bold:true },
  { name:"Deep Sleep", inhale:4, hold1:7, exhale:8, hold2:0, desc:"4-7-8 · Rest & release" },
  { name:"Vitality",   inhale:6, hold1:0, exhale:2, hold2:0, desc:"6-0-2 · Awaken" },
];

const PROMPTS = [
  // ── JSukoon originals — English ──
  "What would sukoon feel like in your body right now, if it were allowed in?",
  "Name one thing that happened today that nobody knows about. How did it sit with you?",
  "What are you performing for the world that exhausts you the most?",
  "If your mind had a weather forecast today, what would it be?",
  "What have you been meaning to forgive yourself for?",
  "Where in your life are you being loud when you want to be still?",
  "What does the tired part of you need that the busy part keeps ignoring?",
  "If you could send a message to yourself three years ago, what would it say?",
  "What feeling have you been swallowing today?",
  "When was the last time you felt genuinely at ease? What was different then?",
  "What would you do differently today if nobody was watching or judging?",
  "What is the one thought that returns again and again this week?",
  "Describe this moment — the temperature, the light, the feeling — in three lines.",
  "What are you holding onto that once made sense but no longer does?",
  "Who in your life makes you feel most like yourself? Why haven't you called them?",
  "What does your body know that your mind is still arguing with?",
  "Write one sentence about today that is completely, uncomplicatedly true.",
  "What boundary would bring you the most relief to set?",
  "If sukoon is a destination, what is the distance between you and it right now?",
  "What noise — inside or outside — do you most want silence from today?",
  // ── JSukoon originals — Hindi ──
  "अगर आपका मन आज बोल सकता, तो वह क्या कहता?",
  "आज आपने क्या महसूस किया जो आपने किसी को नहीं बताया?",
  "इस हफ्ते आप क्या भूल गए जो याद रखना ज़रूरी था?",
  "जो थकान आप महसूस कर रहे हैं — वह शरीर की है या मन की?",
  "आज का एक पल जो बिल्कुल शांत था — वह कब था?",
];

const MOODS = [
  { emoji:"😶‍🌫️", label:"Numb",       labelH:"सुन्न",       val:1  },
  { emoji:"😔",   label:"Heavy",      labelH:"भारी",        val:2  },
  { emoji:"😟",   label:"Anxious",    labelH:"चिंतित",      val:3  },
  { emoji:"😤",   label:"Frustrated", labelH:"परेशान",      val:4  },
  { emoji:"😪",   label:"Exhausted",  labelH:"थका हुआ",     val:5  },
  { emoji:"😐",   label:"Unsettled",  labelH:"बेचैन",       val:6  },
  { emoji:"😌",   label:"Quiet",      labelH:"शांत",        val:7  },
  { emoji:"🙂",   label:"Okay",       labelH:"ठीक हूँ",     val:8  },
  { emoji:"🤍",   label:"Gentle",     labelH:"कोमल",        val:9  },
  { emoji:"😊",   label:"Warm",       labelH:"गर्म",        val:10 },
  { emoji:"✨",   label:"Grateful",   labelH:"कृतज्ञ",      val:11 },
  { emoji:"☀️",   label:"Radiant",    labelH:"प्रकाशमान",   val:12 },
];

const ENERGY_STATES = [
  { key:"Racing Thoughts", short:"Chatter",   hi:"बकबक" },
  { key:"Restless Mind",   short:"Restless",  hi:"बेचैन" },
  { key:"Overwhelmed",     short:"Dazed",     hi:"अभिभूत" },
  { key:"Heavy Thoughts",  short:"Heavy",     hi:"भारी" },
  { key:"Tired Mind",      short:"Tired",     hi:"थका" },
  { key:"Need Quiet",      short:"Noise",     hi:"शोर" },
];

const SOUNDS = [
  { name:"Birds",  hi:"पक्षी",  file:"birds.mp3"  },
  { name:"Flute",  hi:"बांसुरी",file:"flute.mp3"  },
  { name:"Forest", hi:"जंगल",   file:"forest.mp3" },
  { name:"Waves",  hi:"लहरें",  file:"waves.mp3"  },
  { name:"Wind",   hi:"हवा",    file:"wind.mp3"   },
];

const MILESTONES = [
  { label:"First step",       labelH:"पहला कदम",          needSessions:1,   needStreak:0,  emoji:"🌱" },
  { label:"3-day warmth",     labelH:"3 दिन की देखभाल",    needSessions:0,   needStreak:3,  emoji:"🌿" },
  { label:"10 sessions",      labelH:"10 सत्र",            needSessions:10,  needStreak:0,  emoji:"🕯️" },
  { label:"Week of care",     labelH:"देखभाल का सप्ताह",   needSessions:0,   needStreak:7,  emoji:"🌻" },
  { label:"30 sessions",      labelH:"30 सत्र",            needSessions:30,  needStreak:0,  emoji:"🏵️" },
  { label:"50 sessions",      labelH:"50 सत्र",            needSessions:50,  needStreak:0,  emoji:"🌙" },
  { label:"30-day streak",    labelH:"30 दिन की लकीर",     needSessions:0,   needStreak:30, emoji:"⭐" },
  { label:"100 sessions",     labelH:"100 सत्र",           needSessions:100, needStreak:0,  emoji:"💎" },
  { label:"3-month streak",   labelH:"3 महीने की लकीर",    needSessions:0,   needStreak:90, emoji:"🌟" },
  { label:"365 sessions",     labelH:"365 सत्र",           needSessions:365, needStreak:0,  emoji:"🌞" },
  { label:"Year of care",     labelH:"देखभाल का एक साल",   needSessions:0,   needStreak:365,emoji:"🪷" },
  { label:"500 sessions",     labelH:"500 सत्र",           needSessions:500, needStreak:0,  emoji:"🔮" },
  { label:"1000 sessions",    labelH:"1000 सत्र",          needSessions:1000,needStreak:0,  emoji:"✨" },
  { label:"1000-day streak",  labelH:"1000 दिन की लकीर",   needSessions:0,   needStreak:1000,emoji:"🌌" },
];

const CRISIS_WORDS = [
  // ── Self-harm / suicide – English ──
  "suicide","suicidal","kill myself","end my life","want to die","wanna die","wish i was dead",
  "wish i were dead","don't want to live","dont want to live","no reason to live","not worth living",
  "life is not worth","better off dead","better off without me","everyone would be better",
  "tired of living","tired of life","end it all","end it","end everything","end my pain",
  "take my own life","take my life","hurt myself","harm myself","self harm","self-harm","selfharm",
  "cut myself","cutting myself","burn myself","starve myself","injure myself",
  "hang myself","hanging myself","jump off","jump from","overdose","od myself",
  "pills to die","bleed out","slit my wrists","slit my throat","shoot myself",
  "drown myself","suffocate myself","no point anymore","nothing left to live for",
  "can't go on","cannot go on","done with life","done with everything","give up on life",
  "check out permanently","permanent solution","disappear forever","never wake up",
  "go to sleep forever","not wake up","dark thoughts","intrusive thoughts of death",
  // ── Harming others – English ──
  "kill someone","kill him","kill her","kill them","want to kill","going to kill",
  "murder someone","murder him","murder her","want to murder","planning to kill",
  "hurt someone","hurt him","hurt her","hurt them badly","make them suffer",
  "attack someone","stab someone","shoot someone","poison someone",
  "make them pay","they deserve to die","want them dead","hope they die",
  "i will hurt","i will harm","i will attack","i want revenge","take revenge",
  // ── Hindi / Urdu / Hinglish ──
  "mar jana","mar jaunga","mar jaungi","mar jaana","marna chahta","marna chahti",
  "marna chahta hoon","marna chahti hoon","jeene ka man nahi","jeene ki ichha nahi",
  "jaan de dunga","jaan de dungi","jaan dena chahta","khudkushi","khud ko marna",
  "aatmahatya","aatm hatya","atmhatya","khud ko khatam","khud ko hurt karna",
  "zindagi khatam","zindagi se thak","jeena nahi","jeena nahi chahta","jeena nahi chahti",
  "mujhe nahi jeena","main mar jaunga","main mar jaungi","nas kaat","naas kaat",
  "neend nahi uthna","neend mein mar","hamesha so jana","so jana forever",
  "sab khatam karna","sab khatam kar dunga","apni jaan lena","apni jaan lunga",
  "dard khatam karna","dard se mukti","is duniya se jaana","duniya chhod dena",
  "kisi ko marna","usse marna","usko khatam karna","kisi ko hurt karna",
  "inhe marna chahta","inhe mar dunga","badla lena","badla lunga",
  // ── Urdu script ──
  "خودکشی","مرنا چاہتا","جان دینا","ختم کرنا","تھک گیا زندگی سے",
];

const CRISIS_RESOURCES = [
  { name:"AASRA",                  number:"9820466627",   desc:"24/7 crisis support" },
  { name:"Vandrevala Foundation",  number:"1860-2662-345",desc:"24/7 free helpline" },
  { name:"iCall (India)",          number:"9152987821",   desc:"Mon–Sat, 8am–10pm" },
];

// ─── HOOKS ───────────────────────────────────────────────────────────
function useLS(key, def) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
    catch { return def; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

// ─── EMOTIONAL CONTEXT BRIDGE ─────────────────────────────────────────
// Shared signal between Reflection and Journal so they speak the same language
function writeEmotionalCtx(type, snippet, extra) {
  try {
    localStorage.setItem("jsukoon_emotional_ctx", JSON.stringify({
      type,               // "burn" | "wish" | "journal"
      snippet: (snippet||"").slice(0, 80),
      extra: extra||null, // e.g. { hasAI: true }
      ts: Date.now(),
    }));
  } catch {}
}

function readEmotionalCtx() {
  try {
    const raw = localStorage.getItem("jsukoon_emotional_ctx");
    if (!raw) return null;
    const ctx = JSON.parse(raw);
    // Persist until the user logs a new mood — no time expiry
    return ctx;
  } catch { return null; }
}

function clearEmotionalCtx() {
  try { localStorage.removeItem("jsukoon_emotional_ctx"); } catch {}
}

function creditSession(minutes) {
  const today = new Date().toDateString();
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dl    = days[new Date().getDay()];
  try {
    const raw  = localStorage.getItem("jsukoon_stats");
    const prev = raw ? JSON.parse(raw) : { sessions:0, minutes:0, streak:0, lastDate:null };
    const isNew = prev.lastDate !== today;
    const wasYesterday = prev.lastDate === new Date(Date.now()-86400000).toDateString();
    localStorage.setItem("jsukoon_stats", JSON.stringify({
      sessions: prev.sessions + 1,
      minutes:  prev.minutes  + (minutes||0),
      streak:   isNew ? (wasYesterday ? prev.streak+1 : 1) : prev.streak,
      lastDate: today,
    }));
    const wr   = localStorage.getItem("jsukoon_week");
    const week = wr ? JSON.parse(wr) : { Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0 };
    week[dl]   = (week[dl]||0) + 1;
    localStorage.setItem("jsukoon_week", JSON.stringify(week));
  } catch {}
}

// Credit time on app for any activity — even partial use
// Accumulates minutes; every 2 min = 1 session credit
function creditActivity(activityType, minutes) {
  try {
    const raw = localStorage.getItem("jsukoon_activity_log");
    const log = raw ? JSON.parse(raw) : { totalMinutes:0, pendingMinutes:0, activities:{} };
    const mins = Math.max(0.5, minutes || 1);
    log.totalMinutes = (log.totalMinutes||0) + mins;
    log.pendingMinutes = (log.pendingMinutes||0) + mins;
    log.activities[activityType] = (log.activities[activityType]||0) + 1;
    // Every 2 pending minutes = 1 session credit (catches ambient, journaling, reflection, etc.)
    if (log.pendingMinutes >= 2) {
      const sessionsToCredit = Math.floor(log.pendingMinutes / 2);
      for (let i = 0; i < sessionsToCredit; i++) creditSession(2);
      log.pendingMinutes = log.pendingMinutes % 2;
    }
    localStorage.setItem("jsukoon_activity_log", JSON.stringify(log));
  } catch {}
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────
function Orb({ size=180, col, pulse=false, label }) {
  return (
    <div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:"50%",
        background:`radial-gradient(circle at 38% 32%, ${col}55, ${col}20 45%, ${col}08 70%, transparent)`,
        border:`1.5px solid ${col}35`,
        boxShadow:`0 0 ${size*.35}px ${col}18, 0 0 ${size*.12}px ${col}30, inset 0 0 ${size*.2}px ${col}12`,
        animation:pulse?"orbFloat 4.5s ease-in-out infinite":"none",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all .6s ease",
      }}>
        {label && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, letterSpacing:2, color:col, opacity:.95 }}>{label}</span>}
      </div>
      <div style={{ position:"absolute", width:size*1.35, height:size*1.35, borderRadius:"50%", border:`1px solid ${col}18`, animation:pulse?"orbRing 4.5s ease-in-out infinite .4s":"none", pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:size*1.65, height:size*1.65, borderRadius:"50%", border:`1px solid ${col}08`, animation:pulse?"orbRing 4.5s ease-in-out infinite .9s":"none", pointerEvents:"none" }} />
    </div>
  );
}

function BackButton({ onBack, T, label }) {
  return (
    <button onClick={onBack} style={{ background:"none", border:"none", display:"flex", alignItems:"center", gap:6, color:T.muted, fontSize:13, padding:"52px 18px 0", cursor:"pointer", letterSpacing:.3 }}>
      <span style={{ fontSize:16 }}>←</span>
      <span>{label || "Back"}</span>
    </button>
  );
}

function PageShell({ children, onBack, backLabel, T }) {
  return (
    <div className="scroll-area fade-up" style={{ height:"100%", padding:"0 0 100px" }}>
      {onBack && T && <BackButton onBack={onBack} T={T} label={backLabel} />}
      {children}
    </div>
  );
}

// Sticky top bar with back arrow (left) and home button (right)
function PageNav({ onBack, onHome, backLabel, T, lang }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", padding:`calc(env(safe-area-inset-top,0px) + 14px) 18px 10px`, background:`${T.bg}ee`, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderBottom:`1px solid ${T.border}` }}>
      <button onClick={onBack} style={{ background:"none", border:"none", display:"flex", alignItems:"center", gap:5, color:T.muted, fontSize:14, padding:"4px 0", cursor:"pointer" }}>
        ← {backLabel || (lang==="Hindi"?"वापस":"Back")}
      </button>
      {onHome && (
        <button onClick={onHome} style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}30`, borderRadius:99, padding:"6px 14px", display:"flex", alignItems:"center", gap:5, color:T.accent, fontSize:13, cursor:"pointer" }}>
          🏡 {lang==="Hindi"?"होम":"Home"}
        </button>
      )}
    </div>
  );
}

function SectionLabel({ text, T }) {
  return <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:T.textSoft, letterSpacing:2, textTransform:"uppercase", margin:"0 0 14px", fontWeight:500 }}>{text}</p>;
}

function Card({ children, T, style={} }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:18, backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", ...style }}>
      {children}
    </div>
  );
}

function AmbientAura({ T }) {
  return (
    <div style={{ position:"fixed", top:"-20vh", left:"-20vw", width:"140vw", height:"140vh",
      background:`radial-gradient(circle at 30% 30%, ${T.accent}22 0%, ${T.accent}08 40%, transparent 70%)`,
      zIndex:0, pointerEvents:"none",
      animation:"auraBreath 14s infinite alternate ease-in-out",
      transition:"background 0.8s ease",
    }} />
  );
}

// ─── MEDITATION GUIDE ────────────────────────────────────────────────
function MeditationGuide({ sel, secs, T, lang, onSpeak }) {
  const total = sel.dur * 60;
  const elapsed = total - secs;
  const pct = elapsed / total;

  const hindiScripts = {
    1: [ // Morning Light — सुबह की रोशनी
      [0.0,  "आँखें धीरे से बंद करें। एक धीमी सांस लें।"],
      [0.1,  "दिन शुरू होने से पहले इस पल की शांति को महसूस करें।"],
      [0.25, "हर सांस के साथ, थोड़ी और गर्माहट अपने सीने में भरने दें।"],
      [0.5,  "आप यहाँ हैं। आप पर्याप्त हैं। दिन इंतज़ार कर सकता है।"],
      [0.75, "एक धीमा इरादा बनाएं — लक्ष्य नहीं, बस एक दिशा।"],
      [0.9,  "इस पल की रोशनी को धीरे-धीरे अपने साथ आगे ले जाने दें।"],
    ],
    2: [ // Heavy Heart — भारी दिल
      [0.0,  "आप सुरक्षित हैं। आप यहाँ हैं। अभी कुछ भी ज़रूरी नहीं।"],
      [0.15, "देखें कि शरीर में तनाव कहाँ है। बस देखें — लड़ें नहीं।"],
      [0.3,  "एक हाथ अपने सीने पर रखें। उसकी गर्माहट महसूस करें।"],
      [0.5,  "धीरे सांस लें — चार गिनती। हल्के से रोकें — दो। छोड़ें — छह।"],
      [0.7,  "आपने अब तक हर कठिन पल को पार किया है। यह भी गुज़र जाएगा।"],
      [0.88, "यहाँ थोड़ा और रुकें। आप थामे हुए हैं।"],
    ],
    3: [ // Earth Rest — धरती का आराम
      [0.0,  "अपने सिर के ऊपर से शुरू करें। वहाँ की त्वचा को ढीला छोड़ें।"],
      [0.12, "ढीलापन नीचे आने दें — माथा, आँखें, जबड़ा।"],
      [0.25, "आपके कंधे। तनाव महसूस हो तो बस सांस लें उसमें।"],
      [0.4,  "आपके हाथ, पेट — उन्हें भारी और गर्म होने दें।"],
      [0.6,  "कूल्हे, जाँघें, पिंडलियाँ — सब छोड़ रहे हैं।"],
      [0.78, "ज़मीन पर आपके पैर। आप जड़े हुए हैं। आप यहाँ हैं।"],
      [0.9,  "पूरा शरीर — एक साँस लेती, आराम करती चीज़।"],
    ],
    4: [ // Loving Kindness — प्रेम और करुणा
      [0.0,  "खुद से शुरू करें। आप भी दयालुता के हकदार हैं।"],
      [0.15, "मन में कहें: मैं शांत रहूँ। मैं ठीक रहूँ।"],
      [0.3,  "किसी प्रिय व्यक्ति को याद करें। उन्हें वही गर्माहट भेजें।"],
      [0.5,  "अब कोई अनजान — एक अजनबी जो आज मिला हो।"],
      [0.65, "अब कोई मुश्किल इंसान। बस एक छोटी-सी दुआ — उन्हें शांति मिले।"],
      [0.82, "इसे सभी दिशाओं में फैलाएं — सबके लिए, हर जगह।"],
    ],
    5: [ // Drifting to Sleep — नींद की ओर
      [0.0,  "आज आपने काफी किया। अब करना बंद करें।"],
      [0.1,  "शरीर का बोझ नीचे डूबता महसूस करें।"],
      [0.25, "आपकी सांस धीमी हो रही है। विचार मुलायम हो रहे हैं।"],
      [0.45, "छवियाँ बादलों की तरह गुज़रने दें — किसी को थामना नहीं।"],
      [0.65, "और गहरे। कुछ सुलझाना नहीं। कुछ बनना नहीं।"],
      [0.85, "आप सुरक्षित हैं। अब पूरी तरह छोड़ सकते हैं।"],
    ],
    6: [ // Quick Return — त्वरित वापसी
      [0.0,  "आप यहाँ हैं। आपके पाँव ज़मीन पर हैं।"],
      [0.3,  "अभी जो 5 चीज़ें दिख रही हैं उनका नाम लें।"],
      [0.6,  "अपनी सांस महसूस करें — अंदर और बाहर। आप इस पल में सुरक्षित हैं।"],
      [0.85, "यह पल असली है। आप असली हैं। आप ठीक हैं।"],
    ],
    7: [ // Still Water — शांत जल
      [0.0,  "एक शांत, गहरी झील की कल्पना करें — बिल्कुल स्थिर।"],
      [0.2,  "आपके विचार पत्थर हैं। उन्हें एक-एक कर डूबते देखें।"],
      [0.45, "पानी पत्थरों के पीछे नहीं भागता। आप भी नहीं।"],
      [0.7,  "बस सतह — शांत, गहरी, विशाल।"],
      [0.9,  "आप पानी हैं। पत्थर नहीं।"],
    ],
    8: [ // Forest Walk — जंगल की सैर
      [0.0,  "आप धीरे-धीरे एक जंगल में चल रहे हैं। कोई मंज़िल नहीं।"],
      [0.15, "पत्तों के बीच से आती रोशनी देखें। धब्बेदार और मुलायम।"],
      [0.3,  "पाँवों के नीचे मिट्टी नरम है। हर कदम आपको धीमा करता है।"],
      [0.5,  "कहीं पास पानी की आवाज़ आ रही है। कोई जल्दी नहीं।"],
      [0.68, "एक पेड़ से टिककर बैठें। छाल को अपना बोझ उठाने दें।"],
      [0.85, "आप यहाँ के हैं। प्रकृति में। धीमेपन में। ख़ामोशी में।"],
    ],
    9: [ // Heart Warmth — दिल की गर्माहट
      [0.0,  "दोनों हाथ अपने दिल पर रखें।"],
      [0.3,  "उस जगह गर्माहट की सांस लें। असली, शारीरिक गर्माहट।"],
      [0.6,  "इसे बाहर फैलने दें — सीना, कंधे, बाहें।"],
      [0.85, "आप इस गर्माहट के स्रोत हैं। यह हमेशा आपकी थी।"],
    ],
    10: [ // Nightly Release — रात का विसर्जन
      [0.0,  "आज रात, नींद में कुछ भी साथ ले जाने की ज़रूरत नहीं।"],
      [0.15, "एक धीमी सांस लें — और दिन को बाहर छोड़ें।"],
      [0.35, "एक-एक कर, पलों को जाने दें। हर सांस छोड़ती है।"],
      [0.55, "शरीर जानता है कैसे आराम करना है। उसे याद करने दें।"],
      [0.75, "रात लंबी है, शांत है, और आपकी है।"],
      [0.9,  "सब छोड़ दें। आज के लिए काफी है।"],
    ],
    11: [ // Breath Anchor — सांस का लंगर
      [0.0,  "तीन मिनट — बस आपकी सांस। और कुछ ज़रूरी नहीं।"],
      [0.3,  "धीरे सांस अंदर लें। फेफड़ों को फैलते महसूस करें। पूरी तरह बाहर।"],
      [0.65, "अगर कोई विचार आए, बस देखें। सांस पर वापस आएं।"],
      [0.9,  "सांस हमेशा यहाँ है। यही आपका लंगर है।"],
    ],
    12: [ // Compassion Rain — करुणा की बारिश
      [0.0,  "कल्पना करें कि करुणा आप पर धीमी बारिश की तरह बरस रही है।"],
      [0.25, "आपका हर हिस्सा — थके हुए हिस्से, अनिश्चित हिस्से।"],
      [0.5,  "सब पर एक जैसी, शांत, बिना शब्दों की देखभाल बरस रही है।"],
      [0.75, "आपको इसके लायक होने की ज़रूरत नहीं। यह वैसे भी बरसती है।"],
      [0.9,  "इसे सांस में लें। यह असली है। यह आपकी है।"],
    ],
  };

  const scripts = {
    1: [ // Morning Light
      [0.0,  "Close your eyes gently. Take a slow breath in."],
      [0.1,  "Feel the quiet of this moment before the day begins."],
      [0.25, "With each breath, let a little more warmth fill your chest."],
      [0.5,  "You are here. You are enough. The day can wait."],
      [0.75, "Begin to set one gentle intention — not a goal, just a direction."],
      [0.9,  "Slowly let the light of this moment carry you forward."],
    ],
    2: [ // Heavy Heart
      [0.0,  "You are safe. You are here. Right now, nothing is required."],
      [0.15, "Notice where in your body the tension lives. Just notice — don't fight it."],
      [0.3,  "Place one hand on your chest. Feel its warmth."],
      [0.5,  "Breathe in slowly — 4 counts. Hold gently — 2. Out — 6."],
      [0.7,  "You have survived every difficult moment until now. This one too will pass."],
      [0.88, "Rest here a moment longer. You are held."],
    ],
    3: [ // Earth Rest
      [0.0,  "Begin at the top of your head. Soften the skin there."],
      [0.12, "Let the softening move down — forehead, eyes, jaw."],
      [0.25, "Your shoulders. Notice any tension. Breathe into it."],
      [0.4,  "Your hands. Your belly. Let them be heavy and warm."],
      [0.6,  "Your hips, your thighs, your calves — all releasing."],
      [0.78, "Your feet against the ground. You are rooted. You are here."],
      [0.9,  "The whole body — one breathing, resting thing."],
    ],
    4: [ // Loving Kindness
      [0.0,  "Begin with yourself. You deserve kindness too."],
      [0.15, "Silently say: may I be at peace. May I be well."],
      [0.3,  "Call to mind someone you love easily. Send them the same warmth."],
      [0.5,  "Now someone neutral — a stranger you passed today."],
      [0.65, "Now someone difficult. Just a tiny wish — may they find peace."],
      [0.82, "Expand it outward to everyone, everywhere."],
    ],
    5: [ // Drifting to Sleep
      [0.0,  "You have done enough today. Let the doing be finished."],
      [0.1,  "Feel the weight of your body sinking down."],
      [0.25, "Your breath is slowing. Your thoughts are softening."],
      [0.45, "Let images drift by like clouds — no need to hold any of them."],
      [0.65, "Deeper now. Nothing to solve. Nothing to become."],
      [0.85, "You are safe. You can fully let go now."],
    ],
    6: [ // Quick Return
      [0.0,  "You are here. Your feet are on the ground."],
      [0.3,  "Name 5 things you can see right now."],
      [0.6,  "Feel your breath — in and out. You are safe in this moment."],
      [0.85, "This moment is real. You are real. You are okay."],
    ],
    7: [ // Still Water
      [0.0,  "Imagine a still, dark lake — perfectly calm."],
      [0.2,  "Your thoughts are stones. Watch them sink, one by one."],
      [0.45, "The water doesn't chase the stones. Neither do you."],
      [0.7,  "Just the surface — still, dark, spacious."],
      [0.9,  "You are the water. Not the stones."],
    ],
    8: [ // Forest Walk
      [0.0,  "You are walking slowly through a forest. No destination."],
      [0.15, "Notice the light coming through the leaves. Dappled and soft."],
      [0.3,  "The earth beneath your feet is soft. Each step slows you."],
      [0.5,  "You hear water somewhere nearby. There is no hurry."],
      [0.68, "Sit against a tree for a moment. Let the bark hold you."],
      [0.85, "You belong here. In nature. In slowness. In quiet."],
    ],
    9: [ // Heart Warmth
      [0.0,  "Place both hands on your heart."],
      [0.3,  "Breathe warmth into that space. Real, physical warmth."],
      [0.6,  "Let it spread outward — chest, shoulders, arms."],
      [0.85, "You are the source of this warmth. It was always yours."],
    ],
    10: [ // Nightly Release
      [0.0,  "Tonight, you don't need to carry anything into sleep."],
      [0.15, "Take a slow breath — and exhale the day."],
      [0.35, "One by one, let the moments go. Each breath releases."],
      [0.55, "Your body knows how to rest. Let it remember."],
      [0.75, "The night is long and quiet and yours."],
      [0.9,  "Release everything. You are done for today."],
    ],
    11: [ // Breath Anchor
      [0.0,  "Three minutes — just your breath. Nothing else required."],
      [0.3,  "Inhale slowly. Feel the lungs expand. Exhale fully."],
      [0.65, "If a thought comes, just watch it. Return to the breath."],
      [0.9,  "The breath is always here. It is your anchor."],
    ],
    12: [ // Compassion Rain
      [0.0,  "Imagine compassion falling on you like gentle rain."],
      [0.25, "Every part of you — the tired parts, the uncertain parts."],
      [0.5,  "All of it receiving the same gentle, wordless care."],
      [0.75, "You do not need to deserve it. It falls anyway."],
      [0.9,  "Breathe it in. It is real. It is yours."],
    ],
  };

  const isHindi = lang === "Hindi";
  const activeScripts = isHindi ? hindiScripts : scripts;
  const lines = activeScripts[sel.id] || activeScripts[1];
  const currentLine = [...lines].reverse().find(([t]) => pct >= t)?.[1] || lines[0][1];

  // Speak current line via browser TTS when it changes (Hindi only)
  const prevLineRef = useRef(null);
  useEffect(() => {
    if (!isHindi || !onSpeak) return;
    if (currentLine !== prevLineRef.current) {
      prevLineRef.current = currentLine;
      onSpeak(currentLine);
    }
  }, [currentLine, isHindi, onSpeak]);

  return (
    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:T.textSoft, lineHeight:1.8, textAlign:"center", maxWidth:300, margin:"0 auto 28px", minHeight:54, transition:"opacity 0.8s ease" }}>
      {currentLine}
    </p>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────
function Onboarding({ onComplete, setThemeKey, setLang, T }) {
  const [screen, setScreen] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [mood, setMood] = useState(null);
  const [lang, setLocalLang] = useState(null); // chosen on screen 0

  const chooseLang = (l) => {
    setLocalLang(l);
    setLang(l);
    setLeaving(true);
    setTimeout(() => { setScreen(1); setLeaving(false); }, 400);
  };

  const hi = lang === "Hindi";

  const SCREENS = [
    { langPick: true },
    { line1: hi?"स्वागत है।":"Welcome.", line2: hi?"JSukoon एक शांति का स्थान है — जब मन भारी हो, जब विचार दौड़ रहे हों, या जब बस एक पल की शांति चाहिए।":"JSukoon is a space for your mind — when thoughts race, when you feel heavy, or when you simply need one quiet moment.", sub:null, button: hi?"आगे":"Continue", legal:true },
    { features: true },
    { line1: hi?"न streak। न लक्ष्य।":"No streaks. No goals.", line2: hi?"यहाँ कोई दबाव नहीं है। आप जब चाहें आएं, जितना चाहें रुकें।":"No pressure here. Come when you need to. Stay as long as you like.", sub: hi?"यह जगह हमेशा आपके लिए है।":"This space is always here for you.", button: hi?"आगे":"Continue" },
    { line1: hi?"आज आप कैसे आए हैं?":"How are you arriving today?", line2:null, sub:null, button:null, mood:true },
    { line1: hi?"एक धीमी सांस लें।":"Take one slow breath.", line2: hi?"नाक से धीरे सांस लें — रोकें — और धीरे छोड़ें।":"Breathe in slowly through your nose — hold — and breathe out.", sub: hi?"जब तैयार हों, शुरू करें।":"When you are ready, begin.", button: hi?"JSukoon में प्रवेश करें":"Enter JSukoon", breathe:true },
  ];

  const ONBOARD_MOODS = [
    { emoji:"😔", label: hi?"भारी":"Heavy",      theme:"Maroon" },
    { emoji:"😐", label: hi?"अस्थिर":"Unsettled", theme:"TwilightBlue" },
    { emoji:"🙂", label: hi?"ठीक":"Okay",         theme:"SageSanctuary" },
    { emoji:"😊", label: hi?"गर्म":"Warm",         theme:"PinkChampagne" },
  ];

  const advance = (next) => {
    setLeaving(true);
    setTimeout(() => { setScreen(next); setLeaving(false); }, 400);
  };

  const handleMood = (m) => {
    setMood(m); setThemeKey(m.theme);
    setTimeout(() => advance(screen+1), 600);
  };

  const handleComplete = () => {
    setLeaving(true);
    setTimeout(() => { document.body.style.background="#050505"; onComplete(); }, 500);
  };

  const s = SCREENS[screen];
  const totalDots = SCREENS.length - 1; // exclude lang screen from dots

  return (
    <div style={{ position:"fixed", inset:0, zIndex:99998, background:"#050505",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"0 36px", opacity:leaving?0:1, transition:"opacity 0.5s ease" }}>

      {[...Array(8)].map((_,i) => (
        <div key={i} style={{ position:"absolute", top:`${8+i*11}%`, left:`${5+i*12}%`,
          width:i%3===0?2:1, height:i%3===0?2:1, borderRadius:"50%", background:"#ffffff",
          animation:`twinkle ${3+i*.7}s infinite alternate ease-in-out`,
          animationDelay:`${i*.3}s`, opacity:0.3, pointerEvents:"none" }} />
      ))}

      {screen > 0 && (
        <div style={{ position:"absolute", top:56, display:"flex", gap:8 }}>
          {Array.from({length:totalDots}).map((_,i) => (
            <div key={i} style={{ width:i===(screen-1)?20:6, height:6, borderRadius:99,
              background:i<screen?"#ffffff55":"#ffffff15", transition:"all 0.4s ease" }} />
          ))}
        </div>
      )}

      {/* ── SCREEN 0: Language picker ── */}
      {s.langPick && (
        <div style={{ width:"100%", maxWidth:320, textAlign:"center" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:4, textTransform:"uppercase", marginBottom:32 }}>JSukoon</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:"#e8e8e8", lineHeight:1.4, marginBottom:10, letterSpacing:.5 }}>
            Choose your language
          </h1>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:"rgba(255,255,255,0.5)", lineHeight:1.4, marginBottom:48 }}>
            अपनी भाषा चुनें
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <button onClick={() => chooseLang("English")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:18, padding:"20px 24px", color:"#e8e8e8", fontSize:18, fontFamily:"'Cormorant Garamond',serif", letterSpacing:2, transition:"all 0.3s ease" }}>
              English
            </button>
            <button onClick={() => chooseLang("Hindi")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:18, padding:"20px 24px", color:"#e8e8e8", fontSize:18, fontFamily:"'Cormorant Garamond',serif", letterSpacing:2, transition:"all 0.3s ease" }}>
              हिंदी
            </button>
          </div>
        </div>
      )}

      {/* ── FEATURES SCREEN ── */}
      {s.features && (
        <div style={{ width:"100%", maxWidth:360, padding:"0 8px" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:4, textTransform:"uppercase", textAlign:"center", marginBottom:16 }}>
            {hi?"यहाँ क्या है":"What's inside"}
          </p>
          {[
            { emoji:"🌀", title: hi?"दौड़ते विचार":"Racing Thoughts",    desc: hi?"श्वास और ग्राउंडिंग अभ्यास — मन को अभी शांत करने के लिए।":"Breathing and grounding tools — to calm your mind right now." },
            { emoji:"🧘", title: hi?"ध्यान":"Meditation",                 desc: hi?"12 गाइडेड सत्र — नींद, सुबह, करुणा, और अधिक के लिए।":"12 guided sessions — for sleep, mornings, compassion, and more." },
            { emoji:"📖", title: hi?"जर्नल":"Journal",                    desc: hi?"लिखें, बोलें, जलाएं। AI आपके विचारों पर शांत प्रतिबिंब देगा।":"Write, speak, burn. AI offers a calm reflection on what you share." },
            { emoji:"🌿", title: hi?"अभयारण्य":"Sanctuary",               desc: hi?"एक शांत कोना — परिवेश ध्वनि, उद्धरण, और बस बैठने की जगह।":"A quiet corner — ambient sound, quotes, and a place to just sit." },
          ].map((f,i) => (
            <div key={i} style={{ display:"flex", gap:14, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize:28, flexShrink:0, lineHeight:"1.5" }}>{f.emoji}</span>
              <div>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"rgba(255,255,255,0.85)", margin:"0 0 3px", fontWeight:400 }}>{f.title}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.6, margin:0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
          <button onClick={() => advance(screen+1)} style={{ width:"100%", marginTop:24, background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:99, padding:"14px 48px", color:"#e8e8e8", fontSize:14, fontFamily:"'DM Sans',sans-serif", letterSpacing:2, textTransform:"uppercase", transition:"all 0.3s ease" }}>
            {hi?"आगे":"Continue"}
          </button>
          <button onClick={handleComplete} style={{ marginTop:14, background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:12, letterSpacing:2, cursor:"pointer", width:"100%", padding:"6px 0" }}>
            {hi?"छोड़ें":"skip"}
          </button>
        </div>
      )}

      {/* ── SCREENS 1–5: Main onboarding ── */}
      {!s.langPick && !s.features && (
        <div style={{ width:"100%", maxWidth:340, textAlign:"center" }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:s.line1&&s.line1.length>20?28:36, fontWeight:300, color:"#e8e8e8", lineHeight:1.3, marginBottom:s.line2?20:32, letterSpacing:.5 }}>
            {s.line1}
          </h1>
          {s.line2 && <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:20, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:32 }}>{s.line2}</p>}
          {s.sub   && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.45)", letterSpacing:2, textTransform:"uppercase", marginBottom:48, lineHeight:1.8 }}>{s.sub}</p>}

          {s.mood && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:32 }}>
              {ONBOARD_MOODS.map(m => (
                <button key={m.label} onClick={() => handleMood(m)} style={{ background:mood?.label===m.label?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${mood?.label===m.label?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:16, padding:"14px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all 0.3s ease" }}>
                  <span style={{ fontSize:28 }}>{m.emoji}</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", letterSpacing:1 }}>{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {s.breathe && (
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
              <div style={{ width:90, height:90, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", background:"radial-gradient(circle, rgba(255,255,255,0.06), transparent)", animation:"orbFloat 5s ease-in-out infinite" }} />
            </div>
          )}

          {s.button && (
            <button onClick={() => screen===SCREENS.length-1 ? handleComplete() : advance(screen+1)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:99, padding:"14px 48px", color:"#e8e8e8", fontSize:14, fontFamily:"'DM Sans',sans-serif", letterSpacing:2, textTransform:"uppercase", transition:"all 0.3s ease" }}>
              {s.button}
            </button>
          )}
        </div>
      )}

      {!s.langPick && !s.features && s.legal && (
        <p style={{ position:"absolute", bottom:40, fontSize:12, color:"rgba(255,255,255,0.35)", textAlign:"center", lineHeight:1.7, padding:"0 24px", maxWidth:340 }}>
          {hi
            ?"यह ऐप चिकित्सा, मनोवैज्ञानिक या धार्मिक सलाह नहीं देता। उपयोग स्वैच्छिक है।"
            :"This application does not provide medical, psychological, therapeutic, or religious advice. Use is voluntary."}
        </p>
      )}

      {!s.langPick && !s.features && screen < SCREENS.length-1 && (
        <button onClick={handleComplete} style={{ position:"absolute", bottom:40, background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, letterSpacing:2, cursor:"pointer", padding:"10px 20px" }}>
          {hi?"छोड़ें":"skip"}
        </button>
      )}
    </div>
  );
}

// ─── RITUAL CURTAIN ──────────────────────────────────────────────────
function RitualCurtain({ T, onDone }) {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 3100);
    const t3 = setTimeout(() => setPhase(3), 6100);
    const t4 = setTimeout(() => { setVisible(false); setTimeout(onDone, 400); }, 9000);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);

  if (!visible) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:99999, background:"#050505",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      animation:phase>=3?"curtainFade 2s ease forwards":"none" }}>
      {[...Array(10)].map((_,i) => (
        <div key={i} style={{ position:"absolute", top:`${10+i*8}%`, left:`${5+i*10}%`, width:i%3===0?2:1.5, height:i%3===0?2:1.5, borderRadius:"50%", background:"#ffffff", animation:`twinkle ${3+i*.6}s infinite alternate ease-in-out`, animationDelay:`${i*.35}s`, opacity:.4 }} />
      ))}
      <div style={{ position:"absolute", textAlign:"center", padding:"0 30px", opacity:phase===1?1:0, transition:"opacity 1.5s ease" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:"#e0e0e0", letterSpacing:4, marginBottom:16 }}>You have arrived.</p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.4)", letterSpacing:2 }}>Nothing is required here.</p>
      </div>
      <div style={{ position:"absolute", display:"flex", flexDirection:"column", alignItems:"center", opacity:phase===2?1:0, transition:"opacity 1.5s ease" }}>
        <div style={{ width:70, height:70, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", background:"radial-gradient(circle, rgba(255,255,255,0.05), transparent)", animation:"orbFloat 5s ease-in-out infinite", marginBottom:28 }} />
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:300, letterSpacing:3, color:"#e0e0e0", textAlign:"center" }}>Take one slow breath.</p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginTop:12, textTransform:"uppercase" }}>INHALE 4 · HOLD 2 · EXHALE 6</p>
      </div>
      <div style={{ position:"absolute", textAlign:"center", opacity:phase===3?1:0, transition:"opacity 1.5s ease" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, fontWeight:300, color:"#e0e0e0", letterSpacing:5, textTransform:"uppercase" }}>Enter JSukoon Sanctuary</p>
      </div>
      <button onClick={() => { setVisible(false); setTimeout(onDone, 400); }} style={{ position:"absolute", bottom:90, background:"none", border:"none", color:"rgba(255,255,255,0.35)", fontSize:13, letterSpacing:2, cursor:"pointer", padding:"10px 20px" }}>(skip)</button>
    </div>
  );
}

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────
function ParticleCanvas({ mode, T }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, isPressing=false, mx=0, my=0;
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; };
    window.addEventListener("resize", resize); resize();
    const getXY = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x:(e.touches?e.touches[0].clientX:e.clientX)-r.left, y:(e.touches?e.touches[0].clientY:e.clientY)-r.top };
    };
    const onStart=(e)=>{ isPressing=true; const p=getXY(e); mx=p.x; my=p.y; if(navigator.vibrate)navigator.vibrate(30); };
    const onMove=(e)=>{ if(!isPressing)return; const p=getXY(e); mx=p.x; my=p.y; };
    const onEnd=()=>{ isPressing=false; };
    canvas.addEventListener("mousedown",onStart); canvas.addEventListener("touchstart",onStart,{passive:true});
    canvas.addEventListener("mousemove",onMove);  canvas.addEventListener("touchmove",onMove,{passive:true});
    window.addEventListener("mouseup",onEnd);     window.addEventListener("touchend",onEnd);
    const colors = mode==="burning"?["#ff4d4d","#ff944d","#ffcc44"]:mode==="sending"?["#a3c2fa","#ffffff","#c9b8ff"]:[T.accent,T.accentSoft,"#ffffff"];
    class Particle {
      constructor(){ this.reset(); }
      reset(){ this.x=Math.random()*canvas.width; this.y=canvas.height+20; this.size=Math.random()*2+1.2; this.speedY=Math.random()*-.5-.2; this.speedX=(Math.random()-.5)*.3; this.color=colors[Math.floor(Math.random()*colors.length)]; this.life=1; this.decay=Math.random()*.003+.001; }
      update(){ if(isPressing){ this.x+=(mx-this.x)*.03; this.y+=(my-this.y)*.03; } else { this.y+=this.speedY; this.x+=this.speedX; } this.life-=this.decay; if(this.life<=0)this.reset(); }
      draw(){ ctx.save(); ctx.globalAlpha=Math.max(this.life,.8); const og=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size*6); og.addColorStop(0,this.color); og.addColorStop(1,"transparent"); ctx.fillStyle=og; ctx.beginPath(); ctx.arc(this.x,this.y,this.size*7,0,Math.PI*2); ctx.fill(); const ig=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size); ig.addColorStop(0,"#ffffff"); ig.addColorStop(1,this.color); ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.restore(); }
    }
    const particles=[]; for(let i=0;i<40;i++)particles.push(new Particle());
    const render=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.update();p.draw();}); animId=requestAnimationFrame(render); };
    render();
    return ()=>{ window.removeEventListener("resize",resize); canvas.removeEventListener("mousedown",onStart); canvas.removeEventListener("touchstart",onStart); canvas.removeEventListener("mousemove",onMove); canvas.removeEventListener("touchmove",onMove); window.removeEventListener("mouseup",onEnd); window.removeEventListener("touchend",onEnd); cancelAnimationFrame(animId); };
  }, [mode, T]);
  return <canvas ref={canvasRef} style={{ width:"100%", height:"100%", position:"absolute", inset:0, zIndex:5, touchAction:"none" }} />;
}

// ─── ZEN BOX ─────────────────────────────────────────────────────────
function ZenBox({ T, lang }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const wavesRef = useRef([]);
  const animRef = useRef(null);
  const [count, setCount] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const countRef = useRef(0);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playTone = (x, canvasW) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      // pitch varies by x position — left is lower, right is higher
      const freq = 180 + (x / canvasW) * 320;
      osc.type = ["sine","triangle","sine","sine"][Math.floor(Math.random()*4)];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      pan.pan.setValueAtTime((x / canvasW) * 2 - 1, ctx.currentTime);
      osc.connect(gain); gain.connect(pan); pan.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.65);
    } catch(e) {}
  };

  const WAVE_SHAPES = ["circle", "hex", "star", "square", "ripple"];

  const addWave = (x, y, canvasW, canvasH, fingerIdx) => {
    const shape = WAVE_SHAPES[Math.floor(Math.random() * WAVE_SHAPES.length)];
    const hue = (fingerIdx * 60 + Math.random() * 40) % 360;
    const color = `hsla(${hue}, 70%, 70%,`;
    wavesRef.current.push({
      x, y, r: 0,
      maxR: Math.max(canvasW, canvasH) * (0.5 + Math.random() * 0.6),
      speed: 2.5 + Math.random() * 2.5,
      shape,
      color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      life: 1,
      decay: 0.008 + Math.random() * 0.006,
      lineWidth: 1.5 + Math.random() * 2,
      born: Date.now(),
    });
    playTone(x, canvasW);
    if (navigator.vibrate) navigator.vibrate(fingerIdx > 0 ? [15, 10, 15] : 20);
    countRef.current += 1;
    setCount(countRef.current);
  };

  const drawWaveShape = (ctx, w) => {
    const { x, y, r, shape, rotation } = w;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    } else if (shape === "hex") {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        i === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      }
      ctx.closePath();
    } else if (shape === "star") {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.45;
        i === 0 ? ctx.moveTo(Math.cos(a)*rad, Math.sin(a)*rad) : ctx.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
      }
      ctx.closePath();
    } else if (shape === "square") {
      ctx.rect(-r, -r, r*2, r*2);
    } else if (shape === "ripple") {
      // three concentric rings at different radii
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.moveTo(r*0.65, 0); ctx.arc(0, 0, r*0.65, 0, Math.PI*2);
      ctx.moveTo(r*0.32, 0); ctx.arc(0, 0, r*0.32, 0, Math.PI*2);
    }
    ctx.strokeStyle = `${w.color}${w.life.toFixed(2)})`;
    ctx.lineWidth = w.lineWidth;
    ctx.stroke();
    ctx.restore();
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wavesRef.current = wavesRef.current.filter(w => w.life > 0);
    wavesRef.current.forEach(w => {
      w.r += w.speed;
      w.rotation += w.rotSpeed;
      w.life -= w.decay;
      if (w.r < w.maxR) drawWaveShape(ctx, w);
      else w.life = 0;
    });
    animRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [fullscreen]);

  const handleTouch = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touches = e.changedTouches || e.touches;
    // 2+ fingers = go fullscreen
    if ((e.touches?.length || 1) >= 2 && !fullscreen) setFullscreen(true);
    Array.from(touches).forEach((t, i) => {
      addWave(t.clientX - rect.left, t.clientY - rect.top, canvas.width, canvas.height, i);
    });
  };

  const handleMouse = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    addWave(e.clientX - rect.left, e.clientY - rect.top, canvas.width, canvas.height, 0);
  };

  return (
    <div ref={containerRef} style={{
      position: fullscreen ? "fixed" : "relative",
      inset: fullscreen ? 0 : "auto",
      zIndex: fullscreen ? 9999 : 1,
      width: fullscreen ? "100vw" : "100%",
      height: fullscreen ? "100vh" : 80,
      background: fullscreen ? "#000" : T.surface,
      border: fullscreen ? "none" : `1px solid ${T.borderWarm}`,
      borderRadius: fullscreen ? 0 : 18,
      overflow: "hidden",
      cursor: "crosshair",
      touchAction: "none",
      transition: "height 0.3s ease",
    }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouse}
        onTouchStart={handleTouch}
        style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}
      />
      {/* Label — fades when waves appear */}
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", opacity: count > 0 ? 0.25 : 0.8, transition:"opacity 0.8s ease" }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color: fullscreen ? "#fff" : T.accent, letterSpacing:3, textAlign:"center" }}>
          {lang==="Hindi"?"छुएं — महसूस करें":"TOUCH  ·  FEEL"}
        </p>
        {!fullscreen && <p style={{ fontSize:12, color: T.textSoft, letterSpacing:1, marginTop:4 }}>{lang==="Hindi"?"दो उंगली = पूर्ण स्क्रीन":"two fingers = full screen"}</p>}
      </div>
      {/* Exit fullscreen button */}
      {fullscreen && (
        <button
          onClick={() => { setFullscreen(false); wavesRef.current = []; }}
          style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:99, color:"#fff", fontSize:12, padding:"8px 16px", letterSpacing:1, zIndex:10 }}>
          ✕ {lang==="Hindi"?"बंद करें":"close"}
        </button>
      )}
      {count > 0 && (
        <p style={{ position:"absolute", bottom:8, right:12, fontSize:11, color: fullscreen ? "rgba(255,255,255,0.4)" : T.textSoft, letterSpacing:1, pointerEvents:"none" }}>
          {count} {count===1?"touch":"touches"}
        </p>
      )}
    </div>
  );
}

// ─── BLOOM GAME ──────────────────────────────────────────────────────
function BloomGame({ T, lang }) {
  const canvasRef = useRef(null);
  const [taps, setTaps] = useState(0);
  const [message, setMessage] = useState("");
  const maxTaps = 6;
  const affirmations = ["CLEAR FOCUS","STEADY RHYTHM","A MOMENT OF PEACE","PERFECT HARMONY","CALM PRESENCE","STILLNESS FOUND"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const cx=canvas.width/2, cy=canvas.height/2;
    if (taps===0) {
      ctx.fillStyle=T.accent+"80"; ctx.font="300 11px 'DM Sans'"; ctx.textAlign="center";
      ctx.fillText(lang==="Hindi"?"छूने के लिए टैप करें":"TAP TO BLOOM",cx,cy); return;
    }
    for(let i=1;i<=taps;i++){
      ctx.beginPath(); ctx.arc(cx,cy,i*22,0,Math.PI*2);
      ctx.strokeStyle=T.accent+Math.floor((.15+i*.12)*255).toString(16).padStart(2,"0"); ctx.lineWidth=1.5; ctx.stroke();
      for(let j=0;j<8;j++){
        const angle=j*Math.PI/4+i*.2, px=cx+Math.cos(angle)*i*22, py=cy+Math.sin(angle)*i*22;
        ctx.beginPath(); ctx.arc(px,py,3+i,0,Math.PI*2); ctx.fillStyle=T.accent+"cc"; ctx.shadowBlur=15; ctx.shadowColor=T.accent; ctx.fill(); ctx.shadowBlur=0;
      }
    }
  }, [taps, T]);

  const handleTap = () => {
    if (taps<maxTaps) {
      const n=taps+1; setTaps(n); if(navigator.vibrate)navigator.vibrate(18);
      if(n===maxTaps){ setMessage(affirmations[Math.floor(Math.random()*affirmations.length)]); setTimeout(()=>{ setMessage(""); setTaps(0); },4000); }
    }
  };

  return (
    <div style={{ position:"relative", height:280, width:"100%", background:T.surface, borderRadius:20, border:`1px solid ${T.borderWarm}`, overflow:"hidden", cursor:"pointer" }} onClick={handleTap}>
      <canvas ref={canvasRef} style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} />
      {message && (
        <div className="fade-in" style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:10, background:T.surface+"cc", backdropFilter:"blur(8px)" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:T.accent, letterSpacing:4, textAlign:"center" }}>{message}</p>
        </div>
      )}
    </div>
  );
}

// ─── BREATH PAINTING ─────────────────────────────────────────────────
function BreathPainting({ T, lang }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [going, setGoing] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [done, setDone] = useState(false);
  const animRef = useRef(null);
  const phaseRef = useRef("idle");
  const cycleRef = useRef(0);
  const hueRef = useRef(0);
  const fillRef = useRef(0);
  const TARGET_CYCLES = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    const render = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const cx=canvas.width/2, cy=canvas.height/2;
      const maxR=Math.min(canvas.width,canvas.height)*.42;
      if(phaseRef.current==="inhale") fillRef.current=Math.min(fillRef.current+.008,1);
      else if(phaseRef.current==="exhale") {
        fillRef.current=Math.max(fillRef.current-.005,0);
        if(fillRef.current===0 && going) {
          cycleRef.current++; setCycles(cycleRef.current); hueRef.current=(hueRef.current+40)%360;
          if(cycleRef.current>=TARGET_CYCLES){ setDone(true); setGoing(false); phaseRef.current="idle"; creditSession(3); return; }
          phaseRef.current="inhale"; setPhase("inhale");
        }
      }
      const r=fillRef.current*maxR;
      if(r>0){
        const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        const h=hueRef.current;
        grad.addColorStop(0,`hsla(${h},60%,75%,0.9)`); grad.addColorStop(.5,`hsla(${h+30},50%,65%,0.5)`); grad.addColorStop(1,`hsla(${h+60},40%,55%,0.1)`);
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=grad; ctx.shadowBlur=30; ctx.shadowColor=`hsla(${h},60%,70%,0.4)`; ctx.fill(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.strokeStyle=`hsla(${h},50%,70%,0.3)`; ctx.lineWidth=1.5; ctx.stroke();
      }
      ctx.font="300 11px 'DM Sans'"; ctx.fillStyle="rgba(255,255,255,0.4)"; ctx.textAlign="center";
      if(phaseRef.current==="inhale") ctx.fillText(lang==="Hindi"?"सांस लें":"inhale",cx,cy+4);
      else if(phaseRef.current==="exhale") ctx.fillText(lang==="Hindi"?"छोड़ें":"exhale",cx,cy+4);
      else if(!done) ctx.fillText(lang==="Hindi"?"शुरू करें":"begin",cx,cy+4);
      animRef.current=requestAnimationFrame(render);
    };
    animRef.current=requestAnimationFrame(render);
    return ()=>cancelAnimationFrame(animRef.current);
  }, [going, lang]);

  const togglePhase=()=>{ if(!going)return; const next=phaseRef.current==="inhale"?"exhale":"inhale"; phaseRef.current=next; setPhase(next); if(navigator.vibrate)navigator.vibrate(20); };
  const start=()=>{ setGoing(true); setDone(false); setCycles(0); cycleRef.current=0; fillRef.current=0; hueRef.current=180; phaseRef.current="inhale"; setPhase("inhale"); };
  const reset=()=>{ setGoing(false); setDone(false); setCycles(0); cycleRef.current=0; fillRef.current=0; phaseRef.current="idle"; setPhase("idle"); };

  if(done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>🎨</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?"सुंदर।":"Beautiful."}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:260, margin:"0 auto 24px" }}>{lang==="Hindi"?"आपकी सांस ने एक पेंटिंग बनाई। यह आप ही थे।":"Your breath painted this. That was you."}</p>
      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>{lang==="Hindi"?"फिर से करें":"Begin again"}</button>
    </div>
  );

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, overflow:"hidden" }}>
      <div style={{ position:"relative", height:240 }} onClick={togglePhase}>
        <canvas ref={canvasRef} style={{ width:"100%", height:"100%", position:"absolute", inset:0 }} />
        {!going && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
            <button onClick={e=>{e.stopPropagation();start();}} style={{ background:`${T.accent}22`, border:`1px solid ${T.accent}55`, color:T.accent, fontSize:14, fontWeight:500, padding:"12px 32px", borderRadius:99, pointerEvents:"all" }}>
              {lang==="Hindi"?"शुरू करें":"Begin"}
            </button>
          </div>
        )}
      </div>
      {going && (
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ fontSize:12, color:T.muted, margin:0 }}>{lang==="Hindi"?`${cycles} / ${TARGET_CYCLES} सांस`:`${cycles} of ${TARGET_CYCLES} breaths`}</p>
          <p style={{ fontSize:12, color:T.accent, margin:0, fontStyle:"italic" }}>
            {phase==="inhale"?(lang==="Hindi"?"भरें — टैप करें छोड़ने के लिए":"filling — tap to exhale"):(lang==="Hindi"?"छोड़ें — टैप करें भरने के लिए":"releasing — tap to inhale")}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── STONE DROP ──────────────────────────────────────────────────────
function StoneDrop({ T, lang }) {
  const canvasRef = useRef(null);
  const [thought, setThought] = useState("");
  const [dropping, setDropping] = useState(false);
  const [done, setDone] = useState(false);
  const animRef = useRef(null);
  const stoneY = useRef(0);
  const ripples = useRef([]);

  const drop = () => {
    if (!thought.trim()) return;
    setDropping(true); stoneY.current=0; ripples.current=[];
    if(navigator.vibrate)navigator.vibrate([20,100,40]);
  };

  useEffect(() => {
    if (!dropping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    const W=canvas.width, H=canvas.height, cx=W/2;
    let speed=.5;
    const render = () => {
      ctx.clearRect(0,0,W,H);
      const waterGrad=ctx.createLinearGradient(0,H*.4,0,H); waterGrad.addColorStop(0,"rgba(30,50,80,0.6)"); waterGrad.addColorStop(1,"rgba(10,20,40,0.9)"); ctx.fillStyle=waterGrad; ctx.fillRect(0,H*.4,W,H*.6);
      ripples.current=ripples.current.filter(r=>r.opacity>0);
      ripples.current.forEach(r=>{ ctx.beginPath(); ctx.ellipse(cx,H*.42,r.rx,r.ry,0,0,Math.PI*2); ctx.strokeStyle=`rgba(120,180,220,${r.opacity})`; ctx.lineWidth=1; ctx.stroke(); r.rx+=1.5; r.ry+=.4; r.opacity-=.012; });
      const waterLine=H*.42;
      stoneY.current+=speed; speed+=.08;
      if(stoneY.current<waterLine){
        ctx.beginPath(); ctx.ellipse(cx,stoneY.current,14,10,0,0,Math.PI*2); ctx.fillStyle="rgba(100,100,120,0.9)"; ctx.shadowBlur=8; ctx.shadowColor="rgba(0,0,0,0.4)"; ctx.fill(); ctx.shadowBlur=0;
        ctx.font="9px 'DM Sans'"; ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.textAlign="center";
        ctx.fillText(thought.length>12?thought.slice(0,12)+"…":thought,cx,stoneY.current+3);
      } else {
        if(ripples.current.length===0){ for(let i=0;i<4;i++)ripples.current.push({rx:4+i*6,ry:2+i*1.5,opacity:.7-i*.1}); if(navigator.vibrate)navigator.vibrate(60); }
        const depth=Math.min((stoneY.current-waterLine)/(H*.5),1);
        ctx.beginPath(); ctx.ellipse(cx,waterLine+(stoneY.current-waterLine)*.6,14*(1-depth*.3),10*(1-depth*.3),0,0,Math.PI*2); ctx.fillStyle=`rgba(80,80,100,${.9-depth*.7})`; ctx.fill();
        if(depth>=1){ cancelAnimationFrame(animRef.current); setTimeout(()=>{ setDropping(false); setDone(true); creditSession(2); },800); return; }
      }
      animRef.current=requestAnimationFrame(render);
    };
    animRef.current=requestAnimationFrame(render);
    return ()=>cancelAnimationFrame(animRef.current);
  }, [dropping]);

  const reset=()=>{ setThought(""); setDone(false); setDropping(false); };

  if(done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>🌊</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?"डूब गया।":"It has sunk."}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:260, margin:"0 auto 24px" }}>{lang==="Hindi"?"वह विचार अब गहरे पानी में है। यहाँ आने की ज़रूरत नहीं।":"That thought is in deep water now. It does not need to surface."}</p>
      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>{lang==="Hindi"?"एक और छोड़ें":"Drop another"}</button>
    </div>
  );
  if(dropping) return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, overflow:"hidden" }}>
      <canvas ref={canvasRef} style={{ width:"100%", height:240, display:"block" }} />
    </div>
  );
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:T.textSoft, marginBottom:20, lineHeight:1.7, textAlign:"center" }}>
        {lang==="Hindi"?"एक भारी विचार लिखें। उसे पत्थर बनने दें। उसे जाने दें।":"Write a heavy thought. Let it become a stone. Let it go."}
      </p>
      <textarea value={thought} onChange={e=>setThought(e.target.value)} placeholder={lang==="Hindi"?"यहाँ लिखें…":"Write it here…"}
        style={{ width:"100%", minHeight:90, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px 14px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.6, resize:"none", outline:"none", marginBottom:16 }} />
      <button onClick={drop} disabled={!thought.trim()} style={{ width:"100%", background:thought.trim()?`${T.accent}22`:"transparent", border:`1px solid ${thought.trim()?T.accent+"50":T.border}`, color:thought.trim()?T.accent:T.muted, fontSize:14, fontWeight:500, padding:"13px", borderRadius:14, opacity:thought.trim()?1:.5 }}>
        {lang==="Hindi"?"पानी में छोड़ें":"Drop into the water"}
      </button>
    </div>
  );
}

// ─── METTA CIRCLES ───────────────────────────────────────────────────
function MettaCircles({ T, lang }) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState([]);
  const [done, setDone] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState("");
  const [micBlocked, setMicBlocked] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Pick the best recording format for this device
  const getBestMime = () => {
    if (isMobile) {
      // Mobile — prefer ogg/opus (Android WhatsApp) or mp4 (iOS)
      const mobile = ["audio/ogg;codecs=opus", "audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
      return mobile.find(t => MediaRecorder.isTypeSupported(t)) || "";
    } else {
      // Desktop — webm is fine, user will send via WhatsApp Web
      const desktop = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
      return desktop.find(t => MediaRecorder.isTypeSupported(t)) || "";
    }
  };

  const CIRCLES = [
    { label:lang==="Hindi"?"स्वयं":"Yourself",         sub:lang==="Hindi"?"केंद्र से शुरू करें":"Start at the center",     color:"#C88A8E", r:30 },
    { label:lang==="Hindi"?"प्रिय लोग":"Loved ones",   sub:lang==="Hindi"?"जो आपके करीब हैं":"Those closest to you",       color:"#D4A373", r:60 },
    { label:lang==="Hindi"?"परिचित":"Acquaintances",   sub:lang==="Hindi"?"जिन्हें आप जानते हैं":"People you know",         color:"#7A9EA8", r:90 },
    { label:lang==="Hindi"?"अजनबी":"Strangers",        sub:lang==="Hindi"?"अनजान लोग":"Those you have never met",           color:"#8aaa7a", r:120 },
    { label:lang==="Hindi"?"कठिन लोग":"Difficult ones",sub:lang==="Hindi"?"जो कठिन लगते हैं":"Those who challenge you",    color:"#726FBA", r:150 },
  ];

  // Pick the best audio format — WhatsApp supports ogg/opus on Android, mp4/aac on iOS
  const getBestRecordingMime = () => {
    // Just pick best recording quality — we convert to mp3 after
    const types = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm"];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = async () => {
    setMicBlocked(false);
    setShareError("");
    try {
      if (navigator.permissions) {
        const perm = await navigator.permissions.query({ name: "microphone" });
        if (perm.state === "denied") { setMicBlocked(true); return; }
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mime = getBestMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const finalMime = mr.mimeType || mime || "audio/webm";
        const ext = finalMime.includes("ogg") ? "ogg"
                  : finalMime.includes("mp4") ? "m4a"
                  : "webm";
        const blob = new Blob(chunksRef.current, { type: finalMime });
        blob._ext = ext;
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };
      mr.start();
      setIsRecording(true);
    } catch(e) {
      if (e.name === "NotAllowedError") setMicBlocked(true);
      else setShareError(lang==="Hindi"?"माइक्रोफ़ोन उपलब्ध नहीं।":"Microphone unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Draw warmth circles + names onto a canvas and return a PNG blob
  const generateWarmthImage = (recipient, sender) => new Promise((resolve) => {
    const W = 800, H = 800;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const CIRCLES_DEF = [
      { color:"#C88A8E", r:60,  label:lang==="Hindi"?"स्वयं":"Yourself" },
      { color:"#D4A373", r:120, label:lang==="Hindi"?"प्रिय लोग":"Loved ones" },
      { color:"#7A9EA8", r:180, label:lang==="Hindi"?"परिचित":"Acquaintances" },
      { color:"#8aaa7a", r:240, label:lang==="Hindi"?"अजनबी":"Strangers" },
      { color:"#726FBA", r:300, label:lang==="Hindi"?"कठिन लोग":"Difficult ones" },
    ];

    // Background — deep dark
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);

    // Subtle radial glow in center
    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 320);
    glow.addColorStop(0, "rgba(212,163,115,0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Draw concentric circles (outermost first)
    [...CIRCLES_DEF].reverse().forEach(c => {
      ctx.beginPath();
      ctx.arc(W/2, H/2 + 30, c.r, 0, Math.PI * 2);
      ctx.strokeStyle = c.color + "70";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Faint fill
      ctx.fillStyle = c.color + "10";
      ctx.fill();
    });

    // Center heart dot
    const cx = W/2, cy = H/2 + 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#C88A8E50";
    ctx.fill();
    ctx.strokeStyle = "#C88A8E";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Heart emoji in center
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText("🫀", cx, cy);

    // Top label — JSukoon
    ctx.font = "500 15px sans-serif";
    ctx.fillStyle = "#ffffff40";
    ctx.textAlign = "center";
    ctx.fillText("JSukoon  •  jsukoon.vercel.app", W/2, 42);

    // Big recipient name
    const displayName = recipient || (lang==="Hindi"?"आपको":"You");
    ctx.font = "300 52px Georgia, serif";
    ctx.fillStyle = "#D4A373";
    ctx.textAlign = "center";
    ctx.fillText(displayName, W/2, 118);

    // Warmth message line
    const msg = lang==="Hindi"
      ? "को प्रेम, शांति और सुख मिले।"
      : "May you be at peace. May you be well.";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillStyle = "#ffffff90";
    ctx.fillText(msg, W/2, 158);

    // Bottom — from sender
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#ffffff50";
    const fromText = sender
      ? (lang==="Hindi" ? `— ${sender} की ओर से 💛` : `— with love from ${sender} 💛`)
      : "— from JSukoon 💛";
    ctx.fillText(fromText, W/2, H - 52);

    // Thin gold border
    ctx.strokeStyle = "#D4A37340";
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    canvas.toBlob(blob => resolve(blob), "image/png");
  });

  const shareWarmth = async () => {
    setShareError("");
    const recipient = recipientName.trim() || (lang==="Hindi"?"आपको":"you");
    const sender = senderName.trim();
    const fromPart = sender
      ? (lang==="Hindi" ? ` — ${sender} की ओर से` : ` — with love from ${sender}`)
      : (lang==="Hindi" ? " — JSukoon से" : " — from JSukoon");
    const text = lang==="Hindi"
      ? `💛 ${recipient} के लिए गर्माहट का संदेश${fromPart}

✨ JSukoon से भेजा गया — jsukoon.vercel.app पर आएं`
      : `💛 A message of warmth for ${recipient}${fromPart}

✨ Sent with JSukoon — find your sukoon at jsukoon.vercel.app`;

    const safeRecipient = recipient.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30);

    // Generate the warmth image
    const imgBlob = await generateWarmthImage(recipient, sender);
    const imgURL = URL.createObjectURL(imgBlob);
    setImageURL(imgURL);
    const imgFile = new File([imgBlob], `warmth-for-${safeRecipient}.png`, { type: "image/png" });

    // Try native share with image (works on mobile — WhatsApp, email, etc.)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [imgFile] })) {
      try {
        await navigator.share({ files: [imgFile], text });
        setShared(true);
        return;
      } catch(e) {
        if (e.name === "AbortError") return;
        // fall through to download
      }
    }

    // Desktop or share failed — download the PNG
    const a = document.createElement("a");
    a.href = imgURL;
    a.download = `warmth-for-${safeRecipient}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShared(true);
  };

  const sendWarmth = () => {
    setGlowing(true);
    if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    setTimeout(() => {
      setGlowing(false);
      setSent(p => [...p, step]);
      if (step < CIRCLES.length - 1) setStep(s => s + 1);
      else { setDone(true); creditSession(4); creditMetta(); }
    }, 800);
  };

  const reset = () => {
    setStep(0); setSent([]); setDone(false); setGlowing(false);
    setRecipientName(""); setSenderName("");
    setAudioBlob(null); setAudioURL(null); setImageURL(null);
    setShared(false); setShareError(""); setMicBlocked(false);
  };

  const current = CIRCLES[step];

  if (done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>💛</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>
        {lang==="Hindi"?"गर्माहट फैल गई।":"Warmth has spread."}
      </h3>
      <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.7, margin:"0 auto 20px", maxWidth:260 }}>
        {lang==="Hindi"?"आपने खुद से शुरू करके सबको प्रेम दिया। यह साहस है।":"You sent warmth from yourself outward to all. That is courage."}
      </p>

      <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:16, padding:"16px", marginBottom:20, textAlign:"left" }}>
        <p style={{ fontSize:11, color:T.accent, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 12px", fontWeight:500 }}>
          💛 {lang==="Hindi"?"किसी को भेजें":"Send to someone"}
        </p>

        <input
          value={recipientName}
          onChange={e => setRecipientName(e.target.value)}
          placeholder={lang==="Hindi"?"किसे भेजना है? नाम या रिश्ता…":"Who is this for? (e.g. Mum, best friend)"}
          style={{ width:"100%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", marginBottom:8, boxSizing:"border-box" }}
        />
        <input
          value={senderName}
          onChange={e => setSenderName(e.target.value)}
          placeholder={lang==="Hindi"?"आपका नाम (वैकल्पिक)":"Your name (optional)"}
          style={{ width:"100%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", marginBottom:12, boxSizing:"border-box" }}
        />

        {micBlocked ? (
          <div style={{ background:"rgba(224,102,102,0.1)", border:"1px solid #e0666640", borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
            <p style={{ fontSize:13, color:"#e06666", margin:0, lineHeight:1.6 }}>
              {lang==="Hindi"
                ? "माइक्रोफ़ोन की अनुमति नहीं है। ब्राउज़र के address bar में 🔒 आइकन पर क्लिक करके माइक्रोफ़ोन चालू करें।"
                : "Microphone blocked. Click the 🔒 icon in your browser address bar → allow microphone → come back here."}
            </p>
          </div>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{ width:"100%", background:isRecording?"rgba(224,102,102,0.15)":T.surface, border:`1px solid ${isRecording?"#e06666":T.border}`, borderRadius:12, padding:"11px", color:isRecording?"#e06666":T.textSoft, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:audioURL?10:12, boxSizing:"border-box" }}
          >
            {isRecording
              ? `🛑 ${lang==="Hindi"?"रिकॉर्डिंग रोकें":"Stop recording"}`
              : audioURL
              ? `🔄 ${lang==="Hindi"?"फिर से रिकॉर्ड करें":"Re-record message"}`
              : `🎙️ ${lang==="Hindi"?"आवाज़ में संदेश रिकॉर्ड करें":"Record a voice message"}`}
          </button>
        )}

        {audioURL && (
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:11, color:T.muted, margin:"0 0 6px" }}>
              {lang==="Hindi"?"सुनें:":"Preview:"}
            </p>
            <audio controls src={audioURL} style={{ width:"100%", height:36 }} />
          </div>
        )}

        {shareError && (
          <p style={{ fontSize:12, color:"#e06666", margin:"0 0 8px", textAlign:"center" }}>{shareError}</p>
        )}

        {(audioURL || recipientName.trim()) && !micBlocked && (
          <button
            onClick={shareWarmth}
            style={{ width:"100%", background:`${T.accent}18`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:14, fontWeight:500, padding:"12px", borderRadius:12, boxSizing:"border-box" }}
          >
            {shared
              ? (lang==="Hindi"?"✓ भेज दिया / डाउनलोड हुआ":"✓ Shared / Downloaded!")
              : (lang==="Hindi"?"💛 गर्माहट साझा करें":"💛 Share this warmth")}
          </button>
        )}

        {shared && (
          <p style={{ fontSize:11, color:T.muted, textAlign:"center", marginTop:8, lineHeight:1.6 }}>
            {isMobile
              ? (lang==="Hindi"?"📱 WhatsApp से भेजें।":"📱 Choose WhatsApp from the share sheet.")
              : (lang==="Hindi"?"💻 ऑडियो फ़ाइल डाउनलोड हुई। WhatsApp Web खोलें → अटैचमेंट → फ़ाइल चुनें।":"💻 Audio file downloaded. Open WhatsApp Web → attachment → choose the file.")}
          </p>
        )}
      </div>

      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>
        {lang==="Hindi"?"फिर से करें":"Begin again"}
      </button>
    </div>
  );

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px" }}>
      {step === 1 && (
        <div style={{ marginBottom:16 }}>
          <input
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            placeholder={lang==="Hindi"?"किसका नाम सोच रहे हैं? (वैकल्पिक)":"Who are you thinking of? (optional)"}
            style={{ width:"100%", background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}
          />
        </div>
      )}
      <div style={{ position:"relative", height:180, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        {[...CIRCLES].reverse().map((c,i) => {
          const idx = CIRCLES.length-1-i;
          const isSent = sent.includes(idx);
          const isCurrent = idx === step;
          return (
            <div key={i} style={{ position:"absolute", width:c.r*2, height:c.r*2, borderRadius:"50%", border:`1.5px solid ${isSent||isCurrent?c.color+"80":T.border}`, background:isSent?`${c.color}12`:"transparent", transition:"all 0.6s ease", boxShadow:isCurrent&&glowing?`0 0 20px ${c.color}50`:"none" }} />
          );
        })}
        <div style={{ position:"absolute", width:30, height:30, borderRadius:"50%", background:`${CIRCLES[0].color}40`, border:`2px solid ${CIRCLES[0].color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🫀</div>
      </div>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <p style={{ fontSize:12, color:T.textSoft, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>
          {lang==="Hindi"?"अभी भेजें":"Sending warmth to"}
        </p>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:current.color, fontWeight:400, marginBottom:4 }}>
          {step===1 && recipientName.trim() ? recipientName.trim() : current.label}
        </h3>
        <p style={{ fontSize:12, color:T.muted }}>{current.sub}</p>
      </div>
      <div style={{ background:T.surfaceAlt, borderRadius:14, padding:"12px 16px", marginBottom:20, textAlign:"center" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:14, color:T.textSoft, lineHeight:1.7, margin:0 }}>
          {lang==="Hindi"
            ? `"${step===1&&recipientName.trim()?recipientName.trim():current.label} को प्रेम, शांति और सुख मिले।"`
            : `"May ${step===1&&recipientName.trim()?recipientName.trim():current.label.toLowerCase()} be at peace. May they be well."`}
        </p>
      </div>
      <button onClick={sendWarmth} style={{ width:"100%", background:glowing?`${current.color}35`:`${current.color}18`, border:`1px solid ${current.color}50`, color:current.color, fontSize:14, fontWeight:500, padding:"13px", borderRadius:14, transition:"all 0.3s ease", boxShadow:glowing?`0 0 20px ${current.color}40`:"none" }}>
        {glowing
          ? (lang==="Hindi"?"भेज रहे हैं…":"Sending…")
          : (lang==="Hindi"?"गर्माहट भेजें 💛":"Send Warmth 💛")}
      </button>
      <p style={{ fontSize:12, color:T.textSoft, textAlign:"center", marginTop:10, letterSpacing:1, textTransform:"uppercase", opacity:.6 }}>
        {lang==="Hindi"?`${step+1} / ${CIRCLES.length}`:`${step+1} of ${CIRCLES.length}`}
      </p>
    </div>
  );
}

// ─── NADI SHODHANA ───────────────────────────────────────────────────
function NadiShodhana({ T, lang }) {
  const [going, setGoing] = useState(false);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("inhale_left");
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const tmRef = useRef(null);
  const phaseRef = useRef("inhale_left");
  const countRef = useRef(0);
  const roundRef = useRef(0);
  const TARGET_ROUNDS = 5;
  const PHASES = [
    { key:"inhale_left",  label:lang==="Hindi"?"बाईं नाक से सांस लें":"Inhale — Left nostril",  nostril:"left",  dur:4, emoji:"👈" },
    { key:"hold",         label:lang==="Hindi"?"रोकें":"Hold both",                              nostril:"both",  dur:4, emoji:"🤲" },
    { key:"exhale_right", label:lang==="Hindi"?"दाईं नाक से छोड़ें":"Exhale — Right nostril",   nostril:"right", dur:6, emoji:"👉" },
    { key:"inhale_right", label:lang==="Hindi"?"दाईं नाक से सांस लें":"Inhale — Right nostril", nostril:"right", dur:4, emoji:"👉" },
    { key:"hold2",        label:lang==="Hindi"?"रोकें":"Hold both",                              nostril:"both",  dur:4, emoji:"🤲" },
    { key:"exhale_left",  label:lang==="Hindi"?"बाईं नाक से छोड़ें":"Exhale — Left nostril",    nostril:"left",  dur:6, emoji:"👈" },
  ];
  useEffect(() => {
    if(!going){ clearTimeout(tmRef.current); return; }
    let pi=PHASES.findIndex(p=>p.key===phaseRef.current); if(pi<0)pi=0;
    const tick=()=>{
      countRef.current++; setCount(countRef.current);
      if(countRef.current>=PHASES[pi].dur){ countRef.current=0; pi=(pi+1)%PHASES.length; if(pi===0){ roundRef.current++; setRound(roundRef.current); if(roundRef.current>=TARGET_ROUNDS){ setGoing(false); setDone(true); creditSession(4); return; } } phaseRef.current=PHASES[pi].key; setPhase(PHASES[pi].key); setCount(0); if(navigator.vibrate)navigator.vibrate(15); }
      tmRef.current=setTimeout(tick,1000);
    };
    tmRef.current=setTimeout(tick,1000);
    return()=>clearTimeout(tmRef.current);
  }, [going]);
  const stop=()=>{ setGoing(false); setPhase("inhale_left"); setCount(0); setRound(0); phaseRef.current="inhale_left"; countRef.current=0; roundRef.current=0; };
  const curPhase=PHASES.find(p=>p.key===phase);
  const phProg=curPhase?count/curPhase.dur:0;
  if(done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>🌬️</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?"नाड़ी शोधन पूर्ण।":"Nadi Shodhana complete."}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:260, margin:"0 auto 24px" }}>{lang==="Hindi"?"दोनों नाड़ियाँ अब संतुलित हैं। आप शांत हैं।":"Both channels are now balanced. You are settled."}</p>
      <button onClick={()=>{ setDone(false); stop(); }} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>{lang==="Hindi"?"फिर से करें":"Begin again"}</button>
    </div>
  );
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px" }}>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {[...Array(TARGET_ROUNDS)].map((_,i) => (<div key={i} style={{ flex:1, height:3, borderRadius:99, background:i<round?T.accent:i===round&&going?`${T.accent}55`:T.surfaceAlt, transition:"background 0.4s ease" }} />))}
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:24 }}>
        {["left","right"].map(side => (<div key={side} style={{ width:64, height:64, borderRadius:"50%", background:curPhase?.nostril===side||curPhase?.nostril==="both"?`${T.accent}25`:T.surfaceAlt, border:`2px solid ${curPhase?.nostril===side||curPhase?.nostril==="both"?T.accent:T.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, transition:"all 0.4s ease", boxShadow:going&&(curPhase?.nostril===side||curPhase?.nostril==="both")?`0 0 16px ${T.accent}35`:"none" }}>
          <span style={{ fontSize:22 }}>{side==="left"?"👈":"👉"}</span>
          <span style={{ fontSize:12, color:T.textSoft, letterSpacing:1 }}>{side==="left"?(lang==="Hindi"?"बाईं":"Left"):(lang==="Hindi"?"दाईं":"Right")}</span>
        </div>))}
      </div>
      {going && <>
        <p style={{ fontSize:14, color:T.text, textAlign:"center", fontWeight:500, marginBottom:8 }}>{curPhase?.label}</p>
        <div style={{ width:"100%", height:3, background:T.surfaceAlt, borderRadius:99, marginBottom:20 }}>
          <div style={{ height:"100%", width:`${phProg*100}%`, background:T.accent, borderRadius:99, transition:"width 1s linear" }} />
        </div>
      </>}
      <p style={{ fontSize:12, color:T.muted, textAlign:"center", marginBottom:16 }}>{lang==="Hindi"?`चक्र ${round} / ${TARGET_ROUNDS}`:`Round ${round} of ${TARGET_ROUNDS}`}</p>
      <button onClick={()=>going?stop():setGoing(true)} style={{ width:"100%", background:going?`${T.muted}18`:`${T.accent}22`, border:`1px solid ${going?T.muted+"35":T.accent+"55"}`, color:going?T.muted:T.accent, fontSize:14, fontWeight:500, padding:"13px", borderRadius:14 }}>
        {going?(lang==="Hindi"?"रोकें":"Stop"):(lang==="Hindi"?"शुरू करें":"Begin")}
      </button>
    </div>
  );
}

// ─── UNSENT LETTER ───────────────────────────────────────────────────
function UnsentLetter({ T, lang }) {
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [mode, setMode] = useState(null);
  const send=(m)=>{ if(!text.trim())return; setMode(m); setSending(true); if(navigator.vibrate)navigator.vibrate(m==="burn"?[40,80,40]:[20,150,20]); setTimeout(()=>{ setSending(false); setDone(true); creditSession(3); },4000); };
  const reset=()=>{ setTo(""); setText(""); setDone(false); setSending(false); setMode(null); };
  if(sending) return (
    <div className="fade-in" style={{ height:280, position:"relative", background:mode==="burn"?"#1a0505":"#050b1a", borderRadius:20, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <ParticleCanvas mode={mode==="burn"?"burning":"sending"} T={T} />
      <div style={{ zIndex:10, textAlign:"center" }}><p style={{ color:mode==="burn"?"#e06666":"#6fa8dc", fontSize:18, letterSpacing:3, fontFamily:"'Cormorant Garamond',serif" }}>{mode==="burn"?(lang==="Hindi"?"जल रहा है…":"Burning…"):(lang==="Hindi"?"जा रहा है…":"Releasing…")}</p></div>
    </div>
  );
  if(done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>{mode==="burn"?"🔥":"✉️"}</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{mode==="burn"?(lang==="Hindi"?"जल गया।":"Released."):(lang==="Hindi"?"भेज दिया।":"Sent.")}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:260, margin:"0 auto 24px" }}>{mode==="burn"?(lang==="Hindi"?"जो कहा नहीं जा सका वह अब मुक्त है।":"What could not be said is now free."):(lang==="Hindi"?"यह पत्र उन तक पहुँच गया जहाँ शब्द जाते हैं।":"This letter has reached where words go.")}</p>
      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>{lang==="Hindi"?"एक और लिखें":"Write another"}</button>
    </div>
  );
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:15, color:T.textSoft, marginBottom:20, lineHeight:1.7, textAlign:"center" }}>{lang==="Hindi"?"किसी को एक पत्र लिखें जो आप कभी नहीं भेज सकते।":"Write a letter to someone you can never send it to."}</p>
      <input value={to} onChange={e=>setTo(e.target.value)} placeholder={lang==="Hindi"?"किसे? (वैकल्पिक)":"To whom? (optional)"} style={{ width:"100%", background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", marginBottom:12 }} />
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={lang==="Hindi"?"यहाँ लिखें — बिना किसी डर के…":"Write here — without fear…"} style={{ width:"100%", minHeight:120, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:14, padding:"12px 14px", color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.7, resize:"none", outline:"none", marginBottom:16 }} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <button onClick={()=>send("burn")} disabled={!text.trim()} style={{ background:"rgba(224,102,102,0.1)", border:"1px solid rgba(224,102,102,0.3)", borderRadius:14, padding:"13px 8px", color:"#e06666", fontSize:13, fontWeight:500, opacity:text.trim()?1:.5 }}>🔥 {lang==="Hindi"?"जलाएं":"Burn it"}</button>
        <button onClick={()=>send("release")} disabled={!text.trim()} style={{ background:"rgba(111,168,220,0.1)", border:"1px solid rgba(111,168,220,0.3)", borderRadius:14, padding:"13px 8px", color:"#6fa8dc", fontSize:13, fontWeight:500, opacity:text.trim()?1:.5 }}>✨ {lang==="Hindi"?"भेजें":"Release it"}</button>
      </div>
    </div>
  );
}

// ─── BILATERAL TAPPING ───────────────────────────────────────────────
function BilateralTapping({ T, lang }) {
  const [active, setActive] = useState(null);
  const [count, setCount] = useState(0);
  const [lastSide, setLastSide] = useState(null);
  const [sets, setSets] = useState(0);
  const [done, setDone] = useState(false);
  const [going, setGoing] = useState(false);
  const TARGET_SETS=6, TAPS_PER_SET=8;
  const playTone=(side)=>{ try{ if(!audioCtxRef.current)audioCtxRef.current=new(window.AudioContext||window.webkitAudioContext)(); const ctx=audioCtxRef.current; const osc=ctx.createOscillator(); const gain=ctx.createGain(); const panner=ctx.createStereoPanner(); osc.connect(gain); gain.connect(panner); panner.connect(ctx.destination); osc.frequency.value=side==="left"?220:280; panner.pan.value=side==="left"?-.8:.8; gain.gain.setValueAtTime(.15,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.3); osc.start(ctx.currentTime); osc.stop(ctx.currentTime+.3); }catch{} };
  const handleTap=(side)=>{ if(!going||side===lastSide)return; if(navigator.vibrate)navigator.vibrate(side==="left"?[30]:[20]); setActive(side); setTimeout(()=>setActive(null),200); playTone(side); setLastSide(side); const nc=count+1; setCount(nc); if(nc%TAPS_PER_SET===0){ const ns=sets+1; setSets(ns); if(ns>=TARGET_SETS){ setTimeout(()=>{ setDone(true); setGoing(false); creditSession(3); },600); } } };
  const reset=()=>{ setActive(null); setCount(0); setLastSide(null); setSets(0); setDone(false); setGoing(false); };
  if(done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>🧠</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?"संतुलन मिला।":"Balance found."}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:260, margin:"0 auto 24px" }}>{lang==="Hindi"?"दोनों तरफ का स्पर्श मन को शांत करता है। आप अभी अधिक स्थिर हैं।":"Alternating touch helps the body settle. You are more at ease now than when you began."}</p>
      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>{lang==="Hindi"?"फिर से करें":"Begin again"}</button>
    </div>
  );
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px" }}>
      <div style={{ width:"100%", height:3, background:T.surfaceAlt, borderRadius:99, marginBottom:20 }}>
        <div style={{ height:"100%", width:`${(sets/TARGET_SETS)*100}%`, background:T.accent, borderRadius:99, transition:"width 0.4s ease" }} />
      </div>
      <p style={{ fontSize:13, color:T.muted, textAlign:"center", marginBottom:6, lineHeight:1.6 }}>
        {!going?(lang==="Hindi"?"तैयार होने पर शुरू करें":"Tap Begin when you are ready"):lastSide===null?(lang==="Hindi"?"किसी भी तरफ से शुरू करें":"Start on either side"):lastSide==="left"?(lang==="Hindi"?"अब दाईं तरफ":"Now right →"):(lang==="Hindi"?"← अब बाईं तरफ":"← Now left")}
      </p>
      <p style={{ fontSize:10, color:T.muted, textAlign:"center", letterSpacing:2, textTransform:"uppercase", marginBottom:20, opacity:.5 }}>{lang==="Hindi"?`${sets} / ${TARGET_SETS} सेट`:`${sets} of ${TARGET_SETS} sets`}</p>
      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        {["left","right"].map(side => (<button key={side} onPointerDown={()=>handleTap(side)} style={{ flex:1, height:130, borderRadius:20, background:active===side?`${T.accent}30`:T.surfaceAlt, border:`2px solid ${active===side?T.accent:T.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.15s ease", transform:active===side?"scale(0.97)":"scale(1)", boxShadow:active===side?`0 0 24px ${T.accent}35`:"none" }}>
          <span style={{ fontSize:28 }}>{side==="left"?"👈":"👉"}</span>
          <span style={{ fontSize:11, color:T.muted, letterSpacing:1, textTransform:"uppercase" }}>{side==="left"?(lang==="Hindi"?"बाएं":"Left"):(lang==="Hindi"?"दाएं":"Right")}</span>
        </button>))}
      </div>
      <button onClick={()=>going?reset():setGoing(true)} style={{ width:"100%", background:going?`${T.muted}18`:`${T.accent}22`, border:`1px solid ${going?T.muted+"35":T.accent+"55"}`, color:going?T.muted:T.accent, fontSize:14, fontWeight:500, padding:"13px", borderRadius:14 }}>
        {going?(lang==="Hindi"?"रोकें":"Stop"):(lang==="Hindi"?"शुरू करें":"Begin")}
      </button>
    </div>
  );
}

// ─── SENSORY ANCHOR ──────────────────────────────────────────────────
function SensoryAnchor({ T, lang }) {
  const STEPS = [
    { count:5, sense:lang==="Hindi"?"देखें":"See",   icon:"👁️", instruction:lang==="Hindi"?"5 चीज़ें जो आप देख सकते हैं":"5 things you can see",   color:"#7A9EA8" },
    { count:4, sense:lang==="Hindi"?"सुनें":"Hear",  icon:"👂", instruction:lang==="Hindi"?"4 चीज़ें जो आप सुन सकते हैं":"4 things you can hear",  color:"#8aaa7a" },
    { count:3, sense:lang==="Hindi"?"छुएं":"Touch",  icon:"🤚", instruction:lang==="Hindi"?"3 चीज़ें जो आप छू सकते हैं":"3 things you can touch", color:"#D4A373" },
    { count:2, sense:lang==="Hindi"?"सूंघें":"Smell", icon:"👃", instruction:lang==="Hindi"?"2 चीज़ें जो आप सूंघ सकते हैं":"2 things you can smell",color:"#C88A8E" },
    { count:1, sense:lang==="Hindi"?"चखें":"Taste",  icon:"👅", instruction:lang==="Hindi"?"1 चीज़ जो आप चख सकते हैं":"1 thing you can taste",  color:"#726FBA" },
  ];
  const [stepIdx, setStepIdx] = useState(0);
  const [tapped, setTapped] = useState([]);
  const [done, setDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const step = STEPS[stepIdx];
  const handleTap=(i)=>{ if(tapped.includes(i))return; if(navigator.vibrate)navigator.vibrate(25); const next=[...tapped,i]; setTapped(next); if(next.length===step.count){ setTimeout(()=>{ if(stepIdx<STEPS.length-1){ setTransitioning(true); setTimeout(()=>{ setStepIdx(s=>s+1); setTapped([]); setTransitioning(false); },500); } else { setDone(true); creditSession(2); } },400); } };
  const reset=()=>{ setStepIdx(0); setTapped([]); setDone(false); setTransitioning(false); };
  if(done) return (
    <div className="fade-in" style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"32px 20px", textAlign:"center" }}>
      <span style={{ fontSize:48, display:"block", marginBottom:16 }}>🌿</span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?"आप वापस आ गए।":"You are back."}</h3>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:24, maxWidth:240, margin:"0 auto 24px" }}>{lang==="Hindi"?"आपकी इंद्रियों ने आपको इस पल में लाया। यह काफी है।":"Your senses have returned you to this moment. That is enough."}</p>
      <button onClick={reset} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, color:T.accent, fontSize:13, padding:"10px 28px", borderRadius:99 }}>{lang==="Hindi"?"फिर से करें":"Begin again"}</button>
    </div>
  );
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:20, padding:"24px 20px", opacity:transitioning?0:1, transition:"opacity 0.5s ease" }}>
      <div style={{ display:"flex", gap:6, marginBottom:24 }}>
        {STEPS.map((s,i) => (<div key={i} style={{ flex:1, height:3, borderRadius:99, background:i<stepIdx?s.color:i===stepIdx?`${s.color}55`:T.surfaceAlt, transition:"background 0.4s ease" }} />))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
        <div style={{ width:44, height:44, borderRadius:14, background:`${step.color}18`, border:`1px solid ${step.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{step.icon}</div>
        <div>
          <p style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", margin:"0 0 2px" }}>{lang==="Hindi"?"अभी":"Right now"}</p>
          <p style={{ fontSize:15, color:T.text, fontWeight:500, margin:0 }}>{step.instruction}</p>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:14, margin:"28px 0", flexWrap:"wrap" }}>
        {[...Array(step.count)].map((_,i) => (<button key={i} onClick={()=>handleTap(i)} style={{ width:52, height:52, borderRadius:"50%", background:tapped.includes(i)?`${step.color}30`:T.surfaceAlt, border:`2px solid ${tapped.includes(i)?step.color:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"all 0.3s ease", transform:tapped.includes(i)?"scale(1.1)":"scale(1)", boxShadow:tapped.includes(i)?`0 0 16px ${step.color}40`:"none" }}>{tapped.includes(i)?"✓":i+1}</button>))}
      </div>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:14, color:T.muted, textAlign:"center", lineHeight:1.6, margin:"0 0 8px" }}>
        {tapped.length===0?(lang==="Hindi"?"प्रत्येक को ढूंढने पर टैप करें।":"Tap each one as you find it."):tapped.length<step.count?(lang==="Hindi"?`${step.count-tapped.length} और…`:`${step.count-tapped.length} more…`):(lang==="Hindi"?"बढ़िया…":"Good…")}
      </p>
      <p style={{ fontSize:10, color:T.muted, textAlign:"center", letterSpacing:2, textTransform:"uppercase", opacity:.5 }}>{lang==="Hindi"?`चरण ${stepIdx+1} / ${STEPS.length}`:`Step ${stepIdx+1} of ${STEPS.length}`}</p>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────
const MOOD_SUGGESTIONS = {
  "Numb":       { tone:"#888888", msg:l=>l==="Hindi"?"सुन्नपन महसूस होना भी एक भावना है।":"Feeling numb is still feeling something.", cta:l=>l==="Hindi"?"बस बेंच पर बैठें। कुछ ज़रूरी नहीं।":"Just sit. Nothing is required of you.", action:"bench", actionLabel:l=>l==="Hindi"?"अभयारण्य खोलें":"Open the Sanctuary", secondaryAction:"audio", secondaryLabel:l=>l==="Hindi"?"या ध्वनि सुनें →":"Or listen to sounds →" },
  "Heavy":      { tone:"#9B3D4F", msg:l=>l==="Hindi"?"आप कुछ भारी लेकर चल रहे हैं।":"You're carrying something heavy.", cta:l=>l==="Hindi"?"एक 2 मिनट की श्वास मदद कर सकती है।":"A 2-minute breath might help.", action:"practice", actionLabel:l=>l==="Hindi"?"त्वरित वापसी · 2 मिनट":"Quick Return · 2 min", secondaryAction:"reflection", secondaryLabel:l=>l==="Hindi"?"या इसे जलाएं →":"Or burn it in Reflection →" },
  "Anxious":    { tone:"#726FBA", msg:l=>l==="Hindi"?"चिंता आपसे बड़ी नहीं है।":"Your anxiety is not bigger than you.", cta:l=>l==="Hindi"?"5-4-3-2-1 — अभी वापस आएं।":"5-4-3-2-1 — come back to right now.", action:"focus", actionLabel:l=>l==="Hindi"?"5-4-3-2-1 वापसी":"5-4-3-2-1 Return", secondaryAction:"practice", secondaryLabel:l=>l==="Hindi"?"या बॉक्स श्वास →":"Or Box Breathing →" },
  "Frustrated": { tone:"#5D93C4", msg:l=>l==="Hindi"?"परेशानी को बाहर निकालें।":"Let the frustration have somewhere to go.", cta:l=>l==="Hindi"?"इसे जलाएं या लिखें।":"Burn it or write it out.", action:"reflection", actionLabel:l=>l==="Hindi"?"चिंतन खोलें":"Open Reflection", secondaryAction:"journal", secondaryLabel:l=>l==="Hindi"?"या जर्नल में लिखें →":"Or write in your journal →" },
  "Exhausted":  { tone:"#7B9075", msg:l=>l==="Hindi"?"थकान को स्वीकार करना भी साहस है।":"Acknowledging exhaustion takes courage.", cta:l=>l==="Hindi"?"नींद के लिए ध्यान करें।":"A sleep meditation might be what you need.", action:"audio", actionLabel:l=>l==="Hindi"?"ध्यान क्लिप्स":"Meditation Clips", secondaryAction:"bench", secondaryLabel:l=>l==="Hindi"?"या बस लेट जाएं →":"Or just rest →" },
  "Unsettled":  { tone:"#B07D62", msg:l=>l==="Hindi"?"बेचैनी महसूस होना सामान्य है।":"Feeling unsettled is valid.", cta:l=>l==="Hindi"?"कुछ ज़मीन ढूंढते हैं।":"Let's find some ground.", action:"practice", actionLabel:l=>l==="Hindi"?"एंकर श्वास · 4 मिनट":"Anchor Breathing · 4 min", secondaryAction:"focus", secondaryLabel:l=>l==="Hindi"?"या ग्राउंडिंग गेम →":"Or a grounding game →" },
  "Quiet":      { tone:"#7A9EA8", msg:l=>l==="Hindi"?"यह शांति मूल्यवान है — इसे थामें।":"This quietness is precious — hold it.", cta:l=>l==="Hindi"?"ध्वनि के साथ इसे गहरा करें।":"Deepen it with sound.", action:"bench", actionLabel:l=>l==="Hindi"?"अभयारण्य में जाएं":"Go to the Sanctuary", secondaryAction:"journal", secondaryLabel:l=>l==="Hindi"?"या लिखें →":"Or write →" },
  "Okay":       { tone:"#6B765F", msg:l=>l==="Hindi"?"स्थिर रहना एक अच्छी जगह है।":"Steady is a good place to be.", cta:l=>l==="Hindi"?"थोड़ा लिखें — यह मदद करता है।":"Write a little — it helps.", action:"journal", actionLabel:l=>l==="Hindi"?"जर्नल खोलें":"Open your journal", secondaryAction:"practice", secondaryLabel:l=>l==="Hindi"?"या अभ्यास खोजें →":"Or explore practices →" },
  "Gentle":     { tone:"#D4A373", msg:l=>l==="Hindi"?"आज आप खुद के प्रति कोमल हैं।":"There's a gentleness in you today.", cta:l=>l==="Hindi"?"इसे किसी को भेजें।":"Send some of it to someone you love.", action:"warmth", actionLabel:l=>l==="Hindi"?"गर्माहट भेजें":"Send Warmth", secondaryAction:"journal", secondaryLabel:l=>l==="Hindi"?"या लिखें →":"Or write it down →" },
  "Warm":       { tone:"#C88A8E", msg:l=>l==="Hindi"?"एक गर्म एहसास — इसे धीरे से थामें।":"A warm feeling — hold it gently.", cta:l=>l==="Hindi"?"लिखें, या किसी को गर्माहट भेजें।":"Write a little, or send warmth.", action:"warmth", actionLabel:l=>l==="Hindi"?"गर्माहट भेजें":"Send Warmth", secondaryAction:"journal", secondaryLabel:l=>l==="Hindi"?"या जर्नल में लिखें →":"Or write in your journal →" },
  "Grateful":   { tone:"#C5A059", msg:l=>l==="Hindi"?"कृतज्ञता एक दुर्लभ और शक्तिशाली भावना है।":"Gratitude is rare and powerful.", cta:l=>l==="Hindi"?"इसे लिख लें — ताकि याद रहे।":"Write it down before it fades.", action:"journal", actionLabel:l=>l==="Hindi"?"जर्नल खोलें":"Open your journal", secondaryAction:"warmth", secondaryLabel:l=>l==="Hindi"?"या किसी को गर्माहट भेजें →":"Or send warmth to someone →" },
  "Radiant":    { tone:"#4A9EBB", msg:l=>l==="Hindi"?"यह चमक आप में से आ रही है।":"This brightness is coming from inside you.", cta:l=>l==="Hindi"?"इसे फैलाएं।":"Spread it.", action:"warmth", actionLabel:l=>l==="Hindi"?"गर्माहट भेजें":"Send Warmth", secondaryAction:"journal", secondaryLabel:l=>l==="Hindi"?"या इस पल को लिखें →":"Or write this moment down →" },
};

function Home({ setTab, T, lang, themeKey, setThemeKey }) {
  const [mood, setMood] = useLS("jsukoon_today_mood", null);
  const [stats]  = useLS("jsukoon_stats",  { sessions:0, minutes:0, streak:0 });
  const [weekData] = useLS("jsukoon_week", { Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0 });
  const [entries] = useLS("jsukoon_journal", []);
  const [showMoodPage, setShowMoodPage] = useState(false);
  const weekSessions = Object.values(weekData||{}).reduce((a,b)=>a+(b||0),0);

  const h = new Date().getHours();
  const greeting = lang==="Hindi"
    ? (h<12?"सुप्रभात":h<17?"शुभ दोपहर":"शुभ संध्या")
    : (h<12?"Good morning":h<17?"Good afternoon":"Good evening");

  const [themeSource] = useLS("jsukoon_theme_source", "auto");
  const handleMood = (m) => {
    setMood(m);
    // Clearing old context — new mood = fresh emotional start
    clearEmotionalCtx();
    // Only auto-apply mood theme if user hasn't manually chosen a theme in Settings
    if (themeSource !== "manual") {
      const mapped = MOOD_THEMES[m.label];
      if (mapped) setThemeKey(mapped);
    }
  };

  // Weekly check-in nudge — show once per week
  const thisWeekKey = (() => { const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toDateString(); })();
  const [nudgeDismissed, setNudgeDismissed] = useLS("jsukoon_nudge_dismissed", "");
  const showNudge = nudgeDismissed !== thisWeekKey && weekSessions > 0;

  // Auto-dismiss nudge after 30 seconds
  useEffect(() => {
    if (!showNudge) return;
    const t = setTimeout(() => setNudgeDismissed(thisWeekKey), 30000);
    return () => clearTimeout(t);
  }, [showNudge]);

  const suggestion = mood ? MOOD_SUGGESTIONS[mood.label] : null;

  // ── Mood page ──────────────────────────────────────────────
  if (showMoodPage) {
    const hi = lang === "Hindi";
    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"auto" }}>
        <div style={{ padding:"52px 24px 0", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <button onClick={() => setShowMoodPage(false)} style={{ background:"none", border:"none", color:T.textSoft, fontSize:14, padding:0, display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
              ← {hi?"वापस":"Back"}
            </button>
            <button onClick={() => { setShowMoodPage(false); setTab("home"); }} style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}30`, borderRadius:99, padding:"6px 14px", color:T.accent, fontSize:13, cursor:"pointer" }}>
              🏡 {hi?"होम":"Home"}
            </button>
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, color:T.text, fontWeight:300, marginBottom:6, letterSpacing:.5 }}>
            {hi?"आज आप कैसे हैं?":"How are you?"}
          </h1>
          <p style={{ fontSize:13, color:T.muted, marginBottom:28, lineHeight:1.6 }}>
            {hi?"एक चुनें — बस इतना काफी है।":"Choose one — that is enough."}
          </p>
        </div>
        <div style={{ padding:"0 24px", flexShrink:0 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:28 }}>
            {MOODS.map(m => {
              const isSelected = mood?.label === m.label;
              const sg = MOOD_SUGGESTIONS[m.label];
              return (
                <button key={m.val} onClick={() => { handleMood(m); }}
                  style={{ background:isSelected?`${sg?.tone||T.accent}18`:T.surface, border:`1.5px solid ${isSelected?(sg?.tone||T.accent)+"55":T.border}`, borderRadius:18, padding:"16px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.25s", boxShadow:isSelected?`0 0 20px ${sg?.tone||T.accent}20`:"none" }}>
                  <span style={{ fontSize:34 }}>{m.emoji}</span>
                  <span style={{ fontSize:11, color:isSelected?(sg?.tone||T.accent):T.textSoft, fontWeight:isSelected?600:400, letterSpacing:.3, textAlign:"center", lineHeight:1.3 }}>
                    {lang==="Hindi" ? m.labelH : m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {mood && suggestion && (
          <div style={{ padding:"0 24px 100px", flexShrink:0 }}>
            <div style={{ background:`${suggestion.tone}12`, border:`1px solid ${suggestion.tone}30`, borderRadius:20, padding:"20px 18px" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:suggestion.tone, fontWeight:400, margin:"0 0 6px", lineHeight:1.4 }}>
                {suggestion.msg(lang)}
              </p>
              <p style={{ fontSize:13, color:T.textSoft, margin:"0 0 20px", lineHeight:1.6 }}>
                {suggestion.cta(lang)}
              </p>
              <button onClick={() => { setShowMoodPage(false); setTab(suggestion.action); }}
                style={{ width:"100%", background:`${suggestion.tone}20`, border:`1px solid ${suggestion.tone}40`, borderRadius:14, padding:"14px 16px", color:suggestion.tone, fontSize:14, fontWeight:600, marginBottom:10 }}>
                {suggestion.actionLabel(lang)}
              </button>
              <button onClick={() => { setShowMoodPage(false); setTab(suggestion.secondaryAction); }}
                style={{ width:"100%", background:"none", border:"none", color:T.muted, fontSize:13, padding:"8px 0" }}>
                {suggestion.secondaryLabel(lang)}
              </button>
            </div>
            <button onClick={() => setMood(null)} style={{ background:"none", border:"none", color:T.muted, fontSize:12, marginTop:16, cursor:"pointer", display:"block", margin:"16px auto 0" }}>
              {hi?"मूड हटाएं":"Clear mood"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Determine if dark theme for glass effect ──────────────
  const isDark = [T.bg].some(c => {
    const m = c.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    if (!m) return true;
    return (parseInt(m[1],16)*0.299 + parseInt(m[2],16)*0.587 + parseInt(m[3],16)*0.114) < 128;
  });

  const glass = (accentCol) => ({
    background: isDark
      ? `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`
      : `linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 100%)`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: isDark
      ? `1px solid rgba(255,255,255,0.12)`
      : `1px solid rgba(255,255,255,0.7)`,
    boxShadow: isDark
      ? `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`
      : `0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
  });

  // ── Daily ritual engine ────────────────────────────────────
  const getDailyRitual = () => {
    const today = new Date().toDateString();
    const stored = (() => { try { return JSON.parse(localStorage.getItem("jsukoon_daily_ritual")||"{}"); } catch { return {}; } })();
    if (stored.date === today && stored.task) return stored.task;
    // Rotate through ritual types based on day-of-week + stats
    const h = new Date().getDay();
    const totalSessions = stats?.sessions || 0;
    const tasks = [
      { emoji:"🌬️", title:lang==="Hindi"?"बॉक्स श्वास — 4 मिनट":"Box Breathing — 4 min", desc:lang==="Hindi"?"एक पुरानी तकनीक, आज का काम":"An ancient technique. Your task today.", tab:"practice", accent:"#7A9EA8" },
      { emoji:"📖", title:lang==="Hindi"?"एक पंक्ति लिखें":"Write one line", desc:lang==="Hindi"?"बस एक वाक्य — आज क्या सच है?":"Just one sentence — what is true today?", tab:"journal", accent:"#D4A373" },
      { emoji:"🔥", title:lang==="Hindi"?"एक विचार जलाएं":"Burn one thought", desc:lang==="Hindi"?"जो मन में है — उसे छोड़ें":"Whatever is sitting heavy — let it go.", tab:"reflection", accent:"#9B3D4F" },
      { emoji:"🌿", title:lang==="Hindi"?"बेंच पर बैठें":"Sit on the Bench", desc:lang==="Hindi"?"2 मिनट। बस बैठें।":"2 minutes. Just sit.", tab:"bench", accent:"#6B765F" },
      { emoji:"👁️", title:lang==="Hindi"?"5-4-3-2-1 वापसी":"5-4-3-2-1 Return", desc:lang==="Hindi"?"अभी यहाँ वापस आएं":"Come back to right now.", tab:"focus", accent:"#726FBA" },
      { emoji:"❤️", title:lang==="Hindi"?"किसी को गर्माहट भेजें":"Send warmth to someone", desc:lang==="Hindi"?"एक आवाज़, एक प्यार":"One voice note, one act of love.", tab:"warmth", accent:"#C88A8E" },
      { emoji:"🎵", title:lang==="Hindi"?"5 मिनट सुनें":"Listen for 5 minutes", desc:lang==="Hindi"?"ध्वनि में डूबें":"Let a sound hold you.", tab:"audio", accent:"#5D93C4" },
    ];
    // Pick task based on day + session count (so it cycles meaningfully)
    const idx = (h + Math.floor(totalSessions / 3)) % tasks.length;
    const task = tasks[idx];
    try { localStorage.setItem("jsukoon_daily_ritual", JSON.stringify({ date:today, task })); } catch {}
    return task;
  };
  const dailyRitual = getDailyRitual();
  const [ritualDismissed, setRitualDismissed] = useLS("jsukoon_ritual_dismissed", "");
  const today = new Date().toDateString();
  const showRitual = ritualDismissed !== today;

  // ── Main home ─────────────────────────────────────────────
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>

      {/* TOP BAR */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 24px 0" }}>
        <div>
          <p style={{ fontSize:10, color:T.muted, letterSpacing:3, textTransform:"uppercase", margin:"0 0 3px" }}>{greeting.toUpperCase()}</p>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.accentSoft, letterSpacing:2, fontWeight:300 }}>JSukoon</span>
        </div>
      </div>

      {/* SEND WARMTH — hero position, just below branding */}
      <div style={{ width:"88%", maxWidth:380, margin:"14px auto 0" }}>
        <button onClick={() => setTab("warmth")}
          style={{ width:"100%", ...glass(), borderRadius:20, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, border:`1px solid rgba(255,150,150,0.3)`, background: isDark ? "linear-gradient(135deg, rgba(200,138,142,0.12), rgba(255,150,150,0.05))" : "linear-gradient(135deg, rgba(255,200,200,0.4), rgba(255,255,255,0.5))" }}>
          <span style={{ fontSize:22 }}>❤️</span>
          <div style={{ textAlign:"left", flex:1 }}>
            <span style={{ fontSize:13, color:T.textSoft, fontWeight:600, letterSpacing:.5, display:"block" }}>{lang==="Hindi"?"किसी को गर्माहट भेजें":"Send Warmth to Someone"}</span>
            <span style={{ fontSize:10, color:T.muted, opacity:.8 }}>{lang==="Hindi"?"आवाज़ + तस्वीर भेजें · WhatsApp":"Voice + image · straight to WhatsApp"}</span>
          </div>
          <span style={{ color:"#C88A8E", fontSize:16 }}>→</span>
        </button>
      </div>

      {/* DAILY RITUAL ENGINE */}
      {showRitual && dailyRitual && (
        <div style={{ width:"88%", maxWidth:380, margin:"10px auto 0" }}>
          <button onClick={() => setTab(dailyRitual.tab)}
            style={{ width:"100%", background:`${dailyRitual.accent}12`, border:`1px solid ${dailyRitual.accent}35`, borderRadius:18, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{dailyRitual.emoji}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:11, color:dailyRitual.accent, letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 2px", fontWeight:600 }}>
                {lang==="Hindi"?"आज का अभ्यास":"Today's practice"}
              </p>
              <p style={{ fontSize:13, color:T.text, fontWeight:500, margin:"0 0 1px" }}>{dailyRitual.title}</p>
              <p style={{ fontSize:11, color:T.muted, margin:0 }}>{dailyRitual.desc}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setRitualDismissed(today); }}
              style={{ background:"none", border:"none", color:T.muted, fontSize:16, padding:"2px 4px", flexShrink:0 }}>×</button>
          </button>
        </div>
      )}

      {/* WEEKLY NUDGE — 1–2 lines, dismissible */}
      {showNudge && (
        <div style={{ margin:"10px 24px 0", background:`${T.accent}10`, border:`1px solid ${T.accent}22`, borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <p style={{ fontSize:12, color:T.textSoft, lineHeight:1.5, flex:1 }}>
            {lang==="Hindi"
              ? `इस सप्ताह ${weekSessions} सत्र 🌿`
              : `${weekSessions} session${weekSessions!==1?"s":""} this week 🌿`}
          </p>
          <button onClick={() => { setNudgeDismissed(thisWeekKey); setTab("progress"); }}
            style={{ background:"none", border:"none", color:T.accent, fontSize:11, fontWeight:600, letterSpacing:.5, whiteSpace:"nowrap" }}>
            {lang==="Hindi"?"देखें →":"See →"}
          </button>
          <button onClick={() => setNudgeDismissed(thisWeekKey)}
            style={{ background:"none", border:"none", color:T.muted, fontSize:16, lineHeight:1, padding:"0 2px" }}>×</button>
        </div>
      )}

      {/* FOUR SQUARE GLASS GRID */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, width:"88%", maxWidth:380 }}>

          {/* TOP LEFT — All Tools */}
          <button onClick={() => setTab("more")}
            style={{ aspectRatio:"1", ...glass(), borderRadius:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, transition:"transform 0.15s ease", position:"relative", overflow:"hidden", padding:"12px 10px" }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 30% 30%, rgba(150,200,255,0.12), transparent 65%)`, borderRadius:28 }} />
            <span style={{ fontSize:36, lineHeight:1, position:"relative", zIndex:1 }}>✨</span>
            <span style={{ fontSize:11, color:T.textSoft, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, position:"relative", zIndex:1, textAlign:"center" }}>{lang==="Hindi"?"सब कुछ":"All Tools"}</span>
            <span style={{ fontSize:12, color:T.textSoft, opacity:.9, position:"relative", zIndex:1, textAlign:"center", lineHeight:1.4 }}>{lang==="Hindi"?"अभ्यास, जर्नल, और सब कुछ":"Practice, journal, everything"}</span>
          </button>

          {/* TOP RIGHT — My Mood */}
          <button onClick={() => setShowMoodPage(true)}
            style={{ aspectRatio:"1", ...glass(), borderRadius:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, transition:"transform 0.15s ease", position:"relative", overflow:"hidden", padding:"12px 10px", border: mood ? `1px solid ${(MOOD_SUGGESTIONS[mood.label]?.tone||T.accent)}40` : undefined }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 70% 30%, rgba(255,220,100,0.12), transparent 65%)`, borderRadius:28 }} />
            <span style={{ fontSize:40, lineHeight:1, position:"relative", zIndex:1 }}>{mood ? mood.emoji : "🌤️"}</span>
            <span style={{ fontSize:11, color:mood?(MOOD_SUGGESTIONS[mood.label]?.tone||T.accent):T.textSoft, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, position:"relative", zIndex:1, textAlign:"center" }}>
              {mood ? mood.label : (lang==="Hindi"?"मेरा मूड":"My Mood")}
            </span>
            <span style={{ fontSize:10, color:mood?(MOOD_SUGGESTIONS[mood.label]?.tone||T.accent):T.textSoft, opacity:.7, position:"relative", zIndex:1, textAlign:"center", lineHeight:1.4 }}>
              {mood ? (lang==="Hindi"?"बदलें या आगे बढ़ें":"Change or get guidance") : (lang==="Hindi"?"आज आप कैसे हैं?":"How are you today?")}
            </span>
          </button>

          {/* BOTTOM LEFT — Sanctuary */}
          <button onClick={() => setTab("bench")}
            style={{ aspectRatio:"1", ...glass(), borderRadius:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, transition:"transform 0.15s ease", position:"relative", overflow:"hidden", padding:"12px 10px" }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 30% 70%, rgba(100,180,130,0.12), transparent 65%)`, borderRadius:28 }} />
            <span style={{ fontSize:36, lineHeight:1, position:"relative", zIndex:1 }}>🌿</span>
            <span style={{ fontSize:11, color:T.textSoft, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, position:"relative", zIndex:1, textAlign:"center" }}>{lang==="Hindi"?"अभयारण्य":"Sanctuary"}</span>
            <span style={{ fontSize:12, color:T.textSoft, opacity:.9, position:"relative", zIndex:1, textAlign:"center", lineHeight:1.4 }}>{lang==="Hindi"?"एक शांत कोना — ध्वनि, उद्धरण":"Quiet sounds, quotes, calm"}</span>
          </button>

          {/* BOTTOM RIGHT — Racing Thoughts */}
          <button onClick={() => { sessionStorage.setItem("jsukoon_context","racing"); setTab("practice"); }}
            style={{ aspectRatio:"1", ...glass(), borderRadius:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, transition:"transform 0.15s ease", position:"relative", overflow:"hidden", padding:"12px 10px" }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 70% 70%, rgba(160,100,220,0.12), transparent 65%)`, borderRadius:28 }} />
            <span style={{ fontSize:36, lineHeight:1, position:"relative", zIndex:1 }}>🌀</span>
            <span style={{ fontSize:11, color:"#a090d0", letterSpacing:1.5, textTransform:"uppercase", fontWeight:600, position:"relative", zIndex:1, textAlign:"center" }}>{lang==="Hindi"?"दौड़ते विचार":"Racing Thoughts"}</span>
            <span style={{ fontSize:12, color:"#a090d0", opacity:.9, position:"relative", zIndex:1, textAlign:"center", lineHeight:1.4 }}>{lang==="Hindi"?"सांस लें, स्थिर हों":"Breathe and come back to earth"}</span>
          </button>

        </div>
      </div>

      {/* DISCLAIMER — text only, low opacity */}
      <div style={{ textAlign:"center", padding:"0 20px 16px" }}>
        <button onClick={() => setTab("legal")} style={{ background:"none", border:"none", padding:0, cursor:"pointer" }}>
          <p style={{ color:T.muted, fontSize:9, opacity:.8, margin:"0 0 3px", letterSpacing:.3 }}>
            {lang==="Hindi"?"कानूनी अस्वीकरण — यह कोई चिकित्सा या मनोवैज्ञानिक सहायता ऐप नहीं है।":"Legal Disclaimer — This is not a medical or psychological help app."}
          </p>
          <p style={{ color:T.muted, fontSize:9, opacity:.65, margin:0, lineHeight:1.5 }}>
            {lang==="Hindi"?"यह एक सरल ऐप है और किसी भी प्रकार की चिकित्सा या मनोवैज्ञानिक सलाह नहीं देता।":"This is a simple app and not a medical or psychological advice app."}
          </p>
        </button>
      </div>

    </div>
  );
}

// ─── PRACTICE ────────────────────────────────────────────────────────
function Practice({ onComplete, setTab, goBack, T, lang }) {
  const [fromRacing, setFromRacing] = useState(() => {
    const v = typeof sessionStorage !== "undefined" && sessionStorage.getItem("jsukoon_context") === "racing";
    if (v) sessionStorage.removeItem("jsukoon_context");
    return v;
  });
  const [section, setSection] = useState("breathwork");
  const [sel, setSel] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [secs, setSecs] = useState(0);
  const [filter, setFilter] = useState("All");
  const [pat, setPat] = useState(BREATHE_PATTERNS[0]);
  const [going, setGoing] = useState(false);
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [phaseKey, setPhaseKey] = useState("inhale");
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);
  const phaseRef = useRef("inhale");
  const cntRef = useRef(0);
  const tmRef = useRef(null);
  const cats = ["All","Morning","Calm","Relaxation","Heart","Sleep","Urgent"];

  const start = (m) => { setSel(m); setSecs(m.dur*60); setRunning(true); setDone(false); };

  useEffect(() => {
    if (!running) return;
    if (secs<=0) { setRunning(false); setDone(true); onComplete(sel.dur); return; }
    timerRef.current = setTimeout(() => setSecs(s=>s-1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [running, secs]);

  // Guided audio — English: blob MP3, Hindi: browser TTS
  const guideRef = useRef(null);
  const [guideLoaded, setGuideLoaded] = useState(false);
  const [guidePlaying, setGuidePlaying] = useState(false);
  const [guideError, setGuideError] = useState(false);
  const isHindiLang = lang === "Hindi";

  // Hindi TTS speaker — called by MeditationGuide when line changes
  const speakHindi = (text) => {
    if (!guidePlaying) return; // only speak if user has toggled guide on
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    u.rate = 0.82;
    u.pitch = 1.0;
    const hindiVoice = window.speechSynthesis.getVoices().find(v =>
      v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi") ||
      v.name.toLowerCase().includes("hemant") || v.name.toLowerCase().includes("kalpana")
    );
    if (hindiVoice) u.voice = hindiVoice;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (isHindiLang) {
      // For Hindi: no MP3 needed, TTS handles it — mark as "loaded" immediately
      setGuideLoaded(true); setGuidePlaying(false); setGuideError(false);
      guideRef.current = null;
      return;
    }
    if (!sel) return;
    setGuideLoaded(false); setGuidePlaying(false); setGuideError(false);
    const audio = new Audio(MEDITATION_AUDIO[sel.id]);
    audio.preload = "auto";
    audio.oncanplaythrough = () => setGuideLoaded(true);
    audio.onerror = () => setGuideError(true);
    audio.onended = () => setGuidePlaying(false);
    guideRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, [sel, isHindiLang]);

  const toggleGuide = () => {
    if (isHindiLang) {
      if (guidePlaying) {
        window.speechSynthesis?.cancel();
        setGuidePlaying(false);
      } else {
        setGuidePlaying(true);
        // Speak first line immediately
        window.speechSynthesis?.cancel();
      }
      return;
    }
    const a = guideRef.current;
    if (!a) return;
    if (guidePlaying) { a.pause(); setGuidePlaying(false); }
    else { a.play().then(() => setGuidePlaying(true)).catch(() => setGuideError(true)); }
  };

  // Stop TTS when session ends or guide toggled off
  useEffect(() => {
    if (!guidePlaying && isHindiLang) window.speechSynthesis?.cancel();
  }, [guidePlaying, isHindiLang]);

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const prog = sel ? 1-secs/(sel.dur*60) : 0;
  const filtered = filter==="All" ? MEDITATIONS : MEDITATIONS.filter(m=>m.cat===filter);

  const getPhases = (p) => [
    { key:"inhale", label:lang==="Hindi"?"सांस लें":"Inhale", dur:p.inhale },
    { key:"hold1",  label:lang==="Hindi"?"रोकें":"Hold",      dur:p.hold1 },
    { key:"exhale", label:lang==="Hindi"?"छोड़ें":"Exhale",    dur:p.exhale },
    { key:"hold2",  label:lang==="Hindi"?"रोकें":"Hold",      dur:p.hold2 },
  ].filter(x=>x.dur>0);

  useEffect(() => {
    if (!going) { clearTimeout(tmRef.current); return; }
    const phases=getPhases(pat); let pi=phases.findIndex(p=>p.key===phaseRef.current); if(pi<0)pi=0;
    const tick=()=>{
      cntRef.current++;
      setCount(cntRef.current);
      if(cntRef.current>=phases[pi].dur){
        cntRef.current=0;
        pi=(pi+1)%phases.length;
        if(pi===0) setCycles(c=>c+1);
        phaseRef.current=phases[pi].key;
        setPhaseKey(phases[pi].key);
        setCount(0);
        // Speak phase name when it changes
        if(voiceGuide && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const phaseNames = {
            inhale: lang==="Hindi"?"सांस लें":"Inhale",
            hold1:  lang==="Hindi"?"रोकें":"Hold",
            exhale: lang==="Hindi"?"छोड़ें":"Exhale",
            hold2:  lang==="Hindi"?"रोकें":"Hold",
          };
          const u = new SpeechSynthesisUtterance(phaseNames[phases[pi].key] || phases[pi].key);
          u.rate = 0.8; u.pitch = 0.95;
          window.speechSynthesis.speak(u);
        }
      }
      tmRef.current=setTimeout(tick,1000);
    };
    tmRef.current=setTimeout(tick,1000);
    return()=>clearTimeout(tmRef.current);
  }, [going, pat]);

  const stopBreath=(completed=false)=>{
    if(completed||cycles>0){ const mins=Math.max(1,Math.round((cycles*(pat.inhale+(pat.hold1||0)+pat.exhale+(pat.hold2||0)))/60)); creditSession(mins); }
    setGoing(false); setPhaseKey("inhale"); setCount(0); setCycles(0); phaseRef.current="inhale"; cntRef.current=0;
  };

  const phases=getPhases(pat);
  const curPhase=phases.find(p=>p.key===phaseKey);
  const phProg=curPhase?count/curPhase.dur:0;
  const guidance=phaseKey==="inhale"?(lang==="Hindi"?"धीरे-धीरे सांस अंदर लें।":"Draw the breath in, slow and full."):phaseKey==="exhale"?(lang==="Hindi"?"छोड़ें… हर तनाव जाने दें।":"Release… let every tension go."):(lang==="Hindi"?"यहाँ रुकें। आप सुरक्षित हैं।":"Rest here. You are held.");

  if (running||done) return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 24px 100px", textAlign:"center" }}>
      {running ? <>
        <p style={{ fontSize:10, color:T.muted, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>{lang==="Hindi"?(sel.catH||sel.cat):sel.cat}</p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:T.text, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?(sel.titleH||sel.title):sel.title}</h2>
        {guidePlaying
          ? <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:T.textSoft, lineHeight:1.8, textAlign:"center", maxWidth:300, margin:"0 auto 28px", minHeight:54, opacity:0.7 }}>
              🎙 {lang==="Hindi" ? "सुन रहे हैं… आँखें बंद करें" : "listening… close your eyes"}
            </p>
          : <MeditationGuide sel={sel} secs={secs} T={T} lang={lang} onSpeak={speakHindi} />
        }
        <Orb size={180} col={sel.col} pulse label={fmt(secs)} />

        {/* Guided voice button */}
        <div style={{ margin:"16px 0 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          {guideError ? (
            <p style={{ fontSize:12, color:"#e06666", fontStyle:"italic", margin:0 }}>{lang==="Hindi"?"गाइड ऑडियो उपलब्ध नहीं":"Guide audio unavailable"}</p>
          ) : (
            <button
              onClick={toggleGuide}
              disabled={!guideLoaded}
              style={{ background:guidePlaying?`${sel.col}22`:`${sel.col}10`, border:`1.5px solid ${sel.col}${guidePlaying?"70":"35"}`, borderRadius:99, padding:"9px 22px", color:sel.col, fontSize:13, fontWeight:500, opacity:guideLoaded?1:0.55, display:"flex", alignItems:"center", gap:8, transition:"all 0.3s" }}
            >
              {!guideLoaded ? "⏳" : guidePlaying ? "⏸" : "🎙"}
              {" "}
              {!guideLoaded
                ? (lang==="Hindi"?"तैयार हो रही है…":"Loading guide…")
                : guidePlaying
                  ? (lang==="Hindi"?"आवाज़ बंद करें":"Pause guide")
                  : (lang==="Hindi"?"हिंदी में सुनें 🎙":"Hear the guide 🎙")}
            </button>
          )}
          {guidePlaying && (
            <p style={{ fontSize:11, color:T.muted, letterSpacing:.5, margin:0, opacity:.7 }}>
              {lang==="Hindi"?"आँखें बंद करें — बस सुनें":"Close your eyes — just listen"}
            </p>
          )}
        </div>

        <div style={{ width:200, height:3, background:T.surfaceAlt, borderRadius:99, margin:"20px 0 8px" }}>
          <div style={{ height:"100%", width:`${prog*100}%`, background:sel.col, borderRadius:99, transition:"width 1s linear" }} />
        </div>
        <p style={{ fontSize:12, color:T.muted, marginBottom:32 }}>{Math.round(prog*100)}% complete</p>
        <button onClick={() => { setRunning(false); setSel(null); clearTimeout(timerRef.current); if(guideRef.current){guideRef.current.pause();} }} style={{ background:"transparent", border:`1px solid ${T.muted}35`, color:T.muted, fontSize:13, letterSpacing:1, padding:"10px 28px", borderRadius:99 }}>
          {lang==="Hindi"?"जल्दी समाप्त करें":"End early"}
        </button>

        {/* I need more help — guides to 5-4-3-2-1 grounding */}
        {setTab && (
          <button
            onClick={() => { setRunning(false); setSel(null); clearTimeout(timerRef.current); if(guideRef.current){guideRef.current.pause();} setTab("focus"); }}
            style={{ marginTop:14, background:"none", border:"none", color:T.textSoft, fontSize:16, fontWeight:600, letterSpacing:.3, padding:"8px 0", borderBottom:`1px solid ${T.textSoft}30`, cursor:"pointer" }}
          >
            {lang==="Hindi"?"मुझे और चाहिए →":"I need more →"}
          </button>
        )}
      </> : <>
        <span style={{ fontSize:56, display:"block", marginBottom:18 }}>🌸</span>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, color:T.accentSoft, fontWeight:400, marginBottom:8 }}>{lang==="Hindi"?"बहुत अच्छा।":"Beautiful."}</h2>
        <p style={{ fontSize:14, color:T.muted, marginBottom:36, lineHeight:1.7, maxWidth:260 }}>{lang==="Hindi"?`आपने खुद को ${sel.dur} मिनट दिए।`:`You gave yourself ${sel.dur} minutes of genuine care.`}</p>
        <button onClick={() => { setDone(false); setSel(null); }} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}45`, color:T.accent, fontSize:14, fontWeight:500, letterSpacing:1, padding:"14px 36px", borderRadius:99 }}>
          {lang==="Hindi"?"वापस जाएं":"Back to library"}
        </button>
        {setTab && (
          <button onClick={() => setTab("home")} style={{ marginTop:12, background:"none", border:"none", color:T.muted, fontSize:13, padding:"8px 0", cursor:"pointer" }}>
            🏡 {lang==="Hindi"?"होम पर जाएं":"Go home"}
          </button>
        )}
      </>}
    </div>
  );

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"52px 18px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", marginBottom:4 }}>
            <button onClick={goBack||(()=>setTab("home"))} style={{ background:"none", border:"none", color:T.textSoft, fontSize:14, padding:0, display:"flex", alignItems:"center", gap:4 }}>← {lang==="Hindi"?"वापस":"Back"}</button>
            <button onClick={()=>setTab("home")} style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}30`, borderRadius:99, padding:"5px 12px", color:T.accent, fontSize:12 }}>🏡 {lang==="Hindi"?"होम":"Home"}</button>
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, margin:0 }}>{lang==="Hindi"?"अभ्यास":"Practice"}</h1>
        </div>
        <div style={{ display:"flex", background:T.surfaceAlt, borderRadius:16, padding:4, marginBottom:20, border:`1px solid ${T.border}` }}>
          {[{id:"breathwork",label:lang==="Hindi"?"श्वास":"Breathwork",icon:"🌬️"},{id:"sessions",label:lang==="Hindi"?"सत्र":"Sessions",icon:"🧘"}].map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{ flex:1, padding:"10px 8px", borderRadius:12, background:section===s.id?T.surface:"transparent", border:`1px solid ${section===s.id?T.borderWarm:"transparent"}`, color:section===s.id?T.accent:T.muted, fontSize:13, fontWeight:section===s.id?500:400, display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.2s ease", backdropFilter:section===s.id?"blur(8px)":"none" }}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      {section==="sessions" && (
        <div className="scroll-area" style={{ flex:1, padding:"0 18px 100px" }}>
          <p style={{ fontSize:13, color:T.muted, marginBottom:14 }}>{lang==="Hindi"?"आज जो चाहिए वह चुनें":"Choose what you need today"}</p>
          <div style={{ display:"flex", gap:8, marginBottom:18, overflowX:"auto", paddingBottom:4 }}>
            {cats.map(c => (<button key={c} onClick={() => setFilter(c)} style={{ background:filter===c?`${T.accent}22`:T.surface, border:`1px solid ${filter===c?T.accent+"55":T.border}`, color:filter===c?T.accent:T.textSoft, borderRadius:99, padding:"6px 14px", whiteSpace:"nowrap", fontSize:13, flexShrink:0, backdropFilter:"blur(8px)" }}>{c}</button>))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map(m => (
              <button key={m.id} onClick={() => start(m)} style={{ background:T.surface, border:`1px solid ${m.col}22`, borderRadius:18, padding:"16px 18px", display:"flex", alignItems:"center", gap:14, textAlign:"left", backdropFilter:"blur(8px)" }}>
                <div style={{ width:50, height:50, borderRadius:14, background:`${m.col}18`, border:`1px solid ${m.col}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{m.emoji}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:500, color:T.text, margin:"0 0 3px", fontSize:14 }}>{lang==="Hindi"?(m.titleH||m.title):m.title}</p>
                  <p style={{ fontSize:12, color:T.muted, margin:"0 0 5px", lineHeight:1.5 }}>{lang==="Hindi"?(m.descH||m.desc):m.desc}</p>
                  <span style={{ color:m.col, fontSize:13 }}>{m.dur} {lang==="Hindi"?"मिनट":"min"} · {lang==="Hindi"?(m.catH||m.cat):m.cat}</span>
                </div>
                <span style={{ color:T.muted, fontSize:16, flexShrink:0 }}>▶</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {section==="breathwork" && (
        <div className="scroll-area" style={{ flex:1, padding:"0 18px 100px" }}>
          {fromRacing && (
            <div style={{ background:`${T.accent}10`, border:`1px solid ${T.accent}28`, borderRadius:14, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.7, margin:0 }}>
                {lang==="Hindi"
                  ? "🌀 दौड़ते विचार? Box Breathing या 4-7-8 श्वास सबसे तेज़ असर करती है।"
                  : "🌀 Racing thoughts? Box Breathing or 4-7-8 works fastest when the mind won't settle."}
              </p>
            </div>
          )}
          <p style={{ fontSize:13, color:T.textSoft, marginBottom:16 }}>{lang==="Hindi"?"ओर्ब की लय का पालन करें — आवाज़ मार्गदर्शन के लिए 🔊 दबाएं":"Follow the orb's rhythm — tap 🔊 to hear voice guidance"}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {BREATHE_PATTERNS.map(p => (
              <button key={p.name} onClick={() => { setPat(p); stopBreath(); }} style={{ background:pat.name===p.name?`${T.accent}18`:p.bold?`${T.accent}08`:T.surface, border:`${p.bold?"2px":"1px"} solid ${pat.name===p.name?T.accent+"55":p.bold?T.accent+"35":T.border}`, borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", gap:12, textAlign:"left", backdropFilter:"blur(8px)" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:T.accent, flexShrink:0, opacity:pat.name===p.name?1:.4 }} />
                <div>
                  <p style={{ fontWeight:p.bold?700:500, color:p.bold?T.accent:T.text, margin:"0 0 2px", fontSize:p.bold?15:14, letterSpacing:p.bold?.3:0 }}>{p.name}{p.bold?" ⭐":""}</p>
                  <p style={{ fontSize:12, color:T.muted, margin:0, lineHeight:1.5 }}>{p.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
            <Orb size={170} col={T.accent} pulse={going} label={going?curPhase?.label:null} />
            {going && <>
              <div style={{ width:200, height:3, background:T.surfaceAlt, borderRadius:99 }}>
                <div style={{ height:"100%", width:`${phProg*100}%`, background:T.accent, borderRadius:99, transition:"width 1s linear" }} />
              </div>
              <p style={{ fontSize:12, color:T.muted }}>{cycles} {cycles===1?(lang==="Hindi"?"चक्र":"cycle"):(lang==="Hindi"?"चक्र":"cycles")} complete</p>
            </>}
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <button onClick={() => {
                if (going) { stopBreath(true); window.speechSynthesis?.cancel(); }
                else {
                  setGoing(true);
                  if (voiceGuide && window.speechSynthesis) {
                    const intro = lang==="Hindi"
                      ? `${pat.name} श्वास। ${pat.inhale} सेकंड सांस लें${pat.hold1?`, ${pat.hold1} सेकंड रोकें`:""}। ${pat.exhale} सेकंड छोड़ें।`
                      : `${pat.name} breathing. Inhale for ${pat.inhale} seconds${pat.hold1?`, hold for ${pat.hold1}`:""}. Exhale for ${pat.exhale}.`;
                    const u = new SpeechSynthesisUtterance(intro);
                    u.rate = 0.85; u.pitch = 1;
                    window.speechSynthesis.speak(u);
                  }
                }
              }} style={{ background:going?`${T.muted}18`:`${T.accent}22`, border:`1px solid ${going?T.muted+"35":T.accent+"55"}`, color:going?T.muted:T.accent, fontSize:15, fontWeight:500, letterSpacing:1, padding:"15px 40px", borderRadius:99 }}>
                {going?(lang==="Hindi"?"रोकें":"Pause"):(lang==="Hindi"?"शुरू करें":"Begin")}
              </button>
              <button onClick={() => setVoiceGuide(v=>!v)} title="Toggle voice guidance" style={{ background:voiceGuide?`${T.accent}22`:"transparent", border:`1px solid ${voiceGuide?T.accent+"55":T.border}`, borderRadius:99, padding:"12px 14px", color:voiceGuide?T.accent:T.muted, fontSize:17 }}>
                {voiceGuide?"🔊":"🔇"}
              </button>
            </div>
            {going && (
              <Card T={T} style={{ textAlign:"center", maxWidth:300 }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", color:T.textSoft, fontSize:17, margin:"0 0 8px", lineHeight:1.6 }}>{guidance}</p>
                {voiceGuide && <p style={{ fontSize:11, color:T.muted, margin:0, fontStyle:"italic" }}>{lang==="Hindi"?"आवाज़ मार्गदर्शन चालू है":"Voice guidance on — listening to cues"}</p>}
              </Card>
            )}
            {setTab && (
              <button
                onClick={() => { stopBreath(true); window.speechSynthesis?.cancel(); setTab("focus"); }}
                style={{ background:"none", border:"none", color:T.textSoft, fontSize:15, fontWeight:600, letterSpacing:.3, padding:"6px 0", borderBottom:`1px solid ${T.textSoft}30`, cursor:"pointer", marginTop:8 }}
              >
                {lang==="Hindi"?"मुझे और चाहिए →":"I need more →"}
              </button>
            )}
          </div>
          <div style={{ marginTop:36, background:"rgba(255,75,75,0.05)", border:"1px solid rgba(255,75,75,0.2)", borderRadius:16, padding:16 }}>
            <p style={{ fontSize:10, color:"#ff6b6b", letterSpacing:2, textTransform:"uppercase", margin:"0 0 12px" }}>{lang==="Hindi"?"और सहायता चाहिए?":"If you need more support"}</p>
            {CRISIS_RESOURCES.map(r => (
              <a key={r.name} href={`tel:${r.number}`} style={{ textDecoration:"none", display:"block", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div><p style={{ color:T.textSoft, fontSize:13, margin:"0 0 1px", fontWeight:500 }}>{r.name}</p><p style={{ color:T.textSoft, fontSize:13, margin:0 }}>{r.desc}</p></div>
                  <span style={{ color:"#ff6b6b", fontSize:12, fontWeight:500 }}>{r.number}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REFLECTION (formerly Ether) ─────────────────────────────────────
function Reflection({ setTab, goBack, T, lang }) {
  const [text, setText] = useState("");
  const [ritualState, setRitualState] = useState("idle");
  const [burnCount, setBurnCount] = useLS("jsukoon_burns", 0);
  const [wishCount, setWishCount] = useLS("jsukoon_wishes", 0);
  const [wishes, setWishes] = useLS("jsukoon_wish_texts", []);

  // Read context from Journal — did they write something recently?
  const journalCtx = readEmotionalCtx();
  const recentJournal = journalCtx?.type === "journal" ? journalCtx : null;

  const handleBurn=()=>{
    if(!text.trim())return;
    setBurnCount(b => b+1);
    writeEmotionalCtx("burn", text.trim());
    creditActivity("reflection_burn", 1);
    setRitualState("burning");
    if(navigator.vibrate)navigator.vibrate([40,60,50,50,60]);
    setTimeout(()=>{ setText(""); setRitualState("idle"); },4500);
  };
  const handleSend=()=>{
    if(!text.trim())return;
    setWishCount(w => w+1);
    setWishes(ws => [{ text:text.trim(), date:new Date().toISOString() }, ...ws].slice(0,20));
    writeEmotionalCtx("wish", text.trim());
    creditActivity("reflection_wish", 1);
    setRitualState("sending");
    if(navigator.vibrate)navigator.vibrate([20,150,20,150,20]);
    setTimeout(()=>{ setText(""); setRitualState("idle"); },4500);
  };

  if(ritualState!=="idle") return (
    <div className="fade-in" style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:ritualState==="burning"?"#1a0505":"#050b1a", position:"relative", overflow:"hidden" }}>
      <ParticleCanvas mode={ritualState} T={T} />
      <div style={{ zIndex:10, textAlign:"center", padding:"0 32px" }}>
        <p style={{ color:ritualState==="burning"?"#e06666":"#6fa8dc", fontSize:22, letterSpacing:3, fontFamily:"'Cormorant Garamond',serif", marginBottom:12 }}>
          {ritualState==="burning"?(lang==="Hindi"?"जल रहा है…":"Burning…"):(lang==="Hindi"?"उठ रहा है…":"Rising…")}
        </p>
        <p style={{ color:ritualState==="burning"?"#e06666":"#6fa8dc", fontSize:14, opacity:.7, lineHeight:1.7, fontStyle:"italic", fontFamily:"'Cormorant Garamond',serif" }}>
          {ritualState==="burning"
            ?(lang==="Hindi"?"इसे जाने दो। यह विचार अब आपका नहीं है।":"Let it go. This thought no longer belongs to you.")
            :(lang==="Hindi"?"यह इच्छा ब्रह्मांड में जा रही है। शांत रहें।":"Your quiet wish is rising. Stay still.")}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:T.text, margin:0 }}>{lang==="Hindi"?"चिंतन":"Reflection"}</h1>
          </div>
          <p style={{ fontSize:13, color:T.muted, lineHeight:1.6, marginBottom:10 }}>
            {lang==="Hindi"
              ?"यहाँ बैठें। जो मन में है उसे लिखें — फिर उसे जलाएं या शांत इच्छा बनाकर ब्रह्मांड को सौंप दें।"
              :"Sit quietly. Write what is on your mind — then burn it away, or send it as a quiet wish into the world."}
          </p>

          {/* Journal-aware banner — if they wrote recently */}
          {recentJournal && (
            <div style={{ background:`${T.accent}10`, border:`1px solid ${T.accent}25`, borderRadius:12, padding:"10px 14px", marginBottom:4, display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>📖</span>
              <p style={{ fontSize:12, color:T.textSoft, lineHeight:1.6, margin:0, fontStyle:"italic" }}>
                {lang==="Hindi"
                  ? `आपने जर्नल में कुछ लिखा था। वह अभी भी मन में है — चाहें तो उसे यहाँ जलाएं या इच्छा बनाकर भेज दें।`
                  : `You wrote in your journal recently. Whatever came up there — you can burn it here, or send it forward as a wish.`}
              </p>
            </div>
          )}
          <div style={{ background:`${T.accent}08`, border:`1px solid ${T.accent}18`, borderRadius:12, padding:"11px 14px", marginBottom:4 }}>
            <p style={{ fontSize:11, color:T.textSoft, lineHeight:1.85, margin:0, fontStyle:"italic" }}>
              {lang==="Hindi"
                ? "🔥 जलाना: नकारात्मक विचारों को लिखकर छोड़ना एक पुरानी मनोवैज्ञानिक प्रक्रिया है — मन उन्हें कम महत्व देने लगता है। ✨ शांत इच्छा: जैसे कोई नहीं जानता विचार कैसे उत्पन्न होते हैं, वैसे ही यह डिजिटल विदाई भी असली महसूस होती है — क्योंकि इरादा असली है।"
                : "🔥 Burning: Writing a feeling down and releasing it is a real psychological practice — the mind genuinely holds it less tightly afterward. ✨ Quiet Wish: Just as nobody knows how thoughts appear in the mind, this digital release feels real — because the intention behind it is real."}
            </p>
          </div>
        </div>

        {/* Stats + Positivity score */}
        {(burnCount > 0 || wishCount > 0) && (() => {
          const total = burnCount + wishCount;
          const positivity = total > 0 ? Math.round((wishCount / total) * 100) : 0;
          const encouragement = positivity >= 70
            ? (lang==="Hindi" ? "आप बहुत सकारात्मक हैं 🌟" : "You are radiating positivity 🌟")
            : positivity >= 40
              ? (lang==="Hindi" ? "संतुलन बना रहे हैं 🌿" : "Building a healthy balance 🌿")
              : (lang==="Hindi" ? "जलाना साहस है — छोड़ना ताकत है 🔥" : "Releasing is strength — keep going 🔥");
          return (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:4 }}>
              <div style={{ background:`rgba(224,102,102,0.08)`, border:`1px solid rgba(224,102,102,0.2)`, borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                <p style={{ fontSize:18, margin:"0 0 3px" }}>🔥</p>
                <p style={{ fontSize:20, color:"#e06666", fontWeight:600, margin:"0 0 2px" }}>{burnCount}</p>
                <p style={{ fontSize:10, color:"#e06666", opacity:.7, margin:0 }}>{lang==="Hindi"?"जलाए":"burned"}</p>
              </div>
              <div style={{ background:`rgba(111,168,220,0.08)`, border:`1px solid rgba(111,168,220,0.2)`, borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                <p style={{ fontSize:18, margin:"0 0 3px" }}>✨</p>
                <p style={{ fontSize:20, color:"#6fa8dc", fontWeight:600, margin:"0 0 2px" }}>{wishCount}</p>
                <p style={{ fontSize:10, color:"#6fa8dc", opacity:.7, margin:0 }}>{lang==="Hindi"?"इच्छाएं":"wishes"}</p>
              </div>
              <div style={{ background:`${T.accent}08`, border:`1px solid ${T.accent}20`, borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                <p style={{ fontSize:18, margin:"0 0 3px" }}>💚</p>
                <p style={{ fontSize:20, color:T.accent, fontWeight:600, margin:"0 0 2px" }}>{positivity}%</p>
                <p style={{ fontSize:10, color:T.muted, margin:0 }}>{lang==="Hindi"?"सकारात्मकता":"positive"}</p>
              </div>
              <div style={{ gridColumn:"1/-1", background:`${T.accent}06`, border:`1px solid ${T.accent}15`, borderRadius:10, padding:"8px 12px" }}>
                <p style={{ fontSize:12, color:T.textSoft, margin:0, textAlign:"center", fontStyle:"italic" }}>{encouragement}</p>
              </div>
            </div>
          );
        })()}

        {/* Recent wishes */}
        {wishes.length > 0 && (
          <div style={{ marginBottom:4 }}>
            <p style={{ fontSize:11, color:T.muted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>
              {lang==="Hindi"?"पिछली इच्छाएं":"Recent wishes"}
            </p>
            {wishes.slice(0,3).map((w,i) => (
              <div key={i} style={{ background:`rgba(111,168,220,0.06)`, border:`1px solid rgba(111,168,220,0.15)`, borderRadius:10, padding:"8px 12px", marginBottom:6 }}>
                <p style={{ fontSize:12, color:T.textSoft, margin:"0 0 3px", lineHeight:1.5, fontStyle:"italic" }}>"{w.text.slice(0,80)}{w.text.length>80?"…":""}"</p>
                <p style={{ fontSize:10, color:T.muted, margin:0 }}>{new Date(w.date).toLocaleDateString(lang==="Hindi"?"hi-IN":"en-IN",{day:"numeric",month:"short"})}</p>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder={lang==="Hindi"?"यहाँ लिखें — बिना किसी डर के…":"Write here — without judgment…"}
          style={{ width:"100%", minHeight:160, background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:16, color:T.text, fontSize:15, lineHeight:1.7, resize:"none", outline:"none", fontFamily:"'DM Sans',sans-serif", backdropFilter:"blur(8px)", boxSizing:"border-box" }}
        />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          {/* Burn & Release */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <button
              onClick={handleBurn}
              disabled={!text.trim()}
              style={{ background:"rgba(224,102,102,0.1)", border:"1px solid rgba(224,102,102,0.35)", borderRadius:16, padding:"16px 10px", color:"#e06666", fontSize:15, fontWeight:600, opacity:text.trim()?1:0.45, letterSpacing:.5 }}
            >
              🔥 {lang==="Hindi"?"जलाएं":"Burn & Release"}
            </button>
            <p style={{ fontSize:12, color:"#e06666", opacity:.7, lineHeight:1.55, margin:0, paddingLeft:2 }}>
              {lang==="Hindi"
                ?"जो दर्द, गुस्सा या चिंता है — उसे आग में छोड़ दें। यह विचार अब आपका नहीं।"
                :"Pain, anger, or worry — write it and burn it. Watch it leave you for good."}
            </p>
          </div>

          {/* Quiet Wish */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              style={{ background:"rgba(111,168,220,0.1)", border:"1px solid rgba(111,168,220,0.35)", borderRadius:16, padding:"16px 10px", color:"#6fa8dc", fontSize:15, fontWeight:600, opacity:text.trim()?1:0.45, letterSpacing:.5 }}
            >
              ✨ {lang==="Hindi"?"शांत इच्छा":"Quiet Wish"}
            </button>
            <p style={{ fontSize:12, color:"#6fa8dc", opacity:.7, lineHeight:1.55, margin:0, paddingLeft:2 }}>
              {lang==="Hindi"
                ?"जो उम्मीद या इरादा है — उसे ब्रह्मांड में भेज दें। शांत मन से, बिना जोर लगाए।"
                :"A hope or intention — send it quietly into the world. No forcing. Just wishing."}
            </p>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}

// ─── JOURNAL ─────────────────────────────────────────────────────────
function CrisisOverlay({ lang, onDismiss }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    // Pulse the border/background every 1.5s to draw attention
    const t = setInterval(() => setPulse(p => !p), 1500);
    // Vibrate urgently on phones
    if (navigator.vibrate) navigator.vibrate([100,80,100,80,200]);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:99999,
      background: pulse ? "rgba(10,0,0,0.97)" : "rgba(20,5,5,0.97)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"0 24px", transition:"background 0.8s ease",
    }}>
      {/* Pulsing red ring */}
      <div style={{
        width:80, height:80, borderRadius:"50%",
        border: pulse ? "3px solid rgba(255,60,60,0.9)" : "3px solid rgba(255,60,60,0.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        marginBottom:24, transition:"border 0.8s ease",
        boxShadow: pulse ? "0 0 30px rgba(255,60,60,0.4)" : "0 0 8px rgba(255,60,60,0.1)",
      }}>
        <span style={{ fontSize:36 }}>🆘</span>
      </div>

      <p style={{ fontSize:10, color:"rgba(255,100,100,0.7)", letterSpacing:3, textTransform:"uppercase", marginBottom:12, textAlign:"center" }}>
        {lang==="Hindi"?"कृपया रुकें — बाहरी सहायता लें":"PLEASE STOP — SEEK REAL HELP NOW"}
      </p>

      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:"#fff", textAlign:"center", lineHeight:1.5, marginBottom:12, maxWidth:300 }}>
        {lang==="Hindi"
          ? "कृपया अभी किसी प्रशिक्षित व्यक्ति से बात करें।"
          : "Please speak to a trained person right now."}
      </h2>

      <p style={{ fontSize:13, color:"rgba(255,200,200,0.7)", textAlign:"center", lineHeight:1.7, marginBottom:32, maxWidth:280 }}>
        {lang==="Hindi"
          ? "यह ऐप संकट सहायता के लिए नहीं है। नीचे दी गई हेल्पलाइन पर अभी कॉल करें — वे सुनने के लिए प्रशिक्षित हैं।"
          : "This app is not equipped for crisis support. Please call one of the helplines below — they are trained to help."}
      </p>

      {/* Helplines — large tap-to-call buttons */}
      <div style={{ width:"100%", maxWidth:360, display:"flex", flexDirection:"column", gap:12, marginBottom:32 }}>
        {CRISIS_RESOURCES.map(r => (
          <a key={r.name} href={`tel:${r.number}`} style={{ textDecoration:"none" }}>
            <div style={{
              background: pulse ? "rgba(255,60,60,0.18)" : "rgba(255,60,60,0.10)",
              border:`2px solid ${pulse ? "rgba(255,80,80,0.6)" : "rgba(255,80,80,0.3)"}`,
              borderRadius:18, padding:"18px 22px",
              display:"flex", justifyContent:"space-between", alignItems:"center",
              transition:"all 0.8s ease",
            }}>
              <div>
                <p style={{ fontSize:15, fontWeight:600, color:"#fff", margin:"0 0 3px" }}>{r.name}</p>
                <p style={{ fontSize:13, color:"rgba(255,180,180,0.8)", margin:0 }}>{r.desc}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:18, fontWeight:700, color:"#ff6b6b", margin:"0 0 2px", letterSpacing:0.5 }}>{r.number}</p>
                <p style={{ fontSize:10, color:"rgba(255,100,100,0.6)", letterSpacing:1 }}>TAP TO CALL</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Soft dismiss — requires two taps to prevent accidental exit */}
      <TwoTapDismiss lang={lang} onDismiss={onDismiss} />
    </div>
  );
}

function TwoTapDismiss({ lang, onDismiss }) {
  const [taps, setTaps] = useState(0);
  const [msg, setMsg] = useState("");
  const handle = () => {
    if (taps === 0) {
      setTaps(1);
      setMsg(lang==="Hindi"?"क्या आप वाकई बंद करना चाहते हैं? एक बार और टैप करें।":"Are you sure? Tap once more to close.");
      setTimeout(() => { setTaps(0); setMsg(""); }, 4000);
    } else {
      onDismiss();
    }
  };
  return (
    <div style={{ textAlign:"center" }}>
      {msg && <p style={{ fontSize:12, color:"rgba(255,150,150,0.8)", marginBottom:10, lineHeight:1.6 }}>{msg}</p>}
      <button onClick={handle} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", fontSize:11, letterSpacing:1, padding:"10px 20px", cursor:"pointer" }}>
        {taps===0
          ? (lang==="Hindi"?"मैं ठीक हूँ — वापस जाएं":"I am safe — go back")
          : (lang==="Hindi"?"हाँ, बंद करें":"Yes, close this")}
      </button>
    </div>
  );
}

function Journal({ setTab, goBack, T, lang }) {
  const [entries, setEntries] = useLS("jsukoon_journal", []);
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [viewing, setViewing] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [aiReflection, setAiReflection] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const recognitionRef = useRef(null);

  // Read emotional context from Reflection — adapt Journal accordingly
  const reflectionCtx = readEmotionalCtx();
  const recentBurn = reflectionCtx?.type === "burn" ? reflectionCtx : null;
  const recentWish = reflectionCtx?.type === "wish" ? reflectionCtx : null;
  const hasReflectionCtx = !!(recentBurn || recentWish);

  // Context-aware prompts that acknowledge what happened in Reflection
  const burnPrompts = lang === "Hindi"
    ? ["आपने अभी कुछ जलाया। अब जो बचा है — वह क्या है?", "जलाने के बाद, मन में क्या आया?", "छोड़ने के बाद — आप कैसा महसूस कर रहे हैं?"]
    : ["You just burned something. What remains?", "After the release — what are you left with?", "Something was let go. How does that feel from the inside?"];
  const wishPrompts = lang === "Hindi"
    ? ["आपने एक इच्छा भेजी। वह इच्छा किस बारे में थी?", "जो आपने माँगा — वह आपके लिए क्यों ज़रूरी है?", "अगर वह इच्छा पूरी हो जाए — आपकी ज़िंदगी कैसी होगी?"]
    : ["You sent a wish out. What was it really about?", "What you wished for — why does it matter so much to you?", "If that wish came true — what would change?"];
  const [journalVoiceIntro, setJournalVoiceIntro] = useState(false);

  const speakIntro = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const introText = lang==="Hindi"
      ? "यह आपका निजी जर्नल है। यहाँ आप लिख सकते हैं, बोल सकते हैं, और AI से अपने विचारों पर एक शांत प्रतिबिंब माँग सकते हैं। कोई नहीं देख रहा।"
      : "This is your private journal. You can write, speak your thoughts aloud, and ask the AI Guide for a calm reflection on what you have shared. No one is watching. There is no wrong way to use this.";
    const u = new SpeechSynthesisUtterance(introText);
    u.rate = 0.88; u.pitch = 1;
    if (lang==="Hindi") {
      const hv = window.speechSynthesis.getVoices().find(v=>v.lang.includes("hi"));
      if (hv) { u.voice = hv; u.lang = "hi-IN"; }
    }
    window.speechSynthesis.speak(u);
    setJournalVoiceIntro(true);
  };

  const nextPrompt=()=>setPrompt(PROMPTS[Math.floor(Math.random()*PROMPTS.length)]);

  const checkCrisis = (t) => {
    const lower = t.toLowerCase();
    return CRISIS_WORDS.some(w => lower.includes(w.toLowerCase()));
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (checkCrisis(val)) setCrisisDetected(true);
  };

  const fmt=iso=>new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

  const save=()=>{
    if(!text.trim())return;
    setEntries(prev=>[{id:Date.now(),text,prompt,date:new Date().toISOString(),aiReflection},...prev]);
    writeEmotionalCtx("journal", text.trim(), { hasAI: !!aiReflection, prompt });
    // Credit journaling time — roughly 1 min per 100 chars written
    const writingMins = Math.max(1, Math.round(text.length / 100));
    creditActivity("journal", writingMins);
    creditSession(3);
    setText(""); setAiReflection(""); setWriting(false);
  };

  const [geminiError, setGeminiError] = useState(false);
  const getReflection=async()=>{
    if(!text.trim())return;
    if(checkCrisis(text)){ setCrisisDetected(true); return; }
    setIsThinking(true);
    setGeminiError(false);
    setAiReflection("");
    try{
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const _ectx = readEmotionalCtx();
      const _rCtx = (_ectx?.type==="burn"||_ectx?.type==="wish")
        ? { type:_ectx.type, snippet:_ectx.snippet } : null;
      const res=await fetch("/api/gemini",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text, lang, reflectionCtx: _rCtx}),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if(!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      setAiReflection(data.reflection);
    }catch(err){
      setGeminiError(true);
      const isTimeout = err.name === "AbortError";
      setAiReflection(
        isTimeout
          ? (lang==="Hindi"?"अनुरोध में बहुत अधिक समय लगा। अपना इंटरनेट जांचें और फिर कोशिश करें।":"The request timed out. Please check your connection and try again.")
          : (lang==="Hindi"?"मार्गदर्शक अभी उपलब्ध नहीं हैं। कुछ देर बाद फिर कोशिश करें।":"The Guide is unavailable right now. Please try again in a moment.")
      );
    }finally{ setIsThinking(false); }
  };

  const startListening=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){
      const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
      const msg = isIOS
        ? (lang==="Hindi"
            ? "iPhone पर Safari में आवाज़ input काम नहीं करती।\nकृपया Chrome में jsukoon.vercel.app खोलें, या कीबोर्ड से लिखें।"
            : "Voice input is not supported in iOS Safari.\nPlease open jsukoon.vercel.app in Chrome, or type your thoughts instead.")
        : (lang==="Hindi" ? "आपका ब्राउज़र माइक्रोफोन का समर्थन नहीं करता।" : "Voice input is not supported in this browser.");
      alert(msg); return;
    }
    if(isListening){ recognitionRef.current?.stop(); return; }
    const r=new SR(); recognitionRef.current=r;
    r.continuous=false; r.interimResults=false;
    r.lang=lang==="Hindi"?"hi-IN":"en-US";
    r.onstart=()=>setIsListening(true); r.onend=()=>setIsListening(false);
    r.onresult=(e)=>{
      const spoken = e.results[0][0].transcript;
      // Check spoken words immediately before appending
      if (checkCrisis(spoken)) { setCrisisDetected(true); return; }
      setText(prev=>prev+(prev?" ":"")+spoken);
    };
    r.start();
  };

  const speakText=(content)=>{ if(!content)return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(content); u.rate=.85; u.pitch=1; const isHindi=/[\u0900-\u097F]/.test(content); if(isHindi){ u.lang="hi-IN"; const hv=window.speechSynthesis.getVoices().find(v=>v.lang.includes("hi")); if(hv)u.voice=hv; } window.speechSynthesis.speak(u); };

  // ── Crisis overlay — renders over everything ──
  if (crisisDetected) return (
    <CrisisOverlay lang={lang} onDismiss={() => { setCrisisDetected(false); setText(""); setWriting(false); }} />
  );

  if(viewing) return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={()=>setViewing(null)} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 18px 80px" }}>
        <div style={{ paddingTop:16 }}>
        <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{fmt(viewing.date)}</p>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:17, color:T.muted, marginBottom:22, lineHeight:1.6 }}>"{viewing.prompt}"</p>
        <p style={{ fontSize:15, color:T.textSoft, lineHeight:1.9, whiteSpace:"pre-wrap", marginBottom:24 }}>{viewing.text}</p>
        {viewing.aiReflection && (
          <Card T={T} style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}30`, marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <p style={{ fontSize:11, color:T.accent, textTransform:"uppercase", letterSpacing:1.5, margin:0 }}>✦ {lang==="Hindi"?"मार्गदर्शक का विचार":"Guide's Reflection"}</p>
              <button onClick={()=>speakText(viewing.aiReflection)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16 }}>🔊</button>
            </div>
            <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6 }}>{viewing.aiReflection}</p>
          </Card>
        )}
        <button onClick={()=>{ setEntries(p=>p.filter(e=>e.id!==viewing.id)); setViewing(null); }} style={{ marginTop:12, background:"transparent", border:"1px solid rgba(224,102,102,0.3)", color:"#e06666", fontSize:13, padding:"10px 22px", borderRadius:99 }}>
          {lang==="Hindi"?"प्रविष्टि हटाएं":"Delete entry"}
        </button>
        </div>
      </div>
    </div>
  );

  if(writing) return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={()=>{ setWriting(false); setAiReflection(""); }} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 18px 80px" }}>
        <div style={{ paddingTop:16 }}>
          {/* Context badge — if they came from Reflection */}
          {hasReflectionCtx && (
            <div style={{ background: recentBurn?"rgba(224,102,102,0.08)":"rgba(111,168,220,0.08)", border:`1px solid ${recentBurn?"rgba(224,102,102,0.25)":"rgba(111,168,220,0.25)"}`, borderRadius:12, padding:"9px 13px", marginBottom:12, display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:14 }}>{recentBurn?"🔥":"✨"}</span>
              <p style={{ fontSize:11, color:recentBurn?"#e06666":"#6fa8dc", margin:0, lineHeight:1.5, fontStyle:"italic" }}>
                {lang==="Hindi"
                  ? (recentBurn ? "जलाने के बाद का प्रश्न — यह आपके लिए है।" : "इच्छा के बाद का प्रश्न — यह आपके लिए है।")
                  : (recentBurn ? "A prompt shaped by what you released." : "A prompt shaped by what you wished for.")}
              </p>
            </div>
          )}
        <Card T={T} style={{ marginBottom:16 }}>
          <SectionLabel text={lang==="Hindi"?"आज का प्रश्न":"Today's prompt"} T={T} />
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:17, color:T.textSoft, margin:"0 0 12px", lineHeight:1.6 }}>{prompt}</p>
          <button onClick={nextPrompt} style={{ background:"none", border:"none", color:T.accent, fontSize:13, padding:0 }}>{lang==="Hindi"?"दूसरा प्रश्न →":"Try a different prompt →"}</button>
        </Card>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginBottom:10 }}>
          <button onClick={startListening}
            title={typeof window !== "undefined" && !window.SpeechRecognition && !window.webkitSpeechRecognition ? (lang==="Hindi"?"यह ब्राउज़र माइक्रोफोन का समर्थन नहीं करता":"Not supported on this browser") : ""}
            style={{ background:isListening?"rgba(224,102,102,0.15)":T.surface, border:`1px solid ${isListening?"#e06666":T.border}`, borderRadius:12, padding:"8px 12px", color:isListening?"#e06666":T.textSoft, fontSize:12, opacity: typeof window !== "undefined" && !window.SpeechRecognition && !window.webkitSpeechRecognition ? 0.45 : 1 }}>
            {isListening?`🛑 ${lang==="Hindi"?"रोकें":"Stop"}`:`🎙️ ${lang==="Hindi"?"बोलें":"Speak"}`}
          </button>
          <button onClick={()=>speakText(text)} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"8px 12px", color:T.textSoft, fontSize:12 }}>🔊 {lang==="Hindi"?"सुनें":"Listen"}</button>
        </div>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder={lang==="Hindi"?"स्वतंत्र रूप से लिखें। कोई नहीं देख रहा…":"Write freely. No one is watching…"}
          style={{ width:"100%", minHeight:200, background:T.surface, border:`1px solid ${T.borderWarm}`, borderRadius:18, padding:18, color:T.text, fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.8, resize:"none", outline:"none", fontWeight:300, marginBottom:16, backdropFilter:"blur(8px)" }}
        />
        {aiReflection && (
          <div className="fade-up">
            <Card T={T} style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}30`, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={{ fontSize:11, color:T.accent, textTransform:"uppercase", letterSpacing:1.5, margin:0 }}>✦ {lang==="Hindi"?"मार्गदर्शक का विचार":"Guide's Reflection"}</p>
                <button onClick={()=>speakText(aiReflection)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16 }}>🔊</button>
              </div>
              <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.6 }}>{aiReflection}</p>
            </Card>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
          {!aiReflection && (
            <button onClick={getReflection} disabled={isThinking||!text.trim()} style={{ width:"100%", background:isThinking?`${T.accent}10`:"transparent", border:`1px solid ${T.accent}50`, color:T.accent, fontSize:14, padding:14, borderRadius:14, opacity:(!text.trim()||isThinking)?.5:1, transition:"all 0.3s ease" }}>
              {isThinking ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <span style={{ display:"inline-block", animation:"orbFloat 1.5s ease-in-out infinite", fontSize:16 }}>✦</span>
                  {lang==="Hindi"?"मार्गदर्शक पढ़ रहे हैं…":"The Guide is reading…"}
                </span>
              ) : `✦ ${lang==="Hindi"?"AI से प्रतिबिंब माँगें":"Ask the AI Guide for a Reflection"}`}
            </button>
          )}
          {geminiError && aiReflection && (
            <button onClick={getReflection} style={{ width:"100%", background:"transparent", border:`1px solid ${T.accent}30`, color:T.muted, fontSize:13, padding:10, borderRadius:14, marginTop:-6 }}>
              {lang==="Hindi"?"फिर कोशिश करें →":"Try again →"}
            </button>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>{ setWriting(false); setAiReflection(""); }} style={{ flex:1, background:"transparent", border:`1px solid ${T.border}`, color:T.muted, fontSize:13, padding:14, borderRadius:14 }}>{lang==="Hindi"?"हटाएं":"Discard"}</button>
            <button onClick={save} style={{ flex:2, background:`${T.accent}22`, border:`1px solid ${T.accent}50`, color:T.accent, fontSize:14, fontWeight:500, padding:14, borderRadius:14 }}>{lang==="Hindi"?"सहेजें":"Save entry"}</button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      <div style={{ padding:"16px 18px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, margin:0 }}>{lang==="Hindi"?"जर्नल":"Journal"}</h1>
        </div>

        {/* How to use — spoken + written intro */}
        <div style={{ background:`${T.accent}08`, border:`1px solid ${T.accent}20`, borderRadius:16, padding:"14px 16px", marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.7, margin:0 }}>
                {lang==="Hindi"
                  ? "लिखें या बोलें — फिर AI गाइड से अपने विचारों पर एक शांत प्रतिबिंब माँगें। सब कुछ निजी रहता है।"
                  : "Write or speak freely. Then ask the AI Guide for a calm reflection on your thoughts. Everything stays private."}
              </p>
            </div>
            <button onClick={speakIntro} title="Hear how to use the journal" style={{ background:"none", border:`1px solid ${T.accent}30`, borderRadius:99, padding:"6px 10px", color:T.accent, fontSize:16, flexShrink:0 }}>
              🔊
            </button>
          </div>
          {journalVoiceIntro && (
            <p style={{ fontSize:11, color:T.accent, marginTop:8, margin:"8px 0 0", fontStyle:"italic", opacity:.8 }}>
              {lang==="Hindi"?"सुन रहे हैं…":"Playing introduction…"}
            </p>
          )}
        </div>

        {/* Reflection-aware banner on Journal home */}
        {recentBurn && (
          <div style={{ background:"rgba(224,102,102,0.08)", border:"1px solid rgba(224,102,102,0.2)", borderRadius:14, padding:"11px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>🔥</span>
            <p style={{ fontSize:12, color:"#e06666", lineHeight:1.6, margin:0, fontStyle:"italic" }}>
              {lang==="Hindi"
                ? "आपने कुछ जलाया। जर्नल इसे जानता है — आज का प्रश्न उसी से जुड़ा होगा।"
                : "You burned something recently. The journal knows — today's prompt will meet you there."}
            </p>
          </div>
        )}
        {recentWish && (
          <div style={{ background:"rgba(111,168,220,0.08)", border:"1px solid rgba(111,168,220,0.2)", borderRadius:14, padding:"11px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>✨</span>
            <p style={{ fontSize:12, color:"#6fa8dc", lineHeight:1.6, margin:0, fontStyle:"italic" }}>
              {lang==="Hindi"
                ? "आपने एक इच्छा भेजी। जर्नल उसे समझना चाहता है — लिखें।"
                : "You sent a wish. The journal wants to understand what it meant — write it down."}
            </p>
          </div>
        )}

        <button onClick={()=>{
          // Auto-load context-aware prompt based on what they did in Reflection
          if (recentBurn) setPrompt(burnPrompts[Math.floor(Math.random()*burnPrompts.length)]);
          else if (recentWish) setPrompt(wishPrompts[Math.floor(Math.random()*wishPrompts.length)]);
          setWriting(true);
        }} style={{ width:"100%", background:`${T.accent}18`, border:`1.5px solid ${T.accent}50`, borderRadius:18, padding:"16px 20px", marginBottom:20, color:T.accent, fontSize:15, fontWeight:500, letterSpacing:.5, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>✦</span>
          {lang==="Hindi"?"नई प्रविष्टि लिखें":"Write a new entry"}
        </button>

        {entries.length===0 ? (
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <span style={{ fontSize:44, display:"block", marginBottom:14 }}>📖</span>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:18, color:T.textSoft, lineHeight:1.8, marginBottom:8 }}>
              {lang==="Hindi"?"आपका जर्नल प्रतीक्षा कर रहा है।":"Your journal awaits."}
            </p>
            <p style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>
              {lang==="Hindi"?"ऊपर 🔊 दबाएं — सुनें कैसे शुरू करें।":"Tap 🔊 above to hear how to get started."}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <SectionLabel text={lang==="Hindi"?`${entries.length} प्रविष्टियाँ`:`${entries.length} entries`} T={T} />
              <p style={{ fontSize:12, color:T.muted, margin:0 }}>{entries.filter(e=>e.aiReflection).length} {lang==="Hindi"?"✦ प्रतिबिंब":"✦ with reflection"}</p>
            </div>
            {entries.map(e => (
              <button key={e.id} onClick={()=>setViewing(e)} style={{ width:"100%", background:T.surface, border:`1px solid ${e.aiReflection?T.accent+"30":T.border}`, borderRadius:16, padding:"14px 16px", textAlign:"left", marginBottom:10, backdropFilter:"blur(8px)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <p style={{ fontSize:11, color:T.muted, letterSpacing:1.5, textTransform:"uppercase", margin:0 }}>{fmt(e.date)}</p>
                  {e.aiReflection && <span style={{ fontSize:11, color:T.accent }}>✦ Guide reflected</span>}
                </div>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:13, color:T.muted, margin:"0 0 6px" }}>"{e.prompt}"</p>
                <p style={{ fontSize:13, color:T.textSoft, margin:0, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", lineHeight:1.6 }}>{e.text}</p>
              </button>
            ))}
          </>
        )}
      </div>
      </div>
    </div>
  );
}

// ─── FOCUS ───────────────────────────────────────────────────────────
// ─── WARMTH PAGE ─────────────────────────────────────────────────────
function WarmthPage({ setTab, goBack, T, lang }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div style={{ flex:1, overflow:"auto", padding:"0 0 60px" }}>
        <MettaCircles T={T} lang={lang} />
      </div>
    </div>
  );
}

function Focus({ setTab, goBack, T, lang }) {
  const [activeGame, setActiveGame] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [focusDone, setFocusDone] = useLS("jsukoon_focus_done", {});

  const markComplete = (id) => {
    const today = new Date().toDateString();
    setFocusDone(prev => ({ ...prev, [id]: today }));
    setGameComplete(true);
  };

  const GAMES = [
    {
      id:"anchor",
      label: lang==="Hindi" ? "5-4-3-2-1 वापसी" : "5-4-3-2-1 Return",
      emoji:"👁️",
      featured: true,
      shortDesc: lang==="Hindi" ? "अस्थिर महसूस कर रहे हैं?" : "Feeling unsteady?",
      instruction: lang==="Hindi"
        ? "5 चीज़ें देखें · 4 को छुएं · 3 सुनें · 2 सूंघें · 1 चखें। यह आपको अभी इस पल में वापस लाएगा।"
        : "Name 5 things you can see · 4 you can touch · 3 you hear · 2 you smell · 1 you taste. This brings you back to right now.",
    },
    {
      id:"breath",
      label: lang==="Hindi" ? "सांस लें" : "Breathing",
      emoji:"🌬️",
      shortDesc: lang==="Hindi" ? "मन शांत करना है?" : "Need to calm down?",
      instruction: lang==="Hindi"
        ? "सांस लें और कैनवास पर रंग भरें। सांस छोड़ने के लिए टैप करें। बस इतना ही।"
        : "Breathe in and watch the canvas fill with colour. Tap to breathe out. That is all you need to do.",
    },
    {
      id:"bilateral",
      label: lang==="Hindi" ? "बाएं-दाएं" : "Left · Right",
      emoji:"👐",
      shortDesc: lang==="Hindi" ? "बेचैनी या घबराहट?" : "Anxious or restless?",
      instruction: lang==="Hindi"
        ? "बाएं और दाएं हाथ से बारी-बारी टैप करें — लगातार। यह लय आपके मन को शांत करती है।"
        : "Tap left and right alternately — keep a steady rhythm. The back-and-forth movement helps settle a racing mind.",
    },
    {
      id:"stone",
      label: lang==="Hindi" ? "भारी विचार" : "Heavy Thought",
      emoji:"🪨",
      shortDesc: lang==="Hindi" ? "कोई विचार जाने नहीं दे रहा?" : "A thought won't leave you?",
      instruction: lang==="Hindi"
        ? "वह भारी विचार लिखें। फिर उसे पानी में डूबते हुए देखें। जाने दें।"
        : "Write the heavy thought down. Then watch it sink slowly into still water. Let it go.",
    },
    {
      id:"bloom",
      label: lang==="Hindi" ? "फूल खिलाएं" : "Bloom",
      emoji:"🌸",
      shortDesc: lang==="Hindi" ? "धीमे होना है?" : "Need to slow down?",
      instruction: lang==="Hindi"
        ? "धीरे-धीरे टैप करें — एक-एक पंखुड़ी खिलेगी। जल्दबाजी नहीं। छह टैप में पूरा फूल।"
        : "Tap slowly — one petal opens with each touch. No hurry. Six gentle taps to complete the bloom.",
    },
    {
      id:"nadi",
      label: lang==="Hindi" ? "नाड़ी श्वास" : "Nadi Breathing",
      emoji:"🌀",
      shortDesc: lang==="Hindi" ? "सांस उखड़ी हुई है?" : "Breath feels uneven?",
      instruction: lang==="Hindi"
        ? "एक नथुने से सांस लें, दूसरे से छोड़ें। बारी-बारी। यह श्वास को संतुलित करता है।"
        : "Breathe in through one nostril, out through the other. Alternate. A gentle balancing practice.",
    },
    {
      id:"letter",
      label: lang==="Hindi" ? "न भेजा पत्र" : "Unsent Letter",
      emoji:"✉️",
      shortDesc: lang==="Hindi" ? "कुछ कहना है जो कह नहीं सके?" : "Something unsaid weighing on you?",
      instruction: lang==="Hindi"
        ? "वह पत्र लिखें जो आप कभी नहीं भेज सके। किसी को भी। कुछ भी। यह सिर्फ आपके लिए है।"
        : "Write the letter you could never send. To anyone. About anything. It is only for you.",
    },
    {
      id:"particles",
      label: lang==="Hindi" ? "ध्यान पैड" : "Focus Pad",
      emoji:"✨",
      shortDesc: lang==="Hindi" ? "मन बिखरा हुआ है?" : "Mind feels scattered?",
      instruction: lang==="Hindi"
        ? "दबाकर रखें — कण आपकी ओर आएंगे। ध्यान केंद्रित करें।"
        : "Press and hold — watch the particles gather toward you. Just focus on that one thing.",
    },
  ];

  const GAME_DESC = {
    anchor:    lang==="Hindi"?"अपनी इंद्रियों के माध्यम से इस पल में वापस आएं।":"Name what you can see · touch · hear · smell · taste.",
    bilateral: lang==="Hindi"?"बाएं और दाएं बारी-बारी टैप करें।":"Tap left and right alternately to settle a racing mind.",
    breath:    lang==="Hindi"?"सांस लें — कैनवास भरता है।":"Breathe in to fill the canvas. Tap to breathe out.",
    stone:     lang==="Hindi"?"एक भारी विचार लिखें और उसे जाने दें।":"Write the thought. Watch it sink. Let it go.",
    nadi:      lang==="Hindi"?"नाड़ी शोधन — बाएं और दाएं नाक से बारी-बारी सांस लें।":"Breathe in through one nostril, out through the other.",
    letter:    lang==="Hindi"?"वह पत्र लिखें जो आप कभी नहीं भेज सके।":"Write the letter you could never send.",
    bloom:     lang==="Hindi"?"धीरे से छुएं। छह बार में पूर्ण।":"Tap slowly — six gentle touches to bloom.",
    particles: lang==="Hindi"?"दबाकर रखें — कणों को अपनी ओर खींचें।":"Press and hold to gather the particles.",
  };

  // ── Game active ──
  if (activeGame) {
    const g = GAMES.find(x => x.id === activeGame);

    // Done screen
    if (gameComplete) {
      const doneMessages = {
        anchor:    { en:"You just brought yourself back to the present moment. That is real.", hi:"आप अभी इस पल में वापस आए। यही सबसे ज़रूरी था।" },
        bilateral: { en:"The rhythm settled something in your nervous system. You can feel it.", hi:"यह लय आपके मन को थोड़ा शांत कर गई।" },
        breath:    { en:"You breathed through it. That is all it ever takes.", hi:"आपने सांस ली। बस यही काफी था।" },
        stone:     { en:"You named it, then let it sink. It has a little less hold on you now.", hi:"आपने उसे लिखा, और जाने दिया। वह विचार अब थोड़ा हल्का है।" },
        nadi:      { en:"Left and right. Your breath is steadier than it was a moment ago.", hi:"बाएं और दाएं। अब सांस थोड़ी स्थिर है।" },
        letter:    { en:"You said what needed to be said. Even unsent, it mattered.", hi:"आपने कह दिया जो कहना था। भेजा न हो — फिर भी असर हुआ।" },
        bloom:     { en:"Six gentle touches. That slowness was the practice.", hi:"छह धीमे स्पर्श। वह धीमापन ही अभ्यास था।" },
        particles: { en:"Focus is a muscle. You just used it.", hi:"ध्यान एक शक्ति है। आपने उसे इस्तेमाल किया।" },
      };
      const msg = doneMessages[activeGame] || { en:"You showed up. That is what matters.", hi:"आप आए। यही मायने रखता है।" };
      const totalDone = Object.keys(focusDone).length;
      return (
        <div className="fade-in" style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 32px", background:T.bg, textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:20 }}>{g.emoji}</div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:T.text, fontWeight:300, lineHeight:1.4, marginBottom:12 }}>
            {lang==="Hindi"?"हो गया।":"Done."}
          </p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:18, color:T.textSoft, lineHeight:1.7, marginBottom:32, maxWidth:280 }}>
            {lang==="Hindi" ? msg.hi : msg.en}
          </p>
          {totalDone > 1 && (
            <div style={{ background:`${T.accent}10`, border:`1px solid ${T.accent}20`, borderRadius:14, padding:"10px 20px", marginBottom:24 }}>
              <p style={{ fontSize:13, color:T.accent, margin:0 }}>
                {lang==="Hindi" ? `आपने अब तक ${totalDone} अभ्यास किए हैं 🌟` : `${totalDone} practices completed so far 🌟`}
              </p>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:300 }}>
            <button onClick={() => { setGameComplete(false); setActiveGame(null); }}
              style={{ background:`${T.accent}18`, border:`1px solid ${T.accent}40`, borderRadius:16, padding:"14px", color:T.accent, fontSize:14, fontWeight:500 }}>
              {lang==="Hindi"?"अभ्यास पर वापस जाएं →":"Back to practices →"}
            </button>
            <button onClick={() => setTab("home")}
              style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:16, padding:"14px", color:T.muted, fontSize:14 }}>
              🏡 {lang==="Hindi"?"होम":"Home"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <PageNav onBack={() => { setActiveGame(null); setGameComplete(false); }} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
        <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
        <div style={{ padding:"0 18px 0" }}>
          {/* Large clear instruction at top */}
          <div style={{ background:`${T.accent}12`, border:`1px solid ${T.accent}30`, borderRadius:18, padding:"16px 18px", marginBottom:20 }}>
            <p style={{ fontSize:22, margin:"0 0 6px" }}>{g.emoji}</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.text, fontWeight:400, margin:"0 0 10px", lineHeight:1.3 }}>{g.label}</p>
            <p style={{ fontSize:15, color:T.textSoft, lineHeight:1.8, margin:0 }}>{GAME_DESC[activeGame]}</p>
          </div>
          {activeGame==="anchor"    && <SensoryAnchor T={T} lang={lang} />}
          {activeGame==="bilateral" && <BilateralTapping T={T} lang={lang} />}
          {activeGame==="breath"    && <BreathPainting T={T} lang={lang} />}
          {activeGame==="stone"     && <StoneDrop T={T} lang={lang} />}
          {activeGame==="nadi"      && <NadiShodhana T={T} lang={lang} />}
          {activeGame==="letter"    && <UnsentLetter T={T} lang={lang} />}
          {activeGame==="bloom"     && <BloomGame T={T} lang={lang} />}
          {activeGame==="particles" && (
            <div style={{ position:"relative", height:300, width:"100%", background:T.surface, borderRadius:20, border:`1px solid ${T.borderWarm}`, overflow:"hidden" }}>
              <ParticleCanvas mode="idle" T={T} />
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex:10 }}>
                <p style={{ color:T.muted, fontSize:14, letterSpacing:2, textTransform:"uppercase" }}>{lang==="Hindi"?"दबाकर रखें":"Press & Hold"}</p>
              </div>
            </div>
          )}
          {/* Done button */}
          <button onClick={() => markComplete(activeGame)}
            style={{ width:"100%", marginTop:24, background:`${T.accent}15`, border:`1px solid ${T.accent}35`, borderRadius:16, padding:"16px", color:T.accent, fontSize:14, fontWeight:500 }}>
            {lang==="Hindi"?"✓ हो गया — मैंने यह किया":"✓ I'm done — mark complete"}
          </button>
        </div>
        </div>
      </div>
    );
  }

  const featured = GAMES.find(g => g.featured);
  const rest = GAMES.filter(g => !g.featured);

  // ── Game grid ──
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }}>
      <div style={{ padding:"20px 18px 0" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, marginBottom:4 }}>
          {lang==="Hindi" ? "ध्यान केंद्र" : "Focus"}
        </h1>
        <p style={{ fontSize:14, color:T.muted, marginBottom:22, lineHeight:1.6 }}>
          {lang==="Hindi" ? "जब मन अस्थिर हो — कोई एक चुनें और बस शुरू करें।" : "When your mind feels unsteady — pick one and just begin."}
        </p>

        {/* ── Featured card — 5-4-3-2-1, large and prominent ── */}
        <button onClick={() => { setGameComplete(false); setActiveGame(featured.id); }} style={{ width:"100%", background:`${T.accent}18`, border:`2px solid ${T.accent}55`, borderRadius:22, padding:"22px 20px", textAlign:"left", marginBottom:14, display:"flex", flexDirection:"column", gap:10, transition:"all 0.2s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:36 }}>{featured.emoji}</span>
            <div>
              <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", margin:"0 0 3px", fontWeight:600 }}>
                {lang==="Hindi" ? "▶ यहाँ से शुरू करें" : "▶ start here"}
              </p>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:T.text, fontWeight:400, margin:0, lineHeight:1.2 }}>{featured.label}</p>
            </div>
          </div>
          <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.75, margin:0 }}>{featured.instruction}</p>
          <div style={{ alignSelf:"flex-start", background:`${T.accent}25`, border:`1px solid ${T.accent}50`, borderRadius:99, padding:"8px 20px" }}>
            <span style={{ fontSize:13, color:T.accent, fontWeight:500 }}>{lang==="Hindi" ? "खेलें →" : "Begin →"}</span>
          </div>
        </button>

        {/* ── Divider ── */}
        <p style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12, marginTop:8 }}>
          {lang==="Hindi" ? "या कोई और चुनें" : "or choose another"}
        </p>

        {/* ── Rest of games — 2 column, larger cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          {rest.map(g => (
            <button key={g.id} onClick={() => { setGameComplete(false); setActiveGame(g.id); }} style={{ background:T.surface, border:`1px solid ${focusDone[g.id]===new Date().toDateString()?T.accent+"55":T.borderWarm}`, borderRadius:18, padding:"18px 14px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:8, backdropFilter:"blur(8px)", transition:"all 0.2s ease", textAlign:"left", position:"relative" }}>
              {focusDone[g.id]===new Date().toDateString() && <span style={{ position:"absolute", top:10, right:10, fontSize:12, color:T.accent }}>✓</span>}
              <span style={{ fontSize:30 }}>{g.emoji}</span>
              <p style={{ fontSize:15, color:T.accent, fontWeight:600, margin:0, lineHeight:1.3 }}>{g.label}</p>
              <p style={{ fontSize:12, color:T.muted, margin:0, lineHeight:1.55 }}>{g.shortDesc}</p>
            </button>
          ))}
        </div>

        {/* ── ZenBox at bottom, explained ── */}
        <p style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
          {lang==="Hindi" ? "या बस छुएं और महसूस करें" : "or just touch and feel"}
        </p>
        <ZenBox T={T} lang={lang} />
      </div>
      </div>
    </div>
  );
}

// ─── BENCH ───────────────────────────────────────────────────────────
function Bench({ T, lang, setTab, goBack }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random()*PARK_BENCH_QUOTES.length));
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [activeSound, setActiveSound] = useState(null);
  const benchAudioRef = useRef(null);

  // ── Auto-cycle quotes every 12s ──
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(prev => { let n; do { n = Math.floor(Math.random()*PARK_BENCH_QUOTES.length); } while(n===prev); return n; });
        setQuoteVisible(true);
      }, 800);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // ── Web Audio sound engine ──
  // Store AudioContext at module level so it truly stops on unmount
  const killAudio = () => {
    if (benchAudioRef.current) {
      benchAudioRef.current.pause();
      benchAudioRef.current.src = "";
      benchAudioRef.current = null;
    }
    setActiveSound(null);
  };

  const playBenchSound = (key) => {
    if (activeSound === key) { killAudio(); return; }
    // kill any AudioPage audio playing
    if (window.__pageAudio) { window.__pageAudio.pause(); window.__pageAudio.src=""; window.__pageAudio=null; }
    window.speechSynthesis?.cancel();
    if (benchAudioRef.current) { benchAudioRef.current.pause(); benchAudioRef.current.src = ""; }
    const a = new Audio(AUDIO_URLS[key]);
    a.loop = true;
    a.play().catch(err => console.warn("Bench audio:", key, err));
    benchAudioRef.current = a;
    window.__benchAudio = a;
    setActiveSound(key);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      // Always use window dimensions — offsetWidth can be 0 on mobile before layout
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Tree data — positions along bottom, varying sizes
    const trees = [
      { x: 0.08, baseH: 0.55, trunkW: 14, layers: 4, sway: 0, swaySpeed: 0.0008, swayAmt: 0.022, col: "#2d4a2d" },
      { x: 0.18, baseH: 0.45, trunkW: 10, layers: 3, sway: 1.2, swaySpeed: 0.001,  swayAmt: 0.018, col: "#3a5a3a" },
      { x: 0.78, baseH: 0.50, trunkW: 11, layers: 3, sway: 0.5, swaySpeed: 0.0009, swayAmt: 0.020, col: "#2d4a2d" },
      { x: 0.88, baseH: 0.60, trunkW: 15, layers: 4, sway: 2.1, swaySpeed: 0.0007, swayAmt: 0.025, col: "#3a5a3a" },
      { x: 0.93, baseH: 0.38, trunkW: 8,  layers: 3, sway: 0.8, swaySpeed: 0.0012, swayAmt: 0.015, col: "#4a6a4a" },
    ];

    // Rain drops
    const drops = Array.from({length: 120}, () => ({
      x: Math.random(), y: Math.random(),
      speed: 0.004 + Math.random() * 0.006,
      len: 0.015 + Math.random() * 0.025,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    const drawTree = (ctx, t, time) => {
      const x = t.x * W();
      const groundY = H() * 0.72;
      const treeH = t.baseH * H();
      const sway = Math.sin(time * t.swaySpeed + t.sway) * t.swayAmt;

      ctx.save();
      ctx.translate(x, groundY);

      // Trunk
      const trunkH = treeH * 0.28;
      ctx.fillStyle = "#5c3d1e";
      ctx.beginPath();
      ctx.moveTo(-t.trunkW/2, 0);
      ctx.quadraticCurveTo(-t.trunkW/2 + sway*40, -trunkH*0.5, -t.trunkW/3 + sway*80, -trunkH);
      ctx.quadraticCurveTo(t.trunkW/3 + sway*80, -trunkH, t.trunkW/2 + sway*40, -trunkH*0.5);
      ctx.quadraticCurveTo(t.trunkW/2, 0, -t.trunkW/2, 0);
      ctx.fill();

      // Foliage layers — each layer sways more than lower ones
      for (let i = 0; i < t.layers; i++) {
        const layerY = -trunkH - (i * treeH * 0.18);
        const layerSway = sway * (80 + i * 60);
        const layerW = (t.trunkW * 4.5) * (1 - i * 0.18);
        const layerH = treeH * 0.28 * (1 - i * 0.12);
        const alpha = 0.9 - i * 0.08;

        // Shadow layer
        ctx.fillStyle = `rgba(20,50,20,${alpha * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(layerSway + 6, layerY + 8, layerW * 0.85, layerH * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main foliage
        ctx.fillStyle = t.col + Math.floor(alpha * 255).toString(16).padStart(2,"0");
        ctx.beginPath();
        ctx.moveTo(layerSway, layerY - layerH);
        ctx.bezierCurveTo(layerSway + layerW*0.6, layerY - layerH*0.5, layerSway + layerW, layerY + layerH*0.2, layerSway, layerY + layerH*0.3);
        ctx.bezierCurveTo(layerSway - layerW, layerY + layerH*0.2, layerSway - layerW*0.6, layerY - layerH*0.5, layerSway, layerY - layerH);
        ctx.fill();

        // Lighter highlights
        ctx.fillStyle = `rgba(100,160,80,${alpha * 0.25})`;
        ctx.beginPath();
        ctx.ellipse(layerSway - layerW * 0.2, layerY - layerH * 0.3, layerW * 0.3, layerH * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawRain = (ctx) => {
      ctx.strokeStyle = "rgba(180,210,240,0.35)";
      ctx.lineWidth = 1;
      drops.forEach(d => {
        d.y += d.speed;
        if (d.y > 1) { d.y = -d.len; d.x = Math.random(); }
        ctx.globalAlpha = d.opacity;
        ctx.beginPath();
        ctx.moveTo(d.x * W(), d.y * H());
        ctx.lineTo(d.x * W() - 1, (d.y + d.len) * H());
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    const drawSky = (ctx, time) => {
      // Soft dusk/dawn gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H() * 0.7);
      const breathe = (Math.sin(time * 0.0003) + 1) / 2;
      grad.addColorStop(0, `rgba(${20+breathe*10},${30+breathe*8},${55+breathe*10},1)`);
      grad.addColorStop(0.5, `rgba(${40+breathe*15},${55+breathe*10},${80+breathe*12},1)`);
      grad.addColorStop(1, `rgba(${60+breathe*10},${80+breathe*8},${70+breathe*6},1)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H() * 0.72);
    };

    const drawGround = (ctx) => {
      const grad = ctx.createLinearGradient(0, H()*0.72, 0, H());
      grad.addColorStop(0, "#1a2e1a");
      grad.addColorStop(0.4, "#1e341e");
      grad.addColorStop(1, "#152615");
      ctx.fillStyle = grad;
      ctx.fillRect(0, H()*0.72, W(), H()*0.28);

      // Grass tufts along horizon
      ctx.strokeStyle = "rgba(60,100,50,0.6)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 30; i++) {
        const gx = (i / 30 + 0.016) * W();
        const gy = H() * 0.725;
        const sway = Math.sin(timeRef.current * 0.001 + i * 0.7) * 3;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + sway, gy - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx + 3, gy); ctx.lineTo(gx + sway + 2, gy - 6); ctx.stroke();
      }
    };

    const drawBench = (ctx) => {
      const bx = W() * 0.5;
      const by = H() * 0.72;
      ctx.fillStyle = "#6b4226";
      // Seat
      ctx.fillRect(bx - 55, by - 22, 110, 10);
      // Back
      ctx.fillRect(bx - 50, by - 50, 100, 8);
      // Legs
      ctx.fillRect(bx - 48, by - 12, 8, 20);
      ctx.fillRect(bx + 40, by - 12, 8, 20);
      // Back supports
      ctx.fillRect(bx - 40, by - 50, 6, 30);
      ctx.fillRect(bx + 34, by - 50, 6, 30);
      // Armrests
      ctx.fillStyle = "#7d5133";
      ctx.fillRect(bx - 56, by - 30, 12, 8);
      ctx.fillRect(bx + 44, by - 30, 12, 8);
    };

    const drawMoon = (ctx, time) => {
      const mx = W() * 0.75;
      const my = H() * 0.15;
      const glow = ctx.createRadialGradient(mx, my, 8, mx, my, 40);
      glow.addColorStop(0, "rgba(255,250,230,0.15)");
      glow.addColorStop(1, "rgba(255,250,230,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(mx, my, 40, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,252,240,0.9)";
      ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI*2); ctx.fill();
    };

    // Stars
    const stars = Array.from({length:40},()=>({
      x: Math.random(), y: Math.random()*0.65,
      r: 0.5+Math.random()*1.2, phase: Math.random()*Math.PI*2,
    }));

    const drawStars = (ctx, time) => {
      stars.forEach(s => {
        const alpha = 0.3 + Math.sin(time*0.001 + s.phase)*0.4;
        ctx.fillStyle = `rgba(255,255,240,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x*W(), s.y*H(), s.r, 0, Math.PI*2);
        ctx.fill();
      });
    };

    const render = (time) => {
      timeRef.current = time;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W(), H());
      drawSky(ctx, time);
      drawStars(ctx, time);
      drawMoon(ctx, time);
      drawGround(ctx);
      trees.forEach(t => drawTree(ctx, t, time));
      drawBench(ctx);
      drawRain(ctx);
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, background:"#0a1a0a", display:"flex", flexDirection:"column" }}>

      {/* Canvas scene — full background */}
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />

      {/* Back button */}
      <button onClick={() => { killAudio(); if(goBack) goBack(); else if(setTab) setTab("home"); }} style={{ position:"absolute", top:`calc(16px + env(safe-area-inset-top,0px))`, left:16, zIndex:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:99, color:"rgba(255,255,255,0.6)", fontSize:13, padding:"8px 16px", display:"flex", alignItems:"center", gap:6 }}>
        ← {lang==="Hindi"?"वापस":"Back"}
      </button>
      <button onClick={() => { killAudio(); if(setTab) setTab("home"); }} style={{ position:"absolute", top:`calc(16px + env(safe-area-inset-top,0px))`, right:16, zIndex:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:99, color:"rgba(255,255,255,0.8)", fontSize:13, padding:"8px 14px" }}>
        🏡
      </button>

      {/* Sound controls — centered row below nav buttons */}
      <div style={{ position:"absolute", top:`calc(64px + env(safe-area-inset-top,0px))`, left:0, right:0, zIndex:10, display:"flex", justifyContent:"center", gap:8, padding:"0 12px" }}>
        {[
          { key:"birds.mp3",  icon:"🐦", label:lang==="Hindi"?"पक्षी":"Birds"  },
          { key:"wind.mp3",   icon:"💨", label:lang==="Hindi"?"हवा":"Wind"     },
          { key:"forest.mp3", icon:"🌲", label:lang==="Hindi"?"जंगल":"Forest"  },
          { key:"flute.mp3",  icon:"🪈", label:lang==="Hindi"?"बांसुरी":"Flute" },
          { key:"waves.mp3",  icon:"🌊", label:lang==="Hindi"?"लहरें":"Waves"  },
        ].map(s => (
          <button key={s.key} onClick={() => playBenchSound(s.key)}
            style={{ background:activeSound===s.key?"rgba(255,255,255,0.22)":"rgba(0,0,0,0.35)", border:`1px solid ${activeSound===s.key?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.12)"}`, borderRadius:99, color:"rgba(255,255,255,0.9)", padding:"7px 10px", display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:14 }}>{s.icon}</span>
            <span style={{ fontSize:10, letterSpacing:.3 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Quote — centered, upper sky area for visibility */}
      <div style={{ position:"absolute", top:"18%", left:0, right:0, padding:"0 28px", display:"flex", flexDirection:"column", alignItems:"center", zIndex:10 }}>
        <div style={{ opacity: quoteVisible ? 1 : 0, transform: quoteVisible ? "translateY(0)" : "translateY(10px)", transition:"all 0.8s ease", maxWidth:320, textAlign:"center" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:"rgba(255,252,240,0.95)", lineHeight:1.7, fontStyle:"italic", textShadow:"0 4px 32px rgba(0,0,0,0.9), 0 1px 8px rgba(0,0,0,0.8)", margin:"0 0 20px", letterSpacing:.3 }}>
            "{PARK_BENCH_QUOTES[quoteIdx]}"
          </p>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button onClick={() => {
              setQuoteVisible(false);
              setTimeout(() => {
                setQuoteIdx(prev => { let n; do { n=Math.floor(Math.random()*PARK_BENCH_QUOTES.length); } while(n===prev); return n; });
                setQuoteVisible(true);
              }, 600);
            }} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:99, color:"rgba(255,255,255,0.45)", fontSize:11, padding:"8px 22px", letterSpacing:1 }}>
              {lang==="Hindi"?"थोड़ा और बैठें":"sit a little longer"}
            </button>
            <button onClick={() => {
              const quote = PARK_BENCH_QUOTES[quoteIdx];
              const shareText = `"${quote}"

— JSukoon Sanctuary · jsukoon.vercel.app`;
              if (navigator.share) { navigator.share({ text: shareText }).catch(()=>{}); }
              else { navigator.clipboard?.writeText(shareText).catch(()=>{}); alert("Copied to clipboard"); }
            }} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:99, color:"rgba(255,255,255,0.35)", fontSize:11, padding:"8px 14px" }}>
              {lang==="Hindi"?"शेयर करें":"share"}
            </button>
          </div>
        </div>
      </div>

      {/* Sound on hint — only if sound is off */}
      {!activeSound && (
        <div style={{ position:"absolute", bottom:"8%", left:0, right:0, textAlign:"center", zIndex:10 }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", letterSpacing:2, textTransform:"uppercase" }}>
            {lang==="Hindi"?"ऊपर ध्वनि चालू करें ↑":"tap a sound above ↑"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS ────────────────────────────────────────────────────────
function Progress({ T, lang, setTab, goBack }) {
  const [stats]    = useLS("jsukoon_stats", { sessions:0, minutes:0, streak:0 });
  const [weekData] = useLS("jsukoon_week",  { Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0 });
  const [entries]  = useLS("jsukoon_journal", []);
  const mettaCount = parseInt(localStorage.getItem("jsukoon_metta_count") || "0");
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const daysHindi = ["सोम","मंगल","बुध","गुरु","शुक्र","शनि","रवि"];
  const todayIdx = new Date().getDay()===0?6:new Date().getDay()-1;
  const todayLabel = days[todayIdx];
  // Only show days up to and including today — no empty future bars
  const visibleDays = days.slice(0, todayIdx + 1);
  const visibleDaysHindi = daysHindi.slice(0, todayIdx + 1);
  const maxS = Math.max(...visibleDays.map(d=>weekData[d]||0),1);

  // Derive insight from data
  const totalDays = Object.values(weekData).filter(v=>v>0).length;
  const bestDay = days.reduce((a,b)=>(weekData[a]||0)>=(weekData[b]||0)?a:b);
  const journalCount = entries.length;
  const hasAIEntries = entries.filter(e=>e.aiReflection).length;

  const getInsight = () => {
    if (stats.sessions === 0) return lang==="Hindi"
      ? "आपकी यात्रा अभी शुरू नहीं हुई है। पहला कदम सबसे कठिन होता है।"
      : "Your journey hasn't begun yet. The first step is always the hardest — and the most important.";
    if (stats.sessions === 1) return lang==="Hindi"
      ? "पहला कदम उठा लिया। यही सबसे बड़ी बात है।"
      : "You took the first step. That alone puts you ahead of where you were.";
    if (totalDays >= 5) return lang==="Hindi"
      ? `इस सप्ताह ${totalDays} दिन। यह एक आदत बन रही है।`
      : `${totalDays} days this week. That's not a streak — that's a habit forming.`;
    if (stats.streak >= 7) return lang==="Hindi"
      ? `${stats.streak} दिनों की देखभाल। आप खुद को प्राथमिकता दे रहे हैं।`
      : `${stats.streak} days of showing up for yourself. Most people never get here.`;
    if (journalCount >= 3 && hasAIEntries > 0) return lang==="Hindi"
      ? "जर्नल और AI प्रतिबिंब दोनों — आप गहराई से काम कर रहे हैं।"
      : "Journal entries with AI reflections — you're doing the deeper work, not just the surface practice.";
    if (weekData[bestDay] > 1) return lang==="Hindi"
      ? `${daysHindi[days.indexOf(bestDay)]} आपका सबसे अच्छा दिन रहा। उस समय को याद रखें।`
      : `${bestDay} is your strongest day. Notice what makes that time work for you.`;
    return lang==="Hindi"
      ? `${stats.sessions} सत्र, ${stats.minutes} मिनट। हर एक मायने रखता है।`
      : `${stats.sessions} sessions, ${stats.minutes} minutes of genuine care. Every one of them mattered.`;
  };

  // Empty state — brand new user
  const isEmpty = stats.sessions === 0 && stats.minutes === 0 && entries.length === 0;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      {isEmpty ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"80%", padding:"0 36px", textAlign:"center" }}>
          <span style={{ fontSize:56, marginBottom:20 }}>🌱</span>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:T.text, fontWeight:400, marginBottom:12, lineHeight:1.3 }}>
            {lang==="Hindi" ? "आपकी यात्रा यहाँ से शुरू होती है।" : "Your journey starts here."}
          </h2>
          <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.8, marginBottom:32 }}>
            {lang==="Hindi"
              ? "आपका पहला सत्र पूरा करें — यह पृष्ठ आपकी देखभाल का आईना बन जाएगा।"
              : "Complete your first session and this page will begin to reflect your care. There is nothing to measure yet — that is perfectly fine."}
          </p>
          <button onClick={() => setTab("practice")} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, borderRadius:99, padding:"14px 32px", color:T.accent, fontSize:14, fontWeight:500 }}>
            {lang==="Hindi" ? "पहला सत्र शुरू करें →" : "Begin your first session →"}
          </button>
        </div>
      ) : (
      <div style={{ padding:"0 18px 0" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, marginBottom:4, marginTop:16 }}>{lang==="Hindi"?"आपकी प्रगति":"Your Progress"}</h1>
        <p style={{ fontSize:13, color:T.textSoft, marginBottom:8 }}>{lang==="Hindi"?"देखभाल का हर पल मायने रखता है":"Every moment of care counts"}</p>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:`${T.accent}08`, border:`1px solid ${T.accent}18`, borderRadius:10, padding:"7px 12px", marginBottom:20 }}>
          <span style={{ fontSize:12 }}>📱</span>
          <p style={{ fontSize:11, color:T.muted, margin:0, lineHeight:1.5 }}>
            {lang==="Hindi"
              ? "आपका डेटा केवल इस डिवाइस पर सहेजा गया है। ब्राउज़र डेटा साफ़ करने पर यह मिट जाएगा।"
              : "Your data is saved on this device only. Clearing browser data will erase it."}
          </p>
        </div>

        {/* Congratulations Card — shown when milestones hit */}
        {(stats.sessions >= 1) && (
          <Card T={T} style={{ marginBottom:20, background:`${T.accent}08`, border:`1px solid ${T.accent}25` }}>
            <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", margin:"0 0 10px", fontWeight:500 }}>🎉 {lang==="Hindi"?"आपकी उपलब्धियाँ":"Your Achievements"}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {stats.sessions >= 1 && <p style={{ fontSize:13, color:T.textSoft, margin:0 }}>✅ {lang==="Hindi"?`${stats.sessions} ध्यान सत्र पूरे किए`:`Completed ${stats.sessions} meditation session${stats.sessions!==1?"s":""}`}</p>}
              {entries.length >= 1 && <p style={{ fontSize:13, color:T.textSoft, margin:0 }}>✅ {lang==="Hindi"?`${entries.length} जर्नल प्रविष्टियाँ लिखीं`:`Wrote ${entries.length} journal entr${entries.length!==1?"ies":"y"}`}</p>}
              {mettaCount >= 1 && <p style={{ fontSize:13, color:T.textSoft, margin:0 }}>✅ {lang==="Hindi"?`${mettaCount} बार गर्माहट भेजी`:`Sent warmth ${mettaCount} time${mettaCount!==1?"s":""}`}</p>}
              {stats.streak >= 3 && <p style={{ fontSize:13, color:T.accent, margin:0, fontWeight:500 }}>🔥 {lang==="Hindi"?`${stats.streak} दिनों की streak — शानदार!`:`${stats.streak}-day streak — incredible!`}</p>}
              {stats.minutes >= 60 && <p style={{ fontSize:13, color:T.accent, margin:0, fontWeight:500 }}>⭐ {lang==="Hindi"?`${stats.minutes} मिनट की देखभाल — आप खुद को प्राथमिकता दे रहे हैं`:`${stats.minutes} minutes of care — you are prioritising yourself`}</p>}
            </div>
          </Card>
        )}

        {/* Achievements explanation */}
        {stats.sessions >= 1 && (
          <p style={{ fontSize:12, color:T.muted, lineHeight:1.7, margin:"-12px 0 20px", padding:"0 4px", fontStyle:"italic" }}>
            {lang==="Hindi"
              ? "ये वो पल हैं जब आपने खुद को चुना। हर एक अपने आप में पूरा है।"
              : "These are the moments you chose yourself. Each one complete on its own — nothing owed, nothing pending."}
          </p>
        )}

        {/* Weekly Insight Card */}
        <Card T={T} style={{ marginBottom:20, background:`${T.accent}10`, border:`1px solid ${T.accent}30` }}>
          <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", margin:"0 0 10px", fontWeight:500 }}>✦ {lang==="Hindi"?"इस सप्ताह की अंतर्दृष्टि":"This Week's Insight"}</p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:T.text, lineHeight:1.7, margin:0 }}>{getInsight()}</p>
        </Card>

        {/* Weekly Insight explanation */}
        <p style={{ fontSize:12, color:T.muted, lineHeight:1.7, margin:"-12px 0 20px", padding:"0 4px", fontStyle:"italic" }}>
          {lang==="Hindi"
            ? "यह अंतर्दृष्टि आपके डेटा से बनाई गई है — आपकी अपनी यात्रा का एक शांत आईना।"
            : "This insight is drawn from your own data — a quiet mirror of your journey so far, not a judgement."}
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          {[
            { label:lang==="Hindi"?"कुल सत्र":"Sessions",      val:stats.sessions, emoji:"🧘",
              sub: lang==="Hindi"
                ? (stats.sessions===0?"आज शुरू करें":stats.sessions===1?"पहला कदम लिया गया":`औसत ${stats.sessions>0?(stats.minutes/stats.sessions).toFixed(0):0} मिनट`)
                : (stats.sessions===0?"begin today":stats.sessions===1?"first step taken":`avg ${stats.sessions>0?(stats.minutes/stats.sessions).toFixed(0):0} min each`) },
            { label:lang==="Hindi"?"देखभाल के मिनट":"Minutes",   val:stats.minutes,  emoji:"⏱️",
              sub: lang==="Hindi"
                ? (stats.minutes < 10 ? "अभी शुरुआत है" : stats.minutes < 60 ? "निरंतरता बन रही है" : `कुल ${(stats.minutes/60).toFixed(1)} घंटे`)
                : (stats.minutes < 10 ? "just getting started" : stats.minutes < 60 ? "building consistency" : `${(stats.minutes/60).toFixed(1)} hours total`) },
            { label:lang==="Hindi"?"क्रम":"Streak",               val:stats.streak,   emoji:"🔥",
              sub: lang==="Hindi"
                ? (stats.streak===0?"आज शुरू करें":stats.streak===1?"पहला दिन ✓":stats.streak>=7?"पूरा एक हफ्ता 🌟":`${stats.streak} दिन`)
                : (stats.streak===0?"start today":stats.streak===1?"day 1 ✓":stats.streak>=7?"one full week 🌟":`${stats.streak} days`) },
            { label:lang==="Hindi"?"जर्नल":"Journal",             val:entries.length, emoji:"📖",
              sub: lang==="Hindi"
                ? (entries.length===0?"पहली प्रविष्टि लिखें":"प्रविष्टियाँ सहेजी गई")
                : (entries.length===0?"write your first":"entries saved") },
          ].map(s => (
            <Card T={T} key={s.label} style={{ textAlign:"center" }}>
              <span style={{ fontSize:26, display:"block", marginBottom:4 }}>{s.emoji}</span>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:T.accentSoft, margin:"0 0 2px" }}>{s.val}</p>
              <p style={{ fontSize:12, color:T.textSoft, letterSpacing:.5, textTransform:"uppercase", margin:"0 0 4px", fontWeight:500 }}>{s.label}</p>
              <p style={{ fontSize:11, color:T.muted, margin:0, fontStyle:"italic" }}>{s.sub}</p>
            </Card>
          ))}
        </div>

        {/* Stat cards explanation */}
        <div style={{ marginBottom:20, padding:"0 4px" }}>
          <p style={{ fontSize:12, color:T.muted, lineHeight:1.8, margin:"0 0 6px", fontStyle:"italic" }}>
            {lang==="Hindi"
              ? "सत्र बताते हैं कि आपने कितनी बार खुद के लिए समय निकाला। मिनट बताते हैं कि वह समय कितना गहरा था। क्रम बताता है कि आप कितने दिनों से लगातार आ रहे हैं — लेकिन याद रहे, टूटा हुआ क्रम कोई विफलता नहीं।"
              : "Sessions show how many times you made space for yourself. Minutes show how deep that care went. Streak shows how many days you have shown up — but a broken streak is never a failure. It is just life."}
          </p>
          <p style={{ fontSize:12, color:T.muted, lineHeight:1.8, margin:0, fontStyle:"italic" }}>
            {lang==="Hindi"
              ? "जर्नल प्रविष्टियाँ उन पलों की गिनती हैं जब आपने अपने विचारों को शब्द दिए।"
              : "Journal entries count the moments you gave your thoughts a voice — which takes more courage than it looks."}
          </p>
        </div>

        <Card T={T} style={{ marginBottom:20 }}>
          <SectionLabel text={lang==="Hindi"?"इस सप्ताह":"This week"} T={T} />
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:90 }}>
            {visibleDays.map((d,i) => {
              const val = weekData[d]||0;
              const isToday = d===todayLabel;
              const pct = (val/maxS)*70;
              return (
                <div key={d} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  {val > 0 && <p style={{ fontSize:10, color:isToday?T.accent:T.muted, margin:0 }}>{val}</p>}
                  <div style={{ width:"100%", borderRadius:6, height:`${Math.max(pct,3)}px`, background:isToday?T.accent:val>0?`${T.accent}50`:`${T.accent}15`, transition:"height 0.5s ease", boxShadow:isToday?`0 0 8px ${T.accent}40`:"none" }} />
                  <span style={{ fontSize:11, color:isToday?T.accent:T.textSoft, fontWeight:isToday?600:400 }}>{lang==="Hindi"?visibleDaysHindi[i]:d}</span>
                </div>
              );
            })}
          </div>
          {totalDays > 0 && (
            <p style={{ fontSize:12, color:T.muted, textAlign:"center", marginTop:12, fontStyle:"italic" }}>
              {lang==="Hindi"?`${totalDays} / 7 दिन सक्रिय`:`Active ${totalDays} of 7 days this week`}
            </p>
          )}
        </Card>

        {/* Week chart explanation */}
        <p style={{ fontSize:12, color:T.muted, lineHeight:1.7, margin:"-8px 0 20px", padding:"0 4px", fontStyle:"italic" }}>
          {lang==="Hindi"
            ? "यह चार्ट दिखाता है कि आप इस सप्ताह किस दिन सबसे ज़्यादा सक्रिय रहे। पैटर्न देखें — अक्सर एक दिन होता है जो बाकियों से बेहतर काम करता है।"
            : "This chart shows which days you showed up most this week. Look for a pattern — there is usually one day that works better than the rest. That is worth knowing."}
        </p>

        <SectionLabel text={lang==="Hindi"?"उपलब्धियाँ":"Milestones"} T={T} />
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {MILESTONES.map(m => {
            const earned=(m.needSessions>0&&stats.sessions>=m.needSessions)||(m.needStreak>0&&stats.streak>=m.needStreak);
            const progress = m.needSessions>0
              ? Math.min(stats.sessions/m.needSessions,1)
              : Math.min(stats.streak/m.needStreak,1);
            return (
              <div key={m.label} style={{ background:earned?`${T.accent}12`:T.surface, border:`1px solid ${earned?T.accent+"40":T.border}`, borderRadius:14, padding:"14px 16px", backdropFilter:"blur(8px)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:earned?0:8 }}>
                  <span style={{ fontSize:26, opacity:earned?1:.5 }}>{m.emoji}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:500, color:earned?T.accent:T.text, margin:"0 0 2px", fontSize:14 }}>{lang==="Hindi"?(m.labelH||m.label):m.label}</p>
                    <p style={{ fontSize:12, color:T.textSoft, margin:0 }}>
                      {m.needSessions>0
                        ? `${Math.min(stats.sessions,m.needSessions)} / ${m.needSessions} sessions`
                        : `${Math.min(stats.streak,m.needStreak)} / ${m.needStreak}-day streak`}
                      {earned ? " · ✓ Earned" : ""}
                    </p>
                  </div>
                </div>
                {!earned && (
                  <div style={{ height:3, background:T.surfaceAlt, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${progress*100}%`, background:`${T.accent}70`, borderRadius:99, transition:"width 0.5s ease" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Milestones explanation */}
        <p style={{ fontSize:12, color:T.muted, lineHeight:1.7, margin:"-8px 0 32px", padding:"0 4px", fontStyle:"italic" }}>
          {lang==="Hindi"
            ? "ये उपलब्धियाँ इसलिए नहीं हैं कि आप किसी से आगे हैं। ये इसलिए हैं ताकि आप देख सकें कि आप कहाँ से आए हैं।"
            : "These milestones are not here to compare you to anyone. They are here so you can see how far you have already come — which is easy to forget when you are still in the middle of it."}
        </p>
      </div>
      )} {/* end isEmpty else */}
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────
function Settings({ setTab, goBack, T, lang, setLang, themeKey, setThemeKey }) {
  const [prevTheme, setPrevTheme] = useState(null);
  const THEME_GROUPS = {
    [lang==="Hindi"?"प्रकाश अभयारण्य":"Light Sanctuary"]: ["PinkChampagne","FirstLight","SeaGlass","SageSanctuary","Terracotta","ChampagneGold"],
    [lang==="Hindi"?"गहरा अभयारण्य":"Deep Sanctuary"]:    ["Void","DeepSage","OceanBlue","TwilightBlue","Maroon","SocialBlue"],
  };

  const [, setThemeSource] = useLS("jsukoon_theme_source", "auto");
  const handleThemeChange = (k) => {
    if (k !== themeKey) {
      setPrevTheme(themeKey);
      setThemeKey(k);
      setThemeSource("manual"); // user chose this — don't let mood override it
    }
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      <div style={{ padding:"0 18px 0" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, marginBottom:20, marginTop:16 }}>{lang==="Hindi"?"सेटिंग्स":"Settings"}</h1>
        {prevTheme && (
          <div style={{ display:"flex", gap:8, marginBottom:20, background:`${T.accent}08`, border:`1px solid ${T.accent}18`, borderRadius:14, padding:"10px 14px", alignItems:"center" }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:11, color:T.muted, margin:"0 0 2px", letterSpacing:1 }}>{lang==="Hindi"?"वर्तमान थीम":"Current theme"}</p>
              <p style={{ fontSize:13, color:T.accent, margin:0, fontWeight:500 }}>{lang==="Hindi"?(THEMES[themeKey].nameH||THEMES[themeKey].name):THEMES[themeKey].name}</p>
            </div>
            <button onClick={() => { const p=prevTheme; setPrevTheme(themeKey); setThemeKey(p); }}
              style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}30`, borderRadius:99, padding:"7px 14px", color:T.accent, fontSize:12, whiteSpace:"nowrap" }}>
              ↩ {lang==="Hindi"?"पिछली थीम":"Previous theme"}
            </button>
          </div>
        )}
        <SectionLabel text={lang==="Hindi"?"भाषा":"Language"} T={T} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
          {["English","Hindi"].map(l => (<button key={l} onClick={()=>setLang(l)} style={{ background:lang===l?`${T.accent}22`:T.surface, border:`1px solid ${lang===l?T.accent+"55":T.border}`, color:lang===l?T.accent:T.muted, borderRadius:14, padding:"12px 8px", fontSize:13, backdropFilter:"blur(8px)" }}>{l==="Hindi"?"हिंदी (Hindi)":"English"}</button>))}
        </div>
        {Object.entries(THEME_GROUPS).map(([group,keys]) => (
          <div key={group}>
            <SectionLabel text={group} T={T} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
              {keys.map(k => {
                const active = themeKey === k;
                const th = THEMES[k];
                const displayName = lang==="Hindi" ? (th.nameH||th.name) : th.name;
                return (
                  <button key={k} onClick={() => handleThemeChange(k)} style={{
                    background: active ? `${T.accent}22` : T.surface,
                    border: `2px solid ${active ? T.accent : T.border}`,
                    borderRadius:16, padding:"10px 12px",
                    backdropFilter:"blur(8px)", display:"flex", flexDirection:"column",
                    gap:8, textAlign:"left", transition:"all 0.2s ease",
                    boxShadow: active ? `0 0 0 1px ${T.accent}30` : "none",
                    overflow:"hidden", position:"relative",
                  }}>
                    {/* Mini preview strip */}
                    <div style={{ display:"flex", gap:3, marginBottom:2 }}>
                      <div style={{ flex:1, height:18, borderRadius:6, background:th.bg, border:`1px solid ${th.border||"transparent"}` }} />
                      <div style={{ width:18, height:18, borderRadius:6, background:th.accent }} />
                      <div style={{ width:12, height:18, borderRadius:6, background:th.accentSoft, opacity:.7 }} />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:12, color:active?T.accent:T.textSoft, fontWeight:active?600:400, lineHeight:1.3 }}>{displayName}</span>
                      {active && <span style={{ fontSize:13, color:T.accent, flexShrink:0 }}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <SectionLabel text={lang==="Hindi"?"JSukoon इंस्टॉल करें":"Install JSukoon"} T={T} />
        <Card T={T} style={{ marginBottom:24 }}>
          <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.9 }}>
            <b style={{ color:T.accent }}>1.</b> {lang==="Hindi"?"Safari (iPhone) या Chrome (Android) में खोलें":"Open in Safari (iPhone) or Chrome (Android)"}<br/>
            <b style={{ color:T.accent }}>2.</b> {lang==="Hindi"?"Share या Menu (⋮) आइकन दबाएं":"Tap the Share or Menu (⋮) icon"}<br/>
            <b style={{ color:T.accent }}>3.</b> {lang==="Hindi"?"'Add to Home Screen' चुनें":"Select 'Add to Home Screen'"}<br/>
            <b style={{ color:T.accent }}>4.</b> {lang==="Hindi"?"होम स्क्रीन से JSukoon खोलें":"Open JSukoon from your home screen"}
          </p>
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center", paddingBottom:10 }}>
          <button onClick={()=>setTab("about")}   style={{ background:"none", border:"none", color:T.accent, fontSize:13, cursor:"pointer" }}>{lang==="Hindi"?"JSukoon के बारे में":"About JSukoon"}</button>
          <button onClick={()=>setTab("privacy")} style={{ background:"none", border:"none", color:T.muted, fontSize:12, cursor:"pointer", textDecoration:"underline" }}>{lang==="Hindi"?"गोपनीयता नीति":"Privacy Policy"}</button>
          <button onClick={()=>setTab("legal")}   style={{ background:"none", border:"none", color:T.textSoft, fontSize:13, cursor:"pointer", textDecoration:"underline", opacity:.7 }}>{lang==="Hindi"?"कानूनी अस्वीकरण":"Legal Disclaimer"}</button>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── CRISIS ──────────────────────────────────────────────────────────
function Crisis({ setTab, goBack, T, lang }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      <div style={{ padding:"0 18px 0" }}>
        <div style={{ background:"rgba(255,75,75,0.05)", border:"1px solid rgba(255,75,75,0.2)", borderRadius:20, padding:"28px 20px", textAlign:"center", marginBottom:20 }}>
          <p style={{ fontSize:10, color:"#ff6b6b", letterSpacing:3, textTransform:"uppercase", marginBottom:14 }}>NOTICE</p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:T.text, fontWeight:400, lineHeight:1.7, marginBottom:18 }}>
            {lang==="Hindi"?"यह स्थान आपातकालीन सहायता प्रदान नहीं कर सकता।\nकृपया नीचे दिए गए नंबरों पर कॉल करें।":"This space is not equipped for emergencies.\nPlease reach out to one of these numbers."}
          </p>
          <div style={{ height:1, width:"50%", background:"rgba(255,75,75,0.15)", margin:"0 auto 18px" }} />
          <p style={{ fontSize:13, color:T.muted, lineHeight:1.8 }}>{lang==="Hindi"?"आप अकेले नहीं हैं। मदद उपलब्ध है।":"You are not alone. Help is available."}</p>
        </div>
        {CRISIS_RESOURCES.map(r => (
          <a key={r.name} href={`tel:${r.number}`} style={{ textDecoration:"none", display:"block", marginBottom:10 }}>
            <Card T={T} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><p style={{ color:T.text, fontSize:14, margin:"0 0 2px", fontWeight:500 }}>{r.name}</p><p style={{ color:T.textSoft, fontSize:13, margin:0 }}>{r.desc}</p></div>
              <span style={{ color:"#ff6b6b", fontSize:13, fontWeight:600 }}>{r.number}</span>
            </Card>
          </a>
        ))}
        <button onClick={()=>setTab("home")} style={{ width:"100%", marginTop:16, background:`${T.accent}15`, border:`1px solid ${T.accent}35`, color:T.accent, fontSize:14, padding:"14px", borderRadius:14 }}>
          {lang==="Hindi"?"अभयारण्य में वापस जाएं":"Return to Sanctuary"}
        </button>
      </div>
      </div>
    </div>
  );
}

// ─── ABOUT ───────────────────────────────────────────────────────────
function About({ setTab, goBack, T, lang }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("settings"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      <div style={{ padding:"0 18px 20px" }}>
        <div style={{ textAlign:"center", marginBottom:36, marginTop:16 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:`linear-gradient(135deg,${T.accent},${T.accentSoft})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px" }}>🌿</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:T.text, fontWeight:400, marginBottom:8 }}>JSukoon</h1>
          <p style={{ fontSize:11, color:T.muted, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>Version 3.1 · Made in India</p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:16, color:T.textSoft }}>sukoon — سکون — शांति</p>
        </div>

        <Card T={T} style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>{lang==="Hindi"?"यह क्या है":"What This Is"}</p>
          <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.9 }}>
            {lang==="Hindi"
              ? "JSukoon एक डिजिटल अभयारण्य है — भारत में उन लाखों लोगों के लिए जो थके हुए हैं लेकिन रुक नहीं सकते। जो महसूस करते हैं लेकिन कह नहीं सकते।"
              : "JSukoon is a digital sanctuary — built for the millions in India who are exhausted but cannot stop. Who feel everything but can say nothing. Who need a quiet corner that does not demand anything back."}
          </p>
        </Card>

        <Card T={T} style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>{lang==="Hindi"?"सुकून का अर्थ":"What Sukoon Means"}</p>
          <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.9 }}>
            {lang==="Hindi"
              ? "सुकून — उर्दू, हिंदी, अरबी। इसका अर्थ है शांति। चैन। वह आराम जो भीतर से आता है, बाहर से नहीं। यही हम बनाना चाहते हैं।"
              : "Sukoon — Urdu, Hindi, Arabic. It means peace. Stillness. The kind of comfort that comes from within, not from achievement. That is what we are trying to build here."}
          </p>
        </Card>

        <Card T={T} style={{ marginBottom:16 }}>
          <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>{lang==="Hindi"?"हमारा दर्शन":"Our Philosophy"}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { icon:"🚫", text:lang==="Hindi"?"कोई स्ट्रीक नहीं — आप मशीन नहीं हैं":"No streaks — you are not a machine" },
              { icon:"🚫", text:lang==="Hindi"?"कोई लक्ष्य नहीं — शांति कोई उपलब्धि नहीं है":"No goals — peace is not an achievement" },
              { icon:"🚫", text:lang==="Hindi"?"कोई दबाव नहीं — यहाँ आना काफी है":"No pressure — showing up is enough" },
              { icon:"✓",  text:lang==="Hindi"?"सिर्फ सुकून":"Only Sukoon" },
            ].map((p,i) => (<div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}><span style={{ fontSize:16 }}>{p.icon}</span><p style={{ fontSize:14, color:T.textSoft, margin:0 }}>{p.text}</p></div>))}
          </div>
        </Card>

        <Card T={T} style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, color:T.accent, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>{lang==="Hindi"?"तकनीक":"The Tech"}</p>
          <p style={{ fontSize:14, color:T.textSoft, lineHeight:1.9 }}>
            {lang==="Hindi"
              ? "Vite + React PWA। AI Gemini द्वारा संचालित। सब कुछ आपके डिवाइस पर। कोई डेटाबेस नहीं, कोई लॉगिन नहीं, कोई विज्ञापन नहीं।"
              : "Built on Vite + React as a PWA. AI reflections powered by Gemini. Everything stored on your device. No database, no login, no ads."}
          </p>
        </Card>

        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:11, color:T.muted, letterSpacing:1, marginBottom:6 }}>Made with 🌿 for those who need quiet</p>
          <p style={{ fontSize:12, color:T.muted, opacity:.6 }}>© 2026 JSukoon · India</p>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── PRIVACY ─────────────────────────────────────────────────────────
function Privacy({ setTab, goBack, T, lang }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("settings"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      <div style={{ padding:"0 18px 20px" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, marginBottom:4, marginTop:16 }}>{lang==="Hindi"?"गोपनीयता नीति":"Privacy Policy"}</h1>
        <p style={{ fontSize:12, color:T.muted, marginBottom:28 }}>{lang==="Hindi"?"अंतिम अपडेट: मार्च 2026":"Last updated: March 2026"}</p>
        {[
          { icon:"📱", title:lang==="Hindi"?"आपका डेटा स्थानीय है":"Your Data is Local", body:lang==="Hindi"?"आपकी जर्नल प्रविष्टियाँ सीधे आपके डिवाइस पर संग्रहीत होती हैं। हमारे पास कोई डेटाबेस नहीं है।":"Your journal entries are stored directly on your device using LocalStorage. We do not have a database that stores your personal entries on our servers." },
          { icon:"🤖", title:lang==="Hindi"?"AI प्रोसेसिंग":"AI Processing", body:lang==="Hindi"?"जब आप 'विचार माँगें' करते हैं, तो आपका टेक्स्ट Google Gemini API को भेजा जाता है। यह डेटा केवल प्रतिबिंब के लिए उपयोग किया जाता है।":"When you Seek a Reflection, your text is sent to the Google Gemini API. This data is used only to generate the reflection and is not stored." },
          { icon:"🚫", title:lang==="Hindi"?"कोई ट्रैकिंग नहीं":"No Tracking", body:lang==="Hindi"?"JSukoon तृतीय-पक्ष ट्रैकिंग कुकीज़ का उपयोग नहीं करता और न ही आपका डेटा बेचता है।":"JSukoon does not use third-party tracking cookies or sell your data to advertisers." },
          { icon:"🔒", title:lang==="Hindi"?"सुरक्षा":"Security", body:lang==="Hindi"?"इंटरनेट पर प्रसारण की कोई भी विधि 100% सुरक्षित नहीं है, लेकिन हम हर सावधानी बरतते हैं।":"While we take every precaution to protect your data, no method of transmission over the internet is 100% secure." },
        ].map((s,i) => (
          <Card T={T} key={i} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:24, flexShrink:0 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:T.accent, margin:"0 0 8px" }}>{s.title}</p>
                <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.9, margin:0 }}>{s.body}</p>
              </div>
            </div>
          </Card>
        ))}
        <div style={{ marginTop:24, padding:16, background:`${T.accent}08`, border:`1px solid ${T.accent}20`, borderRadius:16, textAlign:"center" }}>
          <p style={{ fontSize:13, color:T.muted, lineHeight:1.8, fontStyle:"italic" }}>{lang==="Hindi"?"JSukoon में, गोपनीयता एक सुविधा नहीं है — यह एक मूल्य है।":"At JSukoon, privacy is not a feature — it is a value."}</p>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── LEGAL DISCLAIMER ────────────────────────────────────────────────
function LegalDisclaimer({ setTab, goBack, T, lang }) {
  const Section = ({ num, title, color, children }) => (
    <div style={{ marginBottom:28 }}>
      <h3 style={{ color: color||T.text, fontSize:13, fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>{num}. {title}</h3>
      {children}
    </div>
  );
  const P = ({ children, style }) => (
    <p style={{ fontSize:13, lineHeight:1.95, color:T.textSoft, marginBottom:8, ...style }}>{children}</p>
  );
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={lang==="Hindi"?"वापस":"Back"} T={T} lang={lang} />
      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"0 0 60px" }}>
      <div style={{ padding:"0 18px 100px" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:T.text, marginBottom:4, marginTop:16 }}>Legal Disclaimer</h1>
        <p style={{ fontSize:11, color:T.muted, marginBottom:6, letterSpacing:.5 }}>Last updated: March 2026 · Effective immediately upon use</p>
        <p style={{ fontSize:11, color:T.muted, marginBottom:28, letterSpacing:.5 }}>By using JSukoon you agree to all terms on this page.</p>

        {/* ── Highlighted box — most critical clause first ── */}
        <div style={{ background:"rgba(224,102,102,0.07)", border:"2px solid rgba(224,102,102,0.35)", borderRadius:18, padding:"18px 20px", marginBottom:32 }}>
          <p style={{ fontSize:11, color:"#e06666", letterSpacing:2, textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>⚠ IMPORTANT — READ FIRST</p>
          <p style={{ fontSize:13, lineHeight:1.9, color:"rgba(255,180,180,0.85)", marginBottom:10 }}>
            JSukoon is <strong style={{ color:"#ff8080" }}>not a crisis intervention service, not a mental health treatment platform, and not a substitute for professional care of any kind.</strong> It does not provide therapy, counselling, diagnosis, or emergency support.
          </p>
          <p style={{ fontSize:13, lineHeight:1.9, color:"rgba(255,180,180,0.85)", marginBottom:10 }}>
            If you are experiencing thoughts of self-harm, suicide, or harm toward others — <strong style={{ color:"#ff8080" }}>stop using this app immediately</strong> and contact one of the following:
          </p>
          {CRISIS_RESOURCES.map(r => (
            <a key={r.name} href={`tel:${r.number}`} style={{ textDecoration:"none", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(224,102,102,0.15)" }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#ff8080", margin:0 }}>{r.name}</p>
                <p style={{ fontSize:13, color:"rgba(255,150,150,0.75)", margin:0 }}>{r.desc}</p>
              </div>
              <p style={{ fontSize:15, fontWeight:700, color:"#ff6b6b", margin:0 }}>{r.number}</p>
            </a>
          ))}
        </div>

        <div style={{ fontSize:13, lineHeight:1.9, color:T.textSoft }}>
          <p style={{ color:T.accent, fontWeight:600, fontSize:13, marginBottom:24, letterSpacing:1, textTransform:"uppercase" }}>JSukoon — Full Terms of Use & Disclaimer</p>

          <Section num="1" title="Nature of the App" color={T.text}>
            <P>JSukoon is a general-purpose digital wellbeing application offering guided breathing exercises, journaling prompts, ambient sound, and reflective content for the purpose of relaxation and self-reflection only.</P>
            <P>It is not — under any circumstances — a medical device, a mental health service, a therapy platform, a crisis helpline, or a substitute for any form of licensed professional care.</P>
          </Section>

          <Section num="2" title="No Medical or Professional Advice" color={T.text}>
            <P>Nothing within JSukoon — including its content, AI-generated reflections, prompts, sessions, or any automated output — constitutes medical advice, psychiatric guidance, psychological counselling, diagnosis, prognosis, or treatment of any kind.</P>
            <P>Users must not rely on JSukoon as a source of professional guidance and must always consult a qualified medical or mental health professional for any personal health concern.</P>
          </Section>

          <Section num="3" title="No Professional Relationship" color={T.text}>
            <P>Use of JSukoon does not create, and shall not be construed as creating, any doctor-patient, therapist-client, counsellor-client, fiduciary, or other professional relationship between the user and JSukoon, its developers, operators, or contributors.</P>
          </Section>

          <Section num="4" title="Crisis Detection — Automated Feature Disclaimer" color="#e06666">
            <P>JSukoon contains an automated keyword-detection feature in its Journal section. This feature is designed solely to <strong style={{ color:T.text }}>redirect users toward external helplines</strong> when certain words or phrases are detected in typed or spoken journal entries.</P>
            <P style={{ color:"rgba(255,170,170,0.8)" }}><strong style={{ color:"#ff8080" }}>This feature does not monitor, assess, evaluate, or respond to a user's mental state.</strong> It is a passive text-matching function and does not constitute crisis intervention, risk assessment, clinical triage, or any form of mental health support.</P>
            <P>JSukoon makes no representation that this feature will detect all instances of crisis language, function correctly in all circumstances, or that any action taken in response to its activation will result in any particular outcome. The feature's sole purpose is to display publicly available helpline numbers.</P>
            <P style={{ color:"rgba(255,170,170,0.8)" }}><strong style={{ color:"#ff8080" }}>JSukoon accepts no liability whatsoever</strong> arising from the activation, non-activation, accuracy, inaccuracy, timeliness, or any consequence of this automated detection feature.</P>
          </Section>

          <Section num="5" title="Not Equipped for Emergencies" color="#e06666">
            <P>JSukoon is explicitly <strong style={{ color:"#ff8080" }}>not designed, built, staffed, or equipped</strong> to handle emergencies of any kind — including but not limited to mental health crises, suicidal ideation, self-harm, medical emergencies, or threats of harm to others.</P>
            <P>In any emergency, users must contact emergency services (112 in India) or go to the nearest hospital or crisis centre immediately. JSukoon cannot and does not provide emergency assistance.</P>
          </Section>

          <Section num="6" title="AI-Generated Content" color={T.text}>
            <P>JSukoon may use third-party artificial intelligence to generate reflections and responses within the Journal section. Such AI-generated content is entirely non-authoritative, non-professional, and purely generative in nature.</P>
            <P>It must not be interpreted as advice, diagnosis, or assessment of any kind. JSukoon does not verify, endorse, or take responsibility for the accuracy, appropriateness, or safety of AI-generated content.</P>
          </Section>

          <Section num="7" title="User Responsibility" color={T.text}>
            <P>Use of JSukoon is entirely voluntary. The user assumes full and sole responsibility for how they interpret and act upon any content within the app. JSukoon shall bear no responsibility for any decision, action, or inaction taken by a user in connection with their use of the app.</P>
          </Section>

          <Section num="8" title="No Guarantees or Warranties" color={T.text}>
            <P>JSukoon makes no warranty, express or implied, regarding any outcome — including emotional improvement, stress reduction, mental clarity, wellbeing, or fitness for any particular purpose. The app is provided "as is" and "as available" without warranty of any kind.</P>
          </Section>

          <Section num="9" title="Limitation of Liability" color={T.text}>
            <P>To the fullest extent permitted by applicable law, JSukoon, its founders, developers, operators, contributors, and affiliates shall not be liable for any loss, harm, injury, damage — direct, indirect, incidental, special, consequential, or punitive — arising from:</P>
            <P style={{ paddingLeft:14, borderLeft:`2px solid ${T.border}` }}>
              (a) use of or inability to use the app;<br/>
              (b) reliance on any content, reflection, or output within the app;<br/>
              (c) the activation or non-activation of any automated feature;<br/>
              (d) any user decision, action, or omission made in connection with the app;<br/>
              (e) any failure to seek professional help.
            </P>
          </Section>

          <Section num="10" title="Indemnification" color={T.text}>
            <P>By using JSukoon, you agree to indemnify and hold harmless JSukoon and its operators from any claims, damages, losses, or expenses — including legal fees — arising from your use of the app or violation of these terms.</P>
          </Section>

          <Section num="11" title="Governing Law" color={T.text}>
            <P>These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.</P>
          </Section>

          <div style={{ height:1, background:T.border, margin:"28px 0" }} />

          {/* Plain language summary */}
          <p style={{ color:T.accent, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:1.5, marginBottom:16 }}>Plain Language Summary</p>
          <div style={{ textAlign:"center", fontStyle:"italic", fontSize:14, lineHeight:2.4, color:T.muted, fontFamily:"'Cormorant Garamond',serif" }}>
            <p>JSukoon listens, but does not diagnose.</p>
            <p>It reflects, but does not advise.</p>
            <p>It offers space, not treatment.</p>
            <p>It supports calm, not emergency care.</p>
            <p>For real help, please call a real person.</p>
          </div>

          <div style={{ marginTop:32, padding:"16px 20px", background:`${T.surface}`, borderRadius:14, border:`1px solid ${T.border}` }}>
            <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.8, textAlign:"center" }}>
              If you have concerns about these terms, please do not use this app.<br/>
              JSukoon · India · jsukoon.vercel.app
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


// ─── MARKET ───────────────────────────────────────────────────────────
const PRODUCTS = [
  { id:"rudraksha",  emoji:"📿", name:"Rudraksha Mala",        nameH:"रुद्राक्ष माला",       price:"₹349",  desc:"108-bead mala, hand-strung. Wear it, hold it, count your breath with it.",       descH:"108 मनके, हाथ से पिरोई गई। पहनें, थामें, सांस के साथ गिनें।" },
  { id:"pendant",    emoji:"🪨", name:"Stone Pendant",          nameH:"पत्थर का लॉकेट",       price:"₹199",  desc:"Smooth river stone on a waxed cord. Cool to the touch. Grounding.",              descH:"मोम की डोरी पर मुलायम नदी का पत्थर। ठंडा स्पर्श। स्थिर करने वाला।" },
  { id:"bracelet",   emoji:"🧿", name:"Peace Bracelet",         nameH:"शांति ब्रेसलेट",       price:"₹249",  desc:"Sandalwood beads with a single lapis bead. Worn close, calms the wrist.",        descH:"एक नीले मनके के साथ चंदन के मनके। कलाई पर शांति।" },
  { id:"candle",     emoji:"🕯️", name:"Wish Candle",            nameH:"इच्छा मोमबत्ती",        price:"₹149",  desc:"Unscented beeswax. Light it when you write in your journal or make a wish.",     descH:"बिना खुशबू वाली मोम। जर्नल लिखते या इच्छा करते समय जलाएं।" },
  { id:"thumbstone", emoji:"🪬", name:"Peace Thumb Stone",      nameH:"शांति अंगूठा पत्थर",   price:"₹129",  desc:"Oval rose quartz with a thumb groove. Rub it slowly when the mind races.",       descH:"अंगूठे की नाली वाला गुलाबी क्वार्ट्ज़। मन दौड़े तो धीरे रगड़ें।" },
  { id:"buddha_s",   emoji:"🧘", name:"Small Peace Buddha",     nameH:"छोटा शांति बुद्ध",     price:"₹299",  desc:"Palm-sized resin statue, matte finish. Sits quietly on any surface.",            descH:"हथेली के आकार की प्रतिमा। किसी भी जगह शांति से बैठती है।" },
  { id:"buddha_l",   emoji:"😊", name:"Laughing Buddha",        nameH:"हंसते बुद्ध",           price:"₹449",  desc:"A reminder that joy is also a spiritual practice. Handpainted.",                 descH:"याद दिलाता है कि आनंद भी एक साधना है। हाथ से रंगा हुआ।" },
];

const BUNDLES = [
  {
    id:"bundle_small",
    emoji:"🎁",
    name:"Small Peace Bundle",
    nameH:"छोटा शांति बंडल",
    price:"₹349",
    originalPrice:"₹477",
    tag:"Save ₹128",
    tagH:"₹128 बचाएं",
    items:["Wish Candle", "Peace Thumb Stone", "Small Peace Buddha"],
    itemsH:["इच्छा मोमबत्ती", "शांति अंगूठा पत्थर", "छोटा शांति बुद्ध"],
    desc:"Everything you need for a quiet corner at home.",
    descH:"घर में एक शांत कोना बनाने के लिए सब कुछ।",
  },
  {
    id:"bundle_large",
    emoji:"🎀",
    name:"Large Peace Bundle",
    nameH:"बड़ा शांति बंडल",
    price:"₹899",
    originalPrice:"₹1246",
    tag:"Save ₹347",
    tagH:"₹347 बचाएं",
    items:["Small Peace Buddha", "Laughing Buddha", "Stone Pendant", "Wish Candle"],
    itemsH:["छोटा शांति बुद्ध", "हंसते बुद्ध", "पत्थर का लॉकेट", "इच्छा मोमबत्ती"],
    desc:"A complete gift — for someone you love, or for yourself.",
    descH:"एक पूरा उपहार — किसी प्रिय के लिए, या खुद के लिए।",
  },
];

function Market({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [notifyProduct, setNotifyProduct] = useState(null);
  const [contact, setContact] = useState("");
  const [notified, setNotified] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (productId) => {
    if (!contact.trim()) return;
    // Save locally
    const existing = JSON.parse(localStorage.getItem("jsukoon_market_notify") || "{}");
    existing[productId] = { contact: contact.trim(), date: new Date().toISOString() };
    localStorage.setItem("jsukoon_market_notify", JSON.stringify(existing));
    setNotified(prev => ({ ...prev, [productId]: true }));
    setSubmitted(true);
    // Find product name
    const prod = [...PRODUCTS, ...BUNDLES].find(p => p.id === productId);
    const prodName = prod ? prod.name : productId;
    // Open WhatsApp
    const msg = encodeURIComponent(`Hi! I'm interested in the JSukoon Market.\nProduct: ${prodName}\nContact: ${contact.trim()}`);
    setTimeout(() => {
      window.open(`https://wa.me/918882850790?text=${msg}`, "_blank");
      setNotifyProduct(null); setSubmitted(false); setContact("");
    }, 1200);
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"52px 22px 0", flexShrink:0 }}>
        <button onClick={() => setTab("home")} style={{ background:"none", border:"none", color:T.muted, fontSize:13, padding:"0 0 16px", display:"flex", alignItems:"center", gap:4 }}>← {hi?"होम":"Home"}</button>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:300, margin:"0 0 4px" }}>{hi?"बाज़ार":"The Market"}</h1>
        <p style={{ fontSize:13, color:T.muted, lineHeight:1.6, margin:"0 0 6px" }}>
          {hi?"शांति के लिए चुने गए वस्तुएं — जल्द आ रही हैं।":"Objects chosen for peace — coming soon."}
        </p>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${T.accent}15`, border:`1px solid ${T.accent}30`, borderRadius:99, padding:"4px 12px", marginBottom:4 }}>
          <span style={{ fontSize:10, color:T.accent, letterSpacing:1.5, fontWeight:600 }}>✦ {hi?"जल्द आ रहा है":"COMING SOON"}</span>
        </div>
      </div>

      <div className="scroll-area" style={{ flex:1, padding:"20px 22px 120px" }}>

        {/* Bundles first */}
        <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12, fontWeight:600 }}>{hi?"बंडल":"BUNDLES"}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:32 }}>
          {BUNDLES.map(b => (
            <div key={b.id} style={{ background:T.surface, border:`1px solid ${T.accent}30`, borderRadius:22, padding:"20px 18px", backdropFilter:"blur(12px)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, right:0, background:T.accent, borderRadius:"0 22px 0 16px", padding:"5px 14px" }}>
                <span style={{ fontSize:10, color:"#fff", fontWeight:700, letterSpacing:1 }}>{hi?b.tagH:b.tag}</span>
              </div>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <span style={{ fontSize:36 }}>{b.emoji}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:T.text, fontWeight:500, margin:"0 0 4px" }}>{hi?b.nameH:b.name}</p>
                  <p style={{ fontSize:12, color:T.muted, lineHeight:1.5, margin:"0 0 10px" }}>{hi?b.descH:b.desc}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                    {(hi?b.itemsH:b.items).map((item,i) => (
                      <span key={i} style={{ fontSize:10, color:T.textSoft, background:`${T.accent}10`, border:`1px solid ${T.accent}20`, borderRadius:99, padding:"3px 10px" }}>{item}</span>
                    ))}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.accent, fontWeight:600 }}>{b.price}</span>
                      <span style={{ fontSize:12, color:T.muted, textDecoration:"line-through", marginLeft:8 }}>{b.originalPrice}</span>
                    </div>
                    {notified[b.id]
                      ? <span style={{ fontSize:12, color:"#5a9", fontWeight:600 }}>✓ {hi?"सूचित किया जाएगा":"Noted"}</span>
                      : <button onClick={() => setNotifyProduct(b.id)} style={{ background:`${T.accent}20`, border:`1px solid ${T.accent}40`, borderRadius:99, padding:"8px 18px", color:T.accent, fontSize:12, fontWeight:600 }}>{hi?"सूचित करें":"Notify Me"}</button>
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Individual products */}
        <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12, fontWeight:600 }}>{hi?"वस्तुएं":"OBJECTS"}</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {PRODUCTS.map(p => (
            <div key={p.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"16px 14px", backdropFilter:"blur(12px)", display:"flex", flexDirection:"column", gap:8 }}>
              <span style={{ fontSize:32 }}>{p.emoji}</span>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:T.text, fontWeight:500, margin:0, lineHeight:1.3 }}>{hi?p.nameH:p.name}</p>
              <p style={{ fontSize:11, color:T.muted, lineHeight:1.5, margin:0, flex:1 }}>{hi?p.descH:p.desc}</p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:T.accent, fontWeight:600 }}>{p.price}</span>
                {notified[p.id]
                  ? <span style={{ fontSize:11, color:"#5a9", fontWeight:600 }}>✓</span>
                  : <button onClick={() => setNotifyProduct(p.id)} style={{ background:`${T.accent}18`, border:`1px solid ${T.accent}35`, borderRadius:99, padding:"5px 12px", color:T.accent, fontSize:11, fontWeight:600 }}>{hi?"सूचित करें":"Notify"}</button>
                }
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Notify Me overlay */}
      {notifyProduct && (
        <div onClick={() => setNotifyProduct(null)} style={{ position:"absolute", inset:0, zIndex:400, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", background:T.surface, borderRadius:"22px 22px 0 0", padding:"28px 24px 48px", backdropFilter:"blur(20px)" }}>
            {submitted
              ? <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <p style={{ fontSize:36, marginBottom:12 }}>🌿</p>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.text, marginBottom:6 }}>{hi?"हो गया।":"Noted."}</p>
                  <p style={{ fontSize:13, color:T.muted }}>{hi?"जब यह उपलब्ध होगा, हम आपको बताएंगे।":"We'll reach out when this is available."}</p>
                </div>
              : <>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.text, marginBottom:6 }}>{hi?"सूचित करें":"Notify Me"}</p>
                  <p style={{ fontSize:13, color:T.muted, marginBottom:20, lineHeight:1.6 }}>{hi?"अपना WhatsApp नंबर या ईमेल दें। जब यह उपलब्ध हो, हम आपको बताएंगे।":"Leave your WhatsApp number or email. We'll reach out when it's ready."}</p>
                  <input
                    value={contact} onChange={e => setContact(e.target.value)}
                    placeholder={hi?"WhatsApp नंबर या ईमेल":"WhatsApp number or email"}
                    style={{ width:"100%", background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 16px", color:T.text, fontSize:14, outline:"none", marginBottom:14, boxSizing:"border-box" }}
                  />
                  <button onClick={() => handleNotify(notifyProduct)} disabled={!contact.trim()}
                    style={{ width:"100%", background:contact.trim()?`${T.accent}22`:`${T.muted}11`, border:`1px solid ${contact.trim()?T.accent+"44":T.border}`, borderRadius:14, padding:"14px", color:contact.trim()?T.accent:T.muted, fontSize:14, fontWeight:600, opacity:contact.trim()?1:0.5 }}>
                    {hi?"सूचित करें":"Notify Me"}
                  </button>
                </>
            }
          </div>
        </div>
      )}
    </div>
  );
}



// ─── ALL TOOLS ───────────────────────────────────────────────────────
function MorePage({ setTab, goBack, T, lang, setThemeKey }) {
  const hi = lang === "Hindi";
  const [mood, setMood] = useLS("jsukoon_today_mood", null);
  const [prompt, setPrompt] = React.useState(null);

  const CORE_MOODS = [
    { emoji:"😔", label:"Heavy",     labelH:"भारी",     theme:"Void"          },
    { emoji:"😤", label:"Restless",  labelH:"बेचैन",   theme:"TwilightBlue"  },
    { emoji:"😩", label:"Exhausted", labelH:"थका हुआ", theme:"SageSanctuary" },
    { emoji:"🙂", label:"Okay",      labelH:"ठीक",     theme:"FirstLight"    },
    { emoji:"😊", label:"Warm",      labelH:"गर्म",    theme:"PinkChampagne" },
    { emoji:"😢", label:"Sad",       labelH:"उदास",    theme:"SeaGlass"      },
  ];

  const MAIN_TOOLS = [
    { id:"focus",      emoji:"🎯", label:hi?"केंद्रित":"Focus",       desc:hi?"शांत खेल":"Calm games"    },
    { id:"practice",   emoji:"🧘", label:hi?"अभ्यास":"Practice",     desc:hi?"सांस":"Breathwork"         },
    { id:"reflection", emoji:"🪞", label:hi?"चिंतन":"Reflection",   desc:hi?"शांत विचार":"Quiet thought" },
    { id:"journal",    emoji:"📖", label:hi?"जर्नल":"Journal",       desc:hi?"लिखें, बोलें":"Write, speak"},
    { id:"audio",      emoji:"🎵", label:hi?"ऑडियो":"Audio",         desc:hi?"ध्वनि":"Sounds"            },
    { id:"wishes",     emoji:"✨", label:hi?"इच्छा":"Wishes",        desc:hi?"गैलरी":"Gallery"            },
    { id:"progress",   emoji:"📈", label:hi?"प्रगति":"Progress",     desc:hi?"आपकी यात्रा":"Your journey" },
    { id:"settings",   emoji:"⚙️", label:hi?"सेटिंग्स":"Settings",   desc:hi?"थीम, भाषा":"Theme, lang"   },
  ];

  const bgM = T.bg.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const isDark = bgM ? (parseInt(bgM[1],16)*0.299+parseInt(bgM[2],16)*0.587+parseInt(bgM[3],16)*0.114)<128 : true;
  const glass = {
    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.60)",
    backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.75)",
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
  };

  const handleMoodClick = (m) => { setMood(m); setPrompt(m); };
  const handleYes = () => {
    if (setThemeKey) setThemeKey(prompt.theme);
    const m = prompt; setPrompt(null); setTab(`moodAction_${m.label}`);
  };
  const handleNo = () => { const m = prompt; setPrompt(null); setTab(`moodAction_${m.label}`); };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden", position:"relative" }}>
      <PageNav onBack={goBack||(()=>setTab("home"))} onHome={()=>setTab("home")} backLabel={hi?"वापस":"Back"} T={T} lang={lang} />

      <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 40px" }}>

        {/* MOODS */}
        <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>
          {hi?"आप कैसा महसूस कर रहे हैं?":"How are you feeling?"}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:32 }}>
          {CORE_MOODS.map(m => {
            const isSel = mood?.label === m.label;
            return (
              <button key={m.label} onClick={() => handleMoodClick(m)} style={{
                ...glass, borderRadius:20, padding:"16px 8px",
                display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer",
                border: isSel ? `1.5px solid ${T.accent}` : glass.border,
                transition:"all 0.3s ease",
              }}>
                <span style={{ fontSize:28 }}>{m.emoji}</span>
                <span style={{ fontSize:11, color:isSel?T.accent:T.text, fontWeight:isSel?600:400 }}>
                  {hi ? m.labelH : m.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* TOOLS */}
        <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>
          {hi?"सभी उपकरण":"All Tools"}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:10, marginBottom:14 }}>
          {MAIN_TOOLS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              ...glass, borderRadius:18, padding:"14px 4px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer",
            }}>
              <span style={{ fontSize:26 }}>{item.emoji}</span>
              <span style={{ fontSize:11, color:T.text, fontWeight:600, textAlign:"center", lineHeight:1.2 }}>{item.label}</span>
              <span style={{ fontSize:9, color:T.muted, textAlign:"center", lineHeight:1.2, opacity:.7 }}>{item.desc}</span>
            </button>
          ))}
        </div>

        {/* CRISIS */}
        <button onClick={() => setTab("crisis")} style={{
          ...glass, width:"100%", borderRadius:18, padding:"16px",
          display:"flex", alignItems:"center", justifyContent:"center", gap:12, cursor:"pointer",
          border:"1px solid rgba(255,60,60,0.3)",
          background: isDark ? "rgba(255,60,60,0.05)" : "rgba(255,60,60,0.1)",
        }}>
          <span style={{ fontSize:24 }}>🆘</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:14, color:T.text, fontWeight:600, lineHeight:1.2 }}>{hi?"संकट सहायता":"Crisis Support"}</div>
            <div style={{ fontSize:11, color:T.muted, lineHeight:1.2, opacity:.8 }}>{hi?"तत्काल सहायता और हेल्पलाइन":"Immediate help & helplines"}</div>
          </div>
        </button>

        {/* Vault entry — almost invisible, only for the curious */}
        <button onClick={() => setTab("vault")} style={{
          background:"none", border:"none", width:"100%", padding:"24px 0 8px",
          cursor:"pointer",
          color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          fontFamily:"'Cormorant Garamond', serif",
          fontStyle:"italic", fontSize:13, letterSpacing:"0.3px", textAlign:"center",
        }}>
          {hi?"एक और गहरी जगह है, अगर आप तैयार हैं।":"There is a quieter place, if you are ready."}
        </button>

      </div>

      {/* THEME PROMPT OVERLAY */}
      {prompt && (
        <div onClick={handleNo} style={{
          position:"absolute", inset:0, zIndex:100,
          background:"rgba(0,0,0,0.55)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          backdropFilter:"blur(4px)",
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            width:"100%", maxWidth:480,
            background: isDark ? "#1a1a22" : "#fafaf8",
            borderRadius:"24px 24px 0 0",
            padding:"28px 28px 40px", boxSizing:"border-box",
          }}>
            <div style={{ width:36, height:4, borderRadius:99, background:isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.12)", margin:"0 auto 24px" }} />
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <span style={{ fontSize:36 }}>{prompt.emoji}</span>
            </div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:isDark?"#e8e8e8":"#1a1a1a", textAlign:"center", lineHeight:1.4, margin:"0 0 8px" }}>
              {hi?`क्या आप थीम "${prompt.labelH}" मूड से बदलना चाहते हैं?`:"Change theme to match your mood?"}
            </p>
            <p style={{ fontSize:13, textAlign:"center", color:isDark?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)", margin:"0 0 28px", lineHeight:1.5 }}>
              {hi?"आप इसे बाद में सेटिंग्स से बदल सकते हैं।":"You can always change it later in Settings."}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <button onClick={handleYes} style={{ width:"100%", padding:"15px", borderRadius:14, background:isDark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.08)", border:isDark?"1px solid rgba(255,255,255,0.18)":"1px solid rgba(0,0,0,0.12)", color:isDark?"#e8e8e8":"#1a1a1a", fontSize:15, fontFamily:"'Cormorant Garamond',serif", cursor:"pointer" }}>
                {hi?"हाँ, थीम बदलें":"Yes, change theme"}
              </button>
              <button onClick={handleNo} style={{ width:"100%", padding:"13px", borderRadius:14, background:"transparent", border:"none", color:isDark?"rgba(255,255,255,0.45)":"rgba(0,0,0,0.4)", fontSize:14, fontFamily:"'Cormorant Garamond',serif", cursor:"pointer", textDecoration:"underline" }}>
                {hi?"नहीं, वर्तमान थीम रखें":"No, keep current theme"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── AUDIO PAGE ───────────────────────────────────────────────────────
function AudioPage({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [showClips, setShowClips] = useState(false);
  const [clipsLang, setClipsLang] = useState("English");
  const [playing, setPlaying] = useState(null);
  const [medProgress, setMedProgress] = useState(0);   // 0–1
  const [medDuration, setMedDuration] = useState(0);
  const [medElapsed, setMedElapsed]   = useState(0);
  const audioRef = useRef(null);
  const ttsRef = useRef(null);
  const progressRef = useRef(null);

  const AMBIENT = [
    { key:"birds.mp3",  emoji:"🐦", label:hi?"पक्षी":"Birds"  },
    { key:"wind.mp3",   emoji:"💨", label:hi?"हवा":"Wind"     },
    { key:"forest.mp3", emoji:"🌲", label:hi?"जंगल":"Forest"  },
    { key:"flute.mp3",  emoji:"🪈", label:hi?"बांसुरी":"Flute" },
    { key:"waves.mp3",  emoji:"🌊", label:hi?"लहरें":"Waves"  },
  ];

  const hindiScriptsFirst = {
    1:"आँखें धीरे से बंद करें। एक धीमी सांस लें।",
    2:"आप सुरक्षित हैं। आप यहाँ हैं। अभी कुछ भी ज़रूरी नहीं।",
    3:"अपने सिर के ऊपर से शुरू करें। वहाँ की त्वचा को ढीला छोड़ें।",
    4:"खुद से शुरू करें। आप भी दयालुता के हकदार हैं।",
    5:"आज आपने काफी किया। अब करना बंद करें।",
    6:"आप यहाँ हैं। आपके पाँव ज़मीन पर हैं।",
    7:"एक शांत, गहरी झील की कल्पना करें — बिल्कुल स्थिर।",
    8:"आप धीरे-धीरे एक जंगल में चल रहे हैं। कोई मंज़िल नहीं।",
    9:"दोनों हाथ अपने दिल पर रखें।",
    10:"आज रात, नींद में कुछ भी साथ ले जाने की ज़रूरत नहीं।",
    11:"तीन मिनट — बस आपकी सांस। और कुछ ज़रूरी नहीं।",
    12:"कल्पना करें कि करुणा आप पर धीमी बारिश की तरह बरस रही है।",
  };

  const stopAll = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setPlaying(null);
    setMedProgress(0); setMedElapsed(0); setMedDuration(0);
  };

  const ambientStartRef = useRef(null);
  const playAmbient = (key) => {
    // Credit time for previous ambient session
    if (ambientStartRef.current && playing) {
      const mins = (Date.now() - ambientStartRef.current) / 60000;
      if (mins >= 0.5) creditActivity("ambient_audio", mins);
    }
    // kill any bench audio playing
    if (window.__benchAudio) { window.__benchAudio.pause(); window.__benchAudio.src=""; window.__benchAudio=null; }
    stopAll();
    if (playing === key) { ambientStartRef.current = null; return; }
    const a = new Audio(AUDIO_URLS[key]);
    a.loop = true;
    a.play().catch(err => console.warn("AudioPage ambient:", key, err));
    audioRef.current = a;
    window.__pageAudio = a;
    ambientStartRef.current = Date.now();
    setPlaying(key);
  };

  const playMeditation = (id) => {
    stopAll();
    if (playing === `med_${id}`) return;
    const a = new Audio(MEDITATION_AUDIO[id]);
    a.play().catch(() => {});
    a.onloadedmetadata = () => setMedDuration(a.duration||0);
    a.ontimeupdate = () => {
      const el = a.currentTime;
      const dur = a.duration||1;
      setMedElapsed(el);
      setMedProgress(el/dur);
    };
    a.onended = () => {
      const dur = a.duration ? a.duration/60 : (MEDITATIONS.find(m=>m.id===id)?.dur||5);
      creditActivity("meditation_audio", dur);
      setPlaying(null); setMedProgress(0); setMedElapsed(0);
    };
    audioRef.current = a;
    setPlaying(`med_${id}`);
  };

  const playHindiTTS = (id) => {
    stopAll();
    if (playing === `hindi_${id}`) return;
    const text = hindiScriptsFirst[id];
    if (!window.speechSynthesis || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN"; u.rate = 0.82;
    const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("hi"));
    if (v) u.voice = v;
    u.onend = () => setPlaying(null);
    window.speechSynthesis.speak(u);
    setPlaying(`hindi_${id}`);
  };

  const bgM2 = T.bg.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const isDark2 = bgM2 ? (parseInt(bgM2[1],16)*0.299+parseInt(bgM2[2],16)*0.587+parseInt(bgM2[3],16)*0.114)<128 : true;
  const glass = {
    background: isDark2 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.60)",
    backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
    border: isDark2 ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.75)",
    boxShadow: isDark2 ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
  };

  if (showClips) {
    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
        <PageNav onBack={()=>{stopAll();setShowClips(false);}} onHome={()=>{stopAll();setTab("home");}} backLabel={hi?"ऑडियो":"Audio"} T={T} lang={lang} />
      <div style={{ padding:"16px 24px 0", flexShrink:0 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:T.text, fontWeight:400, marginBottom:4 }}>
            {hi?"ध्यान क्लिप्स":"Meditation Clips"}
          </h1>
          <p style={{ fontSize:12, color:T.muted, marginBottom:16 }}>
            {hi?"टैप करें — क्लिप चलेगी":"Tap any session to play"}
          </p>
          {/* Language toggle */}
          <div style={{ display:"flex", gap:8, marginBottom:20 }}>
            {["English","Hindi"].map(l => (
              <button key={l} onClick={() => { stopAll(); setClipsLang(l); }}
                style={{ flex:1, padding:"9px", borderRadius:12, background:clipsLang===l?`${T.accent}25`:"transparent", border:`1px solid ${clipsLang===l?T.accent:T.border}`, color:clipsLang===l?T.accent:T.muted, fontSize:13, fontWeight:clipsLang===l?600:400 }}>
                {l === "English" ? "🇬🇧 English" : "🇮🇳 हिंदी"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 24px 32px" }}>
          {MEDITATIONS.map(m => {
            const isPlaying = playing === (clipsLang==="English" ? `med_${m.id}` : `hindi_${m.id}`);
            return (
              <button key={m.id}
                onClick={() => clipsLang==="English" ? playMeditation(m.id) : playHindiTTS(m.id)}
                style={{ width:"100%", ...glass, borderRadius:16, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, marginBottom:10, background:isPlaying?`${m.col}18`:"rgba(255,255,255,0.07)", border:isPlaying?`1px solid ${m.col}50`:"1px solid rgba(255,255,255,0.12)", textAlign:"left" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ fontSize:24 }}>{isPlaying ? "⏸" : m.emoji}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, color:isPlaying?m.col:T.text, fontWeight:isPlaying?600:400, margin:"0 0 2px" }}>
                      {clipsLang==="Hindi" ? (m.titleH||m.title) : m.title}
                    </p>
                    <p style={{ fontSize:11, color:T.muted, margin:0 }}>
                      {isPlaying && medDuration>0
                        ? `${Math.floor(medElapsed/60)}:${String(Math.floor(medElapsed%60)).padStart(2,"0")} / ${Math.floor(medDuration/60)}:${String(Math.floor(medDuration%60)).padStart(2,"0")}`
                        : `${m.dur} ${hi?"मिनट":"min"} · ${clipsLang==="Hindi"?(m.catH||m.cat):m.cat}`}
                    </p>
                  </div>
                  <span style={{ color:isPlaying?m.col:T.muted, fontSize:18 }}>{isPlaying?"▐▐":"▶"}</span>
                </div>
                {isPlaying && (
                  <div style={{ width:"100%", height:3, background:`${m.col}25`, borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${medProgress*100}%`, background:m.col, borderRadius:99, transition:"width 0.5s linear" }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
      <PageNav onBack={()=>{stopAll();if(goBack)goBack();else setTab("more");}} onHome={()=>{stopAll();setTab("home");}} backLabel={hi?"वापस":"Back"} T={T} lang={lang} />
      <div style={{ flex:1, overflowY:"auto", padding:"16px 24px 40px" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, color:T.text, fontWeight:400, marginBottom:4 }}>
          {hi?"ऑडियो":"Audio"}
        </h1>
        <p style={{ fontSize:13, color:T.muted, marginBottom:24 }}>
          {hi?"शांति के लिए ध्वनियाँ":"Sounds for stillness"}
        </p>
        <p style={{ fontSize:10, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>
          {hi?"परिवेश ध्वनियाँ":"Ambient Sounds"}
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          {AMBIENT.map(s => {
            const isOn = playing === s.key;
            return (
              <button key={s.key} onClick={() => playAmbient(s.key)}
                style={{ ...glass, borderRadius:18, padding:"18px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:8, background:isOn?`${T.accent}20`:isDark2?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.60)", border:isOn?`1px solid ${T.accent}50`:isDark2?"1px solid rgba(255,255,255,0.12)":"1px solid rgba(255,255,255,0.75)" }}>
                <span style={{ fontSize:28 }}>{isOn ? "🔊" : s.emoji}</span>
                <span style={{ fontSize:12, color:isOn?T.accent:T.text, fontWeight:isOn?600:400 }}>{s.label}</span>
              </button>
            );
          })}
        </div>
        {playing && (
          <button onClick={stopAll} style={{ width:"100%", background:"transparent", border:`1px solid ${T.border}`, borderRadius:12, padding:"10px", color:T.muted, fontSize:12, marginBottom:16 }}>
            {hi?"ध्वनि बंद करें ⏹":"Stop sound ⏹"}
          </button>
        )}
        <button onClick={() => setShowClips(true)}
          style={{ width:"100%", ...glass, borderRadius:18, padding:"18px 20px", display:"flex", alignItems:"center", gap:14, border:`1px solid ${T.accent}30` }}>
          <span style={{ fontSize:28 }}>🧘</span>
          <div style={{ textAlign:"left" }}>
            <span style={{ fontSize:14, color:T.text, fontWeight:600, display:"block" }}>{hi?"ध्यान क्लिप्स":"Meditation Clips"}</span>
            <span style={{ fontSize:11, color:T.muted }}>
              {hi?"12 सत्र · अंग्रेज़ी और हिंदी":"12 sessions · English & Hindi"}
            </span>
          </div>
          <span style={{ marginLeft:"auto", color:T.muted, fontSize:18 }}>→</span>
        </button>
      </div>
    </div>
  );
}


// ─── ROOT ─────────────────────────────────────────────────────────────
// ─── VAULT ────────────────────────────────────────────────────────────
const VAULT_TOOLS = [
  { id:"reflection", en:"Write it. Then release it.",              hi:"लिखें। फिर जाने दें।",                  tab:"reflection" },
  { id:"descent",    en:"Let go of the day completely.",           hi:"दिन को पूरी तरह छोड़ दें।",             tab:"descent"    },
  { id:"bilateral",  en:"For what the mind cannot release alone.", hi:"जो मन अकेले नहीं छोड़ पाता।",           tab:null         },
  { id:"nadi",       en:"Balance what words cannot reach.",        hi:"जहाँ शब्द नहीं पहुँचते, वहाँ जाएं।",  tab:null         },
  { id:"letter",     en:"Say what you never could.",               hi:"वो कहें जो कभी कह न सके।",             tab:null         },
  { id:"stone",      en:"Let it sink. Let it go.",                 hi:"डूब जाने दें। जाने दें।",               tab:null         },
];
const VAULT_RETURNS = [
  null, null,
  { en:"You came back. That means something.",      hi:"आप फिर आए — इसका मतलब है।"              },
  { en:"This is becoming a practice.",              hi:"यह अब एक अभ्यास बन रहा है।"             },
  { en:"The ones who return here are rare.",        hi:"यहाँ लौटने वाले कम होते हैं।"            },
  { en:"You keep showing up. That is everything.", hi:"आप बार-बार आते हैं — यही सब कुछ है।"   },
];
const VAULT_REGULAR = { en:"Welcome back to the quieter place.", hi:"अंतर्मन में फिर से स्वागत है।" };

function Vault({ setTab, T, lang }) {
  const hi = lang === "Hindi";
  const [activeTool, setActiveTool] = React.useState(null);
  const [visits,     setVisits]     = React.useState(0);
  const [revealed,   setRevealed]   = React.useState([]);
  const [showGreet,  setShowGreet]  = React.useState(true);

  React.useEffect(() => {
    const prev = parseInt(localStorage.getItem("jsukoon_vault_visits") || "0", 10);
    const next = prev + 1;
    localStorage.setItem("jsukoon_vault_visits", String(next));
    setVisits(next);
    if (next === 1) {
      VAULT_TOOLS.forEach((_, i) => {
        setTimeout(() => setRevealed(r => [...r, i]), 600 + i * 350);
      });
    } else {
      setRevealed(VAULT_TOOLS.map((_, i) => i));
    }
    const t = setTimeout(() => setShowGreet(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const greeting = visits === 0 || visits === 1
    ? { en:"You found this place. Not everyone does.\nThis is for the ones who look deeper.",
        hi:"आप यहाँ तक आए — यह सब नहीं कर पाते।\nयह जगह उनके लिए है जो और गहरे जाना चाहते हैं।" }
    : visits <= 5 ? (VAULT_RETURNS[visits] || VAULT_REGULAR) : VAULT_REGULAR;

  if (activeTool) {
    return (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
        <div style={{ padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={() => setActiveTool(null)} style={{ background:"none", border:"none", fontSize:20, color:T.text, cursor:"pointer" }}>←</button>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:T.textSoft, fontWeight:300 }}>
            {hi?"अंतर्मन":"The quieter place"}
          </span>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 24px 40px" }}>
          {activeTool==="bilateral" && <BilateralTapping T={T} lang={lang} />}
          {activeTool==="nadi"      && <NadiShodhana     T={T} lang={lang} />}
          {activeTool==="letter"    && <UnsentLetter      T={T} lang={lang} />}
          {activeTool==="stone"     && <StoneDrop         T={T} lang={lang} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
      <div style={{ padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
        <button onClick={() => setTab("more")} style={{ background:"none", border:"none", fontSize:20, color:T.text, cursor:"pointer", opacity:0.6 }}>←</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"0 32px 60px", display:"flex", flexDirection:"column" }}>
        <div style={{ textAlign:"center", marginBottom:8, marginTop:8 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(36px,10vw,52px)", fontWeight:300, color:T.text, margin:"0 0 4px", letterSpacing:2, lineHeight:1 }}>
            The quieter place
          </h1>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(18px,5vw,22px)", color:T.textSoft, margin:0, opacity:0.55, letterSpacing:1 }}>
            अंतर्मन
          </p>
        </div>
        <div style={{ width:28, height:1, background:T.accent, margin:"20px auto 32px", opacity:0.3 }} />
        {greeting && (
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(15px,4vw,18px)", color:T.textSoft, textAlign:"center", lineHeight:1.75, marginBottom:36, whiteSpace:"pre-line", opacity:showGreet?0.85:0, transition:"opacity 1.2s ease", minHeight:60 }}>
            {hi ? greeting.hi : greeting.en}
          </p>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {VAULT_TOOLS.map((tool, i) => {
            const isVis = revealed.includes(i);
            return (
              <div key={tool.id} onClick={() => { if(!isVis) return; tool.tab ? setTab(tool.tab) : setActiveTool(tool.id); }}
                style={{ padding:"22px 0", borderBottom:`1px solid ${T.border || T.borderWarm || "rgba(255,255,255,0.07)"}`, cursor:isVis?"pointer":"default", opacity:isVis?1:0, transform:isVis?"translateY(0)":"translateY(10px)", transition:"opacity 0.6s ease, transform 0.6s ease" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(18px,5vw,22px)", fontWeight:300, color:T.text, margin:0, lineHeight:1.3 }}>
                  {hi ? tool.hi : tool.en}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab,         setTab]         = useState("home");
  const [tabHistory,  setTabHistory]  = useState(["home"]);
  const [themeKey,    setThemeKey]    = useLS("jsukoon_theme", "Void");
  const [lang,        setLang]        = useLS("jsukoon_lang", "English");
  const [ritualDone,  setRitualDone]  = useLS("jsukoon_ritual_done", false);
  const [onboardDone, setOnboardDone] = useLS("jsukoon_onboard_done", false);
  const [onboardVisible, setOnboardVisible] = useState(!onboardDone);
  const styleRef = useRef(null);

  const T = THEMES[themeKey] || THEMES["Void"];

  useEffect(() => {
    const stored = localStorage.getItem("jsukoon_theme");
    if (!stored) { const h=new Date().getHours(); setThemeKey(h>=6&&h<18?"PinkChampagne":"Void"); }
  }, []);

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      document.head.appendChild(el);
      styleRef.current = el;
    }
    styleRef.current.textContent = makeStyles(T);
  }, [T]);

  const handleSessionComplete = (minutes) => { creditSession(minutes); };

  const navigate = (t) => {
    setTab(t);
    setTabHistory(h => h[h.length-1] === t ? h : [...h.slice(-9), t]);
  };
  const goBack = () => {
    setTabHistory(h => {
      if (h.length <= 1) return h;
      const prev = h[h.length-2];
      setTab(prev);
      return h.slice(0,-1);
    });
  };






  return (
    <div style={{ height:"100vh", maxWidth:600, margin:"0 auto", display:"flex", flexDirection:"column", background:T.bg, position:"relative", overflow:"hidden", borderLeft:`1px solid ${T.border}`, borderRight:`1px solid ${T.border}`, boxShadow:"0 0 60px rgba(0,0,0,0.4)", transition:"background 0.8s ease" }}>

      <AmbientAura T={T} />

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${T.accent}10, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, ${T.accentSoft}06, transparent 50%)`, transition:"background 0.8s ease" }} />

      {onboardVisible && (
        <Onboarding
          onComplete={() => { setOnboardDone(true); setTimeout(() => setOnboardVisible(false), 100); }}
          setThemeKey={setThemeKey}
          setLang={setLang}
          T={T}
        />
      )}

      {!ritualDone && !onboardVisible && (
        <RitualCurtain T={T} onDone={() => setRitualDone(true)} />
      )}

      <div style={{ flex:1, overflow:"hidden", position:"relative", zIndex:1 }}>
        {!onboardVisible && <>
          {tab==="home"     && <Home     setTab={navigate} T={T} lang={lang} themeKey={themeKey} setThemeKey={setThemeKey} />}
          {tab==="practice" && <Practice onComplete={handleSessionComplete} setTab={navigate} T={T} lang={lang} />}
          {tab==="reflection"    && <Reflection setTab={navigate} goBack={goBack} T={T} lang={lang} />}
          {tab==="journal"  && <Journal  setTab={navigate} T={T} lang={lang} />}
          {tab==="focus"    && <Focus    setTab={navigate} T={T} lang={lang} />}
          {tab==="warmth"   && <WarmthPage setTab={navigate} T={T} lang={lang} />}
          {tab==="more"     && <MorePage   setTab={navigate} T={T} lang={lang} setThemeKey={setThemeKey} />}
          {tab==="audio"    && <AudioPage  setTab={navigate} T={T} lang={lang} />}
          {tab==="bench"    && <Bench    T={T} lang={lang} setTab={navigate} />}
          {tab==="progress" && <Progress T={T} lang={lang} setTab={navigate} />}
          {tab==="settings" && <Settings setTab={navigate} T={T} lang={lang} setLang={setLang} themeKey={themeKey} setThemeKey={setThemeKey} />}
          {tab==="market"   && <Market   setTab={navigate} T={T} lang={lang} />}
          {tab==="crisis"   && <Crisis   setTab={navigate} T={T} lang={lang} />}
          {tab==="legal"    && <LegalDisclaimer setTab={navigate} T={T} lang={lang} />}
          {tab==="about"    && <About    setTab={navigate} T={T} lang={lang} />}
          {tab==="privacy"  && <Privacy  setTab={navigate} T={T} lang={lang} />}
          {/* Vault — import from src/features/vault/Vault.jsx */}
          {tab==="vault"    && <Vault    setTab={navigate} T={T} lang={lang} />}
        </>}
      </div>

      <Analytics />
    </div>
  );
}

// ─── WRAPPED EXPORT ───────────────────────────────────────────────────
export function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
