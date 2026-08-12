import User from "./../models/user.model.js";
import AppError from "../errors/app-error.js";

import { redis } from "./../config/redis.js";

export async function banUser(userId) {
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
