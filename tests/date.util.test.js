
import { describe, it, expect } from "vitest";
import {
  getTodayLocalDate,
  addDays,
  getProjectDayOfWeek,
  getCurrentProjectTimeInMinutes,
} from "../src/utils/date.util.js";

describe("date.util", () => {
  describe("getTodayLocalDate", () => {
    it("should return today's date in the project time zone at UTC midnight", () => {
      const result = getTodayLocalDate();

      const expectedDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(`${expectedDate}T00:00:00.000Z`);
    });
  });

  describe("addDays", () => {
    it("should add days to a date", () => {
      const date = new Date("2026-10-20T00:00:00.000Z");

      const result = addDays(date, 3);

      expect(result.toISOString()).toBe("2026-10-23T00:00:00.000Z");
    });

    it("should handle month boundaries", () => {
      const date = new Date("2026-10-31T00:00:00.000Z");

      const result = addDays(date, 1);

      expect(result.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    });

    it("should handle negative days", () => {
      const date = new Date("2026-01-02T00:00:00.000Z");

      const result = addDays(date, -2);

      expect(result.toISOString()).toBe("2025-12-31T00:00:00.000Z");
    });

    it("should not mutate the original date", () => {
      const date = new Date("2026-10-20T00:00:00.000Z");
      const originalValue = date.getTime();

      addDays(date, 5);

      expect(date.getTime()).toBe(originalValue);
    });
  });

describe("getProjectDayOfWeek", () => {
  it.each([
    ["Sunday", "2026-10-25T00:00:00.000Z", 1],
    ["Monday", "2026-10-26T00:00:00.000Z", 2],
    ["Tuesday", "2026-10-27T00:00:00.000Z", 3],
    ["Wednesday", "2026-10-28T00:00:00.000Z", 4],
    ["Thursday", "2026-10-29T00:00:00.000Z", 5],
    ["Friday", "2026-10-30T00:00:00.000Z", 6],
    ["Saturday", "2026-10-31T00:00:00.000Z", 0],
  ])("should map %s to the project weekday number", (_, date, expected) => {
    expect(getProjectDayOfWeek(new Date(date))).toBe(expected);
  });
});

  describe("getCurrentProjectTimeInMinutes", () => {
    it("should return an integer between 0 and 1439", () => {
      const result = getCurrentProjectTimeInMinutes();

      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1439);
    });
  });
});
