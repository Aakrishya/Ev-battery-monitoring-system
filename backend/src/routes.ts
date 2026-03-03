import { Router } from "express";
import { authRouter } from "./modules/auth/routes.js";
import { vehicleRouter } from "./modules/vehicles/routes.js";
import { telemetryRouter } from "./modules/telemetry/routes.js";
import { alertRouter } from "./modules/alerts/routes.js";
import { dashboardRouter } from "./modules/dashboard/routes.js";

export const appRouter = Router();

appRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ev-battery-monitor-api" });
});

appRouter.use("/api/v1/auth", authRouter);
appRouter.use("/api/v1/vehicles", vehicleRouter);
appRouter.use("/api/v1/telemetry", telemetryRouter);
appRouter.use("/api/v1/alerts", alertRouter);
appRouter.use("/api/v1/dashboard", dashboardRouter);
