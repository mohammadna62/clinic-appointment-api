
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

const {
  scheduleMock,
  doctorFindMock,
  deleteManyMock,
  findOneMock,
  sortMock,
  selectMock,
  generateNextDayMock,
  generateDoctorAppointmentsMock,
  generateAppointmentsForDateMock,
  expireReservationsMock,
  getTodayLocalDateMock,
  addDaysMock,
} = vi.hoisted(() => ({
  scheduleMock: vi.fn(),
  doctorFindMock: vi.fn(),
  deleteManyMock: vi.fn(),
  findOneMock: vi.fn(),
  sortMock: vi.fn(),
  selectMock: vi.fn(),
  generateNextDayMock: vi.fn(),
  generateDoctorAppointmentsMock: vi.fn(),
  generateAppointmentsForDateMock: vi.fn(),
  expireReservationsMock: vi.fn(),
  getTodayLocalDateMock: vi.fn(),
  addDaysMock: vi.fn(),
}));

vi.mock("node-cron", () => ({
  default: {
    schedule: scheduleMock,
  },
}));

vi.mock("../src/config/env.js", () => ({
  default: {
    PROJECT_TIME_ZONE: "Asia/Tehran",
  },
}));

vi.mock("../src/models/doctor.model.js", () => ({
  default: {
    find: doctorFindMock,
  },
}));

vi.mock("../src/models/available-appointment.model.js", () => ({
  default: {
    deleteMany: deleteManyMock,
    findOne: findOneMock,
  },
}));

vi.mock("../src/services/available-appointment.service.js", () => ({
  generateAppointmentsForDate: generateAppointmentsForDateMock,
  generateDoctorAppointments: generateDoctorAppointmentsMock,
  generateNextDayAppointments: generateNextDayMock,
}));

vi.mock("../src/services/reservation.service.js", () => ({
  expireReservations: expireReservationsMock,
}));

vi.mock("../src/utils/date.util.js", () => ({
  getTodayLocalDate: getTodayLocalDateMock,
  addDays: addDaysMock,
}));

import {
  generateNextDayAppointmentsForAllDoctors,
  recoverMissingAppointments,
  startAppointmentJob,
  startReservationExpirationJob,
} from "../src/jobs/appointment.job.js";

