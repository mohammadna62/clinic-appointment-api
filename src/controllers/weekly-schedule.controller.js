import {
  createWeeklySchedule as createWeeklyScheduleService,
  getWeeklySchedules as getWeeklySchedulesService,
  updateWeeklySchedule as updateWeeklyScheduleService,
  deleteWeeklySchedule as deleteWeeklyScheduleService,
} from "../services/weekly-schedule.service.js";

import { successResponse } from "../helpers/response.js";

export const createWeeklySchedule = async (req, res, next) => {
  try {
    const schedule = await createWeeklyScheduleService(
      req.validated.params.clinicId,
      req.validated.body,
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Weekly schedule created successfully",
      data: {
        schedule,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklySchedules = async (req, res, next) => {
  try {
    const schedules = await getWeeklySchedulesService(
      req.validated.params.clinicId,
    );

    return successResponse(res, {
      message: "Weekly schedules retrieved successfully",
      data: {
        schedules,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWeeklySchedule = async (req, res, next) => {
  try {
    const schedule = await updateWeeklyScheduleService(
      req.validated.params.clinicId,
      req.validated.params.scheduleId,
      req.validated.body,
    );

    return successResponse(res, {
      message: "Weekly schedule updated successfully",
      data: {
        schedule,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWeeklySchedule = async (req, res, next) => {
  try {
    const schedule = await deleteWeeklyScheduleService(
      req.validated.params.clinicId,
      req.validated.params.scheduleId,
    );

    return successResponse(res, {
      message: "Weekly schedule deleted successfully",
      data: {
        schedule,
      },
    });
  } catch (error) {
    next(error);
  }
};
