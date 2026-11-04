/* Synthèse d'un rapport : résumé en quelques points, généré à partir du contenu
 * (objet, constats, travaux / pièces, recommandations, temps passé).
 * Le technicien peut la générer puis la retoucher (champ header.summary) ; sinon elle est calculée à l'impression. */
import { t, getLang } from './i18n.js';

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const firstSentences = (s, max = 220) => {
  const txt = clean(String(s || '').replace(/^\s*[•\-–]\s*/gm, ''));
  if (txt.length <= max) return txt;
  const cut = txt.slice(0, max); const i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return (i > 60 ? cut.slice(0, i + 1) : cut.replace(/\s+\S*$/, '') + '…');
};

export function autoSummary(r) {
  const en = getLang() === 'en';
  const S = r.sections || [];
  const main = k => S.find(s => s.key === k);
  const subs = k => { const i = S.indexOf(main(k)); const out = []; for (let j = i + 1; i >= 0 && S[j] && S[j].level === 2; j++) out.push(S[j]); return out; };
  const pts = [];

  // Objet
  const mach = r.serial ? `${r.model && !(r.title || '').includes(r.model) ? r.model + ' ' : ''}n° ${r.serial}` : '';
  const what = [r.title, mach].filter(Boolean).join(' – ');
  if (what) pts.push(`${en ? 'Subject' : 'Objet'} : ${what}${r.client_name ? ` (${r.client_name}${r.site_name ? ', ' + r.site_name : ''})` : ''}.`);

  // Constats : conclusions, sinon expertise / démontage
  const findings = main('conclusions')?.text
    || [main('inspection'), ...subs('inspection'), main('disassembly'), main('appearance')].map(s => s && s.text).filter(Boolean).join(' ')
    || (S.find(s => !s.key && /constat|finding|diagnostic/i.test(s.title || ''))?.text);
  if (findings) pts.push(`${en ? 'Findings' : 'Constat'} : ${firstSentences(findings)}`);

  // Travaux et pièces remplacées (regroupées par désignation)
  const parts = (main('parts')?.rows || []).filter(x => x[0]);
  if (parts.length) {
    const agg = new Map();
    for (const [desc, qty] of parts) { const k = clean(desc).replace(/\s*\((PV|GV|LS|HS)\)\s*$/i, ''); agg.set(k, (agg.get(k) || 0) + (parseFloat(String(qty).replace(',', '.')) || 1)); }
    pts.push(`${en ? 'Parts replaced' : 'Pièces remplacées'} : ${[...agg].map(([k, n]) => `${n} × ${k}`).join(', ')}.`);
  } else if (main('reassembly')?.text) pts.push(`${en ? 'Work' : 'Travaux'} : ${firstSentences(main('reassembly').text, 160)}`);

  // Essais
  const tests = main('tests')?.text;
  if (tests && !/^(pas d|no test|néant|none)/i.test(clean(tests))) pts.push(`${en ? 'Tests' : 'Essais'} : ${firstSentences(tests, 140)}`);

  // Recommandations
  const reco = main('recommendations')?.text || S.find(s => !s.key && /recommand/i.test(s.title || ''))?.text;
  if (reco) pts.push(`${en ? 'Recommendations' : 'Recommandations'} : ${firstSentences(reco, 200)}`);

  // Temps passé et aléas
  const hours = (r.hours || []).reduce((a, h) => a + h.hours, 0);
  const haz = (main('log')?.rows || []).reduce((a, x) => a + (parseFloat(String(x[2] || '').replace(',', '.')) || 0), 0);
  if (hours || haz) pts.push(`${en ? 'Time' : 'Temps'} : ${hours ? `${String(hours).replace('.', ',')} h ${en ? 'logged' : 'saisies'}` : ''}${hours && haz ? ', ' : ''}${haz ? `${String(haz).replace('.', ',')} h ${en ? 'of delays' : 'd’aléas'}` : ''}.`);

  return pts.map(p => '• ' + p).join('\n');
}

/* Synthèse affichée : celle saisie par le technicien, sinon la synthèse automatique */
export const reportSummary = r => clean((r.header || {}).summary) ? (r.header || {}).summary : autoSummary(r);
