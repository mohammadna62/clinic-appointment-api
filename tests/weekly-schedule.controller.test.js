import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  createWeeklySchedule,
  getWeeklySchedules,
  updateWeeklySchedule,
  deleteWeeklySchedule,
} from "../src/controllers/weekly-schedule.controller.js";

import {
  createWeeklySchedule as createWeeklyScheduleService,
  getWeeklySchedules as getWeeklySchedulesService,
  updateWeeklySchedule as updateWeeklyScheduleService,
  deleteWeeklySchedule as deleteWeeklyScheduleService,
} from "../src/services/weekly-schedule.service.js";

import { successResponse } from "../src/helpers/response.js";

vi.mock("../src/services/weekly-schedule.service.js", () => ({
  createWeeklySchedule: vi.fn(),
  getWeeklySchedules: vi.fn(),
  updateWeeklySchedule: vi.fn(),
  deleteWeeklySchedule: vi.fn(),
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: vi.fn(),
}));

describe("Weekly Schedule Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        params: {
          clinicId: "clinic-123",
          scheduleId: "schedule-123",
        },
        body: {
          dayOfWeek: "monday",
          morningStart: "08:00",
          morningEnd: "12:00",
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createWeeklySchedule", () => {
    it("should create a weekly schedule successfully", async () => {
      const schedule = { _id: "schedule-123" };

      createWeeklyScheduleService.mockResolvedValue(schedule);

      await createWeeklySchedule(req, res, next);

      expect(createWeeklyScheduleService).toHaveBeenCalledWith(
        "clinic-123",
        req.validated.body,
      );

      expect(successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Weekly schedule created successfully",
        data: { schedule },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with an error when creation fails", async () => {
      const error = new Error("Creation failed");

      createWeeklyScheduleService.mockRejectedValue(error);

      await createWeeklySchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getWeeklySchedules", () => {
    it("should retrieve weekly schedules successfully", async () => {
      const schedules = [{ _id: "schedule-123" }];

      getWeeklySchedulesService.mockResolvedValue(schedules);

      await getWeeklySchedules(req, res, next);

      expect(getWeeklySchedulesService).toHaveBeenCalledWith(
        "clinic-123",
      );

      expect(successResponse).toHaveBeenCalledWith(res, {
        message: "Weekly schedules retrieved successfully",
        data: { schedules },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with an error when retrieval fails", async () => {
      const error = new Error("Retrieval failed");

      getWeeklySchedulesService.mockRejectedValue(error);

      await getWeeklySchedules(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateWeeklySchedule", () => {
    it("should update a weekly schedule successfully", async () => {
      const schedule = { _id: "schedule-123" };

      updateWeeklyScheduleService.mockResolvedValue(schedule);

      await updateWeeklySchedule(req, res, next);

      expect(updateWeeklyScheduleService).toHaveBeenCalledWith(
        "clinic-123",
        "schedule-123",
        req.validated.body,
      );

      expect(successResponse).toHaveBeenCalledWith(res, {
        message: "Weekly schedule updated successfully",
        data: { schedule },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with an error when update fails", async () => {
      const error = new Error("Update failed");

      updateWeeklyScheduleService.mockRejectedValue(error);

      await updateWeeklySchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(successResponse).not.toHaveBeenCalled();
    });
  });

  describe("deleteWeeklySchedule", () => {
    it("should delete a weekly schedule successfully", async () => {
      const schedule = { _id: "schedule-123" };

      deleteWeeklyScheduleService.mockResolvedValue(schedule);

      await deleteWeeklySchedule(req, res, next);

      expect(deleteWeeklyScheduleService).toHaveBeenCalledWith(
        "clinic-123",
        "schedule-123",
      );

      expect(successResponse).toHaveBeenCalledWith(res, {
        message: "Weekly schedule deleted successfully",
        data: { schedule },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with an error when deletion fails", async () => {
      const error = new Error("Deletion failed");

      deleteWeeklyScheduleService.mockRejectedValue(error);

      await deleteWeeklySchedule(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(successResponse).not.toHaveBeenCalled();
    });
  });
});