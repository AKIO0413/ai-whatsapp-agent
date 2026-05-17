import React, { useState } from 'react';
import { api } from '../api.js';

export default function Simulator() {
  const [from, setFrom] = useState('15551234567');
  const [name, setName] = useState('Test Customer');
  const [text, setText] = useState('Hi! What are your business hours?');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true); setResult(null);
    try {
      const r = await api.simulate(from, name, text);
      setResult(r);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded border border-slate-200 p-6 max-w-2xl">
      <div className="font-medium mb-1">Webhook simulator</div>
      <p className="text-xs text-slate-500 mb-4">
        Pretends Meta posted an inbound WhatsApp message. Works without a Meta app —
        useful for demoing the agent without API credentials.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs mb-1">From (phone)</label>
          <input value={from} onChange={e => setFrom(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
      </div>

      <label className="block text-xs mb-1">Message</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3} className="w-full border rounded px-3 py-2 text-sm" />

      <button onClick={send} disabled={loading} className="mt-3 bg-slate-900 text-white text-sm px-4 py-2 rounded disabled:opacity-50">
        {loading ? 'Sending…' : 'Simulate inbound'}
      </button>

      {result && (
        <pre className="mt-4 bg-slate-50 border rounded p-3 text-xs overflow-auto max-h-80">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
