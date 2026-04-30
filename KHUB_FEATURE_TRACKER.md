# JSukoon K-Hub — Feature Tracker & Developer Guide
**Project:** sukoon-v3.vercel.app | React/Vite PWA | Supabase backend | Oracle VM: 140.238.226.129
**Last updated:** April 28, 2026

---

## 🔑 Key Technical Details

| Item | Value |
|------|-------|
| Supabase Project | khpxgfadnnwycdhnyxye |
| Supabase URL | https://khpxgfadnnwycdhnyxye.supabase.co |
| Oracle VM IP | 140.238.226.129 |
| Oracle Bucket | jsukoon-khub-memes |
| OCI Namespace | bmqg3jltavcd |
| OCI Region | ap-mumbai-1 |
| Admin User ID | e47ac33d-9653-42a0-9eeb-53995577a740 |
| VM Config | /etc/jsukoon-api/config.json |
| VM App | /opt/jsukoon-api/app.py (Flask + gunicorn) |
| VM Night Sweep | /opt/jsukoon-api/cleanup.py |
| VM Systemd Service | jsukoon-api.service |
| VM Sweep Log | /var/log/jsukoon-sweep.log |
| SSH Key | C:\Users\anadi\Downloads\ssh-key-2026-04-17 (1).key |
| Project Folder | C:\Users\anadi\OneDrive\Desktop\AI python learning\sukoonV3 |
| K-Hub Room Files | src/features/khub/ |
| Moderation Logic | src/features/khub/moderation.js |

**SSH Command:**
```
ssh -i "C:/Users/anadi/Downloads/ssh-key-2026-04-17 (1).key" ubuntu@140.238.226.129
```

**5 K-Hub Rooms:**
- Lavender Lounge → KLavenderLoungeChat.jsx
- General K-Pop → KPopGeneralRoom.jsx
- K-Drama Room → KDramaRoom.jsx
- Purple Lounge → PurpleLounge.jsx
- Blink Lounge → BlinkLounge.jsx

---

## ✅ GROUP A — COMPLETED FEATURES

### 1. ✅ Strike System
**What it does:** Formal escalating punishment system for toxic users.
- Warning → 1hr mute → 24hr ban → permanent ban
- Triggered automatically by toxicity filter, reports, or night sweep
- Implemented as Supabase RPC: `khub_issue_strike(p_target_user_id, p_reason, p_issued_by, p_room_id)`
- Strike count stored in `profiles.strike_count`
- Ban info checked via `khub_check_ban` RPC on room load

**Files changed:** Supabase (RPC functions), all 5 room files

---

### 2. ✅ Night Sweep (Cron Job)
**What it does:** Re-scans recent messages every 30 minutes while you sleep. Catches toxic content that slipped through real-time filters.

**How it works:**
- Runs every 30 min via cron on the Oracle VM
- Scans all visible messages from the last 35 minutes (5 min overlap buffer)
- Checks: toxic text (keyword patterns) + blocked links + NSFW images (NudeNet)
- Action: hides message (status → 'hidden') + issues strike to user
- Logs to /var/log/jsukoon-sweep.log

**Cron entry:**
```
*/30 * * * * /usr/bin/python3 /opt/jsukoon-api/cleanup.py >> /var/log/jsukoon-sweep.log 2>&1
```

**To check logs:**
```bash
tail -50 /var/log/jsukoon-sweep.log
```

**To test manually (5-day window):**
```bash
python3 -c "
import sys; sys.path.insert(0, '/opt/jsukoon-api')
import cleanup
cleanup.SWEEP_WINDOW_MINUTES = 60 * 24 * 5
cleanup.run_sweep()
"
```

**Thresholds (in /etc/jsukoon-api/config.json):**
- toxicity_threshold: 0.75
- nsfw_threshold: 0.60

**Files changed:** /opt/jsukoon-api/cleanup.py

---

### 3. ✅ Duplicate Message Detection
**What it does:** Prevents spam flooding by detecting repeated identical messages.

