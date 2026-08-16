import mongoose from "mongoose";
import User from "./../models/user.model.js";
import AppError from "../errors/app-error.js";

import { redis } from "./../config/redis.js";

import { createPaginationData } from "../utils/pagination.util.js";

export async function banUser(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { isBanned: true },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const refreshKey = `auth:refresh:${userId}`;

  await redis.del(refreshKey);

  return user;
}

export async function unBanUser(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isBanned: false,
    },
    { new: true, runValidators: true },
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function updateUser(userId, data) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
  const { firstName, lastName, nationalCode } = data;

  if (nationalCode !== undefined) {
    const existingUser = await User.findOne({
      nationalCode,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new AppError("National code is already in use", 409);
    }
  }

  const updateData = {};

  if (firstName !== undefined) {
    updateData.firstName = firstName;
  }
  if (lastName !== undefined) {
    updateData.lastName = lastName;
  }
  if (nationalCode !== undefined) {
    updateData.nationalCode = nationalCode;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export function isProfileCompleted(user) {
  return Boolean(user.firstName && user.lastName && user.nationalCode);
}

export async function deleteUser(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isDeleted) {
    throw new AppError("User account is already deleted", 409);
  }
  user.isDeleted = true;
  user.deletedAt = new Date();

  await user.save();

  const refreshKey = `auth:refresh:${userId}`;

  await redis.del(refreshKey);

  return user;
}

export async function getUsers(status, page, limit) {
  const filter = {};

  if (status === "active") {
    filter.isDeleted = false;
    filter.isBanned = false;
  } else if (status === "banned") {
    filter.isBanned = true;
  } else if (status === "deleted") {
    filter.isDeleted = true;
  } else if (status !== undefined) {
    throw new AppError("Invalid user status", 400);
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    User.countDocuments(filter),
  ]);

  const pagination = createPaginationData(page, limit, total);

  return {
    users,
    pagination,
  };
}
