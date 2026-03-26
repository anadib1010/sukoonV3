import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as djwt from "https://deno.land/x/djwt@v3.0.1/mod.ts"

// 🤖 THE SUKOON CLOUD MESSENGER
serve(async (req) => {
  // 1. The "Security Handshake" (CORS)
  // This allows your website to talk to this robot from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
      } 
    })
  }

  try {
    // 2. Listen for the "Call Signal" from your app
    const { token, callerName, roomId } = await req.json()
    console.log(`🔔 Sending wake-up signal to token: ${token.substring(0, 10)}...`)

    // 3. Grab the Master Key from the "Supabase Vault"
    const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')

    // 4. Get a "Permission Slip" (Access Token) from Google
    const accessToken = await getGoogleAccessToken(serviceAccount)

    // 5. Build the "Alarm" message for the friend's phone
    const message = {
      message: {
        token: token,
        notification: {
          title: "Sukoon Incoming Call! 📞",
          body: `${callerName} is calling you on Sukoon.`
        },
        data: {
          roomId: roomId,
          type: "INCOMING_CALL",
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        android: { 
          priority: "high" 
        }
      }
    }

    // 6. Send the signal to Google's Notification Tower!
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
    console.log("Google Tower Response:", result)

    return new Response(JSON.stringify(result), { 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    })

  } catch (error) {
    console.error("Robot Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    })
  }
})

// ─── THE GOOGLE HANDSHAKE ENGINE 🤝 ───
// This part generates a high-security "Token" to prove we are the owners of Sukoon
async function getGoogleAccessToken(serviceAccount: any) {
  const jwtHeader = { alg: "RS256", typ: "JWT" }
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600
  
  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat
  }

  const pem = serviceAccount.private_key
  const cryptoKey = await djwt.importJWK(await pemToJWK(pem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" })
  const jwt = await djwt.create(jwtHeader, jwtPayload, cryptoKey)

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  const { access_token } = await response.json()
  return access_token
}

// Technical helper to convert the "Master Key" into a format the Robot understands
async function pemToJWK(pem: string) {
  const content = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "")
  const binary = Uint8Array.from(atob(content), c => c.charCodeAt(0))
  return await crypto.subtle.exportKey("jwk", await crypto.subtle.importKey("pkcs8", binary, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["sign"]))
}