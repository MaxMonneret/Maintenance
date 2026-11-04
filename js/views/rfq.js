/* Demandes de devis (RFQ) reçues par le formulaire du site – suivi par les responsables */
import { api } from '../api.js';
import { t } from '../i18n.js';
import { state, icon, esc, $, fmtDate, modal, formHTML, readForm, toast, toastError, emptyState, avatar } from '../ui.js';
import { planForm } from './planning.js';

export const RFQ_SERVICES = ['field_service', 'repair', 'spare_parts', 'upgrade', 'inspection', 'training', 'other'];
const STATUS = ['new', 'in_progress', 'quoted', 'won', 'lost'];
const URG = ['normal', 'urgent', 'emergency'];

const badge = s => `<span class="badge rq-${esc(s)}">${esc(t('rq_' + s))}</span>`;
const urgBadge = u => `<span class="badge ru-${esc(u || 'normal')}">${esc(t('ru_' + (u || 'normal')))}</span>`;

async function rfqDetails(q) {
  const machines = await api.machines.list().catch(() => []);
  const match = q.serial && machines.find(m => m.serial.toLowerCase() === q.serial.toLowerCase());
  const kv = (k, v) => v ? `<div><span>${esc(k)}</span><strong>${v}</strong></div>` : '';
  const users = state.users.filter(u => u.active && u.role !== 'technician');
  const body = `
    <div class="kv">
      ${kv(t('rfq_company'), esc(q.company))}
      ${kv(t('contact'), esc(q.contact_name))}
      ${kv(t('email'), q.email ? `<a href="mailto:${esc(q.email)}">${esc(q.email)}</a>` : '')}
      ${kv(t('phone'), q.phone ? `<a href="tel:${esc(q.phone)}">${esc(q.phone)}</a>` : '')}
      ${kv(t('rfq_location'), esc([q.location, q.country].filter(Boolean).join(', ')))}
      ${kv(t('rfq_service'), esc(t('rs2_' + (q.service || 'other'))))}
      ${kv(t('rfq_urgency'), urgBadge(q.urgency))}
      ${kv(t('rfq_desired'), q.desired_date ? esc(fmtDate(q.desired_date)) : '')}
      ${kv(t('manufacturer'), esc(q.manufacturer))}
      ${kv(t('model'), esc(q.model))}
      ${kv(t('serial'), q.serial ? `<span class="mono">${esc(q.serial)}</span>${match ? ` · <a href="#/machines/${match.id}">${esc(t('rfq_in_ib'))}</a>` : ''}` : '')}
      ${kv(t('application'), esc(q.application))}
    </div>
    ${q.description ? `<div style="margin-top:14px"><span class="muted" style="font-size:12.5px;font-weight:550">${esc(t('rfq_description'))}</span>
      <p style="white-space:pre-wrap;margin-top:4px">${esc(q.description)}</p></div>` : ''}
    <hr style="border:0;border-top:1px solid var(--line);margin:14px 0">
    <form onsubmit="return false">${formHTML([
      { name: 'status', label: t('status'), type: 'select', options: STATUS.map(s => [s, t('rq_' + s)]) },
      { name: 'assigned_to', label: t('rfq_assigned'), type: 'select', options: [['', '—'], ...users.map(u => [u.id, u.name])] },
      { name: 'notes', label: t('rfq_notes'), type: 'textarea', full: true, rows: 3 }
    ], { status: q.status, assigned_to: q.assigned_to || '', notes: q.notes || '' })}</form>`;
  const subject = encodeURIComponent(`${q.number} – ${t('rfq_reply_subject')}`);
  return modal({
    title: `${q.number} · ${q.company}`, wide: true, body,
    actions: [
      { label: t('rfq_reply'), onClick: () => { if (q.email) location.href = `mailto:${q.email}?subject=${subject}`; return false; } },
      { label: t('plan_add'), onClick: async () => {
        await planForm({ kind: 'intervention', title: `${t('rs2_' + (q.service || 'other'))} – ${q.company}`, machine_id: match ? match.id : '',
          start_date: q.desired_date || undefined, notes: `${q.number}\n${q.description || ''}` });
        return false;
      } },
      { label: t('cancel') },
      { label: t('save'), kind: 'primary', onClick: async w => { await api.rfq.update(q.id, readForm(w)); toast(t('saved')); return true; } }
    ]
  });
}

export async function renderRfq(view) {
  let filter = 'open';
  view.innerHTML = `
  <div class="page">
    <div class="page-head">
      <div><h1>${esc(t('nav_rfq'))}</h1><p class="sub">${esc(t('rfq_sub'))}</p></div>
      <div class="actions"><a class="btn" href="site/devis.html" target="_blank" rel="noopener">${icon('plus')} ${esc(t('rfq_open_form'))}</a></div>
    </div>
    <div class="toolbar"><div class="seg" id="flt">
      ${[['open', t('rfq_open')], ['all', t('all_f')], ['won', t('rq_won')], ['lost', t('rq_lost')]].map(([k, l]) => `<button data-f="${k}" class="${k === filter ? 'on' : ''}">${esc(l)}</button>`).join('')}
    </div></div>
    <section class="card"><div class="table-wrap" id="list"></div></section>
  </div>`;
  const draw = async () => {
    let rows = [];
    try { rows = await api.rfq.list(); } catch (e) { toastError(e); }
    rows = rows.filter(q => filter === 'all' || (filter === 'open' ? !['won', 'lost'].includes(q.status) : q.status === filter));
    $('#list', view).innerHTML = rows.length ? `<table class="data-table">
      <thead><tr><th>${esc(t('rfq_number'))}</th><th>${esc(t('date'))}</th><th>${esc(t('rfq_company'))}</th><th>${esc(t('machine'))}</th>
        <th>${esc(t('rfq_service'))}</th><th>${esc(t('rfq_urgency'))}</th><th>${esc(t('status'))}</th><th>${esc(t('rfq_assigned'))}</th></tr></thead>
      <tbody>${rows.map(q => `<tr class="click" data-q="${q.id}">
        <td class="mono">${esc(q.number)}</td><td>${esc(fmtDate((q.created_at || '').slice(0, 10)))}</td>
        <td><strong style="font-weight:600">${esc(q.company)}</strong><div class="muted" style="font-size:12.5px">${esc(q.contact_name || '')}</div></td>
        <td>${esc([q.manufacturer, q.model].filter(Boolean).join(' '))}${q.serial ? `<div class="mono muted" style="font-size:12px">${esc(q.serial)}</div>` : ''}</td>
        <td>${esc(t('rs2_' + (q.service || 'other')))}</td><td>${urgBadge(q.urgency)}</td><td>${badge(q.status)}</td>
        <td>${q.assigned_name ? avatar(q.assigned_name) : '—'}</td></tr>`).join('')}</tbody></table>`
      : emptyState(t('none'), 'report');
  };
  $('#flt', view).addEventListener('click', e => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    filter = b.dataset.f; [...b.parentNode.children].forEach(c => c.classList.toggle('on', c === b)); draw();
  });
  $('#list', view).addEventListener('click', async e => {
    const tr = e.target.closest('[data-q]'); if (!tr) return;
    const q = await api.rfq.get(tr.dataset.q);
    if (await rfqDetails(q)) draw();
  });
  await draw();
}
