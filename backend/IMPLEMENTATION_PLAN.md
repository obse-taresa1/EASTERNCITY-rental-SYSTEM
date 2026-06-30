# Backend Implementation Plan

This plan reflects the current project state: a Vite React frontend with localStorage-backed workflows and an Express/Prisma backend scaffold that currently covers authentication and user management.

## Phase 0: Architecture Cleanup

Duration: 1-2 days

Tasks:
- Remove legacy account-type role separation and keep only USER, ADMIN, and SUPER_ADMIN.
- Remove old dashboard route contracts and keep /dashboard, /admin-dashboard, and /super-admin-dashboard.
- Remove role normalization that maps account-type aliases into roles.
- Standardize booking statuses to PENDING, ACCEPTED, ACTIVE, COMPLETED, CANCELLED, and REJECTED.
- Remove conflicting mock/localStorage logic as backend equivalents are implemented.
- Replace old localStorage dependencies only where real backend endpoints exist.

## Business Rules

Roles:
- USER
- ADMIN
- SUPER_ADMIN

Public registration always creates USER accounts. ADMIN and SUPER_ADMIN accounts must not be created from public registration. Admin creation belongs to SUPER_ADMIN-only flows.

Rental booking payments are handled physically between users. The platform must not process booking rental payments or expose booking payment endpoints.

Platform payments are limited to:
- Listing fee
- Promotion fee

## Booking Model

Required booking fields:
- id
- renterId
- ownerId
- listingId
- startDate
- endDate
- subtotal
- serviceFee
- totalAmount
- agreementAccepted
- cancellationReason
- approvedAt
- completedAt
- status
- createdAt
- updatedAt

Allowed statuses:
- PENDING
- ACCEPTED
- ACTIVE
- COMPLETED
- CANCELLED
- REJECTED

## Database Entities To Implement

Conversation:
- id
- participantOneId
- participantTwoId
- listingId
- lastMessageAt
- createdAt

ListingImage:
- id
- listingId
- imageUrl
- sortOrder
- createdAt

SystemSetting:
- id
- key
- value
- updatedById
- updatedAt

Initial system settings:
- listingFee
- featuredPrice
- maintenanceMode
- maxUploadSize

## Developer Allocation

Developer 1: Authentication + Users + Verification + Role Migration
Responsibilities:
- secure auth
- role migration
- verification
- SUPER_ADMIN-only admin creation
- JWT logic
- user profile

Developer 2: Listings + Uploads + Categories + Reviews + Promotions
Responsibilities:
- listing lifecycle
- upload middleware
- listing payment
- promotion payment
- reviews
- file handling

Developer 3: Bookings + Messaging + Notifications + Support + Dashboards
Responsibilities:
- booking lifecycle
- conversations
- notifications
- support tickets
- analytics
- dashboard APIs

## Security Requirements

Implemented in the scaffold now:
- Public registration forces USER accounts.
- Basic request validation exists for auth inputs.
- CORS uses an allowlist from CORS_ORIGINS.
- JSON payload size is limited to reduce base64 upload risk.
- Basic in-memory rate limiting is enabled.
- Request audit logging is enabled.

Required before production:
- Replace in-memory rate limiting with Redis or another shared store.
- Add schema-level request validation per endpoint.
- Add upload validation for MIME type, extension, size, and scanning hooks.
- Enforce ownership checks in every listing, booking, message, review, and support endpoint.
- Persist audit logs in a database table instead of console output.
- Store payment screenshots and ID images as file path/url only, never base64 in database.
- Create SUPER_ADMIN-only admin creation endpoints.
- Add tests for auth, role authorization, bookings, uploads, listing payments, promotions, and support flows.

## Verification Checklist

After each backend integration phase:
- npm run build
- Login works
- USER dashboard renders at /dashboard
- ADMIN dashboard renders at /admin-dashboard
- SUPER_ADMIN dashboard renders at /super-admin-dashboard
- Booking creation works without booking payment processing
- Listing creation works
- Promotion payment flow works only for platform promotion fees
- Admin approval works
- No white screen on protected routes
- No old role dashboard routes exist


