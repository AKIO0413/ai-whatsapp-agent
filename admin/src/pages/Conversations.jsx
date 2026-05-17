import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Conversations() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [convo, setConvo] = useState(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await api.listConversations();
      setList(data);
      if (!selected && data[0]) setSelected(data[0].id);
    } catch (e) { setError(e.message); }
  }

  async function loadConvo(id) {
    if (!id) return;
    try {
      const data = await api.getConversation(id);
      setConvo(data);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { loadConvo(selected); }, [selected]);

  async function send() {
    if (!draft.trim() || !selected) return;
    await api.reply(selected, draft.trim());
    setDraft('');
    await loadConvo(selected);
    await load();
  }

  async function toggleHandoff() {
    if (!convo) return;
    await api.setHandoff(convo.id, !convo.handoff);
    await loadConvo(selected);
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-4 bg-white rounded border border-slate-200 overflow-hidden">
        <div className="px-3 py-2 border-b text-xs font-medium text-slate-500 flex justify-between">
          <span>Conversations</span>
          <button onClick={load} className="text-blue-600">Refresh</button>
        </div>
        <ul className="divide-y max-h-[70vh] overflow-y-auto">
          {list.length === 0 && (
            <li className="p-4 text-sm text-slate-500">No conversations yet. Use the Simulator tab to send a test message.</li>
          )}
          {list.map(c => (
            <li
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`p-3 cursor-pointer ${selected === c.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              <div className="flex justify-between">
                <span className="font-medium text-sm">{c.name}</span>
                {c.handoff && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">HANDOFF</span>}
              </div>
              <div className="text-xs text-slate-500 truncate">{c.lastMessage?.text}</div>
            </li>
          ))}
        </ul>
      </aside>

      <section className="col-span-8 bg-white rounded border border-slate-200 flex flex-col h-[75vh]">
        {!convo && <div className="p-6 text-sm text-slate-500">Select a conversation.</div>}
        {convo && (
          <>
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <div>
                <div className="font-medium">{convo.name}</div>
                <div className="text-xs text-slate-500">{convo.contactId}</div>
              </div>
              <button
                onClick={toggleHandoff}
                className={`text-xs px-2 py-1 rounded ${convo.handoff ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}
              >
                {convo.handoff ? 'Resume AI' : 'Hand off to human'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {convo.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    m.from === 'agent'
                      ? 'bg-green-100 text-slate-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    <div>{m.text}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(m.ts).toLocaleTimeString()} {m.source && `· ${m.source}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-3 flex gap-2">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Reply as human agent…"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button onClick={send} className="bg-slate-900 text-white text-sm px-4 rounded">Send</button>
            </div>
          </>
        )}
      </section>

      {error && <div className="col-span-12 text-red-600 text-sm">{error}</div>}
    </div>
  );
}
