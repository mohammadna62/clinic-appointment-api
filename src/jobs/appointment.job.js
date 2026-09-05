import cron from "node-cron";
import env from "../config/env.js";

import Doctor from "../models/doctor.model.js";
import {
  generateNextDayAppointments,
} from "../services/available-appointment.service.js";

export async function generateNextDayAppointmentsForAllDoctors() {
  const doctors = await Doctor.find({
    isActive: true,
  }).select("_id");

  for (const doctor of doctors) {
    try {
      const appointments =
        await generateNextDayAppointments(
          doctor._id,
        );

      console.log(
        `[Appointment Job] Doctor ${doctor._id}: ${appointments.length} appointments generated.`,
      );
    } catch (error) {
      console.error(
        `[Appointment Job] Failed for doctor ${doctor._id}:`,
        error.message,
      );
    }
  }
}

export function startAppointmentJob() {
  cron.schedule(
    "0 1 * * *",
    async () => {
      console.log(
        "[Appointment Job] Starting daily appointment generation...",
      );

      try {
        await generateNextDayAppointmentsForAllDoctors();

        console.log(
          "[Appointment Job] Daily appointment generation completed.",
        );
      } catch (error) {
        console.error(
          "[Appointment Job] Job failed:",
          error,
        );
      }
    },
    {
      timezone: env.PROJECT_TIME_ZONE,
    },
  );
}