# EASTERNCITY Rental System

A full-stack web application that connects property owners with tenants in a streamlined and intuitive rental marketplace. The platform handles the complete rental lifecycle — from listing discovery and user verification to bookings, messaging, payments, and administrative oversight.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development Guidelines](#development-guidelines)
- [Future Improvements](#future-improvements)
- [Screenshots](#screenshots)

---

## Project Overview

**EASTERNCITY Rental System** is a production-quality, full-stack rental marketplace built with React and Node.js. It is designed to solve the common friction points in the property rental process by providing a centralized, role-based platform for four distinct user types:

- **Users (Tenants & Owners):** Browse, book, and manage rental properties.
- **Admins:** Oversee platform content and moderate listings, users, and bookings.
- **Super Admins:** Full platform control including admin management, analytics, and system configuration.

---

## Key Features

### User / Tenant Features
- Secure registration, login, password reset, and email-based authentication
- Browse all rental listings and filter by category
- View detailed property pages including descriptions, images, and reviews
- Book properties directly through the platform
- Track and manage all personal bookings
- Save favourite listings for later reference
- Send and receive messages with property owners
- Receive real-time notifications
- Leave and manage reviews for properties
- Submit identity verification requests
- Manage profile settings and account preferences
- Access a help centre for support

### Property Owner Features
- Create detailed property listings with multi-step form wizard
- Upload and manage property images
- Edit and update existing listing information
- View and manage all personal listings and their statuses
- Communicate with interested tenants via the messaging system
- Track listing visibility and booking requests

### Admin Features
- Full admin dashboard with overview statistics
- Manage and moderate all platform listings
- Manage all registered users
- Review and approve or reject verification requests
- View and manage all platform bookings
- Review and moderate user-submitted reviews
- Manage listing categories
- Manage featured listings and promotion history
- Handle promotion management for listings
- View and respond to support tickets
- Read and manage contact form messages
- Monitor platform analytics and reporting
- Manage admin notifications
- View platform statistics and financial payment records
- Access admin-level settings

### Super Admin Features
- Complete super admin dashboard with platform-wide overview
- Manage and promote/demote admin accounts
- Full user management across the entire platform
- Full listing management oversight
- Manage user role change requests
- View full platform analytics and revenue reports
- Monitor payments and revenue streams
- Oversee identity verification requests
- Access the security centre for security monitoring
- View activity logs across the platform
- Monitor platform health and real-time performance
- Manage listing promotions across all admins
- Manage listing categories at the platform level
- Read and manage contact messages and reports/complaints
- Access the platform support centre
- Configure system-wide settings

---

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and development server |
| React Router v6 | Client-side routing |
| Vanilla CSS | Custom styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web server framework |
| PostgreSQL (Neon) | Production database |
| Prisma ORM | Database schema management and queries |
| JWT | Stateless authentication (access + refresh tokens) |
| Nodemailer | Email delivery (SMTP) |

---

## Project Architecture

The project uses a clean **monorepo structure**, keeping the frontend and backend completely separated:

```text
EASTERNCITY-rental-SYSTEM/
├── frontend/                 # React application (Vite)
│   ├── src/
│   │   ├── assets/           # Images and static files
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (auth, theme)
│   │   ├── data/             # Static constants and mock data
│   │   ├── layouts/          # Layout wrappers per role
│   │   ├── pages/            # Route-level page components
│   │   ├── routes/           # App routing and role guards
│   │   ├── services/         # API call abstractions
│   │   ├── styles/           # Global CSS stylesheets
│   │   └── utils/            # Helper utilities
│   ├── public/               # Static assets
│   ├── .env.example          # Frontend environment template
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/       # Auth, error handling, etc.
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic layer
│   │   └── utils/            # JWT helpers, validators, etc.
│   ├── prisma/               # Schema, migrations, seed
│   ├── .env.example          # Backend environment template
│   └── package.json
│
├── README.md
├── DEVELOPER_SETUP.md
└── .gitignore
```

---

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EASTERNCITY-rental-SYSTEM
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Run the Frontend
```bash
cd frontend
npm run dev
```

### 5. Run the Backend
```bash
cd backend
npm run dev
```

> For detailed environment configuration and database setup instructions, see [DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md).

---

## Environment Variables

Environment variables are separated by application layer.

| File | Purpose |
|---|---|
| `frontend/.env` | Local frontend config (not committed) |
| `frontend/.env.example` | Frontend environment template (committed) |
| `backend/.env` | Local backend config with real secrets (not committed) |
| `backend/.env.example` | Backend environment template (committed) |

> **Never commit `.env` files.** They contain sensitive credentials and are protected by `.gitignore`.

---

## Database Setup

The backend uses Prisma ORM. Run these commands from the `backend/` directory after configuring your `DATABASE_URL`:

```bash
npx prisma validate       # Validate the schema
npx prisma format         # Auto-format the schema file
npx prisma migrate deploy # Apply all pending migrations
npx prisma generate       # Generate the Prisma Client
```

---

## Development Guidelines

- **Keep concerns separated:** Frontend and backend are independent applications — do not mix logic across them.
- **Follow clean code practices:** Write readable, consistent, and well-named code.
- **Maintain stable API contracts:** Coordinate any changes to API endpoints or database schemas with all contributors.
- **Protect secrets:** Never hardcode credentials or commit `.env` files to version control.
- **Test before committing:** Verify that both the frontend and backend run correctly before pushing changes.

---

## Future Improvements

- **Mobile Application:** iOS and Android apps built with React Native for on-the-go access.
- **Advanced Search & Recommendations:** AI-driven property recommendations and intelligent filtering.
- **In-App Payment Integration:** Secure payment processing for booking deposits and subscription plans.
- **Map-Based Property Search:** Integrate a map view for location-based browsing of listings.
- **Multi-Language Support:** Internationalization (i18n) for broader audience reach.

---

## Screenshots

> Screenshots will be added upon final UI completion.

| Page | Preview |
|---|---|
| Home Page | *Coming soon* |
| User / Tenant Dashboard | *Coming soon* |
| Property Owner Dashboard | *Coming soon* |
| Admin Dashboard | *Coming soon* |
| Super Admin Dashboard | *Coming soon* |
| Listing Detail Page | *Coming soon* |
| Booking Flow | *Coming soon* |
| Messaging System | *Coming soon* |
