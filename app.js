// ============================================
// DAILY WINS — Kevin's personal system
// Offline-first: renders instantly from local
// cache, syncs to Supabase in the background.
// ============================================

// ---------- SUPABASE ----------
const SUPABASE_URL = 'https://sjhfpzqtizvoklwwjjkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqaGZwenF0aXp2b2tsd3dqamtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzMyMTUsImV4cCI6MjA5NTEwOTIxNX0.fDTnHRnHgId_n_tARMFoPwHiNEEX_UbnSK3XdO_vgI0';

// If the CDN script failed to load (offline first-launch), db is null and
// everything still works from local storage.
const db = (typeof supabase !== 'undefined' && supabase.createClient)
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ============================================
// DATA
// ============================================
const STOIC = [
  { q: '"You have power over your mind, not outside events. Realise this, and you will find strength."', a: '— Marcus Aurelius' },
  { q: '"It\'s not because things are difficult that we dare not venture. It\'s because we dare not venture that they are difficult."', a: '— Seneca' },
  { q: '"First say to yourself what you would be; and then do what you have to do."', a: '— Epictetus' },
  { q: '"Waste no more time arguing about what a good man should be. Be one."', a: '— Marcus Aurelius' },
  { q: '"Endure and renounce."', a: '— Epictetus' },
  { q: '"Receive without pride, relinquish without struggle."', a: '— Marcus Aurelius' },
  { q: '"What stands in the way becomes the way."', a: '— Marcus Aurelius' },
  { q: '"No man is free who is not master of himself."', a: '— Epictetus' },
  { q: '"We suffer more often in imagination than in reality."', a: '— Seneca' },
  { q: '"Confine yourself to the present."', a: '— Marcus Aurelius' },
  { q: '"He who fears death will never do anything worthy of a man who is alive."', a: '— Seneca' },
  { q: '"Don\'t explain your philosophy. Embody it."', a: '— Epictetus' },
  { q: '"The best revenge is to be unlike him who performed the injury."', a: '— Marcus Aurelius' },
  { q: '"Luck is what happens when preparation meets opportunity."', a: '— Seneca' },
];

const CATEGORIES = [
  {
    id: 'body', icon: '💪', name: 'Body',
    wins: [
      { id: 'workout', name: 'Complete a workout', desc: 'Any format — gym, home, 20 min minimum', pts: 15 },
      { id: 'steps', name: '7,000+ steps today', desc: 'Check your Watch', pts: 8 },
      { id: 'walk', name: 'Intentional walk', desc: 'Lunch, school run, park — counts', pts: 5 },
      { id: 'protein', name: 'Protein at 2+ meals', desc: 'Eggs, chicken, yoghurt, legumes', pts: 6 },
      { id: 'water', name: 'Drink 2L+ water', desc: 'Hydration is underrated', pts: 4 },
      { id: 'sleep', name: 'In bed before midnight', desc: 'Protect your sleep this week', pts: 5 },
      { id: 'weighin', name: 'Weigh in (Mon or Fri)', desc: 'Tap to record the number. No judgment.', pts: 10 },
    ]
  },
  {
    id: 'mind', icon: '🧠', name: 'Mind & Discipline',
    wins: [
      { id: 'noporn', name: 'Clean day', desc: 'No porn. Full day. This is the work. Protect the rest of today — that counts.', pts: 20 },
      { id: 'noscreen', name: 'Phone off by 10pm', desc: 'Protect your sleep and your mind', pts: 8 },
      { id: 'stress', name: 'Managed stress consciously', desc: 'Breathed, walked, paused instead of reacted', pts: 6 },
      { id: 'nosnack', name: 'No mindless snacking', desc: 'Ate intentionally — not out of boredom', pts: 6 },
    ]
  },
  {
    id: 'recovery', icon: '🛡️', name: 'Recovery',
    wins: [
      { id: 'chose_differently', name: 'Chose differently after a slip', desc: 'You caught it. You redirected. That is the work.', pts: 15 },
      { id: 'protected_rest', name: 'Protected the rest of the day', desc: 'One slip didn\'t become the whole day. You held the line.', pts: 15 },
    ]
  },
  {
    id: 'growth', icon: '📖', name: 'Growth & Spirit',
    wins: [
      { id: 'read', name: 'Read for 15+ minutes', desc: 'Book, not social media', pts: 8 },
      { id: 'learn', name: 'Learned something new', desc: 'Podcast, article, skill — intentional', pts: 6 },
      { id: 'dua', name: 'Morning or evening dua', desc: 'Spiritual grounding — start or end intentionally', pts: 8 },
      { id: 'reflect', name: 'Reflected on the day', desc: '5 mins — write it in the Journey tab', pts: 6 },
      { id: 'stoic', name: 'Applied a Stoic principle today', desc: 'Consciously used one in a real moment', pts: 8 },
    ]
  },
  {
    id: 'family', icon: '🏠', name: 'Husband & Father',
    wins: [
      { id: 'present', name: 'Fully present with the girls', desc: 'Phone away, eyes on them', pts: 10 },
      { id: 'laeeqa', name: 'Quality moment with Laeeqa', desc: 'Talked, laughed, connected — not just logistics', pts: 10 },
      { id: 'routine', name: 'Held the morning routine', desc: 'Kids out the door calmly and on time', pts: 6 },
    ]
  },
];

// A real economy, not a passive threshold: your balance is a rolling
// 12-week bank (points earned minus points already redeemed, within
// the same window the rest of the app tracks). Redeeming actually
// spends it. Priced against a realistic rolling window: a consistent
// day nets ~50-70pts, so 12 weeks of solid effort banks roughly
// 2,000-3,000pts — enough to reach every tier here without it being trivial.
const REWARDS = [
  { id: 'earlynight', name: 'Early Night Pass', desc: 'Bed at 9:30pm — no guilt, no to-do list', pts: 120 },
  { id: 'restday', name: 'Guilt-Free Rest Day', desc: 'Skip a workout this week — no guilt, no tracking', pts: 180 },
  { id: 'weekendpick', name: 'Choose the Weekend Activity', desc: 'You pick — football, gym, food, whatever you want', pts: 280 },
  { id: 'solomorning', name: 'One Morning to Yourself', desc: 'Laeeqa holds the fort — 2 hours, zero obligations', pts: 400 },
  { id: 'datenight', name: 'Date Night — Your Call', desc: 'Pick the place, pick the plan. Just you and Laeeqa', pts: 520 },
  { id: 'soloday', name: 'A Full Day Off', desc: 'One entire day that\'s just yours — no plan required', pts: 750 },
  { id: 'bigtreat', name: 'Something You\'ve Been Wanting', desc: 'A real treat — gear, an experience, a splurge. You earned it', pts: 1000 },
];

// Today's Target scales with how much you actually have to give today —
// still a real bar to clear at every level, never "just do nothing".
const DAILY_TARGETS = { low: 30, medium: 60, high: 90 };
const DAILY_TARGET = DAILY_TARGETS.medium; // fallback for generic copy/defaults
const WEEKLY_TARGET = 400;
const HISTORY_DAYS = 84; // 12 weeks kept locally + fetched from server
const CATEGORY_BONUS_PTS = 8;

// Fast lookup: win_id -> { ...win, catId }
const WIN_INDEX = {};
CATEGORIES.forEach(c => c.wins.forEach(w => { WIN_INDEX[w.id] = { ...w, catId: c.id }; }));
// Category-clear bonus — a pseudo-win, synced and scored exactly like a real one.
CATEGORIES.forEach(c => {
  WIN_INDEX['bonus_' + c.id] = {
    id: 'bonus_' + c.id, catId: c.id,
    name: c.name + ' cleared', desc: 'Bonus for finishing every win in this category today',
    pts: CATEGORY_BONUS_PTS,
  };
});

// ============================================
// ACHIEVEMENTS
// ============================================
const ACHIEVEMENTS = [
  { id: 'first_win', icon: '🌱', name: 'First Step', desc: 'Log your very first win', check: s => s.totalWinsLogged >= 1 },
  { id: 'streak3', icon: '🔥', name: 'On Fire', desc: 'Any streak reaches 3 days', check: s => s.maxStreakEver >= 3, progress: s => [Math.min(s.maxStreakEver, 3), 3] },
  { id: 'streak7', icon: '🔥', name: 'Week Warrior', desc: 'Any streak reaches 7 days', check: s => s.maxStreakEver >= 7, progress: s => [Math.min(s.maxStreakEver, 7), 7] },
  { id: 'streak14', icon: '🔥', name: 'Unbreakable', desc: 'Any streak reaches 14 days', check: s => s.maxStreakEver >= 14, progress: s => [Math.min(s.maxStreakEver, 14), 14] },
  { id: 'century', icon: '💯', name: 'Century', desc: 'Score 100+ points in one day', check: s => s.bestDayPoints >= 100, progress: s => [Math.min(s.bestDayPoints, 100), 100] },
  { id: 'target5', icon: '🎯', name: 'Sharp Shooter', desc: 'Hit your daily target 5 times', check: s => s.daysHittingTarget >= 5, progress: s => [Math.min(s.daysHittingTarget, 5), 5] },
  { id: 'perfectweek', icon: '🏆', name: 'Perfect Week', desc: 'Hit your daily target every day of a full week', check: s => s.perfectWeek },
  { id: 'ironwill', icon: '💪', name: 'Iron Will', desc: 'Complete 10 workouts', check: s => s.workoutCount >= 10, progress: s => [Math.min(s.workoutCount, 10), 10] },
  { id: 'cleanmind', icon: '🛡️', name: 'Clear Mind', desc: '14 consecutive clean days', check: s => s.cleanStreakEver >= 14, progress: s => [Math.min(s.cleanStreakEver, 14), 14] },
  { id: 'thinker', icon: '📖', name: 'Deep Thinker', desc: 'Write 10 reflections', check: s => s.reflectionCount >= 10, progress: s => [Math.min(s.reflectionCount, 10), 10] },
  { id: 'allrounder', icon: '🌟', name: 'All-Rounder', desc: 'Clear every category in a single day', check: s => s.allCategoriesClearedAnyDay },
];

