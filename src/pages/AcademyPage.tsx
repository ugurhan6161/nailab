import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Button, Card, CardContent, Chip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { supabase } from '../lib/supabase';
import type { AcademyCourse } from '../lib/supabase';

const instructors = [
  { name: 'Dr. Ayşe Kaya', title: 'Tırnak Anatomisi Uzmanı', img: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg' },
  { name: 'Uzm. Fatma Demir', title: 'Jel & Akrilik Master', img: 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg' },
  { name: 'Selin Arslan', title: 'Nail Art Tasarımcısı', img: 'https://images.pexels.com/photos/5214996/pexels-photo-5214996.jpeg' },
  { name: 'Dr. Mehmet Yılmaz', title: 'Klinik Tırnak Uzmanı', img: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg' },
];

export default function AcademyPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('academy_courses').select('*').eq('is_active', true).order('created_at', { ascending: false }).then(({ data }) => {
      setCourses(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ bgcolor: '#0E0C0A', minHeight: '85vh' }}>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(180deg, #181410 0%, #0E0C0A 100%)',
        py: { xs: 6, md: 10 },
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              onClick={() => navigate('/magaza')}
              startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
              sx={{
                color: '#A0978E',
                fontSize: '0.85rem',
                textTransform: 'none',
                '&:hover': { color: '#D0B198' },
              }}
            >
              Mağazaya Geri Dön
            </Button>
          </Box>
          <Chip label="NAILLABS AKADEMİ" sx={{ bgcolor: 'rgba(208,177,152,0.15)', color: '#D0B198', mb: 2, border: '1px solid rgba(208,177,152,0.3)', fontWeight: 700 }} />
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 32, md: 48 }, fontWeight: 700, color: '#FFFFFF', mb: 2, lineHeight: 1.2 }}>
            Profesyonel Tırnak Eğitimleri
          </Typography>
          <Typography sx={{ fontSize: 16, color: '#A0978E', maxWidth: 560, mx: 'auto', lineHeight: 1.8 }}>
            Patentli anatomik eğitim parmakları ve klinik ekipmanlarımızla desteklenen sertifikalı master kursları.
          </Typography>
        </Container>
      </Box>

      {/* Courses */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography sx={{ fontSize: 12, color: '#D0B198', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', mb: 1 }}>
            Kurs Programları
          </Typography>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF' }}>
            Aktif Eğitimlerimiz
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {loading ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}><Typography color="#A0978E">Yükleniyor...</Typography></Box>
          ) : (
            courses.map(course => (
              <Grid size={{ xs: 12, md: 6 }} key={course.id}>
                <Card sx={{
                  display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                  borderRadius: 3, overflow: 'hidden',
                  bgcolor: '#14110E',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: '#D0B198', transform: 'translateY(-4px)' },
                }}>
                  <Box component="img" src={course.image_url} alt={course.title}
                    sx={{ width: { xs: '100%', sm: 190 }, height: { xs: 170, sm: 'auto' }, objectFit: 'cover', flexShrink: 0 }} />
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                      <Chip label={course.level} size="small" sx={{ bgcolor: 'rgba(208,177,152,0.15)', color: '#D0B198', fontSize: 11, fontWeight: 700, height: 22 }} />
                      <Chip icon={<AccessTimeIcon sx={{ fontSize: 14, color: '#A0978E !important' }} />} label={course.duration} size="small" variant="outlined"
                        sx={{ fontSize: 11, borderColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', height: 22 }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontWeight: 700, fontSize: 18, color: '#FFFFFF', mb: 1, lineHeight: 1.3 }}>
                      {course.title}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#A0978E', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                      {course.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <PersonOutlineIcon sx={{ fontSize: 16, color: '#D0B198' }} />
                        <Typography sx={{ fontSize: 13, color: '#FFFFFF' }}>{course.instructor}</Typography>
                      </Box>
                      <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontWeight: 700, fontSize: 20, color: '#D0B198' }}>
                        {course.price.toLocaleString('tr-TR')} ₺
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* Instructors */}
      <Box id="egitmenler" sx={{ bgcolor: '#090807', py: { xs: 6, md: 10 }, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{ fontSize: 12, color: '#D0B198', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', mb: 1 }}>
              Eğitmen Kadromuz
            </Typography>
            <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF' }}>
              Alanında Uzman Eğitmenler
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {instructors.map(inst => (
              <Grid size={{ xs: 6, md: 3 }} key={inst.name}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#14110E', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box component="img" src={inst.img} alt={inst.name}
                    sx={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', mb: 2, border: '2px solid #D0B198', mx: 'auto' }} />
                  <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}>{inst.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#A0978E', mt: 0.5 }}>{inst.title}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Certificate */}
      <Box id="sertifika" sx={{ py: { xs: 6, md: 10 }, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <StarBorderIcon sx={{ fontSize: 48, color: '#D0B198', mb: 1 }} />
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF', mb: 2 }}>
            Uluslararası Onaylı Sertifika
          </Typography>
          <Typography sx={{ fontSize: 15, color: '#A0978E', lineHeight: 1.8, mb: 4, maxWidth: 600, mx: 'auto' }}>
            Naillabs Akademi eğitimlerini başarıyla tamamlayan katılımcılara karekodlu, uluslararası geçerliliğe sahip sertifika takdim edilmektedir.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/iletisim')}
            sx={{ bgcolor: '#D0B198', color: '#0E0C0A', fontWeight: 700, px: 5, py: 1.6, borderRadius: 999, '&:hover': { bgcolor: '#EED2BC' } }}
          >
            Ön Kayıt Başvurusu
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
