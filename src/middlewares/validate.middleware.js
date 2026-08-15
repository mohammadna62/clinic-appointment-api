import { ZodError } from "zod";

import AppError from "../errors/app-error.js";

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError(
            error.issues.map((e) => e.message).join(", "),
            400,
          ),
        );
      }

      next(error);
    }
  };
};

export default validate;