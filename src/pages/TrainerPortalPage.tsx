import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Typography, Container, Paper, Button, CircularProgress, Chip,
} from '@mui/material';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { AcademyCourse } from '../lib/supabase';
import { siteText } from '../context/WebsiteDataContext';

export default function TrainerPortalPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/egitmen-giris', { replace: true });
      return;
    }
    if (!profile || (profile.role !== 'trainer' && profile.role !== 'admin')) {
      navigate('/', { replace: true });
      return;
    }

    let active = true;
    void (async () => {
      try {
        const query = supabase
          .from('academy_courses')
          .select('id, title, description, instructor, duration, level, price, image_url, is_active, created_at')
          .order('created_at', { ascending: false });
        const { data, error: loadError } = profile.role === 'admin'
          ? await query
          : await query.eq('is_active', true);

        if (!active) return;
        if (loadError) {
          console.error('Eğitmen kursları Supabase üzerinden yüklenemedi:', loadError);
          setError('Eğitimler yüklenemedi. Supabase bağlantısını ve erişim izinlerini kontrol edin.');
        } else {
          setCourses((data ?? []).map((course) => ({ ...course, price: Number(course.price) })));
          setError(null);
        }
      } catch (loadError) {
        if (!active) return;
        console.error('Eğitmen kursları Supabase üzerinden yüklenemedi:', loadError);
        setError('Eğitimler yüklenemedi. Supabase bağlantısını ve erişim izinlerini kontrol edin.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [authLoading, user, profile, navigate]);

  if (authLoading || !user || !profile || (profile.role !== 'trainer' && profile.role !== 'admin')) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (signOutError) {
      console.error('Eğitmen oturumu kapatılamadı:', signOutError);
      setError('Oturum kapatılamadı. Yeniden deneyin.');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '90vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, color: 'text.primary' }}>
              {siteText("src/pages/TrainerPortalPage.tsx#e34c56676cb8", "Eğitmen Portalı ")}</Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {siteText("src/pages/TrainerPortalPage.tsx#16e58b1f7e0d", "Hoş geldiniz, ")}
              {profile.full_name || siteText('src/pages/TrainerPortalPage.tsx#fallback-name', 'Eğitmen')}
            </Typography>
          </Box>
          <Button onClick={handleSignOut} variant="outlined" color="secondary">
            {siteText("src/pages/TrainerPortalPage.tsx#283092d12a56", "Çıkış Yap")}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper sx={{ p: { xs: 2, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary' }}>
              {siteText("src/pages/TrainerPortalPage.tsx#a8bee54ee0f5", "Yayındaki Eğitimler")}
            </Typography>
            {!loading && !error && (
              <Chip
                icon={<VideoLibraryOutlinedIcon />}
                label={`${courses.length} ${siteText('src/pages/TrainerPortalPage.tsx#stat.active-courses', 'eğitim')}`}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : error ? null : courses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
                {siteText('src/pages/TrainerPortalPage.tsx#empty.title', 'Yayında eğitim yok')}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {siteText('src/pages/TrainerPortalPage.tsx#empty.description', 'Yayındaki eğitimler burada görünür.')}
              </Typography>
              {profile.role === 'admin' && (
                <Button component={Link} to="/admin/icerik" color="secondary" sx={{ mt: 2 }}>
                  {siteText('src/pages/TrainerPortalPage.tsx#empty.admin-action', 'Eğitimleri yönet')}
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {courses.map((course) => (
                <Box
                  key={course.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    minWidth: 0,
                  }}
                >
                  {course.image_url && (
                    <Box
                      component="img"
                      src={course.image_url}
                      alt={course.title}
                      sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'text.primary' }}>{course.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {course.instructor} · {course.duration || course.level}
                    </Typography>
                  </Box>
                  {profile.role === 'admin' && (
                    <Chip
                      label={course.is_active ? 'Aktif' : 'Pasif'}
                      size="small"
                      color={course.is_active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  )}
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'secondary.main' }}>
                    {course.price.toLocaleString('tr-TR')} {siteText("src/pages/TrainerPortalPage.tsx#fb0484ae0c37", "₺")}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
