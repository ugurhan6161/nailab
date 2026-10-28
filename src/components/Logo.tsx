import { Box, Typography } from '@mui/material';

type Props = {
  size?: number;
  onDark?: boolean;
  showTagline?: boolean;
};

export default function Logo({ size = 32, onDark = false, showTagline = false }: Props) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src="/assets/naillabs/logo.png"
        alt="NAILAB Logo"
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: onDark
            ? '0 2px 8px rgba(0,0,0,0.6)'
            : '0 2px 6px rgba(0,0,0,0.15)',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <Typography
          sx={{
            fontFamily: 'Jost, Arial, sans-serif',
            fontWeight: 700,
            fontSize: size * 0.52,
            letterSpacing: '0.04em',
            color: onDark ? '#FFFFFF' : '#000000',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          NAILAB<Box component="span" sx={{ fontSize: '0.7em', color: '#A9876D', ml: 0.2 }}>™</Box>
        </Typography>
        {showTagline && (
          <Typography
            sx={{
              fontFamily: 'Jost, Arial, sans-serif',
              fontWeight: 500,
              fontSize: size * 0.22,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: onDark ? 'rgba(255,255,255,0.75)' : '#666666',
              mt: 0.4,
            }}
          >
            Professional Nail Training System
          </Typography>
        )}
      </Box>
    </Box>
  );
}
