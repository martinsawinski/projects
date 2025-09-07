import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db } from './db.js';
import { customers } from './routes/customers.js';
import { projects } from './routes/projects.js';
import { brands } from './routes/brands.js';
import { pos } from './routes/pos.js';
import { invoices } from './routes/invoices.js';
import { time } from './routes/time.js';
import { events } from './routes/events.js';
import { auth, requireAuth } from './routes/auth.js';
import quotesRouter from './routes/quotes.js';
import publicQuotes from './routes/quotes-public.js';
import settingsRouter from './routes/settings.js';
import templatesRouter from './routes/templates.js';
import { payments } from './routes/payments.js';
import { credits } from './routes/credits.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', auth);

// Admin-protected endpoints
app.use('/templates', requireAuth, templatesRouter);
app.use('/settings', requireAuth, settingsRouter);
app.use('/payments', requireAuth, payments);
app.use('/credits', requireAuth, credits);

// Public business endpoints
app.use('/customers', customers);
app.use('/projects', projects);
app.use('/brands', brands);
app.use('/pos', pos);
app.use('/invoices', invoices);
app.use('/time', time);
app.use('/events', events);
app.use('/quotes', quotesRouter);
app.use('/q', publicQuotes);

app.get('/health', (_req, res) => res.send('ok'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
