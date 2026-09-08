import {
  generateAppointmentsForDate as generateAppointmentsForDateService,
  generateDoctorAppointments as generateDoctorAppointmentsService,
  getAvailableAppointments as getAvailableAppointmentsService,
  updateAppointmentStatus as updateAppointmentStatusService,
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

export const getAvailableAppointments = async (req, res, next) => {
  try {
    const { page, limit } = req.validated.query;

    const result = await getAvailableAppointmentsService(page, limit);

    return successResponse(res, {
      message: "Available appointments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.validated.params;
    const { status } = req.validated.body;

    const appointment = await updateAppointmentStatusService(
      appointmentId,
      status,
    );

    return successResponse(res, {
      message: "Appointment status updated successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};