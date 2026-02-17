# numerilab — Implementation Checklist

## Architecture

- **Frontend:** SvelteKit + Svelte 5 + Tailwind 4
- **Styling:** Custom dark indigo/zinc theme, Manrope (Google Fonts)
- **Math rendering:** KaTeX (lightweight LaTeX)
- **Graphs:** Chart.js for interactive plots
- **Computation:** All numerical methods implemented client-side in TypeScript
- **Structure:** Feature-based modular architecture (`src/lib/features/`)

## Phase 1: Foundation

- [x] Initialize SvelteKit project
- [x] Configure Tailwind 4 with custom theme tokens
- [x] Import Google Fonts (Manrope)
- [x] Global CSS variables + base styles (`app.css`)
- [x] Base components (no shadcn):
  - [x] `<Button>` — primary + outline variants, no border-radius
  - [x] `<Card>` — bg-2, border, hover glow
  - [x] `<Input>` — dark bg, border-strong, $bindable value
  - [x] `<Badge>` — topic/section color coding
- [x] App layout with sidebar (`+layout.svelte`)
  - [x] Fixed sidebar (240px) with course section nav
  - [x] Collapsible sub-items per section
  - [x] Active route highlighting (left accent border)
  - [x] Mobile: hamburger toggle + overlay
  - [x] Main content area with responsive padding
- [x] Home/overview page — course outline, section cards

## Phase 2: Section 1 — Foundations

### Math Preliminaries

- [x] Intermediate Value Theorem
  - [x] Theory card with KaTeX formulas
  - [x] Interactive graph: pick f(a) and f(b) with opposite signs, show root must exist
  - [x] Practice: given a function, identify intervals where IVT guarantees a root
- [x] Extreme Value Theorem
  - [x] Theory + visualization of continuous function on closed interval
  - [x] Interactive: drag endpoints, see min/max highlighted
- [x] Rolle's Theorem & Mean Value Theorem
  - [x] Theory with visual proof
  - [x] Interactive graph: show the tangent line parallel to secant
  - [x] Practice problems
- [x] Taylor's Theorem
  - [x] Theory + formula rendering
  - [x] Interactive: add Taylor polynomial terms one by one, watch approximation improve
  - [x] Error bound visualization (remainder term)
  - [x] Practice: compute Taylor polynomials of given degree

### Error Analysis

- [x] Floating-point arithmetic
  - [x] Explain IEEE 754 representation visually (sign, exponent, mantissa)
  - [x] Interactive: enter a number, see its binary floating-point breakdown
  - [x] Machine epsilon demonstration
- [x] Error types
  - [x] Absolute error, relative error, significant digits — definitions + KaTeX
  - [x] Practice: compute errors given exact and approximate values
- [x] Convergence
  - [x] Linear vs quadratic vs superlinear — convergence rate plots
  - [x] Interactive: input a sequence, classify its convergence rate

## Phase 3: Section 2 — Nonlinear Equations

- [x] Bisection Method
  - [x] Step-by-step visualizer (interval narrowing on function graph)
  - [x] Iteration table (a, b, midpoint, f(mid), error)
  - [x] Convergence plot (error vs iteration)
  - [x] Practice: solve for root with given tolerance
- [x] Fixed-Point Iteration
  - [x] Cobweb diagram visualizer (y=x and y=g(x) intersection)
  - [x] Convergence/divergence demonstration
  - [x] Practice: find fixed point of g(x)
- [x] Newton's Method
  - [x] Tangent line animation per iteration
  - [x] Quadratic convergence demonstration
  - [x] Practice problems
- [x] Secant Method
  - [x] Secant line animation (two-point iteration)
  - [x] Comparison with Newton's (no derivative needed, slower convergence)
  - [x] Practice problems
- [x] Method Comparison Tool
  - [x] Run bisection, Newton, secant side-by-side on same function
  - [x] Convergence rate comparison chart
  - [x] Iteration count comparison table

## Phase 4: Section 2 — Linear Systems

- [x] Gaussian Elimination
  - [x] Step-by-step row operation visualizer (matrix transforms)
  - [x] Forward elimination + back substitution phases
  - [x] Pivot highlighting, multiplier display
  - [x] Practice: solve a system step by step
- [x] LU Decomposition
  - [x] Show factoring A = LU step by step
  - [x] Forward/back substitution with L and U
  - [x] Practice problems
- [x] Gauss-Jacobi Method
  - [x] Iteration visualizer (show each variable updating simultaneously)
  - [x] Convergence plot (solution vector per iteration)
  - [x] Diagonal dominance check
  - [x] Practice problems
- [x] Gauss-Seidel Method
  - [x] Iteration visualizer (show sequential updates)
  - [x] Comparison with Jacobi (faster convergence)
  - [x] Practice problems
- [x] Method Comparison Tool
  - [x] Direct vs iterative comparison on same system
  - [x] Iteration count, residual plots

## Phase 5: Section 3 — Interpolation

