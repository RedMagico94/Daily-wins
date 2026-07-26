-- Daily Wins — schema additions for evening reminders.
-- Run once in the Supabase SQL editor.

create table if not exists public.push_subscriptions (
  endpoint            text primary key,
  p256dh              text not null,
  auth                text not null,
  reminder_hour       int  not null default 20,   -- local hour to send at
  tz_offset_minutes   int  not null default 0,    -- Date.getTimezoneOffset()
  enabled             boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- Single-user app using the anon key: the client needs to register and
-- disable its own subscription. Rows hold no personal data beyond an
-- opaque push endpoint.
drop policy if exists "anon manages subscriptions" on public.push_subscriptions;
create policy "anon manages subscriptions"
  on public.push_subscriptions for all
  using (true) with check (true);

-- ---------------------------------------------------------------
-- Schedule: run the sender every hour; the function itself decides
-- which subscriptions are currently at their local reminder hour.
-- Requires the pg_cron and pg_net extensions (Database > Extensions).
-- ---------------------------------------------------------------
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Replace <PROJECT-REF> and <CRON-SECRET> before running.
select cron.unschedule('daily-wins-reminders')
  where exists (select 1 from cron.job where jobname = 'daily-wins-reminders');

select cron.schedule(
  'daily-wins-reminders',
  '0 * * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT-REF>.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type":"application/json","x-cron-secret":"<CRON-SECRET>"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
