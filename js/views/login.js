import { api, LOCAL } from '../api.js';
import { t, setLang, getLang, LANGS } from '../i18n.js';
import { icon, esc, $, toastError, avatar, countryFlag, confirmBox } from '../ui.js';

export async function renderLogin(root, onSuccess) {
  let pub = {}, profiles = [];
  try { pub = await api.publicSettings(); } catch {}
  let isDemo = false;
  if (LOCAL) try { profiles = await api.profiles(); isDemo = await api.isDemo(); } catch {}
  const draw = () => {
    root.innerHTML = `
    <div class="login">
      <section class="login-art">
        <div class="brand with-logo" style="padding:0">
          <img class="brand-logo" src="img/logo-white.svg" alt="Lufkin Gears · Allen Gears">
          <div class="brand-sub">${esc(t('app_name'))}</div>
        </div>
        <div>
          <h1>${getLang() === 'en' ? 'Field service reports, timesheets and installed base — in one place.' : 'Rapports d’intervention, heures et base installée, au même endroit.'}</h1>
          <p>${getLang() === 'en' ? 'Built for technicians on site: tablet, phone or PC.' : 'Pensé pour les techniciens sur site : tablette, téléphone ou PC.'}</p>
        </div>
        <a class="site-link" href="site/index.html">${icon('building')} ${esc(t('nav_site'))} →</a>
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
        <div class="credits">${esc(t('photo_credit'))} : <a href="https://commons.wikimedia.org/wiki/File:Double-helical_gear.jpg" target="_blank" rel="noopener">Parchaco, CC0</a></div>
      </section>
      <section class="login-form">
        ${LOCAL ? `
        <div class="login-box">
          <img class="company-logo" src="${esc(pub.logo || 'img/logo.svg')}" alt="">
          <div class="row" style="justify-content:space-between">
            <h1>${esc(t('login_title'))}</h1>
            <select class="inline" id="lang" style="min-width:0;height:36px">
              ${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === getLang() ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </div>
          <form class="stack" id="local-login" autocomplete="on" style="gap:14px">
            <label class="field"><span>${esc(t('login_user'))}</span><input type="text" name="email" autocomplete="username" required></label>
            <label class="field"><span>${esc(t('login_pass'))}</span><input type="password" name="password" autocomplete="current-password" required></label>
            <button class="btn primary lg" type="submit">${esc(t('login_btn'))}</button>
          </form>
          ${isDemo ? `
          <div class="demo-accounts">
            <span>${esc(t('demo_accounts'))}</span>
            <div class="profiles">
              ${profiles.map(u => `<button class="profile" type="button" data-email="${esc(u.email)}" data-pw="${u.email === 'admin' ? 'admin' : 'demo'}">${avatar(u.name)}
                <span><strong>${esc(u.name)}</strong><small>${esc(t('role_' + u.role))} · <span class="mono">${esc(u.email)}</span> / <span class="mono">${u.email === 'admin' ? 'admin' : 'demo'}</span></small></span>
                ${icon('right')}</button>`).join('')}
            </div>
          </div>` : ''}
          <p class="hint">${esc(t(isDemo ? 'demo_hint' : 'local_hint'))}</p>
          <button class="btn sm ghost" id="reset-demo" style="align-self:flex-start">${esc(t('demo_reset'))}</button>
        </div>` : `
        <form class="login-box" autocomplete="on">
          <img class="company-logo" src="${esc(pub.logo || 'img/logo.svg')}" alt="">
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
        </form>`}
      </section>
    </div>`;
    $('#lang', root).addEventListener('change', e => { setLang(e.target.value); draw(); });
    if (LOCAL) {
      const f = $('#local-login', root);
      const go = async (email, pw) => {
        const btn = $('button[type=submit]', f); btn.disabled = true;
        try { await api.login(email, pw); await onSuccess(); } catch (err) { toastError(err); btn.disabled = false; f.password.select(); }
      };
      f.addEventListener('submit', e => { e.preventDefault(); go(f.email.value.trim(), f.password.value); });
      const pr = root.querySelector('.profiles');
      if (pr) pr.addEventListener('click', e => {
        const b = e.target.closest('[data-email]'); if (!b) return;
        f.email.value = b.dataset.email; f.password.value = b.dataset.pw; go(b.dataset.email, b.dataset.pw);
      });
      $('#reset-demo', root).addEventListener('click', async () => {
        if (!(await confirmBox(t('demo_reset_confirm'), t('demo_reset')))) return;
        await api.resetDemo(); location.reload();
      });
      return;
    }
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
