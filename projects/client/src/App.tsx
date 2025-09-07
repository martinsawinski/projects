import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function App(){
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="p-4 border-r">
        <h1 className="font-bold mb-4">Invoicer</h1>
        <nav className="flex flex-col gap-2">
          <Link to="/">Dashboard</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/pos">Purchase Orders</Link>
          <Link to="/invoices">Invoices</Link>
          <Link to="/time">Time</Link>
          <Link to="/events">Events</Link>
          <Link to="/templates">Templates</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/login">Login</Link>
        </nav>
        <div className="mt-6 text-xs text-gray-500">{pathname}</div>
      </aside>
      <main className="p-6">
        <Outlet/>
      </main>
    </div>
  );
}
