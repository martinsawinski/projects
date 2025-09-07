import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import { nextNumber } from '../lib/numbering.js';

const publicQuotes = Router();
export default publicQuotes;

publicQuotes.get('/accept/:token', (req,res)=>{
  const q = db.prepare('SELECT * FROM quotes WHERE accept_token=?').get(req.params.token);
  if (!q) return res.status(404).send('Invalid or expired link');
  if (q.status === 'accepted') return res.send('Quote already accepted.');
  const poId = nanoid();
  const po_number = nextNumber('po');
  db.prepare(`INSERT INTO purchase_orders(id, project_id, po_number, status, currency, notes) VALUES(?,?,?,?,?,?)`).run(poId, q.project_id, po_number, 'open', q.currency, q.notes);
  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all(q.id);
  const ins = db.prepare(`INSERT INTO po_items(id, po_id, kind, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata) VALUES(?,?,?,?,?,?,?,?,?, json(?))`);
  for (const it of items){
    ins.run(nanoid(), poId, it.kind, it.description, it.quantity, it.unit, it.unit_price_cents, it.discount_cents ?? 0, it.taxable ?? 1, it.metadata);
  }
  db.prepare(`UPDATE quotes SET status='accepted' WHERE id=?`).run(q.id);
  res.send(`Thank you! Quote accepted. Your PO # is ${po_number}.`);
});
