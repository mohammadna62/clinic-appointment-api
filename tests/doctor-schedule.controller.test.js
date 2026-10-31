import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createDoctorSchedule: vi.fn(),
  getDoctorSchedules: vi.fn(),
  updateDoctorSchedule: vi.fn(),
  deleteDoctorSchedule: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/doctor-schedule.service.js", () => ({
  createDoctorSchedule: mocks.createDoctorSchedule,
  getDoctorSchedules: mocks.getDoctorSchedules,
  updateDoctorSchedule: mocks.updateDoctorSchedule,
  deleteDoctorSchedule: mocks.deleteDoctorSchedule,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createDoctorSchedule,
  getDoctorSchedules,
  updateDoctorSchedule,
  deleteDoctorSchedule,
  getDoctorSchedulesForPatient,
} from "../src/controllers/doctor-schedule.controller.js";

describe("Doctor Schedule Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        params: {
          doctorId: "doctor-id",
          scheduleId: "schedule-id",
        },
        body: {
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "17:00",
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createDoctorSchedule", () => {
    it("should create a doctor schedule successfully", async () => {
      const schedule = { _id: "schedule-id" };

      mocks.createDoctorSchedule.mockResolvedValueOnce(schedule);

      await createDoctorSchedule(req, res, next);

      expect(mocks.createDoctorSchedule).toHaveBeenCalledWith(
        "doctor-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Doctor schedule created successfully",
        data: { schedule },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Schedule creation failed");

      mocks.createDoctorSchedule.mockRejectedValueOnce(error);

      await createDoctorSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getDoctorSchedules", () => {
    it("should retrieve doctor schedules successfully", async () => {
      const schedules = [{ _id: "schedule-id" }];

      mocks.getDoctorSchedules.mockResolvedValueOnce(schedules);

      await getDoctorSchedules(req, res, next);

      expect(mocks.getDoctorSchedules).toHaveBeenCalledWith("doctor-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor schedules retrieved successfully",
        data: { schedules },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Schedules retrieval failed");

      mocks.getDoctorSchedules.mockRejectedValueOnce(error);

      await getDoctorSchedules(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateDoctorSchedule", () => {
    it("should update a doctor schedule successfully", async () => {
      const schedule = { _id: "schedule-id" };

      mocks.updateDoctorSchedule.mockResolvedValueOnce(schedule);

      await updateDoctorSchedule(req, res, next);

      expect(mocks.updateDoctorSchedule).toHaveBeenCalledWith(
        "doctor-id",
        "schedule-id",
        req.validated.body,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor schedule updated successfully",
        data: { schedule },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Schedule update failed");

      mocks.updateDoctorSchedule.mockRejectedValueOnce(error);

      await updateDoctorSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("deleteDoctorSchedule", () => {
    it("should delete a doctor schedule successfully", async () => {
      const schedule = { _id: "schedule-id" };

      mocks.deleteDoctorSchedule.mockResolvedValueOnce(schedule);

      await deleteDoctorSchedule(req, res, next);

      expect(mocks.deleteDoctorSchedule).toHaveBeenCalledWith(
        "doctor-id",
        "schedule-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor schedule deleted successfully",
        data: { schedule },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Schedule deletion failed");

      mocks.deleteDoctorSchedule.mockRejectedValueOnce(error);

      await deleteDoctorSchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getDoctorSchedulesForPatient", () => {
    it("should retrieve doctor schedules for patient successfully", async () => {
      const schedules = [{ _id: "schedule-id" }];

      mocks.getDoctorSchedules.mockResolvedValueOnce(schedules);

      await getDoctorSchedulesForPatient(req, res, next);

      expect(mocks.getDoctorSchedules).toHaveBeenCalledWith("doctor-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor schedules retrieved successfully",
        data: { schedules },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Schedules retrieval failed");

      mocks.getDoctorSchedules.mockRejectedValueOnce(error);

      await getDoctorSchedulesForPatient(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});