/* Traductions FR / EN. Ajoutez une langue en copiant le bloc "en". */
const DICT = {
  fr: {
    app_name: 'Field Service',
    nav_dashboard: 'Accueil', nav_installed: 'Base installée', nav_reports: 'Rapports',
    nav_hours: 'Heures', nav_settings: 'Réglages', logout: 'Déconnexion',
    login_title: 'Connexion', login_user: 'Identifiant', login_pass: 'Mot de passe', login_btn: 'Se connecter',
    login_hint: 'Premier lancement : identifiant « admin », mot de passe « admin ».',
    hello: 'Bonjour', new_report: 'Nouveau rapport', new_entry: 'Saisir des heures',
    kpi_drafts: 'Mes brouillons', kpi_to_validate: 'À valider', kpi_month: 'Rapports ce mois',
    kpi_hours_week: 'Mes heures cette semaine', kpi_machines: 'Machines suivies', kpi_alert: 'en alerte',
    recent_reports: 'Activité récente', see_all: 'Tout voir', none: 'Rien pour le moment.',
    search: 'Rechercher…', all: 'Tous', all_f: 'Toutes',
    machines: 'Machines', clients_sites: 'Clients et sites', client: 'Client', clients: 'Clients', site: 'Site', sites: 'Sites',
    machine: 'Machine', serial: 'N° de série', model: 'Modèle', type: 'Type', application: 'Application',
    power: 'Puissance (kW)', ratio: 'Rapport de réduction', commissioning: 'Mise en service', status: 'Statut',
    notes: 'Notes', address: 'Adresse', city: 'Ville', country: 'Pays', contact: 'Contact', phone: 'Téléphone',
    email: 'E-mail', name: 'Nom', add_machine: 'Ajouter une machine', add_client: 'Ajouter un client',
    add_site: 'Ajouter un site', edit: 'Modifier', archive: 'Archiver', save: 'Enregistrer', cancel: 'Annuler',
    delete: 'Supprimer', close: 'Fermer', back: 'Retour', confirm_archive: 'Archiver cet élément ? Il ne sera plus proposé.',
    last_intervention: 'Dernière intervention', history: 'Historique des interventions', interventions: 'interventions',
    ms_in_service: 'En service', ms_watch: 'À surveiller', ms_down: 'En panne', ms_stopped: 'Arrêtée',
    reports: 'Rapports', report: 'Rapport', date: 'Date', end_date: 'Date de fin', title: 'Objet', technicians: 'Techniciens',
    rt_preventive: 'Préventive', rt_curative: 'Curative', rt_commissioning: 'Mise en service', rt_expertise: 'Expertise',
    rs_draft: 'Brouillon', rs_done: 'Terminé', rs_validated: 'Validé', mine_only: 'Mes rapports',
    step_machine: 'Machine', step_content: 'Contenu', step_sign: 'Signature',
    choose_client: 'Choisir un client', choose_site: 'Choisir un site', choose_machine: 'Choisir une machine',
    no_machine: 'Aucune machine sur ce site.', change: 'Changer',
    sections: 'Sections du rapport', add_section: 'Ajouter une section', section_title: 'Titre de la section',
    section_text: 'Texte', add_photo: 'Photo', take_photo: 'Prendre / ajouter des photos', caption: 'Légende',
    add_row: 'Ajouter une ligne', measure: 'Mesure', value: 'Valeur', tolerance: 'Tolérance / attendu',
    part_ref: 'Référence', part_desc: 'Désignation', qty: 'Qté',
    sk_text: 'Texte et photos', sk_measures: 'Tableau de mesures', sk_parts: 'Pièces remplacées',
    move_up: 'Monter', move_down: 'Descendre', remove: 'Retirer',
    signature: 'Signature du client', signer_name: 'Nom du signataire', clear: 'Effacer', sign_here: 'Signez ici',
    signed_on: 'Signé le', mark_done: 'Marquer terminé', validate: 'Valider', reopen: 'Rouvrir',
    preview_pdf: 'Aperçu / PDF', print_pdf: 'Imprimer / Enregistrer en PDF', saved: 'Enregistré', saving: 'Enregistrement…',
    autosave: 'Enregistrement automatique', confirm_delete_report: 'Supprimer ce brouillon et ses photos ?',
    report_locked: 'Ce rapport est validé : il n’est plus modifiable.', report_readonly: 'Lecture seule : vous ne faites pas partie des techniciens de ce rapport.', hours_linked: 'Heures rattachées',
    template: 'Modèle', template_hint: 'Le modèle pré-remplit les sections selon le type d’intervention.',
    hours: 'Heures', week: 'Semaine', total: 'Total', kind: 'Nature', duration: 'Durée (h)', linked_report: 'Rapport lié',
    hk_site: 'Sur site', hk_travel: 'Trajet', hk_waiting: 'Attente', hk_office: 'Bureau',
    hs_entered: 'Saisi', hs_validated: 'Validé', validate_week: 'Valider la semaine', export_csv: 'Exporter (Excel)',
    technician: 'Technicien', all_techs: 'Tous les techniciens', today: 'Aujourd’hui', no_report: 'Aucun',
    prev_week: 'Semaine précédente', next_week: 'Semaine suivante', week_validated: 'Semaine validée',
    settings: 'Réglages', company: 'Entreprise', company_name: 'Nom affiché sur les rapports',
    company_address: 'Adresse', company_contact: 'Contact (téléphone, e-mail)', report_prefix: 'Préfixe des numéros de rapport',
    logo: 'Logo', choose_logo: 'Choisir un logo', remove_logo: 'Retirer le logo',
    my_account: 'Mon compte', language: 'Langue', theme: 'Thème', theme_auto: 'Automatique', theme_light: 'Clair', theme_dark: 'Sombre',
    change_password: 'Changer mon mot de passe', current_password: 'Mot de passe actuel', new_password: 'Nouveau mot de passe',
    must_change: 'Pour sécuriser votre compte, choisissez un nouveau mot de passe.',
    users: 'Utilisateurs', add_user: 'Ajouter un utilisateur', role: 'Rôle', active: 'Actif', inactive: 'Inactif',
    role_technician: 'Technicien', role_manager: 'Responsable', role_admin: 'Administrateur',
    temp_password: 'Mot de passe provisoire', reset_password: 'Nouveau mot de passe provisoire',
    install_app: 'Installer l’application', offline: 'Hors connexion – les modifications ne peuvent pas être enregistrées.',
    error: 'Erreur', required: 'Champ obligatoire', loading: 'Chargement…',
    print_title: 'Rapport d’intervention', intervention: 'Intervention', page: 'Page',
    created_by: 'Rédigé par', none_short: '—', confirm: 'Confirmation',
    report_header: 'En-tête du rapport', order_no: 'OV N° / N° de commande', prepared_by: 'De Mr / Rédigé par',
    accompanied_by: 'Accompagné de', direct_customer: 'Client direct', end_user: 'Utilisateur',
    installation_type: 'Genre d’installation', persons_met: 'Personnes rencontrées / contact site',
    line_of_business: 'Domaine d’activité', purpose: 'But de la visite', report_no: 'N° de rapport',
    print_title_std: 'Rapport de visite ou de montage', summary_band: 'Résumé de l’entretien, des constatations ou de l’intervention',
    add_sub: 'Ajouter une sous-section', sub_text: 'Texte et photos', sub_measures: 'Relevé de mesures',
    fixed_section: 'Section imposée par la trame', nothing: 'Néant', std_template: 'Trame standard des rapports',
    template_hint_std: 'Tous les rapports suivent la même trame en 13 points. Les sections vides sont imprimées avec la mention « Néant ».',
    eq_type: 'Type matériel', eq_order: 'N° commande d’origine', eq_serial: 'N° de matricule', eq_hours: 'Nb heures', eq_obs: 'Observations',
    demo_empty_title: 'Aucune donnée sur cet appareil', demo_load: 'Charger les données de démonstration',
    demo_empty_text: 'Chargez la démonstration (clients, machines, rapports, heures fictifs) pour essayer l’application, ou créez vos propres clients et machines dans Base installée.',
    photo_credit: 'Photo', choose_profile: 'Choisir un profil', demo_accounts: 'Comptes de démonstration (cliquez pour vous connecter)',
    local_hint: 'Les comptes et les données sont enregistrés uniquement dans ce navigateur, sur cet appareil.',
    summary_title: 'Synthèse du rapport', summary_generate: 'Générer automatiquement',
    summary_hint: 'Résumé en quelques points, imprimé en tête du rapport et affiché dans l’historique de la machine. Générez-le à partir du contenu puis retouchez-le (ou dictez-le).',
    summary_ph: 'Laissez vide pour une synthèse automatique.', summary_replace: 'Remplacer la synthèse actuelle par une synthèse générée ?',
    mh_next: 'Prochaine intervention planifiée',
    dict_start: 'Dicter (micro)', dict_stop: 'Arrêter', dict_listening: 'Je vous écoute… dites « point suivant » pour une nouvelle puce',
    dict_bullets: 'Mettre en points', dict_denied: 'Micro refusé : autorisez le micro pour ce site dans le navigateur.', dict_error: 'Dictée interrompue',
    nav_planning: 'Planning', plan_add: 'Planifier une mission', plan_title: 'Mission / objet', plan_title_ph: 'Ex. : révision réducteur PG-500',
    plan_sub_manager: 'Planning de l’équipe : cliquez sur une case pour planifier, sur une mission pour la modifier.',
    plan_sub_tech: 'Vos missions planifiées. Ouvrez une intervention pour créer son rapport.',
    pk_intervention: 'Intervention', pk_travel: 'Trajet', pk_training: 'Formation', pk_office: 'Bureau', pk_standby: 'Astreinte', pk_leave: 'Congés',
    ps_planned: 'Prévu', ps_confirmed: 'Confirmé', ps_done: 'Réalisé',
    plan_weeks_1: 'Semaine', plan_weeks_2: '2 semaines', plan_weeks_4: '4 semaines', plan_days: 'j. occupés',
    plan_create_report: 'Créer le rapport', plan_open_report: 'Ouvrir le rapport', plan_mark_done: 'Marquer réalisé',
    plan_upcoming: 'Planning à venir', plan_none: 'Rien de planifié.', plan_conflict: 'Chevauchement de missions', demo_reset: 'Réinitialiser la démo',
    demo_hint: 'Version de démonstration : données fictives, enregistrées uniquement dans ce navigateur. Chaque compte a ses droits : un technicien rédige ses rapports et voit son planning, un responsable valide et planifie l’équipe, l’administrateur gère les réglages et les utilisateurs.',
    demo_reset_confirm: 'Effacer toutes les données de cet appareil et recharger les données de démonstration ?',
    backup: 'Sauvegarde et transfert', backup_export: 'Exporter toutes les données', backup_import: 'Importer une sauvegarde',
    backup_hint_local: 'Les données sont enregistrées uniquement dans ce navigateur, sur cet appareil. Exportez-les régulièrement : le fichier sert de sauvegarde et permet de les transférer sur un autre appareil.',
    backup_hint_server: 'Crée un fichier avec la base installée, les rapports, les photos et les heures. Il peut être importé dans la version en ligne (GitHub Pages).',
    backup_confirm: 'Importer ce fichier remplace toutes les données de cet appareil. Continuer ?',
    manufacturer: 'Marque / constructeur', speeds: 'Vitesses entrée / sortie (tr/min)',
    jr_work: 'Travaux réalisés', jr_hazard: 'Aléas (h)',
    site_note: 'Sur site : note du jour', site_note_hint: 'Chaque note s’ajoute au journal et prépare le brouillon du rapport.',
    note_target: 'Ranger aussi dans la section', note_journal_only: 'Journal uniquement (12. Déroulement)',
    note_text: 'Travaux réalisés / constat', note_ph: 'Ex. : dépose ligne d’arbre PV, jeu de denture relevé 0,27 mm…',
    note_add: 'Ajouter au rapport', note_added: 'Note ajoutée au rapport', note_empty: 'Écrivez une note ou ajoutez une photo.',
    rp_desc: 'Pièce', rp_ref: 'N° pièce / traçabilité', rp_order: 'N° commande', rp_origin: 'Origine'
  },
  en: {
    app_name: 'Field Service',
    nav_dashboard: 'Home', nav_installed: 'Installed base', nav_reports: 'Reports',
    nav_hours: 'Hours', nav_settings: 'Settings', logout: 'Sign out',
    login_title: 'Sign in', login_user: 'Username', login_pass: 'Password', login_btn: 'Sign in',
    login_hint: 'First run: username “admin”, password “admin”.',
    hello: 'Hello', new_report: 'New report', new_entry: 'Log hours',
    kpi_drafts: 'My drafts', kpi_to_validate: 'To validate', kpi_month: 'Reports this month',
    kpi_hours_week: 'My hours this week', kpi_machines: 'Machines tracked', kpi_alert: 'on alert',
    recent_reports: 'Recent activity', see_all: 'See all', none: 'Nothing yet.',
    search: 'Search…', all: 'All', all_f: 'All',
    machines: 'Machines', clients_sites: 'Customers & sites', client: 'Customer', clients: 'Customers', site: 'Site', sites: 'Sites',
    machine: 'Machine', serial: 'Serial no.', model: 'Model', type: 'Type', application: 'Application',
    power: 'Power (kW)', ratio: 'Gear ratio', commissioning: 'Commissioning', status: 'Status',
    notes: 'Notes', address: 'Address', city: 'City', country: 'Country', contact: 'Contact', phone: 'Phone',
    email: 'Email', name: 'Name', add_machine: 'Add machine', add_client: 'Add customer',
    add_site: 'Add site', edit: 'Edit', archive: 'Archive', save: 'Save', cancel: 'Cancel',
    delete: 'Delete', close: 'Close', back: 'Back', confirm_archive: 'Archive this item? It will no longer be offered.',
    last_intervention: 'Last intervention', history: 'Intervention history', interventions: 'interventions',
    ms_in_service: 'In service', ms_watch: 'Watch', ms_down: 'Down', ms_stopped: 'Stopped',
    reports: 'Reports', report: 'Report', date: 'Date', end_date: 'End date', title: 'Subject', technicians: 'Technicians',
    rt_preventive: 'Preventive', rt_curative: 'Corrective', rt_commissioning: 'Commissioning', rt_expertise: 'Expertise',
    rs_draft: 'Draft', rs_done: 'Completed', rs_validated: 'Validated', mine_only: 'My reports',
    step_machine: 'Machine', step_content: 'Content', step_sign: 'Signature',
    choose_client: 'Choose a customer', choose_site: 'Choose a site', choose_machine: 'Choose a machine',
    no_machine: 'No machine on this site.', change: 'Change',
    sections: 'Report sections', add_section: 'Add section', section_title: 'Section title',
    section_text: 'Text', add_photo: 'Photo', take_photo: 'Take / add photos', caption: 'Caption',
    add_row: 'Add row', measure: 'Measurement', value: 'Value', tolerance: 'Tolerance / expected',
    part_ref: 'Part no.', part_desc: 'Description', qty: 'Qty',
    sk_text: 'Text & photos', sk_measures: 'Measurements table', sk_parts: 'Replaced parts',
    move_up: 'Move up', move_down: 'Move down', remove: 'Remove',
    signature: 'Customer signature', signer_name: 'Signatory name', clear: 'Clear', sign_here: 'Sign here',
    signed_on: 'Signed on', mark_done: 'Mark completed', validate: 'Validate', reopen: 'Reopen',
    preview_pdf: 'Preview / PDF', print_pdf: 'Print / Save as PDF', saved: 'Saved', saving: 'Saving…',
    autosave: 'Autosave', confirm_delete_report: 'Delete this draft and its photos?',
    report_locked: 'This report is validated and can no longer be edited.', report_readonly: 'Read only: you are not one of the technicians on this report.', hours_linked: 'Linked hours',
    template: 'Template', template_hint: 'The template pre-fills sections based on the intervention type.',
    hours: 'Hours', week: 'Week', total: 'Total', kind: 'Kind', duration: 'Duration (h)', linked_report: 'Linked report',
    hk_site: 'On site', hk_travel: 'Travel', hk_waiting: 'Waiting', hk_office: 'Office',
    hs_entered: 'Entered', hs_validated: 'Validated', validate_week: 'Validate week', export_csv: 'Export (Excel)',
    technician: 'Technician', all_techs: 'All technicians', today: 'Today', no_report: 'None',
    prev_week: 'Previous week', next_week: 'Next week', week_validated: 'Week validated',
    settings: 'Settings', company: 'Company', company_name: 'Name shown on reports',
    company_address: 'Address', company_contact: 'Contact (phone, email)', report_prefix: 'Report number prefix',
    logo: 'Logo', choose_logo: 'Choose a logo', remove_logo: 'Remove logo',
    my_account: 'My account', language: 'Language', theme: 'Theme', theme_auto: 'Automatic', theme_light: 'Light', theme_dark: 'Dark',
    change_password: 'Change my password', current_password: 'Current password', new_password: 'New password',
    must_change: 'To secure your account, please choose a new password.',
    users: 'Users', add_user: 'Add user', role: 'Role', active: 'Active', inactive: 'Inactive',
    role_technician: 'Technician', role_manager: 'Manager', role_admin: 'Administrator',
    temp_password: 'Temporary password', reset_password: 'New temporary password',
    install_app: 'Install app', offline: 'Offline – changes cannot be saved.',
    error: 'Error', required: 'Required field', loading: 'Loading…',
    print_title: 'Field service report', intervention: 'Intervention', page: 'Page',
    created_by: 'Written by', none_short: '—', confirm: 'Confirmation',
    report_header: 'Report header', order_no: 'Service order / PO no.', prepared_by: 'Prepared by',
    accompanied_by: 'Accompanied by', direct_customer: 'Direct customer', end_user: 'End user',
    installation_type: 'Type of installation', persons_met: 'Jobsite contact / persons met',
    line_of_business: 'Line of business', purpose: 'Purpose of visit', report_no: 'Report no.',
    print_title_std: 'Field service report', summary_band: 'Summary of findings and work performed',
    add_sub: 'Add sub-section', sub_text: 'Text & photos', sub_measures: 'Readings table',
    fixed_section: 'Section required by the template', nothing: 'None', std_template: 'Standard report template',
    template_hint_std: 'Every report follows the same 13-point template. Empty sections are printed as “None”.',
    eq_type: 'Make / type', eq_order: 'Original order no.', eq_serial: 'Serial no.', eq_hours: 'Running hours', eq_obs: 'Observations',
    demo_empty_title: 'No data on this device', demo_load: 'Load demo data',
    demo_empty_text: 'Load the demo (fictitious customers, machines, reports and hours) to try the app, or create your own customers and machines in Installed base.',
    photo_credit: 'Photo', choose_profile: 'Choose a profile', demo_accounts: 'Demo accounts (click to sign in)',
    local_hint: 'Accounts and data are stored only in this browser, on this device.',
    summary_title: 'Report summary', summary_generate: 'Generate automatically',
    summary_hint: 'A few key points, printed at the top of the report and shown in the machine history. Generate it from the content, then edit it (or dictate it).',
    summary_ph: 'Leave empty for an automatic summary.', summary_replace: 'Replace the current summary with a generated one?',
    mh_next: 'Next scheduled intervention',
    dict_start: 'Dictate (microphone)', dict_stop: 'Stop', dict_listening: 'Listening… say “next point” for a new bullet',
    dict_bullets: 'Convert to bullet points', dict_denied: 'Microphone blocked: allow the microphone for this site in your browser.', dict_error: 'Dictation stopped',
    nav_planning: 'Planning', plan_add: 'Schedule a job', plan_title: 'Job / subject', plan_title_ph: 'E.g. PG-500 gearbox overhaul',
    plan_sub_manager: 'Team schedule: click a cell to schedule, click a job to edit it.',
    plan_sub_tech: 'Your scheduled jobs. Open an intervention to create its report.',
    pk_intervention: 'Intervention', pk_travel: 'Travel', pk_training: 'Training', pk_office: 'Office', pk_standby: 'Standby', pk_leave: 'Leave',
    ps_planned: 'Planned', ps_confirmed: 'Confirmed', ps_done: 'Done',
    plan_weeks_1: 'Week', plan_weeks_2: '2 weeks', plan_weeks_4: '4 weeks', plan_days: 'days booked',
    plan_create_report: 'Create report', plan_open_report: 'Open report', plan_mark_done: 'Mark done',
    plan_upcoming: 'Upcoming schedule', plan_none: 'Nothing scheduled.', plan_conflict: 'Overlapping jobs', demo_reset: 'Reset demo',
    demo_hint: 'Demo version: fictitious data, stored only in this browser. Each profile has its own rights: technicians write reports, managers validate them, the administrator manages settings.',
    demo_reset_confirm: 'Erase all data on this device and reload the demo data?',
    backup: 'Backup & transfer', backup_export: 'Export all data', backup_import: 'Import a backup',
    backup_hint_local: 'Data is stored only in this browser, on this device. Export it regularly: the file is your backup and lets you move data to another device.',
    backup_hint_server: 'Creates a file with the installed base, reports, photos and hours. It can be imported into the online version (GitHub Pages).',
    backup_confirm: 'Importing this file replaces all data on this device. Continue?',
    manufacturer: 'Make / manufacturer', speeds: 'Input / output speed (rpm)',
    jr_work: 'Work performed', jr_hazard: 'Delays (h)',
    site_note: 'On site: daily note', site_note_hint: 'Each note is added to the daily log and builds the report draft.',
    note_target: 'Also file under section', note_journal_only: 'Daily log only (12)',
    note_text: 'Work performed / findings', note_ph: 'E.g. removed LS shaft line, backlash measured 0.27 mm…',
    note_add: 'Add to report', note_added: 'Note added to report', note_empty: 'Write a note or add a photo.',
    rp_desc: 'Part description', rp_ref: 'Part no. / traceability', rp_order: 'Order no.', rp_origin: 'Origin'
  }
};

