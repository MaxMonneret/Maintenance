import { api, LOCAL } from '../api.js';
import { t } from '../i18n.js';
import { state, icon, esc, fmtDate, fmtHours, reportStatus, reportType, emptyState, isManager, todayISO } from '../ui.js';

export async function renderDashboard(view) {
  const d = await api.dashboard();
  const first = state.user.name.split(' ')[0];
  view.innerHTML = `
  <div class="page">
    <section class="hero">
      <div>
        <h1>${esc(t('hello'))} ${esc(first)}</h1>
        <p>${esc(fmtDate(todayISO(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</p>
      </div>
      <div class="actions">
        <a class="btn" href="#/hours">${icon('clock')} ${esc(t('new_entry'))}</a>
        <a class="btn primary lg" href="#/reports/new">${icon('plus')} ${esc(t('new_report'))}</a>
      </div>
    </section>

${LOCAL && !d.machines ? `
    <section class="card card-pad stack demo-empty" style="margin-bottom:20px">
      <h2>${icon('box')} ${esc(t('demo_empty_title'))}</h2>
      <p class="muted">${esc(t('demo_empty_text'))}</p>
      <div><button class="btn primary lg" id="load-demo">${icon('download')} ${esc(t('demo_load'))}</button></div>
    </section>` : ''}

    <div class="grid cols-4" style="margin-bottom:20px">
      <a class="card kpi" href="#/reports"><span class="kpi-ic">${icon('edit')}</span>
        <span class="label">${esc(t('kpi_drafts'))}</span><span class="value">${d.drafts}</span></a>
      ${isManager() ? `
      <a class="card kpi ${d.to_validate ? 'warn' : ''}" href="#/reports"><span class="kpi-ic">${icon('check')}</span>
        <span class="label">${esc(t('kpi_to_validate'))}</span><span class="value">${d.to_validate}</span></a>` : `
      <a class="card kpi" href="#/reports"><span class="kpi-ic">${icon('report')}</span>
        <span class="label">${esc(t('kpi_month'))}</span><span class="value">${d.reports_month}</span></a>`}
      <a class="card kpi" href="#/hours"><span class="kpi-ic">${icon('clock')}</span>
        <span class="label">${esc(t('kpi_hours_week'))}</span><span class="value">${esc(fmtHours(d.hours_week))}</span></a>
      <a class="card kpi ${d.machines_alert ? 'warn' : ''}" href="#/machines"><span class="kpi-ic">${icon('machine')}</span>
        <span class="label">${esc(t('kpi_machines'))}</span><span class="value">${d.machines}</span>
        <span class="hint">${d.machines_alert} ${esc(t('kpi_alert'))}</span></a>
    </div>

    <section class="card">
      <div class="card-head"><h2>${esc(t('recent_reports'))}</h2><a class="btn sm ghost" href="#/reports">${esc(t('see_all'))} ${icon('right')}</a></div>
      <div class="list">
        ${d.recent.length ? d.recent.map(r => `
          <a class="list-item" href="#/reports/${r.id}">
            <span class="thumb-ic">${icon('report')}</span>
            <div class="main-col">
              <div class="t1"><span class="mono">${esc(r.number)}</span> ${reportType(r.type)}</div>
              <div class="t2">${esc(r.client_name || '—')} · ${esc(r.site_name || '')} · <span class="mono">${esc(r.serial || '')}</span></div>
            </div>
            <div class="end"><span class="muted hide-sm">${esc(fmtDate(r.date))}</span>${reportStatus(r.status)}</div>
          </a>`).join('') : emptyState(t('none'), 'report')}
      </div>
    </section>
  </div>`;
  const ld = view.querySelector('#load-demo');
  if (ld) ld.addEventListener('click', async () => {
    ld.disabled = true;
    await api.resetDemo(); location.hash = '#/'; location.reload();
  });
}
