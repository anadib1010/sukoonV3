import React, { useState, useEffect, useRef } from 'react';
import { PageNav } from '../../components/SharedUI';
import { creditSession } from '../../utils/activity';
import { AUDIO_URLS, MEDITATION_AUDIO } from '../../utils/constants';
import { MEDITATIONS } from '../../utils/content';

// ─── HINDI + ENGLISH MEDITATION SCRIPTS ──────────────────────────────
// Hindi plays via browser TTS (no MP3 needed — works on all devices).
// English plays the MP3 + shows text guide in sync.

const HINDI_SCRIPTS = {
  1:  [[0.0,"आँखें धीरे से बंद करें। एक धीमी सांस लें।"],[0.1,"दिन शुरू होने से पहले इस पल की शांति को महसूस करें।"],[0.25,"हर सांस के साथ, थोड़ी और गर्माहट अपने सीने में भरने दें।"],[0.5,"आप यहाँ हैं। आप पर्याप्त हैं। दिन इंतज़ार कर सकता है।"],[0.75,"एक धीमा इरादा बनाएं — लक्ष्य नहीं, बस एक दिशा।"],[0.9,"इस पल की रोशनी को धीरे-धीरे अपने साथ आगे ले जाने दें।"]],
  2:  [[0.0,"आप सुरक्षित हैं। आप यहाँ हैं। अभी कुछ भी ज़रूरी नहीं।"],[0.15,"देखें कि शरीर में तनाव कहाँ है। बस देखें — लड़ें नहीं।"],[0.3,"एक हाथ अपने सीने पर रखें। उसकी गर्माहट महसूस करें।"],[0.5,"धीरे सांस लें — चार गिनती। हल्के से रोकें — दो। छोड़ें — छह।"],[0.7,"आपने अब तक हर कठिन पल को पार किया है। यह भी गुज़र जाएगा।"],[0.88,"यहाँ थोड़ा और रुकें। आप थामे हुए हैं।"]],
  3:  [[0.0,"अपने सिर के ऊपर से शुरू करें। वहाँ की त्वचा को ढीला छोड़ें।"],[0.12,"ढीलापन नीचे आने दें — माथा, आँखें, जबड़ा।"],[0.25,"आपके कंधे। तनाव महसूस हो तो बस सांस लें उसमें।"],[0.4,"आपके हाथ, पेट — उन्हें भारी और गर्म होने दें।"],[0.6,"कूल्हे, जाँघें, पिंडलियाँ — सब छोड़ रहे हैं।"],[0.78,"ज़मीन पर आपके पैर। आप जड़े हुए हैं। आप यहाँ हैं।"],[0.9,"पूरा शरीर — एक साँस लेती, आराम करती चीज़।"]],
  4:  [[0.0,"खुद से शुरू करें। आप भी दयालुता के हकदार हैं।"],[0.15,"मन में कहें: मैं शांत रहूँ। मैं ठीक रहूँ।"],[0.3,"किसी प्रिय व्यक्ति को याद करें। उन्हें वही गर्माहट भेजें।"],[0.5,"अब कोई अनजान — एक अजनबी जो आज मिला हो।"],[0.65,"अब कोई मुश्किल इंसान। बस एक छोटी-सी दुआ — उन्हें शांति मिले।"],[0.82,"इसे सभी दिशाओं में फैलाएं — सबके लिए, हर जगह।"]],
  5:  [[0.0,"आज आपने काफी किया। अब करना बंद करें।"],[0.1,"शरीर का बोझ नीचे डूबता महसूस करें।"],[0.25,"आपकी सांस धीमी हो रही है। विचार मुलायम हो रहे हैं।"],[0.45,"छवियाँ बादलों की तरह गुज़रने दें — किसी को थामना नहीं।"],[0.65,"और गहरे। कुछ सुलझाना नहीं। कुछ बनना नहीं।"],[0.85,"आप सुरक्षित हैं। अब पूरी तरह छोड़ सकते हैं।"]],
  6:  [[0.0,"आप यहाँ हैं। आपके पाँव ज़मीन पर हैं।"],[0.3,"अभी जो 5 चीज़ें दिख रही हैं उनका नाम लें।"],[0.6,"अपनी सांस महसूस करें — अंदर और बाहर। आप इस पल में सुरक्षित हैं।"],[0.85,"यह पल असली है। आप असली हैं। आप ठीक हैं।"]],
  7:  [[0.0,"एक शांत, गहरी झील की कल्पना करें — बिल्कुल स्थिर।"],[0.2,"आपके विचार पत्थर हैं। उन्हें एक-एक कर डूबते देखें।"],[0.45,"पानी पत्थरों के पीछे नहीं भागता। आप भी नहीं।"],[0.7,"बस सतह — शांत, गहरी, विशाल।"],[0.9,"आप पानी हैं। पत्थर नहीं।"]],
  8:  [[0.0,"आप धीरे-धीरे एक जंगल में चल रहे हैं। कोई मंज़िल नहीं।"],[0.15,"पत्तों के बीच से आती रोशनी देखें। धब्बेदार और मुलायम।"],[0.3,"पाँवों के नीचे मिट्टी नरम है। हर कदम आपको धीमा करता है।"],[0.5,"कहीं पास पानी की आवाज़ आ रही है। कोई जल्दी नहीं।"],[0.68,"एक पेड़ से टिककर बैठें। छाल को अपना बोझ उठाने दें।"],[0.85,"आप यहाँ के हैं। प्रकृति में। धीमेपन में। ख़ामोशी में।"]],
  9:  [[0.0,"दोनों हाथ अपने दिल पर रखें।"],[0.3,"उस जगह गर्माहट की सांस लें। असली, शारीरिक गर्माहट।"],[0.6,"इसे बाहर फैलने दें — सीना, कंधे, बाहें।"],[0.85,"आप इस गर्माहट के स्रोत हैं। यह हमेशा आपकी थी।"]],
  10: [[0.0,"आज रात, नींद में कुछ भी साथ ले जाने की ज़रूरत नहीं।"],[0.15,"एक धीमी सांस लें — और दिन को बाहर छोड़ें।"],[0.35,"एक-एक कर, पलों को जाने दें। हर सांस छोड़ती है।"],[0.55,"शरीर जानता है कैसे आराम करना है। उसे याद करने दें।"],[0.75,"रात लंबी है, शांत है, और आपकी है।"],[0.9,"सब छोड़ दें। आज के लिए काफी है।"]],
  11: [[0.0,"तीन मिनट — बस आपकी सांस। और कुछ ज़रूरी नहीं।"],[0.3,"धीरे सांस अंदर लें। फेफड़ों को फैलते महसूस करें। पूरी तरह बाहर।"],[0.65,"अगर कोई विचार आए, बस देखें। सांस पर वापस आएं।"],[0.9,"सांस हमेशा यहाँ है। यही आपका लंगर है।"]],
  12: [[0.0,"कल्पना करें कि करुणा आप पर धीमी बारिश की तरह बरस रही है।"],[0.25,"आपका हर हिस्सा — थके हुए हिस्से, अनिश्चित हिस्से।"],[0.5,"सब पर एक जैसी, शांत, बिना शब्दों की देखभाल बरस रही है।"],[0.75,"आपको इसके लायक होने की ज़रूरत नहीं। यह वैसे भी बरसती है।"],[0.9,"इसे सांस में लें। यह असली है। यह आपकी है।"]],
};

