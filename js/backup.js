/* Sauvegarde complète (base installée, rapports, photos, heures, réglages) dans un fichier .json.
 * Fonctionne avec le serveur comme avec la version GitHub Pages : permet de transférer
 * les données de l'application installée sur le PC vers la version en ligne (et inversement). */
import { api } from './api.js';

const REPORT_KEYS = ['id', 'number', 'machine_id', 'date', 'end_date', 'type', 'status', 'title', 'technicians', 'sections', 'header',
  'signer_name', 'signature', 'signed_at', 'created_by', 'validated_by', 'created_at', 'updated_at'];
const keep = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
const strip = (rows, drop) => rows.map(r => Object.fromEntries(Object.entries(r).filter(([k]) => !drop.includes(k))));

async function toDataUrl(src) {
  if (!src || src.startsWith('data:')) return src || '';
  const blob = await (await fetch(src, { credentials: 'same-origin' })).blob();
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
}

export async function exportAll(onProgress = () => {}) {
  const [users, clients, sites, machines, reportList, timesheets, settings, planning, rfq] = await Promise.all([
    api.users.list(), api.clients.list({ archived: '1' }), api.sites.list({ archived: '1' }), api.machines.list({ archived: '1' }),
    api.reports.list(), api.timesheets.list({ user_id: 'all' }), api.settings.get(), api.planning.list({}).catch(() => []),
    api.rfq.list().catch(() => [])
  ]);
  const reports = [], photos = [];
  let i = 0;
  for (const r of reportList) {
    onProgress(++i, reportList.length);
    const full = await api.reports.full(r.id);
    reports.push(keep(full, REPORT_KEYS));
    for (const p of full.photos) {
      photos.push({ id: p.id, report_id: r.id, filename: p.filename, caption: p.caption,
        data: await toDataUrl(p.url || 'uploads/' + p.filename) });
    }
  }
  return {
    format: 'fieldservice-export', version: 1, exported_at: new Date().toISOString(),
    tables: {
      users: users.map(u => ({ ...u, active: u.active ? 1 : 0 })),
      clients: strip(clients, ['site_count', 'machine_count']),
      sites: strip(sites, ['client_name', 'machine_count']),
      machines: strip(machines, ['site_name', 'city', 'site_address', 'site_country', 'site_contact', 'client_id', 'client_name', 'last_intervention', 'report_count', 'reports']),
      reports,
      timesheets: strip(timesheets, ['user_name', 'user_country', 'report_number', 'client_name', 'site_name']),
      planning: strip(planning, ['user_name', 'serial', 'model', 'site_name', 'city', 'client_name', 'report_number']),
      rfq: strip(rfq, ['assigned_name']),
      settings
    },
    photos
  };
}

export function downloadJson(obj, name) {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
