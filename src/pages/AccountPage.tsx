import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Typography, Container, Grid, Paper, Button, Divider, CircularProgress, TextField
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { siteText } from '../context/WebsiteDataContext';



export default function AccountPage() {
  const { user, profile, loading: authLoading, signOut, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    district: '',
    city: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/giris'); return; }

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!active) return;
        if (error) {
          setOrdersError('Siparişler yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.');
          console.error('Müşteri siparişleri yüklenemedi:', error);
          return;
        }
        setOrders(data || []);
        setOrdersError(null);
      } catch (error) {
        if (!active) return;
        console.error('Müşteri siparişleri yüklenemedi:', error);
        setOrdersError('Siparişler yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [authLoading, user, navigate]);

  const handleStartEdit = () => {
    const address = profile?.address ?? {};
    setEditForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: address.address || '',
      district: address.district || '',
      city: address.city || '',
    });
    setProfileError(null);
    setProfileNotice(null);
    setEditMode(true);
  };

  if (authLoading || !user) return null;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    setProfileNotice(null);
    try {
      await saveProfile({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: {
          address: editForm.address.trim(),
          district: editForm.district.trim(),
          city: editForm.city.trim(),
        },
      });
      setProfileNotice('Profil bilgileri kaydedildi.');
      setEditMode(false);
    } catch (error) {
      console.error('Müşteri profili kaydedilemedi:', error);
      setProfileError('Profil bilgileri kaydedilemedi. Bağlantınızı kontrol edip yeniden deneyin.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#0E0C0A', minHeight: '85vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        {/* Back navigation */}
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
            {siteText("src/pages/AccountPage.tsx#773eca0282d2", "Mağazaya Geri Dön ")}</Button>
        </Box>

        <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF', mb: 4 }}>
          {siteText("src/pages/AccountPage.tsx#c1882cc47a22", "Hesabım ")}</Typography>

        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#D0B198', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#0E0C0A', fontWeight: 800, fontSize: 18 }}>
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>
                    {profile?.full_name || siteText('src/pages/AccountPage.tsx#fallback-name', 'Değerli Üyemiz')}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#A0978E', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{user.email}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
              {[
                { icon: <PersonOutlineIcon sx={{ fontSize: 18 }} />, label: siteText('src/pages/AccountPage.tsx#nav.profile', 'Profil Bilgileri'), active: true },
                { icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />, label: siteText('src/pages/AccountPage.tsx#nav.orders', 'Siparişlerim'), href: '/siparislerim' },
                { icon: <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />, label: siteText('src/pages/AccountPage.tsx#nav.addresses', 'Adreslerim'), href: '/hesabim#adreslerim' },
              ].map((item, i) => (
                <Button key={i} fullWidth component={item.href ? Link : 'button'} to={item.href}
                  sx={{
                    justifyContent: 'flex-start',
                    color: item.active ? '#D0B198' : '#A0978E',
                    bgcolor: item.active ? 'rgba(208,177,152,0.1)' : 'transparent',
                    fontWeight: item.active ? 700 : 500,
                    fontSize: 13,
                    py: 1.2,
                    borderRadius: 2,
                    mb: 0.5,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }
                  }}>
                  {item.icon}<Box sx={{ ml: 1.5 }}>{item.label}</Box>
                </Button>
              ))}
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />
              <Button fullWidth onClick={handleSignOut} sx={{ justifyContent: 'flex-start', color: '#E06B6B', fontSize: 13, py: 1, textTransform: 'none', '&:hover': { bgcolor: 'rgba(224,107,107,0.1)' } }}>
                <LogoutIcon sx={{ fontSize: 18 }} /><Box sx={{ ml: 1.5 }}>{siteText("src/pages/AccountPage.tsx#283092d12a56", "Çıkış Yap")}</Box>
              </Button>
            </Paper>
          </Grid>

          {/* Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Profile */}
            <Paper sx={{ p: 3.5, mb: 3, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                  {siteText("src/pages/AccountPage.tsx#f5afc587e807", "Profil Bilgileri ")}</Typography>
                {!editMode && (
                  <Button onClick={handleStartEdit} size="small" sx={{ color: '#D0B198', fontSize: 13, textTransform: 'none', border: '1px solid rgba(208,177,152,0.3)', borderRadius: 2, px: 2, '&:hover': { bgcolor: 'rgba(208,177,152,0.1)' } }}>
                    {siteText("src/pages/AccountPage.tsx#0016e5c7992e", "Düzenle ")}</Button>
                )}
              </Box>
              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
              {profileNotice && <Alert severity="success" sx={{ mb: 2 }}>{profileNotice}</Alert>}
              {editMode ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 440 }}>
                  <TextField
                    label={siteText("src/pages/AccountPage.tsx#ddd4f9684e96", "Ad Soyad")}
                    size="small"
                    fullWidth
                    value={editForm.full_name}
                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#A0978E' },
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#D0B198' },
                      }
                    }}
                  />
                  <TextField
                    label={siteText("src/pages/AccountPage.tsx#fa6906d76ee9", "Telefon")}
                    size="small"
                    fullWidth
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#A0978E' },
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#D0B198' },
                      }
                    }}
                  />
                  <TextField
                    id="adreslerim"
                    label={siteText('src/pages/AccountPage.tsx#address', 'Adres')}
                    fullWidth
                    multiline
                    minRows={2}
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={siteText('src/pages/AccountPage.tsx#district', 'İlçe')}
                        fullWidth
                        value={editForm.district}
                        onChange={e => setEditForm({ ...editForm, district: e.target.value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label={siteText('src/pages/AccountPage.tsx#city', 'Şehir')}
                        fullWidth
                        value={editForm.city}
                        onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                    <Button variant="contained" size="small" onClick={handleSaveProfile} disabled={savingProfile} sx={{ bgcolor: '#D0B198', color: '#0E0C0A', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#EED2BC' } }}>
                      {savingProfile ? <CircularProgress size={18} color="inherit" /> : siteText("src/pages/AccountPage.tsx#6e6d5251fcd5", "Kaydet ")}</Button>
                    <Button onClick={() => setEditMode(false)} disabled={savingProfile} size="small" sx={{ color: '#A0978E', '&:hover': { color: '#FFFFFF' } }}>
                      {siteText("src/pages/AccountPage.tsx#e3566e11bb29", "İptal ")}</Button>
                  </Box>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ fontSize: 11, color: '#A0978E', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>{siteText("src/pages/AccountPage.tsx#ddd4f9684e96", "Ad Soyad")}</Typography>
                    <Typography sx={{ fontSize: 15, color: '#FFFFFF', fontWeight: 600 }}>
                      {profile?.full_name || siteText('src/pages/AccountPage.tsx#fallback-unspecified', 'Belirtilmedi')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ fontSize: 11, color: '#A0978E', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>{siteText("src/pages/AccountPage.tsx#e1081b69d80a", "E-posta")}</Typography>
                    <Typography sx={{ fontSize: 15, color: '#FFFFFF', fontWeight: 600 }}>{user.email}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography sx={{ fontSize: 11, color: '#A0978E', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>{siteText("src/pages/AccountPage.tsx#fa6906d76ee9", "Telefon")}</Typography>
                    <Typography sx={{ fontSize: 15, color: '#FFFFFF', fontWeight: 600 }}>
                      {profile?.phone || siteText('src/pages/AccountPage.tsx#fallback-unspecified', 'Belirtilmedi')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }} id="adreslerim">
                    <Typography sx={{ fontSize: 11, color: '#A0978E', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>
                      {siteText('src/pages/AccountPage.tsx#address', 'Adres')}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: '#FFFFFF', fontWeight: 600 }}>
                      {[profile?.address?.address, profile?.address?.district, profile?.address?.city].filter(Boolean).join(', ')
                        || siteText('src/pages/AccountPage.tsx#fallback-address', 'Belirtilmedi')}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>

            {/* Recent Orders */}
            <Paper sx={{ p: 3.5, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                  {siteText("src/pages/AccountPage.tsx#0c9f1c2e2606", "Son Siparişlerim ")}</Typography>
                <Button component={Link} to="/siparislerim" size="small" sx={{ color: '#D0B198', fontSize: 13, textTransform: 'none', '&:hover': { color: '#EED2BC' } }}>
                  {siteText("src/pages/AccountPage.tsx#d0d594c901b9", "Tümünü Gör ")}</Button>
              </Box>

              {ordersError && <Alert severity="error" sx={{ mb: 2 }}>{ordersError}</Alert>}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: '#D0B198' }} /></Box>
              ) : orders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography sx={{ fontSize: 36, mb: 1 }}>{siteText("src/pages/AccountPage.tsx#e68ebc94437c", "📦")}</Typography>
                  <Typography sx={{ color: '#A0978E', mb: 2 }}>{siteText("src/pages/AccountPage.tsx#bad56d15f24b", "Henüz siparişiniz bulunmamaktadır.")}</Typography>
                  <Button component={Link} to="/magaza" variant="contained" sx={{ bgcolor: '#D0B198', color: '#0E0C0A', fontWeight: 700, px: 3, py: 1, borderRadius: 999, '&:hover': { bgcolor: '#EED2BC' } }}>
                    {siteText("src/pages/AccountPage.tsx#466b08a67c3c", "Alışverişe Başla ")}</Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {orders.slice(0, 3).map(o => (
                    <Box key={o.id} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{o.order_number}</Typography>
                        <Typography sx={{ fontSize: 12, color: statusColor(o.status), fontWeight: 600 }}>{o.status}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 12, color: '#A0978E' }}>{new Date(o.created_at).toLocaleDateString('tr-TR')} {siteText("src/pages/AccountPage.tsx#6e01f78b9eb4", "· ")}{o.order_items?.length || 0} {siteText("src/pages/AccountPage.tsx#8f90c1f536f3", "ürün")}</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#D0B198' }}>{o.total.toLocaleString('tr-TR')} {siteText("src/pages/AccountPage.tsx#8416d7938c3d", "₺")}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function statusColor(status: string) {
  const colors: Record<string, string> = {
    'onaylandı': '#4ADE80', 'kargoda': '#60A5FA', 'teslim edildi': '#4ADE80',
    'iptal': '#F87171', 'beklemede': '#FBBF24', 'hazırlanıyor': '#D0B198',
  };
  return colors[status] || '#A0978E';
}
