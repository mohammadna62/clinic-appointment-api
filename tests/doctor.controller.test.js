import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDoctor: vi.fn(),
  getDoctorById: vi.fn(),
  updateDoctor: vi.fn(),
  updateDoctorByAdmin: vi.fn(),
  updateDoctorStatus: vi.fn(),
  getDoctors: vi.fn(),
  getActiveDoctorsByClinic: vi.fn(),
  getActiveDoctorsBySpecialty: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/doctor.service.js", () => ({
  createDoctor: mocks.createDoctor,
  getDoctorById: mocks.getDoctorById,
  updateDoctor: mocks.updateDoctor,
  updateDoctorByAdmin: mocks.updateDoctorByAdmin,
  updateDoctorStatus: mocks.updateDoctorStatus,
  getDoctors: mocks.getDoctors,
  getActiveDoctorsByClinic: mocks.getActiveDoctorsByClinic,
  getActiveDoctorsBySpecialty: mocks.getActiveDoctorsBySpecialty,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createDoctor,
  getDoctorById,
  updateDoctor,
  updateDoctorByAdmin,
  updateDoctorStatus,
  getDoctors,
  getActiveDoctorsByClinic,
  getActiveDoctorsBySpecialty,
} from "../src/controllers/doctor.controller.js";

describe("Doctor Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        userId: "user-id",
      },
      file: {
        filename: "doctor-profile.jpg",
      },
      validated: {
        body: {
          firstName: "Ali",
          lastName: "Ahmadi",
          specialty: "specialty-id",
          status: "active",
        },
        params: {
          doctorId: "doctor-id",
          clinicId: "clinic-id",
          specialtyId: "specialty-id",
        },
        query: {
          status: "active",
          page: 1,
          limit: 10,
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createDoctor", () => {
    it("should create a doctor successfully", async () => {
      const doctor = { _id: "doctor-id" };

      mocks.createDoctor.mockResolvedValueOnce(doctor);

      await createDoctor(req, res, next);

      expect(mocks.createDoctor).toHaveBeenCalledWith(
        "user-id",
        req.validated.body,
        req.file,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Doctor application submitted successfully",
        data: { doctor },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor creation failed");
      mocks.createDoctor.mockRejectedValueOnce(error);

      await createDoctor(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getDoctorById", () => {
    it("should retrieve a doctor by ID successfully", async () => {
      const doctor = { _id: "doctor-id" };

      mocks.getDoctorById.mockResolvedValueOnce(doctor);

      await getDoctorById(req, res, next);

      expect(mocks.getDoctorById).toHaveBeenCalledWith("doctor-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor retrieved successfully",
        data: { doctor },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor retrieval failed");
      mocks.getDoctorById.mockRejectedValueOnce(error);

      await getDoctorById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateDoctor", () => {
    it("should update the doctor's profile successfully", async () => {
      const doctor = { _id: "doctor-id" };

      mocks.updateDoctor.mockResolvedValueOnce(doctor);

      await updateDoctor(req, res, next);

      expect(mocks.updateDoctor).toHaveBeenCalledWith(
        "user-id",
        req.validated.body,
        req.file,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor profile updated successfully",
        data: { doctor },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor update failed");
      mocks.updateDoctor.mockRejectedValueOnce(error);

      await updateDoctor(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateDoctorByAdmin", () => {
    it("should update a doctor's profile by admin successfully", async () => {
      const doctor = { _id: "doctor-id" };

      mocks.updateDoctorByAdmin.mockResolvedValueOnce(doctor);

      await updateDoctorByAdmin(req, res, next);

      expect(mocks.updateDoctorByAdmin).toHaveBeenCalledWith(
        "doctor-id",
        req.validated.body,
        req.file,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor profile updated successfully",
        data: { doctor },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Admin doctor update failed");
      mocks.updateDoctorByAdmin.mockRejectedValueOnce(error);

      await updateDoctorByAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateDoctorStatus", () => {
    it("should update doctor status successfully", async () => {
      const doctor = { _id: "doctor-id", status: "active" };

      mocks.updateDoctorStatus.mockResolvedValueOnce(doctor);

      await updateDoctorStatus(req, res, next);

      expect(mocks.updateDoctorStatus).toHaveBeenCalledWith(
        "doctor-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor status updated successfully",
        data: { doctor },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor status update failed");
      mocks.updateDoctorStatus.mockRejectedValueOnce(error);

      await updateDoctorStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getDoctors", () => {
    it("should retrieve doctors successfully", async () => {
      const result = {
        doctors: [{ _id: "doctor-id" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getDoctors.mockResolvedValueOnce(result);

      await getDoctors(req, res, next);

      expect(mocks.getDoctors).toHaveBeenCalledWith(
        "active",
        1,
        10,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctors retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctors retrieval failed");
      mocks.getDoctors.mockRejectedValueOnce(error);

      await getDoctors(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getActiveDoctorsByClinic", () => {
    it("should retrieve active doctors by clinic successfully", async () => {
      const result = {
        doctors: [{ _id: "doctor-id" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getActiveDoctorsByClinic.mockResolvedValueOnce(result);

      await getActiveDoctorsByClinic(req, res, next);

      expect(mocks.getActiveDoctorsByClinic).toHaveBeenCalledWith(
        "clinic-id",
        1,
        10,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctors retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Clinic doctors retrieval failed");
      mocks.getActiveDoctorsByClinic.mockRejectedValueOnce(error);

      await getActiveDoctorsByClinic(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getActiveDoctorsBySpecialty", () => {
    it("should retrieve active doctors by specialty successfully", async () => {
      const result = {
        doctors: [{ _id: "doctor-id" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getActiveDoctorsBySpecialty.mockResolvedValueOnce(result);

      await getActiveDoctorsBySpecialty(req, res, next);

      expect(mocks.getActiveDoctorsBySpecialty).toHaveBeenCalledWith(
        "specialty-id",
        1,
        10,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctors retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Specialty doctors retrieval failed");
      mocks.getActiveDoctorsBySpecialty.mockRejectedValueOnce(error);

      await getActiveDoctorsBySpecialty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});