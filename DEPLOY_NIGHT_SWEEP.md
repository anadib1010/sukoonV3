# Night Sweep — Deploy & Verify Guide
# JSukoon K-Hub | cleanup.py on Oracle VM

## Step 1 — SSH into the VM
ssh -i "C:\Users\anadi\Downloads\ssh-key-2026-04-17 (1).key" ubuntu@140.238.226.129

## Step 2 — Copy cleanup.py to VM
# Run this from your LOCAL machine (Git Bash / PowerShell):
scp -i "C:\Users\anadi\Downloads\ssh-key-2026-04-17 (1).key" cleanup.py ubuntu@140.238.226.129:/opt/jsukoon-api/cleanup.py

## Step 3 — Make it executable
chmod +x /opt/jsukoon-api/cleanup.py

## Step 4 — Check your config.json has these keys
cat /etc/jsukoon-api/config.json
# Must have:
# {
#   "supabase_url": "https://khpxgfadnnwycdhnyxye.supabase.co",
#   "supabase_service_key": "sb_secret_...",
#   "admin_user_id": "e47ac33d-9653-42a0-9eeb-53995577a740",
#   "toxicity_url": "http://127.0.0.1:5000/check_toxicity",   ← confirm your Flask route
#   "nsfw_url":     "http://127.0.0.1:5000/check_nsfw",       ← confirm your Flask route
#   "toxicity_threshold": 0.75,
#   "nsfw_threshold": 0.60
# }

## Step 5 — Dry-run test (run once manually)
python3 /opt/jsukoon-api/cleanup.py
# You should see: "Night Sweep started" and "Sweep complete — X/Y messages flagged"
# If 0 messages, that's fine — it means the last 35min were clean.

## Step 6 — Install cron job (runs every 30 min)
crontab -e
# Add this line:
*/30 * * * * /usr/bin/python3 /opt/jsukoon-api/cleanup.py >> /var/log/jsukoon-sweep.log 2>&1

## Step 7 — Create log file with correct permissions
sudo touch /var/log/jsukoon-sweep.log
sudo chown ubuntu:ubuntu /var/log/jsukoon-sweep.log

## Step 8 — Verify cron is running
# Wait 30-35 min, then:
tail -50 /var/log/jsukoon-sweep.log

## TROUBLESHOOTING

# Check if toxicity/nsfw Flask endpoints are alive:
curl -s -X POST http://127.0.0.1:5000/check_toxicity \
  -H "Content-Type: application/json" \
  -d '{"text": "you are so stupid and ugly"}'
# Expect: {"score": 0.XX}

# Check if Supabase connection works:
python3 -c "
import urllib.request, json
url = 'https://khpxgfadnnwycdhnyxye.supabase.co/rest/v1/khub_messages?limit=1'
key = open('/etc/jsukoon-api/config.json').read()
key = json.loads(key)['supabase_service_key']
req = urllib.request.Request(url, headers={'apikey': key, 'Authorization': 'Bearer '+key})
print(urllib.request.urlopen(req).read()[:200])
"

# If your Flask routes are named differently (e.g. /toxicity not /check_toxicity),
# update toxicity_url and nsfw_url in config.json accordingly.

## WHAT IT DOES (summary)
# Every 30 min:
#   1. Pulls all visible messages from last 35 min
#   2. Re-checks text toxicity (score >= 0.75 → flag)
#   3. Re-checks for blocked links (OnlyFans, .exe, unsanctioned Discord invites)
#   4. Re-checks image NSFW score (>= 0.60 → flag)
#   5. For each flagged message: hides it + issues a strike to the user
#      via khub_issue_strike(p_target_user_id, p_reason, p_issued_by, p_room_id)
#   6. Logs everything to /var/log/jsukoon-sweep.log
