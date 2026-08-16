import {
  banUser as banUserService,
  unBanUser as unBanUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  getUsers as getUsersService,
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

export const updateUser = async (req, res, next) => {
  try {
    const user = await updateUserService(req.user.userId, req.validated.body);

    return successResponse(res, {
      message: "User profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await deleteUserService(req.params.userId);

    return successResponse(res, {
      message: "User deleted successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { status, page, limit } = req.validated.query;

    const result = await getUsersService( status, page, limit );

    return successResponse(res, {
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
