/* Composants et utilitaires d'interface partagés */
import { t, getLang } from './i18n.js';

export const state = { user: null, settings: {}, users: [] };

export const esc = v => String(v ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- Icônes (traits simples, 24×24) ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  machine: '<rect x="3" y="7" width="13" height="10" rx="2"/><circle cx="9.5" cy="12" r="2.5"/><path d="M16 10h3l2 2-2 2h-3"/>',
  report: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 6-6 6 6 6"/>', right: '<path d="m9 6 6 6-6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  pdf: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M12 11v6M9.5 14.5 12 17l2.5-2.5"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M3 21h18M8 8h2M8 12h2M8 16h2M17 13h0M17 17h0"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 10v10M15 10v10"/>',
  box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  text: '<path d="M5 6h14M5 11h14M5 16h9"/>',
  signature: '<path d="M3 17c3-1 4-8 6-8s0 8 3 8 3-4 5-4 2 3 4 3"/><path d="M3 21h18"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'
};
export const icon = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;

/* ---------- Dates ---------- */
export const todayISO = () => toISO(new Date());
export function toISO(d) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
export function fromISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export function fmtDate(s, opts = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!s) return '—';
  return fromISO(String(s).slice(0, 10)).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'fr-FR', opts);
}
export function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export function isoWeek(d) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x - y0) / 864e5 + 1) / 7);
}
export const fmtHours = h => {
  const n = Math.round(Number(h || 0) * 100) / 100;
  return (getLang() === 'fr' ? String(n).replace('.', ',') : String(n)) + ' h';
};

/* ---------- Badges ---------- */
export const machineStatus = s => `<span class="badge ms-${esc(s)}">${esc(t('ms_' + (s || 'in_service')))}</span>`;
export const reportStatus = s => `<span class="badge rs-${esc(s)}">${esc(t('rs_' + s))}</span>`;
export const reportType = s => `<span class="tag">${esc(t('rt_' + s))}</span>`;
export const initials = name => String(name || '?').split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
export const avatar = name => `<span class="avatar" title="${esc(name)}">${esc(initials(name))}</span>`;
export const userName = id => (state.users.find(u => u.id === id) || {}).name || '?';
export const isManager = () => state.user && ['manager', 'admin'].includes(state.user.role);
export const isAdmin = () => state.user && state.user.role === 'admin';

/* ---------- Notifications ---------- */
export function toast(msg, kind = 'ok') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = `${icon(kind === 'error' ? 'x' : 'check')}<span>${esc(msg)}</span>`;
  box.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2800);
  setTimeout(() => el.remove(), 3200);
}
export const toastError = e => toast(e && e.message ? e.message : String(e), 'error');

/* ---------- Fenêtre modale ---------- */
export function modal({ title, body, actions = [], wide = false, onOpen }) {
  return new Promise(resolve => {
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `
      <div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <header><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="${esc(t('close'))}">${icon('x')}</button></header>
        <div class="modal-body">${body}</div>
        <footer>${actions.map((a, i) => `<button class="btn ${a.kind || ''}" data-act="${i}">${esc(a.label)}</button>`).join('')}</footer>
      </div>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('in'));
    const close = val => { wrap.classList.remove('in'); setTimeout(() => wrap.remove(), 180); resolve(val); };
    wrap.addEventListener('click', async e => {
      if (e.target === wrap || e.target.closest('[data-close]')) return close(null);
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const a = actions[Number(b.dataset.act)];
      if (a.onClick) {
        b.disabled = true;
        try { const r = await a.onClick(wrap); if (r !== false) close(r ?? true); }
        catch (err) { toastError(err); }
        finally { b.disabled = false; }
      } else close(a.value ?? null);
    });
    wrap.addEventListener('keydown', e => { if (e.key === 'Escape') close(null); });
    const first = wrap.querySelector('input,select,textarea');
    if (first) setTimeout(() => first.focus(), 60);
    if (onOpen) onOpen(wrap, close);
  });
}
export const confirmBox = (msg, okLabel = t('delete')) => modal({
  title: t('confirm'),
  body: `<p>${esc(msg)}</p>`,
  actions: [{ label: t('cancel') }, { label: okLabel, kind: 'danger', value: true }]
});

/* ---------- Formulaires simples ---------- */
/* fields: [{name,label,type,options,required,full,value,placeholder}] */
export function formHTML(fields, values = {}) {
  return `<div class="form-grid">${fields.map(f => {
    const v = values[f.name] ?? f.value ?? '';
    const req = f.required ? 'required' : '';
    let input;
    if (f.type === 'select') {
      input = `<select name="${f.name}" ${req}>${f.options.map(([val, lab]) =>
        `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`).join('')}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.name}" rows="${f.rows || 3}" ${req} placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`;
    } else {
      input = `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" ${req}
        ${f.step ? `step="${f.step}"` : ''} placeholder="${esc(f.placeholder || '')}" autocomplete="${f.autocomplete || 'off'}">`;
    }
    return `<label class="field ${f.full ? 'full' : ''}"><span>${esc(f.label)}${f.required ? ' *' : ''}</span>${input}</label>`;
  }).join('')}</div>`;
}
export function readForm(root) {
  const out = {};
  for (const el of $$('input[name],select[name],textarea[name]', root)) {
    if (el.required && !el.value.trim()) { el.focus(); el.classList.add('invalid'); throw new Error(t('required')); }
    out[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim();
  }
  return out;
}
export const formModal = (title, fields, values, onSave) => modal({
  title, body: `<form onsubmit="return false">${formHTML(fields, values)}</form>`,
  actions: [{ label: t('cancel') }, { label: t('save'), kind: 'primary', onClick: w => onSave(readForm(w)) }]
});

/* ---------- Images : redimensionnement avant envoi ---------- */
export function resizeImage(file, max = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')); };
    img.src = url;
  });
}

/* ---------- Divers ---------- */
export function debounce(fn, ms) {
  let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); };
}
export const emptyState = (msg, iconName = 'box') =>
  `<div class="empty">${icon(iconName)}<p>${esc(msg)}</p></div>`;
export function countryFlag(cc) {
  if (!cc || cc.length !== 2) return '';
  const code = cc.toUpperCase() === 'UK' ? 'GB' : cc.toUpperCase();
  return String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}
export const COUNTRIES = [['FR', 'France'], ['UK', 'United Kingdom'], ['US', 'United States'], ['DE', 'Deutschland'],
  ['IT', 'Italia'], ['ES', 'España'], ['NL', 'Nederland'], ['NO', 'Norge'], ['AE', 'UAE'], ['SA', 'Saudi Arabia'],
  ['IN', 'India'], ['CN', 'China'], ['BR', 'Brasil'], ['CA', 'Canada'], ['AU', 'Australia']];
