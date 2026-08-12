# Military Asset Management System (MAMS)

An enterprise-grade **Military Asset Management System (MAMS)** designed to track critical defense assets—including armored vehicles, tactical weaponry, ammunition, and specialized equipment—across multiple military installations with strict **Role-Based Access Control (RBAC)**, base-level data isolation, atomic database transactions, dynamic inventory calculation, audit logging, and interactive data visualization.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [Full System Architecture](#4-full-system-architecture)
5. [Database Architecture & ORM Integration](#5-database-architecture--orm-integration)
6. [Database Schema](#6-database-schema)
7. [Setup Requirements](#7-setup-requirements)
8. [Installation Instructions](#8-installation-instructions)
9. [PostgreSQL Database Setup](#9-postgresql-database-setup)
10. [Environment Variables Reference](#10-environment-variables-reference)
11. [Database Migration Commands](#11-database-migration-commands)
12. [Database Seeding Command](#12-database-seeding-command)
13. [Backend Server Startup](#13-backend-server-startup)
14. [Frontend Application Startup](#14-frontend-application-startup)
15. [REST API Endpoints Reference](#15-rest-api-endpoints-reference)
16. [RBAC Authorization Matrix](#16-rbac-authorization-matrix)
17. [Inventory Calculation Formulas & Section 27 Baseline Scenario](#17-inventory-calculation-formulas--section-27-baseline-scenario)
18. [Automated Unit & Integration Testing](#18-automated-unit--integration-testing)
19. [Deployment Instructions (Render, Vercel, Supabase/Neon)](#19-deployment-instructions-render-vercel-supabaseneon)
20. [Demonstration Credentials](#20-demonstration-credentials)
21. [Project Structure Overview](#21-project-structure-overview)

---

## 1. Project Overview

The **Military Asset Management System (MAMS)** addresses operational challenges in modern defense logistics by replacing fragmented tracking prototypes with a centralized, secure, transaction-safe platform. MAMS ensures total visibility over stock posture across military bases while preventing unauthorized cross-installation data access.

---

## 2. Key Features

- **Dynamic Inventory Calculation Engine**: Calculates Opening Balance, Purchases, Transfers In, Transfers Out, Net Movement, Assigned Stock, Expended Stock, and Closing Balance dynamically from transactional records.
- **Interactive Net Movement Modal**: Clickable dashboard element displaying formula breakdown: `Purchases (+) + Transfers In (+) - Transfers Out (-) = Net Movement`.
- **Atomic Cross-Base Transfers**: All asset transfers use **PostgreSQL Database Transactions** (`BEGIN...COMMIT/ROLLBACK`) via Prisma ORM to guarantee referential integrity and eliminate stock duplication or loss.
- **Strict Backend Base Isolation**: Overrides request parameters on the backend so non-Admin officers (`BASE_COMMANDER`, `LOGISTICS_OFFICER`) can only inspect or modify their assigned military installation.
- **Bcrypt Password Security & JWT Session Auth**: Hashed user credentials using `bcryptjs` and JSON Web Token (JWT) verification middleware.
- **Comprehensive Audit Logging**: Every inventory-modifying event (PURCHASE, TRANSFER, ASSIGNMENT, EXPENDITURE, AUTH, SYSTEM) writes an immutable record to the `AuditLog` database table.
- **Tactical Dark UI Design**: Professional military interface inspired by defense command systems, featuring Tailwind CSS, Lucide React icons, and Recharts interactive analytics.

---

## 3. Technology Stack

### Frontend
- **React 18**: Component-driven user interface.
- **Vite 5**: High-performance frontend build tool.
- **Tailwind CSS 3**: Utility-first CSS styling tailored to military tactical themes.
- **Lucide React**: Modern iconography system.
- **Recharts**: Data visualization charts for stock by category and installation strength.
- **Axios**: HTTP client configured with JWT bearer authorization interceptors.
- **React Router**: Single-page application navigation.

### Backend
- **Node.js v24+**: JavaScript ES6+ runtime engine.
- **Express.js v4**: Web server framework with custom route modules.
- **Helmet & CORS**: Security header protection and CORS origin restriction middleware.
- **BcryptJS**: Password hashing with salt rounds.
- **JSONWebToken (JWT)**: Stateless token authentication.

### Database Layer
- **PostgreSQL**: Production-grade relational database management system.
- **Prisma ORM v5**: Object-Relational Mapping (ORM) schema manager, client query builder, and migration engine.

---

## 4. Full System Architecture

```text
               +--------------------------------------------------+
               |                  React + Vite                    |
               |                Tactical Web UI                   |
               +------------------------+-------------------------+
                                        |
                                HTTP / Axios (JWT)
                                        |
                                        v
               +--------------------------------------------------+
               |                Express.js Server                 |
               | +----------------------------------------------+ |
               | | Helmet Security & CORS Middleware            | |
               | | JWT Authenticate & RBAC Authorize Middleware | |
               | | Strict Backend Base Isolation Middleware     | |
               | +----------------------------------------------+ |
               |                                                  |
               | +----------------------------------------------+ |
               | | Modular Controllers & Calculation Services   | |
               | | (inventoryService, auditService)             | |
               | +----------------------------------------------+ |
               +------------------------+-------------------------+
                                        |
                             Prisma ORM Client ($transaction)
                                        |
                                        v
               +--------------------------------------------------+
               |               PostgreSQL Database                |
               | Users | Bases | EquipmentTypes | Assets |        |
               | Purchases | Transfers | Assignments |            |
               | Expenditures | AuditLogs                         |
               +--------------------------------------------------+
```

---

## 5. Database Architecture & ORM Integration

MAMS utilizes **PostgreSQL** coupled with **Prisma ORM**. Key features include:
- **Foreign Key Constraints (`ON DELETE CASCADE` / `ON DELETE SET NULL`)** for strict referential integrity.
- **Unique Constraints** (`[base_id, equipment_type_id]` pair) ensuring one master asset quantity row per equipment item per base.
- **Check Constraints** (`quantity >= 0` and `quantity > 0` on purchases/transfers).
- **PostgreSQL Indexes** on `base_id`, `equipment_type_id`, `created_at`, `timestamp`.
- **Atomic Transactions (`prisma.$transaction`)** guaranteeing that multi-step mutations roll back cleanly upon failure.

---

## 6. Database Schema

The database contains 9 core relational entities:

1. **`User` (`users`)**: System accounts (`id`, `name`, `username`, `email`, `password`, `role`, `baseId`, `createdAt`).
2. **`Base` (`bases`)**: Military installations (`id`, `name`, `code`, `location`, `createdAt`).
3. **`EquipmentType` (`equipment_types`)**: Equipment catalog (`id`, `name`, `category`, `unit`, `description`, `createdAt`).
4. **`Asset` (`assets`)**: Live stock records (`id`, `baseId`, `equipmentTypeId`, `quantity`, `status`, `updatedAt`).
5. **`Purchase` (`purchases`)**: Inbound purchases (`id`, `baseId`, `equipmentTypeId`, `quantity`, `purchaseDate`, `vendor`, `notes`, `createdById`, `createdAt`).
6. **`Transfer` (`transfers`)**: Cross-base stock moves (`id`, `sourceBaseId`, `destinationBaseId`, `equipmentTypeId`, `quantity`, `status`, `notes`, `createdById`, `createdAt`).
7. **`Assignment` (`assignments`)**: Personnel assignments (`id`, `baseId`, `equipmentTypeId`, `personnel`, `quantity`, `assignmentDate`, `notes`, `createdById`, `createdAt`).
8. **`Expenditure` (`expenditures`)**: Expended/consumed stock (`id`, `baseId`, `equipmentTypeId`, `quantity`, `expenditureDate`, `reason`, `notes`, `createdById`, `createdAt`).
9. **`AuditLog` (`audit_logs`)**: Event audit records (`id`, `userId`, `action`, `details`, `entityRef`, `baseId`, `timestamp`).

---

## 7. Setup Requirements

- **Node.js**: `v18.0.0` or higher (Tested on `v24.11.0`).
- **npm**: `v9.0.0` or higher.
- **PostgreSQL Database**: PostgreSQL 13+ instance (Local or Cloud provider like Neon / Supabase / Render Postgres).

---

## 8. Installation Instructions

1. Clone or extract the project repository into your workspace.
2. Install **Backend** dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install **Frontend** dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 9. PostgreSQL Database Setup

Create a PostgreSQL database named `military_assets` on your database server:
```sql
CREATE DATABASE military_assets;
```

---

## 10. Environment Variables Reference

Create a `.env` file in the `backend/` directory based on `.env.example`:

**`backend/.env`**:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=production-military-secure-jwt-secret-key-32-chars
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/military_assets?schema=public"
```

Create a `.env` file in the `frontend/` directory:

**`frontend/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 11. Database Migration Commands

Generate the Prisma Client and sync the schema to PostgreSQL:
```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

*Note: Alternatively, `backend/prisma/schema.sql` contains standard PostgreSQL Data Definition Language (DDL) statements for manual SQL execution.*

---

## 12. Database Seeding Command

Populate initial bases, equipment catalog, bcrypt-hashed demo users, baseline assets, sample transfers, and audit logs:
```bash
cd backend
npm run prisma:seed
```

---

## 13. Backend Server Startup

Start the Express backend development server:
```bash
cd backend
npm run dev
```
The server will run on `http://localhost:5000`.

---

## 14. Frontend Application Startup

In a separate terminal, launch the Vite development server:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 15. REST API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Authenticate username/email & password, return JWT token.

### Dashboard & Assets
- `GET /api/assets/dashboard` - Consolidated operational metrics (Opening balance, Purchases, Net Movement, Assigned, Expended, Closing balance).
- `GET /api/assets` - List inventory stock with optional filters (`baseId`, `equipmentTypeId`, `category`, `search`).

### Base & Equipment Management
- `GET /api/bases` | `POST /api/bases` | `PUT /api/bases/:id` | `DELETE /api/bases/:id`
- `GET /api/equipment-types` | `POST /api/equipment-types` | `PUT /api/equipment-types/:id` | `DELETE /api/equipment-types/:id`

### Asset Transactions
- `GET /api/purchases` | `POST /api/purchases` - Record inbound purchase & update stock.
- `GET /api/transfers` | `POST /api/transfers` - Atomic cross-base stock transfer (`prisma.$transaction`).
- `GET /api/assignments` | `POST /api/assignments` - Record equipment assignment to personnel.
- `GET /api/expenditures` | `POST /api/expenditures` - Record consumed stock / ammunition expenditure.

### Audit Logs & User Management
- `GET /api/audit-logs` - Retrieve system audit trail (Admin only).
- `GET /api/users` | `POST /api/users` | `PUT /api/users/:id` | `DELETE /api/users/:id` - User directory management (Admin only).

---

## 16. RBAC Authorization Matrix

| Feature Module | ADMIN | BASE_COMMANDER | LOGISTICS_OFFICER |
| :--- | :---: | :---: | :---: |
| Global Multi-Base Dashboard | ✅ | ❌ (Own Base Only) | ❌ (Own Base Only) |
| Inbound Purchases | ✅ | ❌ | ✅ (Own Base Only) |
| Cross-Base Transfers | ✅ | ✅ (From Own Base) | ✅ (From Own Base) |
| Personnel Assignments | ✅ | ✅ (Own Base Only) | ✅ (Own Base Only) |
| Stock Expenditures | ✅ | ✅ (Own Base Only) | ✅ (Own Base Only) |
| User Account Directory | ✅ | ❌ | ❌ |
| Military Base CRUD | ✅ | ❌ | ❌ |
| Equipment Catalog CRUD | ✅ | ❌ | ❌ |
| System Audit Trail | ✅ | ❌ | ❌ |

---

## 17. Inventory Calculation Formulas & Section 27 Baseline Scenario

### Core Business Logic Formulas

**Formula 1 (Closing Balance)**:
$$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Assigned} - \text{Expended}$$

**Formula 2 (Net Movement)**:
$$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$

### Section 27 Baseline Verification Scenario

Given the benchmark operational parameters:
- **Opening Balance** = 100
- **Purchases** = 50
- **Transfers In** = 20
- **Transfers Out** = 10
- **Assigned** = 30
- **Expended** = 15

Calculations:
$$\text{Net Movement} = 50 + 20 - 10 = 60$$
$$\text{Closing Balance} = 100 + 60 - 30 - 15 = 115$$

*Verified by automated backend unit tests.*

---

## 18. Automated Unit & Integration Testing

Run the automated Node.js test suite covering calculation formulas, Section 27 scenario, and RBAC base isolation:
```bash
cd backend
npm test
```

Expected Output:
```text
✔ Section 27 Baseline Requirement Test - Formulas 1 & 2
✔ Inventory Formula with Zero Net Movement
✔ Inventory Formula with High Transfers In
✔ enforceBaseAccess overrides query/body baseId for non-Admin users
✔ enforceBaseAccess allows Admin users to pass custom baseId
ℹ pass 5 | fail 0
```

---

## 19. Deployment Instructions (Render, Vercel, Supabase/Neon)

### Backend Deployment (Render / Railway)
1. Root directory: `backend`
2. Build command: `npm install && npm run prisma:generate`
3. Start command: `npm start`
4. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-key`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `DATABASE_URL=postgresql://user:password@neon-or-supabase-host:5432/military_assets?sslmode=require`

### Frontend Deployment (Vercel / Netlify)
1. Root directory: `frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set Environment Variable:
   - `VITE_API_URL=https://your-render-backend-url.onrender.com/api`

---

## 20. Demonstration Credentials

| Role | Username | Password | Base Scope |
| :--- | :--- | :--- | :--- |
| **Admin Officer** | `admin` | `admin123` | Central Command (HQ) / Global |
| **Base Commander** | `commander.north` | `command123` | Northern Base (Fort Alpha) |
| **Logistics Officer** | `logistics.south` | `logistics123` | Southern Base (Fort Bravo) |

---

## 21. Project Structure Overview

```text
Military Asset Management System/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma PostgreSQL Object Model
│   │   ├── schema.sql          # PostgreSQL DDL setup script
│   │   └── seed.js             # Database seeding script with bcrypt hashes
│   ├── src/
│   │   ├── config/             # Prisma client database connection
│   │   ├── middleware/         # JWT authentication & Base isolation middleware
│   │   ├── routes/             # Express API routes (auth, assets, transfers, etc.)
│   │   ├── services/           # Inventory calculation & audit logging services
│   │   └── index.js            # Express server entry point
│   ├── tests/                  # Automated unit test suite
│   ├── .env.example            # Backend environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components (Dashboard, NetMovementModal, Panels)
│   │   ├── api.js              # Axios HTTP client with JWT interceptor
│   │   ├── App.jsx             # React SPA shell & navigation router
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Tailwind CSS directives & tactical styling
│   ├── index.html              # HTML shell
│   ├── tailwind.config.js      # Tactical dark theme color extension
│   └── package.json
├── implementation_plan.md      # Detailed engineering specification plan
└── README.md                   # Complete system documentation
```
