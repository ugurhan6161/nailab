import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Typography, Container, Grid, Paper, Button, Divider, CircularProgress, Chip, List, ListItem, ListItemText
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useProducts } from '../context/ProductsContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

export default function AdminDashboardPage() {
  const { authenticated, loading: authLoading, logout } = useAdminAuth();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authenticated) { navigate('/admin/giris'); return; }
    if (productsLoading) return;
    (async () => {
      try {
        if (productsError) throw new Error(`Ürünler yüklenemedi: ${productsError}`);
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })
          .limit(10);
        if (ordersError) throw ordersError;
        const recent = (orders ?? []) as Order[];
        const revenue = recent.reduce((sum, order) => sum + (order.total || 0), 0);
        const pending = recent.filter((order) => order.status === 'beklemede' || order.status === 'onaylandı').length;
        setStats({ products: products.length, orders: recent.length, revenue, pending });
        setRecentOrders(recent);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Admin verileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [authenticated, authLoading, navigate, products, productsError, productsLoading]);

  if (!authenticated) return null;

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Çıkış yapılamadı.');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'background.paper', py: 2.5 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DashboardOutlinedIcon sx={{ color: 'secondary.main' }} />
            <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: 'text.primary' }}>Admin Panel</Typography>
          </Box>
          <Button onClick={handleSignOut} size="small" sx={{ color: 'secondary.light', borderColor: 'divider' }} variant="outlined">Çıkış</Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {/* Nav tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Genel Bakış', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 16 }} />, active: true },
            { label: 'Ürünler', href: '/admin/urunler', icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} /> },
            { label: 'İçerik düzenle', href: '/admin/icerik', icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} /> },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} /> },
          ].map(t => (
            <Button key={t.href} component={Link} to={t.href}
              variant={t.active ? 'contained' : 'outlined'} size="small"
              startIcon={t.icon}
              color="secondary"
              sx={{ borderRadius: 2, textTransform: 'none' }}>
              {t.label}
            </Button>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#A9876D' }} /></Box>
        ) : (
          <>
            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { icon: <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />, label: 'Toplam Ürün', value: stats.products, color: 'secondary.main' },
                { icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 28 }} />, label: 'Toplam Sipariş', value: stats.orders, color: 'success.main' },
                { icon: <TrendingUpIcon sx={{ fontSize: 28 }} />, label: 'Toplam Gelir', value: `${stats.revenue.toLocaleString('tr-TR')} ₺`, color: 'info.main' },
                { icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 28 }} />, label: 'Bekleyen Sipariş', value: stats.pending, color: 'warning.main' },
              ].map(s => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ color: s.color, mb: 1.5 }}>{s.icon}</Box>
                    <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 28, fontWeight: 700, color: 'text.primary' }}>{s.value}</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{s.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Recent orders */}
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Son Siparişler
              </Typography>
              <List>
                {recentOrders.map((o, i) => (
                  <Box key={o.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>{o.order_number}</Typography>}
                        secondary={
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }} component="span">
                            {new Date(o.created_at).toLocaleDateString('tr-TR')} · {o.guest_name || 'Üye'}
                          </Typography>
                        }
                      />
                      <Chip label={o.status} size="small" color={statusColor(o.status)} sx={{ mr: 2, fontSize: 11, fontWeight: 600 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary' }}>{o.total.toLocaleString('tr-TR')} ₺</Typography>
                    </ListItem>
                    {i < recentOrders.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          </>
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
