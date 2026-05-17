import React, { useState } from 'react';
import Conversations from './pages/Conversations.jsx';
import Rules from './pages/Rules.jsx';
import Settings from './pages/Settings.jsx';
import Simulator from './pages/Simulator.jsx';

const TABS = [
  { id: 'conversations', label: 'Conversations' },
  { id: 'rules', label: 'Auto-reply rules' },
  { id: 'settings', label: 'Agent settings' },
  { id: 'simulator', label: 'Simulator' }
];

export default function App() {
  const [tab, setTab] = useState('conversations');

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">AI WhatsApp Agent</h1>
            <p className="text-xs text-slate-500">Admin console — prototype</p>
          </div>
          <nav className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded text-sm ${
                  tab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {tab === 'conversations' && <Conversations />}
        {tab === 'rules' && <Rules />}
        {tab === 'settings' && <Settings />}
        {tab === 'simulator' && <Simulator />}
      </main>
    </div>
  );
}
