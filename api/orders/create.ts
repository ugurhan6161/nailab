import { createClient } from '@supabase/supabase-js';

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type RequestedItem = {
  product_id: string;
  quantity: number;
};

type CheckoutPayload = {
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  district: string;
  notes: string;
  items: RequestedItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function parsePayload(value: unknown): CheckoutPayload | null {
  if (!isRecord(value)) return null;
  const { name, phone, email, address, city, district, notes, items } = value;
  if (
    typeof name !== 'string' || name.trim().length < 2 || name.length > 120 ||
    typeof phone !== 'string' || phone.trim().length < 7 || phone.length > 40 ||
    (email !== null && typeof email !== 'string') ||
    typeof address !== 'string' || !address.trim() || address.length > 500 ||
    typeof city !== 'string' || !city.trim() || city.length > 120 ||
    typeof district !== 'string' || district.length > 120 ||
    typeof notes !== 'string' || notes.length > 1000 ||
    !Array.isArray(items) || items.length < 1 || items.length > 100
  ) return null;

  const validItems = items.every((item) =>
    isRecord(item) &&
    typeof item.product_id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.product_id) &&
    Number.isInteger(item.quantity) && Number(item.quantity) >= 1 && Number(item.quantity) <= 100,
  );
  if (!validItems) return null;

  return {
    name: name.trim(),
    phone: phone.trim(),
    email: typeof email === 'string' && email.trim() ? email.trim().slice(0, 320) : null,
    address: address.trim(),
    city: city.trim(),
    district: district.trim(),
    notes: notes.trim(),
    items: items as RequestedItem[],
  };
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Bu uç nokta yalnızca POST isteklerini kabul eder.' });
    return;
  }

  const payload = parsePayload(request.body);
  if (!payload) {
    response.status(400).json({ error: 'Sipariş bilgileri eksik veya geçersiz.' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Sipariş oluşturma için Supabase sunucu ortam değişkenleri tanımlanmamış.');
    response.status(500).json({ error: 'Sipariş altyapısı şu anda kullanılamıyor.' });
    return;
  }

  const rawAuthorization = request.headers.authorization;
  const authorization = Array.isArray(rawAuthorization) ? rawAuthorization[0] : rawAuthorization;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(authorization ? { global: { headers: { Authorization: authorization } } } : {}),
  });

  const { data: order, error: orderError } = await supabase.rpc('create_store_order', {
    p_guest_name: payload.name,
    p_guest_phone: payload.phone,
    p_guest_email: payload.email,
    p_shipping_address: {
      address: payload.address,
      city: payload.city,
      district: payload.district,
    },
    p_notes: payload.notes,
    p_items: payload.items,
  });

  if (orderError || !isRecord(order) || typeof order.order_number !== 'string') {
    console.error('Supabase sipariş kaydı oluşturulamadı:', orderError?.message ?? 'Beklenmeyen yanıt.');
    response.status(400).json({ error: orderError?.message ?? 'Sipariş kaydı oluşturulamadı.' });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  let telegramNotified = false;

  if (!botToken || !chatId) {
    console.error('Sipariş Telegram bildirimi gönderilemedi; Telegram ortam değişkenleri tanımlanmamış.', order.order_number);
  } else {
    const orderItems = Array.isArray(order.order_items) ? order.order_items : [];
    const itemLines = orderItems
      .filter(isRecord)
      .slice(0, 20)
      .map((item) => {
        const quantity = Number(item.quantity);
        const price = Number(item.total_price);
        const name = typeof item.product_name === 'string' ? item.product_name.slice(0, 80) : 'Ürün';
        return `• ${quantity} × ${escapeHtml(name)} — ${price.toLocaleString('tr-TR')} ₺`;
      });
    const addressLine = [
      payload.address,
      payload.district,
      payload.city,
    ].filter(Boolean).map(escapeHtml).join(', ');
    const text = [
      '<b>Yeni ön sipariş</b>',
      `<b>Sipariş kodu:</b> ${escapeHtml(order.order_number)}`,
      `<b>Müşteri:</b> ${escapeHtml(payload.name)}`,
      `<b>Telefon:</b> ${escapeHtml(payload.phone)}`,
      `<b>E-posta:</b> ${escapeHtml(payload.email || 'Belirtilmedi')}`,
      `<b>Teslimat adresi:</b> ${addressLine}`,
      '',
      '<b>Ürünler:</b>',
      ...(itemLines.length > 0 ? itemLines : ['Ürün detayı bulunamadı']),
      ...(orderItems.length > 20 ? [`… ve ${orderItems.length - 20} ürün daha`] : []),
      '',
      `<b>Toplam:</b> ${Number(order.total ?? 0).toLocaleString('tr-TR')} ₺`,
      ...(payload.notes ? [`<b>Not:</b> ${escapeHtml(payload.notes.slice(0, 400))}`] : []),
    ].join('\n');

    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
      const telegramResult: unknown = await telegramResponse.json();
      telegramNotified = telegramResponse.ok && isRecord(telegramResult) && telegramResult.ok === true;
      if (!telegramNotified) {
        console.error('Telegram sipariş bildirimi gönderilemedi.', order.order_number, telegramResponse.status);
      }
    } catch (telegramError) {
      console.error(
        'Telegram sipariş bildirimi gönderilemedi.',
        order.order_number,
        telegramError instanceof Error ? telegramError.message : 'Bilinmeyen ağ hatası.',
      );
    }
  }

  response.status(200).json({ order, telegramNotified });
}
