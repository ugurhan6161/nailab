import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Typography, Container, Paper, Button, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useProducts } from '../context/ProductsContext';

export default function AdminProductsPage() {
  const { authenticated, loading: authLoading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const { products, loading, error, refresh } = useProducts();

  useEffect(() => {
    if (!authLoading && !authenticated) navigate('/admin/giris');
  }, [authenticated, authLoading, navigate]);

  if (authLoading || !authenticated) return null;

  const handleSignOut = async () => { await logout(); navigate('/'); };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'background.paper', py: 2.5 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Inventory2OutlinedIcon sx={{ color: 'secondary.main' }} />
            <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: 'text.primary' }}>Admin Panel</Typography>
          </Box>
          <Button onClick={handleSignOut} size="small" variant="outlined" color="secondary">Çıkış</Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Genel Bakış', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 16 }} /> },
            { label: 'Ürünler', href: '/admin/urunler', icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />, active: true },
            { label: 'İçerik düzenle', href: '/admin/icerik', icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} /> },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} /> },
          ].map(t => (
            <Button key={t.href} component={Link} to={t.href}
              variant={t.active ? 'contained' : 'outlined'} size="small" startIcon={t.icon}
              color="secondary" sx={{ borderRadius: 2, textTransform: 'none' }}>
              {t.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 26, fontWeight: 700, color: 'text.primary' }}>Ürünler</Typography>
          <Button variant="outlined" color="secondary" startIcon={<RefreshIcon />} onClick={refresh} sx={{ borderRadius: 2 }}>
            Yenile
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Ürün, fiyat ve web sitesi metinlerini değiştirmek için{' '}
          <Button component={Link} to="/admin/icerik" size="small">içerik düzenleyiciyi açın</Button>.
        </Alert>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#A9876D' }} /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.paper' }}>
                  {['Ürün', 'Kategori', 'Fiyat', 'Stok', 'Durum'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13, color: 'text.primary' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box component="img" src={p.image} alt={p.title} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{p.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={p.category} size="small" color="secondary" variant="outlined" sx={{ fontSize: 11 }} /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.price.toLocaleString('tr-TR')} ₺</TableCell>
                    <TableCell>{p.stock ?? 50}</TableCell>
                    <TableCell><Chip label={(p.stock ?? 50) > 0 && p.price > 0 ? 'Satışta' : 'Satış dışı'} size="small" color={(p.stock ?? 50) > 0 && p.price > 0 ? 'success' : 'default'} variant="outlined" sx={{ fontSize: 11 }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

    </Box>
  );
}
