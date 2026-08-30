import {
  createDoctorSchedule as createDoctorScheduleService,
  getDoctorSchedules as getDoctorSchedulesService,
  updateDoctorSchedule as updateDoctorScheduleService,
  deleteDoctorSchedule as deleteDoctorScheduleService,
} from "../services/doctor-schedule.service.js";

import { successResponse } from "../helpers/response.js";

export const createDoctorSchedule = async (req, res, next) => {
  try {
    const schedule = await createDoctorScheduleService(
      req.validated.params.doctorId,
      req.validated.body,
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Doctor schedule created successfully",
      data: {
        schedule,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorSchedules = async (req, res, next) => {
  try {
    const schedules = await getDoctorSchedulesService(
      req.validated.params.doctorId,
    );

    return successResponse(res, {
      message: "Doctor schedules retrieved successfully",
      data: {
        schedules,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorSchedule = async (req, res, next) => {
  try {
    const schedule = await updateDoctorScheduleService(
      req.validated.params.doctorId,
      req.validated.params.scheduleId,
      req.validated.body,
    );

    return successResponse(res, {
      message: "Doctor schedule updated successfully",
      data: {
        schedule,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorSchedule = async (req, res, next) => {
  try {
    const schedule = await deleteDoctorScheduleService(
      req.validated.params.doctorId,
      req.validated.params.scheduleId,
    );

    return successResponse(res, {
      message: "Doctor schedule deleted successfully",
      data: {
        schedule,
      },
    });
  } catch (error) {
    next(error);
  }
};
