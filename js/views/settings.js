/* Réglages : entreprise, compte, utilisateurs */
import { api, LOCAL } from '../api.js';
import { exportAll, downloadJson } from '../backup.js';
import { t, setLang, getLang, LANGS } from '../i18n.js';
import {
  state, icon, esc, $, formHTML, readForm, formModal, toast, toastError, isAdmin, COUNTRIES, countryFlag, avatar
} from '../ui.js';
import { rerenderShell } from '../app.js';

function readLogo(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const r = Math.min(1, 600 / img.width, 200 / img.height);
      const c = document.createElement('canvas'); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Image illisible'));
    img.src = url;
  });
}

export async function renderSettings(view) {
  const admin = isAdmin();
  const settings = admin ? await api.settings.get() : state.settings;
  const users = admin ? await api.users.list() : [];
  const u = state.user;
  const theme = localStorage.getItem('fs_theme') || 'auto';
  let logo = settings.logo || '';

  view.innerHTML = `
  <div class="page">
    <div class="page-head"><div><h1>${esc(t('settings'))}</h1></div></div>
    ${u.must_change ? `<div class="card card-pad" style="margin-bottom:16px;border-color:var(--warn);background:var(--warn-soft)"><strong>${esc(t('must_change'))}</strong></div>` : ''}
    <div class="grid cols-2" style="align-items:start">
      <section class="card card-pad stack">
        <h2>${icon('user')} ${esc(t('my_account'))}</h2>
        <form id="me-form" onsubmit="return false">${formHTML([
          { name: 'name', label: t('name'), required: true, full: true },
          { name: 'lang', label: t('language'), type: 'select', options: Object.entries(LANGS) },
          { name: 'country', label: t('country'), type: 'select', options: COUNTRIES }
        ], { name: u.name, lang: getLang(), country: u.country })}</form>
        <div class="field"><span>${esc(t('theme'))}</span>
          <div class="seg" id="theme">${['auto', 'light', 'dark'].map(x => `<button class="${x === theme ? 'on' : ''}" data-th="${x}">${esc(t('theme_' + x))}</button>`).join('')}</div></div>
        <div class="row" style="justify-content:flex-end"><button class="btn primary" id="save-me">${esc(t('save'))}</button></div>
        ${LOCAL ? '' : `<hr style="border:0;border-top:1px solid var(--line);margin:4px 0">
        <h3>${esc(t('change_password'))}</h3>
        <form id="pw-form" onsubmit="return false">${formHTML([
          { name: 'current_password', label: t('current_password'), type: 'password', required: true, autocomplete: 'current-password' },
          { name: 'new_password', label: t('new_password'), type: 'password', required: true, autocomplete: 'new-password' }
        ])}</form>
        <div class="row" style="justify-content:flex-end"><button class="btn ${u.must_change ? 'primary' : ''}" id="save-pw">${esc(t('change_password'))}</button></div>`}
      </section>

      ${admin ? `
      <section class="card card-pad stack">
        <h2>${icon('building')} ${esc(t('company'))}</h2>
        <div class="field"><span>${esc(t('logo'))}</span>
          <div class="row"><span id="logo-prev"></span>
            <label class="btn sm">${icon('camera')} ${esc(t('choose_logo'))}<input type="file" accept="image/*" hidden id="logo-file"></label>
            <button class="btn sm ghost" id="logo-rm">${esc(t('remove_logo'))}</button></div></div>
        <form id="co-form" onsubmit="return false">${formHTML([
          { name: 'company_name', label: t('company_name'), required: true, full: true },
          { name: 'company_address', label: t('company_address'), type: 'textarea', rows: 2, full: true },
          { name: 'company_contact', label: t('company_contact'), full: true },
          { name: 'report_prefix', label: t('report_prefix') }
        ], settings)}</form>
        <div class="row" style="justify-content:flex-end"><button class="btn primary" id="save-co">${esc(t('save'))}</button></div>
      </section>` : ''}
    </div>

    ${admin ? `
    <section class="card" style="margin-top:16px">
      <div class="card-head"><h2>${icon('user')} ${esc(t('users'))}</h2><button class="btn primary sm" id="add-user">${icon('plus')} ${esc(t('add_user'))}</button></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>${esc(t('name'))}</th><th>${esc(t('login_user'))}</th><th>${esc(t('role'))}</th><th>${esc(t('country'))}</th><th>${esc(t('status'))}</th></tr></thead>
        <tbody>${users.map(x => `<tr class="click" data-user="${x.id}">
          <td><div class="row" style="gap:10px">${avatar(x.name)}<strong style="font-weight:600">${esc(x.name)}</strong></div></td>
          <td class="mono">${esc(x.email)}</td><td>${esc(t('role_' + x.role))}</td><td>${countryFlag(x.country)} ${esc(x.country || '')}</td>
          <td><span class="badge ${x.active ? 'hs-validated' : 'hs-entered'}">${esc(t(x.active ? 'active' : 'inactive'))}</span></td></tr>`).join('')}
        </tbody></table></div>
    </section>` : ''}

    ${admin || LOCAL ? `
    <section class="card card-pad stack" style="margin-top:16px">
      <h2>${icon('box')} ${esc(t('backup'))}</h2>
      <p class="muted">${esc(t(LOCAL ? 'backup_hint_local' : 'backup_hint_server'))}</p>
      <div class="row" style="gap:10px;flex-wrap:wrap">
        <button class="btn primary" id="bk-export">${icon('download')} ${esc(t('backup_export'))}</button>
        ${LOCAL ? `<label class="btn">${icon('plus')} ${esc(t('backup_import'))}<input type="file" accept=".json,application/json" hidden id="bk-import"></label>` : ''}
        <span class="muted" id="bk-state"></span>
      </div>
    </section>` : ''}
  </div>`;

  const bkExport = $('#bk-export', view);
  if (bkExport) bkExport.addEventListener('click', async () => {
    bkExport.disabled = true;
    try {
      const data = await exportAll((i, n) => { $('#bk-state', view).textContent = `${t('report')} ${i} / ${n}…`; });
      downloadJson(data, `field-service-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`);
      $('#bk-state', view).textContent = `${data.tables.reports.length} ${t('reports').toLowerCase()} · ${data.photos.length} photos`;
    } catch (e) { toastError(e); $('#bk-state', view).textContent = ''; }
    bkExport.disabled = false;
  });
  const bkImport = $('#bk-import', view);
  if (bkImport) bkImport.addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    const { confirmBox } = await import('../ui.js');
    if (!(await confirmBox(t('backup_confirm'), t('backup_import')))) { e.target.value = ''; return; }
    try {
      const res = await api.importAll(JSON.parse(await f.text()));
      toast(`${res.reports} ${t('reports').toLowerCase()} · ${res.machines} ${t('machines').toLowerCase()} · ${res.photos} photos`);
      setTimeout(() => location.reload(), 900);
    } catch (err) { toastError(err); }
    e.target.value = '';
  });

  const drawLogo = () => {
    const p = $('#logo-prev', view); if (!p) return;
    p.innerHTML = logo ? `<img class="logo-prev" src="${esc(logo)}" alt="">` : `<span class="logo-empty">${esc(t('logo'))}</span>`;
  };
  drawLogo();

  $('#theme', view).addEventListener('click', e => {
    const b = e.target.closest('[data-th]'); if (!b) return;
    const th = b.dataset.th;
    try { localStorage.setItem('fs_theme', th); } catch {}
    if (th === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = th;
    [...b.parentNode.children].forEach(c => c.classList.toggle('on', c === b));
  });

  $('#save-me', view).addEventListener('click', async () => {
    try {
      const d = readForm($('#me-form', view));
      const res = await api.updateMe(d);
      state.user = res.user;
      const langChanged = d.lang !== getLang();
      setLang(d.lang);
      state.users = await api.users.list();
      toast(t('saved'));
      rerenderShell();
    } catch (e) { toastError(e); }
  });
  $('#save-pw', view)?.addEventListener('click', async () => {
    try {
      const d = readForm($('#pw-form', view));
      const res = await api.updateMe(d);
      state.user = res.user;
      toast(t('saved'));
      rerenderShell();
    } catch (e) { toastError(e); }
  });

  if (!admin) return;
  $('#logo-file', view).addEventListener('change', async e => {
    if (!e.target.files[0]) return;
    try { logo = await readLogo(e.target.files[0]); drawLogo(); } catch (err) { toastError(err); }
  });
  $('#logo-rm', view).addEventListener('click', () => { logo = ''; drawLogo(); });
  $('#save-co', view).addEventListener('click', async () => {
    try {
      const d = readForm($('#co-form', view));
      state.settings = await api.settings.save({ ...d, logo });
      toast(t('saved'));
      rerenderShell();
    } catch (e) { toastError(e); }
  });

  const userFields = isNew => [
    { name: 'name', label: t('name'), required: true },
    { name: 'email', label: t('login_user'), required: true, placeholder: 'prenom.nom' },
    { name: 'role', label: t('role'), type: 'select', options: ['technician', 'manager', 'admin'].map(r => [r, t('role_' + r)]) },
    { name: 'country', label: t('country'), type: 'select', options: COUNTRIES },
    { name: 'lang', label: t('language'), type: 'select', options: Object.entries(LANGS) },
    ...(LOCAL ? [] : isNew ? [{ name: 'password', label: t('temp_password'), required: true }]
      : [{ name: 'active', label: t('status'), type: 'select', options: [['1', t('active')], ['0', t('inactive')]] },
        { name: 'password', label: t('reset_password'), placeholder: '—' }])
  ];
  $('#add-user', view).addEventListener('click', async () => {
    if (await formModal(t('add_user'), userFields(true), { role: 'technician', country: 'FR', lang: 'fr' }, d => api.users.create(d))) {
      state.users = await api.users.list(); renderSettings(view);
    }
  });
  $('tbody', view.querySelector('.data-table')).addEventListener('click', async e => {
    const tr = e.target.closest('[data-user]'); if (!tr) return;
    const x = users.find(y => y.id === Number(tr.dataset.user));
    const res = await formModal(t('edit'), userFields(false), { ...x, active: x.active ? '1' : '0' }, d => {
      const data = { ...d, active: d.active === '1' };
      if (!data.password) delete data.password;
      return api.users.update(x.id, data);
    });
    if (res) { state.users = await api.users.list(); renderSettings(view); }
  });
}
