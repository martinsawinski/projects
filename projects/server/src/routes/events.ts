import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';

export const events = Router();

events.get('/', (req, res) => {
  const { project_id } = req.query as any;
  const rows = project_id
    ? db.prepare('SELECT * FROM events WHERE project_id = ? ORDER BY date DESC').all(project_id)
    : db.prepare('SELECT * FROM events ORDER BY date DESC').all();
  res.json(rows);
});

events.post('/', (req, res) => {
  const id = nanoid();
  const { project_id, date, kind, description, amount_cents, billable, metadata } = req.body;
  db.prepare(`INSERT INTO events (id, project_id, date, kind, description, amount_cents, billable, metadata) VALUES (?,?,?,?,?,?,?, json(?))`).run(id, project_id, date, kind, description, amount_cents, billable ?? 1, JSON.stringify(metadata ?? {}));
  res.status(201).json({ id });
});
