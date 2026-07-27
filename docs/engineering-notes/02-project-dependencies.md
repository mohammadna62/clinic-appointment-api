# Project Dependencies

This document summarizes the primary dependencies used in the Clinic Appointment Management API project and the rationale behind each selection.

> **Note**
> The dependency list may evolve as the project grows. New packages will be introduced only when they provide a clear architectural or operational benefit.

---

# Runtime Dependencies

| Package            | Purpose                                                              |
| ------------------ | -------------------------------------------------------------------- |
| express            | HTTP server and REST API framework                                   |
| mongoose           | MongoDB object modeling                                              |
| dotenv             | Environment variable management                                      |
| cors               | Cross-Origin Resource Sharing configuration                          |
| helmet             | Secure HTTP headers                                                  |
| compression        | Gzip response compression                                            |
| morgan             | HTTP request logging                                                 |
| cookie-parser      | Cookie parsing middleware                                            |
| axios              | HTTP client for external APIs                                        |
| jsonwebtoken       | JWT access and refresh token handling                                |
| bcrypt             | Password hashing (reserved for future administrative authentication) |
| ioredis            | Redis client for OTP and caching                                     |
| multer             | File upload middleware                                               |
| nanoid             | Secure unique identifier generation                                  |
| zod                | Request validation and schema definition                             |
| swagger-ui-express | API documentation                                                    |
| zarinpal-checkout  | Payment gateway integration                                          |

---

# Development Dependencies

| Package | Purpose                                     |
| ------- | ------------------------------------------- |
| nodemon | Automatic server restart during development |

---

# Design Principles

The project follows a minimal dependency philosophy:

- Introduce a package only when it solves a real engineering problem.
- Prefer mature, actively maintained libraries.
- Avoid redundant packages with overlapping responsibilities.
- Keep the dependency tree as small and maintainable as possible.

---

# Notes

Some dependencies may not be utilized immediately in the early stages of development. They have been selected based on the planned project roadmap, including:

- OTP authentication
- Appointment scheduling
- Payment processing
- Redis caching
- API documentation
- Image uploads
