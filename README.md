# 🚌 TransitOps — Fleet & Transport Management System

> **Odoo Hackathon 2026** — A full-stack web application for managing transport fleets, drivers, trips, maintenance, and expenses with role-based access control.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Roles & Access Control (RBAC)](#roles--access-control-rbac)
- [Screens](#screens)

---

## Overview

TransitOps is a comprehensive fleet management platform built for transport operators. It provides real-time visibility into vehicle status, driver assignments, trip dispatching, maintenance scheduling, and financial analytics — all secured behind a role-based access control system.

---

## Features

| Module | Description |
|---|---|
| 🔐 **Authentication** | Secure login & role-gated registration with admin-issued role keys |
| 📊 **Dashboard** | Live KPIs — active trips, fleet utilization, upcoming maintenance, cost summary |
| 🚛 **Fleet Registry** | Add, view, retire vehicles; track status (Available / On Trip / In Shop / Retired) |
| 👤 **Drivers & Safety** | Manage driver profiles, license expiry tracking, suspend/activate drivers |
| 🗺️ **Trip Dispatching** | Create trips, dispatch with safety validations, complete with odometer & fuel data |
| 🔧 **Maintenance** | Log maintenance jobs, auto-set vehicle to "In Shop", close jobs to restore availability |
| ⛽ **Fuel & Expense** | Log fuel fills and ad-hoc expenses; view per-vehicle cost breakdown |
| 📈 **Reports & Analytics** | Visual charts — monthly expenses, fleet utilization, cost breakdown by category |
| ⚙️ **Settings & RBAC** | Configure depot name, currency, and per-role module permissions |

---

## Tech Stack

### Frontend
- **React 19** — UI library
- **Vite 8** — Build tool & dev server
- **ECharts** (`echarts-for-react`) — Charts & analytics visualizations
- **Lucide React** — Icon set
- **Vanilla CSS** — Custom design system (dark/light mode ready)

### Backend
- **Node.js + Express** — REST API server (port `5000`)
- **MongoDB** — Persistent data store via `db.js`
- **Concurrently** — Runs client & server together in dev

---

## Project Structure

```
odoo-hackathon-2026/
├── src/
│   ├── App.jsx                  # Root app, routing logic
│   ├── main.jsx                 # Entry point
│   ├── index.css                # Global design system & CSS variables
│   ├── context/
│   │   └── AppContext.jsx       # Global state, API calls, RBAC helpers
│   └── components/
│       ├── LoginScreen.jsx      # Auth — login & registration
│       ├── Sidebar.jsx          # Navigation sidebar
│       ├── Topbar.jsx           # Top bar with search & role switcher
│       ├── DashboardView.jsx    # KPI dashboard
│       ├── FleetView.jsx        # Vehicle registry
│       ├── DriversView.jsx      # Driver profiles & safety
│       ├── TripsView.jsx        # Trip dispatching workflow
│       ├── MaintenanceView.jsx  # Maintenance job tracker
│       ├── FuelExpenseView.jsx  # Fuel & expense management
│       ├── AnalyticsView.jsx    # Reports & charts
│       └── SettingsView.jsx     # Settings & RBAC configuration
├── server/
│   ├── server.js                # Express REST API
│   ├── db.js                    # MongoDB connection & helpers
│   └── package.json             # Server dependencies
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or connection string configured)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/transitops

# Role Authorization Keys (set these to any secret strings)
ROLE_KEY_FLEET_MANAGER=your_fleet_manager_key
ROLE_KEY_DISPATCHER=your_dispatcher_key
ROLE_KEY_SAFETY_OFFICER=your_safety_officer_key
ROLE_KEY_FINANCIAL_ANALYST=your_financial_analyst_key
```

### 3. Run the App

```bash
# Runs both frontend (port 5173) and backend (port 5000) together
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/register` | Register new user with role key |

### Data
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/all` | Fetch all collections at once (initial load) |
| `POST` | `/api/settings` | Update depot name, currency, RBAC rules |

### Vehicles
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/vehicles` | Add a new vehicle |
| `DELETE` | `/api/vehicles/:id` | Delete a vehicle |
| `PUT` | `/api/vehicles/:id/status` | Update vehicle status |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/drivers` | List all drivers |
| `POST` | `/api/drivers` | Add a new driver |
| `DELETE` | `/api/drivers/:licenseNo` | Delete a driver |
| `PUT` | `/api/drivers/:licenseNo/status` | Update driver status |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips` | List all trips |
| `POST` | `/api/trips` | Create a new trip (status: Draft) |
| `PUT` | `/api/trips/:id/dispatch` | Dispatch trip (validates availability, license, cargo) |
| `PUT` | `/api/trips/:id/complete` | Complete trip (logs fuel & expenses, updates odometer) |
| `PUT` | `/api/trips/:id/cancel` | Cancel a trip |
| `PUT` | `/api/trips/:id/status` | Manually update trip status |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/maintenance` | Log a new maintenance job (sets vehicle → In Shop) |
| `PUT` | `/api/maintenance/:id/close` | Close a job (sets vehicle → Available) |

### Fuel & Expenses
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/fuel` | Log a fuel fill (also creates expense record) |
| `POST` | `/api/expenses` | Log an ad-hoc expense |
| `PUT` | `/api/expenses/:id/type` | Update expense category |

---

## Roles & Access Control (RBAC)

TransitOps uses server-side role key validation at registration time. Once logged in, module-level access is controlled by configurable RBAC rules (set via the Settings screen).

| Role | Default Access |
|---|---|
| **Fleet Manager** | All modules |
| **Dispatcher** | Dashboard, Fleet, Drivers, Trips |
| **Safety Officer** | Dashboard, Drivers, Trips |
| **Financial Analyst** | Dashboard, Fuel & Expenses, Analytics |

> Role keys are **never** exposed in source code — they are loaded exclusively from server environment variables.

---

## Screens

| # | Screen | Component |
|---|---|---|
| 1 | Authentication (Login / Register) | `LoginScreen.jsx` |
| 2 | Dashboard | `DashboardView.jsx` |
| 3 | Vehicle Registry | `FleetView.jsx` |
| 4 | Drivers & Safety Profiles | `DriversView.jsx` |
| 5 | Trip Dispatching | `TripsView.jsx` |
| 6 | Maintenance Tracker | `MaintenanceView.jsx` |
| 7 | Fuel & Expense Management | `FuelExpenseView.jsx` |
| 8 | Reports & Analytics | `AnalyticsView.jsx` |
| 9 | Settings & RBAC | `SettingsView.jsx` |

---

*Built with ❤️ for Odoo Hackathon 2026*
