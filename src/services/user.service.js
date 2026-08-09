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
