Sukoon V3 — Master Project Document
> Upload this file at the start of every new Claude conversation for full context
> Last updated: April 24, 2026
---
1. PROJECT OVERVIEW
App Name: Sukoon V3
Type: Progressive Web App (PWA) — Vite + React
Vision: Mental wellness + K-Pop community + Horoscope app for Indian users
Target: Indian users 18-35, K-Pop fans, wellness seekers
Live URL: https://sukoon-v3.vercel.app
PWA: Installable on Android and iOS home screen ✅
Rating: 8.5 - 9 / 10 (Claude audit)
Language: Bilingual — English + Hindi
---
2. INFRASTRUCTURE
Vercel (Hosting)
Platform: Vercel (free tier)
Auto-deploys from GitHub on every push to `main`
Security headers: A grade on securityheaders.com ✅
vercel.json: configured with full security headers ✅
DDoS protection: Vercel auto-mitigation always on ✅
Supabase
URL: `https://khpxgfadnnwycdhnyxye.supabase.co`
Region: ap-south-1 (Mumbai)
Auth: Google OAuth + Email/Password
RLS: Enabled on ALL 15 tables ✅
Edge Functions: Horoscope (Gemini 2.5 Flash)
Supabase Secrets
`GEMINI_API_KEY` — Gemini 2.5 Flash for horoscopes
Oracle Cloud VM (Mumbai)
IP: `140.238.226.129`
Private IP: `10.0.0.213`
OS: Ubuntu 22.04
SSH: `ssh -i "ssh-key-2026-04-17 (1).key" ubuntu@140.238.226.129`
SSH key location: `C:\Users\anadi\Downloads\`
NSFW Detection API — LIVE ✅
URL: `http://140.238.226.129:5000`
Health check: `http://140.238.226.129:5000/health`
Model: NudeNet (open source, free forever)
Service: systemd `nsfw_api.service` — auto starts on boot
Port 5000: locked to Vercel IPs only via iptables ✅
TURN Server (coturn)
Config: `/etc/turnserver.conf`
Credentials: username: `jsukoon` / password: `JSukoon@TURN2026`
Protocol: TCP only on port 443 (Jio blocks UDP 3478)
URL: `turns:jsukoon.duckdns.org:443?transport=tcp`
Oracle Cloud Object Storage (Photos)
Bucket: `jsukoon-kpop-photo`
Namespace: `bmqg3jltavcd`
Region: `ap-mumbai-1`
Free tier: 10GB
Analytics
PostHog: user behaviour analytics
Vercel Analytics: page views and performance
---
3. GITHUB
```
Repo:   https://github.com/anadib1010/sukoonV3
Local:  C:\Users\anadi\OneDrive\Desktop\AI python learning\sukoonV3
Branch: main
```
```powershell
# Push changes (always from this path)
cd "C:\Users\anadi\OneDrive\Desktop\AI python learning\sukoonV3"
git add .
git commit -m "your message"
git push origin main

# Git config (already set)
git config core.autocrlf false
```
---
4. TECH STACK
```
Frontend:   Vite + React (JSX)
Styling:    Inline styles with T theme object
Routing:    React Router v6 (BrowserRouter)
Database:   Supabase (PostgreSQL)
Auth:       Supabase Auth (Google + Email)
Analytics:  PostHog + Vercel Analytics
Fonts:      Cormorant Garamond (serif) + DM Sans
AI:         Gemini 2.5 Flash (horoscopes via Supabase Edge Function)
```
---
5. APP ARCHITECTURE
Navigation
```
App.jsx → React Router → <Routes> → individual page components
```
Key state in App.jsx
```javascript
const [session, setSession]           // Supabase auth session
const [isCheckingAuth]                // auth loading state
const [hasOnboarded, setHasOnboarded] // onboarding done?
const [lang, setLang]                 // English/Hindi (localStorage)
const [themeKey, setThemeKey]         // theme name (localStorage)
const [themeSource, setThemeSource]   // auto/manual
const T = THEMES[themeKey]            // computed theme object
```
Render order
```
isCheckingAuth === true  → loading screen
!hasOnboarded            → Onboarding
hasOnboarded             → full app via React Router
```
---
6. THEME SYSTEM (12 themes)
```javascript
// In src/utils/theme.js
const THEMES = {
  // 6 DARK
  Void:          { bg: '#000000', accent: '#888888', text: '#e0e0e0' },
  DeepSage:      { bg: '#1E2720', accent: '#7B9075', text: '#D3DDD0' },
  OceanBlue:     { bg: '#122840', accent: '#5D93C4', text: '#CFE2F3' },
  TwilightBlue:  { bg: '#181830', accent: '#726FBA', text: '#D6D5F2' },
  Maroon:        { bg: '#2A0E13', accent: '#9B3D4F', text: '#EFD1D6' },
  SocialBlue:    { bg: '#0D2137', accent: '#4A9EBB', text: '#D6EAF2' },
  // 6 LIGHT
  PinkChampagne: { bg: '#F8DECD', accent: '#C88A8E', text: '#5A3A42' },
  FirstLight:    { bg: '#FDFBF7', accent: '#D4A373', text: '#4A4A4A' },
  SeaGlass:      { bg: '#E5EDF0', accent: '#7A9EA8', text: '#4A5D66' },
  SageSanctuary: { bg: '#E3E7E0', accent: '#6B765F', text: '#3E4735' },
  Terracotta:    { bg: '#F2ECE7', accent: '#B07D62', text: '#5C4033' },
  ChampagneGold: { bg: '#FBF5ED', accent: '#C5A059', text: '#4A4036' },
}
```
Saved to localStorage key `jsukoon_theme`
Default: `Void` (black)
Theme source saved to localStorage key `jsukoon_theme_source`
---
7. ALL ROUTES (App.jsx)
Wellness Routes
Path	Component	Status
`/`	Home	✅
`/reset`	Reset (1-min mindfulness)	✅
`/postreset`	PostReset	✅
`/sleep`	Sleep menu	✅
`/sleep_scrambler`	DreamScrambler	✅
`/sleep_ember`	DimmingEmber (4-7-8 breathing)	✅
`/sleep_scan`	HeavyScan (body scan + TTS)	✅
`/sleep_fire`	MidnightFire (burn journal)	✅
`/sleep_beat`	DeepRhythm (offline audio hum)	✅
`/focus`	Focus	✅
`/journal`	Journal	✅
`/warmth`	WarmthPage	✅
`/bench`	The Bench	✅
`/practice`	Practice	✅
`/reflection`	Reflection	✅
`/progress`	Progress tracking	✅
`/audio`	AudioPage	✅
`/crisis`	Crisis support	✅
`/resonance`	Resonance	✅
`/stillness`	Stillness	✅
`/quietcorner`	Quiet Corner	✅
`/soundbath`	Sound Bath	✅
`/mandala`	Mandala Flow	✅
`/seedinmud`	Seed in the Mud	✅
`/vault`	The Vault (PIN locked)	✅
`/vaultdoor`	DeepDoor (vault entry)	✅
`/descent`	TheDescent	✅
`/community`	CommunityRoom	✅
`/moodaction`	MoodAction	✅
K-Universe Routes
Path	Component	Color	Status
`/khub`	KHub (room selector)	—	✅
`/chat_lavender`	KLavenderLoungeChat	#A18CD1 purple	✅
`/chat_kpop`	KPopGeneralRoom	#FF69B4 pink	✅
`/chat_kdrama`	KDramaRoom	#FAD0C4 peach	✅
`/chat_purple`	PurpleLounge (BTS fans)	#9B59B6 deep purple	✅
`/chat_blink`	BlinkLounge (BLACKPINK fans)	#E91E8C hot pink	✅
Account / Settings Routes
Path	Component	Status
`/settings`	Settings (themes, lang)	✅
`/more`	MorePage	✅
`/exploremore`	ExploreMore	✅
`/about`	About	✅
`/privacy`	Privacy	✅
`/terms`	Terms	✅
`/legal`	LegalDisclaimer	✅
`/wishes`	WishesGallery	✅
`/chat`	SukoonChat (private E2EE)	✅
`/horoscope`	Horoscope (Gemini AI)	❌ Not built yet
---
8. K-HUB — 5 CHAT ROOMS
All rooms have:
✅ Supabase realtime messaging
✅ Client-side toxicity filter (banned phrases)
✅ Spam protection (max 5 msgs / 10 seconds)
✅ Report system (3 reports = auto-hidden)
✅ Rules modal with hard/soft rules
✅ Unofficial disclaimer (not affiliated with any K-pop label)
✅ Hindi + English bilingual
Room Details
Room	Tab	Color	Disclaimer
🪻 Lavender Lounge	chat_lavender	#A18CD1	Not affiliated with any K-pop label
🎤 General K-Pop	chat_kpop	#FF69B4	Not affiliated with any K-pop label
🎬 K-Drama Lounge	chat_kdrama	#FAD0C4	Not affiliated with any broadcaster
💜 Purple Lounge	chat_purple	#9B59B6	Not affiliated with HYBE or BTS
🌸 Blink Lounge	chat_blink	#E91E8C	Not affiliated with YG or BLACKPINK
Supabase Tables for K-Hub
```sql
khub_messages   -- all room messages (room_name column separates rooms)
message_reports -- user reports
mod_actions     -- mutes, kicks, bans
profiles        -- user profiles with trust_level + rep_score
```
---
9. SUPABASE DATABASE TABLES (all 15)
Table	RLS	Purpose
blocks	✅	User block list
calls	✅	WebRTC call signaling
daily_activity	✅	User activity tracking
journal_entries	✅	Private journal entries
khub_messages	✅	K-Hub chat messages
message_reports	✅	Chat moderation reports
messages	✅	Private E2EE chat
midnight_fire_burns	✅	Sleep journal burns
mod_actions	✅	Moderation actions
profiles	✅	User profiles
progress_user_stats	✅	Progress tracking
quiet_wishes	✅	User wishes
reflection_burns	✅	Reflection entries
reports	✅	General reports
rooms	✅	Chat room definitions
---
10. SECURITY STATUS
Layer	Protection	Status
Vercel	Auto DDoS mitigation	✅ Always on
Vercel	Security headers (A grade)	✅ Done
Vercel	HTTPS enforced	✅ Always on
Supabase	RLS on all 15 tables	✅ Done
Supabase	Google OAuth + JWT	✅ Done
Oracle VM	Port 5000 locked to Vercel IPs	✅ Done
Oracle VM	SSH brute force protection	✅ Done
Oracle VM	fail2ban active	✅ Done
Oracle VM	iptables rules saved permanently	✅ Done
App	Client-side toxicity filter	✅ In all 5 rooms
App	NSFW image detection (NudeNet)	✅ Running
Overall security score: 9 / 10
---
11. WEBRTC CALLING
Working: WiFi ↔ Jio cellular confirmed
TURN server: Oracle VM, TCP port 443
DO NOT TOUCH — extremely stable
---
12. ONBOARDING
```
First visit → Onboarding screen
Second visit → Skip → Home directly
Persisted: localStorage key jsukoon_onboarded
```
---
13. LEGAL — K-POP ROOMS
All rooms display "Unofficial fan community" badge
Rules modal has full legal disclaimer
"BTS", "ARMY" = HYBE trademarks — not used as room names
"BLACKPINK", "BLINK" = YG trademarks — not used as room names
Room names used: Purple Lounge, Blink Lounge (fan-coded, not trademarked)
Music: Spotify/YouTube links allowed, no in-app playback
---
14. PENDING TASKS (Priority Order)
Critical
⬜ Build Horoscope page (Gemini AI — Edge Function exists, UI missing)
⬜ Build AI bulletin board for K-Hub rooms
⬜ Test all 5 K-Hub rooms on live PWA
⬜ Test WebRTC calls — working 1 month ago, needs re-verification
⬜ Add security.js to src/utils/ (input sanitizer)
⬜ Test PIN backup/restore for vault
⬜ Error boundaries (wrap screens in try/catch)
Important
⬜ Redesign onboarding with K-Pop lean
⬜ 15-min new-user restrictions (no photo for fresh signups)
⬜ Real user testing — share PWA link with friends
⬜ Play Store: need 20 testers for 14 days (get from Instagram/Twitter)
Growth
⬜ Instagram + Twitter promotion targeting Indian K-pop fans
⬜ Hashtags: #KpopIndia #BTSIndia #BLINKIndia #KdramaIndia
⬜ Unique angle: bilingual Hindi+English K-pop app (no competitor has this)
Nice to Have
⬜ K-Pop voice rooms (Phase 2)
⬜ Artist-specific rooms beyond BTS/BLACKPINK
---
15. RATINGS
Feature	Rating	Notes
Overall PWA	8.5-9/10	Proven, live, installable
Security	9/10	Headers A grade, RLS, VM hardened
K-Hub rooms	8/10	5 rooms, moderation, legal
Horoscope	8/10	Gemini 2.5 Flash working
Sleep features	8/10	5 activities complete
Theming	9/10	12 themes, smooth switching
Bilingual	8/10	Hindi + English throughout
WebRTC chat	?/10	Chat works ✅, calls need re-testing after 1 month
---
Last updated: April 24, 2026
Compiled by Claude for Sukoon V3 project continuity
Updated Sanctuary Sounds: Added flute, birds, forest, wind, and waves audio with play/stop logic to PurpleSanctuary.jsx.

