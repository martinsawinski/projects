import React, { useEffect, useState } from 'react';
import { API } from '../api';
import { Link } from 'react-router-dom';

export default function PurchaseOrders(){
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch(API('/pos')).then(r=>r.json()).then(setRows); }, []);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Purchase Orders</h2>
      <table className="table">
        <thead><tr><th>PO #</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id}>
              <td className="border-t py-1"><Link className="underline" to={`/pos/${r.id}`}>{r.po_number}</Link></td>
              <td className="border-t py-1">{r.status}</td>
              <td className="border-t py-1">{r.issue_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
