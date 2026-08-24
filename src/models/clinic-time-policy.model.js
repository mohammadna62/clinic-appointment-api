import mongoose from "mongoose";

const clinicTimePolicySchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      unique: true,
    },

    morningStart: {
      type: String,
      required: true,
      default: "08:00",
    },

    morningEnd: {
      type: String,
      required: true,
      default: "12:00",
    },

    eveningStart: {
      type: String,
      required: true,
      default: "14:00",
    },

    eveningEnd: {
      type: String,
      required: true,
      default: "18:00",
    },

    appointmentDuration: {
      type: Number,
      required: true,
      default: 30,
      min: 5,
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

const ClinicTimePolicy = mongoose.model(
  "ClinicTimePolicy",
  clinicTimePolicySchema,
);

export default ClinicTimePolicy;