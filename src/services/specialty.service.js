import Specialty from "./../models/specialty.model.js";
import AppError from "./../errors/app-error.js";
import { createPaginationData } from "./../utils/pagination.util.js";

export async function createSpecialty(data) {
  const { name, description } = data;

  const existingSpecialty = await Specialty.findOne({ name });

  if (existingSpecialty) {
    throw new AppError("Specialty already exists", 409);
  }

  const specialty = await Specialty.create({
    name,
    description,
  });

  return specialty;
}

export async function getSpecialties(page, limit) {
  const skip = (page - 1) * limit;

  const [specialties, total] = await Promise.all([
    Specialty.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Specialty.countDocuments(),
  ]);

  const pagination = createPaginationData(page, limit, total);
  return {
    specialties,
    pagination,
  };
}

export async function getSpecialtyById(specialtyId) {
  const specialty = await Specialty.findById(specialtyId);

  if (!specialty) {
    throw new AppError("Specialty not found", 404);
  }

  return specialty;
}

export async function updateSpecialty(specialtyId, data) {
  const { name, description, isActive } = data;

  if (name !== undefined) {
    const existingSpecialty = await Specialty.findOne({
      name,
      _id: { $ne: specialtyId },
    });

    if (existingSpecialty) {
      throw new AppError("Specialty already exists", 409);
    }
  }

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  const specialty = await Specialty.findByIdAndUpdate(
    specialtyId,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!specialty) {
    throw new AppError("Specialty not found", 404);
  }

  return specialty;
}
