import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Truck, Navigation, AlertTriangle, Users, TrendingUp, CheckCircle, Ban, Clock, Percent } from 'lucide-react';

const DashboardView = ({ searchQuery }) => {
  const { vehicles, drivers, trips } = useContext(AppContext);

  // Filters state
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (filterType !== 'All' && v.type !== filterType) return false;
    if (filterStatus !== 'All' && v.status !== filterStatus) return false;
    if (filterRegion !== 'All' && v.region !== filterRegion) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return v.id.toLowerCase().includes(query) || v.model.toLowerCase().includes(query);
    }
    return true;
  });

  // Calculate dynamic KPIs based on full database state
  const activeVehiclesCount = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === 'In Shop').length;
  const onTripVehiclesCount = vehicles.filter(v => v.status === 'On Trip').length;
  
  const activeTripsCount = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTripsCount = trips.filter(t => t.status === 'Draft').length;
  const driversOnDutyCount = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
  
  // Utilization calculation
  const fleetUtilization = activeVehiclesCount > 0 
    ? Math.round((onTripVehiclesCount / activeVehiclesCount) * 100)
    : 0;

  // Recent Trips filter
  const recentTripsFiltered = trips.filter(trip => {
    // If vehicle search matches
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        trip.id.toLowerCase().includes(query) ||
        trip.vehicleId.toLowerCase().includes(query) ||
        trip.driverName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Vehicle Status Counts for visualizer bars
  const statusCounts = {
    Available: vehicles.filter(v => v.status === 'Available').length,
    'On Trip': vehicles.filter(v => v.status === 'On Trip').length,
    'In Shop': vehicles.filter(v => v.status === 'In Shop').length,
    Retired: vehicles.filter(v => v.status === 'Retired').length
  };

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const getStatusColor = (status) => {
    if (status === 'Available') return 'var(--success-color)';
    if (status === 'On Trip') return 'var(--info-color)';
    if (status === 'In Shop') return 'var(--warning-color)';
    return 'var(--text-muted)';
  };

  return (
    <div className="view-container">
      {/* Filters row */}
      <div className="card card-handdrawn" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-hand)', fontWeight: 'bold' }}>Filters:</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <select 
              className="table-filter-select"
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">Vehicle Type: All</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <select 
              className="table-filter-select"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <select 
              className="table-filter-select"
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <option value="All">Region: All</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid-cols-4">
        {/* Active Vehicles */}
        <div className="card card-handdrawn kpi-card kpi-card-info">
          <Truck size={36} className="kpi-icon-bg" />
          <div className="kpi-label">ACTIVE VEHICLES</div>
          <div className="kpi-value">{activeVehiclesCount}</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>
            <span>Non-retired fleet</span>
          </div>
        </div>

        {/* Available Vehicles */}
        <div className="card card-handdrawn kpi-card kpi-card-success">
          <CheckCircle size={36} className="kpi-icon-bg" />
          <div className="kpi-label">AVAILABLE VEHICLES</div>
          <div className="kpi-value">{availableVehiclesCount}</div>
          <div className="kpi-trend" style={{ color: 'var(--success-color)' }}>
            <CheckCircle size={12} />
            <span>Ready for dispatch</span>
          </div>
        </div>

        {/* Vehicles In Maintenance */}
        <div className="card card-handdrawn kpi-card kpi-card-warning">
          <AlertTriangle size={36} className="kpi-icon-bg" />
          <div className="kpi-label">IN MAINTENANCE</div>
          <div className="kpi-value">{String(maintenanceVehiclesCount).padStart(2, '0')}</div>
          <div className="kpi-trend" style={{ color: 'var(--warning-color)' }}>
            <AlertTriangle size={12} />
            <span>Currently in shop</span>
          </div>
        </div>

        {/* Active Trips */}
        <div className="card card-handdrawn kpi-card kpi-card-info">
          <Navigation size={36} className="kpi-icon-bg" />
          <div className="kpi-label">ACTIVE TRIPS</div>
          <div className="kpi-value">{activeTripsCount}</div>
          <div className="kpi-trend" style={{ color: 'var(--info-color)' }}>
            <TrendingUp size={12} />
            <span>En route</span>
          </div>
        </div>

        {/* Pending Trips */}
        <div className="card card-handdrawn kpi-card kpi-card-accent">
          <Clock size={36} className="kpi-icon-bg" />
          <div className="kpi-label">PENDING TRIPS</div>
          <div className="kpi-value">{String(pendingTripsCount).padStart(2, '0')}</div>
          <div className="kpi-trend" style={{ color: 'var(--accent-color)' }}>
            <span>Draft status</span>
          </div>
        </div>

        {/* Drivers On Duty */}
        <div className="card card-handdrawn kpi-card kpi-card-success">
          <Users size={36} className="kpi-icon-bg" />
          <div className="kpi-label">DRIVERS ON DUTY</div>
          <div className="kpi-value">{driversOnDutyCount}</div>
          <div className="kpi-trend" style={{ color: 'var(--success-color)' }}>
            <Users size={12} />
            <span>Clocked in</span>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="card card-handdrawn kpi-card kpi-card-muted">
          <Percent size={36} className="kpi-icon-bg" />
          <div className="kpi-label">FLEET UTILIZATION</div>
          <div className="kpi-value">{fleetUtilization}%</div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>
            <span>On Trip / Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid-cols-2">
        {/* Recent Trips Table */}
        <div className="table-container">
          <div className="table-toolbar">
            <h3 className="card-title" style={{ margin: 0 }}>Recent Trips</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>TRIP</th>
                <th>VEHICLE</th>
                <th>DRIVER</th>
                <th>STATUS</th>
                <th>ETA / STAGE</th>
              </tr>
            </thead>
            <tbody>
              {recentTripsFiltered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No trips found matching criteria.
                  </td>
                </tr>
              ) : (
                recentTripsFiltered.slice(0, 5).map(trip => (
                  <tr key={trip.id}>
                    <td className="td-mono" style={{ fontWeight: 'bold' }}>{trip.id}</td>
                    <td>{trip.vehicleId}</td>
                    <td>{trip.driverName}</td>
                    <td>
                      <span className={`badge ${
                        trip.status === 'Completed' ? 'badge-available' :
                        trip.status === 'Dispatched' ? 'badge-on-trip' :
                        trip.status === 'Cancelled' ? 'badge-danger' :
                        'badge-retired'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {trip.status === 'Completed' && 'Arrived'}
                      {trip.status === 'Dispatched' && 'In Transit'}
                      {trip.status === 'Draft' && 'Awaiting Dispatch'}
                      {trip.status === 'Cancelled' && 'Cancelled'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Vehicle Status Visualizer (Bar Graph style) */}
        <div className="card card-handdrawn">
          <h3 className="card-title">Vehicle Status</h3>
          <div className="progress-bar-container" style={{ gap: '20px', padding: '10px 0' }}>
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = Math.round((count / maxCount) * 100);
              return (
                <div className="progress-item" key={status}>
                  <div className="progress-label">{status}</div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: getStatusColor(status) 
                      }}
                    ></div>
                  </div>
                  <div className="progress-val">{count}</div>
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <p><strong>Note:</strong> Retired or In Shop vehicles are excluded from Trip Dispatcher selection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
