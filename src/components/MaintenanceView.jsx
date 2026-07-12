import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Check, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

const MaintenanceView = ({ searchQuery }) => {
  const { 
    vehicles, 
    maintenanceLogs, 
    addMaintenanceRecord, 
    closeMaintenanceRecord,
    currency 
  } = useContext(AppContext);

  // Form states
  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Get active non-retired vehicles for dropdown
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleId || !serviceType || !cost || !date) {
      setError('All fields are required.');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (selectedVehicle.status === 'On Trip') {
      setError('Cannot put vehicle in maintenance: it is currently on a trip.');
      return;
    }

    addMaintenanceRecord({
      vehicleId,
      serviceType,
      cost: Number(cost),
      date
    });

    // Clear fields
    setVehicleId('');
    setServiceType('');
    setCost('');
  };

  // Search filter
  const filteredLogs = maintenanceLogs.filter(log => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.vehicleId.toLowerCase().includes(q) ||
        log.serviceType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="view-container">
      <div className="grid-cols-2">
        {/* Left: Log service record form */}
        <div className="card card-handdrawn" style={{ height: 'fit-content' }}>
          <h3 className="card-title">Log Service Record</h3>
          
          {error && (
            <div className="alert-box alert-danger">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Vehicle</label>
              <select
                className="form-select"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">-- Choose Vehicle --</option>
                {activeVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.id}) - Status: {v.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type / Issue Description</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Oil Change, Engine Check"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Cost ({currency})</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 2500"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={!vehicleId || !serviceType || !cost}
            >
              Log Maintenance
            </button>
          </form>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <span className="badge badge-in-shop" style={{ padding: '2px 6px' }}>In Shop</span>
              <span>Vehicle status automatically switches to "In Shop" on log creation.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <span className="badge badge-available" style={{ padding: '2px 6px' }}>Available</span>
              <span>Closing the maintenance log restores the vehicle to Available.</span>
            </div>
          </div>
        </div>

        {/* Right: Service Logs table */}
        <div className="table-container">
          <div className="table-toolbar">
            <h3 className="card-title" style={{ margin: 0 }}>Service Log History</h3>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>VEHICLE</th>
                <th>SERVICE TYPE</th>
                <th>COST</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No service records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="td-mono" style={{ fontWeight: 'bold' }}>{log.vehicleId}</td>
                    <td>{log.serviceType}</td>
                    <td className="td-mono">{formatCurrency(log.cost)}</td>
                    <td className="td-mono">{log.date}</td>
                    <td>
                      <span className={`badge ${
                        log.status === 'Active' ? 'badge-in-shop' : 'badge-available'
                      }`}>
                        {log.status === 'Active' ? 'In Shop' : 'Completed'}
                      </span>
                    </td>
                    <td>
                      {log.status === 'Active' ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => closeMaintenanceRecord(log.id)}
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '0.8rem', 
                            backgroundColor: 'var(--success-color)',
                            borderColor: 'var(--success-color)',
                            boxShadow: 'none'
                          }}
                        >
                          <Check size={12} />
                          <span>Close</span>
                        </button>
                      ) : (
                        <div style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          <CheckCircle size={14} />
                          <span>Done</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceView;
