/* Planning des techniciens
 * Responsable / administrateur : vue de toute l'équipe, création et modification des missions.
 * Technicien : son planning, « marquer réalisé », création du rapport d'une intervention planifiée. */
import { api } from '../api.js';
import { t, getLang } from '../i18n.js';
import {
  state, icon, esc, $, toISO, fromISO, todayISO, mondayOf, addDays, isoWeek, fmtDate, modal, formHTML, readForm,
  toast, toastError, confirmBox, isManager, avatar, countryFlag
} from '../ui.js';

export const PLAN_KINDS = ['intervention', 'travel', 'training', 'office', 'standby', 'leave'];
const PLAN_STATUS = ['planned', 'confirmed', 'done'];

/* ---------- Formulaire d'une mission (responsables) ---------- */
export async function planForm(entry = {}) {
  const [machines, users] = await Promise.all([api.machines.list(), api.users.list()]);
  const ag = u => (['FR', 'UK', 'US'].includes(u.country) ? u.country : 'FR');
  const techs = users.filter(u => u.active && (u.role === 'technician' || u.id === entry.user_id))
    .sort((x, y) => ag(x).localeCompare(ag(y)) || x.name.localeCompare(y.name));
  const fields = [
    { name: 'user_id', label: t('technician'), type: 'select', required: true, options: techs.map(u => [u.id, `${ag(u)} · ${u.name}`]) },
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
  // Disponibilité des techniciens sur les dates choisies (mise à jour quand les dates changent)
  const onOpen = async w => {
    const sel = w.querySelector('[name=user_id]'), sd = w.querySelector('[name=start_date]'), ed = w.querySelector('[name=end_date]');
    const refresh = async () => {
      const from = sd.value, to = ed.value < sd.value ? sd.value : ed.value; if (!from) return;
      let list = [];
      try { list = await api.planning.list({ from, to }); } catch {}
      for (const o of sel.options) {
        const u = techs.find(x => String(x.id) === o.value); if (!u) continue;
        const hits = list.filter(p => p.user_id === u.id && p.id !== entry.id);
        o.textContent = `${ag(u)} · ${u.name} — ${hits.length ? t('plan_busy') + ' (' + hits.map(p => t('pk_' + p.kind)).join(', ') + ')' : t('plan_free')}`;
      }
    };
    sd.addEventListener('change', () => { if (ed.value < sd.value) ed.value = sd.value; refresh(); });
    ed.addEventListener('change', refresh);
    refresh();
  };
  return modal({ title: entry.id ? t('edit') : t('plan_add'), body: `<form onsubmit="return false">${formHTML(fields, values)}</form>`, actions, wide: true, onOpen });
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
export const AGENCIES = ['FR', 'UK', 'US'];
const agencyOf = u => (AGENCIES.includes(u.country) ? u.country : 'FR');

export async function renderPlanning(view) {
  const manager = isManager();
  let start = mondayOf(new Date());
  let weeks = Number(localStorage.getItem('fs_plan_weeks')) || (manager ? 2 : 1);
  // Agence affichée : celle du responsable par défaut, toutes pour l'administrateur
  let agency = localStorage.getItem('fs_plan_agency') || (state.user.role === 'admin' ? 'all' : agencyOf(state.user));
  let q = '';

  view.innerHTML = `
  <div class="page page-wide">
    <div class="page-head">
      <div><h1>${esc(t('nav_planning'))}</h1><p class="sub">${esc(t(manager ? 'plan_sub_manager' : 'plan_sub_tech'))}</p></div>
      <div class="actions">
        <button class="btn" id="export">${icon('download')} ${esc(t('plan_export'))}</button>
        ${manager ? `<button class="btn primary" id="add">${icon('plus')} ${esc(t('plan_add'))}</button>` : ''}
      </div>
    </div>
    ${manager ? `<div class="plan-kpis" id="kpis"></div>` : ''}
    <div class="toolbar plan-toolbar">
      <div class="week-nav">
        <button class="icon-btn" id="prev" title="${esc(t('prev_week'))}">${icon('left')}</button>
        <span class="week-label" id="wl"></span>
        <button class="icon-btn" id="next" title="${esc(t('next_week'))}">${icon('right')}</button>
        <button class="btn sm" id="today">${esc(t('today'))}</button>
      </div>
      <div class="seg" id="range">${[1, 2, 4].map(n => `<button data-w="${n}" class="${n === weeks ? 'on' : ''}">${esc(t('plan_weeks_' + n))}</button>`).join('')}</div>
      ${manager ? `
      <div class="seg" id="agency">${['all', ...AGENCIES].map(a => `<button data-a="${a}" class="${a === agency ? 'on' : ''}">${a === 'all' ? esc(t('plan_all_agencies')) : `${countryFlag(a)} ${esc(t('agency_' + a))}`}</button>`).join('')}</div>
      <label class="search">${icon('search')}<input type="search" id="q" placeholder="${esc(t('plan_search'))}"></label>` : ''}
    </div>
    <div class="plan-legend">${PLAN_KINDS.map(k => `<span class="pk pk-${k}">${esc(t('pk_' + k))}</span>`).join('')}
      <span class="pk pk-dashed">${esc(t('ps_planned'))}</span></div>
    <div class="card plan-card"><div class="plan-scroll" id="grid"></div></div>
  </div>`;

  const draw = async () => {
    const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i));
    const from = toISO(days[0]), to = toISO(days[days.length - 1]);
    const workdays = days.filter(d => d.getDay() % 6 !== 0);
    $('#wl', view).textContent = `${t('week')} ${isoWeek(days[0])}${weeks > 1 ? '–' + isoWeek(days[days.length - 1]) : ''} · ${fmtDate(from, { day: 'numeric', month: 'short' })} – ${fmtDate(to, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    let entries = [];
    try { entries = await api.planning.list({ from, to }); } catch (e) { toastError(e); }
    const covers = (p, iso) => p.start_date <= iso && p.end_date >= iso;
    const busy = (u, iso) => entries.some(p => p.user_id === u.id && covers(p, iso));

    // Techniciens affichés, groupés par agence
    let people = manager
      ? state.users.filter(u => u.active && (u.role === 'technician' || entries.some(p => p.user_id === u.id)))
      : state.users.filter(u => u.id === state.user.id);
    const ql = q.trim().toLowerCase();
    const groups = (manager ? AGENCIES : [agencyOf(state.user)])
      .filter(a => !manager || agency === 'all' || a === agency)
      .map(a => ({ a, list: people.filter(u => agencyOf(u) === a && (!ql || u.name.toLowerCase().includes(ql))).sort((x, y) => x.name.localeCompare(y.name)) }))
      .filter(g => g.list.length);
    const shown = groups.flatMap(g => g.list);

    // Indicateurs par agence (sur la période affichée, jours ouvrés)
    const stats = a => {
      const list = people.filter(u => agencyOf(u) === a);
      const slots = list.length * workdays.length;
      const booked = list.reduce((n, u) => n + workdays.filter(d => entries.some(p => p.user_id === u.id && p.kind !== 'leave' && covers(p, toISO(d)))).length, 0);
      const leave = list.reduce((n, u) => n + workdays.filter(d => entries.some(p => p.user_id === u.id && p.kind === 'leave' && covers(p, toISO(d)))).length, 0);
      const conflicts = list.reduce((n, u) => n + days.filter(d => entries.filter(p => p.user_id === u.id && p.kind !== 'travel' && covers(p, toISO(d))).length > 1).length, 0);
      const toConfirm = entries.filter(p => p.status === 'planned' && list.some(u => u.id === p.user_id)).length;
      return { n: list.length, rate: slots - leave ? Math.round(100 * booked / (slots - leave)) : 0, free: slots - booked - leave, conflicts, toConfirm };
    };
    const kp = $('#kpis', view);
    if (kp) kp.innerHTML = AGENCIES.map(a => { const s = stats(a); return `
      <button class="card plan-kpi ${agency === a ? 'on' : ''}" data-a="${a}">
        <div class="row" style="justify-content:space-between"><strong>${countryFlag(a)} ${esc(t('agency_' + a))}</strong><span class="muted">${s.n} ${esc(t('plan_techs'))}</span></div>
        <div class="plan-rate"><span style="width:${Math.min(100, s.rate)}%" class="${s.rate > 90 ? 'hot' : s.rate < 50 ? 'low' : ''}"></span></div>
        <div class="plan-kpi-nums">
          <span><b>${s.rate} %</b>${esc(t('plan_occupancy'))}</span>
          <span><b>${s.free}</b>${esc(t('plan_free_days'))}</span>
          <span class="${s.conflicts ? 'warn' : ''}"><b>${s.conflicts}</b>${esc(t('plan_conflicts'))}</span>
          <span><b>${s.toConfirm}</b>${esc(t('plan_to_confirm'))}</span>
        </div>
      </button>`; }).join('');

    const today = todayISO();
    const lang = getLang() === 'en' ? 'en-GB' : 'fr-FR';
    const dayHead = d => {
      const iso = toISO(d), we = d.getDay() === 0 || d.getDay() === 6;
      return `<th class="${we ? 'we' : ''} ${iso === today ? 'today' : ''}"><span>${esc(d.toLocaleDateString(lang, { weekday: weeks > 2 ? 'narrow' : 'short' }))}</span><strong>${d.getDate()}</strong></th>`;
    };
    const cell = (u, d) => {
      const iso = toISO(d), we = d.getDay() === 0 || d.getDay() === 6;
      const list = entries.filter(p => p.user_id === u.id && covers(p, iso));
      const conflict = list.filter(p => p.kind !== 'travel').length > 1;
      return `<td class="${we ? 'we' : ''} ${iso === today ? 'today' : ''} ${conflict ? 'conflict' : ''}" data-u="${u.id}" data-d="${iso}">
        ${list.map(p => {
          const first = p.start_date === iso || iso === from;
          const last = p.end_date === iso || iso === to;
          return `<button class="plan-chip pk-${esc(p.kind)} st-${esc(p.status)} ${first ? 'first' : 'cont'} ${last ? 'last' : ''}" data-p="${p.id}"
            title="${esc((p.title || t('pk_' + p.kind)) + (p.client_name ? ' – ' + p.client_name : '') + ' · ' + fmtDate(p.start_date) + (p.end_date !== p.start_date ? ' → ' + fmtDate(p.end_date) : ''))}">
            ${first ? `<b>${esc(p.title || t('pk_' + p.kind))}</b>${p.client_name ? `<small>${esc(p.client_name)}</small>` : ''}` : '<small>↳</small>'}
            ${p.status === 'done' ? `<i class="done">${icon('check')}</i>` : ''}
          </button>`;
        }).join('')}
        ${conflict ? `<span class="plan-warn" title="${esc(t('plan_conflict'))}">!</span>` : ''}
      </td>`;
    };
    const load = u => workdays.filter(d => entries.some(p => p.user_id === u.id && p.kind !== 'leave' && covers(p, toISO(d)))).length;
    const freeRow = g => `<tr class="plan-free"><th class="who">${esc(t('plan_available'))}</th>${days.map(d => {
      const iso = toISO(d), we = d.getDay() % 6 === 0, n = g.list.filter(u => !busy(u, iso)).length;
      return `<td class="${we ? 'we' : ''} ${iso === today ? 'today' : ''}"><span class="${we ? '' : n === 0 ? 'none' : n <= 2 ? 'few' : 'ok'}">${we ? '' : n}</span></td>`;
    }).join('')}</tr>`;
    const compact = shown.length > 12 || weeks > 2;
    $('#grid', view).innerHTML = `
      <table class="plan-table ${weeks > 2 ? 'dense' : ''} ${compact ? 'compact' : ''}">
        <thead><tr><th class="who">${esc(t('technician'))}</th>${days.map(dayHead).join('')}</tr></thead>
        ${groups.map(g => `<tbody>
          ${manager ? `<tr class="plan-group"><th class="who" colspan="${days.length + 1}">${countryFlag(g.a)} ${esc(t('agency_' + g.a))} <span class="muted">· ${g.list.length} ${esc(t('plan_techs'))}</span></th></tr>` : ''}
          ${g.list.map(u => `<tr>
            <th class="who"><div class="row" style="gap:8px;flex-wrap:nowrap">${avatar(u.name)}<span><strong>${esc(u.name)}</strong>
              <small>${load(u)} / ${workdays.length} ${esc(t('plan_days'))}</small></span></div></th>
            ${days.map(d => cell(u, d)).join('')}</tr>`).join('')}
          ${manager ? freeRow(g) : ''}
        </tbody>`).join('') || `<tbody><tr><td colspan="${days.length + 1}" class="muted" style="padding:20px">${esc(t('plan_none'))}</td></tr></tbody>`}
      </table>`;
    view._entries = entries;
    view._exp = { days, groups, entries, from, to };
  };

  /* ---------- Export : liste des missions, grille (Excel) ou impression ---------- */
  const csvDownload = (rows, name) => {
    const csv = '\ufeff' + rows.map(l => l.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const scope = () => (manager ? (agency === 'all' ? 'toutes-agences' : agency) : state.user.name).replace(/\s+/g, '-');
  const exportList = () => {
    const { groups, entries, from, to } = view._exp;
    const shownIds = new Set(groups.flatMap(g => g.list.map(u => u.id)));
    const ag = id => { const u = state.users.find(x => x.id === id) || {}; return ['FR', 'UK', 'US'].includes(u.country) ? u.country : 'FR'; };
    const nbDays = p => Math.round((fromISO(p.end_date) - fromISO(p.start_date)) / 864e5) + 1;
    const rows = entries.filter(p => shownIds.has(p.user_id))
      .sort((a, b) => ag(a.user_id).localeCompare(ag(b.user_id)) || (a.user_name || '').localeCompare(b.user_name || '') || a.start_date.localeCompare(b.start_date))
      .map(p => [t('agency_' + ag(p.user_id)), p.user_name, t('pk_' + p.kind), t('ps_' + p.status), p.start_date, p.end_date, nbDays(p),
        p.title || '', p.client_name || '', p.site_name || '', p.city || '', p.serial || '', p.model || '', p.report_number || '', (p.notes || '').replace(/\s+/g, ' ')]);
    csvDownload([[t('agency'), t('technician'), t('kind'), t('status'), t('date'), t('end_date'), t('plan_nb_days'), t('plan_title'), t('client'), t('site'),
      t('city'), t('serial'), t('model'), t('report'), t('notes')], ...rows], `planning_missions_${scope()}_${from}_${to}.csv`);
  };
  const exportGrid = () => {
    const { days, groups, entries, from, to } = view._exp;
    const head = [t('agency'), t('technician'), ...days.map(d => `${d.toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'fr-FR', { weekday: 'short' })} ${toISO(d)}`)];
    const rows = groups.flatMap(g => g.list.map(u => [t('agency_' + g.a), u.name, ...days.map(d => {
      const iso = toISO(d);
      return entries.filter(p => p.user_id === u.id && p.start_date <= iso && p.end_date >= iso)
        .map(p => `${t('pk_' + p.kind)}${p.title ? ' : ' + p.title : ''}${p.client_name ? ' (' + p.client_name + ')' : ''}`).join(' / ');
    })]));
    csvDownload([head, ...rows], `planning_grille_${scope()}_${from}_${to}.csv`);
  };
  const printGrid = () => {
    const st = document.createElement('style');
    st.textContent = '@page { size: A4 landscape; margin: 8mm; }';
    document.head.appendChild(st); document.body.classList.add('print-planning');
    const done = () => { st.remove(); document.body.classList.remove('print-planning'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print(); setTimeout(done, 1500);
  };
  $('#export', view).addEventListener('click', () => {
    if (!view._exp) return;
    modal({ title: t('plan_export'), body: `<p class="muted">${esc(t('plan_export_hint'))}</p>
        <div class="stack" style="gap:10px;margin-top:12px">
          <button class="btn" data-x="list">${icon('download')} ${esc(t('plan_export_list'))}</button>
          <button class="btn" data-x="grid">${icon('table')} ${esc(t('plan_export_grid'))}</button>
          <button class="btn" data-x="print">${icon('pdf')} ${esc(t('plan_export_print'))}</button>
        </div>`,
      actions: [{ label: t('close') }],
      onOpen: (w, close) => w.querySelector('.stack').addEventListener('click', e => {
        const b = e.target.closest('[data-x]'); if (!b) return;
        close(true);
        if (b.dataset.x === 'list') exportList(); else if (b.dataset.x === 'grid') exportGrid(); else setTimeout(printGrid, 250);
      })
    });
  });

  $('#prev', view).onclick = () => { start = addDays(start, -7 * Math.min(weeks, 2)); draw(); };
  $('#next', view).onclick = () => { start = addDays(start, 7 * Math.min(weeks, 2)); draw(); };
  $('#today', view).onclick = () => { start = mondayOf(new Date()); draw(); };
  $('#range', view).addEventListener('click', e => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    weeks = Number(b.dataset.w); try { localStorage.setItem('fs_plan_weeks', weeks); } catch {}
    [...b.parentNode.children].forEach(c => c.classList.toggle('on', c === b)); draw();
  });
  const setAgency = a => {
    agency = a; try { localStorage.setItem('fs_plan_agency', a); } catch {}
    view.querySelectorAll('#agency [data-a]').forEach(c => c.classList.toggle('on', c.dataset.a === a)); draw();
  };
  view.addEventListener('click', e => {
    const b = e.target.closest('#agency [data-a], #kpis [data-a]'); if (!b) return;
    setAgency(e.target.closest('#kpis') && agency === b.dataset.a ? 'all' : b.dataset.a);
  });
  const qi = $('#q', view);
  if (qi) qi.addEventListener('input', () => { q = qi.value; clearTimeout(qi._t); qi._t = setTimeout(draw, 200); });
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
