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
```

### ES Modules

```json
{
  "type": "module"
}
```

---

## Import Syntax

### CommonJS

```javascript
const express = require("express");
```

### ES Modules

```javascript
import express from "express";
```

---

## Export Syntax

### CommonJS

```javascript
module.exports = router;
```

### ES Modules

```javascript
export default router;
```

---

## Named Export

### CommonJS

```javascript
module.exports = {
  login,
  register,
};
```

### ES Modules

```javascript
export { login, register };
```

---

## Local Module Import

### CommonJS

```javascript
const authRoutes = require("./routes/auth.routes");
```

### ES Modules

```javascript
import authRoutes from "./routes/auth.routes.js";
```

> Local imports should explicitly include the `.js` extension when using ES Modules.

---

## \_\_dirname

CommonJS exposes `__dirname` automatically.

In ES Modules it must be recreated:

```javascript
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

## Dynamic Import

```javascript
const helper = await import("./helper.js");
```

---

## Summary

| CommonJS                     | ES Modules                          |
| ---------------------------- | ----------------------------------- |
| require()                    | import                              |
| module.exports               | export                              |
| \_\_dirname built-in         | Recreated with fileURLToPath        |
| \_\_filename built-in        | Recreated with fileURLToPath        |
| No file extension required   | Explicit `.js` extension            |
| Legacy Node.js module system | Official JavaScript module standard |

---

## Project Convention

The following conventions are applied throughout this project:

- Use `import` instead of `require`.
- Use `export` / `export default`.
- Include the `.js` extension in local imports.
- Configure `"type": "module"` in `package.json`.
- Prefer the standard JavaScript module system for all new source files.
