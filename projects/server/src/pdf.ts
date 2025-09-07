import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import puppeteer from 'puppeteer';

Handlebars.registerHelper('money', (cents:number, currency:string='USD') => {
  const v = (Number(cents||0)/100).toFixed(2);
  return `${currency} ${v}`;
});

export async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } });
  await browser.close();
  return pdf;
}

export async function compileTemplate(file: string, data: any) {
  const src = await readFile(resolve(process.cwd(), 'templates', file), 'utf8');
  const tpl = Handlebars.compile(src);
  return tpl(data);
}
