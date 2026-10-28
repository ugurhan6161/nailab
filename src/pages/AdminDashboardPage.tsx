import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Paper, Button, Divider, CircularProgress, Chip, List, ListItem, ListItemText
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';

export default function AdminDashboardPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/admin/giris'); return; }
    if (profile && profile.role !== 'admin') { navigate('/'); return; }
    (async () => {
      const [{ count: pCount }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      const revenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);
      const pending = (orders || []).filter(o => o.status === 'beklemede' || o.status === 'onaylandı').length;
      setStats({ products: pCount || 0, orders: orders?.length || 0, revenue, pending });
      setRecentOrders(orders || []);
      setLoading(false);
    })();
  }, [user, profile, navigate]);

  if (!user) return null;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: '#000000', py: 2.5 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DashboardOutlinedIcon sx={{ color: '#A9876D' }} />
            <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>Admin Panel</Typography>
          </Box>
          <Button onClick={handleSignOut} size="small" sx={{ color: '#EED2BC', borderColor: 'rgba(201,149,106,0.4)' }} variant="outlined">Çıkış</Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Nav tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Genel Bakış', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 16 }} />, active: true },
            { label: 'Ürünler', href: '/admin/urunler', icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} /> },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} /> },
          ].map(t => (
            <Button key={t.href} component={Link} to={t.href}
              variant={t.active ? 'contained' : 'outlined'} size="small"
              startIcon={t.icon}
              sx={t.active
                ? { bgcolor: '#000000', color: 'white', borderRadius: 2, textTransform: 'none' }
                : { borderColor: 'rgba(201,149,106,0.3)', color: '#000000', borderRadius: 2, textTransform: 'none' }
              }>
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
                { icon: <Inventory2OutlinedIcon sx={{ fontSize: 28 }} />, label: 'Toplam Ürün', value: stats.products, color: '#A9876D' },
                { icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 28 }} />, label: 'Toplam Sipariş', value: stats.orders, color: '#3DA56F' },
                { icon: <TrendingUpIcon sx={{ fontSize: 28 }} />, label: 'Toplam Gelir', value: `${stats.revenue.toLocaleString('tr-TR')} ₺`, color: '#3A7BD5' },
                { icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 28 }} />, label: 'Bekleyen Sipariş', value: stats.pending, color: '#B8924A' },
              ].map(s => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
                  <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(201,149,106,0.15)' }}>
                    <Box sx={{ color: s.color, mb: 1.5 }}>{s.icon}</Box>
                    <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 28, fontWeight: 700, color: '#000000' }}>{s.value}</Typography>
                    <Typography sx={{ fontSize: 13, color: '#5E564D' }}>{s.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Recent orders */}
            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(201,149,106,0.15)' }}>
              <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#000000', mb: 2 }}>
                Son Siparişler
              </Typography>
              <List>
                {recentOrders.map((o, i) => (
                  <Box key={o.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600, fontSize: 14, color: '#000000' }}>{o.order_number}</Typography>}
                        secondary={
                          <Typography sx={{ fontSize: 12, color: '#5E564D' }} component="span">
                            {new Date(o.created_at).toLocaleDateString('tr-TR')} · {o.guest_name || 'Üye'}
                          </Typography>
                        }
                      />
                      <Chip label={o.status} size="small" sx={{ mr: 2, bgcolor: statusBg(o.status), color: 'white', fontSize: 11, fontWeight: 600 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#000000' }}>{o.total.toLocaleString('tr-TR')} ₺</Typography>
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

function statusBg(status: string) {
  const colors: Record<string, string> = {
    'onaylandı': '#3DA56F', 'kargoda': '#3A7BD5', 'teslim edildi': '#3DA56F',
    'iptal': '#D64545', 'beklemede': '#B8924A', 'hazırlanıyor': '#A9876D',
  };
  return colors[status] || '#5E564D';
}
