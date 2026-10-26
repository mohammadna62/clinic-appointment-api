
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/available-appointment.model.js", () => ({
  default: {
    bulkWrite: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("../src/models/doctor-schedule.model.js", () => ({
  default: { find: vi.fn() },
}));

vi.mock("../src/models/doctor.model.js", () => ({
  default: { findById: vi.fn() },
}));

vi.mock("../src/models/clinic-time-policy.model.js", () => ({
  default: { findOne: vi.fn() },
}));

vi.mock("../src/models/clinic.model.js", () => ({
  default: { findById: vi.fn() },
}));

vi.mock("../src/models/user.model.js", () => ({
  default: { findById: vi.fn() },
}));

vi.mock("../src/services/user.service.js", () => ({
  isProfileCompleted: vi.fn(),
}));

vi.mock("../src/utils/pagination.util.js", () => ({
  createPaginationData: vi.fn((page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })),
}));

vi.mock("../src/utils/time.util.js", () => ({
  timeToMinutes: vi.fn((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }),
}));

vi.mock("../src/utils/date.util.js", () => ({
  getTodayLocalDate: vi.fn(),
  addDays: vi.fn((date, days) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }),
  getProjectDayOfWeek: vi.fn(() => 2),
  getCurrentProjectTimeInMinutes: vi.fn(() => 600),
}));

import AvailableAppointment from "../src/models/available-appointment.model.js";
import DoctorSchedule from "../src/models/doctor-schedule.model.js";
import Doctor from "../src/models/doctor.model.js";
import ClinicTimePolicy from "../src/models/clinic-time-policy.model.js";
import Clinic from "../src/models/clinic.model.js";
import User from "../src/models/user.model.js";
import { isProfileCompleted } from "../src/services/user.service.js";
import { createPaginationData } from "../src/utils/pagination.util.js";
import {
  getTodayLocalDate,
  addDays,
  getProjectDayOfWeek,
  getCurrentProjectTimeInMinutes,
} from "../src/utils/date.util.js";

import {
  generateAppointmentsForDate,
  generateDoctorAppointments,
  generateNextDayAppointments,
  getAvailableAppointments,
  updateAppointmentStatus,
  reserveAppointment,
  getAdminAppointments,
} from "../src/services/available-appointment.service.js";

