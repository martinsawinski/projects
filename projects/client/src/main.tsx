import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import App from './App';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Projects from './pages/Projects';
import PurchaseOrders from './pages/PurchaseOrders';
import PoDetail from './pages/PoDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Time from './pages/Time';
import Events from './pages/Events';
import Templates from './pages/Templates';
import Login from './pages/Login';
import QuoteDetail from './pages/QuoteDetail';
import Settings from './pages/Settings';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<App/>}>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/customers" element={<Customers/>} />
        <Route path="/customers/:id" element={<CustomerDetail/>} />
        <Route path="/projects" element={<Projects/>} />
        <Route path="/pos" element={<PurchaseOrders/>} />
        <Route path="/pos/:id" element={<PoDetail/>} />
        <Route path="/invoices" element={<Invoices/>} />
        <Route path="/invoices/:id" element={<InvoiceDetail/>} />
        <Route path="/time" element={<Time/>} />
        <Route path="/events" element={<Events/>} />
        <Route path="/templates" element={<Templates/>} />
        <Route path="/quotes/:id" element={<QuoteDetail/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/login" element={<Login/>} />
      </Route>
    </Routes>
  </BrowserRouter>
);
