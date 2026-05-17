import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
const dbFile = path.join(dataDir, 'db.json');

const defaultData = {
  // Settings: system prompt + behavior toggles
  settings: {
    systemPrompt:
      'You are a friendly customer support agent for ACME Co. ' +
      'Answer briefly and warmly. If you do not know the answer, offer to connect the customer with a human agent.',
    autoReplyEnabled: true,
    handoffKeywords: ['human', 'agent', 'representative', 'speak to someone'],
    businessHours: { start: '09:00', end: '18:00', timezone: 'Asia/Tokyo' }
  },
  // Quick-reply rules — matched BEFORE the LLM is called
  rules: [
    {
      id: 'r_hours',
      name: 'Business hours',
      match: { type: 'keyword', any: ['hours', 'open', 'closing time'] },
      reply: 'We are open Monday–Friday, 9:00–18:00 (JST). Reach us anytime here on WhatsApp!',
      enabled: true
    },
    {
      id: 'r_pricing',
      name: 'Pricing',
      match: { type: 'keyword', any: ['price', 'pricing', 'cost', 'how much'] },
      reply: 'Our plans start from $29/month. Want me to send the full pricing PDF?',
      enabled: true
    }
  ],
  // conversations: { contactId, name, messages: [{ from, text, ts, channel }], handoff: bool }
  conversations: []
};

let db;

export async function initDb() {
  await fs.mkdir(dataDir, { recursive: true });
  db = new Low(new JSONFile(dbFile), defaultData);
  await db.read();
  db.data ||= defaultData;
  await db.write();
  return db;
}

export function getDb() {
  if (!db) throw new Error('DB not initialized. Call initDb() first.');
  return db;
}
