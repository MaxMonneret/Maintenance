/*
 * Couche d'accès aux données – version SANS SERVEUR (GitHub Pages).
 * Même interface que api.js, mais tout est stocké dans le navigateur (IndexedDB) :
 * les données restent sur l'appareil et ne sont jamais envoyées sur Internet.
 * Utilisée à la place de api.js par le script build-github.mjs.
 */
export const LOCAL = true;
import { buildDemo } from './demo-data.js';

const DB_NAME = 'fieldservice';
let idb = null, db = null;

function openIdb() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open(DB_NAME, 1);
    rq.onupgradeneeded = () => { rq.result.createObjectStore('kv'); rq.result.createObjectStore('photos'); };
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
const tx = (store, mode, fn) => new Promise((res, rej) => {
  const t = idb.transaction(store, mode); const s = t.objectStore(store);
  const r = fn(s); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error);
});
const idbGet = (store, key) => tx(store, 'readonly', s => s.get(key));
const idbPut = (store, key, val) => tx(store, 'readwrite', s => s.put(val, key));
const idbDel = (store, key) => tx(store, 'readwrite', s => s.delete(key));

const empty = () => ({
  seq: {}, users: [], clients: [], sites: [], machines: [], reports: [], photos: [], timesheets: [],
  settings: { company_name: '', company_address: '', company_contact: '', report_prefix: 'RI', logo: '' }
});

async function load() {
  if (db) return db;
  idb = await openIdb();
  db = (await idbGet('kv', 'db')) || empty();
  // Premier lancement (ou ancienne version vide avec le seul profil « Technicien ») : données de démonstration
  const blank = !db.reports.length && !db.machines.length && db.users.every(u => u.email === 'local');
  if (!db.users.length || blank) await loadData(buildDemo());
  return db;
}

/* Remplace toutes les données de l'appareil par un fichier d'export (ou le jeu de démonstration) */
async function loadData(file) {
  const photos = file.photos || [];
  await tx('photos', 'readwrite', s => s.clear());
  for (const p of photos) if (p.data) await idbPut('photos', p.id, p.data);
  const t = file.tables || {};
  db = { ...empty(), ...t, settings: { ...empty().settings, ...(t.settings || {}) }, photos: photos.map(({ data, ...meta }) => meta), seq: {},
    demo: !!file.demo };
  if (!db.users.some(u => u.role === 'admin' && u.active)) {
    db.users.push({ id: nextId('users'), name: 'Administrateur', email: 'admin', role: 'admin', country: 'FR', lang: 'fr', active: 1 });
  }
  setSession(null);
  await persist();
}

/* ---------- Profil courant (choisi sur l'écran d'accueil, sans mot de passe) ---------- */
const SESSION_KEY = 'fs_local_user';
let currentId = Number(localStorage.getItem(SESSION_KEY)) || null;
function setSession(id) {
  currentId = id;
  try { id ? localStorage.setItem(SESSION_KEY, String(id)) : localStorage.removeItem(SESSION_KEY); } catch {}
}
let saving = Promise.resolve();
function persist() { saving = saving.then(() => idbPut('kv', 'db', db)); return saving; }
function nextId(table) { db.seq[table] = (db.seq[table] || db[table].reduce((m, x) => Math.max(m, x.id), 0)) + 1; return db.seq[table]; }

const now = () => new Date().toISOString();
const fail = (status, msg) => { const e = new Error(msg); e.status = status; throw e; };
const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k] === '' ? null : o[k]]));
const clone = x => JSON.parse(JSON.stringify(x));
const me = () => {
  const u = db.users.find(x => x.id === currentId && x.active);
  if (!u) fail(401, 'Choisissez un profil');
  return u;
};
const isManager = () => ['manager', 'admin'].includes(me().role);
const isAdmin = () => me().role === 'admin';
const canEdit = r => isManager() || (r.status !== 'validated' && (r.created_by === me().id || (r.technicians || []).includes(me().id)));
const publicUser = u => u && ({ id: u.id, name: u.name, email: u.email, role: u.role, country: u.country,
  lang: u.lang, active: !!u.active, must_change: false });
