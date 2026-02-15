import type { Topic, Problem } from './types';

export const topics: Topic[] = [
  { id: 'math-preliminaries', title: 'Math Preliminaries', path: '/section-1/math-preliminaries', color: '#64748b' },
  { id: 'error-analysis', title: 'Error Analysis', path: '/section-1/error-analysis', color: '#64748b' },
  { id: 'nonlinear-equations', title: 'Nonlinear Equations', path: '/section-2/nonlinear-equations', color: '#22c55e' },
  { id: 'linear-systems', title: 'Linear Systems', path: '/section-2/linear-systems', color: '#22c55e' },
  { id: 'interpolation', title: 'Interpolation', path: '/section-3/interpolation', color: '#818cf8' },
  { id: 'diff-integration', title: 'Differentiation & Integration', path: '/section-3/diff-integration', color: '#818cf8' },
  { id: 'odes', title: 'ODEs', path: '/section-4/odes', color: '#f59e0b' },
  { id: 'eigenvalues', title: 'Eigenvalues', path: '/section-4/eigenvalues', color: '#f59e0b' }
];

export const problemTemplates: Problem[] = [
  // Error Analysis
  {
    id: 'ea-1',
    topicId: 'error-analysis',
    difficulty: 'basic',
    question: 'Given exact value $p = 3.141592$ and approximation $\\tilde{p} = 3.14$, what is the absolute error?',
    type: 'numeric',
    correctAnswer: 0.001592,
    explanation: 'Absolute error = $|p - \\tilde{p}| = |3.141592 - 3.14| = 0.001592$'
  },
  {
    id: 'ea-2',
    topicId: 'error-analysis',
    difficulty: 'intermediate',
    question: 'Given $p = 0.5$ and $\\tilde{p} = 0.499$, what is the relative error?',
    type: 'numeric',
    correctAnswer: 0.002,
    explanation: 'Relative error = $\\frac{|p - \\tilde{p}|}{|p|} = \\frac{|0.5 - 0.499|}{0.5} = \\frac{0.001}{0.5} = 0.002$'
  },
  {
    id: 'ea-3',
    topicId: 'error-analysis',
    difficulty: 'advanced',
    question: 'If a sequence converges with $|p_{n+1} - p| \\approx C|p_n - p|^2$, what is the order of convergence?',
    type: 'multiple-choice',
    options: ['Linear (α = 1)', 'Quadratic (α = 2)', 'Cubic (α = 3)', 'Superlinear'],
    correctAnswer: 'Quadratic (α = 2)',
    explanation: 'The exponent 2 indicates quadratic convergence. This is characteristic of Newton\'s method.'
  },

  // Nonlinear Equations
  {
    id: 'ne-1',
    topicId: 'nonlinear-equations',
    difficulty: 'basic',
    question: 'Using bisection method on $f(x) = x^2 - 2$ with $[a_0, b_0] = [1, 2]$, what is $p_0$ (first midpoint)?',
    type: 'numeric',
    correctAnswer: 1.5,
    explanation: 'The midpoint is $p_0 = \\frac{a_0 + b_0}{2} = \\frac{1 + 2}{2} = 1.5$'
  },
  {
    id: 'ne-2',
    topicId: 'nonlinear-equations',
    difficulty: 'intermediate',
    question: 'For $f(x) = x^2 - 2$ with $[1, 2]$, after $p_0 = 1.5$ where $f(1.5) = 0.25 > 0$, what is the next interval?',
    type: 'multiple-choice',
    options: ['[1, 1.5]', '[1.5, 2]', '[1, 1.25]', '[1.25, 2]'],
    correctAnswer: '[1, 1.5]',
    explanation: 'Since $f(1) < 0$ and $f(1.5) > 0$, the root is in $[1, 1.5]$'
  },
  {
    id: 'ne-3',
    topicId: 'nonlinear-equations',
    difficulty: 'advanced',
    question: 'For Newton\'s method on $f(x) = x^2 - 2$, what is $f\'(x)$?',
    type: 'multiple-choice',
    options: ['$x$', '$2x$', '$x^2$', '$2x - 2$'],
    correctAnswer: '$2x$',
    explanation: 'The derivative of $f(x) = x^2 - 2$ is $f\'(x) = 2x$'
  },

  // Linear Systems
  {
    id: 'ls-1',
    topicId: 'linear-systems',
    difficulty: 'basic',
    question: 'Solve: $2x + y = 5$ and $x - y = 1$. What is $x$?',
    type: 'numeric',
    correctAnswer: 2,
    explanation: 'Adding equations: $3x = 6$, so $x = 2$. Then $y = 2x - 5 = -1$'
  },
  {
    id: 'ls-2',
    topicId: 'linear-systems',
    difficulty: 'intermediate',
    question: 'For Gaussian elimination, which operation preserves the solution?',
    type: 'multiple-choice',
    options: [
      'Multiply a row by 0',
      'Add a multiple of one row to another',
      'Delete a row',
      'Square all entries'
    ],
    correctAnswer: 'Add a multiple of one row to another',
    explanation: 'Elementary row operations (swap, scale by non-zero, add multiple) preserve solutions'
  },
  {
    id: 'ls-3',
    topicId: 'linear-systems',
    difficulty: 'advanced',
    question: 'Which decomposition writes $A = LU$ where $L$ is lower triangular and $U$ is upper triangular?',
    type: 'multiple-choice',
    options: ['QR decomposition', 'LU decomposition', 'Cholesky decomposition', 'SVD'],
    correctAnswer: 'LU decomposition',
    explanation: 'LU decomposition factors a matrix into lower (L) and upper (U) triangular matrices'
  },

  // Interpolation
  {
    id: 'int-1',
    topicId: 'interpolation',
    difficulty: 'basic',
    question: 'How many points determine a unique polynomial of degree $n$?',
    type: 'multiple-choice',
    options: ['$n$', '$n+1$', '$n-1$', '$2n$'],
    correctAnswer: '$n+1$',
    explanation: 'A polynomial of degree $n$ has $n+1$ coefficients, so we need $n+1$ points'
  },
  {
    id: 'int-2',
    topicId: 'interpolation',
    difficulty: 'intermediate',
    question: 'For Lagrange interpolation with points $(0,1)$ and $(1,2)$, what is $L_0(x)$?',
    type: 'multiple-choice',
    options: ['$x$', '$1-x$', '$\\frac{x-1}{0-1}$', '$\\frac{x}{x-1}$'],
    correctAnswer: '$1-x$',
    explanation: '$L_0(x) = \\frac{x - x_1}{x_0 - x_1} = \\frac{x - 1}{0 - 1} = 1 - x$'
  },
  {
    id: 'int-3',
    topicId: 'interpolation',
    difficulty: 'advanced',
    question: 'The divided difference $f[x_0, x_1]$ equals:',
    type: 'multiple-choice',
    options: [
      '$f(x_1) - f(x_0)$',
      '$\\frac{f(x_1) - f(x_0)}{x_1 - x_0}$',
      '$f(x_1) + f(x_0)$',
      '$x_1 - x_0$'
    ],
    correctAnswer: '$\\frac{f(x_1) - f(x_0)}{x_1 - x_0}$',
    explanation: 'First divided difference is the slope: $f[x_0, x_1] = \\frac{f(x_1) - f(x_0)}{x_1 - x_0}$'
  },

  // Differentiation & Integration
  {
    id: 'di-1',
    topicId: 'diff-integration',
    difficulty: 'basic',
    question: 'Trapezoidal rule for $\\int_0^2 x\\,dx$ with $n=1$:',
    type: 'numeric',
    correctAnswer: 2,
    explanation: '$\\int_0^2 x\\,dx \\approx \\frac{h}{2}[f(0) + f(2)] = \\frac{2}{2}[0 + 2] = 2$'
  },
  {
    id: 'di-2',
    topicId: 'diff-integration',
    difficulty: 'intermediate',
    question: 'For $f(x) = x^2$, what is $f\'(1)$ using forward difference $h=0.1$?',
    type: 'numeric',
    correctAnswer: 2.1,
    explanation: '$f\'(1) \\approx \\frac{f(1.1) - f(1)}{0.1} = \\frac{1.21 - 1}{0.1} = 2.1$'
  },
  {
    id: 'di-3',
    topicId: 'diff-integration',
    difficulty: 'advanced',
    question: 'Simpson\'s rule requires how many points minimum?',
    type: 'multiple-choice',
    options: ['2', '3', '4', '5'],
    correctAnswer: '3',
    explanation: 'Simpson\'s rule uses a parabola, requiring 3 points (at $a$, midpoint, $b$)'
  },

  // ODEs
  {
    id: 'ode-1',
    topicId: 'odes',
    difficulty: 'basic',
    question: 'Euler\'s method for $y\' = y$, $y(0) = 1$, $h = 0.5$. What is $y_1$?',
    type: 'numeric',
    correctAnswer: 1.5,
    explanation: '$y_1 = y_0 + h \\cdot f(t_0, y_0) = 1 + 0.5 \\cdot 1 = 1.5$'
  },
  {
    id: 'ode-2',
    topicId: 'odes',
    difficulty: 'intermediate',
    question: 'Which ODE method has higher accuracy than Euler?',
    type: 'multiple-choice',
    options: ['Forward Euler', 'Heun (RK2)', 'Backward difference', 'None'],
    correctAnswer: 'Heun (RK2)',
    explanation: 'Heun\'s method (RK2) is second-order accurate, while Euler is first-order'
  },
  {
    id: 'ode-3',
    topicId: 'odes',
    difficulty: 'advanced',
    question: 'RK4 (Runge-Kutta 4th order) requires how many function evaluations per step?',
    type: 'multiple-choice',
    options: ['1', '2', '3', '4'],
    correctAnswer: '4',
    explanation: 'RK4 computes $k_1, k_2, k_3, k_4$ - four slope evaluations per step'
  },

  // Eigenvalues
  {
    id: 'eig-1',
    topicId: 'eigenvalues',
    difficulty: 'basic',
    question: 'An eigenvector $v$ of matrix $A$ satisfies:',
    type: 'multiple-choice',
    options: ['$Av = 0$', '$Av = \\lambda v$', '$Av = v$', '$A = \\lambda v$'],
    correctAnswer: '$Av = \\lambda v$',
    explanation: 'By definition, $Av = \\lambda v$ where $\\lambda$ is the eigenvalue'
  },
  {
    id: 'eig-2',
    topicId: 'eigenvalues',
    difficulty: 'intermediate',
    question: 'Power iteration finds which eigenvalue?',
    type: 'multiple-choice',
    options: ['Smallest', 'Largest in magnitude', 'Most positive', 'Most negative'],
    correctAnswer: 'Largest in magnitude',
    explanation: 'Power iteration converges to the dominant (largest magnitude) eigenvalue'
  },
  {
    id: 'eig-3',
    topicId: 'eigenvalues',
    difficulty: 'advanced',
    question: 'For $A = \\begin{bmatrix} 2 & 0 \\\\ 0 & 3 \\end{bmatrix}$, what are the eigenvalues?',
    type: 'multiple-choice',
    options: ['1, 1', '2, 3', '5, 5', '0, 0'],
    correctAnswer: '2, 3',
    explanation: 'For diagonal matrices, eigenvalues are the diagonal entries: 2 and 3'
  },

  // Math Preliminaries
  {
    id: 'mp-1',
    topicId: 'math-preliminaries',
    difficulty: 'basic',
    question: 'The Intermediate Value Theorem guarantees a root if:',
    type: 'multiple-choice',
    options: [
      '$f$ is continuous and $f(a) \\cdot f(b) < 0$',
      '$f$ is differentiable',
      '$f(a) = f(b)$',
      '$f$ is constant'
    ],
    correctAnswer: '$f$ is continuous and $f(a) \\cdot f(b) < 0$',
    explanation: 'IVT: If $f$ is continuous on $[a,b]$ and $f(a)$ and $f(b)$ have opposite signs, there exists $c \\in (a,b)$ with $f(c) = 0$'
  },
  {
    id: 'mp-2',
    topicId: 'math-preliminaries',
    difficulty: 'intermediate',
    question: 'Rolle\'s Theorem requires which condition?',
    type: 'multiple-choice',
    options: [
      '$f(a) = f(b)$',
      '$f\'(a) = 0$',
      '$f$ is constant',
      '$f$ is linear'
    ],
    correctAnswer: '$f(a) = f(b)$',
    explanation: 'Rolle: If $f$ is continuous on $[a,b]$, differentiable on $(a,b)$, and $f(a) = f(b)$, then $\\exists c$ with $f\'(c) = 0$'
  },
  {
    id: 'mp-3',
    topicId: 'math-preliminaries',
    difficulty: 'advanced',
    question: 'Taylor series centered at $a$ for $f(x)$ starts with:',
    type: 'multiple-choice',
    options: [
      '$f(0) + f\'(0)x + \\cdots$',
      '$f(a) + f\'(a)(x-a) + \\cdots$',
      '$f(x) + f\'(x) + \\cdots$',
      '$f(a) + f(a)x + \\cdots$'
    ],
    correctAnswer: '$f(a) + f\'(a)(x-a) + \\cdots$',
    explanation: 'Taylor series: $f(x) = f(a) + f\'(a)(x-a) + \\frac{f\'\'(a)}{2!}(x-a)^2 + \\cdots$'
  }
];
