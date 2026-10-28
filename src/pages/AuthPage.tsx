import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Alert, CircularProgress,
  Tabs, Tab, InputAdornment, IconButton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState<number>(0); // 0 = login, 1 = register
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const isLogin = tabIndex === 0;

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/magaza');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!form.email || !form.password) {
      setError('Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }
    if (!isLogin && !form.fullName.trim()) {
      setError('Lütfen adınızı ve soyadınızı girin.');
      return;
    }

    setLoading(true);
    const result = isLogin
      ? await signIn(form.email, form.password)
      : await signUp(form.email, form.password, form.fullName);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (!isLogin) {
      setSuccessMsg('Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz…');
      setTimeout(() => navigate('/magaza'), 1200);
    } else {
      navigate('/magaza');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#090807',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/assets/naillabs/screen.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          filter: 'blur(10px)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Auth Card Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 460,
          bgcolor: 'rgba(20,17,14,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(208,177,152,0.25)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.85)',
          p: { xs: 3, sm: 4.5 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header with Back Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            onClick={handleBack}
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              color: '#FFFFFF',
              bgcolor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              px: 2,
              py: 0.6,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.18)',
                borderColor: '#FFFFFF',
              },
            }}
          >
            Geri Dön
          </Button>

          <Button
            component={Link}
            to="/magaza"
            sx={{
              color: '#D0B198',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { color: '#FFFFFF' },
            }}
          >
            Mağazaya Git
          </Button>
        </Box>

        {/* Naillabs Logo & Branding Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/assets/naillabs/logo.png"
            alt="NAILAB"
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              objectFit: 'cover',
              mx: 'auto',
              mb: 1.5,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              border: '2px solid rgba(208,177,152,0.5)',
            }}
          />
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.45rem',
              letterSpacing: '0.04em',
              fontFamily: 'Jost, sans-serif',
              textTransform: 'uppercase',
            }}
          >
            NAILAB<Box component="span" sx={{ color: '#D0B198', fontSize: '0.7em', ml: 0.3 }}>™</Box>
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, mt: 0.3 }}>
            <VerifiedIcon sx={{ fontSize: 13, color: '#D0B198' }} />
            <Typography
              sx={{
                color: '#D0B198',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Profesyonel Müşteri & Akademi Portalı
            </Typography>
          </Box>
        </Box>

        {/* Tab Switcher: Giriş Yap / Kayıt Ol */}
        <Box sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => {
              setTabIndex(val);
              setError(null);
            }}
            variant="fullWidth"
            textColor="inherit"
            TabIndicatorProps={{
              sx: { bgcolor: '#D0B198', height: 3, borderRadius: 2 },
            }}
          >
            <Tab
              label="Giriş Yap"
              sx={{
                color: tabIndex === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                fontWeight: tabIndex === 0 ? 700 : 500,
                fontSize: '0.95rem',
                textTransform: 'none',
              }}
            />
            <Tab
              label="Yeni Hesap Oluştur"
              sx={{
                color: tabIndex === 1 ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                fontWeight: tabIndex === 1 ? 700 : 500,
                fontSize: '0.95rem',
                textTransform: 'none',
              }}
            />
          </Tabs>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: 2,
              bgcolor: 'rgba(211,47,47,0.2)',
              color: '#FF8A80',
              border: '1px solid rgba(211,47,47,0.4)',
              '& .MuiAlert-icon': { color: '#FF8A80' },
            }}
          >
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert
            severity="success"
            sx={{
              mb: 2.5,
              borderRadius: 2,
              bgcolor: 'rgba(56,142,60,0.2)',
              color: '#B9F6CA',
              border: '1px solid rgba(56,142,60,0.4)',
            }}
          >
            {successMsg}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isLogin && (
            <Box>
              <Typography sx={{ color: '#E0E0E0', fontSize: '0.82rem', fontWeight: 600, mb: 0.8 }}>
                Ad Soyad
              </Typography>
              <TextField
                fullWidth
                placeholder="Örn: Selin Karaca"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: '#A0978E', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                    '&:hover fieldset': { borderColor: '#D0B198' },
                    '&.Mui-focused fieldset': { borderColor: '#D0B198' },
                  },
                }}
              />
            </Box>
          )}

          <Box>
            <Typography sx={{ color: '#E0E0E0', fontSize: '0.82rem', fontWeight: 600, mb: 0.8 }}>
              E-posta Adresi
            </Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="ornek@naillabs.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: '#A0978E', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                  '&:hover fieldset': { borderColor: '#D0B198' },
                  '&.Mui-focused fieldset': { borderColor: '#D0B198' },
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ color: '#E0E0E0', fontSize: '0.82rem', fontWeight: 600, mb: 0.8 }}>
              Şifre
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#A0978E', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: '#A0978E' }}
                    >
                      {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                  '&:hover fieldset': { borderColor: '#D0B198' },
                  '&.Mui-focused fieldset': { borderColor: '#D0B198' },
                },
              }}
            />
          </Box>

          {/* Primary Action Button */}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 1.5,
              height: 50,
              borderRadius: 50,
              bgcolor: '#FFFFFF',
              color: '#000000',
              fontWeight: 700,
              fontSize: '0.98rem',
              textTransform: 'none',
              letterSpacing: '0.02em',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'all 0.25s ease',
              '&:hover': {
                bgcolor: '#F5ECE3',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: '#000000' }} />
            ) : isLogin ? (
              'Giriş Yap'
            ) : (
              'Hesabımı Oluştur'
            )}
          </Button>

          {/* Secondary Action: Guest / Store return */}
          <Button
            fullWidth
            component={Link}
            to="/magaza"
            sx={{
              height: 46,
              borderRadius: 50,
              bgcolor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 600,
              fontSize: '0.88rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderColor: '#FFFFFF',
                color: '#FFFFFF',
              },
            }}
          >
            Üye Olmadan Mağazaya Dön
          </Button>
        </Box>

        {/* Trainer / Admin Quick Links */}
        <Box sx={{ mt: 3.5, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#888888', mb: 1 }}>
            Eğitmen veya akademi temsilcisi misiniz?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Link
              to="/egitmen-giris"
              style={{ color: '#D0B198', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Eğitmen Portalı →
            </Link>
            <Typography sx={{ color: 'rgba(255,255,255,0.2)' }}>•</Typography>
            <Link
              to="/admin/giris"
              style={{ color: '#888888', fontSize: '0.82rem', textDecoration: 'none' }}
            >
              Yönetici Girişi
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
