
import { describe, it, expect, vi, afterEach } from "vitest";
import { getStatisticsDateRange } from "../src/utils/statistics.util.js";

describe("statistics.util", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getStatisticsDateRange", () => {
    it.each([
      ["day", 1],
      ["week", 7],
      ["month", 30],
      ["3months", 90],
      ["6months", 180],
      ["year", 365],
      ["5years", 1825],
    ])("should return a valid date range for %s", (period) => {
      const { startDate, endDate } = getStatisticsDateRange(period);

      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
      expect(startDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
    });

    it("should use the current date as the end date", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));

      const { endDate } = getStatisticsDateRange("week");

      expect(endDate.toISOString()).toBe("2026-10-27T12:00:00.000Z");
    });

    it("should default to one month when the period is omitted", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));

      const { startDate, endDate } = getStatisticsDateRange();

      const expectedStartDate = new Date(endDate);
      expectedStartDate.setMonth(expectedStartDate.getMonth() - 1);

      expect(startDate.getTime()).toBe(expectedStartDate.getTime());
    });

    it("should default to one month for an unsupported period", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-27T12:00:00.000Z"));

      const { startDate, endDate } = getStatisticsDateRange("invalid");

      const expectedStartDate = new Date(endDate);
      expectedStartDate.setMonth(expectedStartDate.getMonth() - 1);

      expect(startDate.getTime()).toBe(expectedStartDate.getTime());
    });
  });
});
