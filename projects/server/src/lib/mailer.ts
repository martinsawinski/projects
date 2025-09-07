import nodemailer from 'nodemailer';
import { db } from '../db.js';

export function getSmtp(){
  const row = db.prepare(`SELECT value FROM settings WHERE key='smtp'`).get();
  if (!row) throw new Error('SMTP settings not configured');
  return JSON.parse(row.value);
}
export async function sendMail({ to, subject, html, attachments }:{ to:string|string[], subject:string, html:string, attachments?: any[] }){
  const smtp = getSmtp();
  const transporter = nodemailer.createTransport({
    host: smtp.host, port: smtp.port, secure: smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
  });
  const info = await transporter.sendMail({ from: smtp.from, to, subject, html, attachments });
  return info;
}
