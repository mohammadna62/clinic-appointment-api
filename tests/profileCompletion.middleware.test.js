
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findByIdMock, isProfileCompletedMock } = vi.hoisted(() => ({
  findByIdMock: vi.fn(),
  isProfileCompletedMock: vi.fn(),
}));

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findById: findByIdMock,
  },
}));

vi.mock("../src/services/user.service.js", () => ({
  isProfileCompleted: isProfileCompletedMock,
}));

import profileCompletion from "../src/middlewares/profileCompletion.middleware.js";

describe("profileCompletion middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        userId: "user-123",
      },
    };

    res = {};
    next = vi.fn();
  });

  it("should return 404 when user is not found", async () => {
    findByIdMock.mockResolvedValue(null);

    await profileCompletion(req, res, next);

    expect(findByIdMock).toHaveBeenCalledWith("user-123");

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User not found",
        statusCode: 404,
      }),
    );

    expect(isProfileCompletedMock).not.toHaveBeenCalled();
  });

  it("should return 403 when profile is incomplete", async () => {
    const user = {
      firstName: "Ali",
      lastName: "",
      nationalCode: "1234567890",
    };

    findByIdMock.mockResolvedValue(user);
    isProfileCompletedMock.mockReturnValue(false);

    await profileCompletion(req, res, next);

    expect(isProfileCompletedMock).toHaveBeenCalledWith(user);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Please complete your profile first",
        statusCode: 403,
      }),
    );
  });

  it("should call next without an error when profile is complete", async () => {
    const user = {
      firstName: "Ali",
      lastName: "Ahmadi",
      nationalCode: "1234567890",
    };

    findByIdMock.mockResolvedValue(user);
    isProfileCompletedMock.mockReturnValue(true);

    await profileCompletion(req, res, next);

    expect(isProfileCompletedMock).toHaveBeenCalledWith(user);
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("should pass database errors to next", async () => {
    const databaseError = new Error("Database connection failed");

    findByIdMock.mockRejectedValue(databaseError);

    await profileCompletion(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
  });
});
