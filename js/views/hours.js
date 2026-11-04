/* Module 3 – Feuilles d'heures */
import { api } from '../api.js';
import { t, getLang } from '../i18n.js';
import {
  state, icon, esc, $, toISO, fromISO, todayISO, mondayOf, addDays, isoWeek, fmtDate, fmtHours, modal, formHTML,
  readForm, toast, confirmBox, isManager
} from '../ui.js';

const KINDS = ['site', 'travel', 'waiting', 'office'];
const KIND_COLOR = { site: 'var(--accent)', travel: 'var(--info)', waiting: 'var(--warn)', office: 'var(--muted)' };

/* Formulaire de saisie (utilisé aussi depuis un rapport) */
export async function hoursForm(entry = {}, userId) {
  const reports = await api.reports.list(isManager() && userId && userId !== state.user.id ? {} : { mine: 1 });
  const fields = [
    { name: 'date', label: t('date'), type: 'date', required: true },
    { name: 'hours', label: t('duration'), type: 'number', step: '0.25', required: true, placeholder: '7,5' },
    { name: 'kind', label: t('kind'), type: 'select', options: KINDS.map(k => [k, t('hk_' + k)]) },
    { name: 'report_id', label: t('linked_report'), type: 'select',
      options: [['', t('no_report')], ...reports.slice(0, 80).map(r => [r.id, `${r.number} · ${r.client_name || ''} · ${fmtDate(r.date)}`])] },
    { name: 'note', label: t('notes'), type: 'textarea', full: true, rows: 2 }
  ];
  const values = { date: todayISO(), kind: 'site', ...entry };
  const actions = [{ label: t('cancel') }];
  if (entry.id) actions.unshift({ label: t('delete'), kind: 'ghost', onClick: async () => {
    if (!(await confirmBox(t('delete') + ' ?'))) return false;
    await api.timesheets.remove(entry.id); toast(t('saved')); return true;
  } });
  actions.push({ label: t('save'), kind: 'primary', onClick: async w => {
    const d = readForm(w);
    const data = { ...d, hours: String(d.hours).replace(',', '.'), report_id: d.report_id ? Number(d.report_id) : null };
    if (userId) data.user_id = userId;
    entry.id ? await api.timesheets.update(entry.id, data) : await api.timesheets.create(data);
    toast(t('saved'));
    return true;
  } });
  return modal({ title: entry.id ? t('edit') : t('new_entry'), body: `<form onsubmit="return false">${formHTML(fields, values)}</form>`, actions });
}

