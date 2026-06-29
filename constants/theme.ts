import { Platform } from 'react-native';

export type PixelThemeName = 'light' | 'dark' | 'nord';

export const lightTheme = {
  name: 'light' as const,
  colors: {
    primary: '#5E5C75',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E6E1FF',
    onPrimaryContainer: '#46445C',
    mint: '#C3ECD2',
    onMint: '#2A4E3A',
    peach: '#FADFD1',
    onPeach: '#554339',
    background: '#FCF8FA',
    surface: '#FFFFFF',
    surfaceLow: '#F7F2F5',
    surfaceContainer: '#F1EDEF',
    surfaceHigh: '#E5E1E4',
    text: '#1C1B1D',
    muted: '#47464D',
    outline: '#78767D',
    border: '#C9C5CD',
    lavenderSoft: '#E6E1FF',
    mintSoft: '#C3ECD2',
    peachSoft: '#FADFD1',
    errorContainer: '#FFDAD6',
    danger: '#BA1A1A',
  },
  radius: {
    sm: 14,
    md: 22,
    lg: 30,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadow: {
    shadowColor: '#5E5C75',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
};

export const darkTheme = {
  ...lightTheme,
  name: 'dark' as const,
  colors: {
    ...lightTheme.colors,
    primary: '#C8BFFF',
    onPrimary: '#18151F',
    primaryContainer: '#3F3A54',
    onPrimaryContainer: '#F0ECFF',
    mint: '#7EC7A2',
    onMint: '#102218',
    peach: '#F0B08B',
    onPeach: '#2A160E',
    background: '#101014',
    surface: '#1D1B24',
    surfaceLow: '#191820',
    surfaceContainer: '#282633',
    surfaceHigh: '#343044',
    text: '#F4EFF4',
    muted: '#D6CEDA',
    outline: '#B6ADC0',
    border: '#4F4A5E',
    lavenderSoft: '#3F3A54',
    mintSoft: '#315744',
    peachSoft: '#5E3E30',
    errorContainer: '#6F2A20',
    danger: '#FFB4A8',
  },
  shadow: {
    ...lightTheme.shadow,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
  },
};

export const nordTheme = {
  ...darkTheme,
  name: 'nord' as const,
  colors: {
    ...darkTheme.colors,
    primary: '#88C0D0',
    onPrimary: '#2E3440',
    primaryContainer: '#434C5E',
    onPrimaryContainer: '#ECEFF4',
    mint: '#A3BE8C',
    onMint: '#2E3440',
    peach: '#EBCB8B',
    onPeach: '#2E3440',
    background: '#2E3440',
    surface: '#3B4252',
    surfaceLow: '#3B4252',
    surfaceContainer: '#434C5E',
    surfaceHigh: '#4C566A',
    text: '#ECEFF4',
    muted: '#D8DEE9',
    outline: '#81A1C1',
    border: '#4C566A',
    lavenderSoft: '#5E81AC',
    mintSoft: '#8FBCBB',
    peachSoft: '#D08770',
    errorContainer: '#5E3A41',
    danger: '#BF616A',
  },
  shadow: {
    ...darkTheme.shadow,
    shadowColor: '#1E222A',
  },
};

export const pixelThemes = {
  light: lightTheme,
  dark: darkTheme,
  nord: nordTheme,
};

export type PixelTheme = (typeof pixelThemes)[PixelThemeName];

export const theme = lightTheme;

const tintColorLight = theme.colors.primary;
const tintColorDark = theme.colors.surface;

export const Colors = {
  light: {
    text: theme.colors.text,
    background: theme.colors.background,
    tint: tintColorLight,
    icon: theme.colors.muted,
    tabIconDefault: theme.colors.muted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: theme.colors.text,
    background: theme.colors.background,
    tint: tintColorDark,
    icon: theme.colors.muted,
    tabIconDefault: theme.colors.muted,
    tabIconSelected: theme.colors.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
