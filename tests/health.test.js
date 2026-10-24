
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /api/v1/health", () => {
  it("should return 200 and the API health message", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Clinic Appointment API is running",
    });
  });
});