const ENGLISH_SCRIPTS = {
  1:  [[0.0,"Close your eyes gently. Take a slow breath in."],[0.1,"Feel the quiet of this moment before the day begins."],[0.25,"With each breath, let a little more warmth fill your chest."],[0.5,"You are here. You are enough. The day can wait."],[0.75,"Begin to set one gentle intention — not a goal, just a direction."],[0.9,"Slowly let the light of this moment carry you forward."]],
  2:  [[0.0,"You are safe. You are here. Right now, nothing is required."],[0.15,"Notice where in your body the tension lives. Just notice — don't fight it."],[0.3,"Place one hand on your chest. Feel its warmth."],[0.5,"Breathe in slowly — 4 counts. Hold gently — 2. Out — 6."],[0.7,"You have survived every difficult moment until now. This one too will pass."],[0.88,"Rest here a moment longer. You are held."]],
  3:  [[0.0,"Begin at the top of your head. Soften the skin there."],[0.12,"Let the softening move down — forehead, eyes, jaw."],[0.25,"Your shoulders. Notice any tension. Breathe into it."],[0.4,"Your hands. Your belly. Let them be heavy and warm."],[0.6,"Your hips, your thighs, your calves — all releasing."],[0.78,"Your feet against the ground. You are rooted. You are here."],[0.9,"The whole body — one breathing, resting thing."]],
  4:  [[0.0,"Begin with yourself. You deserve kindness too."],[0.15,"Silently say: may I be at peace. May I be well."],[0.3,"Call to mind someone you love easily. Send them the same warmth."],[0.5,"Now someone neutral — a stranger you passed today."],[0.65,"Now someone difficult. Just a tiny wish — may they find peace."],[0.82,"Expand it outward to everyone, everywhere."]],
  5:  [[0.0,"You have done enough today. Let the doing be finished."],[0.1,"Feel the weight of your body sinking down."],[0.25,"Your breath is slowing. Your thoughts are softening."],[0.45,"Let images drift by like clouds — no need to hold any of them."],[0.65,"Deeper now. Nothing to solve. Nothing to become."],[0.85,"You are safe. You can fully let go now."]],
  6:  [[0.0,"You are here. Your feet are on the ground."],[0.3,"Name 5 things you can see right now."],[0.6,"Feel your breath — in and out. You are safe in this moment."],[0.85,"This moment is real. You are real. You are okay."]],
  7:  [[0.0,"Imagine a still, dark lake — perfectly calm."],[0.2,"Your thoughts are stones. Watch them sink, one by one."],[0.45,"The water doesn't chase the stones. Neither do you."],[0.7,"Just the surface — still, dark, spacious."],[0.9,"You are the water. Not the stones."]],
  8:  [[0.0,"You are walking slowly through a forest. No destination."],[0.15,"Notice the light coming through the leaves. Dappled and soft."],[0.3,"The earth beneath your feet is soft. Each step slows you."],[0.5,"You hear water somewhere nearby. There is no hurry."],[0.68,"Sit against a tree for a moment. Let the bark hold you."],[0.85,"You belong here. In nature. In slowness. In quiet."]],
  9:  [[0.0,"Place both hands on your heart."],[0.3,"Breathe warmth into that space. Real, physical warmth."],[0.6,"Let it spread outward — chest, shoulders, arms."],[0.85,"You are the source of this warmth. It was always yours."]],
  10: [[0.0,"Tonight, you don't need to carry anything into sleep."],[0.15,"Take a slow breath — and exhale the day."],[0.35,"One by one, let the moments go. Each breath releases."],[0.55,"Your body knows how to rest. Let it remember."],[0.75,"The night is long and quiet and yours."],[0.9,"Release everything. You are done for today."]],
  11: [[0.0,"Three minutes — just your breath. Nothing else required."],[0.3,"Inhale slowly. Feel the lungs expand. Exhale fully."],[0.65,"If a thought comes, just watch it. Return to the breath."],[0.9,"The breath is always here. It is your anchor."]],
  12: [[0.0,"Imagine compassion falling on you like gentle rain."],[0.25,"Every part of you — the tired parts, the uncertain parts."],[0.5,"All of it receiving the same gentle, wordless care."],[0.75,"You do not need to deserve it. It falls anyway."],[0.9,"Breathe it in. It is real. It is yours."]],
};

