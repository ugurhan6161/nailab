import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasAdminSession } from '../_lib/admin.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnızca GET isteği destekleniyor.' });
  }
  try {
    return res.status(200).json({ authenticated: hasAdminSession(req) });
  } catch (error) {
    console.error('Admin oturumu doğrulanamadı:', error);
    return res.status(500).json({ error: 'Admin oturumu doğrulanamadı.' });
  }
}
