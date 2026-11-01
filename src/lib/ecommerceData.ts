import type { Product } from './supabase';

export interface CategoryItem {
  id: string;
  databaseId: string;
  tag: string;
  title: string;
  image: string;
  description: string;
  itemCount: number;
  isFeatured: boolean;
}

export interface StoreProduct {
  id: string;
  databaseId?: string;
  title: string;
  category: string;
  price: number;
  priceFormatted?: string;
  stock?: number;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  badge?: string;
  isNew?: boolean;
}

export function toAppProduct(p: StoreProduct): Product {
  return {
    id: p.databaseId ?? p.id,
    slug: p.id,
    name: p.title,
    description: p.description,
    price: p.price,
    original_price: null,
    image_url: p.image,
    category: p.category,
    badge: p.badge || null,
    stock: p.stock ?? 50,
    rating: p.rating,
    review_count: p.reviews,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

export function getCategoryProducts(products: StoreProduct[], categoryTag?: string): StoreProduct[] {
  if (!categoryTag || categoryTag.toLowerCase() === 'all') {
    return products;
  }
  return products.filter(
    (p) => p.category.toLowerCase() === categoryTag.toLowerCase()
  );
}
