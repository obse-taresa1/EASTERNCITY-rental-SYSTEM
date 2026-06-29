# React Admin Dashboard System Backend API

A professional, production-ready, and beginner-friendly Node.js + Express backend designed with clean architecture and separation of concerns.

## Tech Stack
- **Node.js & Express.js** - Server and Routing framework
- **Prisma ORM** - Database client management
- **SQLite** - Relational database (ideal for zero-configuration development)
- **JWT (JSON Web Tokens)** - Authentication and Session representation
- **Bcryptjs** - Secure one-way hashing for user passwords
- **Dotenv** - Multi-environment configuration loader
- **CORS** - Cross-Origin Resource Sharing enabled for frontend integration

---

## Folder Structure
```text
backend/
├── prisma/
│   ├── dev.db                 # Created SQLite database
│   └── schema.prisma          # Prisma Schema with User model configuration
│
├── src/
│   ├── config/
│   │   └── db.js              # Shared single Prisma client instance config
│   │
│   ├── controllers/
│   │   ├── authController.js  # Handle request-response flow for auth (Register, Login)
│   │   └── userController.js  # Handle profile, retrieval, updates, deletion
│   │
│   ├── middleware/
│   │   ├── auth.js            # JWT Validation middleware
│   │   ├── authorize.js       # Role check authorization middleware
│   │   └── errorHandler.js    # Global error response handler
│   │
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints mapping
│   │   └── userRoutes.js      # User management endpoints mapping
│   │
│   ├── services/
│   │   ├── authService.js     # Hashing, token generation, logic for auth
│   │   └── userService.js     # User database operations (CRUD)
│   │
│   ├── utils/
│   │   ├── hash.js            # Password hashing & comparison helpers
│   │   └── jwt.js             # Token creation & verification helpers
│   │
│   ├── validators/
│   │   └── authValidator.js   # Input validation middleware for email/passwords
│   │
│   ├── app.js                 # App definition, middleware, and route mounting
│   └── server.js              # Server initialization and listener
│
├── .env                       # Environment variables config file
├── package.json               # NPM dependency management
└── README.md                  # System Documentation
```

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.

### 2. Installation
Navigate into the `backend/` directory and install the dependencies:
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root of the `backend/` folder (a default `.env` is already configured for you):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_here_for_development"
NODE_ENV="development"
```

### 4. Database Setup & Migrations
Create/initialize database schema tables and generate the Prisma Client using:
```bash
npx prisma migrate dev --name init
```

### 5. Running the Server

#### For Development (with auto-reload using nodemon):
```bash
npm run dev
```

#### For Production:
```bash
npm run start
```

---

## API Documentation & Endpoints

### 1. Authentication Endpoints

#### Register User
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Body (`application/json`):**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN" 
}
```
*Note: Allowed roles are `USER`, `ADMIN`, and `SUPER_ADMIN`. Defaults to `USER`.*

#### Login User
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body (`application/json`):**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

---

### 2. User & Admin Management Endpoints
*All requests below require the `Authorization` header containing the JWT token:*
`Authorization: Bearer <your_jwt_token>`

#### Get Logged-in Profile
- **URL:** `/api/users/profile`
- **Method:** `GET`
- **Access:** Authenticated user

#### Get All Users (Admin Dashboard)
- **URL:** `/api/users`
- **Method:** `GET`
- **Access:** `ADMIN` or `SUPER_ADMIN` only

#### Get Specific User Profile (Admin View)
- **URL:** `/api/users/:id`
- **Method:** `GET`
- **Access:** `ADMIN` or `SUPER_ADMIN` only

#### Update User Profile
- **URL:** `/api/users/:id`
- **Method:** `PUT`
- **Access:** Owner of the profile, `ADMIN`, or `SUPER_ADMIN`
- **Body Example:**
```json
{
  "name": "Updated Admin Name",
  "email": "newadmin@example.com"
}
```

#### Delete User Profile
- **URL:** `/api/users/:id`
- **Method:** `DELETE`
- **Access:** `ADMIN` or `SUPER_ADMIN` only (Cannot delete self)
