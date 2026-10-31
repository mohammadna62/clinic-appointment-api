import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClinic: vi.fn(),
  getClinics: vi.fn(),
  getClinicById: vi.fn(),
  updateClinic: vi.fn(),
  updateClinicStatus: vi.fn(),
  getActiveClinics: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/clinic.service.js", () => ({
  createClinic: mocks.createClinic,
  getClinics: mocks.getClinics,
  getClinicById: mocks.getClinicById,
  updateClinic: mocks.updateClinic,
  updateClinicStatus: mocks.updateClinicStatus,
  getActiveClinics: mocks.getActiveClinics,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  updateClinicStatus,
  getActiveClinics,
} from "../src/controllers/clinic.controller.js";

describe("Clinic Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        body: {
          name: "Main Clinic",
          description: "Main medical clinic",
          isActive: false,
        },
        params: {
          clinicId: "clinic-id",
        },
        query: {
          page: 1,
          limit: 10,
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createClinic", () => {
    it("should create a clinic successfully", async () => {
      const clinic = {
        _id: "clinic-id",
        name: "Main Clinic",
        description: "Main medical clinic",
      };

      mocks.createClinic.mockResolvedValueOnce(clinic);

      await createClinic(req, res, next);

      expect(mocks.createClinic).toHaveBeenCalledWith(
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Clinic created successfully",
        data: { clinic },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Clinic creation failed");

      mocks.createClinic.mockRejectedValueOnce(error);

      await createClinic(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getClinics", () => {
    it("should retrieve clinics successfully", async () => {
      const result = {
        clinics: [{ _id: "clinic-id", name: "Main Clinic" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getClinics.mockResolvedValueOnce(result);

      await getClinics(req, res, next);

      expect(mocks.getClinics).toHaveBeenCalledWith(1, 10);

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Clinics retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Clinics retrieval failed");

      mocks.getClinics.mockRejectedValueOnce(error);

      await getClinics(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getClinicById", () => {
    it("should retrieve a clinic by ID successfully", async () => {
      const clinic = {
        _id: "clinic-id",
        name: "Main Clinic",
      };

      mocks.getClinicById.mockResolvedValueOnce(clinic);

      await getClinicById(req, res, next);

      expect(mocks.getClinicById).toHaveBeenCalledWith("clinic-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Clinic retrieved successfully",
        data: { clinic },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Clinic not found");

      mocks.getClinicById.mockRejectedValueOnce(error);

      await getClinicById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateClinic", () => {
    it("should update a clinic successfully", async () => {
      const clinic = {
        _id: "clinic-id",
        name: "Updated Clinic",
        description: "Updated description",
      };

      mocks.updateClinic.mockResolvedValueOnce(clinic);

      await updateClinic(req, res, next);

      expect(mocks.updateClinic).toHaveBeenCalledWith(
        "clinic-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Clinic updated successfully",
        data: { clinic },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Clinic update failed");

      mocks.updateClinic.mockRejectedValueOnce(error);

      await updateClinic(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateClinicStatus", () => {
    it("should update clinic status successfully", async () => {
      const clinic = {
        _id: "clinic-id",
        name: "Main Clinic",
        isActive: false,
      };

      mocks.updateClinicStatus.mockResolvedValueOnce(clinic);

      await updateClinicStatus(req, res, next);

      expect(mocks.updateClinicStatus).toHaveBeenCalledWith(
        "clinic-id",
        false,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Clinic status updated successfully",
        data: { clinic },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Clinic status update failed");

      mocks.updateClinicStatus.mockRejectedValueOnce(error);

      await updateClinicStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getActiveClinics", () => {
    it("should retrieve active clinics successfully", async () => {
      const result = {
        clinics: [{ _id: "clinic-id", name: "Main Clinic" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getActiveClinics.mockResolvedValueOnce(result);

      await getActiveClinics(req, res, next);

      expect(mocks.getActiveClinics).toHaveBeenCalledWith(1, 10);

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Clinics retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Active clinics retrieval failed");

      mocks.getActiveClinics.mockRejectedValueOnce(error);

      await getActiveClinics(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});