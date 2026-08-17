import {
  createSpecialty as createSpecialtyService,
  getSpecialties as getSpecialtiesService,
  getSpecialtyById as getSpecialtyByIdService,
} from "./../services/specialty.service.js";

import { successResponse } from "./../helpers/response.js";


export const createSpecialty = async (req, res, next) => {
  try {
    const specialty = await createSpecialtyService(req.validated.body);

    return successResponse(res, {
      statusCode: 201,
      message: "Specialty created successfully",
      data: {
        specialty,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSpecialties = async (req, res, next) => {
  try {
    const { page, limit } = req.validated.query;

    const result = await getSpecialtiesService(page, limit);

    return successResponse(res, {
      message: " Specialties retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSpecialtyById = async (req, res, next) => {
  try {
    const specialty = await getSpecialtyByIdService(
      req.validated.params.specialtyId,
    );

    return successResponse(res, {
      message: "Specialty retrieved successfully",
      data: {
        specialty,
      },
    });
  } catch (error) {
    next(error);
  }
};
