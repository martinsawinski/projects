import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';

export const brands = Router();

brands.get('/', (_req, res) => {
  res.json(db.prepare('SELECT * FROM brands ORDER BY name').all());
});

brands.post('/', (req, res) => {
  const id = nanoid();
  const { name, logo_url, color_primary, color_accent, company_name, company_email, company_phone, company_address } = req.body;
  db.prepare(`INSERT INTO brands (id, name, logo_url, color_primary, color_accent, company_name, company_email, company_phone, company_address) VALUES (?,?,?,?,?,?,?,?,?)`).run(id, name, logo_url, color_primary, color_accent, company_name, company_email, company_phone, company_address);
  res.status(201).json({ id });
});
