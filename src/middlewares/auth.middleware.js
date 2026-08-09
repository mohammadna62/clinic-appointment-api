import AppError from "./../errors/app-error.js";

import { verifyAccessToken } from "../utils/jwt.util.js";
import User from "./../models/user.model.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header is required", 401);
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError("Invalid authorization format", 401);
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (user.isBanned) {
      throw new AppError("User is banned", 403);
    }
    req.user = {
      userId: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default auth;
