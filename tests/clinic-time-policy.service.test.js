import { beforeEach, describe, expect, it, vi } from "vitest";

import Clinic from "../src/models/clinic.model.js";
import ClinicTimePolicy from "../src/models/clinic-time-policy.model.js";
import AppError from "../src/errors/app-error.js";

import {
  createClinicTimePolicy,
  getClinicTimePolicy,
  updateClinicTimePolicy,
} from "../src/services/clinic-time-policy.service.js";

vi.mock("../src/models/clinic.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/clinic-time-policy.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

describe("Clinic Time Policy Service", () => {
  const clinicId = "clinic-123";

  const validPolicyData = {
    morningStart: "08:00",
    morningEnd: "12:00",
    eveningStart: "14:00",
    eveningEnd: "18:00",
    appointmentDuration: 30,
  };

  let existingPolicy;

  beforeEach(() => {
    vi.clearAllMocks();

    existingPolicy = {
      clinic: clinicId,
      ...validPolicyData,
      save: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("createClinicTimePolicy", () => {
    it("should create a policy for an existing clinic", async () => {
      const createdPolicy = {
        clinic: clinicId,
        ...validPolicyData,
      };

      Clinic.findById.mockResolvedValue({ _id: clinicId });
      ClinicTimePolicy.findOne.mockResolvedValue(null);
      ClinicTimePolicy.create.mockResolvedValue(createdPolicy);

      const result = await createClinicTimePolicy(clinicId, validPolicyData);

      expect(Clinic.findById).toHaveBeenCalledWith(clinicId);
      expect(ClinicTimePolicy.findOne).toHaveBeenCalledWith({
        clinic: clinicId,
      });
      expect(ClinicTimePolicy.create).toHaveBeenCalledWith({
        clinic: clinicId,
        ...validPolicyData,
      });
      expect(result).toBe(createdPolicy);
    });

    it("should throw 404 if the clinic does not exist", async () => {
      Clinic.findById.mockResolvedValue(null);

      await expect(
        createClinicTimePolicy(clinicId, validPolicyData),
      ).rejects.toThrow(AppError);

      await expect(
        createClinicTimePolicy(clinicId, validPolicyData),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });

      expect(ClinicTimePolicy.findOne).not.toHaveBeenCalled();
      expect(ClinicTimePolicy.create).not.toHaveBeenCalled();
    });

    it("should throw 409 if the clinic already has a policy", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      ClinicTimePolicy.findOne.mockResolvedValue(existingPolicy);

      await expect(
        createClinicTimePolicy(clinicId, validPolicyData),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Clinic time policy already exists",
      });

      expect(ClinicTimePolicy.create).not.toHaveBeenCalled();
    });

    it("should reject a morning schedule whose start is after its end", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      const invalidData = {
        ...validPolicyData,
        morningStart: "12:00",
        morningEnd: "08:00",
      };

      await expect(
        createClinicTimePolicy(clinicId, invalidData),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Morning start time must be before morning end time",
      });

      expect(ClinicTimePolicy.create).not.toHaveBeenCalled();
    });

    it("should reject an evening schedule whose start is after its end", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      const invalidData = {
        ...validPolicyData,
        eveningStart: "18:00",
        eveningEnd: "14:00",
      };

      await expect(
        createClinicTimePolicy(clinicId, invalidData),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Evening start time must be before evening end time",
      });

      expect(ClinicTimePolicy.create).not.toHaveBeenCalled();
    });

    it("should reject overlapping morning and evening schedules", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      const invalidData = {
        ...validPolicyData,
        morningEnd: "15:00",
        eveningStart: "14:00",
      };

      await expect(
        createClinicTimePolicy(clinicId, invalidData),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Morning and evening schedules cannot overlap",
      });

      expect(ClinicTimePolicy.create).not.toHaveBeenCalled();
    });
  });

  describe("getClinicTimePolicy", () => {
    it("should return the clinic time policy", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(existingPolicy);

      const result = await getClinicTimePolicy(clinicId);

      expect(ClinicTimePolicy.findOne).toHaveBeenCalledWith({
        clinic: clinicId,
      });
      expect(result).toBe(existingPolicy);
    });

    it("should throw 404 if the policy does not exist", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      await expect(getClinicTimePolicy(clinicId)).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic time policy not found",
      });
    });
  });

  describe("updateClinicTimePolicy", () => {
    it("should update the policy and save it", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(existingPolicy);

      const updateData = {
        morningStart: "07:00",
        appointmentDuration: 20,
      };

      const result = await updateClinicTimePolicy(clinicId, updateData);

      expect(existingPolicy.morningStart).toBe("07:00");
      expect(existingPolicy.morningEnd).toBe("12:00");
      expect(existingPolicy.eveningStart).toBe("14:00");
      expect(existingPolicy.eveningEnd).toBe("18:00");
      expect(existingPolicy.appointmentDuration).toBe(20);
      expect(existingPolicy.save).toHaveBeenCalledOnce();
      expect(result).toBe(existingPolicy);
    });

    it("should throw 404 if the policy does not exist", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      await expect(
        updateClinicTimePolicy(clinicId, {
          morningStart: "07:00",
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic time policy not found",
      });
    });

    it("should reject an update that makes the morning schedule invalid", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(existingPolicy);

      await expect(
        updateClinicTimePolicy(clinicId, {
          morningStart: "13:00",
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Morning start time must be before morning end time",
      });

      expect(existingPolicy.save).not.toHaveBeenCalled();
    });

    it("should reject an update that makes the evening schedule invalid", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(existingPolicy);

      await expect(
        updateClinicTimePolicy(clinicId, {
          eveningEnd: "13:00",
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Evening start time must be before evening end time",
      });

      expect(existingPolicy.save).not.toHaveBeenCalled();
    });

    it("should reject an update that causes the schedules to overlap", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(existingPolicy);

      await expect(
        updateClinicTimePolicy(clinicId, {
          morningEnd: "15:00",
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Morning and evening schedules cannot overlap",
      });

      expect(existingPolicy.save).not.toHaveBeenCalled();
    });
  });
});
