import aiProvider from "../providers/ai/ai-provider.js";
import { findAvailableAppointments } from "./assistant-tools.service.js";

const conversations = new Map();
const MAX_HISTORY_MESSAGES = 10;

function getConversation(userId) {
  const key = userId.toString();

  if (!conversations.has(key)) {
    conversations.set(key, []);
  }

  return conversations.get(key);
}

function addMessage(userId, role, content) {
  const conversation = getConversation(userId);

  conversation.push({
    role,
    content,
  });

  if (conversation.length > MAX_HISTORY_MESSAGES) {
    conversation.splice(
      0,
      conversation.length - MAX_HISTORY_MESSAGES,
    );
  }
}

function formatAppointments(appointments) {
  if (!appointments.length) {
    return "برای این شرایط، نوبت آزادی پیدا نشد.";
  }

  const lines = appointments.map((appointment, index) => {
    const doctorName = [
      appointment.doctor.firstName,
      appointment.doctor.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      `${index + 1}. ` +
      `دکتر ${doctorName} | ` +
      `${appointment.doctor.specialty} | ` +
      `${appointment.clinic.name} | ` +
      `${appointment.date.toISOString().slice(0, 10)} | ` +
      `${appointment.startTime}-${appointment.endTime} | ` +
      `${appointment.price.toLocaleString()} ریال`
    );
  });

  return `نوبت‌های آزاد پیدا شده:\n${lines.join("\n")}`;
}

async function executeAssistantTool(name, argumentsData) {
  switch (name) {
    case "search_available_appointments": {
      const appointments = await findAvailableAppointments(
        argumentsData,
      );

      return {
        appointments,
      };
    }

    default:
      throw new Error(`Unknown assistant tool: ${name}`);
  }
}

export async function chatWithAssistant(userId, message) {
  // Snapshot BEFORE adding the current message.
  const history = [...getConversation(userId)];

  addMessage(userId, "user", message);

  const result = await aiProvider.chat({
    message,
    history,
    executeTool: executeAssistantTool,
  });

  const response = result.message;

  addMessage(userId, "assistant", response);

  return {
    message: response,
    type: result.type,
    criteria: result.criteria ?? null,
  };
}