// ============================================
// DATES
// ============================================
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d, n) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function getTodayStr() { return fmtDate(new Date()); }
function shortDateLabel(dateStr) {
  const d = parseDate(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}
function getWeekStr(dateStr) {
  const d = parseDate(dateStr || getTodayStr());
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)); // back to Monday
  return fmtDate(d);
}

// ============================================
// STATE & LOCAL STORAGE
// ============================================
const LS = {
  history: 'dw_history_v2',
  queue: 'dw_queue_v1',
  reflect: 'dw_reflect_v1',
  workout: 'dw_workout_v1',
  sound: 'dw_sound_v1',
  achieve: 'dw_achievements_v1',
  weekreview: 'dw_weekreview_v1',
  reminder: 'dw_reminder_v1',
  weightUnit: 'dw_weightunit_v1',
};

function lsGet(k, fallback) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full/private mode */ }
}

let state = {
  history: {},              // 'YYYY-MM-DD' -> [win_id, ...] (completed, incl. energy_* and bonus_*)
  todayStr: getTodayStr(),
  weekStr: getWeekStr(),
  viewDate: getTodayStr(),  // which day the Categories checklist is showing — today by default
};

// How far back you can backfill a missed day. Wide enough to catch up
// after a bad week, narrow enough that this stays "catch up recently",
// not "rewrite history".
const BACKFILL_DAYS = 14;

// Grace days per streak, per calendar month. Two is enough to absorb
// illness or travel without making the streak number meaningless.
const GRACE_PER_MONTH = 2;

let openCat = 'body';       // which category accordion is open
let currentTab = 'wins';
let popId = null;           // win row to play a pop animation on next render
let soundOn = true;

function saveLocal() { lsSet(LS.history, state.history); }

function winsOn(date) { return state.history[date] || []; }
function hasWin(date, id) { return winsOn(date).includes(id); }
function addWinLocal(date, id) {
  const a = winsOn(date).slice();
  if (!a.includes(id)) a.push(id);
  state.history[date] = a;
}
function removeWinLocal(date, id) {
  state.history[date] = winsOn(date).filter(x => x !== id);
}
function dayPoints(date) {
  return winsOn(date).reduce((s, id) => s + (WIN_INDEX[id] ? WIN_INDEX[id].pts : 0), 0);
}
function weekPoints() {
  let s = 0;
  const start = parseDate(state.weekStr);
  for (let i = 0; i < 7; i++) {
    const ds = fmtDate(addDays(start, i));
    if (ds > state.todayStr) break;
    s += dayPoints(ds);
  }
  return s;
}
function energyToday() {
  const e = winsOn(state.todayStr).find(id => id.startsWith('energy_'));
  return e ? e.replace('energy_', '') : null;
}
// Today's Target for any date, based on the energy level logged that day
// (or the medium default if none was logged). Used everywhere "did this
// day hit its target" matters, so a good low-energy day reads as a win,
// not a shortfall against a flat number that never applied to it.
function targetForDate(dateStr) {
  const e = winsOn(dateStr).find(id => id.startsWith('energy_'));
  const level = e ? e.replace('energy_', '') : null;
  return DAILY_TARGETS[level] || DAILY_TARGETS.medium;
}
function todaysTarget() { return targetForDate(state.todayStr); }
// Real streak: consecutive days ending today (or yesterday if today isn't done yet).
// Walking back from today, a missed day can be bridged by a "grace day"
// so one bad day doesn't wipe a long run. Each streak gets GRACE_PER_MONTH
// credits per calendar month, charged to the month of the day being
// forgiven. Grace days bridge the gap but never add to the count — you
// only get credit for days you actually did the thing.
function computeStreakInfo(winId) {
  const graceUsed = {};   // 'YYYY-MM' -> credits consumed
  const bridged = [];     // dates covered by grace
  let n = hasWin(state.todayStr, winId) ? 1 : 0;
  let d = addDays(parseDate(state.todayStr), -1);

  for (let guard = 0; guard < 3650; guard++) {
    const ds = fmtDate(d);
    if (hasWin(ds, winId)) { n++; d = addDays(d, -1); continue; }

    // Missed day — try to bridge this gap, spending one credit per
    // forgiven day out of that day's monthly budget.
    const pending = [];
    let probe = new Date(d);
    let reconnected = false;
    for (let k = 0; k < GRACE_PER_MONTH; k++) {
      const ps = fmtDate(probe);
      const pm = ps.slice(0, 7);
      const spent = (graceUsed[pm] || 0) + pending.filter(x => x.slice(0, 7) === pm).length;
      if (spent >= GRACE_PER_MONTH) break;   // that month is out of credits
      pending.push(ps);
      probe = addDays(probe, -1);
      if (hasWin(fmtDate(probe), winId)) { reconnected = true; break; }
    }
    if (!reconnected) break;                 // gap too wide, or no credits left

    pending.forEach(p => {
      const m = p.slice(0, 7);
      graceUsed[m] = (graceUsed[m] || 0) + 1;
      bridged.push(p);
    });
    d = probe;
  }

  return { streak: n, bridged, graceUsed };
}

function computeStreak(winId) { return computeStreakInfo(winId).streak; }

// Credits this streak has left in the current calendar month.
function graceLeft(winId) {
  const month = state.todayStr.slice(0, 7);
  const info = computeStreakInfo(winId);
  return Math.max(GRACE_PER_MONTH - (info.graceUsed[month] || 0), 0);
}
// Longest-ever consecutive run for a win, anywhere in the retained history window.
function bestStreakEver(winId) {
  const dates = Object.keys(state.history).filter(d => hasWin(d, winId)).sort();
  if (!dates.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (parseDate(dates[i]) - parseDate(dates[i - 1])) / 86400000;
    cur = diff === 1 ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
}
function countInLastDays(days, winId) {
  let n = 0;
  for (let i = 0; i < days; i++) {
    if (hasWin(fmtDate(addDays(parseDate(state.todayStr), -i)), winId)) n++;
  }
  return n;
}

// ============================================
// REWARD BANK — a real rolling-window economy.
// Redemptions are stored as pseudo-wins ('redeem_<id>'), same trick as
// category bonuses, so they ride the existing offline queue and sync
// to Supabase with zero schema changes.
// ============================================
function lifetimeEarned() {
  // dayPoints already excludes redeem_/energy_ ids (not in WIN_INDEX),
  // so this is exactly "real + bonus points earned in the retained window".
  return Object.keys(state.history).reduce((s, d) => s + dayPoints(d), 0);
}
function lifetimeSpent() {
  let s = 0;
  Object.keys(state.history).forEach(d => {
    winsOn(d).forEach(id => {
      if (id.startsWith('redeem_')) {
        const r = REWARDS.find(x => x.id === id.slice('redeem_'.length));
        if (r) s += r.pts;
      }
    });
  });
  return s;
}
function rewardBank() { return Math.max(lifetimeEarned() - lifetimeSpent(), 0); }

// ============================================
// WEIGH-INS
// Stored as a pseudo-win ('weight_82.5'), the same pattern as energy
// and bonuses — so it rides the existing offline queue and syncs to
// Supabase with no schema change. Always canonical kg on disk; the
// kg/lb toggle is display only, so switching units never rewrites data.
// ============================================
const LB_PER_KG = 2.20462;

function weightOn(dateStr) {
  const id = winsOn(dateStr).find(x => x.startsWith('weight_'));
  if (!id) return null;
  const v = parseFloat(id.slice('weight_'.length));
  return Number.isFinite(v) ? v : null;
}

// Every recorded weigh-in, oldest first.
function allWeights() {
  return Object.keys(state.history)
    .map(d => ({ date: d, kg: weightOn(d) }))
    .filter(x => x.kg !== null)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function latestWeight() {
  const all = allWeights();
  return all.length ? all[all.length - 1] : null;
}

function weightUnit() { return lsGet(LS.weightUnit, 'kg'); }
function toDisplayWeight(kg) {
  return weightUnit() === 'lb' ? kg * LB_PER_KG : kg;
}
function fromDisplayWeight(v) {
  return weightUnit() === 'lb' ? v / LB_PER_KG : v;
}
function fmtWeight(kg, decimals = 1) {
  return toDisplayWeight(kg).toFixed(decimals) + ' ' + weightUnit();
}

function setWeightFor(dateStr, kg) {
  // One weight per day — drop any previous entry first.
  winsOn(dateStr).filter(x => x.startsWith('weight_'))
    .forEach(old => _setWin(old, false, dateStr));
  _setWin('weight_' + kg.toFixed(1), true, dateStr);
}

function clearWeightFor(dateStr) {
  winsOn(dateStr).filter(x => x.startsWith('weight_'))
    .forEach(old => _setWin(old, false, dateStr));
}

function redeemReward(rewardId) {
  const r = REWARDS.find(x => x.id === rewardId);
  if (!r) return;
  if (rewardBank() < r.pts) { showToast('Not enough points yet.'); return; }
  if (!confirm(`Redeem "${r.name}" for ${r.pts}pts?`)) return;
  _setWin('redeem_' + r.id, true);
  sndBonus();
  showToast(`🎁 Redeemed: ${r.name}`);
  burstConfettiAt(window.innerWidth / 2, 260, 30, true);
  renderRewards();
}

// ============================================
// SOUND — tiny synthesized cues, no assets needed.
// Respects a mute toggle; requires a user gesture
// on iOS, which every trigger point already is.
// ============================================
let audioCtx = null;
function getAudioCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playTone(freqs, opts = {}) {
  if (!soundOn) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const { duration = 0.12, type = 'sine', gain = 0.07, stagger = 0.07 } = opts;
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = f;
    const start = ctx.currentTime + i * stagger;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  });
}
function sndTick() { playTone([660], { duration: 0.09, gain: 0.06 }); }
function sndUntick() { playTone([320], { duration: 0.08, gain: 0.05 }); }
function sndTarget() { playTone([523.25, 659.25, 783.99], { duration: 0.35, type: 'triangle', gain: 0.07 }); }
function sndBonus() { playTone([440, 554.37, 659.25], { duration: 0.28, type: 'triangle', gain: 0.06 }); }
function sndBadge() { playTone([523.25, 659.25, 783.99, 1046.5], { duration: 0.4, type: 'triangle', gain: 0.08 }); }

