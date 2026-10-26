
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  paymentMock,
  bookingMock,
  appointmentMock,
  createZarinpalPaymentMock,
  verifyZarinpalPaymentMock,
  createPaginationDataMock,
} = vi.hoisted(() => ({
  paymentMock: {
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
  },
  bookingMock: {
    findById: vi.fn(),
  },
  appointmentMock: {
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
  createZarinpalPaymentMock: vi.fn(),
  verifyZarinpalPaymentMock: vi.fn(),
  createPaginationDataMock: vi.fn(),
}));

vi.mock("../src/models/payment.model.js", () => ({
  default: paymentMock,
}));

vi.mock("../src/models/booking.model.js", () => ({
  default: bookingMock,
}));

vi.mock("../src/models/available-appointment.model.js", () => ({
  default: appointmentMock,
}));

vi.mock("../src/services/zarinpal.service.js", () => ({
  createZarinpalPayment: createZarinpalPaymentMock,
  verifyZarinpalPayment: verifyZarinpalPaymentMock,
}));

vi.mock("../src/utils/pagination.util.js", () => ({
  createPaginationData: createPaginationDataMock,
}));

import {
  createPayment,
  verifyPayment,
  getAdminPayments,
  getAdminPaymentById,
} from "../src/services/payment.service.js";

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

function createBooking(overrides = {}) {
  return {
    _id: "booking-1",
    patient: "patient-1",
    appointment: "appointment-1",
    amountInRial: 500000,
    status: "pending",
    cancellationReason: null,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createAppointment(overrides = {}) {
  return {
    _id: "appointment-1",
    status: "reserved",
    reservedBy: "patient-1",
    reservedUntil: new Date(Date.now() + 60_000),
    ...overrides,
  };
}

function createPaymentDocument(overrides = {}) {
  return {
    _id: "payment-1",
    booking: "booking-1",
    patient: "patient-1",
    amountInRial: 500000,
    authority: "authority-1",
    refId: null,
    status: "pending",
    paidAt: null,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("payment.service", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    createPaginationDataMock.mockReturnValue({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  describe("createPayment", () => {
    it("should create a payment and return the gateway URL", async () => {
      const booking = createBooking();
      const appointment = createAppointment();
      const payment = createPaymentDocument();

      bookingMock.findById.mockResolvedValue(booking);
      appointmentMock.findById.mockResolvedValue(appointment);
      paymentMock.findOne.mockResolvedValue(null);
      paymentMock.create.mockResolvedValue(payment);

      createZarinpalPaymentMock.mockResolvedValue({
        authority: "authority-1",
        paymentUrl: "https://gateway.example/pay/authority-1",
      });

      const result = await createPayment("booking-1", "patient-1");

      expect(bookingMock.findById).toHaveBeenCalledWith("booking-1");

      expect(paymentMock.create).toHaveBeenCalledWith({
        booking: booking._id,
        patient: booking.patient,
        amountInRial: booking.amountInRial,
        status: "pending",
      });

      expect(createZarinpalPaymentMock).toHaveBeenCalledWith({
        amountInRial: 500000,
        description: "Clinic appointment - booking-1",
        mobile: undefined,
      });

      expect(payment.authority).toBe("authority-1");
      expect(payment.save).toHaveBeenCalledOnce();

      expect(result).toEqual({
        payment,
        paymentUrl: "https://gateway.example/pay/authority-1",
      });
    });

    it("should reject when the booking does not exist", async () => {
      bookingMock.findById.mockResolvedValue(null);

      await expect(
        createPayment("missing-booking", "patient-1"),
      ).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });

      expect(paymentMock.create).not.toHaveBeenCalled();
    });

    it("should reject payment by another patient", async () => {
      bookingMock.findById.mockResolvedValue(
        createBooking({ patient: "patient-2" }),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "You are not allowed to pay for this booking",
        statusCode: 403,
      });
    });

    it("should reject a booking that is not pending", async () => {
      bookingMock.findById.mockResolvedValue(
        createBooking({ status: "confirmed" }),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Only pending bookings can be paid",
        statusCode: 409,
      });
    });

    it("should reject when the appointment does not exist", async () => {
      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(null);

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment not found",
        statusCode: 404,
      });
    });

    it("should reject an appointment that is no longer reserved", async () => {
      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(
        createAppointment({ status: "available" }),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment is no longer reserved",
        statusCode: 409,
      });
    });

    it("should reject an appointment without a reservation owner", async () => {
      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(
        createAppointment({ reservedBy: null }),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment is not reserved by any patient",
        statusCode: 409,
      });
    });

    it("should reject an appointment reserved by another patient", async () => {
      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(
        createAppointment({ reservedBy: "patient-2" }),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment is reserved by another patient",
        statusCode: 403,
      });
    });

    it("should reject an expired reservation", async () => {
      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(
        createAppointment({
          reservedUntil: new Date(Date.now() - 60_000),
        }),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment reservation has expired",
        statusCode: 409,
      });
    });

    it("should reject a reservation without an expiration time", async () => {
      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(
        createAppointment({ reservedUntil: null }),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Appointment reservation has expired",
        statusCode: 409,
      });
    });

    it("should reject when a payment already exists for the booking", async () => {
      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(createAppointment());
      paymentMock.findOne.mockResolvedValue(createPaymentDocument());

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "A payment already exists for this booking",
        statusCode: 409,
      });

      expect(paymentMock.create).not.toHaveBeenCalled();
      expect(createZarinpalPaymentMock).not.toHaveBeenCalled();
    });

    it("should delete the pending payment when the gateway request fails", async () => {
      const payment = createPaymentDocument();

      bookingMock.findById.mockResolvedValue(createBooking());
      appointmentMock.findById.mockResolvedValue(createAppointment());
      paymentMock.findOne.mockResolvedValue(null);
      paymentMock.create.mockResolvedValue(payment);

      createZarinpalPaymentMock.mockRejectedValue(
        new Error("Gateway unavailable"),
      );

      await expect(
        createPayment("booking-1", "patient-1"),
      ).rejects.toMatchObject({
        message: "Payment request could not be created",
        statusCode: 502,
      });

      expect(paymentMock.findByIdAndDelete).toHaveBeenCalledWith(
        payment._id,
      );
    });
  });

  describe("verifyPayment", () => {
    it("should reject when authority is missing", async () => {
      await expect(verifyPayment("", "OK")).rejects.toMatchObject({
        message: "Payment authority is required",
        statusCode: 400,
      });

      expect(paymentMock.findOne).not.toHaveBeenCalled();
    });

    it("should reject when the payment does not exist", async () => {
      paymentMock.findOne.mockResolvedValue(null);

      await expect(
        verifyPayment("unknown-authority", "OK"),
      ).rejects.toMatchObject({
        message: "Payment not found",
        statusCode: 404,
      });
    });

    it("should return immediately when the payment is already paid", async () => {
      const payment = createPaymentDocument({ status: "paid" });

      paymentMock.findOne.mockResolvedValue(payment);

      const result = await verifyPayment("authority-1", "OK");

      expect(result).toEqual({
        payment,
        alreadyVerified: true,
      });

      expect(verifyZarinpalPaymentMock).not.toHaveBeenCalled();
      expect(bookingMock.findById).not.toHaveBeenCalled();
    });

    it("should mark payment as failed when the user cancels at the gateway", async () => {
      const payment = createPaymentDocument();
      const booking = createBooking();

      paymentMock.findOne.mockResolvedValue(payment);
      bookingMock.findById.mockResolvedValue(booking);

      const result = await verifyPayment("authority-1", "NOK");

      expect(payment.status).toBe("failed");
      expect(payment.save).toHaveBeenCalledOnce();

      expect(booking.status).toBe("cancelled");
      expect(booking.save).toHaveBeenCalledOnce();

      expect(appointmentMock.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: booking.appointment,
          status: "reserved",
          reservedBy: booking.patient,
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
        payment,
        alreadyVerified: false,
        paymentSuccessful: false,
      });

      expect(verifyZarinpalPaymentMock).not.toHaveBeenCalled();
    });

    it("should not cancel a booking that is no longer pending after gateway cancellation", async () => {
      const payment = createPaymentDocument();
      const booking = createBooking({ status: "confirmed" });

      paymentMock.findOne.mockResolvedValue(payment);
      bookingMock.findById.mockResolvedValue(booking);

      await verifyPayment("authority-1", "NOK");

      expect(booking.status).toBe("confirmed");
      expect(booking.save).not.toHaveBeenCalled();

      expect(appointmentMock.findOneAndUpdate).toHaveBeenCalledOnce();
    });

    it("should handle gateway cancellation when the booking no longer exists", async () => {
      const payment = createPaymentDocument();

      paymentMock.findOne.mockResolvedValue(payment);
      bookingMock.findById.mockResolvedValue(null);

      const result = await verifyPayment("authority-1", "NOK");

      expect(payment.status).toBe("failed");
      expect(payment.save).toHaveBeenCalledOnce();

      expect(appointmentMock.findOneAndUpdate).not.toHaveBeenCalled();

      expect(result).toEqual({
        payment,
        alreadyVerified: false,
        paymentSuccessful: false,
      });
    });

    it("should verify the amount using the database payment amount", async () => {
      const payment = createPaymentDocument({ amountInRial: 750000 });
      const booking = createBooking();
      const appointment = createAppointment();

      paymentMock.findOne.mockResolvedValue(payment);

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: 100,
        message: "Success",
        refId: "ref-123",
      });

      bookingMock.findById.mockResolvedValue(booking);
      appointmentMock.findOneAndUpdate.mockResolvedValue(appointment);

      await verifyPayment("authority-1", "OK");

      expect(verifyZarinpalPaymentMock).toHaveBeenCalledWith({
        amountInRial: 750000,
        authority: "authority-1",
      });
    });

    it("should mark payment as failed when gateway verification is unsuccessful", async () => {
      const payment = createPaymentDocument();

      paymentMock.findOne.mockResolvedValue(payment);

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: -1,
        message: "Invalid payment",
        refId: null,
      });

      await expect(
        verifyPayment("authority-1", "OK"),
      ).rejects.toMatchObject({
        message: "Invalid payment",
        statusCode: 409,
      });

      expect(payment.status).toBe("failed");
      expect(payment.save).toHaveBeenCalledOnce();
      expect(bookingMock.findById).not.toHaveBeenCalled();
    });

    it("should use a default error message when gateway verification has no message", async () => {
      const payment = createPaymentDocument();

      paymentMock.findOne.mockResolvedValue(payment);

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: -1,
        message: "",
      });

      await expect(
        verifyPayment("authority-1", "OK"),
      ).rejects.toMatchObject({
        message: "Payment verification failed",
        statusCode: 409,
      });
    });

    it("should reject when the booking associated with a verified payment is missing", async () => {
      paymentMock.findOne.mockResolvedValue(createPaymentDocument());

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: 100,
        message: "Success",
        refId: "ref-123",
      });

      bookingMock.findById.mockResolvedValue(null);

      await expect(
        verifyPayment("authority-1", "OK"),
      ).rejects.toMatchObject({
        message: "Booking associated with payment not found",
        statusCode: 404,
      });
    });

    it("should finalize payment without confirming a booking that is no longer pending", async () => {
      const payment = createPaymentDocument();
      const booking = createBooking({ status: "cancelled" });

      paymentMock.findOne.mockResolvedValue(payment);

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: 100,
        message: "Success",
        refId: "ref-123",
      });

      bookingMock.findById.mockResolvedValue(booking);

      const result = await verifyPayment("authority-1", "OK");

      expect(payment.status).toBe("paid");
      expect(payment.refId).toBe("ref-123");
      expect(payment.paidAt).toBeInstanceOf(Date);
      expect(payment.save).toHaveBeenCalledOnce();

      expect(booking.status).toBe("cancelled");
      expect(booking.save).not.toHaveBeenCalled();
      expect(appointmentMock.findOneAndUpdate).not.toHaveBeenCalled();

      expect(result).toEqual({
        payment,
        alreadyVerified: true,
        paymentSuccessful: true,
      });
    });

    it("should mark payment as paid and cancel booking when the appointment is no longer available", async () => {
      const payment = createPaymentDocument();
      const booking = createBooking();

      paymentMock.findOne.mockResolvedValue(payment);

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: 100,
        message: "Success",
        refId: "ref-123",
      });

      bookingMock.findById.mockResolvedValue(booking);
      appointmentMock.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        verifyPayment("authority-1", "OK"),
      ).rejects.toMatchObject({
        message:
          "Payment was successful, but the appointment is no longer available. Refund is required.",
        statusCode: 409,
      });

      expect(appointmentMock.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: booking.appointment,
          status: "reserved",
          reservedBy: booking.patient,
          reservedUntil: { $gt: expect.any(Date) },
        },
        {
          $set: {
            status: "booked",
            reservedBy: null,
            reservedUntil: null,
          },
        },
        { new: true },
      );

      expect(payment.status).toBe("paid");
      expect(payment.refId).toBe("ref-123");
      expect(payment.save).toHaveBeenCalledOnce();

      expect(booking.status).toBe("cancelled");
      expect(booking.cancellationReason).toBe("payment_timeout");
      expect(booking.save).toHaveBeenCalledOnce();
    });

    it("should confirm the booking when payment and appointment verification succeed", async () => {
      const payment = createPaymentDocument();
      const booking = createBooking();
      const appointment = {
        _id: "appointment-1",
        status: "booked",
      };

      paymentMock.findOne.mockResolvedValue(payment);

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: 100,
        message: "Success",
        refId: "ref-123",
      });

      bookingMock.findById.mockResolvedValue(booking);
      appointmentMock.findOneAndUpdate.mockResolvedValue(appointment);

      const result = await verifyPayment("authority-1", "OK");

      expect(payment.status).toBe("paid");
      expect(payment.refId).toBe("ref-123");
      expect(payment.paidAt).toBeInstanceOf(Date);
      expect(payment.save).toHaveBeenCalledOnce();

      expect(booking.status).toBe("confirmed");
      expect(booking.save).toHaveBeenCalledOnce();

      expect(result).toEqual({
        payment,
        booking,
        appointment,
        alreadyVerified: false,
        paymentSuccessful: true,
      });
    });

    it("should accept gateway verification code 101", async () => {
      const payment = createPaymentDocument();
      const booking = createBooking();
      const appointment = createAppointment();

      paymentMock.findOne.mockResolvedValue(payment);

      verifyZarinpalPaymentMock.mockResolvedValue({
        code: 101,
        message: "Already verified",
        refId: "ref-101",
      });

      bookingMock.findById.mockResolvedValue(booking);
      appointmentMock.findOneAndUpdate.mockResolvedValue(appointment);

      const result = await verifyPayment("authority-1", "OK");

      expect(payment.status).toBe("paid");
      expect(booking.status).toBe("confirmed");
      expect(result.alreadyVerified).toBe(true);
      expect(result.paymentSuccessful).toBe(true);
    });
  });

  describe("getAdminPayments", () => {
    it("should return payments and pagination without a status filter", async () => {
      const payments = [createPaymentDocument()];
      const query = createQuery(payments);

      paymentMock.find.mockReturnValue(query);
      paymentMock.countDocuments.mockResolvedValue(1);

      const result = await getAdminPayments(2, 10);

      expect(paymentMock.find).toHaveBeenCalledWith({});
      expect(paymentMock.countDocuments).toHaveBeenCalledWith({});

      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.limit).toHaveBeenCalledWith(10);

      expect(createPaginationDataMock).toHaveBeenCalledWith(2, 10, 1);

      expect(result).toEqual({
        payments,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it("should filter payments by status", async () => {
      paymentMock.find.mockReturnValue(createQuery([]));
      paymentMock.countDocuments.mockResolvedValue(0);

      await getAdminPayments(1, 20, "paid");

      expect(paymentMock.find).toHaveBeenCalledWith({
        status: "paid",
      });

      expect(paymentMock.countDocuments).toHaveBeenCalledWith({
        status: "paid",
      });
    });
  });

  describe("getAdminPaymentById", () => {
    it("should return the requested payment", async () => {
      const payment = createPaymentDocument();

      paymentMock.findById.mockReturnValue(createQuery(payment));

      const result = await getAdminPaymentById("payment-1");

      expect(paymentMock.findById).toHaveBeenCalledWith("payment-1");
      expect(result).toBe(payment);
    });

    it("should reject when the payment does not exist", async () => {
      paymentMock.findById.mockReturnValue(createQuery(null));

      await expect(
        getAdminPaymentById("missing-payment"),
      ).rejects.toMatchObject({
        message: "Payment not found",
        statusCode: 404,
      });
    });
  });
});
