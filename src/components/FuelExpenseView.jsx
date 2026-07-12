import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Fuel, DollarSign, ListFilter, AlertCircle } from 'lucide-react';

const FuelExpenseView = ({ searchQuery }) => {
  const { 
    vehicles, 
    fuelLogs, 
    expenses, 
    logDirectFuel, 
    logDirectExpense, 
    updateExpenseType,
    currency 
  } = useContext(AppContext);

  // States
  const [activeForm, setActiveForm] = useState('fuel'); // 'fuel' or 'expense'
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Fuel fields
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  
  // Expense fields
  const [expenseType, setExpenseType] = useState('Tolls');
  const [amount, setAmount] = useState('');
  
  const [error, setError] = useState('');

  // Submit fuel
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleId || !liters || !fuelCost || !date) {
      setError('All fields are required.');
      return;
    }

    try {
      await logDirectFuel(vehicleId, date, liters, fuelCost);
      
      // Clear on success
      setVehicleId('');
      setLiters('');
      setFuelCost('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Submit expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleId || !amount || !date) {
      setError('All fields are required.');
      return;
    }

    try {
      await logDirectExpense(vehicleId, date, expenseType, amount);
      
      // Clear on success
      setVehicleId('');
      setAmount('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate Operational Cost (Fuel + Maintenance) per Vehicle
  const computeOperationalCosts = () => {
    const costMap = {};
    
    // Initialize all vehicles
    vehicles.forEach(v => {
      costMap[v.id] = {
        model: v.model,
        fuel: 0,
        maintenance: 0,
        tolls: 0,
        total: 0
      };
    });

    // Sum expenses
    expenses.forEach(exp => {
      if (costMap[exp.vehicleId]) {
        const amt = Number(exp.amount);
        if (exp.type === 'Fuel') {
          costMap[exp.vehicleId].fuel += amt;
        } else if (exp.type === 'Maintenance') {
          costMap[exp.vehicleId].maintenance += amt;
        } else {
          costMap[exp.vehicleId].tolls += amt;
        }
        costMap[exp.vehicleId].total += amt;
      }
    });

    return Object.entries(costMap).map(([id, data]) => ({
      id,
      ...data
    }));
  };

  const operationalCosts = computeOperationalCosts();

  // Search filters
  const filteredExpenses = expenses.filter(exp => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        exp.vehicleId.toLowerCase().includes(q) ||
        exp.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="view-container">
      <div className="grid-cols-2">
        {/* Left Side: Forms and cost summaries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Form Switch Card */}
          <div className="card card-handdrawn">
            <div style={{ display: 'flex', gap: '8px', padding: '2px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1.5px solid var(--border-color)', borderRadius: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => { setActiveForm('fuel'); setError(''); }}
                className="btn"
                style={{ 
                  flex: 1, 
                  backgroundColor: activeForm === 'fuel' ? 'var(--accent-color)' : 'transparent',
                  color: activeForm === 'fuel' ? 'var(--accent-text)' : 'var(--text-secondary)',
                  boxShadow: 'none',
                  borderRadius: '6px',
                  padding: '8px'
                }}
              >
                <Fuel size={14} />
                <span>Log Fuel</span>
              </button>
              <button 
                onClick={() => { setActiveForm('expense'); setError(''); }}
                className="btn"
                style={{ 
                  flex: 1, 
                  backgroundColor: activeForm === 'expense' ? 'var(--accent-color)' : 'transparent',
                  color: activeForm === 'expense' ? 'var(--accent-text)' : 'var(--text-secondary)',
                  boxShadow: 'none',
                  borderRadius: '6px',
                  padding: '8px'
                }}
              >
                <DollarSign size={14} />
                <span>Add Expense</span>
              </button>
            </div>

            {error && (
              <div className="alert-box alert-danger">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {activeForm === 'fuel' ? (
              <form onSubmit={handleFuelSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Vehicle</label>
                  <select 
                    className="form-select"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.model} ({v.id})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Fuel Volume (Liters)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-input" 
                      placeholder="e.g. 40"
                      value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fuel Cost ({currency})</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 4000"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  <Plus size={16} />
                  <span>Log Fuel Transaction</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleExpenseSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Vehicle</label>
                  <select 
                    className="form-select"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.model} ({v.id})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Expense Category</label>
                    <select 
                      className="form-select"
                      value={expenseType}
                      onChange={(e) => setExpenseType(e.target.value)}
                    >
                      <option value="Tolls">Tolls</option>
                      <option value="Fines">Fines</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Misc">Miscellaneous</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount ({currency})</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 150"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  <Plus size={16} />
                  <span>Log Expense Record</span>
                </button>
              </form>
            )}
          </div>

          {/* Operational Cost per Vehicle */}
          <div className="card card-handdrawn">
            <h3 className="card-title">Per-Vehicle Cost Summary</h3>
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>VEHICLE</th>
                  <th>FUEL COST</th>
                  <th>MAINTENANCE</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {operationalCosts.map(item => (
                  <tr key={item.id}>
                    <td className="td-mono">
                      <strong>{item.model}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({item.id})</span>
                    </td>
                    <td className="td-mono">{formatCurrency(item.fuel)}</td>
                    <td className="td-mono">{formatCurrency(item.maintenance)}</td>
                    <td className="td-mono" style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Expense Log History */}
        <div className="table-container" style={{ height: 'fit-content' }}>
          <div className="table-toolbar">
            <h3 className="card-title" style={{ margin: 0 }}>Transaction Ledger</h3>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>VEHICLE</th>
                <th>DATE</th>
                <th>CATEGORY</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="td-mono" style={{ fontWeight: 'bold' }}>{exp.vehicleId}</td>
                    <td className="td-mono">{exp.date}</td>
                    <td>
                      <select
                        className={`status-select-pill badge ${
                          exp.type === 'Fuel' ? 'badge-on-trip' :
                          exp.type === 'Maintenance' ? 'badge-in-shop' :
                          'badge-retired'
                        }`}
                        value={exp.type}
                        onChange={async (e) => {
                          try {
                            await updateExpenseType(exp.id, e.target.value);
                          } catch (err) {
                            alert(err.message || 'Failed to update expense category');
                          }
                        }}
                      >
                        <option value="Fuel">Fuel</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Tolls">Tolls</option>
                        <option value="Fines">Fines</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Misc">Misc</option>
                      </select>
                    </td>
                    <td className="td-mono" style={{ fontWeight: 'bold' }}>{formatCurrency(exp.amount)}</td>
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

export default FuelExpenseView;
