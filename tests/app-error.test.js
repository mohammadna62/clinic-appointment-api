
import { describe, it, expect, vi, afterEach } from "vitest";
import AppError from "../src/errors/app-error.js";

describe("AppError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create an error with the provided message and status code", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const error = new AppError("Not found", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("AppError");
  });

  it("should use default values for statusCode and errors", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const error = new AppError("Internal server error");

    expect(error.statusCode).toBe(500);
    expect(error.errors).toBeNull();
  });

  it("should store the provided errors", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const errors = [{ field: "email", message: "Invalid email" }];
    const error = new AppError("Validation failed", 400, errors);

    expect(error.errors).toBe(errors);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Validation failed");
  });

  it("should mark the error as operational", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const error = new AppError("Forbidden", 403);

    expect(error.isOperational).toBe(true);
  });
});
