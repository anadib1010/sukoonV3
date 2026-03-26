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
          enable_video: callType === 'video', 
          start_video_off: callType === 'voice',
        },
      }),
    });

    const roomData = await response.json();
    
    // Return everything so we can see what Daily.co said
    return res.status(200).json({ url: roomData.url, debug: roomData });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}