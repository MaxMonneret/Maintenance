/* Module 1 – Base installée : machines, clients et sites */
import { api } from '../api.js';
import { t } from '../i18n.js';
import {
  state, icon, esc, $, $$, fmtDate, machineStatus, reportStatus, reportType, emptyState, formModal,
  confirmBox, toast, isManager, countryFlag, COUNTRIES, debounce, avatar, userName
} from '../ui.js';

const STATUSES = ['in_service', 'watch', 'down', 'stopped'];

const tabs = active => `
  <div class="seg" role="tablist">
    <button class="${active === 'machines' ? 'on' : ''}" onclick="location.hash='#/machines'">${esc(t('machines'))}</button>
    <button class="${active === 'clients' ? 'on' : ''}" onclick="location.hash='#/clients'">${esc(t('clients_sites'))}</button>
  </div>`;

/* ---------- Formulaire machine (partagé avec l'éditeur de rapport) ---------- */
export async function machineForm(machine = {}, presetSiteId) {
  const sites = await api.sites.list();
  const fields = [
    { name: 'site_id', label: t('site'), type: 'select', required: true, full: true,
      options: [['', '—'], ...sites.map(s => [s.id, `${s.client_name} — ${s.name}`])] },
    { name: 'serial', label: t('serial'), required: true },
    { name: 'manufacturer', label: t('manufacturer'), placeholder: 'Lufkin, G.E., Comélor…' },
    { name: 'model', label: t('model') },
    { name: 'order_no', label: t('eq_order') },
    { name: 'speeds', label: t('speeds'), placeholder: '1780 / 9187' },
    { name: 'type', label: t('type'), placeholder: 'Réducteur parallèle, épicycloïdal, multiplicateur…' },
    { name: 'application', label: t('application'), placeholder: 'Compresseur, pompe, turbine…' },
    { name: 'power_kw', label: t('power'), type: 'number', step: 'any' },
    { name: 'ratio', label: t('ratio') },
    { name: 'commissioning_date', label: t('commissioning'), type: 'date' },
    { name: 'status', label: t('status'), type: 'select', options: STATUSES.map(s => [s, t('ms_' + s)]) },
    { name: 'notes', label: t('notes'), type: 'textarea', full: true }
  ];
  const values = { status: 'in_service', ...machine, site_id: machine.site_id || presetSiteId || '' };
  return formModal(machine.id ? t('edit') : t('add_machine'), fields, values, async data => {
    data.site_id = Number(data.site_id);
    data.power_kw = data.power_kw ? Number(data.power_kw) : null;
    const saved = machine.id ? await api.machines.update(machine.id, data) : await api.machines.create(data);
    toast(t('saved'));
    return saved;
  });
}

