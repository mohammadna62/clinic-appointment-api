import cron from "node-cron";
import env from "../config/env.js";

import Doctor from "../models/doctor.model.js";
import AvailableAppointment from "../models/available-appointment.model.js";

import {
  generateAppointmentsForDate,
  generateDoctorAppointments,
  generateNextDayAppointments,
} from "../services/available-appointment.service.js";

import { getTodayLocalDate, addDays } from "../utils/date.util.js";

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

export async function recoverMissingAppointments() {
  const doctors = await Doctor.find({
    isActive: true,
  }).select("_id");

  const today = getTodayLocalDate();
  const targetDate = addDays(today, 29);

  for (const doctor of doctors) {
    try {
      const lastAppointment = await AvailableAppointment.findOne({
        doctor: doctor._id,
      })
        .sort({ date: -1 })
        .select("date");

      if (!lastAppointment) {
        const appointments =
          await generateDoctorAppointments(
            doctor._id,
            today,
            30,
          );

        console.log(
          `[Appointment Recovery] Doctor ${doctor._id}: ${appointments.length} appointments generated for initial 30-day window.`,
        );

        continue;
      }

      let nextDate = addDays(
        lastAppointment.date,
        1,
      );

      if (nextDate < today) {
        nextDate = today;
      }

      while (nextDate <= targetDate) {
        const appointments =
          await generateAppointmentsForDate(
            doctor._id,
            nextDate,
          );

        console.log(
          `[Appointment Recovery] Doctor ${doctor._id}: ${appointments.length} appointments generated for ${nextDate.toISOString().slice(0, 10)}.`,
        );

        nextDate = addDays(nextDate, 1);
      }
    } catch (error) {
      console.error(
        `[Appointment Recovery] Failed for doctor ${doctor._id}:`,
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