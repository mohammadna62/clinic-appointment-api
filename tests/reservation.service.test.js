import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/available-appointment.model.js", () => ({
  default: {
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("../src/models/booking.model.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("../src/models/payment.model.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import AvailableAppointment from "../src/models/available-appointment.model.js";
import Booking from "../src/models/booking.model.js";
import Payment from "../src/models/payment.model.js";

import { expireReservations } from "../src/services/reservation.service.js";

describe("Reservation Service", () => {
  let appointment;
  let booking;
  let payment;

  beforeEach(() => {
    vi.resetAllMocks();

    appointment = {
      _id: "appointment123",
      status: "reserved",
      reservedUntil: new Date("2026-01-01T10:00:00.000Z"),
    };

    booking = {
      _id: "booking123",
      appointment: appointment._id,
      status: "pending",
      cancellationReason: null,
      save: vi.fn().mockResolvedValue(undefined),
    };

    payment = {
      _id: "payment123",
      booking: booking._id,
      status: "pending",
      save: vi.fn().mockResolvedValue(undefined),
    };

    AvailableAppointment.find.mockResolvedValue([appointment]);
    AvailableAppointment.findOneAndUpdate.mockResolvedValue(appointment);

    Booking.findOne.mockResolvedValue(booking);
    Payment.findOne.mockResolvedValue(payment);
  });

  it("should release an expired appointment, cancel its booking, and fail its payment", async () => {
    const result = await expireReservations();

    expect(AvailableAppointment.find).toHaveBeenCalledWith({
      status: "reserved",
      reservedUntil: {
        $lte: expect.any(Date),
      },
    });

    expect(Booking.findOne).toHaveBeenCalledWith({
      appointment: appointment._id,
      status: "pending",
    });

    expect(booking.status).toBe("cancelled");
    expect(booking.cancellationReason).toBe("payment_timeout");
    expect(booking.save).toHaveBeenCalledOnce();

    expect(Payment.findOne).toHaveBeenCalledWith({
      booking: booking._id,
      status: "pending",
    });

    expect(payment.status).toBe("failed");
    expect(payment.save).toHaveBeenCalledOnce();

    expect(AvailableAppointment.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: appointment._id,
        status: "reserved",
        reservedUntil: {
          $lte: expect.any(Date),
        },
      },
      {
        $set: {
          status: "available",
          reservedBy: null,
          reservedUntil: null,
        },
      },
    );

    expect(result).toEqual({
      releasedAppointments: 1,
      cancelledBookings: 1,
      failedPayments: 1,
    });
  });

  it("should return zero counts when there are no expired appointments", async () => {
    AvailableAppointment.find.mockResolvedValue([]);

    const result = await expireReservations();

    expect(result).toEqual({
      releasedAppointments: 0,
      cancelledBookings: 0,
      failedPayments: 0,
    });

    expect(Booking.findOne).not.toHaveBeenCalled();
    expect(Payment.findOne).not.toHaveBeenCalled();
    expect(AvailableAppointment.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("should release an appointment even when no pending booking exists", async () => {
    Booking.findOne.mockResolvedValue(null);

    const result = await expireReservations();

    expect(booking.save).not.toHaveBeenCalled();
    expect(Payment.findOne).not.toHaveBeenCalled();
    expect(AvailableAppointment.findOneAndUpdate).toHaveBeenCalledOnce();

    expect(result).toEqual({
      releasedAppointments: 1,
      cancelledBookings: 0,
      failedPayments: 0,
    });
  });

  it("should cancel the booking even when no pending payment exists", async () => {
    Payment.findOne.mockResolvedValue(null);

    const result = await expireReservations();

    expect(booking.status).toBe("cancelled");
    expect(booking.save).toHaveBeenCalledOnce();
    expect(payment.save).not.toHaveBeenCalled();

    expect(result).toEqual({
      releasedAppointments: 1,
      cancelledBookings: 1,
      failedPayments: 0,
    });
  });

  it("should count an appointment as released only when the conditional update succeeds", async () => {
    AvailableAppointment.findOneAndUpdate.mockResolvedValue(null);

    const result = await expireReservations();

    expect(result).toEqual({
      releasedAppointments: 0,
      cancelledBookings: 1,
      failedPayments: 1,
    });
  });

  it("should process multiple expired appointments and return aggregate counts", async () => {
    const secondAppointment = {
      _id: "appointment456",
      status: "reserved",
      reservedUntil: new Date("2026-01-01T11:00:00.000Z"),
    };

    AvailableAppointment.find.mockResolvedValue([
      appointment,
      secondAppointment,
    ]);

    Booking.findOne
      .mockResolvedValueOnce(booking)
      .mockResolvedValueOnce(null);

    AvailableAppointment.findOneAndUpdate
      .mockResolvedValueOnce(appointment)
      .mockResolvedValueOnce(secondAppointment);

    const result = await expireReservations();

    expect(AvailableAppointment.findOneAndUpdate).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
      releasedAppointments: 2,
      cancelledBookings: 1,
      failedPayments: 1,
    });
  });

  it("should propagate an error when querying expired appointments fails", async () => {
    AvailableAppointment.find.mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(expireReservations()).rejects.toThrow(
      "Database unavailable",
    );
  });
});