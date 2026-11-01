import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Container, Divider, Grid, Paper, TextField, Typography, Stack,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { siteText } from '../context/WebsiteDataContext';

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
  const { error: catalogError, loading: catalogLoading, refresh } = useProducts();
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
    if (catalogLoading || catalogError) {
      setError('Güncel ürün fiyatları doğrulanmadan sipariş oluşturulamaz.');
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError('Lütfen ad, telefon, adres ve şehir alanlarını doldurun.');
      return;
    }
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(`Oturum doğrulanamadı: ${sessionError.message}`);
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionData.session?.access_token
            ? { Authorization: `Bearer ${sessionData.session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: user?.email ?? null,
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          notes: form.notes.trim(),
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const result = await response.json() as { order?: Order; telegramNotified?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || 'Sipariş oluşturulamadı.');
      if (!result.order || typeof result.order.order_number !== 'string') {
        throw new Error('Sipariş servisi beklenen biçimde yanıt vermedi.');
      }

      clearCart();
      navigate(`/siparis-tamamlandi/${result.order.order_number}`, {
        state: { order: result.order, telegramNotified: result.telegramNotified === true },
      });
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? `Sipariş oluşturulamadı: ${checkoutError.message}` : 'Sipariş oluşturulamadı.');
    } finally {
      setLoading(false);
    }
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
            {siteText("src/pages/CheckoutPage.tsx#79159c05a39a", "Sepete Dön ")}</Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#D0B198' }}>
            <LockOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{siteText("src/pages/CheckoutPage.tsx#cef3f1c693b6", "256-Bit SSL Güvenli Ödeme")}</Typography>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF', mb: 3 }}>
          {siteText("src/pages/CheckoutPage.tsx#a3df78957fdf", "Siparişi Tamamla ")}</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(211,47,47,0.2)', color: '#FF8A80' }}>
            {error}
          </Alert>
        )}
        {catalogError && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={refresh}>{siteText("src/pages/CheckoutPage.tsx#1f30ff52f9d5", "Yeniden dene")}</Button>}
            sx={{ mb: 3, borderRadius: 3 }}
          >
            {siteText("src/pages/CheckoutPage.tsx#0284508024ac", "Güncel ürün fiyatları alınamadı; sipariş oluşturma geçici olarak devre dışı. ")}{catalogError}
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
                {siteText("src/pages/CheckoutPage.tsx#ef8e94b608bf", "Teslimat & İletişim Bilgileri ")}</Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    {siteText("src/pages/CheckoutPage.tsx#138ef6e3dd47", "Ad Soyad * ")}</Typography>
                  <TextField
                    fullWidth
                    placeholder={siteText("src/pages/CheckoutPage.tsx#49e5a97ce7df", "Adınız Soyadınız")}
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    {siteText("src/pages/CheckoutPage.tsx#6a34c27bb4dc", "Telefon Numarası * ")}</Typography>
                  <TextField
                    fullWidth
                    placeholder={siteText("src/pages/CheckoutPage.tsx#8c9d02847641", "05XX XXX XX XX")}
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    {siteText("src/pages/CheckoutPage.tsx#7d15def005f1", "İl * ")}</Typography>
                  <TextField
                    fullWidth
                    placeholder={siteText("src/pages/CheckoutPage.tsx#24ec8f72b5ea", "İstanbul")}
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    {siteText("src/pages/CheckoutPage.tsx#c89fd672ae54", "İlçe * ")}</Typography>
                  <TextField
                    fullWidth
                    placeholder={siteText("src/pages/CheckoutPage.tsx#56cd00ec149b", "Kadıköy")}
                    value={form.district}
                    onChange={(e) => updateField('district', e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    {siteText("src/pages/CheckoutPage.tsx#91d39c45f54c", "Açık Adres * ")}</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={siteText("src/pages/CheckoutPage.tsx#629abe81efa8", "Cadde, sokak, bina ve daire numarası")}
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#A0978E', fontWeight: 600, mb: 0.8 }}>
                    {siteText("src/pages/CheckoutPage.tsx#fd5708748f5b", "Sipariş Notu (İsteğe bağlı) ")}</Typography>
                  <TextField
                    fullWidth
                    placeholder={siteText("src/pages/CheckoutPage.tsx#7e950589fd8d", "Kargo ve teslimat ile ilgili özel notunuz")}
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
                {siteText("src/pages/CheckoutPage.tsx#4e2c56757684", "Sipariş Detayı (")}{items.length} {siteText("src/pages/CheckoutPage.tsx#675156940cd1", "Ürün) ")}</Typography>

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
                        {i.quantity} {siteText("src/pages/CheckoutPage.tsx#161fe6652531", "adet ")}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      {(i.product.price * i.quantity).toLocaleString('tr-TR')} {siteText("src/pages/CheckoutPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />

              <Stack spacing={1} sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#A0978E', fontSize: 14 }}>
                  <Typography>{siteText("src/pages/CheckoutPage.tsx#c680e0e7da71", "Ara Toplam")}</Typography>
                  <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>{subtotal.toLocaleString('tr-TR')} {siteText("src/pages/CheckoutPage.tsx#8416d7938c3d", "₺")}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#A0978E', fontSize: 14 }}>
                  <Typography>{siteText("src/pages/CheckoutPage.tsx#d949980d3c64", "Kargo")}</Typography>
                  <Typography sx={{ color: shippingCost === 0 ? '#81C784' : '#FFFFFF', fontWeight: 600 }}>
                    {shippingCost === 0
                      ? siteText('src/pages/CheckoutPage.tsx#shipping-free', 'Ücretsiz')
                      : `${shippingCost.toLocaleString('tr-TR')} ₺`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, alignItems: 'baseline' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFFFFF' }}>{siteText("src/pages/CheckoutPage.tsx#7f55e4b20280", "Ödenecek Tutar")}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.45rem', color: '#FFFFFF' }}>
                    {total.toLocaleString('tr-TR')} {siteText("src/pages/CheckoutPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || catalogLoading || Boolean(catalogError)}
                startIcon={<ShoppingBagOutlinedIcon />}
                onClick={handleCheckout}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#000000',
                  borderRadius: 50,
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  '&:hover': { bgcolor: '#F5ECE3' },
                }}
              >
                {loading
                  ? 'Oluşturuluyor…'
                  : 'Ön sipariş oluştur'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 2.5 }}>
                <VerifiedIcon sx={{ fontSize: 15, color: '#D0B198' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#A0978E', textAlign: 'center' }}>
                  {siteText("src/pages/CheckoutPage.tsx#4a481b872bb6", "                  Siparişiniz güvenle kaydedilir ve ekibimize Telegram üzerinden bildirilir. ")}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
