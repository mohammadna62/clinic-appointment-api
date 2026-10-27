import { describe, it, expect } from "vitest";
import { createPaginationData } from "../src/utils/pagination.util.js";

describe("pagination.util", () => {
  describe("createPaginationData", () => {
    it("should return pagination data", () => {
      const result = createPaginationData(2, 10, 45);

      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 45,
        totalPages: 5,
      });
    });

    it("should round up the total number of pages", () => {
      const result = createPaginationData(1, 10, 21);

      expect(result.totalPages).toBe(3);
    });

    it("should return zero total pages when there are no records", () => {
      const result = createPaginationData(1, 10, 0);

      expect(result.totalPages).toBe(0);
    });

    it("should return one page when total count equals the limit", () => {
      const result = createPaginationData(1, 10, 10);

      expect(result.totalPages).toBe(1);
    });

    it("should preserve the provided page and limit", () => {
      const result = createPaginationData(3, 20, 100);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
    });
  });
});