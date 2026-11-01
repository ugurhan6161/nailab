import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasAdminSession, isRecord, readRequestBody, updateGlobalConfigItems } from '../_lib/admin.js';

function isValidProducts(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  return value.every((product) => {
    if (!isRecord(product)) return false;
    const { id, title, category, image, description, price } = product;
    if (
      typeof id !== 'string' || !id.trim() || ids.has(id)
      || typeof title !== 'string' || !title.trim()
      || typeof category !== 'string' || !category.trim()
      || typeof image !== 'string' || !image.trim()
      || typeof description !== 'string' || !description.trim()
      || typeof price !== 'number' || !Number.isFinite(price) || price < 0
      || (product.rating !== undefined && (typeof product.rating !== 'number' || !Number.isFinite(product.rating) || product.rating < 0))
      || (product.reviews !== undefined && (typeof product.reviews !== 'number' || !Number.isFinite(product.reviews) || product.reviews < 0))
      || (product.stock !== undefined && (typeof product.stock !== 'number' || !Number.isFinite(product.stock) || product.stock < 0))
      || (product.badge !== undefined && product.badge !== null && typeof product.badge !== 'string')
      || (product.isNew !== undefined && typeof product.isNew !== 'boolean')
    ) return false;
    ids.add(id);
    return true;
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Yalnızca POST isteği destekleniyor.' });
  }
  try {
    if (!hasAdminSession(req)) return res.status(401).json({ error: 'Admin oturumu gerekli.' });
  } catch (error) {
    console.error('Admin oturumu yapılandırması geçersiz:', error);
    return res.status(500).json({ error: 'Admin oturumu yapılandırması eksik veya hatalı.' });
  }

  const body = readRequestBody(req);
  if (!body || !isValidProducts(body.products) || !isRecord(body.websiteData)) {
    return res.status(400).json({ error: 'Ürün kataloğu veya websiteData biçimi geçersiz.' });
  }

  try {
    await updateGlobalConfigItems([
      { key: 'products', value: body.products },
      { key: 'websiteData', value: body.websiteData },
    ]);
    return res.status(200).json({ saved: true });
  } catch (error) {
    console.error('Admin içerikleri Global Config içine kaydedilemedi:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası.';
    return res.status(502).json({ error: message });
  }
}
