import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Divider, FormControl, MenuItem, Paper,
  Select, Stack, Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useAdminAuth } from '../context/AdminAuthContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

const statusOptions = ['beklemede', 'onaylandı', 'hazırlanıyor', 'kargoda', 'teslim edildi', 'iptal'];

export default function AdminOrdersPage() {
  const { authenticated, loading: authLoading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authenticated) { navigate('/admin/giris'); return; }
    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });
        if (loadError) throw loadError;
        if (active) setOrders((data ?? []) as Order[]);
      } catch (loadError: unknown) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Siparişler yüklenemedi.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [authenticated, authLoading, navigate]);

  if (!authenticated) return null;

  const handleStatusChange = async (orderId: string, status: string) => {
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (updateError) throw updateError;
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Sipariş durumu güncellenemedi.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Çıkış yapılamadı.');
    }
  };
  const pendingCount = orders.filter((order) => order.status === 'beklemede').length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'background.paper', py: 2 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><ShoppingBagOutlinedIcon sx={{ color: 'secondary.main' }} /><Typography variant="h2" sx={{ color: 'text.primary', fontSize: { xs: '1.1rem', md: '1.35rem' } }}>Ön siparişler</Typography></Box>
          <Button onClick={handleSignOut} size="small" variant="outlined" color="secondary">Çıkış</Button>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 5 } }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }}>
          {[
            { label: 'Özet', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'Ürünler', href: '/admin/urunler', icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'İçerik düzenle', href: '/admin/icerik', icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />, active: true },
          ].map((item) => <Button key={item.href} component={Link} to={item.href} startIcon={item.icon} variant={item.active ? 'contained' : 'outlined'} color="secondary" size="small" sx={{ whiteSpace: 'nowrap' }}>{item.label}</Button>)}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 3 }}>
          <Box><Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.7rem' } }}>Siparişler</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>Web sitesinden oluşturulan ön siparişleri yönetin.</Typography></Box>
          <Chip label={`${pendingCount} yeni`} color="secondary" sx={{ fontWeight: 700 }} />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress color="secondary" /></Box> : orders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}><ShoppingBagOutlinedIcon sx={{ fontSize: 42, color: 'secondary.main', mb: 1 }} /><Typography color="text.secondary">Henüz ön sipariş yok.</Typography></Paper>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => <Paper key={order.id} sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box><Typography sx={{ fontWeight: 800 }}>{order.order_number}</Typography><Typography variant="caption" color="text.secondary">{new Date(order.created_at).toLocaleDateString('tr-TR')} · {order.guest_name || 'Üye'}</Typography></Box>
                <Chip label={order.status} size="small" color={statusColor(order.status)} sx={{ fontWeight: 700 }} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">{order.order_items?.length || 0} ürün · {order.guest_phone || 'Kayıtlı müşteri'}</Typography>
                <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: '1.25rem', fontWeight: 700 }}>{order.total.toLocaleString('tr-TR')} TL</Typography>
              </Box>
              <FormControl fullWidth size="small" sx={{ mt: 2 }}><Select value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)}>{statusOptions.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</Select></FormControl>
            </Paper>)}
          </Stack>
        )}
      </Container>
    </Box>
  );
}

function statusColor(status: string): 'success' | 'info' | 'error' | 'warning' | 'secondary' {
  const colors: Record<string, 'success' | 'info' | 'error' | 'warning' | 'secondary'> = {
    'onaylandı': 'success',
    'kargoda': 'info',
    'teslim edildi': 'success',
    'iptal': 'error',
    'beklemede': 'warning',
    'hazırlanıyor': 'secondary',
  };
  return colors[status] ?? 'secondary';
}
