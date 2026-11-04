import { api } from '../api.js';
import { t, setLang, getLang, LANGS } from '../i18n.js';
import { icon, esc, $, toastError } from '../ui.js';

export async function renderLogin(root, onSuccess) {
  let pub = {};
  try { pub = await api.publicSettings(); } catch {}
  const draw = () => {
    root.innerHTML = `
    <div class="login">
      <section class="login-art">
        <div class="brand" style="padding:0">
          <div class="brand-mark">${icon('gear')}</div>
          <div class="brand-text"><strong>${esc(t('app_name'))}</strong><span>${esc(pub.company_name || '')}</span></div>
        </div>
        <div>
          <h1>${getLang() === 'en' ? 'Field service reports, timesheets and installed base — in one place.' : 'Rapports d’intervention, heures et base installée, au même endroit.'}</h1>
          <p>${getLang() === 'en' ? 'Built for technicians on site: tablet, phone or PC.' : 'Pensé pour les techniciens sur site : tablette, téléphone ou PC.'}</p>
        </div>
        <div class="feat">
          <span>${icon('report')} ${esc(t('nav_reports'))}</span>
          <span>${icon('clock')} ${esc(t('nav_hours'))}</span>
          <span>${icon('machine')} ${esc(t('nav_installed'))}</span>
        </div>
        <svg class="rings" viewBox="0 0 200 200" fill="none" stroke="#fff" stroke-width="1.2">
          ${Array.from({ length: 24 }, (_, i) => {
            const a = i * 15 * Math.PI / 180;
            return `<path d="M${100 + 78 * Math.cos(a)} ${100 + 78 * Math.sin(a)} L${100 + 92 * Math.cos(a)} ${100 + 92 * Math.sin(a)}" stroke-width="7"/>`;
          }).join('')}
          <circle cx="100" cy="100" r="78"/><circle cx="100" cy="100" r="30"/><circle cx="100" cy="100" r="12"/>
        </svg>
      </section>
      <section class="login-form">
        <form class="login-box" autocomplete="on">
          ${pub.logo ? `<img class="company-logo" src="${esc(pub.logo)}" alt="">` : ''}
          <div class="row" style="justify-content:space-between">
            <h1>${esc(t('login_title'))}</h1>
            <select class="inline" id="lang" style="min-width:0;height:36px">
              ${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === getLang() ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </div>
          <label class="field"><span>${esc(t('login_user'))}</span><input type="text" name="email" autocomplete="username" required autofocus></label>
          <label class="field"><span>${esc(t('login_pass'))}</span><input type="password" name="password" autocomplete="current-password" required></label>
          <button class="btn primary lg" type="submit">${esc(t('login_btn'))}</button>
          <p class="hint">${esc(t('login_hint'))}</p>
        </form>
      </section>
    </div>`;
    $('#lang', root).addEventListener('change', e => { setLang(e.target.value); draw(); });
    $('form', root).addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target;
      const btn = $('button[type=submit]', f);
      btn.disabled = true;
      try {
        await api.login(f.email.value.trim(), f.password.value);
        await onSuccess();
      } catch (err) { toastError(err); btn.disabled = false; f.password.select(); }
    });
  };
  draw();
}
