export interface FeatureItem {
  id: string;
  name: string;
  category: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ScreenItem {
  id: string;
  name: string;
  route: string;
  layoutType: 'auth' | 'dashboard' | 'catalog' | 'checkout' | 'profile' | 'detail';
  description: string;
  elements: string[];
}

export interface TestCaseItem {
  id: string;
  feature: string;
  scenario: string;
  expectedResult: string;
  type: 'Functional' | 'Security' | 'Performance' | 'Edge Case';
}

export interface AnalysisResult {
  requirements_text: string;
  features: string[];
  business_logic: string;
  ui_flow: string;
  ui_screens: string[];
  test_cases: string[];
  enrichedFeatures?: FeatureItem[];
  enrichedScreens?: ScreenItem[];
  enrichedTestCases?: TestCaseItem[];
}

export function performAnalysis(text: string): AnalysisResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const words = text.toLowerCase();

  const features: string[] = [];
  const screens: string[] = [];
  const enrichedFeatures: FeatureItem[] = [];
  const enrichedScreens: ScreenItem[] = [];

  // Identify domain concepts
  if (words.includes('auth') || words.includes('login') || words.includes('sign in') || words.includes('signup') || words.includes('user') || words.includes('register')) {
    const name = 'User Authentication & Role-Based Access Control';
    features.push(name);
    enrichedFeatures.push({
      id: 'FEAT-AUTH',
      name,
      category: 'Security & Access',
      description: 'Multi-factor authentication, session token refresh, and role-based permissions management.',
      priority: 'High',
    });
    screens.push('Login & Registration Screen');
    enrichedScreens.push({
      id: 'SCR-AUTH',
      name: 'Login & Registration Screen',
      route: '/login',
      layoutType: 'auth',
      description: 'Secure sign-in form with email/password validation, OAuth providers, and password recovery.',
      elements: ['Email Input', 'Password Input', 'OAuth SSO Buttons', 'Forgot Password Link', 'Submit Action'],
    });
  }

  if (words.includes('dash') || words.includes('home') || words.includes('metric') || words.includes('analytics') || words.includes('chart') || words.includes('overview') || words.includes('feed')) {
    const name = 'Real-Time Analytics & Operational Dashboard';
    features.push(name);
    enrichedFeatures.push({
      id: 'FEAT-DASH',
      name,
      category: 'Analytics & Insights',
      description: 'KPI metric cards, interactive time-series telemetry charts, and recent activity audit streams.',
      priority: 'High',
    });
    screens.push('Main Dashboard');
    enrichedScreens.push({
      id: 'SCR-DASH',
      name: 'Main Dashboard',
      route: '/dashboard',
      layoutType: 'dashboard',
      description: 'Central operations hub displaying live KPI metrics, charts, and system status widgets.',
      elements: ['Metric Counters', 'Trend Charts', 'Filter Bar', 'Activity Feed', 'Quick Action Toolbar'],
    });
  }

  if (words.includes('search') || words.includes('filter') || words.includes('catalog') || words.includes('product') || words.includes('item') || words.includes('explore') || words.includes('browse')) {
    const name = 'Dynamic Search, Faceted Filtering & Discovery Engine';
    features.push(name);
    enrichedFeatures.push({
      id: 'FEAT-SRCH',
      name,
      category: 'Discovery & Catalog',
      description: 'Instant full-text search with debounce, multi-attribute faceted filters, and sorting controls.',
      priority: 'Medium',
    });
    screens.push('Product & Catalog Screen');
    enrichedScreens.push({
      id: 'SCR-CAT',
      name: 'Product & Catalog Screen',
      route: '/catalog',
      layoutType: 'catalog',
      description: 'Searchable grid view with faceted sidebar, sort dropdowns, and responsive item cards.',
      elements: ['Search Bar', 'Category Facets', 'Sort Dropdown', 'Result Cards Grid', 'Pagination Control'],
    });
  }

  if (words.includes('cart') || words.includes('order') || words.includes('pay') || words.includes('checkout') || words.includes('billing') || words.includes('stripe')) {
    const name = 'Secure Payment Processing & Order Management';
    features.push(name);
    enrichedFeatures.push({
      id: 'FEAT-PAY',
      name,
      category: 'Commerce & Billing',
      description: 'Encrypted payment gateway integration, invoice generation, and real-time transaction state.',
      priority: 'High',
    });
    screens.push('Checkout & Payment Screen');
    enrichedScreens.push({
      id: 'SCR-PAY',
      name: 'Checkout & Payment Screen',
      route: '/checkout',
      layoutType: 'checkout',
      description: 'Step-by-step transaction checkout with line items, address validation, and payment tokenization.',
      elements: ['Cart Summary', 'Payment Method Selector', 'Card Element', 'Order Review', 'Pay Now CTA'],
    });
  }