const byId = (table, id) => db[table].find(x => x.id === Number(id));

const FIELDS = {
  clients: ['name', 'address', 'contact', 'phone', 'email', 'country', 'archived'],
  sites: ['client_id', 'name', 'address', 'city', 'country', 'contact', 'phone', 'archived'],
  machines: ['site_id', 'serial', 'model', 'type', 'application', 'power_kw', 'ratio', 'manufacturer', 'order_no', 'speeds',
    'commissioning_date', 'status', 'notes', 'archived']
};

/* ---------- jointures équivalentes aux requêtes SQL du serveur ---------- */
function machineView(m) {
  const s = byId('sites', m.site_id) || {}; const c = byId('clients', s.client_id) || {};
  const reps = db.reports.filter(r => r.machine_id === m.id);
  return { ...m, site_name: s.name, city: s.city, site_address: s.address, site_country: s.country, site_contact: s.contact,
    client_id: s.client_id, client_name: c.name,
    last_intervention: reps.reduce((a, r) => (!a || r.date > a ? r.date : a), null), report_count: reps.length };
}
function reportList(r) {
  const m = byId('machines', r.machine_id) || {}; const s = byId('sites', m.site_id) || {}; const c = byId('clients', s.client_id) || {};
  return { id: r.id, number: r.number, date: r.date, type: r.type, status: r.status, title: r.title, machine_id: r.machine_id,
    technicians: r.technicians, updated_at: r.updated_at, serial: m.serial, model: m.model,
    site_name: s.name, site_id: s.id, client_name: c.name, client_id: c.id };
}
const isMine = r => r.created_by === me().id || (r.technicians || []).includes(me().id);
const sortReports = (a, b) => (b.date || '').localeCompare(a.date || '') || b.id - a.id;

function nextReportNumber() {
  const prefix = db.settings.report_prefix || 'RI';
  const year = new Date().getFullYear();
  const start = `${prefix}-${year}-`;
  const n = db.reports.filter(r => (r.number || '').startsWith(start))
    .reduce((m, r) => Math.max(m, parseInt(r.number.split('-').pop(), 10) || 0), 0) + 1;
  return `${start}${String(n).padStart(4, '0')}`;
}

/* ---------- photos : données dans un magasin séparé ---------- */
async function photoOut(p) {
  const data = await idbGet('photos', p.id);
  return { id: p.id, filename: p.filename, caption: p.caption, url: data || '' };
}

