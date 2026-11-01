import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAdminSessionCookie } from '../_lib/admin.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Yalnızca POST isteği destekleniyor.' });
  }
  clearAdminSessionCookie(res);
  return res.status(200).json({ authenticated: false });
}
