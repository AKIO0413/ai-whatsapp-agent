import axios from 'axios';

const isMock = () => process.env.MOCK_MODE === 'true';

/**
 * Send a text message back to a WhatsApp user via the Meta Cloud API.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */
export async function sendWhatsAppMessage(to, text) {
  if (isMock()) {
    console.log(`[MOCK WhatsApp -> ${to}] ${text}`);
    return { mock: true };
  }

  const version = process.env.WHATSAPP_API_VERSION || 'v20.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error('Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN');
  }

  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text }
  };

  const { data } = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

/**
 * Parse a Meta webhook payload and return a normalized message,
 * or null if the payload doesn't carry an inbound user message.
 */
export function parseInboundMessage(body) {
  try {
    const change = body?.entry?.[0]?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];
    if (!msg) return null;

    const contact = value?.contacts?.[0];
    return {
      from: msg.from, // E.164 phone number, e.g. "8190..."
      name: contact?.profile?.name || msg.from,
      text: msg.text?.body || '',
      type: msg.type,
      ts: Number(msg.timestamp) * 1000 || Date.now()
    };
  } catch (e) {
    console.error('parseInboundMessage error', e);
    return null;
  }
}