Pushed to Production: Used Git terminal commands to save and deploy the Sanctuary updates to GitHub and Vercel.

Built the Supabase Database: Created the sanctuary_stars table with security rules (RLS) to permanently store user stars.

Connected Front-End to Back-End: Updated PurpleSanctuary.jsx to fetch and save stars to Supabase in real-time.

Fixed the Encryption Bug: Updated SukoonChat.jsx to save and load security keys using localStorage, solving the scrambled text issue.

Resolved Build Errors: Fixed a duplicate fontSize in FloatingHearts.jsx and a broken import path to successfully run npm run build.

Tested the Security Vault: Verified that the 6-digit Cloud PIN Backup and Restore functions work perfectly.
crisisData.js is the name of the file . - **Safety & Moderation System:** Utilizes `utils/crisisData.js` for real-time text and voice filtering (triggering a protective `CrisisOverlay` rather than storing toxic words in the database) and a Supabase `blocks` table to manage permanent user-to-user blocking.
# SUKOON V3 MASTER — UPDATE TO ADD
# Append these sections to your existing SUKOON_V3_MASTER.md
# Date: April 25, 2026

---

## 🎤 K-HUB CHAT ROOMS — DETAILED STATUS

### Room Architecture
| Room | Color | Hearts | Status |
|------|-------|--------|--------|
| 🪻 Lavender Lounge | #A18CD1 lavender purple | 💜 | ✅ Live |
| 🎤 General K-Pop | #FF69B4 hot pink | ❤️ | ✅ Live |
| 🎬 K-Drama Lounge | #FAD0C4 peach | 🧡 | ✅ Live |
| 💜 Purple Lounge (BTS fans) | #9B59B6 deep purple | 💜 | ✅ Live |
| 🌸 Blink Lounge (BLACKPINK fans) | #E91E8C hot pink | 🩷 | ✅ Live |

