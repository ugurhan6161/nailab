import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, Divider, Paper, Stack, Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { openOrderReceipt } from '../lib/orderReceipt';
import { siteText } from '../context/WebsiteDataContext';

type ConfirmationState = {
  order?: Order;
  telegramNotified?: boolean;
};

const statusLabels: Record<string, string> = {
  beklemede: 'Ön sipariş alındı',
  'onaylandı': 'Sipariş onaylandı',
  hazırlanıyor: 'Sipariş hazırlanıyor',
  kargoda: 'Kargoya verildi',
  'teslim edildi': 'Teslim edildi',
  iptal: 'Sipariş iptal edildi',
};

export default function OrderCompletePage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const confirmationState = location.state as ConfirmationState | null;
  const [order, setOrder] = useState<Order | null>(confirmationState?.order ?? null);
  const [telegramNotified] = useState<boolean | undefined>(confirmationState?.telegramNotified);
  const [loading, setLoading] = useState(Boolean(orderNumber && !confirmationState?.order));
  const [loadError, setLoadError] = useState<string | null>(
    orderNumber ? null : 'Sipariş kodu bulunamadı.',
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_order', { p_order_number: orderNumber });
        if (error) throw error;
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          if (active && !confirmationState?.order) setLoadError('Sipariş kaydı kodla eşleşmedi. Sipariş takibinden yeniden deneyin.');
          return;
        }
        if (active) {
          setOrder((current) => ({ ...(data as Order), ...current, status: (data as Order).status }));
        }
      } catch (error) {
        if (active && !confirmationState?.order) {
          setLoadError(error instanceof Error ? `Sipariş bilgileri yüklenemedi: ${error.message}` : 'Sipariş bilgileri yüklenemedi.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [confirmationState?.order, orderNumber]);

  const copyOrderNumber = async () => {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setActionMessage('Sipariş kodu panoya kopyalandı.');
    } catch {
      setActionMessage('Kopyalama izni alınamadı. Sipariş kodunu seçip elle kopyalayabilirsiniz.');
    }
  };

  const downloadReceipt = () => {
    if (!order || !orderNumber) return;
    try {
      openOrderReceipt(order, orderNumber);
      setActionMessage('Sipariş formu açıldı. Yazdırma penceresinde “PDF olarak kaydet” seçeneğini kullanın.');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Sipariş formu açılamadı.');
    }
  };

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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(56,142,60,0.18)',
            border: '1px solid rgba(56,142,60,0.4)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', mx: 'auto', mb: 2.5,
          }}>
            <CheckCircleIcon sx={{ fontSize: 52, color: '#4CAF50' }} />
          </Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 26, md: 36 }, color: '#FFFFFF', mb: 1 }}>
            {siteText("src/pages/OrderCompletePage.tsx#a82efac7bf49", "Siparişiniz Alındı!")}
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: '#A0978E', mb: 1 }}>
            Sipariş kodunuz:{' '}
            <Box component="strong" sx={{ color: '#D0B198', letterSpacing: '0.05em' }}>{orderNumber}</Box>
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#A0978E' }}>
            Sipariş kodunuzu saklayın; hesabınıza giriş yapmadan da durumunu takip edebilirsiniz.
          </Typography>
        </Box>

        {loadError && <Alert severity="warning" sx={{ mb: 2 }}>{loadError}</Alert>}
        {telegramNotified === false && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Siparişiniz kaydedildi ancak Telegram bildirimi gönderilemedi. Ekibimiz siparişinizi panelden görebilir.
          </Alert>
        )}
        {actionMessage && <Alert severity="success" role="status" sx={{ mb: 2 }}>{actionMessage}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
          <Button fullWidth variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => void copyOrderNumber()}>
            Sipariş kodunu kopyala
          </Button>
          <Button fullWidth variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={downloadReceipt} disabled={!order}>
            PDF indir
          </Button>
        </Stack>

        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)', mb: 4 }}>
          {order ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Typography variant="h2" sx={{ fontSize: '1.2rem', color: '#FFFFFF' }}>Sipariş özeti</Typography>
                <Typography sx={{ color: '#D0B198', fontWeight: 700 }}>
                  {statusLabels[order.status] ?? order.status}
                </Typography>
              </Box>
              {(order.guest_name || order.guest_phone || order.shipping_address?.address) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  {order.guest_name && <Box><Typography variant="caption" color="text.secondary">Müşteri</Typography><Typography fontWeight={600}>{order.guest_name}</Typography></Box>}
                  {order.guest_phone && <Box><Typography variant="caption" color="text.secondary">Telefon</Typography><Typography fontWeight={600}>{order.guest_phone}</Typography></Box>}
                  {order.shipping_address?.address && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Teslimat adresi</Typography>
                      <Typography variant="body2">
                        {[order.shipping_address.address, order.shipping_address.district, order.shipping_address.city].filter(Boolean).join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {order.order_items?.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={600}>{item.product_name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.quantity} × {Number(item.unit_price).toLocaleString('tr-TR')} ₺</Typography>
                    </Box>
                    <Typography fontWeight={700} whiteSpace="nowrap">{Number(item.total_price).toLocaleString('tr-TR')} ₺</Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
              <Stack spacing={0.75} sx={{ maxWidth: 320, ml: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Ara toplam</Typography>
                  <Typography>{Number(order.subtotal).toLocaleString('tr-TR')} ₺</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Kargo</Typography>
                  <Typography>{Number(order.shipping_cost).toLocaleString('tr-TR')} ₺</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                  <Typography fontWeight={700}>Toplam</Typography>
                  <Typography fontWeight={800} color="secondary.main">{Number(order.total).toLocaleString('tr-TR')} ₺</Typography>
                </Box>
              </Stack>
            </>
          ) : (
            <Typography sx={{ color: '#A0978E', textAlign: 'center' }}>
              Sipariş detayları şu an yüklenemedi. Kodunuzla sipariş takip alanından tekrar sorgulayabilirsiniz.
            </Typography>
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button component={Link} to="/magaza" variant="contained" endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#FFFFFF', color: '#000000', borderRadius: 50, px: 3.5, py: 1.2, '&:hover': { bgcolor: '#F5ECE3' } }}>
            {siteText("src/pages/OrderCompletePage.tsx#2cbd9c6fb82a", "Alışverişe Devam Et")}
          </Button>
          <Button component={Link} to="/siparis-takip" variant="outlined"
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', borderRadius: 50, px: 3, py: 1.2 }}>
            Sipariş durumunu takip et
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
