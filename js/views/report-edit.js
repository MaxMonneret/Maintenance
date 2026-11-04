/* Module 2 – Création et édition d'un rapport d'intervention (sections modulaires) */
import { api, LOCAL } from '../api.js';
import { t, standardSections, standardTitles, newSection, sectionNumbers, tableCols, isTableKind } from '../i18n.js';
import {
  state, icon, esc, $, $$, fmtDate, todayISO, reportStatus, machineStatus, modal, confirmBox, toast, toastError,
  resizeImage, debounce, isManager, countryFlag, avatar, fmtHours
} from '../ui.js';
import { machineForm } from './installed.js';
import { autoSummary } from '../summary.js';

const TYPES = ['preventive', 'curative', 'commissioning', 'expertise'];
const KINDS = [['text', 'text', 'sk_text'], ['measures', 'table', 'sk_measures'], ['parts', 'box', 'sk_parts']];
const SUB_KINDS = [['text', 'text', 'sub_text'], ['measures', 'table', 'sub_measures']];
/* Champs de l'en-tête (comme sur les rapports papier « Rapport de visite ou de montage ») */
const HEADER_FIELDS = ['order_no', 'accompanied_by', 'direct_customer', 'end_user', 'installation_type', 'persons_met', 'line_of_business'];
const defaultHeader = m => ({
  order_no: '', accompanied_by: '', line_of_business: '',
  direct_customer: m ? m.client_name || '' : '', end_user: m ? m.client_name || '' : '',
  installation_type: m ? [m.type, m.application].filter(Boolean).join(' – ') : '',
  persons_met: m ? m.site_contact || '' : ''
});

/* ============================================================
 * Sélecteur client → site → machine
 * ============================================================ */
async function machinePicker(container, initialMachineId, onPick) {
  const machines = await api.machines.list();
  const pre = machines.find(m => m.id === Number(initialMachineId));
  let client = pre ? pre.client_id : null, site = pre ? pre.site_id : null, q = '';

  const draw = () => {
    const ql = q.toLowerCase();
    const match = m => !ql || [m.serial, m.model, m.client_name, m.site_name, m.city].join(' ').toLowerCase().includes(ql);
    const clients = [...new Map(machines.filter(match).map(m => [m.client_id, m])).values()]
      .sort((a, b) => a.client_name.localeCompare(b.client_name));
    const sites = [...new Map(machines.filter(m => m.client_id === client && match(m)).map(m => [m.site_id, m])).values()];
    const ms = machines.filter(m => m.site_id === site && match(m));
    container.innerHTML = `
      <div class="toolbar" style="margin-bottom:12px">
        <label class="search">${icon('search')}<input type="search" data-q value="${esc(q)}" placeholder="${esc(t('search'))} (${esc(t('serial'))}…)"></label>
        <button class="btn" data-new-machine>${icon('plus')} ${esc(t('add_machine'))}</button>
      </div>
      <div class="picker">
        <div class="picker-col"><span>1 · ${esc(t('client'))}</span><div class="pick-list">
          ${clients.map(c => `<button data-client="${c.client_id}" class="${c.client_id === client ? 'on' : ''}">${esc(c.client_name)}</button>`).join('') || `<div class="empty">—${LOCAL && !machines.length ? `<br><a href="#/">${esc(t('demo_load'))}</a>` : ''}</div>`}
        </div></div>
        <div class="picker-col"><span>2 · ${esc(t('site'))}</span><div class="pick-list">
          ${client ? sites.map(s => `<button data-site="${s.site_id}" class="${s.site_id === site ? 'on' : ''}">${esc(s.site_name)}<small>${esc(s.city || '')} ${countryFlag(s.site_country)}</small></button>`).join('') || `<div class="empty">—</div>` : `<div class="empty">${esc(t('choose_client'))}</div>`}
        </div></div>
        <div class="picker-col"><span>3 · ${esc(t('machine'))}</span><div class="pick-list">
          ${site ? ms.map(m => `<button data-machine="${m.id}" class="${pre && pre.id === m.id ? 'on' : ''}"><span class="mono">${esc(m.serial)}</span><small>${esc([m.model, m.type].filter(Boolean).join(' · '))}</small></button>`).join('') || `<div class="empty">${esc(t('no_machine'))}</div>` : `<div class="empty">${esc(t('choose_site'))}</div>`}
        </div></div>
      </div>`;
    const qi = $('[data-q]', container);
    qi.addEventListener('input', debounce(e => {
      q = e.target.value;
      // Recherche directe par n° de série : sélection automatique du client et du site
      const hits = machines.filter(match);
      if (q && hits.length && new Set(hits.map(h => h.site_id)).size === 1) { client = hits[0].client_id; site = hits[0].site_id; }
      draw();
      const n = $('[data-q]', container); n.focus(); n.setSelectionRange(n.value.length, n.value.length);
    }, 150));
  };
  container.addEventListener('click', async e => {
    let b;
    if ((b = e.target.closest('[data-client]'))) { client = Number(b.dataset.client); site = null; draw(); }
    else if ((b = e.target.closest('[data-site]'))) { site = Number(b.dataset.site); draw(); }
    else if ((b = e.target.closest('[data-machine]'))) onPick(machines.find(m => m.id === Number(b.dataset.machine)));
    else if (e.target.closest('[data-new-machine]')) {
      const m = await machineForm({}, site);
      if (m) {
        const full = await api.machines.get(m.id);
        machines.push({ ...full, site_country: full.site_country });
        onPick(full);
      }
    }
  });
  draw();
}

