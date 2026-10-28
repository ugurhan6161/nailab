import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const HERO_BACKGROUNDS = [
  {
    url: '/assets/naillabs/screen.png',
    label: 'Anatomik Eğitim Kiti',
    badge: 'Patentli Form',
  },
  {
    url: '/assets/naillabs/screen-1.png',
    label: 'Elmas & Karbid Frezeler',
    badge: 'Klinik Standart',
  },
  {
    url: '/assets/naillabs/screen-2.png',
    label: 'Tornado Freze Donanımı',
    badge: 'Tungsten Karbid',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const currentBg = HERO_BACKGROUNDS[bgIndex];

  const handleGetStart = () => {
    setAnimating(true);
    setTimeout(() => {
      navigate('/magaza');
    }, 400);
  };

  const handleNextBg = () => {
    setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#090807',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Canvas container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: { xs: '100%', md: 480 },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundImage: `url(${currentBg.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          boxShadow: { md: '0 25px 80px rgba(0,0,0,0.9)' },
          transition: 'background-image 0.5s ease-in-out',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,8,6,0.6) 0%, rgba(10,8,6,0.3) 25%, rgba(10,8,6,0.82) 65%, rgba(10,8,6,0.98) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Top Header: Naillabs Logo & Switcher (No phone icons) */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 10,
            pt: { xs: 3, sm: 3.5 },
            px: 3.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Circular Naillabs emblem logo */}
            <Box
              component={Link}
              to="/magaza"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.2,
                textDecoration: 'none',
                p: 0.6,
                pr: 1.8,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <Box
                component="img"
                src="/assets/naillabs/logo.png"
                alt="NAILAB"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                }}
              />
              <Box>
                <Typography
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    letterSpacing: '0.08em',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  NAILAB™
                </Typography>
                <Typography
                  sx={{
                    color: '#D0B198',
                    fontWeight: 500,
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    mt: 0.3,
                  }}
                >
                  Eğitim Sistemi
                </Typography>
              </Box>
            </Box>

            {/* Switch Background (Anatomik Parmak / Frezeler) */}
            <Button
              size="small"
              onClick={handleNextBg}
              startIcon={<AutoAwesomeIcon sx={{ fontSize: 12, color: '#D0B198' }} />}
              sx={{
                minHeight: 'auto',
                py: 0.6,
                px: 1.5,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#FFFFFF',
                bgcolor: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(208,177,152,0.4)',
                borderRadius: 999,
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  bgcolor: 'rgba(208,177,152,0.25)',
                  borderColor: '#D0B198',
                },
              }}
            >
              {currentBg.badge}
            </Button>
          </Box>
        </Box>

        {/* Center Tag / Product Callout */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 10,
            px: 3.5,
            py: 2,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.6,
              py: 0.6,
              borderRadius: 999,
              bgcolor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(208,177,152,0.3)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            <VerifiedIcon sx={{ fontSize: 14, color: '#D0B198' }} />
            {currentBg.label}
          </Box>
        </Box>

        {/* Bottom Hero & Actions */}
        <Container
          disableGutters
          sx={{
            position: 'relative',
            zIndex: 10,
            px: 3.5,
            pb: { xs: 5, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Headline in Turkish */}
          <Typography
            className="fade-in-up-1"
            sx={{
              color: '#FFFFFF',
              fontSize: { xs: '2.35rem', sm: '2.7rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              mb: 1.8,
              fontFamily: 'Jost, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Yeni Nesil
            <br />
            Bakış Açısı
          </Typography>

          {/* Subtitle */}
          <Typography
            className="fade-in-up-2"
            sx={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: { xs: '1rem', sm: '1.15rem' },
              fontWeight: 400,
              lineHeight: 1.5,
              mb: 4.5,
              maxWidth: 380,
            }}
          >
            Patentli anatomik eğitim kiti, klinik freze uçları ve salon standartlarında profesyonel tırnak ekipmanları.
          </Typography>

          {/* Action 1: "Hemen Başla" Pill Button */}
          <Box
            className="fade-in-up-3"
            sx={{
              mb: 2,
              transform: animating ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Button
              fullWidth
              onClick={handleGetStart}
              sx={{
                height: 52,
                borderRadius: 50,
                bgcolor: '#FFFFFF',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                letterSpacing: '0.01em',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: '#F5ECE3',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              {animating ? 'Mağazaya Giriliyor…' : 'Hemen Başla'}
            </Button>
          </Box>

          {/* Action 2: "Giriş Yap / Hesap Oluştur" */}
          <Box className="fade-in-up-4">
            <Button
              fullWidth
              component={Link}
              to="/giris"
              sx={{
                height: 52,
                borderRadius: 50,
                bgcolor: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.85)',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                letterSpacing: '0.01em',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderColor: '#FFFFFF',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}
            >
              Giriş Yap / Hesap Oluştur
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
