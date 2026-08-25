import ClinicTimePolicy from "../models/clinic-time-policy.model.js";
import Clinic from "../models/clinic.model.js";
import AppError from "../errors/app-error.js";

export async function createClinicTimePolicy(clinicId, data) {
  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  const existingPolicy = await ClinicTimePolicy.findOne({
    clinic: clinicId,
  });

  if (existingPolicy) {
    throw new AppError("Clinic time policy already exists", 409);
  }

  validateTimeRanges(data);

  const policy = await ClinicTimePolicy.create({
    clinic: clinicId,
    ...data,
  });

  return policy;
}

export async function getClinicTimePolicy(clinicId) {
  const policy = await ClinicTimePolicy.findOne({
    clinic: clinicId,
  });

  if (!policy) {
    throw new AppError("Clinic time policy not found", 404);
  }

  return policy;
}

export async function updateClinicTimePolicy(clinicId, data) {
  const policy = await ClinicTimePolicy.findOne({
    clinic: clinicId,
  });

  if (!policy) {
    throw new AppError("Clinic time policy not found", 404);
  }

  const updatedData = {
    morningStart: data.morningStart ?? policy.morningStart,

    morningEnd: data.morningEnd ?? policy.morningEnd,

    eveningStart: data.eveningStart ?? policy.eveningStart,

    eveningEnd: data.eveningEnd ?? policy.eveningEnd,

    appointmentDuration: data.appointmentDuration ?? policy.appointmentDuration,
  };

  validateTimeRanges(updatedData);

  Object.assign(policy, updatedData);

  await policy.save();

  return policy;
}

function validateTimeRanges(data) {
  if (data.morningStart >= data.morningEnd) {
    throw new AppError(
      "Morning start time must be before morning end time",
      400,
    );
  }

  if (data.eveningStart >= data.eveningEnd) {
    throw new AppError(
      "Evening start time must be before evening end time",
      400,
    );
  }

  if (data.morningEnd > data.eveningStart) {
    throw new AppError("Morning and evening schedules cannot overlap", 400);
  }
}
