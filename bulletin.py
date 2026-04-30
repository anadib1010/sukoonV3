#!/usr/bin/env python3
"""
JSukoon K-Hub - Daily AI Bulletin Generator (bulletin.py)
Uses Gemini 2.0 Flash with Google Search grounding.
Single API call generates all 5 room bulletins at once.
Cron: 30 2 * * * /usr/bin/python3 /opt/jsukoon-api/bulletin.py >> /var/log/jsukoon-bulletin.log 2>&1
"""

import json
import urllib.request
import logging
import sys
import random
from datetime import datetime, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [BULLETIN] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
log = logging.getLogger("bulletin")

cfg          = json.load(open("/etc/jsukoon-api/config.json"))
SUPABASE_URL = cfg["supabase_url"]
SUPABASE_KEY = cfg["supabase_service_key"]
GEMINI_KEY   = cfg["gemini_api_key"]
GEMINI_URL   = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_KEY

ROOMS = [
    {
        "room_name":  "Lavender Lounge",
        "fandom":     "BTS",
        "emoji":      "purple heart",
        "disclaimer": "Fan bulletin - Not affiliated with HYBE, BigHit Music, or BTS",
    },
    {
        "room_name":  "General K-Pop",
        "fandom":     "K-Pop in general (all groups)",
        "emoji":      "microphone",
        "disclaimer": "Fan bulletin - Not affiliated with any K-pop agency",
    },
    {
        "room_name":  "K-Drama Room",
        "fandom":     "K-Drama",
        "emoji":      "clapper board",
        "disclaimer": "Fan bulletin - Not affiliated with any production company",
    },
    {
        "room_name":  "Purple Lounge",
        "fandom":     "BTS V (Kim Taehyung)",
        "emoji":      "purple heart",
        "disclaimer": "Fan bulletin - Not affiliated with HYBE, BigHit Music, or BTS",
    },
    {
        "room_name":  "Blink Lounge",
        "fandom":     "BLACKPINK",
        "emoji":      "cherry blossom",
        "disclaimer": "Fan bulletin - Not affiliated with YG Entertainment or BLACKPINK",
    },
]

FALLBACKS = {
    "Lavender Lounge": [
        "BTS has broken 40+ Guinness World Records and counting! ARMY power! \U0001f49c",
        "BTS became the first K-Pop group to top the Billboard Hot 100! Legends! \U0001f49c",
        "BTS Permission to Dance at the UN - the moment that moved the whole world \U0001f49c",
    ],
    "General K-Pop": [
        "K-Pop is now a global phenomenon with fans in every country! \U0001f3a4",
        "K-Pop groups have broken hundreds of streaming records this year! \U0001f3b5",
        "From idol shows to world stages - K-Pop's journey is truly remarkable \U0001f31f",
    ],
    "K-Drama Room": [
        "Korean dramas are now the most watched non-English content on Netflix! \U0001f3ac",
        "Squid Game broke Netflix records - K-Drama taking over the world! \U0001f3ac",
        "The Golden Age of K-Drama is here - more quality content than ever! \U0001f3ac",
    ],
    "Purple Lounge": [
        "V's solo debut Layover showed the world his artistic vision - purple perfection! \U0001f49c",
        "The purple ocean at BTS concerts is one of the most beautiful sights in music \U0001f49c",
        "BTS and ARMY - a bond that transcends borders and languages \U0001f49c",
    ],
    "Blink Lounge": [
        "BLACKPINK became the first K-Pop group to headline Coachella - legends! \U0001f338",
        "BLACKPINK's How You Like That broke YouTube records in 24 hours! \U0001f338",
        "From 4 girls to global superstars - BLACKPINK in your area always! \U0001f338",
    ],
}

BLOCKED_WORDS = [
    'scandal', 'controversy', 'controversial', 'accused', 'lawsuit',
    'arrested', 'criticism', 'hate', 'hiatus', 'delay', 'delayed',
    'break up', 'breakup', 'dating', 'girlfriend', 'boyfriend',
    'failed', 'disappointing', 'sad news', 'bad news', 'unfortunately',
    'tragic', 'hospitalized', 'injured',
]

