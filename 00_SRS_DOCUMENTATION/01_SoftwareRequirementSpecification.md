# SecurePay NeoBank – AI Powered FinTech Wallet Platform
## Software Requirement Specification (SRS) Document

**Project Name:** SecurePay NeoBank – AI Powered FinTech Wallet Platform  
**Version:** 1.0  
**Date:** June 13, 2026  
**Status:** Active Development  
**Classification:** Production Grade - Financial Technology Platform

---

## 1. EXECUTIVE SUMMARY

SecurePay NeoBank is a cutting-edge fintech wallet and neo-banking platform designed to revolutionize digital payments and financial management. It combines modern MERN stack architecture with advanced security protocols, AI-powered fraud detection, and seamless user experience to provide a comprehensive banking solution for modern users.

The platform enables users to manage their finances, conduct peer-to-peer transfers, perform KYC verification, integrate with payment gateways, and leverage AI-driven security mechanisms to prevent fraudulent transactions.

---

## 2. PROJECT VISION & OBJECTIVES

### 2.1 Vision
To create a secure, user-friendly, and scalable neo-banking platform that democratizes financial services through advanced technology, ensuring every user can perform banking operations with complete confidence and security.

### 2.2 Objectives
- **User Accessibility:** Provide intuitive interfaces for seamless financial operations
- **Security First:** Implement enterprise-grade security with multi-layer protection
- **Fraud Prevention:** Deploy AI-powered real-time fraud detection
- **Scalability:** Design for millions of concurrent users and transactions
- **Compliance:** Ensure regulatory compliance with fintech standards
- **Innovation:** Integrate modern fintech features (wallet, KYC, P2P transfers)
- **Performance:** Maintain sub-second response times for all operations

---

## 3. SCOPE OF PROJECT

### 3.1 Functional Scope - INCLUDED
✅ User registration and authentication  
✅ KYC (Know Your Customer) verification system  
✅ Wallet creation and management  
✅ Money addition (Razorpay integration)  
✅ Peer-to-peer money transfers  
✅ Transaction history and analytics  
✅ Profile management  
✅ Real-time notifications  
✅ AI-based fraud detection  
✅ Advanced security features (device tracking, session management)  
✅ User dashboard  
✅ Admin panel with monitoring capabilities  

### 3.2 Scope - NOT INCLUDED
❌ Loan/credit products (future phase)  
❌ Investment portfolio management (future phase)  
❌ Bill payment integration (future phase)  
❌ Third-party app integrations (Phase 2)  
❌ Cryptocurrency trading (future phase)  
❌ Insurance products (future phase)

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Authentication Module
**FR-1.1:** User Registration
- Accept email, phone, name, password
- Validate email format and uniqueness
- Password strength validation (min 8 chars, uppercase, lowercase, numbers, special chars)
- OTP verification via email
- Store passwords using bcrypt with salt rounds of 12

**FR-1.2:** User Login
- Email/phone and password-based authentication
- JWT token generation (15 minutes expiry)
- Refresh token generation (7 days expiry)
- Failed login attempt tracking (max 5 attempts)
- Account lockout mechanism (15 minutes)

**FR-1.3:** OTP Management
- Generate 6-digit OTP
- OTP expiry: 10 minutes
- OTP delivery via email
- OTP verification during registration

**FR-1.4:** Refresh Token Management
- Issue new JWT on refresh token validation
- Invalidate tokens on logout
- Track refresh token usage for security

**FR-1.5:** Session Management
- Track active user sessions
- Device information logging (IP, User-Agent, Device ID)
- Multi-device login support (max 3 concurrent sessions)
- Session timeout: 30 minutes of inactivity

### 4.2 User Profile & KYC Module
**FR-2.1:** Profile Management
- View/edit basic info (name, email, phone, DOB)
- Upload profile picture
- Update address information
- Set security preferences

**FR-2.2:** KYC Verification (Level 1 - Minimum)
- Collect PAN (Permanent Account Number)
- Collect Aadhar/ID proof
- Address verification
- Phone and email verification
- Store KYC documents (encrypted)

**FR-2.3:** KYC Verification (Level 2 - Enhanced)
- Video KYC recording
- Facial recognition verification
- Liveness detection
- Document authenticity check
- Approval/rejection workflow

**FR-2.4:** User Status Management
- KYC Status: Pending, Approved, Rejected, Resubmit
- Account Status: Active, Suspended, Closed
- Verification badges on profile

### 4.3 Wallet & Money Management Module
**FR-3.1:** Wallet Creation
- Automatic wallet creation on KYC approval
- Unique wallet ID generation
- Multiple wallet support (future)
- Wallet balance tracking

**FR-3.2:** Money Addition (Razorpay Integration)
- Display add money form
- Amount validation (min ₹100, max ₹1,00,000)
- Razorpay payment gateway integration
- Payment status callback handling
- Wallet balance update on successful payment
- Payment failure handling and retry mechanism

**FR-3.3:** Wallet Balance Management
- Real-time balance display
- Ledger-based balance tracking
- Account reconciliation
- Balance reversal on failed transactions

**FR-3.4:** Payment Methods
- Card (Credit/Debit) via Razorpay
- UPI (future integration)
- Bank transfer (future integration)
- Payment method storage (tokenization)

### 4.4 Money Transfer Module
**FR-4.1:** Send Money
- Recipient identification (phone/email/wallet ID)
- Amount validation (min ₹10, max user limit)
- Transaction description/note
- OTP verification for amounts > ₹5,000
- Transaction confirmation page
- Real-time balance deduction
- Recipient notification

**FR-4.2:** Receive Money
- Unique payment link generation
- Share via QR code, link, or social
- Automatic balance credit on payment
- Payment notification

**FR-4.3:** Transaction Verification
- Recipient validation (phone/email confirmation)
- Transaction reversal window (24 hours)
- Confirmation before sending
- Transaction receipt generation

**FR-4.4:** Transaction Limits
- Daily transaction limit: ₹1,00,000
- Per transaction limit: ₹50,000
- Monthly transaction limit: ₹10,00,000

### 4.5 Transaction History Module
**FR-5.1:** View Transactions
- Display all transactions (sent, received, added)
- Filter by date range, type, status
- Search transactions
- Sort by date, amount, status
- Pagination (20 records per page)

**FR-5.2:** Transaction Details
- Transaction ID, timestamp, amount
- Recipient/sender details
- Transaction status
- Fee (if applicable)
- Reference number

**FR-5.3:** Transaction Export
- Download transaction history as CSV
- Download as PDF statement
- Monthly statement generation

**FR-5.4:** Transaction Analytics
- Spending patterns visualization
- Income vs expense charts
- Category-wise breakdown (future)
- Monthly trend analysis

### 4.6 Notification Module
**FR-6.1:** Push Notifications
- In-app notifications
- Email notifications
- SMS notifications (future)
- Web push notifications

**FR-6.2:** Notification Types
- Transaction received alerts
- Transaction sent confirmations
- Payment failures
- Security alerts (login from new device)
- KYC status updates
- System maintenance alerts
- New feature notifications

**FR-6.3:** Notification Preferences
- Enable/disable by type
- Frequency settings
- Time-based quiet hours
- Notification history (7 days retention)

### 4.7 AI Fraud Detection Module
**FR-7.1:** Real-time Fraud Detection
- Analyze transaction patterns
- Detect anomalous behavior
- Identify unusual payment amounts
- Detect rapid consecutive transactions
- Geographic anomaly detection
- Device fingerprinting analysis

**FR-7.2:** Risk Scoring
- Calculate risk score (0-100)
- Low risk: Auto-approve
- Medium risk: Request OTP verification
- High risk: Block transaction, notify user
- Critical risk: Lock account, notify admin

**FR-7.3:** Fraud Prevention Actions
- Block suspicious transactions
- Request additional verification
- Lock account temporarily
- Generate fraud alerts
- Notify user of suspicious activity

**FR-7.4:** Machine Learning Model
- Continuous model training
- Transaction classification (Legitimate/Fraudulent)
- Model accuracy tracking
- False positive minimization

### 4.8 Security Features Module
**FR-8.1:** Device Management
- Register trusted devices
- Device fingerprinting
- Biometric authentication support
- Device revocation
- Unknown device alerts

**FR-8.2:** Two-Factor Authentication (2FA)
- OTP-based 2FA
- Time-based OTP (TOTP) support
- Backup codes generation
- 2FA enforcement for high-value transactions

**FR-8.3:** Encryption
- End-to-end encryption for sensitive data
- AES-256 encryption for stored data
- TLS 1.3 for data in transit
- Key rotation mechanism

**FR-8.4:** Activity Logging
- Log all user actions
- Failed authentication attempts
- Privilege escalation attempts
- Data access logs
- Admin action tracking

