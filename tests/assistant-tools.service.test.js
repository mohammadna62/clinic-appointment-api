import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  availableAppointmentMock,
  doctorMock,
  specialtyMock,
  clinicMock,
  userMock,
  getTodayLocalDateMock,
  addDaysMock,
} = vi.hoisted(() => ({
  availableAppointmentMock: {
    find: vi.fn(),
  },
  doctorMock: {
    find: vi.fn(),
  },
  specialtyMock: {
    find: vi.fn(),
  },
  clinicMock: {
    find: vi.fn(),
  },
  userMock: {
    find: vi.fn(),
  },
  getTodayLocalDateMock: vi.fn(),
  addDaysMock: vi.fn(),
}));

vi.mock("../src/models/available-appointment.model.js", () => ({
  default: availableAppointmentMock,
}));

vi.mock("../src/models/doctor.model.js", () => ({
  default: doctorMock,
}));

vi.mock("../src/models/specialty.model.js", () => ({
  default: specialtyMock,
}));

vi.mock("../src/models/clinic.model.js", () => ({
  default: clinicMock,
}));

vi.mock("../src/models/user.model.js", () => ({
  default: userMock,
}));

vi.mock("../src/utils/date.util.js", () => ({
  getTodayLocalDate: getTodayLocalDateMock,
  addDays: addDaysMock,
}));

import { findAvailableAppointments } from "../src/services/assistant-tools.service.js";

function createFindQuery(result) {
  const query = {
    select: vi.fn(),
    populate: vi.fn(),
    sort: vi.fn(),
    limit: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.limit.mockReturnValue(query);

  query.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);

  return query;
}

function createAppointmentQuery(result) {
  const query = {
    populate: vi.fn(),
    sort: vi.fn(),
    limit: vi.fn(),
  };

  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.limit.mockReturnValue(query);

  query.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);

  return query;
}

function createAppointment(overrides = {}) {
  return {
    _id: "appointment-1",
    date: new Date("2026-10-27T00:00:00.000Z"),
    startTime: "09:00",
    endTime: "09:30",
    price: 500000,
    doctor: {
      _id: "doctor-1",
      user: {
        firstName: "Ali",
        lastName: "Ahmadi",
      },
      specialty: {
        name: "Cardiology",
      },
    },
    clinic: {
      _id: "clinic-1",
      name: "Central Clinic",
    },
    ...overrides,
  };
}

