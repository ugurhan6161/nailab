import { Box, Typography } from '@mui/material';

type Props = { name: string; variant: 'square' | 'coffin' | 'rounded' | 'almond'; compact?: boolean };

const paths = {
  square: 'M28 18 H72 V67 Q72 74 65 74 H35 Q28 74 28 67 Z',
  coffin: 'M33 18 H67 L76 68 Q77 74 70 74 H30 Q23 74 24 68 Z',
  rounded: 'M36 18 H64 Q74 18 74 30 V67 Q74 74 67 74 H33 Q26 74 26 67 V30 Q26 18 36 18 Z',
  almond: 'M50 14 Q77 32 65 68 Q59 77 50 81 Q41 77 35 68 Q23 32 50 14 Z',
};

export default function NailFormIllustration({ name, variant, compact = false }: Props) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        component="svg"
        viewBox="0 0 100 92"
        sx={{ width: compact ? 62 : 86, height: compact ? 58 : 78, display: 'block', mx: 'auto' }}
      >
        <path d={paths[variant]} fill="none" stroke="#A9876D" strokeWidth={1.5} />
      </Box>
      <Typography variant="caption" sx={{ color: '#5E564D', display: 'block', mt: 0.5 }}>
        {name}
      </Typography>
    </Box>
  );
}
