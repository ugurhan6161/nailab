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
      bgcolor: 'background.default',
      py: 5,
    }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid', borderColor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
          </Box>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>
            Admin Panel
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 1 }}>
            Yönetici güvenli girişi
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField fullWidth label="E-posta" name="email" type="email" size="medium" required autoComplete="username"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              sx={darkInputSx} />
            <TextField fullWidth label="Şifre" name="password" type="password" size="medium" required autoComplete="current-password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              sx={darkInputSx} />
            <Button fullWidth type="submit" variant="contained" color="secondary" size="large" disabled={loading} sx={{ mt: 3, py: 1.75, fontWeight: 600, borderRadius: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Güvenli Giriş'}
          </Button>
          </Box>
        </Box>

        <Typography sx={{ textAlign: 'center', mt: 3, fontSize: 12, color: 'text.secondary' }}>
          Admin değilseniz <Link to="/" style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: 'currentColor' }}>ana sayfaya</Link> dönün
        </Typography>
      </Container>
    </Box>
  );
}

const darkInputSx = {
  '& .MuiOutlinedInput-root': {
    color: 'text.primary', borderRadius: 2,
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'secondary.main' },
    '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
  },
  '& .MuiInputLabel-root': { color: 'text.secondary', '&.Mui-focused': { color: 'secondary.light' } },
};