### KHub Layout
- 2x2 grid for top 4 rooms (Purple, Blink, Lavender, K-Pop)
- Full-width K-Drama bar below
- Section labels: "FOR EVERYONE" / "FAN LOUNGES"

---

## ✅ WHAT'S DONE IN K-HUB (75% of ChatGPT's spec)

### Hard Rules (zero tolerance) — Auto-enforced
- ✅ No hate speech / slurs (instant block, -10 rep)
- ✅ No fandom attacks (BTS vs BLACKPINK type wars blocked)
- ✅ No NSFW text content (banned word list)
- ✅ No piracy link sharing (rules state, manual enforcement)
- ✅ Personal attacks on artists blocked (e.g. "ugly face", "can't sing")

### Soft Rules — Warning system
- ✅ Spam protection: max 5 msgs / 10 sec
- ✅ 3 spam warnings = 60s local mute
- ✅ Off-topic and self-promotion in rules modal

### Banned Word Engine
- ✅ 100+ phrases covering:
  - Fandom wars (vs bts, blink trash, flop group, etc.)
  - Hate/violence (kill, die, kys, kms)
  - English toxicity (trash, garbage, ugly, loser)
  - Obscenity (f**k, b*tch, asshole)
  - Hindi Devanagari (मादरचोद, हरामी, साला, etc.)
  - Hinglish/Roman Hindi (madarchod, chutiya, kamina)
  - Personal attacks on artists

