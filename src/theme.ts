import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const palette = {
  black: '#000000',
  darkBg: '#090807',
  cardBg: '#14110E',
  white: '#FFFFFF',
  gold: '#D0B198',
  goldDark: '#8B6950',
  goldLight: '#EED2BC',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0978E',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
};

export const AppColors = palette;

const theme = responsiveFontSizes(createTheme({
  palette: {
    mode: 'dark',
    primary: { main: palette.white, contrastText: palette.black },
    secondary: {
      main: palette.gold,
      dark: palette.goldDark,
      light: palette.goldLight,
      contrastText: palette.black,
    },
    background: { default: palette.darkBg, paper: palette.cardBg },
    text: { primary: palette.textPrimary, secondary: palette.textSecondary },
    divider: 'rgba(255,255,255,0.08)',
    error: { main: palette.error },
    success: { main: palette.success },
    warning: { main: palette.warning },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Jost, Arial, sans-serif',
    h1: { fontFamily: 'Jost, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: 'Jost, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontFamily: 'Jost, Arial, sans-serif', fontWeight: 600 },
    h4: { fontFamily: 'Jost, Arial, sans-serif', fontWeight: 600 },
    h5: { fontFamily: 'Jost, Arial, sans-serif', fontWeight: 600 },
    h6: { fontFamily: 'Jost, Arial, sans-serif', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.darkBg,
          color: palette.textPrimary,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 46, borderRadius: 999, paddingInline: 24 },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 999 } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
          '&:hover fieldset': { borderColor: palette.gold },
          '&.Mui-focused fieldset': { borderColor: palette.gold },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 600 } } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
  },
}));

export default theme;
