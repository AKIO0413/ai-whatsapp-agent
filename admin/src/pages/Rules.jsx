import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const EMPTY = { name: '', keywords: '', reply: '', enabled: true };

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);

  async function load() {
    setRules(await api.listRules());
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const payload = {
      name: form.name,
      reply: form.reply,
      enabled: form.enabled,
      keywords: form.keywords.split(',').map(s => s.trim()).filter(Boolean)
    };
    if (editing) {
      await api.updateRule(editing, payload);
    } else {
      await api.createRule(payload);
    }
    setForm(EMPTY); setEditing(null);
    await load();
  }

  function startEdit(r) {
    setEditing(r.id);
    setForm({
      name: r.name,
      reply: r.reply,
      enabled: r.enabled,
      keywords: (r.match?.any || []).join(', ')
    });
  }

  async function remove(id) {
    if (!confirm('Delete this rule?')) return;
    await api.deleteRule(id);
    await load();
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-7 bg-white rounded border border-slate-200">
        <div className="px-4 py-3 border-b font-medium text-sm">Auto-reply rules</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr><th className="text-left p-2">Name</th><th className="text-left p-2">Keywords</th><th className="text-left p-2">Reply</th><th></th></tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2 align-top">
                  <div className="font-medium">{r.name}</div>
                  <div className={`text-[10px] ${r.enabled ? 'text-green-700' : 'text-slate-400'}`}>{r.enabled ? 'enabled' : 'disabled'}</div>
                </td>
                <td className="p-2 align-top text-slate-600">{(r.match?.any || []).join(', ')}</td>
                <td className="p-2 align-top text-slate-700 max-w-[260px]">{r.reply}</td>
                <td className="p-2 align-top whitespace-nowrap">
                  <button className="text-blue-600 text-xs mr-2" onClick={() => startEdit(r)}>Edit</button>
                  <button className="text-red-600 text-xs" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && <tr><td colSpan="4" className="p-4 text-slate-500">No rules yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="col-span-5 bg-white rounded border border-slate-200 p-4">
        <div className="font-medium text-sm mb-3">{editing ? 'Edit rule' : 'New rule'}</div>
        <div className="space-y-2">
          <input
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Rule name" className="w-full border rounded px-3 py-2 text-sm"
          />
          <input
            value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })}
            placeholder="Keywords (comma separated)" className="w-full border rounded px-3 py-2 text-sm"
          />
          <textarea
            value={form.reply} onChange={e => setForm({ ...form, reply: e.target.value })}
            placeholder="Reply text" rows={4} className="w-full border rounded px-3 py-2 text-sm"
          />
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
            Enabled
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="bg-slate-900 text-white text-sm px-4 py-2 rounded">
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="text-sm px-4 py-2 rounded border">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