- [x] Lagrange Interpolation
  - [x] Interactive: place data points, see polynomial form
  - [x] Basis polynomial visualization (L_i(x) curves)
  - [x] Practice: construct interpolating polynomial
- [x] Newton's Divided Differences
  - [x] Divided difference table builder (step by step)
  - [x] Polynomial construction visualization
  - [x] Practice problems
- [x] Splines (Cubic)
  - [x] Interactive: place points, compare Lagrange vs spline fit
  - [x] Show piecewise polynomial segments
  - [x] Practice problems

## Phase 6: Section 3 — Differentiation & Integration

### Numerical Differentiation

- [x] Difference formulas
  - [x] Forward, backward, central difference — formulas + geometric meaning
  - [x] Interactive: pick a point, see tangent approximation via difference quotient
  - [x] Error analysis (truncation error order)
  - [x] Practice: approximate derivatives at given points

### Numerical Integration

- [x] Trapezoidal Rule
  - [x] Visualizer: show trapezoids under curve
  - [x] Composite rule: increase n, watch approximation improve
  - [x] Error bound display
  - [x] Practice problems
- [x] Simpson's Rule
  - [x] Visualizer: show parabolic segments
  - [x] Composite Simpson's
  - [x] Comparison with trapezoidal (accuracy per panel)
  - [x] Practice problems
- [x] Integration Comparison Tool
  - [x] Side-by-side: trapezoidal vs Simpson on same function
  - [x] Error vs n plots

## Phase 7: Section 4 — ODEs

- [x] Euler's Method
  - [x] Step-by-step slope field + solution curve visualizer
  - [x] Show tangent line per step
  - [x] Error accumulation visualization
  - [x] Practice: approximate y(t) for given IVP
- [x] Improved Euler (Heun's Method)
  - [x] Predictor-corrector visualization
  - [x] Comparison with basic Euler
  - [x] Practice problems
- [x] Runge-Kutta (RK4)
  - [x] Show k1, k2, k3, k4 slopes per step
  - [x] Solution curve with varying step size
  - [x] Practice problems
- [x] ODE Method Comparison
  - [x] Euler vs Heun vs RK4 on same IVP
  - [x] Error vs step size plots
  - [x] Computation cost comparison

## Phase 8: Section 4 — Eigenvalues

- [x] Power Method
  - [x] Iteration visualizer (vector converging to eigenvector)
  - [x] Eigenvalue estimate per iteration
  - [x] Convergence rate display
  - [x] Practice problems
- [x] Inverse Power Method
  - [x] Visualizer + comparison with power method
  - [x] Shifted inverse power method for specific eigenvalues
  - [x] Practice problems
- [x] QR Algorithm (basics)
  - [x] QR factorization step visualizer
  - [x] Eigenvalue convergence display
  - [x] Practice problems

## Phase 9: Practice & Assessment

- [x] Practice mode
  - [x] Problem generator per topic (randomized parameters)
  - [x] Difficulty levels (basic computation, multi-step, analysis)
  - [x] Immediate feedback with step-by-step solutions
  - [x] Score/progress tracking (local storage)
- [x] Method comparison sandbox
  - [x] User picks methods + inputs, runs side-by-side
  - [x] Export results (copy table / download chart)

## Phase 10: Polish

- [x] Mobile responsive pass (all visualizations scale)
- [x] KaTeX rendering verified across all pages
- [x] HiDPI canvas fix (devicePixelRatio)
- [x] Input visibility (border-strong + dark bg)
- [x] Two-way binding fix (Input $bindable)
- [x] MathText component for mixed text+math rendering
- [x] Modularized into feature-based architecture (10 features, 39 components)
- [ ] Loading states
- [ ] Keyboard navigation for step-through visualizers
- [ ] Performance pass (lazy load heavy chart components)
- [ ] Cross-browser testing

## Phase 11: New Features

### Math Preliminaries enhancements
- [x] Custom function input for IVT visualizer (user-defined f(x))
- [x] Custom function input for MVT visualizer
- [x] MVT for integrals (separate subsection)
- [x] Taylor polynomial calculator with custom center point + degree
- [x] Taylor error bound computation

### Error Analysis enhancements
- [x] Condition number calculator
  - [x] Theory card with KaTeX formulas
  - [x] Input f(x) and x, compute condition number
  - [x] Visualize well-conditioned vs ill-conditioned functions
- [x] Series convergence/divergence analyzer
  - [x] Input a series formula
  - [x] Compute partial sums
  - [x] Determine convergence + sum if applicable

### Additional topics
- [x] Limits proof helper (epsilon-delta visualization)
- [x] Floating-point arithmetic proof walkthrough (fl(x) = (1-ε)x)

## Decisions

- **No landing page** — straight into the app with sidebar nav
- **No auth** — local-only learning tool, progress in localStorage
- **No backend** — all computation client-side in TypeScript
- **Custom components** — no shadcn, sharp edges + indigo/zinc theme
- **KaTeX over MathJax** — faster rendering, smaller bundle
- **Chart.js for plots** — simpler API, good enough for 2D function plots
