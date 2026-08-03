import { ZodError } from "zod";

import AppError from "../errors/app-error.js";

const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      console.log(error);
      console.log(error instanceof ZodError);
      if (error instanceof ZodError) {
        return next(
          new AppError(error.issues.map((e) => e.message).join(", "), 400),
        );
      }

      next(error);
    }
  };
};

export default validate;
