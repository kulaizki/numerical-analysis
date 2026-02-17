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

## Phase 12: Lecture Alignment — Worked Examples & Problem Sets

### Math Preliminaries — Worked Examples
Add expandable "Worked Example" sections to existing visualizer components with
step-by-step solutions matching the professor's lecture examples.

- [x] Epsilon-delta proof walkthrough (Example 1.1: prove lim(x→1) x²=1)
  - [x] Scratch work phase (bounding |x+1| < 3 when x ∈ [0,2])
  - [x] Formal proof phase (set δ ≤ ε/3, show |x²−1| < ε)
  - [x] Visualization synced to proof steps (ε/δ bands on canvas)
- [x] IVT worked example (Example 1.2: x³−3x²−2x+9 = 0)
  - [x] Step 1: evaluate f(−2)=−7, f(−1)=7
  - [x] Step 2: verify continuity + sign change → root in [−2,−1]
  - [x] Visualization highlighting the root interval
- [x] Rolle's Theorem worked example (Example 1.3: f(x)=x⁴−2x² on [−2,2])
  - [x] Verify f(−2)=f(2)=8
  - [x] Solve f'(ξ)=4ξ³−4ξ=0 → ξ=−1,0,1
  - [x] Show all three tangent lines on graph
- [x] MVT worked example (Example 1.4: f(x)=x³+2x²−x on [−1,2])
  - [x] Compute secant slope (f(2)−f(−1))/(2−(−1)) = 4
  - [x] Solve 3ξ²+4ξ−1=4 → ξ=(−4+√76)/6 ≈ 0.7863
  - [x] Show secant + tangent on graph
- [x] Integral MVT worked example (Example 1.5: f(x)=3x²−2x on [1,4])
  - [x] Compute ∫₁⁴(3x²−2x)dx = 48
  - [x] Solve 9ξ²−6ξ=48 → ξ=8/3 ∈ [1,4]
  - [x] Show rectangle area matching integral area
- [x] Taylor worked example (Example 1.6: f(x)=∛x at x₀=8)
  - [x] Build p₁ and p₂ step by step (derivatives at x=8)
  - [x] Estimate ∛11 using p₁ (2.25) and p₂ (2.21875)
  - [x] Error bounds R₂ and R₃ with maximum derivative analysis
  - [x] Compare estimates vs actual ∛11 ≈ 2.22398

### Error Analysis — Worked Examples
- [x] Significant digits worked examples (Example 1.10)
  - [x] x=1/3, xA=0.333 → 3 significant digits (show formula)
  - [x] x=0.02138, xA=0.02144 → 2 significant digits (why not 3)
- [x] Loss of significance examples (Examples 1.11–1.13)
  - [x] Subtraction of nearly equal numbers: x=7.6545428, y=7.6544201
  - [x] Show relative error amplification (Er(zA) ≈ 53736 × Er(xA))
  - [x] f(x)=x(√(x+1)−√x) evaluation at x=100000
- [x] Condition number worked examples (Examples 1.14–1.15)
  - [x] f(x)=√x → κ=1/2 (well-conditioned for all x)
  - [x] f(x)=10/(1−x²) → κ=2x²/|1−x²| (ill-conditioned near x=±1)
- [x] Stability analysis example (Example 1.16: f(x)=√(x+1)−√x)
  - [x] 3-digit rounding at x=12345 → 22% relative error
  - [x] Demonstrate instability step identification
