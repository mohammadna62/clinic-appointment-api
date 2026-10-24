
import { describe, it, expect } from "vitest";

import {
  doctorIdAppointmentSchema,
  generateAppointmentForDateSchema,
  getAvailableAppointmentsQuerySchema,
  appointmentIdSchema,
  updateAppointmentStatusSchema,
  adminAppointmentQuerySchema,
} from "../src/validators/available-appointment.validator.js";

describe("Available Appointment Validators", () => {
  const validDoctorId = "507f1f77bcf86cd799439011";
  const validAppointmentId = "507f1f77bcf86cd799439012";

  describe("doctorIdAppointmentSchema", () => {
    it("should accept a valid doctor ID", () => {
      const result = doctorIdAppointmentSchema.safeParse({
        doctorId: validDoctorId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid doctor ID", () => {
      const result = doctorIdAppointmentSchema.safeParse({
        doctorId: "invalid-id",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = doctorIdAppointmentSchema.safeParse({
        doctorId: validDoctorId,
        extra: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("generateAppointmentForDateSchema", () => {
    it("should accept a valid date", () => {
      const result = generateAppointmentForDateSchema.safeParse({
        date: "2026-10-25",
      });

      expect(result.success).toBe(true);
    });

    it("should convert a valid date string to a Date object", () => {
      const result = generateAppointmentForDateSchema.safeParse({
        date: "2026-10-25",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.date).toBeInstanceOf(Date);
      }
    });

    it("should reject an invalid date", () => {
      const result = generateAppointmentForDateSchema.safeParse({
        date: "not-a-date",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = generateAppointmentForDateSchema.safeParse({
        date: "2026-10-25",
        doctorId: validDoctorId,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("getAvailableAppointmentsQuerySchema", () => {
    it("should apply default pagination values", () => {
      const result = getAvailableAppointmentsQuerySchema.safeParse({});

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual({
          page: 1,
          limit: 20,
        });
      }
    });

    it("should convert pagination strings to numbers", () => {
      const result = getAvailableAppointmentsQuerySchema.safeParse({
        page: "2",
        limit: "50",
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("should reject a page number less than 1", () => {
      const result = getAvailableAppointmentsQuerySchema.safeParse({
        page: "0",
      });

      expect(result.success).toBe(false);
    });

    it("should reject a limit greater than 100", () => {
      const result = getAvailableAppointmentsQuerySchema.safeParse({
        limit: "101",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown query parameters", () => {
      const result = getAvailableAppointmentsQuerySchema.safeParse({
        page: "1",
        sort: "date",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("appointmentIdSchema", () => {
    it("should accept a valid appointment ID", () => {
      const result = appointmentIdSchema.safeParse({
        appointmentId: validAppointmentId,
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid appointment ID", () => {
      const result = appointmentIdSchema.safeParse({
        appointmentId: "invalid-id",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateAppointmentStatusSchema", () => {
    it.each(["available", "suspended"])(
      "should accept status %s",
      (status) => {
        const result = updateAppointmentStatusSchema.safeParse({
          status,
        });

        expect(result.success).toBe(true);
      },
    );

    it("should reject an unsupported status", () => {
      const result = updateAppointmentStatusSchema.safeParse({
        status: "booked",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = updateAppointmentStatusSchema.safeParse({
        status: "available",
        extra: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("adminAppointmentQuerySchema", () => {
    it("should apply default pagination and allow an omitted status", () => {
      const result = adminAppointmentQuerySchema.safeParse({});

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual({
          page: 1,
          limit: 20,
        });
      }
    });

    it.each(["available", "reserved", "booked", "suspended"])(
      "should accept status %s",
      (status) => {
        const result = adminAppointmentQuerySchema.safeParse({
          status,
        });

        expect(result.success).toBe(true);
      },
    );

    it("should reject an unsupported status", () => {
      const result = adminAppointmentQuerySchema.safeParse({
        status: "cancelled",
      });

      expect(result.success).toBe(false);
    });

    it("should reject a limit less than 1", () => {
      const result = adminAppointmentQuerySchema.safeParse({
        limit: "0",
      });

      expect(result.success).toBe(false);
    });

    it("should reject unknown query parameters", () => {
      const result = adminAppointmentQuerySchema.safeParse({
        page: "1",
        doctorId: validDoctorId,
      });

      expect(result.success).toBe(false);
    });
  });
});
