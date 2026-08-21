# 🏙️ EasternCities Rental System

<p align="center">
  <b>A full-stack rental marketplace platform for Eastern Ethiopian cities — built for tenants, property owners, admins, and super admins.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat" />
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Project Status](#-project-status)
- [Live Demo](#-live-demo)
- [Features by Role](#-features-by-role)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Overview](#-api-overview)
- [Role-Based Access Control](#-role-based-access-control)
- [Promotion & Featured Listings System](#-promotion--featured-listings-system)
- [Image Handling & UI/UX Guidelines](#-image-handling--uiux-guidelines)
- [Community Module](#-community-module)
- [AI Assistant](#-ai-assistant)
- [Development Guidelines](#-development-guidelines)
- [Roadmap](#-roadmap)

---

## 🌍 Overview

**EasternCities Rental System** is a full-stack rental marketplace serving the cities of **Jigjiga**, **Dire Dawa**, and **Harar** in eastern Ethiopia. It covers the complete rental lifecycle — from listing discovery and verified identity checks, to bookings, messaging, promotions, community requests, and full administrative oversight.

The platform supports **four distinct user roles** with strict backend enforcement:

| Role | Description |
|---|---|
| **User / Tenant** | Browse, book, and manage listings |
| **Owner** | List properties, manage bookings, view earnings |
| **Admin** | Moderate content, approve listings, manage users |
| **Super Admin** | Full platform control, system settings, revenue analytics |

---

## 🚧 Project Status

This project is currently in **active development and testing**. While many core systems (authentication, listing browsing, role-based dashboards) are implemented, certain features and integrations remain in progress. Please refer to the [Roadmap](#-roadmap) to see the exact state of individual features.

---

## 🚀 Live Demo

> **Production:** https://easterncity-rental-system.onrender.com
> **Local Dev (Frontend):** `http://localhost:5173`
> **Local Dev (Backend API):** `http://localhost:5000`

---

## ✨ Features by Role

### 👤 User / Tenant Features
- Secure registration, login, password reset, and JWT-based authentication (access + refresh tokens)
- Browse all active listings with keyword, location, neighbourhood, price, and category filters
- View detailed listing pages with image gallery, reviews, and specs
- Request bookings and track booking status
- Save favourite listings across sessions
- In-platform messaging with listing owners
- Real-time notification system
- Leave and manage reviews on visited properties
- Submit identity verification requests with document uploads
- Manage profile settings, preferences, and account security
- Access a built-in help/support centre

### 🏠 Property Owner Features
- Multi-step listing creation wizard with image uploads (up to 10 photos)
- Manage, edit, and delete own listings
- Request promotional placement for listings (Featured Listing, Homepage Promotion, Hero Section)
- Upload payment proof for promotion requests and track approval status
- View promotion history including hero section placements
- Communicate with interested tenants via the messaging system

### 🛡️ Admin Features
- Full admin dashboard with summary statistics
- Approve, reject, or feature platform listings
- Manage all registered users (view, suspend, change role)
- Review and approve identity verification requests
- View and manage all platform bookings
- Moderate user-submitted reviews
- Manage listing categories
- Review and approve promotion requests — approved Hero promotions automatically appear in the homepage hero slider
- View banner advertisements and manage advertising campaigns
- Handle incoming support tickets and contact messages
- View admin-level analytics and reporting
- Admin-scoped personal preference settings (role-isolated from platform settings)

### 👑 Super Admin Features
- Platform-wide overview dashboard with KPIs and charts
- Manage and promote/demote admin accounts
- Full user and listing management across the entire platform
- Manage role-change requests
- Full revenue analytics and payment tracking
- Oversee all identity verifications
- Security centre with platform activity logs
- Real-time platform health monitoring
- Configure system-wide platform settings:
  - Platform name, currency, language
  - Maintenance mode toggle
  - Allow/disallow new listings and registrations
  - Promotion pricing (Featured Listing: 100 ETB/day, Homepage Promotion: 400 ETB/day)
  - Promotion duration rules (min 1 day, max 30 days)
  - Payment verification and admin approval requirements
- Manage contact messages, reports, and complaints

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | UI component framework |
| **Vite** | 5 | Build tool and dev server |
| **React Router** | v6 | Client-side routing with role guards |
| **Vanilla CSS** | — | Custom design system |
| **Bootstrap Icons** | — | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22 | Server runtime |
| **Express.js** | 4 | HTTP framework |
| **PostgreSQL (Neon)** | — | Cloud-hosted relational database |
| **Prisma ORM** | 5 | Schema management, migrations, type-safe queries |
| **JWT** | — | Stateless auth with access + refresh token rotation |
| **Bcrypt** | — | Password hashing |
| **Multer** | — | File uploads (listing images, payment proofs) |
| **Nodemailer** | — | Email delivery via SMTP |
| **Google Generative AI** | — | Backend-served AI assistant (Gemini) |

---

## 🏗️ Architecture

The project follows a **monorepo structure** with a clean separation between frontend and backend:

```
EASTERNCITY-rental-SYSTEM/
│
├── frontend/                         # React application (Vite)
│   ├── src/
│   │   ├── assets/                   # Static images and icons
│   │   ├── components/               # Reusable UI components
│   │   ├── context/                  # AuthContext, LanguageContext, etc.
│   │   ├── layouts/                  # Role-scoped layout wrappers
│   │   ├── pages/                    # Route-level components
│   │   ├── routes/                   # App router and role-based guards
│   │   ├── services/                 # API abstraction layer (apiClient.js)
│   │   ├── styles/                   # Global CSS stylesheets
│   │   └── utils/                    # Utility helpers
│   └── vite.config.js
│
├── backend/                          # Node.js / Express API
│   ├── src/
│   │   ├── controllers/              # Route handler logic
│   │   ├── services/                 # Business logic
│   │   ├── repositories/             # Data access layer
│   │   ├── routes/                   # Express route definitions
│   │   ├── middleware/               # Auth, role authorization, etc.
│   │   └── utils/                    # Helpers
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/               # Prisma migration history
│   └── server.js                     # Server entry point
│
├── README.md
├── DEVELOPER_SETUP.md
└── .gitignore
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- PostgreSQL database (local or Neon cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/EASTERNCITY-rental-SYSTEM.git
cd EASTERNCITY-rental-SYSTEM
```

### 2. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Configure Environment Variables
Copy the example files and fill in your values:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Set Up the Database
```bash
cd backend
npx prisma db push       # Apply schema to your DB
npx prisma generate      # Generate Prisma Client
```

### 5. Start the Development Servers
```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

> For full setup details, see [DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md).

---

## 🔐 Environment Variables

### `backend/.env`
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Assistant (server-side only — never expose to frontend)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# File Uploads
UPLOAD_DIR=./uploads
```

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:5000
```
> **Never commit `.env` files.** They are excluded by `.gitignore`. Do NOT add `GEMINI_API_KEY` to any `VITE_` frontend variable.

---

## 🗄️ Database Setup

All database management is done via Prisma from the `backend/` directory:

```bash
npx prisma db push         # Push schema changes to DB (dev, no migration files)
npx prisma migrate dev     # Create a new migration (interactive, dev only)
npx prisma migrate deploy  # Apply migrations in production
npx prisma generate        # Regenerate Prisma Client after schema changes
npx prisma studio          # Open visual DB browser
```

---

## 📡 API Overview

The REST API is prefixed at `/api`. Key verified route groups:

| Route Group | Path | Auth Required |
|---|---|---|
| Authentication | `/api/auth` | Public |
| Listings | `/api/listings` | Mixed |
| Bookings | `/api/bookings` | User+ |
| Promotions | `/api/promotions` | User+ |
| Hero Promotions (read) | `/api/advertising/hero-promotions/active` | Public |
| Hero Promotions (write) | `/api/advertising/hero-promotions` | Admin+ |
| Featured Listings (admin) | `/api/advertising/featured-listings` | Admin+ |
| Messaging | `/api/messages` | User+ |
| Notifications | `/api/notifications` | User+ |
| Reviews | `/api/reviews` | User+ |
| Community | `/api/community` | User+ |
| Support | `/api/support-tickets` | User+ |
| Contact Messages | `/api/contact-messages` | Public / User+ |
| Admin Management | `/api/admin-management` | Admin+ |
| Settings (GET) | `/api/admin-management/settings` | Admin+ (role-filtered) |
| Platform Settings (PUT) | `/api/admin-management/settings/platform` | Super Admin only |
| Admin Preferences (PUT) | `/api/admin-management/settings/admin` | Admin+ |

---

## 🔒 Role-Based Access Control

Access control is enforced on **both frontend and backend**:

- **Frontend:** Route guards redirect unauthorized users. Admin/Super Admin UI is hidden based on role.
- **Backend:** The `authorize(role)` middleware returns `403 Forbidden` if the user lacks the required role.

### Settings Isolation

| Setting Type | Who Can Access | Keys |
|---|---|---|
| Platform settings | Super Admin only | `platformName`, `currency`, `maintenanceMode`, `allowNewListings`, promotion pricing, etc. |
| Admin preferences | Admin (own only) | Namespaced as `admin_<key>_<userId>` |

Admins who attempt to `GET` or `PUT` platform settings via direct API calls receive a `403` response — enforcement is strictly backend-only.

---

## 🌟 Promotion & Featured Listings System

Featured Listings are strictly time-bound and do not act as a permanent listing state. The entire Featured lifecycle is driven by the backend `Promotion` system.

### Promotion Packages
| Package | Placement Value |
|---|---|
| Featured Listing | `FEATURED` |
| Homepage Promotion | `HERO_PROMOTION` |
| Hero Section | `HERO_SECTION` |

### Complete Lifecycle
1. **Request:** A user submits a promotion request with payment proof from the "My Listings" dashboard.
2. **Review:** An admin reviews the request and payment in Promotion Management.
3. **Approval:** Upon approval, the promotion receives active `startDate` and `endDate` timestamps.
4. **Active State:** 
   - While the promotion is active, the listing appears dynamically in the Featured Listings section (pulled via the `/api/promotions/featured/active` endpoint).
   - The listing receives the appropriate `★ FEATURED` badge overlay.
   - For `HERO_PROMOTION` or `HERO_SECTION`, a `HeroPromotion` record is automatically generated so the listing appears in the main homepage hero slider.
   - The application ensures listings are deduplicated so the same property does not appear multiple times on the same page.
5. **Expiration:** Once the `endDate` passes, the backend naturally stops returning the listing as featured, and the property automatically reverts to normal status. 

---

## 🖼️ Image Handling & UI/UX Guidelines

### Multiple Listing Images (Card vs Gallery)
Listings can contain up to 10 images. 
- **Listing Cards:** By default, cards display a smooth, automatic slideshow of all available images without requiring user interaction. The primary/cover image acts as a fallback. 
- **Gallery View:** The full listing detail page presents an interactive grid or gallery view for manual inspection.
- **Card Containers:** Images are rendered inside fixed-dimension containers using `object-fit: cover` to ensure they are never stretched or distorted.
- **Image Fallbacks:** Any broken or missing images gracefully downgrade to a category-specific fallback image placeholder.

### Hero Images
Hero section images dynamically pull from `HeroPromotion` records.
- **Focal Positioning:** Hero images must remain visually clear and are also styled with `object-fit: cover` (and `object-position: top center` or `center center`) so they never stretch regardless of screen size.
- **Responsive Handling:** The hero slider seamlessly adapts from desktop ultra-wide displays down to mobile viewports while preserving the intended full-screen presentation.

### UI/UX Behavior
- **Responsive Layouts:** The entire application (cards, tables, forms, and heroes) supports mobile, tablet, and desktop views.
- **Loading & Empty States:** Network requests always trigger localized loading spinners or skeleton loaders. If data is absent, a clean, user-friendly "Empty State" message is shown.
- **API Error States:** Robust `try/catch` boundaries ensure that failed API requests show graceful error banners rather than crashing the React tree.
- **Badges:** Overlay badges (like Featured, Location) strictly reflect actual promotion status. They are absolute-positioned with appropriate z-indexes to prevent collision with image sliders or titles.
- **Interactions:** Buttons and controls clearly perform documented actions (e.g., clicking a navigation dot changes the active slide, clicking the wish-list heart saves a listing locally or to the backend).

---

## 🤝 Community Module

The Community page allows authenticated users to:
- Post and browse community requests (help requests, offers, events)
- View detailed community posts with full discussion
- Admins can manage and moderate all community posts from the admin panel

---

## 🤖 AI Assistant

The platform includes a built-in AI assistant powered by **Google Gemini**:
- Served exclusively by the backend at `/api/ai-chat`
- The API key is **never exposed to the frontend**
- Configured via `GEMINI_API_KEY` in `backend/.env`
- Frontend calls the backend endpoint only

---

## 📐 Development Guidelines

- **Separation of concerns:** Frontend and backend are independent. Never mix logic across them.
- **API contracts:** Coordinate any changes to endpoints or Prisma schema before merging.
- **Role security:** Never rely on frontend-only role checks. Always enforce roles in the backend `authorize` middleware.
- **Image URLs:** Uploaded file paths stored in the DB are relative (e.g., `/uploads/...`). Use `resolveAssetUrl()` from `apiClient.js` in the frontend to prepend the correct backend base URL.
- **Secrets:** Never hardcode credentials. Never add server-side secrets to `VITE_` variables.
- **Schema changes:** After every `schema.prisma` change, run `npx prisma generate` and restart the backend.

---

## 🗺️ Roadmap

| Feature | Status |
|---|---|
| Core rental marketplace | ✅ Complete |
| JWT auth with refresh tokens | ✅ Complete |
| Multi-role dashboard system | ✅ Complete |
| Listing promotions & hero slider | ✅ Complete |
| Community requests module | ✅ Complete |
| Advertising management | ✅ Complete |
| Role-based settings (backend enforced) | ✅ Complete |
| AI assistant (Gemini) | ✅ Complete |
| Advanced Image Sliders | 🔄 Testing |
| Map-based property search | 🔜 Planned |
| Mobile app (React Native) | 🔜 Planned |
| In-app payment gateway integration | 🔜 Planned |
| Push notifications | 🔜 Planned |
| Advanced AI recommendations | 🔜 Planned |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Built with ❤️ for Eastern Ethiopian cities — Jigjiga, Dire Dawa & Harar</p>