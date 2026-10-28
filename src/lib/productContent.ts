import type { Product } from './supabase';

export const PRODUCT_SLUG = 'naillabs-profesyonel-egitim-kiti';
export const PRODUCT_ID = 'naillabs-profesyonel-egitim-kiti-ornek';
export const PRODUCT_NAME = 'Naillabs Profesyonel Eğitim Kiti';
export const PRODUCT_TAGLINE = 'Profesyonel Tırnak Eğitim Kiti';
export const PRODUCT_DESCRIPTION =
  'Temel manikür kurslarında eksik kalan profesyonel eğitim kiti. Özellikle tırnak eğitmenleri için geliştirilmiştir. Eğitim sırasında öğrencilerin farklı tırnak formları ve freze uygulamaları üzerinde pratik yapabilmesini sağlayan, uygulamaya yönelik profesyonel bir eğitim kitidir.';

export const KIT_CONTENT = [
  {
    title: 'Anatomik formatta büyük eğitim parmağı',
    text: 'Gerçek tırnak yapısını ve uygulama açısını daha yakından taklit edecek şekilde tasarlanmış eğitim parmağı.',
  },
  {
    title: '4 farklı freze ucu',
    text: 'Manikür uygulamalarında farklı çalışma ihtiyaçlarına yönelik 4 farklı freze ucu.',
  },
  {
    title: '4 farklı değiştirilebilir tırnak formu',
    text: 'Kare, Uzun kemerli kare, Yuvarlatılmış köşeli dikdörtgen, Badem. Farklı tırnak formları üzerinde çalışma imkânı sunan değiştirilebilir sistem sayesinde, eğitim sürecinde farklı uygulamalar tek bir kit üzerinden gerçekleştirilebilir.',
  },
];

export const BENEFITS = [
  {
    title: 'Geniş ve anatomik gösterim',
    text: 'Hareketleri küçük bir parmak üzerinde göstermeye çalışmak yerine, geniş ve anatomik bir eğitim parmağında herkesin net göreceği şekilde anlatın.',
  },
  {
    title: '4 değiştirilebilir form',
    text: 'Kare, uzun kemerli kare, yuvarlatılmış köşeli dikdörtgen ve badem formlarını tek kit üzerinden değiştirerek çalışın.',
  },
  {
    title: 'Derse sistematik yaklaşım',
    text: 'Eğitiminizi uygulamayla destekleyin. Derslerinizi daha uygulamalı ve sistematik şekilde yürütün.',
  },
];

export const FAQ = [
  { q: 'Bu kit kimler için?', a: 'Özellikle tırnak eğitmenleri, kurs ve akademi sahipleri için geliştirilmiştir.' },
  { q: 'Kitin içinde kaç form var?', a: 'Kare, uzun kemerli kare, yuvarlatılmış köşeli dikdörtgen ve badem olmak üzere 4 farklı değiştirilebilir tırnak formu bulunur.' },
  { q: 'Freze uçları dahil mi?', a: 'Evet, manikür uygulamalarında farklı çalışma ihtiyaçlarına yönelik 4 farklı freze ucu kitin içeriğindedir.' },
  { q: 'Kargo ne zaman gelir?', a: 'Sipariş onaylandıktan sonra 2-4 iş günü içinde teslim edilir.' },
  { q: 'İade edebilir miyim?', a: 'Kullanılmamış ve orijinal ambalajında olan ürünleri 14 gün içinde iade edebilirsiniz.' },
];

export const NAIL_FORMS = [
  { name: 'Kare', variant: 'square' as const },
  { name: 'Uzun kemerli kare', variant: 'coffin' as const },
  { name: 'Yuvarlatılmış köşeli dikdörtgen', variant: 'rounded' as const },
  { name: 'Badem', variant: 'almond' as const },
];

export const demoProduct: Product = {
  id: PRODUCT_ID,
  name: PRODUCT_NAME,
  description: PRODUCT_DESCRIPTION,
  price: 1250,
  original_price: 1550,
  image_url: '/assets/naillabs/screen.png',
  category: 'kit',
  badge: 'Patentli Form',
  stock: 45,
  rating: 4.95,
  review_count: 142,
  is_active: true,
  created_at: new Date().toISOString(),
};

export function formatPrice(kurus: number): string {
  return `${(kurus / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}