**FR-8.5:** Security Settings
- Change password
- View active sessions
- Device management
- Login alerts
- Suspicious activity reports

### 4.9 User Dashboard Module
**FR-9.1:** Dashboard Components
- Wallet balance display
- Recent transactions (last 5)
- Quick action buttons (Send Money, Add Money, Pay Bill)
- Notification center
- Profile summary

**FR-9.2:** Account Summary
- Total balance
- Monthly spending
- Pending requests
- KYC status
- Security score

**FR-9.3:** Quick Actions
- Send money (shortcut)
- Request money (shortcut)
- Add money (shortcut)
- View all transactions (shortcut)
- Settings access

### 4.10 Admin Panel Module
**FR-10.1:** User Management
- View all users
- Filter/search users
- View user details
- Suspend/unsuspend accounts
- Reset user passwords
- View user activity logs

**FR-10.2:** Transaction Monitoring
- View all transactions
- Filter by date, amount, status
- Flagged transactions list
- Transaction approval/rejection
- Refund processing

**FR-10.3:** KYC Verification
- Pending KYC approvals queue
- Review KYC documents
- Approve/reject KYC
- Request additional documents
- KYC compliance reporting

**FR-10.4:** Fraud Management
- View flagged transactions
- Fraud alert dashboard
- AI model performance monitoring
- Block lists management
- Dispute resolution

**FR-10.5:** System Monitoring
- System health dashboard
- API performance metrics
- Error rate tracking
- User activity analytics
- Revenue dashboard

**FR-10.6:** Reporting & Analytics
- User growth reports
- Transaction volume reports
- Revenue reports
- KYC completion rates
- Fraud rate statistics

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance Requirements
**NFR-1.1:** Response Time
- API response time: < 200ms (P95)
- Dashboard load time: < 1.5 seconds
- Transaction processing: < 500ms
- Search functionality: < 1 second

**NFR-1.2:** Throughput
- Support 10,000 concurrent users
- Process 1,000 transactions per second
- Handle 100,000+ daily active users

**NFR-1.3:** Database Performance
- Query response time: < 50ms
- Database connection pooling
- Query optimization and indexing

### 5.2 Security Requirements
**NFR-2.1:** Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (RBAC)
- OAuth 2.0 support (future)
- API key management for external integrations

**NFR-2.2:** Data Protection
- AES-256 encryption for sensitive data
- TLS 1.3 for all communications
- Password hashing: bcrypt (salt rounds: 12)
- Data masking for PII in logs
- GDPR compliance for data retention

**NFR-2.3:** API Security
- Rate limiting: 100 requests/minute per user
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)
- CSRF token validation
- CORS configuration

**NFR-2.4:** Infrastructure Security
- Firewalls and WAF
- DDoS protection
- SSL/TLS certificates (auto-renewal)
- Network segmentation
- VPN for admin access

**NFR-2.5:** Compliance
- PCI DSS compliance for payment handling
- GDPR compliance
- Data localization compliance
- Audit trails for all transactions
- Regular security audits

### 5.3 Scalability Requirements
**NFR-3.1:** Horizontal Scalability
- Stateless backend design
- Load balancing across instances
- Auto-scaling policies
- Container orchestration (Kubernetes ready)

**NFR-3.2:** Database Scalability
- Sharding strategy for user data
- Read replicas for analytics
- Connection pooling
- Query optimization

**NFR-3.3:** Caching Strategy
- Redis for session management
- Cache for frequently accessed data
- CDN for static assets
- Cache invalidation strategy

### 5.4 Availability & Reliability
**NFR-4.1:** Uptime SLA
- 99.95% uptime (52 minutes downtime/month)
- Zero-downtime deployments
- Graceful degradation

**NFR-4.2:** Disaster Recovery
- Automated backups every 6 hours
- Backup retention: 30 days
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes
- Disaster recovery drills quarterly

**NFR-4.3:** Monitoring & Alerting
- Real-time monitoring dashboard
- Alert thresholds for critical metrics
- Automated incident escalation
- Log aggregation and analysis

### 5.5 Maintainability Requirements
**NFR-5.1:** Code Quality
- Code coverage: > 80%
- Automated testing (Unit, Integration, E2E)
- Code review mandatory before merge
- Static code analysis
- Documentation standards

**NFR-5.2:** Deployment
- CI/CD pipeline automation
- Blue-green deployment strategy
- Rollback capability
- Environment parity (Dev, Staging, Prod)

**NFR-5.3:** Logging & Monitoring
- Structured logging (JSON format)
- Log retention: 30 days
- Centralized log management
- Debug logs for troubleshooting

### 5.6 Usability Requirements
**NFR-6.1:** User Interface
- Responsive design (Mobile, Tablet, Desktop)
- WCAG 2.1 AA accessibility compliance
- Load time optimization
- Browser compatibility (Chrome, Firefox, Safari, Edge)

**NFR-6.2:** User Experience
- Intuitive navigation
- Clear error messages
- Confirmation dialogs for critical actions
- Undo capabilities where applicable
- Dark mode support (future)

### 5.7 Compliance & Privacy
**NFR-7.1:** Regulatory Compliance
- RBI guidelines for fintech
- NIST Cybersecurity Framework
- ISO/IEC 27001 compliance roadmap
- Anti-money laundering (AML) checks

**NFR-7.2:** Privacy
- Privacy by design principles
- User consent management
- Data retention policies
- Right to be forgotten implementation
- Transparent data usage policies

---

## 6. COMPLETE MODULE LIST

### Core Modules
1. **Authentication Module** - User login, registration, token management
2. **User Profile Module** - Profile management, preferences
3. **KYC Module** - Know Your Customer verification and document management
4. **Wallet Module** - Wallet creation, balance management
5. **Payment Integration Module** - Razorpay integration
6. **Money Transfer Module** - P2P transfers, request money
7. **Transaction Module** - Transaction history, analytics
8. **Notification Module** - Push, email, in-app notifications
9. **Security Module** - Device management, session handling, encryption
10. **Fraud Detection Module** - AI-powered fraud detection service
11. **User Dashboard Module** - User dashboard and analytics
12. **Admin Panel Module** - Admin management and monitoring
13. **Settings Module** - User preferences and configurations
14. **Support Module** - Help center, ticket system (basic)

---

## 7. USER ROLES & PERMISSIONS

### 7.1 User Roles

#### Role 1: Regular User
**Description:** Standard end-user with wallet and transaction capabilities  
**Permissions:**
- View personal profile
- Complete KYC
- Create/manage wallet
- Send money to other users
- Receive money
- View transaction history
- Add money (Razorpay)
- Manage security settings
- View notifications
- Download transaction statements

#### Role 2: Premium User (Future)
**Description:** Enhanced access and features  
**Additional Permissions:**
- Higher transaction limits
- Priority customer support
- Referral program
- Early access to new features

#### Role 3: Admin
**Description:** System administrator with full control  
**Permissions:**
- Manage all users
- Approve/reject KYC
- Monitor transactions
- View system analytics
- Manage fraud alerts
- Access audit logs
- System configuration
- User suspension/unsuspension
- Generate reports
- Manage support tickets

#### Role 4: Fraud Analyst (Future)
**Description:** Specialized role for fraud investigation  
**Permissions:**
- View flagged transactions
- Investigate fraud cases
- Block/unblock users
- Generate fraud reports

#### Role 5: Compliance Officer (Future)
**Description:** Regulatory compliance management  
**Permissions:**
- View compliance reports
- Audit user activities
- Generate regulatory reports
- Manage data retention policies

### 7.2 Permission Matrix

| Feature | User | Premium | Admin | Fraud Analyst | Compliance |
|---------|------|---------|-------|---------------|-----------|
| View Profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit Profile | ✓ | ✓ | - | - | - |
| Complete KYC | ✓ | ✓ | - | - | - |
| Send Money | ✓ | ✓ | - | - | - |
| Receive Money | ✓ | ✓ | - | - | - |
| View Transactions | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Users | - | - | ✓ | - | - |
| Approve KYC | - | - | ✓ | - | - |
| Monitor Fraud | - | - | ✓ | ✓ | - |
| View Reports | - | - | ✓ | ✓ | ✓ |
| System Config | - | - | ✓ | - | - |

---

## 8. DATABASE DESIGN

### 8.1 Database Selection Rationale
**MongoDB Atlas** chosen for:
- Flexible schema for KYC document variations
- Horizontal scalability
- Real-time data processing
- JSON-like data structure matches JavaScript ecosystem
- Built-in replication and sharding
- Managed service (reduced ops overhead)

### 8.2 Data Storage Strategy
- **Hot Data:** Current user sessions, recent transactions (Redis cache)
- **Warm Data:** User profiles, wallets, transaction history (MongoDB)
- **Cold Data:** Archived transactions, old documents (S3-like storage)