function toggleSound() {
  soundOn = !soundOn;
  lsSet(LS.sound, soundOn);
  const btn = document.getElementById('soundToggle');
  if (btn) btn.textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) playTone([660], { duration: 0.08, gain: 0.05 });
}

// ============================================
// MICRO-CELEBRATIONS — confetti bursts from a point
// ============================================
function burstConfettiAt(x, y, count = 14, big = false) {
  const colors = ['#e8780a', '#ff9a2e', '#f0e8d8', '#4a9460', '#d44a2e'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'burst-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = (big ? 90 : 40) + Math.random() * (big ? 90 : 45);
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    const size = (big ? Math.random() * 6 + 4 : Math.random() * 4 + 3);
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

// ============================================
// ANIMATED NUMBERS — count up instead of snapping
// ============================================
function animateNumber(el, to, duration = 500) {
  if (!el) return;
  const from = parseInt(el.textContent, 10);
  const start0 = Number.isFinite(from) ? from : 0;
  if (start0 === to) { el.textContent = to; return; }
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start0 + (to - start0) * eased);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = to;
  }
  requestAnimationFrame(step);
}

function streakFlare(n) {
  if (n >= 14) return '🔥🔥🔥';
  if (n >= 7) return '🔥🔥';
  if (n >= 3) return '🔥';
  return '';
}

// ============================================
// APP ICON BADGE — nudges you back in without
// a native push server. iOS 16.4+, installed PWAs.
// ============================================
function updateAppBadge() {
  if (!('setAppBadge' in navigator)) return;
  const remaining = Math.max(todaysTarget() - getTodayPoints(), 0);
  try {
    if (remaining > 0) navigator.setAppBadge(remaining);
    else if (navigator.clearAppBadge) navigator.clearAppBadge();
    else navigator.setAppBadge(0);
  } catch (e) { /* not fatal */ }
}

// ============================================
// ACHIEVEMENTS — evaluation & unlock celebration
// ============================================
function computeAchievementStats() {
  const dates = Object.keys(state.history).sort();
  let totalWinsLogged = 0;
  let bestDayPoints = 0;
  let daysHittingTarget = 0;
  let workoutCount = 0;
  let allCategoriesClearedAnyDay = false;

  dates.forEach(d => {
    const ids = state.history[d];
    const realIds = ids.filter(id => !id.startsWith('energy_') && !id.startsWith('bonus_'));
    totalWinsLogged += realIds.length;
    const pts = dayPoints(d);
    if (pts > bestDayPoints) bestDayPoints = pts;
    if (pts >= targetForDate(d)) daysHittingTarget++;
    if (realIds.includes('workout')) workoutCount++;
    if (CATEGORIES.every(cat => cat.wins.every(w => ids.includes(w.id)))) allCategoriesClearedAnyDay = true;
  });

  let perfectWeek = false;
  const weekStarts = new Set(dates.map(d => getWeekStr(d)));
  weekStarts.forEach(ws => {
    const start = parseDate(ws);
    let allHit = true;
    for (let i = 0; i < 7; i++) {
      const ds = fmtDate(addDays(start, i));
      if (ds > state.todayStr || dayPoints(ds) < targetForDate(ds)) { allHit = false; break; }
    }
    if (allHit) perfectWeek = true;
  });

  const maxStreakEver = Math.max(
    bestStreakEver('workout'), bestStreakEver('noporn'), bestStreakEver('read'), bestStreakEver('steps')
  );

  return {
    totalWinsLogged, bestDayPoints, daysHittingTarget, workoutCount, allCategoriesClearedAnyDay, perfectWeek,
    maxStreakEver, cleanStreakEver: bestStreakEver('noporn'),
    reflectionCount: Object.keys(lsGet(LS.reflect, {})).length,
  };
}

let badgeQueue = [];
function evaluateAchievements(announce) {
  const stats = computeAchievementStats();
  const unlocked = lsGet(LS.achieve, {});
  let changed = false;
  ACHIEVEMENTS.forEach(a => {
    if (!unlocked[a.id] && a.check(stats)) {
      unlocked[a.id] = state.todayStr;
      changed = true;
      if (announce) queueBadgeCelebration(a);
    }
  });
  if (changed) lsSet(LS.achieve, unlocked);
  return unlocked;
}

function queueBadgeCelebration(a) {
  badgeQueue.push(a);
  if (badgeQueue.length === 1) showNextBadge();
}
function showNextBadge() {
  if (!badgeQueue.length) return;
  const a = badgeQueue[0];
  document.getElementById('buIcon').textContent = a.icon;
  document.getElementById('buName').textContent = a.name;
  document.getElementById('buDesc').textContent = a.desc;
  document.getElementById('badgeUnlock').classList.add('show');
  sndBadge();
  burstConfettiAt(window.innerWidth / 2, window.innerHeight * 0.36, 30, true);
}
function dismissBadgeUnlock() {
  document.getElementById('badgeUnlock').classList.remove('show');
  badgeQueue.shift();
  setTimeout(() => { if (badgeQueue.length) showNextBadge(); }, 350);
}

function renderAchievements() {
  const el = document.getElementById('achGrid');
  if (!el) return;
  const unlocked = lsGet(LS.achieve, {});
  const stats = computeAchievementStats();
  el.innerHTML = ACHIEVEMENTS.map(a => {
    const isUnlocked = !!unlocked[a.id];
    let sub = a.desc;
    if (!isUnlocked && a.progress) {
      const [cur, tgt] = a.progress(stats);
      sub = `${cur} / ${tgt}`;
    }
    return `
      <div class="ach-tile ${isUnlocked ? 'unlocked' : ''}">
        <div class="ach-icon">${isUnlocked ? a.icon : '🔒'}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${sub}</div>
      </div>`;
  }).join('');
  const titleEl = document.getElementById('achSectionTitle');
  if (titleEl) {
    const count = ACHIEVEMENTS.filter(a => unlocked[a.id]).length;
    titleEl.textContent = `Achievements — ${count} / ${ACHIEVEMENTS.length}`;
  }
}

// ============================================
// WELCOME BACK CARD — the dopamine hit on open
// ============================================
function timeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up, Kevin?';
  if (h < 12) return 'Good morning, Kevin.';
  if (h < 17) return 'Good afternoon, Kevin.';
  if (h < 21) return 'Good evening, Kevin.';
  return 'Night check-in, Kevin.';
}

function buildWelcomeRecap() {
  const yestStr = fmtDate(addDays(parseDate(state.todayStr), -1));
  const dayBeforeStr = fmtDate(addDays(parseDate(state.todayStr), -2));
  const yestPts = dayPoints(yestStr);
  const dayBeforePts = dayPoints(dayBeforeStr);
  const todayPts = getTodayPoints();

  let compareLine;
  if (todayPts > 0) {
    compareLine = `Today so far: ${todayPts}pts. Keep stacking.`;
  } else if (yestPts === 0 && dayBeforePts === 0) {
    compareLine = "Fresh page today. Let's write something on it.";
  } else if (yestPts > dayBeforePts) {
    compareLine = `Yesterday: ${yestPts}pts — trending up.`;
  } else if (yestPts < dayBeforePts) {
    compareLine = `Yesterday: ${yestPts}pts. Today's the bounce-back.`;
  } else {
    compareLine = `Yesterday: ${yestPts}pts — steady.`;
  }

  const bestStreak = Math.max(
    computeStreak('workout'), computeStreak('noporn'), computeStreak('read'), computeStreak('steps')
  );

  // Only nudge if yesterday's a real gap in an established history, not
  // just "the app is new" or "yesterday was a genuine, logged zero day".
  const hasOlderHistory = Object.keys(state.history).some(d => d < yestStr);
  const showBackfillNudge = yestPts === 0 && hasOlderHistory;

  return { greeting: timeGreeting(), compareLine, bestStreak, showBackfillNudge };
}

function showWelcomeCard() {
  const card = document.getElementById('welcomeCard');
  if (!card) return;
  const r = buildWelcomeRecap();
  document.getElementById('wcDate').textContent = document.getElementById('dateLabel').textContent;
  document.getElementById('wcGreeting').textContent = r.greeting;
  document.getElementById('wcFlame').textContent = r.bestStreak >= 3
    ? `${streakFlare(r.bestStreak)} ${r.bestStreak}-day streak — protect it.`
    : (r.bestStreak > 0 ? `${r.bestStreak}-day streak — building.` : 'Start your streak today.');
  document.getElementById('wcLine').textContent = r.compareLine;
  const nudge = document.getElementById('wcNudge');
  if (nudge) nudge.style.display = r.showBackfillNudge ? 'block' : 'none';
  card.classList.add('show');
}
function dismissWelcome() {
  document.getElementById('welcomeCard').classList.remove('show');
  // Close out last week before anything else, while it's still fixable.
  if (weekReviewPending()) setTimeout(showWeekReview, 350);
}

