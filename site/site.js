/* Site vitrine : en-tête, pied de page et formulaire de demande de devis */
import { SITE } from './config.js';

const PAGES = [['index.html', 'Accueil'], ['services.html', 'Services'], ['secteurs.html', 'Secteurs et réducteurs'], ['devis.html', 'Demande de devis']];
const here = location.pathname.split('/').pop() || 'index.html';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- En-tête et pied de page communs ---------- */
document.body.insertAdjacentHTML('afterbegin', `
  <div class="proto">Prototype de démonstration – site non officiel. Les informations présentées sont indicatives.</div>
  <header class="s-head">
    <a class="s-logo" href="index.html"><img src="../img/logo.svg" alt="Lufkin Gears · Allen Gears – a Baker Hughes business"></a>
    <button class="s-burger" aria-label="Menu" aria-expanded="false">☰</button>
    <nav class="s-nav">
      ${PAGES.map(([h, l]) => `<a href="${h}" class="${h === here ? 'on' : ''} ${h === 'devis.html' ? 'cta' : ''}">${l}</a>`).join('')}
      <a href="../index.html" class="tech">Espace technicien →</a>
    </nav>
  </header>`);
document.body.insertAdjacentHTML('beforeend', `
  <footer class="s-foot">
    <div class="s-foot-in">
      <div><img src="../img/logo-white.svg" alt="" style="max-width:300px"><p>${esc(SITE.name)}</p>
        ${SITE.phone ? `<p>Urgence : <a href="tel:${esc(SITE.phone)}">${esc(SITE.phone)}</a></p>` : ''}</div>
      <div><strong>Le site</strong>${PAGES.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}<a href="credits.html">Crédits et mentions</a></div>
      <div><strong>Espace technicien</strong><a href="../index.html">Rapports d’intervention</a><a href="../index.html#/planning">Planning</a><a href="../index.html#/machines">Base installée</a></div>
    </div>
    <p class="s-legal">Prototype non officiel réalisé à des fins de démonstration. Lufkin Gears, Allen Gears et Baker Hughes sont des marques de leurs détenteurs respectifs.</p>
  </footer>`);
const burger = document.querySelector('.s-burger');
burger.onclick = () => { const o = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', o); };

/* ---------- Formulaire de demande de devis ---------- */
const form = document.querySelector('#rfq-form');
if (form) {
  const params = new URLSearchParams(location.search);
  if (params.get('service')) form.service.value = params.get('service');
  if (params.get('urgence')) form.urgency.value = params.get('urgence');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.querySelector('#rfq-msg');
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.email && !data.phone) { msg.className = 'msg err'; msg.textContent = 'Indiquez au moins un e-mail ou un téléphone pour que nous puissions vous répondre.'; form.email.focus(); return; }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    let number = '';
    // 1. Copie dans l'application (menu « Demandes de devis » du responsable)
    try {
      const { api } = await import('../js/api.js');
      number = (await api.rfq.submit(data)).number;
    } catch (err) { console.warn('Enregistrement de la demande impossible :', err); }
    // 2. E-mail pré-rempli vers l'adresse de réception
    const label = sel => form[sel].selectedOptions[0]?.textContent || '';
    if (SITE.rfqEmail) {
      const body = [`Demande de devis ${number}`, '', `Société : ${data.company}`, `Contact : ${data.contact_name}`, `E-mail : ${data.email}`, `Téléphone : ${data.phone}`,
        `Lieu : ${[data.location, data.country].filter(Boolean).join(', ')}`, '', `Prestation : ${label('service')}`, `Urgence : ${label('urgency')}`,
        `Date souhaitée : ${data.desired_date}`, '', `Matériel : ${[data.manufacturer, data.model].filter(Boolean).join(' ')}`, `N° de série : ${data.serial}`,
        `Application : ${data.application}`, '', data.description].join('\n');
      location.href = `mailto:${SITE.rfqEmail}?subject=${encodeURIComponent(`Demande de devis ${number} – ${data.company}`)}&body=${encodeURIComponent(body)}`;
    }
    form.hidden = true;
    msg.className = 'msg ok';
    msg.innerHTML = `<strong>Merci, votre demande ${esc(number)} a bien été enregistrée.</strong><br>
      ${SITE.rfqEmail ? 'Votre messagerie s’est ouverte avec la demande pré-remplie : pensez à envoyer l’e-mail.' : 'Un responsable du service la traitera et vous recontactera.'}
      ${data.urgency === 'emergency' ? `<br><br>Machine à l’arrêt : ${SITE.phone ? `appelez aussi le <a href="tel:${esc(SITE.phone)}">${esc(SITE.phone)}</a>.` : 'nous traitons votre demande en priorité.'}` : ''}
      <br><br><a class="s-btn" href="devis.html">Nouvelle demande</a> <a class="s-btn ghost" href="index.html">Retour à l’accueil</a>`;
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
