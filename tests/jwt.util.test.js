
import { describe, it, expect } from "vitest";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../src/utils/jwt.util.js";

describe("jwt.util", () => {
  const payload = {
    userId: "user-123",
    role: "patient",
  };

  describe("Access Token", () => {
    it("should generate a valid access token", () => {
      const token = generateAccessToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should verify a generated access token", () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it("should reject an invalid access token", () => {
      expect(() => verifyAccessToken("invalid-token")).toThrow();
    });
  });

  describe("Refresh Token", () => {
    it("should generate a valid refresh token", () => {
      const token = generateRefreshToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should verify a generated refresh token", () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });

    it("should reject an access token used as a refresh token", () => {
      const accessToken = generateAccessToken(payload);

      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});
