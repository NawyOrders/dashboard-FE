import { tokens } from './tokens';

/**
 * Injects the design tokens as CSS custom properties on `:root`, so the base layer
 * (body colors, default border color, focus ring) and any inline `var(…)` usage read
 * from the same source as the compiled Tailwind classes. Called once before render.
 */
export function applyTheme(): void {
  const root = document.documentElement;
  const { colors, focus } = tokens;

  root.style.setProperty('--bg', colors.bg.DEFAULT);
  root.style.setProperty('--bg-2', colors.bg[2]);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--primary', colors.primary.DEFAULT);
  root.style.setProperty('--primary-dark', colors.primary.dark);
  root.style.setProperty('--primary-light', colors.primary.light);
  root.style.setProperty('--text', colors.text.DEFAULT);
  root.style.setProperty('--text-muted', colors.text.muted);
  root.style.setProperty('--border', colors.border.DEFAULT);
  root.style.setProperty('--focus-ring', focus.ring);
}
