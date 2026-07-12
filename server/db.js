import fs from 'fs/promises';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Load env configuration
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const INITIAL_DATA = {
  vehicles: [
    { id: 'GJ01AB4521', model: 'VAN-05', type: 'Van', capacity: 500, odometer: 74000, acqCost: 620000, status: 'Available', region: 'West' },
    { id: 'GJ01AB9981', model: 'TRUCK-11', type: 'Truck', capacity: 5000, odometer: 182000, acqCost: 2450000, status: 'On Trip', region: 'North' },
    { id: 'GJ01AB1120', model: 'MINI-03', type: 'Mini', capacity: 1000, odometer: 66000, acqCost: 410000, status: 'In Shop', region: 'South' },
    { id: 'GJ01AB0081', model: 'VAN-09', type: 'Van', capacity: 750, odometer: 241900, acqCost: 590000, status: 'Retired', region: 'East' }
  ],
  drivers: [
    { name: 'Alex', licenseNo: 'DL-88213', category: 'LMV', expiryDate: '2029-12-31', contact: '9876543210', safetyScore: 96, status: 'Available' },
    { name: 'John', licenseNo: 'DL-44120', category: 'HMV', expiryDate: '2025-03-15', contact: '9822088334', safetyScore: 81, status: 'Suspended' },
    { name: 'Priya', licenseNo: 'DL-77031', category: 'LMV', expiryDate: '2027-08-20', contact: '9911029384', safetyScore: 99, status: 'On Trip' },
    { name: 'Suresh', licenseNo: 'DL-90045', category: 'HMV', expiryDate: '2027-01-10', contact: '9744019283', safetyScore: 88, status: 'Available' }
  ],
  trips: [
    { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: 'GJ01AB4521', driverName: 'Alex', cargoWeight: 450, distance: 38, status: 'Completed', odometerStart: 73962, odometerEnd: 74000, fuelConsumed: 4.5, fuelCost: 450, otherExpenses: 150, createdAt: '2026-07-10', completedAt: '2026-07-10' },
    { id: 'TR002', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleId: 'GJ01AB9981', driverName: 'Priya', cargoWeight: 3200, distance: 45, status: 'Dispatched', odometerStart: 181955, createdAt: '2026-07-12' },
    { id: 'TR003', source: 'Mansa', destination: 'Kalol Depot', vehicleId: 'GJ01AB1120', driverName: 'Suresh', cargoWeight: 800, distance: 25, status: 'Draft', createdAt: '2026-07-12' }
  ],
  maintenanceLogs: [
    { id: 'M001', vehicleId: 'GJ01AB1120', serviceType: 'Oil Change', cost: 2500, date: '2026-07-07', status: 'Active' },
    { id: 'M002', vehicleId: 'GJ01AB4521', serviceType: 'Tire Rotation', cost: 1200, date: '2026-07-01', status: 'Completed' }
  ],
  fuelLogs: [
    { id: 'F001', vehicleId: 'GJ01AB4521', date: '2026-07-10', liters: 4.5, cost: 450 }
  ],
  expenses: [
    { id: 'E001', vehicleId: 'GJ01AB4521', date: '2026-07-10', type: 'Fuel', amount: 450 },
    { id: 'E002', vehicleId: 'GJ01AB4521', date: '2026-07-10', type: 'Tolls', amount: 150 },
    { id: 'E003', vehicleId: 'GJ01AB1120', date: '2026-07-07', type: 'Maintenance', amount: 2500 },
    { id: 'E004', vehicleId: 'GJ01AB4521', date: '2026-07-01', type: 'Maintenance', amount: 1200 }
  ],
  users: [
    { email: 'fleet@transitops.in', password: 'Fleet@123', role: 'Fleet Manager', name: 'Fleet Manager' },
    { email: 'dispatcher@transitops.in', password: 'Dispatch@123', role: 'Dispatcher', name: 'Dispatcher' },
    { email: 'safety@transitops.in', password: 'Safety@123', role: 'Safety Officer', name: 'Safety Officer' },
    { email: 'finance@transitops.in', password: 'Finance@123', role: 'Financial Analyst', name: 'Finance Analyst' }
  ],
  rbacRules: {
    'Fleet Manager': { dashboard: false, fleet: true, drivers: false, trips: false, maintenance: true, fuel: false, analytics: false, settings: true },
    'Dispatcher': { dashboard: true, fleet: false, drivers: false, trips: true, maintenance: false, fuel: false, analytics: false, settings: false },
    'Safety Officer': { dashboard: false, fleet: false, drivers: true, trips: false, maintenance: false, fuel: false, analytics: false, settings: false },
    'Financial Analyst': { dashboard: false, fleet: false, drivers: false, trips: false, maintenance: false, fuel: true, analytics: true, settings: false }
  },
  depotName: 'Gandhinagar Depot GJC',
  currency: 'INR'
};

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.mode = 'json'; // default fallback mode
    this.jsonData = null;
  }

  async init() {
    if (MONGODB_URI) {
      console.log(`Attempting MongoDB Atlas connection: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`);
      try {
        this.client = new MongoClient(MONGODB_URI, {
          serverSelectionTimeoutMS: 2000, // Wait maximum 2s to prevent slow server restarts
          connectTimeoutMS: 2000
        });
        await this.client.connect();
        this.db = this.client.db();
        this.mode = 'mongo';
        console.log('Successfully connected and verified MongoDB Atlas storage.');
      } catch (err) {
        console.warn('MongoDB Atlas connection failed. Falling back to local db.json file storage.');
        this.mode = 'json';
      }
    } else {
      console.log('No MONGODB_URI environment variable detected. Defaulting to local db.json file storage.');
      this.mode = 'json';
    }

    if (this.mode === 'mongo') {
      await this.initMongo();
    } else {
      await this.initJson();
    }
  }

  async initMongo() {
    const seedIfEmpty = async (collectionName, initialData) => {
      const collection = this.db.collection(collectionName);
      const count = await collection.countDocuments();
      if (count === 0) {
        console.log(`Seeding empty collection: ${collectionName}`);
        await collection.insertMany(initialData);
      }
    };

    try {
      await seedIfEmpty('vehicles', INITIAL_DATA.vehicles);
      await seedIfEmpty('drivers', INITIAL_DATA.drivers);
      await seedIfEmpty('trips', INITIAL_DATA.trips);
      await seedIfEmpty('maintenanceLogs', INITIAL_DATA.maintenanceLogs);
      await seedIfEmpty('fuelLogs', INITIAL_DATA.fuelLogs);
      await seedIfEmpty('expenses', INITIAL_DATA.expenses);
      await seedIfEmpty('users', INITIAL_DATA.users);

      // Seed settings collection
      const settingsCollection = this.db.collection('settings');
      const settingsCount = await settingsCollection.countDocuments();
      if (settingsCount === 0) {
        console.log('Seeding settings keys...');
        await settingsCollection.insertOne({ _id: 'rbacRules', value: INITIAL_DATA.rbacRules });
        await settingsCollection.insertOne({ _id: 'depotName', value: INITIAL_DATA.depotName });
        await settingsCollection.insertOne({ _id: 'currency', value: INITIAL_DATA.currency });
      }
      console.log('MongoDB initialization and checks completed.');
    } catch (error) {
      console.error('Error seeding initial data to MongoDB:', error);
    }
  }

  async initJson() {
    try {
      const fileContent = await fs.readFile(DB_FILE, 'utf-8');
      this.jsonData = JSON.parse(fileContent);
      console.log('Successfully loaded local JSON database (db.json).');
    } catch (error) {
      this.jsonData = { ...INITIAL_DATA };
      await this.saveJson();
      console.log('Created local JSON database file (db.json) with initial seeds.');
    }
  }

  async saveJson() {
    await fs.writeFile(DB_FILE, JSON.stringify(this.jsonData, null, 2), 'utf-8');
  }

  async getCollection(name) {
    if (this.mode === 'mongo') {
      if (['rbacRules', 'depotName', 'currency'].includes(name)) {
        const doc = await this.db.collection('settings').findOne({ _id: name });
        return doc ? doc.value : INITIAL_DATA[name];
      }
      const list = await this.db.collection(name).find({}).toArray();
      return list.map(({ _id, ...rest }) => rest);
    } else {
      if (!this.jsonData) await this.initJson();
      return this.jsonData[name];
    }
  }

  async saveCollection(name, collectionData) {
    if (this.mode === 'mongo') {
      if (['rbacRules', 'depotName', 'currency'].includes(name)) {
        await this.db.collection('settings').updateOne(
          { _id: name },
          { $set: { value: collectionData } },
          { upsert: true }
        );
        return;
      }
      const cleaned = collectionData.map(({ _id, ...rest }) => rest);
      await this.db.collection(name).deleteMany({});
      if (cleaned.length > 0) {
        await this.db.collection(name).insertMany(cleaned);
      }
    } else {
      if (!this.jsonData) await this.initJson();
      this.jsonData[name] = collectionData;
      await this.saveJson();
    }
  }
}

const db = new Database();
export default db;
