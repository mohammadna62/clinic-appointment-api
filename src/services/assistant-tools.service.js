import AvailableAppointment from "../models/available-appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Specialty from "../models/specialty.model.js";
import Clinic from "../models/clinic.model.js";
import User from "../models/user.model.js";
import AppError from "../errors/app-error.js";
import {
  getTodayLocalDate,
  addDays,
} from "../utils/date.util.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDateRange(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = addDays(start, 1);

  return {
    $gte: start,
    $lt: end,
  };
}

function getWeekdayDate(weekday) {
  const today = getTodayLocalDate();

  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const targetIndex = weekdays.indexOf(weekday);

  if (targetIndex === -1) {
    return null;
  }

  for (let i = 0; i < 7; i++) {
    const candidate = addDays(today, i);

    const candidateDay = new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "long",
        timeZone: "UTC",
      },
    )
      .format(candidate)
      .toLowerCase();

    if (candidateDay === weekday) {
      return candidate;
    }
  }

  return null;
}

function resolveDate(dateCriteria) {
  if (!dateCriteria) {
    return null;
  }

  const today = getTodayLocalDate();

  if (dateCriteria.type === "today") {
    return today;
  }

  if (dateCriteria.type === "tomorrow") {
    return addDays(today, 1);
  }

  if (dateCriteria.type === "weekday") {
    return getWeekdayDate(dateCriteria.weekday);
  }

  return null;
}

function getTimeFilter(timeRange) {
  switch (timeRange) {
    case "morning":
      return {
        startTime: {
          $gte: "08:00",
          $lt: "12:00",
        },
      };

    case "afternoon":
      return {
        startTime: {
          $gte: "12:00",
          $lt: "18:00",
        },
      };

    case "evening":
      return {
        startTime: {
          $gte: "17:00",
          $lt: "21:00",
        },
      };

    default:
      return {};
  }
}

export async function findAvailableAppointments({
  specialty,
  doctor,
  clinic,
  date,
  timeRange,
  limit = 10,
}) {
  const appointmentFilter = {
    status: "available",
  };

  const dateValue = resolveDate(date);

  if (dateValue) {
    appointmentFilter.date = getDateRange(dateValue);
  } else {
    appointmentFilter.date = {
      $gte: getTodayLocalDate(),
    };
  }

  Object.assign(
    appointmentFilter,
    getTimeFilter(timeRange),
  );

  let doctorIds;

  if (specialty) {
    const specialtyRegex = new RegExp(
      escapeRegex(specialty),
      "i",
    );

    const specialties = await Specialty.find({
      name: specialtyRegex,
      isActive: true,
    }).select("_id");

    const specialtyIds = specialties.map(
      (item) => item._id,
    );

    if (!specialtyIds.length) {
      return [];
    }

    const doctors = await Doctor.find({
      specialty: { $in: specialtyIds },
      isActive: true,
    }).select("_id");

    doctorIds = doctors.map((item) => item._id);

    if (!doctorIds.length) {
      return [];
    }
  }

  if (doctor) {
    const doctorRegex = new RegExp(
      escapeRegex(doctor),
      "i",
    );

    const users = await User.find({
      $or: [
        { firstName: doctorRegex },
        { lastName: doctorRegex },
      ],
    }).select("_id");

    const userIds = users.map((user) => user._id);

    const doctors = await Doctor.find({
      user: { $in: userIds },
      isActive: true,
    }).select("_id");

    const searchedDoctorIds = doctors.map(
      (item) => item._id,
    );

    if (!searchedDoctorIds.length) {
      return [];
    }

    if (doctorIds) {
      doctorIds = doctorIds.filter((id) =>
        searchedDoctorIds.some(
          (searchedId) =>
            searchedId.toString() === id.toString(),
        ),
      );
    } else {
      doctorIds = searchedDoctorIds;
    }
  }

  if (doctorIds) {
    appointmentFilter.doctor = {
      $in: doctorIds,
    };
  }

  if (clinic) {
    const clinicRegex = new RegExp(
      escapeRegex(clinic),
      "i",
    );

    const clinics = await Clinic.find({
      name: clinicRegex,
      isActive: true,
    }).select("_id");

    const clinicIds = clinics.map(
      (item) => item._id,
    );

    if (!clinicIds.length) {
      return [];
    }

    appointmentFilter.clinic = {
      $in: clinicIds,
    };
  }

  const appointments =
    await AvailableAppointment.find(
      appointmentFilter,
    )
      .populate({
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
      })
      .populate("clinic", "name")
      .sort({
        date: 1,
        startTime: 1,
      })
      .limit(limit);

  return appointments.map((appointment) => ({
    id: appointment._id,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    price: appointment.price,
    doctor: {
      id: appointment.doctor?._id,
      firstName:
        appointment.doctor?.user?.firstName,
      lastName:
        appointment.doctor?.user?.lastName,
      specialty:
        appointment.doctor?.specialty?.name,
    },
    clinic: {
      id: appointment.clinic?._id,
      name: appointment.clinic?.name,
    },
  }));
}