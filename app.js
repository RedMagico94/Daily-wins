// ============================================
// SUPABASE CONFIG
// ============================================
const SUPABASE_URL = 'https://sjhfpzqtizvoklwwjjkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqaGZwenF0aXp2b2tsd3dqamtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzMyMTUsImV4cCI6MjA5NTEwOTIxNX0.fDTnHRnHgId_n_tARMFoPwHiNEEX_UbnSK3XdO_vgI0';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      { id: 'reflect', name: 'Reflected on the day', desc: '5 mins — what went well, what to improve', pts: 6 },
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

const REWARDS = [
  { name: 'Guilt-free rest day', desc: 'Skip one workout this week with no guilt or tracking', pts: 80 },
  { name: 'Early night pass', desc: 'Bed at 9:30pm — no guilt, no to-do list', pts: 60 },
  { name: 'Choose the weekend activity', desc: 'You pick — football, gym, food, whatever you want', pts: 100 },
  { name: 'One full morning to yourself', desc: 'Laeeqa holds the fort — you get 2 hours, no obligations', pts: 120 },
  { name: 'Vietnam treat', desc: 'One meal, experience, or activity just for you in Vietnam', pts: 200 },
];

// ============================================
// STATE
// ============================================
let state = {
  completed: {},       // win_id -> true for today
  weeklyPoints: 0,
  streaks: { workout: 0, clean: 0, read: 0, steps: 0 },
  todayStr: getTodayStr(),
  weekStr: getWeekStr(),
  energyLevel: null,   // 'low' | 'medium' | 'high' | null
};

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getWeekStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,'0')}-${String(mon.getDate()).padStart(2,'0')}`;
}

// ============================================
// SUPABASE FUNCTIONS
// ============================================
async function loadTodayWins() {
  const { data, error } = await db
    .from('wins')
    .select('win_id')
    .eq('date', state.todayStr)
    .eq('completed', true);

  if (error) { console.error('Load wins error:', error); return; }

  state.completed = {};
  if (data) data.forEach(row => { state.completed[row.win_id] = true; });
}

async function loadStats() {
  const { data, error } = await db
    .from('stats')
    .select('*')
    .eq('week_starting', state.weekStr)
    .single();

  if (error && error.code !== 'PGRST116') { console.error('Load stats error:', error); return; }

  if (data) {
    state.weeklyPoints = data.weekly_points || 0;
    state.streaks.workout = data.streak_workout || 0;
    state.streaks.clean = data.streak_clean || 0;
    state.streaks.read = data.streak_read || 0;
    state.streaks.steps = data.streak_steps || 0;
  }
}

async function loadEnergyLevel() {
  const { data, error } = await db
    .from('wins')
    .select('win_id')
    .eq('date', state.todayStr)
    .like('win_id', 'energy_%')
    .single();

  if (error) return;
  if (data) {
    state.energyLevel = data.win_id.replace('energy_', '');
  }
}

async function saveWin(winId, completed) {
  setSyncStatus('syncing');

  const { data: existing } = await db
    .from('wins')
    .select('id')
    .eq('date', state.todayStr)
    .eq('win_id', winId)
    .single();

  if (existing) {
    await db.from('wins').update({ completed }).eq('id', existing.id);
  } else {
    await db.from('wins').insert({ date: state.todayStr, win_id: winId, completed });
  }

  setSyncStatus('synced');
}

async function saveStats() {
  setSyncStatus('syncing');

  const { data: existing } = await db
    .from('stats')
    .select('id')
    .eq('week_starting', state.weekStr)
    .single();

  const payload = {
    week_starting: state.weekStr,
    weekly_points: state.weeklyPoints,
    streak_workout: state.streaks.workout,
    streak_clean: state.streaks.clean,
    streak_read: state.streaks.read,
    streak_steps: state.streaks.steps,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await db.from('stats').update(payload).eq('id', existing.id);
  } else {
    await db.from('stats').insert(payload);
  }

  setSyncStatus('synced');
}

async function saveEnergyLevel(level) {
  setSyncStatus('syncing');

  // Remove any existing energy entry for today
  await db.from('wins').delete()
    .eq('date', state.todayStr)
    .like('win_id', 'energy_%');

  // Save new energy level
  await db.from('wins').insert({
    date: state.todayStr,
    win_id: `energy_${level}`,
    completed: true
  });

  setSyncStatus('synced');
}

// ============================================
// UI FUNCTIONS
// ============================================
function setSyncStatus(status) {
  const el = document.getElementById('syncStatus');
  if (status === 'syncing') {
    el.textContent = '○ Syncing...';
    el.className = 'sync-status syncing';
  } else if (status === 'error') {
    el.textContent = '● Error syncing';
    el.className = 'sync-status error';
  } else {
    el.textContent = '● Synced';
    el.className = 'sync-status';
  }
}

function getTodayPoints() {
  return Object.keys(state.completed).reduce((sum, id) => {
    if (id.startsWith('energy_')) return sum; // don't count energy in points
    const cat = CATEGORIES.find(c => c.wins.some(w => w.id === id));
    if (!cat) return sum;
    const win = cat.wins.find(w => w.id === id);
    return sum + (win ? win.pts : 0);
  }, 0);
}

function updateHeader() {
  const todayPts = getTodayPoints();
  document.getElementById('totalPoints').textContent = todayPts;

  const weekPts = state.weeklyPoints;
  document.getElementById('weeklyPts').textContent = `${weekPts} / 100 pts`;
  const pct = Math.min((weekPts / 100) * 100, 100);
  document.getElementById('progressFill').style.width = pct + '%';

  const level = Math.floor(weekPts / 100) + 1;
  const labels = ['Beginning', 'Building', 'Consistent', 'Strong', 'Unbreakable'];
  document.getElementById('levelLabel').textContent = `Level ${level} — ${labels[Math.min(level-1, labels.length-1)]}`;
  document.getElementById('nextLevel').textContent = `${100 - (weekPts % 100)}pts → Level ${level+1}`;

  document.getElementById('streakWorkout').textContent = state.streaks.workout;
  document.getElementById('streakClean').textContent = state.streaks.clean;
  document.getElementById('streakRead').textContent = state.streaks.read;
  document.getElementById('streakSteps').textContent = state.streaks.steps;
}

function renderEnergyCheckin() {
  const container = document.getElementById('energyCheckin');
  const levels = [
    { key: 'low', label: 'Low', emoji: '🔋' },
    { key: 'medium', label: 'Medium', emoji: '⚡' },
    { key: 'high', label: 'High', emoji: '🔥' },
  ];

  container.innerHTML = `
    <div class="energy-title">Today's Energy</div>
    <div class="energy-buttons">
      ${levels.map(l => `
        <button class="energy-btn ${state.energyLevel === l.key ? 'active energy-' + l.key : ''}"
                onclick="setEnergy('${l.key}')">
          <span class="energy-emoji">${l.emoji}</span>
          <span class="energy-label">${l.label}</span>
        </button>
      `).join('')}
    </div>
    ${state.energyLevel ? `<div class="energy-note">Logged — no points, just awareness.</div>` : ''}
  `;
}

async function setEnergy(level) {
  state.energyLevel = level;
  renderEnergyCheckin();
  await saveEnergyLevel(level);
}

function renderCategories(openCatId = 'body') {
  const container = document.getElementById('categories');
  container.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const catPtsToday = cat.wins
      .filter(w => state.completed[w.id])
      .reduce((sum, w) => sum + w.pts, 0);

    const div = document.createElement('div');
    div.className = 'category';

    const isOpen = cat.id === openCatId;

    div.innerHTML = `
      <div class="category-header ${isOpen ? 'open' : ''}" onclick="toggleCat('${cat.id}', this)">
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
          <div class="win-item ${state.completed[win.id] ? 'completed' : ''}"
               id="win-${win.id}"
               onclick="toggleWin('${win.id}', ${win.pts}, '${cat.id}')">
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
  const pts = state.weeklyPoints;
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

