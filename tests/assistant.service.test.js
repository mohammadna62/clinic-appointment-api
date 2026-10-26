import { beforeEach, describe, expect, it, vi } from "vitest";

const { chatMock, findAvailableAppointmentsMock } = vi.hoisted(() => ({
  chatMock: vi.fn(),
  findAvailableAppointmentsMock: vi.fn(),
}));

vi.mock("../src/providers/ai/ai-provider.js", () => ({
  default: {
    chat: chatMock,
  },
}));

vi.mock("../src/services/assistant-tools.service.js", () => ({
  findAvailableAppointments: findAvailableAppointmentsMock,
}));

import { chatWithAssistant } from "../src/services/assistant.service.js";

describe("assistant.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    chatMock.mockResolvedValue({
      message: "سلام! چطور می‌توانم کمک کنم؟",
      type: "general",
    });

    findAvailableAppointmentsMock.mockResolvedValue([]);
  });

  describe("chatWithAssistant", () => {
    it("should send the message and an empty history for a new conversation", async () => {
      const userId = "new-conversation-user";
      const message = "سلام";

      const result = await chatWithAssistant(userId, message);

      expect(chatMock).toHaveBeenCalledTimes(1);

      expect(chatMock).toHaveBeenCalledWith({
        message,
        history: [],
        executeTool: expect.any(Function),
      });

      expect(result).toEqual({
        message: "سلام! چطور می‌توانم کمک کنم؟",
        type: "general",
        criteria: null,
      });
    });

    it("should pass the previous conversation history to the provider", async () => {
      const userId = "previous-history-user";

      await chatWithAssistant(userId, "پیام اول");

      await chatWithAssistant(userId, "پیام دوم");

      const secondCallPayload = chatMock.mock.calls[1][0];

      expect(secondCallPayload.history).toEqual([
        {
          role: "user",
          content: "پیام اول",
        },
        {
          role: "assistant",
          content: "سلام! چطور می‌توانم کمک کنم؟",
        },
      ]);
    });

    it("should keep conversations separate for different users", async () => {
      const firstUserId = "first-user";
      const secondUserId = "second-user";

      await chatWithAssistant(firstUserId, "پیام کاربر اول");

      await chatWithAssistant(secondUserId, "پیام کاربر دوم");

      const secondCallPayload = chatMock.mock.calls[1][0];

      expect(secondCallPayload.history).toEqual([]);
      expect(secondCallPayload.message).toBe("پیام کاربر دوم");
    });

    it("should normalize user IDs using toString", async () => {
      const userId = 12345;

      await chatWithAssistant(userId, "پیام اول");

      await chatWithAssistant("12345", "پیام دوم");

      const secondCallPayload = chatMock.mock.calls[1][0];

      expect(secondCallPayload.history).toEqual([
        {
          role: "user",
          content: "پیام اول",
        },
        {
          role: "assistant",
          content: "سلام! چطور می‌توانم کمک کنم؟",
        },
      ]);
    });

    it("should limit conversation history to the latest 10 messages", async () => {
      const userId = "history-limit-user";

      for (let i = 1; i <= 6; i++) {
        await chatWithAssistant(userId, `پیام ${i}`);
      }

      expect(chatMock).toHaveBeenCalledTimes(6);

      await chatWithAssistant(userId, "پیام هفتم");

      const payload = chatMock.mock.calls[6][0];

      expect(payload.history).toHaveLength(10);

      expect(payload.history[0]).toEqual({
        role: "user",
        content: "پیام 2",
      });

      expect(payload.history[9]).toEqual({
        role: "assistant",
        content: "سلام! چطور می‌توانم کمک کنم؟",
      });
    });

    it("should return the provider message, type and criteria", async () => {
      chatMock.mockResolvedValue({
        message: "نوبت‌های آزاد پیدا شدند.",
        type: "appointment_search",
        criteria: {
          specialty: "قلب",
        },
      });

      const result = await chatWithAssistant(
        "criteria-user",
        "نوبت قلب می‌خواهم",
      );

      expect(result).toEqual({
        message: "نوبت‌های آزاد پیدا شدند.",
        type: "appointment_search",
        criteria: {
          specialty: "قلب",
        },
      });
    });

    it("should return null when provider criteria is undefined", async () => {
      chatMock.mockResolvedValue({
        message: "پاسخ عمومی",
        type: "general",
      });

      const result = await chatWithAssistant(
        "undefined-criteria-user",
        "سلام",
      );

      expect(result.criteria).toBeNull();
    });

    it("should propagate provider errors", async () => {
      const error = new Error("AI provider failed");

      chatMock.mockRejectedValue(error);

      await expect(
        chatWithAssistant("provider-error-user", "سلام"),
      ).rejects.toThrow("AI provider failed");
    });

    it("should pass the current message separately from history", async () => {
      const userId = "current-message-user";

      await chatWithAssistant(userId, "پیام قبلی");

      await chatWithAssistant(userId, "پیام فعلی");

      const secondCallPayload = chatMock.mock.calls[1][0];

      expect(secondCallPayload.message).toBe("پیام فعلی");

      expect(secondCallPayload.history).toEqual([
        {
          role: "user",
          content: "پیام قبلی",
        },
        {
          role: "assistant",
          content: "سلام! چطور می‌توانم کمک کنم؟",
        },
      ]);

      expect(secondCallPayload.history).not.toContainEqual({
        role: "user",
        content: "پیام فعلی",
      });
    });
  });

  describe("executeTool callback", () => {
    it("should execute appointment search and wrap its result", async () => {
      const appointments = [
        {
          id: "appointment-1",
        },
      ];

      findAvailableAppointmentsMock.mockResolvedValue(appointments);

      await chatWithAssistant("tool-user", "نوبت می‌خواهم");

      const payload = chatMock.mock.calls[0][0];

      const result = await payload.executeTool(
        "search_available_appointments",
        {
          specialty: "قلب",
        },
      );

      expect(findAvailableAppointmentsMock).toHaveBeenCalledWith({
        specialty: "قلب",
      });

      expect(result).toEqual({
        appointments,
      });
    });

    it("should return an empty appointments array when no appointments are found", async () => {
      findAvailableAppointmentsMock.mockResolvedValue([]);

      await chatWithAssistant("empty-appointments-user", "نوبت می‌خواهم");

      const payload = chatMock.mock.calls[0][0];

      const result = await payload.executeTool(
        "search_available_appointments",
        {},
      );

      expect(result).toEqual({
        appointments: [],
      });
    });

    it("should reject unknown tool names", async () => {
      await chatWithAssistant("unknown-tool-user", "سلام");

      const payload = chatMock.mock.calls[0][0];

      await expect(
        payload.executeTool("unknown_tool", {}),
      ).rejects.toThrow("Unknown assistant tool: unknown_tool");
    });

    it("should propagate appointment search errors", async () => {
      findAvailableAppointmentsMock.mockRejectedValue(
        new Error("Appointment search failed"),
      );

      await chatWithAssistant("tool-error-user", "نوبت می‌خواهم");

      const payload = chatMock.mock.calls[0][0];

      await expect(
        payload.executeTool("search_available_appointments", {}),
      ).rejects.toThrow("Appointment search failed");
    });
  });
});