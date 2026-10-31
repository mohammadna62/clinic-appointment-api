import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  banUser: vi.fn(),
  unBanUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUsers: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/user.service.js", () => ({
  banUser: mocks.banUser,
  unBanUser: mocks.unBanUser,
  updateUser: mocks.updateUser,
  deleteUser: mocks.deleteUser,
  getUsers: mocks.getUsers,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  banUser,
  unBanUser,
  updateUser,
  deleteUser,
  getUser,
} from "../src/controllers/user.controller.js";

describe("User Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        userId: "current-user-id",
      },
      validated: {
        params: {
          userId: "target-user-id",
        },
        body: {
          firstName: "Ali",
          lastName: "Ahmadi",
          nationalCode: "1234567890",
        },
        query: {
          status: "active",
          page: 1,
          limit: 10,
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("banUser", () => {
    it("should ban a user successfully", async () => {
      const user = {
        _id: "target-user-id",
        isBanned: true,
      };

      mocks.banUser.mockResolvedValueOnce(user);

      await banUser(req, res, next);

      expect(mocks.banUser).toHaveBeenCalledWith("target-user-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "User banned successfully",
        data: { user },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("User ban failed");

      mocks.banUser.mockRejectedValueOnce(error);

      await banUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("unBanUser", () => {
    it("should unban a user successfully", async () => {
      const user = {
        _id: "target-user-id",
        isBanned: false,
      };

      mocks.unBanUser.mockResolvedValueOnce(user);

      await unBanUser(req, res, next);

      expect(mocks.unBanUser).toHaveBeenCalledWith("target-user-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "User unbanned successfully",
        data: { user },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("User unban failed");

      mocks.unBanUser.mockRejectedValueOnce(error);

      await unBanUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update the current user's profile successfully", async () => {
      const user = {
        _id: "current-user-id",
        firstName: "Ali",
        lastName: "Ahmadi",
        nationalCode: "1234567890",
      };

      mocks.updateUser.mockResolvedValueOnce(user);

      await updateUser(req, res, next);

      expect(mocks.updateUser).toHaveBeenCalledWith(
        "current-user-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "User profile updated successfully",
        data: { user },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("User profile update failed");

      mocks.updateUser.mockRejectedValueOnce(error);

      await updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      const user = {
        _id: "target-user-id",
        isDeleted: true,
      };

      mocks.deleteUser.mockResolvedValueOnce(user);

      await deleteUser(req, res, next);

      expect(mocks.deleteUser).toHaveBeenCalledWith("target-user-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "User deleted successfully",
        data: { user },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("User deletion failed");

      mocks.deleteUser.mockRejectedValueOnce(error);

      await deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getUser", () => {
    it("should retrieve users successfully", async () => {
      const result = {
        users: [
          {
            _id: "user-id",
            firstName: "Ali",
            lastName: "Ahmadi",
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getUsers.mockResolvedValueOnce(result);

      await getUser(req, res, next);

      expect(mocks.getUsers).toHaveBeenCalledWith("active", 1, 10);

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Users retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Users retrieval failed");

      mocks.getUsers.mockRejectedValueOnce(error);

      await getUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});