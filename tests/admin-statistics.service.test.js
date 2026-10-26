
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/booking.model.js", () => ({
  default: { aggregate: vi.fn() },
}));

vi.mock("../src/models/payment.model.js", () => ({
  default: { aggregate: vi.fn() },
}));

vi.mock("../src/models/available-appointment.model.js", () => ({
  default: { aggregate: vi.fn() },
}));

vi.mock("../src/models/doctor.model.js", () => ({
  default: { aggregate: vi.fn() },
}));

vi.mock("../src/models/user.model.js", () => ({
  default: { aggregate: vi.fn() },
}));

vi.mock("../src/utils/statistics.util.js", () => ({
  getStatisticsDateRange: vi.fn(),
}));

import Booking from "../src/models/booking.model.js";
import Payment from "../src/models/payment.model.js";
import AvailableAppointment from "../src/models/available-appointment.model.js";
import Doctor from "../src/models/doctor.model.js";
import User from "../src/models/user.model.js";
import { getStatisticsDateRange } from "../src/utils/statistics.util.js";
import { getAdminStatistics } from "../src/services/admin-statistics.service.js";

describe("Admin Statistics Service", () => {
  const startDate = new Date("2026-01-01T00:00:00.000Z");
  const endDate = new Date("2026-01-31T23:59:59.999Z");

  beforeEach(() => {
    vi.clearAllMocks();

    getStatisticsDateRange.mockReturnValue({
      startDate,
      endDate,
    });

    Booking.aggregate.mockResolvedValue([]);
    Payment.aggregate.mockResolvedValue([]);
    AvailableAppointment.aggregate.mockResolvedValue([]);
    Doctor.aggregate.mockResolvedValue([]);
    User.aggregate.mockResolvedValue([]);
  });

  it("should return zero statistics when there is no data", async () => {
    const result = await getAdminStatistics();

    expect(result).toEqual({
      period: "month",
      startDate,
      endDate,
      bookings: {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        patient_no_show: 0,
      },
      payments: {
        total: 0,
        pending: 0,
        paid: 0,
        failed: 0,
        refunded: 0,
      },
      appointments: {
        total: 0,
        available: 0,
        reserved: 0,
        booked: 0,
        suspended: 0,
      },
      doctors: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      users: {
        total: 0,
        patients: 0,
        doctors: 0,
        admins: 0,
      },
    });

    expect(getStatisticsDateRange).toHaveBeenCalledWith("month");
  });

  it("should use the requested statistics period", async () => {
    const result = await getAdminStatistics("week");

    expect(result.period).toBe("week");
    expect(getStatisticsDateRange).toHaveBeenCalledWith("week");
  });

  it("should calculate booking counts and total correctly", async () => {
    Booking.aggregate.mockResolvedValue([
      { _id: "pending", count: 3 },
      { _id: "confirmed", count: 5 },
      { _id: "completed", count: 10 },
      { _id: "cancelled", count: 2 },
      { _id: "patient_no_show", count: 1 },
    ]);

    const result = await getAdminStatistics();

    expect(result.bookings).toEqual({
      total: 21,
      pending: 3,
      confirmed: 5,
      completed: 10,
      cancelled: 2,
      patient_no_show: 1,
    });
  });

  it("should calculate payment counts and total correctly", async () => {
    Payment.aggregate.mockResolvedValue([
      { _id: "pending", count: 4 },
      { _id: "paid", count: 12 },
      { _id: "failed", count: 2 },
      { _id: "refunded", count: 1 },
    ]);

    const result = await getAdminStatistics();

    expect(result.payments).toEqual({
      total: 19,
      pending: 4,
      paid: 12,
      failed: 2,
      refunded: 1,
    });
  });

  it("should calculate appointment counts and total correctly", async () => {
    AvailableAppointment.aggregate.mockResolvedValue([
      { _id: "available", count: 20 },
      { _id: "reserved", count: 5 },
      { _id: "booked", count: 8 },
      { _id: "suspended", count: 2 },
    ]);

    const result = await getAdminStatistics();

    expect(result.appointments).toEqual({
      total: 35,
      available: 20,
      reserved: 5,
      booked: 8,
      suspended: 2,
    });
  });

  it("should calculate active and inactive doctor counts", async () => {
    Doctor.aggregate.mockResolvedValue([
      { _id: true, count: 7 },
      { _id: false, count: 3 },
    ]);

    const result = await getAdminStatistics();

    expect(result.doctors).toEqual({
      total: 10,
      active: 7,
      inactive: 3,
    });
  });

  it("should calculate user counts by role", async () => {
    User.aggregate.mockResolvedValue([
      { _id: "patient", count: 100 },
      { _id: "doctor", count: 15 },
      { _id: "admin", count: 2 },
    ]);

    const result = await getAdminStatistics();

    expect(result.users).toEqual({
      total: 117,
      patients: 100,
      doctors: 15,
      admins: 2,
    });
  });

  it("should preserve zero counts for missing statuses and roles", async () => {
    Booking.aggregate.mockResolvedValue([
      { _id: "completed", count: 4 },
    ]);

    Doctor.aggregate.mockResolvedValue([
      { _id: true, count: 6 },
    ]);

    User.aggregate.mockResolvedValue([
      { _id: "patient", count: 20 },
    ]);

    const result = await getAdminStatistics();

    expect(result.bookings.total).toBe(4);
    expect(result.bookings.pending).toBe(0);
    expect(result.bookings.completed).toBe(4);

    expect(result.doctors).toEqual({
      total: 6,
      active: 6,
      inactive: 0,
    });

    expect(result.users).toEqual({
      total: 20,
      patients: 20,
      doctors: 0,
      admins: 0,
    });
  });

  it("should apply the date range to booking, payment, and appointment queries", async () => {
    await getAdminStatistics("month");

    expect(Booking.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    expect(Payment.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    expect(AvailableAppointment.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  });

  it("should aggregate doctors by active status", async () => {
    await getAdminStatistics();

    expect(Doctor.aggregate).toHaveBeenCalledWith([
      {
        $group: {
          _id: "$isActive",
          count: { $sum: 1 },
        },
      },
    ]);
  });

  it("should unwind user roles before grouping", async () => {
    await getAdminStatistics();

    expect(User.aggregate).toHaveBeenCalledWith([
      {
        $unwind: "$roles",
      },
      {
        $group: {
          _id: "$roles",
          count: { $sum: 1 },
        },
      },
    ]);
  });

  it("should run all five aggregation queries", async () => {
    await getAdminStatistics();

    expect(Booking.aggregate).toHaveBeenCalledTimes(1);
    expect(Payment.aggregate).toHaveBeenCalledTimes(1);
    expect(AvailableAppointment.aggregate).toHaveBeenCalledTimes(1);
    expect(Doctor.aggregate).toHaveBeenCalledTimes(1);
    expect(User.aggregate).toHaveBeenCalledTimes(1);
  });
});
