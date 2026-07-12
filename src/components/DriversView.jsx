import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';

const DriversView = ({ searchQuery }) => {
  const { drivers, addDriver, deleteDriver, updateDriverStatus, isLicenseExpired } = useContext(AppContext);
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Form fields
  const [newName, setNewName] = useState('');
  const [newLicenseNo, setNewLicenseNo] = useState('');
  const [newCategory, setNewCategory] = useState('LMV');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newSafetyScore, setNewSafetyScore] = useState('');
  const [error, setError] = useState('');

  // Handle submit
  const handleAddDriver = async (e) => {
    e.preventDefault();
    setError('');

    if (!newName || !newLicenseNo || !newExpiryDate || !newContact || !newSafetyScore) {
      setError('All fields are required.');
      return;
    }

    try {
      await addDriver({
        name: newName.trim(),
        licenseNo: newLicenseNo.toUpperCase().trim(),
        category: newCategory,
        expiryDate: newExpiryDate,
        contact: newContact.trim(),
        safetyScore: Number(newSafetyScore),
        status: 'Available'
      });

      // Clear fields and close only on success
      setNewName('');
      setNewLicenseNo('');
      setNewCategory('LMV');
      setNewExpiryDate('');
      setNewContact('');
      setNewSafetyScore('');
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDriver = async (licenseNo) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver(licenseNo);
      } catch (err) {
        alert(err.message || 'Failed to delete driver');
      }
    }
  };

  // Filter drivers
  const filteredDrivers = drivers.filter(d => {
    if (filterStatus !== 'All' && d.status !== filterStatus) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.licenseNo.toLowerCase().includes(q);
    }
    return true;
  });

  const getStatusBadge = (status, date) => {
    if (isLicenseExpired(date)) return 'badge-danger';
    if (status === 'Available') return 'badge-available';
    if (status === 'On Trip') return 'badge-on-trip';
    if (status === 'Suspended') return 'badge-suspended';
    return 'badge-retired'; // Off Duty
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 90) return 'var(--success-color)';
    if (score >= 75) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  return (
    <div className="view-container">
      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-filters">
            <select 
              className="table-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => { setError(''); setIsModalOpen(true); }}
          >
            <Plus size={16} />
            <span>Add Driver</span>
          </button>
        </div>

        {/* Data Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>DRIVER</th>
              <th>LICENSE NO</th>
              <th>CATEGORY</th>
              <th>EXPIRY DATE</th>
              <th>CONTACT</th>
              <th>SAFETY SCORE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No drivers registered.
                </td>
              </tr>
            ) : (
              filteredDrivers.map(driver => {
                const expired = isLicenseExpired(driver.expiryDate);
                return (
                  <tr key={driver.licenseNo}>
                    <td style={{ fontWeight: '600' }}>{driver.name}</td>
                    <td className="td-mono">{driver.licenseNo}</td>
                    <td>{driver.category}</td>
                    <td className="td-mono" style={{ color: expired ? 'var(--error-color)' : 'inherit' }}>
                      {driver.expiryDate} {expired && <span style={{ fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '4px' }}>(EXPIRED)</span>}
                    </td>
                    <td className="td-mono">{driver.contact}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--border-color)', height: '8px', borderRadius: '4px', width: '60px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${driver.safetyScore}%`, backgroundColor: getSafetyScoreColor(driver.safetyScore) }}></div>
                        </div>
                        <span className="td-mono">{driver.safetyScore}%</span>
                      </div>
                    </td>
                    <td>
                       <select
                         className={`status-select-pill badge ${getStatusBadge(driver.status, driver.expiryDate)}`}
                         value={driver.status}
                         disabled={driver.status === 'On Trip' || expired}
                         onChange={async (e) => {
                           try {
                             await updateDriverStatus(driver.licenseNo, e.target.value);
                           } catch (err) {
                             alert(err.message || 'Failed to update driver status');
                           }
                         }}
                       >
                         <option value="Available">Available</option>
                         <option value="Off Duty">Off Duty</option>
                         <option value="Suspended">Suspended</option>
                         {driver.status === 'On Trip' && (
                           <option value="On Trip">On Trip</option>
                         )}
                         {expired && (
                           <option value={driver.status}>Expired</option>
                         )}
                       </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteDriver(driver.licenseNo)}
                        disabled={driver.status === 'On Trip'}
                        className="btn btn-danger"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', boxShadow: 'none' }}
                        title={driver.status === 'On Trip' ? 'Cannot delete driver on a trip' : 'Delete Driver'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <p><strong>Rule:</strong> Drivers with expired licenses or Suspended status cannot be assigned to trips.</p>
      </div>

      {/* Add Driver Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Driver</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddDriver}>
              <div className="modal-body">
                {error && (
                  <div className="alert-box alert-danger">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Driver Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Alex Smith"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. DL-88213"
                    value={newLicenseNo}
                    onChange={(e) => setNewLicenseNo(e.target.value)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">License Category</label>
                    <select 
                      className="form-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="LMV">LMV (Light Motor Vehicle)</option>
                      <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 9876543210"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Safety Score (%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 95"
                      min="0"
                      max="100"
                      value={newSafetyScore}
                      onChange={(e) => setNewSafetyScore(e.target.value)}
                    />
                  </div>
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

export default DriversView;
