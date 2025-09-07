import { Router } from 'express';
import { db } from '../db.js';
const settings = Router();
export default settings;

settings.get('/', (_req,res)=>{ res.json(db.prepare('SELECT key, value FROM settings').all()); });
settings.post('/', (req,res)=>{ const { key, value } = req.body; db.prepare(`INSERT OR REPLACE INTO settings(key,value) VALUES(?, json(?))`).run(key, JSON.stringify(value)); res.status(201).json({ ok:true }); });
