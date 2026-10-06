# CommonJS vs ES Modules in Node.js

## Overview

This document summarizes the rationale behind choosing **ES Modules (ESM)** for this project and highlights the key differences from CommonJS.

Although CommonJS remains widely used in existing Node.js applications, ES Modules are the official JavaScript module standard and provide better interoperability with modern tooling and the broader JavaScript ecosystem.

---

## Why ES Modules for this project?

The following considerations influenced this architectural decision:

- Uses the official JavaScript module system.
- Aligns with modern Node.js development.
- Improves compatibility with TypeScript and NestJS.
- Shares the same module syntax as frontend frameworks such as React.
- Encourages a consistent module system across the codebase.

---

## package.json

### CommonJS

```json
{
  "type": "commonjs"
}