def is_safe(text):
    lower = text.lower()
    return not any(w in lower for w in BLOCKED_WORDS)


def generate_all_bulletins():
    today = datetime.now(timezone.utc).strftime("%B %d, %Y")

    prompt = (
        "Today is " + today + ".\n\n"
        "You are a K-pop and K-drama fan bulletin writer for JSukoon app.\n"
        "Generate ONE short, joyful, uplifting bulletin for each of these 5 fan rooms.\n\n"
        "ROOMS:\n"
        "1. Lavender Lounge - BTS fan room (end with purple heart emoji)\n"
        "2. General K-Pop - all K-pop groups (end with microphone emoji)\n"
        "3. K-Drama Room - K-drama fans (end with clapper board emoji)\n"
        "4. Purple Lounge - BTS V (Kim Taehyung) fans (end with purple heart emoji)\n"
        "5. Blink Lounge - BLACKPINK fans (end with cherry blossom emoji)\n\n"
        "STRICT RULES for each bulletin:\n"
        "- ONLY positive, celebratory content\n"
        "- NEVER mention scandals, controversies, dating rumors, health issues, or anything negative\n"
        "- NEVER reproduce song lyrics - only mention song titles\n"
        "- Under 200 characters each\n"
        "- Warm fan-to-fan tone\n"
        "- Make it feel relevant to today if possible, otherwise celebrate a milestone\n\n"
        "Respond with ONLY a valid JSON object, no markdown, no explanation:\n"
        '{"Lavender Lounge": "bulletin text here", "General K-Pop": "bulletin text here", '
        '"K-Drama Room": "bulletin text here", "Purple Lounge": "bulletin text here", '
        '"Blink Lounge": "bulletin text here"}'
    )

    try:
        payload = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "tools": [{"google_search": {}}],
            "generationConfig": {
                "maxOutputTokens": 500,
                "temperature": 0.8,
            }
        }).encode()

        req = urllib.request.Request(
            GEMINI_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())

        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        text = " ".join(p.get("text", "") for p in parts if p.get("text")).strip()

        if not text:
            log.warning("Empty response from Gemini")
            return None

        text = text.replace("```json", "").replace("```", "").strip()

        start = text.find("{")
        end   = text.rfind("}") + 1
        if start == -1 or end == 0:
            log.warning("No JSON found in response: %s", text[:200])
            return None

        bulletins = json.loads(text[start:end])
        return bulletins

    except Exception as e:
        log.error("Gemini API error: %s", e)
        return None


def store_bulletin(room_name, content):
    url     = SUPABASE_URL + "/rest/v1/khub_bulletins"
    payload = json.dumps({
        "room_name": room_name,
        "content":   content,
        "is_active": True,
    }).encode()
    headers = {
        "apikey":        SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type":  "application/json",
        "Prefer":        "return=minimal",
    }
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15):
            log.info("  stored bulletin for %s", room_name)
    except Exception as e:
        log.error("  failed to store for %s: %s", room_name, e)


def run():
    log.info("K-Hub Bulletin Generator started")

    log.info("Calling Gemini for all 5 rooms in one request...")
    bulletins = generate_all_bulletins()

    for room in ROOMS:
        name = room["room_name"]

        if bulletins and name in bulletins:
            text = bulletins[name].strip()
            if is_safe(text):
                log.info("OK %s: %s", name, text[:80])
            else:
                log.warning("Safety fail for %s - using fallback", name)
                text = random.choice(FALLBACKS[name])
        else:
            log.warning("No bulletin for %s - using fallback", name)
            text = random.choice(FALLBACKS[name])

        full_content = "AI Fan Bulletin\n\n" + text + "\n\n" + room["disclaimer"]
        store_bulletin(name, full_content)

    log.info("All bulletins generated and stored")


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        log.critical("Bulletin generator crashed: %s", e, exc_info=True)
        sys.exit(1)