function toggleCat(id, header) {
  const body = document.getElementById('body-' + id);
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.category-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.category-header').forEach(h => h.classList.remove('open'));
  if (!isOpen) {
    body.classList.add('open');
    header.classList.add('open');
  }
}

async function toggleWin(winId, pts, catId) {
  const isCompleted = state.completed[winId];

  if (isCompleted) {
    delete state.completed[winId];
    state.weeklyPoints = Math.max(0, state.weeklyPoints - pts);
    if (winId === 'workout') state.streaks.workout = Math.max(0, state.streaks.workout - 1);
    if (winId === 'noporn') state.streaks.clean = Math.max(0, state.streaks.clean - 1);
    if (winId === 'read') state.streaks.read = Math.max(0, state.streaks.read - 1);
    if (winId === 'steps') state.streaks.steps = Math.max(0, state.streaks.steps - 1);
    showToast(`-${pts}pts removed`);
  } else {
    state.completed[winId] = true;
    state.weeklyPoints += pts;
    if (winId === 'workout') state.streaks.workout++;
    if (winId === 'noporn') state.streaks.clean++;
    if (winId === 'read') state.streaks.read++;
    if (winId === 'steps') state.streaks.steps++;
    showToast(`+${pts}pts — well done.`);
  }

  const winEl = document.getElementById('win-' + winId);
  if (winEl) {
    winEl.classList.toggle('completed', !!state.completed[winId]);
  }

  updateHeader();
  renderRewards();

  const catHeader = document.querySelector(`[onclick="toggleCat('${catId}', this)"]`);
  if (catHeader) {
    const cat = CATEGORIES.find(c => c.id === catId);
    const catPts = cat.wins.filter(w => state.completed[w.id]).reduce((s, w) => s + w.pts, 0);
    const ptsEl = catHeader.querySelector('.cat-pts-today');
    if (catPts > 0) {
      if (ptsEl) ptsEl.textContent = `+${catPts}pts`;
      else catHeader.querySelector('.cat-right').insertAdjacentHTML('afterbegin', `<span class="cat-pts-today">+${catPts}pts</span>`);
    } else if (ptsEl) ptsEl.remove();
  }

  await saveWin(winId, !!state.completed[winId]);
  await saveStats();
}

async function resetDay() {
  if (!confirm('Reset today\'s check-ins? Weekly points and streaks will be kept.')) return;

  await db.from('wins').delete().eq('date', state.todayStr);
  state.completed = {};
  state.energyLevel = null;
  renderCategories('body');
  renderEnergyCheckin();
  updateHeader();
  showToast('Today reset. Start fresh.');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function setDateAndStoic() {
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('dateLabel').textContent =
    `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const s = STOIC[now.getDay() % STOIC.length];
  document.getElementById('stoicQuote').textContent = s.q;
  document.getElementById('stoicAttr').textContent = s.a;
}

// ============================================
// INIT
// ============================================
async function init() {
  setDateAndStoic();

  try {
    await loadTodayWins();
    await loadStats();
    await loadEnergyLevel();
  } catch (e) {
    console.error('Init error:', e);
    setSyncStatus('error');
  }

  renderCategories('body');
  renderEnergyCheckin();
  renderRewards();
  updateHeader();

  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}

init();
