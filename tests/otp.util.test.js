
import { describe, it, expect } from "vitest";
import { generateOtp } from "../src/utils/otp.util.js";

describe("otp.util", () => {
  describe("generateOtp", () => {
    it("should generate a six-digit OTP by default", () => {
      const result = generateOtp();

      expect(result).toMatch(/^\d{6}$/);
    });

    it("should return a string", () => {
      expect(typeof generateOtp()).toBe("string");
    });

    it("should generate an OTP with the requested length", () => {
      expect(generateOtp(4)).toMatch(/^\d{4}$/);
    });

    it("should generate an OTP within the current implementation's range", () => {
      const result = Number(generateOtp());

      expect(result).toBeGreaterThanOrEqual(100000);
      expect(result).toBeLessThan(999999);
    });
  });
});
