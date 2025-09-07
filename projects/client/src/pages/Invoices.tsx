import React, { useEffect, useState } from 'react';
import { API } from '../api';
import { Link } from 'react-router-dom';

export default function Invoices(){
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch(API('/invoices')).then(r=>r.json()).then(setRows); }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Invoices</h2>
      <table className="table">
        <thead><tr><th>Invoice #</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td className="border-t py-1"><Link className="underline" to={`/invoices/${r.id}`}>{r.invoice_number}</Link></td>
              <td className="border-t py-1">{r.status}</td>
              <td className="border-t py-1">{r.issue_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