export async function renderHours(view) {
  let monday = mondayOf(new Date());
  let who = String(state.user.id);   // id utilisateur ou 'all'
  const manager = isManager();

  view.innerHTML = `
  <div class="page">
    <div class="page-head">
      <div><h1>${esc(t('hours'))}</h1><p class="sub" id="sub"></p></div>
      <div class="actions">
        <button class="btn" id="export">${icon('download')} ${esc(t('export_csv'))}</button>
        <button class="btn primary" id="add">${icon('plus')} ${esc(t('new_entry'))}</button>
      </div>
    </div>
    <div class="toolbar">
      <div class="week-nav">
        <button class="icon-btn" id="prev" title="${esc(t('prev_week'))}">${icon('left')}</button>
        <span class="week-label" id="wl"></span>
        <button class="icon-btn" id="next" title="${esc(t('next_week'))}">${icon('right')}</button>
        <button class="btn sm" id="today">${esc(t('today'))}</button>
      </div>
      <span class="spacer"></span>
      ${manager ? `<select id="who">
        <option value="${state.user.id}">${esc(state.user.name)}</option>
        ${state.users.filter(u => u.id !== state.user.id && u.active).map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}
        <option value="all">${esc(t('all_techs'))}</option></select>
        <button class="btn" id="validate">${icon('check')} ${esc(t('validate_week'))}</button>` : ''}
    </div>
    <div class="totals" id="totals" style="margin-bottom:16px"></div>
    <div id="body"></div>
    <div class="legend" style="margin-top:14px">${KINDS.map(k => `<span><i style="background:${KIND_COLOR[k]}"></i>${esc(t('hk_' + k))}</span>`).join('')}</div>
  </div>`;

  let entries = [];
  const range = () => [toISO(monday), toISO(addDays(monday, 6))];

  const load = async () => {
    const [from, to] = range();
    entries = await api.timesheets.list({ from, to, user_id: manager ? who : undefined });
    draw();
  };

  const draw = () => {
    const [from, to] = range();
    const loc = getLang() === 'en' ? 'en-GB' : 'fr-FR';
    $('#wl', view).textContent = `${t('week')} ${isoWeek(monday)} · ${fmtDate(from, { day: 'numeric', month: 'short' })} – ${fmtDate(to, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    const total = entries.reduce((a, e) => a + e.hours, 0);
    const byKind = k => entries.filter(e => e.kind === k).reduce((a, e) => a + e.hours, 0);
    const allValidated = entries.length && entries.every(e => e.status === 'validated');
    $('#sub', view).innerHTML = allValidated ? `<span class="badge hs-validated">${esc(t('week_validated'))}</span>` : '';
    $('#totals', view).innerHTML = `
      <div class="card kpi"><span class="label">${esc(t('total'))}</span><span class="value">${esc(fmtHours(total))}</span></div>
      ${KINDS.map(k => `<div class="card kpi"><span class="label"><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${KIND_COLOR[k]};margin-right:6px"></i>${esc(t('hk_' + k))}</span><span class="value">${esc(fmtHours(byKind(k)))}</span></div>`).join('')}`;

    const v = $('#validate', view);
    if (v) v.disabled = who === 'all' || !entries.length || allValidated;

    if (who === 'all') {
      // Vue responsable : tableau récapitulatif par technicien
      const users = [...new Set(entries.map(e => e.user_id))];
      const days = [...Array(7)].map((_, i) => toISO(addDays(monday, i)));
      $('#body', view).innerHTML = `<section class="card"><div class="table-wrap"><table class="data-table">
        <thead><tr><th>${esc(t('technician'))}</th>${days.map(d => `<th style="text-align:center">${esc(fromISO(d).toLocaleDateString(loc, { weekday: 'short', day: 'numeric' }))}</th>`).join('')}<th style="text-align:right">${esc(t('total'))}</th><th>${esc(t('status'))}</th></tr></thead>
        <tbody>${users.length ? users.map(uid => {
          const ue = entries.filter(e => e.user_id === uid);
          const validated = ue.every(e => e.status === 'validated');
          return `<tr class="click" data-user="${uid}"><td><strong style="font-weight:600">${esc(ue[0].user_name)}</strong></td>
            ${days.map(d => { const h = ue.filter(e => e.date === d).reduce((a, e) => a + e.hours, 0); return `<td style="text-align:center">${h ? esc(fmtHours(h)) : '<span class="muted">·</span>'}</td>`; }).join('')}
            <td style="text-align:right;font-weight:700">${esc(fmtHours(ue.reduce((a, e) => a + e.hours, 0)))}</td>
            <td><span class="badge ${validated ? 'hs-validated' : 'hs-entered'}">${esc(t(validated ? 'hs_validated' : 'hs_entered'))}</span></td></tr>`;
        }).join('') : `<tr><td colspan="10" class="muted" style="text-align:center;padding:30px">${esc(t('none'))}</td></tr>`}</tbody></table></div></section>`;
      return;
    }

    const today = todayISO();
    $('#body', view).innerHTML = `<div class="week-grid">${[...Array(7)].map((_, i) => {
      const d = addDays(monday, i), iso = toISO(d);
      const de = entries.filter(e => e.date === iso);
      const sum = de.reduce((a, e) => a + e.hours, 0);
      return `<div class="day ${iso === today ? 'today' : ''} ${i > 4 ? 'weekend' : ''}">
        <div class="day-head"><span class="dn">${esc(d.toLocaleDateString(loc, { weekday: 'long' }))}</span><span class="dd">${esc(d.toLocaleDateString(loc, { day: 'numeric', month: 'short' }))}</span></div>
        <div class="day-total">${sum ? esc(fmtHours(sum)) : '<span class="muted" style="font-size:15px;font-weight:500">—</span>'}</div>
        ${de.map(e => `<div class="entry k-${esc(e.kind)} ${e.status === 'validated' ? 'locked' : ''}" data-entry="${e.id}">
          <div class="row" style="justify-content:space-between;gap:4px"><span class="h">${esc(fmtHours(e.hours))}</span><span>${esc(t('hk_' + e.kind))}${e.status === 'validated' ? ' ✓' : ''}</span></div>
          ${e.report_number || e.note ? `<div class="n">${esc([e.report_number, e.client_name, e.note].filter(Boolean).join(' · '))}</div>` : ''}
        </div>`).join('')}
        <button class="add" data-add-day="${iso}" title="${esc(t('new_entry'))}">${icon('plus')}</button>
      </div>`;
    }).join('')}</div>`;
  };

  const targetUser = () => (who === 'all' ? undefined : Number(who));
  const page = $('.page', view);
  page.addEventListener('click', async e => {
    let b;
    if (e.target.closest('#prev')) { monday = addDays(monday, -7); return load(); }
    if (e.target.closest('#next')) { monday = addDays(monday, 7); return load(); }
    if (e.target.closest('#today')) { monday = mondayOf(new Date()); return load(); }
    if (e.target.closest('#add')) { if (await hoursForm({}, targetUser())) load(); return; }
    if ((b = e.target.closest('[data-add-day]'))) { if (await hoursForm({ date: b.dataset.addDay }, targetUser())) load(); return; }
    if ((b = e.target.closest('[data-entry]'))) {
      const en = entries.find(x => x.id === Number(b.dataset.entry));
      if (en.status === 'validated' && !manager) return toast(t('hs_validated'));
      if (await hoursForm(en, en.user_id)) load();
      return;
    }
    if ((b = e.target.closest('[data-user]'))) {
      who = b.dataset.user; $('#who', view).value = who; return load();
    }
    if (e.target.closest('#validate')) {
      const [from, to] = range();
      await api.timesheets.validate(Number(who), from, to);
      toast(t('week_validated')); return load();
    }
    if (e.target.closest('#export')) return exportCSV();
  });
  const whoSel = $('#who', view);
  if (whoSel) whoSel.addEventListener('change', e => { who = e.target.value; load(); });

  /* Export compatible Excel (séparateur « ; », encodage UTF-8 avec BOM) */
  const exportCSV = () => {
    const [from, to] = range();
    const fr = getLang() === 'fr';
    const num = n => fr ? String(n).replace('.', ',') : String(n);
    const cols = [t('date'), t('technician'), t('country'), t('kind'), t('duration'), t('report'), t('client'), t('site'), t('notes'), t('status')];
    const lines = [cols, ...entries.map(e => [e.date, e.user_name, e.user_country || '', t('hk_' + e.kind), num(e.hours),
      e.report_number || '', e.client_name || '', e.site_name || '', e.note || '', t('hs_' + e.status)])];
    const csv = '﻿' + lines.map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `heures_${from}_${to}${who === 'all' ? '' : '_' + (state.users.find(u => u.id === Number(who)) || {}).name}.csv`.replace(/\s+/g, '_');
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  await load();
}
