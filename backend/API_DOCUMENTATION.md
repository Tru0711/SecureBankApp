# SecurePay NeoBank - Backend API Documentation

**Version:** 1.0.0  
**API Base URL:** `http://localhost:5000/api/v1`  
**Status:** ✅ Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Authentication Endpoints](#authentication-endpoints)
2. [Wallet Endpoints](#wallet-endpoints)
3. [Common Response Format](#common-response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Security](#security)

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Register User

**POST** `/auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "dateOfBirth": "1990-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "USER",
      "accountStatus": "ACTIVE",
      "kycStatus": "PENDING",
      "createdAt": "2024-06-13T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400`: Validation error
- `409`: User already exists

---

### 2. Login User

**POST** `/auth/login`

**Description:** Authenticate user and get access token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123",
  "deviceFingerprint": "ABC123DEF456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

**Headers Set:**
- `Set-Cookie: refreshToken=<refresh_token>; HttpOnly; Secure; SameSite=Strict`

---

### 3. Refresh Token

**POST** `/auth/refresh-token`

**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

---

### 4. Logout

**POST** `/auth/logout`

**Description:** Logout user and invalidate token

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Forgot Password

**POST** `/auth/forgot-password`

**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

### 6. Reset Password

**POST** `/auth/reset-password`

**Description:** Reset password using reset token

**Request Body:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 7. Send OTP

**POST** `/auth/send-otp`

**Description:** Send OTP for email/phone verification

**Request Body:**
```json
{
  "email": "john@example.com",
  "type": "EMAIL_VERIFICATION"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### 8. Verify Email

**POST** `/auth/verify-email`

**Description:** Verify email with OTP

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 💰 WALLET ENDPOINTS

### 1. Get Wallet

**GET** `/wallet`

**Description:** Get user's wallet details

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Wallet retrieved",
  "data": {
    "wallet": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f1",
      "userId": "64f5a2c3b8e2f1a0c5d8e9f0",
      "balance": 50000,
      "lockedAmount": 0,
      "availableBalance": 50000,
      "currency": "INR",
      "status": "ACTIVE",
      "totalIncome": 100000,
      "totalExpense": 50000,
      "totalTransfers": 5,
      "isVerified": true
    }
  }
}
```

---

### 2. Create Wallet

**POST** `/wallet`

**Description:** Create a new wallet for user

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response (201):**
```json
{
  "success": true,
  "message": "Wallet created successfully",
  "data": {
    "wallet": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f1",
      "userId": "64f5a2c3b8e2f1a0c5d8e9f0",
      "balance": 0,
      "status": "ACTIVE"
    }
  }
}
```

---

### 3. Get Balance

**GET** `/wallet/balance`

**Description:** Get wallet balance

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Balance retrieved",
  "data": {
    "balance": {
      "balance": 50000,
      "lockedAmount": 0,
      "availableBalance": 50000,
      "currency": "INR"
    }
  }
}
```

---

### 4. Add Money (Razorpay)

**POST** `/wallet/add-money`

**Description:** Add money to wallet via Razorpay

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "amount": 10000,
  "paymentMethodId": "pm_123456",
  "razorpayPaymentId": "pay_123456789"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Money added successfully",
  "data": {
    "wallet": {
      "balance": 60000,
      "availableBalance": 60000
    },
    "transaction": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f2",
      "transactionId": "TXN12AB34CD56",
      "type": "DEPOSIT",
      "amount": 10000,
      "status": "SUCCESS",
      "createdAt": "2024-06-13T10:35:00Z"
    }
  }
}
```

---

### 5. Transfer Money

**POST** `/wallet/transfer`

**Description:** Transfer money to another user

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "receiverEmail": "recipient@example.com",
  "amount": 5000,
  "description": "Payment for groceries",
  "deviceFingerprint": "ABC123DEF456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transaction": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f3",
      "transactionId": "TXN56EF78GH90",
      "type": "TRANSFER",
      "amount": 5000,
      "receiver": {
        "firstName": "Jane",
        "email": "recipient@example.com"
      },
      "status": "SUCCESS",
      "createdAt": "2024-06-13T10:40:00Z"
    },
    "senderWallet": {
      "balance": 55000,
      "availableBalance": 55000
    },
    "receiverWallet": {
      "balance": 65000,
      "availableBalance": 65000
    }
  }
}
```

---

### 6. Get Transaction History

**GET** `/wallet/transactions?page=1&limit=10&type=TRANSFER&status=SUCCESS`

**Description:** Get wallet transaction history

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `type`: Filter by type (CREDIT, DEBIT, TRANSFER, DEPOSIT, WITHDRAWAL)
- `status`: Filter by status (PENDING, SUCCESS, FAILED, CANCELLED)

**Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": {
    "transactions": [
      {
        "_id": "64f5a2c3b8e2f1a0c5d8e9f3",
        "transactionId": "TXN56EF78GH90",
        "type": "TRANSFER",
        "amount": 5000,
        "status": "SUCCESS",
        "receiver": {
          "firstName": "Jane",
          "email": "recipient@example.com"
        },
        "createdAt": "2024-06-13T10:40:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 2,
      "limit": 10
    }
  }
}
```

---

### 7. Get Transaction Details

**GET** `/wallet/transactions/:transactionId`

**Description:** Get details of a specific transaction

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `transactionId`: Transaction ID

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction details retrieved",
  "data": {
    "transaction": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f3",
      "transactionId": "TXN56EF78GH90",
      "type": "TRANSFER",
      "amount": 5000,
      "sender": {
        "firstName": "John",
        "email": "john@example.com"
      },
      "receiver": {
        "firstName": "Jane",
        "email": "recipient@example.com"
      },
      "status": "SUCCESS",
      "fraudScore": 15,
      "isFlagged": false,
      "createdAt": "2024-06-13T10:40:00Z",
      "completedAt": "2024-06-13T10:40:30Z"
    }
  }
}
```

---

## 📨 COMMON RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

---

## ⚠️ ERROR HANDLING

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Common Error Messages

```json
{
  "success": false,
  "message": "Invalid email format",
  "statusCode": 400
}
```

---

## 🚦 RATE LIMITING

- **General Limit:** 100 requests per 15 minutes
- **Auth Limit:** 5 requests per 15 minutes
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 🔒 SECURITY

### Headers Required
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Structure
- **Access Token:** 15 minutes validity
- **Refresh Token:** 7 days validity
- **Refresh Token Storage:** Secure HTTP-only cookie

### Security Features
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ XSS Protection
- ✅ CORS Configuration
- ✅ Helmet Security Headers

---

## 📝 EXAMPLE REQUEST/RESPONSE

### Login Example

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123",
    "deviceFingerprint": "ABC123DEF456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f5a2c3b8e2f1a0c5d8e9f0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

---

## 🧪 TESTING

Use Postman or similar tools to test endpoints. Import the following:

```
Base URL: http://localhost:5000/api/v1
Auth Type: Bearer Token
Token: <jwt_access_token>
```

---

**Last Updated:** June 13, 2026  
**API Status:** ✅ Production Ready
