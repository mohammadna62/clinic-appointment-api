import {
  createDoctor as createDoctorService,
  getDoctorById as getDoctorByIdService,
  updateDoctor as updateDoctorService,
  updateDoctorStatus as updateDoctorStatusService,
} from "./../services/doctor.service.js";
import { successResponse } from "../helpers/response";

export const updateDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await updateDoctorStatusService(
      req.validated.params.doctorId,
      req.validated.body,
    );

    return successResponse(res, {
      message: "Doctor status updated successfully",
      data: {
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};
