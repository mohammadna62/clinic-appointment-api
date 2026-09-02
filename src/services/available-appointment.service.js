import AvailableAppointment from "../models/available-appointment.model.js";
import DoctorSchedule from "../models/doctor-schedule.model.js";
import Doctor from "../models/doctor.model.js";
import ClinicTimePolicy from "../models/clinic-time-policy.model.js";
import Clinic from "../models/clinic.model.js";
import AppError from "../errors/app-error.js";

import { timeToMinutes } from "../utils/time.util.js";

import {
  getTodayLocalDate,
  addDays,
  getProjectDayOfWeek,
} from "../utils/date.util.js";

export async function generateAppointmentsForDate(
  doctorId,
  date,
) {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  if (!doctor.isActive) {
    throw new AppError("Doctor is inactive", 409);
  }

  const clinic = await Clinic.findById(doctor.clinic);

  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  if (!clinic.isActive) {
    throw new AppError("Clinic is inactive", 409);
  }

  const policy = await ClinicTimePolicy.findOne({
    clinic: doctor.clinic,
    isActive: true,
  });

  if (!policy) {
    throw new AppError(
      "Active clinic time policy not found",
      404,
    );
  }

  const dayOfWeek = getProjectDayOfWeek(date);

  const schedules = await DoctorSchedule.find({
    doctor: doctorId,
    clinic: doctor.clinic,
    dayOfWeek,
    isActive: true,
  });

  if (!schedules.length) {
    return [];
  }

  const appointments = [];

  for (const schedule of schedules) {
    const scheduleStart = timeToMinutes(
      schedule.startTime,
    );

    const scheduleEnd = timeToMinutes(
      schedule.endTime,
    );

    const appointmentDuration =
      policy.appointmentDuration;

    for (
      let startMinutes = scheduleStart;
      startMinutes + appointmentDuration <= scheduleEnd;
      startMinutes += appointmentDuration
    ) {
      const endMinutes =
        startMinutes + appointmentDuration;

      appointments.push({
        doctor: doctorId,
        clinic: doctor.clinic,
        date,
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
      });
    }
  }

  if (!appointments.length) {
    return [];
  }

  const operations = appointments.map(
    (appointment) => ({
      updateOne: {
        filter: {
          doctor: appointment.doctor,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
        },
        update: {
          $setOnInsert: appointment,
        },
        upsert: true,
      },
    }),
  );

  await AvailableAppointment.bulkWrite(
    operations,
  );

  return appointments;
}

export async function generateDoctorAppointments(
  doctorId,
  startDate = getTodayLocalDate(),
  days = 30,
) {
  const start = new Date(startDate);

  start.setUTCHours(0, 0, 0, 0);

  const appointments = [];

  for (let day = 0; day < days; day++) {
    const currentDate = addDays(start, day);

    const generated =
      await generateAppointmentsForDate(
        doctorId,
        currentDate,
      );

    appointments.push(...generated);
  }

  return appointments;
}

export async function generateNextDayAppointments(
  doctorId,
  today = getTodayLocalDate(),
) {
  const nextDate = addDays(today, 29);

  const appointments =
    await generateAppointmentsForDate(
      doctorId,
      nextDate,
    );

  return appointments;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes,
  ).padStart(2, "0")}`;
}