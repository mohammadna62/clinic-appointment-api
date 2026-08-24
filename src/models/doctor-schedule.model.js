import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema(
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

    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

doctorScheduleSchema.index(
  {
    doctor: 1,
    dayOfWeek: 1,
    startTime: 1,
    endTime: 1,
  },
  {
    unique: true,
  },
);

const DoctorSchedule = mongoose.model(
  "DoctorSchedule",
  doctorScheduleSchema,
);

export default DoctorSchedule;