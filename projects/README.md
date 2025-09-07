# Invoicer App

PO → Invoice with Quotes, Time/Events to line items, Branding & Templates, Emails (PDF), Payments, and simple Admin UI.

## Quick start

### Server
```bash
cd server
npm i
npm run init   # creates invoicer.db + tables
npm run dev    # http://localhost:4000
```

### Client
```bash
cd client
npm i
npm run dev    # Vite dev server (http://localhost:5173)
```

### Defaults
- Login: register any user via `/auth/register` or add directly in DB.
- Configure SMTP in **Settings** UI (or POST to `/settings` with key `smtp`).

See `server/src/schema.sql` for full schema.
