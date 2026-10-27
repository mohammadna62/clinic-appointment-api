
import { describe, it, expect } from "vitest";
import MockAIProvider from "../src/providers/ai/mock-ai.provider.js";

describe("MockAIProvider", () => {
  const provider = new MockAIProvider();

  describe("chat", () => {
    it("should ask for a date when an appointment request has no date", async () => {
      const result = await provider.chat({
        message: "برای متخصص قلب وقت می‌خواهم",
      });

      expect(result.type).toBe("appointment_search");
      expect(result.criteria).toMatchObject({
        specialty: "قلب",
        date: null,
      });
      expect(result.message).toBe("حتماً. چه روزی مدنظرتان است؟");
    });

    it("should return appointment criteria when the request includes tomorrow", async () => {
      const result = await provider.chat({
        message: "فردا وقت متخصص قلب می‌خواهم",
      });

      expect(result.type).toBe("appointment_search");
      expect(result.criteria.date).toEqual({
        type: "tomorrow",
      });
    
      expect(result.message).toBeNull();
    });

    it("should extract the requested time range", async () => {
      const result = await provider.chat({
        message: "فردا صبح وقت می‌خواهم",
      });

      expect(result.type).toBe("appointment_search");
      expect(result.criteria.date).toEqual({
        type: "tomorrow",
      });
      expect(result.criteria.timeRange).toBe("morning");
    });

    it("should recognize a weekday in English", async () => {
      const result = await provider.chat({
        message: "I need an appointment on Friday",
      });

      expect(result.type).toBe("appointment_search");
      expect(result.criteria.date).toEqual({
        type: "weekday",
        weekday: "friday",
      });
    });

    it("should use previous user messages to understand the current request", async () => {
      const result = await provider.chat({
        message: "فردا صبح",
        history: [
          {
            role: "user",
            content: "برای متخصص قلب وقت می‌خواهم",
          },
          {
            role: "assistant",
            content: "چه روزی مدنظرتان است؟",
          },
        ],
      });

      expect(result.type).toBe("appointment_search");
      expect(result.criteria.specialty).toBe("قلب");
      expect(result.criteria.date).toEqual({
        type: "tomorrow",
      });
      expect(result.criteria.timeRange).toBe("morning");
    });

    it("should return a simulated general response for an explanatory question", async () => {
      const result = await provider.chat({
        message: "این چیست؟",
      });

      expect(result).toMatchObject({
        type: "general",
        criteria: null,
      });
      expect(result.message).toContain("پاسخ عمومی");
    });

    it("should return the default response for an unrelated message", async () => {
      const result = await provider.chat({
        message: "سلام",
      });

      expect(result).toEqual({
        type: "general",
        criteria: null,
        message:
          "می‌توانم برای پیدا کردن پزشک، تخصص، کلینیک و نوبت‌های آزاد به شما کمک کنم.",
      });
    });
  });
});
