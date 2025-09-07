export type RoundingMode = 'up'|'down'|'nearest';
export function roundCents(n:number){ return Math.round(n); }
export function applyIncrement(total:number, inc:number, mode:RoundingMode){
  if (!inc || inc <= 0) return roundCents(total);
  const q = total / inc;
  if (mode === 'up') return Math.ceil(q)*inc;
  if (mode === 'down') return Math.floor(q)*inc;
  return Math.round(q)*inc;
}
export function lineAmountCents(qty:number, unit_price_cents:number, discount_cents:number){
  const gross = Math.round(qty * unit_price_cents);
  return Math.max(0, gross - Math.round(discount_cents || 0));
}
export function computeTotals({ lines, discount_cents, tax_rate_bps, rounding_increment_cents, rounding_mode }:{
  lines: Array<{ amount_cents:number, taxable?:boolean }>;
  discount_cents?: number; tax_rate_bps?: number;
  rounding_increment_cents?: number; rounding_mode?: RoundingMode;
}){
  const subtotal = lines.reduce((a,l)=> a + roundCents(l.amount_cents), 0);
  const docDiscount = Math.max(0, discount_cents ?? 0);
  const taxBaseBeforeDocDiscount = lines.filter(l=> l.taxable!==false).reduce((a,l)=> a + roundCents(l.amount_cents), 0);
  const taxableFraction = subtotal ? (taxBaseBeforeDocDiscount / subtotal) : 0;
  const taxableBase = Math.max(0, taxBaseBeforeDocDiscount - Math.round(docDiscount * taxableFraction));
  const tax = roundCents((tax_rate_bps ?? 0) * taxableBase / 10000);
  const preRound = Math.max(0, subtotal - docDiscount) + tax;
  const total = applyIncrement(preRound, rounding_increment_cents ?? 0, (rounding_mode ?? 'nearest') as RoundingMode);
  return { subtotal, discount: docDiscount, tax, total };
}
