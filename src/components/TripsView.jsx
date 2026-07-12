import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { AlertCircle, Navigation, CheckCircle2, XCircle, ArrowRight, Play, Check } from 'lucide-react';

const TripsView = ({ searchQuery }) => {
  const { 
    vehicles, 
    drivers, 
    trips, 
    createTrip, 
    dispatchTrip, 
    cancelTrip, 
    completeTrip,
    currency,
    isLicenseExpired
  } = useContext(AppContext);

  // Form States
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverName, setSelectedDriverName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [formError, setFormError] = useState('');

  // Modal States for Completing Trip
  const [activeCompleteTrip, setActiveCompleteTrip] = useState(null); // Trip object
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [otherExpenses, setOtherExpenses] = useState('');
  const [completeError, setCompleteError] = useState('');

  // Get available vehicles
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  // Get available drivers (not suspended and license not expired)
  const availableDrivers = drivers.filter(d => 
    d.status === 'Available' && 
    d.status !== 'Suspended' && 
    !isLicenseExpired(d.expiryDate)
  );

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedDriver = drivers.find(d => d.name === selectedDriverName);

  // Validate cargo capacity
  const isWeightValid = !selectedVehicle || !cargoWeight || Number(cargoWeight) <= selectedVehicle.capacity;
  const weightExceededBy = selectedVehicle && cargoWeight ? Number(cargoWeight) - selectedVehicle.capacity : 0;

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!source || !destination || !selectedVehicleId || !selectedDriverName || !cargoWeight || !plannedDistance) {
      setFormError('All fields are required.');
      return;
    }

    if (!isWeightValid) {
      setFormError('Cannot create trip: Cargo weight exceeds vehicle capacity.');
      return;
    }

    try {
      await createTrip({
        source,
        destination,
        vehicleId: selectedVehicleId,
        driverName: selectedDriverName,
        cargoWeight: Number(cargoWeight),
        distance: Number(plannedDistance)
      });

      // Reset Form on success
      setSource('');
      setDestination('');
      setSelectedVehicleId('');
      setSelectedDriverName('');
      setCargoWeight('');
      setPlannedDistance('');
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setCompleteError('');

    if (!finalOdometer) {
      setCompleteError('Final odometer reading is required.');
      return;
    }

    try {
      await completeTrip(
        activeCompleteTrip.id,
        Number(finalOdometer),
        Number(fuelLiters || 0),
        Number(fuelCost || 0),
        Number(otherExpenses || 0)
      );

      // Reset & close on success
      setActiveCompleteTrip(null);
      setFinalOdometer('');
      setFuelLiters('');
      setFuelCost('');
      setOtherExpenses('');
    } catch (err) {
      setCompleteError(err.message);
    }
  };

  const handleOpenCompleteModal = (trip) => {
    const v = vehicles.find(veh => veh.id === trip.vehicleId);
    setActiveCompleteTrip(trip);
    setFinalOdometer(v ? v.odometer + trip.distance : '');
    setFuelLiters('');
    setFuelCost('');
    setOtherExpenses('');
    setCompleteError('');
  };

  const handleDispatchTrip = async (tripId) => {
    try {
      await dispatchTrip(tripId);
    } catch (err) {
      alert(err.message || 'Failed to dispatch trip');
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        await cancelTrip(tripId);
      } catch (err) {
        alert(err.message || 'Failed to cancel trip');
      }
    }
  };

  // Search filter
  const filteredTrips = trips.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.vehicleId.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="view-container">
      <div className="grid-cols-2">
        {/* Left Side: Create Trip */}
        <div className="card card-handdrawn" style={{ height: 'fit-content' }}>
          <h3 className="card-title">Create Trip</h3>
          
          {formError && (
            <div className="alert-box alert-danger">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateTrip}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Source Depot</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Gandhinagar Depot"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Destination Hub</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Ahmedabad Hub"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Vehicle (Available Only)</label>
              <select
                className="form-select"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="">-- Choose Vehicle --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.id}) - Max: {v.capacity} kg
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Driver (Available Only)</label>
              <select
                className="form-select"
                value={selectedDriverName}
                onChange={(e) => setSelectedDriverName(e.target.value)}
              >
                <option value="">-- Choose Driver --</option>
                {availableDrivers.map(d => (
                  <option key={d.licenseNo} value={d.name}>
                    {d.name} (Safety: {d.safetyScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Cargo Weight (kg)</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="e.g. 450"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Planned Distance (km)</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="e.g. 38"
                  value={plannedDistance}
                  onChange={(e) => setPlannedDistance(e.target.value)}
                />
              </div>
            </div>

            {/* Validation alerts */}
            {selectedVehicle && cargoWeight && (
              <div className={`alert-box ${isWeightValid ? 'alert-success' : 'alert-danger'}`}>
                <AlertCircle size={18} />
                <div>
                  <strong>Vehicle capacity:</strong> {selectedVehicle.capacity} kg<br />
                  <strong>Cargo weight:</strong> {cargoWeight} kg<br />
                  {isWeightValid ? (
                    <span>Status: Ok / Ready to Dispatch</span>
                  ) : (
                    <span>[x] Capacity exceeded by {weightExceededBy} kg - dispatch blocked!</span>
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={!isWeightValid || !selectedVehicleId || !selectedDriverName}
            >
              Create Trip Draft
            </button>
          </form>
        </div>

        {/* Right Side: Trips Board */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0, fontFamily: 'var(--font-hand)' }}>Trips Board</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredTrips.length} entries
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredTrips.length === 0 ? (
              <div className="card card-handdrawn" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No trips registered yet.
              </div>
            ) : (
              filteredTrips.map(trip => (
                <div className="card card-handdrawn" key={trip.id} style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="td-mono" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-color)' }}>
                        {trip.id}
                      </span>
                      <span className={`badge ${
                        trip.status === 'Completed' ? 'badge-available' :
                        trip.status === 'Dispatched' ? 'badge-on-trip' :
                        trip.status === 'Cancelled' ? 'badge-danger' :
                        'badge-retired'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {trip.createdAt}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '8px' }}>
                    <span>{trip.source}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{trip.destination}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <div>Vehicle: <strong>{trip.vehicleId}</strong></div>
                    <div>Driver: <strong>{trip.driverName}</strong></div>
                    <div>Weight: <strong>{trip.cargoWeight} kg</strong></div>
                    <div>Distance: <strong>{trip.distance} km</strong></div>
                  </div>

                  {/* Actions depending on Status */}
                  <div style={{ display: 'flex', justifyItems: 'flex-end', gap: '8px' }}>
                    {trip.status === 'Draft' && (
                      <>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleDispatchTrip(trip.id)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1 }}
                        >
                          <Play size={14} />
                          <span>Dispatch</span>
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleCancelTrip(trip.id)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', border: '1.5px solid var(--error-color)', color: 'var(--error-color)' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {trip.status === 'Dispatched' && (
                      <>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleOpenCompleteModal(trip)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', flex: 1, backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                        >
                          <Check size={14} />
                          <span>Complete Trip</span>
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleCancelTrip(trip.id)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {trip.status === 'Completed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <CheckCircle2 size={14} />
                        <span>Completed (Odo: {trip.odometerEnd} km, Fuel: {trip.fuelConsumed}L)</span>
                      </div>
                    )}

                    {trip.status === 'Cancelled' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--error-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <XCircle size={14} />
                        <span>Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {activeCompleteTrip && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Complete Trip {activeCompleteTrip.id}</h3>
              <button className="modal-close" onClick={() => setActiveCompleteTrip(null)}>
                <XCircle size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body">
                {completeError && (
                  <div className="alert-box alert-danger">
                    <AlertCircle size={18} />
                    <span>{completeError}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Final Odometer Reading (km)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    placeholder="e.g. 74038"
                    value={finalOdometer}
                    onChange={(e) => setFinalOdometer(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Odometer at start: {activeCompleteTrip.odometerStart} km. Planned distance: {activeCompleteTrip.distance} km.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Fuel Consumed (Liters)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 4.5"
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fuel Cost ({currency})</label>
                    <input 
                      type="number" 
                      className="form-input"
                      placeholder="e.g. 450"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Other Expenses (Tolls, etc.)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    placeholder="e.g. 150"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setActiveCompleteTrip(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsView;
