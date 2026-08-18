import Clinic from "../models/clinic.model.js";
import { createPaginationData } from "./../utils/pagination.util.js";
import AppError from "./../errors/app-error.js";

export async function createClinic(data) {
  const { name, description } = data;

  const existingClinic = await Clinic.findOne({ name });

  if (existingClinic) {
    throw new AppError("Clinic already exists", 409);
  }

  const clinic = await Clinic.create({
    name,
    description,
  });
  return clinic;
}

export async function getClinics(page, limit) {
  const skip = (page - 1) * limit;

  const [clinics, totalCount] = await Promise.all([
    Clinic.find().sort({ createdAt: -1 }).skip(skip).limit(limit),

    Clinic.countDocuments(),
  ]);

  const pagination = createPaginationData(page, limit, totalCount);

  return {
    clinics,
    pagination,
  };
}

export async function getClinicById(clinicId) {
  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  return clinic;
}

export async function updateClinic(clinicId, data) {
  
  const { name } = data;

  if (name !== undefined) {
    const existingClinic = await Clinic.findOne({
      name,
      _id: { $ne: clinicId },
    });

    if (existingClinic) {
      throw new AppError("Clinic already exists", 409);
    }
  }
  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  const clinic = await Clinic.findByIdAndUpdate(clinicId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }

  return clinic;
}

export async function updateClinicStatus(clinicId, isActive) {
  const clinic = await Clinic.findByIdAndUpdate(
    clinicId,
    { isActive },
    { new: true, runValidators: true },
  );
  if (!clinic) {
    throw new AppError("Clinic not found", 404);
  }
  return clinic;
}