/* ============================================================
 * Nouveau rapport : choix de la machine, du type et du modèle
 * ============================================================ */
async function renderNew(view) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  let machine = null;
  if (params.get('machine')) { try { machine = await api.machines.get(params.get('machine')); } catch {} }
  let type = 'curative';
  let plan = null;   // mission du planning à l'origine du rapport
  if (params.get('plan')) { try { plan = await api.planning.get(params.get('plan')); } catch {} }

  view.innerHTML = `
  <div class="page">
    <a class="crumb" href="#/reports">${icon('left')} ${esc(t('reports'))}</a>
    <div class="page-head"><div><h1>${esc(t('new_report'))}</h1></div></div>
    <div class="stack">
      <section class="card">
        <div class="card-head"><h2>1 · ${esc(t('step_machine'))}</h2><span id="chosen-badge"></span></div>
        <div class="card-pad" id="machine-zone"></div>
      </section>
      <section class="card card-pad stack">
        <h2>2 · ${esc(t('intervention'))}</h2>
        <div class="form-grid">
          <label class="field"><span>${esc(t('date'))}</span><input type="date" id="date" value="${esc(plan ? plan.start_date : todayISO())}"></label>
          <label class="field"><span>${esc(t('order_no'))}</span><input type="text" id="order_no"></label>
          <label class="field full"><span>${esc(t('purpose'))}</span><input type="text" id="title" placeholder="${esc(t('purpose'))}" value="${esc(plan ? plan.title || '' : '')}"></label>
        </div>
        <div class="field"><span>${esc(t('type'))}</span>
          <div class="chips" id="types">${TYPES.map(x => `<button class="chip ${x === type ? 'on' : ''}" data-type="${x}">${esc(t('rt_' + x))}</button>`).join('')}</div>
        </div>
        <div class="field"><span>${esc(t('std_template'))}</span>
          <p class="muted" style="font-size:13px">${esc(t('template_hint_std'))}</p>
          <div class="row" id="tpl-preview" style="margin-top:4px"></div>
        </div>
        <div class="row" style="justify-content:flex-end">
          <button class="btn primary lg" id="create" disabled>${icon('check')} ${esc(t('new_report'))}</button>
        </div>
      </section>
    </div>
  </div>`;

  const zone = $('#machine-zone', view);
  const showChosen = () => {
    if (!machine) { $('#create', view).disabled = true; return machinePicker(zone, null, m => { machine = m; showChosen(); }); }
    $('#create', view).disabled = false;
    zone.innerHTML = `
      <div class="row" style="gap:14px">
        <span class="thumb-ic">${icon('machine')}</span>
        <div style="flex:1;min-width:0">
          <div class="row" style="gap:8px"><strong class="mono">${esc(machine.serial)}</strong>${machineStatus(machine.status)}</div>
          <div class="muted" style="font-size:13.5px">${esc(machine.client_name)} · ${esc(machine.site_name)} · ${esc([machine.model, machine.type].filter(Boolean).join(' · '))}</div>
        </div>
        <button class="btn sm" id="change">${esc(t('change'))}</button>
      </div>`;
    $('#change', zone).onclick = () => { const keep = machine; machine = null; showChosen(); machinePicker(zone, keep.id, m => { machine = m; showChosen(); }); };
  };
  showChosen();

  $('#tpl-preview', view).innerHTML = standardTitles().map((x, i) => `<span class="tag">${i + 1}. ${esc(x)}</span>`).join('');
  $('#types', view).addEventListener('click', e => {
    const b = e.target.closest('[data-type]'); if (!b) return;
    type = b.dataset.type;
    $$('[data-type]', view).forEach(c => c.classList.toggle('on', c === b));
  });
  $('#create', view).addEventListener('click', async e => {
    e.target.disabled = true;
    try {
      const r = await api.reports.create({
        machine_id: machine.id, type, date: $('#date', view).value, title: $('#title', view).value.trim(),
        technicians: [state.user.id], sections: standardSections(machine),
        header: { ...defaultHeader(machine), order_no: $('#order_no', view).value.trim() },
        ...(plan ? { end_date: plan.end_date !== plan.start_date ? plan.end_date : '' } : {})
      });
      if (plan) await api.planning.update(plan.id, { report_id: r.id }).catch(() => {});
      location.replace('#/reports/' + r.id);
    } catch (err) { toastError(err); e.target.disabled = false; }
  });
}

