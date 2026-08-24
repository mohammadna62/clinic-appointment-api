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

    morning: {
      enabled: {
        type: Boolean,
        default: true,
      },
    },

    evening: {
      enabled: {
        type: Boolean,
        default: true,
      },
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

weeklyScheduleSchema.index(
  { clinic: 1, dayOfWeek: 1 },
  { unique: true },
);

const WeeklySchedule = mongoose.model(
  "WeeklySchedule",
  weeklyScheduleSchema,
);

export default WeeklySchedule;