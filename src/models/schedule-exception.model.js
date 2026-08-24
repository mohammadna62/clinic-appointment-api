import mongoose from "mongoose";

const scheduleExceptionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
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

    type: {
      type: String,
      enum: ["closed", "modified"],
      required: true,
    },

    startTime: {
      type: String,
      default: null,
    },

    endTime: {
      type: String,
      default: null,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
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

scheduleExceptionSchema.index({
  doctor: 1,
  clinic: 1,
  date: 1,
});

const ScheduleException = mongoose.model(
  "ScheduleException",
  scheduleExceptionSchema,
);

export default ScheduleException;
