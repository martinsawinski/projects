import { db } from '../db.js';
function pad(n:number, w:number){ return String(n).padStart(w,'0'); }
export function nextNumber(kind: 'quote'|'po'|'invoice'|'credit'){
  const row = db.prepare(`SELECT value FROM settings WHERE key = 'numbering'`).get();
  const cfg = row ? JSON.parse(row.value) : { quote:'QUO-{yyyy}-{seq5}', po:'PO-{yyyy}-{seq5}', invoice:'INV-{yyyy}-{seq5}', credit:'CR-{yyyy}-{seq5}' };
  const fmt = cfg[kind] as string;
  const now = new Date();
  const yyyy = now.getFullYear();
  const cur = db.prepare(`SELECT seq FROM sequences WHERE kind=? AND yyyy=?`).get(kind, yyyy) as {seq:number}|undefined;
  const next = (cur?.seq ?? 0) + 1;
  db.prepare(`INSERT INTO sequences(kind,yyyy,seq) VALUES(?,?,?) ON CONFLICT(kind,yyyy) DO UPDATE SET seq=excluded.seq`).run(kind, yyyy, next);
  const seq5 = pad(next,5);
  return fmt.replace('{yyyy}', String(yyyy)).replace('{seq5}', seq5);
}
