import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { AlertCircle, Lock, LogIn, Shield, Truck, Navigation, BarChart3, Eye, EyeOff, UserPlus, Zap, Mail, User, Key } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Fleet Manager',     email: 'fleet@transitops.in',      password: 'Fleet@123',    icon: Truck,      color: '#3b82f6', label: 'FL' },
  { role: 'Dispatcher',        email: 'dispatcher@transitops.in', password: 'Dispatch@123', icon: Navigation, color: '#22c55e', label: 'DS' },
  { role: 'Safety Officer',    email: 'safety@transitops.in',     password: 'Safety@123',   icon: Shield,     color: '#f97316', label: 'SO' },
  { role: 'Financial Analyst', email: 'finance@transitops.in',    password: 'Finance@123',  icon: BarChart3,  color: '#eab308', label: 'FA' },
];

const LoginScreen = () => {
  const { login, register } = useContext(AppContext);
  
  // Tab toggle: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');
  
  // Credentials/Registration states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Dispatcher');
  const [roleKey, setRoleKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedTime, setLockedTime] = useState(0);
  const [demoLoading, setDemoLoading] = useState(null);

  const handleDemoLogin = async (acc) => {
    setDemoLoading(acc.role);
    setError('');
    const result = await login(acc.email, acc.password);
    if (!result.success) {
      setError('Demo login failed. Please check that the backend server is running.');
    }
    setDemoLoading(null);
  };

  useEffect(() => {
    let interval = null;
    if (lockedTime > 0) {
      interval = setInterval(() => {
        setLockedTime(prev => prev - 1);
      }, 1000);
    } else if (lockedTime === 0 && failedAttempts >= 5) {
      setFailedAttempts(0);
    }
    return () => clearInterval(interval);
  }, [lockedTime, failedAttempts]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (lockedTime > 0) return;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      setError('');
      setFailedAttempts(0);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockedTime(15);
        setError('Account locked due to 5 failed attempts. Please wait 15 seconds.');
      } else {
        if (result.reason === 'incorrect_password') {
          setError(`Incorrect password. Attempt ${newAttempts}/5`);
        } else {
          setError(`Account not found. Please check your email. (${newAttempts}/5)`);
        }
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

    try {
      await register(name, email, password, role, roleKey);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    }
  };

  return (
    <div className="login-screen">
      {/* Background glowing effects */}
      <div className="login-bg-glow" />
      <div className="login-bg-glow-right" />

      {/* Left panel: Branding and access explanation */}
      <div className="login-left">
        <div className="login-logo-container">
          <div className="login-header-group">
            <h1 className="login-logo">
              <Truck size={36} style={{ color: 'var(--accent-color)' }} />
              TransitOps
            </h1>
            <p className="login-tagline">Smart Transport Operations Platform</p>
          </div>

          <div className="role-helper-list">
            <h4>Role-Based Access Control</h4>
            <p className="role-helper-desc">
              TransitOps enforces secure access controls. To register an account for a specific operational role, you must enter the authorized Security Access Key.
            </p>
            <div className="role-helper-cards">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <div 
                    key={acc.role}
                    className="role-card-item"
                    onClick={() => handleDemoLogin(acc)}
                    style={{
                      '--card-border-hover': `${acc.color}55`,
                      '--card-accent-color': acc.color
                    }}
                  >
                    <div 
                      className="role-card-icon-wrapper"
                      style={{
                        color: acc.color,
                        background: `${acc.color}11`,
                        borderColor: `${acc.color}22`
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="role-card-title">{acc.role}</div>
                      <div className="role-card-desc">
                        {acc.role === 'Fleet Manager' && 'Manages fleet registry, maintenance, and system configurations.'}
                        {acc.role === 'Dispatcher' && 'Dispatches active shipments, plans routes, and updates trip status.'}
                        {acc.role === 'Safety Officer' && 'Oversees driver profiles, safety logs, and license validation.'}
                        {acc.role === 'Financial Analyst' && 'Tracks fuel logs, direct transaction ledgers, and operational costs.'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Auth form */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column' }}>
          
          <div className="login-form-card">
            {/* Segmented Control / Tab Switcher */}
            <div className="login-tab-container">
              <button 
                type="button" 
                className={`login-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signin'); setError(''); }}
              >
                Sign In
              </button>
              <button 
                type="button" 
                className={`login-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setError(''); }}
              >
                Register
              </button>
            </div>

            {authMode === 'signin' ? (
              <>
                <h2 className="login-form-title">Sign in to your account</h2>
                <p className="login-form-subtitle">Enter your credentials to continue</p>

                {error && (
                  <div className="alert-box alert-danger">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {lockedTime > 0 && (
                  <div className="alert-box alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Lock size={14} />
                    <span>Locked — try again in {lockedTime}s</span>
                  </div>
                )}

                <form onSubmit={handleSignIn}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="login-input-wrapper">
                      <div className="login-input-icon">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. fleet@transitops.in"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        disabled={lockedTime > 0}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="login-input-wrapper">
                      <div className="login-input-icon">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        disabled={lockedTime > 0}
                        autoComplete="current-password"
                        style={{ paddingRight: '40px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-btn-submit"
                    disabled={lockedTime > 0}
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                </form>

                {/* ── Demo quick-access ── */}
                <div className="login-divider-container">
                  <div className="login-divider-line"></div>
                  <span className="login-divider-text">Try Demo — No Account Needed</span>
                  <div className="login-divider-line"></div>
                </div>

                <div className="login-demo-grid">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const Icon = acc.icon;
                    const isLoading = demoLoading === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleDemoLogin(acc)}
                        disabled={!!demoLoading}
                        className="login-demo-btn"
                        style={{
                          '--btn-hover-bg': `${acc.color}11`,
                          '--btn-hover-border': `${acc.color}88`,
                          '--btn-hover-color': acc.color,
                          '--btn-hover-shadow': `${acc.color}15`,
                          opacity: demoLoading && !isLoading ? 0.5 : 1,
                          cursor: demoLoading ? 'wait' : 'pointer',
                        }}
                      >
                        {isLoading ? (
                          <span style={{ 
                            width: 14, 
                            height: 14, 
                            border: `2px solid ${acc.color}44`, 
                            borderTop: `2px solid ${acc.color}`, 
                            borderRadius: '50%', 
                            display: 'inline-block', 
                            animation: 'spin 0.7s linear infinite', 
                            flexShrink: 0 
                          }} />
                        ) : (
                          <Icon size={14} style={{ flexShrink: 0, color: acc.color }} />
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.role}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h2 className="login-form-title">Create your account</h2>
                <p className="login-form-subtitle">Register a new secure operational profile</p>

                {error && (
                  <div className="alert-box alert-danger">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignUp}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="login-input-wrapper">
                      <div className="login-input-icon">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="login-input-wrapper">
                      <div className="login-input-icon">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. john@transitops.in"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="login-input-wrapper">
                      <div className="login-input-icon">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <div className="login-input-wrapper">
                      <div className="login-input-icon">
                        <Shield size={16} />
                      </div>
                      <select
                        className="form-select"
                        value={role}
                        onChange={(e) => { setRole(e.target.value); setError(''); }}
                      >
                        <option value="Fleet Manager">Fleet Manager</option>
                        <option value="Dispatcher">Dispatcher</option>
                        <option value="Safety Officer">Safety Officer</option>
                        <option value="Financial Analyst">Financial Analyst</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role Authorization Key</label>
                    <div className="login-input-wrapper">
                      <div className="login-input-icon">
                        <Key size={16} />
                      </div>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="Required for role authorization"
                        value={roleKey}
                        onChange={(e) => { setRoleKey(e.target.value); setError(''); }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-btn-submit"
                  >
                    <UserPlus size={16} />
                    <span>Create Account</span>
                  </button>
                </form>

                {/* ── Demo quick-access ── */}
                <div className="login-divider-container">
                  <div className="login-divider-line"></div>
                  <span className="login-divider-text">Try Demo — No Account Needed</span>
                  <div className="login-divider-line"></div>
                </div>

                <div className="login-demo-grid">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const Icon = acc.icon;
                    const isLoading = demoLoading === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleDemoLogin(acc)}
                        disabled={!!demoLoading}
                        className="login-demo-btn"
                        style={{
                          '--btn-hover-bg': `${acc.color}11`,
                          '--btn-hover-border': `${acc.color}88`,
                          '--btn-hover-color': acc.color,
                          '--btn-hover-shadow': `${acc.color}15`,
                          opacity: demoLoading && !isLoading ? 0.5 : 1,
                          cursor: demoLoading ? 'wait' : 'pointer',
                        }}
                      >
                        {isLoading ? (
                          <span style={{ 
                            width: 14, 
                            height: 14, 
                            border: `2px solid ${acc.color}44`, 
                            borderTop: `2px solid ${acc.color}`, 
                            borderRadius: '50%', 
                            display: 'inline-block', 
                            animation: 'spin 0.7s linear infinite', 
                            flexShrink: 0 
                          }} />
                        ) : (
                          <Icon size={14} style={{ flexShrink: 0, color: acc.color }} />
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.role}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