describe("Appointment jobs", () => {
  const today = new Date("2026-01-10T00:00:00.000Z");

  const getDoctors = (doctors) => {
    doctorFindMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(doctors),
    });
  };

  const getAppointmentQuery = (appointment) => {
    const select = vi.fn().mockResolvedValue(appointment);
    const sort = vi.fn().mockReturnValue({ select });

    return { sort };
  };

  const getScheduledCallback = (cronExpression) => {
    const call = scheduleMock.mock.calls.find(
      ([expression]) => expression === cronExpression,
    );

    expect(call).toBeDefined();

    return call[1];
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    getTodayLocalDateMock.mockReturnValue(today);

    addDaysMock.mockImplementation((date, days) => {
      const result = new Date(date);
      result.setUTCDate(result.getUTCDate() + days);
      return result;
    });

    deleteManyMock.mockResolvedValue({ deletedCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --------------------------------------------------
  // generateNextDayAppointmentsForAllDoctors
  // --------------------------------------------------

  describe("generateNextDayAppointmentsForAllDoctors", () => {
    it("should generate next-day appointments for every active doctor", async () => {
      const doctors = [
        { _id: "doctor-1" },
        { _id: "doctor-2" },
      ];

      getDoctors(doctors);

      generateNextDayMock
        .mockResolvedValueOnce(["slot-1", "slot-2"])
        .mockResolvedValueOnce(["slot-3"]);

      await generateNextDayAppointmentsForAllDoctors();

      expect(doctorFindMock).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(generateNextDayMock).toHaveBeenCalledTimes(2);

      expect(generateNextDayMock).toHaveBeenNthCalledWith(
        1,
        "doctor-1",
      );

      expect(generateNextDayMock).toHaveBeenNthCalledWith(
        2,
        "doctor-2",
      );
    });

    it("should continue processing doctors when one doctor's generation fails", async () => {
      const doctors = [
        { _id: "doctor-1" },
        { _id: "doctor-2" },
      ];

      getDoctors(doctors);

      generateNextDayMock
        .mockRejectedValueOnce(new Error("Generation failed"))
        .mockResolvedValueOnce(["slot-1"]);

      await generateNextDayAppointmentsForAllDoctors();

      expect(generateNextDayMock).toHaveBeenCalledTimes(2);

      expect(console.error).toHaveBeenCalledWith(
        "[Appointment Job] Failed for doctor doctor-1:",
        "Generation failed",
      );
    });

    it("should do nothing when there are no active doctors", async () => {
      getDoctors([]);

      await generateNextDayAppointmentsForAllDoctors();

      expect(generateNextDayMock).not.toHaveBeenCalled();
    });

    it("should reject when fetching doctors fails", async () => {
      doctorFindMock.mockImplementation(() => {
        throw new Error("Database unavailable");
      });

      await expect(
        generateNextDayAppointmentsForAllDoctors(),
      ).rejects.toThrow("Database unavailable");
    });
  });

  // --------------------------------------------------
  // recoverMissingAppointments
  // --------------------------------------------------

  describe("recoverMissingAppointments", () => {
    it("should delete appointments older than two days", async () => {
      getDoctors([]);

      await recoverMissingAppointments();

      expect(deleteManyMock).toHaveBeenCalledWith({
        date: {
          $lt: new Date("2026-01-08T00:00:00.000Z"),
        },
      });
    });

    it("should generate an initial 30-day window when a doctor has no appointments", async () => {
      getDoctors([{ _id: "doctor-1" }]);

      findOneMock.mockReturnValue(
        getAppointmentQuery(null),
      );

      generateDoctorAppointmentsMock.mockResolvedValue([
        "slot-1",
        "slot-2",
      ]);

      await recoverMissingAppointments();

      expect(findOneMock).toHaveBeenCalledWith({
        doctor: "doctor-1",
      });

      expect(generateDoctorAppointmentsMock).toHaveBeenCalledWith(
        "doctor-1",
        today,
        30,
      );

      expect(generateAppointmentsForDateMock).not.toHaveBeenCalled();
    });

    it("should generate missing appointments from the day after the last appointment until day 29", async () => {
      getDoctors([{ _id: "doctor-1" }]);

      findOneMock.mockReturnValue(
        getAppointmentQuery({
          date: new Date("2026-02-06T00:00:00.000Z"),
        }),
      );

      generateAppointmentsForDateMock.mockResolvedValue([
        "slot-1",
      ]);

      await recoverMissingAppointments();

      expect(generateAppointmentsForDateMock).toHaveBeenCalledTimes(2);

      expect(generateAppointmentsForDateMock).toHaveBeenNthCalledWith(
        1,
        "doctor-1",
        new Date("2026-02-07T00:00:00.000Z"),
      );

      expect(generateAppointmentsForDateMock).toHaveBeenNthCalledWith(
        2,
        "doctor-1",
        new Date("2026-02-08T00:00:00.000Z"),
      );
    });

    it("should start recovery from today when the last appointment is before today", async () => {
      getDoctors([{ _id: "doctor-1" }]);

      findOneMock.mockReturnValue(
        getAppointmentQuery({
          date: new Date("2026-01-05T00:00:00.000Z"),
        }),
      );

      generateAppointmentsForDateMock.mockResolvedValue([]);

      await recoverMissingAppointments();

      expect(generateAppointmentsForDateMock).toHaveBeenCalledTimes(30);

      expect(generateAppointmentsForDateMock).toHaveBeenNthCalledWith(
        1,
        "doctor-1",
        new Date("2026-01-10T00:00:00.000Z"),
      );

      expect(generateAppointmentsForDateMock).toHaveBeenNthCalledWith(
        30,
        "doctor-1",
        new Date("2026-02-08T00:00:00.000Z"),
      );
    });

    it("should continue processing doctors when recovery fails for one doctor", async () => {
      getDoctors([
        { _id: "doctor-1" },
        { _id: "doctor-2" },
      ]);

      findOneMock
        .mockReturnValueOnce(
          getAppointmentQuery(null),
        )
        .mockReturnValueOnce(
          getAppointmentQuery(null),
        );

      generateDoctorAppointmentsMock
        .mockRejectedValueOnce(new Error("Recovery failed"))
        .mockResolvedValueOnce(["slot-1"]);

      await recoverMissingAppointments();

      expect(generateDoctorAppointmentsMock).toHaveBeenCalledTimes(2);

      expect(console.error).toHaveBeenCalledWith(
        "[Appointment Recovery] Failed for doctor doctor-1:",
        "Recovery failed",
      );
    });

    it("should reject when fetching doctors fails", async () => {
      doctorFindMock.mockImplementation(() => {
        throw new Error("Database unavailable");
      });

      await expect(
        recoverMissingAppointments(),
      ).rejects.toThrow("Database unavailable");

      expect(deleteManyMock).not.toHaveBeenCalled();
    });

    it("should reject when deleting old appointments fails", async () => {
      getDoctors([{ _id: "doctor-1" }]);

      deleteManyMock.mockRejectedValue(
        new Error("Delete failed"),
      );

      await expect(
        recoverMissingAppointments(),
      ).rejects.toThrow("Delete failed");

      expect(findOneMock).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // startAppointmentJob
  // --------------------------------------------------

  describe("startAppointmentJob", () => {
    it("should schedule daily appointment generation at 1 AM", () => {
      startAppointmentJob();

      expect(scheduleMock).toHaveBeenCalledWith(
        "0 1 * * *",
        expect.any(Function),
        { timezone: "Asia/Tehran" },
      );
    });

    it("should execute daily appointment generation when cron callback runs", async () => {
      getDoctors([{ _id: "doctor-1" }]);

      generateNextDayMock.mockResolvedValue(["slot-1"]);

      startAppointmentJob();

      const callback = getScheduledCallback("0 1 * * *");

      await callback();

      expect(generateNextDayMock).toHaveBeenCalledWith(
        "doctor-1",
      );

      expect(console.log).toHaveBeenCalledWith(
        "[Appointment Job] Daily appointment generation completed.",
      );
    });

    it("should catch errors when daily appointment generation fails", async () => {
      doctorFindMock.mockImplementation(() => {
        throw new Error("Database unavailable");
      });

      startAppointmentJob();

      const callback = getScheduledCallback("0 1 * * *");

      await callback();

      expect(console.error).toHaveBeenCalledWith(
        "[Appointment Job] Job failed:",
        expect.objectContaining({
          message: "Database unavailable",
        }),
      );
    });
  });

  // --------------------------------------------------
  // startReservationExpirationJob
  // --------------------------------------------------

  describe("startReservationExpirationJob", () => {
    it("should schedule reservation expiration every minute", () => {
      startReservationExpirationJob();

      expect(scheduleMock).toHaveBeenCalledWith(
        "* * * * *",
        expect.any(Function),
        { timezone: "Asia/Tehran" },
      );
    });

    it("should execute reservation expiration when cron callback runs", async () => {
      expireReservationsMock.mockResolvedValue({
        releasedAppointments: 1,
        cancelledBookings: 1,
        failedPayments: 0,
      });

      startReservationExpirationJob();

      const callback = getScheduledCallback("* * * * *");

      await callback();

      expect(expireReservationsMock).toHaveBeenCalledTimes(1);

      expect(console.log).toHaveBeenCalledWith(
        "[Reservation Expiration]",
        {
          releasedAppointments: 1,
          cancelledBookings: 1,
          failedPayments: 0,
        },
      );
    });

    it("should not log when no reservations need expiration", async () => {
      expireReservationsMock.mockResolvedValue({
        releasedAppointments: 0,
        cancelledBookings: 0,
        failedPayments: 0,
      });

      startReservationExpirationJob();

      const callback = getScheduledCallback("* * * * *");

      await callback();

      expect(expireReservationsMock).toHaveBeenCalledTimes(1);

      expect(console.log).not.toHaveBeenCalled();
    });

    it.each([
      {
        releasedAppointments: 1,
        cancelledBookings: 0,
        failedPayments: 0,
      },
      {
        releasedAppointments: 0,
        cancelledBookings: 1,
        failedPayments: 0,
      },
      {
        releasedAppointments: 0,
        cancelledBookings: 0,
        failedPayments: 1,
      },
    ])(
      "should log when at least one expiration result is positive",
      async (result) => {
        expireReservationsMock.mockResolvedValue(result);

        startReservationExpirationJob();

        const callback = getScheduledCallback("* * * * *");

        await callback();

        expect(console.log).toHaveBeenCalledWith(
          "[Reservation Expiration]",
          result,
        );
      },
    );

    it("should catch errors when reservation expiration fails", async () => {
      const error = new Error("Expiration failed");

      expireReservationsMock.mockRejectedValue(error);

      startReservationExpirationJob();

      const callback = getScheduledCallback("* * * * *");

      await callback();

      expect(console.error).toHaveBeenCalledWith(
        "[Reservation Expiration] Failed:",
        error,
      );
    });
  });
});
