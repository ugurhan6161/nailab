import type { Product } from './supabase';
import { siteText } from '../context/WebsiteDataContext';

export interface CategoryItem {
  id: string;
  tag: string;
  title: string;
  image: string;
  description: string;
  itemCount: number;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'kits',
    tag: 'kits',
    title: 'Eğitim Kitleri',
    image: '/assets/naillabs/screen.png',
    description: 'Patentli anatomik büyütülmüş eğitim parmağı ve 4 formlu modüler sistem.',
    itemCount: 4,
  },
  {
    id: 'bits',
    tag: 'bits',
    title: 'Freze Uçları',
    image: '/assets/naillabs/screen-1.png',
    description: 'Clinical grade elektro-kaplamalı elmas ve karbid Rus manikür uçları.',
    itemCount: 8,
  },
  {
    id: 'forms',
    tag: 'forms',
    title: 'Tırnak Formları',
    image: '/assets/naillabs/screen.png',
    description: 'Doğal Kare, Badem, Kemerli C-Curve ve Oval klinik polimer yataklar.',
    itemCount: 6,
  },
  {
    id: 'accessories',
    tag: 'accessories',
    title: 'Ekipmanlar',
    image: '/assets/naillabs/screen-2.png',
    description: 'Ağır paslanmaz çelik manyetik tablalar, cerrahi pensler ve iticiler.',
    itemCount: 5,
  },
  {
    id: 'care',
    tag: 'care',
    title: 'Bakım & Jel',
    image: '/assets/ecommerce/beauty-1.jpg',
    description: 'Organik kütikül yağları, protez tırnak bazı ve klinikal solüsyonlar.',
    itemCount: 7,
  },
  {
    id: 'academy',
    tag: 'academy',
    title: 'Akademi',
    image: '/assets/ecommerce/background.jpg',
    description: 'Sertifikalı eğitmen eğitimi, Rus manikürü ve protez tırnak masterclass.',
    itemCount: 3,
  },
];

export const BEST_SELLING_CATEGORIES = [
  {
    id: 'bits',
    title: 'Freze Uçları',
    image: '/assets/naillabs/screen-1.png',
    tag: 'bits',
  },
  {
    id: 'kits',
    title: 'Eğitim Kitleri',
    image: '/assets/naillabs/screen.png',
    tag: 'kits',
  },
  {
    id: 'forms',
    title: 'Tırnak Formları',
    image: '/assets/naillabs/screen.png',
    tag: 'forms',
  },
  {
    id: 'accessories',
    title: 'Ekipmanlar',
    image: '/assets/naillabs/screen-2.png',
    tag: 'accessories',
  },
  {
    id: 'academy',
    title: 'Akademi',
    image: '/assets/ecommerce/background.jpg',
    tag: 'academy',
  },
];

export function getCategories(): CategoryItem[] {
  return CATEGORIES.map((category) => ({
    ...category,
    title: siteText(`src/lib/ecommerceData.ts#category.${category.id}.title`, category.title),
    description: siteText(`src/lib/ecommerceData.ts#category.${category.id}.description`, category.description),
  }));
}

export function getBestSellingCategories() {
  return BEST_SELLING_CATEGORIES.map((category) => ({
    ...category,
    title: siteText(`src/lib/ecommerceData.ts#best-selling.${category.id}.title`, category.title),
  }));
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
