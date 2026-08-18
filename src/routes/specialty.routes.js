import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createSpecialty,
  getSpecialties,
  getSpecialtyById,
  updateSpecialty,
} from "../controllers/specialty.controller.js";

import {
  createSpecialtySchema,
  specialtyIdSchema,
  updateSpecialtySchema,
} from "../validators/specialty.validator.js";

import { paginationSchema } from "../validators/pagination.validator.js";

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    roleGuard("admin"),
    validate(createSpecialtySchema, "body"),
    createSpecialty,
  )
  .get(
    auth,
    roleGuard("admin"),
    validate(paginationSchema, "query"),
    getSpecialties,
  );

router
  .route("/:specialtyId")
  .get(
    auth,
    roleGuard("admin"),
    validate(specialtyIdSchema, "params"),
    getSpecialtyById,
  )
  .patch(
    auth,
    roleGuard("admin"),
    validate(specialtyIdSchema, "params"),
    validate(updateSpecialtySchema, "body"),
    updateSpecialty,
  );

export default router;
