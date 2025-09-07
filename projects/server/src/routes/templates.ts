import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
const templatesRouter = Router();
export default templatesRouter;

templatesRouter.get('/', (_req,res)=>{ res.json(db.prepare('SELECT id, kind, name, created_at FROM templates ORDER BY created_at DESC').all()); });
templatesRouter.get('/:id', (req,res)=>{ const row = db.prepare('SELECT * FROM templates WHERE id=?').get(req.params.id); if (!row) return res.status(404).end(); res.json(row); });
templatesRouter.post('/', (req,res)=>{
  const id = nanoid();
  const { kind, name, body_hbs, brand_css } = req.body;
  db.prepare(`INSERT INTO templates(id,kind,name,body_hbs,brand_css) VALUES(?,?,?,?,?)`).run(id, kind, name, body_hbs, brand_css);
  res.status(201).json({ id });
});
templatesRouter.put('/:id', (req,res)=>{
  const { name, body_hbs, brand_css } = req.body;
  db.prepare(`UPDATE templates SET name=?, body_hbs=?, brand_css=? WHERE id=?`).run(name, body_hbs, brand_css, req.params.id);
  res.json({ ok:true });
});
