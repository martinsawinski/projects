import React, { useEffect, useState } from 'react';
import { API } from '../api';

export default function Time(){
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch(API('/time')).then(r=>r.json()).then(setRows); }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Time Entries</h2>
      <table className="table">
        <thead><tr><th>Date</th><th>Description</th><th>Hours</th><th>Rate</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td className="border-t py-1">{r.date}</td>
              <td className="border-t py-1">{r.description}</td>
              <td className="border-t py-1">{(r.seconds/3600).toFixed(2)}</td>
              <td className="border-t py-1">{(r.rate_cents||0)/100}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
