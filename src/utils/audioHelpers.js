import { AUDIO_URLS } from './constants';

export async function loadAudio(audioEl, file, volume=0.45) {
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