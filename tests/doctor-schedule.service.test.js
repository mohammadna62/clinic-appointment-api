import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/doctor-schedule.model.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock("../src/models/doctor.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/clinic.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/weekly-schedule.model.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import DoctorSchedule from "../src/models/doctor-schedule.model.js";
import Doctor from "../src/models/doctor.model.js";
import Clinic from "../src/models/clinic.model.js";
import WeeklySchedule from "../src/models/weekly-schedule.model.js";

import {
  createDoctorSchedule,
  getDoctorSchedules,
  updateDoctorSchedule,
  deleteDoctorSchedule,
} from "../src/services/doctor-schedule.service.js";

describe("Doctor Schedule Service", () => {
  const doctorId = "doctor123";
  const clinicId = "clinic123";
  const scheduleId = "schedule123";

  let doctor;
  let clinic;
  let weeklySchedule;
  let schedule;

  beforeEach(() => {
    vi.resetAllMocks();

    doctor = {
      _id: doctorId,
      clinic: clinicId,
      isActive: true,
    };

    clinic = {
      _id: clinicId,
      isActive: true,
    };

    weeklySchedule = {
      clinic: clinicId,
      dayOfWeek: 1,
      isActive: true,
      morningStart: "08:00",
      morningEnd: "12:00",
      eveningStart: "14:00",
      eveningEnd: "18:00",
    };

    schedule = {
      _id: scheduleId,
      doctor: doctorId,
      clinic: clinicId,
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "11:00",
      isActive: true,
      save: vi.fn().mockResolvedValue(undefined),
    };

    Doctor.findById.mockResolvedValue(doctor);
    Clinic.findById.mockResolvedValue(clinic);
    WeeklySchedule.findOne.mockResolvedValue(weeklySchedule);

    DoctorSchedule.find.mockResolvedValue([]);
    DoctorSchedule.findOne.mockResolvedValue(schedule);
    DoctorSchedule.findOneAndDelete.mockResolvedValue(schedule);
    DoctorSchedule.create.mockResolvedValue(schedule);
  });

  describe("createDoctorSchedule", () => {
    const data = {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "11:00",
    };

    it("should create a schedule for an active doctor and clinic", async () => {
      const result = await createDoctorSchedule(doctorId, data);

      expect(Doctor.findById).toHaveBeenCalledWith(doctorId);
      expect(Clinic.findById).toHaveBeenCalledWith(clinicId);
      expect(WeeklySchedule.findOne).toHaveBeenCalledWith({
        clinic: clinicId,
        dayOfWeek: 1,
        isActive: true,
      });

      expect(DoctorSchedule.create).toHaveBeenCalledWith({
        doctor: doctorId,
        clinic: clinicId,
        ...data,
        isActive: true,
      });

      expect(result).toBe(schedule);
    });

    it("should throw 404 if the doctor does not exist", async () => {
      Doctor.findById.mockResolvedValue(null);

      await expect(
        createDoctorSchedule(doctorId, data),
      ).rejects.toMatchObject({
        message: "Doctor not found",
        statusCode: 404,
      });

      expect(Clinic.findById).not.toHaveBeenCalled();
    });

    it("should throw 409 if the doctor is inactive", async () => {
      doctor.isActive = false;

      await expect(
        createDoctorSchedule(doctorId, data),
      ).rejects.toMatchObject({
        message: "Doctor is inactive",
        statusCode: 409,
      });
    });

    it("should throw 404 if the clinic does not exist", async () => {
      Clinic.findById.mockResolvedValue(null);

      await expect(
        createDoctorSchedule(doctorId, data),
      ).rejects.toMatchObject({
        message: "Clinic not found",
        statusCode: 404,
      });
    });

    it("should throw 409 if the clinic is inactive", async () => {
      clinic.isActive = false;

      await expect(
        createDoctorSchedule(doctorId, data),
      ).rejects.toMatchObject({
        message: "Clinic is inactive",
        statusCode: 409,
      });
    });

    it("should throw 409 if no active weekly schedule exists", async () => {
      WeeklySchedule.findOne.mockResolvedValue(null);

      await expect(
        createDoctorSchedule(doctorId, data),
      ).rejects.toMatchObject({
        message: "No active weekly schedule found for this day",
        statusCode: 409,
      });
    });

    it("should reject a start time that is not before the end time", async () => {
      await expect(
        createDoctorSchedule(doctorId, {
          ...data,
          startTime: "11:00",
          endTime: "09:00",
        }),
      ).rejects.toMatchObject({
        message: "Start time must be before end time",
        statusCode: 400,
      });
    });

    it("should reject a schedule outside clinic working hours", async () => {
      await expect(
        createDoctorSchedule(doctorId, {
          ...data,
          startTime: "07:00",
          endTime: "09:00",
        }),
      ).rejects.toMatchObject({
        message: "Doctor schedule is outside clinic working hours",
        statusCode: 400,
      });
    });

    it("should reject a schedule that overlaps an existing schedule", async () => {
      DoctorSchedule.find.mockResolvedValue([
        {
          startTime: "10:00",
          endTime: "12:00",
        },
      ]);

      await expect(
        createDoctorSchedule(doctorId, data),
      ).rejects.toMatchObject({
        message: "Doctor schedule overlaps with an existing schedule",
        statusCode: 409,
      });

      expect(DoctorSchedule.create).not.toHaveBeenCalled();
    });

    it("should allow schedules that do not overlap", async () => {
      DoctorSchedule.find.mockResolvedValue([
        {
          startTime: "08:00",
          endTime: "09:00",
        },
      ]);

      const result = await createDoctorSchedule(doctorId, data);

      expect(DoctorSchedule.create).toHaveBeenCalledOnce();
      expect(result).toBe(schedule);
    });
  });

  describe("getDoctorSchedules", () => {
    it("should return schedules sorted by day and start time", async () => {
      const schedules = [schedule];
      const sort = vi.fn().mockResolvedValue(schedules);

      DoctorSchedule.find.mockReturnValue({ sort });

      const result = await getDoctorSchedules(doctorId);

      expect(Doctor.findById).toHaveBeenCalledWith(doctorId);
      expect(DoctorSchedule.find).toHaveBeenCalledWith({
        doctor: doctorId,
      });
      expect(sort).toHaveBeenCalledWith({
        dayOfWeek: 1,
        startTime: 1,
      });
      expect(result).toBe(schedules);
    });

    it("should throw 404 if the doctor does not exist", async () => {
      Doctor.findById.mockResolvedValue(null);

      await expect(
        getDoctorSchedules(doctorId),
      ).rejects.toMatchObject({
        message: "Doctor not found",
        statusCode: 404,
      });

      expect(DoctorSchedule.find).not.toHaveBeenCalled();
    });
  });

  describe("updateDoctorSchedule", () => {
    it("should update the schedule and save it", async () => {
      const data = {
        startTime: "10:00",
        endTime: "11:30",
      };

      const result = await updateDoctorSchedule(
        doctorId,
        scheduleId,
        data,
      );

      expect(DoctorSchedule.findOne).toHaveBeenCalledWith({
        _id: scheduleId,
        doctor: doctorId,
      });

      expect(schedule.startTime).toBe("10:00");
      expect(schedule.endTime).toBe("11:30");
      expect(schedule.isActive).toBe(true);
      expect(schedule.save).toHaveBeenCalledOnce();
      expect(result).toBe(schedule);
    });

    it("should throw 404 if the schedule does not exist", async () => {
      DoctorSchedule.findOne.mockResolvedValue(null);

      await expect(
        updateDoctorSchedule(doctorId, scheduleId, {
          startTime: "10:00",
        }),
      ).rejects.toMatchObject({
        message: "Doctor schedule not found",
        statusCode: 404,
      });
    });

    it("should throw 409 if no active weekly schedule exists", async () => {
      WeeklySchedule.findOne.mockResolvedValue(null);

      await expect(
        updateDoctorSchedule(doctorId, scheduleId, {
          startTime: "10:00",
        }),
      ).rejects.toMatchObject({
        message: "No active weekly schedule found for this day",
        statusCode: 409,
      });
    });

    it("should reject an updated schedule outside clinic working hours", async () => {
      await expect(
        updateDoctorSchedule(doctorId, scheduleId, {
          startTime: "07:00",
          endTime: "09:00",
        }),
      ).rejects.toMatchObject({
        message: "Doctor schedule is outside clinic working hours",
        statusCode: 400,
      });

      expect(schedule.save).not.toHaveBeenCalled();
    });

    it("should exclude the current schedule when checking overlaps", async () => {
      const data = {
        startTime: "10:00",
        endTime: "11:00",
      };

      await updateDoctorSchedule(doctorId, scheduleId, data);

      expect(DoctorSchedule.find).toHaveBeenCalledWith({
        doctor: doctorId,
        dayOfWeek: schedule.dayOfWeek,
        isActive: true,
        _id: { $ne: scheduleId },
      });
    });

    it("should reject an update that overlaps another schedule", async () => {
      DoctorSchedule.find.mockResolvedValue([
        {
          startTime: "10:00",
          endTime: "12:00",
        },
      ]);

      await expect(
        updateDoctorSchedule(doctorId, scheduleId, {
          startTime: "10:30",
          endTime: "11:30",
        }),
      ).rejects.toMatchObject({
        message: "Doctor schedule overlaps with an existing schedule",
        statusCode: 409,
      });

      expect(schedule.save).not.toHaveBeenCalled();
    });

    it("should allow deactivating a schedule without validating its periods", async () => {
      const result = await updateDoctorSchedule(
        doctorId,
        scheduleId,
        {
          isActive: false,
          startTime: "07:00",
          endTime: "08:00",
        },
      );

      expect(WeeklySchedule.findOne).not.toHaveBeenCalled();
      expect(DoctorSchedule.find).not.toHaveBeenCalled();
      expect(schedule.isActive).toBe(false);
      expect(schedule.startTime).toBe("07:00");
      expect(schedule.endTime).toBe("08:00");
      expect(schedule.save).toHaveBeenCalledOnce();
      expect(result).toBe(schedule);
    });
  });

  describe("deleteDoctorSchedule", () => {
    it("should delete and return the schedule", async () => {
      const result = await deleteDoctorSchedule(
        doctorId,
        scheduleId,
      );

      expect(DoctorSchedule.findOneAndDelete).toHaveBeenCalledWith({
        _id: scheduleId,
        doctor: doctorId,
      });

      expect(result).toBe(schedule);
    });

    it("should throw 404 if the schedule does not exist", async () => {
      DoctorSchedule.findOneAndDelete.mockResolvedValue(null);

      await expect(
        deleteDoctorSchedule(doctorId, scheduleId),
      ).rejects.toMatchObject({
        message: "Doctor schedule not found",
        statusCode: 404,
      });
    });
  });
});