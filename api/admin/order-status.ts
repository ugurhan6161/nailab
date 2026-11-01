import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasAdminSession, readRequestBody } from '../_lib/admin.js';
import { getSupabaseAdminClient } from '../_lib/supabaseAdmin.js';

const ORDER_STATUSES = new Set([
  'beklemede',
  'onaylandı',
  'hazırlanıyor',
  'kargoda',
  'teslim edildi',
  'iptal',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Yalnızca POST isteği destekleniyor.' });
  }
  try {
    if (!hasAdminSession(req)) return res.status(401).json({ error: 'Admin oturumu gerekli.' });
    const body = readRequestBody(req);
    if (
      !body || typeof body.orderId !== 'string' || !body.orderId.trim()
      || typeof body.status !== 'string' || !ORDER_STATUSES.has(body.status)
    ) {
      return res.status(400).json({ error: 'Sipariş kimliği veya durumu geçersiz.' });
    }

    const { data, error } = await getSupabaseAdminClient()
      .from('orders')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', body.orderId)
      .select('id, status')
      .single();
    if (error) throw error;
    return res.status(200).json({ order: data });
  } catch (error) {
    console.error('Sipariş durumu güncellenemedi:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası.';
    return res.status(500).json({ error: `Sipariş durumu güncellenemedi: ${message}` });
  }
}
