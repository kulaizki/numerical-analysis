# Theme — Dark + Cyan

Consistent with moriarty design system. Dark mode, sharp edges, cyan accents, Manrope + Roboto Mono fonts.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0a0a0a` | Page background |
| `--bg-2` | `#121212` | Cards, sidebar, panels |
| `--bg-3` | `#1a1a1a` | Inputs, hover states |
| `--text` | `#e0f2fe` | Primary text (light sky blue) |
| `--text-muted` | `#7dd3fc` | Secondary text |
| `--text-tertiary` | `#38bdf8` | Labels, hints |
| `--accent` | `#00ffff` | Cyan — buttons, links, highlights |
| `--accent-hover` | `#22d3ee` | Cyan hover |
| `--border` | `#0c4a6e` | Default borders |
| `--border-strong` | `#0284c7` | Emphasis borders |
| `--error` | `#f87171` | Error states |
| `--success` | `#34d399` | Correct answers, convergence |
| `--warning` | `#fbbf24` | Warnings |

## Typography

- **Body:** `'Manrope', sans-serif` via Google Fonts
- **Mono:** `'Roboto Mono', monospace` via Google Fonts
- Mono used for: math expressions, algorithm steps, iteration tables, code blocks
- Body used for: headings, descriptions, navigation

## Tailwind 4 Theme Block

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500;600&display=swap');

@theme {
  --font-sans: 'Manrope', sans-serif;
  --font-mono: 'Roboto Mono', monospace;
  --color-bg: #0a0a0a;
  --color-bg-2: #121212;
  --color-bg-3: #1a1a1a;
  --color-primary: #e0f2fe;
  --color-muted: #7dd3fc;
  --color-tertiary: #38bdf8;
  --color-accent: #00ffff;
  --color-accent-hover: #22d3ee;
  --color-border: #0c4a6e;
  --color-border-strong: #0284c7;
  --color-error: #f87171;
  --color-success: #34d399;
  --color-warning: #fbbf24;
}
```

## UI Conventions

- **No rounded corners** — sharp edges on all elements
- **No shadcn** — custom components only
- **Cards:** `bg-2` background, `border` border, hover → cyan glow
- **Buttons (primary):** cyan bg, dark text, 1px cyan border
- **Buttons (outline):** transparent, `border-strong` border, cyan text
- **Active nav:** left cyan border + accent text color
- **Hover glow:** `box-shadow: 0 0 16px rgba(0, 255, 255, 0.1)`
- **Transitions:** 0.15s ease on border-color, background, box-shadow

## Animations

- `fade-in-up` — scroll-triggered entrance (0.4s)
- `glow-pulse` — cyan box-shadow pulse for active elements
- `blink` — cursor blink for terminal elements (if used)

## Difficulty / Topic Colors

For categorizing topics by section:

| Section | Color | Hex |
|---------|-------|-----|
| Foundations | Slate | `#64748b` |
| Nonlinear Eq. | Green | `#22c55e` |
| Linear Systems | Sky Blue | `#38bdf8` |
| Interpolation | Indigo | `#818cf8` |
| Differentiation | Purple | `#a855f7` |
| Integration | Cyan | `#00ffff` |
| ODEs | Amber | `#f59e0b` |
| Eigenvalues | Red | `#ef4444` |
