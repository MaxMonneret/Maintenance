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
    { id: 4, name: 'Gulf Demo Refining', country: 'US', address: 'Houston, TX', contact: 'Ms. Garcia', phone: '+1 713 000 0000', email: 'maint@gulf-demo.example' }
  ].map(x => ({ ...x, archived: 0 }));
  const sites = [
    { id: 1, client_id: 1, name: 'Centrale thermique – Unité 2', city: 'Lyon', country: 'FR', contact: 'M. Petit (chef de quart)' },
    { id: 2, client_id: 1, name: 'Station de pompage Est', city: 'Mâcon', country: 'FR', contact: 'M. Roux' },
    { id: 3, client_id: 2, name: 'Machine à papier PM3', city: 'Épinal', country: 'FR', contact: 'Mme Laurent, M. Henry' },
    { id: 4, client_id: 3, name: 'Platform Alpha', city: 'Offshore', country: 'UK', contact: 'OIM' },
    { id: 5, client_id: 4, name: 'Refinery – Unit 400', city: 'Houston', country: 'US', contact: 'Area supervisor' }
  ].map(x => ({ ...x, archived: 0 }));
  const M = (id, site_id, serial, manufacturer, model, order_no, type, application, power_kw, ratio, speeds, commissioning_date, status, notes = '') =>
    ({ id, site_id, serial, manufacturer, model, order_no, type, application, power_kw, ratio, speeds, commissioning_date, status, notes, archived: 0 });
  const machines = [
    M(1, 1, 'DM-2014-08812', 'Lufkin', 'PG-500', 'CD-14-0412', 'Réducteur parallèle', 'Turbine / alternateur', 12500, '3,15:1', '4725 / 1500', '2014-06-12', 'in_service'),
    M(2, 1, 'DM-2014-08813', 'Lufkin', 'PG-500', 'CD-14-0412', 'Réducteur parallèle', 'Turbine / alternateur', 12500, '3,15:1', '4725 / 1500', '2014-06-12', 'watch', 'Vibrations palier GV côté accouplement à surveiller.'),
    M(3, 2, 'DM-2019-10457', 'Lufkin', 'EP-210', 'CD-19-1180', 'Réducteur épicycloïdal', 'Pompe d’alimentation', 2200, '5,6:1', '1490 / 266', '2019-03-02', 'in_service'),
    M(4, 3, 'DM-2008-03312', 'Comélor', 'MPL 400', '08-21004-01', 'Réducteur', 'Moteur – réducteur – enrouleuse', 450, '16:1', '1480 / 92', '2008-09-15', 'watch', 'Pitting évolutif sur la roue PV : prévoir le remplacement du train d’engrenages.'),
    M(5, 4, 'DM-2011-07720', 'Lufkin', 'PG-350', 'CD-11-0907', 'Multiplicateur', 'Compresseur gaz', 8400, '1:2,4', '1490 / 3576', '2011-09-20', 'in_service'),
    M(6, 5, 'DM-2017-09901', 'Lufkin', 'HS-420', 'CD-17-2210', 'Réducteur à arbres parallèles', 'Compresseur centrifuge', 6000, '1:3,8', '1785 / 6783', '2017-11-05', 'down', 'Arrêt en attente de pièces (pignon GV).')
  ];

  const photos = []; // { id, report_id, filename, caption, data }
  const ph = (rid, kind, caption) => {
    const id = photos.length + 1;
    photos.push({ id, report_id: rid, filename: `demo-${id}`, caption, created_by: 1, data: PHOTOS[kind](caption).toDataURL('image/jpeg', .8) });
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
    sub('inspection', 3).photos = [ph(1, 'gear', 'Denture roue GV par la trappe de visite'), ph(1, 'contact', 'Relevé de portée au bleu')];
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
    sub('inspection', 2).photos = [ph(2, 'bearing', 'Roulement PV type 22318 – usure des galets'), ph(2, 'bearing', 'Roulement GV type 22222')];
    sub('inspection', 3).text = 'Pitting évolutif sur la roue PV, quelques traces de chocs. Pas de mobile de rechange chez le client.';
    sub('inspection', 3).photos = [ph(2, 'gear', 'Roue PV – pitting évolutif')];
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

  return {
    format: 'fieldservice-export', version: 1, demo: true,
    tables: {
      users, clients, sites, machines, reports, timesheets,
      settings: { company_name: 'Lufkin Gears · Allen Gears (démo)', company_address: '1 rue de l’Exemple\n70000 Démoville', company_contact: '+33 0 00 00 00 00 · service@demo.example', report_prefix: 'RI', logo: '' }
    },
    photos
  };
}
