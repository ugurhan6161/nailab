import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Checkbox, CircularProgress,
  Container, FormControlLabel, Grid, Paper, Stack, TextField, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useProducts } from '../context/ProductsContext';
import { useWebsiteData } from '../context/WebsiteDataContext';
import type { StoreProduct } from '../lib/ecommerceData';
import defaults from '../../config/websiteData.json';

type WebsiteData = {
  copy: Record<string, string>;
  [key: string]: unknown;
};
const defaultCopy = defaults.copy as Record<string, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Sunucu geçerli JSON döndürmedi (${response.status}).`);
  }
}

function messageFrom(body: unknown, fallback: string): string {
  return isRecord(body) && typeof body.error === 'string' ? body.error : fallback;
}

export default function AdminContentPage() {
  const { authenticated, loading: authLoading, logout } = useAdminAuth();
  const { products, loading: productsLoading, error: productsError, refresh } = useProducts();
  const { updateWebsiteData } = useWebsiteData();
  const navigate = useNavigate();
  const [websiteData, setWebsiteData] = useState<WebsiteData>({
    copy: defaults.copy as Record<string, string>,
  });
  const [productDrafts, setProductDrafts] = useState<StoreProduct[] | null>(null);
  const [copySearch, setCopySearch] = useState('');
  const [expandedCopySections, setExpandedCopySections] = useState<string[]>(['src/pages/HomePage.tsx']);
  const [saving, setSaving] = useState(false);
  const [loadingWebsiteData, setLoadingWebsiteData] = useState(true);
  const [websiteDataLoaded, setWebsiteDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/website-data', { cache: 'no-store' })
      .then(async (response) => {
        const body = await readJson(response);
        if (!response.ok) throw new Error(messageFrom(body, 'WebsiteData yüklenemedi.'));
        if (!isRecord(body) || !isRecord(body.websiteData)) {
          throw new Error('WebsiteData API beklenen biçimde yanıt vermedi.');
        }
        const remote = body.websiteData;
        const remoteCopy = isRecord(remote.copy) ? remote.copy : {};
        const copy = Object.fromEntries(
          Object.entries({ ...defaults.copy, ...remoteCopy })
            .filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
        );
        if (active) {
          setWebsiteData({ ...remote, copy });
          setWebsiteDataLoaded(true);
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'WebsiteData yüklenemedi.');
      })
      .finally(() => {
        if (active) setLoadingWebsiteData(false);
      });
    return () => { active = false; };
  }, []);

  const visibleCopy = useMemo(
    () => Object.entries(websiteData.copy).filter(([key, value]) =>
      `${key} ${value} ${defaultCopy[key] ?? ''}`
        .toLocaleLowerCase('tr-TR').includes(copySearch.toLocaleLowerCase('tr-TR')),
    ),
    [copySearch, websiteData.copy],
  );
  const groupedCopy = useMemo(() => {
    const groups = new Map<string, Array<[string, string]>>();
    for (const entry of visibleCopy) {
      const separator = entry[0].indexOf('#');
      const section = separator < 0 ? 'WebsiteData' : entry[0].slice(0, separator);
      groups.set(section, [...(groups.get(section) ?? []), entry]);
    }
    return [...groups.entries()];
  }, [visibleCopy]);
  const editableProducts = productDrafts ?? products;

  useEffect(() => {
    if (!authLoading && !authenticated) navigate('/admin/giris');
  }, [authLoading, authenticated, navigate]);

  if (!authLoading && !authenticated) return null;

  if (authLoading || productsLoading || loadingWebsiteData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  }

  const updateProduct = (id: string, field: keyof StoreProduct, value: string | number | boolean) => {
    setProductDrafts((current) => (current ?? products).map((product) =>
      product.id === id ? { ...product, [field]: value } : product,
    ));
    setSaved(false);
  };

  const addProduct = () => {
    const id = `urun-${Date.now()}`;
    setProductDrafts((current) => [...(current ?? products), {
      id,
      title: 'Yeni ürün',
      category: 'kits',
      price: 0,
      priceFormatted: '0 ₺',
      image: '/assets/naillabs/screen.png',
      description: 'Ürün açıklaması',
      rating: 0,
      reviews: 0,
      stock: 0,
    }]);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch('/api/admin/save', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: editableProducts.map((product) => ({
            id: product.id,
            title: product.title,
            category: product.category,
            price: product.price,
            image: product.image,
            description: product.description,
            rating: product.rating,
            reviews: product.reviews,
            stock: product.stock,
            ...(product.badge ? { badge: product.badge } : {}),
            ...(typeof product.isNew === 'boolean' ? { isNew: product.isNew } : {}),
          })),
          websiteData,
        }),
      });
      const body = await readJson(response);
      if (!response.ok) throw new Error(messageFrom(body, 'İçerikler kaydedilemedi.'));
      updateWebsiteData(websiteData);
      setSaved(true);
      setProductDrafts(null);
      refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'İçerikler kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Çıkış yapılamadı.');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8F6F3', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: '#000000', py: 2.5 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            İçerik Yönetimi
          </Typography>
          <Button onClick={handleLogout} size="small" variant="outlined" sx={{ color: '#EED2BC' }}>Çıkış</Button>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }}>
          {[
            { label: 'Genel Bakış', href: '/admin', icon: <DashboardOutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'Ürünler ve site metinleri', href: '/admin/icerik', icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
            { label: 'Siparişler', href: '/admin/siparisler', icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} /> },
          ].map((item) => (
            <Button key={item.href} component={Link} to={item.href} startIcon={item.icon}
              variant={item.href === '/admin/icerik' ? 'contained' : 'outlined'} size="small">
              {item.label}
            </Button>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>Ürünler ve web sitesi metinleri</Typography>
            <Typography color="text.secondary">Değişiklikleri kaydettiğinizde Vercel Global Config anında güncellenir.</Typography>
          </Box>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}
            onClick={save} disabled={saving || !websiteDataLoaded || Boolean(productsError)} sx={{ bgcolor: '#000000' }}>
            {saving ? 'Kaydediliyor…' : 'Tüm değişiklikleri kaydet'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {productsError && <Alert severity="error" sx={{ mb: 2 }}>{productsError}</Alert>}
        {saved && <Alert severity="success" role="status" sx={{ mb: 2 }}>Ürünler ve web sitesi metinleri Vercel Global Config’e kaydedildi.</Alert>}

        <Stack spacing={2} sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>Ürünler</Typography>
            <Button startIcon={<AddIcon />} onClick={addProduct}>Ürün ekle</Button>
          </Box>
          {editableProducts.map((product) => (
            <Accordion key={product.id} defaultExpanded={editableProducts.length === 1}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{product.title || 'Yeni ürün'} · {product.price.toLocaleString('tr-TR')} ₺</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {([
                    ['title', 'Ürün adı', 'text'],
                    ['category', 'Kategori', 'text'],
                    ['price', 'Fiyat (TL)', 'number'],
                    ['image', 'Görsel yolu veya URL', 'text'],
                    ['description', 'Açıklama', 'text'],
                    ['stock', 'Stok', 'number'],
                    ['rating', 'Puan', 'number'],
                    ['reviews', 'Yorum sayısı', 'number'],
                    ['badge', 'Etiket', 'text'],
                  ] as const).map(([field, label, type]) => (
                    <Grid key={field} size={{ xs: 12, sm: field === 'description' ? 12 : 6 }}>
                      <TextField fullWidth label={label} name={`${product.id}-${field}`} type={type}
                        multiline={field === 'description'} minRows={field === 'description' ? 2 : undefined}
                        value={product[field] ?? ''}
                        onChange={(event) => updateProduct(product.id, field, type === 'number' ? Number(event.target.value) : event.target.value)}
                        inputProps={type === 'number' ? { min: 0, step: field === 'price' || field === 'rating' ? '0.01' : '1' } : undefined} />
                    </Grid>
                  ))}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel control={<Checkbox name={`${product.id}-isNew`} checked={product.isNew ?? false}
                      onChange={(event) => updateProduct(product.id, 'isNew', event.target.checked)} />} label="Yeni ürün etiketi" />
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button color="error" startIcon={<DeleteOutlineIcon />}
                      onClick={() => setProductDrafts((current) =>
                        (current ?? products).filter((entry) => entry.id !== product.id),
                      )}>
                      Ürünü kaldır
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>Müşteri ekranı metinleri</Typography>
            <Typography color="text.secondary">Metinler sayfalarına göre gruplanır. Bir metni bulmak için arama yapın.</Typography>
          </Box>
          <TextField label="Metinlerde ara" name="copySearch" value={copySearch}
            onChange={(event) => setCopySearch(event.target.value)} />
          {visibleCopy.length === 0 && (
            <Alert severity="info">Aramanızla eşleşen düzenlenebilir metin bulunamadı.</Alert>
          )}
          {groupedCopy.map(([section, entries]) => (
            <Accordion key={section} expanded={expandedCopySections.includes(section) || Boolean(copySearch)}
              onChange={(_, expanded) => setExpandedCopySections((current) =>
                expanded ? [...new Set([...current, section])] : current.filter((entry) => entry !== section),
              )}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700 }}>{section} · {entries.length} metin</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {entries.map(([key, value]) => (
                    <Paper key={key} variant="outlined" sx={{ p: 2 }}>
                      <TextField fullWidth name={key}
                        label={(defaultCopy[key] ?? key).length > 60
                          ? `${(defaultCopy[key] ?? key).slice(0, 57)}…`
                          : defaultCopy[key] ?? key}
                        value={value}
                        multiline={(defaultCopy[key] ?? value).length > 80}
                        minRows={(defaultCopy[key] ?? value).length > 80 ? 2 : undefined}
                        helperText={`${key.slice(0, key.indexOf('#'))} · Varsayılan: ${defaultCopy[key] ?? value}`}
                        onChange={(event) => {
                          setWebsiteData((current) => ({ ...current, copy: { ...current.copy, [key]: event.target.value } }));
                          setSaved(false);
                        }} />
                    </Paper>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
