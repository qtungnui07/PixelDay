import { Platform } from 'react-native';

export const theme = {
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
