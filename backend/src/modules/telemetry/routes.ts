import { Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { authRequired } from "../../middleware/auth.js";
import { evaluateAlerts } from "./rules.js";
import { getSocketServer } from "../../config/socket.js";

const ingestSchema = z.object({
  vin: z.string().min(5),
  timestamp: z.string().datetime().optional(),
  socPercent: z.number().min(0).max(100),
  batteryTempC: z.number(),
  packVoltageV: z.number().positive(),
  packCurrentA: z.number(),
  insulationOhm: z.number().positive(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  speedKmph: z.number().optional(),
  isCharging: z.boolean().default(false)
});

export const telemetryRouter = Router();

telemetryRouter.post("/ingest", async (req, res, next) => {
  try {
    const ingestKey = req.headers["x-device-key"];
    if (ingestKey !== env.DEVICE_INGEST_KEY) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid device key" });
    }

    const data = ingestSchema.parse(req.body);
    const vehicle = await prisma.vehicle.findUnique({ where: { vin: data.vin } });

    if (!vehicle) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Vehicle not found for VIN" });
    }

    const telemetry = await prisma.telemetry.create({
      data: {
        vehicleId: vehicle.id,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        socPercent: data.socPercent,
        batteryTempC: data.batteryTempC,
        packVoltageV: data.packVoltageV,
        packCurrentA: data.packCurrentA,
        insulationOhm: data.insulationOhm,
        latitude: data.latitude,
        longitude: data.longitude,
        speedKmph: data.speedKmph,
        isCharging: data.isCharging
      }
    });

    const alerts = evaluateAlerts({
      socPercent: data.socPercent,
      batteryTempC: data.batteryTempC,
      insulationOhm: data.insulationOhm,
      packVoltageV: data.packVoltageV,
      isCharging: data.isCharging
    });

    if (alerts.length > 0) {
      await prisma.alert.createMany({
        data: alerts.map((alert) => ({
          vehicleId: vehicle.id,
          severity: alert.severity,
          title: alert.title,
          description: alert.description
        }))
      });
    }

    const io = getSocketServer();
    io?.to(`vehicle:${vehicle.id}`).emit("telemetry:new", telemetry);
    io?.emit("telemetry:new", { vehicleId: vehicle.id, telemetry });

    return res.status(StatusCodes.CREATED).json({ telemetry, alertsCreated: alerts.length });
  } catch (error) {
    next(error);
  }
});

telemetryRouter.use(authRequired);

telemetryRouter.get("/latest/:vehicleId", async (req, res, next) => {
  try {
    const latest = await prisma.telemetry.findFirst({
      where: { vehicleId: req.params.vehicleId },
      orderBy: { timestamp: "desc" }
    });

    return res.json(latest);
  } catch (error) {
    next(error);
  }
});

telemetryRouter.get("/history/:vehicleId", async (req, res, next) => {
  try {
    const hours = Number(req.query.hours ?? 24);
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);

    const history = await prisma.telemetry.findMany({
      where: {
        vehicleId: req.params.vehicleId,
        timestamp: { gte: from }
      },
      orderBy: { timestamp: "asc" }
    });

    return res.json(history);
  } catch (error) {
    next(error);
  }
});
