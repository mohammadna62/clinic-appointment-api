import swaggerJSDoc from "swagger-jsdoc";

import env from "./env.js";

const swaggerDefinition = {
  openapi: "3.0.3",

  info: {
    title: "Clinic Appointment Management API",
    version: "1.0.0",
    description:
      "RESTful API for managing clinic appointments, doctors, patients, bookings, payments, ratings, and AI-assisted appointment search.",
  },

  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: "Local development server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          status: {
            type: "integer",
            example: 200,
          },

          success: {
            type: "boolean",
            example: true,
          },

          message: {
            type: "string",
            example: "Request completed successfully",
          },

          data: {
            type: "object",
            nullable: true,
          },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          status: {
            type: "integer",
            example: 404,
          },

          success: {
            type: "boolean",
            example: false,
          },

          message: {
            type: "string",
            example: "Resource not found",
          },

          errors: {
            nullable: true,
            example: null,
          },
        },
      },

      ValidationErrorResponse: {
        type: "object",
        properties: {
          status: {
            type: "integer",
            example: 400,
          },

          success: {
            type: "boolean",
            example: false,
          },

          message: {
            type: "string",
            example: "Validation failed",
          },

          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: {
                  type: "string",
                  example: "mobile",
                },

                message: {
                  type: "string",
                  example: "Mobile number is required",
                },
              },
            },
          },
        },
      },

      Pagination: {
        type: "object",
        properties: {
          currentPage: {
            type: "integer",
            example: 1,
          },

          limit: {
            type: "integer",
            example: 10,
          },

          totalItems: {
            type: "integer",
            example: 35,
          },

          totalPages: {
            type: "integer",
            example: 4,
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,

  apis: [
    "./src/app.js",
    "./src/routes/*.js",
    "./src/controllers/*.js",
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;