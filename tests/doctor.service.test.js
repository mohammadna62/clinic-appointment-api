
import { beforeEach, describe, expect, it, vi } from "vitest";

import Doctor from "../src/models/doctor.model.js";
import User from "../src/models/user.model.js";
import Clinic from "../src/models/clinic.model.js";
import Specialty from "../src/models/specialty.model.js";

import {
  createDoctor,
  getDoctorById,
  updateDoctor,
  updateDoctorStatus,
  updateDoctorByAdmin,
  getDoctors,
  getActiveDoctorsByClinic,
  getActiveDoctorsBySpecialty,
} from "../src/services/doctor.service.js";

import { getDoctorRatingStats } from "../src/services/rating.service.js";
import { deleteUploadedFile } from "../src/utils/file.util.js";

vi.mock("../src/models/doctor.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findById: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("../src/models/clinic.model.js", () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../src/models/specialty.model.js", () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../src/services/rating.service.js", () => ({
  getDoctorRatingStats: vi.fn(),
}));

vi.mock("../src/utils/file.util.js", () => ({
  deleteUploadedFile: vi.fn(),
}));

function createQuery(data) {
  const query = {
    populate: vi.fn(() => query),
    sort: vi.fn(() => query),
    skip: vi.fn(() => query),
    limit: vi.fn(() => query),
    then: (resolve, reject) => Promise.resolve(data).then(resolve, reject),
  };

  return query;
}