// Jumps straight into backfill mode for yesterday — the direct action
// behind the welcome card's "forgot something?" nudge.
function backfillYesterday() {
  dismissWelcome();
  jumpToBackfill(fmtDate(addDays(parseDate(state.todayStr), -1)));
}

// Shared by every "go fix that day" entry point.
function jumpToBackfill(dateStr) {
  switchTab('wins');
  state.viewDate = dateStr;
  renderCategories();
  renderDaySwitcher();
  setTimeout(() => {
    const el = document.getElementById('daySwitcher');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

// ============================================
// WEEKLY REVIEW — backfill only reaches the current week's totals in
// the moment; once Monday rolls over, last week is done. This is the
// one prompt that catches anything still missing before that happens.
// ============================================
function lastWeekStr() {
  return getWeekStr(fmtDate(addDays(parseDate(state.weekStr), -1)));
}

function weekReviewPending() {
  const lw = lastWeekStr();
  if (lsGet(LS.weekreview, null) === lw) return false;
  // Nothing to review if the app has no history from before this week.
  return Object.keys(state.history).some(d => d < state.weekStr);
}

function buildWeekSummary(weekStart) {
  const start = parseDate(weekStart);
  let pts = 0, daysHit = 0, best = 0, workouts = 0, logged = 0;
  for (let i = 0; i < 7; i++) {
    const ds = fmtDate(addDays(start, i));
    const p = dayPoints(ds);
    pts += p;
    if (p > best) best = p;
    if (p > 0) logged++;
    if (p >= targetForDate(ds)) daysHit++;
    if (hasWin(ds, 'workout')) workouts++;
  }
  return { pts, daysHit, best, workouts, logged };
}

function showWeekReview() {
  const card = document.getElementById('weekReview');
  if (!card) return;
  const lw = lastWeekStr();
  const s = buildWeekSummary(lw);
  const end = fmtDate(addDays(parseDate(lw), 6));

  document.getElementById('wrRange').textContent =
    `${shortDateLabel(lw)} — ${shortDateLabel(end)}`;
  document.getElementById('wrPoints').textContent = s.pts;
  document.getElementById('wrHit').textContent = s.daysHit;
  document.getElementById('wrWorkouts').textContent = s.workouts;
  document.getElementById('wrBest').textContent = s.best;

  let verdict;
  if (s.logged === 0) verdict = "Nothing logged last week. If you did the work, add it before it closes.";
  else if (s.daysHit >= 6) verdict = 'Six-plus days on target. That was a genuinely strong week.';
  else if (s.daysHit >= 4) verdict = 'Solid week — most days on target.';
  else if (s.daysHit >= 2) verdict = 'A partial week. Anything missing that you forgot to log?';
  else verdict = 'Quiet week. Add anything you did but never logged.';
  document.getElementById('wrVerdict').textContent = verdict;

  card.classList.add('show');
}

function dismissWeekReview() {
  lsSet(LS.weekreview, lastWeekStr());
  document.getElementById('weekReview').classList.remove('show');
}

// "Add what's missing" — drops you on the last day of last week, from
// where the day switcher can reach every other day in it.
function weekReviewBackfill() {
  lsSet(LS.weekreview, lastWeekStr());
  document.getElementById('weekReview').classList.remove('show');
  jumpToBackfill(fmtDate(addDays(parseDate(lastWeekStr()), 6)));
}

// ============================================
// SYNC — offline queue + background sync
// ============================================
let queue = lsGet(LS.queue, []);
let flushing = false;

function setSyncStatus(status) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  if (status === 'syncing') {
    el.textContent = '○ Syncing...';
    el.className = 'sync-status syncing';
  } else if (status === 'offline') {
    const n = queue.length;
    el.textContent = n > 0 ? `◌ Offline — ${n} change${n > 1 ? 's' : ''} saved on phone` : '◌ Offline — saved on phone';
    el.className = 'sync-status offline';
  } else if (status === 'error') {
    el.textContent = '● Sync error — data safe on phone';
    el.className = 'sync-status error';
  } else {
    el.textContent = '● Synced';
    el.className = 'sync-status';
  }
}

function pushOp(op) {
  // Replace any queued op this one supersedes
  queue = queue.filter(o => {
    if (op.t === 'reset' && o.date === op.date) return false;
    if (o.t !== op.t || o.date !== op.date) return true;
    if (op.t === 'win') return o.id !== op.id;
    return false; // energy / reset for same date
  });
  queue.push(op);
  lsSet(LS.queue, queue);
  flushQueue();
}

async function flushQueue() {
  if (flushing || !db || !navigator.onLine) { if (queue.length) setSyncStatus('offline'); return; }
  if (queue.length === 0) return;
  flushing = true;
  setSyncStatus('syncing');
  try {
    while (queue.length) {
      const op = queue[0];
      if (op.t === 'win') await serverSaveWin(op.date, op.id, op.done);
      else if (op.t === 'energy') await serverSaveEnergy(op.date, op.level);
      else if (op.t === 'reset') await serverResetDay(op.date);
      queue.shift();
      lsSet(LS.queue, queue);
    }
    await serverSaveStats();
    setSyncStatus('synced');
  } catch (e) {
    console.error('Flush error:', e);
    setSyncStatus('offline');
  } finally {
    flushing = false;
  }
}

async function serverSaveWin(date, winId, completed) {
  const { data: existing, error: selErr } = await db.from('wins')
    .select('id').eq('date', date).eq('win_id', winId).maybeSingle();
  if (selErr) throw selErr;
  if (existing) {
    const { error } = await db.from('wins').update({ completed }).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await db.from('wins').insert({ date, win_id: winId, completed });
    if (error) throw error;
  }
}

async function serverSaveEnergy(date, level) {
  const { error: delErr } = await db.from('wins').delete().eq('date', date).like('win_id', 'energy_%');
  if (delErr) throw delErr;
  const { error } = await db.from('wins').insert({ date, win_id: `energy_${level}`, completed: true });
  if (error) throw error;
}

async function serverResetDay(date) {
  const { error } = await db.from('wins').delete().eq('date', date);
  if (error) throw error;
}

// Weekly summary row — best effort, display values are computed from history.
async function serverSaveStats() {
  try {
    const payload = {
      week_starting: state.weekStr,
      weekly_points: weekPoints(),
      streak_workout: computeStreak('workout'),
      streak_clean: computeStreak('noporn'),
      streak_read: computeStreak('read'),
      streak_steps: computeStreak('steps'),
      updated_at: new Date().toISOString(),
    };
    const { data: existing } = await db.from('stats')
      .select('id').eq('week_starting', state.weekStr).maybeSingle();
    if (existing) await db.from('stats').update(payload).eq('id', existing.id);
    else await db.from('stats').insert(payload);
  } catch (e) { console.error('Stats save error:', e); }
}

async function syncFromServer() {
  if (!db || !navigator.onLine) { if (queue.length) setSyncStatus('offline'); return; }
  setSyncStatus('syncing');
  try {
    const cutoff = fmtDate(addDays(new Date(), -HISTORY_DAYS));
    const { data, error } = await db.from('wins')
      .select('date, win_id')
      .eq('completed', true)
      .gte('date', cutoff);
    if (error) throw error;

    const hist = {};
    (data || []).forEach(r => { (hist[r.date] = hist[r.date] || []).push(r.win_id); });

    // Re-apply anything not yet pushed to the server
    queue.forEach(op => {
      if (op.t === 'reset') {
        delete hist[op.date];
      } else if (op.t === 'win') {
        const a = (hist[op.date] || []).filter(id => id !== op.id);
        if (op.done) a.push(op.id);
        hist[op.date] = a;
      } else if (op.t === 'energy') {
        const a = (hist[op.date] || []).filter(id => !id.startsWith('energy_'));
        a.push('energy_' + op.level);
        hist[op.date] = a;
      }
    });

    state.history = hist;
    saveLocal();
    renderAll();
    await flushQueue();
    if (!queue.length) setSyncStatus('synced');
  } catch (e) {
    console.error('Sync error:', e);
    setSyncStatus(queue.length ? 'offline' : 'error');
  }
}

// ============================================
// WINS TAB — UI
// ============================================
function getTodayPoints() { return dayPoints(state.todayStr); }

function updateHeader() {
  const todayPts = getTodayPoints();
  const target = todaysTarget();
  animateNumber(document.getElementById('totalPoints'), todayPts);

  document.getElementById('dailyPts').textContent = `${todayPts} / ${target} pts`;
  const dailyFill = document.getElementById('dailyFill');
  dailyFill.style.width = Math.min((todayPts / target) * 100, 100) + '%';
  dailyFill.classList.toggle('complete', todayPts >= target);
  const levelTag = document.getElementById('targetLevelTag');
  if (levelTag) {
    const lvl = energyToday();
    levelTag.textContent = lvl ? `· ${lvl[0].toUpperCase()}${lvl.slice(1)} energy` : '';
  }

  const weekPts = weekPoints();
  document.getElementById('weeklyPts').textContent = `${weekPts} / ${WEEKLY_TARGET} pts`;
  document.getElementById('progressFill').style.width = Math.min((weekPts / WEEKLY_TARGET) * 100, 100) + '%';

  const labels = ['Beginning', 'Building', 'Consistent', 'Strong', 'Unbreakable'];
  const level = Math.min(Math.floor(weekPts / 100) + 1, labels.length);
  document.getElementById('levelLabel').textContent = `Level ${level} — ${labels[level - 1]}`;
  document.getElementById('nextLevel').textContent = level >= labels.length
    ? 'Max level — hold the line'
    : `${level * 100 - weekPts}pts → Level ${level + 1}`;

  setStreak('streakWorkout', 'workout');
  setStreak('streakClean', 'noporn');
  setStreak('streakRead', 'read');
  setStreak('streakSteps', 'steps');
}

function setStreak(id, winId) {
  const info = computeStreakInfo(winId);
  animateNumber(document.getElementById(id), info.streak);
  const flareEl = document.getElementById(id + 'Flare');
  if (flareEl) flareEl.textContent = streakFlare(info.streak);

  // Shields left this month, so you can see the safety net before you need it.
  const graceEl = document.getElementById(id + 'Grace');
  if (graceEl) {
    const month = state.todayStr.slice(0, 7);
    const used = info.graceUsed[month] || 0;
    const left = Math.max(GRACE_PER_MONTH - used, 0);
    graceEl.textContent = '🛡️'.repeat(left) + '·'.repeat(used);
    graceEl.title = `${left} grace day${left === 1 ? '' : 's'} left this month`;
  }
}

const ENERGY_HINTS = {
  low: `Target dropped to ${DAILY_TARGETS.low}pts. Water, dua, a short reflection — a few small wins clears it. Protecting the streak matters more than the size of the day.`,
  medium: `Standard ${DAILY_TARGETS.medium}pt target. One full category plus a bit more gets you there.`,
  high: `Target raised to ${DAILY_TARGETS.high}pts — fuel's there, use it. Full workout plus a few extras.`,
};

function renderEnergyCheckin() {
  const container = document.getElementById('energyCheckin');
  const current = energyToday();
  const levels = [
    { key: 'low', label: 'Low', emoji: '🔋' },
    { key: 'medium', label: 'Medium', emoji: '⚡' },
    { key: 'high', label: 'High', emoji: '🔥' },
  ];

  container.innerHTML = `
    <div class="energy-title">Today's Energy</div>
    <div class="energy-buttons">
      ${levels.map(l => `
        <button class="energy-btn ${current === l.key ? 'active energy-' + l.key : ''}"
                onclick="setEnergy('${l.key}')">
          <span class="energy-emoji">${l.emoji}</span>
          <span class="energy-label">${l.label}</span>
        </button>
      `).join('')}
    </div>
    ${current ? `<div class="energy-note">${ENERGY_HINTS[current] || ''}</div>` : ''}
  `;
}

function setEnergy(level) {
  const today = state.todayStr;
  state.history[today] = winsOn(today).filter(id => !id.startsWith('energy_'));
  addWinLocal(today, 'energy_' + level);
  saveLocal();
  renderEnergyCheckin();
  updateHeader();
  updateAppBadge();
  pushOp({ t: 'energy', date: today, level });
}

// ============================================
// DAY SWITCHER — backfill a missed day. Only the
// Categories checklist below it is date-scoped;
// everything else always stays anchored to today.
// ============================================
function shiftViewDate(delta) {
  const nd = fmtDate(addDays(parseDate(state.viewDate), delta));
  if (nd > state.todayStr) return;
  const oldest = fmtDate(addDays(parseDate(state.todayStr), -BACKFILL_DAYS));
  if (nd < oldest) return;
  state.viewDate = nd;
  renderCategories();
  renderDaySwitcher();
}

function jumpToToday() {
  if (state.viewDate === state.todayStr) return;
  state.viewDate = state.todayStr;
  renderCategories();
  renderDaySwitcher();
}

function renderDaySwitcher() {
  const vd = state.viewDate;
  const isToday = vd === state.todayStr;
  const isYesterday = vd === fmtDate(addDays(parseDate(state.todayStr), -1));
  const oldest = fmtDate(addDays(parseDate(state.todayStr), -BACKFILL_DAYS));

  const labelEl = document.getElementById('viewDateLabel');
  const ptsEl = document.getElementById('viewDatePts');
  const prevBtn = document.getElementById('viewDatePrev');
  const nextBtn = document.getElementById('viewDateNext');
  const backBtn = document.getElementById('viewDateBackBtn');
  const switcherEl = document.getElementById('daySwitcher');
  if (!labelEl) return;

  labelEl.textContent = isToday ? 'Today' : (isYesterday ? 'Yesterday' : shortDateLabel(vd));
  ptsEl.textContent = `${dayPoints(vd)}pts logged`;
  prevBtn.disabled = vd <= oldest;
  nextBtn.disabled = isToday;
  backBtn.style.display = isToday ? 'none' : 'block';
  switcherEl.classList.toggle('past', !isToday);
}

function renderCategories() {
  const container = document.getElementById('categories');
  container.innerHTML = '';
  const vd = state.viewDate;

  CATEGORIES.forEach(cat => {
    const catPtsToday = cat.wins
      .filter(w => hasWin(vd, w.id))
      .reduce((sum, w) => sum + w.pts, 0);
    const bonusEarned = hasWin(vd, 'bonus_' + cat.id);

    const div = document.createElement('div');
    div.className = 'category';
    const isOpen = cat.id === openCat;

    div.innerHTML = `
      <div class="category-header ${isOpen ? 'open' : ''}" onclick="toggleCat('${cat.id}')">
        <div class="cat-left">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-name">${cat.name}</span>
        </div>
        <div class="cat-right">
          ${bonusEarned ? `<span class="cat-star">⭐</span>` : ''}
          ${catPtsToday > 0 ? `<span class="cat-pts-today">+${catPtsToday}pts</span>` : ''}
          <span class="cat-chevron">▼</span>
        </div>
      </div>
      <div class="category-body ${isOpen ? 'open' : ''}" id="body-${cat.id}">
        ${cat.wins.map(win => {
          const wKg = win.id === 'weighin' ? weightOn(vd) : null;
          return `
          <div class="win-item ${hasWin(vd, win.id) ? 'completed' : ''}"
               id="win-${win.id}"
               onclick="toggleWin('${win.id}', event)">
            <div class="win-left">
              <div class="win-check" ${win.id === popId ? 'style="animation:winPop 0.4s ease;"' : ''}>
                <div class="win-check-inner"></div>
              </div>
              <div class="win-text">
                <div class="win-name">${win.name}${wKg !== null ? ` <span class="win-value">${fmtWeight(wKg)}</span>` : ''}</div>
                <div class="win-desc">${win.desc}</div>
              </div>
            </div>
            <div class="win-pts">${win.pts}</div>
          </div>`;
        }).join('')}
        ${bonusEarned ? `<div class="cat-bonus">⭐ ${cat.name} cleared — +${CATEGORY_BONUS_PTS} bonus earned</div>` : ''}
      </div>
    `;
    container.appendChild(div);
  });

  popId = null;
}

function renderRewards() {
  const bank = rewardBank();
  animateNumber(document.getElementById('rewardBalance'), bank);

  const container = document.getElementById('rewardsList');
  container.innerHTML = REWARDS.map(r => {
    const affordable = bank >= r.pts;
    return `
      <div class="reward-item ${affordable ? 'unlocked' : ''}">
        <div class="reward-left">
          <div class="reward-name">${r.name}</div>
          <div class="reward-desc">${r.desc}</div>
        </div>
        <div class="reward-right">
          <div class="reward-cost">${r.pts}</div>
          ${affordable
            ? `<button class="reward-redeem-btn" onclick="redeemReward('${r.id}')">Redeem</button>`
            : `<div class="reward-need">${r.pts - bank} more</div>`}
        </div>
      </div>`;
  }).join('');

  const histEl = document.getElementById('redemptionHistory');
  if (!histEl) return;
  const redemptions = [];
  Object.keys(state.history).sort().reverse().forEach(d => {
    winsOn(d).forEach(id => {
      if (!id.startsWith('redeem_')) return;
      const r = REWARDS.find(x => x.id === id.slice('redeem_'.length));
      redemptions.push({ date: d, name: r ? r.name : 'Redeemed reward', pts: r ? r.pts : 0 });
    });
  });
  histEl.innerHTML = redemptions.length
    ? `<div class="redeem-hist-title">Redeemed</div>` + redemptions.slice(0, 10).map(h => {
        const dt = parseDate(h.date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `<div class="redeem-hist-item"><span>${h.name}</span><span>${dt.getDate()} ${months[dt.getMonth()]} · -${h.pts}pts</span></div>`;
      }).join('')
    : '';
}

function toggleCat(id) {
  openCat = (openCat === id) ? null : id;
  renderCategories();
}

// Core state mutation shared by user taps and auto-logged wins.
// dateStr defaults to real today; the categories checklist passes
// state.viewDate explicitly so backfilling a past day works the same way.
function _setWin(winId, done, dateStr) {
  const d = dateStr || state.todayStr;
  if (done) addWinLocal(d, winId);
  else removeWinLocal(d, winId);
  saveLocal();
  pushOp({ t: 'win', date: d, id: winId, done });
}

function _afterWinChange(catId, dateStr) {
  renderCategories();
  renderDaySwitcher();
  updateHeader();
  renderRewards();
  renderJourney();
  syncCategoryBonus(catId, dateStr);
  evaluateAchievements(true);
  updateAppBadge();
}

// Always acts on whatever day the checklist is currently showing
// (state.viewDate) — today by default, or a backfilled past day.
function toggleWin(winId, evt) {
  const win = WIN_INDEX[winId];
  if (!win) return;
  // The weigh-in isn't a plain checkbox — it captures a number.
  if (winId === 'weighin') { openWeightModal(); return; }
  const dateStr = state.viewDate;
  const isToday = dateStr === state.todayStr;
  const was = hasWin(dateStr, winId);
  const prevPts = dayPoints(dateStr);
  const done = !was;

  if (done) popId = winId;
  _setWin(winId, done, dateStr);

  if (done) {
    sndTick();
    if (evt) burstConfettiAt(evt.clientX, evt.clientY, 14);
    const now = prevPts + win.pts;
    const target = targetForDate(dateStr);
    if (prevPts < target && now >= target) {
      sndTarget();
      const label = isToday ? 'Daily' : shortDateLabel(dateStr) + "'s";
      showToast(`🎯 ${target}pts — ${label} target hit. Strong day.`);
      burstConfettiAt(window.innerWidth / 2, 160, 40, true);
    } else {
      showToast(`+${win.pts}pts${isToday ? '' : ' — ' + shortDateLabel(dateStr)} — well done.`);
    }
  } else {
    sndUntick();
    showToast(`-${win.pts}pts removed${isToday ? '' : ' — ' + shortDateLabel(dateStr)}`);
  }

  _afterWinChange(win.catId, dateStr);
}

// ============================================
// WEIGHT ENTRY MODAL
// ============================================
function openWeightModal() {
  const dateStr = state.viewDate;
  const existing = weightOn(dateStr);
  const last = latestWeight();

  document.getElementById('wgDate').textContent =
    dateStr === state.todayStr ? 'Today' : shortDateLabel(dateStr);

  const input = document.getElementById('wgInput');
  // Prefill with the last known weight — it barely moves day to day, so
  // this is usually a nudge of the decimal rather than a fresh entry.
  const seed = existing !== null ? existing : (last ? last.kg : null);
  input.value = seed !== null ? toDisplayWeight(seed).toFixed(1) : '';
  document.getElementById('wgUnit').textContent = weightUnit();

  const removeBtn = document.getElementById('wgRemove');
  removeBtn.style.display = existing !== null ? 'block' : 'none';

  // Show the delta against the previous weigh-in, not against nothing.
  const prev = allWeights().filter(w => w.date < dateStr).pop();
  const hint = document.getElementById('wgHint');
  hint.textContent = prev
    ? `Last: ${fmtWeight(prev.kg)} on ${shortDateLabel(prev.date)}`
    : 'First weigh-in — this becomes your baseline.';

  document.getElementById('weightModal').classList.add('show');
  setTimeout(() => { input.focus(); input.select(); }, 250);
}

function closeWeightModal() {
  document.getElementById('weightModal').classList.remove('show');
}

function toggleWeightUnit() {
  const input = document.getElementById('wgInput');
  const current = parseFloat(input.value);
  const kg = Number.isFinite(current) ? fromDisplayWeight(current) : null;
  lsSet(LS.weightUnit, weightUnit() === 'kg' ? 'lb' : 'kg');
  document.getElementById('wgUnit').textContent = weightUnit();
  if (kg !== null) input.value = toDisplayWeight(kg).toFixed(1);
  const prev = allWeights().filter(w => w.date < state.viewDate).pop();
  if (prev) document.getElementById('wgHint').textContent =
    `Last: ${fmtWeight(prev.kg)} on ${shortDateLabel(prev.date)}`;
  renderJourney();
}

function saveWeight() {
  const dateStr = state.viewDate;
  const raw = parseFloat(document.getElementById('wgInput').value);
  if (!Number.isFinite(raw) || raw <= 0) { showToast('Enter a valid weight.'); return; }

  const kg = fromDisplayWeight(raw);
  if (kg < 20 || kg > 400) { showToast('That doesn\'t look right — check the number.'); return; }

  const prev = allWeights().filter(w => w.date < dateStr).pop();
  setWeightFor(dateStr, kg);

  // Recording a number also earns the weigh-in win itself.
  const alreadyTicked = hasWin(dateStr, 'weighin');
  if (!alreadyTicked) _setWin('weighin', true, dateStr);

  closeWeightModal();
  sndTick();
  burstConfettiAt(window.innerWidth / 2, 200, 18);

  if (prev) {
    const diffKg = kg - prev.kg;
    const diffTxt = (Math.abs(toDisplayWeight(Math.abs(diffKg)))).toFixed(1) + ' ' + weightUnit();
    if (Math.abs(diffKg) < 0.05) showToast(`${fmtWeight(kg)} — holding steady.`);
    else showToast(`${fmtWeight(kg)} — ${diffKg < 0 ? '↓' : '↑'} ${diffTxt} since last`);
  } else {
    showToast(`${fmtWeight(kg)} logged — baseline set.`);
  }

  _afterWinChange('body', dateStr);
}

function removeWeight() {
  const dateStr = state.viewDate;
  clearWeightFor(dateStr);
  if (hasWin(dateStr, 'weighin')) _setWin('weighin', false, dateStr);
  closeWeightModal();
  sndUntick();
  showToast('Weigh-in removed.');
  _afterWinChange('body', dateStr);
}

// Programmatic win logging (workout complete, reflection saved) — always
// applies to real today, regardless of what day the checklist is showing.
function autoLogWin(winId) {
  if (hasWin(state.todayStr, winId)) return false;
  const win = WIN_INDEX[winId];
  if (!win) return false;
  popId = (state.viewDate === state.todayStr) ? winId : null;
  _setWin(winId, true, state.todayStr);
  sndTick();
  _afterWinChange(win.catId, state.todayStr);
  return true;
}

function syncCategoryBonus(catId, dateStr) {
  const d = dateStr || state.todayStr;
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return;
  const bonusId = 'bonus_' + catId;
  const allDone = cat.wins.every(w => hasWin(d, w.id));
  const hasBonus = hasWin(d, bonusId);

  if (allDone && !hasBonus) {
    _setWin(bonusId, true, d);
    sndBonus();
    const suffix = d === state.todayStr ? '' : ` (${shortDateLabel(d)})`;
    showToast(`⭐ ${cat.name} cleared${suffix} — +${CATEGORY_BONUS_PTS} bonus`);
    burstConfettiAt(window.innerWidth / 2, 220, 26, true);
    renderCategories();
    updateHeader();
    renderRewards();
  } else if (!allDone && hasBonus) {
    _setWin(bonusId, false, d);
    renderCategories();
    updateHeader();
    renderRewards();
  }
}

function resetDay() {
  if (!confirm('Reset today\'s check-ins? Only today is cleared — your history stays.')) return;
  delete state.history[state.todayStr];
  saveLocal();
  renderAll();
  updateAppBadge();
  showToast('Today reset. Start fresh.');
  pushOp({ t: 'reset', date: state.todayStr });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function setDateAndStoic() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  document.getElementById('dateLabel').textContent =
    `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  // Rotate through the full list day by day (not just by weekday)
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const s = STOIC[dayOfYear % STOIC.length];
  document.getElementById('stoicQuote').textContent = s.q;
  document.getElementById('stoicAttr').textContent = s.a;
}

// ============================================
// JOURNEY TAB — history, insights, reflection
// ============================================
// Relative to that day's own target, so a strong low-energy day reads
// as a win instead of "meh" against a flat number that never applied.
function heatClass(dateStr) {
  const pts = dayPoints(dateStr);
  const target = targetForDate(dateStr);
  if (pts <= 0) return 'h0';
  if (pts < target * 0.4) return 'h1';
  if (pts < target * 0.8) return 'h2';
  if (pts < target) return 'h3';
  return 'h4';
}

function renderJourney() {
  const container = document.getElementById('tab-journey');
  if (!container) return;
  const today = parseDate(state.todayStr);

  // --- Stat tiles ---
  const wk = weekPoints();
  let best = 0;
  for (let i = 0; i < 84; i++) best = Math.max(best, dayPoints(fmtDate(addDays(today, -i))));
  const workouts30 = countInLastDays(30, 'workout');
  const clean30 = countInLastDays(30, 'noporn');
  document.getElementById('journeyStats').innerHTML = `
    <div class="j-tile"><div class="j-num" id="jStatWeek">0</div><div class="j-lbl">Points this week</div></div>
    <div class="j-tile"><div class="j-num" id="jStatBest">0</div><div class="j-lbl">Best day (12wk)</div></div>
    <div class="j-tile"><div class="j-num" id="jStatWo">0</div><div class="j-lbl">Workouts (30d)</div></div>
    <div class="j-tile"><div class="j-num" id="jStatClean">0</div><div class="j-lbl">Clean days (30d)</div></div>
  `;
  animateNumber(document.getElementById('jStatWeek'), wk);
  animateNumber(document.getElementById('jStatBest'), best);
  animateNumber(document.getElementById('jStatWo'), workouts30);
  animateNumber(document.getElementById('jStatClean'), clean30);

  // --- Last 7 days bars ---
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  let barsHtml = '';
  let maxPts = DAILY_TARGETS.medium;
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const ds = fmtDate(d);
    const pts = dayPoints(ds);
    maxPts = Math.max(maxPts, pts);
    week.push({ d, ds, pts, isToday: i === 0 });
  }
  week.forEach(({ d, ds, pts, isToday }) => {
    const h = Math.max(Math.round((pts / maxPts) * 100), 3);
    barsHtml += `
      <div class="j-bar-col">
        <div class="j-bar-val">${pts > 0 ? pts : ''}</div>
        <div class="j-bar-track"><div class="j-bar ${isToday ? 'today' : ''} ${pts >= targetForDate(ds) ? 'hit' : ''}" style="height:${h}%"></div></div>
        <div class="j-bar-day ${isToday ? 'today' : ''}">${dayLetters[d.getDay()]}</div>
      </div>`;
  });
  document.getElementById('journeyBars').innerHTML = barsHtml;

  // --- 12-week heatmap (columns = weeks, rows = Mon..Sun) ---
  const gridStart = parseDate(getWeekStr(fmtDate(addDays(today, -77)))); // Monday, 12 weeks back
  let cells = '';
  for (let w = 0; w < 12; w++) {
    for (let day = 0; day < 7; day++) {
      const d = addDays(gridStart, w * 7 + day);
      const ds = fmtDate(d);
      if (ds > state.todayStr) { cells += '<div class="hm-cell future"></div>'; continue; }
      cells += `<div class="hm-cell ${heatClass(ds)} ${ds === state.todayStr ? 'today' : ''}"></div>`;
    }
  }
  document.getElementById('heatmap').innerHTML = cells;

  // --- Weight ---
  renderWeightSection();

  // --- Achievements ---
  renderAchievements();

  // --- Reflection list (textarea content is preserved separately) ---
  const reflections = lsGet(LS.reflect, {});
  const input = document.getElementById('reflectInput');
  if (input && document.activeElement !== input) {
    input.value = reflections[state.todayStr] || '';
  }
  const entries = Object.keys(reflections)
    .filter(d => d !== state.todayStr)
    .sort()
    .reverse()
    .slice(0, 14);
  document.getElementById('reflectList').innerHTML = entries.length
    ? entries.map(d => {
        const dt = parseDate(d);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `
          <div class="reflect-entry">
            <div class="reflect-date">${dt.getDate()} ${months[dt.getMonth()]} · ${dayPoints(d)}pts</div>
            <div class="reflect-text">${escapeHtml(reflections[d])}</div>
          </div>`;
      }).join('')
    : '<div class="reflect-empty">Past reflections will appear here.</div>';
}

// ============================================
// WEIGHT TREND
// Line chart: change over time, single series (no legend needed — the
// heading names it). Y axis is scaled to the data, not zero-based —
// weight moves in a narrow band and a zero baseline would flatten every
// real change into a straight line. Min/max are labelled so the scale
// is explicit rather than implied.
// ============================================
function renderWeightSection() {
  const wrap = document.getElementById('weightSection');
  if (!wrap) return;

  const all = allWeights();
  const unit = weightUnit();

  if (all.length === 0) {
    wrap.innerHTML = `
      <div class="j-section-title">Weight</div>
      <div class="weight-empty">
        No weigh-ins yet. Tap <strong>Weigh in</strong> under Body on the Wins tab to record your first — it becomes your baseline.
      </div>`;
    return;
  }

  const latest = all[all.length - 1];
  const first = all[0];

  // Compare against the nearest entry at least 30 days old, if there is one.
  const cutoff = fmtDate(addDays(parseDate(state.todayStr), -30));
  const older = all.filter(w => w.date <= cutoff);
  const ref = older.length ? older[older.length - 1] : first;
  const refIsFirst = ref.date === first.date;

  const diffKg = latest.kg - ref.kg;
  const diffAbs = Math.abs(toDisplayWeight(Math.abs(diffKg))).toFixed(1);
  const dirClass = diffKg < -0.05 ? 'down' : (diffKg > 0.05 ? 'up' : 'flat');
  const arrow = diffKg < -0.05 ? '↓' : (diffKg > 0.05 ? '↑' : '→');
  const sinceLabel = refIsFirst ? 'since first weigh-in' : 'over 30 days';

  const totalKg = latest.kg - first.kg;
  const totalTxt = (Math.abs(toDisplayWeight(Math.abs(totalKg)))).toFixed(1);

  wrap.innerHTML = `
    <div class="j-section-title">
      Weight
      <button class="unit-toggle" onclick="toggleWeightUnit()">${unit} ⇄</button>
    </div>
    <div class="weight-card">
      <div class="weight-hero">
        <div>
          <div class="weight-now">${toDisplayWeight(latest.kg).toFixed(1)}<span class="weight-unit">${unit}</span></div>
          <div class="weight-when">${shortDateLabel(latest.date)}</div>
        </div>
        <div class="weight-delta ${dirClass}">
          <div class="wd-value">${arrow} ${diffAbs}${unit}</div>
          <div class="wd-label">${sinceLabel}</div>
        </div>
      </div>
      ${weightChartSvg(all)}
      <div class="weight-foot">
        <span>${all.length} weigh-in${all.length === 1 ? '' : 's'}</span>
        <span>${totalKg === 0 ? 'No net change' : `${totalKg < 0 ? '↓' : '↑'} ${totalTxt}${unit} all time`}</span>
      </div>
    </div>
    <div class="weight-log" id="weightLog">
      ${all.slice(-8).reverse().map((w, i, arr) => {
        const prev = arr[i + 1];
        const d = prev ? w.kg - prev.kg : null;
        const dTxt = d === null ? '—'
          : (Math.abs(d) < 0.05 ? '±0.0'
            : `${d < 0 ? '−' : '+'}${Math.abs(toDisplayWeight(Math.abs(d))).toFixed(1)}`);
        const dCls = d === null || Math.abs(d) < 0.05 ? 'flat' : (d < 0 ? 'down' : 'up');
        return `<div class="wl-row">
          <span class="wl-date">${shortDateLabel(w.date)}</span>
          <span class="wl-kg">${toDisplayWeight(w.kg).toFixed(1)}${unit}</span>
          <span class="wl-diff ${dCls}">${dTxt}</span>
        </div>`;
      }).join('')}
    </div>`;
}

function weightChartSvg(all) {
  // Cap to the retained window so the line stays legible.
  const pts = all.slice(-40);
  if (pts.length < 2) {
    return `<div class="weight-single">One entry so far — the trend line appears from your second weigh-in.</div>`;
  }

  // padR reserves a gutter for the scale labels so they can never collide
  // with the line, whichever direction the trend runs.
  const W = 300, H = 110, padL = 6, padR = 34, padT = 12, padB = 16;
  const vals = pts.map(p => toDisplayWeight(p.kg));
  let min = Math.min(...vals), max = Math.max(...vals);
  if (max - min < 1) { const mid = (max + min) / 2; min = mid - 0.5; max = mid + 0.5; }
  const pad = (max - min) * 0.15;
  min -= pad; max += pad;

  const t0 = parseDate(pts[0].date).getTime();
  const t1 = parseDate(pts[pts.length - 1].date).getTime();
  const span = Math.max(t1 - t0, 1);
  const x = p => padL + ((parseDate(p.date).getTime() - t0) / span) * (W - padL - padR);
  const y = v => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  const coords = pts.map((p, i) => ({ x: x(p), y: y(vals[i]), v: vals[i], date: p.date }));
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${H - padB} L${coords[0].x.toFixed(1)},${H - padB} Z`;

  const last = coords[coords.length - 1];
  const unit = weightUnit();

  // Hit targets are wider than the marks so tapping a point is easy on a phone.
  const hits = coords.map((c, i) => {
    const halfW = (W - padL - padR) / Math.max(coords.length - 1, 1) / 2 + 4;
    return `<rect x="${Math.max(c.x - halfW, 0).toFixed(1)}" y="0" width="${(halfW * 2).toFixed(1)}" height="${H}"
      fill="transparent" class="wc-hit"
      onclick="showWeightPoint(event, '${c.date}', '${c.v.toFixed(1)}')"></rect>`;
  }).join('');

  return `
    <div class="weight-chart">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"
           aria-label="Weight trend, ${vals[0].toFixed(1)} to ${vals[vals.length-1].toFixed(1)} ${unit}">
        <line class="wc-grid" x1="${padL}" y1="${y(max - pad).toFixed(1)}" x2="${W - padR}" y2="${y(max - pad).toFixed(1)}"/>
        <line class="wc-grid" x1="${padL}" y1="${y(min + pad).toFixed(1)}" x2="${W - padR}" y2="${y(min + pad).toFixed(1)}"/>
        <path class="wc-area" d="${area}"/>
        <path class="wc-line" d="${line}"/>
        ${coords.map(c => `<circle class="wc-dot" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="2.5"/>`).join('')}
        <circle class="wc-dot-last" cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="4"/>
        ${hits}
      </svg>
      <div class="wc-scale">
        <span>${(max - pad).toFixed(1)}</span>
        <span>${(min + pad).toFixed(1)}</span>
      </div>
      <div class="wc-tip" id="wcTip"></div>
    </div>`;
}

function showWeightPoint(evt, dateStr, val) {
  const tip = document.getElementById('wcTip');
  if (!tip) return;
  tip.textContent = `${shortDateLabel(dateStr)} · ${val}${weightUnit()}`;
  tip.classList.add('show');
  clearTimeout(showWeightPoint._t);
  showWeightPoint._t = setTimeout(() => tip.classList.remove('show'), 2200);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function saveReflection() {
  const input = document.getElementById('reflectInput');
  const txt = input.value.trim();
  const r = lsGet(LS.reflect, {});
  if (txt) r[state.todayStr] = txt;
  else delete r[state.todayStr];
  lsSet(LS.reflect, r);
  input.blur();

  // A real reflection earns the 'reflect' win automatically
  if (txt.length >= 20 && autoLogWin('reflect')) {
    showToast('Reflection saved — +6pts logged.');
  } else {
    showToast(txt ? 'Reflection saved.' : 'Reflection cleared.');
  }
  renderJourney();
}

// ============================================
// WORKOUT TAB
// ============================================
const WO_TOTAL = 8;
const REST_SECONDS = 60;
const CIRCUMFERENCE = 408;

let wo = { round: 1, done: [] };
let restTimer = null;
let restEndsAt = 0;

function loadWorkout() {
  const s = lsGet(LS.workout, null);
  if (s && s.date === state.todayStr) {
    wo.round = s.round || 1;
    wo.done = Array.isArray(s.done) ? s.done : [];
  } else {
    wo = { round: 1, done: [] };
  }
  applyWorkoutUI();
}

function saveWorkoutLocal() {
  lsSet(LS.workout, { date: state.todayStr, round: wo.round, done: wo.done });
}

function applyWorkoutUI() {
  document.querySelectorAll('.exercise-card').forEach(card => {
    const id = Number(card.dataset.id);
    card.classList.toggle('completed', wo.done.includes(id));
  });
  document.getElementById('doneCount').textContent = wo.done.length;
  document.getElementById('roundLabel').textContent = 'ROUND ' + wo.round;
  const dot1 = document.getElementById('dot1');
  const dot2 = document.getElementById('dot2');
  dot1.classList.toggle('done', wo.round === 2);
  dot1.classList.toggle('active', wo.round === 1);
  dot2.classList.toggle('active', wo.round === 2);
}

function tickExercise(id, evt) {
  const i = wo.done.indexOf(id);
  const nowDone = i < 0;
  if (i >= 0) { wo.done.splice(i, 1); sndUntick(); }
  else { wo.done.push(id); sndTick(); if (evt) burstConfettiAt(evt.clientX, evt.clientY, 12); }
  saveWorkoutLocal();
  applyWorkoutUI();
  if (wo.done.length === WO_TOTAL) {
    if (wo.round === 1) setTimeout(showRest, 400);
    else setTimeout(showCelebration, 400);
  }
}

function showRest() {
  document.getElementById('restScreen').classList.add('show');
  startRestTimer();
}

// Timestamp-based so it stays correct if iOS throttles timers or
// the phone locks mid-rest.
function startRestTimer() {
  restEndsAt = Date.now() + REST_SECONDS * 1000;
  updateRestTimer();
  restTimer = setInterval(updateRestTimer, 250);
}

function updateRestTimer() {
  const remaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
  document.getElementById('timerNum').textContent = remaining;
  document.getElementById('timerFill').style.strokeDashoffset =
    CIRCUMFERENCE * (1 - remaining / REST_SECONDS);
  if (remaining <= 0) startRound2();
}

function startRound2() {
  if (restTimer) { clearInterval(restTimer); restTimer = null; }
  document.getElementById('restScreen').classList.remove('show');
  wo.round = 2;
  wo.done = [];
  saveWorkoutLocal();
  applyWorkoutUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Round 2 — finish strong.');
}

function showCelebration() {
  document.getElementById('celebration').classList.add('show');
  spawnConfetti();
  sndTarget();
  const note = document.getElementById('celAutolog');
  if (autoLogWin('workout')) {
    note.textContent = '✓ Workout win logged automatically — +15pts';
  } else {
    note.textContent = '✓ Workout win already logged today';
  }
}

function spawnConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#c8a040', '#f0ebe0', '#c4614a', '#5a8f6a', '#5a7a9f'];
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      piece.style.width = (Math.random() * 8 + 4) + 'px';
      piece.style.height = (Math.random() * 8 + 4) + 'px';
      piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }, i * 40);
  }
}

