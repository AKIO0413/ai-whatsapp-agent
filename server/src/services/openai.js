import OpenAI from 'openai';

const isMock = () => process.env.MOCK_MODE === 'true';

let client;
function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * Ask the model for a reply, using the recent conversation history as context.
 * messages: [{ role: 'user' | 'assistant', content: string }]
 */
export async function generateReply({ systemPrompt, history }) {
  if (isMock()) {
    const last = history[history.length - 1]?.content || '';
    return `Thanks for your message! (mock reply to: "${last.slice(0, 80)}")`;
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const openai = getClient();

  const resp = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    max_tokens: 300,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history
    ]
  });

  return resp.choices?.[0]?.message?.content?.trim() || '';
}
