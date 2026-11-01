import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const LiquidMetalButton = styled(Button)({
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.48)',
  background: 'linear-gradient(180deg, #292929 0%, #080808 54%, #1c1c1c 100%)',
  color: '#F5F5F5',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 5px 16px rgba(0,0,0,0.45)',
  transition: 'transform 150ms ease-out, box-shadow 150ms ease-out, border-color 150ms ease-out',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    borderRadius: 'inherit',
    background: [
      'linear-gradient(112deg, transparent 8%, rgba(255,255,255,0.03) 24%, rgba(255,255,255,0.36) 38%, rgba(255,255,255,0.05) 51%, transparent 68%)',
      'radial-gradient(ellipse at 18% 0%, rgba(255,255,255,0.2), transparent 48%)',
    ].join(', '),
    backgroundSize: '200% 100%, 100% 100%',
    backgroundPosition: '0% 50%, center',
    opacity: 0.78,
    transition: 'opacity 150ms ease-out, background-position 150ms ease-out',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  '&.Mui-focusVisible': {
    outline: '2px solid #FFFFFF',
    outlineOffset: 3,
  },
  '&.Mui-disabled': {
    borderColor: 'rgba(255,255,255,0.22)',
    color: 'rgba(255,255,255,0.58)',
    opacity: 0.72,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  '@media (hover: hover)': {
    '&:hover:not(.Mui-disabled)': {
      borderColor: 'rgba(255,255,255,0.82)',
      background: 'linear-gradient(180deg, #303030 0%, #0b0b0b 54%, #222222 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 20px rgba(0,0,0,0.52)',
      '&::before': {
        opacity: 1,
        backgroundPosition: '100% 50%, center',
      },
    },
  },
  '&:active:not(.Mui-disabled)': {
    transform: 'scale(0.96)',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.08)',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&::before': { transition: 'none' },
    '&:active:not(.Mui-disabled)': { transform: 'none' },
  },
  '@media (forced-colors: active)': {
    border: '1px solid ButtonText',
    '&.Mui-focusVisible': { outlineColor: 'Highlight' },
  },
}) as typeof Button;

export default LiquidMetalButton;
