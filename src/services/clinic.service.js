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
    Clinic.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Clinic.countDocuments(),
  ]);

  const pagination = createPaginationData(
    page,
    limit,
    totalCount,
  );

  return {
    clinics,
    pagination,
  };
}
