import { Router } from "express";
import { prisma } from "../../config/prisma.js";
import { authRequired } from "../../middleware/auth.js";

export const alertRouter = Router();

alertRouter.use(authRequired);

alertRouter.get("/", async (_req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        vehicle: {
          select: { vin: true, model: true, fleetCode: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return res.json(alerts);
  } catch (error) {
    next(error);
  }
});

alertRouter.patch("/:id/ack", async (req, res, next) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { isAcknowledged: true }
    });

    return res.json(alert);
  } catch (error) {
    next(error);
  }
});
