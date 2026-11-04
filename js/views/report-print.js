/* Rapport au format A4 – à imprimer ou « Enregistrer en PDF » depuis le navigateur.
 * Mise en page calquée sur les rapports « Rapport de visite ou de montage » / « Field Service Report » :
 * en-tête (OV, intervenant, client direct, utilisateur…), puis les 11 sections de la trame standard. */
import { api } from '../api.js';
import { t, sectionNumbers, tableCols, isTableKind } from '../i18n.js';
import { icon, esc, fmtDate, fmtHours, userName, countryFlag } from '../ui.js';
import { reportSummary } from '../summary.js';

const nl2br = s => esc(s || '').replace(/\n/g, '<br>');
const cssStr = s => String(s || '').replace(/["\\\n]/g, ' ');

export async function renderReportPrint(view, id) {
  const [r, settings] = await Promise.all([api.reports.full(id), api.settings.get()]);
  const photos = new Map(r.photos.map(p => [p.id, p]));
  const h = r.header || {};
  const structured = r.sections.some(s => s.key);
  const nums = sectionNumbers(r.sections);
  const totalHours = r.hours.reduce((a, x) => a + x.hours, 0);
  const longDate = d => fmtDate(d, { day: '2-digit', month: 'long', year: 'numeric' });
  const dates = r.end_date && r.end_date !== r.date ? `${longDate(r.date)} → ${longDate(r.end_date)}` : longDate(r.date);
  const docTitle = structured ? t('print_title_std') : t('print_title');
  const ref = h.order_no ? `${t('order_no').split('/')[0].trim()} ${h.order_no}` : r.number;

  const row = (label, value) => `<tr><th>${esc(label)}</th><td>${value || '<span class="muted">—</span>'}</td></tr>`;

  /* Contenu d'une section ; renvoie '' si vide */
  const body = s => {
    // Mesures : une ligne ne compte que si elle a une valeur (les libellés de la trame sont pré-remplis)
    const rows = isTableKind(s.kind) ? (s.rows || []).filter(x => s.kind === 'measures' ? x.slice(1).some(c => c) : x.some(c => c)) : [];
    const ph = (s.photos || []).filter(pid => photos.has(pid));
    if (!s.text && !rows.length && !ph.length) return '';
    return `
      ${rows.length ? `<table class="p-table k-${esc(s.kind)}"><thead><tr>${tableCols(s.kind).map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(x => `<tr>${tableCols(s.kind).map((_, i) => `<td>${esc(x[i] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}
      ${s.text ? `<p class="p-text">${nl2br(s.text)}</p>` : ''}
      ${ph.length ? `<div class="p-photos ${ph.length === 1 ? 'one' : ''}">${ph.map(pid => {
        const p = photos.get(pid);
        return `<figure><img src="${esc(p.url || '/uploads/' + p.filename)}" alt="">${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}</figure>`;
      }).join('')}</div>` : ''}`;
  };

  /* Les sections principales de la trame sont toujours imprimées (« Néant » si vides),
     les sous-sections vides sont omises. Anciens rapports : sections vides omises. */
  const bodies = r.sections.map(body);
  const subsFilled = i => { for (let j = i + 1; j < r.sections.length && r.sections[j].level === 2; j++) if (bodies[j]) return true; return false; };
  const sectionsHtml = r.sections.map((s, i) => {
    const b = bodies[i];
    const sub = s.level === 2;
    if (!b && (sub || !structured)) return '';
    if (!b && subsFilled(i)) return `<section class="p-section"><h2><span>${esc(nums[i])}</span>${esc(s.title || '')}</h2></section>`;
    return `
      <section class="p-section ${sub ? 'p-sub' : ''}">
        ${sub ? `<h3><span>${esc(nums[i])}.</span> ${esc(s.title || '')}</h3>`
              : `<h2><span>${esc(nums[i])}</span>${esc(s.title || '')}</h2>`}
        ${b || `<p class="p-text muted">${esc(t('nothing'))}</p>`}
      </section>`;
  }).join('');

  document.title = `${h.order_no || r.number} – ${r.client_name || ''}`;
  view.innerHTML = `
  <style>
    @page {
      @top-left { content: "${cssStr(settings.company_name)}"; font: 8pt system-ui, sans-serif; color: #5f6f6a; }
      @top-right { content: "${cssStr(docTitle.toUpperCase())} · ${cssStr(ref)}"; font: 8pt system-ui, sans-serif; color: #5f6f6a; }
      @bottom-left { content: "${cssStr(t('signature'))} : ____________________"; font: 8pt system-ui, sans-serif; color: #5f6f6a; }
      @bottom-right { content: "${cssStr(t('page'))} " counter(page) " / " counter(pages); font: 8pt system-ui, sans-serif; color: #5f6f6a; }
    }
  </style>
  <div class="print-toolbar no-print">
    <a class="btn" href="#/reports/${r.id}">${icon('left')} ${esc(t('back'))}</a>
    <span class="spacer"></span>
    <button class="btn primary" id="print">${icon('pdf')} ${esc(t('print_pdf'))}</button>
  </div>
  <article class="sheet">
    <header class="p-head">
      <div class="p-company">
        <img src="${esc(settings.logo || 'img/logo.svg')}" alt="">
        <div><strong>${esc(settings.company_name || '')}</strong>
          <div>${nl2br(settings.company_address)}</div><div>${esc(settings.company_contact || '')}</div></div>
      </div>
      <div class="p-title">
        <div class="p-doc">${esc(docTitle)}</div>
        <div class="p-num">${esc(h.order_no || r.number)}</div>
        ${h.order_no ? `<div>${esc(t('report_no'))} <span class="mono">${esc(r.number)}</span></div>` : ''}
        <div class="p-badges"><span>${esc(t('rt_' + r.type))}</span><span class="st-${esc(r.status)}">${esc(t('rs_' + r.status))}</span></div>
      </div>
    </header>

    <table class="p-header">
      <tbody>
        ${row(t('order_no'), esc(h.order_no))}
        ${row(t('prepared_by'), esc(r.technicians.map(userName).join(', ')))}
        ${row(t('accompanied_by'), esc(h.accompanied_by))}
        ${row(t('date'), esc(dates))}
        ${row(t('direct_customer'), esc(h.direct_customer || r.client_name))}
        ${row(t('end_user'), esc(h.end_user))}
        ${row(t('site'), `${esc(r.site_name || '')}${r.city ? ', ' + esc(r.city) : ''} ${countryFlag(r.site_country)}`)}
        ${row(t('installation_type'), esc(h.installation_type))}
        ${row(t('persons_met'), esc(h.persons_met))}
        ${h.line_of_business ? row(t('line_of_business'), esc(h.line_of_business)) : ''}
        ${row(t('purpose'), esc(r.title))}
      </tbody>
    </table>

    ${structured ? `<section class="p-summary"><h3>${esc(t('summary_title'))}</h3><p class="p-text">${nl2br(reportSummary(r))}</p></section>` : ''}

    ${structured ? `<div class="p-band">${esc(t('summary_band'))}</div>` : `
    <section class="p-info">
      <div class="p-box"><h3>${esc(t('machine'))}</h3>
        <div><span>${esc(t('serial'))}</span><strong class="mono">${esc(r.serial || '—')}</strong></div>
        <div><span>${esc(t('model'))}</span><strong>${esc([r.model, r.machine_type].filter(Boolean).join(' · ') || '—')}</strong></div>
      </div>
    </section>`}

    ${sectionsHtml}

    ${r.hours.length ? `
    <section class="p-section">
      <h2><span>⏱</span>${esc(t('hours'))}</h2>
      <table class="p-table"><thead><tr><th>${esc(t('date'))}</th><th>${esc(t('technician'))}</th><th>${esc(t('kind'))}</th><th style="text-align:right">${esc(t('duration'))}</th></tr></thead>
        <tbody>${r.hours.map(x => `<tr><td>${esc(fmtDate(x.date))}</td><td>${esc(x.user_name)}</td><td>${esc(t('hk_' + x.kind))}</td><td style="text-align:right">${esc(fmtHours(x.hours))}</td></tr>`).join('')}
        <tr class="tot"><td colspan="3">${esc(t('total'))}</td><td style="text-align:right">${esc(fmtHours(totalHours))}</td></tr></tbody></table>
    </section>` : ''}

    <section class="p-sign">
      <div class="p-box">
        <h3>${esc(t('created_by'))}</h3>
        <strong>${esc(r.technicians.map(userName).join(', '))}</strong>
      </div>
      <div class="p-box">
        <h3>${esc(t('signature'))}</h3>
        ${r.signature ? `<img src="${r.signature}" alt="">` : '<div class="p-sig-empty"></div>'}
        <strong>${esc(r.signer_name || '')}</strong>
        ${r.signed_at ? `<div class="muted">${esc(t('signed_on'))} ${esc(fmtDate(r.signed_at.slice(0, 10)))}</div>` : ''}
      </div>
    </section>

    <footer class="p-foot">${esc(settings.company_name || '')} · ${esc(docTitle)} · ${esc(ref)}</footer>
  </article>`;

  view.querySelector('#print').addEventListener('click', () => window.print());
  return () => { document.title = 'Field Service'; };
}
