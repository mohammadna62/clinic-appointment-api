import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handler.js";
import AppError from "./errors/app-error.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import clinicRoutes from "./routes/clinic.routes.js";
import specialtyRoutes from "./routes/specialty.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(helmet());

app.use(compression());

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin/clinics", clinicRoutes);
app.use("/api/v1/admin/specialties", specialtyRoutes);
app.use("/api/v1/doctor", doctorRoutes);

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/

app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Clinic Appointment API is running",
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/
app.use((req, res, next) => {
  next(new AppError("Route Not Found", 404));
});

app.use(errorHandler);

export default app;
