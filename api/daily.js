// api/daily.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const roomId = `sukoon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const callUrl = `https://8x8.vc/sukoon/${roomId}`;

  return res.status(200).json({ url: callUrl });
}