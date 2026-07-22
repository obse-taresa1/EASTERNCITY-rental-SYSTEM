# EasternCity Rental System

EasternCity is a full-stack rental marketplace with separate user, Admin, and Super Admin experiences.

## Project Structure

```text
EASTERNCITY-rental-SYSTEM/
  frontend/   React + Vite client application
  backend/    Express + Prisma API
  README.md   Full project setup guide
```

## Requirements

- Node.js 20 or later
- npm 10 or later
- A PostgreSQL database connection string for the backend

## Quick Start

Open two terminals from the repository root.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and replace the placeholder `DATABASE_URL` with the real connection string from Neon Project Connect. Do not use the literal `USER`, `PASSWORD`, `HOST`, or `DATABASE` placeholder values.

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
```

Generate the Prisma client and start the API:

```bash
npx prisma generate
npm run dev
```

The API health check is available at `http://localhost:5000/`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

For local API usage, ensure `frontend/.env` contains:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK_AUTH=false
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Root Commands

These commands can be run from the repository root:

```bash
npm run install:all
npm run dev:frontend
npm run dev:backend
npm run build:frontend
npm run lint:frontend
npm run prisma:generate
npm run test:backend
```

## Verify The Application

```bash
# API health check
curl http://localhost:5000/

# Frontend production build
npm run build:frontend
```

## Common Setup Errors

| Error | Resolution |
| --- | --- |
| `Can't reach database server at HOST:5432` | Replace the placeholder `DATABASE_URL` in `backend/.env` with the real database connection string. |
| `@prisma/client did not initialize yet` | Run `cd backend && npx prisma generate`. |
| Prisma validation error | Correct the reported schema field, then run `npx prisma generate` again. |
| Frontend API requests fail | Start the backend, verify port `5000`, and set `VITE_API_BASE_URL=http://localhost:5000` in `frontend/.env`. |

## Security Notes

- Never commit `.env` files or paste database URLs into issues or chat.
- Use distinct, long values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Run migrations against the intended database only.
