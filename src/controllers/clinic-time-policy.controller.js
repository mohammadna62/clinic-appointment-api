import {
  createClinicTimePolicy as createClinicTimePolicyService,
  getClinicTimePolicy as getClinicTimePolicyService,
  updateClinicTimePolicy as updateClinicTimePolicyService,
} from "../services/clinic-time-policy.service.js";

import { successResponse } from "../helpers/response.js";

export const createClinicTimePolicy = async (req, res, next) => {
  try {
    const policy = await createClinicTimePolicyService(
      req.validated.params.clinicId,
      req.validated.body,
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Clinic time policy created successfully",
      data: {
        policy,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicTimePolicy = async (req, res, next) => {
  try {
    const policy = await getClinicTimePolicyService(
      req.validated.params.clinicId,
    );

    return successResponse(res, {
      message: "Clinic time policy retrieved successfully",
      data: {
        policy,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateClinicTimePolicy = async (req, res, next) => {
  try {
    const policy = await updateClinicTimePolicyService(
      req.validated.params.clinicId,
      req.validated.body,
    );

    return successResponse(res, {
      message: "Clinic time policy updated successfully",
      data: {
        policy,
      },
    });
  } catch (error) {
    next(error);
  }
};