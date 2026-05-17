import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Settings() {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.getSettings().then(setS); }, []);

  async function save() {
    const updated = await api.updateSettings({
      systemPrompt: s.systemPrompt,
      autoReplyEnabled: s.autoReplyEnabled,
      handoffKeywords: typeof s.handoffKeywords === 'string'
        ? s.handoffKeywords.split(',').map(x => x.trim()).filter(Boolean)
        : s.handoffKeywords
    });
    setS(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!s) return <div className="text-sm text-slate-500">Loading…</div>;

  const handoffStr = Array.isArray(s.handoffKeywords) ? s.handoffKeywords.join(', ') : s.handoffKeywords;

  return (
    <div className="bg-white rounded border border-slate-200 p-6 max-w-3xl">
      <div className="font-medium mb-4">Agent settings</div>

      <label className="block text-sm mb-1">System prompt</label>
      <textarea
        value={s.systemPrompt}
        onChange={e => setS({ ...s, systemPrompt: e.target.value })}
        rows={6}
        className="w-full border rounded px-3 py-2 text-sm font-mono"
      />
      <p className="text-xs text-slate-500 mb-4">
        This prompt steers tone & persona. The LLM also receives the recent conversation history automatically.
      </p>

      <label className="text-sm flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={s.autoReplyEnabled}
          onChange={e => setS({ ...s, autoReplyEnabled: e.target.checked })}
        />
        Auto-reply enabled
      </label>

      <label className="block text-sm mb-1">Handoff keywords (comma separated)</label>
      <input
        value={handoffStr}
        onChange={e => setS({ ...s, handoffKeywords: e.target.value })}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <p className="text-xs text-slate-500 mb-4">
        When a customer's message contains any of these, the AI stops replying and the conversation is flagged for a human.
      </p>

      <button onClick={save} className="bg-slate-900 text-white text-sm px-4 py-2 rounded">Save</button>
      {saved && <span className="ml-3 text-green-600 text-sm">Saved.</span>}
    </div>
  );
}