describe("Doctor Service", () => {
  const userId = "user-123";
  const doctorId = "doctor-123";
  const clinicId = "clinic-123";
  const specialtyId = "specialty-123";

  const doctorData = {
    clinic: clinicId,
    specialty: specialtyId,
    medicalCode: "MED-123",
    bio: "Experienced doctor",
    consultationFee: 500000,
  };

  let doctor;

  beforeEach(() => {
    vi.resetAllMocks();

    doctor = {
      _id: doctorId,
      user: userId,
      clinic: clinicId,
      specialty: specialtyId,
      medicalCode: "MED-123",
      bio: "Experienced doctor",
      consultationFee: 500000,
      profileImage: null,
      isActive: false,
      save: vi.fn().mockResolvedValue(undefined),
      populate: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("createDoctor", () => {
    it("should create a doctor for a valid user, clinic, and specialty", async () => {
      const createdDoctor = { ...doctor };

      User.findById.mockResolvedValue({
        _id: userId,
        isBanned: false,
        isDeleted: false,
      });
      Doctor.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      Clinic.findById.mockResolvedValue({
        _id: clinicId,
        isActive: true,
      });
      Specialty.findById.mockResolvedValue({
        _id: specialtyId,
        isActive: true,
      });
      Doctor.create.mockResolvedValue(createdDoctor);

      const result = await createDoctor(userId, doctorData, null);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Doctor.findOne).toHaveBeenNthCalledWith(1, {
        user: userId,
      });
      expect(Clinic.findById).toHaveBeenCalledWith(clinicId);
      expect(Specialty.findById).toHaveBeenCalledWith(specialtyId);
      expect(Doctor.findOne).toHaveBeenNthCalledWith(2, {
        medicalCode: doctorData.medicalCode,
      });
      expect(Doctor.create).toHaveBeenCalledWith({
        user: userId,
        ...doctorData,
        profileImage: null,
        isActive: false,
      });
      expect(result).toBe(createdDoctor);
    });

    it("should throw 404 if the user does not exist", async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        createDoctor(userId, doctorData, null),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "User not found",
      });

      expect(Doctor.create).not.toHaveBeenCalled();
    });

    it("should throw 403 if the user is banned", async () => {
      User.findById.mockResolvedValue({
        isBanned: true,
        isDeleted: false,
      });

      await expect(
        createDoctor(userId, doctorData, null),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: "User is banned",
      });

      expect(Doctor.create).not.toHaveBeenCalled();
    });

    it("should throw 409 if the doctor profile already exists", async () => {
      User.findById.mockResolvedValue({
        isBanned: false,
        isDeleted: false,
      });
      Doctor.findOne.mockResolvedValue({ _id: doctorId });

      await expect(
        createDoctor(userId, doctorData, null),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Doctor profile already exists",
      });

      expect(Clinic.findById).not.toHaveBeenCalled();
      expect(Doctor.create).not.toHaveBeenCalled();
    });

    it("should throw 404 if the clinic does not exist", async () => {
      User.findById.mockResolvedValue({
        isBanned: false,
        isDeleted: false,
      });
      Doctor.findOne.mockResolvedValue(null);
      Clinic.findById.mockResolvedValue(null);

      await expect(
        createDoctor(userId, doctorData, null),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });

      expect(Doctor.create).not.toHaveBeenCalled();
    });

    it("should throw 409 if the specialty is inactive", async () => {
      User.findById.mockResolvedValue({
        isBanned: false,
        isDeleted: false,
      });
      Doctor.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      Clinic.findById.mockResolvedValue({
        isActive: true,
      });
      Specialty.findById.mockResolvedValue({
        isActive: false,
      });

      await expect(
        createDoctor(userId, doctorData, null),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Specialty is inactive",
      });

      expect(Doctor.create).not.toHaveBeenCalled();
    });
  });

  describe("getDoctorById", () => {
    it("should return the doctor and rating statistics", async () => {
      const ratingStats = {
        averageRating: 4.5,
        totalRatings: 10,
      };

      Doctor.findById.mockReturnValue(createQuery(doctor));
      getDoctorRatingStats.mockResolvedValue(ratingStats);

      const result = await getDoctorById(doctorId);

      expect(Doctor.findById).toHaveBeenCalledWith(doctorId);
      expect(getDoctorRatingStats).toHaveBeenCalledWith(doctorId);
      expect(result).toEqual({
        doctor,
        ratingStats,
      });
    });

    it("should throw 404 if the doctor does not exist", async () => {
      Doctor.findById.mockReturnValue(createQuery(null));

      await expect(
        getDoctorById(doctorId),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Doctor not found",
      });

      expect(getDoctorRatingStats).not.toHaveBeenCalled();
    });
  });

  describe("updateDoctor", () => {
    it("should update the doctor's bio", async () => {
      Doctor.findOne.mockResolvedValue(doctor);

      const result = await updateDoctor(userId, {
        bio: "Updated bio",
      });

      expect(doctor.bio).toBe("Updated bio");
      expect(doctor.save).toHaveBeenCalledOnce();
      expect(result).toBe(doctor);
    });

    it("should throw 404 if the doctor profile does not exist", async () => {
      Doctor.findOne.mockResolvedValue(null);

      await expect(
        updateDoctor(userId, { bio: "Updated bio" }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Doctor profile not found",
      });
    });

    it("should throw 400 if no changes are provided", async () => {
      Doctor.findOne.mockResolvedValue(doctor);

      await expect(
        updateDoctor(userId, {}, null),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "No changes provided",
      });

      expect(doctor.save).not.toHaveBeenCalled();
    });

    it("should delete the old profile image after replacing it", async () => {
      doctor.profileImage = "/uploads/doctors/old-image.jpg";
      Doctor.findOne.mockResolvedValue(doctor);
      deleteUploadedFile.mockResolvedValue(undefined);

      const file = {
        filename: "new-image.jpg",
      };

      const result = await updateDoctor(userId, {}, file);

      expect(doctor.profileImage).toBe(
        "/uploads/doctors/new-image.jpg",
      );
      expect(doctor.save).toHaveBeenCalledOnce();
      expect(deleteUploadedFile).toHaveBeenCalledWith(
        "/uploads/doctors/old-image.jpg",
      );
      expect(result).toBe(doctor);
    });
  });

  describe("updateDoctorStatus", () => {
    it("should activate the doctor and add the doctor role to the user", async () => {
      doctor.isActive = false;
      Doctor.findById.mockResolvedValue(doctor);
      User.updateOne.mockResolvedValue({ acknowledged: true });

      const result = await updateDoctorStatus(doctorId, {
        isActive: true,
      });

      expect(doctor.isActive).toBe(true);
      expect(doctor.save).toHaveBeenCalledOnce();
      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $addToSet: { roles: "doctor" } },
      );
      expect(doctor.populate).toHaveBeenCalledWith(
        "user",
        "firstName lastName roles",
      );
      expect(result).toBe(doctor);
    });

    it("should throw 404 if the doctor does not exist", async () => {
      Doctor.findById.mockResolvedValue(null);

      await expect(
        updateDoctorStatus(doctorId, { isActive: true }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Doctor not found",
      });

      expect(User.updateOne).not.toHaveBeenCalled();
    });
  });

  describe("updateDoctorByAdmin", () => {
    it("should update the doctor's bio and consultation fee", async () => {
      Doctor.findById.mockResolvedValue(doctor);

      const result = await updateDoctorByAdmin(doctorId, {
        bio: "Admin updated bio",
        consultationFee: 600000,
      });

      expect(doctor.bio).toBe("Admin updated bio");
      expect(doctor.consultationFee).toBe(600000);
      expect(doctor.save).toHaveBeenCalledOnce();
      expect(result).toBe(doctor);
    });

    it("should throw 404 if the doctor does not exist", async () => {
      Doctor.findById.mockResolvedValue(null);

      await expect(
        updateDoctorByAdmin(doctorId, {
          bio: "Updated bio",
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Doctor not found",
      });
    });

    it("should throw 400 if no changes are provided", async () => {
      Doctor.findById.mockResolvedValue(doctor);

      await expect(
        updateDoctorByAdmin(doctorId, {}, null),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "No changes provided",
      });

      expect(doctor.save).not.toHaveBeenCalled();
    });
  });

  describe("getDoctors", () => {
    it("should return active doctors with pagination", async () => {
      const doctors = [{ _id: doctorId, isActive: true }];

      Doctor.find.mockReturnValue(createQuery(doctors));
      Doctor.countDocuments.mockResolvedValue(6);

      const result = await getDoctors("active", 2, 5);

      expect(Doctor.find).toHaveBeenCalledWith({
        isActive: true,
      });
      expect(Doctor.countDocuments).toHaveBeenCalledWith({
        isActive: true,
      });
      expect(result).toEqual({
        doctors,
        pagination: {
          page: 2,
          limit: 5,
          total: 6,
          totalPages: 2,
        },
      });
    });
  });

  describe("getActiveDoctorsByClinic", () => {
    it("should return active doctors for an active clinic", async () => {
      const doctors = [{ _id: doctorId, isActive: true }];

      Clinic.findOne.mockResolvedValue({
        _id: clinicId,
        isActive: true,
      });
      Doctor.find.mockReturnValue(createQuery(doctors));
      Doctor.countDocuments.mockResolvedValue(1);

      const result = await getActiveDoctorsByClinic(
        clinicId,
        1,
        10,
      );

      expect(Clinic.findOne).toHaveBeenCalledWith({
        _id: clinicId,
        isActive: true,
      });
      expect(Doctor.find).toHaveBeenCalledWith({
        clinic: clinicId,
        isActive: true,
      });
      expect(result.doctors).toBe(doctors);
      expect(result.pagination.total).toBe(1);
    });

    it("should throw 404 if the clinic is not found or inactive", async () => {
      Clinic.findOne.mockResolvedValue(null);

      await expect(
        getActiveDoctorsByClinic(clinicId, 1, 10),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });

      expect(Doctor.find).not.toHaveBeenCalled();
    });
  });

  describe("getActiveDoctorsBySpecialty", () => {
    it("should return active doctors for an active specialty", async () => {
      const doctors = [{ _id: doctorId, isActive: true }];

      Specialty.findOne.mockResolvedValue({
        _id: specialtyId,
        isActive: true,
      });
      Doctor.find.mockReturnValue(createQuery(doctors));
      Doctor.countDocuments.mockResolvedValue(1);

      const result = await getActiveDoctorsBySpecialty(
        specialtyId,
        1,
        10,
      );

      expect(Specialty.findOne).toHaveBeenCalledWith({
        _id: specialtyId,
        isActive: true,
      });
      expect(Doctor.find).toHaveBeenCalledWith({
        specialty: specialtyId,
        isActive: true,
      });
      expect(result.doctors).toBe(doctors);
      expect(result.pagination.total).toBe(1);
    });

    it("should throw 404 if the specialty is not found or inactive", async () => {
      Specialty.findOne.mockResolvedValue(null);

      await expect(
        getActiveDoctorsBySpecialty(specialtyId, 1, 10),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Specialty not found",
      });

      expect(Doctor.find).not.toHaveBeenCalled();
    });
  });
});