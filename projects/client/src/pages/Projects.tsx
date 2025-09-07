import React, { useEffect, useState } from 'react';
import { API } from '../api';

export default function Projects(){
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetch(API('/projects')).then(r=>r.json()).then(setRows);
    fetch(API('/customers')).then(r=>r.json()).then(setCustomers);
  }, []);

  const add = async () => {
    await fetch(API('/projects'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, customer_id: customerId }) });
    setName(''); setCustomerId('');
    const next = await (await fetch(API('/projects'))).json(); setRows(next);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Projects</h2>
      <div className="flex gap-2 mb-4">
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <select className="input" value={customerId} onChange={e=>setCustomerId(e.target.value)}>
          <option value="">Select customer…</option>
          {customers.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn" onClick={add}>Add</button>
      </div>
      <table className="table">
        <thead><tr><th className="text-left">Name</th><th>Customer</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td className="border-t py-1">{r.name}</td>
              <td className="border-t py-1">{r.customer_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
