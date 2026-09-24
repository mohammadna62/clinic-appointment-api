import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import AvailableAppointment from "../models/available-appointment.model.js";
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import { getStatisticsDateRange } from "../utils/statistics.util.js";

export async function getAdminStatistics(period = "month") {
  const { startDate, endDate } = getStatisticsDateRange(period);

  const [
    bookingStatistics,
    paymentStatistics,
    appointmentStatistics,
    doctorStatistics,
    userStatistics,
  ] = await Promise.all([
    Booking.aggregate([
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
    ]),

    Payment.aggregate([
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
    ]),

    AvailableAppointment.aggregate([
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
    ]),

    Doctor.aggregate([
      {
        $group: {
          _id: "$isActive",
          count: { $sum: 1 },
        },
      },
    ]),

    User.aggregate([
      {
        $unwind: "$roles",
      },
      {
        $group: {
          _id: "$roles",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const bookings = {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    patient_no_show: 0,
  };

  for (const item of bookingStatistics) {
    bookings[item._id] = item.count;
    bookings.total += item.count;
  }

  const payments = {
    total: 0,
    pending: 0,
    paid: 0,
    failed: 0,
    refunded: 0,
  };

  for (const item of paymentStatistics) {
    payments[item._id] = item.count;
    payments.total += item.count;
  }

  const appointments = {
    total: 0,
    available: 0,
    reserved: 0,
    booked: 0,
    suspended: 0,
  };

  for (const item of appointmentStatistics) {
    appointments[item._id] = item.count;
    appointments.total += item.count;
  }

  const doctors = {
    total: 0,
    active: 0,
    inactive: 0,
  };

  for (const item of doctorStatistics) {
    if (item._id === true) {
      doctors.active = item.count;
    }

    if (item._id === false) {
      doctors.inactive = item.count;
    }
  }

  doctors.total = doctors.active + doctors.inactive;

  const users = {
    total: 0,
    patients: 0,
    doctors: 0,
    admins: 0,
  };

  for (const item of userStatistics) {
    if (item._id === "patient") {
      users.patients = item.count;
    }

    if (item._id === "doctor") {
      users.doctors = item.count;
    }

    if (item._id === "admin") {
      users.admins = item.count;
    }
  }

  users.total =
    users.patients +
    users.doctors +
    users.admins;

  return {
    period,
    startDate,
    endDate,
    bookings,
    payments,
    appointments,
    doctors,
    users,
  };
}