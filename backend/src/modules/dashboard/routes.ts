import { Router } from "express";
import { prisma } from "../../config/prisma.js";
import { authRequired } from "../../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.use(authRequired);

dashboardRouter.get("/overview", async (_req, res, next) => {
  try {
    const [vehicleCount, totalAlerts, criticalAlerts, latestTelemetry] = await Promise.all([
      prisma.vehicle.count(),
      prisma.alert.count({ where: { isAcknowledged: false } }),
      prisma.alert.count({ where: { isAcknowledged: false, severity: "CRITICAL" } }),
      prisma.telemetry.findMany({
        take: 20,
        orderBy: { timestamp: "desc" },
        include: { vehicle: { select: { vin: true, model: true, fleetCode: true } } }
      })
    ]);

    const avgSoc = latestTelemetry.length
      ? Number((latestTelemetry.reduce((acc, t) => acc + t.socPercent, 0) / latestTelemetry.length).toFixed(2))
      : 0;

    return res.json({
      vehicleCount,
      activeAlerts: totalAlerts,
      criticalAlerts,
      avgSoc,
      latestTelemetry
    });
  } catch (error) {
    next(error);
  }
});
