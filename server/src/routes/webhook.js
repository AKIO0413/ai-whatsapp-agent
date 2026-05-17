import { Router } from 'express';
import { parseInboundMessage, sendWhatsAppMessage } from '../services/whatsapp.js';
import { handleInbound } from '../services/agent.js';

const router = Router();

/**
 * Meta calls GET /webhook with hub.challenge for verification.
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * Meta posts inbound messages here.
 * We must respond 200 quickly; do work after responding.
 */
router.post('/', async (req, res) => {
  res.sendStatus(200);

  const inbound = parseInboundMessage(req.body);
  if (!inbound || !inbound.text) return;

  try {
    const { reply } = await handleInbound(inbound);
    if (reply) {
      await sendWhatsAppMessage(inbound.from, reply);
    }
  } catch (err) {
    console.error('Webhook handling error:', err.message);
  }
});

/**
 * Test endpoint: simulate an inbound WhatsApp message without Meta.
 * POST /webhook/simulate { from, name, text }
 */
router.post('/simulate', async (req, res) => {
  const { from, name, text } = req.body || {};
  if (!from || !text) return res.status(400).json({ error: 'from and text are required' });

  try {
    const result = await handleInbound({ from, name: name || from, text });
    if (result.reply) {
      await sendWhatsAppMessage(from, result.reply);
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
