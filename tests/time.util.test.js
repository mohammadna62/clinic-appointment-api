import { describe, it, expect } from "vitest";
import { timeToMinutes } from "../src/utils/time.util.js";

describe("time.util", () => {
  describe("timeToMinutes", () => {
    it.each([
      ["00:00", 0],
      ["08:00", 480],
      ["09:30", 570],
      ["12:45", 765],
      ["23:59", 1439],
    ])("should convert %s to %i minutes", (time, expected) => {
      expect(timeToMinutes(time)).toBe(expected);
    });
  });
});