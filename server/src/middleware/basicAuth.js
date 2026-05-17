export function basicAuth(req, res, next) {
  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASSWORD || 'admin';
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    res.set('WWW-Authenticate', 'Basic realm="admin"');
    return res.status(401).json({ error: 'Auth required' });
  }
  const [u, p] = Buffer.from(encoded, 'base64').toString().split(':');
  if (u === user && p === pass) return next();
  res.set('WWW-Authenticate', 'Basic realm="admin"');
  return res.status(401).json({ error: 'Invalid credentials' });
}
