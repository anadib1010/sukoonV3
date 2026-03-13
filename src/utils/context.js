/**
 * context.js
 * Persistent "Emotional Memory" between Reflection and Journal.
 */

const CTX_KEY = "jsukoon_emotional_ctx";

export function writeEmotionalCtx(type, text, meta = {}) {
  const ctx = {
    type, // "burn" or "wish"
    snippet: text.substring(0, 100),
    timestamp: new Date().toISOString(),
    isNew: true, // Flag to show it hasn't been "addressed" in Journal yet
    ...meta
  };
  localStorage.setItem(CTX_KEY, JSON.stringify(ctx));
}

export function readEmotionalCtx() {
  const stored = localStorage.getItem(CTX_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
    // Timeout logic removed. It stays until the user journals or clears it.
  } catch (e) {
    return null;
  }
}

/**
 * Call this once the user has finished their Journal entry 
 * to 'clear' the notification banner for next time.
 */
export function clearEmotionalCtx() {
  localStorage.removeItem(CTX_KEY);
}