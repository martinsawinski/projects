import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { nextNumber } from '../lib/numbering.js';
import { invoiceBalance } from '../lib/invoice-balance.js';

export const credits = Router();

credits.post('/', (req,res)=>{
  const id = nanoid();
  const { customer_id, date, currency, notes, items } = req.body;
  const number = nextNumber('credit') || `CR-${Date.now()}`;
  db.prepare('INSERT INTO credit_notes(id, customer_id, number, date, currency, notes) VALUES (?,?,?,?,?,?)')
    .run(id, customer_id, number, date, currency ?? 'USD', notes);
  const ins = db.prepare('INSERT INTO credit_note_items(id, credit_note_id, description, amount_cents) VALUES (?,?,?,?)');
  for (const it of (items||[])) ins.run(nanoid(), id, it.description, it.amount_cents);
  res.status(201).json({ id, number });
});

credits.post('/apply', (req,res)=>{
  const { credit_note_id, invoice_id, amount_cents } = req.body;
  const id = nanoid();
  db.prepare('INSERT INTO credit_applications(id, credit_note_id, invoice_id, amount_cents) VALUES (?,?,?,?)')
    .run(id, credit_note_id, invoice_id, amount_cents);
  const bal = invoiceBalance(invoice_id);
  const status = bal.balance === 0 ? 'paid' : 'partial';
  db.prepare('UPDATE invoices SET status=? WHERE id=?').run(status, invoice_id);
  res.status(201).json({ id, status, balance: bal.balance });
});
