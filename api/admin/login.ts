import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readRequestBody, setAdminSessionCookie, verifyAdminCredentials } from '../_lib/admin.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Yalnızca POST isteği destekleniyor.' });
  }

  try {
    const body = readRequestBody(req);
    if (!body || !verifyAdminCredentials(body.email, body.password)) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }
    setAdminSessionCookie(res);
    return res.status(200).json({ authenticated: true });
  } catch (error) {
    console.error('Admin girişi yapılandırılamadı:', error);
    return res.status(500).json({ error: 'Admin giriş ayarları sunucuda eksik veya hatalı.' });
  }
}
