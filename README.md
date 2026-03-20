# JSukoon

> \*Peace. Tranquility. A sanctuary built for the Indian emotional experience.\*

JSukoon is a bilingual (Hindi + English) mindfulness and wellness PWA built with React, Vite, and Supabase. It is designed to speak to the Indian emotional experience in its own language — not translated wellness, but culturally rooted calm.

**Live:** [sukoon-pro.vercel.app](https://sukoon-pro.vercel.app)

\---

## What it is

A three-layer sanctuary:

|Layer|Access|Contains|
|-|-|-|
|**Home**|Everyone|Bench, Focus, Warmth, Breathing|
|**More**|Everyone|6 moods, tools, journal, progress, sleep|
|**Vault**|By invitation|The Descent, Bilateral Tapping, Nadi Shodhana, Unsent Letter, Stone Drop|

The Vault is a hidden deep layer — entered through a long press on the title, a whisper on the Bench after 30 seconds, or invisible text at the bottom of MorePage. It requires a key, given only to those who find their way there.

\---

## Tech stack

* **Frontend:** React 19, Vite 7, React Router 7
* **Backend/Auth:** Supabase (PostgreSQL + Auth)
* **AI:** Google Gemini API via Vercel Serverless Functions
* **Deployment:** Vercel
* **Analytics:** Vercel Analytics

\---

## Local development

```bash
npm install
npm run dev
```

Required environment variables in `.env.local`:

```
VITE\_SUPABASE\_URL=your\_supabase\_url
VITE\_SUPABASE\_ANON\_KEY=your\_supabase\_anon\_key
GEMINI\_API\_KEY=your\_gemini\_key
```

## Supabase setup

Run `supabase/migrations.sql` once in your Supabase SQL Editor to create the atomic credit increment function.

\---

## Design language

* **Fonts:** Cormorant Garamond (headings), DM Sans (body)
* **Themes:** Void · Twilight Blue · Sage Sanctuary · First Light · Pink Champagne · Sea Glass
* **Moods:** Heavy · Restless · Exhausted · Okay · Warm · Sad — each mapped to a theme

\---

*Built by AB. The name means peace in Urdu — سکون.*



## Environment variables — full list

```
# Client-side (safe to expose)
VITE\_SUPABASE\_URL=your\_supabase\_project\_url
VITE\_SUPABASE\_ANON\_KEY=your\_supabase\_anon\_key

# Server-side only — never prefix with VITE\_
GEMINI\_API\_KEY=your\_gemini\_api\_key
SUPABASE\_URL=your\_supabase\_project\_url
SUPABASE\_SERVICE\_ROLE\_KEY=your\_supabase\_service\_role\_key
```

`SUPABASE\_URL` and `SUPABASE\_SERVICE\_ROLE\_KEY` are required for server-side auth
verification in the API routes. Add them in Vercel Dashboard → Settings → Environment Variables.
The service role key is in Supabase Dashboard → Settings → API → service\_role key.
Never commit it. Never prefix it with VITE\_.