  if (words.includes('profile') || words.includes('setting') || words.includes('account') || words.includes('preference')) {
    const name = 'User Profile Management & Account Preferences';
    features.push(name);
    enrichedFeatures.push({
      id: 'FEAT-PROF',
      name,
      category: 'User Administration',
      description: 'Personal data configuration, notification channels, security keys, and UI theme preferences.',
      priority: 'Low',
    });
    screens.push('Account & Settings Screen');
    enrichedScreens.push({
      id: 'SCR-SETT',
      name: 'Account & Settings Screen',
      route: '/settings',
      layoutType: 'profile',
      description: 'Personal preference controls, profile avatar upload, security credentials, and active sessions.',
      elements: ['Avatar Badge', 'Profile Fields', 'Toggle Switches', 'Security Keys Table', 'Save Button'],
    });
  }

  if (words.includes('notification') || words.includes('alert') || words.includes('email') || words.includes('message')) {
    const name = 'Automated Notifications & Alert System';
    features.push(name);
    enrichedFeatures.push({
      id: 'FEAT-NOTIF',
      name,
      category: 'Communications',
      description: 'In-app toast banners, webhook triggers, and asynchronous email notification dispatch.',
      priority: 'Medium',
    });
    screens.push('Notification Center Screen');
    enrichedScreens.push({
      id: 'SCR-NOTIF',
      name: 'Notification Center Screen',
      route: '/notifications',
      layoutType: 'detail',
      description: 'Chronological timeline of system events, team mentions, and action reminders.',
      elements: ['Tab Selector', 'Mark All Read Button', 'Notification Rows', 'Timestamp Badges'],
    });
  }

  if (words.includes('export') || words.includes('report') || words.includes('download') || words.includes('csv') || words.includes('pdf')) {
    const name = 'Automated Reporting & Data Export Engine';
    features.push(name);
    enrichedFeatures.push({
      id: 'FEAT-EXPRT',
      name,
      category: 'Data Operations',
      description: 'Batch export generation for CSV/JSON/PDF formats with background job queue processing.',
      priority: 'Medium',
    });
    screens.push('Reports & Exports Screen');
    enrichedScreens.push({
      id: 'SCR-RPT',
      name: 'Reports & Exports Screen',
      route: '/reports',
      layoutType: 'detail',
      description: 'Report configuration parameters, date range picker, format selector, and download history.',
      elements: ['Date Range Picker', 'Format Radio Group', 'Generate Report Button', 'Recent Exports List'],
    });
  }

