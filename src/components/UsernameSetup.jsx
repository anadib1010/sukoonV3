import React, { useState } from 'react';
import { supabase } from '../supabase';

export function UsernameSetup({ user, T, lang, onComplete }) {
  const hi = lang === 'Hindi';
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (val) => {
    if (val.length < 3) return hi ? 'कम से कम 3 अक्षर चाहिए।' : 'At least 3 characters required.';
    if (val.length > 20) return hi ? 'अधिकतम 20 अक्षर।' : 'Maximum 20 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return hi ? 'केवल अक्षर, नंबर और _ allowed हैं।' : 'Only letters, numbers and _ allowed.';
    return null;
  };

  const handleSubmit = async () => {
    const trimmed = username.trim();
    const validationError = validate(trimmed);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    // Check if username is taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmed)
      .maybeSingle();

    if (existing) {
      setError(hi ? 'यह username पहले से लिया जा चुका है।' : 'This username is already taken.');
      setLoading(false);
      return;
    }

    // Save username via upsert
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: trimmed }, { onConflict: 'id' });

    if (updateError) {
      setError(`Error: ${updateError.message}`);
      setLoading(false);
      return;
    }

    // Cache in localStorage so we never re-prompt
    try {
      localStorage.setItem(`jsukoon_username_${user.id}`, trimmed);
    } catch {}

    onComplete(trimmed);
  };

  const accent = T.accent || '#A18CD1';

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080808', padding: '20px', boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', maxWidth: '360px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px' }}>💜</div>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '32px', fontWeight: 300,
            color: accent, margin: '0 0 8px', letterSpacing: '2px',
          }}>
            {hi ? 'अपना नाम चुनें' : 'Choose your name'}
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px', color: 'rgba(255,255,255,0.5)',
            margin: 0, lineHeight: 1.6,
          }}>
            {hi
              ? 'यह नाम chat rooms में दिखेगा। आपका email कभी नहीं दिखाया जाएगा।'
              : 'This is how you\'ll appear in chat rooms. Your email will never be shown.'}
          </p>
        </div>

        <div style={{ width: '100%' }}>
          <input
            type="text"
            placeholder={hi ? 'जैसे: army_borahae' : 'e.g. army_borahae'}
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            maxLength={20}
            style={{
              width: '100%', padding: '15px 18px',
              borderRadius: '20px',
              background: `${accent}08`,
              border: `1px solid ${error ? '#ff6b6b' : accent + '40'}`,
              color: '#fff', fontSize: '16px',
              outline: 'none', fontFamily: "'DM Sans', sans-serif",
              boxSizing: 'border-box', textAlign: 'center',
              letterSpacing: '0.5px',
            }}
          />
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px', color: 'rgba(255,255,255,0.3)',
            marginTop: '6px', textAlign: 'right',
          }}>
            {username.length}/20
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 16px', borderRadius: '12px',
            background: 'rgba(255,100,100,0.1)',
            border: '1px solid rgba(255,100,100,0.3)',
            color: '#ff8080', fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
            width: '100%', boxSizing: 'border-box',
          }}>
            {error}
          </div>
        )}

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px', color: 'rgba(255,255,255,0.3)',
          margin: 0, lineHeight: 1.6,
        }}>
          {hi
            ? '3–20 अक्षर। Letters, numbers, _ allowed।'
            : '3–20 characters. Letters, numbers, _ only.'}
        </p>

        <button
          onClick={handleSubmit}
          disabled={loading || !username.trim()}
          style={{
            width: '100%', padding: '15px',
            borderRadius: '40px',
            background: username.trim() ? accent : 'transparent',
            border: `1px solid ${accent}`,
            color: username.trim() ? '#fff' : accent,
            fontSize: '15px', fontWeight: 600,
            cursor: username.trim() ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.3s', letterSpacing: '0.5px',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? (hi ? 'जाँच रहे हैं...' : 'Checking...')
            : (hi ? 'आगे बढ़ें 💜' : 'Enter the Sanctuary 💜')}
        </button>
      </div>
    </div>
  );
}