### 8.3 Backup & Recovery
- Automated daily backups
- 30-day retention period
- Cross-region backup replication
- Point-in-time recovery capability

---

## 9. MONGODB COLLECTIONS DESIGN

### 9.1 Users Collection
```
{
  _id: ObjectId,
  email: String (unique, indexed),
  phone: String (unique, indexed),
  passwordHash: String,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  profilePicture: String (URL),
  status: String (Active, Suspended, Closed),
  kycStatus: String (Pending, Approved, Rejected, Resubmit),
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  emailVerified: Boolean,
  phoneVerified: Boolean,
  twoFactorEnabled: Boolean,
  notificationPreferences: {
    email: Boolean,
    push: Boolean,
    sms: Boolean,
    quiet_hours: { start: Time, end: Time }
  }
}
```

### 9.2 Wallets Collection
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  walletId: String (unique),
  balance: Decimal,
  currency: String (default: INR),
  status: String (Active, Frozen, Closed),
  createdAt: Date,
  updatedAt: Date,
  kycApprovedDate: Date
}
```

### 9.3 Transactions Collection
```
{
  _id: ObjectId,
  transactionId: String (unique),
  senderId: ObjectId (indexed),
  receiverId: ObjectId (indexed),
  amount: Decimal,
  type: String (Transfer, Deposit, Withdrawal, Refund),
  status: String (Pending, Completed, Failed, Reversed),
  description: String,
  transactionFee: Decimal,
  totalAmount: Decimal,
  reason: String,
  createdAt: Date (indexed),
  updatedAt: Date,
  completedAt: Date,
  metadata: {
    orderId: String,
    paymentId: String,
    ipAddress: String,
    userAgent: String,
    deviceId: String
  },
  fraudStatus: String (Safe, Flagged, Blocked),
  fraudScore: Number (0-100),
  reversible: Boolean,
  reversalDeadline: Date
}
```

### 9.4 KYC Documents Collection
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  kycLevel: String (Level1, Level2),
  status: String (Pending, Approved, Rejected, ReSubmit),
  documents: [
    {
      type: String (PAN, Aadhar, Passport, DrivingLicense, Address),
      fileUrl: String,
      encryptedFileUrl: String,
      uploadedAt: Date,
      verificationStatus: String (Pending, Verified, Rejected)
    }
  ],
  personalInfo: {
    pan: String,
    aadharLast4: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  videoKycData: {
    videoUrl: String,
    livenessScore: Number,
    facialMatch: Number,
    capturedAt: Date
  },
  submittedAt: Date,
  approvedAt: Date,
  approvedBy: ObjectId (Admin user),
  rejectionReason: String,
  resubmissionCount: Number
}
```

### 9.5 Sessions Collection
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  refreshToken: String (hashed, unique),
  deviceInfo: {
    deviceId: String,
    ipAddress: String,
    userAgent: String,
    deviceName: String,
    os: String
  },
  createdAt: Date,
  expiresAt: Date (TTL index),
  lastActivityAt: Date,
  isTrusted: Boolean
}
```

### 9.6 Devices Collection
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  deviceId: String (unique),
  deviceName: String,
  os: String,
  browser: String,
  ipAddress: String,
  fingerprint: String,
  isVerified: Boolean,
  isTrusted: Boolean,
  createdAt: Date,
  lastUsedAt: Date,
  verificationCode: String,
  verificationCodeExpiry: Date
}
```

### 9.7 OTP Verification Collection
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  email: String (indexed),
  phone: String,
  otpCode: String (hashed),
  type: String (Registration, PasswordReset, Transaction, Login),
  attempt: Number,
  createdAt: Date,
  expiresAt: Date (TTL index),
  isVerified: Boolean,
  verifiedAt: Date
}
```

### 9.8 Notifications Collection
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  title: String,
  message: String,
  type: String (Transaction, Security, KYC, System),
  relatedEntity: {
    entityType: String,
    entityId: ObjectId
  },
  isRead: Boolean,
  readAt: Date,
  createdAt: Date (TTL index for 7 days),
  actions: [
    {
      label: String,
      url: String
    }
  ]
}
```

### 9.9 Audit Logs Collection
```
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  action: String,
  entityType: String,
  entityId: ObjectId,
  oldValue: Object,
  newValue: Object,
  ipAddress: String,
  userAgent: String,
  status: String (Success, Failure),
  errorMessage: String,
  createdAt: Date (indexed, TTL: 90 days)
}
```

### 9.10 Money Requests Collection
```
{
  _id: ObjectId,
  requestId: String (unique),
  senderId: ObjectId (indexed),
  receiverId: ObjectId,
  amount: Decimal,
  reason: String,
  status: String (Pending, Accepted, Rejected, Expired),
  expiresAt: Date,
  paymentLink: String,
  createdAt: Date,
  respondedAt: Date
}
```

### 9.11 Fraud Flags Collection
```
{
  _id: ObjectId,
  transactionId: ObjectId (indexed),
  userId: ObjectId (indexed),
  riskScore: Number (0-100),
  flags: [
    {
      type: String (AnomalousAmount, RapidTransactions, UnusualLocation),
      severity: String (Low, Medium, High, Critical),
      description: String
    }
  ],
  mlPrediction: String (Legitimate, Fraudulent),
  confidence: Number,
  actionTaken: String (Auto-Approve, Request-OTP, Block, Manual-Review),
  reviewedBy: ObjectId,
  reviewedAt: Date,
  createdAt: Date
}
```

### 9.12 Admin Actions Log Collection
```
{
  _id: ObjectId,
  adminId: ObjectId (indexed),
  action: String,
  targetUserId: ObjectId,
  targetEntity: String,
  description: String,
  oldValue: Object,
  newValue: Object,
  reason: String,
  status: String (Success, Failure),
  createdAt: Date (indexed)
}
```

---

## 10. ER DIAGRAM DESCRIPTION

### Entity Relationship Overview

```
┌─────────────┐         1:1          ┌─────────────┐
│    Users    │◄──────────────────────│   Wallets   │
└─────────────┘                       └─────────────┘
     │ 1                                     │
     │                                       │
     │ N                                     │ N
     │                                       │
     ├─────────────────┬────────────────────┤
     │                 │                    │
     │                 ▼                    ▼
     │           ┌──────────────┐    ┌────────────────┐
     │           │Transactions  │    │MobileDevices   │
     │           └──────────────┘    └────────────────┘
     │
     ├──────────────────┬──────────────────┐
     │                  │                  │
     ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│  Sessions   │  │KYCDocuments │  │Notifications │
└─────────────┘  └─────────────┘  └──────────────┘
     │
     │ 1:N
     ▼
┌─────────────┐
│  OTPVerify  │
└─────────────┘

Transactions Entity:
  - senderId → Users._id (Foreign Key)
  - receiverId → Users._id (Foreign Key)
  - Supports multiple types (Transfer, Deposit, Withdrawal, Refund)

Money Requests Entity:
  - senderId → Users._id
  - receiverId → Users._id (Optional for payment links)
  - Links to potential transactions

Fraud Flags Entity:
  - transactionId → Transactions._id
  - userId → Users._id
  - Contains ML predictions and risk scores

Audit Logs Entity:
  - userId → Users._id (indexed for filtering)
  - Tracks all changes across entities
```

### Relationships Summary

| From | To | Cardinality | Description |
|------|----|----|-------------|
| Users | Wallets | 1:1 | One user has exactly one wallet |
| Users | Sessions | 1:N | One user can have multiple sessions |
| Users | Transactions | 1:N | One user can send/receive many transactions |
| Users | KYCDocuments | 1:1 | One user has one KYC record |
| Users | Devices | 1:N | One user can register multiple devices |
| Users | Notifications | 1:N | One user receives multiple notifications |
| Wallets | Transactions | 1:N | One wallet participates in many transactions |
| Transactions | FraudFlags | 1:1 | One transaction has one fraud assessment |

---

## 11. SYSTEM ARCHITECTURE

### 11.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                               │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Web Browser  │  │ Mobile App   │  │ Admin Panel  │        │
│  │  (React)     │  │   (React)    │  │  (React)     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
              ▼ HTTPS / WebSocket ▼
┌──────────────────────────────────────────────────────────────┐
│         API GATEWAY & LOAD BALANCER                           │
│  (Nginx / AWS ALB - Rate Limiting, Compression)              │
└──────────────────────────────────────────────────────────────┘
              ▼ HTTP/2 ▼
┌──────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                            │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐     │
│  │         Node.js / Express.js Cluster               │     │
│  │  ┌────────────────────────────────────────────┐   │     │
│  │  │  API Server (Instance 1-N)                │   │     │
│  │  │  - Authentication Handler                 │   │     │
│  │  │  - User Service                           │   │     │
│  │  │  - Wallet Service                         │   │     │
│  │  │  - Transaction Service                    │   │     │
│  │  │  - Notification Service                   │   │     │
│  │  │  - KYC Service                            │   │     │
│  │  │  - Security Service                       │   │     │
│  │  └────────────────────────────────────────────┘   │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
    ▼ Internal APIs ▼
