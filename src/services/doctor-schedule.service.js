import DoctorSchedule from "../models/doctor-schedule.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import WeeklySchedule from "../models/weekly-schedule.model.js";

import AppError from "../errors/app-error.js";
import { timeToMinutes } from "../utils/time.util.js";

export async function createDoctorSchedule(doctorId, data) {
  const { dayOfWeek, startTime, endTime } = data;

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

  const weeklySchedule = await WeeklySchedule.findOne({
    clinic: doctor.clinic,
    dayOfWeek,
    isActive: true,
  });

  if (!weeklySchedule) {
    throw new AppError("No active weekly schedule found for this day", 409);
  }

  validateDoctorScheduleTime(startTime, endTime, weeklySchedule);

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  const existingSchedules = await DoctorSchedule.find({
    doctor: doctorId,
    dayOfWeek,
    isActive: true,
  });

  const hasOverlap = existingSchedules.some((schedule) => {
    const existingStart = timeToMinutes(schedule.startTime);
    const existingEnd = timeToMinutes(schedule.endTime);

    return newStart < existingEnd && newEnd > existingStart;
  });

  if (hasOverlap) {
    throw new AppError(
      "Doctor schedule overlaps with an existing schedule",
      409,
    );
  }

  const schedule = await DoctorSchedule.create({
    doctor: doctorId,
    clinic: doctor.clinic,
    dayOfWeek,
    startTime,
    endTime,
    isActive: true,
  });

  return schedule;
}

export async function getDoctorSchedules(doctorId) {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const schedules = await DoctorSchedule.find({
    doctor: doctorId,
  }).sort({
    dayOfWeek: 1,
    startTime: 1,
  });

  return schedules;
}

export async function updateDoctorSchedule(doctorId, scheduleId, data) {
  const schedule = await DoctorSchedule.findOne({
    _id: scheduleId,
    doctor: doctorId,
  });

  if (!schedule) {
    throw new AppError("Doctor schedule not found", 404);
  }

  const updatedStartTime = data.startTime ?? schedule.startTime;

  const updatedEndTime = data.endTime ?? schedule.endTime;

  const updatedIsActive = data.isActive ?? schedule.isActive;

  if (updatedIsActive) {
    const weeklySchedule = await WeeklySchedule.findOne({
      clinic: schedule.clinic,
      dayOfWeek: schedule.dayOfWeek,
      isActive: true,
    });

    if (!weeklySchedule) {
      throw new AppError("No active weekly schedule found for this day", 409);
    }

    validateDoctorScheduleTime(
      updatedStartTime,
      updatedEndTime,
      weeklySchedule,
    );

    const newStart = timeToMinutes(updatedStartTime);
    const newEnd = timeToMinutes(updatedEndTime);

    const existingSchedules = await DoctorSchedule.find({
      doctor: doctorId,
      dayOfWeek: schedule.dayOfWeek,
      isActive: true,
      _id: { $ne: scheduleId },
    });

    const hasOverlap = existingSchedules.some((existingSchedule) => {
      const existingStart = timeToMinutes(existingSchedule.startTime);

      const existingEnd = timeToMinutes(existingSchedule.endTime);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      throw new AppError(
        "Doctor schedule overlaps with an existing schedule",
        409,
      );
    }
  }

  schedule.startTime = updatedStartTime;
  schedule.endTime = updatedEndTime;
  schedule.isActive = updatedIsActive;

  await schedule.save();

  return schedule;
}

export async function deleteDoctorSchedule(doctorId, scheduleId) {
  const schedule = await DoctorSchedule.findOneAndDelete({
    _id: scheduleId,
    doctor: doctorId,
  });

  if (!schedule) {
    throw new AppError("Doctor schedule not found", 404);
  }

  return schedule;
}

function validateDoctorScheduleTime(startTime, endTime, weeklySchedule) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes >= endMinutes) {
    throw new AppError("Start time must be before end time", 400);
  }

  const periods = [];

  if (
    weeklySchedule.morningStart !== null &&
    weeklySchedule.morningEnd !== null
  ) {
    periods.push({
      start: timeToMinutes(weeklySchedule.morningStart),
      end: timeToMinutes(weeklySchedule.morningEnd),
    });
  }

  if (
    weeklySchedule.eveningStart !== null &&
    weeklySchedule.eveningEnd !== null
  ) {
    periods.push({
      start: timeToMinutes(weeklySchedule.eveningStart),
      end: timeToMinutes(weeklySchedule.eveningEnd),
    });
  }

  const isInsideWorkingPeriod = periods.some(
    (period) => startMinutes >= period.start && endMinutes <= period.end,
  );

  if (!isInsideWorkingPeriod) {
    throw new AppError("Doctor schedule is outside clinic working hours", 400);
  }
}
