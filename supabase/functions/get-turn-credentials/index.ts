import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// 🛡️ THE GLOBAL CORS SHIELD
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const username = Deno.env.get('METERED_USERNAME');
    const password = Deno.env.get('METERED_PASSWORD');

    // 🗺️ THE EXPANDED ROUTE MAP FOR OLDER PHONES
    const iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.metered.ca:80' },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: username,
          credential: password,
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: username,
          credential: password,
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: username,
          credential: password,
        }
      ]
    };

    return new Response(JSON.stringify(iceServers), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Robot Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})