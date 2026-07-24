# Developer Setup

This guide covers everything you need to set up and run the EASTERNCITY Rental System locally.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Clone Repository](#clone-repository)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Build and Verification](#build-and-verification)
- [Troubleshooting](#troubleshooting)
- [Development Guidelines](#development-guidelines)

---

## Prerequisites

Ensure you have the following installed before starting:

- **Node.js** v20 or higher — [Download](https://nodejs.org/)
- **npm** (bundled with Node.js)
- **PostgreSQL** database — local instance or a cloud provider such as [Neon](https://neon.tech) or [Supabase](https://supabase.com)

---

## Clone Repository

```bash
git clone <repository-url>
cd EASTERNCITY-rental-SYSTEM
```

---

## Project Structure

```text
EASTERNCITY-rental-SYSTEM/
├── frontend/     # React application built with Vite
│   ├── src/      # Source code (components, pages, routes, services)
│   └── public/   # Static assets
│
├── backend/      # Node.js/Express REST API
│   ├── src/      # Controllers, routes, middleware, services, utils
│   └── prisma/   # Database schema, migrations, seed script
│
├── README.md
└── DEVELOPER_SETUP.md
```

---

## Installation

Dependencies must be installed separately for each application.

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

---

## Environment Configuration

> **Important:** Never commit `.env` files to version control. They contain sensitive credentials and are protected by `.gitignore`.  
> Always copy the `.env.example` template and fill in your own values.

### Frontend

**Location:** `frontend/.env`

```bash
cd frontend
copy .env.example .env    # Windows
# or
cp .env.example .env      # macOS / Linux
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000/api` |
| `VITE_USE_MOCK_AUTH` | Use mock auth instead of real backend | `false` |

> Set `VITE_USE_MOCK_AUTH=false` for full-stack development. Set to `true` only for isolated frontend testing.

---

### Backend

**Location:** `backend/.env`

```bash
cd backend
copy .env.example .env    # Windows
# or
cp .env.example .env      # macOS / Linux
```

| Variable | Description |
|---|---|
| `PORT` | Port for the backend server (default: `5000`) |
| `NODE_ENV` | Environment mode (`development` or `production`) |
| `DATABASE_URL` | Full PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `CLIENT_URL` | Frontend URL (used for CORS and email links) |
| `CORS_ORIGIN` | Allowed CORS origin for API requests |
| `SMTP_HOST` | SMTP server hostname for email delivery |
| `SMTP_PORT` | SMTP port (usually `587`) |
| `SMTP_SECURE` | Use TLS: `true` or `false` |
| `SMTP_USER` | SMTP account email address |
| `SMTP_PASS` | SMTP account password or app password |
| `MAIL_FROM` | Display name and email for outgoing emails |
| `SEED_SUPER_ADMIN_EMAIL` | Email for the seeded super admin account |
| `SEED_SUPER_ADMIN_PASSWORD` | Password for the seeded super admin account |
| `SEED_SUPER_ADMIN_NAME` | Display name for the seeded super admin |
| `UPLOAD_CLEANUP_DAYS` | Days before uploaded files are cleaned up |

---

## Database Setup

The backend uses **Prisma ORM** for schema management. Run all commands from the `backend/` directory:

```bash
cd backend
```

| Command | Purpose |
|---|---|
| `npx prisma validate` | Validate the Prisma schema for errors |
| `npx prisma format` | Auto-format the schema file |
| `npx prisma migrate deploy` | Apply all pending database migrations |
| `npx prisma generate` | Generate the Prisma Client from the schema |

### Seed the Database (Optional)

To create the initial super admin account defined in your `.env`:

```bash
npx prisma db seed
```

---

## Running the Application

Open two separate terminal windows and start both services simultaneously.

### Frontend

```bash
cd frontend
npm run dev
```

> Runs at: **http://localhost:5173**

### Backend

```bash
cd backend
npm run dev
```

> Runs at: **http://localhost:5000**

---

## Build and Verification

### Frontend Production Build

```bash
cd frontend
npm run build
```

Output is generated in `frontend/dist/`.

### Backend Schema Validation

```bash
cd backend
npx prisma validate
```

---

## Troubleshooting

### Environment variables missing
**Symptom:** App crashes on startup or API calls fail immediately.  
**Fix:** Ensure `frontend/.env` and `backend/.env` both exist and contain all required variables from their respective `.env.example` files.

### Frontend cannot connect to the backend
**Symptom:** API requests fail with network or CORS errors.  
**Fix:** Confirm `VITE_API_BASE_URL` in `frontend/.env` matches the actual backend URL and port. Ensure `CORS_ORIGIN` in `backend/.env` matches the frontend URL exactly.

### Database connection problems
**Symptom:** Backend fails to start or throws a database connection error.  
**Fix:** Verify that `DATABASE_URL` in `backend/.env` is a valid PostgreSQL connection string and that your database server is running and accessible.

### Prisma client errors
**Symptom:** Errors like `PrismaClientInitializationError` or missing model methods.  
**Fix:** Run `npx prisma generate` from the `backend/` directory to regenerate the Prisma Client.

### Prisma migration errors
**Symptom:** Schema mismatch or migration not applied.  
**Fix:** Run `npx prisma migrate deploy` from the `backend/` directory to apply all pending migrations.

### Port conflicts
**Symptom:** `EADDRINUSE` error — port already in use.  
**Fix:** Change the `PORT` value in `backend/.env`, or stop the process using that port. Update `VITE_API_BASE_URL` in `frontend/.env` accordingly.

---

## Development Guidelines

- **Keep applications separated:** Frontend and backend are independent — keep logic, dependencies, and configuration in their own directories.
- **Follow clean coding practices:** Use consistent naming conventions and keep functions focused and readable.
- **Maintain stable API contracts:** Communicate changes to API endpoints or database schemas with the team before implementation.
- **Protect secrets:** Never hardcode credentials or commit `.env` files. Always use environment variables.
- **Test before committing:** Verify that both the frontend build and backend server run successfully before pushing any changes.
