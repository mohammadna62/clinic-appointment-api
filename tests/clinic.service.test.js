import { beforeEach, describe, expect, it, vi } from "vitest";

import Clinic from "../src/models/clinic.model.js";
import AppError from "../src/errors/app-error.js";

import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  updateClinicStatus,
  getActiveClinics,
} from "../src/services/clinic.service.js";

vi.mock("../src/models/clinic.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

describe("Clinic Service", () => {
  const clinicId = "clinic-123";

  const clinicData = {
    name: "Tehran Clinic",
    description: "General medical clinic",
  };

  let findQuery;

  beforeEach(() => {
    vi.clearAllMocks();

    findQuery = {
      sort: vi.fn(),
      skip: vi.fn(),
      limit: vi.fn(),
    };

    findQuery.sort.mockReturnValue(findQuery);
    findQuery.skip.mockReturnValue(findQuery);
    findQuery.limit.mockResolvedValue([]);

    Clinic.find.mockReturnValue(findQuery);
  });

  describe("createClinic", () => {
    it("should create a clinic when the name does not exist", async () => {
      const createdClinic = {
        _id: clinicId,
        ...clinicData,
      };

      Clinic.findOne.mockResolvedValue(null);
      Clinic.create.mockResolvedValue(createdClinic);

      const result = await createClinic(clinicData);

      expect(Clinic.findOne).toHaveBeenCalledWith({
        name: clinicData.name,
      });

      expect(Clinic.create).toHaveBeenCalledWith(clinicData);
      expect(result).toBe(createdClinic);
    });

    it("should throw 409 when the clinic name already exists", async () => {
      Clinic.findOne.mockResolvedValue({
        _id: clinicId,
        ...clinicData,
      });

      await expect(createClinic(clinicData)).rejects.toMatchObject({
        statusCode: 409,
        message: "Clinic already exists",
      });

      expect(Clinic.create).not.toHaveBeenCalled();
    });
  });

  describe("getClinics", () => {
    it("should return paginated clinics", async () => {
      const clinics = [
        { _id: "clinic-1", name: "Clinic One" },
        { _id: "clinic-2", name: "Clinic Two" },
      ];

      const totalCount = 12;

      findQuery.limit.mockResolvedValue(clinics);
      Clinic.countDocuments.mockResolvedValue(totalCount);

      const result = await getClinics(2, 5);

      expect(Clinic.find).toHaveBeenCalledOnce();
      expect(findQuery.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });
      expect(findQuery.skip).toHaveBeenCalledWith(5);
      expect(findQuery.limit).toHaveBeenCalledWith(5);

      expect(Clinic.countDocuments).toHaveBeenCalledWith();

      expect(result).toEqual({
        clinics,
        pagination: {
          page: 2,
          limit: 5,
          total: 12,
          totalPages: 3,
        },
      });
    });
  });

  describe("getClinicById", () => {
    it("should return the clinic when it exists", async () => {
      const clinic = {
        _id: clinicId,
        ...clinicData,
      };

      Clinic.findById.mockResolvedValue(clinic);

      const result = await getClinicById(clinicId);

      expect(Clinic.findById).toHaveBeenCalledWith(clinicId);
      expect(result).toBe(clinic);
    });

    it("should throw 404 when the clinic does not exist", async () => {
      Clinic.findById.mockResolvedValue(null);

      await expect(getClinicById(clinicId)).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });
    });
  });

  describe("updateClinic", () => {
    it("should update the clinic successfully", async () => {
      const updatedClinic = {
        _id: clinicId,
        name: "Updated Clinic",
        description: "Updated description",
      };

      Clinic.findOne.mockResolvedValue(null);
      Clinic.findByIdAndUpdate.mockResolvedValue(updatedClinic);

      const updateData = {
        name: "Updated Clinic",
        description: "Updated description",
      };

      const result = await updateClinic(clinicId, updateData);

      expect(Clinic.findOne).toHaveBeenCalledWith({
        name: updateData.name,
        _id: { $ne: clinicId },
      });

      expect(Clinic.findByIdAndUpdate).toHaveBeenCalledWith(
        clinicId,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toBe(updatedClinic);
    });

    it("should throw 409 when the new name belongs to another clinic", async () => {
      Clinic.findOne.mockResolvedValue({
        _id: "another-clinic",
        name: "Existing Clinic",
      });

      await expect(
        updateClinic(clinicId, {
          name: "Existing Clinic",
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Clinic already exists",
      });

      expect(Clinic.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should update only the description without checking duplicate names", async () => {
      const updatedClinic = {
        _id: clinicId,
        name: clinicData.name,
        description: "New description",
      };

      Clinic.findByIdAndUpdate.mockResolvedValue(updatedClinic);

      const result = await updateClinic(clinicId, {
        description: "New description",
      });

      expect(Clinic.findOne).not.toHaveBeenCalled();

      expect(Clinic.findByIdAndUpdate).toHaveBeenCalledWith(
        clinicId,
        {
          description: "New description",
        },
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toBe(updatedClinic);
    });

    it("should throw 404 when the clinic to update does not exist", async () => {
      Clinic.findOne.mockResolvedValue(null);
      Clinic.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        updateClinic(clinicId, {
          name: "Updated Clinic",
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });
    });
  });

  describe("updateClinicStatus", () => {
    it("should update the clinic status", async () => {
      const updatedClinic = {
        _id: clinicId,
        isActive: false,
      };

      Clinic.findByIdAndUpdate.mockResolvedValue(updatedClinic);

      const result = await updateClinicStatus(clinicId, false);

      expect(Clinic.findByIdAndUpdate).toHaveBeenCalledWith(
        clinicId,
        { isActive: false },
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toBe(updatedClinic);
    });

    it("should throw 404 when the clinic does not exist", async () => {
      Clinic.findByIdAndUpdate.mockResolvedValue(null);

      await expect(updateClinicStatus(clinicId, false)).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });
    });
  });

  describe("getActiveClinics", () => {
    it("should return only active clinics with pagination", async () => {
      const clinics = [
        { _id: "clinic-1", name: "Active Clinic", isActive: true },
      ];

      findQuery.limit.mockResolvedValue(clinics);
      Clinic.countDocuments.mockResolvedValue(6);

      const result = await getActiveClinics(2, 5);

      expect(Clinic.find).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(findQuery.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(findQuery.skip).toHaveBeenCalledWith(5);
      expect(findQuery.limit).toHaveBeenCalledWith(5);

      expect(Clinic.countDocuments).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(result).toEqual({
        clinics,
        pagination: {
          page: 2,
          limit: 5,
          total: 6,
          totalPages: 2,
        },
      });
    });
  });
});
