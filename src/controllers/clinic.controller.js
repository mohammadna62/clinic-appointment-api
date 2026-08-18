import { successResponse } from "./../helpers/response.js";
import {
  createClinic as createClinicService,
  getClinics as getClinicsService,
  getClinicById as getClinicByIdService,
  updateClinic as updateClinicService,
  updateClinicStatus as updateClinicStatusService,
} from "./../services/clinic.service.js";

export const createClinic = async (req, res, next) => {
  try {
    const clinic = await createClinicService(req.validated.body);

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
    const { page, limit } = req.validated.query;

    const result = await getClinicsService(page, limit);

    return successResponse(res, {
      message: "Clinics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicById = async (req, res, next) => {
  try {
    const clinic = await getClinicByIdService(req.validated.params.clinicId);

    return successResponse(res, {
      message: "Clinic retrieved successfully",
      data: {
        clinic,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateClinic = async (req, res, next) => {
  try {
    const clinic = await updateClinicService(
      req.validated.params.clinicId,
      req.validated.body,
    );

    return successResponse(res, {
      message: "Clinic updated successfully",
      data: {
        clinic,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const updateClinicStatus = async (req, res, next) => {
  try {
    const clinic = await updateClinicStatusService(
      req.validated.params.clinicId,
      req.validated.body.isActive,
    );

    return successResponse(res, {
      message: "Clinic status updated successfully",
      data: {
        clinic,
      },
    });
  } catch (error) {
    next(error);
  }
};
