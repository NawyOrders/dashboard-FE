/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FDF8F3',
          2: '#FFEFE3',
        },
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#E43820',
          dark: '#B8251A',
          light: '#FF6B4A',
        },
        text: {
          DEFAULT: '#1B1410',
          muted: '#7A6F69',
        },
        border: '#F0E6DD',
        success: { bg: '#E6F6EC', fg: '#167A3E' },
        warning: { bg: '#FFF4D6', fg: '#9A6200' },
        danger: { bg: '#FDE7E4', fg: '#B8251A' },
        neutral: { bg: '#F3EEE9', fg: '#5E544D' },
        info: { bg: '#E8F0FE', fg: '#1F4FB4' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['12px', '16px'],
      },
      borderRadius: {
        card: '20px',
        panel: '12px',
        pill: '8px',
        avatar: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(120,60,30,.04), 0 8px 24px rgba(120,60,30,.05)',
        primary: '0 6px 16px rgba(228,56,32,.25)',
      },
      spacing: {
        sidebar: '280px',
      },
      transitionDuration: {
        DEFAULT: '160ms',
      },
    },
  },
  plugins: [],
};
