
import { describe, it, expect } from "vitest";

import {
  weeklyScheduleClinicIdSchema,
  weeklyScheduleIdSchema,
  createWeeklyScheduleSchema,
  updateWeeklyScheduleSchema,
} from "../src/validators/weekly-schedule.validator.js";

describe("Weekly Schedule Validators", () => {
  const validClinicId = "507f1f77bcf86cd799439011";
  const validScheduleId = "507f1f77bcf86cd799439012";

  describe("weeklyScheduleClinicIdSchema", () => {
    it("should accept a valid clinic ID", () => {
      const result = weeklyScheduleClinicIdSchema.safeParse({
        clinicId: validClinicId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid clinic ID", () => {
      const result = weeklyScheduleClinicIdSchema.safeParse({
        clinicId: "invalid-id",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = weeklyScheduleClinicIdSchema.safeParse({
        clinicId: validClinicId,
        extra: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("weeklyScheduleIdSchema", () => {
    it("should accept valid clinic and schedule IDs", () => {
      const result = weeklyScheduleIdSchema.safeParse({
        clinicId: validClinicId,
        scheduleId: validScheduleId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid schedule ID", () => {
      const result = weeklyScheduleIdSchema.safeParse({
        clinicId: validClinicId,
        scheduleId: "invalid-id",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("createWeeklyScheduleSchema", () => {
    it("should accept a valid schedule with a numeric day", () => {
      const result = createWeeklyScheduleSchema.safeParse({
        dayOfWeek: 1,
      });

      expect(result.success).toBe(true);
    });

    it("should convert a numeric string to a number", () => {
      const result = createWeeklyScheduleSchema.safeParse({
        dayOfWeek: "2",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.dayOfWeek).toBe(2);
      }
    });

    it("should reject a day outside the range 0-6", () => {
      const result = createWeeklyScheduleSchema.safeParse({
        dayOfWeek: 7,
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid morning and evening times", () => {
      const result = createWeeklyScheduleSchema.safeParse({
        dayOfWeek: 1,
        isActive: true,
        morningStart: "08:00",
        morningEnd: "12:00",
        eveningStart: "16:00",
        eveningEnd: "20:00",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid time format", () => {
      const result = createWeeklyScheduleSchema.safeParse({
        dayOfWeek: 1,
        morningStart: "8:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = createWeeklyScheduleSchema.safeParse({
        dayOfWeek: 1,
        clinicId: validClinicId,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateWeeklyScheduleSchema", () => {
    it("should accept updating only the active status", () => {
      const result = updateWeeklyScheduleSchema.safeParse({
        isActive: false,
      });

      expect(result.success).toBe(true);
    });

    it("should accept null to clear a morning start time", () => {
      const result = updateWeeklyScheduleSchema.safeParse({
        morningStart: null,
      });

      expect(result.success).toBe(true);
    });

    it("should accept a partial update with a valid time", () => {
      const result = updateWeeklyScheduleSchema.safeParse({
        eveningStart: "17:00",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid time format", () => {
      const result = updateWeeklyScheduleSchema.safeParse({
        morningStart: "25:00",
      });

      expect(result.success).toBe(false);
    });

    it("should reject a non-boolean active status", () => {
      const result = updateWeeklyScheduleSchema.safeParse({
        isActive: "true",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = updateWeeklyScheduleSchema.safeParse({
        isActive: true,
        dayOfWeek: 2,
      });

      expect(result.success).toBe(false);
    });

    it("should accept an empty update object", () => {
      const result = updateWeeklyScheduleSchema.safeParse({});

      expect(result.success).toBe(true);
    });
  });
});
