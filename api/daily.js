// api/daily.js

export default async function handler(req, res) {
  // Security Check 1: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  // The Bouncer grabs the Master Key from the secure Vault
  const DAILY_API_KEY = process.env.DAILY_API_KEY;

  if (!DAILY_API_KEY) {
    return res.status(500).json({ error: 'Server missing Daily API Key' });
  }

  try {
    // The Bouncer talks to Daily.co securely
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          // Security Check 2: This call room automatically destroys itself after 2 hours!
          exp: Math.round(Date.now() / 1000) + (2 * 60 * 60), 
          enable_chat: false, // We already have SukoonChat for text!
        },
      }),
    });

    const roomData = await response.json();

    if (!response.ok) {
      throw new Error(roomData.error || 'Failed to create room');
    }

    // The Bouncer hands ONLY the safe URL back to the user's phone
    return res.status(200).json({ url: roomData.url });

  } catch (error) {
    console.error("Daily API Error:", error);
    return res.status(500).json({ error: 'Failed to generate call link' });
  }
}