function goToWins() {
  document.getElementById('celebration').classList.remove('show');
  switchTab('wins');
}

function resetWorkout() {
  document.getElementById('celebration').classList.remove('show');
  wo = { round: 1, done: [] };
  saveWorkoutLocal();
  applyWorkoutUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// TABS + WAKE LOCK
// ============================================
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch (e) { /* not critical */ }
}
function releaseWakeLock() {
  try { if (wakeLock) wakeLock.release(); } catch (e) { /* ignore */ }
  wakeLock = null;
}

function switchTab(tab) {
  // Never leave the checklist silently stuck on a backfilled day —
  // stepping away from Wins always snaps it back to today.
  if (tab !== 'wins' && state.viewDate !== state.todayStr) {
    state.viewDate = state.todayStr;
    renderCategories();
    renderDaySwitcher();
  }
  currentTab = tab;
  document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('nav-' + tab).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Keep the screen awake during a workout (holds through wall sits & timers)
  if (tab === 'workout') requestWakeLock();
  else releaseWakeLock();
}

// ============================================
// DAY ROLLOVER — iPhone keeps PWAs alive
// across days; refresh state when date changes
// ============================================
function checkRollover() {
  const t = getTodayStr();
  if (t !== state.todayStr) {
    state.todayStr = t;
    state.weekStr = getWeekStr();
    state.viewDate = t;
    setDateAndStoic();
    loadWorkout(); // new day = fresh workout
    renderAll();
    updateAppBadge();
    showToast('New day. Fresh start.');
    setTimeout(showWelcomeCard, 400);
  }
}

