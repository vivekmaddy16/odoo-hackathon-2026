import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { AlertCircle, Lock, LogIn, Shield, Truck, Navigation, BarChart3, Eye, EyeOff, UserPlus } from 'lucide-react';

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
      {/* Left panel: Branding and access explanation */}
      <div className="login-left">
        <div className="login-logo-container">
          <h1 className="login-logo">TransitOps</h1>
          <p className="login-tagline">Smart Transport Operations Platform</p>

          <div className="role-helper-list" style={{ marginTop: '32px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Role-Based Access Control</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              TransitOps enforces secure access controls. To register an account for a specific operational role, you must enter the authorized Security Access Key.
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ border: '1px dashed var(--border-color)', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={16} style={{ color: 'var(--info-color)' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Fleet Manager</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Manages fleet registry, maintenance, and system configurations.</div>
                </div>
              </li>
              <li style={{ border: '1px dashed var(--border-color)', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Navigation size={16} style={{ color: 'var(--success-color)' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Dispatcher</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dispatches active shipments, plans routes, and updates trip status.</div>
                </div>
              </li>
              <li style={{ border: '1px dashed var(--border-color)', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={16} style={{ color: 'var(--warning-color)' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Safety Officer</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Oversees driver profiles, safety logs, and license validation.</div>
                </div>
              </li>
              <li style={{ border: '1px dashed var(--border-color)', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={16} style={{ color: 'var(--accent-color)' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Financial Analyst</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tracks fuel logs, direct transaction ledgers, and operational costs.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel: Auth form */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="login-form-card">
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
                  <div className="alert-box alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={14} />
                    <span>Locked — try again in {lockedTime}s</span>
                  </div>
                )}

                <form onSubmit={handleSignIn}>
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

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '11px', fontSize: '1rem', marginTop: '16px' }}
                    disabled={lockedTime > 0}
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <span
                    onClick={() => { setAuthMode('signup'); setError(''); }}
                    style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Create one here
                  </span>
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
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. john@transitops.in"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
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

                  <div className="form-group">
                    <label className="form-label">Role Authorization Key</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Required for role authorization"
                      value={roleKey}
                      onChange={(e) => { setRoleKey(e.target.value); setError(''); }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '11px', fontSize: '1rem', marginTop: '16px' }}
                  >
                    <UserPlus size={16} />
                    <span>Create Account</span>
                  </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => { setAuthMode('signin'); setError(''); }}
                    style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Sign In instead
                  </span>
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
