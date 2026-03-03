import { Router } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../config/prisma.js";
import { authRequired } from "../../middleware/auth.js";

const createVehicleSchema = z.object({
  vin: z.string().min(5),
  fleetCode: z.string().min(2),
  model: z.string().min(2),
  manufacturer: z.string().min(2),
  battery: z.object({
    serialNumber: z.string().min(3),
    chemistry: z.string().min(2),
    capacityKWh: z.number().positive(),
    nominalVoltage: z.number().positive()
  })
});

export const vehicleRouter = Router();

vehicleRouter.use(authRequired);

vehicleRouter.get("/", async (_req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        batteryPacks: true,
        telemetry: {
          take: 1,
          orderBy: { timestamp: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

vehicleRouter.post("/", async (req, res, next) => {
  try {
    const data = createVehicleSchema.parse(req.body);

    const vehicle = await prisma.vehicle.create({
      data: {
        vin: data.vin,
        fleetCode: data.fleetCode,
        model: data.model,
        manufacturer: data.manufacturer,
        batteryPacks: {
          create: {
            serialNumber: data.battery.serialNumber,
            chemistry: data.battery.chemistry,
            capacityKWh: data.battery.capacityKWh,
            nominalVoltage: data.battery.nominalVoltage
          }
        }
      },
      include: { batteryPacks: true }
    });

    return res.status(StatusCodes.CREATED).json(vehicle);
  } catch (error) {
    next(error);
  }
});
