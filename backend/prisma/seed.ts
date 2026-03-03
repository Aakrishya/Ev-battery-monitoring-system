import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [adminHash, operatorHash] = await Promise.all([
    bcrypt.hash("Admin@123", 10),
    bcrypt.hash("Operator@123", 10)
  ]);

  await prisma.user.upsert({
    where: { email: "admin@evmonitor.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@evmonitor.com",
      passwordHash: adminHash,
      role: Role.ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: "operator@evmonitor.com" },
    update: {},
    create: {
      name: "Fleet Operator",
      email: "operator@evmonitor.com",
      passwordHash: operatorHash,
      role: Role.OPERATOR
    }
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { vin: "MA1EVBATTERY001" },
    update: {},
    create: {
      vin: "MA1EVBATTERY001",
      fleetCode: "FLEET-IND-01",
      model: "E-City 300",
      manufacturer: "VoltDrive"
    }
  });

  await prisma.batteryPack.upsert({
    where: { serialNumber: "BP-VD-001" },
    update: {},
    create: {
      vehicleId: vehicle.id,
      serialNumber: "BP-VD-001",
      chemistry: "LFP",
      capacityKWh: 72,
      nominalVoltage: 400,
      cycleCount: 180,
      sohPercent: 95.2
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
