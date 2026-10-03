import { successResponse } from "../helpers/response.js";
import { chatWithAssistant } from "../services/assistant.service.js";

export const chat = async (req, res, next) => {
  try {
    const { message } = req.validated.body;

    const result = await chatWithAssistant(
      req.user.userId,
      message,
    );

    return successResponse(res, {
      message: "Assistant response generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};