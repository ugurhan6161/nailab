import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Typography, Container, Button, CircularProgress, Paper, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../lib/supabase';

export default function OrderCompletePage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    supabase.rpc('get_public_order', { p_order_number: orderNumber }).then(({ data }) => {
      setOrder(data);
      setLoading(false);
    });
  }, [orderNumber]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 16, bgcolor: '#0E0C0A', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#D0B198' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0E0C0A', minHeight: '85vh', py: { xs: 5, md: 8 }, color: '#FFFFFF' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              bgcolor: 'rgba(56,142,60,0.18)',
              border: '1px solid rgba(56,142,60,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 52, color: '#4CAF50' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: 'Jost, Arial, sans-serif',
              fontSize: { xs: 26, md: 36 },
              fontWeight: 700,
              color: '#FFFFFF',
              mb: 1,
            }}
          >
            Siparişiniz Alındı!
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: '#A0978E', mb: 1 }}>
            Sipariş numaranız:{' '}
            <Box component="strong" sx={{ color: '#D0B198', letterSpacing: '0.05em' }}>
              {orderNumber}
            </Box>
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#777068' }}>
            Sipariş detaylarınız kaydedildi. Ekibimiz sizinle en kısa sürede iletişime geçecektir.
          </Typography>
        </Box>

        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: '#14110E',
            border: '1px solid rgba(255,255,255,0.08)',
            mb: 4,
          }}
        >
          {order ? (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#FFFFFF', mb: 2 }}>
                Sipariş Özeti
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#888888' }}>Müşteri</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#FFFFFF' }}>{order.guest_name}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#888888' }}>Telefon</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#FFFFFF' }}>{order.guest_phone}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#888888' }}>Teslimat Adresi</Typography>
                  <Typography sx={{ fontSize: 13, color: '#FFFFFF' }}>
                    {order.shipping_address?.address}, {order.shipping_address?.district}/{order.shipping_address?.city}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#888888' }}>Toplam Tutar</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#D0B198' }}>
                    {order.total.toLocaleString('tr-TR')} ₺
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF', mb: 2 }}>
                  Sipariş Edilen Ürünler
                </Typography>
                {order.order_items?.map((item: OrderItem) => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={item.product_image || undefined}
                      alt={item.product_name}
                      sx={{ width: 56, height: 56, borderRadius: 1.5, objectFit: 'cover', bgcolor: '#1A1613' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#FFFFFF' }}>
                        {item.product_name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#888888' }}>
                        {item.quantity} x {item.unit_price.toLocaleString('tr-TR')} ₺
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>
                      {item.total_price.toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography sx={{ color: '#A0978E', mb: 1 }}>
                Sipariş kaydınız sistemimize başarıyla ulaştı.
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#777068' }}>
                Siparişinizi yukarıdaki sipariş numarası ile dilediğiniz zaman takip edebilirsiniz.
              </Typography>
            </Box>
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/magaza"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#000000',
              borderRadius: 50,
              px: 3.5,
              py: 1.2,
              fontWeight: 700,
              '&:hover': { bgcolor: '#F5ECE3' },
            }}
          >
            Alışverişe Devam Et
          </Button>
          <Button
            component={Link}
            to="/siparis-takip"
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              borderRadius: 50,
              px: 3,
              py: 1.2,
              fontWeight: 600,
              '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            Sipariş Takibi
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
