import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../src/config/redis.js", () => ({
  redis: {
    del: vi.fn(),
  },
}));

import User from "../src/models/user.model.js";
import { redis } from "../src/config/redis.js";

import {
  banUser,
  unBanUser,
  updateUser,
  isProfileCompleted,
  deleteUser,
  getUsers,
} from "../src/services/user.service.js";

describe("User Service", () => {
  const userId = "507f1f77bcf86cd799439011";

  let user;

  beforeEach(() => {
    vi.resetAllMocks();

    user = {
      _id: userId,
      firstName: "Mohammad",
      lastName: "Naghavi",
      nationalCode: "1234567890",
      isBanned: false,
      isDeleted: false,
      deletedAt: null,
      save: vi.fn().mockResolvedValue(undefined),
    };

    User.findByIdAndUpdate.mockResolvedValue(user);
    User.findById.mockResolvedValue(user);
    User.findOne.mockResolvedValue(null);
    User.countDocuments.mockResolvedValue(1);
    redis.del.mockResolvedValue(1);
  });

  describe("banUser", () => {
    it("should ban the user and delete the refresh token", async () => {
      const result = await banUser(userId);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { isBanned: true },
        { new: true, runValidators: true },
      );

      expect(redis.del).toHaveBeenCalledWith(
        `auth:refresh:${userId}`,
      );

      expect(result).toBe(user);
    });

    it("should throw 404 if the user does not exist", async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      await expect(banUser(userId)).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });

      expect(redis.del).not.toHaveBeenCalled();
    });

    it("should propagate a Redis error", async () => {
      redis.del.mockRejectedValue(new Error("Redis unavailable"));

      await expect(banUser(userId)).rejects.toThrow(
        "Redis unavailable",
      );
    });
  });

  describe("unBanUser", () => {
    it("should unban the user", async () => {
      const result = await unBanUser(userId);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { isBanned: false },
        { new: true, runValidators: true },
      );

      expect(result).toBe(user);
    });

    it("should throw 404 if the user does not exist", async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      await expect(unBanUser(userId)).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
    });
  });

  describe("updateUser", () => {
    it("should update the provided user fields", async () => {
      const data = {
        firstName: "Ali",
        lastName: "Ahmadi",
      };

      const result = await updateUser(userId, data);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        data,
        { new: true, runValidators: true },
      );

      expect(result).toBe(user);
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("should throw 400 if the user ID is invalid", async () => {
      await expect(
        updateUser("invalid-id", { firstName: "Ali" }),
      ).rejects.toMatchObject({
        message: "Invalid user ID",
        statusCode: 400,
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw 409 if the national code is already in use", async () => {
      User.findOne.mockResolvedValue({ _id: "another-user" });

      await expect(
        updateUser(userId, { nationalCode: "9876543210" }),
      ).rejects.toMatchObject({
        message: "National code is already in use",
        statusCode: 409,
      });

      expect(User.findOne).toHaveBeenCalledWith({
        nationalCode: "9876543210",
        _id: { $ne: userId },
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should allow keeping the same national code if no other user uses it", async () => {
      const data = { nationalCode: user.nationalCode };

      await updateUser(userId, data);

      expect(User.findOne).toHaveBeenCalledWith({
        nationalCode: user.nationalCode,
        _id: { $ne: userId },
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        data,
        { new: true, runValidators: true },
      );
    });

    it("should throw 404 if the user does not exist", async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        updateUser(userId, { firstName: "Ali" }),
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
    });

    it("should allow an empty update object", async () => {
      await updateUser(userId, {});

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        {},
        { new: true, runValidators: true },
      );
    });
  });

  describe("isProfileCompleted", () => {
    it("should return true when all required profile fields exist", () => {
      expect(isProfileCompleted(user)).toBe(true);
    });

    it("should return false if first name is missing", () => {
      expect(
        isProfileCompleted({
          ...user,
          firstName: "",
        }),
      ).toBe(false);
    });

    it("should return false if last name is missing", () => {
      expect(
        isProfileCompleted({
          ...user,
          lastName: "",
        }),
      ).toBe(false);
    });

    it("should return false if national code is missing", () => {
      expect(
        isProfileCompleted({
          ...user,
          nationalCode: undefined,
        }),
      ).toBe(false);
    });
  });

  describe("deleteUser", () => {
    it("should soft-delete the user and remove the refresh token", async () => {
      const result = await deleteUser(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(user.isDeleted).toBe(true);
      expect(user.deletedAt).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalledOnce();

      expect(redis.del).toHaveBeenCalledWith(
        `auth:refresh:${userId}`,
      );

      expect(result).toBe(user);
    });

    it("should throw 404 if the user does not exist", async () => {
      User.findById.mockResolvedValue(null);

      await expect(deleteUser(userId)).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });

      expect(redis.del).not.toHaveBeenCalled();
    });

    it("should throw 409 if the account is already deleted", async () => {
      user.isDeleted = true;

      await expect(deleteUser(userId)).rejects.toMatchObject({
        message: "User account is already deleted",
        statusCode: 409,
      });

      expect(user.save).not.toHaveBeenCalled();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it("should propagate a Redis error after saving the user", async () => {
      redis.del.mockRejectedValue(new Error("Redis unavailable"));

      await expect(deleteUser(userId)).rejects.toThrow(
        "Redis unavailable",
      );

      expect(user.save).toHaveBeenCalledOnce();
    });
  });

  describe("getUsers", () => {
    function mockUserQuery(users) {
      const query = {
        sort: vi.fn(),
        skip: vi.fn(),
        limit: vi.fn(),
      };

      query.sort.mockReturnValue(query);
      query.skip.mockReturnValue(query);
      query.limit.mockResolvedValue(users);

      User.find.mockReturnValue(query);

      return query;
    }

    it("should return users with pagination data", async () => {
      const users = [user];
      const query = mockUserQuery(users);

      User.countDocuments.mockResolvedValue(25);

      const result = await getUsers(undefined, 2, 10);

      expect(User.find).toHaveBeenCalledWith({});
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.limit).toHaveBeenCalledWith(10);
      expect(User.countDocuments).toHaveBeenCalledWith({});

      expect(result).toEqual({
        users,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it("should filter active users", async () => {
      mockUserQuery([user]);

      await getUsers("active", 1, 10);

      const expectedFilter = {
        isDeleted: false,
        isBanned: false,
      };

      expect(User.find).toHaveBeenCalledWith(expectedFilter);
      expect(User.countDocuments).toHaveBeenCalledWith(
        expectedFilter,
      );
    });

    it("should filter banned users", async () => {
      mockUserQuery([user]);

      await getUsers("banned", 1, 10);

      const expectedFilter = { isBanned: true };

      expect(User.find).toHaveBeenCalledWith(expectedFilter);
      expect(User.countDocuments).toHaveBeenCalledWith(
        expectedFilter,
      );
    });

    it("should filter deleted users", async () => {
      mockUserQuery([user]);

      await getUsers("deleted", 1, 10);

      const expectedFilter = { isDeleted: true };

      expect(User.find).toHaveBeenCalledWith(expectedFilter);
      expect(User.countDocuments).toHaveBeenCalledWith(
        expectedFilter,
      );
    });

    it("should throw 400 for an invalid status", async () => {
      await expect(
        getUsers("unknown", 1, 10),
      ).rejects.toMatchObject({
        message: "Invalid user status",
        statusCode: 400,
      });

      expect(User.find).not.toHaveBeenCalled();
      expect(User.countDocuments).not.toHaveBeenCalled();
    });

    it("should propagate database errors", async () => {
      User.find.mockImplementation(() => {
        throw new Error("Database unavailable");
      });

      await expect(
        getUsers(undefined, 1, 10),
      ).rejects.toThrow("Database unavailable");
    });
  });
});