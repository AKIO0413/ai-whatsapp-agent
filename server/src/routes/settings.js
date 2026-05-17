import { Router } from 'express';
import { getDb } from '../store/db.js';

const router = Router();

router.get('/settings', async (_req, res) => {
  const db = getDb();
  await db.read();
  res.json(db.data.settings);
});

router.put('/settings', async (req, res) => {
  const db = getDb();
  await db.read();
  const { systemPrompt, autoReplyEnabled, handoffKeywords, businessHours } = req.body || {};
  if (systemPrompt !== undefined) db.data.settings.systemPrompt = systemPrompt;
  if (autoReplyEnabled !== undefined) db.data.settings.autoReplyEnabled = !!autoReplyEnabled;
  if (Array.isArray(handoffKeywords)) db.data.settings.handoffKeywords = handoffKeywords;
  if (businessHours) db.data.settings.businessHours = businessHours;
  await db.write();
  res.json(db.data.settings);
});

export default router;
