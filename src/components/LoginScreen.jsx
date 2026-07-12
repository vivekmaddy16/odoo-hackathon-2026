import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { AlertCircle, Lock, LogIn, Zap, Shield, Truck, Navigation, BarChart3, Eye, EyeOff } from 'lucide-react';

const LoginScreen = () => {
  const { login, demoLogin } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedTime, setLockedTime] = useState(0);

  // Demo accounts info for display
  const demoAccounts = [
    { role: 'Fleet Manager', icon: Truck, email: 'fleet@transitops.in', password: 'Fleet@123', scope: 'Fleet, Maintenance, Settings', color: 'var(--info-color)' },
    { role: 'Dispatcher', icon: Navigation, email: 'dispatcher@transitops.in', password: 'Dispatch@123', scope: 'Dashboard, Trips', color: 'var(--success-color)' },
    { role: 'Safety Officer', icon: Shield, email: 'safety@transitops.in', password: 'Safety@123', scope: 'Drivers', color: 'var(--warning-color)' },
    { role: 'Financial Analyst', icon: BarChart3, email: 'finance@transitops.in', password: 'Finance@123', scope: 'Fuel & Expenses, Analytics', color: 'var(--accent-color)' }
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lockedTime > 0) return;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const result = login(email, password);
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

  const handleDemoLogin = (role) => {
    if (lockedTime > 0) return;
    demoLogin(role);
  };

  return (
    <div className="login-screen">
      {/* Left panel: Branding */}
      <div className="login-left">
        <div className="login-logo-container">
          <h1 className="login-logo">TransitOps</h1>
          <p className="login-tagline">Smart Transport Operations Platform</p>

          <div className="role-helper-list" style={{ marginTop: '32px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Role-Based Access Control</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Each role has unique credentials and restricted access to specific modules.
            </p>
            <ul>
              {demoAccounts.map(acc => {
                const Icon = acc.icon;
                return (
                  <li
                    key={acc.role}
                    style={{
                      border: '1px dashed var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'default'
                    }}
                  >
                    <Icon size={16} style={{ color: acc.color, marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{acc.role}</div>
                      <div style={{ fontSize: '0.75rem', color: acc.color, marginTop: '2px' }}>
                        Access: {acc.scope}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel: Auth form + Demo login */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Auth Form Card */}
          <div className="login-form-card">
            <h2 className="login-form-title">Sign in to your account</h2>
            <p className="login-form-subtitle">Enter your credentials to continue</p>

            {error && (
              <div className="alert-box alert-danger">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {lockedTime > 0 && (
              <div className="alert-box alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={14} />
                <span>Locked — try again in {lockedTime}s</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. fleet@transitops.in"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={lockedTime > 0}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    disabled={lockedTime > 0}
                    autoComplete="current-password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" style={{ accentColor: 'var(--accent-color)' }} defaultChecked />
                  <span>Remember me</span>
                </label>
                <a
                  href="#"
                  style={{ color: 'var(--accent-color)', fontSize: '0.85rem', textDecoration: 'none' }}
                  onClick={(e) => { e.preventDefault(); alert('Contact your admin to reset credentials.'); }}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '1rem' }}
                disabled={lockedTime > 0}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            </form>
          </div>

          {/* Demo Login Section for Judges */}
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: 'rgba(234, 179, 8, 0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap size={16} style={{ color: 'var(--accent-color)' }} />
              <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--accent-color)' }}>
                Quick Demo Login
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                For evaluation
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {demoAccounts.map(acc => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleDemoLogin(acc.role)}
                    disabled={lockedTime > 0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: 'var(--card-bg)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      cursor: lockedTime > 0 ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-hand)',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      transition: 'all 0.15s ease',
                      opacity: lockedTime > 0 ? 0.4 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (lockedTime <= 0) {
                        e.currentTarget.style.borderColor = acc.color;
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                    }}
                  >
                    <Icon size={14} style={{ color: acc.color, flexShrink: 0 }} />
                    <span>{acc.role}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              One-click login — no credentials needed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