/* ============================================================
 * Pavé de signature
 * ============================================================ */
function signaturePad(wrap, onEnd) {
  const canvas = $('canvas', wrap);
  const ph = $('.ph', wrap);
  const ctx = canvas.getContext('2d');
  let drawing = false, last = null, dirty = false;
  const fit = () => {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#10201c';
  };
  fit();
  const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  canvas.addEventListener('pointerdown', e => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); ph.style.display = 'none'; });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p; dirty = true;
  });
  const end = () => { if (drawing && dirty) onEnd(); drawing = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  return {
    clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; ph.style.display = ''; },
    isEmpty: () => !dirty,
    toDataURL() {
      // Export sur fond blanc pour le PDF
      const out = document.createElement('canvas');
      out.width = canvas.width; out.height = canvas.height;
      const o = out.getContext('2d'); o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height); o.drawImage(canvas, 0, 0);
      return out.toDataURL('image/png');
    }
  };
}

/* ============================================================
 * Éditeur
 * ============================================================ */
export async function renderReportEditor(view, id) {
  if (!id) return renderNew(view);
  const r = await api.reports.full(id);
  const photos = new Map(r.photos.map(p => [p.id, p]));
  const ro = !r.can_edit;
  r.header = { ...defaultHeader(null), ...(r.header || {}) };
  const structured = r.sections.some(s => s.key);   // rapport créé avec la trame standard
  // Trame enrichie depuis la création du rapport : on ajoute les chapitres manquants (ex. 12. Déroulement, 13. Annexes)
  if (structured && !ro) {
    const missing = standardSections(null).filter(x => x.key && !r.sections.some(y => y.key === x.key));
    if (missing.length) { r.sections.push(...missing); setTimeout(() => save(), 0); }
  }
  const dis = ro ? 'disabled' : '';
  let saveTimer = null, saving = false, pending = false;

  const setSaveState = (txt, busy) => {
    const el = $('#save-state', view); if (!el) return;
    el.classList.toggle('busy', !!busy);
    $('span:last-child', el).textContent = txt;
  };
  let pendingExtra = {};
  const waitIdle = () => new Promise(res => { const tick = () => (saving || pending) ? setTimeout(tick, 80) : res(); tick(); });
  const save = async (extra = {}) => {
    if (ro) return;
    if (saving) { pending = true; Object.assign(pendingExtra, extra); return waitIdle(); }
    saving = true; setSaveState(t('saving'), true);
    try {
      await api.reports.update(r.id, {
        title: r.title || '', date: r.date, end_date: r.end_date || '', type: r.type, machine_id: r.machine_id,
        technicians: r.technicians, sections: r.sections, header: r.header, signer_name: r.signer_name || '',
        signature: r.signature || '', signed_at: r.signed_at || '', ...extra
      });
      setSaveState(t('saved') + ' · ' + new Date().toLocaleTimeString().slice(0, 5));
    } catch (e) { toastError(e); setSaveState(t('error')); }
    saving = false;
    if (pending) { pending = false; const ex = pendingExtra; pendingExtra = {}; await save(ex); }
  };
  const queueSave = () => { clearTimeout(saveTimer); setSaveState(t('saving'), true); saveTimer = setTimeout(save, 700); };

  /* ---------- Gabarit de page ---------- */
  view.innerHTML = `
  <div class="page">
    <a class="crumb" href="#/reports">${icon('left')} ${esc(t('reports'))}</a>
    <div class="page-head">
      <div>
        <div class="row"><h1 class="mono">${esc(r.number)}</h1>${reportStatus(r.status)}</div>
        <p class="sub">${esc(r.client_name || '')} · ${esc(r.site_name || '')}</p>
      </div>
      <div class="actions">
        <a class="btn" href="#/reports/${r.id}/print">${icon('pdf')} ${esc(t('preview_pdf'))}</a>
      </div>
    </div>
    ${ro ? `<div class="card card-pad" style="margin-bottom:16px;border-color:${r.status === 'validated' ? 'var(--ok);background:var(--ok-soft)' : 'var(--line);background:var(--surface-2)'}">${esc(t(r.status === 'validated' ? 'report_locked' : 'report_readonly'))}</div>` : ''}
    <div class="editor">
      <div class="stack" id="main-col">
        <section class="card" id="machine-card"></section>
        <section class="card card-pad stack">
          <div class="form-grid">
            <label class="field full"><span>${esc(t('purpose'))}</span><input type="text" id="f-title" value="${esc(r.title || '')}" ${dis}></label>
            <label class="field"><span>${esc(t('date'))}</span><input type="date" id="f-date" value="${esc(r.date)}" ${dis}></label>
            <label class="field"><span>${esc(t('end_date'))}</span><input type="date" id="f-end" value="${esc(r.end_date || '')}" ${dis}></label>
            <label class="field"><span>${esc(t('type'))}</span><select id="f-type" ${dis}>${TYPES.map(x => `<option value="${x}" ${x === r.type ? 'selected' : ''}>${esc(t('rt_' + x))}</option>`).join('')}</select></label>
            <div class="field"><span>${esc(t('prepared_by'))}</span><div class="chips" id="techs"></div></div>
          </div>
        </section>
        <section class="card card-pad stack">
          <h2>${esc(t('report_header'))}</h2>
          <div class="form-grid" id="header-fields">
            ${HEADER_FIELDS.map(k => `<label class="field"><span>${esc(t(k))}</span><input type="text" data-h="${k}" value="${esc(r.header[k] || '')}" ${dis}></label>`).join('')}
          </div>
        </section>
        ${!ro && structured ? `<section class="card card-pad stack site-note" id="site-note"></section>` : ''}
        <div class="row" style="justify-content:space-between;margin-top:6px"><h2>${esc(t('sections'))}</h2></div>
        <div class="stack" id="sections"></div>
        ${ro || structured ? '' : `<div class="add-section"><span>${esc(t('add_section'))} :</span>
          ${KINDS.map(([k, ic, lab]) => `<button class="btn sm" data-add-kind="${k}">${icon(ic)} ${esc(t(lab))}</button>`).join('')}</div>`}
        ${structured ? `
        <section class="card card-pad stack summary-card">
          <div class="row" style="justify-content:space-between">
            <h2>${icon('sparkle')} ${esc(t('summary_title'))}</h2>
            ${ro ? '' : `<button class="btn sm" id="gen-sum">${icon('sparkle')} ${esc(t('summary_generate'))}</button>`}
          </div>
          <p class="muted" style="font-size:13px">${esc(t('summary_hint'))}</p>
          <textarea id="f-summary" rows="6" ${dis} placeholder="${esc(t('summary_ph'))}">${esc(r.header.summary || '')}</textarea>
        </section>` : ''}
        <section class="card card-pad stack" id="sign-card"></section>
      </div>
      <aside class="editor-side">
        <section class="card card-pad stack">
          <div class="row" style="justify-content:space-between"><h3>${esc(t('status'))}</h3>${reportStatus(r.status)}</div>
          ${ro ? '' : `<div class="save-state" id="save-state"><span class="dot"></span><span>${esc(t('autosave'))}</span></div>`}
          <div class="stack" style="gap:8px" id="status-actions"></div>
        </section>
        <section class="card">
          <div class="card-head"><h3>${esc(t('hours_linked'))}</h3><button class="icon-btn" id="add-hours" title="${esc(t('new_entry'))}">${icon('plus')}</button></div>
          <div class="list" id="hours"></div>
        </section>
      </aside>
    </div>
  </div>`;

  /* ---------- Machine ---------- */
  const drawMachine = () => {
    const mc = $('#machine-card', view);
    mc.innerHTML = r.machine_id ? `
      <div class="machine-chosen">
        <span class="thumb-ic">${icon('machine')}</span>
        <div style="flex:1;min-width:0">
          <div class="row" style="gap:8px"><a class="mono" style="font-weight:650" href="#/machines/${r.machine_id}">${esc(r.serial)}</a><span class="muted">${esc([r.model, r.machine_type].filter(Boolean).join(' · '))}</span></div>
          <div class="muted" style="font-size:13.5px">${esc(r.client_name)} · ${esc(r.site_name)}${r.city ? ', ' + esc(r.city) : ''} ${countryFlag(r.site_country)}</div>
        </div>
        ${ro ? '' : `<button class="btn sm" id="change-machine">${esc(t('change'))}</button>`}
      </div>` : `<div class="card-pad" id="pick-zone"></div>`;
    const ch = $('#change-machine', mc);
    if (ch) ch.onclick = () => { mc.innerHTML = '<div class="card-pad" id="pick-zone"></div>'; pick(); };
    if (!r.machine_id) pick();
  };
  const pick = () => machinePicker($('#pick-zone', view), r.machine_id, async m => {
    const full = await api.machines.get(m.id);
    Object.assign(r, { machine_id: full.id, serial: full.serial, model: full.model, machine_type: full.type,
      client_name: full.client_name, site_name: full.site_name, city: full.city, site_country: full.site_country });
    drawMachine(); save();
  });
  drawMachine();

  /* ---------- Informations générales ---------- */
  const bind = (sel, key) => $(sel, view).addEventListener('input', e => { r[key] = e.target.value; queueSave(); });
  if (!ro) { bind('#f-title', 'title'); bind('#f-date', 'date'); bind('#f-end', 'end_date'); bind('#f-type', 'type'); }
  const fSum = $('#f-summary', view);
  if (fSum && !ro) {
    fSum.addEventListener('input', () => { r.header.summary = fSum.value; queueSave(); });
    $('#gen-sum', view).addEventListener('click', async () => {
      if (fSum.value.trim() && !(await confirmBox(t('summary_replace'), t('summary_generate')))) return;
      fSum.value = autoSummary(r);
      fSum.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  $('#header-fields', view).addEventListener('input', e => {
    const k = e.target.dataset.h; if (!k || ro) return;
    r.header[k] = e.target.value; queueSave();
  });
  const drawTechs = () => {
    const techs = state.users.filter(u => u.active || r.technicians.includes(u.id));
    $('#techs', view).innerHTML = techs.map(u =>
      `<button class="chip ${r.technicians.includes(u.id) ? 'on' : ''}" data-tech="${u.id}" ${dis}>${esc(u.name)}</button>`).join('');
  };
  drawTechs();
  $('#techs', view).addEventListener('click', e => {
    const b = e.target.closest('[data-tech]'); if (!b || ro) return;
    const uid = Number(b.dataset.tech);
    r.technicians = r.technicians.includes(uid) ? r.technicians.filter(x => x !== uid) : [...r.technicians, uid];
    drawTechs(); queueSave();
  });

  /* ---------- Sections ---------- */
  /* Une section principale de la trame (clé fixe) ne peut être ni renommée, ni déplacée, ni supprimée.
     Les sous-sections (5.1, 6.2…) se déplacent uniquement à l'intérieur de leur section. */
  const isSub = s => s.level === 2;
  const canUp = i => structured ? isSub(r.sections[i]) && i > 0 && isSub(r.sections[i - 1]) : i > 0;
  const canDown = i => structured ? isSub(r.sections[i]) && i < r.sections.length - 1 && isSub(r.sections[i + 1]) : i < r.sections.length - 1;
  const lastOfGroup = i => !r.sections[i + 1] || !isSub(r.sections[i + 1]);
  const groupHead = i => { let j = i; while (j > 0 && isSub(r.sections[j])) j--; return r.sections[j]; };

  const drawSections = () => {
    const box = $('#sections', view);
    const nums = sectionNumbers(r.sections);
    box.innerHTML = r.sections.map((s, i) => {
      const locked = !!s.key;
      const cols = tableCols(s.kind);
      const head = groupHead(i);
      return `
      <section class="card section-card ${isSub(s) ? 'sub' : ''} ${locked ? 'locked' : ''}" data-sec="${s.id}">
        <div class="section-head">
          <span class="num">${nums[i]}</span>
          <input type="text" value="${esc(s.title)}" data-f="title" placeholder="${esc(t('section_title'))}" ${dis} ${locked ? `readonly title="${esc(t('fixed_section'))}"` : ''}>
          ${ro || locked ? '' : `
          <button class="icon-btn" data-act="up" title="${esc(t('move_up'))}" ${canUp(i) ? '' : 'disabled'}>${icon('up')}</button>
          <button class="icon-btn" data-act="down" title="${esc(t('move_down'))}" ${canDown(i) ? '' : 'disabled'}>${icon('down')}</button>
          <button class="icon-btn danger" data-act="remove" title="${esc(t('remove'))}">${icon('trash')}</button>`}
        </div>
        <div class="section-body">
          ${isTableKind(s.kind) ? `
            <div class="table-scroll"><table class="grid-table k-${esc(s.kind)}"><thead><tr>${cols.map(h => `<th>${esc(h)}</th>`).join('')}<th></th></tr></thead>
              <tbody>${(s.rows || []).map((row, ri) => `<tr data-row="${ri}">
                ${cols.map((_, ci) => `<td><input type="text" data-cell="${ci}" value="${esc(row[ci] || '')}" ${dis}></td>`).join('')}
                <td class="act">${ro ? '' : `<button class="icon-btn danger" data-act="del-row">${icon('x')}</button>`}</td></tr>`).join('')}
              </tbody></table></div>
            ${ro ? '' : `<div><button class="btn sm ghost" data-act="add-row">${icon('plus')} ${esc(t('add_row'))}</button></div>`}
            <textarea data-f="text" rows="2" placeholder="${esc(t('notes'))}" style="min-height:60px" ${dis}>${esc(s.text || '')}</textarea>`
          : `<textarea data-f="text" placeholder="${esc(t('section_text'))}" ${dis}>${esc(s.text || '')}</textarea>`}
          <div class="photos">
            ${(s.photos || []).filter(pid => photos.has(pid)).map(pid => {
              const p = photos.get(pid);
              return `<figure class="photo" data-photo="${pid}" style="margin:0">
                <img src="${esc(p.url || '/uploads/' + p.filename)}" alt="" loading="lazy">
                ${ro ? '' : `<button class="icon-btn rm" data-act="del-photo" title="${esc(t('remove'))}">${icon('x')}</button>`}
                <input type="text" data-caption value="${esc(p.caption || '')}" placeholder="${esc(t('caption'))}" ${dis}>
              </figure>`;
            }).join('')}
            ${ro ? '' : `<label class="add-photo">${icon('camera')}<span>${esc(t('take_photo'))}</span>
              <input type="file" accept="image/*" multiple hidden data-upload></label>`}
          </div>
        </div>
      </section>
      ${structured && !ro && lastOfGroup(i) && head.key && !isTableKind(head.kind) ? `
      <div class="add-sub" data-after="${s.id}"><span>${esc(t('add_sub'))} ${nums[i].split('.')[0]}.x :</span>
        ${SUB_KINDS.map(([k, ic, lab]) => `<button class="btn sm ghost" data-add-sub="${k}">${icon(ic)} ${esc(t(lab))}</button>`).join('')}</div>` : ''}`;
    }).join('');
  };
  drawSections();

  const secOf = el => { const c = el.closest('[data-sec]'); return c && r.sections.find(s => s.id === c.dataset.sec); };
  const box = $('#sections', view);
  box.addEventListener('input', e => {
    const s = secOf(e.target); if (!s || ro) return;
    if (e.target.dataset.f) { s[e.target.dataset.f] = e.target.value; queueSave(); }
    else if (e.target.dataset.cell !== undefined) {
      const ri = Number(e.target.closest('[data-row]').dataset.row);
      s.rows[ri][Number(e.target.dataset.cell)] = e.target.value; queueSave();
    } else if (e.target.hasAttribute('data-caption')) {
      const pid = Number(e.target.closest('[data-photo]').dataset.photo);
      photos.get(pid).caption = e.target.value;
      captionSave(pid, e.target.value);
    }
  });
  const captionSave = debounce((pid, caption) => api.photos.update(pid, { caption }).catch(toastError), 600);
  box.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b || ro) return;
    const s = secOf(b); const i = r.sections.indexOf(s);
    switch (b.dataset.act) {
      case 'up': if (i > 0) [r.sections[i - 1], r.sections[i]] = [r.sections[i], r.sections[i - 1]]; break;
      case 'down': if (i < r.sections.length - 1) [r.sections[i + 1], r.sections[i]] = [r.sections[i], r.sections[i + 1]]; break;
      case 'remove':
        if (!(await confirmBox(`${t('remove')} « ${s.title || '…'} » ?`, t('remove')))) return;
        r.sections.splice(i, 1); break;
      case 'add-row': s.rows.push(Array(tableCols(s.kind).length).fill('')); break;
      case 'del-row': s.rows.splice(Number(b.closest('[data-row]').dataset.row), 1); if (!s.rows.length) s.rows.push(Array(tableCols(s.kind).length).fill('')); break;
      case 'del-photo': {
        const pid = Number(b.closest('[data-photo]').dataset.photo);
        s.photos = s.photos.filter(x => x !== pid);
        api.photos.remove(pid).catch(toastError);
        break;
      }
      default: return;
    }
    drawSections(); save();
  });
  box.addEventListener('click', e => {
    const img = e.target.closest('.photo img'); if (!img) return;
    const lb = document.createElement('div'); lb.className = 'lightbox';
    lb.innerHTML = `<img src="${img.src}" alt="">`; lb.onclick = () => lb.remove(); document.body.appendChild(lb);
  });
  box.addEventListener('change', async e => {
    if (!e.target.matches('[data-upload]')) return;
    const s = secOf(e.target); const label = e.target.closest('.add-photo');
    label.classList.add('busy');
    try {
      for (const file of e.target.files) {
        const data = await resizeImage(file);
        const p = await api.photos.upload(data, r.id, '');
        photos.set(p.id, p);
        s.photos = [...(s.photos || []), p.id];
      }
      await save();
    } catch (err) { toastError(err); }
    drawSections();
  });
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-add-sub]'); if (!b || ro) return;
    const after = b.closest('[data-after]').dataset.after;
    const kind = b.dataset.addSub;
    const sub = newSection(kind, kind === 'measures' ? t('sub_measures') : '');
    sub.level = 2;
    r.sections.splice(r.sections.findIndex(x => x.id === after) + 1, 0, sub);
    drawSections(); save();
    const el = $(`[data-sec="${sub.id}"]`, view);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('input[data-f=title]', el).focus();
  });
  $('.page', view).addEventListener('click', e => {
    const b = e.target.closest('[data-add-kind]'); if (!b) return;
    const kind = b.dataset.addKind;
    const lab = KINDS.find(k => k[0] === kind)[2];
    r.sections.push(newSection(kind, kind === 'text' ? '' : t(lab)));
    drawSections(); save();
    const last = $$('[data-sec]', view).pop();
    last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('input[data-f=title]', last).focus();
  });

  /* ---------- Sur site : note du jour + photos → alimente le brouillon ----------
     Chaque note ajoute une ligne au journal (section « Déroulement de l'intervention »).
     Si une section est choisie, le texte y est aussi ajouté (daté) et les photos y sont rangées. */
  const drawNote = () => {
    const c = $('#site-note', view); if (!c) return;
    const nums = sectionNumbers(r.sections);
    const opts = r.sections.map((s, i) => ({ s, n: nums[i] }))
      .filter(({ s }) => !['log', 'equipment', 'parts'].includes(s.key) && !isTableKind(s.kind) || s.kind === 'measures');
    c.innerHTML = `
      <div class="row" style="justify-content:space-between"><h2>${icon('camera')} ${esc(t('site_note'))}</h2>
        <span class="muted" style="font-size:13px">${esc(t('site_note_hint'))}</span></div>
      <div class="form-grid">
        <label class="field"><span>${esc(t('date'))}</span><input type="date" id="n-date" value="${todayISO()}"></label>
        <label class="field"><span>${esc(t('jr_hazard'))}</span><input type="text" id="n-haz" inputmode="decimal" placeholder="0"></label>
        <label class="field full"><span>${esc(t('note_target'))}</span><select id="n-sec">
          <option value="">${esc(t('note_journal_only'))}</option>
          ${opts.map(({ s, n }) => `<option value="${s.id}">${esc(n)}. ${esc(s.title || '…')}</option>`).join('')}
        </select></label>
        <label class="field full"><span>${esc(t('note_text'))}</span><textarea id="n-text" rows="3" placeholder="${esc(t('note_ph'))}"></textarea></label>
      </div>
      <div class="photos" id="n-photos"></div>
      <div class="row" style="justify-content:space-between">
        <label class="btn">${icon('camera')} ${esc(t('take_photo'))}<input type="file" accept="image/*" capture="environment" multiple hidden id="n-file"></label>
        <button class="btn primary" id="n-add">${icon('plus')} ${esc(t('note_add'))}</button>
      </div>`;
    let pending = [];
    const drawPending = () => {
      $('#n-photos', c).innerHTML = pending.map((p, i) => `<figure class="photo" style="margin:0"><img src="${esc(p.url || '/uploads/' + p.filename)}" alt="">
        <button class="icon-btn rm" data-np="${i}">${icon('x')}</button></figure>`).join('');
    };
    $('#n-photos', c).addEventListener('click', e => {
      const b = e.target.closest('[data-np]'); if (!b) return;
      const [p] = pending.splice(Number(b.dataset.np), 1); api.photos.remove(p.id).catch(toastError); drawPending();
    });
    $('#n-file', c).addEventListener('change', async e => {
      const lab = e.target.closest('label'); lab.classList.add('busy');
      try {
        for (const file of e.target.files) {
          const p = await api.photos.upload(await resizeImage(file), r.id, '');
          photos.set(p.id, p); pending.push(p);
        }
      } catch (err) { toastError(err); }
      lab.classList.remove('busy'); e.target.value = ''; drawPending();
    });
    $('#n-add', c).addEventListener('click', async () => {
      const date = $('#n-date', c).value || todayISO();
      const text = $('#n-text', c).value.trim();
      const haz = $('#n-haz', c).value.trim();
      const target = r.sections.find(s => s.id === $('#n-sec', c).value);
      if (!text && !pending.length) return toastError(t('note_empty'));
      const d = fmtDate(date, { day: '2-digit', month: '2-digit', year: 'numeric' });
      const log = r.sections.find(s => s.key === 'log');
      if (log && (text || haz)) {
        log.rows = (log.rows || []).filter(x => x.some(v => v));
        log.rows.push([d, text + (target ? ` (→ ${target.title})` : ''), haz]);
        log.rows.sort((a, b) => a[0].split('/').reverse().join('').localeCompare(b[0].split('/').reverse().join('')));
      }
      const dest = target || r.sections.find(s => s.key === 'appendix') || log || r.sections[r.sections.length - 1];
      if (target && text) target.text = (target.text ? target.text.replace(/\s+$/, '') + '\n' : '') + `${d} : ${text}`;
      if (pending.length) {
        dest.photos = [...(dest.photos || []), ...pending.map(p => p.id)];
        if (text) for (const p of pending) { p.caption = `${d} – ${text.slice(0, 80)}`; api.photos.update(p.id, { caption: p.caption }).catch(toastError); }
      }
      pending = [];
      await save();
      drawSections(); drawNote();
      toast(t('note_added'));
    });
  };
  drawNote();

  /* ---------- Signature ---------- */
  const drawSign = () => {
    const c = $('#sign-card', view);
    if (r.signature) {
      c.innerHTML = `
        <div class="row" style="justify-content:space-between"><h2>${icon('signature')} ${esc(t('signature'))}</h2>
          ${ro ? '' : `<button class="btn sm" id="sig-clear">${esc(t('clear'))}</button>`}</div>
        <div class="row" style="gap:20px;align-items:flex-end">
          <img class="sig-img" src="${r.signature}" alt="">
          <div><strong>${esc(r.signer_name || '')}</strong><div class="muted" style="font-size:13px">${esc(t('signed_on'))} ${esc(fmtDate((r.signed_at || '').slice(0, 10)))}</div></div>
        </div>`;
      const cl = $('#sig-clear', c);
      if (cl) cl.onclick = () => { r.signature = null; r.signed_at = null; save(); drawSign(); };
      return;
    }
    c.innerHTML = `
      <h2>${esc(t('signature'))}</h2>
      ${ro ? `<p class="muted">—</p>` : `
      <label class="field"><span>${esc(t('signer_name'))}</span><input type="text" id="signer" value="${esc(r.signer_name || '')}"></label>
      <div class="sigpad"><canvas></canvas><div class="ph">${esc(t('sign_here'))}</div></div>
      <div class="row" style="justify-content:flex-end"><button class="btn sm ghost" id="sig-reset">${esc(t('clear'))}</button>
        <button class="btn sm primary" id="sig-ok">${icon('check')} ${esc(t('save'))}</button></div>`}`;
    if (ro) return;
    const pad = signaturePad($('.sigpad', c), () => {});
    $('#signer', c).addEventListener('input', e => { r.signer_name = e.target.value; queueSave(); });
    $('#sig-reset', c).onclick = () => pad.clear();
    $('#sig-ok', c).onclick = async () => {
      if (pad.isEmpty()) return toastError(t('sign_here'));
      r.signature = pad.toDataURL(); r.signed_at = new Date().toISOString();
      clearTimeout(saveTimer);
      await save();
      drawSign();
    };
  };
  drawSign();

  /* ---------- Statut ---------- */
  const setStatus = async status => {
    clearTimeout(saveTimer);
    await save({ status });
    toast(t('rs_' + status));
    renderReportEditor(view, id);
  };
  const sa = $('#status-actions', view);
  const actions = [];
  if (r.status === 'draft' && !ro) actions.push(`<button class="btn primary" data-status="done">${icon('check')} ${esc(t('mark_done'))}</button>`);
  if (r.status === 'done' && isManager()) actions.push(`<button class="btn primary" data-status="validated">${icon('check')} ${esc(t('validate'))}</button>`);
  if (r.status !== 'draft' && (isManager() || (r.status === 'done' && !ro))) actions.push(`<button class="btn" data-status="draft">${esc(t('reopen'))}</button>`);
  actions.push(`<a class="btn" href="#/reports/${r.id}/print">${icon('pdf')} ${esc(t('preview_pdf'))}</a>`);
  if (r.status === 'draft' && !ro) actions.push(`<button class="btn ghost" id="del" style="color:var(--danger)">${icon('trash')} ${esc(t('delete'))}</button>`);
  sa.innerHTML = actions.join('');
  sa.addEventListener('click', async e => {
    const b = e.target.closest('[data-status]');
    if (b) {
      if (b.dataset.status === 'draft' && r.status === 'validated') {
        // un responsable rouvre un rapport validé : on repasse par l'API directement
        await api.reports.update(r.id, { status: 'draft' }); toast(t('rs_draft')); return renderReportEditor(view, id);
      }
      return setStatus(b.dataset.status);
    }
    if (e.target.closest('#del')) {
      if (!(await confirmBox(t('confirm_delete_report')))) return;
      await api.reports.remove(r.id); toast(t('saved')); location.hash = '#/reports';
    }
  });

  /* ---------- Heures rattachées ---------- */
  const drawHours = () => {
    const total = r.hours.reduce((a, h) => a + h.hours, 0);
    $('#hours', view).innerHTML = r.hours.length ? r.hours.map(h => `
      <div class="list-item" style="cursor:default">${avatar(h.user_name)}
        <div class="main-col"><div class="t1" style="font-weight:550">${esc(fmtDate(h.date))} · ${esc(t('hk_' + h.kind))}</div>
        <div class="t2">${esc(h.user_name)}</div></div><strong>${esc(fmtHours(h.hours))}</strong></div>`).join('') +
      `<div class="list-item" style="cursor:default"><div class="main-col"><strong>${esc(t('total'))}</strong></div><strong>${esc(fmtHours(total))}</strong></div>`
      : `<div class="list-item muted" style="cursor:default">${esc(t('none'))}</div>`;
  };
  drawHours();
  $('#add-hours', view).addEventListener('click', async () => {
    const { hoursForm } = await import('./hours.js');
    const res = await hoursForm({ date: r.date, report_id: r.id, kind: 'site' });
    if (res) { r.hours = (await api.reports.full(r.id)).hours; drawHours(); }
  });

  // « Aperçu / PDF » : termine l'enregistrement en cours avant d'ouvrir l'aperçu,
  // sinon les dernières lignes saisies (ou dictées) n'apparaissent pas dans le PDF
  view.addEventListener('click', async e => {
    const a = e.target.closest('a[href$="/print"]'); if (!a || ro) return;
    e.preventDefault();
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; await save(); }
    await waitIdle();
    location.hash = a.getAttribute('href');
  });

  // Enregistre avant de quitter la page
  return () => { if (saveTimer) { clearTimeout(saveTimer); save(); } };
}
