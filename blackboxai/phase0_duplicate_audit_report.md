# Duplicate-Removal Audit Report (Phase 0) — SecurePay NeoBank

> Status: **Audit planning + targeted inspection started**
>
> Tools note: automated repo-wide regex search (ripgrep) was unavailable in this environment, so audit is performed via targeted file reads.

## Scope
Frontend + backend: pages, APIs, routes, services, components, controllers, Redux slices, utility functions.

## Already Confirmed (baseline)
### Backend
- Wallet financial endpoints are protected by status middleware:
  - `backend/src/routes/walletRoutes.js` uses `requireActiveAccount()`.

- Status/scaffolding utilities and middleware exist:
  - `backend/src/utils/userStatus.js` defines `STATUSES`, `isTerminalBlocked`, `canTransition`.
  - `backend/src/middleware/authStatusMiddleware.js` defines:
    - `requireEmailVerified`
    - `requireNotBanned`
    - `requireActiveAccount`
    - `statusGuard`

- User onboarding and profile completion routes exist under:
  - `backend/src/routes/userRoutes.js`
  - contains `complete-profile`, bank accounts CRUD, KYC submit, beneficiaries/money-requests guarded by `requireActiveAccount()`.

- Admin actions exist under:
  - `backend/src/routes/adminRoutes.js`
  - implemented in `backend/src/controllers/adminController.js`.

### Frontend
- Routing uses `ProtectedRoute` with status-based redirects:
  - `frontend/src/routes/ProtectedRoute.jsx`
- Onboarding pages exist:
  - `frontend/src/pages/onboarding/*` (Complete Profile, Bank Details, KYC Upload, Await Approval)

## Duplicate Candidates (needs full inventory)
Because automated search is not available, the following are *candidates* requiring manual verification:

### Frontend (likely partial duplication)
- Wallet and transaction data handling:
  - `frontend/src/store/walletSlice.js` vs `frontend/src/store/transactionSlice.js`
  - pages:
    - `WalletOverviewPage.jsx`
    - `TransactionHistoryPage.jsx`, `TransactionDetailPage.jsx`
  - admin page:
    - `TransactionMonitoringPage.jsx`

### Backend (likely duplication risk)
- Transaction/history APIs:
  - `backend/src/controllers/walletController.js` implements transaction history & details.
  - admin controller implements transaction listing/flagged alerts.
  - Need to verify there is not another duplicate “transaction history” controller/service.

### Notifications
- Notification list API:
  - `backend/src/routes/notificationsRoutes.js`
  - `backend/src/controllers/notificationController.js`
  - `frontend/src/store/notificationSlice.js`
- Candidate duplication in UI:
  - `NotificationCenterPage.jsx` vs any admin notification widgets.

## Duplicate-Removal Report Template (to complete)
For each feature (Add Money, Send Money/Transfer, Receive Money, Beneficiaries, Money Requests, Transactions History, Notifications, Dashboard widgets):
- Duplicates found: [list]
- Kept implementation: [file path(s)]
- Removed implementation: [file path(s)]
- Routing/import updates: [list]

## What is missing to finish Phase 0
To finish the report and actually remove duplicates, we must:
1. Inspect all “candidate” files listed above in detail.
2. Identify whether duplicate functionality exists or whether they are distinct modules.
3. Make sure we do not delete shared components used by multiple pages.

## Next Steps (code will follow after approval)
- Continue targeted reads for:
  - `frontend/src/pages/wallet/SendMoneyPage.jsx`, `ReceiveMoneyPage.jsx`
  - `frontend/src/pages/transactions/*`
  - all frontend service wrappers: `frontend/src/services/*Api.js`
  - backend: verify transaction-related routes/services besides wallet controller.
- Then write a completed duplicate-removal report.

