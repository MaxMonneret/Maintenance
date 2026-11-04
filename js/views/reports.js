/* Module 2 – Liste des rapports d'intervention */
import { api } from '../api.js';
import { t } from '../i18n.js';
import { icon, esc, $, $$, fmtDate, reportStatus, reportType, emptyState, avatar, userName, debounce } from '../ui.js';

const STATUSES = ['draft', 'done', 'validated'];
const TYPES = ['preventive', 'curative', 'commissioning', 'expertise'];

export async function renderReports(view) {
  const f = { q: '', status: '', type: '', mine: localStorage.getItem('fs_mine') === '1' };
  const reports = await api.reports.list();

  view.innerHTML = `
  <div class="page">
    <div class="page-head">
      <div><h1>${esc(t('reports'))}</h1><p class="sub" id="count"></p></div>
      <div class="actions"><a class="btn primary lg" href="#/reports/new">${icon('plus')} ${esc(t('new_report'))}</a></div>
    </div>
    <div class="toolbar">
      <label class="search">${icon('search')}<input type="search" id="q" placeholder="${esc(t('search'))}"></label>
      <select id="type"><option value="">${esc(t('type'))} : ${esc(t('all'))}</option>
        ${TYPES.map(x => `<option value="${x}">${esc(t('rt_' + x))}</option>`).join('')}</select>
      <div class="chips" id="status">
        <button class="chip on" data-s="">${esc(t('all'))}</button>
        ${STATUSES.map(s => `<button class="chip" data-s="${s}">${esc(t('rs_' + s))}</button>`).join('')}
        <button class="chip ${f.mine ? 'on' : ''}" id="mine">${icon('user', 'sm')} ${esc(t('mine_only'))}</button>
      </div>
    </div>
    <section class="card"><div class="table-wrap"><table class="data-table">
      <thead><tr>
        <th>${esc(t('report'))}</th><th>${esc(t('date'))}</th><th>${esc(t('client'))} / ${esc(t('site'))}</th>
        <th class="hide-sm">${esc(t('machine'))}</th><th class="hide-sm">${esc(t('technicians'))}</th><th>${esc(t('status'))}</th>
      </tr></thead>
      <tbody id="rows"></tbody>
    </table></div></section>
  </div>`;

  const me = (await import('../ui.js')).state.user.id;
  const draw = () => {
    const q = f.q.toLowerCase();
    const rows = reports.filter(r =>
      (!f.status || r.status === f.status) && (!f.type || r.type === f.type) &&
      (!f.mine || (r.technicians || []).includes(me)) &&
      (!q || [r.number, r.title, r.client_name, r.site_name, r.serial, r.model].join(' ').toLowerCase().includes(q)));
    $('#count', view).textContent = `${rows.length} / ${reports.length}`;
    $('#rows', view).innerHTML = rows.length ? rows.map(r => `
      <tr class="click" data-id="${r.id}">
        <td><div class="mono" style="font-weight:600">${esc(r.number)}</div><div style="margin-top:3px">${reportType(r.type)}</div></td>
        <td style="white-space:nowrap">${esc(fmtDate(r.date))}</td>
        <td><strong style="font-weight:600">${esc(r.client_name || '—')}</strong><div class="muted" style="font-size:13px">${esc(r.site_name || '')}${r.title ? ' · ' + esc(r.title) : ''}</div></td>
        <td class="hide-sm"><span class="mono">${esc(r.serial || '—')}</span><div class="muted" style="font-size:13px">${esc(r.model || '')}</div></td>
        <td class="hide-sm"><span class="avatars">${(r.technicians || []).map(id => avatar(userName(id))).join('')}</span></td>
        <td>${reportStatus(r.status)}</td>
      </tr>`).join('') : `<tr><td colspan="6">${emptyState(t('none'), 'report')}</td></tr>`;
  };
  draw();

  $('#q', view).addEventListener('input', debounce(e => { f.q = e.target.value; draw(); }, 120));
  $('#type', view).addEventListener('change', e => { f.type = e.target.value; draw(); });
  $('#status', view).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'mine') {
      f.mine = !f.mine; b.classList.toggle('on', f.mine);
      try { localStorage.setItem('fs_mine', f.mine ? '1' : '0'); } catch {}
    } else {
      f.status = b.dataset.s;
      $$('[data-s]', $('#status', view)).forEach(c => c.classList.toggle('on', c === b));
    }
    draw();
  });
  $('#rows', view).addEventListener('click', e => {
    const tr = e.target.closest('[data-id]'); if (tr) location.hash = '#/reports/' + tr.dataset.id;
  });
}
