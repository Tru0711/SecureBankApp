# SecurePay NeoBank — Project Overview

## 1) What the project is about
**SecurePay NeoBank** is a fintech **wallet + neo-banking** platform (MERN stack) that lets users:
- register and authenticate securely using **OTP + JWT**
- complete **KYC** (two-level verification) with an admin review workflow
- create and manage a **wallet** (balance, transactions, add-money)
- perform **P2P money transfers** and **receive money** via generated links/QR
- get **in-app/notification-center alerts** for wallet, KYC, and security events
- have high-value / suspicious actions governed by **fraud detection logic**

It also includes an **Admin Panel** for user management, KYC review, transaction monitoring, and fraud alerts.

## 2) What the project contains
The repository is split into two main applications plus supporting documentation:

### A) Frontend (React)
Location: `frontend/`

Key aspects:
- React + React Router UI flows
- Reusable UI components under `frontend/src/components/common/` and layout under `frontend/src/components/layout/`
- Role-based routing using `ProtectedRoute`
- Wallet / transfer / notifications / profile / KYC / admin screens

Notable UI areas (by pages/components present in the repo listing):
- **Auth**: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `OtpVerificationPage`
- **Wallet**: `WalletOverviewPage`, `AddMoneyPage`, `SendMoneyPage`, `ReceiveMoneyPage`
- **Transactions**: `TransactionHistoryPage`, `TransactionDetailPage`
- **Notifications**: `NotificationCenterPage`
- **Profile & KYC**: `KycUploadPage`, `PersonalDetailsPage`, `ManageBankAccountsSection`, `SecuritySettingsPage`
- **Admin**: `AdminDashboardPage`, `UserManagementPage`, `TransactionMonitoringPage`, `FraudAlertsPage`

Common components include:
- `GlassCard`, `StatusBadge`, `AmountDisplay`, `LoadingSpinner`, `EmptyState`
- `ConfirmModal` and form building blocks such as `FormInput`
- metrics + headers for consistent dashboard UI (`MetricCard`, `PageHeader`)

### B) Backend (Node + Express)
Location: `backend/`

Key aspects:
- Express routes/controllers split by domain:
  - auth
  - user
  - wallet
  - transactions
  - KYC
  - notifications
  - admin
  - fraud
- Middleware for security concerns:
  - authentication/session checks (`authStatusMiddleware`, etc.)
  - request validation and error handling
- Services implementing business logic:
  - wallet logic (`walletService.js`)
  - notification logic (`notificationService.js`)
  - admin operations (`adminController.js` and admin routes)
  - fraud-specific controller + routes
- KYC upload handling:
  - `backend/src/upload/kycUpload.js`

### C) Documentation (SRS/Architecture)
Location: `00_SRS_DOCUMENTATION/` and `backend/API_DOCUMENTATION.md`

The repo contains substantial architecture and requirement documentation, including:
- `01_SoftwareRequirementSpecification.md`
- `02_ArchitectureDesign.md`
- `03_ProjectOverview.md`
- `04_DocumentationIndex.md`

## 3) Unique aspects (what makes it stand out)
This project is not “just a wallet app”. It emphasizes **security, compliance workflow, and fraud-aware transaction handling**:

### 1) Security-first design
- OTP verification flows combined with JWT-based auth
- Device/session tracking concepts (device management + session control)
- Rate limiting + security middleware patterns
- Audit/logging mindset (models and architecture mention audit logs)

### 2) Two-level KYC with admin review
- Users submit KYC documents (including upload flow)
- Admin has dedicated KYC review/approval responsibilities
- KYC status impacts access to wallet actions (e.g., add money / transfers guarded by verification level)

### 3) Fraud detection & risk scoring as a first-class feature
- Fraud logic is integrated into transaction decision-making (risk score categories)
- Admin has fraud alert views to monitor flagged activity
- Dedicated fraud routes/controllers exist alongside standard wallet/transaction routes

### 4) End-to-end user/admin operational tooling
- Users: dashboard, notifications, wallet actions, security settings, KYC submission
- Admins: user management, transaction monitoring, KYC review center, fraud alerts

## 4) Roles the project supports
Based on the architecture/SRS and the presence of admin/user routes and pages:

1. **Regular User**
- Use wallet features, transfers, add money
- Upload KYC and check KYC status
- Manage security settings and view notifications

2. **Admin**
- Review and approve/reject KYC submissions
- Monitor transactions and fraud alerts
- Manage users (suspend/unsuspend, audit access)

3. **Fraud Analyst** (planned/structured in documentation)
- Review flagged cases and decide actions (manual review / overrides)

4. **Compliance Officer** (planned/structured in documentation)
- Oversee compliance reports and retention/audit policies

(Implementation in the current repo appears primarily focused on **User** + **Admin** for the active UI routes/pages, while additional roles are reflected in the documentation model.)

## 5) High-level module mapping (what each part “owns”)

### Frontend modules
- **Auth UI**: login/register/OTP verification/reset flows
- **Wallet UI**: balance + add money (Razorpay integration likely handled via backend)
- **Transfer UI**: send money screens, receive money (links/QR)
- **Transaction UI**: history + transaction detail pages
- **Notifications UI**: notification center and status changes
- **KYC UI**: KYC upload + status display
- **Admin UI**: user management, monitoring, fraud alerts

### Backend modules
- **Auth controllers/routes**: OTP, JWT, login/register-related actions
- **KYC controllers/routes**: document submission and admin approvals
- **Wallet controllers/routes**: wallet creation/balance/ledger and add-money flows
- **Transaction controllers/routes**: send/receive/transaction history
- **Notification controllers/routes**: notification creation and user retrieval
- **Admin controllers/routes**: user + KYC + monitoring + audit-oriented actions
- **Fraud controllers/routes**: risk scoring/flagging and actions

## 6) Where to look in the repo
- Frontend entry: `frontend/src/App.jsx` and `frontend/src/routes/AppRouter.jsx`
- Route guard: `frontend/src/routes/ProtectedRoute.jsx`
- Frontend wallet pages: `frontend/src/pages/wallet/`
- Frontend admin pages: `frontend/src/pages/admin/`
- Backend server start: `backend/src/server.js`
- Backend domain routes:
  - `backend/src/routes/walletRoutes.js`
  - `backend/src/routes/kycRoutes.js`
  - `backend/src/routes/notificationsRoutes.js`
  - `backend/src/routes/adminRoutes.js`
  - `backend/src/routes/fraudRoutes.js`

## 7) Summary in one line
**SecurePay NeoBank** combines a user wallet experience with **KYC approval workflows, security controls, and fraud-aware transaction handling**, plus an admin monitoring panel—built as a MERN-style full-stack system.