describe("assistant-tools.service", () => {
  const today = new Date("2026-10-26T00:00:00.000Z");
  const tomorrow = new Date("2026-10-27T00:00:00.000Z");

  beforeEach(() => {
    vi.resetAllMocks();

    getTodayLocalDateMock.mockReturnValue(today);

    addDaysMock.mockImplementation((date, days) => {
      const result = new Date(date);
      result.setUTCDate(result.getUTCDate() + days);
      return result;
    });

    availableAppointmentMock.find.mockReturnValue(createAppointmentQuery([]));

    specialtyMock.find.mockReturnValue(createFindQuery([]));
    doctorMock.find.mockReturnValue(createFindQuery([]));
    userMock.find.mockReturnValue(createFindQuery([]));
    clinicMock.find.mockReturnValue(createFindQuery([]));
  });

  describe("basic search", () => {
    it("should return an empty array when no appointments are available", async () => {
      const result = await findAvailableAppointments({});

      expect(result).toEqual([]);

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
      });
    });

    it("should use a default limit of 10", async () => {
      const query = createAppointmentQuery([]);

      availableAppointmentMock.find.mockReturnValue(query);

      await findAvailableAppointments({});

      expect(query.limit).toHaveBeenCalledWith(10);
    });

    it("should use a custom limit", async () => {
      const query = createAppointmentQuery([]);

      availableAppointmentMock.find.mockReturnValue(query);

      await findAvailableAppointments({ limit: 5 });

      expect(query.limit).toHaveBeenCalledWith(5);
    });

    it("should sort appointments by date and start time", async () => {
      const query = createAppointmentQuery([]);

      availableAppointmentMock.find.mockReturnValue(query);

      await findAvailableAppointments({});

      expect(query.sort).toHaveBeenCalledWith({
        date: 1,
        startTime: 1,
      });
    });

    it("should populate doctor and clinic information", async () => {
      const query = createAppointmentQuery([]);

      availableAppointmentMock.find.mockReturnValue(query);

      await findAvailableAppointments({});

      expect(query.populate).toHaveBeenCalledTimes(2);

      expect(query.populate).toHaveBeenNthCalledWith(1, {
        path: "doctor",
        select: "user specialty clinic consultationFee",
        populate: [
          {
            path: "user",
            select: "firstName lastName",
          },
          {
            path: "specialty",
            select: "name",
          },
        ],
      });

      expect(query.populate).toHaveBeenNthCalledWith(2, "clinic", "name");
    });

    it("should map appointments to the expected response shape", async () => {
      const appointment = createAppointment();

      availableAppointmentMock.find.mockReturnValue(
        createAppointmentQuery([appointment]),
      );

      const result = await findAvailableAppointments({});

      expect(result).toEqual([
        {
          id: "appointment-1",
          date: appointment.date,
          startTime: "09:00",
          endTime: "09:30",
          price: 500000,
          doctor: {
            id: "doctor-1",
            firstName: "Ali",
            lastName: "Ahmadi",
            specialty: "Cardiology",
          },
          clinic: {
            id: "clinic-1",
            name: "Central Clinic",
          },
        },
      ]);
    });

    it("should handle missing populated doctor and clinic fields", async () => {
      const appointment = createAppointment({
        doctor: null,
        clinic: null,
      });

      availableAppointmentMock.find.mockReturnValue(
        createAppointmentQuery([appointment]),
      );

      const result = await findAvailableAppointments({});

      expect(result[0].doctor).toEqual({
        id: undefined,
        firstName: undefined,
        lastName: undefined,
        specialty: undefined,
      });

      expect(result[0].clinic).toEqual({
        id: undefined,
        name: undefined,
      });
    });
  });

  describe("date filters", () => {
    it("should filter appointments for today", async () => {
      await findAvailableAppointments({
        date: { type: "today" },
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      });
    });

    it("should filter appointments for tomorrow", async () => {
      await findAvailableAppointments({
        date: { type: "tomorrow" },
      });

      expect(addDaysMock).toHaveBeenCalledWith(today, 1);

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: tomorrow,
          $lt: new Date("2026-10-28T00:00:00.000Z"),
        },
      });
    });

    it("should use the next matching weekday", async () => {
      // 2026-10-26 is Monday.
      // The first matching Sunday is 2026-11-01.
      const sunday = new Date("2026-11-01T00:00:00.000Z");

      await findAvailableAppointments({
        date: {
          type: "weekday",
          weekday: "sunday",
        },
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: sunday,
          $lt: new Date("2026-11-02T00:00:00.000Z"),
        },
      });
    });

    it("should use the current date onward for an unsupported date type", async () => {
      await findAvailableAppointments({
        date: { type: "unsupported" },
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
      });
    });
  });

  describe("time filters", () => {
    it.each([
      [
        "morning",
        {
          $gte: "08:00",
          $lt: "12:00",
        },
      ],
      [
        "afternoon",
        {
          $gte: "12:00",
          $lt: "18:00",
        },
      ],
      [
        "evening",
        {
          $gte: "17:00",
          $lt: "21:00",
        },
      ],
    ])("should apply the %s time filter", async (timeRange, expected) => {
      await findAvailableAppointments({ timeRange });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
        startTime: expected,
      });
    });

    it("should not add a time filter for an unsupported range", async () => {
      await findAvailableAppointments({
        timeRange: "night",
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
      });
    });
  });

  describe("specialty filter", () => {
    it("should return an empty array when the specialty is not found", async () => {
      specialtyMock.find.mockReturnValue(createFindQuery([]));

      const result = await findAvailableAppointments({
        specialty: "Cardiology",
      });

      expect(result).toEqual([]);

      expect(specialtyMock.find).toHaveBeenCalledWith({
        name: expect.any(RegExp),
        isActive: true,
      });

      expect(doctorMock.find).not.toHaveBeenCalled();
      expect(availableAppointmentMock.find).not.toHaveBeenCalled();
    });

    it("should return an empty array when the specialty has no active doctors", async () => {
      specialtyMock.find.mockReturnValue(
        createFindQuery([{ _id: "specialty-1" }]),
      );

      doctorMock.find.mockReturnValue(createFindQuery([]));

      const result = await findAvailableAppointments({
        specialty: "Cardiology",
      });

      expect(doctorMock.find).toHaveBeenCalledWith({
        specialty: {
          $in: ["specialty-1"],
        },
        isActive: true,
      });

      expect(result).toEqual([]);
      expect(availableAppointmentMock.find).not.toHaveBeenCalled();
    });

    it("should filter appointments by specialty doctor IDs", async () => {
      specialtyMock.find.mockReturnValue(
        createFindQuery([{ _id: "specialty-1" }]),
      );

      doctorMock.find.mockReturnValue(createFindQuery([{ _id: "doctor-1" }]));

      await findAvailableAppointments({
        specialty: "Cardiology",
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
        doctor: {
          $in: ["doctor-1"],
        },
      });
    });

    it("should escape special RegExp characters in the specialty name", async () => {
      await findAvailableAppointments({
        specialty: "Heart (Care)+",
      });

      const specialtyRegex = specialtyMock.find.mock.calls[0][0].name;

      expect(specialtyRegex).toBeInstanceOf(RegExp);
      expect(specialtyRegex.source).toBe("Heart \\(Care\\)\\+");
      expect(specialtyRegex.flags).toContain("i");
    });
  });

  describe("doctor filter", () => {
    it("should return an empty array when no active doctor matches the search", async () => {
      userMock.find.mockReturnValue(createFindQuery([{ _id: "user-1" }]));

      doctorMock.find.mockReturnValue(createFindQuery([]));

      const result = await findAvailableAppointments({
        doctor: "Ali",
      });

      expect(userMock.find).toHaveBeenCalledWith({
        $or: [
          { firstName: expect.any(RegExp) },
          { lastName: expect.any(RegExp) },
        ],
      });

      expect(doctorMock.find).toHaveBeenCalledWith({
        user: {
          $in: ["user-1"],
        },
        isActive: true,
      });

      expect(result).toEqual([]);
      expect(availableAppointmentMock.find).not.toHaveBeenCalled();
    });

    it("should filter appointments by matching doctor IDs", async () => {
      userMock.find.mockReturnValue(createFindQuery([{ _id: "user-1" }]));

      doctorMock.find.mockReturnValue(createFindQuery([{ _id: "doctor-1" }]));

      await findAvailableAppointments({
        doctor: "Ali",
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
        doctor: {
          $in: ["doctor-1"],
        },
      });
    });

    it("should intersect doctor IDs when specialty and doctor are both provided", async () => {
      specialtyMock.find.mockReturnValue(
        createFindQuery([{ _id: "specialty-1" }]),
      );

      userMock.find.mockReturnValue(createFindQuery([{ _id: "user-1" }]));

      doctorMock.find
        .mockReturnValueOnce(
          createFindQuery([{ _id: "doctor-1" }, { _id: "doctor-2" }]),
        )
        .mockReturnValueOnce(createFindQuery([{ _id: "doctor-2" }]));

      await findAvailableAppointments({
        specialty: "Cardiology",
        doctor: "Ali",
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
        doctor: {
          $in: ["doctor-2"],
        },
      });
    });

    it("should return an empty array when specialty and doctor do not match", async () => {
      specialtyMock.find.mockReturnValue(
        createFindQuery([{ _id: "specialty-1" }]),
      );

      userMock.find.mockReturnValue(createFindQuery([{ _id: "user-1" }]));

      doctorMock.find
        .mockReturnValueOnce(createFindQuery([{ _id: "doctor-1" }]))
        .mockReturnValueOnce(createFindQuery([{ _id: "doctor-2" }]));

      const result = await findAvailableAppointments({
        specialty: "Cardiology",
        doctor: "Ali",
      });

      expect(result).toEqual([]);
      expect(availableAppointmentMock.find).not.toHaveBeenCalled();
    });
  });

  describe("clinic filter", () => {
    it("should return an empty array when the clinic is not found", async () => {
      clinicMock.find.mockReturnValue(createFindQuery([]));

      const result = await findAvailableAppointments({
        clinic: "Central Clinic",
      });

      expect(result).toEqual([]);
      expect(clinicMock.find).toHaveBeenCalledWith({
        name: expect.any(RegExp),
        isActive: true,
      });
      expect(availableAppointmentMock.find).not.toHaveBeenCalled();
    });

    it("should filter appointments by clinic IDs", async () => {
      clinicMock.find.mockReturnValue(createFindQuery([{ _id: "clinic-1" }]));

      await findAvailableAppointments({
        clinic: "Central Clinic",
      });

      expect(availableAppointmentMock.find).toHaveBeenCalledWith({
        status: "available",
        date: {
          $gte: today,
        },
        clinic: {
          $in: ["clinic-1"],
        },
      });
    });
  });
});
