import { get } from '@vercel/global-config';

export type StoreProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  priceFormatted: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  isNew?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(
  product: Record<string, unknown>,
  field: string,
  index: number
): string {
  const value = product[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`products[${index}].${field} geçerli bir metin olmalıdır.`);
  }
  return value.trim();
}

function optionalNumber(
  product: Record<string, unknown>,
  field: string,
  fallback: number,
  index: number
): number {
  const value = product[field];
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`products[${index}].${field} sıfır veya daha büyük bir sayı olmalıdır.`);
  }
  return value;
}

export async function getConfiguredProducts(): Promise<StoreProduct[]> {
  if (!process.env.GLOBAL_CONFIG) {
    throw new Error('GLOBAL_CONFIG ortam değişkeni tanımlanmamış.');
  }

  const value: unknown = await get('products');
  if (!Array.isArray(value)) {
    throw new Error('Global Config içinde products anahtarı bir ürün dizisi olmalıdır.');
  }

  const ids = new Set<string>();
  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`products[${index}] bir ürün nesnesi olmalıdır.`);
    }

    const id = requiredString(entry, 'id', index);
    if (ids.has(id)) throw new Error(`products içinde yinelenen ürün kimliği: ${id}`);
    ids.add(id);

    const price = optionalNumber(entry, 'price', -1, index);
    if (price < 0) {
      throw new Error(`products[${index}].price sıfır veya daha büyük bir sayı olmalıdır.`);
    }

    const rating = optionalNumber(entry, 'rating', 0, index);
    const reviews = optionalNumber(entry, 'reviews', 0, index);
    const stock = optionalNumber(entry, 'stock', 50, index);
    const badge = entry.badge;
    const isNew = entry.isNew;
    if (badge !== undefined && badge !== null && typeof badge !== 'string') {
      throw new Error(`products[${index}].badge metin olmalıdır.`);
    }
    if (isNew !== undefined && typeof isNew !== 'boolean') {
      throw new Error(`products[${index}].isNew doğru/yanlış olmalıdır.`);
    }

    return {
      id,
      title: requiredString(entry, 'title', index),
      category: requiredString(entry, 'category', index),
      price,
      priceFormatted: `${price.toLocaleString('tr-TR')} ₺`,
      image: requiredString(entry, 'image', index),
      description: requiredString(entry, 'description', index),
      rating,
      reviews,
      stock,
      ...(typeof badge === 'string' && badge.trim() ? { badge: badge.trim() } : {}),
      ...(typeof isNew === 'boolean' ? { isNew } : {}),
    };
  });
}
