import { useState, useEffect } from 'react';

export function useLS(key, def) {
  const [v, setV] = useState(() => {
    try { 
      const s = localStorage.getItem(key); 
      return s ? JSON.parse(s) : def; 
    } catch { 
      return def; 
    }
  });

  useEffect(() => { 
    try { 
      localStorage.setItem(key, JSON.stringify(v)); 
    } catch {} 
  }, [key, v]);

  return [v, setV];
}