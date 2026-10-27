
import { describe, it, expect } from "vitest";
import { hashToken, compareToken } from "../src/utils/hash.util.js";

describe("hash.util", () => {
  describe("hashToken", () => {
    it("should return a hexadecimal SHA-256 HMAC hash", () => {
      const result = hashToken("test-token");

      expect(result).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should return the same hash for the same token", () => {
      const firstHash = hashToken("test-token");
      const secondHash = hashToken("test-token");

      expect(firstHash).toBe(secondHash);
    });

    it("should return different hashes for different tokens", () => {
      const firstHash = hashToken("token-one");
      const secondHash = hashToken("token-two");

      expect(firstHash).not.toBe(secondHash);
    });
  });

  describe("compareToken", () => {
    it("should return true when the token matches its stored hash", () => {
      const token = "test-token";
      const storedHash = hashToken(token);

      expect(compareToken(token, storedHash)).toBe(true);
    });

    it("should return false when the token does not match the stored hash", () => {
      const storedHash = hashToken("correct-token");

      expect(compareToken("wrong-token", storedHash)).toBe(false);
    });
  });
});
