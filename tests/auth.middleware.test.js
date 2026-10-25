
import { describe, it, expect, vi, beforeEach } from "vitest";

import auth from "../src/middlewares/auth.middleware.js";
import { verifyAccessToken } from "../src/utils/jwt.util.js";
import User from "../src/models/user.model.js";

vi.mock("../src/utils/jwt.util.js", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

describe("auth middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      headers: {},
    };

    res = {};
    next = vi.fn();
  });

  it("should return an error when Authorization header is missing", async () => {
    await auth(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Authorization header is required");
    expect(error.statusCode).toBe(401);
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("should return an error when authorization format is invalid", async () => {
    req.headers.authorization = "Basic abc123";

    await auth(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("Invalid authorization format");
    expect(error.statusCode).toBe(401);
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("should return an error when user is not found", async () => {
    req.headers.authorization = "Bearer valid-token";

    verifyAccessToken.mockReturnValue({
      userId: "user-123",
    });

    User.findById.mockResolvedValue(null);

    await auth(req, res, next);

    const error = next.mock.calls[0][0];

    expect(User.findById).toHaveBeenCalledWith("user-123");
    expect(error.message).toBe("User not found");
    expect(error.statusCode).toBe(404);
  });

  it("should return an error when user is banned", async () => {
    req.headers.authorization = "Bearer valid-token";

    verifyAccessToken.mockReturnValue({
      userId: "user-123",
    });

    User.findById.mockResolvedValue({
      _id: "user-123",
      roles: ["patient"],
      isBanned: true,
    });

    await auth(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toBe("User is banned");
    expect(error.statusCode).toBe(403);
  });

  it("should attach user information to req and call next()", async () => {
    req.headers.authorization = "Bearer valid-token";

    verifyAccessToken.mockReturnValue({
      userId: "user-123",
    });

    User.findById.mockResolvedValue({
      _id: "user-123",
      roles: ["patient"],
      isBanned: false,
    });

    await auth(req, res, next);

    expect(req.user).toEqual({
      userId: "user-123",
      roles: ["patient"],
    });

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("should pass token verification errors to next()", async () => {
    req.headers.authorization = "Bearer invalid-token";

    const tokenError = new Error("Invalid token");

    verifyAccessToken.mockImplementation(() => {
      throw tokenError;
    });

    await auth(req, res, next);

    expect(next).toHaveBeenCalledWith(tokenError);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("should pass database errors to next()", async () => {
    req.headers.authorization = "Bearer valid-token";

    verifyAccessToken.mockReturnValue({
      userId: "user-123",
    });

    const databaseError = new Error("Database unavailable");

    User.findById.mockRejectedValue(databaseError);

    await auth(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
  });
});
