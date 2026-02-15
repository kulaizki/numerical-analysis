# Math Preliminaries Page - Learnings

## Implementation Summary

Built a comprehensive interactive Math Preliminaries page covering 4 fundamental calculus theorems with theory, visualization, and practice components.

## Key Features Implemented

### 1. Intermediate Value Theorem (IVT)
- **Theory**: KaTeX-rendered statement about continuous functions crossing intermediate values
- **Interactive Canvas**: Shows f(x) = x³ - x - 2 with adjustable interval [a,b] using range sliders
- **Visual Feedback**: Highlights when f(a) and f(b) have opposite signs, marks approximate root with green dot
- **Practice Problem**: Multiple choice question about finding intervals containing roots with instant feedback

### 2. Extreme Value Theorem (EVT)
- **Theory**: Statement about continuous functions attaining max/min on closed intervals
- **Interactive Canvas**: Visualizes f(x) = -x² + 4x - 1 on [0,4]
- **Visual Elements**: Cyan dot for maximum, orange dot for minimum with coordinates

### 3. Rolle's Theorem & Mean Value Theorem
- **Theory**: Both theorems presented with KaTeX formulas
- **Interactive Canvas**: Shows f(x) = x³ - 3x + 1 with:
  - Dashed blue secant line through endpoints
  - Green tangent line at adjustable point c
  - Real-time slope comparison display
- **User Control**: Slider to adjust c and find where tangent parallels secant

### 4. Taylor's Theorem
- **Theory**: General Taylor expansion formula + sin(x) specific formula
- **Interactive Canvas**:
  - Compares exact sin(x) (solid cyan) with Taylor polynomial (dashed blue)
  - Slider for degree (1-11, odd only) to show convergence
  - Real-time error calculation displayed
- **Educational**: Shows how higher degrees improve approximation quality

## Technical Patterns

### Svelte 5 Runes Usage
- `$state()` for all reactive variables (slider values, canvas refs, UI state)
- `$effect()` for canvas redrawing on state changes
- No `$derived` needed as calculations happen in effects

### Canvas Drawing Pattern
```typescript
$effect(() => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Clear canvas
  // 2. Setup coordinate transformations
  // 3. Draw grid/axes
  // 4. Draw function curve
  // 5. Draw interactive elements
  // 6. Add labels
});
```

### Coordinate Transformation
Used helper functions to map mathematical coordinates to canvas pixels:
```typescript
const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
```

### Color Scheme (Dark + Cyan Theme)
- Canvas background: `#121212`
- Axes: `#0c4a6e` (dark blue)
- Grid: `#1e293b` (muted dark)
- Primary function: `#00ffff` (cyan)
- Secondary/helper: `#7dd3fc` (light cyan)
- Success/root: `#10b981` (green)
- Warning/min: `#f59e0b` (orange)

## Component Integration

### KaTeX Component
- Used `displayMode={true}` for centered block formulas
- Multi-line formulas with `\\` linebreaks
- LaTeX commands: `\text{}`, `\exists`, `\in`, `\sum`, `\frac{}{}`

### UI Components
- **Card**: Container with `class="space-y-4"` for consistent spacing
- **Button**: Used `variant="ghost"` for show/hide toggles, `variant="primary"` for actions
- **Input**: Range sliders styled with custom CSS for cyan accent

## Performance Considerations

- Canvas set to fixed 800x300 logical pixels, CSS scales to 100% width
- Effects trigger on state changes but are lightweight (just drawing)
- No requestAnimationFrame needed as sliders don't require continuous animation
- Factorial calculation for Taylor series is acceptable for small degrees (max 11)

## Section Structure

Each theorem section follows consistent pattern:
1. Header with collapsible toggle
2. Theory card with formal statement
3. Interactive visualization with canvas
4. Control inputs (sliders, radio buttons)
5. Legend/color key
6. Optional practice problem with feedback

## Accessibility Notes

- Section IDs added for sidebar navigation: `#ivt`, `#evt`, `#mvt`, `#taylor`
- Clear labels on all inputs
- Color coding supplemented with text labels
- Range sliders show current values

## Mathematical Functions Implemented

- IVT: `f(x) = x³ - x - 2`
- EVT: `f(x) = -x² + 4x - 1`
- MVT: `f(x) = x³ - 3x + 1`, derivative: `f'(x) = 3x² - 3`
- Taylor: `sin(x)` with polynomial approximation using factorial series
