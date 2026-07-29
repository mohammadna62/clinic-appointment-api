# Development Rules

> Project: Clinic Appointment Management API

This document contains the development rules and coding standards that must be followed throughout the project.

---

# 1. Architecture

- Follow the MVC architecture.
- Keep controllers thin.
- Put business logic inside services.
- Keep database logic out of controllers whenever possible.

---

# 2. Error Handling

- Never send error responses directly from controllers.
- Always use `AppError` for operational errors.
- All errors must pass through the global `errorHandler`.
- Keep one centralized error handling flow.

---

# 3. API Response Standard

- Always use `successResponse()` for successful responses.
- Always use `errorResponse()` for failed responses.
- Keep all API responses consistent.

---

# 4. Code Style

- Use ES Modules (`import` / `export`).
- Use meaningful variable and function names.
- Keep functions small and focused.
- Remove unused imports and variables.

---

# 5. Git Workflow

Before every commit:

- Remove temporary `console.log()` statements.
- Remove temporary debug code.
- Review changed files.
- Run the application.
- Check `git status`.
- Write a meaningful commit message.

---

# 6. Documentation

Whenever a new architecture decision is made:

- Update related engineering notes.
- Update the development roadmap if necessary.
- Keep documentation synchronized with the project.

---

# 7. Learning Process

Every important topic must follow this order:

1. Understand the concept.
2. Implement the code.
3. Trace the execution using logs or debugging.
4. Analyze the execution flow.
5. Remove temporary logs before committing.

---

# 8. Project Philosophy

- Prefer clarity over clever code.
- Keep the project production-ready.
- Follow clean architecture principles.
- Write code that future developers can easily understand.