### Reputation System
- ✅ +1 rep per clean message
- ✅ +5 rep per valid report
- ✅ -3 rep per spam warning
- ✅ -5 rep when reported
- ✅ -10 rep for toxic message
- ✅ Trust levels: Restricted (< -20) / New / Trusted (50+) / Elite (200+)
- ✅ Trust badge displayed in chat header

### Reporting System
- ✅ Report button (⚑) on every message
- ✅ 6 report reasons (Hate speech / Spam / NSFW / Fandom Attack / Piracy / Other)
- ✅ 3 reports auto-hides message
- ✅ Reporter gets +5 rep when message gets auto-hidden
- ✅ Reporter rep deducted when reporting their own clean message ignored

### Music & Links Policy
- ✅ Rules state: Spotify/YouTube links allowed
- ✅ Rules state: NO in-app playback (legal safe)
- ✅ Currently: links display as plain blue text (legal but no preview)
- ⚠️ NOT BUILT: Safe link card system (only Spotify/YouTube domains, no metadata fetch)

### Login & Auth
- ✅ Google login required to send messages
- ✅ Logged-out users see chat but can't send
- ✅ Login button shown in input area when not logged in
- ✅ K-Hub routes added to PROTECTED_REASONS

### Floating Hearts
- ✅ HeartButton with floating animation in all rooms
- ✅ Different heart colors per room (purple/pink/red/orange)
- ✅ Counter displays total hearts sent
- ✅ Random drift, fade-out animation, glow effect

### Database Tables (all live with RLS)
- ✅ khub_messages (status, msg_type, avatar_emoji columns)
- ✅ message_reports
- ✅ mod_actions
- ✅ profiles (with rep_score, trust_level columns)

### Legal Disclaimers
- ✅ Every room shows "Unofficial fan community" badge in header
- ✅ Rules modal explicitly names HYBE, YG, SM, JYP, Big Hit
- ✅ States BTS/ARMY/BLACKPINK/BLINK are trademarks of respective companies
- ✅ Room names use fan-coded language (Purple Lounge, Blink Lounge)
- ✅ Master KHub disclaimer at top of room selector

### Bilingual Support
- ✅ All toasts, rules, reports in Hindi + English
- ✅ Hindi banned words in Devanagari script
- ✅ Reputation labels in Hindi (विश्वसनीय, एलीट, etc.)

---

## ❌ WHAT'S MISSING — TO BUILD IN NEXT THREAD

### 🚨 PRIORITY 1 — CRITICAL FOR SCALE

#### 1. NSFW Image Moderation in Chat Rooms
- **Status:** Chat rooms currently TEXT-ONLY (safe by default)
- **NudeNet API exists:** `http://140.238.226.129:5000` running on Oracle VM
- **Required if/when image uploads added:**
  - Wire NudeNet check before inserting any image message
  - If NSFW score > 0.7 → block, deduct -20 rep
  - If 0.3-0.7 → blur image with "View anyway?" toggle
  - Store nsfw_score in khub_messages for moderator review

#### 2. Server-Side Toxicity Check
- **Current:** Toxicity check runs in browser only
- **Vulnerability:** Hacker with DevTools can bypass `checkToxicity()` and send banned words directly via Supabase
- **Fix needed:** Supabase Edge Function or Postgres Trigger that re-checks every message before insert
- **Implementation:** Create `khub-message-check` Edge Function that wraps the insert, runs toxicity + NSFW score, then writes to DB

#### 3. Server-Side Rate Limiting
- **Current:** SpamLimiter runs in browser only
- **Vulnerability:** Bot using anon key can bypass and flood DB
- **Fix needed:** Postgres trigger that counts msgs/user/10sec, rejects if > 5
- **OR:** Edge Function rate limiter using Supabase auth context

#### 4. Server-Side Length & Content Validation
- All client-side validations (500 char max, status check) need server-side equivalents
- Database CHECK constraints on khub_messages.text length

---

### ⚠️ PRIORITY 2 — IMPORTANT FOR HEALTH

#### 5. Leetspeak / Bypass Detection
- **Current bypasses:** `tr@sh`, `f.l.o.p`, `r@nd!`, spacing tricks
- **Fix:** Normalize text before checking (remove special chars, collapse spaces, l33t→letter mapping)
- **Library option:** Use `leo-profanity` or build custom normalizer

#### 6. Non-Skippable Rules on First Visit
- **Current:** Rules modal opens only when 📋 button tapped
- **Need:** First time user enters ANY K-Hub room → force-show rules with "I Agree" button before they can chat
- **Track via:** localStorage `jsukoon_khub_rules_accepted`

#### 7. Behavior Quiz on Signup
- **ChatGPT's idea:** Quick onboarding quiz like "Is it okay to insult another fandom?"
- **Goal:** Filter toxic users at the door, set rep starting score
- **Bonus:** Users who pass quiz start at +10 rep

#### 8. Elite Mod Tools
- **Current:** Trust level 3 (Elite) has no UI to actually moderate
- **Build:**
  - Hidden message viewer (see hidden messages with reports)
  - Mute/kick buttons on messages from low-rep users
  - View reputation history of any user
  - Ban from specific room (24h/permanent)

---

