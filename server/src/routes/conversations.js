import { Router } from 'express';
import { getDb } from '../store/db.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';

const router = Router();

router.get('/conversations', async (_req, res) => {
  const db = getDb();
  await db.read();
  const list = db.data.conversations.map(c => ({
    id: c.id,
    contactId: c.contactId,
    name: c.name,
    handoff: c.handoff,
    lastMessage: c.messages[c.messages.length - 1] || null,
    messageCount: c.messages.length
  }));
  res.json(list);
});

router.get('/conversations/:id', async (req, res) => {
  const db = getDb();
  await db.read();
  const c = db.data.conversations.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

// Human operator sends a manual reply
router.post('/conversations/:id/reply', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  const db = getDb();
  await db.read();
  const c = db.data.conversations.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });

  c.messages.push({ from: 'agent', text, ts: Date.now(), source: 'human' });
  await db.write();

  try {
    await sendWhatsAppMessage(c.contactId, text);
  } catch (err) {
    console.error(err);
  }
  res.json({ ok: true });
});

// Toggle handoff (re-engage AI)
router.post('/conversations/:id/handoff', async (req, res) => {
  const { handoff } = req.body || {};
  const db = getDb();
  await db.read();
  const c = db.data.conversations.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.handoff = !!handoff;
  await db.write();
  res.json({ ok: true, handoff: c.handoff });
});

export default router;
