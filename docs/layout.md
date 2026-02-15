# Layout — Sidebar App

No landing page. Straight into the app with a persistent sidebar.

## Structure

```
+--------------------------------------------------+
| Sidebar (240px)  |  Main Content                  |
|                  |                                 |
| Brand            |  [Page content here]            |
| Nav Links        |                                 |
|                  |                                 |
| Section 1        |                                 |
|   > Prelims      |                                 |
|   > Error        |                                 |
| Section 2        |                                 |
|   > Nonlinear    |                                 |
|   > Linear Sys   |                                 |
| Section 3        |                                 |
|   > Interpolation|                                 |
|   > Diff & Int   |                                 |
| Section 4        |                                 |
|   > ODEs         |                                 |
|   > Eigenvalues  |                                 |
|                  |                                 |
| Practice         |                                 |
| Compare          |                                 |
+--------------------------------------------------+
```

## Sidebar

- Fixed left, 240px wide on desktop
- `bg-2` background, right `border` border
- Collapsible on mobile (hamburger toggle + overlay)
- Brand at top (app name, mono font)
- Nav grouped by course section with collapsible sub-items
- Active state: left cyan border + accent text
- Bottom: utility links (practice mode, method comparison)

## Main Content

- Left margin 240px on desktop, full width on mobile
- Max-width container centered, padding 24px (desktop) / 16px (mobile)
- Top padding on mobile for collapsed sidebar header (sticky bar with hamburger)

## Mobile Responsive

- Sidebar hidden by default, toggle with hamburger icon
- Overlay backdrop when sidebar open
- Content takes full width
- Cards stack vertically
- Graphs/visualizations resize to fit viewport
