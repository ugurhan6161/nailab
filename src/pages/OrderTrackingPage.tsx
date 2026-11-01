import { Box, Container } from '@mui/material';
import OrderTrackingForm from '../components/OrderTrackingForm';

export default function OrderTrackingPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm">
        <OrderTrackingForm />
      </Container>
    </Box>
  );
}
