import { successResponse } from "./../helpers/response.js";
import {
  createClinic as createClinicService,
  getClinics as getClinicsService,
} from "./../services/clinic.service.js";

export const createClinic = async (req, res, next) => {
  try {
    const clinic = await createClinicService(req.body);

    return successResponse(res, {
       statusCode: 201,
      message: "Clinic created successfully",
      data: {
        clinic,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getClinics = async (req, res, next) => {
  try {
    const clinics = await getClinicsService();

    return successResponse(res, {
      message: "Clinics retrieved successfully",
      data: {
        clinics,
      },
    });
  } catch (error) {
    next(error);
  }
};
