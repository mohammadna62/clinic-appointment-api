import Doctor from "./../models/doctor.model.js";
import User from "./../models/user.model.js";
import Clinic from "./../models/clinic.model.js";
import Specialty from "./../models/specialty.model.js";
import AppError from "./../errors/app-error.js";
import { createPaginationData } from "./../utils/pagination.util.js";
import { deleteUploadedFile } from "./../utils/file.util.js";

export async function createDoctor(userId, data, file) {
  const { clinic, specialty, medicalCode, bio } = data;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isBanned) {
    throw new AppError("User is banned", 403);
  }

  if (user.isDeleted) {
    throw new AppError("User account is already deleted", 409);
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

  const profileImage = file ? `/uploads/doctors/${file.filename}` : null;

  const doctor = await Doctor.create({
    user: userId,
    clinic,
    specialty,
    medicalCode,
    bio,
    profileImage,
    isActive: false,
  });

  return doctor;
}

export async function getDoctorById(doctorId) {
  const doctor = await Doctor.findById(doctorId)
    .populate("user", "firstName lastName")
    .populate("clinic", "name")
    .populate("specialty", "name");

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  return doctor;
}

export async function updateDoctor(userId, data, file) {
  const { clinic, specialty, medicalCode, bio } = data;

  const doctor = await Doctor.findOne({ user: userId });

  if (!doctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  if (
    clinic === undefined &&
    specialty === undefined &&
    medicalCode === undefined &&
    bio === undefined &&
    !file
  ) {
    throw new AppError("No changes provided", 400);
  }

  if (clinic !== undefined) {
    const clinicExists = await Clinic.findById(clinic);

    if (!clinicExists) {
      throw new AppError("Clinic not found", 404);
    }

    if (!clinicExists.isActive) {
      throw new AppError("Clinic is inactive", 409);
    }
  }

  if (specialty !== undefined) {
    const specialtyExists = await Specialty.findById(specialty);

    if (!specialtyExists) {
      throw new AppError("Specialty not found", 404);
    }

    if (!specialtyExists.isActive) {
      throw new AppError("Specialty is inactive", 409);
    }
  }

  if (medicalCode !== undefined) {
    const existingMedicalCode = await Doctor.findOne({
      medicalCode,
      _id: { $ne: doctor._id },
    });

    if (existingMedicalCode) {
      throw new AppError("Medical code is already in use", 409);
    }
  }

  const oldProfileImage = doctor.profileImage;

  if (clinic !== undefined) {
    doctor.clinic = clinic;
  }

  if (specialty !== undefined) {
    doctor.specialty = specialty;
  }

  if (medicalCode !== undefined) {
    doctor.medicalCode = medicalCode;
  }

  if (bio !== undefined) {
    doctor.bio = bio;
  }

  if (file) {
    doctor.profileImage = `/uploads/doctors/${file.filename}`;
  }

  await doctor.save();

  if (file && oldProfileImage) {
    await deleteUploadedFile(oldProfileImage);
  }

  return doctor;
}

export async function updateDoctorStatus(doctorId, data) {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  doctor.isActive = data.isActive;

  await doctor.save();

  if (doctor.isActive) {
    await User.updateOne(
      { _id: doctor.user },
      {
        $addToSet: {
          roles: "doctor",
        },
      },
    );
  } else {
    await User.updateOne(
      { _id: doctor.user },
      {
        $pull: {
          roles: "doctor",
        },
      },
    );
  }

  await doctor.populate("user", "firstName lastName roles");

  return doctor;
}

export async function updateDoctorByAdmin(doctorId, data, file) {
  const { clinic, specialty, medicalCode, bio } = data;

  const doctor = await Doctor.findById(doctorId);

  const oldProfileImage = doctor.profileImage;

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  if (
    clinic === undefined &&
    specialty === undefined &&
    medicalCode === undefined &&
    bio === undefined &&
    !file
  ) {
    throw new AppError("No changes provided", 400);
  }

  if (clinic !== undefined) {
    const clinicExists = await Clinic.findById(clinic);

    if (!clinicExists) {
      throw new AppError("Clinic not found", 404);
    }

    if (!clinicExists.isActive) {
      throw new AppError("Clinic is inactive", 409);
    }

    doctor.clinic = clinic;
  }

  if (specialty !== undefined) {
    const specialtyExists = await Specialty.findById(specialty);

    if (!specialtyExists) {
      throw new AppError("Specialty not found", 404);
    }

    if (!specialtyExists.isActive) {
      throw new AppError("Specialty is inactive", 409);
    }

    doctor.specialty = specialty;
  }

  if (medicalCode !== undefined) {
    const existingMedicalCode = await Doctor.findOne({
      medicalCode,
      _id: { $ne: doctor._id },
    });

    if (existingMedicalCode) {
      throw new AppError("Medical code is already in use", 409);
    }

    doctor.medicalCode = medicalCode;
  }

  if (bio !== undefined) {
    doctor.bio = bio;
  }

  if (file) {
    doctor.profileImage = `/uploads/doctors/${file.filename}`;
  }

  await doctor.save();

  if (file && oldProfileImage) {
    await deleteUploadedFile(oldProfileImage);
  }

  return doctor;
}

export async function getDoctors(status, page, limit) {
  const filter = {};

  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  const skip = (page - 1) * limit;

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate("user", "firstName lastName phone roles")
      .populate("clinic", "name")
      .populate("specialty", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Doctor.countDocuments(filter),
  ]);

  const pagination = createPaginationData(page, limit, total);

  return {
    doctors,
    pagination,
  };
}
