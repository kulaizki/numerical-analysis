# Interactive Numerical Analysis

Interactive visualizations and step-by-step solvers for numerical methods. Built as a study companion for an undergraduate numerical analysis course.

## Tech Stack

- **SvelteKit** with **Svelte 5** (runes)
- **Tailwind CSS 4** (dark theme)
- **KaTeX** for math rendering
- **Chart.js** for data visualization
- **TypeScript**
- Fully static / prerendered

## Topics Covered

### Section 1: Foundations

**Math Preliminaries**
- Intermediate Value Theorem (IVT) — interactive visualizer with custom functions
- Extreme Value Theorem (EVT) — visual demonstration
- Mean Value Theorem (MVT) — graphical proof with tangent/secant lines
- MVT for Integrals — area-based visualization
- Taylor's Theorem — polynomial approximation with error bounds
- Epsilon-Delta limit proofs — interactive visualizer

**Error Analysis**
- IEEE 754 floating-point converter
- Absolute/relative error calculator
- Loss of significance demonstrations
- Propagated error analysis
- Convergence rate charts (O(h), O(h^2), etc.)
- Condition number calculator
- Series convergence analyzer
- Floating-point arithmetic proof walkthroughs
- Sequence analyzer

### Section 2: Equations & Systems

**Nonlinear Equations**
- Bisection method — step-by-step solver with custom function input
- Fixed-point iteration — convergence visualization
- Newton's method — solver with custom f(x) and f'(x)
- Secant method — solver with custom functions and presets
- Method comparison view

**Linear Systems**
- Gaussian elimination with back substitution
- LU decomposition
- Jacobi iterative method
- Gauss-Seidel iterative method
- Matrix norms calculator
- Linear system error analysis
- Method comparison view

### Section 3: Interpolation & Calculus

**Interpolation**
- Lagrange interpolation
- Newton's divided differences
- Cubic splines
- Method comparison view

**Differentiation & Integration**
- Numerical differentiation tool (forward, backward, central differences)
- Trapezoidal rule
- Simpson's rule
- Method comparison view

### Section 4: ODEs & Eigenvalues

**Ordinary Differential Equations**
- Euler's method
- Heun's method (improved Euler)
- Runge-Kutta (RK4)
- Method comparison view

**Eigenvalues**
- Power method
- Inverse power method (with shift)
- QR algorithm
- Method comparison view

### Additional Features

- **Compare** — side-by-side method comparisons for root-finding, integration, and ODEs
- **Practice** — quiz system with difficulty levels, topic filtering, and progress tracking via localStorage

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

All pages are prerendered as static HTML. Deploys to Vercel with zero configuration.