let lang = localStorage.getItem('fs_lang') || (navigator.language || 'fr').slice(0, 2);
if (!DICT[lang]) lang = 'fr';

export function t(key) { return DICT[lang][key] ?? DICT.fr[key] ?? key; }
export function getLang() { return lang; }
export function setLang(l) {
  if (!DICT[l]) return;
  lang = l;
  try { localStorage.setItem('fs_lang', l); } catch {}
  document.documentElement.lang = l;
}
export const LANGS = { fr: 'Français', en: 'English' };

/* ============================================================
 * Trame standard des rapports (identique pour tous les rapports)
 * Reprend la structure des rapports « Rapport de visite ou de montage » /
 * « Field Service Report » : 11 sections fixes, dans cet ordre.
 * Section     : [clé, type, titre FR, titre EN, sous-sections]
 * Sous-section : [type, titre FR, titre EN, lignes FR?, lignes EN?]
 * ============================================================ */
const RDJ_FR = ['Jeu de denture', 'Jeu axial roulement PV', 'Jeu axial roulement GV'];
const RDJ_EN = ['Backlash', 'LS bearing axial clearance', 'HS bearing axial clearance'];
const STANDARD = [
  ['equipment', 'equipment', 'Identification du matériel', 'Equipment identification'],
  ['location', 'text', 'Position du matériel', 'Equipment location'],
  ['purpose', 'text', 'But de l’intervention / Conditions de fonctionnement', 'Purpose / Operating conditions'],
  ['appearance', 'text', 'Aspect extérieur', 'External appearance'],
  ['disassembly', 'text', 'Constat au démontage', 'Findings during disassembly', [
    ['measures', 'Relevé de jeux', 'Clearance readings', RDJ_FR, RDJ_EN]]],
  ['inspection', 'text', 'Expertise / Contrôle', 'Inspection / Checks', [
    ['text', 'État de l’huile', 'Oil condition'],
    ['text', 'État des roulements', 'Bearings condition'],
    ['text', 'État des engrenages', 'Gears condition'],
    ['text', 'État des portées de joint', 'Seal surfaces condition'],
    ['text', 'État des accouplements', 'Couplings condition']]],
  ['parts', 'replaced', 'Pièces remplacées', 'Replaced parts'],
  ['reassembly', 'text', 'Constat au remontage', 'Findings during reassembly', [
    ['measures', 'Relevé de jeux et portées de denture', 'Clearances and gear tooth contact',
      [...RDJ_FR, 'Portée de denture'], [...RDJ_EN, 'Gear tooth contact']],
    ['text', 'État des roulements', 'Bearings condition'],
    ['text', 'État des portées de joint', 'Seal surfaces condition'],
    ['text', 'État des accouplements', 'Couplings condition'],
    ['measures', 'Relevé d’alignement', 'Alignment readings',
      ['Concentricité / décalage horizontal', 'Parallélisme / angle horizontal', 'Concentricité / décalage vertical', 'Parallélisme / angle vertical', 'Épaisseur des cales'],
      ['Horizontal offset', 'Horizontal angularity', 'Vertical offset', 'Vertical angularity', 'Shim thickness']],
    ['measures', 'Couples de serrage et étanchéité', 'Bolt torques and sealing', ['Boulonnerie carter', 'Produit d’étanchéité'], ['Housing bolts', 'Sealant']]]],
  ['tests', 'text', 'Essais', 'Tests'],
  ['conclusions', 'text', 'Conclusions', 'Conclusions'],
  ['recommendations', 'text', 'Recommandations', 'Recommendations'],
  ['log', 'journal', 'Déroulement de l’intervention', 'Daily log'],
  ['appendix', 'text', 'Annexes', 'Appendices']
];

