import {
  banUser as banUserService,
  unBanUser as unBanUserService,
} from "../services/user.service.js";

import { successResponse } from "./../helpers/response.js";

export const banUser = async (req, res, next) => {
  try {
    const user = await banUserService(req.params.userId);

    return successResponse(res, {
      message: "User banned successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const unBanUser = async (req, res, next) => {
  try {
    const user = await unBanUserService(req.params.userId);

    return successResponse(res, {
      message: "User unbanned successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
