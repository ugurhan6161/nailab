import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress, Container, Divider, FormControl, MenuItem, Paper,
  Select, Stack, Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

const statusOptions = ['beklemede', 'onaylandı', 'hazırlanıyor', 'kargoda', 'teslim edildi', 'iptal'];

export default function AdminOrdersPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/admin/giris'); return; }
    if (profile && profile.role !== 'admin') { navigate('/'); return; }
    supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [user, profile, navigate]);

  if (!user) return null;

  const handleStatusChange = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    if (!error) setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };
  const pendingCount = orders.filter((order) => order.status === 'beklemede').length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 2 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><WhatsAppIcon sx={{ color: 'secondary.light' }} /><Typography variant="h2" sx={{ color: 'inherit', fontSize: { xs: '1.1rem', md: '1.35rem' } }}>WhatsApp siparişleri</Typography></Box>
          <Button onClick={handleSignOut} size="small" variant="outlined" sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.35)' }}>Çıkış</Button>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 5 } }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }}>
          {[
            { label: 'Özet', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'Ürünler', href: '/admin/urunler', icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />, active: true },
          ].map((item) => <Button key={item.href} component={Link} to={item.href} startIcon={item.icon} variant={item.active ? 'contained' : 'outlined'} size="small" sx={{ whiteSpace: 'nowrap' }}>{item.label}</Button>)}
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 3 }}>
          <Box><Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.7rem' } }}>Siparişler</Typography><Typography color="text.secondary" sx={{ mt: 0.5 }}>WhatsApp’tan gelen talepleri tek yerden yönetin.</Typography></Box>
          <Chip label={`${pendingCount} yeni`} color="secondary" sx={{ color: 'white', fontWeight: 700 }} />
        </Box>

        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress color="secondary" /></Box> : orders.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}><WhatsAppIcon sx={{ fontSize: 42, color: 'secondary.main', mb: 1 }} /><Typography color="text.secondary">Henüz WhatsApp siparişi yok.</Typography></Paper>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => <Paper key={order.id} sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box><Typography sx={{ fontWeight: 800 }}>{order.order_number}</Typography><Typography variant="caption" color="text.secondary">{new Date(order.created_at).toLocaleDateString('tr-TR')} · {order.guest_name || 'Üye'}</Typography></Box>
                <Chip label={order.status} size="small" sx={{ bgcolor: statusBg(order.status), color: 'white', fontWeight: 700 }} />
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

function statusBg(status: string) {
  const colors: Record<string, string> = { onaylandı: '#397A58', kargoda: '#3A7BD5', 'teslim edildi': '#397A58', iptal: '#B94A48', beklemede: '#B77B52', hazırlanıyor: '#806F64' };
  return colors[status] || '#806F64';
}
