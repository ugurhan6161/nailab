import type { Product } from './supabase';

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

export interface StoreProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  priceFormatted: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  badge?: string;
  isNew?: boolean;
}

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'nailab-egitim-kiti',
    title: 'NAILAB™ Profesyonel Eğitim Kiti',
    category: 'kits',
    price: 1250,
    priceFormatted: '1.250 ₺',
    image: '/assets/naillabs/screen.png',
    description:
      '2.5x büyütülmüş mikro-anatomik kütikül cebi, 4 adet değiştirilebilir klinik tırnak formu ve manyetik masa standı ile tırnak eğitmenleri için patentli eğitim sistemi.',
    rating: 4.95,
    reviews: 142,
    badge: 'Patentli Form',
    isNew: true,
  },
  {
    id: 'clinical-freze-seti',
    title: 'Clinical Grade Elmas & Karbid Freze Ucu Seti (4 Parça)',
    category: 'bits',
    price: 490,
    priceFormatted: '490 ₺',
    image: '/assets/naillabs/screen-1.png',
    description:
      'Alman elmas tozu ve tungsten karbid kaplamalı 4 parça freze ucu. Titreşimsiz balans, sıfır kanama tekniği ve derin kütikül temizliği için tasarlanmıştır.',
    rating: 4.9,
    reviews: 118,
    badge: 'Klinik Standart',
    isNew: true,
  },
  {
    id: 'nailab-form-seti',
    title: 'NAILAB™ 4’lü Anatomik Tırnak Form Seti',
    category: 'forms',
    price: 360,
    priceFormatted: '360 ₺',
    image: '/assets/naillabs/screen.png',
    description:
      'Doğal Kare, Badem, Kemerli C-Curve ve Oval formlar. Manyetik kilitli, tekrarlı freze ve törpülemeye dayanıklı özel medikal polimer malzeme.',
    rating: 4.85,
    reviews: 89,
    badge: 'Çok Satan',
    isNew: true,
  },
  {
    id: 'tornado-karbid-seti',
    title: 'Tornado Titanyum Karbid & Rus Manikür Seti',
    category: 'bits',
    price: 520,
    priceFormatted: '520 ₺',
    image: '/assets/naillabs/screen-2.png',
    description:
      'Jel ve akrilik protez sökümünde aşırı ısınmayı engelleyen patentli spiral oluk yapılı tornado karbid uç ve hassas alev elmas başlık kombinasyonu.',
    rating: 4.9,
    reviews: 74,
    badge: 'Yeni Sezon',
    isNew: true,
  },
  {
    id: 'manyetik-stand-tablasi',
    title: 'Manyetik Paslanmaz Çelik Eğitmen Tablası',
    category: 'accessories',
    price: 320,
    priceFormatted: '320 ₺',
    image: '/assets/naillabs/screen-2.png',
    description:
      '650 gram ağırlığında fırçalanmış saten paslanmaz çelik taban. Neodimyum mıknatıs ile eğitim parmağını masa üzerinde sarsıntısız kilitler.',
    rating: 4.8,
    reviews: 52,
    badge: 'Donanım',
    isNew: false,
  },
  {
    id: 'silikon-yedek-parmak',
    title: 'NAILAB™ Anatomik Silikon Yedek Parmak Gövdesi',
    category: 'kits',
    price: 450,
    priceFormatted: '450 ₺',
    image: '/assets/naillabs/screen.png',
    description:
      'Gerçek insan dokusu esnekliğinde, kütikülü forseps ile kesilebilir ve geriye itilebilir medikal platin kür silikon gövde.',
    rating: 4.88,
    reviews: 43,
    badge: 'Yedek Modül',
    isNew: false,
  },
  {
    id: 'cerrahi-pens-seti',
    title: 'NAILAB™ Cerrahi Manikür Pensi & İtici Seti',
    category: 'accessories',
    price: 380,
    priceFormatted: '380 ₺',
    image: '/assets/ecommerce/beauty-1.jpg',
    description:
      'Elle bilenmiş cerrahi paslanmaz çelik kütikül pensi ve mikron hassasiyetinde kütikül itici spatül.',
    rating: 4.75,
    reviews: 67,
    badge: 'Profesyonel',
    isNew: true,
  },
  {
    id: 'masterclass-egitim',
    title: 'NAILAB™ Eğitmen Masterclass Sertifika Programı',
    category: 'academy',
    price: 3500,
    priceFormatted: '3.500 ₺',
    image: '/assets/ecommerce/background.jpg',
    description:
      'Klinik anatomi, cihazlı kombi manikür, protez tırnak mimarisi ve eğitmen pedagojisi içeren kapsamlı sertifikasyon eğitimi.',
    rating: 5.0,
    reviews: 95,
    badge: 'Sertifikalı',
    isNew: true,
  },
];

export function toAppProduct(p: StoreProduct): Product {
  return {
    id: p.id,
    name: p.title,
    description: p.description,
    price: p.price,
    original_price: null,
    image_url: p.image,
    category: p.category,
    badge: p.badge || null,
    stock: 50,
    rating: p.rating,
    review_count: p.reviews,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

export function getCategoryProducts(categoryTag?: string): StoreProduct[] {
  if (!categoryTag || categoryTag.toLowerCase() === 'all') {
    return STORE_PRODUCTS;
  }
  const filtered = STORE_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === categoryTag.toLowerCase()
  );
  return filtered.length > 0 ? filtered : STORE_PRODUCTS;
}
