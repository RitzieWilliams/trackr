'use strict';

// ── Icon Options ─────────────────────────────────────────────────────────────
const ICONS = [
  '🏃','🏋️','🧘','🚴','🏊','⚽','🎾','🏀',
  '🥗','💧','😴','📚','✍️','🎨','🎵','🧠',
  '💼','💰','🌿','🔥','⭐','🎯','🏆','💪',
  '🚶','🌅','📝','✅','😊','🤝','🌱','☕',
];

// Legacy type map for lists created before this update
const LEGACY_TYPES = {
  habits:'🔁', fitness:'🏋️', reading:'📚', tasks:'✅',
  nutrition:'🥗', sleep:'😴', mood:'😊', finance:'💰',
  learning:'🧠', social:'🤝', mindful:'🧘', custom:'⭐',
};

// ── State ───────────────────────────────────────────────────────────────────
let state = { lists: [] };
let profile = { name: '', goal: '' };
let currentListId = null;
let selectedIcon = ICONS[0];
let isDark = true;
let previousView = 'view-home';

// ── Theme ────────────────────────────────────────────────────────────────────
function applyTheme(dark) {
  isDark = dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.getElementById('btn-theme').textContent = dark ? '🌙' : '☀️';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

function toggleTheme() {
  applyTheme(!isDark);
}

function loadTheme() {
  const saved = localStorage.getItem('theme');
  applyTheme(saved !== 'light');
}

// ── Persistence ─────────────────────────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem('activityTracker');
    if (raw) state = JSON.parse(raw);
  } catch (_) { state = { lists: [] }; }
}

function saveState() {
  localStorage.setItem('activityTracker', JSON.stringify(state));
}

function loadProfile() {
  try {
    const raw = localStorage.getItem('trackrProfile');
    if (raw) profile = JSON.parse(raw);
  } catch (_) {}
}

function saveProfile() {
  localStorage.setItem('trackrProfile', JSON.stringify(profile));
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (seconds < 60)  return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)      return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5)     return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12)   return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function getListIcon(list) {
  return list.icon || LEGACY_TYPES[list.type] || '⭐';
}

function getListActivityType(list) {
  return list.activityType || list.customLabel || list.type || 'Activity';
}

function getList(id) {
  return state.lists.find(l => l.id === id);
}

