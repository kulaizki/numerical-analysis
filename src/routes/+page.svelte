<svelte:head>
  <title>Interactive Numerical Analysis</title>
</svelte:head>

<script lang="ts">
  import { Card, Badge } from '$lib/components/ui';

  interface Topic {
    title: string;
    path: string;
    description: string;
  }

  interface Section {
    number: number;
    title: string;
    color: string;
    topics: Topic[];
  }

  const sections: Section[] = [
    {
      number: 1,
      title: 'Foundations',
      color: '#64748b',
      topics: [
        {
          title: 'Math Preliminaries',
          path: '/section-1/math-preliminaries',
          description: 'IVT, EVT, Rolle\'s/MVT, Taylor\'s Theorem'
        },
        {
          title: 'Error Analysis',
          path: '/section-1/error-analysis',
          description: 'Floating-point, errors, convergence rates'
        }
      ]
    },
    {
      number: 2,
      title: 'Equations & Systems',
      color: '#22c55e',
      topics: [
        {
          title: 'Nonlinear Equations',
          path: '/section-2/nonlinear-equations',
          description: 'Bisection, Fixed-Point, Newton, Secant'
        },
        {
          title: 'Linear Systems',
          path: '/section-2/linear-systems',
          description: 'Gauss, LU, Jacobi, Gauss-Seidel'
        }
      ]
    },
    {
      number: 3,
      title: 'Interpolation & Calculus',
      color: '#818cf8',
      topics: [
        {
          title: 'Interpolation',
          path: '/section-3/interpolation',
          description: 'Lagrange, Newton Divided Differences, Splines'
        },
        {
          title: 'Differentiation & Integration',
          path: '/section-3/diff-integration',
          description: 'Difference formulas, Trapezoidal, Simpson\'s'
        }
      ]
    },
    {
      number: 4,
      title: 'ODEs & Eigenvalues',
      color: '#f59e0b',
      topics: [
        {
          title: 'ODEs',
          path: '/section-4/odes',
          description: 'Euler, Heun, Runge-Kutta (RK4)'
        },
        {
          title: 'Eigenvalues',
          path: '/section-4/eigenvalues',
          description: 'Power, Inverse Power, QR Algorithm'
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Practice Problems', path: '/practice', description: 'Test your understanding' },
    { title: 'Compare Methods', path: '/compare', description: 'Side-by-side analysis' }
  ];
</script>

<div class="max-w-5xl mx-auto px-6 py-10 min-h-screen flex flex-col justify-center">
  <div class="text-center mb-8">
    <h1 class="text-3xl md:text-4xl font-bold text-accent font-mono mb-2">Interactive Numerical Analysis</h1>
    <p class="text-muted text-sm">Interactive visualizations and step-by-step solvers for numerical methods.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    {#each sections as section}
      <Card class="p-5 hover:border-accent/50 transition-all duration-200">
        <div class="flex items-center gap-2 mb-3">
          <div
            class="w-2.5 h-2.5 rounded-full"
            style="background-color: {section.color};"
          ></div>
          <h2 class="text-base font-semibold text-primary">
            Section {section.number}: {section.title}
          </h2>
        </div>

        <div class="space-y-2">
          {#each section.topics as topic}
            <a
              href={topic.path}
              class="block hover:text-accent transition-colors duration-150"
            >
              <div class="text-sm font-medium text-primary">{topic.title}</div>
              <div class="text-xs text-muted">{topic.description}</div>
            </a>
          {/each}
        </div>
      </Card>
    {/each}
  </div>

  <div class="flex justify-center gap-3">
    {#each quickLinks as link}
      <a
        href={link.path}
        class="px-4 py-2 text-sm font-medium text-muted border border-border hover:text-accent hover:border-accent transition-colors duration-150"
      >
        {link.title}
      </a>
    {/each}
  </div>
</div>
