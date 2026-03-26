// api/daily.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { callType } = req.body; 
  const DAILY_API_KEY = process.env.DAILY_API_KEY;

  try {
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          exp: Math.round(Date.now() / 1000) + (2 * 60 * 60),
          start_video_off: callType === 'voice',
          start_audio_off: false,
        },
      }),
    });

    const roomData = await response.json();
    return res.status(200).json({ url: roomData.url });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}