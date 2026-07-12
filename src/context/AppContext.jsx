import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const INITIAL_VEHICLES = [
  { id: 'GJ01AB4521', model: 'VAN-05', type: 'Van', capacity: 500, odometer: 74000, acqCost: 620000, status: 'Available', region: 'West' },
  { id: 'GJ01AB9981', model: 'TRUCK-11', type: 'Truck', capacity: 5000, odometer: 182000, acqCost: 2450000, status: 'On Trip', region: 'North' },
  { id: 'GJ01AB1120', model: 'MINI-03', type: 'Mini', capacity: 1000, odometer: 66000, acqCost: 410000, status: 'In Shop', region: 'South' },
  { id: 'GJ01AB0081', model: 'VAN-09', type: 'Van', capacity: 750, odometer: 241900, acqCost: 590000, status: 'Retired', region: 'East' }
];

const INITIAL_DRIVERS = [
  { name: 'Alex', licenseNo: 'DL-88213', category: 'LMV', expiryDate: '2029-12-31', contact: '9876543210', safetyScore: 96, status: 'Available' },
  { name: 'John', licenseNo: 'DL-44120', category: 'HMV', expiryDate: '2025-03-15', contact: '9822088334', safetyScore: 81, status: 'Suspended' },
  { name: 'Priya', licenseNo: 'DL-77031', category: 'LMV', expiryDate: '2027-08-20', contact: '9911029384', safetyScore: 99, status: 'On Trip' },
  { name: 'Suresh', licenseNo: 'DL-90045', category: 'HMV', expiryDate: '2027-01-10', contact: '9744019283', safetyScore: 88, status: 'Available' }
];

const INITIAL_TRIPS = [
  { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: 'GJ01AB4521', driverName: 'Alex', cargoWeight: 450, distance: 38, status: 'Completed', odometerStart: 73962, odometerEnd: 74000, fuelConsumed: 4.5, fuelCost: 450, otherExpenses: 150, createdAt: '2026-07-10', completedAt: '2026-07-10' },
  { id: 'TR002', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleId: 'GJ01AB9981', driverName: 'Priya', cargoWeight: 3200, distance: 45, status: 'Dispatched', odometerStart: 181955, createdAt: '2026-07-12' },
  { id: 'TR003', source: 'Mansa', destination: 'Kalol Depot', vehicleId: 'GJ01AB1120', driverName: 'Suresh', cargoWeight: 800, distance: 25, status: 'Draft', createdAt: '2026-07-12' }
];

const INITIAL_MAINTENANCE = [
  { id: 'M001', vehicleId: 'GJ01AB1120', serviceType: 'Oil Change', cost: 2500, date: '2026-07-07', status: 'Active' },
  { id: 'M002', vehicleId: 'GJ01AB4521', serviceType: 'Tire Rotation', cost: 1200, date: '2026-07-01', status: 'Completed' }
];

const INITIAL_FUEL_LOGS = [
  { id: 'F001', vehicleId: 'GJ01AB4521', date: '2026-07-10', liters: 4.5, cost: 450 }
];

const INITIAL_EXPENSES = [
  { id: 'E001', vehicleId: 'GJ01AB4521', date: '2026-07-10', type: 'Fuel', amount: 450 },
  { id: 'E002', vehicleId: 'GJ01AB4521', date: '2026-07-10', type: 'Tolls', amount: 150 },
  { id: 'E003', vehicleId: 'GJ01AB1120', date: '2026-07-07', type: 'Maintenance', amount: 2500 },
  { id: 'E004', vehicleId: 'GJ01AB4521', date: '2026-07-01', type: 'Maintenance', amount: 1200 }
];

const INITIAL_RBAC_RULES = {
  'Fleet Manager': { dashboard: false, fleet: true, drivers: false, trips: false, maintenance: true, fuel: false, analytics: false, settings: true },
  'Dispatcher': { dashboard: true, fleet: false, drivers: false, trips: true, maintenance: false, fuel: false, analytics: false, settings: false },
  'Safety Officer': { dashboard: false, fleet: false, drivers: true, trips: false, maintenance: false, fuel: false, analytics: false, settings: false },
  'Financial Analyst': { dashboard: false, fleet: false, drivers: false, trips: false, maintenance: false, fuel: true, analytics: true, settings: false }
};

