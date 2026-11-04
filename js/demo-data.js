/*
 * Données de démonstration (entièrement fictives) pour la version en ligne.
 * Utilisées par api-local.js au premier lancement et par « Réinitialiser la démo ».
 * Les photos sont dessinées à la volée (canvas) : aucune image réelle de client.
 */
import { standardSections } from './i18n.js';

const iso = d => d.toISOString().slice(0, 10);
const daysAgo = n => iso(new Date(Date.now() - n * 864e5));
const fr = d => d.split('-').reverse().join('/');

/* ---------- Photos de démonstration dessinées ---------- */
function canvas(w = 960, h = 720) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function metal(g, w, h, hue = 200) {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, `hsl(${hue},8%,30%)`); gr.addColorStop(.5, `hsl(${hue},6%,62%)`); gr.addColorStop(1, `hsl(${hue},8%,24%)`);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.globalAlpha = .08; for (let i = 0; i < 160; i++) { g.fillStyle = i % 2 ? '#fff' : '#000'; g.fillRect(0, Math.random() * h, w, 1 + Math.random() * 2); } g.globalAlpha = 1;
}
function label(g, w, h, text) {
  g.fillStyle = 'rgba(5,50,43,.82)'; g.fillRect(0, h - 64, w, 64);
  g.fillStyle = '#fff'; g.font = '600 26px system-ui, sans-serif'; g.fillText(text, 24, h - 24);
  g.font = '600 16px system-ui, sans-serif'; g.fillStyle = '#7fe0c4'; g.fillText('PHOTO DE DÉMONSTRATION', w - 250, 34);
}
function gear(g, cx, cy, r, teeth, color = '#c9d1d3') {
  g.save(); g.translate(cx, cy); g.fillStyle = color; g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; g.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = i * Math.PI / teeth, a1 = (i + 1) * Math.PI / teeth, rr = i % 2 ? r : r + r * .09;
    g.arc(0, 0, rr, a0, a1);
  }
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(0, 0, r * .62, 0, 7); g.fill();
  g.fillStyle = '#8b9497'; g.beginPath(); g.arc(0, 0, r * .25, 0, 7); g.fill(); g.restore();
}
const PHOTOS = {
  machine: t => { const [c, g] = canvas(); metal(g, 960, 720, 160);
    g.fillStyle = '#2f7d6d'; g.fillRect(250, 200, 420, 300); g.fillStyle = '#25695c'; g.fillRect(250, 200, 420, 40);
    g.fillStyle = '#9aa3a6'; g.fillRect(120, 330, 140, 50); g.fillRect(660, 300, 200, 60);
    g.fillStyle = '#1d4f45'; for (let i = 0; i < 6; i++) g.fillRect(280 + i * 65, 260, 30, 10);
    g.fillStyle = '#d8dee0'; g.fillRect(420, 400, 120, 50); g.fillStyle = '#333'; g.font = '14px monospace'; g.fillText('DEMO GEAR', 432, 430);
    label(g, 960, 720, t); return c; },
  gear: t => { const [c, g] = canvas(); metal(g, 960, 720); gear(g, 330, 330, 230, 42); gear(g, 700, 300, 120, 22, '#d6dcde');
    g.strokeStyle = 'rgba(30,120,255,.55)'; g.lineWidth = 14; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(330, 330, 230 - i * 4, -.5 + i * .02, .2 + i * .02); g.stroke(); }
    label(g, 960, 720, t); return c; },
  bearing: t => { const [c, g] = canvas(); metal(g, 960, 720, 210);
    const cx = 480, cy = 330; g.fillStyle = '#cfd6d8'; g.beginPath(); g.arc(cx, cy, 260, 0, 7); g.fill();
    g.fillStyle = '#6d7679'; g.beginPath(); g.arc(cx, cy, 210, 0, 7); g.fill();
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; g.fillStyle = '#e8ecee'; g.beginPath(); g.arc(cx + 185 * Math.cos(a), cy + 185 * Math.sin(a), 26, 0, 7); g.fill();
      g.strokeStyle = '#555'; g.lineWidth = 2; g.stroke(); }
    g.fillStyle = '#b9c1c4'; g.beginPath(); g.arc(cx, cy, 150, 0, 7); g.fill(); g.fillStyle = '#3b4244'; g.beginPath(); g.arc(cx, cy, 110, 0, 7); g.fill();
    g.fillStyle = 'rgba(120,70,30,.35)'; g.beginPath(); g.arc(cx + 120, cy - 150, 40, 0, 7); g.fill();
    label(g, 960, 720, t); return c; },
  seal: t => { const [c, g] = canvas(); metal(g, 960, 720, 30);
    g.fillStyle = '#c3cacc'; g.fillRect(200, 180, 560, 300); g.fillStyle = '#a7b0b3'; g.fillRect(200, 300, 560, 60);
    g.strokeStyle = 'rgba(80,40,20,.7)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(260 + i * 50, 305); g.lineTo(290 + i * 50, 355); g.stroke(); }
    label(g, 960, 720, t); return c; },
  contact: t => { const [c, g] = canvas(); g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, 960, 720);
    g.save(); g.translate(480, 330); g.rotate(-.35); g.fillStyle = 'rgba(30,110,230,.75)';
    for (let i = 0; i < 4; i++) g.fillRect(-330, -70 + i * 45, 600 - i * 40, 22); g.restore();
    g.fillStyle = '#333'; g.font = 'italic 24px Georgia, serif'; g.fillText('Portée de denture – flanc actif', 60, 70); g.fillText('Jeu de denture 0,30 mm', 600, 560);
    label(g, 960, 720, t); return c; },
  vibration: t => { const [c, g] = canvas(); g.fillStyle = '#0f1d1a'; g.fillRect(0, 0, 960, 720);
    g.strokeStyle = 'rgba(255,255,255,.12)'; for (let x = 60; x < 960; x += 60) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 620); g.stroke(); }
    g.strokeStyle = '#3fe0b0'; g.lineWidth = 3; g.beginPath();
    for (let x = 0; x < 900; x++) { const y = 420 - (Math.exp(-((x - 250) ** 2) / 300) * 240 + Math.exp(-((x - 500) ** 2) / 200) * 120 + Math.random() * 18); x ? g.lineTo(60 + x, y) : g.moveTo(60, y); }
    g.stroke(); g.fillStyle = '#fff'; g.font = '20px system-ui'; g.fillText('Spectre vitesse – palier GV côté accouplement', 70, 70); g.fillText('1×', 300, 160); g.fillText('2×', 552, 280);
    label(g, 960, 720, t); return c; }
};
function signature(name) {
  const [c, g] = canvas(600, 180); g.fillStyle = '#fff'; g.fillRect(0, 0, 600, 180);
  g.strokeStyle = '#10201c'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 120);
  for (let x = 40; x < 520; x += 8) g.lineTo(x, 100 + Math.sin(x / 17) * 35 * Math.cos(x / 61) + (x % 48 < 8 ? -25 : 0));
  g.stroke(); g.font = 'italic 22px Georgia, serif'; g.fillStyle = '#10201c'; g.fillText(name, 330, 165);
  return c.toDataURL('image/png');
}

