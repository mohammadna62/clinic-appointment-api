import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createBooking: vi.fn(),
  getPatientBookings: vi.fn(),
  getPatientBookingById: vi.fn(),
  cancelPatientBooking: vi.fn(),
  getDoctorBookings: vi.fn(),
  getDoctorBookingById: vi.fn(),
  completeDoctorBooking: vi.fn(),
  markPatientNoShow: vi.fn(),
  getAdminBookings: vi.fn(),
  getAdminBookingById: vi.fn(),
  getDoctorStatistics: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/booking.service.js", () => ({
  createBooking: mocks.createBooking,
  getPatientBookings: mocks.getPatientBookings,
  getPatientBookingById: mocks.getPatientBookingById,
  cancelPatientBooking: mocks.cancelPatientBooking,
  getDoctorBookings: mocks.getDoctorBookings,
  getDoctorBookingById: mocks.getDoctorBookingById,
  completeDoctorBooking: mocks.completeDoctorBooking,
  markPatientNoShow: mocks.markPatientNoShow,
  getAdminBookings: mocks.getAdminBookings,
  getAdminBookingById: mocks.getAdminBookingById,
  getDoctorStatistics: mocks.getDoctorStatistics,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createBooking,
  getPatientBookings,
  getPatientBookingById,
  cancelPatientBooking,
  getDoctorBookings,
  getDoctorBookingById,
  completeDoctorBooking,
  markPatientNoShow,
  getAdminBookings,
  getAdminBookingById,
  getDoctorStatistics,
} from "../src/controllers/booking.controller.js";

