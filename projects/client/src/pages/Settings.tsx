import React, { useEffect, useState } from 'react';
import { API, authHeaders } from '../api';

export default function Settings(){
  const [smtp, setSmtp] = useState<any>({ host:'', port:587, secure:false, user:'', pass:'', from:'' });
  const [numbering, setNumbering] = useState<any>({ quote:'QUO-{yyyy}-{seq5}', po:'PO-{yyyy}-{seq5}', invoice:'INV-{yyyy}-{seq5}', credit:'CR-{yyyy}-{seq5}' });

  useEffect(()=>{
    fetch(API('/settings'), { headers: authHeaders() }).then(r=>r.json()).then((rows)=>{
      const map:any = {}; rows.forEach((r:any)=> map[r.key] = JSON.parse(r.value));
      if (map.smtp) setSmtp(map.smtp);
      if (map.numbering) setNumbering(map.numbering);
    });
  },[]);

  const save = async () => {
    await fetch(API('/settings'), { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ key:'smtp', value: smtp })});
    await fetch(API('/settings'), { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ key:'numbering', value: numbering })});
    alert('Saved');
  };

  return (
    <div className="grid gap-6 max-w-3xl">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <section className="card p-4 grid gap-2">
        <h3 className="font-semibold mb-2">SMTP</h3>
        <input className="input" placeholder="Host" value={smtp.host} onChange={e=>setSmtp({...smtp, host:e.target.value})} />
        <input className="input" placeholder="Port" value={smtp.port} onChange={e=>setSmtp({...smtp, port:Number(e.target.value)})} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={smtp.secure} onChange={e=>setSmtp({...smtp, secure:e.target.checked})} /> secure (SSL)</label>
        <input className="input" placeholder="User" value={smtp.user} onChange={e=>setSmtp({...smtp, user:e.target.value})} />
        <input className="input" placeholder="Pass" value={smtp.pass} onChange={e=>setSmtp({...smtp, pass:e.target.value})} />
        <input className="input" placeholder="From (e.g., Billing <billing@domain>)" value={smtp.from} onChange={e=>setSmtp({...smtp, from:e.target.value})} />
      </section>

      <section className="card p-4 grid gap-2">
        <h3 className="font-semibold mb-2">Numbering</h3>
        <input className="input" placeholder="Quote format" value={numbering.quote} onChange={e=>setNumbering({...numbering, quote:e.target.value})} />
        <input className="input" placeholder="PO format" value={numbering.po} onChange={e=>setNumbering({...numbering, po:e.target.value})} />
        <input className="input" placeholder="Invoice format" value={numbering.invoice} onChange={e=>setNumbering({...numbering, invoice:e.target.value})} />
        <input className="input" placeholder="Credit format" value={numbering.credit} onChange={e=>setNumbering({...numbering, credit:e.target.value})} />
      </section>

      <div>
        <button className="btn" onClick={save}>Save Settings</button>
      </div>
    </div>
  );
}
