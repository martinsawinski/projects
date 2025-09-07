import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import { compileTemplate, renderPdf } from '../pdf.js';
import { getTemplate } from '../templates.js';
import { nextNumber } from '../lib/numbering.js';
import { invoiceBalance } from '../lib/invoice-balance.js';

export const invoices = Router();

invoices.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM invoices ORDER BY issue_date DESC').all());
});

invoices.get('/:id', (req, res) => {
  const inv = db.prepare('SELECT * FROM invoices WHERE id=?').get(req.params.id);
  if (!inv) return res.status(404).json({ error:'Not found' });
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id=? ORDER BY rowid').all(req.params.id);
  const bal = invoiceBalance(req.params.id);
  res.json({ invoice: inv, items, ...bal });
});

invoices.post('/', (req, res) => {
  const id = nanoid();
  const { project_id, invoice_number, status, due_date, currency, po_id, notes, tax_rate_bps, discount_cents } = req.body;
  // default from customer via project
  const proj = db.prepare('SELECT p.*, c.default_tax_rate_bps, c.default_terms FROM projects p JOIN customers c ON c.id=p.customer_id WHERE p.id=?').get(project_id);
  const num = invoice_number || nextNumber('invoice');
  const tr = (tax_rate_bps ?? proj?.default_tax_rate_bps ?? 0);
  const terms = (proj?.default_terms || 'NET 30');
  const m = /NET\s*(\d+)/i.exec(terms||''); const days = m ? parseInt(m[1],10) : 30;
  const d = new Date(); d.setDate(d.getDate()+days); const due = due_date || d.toISOString().slice(0,10);
  db.prepare(`INSERT INTO invoices (id, project_id, invoice_number, status, due_date, currency, po_id, notes, tax_rate_bps, discount_cents) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, project_id, num, status ?? 'draft', due, currency ?? 'USD', po_id ?? null, notes, tr, discount_cents ?? 0);
  res.status(201).json({ id, invoice_number: num });
});

invoices.post('/:id/items', (req, res) => {
  const id = nanoid();
  const { source_kind, source_id, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata } = req.body;
  db.prepare(`INSERT INTO invoice_items (id, invoice_id, source_kind, source_id, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata) VALUES (?,?,?,?,?,?,?,?,?,?, json(?))`).run(id, req.params.id, source_kind, source_id, description, quantity ?? 1, unit, unit_price_cents ?? 0, discount_cents ?? 0, (taxable??1), JSON.stringify(metadata ?? {}));
  res.status(201).json({ id });
});

// Convert PO → Invoice
invoices.post('/from-po/:poId', (req, res) => {
  const poId = req.params.poId;
  const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(poId);
  if (!po) return res.status(404).json({ error: 'PO not found' });
  const invoiceId = nanoid();
  const invoiceNumber = req.body.invoice_number ?? nextNumber('invoice');
  db.prepare(`INSERT INTO invoices (id, project_id, invoice_number, status, currency, po_id, notes) VALUES (?,?,?,?,?,?,?)`) 
    .run(invoiceId, po.project_id, invoiceNumber, 'draft', po.currency, po.id, po.notes);
  const items = db.prepare('SELECT * FROM po_items WHERE po_id = ?').all(poId);
  const ins = db.prepare(`INSERT INTO invoice_items (id, invoice_id, source_kind, source_id, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata) VALUES (?,?,?,?,?,?,?,?,?,?, json(?))`);
  for (const it of items) {
    ins.run(nanoid(), invoiceId, 'po_item', it.id, it.description, it.quantity, it.unit, it.unit_price_cents, it.discount_cents ?? 0, it.taxable ?? 1, JSON.stringify(it.metadata ?? {}));
  }
  res.status(201).json({ id: invoiceId, invoice_number: invoiceNumber });
});

// Collect unbilled time & events
invoices.post('/:id/collect', (req, res) => {
  const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  const time = db.prepare(`SELECT * FROM time_entries WHERE project_id = ? AND billable = 1 AND invoiced = 0`).all(inv.project_id);
  const events = db.prepare(`SELECT * FROM events WHERE project_id = ? AND billable = 1 AND invoiced = 0`).all(inv.project_id);
  const ins = db.prepare(`INSERT INTO invoice_items (id, invoice_id, source_kind, source_id, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata) VALUES (?,?,?,?,?,?,?,?,?,?, json(?))`);
  for (const t of time) {
    const qty = Math.round((t.seconds / 3600) * 1000) / 1000;
    ins.run(nanoid(), inv.id, 'time_entry', t.id, t.description ?? 'Time', qty, 'hours', t.rate_cents ?? 0, 0, 1, JSON.stringify({ date: t.date }));
    db.prepare('UPDATE time_entries SET invoiced = 1 WHERE id = ?').run(t.id);
  }
  for (const e of events) {
    ins.run(nanoid(), inv.id, 'event', e.id, e.description ?? e.kind, 1, 'each', e.amount_cents, 0, 1, JSON.stringify({ date: e.date }));
    db.prepare('UPDATE events SET invoiced = 1 WHERE id = ?').run(e.id);
  }
  res.json({ added_time: time.length, added_events: events.length });
});

// Render Invoice PDF
invoices.get('/:id/pdf', async (req, res) => {
  const inv = db.prepare(`SELECT i.*, p.name as project_name, c.* FROM invoices i
    JOIN projects p ON p.id = i.project_id
    JOIN customers c ON c.id = p.customer_id
    WHERE i.id = ?`).get(req.params.id);
  if (!inv) return res.status(404).send('Not found');
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(req.params.id);
  const { body_hbs, brand_css } = getTemplate('invoice');
  const lines = items.map((it:any)=>({ ...it, amount_cents: Math.max(0, Math.round((it.quantity||0) * (it.unit_price_cents||0)) - (it.discount_cents||0)) }));
  const html = await compileTemplate('invoice-default.hbs', { inv, items: lines, extra_css: brand_css });
  const pdfBuf = await renderPdf(html);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${inv.invoice_number ?? 'invoice'}.pdf"`);
  res.send(pdfBuf);
});

// Email invoice
import { sendMail } from '../lib/mailer.js';
invoices.post('/:id/send', async (req,res)=>{
  const { to, message } = req.body as { to: string|string[], message?: string };
  const inv = db.prepare(`SELECT i.*, p.name as project_name, c.* FROM invoices i JOIN projects p ON p.id=i.project_id JOIN customers c ON c.id=p.customer_id WHERE i.id=?`).get(req.params.id);
  if (!inv) return res.status(404).end();
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id=?').all(req.params.id);
  const lines = items.map((it:any)=>({ ...it, amount_cents: Math.max(0, Math.round((it.quantity||0) * (it.unit_price_cents||0)) - (it.discount_cents||0)) }));
  const html = await compileTemplate('invoice-default.hbs', { inv, items: lines, extra_css: '' });
  const pdfBuf = await renderPdf(html);
  const info = await sendMail({ to, subject: `Invoice ${inv.invoice_number}`, html: message || `Please find attached Invoice <b>${inv.invoice_number}</b>.`, attachments: [{ filename: `${inv.invoice_number}.pdf`, content: pdfBuf }] });
  res.json({ sent: true, messageId: info.messageId });
});
