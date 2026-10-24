
import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

import validate from "../src/middlewares/validate.middleware.js";
import AppError from "../src/errors/app-error.js";

describe("validate middleware", () => {
  const schema = z.object({
    name: z.string(),
  });

  const createMocks = (requestData = {}) => {
    const req = {
      body: requestData,
    };

    const res = {};

    const next = vi.fn();

    return { req, res, next };
  };

  it("should pass valid data to next()", () => {
    const { req, res, next } = createMocks({ name: "Mohammad" });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("should store validated data in req.validated.body", () => {
    const { req, res, next } = createMocks({ name: "Mohammad" });

    validate(schema)(req, res, next);

    expect(req.validated).toEqual({
      body: { name: "Mohammad" },
    });
  });

  it("should use the selected request source", () => {
    const { req, res, next } = createMocks();
    req.query = { name: "Mohammad" };

    validate(schema, "query")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.validated.query).toEqual({ name: "Mohammad" });
  });

  it("should preserve previously validated request data", () => {
    const { req, res, next } = createMocks({ name: "Mohammad" });
    req.validated = {
      params: { id: "123" },
    };

    validate(schema)(req, res, next);

    expect(req.validated).toEqual({
      params: { id: "123" },
      body: { name: "Mohammad" },
    });
  });

  it("should pass a 400 AppError to next() for invalid data", () => {
    const { req, res, next } = createMocks({ name: 123 });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
  });

  it("should combine Zod validation messages", () => {
    const multiFieldSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { req, res, next } = createMocks({
      name: 123,
      email: "invalid",
    });

    validate(multiFieldSchema)(req, res, next);

    const error = next.mock.calls[0][0];

    expect(error.message).toContain("Invalid input");
    expect(error.message).toContain("Invalid email address");
  });

  it("should pass non-Zod errors to next()", () => {
    const unexpectedError = new Error("Unexpected failure");

    const throwingSchema = {
      parse: () => {
        throw unexpectedError;
      },
    };

    const { req, res, next } = createMocks({ name: "Mohammad" });

    validate(throwingSchema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(unexpectedError);
  });

  it("should not call next() without an error when validation fails", () => {
    const { req, res, next } = createMocks({ name: 123 });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });
});
