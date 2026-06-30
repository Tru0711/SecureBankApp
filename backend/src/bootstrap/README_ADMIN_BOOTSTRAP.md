# Admin Bootstrap (One-time)

This project supports one-time creation of an initial ADMIN user when none exist.

## Required env vars
- BOOTSTRAP_ADMIN_EMAIL
- BOOTSTRAP_ADMIN_PASSWORD
- BOOTSTRAP_ADMIN_PHONE (must match /^[6-9]\d{9}$/)
- BOOTSTRAP_ADMIN_DOB (ISO date string, e.g. 1990-01-01)
- BOOTSTRAP_ADMIN_FIRST_NAME
- BOOTSTRAP_ADMIN_LAST_NAME

## Behavior
- If any user exists with `role: 'ADMIN'`, bootstrap does nothing.
- If no ADMIN exists, it creates one with:
  - `isEmailVerified: true`
  - `accountStatus: 'ACTIVE'`

