import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, IconButton, Drawer, Button,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, TextField, InputAdornment,
  Skeleton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useFlyAnimation } from '../context/FlyAnimationContext';
import {
  CATEGORIES, STORE_PRODUCTS, getCategoryProducts,
  toAppProduct, type StoreProduct,
} from '../lib/ecommerceData';

export default function CategoryPage() {
  const { category = 'kits' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { itemCount, addToCart, isInCart } = useCart();
  const { wishlistIds, toggleWishlist, wishlistProducts } = useWishlist();
  const {
    registerWishlistTarget,
    registerCartTarget,
    flyToWishlist,
    flyToCart,
    isWishlistPopping,
    isCartPopping,
  } = useFlyAnimation();

  const [loading, setLoading] = useState(true);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Per-item interaction animation states
  const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);
  const [animatingCartId, setAnimatingCartId] = useState<string | null>(null);
  const [animatingWishlistCartId, setAnimatingWishlistCartId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleCategorySwitch = (tag: string) => {
    setLoading(true);
    navigate(`/kategori/${tag}`);
    setTimeout(() => {
      setLoading(false);
    }, 350);
  };

  const matchedCategory = CATEGORIES.find(
    (c) => c.tag.toLowerCase() === category.toLowerCase()
  );

  const title = matchedCategory
    ? matchedCategory.title
    : category === 'all'
    ? 'Tüm Ürünler'
    : category.charAt(0).toUpperCase() + category.slice(1);

  const heroImage = matchedCategory ? matchedCategory.image : '/assets/naillabs/screen-1.png';

  const products = getCategoryProducts(category);

  const handleHeartClick = (e: React.MouseEvent<HTMLButtonElement>, prodId: string) => {
    e.stopPropagation();
    const isAdding = !wishlistIds.includes(prodId);
    setAnimatingHeartId(prodId);
    setTimeout(() => setAnimatingHeartId(null), 500);

    if (isAdding) {
      flyToWishlist(e.currentTarget);
    }
    toggleWishlist(prodId);
  };

  const handleCartClick = (e: React.MouseEvent<HTMLButtonElement>, sp: StoreProduct) => {
    e.stopPropagation();
    setAnimatingCartId(sp.id);
    setTimeout(() => setAnimatingCartId(null), 700);

    flyToCart(e.currentTarget, sp.image);
    addToCart(toAppProduct(sp), 1);
    setToastMessage(`"${sp.title}" sepete eklendi!`);
  };

  const handleWishlistCartClick = (e: React.MouseEvent<HTMLButtonElement>, sp: StoreProduct) => {
    e.stopPropagation();
    setAnimatingWishlistCartId(sp.id);
    setTimeout(() => setAnimatingWishlistCartId(null), 700);

    flyToCart(e.currentTarget, sp.image);
    addToCart(toAppProduct(sp), 1);
    setToastMessage(`"${sp.title}" sepete eklendi!`);
  };

  const filteredSearchProducts = STORE_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: '#090807', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      {/* Centered Main Shell - Exactly matching zainwen9/ecommerce_front-page */}
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 460 },
          bgcolor: '#FFFFFF',
          minHeight: '100vh',
          boxShadow: { md: '0 25px 80px rgba(0,0,0,0.9)' },
          position: 'relative',
        }}
      >
        {/* HERO CONTAINER - Exact match to CategoryPage.dart (height: 360) */}
        <Box
          className="fade-in-up-1"
          sx={{
            height: 360,
            width: '100%',
            position: 'relative',
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: '10px',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)',
              pointerEvents: 'none',
            },
          }}
        >
          {/* Top Row: Arrow back on left, Search/Heart/Cart Targets on right */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 10,
              pt: { xs: 4, sm: 5 },
              px: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                width: 38,
                height: 38,
                minWidth: 38,
                bgcolor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                color: '#FFFFFF',
                p: 0,
                transition: 'transform 0.2s',
                '&:active': { transform: 'scale(0.9)' },
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 18, ml: '3px' }} />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={() => setSearchOpen(true)}
                sx={{
                  width: 38,
                  height: 38,
                  minWidth: 38,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  color: '#FFFFFF',
                  p: 0,
                  transition: 'transform 0.2s',
                  '&:active': { transform: 'scale(0.9)' },
                }}
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>

              {/* TARGET 1: Wishlist Heart Target with Exact Corner Badge */}
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  ref={registerWishlistTarget}
                  onClick={() => setWishlistOpen(true)}
                  sx={{
                    width: 38,
                    height: 38,
                    minWidth: 38,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    color: wishlistIds.length > 0 ? '#FF3B30' : '#FFFFFF',
                    p: 0,
                    transform: isWishlistPopping ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:active': { transform: 'scale(0.9)' },
                  }}
                >
                  {wishlistIds.length > 0 ? (
                    <FavoriteIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>

                {wishlistIds.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 50,
                      bgcolor: '#FF3B30',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'Jost, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: '4px',
                      border: '1.5px solid #000000',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                      pointerEvents: 'none',
                      transform: isWishlistPopping ? 'scale(1.35)' : 'scale(1)',
                      transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                  >
                    {wishlistIds.length}
                  </Box>
                )}
              </Box>

              {/* TARGET 2: Cart Target with Exact Corner Badge */}
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  ref={registerCartTarget}
                  component={Link}
                  to="/sepet"
                  aria-label="Sepet"
                  sx={{
                    width: 38,
                    height: 38,
                    minWidth: 38,
                    bgcolor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    color: '#FFFFFF',
                    p: 0,
                    transform: isCartPopping ? 'scale(1.25)' : 'scale(1)',
                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:active': { transform: 'scale(0.9)' },
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 19 }} />
                </IconButton>

                {itemCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 50,
                      bgcolor: '#FF3B30',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'Jost, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: '4px',
                      border: '1.5px solid #000000',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                      pointerEvents: 'none',
                      transform: isCartPopping ? 'scale(1.35)' : 'scale(1)',
                      transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                  >
                    {itemCount}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Center Category Title: 40px bold white */}
          <Box
            className="fade-in-up-2"
            sx={{
              position: 'relative',
              zIndex: 10,
              p: '20px',
              textAlign: 'center',
              pb: 4,
            }}
          >
            <Typography
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 40,
                fontFamily: 'Jost, sans-serif',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>

        {/* Minimal Category Tabs - Fitted to text content */}
        <Box
          className="no-scrollbar"
          sx={{
            display: 'flex',
            gap: 1.2,
            overflowX: 'auto',
            py: 1.5,
            px: '20px',
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            alignItems: 'center',
          }}
        >
          <Button
            size="small"
            onClick={() => handleCategorySwitch('all')}
            sx={{
              flexShrink: 0,
              minWidth: 'auto',
              borderRadius: 50,
              px: 2.2,
              py: 0.8,
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'Jost, sans-serif',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              color: category === 'all' ? '#FFFFFF' : '#444444',
              bgcolor: category === 'all' ? '#000000' : 'rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: category === 'all' ? '#000000' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: category === 'all' ? '#222222' : 'rgba(0,0,0,0.08)' },
            }}
          >
            Tümü
          </Button>
          {CATEGORIES.map((cat) => {
            const active = cat.tag.toLowerCase() === category.toLowerCase();
            return (
              <Button
                key={cat.id}
                size="small"
                onClick={() => handleCategorySwitch(cat.tag)}
                sx={{
                  flexShrink: 0,
                  minWidth: 'auto',
                  borderRadius: 50,
                  px: 2.2,
                  py: 0.8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'Jost, sans-serif',
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  color: active ? '#FFFFFF' : '#444444',
                  bgcolor: active ? '#000000' : 'rgba(0,0,0,0.05)',
                  border: '1px solid',
                  borderColor: active ? '#000000' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: active ? '#222222' : 'rgba(0,0,0,0.08)' },
                }}
              >
                {cat.title}
              </Button>
            );
          })}
        </Box>

        {/* BODY CONTENT - Background is WHITE */}
        <Box sx={{ p: '20px', bgcolor: '#FFFFFF', pb: 10 }}>
          {/* Header Row: "Yeni Ürünler" & "Tümünü Gör >" */}
          <Box
            className="fade-in-up-3"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: '20px',
            }}
          >
            <Typography
              sx={{
                color: '#000000',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'Jost, sans-serif',
              }}
            >
              Yeni Ürünler
            </Typography>

            <Box
              component={Link}
              to="/kategori/all"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                color: '#888888',
                fontSize: 14,
                textDecoration: 'none',
                '&:hover': { color: '#000000' },
              }}
            >
              <Typography sx={{ fontSize: 14, color: '#888888' }}>
                Tümünü Gör
              </Typography>
              <ArrowForwardIosIcon sx={{ fontSize: 11, color: '#888888' }} />
            </Box>
          </Box>

          {/* SKELETON OR PRODUCT CARDS */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={200}
                  sx={{ borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.06)' }}
                  animation="wave"
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {products.map((p, idx) => {
                const wishlisted = wishlistIds.includes(p.id);
                const isHeartAnimating = animatingHeartId === p.id;
                const isCartAnimating = animatingCartId === p.id;

                return (
                  <Box
                    key={p.id}
                    onClick={() => navigate(`/urun/${p.id}`)}
                    className={`fade-in-up-${(idx % 4) + 1}`}
                    sx={{
                      height: 200,
                      width: '100%',
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundImage: `url(${p.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: '10px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                      transition: 'transform 0.25s ease',
                      '&:hover': { transform: 'scale(1.01)' },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '10px',
                        background:
                          'linear-gradient(to bottom right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)',
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    {/* Top Right: Interactive Favorite Icon with Pop */}
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 5,
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleHeartClick(e, p.id)}
                        sx={{
                          color: wishlisted ? '#FF3B30' : '#FFFFFF',
                          transform: isHeartAnimating ? 'scale(1.4) rotate(-12deg)' : 'scale(1)',
                          transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          '&:active': { transform: 'scale(0.85)' },
                        }}
                      >
                        {wishlisted ? (
                          <FavoriteIcon sx={{ fontSize: 24 }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                        )}
                      </IconButton>
                    </Box>

                    {/* Bottom Row: Title (20), Price (30 bold), Interactive 40x40 Cart Button */}
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                      }}
                    >
                      <Box sx={{ maxWidth: '80%' }}>
                        <Typography
                          sx={{
                            color: '#FFFFFF',
                            fontSize: 20,
                            fontWeight: 400,
                            lineHeight: 1.2,
                            fontFamily: 'Jost, sans-serif',
                          }}
                        >
                          {p.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: '#FFFFFF',
                            fontSize: 30,
                            fontWeight: 700,
                            lineHeight: 1.15,
                            fontFamily: 'Jost, sans-serif',
                            mt: 0.3,
                          }}
                        >
                          {p.priceFormatted}
                        </Typography>
                      </Box>

                      {/* Interactive 40x40 White Circle Cart Button */}
                      <IconButton
                        onClick={(e) => handleCartClick(e, p)}
                        sx={{
                          width: 40,
                          height: 40,
                          mb: '10px',
                          bgcolor: isCartAnimating ? '#30D158' : '#FFFFFF',
                          color: isCartAnimating ? '#FFFFFF' : '#616161',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          transform: isCartAnimating ? 'scale(1.25)' : 'scale(1)',
                          transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          '&:hover': {
                            bgcolor: isCartAnimating ? '#30D158' : '#FFFFFF',
                            transform: 'scale(1.1)',
                          },
                          '&:active': {
                            transform: 'scale(0.85)',
                          },
                        }}
                      >
                        {isCartAnimating ? (
                          <CheckIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <AddShoppingCartIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Floating Bottom Quick Actions */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            bgcolor: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            py: 1.2,
            px: 2,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={() => navigate(-1)}
            size="small"
            sx={{ color: '#000000', fontWeight: 600, fontSize: 13 }}
          >
            ← Geri Dön
          </Button>
          <Button
            onClick={() => setWishlistOpen(true)}
            size="small"
            startIcon={<FavoriteIcon sx={{ color: '#FF3B30', fontSize: 16 }} />}
            sx={{ color: '#000000', fontWeight: 600, fontSize: 13 }}
          >
            Favoriler ({wishlistIds.length})
          </Button>
          <Button
            component={Link}
            to="/sepet"
            variant="contained"
            size="small"
            startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#000000',
              color: '#FFFFFF',
              borderRadius: 50,
              px: 2.5,
              fontSize: 13,
              fontWeight: 700,
              transform: isCartPopping ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&:hover': { bgcolor: '#222222' },
            }}
          >
            Sepet ({itemCount})
          </Button>
        </Box>
      </Box>

      {/* WISHLIST DRAWER */}
      <Drawer
        anchor="right"
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 380 },
            p: 3,
            bgcolor: '#14110E',
            color: '#FFFFFF',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            Favorilerim ({wishlistProducts.length})
          </Typography>
          <IconButton onClick={() => setWishlistOpen(false)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {wishlistProducts.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <FavoriteBorderIcon sx={{ fontSize: 44, color: '#777777', mb: 1.5 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Favorilere henüz ürün eklemediniz.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {wishlistProducts.map((p) => {
              const inCart = isInCart(p.id);
              const isWishlistCartAnimating = animatingWishlistCartId === p.id;
              return (
                <Box
                  key={p.id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src={p.image}
                    alt={p.title}
                    sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600, fontSize: 14, color: '#FFFFFF' }}>
                      {p.title}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#D0B198', mt: 0.3, fontSize: 13 }}>
                      {p.priceFormatted}
                    </Typography>

                    {/* Show "Sepete Git" button if already in cart */}
                    {inCart && (
                      <Button
                        component={Link}
                        to="/sepet"
                        onClick={() => setWishlistOpen(false)}
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          mt: 0.6,
                          bgcolor: 'rgba(208,177,152,0.16)',
                          color: '#D0B198',
                          border: '1px solid rgba(208,177,152,0.3)',
                          borderRadius: 50,
                          px: 1.2,
                          py: 0.2,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          lineHeight: 1.4,
                          display: 'inline-flex',
                          '&:hover': { bgcolor: '#D0B198', color: '#000000' },
                        }}
                      >
                        Sepete Git
                      </Button>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleWishlistCartClick(e, p)}
                    sx={{
                      bgcolor: isWishlistCartAnimating ? '#30D158' : '#FFFFFF',
                      color: isWishlistCartAnimating ? '#FFFFFF' : '#000000',
                      transform: isWishlistCartAnimating ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': { bgcolor: isWishlistCartAnimating ? '#30D158' : '#EEEEEE' },
                      '&:active': { transform: 'scale(0.85)' },
                    }}
                  >
                    {isWishlistCartAnimating ? (
                      <CheckIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <AddShoppingCartIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => toggleWishlist(p.id)}
                    sx={{ color: '#FF3B30', '&:active': { transform: 'scale(0.85)' } }}
                  >
                    <FavoriteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}
      </Drawer>

      {/* QUICK SEARCH DIALOG */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            bgcolor: '#14110E',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#FFFFFF' }}>Naillabs Ürünlerinde Ara</Typography>
          <IconButton size="small" onClick={() => setSearchOpen(false)} sx={{ color: '#FFFFFF' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Eğitim Kiti, Freze Ucu, Form..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#A0978E' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.06)',
                borderRadius: '10px',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              },
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflowY: 'auto' }}>
            {filteredSearchProducts.map((p) => (
              <Box
                key={p.id}
                onClick={() => {
                  setSearchOpen(false);
                  navigate(`/urun/${p.id}`);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                }}
              >
                <Box
                  component="img"
                  src={p.image}
                  alt={p.title}
                  sx={{ width: 44, height: 44, borderRadius: '8px', objectFit: 'cover' }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#FFFFFF' }}>{p.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#D0B198' }}>
                    {p.priceFormatted}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* SNACKBAR FEEDBACK WITH DIRECT LINK TO /sepet */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          action={
            <Button
              component={Link}
              to="/sepet"
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              sx={{
                color: '#D0B198',
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'none',
                ml: 1,
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              Sepeti Gör
            </Button>
          }
          sx={{
            width: '100%',
            bgcolor: '#14110E',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            fontWeight: 600,
            borderRadius: 50,
            '& .MuiAlert-icon': { color: '#30D158' },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
