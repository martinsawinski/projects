import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API, authHeaders } from '../api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomerDetail(){
  const { id } = useParams();
  const [cust, setCust] = useState<any>(null);
  const [taxBps, setTaxBps] = useState('');
  const [terms, setTerms] = useState('NET 30');

  async function refresh(){
    const r = await fetch(API(`/customers/${id}`));
    const c = await r.json();
    setCust(c); setTaxBps(String(c.default_tax_rate_bps ?? '')); setTerms(c.default_terms || 'NET 30');
  }
  useEffect(()=>{ refresh(); },[id]);

  const save = async ()=>{
    await fetch(API(`/customers/${id}`), { method:'PUT', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ default_tax_rate_bps: Number(taxBps||0), default_terms: terms })});
    alert('Saved'); refresh();
  };

  if (!cust) return <div className="p-4">Loading…</div>;

  return (
    <div className="grid gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{cust.name}</h2>
        <Link className="btn" to="/customers">Back</Link>
      </div>

      <Card>
        <CardHeader><div className="font-semibold">Defaults</div></CardHeader>
        <CardContent className="grid gap-3">
          <div>
            <div className="label mb-1">Default Tax Rate (bps)</div>
            <Input placeholder="e.g., 675 for 6.75%" value={taxBps} onChange={e=>setTaxBps(e.target.value)} />
          </div>
          <div>
            <div className="label mb-1">Default Terms</div>
            <Input placeholder="NET 30" value={terms} onChange={e=>setTerms(e.target.value)} />
          </div>
          <Button onClick={save}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