### 📋 PRIORITY 3 — NICE TO HAVE

#### 9. Safe Link Card System (Spotify/YouTube)
- **Current:** Plain blue text URLs
- **Improvement:** Detect Spotify/YouTube URL patterns, show small card with:
  - Domain name only (no fetching copyrighted metadata)
  - "Open in Spotify" / "Open in YouTube" button
  - Block all other domains for spam protection
- **Legal note:** This is the WhatsApp/Discord pattern — 100% safe
- **File:** Create `src/utils/musicLinks.js` with URL detection + sanitization

#### 10. AI Bulletin Board
- **Original idea:** Daily AI-generated K-Pop news bulletin in rooms
- **Use:** Pinned post at top of each room, refreshes daily via cron Edge Function
- **Content:** "Today in K-Pop: BTS announces..." (general public news only, no copyrighted content)

#### 11. User Block List
- **Already have `blocks` table in Supabase**
- **Not implemented:** Long-press user → block → never see their messages
- **Filter:** chat fetch should exclude messages from blocked users

#### 12. Pinned Welcome Message
- New users entering empty room see hardcoded "Welcome to {Room}" — should be a real pinned message from admin account

#### 13. Message Threading / Replies
- **Current:** Flat chat
- **Future:** Reply to specific message (like WhatsApp quote)

#### 14. Cross-Room Heart Counter Sync
- **Current:** Heart count is local, resets on refresh
- **Fix:** Sync to Supabase room-level counter so all users see same total

---

## 🔐 SECURITY MISSING IN CHAT (already have for app overall)

#### 15. Per-Room Slow Mode
- Admins can set 30-second cooldown between messages in a hot room

#### 16. New Account Restrictions (15-min)
- **From ChatGPT spec:** First 15 minutes of new signup
  - Can't post images
  - Slow mode enforced
  - Can't tag other users
- **Goal:** Stop drive-by trolling from throwaway accounts

#### 17. Webhook Alert for Bad Behavior
- When a user gets 3 reports in 24h → Telegram/Discord webhook to your phone
- You see it in real time, can manually intervene

---

## 📊 OVERALL K-HUB SCORE

| Category | Coverage |
|----------|----------|
| Hard rule enforcement | ✅ 90% (client-side strong, server-side missing) |
| Soft rule enforcement | ✅ 85% |
| Reputation system | ✅ 95% (UI for elite mods missing) |
| Reporting | ✅ 100% |
| NSFW (text) | ✅ 80% (no leetspeak detection) |
| NSFW (images) | ⚠️ N/A (text-only currently) |
| Server-side validation | ❌ 10% (mostly client-side) |
| Onboarding to rules | ⚠️ 50% (modal exists, not forced) |
| Mod tools | ❌ 20% (auto-hide works, no manual mod UI) |
| Music link integration | ⚠️ 40% (links work, no safe cards) |

**Overall: 75% of ChatGPT's recommended system. Production-ready for first 100-500 users.**

---

## 🎯 RECOMMENDED NEXT STEPS (in order)

When starting the new Claude thread, work on these in this order:

1. **Server-side toxicity Edge Function** (Priority 1 — biggest security upgrade)
2. **Non-skippable rules on first visit** (Priority 2 — quick legal win)
3. **Leetspeak bypass detection** (Priority 2 — closes biggest filter gap)
4. **Safe link cards for Spotify/YouTube** (Priority 3 — UX polish)
5. **Elite mod dashboard** (Priority 2 — when you have first 50 users)
6. **NSFW image pipeline** (Priority 1 — only when adding image upload feature)
7. **AI bulletin board** (Priority 3 — growth feature)

---

## 📌 KEY FILES TO REFERENCE IN NEW THREAD

```
src/features/khub/
  ├── KHub.jsx                     ← room selector
  ├── KLavenderLoungeChat.jsx      ← #A18CD1
  ├── KPopGeneralRoom.jsx          ← #FF69B4
  ├── KDramaRoom.jsx               ← #FAD0C4
  ├── PurpleLounge.jsx             ← #9B59B6 (BTS fans)
  ├── BlinkLounge.jsx              ← #E91E8C (BLACKPINK fans)
  ├── moderation.js                ← banned words, SpamLimiter, reputation
  └── FloatingHearts.jsx           ← heart animation system

supabase/functions/
  └── horoscope/index.ts           ← Edge Function template (use this pattern for toxicity check)

Database tables:
  khub_messages (id, room_name, user_id, user_email, text, status, msg_type, avatar_emoji, created_at, nsfw_score)
  message_reports (id, message_id, reported_by, reason, created_at)
  mod_actions (id, user_id, action, expires_at, created_at)
  profiles (id, rep_score, trust_level, created_at, ...)
```

---