/* Colonnes des tableaux selon le type de section */
const COLS = {
  measures: ['measure', 'value', 'tolerance'],
  parts: ['part_ref', 'part_desc', 'qty'],                                   // anciens rapports
  equipment: ['eq_type', 'model', 'eq_order', 'eq_serial', 'eq_hours', 'eq_obs'],
  replaced: ['rp_desc', 'qty', 'rp_ref', 'rp_order', 'rp_origin'],
  journal: ['date', 'jr_work', 'jr_hazard']
};
export const isTableKind = kind => !!COLS[kind];
export const tableCols = kind => (COLS[kind] || []).map(k => t(k));

/* Titres des sections principales (pour l'aperçu) */
export function standardTitles(l = lang) {
  return STANDARD.map(x => l === 'en' ? x[3] : x[2]);
}

/* Construit les sections d'un nouveau rapport, pré-remplies avec la machine */
export function standardSections(machine = null, l = lang) {
  const en = l === 'en';
  const out = [];
  for (const [key, kind, fr, enT, subs = []] of STANDARD) {
    const s = newSection(kind, en ? enT : fr);
    s.key = key;
    if (key === 'equipment' && machine) {
      s.rows = [[[machine.manufacturer, machine.type].filter(Boolean).join(' – '), machine.model || '', machine.order_no || '', machine.serial || '', '', '']];
    }
    if (key === 'location' && machine) {
      s.text = [machine.site_name, machine.city].filter(Boolean).join(', ') + (machine.application ? '\n' + machine.application : '');
    }
    out.push(s);
    for (const [sk, sfr, sen, rfr, ren] of subs) {
      const sub = newSection(sk, en ? sen : sfr);
      sub.level = 2;
      const labels = en ? ren : rfr;
      if (labels) sub.rows = labels.map(l => [l, '', '']);
      out.push(sub);
    }
  }
  return out;
}

/* Rétro-compatibilité : l'ancien nom renvoie désormais la trame standard */
export function templateSections() { return standardSections(); }

/* Numérotation « 5 », « 5.1 »… (les anciens rapports sans trame restent 1, 2, 3…) */
export function sectionNumbers(sections) {
  let main = 0, sub = 0;
  return sections.map(s => {
    if (s.level === 2 && main) return `${main}.${++sub}`;
    main++; sub = 0; return String(main);
  });
}

export function newSection(kind = 'text', title = '') {
  const s = { id: 's' + Math.random().toString(36).slice(2, 9), kind, title, text: '', photos: [] };
  if (COLS[kind]) s.rows = [Array(COLS[kind].length).fill('')];
  return s;
}
