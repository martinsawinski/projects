import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';

export const time = Router();

time.get('/', (req, res) => {
  const { project_id } = req.query as any;
  const rows = project_id
    ? db.prepare('SELECT * FROM time_entries WHERE project_id = ? ORDER BY date DESC').all(project_id)
    : db.prepare('SELECT * FROM time_entries ORDER BY date DESC').all();
  res.json(rows);
});

time.post('/', (req, res) => {
  const id = nanoid();
  const { project_id, date, description, seconds, rate_cents, billable } = req.body;
  db.prepare(`INSERT INTO time_entries (id, project_id, date, description, seconds, rate_cents, billable) VALUES (?,?,?,?,?,?,?)`).run(id, project_id, date, description, seconds, rate_cents, billable ?? 1);
  res.status(201).json({ id });
});
