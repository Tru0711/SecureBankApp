# Phase 1 - Admin bootstrap + Approval workflow plan (Patch)

## Goal
- Ensure an initial ADMIN user exists so `/admin` is reachable.
- Bootstrap should be **one-time** and controlled via env vars.

## Inputs (provided by user)
- Admin email: `admin@gmail.com`
- Admin password: `admin123`

## Bootstrap design
Create a bootstrap module that runs after DB connect (server startup):
1) Check if any user exists with `role: 'ADMIN'`.
2) If none exists:
   - Create user with:
     - `email`, `phone` (optional—must satisfy schema). If phone required, create a deterministic placeholder phone or require env `BOOTSTRAP_ADMIN_PHONE`.
     - `password` (plain; schema hashes via pre-save hook).
     - `firstName`, `lastName`, `dateOfBirth` (schema requires).
     - `isEmailVerified: true` and `accountStatus: 'ACTIVE'` (so login + access works immediately).
     - `role: 'ADMIN'`
3) Log to console that bootstrap completed.

## Critical constraints
- `User` schema requires:
  - `firstName`, `lastName`, `email`, `phone`, `password`, `dateOfBirth`
- Therefore bootstrap must supply or require:
  - `BOOTSTRAP_ADMIN_PHONE`
  - `BOOTSTRAP_ADMIN_DOB` (ISO date string)
  - `BOOTSTRAP_ADMIN_FIRST_NAME`, `BOOTSTRAP_ADMIN_LAST_NAME`

## Code changes (file-level)
1) Add file: `backend/src/bootstrap/adminBootstrap.js`
2) Modify: `backend/src/server.js` to import & run bootstrap after `connectDB()`.
3) Modify: `backend/.env.example` to include needed bootstrap env vars.

## User-visible outcome
- After restart, there will be exactly one initial admin account.
- Admin can log in at `/login` and visit `/admin`.

## Followup testing
- Restart backend.
- Verify via login with `admin@gmail.com / admin123`.
- Confirm `/api/v1/admin/dashboard` returns 200.

