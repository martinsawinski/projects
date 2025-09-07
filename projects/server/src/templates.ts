import { db } from './db.js';

export function getTemplate(kind: 'invoice'|'po'|'quote') {
  const row = db.prepare(`SELECT body_hbs, brand_css FROM templates WHERE kind = ? ORDER BY created_at DESC LIMIT 1`).get(kind);
  if (row) return row;
  // fallback
  return { body_hbs: '', brand_css: '' };
}
