# API Response Standard

## Purpose

This document defines the standard response format used throughout the Clinic Appointment Management API.

Using a consistent response structure improves maintainability, simplifies frontend integration, and provides predictable API behavior.

---

# General Principles

- Every API response MUST return JSON.
- Every response MUST contain the HTTP status code.
- Success and error responses MUST follow the same structure.
- Response messages MUST use sentence case.
- Validation errors MUST provide field-level details.
- Business logic errors MUST contain meaningful messages.
- Internal server errors MUST NOT expose sensitive information.

---

# Success Response

```json
{
  "status": 200,
  "success": true,
  "message": "Doctor created successfully",
  "data": {}
}
```

## Fields

| Field   | Description                                  |
| ------- | -------------------------------------------- |
| status  | HTTP status code                             |
| success | Indicates whether the request was successful |
| message | Human-readable message                       |
| data    | Response payload                             |

---

# Error Response

```json
{
  "status": 404,
  "success": false,
  "message": "Doctor not found",
  "errors": null
}
```

## Fields

| Field   | Description                |
| ------- | -------------------------- |
| status  | HTTP status code           |
| success | Always false               |
| message | Error description          |
| errors  | Validation details or null |

---

# Validation Error Response

```json
{
  "status": 400,
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "mobile",
      "message": "Mobile number is required."
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters."
    }
  ]
}
```

---

# Message Convention

Messages must use sentence case.

✅ Correct

- User created successfully
- Route not found
- Invalid credentials
- Validation failed

❌ Incorrect

- User Created Successfully
- ROUTE NOT FOUND

---

# HTTP Status Codes

| Status | Usage                   |
| ------ | ----------------------- |
| 200    | Successful request      |
| 201    | Resource created        |
| 204    | No content              |
| 400    | Validation failed       |
| 401    | Authentication required |
| 403    | Access denied           |
| 404    | Resource not found      |
| 409    | Conflict                |
| 422    | Business rule violation |
| 500    | Internal server error   |

---

# Design Goals

- Consistent response structure
- Predictable API behavior
- Easy frontend integration
- Centralized response generation
- Maintainable codebase
