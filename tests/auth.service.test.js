import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("mongoose", () => ({
  default: {
    isValidObjectId: vi.fn(),
  },
}));

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../src/config/redis.js", () => ({
  redis: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    ttl: vi.fn(),
  },
}));

vi.mock("../src/utils/otp.util.js", () => ({
  generateOtp: vi.fn(),
}));

vi.mock("../src/services/sms.service.js", () => ({
  sendSms: vi.fn(),
}));

vi.mock("../src/utils/jwt.util.js", () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

vi.mock("../src/utils/hash.util.js", () => ({
  hashToken: vi.fn(),
  compareToken: vi.fn(),
}));

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import { redis } from "../src/config/redis.js";
import { generateOtp } from "../src/utils/otp.util.js";
import { sendSms } from "../src/services/sms.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../src/utils/jwt.util.js";
import {
  hashToken,
  compareToken,
} from "../src/utils/hash.util.js";

import {
  sendOtp,
  verifyOtp,
  refreshToken,
  completeProfile,
  logout,
} from "../src/services/auth.service.js";

describe("Auth Service", () => {
  const phone = "09123456789";
  const userId = "507f1f77bcf86cd799439011";
  const otp = "123456";
  const accessToken = "access-token";
  const refreshTokenValue = "refresh-token";

  let user;

  beforeEach(() => {
    vi.resetAllMocks();

    user = {
      _id: userId,
      phone,
      roles: ["patient"],
      isBanned: false,
      isDeleted: false,
      isVerified: true,
      firstName: "Mohammad",
      lastName: "Naghavi",
      nationalCode: "1234567890",
      deletedAt: null,
      save: vi.fn().mockResolvedValue(undefined),
    };

    mongoose.isValidObjectId.mockReturnValue(true);

    User.findOne.mockResolvedValue(null);
    User.findById.mockResolvedValue(user);
    User.findByIdAndUpdate.mockResolvedValue(user);
    User.countDocuments.mockResolvedValue(1);
    User.create.mockResolvedValue(user);

    redis.set.mockResolvedValue("OK");
    redis.get.mockResolvedValue("hashed-otp");
    redis.del.mockResolvedValue(1);
    redis.ttl.mockResolvedValue(30);

    bcrypt.hash.mockResolvedValue("hashed-otp");
    bcrypt.compare.mockResolvedValue(true);

    generateOtp.mockReturnValue(otp);
    sendSms.mockResolvedValue(undefined);

    generateAccessToken.mockReturnValue(accessToken);
    generateRefreshToken.mockReturnValue(refreshTokenValue);
    verifyRefreshToken.mockReturnValue({
      userId,
      roles: ["patient"],
    });

    hashToken.mockReturnValue("hashed-refresh-token");
    compareToken.mockReturnValue(true);
  });

  describe("sendOtp", () => {
    it("should generate, hash, store and send an OTP", async () => {
      await sendOtp(phone);

      expect(User.findOne).toHaveBeenCalledWith({ phone });
      expect(generateOtp).toHaveBeenCalledOnce();
      expect(bcrypt.hash).toHaveBeenCalledWith(otp, 12);

      expect(redis.set).toHaveBeenNthCalledWith(
        1,
        `auth:otp:cooldown:${phone}`,
        "1",
        "EX",
        expect.any(Number),
        "NX",
      );

      expect(redis.set).toHaveBeenNthCalledWith(
        2,
        `auth:otp:${phone}`,
        "hashed-otp",
        "EX",
        expect.any(Number),
      );

      expect(sendSms).toHaveBeenCalledWith(phone, otp);
    });

    it("should reject a banned user", async () => {
      User.findOne.mockResolvedValue({
        ...user,
        isBanned: true,
      });

      await expect(sendOtp(phone)).rejects.toMatchObject({
        message: "User is banned",
        statusCode: 403,
      });

      expect(redis.set).not.toHaveBeenCalled();
      expect(sendSms).not.toHaveBeenCalled();
    });

    it("should reject requests during the cooldown period", async () => {
      redis.set.mockResolvedValueOnce(null);

      await expect(sendOtp(phone)).rejects.toMatchObject({
        message: expect.stringContaining("30 seconds"),
        statusCode: 429,
      });

      expect(redis.ttl).toHaveBeenCalledWith(
        `auth:otp:cooldown:${phone}`,
      );
      expect(generateOtp).not.toHaveBeenCalled();
      expect(sendSms).not.toHaveBeenCalled();
    });
  });

  describe("verifyOtp", () => {
    it("should authenticate an existing user and store a hashed refresh token", async () => {
      User.findOne.mockResolvedValue(user);

      const result = await verifyOtp(phone, otp);

      expect(redis.get).toHaveBeenCalledWith(`auth:otp:${phone}`);
      expect(bcrypt.compare).toHaveBeenCalledWith(otp, "hashed-otp");
      expect(redis.del).toHaveBeenCalledWith(`auth:otp:${phone}`);

      expect(generateAccessToken).toHaveBeenCalledWith({
        userId,
        roles: user.roles,
      });

      expect(generateRefreshToken).toHaveBeenCalledWith({
        userId,
        roles: user.roles,
      });

      expect(hashToken).toHaveBeenCalledWith(refreshTokenValue);

      expect(redis.set).toHaveBeenCalledWith(
        `auth:refresh:${userId}`,
        "hashed-refresh-token",
        "EX",
        expect.any(Number),
      );

      expect(result).toEqual({
        user,
        accessToken,
        refreshToken: refreshTokenValue,
      });
    });

    it("should reject a banned user", async () => {
      User.findOne.mockResolvedValue({
        ...user,
        isBanned: true,
      });

      await expect(verifyOtp(phone, otp)).rejects.toMatchObject({
        message: "User is banned",
        statusCode: 403,
      });

      expect(redis.get).not.toHaveBeenCalled();
    });

    it("should reject an expired or missing OTP", async () => {
      redis.get.mockResolvedValue(null);

      await expect(verifyOtp(phone, otp)).rejects.toMatchObject({
        message: "OTP has expired or is invalid",
        statusCode: 400,
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should reject an incorrect OTP", async () => {
      bcrypt.compare.mockResolvedValue(false);

      await expect(verifyOtp(phone, otp)).rejects.toMatchObject({
        message: "Invalid OTP",
        statusCode: 400,
      });

      expect(redis.del).not.toHaveBeenCalled();
    });

    it("should create the first user as an admin", async () => {
      User.findOne.mockResolvedValue(null);
      User.countDocuments.mockResolvedValue(0);

      await verifyOtp(phone, otp);

      expect(User.create).toHaveBeenCalledWith({
        phone,
        roles: ["admin"],
        isVerified: true,
      });
    });

    it("should create subsequent users as patients", async () => {
      User.findOne.mockResolvedValue(null);
      User.countDocuments.mockResolvedValue(1);

      await verifyOtp(phone, otp);

      expect(User.create).toHaveBeenCalledWith({
        phone,
        roles: ["patient"],
        isVerified: true,
      });
    });

    it("should restore a deleted user after successful verification", async () => {
      user.isDeleted = true;
      user.deletedAt = new Date();

      User.findOne.mockResolvedValue(user);

      await verifyOtp(phone, otp);

      expect(user.isDeleted).toBe(false);
      expect(user.deletedAt).toBeNull();
      expect(user.isVerified).toBe(true);
      expect(user.save).toHaveBeenCalledOnce();
    });
  });

  describe("refreshToken", () => {
    it("should issue new tokens for a valid refresh token", async () => {
      redis.get.mockResolvedValue("stored-hash");

      const result = await refreshToken(refreshTokenValue);

      expect(verifyRefreshToken).toHaveBeenCalledWith(
        refreshTokenValue,
      );
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(compareToken).toHaveBeenCalledWith(
        refreshTokenValue,
        "stored-hash",
      );

      expect(generateAccessToken).toHaveBeenCalledWith({
        userId,
        roles: user.roles,
      });

      expect(generateRefreshToken).toHaveBeenCalledWith({
        userId,
        roles: user.roles,
      });

      expect(result).toEqual({
        accessToken,
        refreshToken: refreshTokenValue,
      });
    });

    it("should reject if the user does not exist", async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        refreshToken(refreshTokenValue),
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 401,
      });
    });

    it("should reject a banned user", async () => {
      user.isBanned = true;

      await expect(
        refreshToken(refreshTokenValue),
      ).rejects.toMatchObject({
        message: "User is banned",
        statusCode: 403,
      });

      expect(redis.get).not.toHaveBeenCalled();
    });

    it("should reject a deleted user", async () => {
      user.isDeleted = true;

      await expect(
        refreshToken(refreshTokenValue),
      ).rejects.toMatchObject({
        message: "User account has been deleted",
        statusCode: 403,
      });
    });

    it("should reject an expired refresh token", async () => {
      redis.get.mockResolvedValue(null);

      await expect(
        refreshToken(refreshTokenValue),
      ).rejects.toMatchObject({
        message: "Refresh token expired",
        statusCode: 401,
      });
    });

    it("should reject an invalid refresh token", async () => {
      compareToken.mockReturnValue(false);

      await expect(
        refreshToken(refreshTokenValue),
      ).rejects.toMatchObject({
        message: "Invalid refresh token",
        statusCode: 401,
      });
    });
  });

  describe("completeProfile", () => {
    const profile = {
      firstName: "Mohammad",
      lastName: "Naghavi",
      nationalCode: "1234567890",
    };

    it("should update the user's profile", async () => {
      const result = await completeProfile(userId, profile);

      expect(User.findOne).toHaveBeenCalledWith({
        nationalCode: profile.nationalCode,
        _id: { $ne: userId },
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        profile,
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toBe(user);
    });

    it("should reject an invalid user ID", async () => {
      mongoose.isValidObjectId.mockReturnValue(false);

      await expect(
        completeProfile("invalid-id", profile),
      ).rejects.toMatchObject({
        message: "Invalid user ID",
        statusCode: 400,
      });

      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("should reject a national code already used by another user", async () => {
      User.findOne.mockResolvedValue({ _id: "another-user" });

      await expect(
        completeProfile(userId, profile),
      ).rejects.toMatchObject({
        message: "National code is already in use",
        statusCode: 409,
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw 404 if the user does not exist", async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        completeProfile(userId, profile),
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
    });
  });

  describe("logout", () => {
    it("should delete the user's refresh token", async () => {
      await logout(userId);

      expect(redis.del).toHaveBeenCalledWith(
        `auth:refresh:${userId}`,
      );
    });

    it("should reject an invalid user ID", async () => {
      mongoose.isValidObjectId.mockReturnValue(false);

      await expect(logout("invalid-id")).rejects.toMatchObject({
        message: "Invalid user ID",
        statusCode: 400,
      });

      expect(redis.del).not.toHaveBeenCalled();
    });
  });
});