  // Parse lines starting with bullet points
  let customCount = 1;
  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
      const clean = line.replace(/^[-*]|\d+\.\s*/, '').trim();
      if (clean.length > 3 && clean.length < 80 && !features.includes(clean)) {
        features.push(clean);
        enrichedFeatures.push({
          id: `FEAT-REQ-${customCount++}`,
          name: clean,
          category: 'Core Requirements',
          description: `Extracted requirement: "${clean}". Implements dedicated domain business logic and validation.`,
          priority: 'High',
        });
      }
    }
  }

  // Ensure minimum comprehensive features
  if (features.length < 3) {
    const defaults = [
      { name: 'Core Application Interface', cat: 'User Interface', prio: 'High' as const },
      { name: 'Entity Data Lifecycle Management', cat: 'Data Architecture', prio: 'High' as const },
      { name: 'Audit Logging & System Telemetry', cat: 'Observability', prio: 'Medium' as const },
      { name: 'Configurable System Preferences', cat: 'Configuration', prio: 'Low' as const },
    ];
    for (const d of defaults) {
      if (!features.includes(d.name)) {
        features.push(d.name);
        enrichedFeatures.push({
          id: `FEAT-DEF-${features.length}`,
          name: d.name,
          category: d.cat,
          description: `Standard domain operational mechanism for ${d.name.toLowerCase()}.`,
          priority: d.prio,
        });
      }
    }
  }

  // Ensure minimum screens
  if (screens.length < 2) {
    screens.push('Home Workspace Screen', 'Entity Management Screen', 'System Configuration Screen');
    enrichedScreens.push(
      {
        id: 'SCR-HOME',
        name: 'Home Workspace Screen',
        route: '/workspace',
        layoutType: 'dashboard',
        description: 'Primary landing view containing operational summary widgets and quick access links.',
        elements: ['Summary Strip', 'Task Board', 'Action Buttons'],
      },
      {
        id: 'SCR-ENT',
        name: 'Entity Management Screen',
        route: '/entities',
        layoutType: 'catalog',
        description: 'Comprehensive table listing active records with search, filter, and batch actions.',
        elements: ['Data Table', 'Action Menu', 'Pagination'],
      }
    );
  }

  const primaryFeature = features[0] || 'Core Workflow';
  const secondaryFeature = features[1] || 'Data Processing';

  const businessLogic = `1. Ingestion & Pre-flight Validation:
- Receives inbound user payloads and runs schema validation against domain contracts.
- Verifies authentication tokens, CSRF tokens, and role-based authorization scopes before executing mutations.

2. Core Domain Workflow:
- Executes transactional workflow for [${primaryFeature}].
- Enforces consistency guarantees, state transitions, and idempotency keys to avoid duplicate processing.
- Coordinates secondary operations with [${secondaryFeature}], ensuring ACID guarantees across database writes.

3. Asynchronous Dispatch & Side Effects:
- Emits domain events to downstream message brokers upon successful state commit.
- Dispatches event-driven notifications, audit trail entries, and metric counters for observability.
- Implements optimistic concurrency handling with automated retry backoffs on transient contention.`;

  const uiFlow = `1. Initial Landing & Session Routing:
- User lands on ${screens[0] || 'Home Dashboard'}; authenticated sessions route directly into the active workspace while unauthenticated sessions display auth prompts.

2. Primary Interaction Cycle:
- Navigation header allows seamless routing between ${screens.slice(0, 3).join(', ')}.
- Selecting an entity loads contextual metadata, action triggers, and live status badges.

3. Action Execution & Feedback:
- Primary actions open focused modal drawers with inline validation and confirmation steps.
- Mutation dispatch displays subtle loading states, followed by transient toast notifications and automated reactive view invalidation.`;

  const enrichedTestCases: TestCaseItem[] = [
    {
      id: 'TC-01',
      feature: primaryFeature,
      scenario: 'Submit valid input payload to primary mutation handler',
      expectedResult: 'Record persists to store, status HTTP 200/201 returned, optimistic cache refreshed',
      type: 'Functional',
    },
    {
      id: 'TC-02',
      feature: primaryFeature,
      scenario: 'Submit payload with missing required fields or invalid types',
      expectedResult: 'Request rejected with status HTTP 422/400 and field-level validation errors returned',
      type: 'Edge Case',
    },
    {
      id: 'TC-03',
      feature: secondaryFeature,
      scenario: 'Concurrent simultaneous updates to the same shared entity',
      expectedResult: 'Optimistic locking prevents dirty writes; second mutation returns conflict 409 or retries',
      type: 'Functional',
    },
    {
      id: 'TC-04',
      feature: 'Navigation & Routing',
      scenario: `User transitions between ${screens.slice(0, 2).join(' and ')}`,
      expectedResult: 'Route updates without full page refresh; scroll position and draft state are preserved',
      type: 'Functional',
    },
    {
      id: 'TC-05',
      feature: 'Security & Access Control',
      scenario: 'Unauthenticated or unauthorized user requests protected API or screen route',
      expectedResult: 'Access intercepted, redirects to login with returnUrl parameter, returns HTTP 401/403',
      type: 'Security',
    },
    {
      id: 'TC-06',
      feature: 'System Performance',
      scenario: 'Initial viewport load with cold cache under simulated 3G connection',
      expectedResult: 'First Contentful Paint < 800ms, Largest Contentful Paint < 1.4s, Cumulative Layout Shift < 0.05',
      type: 'Performance',
    },
  ];

  const testCases: string[] = enrichedTestCases.map(
    t => `${t.id} [${t.feature}]: ${t.scenario} -> ${t.expectedResult}`
  );

  return {
    requirements_text: text,
    features,
    business_logic: businessLogic,
    ui_flow: uiFlow,
    ui_screens: screens,
    test_cases: testCases,
    enrichedFeatures,
    enrichedScreens,
    enrichedTestCases,
  };
}
