import { AlertSeverity } from "@prisma/client";

type TelemetryInput = {
  socPercent: number;
  batteryTempC: number;
  insulationOhm: number;
  packVoltageV: number;
  isCharging: boolean;
};

type RuleAlert = {
  severity: AlertSeverity;
  title: string;
  description: string;
};

export function evaluateAlerts(data: TelemetryInput): RuleAlert[] {
  const alerts: RuleAlert[] = [];

  if (data.socPercent < 10) {
    alerts.push({
      severity: "CRITICAL",
      title: "Critical SOC",
      description: `State of charge is critically low (${data.socPercent}%).`
    });
  } else if (data.socPercent < 20) {
    alerts.push({
      severity: "WARNING",
      title: "Low SOC",
      description: `State of charge is low (${data.socPercent}%).`
    });
  }

  if (data.batteryTempC >= 55) {
    alerts.push({
      severity: "CRITICAL",
      title: "Thermal Risk",
      description: `Battery temperature too high (${data.batteryTempC} C).`
    });
  } else if (data.batteryTempC >= 45) {
    alerts.push({
      severity: "WARNING",
      title: "High Temperature",
      description: `Battery temperature elevated (${data.batteryTempC} C).`
    });
  }

  if (data.insulationOhm < 100000) {
    alerts.push({
      severity: "CRITICAL",
      title: "Insulation Fault",
      description: `Insulation resistance below threshold (${data.insulationOhm} ohm).`
    });
  }

  if (data.packVoltageV < 280 && !data.isCharging) {
    alerts.push({
      severity: "WARNING",
      title: "Undervoltage",
      description: `Pack voltage low (${data.packVoltageV} V).`
    });
  }

  return alerts;
}
