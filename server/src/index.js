import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { initDb } from './store/db.js';
import webhookRouter from './routes/webhook.js';
import conversationsRouter from './routes/conversations.js';
import rulesRouter from './routes/rules.js';
import settingsRouter from './routes/settings.js';
import { basicAuth } from './middleware/basicAuth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
// Capture raw body for potential signature verification (X-Hub-Signature-256)
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// Health
app.get('/health', (_req, res) => res.json({ ok: true, mock: process.env.MOCK_MODE === 'true' }));

// WhatsApp webhook (public — Meta calls this)
app.use('/webhook', webhookRouter);

// Admin API (basic auth)
app.use('/api', basicAuth, conversationsRouter);
app.use('/api', basicAuth, rulesRouter);
app.use('/api', basicAuth, settingsRouter);

await initDb();

app.listen(PORT, () => {
  console.log(`AI WhatsApp Agent server listening on http://localhost:${PORT}`);
  console.log(`Mock mode: ${process.env.MOCK_MODE === 'true' ? 'ON' : 'OFF'}`);
});
