# Intelligent Stock Monitoring and Replenishment System

A full-stack inventory management platform for small/medium businesses that goes beyond basic
low-stock alerts: it analyzes historical sales to calculate reorder points, forecasts demand,
and generates prioritized replenishment recommendations.

> **Status:** All 14 phases complete — full working application (auth, products, inventory, billing, purchases, dashboard, replenishment engine, forecasting, alerts).

## Core Idea

```
Sales → Inventory Update → Stock Analysis → Low Stock Detection → Replenishment Recommendation → Restocking
```

The system answers: **"What products are likely to run out, when, and how much should I reorder?"**

## Technology Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Recharts, Axios
**Backend:** Node.js, Express.js, REST APIs, express-validator
**Database:** MongoDB with Mongoose
**Auth:** JWT + bcrypt password hashing

## System Architecture

```
React SPA (client/)
      |  Axios (JWT in Authorization header)
      v
Express REST API (server/)
      |  controllers -> services -> models
      v
MongoDB (Mongoose schemas)
```

The **service layer** (`server/services/`) is where the replenishment/forecasting math lives —
kept separate from route handlers so it's independently testable and easy to explain in a viva.

## Project Structure

```
intelligent-stock-system/
├── client/                # React frontend (Vite)
│   └── src/
│       ├── components/    # Reusable UI (cards, tables, badges, modals)
│       ├── pages/         # Route-level pages (Dashboard, Products, Billing...)
│       ├── layouts/       # Sidebar/topbar shell
│       ├── hooks/         # Custom hooks (useAuth, useFetch...)
│       ├── services/      # api.js (axios instance) + per-resource API calls
│       ├── context/       # AuthContext, global state
│       └── utils/         # formatters, stock-status helpers
├── server/                # Express backend
│   ├── controllers/       # Request/response handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers
│   ├── middleware/        # auth, roles, error handling, validation
│   ├── services/          # Business logic: replenishmentService, forecastService...
│   ├── config/            # db.js, constants.js
│   └── seed/              # Sample data generator
├── .gitignore
└── package.json           # Root workspace scripts (runs client+server together)
```

## Installation

**Prerequisites:** Node.js 18+, MongoDB running locally (or an Atlas connection string)

```bash
# From the project root
npm run install:all      # installs server AND client dependencies

# Configure environment variables
cp server/.env.example server/.env
# edit server/.env if your MongoDB URI / JWT secret differ from the defaults

# Run backend + frontend together
npm run dev
```

- Backend: http://localhost:5000 (health check: `GET /api/health`)
- Frontend: http://localhost:5173

You can also run them separately: `npm run server` and `npm run client`.

## Environment Variables

See `server/.env.example` for the full list (Mongo URI, JWT secret/expiry, CORS origin,
and the replenishment engine's default safety days / lead time / analysis window).

## Database Setup

Point `MONGO_URI` in `server/.env` at either a local MongoDB instance
(`mongodb://127.0.0.1:27017/stock_system`) or a MongoDB Atlas cluster. No manual schema
creation is needed — Mongoose creates collections automatically on first write.

## Seed Data

Run the seed script to populate 22 products, 5 suppliers, and 45 days of realistic historical
sales (with fast/medium/slow-moving products deliberately mixed in) so the dashboard charts
and the replenishment engine have real data immediately:

```bash
npm run seed --prefix server
```

This wipes and recreates the `users`, `suppliers`, `products`, `sales`, and
`inventorytransactions` collections. Run it once after connecting to a fresh MongoDB database.

## Login Credentials

The seed script creates two demo accounts:

| Role  | Email                    | Password  |
|-------|---------------------------|-----------|
| Admin | admin@stocksystem.com     | admin123  |
| Staff | staff@stocksystem.com     | staff123  |

You can also register your own account from the Login page — the **first** user ever
registered automatically becomes an admin.

## API Documentation

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Products | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`, `GET /api/products/meta/categories` |
| Suppliers | `GET/POST /api/suppliers`, `GET/PUT/DELETE /api/suppliers/:id` |
| Inventory | `GET /api/inventory`, `POST /api/inventory/adjust`, `GET /api/inventory/transactions` |
| Sales | `GET/POST /api/sales`, `GET /api/sales/:id` |
| Purchases | `GET/POST /api/purchases`, `GET /api/purchases/:id` (admin only) |
| Analytics | `GET /api/analytics/dashboard`, `GET /api/analytics/sales`, `GET /api/analytics/inventory`, `GET /api/analytics/alerts` |
| Replenishment | `GET /api/replenishment/recommendations`, `POST /api/replenishment/generate` (admin), `GET /api/replenishment/product/:productId` |

All routes except `/api/auth/register` and `/api/auth/login` require a `Bearer` JWT.
Admin-only routes are protected by `authorize("admin")` middleware.

## Intelligent Replenishment Logic

```
Reorder Point = (Average Daily Demand × Supplier Lead Time) + Safety Stock
Safety Stock  = Average Daily Demand × Safety Days
Average Daily Demand = Total units sold in analysis window / Number of days
```

If `Current Stock < Reorder Point`, the product is flagged for reorder with a priority
(LOW/MEDIUM/HIGH/CRITICAL) based on how far below the reorder point the current stock is,
and a recommended reorder quantity. Demand forecasting uses a simple, explainable 7-day
moving average rather than a black-box model — implemented in Phase 10.

## Development Roadmap

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Architecture, folder structure, scaffolding, health check | ✅ Done |
| 2 | MongoDB schemas/models | ⏳ Next |
| 3 | Authentication + authorization (JWT, roles) | Pending |
| 4 | Product + supplier management + seed data | Pending |
| 5 | Inventory management + transaction history | Pending |
| 6 | Billing + sales (auto stock decrement) | Pending |
| 7 | Purchases/restocking (auto stock increment) | Pending |
| 8 | Dashboard + analytics | Pending |
| 9 | Intelligent replenishment engine | Pending |
| 10 | Demand forecasting (moving average) | Pending |
| 11 | Notifications/alerts | Pending |
| 12 | UI polish + responsiveness | Pending |
| 13 | Testing + bug fixing | Pending |
| 14 | Final documentation | Pending |

## Future Enhancements

- ML-based demand forecasting (e.g. Prophet, LSTM) instead of moving average
- Automated purchase order emails to suppliers when a CRITICAL recommendation is generated
- Multi-warehouse/location inventory support
- Barcode scanning for billing
# intelligent-stock-monitoring-application
