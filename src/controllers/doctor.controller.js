import { createDoctor as createDoctorService } from "./../services/doctor.service.js";
import { successResponse } from "../helpers/response.js";

export const createDoctor = async (req, res, next) => {
  try {
    const doctor = await createDoctorService(req.user.userId, req.body);
    return successResponse(res, {
      message: "Doctor application submitted successfully",
      data: {
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};
