import AppError from "./../errors/app-error.js";

import { verifyAccessToken } from "../utils/jwt.util.js";

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

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

export default auth;
