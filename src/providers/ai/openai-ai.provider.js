import OpenAI from "openai";
import env from "../../config/env.js";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const SYSTEM_INSTRUCTIONS = `
You are the AI assistant of a clinic appointment management system.

Your responsibilities:

1. Help patients search for available appointments.
2. Understand Persian and English.
3. Understand natural language requests about:
   - doctors
   - specialties
   - clinics
   - dates
   - weekdays
   - time ranges
   - appointment availability
4. Answer general non-medical questions naturally.
5. Do not invent doctors, clinics, specialties, appointments, prices, or availability.
6. The application, not the AI model, is the source of truth for appointment availability.
7. When the user is asking about appointments, extract the search criteria.
8. If an appointment search is missing an important date, ask the user for the date.
9. Do not book or reserve an appointment.
10. The assistant only helps the patient find suitable available appointments.
11. Never claim that an appointment is available unless the application provides that information.
12. For general medical questions, do not present a diagnosis or definitive medical treatment as a fact. Encourage the user to consult a qualified healthcare professional when appropriate.

Appointment search criteria:

- specialty: string or null
- doctor: string or null
- clinic: string or null
- date:
    - today
    - tomorrow
    - weekday
    - null
- timeRange:
    - morning
    - afternoon
    - evening
    - null

When the user is continuing a previous appointment-search conversation, use the previous messages to understand missing criteria.
`;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      enum: ["appointment_search", "general"],
    },
    criteria: {
      type: ["object", "null"],
      additionalProperties: false,
      properties: {
        specialty: {
          type: ["string", "null"],
        },
        doctor: {
          type: ["string", "null"],
        },
        clinic: {
          type: ["string", "null"],
        },
        date: {
          type: ["object", "null"],
          additionalProperties: false,
          properties: {
            type: {
              type: "string",
              enum: ["today", "tomorrow", "weekday"],
            },
            weekday: {
              type: ["string", "null"],
            },
          },
          required: ["type", "weekday"],
        },
        timeRange: {
          type: ["string", "null"],
          enum: ["morning", "afternoon", "evening", null],
        },
      },
      required: [
        "specialty",
        "doctor",
        "clinic",
        "date",
        "timeRange",
      ],
    },
    message: {
      type: "string",
    },
  },
  required: ["type", "criteria", "message"],
};

function buildInput(history, message) {
  const previousMessages = history.map((item) => ({
    role: item.role,
    content: item.content,
  }));

  return [
    ...previousMessages,
    {
      role: "user",
      content: message,
    },
  ];
}

export default class OpenAIProvider {
  async chat({ message, history = [] }) {
    const response = await client.responses.create({
      model: env.OPENAI_MODEL,

      instructions: SYSTEM_INSTRUCTIONS,

      input: buildInput(history, message),

      text: {
        format: {
          type: "json_schema",
          name: "assistant_response",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    const outputText = response.output_text?.trim();

    if (!outputText) {
      throw new Error("OpenAI returned an empty response");
    }

    let result;

    try {
      result = JSON.parse(outputText);
    } catch {
      throw new Error("OpenAI returned invalid JSON");
    }

    return result;
  }
}