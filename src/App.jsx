import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import FleetView from './components/FleetView';
import DriversView from './components/DriversView';
import TripsView from './components/TripsView';
import MaintenanceView from './components/MaintenanceView';
import FuelExpenseView from './components/FuelExpenseView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => {
  const { user } = useContext(AppContext);
  return (
    <div className="denied-container">
      <ShieldAlert size={64} className="denied-icon" />
      <h2 className="denied-title">Access Denied</h2>
      <p className="denied-desc">
        Your current role profile (<strong>{user?.role}</strong>) does not have authorization to view this module. 
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Use the Quick Switch Role selector in the top bar to simulate another profile for testing.
      </p>
    </div>
  );
};

function AppContent() {
  const { user, hasAccess } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // When role changes, if the current tab is not accessible, auto-switch to the first accessible one
  useEffect(() => {
    if (user) {
      const accessibleTabs = [
        'dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'fuel', 'analytics', 'settings'
      ].filter(t => hasAccess(t));
      
      if (accessibleTabs.length > 0 && !accessibleTabs.includes(activeTab)) {
        setActiveTab(accessibleTabs[0]);
      }
    }
  }, [user?.role]);

  if (!user) {
    return <LoginScreen />;
  }

  // Render correct view
  const renderView = () => {
    if (!hasAccess(activeTab)) {
      return <AccessDenied />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView searchQuery={searchQuery} />;
      case 'fleet':
        return <FleetView searchQuery={searchQuery} />;
      case 'drivers':
        return <DriversView searchQuery={searchQuery} />;
      case 'trips':
        return <TripsView searchQuery={searchQuery} />;
      case 'maintenance':
        return <MaintenanceView searchQuery={searchQuery} />;
      case 'fuel':
        return <FuelExpenseView searchQuery={searchQuery} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Topbar 
          activeTab={activeTab} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '16px' }}>
          {renderView()}
        </div>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
