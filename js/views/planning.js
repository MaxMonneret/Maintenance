/* Planning des techniciens
 * Responsable / administrateur : vue de toute l'équipe, création et modification des missions.
 * Technicien : son planning, « marquer réalisé », création du rapport d'une intervention planifiée. */
import { api } from '../api.js';
import { t, getLang } from '../i18n.js';
import {
  state, icon, esc, $, toISO, fromISO, todayISO, mondayOf, addDays, isoWeek, fmtDate, modal, formHTML, readForm,
  toast, toastError, confirmBox, isManager, avatar
} from '../ui.js';

export const PLAN_KINDS = ['intervention', 'travel', 'training', 'office', 'standby', 'leave'];
const PLAN_STATUS = ['planned', 'confirmed', 'done'];

/* ---------- Formulaire d'une mission (responsables) ---------- */
export async function planForm(entry = {}) {
  const [machines, users] = await Promise.all([api.machines.list(), api.users.list()]);
  const techs = users.filter(u => u.active && (u.role === 'technician' || u.id === entry.user_id));
  const fields = [
    { name: 'user_id', label: t('technician'), type: 'select', required: true, options: techs.map(u => [u.id, u.name]) },
    { name: 'kind', label: t('kind'), type: 'select', options: PLAN_KINDS.map(k => [k, t('pk_' + k)]) },
    { name: 'start_date', label: t('date'), type: 'date', required: true },
    { name: 'end_date', label: t('end_date'), type: 'date', required: true },
    { name: 'title', label: t('plan_title'), full: true, placeholder: t('plan_title_ph') },
    { name: 'machine_id', label: t('machine'), type: 'select', full: true,
      options: [['', '—'], ...machines.map(m => [m.id, `${m.client_name} · ${m.site_name} · ${m.serial}${m.model ? ' (' + m.model + ')' : ''}`])] },
    { name: 'status', label: t('status'), type: 'select', options: PLAN_STATUS.map(s => [s, t('ps_' + s)]) },
    { name: 'notes', label: t('notes'), type: 'textarea', full: true, rows: 3 }
  ];
  const values = { kind: 'intervention', status: 'planned', start_date: todayISO(), ...entry };
  if (!values.end_date) values.end_date = values.start_date;
  const actions = [{ label: t('cancel') }];
  if (entry.id) actions.unshift({ label: t('delete'), kind: 'ghost', onClick: async () => {
    if (!(await confirmBox(t('delete') + ' ?'))) return false;
    await api.planning.remove(entry.id); toast(t('saved')); return true;
  } });
  actions.push({ label: t('save'), kind: 'primary', onClick: async w => {
    const d = readForm(w);
    if (d.end_date < d.start_date) d.end_date = d.start_date;
    entry.id ? await api.planning.update(entry.id, d) : await api.planning.create(d);
    toast(t('saved')); return true;
  } });
  return modal({ title: entry.id ? t('edit') : t('plan_add'), body: `<form onsubmit="return false">${formHTML(fields, values)}</form>`, actions, wide: true });
}

/* ---------- Fiche d'une mission (lecture + actions du technicien) ---------- */
async function planDetails(p) {
  const manager = isManager();
  const mine = p.user_id === state.user.id;
  const rows = [
    [t('technician'), esc(p.user_name)],
    [t('kind'), `<span class="pk pk-${esc(p.kind)}">${esc(t('pk_' + p.kind))}</span>`],
    [t('date'), esc(fmtDate(p.start_date)) + (p.end_date !== p.start_date ? ' → ' + esc(fmtDate(p.end_date)) : '')],
    [t('status'), esc(t('ps_' + p.status))],
    p.client_name ? [t('machine'), `${esc(p.client_name)} · ${esc(p.site_name || '')} · <a href="#/machines/${p.machine_id}" class="mono">${esc(p.serial)}</a>`] : null,
    p.report_number ? [t('report'), `<a href="#/reports/${p.report_id}" class="mono">${esc(p.report_number)}</a>`] : null,
    p.notes ? [t('notes'), `<span style="white-space:pre-wrap">${esc(p.notes)}</span>`] : null
  ].filter(Boolean);
  const actions = [{ label: t('close') }];
  if (manager) actions.unshift({ label: t('edit'), onClick: async () => { setTimeout(() => planForm(p).then(r => r && document.dispatchEvent(new Event('fs:planning'))), 0); return true; } });
  if ((mine || manager) && p.status !== 'done') actions.push({ label: t('plan_mark_done'), onClick: async () => {
    await api.planning.update(p.id, { status: 'done' }); toast(t('ps_done')); return true;
  } });
  if (p.kind === 'intervention' && p.machine_id && (mine || manager)) {
    actions.push(p.report_id
      ? { label: t('plan_open_report'), kind: 'primary', onClick: () => { location.hash = '#/reports/' + p.report_id; return true; } }
      : { label: t('plan_create_report'), kind: 'primary', onClick: () => { location.hash = `#/reports/new?machine=${p.machine_id}&plan=${p.id}`; return true; } });
  }
  return modal({ title: p.title || t('pk_' + p.kind),
    body: `<div class="kv">${rows.map(([k, v]) => `<div><span>${esc(k)}</span><strong>${v}</strong></div>`).join('')}</div>`, actions });
}

