
import { describe, it, expect } from "vitest";
import { assistantChatSchema } from "../src/validators/assistant.validator.js";

describe("assistantChatSchema", () => {
  it("should accept a valid message", () => {
    const result = assistantChatSchema.safeParse({
      message: "I need help booking an appointment.",
    });

    expect(result.success).toBe(true);
  });

  it("should reject a missing message", () => {
    const result = assistantChatSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("should reject an empty message", () => {
    const result = assistantChatSchema.safeParse({
      message: "",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a message containing only whitespace", () => {
    const result = assistantChatSchema.safeParse({
      message: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("should trim whitespace around the message", () => {
    const result = assistantChatSchema.safeParse({
      message: "  Hello assistant  ",
    });

    expect(result.success).toBe(true);
    expect(result.data.message).toBe("Hello assistant");
  });

  it("should accept a message with exactly 1000 characters", () => {
    const result = assistantChatSchema.safeParse({
      message: "a".repeat(1000),
    });

    expect(result.success).toBe(true);
  });

  it("should reject a message with more than 1000 characters", () => {
    const result = assistantChatSchema.safeParse({
      message: "a".repeat(1001),
    });

    expect(result.success).toBe(false);
  });

  it("should reject a non-string message", () => {
    const result = assistantChatSchema.safeParse({
      message: 123,
    });

    expect(result.success).toBe(false);
  });

  it("should reject null as the message", () => {
    const result = assistantChatSchema.safeParse({
      message: null,
    });

    expect(result.success).toBe(false);
  });

  it("should reject additional fields", () => {
    const result = assistantChatSchema.safeParse({
      message: "Hello",
      role: "admin",
    });

    expect(result.success).toBe(false);
  });
});
