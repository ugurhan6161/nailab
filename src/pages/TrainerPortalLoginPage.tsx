import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Alert, CircularProgress, Container
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function TrainerPortalLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async () => {
    setError(null);
    if (!form.email || !form.password) { setError('Lütfen tüm alanları doldurun.'); return; }
    setLoading(true);
    const result = await signIn(form.email, form.password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate('/egitmen-portal');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0E0C0A',
        color: '#FFFFFF',
        py: 6,
        px: 2,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
        <Button
          component={Link}
          to="/magaza"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: '#D0B198',
            border: '1px solid rgba(208, 177, 152, 0.3)',
            bgcolor: 'rgba(208, 177, 152, 0.05)',
            borderRadius: 999,
            px: 2.5,
            '&:hover': { bgcolor: 'rgba(208, 177, 152, 0.15)' },
          }}
        >
          Mağazaya Dön
        </Button>
      </Box>

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Logo size={36} onDark={true} showTagline={true} />
          </Box>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 26, fontWeight: 700, color: '#FFFFFF', mt: 2 }}>
            Eğitmen Portalı Girişi
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#A0978E', mt: 0.5 }}>
            Naillabs akredite eğitmen hesabınızla erişim sağlayın
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: '#14110E',
            borderRadius: 4,
            p: { xs: 3, md: 4.5 },
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FF8888', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="E-Posta"
              size="medium"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Şifre"
              size="medium"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleSubmit}
            sx={{
              mt: 3.5,
              bgcolor: '#D0B198',
              color: '#0E0C0A',
              py: 1.5,
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 999,
              '&:hover': { bgcolor: '#E2C7B0' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#0E0C0A' }} /> : 'Giriş Yap'}
          </Button>
        </Box>

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: 13, color: '#888078' }}>
          Eğitmen değil misiniz?{' '}
          <Link to="/giris" style={{ color: '#D0B198', textDecoration: 'none', fontWeight: 600 }}>
            Müşteri Girişi
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