┌──────────────────────────────────────────────────────────────┐
│              MICROSERVICES LAYER (Optional)                   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ Fraud Detection  │  │ Notification     │                  │
│  │ Service (Python) │  │ Service          │                  │
│  └──────────────────┘  └──────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
    ▼ APIs/Message Queue ▼
┌──────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                                │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────┐              │
│  │  Razorpay API      │  │  Email Service     │              │
│  │  (Payments)        │  │  (SendGrid/SES)    │              │
│  └────────────────────┘  └────────────────────┘              │
└──────────────────────────────────────────────────────────────┘
    ▼ Drivers ▼
┌──────────────────────────────────────────────────────────────┐
│              DATA & CACHE LAYER                               │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  MongoDB Atlas   │  │  Redis Cache     │                  │
│  │  (Primary DB)    │  │  (Session/Cache) │                  │
│  └──────────────────┘  └──────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
    ▼ Object Storage ▼
┌──────────────────────────────────────────────────────────────┐
│              STORAGE & LOGGING                                │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  S3 (Documents)  │  │  ELK Stack/Cloud │                  │
│  │  (KYC Files)     │  │  Logging          │                  │
│  └──────────────────┘  └──────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Component Breakdown

**Frontend Layer:**
- React.js for UI rendering
- Redux Toolkit for state management
- Axios for API calls
- Bootstrap 5 for styling

**API Gateway:**
- Request routing
- Rate limiting
- CORS handling
- Request logging
- SSL/TLS termination

**Application Server:**
- Node.js runtime
- Express.js framework
- Middleware stack (authentication, validation, error handling)
- Request/response transformation

**Business Logic Layer:**
- Service classes for each domain
- Business rule validation
- Transaction management

**Data Access Layer:**
- MongoDB drivers
- Query builders
- Data mapping

**External Integrations:**
- Razorpay Payment Gateway
- Email Service Provider
- SMS Provider (future)

**Caching Layer:**
- Redis for sessions
- Redis for frequently accessed data
- Cache invalidation strategies

**Fraud Detection Service:**
- Python-based microservice
- Machine learning models
- Real-time scoring
- REST API interface

---

## 12. FOLDER STRUCTURE

### Complete Project Structure

```
SecureBank/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── OTPVerification.jsx
│   │   │   │   └── PasswordReset.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── WalletCard.jsx
│   │   │   │   ├── RecentTransactions.jsx
│   │   │   │   └── QuickActions.jsx
│   │   │   ├── Wallet/
│   │   │   │   ├── WalletBalance.jsx
│   │   │   │   ├── AddMoney.jsx
│   │   │   │   ├── SendMoney.jsx
│   │   │   │   ├── RequestMoney.jsx
│   │   │   │   └── PaymentForm.jsx
│   │   │   ├── Transactions/
│   │   │   │   ├── TransactionHistory.jsx
│   │   │   │   ├── TransactionDetail.jsx
│   │   │   │   ├── TransactionFilter.jsx
│   │   │   │   └── TransactionExport.jsx
│   │   │   ├── KYC/
│   │   │   │   ├── KYCForm.jsx
│   │   │   │   ├── DocumentUpload.jsx
│   │   │   │   ├── KYCStatus.jsx
│   │   │   │   └── KYCHistory.jsx
│   │   │   ├── Profile/
│   │   │   │   ├── ProfileView.jsx
│   │   │   │   ├── ProfileEdit.jsx
│   │   │   │   ├── SecuritySettings.jsx
│   │   │   │   └── DeviceManagement.jsx
│   │   │   ├── Notifications/
│   │   │   │   ├── NotificationCenter.jsx
│   │   │   │   ├── NotificationItem.jsx
│   │   │   │   └── NotificationPreferences.jsx
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard/
│   │   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   │   ├── StatisticsCard.jsx
│   │   │   │   │   └── Charts.jsx
│   │   │   │   ├── Users/
│   │   │   │   │   ├── UserManagement.jsx
│   │   │   │   │   ├── UserDetail.jsx
│   │   │   │   │   └── UserActions.jsx
│   │   │   │   ├── KYC/
│   │   │   │   │   ├── KYCApproval.jsx
│   │   │   │   │   ├── KYCQueue.jsx
│   │   │   │   │   └── DocumentReview.jsx
│   │   │   │   ├── Transactions/
│   │   │   │   │   ├── TransactionMonitor.jsx
│   │   │   │   │   ├── FlaggedTransactions.jsx
│   │   │   │   │   └── ApprovalQueue.jsx
│   │   │   │   └── Fraud/
│   │   │   │       ├── FraudDashboard.jsx
│   │   │   │       ├── FlaggedAlerts.jsx
│   │   │   │       └── ModelPerformance.jsx
│   │   │   ├── Common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── AlertBanner.jsx
│   │   │   └── Layout/
│   │   │       ├── MainLayout.jsx
│   │   │       └── AdminLayout.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── UnauthorizedPage.jsx
│   │   │   └── ServerErrorPage.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── userSlice.js
│   │   │   │   ├── walletSlice.js
│   │   │   │   ├── transactionSlice.js
│   │   │   │   ├── notificationSlice.js
│   │   │   │   └── uiSlice.js
│   │   │   └── middleware/
│   │   │       └── customMiddleware.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── walletService.js
│   │   │   ├── transactionService.js
│   │   │   ├── kycService.js
│   │   │   ├── notificationService.js
│   │   │   └── adminService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── encryption.js
│   │   │   ├── axiosConfig.js
│   │   │   ├── errorHandler.js
│   │   │   └── localStorage.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useFetch.js
│   │   │   ├── useLocalStorage.js
│   │   │   └── useDebounce.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── variables.css
│   │   │   ├── components.css
│   │   │   └── responsive.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.jsx
│   │   └── reportWebVitals.js
│   ├── .env.example
│   ├── .env.local (gitignored)
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   ├── razorpay.js
│   │   │   ├── email.js
│   │   │   └── environment.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   ├── rateLimit.js
│   │   │   ├── cors.js
│   │   │   ├── helmet.js
│   │   │   ├── logging.js
│   │   │   └── requestContext.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Wallet.js
│   │   │   ├── Transaction.js
│   │   │   ├── KYCDocument.js
│   │   │   ├── Session.js
│   │   │   ├── Device.js
│   │   │   ├── Notification.js
│   │   │   ├── OTPVerification.js
│   │   │   ├── MoneyRequest.js
│   │   │   ├── FraudFlag.js
│   │   │   ├── AuditLog.js
│   │   │   └── AdminActionLog.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   ├── wallet.js
│   │   │   ├── transaction.js
│   │   │   ├── kyc.js
│   │   │   ├── notification.js
│   │   │   ├── profile.js
│   │   │   ├── security.js
│   │   │   ├── payment.js
│   │   │   ├── admin.js
│   │   │   └── health.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── walletController.js
│   │   │   ├── transactionController.js
│   │   │   ├── kycController.js
│   │   │   ├── notificationController.js
│   │   │   ├── profileController.js
│   │   │   ├── securityController.js
│   │   │   ├── paymentController.js
│   │   │   ├── adminController.js
│   │   │   └── healthController.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── walletService.js
│   │   │   ├── transactionService.js
│   │   │   ├── kycService.js
│   │   │   ├── notificationService.js
│   │   │   ├── paymentService.js
│   │   │   ├── securityService.js
│   │   │   ├── fraudDetectionService.js
│   │   │   ├── encryptionService.js
│   │   │   ├── emailService.js
│   │   │   ├── otpService.js
│   │   │   └── adminService.js
│   │   ├── repositories/
│   │   │   ├── userRepository.js
│   │   │   ├── walletRepository.js
│   │   │   ├── transactionRepository.js
│   │   │   ├── kycRepository.js
│   │   │   ├── sessionRepository.js
│   │   │   ├── deviceRepository.js
│   │   │   ├── notificationRepository.js
│   │   │   ├── otpRepository.js
│   │   │   ├── moneyRequestRepository.js
│   │   │   ├── fraudFlagRepository.js
│   │   │   └── auditLogRepository.js
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── userValidator.js
│   │   │   ├── walletValidator.js
│   │   │   ├── transactionValidator.js
│   │   │   └── kycValidator.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── errorHandler.js
│   │   │   ├── encryption.js
│   │   │   ├── jwt.js
│   │   │   ├── otp.js
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── exceptions/
│   │   │   ├── CustomError.js
│   │   │   ├── ValidationError.js
│   │   │   ├── AuthenticationError.js
│   │   │   ├── AuthorizationError.js
│   │   │   ├── NotFoundError.js
│   │   │   ├── ConflictError.js
│   │   │   └── ServerError.js
│   │   ├── queue/
│   │   │   ├── emailQueue.js
│   │   │   ├── notificationQueue.js
│   │   │   └── fraudDetectionQueue.js
│   │   ├── cron/
│   │   │   ├── sessionCleanup.js
│   │   │   ├── otpCleanup.js
│   │   │   └── notificationCleanup.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── validators/
│   │   ├── integration/
│   │   │   ├── auth.test.js
│   │   │   ├── wallet.test.js
│   │   │   ├── transaction.test.js
│   │   │   └── kyc.test.js
│   │   └── e2e/
│   │       ├── userFlow.test.js
│   │       └── transactionFlow.test.js
│   ├── .env.example
│   ├── .env.local (gitignored)
│   ├── package.json
│   ├── package-lock.json
│   ├── jest.config.js
│   ├── .dockerignore
│   ├── Dockerfile
│   └── README.md
│
├── fraud-detection-service/
│   ├── src/
│   │   ├── models/
│   │   │   ├── fraud_detection_model.pkl
│   │   │   ├── feature_scaler.pkl
│   │   │   └── model_config.json
│   │   ├── features/
│   │   │   ├── feature_extractor.py
│   │   │   ├── feature_engineering.py
│   │   │   └── feature_validation.py
│   │   ├── api/
│   │   │   ├── app.py
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   └── middleware.py
│   │   ├── services/
│   │   │   ├── fraud_detection.py
│   │   │   ├── model_manager.py
│   │   │   ├── data_processor.py
│   │   │   └── anomaly_detection.py
│   │   ├── utils/
│   │   │   ├── logger.py
│   │   │   ├── config.py
│   │   │   ├── constants.py
│   │   │   └── helpers.py
│   │   ├── training/
│   │   │   ├── train_model.py
│   │   │   ├── evaluate_model.py
│   │   │   ├── data_preparation.py
│   │   │   └── hyperparameter_tuning.py
│   │   └── main.py
│   ├── tests/
│   │   ├── test_fraud_detection.py
│   │   ├── test_features.py
│   │   └── test_api.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml
├── .gitignore
├── README.md
├── ARCHITECTURE.md
├── SECURITY.md
└── DEPLOYMENT.md
```

