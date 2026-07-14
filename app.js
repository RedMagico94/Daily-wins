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
      { id: 'weighin', name: 'Weigh in (Mon or Fri)', desc: 'Record it. No judgment.', pts: 10 },
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

// Priced against a realistic week: a solid day is ~60-80pts,
// so a strong week lands between 400 and 550.
const REWARDS = [
  { name: 'Early night pass', desc: 'Bed at 9:30pm — no guilt, no to-do list', pts: 150 },
  { name: 'Guilt-free rest day', desc: 'Skip one workout this week with no guilt or tracking', pts: 250 },
  { name: 'Choose the weekend activity', desc: 'You pick — football, gym, food, whatever you want', pts: 350 },
  { name: 'One full morning to yourself', desc: 'Laeeqa holds the fort — you get 2 hours, no obligations', pts: 450 },
  { name: 'Vietnam treat', desc: 'One meal, experience, or activity just for you in Vietnam', pts: 550 },
];

const DAILY_TARGET = 60;
const WEEKLY_TARGET = 400;
const HISTORY_DAYS = 84; // 12 weeks kept locally + fetched from server

// Fast lookup: win_id -> { ...win, catId }
const WIN_INDEX = {};
CATEGORIES.forEach(c => c.wins.forEach(w => { WIN_INDEX[w.id] = { ...w, catId: c.id }; }));

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
};

function lsGet(k, fallback) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full/private mode */ }
}

let state = {
  history: {},              // 'YYYY-MM-DD' -> [win_id, ...] (completed, incl. energy_*)
  todayStr: getTodayStr(),
  weekStr: getWeekStr(),
};

let openCat = 'body';       // which category accordion is open
let currentTab = 'wins';

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
// Real streak: consecutive days ending today (or yesterday if today isn't done yet).
function computeStreak(winId) {
  let n = hasWin(state.todayStr, winId) ? 1 : 0;
  let d = addDays(parseDate(state.todayStr), -1);
  while (hasWin(fmtDate(d), winId)) {
    n++;
    d = addDays(d, -1);
    if (n > 3650) break;
  }
  return n;
}
function countInLastDays(days, winId) {
  let n = 0;
  for (let i = 0; i < days; i++) {
    if (hasWin(fmtDate(addDays(parseDate(state.todayStr), -i)), winId)) n++;
  }
  return n;
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
  document.getElementById('totalPoints').textContent = todayPts;

  // Daily target bar
  document.getElementById('dailyPts').textContent = `${todayPts} / ${DAILY_TARGET} pts`;
  document.getElementById('dailyFill').style.width = Math.min((todayPts / DAILY_TARGET) * 100, 100) + '%';

  // Weekly bar
  const weekPts = weekPoints();
  document.getElementById('weeklyPts').textContent = `${weekPts} / ${WEEKLY_TARGET} pts`;
  document.getElementById('progressFill').style.width = Math.min((weekPts / WEEKLY_TARGET) * 100, 100) + '%';

  const labels = ['Beginning', 'Building', 'Consistent', 'Strong', 'Unbreakable'];
  const level = Math.min(Math.floor(weekPts / 100) + 1, labels.length);
  document.getElementById('levelLabel').textContent = `Level ${level} — ${labels[level - 1]}`;
  document.getElementById('nextLevel').textContent = level >= labels.length
    ? 'Max level — hold the line'
    : `${level * 100 - weekPts}pts → Level ${level + 1}`;

  document.getElementById('streakWorkout').textContent = computeStreak('workout');
  document.getElementById('streakClean').textContent = computeStreak('noporn');
  document.getElementById('streakRead').textContent = computeStreak('read');
  document.getElementById('streakSteps').textContent = computeStreak('steps');
}

const ENERGY_HINTS = {
  low: 'Low battery day. Shrink the target: water, dua, 5-min reflection. Small wins keep the chain alive.',
  medium: 'Steady. Pick one Body win and one Mind win before tonight.',
  high: 'Fuel is there. Full workout tonight — make it count.',
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
  pushOp({ t: 'energy', date: today, level });
}