/* ---------- Liste des machines ---------- */
export async function renderMachines(view) {
  const [machines, clients] = await Promise.all([api.machines.list(), api.clients.list()]);
  const f = { q: '', client: '', status: '' };

  view.innerHTML = `
  <div class="page">
    <div class="page-head">
      <div><h1>${esc(t('nav_installed'))}</h1><p class="sub">${machines.length} ${esc(t('machines').toLowerCase())} · ${clients.length} ${esc(t('clients').toLowerCase())}</p></div>
      <div class="actions">${tabs('machines')}<button class="btn primary" id="add">${icon('plus')} ${esc(t('add_machine'))}</button></div>
    </div>
    <div class="toolbar">
      <label class="search">${icon('search')}<input type="search" id="q" placeholder="${esc(t('search'))} (${esc(t('serial'))}, ${esc(t('model'))}, ${esc(t('site'))}…)"></label>
      <select id="client"><option value="">${esc(t('clients'))} : ${esc(t('all'))}</option>
        ${clients.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
      <div class="chips" id="status">
        <button class="chip on" data-s="">${esc(t('all_f'))}</button>
        ${STATUSES.map(s => `<button class="chip" data-s="${s}">${esc(t('ms_' + s))}</button>`).join('')}
      </div>
    </div>
    <div class="grid cols-3" id="list"></div>
  </div>`;

  const draw = () => {
    const q = f.q.toLowerCase();
    const rows = machines.filter(m =>
      (!f.client || String(m.client_id) === f.client) &&
      (!f.status || m.status === f.status) &&
      (!q || [m.serial, m.model, m.type, m.application, m.site_name, m.client_name, m.city].join(' ').toLowerCase().includes(q)));
    $('#list', view).innerHTML = rows.length ? rows.map(m => `
      <article class="card machine-card" data-id="${m.id}" tabindex="0">
        <div class="top">
          <div><div class="serial">${esc(m.serial)}</div><div class="model">${esc([m.model, m.type].filter(Boolean).join(' · '))}</div></div>
          ${machineStatus(m.status)}
        </div>
        <div class="where">
          <div>${icon('building')} ${esc(m.client_name)}</div>
          <div>${icon('pin')} ${esc(m.site_name)}${m.city ? ', ' + esc(m.city) : ''} ${countryFlag(m.site_country)}</div>
        </div>
        <div class="foot"><span>${esc(t('last_intervention'))}</span><strong>${esc(fmtDate(m.last_intervention))}</strong></div>
      </article>`).join('') : `<div style="grid-column:1/-1">${emptyState(t('none'), 'machine')}</div>`;
  };
  draw();

  $('#q', view).addEventListener('input', debounce(e => { f.q = e.target.value; draw(); }, 120));
  $('#client', view).addEventListener('change', e => { f.client = e.target.value; draw(); });
  $('#status', view).addEventListener('click', e => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    f.status = b.dataset.s;
    $$('.chip', $('#status', view)).forEach(c => c.classList.toggle('on', c === b));
    draw();
  });
  $('#list', view).addEventListener('click', e => {
    const c = e.target.closest('[data-id]'); if (c) location.hash = '#/machines/' + c.dataset.id;
  });
  $('#list', view).addEventListener('keydown', e => {
    const c = e.target.closest('[data-id]'); if (c && e.key === 'Enter') location.hash = '#/machines/' + c.dataset.id;
  });
  $('#add', view).addEventListener('click', async () => {
    const m = await machineForm();
    if (m) location.hash = '#/machines/' + m.id;
  });
}

/* ---------- Fiche machine ---------- */
export async function renderMachine(view, id) {
  const m = await api.machines.get(id);
  const kv = (label, value) => `<div><span>${esc(label)}</span><strong>${value || '—'}</strong></div>`;
  view.innerHTML = `
  <div class="page">
    <a class="crumb" href="#/machines">${icon('left')} ${esc(t('nav_installed'))}</a>
    <div class="page-head">
      <div>
        <div class="row"><h1 class="mono">${esc(m.serial)}</h1>${machineStatus(m.status)}</div>
        <p class="sub">${esc([m.model, m.type, m.application].filter(Boolean).join(' · '))}</p>
      </div>
      <div class="actions">
        <button class="btn" id="edit">${icon('edit')} ${esc(t('edit'))}</button>
        ${isManager() ? `<button class="btn" id="archive">${icon('trash')} ${esc(t('archive'))}</button>` : ''}
        <a class="btn primary" href="#/reports/new?machine=${m.id}">${icon('plus')} ${esc(t('new_report'))}</a>
      </div>
    </div>
    <div class="grid cols-2" style="align-items:start">
      <section class="card card-pad stack">
        <h2>${esc(t('machine'))}</h2>
        <div class="kv">
          ${kv(t('client'), esc(m.client_name))}
          ${kv(t('site'), `${esc(m.site_name)}${m.city ? ', ' + esc(m.city) : ''} ${countryFlag(m.site_country)}`)}
          ${kv(t('manufacturer'), esc(m.manufacturer))}
          ${kv(t('model'), esc(m.model))}
          ${kv(t('eq_order'), esc(m.order_no))}
          ${kv(t('type'), esc(m.type))}
          ${kv(t('application'), esc(m.application))}
          ${kv(t('power'), m.power_kw ? esc(Number(m.power_kw).toLocaleString()) + ' kW' : '')}
          ${kv(t('ratio'), esc(m.ratio))}
          ${kv(t('speeds'), esc(m.speeds))}
          ${kv(t('commissioning'), esc(fmtDate(m.commissioning_date)))}
        </div>
        ${m.notes ? `<div><span class="muted" style="font-size:12.5px;font-weight:550">${esc(t('notes'))}</span><p style="white-space:pre-wrap">${esc(m.notes)}</p></div>` : ''}
      </section>
      <section class="card">
        <div class="card-head"><h2>${esc(t('history'))}</h2><span class="tag">${m.reports.length} ${esc(t('interventions'))}</span></div>
        <div class="timeline">
          ${m.reports.length ? m.reports.map(r => `
            <a class="tl-item" href="#/reports/${r.id}">
              <span class="tl-dot"></span>
              <div style="flex:1;min-width:0">
                <div class="row" style="gap:8px"><strong>${esc(fmtDate(r.date))}</strong>${reportType(r.type)}${reportStatus(r.status)}</div>
                <div class="muted" style="font-size:13.5px"><span class="mono">${esc(r.number)}</span>${r.title ? ' · ' + esc(r.title) : ''}</div>
                <div class="avatars" style="margin-top:6px">${(r.technicians || []).map(uid => avatar(userName(uid))).join('')}</div>
              </div>
            </a>`).join('') : emptyState(t('none'), 'report')}
        </div>
      </section>
    </div>
  </div>`;

  $('#edit', view).addEventListener('click', async () => { if (await machineForm(m)) renderMachine(view, id); });
  const arch = $('#archive', view);
  if (arch) arch.addEventListener('click', async () => {
    if (!(await confirmBox(t('confirm_archive'), t('archive')))) return;
    await api.machines.remove(m.id);
    toast(t('saved'));
    location.hash = '#/machines';
  });
}