describe("Available Appointment Service", () => {
  const doctorId = "doctor-1";
  const clinicId = "clinic-1";
  const userId = "user-1";
  const appointmentId = "appointment-1";
  const date = new Date("2026-11-03T00:00:00.000Z");

  const doctor = {
    _id: doctorId,
    clinic: clinicId,
    isActive: true,
    consultationFee: 500000,
  };

  const clinic = {
    _id: clinicId,
    isActive: true,
  };

  const policy = {
    appointmentDuration: 30,
  };

  const schedule = {
    startTime: "09:00",
    endTime: "10:30",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    Doctor.findById.mockResolvedValue(doctor);
    Clinic.findById.mockResolvedValue(clinic);
    ClinicTimePolicy.findOne.mockResolvedValue(policy);
    DoctorSchedule.find.mockResolvedValue([schedule]);

    AvailableAppointment.bulkWrite.mockResolvedValue({});

    getTodayLocalDate.mockReturnValue(
      new Date("2026-11-02T00:00:00.000Z"),
    );
    getCurrentProjectTimeInMinutes.mockReturnValue(600);
    getProjectDayOfWeek.mockReturnValue(2);
  });

  describe("generateAppointmentsForDate", () => {
    it("should generate appointment slots from an active schedule", async () => {
      const result = await generateAppointmentsForDate(doctorId, date);

      expect(result).toHaveLength(3);

      expect(result).toEqual([
        {
          doctor: doctorId,
          clinic: clinicId,
          date,
          startTime: "09:00",
          endTime: "09:30",
          price: 500000,
        },
        {
          doctor: doctorId,
          clinic: clinicId,
          date,
          startTime: "09:30",
          endTime: "10:00",
          price: 500000,
        },
        {
          doctor: doctorId,
          clinic: clinicId,
          date,
          startTime: "10:00",
          endTime: "10:30",
          price: 500000,
        },
      ]);

      expect(AvailableAppointment.bulkWrite).toHaveBeenCalledTimes(1);
    });

    it("should throw 404 when the doctor does not exist", async () => {
      Doctor.findById.mockResolvedValue(null);

      await expect(
        generateAppointmentsForDate(doctorId, date),
      ).rejects.toMatchObject({
        message: "Doctor not found",
        statusCode: 404,
      });

      expect(Clinic.findById).not.toHaveBeenCalled();
    });

    it("should throw 409 when the doctor is inactive", async () => {
      Doctor.findById.mockResolvedValue({
        ...doctor,
        isActive: false,
      });

      await expect(
        generateAppointmentsForDate(doctorId, date),
      ).rejects.toMatchObject({
        message: "Doctor is inactive",
        statusCode: 409,
      });
    });

    it("should throw 404 when the clinic does not exist", async () => {
      Clinic.findById.mockResolvedValue(null);

      await expect(
        generateAppointmentsForDate(doctorId, date),
      ).rejects.toMatchObject({
        message: "Clinic not found",
        statusCode: 404,
      });
    });

    it("should throw 409 when the clinic is inactive", async () => {
      Clinic.findById.mockResolvedValue({
        ...clinic,
        isActive: false,
      });

      await expect(
        generateAppointmentsForDate(doctorId, date),
      ).rejects.toMatchObject({
        message: "Clinic is inactive",
        statusCode: 409,
      });
    });

    it("should throw 404 when there is no active clinic time policy", async () => {
      ClinicTimePolicy.findOne.mockResolvedValue(null);

      await expect(
        generateAppointmentsForDate(doctorId, date),
      ).rejects.toMatchObject({
        message: "Active clinic time policy not found",
        statusCode: 404,
      });
    });

    it("should return an empty array when no active schedule exists", async () => {
      DoctorSchedule.find.mockResolvedValue([]);

      const result = await generateAppointmentsForDate(doctorId, date);

      expect(result).toEqual([]);
      expect(AvailableAppointment.bulkWrite).not.toHaveBeenCalled();
    });

    it("should not create a partial appointment when the duration exceeds the schedule", async () => {
      DoctorSchedule.find.mockResolvedValue([
        {
          startTime: "09:00",
          endTime: "09:20",
        },
      ]);

      const result = await generateAppointmentsForDate(doctorId, date);

      expect(result).toEqual([]);
      expect(AvailableAppointment.bulkWrite).not.toHaveBeenCalled();
    });

    it("should use upsert and $setOnInsert to avoid inserting duplicate slots", async () => {
      await generateAppointmentsForDate(doctorId, date);

      const operations = AvailableAppointment.bulkWrite.mock.calls[0][0];

      expect(operations).toHaveLength(3);

      expect(operations[0]).toEqual({
        updateOne: {
          filter: {
            doctor: doctorId,
            date,
            startTime: "09:00",
            endTime: "09:30",
          },
          update: {
            $setOnInsert: {
              doctor: doctorId,
              clinic: clinicId,
              date,
              startTime: "09:00",
              endTime: "09:30",
              price: 500000,
            },
          },
          upsert: true,
        },
      });
    });
  });

  describe("generateDoctorAppointments", () => {
    it("should generate appointments for each requested day", async () => {
      const generated = [
        { startTime: "09:00", endTime: "09:30" },
      ];

      const generator = vi
        .spyOn(
          await import("../src/services/available-appointment.service.js"),
          "generateAppointmentsForDate",
        );

      // This function calls its local binding, so the date utility
      // and the real implementation are tested through the loop.
      generator.mockRestore();

      DoctorSchedule.find.mockResolvedValue([]);

      const result = await generateDoctorAppointments(
        doctorId,
        date,
        3,
      );

      expect(result).toEqual([]);
      expect(Doctor.findById).toHaveBeenCalledTimes(3);
      expect(addDays).toHaveBeenCalledTimes(3);
    });

    it("should return an empty array when days is zero", async () => {
      const result = await generateDoctorAppointments(
        doctorId,
        date,
        0,
      );

      expect(result).toEqual([]);
      expect(Doctor.findById).not.toHaveBeenCalled();
    });
  });

  describe("generateNextDayAppointments", () => {
    it("should generate appointments for the date 29 days after today", async () => {
      DoctorSchedule.find.mockResolvedValue([]);

      const today = new Date("2026-11-02T00:00:00.000Z");

      const result = await generateNextDayAppointments(doctorId, today);

      expect(addDays).toHaveBeenCalledWith(today, 29);
      expect(result).toEqual([]);
    });
  });

  describe("getAvailableAppointments", () => {
    function mockFindQuery(appointments) {
      const query = {
        populate: vi.fn(),
        sort: vi.fn(),
        skip: vi.fn(),
        limit: vi.fn(),
      };

      query.populate.mockReturnValue(query);
      query.sort.mockReturnValue(query);
      query.skip.mockReturnValue(query);
      query.limit.mockResolvedValue(appointments);

      AvailableAppointment.find.mockReturnValue(query);
      AvailableAppointment.countDocuments.mockResolvedValue(
        appointments.length,
      );

      return query;
    }

    it("should return available appointments grouped by clinic and doctor", async () => {
      const clinic = {
        _id: "clinic-1",
        name: "Clinic A",
      };

      const doctor = {
        _id: "doctor-1",
        firstName: "Ali",
        lastName: "Ahmadi",
      };

      const appointments = [
        {
          _id: "a1",
          clinic,
          doctor,
          startTime: "11:00",
        },
        {
          _id: "a2",
          clinic,
          doctor,
          startTime: "11:30",
        },
      ];

      mockFindQuery(appointments);

      const result = await getAvailableAppointments(1, 20);

      expect(result.appointments).toHaveLength(1);
      expect(result.appointments[0].clinic).toBe(clinic);
      expect(result.appointments[0].doctors).toHaveLength(1);
      expect(result.appointments[0].doctors[0].doctor).toBe(doctor);
      expect(result.appointments[0].doctors[0].appointments).toEqual(
        appointments,
      );

      expect(createPaginationData).toHaveBeenCalledWith(1, 20, 2);
    });

    it("should separate appointments belonging to different clinics", async () => {
      mockFindQuery([
        {
          clinic: { _id: "clinic-1" },
          doctor: { _id: "doctor-1" },
        },
        {
          clinic: { _id: "clinic-2" },
          doctor: { _id: "doctor-2" },
        },
      ]);

      const result = await getAvailableAppointments();

      expect(result.appointments).toHaveLength(2);
    });

    it("should filter for available future appointments", async () => {
      mockFindQuery([]);

      await getAvailableAppointments(2, 10);

      expect(AvailableAppointment.find).toHaveBeenCalledWith({
        status: "available",
        $or: [
          {
            date: {
              $gt: getTodayLocalDate(),
            },
          },
          {
            date: getTodayLocalDate(),
            startTime: {
              $gt: "10:00",
            },
          },
        ],
      });
    });

    it("should apply pagination to the query", async () => {
      const query = mockFindQuery([]);

      await getAvailableAppointments(3, 10);

      expect(query.skip).toHaveBeenCalledWith(20);
      expect(query.limit).toHaveBeenCalledWith(10);
    });
  });

  describe("updateAppointmentStatus", () => {
    function makeAppointment(status) {
      return {
        _id: appointmentId,
        status,
        reservedBy: userId,
        reservedUntil: new Date(),
        save: vi.fn().mockResolvedValue(undefined),
      };
    }

    it("should throw 404 when the appointment does not exist", async () => {
      AvailableAppointment.findById.mockResolvedValue(null);

      await expect(
        updateAppointmentStatus(appointmentId, "available"),
      ).rejects.toMatchObject({
        message: "Appointment not found",
        statusCode: 404,
      });
    });

    it("should reject changing a booked appointment to a non-available status", async () => {
      AvailableAppointment.findById.mockResolvedValue(
        makeAppointment("booked"),
      );

      await expect(
        updateAppointmentStatus(appointmentId, "suspended"),
      ).rejects.toMatchObject({
        message: "Booked appointment can only be released to available",
        statusCode: 409,
      });
    });

    it("should reject manually changing a reserved appointment", async () => {
      AvailableAppointment.findById.mockResolvedValue(
        makeAppointment("reserved"),
      );

      await expect(
        updateAppointmentStatus(appointmentId, "available"),
      ).rejects.toMatchObject({
        message: "Reserved appointment status cannot be changed manually",
        statusCode: 409,
      });
    });

    it("should clear reservation fields when an appointment becomes available", async () => {
      const appointment = makeAppointment("suspended");

      AvailableAppointment.findById.mockResolvedValue(appointment);

      const result = await updateAppointmentStatus(
        appointmentId,
        "available",
      );

      expect(result.status).toBe("available");
      expect(result.reservedBy).toBeNull();
      expect(result.reservedUntil).toBeNull();
      expect(appointment.save).toHaveBeenCalledTimes(1);
    });

    it("should save a valid status change", async () => {
      const appointment = makeAppointment("available");

      AvailableAppointment.findById.mockResolvedValue(appointment);

      await updateAppointmentStatus(appointmentId, "suspended");

      expect(appointment.status).toBe("suspended");
      expect(appointment.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("reserveAppointment", () => {
    const completeUser = {
      _id: userId,
      firstName: "Ali",
      lastName: "Ahmadi",
      nationalCode: "1234567890",
    };

    it("should throw 404 when the user does not exist", async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        reserveAppointment(appointmentId, userId),
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });

      expect(AvailableAppointment.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should reject users whose profiles are incomplete", async () => {
      User.findById.mockResolvedValue(completeUser);
      isProfileCompleted.mockReturnValue(false);

      await expect(
        reserveAppointment(appointmentId, userId),
      ).rejects.toMatchObject({
        message: "User Profile is not completed",
        statusCode: 409,
      });

      expect(AvailableAppointment.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should reserve an available future appointment atomically", async () => {
      const reservedAppointment = {
        _id: appointmentId,
        status: "reserved",
        reservedBy: userId,
      };

      User.findById.mockResolvedValue(completeUser);
      isProfileCompleted.mockReturnValue(true);
      AvailableAppointment.findOneAndUpdate.mockResolvedValue(
        reservedAppointment,
      );

      const result = await reserveAppointment(appointmentId, userId);

      expect(result).toBe(reservedAppointment);

      expect(AvailableAppointment.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: appointmentId,
          status: "available",
          $or: [
            {
              date: {
                $gt: getTodayLocalDate(),
              },
            },
            {
              date: getTodayLocalDate(),
              startTime: {
                $gt: "10:00",
              },
            },
          ],
        },
        {
          $set: expect.objectContaining({
            status: "reserved",
            reservedBy: userId,
            reservedUntil: expect.any(Date),
          }),
        },
        {
          new: true,
        },
      );
    });

    it("should throw 409 when the appointment is no longer available", async () => {
      User.findById.mockResolvedValue(completeUser);
      isProfileCompleted.mockReturnValue(true);
      AvailableAppointment.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        reserveAppointment(appointmentId, userId),
      ).rejects.toMatchObject({
        message: "Appointment is no longer available",
        statusCode: 409,
      });
    });
  });

  describe("getAdminAppointments", () => {
    function mockAdminFindQuery(appointments) {
      const query = {
        populate: vi.fn(),
        sort: vi.fn(),
        skip: vi.fn(),
        limit: vi.fn(),
      };

      query.populate.mockReturnValue(query);
      query.sort.mockReturnValue(query);
      query.skip.mockReturnValue(query);
      query.limit.mockResolvedValue(appointments);

      AvailableAppointment.find.mockReturnValue(query);
      AvailableAppointment.countDocuments.mockResolvedValue(appointments.length);

      return query;
    }

    it("should return paginated appointments without a status filter by default", async () => {
      const appointments = [{ _id: "a1" }];
      mockAdminFindQuery(appointments);

      const result = await getAdminAppointments(1, 20);

      expect(AvailableAppointment.find).toHaveBeenCalledWith({});
      expect(result.appointments).toEqual(appointments);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("should filter appointments by the requested status", async () => {
      mockAdminFindQuery([]);

      await getAdminAppointments(2, 10, "booked");

      expect(AvailableAppointment.find).toHaveBeenCalledWith({
        status: "booked",
      });

      expect(AvailableAppointment.countDocuments).toHaveBeenCalledWith({
        status: "booked",
      });
    });

    it("should apply sorting and pagination", async () => {
      const query = mockAdminFindQuery([]);

      await getAdminAppointments(3, 10);

      expect(query.sort).toHaveBeenCalledWith({
        date: 1,
        startTime: 1,
      });

      expect(query.skip).toHaveBeenCalledWith(20);
      expect(query.limit).toHaveBeenCalledWith(10);
    });
  });
});
