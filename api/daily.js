// api/daily.js
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { callType } = req.body;
  const API_KEY = process.env.VIDEOSDK_API_KEY;
  const SECRET = process.env.VIDEOSDK_SECRET;

  try {
    // 1. Generate a JWT token for VideoSDK
    const token = jwt.sign(
      { apikey: API_KEY, permissions: ['allow_join', 'allow_mod'] },
      SECRET,
      { expiresIn: '2h', algorithm: 'HS256' }
    );

    // 2. Create a meeting room
    const response = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    const roomData = await response.json();
    const roomId = roomData.roomId;

    if (!roomId) {
      return res.status(500).json({ error: 'Could not create room', debug: roomData });
    }

    // 3. Build the join URL
    // VideoSDK prebuilt UI URL
    const callUrl = `https://app.videosdk.live/rooms/${roomId}?token=${token}`;

    return res.status(200).json({ url: callUrl });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
