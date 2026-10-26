
import { beforeEach, describe, expect, it, vi } from "vitest";

import WeeklySchedule from "../src/models/weekly-schedule.model.js";
import Clinic from "../src/models/clinic.model.js";
import ClinicTimePolicy from "../src/models/clinic-time-policy.model.js";

import {
  createWeeklySchedule,
  getWeeklySchedules,
  updateWeeklySchedule,
  deleteWeeklySchedule,
} from "../src/services/weekly-schedule.service.js";

vi.mock("../src/models/weekly-schedule.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock("../src/models/clinic.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/clinic-time-policy.model.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

describe("Weekly Schedule Service", () => {
  const clinicId = "clinic-123";
  const scheduleId = "schedule-123";

  const policy = {
    morningStart: "08:00",
    morningEnd: "12:00",
    eveningStart: "14:00",
    eveningEnd: "18:00",
  };

  const validScheduleData = {
    dayOfWeek: 1,
    isActive: true,
    morningStart: "09:00",
    morningEnd: "11:00",
    eveningStart: "15:00",
    eveningEnd: "17:00",
  };

  let schedule;

  beforeEach(() => {
    vi.resetAllMocks();

    schedule = {
      _id: scheduleId,
      clinic: clinicId,
      ...validScheduleData,
      save: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("createWeeklySchedule", () => {
    it("should create a weekly schedule for an existing clinic", async () => {
      const createdSchedule = {
        clinic: clinicId,
        ...validScheduleData,
      };

      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.findOne.mockResolvedValue(null);
      ClinicTimePolicy.findOne.mockResolvedValue(policy);
      WeeklySchedule.create.mockResolvedValue(createdSchedule);

      const result = await createWeeklySchedule(
        clinicId,
        validScheduleData,
      );

      expect(Clinic.findById).toHaveBeenCalledWith(clinicId);
      expect(WeeklySchedule.findOne).toHaveBeenCalledWith({
        clinic: clinicId,
        dayOfWeek: validScheduleData.dayOfWeek,
      });
      expect(ClinicTimePolicy.findOne).toHaveBeenCalledWith({
        clinic: clinicId,
      });
      expect(WeeklySchedule.create).toHaveBeenCalledWith({
        clinic: clinicId,
        ...validScheduleData,
      });
      expect(result).toBe(createdSchedule);
    });

    it("should throw 404 if the clinic does not exist", async () => {
      Clinic.findById.mockResolvedValue(null);

      await expect(
        createWeeklySchedule(clinicId, validScheduleData),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });

      expect(WeeklySchedule.create).not.toHaveBeenCalled();
    });

    it("should throw 409 if a schedule already exists for that day", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.findOne.mockResolvedValue(schedule);

      await expect(
        createWeeklySchedule(clinicId, validScheduleData),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Weekly schedule for this day already exists",
      });

      expect(ClinicTimePolicy.findOne).not.toHaveBeenCalled();
      expect(WeeklySchedule.create).not.toHaveBeenCalled();
    });

    it("should throw 404 if the clinic time policy does not exist", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.findOne.mockResolvedValue(null);
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      await expect(
        createWeeklySchedule(clinicId, validScheduleData),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic time policy not found",
      });

      expect(WeeklySchedule.create).not.toHaveBeenCalled();
    });

    it("should reject a morning period with only one time provided", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.findOne.mockResolvedValue(null);
      ClinicTimePolicy.findOne.mockResolvedValue(policy);

      const invalidData = {
        ...validScheduleData,
        morningEnd: null,
      };

      await expect(
        createWeeklySchedule(clinicId, invalidData),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Morning start and end times must be provided together",
      });

      expect(WeeklySchedule.create).not.toHaveBeenCalled();
    });

    it("should reject a schedule without any working period", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.findOne.mockResolvedValue(null);
      ClinicTimePolicy.findOne.mockResolvedValue(policy);

      const invalidData = {
        dayOfWeek: 1,
        isActive: true,
        morningStart: null,
        morningEnd: null,
        eveningStart: null,
        eveningEnd: null,
      };

      await expect(
        createWeeklySchedule(clinicId, invalidData),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "At least one working period is required",
      });

      expect(WeeklySchedule.create).not.toHaveBeenCalled();
    });

    it("should reject a morning period outside the clinic policy", async () => {
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.findOne.mockResolvedValue(null);
      ClinicTimePolicy.findOne.mockResolvedValue(policy);

      const invalidData = {
        ...validScheduleData,
        morningStart: "07:00",
      };

      await expect(
        createWeeklySchedule(clinicId, invalidData),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Morning schedule is outside clinic time policy",
      });

      expect(WeeklySchedule.create).not.toHaveBeenCalled();
    });

    it("should allow an inactive schedule without validating its working periods", async () => {
      const inactiveData = {
        dayOfWeek: 1,
        isActive: false,
        morningStart: null,
        morningEnd: null,
        eveningStart: null,
        eveningEnd: null,
      };

      const createdSchedule = {
        clinic: clinicId,
        ...inactiveData,
      };

      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.findOne.mockResolvedValue(null);
      ClinicTimePolicy.findOne.mockResolvedValue(policy);
      WeeklySchedule.create.mockResolvedValue(createdSchedule);

      const result = await createWeeklySchedule(
        clinicId,
        inactiveData,
      );

      expect(WeeklySchedule.create).toHaveBeenCalledWith({
        clinic: clinicId,
        ...inactiveData,
      });
      expect(result).toBe(createdSchedule);
    });
  });

  describe("getWeeklySchedules", () => {
    it("should return schedules sorted by day of week", async () => {
      const schedules = [schedule];

      const sort = vi.fn().mockResolvedValue(schedules);
      Clinic.findById.mockResolvedValue({ _id: clinicId });
      WeeklySchedule.find.mockReturnValue({ sort });

      const result = await getWeeklySchedules(clinicId);

      expect(Clinic.findById).toHaveBeenCalledWith(clinicId);
      expect(WeeklySchedule.find).toHaveBeenCalledWith({
        clinic: clinicId,
      });
      expect(sort).toHaveBeenCalledWith({ dayOfWeek: 1 });
      expect(result).toBe(schedules);
    });

    it("should throw 404 if the clinic does not exist", async () => {
      Clinic.findById.mockResolvedValue(null);

      await expect(
        getWeeklySchedules(clinicId),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic not found",
      });

      expect(WeeklySchedule.find).not.toHaveBeenCalled();
    });
  });

  describe("updateWeeklySchedule", () => {
    it("should update the schedule and preserve unspecified fields", async () => {
      WeeklySchedule.findOne.mockResolvedValue(schedule);
      ClinicTimePolicy.findOne.mockResolvedValue(policy);

      const result = await updateWeeklySchedule(
        clinicId,
        scheduleId,
        {
          morningStart: "08:30",
          isActive: true,
        },
      );

      expect(WeeklySchedule.findOne).toHaveBeenCalledWith({
        _id: scheduleId,
        clinic: clinicId,
      });
      expect(schedule.morningStart).toBe("08:30");
      expect(schedule.morningEnd).toBe("11:00");
      expect(schedule.eveningStart).toBe("15:00");
      expect(schedule.eveningEnd).toBe("17:00");
      expect(schedule.isActive).toBe(true);
      expect(schedule.save).toHaveBeenCalledOnce();
      expect(result).toBe(schedule);
    });

    it("should throw 404 if the schedule does not exist", async () => {
      WeeklySchedule.findOne.mockResolvedValue(null);

      await expect(
        updateWeeklySchedule(clinicId, scheduleId, {
          isActive: false,
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Weekly schedule not found",
      });

      expect(ClinicTimePolicy.findOne).not.toHaveBeenCalled();
    });

    it("should throw 404 if the clinic time policy does not exist", async () => {
      WeeklySchedule.findOne.mockResolvedValue(schedule);
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      await expect(
        updateWeeklySchedule(clinicId, scheduleId, {
          morningStart: "08:30",
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Clinic time policy not found",
      });

      expect(schedule.save).not.toHaveBeenCalled();
    });

    it("should reject an update that places the morning period outside policy", async () => {
      WeeklySchedule.findOne.mockResolvedValue(schedule);
      ClinicTimePolicy.findOne.mockResolvedValue(policy);

      await expect(
        updateWeeklySchedule(clinicId, scheduleId, {
          morningStart: "07:00",
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Morning schedule is outside clinic time policy",
      });

      expect(schedule.save).not.toHaveBeenCalled();
    });

    it("should allow deactivating a schedule without validating its periods", async () => {
  WeeklySchedule.findOne.mockResolvedValue(schedule);
  ClinicTimePolicy.findOne.mockResolvedValue(policy);

  const result = await updateWeeklySchedule(
    clinicId,
    scheduleId,
    {
      isActive: false,
      morningStart: "07:00",
    },
  );

  expect(ClinicTimePolicy.findOne).toHaveBeenCalledWith({
    clinic: clinicId,
  });

  expect(schedule.isActive).toBe(false);
  expect(schedule.morningStart).toBe("07:00");
  expect(schedule.save).toHaveBeenCalledOnce();
  expect(result).toBe(schedule);
});
  });

  describe("deleteWeeklySchedule", () => {
    it("should delete and return the schedule", async () => {
      WeeklySchedule.findOneAndDelete.mockResolvedValue(schedule);

      const result = await deleteWeeklySchedule(
        clinicId,
        scheduleId,
      );

      expect(WeeklySchedule.findOneAndDelete).toHaveBeenCalledWith({
        _id: scheduleId,
        clinic: clinicId,
      });
      expect(result).toBe(schedule);
    });

    it("should throw 404 if the schedule does not exist", async () => {
      WeeklySchedule.findOneAndDelete.mockResolvedValue(null);

      await expect(
        deleteWeeklySchedule(clinicId, scheduleId),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Weekly schedule not found",
      });
    });
  });
});