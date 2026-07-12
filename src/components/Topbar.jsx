import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Sun, Moon, Search, Shield, Settings, LogOut } from 'lucide-react';

const Topbar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  const { user, setUser, logout, depotName } = useContext(AppContext);
  const [theme, setTheme] = useState('dark');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Initial theme set
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

        {/* User profile dropdown avatar */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              backgroundColor: '#f1c40f', // Vibrant yellow from sketch
              color: '#000000', // Black handdrawn characters
              border: '2px solid var(--text-primary)', // Bold outline
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-hand)',
              cursor: 'pointer',
              boxShadow: dropdownOpen ? 'none' : '2px 2px 0px var(--border-color)',
              transform: dropdownOpen ? 'translate(1px, 1px)' : 'none',
            }}
          >
            {user.role === 'Fleet Manager' ? 'FL' : user.name.substring(0, 2).toUpperCase()}
          </button>

          {dropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '240px',
                backgroundColor: 'var(--card-bg)',
                border: '2px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.15)',
                padding: '16px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                animation: 'fadeIn 0.15s ease-out'
              }}
            >
              {/* Profile Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'left' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                  {user.email}
                </div>
                <span className="badge badge-available" style={{ alignSelf: 'flex-start', marginTop: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {user.role}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }}></div>

              {/* Options */}
              <button 
                onClick={() => { setActiveTab('settings'); setDropdownOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '8px 4px',
                  borderRadius: '6px',
                  width: '100%',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </button>

              <button 
                onClick={() => { logout(); setDropdownOpen(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--error-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '8px 4px',
                  borderRadius: '6px',
                  width: '100%',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
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
