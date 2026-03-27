import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    // 1. Find all calls that are 'ringing' but have passed their 'expires_at' time
    // This is the "Timeout Logic" ChatGPT strongly recommended.
    const { data: expiredCalls, error: findError } = await supabase
      .from('calls')
      .select('id')
      .eq('status', 'ringing')
      .lt('expires_at', new Date().toISOString())

    if (findError) throw findError

    if (expiredCalls && expiredCalls.length > 0) {
      const idsToUpdate = expiredCalls.map(c => c.id)

      // 2. Change their status to 'missed'
      // This ensures the system is state-driven, not event-based.
      const { error: updateError } = await supabase
        .from('calls')
        .update({ status: 'missed' })
        .in('id', idsToUpdate)

      if (updateError) throw updateError

      console.log(`Successfully marked ${expiredCalls.length} calls as missed.`)
    }

    return new Response(JSON.stringify({ message: "Check complete" }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})