---

## 13. API ARCHITECTURE

### 13.1 REST API Endpoints

#### **Authentication APIs**
```
POST   /api/v1/auth/register          - User registration
POST   /api/v1/auth/login             - User login
POST   /api/v1/auth/refresh-token     - Refresh JWT token
POST   /api/v1/auth/logout            - User logout
POST   /api/v1/auth/verify-otp        - Verify OTP
POST   /api/v1/auth/resend-otp        - Resend OTP
POST   /api/v1/auth/forgot-password   - Forgot password
POST   /api/v1/auth/reset-password    - Reset password with token
```

#### **User APIs**
```
GET    /api/v1/users/profile          - Get user profile
PUT    /api/v1/users/profile          - Update profile
GET    /api/v1/users/{userId}         - Get user by ID (admin)
PUT    /api/v1/users/{userId}         - Update user (admin)
DELETE /api/v1/users/{userId}         - Delete user account
GET    /api/v1/users                  - List all users (admin)
POST   /api/v1/users/{userId}/suspend - Suspend user (admin)
POST   /api/v1/users/{userId}/unsuspend - Unsuspend user (admin)
```

#### **Wallet APIs**
```
GET    /api/v1/wallet                 - Get wallet details
GET    /api/v1/wallet/balance         - Get wallet balance
POST   /api/v1/wallet/add-money       - Initiate money addition
GET    /api/v1/wallet/transactions    - Get wallet transactions
```

#### **Transaction APIs**
```
GET    /api/v1/transactions           - Get transaction history
GET    /api/v1/transactions/{txnId}   - Get transaction details
POST   /api/v1/transactions/send      - Send money to user
POST   /api/v1/transactions/transfer  - Generic transfer
GET    /api/v1/transactions/analytics - Transaction analytics
POST   /api/v1/transactions/{txnId}/reverse - Reverse transaction
GET    /api/v1/transactions/export    - Export transactions
```

#### **Payment APIs**
```
POST   /api/v1/payments/razorpay/create-order - Create Razorpay order
POST   /api/v1/payments/razorpay/verify       - Verify Razorpay payment
POST   /api/v1/payments/razorpay/callback     - Razorpay webhook callback
GET    /api/v1/payments/history              - Payment history
```

#### **KYC APIs**
```
GET    /api/v1/kyc/status             - Get KYC status
POST   /api/v1/kyc/submit             - Submit KYC documents
GET    /api/v1/kyc/documents          - Get uploaded documents
POST   /api/v1/kyc/approve            - Approve KYC (admin)
POST   /api/v1/kyc/reject             - Reject KYC (admin)
GET    /api/v1/kyc/pending            - Get pending KYC (admin)
```

#### **Notification APIs**
```
GET    /api/v1/notifications          - Get notifications
PUT    /api/v1/notifications/{nId}/mark-read - Mark as read
PUT    /api/v1/notifications/mark-all-read   - Mark all as read
DELETE /api/v1/notifications/{nId}    - Delete notification
GET    /api/v1/notifications/preferences - Get notification preferences
PUT    /api/v1/notifications/preferences - Update preferences
```

#### **Security APIs**
```
GET    /api/v1/security/devices       - Get registered devices
POST   /api/v1/security/devices/register - Register new device
DELETE /api/v1/security/devices/{deviceId} - Remove device
POST   /api/v1/security/2fa/enable    - Enable 2FA
POST   /api/v1/security/2fa/disable   - Disable 2FA
POST   /api/v1/security/sessions/view - Get active sessions
DELETE /api/v1/security/sessions/{sessionId} - Logout from session
POST   /api/v1/security/change-password - Change password
```

#### **Money Request APIs**
```
POST   /api/v1/money-requests/create  - Create money request
GET    /api/v1/money-requests         - Get money requests
GET    /api/v1/money-requests/{reqId} - Get request details
POST   /api/v1/money-requests/{reqId}/accept - Accept request
POST   /api/v1/money-requests/{reqId}/reject - Reject request
POST   /api/v1/money-requests/{reqId}/cancel - Cancel request
GET    /api/v1/money-requests/link/{linkId} - Get public payment link
```

#### **Profile APIs**
```
GET    /api/v1/profile                - Get full profile
PUT    /api/v1/profile                - Update profile
POST   /api/v1/profile/picture        - Upload profile picture
DELETE /api/v1/profile/picture        - Delete profile picture
GET    /api/v1/profile/preferences    - Get user preferences
PUT    /api/v1/profile/preferences    - Update preferences
```

#### **Admin APIs**
```
GET    /api/v1/admin/dashboard        - Dashboard overview
GET    /api/v1/admin/users            - User management
GET    /api/v1/admin/transactions     - Transaction monitoring
GET    /api/v1/admin/fraud            - Fraud monitoring
GET    /api/v1/admin/kyc              - KYC approvals
GET    /api/v1/admin/reports          - Generate reports
POST   /api/v1/admin/settings         - System settings
GET    /api/v1/admin/audit-logs       - Audit trail
GET    /api/v1/admin/support/tickets  - Support tickets (future)
```

### 13.2 API Request/Response Format

**Standard Request Format:**
```json
{
  "method": "POST/GET/PUT/DELETE",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {JWT_TOKEN}",
    "X-Request-ID": "{UNIQUE_ID}",
    "X-Device-ID": "{DEVICE_ID}"
  },
  "body": {
    "data": {}
  }
}
```

**Standard Response Format (Success):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": {},
  "meta": {
    "timestamp": "2026-06-13T10:30:00Z",
    "requestId": "req_xxxxx",
    "version": "1.0"
  }
}
```

**Standard Response Format (Error):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "meta": {
    "timestamp": "2026-06-13T10:30:00Z",
    "requestId": "req_xxxxx"
  }
}
```

### 13.3 HTTP Status Codes Used
- `200` - OK
- `201` - Created
- `202` - Accepted
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

### 13.4 Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 14. SECURITY ARCHITECTURE

