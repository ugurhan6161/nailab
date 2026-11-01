import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Typography, Container, Paper, Button, Divider, CircularProgress, Chip
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../lib/supabase';
import { siteText } from '../context/WebsiteDataContext';



export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/giris'); return; }

    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!active) return;
        if (loadError) {
          setError('Siparişler yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.');
          console.error('Müşteri siparişleri yüklenemedi:', loadError);
          return;
        }
        setOrders(data || []);
        setError(null);
      } catch (loadError) {
        if (!active) return;
        console.error('Müşteri siparişleri yüklenemedi:', loadError);
        setError('Siparişler yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  return (
    <Box sx={{ bgcolor: '#0E0C0A', minHeight: '85vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => navigate('/hesabim')}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              color: '#A0978E',
              fontSize: '0.85rem',
              textTransform: 'none',
              '&:hover': { color: '#D0B198' },
            }}
          >
            {siteText("src/pages/OrdersPage.tsx#65758129ef27", "Hesabıma Geri Dön ")}</Button>
        </Box>

        <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF', mb: 4 }}>
          {siteText("src/pages/OrdersPage.tsx#0915a43dd2d9", "Siparişlerim ")}</Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#D0B198' }} /></Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#14110E', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography sx={{ fontSize: 48, mb: 2 }}>{siteText("src/pages/OrdersPage.tsx#e68ebc94437c", "📦")}</Typography>
            <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 22, color: '#FFFFFF', mb: 1 }}>
              {siteText("src/pages/OrdersPage.tsx#12f052a0063f", "Henüz siparişiniz yok ")}</Typography>
            <Typography sx={{ color: '#A0978E', mb: 3 }}>{siteText("src/pages/OrdersPage.tsx#b768c1bb488a", "Mağazaya göz atarak ilk siparişinizi hemen verebilirsiniz.")}</Typography>
            <Button component={Link} to="/magaza" variant="contained" sx={{ bgcolor: '#D0B198', color: '#0E0C0A', fontWeight: 700, px: 4, py: 1.2, borderRadius: 999, '&:hover': { bgcolor: '#EED2BC' } }}>
              {siteText("src/pages/OrdersPage.tsx#ef0efbe02ee1", "Mağazaya Git ")}</Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {orders.map(o => (
              <Paper key={o.id} sx={{ p: 3, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF' }}>{o.order_number}</Typography>
                    <Chip label={o.status} size="small" sx={{ bgcolor: statusBg(o.status), color: '#FFFFFF', fontSize: 11, fontWeight: 600, height: 22 }} />
                  </Box>
                  <Typography sx={{ fontSize: 13, color: '#A0978E' }}>
                    {new Date(o.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, mb: 2 }}>
                  {o.order_items?.map((item: OrderItem) => (
                    <Box key={item.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 200, bgcolor: 'rgba(255,255,255,0.03)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Box component="img" src={item.product_image || undefined} alt={item.product_name}
                        sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0, bgcolor: '#000000' }} />
                      <Box>
                        <Typography sx={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {item.product_name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#A0978E' }}>{item.quantity} {siteText("src/pages/OrdersPage.tsx#5fd945674020", "adet")}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#A0978E' }}>
                      {o.order_items?.length || 0} {siteText("src/pages/OrdersPage.tsx#2fa970b47de0", "ürün · ")}
                      {paymentMethodText(o.payment_method)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#D0B198' }}>
                    {o.total.toLocaleString('tr-TR')} {siteText("src/pages/OrdersPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

function paymentMethodText(method: string) {
  if (method === 'kredi_karti') return siteText('src/pages/OrdersPage.tsx#payment.card', 'Kredi Kartı');
  if (method === 'havale') return siteText('src/pages/OrdersPage.tsx#payment.transfer', 'Havale/EFT');
  return siteText('src/pages/OrdersPage.tsx#payment.cash', 'Kapıda Ödeme');
}

function statusBg(status: string) {
  const colors: Record<string, string> = {
    'onaylandı': '#15803D', 'kargoda': '#1D4ED8', 'teslim edildi': '#15803D',
    'iptal': '#B91C1C', 'beklemede': '#B45309', 'hazırlanıyor': '#A16207',
  };
  return colors[status] || '#4B5563';
}