/* ---------- Clients et sites ---------- */
const clientFields = () => [
  { name: 'name', label: t('name'), required: true, full: true },
  { name: 'country', label: t('country'), type: 'select', options: [['', '—'], ...COUNTRIES] },
  { name: 'contact', label: t('contact') },
  { name: 'phone', label: t('phone'), type: 'text' },
  { name: 'email', label: t('email'), type: 'email' },
  { name: 'address', label: t('address'), type: 'textarea', full: true, rows: 2 }
];
const siteFields = clients => [
  { name: 'client_id', label: t('client'), type: 'select', required: true, full: true, options: clients.map(c => [c.id, c.name]) },
  { name: 'name', label: t('name'), required: true, full: true },
  { name: 'city', label: t('city') },
  { name: 'country', label: t('country'), type: 'select', options: [['', '—'], ...COUNTRIES] },
  { name: 'contact', label: t('contact') },
  { name: 'phone', label: t('phone') },
  { name: 'address', label: t('address'), type: 'textarea', full: true, rows: 2 }
];

export async function renderClients(view) {
  const [clients, sites] = await Promise.all([api.clients.list(), api.sites.list()]);
  const canEdit = isManager();
  let q = '';
  view.innerHTML = `
  <div class="page">
    <div class="page-head">
      <div><h1>${esc(t('nav_installed'))}</h1><p class="sub">${clients.length} ${esc(t('clients').toLowerCase())} · ${sites.length} ${esc(t('sites').toLowerCase())}</p></div>
      <div class="actions">${tabs('clients')}
        ${canEdit ? `<button class="btn" id="add-site">${icon('pin')} ${esc(t('add_site'))}</button>
        <button class="btn primary" id="add-client">${icon('plus')} ${esc(t('add_client'))}</button>` : ''}</div>
    </div>
    <div class="toolbar"><label class="search">${icon('search')}<input type="search" id="q" placeholder="${esc(t('search'))}"></label></div>
    <div class="stack" id="list"></div>
  </div>`;

  const draw = () => {
    const ql = q.toLowerCase();
    const list = clients.filter(c => !ql || [c.name, c.contact, c.country, ...sites.filter(s => s.client_id === c.id).map(s => s.name + ' ' + (s.city || ''))]
      .join(' ').toLowerCase().includes(ql));
    $('#list', view).innerHTML = list.length ? list.map(c => {
      const cs = sites.filter(s => s.client_id === c.id);
      return `
      <section class="card">
        <div class="card-head">
          <div class="row" style="gap:12px">
            <span class="thumb-ic">${icon('building')}</span>
            <div><h2>${esc(c.name)} <span style="font-size:15px">${countryFlag(c.country)}</span></h2>
              <div class="muted" style="font-size:13.5px">${esc([c.contact, c.phone, c.email].filter(Boolean).join(' · ') || '—')}</div></div>
          </div>
          <div class="row" style="gap:4px">
            <span class="tag">${c.machine_count} ${esc(t('machines').toLowerCase())}</span>
            ${canEdit ? `<button class="icon-btn" data-edit-client="${c.id}" title="${esc(t('edit'))}">${icon('edit')}</button>` : ''}
          </div>
        </div>
        <div class="list">
          ${cs.length ? cs.map(s => `
            <div class="list-item" data-site="${s.id}">
              <span class="thumb-ic alt">${icon('pin')}</span>
              <div class="main-col"><div class="t1">${esc(s.name)} ${countryFlag(s.country)}</div>
                <div class="t2">${esc([s.city, s.contact, s.phone].filter(Boolean).join(' · ') || '—')}</div></div>
              <div class="end"><span class="tag">${s.machine_count} ${esc(t('machines').toLowerCase())}</span>
                ${canEdit ? `<button class="icon-btn" data-edit-site="${s.id}">${icon('edit')}</button>` : ''}
                <button class="icon-btn" data-add-machine="${s.id}" title="${esc(t('add_machine'))}">${icon('plus')}</button>
              </div>
            </div>`).join('') : `<div class="list-item muted">—</div>`}
        </div>
      </section>`;
    }).join('') : emptyState(t('none'), 'building');
  };
  draw();

  $('#q', view).addEventListener('input', debounce(e => { q = e.target.value; draw(); }, 120));
  const reload = () => renderClients(view);
  $('.page', view).addEventListener('click', async e => {
    let b;
    if ((b = e.target.closest('#add-client'))) {
      if (await formModal(t('add_client'), clientFields(), {}, d => api.clients.create(d))) reload();
    } else if ((b = e.target.closest('#add-site'))) {
      if (await formModal(t('add_site'), siteFields(clients), {}, d => api.sites.create({ ...d, client_id: Number(d.client_id) }))) reload();
    } else if ((b = e.target.closest('[data-edit-client]'))) {
      const c = clients.find(x => x.id === Number(b.dataset.editClient));
      const res = await modalWithArchive(t('edit'), clientFields(), c, d => api.clients.update(c.id, d), () => api.clients.remove(c.id));
      if (res) reload();
    } else if ((b = e.target.closest('[data-edit-site]'))) {
      const s = sites.find(x => x.id === Number(b.dataset.editSite));
      const res = await modalWithArchive(t('edit'), siteFields(clients), s, d => api.sites.update(s.id, { ...d, client_id: Number(d.client_id) }), () => api.sites.remove(s.id));
      if (res) reload();
    } else if ((b = e.target.closest('[data-add-machine]'))) {
      const m = await machineForm({}, Number(b.dataset.addMachine));
      if (m) location.hash = '#/machines/' + m.id;
    }
  });
}

async function modalWithArchive(title, fields, values, onSave, onArchive) {
  const { modal, formHTML, readForm } = await import('../ui.js');
  return modal({
    title, body: `<form onsubmit="return false">${formHTML(fields, values)}</form>`,
    actions: [
      { label: t('archive'), kind: 'ghost', onClick: async () => {
        if (!(await confirmBox(t('confirm_archive'), t('archive')))) return false;
        await onArchive(); toast(t('saved')); return true;
      } },
      { label: t('cancel') },
      { label: t('save'), kind: 'primary', onClick: async w => { await onSave(readForm(w)); toast(t('saved')); return true; } }
    ]
  });
}
