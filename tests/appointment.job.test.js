
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
  generateNextDayMock,
  expireReservationsMock,
} = vi.hoisted(() => ({
  scheduleMock: vi.fn(),
  doctorFindMock: vi.fn(),
  generateNextDayMock: vi.fn(),
  expireReservationsMock: vi.fn(),
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
    deleteMany: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../src/services/available-appointment.service.js", () => ({
  generateAppointmentsForDate: vi.fn(),
  generateDoctorAppointments: vi.fn(),
  generateNextDayAppointments: generateNextDayMock,
}));

vi.mock("../src/services/reservation.service.js", () => ({
  expireReservations: expireReservationsMock,
}));

vi.mock("../src/utils/date.util.js", () => ({
  getTodayLocalDate: vi.fn(),
  addDays: vi.fn(),
}));

import {
  generateNextDayAppointmentsForAllDoctors,
  startAppointmentJob,
  startReservationExpirationJob,
} from "../src/jobs/appointment.job.js";

describe("Appointment jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should generate next-day appointments for every active doctor", async () => {
    const doctors = [{ _id: "doctor-1" }, { _id: "doctor-2" }];

    doctorFindMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(doctors),
    });

    generateNextDayMock
      .mockResolvedValueOnce(["slot-1", "slot-2"])
      .mockResolvedValueOnce(["slot-3"]);

    await generateNextDayAppointmentsForAllDoctors();

    expect(doctorFindMock).toHaveBeenCalledWith({
      isActive: true,
    });

    expect(generateNextDayMock).toHaveBeenCalledTimes(2);
    expect(generateNextDayMock).toHaveBeenNthCalledWith(1, "doctor-1");
    expect(generateNextDayMock).toHaveBeenNthCalledWith(2, "doctor-2");
  });

  it("should continue processing doctors when one doctor's generation fails", async () => {
    const doctors = [{ _id: "doctor-1" }, { _id: "doctor-2" }];

    doctorFindMock.mockReturnValue({
      select: vi.fn().mockResolvedValue(doctors),
    });

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

  it("should schedule daily appointment generation at 1 AM", () => {
    startAppointmentJob();

    expect(scheduleMock).toHaveBeenCalledWith(
      "0 1 * * *",
      expect.any(Function),
      { timezone: "Asia/Tehran" },
    );
  });

  it("should schedule reservation expiration every minute", () => {
    startReservationExpirationJob();

    expect(scheduleMock).toHaveBeenCalledWith(
      "* * * * *",
      expect.any(Function),
      { timezone: "Asia/Tehran" },
    );
  });
});
