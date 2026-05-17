import { Router } from 'express';
import { getDb } from '../store/db.js';
import { nanoid } from 'nanoid';

const router = Router();

router.get('/rules', async (_req, res) => {
  const db = getDb();
  await db.read();
  res.json(db.data.rules);
});

router.post('/rules', async (req, res) => {
  const { name, keywords, reply, enabled = true } = req.body || {};
  if (!name || !reply || !Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ error: 'name, keywords[], reply required' });
  }
  const db = getDb();
  await db.read();
  const rule = {
    id: 'r_' + nanoid(6),
    name,
    match: { type: 'keyword', any: keywords },
    reply,
    enabled
  };
  db.data.rules.push(rule);
  await db.write();
  res.json(rule);
});

router.put('/rules/:id', async (req, res) => {
  const db = getDb();
  await db.read();
  const r = db.data.rules.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const { name, keywords, reply, enabled } = req.body || {};
  if (name !== undefined) r.name = name;
  if (reply !== undefined) r.reply = reply;
  if (enabled !== undefined) r.enabled = !!enabled;
  if (Array.isArray(keywords)) r.match = { type: 'keyword', any: keywords };
  await db.write();
  res.json(r);
});

router.delete('/rules/:id', async (req, res) => {
  const db = getDb();
  await db.read();
  db.data.rules = db.data.rules.filter(x => x.id !== req.params.id);
  await db.write();
  res.json({ ok: true });
});

export default router;
