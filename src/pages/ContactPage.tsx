import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Paper, TextField, Button,
  Accordion, AccordionSummary, AccordionDetails, Snackbar, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { supabase } from '../lib/supabase';

const faqs = [
  { q: 'Siparişim ne zaman kargoya verilir?', a: 'Saat 15:00\'a kadar verilen siparişler aynı gün özenle paketlenerek kargoya teslim edilir. Teslimat süresi ortalama 1-3 iş günüdür.' },
  { q: 'Ürünleri iade edebilir miyim?', a: 'Teslimat tarihinden itibaren 14 gün içerisinde, hijyen bandı ve orijinal ambalajı bozulmamış ürünlerde koşulsuz iade hakkınız mevcuttur.' },
  { q: 'Kargo ücreti ne kadar?', a: '1.500 TL ve üzeri tüm siparişlerinizde kargo ücretsizdir. Altındaki siparişlerde sabit kargo bedeli uygulanır.' },
  { q: 'Naillabs Eğitim Kitini kimler kullanabilir?', a: 'Hem yeni başlayan tırnak teknisyenleri ve öğrenciler hem de profesyonel tırnak masterları ve eğitmenler için anatomik standartlarda üretilmiştir.' },
  { q: 'Hangi ödeme yöntemleri geçerlidir?', a: 'Tüm bankaların kredi ve banka kartları, Havale/EFT ve kapıda ödeme seçenekleriyle güvenle ödeme yapabilirsiniz.' },
  { q: 'Üye olmadan sipariş verebilir miyim?', a: 'Evet, misafir olarak alışveriş yapabilir, sipariş numaranız ile anlık kargo durumunu sitemizden takip edebilirsiniz.' },
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    await supabase.from('notifications').insert({ title: form.subject || 'İletişim Formu', message: `${form.name} (${form.email}): ${form.message}`, type: 'sistem' });
    setLoading(false);
    setSuccess(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Box sx={{ bgcolor: '#0E0C0A', minHeight: '85vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
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

        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography sx={{ color: '#D0B198', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', mb: 1 }}>
            İletişim & Destek
          </Typography>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 28, md: 40 }, fontWeight: 700, color: '#FFFFFF' }}>
            Bizimle İletişime Geçin
          </Typography>
          <Typography sx={{ color: '#A0978E', fontSize: 15, mt: 1, maxWidth: 500, mx: 'auto' }}>
            Sorularınız, eğitim talepleriniz veya kurumsal iş birlikleriniz için bize 7/24 ulaşabilirsiniz.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Info (No phone icon) */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
              {[
                { icon: <SupportAgentOutlinedIcon />, label: 'Müşteri Hizmetleri', value: '+90 850 000 00 00', sub: 'Hafta içi 09:00 - 18:00 Canlı Destek' },
                { icon: <EmailOutlinedIcon />, label: 'E-posta İletişim', value: 'destek@naillabs.com', sub: 'En geç 24 saat içinde dönüş' },
                { icon: <LocationOnOutlinedIcon />, label: 'Merkez Atölye & Akademi', value: 'Levent / Beşiktaş, İstanbul', sub: 'Naillabs Head Office' },
              ].map((item, i) => (
                <Paper key={i} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: '50%', bgcolor: 'rgba(208,177,152,0.12)', border: '1px solid rgba(208,177,152,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D0B198', flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 11, color: '#A0978E', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{item.value}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#777068' }}>{item.sub}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 22, fontWeight: 700, color: '#FFFFFF', mb: 3 }}>
                Mesaj Gönderin
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Ad Soyad"
                    size="small"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#A0978E' },
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#D0B198' },
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    size="small"
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#A0978E' },
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#D0B198' },
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Konu"
                    size="small"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#A0978E' },
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#D0B198' },
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Mesajınız"
                    size="small"
                    required
                    multiline
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#A0978E' },
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#D0B198' },
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  mt: 3,
                  bgcolor: '#D0B198',
                  color: '#0E0C0A',
                  fontWeight: 700,
                  px: 5,
                  borderRadius: 999,
                  '&:hover': { bgcolor: '#EED2BC' }
                }}
              >
                {loading ? 'Gönderiliyor...' : 'Mesajı İlet'}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* FAQ */}
        <Box id="sss" sx={{ mt: 8 }}>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 22, md: 30 }, fontWeight: 700, color: '#FFFFFF', mb: 3, textAlign: 'center' }}>
            Sıkça Sorulan Sorular
          </Typography>
          <Box sx={{ maxWidth: 840, mx: 'auto' }}>
            {faqs.map((faq, i) => (
              <Accordion
                key={i}
                sx={{
                  mb: 1.5,
                  bgcolor: '#14110E',
                  borderRadius: '12px !important',
                  border: '1px solid rgba(255,255,255,0.08)',
                  '&:before': { display: 'none' },
                  overflow: 'hidden'
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#D0B198' }} />}>
                  <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#FFFFFF' }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography sx={{ fontSize: 14, color: '#A0978E', lineHeight: 1.8 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Legal sections */}
        <Box sx={{ mt: 8 }}>
          <Grid container spacing={3}>
            {[
              { id: 'iade', title: 'İade & Değişim Koşulları', content: 'Ürün tesliminden itibaren 14 gün içinde yasal iade hakkınız bulunmaktadır. Hijyenik açıdan açılmamış, orijinal paketinde bulunan ve kullanılmamış ürünler tam iade kapsamındadır.' },
              { id: 'gizlilik', title: 'Gizlilik ve Güvenlik Politikası', content: 'Kişisel verileriniz 6698 sayılı KVKK ve 256-bit SSL şifreleme ile üst düzey güvenlik standartlarında korunmaktadır. Verileriniz asla üçüncü taraflarla paylaşılmaz.' },
              { id: 'kosullar', title: 'Kullanım Koşulları', content: 'Naillabs web sitesini ziyaret ederek veya sipariş vererek mesafeli satış sözleşmesini ve genel hizmet şartlarını kabul etmiş sayılırsınız.' },
              { id: 'kvkk', title: 'KVKK Aydınlatma Metni', content: 'Kişisel verilerinizin işlenme amaçları, aktarılma koşulları ve veri sahibi haklarınız hakkında detaylı yasal bilgilendirmeyi kapsar.' },
            ].map(sec => (
              <Grid size={{ xs: 12, md: 6 }} key={sec.id} id={sec.id}>
                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: 16, fontWeight: 700, color: '#D0B198', mb: 1.5 }}>
                    {sec.title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#A0978E', lineHeight: 1.8 }}>
                    {sec.content}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ bgcolor: '#D0B198', color: '#0E0C0A', fontWeight: 600 }}>
          Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.
        </Alert>
      </Snackbar>
    </Box>
  );
}
