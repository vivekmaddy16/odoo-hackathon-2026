import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express(); // TransitOps Backend Server application
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, roleKey } = req.body;
    
    if (!name || !email || !password || !role || !roleKey) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Role keys are loaded from server environment variables only.
    // They are never exposed in the source code or to the client.
    const ROLE_KEYS = {
      'Fleet Manager':      process.env.ROLE_KEY_FLEET_MANAGER,
      'Dispatcher':         process.env.ROLE_KEY_DISPATCHER,
      'Safety Officer':     process.env.ROLE_KEY_SAFETY_OFFICER,
      'Financial Analyst':  process.env.ROLE_KEY_FINANCIAL_ANALYST,
    };

    if (!ROLE_KEYS[role] || roleKey !== ROLE_KEYS[role]) {
      return res.status(400).json({ error: 'Invalid Role Authorization Key. Please contact admin.' });
    }

    const users = await db.getCollection('users');
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    const newUser = { name, email, password, role };
    users.push(newUser);
    await db.saveCollection('users', users);

    res.status(201).json({ user: { name, email, role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await db.getCollection('users');
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return res.status(400).json({ error: 'incorrect_password' });
      }
      return res.status(400).json({ error: 'account_not_found' });
    }

    res.json({ user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all collections for initial loading
app.get('/api/all', async (req, res) => {
  try {
    const vehicles = await db.getCollection('vehicles');
    const drivers = await db.getCollection('drivers');
    const trips = await db.getCollection('trips');
    const maintenanceLogs = await db.getCollection('maintenanceLogs');
    const fuelLogs = await db.getCollection('fuelLogs');
    const expenses = await db.getCollection('expenses');
    const rbacRules = await db.getCollection('rbacRules');
    const depotName = await db.getCollection('depotName');
    const currency = await db.getCollection('currency');

    res.json({
      vehicles,
      drivers,
      trips,
      maintenanceLogs,
      fuelLogs,
      expenses,
      rbacRules,
      depotName,
      currency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting variables
app.post('/api/settings', async (req, res) => {
  try {
    const { depotName, currency, rbacRules } = req.body;
    if (depotName !== undefined) await db.saveCollection('depotName', depotName);
    if (currency !== undefined) await db.saveCollection('currency', currency);
    if (rbacRules !== undefined) await db.saveCollection('rbacRules', rbacRules);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicles REST API
app.get('/api/vehicles', async (req, res) => {
  try {
    const list = await db.getCollection('vehicles');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const list = await db.getCollection('vehicles');
    const vehicle = req.body;
    if (list.some(v => v.id.toLowerCase() === vehicle.id.toLowerCase())) {
      return res.status(400).json({ error: 'Vehicle Registration Number must be unique.' });
    }
    const newVehicle = { ...vehicle, status: 'Available' };
    list.push(newVehicle);
    await db.saveCollection('vehicles', list);
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    let list = await db.getCollection('vehicles');
    list = list.filter(v => v.id !== req.params.id);
    await db.saveCollection('vehicles', list);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Drivers REST API
app.get('/api/drivers', async (req, res) => {
  try {
    const list = await db.getCollection('drivers');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const list = await db.getCollection('drivers');
    const driver = req.body;
    if (list.some(d => d.licenseNo.toLowerCase() === driver.licenseNo.toLowerCase())) {
      return res.status(400).json({ error: 'Driver License Number must be unique.' });
    }
    const newDriver = { ...driver, status: 'Available' };
    list.push(newDriver);
    await db.saveCollection('drivers', list);
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/drivers/:licenseNo', async (req, res) => {
  try {
    let list = await db.getCollection('drivers');
    list = list.filter(d => d.licenseNo !== req.params.licenseNo);
    await db.saveCollection('drivers', list);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trips API
app.get('/api/trips', async (req, res) => {
  try {
    const list = await db.getCollection('trips');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const list = await db.getCollection('trips');
    const trip = req.body;
    const newTrip = {
      ...trip,
      id: `TR${String(list.length + 1).padStart(3, '0')}`,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    list.push(newTrip);
    await db.saveCollection('trips', list);
    res.status(201).json(newTrip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/trips/:id/dispatch', async (req, res) => {
  try {
    const trips = await db.getCollection('trips');
    const vehicles = await db.getCollection('vehicles');
    const drivers = await db.getCollection('drivers');

    const tripIndex = trips.findIndex(t => t.id === req.params.id);
    if (tripIndex === -1) return res.status(404).json({ error: 'Trip not found.' });

    const trip = trips[tripIndex];
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.name === trip.driverName);

    if (!vehicle || !driver) {
      return res.status(400).json({ error: 'Vehicle or driver associated with trip not found.' });
    }

    if (vehicle.status !== 'Available') {
      return res.status(400).json({ error: `Vehicle ${vehicle.model} (${vehicle.id}) is not Available.` });
    }
    if (driver.status !== 'Available') {
      return res.status(400).json({ error: `Driver ${driver.name} is not Available.` });
    }
    if (new Date(driver.expiryDate) < new Date()) {
      return res.status(400).json({ error: `Driver ${driver.name} has an expired driving license.` });
    }
    if (driver.status === 'Suspended') {
      return res.status(400).json({ error: `Driver ${driver.name} is currently Suspended.` });
    }
    if (trip.cargoWeight > vehicle.capacity) {
      return res.status(400).json({ error: `Cargo Weight (${trip.cargoWeight} kg) exceeds vehicle's maximum load capacity (${vehicle.capacity} kg).` });
    }

    // Update statuses
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
    trip.status = 'Dispatched';
    trip.odometerStart = vehicle.odometer;

    await db.saveCollection('trips', trips);
    await db.saveCollection('vehicles', vehicles);
    await db.saveCollection('drivers', drivers);

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/trips/:id/cancel', async (req, res) => {
  try {
    const trips = await db.getCollection('trips');
    const vehicles = await db.getCollection('vehicles');
    const drivers = await db.getCollection('drivers');

    const trip = trips.find(t => t.id === req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    if (trip.status === 'Dispatched') {
      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const driver = drivers.find(d => d.name === trip.driverName);
      if (vehicle) vehicle.status = 'Available';
      if (driver) driver.status = 'Available';
    }

    trip.status = 'Cancelled';

    await db.saveCollection('trips', trips);
    await db.saveCollection('vehicles', vehicles);
    await db.saveCollection('drivers', drivers);

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/trips/:id/complete', async (req, res) => {
  try {
    const trips = await db.getCollection('trips');
    const vehicles = await db.getCollection('vehicles');
    const drivers = await db.getCollection('drivers');
    const fuelLogs = await db.getCollection('fuelLogs');
    const expenses = await db.getCollection('expenses');

    const trip = trips.find(t => t.id === req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    const { finalOdometer, fuelLiters, fuelCost, otherExpensesCost } = req.body;

    if (Number(finalOdometer) < trip.odometerStart) {
      return res.status(400).json({ error: `Final Odometer (${finalOdometer}) cannot be less than Start Odometer (${trip.odometerStart}).` });
    }

    const distanceTraveled = Number(finalOdometer) - trip.odometerStart;
    const today = new Date().toISOString().split('T')[0];

    if (Number(fuelLiters) > 0) {
      const fuelLogId = `F${String(fuelLogs.length + 1).padStart(3, '0')}`;
      fuelLogs.push({
        id: fuelLogId,
        vehicleId: trip.vehicleId,
        date: today,
        liters: Number(fuelLiters),
        cost: Number(fuelCost)
      });

      expenses.push({
        id: `E${String(expenses.length + 1).padStart(3, '0')}`,
        vehicleId: trip.vehicleId,
        date: today,
        type: 'Fuel',
        amount: Number(fuelCost)
      });
    }

    if (Number(otherExpensesCost) > 0) {
      expenses.push({
        id: `E${String(expenses.length + 1).padStart(3, '0')}`,
        vehicleId: trip.vehicleId,
        date: today,
        type: 'Tolls',
        amount: Number(otherExpensesCost)
      });
    }

    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.name === trip.driverName);

    if (vehicle) {
      vehicle.odometer = Number(finalOdometer);
      vehicle.status = 'Available';
    }
    if (driver) {
      driver.status = 'Available';
    }

    trip.status = 'Completed';
    trip.odometerEnd = Number(finalOdometer);
    trip.distance = distanceTraveled;
    trip.fuelConsumed = Number(fuelLiters);
    trip.fuelCost = Number(fuelCost);
    trip.otherExpenses = Number(otherExpensesCost);
    trip.completedAt = today;

    await db.saveCollection('trips', trips);
    await db.saveCollection('vehicles', vehicles);
    await db.saveCollection('drivers', drivers);
    await db.saveCollection('fuelLogs', fuelLogs);
    await db.saveCollection('expenses', expenses);

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Maintenance API
app.post('/api/maintenance', async (req, res) => {
  try {
    const list = await db.getCollection('maintenanceLogs');
    const vehicles = await db.getCollection('vehicles');
    const expenses = await db.getCollection('expenses');

    const record = req.body;
    const newRecord = {
      ...record,
      id: `M${String(list.length + 1).padStart(3, '0')}`,
      status: 'Active'
    };

    list.push(newRecord);

    const vehicle = vehicles.find(v => v.id === record.vehicleId);
    if (vehicle) vehicle.status = 'In Shop';

    expenses.push({
      id: `E${String(expenses.length + 1).padStart(3, '0')}`,
      vehicleId: record.vehicleId,
      date: record.date,
      type: 'Maintenance',
      amount: Number(record.cost)
    });

    await db.saveCollection('maintenanceLogs', list);
    await db.saveCollection('vehicles', vehicles);
    await db.saveCollection('expenses', expenses);

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/maintenance/:id/close', async (req, res) => {
  try {
    const list = await db.getCollection('maintenanceLogs');
    const vehicles = await db.getCollection('vehicles');

    const record = list.find(m => m.id === req.params.id);
    if (!record) return res.status(404).json({ error: 'Maintenance record not found.' });

    record.status = 'Completed';

    const vehicle = vehicles.find(v => v.id === record.vehicleId);
    if (vehicle) {
      vehicle.status = vehicle.status === 'Retired' ? 'Retired' : 'Available';
    }

    await db.saveCollection('maintenanceLogs', list);
    await db.saveCollection('vehicles', vehicles);

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fuel and Expense API (Direct logging)
app.post('/api/fuel', async (req, res) => {
  try {
    const fuelLogs = await db.getCollection('fuelLogs');
    const expenses = await db.getCollection('expenses');

    const { vehicleId, date, liters, cost } = req.body;

    const newFuelLog = {
      id: `F${String(fuelLogs.length + 1).padStart(3, '0')}`,
      vehicleId,
      date,
      liters: Number(liters),
      cost: Number(cost)
    };
    fuelLogs.push(newFuelLog);

    expenses.push({
      id: `E${String(expenses.length + 1).padStart(3, '0')}`,
      vehicleId,
      date,
      type: 'Fuel',
      amount: Number(cost)
    });

    await db.saveCollection('fuelLogs', fuelLogs);
    await db.saveCollection('expenses', expenses);

    res.status(201).json(newFuelLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expenses = await db.getCollection('expenses');
    const { vehicleId, date, type, amount } = req.body;

    const newExpense = {
      id: `E${String(expenses.length + 1).padStart(3, '0')}`,
      vehicleId,
      date,
      type,
      amount: Number(amount)
    };
    expenses.push(newExpense);

    await db.saveCollection('expenses', expenses);

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/vehicles/:id/status', async (req, res) => {
  try {
    const list = await db.getCollection('vehicles');
    const vehicle = list.find(v => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    vehicle.status = req.body.status;
    await db.saveCollection('vehicles', list);
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/drivers/:licenseNo/status', async (req, res) => {
  try {
    const list = await db.getCollection('drivers');
    const driver = list.find(d => d.licenseNo === req.params.licenseNo);
    if (!driver) return res.status(404).json({ error: 'Driver not found.' });

    driver.status = req.body.status;
    await db.saveCollection('drivers', list);
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id/type', async (req, res) => {
  try {
    const list = await db.getCollection('expenses');
    const expense = list.find(e => e.id === req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense record not found.' });

    expense.type = req.body.type;
    await db.saveCollection('expenses', list);
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/trips/:id/status', async (req, res) => {
  try {
    const list = await db.getCollection('trips');
    const trip = list.find(t => t.id === req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    trip.status = req.body.status;
    await db.saveCollection('trips', list);
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize MongoDB database:', err);
  process.exit(1);
});
