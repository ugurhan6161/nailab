import type { Order } from './supabase';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

export function openOrderReceipt(order: Order, orderNumber: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('Sipariş formu açılamadı. Tarayıcıda açılır pencere izni verin.');
  printWindow.opener = null;

  const items = (order.order_items ?? []).map((item) => `
    <tr>
      <td>${escapeHtml(item.product_name)}</td>
      <td class="number">${item.quantity}</td>
      <td class="number">${Number(item.unit_price).toLocaleString('tr-TR')} ₺</td>
      <td class="number">${Number(item.total_price).toLocaleString('tr-TR')} ₺</td>
    </tr>
  `).join('');
  const address = order.shipping_address;
  const addressLine = [
    address?.address,
    address?.district,
    address?.city,
  ].filter((value): value is string => Boolean(value)).map(escapeHtml).join(', ');
  const status = escapeHtml(order.status);

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>NAILAB Sipariş Formu ${escapeHtml(orderNumber)}</title>
        <style>
          @page { size: A4; margin: 18mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #211b17; font: 14px Arial, sans-serif; }
          header { display: flex; align-items: center; gap: 16px; padding-bottom: 22px; border-bottom: 2px solid #d0b198; }
          header img { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; }
          h1 { margin: 0; font-size: 23px; letter-spacing: 2px; }
          header p { margin: 5px 0 0; color: #75685e; }
          h2 { margin: 28px 0 14px; font-size: 17px; }
          .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .field { padding: 11px 12px; border: 1px solid #e8dfd8; border-radius: 8px; }
          .label { display: block; margin-bottom: 5px; color: #75685e; font-size: 11px; }
          .value { font-weight: 700; overflow-wrap: anywhere; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 11px 8px; border-bottom: 1px solid #e8dfd8; text-align: left; }
          th { background: #f7f3ef; color: #51463e; font-size: 11px; }
          .number { text-align: right; white-space: nowrap; }
          .totals { width: 280px; margin: 18px 0 0 auto; }
          .total-row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; }
          .grand-total { margin-top: 5px; padding-top: 11px; border-top: 2px solid #d0b198; font-size: 17px; font-weight: 700; }
          footer { margin-top: 42px; padding-top: 12px; border-top: 1px solid #e8dfd8; color: #75685e; font-size: 11px; text-align: center; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <header>
          <img src="${window.location.origin}/assets/naillabs/logo.png" alt="NAILAB logo">
          <div><h1>NAILAB</h1><p>Ön sipariş formu</p></div>
        </header>
        <h2>Sipariş bilgileri</h2>
        <section class="summary">
          <div class="field"><span class="label">Sipariş kodu</span><span class="value">${escapeHtml(orderNumber)}</span></div>
          <div class="field"><span class="label">Sipariş durumu</span><span class="value">${status}</span></div>
          <div class="field"><span class="label">Oluşturulma tarihi</span><span class="value">${escapeHtml(new Date(order.created_at).toLocaleString('tr-TR'))}</span></div>
          ${order.guest_name ? `<div class="field"><span class="label">Müşteri</span><span class="value">${escapeHtml(order.guest_name)}</span></div>` : ''}
          ${order.guest_phone ? `<div class="field"><span class="label">Telefon</span><span class="value">${escapeHtml(order.guest_phone)}</span></div>` : ''}
          ${addressLine ? `<div class="field"><span class="label">Teslimat adresi</span><span class="value">${addressLine}</span></div>` : ''}
        </section>
        <h2>Ürünler</h2>
        <table>
          <thead><tr><th>Ürün</th><th class="number">Adet</th><th class="number">Birim fiyat</th><th class="number">Tutar</th></tr></thead>
          <tbody>${items || '<tr><td colspan="4">Ürün bilgisi bulunamadı.</td></tr>'}</tbody>
        </table>
        <section class="totals">
          <div class="total-row"><span>Ara toplam</span><span>${Number(order.subtotal).toLocaleString('tr-TR')} ₺</span></div>
          <div class="total-row"><span>Kargo</span><span>${Number(order.shipping_cost).toLocaleString('tr-TR')} ₺</span></div>
          <div class="total-row grand-total"><span>Genel toplam</span><span>${Number(order.total).toLocaleString('tr-TR')} ₺</span></div>
        </section>
        <footer>Bu form sipariş kaydı amacıyla oluşturulmuştur. NAILAB · ${escapeHtml(orderNumber)}</footer>
        <script>
          window.addEventListener('load', () => {
            window.focus();
            window.print();
          });
          window.addEventListener('afterprint', () => window.close());
        </script>
      </body>
    </html>`);
  printWindow.document.close();
}
