import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Alert, CircularProgress, Container
} from '@mui/material';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!form.email || !form.password) { setError('Lütfen tüm alanları doldurun.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1A0F08 0%, #000000 50%, #4A2A1C 100%)',
      py: 5,
    }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #A9876D', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 32, color: '#A9876D' }} />
          </Box>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>
            Admin Panel
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#5E564D', mt: 1 }}>
            Yönetici güvenli girişi
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 4, p: { xs: 3, md: 4 }, border: '1px solid rgba(201,149,106,0.3)' }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(224,82,82,0.1)', color: '#D64545' }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField fullWidth label="E-posta" name="email" type="email" size="medium" required autoComplete="username"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              sx={darkInputSx} />
            <TextField fullWidth label="Şifre" name="password" type="password" size="medium" required autoComplete="current-password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              sx={darkInputSx} />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
            sx={{ mt: 3, bgcolor: '#A9876D', color: 'white', py: 1.75, fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#8B6950' } }}>
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Güvenli Giriş'}
          </Button>
          </Box>
        </Box>

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: 12, color: '#5E564D' }}>
          Admin değilseniz <Link to="/" style={{ color: '#A9876D' }}>ana sayfaya</Link> dönün
        </Typography>
      </Container>
    </Box>
  );
}

const darkInputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#FFFFFF', borderRadius: 2,
    '& fieldset': { borderColor: 'rgba(201,149,106,0.3)' },
    '&:hover fieldset': { borderColor: '#A9876D' },
    '&.Mui-focused fieldset': { borderColor: '#A9876D' },
  },
  '& .MuiInputLabel-root': { color: '#5E564D', '&.Mui-focused': { color: '#A9876D' } },
};