// ─── MEDITATION GUIDE COMPONENT ───────────────────────────────────────
function MeditationGuide({ meditation, elapsed, total, lang, onSpeak }) {
  const pct = total > 0 ? elapsed / total : 0;
  const isHindi = lang === "Hindi";
  const scripts = isHindi ? HINDI_SCRIPTS : ENGLISH_SCRIPTS;
  const lines = scripts[meditation.id] || scripts[1];
  const currentLine = [...lines].reverse().find(([t]) => pct >= t)?.[1] || lines[0][1];

  const prevLineRef = useRef(null);
  useEffect(() => {
    if (!isHindi || !onSpeak) return;
    if (currentLine !== prevLineRef.current) {
      prevLineRef.current = currentLine;
      onSpeak(currentLine);
    }
  }, [currentLine, isHindi, onSpeak]);

  return (
    <p style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: "italic",
      fontSize: 17,
      color: meditation.col || "#888",
      lineHeight: 1.85,
      textAlign: "center",
      maxWidth: 300,
      margin: "0 auto",
      minHeight: 60,
      transition: "opacity 0.8s ease",
    }}>
      {currentLine}
    </p>
  );
}

// ─── MAIN AUDIO PAGE ──────────────────────────────────────────────────
export function AudioPage({ setTab, goBack, T, lang }) {
  const hi = lang === "Hindi";
  const [audioCategory, setAudioCategory] = useState("sounds");

  // Ambient state
  const [activeSound, setActiveSound] = useState(null);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const ambientRef = useRef(null);
  const ambientStartRef = useRef(null);
  const [volume, setVolume] = useState(0.5);

  // Meditation state
  const [activeMed, setActiveMed] = useState(null);
  const [medRunning, setMedRunning] = useState(false);
  const [medElapsed, setMedElapsed] = useState(0);
  const [medDuration, setMedDuration] = useState(0);
  const medAudioRef = useRef(null);
  const medTimerRef = useRef(null);

  // ── Hindi TTS ──────────────────────────────────────────────────────
  const speakHindi = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    u.rate = 0.82;
    u.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v =>
      v.lang.startsWith("hi") ||
      v.name.toLowerCase().includes("hindi") ||
      v.name.toLowerCase().includes("hemant") ||
      v.name.toLowerCase().includes("kalpana")
    );
    if (hindiVoice) u.voice = hindiVoice;
    window.speechSynthesis.speak(u);
  };

  // Pre-load voices on mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
      stopMeditation(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Meditation timer
  useEffect(() => {
    if (!medRunning) { clearInterval(medTimerRef.current); return; }
    medTimerRef.current = setInterval(() => {
      setMedElapsed(e => {
        const next = e + 1;
        if (next >= medDuration) { stopMeditation(true); return medDuration; }
        return next;
      });
    }, 1000);
    return () => clearInterval(medTimerRef.current);
  }, [medRunning, medDuration]);

  // ── Ambient ────────────────────────────────────────────────────────
  const stopAmbient = () => {
    if (ambientStartRef.current) {
      const mins = (Date.now() - ambientStartRef.current) / 60000;
      if (mins >= 0.5) creditSession(Math.round(mins));
      ambientStartRef.current = null;
    }
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current.src = "";
      ambientRef.current = null;
      window.__pageAudio = null;
    }
    setSoundPlaying(false);
    setActiveSound(null);
  };

  const playAmbient = (sound) => {
    if (activeSound?.id === sound.id) {
      if (soundPlaying) { ambientRef.current?.pause(); setSoundPlaying(false); }
      else { ambientRef.current?.play().catch(() => {}); setSoundPlaying(true); }
      return;
    }
    stopAmbient();
    if (window.__benchAudio) { window.__benchAudio.pause(); window.__benchAudio.src = ""; window.__benchAudio = null; }
    const url = AUDIO_URLS[sound.id];
    if (!url) return;
    const a = new Audio(url);
    a.loop = true;
    a.volume = volume;
    a.play().then(() => {
      ambientRef.current = a;
      window.__pageAudio = a;
      ambientStartRef.current = Date.now();
      setActiveSound(sound);
      setSoundPlaying(true);
    }).catch(() => {});
  };

  // ── Meditation ─────────────────────────────────────────────────────
  const stopMeditation = (completed = false) => {
    clearInterval(medTimerRef.current);
    if (medAudioRef.current) { medAudioRef.current.pause(); medAudioRef.current.src = ""; medAudioRef.current = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (completed && activeMed) creditSession(activeMed.dur || 5);
    setMedRunning(false);
    setMedElapsed(0);
    setMedDuration(0);
    setActiveMed(null);
  };

  const playMeditation = (med) => {
    // Toggle same session
    if (activeMed?.id === med.id) {
      if (medRunning) {
        setMedRunning(false);
        medAudioRef.current?.pause();
        window.speechSynthesis?.cancel();
      } else {
        setMedRunning(true);
        medAudioRef.current?.play()?.catch(() => {});
      }
      return;
    }

    stopMeditation(false);
    stopAmbient();

    const totalSecs = (med.dur || 5) * 60;
    setActiveMed(med);
    setMedDuration(totalSecs);
    setMedElapsed(0);

    if (hi) {
      // ── HINDI: TTS drives everything — no MP3 needed ──
      // Speak the opening line immediately on tap
      const firstLine = HINDI_SCRIPTS[med.id]?.[0]?.[1];
      if (firstLine) {
        // Small delay so the UI settles before speech starts
        setTimeout(() => speakHindi(firstLine), 400);
      }
      setMedRunning(true);
    } else {
      // ── ENGLISH: MP3 + synchronized text guide ──
      const url = MEDITATION_AUDIO[med.id];
      if (url) {
        const a = new Audio(url);
        a.volume = volume;
        a.onloadedmetadata = () => setMedDuration(Math.round(a.duration));
        a.onended = () => stopMeditation(true);
        a.play().catch(() => {});
        medAudioRef.current = a;
      }
      setMedRunning(true);
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (ambientRef.current) ambientRef.current.volume = v;
    if (medAudioRef.current) medAudioRef.current.volume = v;
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const medProgress = activeMed && medDuration > 0 ? medElapsed / medDuration : 0;

  const SOUNDS = [
    { id:"birds.mp3",  emoji:"🐦", title:"Morning Birds",   titleH:"सुबह के पक्षी",   desc:"Gentle morning chorus",    descH:"हल्की चहचहाहट" },
    { id:"wind.mp3",   emoji:"💨", title:"Passing Wind",    titleH:"बहती हवा",         desc:"Breeze through the trees", descH:"पेड़ों से गुजरती हवा" },
    { id:"forest.mp3", emoji:"🌲", title:"Deep Forest",     titleH:"गहरा जंगल",       desc:"Leaves and deep quiet",    descH:"पत्ते और शांति" },
    { id:"flute.mp3",  emoji:"🪈", title:"Distant Flute",   titleH:"बांसुरी",          desc:"A calming melody",         descH:"एक शांत धुन" },
    { id:"waves.mp3",  emoji:"🌊", title:"Ocean Waves",     titleH:"समुद्र की लहरें", desc:"Steady and rhythmic",      descH:"लगातार और स्थिर" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:T.bg, overflow:"hidden" }}>
      <PageNav onBack={goBack || (() => setTab("more"))} onHome={() => setTab("home")} backLabel={hi ? "वापस" : "Back"} T={T} lang={lang} />

      <div className="scroll-area fade-up" style={{ flex:1, overflowY:"auto", padding:"10px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.text, fontWeight:400, marginBottom:8 }}>
            {hi ? "ऑडियो" : "Audio"}
          </h1>
          <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.6 }}>
            {hi ? "आवाज़ को आपको ज़मीन पर लाने दें।" : "Let sound anchor you. Pick a soundscape or a meditation and simply rest."}
          </p>
          {hi && (
            <p style={{ fontSize:11, color:T.accent, marginTop:6, opacity:0.8 }}>
              ✦ ध्यान हिंदी में — आपके डिवाइस की आवाज़ बोलेगी
            </p>
          )}
        </div>

        {/* Tab toggle */}
        <div style={{ display:"flex", background:`${T.accent}0a`, borderRadius:16, padding:4, marginBottom:24, border:`1px solid ${T.border}` }}>
          {[
            { key:"sounds",      icon:"🌊", en:"Soundscapes", hi:"साउंडस्केप" },
            { key:"meditations", icon:"🧘", en:"Meditations",  hi:"ध्यान" },
          ].map(t => (
            <button key={t.key} onClick={() => setAudioCategory(t.key)}
              style={{ flex:1, padding:"10px 8px", borderRadius:12, background:audioCategory===t.key ? T.surface : "transparent", border:`1px solid ${audioCategory===t.key ? T.accent+"40" : "transparent"}`, color:audioCategory===t.key ? T.accent : T.muted, fontSize:13, fontWeight:audioCategory===t.key ? 600 : 400, display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.2s" }}>
              <span>{t.icon}</span> {hi ? t.hi : t.en}
            </button>
          ))}
        </div>

        {/* Active meditation player */}
        {activeMed && (
          <div className="fade-in" style={{ background:`${activeMed.col||T.accent}10`, border:`1px solid ${activeMed.col||T.accent}35`, borderRadius:24, padding:"24px 20px", marginBottom:28 }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <span style={{ fontSize:36 }}>{activeMed.emoji}</span>
              <h3 style={{ margin:"8px 0 2px", fontSize:18, color:T.text, fontWeight:500 }}>
                {hi ? activeMed.titleH : activeMed.title}
              </h3>
              <p style={{ margin:0, fontSize:11, color:T.muted }}>
                {medRunning ? (hi ? "चल रहा है..." : "Playing...") : (hi ? "रुका हुआ" : "Paused")}
              </p>
            </div>

            {/* Synchronized guide text — TTS speaks it in Hindi */}
            <div style={{ marginBottom:20, minHeight:60 }}>
              <MeditationGuide
                meditation={activeMed}
                elapsed={medElapsed}
                total={medDuration || (activeMed.dur * 60)}
                lang={lang}
                onSpeak={hi ? speakHindi : null}
              />
            </div>

            {/* Progress bar */}
            <div style={{ height:3, background:`${T.border}`, borderRadius:99, marginBottom:10, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${medProgress * 100}%`, background:activeMed.col||T.accent, borderRadius:99, transition:"width 1s linear" }} />
            </div>
            <p style={{ textAlign:"center", fontSize:12, color:T.muted, marginBottom:16 }}>
              {fmt(medElapsed)} / {fmt(medDuration || (activeMed.dur * 60))}
            </p>

            {/* Volume — English only (Hindi uses device TTS volume) */}
            {!hi && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <span style={{ fontSize:12, color:T.muted }}>🔈</span>
                <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} style={{ flex:1, accentColor:activeMed.col||T.accent }} />
                <span style={{ fontSize:12, color:T.muted }}>🔊</span>
              </div>
            )}

            {/* Play / Stop buttons */}
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button onClick={() => {
                if (medRunning) { setMedRunning(false); medAudioRef.current?.pause(); window.speechSynthesis?.cancel(); }
                else { setMedRunning(true); medAudioRef.current?.play()?.catch(() => {}); }
              }} style={{ background:activeMed.col||T.accent, color:"#fff", border:"none", borderRadius:99, width:56, height:56, fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${(activeMed.col||T.accent)}40` }}>
                {medRunning ? "⏸" : "▶"}
              </button>
              <button onClick={() => stopMeditation(false)}
                style={{ background:`${T.accent}15`, color:T.muted, border:`1px solid ${T.border}`, borderRadius:99, width:56, height:56, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
                ⏹
              </button>
            </div>

            {hi && (
              <p style={{ textAlign:"center", fontSize:11, color:T.muted, marginTop:14, opacity:0.7 }}>
                🔊 आपके डिवाइस की हिंदी आवाज़ बोल रही है
              </p>
            )}
          </div>
        )}

        {/* Active ambient mini-player */}
        {activeSound && audioCategory === "sounds" && (
          <div className="fade-in" style={{ background:`${T.accent}10`, border:`1px solid ${T.accent}30`, borderRadius:18, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:28 }}>{activeSound.emoji}</span>
            <div style={{ flex:1 }}>
              <p style={{ margin:"0 0 2px", fontSize:14, color:T.text, fontWeight:500 }}>{hi ? activeSound.titleH : activeSound.title}</p>
              <p style={{ margin:0, fontSize:11, color:T.muted }}>{soundPlaying ? (hi ? "चल रहा है" : "Playing") : (hi ? "रुका" : "Paused")}</p>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} style={{ width:60, accentColor:T.accent }} />
            <button onClick={() => playAmbient(activeSound)}
              style={{ background:T.accent, color:"#fff", border:"none", borderRadius:99, width:40, height:40, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {soundPlaying ? "⏸" : "▶"}
            </button>
          </div>
        )}

        {/* Audio list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {(audioCategory === "sounds" ? SOUNDS : (MEDITATIONS || [])).map(item => {
            const isActive = audioCategory === "sounds" ? activeSound?.id === item.id : activeMed?.id === item.id;
            const isPlaying = isActive && (audioCategory === "sounds" ? soundPlaying : medRunning);
            const col = item.col || T.accent;

            return (
              <button key={item.id}
                onClick={() => audioCategory === "sounds" ? playAmbient(item) : playMeditation(item)}
                style={{ display:"flex", alignItems:"center", gap:14, background:isActive ? `${col}12` : T.surface, border:`1px solid ${isActive ? col+"50" : T.border}`, borderRadius:16, padding:"14px 16px", textAlign:"left", transition:"all 0.2s", width:"100%" }}>
                <div style={{ width:46, height:46, borderRadius:12, background:`${col}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:"0 0 3px", fontSize:14, color:isActive ? col : T.text, fontWeight:isActive ? 600 : 500 }}>
                    {hi ? (item.titleH || item.title) : item.title}
                  </p>
                  <p style={{ margin:0, fontSize:11, color:T.muted }}>
                    {hi ? (item.descH || item.desc) : item.desc}
                  </p>
                  {item.dur && (
                    <span style={{ fontSize:10, color:col, display:"block", marginTop:3 }}>
                      {item.dur} {hi ? "मिनट" : "min"}
                      {hi && <span style={{ opacity:0.65, marginLeft:5 }}>· हिंदी आवाज़ में</span>}
                    </span>
                  )}
                </div>
                <div style={{ color:isActive ? col : T.muted, fontSize:16, flexShrink:0 }}>
                  {isActive ? (isPlaying ? "⏸" : "▶") : "▶"}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default AudioPage;
