import React, { useState } from 'react';
import { API } from '../api';

export default function Login(){
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  async function login(){
    const r = await fetch(API('/auth/login'), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
    const data = await r.json();
    if (data.token){ localStorage.setItem('token', data.token); location.href = '/templates'; }
  }
  return (
    <div className="max-w-sm">
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
      <input className="input mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input mb-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn" onClick={login}>Login</button>
    </div>
  );
}
