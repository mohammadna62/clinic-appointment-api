
import { describe, it, expect } from "vitest";

import {
  doctorIdScheduleSchema,
  doctorScheduleParamsSchema,
  createDoctorScheduleSchema,
  updateDoctorScheduleSchema,
} from "../src/validators/doctor-schedule.validator.js";

describe("Doctor Schedule Validators", () => {
  const validDoctorId = "507f1f77bcf86cd799439011";
  const validScheduleId = "507f1f77bcf86cd799439012";

  describe("doctorIdScheduleSchema", () => {
    it("should accept a valid doctor ID", () => {
      const result = doctorIdScheduleSchema.safeParse({
        doctorId: validDoctorId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid doctor ID", () => {
      const result = doctorIdScheduleSchema.safeParse({
        doctorId: "invalid-id",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = doctorIdScheduleSchema.safeParse({
        doctorId: validDoctorId,
        extra: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("doctorScheduleParamsSchema", () => {
    it("should accept valid doctor and schedule IDs", () => {
      const result = doctorScheduleParamsSchema.safeParse({
        doctorId: validDoctorId,
        scheduleId: validScheduleId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid schedule ID", () => {
      const result = doctorScheduleParamsSchema.safeParse({
        doctorId: validDoctorId,
        scheduleId: "invalid-id",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("createDoctorScheduleSchema", () => {
    it("should accept a valid schedule", () => {
      const result = createDoctorScheduleSchema.safeParse({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
      });

      expect(result.success).toBe(true);
    });

    it("should reject a day of week outside the range 0-6", () => {
      const result = createDoctorScheduleSchema.safeParse({
        dayOfWeek: 7,
        startTime: "09:00",
        endTime: "17:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject a non-integer day of week", () => {
      const result = createDoctorScheduleSchema.safeParse({
        dayOfWeek: 1.5,
        startTime: "09:00",
        endTime: "17:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject an invalid time format", () => {
      const result = createDoctorScheduleSchema.safeParse({
        dayOfWeek: 1,
        startTime: "25:00",
        endTime: "17:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject a start time that is not before the end time", () => {
      const result = createDoctorScheduleSchema.safeParse({
        dayOfWeek: 1,
        startTime: "17:00",
        endTime: "09:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = createDoctorScheduleSchema.safeParse({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        doctorId: validDoctorId,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateDoctorScheduleSchema", () => {
    it("should accept updating only the active status", () => {
      const result = updateDoctorScheduleSchema.safeParse({
        isActive: false,
      });

      expect(result.success).toBe(true);
    });

    it("should reject an empty update object", () => {
      const result = updateDoctorScheduleSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("should reject start time after end time", () => {
      const result = updateDoctorScheduleSchema.safeParse({
        startTime: "17:00",
        endTime: "09:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject an invalid time format", () => {
      const result = updateDoctorScheduleSchema.safeParse({
        startTime: "9:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = updateDoctorScheduleSchema.safeParse({
        isActive: true,
        dayOfWeek: 2,
      });

      expect(result.success).toBe(false);
    });
  });
});
