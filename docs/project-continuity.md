# Numerical Analysis Interactive Learning App

## Goal
Interactive web app for learning numerical analysis — practice problems, step-by-step visualizations, algorithm animations. Make abstract math tangible and fast to learn.

## Tech Context
- Course uses R for computations — app should let users see/run algorithm steps (not necessarily R itself, but faithful implementations)
- SvelteKit frontend (per project CLAUDE.md + MCP setup)

## Course Structure (4 Sections, 4 Exams)

### Section 1 — Foundations
**Math Preliminaries:**
- Intermediate Value Theorem, Extreme Value Theorem
- Rolle's Theorem, Mean Value Theorem
- Taylor's Theorem (core — used everywhere later)

**Error Analysis:**
- Floating-point arithmetic (representation, machine epsilon)
- Absolute/relative error, significant digits
- Accuracy vs precision
- Convergence rates (linear, quadratic, superlinear)

### Section 2 — Equations & Systems (Midterm)
**Nonlinear Equations (root-finding):**
- Bracketing: Bisection method
- Fixed-point iteration
- Newton's method (tangent line, quadratic convergence)
- Secant method (no derivative needed)

**Linear Systems:**
- Gaussian elimination (row ops, back substitution)
- LU Decomposition (factor then solve)
- Gauss-Jacobi (iterative, parallel-friendly)
- Gauss-Seidel (iterative, uses latest values)

### Section 3 — Interpolation & Calculus (Pre-Final)
**Interpolation:**
- Lagrange polynomials
- Newton's divided differences
- Splines (likely cubic)

**Numerical Differentiation:**
- Forward/backward/central difference formulas

**Numerical Integration:**
- Trapezoidal rule
- Simpson's rule (1/3, possibly 3/8)
- Composite rules

### Section 4 — ODEs & Eigenvalues (Final)
**ODE Solvers:**
- Euler's method (simplest)
- Improved Euler / Heun's
- Runge-Kutta (RK4 — the workhorse)
- Possibly multistep methods

**Eigenvalue Approximation:**
- Power method
- Inverse power method
- QR algorithm basics

## Key Features to Build
1. **Algorithm Visualizer** — step-through animations (e.g., bisection narrowing, Newton tangent lines, Gaussian elimination row ops)
2. **Practice Problems** — auto-generated with varying difficulty, immediate feedback
3. **Error Tracking** — show error reduction per iteration, convergence plots
4. **Method Comparison** — run multiple methods side-by-side on same problem, compare convergence
5. **Interactive Graphs** — plot functions, roots, interpolation polynomials, ODE solution curves

## Learning Outcomes to Support
- Pick the right method for a problem type
- Understand implementation (step-by-step, not just "call library")
- Compute and interpret errors
- Compare method accuracy/efficiency
- Connect to real-world applications
