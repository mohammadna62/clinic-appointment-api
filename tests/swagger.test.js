
import { describe, it, expect, vi } from "vitest";

const { swaggerJSDocMock } = vi.hoisted(() => ({
  swaggerJSDocMock: vi.fn((options) => options.definition),
}));

vi.mock("swagger-jsdoc", () => ({
  default: swaggerJSDocMock,
}));

vi.mock("../src/config/env.js", () => ({
  default: {
    PORT: 3000,
  },
}));

describe("Swagger configuration", () => {
  it("should create the OpenAPI specification", async () => {
    const { default: swaggerSpec } = await import(
      "../src/config/swagger.js"
    );

    expect(swaggerJSDocMock).toHaveBeenCalledOnce();

    expect(swaggerSpec.openapi).toBe("3.0.3");
    expect(swaggerSpec.info).toMatchObject({
      title: "Clinic Appointment Management API",
      version: "1.0.0",
    });
  });

  it("should configure the local API server URL", async () => {
    const { default: swaggerSpec } = await import(
      "../src/config/swagger.js"
    );

    expect(swaggerSpec.servers).toContainEqual({
      url: "http://localhost:3000/api/v1",
      description: "Local development server",
    });
  });

  it("should configure JWT bearer authentication", async () => {
    const { default: swaggerSpec } = await import(
      "../src/config/swagger.js"
    );

    expect(
      swaggerSpec.components.securitySchemes.bearerAuth,
    ).toEqual({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });
  });

  it("should define the API response schemas", async () => {
    const { default: swaggerSpec } = await import(
      "../src/config/swagger.js"
    );

    expect(
      swaggerSpec.components.schemas.ApiResponse,
    ).toBeDefined();

    expect(
      swaggerSpec.components.schemas.ErrorResponse,
    ).toBeDefined();

    expect(
      swaggerSpec.components.schemas.ValidationErrorResponse,
    ).toBeDefined();

    expect(
      swaggerSpec.components.schemas.Pagination,
    ).toBeDefined();
  });
});
