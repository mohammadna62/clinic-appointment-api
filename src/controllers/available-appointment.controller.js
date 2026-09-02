import {
  generateAppointmentsForDate as generateAppointmentsForDateService,
  generateDoctorAppointments as generateDoctorAppointmentsService,
  generateNextDayAppointments as generateNextDayAppointmentsService,
} from "../services/available-appointment.service.js";

import { successResponse } from "../helpers/response.js";

export const generateAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.validated.params;
    const { date } = req.validated.body;

    const appointments = await generateAppointmentsForDateService(
      doctorId,
      date,
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Appointments generated successfully",
      data: {
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateDoctorAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.validated.params;

    const appointments = await generateDoctorAppointmentsService(doctorId);

    return successResponse(res, {
      statusCode: 201,
      message: "Doctor appointments generated successfully",
      data: {
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateNextDayAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.validated.params;

    const appointments = await generateNextDayAppointmentsService(doctorId);

    return successResponse(res, {
      statusCode: 201,
      message: "Next day appointments generated successfully",
      data: {
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};
