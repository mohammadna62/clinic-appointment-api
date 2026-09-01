import cron from "node-cron";

import {
  generateAppointmentsForDate,
} from "../services/available-appointment.service.js";

export function startDailyAppointmentGenerator() {
  cron.schedule(
    "5 0 * * *",
    async () => {
      try {
        const targetDate = new Date();

        targetDate.setDate(targetDate.getDate() + 30);

        console.log(
          `Generating appointments for ${targetDate.toISOString()}`,
        );

        await generateAppointmentsForDate(targetDate);

        console.log(
          "Daily appointment generation completed",
        );
      } catch (error) {
        console.error(
          "Daily appointment generation failed:",
          error,
        );
      }
    },
    {
      timezone: "Asia/Tehran",
    },
  );
}