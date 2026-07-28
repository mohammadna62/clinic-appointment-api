export const successResponse = (
  res,
  {
    statusCode = 200,
    message = "Request Completed successfully",
    data = null,
  } = {},
) => {
  return res
    .status(statusCode)
    .json({ status: statusCode, success: true, message, data });
};

export const errorResponse = (
  res,
  { statusCode = 500, message = "Internal server error", errors = null } = {},
) => {
  return res.status(statusCode).json({
    status: statusCode,
    success: false,
    message,
    errors,
  });
};
