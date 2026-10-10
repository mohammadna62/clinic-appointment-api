import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middlewares/error-handler.js";
import AppError from "./errors/app-error.js";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import clinicRoutes from "./routes/clinic.routes.js";
import patientClinicRoutes from "./routes/patient-clinic.routes.js";
import specialtyRoutes from "./routes/specialty.routes.js";
import patientSpecialtyRoutes from "./routes/patient-specialty.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import availableAppointmentRoutes from "./routes/available-appointment.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import assistantRoutes from "./routes/assistant.routes.js";

import env from "./config/env.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.set("trust proxy", env.TRUST_PROXY_HOPS);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
/*
|--------------------------------------------------------------------------
| Swagger Documentation
|--------------------------------------------------------------------------
*/

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin/clinics", clinicRoutes);
app.use("/api/v1/clinics", patientClinicRoutes);
app.use("/api/v1/admin/specialties", specialtyRoutes);
app.use("/api/v1/specialties", patientSpecialtyRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/available-appointments", availableAppointmentRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/assistant", assistantRoutes);

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     description: Checks whether the Clinic Appointment API is running.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Clinic Appointment API is running
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
