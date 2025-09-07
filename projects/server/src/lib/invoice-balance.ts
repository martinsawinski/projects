import { db } from '../db.js';
import { computeTotals, lineAmountCents } from './totals.js';

export function invoiceBalance(invoice_id: string){
  const inv = db.prepare('SELECT * FROM invoices WHERE id=?').get(invoice_id);
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id=?').all(invoice_id);
  const lines = items.map((it:any)=> ({ amount_cents: lineAmountCents(it.quantity, it.unit_price_cents, it.discount_cents||0), taxable: it.taxable!==0 }));
  const totals = computeTotals({
    lines,
    discount_cents: inv.discount_cents,
    tax_rate_bps: inv.tax_rate_bps,
    rounding_increment_cents: inv.rounding_increment_cents,
    rounding_mode: inv.rounding_mode,
  });
  const paid = db.prepare('SELECT COALESCE(SUM(amount_cents),0) as s FROM payments WHERE invoice_id=?').get(invoice_id).s as number;
  const appliedCredits = db.prepare('SELECT COALESCE(SUM(amount_cents),0) as s FROM credit_applications WHERE invoice_id=?').get(invoice_id).s as number;
  const balance = Math.max(0, totals.total - paid - appliedCredits);
  return { totals, paid, appliedCredits, balance };
}
