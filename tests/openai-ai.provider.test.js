
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class MockOpenAI {
    constructor() {
      this.responses = {
        create: createMock,
      };
    }
  },
}));

vi.mock("../src/config/env.js", () => ({
  default: {
    OPENAI_API_KEY: "test-api-key",
    OPENAI_MODEL: "test-model",
  },
}));

describe("OpenAIProvider", () => {
  let OpenAIProvider;

  beforeEach(async () => {
    vi.resetModules();
    createMock.mockReset();

    ({ default: OpenAIProvider } = await import(
      "../src/providers/ai/openai-ai.provider.js"
    ));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a general response when no tool is called", async () => {
    createMock.mockResolvedValue({
      output: [{ type: "message" }],
      output_text: "سلام، چطور می‌توانم کمک کنم؟",
    });

    const provider = new OpenAIProvider();

    const result = await provider.chat({
      message: "سلام",
    });

    expect(result).toEqual({
      type: "general",
      criteria: null,
      message: "سلام، چطور می‌توانم کمک کنم؟",
    });

    expect(createMock).toHaveBeenCalledOnce();
  });

  it("should execute the appointment search tool and return the final response", async () => {
    const criteria = {
      specialty: "قلب",
      doctor: null,
      clinic: null,
      date: { type: "tomorrow", weekday: null },
      timeRange: "morning",
    };

    createMock
      .mockResolvedValueOnce({
        output: [
          {
            type: "function_call",
            name: "search_available_appointments",
            arguments: JSON.stringify(criteria),
            call_id: "call-123",
          },
        ],
        output_text: "",
      })
      .mockResolvedValueOnce({
        output: [{ type: "message" }],
        output_text: "یک نوبت پیدا شد.",
      });

    const executeTool = vi.fn().mockResolvedValue({
      appointments: [{ id: "appointment-1" }],
    });

    const provider = new OpenAIProvider();

    const result = await provider.chat({
      message: "فردا صبح وقت متخصص قلب می‌خواهم",
      executeTool,
    });

    expect(executeTool).toHaveBeenCalledWith(
      "search_available_appointments",
      criteria,
    );

    expect(createMock).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      type: "appointment_search",
      criteria: null,
      message: "یک نوبت پیدا شد.",
    });
  });

  it("should throw an error when tool arguments are invalid JSON", async () => {
    createMock.mockResolvedValueOnce({
      output: [
        {
          type: "function_call",
          name: "search_available_appointments",
          arguments: "{invalid-json",
          call_id: "call-456",
        },
      ],
      output_text: "",
    });

    const provider = new OpenAIProvider();

    await expect(
      provider.chat({
        message: "فردا وقت می‌خواهم",
        executeTool: vi.fn(),
      }),
    ).rejects.toThrow("OpenAI returned invalid tool arguments");

    expect(createMock).toHaveBeenCalledOnce();
  });

  it("should throw an error for an unsupported tool", async () => {
    createMock.mockResolvedValueOnce({
      output: [
        {
          type: "function_call",
          name: "unsupported_tool",
          arguments: "{}",
          call_id: "call-789",
        },
      ],
      output_text: "",
    });

    const provider = new OpenAIProvider();

    await expect(
      provider.chat({
        message: "فردا وقت می‌خواهم",
        executeTool: vi.fn(),
      }),
    ).rejects.toThrow("Unsupported AI tool: unsupported_tool");
  });
});
