import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Paper, Button, CircularProgress, Chip
} from '@mui/material';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { AcademyCourse } from '../lib/supabase';
import { siteText } from '../context/WebsiteDataContext';



export default function TrainerPortalPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/egitmen-giris'); return; }
    if (profile && profile.role !== 'trainer' && profile.role !== 'admin') { navigate('/'); return; }
    supabase.from('academy_courses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setCourses(data || []);
      setLoading(false);
    });
  }, [user, profile, navigate]);

  if (!user) return null;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '90vh', py: 5 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 24, md: 32 }, fontWeight: 700, color: '#000000' }}>
              {siteText("src/pages/TrainerPortalPage.tsx#e34c56676cb8", "Eğitmen Portalı ")}</Typography>
            <Typography sx={{ fontSize: 14, color: '#5E564D' }}>
              {siteText("src/pages/TrainerPortalPage.tsx#16e58b1f7e0d", "Hoş geldiniz, ")}
              {profile?.full_name || siteText('src/pages/TrainerPortalPage.tsx#fallback-name', 'Eğitmen')}
            </Typography>
          </Box>
          <Button onClick={handleSignOut} variant="outlined" sx={{ borderColor: '#A9876D', color: '#A9876D', borderRadius: 2 }}>{siteText("src/pages/TrainerPortalPage.tsx#283092d12a56", "Çıkış Yap")}</Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <VideoLibraryOutlinedIcon />, num: courses.length, label: siteText('src/pages/TrainerPortalPage.tsx#stat.active-courses', 'Aktif Kurs'), color: '#A9876D' },
            { icon: <GroupOutlinedIcon />, num: '1.247', label: siteText('src/pages/TrainerPortalPage.tsx#stat.total-students', 'Toplam Öğrenci'), color: '#3DA56F' },
            { icon: <StarBorderIcon />, num: '4.8', label: siteText('src/pages/TrainerPortalPage.tsx#stat.average-rating', 'Ortalama Puan'), color: '#B8924A' },
            { icon: <StarBorderIcon />, num: '₺48K', label: siteText('src/pages/TrainerPortalPage.tsx#stat.monthly-income', 'Aylık Gelir'), color: '#3A7BD5' },
          ].map((s, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(201,149,106,0.15)' }}>
                <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
                <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 24, fontWeight: 700, color: '#000000' }}>{s.num}</Typography>
                <Typography sx={{ fontSize: 12, color: '#5E564D' }}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Courses */}
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(201,149,106,0.15)' }}>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 20, fontWeight: 700, color: '#000000', mb: 3 }}>
            {siteText("src/pages/TrainerPortalPage.tsx#a8bee54ee0f5", "Kurslarım ")}</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#A9876D' }} /></Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {courses.map(c => (
                <Box key={c.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: '#FFFFFF', borderRadius: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box component="img" src={c.image_url} alt={c.title} sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover' }} />
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontWeight: 600, fontSize: 15, color: '#000000' }}>{c.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#5E564D' }}>{c.duration} {siteText("src/pages/TrainerPortalPage.tsx#6e01f78b9eb4", "· ")}{c.level}</Typography>
                  </Box>
                  <Chip label={siteText("src/pages/TrainerPortalPage.tsx#d5f884547452", "Aktif")} size="small" sx={{ bgcolor: '#E8F5E9', color: '#3DA56F', fontWeight: 600, fontSize: 11 }} />
                  <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontWeight: 700, fontSize: 16, color: '#000000' }}>
                    {c.price.toLocaleString('tr-TR')} {siteText("src/pages/TrainerPortalPage.tsx#fb0484ae0c37", "₺ ")}</Typography>
                  <Button size="small" variant="outlined" sx={{ borderColor: '#A9876D', color: '#A9876D', fontSize: 12 }}>{siteText("src/pages/TrainerPortalPage.tsx#e92f6f072935", "Yönet")}</Button>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
