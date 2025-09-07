import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API, authHeaders } from '../api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';

export default function QuoteDetail(){
  const { id } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [emailTo, setEmailTo] = useState('');
  const [acceptLink, setAcceptLink] = useState('');

  async function refresh(){
    const r = await fetch(API(`/quotes/${id}`));
    const data = await r.json();
    setQuote(data.quote); setItems(data.items);
    setAcceptLink(`${location.origin}/q/accept/${data.quote.accept_token}`);
  }
  useEffect(()=>{ refresh(); },[id]);

  const sendQuote = async () => {
    const r = await fetch(API(`/quotes/${id}/send`), { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ to: emailTo })});
    const data = await r.json();
    setAcceptLink(data.link || acceptLink);
    if (r.ok) alert('Quote email sent');
  };

  if (!quote) return <div className="p-4">Loading…</div>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Quote {quote.quote_number}</h2>
        <div className="flex gap-2">
          <a className="btn" href={API(`/quotes/${id}/pdf`)} target="_blank" rel="noreferrer">View PDF</a>
          <Link className="btn" to="/quotes">Back</Link>
        </div>
      </div>

      <Card>
        <CardHeader><div className="font-semibold">Items</div></CardHeader>
        <CardContent>
          <Table>
            <THead><TR><TH>Description</TH><TH>Qty</TH><TH>Rate</TH><TH>Disc</TH></TR></THead>
            <TBody>
              {items.map((it:any)=> (
                <TR key={it.id}>
                  <TD>{it.description}</TD>
                  <TD className="text-right">{it.quantity}</TD>
                  <TD className="text-right">{(it.unit_price_cents||0)/100}</TD>
                  <TD className="text-right">{(it.discount_cents||0)/100}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><div className="font-semibold">Send Quote</div></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="customer@example.com" value={emailTo} onChange={e=>setEmailTo(e.target.value)} />
              <Button onClick={sendQuote}>Send</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="font-semibold">Accept Link</div></CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <Input value={acceptLink} readOnly />
              <Button onClick={()=> navigator.clipboard.writeText(acceptLink)}>Copy</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