function renderCategories() {
  const container = document.getElementById('categories');
  container.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const catPtsToday = cat.wins
      .filter(w => hasWin(state.todayStr, w.id))
      .reduce((sum, w) => sum + w.pts, 0);

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
          ${catPtsToday > 0 ? `<span class="cat-pts-today">+${catPtsToday}pts</span>` : ''}
          <span class="cat-chevron">▼</span>
        </div>
      </div>
      <div class="category-body ${isOpen ? 'open' : ''}" id="body-${cat.id}">
        ${cat.wins.map(win => `
          <div class="win-item ${hasWin(state.todayStr, win.id) ? 'completed' : ''}"
               id="win-${win.id}"
               onclick="toggleWin('${win.id}')">
            <div class="win-left">
              <div class="win-check">
                <div class="win-check-inner"></div>
              </div>
              <div class="win-text">
                <div class="win-name">${win.name}</div>
                <div class="win-desc">${win.desc}</div>
              </div>
            </div>
            <div class="win-pts">${win.pts}</div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(div);
  });
}

function renderRewards() {
  const container = document.getElementById('rewardsList');
  const pts = weekPoints();
  container.innerHTML = REWARDS.map(r => `
    <div class="reward-item ${pts >= r.pts ? 'unlocked' : ''}">
      <div class="reward-left">
        <div class="reward-name">${r.name}</div>
        <div class="reward-desc">${r.desc}</div>
      </div>
      <div class="reward-cost">${r.pts}</div>
    </div>
  `).join('');
}

function toggleCat(id) {
  openCat = (openCat === id) ? null : id;
  renderCategories();
}

function toggleWin(winId, silent) {
  const win = WIN_INDEX[winId];
  if (!win) return;
  const today = state.todayStr;
  const was = hasWin(today, winId);
  const prevPts = getTodayPoints();

  if (was) {
    removeWinLocal(today, winId);
    if (!silent) showToast(`-${win.pts}pts removed`);
  } else {
    addWinLocal(today, winId);
    if (!silent) {
      const now = prevPts + win.pts;
      if (prevPts < DAILY_TARGET && now >= DAILY_TARGET) {
        showToast(`🎯 ${DAILY_TARGET}pts — daily target hit. Strong day.`);
      } else {
        showToast(`+${win.pts}pts — well done.`);
      }
    }
  }

  saveLocal();
  renderCategories();
  updateHeader();
  renderRewards();
  renderJourney();
  pushOp({ t: 'win', date: today, id: winId, done: !was });
}

function resetDay() {
  if (!confirm('Reset today\'s check-ins? Only today is cleared — your history stays.')) return;
  delete state.history[state.todayStr];
  saveLocal();
  renderAll();
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
function heatClass(pts) {
  if (pts <= 0) return 'h0';
  if (pts < 25) return 'h1';
  if (pts < 50) return 'h2';
  if (pts < DAILY_TARGET) return 'h3';
  return 'h4';
}

function renderJourney() {
  const container = document.getElementById('tab-journey');
  if (!container) return;
  const today = parseDate(state.todayStr);

  // --- Stat tiles ---
  const wk = weekPoints();
  let best = 0;
  for (let i = 0; i < 30; i++) best = Math.max(best, dayPoints(fmtDate(addDays(today, -i))));
  const workouts30 = countInLastDays(30, 'workout');
  const clean30 = countInLastDays(30, 'noporn');
  document.getElementById('journeyStats').innerHTML = `
    <div class="j-tile"><div class="j-num">${wk}</div><div class="j-lbl">Points this week</div></div>
    <div class="j-tile"><div class="j-num">${best}</div><div class="j-lbl">Best day (30d)</div></div>
    <div class="j-tile"><div class="j-num">${workouts30}</div><div class="j-lbl">Workouts (30d)</div></div>
    <div class="j-tile"><div class="j-num">${clean30}</div><div class="j-lbl">Clean days (30d)</div></div>
  `;

  // --- Last 7 days bars ---
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  let barsHtml = '';
  let maxPts = DAILY_TARGET;
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const pts = dayPoints(fmtDate(d));
    maxPts = Math.max(maxPts, pts);
    week.push({ d, pts, isToday: i === 0 });
  }
  week.forEach(({ d, pts, isToday }) => {
    const h = Math.max(Math.round((pts / maxPts) * 100), 3);
    barsHtml += `
      <div class="j-bar-col">
        <div class="j-bar-val">${pts > 0 ? pts : ''}</div>
        <div class="j-bar-track"><div class="j-bar ${isToday ? 'today' : ''} ${pts >= DAILY_TARGET ? 'hit' : ''}" style="height:${h}%"></div></div>
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
      cells += `<div class="hm-cell ${heatClass(dayPoints(ds))} ${ds === state.todayStr ? 'today' : ''}"></div>`;
    }
  }
  document.getElementById('heatmap').innerHTML = cells;

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
  if (txt.length >= 20 && !hasWin(state.todayStr, 'reflect')) {
    toggleWin('reflect', true);
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

function tickExercise(id) {
  const i = wo.done.indexOf(id);
  if (i >= 0) wo.done.splice(i, 1);
  else wo.done.push(id);
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
  // Auto-log the workout win — no need to remember to tick it
  const note = document.getElementById('celAutolog');
  if (!hasWin(state.todayStr, 'workout')) {
    toggleWin('workout', true);
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
    setDateAndStoic();
    loadWorkout(); // new day = fresh workout
    renderAll();
    showToast('New day. Fresh start.');
  }
}

// ============================================
// INIT
// ============================================
function renderAll() {
  updateHeader();
  renderEnergyCheckin();
  renderCategories();
  renderRewards();
  renderJourney();
}

function init() {
  state.history = lsGet(LS.history, {});
  setDateAndStoic();
  renderAll();
  loadWorkout();

  // Show instantly from local cache — network happens in the background
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  if (!db) setSyncStatus(navigator.onLine ? 'error' : 'offline');
  syncFromServer();

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
