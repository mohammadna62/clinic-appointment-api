import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSpecialty: vi.fn(),
  getSpecialties: vi.fn(),
  getSpecialtyById: vi.fn(),
  updateSpecialty: vi.fn(),
  getActiveSpecialties: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/specialty.service.js", () => ({
  createSpecialty: mocks.createSpecialty,
  getSpecialties: mocks.getSpecialties,
  getSpecialtyById: mocks.getSpecialtyById,
  updateSpecialty: mocks.updateSpecialty,
  getActiveSpecialties: mocks.getActiveSpecialties,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createSpecialty,
  getSpecialties,
  getSpecialtyById,
  updateSpecialty,
  getActiveSpecialties,
} from "../src/controllers/specialty.controller.js";

describe("Specialty Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        body: {
          name: "Cardiology",
          description: "Heart-related medical specialty",
        },
        params: {
          specialtyId: "specialty-id",
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

  describe("createSpecialty", () => {
    it("should create a specialty successfully", async () => {
      const specialty = {
        _id: "specialty-id",
        name: "Cardiology",
      };

      mocks.createSpecialty.mockResolvedValueOnce(specialty);

      await createSpecialty(req, res, next);

      expect(mocks.createSpecialty).toHaveBeenCalledWith(
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Specialty created successfully",
        data: { specialty },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Specialty creation failed");
      mocks.createSpecialty.mockRejectedValueOnce(error);

      await createSpecialty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getSpecialties", () => {
    it("should retrieve specialties successfully", async () => {
      const result = {
        specialties: [{ _id: "specialty-id", name: "Cardiology" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getSpecialties.mockResolvedValueOnce(result);

      await getSpecialties(req, res, next);

      expect(mocks.getSpecialties).toHaveBeenCalledWith(1, 10);

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: " Specialties retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Specialties retrieval failed");
      mocks.getSpecialties.mockRejectedValueOnce(error);

      await getSpecialties(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getSpecialtyById", () => {
    it("should retrieve a specialty by ID successfully", async () => {
      const specialty = {
        _id: "specialty-id",
        name: "Cardiology",
      };

      mocks.getSpecialtyById.mockResolvedValueOnce(specialty);

      await getSpecialtyById(req, res, next);

      expect(mocks.getSpecialtyById).toHaveBeenCalledWith(
        "specialty-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Specialty retrieved successfully",
        data: { specialty },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Specialty retrieval failed");
      mocks.getSpecialtyById.mockRejectedValueOnce(error);

      await getSpecialtyById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateSpecialty", () => {
    it("should update a specialty successfully", async () => {
      const specialty = {
        _id: "specialty-id",
        name: "Updated Cardiology",
      };

      mocks.updateSpecialty.mockResolvedValueOnce(specialty);

      await updateSpecialty(req, res, next);

      expect(mocks.updateSpecialty).toHaveBeenCalledWith(
        "specialty-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Specialty updated successfully",
        data: { specialty },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Specialty update failed");
      mocks.updateSpecialty.mockRejectedValueOnce(error);

      await updateSpecialty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getActiveSpecialties", () => {
    it("should retrieve active specialties successfully", async () => {
      const result = {
        specialties: [{ _id: "specialty-id", name: "Cardiology" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getActiveSpecialties.mockResolvedValueOnce(result);

      await getActiveSpecialties(req, res, next);

      expect(mocks.getActiveSpecialties).toHaveBeenCalledWith(1, 10);

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Specialties retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Active specialties retrieval failed");
      mocks.getActiveSpecialties.mockRejectedValueOnce(error);

      await getActiveSpecialties(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});