import { successResponse } from "../helpers/response.js";
import { getAdminStatistics as getAdminStatisticsService } from "../services/admin-statistics.service.js";

export const getAdminStatistics = async (req, res, next) => {
  try {
    const statistics = await getAdminStatisticsService();

    return successResponse(res, {
      message: "Admin statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};
