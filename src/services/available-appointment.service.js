import AvailableAppointment from "../models/available-appointment.model.js";
import DoctorSchedule from "../models/doctor-schedule.model.js";
import Doctor from "../models/doctor.model.js";
import ClinicTimePolicy from "../models/clinic-time-policy.model.js";
import Clinic from "../models/clinic.model.js";
import AppError from "../errors/app-error.js";
import { timeToMinutes } from "../utils/time.util.js";

export async function generateDoctorAppointments(
  doctorId,
  startDate = new Date(),
  days = 30,
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

  const schedules = await DoctorSchedule.find({
    doctor: doctorId,
    clinic: doctor.clinic,
    isActive: true,
  });

  if (!schedules.length) {
    return [];
  }

  const appointments = [];

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  for (let day = 0; day < days; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + day);

    const dayOfWeek = currentDate.getDay();

    const daySchedules = schedules.filter(
      (schedule) => schedule.dayOfWeek === dayOfWeek,
    );

    for (const schedule of daySchedules) {
      const scheduleStart = timeToMinutes(schedule.startTime);
      const scheduleEnd = timeToMinutes(schedule.endTime);

      const appointmentDuration = policy.appointmentDuration;

      for (
        let startMinutes = scheduleStart;
        startMinutes + appointmentDuration <= scheduleEnd;
        startMinutes += appointmentDuration
      ) {
        const endMinutes =
          startMinutes + appointmentDuration;

        const startTime = minutesToTime(startMinutes);
        const endTime = minutesToTime(endMinutes);

        appointments.push({
          doctor: doctorId,
          clinic: doctor.clinic,
          date: currentDate,
          startTime,
          endTime,
        });
      }
    }
  }

  if (!appointments.length) {
    return [];
  }

  const operations = appointments.map((appointment) => ({
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
  }));

  await AvailableAppointment.bulkWrite(operations);

  return appointments;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes,
  ).padStart(2, "0")}`;
}