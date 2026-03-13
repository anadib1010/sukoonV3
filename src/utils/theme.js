// src/utils/theme.js

export const THEMES = {
  "Void":           { bg:"#000000", bgWarm:"#0a0a0a", surface:"#111111", surfaceAlt:"#1a1a1a", border:"#ffffff08", borderWarm:"#88888830", accent:"#888888", accentSoft:"#aaaaaa", text:"#e0e0e0", textSoft:"#b0b0b0", muted:"#666666", name:"The Void",        nameH:"शून्य" },
  "PinkChampagne":  { bg:"#F8DECD", bgWarm:"#f5d4c0", surface:"rgba(255,255,255,0.5)", surfaceAlt:"rgba(255,255,255,0.3)", border:"#00000008", borderWarm:"#c88a8e30", accent:"#C88A8E", accentSoft:"#d4a0a4", text:"#5A3A42", textSoft:"#7a5a62", muted:"#9a7a82", name:"Pink Champagne",  nameH:"गुलाबी चाँदनी" },
  "FirstLight":     { bg:"#FDFBF7", bgWarm:"#f9f5ef", surface:"rgba(255,255,255,0.6)", surfaceAlt:"rgba(255,255,255,0.4)", border:"#00000006", borderWarm:"#d4a37330", accent:"#D4A373", accentSoft:"#e0b888", text:"#4A4A4A", textSoft:"#6a6a6a", muted:"#8a8a8a", name:"First Light",      nameH:"पहली किरण" },
  "SeaGlass":       { bg:"#E5EDF0", bgWarm:"#dce6ea", surface:"rgba(255,255,255,0.5)", surfaceAlt:"rgba(255,255,255,0.3)", border:"#00000008", borderWarm:"#7a9ea830", accent:"#7A9EA8", accentSoft:"#96b4be", text:"#4A5D66", textSoft:"#6a7d86", muted:"#8a9da6", name:"Sea Glass",        nameH:"समुद्री काँच" },
  "SageSanctuary":  { bg:"#E3E7E0", bgWarm:"#d9ddd6", surface:"rgba(255,255,255,0.45)", surfaceAlt:"rgba(255,255,255,0.25)", border:"#00000008", borderWarm:"#6b765f30", accent:"#6B765F", accentSoft:"#848f78", text:"#3E4735", textSoft:"#5e6755", muted:"#7e8775", name:"Sage Sanctuary",  nameH:"धूसर-हरा अभयारण्य" },
  "Terracotta":     { bg:"#F2ECE7", bgWarm:"#ede5de", surface:"rgba(255,255,255,0.45)", surfaceAlt:"rgba(255,255,255,0.25)", border:"#00000008", borderWarm:"#b07d6230", accent:"#B07D62", accentSoft:"#c69278", text:"#5C4033", textSoft:"#7c6053", muted:"#9c8073", name:"Terracotta",       nameH:"मिट्टी" },
  "DeepSage":       { bg:"#1E2720", bgWarm:"#1a2218", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#7b907530", accent:"#7B9075", accentSoft:"#96ab90", text:"#D3DDD0", textSoft:"#b3bdb0", muted:"#738070", name:"Deep Sage",        nameH:"धूसर-हरा" },
  "OceanBlue":      { bg:"#122840", bgWarm:"#0e2038", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#5d93c430", accent:"#5D93C4", accentSoft:"#78a8d8", text:"#CFE2F3", textSoft:"#afcae0", muted:"#6a8fa8", name:"Ocean Blue",       nameH:"नीला सागर" },
  "TwilightBlue":   { bg:"#181830", bgWarm:"#141428", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#726fba30", accent:"#726FBA", accentSoft:"#8c89cc", text:"#D6D5F2", textSoft:"#b6b5d8", muted:"#6a69a0", name:"Twilight Blue",    nameH:"संध्या नीला" },
  "Maroon":         { bg:"#2A0E13", bgWarm:"#240c10", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.07)", border:"#ffffff08", borderWarm:"#9b3d4f30", accent:"#9B3D4F", accentSoft:"#b45868", text:"#EFD1D6", textSoft:"#cfb1b6", muted:"#7a5560", name:"Maroon",            nameH:"मरून" },
  "ChampagneGold":  { bg:"#FBF5ED", bgWarm:"#f5eee3", surface:"rgba(255,255,255,0.55)", surfaceAlt:"rgba(255,255,255,0.35)", border:"#00000008", borderWarm:"#c5a05930", accent:"#C5A059", accentSoft:"#d4b474", text:"#4A4036", textSoft:"#6a6056", muted:"#8a8070", name:"Champagne Gold",  nameH:"सोने की चाँदनी" },
  "SocialBlue":     { bg:"#0D2137", bgWarm:"#0a1c2e", surface:"rgba(255,255,255,0.05)", surfaceAlt:"rgba(255,255,255,0.09)", border:"#ffffff0a", borderWarm:"#4a9ebb35", accent:"#4A9EBB", accentSoft:"#6ab8d4", text:"#D6EAF2", textSoft:"#a8cede", muted:"#5a8fa8", name:"Deep Sky",         nameH:"गहरा आकाश" },
};

export const MOOD_THEMES = {
  "Racing Thoughts":"DeepSage", "Restless Mind":"OceanBlue", "Overwhelmed":"Void",
  "Heavy Thoughts":"FirstLight", "Tired Mind":"SeaGlass", "Need Quiet":"TwilightBlue",
  "Numb":"Void", "Heavy":"Maroon", "Anxious":"TwilightBlue", "Frustrated":"OceanBlue",
  "Exhausted":"DeepSage", "Unsettled":"Terracotta", "Quiet":"SeaGlass", "Okay":"SageSanctuary",
  "Gentle":"FirstLight", "Warm":"PinkChampagne", "Grateful":"ChampagneGold", "Radiant":"SocialBlue",
};

export const makeStyles = (T) => `
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
  .fade-up{animation:fadeUp 0.45s ease forwards;}
  .fade-in{animation:fadeIn 0.6s ease forwards;}
`;