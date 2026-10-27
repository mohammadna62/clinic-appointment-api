
import { describe, it, expect, vi, afterEach } from "vitest";
import { successResponse, errorResponse } from "../src/helpers/response.js";

describe("response helper", () => {
  const createMockResponse = () => {
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successResponse", () => {
    it("should return a successful response with the provided data", () => {
      const res = createMockResponse();

      successResponse(res, {
        statusCode: 201,
        message: "Created",
        data: { id: "123" },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 201,
        success: true,
        message: "Created",
        data: { id: "123" },
      });
    });

    it("should use default values when options are omitted", () => {
      const res = createMockResponse();

      successResponse(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        message: "Request Completed successfully",
        data: null,
      });
    });

    it("should return the response object", () => {
      const res = createMockResponse();

      expect(successResponse(res)).toBe(res);
    });
  });

  describe("errorResponse", () => {
    it("should return an error response with the provided details", () => {
      const res = createMockResponse();
      vi.spyOn(console, "log").mockImplementation(() => {});

      errorResponse(res, {
        statusCode: 400,
        message: "Validation failed",
        errors: [{ field: "email" }],
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 400,
        success: false,
        message: "Validation failed",
        errors: [{ field: "email" }],
      });
    });

    it("should use default values when options are omitted", () => {
      const res = createMockResponse();
      vi.spyOn(console, "log").mockImplementation(() => {});

      errorResponse(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 500,
        success: false,
        message: "Internal server error",
        errors: null,
      });
    });

    it("should return the response object", () => {
      const res = createMockResponse();
      vi.spyOn(console, "log").mockImplementation(() => {});

      expect(errorResponse(res)).toBe(res);
    });
  });
});
