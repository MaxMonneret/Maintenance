/*
 * Dictée vocale (transcription) sur toutes les zones de texte de l'application.
 * - Bouton micro : la parole est transcrite dans le champ (reconnaissance vocale du navigateur).
 * - Commandes vocales : « à la ligne », « point suivant » (nouvelle puce), « virgule », « point final »…
 * - Bouton « mettre en points » : transforme le texte dicté en liste à puces, une phrase par point.
 * Disponible dans Chrome, Edge et Safari, en HTTPS ou sur localhost.
 */
import { t, getLang } from './i18n.js';
import { icon, esc, toast } from './ui.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const dictationSupported = !!SR && window.isSecureContext;

/* Commandes vocales → texte inséré */
const COMMANDS = {
  fr: [
    [/\s*\b(point suivant|nouveau point|puce suivante|tiret)\b\s*/gi, '\n• '],
    [/\s*\b(à la ligne|a la ligne|nouvelle ligne|retour à la ligne)\b\s*/gi, '\n'],
    [/\s*\bpoint d'interrogation\b/gi, ' ?'],
    [/\s*\bpoint d'exclamation\b/gi, ' !'],
    [/\s*\b(point final|point à la ligne)\b/gi, '.'],
    [/\s*\bpoints de suspension\b/gi, '…'],
    [/\s*\bdeux points\b/gi, ' :'],
    [/\s*\bpoint-virgule\b|\s*\bpoint virgule\b/gi, ' ;'],
    [/\s*\bvirgule\b/gi, ','],
    [/\s*\bouvrir (la )?parenthèse\b\s*/gi, ' ('],
    [/\s*\bfermer (la )?parenthèse\b/gi, ')'],
    [/\b(tiret|moins) (\d)/gi, '-$2']
  ],
  en: [
    [/\s*\b(next point|new point|next bullet|bullet point)\b\s*/gi, '\n• '],
    [/\s*\b(new line|next line)\b\s*/gi, '\n'],
    [/\s*\bquestion mark\b/gi, '?'],
    [/\s*\b(full stop|period)\b/gi, '.'],
    [/\s*\bcolon\b/gi, ':'],
    [/\s*\bsemicolon\b/gi, ';'],
    [/\s*\bcomma\b/gi, ','],
    [/\s*\bopen bracket\b\s*/gi, ' ('],
    [/\s*\bclose bracket\b/gi, ')']
  ]
};
function applyCommands(text) {
  let s = ' ' + text.trim();
  for (const [re, rep] of COMMANDS[getLang() === 'en' ? 'en' : 'fr']) s = s.replace(re, rep);
  return s.replace(/^\s+/, '');
}
const capitalize = s => s.replace(/(^|[.!?]\s+|\n•?\s*)([a-zà-ÿ])/g, (m, a, c) => a + c.toUpperCase());

/* Insère le texte transcrit à la position du curseur, avec les espaces qui conviennent */
function insert(el, raw) {
  let text = applyCommands(raw);
  if (!text) return;
  const start = el.selectionStart ?? el.value.length, end = el.selectionEnd ?? el.value.length;
  const before = el.value.slice(0, start), after = el.value.slice(end);
  const needSpace = before && !/[\s(]$/.test(before) && !/^[\n.,;:!?)…]/.test(text);
  const startOfSentence = !before.trim() || /[.!?]\s*$|\n\s*(•\s*)?$/.test(before);
  if (startOfSentence) text = text.charAt(0).toUpperCase() + text.slice(1);
  text = capitalize(text);
  const ins = (needSpace ? ' ' : '') + text;
  el.value = before + ins + after;
  const pos = before.length + ins.length;
  el.setSelectionRange(pos, pos);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/* « Mettre en points » : une phrase ou une ligne = un point */
export function toBullets(text) {
  const lines = text.split(/\n+/).map(l => l.replace(/^\s*[•\-–*]\s*/, '').trim()).filter(Boolean);
  const items = lines.flatMap(l => l.split(/(?<=[.!?;])\s+/)).map(x => x.trim().replace(/[.;]$/, '')).filter(Boolean);
  return items.map(x => '• ' + x.charAt(0).toUpperCase() + x.slice(1)).join('\n');
}

/* ---------- Session de dictée ---------- */
let active = null;   // { rec, el, btn, bubble }
function stop() {
  if (!active) return;
  const a = active; active = null;
  try { a.rec.stop(); } catch {}
  a.btn.classList.remove('on'); a.bubble.remove();
}
function start(el, btn) {
  stop();
  const rec = new SR();
  rec.lang = getLang() === 'en' ? 'en-GB' : 'fr-FR';
  rec.continuous = true; rec.interimResults = true;
  const bubble = document.createElement('div');
  bubble.className = 'dict-bubble';
  bubble.innerHTML = `<span class="dot"></span><span class="txt">${esc(t('dict_listening'))}</span><button type="button" class="btn sm">${esc(t('dict_stop'))}</button>`;
  bubble.querySelector('button').onclick = stop;
  btn.parentNode.appendChild(bubble);
  btn.classList.add('on');
  active = { rec, el, btn, bubble };
  rec.onresult = e => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) insert(el, r[0].transcript); else interim += r[0].transcript;
    }
    bubble.querySelector('.txt').textContent = interim || t('dict_listening');
  };
  rec.onerror = e => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast(t('dict_denied'), 'error');
    else if (e.error !== 'no-speech' && e.error !== 'aborted') toast(t('dict_error') + ' (' + e.error + ')', 'error');
  };
  rec.onend = () => { if (active && active.rec === rec) { try { rec.start(); } catch { stop(); } } };   // relance après une pause
  el.focus();
  try { rec.start(); } catch { stop(); }
}

/* ---------- Ajout automatique des boutons sur les zones de texte ---------- */
function enhance(el) {
  if (el.dataset.dict || el.disabled || el.readOnly || el.dataset.nodictate !== undefined) return;
  el.dataset.dict = '1';
  const wrap = document.createElement('div');
  wrap.className = 'dict-wrap';
  el.parentNode.insertBefore(wrap, el);
  wrap.appendChild(el);
  const tools = document.createElement('div');
  tools.className = 'dict-tools';
  tools.innerHTML = `
    ${dictationSupported ? `<button type="button" class="dict-btn mic" title="${esc(t('dict_start'))}" aria-label="${esc(t('dict_start'))}">${icon('mic')}</button>` : ''}
    <button type="button" class="dict-btn bullets" title="${esc(t('dict_bullets'))}" aria-label="${esc(t('dict_bullets'))}">•≡</button>`;
  wrap.appendChild(tools);
  tools.addEventListener('mousedown', e => e.preventDefault());   // garde le curseur dans le champ
  tools.addEventListener('click', e => {
    const b = e.target.closest('.dict-btn'); if (!b) return;
    if (b.classList.contains('mic')) return active && active.el === el ? stop() : start(el, b);
    if (!el.value.trim()) return;
    el.value = toBullets(el.value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
export function initDictation() {
  const scan = root => root.querySelectorAll && root.querySelectorAll('textarea').forEach(enhance);
  scan(document);
  new MutationObserver(muts => {
    for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) { if (n.tagName === 'TEXTAREA') enhance(n); else scan(n); }
    if (active && !document.body.contains(active.el)) stop();
  }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', stop);
}
