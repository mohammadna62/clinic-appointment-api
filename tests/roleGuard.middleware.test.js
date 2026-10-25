
import { describe, it, expect, vi } from "vitest";

import roleGuard from "../src/middlewares/roleGuard.middleware.js";

describe("roleGuard middleware", () => {
  it("should return 401 when req.user is missing", () => {
    const req = {};
    const res = {};
    const next = vi.fn();

    roleGuard("admin")(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Authentication required");
    expect(error.statusCode).toBe(401);
  });

  it("should return 403 when user has no allowed role", () => {
    const req = {
      user: {
        roles: ["patient"],
      },
    };
    const res = {};
    const next = vi.fn();

    roleGuard("admin")(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Access denied");
    expect(error.statusCode).toBe(403);
  });

  it("should call next() when user has an allowed role", () => {
    const req = {
      user: {
        roles: ["admin"],
      },
    };
    const res = {};
    const next = vi.fn();

    roleGuard("admin")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("should allow access when one of multiple user roles is allowed", () => {
    const req = {
      user: {
        roles: ["patient", "doctor"],
      },
    };
    const res = {};
    const next = vi.fn();

    roleGuard("admin", "doctor")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("should deny access when none of the allowed roles match", () => {
    const req = {
      user: {
        roles: ["patient", "doctor"],
      },
    };
    const res = {};
    const next = vi.fn();

    roleGuard("admin", "superadmin")(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Access denied");
    expect(error.statusCode).toBe(403);
  });

  it("should deny access when user roles are empty", () => {
    const req = {
      user: {
        roles: [],
      },
    };
    const res = {};
    const next = vi.fn();

    roleGuard("admin")(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Access denied");
    expect(error.statusCode).toBe(403);
  });

  it("should deny access when no roles are allowed", () => {
    const req = {
      user: {
        roles: ["admin"],
      },
    };
    const res = {};
    const next = vi.fn();

    roleGuard()(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Access denied");
    expect(error.statusCode).toBe(403);
  });
});
