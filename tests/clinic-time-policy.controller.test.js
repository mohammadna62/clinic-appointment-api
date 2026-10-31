import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClinicTimePolicy: vi.fn(),
  getClinicTimePolicy: vi.fn(),
  updateClinicTimePolicy: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/clinic-time-policy.service.js", () => ({
  createClinicTimePolicy: mocks.createClinicTimePolicy,
  getClinicTimePolicy: mocks.getClinicTimePolicy,
  updateClinicTimePolicy: mocks.updateClinicTimePolicy,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createClinicTimePolicy,
  getClinicTimePolicy,
  updateClinicTimePolicy,
} from "../src/controllers/clinic-time-policy.controller.js";

describe("Clinic Time Policy Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        params: {
          clinicId: "clinic-id",
        },
        body: {
          morningStart: "08:00",
          morningEnd: "12:00",
          eveningStart: "16:00",
          eveningEnd: "20:00",
          appointmentDuration: 30,
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createClinicTimePolicy", () => {
    it("should create clinic time policy successfully", async () => {
      const policy = {
        _id: "policy-id",
        clinic: "clinic-id",
        ...req.validated.body,
      };

      mocks.createClinicTimePolicy.mockResolvedValueOnce(policy);

      await createClinicTimePolicy(req, res, next);

      expect(mocks.createClinicTimePolicy).toHaveBeenCalledWith(
        "clinic-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Clinic time policy created successfully",
        data: {
          policy,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass service errors to next", async () => {
      const error = new Error("Clinic time policy creation failed");

      mocks.createClinicTimePolicy.mockRejectedValueOnce(error);

      await createClinicTimePolicy(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getClinicTimePolicy", () => {
    it("should retrieve clinic time policy successfully", async () => {
      const policy = {
        _id: "policy-id",
        clinic: "clinic-id",
        ...req.validated.body,
      };

      mocks.getClinicTimePolicy.mockResolvedValueOnce(policy);

      await getClinicTimePolicy(req, res, next);

      expect(mocks.getClinicTimePolicy).toHaveBeenCalledWith("clinic-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Clinic time policy retrieved successfully",
        data: {
          policy,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass service errors to next", async () => {
      const error = new Error("Clinic time policy not found");

      mocks.getClinicTimePolicy.mockRejectedValueOnce(error);

      await getClinicTimePolicy(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateClinicTimePolicy", () => {
    it("should update clinic time policy successfully", async () => {
      const policy = {
        _id: "policy-id",
        clinic: "clinic-id",
        ...req.validated.body,
      };

      mocks.updateClinicTimePolicy.mockResolvedValueOnce(policy);

      await updateClinicTimePolicy(req, res, next);

      expect(mocks.updateClinicTimePolicy).toHaveBeenCalledWith(
        "clinic-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Clinic time policy updated successfully",
        data: {
          policy,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass service errors to next", async () => {
      const error = new Error("Clinic time policy update failed");

      mocks.updateClinicTimePolicy.mockRejectedValueOnce(error);

      await updateClinicTimePolicy(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});