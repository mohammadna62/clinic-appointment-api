import Doctor from "./../models/doctor.model.js";
import User from "./../models/user.model.js";
import Clinic from "./../models/clinic.model.js";
import Specialty from "./../models/specialty.model.js";
import AppError from "./../errors/app-error.js";

export async function createDoctor(userId, data) {
   
  const { clinic, specialty, medicalCode, bio } = data;

   if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (!mongoose.isValidObjectId(clinic)) {
    throw new AppError("Invalid clinic ID", 400);
  }

  if (!mongoose.isValidObjectId(specialty)) {
    throw new AppError("Invalid specialty ID", 400);
  }
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const existingDoctor = await Doctor.findOne({ user: userId });

  if (existingDoctor) {
    throw new AppError("Doctor profile already exists", 409);
  }

  const clinicExists = await Clinic.findById(clinic);

  if (!clinicExists) {
    throw new AppError("Clinic not found", 404);
  }

  if (!clinicExists.isActive) {
    throw new AppError("Clinic is inactive", 409);
  }

  const specialtyExists = await Specialty.findById(specialty);

  if (!specialtyExists) {
    throw new AppError("Specialty not found", 404);
  }

  if (!specialtyExists.isActive) {
    throw new AppError("Specialty is inactive", 409);
  }

  const existingMedicalCode = await Doctor.findOne({ medicalCode });

  if (existingMedicalCode) {
    throw new AppError("Medical code is already in use", 409);
  }

  const doctor = await Doctor.create({
    user: userId,
    clinic,
    specialty,
    medicalCode,
    bio,
    isActive: false,
  });

  return doctor;
}