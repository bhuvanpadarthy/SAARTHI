# SAARTHI Backend — Paint-Shop Inventory & Billing Management

Production-grade, secure Node.js Express backend for the SAARTHI Paint-Shop POS and Inventory Management system. Designed with PostgreSQL transactional guarantees, atomic stock deductions, traceability, and multi-tenant isolation.

---

## 1. Architecture & Design Principles

- **Framework**: Node.js (v20+ / v22+) with Express.
- **Database Engine**: Supabase PostgreSQL with Row Level Security (RLS) and stored procedures.
- **Validation**: Schema-level request validation using **Zod**.
- **Security**: Hardened with `helmet`, configurable `cors`, and `express-rate-limit`.
- **Atomic Operations**:
  - Paper bill draft creation **never** touches or reserves inventory.
  - Paper bill confirmation atomically deducts stock, posts signed ledger entries to `stock_movements`, increments paper bill serial numbers, updates Khata credit balances, and records audit logs in a single serialized transaction.
  - Concurrency serialization locks product rows to prevent overselling limited stock.
  - Idempotency keys prevent duplicate billing from repeated clicks or network retries.
  - Traceable reversals for error corrections (no hard-deletion of ledger entries).

---

## 2. Directory Structure

```text
backend/
├── .env.example              # Environment variables template with placeholders
├── .gitignore                # Protects secrets, node_modules, and logs
├── package.json              # Pinned, compatible dependencies
├── package-lock.json         # Exact dependency lockfile
├── README.md                 # Architecture, API docs & Windows setup guide
├── migrations/
│   ├── 001_initial_schema.sql         # Tables, indexes, constraints, RLS policies, and verification view
│   ├── 002_atomic_sales_function.sql  # Stored procedure: confirm_sale_atomic() with row locks & idempotency
│   └── 003_seed_demo_data.sql         # Realistic Indian paint store seed formulations
├── src/
│   ├── server.js             # HTTP server entrypoint with graceful shutdown
│   ├── app.js                # Express app assembly with helmet, rate-limiting & routes
│   ├── routes.js             # Aggregated API router (/api/...)
│   ├── config/
│   │   ├── env.js            # Validated environment configuration (Zod)
│   │   └── supabase.js       # Supabase client wrapper & connection status
│   ├── middleware/
│   │   ├── auth.js           # Bearer token verification & RBAC role guards
│   │   ├── tenant.js         # Shop isolation & membership verification
│   │   ├── validate.js       # Zod schema validation middleware
│   │   ├── rateLimiter.js    # Rate limiting middleware
│   │   └── errorHandler.js   # Centralized error handler returning consistent JSON
│   ├── modules/
│   │   ├── health/           # GET /api/health
│   │   ├── products/         # Products catalog & formulation identity
│   │   ├── inventory/        # Ledger balances, depot receipts, damaged stock, reversals
│   │   ├── sales/            # Draft bills, atomic confirmation, daily summaries
│   │   ├── customers/        # Customer records & Khata payment settlements
│   │   ├── reports/          # Daily sales summary & depot reorder procurement sheets
│   │   └── shops/            # Shop profile, bill prefixes, and safety thresholds
│   └── storage/
│       └── store.js          # Transactional data store with concurrency locking
└── tests/
    ├── health.test.js                 # Health check and 404 handler tests
    ├── validation.test.js             # Schema validation and negative price/qty rejection
    ├── permissions.test.js            # Auth bearer verification and RBAC permissions
    └── inventory_correctness.test.js  # Atomic sales, stock locks, idempotency & Khata tests
```

---

## 3. Database Schema Overview

