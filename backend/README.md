# EasternCity Backend API

Express API for the EasternCity Rental System. It uses Prisma with PostgreSQL
and can connect to a Neon database.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env`. `DATABASE_URL` must be an actual connection string from
your database provider; the example value is intentionally not usable.

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
```

For Neon, copy the connection string from **Project → Connect**. Keep it in
`backend/.env` only—never commit it.

## Run locally

```bash
npx prisma generate
npm run dev
```

The server listens on `http://localhost:5000`. Confirm it with:

```bash
curl http://localhost:5000/
```

## Database commands

```bash
# Generate the Prisma client after schema changes
npx prisma generate

# Apply committed migrations to the configured database
npx prisma migrate deploy

# Create a development migration (only when intentionally changing the schema)
npx prisma migrate dev --name <migration-name>

# Seed data, if required
npm run prisma:seed
```

## Troubleshooting

- **`Can't reach database server at HOST:5432`**: `DATABASE_URL` still has its
  placeholder host. Replace it with the copied Neon URL.
- **`@prisma/client did not initialize yet`**: run `npx prisma generate`.
- **Prisma schema validation error**: correct the named field in
  `prisma/schema.prisma`, then generate the client again.
- **CORS error from the frontend**: confirm `CLIENT_URL` and `CORS_ORIGIN`
  match the Vite address, usually `http://localhost:5173`.
