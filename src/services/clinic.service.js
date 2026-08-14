import Clinic from "../models/clinic.model.js";

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

export async function getClinics() {
  const clinics = await Clinic.find().sort({ createdAt: -1 });

  return clinics;
}