| Table | Primary Key | Description |
|---|---|---|
| `shops` | `UUID` | Store identity, GSTIN, paper bill sequence prefix, low-stock threshold, and currency. |
| `shop_members` | `UUID` | User membership and role permissions (`owner`, `manager`, `cashier`, `viewer`). |
| `products` | `UUID` | Paint formulation identity: Brand + Product Name + Category + Pack Size + Unit of Measure + Shade Code. Selling price, cost price, and safety reorder thresholds. |
| `customers` | `UUID` | Contractor, Master Painter, Commercial, and Homeowner accounts with Khata credit balance. |
| `sales` | `UUID` | Paper bill vouchers (`draft` vs `confirmed`), bill numbers, subtotal, discount, and net totals. |
| `sale_items` | `UUID` | Line items with paint formulation IDs, quantities, rates, and line totals. |
| `stock_movements` | `UUID` | Immutable ledger of all stock transactions (`purchase_received`, `sale_deduction`, `damage_leakage`, `reversal`) with signed quantities, before/after balances, and reference IDs. |
| `customer_payments`| `UUID` | Payments received against Khata credit with before/after balances and payment modes. |
| `audit_logs` | `UUID` | Traceable log of all state mutations with operator IDs, actions, and previous/new values. |

---

## 4. API Endpoints Reference

All endpoints return a standardized JSON structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional user-friendly notification message"
}
```

In case of error:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Product Royale Luxury (0422 Pearl Glow) has only 3 units in stock, but 10 was requested."
  }
}
```

### Endpoints:
- `GET /api/health` — System health, uptime, and database connection status.
- `GET /api/products` — Filter products by `search`, `brand`, `category`, `pack_size`, `stock_status`.
- `GET /api/products/:id` — Product formulation details.
- `POST /api/products` — Create new paint product (Requires `owner` or `manager`).
- `PUT /api/products/:id` — Update pricing or reorder thresholds.
- `GET /api/inventory/balances` — Opening stock, received, sold, damaged, and current balances.
- `GET /api/inventory/movements` — Traceable stock movement ledger.
- `POST /api/inventory/receive` — Inward depot shipment.
- `POST /api/inventory/damage` — Record damaged / leakage paint (validated `<= current_stock`).
- `POST /api/inventory/reversal` — Audited reversal of an erroneous stock movement.
- `POST /api/sales/draft` — Create paper bill draft (Never changes stock).
- `GET /api/sales/:id` — Retrieve bill draft or confirmed receipt.
- `POST /api/sales/:id/confirm` — Atomically confirm paper bill (idempotency-protected, locks stock).
- `GET /api/sales` — List confirmed bills.
- `GET /api/sales/analytics/daily-summary` — Today's sales revenue, bill count, and payment mode breakdown.
- `GET /api/customers` — Customer accounts and Khata balances.
- `POST /api/customers` — Register new contractor/painter account.
- `POST /api/customers/:id/payments` — Settle Khata balance.
- `GET /api/reports/sales-summary` — Daily/weekly sales audit.
- `GET /api/reports/low-stock` — Reorder indent procurement sheet with depot names and cost estimates.
- `GET /api/settings` — Shop profile and billing configuration.
- `PUT /api/settings` — Update shop preferences.

---

## 5. Windows PowerShell Commands to Run

### Step 1: Install & Test Backend
Open Windows PowerShell:

```powershell
cd C:\Users\bhuva\OneDrive\Desktop\SAARTHI\backend
npm install
npm test
```

### Step 2: Start the Backend Server
```powershell
npm start
```
*The server will start at `http://localhost:5000`.*

### Step 3: Start the Frontend Application (in a second terminal)
```powershell
cd C:\Users\bhuva\OneDrive\Desktop\SAARTHI\frontend
npm run dev
```
*The React + Vite dashboard will launch at `http://localhost:5173`.*

---

## 6. How to Connect a Real Supabase PostgreSQL Database

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the migration files in numerical order:
   - Copy and execute [001_initial_schema.sql](file:///c:/Users/bhuva/OneDrive/Desktop/SAARTHI/backend/migrations/001_initial_schema.sql).
   - Copy and execute [002_atomic_sales_function.sql](file:///c:/Users/bhuva/OneDrive/Desktop/SAARTHI/backend/migrations/002_atomic_sales_function.sql).
   - Copy and execute [003_seed_demo_data.sql](file:///c:/Users/bhuva/OneDrive/Desktop/SAARTHI/backend/migrations/003_seed_demo_data.sql).
4. Go to **Project Settings** -> **API** in Supabase and copy:
   - **Project URL**
   - **service_role secret key**
   - **anon public key**
5. Create `backend/.env` (copy from `backend/.env.example`) and fill in:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
6. Restart the backend server with `npm start`.