// ============================================
// EVENING REMINDER — Web Push.
//
// iOS delivers push to PWAs only when they're installed to the home
// screen (16.4+), and permission must come from a real tap. The
// subscription is stored in Supabase; a scheduled Edge Function sends
// the nightly nudge. See README "Evening reminders" for the one-time
// server setup — until it's deployed, this stays switched off and the
// app icon badge remains the passive nudge.
// ============================================
const VAPID_PUBLIC_KEY = ''; // set to your VAPID public key after setup
const REMINDER_HOUR = 20;    // 8pm local, sent by the scheduled function

function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
function pushConfigured() { return !!VAPID_PUBLIC_KEY; }
// iOS only grants push to a PWA launched from the home screen.
function isStandalone() {
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function renderReminderRow() {
  const btn = document.getElementById('reminderToggle');
  const note = document.getElementById('reminderNote');
  if (!btn || !note) return;

  if (!pushSupported() || !pushConfigured()) {
    btn.textContent = 'Unavailable';
    btn.disabled = true;
    note.textContent = pushSupported()
      ? 'Reminders need the server step in the README.'
      : 'This browser can\'t do push notifications.';
    return;
  }
  if (!isStandalone() && Notification.permission !== 'granted') {
    btn.textContent = 'Add to Home Screen';
    btn.disabled = true;
    note.textContent = 'Install the app to your home screen to enable reminders.';
    return;
  }
  if (Notification.permission === 'denied') {
    btn.textContent = 'Blocked';
    btn.disabled = true;
    note.textContent = 'Notifications are blocked in iOS Settings for this app.';
    return;
  }

  const on = lsGet(LS.reminder, false);
  btn.disabled = false;
  btn.textContent = on ? 'On' : 'Off';
  btn.classList.toggle('on', on);
  note.textContent = on
    ? `Nightly nudge at ${REMINDER_HOUR}:00 if the day isn't logged.`
    : 'Get a nightly nudge to log your wins.';
}

async function toggleReminders() {
  if (!pushSupported() || !pushConfigured()) return;

  if (lsGet(LS.reminder, false)) {
    await disableReminders();
  } else {
    await enableReminders();
  }
  renderReminderRow();
}

async function enableReminders() {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { showToast('Notifications not allowed.'); return; }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    if (db) {
      const json = sub.toJSON();
      const { error } = await db.from('push_subscriptions').upsert({
        endpoint: sub.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        reminder_hour: REMINDER_HOUR,
        tz_offset_minutes: new Date().getTimezoneOffset(),
        enabled: true,
      }, { onConflict: 'endpoint' });
      if (error) throw error;
    }
    lsSet(LS.reminder, true);
    showToast('🔔 Evening reminders on.');
  } catch (e) {
    console.error('Enable reminders failed:', e);
    showToast('Could not turn on reminders.');
  }
}

