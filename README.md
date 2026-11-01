# Clinic Appointment Management API

A RESTful backend for managing clinic operations, doctor availability, appointment reservations, patient bookings, and payments. The API is built with Node.js and Express, uses MongoDB for persistent data, Redis for short-lived authentication and reservation-related state, and provides an optional AI-assisted appointment search.

**Repository:** [mohammadna62/clinic-appointment-api](https://github.com/mohammadna62/clinic-appointment-api)  
**API version:** `v1`  
**API documentation:** `/api-docs`

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Appointment and Booking Lifecycle](#appointment-and-booking-lifecycle)
- [Authentication and Security](#authentication-and-security)
- [AI-Assisted Appointment Search](#ai-assisted-appointment-search)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Current Integration Notes](#current-integration-notes)

---

## Overview

Clinic Appointment Management API is a backend service designed around the operational workflows of a multi-clinic appointment system.

It supports separate workflows for patients, doctors, and administrators. Clinic policies and weekly schedules define working hours; doctor schedules define the periods in which each doctor is available; the system generates appointment slots from those schedules and manages their transition through reservation and booking.

The project follows an MVC structure with a dedicated service layer. Controllers handle HTTP concerns, services implement business rules, Mongoose models represent persistent data, and middleware handles authentication, authorization, validation, and centralized error processing.

## Core Features

### Authentication and User Management

- Phone-number-based OTP authentication.
- OTP expiration and hashed OTP storage in Redis.
- IP-based OTP rate limiting using Redis counters and expiration.
- Phone-based resend cooldown.
- JWT access and refresh tokens.
- Hashed refresh-token storage and refresh-token rotation.
- Logout and refresh-token invalidation.
- Multi-role user accounts: `patient`, `doctor`, and `admin`.
- Profile completion and partial profile updates.
- National-code format validation and uniqueness checks.
- User ban/unban and soft deletion.
- Refresh-token invalidation when an account is banned or deleted.

### Clinic and Specialty Management

- Admin management of clinics and medical specialties.
- Activate/deactivate controls for clinics and specialties.
- Clinic-specific time policies, including morning/evening working periods and appointment duration.
- Clinic weekly schedules.
- Patient-facing discovery of active clinics, specialties, and doctors associated with them.

### Doctor Management

- Doctor application and profile management.
- Doctor-to-clinic and doctor-to-specialty assignment.
- Medical code, consultation fee, biography, and profile image.
- Doctor activation/deactivation.
- Doctor schedule management with validation against the clinic's weekly schedule.
- Doctor booking views and appointment completion/no-show actions.

### Appointment Availability and Reservations

- Appointment slot generation based on active doctor schedules and clinic appointment-duration policies.
- Rolling appointment generation for a 30-day window.
- Startup recovery for missing appointment slots.
- Daily scheduled appointment generation.
- Atomic reservation of an available slot using a conditional database update.
- Time-limited reservations.
- Automatic release of expired reservations.
- Protection against invalid appointment-state transitions.
- Pagination and filtering for appointment listings.

### Booking Management

- Patient booking creation from a valid reservation.
- Booking history and booking details.
- Patient ownership checks.
- Prevention of overlapping pending or confirmed bookings for the same patient.
- Booking cancellation rules.
- Doctor actions for completing appointments and recording patient no-shows.
- Admin booking listing and status filtering.

### Payments

- ZarinPal payment-request integration.
- Redirect-based payment flow and callback handling.
- Server-side payment verification using the amount stored in the database.
- Payment-state tracking and payment history.
- Idempotent handling for payments that have already been verified.
- Booking confirmation only after successful verification and a valid reservation transition.
- Refund eligibility checks and refund-state recording.

> **Refund scope:** The current refund service validates refund eligibility and updates the payment record to `refunded`. It does not call a ZarinPal refund/disbursement endpoint.

### Ratings and Administration

- Ratings restricted to completed bookings and the booking's patient.
- One rating per booking.
- Doctor rating averages, counts, and star-distribution statistics.
- Admin statistics aggregated from bookings, payments, appointments, doctors, and user roles.
- Admin management endpoints for users, doctors, clinics, specialties, appointments, bookings, payments, and ratings.

### AI-Assisted Appointment Search

- Provider abstraction with `mock` and `openai` implementations.
- Appointment search by doctor, specialty, clinic, date, weekday, and time range.
- OpenAI tool/function calling to query actual available appointment records.
- Appointment availability is sourced from the application database rather than invented by the model.
- The assistant is limited to search assistance: it does not reserve or book appointments.

The assistant is not a diagnostic or medical-advice system. It must not be used to diagnose conditions or prescribe treatment.

---

## Technology Stack

| Area | Technologies |
|---|---|
| Runtime | Node.js |
| HTTP framework | Express 5 |
| Database | MongoDB, Mongoose |
| Cache / ephemeral state | Redis, ioredis |
| Validation | Zod |
| Authentication | JSON Web Tokens, bcrypt |
| HTTP client | Axios |
| AI integration | OpenAI SDK with provider abstraction |
| Scheduled jobs | node-cron |
| API documentation | OpenAPI 3, swagger-jsdoc, swagger-ui-express |
| File uploads | Multer |
| Testing | Vitest, Supertest |
| Security and middleware | Helmet, CORS, compression, cookie-parser, Morgan |

---

## Architecture

The codebase uses **MVC with a service layer**:

```text
HTTP Request
    |
    v
Express Route
    |
    +---- Authentication / Role Guard
    |
    +---- Request Validation (Zod)
    |
    v
Controller
    |
    v
Service Layer
    |
    +---- Mongoose Models ----> MongoDB
    |
    +---- Redis
    |
    +---- External Providers (IPPanel / ZarinPal / OpenAI)
    |
    v
Standardized API Response

Errors
    |
    v
Centralized Error Handler
```

Key design choices:

- Controllers remain focused on HTTP request/response handling.
- Business rules are implemented in service modules.
- Zod schemas validate request data before it reaches controllers.
- `AppError` and a global error handler provide a centralized operational-error flow.
- Shared response helpers keep successful and failed API responses consistent.
- Environment variables are parsed and validated at startup.
- The application connects to MongoDB and Redis before starting scheduled jobs and accepting HTTP traffic.

## Appointment and Booking Lifecycle

The appointment slot lifecycle is:

```text
available
    |
    | Patient reserves the slot
    v
reserved
    |
    | Booking is created and payment is verified
    v
booked
```

A reservation is time-limited. The current reservation service sets a 10-minute reservation window. A scheduled job checks expired reservations and releases their slots. If a pending booking or payment is associated with an expired reservation, the corresponding records are updated.

The booking lifecycle is managed separately from the appointment-slot lifecycle. For example, a booking can be `pending`, `confirmed`, `completed`, `cancelled`, or `patient_no_show`.

The payment verification flow checks the payment amount against the database record, verifies the transaction with ZarinPal, and conditionally transitions the appointment from `reserved` to `booked` for the same patient.

## Authentication and Security

The OTP flow uses Redis for short-lived state:

1. The API generates an OTP.
2. The OTP is hashed with bcrypt before it is stored in Redis.
3. Redis expiration controls the OTP lifetime.
4. A separate Redis key enforces the resend cooldown.
5. An IP-based rate limiter uses `INCR` and `EXPIRE` to count requests within a configured window.
6. After successful verification, the OTP key is deleted and the API issues access and refresh tokens.
7. Refresh tokens are hashed before being stored in Redis and are rotated during refresh.

Additional controls include role-based authorization, request validation, banned/deleted-account checks, Helmet security headers, configurable Express proxy trust, and centralized error handling.

---

## API Documentation

When the application is running, open:

```text
http://localhost:PORT/api-docs
```

The API is versioned under `/api/v1`.

Main route groups:

| Area | Base path |
|---|---|
| Authentication | `/api/v1/auth` |
| Admin operations | `/api/v1/admin` |
| User management | `/api/v1/users` |
| Admin clinic management | `/api/v1/admin/clinics` |
| Patient clinic discovery | `/api/v1/clinics` |
| Admin specialty management | `/api/v1/admin/specialties` |
| Patient specialty discovery | `/api/v1/specialties` |
| Doctor operations | `/api/v1/doctors` |
| Available appointments | `/api/v1/available-appointments` |
| Bookings | `/api/v1/bookings` |
| Payments | `/api/v1/payments` |
| AI assistant | `/api/v1/assistant` |

Health check:

```http
GET /api/v1/health
```

---

## Getting Started

### Prerequisites

Install and configure:

- Node.js and npm.
- MongoDB.
- Redis.

External integrations require their own credentials if enabled (IPPanel for provider-based SMS, ZarinPal for payments, and OpenAI for the OpenAI assistant provider).

### 1. Clone the repository

```bash
git clone https://github.com/mohammadna62/clinic-appointment-api.git
cd clinic-appointment-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

### 4. Configure environment variables

Fill in the required values in `.env`. See [Environment Variables](#environment-variables).

For local development, the default OTP delivery mode can be `console`. In this mode, OTP values are written to the server console and no SMS provider credentials are required. Console delivery is restricted by the application to development and test environments.

### 5. Start MongoDB and Redis

Make sure both services are running and their connection settings match `.env`.

### 6. Start the development server

```bash
npm run dev
```

The bootstrap process connects to MongoDB and Redis, recovers missing appointment slots, starts the scheduled jobs, and then starts the HTTP server.

---

## Environment Variables

The `.env.example` file lists the supported configuration keys. Set the values appropriate for your environment.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment (`development`, `test`, or `production`) |
| `PORT` | HTTP server port |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URI` | Optional Redis connection URI |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime |
| `REFRESH_TOKEN_EXPIRE_SECONDS` | Redis lifetime for the stored refresh-token hash |
| `TOKEN_HASH_SECRET` | Secret used by token-hashing utilities |
| `OTP_EXPIRE_SECONDS` | OTP lifetime |
| `OTP_RATE_LIMIT_WINDOW_SECONDS` | IP-based OTP rate-limit window |
| `OTP_RATE_LIMIT_MAX_REQUESTS` | Maximum OTP requests allowed in that window |
| `OTP_RESEND_COOLDOWN_SECONDS` | Minimum interval between OTP requests for a phone number |
| `OTP_DELIVERY_MODE` | `console` or `provider` |
| `TRUST_PROXY_HOPS` | Number of trusted proxy hops for Express |
| `SMS_USERNAME` | IPPanel username (provider mode) |
| `SMS_PASSWORD` | IPPanel password (provider mode) |
| `SMS_SENDER_NUMBER` | IPPanel sender number (provider mode) |
| `SMS_VERIFY_PATTERN_CODE` | IPPanel verification pattern code (provider mode) |
| `ZARINPAL_MERCHANT_ID` | ZarinPal merchant identifier |
| `ZARINPAL_PAYMENT_CALLBACK_URL` | Public callback URL configured for payment verification |
| `ZARINPAL_PAYMENT_BASE_URL` | ZarinPal payment redirect base URL |
| `ZARINPAL_API_BASE_URL` | ZarinPal API base URL |
| `PROJECT_TIME_ZONE` | Time zone used by project date logic and scheduled jobs |
| `AI_PROVIDER` | `mock` or `openai` |
| `OPENAI_API_KEY` | Required when `AI_PROVIDER=openai` |
| `OPENAI_MODEL` | OpenAI model identifier; defaults to the value configured in `env.js` |

Do not commit `.env` or expose API keys, passwords, JWT secrets, merchant credentials, OTPs, or patient data. Keep `.env.example` free of real credentials.

---

## Running the Application

Development:

```bash
npm run dev
```

Production start:

```bash
npm start
```

The server performs the following startup sequence:

1. Connect to MongoDB.
2. Connect to Redis.
3. Recover missing appointment slots for active doctors.
4. Start the daily appointment-generation job.
5. Start the reservation-expiration job.
6. Start the HTTP server.

---

## Running Tests

Run the test suite:

```bash
npm test
```

Tests are implemented with Vitest and Supertest and are located in the `tests/` directory. The repository archive includes 86 test files covering services, controllers, models, middleware, validators, utilities, integrations, and application behavior.

---

## Project Structure

```text
clinic-appointment-api/
├── docs/                  # Development notes, rules, and roadmap
├── public/
│   └── uploads/           # Uploaded public assets
├── src/
│   ├── config/            # Environment, database, Redis, Swagger
│   ├── constants/
│   ├── controllers/       # HTTP controllers
│   ├── errors/            # Centralized application errors
│   ├── helpers/           # Shared response helpers
│   ├── jobs/              # Scheduled and recovery jobs
│   ├── middlewares/       # Auth, roles, validation, uploads, errors
│   ├── models/            # Mongoose models
│   ├── providers/         # AI provider implementations
│   ├── routes/            # Express route definitions
│   ├── services/          # Business logic and integrations
│   ├── utils/             # Shared utilities
│   └── validators/        # Zod request schemas
├── tests/                 # Automated tests
├── .env.example
├── package.json
├── package-lock.json
└── server.js
```

## Current Integration Notes

- **IPPanel SMS:** The provider adapter and configurable OTP delivery mode are implemented. A real delivery attempt reached IPPanel, but the provider returned an insufficient-account-balance response. Successful live SMS delivery has therefore not been confirmed in the current environment. Use `console` mode for local development/testing, or configure a funded provider account for live delivery.
- **ZarinPal:** Payment request and verification flows are implemented in the codebase. Configure valid merchant credentials and callback settings before attempting live transactions.
- **AI assistant:** The `mock` provider works without an external AI key. The `openai` provider requires `OPENAI_API_KEY` and a valid `OPENAI_MODEL`.
- **Assistant conversation history:** The current implementation stores conversation history in process memory. It is not persistent across restarts and is not shared between multiple application instances.

---

## License

This project is licensed under the [MIT License](LICENSE).
