import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';

export const customers = Router();

customers.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM customers ORDER BY name').all();
  res.json(rows);
});

customers.get('/:id', (req,res)=>{
  const row = db.prepare('SELECT * FROM customers WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error:'Not found' });
  res.json(row);
});

customers.post('/', (req, res) => {
  const id = nanoid();
  const { brand_id, name, email, phone, billing_address, shipping_address, notes, default_tax_rate_bps, default_terms } = req.body;
  db.prepare(`INSERT INTO customers (id, brand_id, name, email, phone, billing_address, shipping_address, notes, default_tax_rate_bps, default_terms) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, brand_id, name, email, phone, billing_address, shipping_address, notes, default_tax_rate_bps, default_terms);
  res.status(201).json({ id });
});

customers.put('/:id', (req,res)=>{
  const { name, email, phone, billing_address, shipping_address, notes, default_tax_rate_bps, default_terms } = req.body;
  const sql = `UPDATE customers SET
    name=COALESCE(?, name), email=COALESCE(?, email), phone=COALESCE(?, phone),
    billing_address=COALESCE(?, billing_address), shipping_address=COALESCE(?, shipping_address),
    notes=COALESCE(?, notes), default_tax_rate_bps=COALESCE(?, default_tax_rate_bps), default_terms=COALESCE(?, default_terms)
    WHERE id=?`;
  db.prepare(sql).run(name, email, phone, billing_address, shipping_address, notes, default_tax_rate_bps, default_terms, req.params.id);
  res.json({ ok:true });
});
