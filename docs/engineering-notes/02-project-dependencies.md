# Project Dependencies

This document summarizes the primary dependencies used in the Clinic Appointment Management API project and the role of each package.

> **Note**
>
> The dependency list may evolve as the project grows. New packages should be introduced only when they provide a clear architectural or operational benefit.

---

# Runtime Dependencies

| Package | Purpose |
|---|---|
| `express` | HTTP server and REST API framework |
| `mongoose` | MongoDB object modeling and database interaction |
| `dotenv` | Environment variable management |
| `cors` | Cross-Origin Resource Sharing configuration |
| `helmet` | Security-related HTTP headers |
| `compression` | HTTP response compression |
| `morgan` | HTTP request logging |
| `cookie-parser` | Parsing cookies from incoming requests |
| `axios` | HTTP client for external API requests |
| `jsonwebtoken` | JWT access and refresh token handling |
| `bcrypt` | Password hashing |
| `ioredis` | Redis client used for OTP-related operations and other Redis-based functionality |
| `multer` | Middleware for handling multipart/form-data and file uploads |
| `node-cron` | Scheduling and execution of recurring background tasks |
| `openai` | Integration with OpenAI APIs for the AI assistant |
| `swagger-jsdoc` | Generating OpenAPI documentation from JSDoc annotations |
| `swagger-ui-express` | Serving interactive Swagger UI documentation |
| `zod` | Request validation and schema definition |
| `zarinpal-checkout` | Integration with the Zarinpal payment gateway |

---

# Development Dependencies

The current `package.json` does not define a separate `devDependencies` section.

The project uses `nodemon` through the development script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}