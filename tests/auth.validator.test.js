
import { describe, it, expect } from "vitest";

import {
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  completeProfileSchema,
  updateProfileSchema,
} from "../src/validators/auth.validator.js";

describe("Auth Validators", () => {
  describe("sendOtpSchema", () => {
    it("should accept a valid Iranian phone number", () => {
      const result = sendOtpSchema.safeParse({
        phone: "09123456789",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid phone number", () => {
      const result = sendOtpSchema.safeParse({
        phone: "12345",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("verifyOtpSchema", () => {
    it("should accept a valid phone number and six-digit OTP", () => {
      const result = verifyOtpSchema.safeParse({
        phone: "09123456789",
        otp: "123456",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an OTP with fewer than six digits", () => {
      const result = verifyOtpSchema.safeParse({
        phone: "09123456789",
        otp: "12345",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("refreshTokenSchema", () => {
    it("should accept a non-empty refresh token", () => {
      const result = refreshTokenSchema.safeParse({
        refreshToken: "valid-refresh-token",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an empty refresh token", () => {
      const result = refreshTokenSchema.safeParse({
        refreshToken: "",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("completeProfileSchema", () => {
    it("should accept a valid profile", () => {
      const result = completeProfileSchema.safeParse({
        firstName: "Ali",
        lastName: "Ahmadi",
        nationalCode: "1234567890",
      });

      expect(result.success).toBe(true);
    });

    it("should reject a national code that is not ten digits", () => {
      const result = completeProfileSchema.safeParse({
        firstName: "Ali",
        lastName: "Ahmadi",
        nationalCode: "12345",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = completeProfileSchema.safeParse({
        firstName: "Ali",
        lastName: "Ahmadi",
        nationalCode: "1234567890",
        role: "admin",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileSchema", () => {
    it("should accept updating only the first name", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "Ali",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an empty update object", () => {
      const result = updateProfileSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = updateProfileSchema.safeParse({
        firstName: "Ali",
        role: "admin",
      });

      expect(result.success).toBe(false);
    });
  });
});
