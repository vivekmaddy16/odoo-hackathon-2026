import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [rbacRules, setRbacRules] = useState({});
  const [depotName, setDepotName] = useState('Gandhinagar Depot GJC');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('to_user');
    return local ? JSON.parse(local) : null;
  });

  // Fetch initial data from Express backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/all`);
        if (!res.ok) throw new Error('Failed to fetch data from backend');
        const data = await res.json();
        
        setVehicles(data.vehicles || []);
        setDrivers(data.drivers || []);
        setTrips(data.trips || []);
        setMaintenanceLogs(data.maintenanceLogs || []);
        setFuelLogs(data.fuelLogs || []);
        setExpenses(data.expenses || []);
        setRbacRules(data.rbacRules || {});
        setDepotName(data.depotName || 'Gandhinagar Depot GJC');
        setCurrency(data.currency || 'INR');
      } catch (err) {
        console.error('Error fetching data from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('to_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('to_user');
    }
  }, [user]);

  const isLicenseExpired = (dateString) => {
    const today = new Date();
    const expiry = new Date(dateString);
    return expiry < today;
  };

  const addVehicle = async (vehicle) => {
    const res = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add vehicle');
    }
    const newVehicle = await res.json();
    setVehicles(prev => [...prev, newVehicle]);
  };

  const deleteVehicle = async (id) => {
    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vehicle');
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const addDriver = async (driver) => {
    const res = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driver)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add driver');
    }
    const newDriver = await res.json();
    setDrivers(prev => [...prev, newDriver]);
  };

  const deleteDriver = async (licenseNo) => {
    const res = await fetch(`${API_BASE_URL}/drivers/${licenseNo}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete driver');
    setDrivers(prev => prev.filter(d => d.licenseNo !== licenseNo));
  };

  const createTrip = async (trip) => {
    const res = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip)
    });
    if (!res.ok) throw new Error('Failed to create trip');
    const newTrip = await res.json();
    setTrips(prev => [...prev, newTrip]);
  };

  const dispatchTrip = async (tripId) => {
    const res = await fetch(`${API_BASE_URL}/trips/${tripId}/dispatch`, { method: 'PUT' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to dispatch trip');
    }
    const updatedTrip = await res.json();
    
    setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));
    setVehicles(prev => prev.map(v => v.id === updatedTrip.vehicleId ? { ...v, status: 'On Trip' } : v));
    setDrivers(prev => prev.map(d => d.name === updatedTrip.driverName ? { ...d, status: 'On Trip' } : d));
  };

  const cancelTrip = async (tripId) => {
    const res = await fetch(`${API_BASE_URL}/trips/${tripId}/cancel`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to cancel trip');
    const updatedTrip = await res.json();
    
    setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));
    
    // Find matching trip to retrieve vehicleId/driverName to reset status to Available locally
    const trip = trips.find(t => t.id === tripId);
    if (trip && trip.status === 'Dispatched') {
      setVehicles(prev => prev.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v));
      setDrivers(prev => prev.map(d => d.name === trip.driverName ? { ...d, status: 'Available' } : d));
    }
  };

  const completeTrip = async (tripId, finalOdometer, fuelLiters, fuelCost, otherExpensesCost) => {
    const res = await fetch(`${API_BASE_URL}/trips/${tripId}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalOdometer, fuelLiters, fuelCost, otherExpensesCost })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to complete trip');
    }
    
    // Sync all state records back from server
    const allRes = await fetch(`${API_BASE_URL}/all`);
    if (allRes.ok) {
      const data = await allRes.json();
      setTrips(data.trips);
      setVehicles(data.vehicles);
      setDrivers(data.drivers);
      setFuelLogs(data.fuelLogs);
      setExpenses(data.expenses);
    }
  };

  const addMaintenanceRecord = async (record) => {
    const res = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to add maintenance record');
    
    const allRes = await fetch(`${API_BASE_URL}/all`);
    if (allRes.ok) {
      const data = await allRes.json();
      setMaintenanceLogs(data.maintenanceLogs);
      setVehicles(data.vehicles);
      setExpenses(data.expenses);
    }
  };

  const closeMaintenanceRecord = async (id) => {
    const res = await fetch(`${API_BASE_URL}/maintenance/${id}/close`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to close maintenance record');
    
    const allRes = await fetch(`${API_BASE_URL}/all`);
    if (allRes.ok) {
      const data = await allRes.json();
      setMaintenanceLogs(data.maintenanceLogs);
      setVehicles(data.vehicles);
    }
  };

  const logDirectFuel = async (vehicleId, date, liters, cost) => {
    const res = await fetch(`${API_BASE_URL}/fuel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, date, liters, cost })
    });
    if (!res.ok) throw new Error('Failed to log fuel');
    
    const allRes = await fetch(`${API_BASE_URL}/all`);
    if (allRes.ok) {
      const data = await allRes.json();
      setFuelLogs(data.fuelLogs);
      setExpenses(data.expenses);
    }
  };

  const logDirectExpense = async (vehicleId, date, type, amount) => {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, date, type, amount })
    });
    if (!res.ok) throw new Error('Failed to log expense');
    
    const allRes = await fetch(`${API_BASE_URL}/all`);
    if (allRes.ok) {
      const data = await allRes.json();
      setExpenses(data.expenses);
    }
  };

  const updateDepotName = async (name) => {
    setDepotName(name);
    await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depotName: name })
    });
  };

  const updateCurrency = async (curr) => {
    setCurrency(curr);
    await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: curr })
    });
  };

  const updateRbacRules = async (rules) => {
    setRbacRules(rules);
    await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rbacRules: rules })
    });
  };

  const updateVehicleStatus = async (id, newStatus) => {
    const res = await fetch(`${API_BASE_URL}/vehicles/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update vehicle status');
    }
    const updated = await res.json();
    setVehicles(prev => prev.map(v => v.id === id ? updated : v));
  };

  const updateDriverStatus = async (licenseNo, newStatus) => {
    const res = await fetch(`${API_BASE_URL}/drivers/${licenseNo}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update driver status');
    }
    const updated = await res.json();
    setDrivers(prev => prev.map(d => d.licenseNo === licenseNo ? updated : d));
  };

  const updateExpenseType = async (id, newType) => {
    const res = await fetch(`${API_BASE_URL}/expenses/${id}/type`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: newType })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update expense category');
    }
    const updated = await res.json();
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
  };

  const updateTripStatus = async (id, newStatus) => {
    const res = await fetch(`${API_BASE_URL}/trips/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update trip status');
    }
    const updated = await res.json();
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
  };

  const hasAccess = (tab) => {
    if (!user) return false;
    const rules = rbacRules[user.role];
    return rules ? rules[tab] : false;
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, reason: data.error };
      }
      const data = await res.json();
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, reason: 'server_error' };
    }
  };

  const register = async (name, email, password, role, roleKey) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, roleKey })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create account');
    }
    const data = await res.json();
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      vehicles,
      drivers,
      trips,
      maintenanceLogs,
      fuelLogs,
      expenses,
      rbacRules,
      setRbacRules: updateRbacRules,
      depotName,
      setDepotName: updateDepotName,
      currency,
      setCurrency: updateCurrency,
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      hasAccess,
      addVehicle,
      deleteVehicle,
      addDriver,
      deleteDriver,
      updateVehicleStatus,
      updateDriverStatus,
      createTrip,
      dispatchTrip,
      cancelTrip,
      completeTrip,
      addMaintenanceRecord,
      closeMaintenanceRecord,
      logDirectFuel,
      logDirectExpense,
      updateExpenseType,
      updateTripStatus,
      isLicenseExpired
    }}>
      {children}
    </AppContext.Provider>
  );
};
