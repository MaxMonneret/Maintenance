/* Point d'entrée : connexion, structure de l'application et routeur */
import { api } from './api.js';
import { t, setLang, getLang } from './i18n.js';
import { state, icon, esc, avatar, $, $$, toastError, isManager } from './ui.js';
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderMachines, renderMachine, renderClients } from './views/installed.js';
import { renderReports } from './views/reports.js';
import { renderReportEditor } from './views/report-edit.js';
import { renderReportPrint } from './views/report-print.js';
import { renderHours } from './views/hours.js';
import { renderPlanning } from './views/planning.js';
import { renderRfq } from './views/rfq.js';
import { initDictation } from './dictation.js';
import { renderSettings } from './views/settings.js';

const root = $('#root');

/* Routes : motif → fonction d'affichage */
const ROUTES = [
  [/^\/?$/, renderDashboard, 'dashboard'],
  [/^\/machines$/, renderMachines, 'installed'],
  [/^\/machines\/(\d+)$/, renderMachine, 'installed'],
  [/^\/clients$/, renderClients, 'installed'],
  [/^\/reports$/, renderReports, 'reports'],
  [/^\/reports\/new$/, renderReportEditor, 'reports'],
  [/^\/reports\/(\d+)$/, renderReportEditor, 'reports'],
  [/^\/reports\/(\d+)\/print$/, renderReportPrint, 'reports', true],
  [/^\/hours$/, renderHours, 'hours'],
  [/^\/planning$/, renderPlanning, 'planning'],
  [/^\/rfq$/, renderRfq, 'rfq'],
  [/^\/settings$/, renderSettings, 'settings']
];

const NAV = [
  ['dashboard', '#/', 'home', 'nav_dashboard'],
  ['installed', '#/machines', 'machine', 'nav_installed'],
  ['reports', '#/reports', 'report', 'nav_reports'],
  ['planning', '#/planning', 'calendar', 'nav_planning'],
  ['rfq', '#/rfq', 'box', 'nav_rfq', 'manager'],
  ['hours', '#/hours', 'clock', 'nav_hours'],
  ['settings', '#/settings', 'settings', 'nav_settings']
];

function shell() {
  const s = state.settings;
  const roleLabel = t('role_' + state.user.role);
  root.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand with-logo">
          <img class="brand-logo" src="img/logo-white.svg" alt="Lufkin Gears · Allen Gears">
          <div class="brand-sub">${esc(t('app_name'))}</div>
        </div>
        <nav class="nav">
          ${NAV.filter(n => !n[4] || isManager()).map(([k, href, ic, lab]) => `<a href="${href}" data-nav="${k}">${icon(ic)}<span>${esc(t(lab))}</span></a>`).join('')}
          <a href="site/index.html" target="_blank" rel="noopener" class="nav-ext">${icon('building')}<span>${esc(t('nav_site'))} ↗</span></a>
        </nav>
        <div class="sidebar-foot">
          <div class="me">
            ${avatar(state.user.name)}
            <div class="who"><strong>${esc(state.user.name)}</strong><span>${esc(roleLabel)}</span></div>
            <button class="icon-btn" data-logout title="${esc(t('logout'))}">${icon('logout')}</button>
          </div>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <img class="topbar-mark" src="icons/icon-192.png" alt="">
          <strong>${esc(t('app_name'))}</strong>
          <button class="icon-btn" data-logout title="${esc(t('logout'))}">${icon('logout')}</button>
        </header>
        <main id="view"></main>
      </div>
      <nav class="bottom-nav">
        ${NAV.filter(n => !n[4] || isManager()).map(([k, href, ic, lab]) => `<a href="${href}" data-nav="${k}">${icon(ic)}<span>${esc(t(lab))}</span></a>`).join('')}
      </nav>
    </div>`;
  $$('[data-logout]').forEach(b => b.addEventListener('click', async () => {
    try { await api.logout(); } catch {}
    state.user = null;
    location.hash = '#/';
    start();
  }));
}

let currentCleanup = null;
async function route() {
  if (!state.user) return;
  const path = location.hash.replace(/^#/, '').split('?')[0] || '/';
  if (typeof currentCleanup === 'function') { try { currentCleanup(); } catch {} }
  currentCleanup = null;

  // Mot de passe à changer : on force la page réglages
  if (state.user.must_change && path !== '/settings') { location.hash = '#/settings'; return; }

  for (const [re, fn, navKey, bare] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    if (bare) {
      document.body.classList.add('printing');
      root.innerHTML = '<main id="view"></main>';
    } else {
      document.body.classList.remove('printing');
      if (!$('.app')) shell();
      $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === navKey));
    }
    const view = $('#view');
    view.innerHTML = `<div class="loading">${esc(t('loading'))}</div>`;
    window.scrollTo(0, 0);
    try {
      currentCleanup = await fn(view, ...m.slice(1));
    } catch (e) {
      if (e.status === 401) return;
      view.innerHTML = `<div class="page"><div class="card card-pad">${esc(t('error'))} : ${esc(e.message)}</div></div>`;
      console.error(e);
    }
    return;
  }
  location.hash = '#/';
}

export function rerenderShell() { shell(); route(); }

async function loadSession() {
  const { user, settings } = await api.me();
  state.user = user;
  state.settings = settings;
  if (user.lang && user.lang !== getLang()) setLang(user.lang);
  state.users = await api.users.list();
  if (settings.accent) document.documentElement.style.setProperty('--accent', settings.accent);
}

async function start() {
  try {
    await loadSession();
    shell();
    route();
  } catch (e) {
    if (e.status === 401) {
      renderLogin(root, async () => { await loadSession(); shell(); route(); });
    } else {
      root.innerHTML = `<div class="loading">${esc(e.message)}</div>`;
    }
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('fs:unauthorized', () => { if (state.user) { state.user = null; start(); } });

// Bandeau hors connexion
function onlineState() {
  let bar = $('.offline-bar');
  if (!navigator.onLine) {
    if (!bar) { bar = document.createElement('div'); bar.className = 'offline-bar'; bar.textContent = t('offline'); document.body.appendChild(bar); }
  } else if (bar) bar.remove();
}
window.addEventListener('online', onlineState);
window.addEventListener('offline', onlineState);
onlineState();

// Installation PWA (service worker : nécessite localhost ou HTTPS)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.addEventListener('unhandledrejection', e => { if (e.reason && e.reason.status !== 401) toastError(e.reason); });

document.documentElement.lang = getLang();
initDictation();
start();
