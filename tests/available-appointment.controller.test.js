import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateAppointmentsForDate: vi.fn(),
  generateDoctorAppointments: vi.fn(),
  getAvailableAppointments: vi.fn(),
  updateAppointmentStatus: vi.fn(),
  reserveAppointment: vi.fn(),
  getAdminAppointments: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/available-appointment.service.js", () => ({
  generateAppointmentsForDate: mocks.generateAppointmentsForDate,
  generateDoctorAppointments: mocks.generateDoctorAppointments,
  getAvailableAppointments: mocks.getAvailableAppointments,
  updateAppointmentStatus: mocks.updateAppointmentStatus,
  reserveAppointment: mocks.reserveAppointment,
  getAdminAppointments: mocks.getAdminAppointments,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  generateAppointments,
  generateDoctorAppointments,
  getAvailableAppointments,
  updateAppointmentStatus,
  reserveAppointment,
  getAdminAppointments,
} from "../src/controllers/available-appointment.controller.js";

describe("Available Appointment Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        params: {
          doctorId: "doctor-id",
          appointmentId: "appointment-id",
        },
        body: {
          date: "2026-11-01",
          status: "cancelled",
        },
        query: {
          page: 1,
          limit: 10,
          status: "available",
        },
      },
      user: {
        userId: "user-id",
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("generateAppointments", () => {
    it("should generate appointments for a doctor and date", async () => {
      const appointments = [{ _id: "appointment-id" }];

      mocks.generateAppointmentsForDate.mockResolvedValueOnce(appointments);

      await generateAppointments(req, res, next);

      expect(mocks.generateAppointmentsForDate).toHaveBeenCalledWith(
        "doctor-id",
        "2026-11-01",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Appointments generated successfully",
        data: { appointments },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Appointment generation failed");

      mocks.generateAppointmentsForDate.mockRejectedValueOnce(error);

      await generateAppointments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("generateDoctorAppointments", () => {
    it("should generate appointments for a doctor", async () => {
      const appointments = [{ _id: "appointment-id" }];

      mocks.generateDoctorAppointments.mockResolvedValueOnce(appointments);

      await generateDoctorAppointments(req, res, next);

      expect(mocks.generateDoctorAppointments).toHaveBeenCalledWith(
        "doctor-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Doctor appointments generated successfully",
        data: { appointments },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor appointment generation failed");

      mocks.generateDoctorAppointments.mockRejectedValueOnce(error);

      await generateDoctorAppointments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getAvailableAppointments", () => {
    it("should retrieve available appointments", async () => {
      const result = {
        appointments: [{ _id: "appointment-id" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getAvailableAppointments.mockResolvedValueOnce(result);

      await getAvailableAppointments(req, res, next);

      expect(mocks.getAvailableAppointments).toHaveBeenCalledWith(1, 10);

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Available appointments retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Failed to retrieve appointments");

      mocks.getAvailableAppointments.mockRejectedValueOnce(error);

      await getAvailableAppointments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("updateAppointmentStatus", () => {
    it("should update appointment status", async () => {
      const appointment = {
        _id: "appointment-id",
        status: "cancelled",
      };

      mocks.updateAppointmentStatus.mockResolvedValueOnce(appointment);

      await updateAppointmentStatus(req, res, next);

      expect(mocks.updateAppointmentStatus).toHaveBeenCalledWith(
        "appointment-id",
        "cancelled",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Appointment status updated successfully",
        data: appointment,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Status update failed");

      mocks.updateAppointmentStatus.mockRejectedValueOnce(error);

      await updateAppointmentStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("reserveAppointment", () => {
    it("should reserve an appointment for the current user", async () => {
      const appointment = {
        _id: "appointment-id",
        status: "reserved",
        user: "user-id",
      };

      mocks.reserveAppointment.mockResolvedValueOnce(appointment);

      await reserveAppointment(req, res, next);

      expect(mocks.reserveAppointment).toHaveBeenCalledWith(
        "appointment-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Appointment reserved successfully",
        data: { appointment },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Appointment reservation failed");

      mocks.reserveAppointment.mockRejectedValueOnce(error);

      await reserveAppointment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getAdminAppointments", () => {
    it("should retrieve appointments for admin", async () => {
      const result = {
        appointments: [{ _id: "appointment-id" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getAdminAppointments.mockResolvedValueOnce(result);

      await getAdminAppointments(req, res, next);

      expect(mocks.getAdminAppointments).toHaveBeenCalledWith(
        1,
        10,
        "available",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Appointments retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Failed to retrieve admin appointments");

      mocks.getAdminAppointments.mockRejectedValueOnce(error);

      await getAdminAppointments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});