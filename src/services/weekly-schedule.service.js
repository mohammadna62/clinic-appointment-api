import WeeklySchedule from "../models/weekly-schedule.model.js";
import Clinic from "../models/clinic.model.js";
import ClinicTimePolicy from "../models/clinic-time-policy.model.js";
import AppError from "../errors/app-error.js";

export async function createWeeklySchedule(clinicId, data) {
  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const existingSchedule = await WeeklySchedule.findOne({
    clinic: clinicId,
    dayOfWeek: data.dayOfWeek,
  });

  if (existingSchedule) {
    throw new AppError("Weekly schedule for this day already exists", 409);
  }

  const policy = await ClinicTimePolicy.findOne({
    clinic: clinicId,
  });

  if (!policy) {
    throw new AppError("Clinic time policy not found", 404);
  }

  validateScheduleData(data, policy);

  const schedule = await WeeklySchedule.create({
    clinic: clinicId,
    ...data,
  });

  return schedule;
}

export async function getWeeklySchedules(clinicId) {
  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const schedules = await WeeklySchedule.find({
    clinic: clinicId,
  }).sort({ dayOfWeek: 1 });

  return schedules;
}

export async function updateWeeklySchedule(clinicId, scheduleId, data) {
  const schedule = await WeeklySchedule.findOne({
    _id: scheduleId,
    clinic: clinicId,
  });

  if (!schedule) {
    throw new AppError("Weekly schedule not found", 404);
  }

  const policy = await ClinicTimePolicy.findOne({
    clinic: clinicId,
  });

  if (!policy) {
    throw new AppError("Clinic time policy not found", 404);
  }

  const updatedData = {
    isActive: data.isActive ?? schedule.isActive,

    morningStart:
      data.morningStart !== undefined
        ? data.morningStart
        : schedule.morningStart,

    morningEnd:
      data.morningEnd !== undefined ? data.morningEnd : schedule.morningEnd,

    eveningStart:
      data.eveningStart !== undefined
        ? data.eveningStart
        : schedule.eveningStart,

    eveningEnd:
      data.eveningEnd !== undefined ? data.eveningEnd : schedule.eveningEnd,
  };

  validateScheduleData(updatedData, policy);

  Object.assign(schedule, updatedData);

  await schedule.save();

  return schedule;
}

export async function deleteWeeklySchedule(clinicId, scheduleId) {
  const schedule = await WeeklySchedule.findOneAndDelete({
    _id: scheduleId,
    clinic: clinicId,
  });

  if (!schedule) {
    throw new AppError("Weekly schedule not found", 404);
  }

  return schedule;
}

function validateScheduleData(data, policy) {
  const isActive = data.isActive ?? true;

  if (!isActive) {
    return;
  }

  const hasMorningStart =
    data.morningStart !== null &&
    data.morningStart !== undefined;

  const hasMorningEnd =
    data.morningEnd !== null &&
    data.morningEnd !== undefined;

  const hasEveningStart =
    data.eveningStart !== null &&
    data.eveningStart !== undefined;

  const hasEveningEnd =
    data.eveningEnd !== null &&
    data.eveningEnd !== undefined;

  if (hasMorningStart !== hasMorningEnd) {
    throw new AppError(
      "Morning start and end times must be provided together",
      400,
    );
  }

  if (hasEveningStart !== hasEveningEnd) {
    throw new AppError(
      "Evening start and end times must be provided together",
      400,
    );
  }

  if (!hasMorningStart && !hasEveningStart) {
    throw new AppError(
      "At least one working period is required",
      400,
    );
  }

  if (
    hasMorningStart &&
    data.morningStart >= data.morningEnd
  ) {
    throw new AppError(
      "Morning start time must be before morning end time",
      400,
    );
  }

  if (
    hasEveningStart &&
    data.eveningStart >= data.eveningEnd
  ) {
    throw new AppError(
      "Evening start time must be before evening end time",
      400,
    );
  }

  if (
    hasMorningStart &&
    !isWithinPolicy(
      data.morningStart,
      data.morningEnd,
      policy.morningStart,
      policy.morningEnd,
    )
  ) {
    throw new AppError(
      "Morning schedule is outside clinic time policy",
      400,
    );
  }

  if (
    hasEveningStart &&
    !isWithinPolicy(
      data.eveningStart,
      data.eveningEnd,
      policy.eveningStart,
      policy.eveningEnd,
    )
  ) {
    throw new AppError(
      "Evening schedule is outside clinic time policy",
      400,
    );
  }
}

function isWithinPolicy(
  start,
  end,
  policyStart,
  policyEnd,
) {
  return (
    start >= policyStart &&
    end <= policyEnd
  );
}