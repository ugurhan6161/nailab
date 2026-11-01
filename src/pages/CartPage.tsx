import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, Divider, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LiquidMetalButton from '../components/LiquidMetalButton';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { siteText } from '../context/WebsiteDataContext';



const FREE_SHIPPING_THRESHOLD = 1500;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, shippingCost, total, itemCount } = useCart();
  const { error: catalogError, loading: catalogLoading, refresh } = useProducts();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <Box
        sx={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#090807',
          color: '#FFFFFF',
          py: 8,
        }}
      >
        <Box sx={{ textAlign: 'center', px: 2 }}>
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ color: '#D0B198', fontSize: 40 }} />
          </Box>
          <Typography
            sx={{
              fontFamily: 'Jost, Arial, sans-serif',
              fontSize: { xs: 26, md: 34 },
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            {siteText("src/pages/CartPage.tsx#a25848306429", "Sepetiniz Boş ")}</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 1, mb: 4, fontSize: '0.95rem' }}>
            {siteText("src/pages/CartPage.tsx#b9fd34ad6aa8", "Henüz sepetinize bir ürün eklemediniz. ")}</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <LiquidMetalButton
              onClick={() => navigate(-1)}
              variant="contained"
              size="large"
              sx={{
                borderRadius: 50,
                px: 4,
                fontWeight: 700,
              }}
            >
              {siteText("src/pages/CartPage.tsx#f3d8f7b1cbca", "Geri Dön ")}
            </LiquidMetalButton>
          </Box>
        </Box>
      </Box>
    );
  }

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <Box sx={{ minHeight: '80vh', py: { xs: 3, md: 6 }, bgcolor: '#090807', color: '#FFFFFF' }}>
      <Container maxWidth="lg">
        {/* Top Header with Back button */}
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
            {siteText("src/pages/CartPage.tsx#f3d8f7b1cbca", "Geri Dön ")}</Button>
        </Box>

        <Typography
          sx={{
            fontFamily: 'Jost, Arial, sans-serif',
            fontSize: { xs: 26, md: 36 },
            fontWeight: 800,
            color: '#FFFFFF',
            mb: 3,
          }}
        >
          {siteText("src/pages/CartPage.tsx#b10cdc1a1f44", "Sepetim")}{' '}
          <Box
            component="span"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'Jost, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 500,
            }}
          >
            {siteText("src/pages/CartPage.tsx#32ebb1abcc1c", "(")}{itemCount} {siteText("src/pages/CartPage.tsx#a28e8a6da2d1", "ürün) ")}</Box>
        </Typography>

        {catalogError && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={refresh}>{siteText("src/pages/CartPage.tsx#1f30ff52f9d5", "Yeniden dene")}</Button>}
            sx={{ mb: 3 }}
          >
            {siteText("src/pages/CartPage.tsx#851788d02593", "Güncel ürün fiyatları alınamadı. Fiyatlar doğrulanana kadar siparişe devam edemezsiniz. ")}{catalogError}
          </Alert>
        )}

        {/* Shipping badge */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            bgcolor: remaining > 0 ? 'rgba(208,177,152,0.12)' : 'rgba(48,209,88,0.12)',
            color: remaining > 0 ? '#D0B198' : '#30D158',
            border: remaining > 0 ? '1px solid rgba(208,177,152,0.25)' : '1px solid rgba(48,209,88,0.25)',
            borderRadius: 2.5,
          }}
        >
          <LocalShippingOutlinedIcon />
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
            {remaining > 0
              ? siteText(
                'src/pages/CartPage.tsx#free-shipping-progress',
                '{amount} ₺ daha harcayın, ücretsiz kargo kazanın!',
              ).replace('{amount}', remaining.toLocaleString('tr-TR'))
              : siteText(
                'src/pages/CartPage.tsx#free-shipping-complete',
                'Ücretsiz kargo avantajınız aktif!',
              )}
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                overflow: 'hidden',
                borderRadius: 3,
                bgcolor: '#14110E',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
            >
              {items.map((item, index) => (
                <Box key={item.product.id}>
                  <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={item.product.image_url}
                      alt={item.product.name}
                      sx={{
                        width: { xs: 72, sm: 96 },
                        height: { xs: 72, sm: 96 },
                        objectFit: 'cover',
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component={Link}
                        to={`/urun/${item.product.id}`}
                        sx={{
                          fontFamily: 'Jost, Arial, sans-serif',
                          fontWeight: 700,
                          fontSize: 15,
                          color: '#FFFFFF',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textDecoration: 'none',
                          '&:hover': { color: '#D0B198' },
                        }}
                      >
                        {item.product.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', mt: 0.3 }}>
                        {item.product.price.toLocaleString('tr-TR')} {siteText("src/pages/CartPage.tsx#e1db9e279745", "₺ / adet ")}</Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          mt: 1.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 50,
                            bgcolor: 'rgba(255,255,255,0.04)',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            sx={{ color: '#FFFFFF' }}
                          >
                            <RemoveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <Typography sx={{ px: 1.5, fontWeight: 700, color: '#FFFFFF' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            sx={{ color: '#FFFFFF' }}
                          >
                            <AddIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 16,
                            color: '#FFFFFF',
                            fontFamily: 'Jost, sans-serif',
                          }}
                        >
                          {(item.product.price * item.quantity).toLocaleString('tr-TR')} {siteText("src/pages/CartPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() => removeFromCart(item.product.id)}
                      sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#FF453A' } }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                  {index < items.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />}
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                position: { md: 'sticky' },
                top: 100,
                borderRadius: 3,
                bgcolor: '#14110E',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Jost, Arial, sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  mb: 3,
                }}
              >
                {siteText("src/pages/CartPage.tsx#0fd020952874", "Sipariş Özeti ")}</Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{siteText("src/pages/CartPage.tsx#c680e0e7da71", "Ara Toplam")}</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
                    {subtotal.toLocaleString('tr-TR')} {siteText("src/pages/CartPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{siteText("src/pages/CartPage.tsx#d949980d3c64", "Kargo")}</Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: shippingCost === 0 ? '#30D158' : '#FFFFFF',
                    }}
                  >
                    {shippingCost === 0
                      ? siteText('src/pages/CartPage.tsx#shipping-free', 'Ücretsiz')
                      : `${shippingCost.toLocaleString('tr-TR')} ₺`}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.08)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography
                  sx={{
                    fontFamily: 'Jost, Arial, sans-serif',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {siteText("src/pages/CartPage.tsx#c5662180075f", "Toplam ")}</Typography>
                <Typography
                  sx={{
                    fontFamily: 'Jost, Arial, sans-serif',
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  {total.toLocaleString('tr-TR')} {siteText("src/pages/CartPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
              </Box>
              <LiquidMetalButton
                fullWidth
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/odeme')}
                disabled={catalogLoading || Boolean(catalogError)}
                sx={{
                  borderRadius: 50,
                  fontWeight: 700,
                }}
              >
                {siteText("src/pages/CartPage.tsx#258c96ced92d", "Sonraki Adıma Geç ")}</LiquidMetalButton>
              <Button
                onClick={() => navigate('/magaza')}
                fullWidth
                sx={{
                  mt: 1.5,
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 500,
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                {siteText("src/pages/CartPage.tsx#2cbd9c6fb82a", "Alışverişe Devam Et ")}</Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
