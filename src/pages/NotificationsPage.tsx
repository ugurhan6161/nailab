import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Paper, Button, Chip, CircularProgress
} from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Notification } from '../lib/supabase';

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/giris'); return; }
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      setNotifications(data || []);
      setLoading(false);
    });
  }, [user, navigate]);

  if (!user) return null;

  const handleMarkRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const iconMap: Record<string, ReactNode> = {
    siparis: <NotificationsActiveOutlinedIcon sx={{ color: '#D0B198' }} />,
    kampanya: <CampaignOutlinedIcon sx={{ color: '#D0B198' }} />,
    sistem: <InfoOutlinedIcon sx={{ color: '#60A5FA' }} />,
  };

  return (
    <Box sx={{ bgcolor: '#0E0C0A', minHeight: '85vh', py: { xs: 5, md: 8 }, color: '#FFFFFF' }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography sx={{ fontFamily: 'Jost, Arial, sans-serif', fontSize: { xs: 26, md: 36 }, fontWeight: 700, color: '#FFFFFF' }}>
            Bildirimler
          </Typography>
          {notifications.some((n) => !n.is_read) && (
            <Button
              onClick={handleMarkAllRead}
              size="small"
              sx={{ color: '#D0B198', border: '1px solid rgba(208, 177, 152, 0.3)', borderRadius: 999 }}
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#D0B198' }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#14110E', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography sx={{ fontSize: 40, mb: 1.5 }}>🔔</Typography>
            <Typography sx={{ color: '#A0978E', fontSize: 16 }}>Henüz yeni bir bildiriminiz bulunmuyor.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((n) => (
              <Paper
                key={n.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  bgcolor: n.is_read ? '#14110E' : 'rgba(208, 177, 152, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#D0B198' },
                }}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {iconMap[n.type] || iconMap.sistem}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#FFFFFF' }}>{n.title}</Typography>
                      {!n.is_read && (
                        <Chip
                          label="Yeni"
                          size="small"
                          sx={{ bgcolor: '#D0B198', color: '#0E0C0A', fontSize: 10, height: 20, fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 13.5, color: '#A0978E', lineHeight: 1.6 }}>{n.message}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#888078', mt: 0.75 }}>
                      {new Date(n.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
