export function writeEmotionalCtx(type, snippet, extra) {
  try {
    localStorage.setItem("jsukoon_emotional_ctx", JSON.stringify({
      type,               // "burn" | "wish" | "journal"
      snippet: (snippet||"").slice(0, 80),
      extra: extra||null, 
      ts: Date.now(),
    }));
  } catch {}
}

export function readEmotionalCtx() {
  try {
    const raw = localStorage.getItem("jsukoon_emotional_ctx");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function clearEmotionalCtx() {
  try { localStorage.removeItem("jsukoon_emotional_ctx"); } catch {}
}

// ✨ UPDATED: Now supports passive 'isBrowsing' credit and live updates!
export function creditSession(minutes, isBrowsing = false) {
  const today = new Date().toDateString();
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dl    = days[new Date().getDay()];
  
  try {
    const raw  = localStorage.getItem("jsukoon_stats");
    const prev = raw ? JSON.parse(raw) : { sessions:0, minutes:0, streak:0, lastDate:null };
    
    if (isBrowsing) {
      // Passive Browsing: Only add minutes, don't trigger a new session or streak day
      const newStats = {
        ...prev,
        minutes: prev.minutes + Math.max(1, Math.round(minutes || 0))
      };
      localStorage.setItem("jsukoon_stats", JSON.stringify(newStats));
    } else {
      // Active Session: Add sessions, update streaks, and add minutes
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
    }

    // Tell the app the stats changed so the Progress page updates instantly
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event('jsukoon_stats_updated'));
    }
  } catch {}
}

export function creditActivity(activityType, minutes) {
  try {
    const raw = localStorage.getItem("jsukoon_activity_log");
    const log = raw ? JSON.parse(raw) : { totalMinutes:0, pendingMinutes:0, activities:{} };
    const mins = Math.max(0.5, minutes || 1);
    
    log.totalMinutes = (log.totalMinutes||0) + mins;
    log.pendingMinutes = (log.pendingMinutes||0) + mins;
    log.activities[activityType] = (log.activities[activityType]||0) + 1;
    
    if (log.pendingMinutes >= 2) {
      const sessionsToCredit = Math.floor(log.pendingMinutes / 2);
      for (let i = 0; i < sessionsToCredit; i++) creditSession(2);
      log.pendingMinutes = log.pendingMinutes % 2;
    }
    localStorage.setItem("jsukoon_activity_log", JSON.stringify(log));
  } catch {}
}