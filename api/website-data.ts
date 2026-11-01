import { get } from '@vercel/global-config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isRecord } from './_lib/admin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnızca GET isteği destekleniyor.' });
  }
  try {
    if (!process.env.GLOBAL_CONFIG && !process.env.EDGE_CONFIG) {
      throw new Error('GLOBAL_CONFIG veya EDGE_CONFIG ortam değişkeni tanımlanmamış.');
    }
    const websiteData: unknown = await get('websiteData');
    return res.status(200).json({ websiteData: isRecord(websiteData) ? websiteData : {} });
  } catch (error) {
    console.error('WebsiteData Global Config içinden okunamadı:', error);
    return res.status(503).json({ error: 'WebsiteData yüklenemedi.' });
  }
}
