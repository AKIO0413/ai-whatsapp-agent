import { getDb } from '../store/db.js';
import { generateReply } from './openai.js';
import { nanoid } from 'nanoid';

const MAX_HISTORY = 10;

/**
 * Try to match a rule against the inbound text.
 * Returns the rule's reply if matched, otherwise null.
 */
function matchRule(text, rules) {
  const lower = text.toLowerCase();
  for (const r of rules) {
    if (!r.enabled) continue;
    if (r.match?.type === 'keyword') {
      const hit = (r.match.any || []).some(kw => lower.includes(kw.toLowerCase()));
      if (hit) return r;
    }
  }
  return null;
}

function shouldHandoff(text, keywords) {
  const lower = text.toLowerCase();
  return (keywords || []).some(kw => lower.includes(kw.toLowerCase()));
}

/**
 * Append an inbound message and decide what to reply.
 * Returns { reply, source, conversation }
 *   source: 'rule' | 'ai' | 'handoff' | 'disabled'
 */
export async function handleInbound({ from, name, text }) {
  const db = getDb();
  await db.read();
  const { settings, rules, conversations } = db.data;

  // Find or create conversation
  let convo = conversations.find(c => c.contactId === from);
  if (!convo) {
    convo = {
      id: nanoid(8),
      contactId: from,
      name,
      handoff: false,
      messages: []
    };
    conversations.unshift(convo);
  }

  convo.name = name || convo.name;
  convo.messages.push({ from: 'user', text, ts: Date.now() });

  // 1) Handoff requested -> stop auto replies, flag for human
  if (shouldHandoff(text, settings.handoffKeywords)) {
    convo.handoff = true;
    const reply = 'Got it — connecting you with a human teammate. They will reply here shortly.';
    convo.messages.push({ from: 'agent', text: reply, ts: Date.now(), source: 'handoff' });
    await db.write();
    return { reply, source: 'handoff', conversation: convo };
  }

  // If conversation has already been handed off, do not auto-reply
  if (convo.handoff) {
    await db.write();
    return { reply: null, source: 'handoff', conversation: convo };
  }

  if (!settings.autoReplyEnabled) {
    await db.write();
    return { reply: null, source: 'disabled', conversation: convo };
  }

  // 2) Rule match
  const rule = matchRule(text, rules);
  if (rule) {
    convo.messages.push({ from: 'agent', text: rule.reply, ts: Date.now(), source: 'rule', ruleId: rule.id });
    await db.write();
    return { reply: rule.reply, source: 'rule', conversation: convo };
  }

  // 3) LLM fallback — use last MAX_HISTORY turns as context
  const history = convo.messages
    .slice(-MAX_HISTORY)
    .map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

  const reply = await generateReply({
    systemPrompt: settings.systemPrompt,
    history
  });

  convo.messages.push({ from: 'agent', text: reply, ts: Date.now(), source: 'ai' });
  await db.write();
  return { reply, source: 'ai', conversation: convo };
}
