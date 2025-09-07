import React, { useEffect, useState } from 'react';
import { API } from '../api';
import { Link } from 'react-router-dom';

export default function Customers(){
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => { fetch(API('/customers')).then(r=>r.json()).then(setRows); }, []);
  const add = async () => {
    await fetch(API('/customers'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email }) });
    setName(''); setEmail('');
    const next = await (await fetch(API('/customers'))).json(); setRows(next);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Customers</h2>
      <div className="flex gap-2 mb-4">
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="btn" onClick={add}>Add</button>
      </div>
      <table className="table">
        <thead><tr><th className="text-left">Name</th><th className="text-left">Email</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td className="border-t py-1"><Link className="underline" to={`/customers/${r.id}`}>{r.name}</Link></td>
              <td className="border-t py-1">{r.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
