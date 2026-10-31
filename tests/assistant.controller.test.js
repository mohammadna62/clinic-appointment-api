import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  chatWithAssistant: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/assistant.service.js", () => ({
  chatWithAssistant: mocks.chatWithAssistant,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import { chat } from "../src/controllers/assistant.controller.js";

describe("Assistant Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        body: {
          message: "برای فردا نوبت دکتر قلب می‌خواهم",
        },
      },
      user: {
        userId: "user-id",
      },
    };

    res = {};
    next = vi.fn();

    mocks.successResponse.mockReturnValue("response");
  });

  it("should generate an assistant response successfully", async () => {
    const result = {
      message: "چند نوبت آزاد پیدا شد.",
      type: "appointment_search",
      criteria: {
        specialty: "قلب",
      },
    };

    mocks.chatWithAssistant.mockResolvedValueOnce(result);

    await chat(req, res, next);

    expect(mocks.chatWithAssistant).toHaveBeenCalledWith(
      "user-id",
      "برای فردا نوبت دکتر قلب می‌خواهم",
    );

    expect(mocks.successResponse).toHaveBeenCalledWith(res, {
      message: "Assistant response generated successfully",
      data: result,
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should pass service errors to next", async () => {
    const error = new Error("Assistant service failed");

    mocks.chatWithAssistant.mockRejectedValueOnce(error);

    await chat(req, res, next);

    expect(mocks.chatWithAssistant).toHaveBeenCalledWith(
      "user-id",
      "برای فردا نوبت دکتر قلب می‌خواهم",
    );

    expect(next).toHaveBeenCalledWith(error);
    expect(mocks.successResponse).not.toHaveBeenCalled();
  });
});