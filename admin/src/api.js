// Tiny API helper that adds Basic Auth from prompt (demo only)
function getAuth() {
  let cached = sessionStorage.getItem('basic_auth');
  if (cached) return cached;
  const user = window.prompt('Admin username', 'admin');
  const pass = window.prompt('Admin password', 'admin');
  cached = 'Basic ' + btoa(`${user}:${pass}`);
  sessionStorage.setItem('basic_auth', cached);
  return cached;
}

async function request(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuth(),
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) {
    sessionStorage.removeItem('basic_auth');
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  listConversations: () => request('/api/conversations'),
  getConversation: (id) => request(`/api/conversations/${id}`),
  reply: (id, text) => request(`/api/conversations/${id}/reply`, { method: 'POST', body: JSON.stringify({ text }) }),
  setHandoff: (id, handoff) => request(`/api/conversations/${id}/handoff`, { method: 'POST', body: JSON.stringify({ handoff }) }),

  listRules: () => request('/api/rules'),
  createRule: (rule) => request('/api/rules', { method: 'POST', body: JSON.stringify(rule) }),
  updateRule: (id, patch) => request(`/api/rules/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  deleteRule: (id) => request(`/api/rules/${id}`, { method: 'DELETE' }),

  getSettings: () => request('/api/settings'),
  updateSettings: (patch) => request('/api/settings', { method: 'PUT', body: JSON.stringify(patch) }),

  simulate: (from, name, text) =>
    fetch('/webhook/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, name, text })
    }).then(r => r.json())
};