const crudBase = table => ({
  async list(q = {}) {
    await load();
    const rows = db[table].filter(x => q.archived === '1' || !x.archived);
    if (table === 'clients') return clone(rows.map(c => ({ ...c,
      site_count: db.sites.filter(s => s.client_id === c.id && !s.archived).length,
      machine_count: db.machines.filter(m => !m.archived && (byId('sites', m.site_id) || {}).client_id === c.id).length
    })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    if (table === 'sites') return clone(rows.map(s => ({ ...s, client_name: (byId('clients', s.client_id) || {}).name,
      machine_count: db.machines.filter(m => m.site_id === s.id && !m.archived).length }))
      .sort((a, b) => (a.client_name || '').localeCompare(b.client_name || '') || (a.name || '').localeCompare(b.name || '')));
    return clone(rows.map(machineView).sort((a, b) => (a.client_name || '').localeCompare(b.client_name || '')
      || (a.site_name || '').localeCompare(b.site_name || '') || (a.serial || '').localeCompare(b.serial || '')));
  },
  async get(id) {
    await load();
    const x = byId(table, id); if (!x) fail(404, 'Introuvable');
    if (table !== 'machines') return clone(x);
    const m = machineView(x);
    m.reports = db.reports.filter(r => r.machine_id === x.id).sort(sortReports).map(reportList);
    return clone(m);
  },
  async create(data) {
    await load();
    if (table !== 'machines' && !isManager()) fail(403, 'Droits insuffisants');
    const d = pick(data, FIELDS[table]);
    if (table === 'clients' && !d.name) fail(400, 'Nom obligatoire');
    if (table === 'sites' && (!d.name || !d.client_id)) fail(400, 'Client et nom obligatoires');
    if (table === 'machines' && (!d.serial || !d.site_id)) fail(400, 'Site et numéro de série obligatoires');
    const row = { status: table === 'machines' ? 'in_service' : undefined, archived: 0, ...d, id: nextId(table), created_at: now() };
    db[table].push(row); await persist(); return clone(row);
  },
  async update(id, data) {
    await load();
    const x = byId(table, id); if (!x) fail(404, 'Introuvable');
    if ((table !== 'machines' || data.archived) && !isManager()) fail(403, 'Droits insuffisants');
    Object.assign(x, pick(data, FIELDS[table])); await persist(); return clone(x);
  },
  async remove(id) { return this.update(id, { archived: 1 }); }
});

export const api = {
  async login(email) {
    await load();
    const u = db.users.find(x => x.email === email && x.active);
    if (!u) fail(401, 'Profil introuvable');
    setSession(u.id); return { user: publicUser(u) };
  },
  async logout() { setSession(null); return { ok: true }; },
  async profiles() { await load(); return clone(db.users.filter(u => u.active).map(publicUser)); },
  async isDemo() { await load(); return !!db.demo; },
  async resetDemo() { await load(); await loadData(buildDemo()); return { ok: true }; },
  async me() { await load(); return { user: publicUser(me()), settings: clone(db.settings) }; },
  async updateMe(data) { await load(); Object.assign(me(), pick(data, ['name', 'lang', 'country'])); await persist(); return { user: publicUser(me()) }; },
  async publicSettings() { await load(); return { company_name: db.settings.company_name, logo: db.settings.logo }; },
  settings: {
    async get() { await load(); return clone(db.settings); },
    async save(data) {
      await load();
      if (!isAdmin()) fail(403, 'Réservé aux administrateurs');
      for (const k of ['company_name', 'company_address', 'company_contact', 'report_prefix', 'logo', 'accent']) {
        if (data[k] !== undefined) db.settings[k] = String(data[k] ?? '');
      }
      await persist(); return clone(db.settings);
    }
  },
  async dashboard() {
    await load();
    const today = new Date(); const dow = (today.getDay() + 6) % 7;
    const monday = new Date(today.getTime() - dow * 864e5).toISOString().slice(0, 10);
    const sunday = new Date(today.getTime() + (6 - dow) * 864e5).toISOString().slice(0, 10);
    const month = today.toISOString().slice(0, 7);
    const active = db.machines.filter(m => !m.archived);
    return clone({
      drafts: db.reports.filter(r => r.status === 'draft' && isMine(r)).length,
      to_validate: db.reports.filter(r => r.status === 'done').length,
      reports_month: db.reports.filter(r => (r.date || '').slice(0, 7) === month).length,
      hours_week: db.timesheets.filter(t => t.user_id === me().id && t.date >= monday && t.date <= sunday).reduce((a, t) => a + t.hours, 0),
      machines: active.length,
      machines_alert: active.filter(m => ['watch', 'down'].includes(m.status)).length,
      recent: [...db.reports].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')).slice(0, 6).map(reportList)
    });
  },
  users: {
    async list() { await load(); return clone([...db.users].sort((a, b) => a.name.localeCompare(b.name)).map(publicUser)); },
    async get(id) { await load(); return publicUser(byId('users', id)); },
    async create(data) {
      await load();
      if (!isAdmin()) fail(403, 'Réservé aux administrateurs');
      if (!data.name) fail(400, 'Nom obligatoire');
      const u = { ...pick(data, ['name', 'email', 'role', 'country', 'lang']), id: nextId('users'), active: 1, must_change: 0 };
      if (!u.email) u.email = u.name.toLowerCase().replace(/\s+/g, '.');
      db.users.push(u); await persist(); return publicUser(u);
    },
    async update(id, data) {
      await load();
      const u = byId('users', id); if (!u) fail(404, 'Introuvable');
      if (!isAdmin()) fail(403, 'Réservé aux administrateurs');
      const d = pick(data, ['name', 'email', 'role', 'country', 'lang']);
      if (data.active !== undefined) d.active = data.active ? 1 : 0;
      if (u.id === me().id && (d.role && d.role !== 'admin' || d.active === 0)) fail(400, 'Vous ne pouvez pas retirer vos propres droits');
      Object.assign(u, d); await persist(); return publicUser(u);
    },
    async remove(id) { return this.update(id, { active: 0 }); }
  },
  clients: crudBase('clients'),
  sites: crudBase('sites'),
  machines: crudBase('machines'),
  reports: {
    async list(q = {}) {
      await load();
      return clone(db.reports.filter(r => (!q.status || r.status === q.status)
        && (!q.machine_id || r.machine_id === Number(q.machine_id)) && (q.mine !== '1' || isMine(r)))
        .sort(sortReports).slice(0, 500).map(reportList));
    },
    async get(id) { await load(); const r = byId('reports', id); if (!r) fail(404, 'Rapport introuvable'); return clone(r); },
    async full(id) {
      await load();
      const r = byId('reports', id); if (!r) fail(404, 'Rapport introuvable');
      const m = byId('machines', r.machine_id) || {}; const s = byId('sites', m.site_id) || {}; const c = byId('clients', s.client_id) || {};
      const out = clone({ ...r, serial: m.serial, model: m.model, machine_type: m.type, application: m.application, power_kw: m.power_kw,
        ratio: m.ratio, commissioning_date: m.commissioning_date, site_name: s.name, site_address: s.address, city: s.city,
        site_country: s.country, site_contact: s.contact, client_name: c.name, client_address: c.address, client_contact: c.contact });
      out.photos = await Promise.all(db.photos.filter(p => p.report_id === r.id).map(photoOut));
      out.hours = db.timesheets.filter(t => t.report_id === r.id).sort((a, b) => a.date.localeCompare(b.date))
        .map(t => ({ ...t, user_name: (byId('users', t.user_id) || {}).name }));
      out.can_edit = canEdit(r);
      return out;
    },
    async create(b) {
      await load();
      const r = { id: nextId('reports'), number: nextReportNumber(), machine_id: b.machine_id || null,
        date: b.date || now().slice(0, 10), end_date: b.end_date || null, type: b.type || 'curative', status: 'draft',
        title: b.title || null, technicians: b.technicians || [me().id], sections: b.sections || [], header: b.header || {},
        signer_name: null, signature: null, signed_at: null, created_by: me().id, validated_by: null, created_at: now(), updated_at: now() };
      db.reports.push(r); await persist(); return clone(r);
    },
    async update(id, b) {
      await load();
      const r = byId('reports', id); if (!r) fail(404, 'Rapport introuvable');
      if (!canEdit(r)) fail(403, 'Ce rapport ne peut plus être modifié');
      if (b.status === 'validated' && !isManager()) fail(403, 'Seul un responsable peut valider');
      Object.assign(r, pick(b, ['machine_id', 'date', 'end_date', 'type', 'title', 'signer_name', 'signature', 'signed_at']));
      for (const k of ['technicians', 'sections', 'header']) if (b[k]) r[k] = b[k];
      if (b.status) { r.status = b.status; r.validated_by = b.status === 'validated' ? me().id : null; }
      r.updated_at = now(); await persist(); return clone(r);
    },
    async remove(id) {
      await load();
      const r = byId('reports', id); if (!r) fail(404, 'Rapport introuvable');
      if (!canEdit(r) || (r.status !== 'draft' && !isManager())) fail(403, 'Seuls les brouillons peuvent être supprimés');
      for (const p of db.photos.filter(p => p.report_id === Number(id))) await idbDel('photos', p.id);
      db.photos = db.photos.filter(p => p.report_id !== Number(id));
      db.reports = db.reports.filter(r => r.id !== Number(id));
      db.timesheets.forEach(t => { if (t.report_id === Number(id)) t.report_id = null; });
      await persist(); return { ok: true };
    }
  },
  photos: {
    async upload(dataUrl, reportId, caption) {
      await load();
      if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl || '')) fail(400, 'Image invalide');
      const p = { id: nextId('photos'), report_id: reportId || null, filename: `photo-${Date.now()}`, caption: caption || null, created_by: me().id };
      await idbPut('photos', p.id, dataUrl);
      db.photos.push(p); await persist();
      return { id: p.id, filename: p.filename, caption: p.caption, url: dataUrl };
    },
    async update(id, data) {
      await load();
      const p = byId('photos', id); if (!p) fail(404, 'Introuvable');
      if (data.caption !== undefined) p.caption = data.caption;
      await persist(); return photoOut(p);
    },
    async remove(id) {
      await load();
      await idbDel('photos', Number(id));
      db.photos = db.photos.filter(p => p.id !== Number(id)); await persist(); return { ok: true };
    }
  },
  timesheets: {
    async list(q = {}) {
      await load();
      const uid = !isManager() ? me().id : q.user_id === 'all' ? null : (q.user_id ? Number(q.user_id) : me().id);
      const from = q.from || '0000-01-01', to = q.to || '9999-12-31';
      return clone(db.timesheets.filter(t => t.date >= from && t.date <= to && (!uid || t.user_id === uid)).map(t => {
        const u = byId('users', t.user_id) || {}; const r = byId('reports', t.report_id);
        const lr = r ? reportList(r) : {};
        return { ...t, user_name: u.name, user_country: u.country, report_number: r && r.number, client_name: lr.client_name, site_name: lr.site_name };
      }).sort((a, b) => a.date.localeCompare(b.date) || (a.user_name || '').localeCompare(b.user_name || '') || a.id - b.id));
    },
    async get(id) { await load(); return clone(byId('timesheets', id)); },
    async create(b) {
      await load();
      const hours = Number(String(b.hours).replace(',', '.'));
      if (!b.date || !(hours > 0 && hours <= 24)) fail(400, 'Date et durée (0 à 24 h) obligatoires');
      const t = { id: nextId('timesheets'), user_id: isManager() && b.user_id ? Number(b.user_id) : me().id, date: b.date, kind: b.kind || 'site', hours,
        report_id: b.report_id ? Number(b.report_id) : null, note: b.note || null, status: 'entered', validated_by: null, created_at: now() };
      db.timesheets.push(t); await persist(); return clone(t);
    },
    async update(id, b) {
      await load();
      const t = byId('timesheets', id); if (!t) fail(404, 'Introuvable');
      if (!isManager() && (t.user_id !== me().id || t.status === 'validated')) fail(403, 'Ligne non modifiable');
      Object.assign(t, pick(b, ['date', 'kind', 'note']));
      if (b.report_id !== undefined) t.report_id = b.report_id ? Number(b.report_id) : null;
      if (b.hours !== undefined) t.hours = Number(String(b.hours).replace(',', '.'));
      if (b.status && isManager()) t.status = b.status;
      await persist(); return clone(t);
    },
    async remove(id) {
      await load();
      const t = byId('timesheets', id); if (!t) fail(404, 'Introuvable');
      if (!isManager() && (t.user_id !== me().id || t.status === 'validated')) fail(403, 'Ligne non modifiable');
      db.timesheets = db.timesheets.filter(x => x.id !== Number(id)); await persist(); return { ok: true };
    },
    async validate(userId, from, to) {
      await load(); if (!isManager()) fail(403, 'Seul un responsable peut valider'); let n = 0;
      db.timesheets.forEach(t => { if (t.user_id === Number(userId) && t.date >= from && t.date <= to) { t.status = 'validated'; t.validated_by = me().id; n++; } });
      await persist(); return { updated: n };
    }
  },

  /* ---------- Sauvegarde : import d'un fichier exporté (remplace les données de cet appareil) ---------- */
  async importAll(file) {
    await load();
    if (!isAdmin()) fail(403, 'Réservé aux administrateurs');
    if (!file || file.format !== 'fieldservice-export') fail(400, 'Fichier de sauvegarde invalide');
    await loadData({ ...file, demo: false });
    return { reports: db.reports.length, machines: db.machines.length, photos: (file.photos || []).length };
  }
};