**How it works:**
- Same message sent 3 times within 5 minutes → warning toast (blocked, not muted)
- Same message sent 4+ times → auto-mute + rep score deduction
- Purely frontend (in-memory), instantaneous
- Works silently alongside the existing SpamLimiter (rate limiter)

**Class:** `DuplicateDetector` in `src/features/khub/moderation.js`
**Instance in each room:** `const dupDetector = new DuplicateDetector(3, 300);`
**Called in sendMessage:** `const dup = dupDetector.check(input.trim(), hi);`

**To adjust sensitivity:** Change `new DuplicateDetector(maxRepeats, windowSeconds)`
- Default: 3 repeats, 300 seconds (5 min window)

**Files changed:** moderation.js + all 5 room files

---

### 4. ✅ Shadow-Restrict Risky Users
**What it does:** Silently throttles bad actors without them knowing they're restricted. No confrontation, no warning to the user.

**Trigger conditions (either one):**
- `profiles.strike_count >= 3` OR
- `profiles.rep_score < -15`

**Effects when restricted:**
- 8 second cooldown between messages (silent block — no toast, no error)
- Meme/image upload button disabled (stop sign cursor)
- User has NO idea they are restricted

**How to manually restrict a user (from VM):**
```bash
# Set strike_count to 3 to trigger shadow restrict
python3 -c "
import urllib.request, json
cfg = json.load(open('/etc/jsukoon-api/config.json'))
headers = {'apikey': cfg['supabase_service_key'], 'Authorization': 'Bearer ' + cfg['supabase_service_key'], 'Content-Type': 'application/json', 'Prefer': 'return=representation'}
url = cfg['supabase_url'] + '/rest/v1/profiles?id=eq.USER_ID_HERE'
req = urllib.request.Request(url, data=json.dumps({'strike_count': 3}).encode(), headers=headers, method='PATCH')
print(json.loads(urllib.request.urlopen(req).read()))
"
```

**To restore a user:**
Same command but set `strike_count` back to 0.

**Functions:** `isShadowRestricted(profile)` and `ShadowThrottle` class in moderation.js

**Files changed:** moderation.js + all 5 room files + MemeUploader.jsx

---

## ⬜ GROUP A — REMAINING FEATURES

### 5. ⬜ Per-Room Slow Mode
**What it does:** You can turn on slow mode for any room remotely (from your phone/Supabase dashboard) without deploying. When on, users must wait X seconds between messages.

**Planned implementation:**
- New Supabase table: `khub_slow_mode` with one row per room
  - Columns: room_name, enabled (bool), cooldown_seconds, updated_at
- Frontend polls this table on mount + subscribes to realtime changes
- When enabled: enforces cooldown in sendMessage, shows countdown timer to user
- Admin can toggle from Supabase dashboard → Table Editor

**How to use (once built):**
1. Go to Supabase Dashboard → Table Editor → khub_slow_mode
2. Find the room row (e.g. "Lavender Lounge")
3. Set `enabled = true` and `cooldown_seconds = 30`
4. Users in that room immediately feel the slowdown — no deploy needed

**Files to change:** Supabase (new table) + moderation.js + all 5 room files

---

### 6. ⬜ User Block List
**What it does:** Users can hide messages from specific people. Reduces moderation load because users self-manage. The blocked user has no idea they're blocked.

**Planned implementation:**
- New Supabase table: `khub_user_blocks`
  - Columns: blocker_id, blocked_id, created_at
- Frontend: long-press or right-click on a message → "Block user" option
- Blocked users' messages are filtered out on the frontend (never shown)
- Block is per-user, not per-room (blocked everywhere in K-Hub)
- UI: Settings page or profile page to manage block list

**Files to change:** Supabase (new table) + moderation.js + MessageBubble.jsx + all 5 room files

---

## ⬜ GROUP B — FUTURE FEATURES

