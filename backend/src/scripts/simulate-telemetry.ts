import axios from "axios";

const baseURL =
  process.env.SIM_INGEST_URL ?? "http://localhost:5000/api/v1/telemetry/ingest";
const deviceKey = process.env.DEVICE_INGEST_KEY ?? "device-ingest-secret";
const vin = process.env.SIM_VIN ?? "MA1EVBATTERY001";

function random(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

async function pushTelemetry() {
  const payload = {
    vin,
    socPercent: random(8, 95),
    batteryTempC: random(28, 58),
    packVoltageV: random(275, 410),
    packCurrentA: random(-120, 220),
    insulationOhm: random(80000, 250000),
    latitude: 12.9716,
    longitude: 77.5946,
    speedKmph: random(0, 75),
    isCharging: Math.random() > 0.7
  };

  await axios.post(baseURL, payload, {
    headers: { "x-device-key": deviceKey }
  });

  console.log("Telemetry pushed", payload);
}

setInterval(() => {
  pushTelemetry().catch((err) => {
    console.error(err.response?.data ?? err.message);
  });
}, 5000);

