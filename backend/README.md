# SecurePay NeoBank - Backend

**AI Powered FinTech Wallet Platform** | **Production Ready Backend**

---

## 🚀 QUICK START

### Installation
```bash
npm install
cp .env.example .env
# Configure .env with your settings
npm run dev
```

### Expected Output
```
╔═══════════════════════════════════════════════════════════╗
║   SecurePay NeoBank - Backend Server                      ║
║   Status: RUNNING ✓                                       ║
║   URL: http://localhost:5000                              ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📖 DOCUMENTATION

Start with these files in order:

1. **[PROJECT_INDEX.md](PROJECT_INDEX.md)** - Navigation & quick reference
2. **[PROMPT2_COMPLETION_SUMMARY.md](PROMPT2_COMPLETION_SUMMARY.md)** - Project overview
3. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference with examples
4. **[BACKEND_GUIDE.md](BACKEND_GUIDE.md)** - Setup & implementation details

---

## ✅ WHAT'S INCLUDED

### Core Features
- ✅ User Authentication (JWT + OTP)
- ✅ Wallet Management
- ✅ Money Transfers (P2P)
- ✅ Razorpay Integration
- ✅ Email Notifications
- ✅ Device Tracking
- ✅ Audit Logging
- ✅ Fraud Detection

### Security
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ Helmet Security Headers
- ✅ CORS Configuration
- ✅ Device Fingerprinting
- ✅ Encryption (AES-256-GCM)

### Database
- ✅ MongoDB with Mongoose
- ✅ 8 Optimized Collections
- ✅ Redis Caching Ready
- ✅ Connection Pooling
- ✅ TTL Indexes

---

## 📊 API ENDPOINTS

### Authentication (8 endpoints)
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-email
```

### Wallet (7 endpoints)
```
GET    /api/v1/wallet
POST   /api/v1/wallet
GET    /api/v1/wallet/balance
POST   /api/v1/wallet/add-money
POST   /api/v1/wallet/transfer
GET    /api/v1/wallet/transactions
GET    /api/v1/wallet/transactions/:id
```

---

## 🛠️ TECHNOLOGY

- **Runtime:** Node.js 18.x LTS
- **Framework:** Express.js 4.18.x
- **Database:** MongoDB 6.x + Mongoose 7.x
- **Cache:** Redis 7.x
- **Authentication:** JWT + bcryptjs
- **Payments:** Razorpay
- **Email:** Nodemailer
- **Security:** Helmet + express-rate-limit

---

## 📋 PROJECT STRUCTURE

```
backend/
├── src/
│   ├── server.js              Main entry point
│   ├── config/                Database & Redis
│   ├── models/                8 MongoDB schemas
│   ├── controllers/           2 controllers (15 endpoints)
│   ├── services/              4 services with business logic
│   ├── routes/                2 route files
│   ├── middleware/            Auth, Security, Error handling
│   └── utils/                 Validators, Helpers, Errors
├── package.json
├── .env.example
└── [Documentation files]
```

---

## 🔐 SECURITY FEATURES

| Feature | Details |
|---------|---------|
| **Authentication** | JWT (15-min) + Refresh Token (7-day) |
| **Password** | bcrypt with 12 rounds |
| **Rate Limiting** | 100 req/min general, 5 req/min auth |
| **Validation** | Complete input validation |
| **Headers** | Helmet with CSP, HSTS, XSS protection |
| **Encryption** | AES-256-GCM for sensitive data |
| **Fraud Detection** | Scoring system (0-100) |
| **Device Tracking** | Fingerprinting + geolocation |
| **Audit Logging** | All actions logged |
| **CORS** | Configurable origins |

---

## 🧪 TESTING

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "email": "john@test.com",
    "password": "Test@123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "Test@123"
  }'
```

---

## 🚀 DEPLOYMENT

### Prerequisites
- Node.js 18.x+
- MongoDB Atlas account
- Redis server
- npm or yarn

### Production Setup
```bash
NODE_ENV=production npm start
```

---

## 📈 PERFORMANCE

- ✅ Database indexing optimized
- ✅ Query optimization with lean()
- ✅ Pagination support
- ✅ Redis caching layer
- ✅ Async/await for non-blocking ops
- ✅ Connection pooling
- ✅ TTL indexes for auto-cleanup

---

## 🎯 NEXT STEPS

1. **Development:**
   ```bash
   npm run dev      # Start with auto-reload
   ```

2. **Testing:**
   ```bash
   npm test         # Run test suite
   ```

3. **Production:**
   ```bash
   npm start        # Start production server
   ```

---

## 📞 SUPPORT

### Documentation
- **API Reference:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Setup Guide:** [BACKEND_GUIDE.md](BACKEND_GUIDE.md)
- **Project Index:** [PROJECT_INDEX.md](PROJECT_INDEX.md)

### Common Issues
- Check `.env` configuration
- Verify MongoDB connection
- Ensure Redis is running
- Check API base URL in frontend

---

## ✨ KEY ENDPOINTS FOR FRONTEND

```javascript
// Base URL
const API_BASE = 'http://localhost:5000/api/v1';

// Authentication
POST   /auth/register       // Create account
POST   /auth/login          // Login user
POST   /auth/refresh-token  // Refresh token

// Wallet
GET    /wallet              // Get wallet
POST   /wallet/add-money    // Add funds
POST   /wallet/transfer     // Send money

// Transactions
GET    /wallet/transactions // View history
```

---

## 🎉 STATUS

✅ **Backend Status:** Production Ready  
✅ **Modules:** 10/10 Complete  
✅ **Endpoints:** 15/15 Complete  
✅ **Security:** Enterprise-Grade  
✅ **Documentation:** Complete  

**Ready for Frontend Integration (Prompt 3)**

---

**Version:** 1.0.0  
**Last Updated:** June 13, 2026  
**License:** Proprietary

For detailed documentation, see [PROJECT_INDEX.md](PROJECT_INDEX.md)
