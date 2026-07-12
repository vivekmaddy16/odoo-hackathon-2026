import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';

const FleetView = ({ searchQuery }) => {
  const { vehicles, addVehicle, deleteVehicle, updateVehicleStatus, currency } = useContext(AppContext);
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Form fields
  const [newId, setNewId] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState('Van');
  const [newCapacity, setNewCapacity] = useState('');
  const [newOdometer, setNewOdometer] = useState('');
  const [newAcqCost, setNewAcqCost] = useState('');
  const [newRegion, setNewRegion] = useState('West');
  const [error, setError] = useState('');

  // Handle submit
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setError('');

    if (!newId || !newModel || !newCapacity || !newOdometer || !newAcqCost) {
      setError('All fields are required.');
      return;
    }

    try {
      await addVehicle({
        id: newId.toUpperCase().trim(),
        model: newModel.trim(),
        type: newType,
        capacity: Number(newCapacity),
        odometer: Number(newOdometer),
        acqCost: Number(newAcqCost),
        region: newRegion
      });

      // Clear fields and close only on success
      setNewId('');
      setNewModel('');
      setNewType('Van');
      setNewCapacity('');
      setNewOdometer('');
      setNewAcqCost('');
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
      } catch (err) {
        alert(err.message || 'Failed to delete vehicle');
      }
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (filterType !== 'All' && v.type !== filterType) return false;
    if (filterStatus !== 'All' && v.status !== filterStatus) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.id.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status) => {
    if (status === 'Available') return 'badge-available';
    if (status === 'On Trip') return 'badge-on-trip';
    if (status === 'In Shop') return 'badge-in-shop';
    return 'badge-retired';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="view-container">
      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-filters">
            <select 
              className="table-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">Type: All</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
            </select>
            
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
          
          <button 
            className="btn btn-primary"
            onClick={() => { setError(''); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Data Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>REG. NO. (UNIQUE)</th>
              <th>NAME/MODEL</th>
              <th>TYPE</th>
              <th>MAX CAPACITY</th>
              <th>ODOMETER (KM)</th>
              <th>ACQ. COST</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No vehicles registered.
                </td>
              </tr>
            ) : (
              filteredVehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td className="td-mono" style={{ fontWeight: 'bold' }}>{vehicle.id}</td>
                  <td style={{ fontWeight: '600' }}>{vehicle.model}</td>
                  <td>{vehicle.type}</td>
                  <td className="td-mono">
                    {vehicle.capacity >= 1000 
                      ? `${vehicle.capacity / 1000} Ton` 
                      : `${vehicle.capacity} kg`
                    }
                  </td>
                  <td className="td-mono">{vehicle.odometer.toLocaleString()}</td>
                  <td className="td-mono">{formatCurrency(vehicle.acqCost)}</td>
                  <td>
                    <select
                      className={`status-select-pill badge ${getStatusBadge(vehicle.status)}`}
                      value={vehicle.status}
                      onChange={async (e) => {
                        try {
                          await updateVehicleStatus(vehicle.id, e.target.value);
                        } catch (err) {
                          alert(err.message || 'Failed to update vehicle status');
                        }
                      }}
                    >
                      <option value="Available">Available</option>
                      <option value="In Shop">In Shop</option>
                      <option value="Retired">Retired</option>
                      {vehicle.status === 'On Trip' && (
                        <option value="On Trip">On Trip</option>
                      )}
                    </select>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', boxShadow: 'none' }}
                      title="Delete Vehicle"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <p><strong>Rule:</strong> Retired or In Shop vehicles are automatically hidden from Trip Dispatcher selection.</p>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Vehicle</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddVehicle}>
              <div className="modal-body">
                {error && (
                  <div className="alert-box alert-danger">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Registration Number (Unique)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. GJ01AB4521"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Name/Model</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Van-05"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                    >
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="Mini">Mini</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <select 
                      className="form-select"
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                    >
                      <option value="West">West</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Max Load Capacity (kg)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 500"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Odometer (km)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 74000"
                      value={newOdometer}
                      onChange={(e) => setNewOdometer(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Acquisition Cost (INR)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 620000"
                    value={newAcqCost}
                    onChange={(e) => setNewAcqCost(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetView;
