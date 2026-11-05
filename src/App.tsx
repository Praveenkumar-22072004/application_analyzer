import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Code,
  Layout,
  GitBranch,
  CheckSquare,
  Loader2,
  AlertCircle,
  FileText,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Download,
  Trash2,
  Search,
  ArrowRight,
  ShieldCheck,
  Layers,
  Activity,
  User,
  CreditCard,
  ShoppingCart,
  Settings,
  Bell,
  Sun,
  Moon,
  Search as SearchIcon,
} from 'lucide-react';
import { performAnalysis, AnalysisResult, FeatureItem, ScreenItem, TestCaseItem } from './analyzer';
import './App.css';

const SAMPLE_TEMPLATES = [
  {
    label: 'B2B SaaS Analytics',
    text: `Enterprise cloud operations and analytics platform:
- Multi-tenant organization workspace with Role-Based Access Control (Admin, Member, Auditor).
- Real-time telemetry dashboard featuring API usage, latency metrics, and error rates.
- Automated billing engine integrated with Stripe for seat-based recurring subscription invoices.
- Webhook notification system dispatching alerts to Slack, Discord, and PagerDuty.
- Data export service supporting asynchronous CSV, JSON, and PDF report downloads.`,
  },
  {
    label: 'Fintech Mobile Wallet',
    text: `Personal finance and cross-border digital wallet mobile app:
- Biometric authentication (FaceID / Fingerprint) and PIN passcode fallback.
- Multi-currency account balance overview with live currency conversion calculator.
- Peer-to-peer instant money transfer via phone number, QR code, or username.
- Transaction history with category expense breakdown, date filters, and PDF receipt downloads.
- Push notification alert system for real-time deposit confirmations and fraud alerts.`,
  },
  {
    label: 'E-Commerce Marketplace',
    text: `Online retail marketplace platform:
- User authentication supporting email login, Google OAuth SSO, and guest checkout.
- Dynamic catalog discovery with faceted category filtering, keyword search, and price sliders.
- Cart and checkout flow supporting coupon codes, shipping address validation, and Stripe cards.
- Customer order tracking with real-time delivery milestone status updates.
- User profile dashboard managing order history, saved wishlist items, and payment methods.`,
  },
  {
    label: 'Healthcare Telemedicine',
    text: `Digital patient care and appointment consultation platform:
- Patient portal with secure health records, allergies list, and insurance card upload.
- Doctor scheduling engine allowing video consultation bookings with calendar sync.
- Digital prescription generator with automated pharmacy dispatch and dosage instructions.
- Encrypted patient-to-physician direct messaging with file attachment support.
- HIPAA-compliant audit logging and administrative credential management.`,
  },
];

type ActiveViewTab = 'workspace' | 'features' | 'wireframes' | 'logic' | 'tests' | 'export';
type DeviceMode = 'mobile' | 'desktop';

