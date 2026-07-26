// Daily Wins — nightly reminder sender.
//
// Invoked hourly by pg_cron. Each run works out which subscriptions are
// currently at their local reminder hour, skips the nudge if the day is
// already logged, and pushes to the rest.
//
// Deploy:  supabase functions deploy send-reminders --no-verify-jwt
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, CRON_SECRET

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:you@example.com';
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Nudges rotate so the notification doesn't become wallpaper.
const MESSAGES = [
  "Nothing logged today. Two minutes closes the day out properly.",
  "Day's not done until it's logged. What did you get?",
  "Don't let today go unrecorded — even a small win counts.",
  "Check in before bed. Protect the streak.",
  "A few taps. Then the day's on the board.",
];

function localDateStr(tzOffsetMinutes: number): string {
  // getTimezoneOffset() is minutes BEHIND UTC, so subtract it.
  const local = new Date(Date.now() - tzOffsetMinutes * 60_000);
  return local.toISOString().slice(0, 10);
}

function localHour(tzOffsetMinutes: number): number {
  const local = new Date(Date.now() - tzOffsetMinutes * 60_000);
  return local.getUTCHours();
}

Deno.serve(async (req) => {
  if (CRON_SECRET && req.headers.get('x-cron-secret') !== CRON_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const { data: subs, error } = await db
    .from('push_subscriptions')
    .select('*')
    .eq('enabled', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0, skipped = 0, pruned = 0;

  for (const sub of subs ?? []) {
    // Only fire in the hour that matches this device's local reminder time.
    if (localHour(sub.tz_offset_minutes) !== sub.reminder_hour) { skipped++; continue; }

    // Already logged something today? Then there's nothing to nag about.
    const today = localDateStr(sub.tz_offset_minutes);
    const { count } = await db
      .from('wins')
      .select('id', { count: 'exact', head: true })
      .eq('date', today)
      .eq('completed', true);

    const realCount = count ?? 0;
    if (realCount > 0) { skipped++; continue; }

    const payload = JSON.stringify({
      title: 'Daily Wins',
      body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
      tag: 'daily-reminder',
      url: './',
    });

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      sent++;
    } catch (e) {
      // 404/410 mean the subscription is dead — drop it so it stops being retried.
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await db.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        pruned++;
      } else {
        console.error('Push failed:', status, (e as Error).message);
      }
    }
  }

  return new Response(JSON.stringify({ sent, skipped, pruned }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
