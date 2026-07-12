import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Sun, Moon, Search, Settings, LogOut, Bell } from 'lucide-react';

const Topbar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  const { user, logout, depotName } = useContext(AppContext);
  const [theme, setTheme] = useState('dark');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const formatTitle = (tab) => {
    const titles = {
      dashboard:   'Dashboard',
      fleet:       'Fleet Management',
      drivers:     'Driver Management',
      trips:       'Trip Management',
      maintenance: 'Maintenance Logs',
      fuel:        'Fuel & Expenses',
      analytics:   'Reports & Analytics',
      settings:    'Settings',
    };
    return titles[tab] || tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="topbar">
      {/* Left: page title + depot */}
      <div className="topbar-left">
        <h2 className="view-title">{formatTitle(activeTab)}</h2>
        <div className="topbar-divider" />
        <span className="view-subtitle">{depotName}</span>
      </div>

      {/* Right: search, actions, avatar */}
      <div className="topbar-right">
        {/* Search */}
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            id="topbar-search"
            type="text"
            placeholder="Search..."
            className="search-box"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Notifications (decorative) */}
        <button className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
          <Bell size={17} />
        </button>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          className="topbar-icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Avatar / profile dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            id="topbar-avatar"
            className="topbar-avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              {/* User info */}
              <div style={{ marginBottom: '4px' }}>
                <div className="dropdown-user-name">{user.name}</div>
                <div className="dropdown-user-email">{user.email}</div>
                <span className="badge badge-on-trip" style={{ marginTop: '8px', fontSize: '0.72rem' }}>
                  {user.role}
                </span>
              </div>

              <div className="dropdown-divider" />

              <button
                className="dropdown-item"
                onClick={() => { setActiveTab('settings'); setDropdownOpen(false); }}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </button>

              <button
                className="dropdown-item danger"
                onClick={() => { logout(); setDropdownOpen(false); }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
