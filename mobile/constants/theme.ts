import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F6F8FC',
    card: '#FFFFFF',
    border: '#E2E6EF',

    text: '#0A0F1A',
    textSecondary: '#596273',
    textMuted: '#7D8799',

    tint: '#7C3AED',
    cyan: '#009FC2',
    green: '#00A86B',
    red: '#D93636',

    icon: '#596273',
    tabIconDefault: '#7D8799',
    tabIconSelected: '#0A0F1A',

    navBackground: '#FFFFFF',
    navBorder: '#E2E6EF',
  },

  dark: {
    background: '#0A0F1A',
    card: '#131824',
    border: '#1C2333',

    text: '#F6F8FC',
    textSecondary: '#8E9AAF',
    textMuted: '#7D8799',

    tint: '#7C3AED',
    cyan: '#00E5FF',
    green: '#00FF9D',
    red: '#FF4D4D',

    icon: '#8E9AAF',
    tabIconDefault: '#707A8D',
    tabIconSelected: '#F6F8FC',

    navBackground: '#111111',
    navBorder: '#1B2230',
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});