export function App() {
  const [input, setInput] = useState<string>(SAMPLE_TEMPLATES[0].text);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveViewTab>('workspace');
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testStatusMap, setTestStatusMap] = useState<Record<string, boolean>>({});
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('app-theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('app-theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Interactive mock states for wireframe preview
  const [mockEmail, setMockEmail] = useState('alex.chen@workspace.dev');
  const [mockCartCount, setMockCartCount] = useState(2);
  const [mockToggleState, setMockToggleState] = useState(true);

  // Compute text statistics
  const stats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input.trim() ? input.split('\n').length : 0;
    return { chars, words, lines };
  }, [input]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      let data: AnalysisResult;
      try {
        const response = await axios.post<AnalysisResult>('/api/analyze', {
          requirements_text: input,
        });
        // Merge enriched items if missing from older backend
        const fallback = performAnalysis(input);
        data = {
          ...response.data,
          enrichedFeatures: response.data.enrichedFeatures || fallback.enrichedFeatures,
          enrichedScreens: response.data.enrichedScreens || fallback.enrichedScreens,
          enrichedTestCases: response.data.enrichedTestCases || fallback.enrichedTestCases,
        };
      } catch {
        // High fidelity client-side fallback
        data = performAnalysis(input);
      }

      setResult(data);
      const firstScreenId = data.enrichedScreens?.[0]?.id || data.ui_screens?.[0] || '';
      setSelectedScreenId(firstScreenId);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          'Failed to analyze requirements. Please verify your input or check the server status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInput(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const md = generateMarkdownSpec(result);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `specification-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMarkdownSpec = (r: AnalysisResult): string => {
    return `# System Requirement Specification\n\n` +
      `**Generated:** ${new Date().toISOString()}\n` +
      `**Features Identified:** ${r.features.length}\n` +
      `**UI Screens:** ${r.ui_screens.length}\n` +
      `**Test Cases:** ${r.test_cases.length}\n\n` +
      `## 1. Feature Breakdown\n\n` +
      (r.enrichedFeatures
        ? r.enrichedFeatures.map(f => `### ${f.name} (${f.priority} Priority)\n- **Category:** ${f.category}\n- **Description:** ${f.description}\n`).join('\n')
        : r.features.map(f => `- ${f}`).join('\n')) +
      `\n\n## 2. Business Logic & System Architecture\n\n${r.business_logic}\n\n` +
      `## 3. UI Navigation Journey\n\n${r.ui_flow}\n\n` +
      `## 4. Acceptance Test Suite\n\n` +
      (r.enrichedTestCases
        ? r.enrichedTestCases.map(t => `- **${t.id} [${t.type}]** ${t.scenario} -> ${t.expectedResult}`).join('\n')
        : r.test_cases.map(t => `- ${typeof t === 'string' ? t : JSON.stringify(t)}`).join('\n'));
  };

  // Filtered features
  const filteredFeatures = useMemo(() => {
    if (!result) return [];
    const list = result.enrichedFeatures || result.features.map((f, i) => ({
      id: `FEAT-${i + 1}`,
      name: f,
      category: 'General',
      description: 'Extracted system feature.',
      priority: 'High' as const,
    }));

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
    );
  }, [result, searchQuery]);

  // Current selected screen
  const currentScreen = useMemo(() => {
    if (!result) return null;
    if (result.enrichedScreens && result.enrichedScreens.length > 0) {
      return (
        result.enrichedScreens.find(s => s.id === selectedScreenId || s.name === selectedScreenId) ||
        result.enrichedScreens[0]
      );
    }
    const name = selectedScreenId || result.ui_screens[0] || 'Default Screen';
    return {
      id: name,
      name,
      route: '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      layoutType: 'dashboard' as const,
      description: 'Screen wireframe representation.',
      elements: ['Header', 'Main Content', 'Action Items'],
    };
  }, [result, selectedScreenId]);

  // Render Wireframe Screen Contents
  const renderInteractiveScreen = (screen: ScreenItem | null) => {
    if (!screen) {
      return <div className="empty-state-card">Select a screen from the list to preview wireframe.</div>;
    }

    const type = screen.layoutType || 'dashboard';

    if (type === 'auth') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="wf-header">
            <div>
              <div className="wf-title">{screen.name}</div>
              <div className="wf-subtitle">Access your account</div>
            </div>
            <ShieldCheck size={18} color="var(--accent-cyan)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Work Email</span>
              <input
                className="wf-input-box"
                style={{ width: '100%', marginTop: 4 }}
                value={mockEmail}
                onChange={e => setMockEmail(e.target.value)}
              />
            </div>

            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Password</span>
              <div className="wf-input-box" style={{ marginTop: 4 }}>
                <span>••••••••••••</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Show</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={mockToggleState}
                  onChange={e => setMockToggleState(e.target.checked)}
                />
                Remember 30 days
              </label>
              <span style={{ color: 'var(--accent-cyan)' }}>Forgot?</span>
            </div>

            <button className="wf-primary-btn" style={{ marginTop: 6 }}>
              Continue with Email
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0' }}>
              — or continue with SSO —
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="wf-card-item" style={{ justifyContent: 'center', fontSize: '0.76rem', cursor: 'pointer' }}>
                Google Workspace
              </div>
              <div className="wf-card-item" style={{ justifyContent: 'center', fontSize: '0.76rem', cursor: 'pointer' }}>
                Okta / SAML
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'catalog') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="wf-header">
            <div>
              <div className="wf-title">{screen.name}</div>
              <div className="wf-subtitle">Explore catalog & records</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
              <ShoppingCart size={16} />
              <span className="font-mono tabular-nums">{mockCartCount}</span>
            </div>
          </div>

          <div className="wf-input-box" style={{ padding: '8px 10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SearchIcon size={14} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>Search items, tags…</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Filter</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="wf-card-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: '100%', height: 64, borderRadius: 6, background: 'rgba(56, 189, 248, 0.08)', display: 'grid', placeItems: 'center' }}>
                  <Layers size={18} color="var(--accent-cyan)" />
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Item Unit #{idx}04</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span className="font-mono tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      ${(idx * 49.5).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setMockCartCount(c => c + 1)}
                      style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'checkout') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="wf-header">
            <div>
              <div className="wf-title">{screen.name}</div>
              <div className="wf-subtitle">Order summary & checkout</div>
            </div>
            <CreditCard size={18} color="var(--accent-cyan)" />
          </div>

          <div className="wf-card-item">
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Standard Service Subscription</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quantity: 1 × Annual Plan</div>
            </div>
            <span className="font-mono tabular-nums" style={{ fontWeight: 700 }}>$149.00</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '0 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">$149.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Taxes & Processing</span>
              <span className="font-mono tabular-nums">$12.40</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
              <span>Total Due</span>
              <span className="font-mono tabular-nums" style={{ color: 'var(--accent-emerald)' }}>$161.40</span>
            </div>
          </div>

          <div className="wf-input-box">
            <span>Card: 4242 •••• •••• 4242</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>12/28</span>
          </div>

          <button className="wf-primary-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff' }}>
            Pay $161.40 Securely
          </button>
        </div>
      );
    }

    if (type === 'profile') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="wf-header">
            <div>
              <div className="wf-title">{screen.name}</div>
              <div className="wf-subtitle">Account & preferences</div>
            </div>
            <Settings size={18} color="var(--accent-cyan)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)', display: 'grid', placeItems: 'center', color: '#04121b' }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Alex Chen</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Lead Systems Architect</div>
            </div>
          </div>

          <div className="wf-card-item">
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email Alerts & Notifications</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Receive audit events and security alerts</div>
            </div>
            <input
              type="checkbox"
              checked={mockToggleState}
              onChange={e => setMockToggleState(e.target.checked)}
              className="test-checkbox"
            />
          </div>

          <div className="wf-card-item">
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Multi-Factor Authentication (MFA)</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>Active (FIDO2 WebAuthn)</div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Manage</span>
          </div>

          <button className="wf-primary-btn">
            Save Changes
          </button>
        </div>
      );
    }

    // Default Dashboard view
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="wf-header">
          <div>
            <div className="wf-title">{screen.name}</div>
            <div className="wf-subtitle">Real-time status overview</div>
          </div>
          <Activity size={18} color="var(--accent-cyan)" />
        </div>

        <div className="wf-kpi-grid">
          <div className="wf-kpi-box">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Sessions</span>
            <span className="wf-kpi-num font-mono tabular-nums">2,840</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>+14.2% today</span>
          </div>
          <div className="wf-kpi-box">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>System Health</span>
            <span className="wf-kpi-num font-mono tabular-nums" style={{ color: 'var(--accent-emerald)' }}>99.98%</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal state</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.025)', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Operations Volume</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last 24h</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60, padding: '0 4px' }}>
            {[45, 60, 35, 75, 90, 65, 80, 95, 70, 85].map((val, i) => (
              <div
                key={i}
                className="wf-chart-bar"
                title={`Metric hour ${i + 1}: ${val}%`}
                style={{
                  height: `${val}%`,
                  background: i === 7 ? 'var(--accent-cyan)' : 'rgba(56, 189, 248, 0.25)',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recent Operations</span>
          {['Transaction #8491 confirmed', 'Member role updated: Alex C.', 'Daily backup completed'].map((item, i) => (
            <div key={i} className="wf-card-item" style={{ padding: '8px 10px', fontSize: '0.78rem' }}>
              <span>{item}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{i * 12 + 4}m ago</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      {/* 3-Zone Top Bar */}
      <header className="topbar">
        <div className="topbar-inner">
          {/* Zone 1: Brand Wordmark */}
          <div className="brand-zone">
            <div className="brand-glyph">
              <Sparkles size={16} />
            </div>
            <span className="brand-title">AI Application Analyzer</span>
            <span className="brand-separator">/</span>
            <span className="brand-tag">Requirements Studio</span>
          </div>

          {/* Zone 2: Navigation Links / View Tabs */}
          <nav className="nav-zone">
            <button
              className={`nav-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveTab('workspace')}
            >
              <Layout size={14} />
              <span>Workspace</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <Layers size={14} />
              <span>Specifications</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'wireframes' ? 'active' : ''}`}
              onClick={() => setActiveTab('wireframes')}
            >
              <Smartphone size={14} />
              <span>Wireframe Studio</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'logic' ? 'active' : ''}`}
              onClick={() => setActiveTab('logic')}
            >
              <Code size={14} />
              <span>Logic & Architecture</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
              onClick={() => setActiveTab('tests')}
            >
              <CheckSquare size={14} />
              <span>Test Matrix</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="action-zone">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'high-contrast light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'high-contrast light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} color="var(--accent-amber)" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} color="var(--accent-cyan)" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              className="btn-primary-action"
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
            >
              {loading ? <Loader2 size={16} className="loader" /> : <Sparkles size={16} />}
              <span>{loading ? 'Analyzing…' : 'Run Analysis'}</span>
              <span className="kbd-hint">⌘↵</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="workspace-page">
        <div className="workspace-grid">
          {/* Left Panel: Requirements Workbench */}
          <section className="workbench-panel">
            <div className="panel-header-bar">
              <div className="panel-heading">
                <FileText size={16} color="var(--accent-cyan)" />
                <span>Requirements Input</span>
              </div>
              <div className="panel-header-stats font-mono tabular-nums">
                {stats.words} words · {stats.chars} chars · {stats.lines} lines
              </div>
            </div>

            {/* Quick Templates Bar */}
            <div className="template-bar">
              <span className="template-label">Sample Templates</span>
              <div className="template-chips">
                {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    className="template-btn"
                    onClick={() => {
                      setInput(tmpl.text);
                    }}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Editor */}
            <div className="editor-wrapper">
              <textarea
                className="editor-textarea font-mono"
                placeholder="Paste or draft application requirements here (or load a file)…

Tip: List features, user stories, constraints, or technical specifications.
Press ⌘+Enter to trigger analysis."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <div className="editor-footer-bar">
                <div className="editor-actions-left">
                  <label className="editor-tool-btn">
                    <input
                      type="file"
                      className="file-input-hidden"
                      onChange={handleFileUpload}
                      accept=".txt,.md,.json,.csv"
                    />
                    <FileText size={13} />
                    <span>Load File</span>
                  </label>

                  <button
                    className="editor-tool-btn"
                    onClick={() => copyToClipboard(input, 'input')}
                    disabled={!input.trim()}
                  >
                    {copiedKey === 'input' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                    <span>{copiedKey === 'input' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    className="editor-tool-btn"
                    onClick={() => setInput('')}
                    disabled={!input.trim() || loading}
                  >
                    <Trash2 size={13} />
                    <span>Clear</span>
                  </button>
                </div>

                <button
                  className="editor-tool-btn"
                  onClick={handleAnalyze}
                  disabled={loading || !input.trim()}
                  style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', borderColor: 'rgba(56, 189, 248, 0.25)' }}
                >
                  <Sparkles size={13} />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Panel: Artifacts Canvas */}
          <section className="artifacts-panel">
            {/* Unboxed Metadata Stats Strip */}
            <div className="metrics-strip">
              <div className="metrics-summary-text">
                {result ? (
                  <>
                    <span>
                      <strong className="metric-value-highlight font-mono tabular-nums">{result.features.length}</strong> Features
                    </span>
                    <span className="metric-dot-sep">·</span>
                    <span>
                      <strong className="metric-value-highlight font-mono tabular-nums">{result.ui_screens.length}</strong> UI Screens
                    </span>
                    <span className="metric-dot-sep">·</span>
                    <span>
                      <strong className="metric-value-highlight font-mono tabular-nums">{result.test_cases.length}</strong> Test Cases
                    </span>
                    <span className="metric-dot-sep">·</span>
                    <span>Architecture Verified</span>
                  </>
                ) : (
                  <span>Ready for analysis · Ingest requirements to generate specifications</span>
                )}
              </div>

              {result && (
                <div className="filter-search-box">
                  <Search size={14} className="filter-search-icon" />
                  <input
                    type="text"
                    className="filter-search-input"
                    placeholder="Search specifications…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{ padding: '16px 20px 0' }}>
                <div className="error-banner-alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Body Content */}
            <div className="artifacts-content-body">
              {!result && !loading && (
                <div className="empty-state-card" style={{ minHeight: 400 }}>
                  <div className="empty-state-icon">
                    <Sparkles size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem' }}>No Analysis Generated Yet</h3>
                  <p style={{ maxWidth: 440, fontSize: '0.88rem', lineHeight: 1.6 }}>
                    Select one of the sample templates on the left or paste your own requirements, then click <strong>Run Analysis</strong> to convert requirements into structured features, wireframes, and test suites.
                  </p>
                  <button
                    className="btn-primary-action"
                    onClick={handleAnalyze}
                    style={{ marginTop: 8 }}
                  >
                    <Sparkles size={16} />
                    <span>Analyze Sample Template</span>
                  </button>
                </div>
              )}

              {loading && (
                <div className="empty-state-card" style={{ minHeight: 400 }}>
                  <Loader2 size={32} className="loader" color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: '1.05rem', marginTop: 12 }}>Deconstructing Requirements…</h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    Synthesizing features, navigation maps, business invariants, and QA acceptance tests.
                  </p>
                </div>
              )}

              {result && !loading && (
                <AnimatePresence mode="wait">
                  {/* TAB 1: Workspace Unified View */}
                  {activeTab === 'workspace' && (
                    <motion.div
                      key="tab-workspace"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                    >
                      {/* Section: Features Spotlight */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <h3 style={{ fontSize: '0.98rem' }}>01. Extracted Feature Specifications</h3>
                          <button
                            className="editor-tool-btn"
                            onClick={() => setActiveTab('features')}
                          >
                            <span>View All ({result.features.length})</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>

                        <div className="features-grid">
                          {filteredFeatures.slice(0, 4).map((f, idx) => (
                            <div key={idx} className="feature-card">
                              <div className="feature-card-header">
                                <span className="feature-card-title">{f.name}</span>
                                <span className={`feature-priority-tag priority-${f.priority.toLowerCase()}`}>
                                  {f.priority}
                                </span>
                              </div>
                              <span className="feature-card-category">{f.category}</span>
                              <p className="feature-card-desc">{f.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section: Wireframe Preview Spotlight */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <h3 style={{ fontSize: '0.98rem' }}>02. Interactive Screen Wireframes</h3>
                          <button
                            className="editor-tool-btn"
                            onClick={() => setActiveTab('wireframes')}
                          >
                            <span>Open Studio</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>

                        <div className="wireframe-studio">
                          <div className="screens-selector-sidebar">
                            {(result.enrichedScreens || []).map((s, idx) => (
                              <button
                                key={idx}
                                className={`screen-select-item ${currentScreen?.id === s.id ? 'active' : ''}`}
                                onClick={() => setSelectedScreenId(s.id)}
                              >
                                <span>{s.name}</span>
                                <span className="screen-select-route font-mono">{s.route}</span>
                              </button>
                            ))}
                          </div>

                          <div className="device-canvas-area">
                            <div className="iphone-frame">
                              <div className="iphone-notch" />
                              <div className="iphone-status-bar">
                                <span className="font-mono">9:41</span>
                                <span className="font-mono">5G · 100%</span>
                              </div>
                              <div className="iphone-screen">
                                {renderInteractiveScreen(currentScreen)}
                              </div>
                              <div className="iphone-home-bar" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section: Logic & Architecture Preview */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <h3 style={{ fontSize: '0.98rem' }}>03. Core Business Logic & Invariants</h3>
                          <button
                            className="editor-tool-btn"
                            onClick={() => setActiveTab('logic')}
                          >
                            <span>Inspect Architecture</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                        <div className="spec-prose-block font-mono">
                          {result.business_logic}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Full Features Catalog */}
                  {activeTab === 'features' && (
                    <motion.div
                      key="tab-features"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h2 style={{ fontSize: '1.15rem' }}>Feature Breakdown & Requirements Matrix</h2>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Categorized modules, validation expectations, and implementation priority.
                          </p>
                        </div>
                        <button
                          className="editor-tool-btn"
                          onClick={() => copyToClipboard(JSON.stringify(result.enrichedFeatures, null, 2), 'feat-json')}
                        >
                          <Copy size={13} />
                          <span>{copiedKey === 'feat-json' ? 'Copied JSON' : 'Export Features JSON'}</span>
                        </button>
                      </div>

                      <div className="features-grid">
                        {filteredFeatures.map((f, idx) => (
                          <div key={idx} className="feature-card">
                            <div className="feature-card-header">
                              <span className="feature-card-title">{f.name}</span>
                              <span className={`feature-priority-tag priority-${f.priority.toLowerCase()}`}>
                                {f.priority}
                              </span>
                            </div>
                            <span className="feature-card-category font-mono">{f.category}</span>
                            <p className="feature-card-desc">{f.description}</p>
                            <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                className="editor-tool-btn"
                                onClick={() => copyToClipboard(`### ${f.name}\n- Category: ${f.category}\n- Priority: ${f.priority}\n- Spec: ${f.description}`, `f-${idx}`)}
                              >
                                {copiedKey === `f-${idx}` ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                                <span>{copiedKey === `f-${idx}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Wireframe Studio */}
                  {activeTab === 'wireframes' && (
                    <motion.div
                      key="tab-wireframes"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <h2 style={{ fontSize: '1.15rem' }}>UI Blueprint & Interactive Wireframe Simulator</h2>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Living wireframe prototypes generated for each key viewport in the application.
                          </p>
                        </div>

                        {/* Viewport Form Factor Toggle */}
                        <div className="device-viewport-controls">
                          <button
                            className={`viewport-toggle-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
                            onClick={() => setDeviceMode('mobile')}
                          >
                            <Smartphone size={14} />
                            <span>Mobile (iPhone 16)</span>
                          </button>
                          <button
                            className={`viewport-toggle-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
                            onClick={() => setDeviceMode('desktop')}
                          >
                            <Monitor size={14} />
                            <span>Desktop Web</span>
                          </button>
                        </div>
                      </div>

                      <div className="wireframe-studio">
                        <div className="screens-selector-sidebar">
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                            Screen Blueprints
                          </div>
                          {(result.enrichedScreens || []).map((s, idx) => (
                            <button
                              key={idx}
                              className={`screen-select-item ${currentScreen?.id === s.id ? 'active' : ''}`}
                              onClick={() => setSelectedScreenId(s.id)}
                            >
                              <span>{s.name}</span>
                              <span className="screen-select-route font-mono">{s.route}</span>
                            </button>
                          ))}
                        </div>

                        <div className="device-canvas-area">
                          {deviceMode === 'mobile' ? (
                            <div className="iphone-frame">
                              <div className="iphone-notch" />
                              <div className="iphone-status-bar">
                                <span className="font-mono">9:41</span>
                                <span className="font-mono">5G · 100%</span>
                              </div>
                              <div className="iphone-screen">
                                {renderInteractiveScreen(currentScreen)}
                              </div>
                              <div className="iphone-home-bar" />
                            </div>
                          ) : (
                            <div className="desktop-frame">
                              <div className="desktop-browser-header">
                                <div className="window-dots">
                                  <div className="window-dot dot-red" />
                                  <div className="window-dot dot-yellow" />
                                  <div className="window-dot dot-green" />
                                </div>
                                <div className="browser-url-bar font-mono">
                                  https://app.workspace.local{currentScreen?.route || '/'}
                                </div>
                              </div>
                              <div className="desktop-screen-body">
                                {renderInteractiveScreen(currentScreen)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: Logic & UI Flow */}
                  {activeTab === 'logic' && (
                    <motion.div
                      key="tab-logic"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                    >
                      <div>
                        <h2 style={{ fontSize: '1.15rem' }}>Backend Architecture & State Machine Logic</h2>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          Transactional workflow, invariants, data mutations, and asynchronous dispatch pipelines.
                        </p>
                        <div className="spec-prose-block font-mono" style={{ marginTop: 12 }}>
                          {result.business_logic}
                        </div>
                      </div>

                      <div>
                        <h2 style={{ fontSize: '1.15rem' }}>User Navigation Journey & Screen Routing</h2>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          Step-by-step route transitions, session verification gates, and confirmation modals.
                        </p>
                        <div className="spec-prose-block font-mono" style={{ marginTop: 12 }}>
                          {result.ui_flow}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 5: QA Test Matrix */}
                  {activeTab === 'tests' && (
                    <motion.div
                      key="tab-tests"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h2 style={{ fontSize: '1.15rem' }}>QA Acceptance Test Matrix</h2>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Verification criteria across functional correctness, security policies, and performance targets.
                          </p>
                        </div>

                        <button
                          className="editor-tool-btn"
                          onClick={() => {
                            const lines = (result.enrichedTestCases || []).map(
                              t => `- [${testStatusMap[t.id] ? 'x' : ' '}] **${t.id} [${t.type}]** ${t.scenario} -> Expected: ${t.expectedResult}`
                            ).join('\n');
                            copyToClipboard(lines, 'tests-md');
                          }}
                        >
                          <Copy size={13} />
                          <span>{copiedKey === 'tests-md' ? 'Copied Test Plan' : 'Copy Test Plan (MD)'}</span>
                        </button>
                      </div>

                      <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 10, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                        <table className="test-table">
                          <thead>
                            <tr>
                              <th style={{ width: 44 }}>Check</th>
                              <th style={{ width: 80 }}>ID</th>
                              <th style={{ width: 110 }}>Type</th>
                              <th>Scenario & Invariant</th>
                              <th>Expected Outcome</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(result.enrichedTestCases || []).map((t, idx) => (
                              <tr key={idx}>
                                <td>
                                  <input
                                    type="checkbox"
                                    className="test-checkbox"
                                    checked={!!testStatusMap[t.id]}
                                    onChange={e => {
                                      setTestStatusMap(prev => ({
                                        ...prev,
                                        [t.id]: e.target.checked,
                                      }));
                                    }}
                                  />
                                </td>
                                <td className="font-mono tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                  {t.id}
                                </td>
                                <td>
                                  <span className={`feature-priority-tag priority-${t.type === 'Security' ? 'high' : t.type === 'Performance' ? 'medium' : 'low'}`}>
                                    {t.type}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {t.scenario}
                                </td>
                                <td style={{ fontSize: '0.82rem' }}>
                                  {t.expectedResult}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 6: Export Hub */}
                  {activeTab === 'export' && (
                    <motion.div
                      key="tab-export"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h2 style={{ fontSize: '1.15rem' }}>Specification Export & Hand-off</h2>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Download complete product specification markdown or copy to engineering clipboard.
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn-primary-action"
                            onClick={() => copyToClipboard(generateMarkdownSpec(result), 'spec-md')}
                          >
                            <Copy size={14} />
                            <span>{copiedKey === 'spec-md' ? 'Copied' : 'Copy Markdown'}</span>
                          </button>
                          <button
                            className="editor-tool-btn"
                            onClick={downloadMarkdown}
                            style={{ height: 38, padding: '0 14px' }}
                          >
                            <Download size={14} />
                            <span>Download .md</span>
                          </button>
                        </div>
                      </div>

                      <div className="spec-prose-block font-mono" style={{ maxHeight: 520, overflowY: 'auto' }}>
                        {generateMarkdownSpec(result)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
