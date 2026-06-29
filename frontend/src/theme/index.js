import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    error: colors.error,
  },
};

export { colors } from './colors';
export { spacing } from './spacing';
