import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getConfiguredProducts } from './_lib/products';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnızca GET isteği destekleniyor.' });
  }

  try {
    const products = await getConfiguredProducts();
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Global Config ürünleri okunamadı:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası.';
    return res.status(503).json({ error: `Ürün kataloğu yüklenemedi: ${message}` });
  }
}