### 7. ⬜ Elite Mod Dashboard
**What it does:** A dedicated admin panel where you can see all K-Hub activity, manage users, issue/remove strikes, toggle slow mode, and see flagged content — all in one place.

**Planned features:**
- Real-time feed of flagged messages
- User search + strike history viewer
- One-click ban/unban
- Slow mode toggles per room
- Night sweep log viewer
- Rep score editor

---

### 8. ⬜ AI Bulletin Board
**What it does:** An AI-generated daily/weekly bulletin for each K-Hub room. Summarizes what fans are talking about, trending topics, upcoming K-pop events.

**Planned implementation:**
- Cron job on VM that calls Claude API once a day
- Reads last 24 hours of messages per room
- Generates a fun bulletin post and pins it at the top of the room
- Users can react to it with hearts

---

### 9. ⬜ Behavior Quiz on Signup
**What it does:** New users answer a short quiz before entering K-Hub. Sets expectations, filters out bad actors, and makes onboarding fun.

**Planned questions:**
- "What do you do if someone is rude?" → tests community values
- "Which fandom are you?" → personalizes experience
- Results affect starting trust level

---

### 10. ⬜ Cross-Room Heart Sync
**What it does:** Hearts sent in one room float across to other rooms in real-time. Creates a sense of connected community across all 5 K-Hub rooms.

---

## 📋 Quick Reference — Common Tasks

### Check a user's profile/status
```bash
python3 -c "
import urllib.request, json
cfg = json.load(open('/etc/jsukoon-api/config.json'))
headers = {'apikey': cfg['supabase_service_key'], 'Authorization': 'Bearer ' + cfg['supabase_service_key']}
url = cfg['supabase_url'] + '/rest/v1/profiles?id=eq.USER_ID&select=rep_score,strike_count,trust_level,is_banned'
print(json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read()))
"
```

### Issue a manual strike to a user
```bash
python3 -c "
import urllib.request, json
cfg = json.load(open('/etc/jsukoon-api/config.json'))
headers = {'apikey': cfg['supabase_service_key'], 'Authorization': 'Bearer ' + cfg['supabase_service_key'], 'Content-Type': 'application/json'}
url = cfg['supabase_url'] + '/rest/v1/rpc/khub_issue_strike'
payload = {'p_target_user_id': 'USER_ID', 'p_reason': 'manual_admin_action', 'p_issued_by': 'e47ac33d-9653-42a0-9eeb-53995577a740', 'p_room_id': None}
req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers, method='POST')
print(json.loads(urllib.request.urlopen(req).read()))
"
```

### Run night sweep manually
```bash
python3 /opt/jsukoon-api/cleanup.py
```

### Restart the Flask API service
```bash
sudo systemctl restart jsukoon-api.service
sudo systemctl status jsukoon-api.service
```

### Check cron jobs
```bash
crontab -l
```

