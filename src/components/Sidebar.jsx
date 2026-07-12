import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  Fuel, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, hasAccess } = useContext(AppContext);

  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'trips', label: 'Trips', icon: Navigation },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'fuel', label: 'Fuel & Expenses', icon: Fuel },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">TransitOps</div>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isAllowed = hasAccess(item.id);
          
          return (
            <li className="sidebar-item" key={item.id}>
              <a
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''} ${!isAllowed ? 'disabled-link' : ''}`}
                onClick={() => isAllowed && setActiveTab(item.id)}
                style={{ 
                  opacity: isAllowed ? 1 : 0.35, 
                  cursor: isAllowed ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      
      <div className="sidebar-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {user.email}
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={logout}
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              justifyContent: 'center',
              width: '100%' 
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
