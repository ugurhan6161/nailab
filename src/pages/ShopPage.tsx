import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Drawer,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, TextField, InputAdornment,
  Skeleton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useFlyAnimation } from '../context/FlyAnimationContext';
import {
  CATEGORIES, BEST_SELLING_CATEGORIES, STORE_PRODUCTS,
  toAppProduct, type StoreProduct,
} from '../lib/ecommerceData';

export default function ShopPage() {
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

  const productSectionRef = useRef<HTMLDivElement>(null);

  // Skeleton loading effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

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

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredSearchProducts = STORE_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
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
        {/* 1. HERO BANNER - Exact match to ShopPage.dart (height: 500) */}
        <Box
          className="fade-in-up-1"
          sx={{
            height: 500,
            width: '100%',
            position: 'relative',
            backgroundImage: "url('/assets/naillabs/screen-1.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
              pointerEvents: 'none',
            },
          }}
        >
          {/* Top Bar inside Hero */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 10,
              pt: { xs: 4, sm: 5 },
              px: { xs: 2.5, sm: 3 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Logo on Left */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                bgcolor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                px: 1.4,
                py: 0.5,
                borderRadius: 50,
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'transform 0.2s ease',
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <Box
                component="img"
                src="/assets/naillabs/logo.png"
                alt="NAILAB"
                sx={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
              />
              <Typography
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  letterSpacing: '0.04em',
                }}
              >
                NAILAB™
              </Typography>
            </Box>

            {/* Top Right Action Icons: Search, Favorite Target, Cart Target */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                aria-label="Arama"
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

              {/* TARGET 1: Wishlist Heart with Exact Corner Badge */}
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  ref={registerWishlistTarget}
                  aria-label="Favoriler"
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

              {/* TARGET 2: Shopping Cart with Exact Corner Badge */}
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

          {/* Bottom inside Hero */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 10,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography
              className="fade-in-up-2"
              sx={{
                color: '#FFFFFF',
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 1.5,
                fontFamily: 'Jost, sans-serif',
              }}
            >
              Yeni Ürünlerimiz
            </Typography>

            <Box
              className="fade-in-up-3"
              onClick={scrollToProducts}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                cursor: 'pointer',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '0.04em',
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                TÜMÜNÜ İNCELE
              </Typography>
              <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#FFFFFF' }} />
            </Box>
          </Box>
        </Box>

        {/* 2. BODY CONTENT - Background is WHITE */}
        <Box sx={{ p: '20px', bgcolor: '#FFFFFF', pb: 10 }}>
          {/* SECTION 1: Categories Carousel */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5,
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
                Kategoriler
              </Typography>
              <Typography
                component={Link}
                to="/kategori/all"
                sx={{
                  color: '#888888',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { color: '#000000' },
                }}
              >
                Tümü
              </Typography>
            </Box>

            {/* SKELETON OR CAROUSEL */}
            {loading ? (
              <Box sx={{ display: 'flex', gap: '20px', overflowX: 'hidden' }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={140}
                    height={154}
                    sx={{ borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.06)', flex: '0 0 auto' }}
                    animation="wave"
                  />
                ))}
              </Box>
            ) : (
              <Box
                className="no-scrollbar"
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '20px',
                  pb: 1,
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <Box
                    key={cat.id}
                    onClick={() => navigate(`/kategori/${cat.tag}`)}
                    sx={{
                      flex: '0 0 auto',
                      width: 140,
                      height: 154,
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      scrollSnapAlign: 'start',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transition: 'transform 0.25s ease',
                      '&:hover': { transform: 'scale(1.02)' },
                      '&:active': { transform: 'scale(0.97)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={cat.image}
                      alt={cat.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '10px',
                        background:
                          'linear-gradient(to bottom right, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.8) 100%)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        p: '10px',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 16,
                          fontFamily: 'Jost, sans-serif',
                          lineHeight: 1.2,
                        }}
                      >
                        {cat.title}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* SECTION 2: Best Selling by Category */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5,
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
                Kategorilere Göre En Çok Satanlar
              </Typography>
              <Typography
                component={Link}
                to="/kategori/all"
                sx={{
                  color: '#888888',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { color: '#000000' },
                }}
              >
                Tümü
              </Typography>
            </Box>

            {/* SKELETON OR CAROUSEL */}
            {loading ? (
              <Box sx={{ display: 'flex', gap: '20px', overflowX: 'hidden' }}>
                {[1, 2].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    width={205}
                    height={150}
                    sx={{ borderRadius: '10px', bgcolor: 'rgba(0,0,0,0.06)', flex: '0 0 auto' }}
                    animation="wave"
                  />
                ))}
              </Box>
            ) : (
              <Box
                className="no-scrollbar"
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '20px',
                  pb: 1,
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {BEST_SELLING_CATEGORIES.map((best, idx) => (
                  <Box
                    key={`${best.id}-${idx}`}
                    onClick={() => navigate(`/kategori/${best.tag}`)}
                    sx={{
                      flex: '0 0 auto',
                      width: 205,
                      height: 150,
                      borderRadius: '10px',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      scrollSnapAlign: 'start',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transition: 'transform 0.25s ease',
                      '&:hover': { transform: 'scale(1.02)' },
                      '&:active': { transform: 'scale(0.97)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={best.image}
                      alt={best.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '10px',
                        background:
                          'linear-gradient(to bottom right, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.8) 100%)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        p: '10px',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 16,
                          fontFamily: 'Jost, sans-serif',
                        }}
                      >
                        {best.title}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* SECTION 3: Featured Products */}
          <Box ref={productSectionRef}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5,
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
                Öne Çıkan Koleksiyon
              </Typography>
              <Typography
                component={Link}
                to="/kategori/all"
                sx={{
                  color: '#888888',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Tümü
              </Typography>
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
                {STORE_PRODUCTS.map((prod) => {
                  const wishlisted = wishlistIds.includes(prod.id);
                  const isHeartAnimating = animatingHeartId === prod.id;
                  const isCartAnimating = animatingCartId === prod.id;

                  return (
                    <Box
                      key={prod.id}
                      onClick={() => navigate(`/urun/${prod.id}`)}
                      sx={{
                        height: 200,
                        width: '100%',
                        borderRadius: '10px',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundImage: `url(${prod.image})`,
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
                      {/* Top Right: Interactive Heart Button with Pop Effect */}
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
                          onClick={(e) => handleHeartClick(e, prod.id)}
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
                        <Box sx={{ maxWidth: '78%' }}>
                          <Typography
                            sx={{
                              color: '#FFFFFF',
                              fontSize: 20,
                              fontWeight: 400,
                              lineHeight: 1.2,
                              fontFamily: 'Jost, sans-serif',
                            }}
                          >
                            {prod.title}
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
                            {prod.priceFormatted}
                          </Typography>
                        </Box>

                        {/* Interactive 40x40 White Circle Cart Button with Pop & Flying Trigger */}
                        <IconButton
                          onClick={(e) => handleCartClick(e, prod)}
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
            component={Link}
            to="/"
            size="small"
            sx={{ color: '#000000', fontWeight: 600, fontSize: 13 }}
          >
            Başlangıç
          </Button>
          <Button
            component={Link}
            to="/kategori/kits"
            size="small"
            sx={{ color: '#000000', fontWeight: 600, fontSize: 13 }}
          >
            Kategoriler
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

      {/* WISHLIST DRAWER - In Luxury Dark Theme */}
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
