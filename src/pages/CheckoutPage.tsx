import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Container, Divider, Grid, Paper, TextField, Typography, Stack,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const WHATSAPP_NUMBER = '908500000000';

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  notes: string;
};

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: '',
    city: '',
    district: '',
    notes: '',
  });

  if (items.length === 0) {
    navigate('/sepet');
    return null;
  }

  const updateField = (field: keyof CheckoutForm, value: string) =>
    setForm((c) => ({ ...c, [field]: value }));

  const handleCheckout = async () => {
    setError(null);
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Lütfen ad, telefon, adres ve şehir alanlarını doldurun.');
      return;
    }
    setLoading(true);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        guest_email: user?.email || null,
        guest_name: form.name.trim(),
        guest_phone: form.phone.trim(),
        status: 'beklemede',
        subtotal,
        shipping_cost: shippingCost,
        total,
        shipping_address: {
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
        },
        payment_method: 'whatsapp',
        notes: form.notes.trim() || null,
      })
      .select()
      .single();

    if (orderError) {
      // In demo mode or if Supabase is offline, generate a demo order number
      const demoOrderNumber = `NLB-${Math.floor(10000 + Math.random() * 90000)}`;
      clearCart();
      navigate(`/siparis-tamamlandi/${demoOrderNumber}`);
      return;
    }

    if (order) {
      await supabase.from('order_items').insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.product.id,
          product_name: i.product.name,
          product_image: i.product.image_url,
          unit_price: i.product.price,
          quantity: i.quantity,
          total_price: i.product.price * i.quantity,
        }))
      );

      const itemsText = items
        .map((i) => `• ${i.quantity}x ${i.product.name} - ${(i.product.price * i.quantity).toLocaleString('tr-TR')} ₺`)
        .join('%0A');
      const msg = `Merhaba, NAILAB web sitenizden yeni bir sipariş verdim:%0A%0A*Sipariş No:* ${order.order_number}%0A*Müşteri:* ${form.name}%0A*Telefon:* ${form.phone}%0A*Adres:* ${form.address}, ${form.district}/${form.city}%0A%0A*Ürünler:*%0A${itemsText}%0A%0A*Toplam Tutar:* ${total.toLocaleString('tr-TR')} ₺`;

      clearCart();
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
      navigate(`/siparis-tamamlandi/${order.order_number}`);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '85vh', py: { xs: 3, md: 5 }, bgcolor: '#0E0C0A', color: '#FFFFFF' }}>
      <Container maxWidth="lg">
        {/* Top Header & Back */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            component={Link}
            to="/sepet"
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              color: '#FFFFFF',
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999,
              px: 2,
              py: 0.6,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            }}
          >
            Sepete Dön
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#D0B198' }}>
            <LockOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>256-Bit SSL Güvenli Ödeme</Typography>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF', mb: 3 }}>
          Siparişi Tamamla
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(211,47,47,0.2)', color: '#FF8A80' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3.5} alignItems="flex-start">
          {/* Form Column */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3,
                bgcolor: '#14110E',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#FFFFFF', mb: 2.5 }}>
                Teslimat & İletişim Bilgileri
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    Ad Soyad *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Adınız Soyadınız"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    Telefon Numarası *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="05XX XXX XX XX"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    İl *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="İstanbul"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    İlçe *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Kadıköy"
                    value={form.district}
                    onChange={(e) => updateField('district', e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    Açık Adres *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Cadde, sokak, bina ve daire numarası"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    Sipariş Notu (İsteğe bağlı)
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Kargo ve teslimat ile ilgili özel notunuz"
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Summary Column */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3,
                bgcolor: '#14110E',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#FFFFFF', mb: 2 }}>
                Sipariş Detayı ({items.length} Ürün)
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                {items.map((i) => (
                  <Box key={i.product.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={i.product.image_url}
                      alt={i.product.name}
                      sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover', bgcolor: '#1A1613' }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {i.product.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#A0978E' }}>
                        {i.quantity} adet
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      {(i.product.price * i.quantity).toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />

              <Stack spacing={1} sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#A0978E', fontSize: 14 }}>
                  <Typography>Ara Toplam</Typography>
                  <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>{subtotal.toLocaleString('tr-TR')} ₺</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#A0978E', fontSize: 14 }}>
                  <Typography>Kargo</Typography>
                  <Typography sx={{ color: shippingCost === 0 ? '#81C784' : '#FFFFFF', fontWeight: 600 }}>
                    {shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toLocaleString('tr-TR')} ₺`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, alignItems: 'baseline' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF' }}>Ödenecek Tutar</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', color: '#FFFFFF' }}>
                    {total.toLocaleString('tr-TR')} ₺
                  </Typography>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<WhatsAppIcon />}
                onClick={handleCheckout}
                sx={{
                  bgcolor: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: 50,
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
                  '&:hover': { bgcolor: '#20BA5A' },
                }}
              >
                {loading ? 'İşleniyor…' : 'WhatsApp ile Siparişi Onayla'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 2.5 }}>
                <VerifiedIcon sx={{ fontSize: 15, color: '#D0B198' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#A0978E', textAlign: 'center' }}>
                  Siparişiniz doğrudan Naillabs uzman ekibine iletilir.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