### Deploy new cleanup.py from local machine
```
scp -i "C:/Users/anadi/Downloads/ssh-key-2026-04-17 (1).key" cleanup.py ubuntu@140.238.226.129:/opt/jsukoon-api/cleanup.py
```
JSukoon K-Hub — Feature Tracker & Developer Guide
Project: sukoon-v3.vercel.app | React/Vite PWA | Supabase backend | Oracle VM: 140.238.226.129
Last updated: April 28, 2026
---
🔑 Key Technical Details
Item	Value
Supabase Project	khpxgfadnnwycdhnyxye
Supabase URL	https://khpxgfadnnwycdhnyxye.supabase.co
Oracle VM IP	140.238.226.129
Oracle Bucket	jsukoon-khub-memes
OCI Namespace	bmqg3jltavcd
OCI Region	ap-mumbai-1
Admin User ID	e47ac33d-9653-42a0-9eeb-53995577a740
VM Config	/etc/jsukoon-api/config.json
VM App	/opt/jsukoon-api/app.py (Flask + gunicorn)
VM Night Sweep	/opt/jsukoon-api/cleanup.py
VM Systemd Service	jsukoon-api.service
VM Sweep Log	/var/log/jsukoon-sweep.log
SSH Key	C:\Users\anadi\Downloads\ssh-key-2026-04-17 (1).key
Project Folder	C:\Users\anadi\OneDrive\Desktop\AI python learning\sukoonV3
K-Hub Room Files	src/features/khub/
Moderation Logic	src/features/khub/moderation.js
SSH Command:
```
ssh -i "C:/Users/anadi/Downloads/ssh-key-2026-04-17 (1).key" ubuntu@140.238.226.129
```
5 K-Hub Rooms:
Lavender Lounge → KLavenderLoungeChat.jsx
General K-Pop → KPopGeneralRoom.jsx
K-Drama Room → KDramaRoom.jsx
Purple Lounge → PurpleLounge.jsx
Blink Lounge → BlinkLounge.jsx
---
✅ GROUP A — ALL 6 FEATURES COMPLETE
---
1. ✅ Strike System
What it does: Formal escalating punishment system for toxic users.
How it works:
Every time a user breaks a rule, they receive a strike
Strikes escalate automatically:
1st strike → Warning (can still chat)
2nd strike → Muted for 1 hour
3rd strike → Banned for 24 hours
4th strike → Permanently banned
Banned users see a friendly ban screen when they open any K-Hub room
Strike count stored in profiles.strike_count
What triggers a strike:
Night Sweep catching toxic text, NSFW images, or blocked links
Message getting 3 reports from other users (auto-hide)
Manual strike issued by admin
How to manually issue a strike to a user (from VM):
```bash
python3 -c "
import urllib.request, json
cfg = json.load(open('/etc/jsukoon-api/config.json'))
headers = {'apikey': cfg['supabase_service_key'], 'Authorization': 'Bearer ' + cfg['supabase_service_key'], 'Content-Type': 'application/json'}
url = cfg['supabase_url'] + '/rest/v1/rpc/khub_issue_strike'
payload = {'p_target_user_id': 'USER_ID_HERE', 'p_reason': 'manual_admin_action', 'p_issued_by': 'e47ac33d-9653-42a0-9eeb-53995577a740', 'p_room_id': None}
req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers, method='POST')
print(json.loads(urllib.request.urlopen(req).read()))
"
```
How to unban a user:
Supabase Dashboard → Table Editor → profiles → set strike_count = 0 and is_banned = false
---
2. ✅ Night Sweep
What it does: Automatically re-scans recent messages every 30 minutes while you sleep. Catches toxic content that slipped through real-time filters.
How it works:
Runs every 30 minutes via cron on the Oracle VM
Scans all visible messages from the last 35 minutes
3 checks per message: toxic text + blocked links + NSFW images
If flagged: message hidden + strike issued to user automatically
All activity logged to /var/log/jsukoon-sweep.log
Cron entry (already set up):
```
*/30 * * * * /usr/bin/python3 /opt/jsukoon-api/cleanup.py >> /var/log/jsukoon-sweep.log 2>&1
```
To check recent sweep logs:
```bash
tail -50 /var/log/jsukoon-sweep.log
```
To run sweep manually:
```bash
python3 /opt/jsukoon-api/cleanup.py
```
Thresholds (in /etc/jsukoon-api/config.json):
toxicity_threshold: 0.75
nsfw_threshold: 0.60
---
3. ✅ Duplicate Message Detection
What it does: Prevents spam flooding by detecting repeated identical messages.
How it works:
Tracks last 5 minutes of messages per user per room (frontend, in memory)
Same message 3 times → warning toast, message blocked
Same message 4+ times → muted + rep deducted
Resets automatically after 5 minutes
User experience:
1st & 2nd send: allowed
3rd send: "⚠️ You've already sent this message. One more repeat = mute."
4th+ send: "🚫 Stop sending the same message. You've been muted for spam."
To adjust: Change new DuplicateDetector(3, 300) in each room file
First number = repeats before warning (default 3)
Second number = window in seconds (default 300 = 5 min)
---
4. ✅ Shadow-Restrict Risky Users
What it does: Silently throttles bad actors. They don't know they're restricted.
Triggers (either one):
profiles.strike_count >= 3
profiles.rep_score < -15
Effects (user has NO idea):
Must wait 8 seconds between messages (silent block, no error shown)
Meme upload button disabled (stop cursor)
How to manually shadow-restrict:
Supabase Dashboard → Table Editor → profiles → set strike_count = 3
How to remove:
Set strike_count = 0
Note: Triggers automatically when strikes reach 3 — usually no manual action needed.
---
5. ✅ Per-Room Slow Mode
What it does: Enforces a cooldown between messages per room. Toggle from your phone in seconds — no deployment needed.
How to turn ON slow mode:
Supabase Dashboard → Table Editor → khub_slow_mode
Find the room (e.g. "Lavender Lounge")
Set enabled = true
Optionally change cooldown_seconds (default 30)
Takes effect immediately for all users in that room
How to turn OFF:
Same steps, set enabled = false
User experience:
First message goes through normally
Too soon: "🐢 Slow mode is on. Wait 23s." (live countdown)
Recommended settings:
Promotion event: 30 seconds
High traffic: 60 seconds
Emergency spam flood: 120 seconds
All 5 rooms are controlled independently in the khub_slow_mode table.
---
6. ✅ User Block List
What it does: Users can hide messages from specific people. The blocked user has no idea they're blocked.
How it works for users:
Click/tap on any message from another user
Menu appears below message with ⚐ Report and 🚫 Block buttons
Click 🚫 Block — that user's messages disappear instantly
Block persists across all sessions and all 5 rooms
Blocked user sees nothing different
How to unblock (admin only, no UI yet):
```sql
-- Unblock specific user
DELETE FROM khub_user_blocks
WHERE blocker_id = 'BLOCKER_ID' AND blocked_id = 'BLOCKED_ID';

-- Remove all blocks for a user
DELETE FROM khub_user_blocks WHERE blocker_id = 'USER_ID';
```
How to see all active blocks:
```sql
SELECT * FROM khub_user_blocks ORDER BY created_at DESC;
```
---
📋 Quick Reference — Common Admin Tasks
SSH into VM
```
ssh -i "C:/Users/anadi/Downloads/ssh-key-2026-04-17 (1).key" ubuntu@140.238.226.129
```
Check a user's status
```bash
python3 -c "
import urllib.request, json
cfg = json.load(open('/etc/jsukoon-api/config.json'))
headers = {'apikey': cfg['supabase_service_key'], 'Authorization': 'Bearer ' + cfg['supabase_service_key']}
url = cfg['supabase_url'] + '/rest/v1/profiles?id=eq.USER_ID&select=rep_score,strike_count,trust_level,is_banned'
print(json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read()))
"
```
Run night sweep manually
```bash
python3 /opt/jsukoon-api/cleanup.py
```
Enable slow mode for a room
Supabase Dashboard → Table Editor → khub_slow_mode → set enabled = true
Restart Flask API
```bash
sudo systemctl restart jsukoon-api.service
```
Deploy new cleanup.py from local machine
```
scp -i "C:/Users/anadi/Downloads/ssh-key-2026-04-17 (1).key" cleanup.py ubuntu@140.238.226.129:/opt/jsukoon-api/cleanup.py
```
---
⬜ GROUP B — FUTURE FEATURES
7. ⬜ Elite Mod Dashboard
Admin panel to manage all K-Hub activity — flagged messages, user strikes, slow mode toggles, rep score editor, ban/unban.
8. ⬜ AI Bulletin Board
Daily AI-generated bulletin per room summarizing fan discussions. Cron job calls Claude API, pins post at top of room.
9. ⬜ Behavior Quiz on Signup
Short quiz before entering K-Hub. Tests community values, personalizes by fandom, affects starting trust level.
10. ⬜ Cross-Room Heart Sync
Hearts sent in one room float across to other rooms in real-time.