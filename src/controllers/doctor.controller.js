import {
  createDoctor as createDoctorService,
  getDoctorById as getDoctorByIdService,
  updateDoctor as updateDoctorService,
  updateDoctorStatus as updateDoctorStatusService
} from "./../services/doctor.service.js";
import { successResponse } from "../helpers/response.js";

export const createDoctor = async (req, res, next) => {
  try {
    const doctor = await createDoctorService(
      req.user.userId,
      req.validated.body,
      req.file,
    );
    return successResponse(res, {
      statusCode: 201,
      message: "Doctor application submitted successfully",
      data: {
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await getDoctorByIdService(req.validated.params.doctorId);

    return successResponse(req, {
      message: "Doctor retrieved successfully",
      data: {
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await updateDoctorService(
      req.user.userId,
      req.validated.body,
      req.file,
    );

    return successResponse(res, {
      message: "Doctor profile updated successfully",
      data: {
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const updateDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await updateDoctorStatusService(
      req.validated.params.doctorId,
      req.validated.body,
    );

    return successResponse(res, {
      message: "Doctor profile updated successfully",
      data: {
        doctor,
      },
    });
  } catch (error) {
    next(error);
  }
};
