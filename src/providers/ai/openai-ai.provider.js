import OpenAI from "openai";
import env from "../../config/env.js";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const SYSTEM_INSTRUCTIONS = `
You are the AI assistant of a clinic appointment management system.

You communicate naturally in Persian or English depending on the user's language.

Your responsibilities:

1. Help patients find available appointments.
2. Understand natural language requests about:
   - doctors
   - specialties
   - clinics
   - dates
   - weekdays
   - time ranges
   - appointment availability
3. When the user asks about available appointments, use the
   search_available_appointments tool.
4. Never invent appointment availability.
5. Never invent doctors, clinics, specialties, prices, or appointment times.
6. The application database is the source of truth for appointment availability.
7. You must not claim that an appointment exists unless the tool returns it.
8. You do not book or reserve appointments.
9. You only help the patient search for available appointments.
10. If an appointment request is missing a required date, ask the user for the date.
11. If the user asks a general question, answer naturally.
12. For medical questions, do not diagnose the patient or provide definitive
    medical treatment as fact. Encourage consultation with a qualified
    healthcare professional when appropriate.

When searching appointments, use the following criteria:

- specialty
- doctor
- clinic
- date
- timeRange

Date types:

- today
- tomorrow
- weekday

Time ranges:

- morning
- afternoon
- evening

If the user's request contains enough information to search,
call the search_available_appointments tool.
`;

const searchAvailableAppointmentsTool = {
  type: "function",

  name: "search_available_appointments",

  description:
    "Search real available clinic appointments based on doctor, " +
    "specialty, clinic, date and time range. " +
    "Use this tool whenever the patient asks about available appointments.",

  strict: true,

  parameters: {
    type: "object",

    additionalProperties: false,

    properties: {
      specialty: {
        type: ["string", "null"],
        description:
          "Medical specialty requested by the patient.",
      },

      doctor: {
        type: ["string", "null"],
        description:
          "Doctor name requested by the patient.",
      },

      clinic: {
        type: ["string", "null"],
        description:
          "Clinic name requested by the patient.",
      },

      date: {
        type: ["object", "null"],

        additionalProperties: false,

        properties: {
          type: {
            type: "string",
            enum: [
              "today",
              "tomorrow",
              "weekday",
            ],
          },

          weekday: {
            type: ["string", "null"],
          },
        },

        required: [
          "type",
          "weekday",
        ],
      },

      timeRange: {
        type: ["string", "null"],

        enum: [
          "morning",
          "afternoon",
          "evening",
          null,
        ],
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
};

function buildInput(history, message) {
  return [
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),

    {
      role: "user",
      content: message,
    },
  ];
}

export default class OpenAIProvider {
  async chat({
    message,
    history = [],
    executeTool,
  }) {
    let input = buildInput(history, message);

    const firstResponse = await client.responses.create({
      model: env.OPENAI_MODEL,

      instructions: SYSTEM_INSTRUCTIONS,

      input,

      tools: [
        searchAvailableAppointmentsTool,
      ],

      tool_choice: "auto",
    });

    const toolCalls = firstResponse.output.filter(
      (item) => item.type === "function_call",
    );

    // No tool call.
    // The model has generated a normal response.
    if (!toolCalls.length) {
      return {
        type: "general",
        criteria: null,
        message: firstResponse.output_text,
      };
    }

    const toolOutputs = [];

    for (const toolCall of toolCalls) {
      if (toolCall.name !== "search_available_appointments") {
        throw new Error(
          `Unsupported AI tool: ${toolCall.name}`,
        );
      }

      let argumentsData;

      try {
        argumentsData = JSON.parse(toolCall.arguments);
      } catch {
        throw new Error(
          "OpenAI returned invalid tool arguments",
        );
      }

      const toolResult = await executeTool(
        toolCall.name,
        argumentsData,
      );

      toolOutputs.push({
        type: "function_call_output",

        call_id: toolCall.call_id,

        output: JSON.stringify(toolResult),
      });
    }

    input = [
      ...input,

      ...firstResponse.output,

      ...toolOutputs,
    ];

    const finalResponse = await client.responses.create({
      model: env.OPENAI_MODEL,

      instructions: SYSTEM_INSTRUCTIONS,

      input,

      tools: [
        searchAvailableAppointmentsTool,
      ],

      tool_choice: "auto",
    });

    return {
      type: "appointment_search",
      criteria: null,
      message: finalResponse.output_text,
    };
  }
}