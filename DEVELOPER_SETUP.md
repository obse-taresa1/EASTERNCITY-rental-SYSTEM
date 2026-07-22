# Developer Setup

## Prerequisites

- Node.js 20+
- npm

## Install

From the project root:

```bash
npm run install:frontend
npm run install:backend
```

## Environment Setup

Frontend:

```bash
cd frontend
copy .env.example .env
```

Backend:

```bash
cd backend
copy .env.example .env
```

Frontend variables:

- `VITE_API_BASE_URL`: Backend API base URL.
- `VITE_USE_MOCK_AUTH`: `true` keeps localStorage/mock auth; `false` uses backend auth APIs.

Backend variables:

- `DATABASE_URL`: Neon PostgreSQL connection string. Keep this only in local `.env`, never in commits.
- `JWT_SECRET`: Access-token signing secret.
- `JWT_REFRESH_SECRET`: Refresh-token signing secret.
- `PORT`: Backend port.
- `CLIENT_URL`: Frontend URL.
- `CORS_ORIGIN`: Allowed frontend origin.

## Database And Prisma

Run from `backend/`:

```bash
npx prisma validate
npx prisma format
npx prisma migrate deploy
npx prisma generate
```

## Run Frontend

From the project root:

```bash
npm run dev:frontend
```

Default frontend URL: `http://localhost:5173`

## Run Backend

From `backend/`:

```bash
npm run dev
```

Or from the project root:

```bash
npm run dev:backend
```

Default backend URL: `http://localhost:5000`

## Build And Verification

Frontend build:

```bash
npm run build:frontend
```

Backend Prisma validation:

```bash
cd backend
npx prisma validate
```

## Parallel Development Notes

- Developer 1 owns authentication, users, verification, role migration, JWT, refresh-token persistence, and admin creation.
- Developer 2 owns listings, uploads, categories, reviews, listing payments, promotion payments, and file handling.
- Developer 3 owns bookings, messaging, notifications, support tickets, analytics, and dashboard APIs.

Keep shared contracts in Prisma schema, route names, and service abstractions stable before changing feature code.

