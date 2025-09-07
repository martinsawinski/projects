import React, { useEffect, useState } from 'react';
import { API } from '../api';

export default function Events(){
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch(API('/events')).then(r=>r.json()).then(setRows); }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Events</h2>
      <table className="table">
        <thead><tr><th>Date</th><th>Kind</th><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td className="border-t py-1">{r.date}</td>
              <td className="border-t py-1">{r.kind}</td>
              <td className="border-t py-1">{r.description}</td>
              <td className="border-t py-1">{(r.amount_cents||0)/100}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
