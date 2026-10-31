import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendOtp: vi.fn(),
  verifyOtpService: vi.fn(),
  refreshTokenService: vi.fn(),
  completeProfileService: vi.fn(),
  logoutService: vi.fn(),
  findById: vi.fn(),
  isProfileCompleted: vi.fn(),
}));

vi.mock("../src/services/auth.service.js", () => ({
  sendOtp: mocks.sendOtp,
  verifyOtp: mocks.verifyOtpService,
  refreshToken: mocks.refreshTokenService,
  completeProfile: mocks.completeProfileService,
  logout: mocks.logoutService,
}));

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findById: mocks.findById,
  },
}));

vi.mock("../src/services/user.service.js", () => ({
  isProfileCompleted: mocks.isProfileCompleted,
}));

import {
  sentOtp,
  verifyOtp,
  getMe,
  refreshToken,
  completeProfile,
  logout,
} from "../src/controllers/auth.controller.js";

describe("Auth Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        body: {},
      },
      user: {
        userId: "user-id",
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  describe("sentOtp", () => {
    it("should send OTP successfully", async () => {
      req.validated.body = {
        phone: "09123456789",
      };

      await sentOtp(req, res, next);

      expect(mocks.sendOtp).toHaveBeenCalledWith("09123456789");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: "OTP sent successfully",
        data: null,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("OTP sending failed");

      mocks.sendOtp.mockRejectedValueOnce(error);

      req.validated.body = {
        phone: "09123456789",
      };

      await sentOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("verifyOtp", () => {
    it("should verify OTP and return user with tokens", async () => {
      const user = {
        _id: "user-id",
        firstName: "Mohammad",
        lastName: "Naghavi",
        nationalCode: "1234567890",
      };

      mocks.verifyOtpService.mockResolvedValueOnce({
        user,
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      mocks.isProfileCompleted.mockReturnValueOnce(true);

      req.validated.body = {
        phone: "09123456789",
        otp: "123456",
      };

      await verifyOtp(req, res, next);

      expect(mocks.verifyOtpService).toHaveBeenCalledWith(
        "09123456789",
        "123456",
      );

      expect(mocks.isProfileCompleted).toHaveBeenCalledWith(user);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        status: 201,
        success: true,
        message: "OTP verified successfully",
        data: {
          user,
          accessToken: "access-token",
          refreshToken: "refresh-token",
          profileCompleted: true,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Invalid OTP");

      mocks.verifyOtpService.mockRejectedValueOnce(error);

      req.validated.body = {
        phone: "09123456789",
        otp: "123456",
      };

      await verifyOtp(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMe", () => {
    it("should return the current user's profile", async () => {
      const user = {
        _id: "user-id",
        firstName: "Mohammad",
        lastName: "Naghavi",
        nationalCode: "1234567890",
      };

      mocks.findById.mockResolvedValueOnce(user);
      mocks.isProfileCompleted.mockReturnValueOnce(true);

      await getMe(req, res, next);

      expect(mocks.findById).toHaveBeenCalledWith("user-id");

      expect(mocks.isProfileCompleted).toHaveBeenCalledWith(user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: "User profile fetch successfully",
        data: {
          user,
          profileCompleted: true,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass a 404 error when user does not exist", async () => {
      mocks.findById.mockResolvedValueOnce(null);

      await getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        }),
      );
    });

    it("should pass database errors to next", async () => {
      const error = new Error("Database error");

      mocks.findById.mockRejectedValueOnce(error);

      await getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("refreshToken", () => {
    it("should refresh tokens successfully", async () => {
      const tokens = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      mocks.refreshTokenService.mockResolvedValueOnce(tokens);

      req.validated.body = {
        refreshToken: "old-refresh-token",
      };

      await refreshToken(req, res, next);

      expect(mocks.refreshTokenService).toHaveBeenCalledWith(
        "old-refresh-token",
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: "Token refreshed successfully",
        data: tokens,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Invalid refresh token");

      mocks.refreshTokenService.mockRejectedValueOnce(error);

      req.validated.body = {
        refreshToken: "old-refresh-token",
      };

      await refreshToken(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("completeProfile", () => {
    it("should complete the user's profile successfully", async () => {
      const profileData = {
        firstName: "Mohammad",
        lastName: "Naghavi",
        nationalCode: "1234567890",
      };

      const user = {
        _id: "user-id",
        ...profileData,
      };

      mocks.completeProfileService.mockResolvedValueOnce(user);
      mocks.isProfileCompleted.mockReturnValueOnce(true);

      req.validated.body = profileData;

      await completeProfile(req, res, next);

      expect(mocks.completeProfileService).toHaveBeenCalledWith(
        "user-id",
        profileData,
      );

      expect(mocks.isProfileCompleted).toHaveBeenCalledWith(user);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: "Profile completed successfully",
        data: {
          user,
          profileCompleted: true,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Profile completion failed");

      mocks.completeProfileService.mockRejectedValueOnce(error);

      req.validated.body = {
        firstName: "Mohammad",
        lastName: "Naghavi",
        nationalCode: "1234567890",
      };

      await completeProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("logout", () => {
    it("should log out the user successfully", async () => {
      mocks.logoutService.mockResolvedValueOnce(undefined);

      await logout(req, res, next);

      expect(mocks.logoutService).toHaveBeenCalledWith("user-id");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: "Logged out successfully",
        data: null,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Logout failed");

      mocks.logoutService.mockRejectedValueOnce(error);

      await logout(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});