describe("Booking Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        params: {
          appointmentId: "appointment-id",
          bookingId: "booking-id",
        },
        query: {
          page: 2,
          limit: 10,
          status: "confirmed",
          period: "month",
        },
      },
      query: {
        page: "2",
        limit: "10",
      },
      user: {
        userId: "user-id",
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createBooking", () => {
    it("should create a booking successfully", async () => {
      const booking = { _id: "booking-id" };

      mocks.createBooking.mockResolvedValueOnce(booking);

      await createBooking(req, res, next);

      expect(mocks.createBooking).toHaveBeenCalledWith(
        "appointment-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Booking created successfully",
        data: { booking },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Booking creation failed");
      mocks.createBooking.mockRejectedValueOnce(error);

      await createBooking(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getPatientBookings", () => {
    it("should retrieve patient bookings", async () => {
      const result = { bookings: [], total: 0 };

      mocks.getPatientBookings.mockResolvedValueOnce(result);

      await getPatientBookings(req, res, next);

      expect(mocks.getPatientBookings).toHaveBeenCalledWith(
        "user-id",
        2,
        10,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Bookings retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Retrieving bookings failed");
      mocks.getPatientBookings.mockRejectedValueOnce(error);

      await getPatientBookings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getPatientBookingById", () => {
    it("should retrieve a patient booking by ID", async () => {
      const booking = { _id: "booking-id" };

      mocks.getPatientBookingById.mockResolvedValueOnce(booking);

      await getPatientBookingById(req, res, next);

      expect(mocks.getPatientBookingById).toHaveBeenCalledWith(
        "booking-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Booking retrieved successfully",
        data: { booking },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Booking retrieval failed");
      mocks.getPatientBookingById.mockRejectedValueOnce(error);

      await getPatientBookingById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("cancelPatientBooking", () => {
    it("should cancel a patient booking", async () => {
      const result = { bookingId: "booking-id", status: "cancelled" };

      mocks.cancelPatientBooking.mockResolvedValueOnce(result);

      await cancelPatientBooking(req, res, next);

      expect(mocks.cancelPatientBooking).toHaveBeenCalledWith(
        "booking-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Booking cancelled successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Booking cancellation failed");
      mocks.cancelPatientBooking.mockRejectedValueOnce(error);

      await cancelPatientBooking(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getDoctorBookings", () => {
    it("should retrieve doctor bookings with numeric pagination", async () => {
      const result = { bookings: [], total: 0 };

      mocks.getDoctorBookings.mockResolvedValueOnce(result);

      await getDoctorBookings(req, res, next);

      expect(mocks.getDoctorBookings).toHaveBeenCalledWith(
        "user-id",
        2,
        10,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor bookings retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should use default pagination values when query parameters are missing", async () => {
      req.query = {};

      mocks.getDoctorBookings.mockResolvedValueOnce({ bookings: [] });

      await getDoctorBookings(req, res, next);

      expect(mocks.getDoctorBookings).toHaveBeenCalledWith(
        "user-id",
        1,
        20,
      );
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor bookings retrieval failed");
      mocks.getDoctorBookings.mockRejectedValueOnce(error);

      await getDoctorBookings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getDoctorBookingById", () => {
    it("should retrieve a doctor booking by ID", async () => {
      const booking = { _id: "booking-id" };

      mocks.getDoctorBookingById.mockResolvedValueOnce(booking);

      await getDoctorBookingById(req, res, next);

      expect(mocks.getDoctorBookingById).toHaveBeenCalledWith(
        "booking-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Booking retrieved successfully",
        data: { booking },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor booking retrieval failed");
      mocks.getDoctorBookingById.mockRejectedValueOnce(error);

      await getDoctorBookingById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("completeDoctorBooking", () => {
    it("should complete a doctor booking", async () => {
      const booking = { _id: "booking-id", status: "completed" };

      mocks.completeDoctorBooking.mockResolvedValueOnce(booking);

      await completeDoctorBooking(req, res, next);

      expect(mocks.completeDoctorBooking).toHaveBeenCalledWith(
        "booking-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Booking completed successfully",
        data: { booking },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Booking completion failed");
      mocks.completeDoctorBooking.mockRejectedValueOnce(error);

      await completeDoctorBooking(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("markPatientNoShow", () => {
    it("should mark a patient as no-show", async () => {
      const booking = { _id: "booking-id", status: "patient_no_show" };

      mocks.markPatientNoShow.mockResolvedValueOnce(booking);

      await markPatientNoShow(req, res, next);

      expect(mocks.markPatientNoShow).toHaveBeenCalledWith(
        "booking-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Patient marked as no-show successfully",
        data: { booking },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Marking patient as no-show failed");
      mocks.markPatientNoShow.mockRejectedValueOnce(error);

      await markPatientNoShow(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAdminBookings", () => {
    it("should retrieve admin bookings", async () => {
      const result = { bookings: [], total: 0 };

      mocks.getAdminBookings.mockResolvedValueOnce(result);

      await getAdminBookings(req, res, next);

      expect(mocks.getAdminBookings).toHaveBeenCalledWith(
        2,
        10,
        "confirmed",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Admin bookings retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Admin bookings retrieval failed");
      mocks.getAdminBookings.mockRejectedValueOnce(error);

      await getAdminBookings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAdminBookingById", () => {
    it("should retrieve an admin booking by ID", async () => {
      const booking = { _id: "booking-id" };

      mocks.getAdminBookingById.mockResolvedValueOnce(booking);

      await getAdminBookingById(req, res, next);

      expect(mocks.getAdminBookingById).toHaveBeenCalledWith("booking-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Booking retrieved successfully",
        data: { booking },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Admin booking retrieval failed");
      mocks.getAdminBookingById.mockRejectedValueOnce(error);

      await getAdminBookingById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getDoctorStatistics", () => {
    it("should retrieve doctor statistics", async () => {
      const statistics = {
        totalBookings: 20,
        completedBookings: 15,
      };

      mocks.getDoctorStatistics.mockResolvedValueOnce(statistics);

      await getDoctorStatistics(req, res, next);

      expect(mocks.getDoctorStatistics).toHaveBeenCalledWith(
        "user-id",
        "month",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor statistics retrieved successfully",
        data: statistics,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor statistics retrieval failed");
      mocks.getDoctorStatistics.mockRejectedValueOnce(error);

      await getDoctorStatistics(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});