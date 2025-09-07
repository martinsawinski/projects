import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { nextNumber } from '../lib/numbering.js';
import { compileTemplate, renderPdf } from '../pdf.js';
import { getTemplate } from '../templates.js';
import { sendMail } from '../lib/mailer.js';

const quotes = Router();
export default quotes;

quotes.get('/', (_req,res)=>{ res.json(db.prepare('SELECT * FROM quotes ORDER BY issue_date DESC').all()); });

quotes.get('/:id', (req,res)=>{
  const q = db.prepare('SELECT * FROM quotes WHERE id=?').get(req.params.id);
  if (!q) return res.status(404).json({ error:'Not found' });
  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id=? ORDER BY rowid').all(req.params.id);
  res.json({ quote: q, items });
});

quotes.post('/', (req,res)=>{
  const id = nanoid();
  const { project_id, status, valid_until, currency, notes, tax_rate_bps, discount_cents } = req.body;
  const quote_number = nextNumber('quote');
  const accept_token = crypto.randomUUID().replace(/-/g,'').slice(0,32);
  const proj = db.prepare('SELECT p.*, c.default_tax_rate_bps FROM projects p JOIN customers c ON c.id=p.customer_id WHERE p.id=?').get(project_id);
  const tr = (tax_rate_bps ?? proj?.default_tax_rate_bps ?? 0);
  db.prepare(`INSERT INTO quotes(id, project_id, quote_number, status, valid_until, currency, notes, tax_rate_bps, discount_cents, accept_token) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, project_id, quote_number, status ?? 'draft', valid_until, currency ?? 'USD', notes, tr, discount_cents ?? 0, accept_token);
  res.status(201).json({ id, quote_number, accept_token });
});

quotes.post('/:id/items', (req,res)=>{
  const id = nanoid();
  const { kind, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata } = req.body;
  db.prepare(`INSERT INTO quote_items(id, quote_id, kind, description, quantity, unit, unit_price_cents, discount_cents, taxable, metadata) VALUES (?,?,?,?,?,?,?,?,?, json(?))`).run(id, req.params.id, kind, description, quantity ?? 1, unit, unit_price_cents ?? 0, discount_cents ?? 0, (taxable??1), JSON.stringify(metadata ?? {}));
  res.status(201).json({ id });
});

quotes.get('/:id/pdf', async (req,res)=>{
  const q = db.prepare(`SELECT q.*, p.name as project_name, c.* FROM quotes q JOIN projects p ON p.id=q.project_id JOIN customers c ON c.id=p.customer_id WHERE q.id=?`).get(req.params.id);
  if (!q) return res.status(404).end();
  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id=?').all(req.params.id);
  const { body_hbs, brand_css } = getTemplate('quote');
  const lines = items.map((it:any)=>({ ...it, amount_cents: Math.max(0, Math.round((it.quantity||0) * (it.unit_price_cents||0)) - (it.discount_cents||0)) }));
  const html = await compileTemplate('quote-default.hbs', { quote: q, items: lines, extra_css: brand_css });
  const pdfBuf = await renderPdf(html);
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${q.quote_number||'quote'}.pdf"`);
  res.send(pdfBuf);
});

quotes.post('/:id/send', async (req,res)=>{
  const { to, message } = req.body as { to: string|string[], message?: string };
  const q = db.prepare(`SELECT q.*, p.name as project_name, c.* FROM quotes q JOIN projects p ON p.id=q.project_id JOIN customers c ON c.id=p.customer_id WHERE q.id=?`).get(req.params.id);
  if (!q) return res.status(404).end();
  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id=?').all(req.params.id);
  const link = `${req.protocol}://${req.get('host')}/q/accept/${q.accept_token}`;
  const { body_hbs, brand_css } = getTemplate('quote');
  const lines = items.map((it:any)=>({ ...it, amount_cents: Math.max(0, Math.round((it.quantity||0) * (it.unit_price_cents||0)) - (it.discount_cents||0)) }));
  const html = await compileTemplate('quote-default.hbs', { quote: q, items: lines, extra_css: brand_css, accept_url: link });
  const pdfBuf = await renderPdf(html);
  const info = await sendMail({ to, subject: `Quote ${q.quote_number}`, html: message || `Please review Quote <b>${q.quote_number}</b>.<br><a href="${link}">Accept Quote</a>`, attachments: [{ filename: `${q.quote_number}.pdf`, content: pdfBuf }] });
  db.prepare(`UPDATE quotes SET status='sent' WHERE id=?`).run(req.params.id);
  res.json({ sent: true, messageId: info.messageId, link });
});
