import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Button, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';

export default function AdminProductsPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'malzeme', stock: '', image_url: '', badge: '' });

  useEffect(() => {
    if (!user) { navigate('/admin/giris'); return; }
    if (profile && profile.role !== 'admin') { navigate('/'); return; }
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, [user, profile, navigate]);

  if (!user) return null;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', category: 'malzeme', stock: '', image_url: '', badge: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), category: p.category, stock: String(p.stock), image_url: p.image_url || '', badge: p.badge || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name, description: form.description, price: parseFloat(form.price) || 0,
      category: form.category, stock: parseInt(form.stock) || 0, image_url: form.image_url, badge: form.badge || null,
    };
    if (editProduct) {
      await supabase.from('products').update(payload).eq('id', editProduct.id);
    } else {
      await supabase.from('products').insert({ ...payload, is_active: true, rating: 4.5, review_count: 0 });
    }
    setDialogOpen(false);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: '#000000', py: 2.5 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Inventory2OutlinedIcon sx={{ color: '#A9876D' }} />
            <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>Admin Panel</Typography>
          </Box>
          <Button onClick={handleSignOut} size="small" variant="outlined" sx={{ color: '#EED2BC', borderColor: 'rgba(201,149,106,0.4)' }}>Çıkış</Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Genel Bakış', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 16 }} /> },
            { label: 'Ürünler', href: '/admin/urunler', icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />, active: true },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} /> },
          ].map(t => (
            <Button key={t.href} component={Link} to={t.href}
              variant={t.active ? 'contained' : 'outlined'} size="small" startIcon={t.icon}
              sx={t.active
                ? { bgcolor: '#000000', color: 'white', borderRadius: 2, textTransform: 'none' }
                : { borderColor: 'rgba(201,149,106,0.3)', color: '#000000', borderRadius: 2, textTransform: 'none' }
              }>
              {t.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 26, fontWeight: 700, color: '#000000' }}>Ürünler</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ bgcolor: '#A9876D', color: 'white', borderRadius: 2, '&:hover': { bgcolor: '#8B6950' } }}>
            Yeni Ürün
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress sx={{ color: '#A9876D' }} /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid rgba(201,149,106,0.15)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F0EB' }}>
                  {['Ürün', 'Kategori', 'Fiyat', 'Stok', 'Durum', 'İşlem'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13, color: '#000000' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box component="img" src={p.image_url} alt={p.name} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#000000' }}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={p.category} size="small" sx={{ fontSize: 11 }} /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.price.toLocaleString('tr-TR')} ₺</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell><Chip label={p.is_active ? 'Aktif' : 'Pasif'} size="small" sx={{ bgcolor: p.is_active ? '#E8F5E9' : '#F9F1EC', color: p.is_active ? '#3DA56F' : '#5E564D', fontSize: 11 }} /></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEdit(p)}><EditIcon sx={{ fontSize: 16, color: '#A9876D' }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(p.id)}><DeleteIcon sx={{ fontSize: 16, color: '#D64545' }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Jost, Arial, sans-serif', fontWeight: 700, color: '#000000' }}>
          {editProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Ürün Adı" size="small" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Açıklama" size="small" fullWidth multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Fiyat" size="small" type="number" fullWidth value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              <TextField label="Stok" size="small" type="number" fullWidth value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </Box>
            <TextField select label="Kategori" size="small" fullWidth value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {['kit', 'ekipman', 'malzeme', 'kurs'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField label="Görsel URL" size="small" fullWidth value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            <TextField label="Etiket (Yeni, Fırsat, Çok Satan)" size="small" fullWidth value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#5E564D' }}>İptal</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#000000', color: 'white', '&:hover': { bgcolor: '#A9876D' } }}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
