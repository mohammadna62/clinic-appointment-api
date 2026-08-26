import mongoose from "mongoose";

const weeklyScheduleSchema = new mongoose.Schema(
  {
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

    isActive: {
      type: Boolean,
      default: true,
    },

    morningStart: {
      type: String,
      default: null,
    },

    morningEnd: {
      type: String,
      default: null,
    },

    eveningStart: {
      type: String,
      default: null,
    },

    eveningEnd: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

weeklyScheduleSchema.index(
  {
    clinic: 1,
    dayOfWeek: 1,
  },
  {
    unique: true,
  },
);

const WeeklySchedule = mongoose.model(
  "WeeklySchedule",
  weeklyScheduleSchema,
);

export default WeeklySchedule;