async function disableReminders() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      if (db) await db.from('push_subscriptions').update({ enabled: false }).eq('endpoint', sub.endpoint);
      await sub.unsubscribe();
    }
  } catch (e) {
    console.error('Disable reminders failed:', e);
  }
  lsSet(LS.reminder, false);
  showToast('Evening reminders off.');
}

// Keep the stored timezone fresh so the nightly send stays at 8pm local
// even after travel; also self-heals if iOS rotated the subscription.
async function refreshPushSubscription() {
  if (!pushSupported() || !pushConfigured() || !db) return;
  if (!lsGet(LS.reminder, false)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) { lsSet(LS.reminder, false); renderReminderRow(); return; }
    const json = sub.toJSON();
    await db.from('push_subscriptions').upsert({
      endpoint: sub.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      reminder_hour: REMINDER_HOUR,
      tz_offset_minutes: new Date().getTimezoneOffset(),
      enabled: true,
    }, { onConflict: 'endpoint' });
  } catch (e) { console.error('Refresh subscription failed:', e); }
}

// ============================================
// INIT
// ============================================
function renderAll() {
  updateHeader();
  renderEnergyCheckin();
  renderCategories();
  renderDaySwitcher();
  renderRewards();
  renderJourney();
}

function init() {
  state.history = lsGet(LS.history, {});
  soundOn = lsGet(LS.sound, true);
  setDateAndStoic();
  renderAll();
  loadWorkout();
  updateAppBadge();

  const soundBtn = document.getElementById('soundToggle');
  if (soundBtn) soundBtn.textContent = soundOn ? '🔊' : '🔇';
  renderReminderRow();

  // Show instantly from local cache — network happens in the background
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  setTimeout(showWelcomeCard, 350);

  if (!db) setSyncStatus(navigator.onLine ? 'error' : 'offline');
  syncFromServer().then(() => {
    evaluateAchievements(false);
    renderJourney();
    updateAppBadge();
    refreshPushSubscription();
  });

  setInterval(checkRollover, 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkRollover();
      flushQueue();
      if (currentTab === 'workout') requestWakeLock();
    }
  });
  window.addEventListener('online', () => { flushQueue(); });
  window.addEventListener('pagehide', saveLocal);
}

init();