- [x] Propagated error theory card
  - [x] MVT-based derivation: f(x)−f(xA) ≈ f'(x)(x−xA)
  - [x] Relative error formula: Er(f(x)) = [xf'(x)/f(x)] · Er(x)
  - [x] Connection to condition number

### Error Analysis — Missing Sub-topics
- [x] Normalization demo
  - [x] Interactive: enter a number, toggle normalized/non-normalized form
  - [x] Examples: 6.238 = 0.6238×10¹ (normalized), −0.0014 = 0.0014×10⁰ (not) vs 0.14×10⁻² (normalized)
- [x] Overflow/underflow demo
  - [x] Show exponent range limits (m < e < M)
  - [x] Interactive: enter extreme numbers, see NaN/Inf/0 behavior
  - [x] IEEE 754 single vs double precision limits

### Problem Set 1 (Professor's Homework)
Add these as a dedicated problem set in the practice system with full step-by-step solutions.

- [x] Problem 1: Prove lim(x→−1) 2x+1 = −1 (epsilon-delta)
- [x] Problem 2: MVT for f(x)=x³−4x²−2x−5 on [−10,10], find all c values
- [x] Problem 3: Integral MVT for f(x)=2eˣ on [−1,1], find c
- [x] Problem 4: Taylor for cos(x) at x=π
  - [x] (a) Find 4th Taylor polynomial
  - [x] (b) Approximate cos(0)
  - [x] (c) Bound the error
- [x] Problem 5: Prove fl(x) = (1−ε)x
- [x] Problem 6: Significant digits + relative error
  - [x] (a) x=451.01, xA=451.023
  - [x] (b) x=−0.04518, xA=−0.045113
  - [x] (c) x=23.4604, xA=23.4213
- [x] Problem 7: Condition numbers
  - [x] (a) f(x)=2x²
  - [x] (b) f(x)=2πx
  - [x] (c) f(x)=2bx
- [x] Problem 8: Series convergence — Σ(1/2ⁿ) from n=1 to ∞ (geometric, sum=1)

## Phase 13: Section 2 Lecture Alignment — Worked Examples & New Topics

### Nonlinear Equations — Worked Examples
All three methods use the same function f(x) = x⁶ − x − 1 = 0 for direct comparison.

- [x] Bisection worked example (x⁶−x−1=0 on [1, 1.5], ε=0.00005)
  - [x] Full 15-iteration table (a, b, c, f(b), f(c), f(b)f(c))
  - [x] Required iterations formula: n ≥ log₂((b−a)/ε) → n ≥ 15
  - [x] Convergence bound: |α−cₙ| ≤ (1/2)ⁿ(b−a)
- [x] Newton's worked example (x⁶−x−1=0, x₀=2)
  - [x] 7 iterations: x₁=1.6806, x₂=1.4307, ..., x₇=1.134724
  - [x] Quadratic convergence theorem: lim (α−xₙ₊₁)/(α−xₙ)² = −f''(α)/(2f'(α))
  - [x] Error estimation: α−xₙ ≈ xₙ₊₁−xₙ
- [x] Secant worked example (x⁶−x−1=0, x₀=1, x₁=2)
  - [x] 8 iterations step-by-step
  - [x] Error analysis formula with f''/f'
  - [x] Comparison note: converges to same root as Newton (1.134724) but in more iterations

### Linear Systems — Worked Examples
- [x] Gauss-Jordan worked example (x+y+z=900000 system)
  - [x] Augmented matrix setup
  - [x] Step-by-step row operations: −4r₁+r₂→r₂, −1·r₂→r₂, 2r₂+r₃→r₃, r₃/5→r₃
  - [x] Back substitution: x₃=360000, x₂=180000, x₁=360000
- [x] LU Factorization worked example (same 900000 system)
  - [x] Derive L and U matrices step by step
  - [x] Solve Ly=b (forward sub), then Ux=y (back sub)
  - [x] Verify A = LU
- [x] Jacobi worked example (6x₁−2x₂+x₃=11 system)
  - [x] Split A = D+L+U, show each matrix
  - [x] 8 iterations from x⁰=(0,0,0) → converges to (2,1,1)
  - [x] Show iteration formula: xᵏ = −D⁻¹(L+U)xᵏ⁻¹ + D⁻¹b
- [x] Gauss-Seidel worked example (same system)
  - [x] 5 iterations from x⁰=(0,0,0) → faster convergence
  - [x] Show formula: xⁿ⁺¹ = −(L+D)⁻¹Uxⁿ + (L+D)⁻¹b
  - [x] Compare: 5 iterations vs Jacobi's 8

### Linear Systems — New Sub-topics
- [x] Matrix & Vector Norms (new component)
  - [x] Theory: 1-norm (sum of magnitudes), 2-norm (Euclidean), ∞-norm (max)
  - [x] Matrix norms: ||A||₁ (max column sum), ||A||∞ (max row sum), Frobenius norm
  - [x] Interactive calculator: input vector/matrix, compute all norms
  - [x] Worked example: x=(1.25, 0.02, −5.15, 0) → ||x||₁=6.42, ||x||∞=5.15
  - [x] Matrix example: A=[5,9;−2,1] → ||A||_F=10.54, ||A||∞=14.0
- [x] Error in Solving Linear Systems (new component)
  - [x] Theory: residual r=b−Ax̄, error e=A⁻¹r, correction x̄+ē
  - [x] Worked example using Gauss-Seidel result x̄=(2.000119, 1.000068, 1.000051)
  - [x] Show residual computation, error estimation, and corrected solution = (2,1,1)
  - [x] Interactive: input approximate solution, compute residual and correction

### Problem Set 2 (Professor's Homework)
- [x] Problem 1: Bisection for x³−2x−2=0, ε=0.0001
- [x] Problem 2: Newton's for f(x)=4x³−1−e^(x²/2)
  - [x] (a) Find f'(x)
  - [x] (b) Newton from x₀=2, which root? iterations for error < 10⁻⁵
  - [x] (c) Find other root from different starting point
- [x] Problem 3: Secant for same f(x), x₀=0, x₁=1, ε=0.001
- [x] Problem 4: System 2.51x+1.48y+4.53z=0.05, etc.
  - [x] (a) Augmented matrix
  - [x] (b) Solve via LU, round to 4 decimals
  - [x] (c) Find residual given true solution
- [x] Problem 5: Compute 1-, 2-, ∞-norms of given 3×3 matrix
- [x] Problem 6: Solve system with Jacobi and Gauss-Seidel (5-digit precision)
  - [x] (a) Jacobi iterations
  - [x] (b) Gauss-Seidel iterations
  - [x] (c) Compute error ē given true solution

## Decisions

- **No landing page** — straight into the app with sidebar nav
- **No auth** — local-only learning tool, progress in localStorage
- **No backend** — all computation client-side in TypeScript
- **Custom components** — no shadcn, sharp edges + indigo/zinc theme
- **KaTeX over MathJax** — faster rendering, smaller bundle
- **Chart.js for plots** — simpler API, good enough for 2D function plots