// ── Views ────────────────────────────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ── Home View ────────────────────────────────────────────────────────────────
function renderHome() {
  const grid = document.getElementById('lists-grid');
  const empty = document.getElementById('empty-state');

  const heading = document.getElementById('lists-heading');
  if (state.lists.length === 0) {
    empty.classList.remove('hidden');
    heading.classList.add('hidden');
    grid.innerHTML = '';
    return;
  }

  empty.classList.add('hidden');
  heading.classList.remove('hidden');
  grid.innerHTML = state.lists.map(list => {
    return `
      <div class="list-card" data-id="${list.id}">
        <div class="card-accent-bar"></div>
        <div class="card-top">
          <div class="card-icon">${getListIcon(list)}</div>
          <div class="card-text">
            <div class="card-name">${escHtml(list.name)}</div>
            <div class="card-type">${escHtml(getListActivityType(list))}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  grid.querySelectorAll('.list-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });
}

// ── Detail View ──────────────────────────────────────────────────────────────
function openDetail(listId) {
  currentListId = listId;
  const list = getList(listId);

  document.getElementById('detail-icon').textContent  = getListIcon(list);
  document.getElementById('detail-title').textContent = list.name;
  document.getElementById('detail-type-badge').textContent = `${getListIcon(list)} ${getListActivityType(list)}`;

  renderEntries();
  showView('view-detail');
}

function renderEntries() {
  const list = getList(currentListId);
  const ul   = document.getElementById('entries-list');
  const noEntries = document.getElementById('entries-empty');
  const total = list.entries.length;

  if (total === 0) {
    noEntries.classList.remove('hidden');
    ul.innerHTML = '';
    return;
  }

  noEntries.classList.add('hidden');

  // Show most recent first
  const sorted = [...list.entries].reverse();

  ul.innerHTML = sorted.map(entry => `
    <li class="entry-item" data-id="${entry.id}">
      <span class="entry-text">${escHtml(entry.text)}</span>
      <span class="entry-date">${timeAgo(entry.createdAt)}</span>
      <button class="entry-delete" data-action="delete" title="Delete entry">&times;</button>
    </li>
  `).join('');

  ul.querySelectorAll('[data-action="delete"]').forEach(el => {
    el.addEventListener('click', () => deleteEntry(el.closest('li').dataset.id));
  });
}

// ── Entry Actions ────────────────────────────────────────────────────────────
function addEntry() {
  const list = getList(currentListId);
  const text = `${getListActivityType(list)} completed`;
  list.entries.push({ id: uid(), text, completed: true, createdAt: new Date().toISOString() });
  saveState();
  renderEntries();
}

function deleteEntry(entryId) {
  const list = getList(currentListId);
  list.entries = list.entries.filter(e => e.id !== entryId);
  saveState();
  renderEntries();
}

// ── Create List Modal ────────────────────────────────────────────────────────
function openCreateModal() {
  selectedIcon = ICONS[0];
  document.getElementById('list-name').value = '';
  document.getElementById('activity-type-input').value = '';
  renderIconGrid();
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('list-name').focus(), 60);
}

function closeCreateModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function renderIconGrid() {
  const grid = document.getElementById('icon-grid');
  grid.innerHTML = ICONS.map(icon => `
    <div class="icon-option${icon === selectedIcon ? ' selected' : ''}" data-icon="${icon}">${icon}</div>
  `).join('');

  grid.querySelectorAll('.icon-option').forEach(el => {
    el.addEventListener('click', () => {
      selectedIcon = el.dataset.icon;
      grid.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
    });
  });
}

function createList() {
  const name         = document.getElementById('list-name').value.trim();
  const activityType = document.getElementById('activity-type-input').value.trim();

  if (!name)         { document.getElementById('list-name').focus(); return; }
  if (!activityType) { document.getElementById('activity-type-input').focus(); return; }

  const newList = { id: uid(), name, activityType, icon: selectedIcon, entries: [], createdAt: new Date().toISOString() };
  state.lists.push(newList);
  saveState();
  closeCreateModal();
  renderHome();
  // Open the new list immediately
  openDetail(newList.id);
}

// ── Delete List ──────────────────────────────────────────────────────────────
function openDeleteConfirm() {
  const list = getList(currentListId);
  document.getElementById('confirm-list-name').textContent = list.name;
  document.getElementById('confirm-overlay').classList.remove('hidden');
}

function closeDeleteConfirm() {
  document.getElementById('confirm-overlay').classList.add('hidden');
}

function deleteList() {
  state.lists = state.lists.filter(l => l.id !== currentListId);
  currentListId = null;
  saveState();
  closeDeleteConfirm();
  renderHome();
  showView('view-home');
}

// ── Security ─────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function setActiveNav(id) {
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeMobileMenuGlobal() {
  document.getElementById('btn-hamburger').classList.remove('open');
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('mobile-menu').setAttribute('aria-hidden', 'true');
}

// ── Reports ───────────────────────────────────────────────────────────────────
function openReports() {
  setActiveNav('nav-reports');
  renderReports();
  showView('view-reports');
}

function renderReports() {
  const totalLists      = state.lists.length;
  const allEntries      = state.lists.flatMap(l => l.entries.map(e => ({ ...e, list: l })));
  const totalActivities = allEntries.length;
  const streak          = computeStreak();

  // Summary
  document.getElementById('report-summary').innerHTML = `
    <div class="report-stat">
      <div class="report-stat-value">${totalLists}</div>
      <div class="report-stat-label">Total Lists</div>
    </div>
    <div class="report-stat">
      <div class="report-stat-value">${totalActivities}</div>
      <div class="report-stat-label">Activities Logged</div>
    </div>
    <div class="report-stat">
      <div class="report-stat-value">${streak}</div>
      <div class="report-stat-label">Day Streak</div>
    </div>
  `;

  // Per-list breakdown
  const maxCount = Math.max(1, ...state.lists.map(l => l.entries.length));
  const reportLists = document.getElementById('report-lists');
  if (totalLists === 0) {
    reportLists.innerHTML = '<p class="report-empty">No lists yet. Create one to see your report.</p>';
  } else {
    const sorted = [...state.lists].sort((a, b) => b.entries.length - a.entries.length);
    reportLists.innerHTML = sorted.map(list => {
      const count = list.entries.length;
      const pct   = Math.round((count / maxCount) * 100);
      return `
        <div class="report-list-row">
          <div class="report-list-icon">${getListIcon(list)}</div>
          <div class="report-list-info">
            <div class="report-list-name">${escHtml(list.name)}</div>
            <div class="report-list-type">${escHtml(getListActivityType(list))}</div>
            <div class="report-bar-wrap"><div class="report-bar" style="width:${pct}%"></div></div>
          </div>
          <div class="report-list-count">
            <div class="report-list-count-num">${count}</div>
            <div class="report-list-count-label">logged</div>
          </div>
        </div>`;
    }).join('');
  }

  // Recent activity feed (latest 20 across all lists)
  const feed = document.getElementById('report-feed');
  if (allEntries.length === 0) {
    feed.innerHTML = '<li class="report-empty">No activities logged yet.</li>';
  } else {
    const recent = allEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    feed.innerHTML = recent.map(e => `
      <li class="report-feed-item">
        <span class="report-feed-icon">${getListIcon(e.list)}</span>
        <div class="report-feed-text">
          <div>${escHtml(e.text)}</div>
          <div class="report-feed-list">${escHtml(e.list.name)}</div>
        </div>
        <span class="report-feed-time">${timeAgo(e.createdAt)}</span>
      </li>`).join('');
  }
}

// ── Landing ───────────────────────────────────────────────────────────────────
function showLanding() {
  document.querySelector('.app-header').classList.add('hidden');
  showView('view-landing');
}

function enterApp() {
  document.querySelector('.app-header').classList.remove('hidden');
  localStorage.setItem('trackrSession', '1');
  setActiveNav('nav-home');
  renderHome();
  showView('view-home');
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function openAuthModal() {
  showAuthPanel('login');
  clearAuthErrors();
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('auth-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('login-email').focus(), 60);
}

function closeAuthModal() {
  document.getElementById('auth-overlay').classList.add('hidden');
}

function showAuthPanel(panel) {
  const isLogin = panel === 'login';
  document.getElementById('auth-login-panel').classList.toggle('hidden', !isLogin);
  document.getElementById('auth-register-panel').classList.toggle('hidden', isLogin);
}

function clearAuthErrors() {
  ['auth-error', 'auth-reg-error'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.classList.add('hidden');
  });
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}

function getAccounts() {
  try { return JSON.parse(localStorage.getItem('trackrAccounts') || '{}'); } catch { return {}; }
}

function handleLogin() {
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !password) { showAuthError('auth-error', 'Please enter your email and password.'); return; }

  const accounts = getAccounts();
  const account  = accounts[email];

  if (!account || account.password !== password) {
    showAuthError('auth-error', 'Incorrect email or password.');
    return;
  }

  // Restore profile for this account
  profile = { name: account.name || '', goal: account.goal || '' };
  saveProfile();
  closeAuthModal();
  enterApp();
}

function handleRegister() {
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;

  if (!name)                      { showAuthError('auth-reg-error', 'Please enter your name.'); return; }
  if (!email || !email.includes('@')) { showAuthError('auth-reg-error', 'Please enter a valid email.'); return; }
  if (password.length < 6)        { showAuthError('auth-reg-error', 'Password must be at least 6 characters.'); return; }

  const accounts = getAccounts();
  if (accounts[email])            { showAuthError('auth-reg-error', 'An account with this email already exists.'); return; }

  accounts[email] = { name, password };
  localStorage.setItem('trackrAccounts', JSON.stringify(accounts));

  // Pre-fill profile with their name
  profile = { name, goal: '' };
  saveProfile();
  closeAuthModal();
  enterApp();
}

// ── Logout ────────────────────────────────────────────────────────────────────
function openLogoutConfirm() {
  document.getElementById('logout-overlay').classList.remove('hidden');
}

function closeLogoutConfirm() {
  document.getElementById('logout-overlay').classList.add('hidden');
}

function confirmLogout() {
  localStorage.removeItem('trackrSession');
  closeLogoutConfirm();
  showLanding();
}

// ── Profile View ─────────────────────────────────────────────────────────────
function openProfile() {
  previousView = document.querySelector('.view.active').id;
  renderProfile();
  showView('view-profile');
}

function renderProfile() {
  const name = profile.name || 'You';
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name-display').textContent = profile.name || 'Your Name';
  document.getElementById('profile-goal-display').textContent = profile.goal || 'Set a goal or tagline';
  document.getElementById('profile-name-input').value = profile.name;
  document.getElementById('profile-goal-input').value = profile.goal;

  const totalActivities = state.lists.reduce((sum, l) => sum + l.entries.length, 0);
  const totalLists = state.lists.length;
  const streak = computeStreak();

  document.getElementById('profile-stats').innerHTML = `
    <div class="profile-stat-card">
      <div class="profile-stat-value">${totalLists}</div>
      <div class="profile-stat-label">Lists</div>
    </div>
    <div class="profile-stat-card">
      <div class="profile-stat-value">${totalActivities}</div>
      <div class="profile-stat-label">Activities</div>
    </div>
    <div class="profile-stat-card">
      <div class="profile-stat-value">${streak}</div>
      <div class="profile-stat-label">Day Streak</div>
    </div>
  `;
}

function computeStreak() {
  const allDates = state.lists
    .flatMap(l => l.entries.map(e => new Date(e.createdAt).toDateString()));
  const uniqueDays = [...new Set(allDates)].map(d => new Date(d)).sort((a, b) => b - a);

  if (uniqueDays.length === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === cursor.getTime()) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (d.getTime() < cursor.getTime()) {
      break;
    }
  }
  return streak;
}

function saveProfileForm() {
  profile.name = document.getElementById('profile-name-input').value.trim();
  profile.goal = document.getElementById('profile-goal-input').value.trim();
  saveProfile();
  renderProfile();

  const btn = document.getElementById('btn-save-profile');
  btn.textContent = 'Saved!';
  setTimeout(() => { btn.textContent = 'Save Changes'; }, 1500);
}

// ── Event Wiring ─────────────────────────────────────────────────────────────
function init() {
  loadTheme();
  loadState();
  loadProfile();

  const hasSession = localStorage.getItem('trackrSession');
  if (!hasSession) {
    showLanding();
  } else {
    renderHome();
    showView('view-home');
  }

  // Theme FAB
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  // Landing
  document.getElementById('btn-get-started').addEventListener('click', openAuthModal);

  // Auth modal
  document.getElementById('btn-auth-close').addEventListener('click', closeAuthModal);
  document.getElementById('btn-auth-close-reg').addEventListener('click', closeAuthModal);
  document.getElementById('auth-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('auth-overlay')) closeAuthModal();
  });
  document.getElementById('btn-show-register').addEventListener('click', () => { clearAuthErrors(); showAuthPanel('register'); setTimeout(() => document.getElementById('reg-name').focus(), 40); });
  document.getElementById('btn-show-login').addEventListener('click', () => { clearAuthErrors(); showAuthPanel('login'); setTimeout(() => document.getElementById('login-email').focus(), 40); });
  document.getElementById('btn-login').addEventListener('click', handleLogin);
  document.getElementById('btn-register').addEventListener('click', handleRegister);
  document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  document.getElementById('reg-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleRegister(); });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', openLogoutConfirm);
  document.getElementById('btn-cancel-logout').addEventListener('click', closeLogoutConfirm);
  document.getElementById('btn-confirm-logout').addEventListener('click', confirmLogout);
  document.getElementById('logout-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('logout-overlay')) closeLogoutConfirm();
  });

  // Hamburger
  const hamburger  = document.getElementById('btn-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  function openMobileMenu()  { hamburger.classList.add('open');  mobileMenu.classList.add('open');  mobileMenu.setAttribute('aria-hidden', 'false'); }
  function closeMobileMenu() { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); mobileMenu.setAttribute('aria-hidden', 'true'); }
  hamburger.addEventListener('click', () => hamburger.classList.contains('open') ? closeMobileMenu() : openMobileMenu());

  function mobileNav(fn) { closeMobileMenu(); fn(); }
  document.getElementById('mob-home').addEventListener('click',    () => mobileNav(() => { setActiveNav('nav-home'); renderHome(); showView('view-home'); }));
  document.getElementById('mob-reports').addEventListener('click', () => mobileNav(() => openReports()));
  document.getElementById('mob-profile').addEventListener('click', () => mobileNav(() => openProfile()));
  document.getElementById('btn-new-list-mobile').addEventListener('click', openCreateModal);

  // Desktop Nav
  document.getElementById('nav-logo').style.cursor = 'pointer';
  document.getElementById('nav-logo').addEventListener('click', () => { setActiveNav('nav-home'); renderHome(); showView('view-home'); });
  document.getElementById('nav-home').addEventListener('click', () => { setActiveNav('nav-home'); renderHome(); showView('view-home'); });
  document.getElementById('nav-reports').addEventListener('click', openReports);
  document.getElementById('btn-new-list').addEventListener('click', openCreateModal);
  document.getElementById('btn-new-list-empty').addEventListener('click', openCreateModal);
  document.getElementById('btn-profile-nav').addEventListener('click', openProfile);

  // Profile
  document.getElementById('btn-save-profile').addEventListener('click', saveProfileForm);

  // Detail
  document.getElementById('btn-back').addEventListener('click', () => {
    setActiveNav('nav-home');
    renderHome();
    showView('view-home');
  });
  document.getElementById('btn-add-entry').addEventListener('click', addEntry);
  document.getElementById('btn-delete-list').addEventListener('click', openDeleteConfirm);

  // Create modal
  document.getElementById('btn-modal-close').addEventListener('click', closeCreateModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeCreateModal);
  document.getElementById('btn-create-list').addEventListener('click', createList);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) closeCreateModal();
  });

  // Delete confirm modal
  document.getElementById('btn-cancel-delete').addEventListener('click', closeDeleteConfirm);
  document.getElementById('btn-confirm-delete').addEventListener('click', deleteList);
  document.getElementById('confirm-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirm-overlay')) closeDeleteConfirm();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  // Refresh timestamps every 30 seconds while the detail view is visible
  setInterval(() => {
    if (currentListId && document.getElementById('view-detail').classList.contains('active')) {
      renderEntries();
    }
  }, 30_000);
});
