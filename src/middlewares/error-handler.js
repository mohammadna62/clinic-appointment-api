import { errorResponse } from "./../helpers/response.js";

const errorHandler = (err, req, res, next) => {
  console.log("[ErrorHandler] Error received");
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const errors = err.errors || null;

  return errorResponse(res, {
    statusCode,
    message,
    errors,
  });
};

export default errorHandler
