PRAGMA foreign_keys = ON;

-- Brands & Customers
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  color_primary TEXT DEFAULT '#111827',
  color_accent TEXT DEFAULT '#2563eb',
  company_name TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_address TEXT
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  notes TEXT,
  default_tax_rate_bps INTEGER DEFAULT NULL,
  default_terms TEXT DEFAULT 'NET 30'
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  hourly_rate_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT
);

-- Templates store
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('invoice','po','quote')),
  name TEXT NOT NULL,
  body_hbs TEXT NOT NULL,
  brand_css TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Settings store
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  po_number TEXT UNIQUE,
  status TEXT DEFAULT 'draft',
  issue_date TEXT DEFAULT (date('now')),
  currency TEXT DEFAULT 'USD',
  discount_cents INTEGER DEFAULT 0,
  tax_rate_bps INTEGER DEFAULT 0,
  rounding_increment_cents INTEGER DEFAULT 0,
  rounding_mode TEXT DEFAULT 'nearest',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS po_items (
  id TEXT PRIMARY KEY,
  po_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  kind TEXT CHECK (kind IN ('product','service','time','event')),
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  unit TEXT,
  unit_price_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  taxable INTEGER DEFAULT 1,
  metadata JSON
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE,
  status TEXT DEFAULT 'draft',
  issue_date TEXT DEFAULT (date('now')),
  due_date TEXT,
  currency TEXT DEFAULT 'USD',
  po_id TEXT REFERENCES purchase_orders(id) ON DELETE SET NULL,
  discount_cents INTEGER DEFAULT 0,
  tax_rate_bps INTEGER DEFAULT 0,
  rounding_increment_cents INTEGER DEFAULT 0,
  rounding_mode TEXT DEFAULT 'nearest',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  source_kind TEXT CHECK (source_kind IN ('po_item','time_entry','event','manual')),
  source_id TEXT,
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  unit TEXT,
  unit_price_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  taxable INTEGER DEFAULT 1,
  metadata JSON
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  quote_number TEXT UNIQUE,
  status TEXT DEFAULT 'draft',
  issue_date TEXT DEFAULT (date('now')),
  valid_until TEXT,
  currency TEXT DEFAULT 'USD',
  discount_cents INTEGER DEFAULT 0,
  tax_rate_bps INTEGER DEFAULT 0,
  rounding_increment_cents INTEGER DEFAULT 0,
  rounding_mode TEXT DEFAULT 'nearest',
  accept_token TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS quote_items (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  kind TEXT CHECK (kind IN ('product','service','time','event')),
  description TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  unit TEXT,
  unit_price_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  taxable INTEGER DEFAULT 1,
  metadata JSON
);

-- Time & Events
CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date TEXT DEFAULT (date('now')),
  description TEXT,
  seconds INTEGER NOT NULL,
  rate_cents INTEGER,
  billable INTEGER DEFAULT 1,
  invoiced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date TEXT DEFAULT (date('now')),
  kind TEXT DEFAULT 'expense',
  description TEXT,
  amount_cents INTEGER NOT NULL,
  billable INTEGER DEFAULT 1,
  invoiced INTEGER DEFAULT 0,
  metadata JSON
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  date TEXT DEFAULT (date('now')),
  amount_cents INTEGER NOT NULL,
  method TEXT,
  reference TEXT,
  notes TEXT
);

-- Credit notes (simple)
CREATE TABLE IF NOT EXISTS credit_notes (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  number TEXT UNIQUE,
  date TEXT DEFAULT (date('now')),
  currency TEXT DEFAULT 'USD',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS credit_note_items (
  id TEXT PRIMARY KEY,
  credit_note_id TEXT NOT NULL REFERENCES credit_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_applications (
  id TEXT PRIMARY KEY,
  credit_note_id TEXT NOT NULL REFERENCES credit_notes(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  applied_at TEXT DEFAULT (datetime('now'))
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT
);

-- Sequences for numbering
CREATE TABLE IF NOT EXISTS sequences (kind TEXT, yyyy INTEGER, seq INTEGER, PRIMARY KEY(kind,yyyy));
