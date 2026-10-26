
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const query = {
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
  };

  query.sort.mockImplementation(() => query);
  query.skip.mockImplementation(() => query);

  return {
    query,
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  };
});

vi.mock("../src/models/specialty.model.js", () => ({
  default: {
    findOne: mocks.findOne,
    create: mocks.create,
    find: mocks.find,
    countDocuments: mocks.countDocuments,
    findById: mocks.findById,
    findByIdAndUpdate: mocks.findByIdAndUpdate,
  },
}));

import {
  createSpecialty,
  getSpecialties,
  getSpecialtyById,
  updateSpecialty,
  getActiveSpecialties,
} from "../src/services/specialty.service.js";

describe("specialty service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.find.mockReturnValue(mocks.query);

    mocks.query.sort.mockReturnValue(mocks.query);
    mocks.query.skip.mockReturnValue(mocks.query);
    mocks.query.limit.mockResolvedValue([]);
  });

  describe("createSpecialty", () => {
    it("should create a specialty when the name does not exist", async () => {
      const data = {
        name: "Cardiology",
        description: "Heart specialist",
      };

      const specialty = { _id: "specialty-1", ...data };

      mocks.findOne.mockResolvedValue(null);
      mocks.create.mockResolvedValue(specialty);

      const result = await createSpecialty(data);

      expect(mocks.findOne).toHaveBeenCalledWith({
        name: "Cardiology",
      });

      expect(mocks.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(specialty);
    });

    it("should throw 409 when the specialty already exists", async () => {
      mocks.findOne.mockResolvedValue({
        _id: "specialty-1",
        name: "Cardiology",
      });

      await expect(
        createSpecialty({
          name: "Cardiology",
          description: "Heart specialist",
        }),
      ).rejects.toMatchObject({
        message: "Specialty already exists",
        statusCode: 409,
      });

      expect(mocks.create).not.toHaveBeenCalled();
    });
  });

  describe("getSpecialties", () => {
    it("should return specialties with pagination data", async () => {
      const specialties = [
        { _id: "specialty-1", name: "Cardiology" },
        { _id: "specialty-2", name: "Neurology" },
      ];

      mocks.query.limit.mockResolvedValue(specialties);
      mocks.countDocuments.mockResolvedValue(5);

      const result = await getSpecialties(2, 2);

      expect(mocks.find).toHaveBeenCalledWith();

      expect(mocks.query.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(mocks.query.skip).toHaveBeenCalledWith(2);
      expect(mocks.query.limit).toHaveBeenCalledWith(2);

      expect(result).toEqual({
        specialties,
        pagination: {
          page: 2,
          limit: 2,
          total: 5,
          totalPages: 3,
        },
      });
    });
  });

  describe("getSpecialtyById", () => {
    it("should return a specialty when it exists", async () => {
      const specialty = {
        _id: "specialty-1",
        name: "Cardiology",
      };

      mocks.findById.mockResolvedValue(specialty);

      const result = await getSpecialtyById("specialty-1");

      expect(mocks.findById).toHaveBeenCalledWith("specialty-1");
      expect(result).toEqual(specialty);
    });

    it("should throw 404 when the specialty does not exist", async () => {
      mocks.findById.mockResolvedValue(null);

      await expect(
        getSpecialtyById("missing-id"),
      ).rejects.toMatchObject({
        message: "Specialty not found",
        statusCode: 404,
      });
    });
  });

  describe("updateSpecialty", () => {
    it("should update a specialty when the name is not duplicated", async () => {
      const updatedSpecialty = {
        _id: "specialty-1",
        name: "Neurology",
        description: "Updated description",
      };

      mocks.findOne.mockResolvedValue(null);
      mocks.findByIdAndUpdate.mockResolvedValue(updatedSpecialty);

      const result = await updateSpecialty("specialty-1", {
        name: "Neurology",
        description: "Updated description",
      });

      expect(mocks.findOne).toHaveBeenCalledWith({
        name: "Neurology",
        _id: { $ne: "specialty-1" },
      });

      expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith(
        "specialty-1",
        {
          name: "Neurology",
          description: "Updated description",
        },
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toEqual(updatedSpecialty);
    });

    it("should throw 409 when another specialty has the same name", async () => {
      mocks.findOne.mockResolvedValue({
        _id: "specialty-2",
        name: "Neurology",
      });

      await expect(
        updateSpecialty("specialty-1", {
          name: "Neurology",
        }),
      ).rejects.toMatchObject({
        message: "Specialty already exists",
        statusCode: 409,
      });

      expect(mocks.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw 404 when the specialty to update does not exist", async () => {
      mocks.findOne.mockResolvedValue(null);
      mocks.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        updateSpecialty("missing-id", {
          description: "Updated description",
        }),
      ).rejects.toMatchObject({
        message: "Specialty not found",
        statusCode: 404,
      });
    });

    it("should update only the description without checking duplicate names", async () => {
      const updatedSpecialty = {
        _id: "specialty-1",
        name: "Cardiology",
        description: "Updated description",
      };

      mocks.findByIdAndUpdate.mockResolvedValue(updatedSpecialty);

      const result = await updateSpecialty("specialty-1", {
        description: "Updated description",
      });

      expect(mocks.findOne).not.toHaveBeenCalled();

      expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith(
        "specialty-1",
        {
          description: "Updated description",
        },
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toEqual(updatedSpecialty);
    });

    it("should update isActive without checking duplicate names", async () => {
      const updatedSpecialty = {
        _id: "specialty-1",
        name: "Cardiology",
        isActive: false,
      };

      mocks.findByIdAndUpdate.mockResolvedValue(updatedSpecialty);

      const result = await updateSpecialty("specialty-1", {
        isActive: false,
      });

      expect(mocks.findOne).not.toHaveBeenCalled();

      expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith(
        "specialty-1",
        {
          isActive: false,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toEqual(updatedSpecialty);
    });
  });

  describe("getActiveSpecialties", () => {
    it("should return only active specialties with pagination", async () => {
      const specialties = [
        {
          _id: "specialty-1",
          name: "Cardiology",
          isActive: true,
        },
      ];

      mocks.query.limit.mockResolvedValue(specialties);
      mocks.countDocuments.mockResolvedValue(1);

      const result = await getActiveSpecialties(1, 10);

      expect(mocks.find).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(mocks.countDocuments).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(mocks.query.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(mocks.query.skip).toHaveBeenCalledWith(0);
      expect(mocks.query.limit).toHaveBeenCalledWith(10);

      expect(result).toEqual({
        specialties,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });
});
