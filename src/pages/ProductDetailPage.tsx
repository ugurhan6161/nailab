import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Container, Grid,
  IconButton, Snackbar, Stack, Tab, Tabs, Typography, Skeleton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import NailFormIllustration from '../components/NailFormIllustration';
import {
  demoProduct, PRODUCT_NAME, PRODUCT_DESCRIPTION, KIT_CONTENT, FAQ, NAIL_FORMS,
} from '../lib/productContent';
import { STORE_PRODUCTS, toAppProduct } from '../lib/ecommerceData';

function ProductVisual({ imageUrl, name }: { imageUrl: string; name: string }) {
  return (
    <Box
      sx={{
        aspectRatio: '1 / 1',
        bgcolor: '#14110E',
        borderRadius: 3,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
      }}
    >
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt={name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ position: 'relative', width: '78%', aspectRatio: '1 / 1' }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid #D0B198',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: '8%',
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
              display: 'grid',
              placeItems: 'center',
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#D0B198', lineHeight: 1.5 }}>
              NAILAB™ Görseli
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const storeMatch = STORE_PRODUCTS.find((p) => p.id === id);
  const initialProduct = storeMatch
    ? toAppProduct(storeMatch)
    : id === demoProduct.id
    ? demoProduct
    : null;

  const [product, setProduct] = useState<Product | null>(() => initialProduct);
  const [loading, setLoading] = useState(() => !initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!id || initialProduct) return;
    let ignore = false;
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (ignore) return;
        setProduct(
          data
            ? { ...data, name: data.name || PRODUCT_NAME, description: PRODUCT_DESCRIPTION }
            : null
        );
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id, initialProduct]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', py: 5, bgcolor: '#090807', color: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 999, bgcolor: 'rgba(255,255,255,0.06)', mb: 3 }} animation="wave" />
          <Grid container spacing={{ xs: 3, md: 6 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" width="100%" sx={{ aspectRatio: '1 / 1', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }} animation="wave" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" width={160} height={24} sx={{ borderRadius: 999, bgcolor: 'rgba(255,255,255,0.06)', mb: 2 }} animation="wave" />
              <Skeleton variant="text" width="85%" height={56} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 2 }} animation="wave" />
              <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1 }} animation="wave" />
              <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 4 }} animation="wave" />
              <Skeleton variant="rounded" width="40%" height={48} sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', mb: 3 }} animation="wave" />
              <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: 999, bgcolor: 'rgba(255,255,255,0.06)' }} animation="wave" />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }
  if (!product) {
    return (
      <Container sx={{ py: 12, bgcolor: '#090807', color: '#FFFFFF', textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2 }}>
          Ürün bulunamadı.
        </Typography>
        <Button
          onClick={() => navigate(-1)}
          sx={{
            color: '#FFFFFF',
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 999,
            px: 3,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  const canBuy = product.stock > 0 && product.price > 0;

  const handleAdd = () => {
    addToCart(product, quantity);
    setToast(true);
  };

  return (
    <Box sx={{ bgcolor: '#090807', color: '#FFFFFF', minHeight: '100vh', pb: 10, pt: 3 }}>
      <Container maxWidth="lg">
        {/* Top Back Action */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              color: '#FFFFFF',
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              px: 2,
              py: 0.6,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            }}
          >
            Geri Dön
          </Button>
        </Box>

        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <ProductVisual imageUrl={product.image_url} name={product.name} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 14, color: '#D0B198 !important' }} />}
              label={product.badge || 'PROFESYONEL NAILAB SERİSİ'}
              variant="outlined"
              sx={{
                borderColor: 'rgba(208,177,152,0.4)',
                color: '#D0B198',
                mb: 2,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.9rem', md: '2.5rem' },
                lineHeight: 1.15,
                mb: 2,
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              {product.name}
            </Typography>
            <Typography
              sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.7, mb: 3 }}
            >
              {product.description}
            </Typography>

            <Box
              sx={{
                py: 2.5,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                mb: 3,
              }}
            >
              {canBuy ? (
                <Typography variant="h2" sx={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {product.price.toLocaleString('tr-TR')} ₺
                </Typography>
              ) : (
                <Typography sx={{ color: '#D0B198', fontWeight: 500 }}>
                  Fiyat ve stok bilgisi güncelleniyor.
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                KDV dahil • Resmi Distribütör Garantili
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              {canBuy && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 999,
                    bgcolor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <IconButton
                    aria-label="Adedi azalt"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    sx={{ color: '#FFFFFF' }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600, color: '#FFFFFF' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    aria-label="Adedi artır"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    sx={{ color: '#FFFFFF' }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!canBuy}
                startIcon={<ShoppingBagOutlinedIcon />}
                onClick={handleAdd}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  borderRadius: 999,
                  '&:hover': { bgcolor: '#F5ECE3' },
                }}
              >
                {canBuy ? 'Sepete Ekle' : 'Stokta Yok'}
              </Button>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, color: 'rgba(255,255,255,0.6)' }} alignItems="center">
              <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#D0B198' }} />
              <Typography variant="body2">
                1.500 ₺ üzeri ücretsiz hızlı kargo. 2-4 iş gününde teslimat.
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Tabs for details */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <Tabs
            value={tab}
            onChange={(_, v: number) => setTab(v)}
            sx={{
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              '& .MuiTabs-indicator': { bgcolor: '#D0B198', height: 3 },
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
              },
              '& .Mui-selected': { color: '#FFFFFF !important' },
            }}
          >
            <Tab label="Ürün İçeriği" />
            <Tab label="Tırnak Formları" />
            <Tab label="Sıkça Sorulanlar" />
          </Tabs>

          <Box sx={{ py: 4 }}>
            {tab === 0 && (
              <Grid container spacing={2.5}>
                {KIT_CONTENT.map((item) => (
                  <Grid size={{ xs: 12, md: 4 }} key={item.title}>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: '#14110E',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        height: '100%',
                      }}
                    >
                      <Typography variant="h3" sx={{ fontSize: '1.1rem', mb: 1, fontWeight: 700, color: '#FFFFFF' }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                        {item.text}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
            {tab === 1 && (
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                  Kit, aşağıdaki dört değiştirilebilir medikal polimer tırnak formunun tamamını içerir.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {NAIL_FORMS.map((form) => (
                    <Box
                      key={form.name}
                      sx={{
                        flex: 1,
                        p: 2.5,
                        bgcolor: '#14110E',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 3,
                      }}
                    >
                      <NailFormIllustration {...form} />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {tab === 2 && (
              <Stack spacing={2.5} sx={{ maxWidth: 740 }}>
                {FAQ.map((item) => (
                  <Box
                    key={item.q}
                    sx={{
                      p: 2.5,
                      bgcolor: '#14110E',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 2.5,
                    }}
                  >
                    <Typography variant="h3" sx={{ fontSize: '1.05rem', mb: 0.75, fontWeight: 700, color: '#FFFFFF' }}>
                      {item.q}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                      {item.a}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={toast}
        autoHideDuration={2400}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(false)}
          severity="success"
          sx={{
            width: '100%',
            bgcolor: '#FFFFFF',
            color: '#000000',
            fontWeight: 700,
            borderRadius: 50,
          }}
        >
          {quantity} adet {product.name} sepete eklendi!
        </Alert>
      </Snackbar>
    </Box>
  );
}
