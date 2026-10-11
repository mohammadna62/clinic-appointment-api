# Clinic Appointment Management API — Development Roadmap

> Project: Clinic Appointment Management API  
> Repository: `clinic-appointment-api`  
> Architecture: MVC + Service Layer  
> Stack: Node.js, Express.js, MongoDB, Mongoose, Redis

---

# 1. Project Foundation

- [x] Repository initialization
- [x] Node.js project configuration
- [x] ES Modules configuration
- [x] Express application setup
- [x] Environment configuration with Zod
- [x] MongoDB connection
- [x] Redis connection
- [x] Global error handling
- [x] Centralized `AppError`
- [x] Standard API response helpers
- [x] Request validation middleware
- [x] Pagination utilities
- [x] Date/time utilities
- [x] HTTP request logging
- [x] CORS
- [x] Helmet security headers
- [x] Compression
- [x] Cookie parser
- [x] Static file serving for uploads
- [x] File upload infrastructure
- [x] API health check

Health check:

`GET /api/v1/health`

---

# 2. Authentication & Authorization

## Authentication

- [x] OTP-based authentication
- [x] OTP generation
- [x] OTP expiration using Redis TTL
- [x] OTP verification
- [x] OTP IP-based rate limiting
- [x] OTP phone-based resend cooldown
- [x] Protection against OTP requests for banned users
- [x] JWT access token
- [x] JWT refresh token
- [x] Refresh token hashing
- [x] Refresh token expiration
- [x] Refresh token rotation
- [x] Logout
- [x] Authentication middleware
- [x] Banned-user protection during authentication
- [x] Profile completion

## Authorization

- [x] Role-based authorization
- [x] Reusable `roleGuard` middleware
- [x] Patient authorization
- [x] Doctor authorization
- [x] Admin authorization
- [x] Patient/Doctor combined access where required

Current roles:

- `patient`
- `doctor`
- `admin`

A user can have multiple roles.

For example, an approved doctor can have:

`["patient", "doctor"]`

This allows the same account to use patient functionality while also accessing doctor functionality.

---

# 3. User Management

- [x] User profile
- [x] Profile completion
- [x] Profile update
- [x] National code validation
- [x] National code uniqueness check
- [x] Admin user listing
- [x] Admin user deletion
- [x] User ban
- [x] User un-ban
- [x] Authentication protection for banned users
- [x] Refresh-token protection for banned users
- [x] Refresh-token invalidation when banning a user

---

# 4. Clinic Management

## Admin

- [x] Create clinic
- [x] List clinics
- [x] Get clinic by ID
- [x] Update clinic
- [x] Activate/deactivate clinic
- [x] Clinic time policy
- [x] Clinic weekly schedule
- [x] Update weekly schedule
- [x] Delete weekly schedule

## Patient

- [x] List active clinics
- [x] List active doctors by clinic

Patient endpoints:

`GET /api/v1/clinics`

`GET /api/v1/clinics/:clinicId/doctors`

---

# 5. Specialty Management

## Admin

- [x] Create specialty
- [x] List specialties
- [x] Get specialty by ID
- [x] Update specialty
- [x] Activate/deactivate specialty

## Patient

- [x] List active specialties
- [x] List active doctors by specialty

Patient endpoints:

`GET /api/v1/specialties`

`GET /api/v1/specialties/:specialtyId/doctors`

Admin and patient specialty routes are intentionally separated.

Admin:

`/api/v1/admin/specialties`

Patient:

`/api/v1/specialties`

---

# 6. Doctor Management

## Doctor Registration

- [x] Patient submits doctor application
- [x] Doctor profile creation
- [x] Profile image upload
- [x] Specialty assignment
- [x] Clinic assignment
- [x] Medical code
- [x] Consultation fee
- [x] Bio

## Admin

- [x] List doctors
- [x] Update doctor
- [x] Activate/deactivate doctor
- [x] Manage doctor status
- [x] View doctor ratings
- [x] Manage doctor schedules

## Doctor

- [x] Update doctor profile
- [x] View own bookings
- [x] View booking details
- [x] Complete appointment
- [x] Mark patient as no-show

## Patient

- [x] View doctor profile
- [x] View doctor schedules
- [x] View doctor ratings
- [x] Find doctors by clinic
- [x] Find doctors by specialty

---

# 7. Doctor Schedule Management

- [x] Create doctor schedule
- [x] List doctor schedules
- [x] Update doctor schedule
- [x] Delete doctor schedule
- [x] Doctor leave / schedule exceptions
- [x] Schedule validation
- [x] Schedule-based appointment generation

---

# 8. Appointment Slot Management

- [x] Generate appointment slots
- [x] Generate appointments for a specific date
- [x] Generate appointments for a month
- [x] Appointment availability
- [x] Appointment reservation
- [x] Reservation expiration
- [x] Appointment status management
- [x] Release reserved appointments
- [x] Prevent invalid appointment states

Appointment lifecycle includes states such as:

- `available`
- `reserved`
- `booked`

Appointment slots are generated from doctor schedules, clinic policies and schedule exceptions.

---

# 9. Booking Management

## Patient

- [x] Create booking
- [x] View booking history
- [x] View booking details
- [x] Cancel booking
- [x] Booking cancellation validation
- [x] Overlapping booking prevention
- [x] Patient booking ownership validation
- [x] Appointment availability validation

## Doctor

- [x] View doctor bookings
- [x] View booking details
- [x] Complete confirmed booking
- [x] Mark patient as no-show
- [x] Prevent completing future appointments

## Admin

- [x] List all bookings
- [x] View booking details
- [x] Filter bookings by status

---

# 10. Payment

- [x] Payment creation
- [x] ZarinPal integration
- [x] Payment redirect
- [x] Payment callback
- [x] Payment verification
- [x] Payment status management
- [x] Payment history
- [x] Admin payment listing
- [x] Admin payment details
- [x] Refund management
- [x] Cancellation/refund business rules

Payment flow:

```text
Booking
   ↓
Create Payment
   ↓
ZarinPal
   ↓
Payment Callback
   ↓
Payment Verification
   ↓
Booking Confirmation