### 14.1 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│           PERIMETER SECURITY                              │
├─────────────────────────────────────────────────────────┤
│ ├─ WAF (Web Application Firewall)                        │
│ ├─ DDoS Protection (AWS Shield/Cloudflare)              │
│ └─ Rate Limiting (API Level)                            │
└─────────────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────┐
│           TRANSPORT LAYER SECURITY                       │
├─────────────────────────────────────────────────────────┤
│ ├─ TLS 1.3 Encryption                                    │
│ ├─ Certificate Pinning (Mobile)                         │
│ ├─ HSTS Headers                                         │
│ └─ HTTPS Enforcement                                    │
└─────────────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────┐
│           APPLICATION SECURITY                           │
├─────────────────────────────────────────────────────────┤
│ ├─ Input Validation & Sanitization                      │
│ ├─ SQL Injection Prevention                             │
│ ├─ XSS Protection                                       │
│ ├─ CSRF Token Validation                                │
│ ├─ Request Signing                                      │
│ └─ API Key Management                                   │
└─────────────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────┐
│           AUTHENTICATION & AUTHORIZATION                │
├─────────────────────────────────────────────────────────┤
│ ├─ JWT Authentication                                   │
│ ├─ Multi-Factor Authentication (2FA)                    │
│ ├─ Role-Based Access Control (RBAC)                     │
│ ├─ Attribute-Based Access Control (Future)              │
│ ├─ OAuth 2.0 (Future)                                   │
│ └─ Session Management                                   │
└─────────────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────┐
│           DATA SECURITY                                  │
├─────────────────────────────────────────────────────────┤
│ ├─ AES-256 Encryption (At Rest)                         │
│ ├─ TLS Encryption (In Transit)                          │
│ ├─ Hashing with bcrypt (Passwords)                      │
│ ├─ Field-Level Encryption (Sensitive Data)              │
│ ├─ Database Encryption (MongoDB)                        │
│ ├─ Backup Encryption                                    │
│ └─ Key Management Service                               │
└─────────────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────┐
│           FRAUD DETECTION & PREVENTION                  │
├─────────────────────────────────────────────────────────┤
│ ├─ AI-Based Fraud Detection                             │
│ ├─ Device Fingerprinting                                │
│ ├─ Geographic Anomaly Detection                         │
│ ├─ Transaction Pattern Analysis                         │
│ ├─ Real-Time Risk Scoring                               │
│ ├─ 3D Secure (Future)                                   │
│ └─ Blockchain Verification (Future)                     │
└─────────────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────┐
│           MONITORING & LOGGING                           │
├─────────────────────────────────────────────────────────┤
│ ├─ Real-Time Threat Detection                           │
│ ├─ Centralized Logging (ELK Stack)                      │
│ ├─ Audit Trails                                         │
│ ├─ Security Information Event Management (SIEM)         │
│ ├─ Intrusion Detection System (IDS)                     │
│ ├─ Performance Monitoring                               │
│ └─ Alert Management                                     │
└─────────────────────────────────────────────────────────┘
```

### 14.2 Authentication Flow

```
CLIENT                          SERVER
  │                                │
  ├─ 1. POST /auth/register ───────>
  │   (email, password, name)       │
  │                                 │
  │  2. Validate input              │
  │  3. Check duplicate email       │
  │  4. Hash password (bcrypt)      │
  │  5. Create user                 │
  │  6. Generate OTP                │
  │                         <────────┤
  │     (OTP sent via email)        │
  │                                 │
  ├─ 7. User enters OTP ──────────->
  ├─ 8. POST /auth/verify-otp       │
  │                                 │
  │  9. Verify OTP                  │
  │  10. Mark email verified        │
  │  11. Generate JWT & Refresh     │
  │  12. Create session             │
  │                         <────────┤
  │  13. JWT + Refresh Token        │
  │                                 │
```

### 14.3 Transaction Security Flow

```
USER INITIATES TRANSACTION
        │
        ▼
AMOUNT VALIDATION
├─ Balance check
├─ Limit validation
└─ Rate limiting check
        │
        ▼
RECIPIENT VERIFICATION
├─ User exists
├─ Account active
└─ KYC approved
        │
        ▼
FRAUD DETECTION
├─ Historical pattern
├─ Device fingerprint
├─ Geographic check
└─ AI risk scoring
        │
        ├─ Risk < 30: AUTO-APPROVE ─────┐
        ├─ 30-70: REQUEST OTP ────────────┤
        └─ Risk > 70: BLOCK + ALERT ──────┤
        │                                  │
        ├─ OTP VERIFICATION (if needed)    │
        │                                  │
        ▼                                  │
TRANSACTION EXECUTION                     │
├─ Debit sender account                   │
├─ Credit receiver account                │
├─ Create transaction record              │
└─ Log audit trail                        │
        │                                  │
        ├────────────────────────────────┤
        │
        ▼
