// ============================================================================
// khub-delete-message  —  Supabase Edge Function
// ============================================================================
// Handles soft-delete of K-Hub messages with full hierarchy:
//   - self    → own messages, 24h soft delete, 10s undo window
//   - mod     → trust_level >= 3, requires reason, immediate soft delete
//   - admin   → is_admin = true, no restrictions, immediate soft delete
//
// For mod/admin deletes of image messages: Oracle file deleted immediately.
// For self-deletes: Oracle file deleted by cron after 24h.
//
// Deploy:
//   supabase functions deploy khub-delete-message --no-verify-jwt
//
// Required secrets: same as khub-message-check
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
//   VM_API_URL (the Oracle VM URL for file deletion)
// ============================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;
const VM_API_URL   = Deno.env.get("VM_API_URL") ?? "https://jsukoon-api.duckdns.org";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });

// Delete an Oracle file by calling the VM's internal delete endpoint.
// The VM uses its own OCI credentials — the Edge Function never has them.
async function deleteOracleFile(objectPath: string, authHeader: string): Promise<void> {
  try {
    await fetch(`${VM_API_URL}/meme-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ object_path: objectPath }),
    });
    // Fire-and-forget: if it fails, the 24h cron will clean it up
  } catch (_) {}
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")    return json(405, { error: "POST only" });

  // 1. Verify JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json(401, { error: "missing_auth" });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json(401, { error: "invalid_token" });
  const user = userData.user;

  // 2. Parse body
  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }

  const messageId:  string = String(body?.message_id ?? "");
  const deleteType: string = String(body?.delete_type ?? "self");
  const reason:     string = String(body?.reason ?? "");
  const action:     string = String(body?.action ?? "delete");  // 'delete' | 'undo'

  if (!messageId) return json(400, { error: "missing_message_id" });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Handle undo
  if (action === "undo") {
    const { data, error } = await admin.rpc("khub_undo_delete", {
      p_message_id: messageId,
      p_user_id:    user.id,
    });
    if (error) return json(500, { error: "rpc_failed", detail: error.message });
    if (data?.error) return json(400, { error: data.error });
    return json(200, { ok: true });
  }

  if (!["self", "mod", "admin"].includes(deleteType)) {
    return json(400, { error: "invalid_delete_type" });
  }

  // 3. Call the soft_delete RPC (permission checks happen inside Postgres)
  const { data, error } = await admin.rpc("khub_soft_delete", {
    p_message_id:  messageId,
    p_deleted_by:  user.id,
    p_delete_type: deleteType,
    p_reason:      reason || null,
  });

  if (error) return json(500, { error: "rpc_failed", detail: error.message });
  if (data?.error) {
    const statusMap: Record<string, number> = {
      message_not_found:   404,
      not_your_message:    403,
      not_elite_mod:       403,
      not_admin:           403,
      reason_required:     400,
      invalid_delete_type: 400,
    };
    return json(statusMap[data.error] ?? 400, { error: data.error });
  }

  // 4. For mod/admin deletes: delete Oracle file immediately (not waiting 24h)
  if (deleteType !== "self" && data?.object_path) {
    await deleteOracleFile(data.object_path, authHeader);
  }

  return json(200, { ok: true });
});
