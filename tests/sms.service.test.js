
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { mockEnv, mockPost } = vi.hoisted(() => ({
  mockEnv: {
    NODE_ENV: "test",
    OTP_DELIVERY_MODE: "console",
    SMS_USERNAME: "test-username",
    SMS_PASSWORD: "test-password",
    SMS_SENDER_NUMBER: "test-sender",
    SMS_VERIFY_PATTERN_CODE: "test-pattern",
  },
  mockPost: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    post: mockPost,
  },
}));

vi.mock("../src/config/env.js", () => ({
  default: mockEnv,
}));

import { sendSms } from "../src/services/sms.service.js";

describe("SMS Service", () => {
  beforeEach(() => {
    mockEnv.NODE_ENV = "test";
    mockEnv.OTP_DELIVERY_MODE = "console";

    mockPost.mockReset();

    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Console delivery mode", () => {
    it("should log the phone number and OTP", async () => {
      await sendSms("09123456789", "123456");

      expect(console.log).toHaveBeenCalledWith(
        "[SMS] OTP for 09123456789: 123456",
      );
    });

    it("should log the provided phone number and OTP", async () => {
      await sendSms("09987654321", "654321");

      expect(console.log).toHaveBeenCalledWith(
        "[SMS] OTP for 09987654321: 654321",
      );
    });

    it("should return undefined", async () => {
      const result = await sendSms("09123456789", "123456");

      expect(result).toBeUndefined();
    });

    it("should reject console delivery in production", async () => {
      mockEnv.NODE_ENV = "production";

      await expect(
        sendSms("09123456789", "123456"),
      ).rejects.toThrow(
        "Console SMS delivery is allowed only in development and test environments",
      );

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("Provider delivery mode", () => {
    beforeEach(() => {
      mockEnv.OTP_DELIVERY_MODE = "provider";
    });

    it("should send the OTP using the provider API", async () => {
      mockPost.mockResolvedValue({
        data: [0, "SMS sent successfully"],
      });

      const result = await sendSms("09123456789", "123456");

      expect(mockPost).toHaveBeenCalledWith(
        "http://ippanel.com/api/select",
        {
          op: "pattern",
          user: "test-username",
          pass: "test-password",
          fromNum: "test-sender",
          toNum: "09123456789",
          patternCode: "test-pattern",
          inputData: [
            {
              "verification-code": "123456",
            },
          ],
        },
        {
          timeout: 10000,
        },
      );

      expect(result).toBe("OTP sent successfully");
      expect(console.log).not.toHaveBeenCalled();
    });

    it("should accept a numeric zero response", async () => {
      mockPost.mockResolvedValue({
        data: 0,
      });

      await expect(
        sendSms("09123456789", "123456"),
      ).resolves.toBe("OTP sent successfully");
    });

    it("should accept a string zero response", async () => {
      mockPost.mockResolvedValue({
        data: "0",
      });

      await expect(
        sendSms("09123456789", "123456"),
      ).resolves.toBe("OTP sent successfully");
    });

    it("should reject an unsuccessful provider response", async () => {
      mockPost.mockResolvedValue({
        data: [1, "Invalid pattern code"],
      });

      await expect(
        sendSms("09123456789", "123456"),
      ).rejects.toThrow(
        "SMS Provider rejected the OTP request",
      );

      expect(console.log).not.toHaveBeenCalled();
    });

    it("should propagate network errors", async () => {
      const networkError = new Error("Network connection failed");

      mockPost.mockRejectedValue(networkError);

      await expect(
        sendSms("09123456789", "123456"),
      ).rejects.toThrow("Network connection failed");
    });
  });
});
