import AppError from "./../errors/app-error.js";

const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const hasAllowedRole = req.user.roles.some((role) =>
        allowedRoles.includes(role),
      );

      if (!hasAllowedRole) {
        throw new AppError("Access denied", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default roleGuard;