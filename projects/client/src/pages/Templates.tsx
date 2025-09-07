import React, { useEffect, useState } from 'react';
import { API, authHeaders } from '../api';

export default function Templates(){
  const [rows, setRows] = useState<any[]>([]);
  const [kind, setKind] = useState<'invoice'|'po'|'quote'>('invoice');
  const [name, setName] = useState('Custom');
  const [hbs, setHbs] = useState('');
  const [css, setCss] = useState('');

  const auth = { 'Content-Type':'application/json', ...(authHeaders()) } as any;

  const refresh = async ()=>{ const r = await fetch(API('/templates'), { headers: auth }); setRows(await r.json()); };
  useEffect(()=>{ refresh(); },[]);

  const save = async ()=>{
    await fetch(API('/templates'), { method:'POST', headers: auth, body: JSON.stringify({ kind, name, body_hbs: hbs, brand_css: css })});
    setHbs(''); setCss(''); setName('Custom');
    refresh();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Template Manager</h2>
      <div className="grid gap-2 mb-6">
        <select className="input" value={kind} onChange={e=>setKind(e.target.value as any)}>
          <option value="invoice">Invoice</option>
          <option value="po">Purchase Order</option>
          <option value="quote">Quote</option>
        </select>
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <textarea className="input h-40" placeholder="Handlebars HTML" value={hbs} onChange={e=>setHbs(e.target.value)} />
        <textarea className="input h-32" placeholder="Brand CSS (optional)" value={css} onChange={e=>setCss(e.target.value)} />
        <button className="btn" onClick={save}>Save Template</button>
      </div>
      <ul className="space-y-2">
        {rows.map((r:any)=> (
          <li key={r.id} className="card p-3 flex justify-between"><span>{r.kind} · {r.name}</span><span className="text-xs text-gray-500">{r.created_at}</span></li>
        ))}
      </ul>
    </div>
  );
}
