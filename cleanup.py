#!/usr/bin/env python3
"""
JSukoon K-Hub — Night Sweep (cleanup.py)
Cron: */30 * * * * /usr/bin/python3 /opt/jsukoon-api/cleanup.py >> /var/log/jsukoon-sweep.log 2>&1
"""

import json, urllib.request, urllib.parse, urllib.error
import re, logging, sys, io
from datetime import datetime, timezone, timedelta

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SWEEP] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
log = logging.getLogger("night_sweep")

cfg = json.load(open("/etc/jsukoon-api/config.json"))
SUPABASE_URL   = cfg["supabase_url"]
SUPABASE_KEY   = cfg["supabase_service_key"]
ADMIN_USER_ID  = cfg.get("admin_user_id", "e47ac33d-9653-42a0-9eeb-53995577a740")
NSFW_THRESHOLD = float(cfg.get("nsfw_threshold", 0.60))
SWEEP_WINDOW_MINUTES = 35
LOCAL_PREDICT_URL = "http://127.0.0.1:5000/predict"

# ── Toxicity: keyword-based (no ML endpoint available) ───────────────────────
TOXIC_PATTERNS = re.compile(
    r"\b(kill\s+your?self|kys|i\s+hate\s+you|you\s+(are\s+)?(stupid|idiot|retard|dumb|ugly|fat|useless|pathetic)|"
    r"shut\s+up|go\s+die|worthless|piece\s+of\s+shit|fuck\s+you|bitch|whore|slut|cunt|faggot|nigger|chink|spic|"
    r"you\s+should\s+die|nobody\s+likes\s+you|everyone\s+hates\s+you)\b",
    re.IGNORECASE
)

def check_toxicity(text: str) -> bool:
    if not text or not text.strip():
        return False
    return bool(TOXIC_PATTERNS.search(text))

# ── Blocked links ────────────────────────────────────────────────────────────
BLOCKED_LINK_RE = re.compile(
    r"https?://(?:www\.)?(?:onlyfans|patreon)\.com|"
    r"https?://\S+\.(exe|apk|bat|cmd|scr)\b|"
    r"discord\.gg/[A-Za-z0-9]+",
    re.IGNORECASE
)

def has_blocked_link(text: str) -> bool:
    return bool(text and BLOCKED_LINK_RE.search(text))

# ── NSFW: download image, POST as file to /predict ──────────────────────────
def check_nsfw(image_url: str) -> float:
    if not image_url:
        return 0.0
    try:
        # Download image bytes
        img_req = urllib.request.Request(image_url, headers={"User-Agent": "JSukoon-Sweep/1.0"})
        with urllib.request.urlopen(img_req, timeout=15) as r:
            img_bytes = r.read()

        # Build multipart form-data
        boundary = "----SweepBoundary7x9k"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="img.jpg"\r\n'
            f"Content-Type: image/jpeg\r\n\r\n"
        ).encode() + img_bytes + f"\r\n--{boundary}--\r\n".encode()

        req = urllib.request.Request(
            LOCAL_PREDICT_URL,
            data=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            result = json.loads(resp.read())
            return float(result.get("unsafe", 0))
    except Exception as e:
        log.warning("NSFW check error for %s: %s", image_url, e)
        return 0.0

# ── Supabase helpers ─────────────────────────────────────────────────────────
def sb_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def sb_get(path, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=sb_headers())
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def sb_patch(path, match_params, body):
    url = f"{SUPABASE_URL}/rest/v1/{path}?" + urllib.parse.urlencode(match_params)
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=sb_headers(), method="PATCH")
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def sb_rpc(fn_name, payload):
    url = f"{SUPABASE_URL}/rest/v1/rpc/{fn_name}"
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=sb_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        log.error("RPC %s failed %s: %s", fn_name, e.code, e.read().decode())
        return {}

# ── Core actions ─────────────────────────────────────────────────────────────
def hide_message(msg_id, reason):
    try:
        sb_patch("khub_messages", {"id": f"eq.{msg_id}"}, {"status": "hidden"})
        log.info("  ↳ Hidden message %s (%s)", msg_id, reason)
    except Exception as e:
        log.error("  ↳ Failed to hide %s: %s", msg_id, e)

def issue_strike(user_id, reason, room_id):
    result = sb_rpc("khub_issue_strike", {
        "p_target_user_id": user_id,
        "p_reason":         reason,
        "p_issued_by":      ADMIN_USER_ID,
        "p_room_id":        None,  # K-Hub uses room_name strings, RPC expects UUID or null
    })
    log.info("  ↳ Strike → user %s | %s | result: %s", user_id, reason, result)

# ── Main sweep ───────────────────────────────────────────────────────────────
def run_sweep():
    now      = datetime.now(timezone.utc)
    since    = now - timedelta(minutes=SWEEP_WINDOW_MINUTES)
    since_iso = since.isoformat().replace("+00:00", "Z")

    log.info("═══ Night Sweep started — window: %s → %s ═══", since_iso, now.isoformat())

    try:
        messages = sb_get("khub_messages", {
            "select":     "id,user_id,room_name,text,image_url,created_at",
            "status":     "eq.visible",
            "created_at": f"gte.{since_iso}",
            "order":      "created_at.asc",
            "limit":      "500",
        })
    except Exception as e:
        log.error("Failed to fetch messages: %s", e)
        return

    log.info("Fetched %d visible messages to re-scan", len(messages))
    flagged = 0

    for msg in messages:
        msg_id  = msg["id"]
        user_id = msg["user_id"]
        room_id = msg["room_name"]
        text    = msg.get("text") or ""
        img_url = msg.get("image_url") or ""
        reasons = []

        if check_toxicity(text):
            reasons.append("toxic_text")

        if has_blocked_link(text):
            reasons.append("blocked_link")

        if img_url:
            score = check_nsfw(img_url)
            if score >= NSFW_THRESHOLD:
                reasons.append(f"nsfw_image:{score:.2f}")

        if reasons:
            flagged += 1
            reason = "night_sweep:" + ",".join(reasons)
            log.info("⚑ msg=%s user=%s room=%s | %s", msg_id, user_id, room_id, reason)
            hide_message(msg_id, reason)
            issue_strike(user_id, reason, room_id)

    log.info("═══ Sweep complete — %d/%d messages flagged ═══\n", flagged, len(messages))

if __name__ == "__main__":
    try:
        run_sweep()
    except Exception as e:
        log.critical("Sweep crashed: %s", e, exc_info=True)
        sys.exit(1)
