# Entrance song

Friends upload a short song. When a Raspberry Pi camera decides someone is coming in the door, a MacBook by the door plays the newest approved request for at most 30 seconds.

This is a v1 scaffold. The request form and the player are placeholders. The arrival webhook checks a bearer token and otherwise returns **501 Not Implemented**. Nothing here is deployed, and `supabase/migrations/0001_init.sql` is not applied.

## Flow

1. A friend opens the public request page (`/`) and submits their name, a song title, and a short audio file.
2. The file lands in the private Supabase Storage bucket `songs`. A `requests` row is inserted with `status = 'pending'`. It does not play until a host approves it.
3. The Raspberry Pi POSTs to `/api/arrival` with `Authorization: Bearer ${ARRIVAL_WEBHOOK_TOKEN}`.
4. A private `/player` tab, already open on the MacBook, receives the arrival (Supabase Realtime, not built yet) and plays the newest approved, unplayed request.
5. Playback stops at 30 seconds. The server marks that request `played` and sets `played_at`.

`/` must never show what played or when. Play history stays on the server.

## Stack

- Next.js (App Router, TypeScript) on Vercel free tier
- Supabase free tier: Postgres, Storage, Realtime
- The player is a normal browser tab. Press **Start** once so the browser allows autoplay.

## Safety rules

- **Play history stays private.** Anon has no `SELECT` on `requests` or `arrivals`. The request page does not list songs, statuses, or timestamps. Do not add a public “recently played” feed.
- **30 second cap.** The player stops the audio element at 30 seconds, and the server treats that as the end of the play. A longer file must not keep going.
- **Quiet hours.** Do not play during the hours the household sets (not built yet). The webhook should no-op inside that window.
- **Cooldown.** After a play, ignore further arrivals until the cooldown passes so a busy doorway does not replay songs back to back (not built yet).
- **Anon is insert-only.** Anon may `INSERT` a `requests` row only when `status = 'pending'` and `played_at` is null, and may upload into `songs`. Anon cannot read, update, or delete requests, and cannot touch `arrivals`.
- **File type and size.** The `songs` bucket accepts `audio/mpeg`, `audio/mp4`, `audio/x-m4a`, and `audio/wav`, up to 10 MB. The bucket is private.
- **Rate limits.** Cap uploads and arrival webhooks so a script cannot fill the bucket or spam the player (not built yet).
- **Hold for approval.** New requests stay `pending` until a host sets `approved`. Rejected and played rows never return to the public page.
- **Secrets.** The service-role key and the webhook token are server-only. The browser client uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only. Never prefix the service-role key with `NEXT_PUBLIC_` or import `lib/supabase/server.ts` from a client component.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Public request form (UI only) |
| `app/player/page.tsx` | Private player. **Start** unlocks autoplay |
| `app/api/arrival/route.ts` | Webhook stub: 401 or 501 |
| `lib/supabase/browser.ts` | Anon browser client |
| `lib/supabase/server.ts` | Service-role client (`server-only`) |
| `supabase/migrations/0001_init.sql` | Schema, RLS, private `songs` bucket. Not applied |
| `.env.example` | Variable names only |

`requests.requester_name` is at most 80 characters, `requests.title` at most 160, `requests.storage_path` 1–1024, and `arrivals.source` at most 80. `status` is `pending`, `approved`, `played`, or `rejected`. A row is `played` only when `played_at` is set.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` from the Supabase project and a long random `ARRIVAL_WEBHOOK_TOKEN`. Do not commit it. `.env.example` lists names and stays empty.

Until the form is wired, `/` only shows the fields. `/player` unlocks autoplay and does not play a file. A POST to `/api/arrival` without the bearer token returns 401. With the token it returns 501.

## Next steps

1. Create a Supabase project and apply `supabase/migrations/0001_init.sql` by hand. This repo does not apply it.
2. Put the env vars in Vercel. Keep `SUPABASE_SERVICE_ROLE_KEY`, `ARRIVAL_WEBHOOK_TOKEN`, and `PLAYER_ACCESS_KEY` off the client.
3. Wire `/` to upload with the anon client and insert a pending request. Still do not read rows back.
4. Add a host-only approval screen (service role) that can set `approved` or `rejected`.
5. Gate `/player` with `PLAYER_ACCESS_KEY`.
6. On an authorized arrival, insert `arrivals`, notify the player over Realtime, play for at most 30 seconds, then mark the request played.
7. Add quiet hours, a cooldown, and rate limits on upload and on `/api/arrival`.
8. Point the Raspberry Pi at `/api/arrival`. Deploy to Vercel when the above is in place.
