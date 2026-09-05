import mongoose from "mongoose";

const availableAppointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "booked", "suspended"],
      default: "available",
    },

    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reservedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

availableAppointmentSchema.index(
  {
    doctor: 1,
    date: 1,
    startTime: 1,
    endTime: 1,
  },
  {
    unique: true,
  },
);

const AvailableAppointment = mongoose.model(
  "AvailableAppointment",
  availableAppointmentSchema,
);

export default AvailableAppointment;
