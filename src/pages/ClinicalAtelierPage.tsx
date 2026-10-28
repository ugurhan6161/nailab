import { Box, Typography, Container, Grid, Button, Card, Chip } from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <ScienceOutlinedIcon sx={{ fontSize: 32 }} />,
    title: 'Anatomik Modeller',
    desc: 'Tıbbi düzeyde silikon parmak ve el modelleri. Detaylı lateral duvar, matriks ve kutikül simülasyonu.',
  },
  {
    icon: <BiotechOutlinedIcon sx={{ fontSize: 32 }} />,
    title: 'Klinik Ekipmanlar',
    desc: 'Hassas karbür ve elmas freze uçları. Sıfır balans sapması, minimum ısınma ve kontrollü debriyaj performansı.',
  },
  {
    icon: <SchoolOutlinedIcon sx={{ fontSize: 32 }} />,
    title: 'Eğitim Materyalleri',
    desc: 'Akademiler ve salonlar için kapsamlı eğitim setleri, değiştirilebilir protez tırnak formları ve cetveller.',
  },
];

export default function ClinicalAtelierPage() {
  return (
    <Box sx={{ bgcolor: '#0E0C0A', color: '#FFFFFF', minHeight: '85vh' }}>
      {/* Hero */}
      <Box
        sx={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(208, 177, 152, 0.12) 0%, #0E0C0A 75%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="NAILLABS KLİNİK & ATÖLYE"
                sx={{
                  bgcolor: 'rgba(208, 177, 152, 0.1)',
                  color: '#D0B198',
                  mb: 2.5,
                  border: '1px solid rgba(208, 177, 152, 0.3)',
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              />
              <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 30, md: 44 }, fontWeight: 700, color: '#FFFFFF', mb: 2.5, lineHeight: 1.2 }}>
                Tırnak Tasarımının Bilimsel ve Klinik Yüzü
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#A0978E', lineHeight: 1.8, mb: 4, maxWidth: 500 }}>
                Naillabs Klinik Atölye, tırnak anatomisi ve freze mühendisliğini bir araya getirerek salon profesyonelleri ve eğitmenler için en yüksek standartlarda donanım geliştirir.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/magaza"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#D0B198',
                  color: '#0E0C0A',
                  px: 4,
                  py: 1.4,
                  borderRadius: 999,
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#E2C7B0' },
                }}
              >
                Klinik Ürünleri İncele
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src="/assets/naillabs/screen.png"
                alt="Naillabs Klinik Atölye"
                sx={{
                  width: '100%',
                  height: 380,
                  objectFit: 'contain',
                  borderRadius: 4,
                  bgcolor: '#14110E',
                  p: 3,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={3.5}>
          {features.map((feat, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 3,
                  bgcolor: '#14110E',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'rgba(208, 177, 152, 0.1)',
                    border: '1px solid rgba(208, 177, 152, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D0B198',
                    mb: 2.5,
                  }}
                >
                  {feat.icon}
                </Box>
                <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 19, fontWeight: 700, color: '#FFFFFF', mb: 1.5 }}>
                  {feat.title}
                </Typography>
                <Typography sx={{ color: '#A0978E', fontSize: 14, lineHeight: 1.7 }}>
                  {feat.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
