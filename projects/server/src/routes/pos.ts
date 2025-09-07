import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import { nextNumber } from '../lib/numbering.js';

export const pos = Router();

pos.get('/', (_req, res) => {
  const rows = db.prepare(`SELECT * FROM purchase_orders ORDER BY issue_date DESC`).all();
  res.json(rows);
});

pos.get('/:id', (req,res)=>{
  const po = db.prepare('SELECT * FROM purchase_orders WHERE id=?').get(req.params.id);
  if (!po) return res.status(404).json({ error:'Not found' });
  const items = db.prepare('SELECT * FROM po_items WHERE po_id=? ORDER BY rowid').all(req.params.id);
  res.json({ po, items });
});

pos.post('/', (req, res) => {
  const id = nanoid();
  const { project_id, po_number, status, currency, notes } = req.body;
  const number = po_number || nextNumber('po');
  db.prepare(`INSERT INTO purchase_orders (id, project_id, po_number, status, currency, notes) VALUES (?,?,?,?,?,?)`).run(id, project_id, number, status ?? 'draft', currency ?? 'USD', notes);
  res.status(201).json({ id, po_number: number });
});

pos.post('/:id/items', (req, res) => {
  const id = nanoid();
  const { kind, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata } = req.body;
  db.prepare(`INSERT INTO po_items (id, po_id, kind, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata) VALUES (?,?,?,?,?,?,?,?,?,json(?))`).run(id, req.params.id, kind, description, quantity ?? 1, unit, unit_price_cents ?? 0, discount_cents ?? 0, (taxable??1), JSON.stringify(metadata ?? {}));
  res.status(201).json({ id });
});
