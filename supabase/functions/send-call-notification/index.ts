import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as djwt from "https://deno.land/x/djwt@v3.0.1/mod.ts"

// 🛡️ THE GLOBAL CORS SHIELD
// This tells the browser: "It is safe to let Sukoon talk to this robot!"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. HANDLE THE "SECRET KNOCK" (CORS Preflight)
  // Browsers send an OPTIONS request first. We must answer with 200 OK.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    // 2. LISTEN FOR THE SIGNAL
    const { token, callerName, roomId } = await req.json()
    console.log(`🔔 Sending wake-up signal to token: ${token.substring(0, 10)}...`)

    // 3. GRAB THE MASTER KEY FROM THE VAULT
    const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')

    // 4. GET THE GOOGLE "PERMISSION SLIP" (Access Token)
    const accessToken = await getGoogleAccessToken(serviceAccount)

    // 5. BUILD THE NOTIFICATION
    const message = {
      message: {
        token: token,
        notification: {
          title: "सुकून कॉल (Sukoon Call)", 
          body: `${callerName} is calling you on a secure line...` 
        },
        data: {
          roomId: roomId,
          action: "incoming_call", 
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        android: { priority: "high" }
      }
    }

    // 6. TALK TO GOOGLE'S TOWER
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    )

    const result = await res.json()
    console.log("Google Response:", result)

    // 7. SUCCESS RESPONSE (With CORS Shield)
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("Robot Error:", error.message)
    // 8. ERROR RESPONSE (With CORS Shield)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})

// ─── THE UPDATED GOOGLE HANDSHAKE ENGINE 🤝 ───
// Built using modern, native Web Crypto standards!
async function getGoogleAccessToken(serviceAccount: any) {
  const jwtHeader = { alg: "RS256", typ: "JWT" } as const;
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  
  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat
  };

  const pem = serviceAccount.private_key;
  
  // Clean the PEM string to extract just the raw, secret bits
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(pem.indexOf(pemHeader) + pemHeader.length, pem.indexOf(pemFooter)).replace(/\s/g, "");
  
  // Turn it into a binary format the computer can read
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // Import it using the native tool (NO MORE djwt.importJWK BUG!)
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["sign"]
  );

  // Generate the VIP Badge
  const jwt = await djwt.create(jwtHeader, jwtPayload, cryptoKey);

  // Trade it with Google for a temporary access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const { access_token } = await response.json();
  return access_token;
}