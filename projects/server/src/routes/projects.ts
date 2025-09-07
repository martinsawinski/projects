import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';

export const projects = Router();

projects.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY rowid DESC').all();
  res.json(rows);
});

projects.post('/', (req, res) => {
  const id = nanoid();
  const { customer_id, name, hourly_rate_cents, currency, notes } = req.body;
  db.prepare(`INSERT INTO projects (id, customer_id, name, hourly_rate_cents, currency, notes) VALUES (?,?,?,?,?,?)`).run(id, customer_id, name, hourly_rate_cents ?? 0, currency ?? 'USD', notes);
  res.status(201).json({ id });
});
