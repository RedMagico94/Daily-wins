# Daily Wins

A personal daily system, built as an offline-first PWA for iPhone. Track wins across **Body, Mind & Discipline, Recovery, Growth & Spirit, and Husband & Father**, run the nightly no-equipment workout, and watch the journey build week by week.

## Tabs

- **🏆 Wins** — tick daily wins for points. Daily target: 60pts. Weekly target: 400pts, with levels every 100pts and rewards to unlock. Streaks are real consecutive-day streaks computed from history.
- **💪 Workout** — 2 rounds × 8 wrist-safe exercises with a rest timer. Progress survives app switching, and finishing auto-logs the workout win (+15pts). Screen stays awake during the workout.
- **📈 Journey** — points this week, best day, workouts and clean days over 30 days, a 7-day chart, a 12-week heatmap, and a nightly reflection journal (20+ characters auto-logs the Reflect win).

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
