import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Save, ShieldAlert, CheckSquare, Square, CheckCircle } from 'lucide-react';

const SettingsView = () => {
  const { 
    rbacRules, 
    setRbacRules, 
    depotName, 
    setDepotName, 
    currency, 
    setCurrency 
  } = useContext(AppContext);

  // States
  const [localDepotName, setLocalDepotName] = useState(depotName);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [localRbac, setLocalRbac] = useState({ ...rbacRules });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const pages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'fleet', label: 'Fleet Registry' },
    { id: 'drivers', label: 'Driver Directory' },
    { id: 'trips', label: 'Trip Dispatcher' },
    { id: 'maintenance', label: 'Maintenance Log' },
    { id: 'fuel', label: 'Fuel & Expenses' },
    { id: 'analytics', label: 'Reports & Analytics' },
    { id: 'settings', label: 'Settings & RBAC' }
  ];

  const roles = ['Dispatcher', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'];

  const handleCheckboxChange = (role, pageId) => {
    setLocalRbac(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [pageId]: !prev[role]?.[pageId]
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Save configurations
      await setDepotName(localDepotName.trim());
      await setCurrency(localCurrency);
      await setRbacRules(localRbac);

      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings');
    }
  };

  return (
    <div className="view-container" style={{ maxWidth: '1200px' }}>
      {successMsg && (
        <div className="alert-box alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-box alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* General Depot Settings */}
        <div className="card card-handdrawn">
          <h3 className="card-title">General Configurations</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Central Depot Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={localDepotName}
                onChange={(e) => setLocalDepotName(e.target.value)}
                placeholder="e.g. Gandhinagar Depot GJC"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Currency</label>
              <select
                className="form-select"
                value={localCurrency}
                onChange={(e) => setLocalCurrency(e.target.value)}
              >
                <option value="INR">INR (₹) Rupees</option>
                <option value="USD">USD ($) Dollars</option>
                <option value="EUR">EUR (€) Euros</option>
              </select>
            </div>
          </div>
        </div>

        {/* RBAC Matrix Settings */}
        <div className="card card-handdrawn">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Role-Based Access Control (RBAC) Permissions Matrix</h3>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Toggle checkboxes to configure which user profiles can access specific dashboard modules.
          </p>

          <div style={{ overflowX: 'auto', border: '1.5px solid var(--border-color)', borderRadius: '8px' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', backgroundColor: 'var(--card-header-bg)' }}>MODULE / PAGE</th>
                  {roles.map(role => (
                    <th key={role} style={{ textAlign: 'center', backgroundColor: 'var(--card-header-bg)' }}>{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page.id}>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{page.label}</td>
                    {roles.map(role => {
                      const isChecked = !!localRbac[role]?.[page.id];
                      return (
                        <td key={`${role}-${page.id}`} style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleCheckboxChange(role, page.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isChecked ? 'var(--accent-color)' : 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px'
                            }}
                          >
                            {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyItems: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', marginLeft: 'auto' }}>
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsView;
