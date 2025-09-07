import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { invoiceBalance } from '../lib/invoice-balance.js';

export const payments = Router();

payments.get('/invoice/:id', (req,res)=>{
  const rows = db.prepare('SELECT * FROM payments WHERE invoice_id=? ORDER BY date').all(req.params.id);
  const bal = invoiceBalance(req.params.id);
  res.json({ payments: rows, ...bal });
});

payments.post('/', (req,res)=>{
  const { invoice_id, date, amount_cents, method, reference, notes } = req.body;
  const id = nanoid();
  db.prepare('INSERT INTO payments(id, invoice_id, date, amount_cents, method, reference, notes) VALUES (?,?,?,?,?,?,?)')
    .run(id, invoice_id, date, amount_cents, method, reference, notes);
  const bal = invoiceBalance(invoice_id);
  const status = bal.balance === 0 ? 'paid' : 'partial';
  db.prepare('UPDATE invoices SET status=? WHERE id=?').run(status, invoice_id);
  res.status(201).json({ id, status, balance: bal.balance });
});

payments.put('/:id', (req,res)=>{
  const { amount_cents, method, reference, date, notes } = req.body;
  const p = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error:'Not found' });
  db.prepare('UPDATE payments SET amount_cents=COALESCE(?, amount_cents), method=COALESCE(?, method), reference=COALESCE(?, reference), date=COALESCE(?, date), notes=COALESCE(?, notes) WHERE id=?')
    .run(amount_cents, method, reference, date, notes, req.params.id);
  const bal = invoiceBalance(p.invoice_id);
  const status = bal.balance === 0 ? 'paid' : 'partial';
  db.prepare('UPDATE invoices SET status=? WHERE id=?').run(status, p.invoice_id);
  res.json({ ok:true, balance: bal.balance });
});

payments.delete('/:id', (req,res)=>{
  const p = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error:'Not found' });
  db.prepare('DELETE FROM payments WHERE id=?').run(req.params.id);
  const bal = invoiceBalance(p.invoice_id);
  const status = bal.balance === 0 ? 'paid' : 'partial';
  db.prepare('UPDATE invoices SET status=? WHERE id=?').run(status, p.invoice_id);
  res.json({ ok:true, balance: bal.balance });
});
