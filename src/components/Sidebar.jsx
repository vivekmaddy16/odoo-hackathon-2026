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
    { id: 'dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
    { id: 'fleet',       label: 'Fleet',              icon: Truck },
    { id: 'drivers',     label: 'Drivers',            icon: Users },
    { id: 'trips',       label: 'Trips',              icon: Navigation },
    { id: 'maintenance', label: 'Maintenance',        icon: Wrench },
    { id: 'fuel',        label: 'Fuel & Expenses',    icon: Fuel },
    { id: 'analytics',   label: 'Analytics',          icon: BarChart3 },
    { id: 'settings',    label: 'Settings',           icon: Settings },
  ];

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">T</div>
        <div>
          <div className="sidebar-logo-text">TransitOps</div>
          <div className="sidebar-logo-sub">Fleet Management</div>
        </div>
      </div>

      {/* Navigation */}
      <ul className="sidebar-menu">
        <li><div className="sidebar-section-label">Navigation</div></li>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isAllowed = hasAccess(item.id);
          const isActive = activeTab === item.id;

          return (
            <li className="sidebar-item" key={item.id}>
              <a
                className={`sidebar-link${isActive ? ' active' : ''}`}
                onClick={() => isAllowed && setActiveTab(item.id)}
                style={{
                  opacity: isAllowed ? 1 : 0.3,
                  cursor: isAllowed ? 'pointer' : 'not-allowed',
                }}
                title={!isAllowed ? 'Access restricted for your role' : item.label}
              >
                <span className="sidebar-link-icon">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Footer: user + sign out */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.role}</div>
          </div>
        </div>
        <button className="sidebar-signout" onClick={logout}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
