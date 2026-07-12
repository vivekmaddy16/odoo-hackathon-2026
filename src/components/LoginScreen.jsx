import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import {
  AlertCircle, Lock, LogIn, Shield, Truck, Navigation,
  BarChart3, Eye, EyeOff, UserPlus, CheckCircle, Key, Zap
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Fleet Manager',     email: 'fleet@transitops.in',      password: 'Fleet@123',    icon: Truck,     color: '#3b82f6' },
  { role: 'Dispatcher',        email: 'dispatcher@transitops.in', password: 'Dispatch@123', icon: Navigation, color: '#10b981' },
  { role: 'Safety Officer',    email: 'safety@transitops.in',     password: 'Safety@123',   icon: Shield,    color: '#f59e0b' },
  { role: 'Financial Analyst', email: 'finance@transitops.in',    password: 'Finance@123',  icon: BarChart3,  color: '#6366f1' },
];

/* ── Reusable Demo Panel ── */
const DemoPanel = ({ demoLoading, handleDemoLogin }) => (
  <div style={{ marginTop: 24 }}>
    {/* Divider */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-dim)' }} />
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
        or try a demo
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-dim)' }} />
    </div>

    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
      <Zap size={14} style={{ color: '#818cf8' }} />
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.5px', fontFamily: 'var(--font-ui)' }}>
        No Registration Needed
      </span>
    </div>

    {/* 2×2 grid of role buttons */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
      {DEMO_ACCOUNTS.map((acc) => {
        const Icon = acc.icon;
        const isThisLoading = demoLoading === acc.role;
        return (
          <button
            key={acc.role}
            onClick={() => handleDemoLogin(acc)}
            disabled={!!demoLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 9,
              border: `1px solid ${acc.color}33`,
              background: `${acc.color}12`,
              color: acc.color,
              cursor: demoLoading ? 'wait' : 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.18s ease',
              opacity: demoLoading && !isThisLoading ? 0.4 : 1,
              textAlign: 'left',
              width: '100%',
            }}
            onMouseEnter={(e) => { if (!demoLoading) { e.currentTarget.style.background = `${acc.color}24`; e.currentTarget.style.borderColor = `${acc.color}66`; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${acc.color}12`; e.currentTarget.style.borderColor = `${acc.color}33`; }}
          >
            {isThisLoading ? (
              <span style={{ width: 14, height: 14, border: `2px solid ${acc.color}44`, borderTop: `2px solid ${acc.color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0, display: 'inline-block' }} />
            ) : (
              <Icon size={14} style={{ flexShrink: 0 }} />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.role}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const ROLES = [
  {
    id: 'Fleet Manager',
    icon: Truck,
    color: '#3b82f6',
    desc: 'Manages fleet registry, maintenance, and system configuration.',
  },
  {
    id: 'Dispatcher',
    icon: Navigation,
    color: '#10b981',
    desc: 'Dispatches active shipments, plans routes, and updates trip status.',
  },
  {
    id: 'Safety Officer',
    icon: Shield,
    color: '#f59e0b',
    desc: 'Oversees driver profiles, safety logs, and licence validation.',
  },
  {
    id: 'Financial Analyst',
    icon: BarChart3,
    color: '#6366f1',
    desc: 'Tracks fuel logs, transaction ledgers, and operational costs.',
  },
];

const LoginScreen = () => {
  const { login, register } = useContext(AppContext);

  const [authMode, setAuthMode]       = useState('signin');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [name, setName]               = useState('');
  const [role, setRole]               = useState('Dispatcher');
  const [roleKey, setRoleKey]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [loading, setLoading]         = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedTime, setLockedTime]   = useState(0);

  useEffect(() => {
    let interval = null;
    if (lockedTime > 0) {
      interval = setInterval(() => setLockedTime(prev => prev - 1), 1000);
    } else if (lockedTime === 0 && failedAttempts >= 5) {
      setFailedAttempts(0);
    }
    return () => clearInterval(interval);
  }, [lockedTime, failedAttempts]);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMsg('');
  };

  const handleDemoLogin = async (account) => {
    setDemoLoading(account.role);
    setError('');
    const result = await login(account.email, account.password);
    if (!result.success) {
      setError('Demo login failed. Please ensure the backend server is running.');
    }
    setDemoLoading(null);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (lockedTime > 0) return;
    if (!email || !password) { setError('Please enter both email and password.'); return; }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      setError('');
      setFailedAttempts(0);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockedTime(15);
        setError('Account locked after 5 failed attempts. Please wait 15 seconds.');
      } else if (result.reason === 'incorrect_password') {
        setError(`Incorrect password. Attempt ${newAttempts} of 5.`);
      } else {
        setError(`No account found for this email. (Attempt ${newAttempts}/5)`);
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role || !roleKey) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role, roleKey);
      setError('');
      setSuccessMsg('Account created! Signing you in...');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        {/* Logo */}
        <div className="login-logo-container">
          <div className="login-logo-icon">T</div>
          <div>
            <div className="login-logo-name">TransitOps</div>
            <div className="login-logo-tagline">Fleet Operations Platform</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="login-illustration-text">
          <h2 className="login-illustration-title">
            Intelligent <span>Fleet Control</span>
            <br />at Your Fingertips
          </h2>
          <p className="login-illustration-desc">
            A unified platform for real-time fleet tracking, trip dispatch,
            maintenance scheduling, and financial reporting — secured by
            role-based access control.
          </p>

          {/* Role cards */}
          <div className="login-feature-list">
            {ROLES.map(({ id, icon: Icon, color, desc }) => (
              <div className="login-feature-item" key={id}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color,
                  }}
                >
                  <Icon size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {id}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-form-card">
          {authMode === 'signin' ? (
            <>
              <h1 className="login-form-title">Welcome back</h1>
              <p className="login-form-subtitle">Sign in to your TransitOps account</p>

              {error && (
                <div className="login-error">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}
              {lockedTime > 0 && (
                <div className="login-error" style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning)' }}>
                  <Lock size={14} />
                  <span>Locked — try again in {lockedTime}s</span>
                </div>
              )}

              <form onSubmit={handleSignIn}>
                <div className="login-input-group">
                  <label className="login-input-label" htmlFor="signin-email">Email Address</label>
                  <input
                    id="signin-email"
                    type="email"
                    className="login-input"
                    placeholder="you@transitops.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    disabled={lockedTime > 0}
                    autoComplete="email"
                  />
                </div>

                <div className="login-input-group">
                  <label className="login-input-label" htmlFor="signin-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      className="login-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      disabled={lockedTime > 0}
                      autoComplete="current-password"
                      style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)', background: 'none', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer', padding: 4,
                        display: 'flex', alignItems: 'center',
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  id="signin-submit"
                  type="submit"
                  className="login-submit-btn"
                  disabled={loading || lockedTime > 0}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Signing in...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <LogIn size={16} /> Sign In
                    </span>
                  )}
                </button>
              </form>

              <p className="login-toggle-text">
                Don't have an account?{' '}
                <button className="login-toggle-link" onClick={() => switchMode('signup')}>
                  Create one here
                </button>
              </p>

              {/* Demo panel */}
              <DemoPanel demoLoading={demoLoading} handleDemoLogin={handleDemoLogin} />
            </>
          ) : (
            <>
              <h1 className="login-form-title">Create account</h1>
              <p className="login-form-subtitle">Register a secure operational profile</p>

              {error && (
                <div className="login-error">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="login-success">
                  <CheckCircle size={15} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignUp}>
                <div className="login-input-group">
                  <label className="login-input-label" htmlFor="signup-name">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    className="login-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    required
                  />
                </div>

                <div className="login-input-group">
                  <label className="login-input-label" htmlFor="signup-email">Email Address</label>
                  <input
                    id="signup-email"
                    type="email"
                    className="login-input"
                    placeholder="john@transitops.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                  />
                </div>

                <div className="login-input-group">
                  <label className="login-input-label" htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    className="login-input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                  />
                </div>

                <div className="login-input-group">
                  <label className="login-input-label" htmlFor="signup-role">Operational Role</label>
                  <select
                    id="signup-role"
                    className="login-role-select"
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setError(''); }}
                  >
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                  </select>
                </div>

                <div className="login-input-group">
                  <label className="login-input-label" htmlFor="signup-rolekey">
                    Role Authorization Key
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      id="signup-rolekey"
                      type="password"
                      className="login-input"
                      placeholder="Enter the key provided by your admin"
                      value={roleKey}
                      onChange={(e) => { setRoleKey(e.target.value); setError(''); }}
                      style={{ paddingLeft: 36 }}
                      required
                    />
                  </div>
                  <p className="login-role-key-hint">
                    <Shield size={11} />
                    Obtain the authorization key from your system administrator.
                  </p>
                </div>

                <button
                  id="signup-submit"
                  type="submit"
                  className="login-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Creating account...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                      <UserPlus size={16} /> Create Account
                    </span>
                  )}
                </button>
              </form>

              <p className="login-toggle-text">
                Already have an account?{' '}
                <button className="login-toggle-link" onClick={() => switchMode('signin')}>
                  Sign In instead
                </button>
              </p>

              {/* Demo panel */}
              <DemoPanel demoLoading={demoLoading} handleDemoLogin={handleDemoLogin} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