POST-TRANSACTION
├─ Send notifications
├─ Update dashboards
├─ Monitor for reversal
└─ Archive transaction
```

### 14.4 Encryption Strategy

**Data at Rest:**
- AES-256-GCM for sensitive fields
- Database-level encryption
- Separate encryption keys per user

**Data in Transit:**
- TLS 1.3 (minimum)
- Perfect Forward Secrecy (PFS)
- HSTS (Strict-Transport-Security)

**Sensitive Fields to Encrypt:**
- Passwords (bcrypt)
- Aadhar (AES-256)
- PAN (AES-256)
- Bank account details (AES-256)
- OTP (hashed)
- Tokens (stored hashed)

### 14.5 Rate Limiting Strategy

```
API Endpoint                    Rate Limit
─────────────────────────────────────────────
/auth/login                     5/minute
/auth/register                  3/minute
/auth/verify-otp                10/minute
/api/transactions/send          100/day
/api/wallet/add-money           20/day
/api/*/                         100/minute
/admin/*                        200/minute
```

### 14.6 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 15. DETAILED PROJECT FLOW

### 15.1 User Registration Flow

```
START
  │
  ├─ User visits app
  │
  ├─ Clicks "Register"
  │
  ├─ Fill registration form
  │  ├─ Email
  │  ├─ Phone
  │  ├─ Name
  │  ├─ Password (8+ chars, uppercase, lowercase, numbers, special)
  │  └─ Confirm Password
  │
  ├─ Validate inputs
  │  ├─ Email format valid?
  │  ├─ Phone format valid?
  │  ├─ Password strength OK?
  │  ├─ Email not already registered?
  │  ├─ Phone not already registered?
  │  └─ IF FAILED → Show error, STOP
  │
  ├─ Submit registration
  │  ├─ Hash password (bcrypt salt=12)
  │  ├─ Create user record
  │  ├─ Mark email_verified = false
  │  ├─ Mark phone_verified = false
  │  └─ Generate OTP (6 digits)
  │
  ├─ Send OTP email
  │  ├─ Email OTP code
  │  └─ Valid for 10 minutes
  │
  ├─ Show OTP verification screen
  │
  ├─ User enters OTP
  │  ├─ Validate OTP
  │  ├─ Check OTP not expired
  │  ├─ Check OTP matches
  │  └─ IF FAILED → Allow retry (max 5 attempts)
  │
  ├─ Mark email as verified
  │
  ├─ Redirect to KYC/Profile screen
  │
  ├─ Registration complete
  │
  END
```

### 15.2 User Login Flow

```
START
  │
  ├─ User visits app
  │
  ├─ Clicks "Login"
  │
  ├─ Enter credentials
  │  ├─ Email/Phone
  │  └─ Password
  │
  ├─ Validate inputs
  │  ├─ Email/Phone format valid?
  │  └─ IF INVALID → Show error, STOP
  │
  ├─ Check login attempts
  │  ├─ IF > 5 failed attempts in 15 min
  │  ├─ Lock account for 15 minutes
  │  └─ Send security alert email
  │
  ├─ Retrieve user from database
  │  └─ IF not found → Failed login, increment attempt
  │
  ├─ Compare password hash
  │  ├─ Compare input password with bcrypt hash
  │  └─ IF mismatch → Failed login, increment attempt
  │
  ├─ Check account status
  │  ├─ IF Suspended → Cannot login
  │  ├─ IF Closed → Cannot login
  │  └─ IF Active → Continue
  │
  ├─ Collect device info
  │  ├─ IP Address
  │  ├─ User-Agent
  │  ├─ Device fingerprint
  │  └─ Device ID
  │
  ├─ Check if new device
  │  ├─ IF new device → Send verification email
  │  ├─ User enters verification code
  │  └─ Mark device as verified
  │
  ├─ Generate tokens
  │  ├─ JWT (15 minutes expiry)
  │  ├─ Refresh Token (7 days expiry)
  │  └─ Create session record
  │
  ├─ Reset login attempt counter
  │
  ├─ Update last_login timestamp
  │
  ├─ Send login notification
  │
  ├─ Return tokens to frontend
  │
  ├─ Redirect to dashboard
  │
  END
```

### 15.3 KYC Verification Flow

```
START
  │
  ├─ User clicks "Complete KYC"
  │
  ├─ Display KYC form
  │  ├─ Name (prefilled)
  │  ├─ Email (prefilled)
  │  ├─ Phone (prefilled)
  │  ├─ Date of Birth
  │  ├─ Address
  │  ├─ City
  │  ├─ State
  │  ├─ Pincode
  │  └─ PAN (Permanent Account Number)
  │
  ├─ User fills and submits
  │
  ├─ Validate inputs
  │  ├─ PAN format valid?
  │  ├─ Address length OK?
  │  ├─ Pincode format valid?
  │  └─ ALL required fields filled?
  │
  ├─ Request document uploads
  │  ├─ PAN copy (PDF/Image)
  │  ├─ Aadhar/ID proof (PDF/Image)
  │  ├─ Address proof (PDF/Image)
  │  └─ Selfie (for video KYC later)
  │
  ├─ Validate files
  │  ├─ File size < 5MB?
  │  ├─ File type allowed?
  │  └─ IF invalid → Show error
  │
  ├─ Encrypt and store documents
  │  ├─ Upload to secure storage
  │  └─ Encrypt with AES-256
  │
  ├─ Update KYC status = "Pending"
  │
  ├─ Send notification to admin
  │
  ├─ Admin receives notification
  │
  ├─ Admin reviews documents
  │  ├─ Check document authenticity
  │  ├─ Verify details match
  │  └─ Request video KYC if needed
  │
  ├─ EITHER:
  │  ├─ APPROVE:
  │  │  ├─ Update status = "Approved"
  │  │  ├─ Create wallet automatically
  │  │  ├─ Send approval email to user
  │  │  └─ Unlock features
  │  │
  │  ├─ OR REJECT:
  │  │  ├─ Update status = "Rejected"
  │  │  ├─ Add rejection reason
  │  │  ├─ Send rejection email
  │  │  └─ Allow resubmission
  │  │
  │  └─ OR REQUEST MORE:
  │     ├─ Update status = "ReSubmit"
  │     ├─ Specify required documents
  │     └─ Send request email
  │
  ├─ User notified of status
  │
  END
```

### 15.4 Add Money (Razorpay) Flow

```
START
  │
  ├─ User in wallet section
  │
  ├─ Clicks "Add Money"
  │
  ├─ Check KYC status
  │  ├─ IF not approved → Show message "Complete KYC first"
  │  └─ IF approved → Continue
  │
  ├─ Show "Add Money" form
  │  ├─ Enter amount (₹100 - ₹1,00,000)
  │  ├─ Select payment method
  │  └─ Show transaction fee
  │
  ├─ Validate amount
  │  ├─ Min ₹100?
  │  ├─ Max ₹1,00,000?
  │  ├─ No special characters?
  │  └─ IF invalid → Show error
  │
  ├─ User confirms amount
  │
  ├─ Create Razorpay order
  │  ├─ Backend calls Razorpay API
  │  ├─ Pass amount and user details
  │  └─ Get order_id
  │
  ├─ Store order in database
  │  ├─ Create transaction record
  │  ├─ Status = "Pending"
  │  └─ Save order_id
  │
  ├─ Display Razorpay payment form
  │
  ├─ User selects payment method
  │  ├─ Card (Debit/Credit)
  │  ├─ UPI (if available)
  │  ├─ Net Banking
  │  └─ Wallet
  │
  ├─ Razorpay processes payment
  │
  ├─ EITHER:
  │  ├─ PAYMENT SUCCESS:
  │  │  ├─ Razorpay sends webhook
  │  │  ├─ Verify payment signature
  │  │  ├─ Update transaction status = "Completed"
  │  │  ├─ Update wallet balance
  │  │  ├─ Send success notification
  │  │  ├─ Redirect to success page
  │  │  └─ Show transaction receipt
  │  │
  │  └─ PAYMENT FAILED:
  │     ├─ Razorpay sends failure callback
  │     ├─ Update transaction status = "Failed"
  │     ├─ Keep amount in pending
  │     ├─ Send failure notification
  │     ├─ Show retry option
  │     └─ Redirect to failure page
  │
  ├─ Log transaction in history
  │
  ├─ Send email receipt
  │
  END
```

### 15.5 Send Money Flow

```
START
  │
  ├─ User clicks "Send Money"
  │
  ├─ Show send money form
  │  ├─ Recipient (email/phone/wallet ID)
  │  ├─ Amount
  │  ├─ Reason/Note
  │  └─ Select recipients from contacts
  │
  ├─ Validate inputs
  │  ├─ Email/phone format valid?
  │  ├─ Amount numeric?
  │  ├─ Amount <= wallet balance?
  │  ├─ Amount <= daily limit?
  │  └─ IF invalid → Show error
  │
  ├─ Verify recipient exists
  │  ├─ Search user by email/phone
  │  ├─ IF user not found → Show error "User not found"
  │  └─ Check recipient KYC approved
  │
  ├─ Check transaction limits
  │  ├─ Daily limit remaining?
  │  ├─ Per-transaction limit OK?
  │  └─ Monthly limit OK?
  │
  ├─ Run fraud detection
  │  ├─ Analyze transaction pattern
  │  ├─ Check device fingerprint
  │  ├─ Check geographic location
  │  ├─ Run ML model
  │  └─ Get risk score (0-100)
  │
  ├─ IF risk score < 30:
  │  ├─ Auto-approve transaction
  │  └─ Skip OTP
  │
  ├─ ELSE IF 30 < risk <= 70:
  │  ├─ Request OTP verification
  │  ├─ Send OTP via email
  │  ├─ User enters OTP
  │  ├─ Verify OTP
  │  └─ IF invalid → Show error (max 3 attempts)
  │
  ├─ ELSE (risk > 70):
  │  ├─ Block transaction
  │  ├─ Send security alert to user
  │  ├─ Notify admin
  │  └─ Request manual verification
  │
  ├─ Show confirmation screen
  │  ├─ Recipient details
  │  ├─ Amount
  │  ├─ Fee (if any)
  │  └─ "Confirm" button
  │
  ├─ User confirms
  │
  ├─ Execute transaction
  │  ├─ Debit sender wallet
  │  ├─ Credit receiver wallet
  │  ├─ Create transaction record
  │  ├─ Status = "Completed"
  │  └─ Add to transaction history
  │
  ├─ Send notifications
  │  ├─ Email to sender (confirmation)
  │  ├─ Push to receiver (money received)
  │  └─ In-app notifications
  │
  ├─ Show transaction receipt
  │  ├─ Transaction ID
  │  ├─ Amount
  │  ├─ Timestamp
  │  ├─ Recipient details
  │  └─ Option to download receipt
  │
  ├─ Allow reversal (24 hours window)
  │
  END
```

### 15.6 View Transaction History Flow

```
START
  │
  ├─ User clicks "Transactions"
  │
  ├─ Fetch all user transactions
  │  ├─ Query database
  │  ├─ Sort by date (newest first)
  │  ├─ Apply pagination (20 per page)
  │  └─ Show recent transactions
  │
  ├─ Display transaction list
  │  ├─ For each transaction:
  │  │  ├─ Date/Time
  │  │  ├─ Transaction type (Sent/Received/Added)
  │  │  ├─ Recipient/Sender name
  │  │  ├─ Amount
  │  │  ├─ Status (Completed/Pending/Failed)
  │  │  └─ Transaction ID
  │
  ├─ Provide filters
  │  ├─ Date range filter
  │  ├─ Transaction type filter
  │  ├─ Status filter
  │  ├─ Amount range filter
  │  └─ User search
  │
  ├─ User applies filters
  │  ├─ Query with filters
  │  ├─ Re-fetch transactions
  │  └─ Update display
  │
  ├─ User clicks on transaction
  │
  ├─ Show transaction details
  │  ├─ Transaction ID
  │  ├─ Date & Time
  │  ├─ Type
  │  ├─ Sender/Recipient
  │  ├─ Amount
  │  ├─ Fee
  │  ├─ Net amount
  │  ├─ Status
  │  ├─ Description/Note
  │  └─ Option to:
  │     ├─ Download receipt
  │     ├─ Share transaction
  │     ├─ Reverse (if eligible)
  │     └─ Dispute (if failed)
  │
  ├─ Export option
  │  ├─ Download as CSV
  │  ├─ Download as PDF (statement)
  │  └─ Date range selection
  │
  END
```

---

## 16. UI PAGE LIST

### 16.1 User Portal Pages

**Public Pages (No Authentication Required):**
1. **Landing Page** - App overview, features, testimonials, CTA
2. **Login Page** - Email/phone, password, forgot password link
3. **Register Page** - Registration form, terms acceptance
4. **Forgot Password Page** - Email verification, OTP entry
5. **Reset Password Page** - New password entry
6. **Terms & Conditions Page** - Legal documents
7. **Privacy Policy Page** - Privacy details
8. **FAQ Page** - Common questions and answers

**Protected Pages (Authentication Required):**
9. **Dashboard** - Wallet balance, recent transactions, quick actions
10. **Profile Page** - View/edit profile, upload picture
11. **KYC Page** - KYC status, document upload, verification
12. **Wallet Page** - Wallet details, balance, transaction history
13. **Send Money Page** - Recipient selection, amount entry
14. **Request Money Page** - Create payment request, generate link
15. **Transaction History Page** - Detailed transaction list with filters
16. **Transaction Detail Page** - Full transaction details, receipt
17. **Add Money Page** - Razorpay integration, payment form
18. **Payment History Page** - All payment transactions
19. **Security Settings Page** - 2FA, password change, device management
20. **Device Management Page** - Registered devices, logout from devices
21. **Notification Center Page** - All notifications, preferences
22. **Settings Page** - User preferences, account settings
23. **Help/Support Page** - FAQs, ticket system (future)
24. **Profile Edit Page** - Edit all profile fields
25. **Notification Preferences Page** - Email, push, SMS toggles

### 16.2 Admin Panel Pages

**Dashboard Pages:**
1. **Admin Dashboard** - Overview stats, charts, quick links
2. **User Analytics** - User growth, demographics, activity
3. **Transaction Analytics** - Volume, value, trends
4. **Revenue Dashboard** - Fee collection, revenue metrics
5. **System Health Dashboard** - API status, database, services

**Management Pages:**
6. **User Management** - List users, view details, actions
7. **User Detail Page** - Full user info, history, actions
8. **KYC Management Queue** - Pending KYC approvals
9. **KYC Review Page** - Document review, approve/reject
10. **Transaction Monitoring** - All transactions, filters, actions
11. **Flagged Transactions** - Suspicious transactions, review
12. **Transaction Approval Queue** - Transactions awaiting approval
13. **Fraud Dashboard** - Fraud statistics, patterns, alerts
14. **Fraud Flags Management** - Manage fraud cases
15. **Support Tickets** - Customer support tickets (future)
16. **Reports Page** - Generate various reports
17. **Audit Logs** - System action logs
18. **System Settings** - Configuration, rates, limits
19. **Admin User Management** - Manage admin accounts (future)

---

## 17. DASHBOARD FEATURES

### 17.1 User Dashboard

**Header Section:**
- Welcome message with user name
- Current date/time
- Quick notification bell with unread count
- User menu (Profile, Settings, Logout)

**Main Widget Section:**

**1. Wallet Balance Card**
- Current balance in large font
- Wallet ID
- Last updated time
- Quick action buttons: "Add Money", "Send Money"
- Balance trend sparkline (last 30 days)

**2. Quick Stats**
- Total Money Sent (this month)
- Total Money Received (this month)
- Total Transactions (this month)
- Pending Requests (count)

**3. Recent Transactions Widget**
- Last 5 transactions
- Date, recipient/sender, amount, status
- "View All" link to full history
- Color coding: Green (received), Red (sent), Blue (added)

**4. Quick Actions Bar**
- Send Money button
- Request Money button
- Add Money button
- Pay Bills button (future)
- Request Refund button

**5. KYC Status Card**
- KYC status (Pending/Approved/Rejected)
- If pending: Days remaining, progress bar
- If rejected: Reason, resubmit button
- If approved: Approved date, badge

**6. Security Overview**
- 2FA status (Enabled/Disabled)
- Active sessions count
- Trusted devices count
- "Manage Security" link

**7. Transaction Analytics**
- Monthly spending trend chart (line chart)
- Income vs Expense (bar chart)
- Transaction by type pie chart
- Transaction by day heatmap

**8. Notifications Section**
- Recent 3 notifications
- "View All" link
- Mark as read option

**9. Upcoming Features Banner**
- New features announcement
- Beta program invitation

**10. Help Section**
- FAQ quick links
- Contact support link
- Video tutorials link

### 17.2 Dashboard Actions & Interactions

- **Real-time updates:** WebSocket connection for live balance updates
- **Mobile-optimized:** Responsive layout for all screen sizes
- **Dark mode:** Toggle dark/light theme
- **Accessibility:** WCAG 2.1 AA compliance
- **Export:** Download dashboard report as PDF

---

## 18. ADMIN PANEL FEATURES

### 18.1 Admin Dashboard

**Top Stats Bar:**
- Total Users
- Active Users (last 24h)
- Total Transactions (today)
- Total Revenue (today)
- System Status (Green/Yellow/Red)

**Main Dashboard Widgets:**

**1. System Health Monitor**
- API Response Time (graph)
- Error Rate (percentage)
- Database Connection Pool
- Cache Hit Ratio
- Server Load (CPU, Memory, Disk)
- Alert threshold indicators

**2. User Analytics**
- New Users (today/week/month)
- Active Users trend
- User registration chart
- User retention rate
- Geographic distribution map

**3. Transaction Analytics**
- Daily transaction volume
- Daily transaction value
- Average transaction value
- Transaction success rate
- Transactions by type (pie chart)

**4. Fraud Overview**
- Flagged transactions count
- Fraud detection rate
- AI model accuracy
- Risk score distribution
- Top fraud patterns

**5. KYC Status**
- Pending approvals count
- Today's approvals count
- Approval rate (%)
- Rejection reasons breakdown
- Resubmission rate

**6. Payment Gateway Status**
- Razorpay connection status
- Payment success rate
- Failed payments count
- Average payment processing time

**7. Alerts & Notifications**
- Critical alerts list
- Warning alerts
- Info notifications
- Alert history

**8. Quick Actions**
- "Review KYC" button
- "Check Fraud Alerts" button
- "View System Logs" button
- "Generate Report" button

### 18.2 Admin Panel Modules

**User Management Module:**
- Searchable user list with pagination
- Filter: Status (Active/Suspended/Closed), KYC Status, Registration Date
- Bulk actions: Suspend, Unsuspend, Export
- User detail page with:
  - Personal information
  - KYC documents
  - Transaction history
  - Login history
  - Device history
  - Actions: Suspend, Reset Password, Delete Account
  - Notes section for admin observations

**KYC Management Module:**
- Pending KYC approvals queue with:
  - Queue count
  - Time in queue for each
  - Submission date
  - Fast track for high-priority users
- KYC review page with:
  - Document viewer (zoom, rotate)
  - User information
  - Comparison with previous submissions
  - Approve/Reject buttons
  - Request additional documents option
  - Comments section
  - Approval workflow tracking

**Transaction Management Module:**
- Real-time transaction monitoring
- Filters: Date range, amount range, status, type
- Searchable by transaction ID, user, recipient
- Bulk actions: Approve, Reject, Reverse
- Transaction detail:
  - Transaction graph visualization
  - User profiles
  - Fraud risk assessment
  - Approval/rejection option
  - Reversal window

**Fraud Management Module:**
- Dashboard with fraud metrics
- ML model performance metrics
  - Accuracy
  - Precision
  - Recall
  - F1 Score
- Flagged transactions queue
- Fraud case management:
  - View flagged transaction details
  - Review AI prediction
  - Override decision
  - Mark as legitimate/fraud
  - Feedback loop for model improvement
- Block list management
- Fraud pattern analysis

**Reports Module:**
- Pre-built reports:
  - User growth report
  - Transaction report
  - Revenue report
  - Fraud report
  - KYC completion report
  - System performance report
- Custom report builder
- Schedule reports (email delivery)
- Export options (CSV, PDF, Excel)
- Report history

**Audit Logs Module:**
- Complete action audit trail
- Filter by user, action, entity type, date
- View detailed action information
- Download audit logs
- Compliance certification

**System Settings:**
- User transaction limits configuration
- Fee structure
- Rate limiting settings
- Email templates
- Notification settings
- Maintenance mode toggle

---

## DOCUMENT COMPLETION STATUS

✅ **COMPLETED SECTIONS (1-18):**
- Executive Summary
- Project Vision & Objectives
- Scope Definition
- Functional Requirements (10 modules)
- Non-Functional Requirements
- Complete Module List
- User Roles & Permissions
- Database Design & MongoDB Collections
- ER Diagram Description
- System Architecture
- Folder Structure
- API Architecture (70+ endpoints)
- Security Architecture
- Detailed Project Flow (6 major flows)
- UI Page List (25+ pages)
- Dashboard Features
- Admin Panel Features

---

## NEXT STEPS FOR PROMPT 2

This SRS document establishes:
- ✅ Complete functional scope
- ✅ 12+ MongoDB collections design
- ✅ 70+ API endpoints
- ✅ Security framework
- ✅ 6 detailed user flows
- ✅ UI/UX page structure
- ✅ Admin panel architecture
- ✅ Fraud detection system

**Ready for Prompt 2:** Code generation, database setup, and implementation.

---

**Document Version:** 1.0  
**Last Updated:** June 13, 2026  
**Prepared By:** Senior FinTech Architect, MERN Stack Developer, Cybersecurity Expert  
**Classification:** Production Grade - Confidential
