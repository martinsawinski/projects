import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API, authHeaders } from '../api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';

export default function PoDetail(){
  const { id } = useParams();
  const nav = useNavigate();
  const [po, setPo] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  async function refresh(){
    const r = await fetch(API(`/pos/${id}`));
    const data = await r.json();
    setPo(data.po); setItems(data.items);
  }
  useEffect(()=>{ refresh(); },[id]);

  const convert = async ()=>{
    const r = await fetch(API(`/invoices/from-po/${id}`), { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() }});
    const data = await r.json();
    nav(`/invoices/${data.id}`);
  };

  if (!po) return <div className="p-4">Loading…</div>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">PO {po.po_number}</h2>
        <div className="flex gap-2">
          <Button onClick={convert}>Convert to Invoice</Button>
          <Link className="btn" to="/pos">Back</Link>
        </div>
      </div>
      <Card>
        <CardHeader><div className="font-semibold">Items</div></CardHeader>
        <CardContent>
          <Table>
            <THead><TR><TH>Description</TH><TH>Qty</TH><TH>Unit</TH><TH>Price</TH></TR></THead>
            <TBody>
              {items.map((it:any)=> (
                <TR key={it.id}>
                  <TD>{it.description}</TD>
                  <TD className="text-right">{it.quantity}</TD>
                  <TD>{it.unit||'—'}</TD>
                  <TD className="text-right">{(it.unit_price_cents||0)/100}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
