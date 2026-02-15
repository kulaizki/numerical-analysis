<svelte:head>
  <title>numerilab</title>
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

<div class="container mx-auto px-4 py-12 max-w-6xl">
  <!-- Header -->
  <div class="text-center mb-12">
    <h1 class="text-5xl md:text-6xl font-bold text-accent font-mono mb-4">numerilab</h1>
    <p class="text-xl text-muted mb-6">Interactive Numerical Analysis</p>
    <p class="text-muted max-w-2xl mx-auto leading-relaxed">
      Explore computational methods for solving mathematical problems.
      Interactive visualizations, step-by-step explanations, and hands-on practice
      for numerical techniques in scientific computing.
    </p>
  </div>

  <!-- Sections Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
    {#each sections as section}
      <Card class="p-6 hover:border-accent transition-all duration-200">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-3 h-3 rounded-full"
            style="background-color: {section.color};"
          ></div>
          <h2 class="text-xl font-semibold text-primary">
            Section {section.number}: {section.title}
          </h2>
        </div>

        <ul class="space-y-3">
          {#each section.topics as topic}
            <li>
              <a
                href={topic.path}
                class="block hover:text-accent transition-colors duration-150"
              >
                <div class="text-sm font-medium text-primary">{topic.title}</div>
                <div class="text-xs text-muted mt-1">{topic.description}</div>
              </a>
            </li>
          {/each}
        </ul>
      </Card>
    {/each}
  </div>

  <!-- Quick Links -->
  <div class="border-t border-border pt-8">
    <h3 class="text-lg font-semibold text-primary mb-4 text-center">Quick Access</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {#each quickLinks as link}
        <a href={link.path}>
          <Card class="p-4 hover:border-accent transition-all duration-200 text-center">
            <h4 class="font-semibold text-primary mb-1">{link.title}</h4>
            <p class="text-sm text-muted">{link.description}</p>
          </Card>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(body) {
    min-height: 100vh;
  }
</style>
