import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Sun, Moon, Search, Shield } from 'lucide-react';

const Topbar = ({ activeTab, searchQuery, setSearchQuery }) => {
  const { user, setUser, depotName } = useContext(AppContext);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Initial theme set
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    // Update active user with new role
    setUser(prev => ({
      ...prev,
      role: selectedRole
    }));
  };

  const formatTitle = (tab) => {
    if (tab === 'fuel') return 'Fuel & Expense Management';
    if (tab === 'analytics') return 'Reports & Analytics';
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  if (!user) return null;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="view-title" style={{ fontFamily: 'var(--font-hand)' }}>
          {formatTitle(activeTab)}
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          | {depotName}
        </span>
      </div>
      
      <div className="topbar-right">
        {/* Search bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-box"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Quick RBAC role switcher for demonstration */}
        <div className="quick-role-switch">
          <Shield size={16} style={{ color: 'var(--accent-color)' }} />
          <span>Role:</span>
          <select 
            value={user.role} 
            onChange={handleRoleChange}
            className="quick-role-select"
          >
            <option value="Dispatcher">Dispatcher</option>
            <option value="Fleet Manager">Fleet Manager</option>
            <option value="Safety Officer">Safety Officer</option>
            <option value="Financial Analyst">Financial Analyst</option>
          </select>
        </div>

        {/* Sun/Moon Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: '1.5px solid var(--border-color)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--card-bg)'
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User profile card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-color)', 
              color: 'var(--accent-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontFamily: 'var(--font-hand)'
            }}
          >
            {user.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