/* ---------- Jeu de données ---------- */
export function buildDemo() {
  const year = new Date().getFullYear();
  const num = n => `RI-${year}-${String(n).padStart(4, '0')}`;
  const users = [
    { id: 1, name: 'Administrateur', email: 'admin', role: 'admin', country: 'FR', lang: 'fr', active: 1 },
    { id: 2, name: 'Julien Martin', email: 'julien.martin', role: 'technician', country: 'FR', lang: 'fr', active: 1 },
    { id: 3, name: 'James Walker', email: 'james.walker', role: 'technician', country: 'UK', lang: 'en', active: 1 },
    { id: 4, name: 'Claire Dubois', email: 'claire.dubois', role: 'manager', country: 'FR', lang: 'fr', active: 1 }
  ];
  const clients = [
    { id: 1, name: 'Énergie Démo SA', country: 'FR', address: '12 rue de l’Industrie, 69000 Lyon', contact: 'M. Bernard', phone: '+33 4 00 00 00 00', email: 'contact@energie-demo.example' },
    { id: 2, name: 'Papeterie Démo', country: 'FR', address: 'Zone industrielle, 88000 Épinal', contact: 'Mme Laurent', phone: '+33 3 00 00 00 00', email: 'maintenance@papeterie-demo.example' },
    { id: 3, name: 'North Sea Demo Ltd', country: 'UK', address: 'Aberdeen, Scotland', contact: 'Mr. Campbell', phone: '+44 1224 000000', email: 'ops@northsea-demo.example' },
    { id: 4, name: 'Gulf Demo Refining', country: 'US', address: 'Houston, TX', contact: 'Ms. Garcia', phone: '+1 713 000 0000', email: 'maint@gulf-demo.example' },
    { id: 5, name: 'Cimenterie Démo', country: 'FR', address: 'Port Ouest, 59140 Dunkerque', contact: 'M. Lefebvre', phone: '+33 3 00 00 00 01', email: 'maintenance@ciment-demo.example' },
    { id: 6, name: 'Sucrerie Démo', country: 'FR', address: 'Route de Douai, 62000 Arras', contact: 'Mme Caron', phone: '+33 3 00 00 00 02', email: 'energie@sucrerie-demo.example' },
    { id: 7, name: 'Demo Shipyard Ltd', country: 'UK', address: 'Portsmouth, Hampshire', contact: 'Mr. Hughes', phone: '+44 23 0000 0000', email: 'fleet@shipyard-demo.example' },
    { id: 9, name: 'Motoriste Démo', country: 'FR', address: 'Parc aéronautique, 77550 Réau', contact: 'M. Chaumont', phone: '+33 1 00 00 00 04', email: 'essais@motoriste-demo.example' },
    { id: 8, name: 'Aciérie Démo', country: 'FR', address: 'Zone industrielle, 13270 Fos-sur-Mer', contact: 'M. Garnier', phone: '+33 4 00 00 00 03', email: 'laminoir@acier-demo.example' }
  ].map(x => ({ ...x, archived: 0 }));
  const sites = [
    { id: 1, client_id: 1, name: 'Centrale thermique – Unité 2', city: 'Lyon', country: 'FR', contact: 'M. Petit (chef de quart)' },
    { id: 2, client_id: 1, name: 'Station de pompage Est', city: 'Mâcon', country: 'FR', contact: 'M. Roux' },
    { id: 3, client_id: 2, name: 'Machine à papier PM3', city: 'Épinal', country: 'FR', contact: 'Mme Laurent, M. Henry' },
    { id: 4, client_id: 3, name: 'Platform Alpha', city: 'Offshore', country: 'UK', contact: 'OIM' },
    { id: 5, client_id: 4, name: 'Refinery – Unit 400', city: 'Houston', country: 'US', contact: 'Area supervisor' },
    { id: 6, client_id: 5, name: 'Usine – Four 2', city: 'Dunkerque', country: 'FR', contact: 'M. Lefebvre (resp. mécanique)' },
    { id: 7, client_id: 6, name: 'Atelier énergie et diffusion', city: 'Arras', country: 'FR', contact: 'Mme Caron, M. Dupuis' },
    { id: 8, client_id: 7, name: 'Patrol vessel P-12 – engine room', city: 'Portsmouth', country: 'UK', contact: 'Chief engineer' },
    { id: 10, client_id: 9, name: 'Banc d’essais n° 3', city: 'Réau', country: 'FR', contact: 'M. Chaumont, M. Perret' },
    { id: 9, client_id: 8, name: 'Laminoir à chaud – train finisseur', city: 'Fos-sur-Mer', country: 'FR', contact: 'M. Garnier' }
  ].map(x => ({ ...x, archived: 0 }));
  const M = (id, site_id, serial, manufacturer, model, order_no, type, application, power_kw, ratio, speeds, commissioning_date, status, notes = '') =>
    ({ id, site_id, serial, manufacturer, model, order_no, type, application, power_kw, ratio, speeds, commissioning_date, status, notes, archived: 0 });
  const machines = [
    M(1, 1, 'DM-2014-08812', 'Lufkin', 'PG-500', 'CD-14-0412', 'Réducteur parallèle', 'Turbine / alternateur', 12500, '3,15:1', '4725 / 1500', '2014-06-12', 'in_service'),
    M(2, 1, 'DM-2014-08813', 'Lufkin', 'PG-500', 'CD-14-0412', 'Réducteur parallèle', 'Turbine / alternateur', 12500, '3,15:1', '4725 / 1500', '2014-06-12', 'watch', 'Vibrations palier GV côté accouplement à surveiller.'),
    M(3, 2, 'DM-2019-10457', 'Lufkin', 'EP-210', 'CD-19-1180', 'Réducteur épicycloïdal', 'Pompe d’alimentation', 2200, '5,6:1', '1490 / 266', '2019-03-02', 'in_service'),
    M(4, 3, 'DM-2008-03312', 'Comélor', 'MPL 400', '08-21004-01', 'Réducteur', 'Moteur – réducteur – enrouleuse', 450, '16:1', '1480 / 92', '2008-09-15', 'watch', 'Pitting évolutif sur la roue PV : prévoir le remplacement du train d’engrenages.'),
    M(5, 4, 'DM-2011-07720', 'Lufkin', 'PG-350', 'CD-11-0907', 'Multiplicateur', 'Compresseur gaz', 8400, '1:2,4', '1490 / 3576', '2011-09-20', 'in_service'),
    M(6, 5, 'DM-2017-09901', 'Lufkin', 'HS-420', 'CD-17-2210', 'Réducteur à arbres parallèles', 'Compresseur centrifuge', 6000, '1:3,8', '1785 / 6783', '2017-11-05', 'down', 'Arrêt en attente de pièces (pignon GV).'),
    M(7, 6, 'DM-2009-05140', 'Lufkin', 'MC-1250', 'CD-09-0318', 'Réducteur de broyeur double hélicoïdal', 'Broyeur à boulets cru', 3200, '7,1:1', '990 / 139', '2009-04-20', 'in_service'),
    M(8, 6, 'DM-2012-06677', 'Lufkin', 'PG-280', 'CD-12-0544', 'Réducteur parallèle', 'Ventilateur de tirage four', 1400, '1,5:1', '1490 / 993', '2012-02-14', 'in_service'),
    M(9, 7, 'DM-2004-02281', 'Allen Gears', 'Allen TG-30', 'AG-04-1172', 'Réducteur turbine – alternateur', 'Turbo-alternateur 12 MW', 12000, '5,5:1', '8250 / 1500', '2004-09-01', 'in_service'),
    M(10, 7, 'DM-2015-08810', 'Lufkin', 'SR-900', 'CD-15-0731', 'Réducteur à arbres parallèles', 'Diffuseur à betteraves', 560, '40:1', '1480 / 37', '2015-07-10', 'watch', 'Légère fuite au joint arbre PV, à surveiller pendant la campagne.'),
    M(11, 4, 'DM-2013-07215', 'Allen Gears', 'Allen HC-44', 'AG-13-0420', 'Multiplicateur', 'Compresseur d’export gaz', 9500, '1:2,9', '3000 / 8700', '2013-05-28', 'in_service'),
    M(12, 5, 'DM-2016-09102', 'Lufkin', 'N-1800', 'CD-16-1906', 'Multiplicateur', 'Compresseur de recyclage H2', 4500, '1:4,2', '1785 / 7497', '2016-10-03', 'in_service'),
    M(13, 8, 'DM-2018-03390', 'Allen Gears', 'Allen MR-12', 'AG-18-0077', 'Réducteur marin', 'Propulsion – ligne d’arbre bâbord', 7000, '4,8:1', '1200 / 250', '2018-06-15', 'in_service'),
    M(14, 8, 'DM-2018-03391', 'Allen Gears', 'Allen MR-12', 'AG-18-0077', 'Réducteur marin', 'Propulsion – ligne d’arbre tribord', 7000, '4,8:1', '1200 / 250', '2018-06-15', 'in_service'),
    M(15, 9, 'DM-2006-01968', 'Lufkin', 'LM-2200', 'CD-06-0215', 'Réducteur de laminoir', 'Cage finisseuse F3', 6500, '3,2:1', '600 / 187', '2006-03-30', 'watch', 'Hausse progressive de la température du palier GV côté moteur (+8 °C en 6 mois).'),
    M(17, 10, 'DM-1997-30519', 'Comélor', 'PH 135', '05-01888', 'Multiplicateur', 'Banc d’essais – 2 moteurs, palier d’étanchéité, mur élastique', 1600, '1:4', '1500 / 6000', `${year - 1}-04-30`, 'in_service',
      'Accouplements : AFX 125 (moteur / moteur), AFX 140 à broches (moteur / PH 135), Flexibox à allonge lg 550 (PH 135 / palier). Palier positionné par une fourchette goupillée.'),
    M(16, 3, 'DM-2010-04471', 'Lufkin', 'PG-120', 'CD-10-0610', 'Réducteur parallèle', 'Pompe de mélange PM3', 250, '2,5:1', '1490 / 596', '2010-11-08', 'in_service')
  ];

  const photos = []; // { id, report_id, filename, caption, data }
  // Photos réelles sous licence libre (Wikimedia Commons) – crédit ajouté à la légende
  const REAL = {
    machine: ['img/photos/reducteur-lufkin.jpg', 'Lufkin Industries'],
    open: ['img/photos/reducteur-double-helicoidal.jpg', 'Parchaco, CC0'],
    pitting: ['img/demo/denture-pitting.jpg', 'Loscimmio, CC BY-SA 4.0'],
    micropitting: ['img/demo/denture-micro-pitting.jpg', 'G. Lötzig, CC BY-SA 3.0'],
    bearing: ['img/demo/roulement-rotule-en-place.jpg', 'Falk2, CC BY-SA 4.0'],
    bearing2: ['img/demo/roulement-rotule.jpg', 'Androstachys, CC BY-SA 3.0'],
    journal: ['img/demo/palier-traces-frottement.jpg', 'domaine public'],
    journalnew: ['img/demo/palier-lisse.jpg', 'Miba Industrial Bearings, CC BY-SA 4.0']
  };
  const ph = (rid, kind, caption) => {
    const id = photos.length + 1, real = REAL[kind];
    photos.push({ id, report_id: rid, filename: `demo-${id}`, created_by: 1,
      caption: real ? `${caption} (photo : ${real[1]})` : caption,
      data: real ? real[0] : PHOTOS[kind](caption).toDataURL('image/jpeg', .8) });
    return id;
  };
  const machineView = m => { const s = sites.find(x => x.id === m.site_id); return { ...m, site_name: s.name, city: s.city, site_contact: s.contact }; };
  const build = (m, lang) => {
    const S = standardSections(machineView(m), lang);
    const main = k => S.find(s => s.key === k);
    const sub = (k, n) => S[S.indexOf(main(k)) + n];
    return { S, main, sub };
  };
  const reports = [];
  const rep = (o, S) => reports.push({ end_date: null, signer_name: null, signature: null, signed_at: null, validated_by: null,
    ...o, sections: S, created_at: o.date + 'T08:00:00Z', updated_at: (o.end_date || o.date) + 'T17:00:00Z' });

  /* 1. Visite annuelle – validée */
  {
    const { S, main, sub } = build(machines[0], 'fr');
    main('equipment').rows[0][4] = '61 200'; main('equipment').rows[0][5] = 'Bon état général';
    main('location').photos = [ph(1, 'machine', 'Réducteur PG-500 – vue côté turbine')];
    main('purpose').text = 'Visite de maintenance préventive annuelle pendant l’arrêt programmé de la tranche.\nEn fonctionnement : 12,5 MW, entrée 4725 tr/min (turbine), sortie 1500 tr/min (alternateur).';
    main('appearance').text = 'Carter propre, pas de fuite d’huile visible. Peinture en bon état. Instrumentation (sondes de température paliers et capteurs de vibration) en place.';
    main('disassembly').text = 'Pas de démontage des lignes d’arbres : inspection par les trappes de visite.';
    sub('disassembly', 1).rows = [['Jeu de denture', '0,32 mm', '0,25 – 0,40 mm'], ['Jeu axial roulement PV', '0,30 mm', '0,25 – 0,35 mm'], ['Jeu axial roulement GV', '0,28 mm', '0,25 – 0,35 mm']];
    sub('inspection', 1).text = 'Huile ISO VG 46 claire. Analyse du mois dernier conforme (eau < 100 ppm, classe de propreté ISO 17/15/12).';
    sub('inspection', 2).text = 'Paliers lisses : pas de rayure ni de trace de grippage sur les régules visibles.';
    sub('inspection', 3).text = 'Dentures en bon état : portée centrée sur toute la largeur, pas de pitting ni de micro-pitting.';
    sub('inspection', 3).photos = [ph(1, 'open', 'Vue d’ensemble des dentures, carter ouvert'), ph(1, 'contact', 'Relevé de portée au bleu')];
    sub('inspection', 2).photos = [ph(1, 'journalnew', 'Coussinet de palier GV – état de surface')];
    sub('inspection', 5).text = 'Accouplements à denture graissés, pas d’usure anormale.';
    main('tests').text = 'Redémarrage et essai en charge pendant 2 h : vibrations paliers < 2,0 mm/s, températures paliers stabilisées à 68 °C maximum.';
    main('conclusions').text = 'Réducteur en très bon état, aucune anomalie relevée.';
    main('recommendations').text = 'Poursuivre les analyses d’huile trimestrielles.\nProchaine visite préventive dans 12 mois.';
    main('log').rows = [[fr(daysAgo(41)), 'Consignation, ouverture des trappes de visite, inspection des dentures et des paliers.', ''], [fr(daysAgo(40)), 'Relevés de jeux, fermeture, redémarrage et essai en charge 2 h.', '1']];
    rep({ id: 1, number: num(1), machine_id: 1, date: daysAgo(41), end_date: daysAgo(40), type: 'preventive', status: 'validated', title: 'Visite annuelle – inspection dentures et paliers',
      technicians: [2], created_by: 2, validated_by: 4, signer_name: 'M. Petit', signature: signature('M. Petit'), signed_at: daysAgo(40) + 'T16:30:00Z',
      header: { order_no: 'OV-' + year + '-0412', accompanied_by: '', direct_customer: 'Énergie Démo SA', end_user: 'Énergie Démo SA', installation_type: 'Turbine – réducteur – alternateur', persons_met: 'M. Petit (chef de quart), M. Bernard', line_of_business: 'Énergie' } }, S);
  }
  /* 2. Remplacement roulements et joints – terminé, à valider */
  {
    const { S, main, sub } = build(machines[3], 'fr');
    main('equipment').rows[0][4] = '98 000';
    main('location').photos = [ph(2, 'machine', 'Réducteur MPL 400 – entraînement enrouleuse')];
    main('purpose').text = 'Dépose et repose des lignes d’arbres PV et GV pour remplacement des roulements, des joints d’étanchéité et des douilles de frottement. Contrôle des jeux, de la portée de denture et des accouplements.';
    main('appearance').text = 'Appareil en place à mon arrivée, capots de protection démontés. Zone de travail encrassée (graisse, poussière de papier).';
    sub('disassembly', 1).rows = [['Jeu de denture', '0,29 mm', '0,20 – 0,35 mm'], ['Jeu axial roulement PV', '0,42 mm', '0,20 – 0,40 mm'], ['Jeu axial roulement GV', '0,38 mm', '0,20 – 0,40 mm']];
    sub('inspection', 1).text = 'Huile noircie, présence de particules métalliques fines sur le bouchon magnétique.';
    sub('inspection', 2).text = 'Marques d’usure sur les galets et les bagues extérieures des roulements PV.';
    sub('inspection', 2).photos = [ph(2, 'bearing', 'Roulement PV type 22318 – usure des galets'), ph(2, 'bearing2', 'Roulement GV type 22222 déposé')];
    sub('inspection', 3).text = 'Pitting évolutif sur la roue PV, quelques traces de chocs. Pas de mobile de rechange chez le client.';
    sub('inspection', 3).photos = [ph(2, 'pitting', 'Roue PV – pitting évolutif'), ph(2, 'micropitting', 'Pignon GV – micro-pitting et surbrillance')];
    sub('inspection', 4).text = 'Douilles de frottement rayées, lèvres des bagues d’étanchéité usées.';
    sub('inspection', 4).photos = [ph(2, 'seal', 'Douille de frottement PV – rayures')];
    sub('inspection', 5).text = 'Accouplement GV en bon état. Accouplement PV : usure anormale des dents sur le moyeu et la couronne.';
    main('parts').rows = [['Roulement (PV)', '2', '22318-E1-XL', 'CMD-4471', 'Atelier'], ['Roulement (GV)', '2', '22222-E1-XL', 'CMD-4471', 'Atelier'],
      ['Bague d’étanchéité', '2', 'BA 170x200x15', 'CMD-4471', 'Atelier'], ['Douille de frottement', '2', '–', 'CMD-4471', 'Atelier'],
      ['Accouplement PV (moyeu + couronne)', '1', 'ACC-170', '–', 'Fourniture client']];
    sub('reassembly', 1).rows = [['Jeu de denture', '0,29 mm', '0,20 – 0,35 mm'], ['Jeu axial roulement PV', '0,30 mm', '0,20 – 0,40 mm'], ['Jeu axial roulement GV', '0,30 mm', '0,20 – 0,40 mm'], ['Portée de denture', 'OK', '> 70 %']];
    sub('reassembly', 1).photos = [ph(2, 'contact', 'Portée de denture au remontage – flanc actif roue PV')];
    sub('reassembly', 2).text = 'Contrôle avant montage, toilage des arbres, montage des roulements par emmanchement à chaud (110 °C).';
    sub('reassembly', 3).text = 'Remplacement des douilles (montage à chaud) et des bagues d’étanchéité. RAS.';
    sub('reassembly', 4).text = 'Remplacement de l’accouplement PV, remontage de l’accouplement GV d’origine.';
    sub('reassembly', 5).rows = [['Concentricité / décalage horizontal', '0,03 mm', '< 0,05 mm'], ['Parallélisme / angle horizontal', '0,02/100', '< 0,05/100'], ['Concentricité / décalage vertical', '0,04 mm', '< 0,05 mm'], ['Parallélisme / angle vertical', '0,01/100', '< 0,05/100'], ['Épaisseur des cales', '+0,10 mm côté moteur', '']];
    sub('reassembly', 6).rows = [['Boulonnerie carter', '210 N·m', 'Classe 8.8'], ['Produit d’étanchéité', 'Pâte silicone', '']];
    main('tests').text = 'Essai à vide 30 min puis en production : pas de bruit anormal, températures roulements < 60 °C.';
    main('conclusions').text = 'Réducteur dans un état moyen. Remplacement des quatre roulements, des deux bagues d’étanchéité, des deux douilles et de l’accouplement PV effectué.\nUsure de denture normale compte tenu des heures de fonctionnement, mais pitting évolutif sur la roue PV.';
    main('recommendations').text = 'Surveiller l’état des dentures et la qualité de l’huile (analyse dans 3 mois).\nPrévoir le remplacement du train d’engrenages lors de la prochaine intervention.';
    main('log').rows = [[fr(daysAgo(12)), 'Arrivée sur site, consignation, vidange, dépose des capots et des accouplements.', ''],
      [fr(daysAgo(11)), 'Dépose des lignes d’arbres PV et GV, expertise des roulements, dentures et portées de joint.', '2'],
      [fr(daysAgo(10)), 'Montage des roulements et douilles à chaud, remontage des lignes d’arbres, relevé des jeux.', ''],
      [fr(daysAgo(9)), 'Alignement moteur / réducteur, remplissage d’huile, essais, repli du chantier.', '']];
    main('log').text = 'Aléas : attente de la livraison de l’accouplement PV (2 h).';
    rep({ id: 2, number: num(2), machine_id: 4, date: daysAgo(12), end_date: daysAgo(9), type: 'curative', status: 'done', title: 'Remplacement roulements et joints + inspection engrenages',
      technicians: [2], created_by: 2, signer_name: 'Mme Laurent', signature: signature('Mme Laurent'), signed_at: daysAgo(9) + 'T15:00:00Z',
      header: { order_no: 'OV-' + year + '-0587', accompanied_by: 'M. Durand (mécanicien)', direct_customer: 'Papeterie Démo', end_user: 'Papeterie Démo', installation_type: 'Moteur – réducteur – enrouleuse', persons_met: 'Mme Laurent, M. Henry', line_of_business: 'Papier' } }, S);
  }
  /* 3. Expertise vibratoire – brouillon en cours sur site */
  {
    const { S, main, sub } = build(machines[1], 'fr');
    main('purpose').text = 'Expertise suite à une hausse des vibrations sur le palier GV côté accouplement (alarme à 4,5 mm/s).';
    main('appearance').text = 'Pas de fuite, carter propre. Légère odeur d’huile chaude au niveau du palier GV.';
    sub('inspection', 2).text = fr(daysAgo(1)) + ' : mesures vibratoires en fonctionnement : 4,8 mm/s au palier GV côté accouplement, composante 1× dominante.';
    sub('inspection', 2).photos = [ph(3, 'vibration', 'Spectre vibratoire – palier GV côté accouplement')];
    main('log').rows = [[fr(daysAgo(1)), 'Mesures vibratoires en fonctionnement, relevé des températures paliers (→ État des roulements)', '0,5'],
      [fr(daysAgo(0)), 'Contrôle d’alignement à l’arrêt en cours, attente de la consignation.', '1,5']];
    rep({ id: 3, number: num(3), machine_id: 2, date: daysAgo(1), type: 'expertise', status: 'draft', title: 'Expertise vibrations palier GV',
      technicians: [2], created_by: 2,
      header: { order_no: 'OV-' + year + '-0644', accompanied_by: '', direct_customer: 'Énergie Démo SA', end_user: 'Énergie Démo SA', installation_type: 'Turbine – réducteur – alternateur', persons_met: 'M. Petit', line_of_business: 'Énergie' } }, S);
  }
  /* 4. Rapport en anglais – brouillon (James Walker) */
  {
    const { S, main, sub } = build(machines[4], 'en');
    main('purpose').text = 'High vibration alarm on HS bearing NDE reported by the control room.\nDriven by electric motor at 1490 RPM, output 3576 RPM to the gas compressor.';
    main('appearance').text = 'No visible oil leak. Coupling guard in place.';
    sub('inspection', 1).text = 'Oil sample taken for analysis. Visual: clear, no water.';
    sub('inspection', 2).text = 'HS bearing NDE temperature 84 °C (alarm 90 °C).';
    main('log').rows = [[fr(daysAgo(2)), 'Helicopter transfer, permit to work, vibration survey.', '3']];
    rep({ id: 4, number: num(4), machine_id: 5, date: daysAgo(2), type: 'curative', status: 'draft', title: 'High vibration alarm – HS bearing NDE',
      technicians: [3], created_by: 3,
      header: { order_no: 'SO-' + year + '-1031', accompanied_by: 'None', direct_customer: 'North Sea Demo Ltd', end_user: 'North Sea Demo Ltd', installation_type: 'Electric motor – gear increaser – gas compressor', persons_met: 'Mr. Campbell (OIM)', line_of_business: 'Oil & Gas' } }, S);
  }

  /* 5. Inspection majeure et reconstruction d'un multiplicateur – en anglais (modèle : rapport « Field Service Report ») */
  {
    const m12 = machines.find(m => m.id === 12);
    const { S, main, sub } = build(m12, 'en');
    main('equipment').rows = [['Lufkin', 'N-1800', 'CD-16-1906', 'DM-2016-09102', '41 000', 'Aged']];
    main('equipment').photos = [ph(5, 'machine', 'Lufkin gear unit – reference picture')];
    main('location').text = 'Refinery – Unit 400, Houston TX.\nThe gear increaser is located within the refinery complex, on the hydrogen recycle compressor deck.';
    main('purpose').text = 'Major inspection and rebuild.\nThe 4500 kW gear increaser is driven by an electric motor at 1785 RPM with an output of 7497 RPM to the recycle compressor.';
    main('appearance').text = 'The gear increaser had been disassembled before I arrived on site. The gear case did not show any major oil leak or corrosion. The internals of the gear case were tarnished from oil residue, as were the gear and pinion that had been removed. All instrumentation had been disconnected.';
    main('disassembly').text = 'The gear increaser had been disassembled prior to my arrival by the site contractor. They recorded the as-found dimensions of the gear set and bearings that were removed. Please see their report for results.';
    main('inspection').text = 'See the reassembly section for the inspection of gears, bearings and gear case.';
    sub('inspection', 2).photos = [ph(5, 'journal', 'Removed LS bearing – rub marks on the bearing surface')];
    main('parts').rows = [['Bearing', '1', 'DEMO-52852', '', 'Lufkin'], ['Bearing', '1', 'DEMO-52853', '', 'Lufkin'], ['Thrust bearing', '1', 'DEMO-52854', '', 'Lufkin'],
      ['L.S. gear & shaft assy.', '1', 'DEMO-52890', '', 'Lufkin'], ['H.S. pinion', '1', 'DEMO-76450', '', 'Lufkin'], ['Seal / adapter H.S.', '1', 'DEMO-52851', '', 'Lufkin'], ['Oil slinger', '1', 'DEMO-86373', '', 'Lufkin']];
    main('parts').text = 'Customer furnished spares from Lufkin Gears.';
    main('reassembly').text = 'The gear case and cover were cleaned and prepped for assembly.\nThe gear case was assembled without gears and the housing bores were micrometer checked for size.\nThe gear case was then sealed with an anaerobic gasket compound and the cover was installed. All fasteners were torqued per Lufkin torque specifications for grade 5 bolts.';
    main('reassembly').photos = [ph(5, 'open', 'Gear set in the lower half of the case')];
    sub('reassembly', 1).rows = [['Thrust bearing clearance', '.009"', ''], ['High speed axial float', '.043"', ''], ['Backlash between gears', '.020"', ''],
      ['High speed seal clearance', '.006"', ''], ['Low speed seal clearance', '.021"', 'Out of tolerance'], ['L.S. bull gear bearing journals', '6.999"', ''],
      ['H.S. pinion bearing journals', '4.000"', ''], ['Low speed housing bores', '8.000"', ''], ['High speed housing bores', '4.877"', '']];
    sub('reassembly', 1).text = 'Gear tooth contact was checked with Prussian blue after reassembly.';
    sub('reassembly', 1).photos = [ph(5, 'contact', 'Gear tooth contact – LS gear')];
    sub('reassembly', 2).text = 'The new bearings had been micrometer checked by the contractor prior to my arrival.\nThe lower halves of the bearings were set into the housing, then the low speed gear and the high speed pinion were placed into the gear case. A Prussian blue check of the shaft-to-bearing contact was made on each bearing (LS DE / NDE, HS DE / NDE).\nThe bearing-to-shaft contact meets the minimum surface contact required: no raised high spots, contact across the full width of each bearing.';
    sub('reassembly', 2).photos = [ph(5, 'journalnew', 'New journal bearing before installation')];
    sub('reassembly', 3).text = 'High speed seal clearance .006". Low speed seal clearance .021": out of tolerance. As no new seal was available, the old seal was re-used.';
    sub('reassembly', 5).text = 'The motor and the compressor had not been aligned to the gear increaser at my release.';
    sub('reassembly', 6).rows = [['Main housing bolts', '644 ft.lbs (873 N·m)', 'Grade 5'], ['Gear case flange bolts', '266 ft.lbs (361 N·m)', 'Grade 5'], ['Sealant', 'Anaerobic gasket compound', '']];
    main('tests').text = 'No tests were performed during my visit. The low speed gear was sprayed with machinist layout fluid in three places around the gear for future reference of gear tooth contact checks.';
    main('conclusions').text = 'The gear increaser was rebuilt complete with customer furnished spares. I suggested that the gears and bearings removed from the unit be returned to Lufkin Gears for evaluation, inspection and repair.\nThe instrumentation was verified to be operational but had not been connected at my release, nor had the motor or compressor been aligned to the gear increaser.\nThe pinion needs to have the oil slinger placed in the correct position as per drawing. The low speed seal clearance is out of tolerance: the old seal was re-used.\nThe customer was satisfied with the rebuild process.';
    main('recommendations').text = '• Install new fresh oil in the lube oil reservoir.\n• Monitor temperature, oil pressure and vibration during start-up.\n• Monitor for oil leaks daily.\n• Replace the low speed seal at the next opportunity.\n• Contact the Lufkin Gears service department for any questions.';
    main('log').rows = [[fr(daysAgo(62)), 'Arrival on site, review of the contractor as-found report, cleaning of the gear case.', ''],
      [fr(daysAgo(61)), 'Bore checks, bearing installation, Prussian blue checks LS / HS.', ''],
      [fr(daysAgo(60)), 'Gear set installation, tooth contact check, case closing and torquing, clearance readings.', '2']];
    main('log').text = 'Delays: waiting for crane availability (2 h).';
    rep({ id: 5, number: num(5), machine_id: 12, date: daysAgo(62), end_date: daysAgo(60), type: 'curative', status: 'validated', title: 'Major inspection – gear increaser rebuild',
      technicians: [3], created_by: 3, validated_by: 4, signer_name: 'Ms. Garcia', signature: signature('Ms. Garcia'), signed_at: daysAgo(60) + 'T17:00:00Z',
      header: { order_no: 'SO-' + year + '-0950', accompanied_by: 'None', direct_customer: 'Gulf Demo Refining', end_user: 'Same', installation_type: 'Electric motor – gear increaser – recycle compressor', persons_met: 'Ms. Garcia (maintenance)', line_of_business: 'Oil & Gas' } }, S);
  }
  /* 6. Montage d'un banc d'essais avec journal et relevés d'alignement (modèle : rapport « Rapport de visite ou de montage » Comélor) */
  {
    const m17 = machines.find(m => m.id === 17);
    const { S, main, sub } = build(m17, 'fr');
    const y1 = year - 1, d = (dd, mm = '04') => `${String(dd).padStart(2, '0')}/${mm}/${y1}`;
    main('equipment').rows = [['Multiplicateur Comélor', 'PH 135', '05-01888', 'DM-1997-30519', '0', 'Neuf – montage'],
      ['Moteur électrique double sortie', '', '', '', '', ''], ['Moteur électrique simple sortie', '', '', '', '', ''],
      ['Palier d’étanchéité', '', '', '', '', ''], ['Mur élastique sur plots', '', '', '', '', '']];
    main('location').text = 'Motoriste Démo – banc d’essais n° 3.';
    main('purpose').text = 'Montage du banc d’essais équipé d’un multiplicateur PH 135 (n° DM-1997-30519) : pose, calage, alignements et accouplements.';
    main('appearance').text = 'Matériel neuf livré sur palettes, protections en place. Massif béton et châssis moteurs prêts à l’arrivée.';
    main('reassembly').text = 'Alignements réalisés au combilaser (palier / PH 135 / moteurs) et au comparateur (mur élastique / palier), voir relevés en 8.5.';
    main('reassembly').photos = [ph(6, 'open', 'Multiplicateur avant pose des capots')];
    sub('reassembly', 5).rows = [
      ['Mur élastique / palier – concentricité H / G / D / B (comparateur, Ø palpeur 1400 mm)', '-0,19 / 0,12 / -0,14 / 0,00 mm', d(21)],
      ['Mur élastique / palier – parallélisme H / G / D / B', '0,06 / 0,09 / -0,06 / 0,00 mm', d(21)],
      ['Palier / PH 135 – horizontal (combilaser, 6000 tr/min)', '0,005 mm ; 0,02/100', d(24)],
      ['Palier / PH 135 – vertical', '0,01 mm ; 0,01/100', d(24)],
      ['PH 135 / moteur double sortie – horizontal (1500 tr/min)', '0,00 mm ; 0,00/100', d(28)],
      ['PH 135 / moteur double sortie – vertical', '0,01 mm ; 0,01/100', d(28)],
      ['Moteur / moteur – horizontal', '0,05 mm ; 0,00/100', d(28)], ['Moteur / moteur – vertical', '0,04 mm ; 0,00/100', d(28)]];
    sub('reassembly', 5).text = 'Mur élastique / palier : relevés faits après correction en position du mur élastique ; compensation de 0,1 mm sur l’arrière du palier pour corriger le défaut de parallélisme.\nPalier / PH 135 : cales avant 10,58 mm (+ 0,3 mm au milieu), cales arrière 10,65 mm (+ 0,2 mm au milieu).\nPH 135 / moteur : cote d’accouplement respectée à 160 mm ; une patte moteur calée de 0,5 mm (défaut de taque).\nMoteur / moteur : clinquant de 0,2 à 0,3 mm à chaque patte pour compenser le défaut du châssis.';
    main('tests').text = 'Essais de goupillage : impossibles sur le palier et sur le multiplicateur. Pour le palier, une fourchette de positionnement a été réalisée par le client, fixée et goupillée (2 goupilles coniques Ø16, 2 vis M16x80).';
    main('conclusions').text = 'Montage du banc terminé : multiplicateur et moteurs alignés dans les tolérances, accouplements fermés et graissés, capots posés.\nLes défauts du génie civil (équerrage du mur, taraudages du châssis) ont été compensés avec l’accord du client.';
    main('recommendations').text = 'Contrôler les alignements à chaud après les premiers essais en charge.\nVérifier le serrage des fixations dans le béton après 100 h de fonctionnement.';
    main('log').rows = [
      [d(14), 'Arrivée 13h30, préparation de l’outillage, pose de l’équerre de renfort (4 chevilles M16) et calage pour compenser le défaut d’équerrage du mur. Équerre soudée sur le marbre du multiplicateur (4 cordons de 40 mm, soudeur qualifié).', ''],
      [d(15), 'Pré-alignement palier / mur élastique : concentricité réalisable, parallélisme impossible (3,5 mm de défaut mesuré sur le mur élastique), constaté avec le client.', '3'],
      [d(16), 'Alignement arrêté : la surface du mur élastique doit être reprise par le sous-traitant génie civil. Pré-alignement multiplicateur / moteurs, pose des couronnes, montage de l’accouplement à broches, essais des capots.', '2'],
      [d(17), 'Assistance au sous-traitant pour la vérification du parallélisme du mur élastique.', '8'],
      [d(18), 'Essais des plateaux sur multiplicateur et palier, vérification de l’alignement mur élastique / palier après ébauche de calage.', '2'],
      [d(21), 'Arrivée 13h30, remontage du mur élastique par le sous-traitant, pose des 6 cales définitives du palier, alignement et blocage.', '2'],
      [d(22), 'Fabrication et montage des joints d’étanchéité des plateaux Flexibox, montage pour serrage au couple des 3 écrous bout d’arbre.', '6'],
      [d(23), 'Alignement multiplicateur, retouche des cales avec clinquant 0,20 et 0,30 mm (voir relevé).', ''],
      [d(24), 'Blocage du multiplicateur, reprise de l’alignement du 1er moteur. Fixations béton non bloquées constatées : blocage et pointage à la soudure. Taraudages M30 du châssis du 2e moteur non conformes : rebouchage puis perçage-taraudage de 6 trous avec l’accord du client.', '6'],
      [d(25), 'Alignement des moteurs pour déterminer les hauteurs de cales, essais de goupillage, fourchette de positionnement du palier.', ''],
      [d(28), 'Mise en place des cales moteurs, alignements définitifs (voir relevés), fermeture et graissage des accouplements.', ''],
      [d(29), 'Pose des capots, pointage des vis vérins du multiplicateur, mise en place de la fourchette du palier.', ''],
      [d(30), 'Remontage de l’allonge GV, retouche du capot, repli et nettoyage du chantier.', '']];
    main('log').text = 'Total des aléas : 29 h (génie civil non conforme).';
    rep({ id: 6, number: `RI-${y1}-0001`, machine_id: 17, date: `${y1}-04-14`, end_date: `${y1}-04-30`, type: 'commissioning', status: 'validated',
      title: 'Montage banc d’essais équipé d’un multiplicateur PH 135', technicians: [2], created_by: 2, validated_by: 4,
      header: { order_no: '05-01888', accompanied_by: 'M. Bernard (mécanicien)', direct_customer: 'Motoriste Démo', end_user: 'Motoriste Démo',
        installation_type: 'Banc d’essais', persons_met: 'M. Chaumont, M. Perret', line_of_business: 'Aéronautique' } }, S);
  }

  /* ---------- Historique des maintenances (rapports validés des années précédentes) ---------- */
  const H = {
    fr: {
      commissioning: { title: 'Mise en service', purpose: 'Assistance à la mise en service : contrôle de l’installation, du lignage, du graissage et premier démarrage.',
        appearance: 'Appareil neuf, peinture et protections en bon état.', concl: 'Mise en service réalisée, fonctionnement conforme.', reco: 'Vidange de rodage après 500 h de fonctionnement.\nPremière visite préventive à 12 mois.' },
      preventive: { title: 'Visite préventive', purpose: 'Visite préventive programmée : inspection des dentures et des paliers, relevés de jeux, contrôle de l’huile.',
        appearance: 'Carter propre, pas de fuite notable.', concl: 'Réducteur en bon état général, aucune anomalie bloquante.', reco: 'Poursuivre les analyses d’huile.\nProchaine visite préventive selon le plan de maintenance.' },
      expertise: { title: 'Expertise', purpose: 'Expertise à la demande du client suite à une dérive des paramètres de fonctionnement (vibrations / températures).',
        appearance: 'Traces d’huile sous le carter côté accouplement.', concl: 'Usure prononcée des paliers côté GV, denture correcte.', reco: 'Remplacer les coussinets GV lors du prochain arrêt.\nRenforcer la surveillance vibratoire (mensuelle).' },
      curative: { title: 'Remplacement roulements et joints', purpose: 'Intervention corrective : remplacement des roulements et des joints d’étanchéité suite à une fuite et un bruit anormal.',
        appearance: 'Fuite d’huile au joint arbre PV, encrassement important.', concl: 'Roulements et joints remplacés, jeux remis dans les tolérances.', reco: 'Contrôler l’étanchéité après 100 h.\nAnalyse d’huile à 3 mois.' },
      oil: ['Huile claire, analyse conforme.', 'Huile légèrement oxydée, vidange recommandée.', 'Présence de fines particules sur le bouchon magnétique.'],
      bearings: ['Roulements / paliers sans défaut apparent.', 'Légères traces d’usure sur les galets, sans gravité.', 'Coussinets marqués, jeu en limite haute.'],
      gears: ['Portée de denture correcte, pas de pitting.', 'Micro-pitting localisé en pied de dent, à surveiller.', 'Bonne portée sur toute la largeur.'],
      parts: [['Roulement (PV)', '2', '22318-E1-XL', '', 'Atelier'], ['Roulement (GV)', '2', '22222-E1-XL', '', 'Atelier'], ['Bague d’étanchéité', '2', '–', '', 'Atelier']]
    },
    en: {
      commissioning: { title: 'Commissioning', purpose: 'Commissioning assistance: installation, alignment and lubrication checks, first start-up.',
        appearance: 'New unit, paint and protections in good condition.', concl: 'Commissioning completed, operation as expected.', reco: 'Running-in oil change after 500 h.\nFirst preventive visit at 12 months.' },
      preventive: { title: 'Preventive visit', purpose: 'Scheduled preventive visit: gear and bearing inspection, clearance readings, oil check.',
        appearance: 'Clean casing, no significant leak.', concl: 'Gearbox in good overall condition, no blocking issue.', reco: 'Continue oil analysis.\nNext preventive visit as per maintenance plan.' },
      expertise: { title: 'Condition assessment', purpose: 'Assessment requested by the customer after a drift of operating parameters (vibration / temperatures).',
        appearance: 'Oil traces under the casing on the coupling side.', concl: 'Significant wear of HS journal bearings, gear teeth acceptable.', reco: 'Replace HS bearings at next shutdown.\nIncrease vibration monitoring (monthly).' },
      curative: { title: 'Bearing and seal replacement', purpose: 'Corrective work: replacement of bearings and seals after an oil leak and abnormal noise.',
        appearance: 'Oil leak at LS shaft seal, heavy fouling.', concl: 'Bearings and seals replaced, clearances back within tolerance.', reco: 'Check sealing after 100 h.\nOil analysis in 3 months.' },
      oil: ['Clear oil, analysis compliant.', 'Slightly oxidised oil, oil change recommended.', 'Fine particles on the magnetic plug.'],
      bearings: ['Bearings with no visible defect.', 'Slight roller wear, not critical.', 'Journal bearings marked, clearance at upper limit.'],
      gears: ['Good tooth contact, no pitting.', 'Localised micro-pitting at tooth root, to be monitored.', 'Good contact across the full face width.'],
      parts: [['Bearing (LS)', '2', '22318-E1-XL', '', 'Workshop'], ['Bearing (HS)', '2', '22222-E1-XL', '', 'Workshop'], ['Shaft seal', '2', '–', '', 'Workshop']]
    }
  };
  const perYear = {};
  const histNum = y => `RI-${y}-${String(100 + (perYear[y] = (perYear[y] || 0) + 1)).padStart(4, '0')}`;
  let rid = reports.length;
  for (const m of machines) {
    if (m.id === 17) continue;
    const site = sites.find(x => x.id === m.site_id); const client = clients.find(x => x.id === site.client_id);
    const lang = ['UK', 'US'].includes(site.country) ? 'en' : 'fr';
    const L = H[lang]; const tech = lang === 'en' ? 3 : 2;
    const y0 = Number(m.commissioning_date.slice(0, 4));
    const events = [['commissioning', m.commissioning_date]];
    for (let y = y0 + 1 + (m.id % 2); y < year; y += 2 + (m.id % 2)) events.push(['preventive', `${y}-${String(3 + (m.id * 2 + y) % 8).padStart(2, '0')}-${String(5 + (m.id + y) % 20).padStart(2, '0')}`]);
    if (m.status !== 'in_service' || m.id % 3 === 0) {
      const y = Math.max(y0 + 2, year - 1 - (m.id % 3));
      if (y < year) events.push([m.id % 2 ? 'expertise' : 'curative', `${y}-${String(1 + m.id % 11).padStart(2, '0')}-${String(10 + m.id % 15).padStart(2, '0')}`]);
    }
    events.sort((a, b) => a[1].localeCompare(b[1]));
    for (const [type, date] of events.slice(-5)) {
      const k = L[type]; const n = (m.id + Number(date.slice(0, 4))) % 3;
      const { S, main, sub } = build(m, lang);
      main('equipment').rows[0][4] = type === 'commissioning' ? '0' : String((Number(date.slice(0, 4)) - y0) * 7800);
      main('purpose').text = k.purpose; main('appearance').text = k.appearance;
      sub('inspection', 1).text = L.oil[type === 'commissioning' ? 0 : n];
      sub('inspection', 2).text = type === 'expertise' ? L.bearings[2] : L.bearings[type === 'commissioning' ? 0 : n % 2];
      sub('inspection', 3).text = L.gears[type === 'commissioning' ? 2 : n];
      if (type !== 'commissioning') sub('disassembly', 1).rows = sub('disassembly', 1).rows.map((r, i) => [r[0], ['0,31 mm', '0,28 mm', '0,33 mm'][(i + n) % 3], '0,25 – 0,40 mm']);
      if (type === 'curative') main('parts').rows = L.parts.map(x => [...x.slice(0, 3), `CMD-${date.slice(2, 4)}${m.id}`, x[4]]);
      main('tests').text = type === 'expertise' ? '' : (lang === 'en' ? 'Run test 1 h: vibration below 2.5 mm/s, bearing temperatures stable.' : 'Essai 1 h : vibrations < 2,5 mm/s, températures paliers stabilisées.');
      main('conclusions').text = k.concl; main('recommendations').text = k.reco;
      main('log').rows = [[fr(date), k.purpose.split(':')[0] + '.', '']];
      const days = type === 'curative' ? 2 : type === 'preventive' ? 1 : 0;
      rep({ id: ++rid, number: histNum(date.slice(0, 4)), machine_id: m.id, date, end_date: days ? iso(new Date(new Date(date).getTime() + days * 864e5)) : null,
        type, status: 'validated', title: `${k.title} – ${m.model}`, technicians: [tech], created_by: tech, validated_by: 4,
        header: { order_no: `${lang === 'en' ? 'SO' : 'OV'}-${date.slice(0, 4)}-${String(300 + rid).padStart(4, '0')}`, accompanied_by: '', direct_customer: client.name, end_user: client.name,
          installation_type: m.application, persons_met: site.contact, line_of_business: '' } }, S);
    }
  }

  /* Heures */
  const timesheets = []; let tid = 0;
  const ts = (user_id, date, kind, hours, report_id = null, note = null, status = 'entered') =>
    timesheets.push({ id: ++tid, user_id, date, kind, hours, report_id, note, status, validated_by: status === 'validated' ? 4 : null });
  ts(2, daysAgo(41), 'travel', 2, 1, null, 'validated'); ts(2, daysAgo(41), 'site', 8, 1, null, 'validated'); ts(2, daysAgo(40), 'site', 7.5, 1, null, 'validated'); ts(2, daysAgo(40), 'travel', 2, 1, null, 'validated');
  for (let d = 12; d >= 9; d--) { ts(2, daysAgo(d), 'site', 8, 2); if (d === 12 || d === 9) ts(2, daysAgo(d), 'travel', 3, 2); }
  ts(2, daysAgo(11), 'waiting', 2, 2, 'Attente livraison accouplement');
  ts(2, daysAgo(1), 'travel', 1.5, 3); ts(2, daysAgo(1), 'site', 6, 3); ts(2, daysAgo(0), 'site', 4, 3);
  ts(3, daysAgo(2), 'travel', 3, 4, 'Helicopter transfer'); ts(3, daysAgo(2), 'site', 6, 4); ts(3, daysAgo(1), 'site', 10, 4);
  ts(4, daysAgo(0), 'office', 3, null, 'Validation des rapports');

  /* Planning : semaine dernière, semaine en cours, deux semaines à venir */
  const planning = []; let pid = 0;
  const monday = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
  const day = n => iso(new Date(monday.getTime() + n * 864e5));   // n = décalage depuis le lundi de la semaine en cours
  const pl = (user_id, s, e, kind, title, machine_id = null, status = 'planned', report_id = null, notes = null) =>
    planning.push({ id: ++pid, user_id, start_date: day(s), end_date: day(e), kind, status, title, machine_id, report_id, notes, created_by: 4 });
  pl(2, -7, -5, 'intervention', 'Remplacement roulements MPL 400', 4, 'done', 2);
  pl(2, -4, -4, 'office', 'Rédaction rapport + préparation pièces', null, 'done');
  pl(3, -7, -7, 'travel', 'Transfert hélicoptère Aberdeen → Platform Alpha', null, 'done');
  pl(3, -6, -3, 'intervention', 'Révision PG-350 – Platform Alpha', 5, 'done');
  pl(2, 0, 1, 'intervention', 'Expertise vibrations palier GV', 2, 'confirmed', 3, 'Accès tranche 2 : badge à retirer au poste de garde.');
  pl(2, 2, 2, 'office', 'Analyse des mesures vibratoires');
  pl(2, 3, 4, 'training', 'Formation alignement laser');
  pl(3, 0, 1, 'intervention', 'High vibration alarm – HS bearing NDE', 5, 'confirmed', 4);
  pl(3, 2, 2, 'travel', 'Retour Aberdeen');
  pl(3, 3, 4, 'standby', 'Astreinte UK');
  pl(2, 7, 7, 'travel', 'Trajet Épinal');
  pl(2, 8, 10, 'intervention', 'Remplacement train d’engrenages MPL 400', 4, 'planned', null, 'Pièces en commande – confirmer la livraison avec l’atelier.');
  pl(3, 7, 11, 'leave', 'Congés');
  pl(2, 14, 15, 'intervention', 'Visite préventive EP-210', 3, 'planned');
  pl(3, 14, 18, 'intervention', 'Expertise HS-420 – Refinery Unit 400', 6, 'planned', null, 'Visa US et habilitations raffinerie à vérifier.');

  /* Demandes de devis reçues par le site */
  const rfq = [
    { id: 1, number: `RFQ-${year}-0001`, company: 'Cimenterie Démo', contact_name: 'M. Lefebvre', email: 'maintenance@ciment-demo.example', phone: '+33 3 00 00 00 01',
      country: 'FR', location: 'Dunkerque', manufacturer: 'Lufkin', model: 'MC-1250', serial: 'DM-2009-05140', application: 'Broyeur à boulets cru',
      service: 'inspection', urgency: 'normal', desired_date: day(21), description: 'Inspection des dentures et des paliers lors de l’arrêt annuel du four 2 (5 jours). Merci de prévoir l’endoscopie et le relevé de portée.',
      status: 'new', notes: null, assigned_to: null, created_at: day(-1) + 'T09:12:00Z' },
    { id: 2, number: `RFQ-${year}-0002`, company: 'Hydro Demo Energy', contact_name: 'Mr. Olsen', email: 'olsen@hydro-demo.example', phone: '',
      country: 'NO', location: 'Bergen', manufacturer: 'Allen Gears', model: 'Allen TG-30', serial: '', application: 'Turbo-alternateur',
      service: 'spare_parts', urgency: 'normal', desired_date: '', description: 'Quotation for a spare set of HS journal bearings and thrust pads.',
      status: 'in_progress', notes: 'Plan de l’appareil demandé au client pour identifier les références.', assigned_to: 4, created_at: day(-6) + 'T14:40:00Z' },
    { id: 3, number: `RFQ-${year}-0003`, company: 'Gulf Demo Refining', contact_name: 'Ms. Garcia', email: 'maint@gulf-demo.example', phone: '+1 713 000 0000',
      country: 'US', location: 'Houston, TX', manufacturer: 'Lufkin', model: 'HS-420', serial: 'DM-2017-09901', application: 'Compresseur centrifuge',
      service: 'repair', urgency: 'emergency', desired_date: day(3), description: 'Unit down since last week, HS pinion damaged. Need urgent repair or exchange pinion and field service for reassembly.',
      status: 'quoted', notes: 'Devis atelier + intervention envoyé. Relancer vendredi.', assigned_to: 4, created_at: day(-9) + 'T07:05:00Z' }
  ];

  return {
    format: 'fieldservice-export', version: 1, demo: true,
    tables: {
      users, clients, sites, machines, reports, timesheets, planning, rfq,
      settings: { company_name: 'Lufkin Gears · Allen Gears (démo)', company_address: '1 rue de l’Exemple\n70000 Démoville', company_contact: '+33 0 00 00 00 00 · service@demo.example', report_prefix: 'RI', logo: '' }
    },
    photos
  };
}
