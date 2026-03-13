// JSukoon Constants - Extracted for modularity

export const BLOB = "https://ktqkxfj3pddbxgnf.public.blob.vercel-storage.com";

export const AUDIO_URLS = {
  "birds.mp3":  `${BLOB}/audio/birds.mp3`,
  "flute.mp3":  `${BLOB}/audio/flute.mp3`,
  "forest.mp3": `${BLOB}/audio/forest.mp3`,
  "waves.mp3":  `${BLOB}/audio/waves.mp3`,
  "wind.mp3":   `${BLOB}/audio/wind.mp3`,
};

// ─── AUDIO CONSTANTS ──────────────────────────────────────────────────
// Hindi meditation audio is handled by browser TTS — no MP3 files needed.
// Only English meditations require actual audio files on Vercel Blob.

export const MEDITATION_AUDIO = {
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

export const THEMES = {
  "Void":           { bg:"#000000", bgWarm:"#0a0a0a", surface:"#111111", surfaceAlt:"#1a1a1a", border:"#ffffff08", borderWarm:"#88888830", accent:"#888888", accentSoft:"#aaaaaa", text:"#e0e0e0", textSoft:"#b0b0b0", muted:"#666666", name:"The Void",        nameH:"शून्य" },
  "PinkChampagne":  { bg:"#F8DECD", bgWarm:"#f5d4c0", surface:"rgba(255,255,255,0.5)", surfaceAlt:"rgba(255,255,255,0.3)", border:"#00000008", borderWarm:"#c88a8e30", accent:"#C88A8E", accentSoft:"#d4a0a4", text:"#5A3A42", textSoft:"#7a5a62", muted:"#9a7a82", name:"Pink Champagne", nameH:"गुलाबी चाँदनी" },
  "FirstLight":     { bg:"#FDFBF7", bgWarm:"#f9f5ef", surface:"rgba(255,255,255,0.6)", surfaceAlt:"rgba(255,255,255,0.4)", border:"#00000006", borderWarm:"#d4a37330", accent:"#D4A373", accentSoft:"#e0b080", text:"#4A3728", textSoft:"#6a5748", muted:"#9a8778", name:"First Light",    nameH:"भोर" },
  "SageSanctuary":  { bg:"#E8EBE4", bgWarm:"#e0e4da", surface:"rgba(255,255,255,0.6)", surfaceAlt:"rgba(255,255,255,0.4)", border:"#00000006", borderWarm:"#8a9a8630", accent:"#8A9A86", accentSoft:"#a0b09c", text:"#3A4A36", textSoft:"#5a6a56", muted:"#8a9a86", name:"Sage Green",    nameH:"धूसर-हरा" },
  "TwilightBlue":   { bg:"#0F172A", bgWarm:"#162032", surface:"rgba(255,255,255,0.03)", surfaceAlt:"rgba(255,255,255,0.05)", border:"#ffffff08", borderWarm:"#3b82f630", accent:"#3B82F6", accentSoft:"#60a5fa", text:"#F8FAFC", textSoft:"#cbd5e1", muted:"#64748b", name:"Twilight Blue", nameH:"गोधूलि नीला" },
  "SeaGlass":       { bg:"#E0F2FE", bgWarm:"#d8eeea", surface:"rgba(255,255,255,0.5)", surfaceAlt:"rgba(255,255,255,0.7)", border:"#00000005", borderWarm:"#0ea5e930", accent:"#0EA5E9", accentSoft:"#38bdf8", text:"#0C4A6E", textSoft:"#0369a1", muted:"#0284c7", name:"Sea Glass",      nameH:"समुद्री कांच" }
};