export const AppProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState(() => {
    const local = localStorage.getItem('to_vehicles');
    return local ? JSON.parse(local) : INITIAL_VEHICLES;
  });

  const [drivers, setDrivers] = useState(() => {
    const local = localStorage.getItem('to_drivers');
    return local ? JSON.parse(local) : INITIAL_DRIVERS;
  });

  const [trips, setTrips] = useState(() => {
    const local = localStorage.getItem('to_trips');
    return local ? JSON.parse(local) : INITIAL_TRIPS;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState(() => {
    const local = localStorage.getItem('to_maintenance');
    return local ? JSON.parse(local) : INITIAL_MAINTENANCE;
  });

  const [fuelLogs, setFuelLogs] = useState(() => {
    const local = localStorage.getItem('to_fuel');
    return local ? JSON.parse(local) : INITIAL_FUEL_LOGS;
  });

  const [expenses, setExpenses] = useState(() => {
    const local = localStorage.getItem('to_expenses');
    return local ? JSON.parse(local) : INITIAL_EXPENSES;
  });

  const [rbacRules, setRbacRules] = useState(() => {
    const local = localStorage.getItem('to_rbac_rules');
    return local ? JSON.parse(local) : INITIAL_RBAC_RULES;
  });

  const [depotName, setDepotName] = useState(() => localStorage.getItem('to_depot_name') || 'Gandhinagar Depot GJC');
  const [currency, setCurrency] = useState(() => localStorage.getItem('to_currency') || 'INR');

  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('to_user');
    return local ? JSON.parse(local) : null;
  });

  useEffect(() => {
    localStorage.setItem('to_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('to_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('to_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('to_maintenance', JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem('to_fuel', JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem('to_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('to_rbac_rules', JSON.stringify(rbacRules));
  }, [rbacRules]);

  useEffect(() => {
    localStorage.setItem('to_depot_name', depotName);
  }, [depotName]);

  useEffect(() => {
    localStorage.setItem('to_currency', currency);
  }, [currency]);

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

  const addVehicle = (vehicle) => {
    if (vehicles.some(v => v.id.toLowerCase() === vehicle.id.toLowerCase())) {
      throw new Error('Vehicle Registration Number must be unique.');
    }
    setVehicles([...vehicles, { ...vehicle, status: 'Available' }]);
  };

  const deleteVehicle = (id) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const addDriver = (driver) => {
    if (drivers.some(d => d.licenseNo.toLowerCase() === driver.licenseNo.toLowerCase())) {
      throw new Error('Driver License Number must be unique.');
    }
    setDrivers([...drivers, { ...driver, status: 'Available' }]);
  };

  const deleteDriver = (licenseNo) => {
    setDrivers(drivers.filter(d => d.licenseNo !== licenseNo));
  };

  const createTrip = (trip) => {
    const newTrip = {
      ...trip,
      id: `TR${String(trips.length + 1).padStart(3, '0')}`,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTrips([...trips, newTrip]);
  };

  const dispatchTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.name === trip.driverName);

    if (vehicle.status !== 'Available') {
      throw new Error(`Vehicle ${vehicle.model} (${vehicle.id}) is not Available.`);
    }
    if (driver.status !== 'Available') {
      throw new Error(`Driver ${driver.name} is not Available.`);
    }
    if (isLicenseExpired(driver.expiryDate)) {
      throw new Error(`Driver ${driver.name} has an expired driving license.`);
    }
    if (driver.status === 'Suspended') {
      throw new Error(`Driver ${driver.name} is currently Suspended.`);
    }

    if (trip.cargoWeight > vehicle.capacity) {
      throw new Error(`Cargo Weight (${trip.cargoWeight} kg) exceeds vehicle's maximum load capacity (${vehicle.capacity} kg).`);
    }

    setVehicles(vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v));
    setDrivers(drivers.map(d => d.name === trip.driverName ? { ...d, status: 'On Trip' } : d));
    setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'Dispatched', odometerStart: vehicle.odometer } : t));
  };

  const cancelTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    if (trip.status === 'Dispatched') {
      setVehicles(vehicles.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v));
      setDrivers(drivers.map(d => d.name === trip.driverName ? { ...d, status: 'Available' } : d));
    }
    setTrips(trips.map(t => t.id === tripId ? { ...t, status: 'Cancelled' } : t));
  };

  const completeTrip = (tripId, finalOdometer, fuelLiters, fuelCost, otherExpensesCost) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    if (finalOdometer < trip.odometerStart) {
      throw new Error(`Final Odometer (${finalOdometer}) cannot be less than Start Odometer (${trip.odometerStart}).`);
    }

    const distanceTraveled = finalOdometer - trip.odometerStart;

    let fuelLogId = null;
    if (fuelLiters > 0) {
      fuelLogId = `F${String(fuelLogs.length + 1).padStart(3, '0')}`;
      const newFuelLog = {
        id: fuelLogId,
        vehicleId: trip.vehicleId,
        date: new Date().toISOString().split('T')[0],
        liters: Number(fuelLiters),
        cost: Number(fuelCost)
      };
      setFuelLogs(prev => [...prev, newFuelLog]);

      setExpenses(prev => [...prev, {
        id: `E${String(prev.length + 1).padStart(3, '0')}`,
        vehicleId: trip.vehicleId,
        date: new Date().toISOString().split('T')[0],
        type: 'Fuel',
        amount: Number(fuelCost)
      }]);
    }

    if (otherExpensesCost > 0) {
      setExpenses(prev => [...prev, {
        id: `E${String(prev.length + 1).padStart(3, '0')}`,
        vehicleId: trip.vehicleId,
        date: new Date().toISOString().split('T')[0],
        type: 'Tolls',
        amount: Number(otherExpensesCost)
      }]);
    }

    setVehicles(vehicles.map(v => v.id === trip.vehicleId ? { ...v, odometer: Number(finalOdometer), status: 'Available' } : v));
    setDrivers(drivers.map(d => d.name === trip.driverName ? { ...d, status: 'Available' } : d));

    setTrips(trips.map(t => t.id === tripId ? {
      ...t,
      status: 'Completed',
      odometerEnd: Number(finalOdometer),
      distance: distanceTraveled,
      fuelConsumed: Number(fuelLiters),
      fuelCost: Number(fuelCost),
      otherExpenses: Number(otherExpensesCost),
      completedAt: new Date().toISOString().split('T')[0]
    } : t));
  };

  const addMaintenanceRecord = (record) => {
    const newRecord = {
      ...record,
      id: `M${String(maintenanceLogs.length + 1).padStart(3, '0')}`,
      status: 'Active'
    };
    setMaintenanceLogs([...maintenanceLogs, newRecord]);

    setVehicles(vehicles.map(v => v.id === record.vehicleId ? { ...v, status: 'In Shop' } : v));

    setExpenses(prev => [...prev, {
      id: `E${String(prev.length + 1).padStart(3, '0')}`,
      vehicleId: record.vehicleId,
      date: record.date,
      type: 'Maintenance',
      amount: Number(record.cost)
    }]);
  };

  const closeMaintenanceRecord = (id) => {
    const record = maintenanceLogs.find(m => m.id === id);
    if (!record) return;

    setMaintenanceLogs(maintenanceLogs.map(m => m.id === id ? { ...m, status: 'Completed' } : m));

    setVehicles(vehicles.map(v => {
      if (v.id === record.vehicleId) {
        return { ...v, status: v.status === 'Retired' ? 'Retired' : 'Available' };
      }
      return v;
    }));
  };

  const logDirectFuel = (vehicleId, date, liters, cost) => {
    const newFuelLog = {
      id: `F${String(fuelLogs.length + 1).padStart(3, '0')}`,
      vehicleId,
      date,
      liters: Number(liters),
      cost: Number(cost)
    };
    setFuelLogs([...fuelLogs, newFuelLog]);

    setExpenses(prev => [...prev, {
      id: `E${String(prev.length + 1).padStart(3, '0')}`,
      vehicleId,
      date,
      type: 'Fuel',
      amount: Number(cost)
    }]);
  };

  const logDirectExpense = (vehicleId, date, type, amount) => {
    const newExpense = {
      id: `E${String(expenses.length + 1).padStart(3, '0')}`,
      vehicleId,
      date,
      type,
      amount: Number(amount)
    };
    setExpenses([...expenses, newExpense]);
  };

  const hasAccess = (tab) => {
    if (!user) return false;
    const rules = rbacRules[user.role];
    return rules ? rules[tab] : false;
  };

  // Predefined role-based accounts with unique credentials
  const ACCOUNTS = [
    { email: 'fleet@transitops.in', password: 'Fleet@123', role: 'Fleet Manager', name: 'Fleet Manager' },
    { email: 'dispatcher@transitops.in', password: 'Dispatch@123', role: 'Dispatcher', name: 'Dispatcher' },
    { email: 'safety@transitops.in', password: 'Safety@123', role: 'Safety Officer', name: 'Safety Officer' },
    { email: 'finance@transitops.in', password: 'Finance@123', role: 'Financial Analyst', name: 'Finance Analyst' },
  ];

  const login = (email, password) => {
    const account = ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (account) {
      setUser({ email: account.email, role: account.role, name: account.name });
      return { success: true };
    }
    // Check if email exists but password is wrong
    const emailExists = ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, reason: 'incorrect_password' };
    }
    return { success: false, reason: 'account_not_found' };
  };

  // Quick demo login (for hackathon judges)
  const demoLogin = (role) => {
    const account = ACCOUNTS.find(a => a.role === role);
    if (account) {
      setUser({ email: account.email, role: account.role, name: account.name });
      return true;
    }
    return false;
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
      setRbacRules,
      depotName,
      setDepotName,
      currency,
      setCurrency,
      user,
      setUser,
      login,
      demoLogin,
      logout,
      hasAccess,
      addVehicle,
      deleteVehicle,
      addDriver,
      deleteDriver,
      createTrip,
      dispatchTrip,
      cancelTrip,
      completeTrip,
      addMaintenanceRecord,
      closeMaintenanceRecord,
      logDirectFuel,
      logDirectExpense,
      isLicenseExpired
    }}>
      {children}
    </AppContext.Provider>
  );
};
