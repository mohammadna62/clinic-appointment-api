
import { describe, it, expect, vi, beforeEach } from "vitest";

import errorHandler from "../src/middlewares/error-handler.js";
import { errorResponse } from "../src/helpers/response.js";

vi.mock("../src/helpers/response.js", () => ({
  errorResponse: vi.fn(),
}));

describe("errorHandler middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {};
    res = {};
    next = vi.fn();
  });

  it("should return the error response with the provided status code and message", () => {
    const error = {
      statusCode: 400,
      message: "Validation failed",
    };

    errorHandler(error, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, {
      statusCode: 400,
      message: "Validation failed",
      errors: null,
    });
  });

  it("should use status code 500 when statusCode is missing", () => {
    const error = {
      message: "Something went wrong",
    };

    errorHandler(error, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, {
      statusCode: 500,
      message: "Something went wrong",
      errors: null,
    });
  });

  it("should use the default message when message is missing", () => {
    const error = {
      statusCode: 500,
    };

    errorHandler(error, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, {
      statusCode: 500,
      message: "Internal server error",
      errors: null,
    });
  });

  it("should use default values when statusCode and message are missing", () => {
    errorHandler({}, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, {
      statusCode: 500,
      message: "Internal server error",
      errors: null,
    });
  });

  it("should pass the errors property when it exists", () => {
    const validationErrors = [
      { field: "email", message: "Invalid email" },
    ];

    const error = {
      statusCode: 400,
      message: "Validation failed",
      errors: validationErrors,
    };

    errorHandler(error, req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(res, {
      statusCode: 400,
      message: "Validation failed",
      errors: validationErrors,
    });
  });

  it("should use null when errors is missing", () => {
    errorHandler(
      { statusCode: 404, message: "Not found" },
      req,
      res,
      next,
    );

    expect(errorResponse).toHaveBeenCalledWith(res, {
      statusCode: 404,
      message: "Not found",
      errors: null,
    });
  });

  it("should return the result of errorResponse", () => {
    const responseResult = { success: false };

    errorResponse.mockReturnValue(responseResult);

    const result = errorHandler(
      { statusCode: 500, message: "Internal error" },
      req,
      res,
      next,
    );

    expect(result).toBe(responseResult);
  });

  it("should not call next()", () => {
    errorHandler(
      { statusCode: 500, message: "Internal error" },
      req,
      res,
      next,
    );

    expect(next).not.toHaveBeenCalled();
  });
});