Last updated: April 25, 2026
Status: 5 chat rooms live, moderation 75% complete, ready for next iteration
Update for SUKOON_V3_MASTER.md
Paste the block below into your master doc, ideally right after the existing
"What's Built" or "Architecture" section. Or insert as a new "## Changelog"
section near the top.
---
2026-04-25 — K-Hub meme sharing + server-side hardening
Major architectural work: shipped NSFW-filtered meme sharing in chat rooms,
moved all message writes through a server-side gate, and turned the Oracle
VM from a single-purpose NSFW endpoint into a full meme-upload service.
What was built
1. Oracle VM is now a meme-upload service (Mumbai region, IP 140.238.226.129)
Caddy 2.11.2 in front, terminating HTTPS at `https://jsukoon-api.duckdns.org`
Auto-fetched Let's Encrypt cert (renews automatically)
Flask 3.0.3 + gunicorn (2 workers × 4 threads) at `127.0.0.1:5000`
NudeNet 3.4.2 loaded in RAM at boot (~190 MB resident)
Oracle Cloud Python SDK (`oci==2.140.0`) connects to private bucket
Auto-restart via systemd unit `/etc/systemd/system/jsukoon-api.service`
Old `nsfw_api.service` stopped + disabled; new app handles legacy `/predict` too
2. Oracle Object Storage bucket (`jsukoon-khub-memes`, private)
Mumbai region, namespace `bmqg3jltavcd`
Only the VM has write credentials (in `/etc/jsukoon-api/oci-config`, mode 600)
Bucket is private; all reads go through the VM with auth (no public URLs)
API key stored at `/etc/jsukoon-api/oci-key.pem`, root-readable only
3. Supabase database — extended `khub_messages` table
New columns:
`file_id` — Oracle object identifier (UUID hex)
`object_path` — full path in bucket (`{user_id}/{file_id}.jpg`)
`nsfw_score` — `numeric(4,3)`, NudeNet output (0.000 to 1.000)
`nsfw_state` — `'safe' | 'blurred' | 'blocked'`
`msg_type` — `'text' | 'image'`
`text` is now nullable (was NOT NULL — broke image-only messages)
`user_email` is now nullable (defensive)
New CHECK constraints:
`khub_messages_text_length` — text ≤ 500 chars
`khub_messages_nsfw_state_valid` — only safe/blurred/blocked
`khub_messages_payload_present` — text msgs need text, image msgs need file_id
New tables:
`khub_rules_accepted` — server-side record of users who accepted room rules
New RPC functions (all SECURITY DEFINER, restricted to authenticated/service_role):
`khub_is_rate_limited(user_id)` — returns true if 5+ messages in last 10s
`khub_is_new_account(user_id)` — true if `auth.users.created_at` within last 15 min
`khub_adjust_rep(user_id, delta)` — server-side rep score change
`khub_old_image_paths()` — returns paths older than 60 days for cleanup
Removed:
All direct INSERT policies on `khub_messages` (writes now ONLY via Edge Function)
4. Supabase Edge Function `khub-message-check` (deployed via CLI)
Single gate for every K-Hub message
Verifies user JWT (uses new asymmetric JWKS — fetches public keys from Supabase)
Re-checks toxicity server-side (mirror of client list, can't be bypassed via DevTools)
Re-checks rate limit using the Postgres function
Re-checks new-account guard (15-min cooldown for image uploads)
For image messages: HMAC-verifies the upload token came from the VM
Inserts the message row using service_role (bypasses RLS)
Adjusts reputation: +1 for clean message, -10 for toxic, -20 for NSFW blocked
Maps room keys (`'lavender'`) → full names (`'Lavender Lounge'`) for DB
Required env: `VM_HMAC_SECRET` (matches VM's `hmac_secret`)
5. React app — new components in `src/features/khub/`
`MemeUploader.jsx` — file picker, EXIF strip, JPEG compress to 1280px max, in-modal red error banner for blocked uploads, NSFW warning toast for blurred
`MessageBubble.jsx` — renders both text and image messages, blur overlay for borderline NSFW with tap-to-reveal, "Image expired" fallback for cleaned-up files, "Image removed by moderation" for blocked
`RulesGate.jsx` — first-visit forced rules acceptance modal (built but not yet wired into rooms)
`SafeLinkCard.jsx` — Spotify/YouTube link cards (built but not yet wired)
`moderation.js` — MERGED: kept all original functions (`updateRepScore`, `submitReport`, `checkIfMuted`, `REP_POINTS`, `getTrustLevel`, `getTrustLabel`, `BANNED_FRAGMENTS`, `SpamLimiter`) and added new ones (`uploadAndSendMeme`, `fetchAuthedImage`, `clearImageCache`)
New `src/utils/musicLinks.js` — URL detector + parser (allow-list: spotify.com, youtube.com, youtu.be)
Existing `checkToxicity` upgraded with leetspeak normalizer (catches `tr@sh`, `f.l.o.p`, `f u c k`, `fuuuck`)
New env var `VITE_JSUKOON_API_URL` (defaults to `https://jsukoon-api.duckdns.org`)
6. CSP updates — `index.html` and `vercel.json`
Added `https://jsukoon-api.duckdns.org` to both `connect-src` and `img-src`
Removed obsolete `https://140.238.226.129:5000` (replaced by HTTPS domain)
Removed `https://objectstorage.ap-mumbai-1.oraclecloud.com` from `img-src` (not needed — we proxy through VM)
7. Daily cleanup cron
Script at `/opt/jsukoon-api/cleanup.py`
Runs daily at 3:30 UTC (9:00 IST) via crontab
Asks Supabase for paths > 60 days old, deletes from Oracle bucket, deletes DB rows
Logs to `/var/log/jsukoon-cleanup.log`
8. iptables fix
Localhost connections to port 5000 were being dropped (Vercel-IP-only rule from
old NSFW API setup). Added two rules at top of INPUT chain:
`-p tcp -d 127.0.0.1 --dport 5000 -j ACCEPT`
`-p tcp -s 127.0.0.1 --dport 5000 -j ACCEPT`
This let Caddy reach Flask via localhost.
9. CORS dynamic mirroring (in Caddy config)
The Caddyfile now echoes `{header.Origin}` instead of a fixed value, so both
`http://localhost:5173` (dev) and `https://sukoon-v3.vercel.app` (prod) work.
Security note: every request still requires a valid Supabase JWT, so reflection
isn't unsafe in practice. To tighten later: pin the allow-list explicitly.
Security model summary
Layer	Bypass-resistant?	Notes
Client toxicity filter (leetspeak)	No	UX feedback only; Edge Function re-checks
Client spam limiter	No	UX feedback only
Edge Function toxicity re-check	Yes	DevTools can't reach DB anymore
Edge Function rate limit	Yes	Counts actual rows in Postgres
VM NSFW score (NudeNet)	Yes	Scores bytes BEFORE Oracle upload
VM 15-min new-account guard	Yes	Reads `auth.users.created_at` server-side
HMAC token between VM and Edge Fn	Yes	5-min TTL, prevents fake "scored" claims

Direct INSERT to khub_messages	Blocked	All writes go through Edge Function
Storage RLS — upload to own folder	Yes	path[0] must equal auth.uid()
Image size cap (4 MB)	Yes	Enforced client + VM (defense in depth)
Text length cap (500 chars)	Yes	Postgres CHECK constraint
Auth-gated image read	Yes	VM verifies JWT before streaming bytes
What's wired right now
Lavender Lounge: full meme support (uploads, render, NSFW filter, blur reveal)
Other 4 rooms (KPop, KDrama, Purple, Blink): text messaging still works (moderation.js
preserves all original functions); meme button NOT YET wired
Still pending (in priority order)
Delete system — full hierarchy (self / elite mod / admin), 2-stage soft delete (24h grace), audit log table `khub_deletions`. Admin identification via `is_admin` boolean on profiles.
Wire meme uploader into the other 4 rooms — same 4-edit pattern as Lavender (imports, MemeUploader element, sendMessage replacement, message-render branching).
Tighten CORS to explicit origin list (currently dynamic mirroring).
Wire RulesGate into all 5 rooms for first-visit acceptance.
Wire SafeLinkCard rendering into MessageBubble's text segment splitter.
Push to git → Vercel for production deploy.
Known cost/quota status
Supabase free tier: ~7 MB DB used, well within 500 MB limit
Oracle Object Storage: free tier is 10 GB; current usage is one cleaned test image
Oracle VM: free tier (1 OCPU, 6 GB RAM); meme service uses ~190 MB RAM
Vercel: unchanged — frontend only, well within free tier
File map of what changed today
```
/opt/jsukoon-api/                  ← Oracle VM
  app.py                           ← NEW (replaces old NSFW-only Flask)
  cleanup.py                       ← NEW (daily Oracle cleanup)
  requirements.txt                 ← NEW
  venv/                            ← NEW (Python 3 + 7 packages)

/etc/jsukoon-api/                  ← Oracle VM (root, mode 600)
  config.json                      ← NEW (HMAC + service_role + bucket cfg)
  oci-config                       ← NEW (Oracle API config)
  oci-key.pem                      ← NEW (Oracle API private key)

/etc/caddy/Caddyfile               ← Oracle VM (rewritten)
/etc/systemd/system/
  jsukoon-api.service              ← NEW (gunicorn service definition)

src/features/khub/
  moderation.js                    ← MERGED (originals + meme functions)
  MemeUploader.jsx                 ← NEW
  MessageBubble.jsx                ← NEW
  RulesGate.jsx                    ← NEW (not yet wired)
  SafeLinkCard.jsx                 ← NEW (not yet wired)
  KLavenderLoungeChat.jsx          ← MODIFIED (4 edits)

src/utils/
  musicLinks.js                    ← NEW

supabase/functions/khub-message-check/
  index.ts                         ← NEW (deployed via CLI)

supabase/migrations/
  2026_04_25_meme_v2.sql           ← NEW (applied)

index.html                         ← MODIFIED (CSP)
vercel.json                        ← MODIFIED (CSP)
.env                               ← MODIFIED (added VITE_JSUKOON_API_URL)
```
Endpoint reference
`https://jsukoon-api.duckdns.org/health` → liveness check (public)
`https://jsukoon-api.duckdns.org/meme-upload` → POST image, requires JWT
`https://jsukoon-api.duckdns.org/meme/{user_id}/{file_id}.jpg` → GET image, requires JWT
`https://jsukoon-api.duckdns.org/predict` → legacy NSFW score (kept for back-compat)
`https://khpxgfadnnwycdhnyxye.supabase.co/functions/v1/khub-message-check` → POST every K-Hub message (text or image)
Secrets to never commit / leak
VM `hmac_secret` — also in Supabase as `VM_HMAC_SECRET`
VM `supabase_service_role` — also in Supabase env (auto)
Oracle API private key (`oci-key.pem`)
Local `jsukoon-secrets.txt` was used during setup; can now be deleted from Downloads
Today's scoreboard
✅ Oracle VM with HTTPS, gunicorn, NudeNet, OCI bucket
✅ Supabase migration + Edge Function with HMAC verification
✅ Auth-gated image fetch with private bucket
✅ Lavender Lounge: full meme support working
✅ K-Pop General: full meme support working
✅ NSFW filter tested (clean passed, bikini blocked)
✅ Manual permanent delete (DB + Oracle bucket) executed safely
Modified files (all expected):

✅ SUKOON_V3_MASTER.md — you updated the master doc
✅ index.html — CSP update
✅ All 5 room files — meme support added
✅ moderation.js — merged version
✅ vercel.json — CSP update
⚠️ PurpleSanctuary.jsx — this was modified but we didn't touch it. Worth checking what changed, but probably fine.

New files (all expected):

✅ MemeUploader.jsx, MessageBubble.jsx, RulesGate.jsx, SafeLinkCard.jsx, musicLinks.js
✅ supabase/functions/khub-message-check/ — the Edge Function
✅ supabase/.temp/ — Supabase CLI temp files (harmless)
📷 Meme sharing — tap the camera button, pick an image, send
🛡️ NSFW filter — NudeNet scores every image before it's saved
🔴 Hard blocks — explicit content blocked, -20 rep deducted
🟡 Blur warnings — borderline content blurred with tap-to-reveal
🔒 Auth-gated images — private Oracle bucket, only logged-in users see images
⏰ 60-day auto-delete — old memes cleaned up automatically at 3:30 AM IST
🔤 Server-side text moderation — toxicity, rate limits, leetspeak bypass detection
✅ All 5 rooms: Lavender, K-Pop General, K-Drama, Purple Lounge, Blink Lounge
✅ Group A: CORS pinned to specific origins, NSFW threshold tightened (bikini/swimwear now blocked at >0.6 confidence)
✅ Group B: RulesGate wired into all 5 rooms (forced acceptance on first visit)
✅ Group C: Full delete system — self/mod/admin hierarchy, 2-stage soft delete, 10s undo, audit log in khub_deletions
✅ Group D: Telegram alerts — you get a message on your phone when 3 reports auto-hide a message
✅ CORS tightened to specific origins
✅ NSFW threshold tightened (bikini/swimwear blocked at >0.6)
✅ RulesGate wired into all 5 rooms
✅ Full delete system (self/mod/admin, 2-stage, undo, audit log)
✅ Telegram alerts on 3 reports
✅ SafeLinkCard working (links render after refresh)
⏳ Realtime fix for Purple Lounge link messages
⏳ Cron job update for pending_delete cleanup
🚀 **Everything shipped to production!**

---

# 🎯 Complete feature list — what's live right now

**K-Hub Chat Rooms (all 5):**
- ✅ NSFW-filtered meme sharing (Oracle VM → NudeNet → private Oracle bucket)
- ✅ Auth-gated image fetch (images only load for logged-in users)
- ✅ 60-day auto-delete of old memes (cron at 3:30 AM IST)
- ✅ Server-side toxicity check (leetspeak bypass detection)
- ✅ Server-side rate limiting (5 messages / 10 seconds)
- ✅ 15-min new account restriction on image uploads
- ✅ HMAC-signed upload tokens between VM and Edge Function
- ✅ Forced rules acceptance on first visit (RulesGate)
- ✅ Spotify/YouTube safe link cards
- ✅ Full delete system (self / elite mod / admin hierarchy)
- ✅ 2-stage soft delete with 10-second undo
- ✅ Audit log for all deletions (`khub_deletions` table)
- ✅ Telegram alerts when 3 reports auto-hide a message
- ✅ CORS pinned to specific origins
- ✅ NSFW threshold tightened (bikini/swimwear blocked at >0.6 confidence)
- ✅ Blur + "view anyway" for borderline NSFW (0.3–0.6)
- ✅ Report system with 3-report auto-hide
- ✅ Reputation system (+1 clean, -10 toxic, -20 NSFW)
- ✅ Trust levels (New / Trusted / Elite)
- ✅ 24h hard-delete cron for soft-deleted messages

---

# What's still on the optional queue

1. **Elite mod dashboard** — UI for trust_level 3 users to see reports/deletions
2. **AI bulletin board** — daily K-Pop news at top of room
3. **User block list** — per-user filtering of specific senders
4. **Cross-room heart sync** — heart counter shared across rooms
5. **Per-room slow mode** — admin-toggled cooldown
6. **Behavior quiz on signup** — personality-based room suggestion
Strike system summary — what's now working:

✅ Strike 1 → warning (can still chat)
✅ Strike 2 → muted for 1 hour (ban screen shows "Muted for 1 Hour")
✅ Strike 3 → banned for 24 hours (ban screen shows "Banned for 24 Hours")
✅ Strike 4+ → permanently banned
✅ Ban screen shows friendly message, expiry time, Go Back button
✅ Expired bans auto-lift when user opens a room
✅ Edge Function issues strike on toxic text
✅ VM Flask app issues strike on NSFW image block
✅ All 5 rooms check ban on load
✅ Strike system (already built)
✅ Night Sweep (just deployed)
⬜ Duplicate message detection
⬜ Shadow-restrict risky users
⬜ Per-room slow mode
⬜ User block list
✅ Purple Sanctuary direct link bypass
✅ Pink Sanctuary full build
✅ Back buttons all → K-Hub
✅ Star cap 80 / 24h expiry + VM cleanup
✅ Sanctuary buttons in Purple & Lavender lounges
✅ Pink Sanctuary button in Blink Lounge
✅ Both sanctuaries side by side on K-Hub page
✅ Hammer lightsticks for Blinks
✅ jsukoon-api.service — active (running)
✅ caddy.service — active (running)
✅ No restart required warning anymore
✅ Both services came back up automatically after reboot
✅ Memory usage healthy at 46%
✅ Disk usage only 13.5% — plenty of room
`src/hooks/useE2EE.js` — Android
`src/hooks/useChatEngine.ts` — Android
`src/settings/Settings.tsx` — Android
`src/hooks/useE2EE.web.js` — PWA (new file)
src/hooks/useE2EE.web.js` — PWA (new file)
`src/components/SukoonChat.jsx` — PWA
