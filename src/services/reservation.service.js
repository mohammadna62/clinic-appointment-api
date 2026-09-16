import AvailableAppointment from "../models/available-appointment.model.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";

export async function expireReservations() {
  const now = new Date();

  const expiredAppointments =
    await AvailableAppointment.find({
      status: "reserved",
      reservedUntil: {
        $lte: now,
      },
    });

  let releasedAppointments = 0;
  let cancelledBookings = 0;
  let failedPayments = 0;

  for (const appointment of expiredAppointments) {
    const booking = await Booking.findOne({
      appointment: appointment._id,
      status: "pending",
    });

    if (booking) {
      booking.status = "cancelled";
      booking.cancellationReason = "payment_timeout";

      await booking.save();

      cancelledBookings++;

      const payment = await Payment.findOne({
        booking: booking._id,
        status: "pending",
      });

      if (payment) {
        payment.status = "failed";

        await payment.save();

        failedPayments++;
      }
    }

    const result =
      await AvailableAppointment.findOneAndUpdate(
        {
          _id: appointment._id,
          status: "reserved",
          reservedUntil: {
            $lte: now,
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

    if (result) {
      releasedAppointments++;
    }
  }

  return {
    releasedAppointments,
    cancelledBookings,
    failedPayments,
  };
}