/* ---------- Écran Planning ---------- */
export async function renderPlanning(view) {
  const manager = isManager();
  let start = mondayOf(new Date());
  let weeks = Number(localStorage.getItem('fs_plan_weeks')) || (manager ? 2 : 1);

  view.innerHTML = `
  <div class="page page-wide">
    <div class="page-head">
      <div><h1>${esc(t('nav_planning'))}</h1><p class="sub">${esc(t(manager ? 'plan_sub_manager' : 'plan_sub_tech'))}</p></div>
      <div class="actions">${manager ? `<button class="btn primary" id="add">${icon('plus')} ${esc(t('plan_add'))}</button>` : ''}</div>
    </div>
    <div class="toolbar">
      <div class="week-nav">
        <button class="icon-btn" id="prev" title="${esc(t('prev_week'))}">${icon('left')}</button>
        <span class="week-label" id="wl"></span>
        <button class="icon-btn" id="next" title="${esc(t('next_week'))}">${icon('right')}</button>
        <button class="btn sm" id="today">${esc(t('today'))}</button>
      </div>
      <div class="seg" id="range">${[1, 2, 4].map(n => `<button data-w="${n}" class="${n === weeks ? 'on' : ''}">${esc(t('plan_weeks_' + n))}</button>`).join('')}</div>
      <div class="plan-legend">${PLAN_KINDS.map(k => `<span class="pk pk-${k}">${esc(t('pk_' + k))}</span>`).join('')}</div>
    </div>
    <div class="card plan-card"><div class="plan-scroll" id="grid"></div></div>
  </div>`;

  const draw = async () => {
    const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
    const from = toISO(days[0]), to = toISO(days[days.length - 1]);
    $('#wl', view).textContent = `${t('week')} ${isoWeek(days[0])}${weeks > 1 ? '–' + isoWeek(days[days.length - 1]) : ''} · ${fmtDate(from, { day: 'numeric', month: 'short' })} – ${fmtDate(to, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    let entries = [];
    try { entries = await api.planning.list({ from, to }); } catch (e) { toastError(e); }
    const people = manager
      ? state.users.filter(u => u.active && (u.role === 'technician' || entries.some(p => p.user_id === u.id)))
      : state.users.filter(u => u.id === state.user.id);
    const today = todayISO();
    const lang = getLang() === 'en' ? 'en-GB' : 'fr-FR';
    const dayHead = d => {
      const iso = toISO(d), we = d.getDay() === 0 || d.getDay() === 6;
      return `<th class="${we ? 'we' : ''} ${iso === today ? 'today' : ''}"><span>${esc(d.toLocaleDateString(lang, { weekday: 'short' }))}</span><strong>${d.getDate()}</strong></th>`;
    };
    const cell = (u, d) => {
      const iso = toISO(d), we = d.getDay() === 0 || d.getDay() === 6;
      const list = entries.filter(p => p.user_id === u.id && p.start_date <= iso && p.end_date >= iso);
      const conflict = list.filter(p => p.kind !== 'travel').length > 1;
      return `<td class="${we ? 'we' : ''} ${iso === today ? 'today' : ''} ${conflict ? 'conflict' : ''}" data-u="${u.id}" data-d="${iso}">
        ${list.map(p => {
          const first = p.start_date === iso || iso === from;
          const last = p.end_date === iso || iso === to;
          return `<button class="plan-chip pk-${esc(p.kind)} st-${esc(p.status)} ${first ? 'first' : 'cont'} ${last ? 'last' : ''}" data-p="${p.id}"
            title="${esc((p.title || t('pk_' + p.kind)) + (p.client_name ? ' – ' + p.client_name : ''))}">
            ${first ? `<b>${esc(p.title || t('pk_' + p.kind))}</b>${p.client_name ? `<small>${esc(p.client_name)}${p.serial ? ' · ' + esc(p.serial) : ''}</small>` : ''}` : '<small>↳</small>'}
            ${p.status === 'done' ? `<i class="done">${icon('check')}</i>` : ''}
          </button>`;
        }).join('')}
        ${conflict ? `<span class="plan-warn" title="${esc(t('plan_conflict'))}">!</span>` : ''}
      </td>`;
    };
    const load = u => days.filter(d => d.getDay() % 6 !== 0)
      .filter(d => entries.some(p => p.user_id === u.id && p.kind !== 'leave' && p.start_date <= toISO(d) && p.end_date >= toISO(d))).length;
    const workdays = days.filter(d => d.getDay() % 6 !== 0).length;
    $('#grid', view).innerHTML = `
      <table class="plan-table ${weeks > 2 ? 'dense' : ''}">
        <thead><tr><th class="who">${esc(t('technician'))}</th>${days.map(dayHead).join('')}</tr></thead>
        <tbody>${people.map(u => `<tr>
          <th class="who"><div class="row" style="gap:8px;flex-wrap:nowrap">${avatar(u.name)}<span><strong>${esc(u.name)}</strong>
            <small>${load(u)} / ${workdays} ${esc(t('plan_days'))}</small></span></div></th>
          ${days.map(d => cell(u, d)).join('')}</tr>`).join('') || `<tr><td colspan="${days.length + 1}" class="muted" style="padding:20px">${esc(t('plan_none'))}</td></tr>`}
        </tbody>
      </table>`;
    view._entries = entries;
  };

  $('#prev', view).onclick = () => { start = addDays(start, -7 * Math.min(weeks, 2)); draw(); };
  $('#next', view).onclick = () => { start = addDays(start, 7 * Math.min(weeks, 2)); draw(); };
  $('#today', view).onclick = () => { start = mondayOf(new Date()); draw(); };
  $('#range', view).addEventListener('click', e => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    weeks = Number(b.dataset.w); try { localStorage.setItem('fs_plan_weeks', weeks); } catch {}
    [...b.parentNode.children].forEach(c => c.classList.toggle('on', c === b)); draw();
  });
  const add = $('#add', view);
  if (add) add.onclick = async () => { if (await planForm({})) draw(); };
  $('#grid', view).addEventListener('click', async e => {
    const chip = e.target.closest('[data-p]');
    if (chip) {
      const p = view._entries.find(x => x.id === Number(chip.dataset.p));
      const res = manager ? await planForm(p) : await planDetails(p);
      if (res) draw();
      return;
    }
    const td = e.target.closest('td[data-u]');
    if (td && manager && await planForm({ user_id: Number(td.dataset.u), start_date: td.dataset.d, end_date: td.dataset.d })) draw();
  });
  const onExt = () => draw();
  document.addEventListener('fs:planning', onExt);
  await draw();
  return () => document.removeEventListener('fs:planning', onExt);
}

/* ---------- Carte « Planning à venir » de l'accueil ---------- */
export async function upcomingCard() {
  const from = todayISO(), to = toISO(addDays(new Date(), 21));
  let list = [];
  try { list = (await api.planning.list({ from, to })).filter(p => p.status !== 'done').slice(0, 6); } catch {}
  return `
    <section class="card" style="margin-top:20px">
      <div class="card-head"><h2>${esc(t('plan_upcoming'))}</h2><a class="btn sm ghost" href="#/planning">${esc(t('see_all'))} ${icon('right')}</a></div>
      <div class="list">${list.length ? list.map(p => `
        <a class="list-item" href="#/planning">
          <span class="pk pk-${esc(p.kind)}" style="min-width:96px;text-align:center">${esc(t('pk_' + p.kind))}</span>
          <div class="main-col"><div class="t1" style="font-weight:600">${esc(p.title || t('pk_' + p.kind))}</div>
            <div class="t2">${isManager() ? esc(p.user_name) + ' · ' : ''}${esc(p.client_name || '')}${p.serial ? ' · ' + esc(p.serial) : ''}</div></div>
          <span class="muted" style="white-space:nowrap">${esc(fmtDate(p.start_date, { day: '2-digit', month: 'short' }))}${p.end_date !== p.start_date ? ' → ' + esc(fmtDate(p.end_date, { day: '2-digit', month: 'short' })) : ''}</span>
        </a>`).join('') : `<div class="list-item muted" style="cursor:default">${esc(t('plan_none'))}</div>`}</div>
    </section>`;
}
