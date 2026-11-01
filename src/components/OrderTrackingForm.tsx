import { useState } from 'react';
import {
  Alert, Box, CircularProgress, Divider, Paper, Stack, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LiquidMetalButton from './LiquidMetalButton';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

type Props = {
  compact?: boolean;
};

const statusLabels: Record<string, string> = {
  beklemede: 'Ön sipariş alındı',
  'onaylandı': 'Sipariş onaylandı',
  hazırlanıyor: 'Sipariş hazırlanıyor',
  kargoda: 'Kargoya verildi',
  'teslim edildi': 'Teslim edildi',
  iptal: 'Sipariş iptal edildi',
};

export default function OrderTrackingForm({ compact = false }: Props) {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = orderNumber.trim();
    if (!code) {
      setError('Sipariş kodunuzu girin.');
      setOrder(null);
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const { data, error: lookupError } = await supabase.rpc('get_public_order', {
        p_order_number: code,
      });
      if (lookupError) throw lookupError;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        setError('Bu kodla eşleşen bir sipariş bulunamadı. Sipariş kodunu kontrol edin.');
        return;
      }
      setOrder(data as Order);
    } catch (lookupError) {
      setError(lookupError instanceof Error
        ? `Sipariş durumu yüklenemedi: ${lookupError.message}`
        : 'Sipariş durumu yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <Stack spacing={2}>
      <Box>
        <Typography variant={compact ? 'h3' : 'h1'} sx={{ fontSize: compact ? '1.1rem' : { xs: '1.8rem', md: '2.2rem' }, mb: 0.5 }}>
          Siparişini takip et
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Üye olmadan, sipariş onayında aldığınız kodla durumunu öğrenin.
        </Typography>
      </Box>
      <Box component="form" onSubmit={(event) => void lookupOrder(event)}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            required
            name="orderNumber"
            label="Sipariş kodu"
            placeholder="NL-…"
            value={orderNumber}
            autoComplete="off"
            onChange={(event) => setOrderNumber(event.target.value)}
            inputProps={{ 'aria-describedby': error ? 'order-tracking-error' : undefined }}
          />
          <LiquidMetalButton
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
            sx={{ minWidth: { sm: 150 } }}
          >
            {loading ? 'Aranıyor…' : 'Siparişi bul'}
          </LiquidMetalButton>
        </Stack>
      </Box>
      {error && <Alert id="order-tracking-error" severity="error" role="alert">{error}</Alert>}
      {order && (
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'divider' }} aria-live="polite">
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Sipariş kodu</Typography>
                <Typography fontWeight={700}>{order.order_number}</Typography>
              </Box>
              <Box sx={{ textAlign: { sm: 'right' } }}>
                <Typography variant="caption" color="text.secondary">Durum</Typography>
                <Typography fontWeight={700} color="secondary.main">
                  {statusLabels[order.status] ?? order.status}
                </Typography>
              </Box>
            </Box>
            <Divider />
            {order.order_items?.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="body2">{item.product_name} × {item.quantity}</Typography>
                <Typography variant="body2" fontWeight={600}>{Number(item.total_price).toLocaleString('tr-TR')} ₺</Typography>
              </Box>
            ))}
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight={700}>Toplam</Typography>
              <Typography fontWeight={700}>{Number(order.total).toLocaleString('tr-TR')} ₺</Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </Stack>
  );

  return compact
    ? <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>{content}</Box>
    : <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>{content}</Paper>;
}
