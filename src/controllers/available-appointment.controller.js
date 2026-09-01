import {
  generateDoctorAppointments as generateDoctorAppointmentsService,
} from "../services/available-appointment.service.js";

import { successResponse } from "../helpers/response.js";

export const generateAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.validated.params;

    const result = await generateDoctorAppointmentsService(
      doctorId,
      new Date(),
      30,
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Appointments generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};