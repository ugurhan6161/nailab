import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasAdminSession } from '../_lib/admin.js';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnızca GET isteği destekleniyor.' });
  }
  try {
    if (!hasAdminSession(req)) return res.status(401).json({ error: 'Admin oturumu gerekli.' });
    const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const requestedLimit = typeof rawLimit === 'string' ? Number(rawLimit) : 500;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 500)
      : 500;
    const { data, error } = await getSupabaseAdminClient()
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return res.status(200).json({ orders: data ?? [] });
  } catch (error) {
    console.error('Admin siparişleri yüklenemedi:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası.';
    return res.status(500).json({ error: `Siparişler yüklenemedi: ${message}` });
  }
}
