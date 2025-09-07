import { Router } from 'express';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const auth = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

auth.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const id = nanoid();
  const hash = await bcrypt.hash(password, 10);
  db.prepare(`INSERT INTO users(id,email,password_hash,name) VALUES(?,?,?,?)`).run(id, email, hash, name);
  res.status(201).json({ id });
});

auth.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const u = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  if (!u) return res.status(401).json({ error: 'Invalid login' });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid login' });
  const token = jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

export function requireAuth(req:any,res:any,next:any){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  try { if (!token) throw new Error('missing'); const payload = jwt.verify(token, JWT_SECRET); (req as any).user = payload; next(); }
  catch { return res.status(401).json({ error: 'Unauthorized' }); }
}
