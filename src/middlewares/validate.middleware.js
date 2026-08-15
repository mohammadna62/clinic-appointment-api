import { ZodError } from "zod";

import AppError from "../errors/app-error.js";

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req[source]);

      req.validated = {
        ...req.validated,
        [source]: validatedData,
      };

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