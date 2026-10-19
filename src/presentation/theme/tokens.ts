/**
 * Design tokens — single source of truth for the visual language (AH-237).
 * The Tailwind config imports these values; CSS variables are injected at runtime
 * from the same object (`applyTheme`), so no hex literal lives anywhere else in the
 * app code. Tenant brand colors in the seed/brand pickers are data, not theme.
 */
export const tokens = {
  colors: {
    bg: {
      DEFAULT: '#FDF8F3',
      2: '#F3EEE9',
    },
    card: '#FFFFFF',
    primary: {
      DEFAULT: '#E43820',
      dark: '#CD321D',
      light: '#FF6B4A',
    },
    text: {
      DEFAULT: '#1A0F0A',
      muted: '#7A6F69',
    },
    border: {
      DEFAULT: '#F0E6DD',
      hover: '#B2B2B2',
    },
    success: { bg: '#E6F6EC', fg: '#167A3E' },
    warning: { bg: '#FFF4D6', fg: '#9A6200' },
    danger: { bg: '#FDE7E4', fg: '#B8251A' },
    neutral: { bg: '#F3EEE9', fg: '#5E544D' },
    error: { DEFAULT: '#EF4444', ring: '#EF44441F' },
  },
  focus: {
    ring: '#E438201F',
  },
  typography: {
    fontFamily: {
      sans: ['Alexandria', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    },
    fontSize: {
      h1: { size: '64px', lineHeight: '1.1', weight: '800' },
      body: '16px',
      caption: { size: '48px', lineHeight: '1.1', weight: '500' },
      dense: { sm: '14px', xs: '12px' },
    },
  },
  radius: {
    card: '8px',
    panel: '8px',
    pill: '9999px',
    avatar: '9999px',
  },
  spacing: {
    sidebar: '280px',
  },
} as const;

export type Tokens = typeof tokens;
