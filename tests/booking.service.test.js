import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  bookingMock,
  doctorMock,
  appointmentMock,
  paymentMock,
  createPaginationDataMock,
  getStatisticsDateRangeMock,
} = vi.hoisted(() => ({
  bookingMock: {
    findOne: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    distinct: vi.fn(),
  },
  doctorMock: {
    findOne: vi.fn(),
  },
  appointmentMock: {
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
  paymentMock: {
    findOne: vi.fn(),
  },
  createPaginationDataMock: vi.fn(),
  getStatisticsDateRangeMock: vi.fn(),
}));

vi.mock("../src/models/booking.model.js", () => ({
  default: bookingMock,
}));

vi.mock("../src/models/doctor.model.js", () => ({
  default: doctorMock,
}));

vi.mock("../src/models/available-appointment.model.js", () => ({
  default: appointmentMock,
}));

vi.mock("../src/models/payment.model.js", () => ({
  default: paymentMock,
}));

vi.mock("../src/utils/pagination.util.js", () => ({
  createPaginationData: createPaginationDataMock,
}));

vi.mock("../src/utils/statistics.util.js", () => ({
  getStatisticsDateRange: getStatisticsDateRangeMock,
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
} from "../src/services/booking.service.js";

function createQuery(result) {
  const query = {
    populate: vi.fn(),
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
  };

  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);

  query.then = (resolve, reject) =>
    Promise.resolve(result).then(resolve, reject);

  return query;
}

function createBookingDocument(overrides = {}) {
  return {
    _id: "booking-1",
    patient: "patient-1",
    appointment: "appointment-1",
    doctor: "doctor-1",
    clinic: "clinic-1",
    date: new Date("2030-06-15T00:00:00.000Z"),
    startTime: "10:00",
    endTime: "10:30",
    amountInRial: 500000,
    status: "pending",
    cancellationReason: null,
    refundEligible: false,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createAppointmentDocument(overrides = {}) {
  return {
    _id: "appointment-1",
    doctor: "doctor-1",
    clinic: "clinic-1",
    date: new Date("2030-06-15T00:00:00.000Z"),
    startTime: "10:00",
    endTime: "10:30",
    price: 500000,
    status: "reserved",
    reservedBy: "patient-1",
    reservedUntil: new Date("2030-06-15T09:00:00.000Z"),
    ...overrides,
  };
}

describe("booking.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createPaginationDataMock.mockReturnValue({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });

    getStatisticsDateRangeMock.mockReturnValue({
      startDate: new Date("2030-06-01T00:00:00.000Z"),
      endDate: new Date("2030-06-30T23:59:59.999Z"),
    });
  });

  describe("createBooking", () => {
    it("should create a booking for a valid reservation", async () => {
      const appointment = createAppointmentDocument();

      appointmentMock.findById.mockResolvedValue(appointment);
      bookingMock.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const createdBooking = createBookingDocument();
      bookingMock.create.mockResolvedValue(createdBooking);

      const result = await createBooking("appointment-1", "patient-1");

      expect(appointmentMock.findById).toHaveBeenCalledWith(
        "appointment-1",
      );

      expect(bookingMock.create).toHaveBeenCalledWith({
        patient: "patient-1",
        appointment: "appointment-1",
        doctor: "doctor-1",
        clinic: "clinic-1",
        date: appointment.date,
        startTime: "10:00",
        endTime: "10:30",
        amountInRial: 500000,
        status: "pending",
      });

      expect(result).toBe(createdBooking);
    });

    it("should reject when the appointment does not exist", async () => {
      appointmentMock.findById.mockResolvedValue(null);

      await expect(
        createBooking("missing-appointment", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment not found",
        statusCode: 404,
      });

      expect(bookingMock.create).not.toHaveBeenCalled();
    });

    it("should reject an appointment that is not reserved", async () => {
      appointmentMock.findById.mockResolvedValue(
        createAppointmentDocument({ status: "available" }),
      );

      await expect(
        createBooking("appointment-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment must be reserved before creating a booking",
        statusCode: 409,
      });
    });

    it("should reject a reservation without a patient", async () => {
      appointmentMock.findById.mockResolvedValue(
        createAppointmentDocument({ reservedBy: null }),
      );

      await expect(
        createBooking("appointment-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment is not reserved by any patient",
        statusCode: 409,
      });
    });

    it("should reject when another patient owns the reservation", async () => {
      appointmentMock.findById.mockResolvedValue(
        createAppointmentDocument({ reservedBy: "patient-2" }),
      );

      await expect(
        createBooking("appointment-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment is reserved by another patient",
        statusCode: 409,
      });
    });

    it("should reject an expired reservation", async () => {
      appointmentMock.findById.mockResolvedValue(
        createAppointmentDocument({
          reservedUntil: new Date("2020-01-01T00:00:00.000Z"),
        }),
      );

      await expect(
        createBooking("appointment-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment reservation has expired",
        statusCode: 409,
      });
    });

    it("should reject when a booking already exists for the appointment", async () => {
      appointmentMock.findById.mockResolvedValue(
        createAppointmentDocument(),
      );
      bookingMock.findOne.mockResolvedValueOnce(
        createBookingDocument(),
      );

      await expect(
        createBooking("appointment-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "A booking already exists for this appointment",
        statusCode: 409,
      });
    });

    it("should reject overlapping active bookings for the patient", async () => {
      appointmentMock.findById.mockResolvedValue(
        createAppointmentDocument(),
      );

      bookingMock.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createBookingDocument());

      await expect(
        createBooking("appointment-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Patient already has an overlapping booking",
        statusCode: 409,
      });

      expect(bookingMock.create).not.toHaveBeenCalled();
    });
  });

  describe("getPatientBookings", () => {
    it("should return patient bookings and pagination", async () => {
      const bookings = [createBookingDocument()];
      const query = createQuery(bookings);

      bookingMock.find.mockReturnValue(query);
      bookingMock.countDocuments.mockResolvedValue(1);

      const result = await getPatientBookings("patient-1", 2, 10);

      expect(bookingMock.find).toHaveBeenCalledWith({
        patient: "patient-1",
      });
      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.limit).toHaveBeenCalledWith(10);
      expect(createPaginationDataMock).toHaveBeenCalledWith(2, 10, 1);
      expect(result).toEqual({
        bookings,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe("getPatientBookingById", () => {
    it("should return a booking belonging to the patient", async () => {
      const booking = createBookingDocument();
      bookingMock.findOne.mockReturnValue(createQuery(booking));

      const result = await getPatientBookingById(
        "booking-1",
        "patient-1",
      );

      expect(bookingMock.findOne).toHaveBeenCalledWith({
        _id: "booking-1",
        patient: "patient-1",
      });
      expect(result).toBe(booking);
    });

    it("should reject when the patient's booking is not found", async () => {
      bookingMock.findOne.mockReturnValue(createQuery(null));

      await expect(
        getPatientBookingById("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });
    });
  });

  describe("cancelPatientBooking", () => {
    it("should cancel a booking and release its appointment", async () => {
      const booking = createBookingDocument();
      const appointment = { _id: "appointment-1", status: "available" };

      bookingMock.findById.mockResolvedValue(booking);
      paymentMock.findOne.mockResolvedValue(null);
      appointmentMock.findOneAndUpdate.mockResolvedValue(appointment);

      const result = await cancelPatientBooking(
        "booking-1",
        "patient-1",
      );

      expect(booking.status).toBe("cancelled");
      expect(booking.cancellationReason).toBe("patient_cancelled");
      expect(booking.refundEligible).toBe(true);
      expect(booking.save).toHaveBeenCalledOnce();

      expect(appointmentMock.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: "appointment-1",
          status: { $in: ["reserved", "booked"] },
        },
        {
          $set: {
            status: "available",
            reservedBy: null,
            reservedUntil: null,
          },
        },
        { new: true },
      );

      expect(result).toEqual({
        booking,
        appointment,
        payment: null,
        refundEligible: true,
      });
    });

    it("should reject when the booking does not exist", async () => {
      bookingMock.findById.mockResolvedValue(null);

      await expect(
        cancelPatientBooking("missing-booking", "patient-1"),
      ).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });
    });

    it("should reject cancellation by another patient", async () => {
      bookingMock.findById.mockResolvedValue(
        createBookingDocument({ patient: "patient-2" }),
      );

      await expect(
        cancelPatientBooking("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "You are not allowed to cancel this booking",
        statusCode: 403,
      });
    });

    it("should reject cancellation of a completed booking", async () => {
      bookingMock.findById.mockResolvedValue(
        createBookingDocument({ status: "completed" }),
      );

      await expect(
        cancelPatientBooking("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Only pending or confirmed bookings can be cancelled",
        statusCode: 409,
      });
    });

    it("should mark a pending payment as failed during cancellation", async () => {
      const booking = createBookingDocument();
      const payment = {
        status: "pending",
        save: vi.fn().mockResolvedValue(undefined),
      };

      bookingMock.findById.mockResolvedValue(booking);
      paymentMock.findOne.mockResolvedValue(payment);
      appointmentMock.findOneAndUpdate.mockResolvedValue(null);

      await cancelPatientBooking("booking-1", "patient-1");

      expect(payment.status).toBe("failed");
      expect(payment.save).toHaveBeenCalledOnce();
    });
  });

  describe("getDoctorBookings", () => {
    it("should return bookings for the current doctor", async () => {
      const doctor = { _id: "doctor-1" };
      const bookings = [createBookingDocument()];
      const query = createQuery(bookings);

      doctorMock.findOne.mockResolvedValue(doctor);
      bookingMock.find.mockReturnValue(query);
      bookingMock.countDocuments.mockResolvedValue(1);

      const result = await getDoctorBookings("doctor-user-1", 1, 20);

      expect(doctorMock.findOne).toHaveBeenCalledWith({
        user: "doctor-user-1",
      });
      expect(bookingMock.find).toHaveBeenCalledWith({
        doctor: "doctor-1",
      });
      expect(result.bookings).toBe(bookings);
    });

    it("should reject when the doctor profile does not exist", async () => {
      doctorMock.findOne.mockResolvedValue(null);

      await expect(
        getDoctorBookings("doctor-user-1"),
      ).rejects.toMatchObject({
        message: "Doctor profile not found",
        statusCode: 404,
      });
    });
  });

  describe("getDoctorBookingById", () => {
    it("should return a booking belonging to the current doctor", async () => {
      doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });

      const booking = createBookingDocument();
      bookingMock.findOne.mockReturnValue(createQuery(booking));

      const result = await getDoctorBookingById(
        "booking-1",
        "doctor-user-1",
      );

      expect(bookingMock.findOne).toHaveBeenCalledWith({
        _id: "booking-1",
        doctor: "doctor-1",
      });
      expect(result).toBe(booking);
    });

    it("should reject when the booking is not found", async () => {
      doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });
      bookingMock.findOne.mockReturnValue(createQuery(null));

      await expect(
        getDoctorBookingById("booking-1", "doctor-user-1"),
      ).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });
    });
  });

  describe("completeDoctorBooking", () => {
    it("should complete a confirmed booking after its start time", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2030-06-15T10:15:00.000Z"));

      try {
        const booking = createBookingDocument({
          status: "confirmed",
          date: new Date("2030-06-15T00:00:00.000Z"),
          startTime: "10:00",
        });

        doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });
        bookingMock.findOne.mockResolvedValue(booking);

        const result = await completeDoctorBooking(
          "booking-1",
          "doctor-user-1",
        );

        expect(booking.status).toBe("completed");
        expect(booking.save).toHaveBeenCalledOnce();
        expect(result).toBe(booking);
      } finally {
        vi.useRealTimers();
      }
    });

    it("should reject when the doctor profile does not exist", async () => {
      doctorMock.findOne.mockResolvedValue(null);

      await expect(
        completeDoctorBooking("booking-1", "doctor-user-1"),
      ).rejects.toMatchObject({
        message: "Doctor profile not found",
        statusCode: 404,
      });
    });

    it("should reject when the booking does not belong to the doctor", async () => {
      doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });
      bookingMock.findOne.mockResolvedValue(null);

      await expect(
        completeDoctorBooking("booking-1", "doctor-user-1"),
      ).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });
    });

    it("should reject completion of a non-confirmed booking", async () => {
      doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });
      bookingMock.findOne.mockResolvedValue(
        createBookingDocument({ status: "pending" }),
      );

      await expect(
        completeDoctorBooking("booking-1", "doctor-user-1"),
      ).rejects.toMatchObject({
        message: "Only confirmed bookings can be completed",
        statusCode: 409,
      });
    });

    it("should reject completion before the appointment starts", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2030-06-15T09:00:00.000Z"));

      try {
        doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });
        bookingMock.findOne.mockResolvedValue(
          createBookingDocument({ status: "confirmed" }),
        );

        await expect(
          completeDoctorBooking("booking-1", "doctor-user-1"),
        ).rejects.toMatchObject({
          message: "Booking cannot be completed before the appointment starts",
          statusCode: 409,
        });
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("markPatientNoShow", () => {
    it("should mark a confirmed booking as patient no-show after start time", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2030-06-15T10:15:00.000Z"));

      try {
        const booking = createBookingDocument({
          status: "confirmed",
          startTime: "10:00",
        });

        doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });
        bookingMock.findOne.mockResolvedValue(booking);

        const result = await markPatientNoShow(
          "booking-1",
          "doctor-user-1",
        );

        expect(booking.status).toBe("patient_no_show");
        expect(booking.save).toHaveBeenCalledOnce();
        expect(result).toBe(booking);
      } finally {
        vi.useRealTimers();
      }
    });

    it("should reject marking a non-confirmed booking as no-show", async () => {
      doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });
      bookingMock.findOne.mockResolvedValue(
        createBookingDocument({ status: "pending" }),
      );

      await expect(
        markPatientNoShow("booking-1", "doctor-user-1"),
      ).rejects.toMatchObject({
        message: "Only confirmed bookings can be marked as patient no-show",
        statusCode: 409,
      });
    });
  });

  describe("getAdminBookings", () => {
    it("should return all bookings with pagination when no status is provided", async () => {
      const bookings = [createBookingDocument()];
      bookingMock.find.mockReturnValue(createQuery(bookings));
      bookingMock.countDocuments.mockResolvedValue(1);

      const result = await getAdminBookings(1, 20);

      expect(bookingMock.find).toHaveBeenCalledWith({});
      expect(bookingMock.countDocuments).toHaveBeenCalledWith({});
      expect(result.bookings).toBe(bookings);
    });

    it("should filter bookings by status when status is provided", async () => {
      bookingMock.find.mockReturnValue(createQuery([]));
      bookingMock.countDocuments.mockResolvedValue(0);

      await getAdminBookings(1, 20, "confirmed");

      expect(bookingMock.find).toHaveBeenCalledWith({
        status: "confirmed",
      });
      expect(bookingMock.countDocuments).toHaveBeenCalledWith({
        status: "confirmed",
      });
    });
  });

  describe("getAdminBookingById", () => {
    it("should return the requested booking", async () => {
      const booking = createBookingDocument();
      bookingMock.findById.mockReturnValue(createQuery(booking));

      const result = await getAdminBookingById("booking-1");

      expect(bookingMock.findById).toHaveBeenCalledWith("booking-1");
      expect(result).toBe(booking);
    });

    it("should reject when the booking does not exist", async () => {
      bookingMock.findById.mockReturnValue(createQuery(null));

      await expect(
        getAdminBookingById("missing-booking"),
      ).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });
    });
  });

  describe("getDoctorStatistics", () => {
    it("should return booking counts and unique patient totals", async () => {
      doctorMock.findOne.mockResolvedValue({ _id: "doctor-1" });

      bookingMock.countDocuments
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      bookingMock.distinct.mockResolvedValue([
        "patient-1",
        "patient-2",
        "patient-3",
      ]);

      const result = await getDoctorStatistics(
        "doctor-user-1",
        "month",
      );

      expect(result).toEqual({
        period: "month",
        startDate: new Date("2030-06-01T00:00:00.000Z"),
        endDate: new Date("2030-06-30T23:59:59.999Z"),
        bookings: {
          total: 10,
          pending: 2,
          confirmed: 3,
          completed: 2,
          cancelled: 1,
          patientNoShow: 2,
        },
        patients: {
          unique: 3,
        },
      });
    });

    it("should reject when the doctor profile does not exist", async () => {
      doctorMock.findOne.mockResolvedValue(null);

      await expect(
        getDoctorStatistics("doctor-user-1"),
      ).rejects.toMatchObject({
        message: "Doctor profile not found",
        statusCode: 404,
      });
    });
  });
});