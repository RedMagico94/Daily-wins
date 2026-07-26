# Daily Wins

A personal daily system, built as an offline-first PWA for iPhone. Track wins across **Body, Mind & Discipline, Recovery, Growth & Spirit, and Husband & Father**, run the nightly no-equipment workout, and watch the journey build week by week.

## Tabs

- **🏆 Wins** — tick daily wins for points. Today's Target scales with your logged energy (Low 30 / Medium 60 / High 90). Weekly target 400pts with levels every 100pts. Page back up to 14 days with the day switcher to log a day you forgot. Rewards are a real points bank you spend down.
- **💪 Workout** — 2 rounds × 8 wrist-safe exercises with a rest timer. Progress survives app switching, and finishing auto-logs the workout win (+15pts). Screen stays awake during the workout.
- **📈 Journey** — points this week, best day, workouts and clean days over 30 days, a 7-day chart, a 12-week heatmap, and a nightly reflection journal (20+ characters auto-logs the Reflect win).

## Streaks & grace days

Streaks count real consecutive days. Each streak gets **2 grace days per calendar month** — a missed day is bridged rather than breaking the run, so illness or travel doesn't wipe weeks of work. Grace days never add to the count; you only get credit for days you actually did the thing. The shields under each streak show how many are left this month.

## Weekly review

Backfill only reaches the last 14 days, and once Monday rolls over, last week's total is settled. On the first open of a new week the app shows a summary of last week — points, days on target, workouts, best day — with a one-tap jump into backfill to add anything you forgot before it closes.

## Evening reminders (optional server setup)

The app icon badge (points still needed today) works with no setup. A **nightly push notification** needs a one-time server step, because iOS only delivers push to installed PWAs via a real push service. Until this is done the toggle in the app reads "Unavailable" and nothing breaks.

1. **Generate VAPID keys:**
   ```
   npx web-push generate-vapid-keys
   ```
2. **Add the public key to the app** — set `VAPID_PUBLIC_KEY` at the top of the reminder section in `app.js`.
3. **Create the table and schedule:** run `supabase/schema.sql` in the Supabase SQL editor, replacing `<PROJECT-REF>` and `<CRON-SECRET>`. Enable the `pg_cron` and `pg_net` extensions first (Database → Extensions).
4. **Set the function secrets:**
   ```
   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... \
     VAPID_SUBJECT=mailto:you@example.com CRON_SECRET=...
   ```
   Keep the private key out of the repo — it only ever lives in Supabase secrets.
5. **Deploy the sender:**
   ```
   supabase functions deploy send-reminders --no-verify-jwt
   ```
6. On the iPhone, open the installed app and switch **Evening Reminder** on.

The function runs hourly and only pushes to a device whose *local* time matches its reminder hour (8pm by default), and skips the nudge entirely if anything has already been logged that day. Dead subscriptions are pruned automatically.

## How it works

- **Offline-first**: the app renders instantly from on-device storage. Changes made offline are queued and synced to Supabase automatically when connection returns — the sync status at the bottom of the Wins tab shows the current state.
- **Service worker** caches the app shell, so it opens with no signal once installed.
- **Day rollover** is handled automatically — leave the app open past midnight and it starts a fresh day.
- Reflections are stored on-device only.

## Install on iPhone

1. Open the app URL in Safari.
2. Tap the **Share** button → **Add to Home Screen**.
3. Launch from the home screen icon — it runs fullscreen like a native app.

## Stack

Vanilla HTML/CSS/JS, Supabase (tables: `wins`, `stats`), deployed on Vercel.
