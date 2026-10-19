import type { Config } from 'tailwindcss';
import { tokens } from './src/presentation/theme/tokens';

/**
 * Theme values come from the design tokens (single source of truth). Do not add hex
 * values here — extend `src/presentation/theme/tokens.ts` instead.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    boxShadow: {
      none: 'none',
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: tokens.colors.bg.DEFAULT,
          2: tokens.colors.bg[2],
        },
        card: tokens.colors.card,
        primary: {
          DEFAULT: tokens.colors.primary.DEFAULT,
          dark: tokens.colors.primary.dark,
          light: tokens.colors.primary.light,
        },
        text: {
          DEFAULT: tokens.colors.text.DEFAULT,
          muted: tokens.colors.text.muted,
        },
        border: {
          DEFAULT: tokens.colors.border.DEFAULT,
          hover: tokens.colors.border.hover,
        },
        success: { bg: tokens.colors.success.bg, fg: tokens.colors.success.fg },
        warning: { bg: tokens.colors.warning.bg, fg: tokens.colors.warning.fg },
        danger: { bg: tokens.colors.danger.bg, fg: tokens.colors.danger.fg },
        neutral: { bg: tokens.colors.neutral.bg, fg: tokens.colors.neutral.fg },
        error: { DEFAULT: tokens.colors.error.DEFAULT, ring: tokens.colors.error.ring },
      },
      fontFamily: {
        sans: [...tokens.typography.fontFamily.sans],
        mono: [...tokens.typography.fontFamily.mono],
      },
      fontSize: {
        '2xs': [
          tokens.typography.fontSize['2xs'].size,
          tokens.typography.fontSize['2xs'].lineHeight,
        ],
        xs: [tokens.typography.fontSize.xs.size, tokens.typography.fontSize.xs.lineHeight],
        sm: [tokens.typography.fontSize.sm.size, tokens.typography.fontSize.sm.lineHeight],
        base: [tokens.typography.fontSize.base.size, tokens.typography.fontSize.base.lineHeight],
        lg: [tokens.typography.fontSize.lg.size, tokens.typography.fontSize.lg.lineHeight],
        xl: [tokens.typography.fontSize.xl.size, tokens.typography.fontSize.xl.lineHeight],
        '2xl': [
          tokens.typography.fontSize['2xl'].size,
          tokens.typography.fontSize['2xl'].lineHeight,
        ],
        h1: [tokens.typography.fontSize.h1.size, tokens.typography.fontSize.h1.lineHeight],
        caption: [
          tokens.typography.fontSize.caption.size,
          tokens.typography.fontSize.caption.lineHeight,
        ],
        title: [tokens.typography.fontSize.title.size, tokens.typography.fontSize.title.lineHeight],
        mono: tokens.typography.fontSize.mono,
        badge: tokens.typography.fontSize.badge,
        micro: tokens.typography.fontSize.micro,
        chart: tokens.typography.fontSize.chart,
      },
      borderRadius: {
        card: tokens.radius.card,
        panel: tokens.radius.panel,
        pill: tokens.radius.pill,
        avatar: tokens.radius.avatar,
      },
      ringColor: {
        focus: tokens.focus.ring,
      },
      spacing: {
        sidebar: tokens.spacing.sidebar,
      },
      transitionDuration: {
        DEFAULT: '160ms',
      },
      fontWeight: {
        h1: Number(tokens.typography.fontSize.h1.weight),
        caption: Number(tokens.typography.fontSize.caption.weight),
      },
    },
  },
  plugins: [],
} satisfies Config;
