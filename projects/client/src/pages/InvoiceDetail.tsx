import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API, authHeaders } from '../api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';

export default function InvoiceDetail(){
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const [inv, setInv] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [emailTo, setEmailTo] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [payAmt, setPayAmt] = useState('');

  async function refresh(){
    const invRes = await fetch(API(`/invoices/${id}`));
    const data = await invRes.json();
    setInv(data.invoice); setItems(data.items); setSummary(data);
    const payRes = await fetch(API(`/payments/invoice/${id}`), { headers: authHeaders() });
    const payData = await payRes.json();
    setPayments(payData.payments || []);
  }
  useEffect(()=>{ refresh(); },[id]);

  const sendInvoice = async () => {
    const r = await fetch(API(`/invoices/${id}/send`), { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ to: emailTo })});
    if (r.ok) alert('Invoice email sent');
  };

  const addPayment = async () => {
    const cents = Math.round(parseFloat(payAmt||'0') * 100);
    if (!cents) return;
    await fetch(API('/payments'), { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ invoice_id: id, amount_cents: cents }) });
    setPayAmt('');
    refresh();
  };

  const editPayment = async (pid:string, amount:number) => {
    const cents = Math.round(amount*100);
    await fetch(API(`/payments/${pid}`), { method:'PUT', headers:{ 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ amount_cents: cents })});
    refresh();
  };
  const deletePayment = async (pid:string) => {
    if (!confirm('Delete payment?')) return;
    await fetch(API(`/payments/${pid}`), { method:'DELETE', headers: authHeaders() });
    refresh();
  };

  if (!inv) return <div className="p-4">Loading…</div>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Invoice {inv.invoice_number}</h2>
        <div className="flex gap-2">
          <a className="btn" href={API(`/invoices/${id}/pdf`)} target="_blank" rel="noreferrer">View PDF</a>
          <Link className="btn" to="/invoices">Back</Link>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        {(ctx:any)=> (<>
          <TabsList>
            <TabsTrigger value="overview" cur={tab} onClick={()=>setTab('overview')}>Overview</TabsTrigger>
            <TabsTrigger value="payments" cur={tab} onClick={()=>setTab('payments')}>Payments</TabsTrigger>
          </TabsList>

          <TabsContent when="overview" cur={tab}>
            <div className="grid md:grid-cols-3 gap-4">
              <Card><CardHeader><div className="label">Status</div><div className="text-xl font-bold">{inv.status}</div><div className="text-sm">Issue: {inv.issue_date} · Due: {inv.due_date || '—'}</div></CardHeader></Card>
              <Card><CardHeader><div className="label">Totals</div></CardHeader><CardContent><div>Subtotal: {(summary?.totals?.subtotal ?? 0)/100}</div><div>Discount: {(summary?.totals?.discount ?? 0)/100}</div><div>Tax: {(summary?.totals?.tax ?? 0)/100}</div><div className="font-semibold">Total: {(summary?.totals?.total ?? 0)/100}</div></CardContent></Card>
              <Card><CardHeader><div className="label">Balance</div></CardHeader><CardContent><div>Paid: {(summary?.paid ?? 0)/100}</div><div>Credits: {(summary?.appliedCredits ?? 0)/100}</div><div className="text-lg font-semibold">Balance: {(summary?.balance ?? 0)/100}</div></CardContent></Card>
            </div>

            <Card>
              <CardHeader><div className="font-semibold">Line Items</div></CardHeader>
              <CardContent>
                <Table>
                  <THead><TR><TH>Description</TH><TH>Qty</TH><TH>Rate</TH><TH>Disc</TH><TH>Amount</TH></TR></THead>
                  <TBody>
                    {items.map((it:any)=> (
                      <TR key={it.id}>
                        <TD>{it.description}</TD>
                        <TD className="text-right">{it.quantity}</TD>
                        <TD className="text-right">{(it.unit_price_cents||0)/100}</TD>
                        <TD className="text-right">{(it.discount_cents||0)/100}</TD>
                        <TD className="text-right">{(Math.max(0, Math.round(it.quantity * it.unit_price_cents) - (it.discount_cents||0)))/100}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><div className="font-semibold">Send Invoice</div></CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input placeholder="customer@example.com" value={emailTo} onChange={e=>setEmailTo(e.target.value)} />
                  <Button onClick={sendInvoice}>Send</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent when="payments" cur={tab}>
            <Card>
              <CardHeader><div className="font-semibold">Add Payment</div></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Amount (e.g., 250.00)" value={payAmt} onChange={e=>setPayAmt(e.target.value)} />
                  <Button onClick={addPayment}>Add</Button>
                </div>
                <Table>
                  <THead><TR><TH>Date</TH><TH>Method</TH><TH>Reference</TH><TH className="text-right">Amount</TH><TH></TH></TR></THead>
                  <TBody>
                    {payments.map((p:any)=> (
                      <TR key={p.id}>
                        <TD>{p.date}</TD>
                        <TD>{p.method||'—'}</TD>
                        <TD>{p.reference||'—'}</TD>
                        <TD className="text-right">{(p.amount_cents||0)/100}</TD>
                        <TD className="text-right">
                          <Button className="mr-2" onClick={()=>{ const amt = prompt('New amount', String((p.amount_cents||0)/100)); if (amt!=null) editPayment(p.id, parseFloat(amt)); }}>Edit</Button>
                          <Button onClick={()=>deletePayment(p.id)}>Delete</Button>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </> )}
      </Tabs>
    </div>
  );
}
