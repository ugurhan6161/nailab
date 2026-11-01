import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Badge, Box, Button, Chip, Container, Grid,
  IconButton, Stack, Tab, Tabs, Typography, Skeleton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import type { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import NailFormIllustration from '../components/NailFormIllustration';
import {
  getEditableKitContent, getEditableFaq, getEditableNailForms,
} from '../lib/productContent';
import { toAppProduct } from '../lib/ecommerceData';
import { siteText } from '../context/WebsiteDataContext';



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
              {siteText("src/pages/ProductDetailPage.tsx#0eff4d491ae3", "NAILAB™ Görseli ")}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();
  const { products, loading: catalogLoading, error: catalogError } = useProducts();
  const configuredProduct = products.find((item) => item.id === id || item.databaseId === id);
  const product: Product | null = configuredProduct ? toAppProduct(configuredProduct) : null;
  const loading = catalogLoading;
  const kitContent = getEditableKitContent();
  const faq = getEditableFaq();
  const nailForms = getEditableNailForms();
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(0);
  const [showCartLink, setShowCartLink] = useState(false);

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
          {catalogError || siteText('src/pages/ProductDetailPage.tsx#product-not-found', 'Ürün bulunamadı.')}
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
          {siteText("src/pages/ProductDetailPage.tsx#f3d8f7b1cbca", "Geri Dön ")}</Button>
      </Container>
    );
  }

  const canBuy = product.stock > 0 && product.price > 0;

  const handleAdd = () => {
    addToCart(product, quantity);
    setShowCartLink(true);
  };

  return (
    <Box sx={{ bgcolor: '#090807', color: '#FFFFFF', minHeight: '100vh', pb: canBuy ? 13 : 10, pt: 3 }}>
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
            {siteText("src/pages/ProductDetailPage.tsx#f3d8f7b1cbca", "Geri Dön ")}</Button>
        </Box>

        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <ProductVisual imageUrl={product.image_url} name={product.name} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 14, color: '#D0B198 !important' }} />}
              label={product.badge || siteText('src/pages/ProductDetailPage.tsx#default-badge', 'PROFESYONEL NAILAB SERİSİ')}
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
                  {product.price.toLocaleString('tr-TR')} {siteText("src/pages/ProductDetailPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
              ) : (
                <Typography sx={{ color: '#D0B198', fontWeight: 500 }}>
                  {siteText("src/pages/ProductDetailPage.tsx#3652eccea81a", "Fiyat ve stok bilgisi güncelleniyor. ")}</Typography>
              )}
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {siteText("src/pages/ProductDetailPage.tsx#33ae2921b98b", "KDV dahil • Resmi Distribütör Garantili ")}</Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, color: 'rgba(255,255,255,0.6)' }} alignItems="center">
              <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#D0B198' }} />
              <Typography variant="body2">
                {siteText("src/pages/ProductDetailPage.tsx#c1c07d3111f7", "1.500 ₺ üzeri ücretsiz hızlı kargo. 2-4 iş gününde teslimat. ")}</Typography>
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
            <Tab label={siteText("src/pages/ProductDetailPage.tsx#a3680670afac", "Ürün İçeriği")} />
            <Tab label={siteText("src/pages/ProductDetailPage.tsx#63bc2f1f05ed", "Tırnak Formları")} />
            <Tab label={siteText("src/pages/ProductDetailPage.tsx#9707f992a1cb", "Sıkça Sorulanlar")} />
          </Tabs>

          <Box sx={{ py: 4 }}>
            {tab === 0 && (
              <Grid container spacing={2.5}>
                {kitContent.map((item) => (
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
                  {siteText("src/pages/ProductDetailPage.tsx#28518cd3eb8a", "Kit, aşağıdaki dört değiştirilebilir medikal polimer tırnak formunun tamamını içerir. ")}</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {nailForms.map((form) => (
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
                {faq.map((item) => (
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

      {canBuy && (
        <Box
          sx={{
            position: 'fixed',
            left: '50%',
            bottom: 'calc(12px + env(safe-area-inset-bottom))',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: 'min(calc(100vw - 24px), 580px)',
            px: 0.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: '0 0 132px',
              height: 58,
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
              bgcolor: 'rgba(20,17,14,0.96)',
            }}
          >
            <IconButton
              aria-label={siteText("src/pages/ProductDetailPage.tsx#22de0ac272e0", "Adedi azalt")}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              sx={{ color: '#FFFFFF', width: 44, height: 44 }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography aria-live="polite" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: '#FFFFFF' }}>
              {quantity}
            </Typography>
            <IconButton
              aria-label={siteText("src/pages/ProductDetailPage.tsx#2af12e931aaf", "Adedi artır")}
              onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
              sx={{ color: '#FFFFFF', width: 44, height: 44 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<ShoppingBagOutlinedIcon />}
            onClick={handleAdd}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#000000',
              height: 58,
              fontWeight: 700,
              fontSize: '0.98rem',
              borderRadius: 999,
              '&:hover': { bgcolor: '#F5ECE3' },
            }}
          >
            {siteText('src/pages/ProductDetailPage.tsx#add-to-cart', 'Sepete Ekle')}
          </Button>
        </Box>
      )}
      {showCartLink && (
        <Button
          component={Link}
          to="/sepet"
          variant="contained"
          color="secondary"
          startIcon={<Badge badgeContent={itemCount} color="error"><ShoppingCartOutlinedIcon /></Badge>}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1200,
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          }}
        >
          Sepete git
        </Button>
      )}
    </Box>
  );
}
