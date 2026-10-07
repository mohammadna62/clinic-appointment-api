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
};

const swaggerOptions = {
  definition: swaggerDefinition,

  apis: [
    "./src/routes/*.js",
    "./src/controllers/*.js",
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;