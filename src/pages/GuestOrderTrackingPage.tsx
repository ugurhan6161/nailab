import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Button, TextField, Paper, Divider, Alert, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../lib/supabase';

export default function GuestOrderTrackingPage() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    if (!orderNumber.trim()) { setError('Lütfen sipariş numaranızı girin.'); return; }
    setLoading(true);
    const { data, error: lookupError } = await supabase.rpc('get_public_order', { p_order_number: orderNumber.trim() });
    setLoading(false);
    if (lookupError || !data) { setError('Bu numaraya ait sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.'); setOrder(null); return; }
    setOrder(data as Order);
  };

  const statusSteps = ['beklemede', 'onaylandı', 'hazırlanıyor', 'kargoda', 'teslim edildi'];
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <Box sx={{ bgcolor: '#0E0C0A', minHeight: '85vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => navigate('/magaza')}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              color: '#A0978E',
              fontSize: '0.85rem',
              textTransform: 'none',
              '&:hover': { color: '#D0B198' },
            }}
          >
            Mağazaya Geri Dön
          </Button>
        </Box>

        <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF', mb: 1 }}>
          Sipariş Takibi
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#A0978E', mb: 4 }}>
          Sipariş numaranızla anlık sipariş ve kargo durumunuzu takip edin.
        </Typography>

        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)', mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
            <TextField
              fullWidth
              label="Sipariş Numarası"
              size="medium"
              placeholder="Örn: NL-12345678"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              sx={{
                '& .MuiInputLabel-root': { color: '#A0978E' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                  '&:hover fieldset': { borderColor: '#D0B198' },
                  '&.Mui-focused fieldset': { borderColor: '#D0B198' }
                }
              }}
            />
            <Button
              variant="contained"
              size="medium"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: '#0E0C0A' }} /> : <SearchIcon />}
              sx={{
                bgcolor: '#D0B198',
                color: '#0E0C0A',
                fontWeight: 700,
                px: 4,
                py: { xs: 1.5, sm: 'auto' },
                borderRadius: 2,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#EED2BC' }
              }}
            >
              Sorgula
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2, bgcolor: 'rgba(224,107,107,0.15)', color: '#FFB4B4' }}>{error}</Alert>}
        </Paper>

        {order && (
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 11, color: '#A0978E', textTransform: 'uppercase', letterSpacing: 1 }}>Sipariş No</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#FFFFFF' }}>{order.order_number}</Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography sx={{ fontSize: 11, color: '#A0978E', textTransform: 'uppercase', letterSpacing: 1 }}>Toplam Tutar</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#D0B198' }}>{order.total.toLocaleString('tr-TR')} ₺</Typography>
              </Box>
            </Box>

            {/* Status timeline */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 4 }}>
              {statusSteps.map((step, i) => (
                <Box key={step} sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    bgcolor: i <= currentStep ? '#D0B198' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Typography sx={{ fontSize: 12, color: i <= currentStep ? '#0E0C0A' : '#A0978E', fontWeight: 800 }}>{i + 1}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: i <= currentStep ? '#FFFFFF' : '#777068', fontWeight: i === currentStep ? 700 : 500 }}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </Typography>
                  {i < statusSteps.length - 1 && (
                    <Box sx={{ flex: 1, height: 2, bgcolor: i < currentStep ? '#D0B198' : 'rgba(255,255,255,0.1)', display: { xs: 'none', sm: 'block' } }} />
                  )}
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Items */}
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF', mb: 2 }}>Sipariş İçeriği</Typography>
            {order.order_items?.map((item: OrderItem) => (
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Box component="img" src={item.product_image || undefined} alt={item.product_name}
                  sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: 'cover', bgcolor: '#000000' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600 }}>{item.product_name}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#A0978E' }}>{item.quantity} x {item.unit_price.toLocaleString('tr-TR')} ₺</Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#D0B198' }}>{item.total_price.toLocaleString('tr-TR')} ₺</Typography>
              </Box>
            ))}
          </Paper>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography sx={{ fontSize: 13, color: '#A0978E' }}>
            Hesabınıza giriş yaparak tüm siparişlerinizi ve adreslerinizi yönetebilirsiniz.{' '}
            <Link to="/giris" style={{ color: '#D0B198', fontWeight: 600, textDecoration: 'none' }}>Giriş Yapın →</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
