
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { sendSms } from "../src/services/sms.service.js";

describe("SMS Service", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
});
