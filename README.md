# VoltGuard EV (EV Battery Monitoring System)

A production-style full-stack application for monitoring EV battery behavior in real time.

This project is designed to demonstrate real engineering skills for internships/placements:
- secure backend APIs
- telemetry ingestion pipeline
- alert rule engine
- live dashboard updates
- relational data modeling

## 1. Key Features

- JWT authentication and role-based access (`ADMIN`, `OPERATOR`)
- Vehicle and battery asset management
- Telemetry ingestion endpoint for device/simulator data
- Rule-based alert generation (warning/critical)
- Real-time UI updates using Socket.IO
- PostgreSQL database with Prisma ORM and migrations
- React dashboard with SOC trend chart and alert workflow

## 2. Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Socket.IO
- JWT + bcrypt
- Helmet, CORS, Morgan

### Frontend
- React + TypeScript
- Vite
- Axios
- Recharts
- socket.io-client

### Infra
- Docker Compose (PostgreSQL)

## 3. Project Structure

```text
.
+-- backend/
�   +-- prisma/
�   �   +-- schema.prisma
�   �   +-- seed.ts
�   +-- src/
�   �   +-- modules/
�   �   �   +-- auth/
�   �   �   +-- vehicles/
�   �   �   +-- telemetry/
�   �   �   +-- alerts/
�   �   �   +-- dashboard/
�   �   +-- scripts/simulate-telemetry.ts
�   +-- .env.example
+-- frontend/
�   +-- src/pages/
�   +-- src/components/
�   +-- .env.example
+-- infra/docker-compose.yml
+-- docs/API.md
+-- start.sh
+-- stop.sh
```

## 4. How the System Works

1. User logs in from frontend.
2. Backend returns JWT token.
3. Frontend calls secure APIs with `Authorization: Bearer <token>`.
4. Telemetry arrives at `POST /api/v1/telemetry/ingest`.
5. Backend stores telemetry in DB.
6. Rule engine evaluates thresholds and creates alerts.
7. Backend emits Socket.IO event.
8. Dashboard refreshes live metrics/graph.

## 5. Battery Terms Used

- `Telemetry`: periodic battery/sensor data from vehicle.
- `SOC` (State of Charge): battery percentage left.
- `SOH` (State of Health): battery health compared to new.

Example:
- SOC `82%` -> normal
- SOC `19%` -> low warning zone
- SOC `8%` -> critical zone

## 6. Alert Logic (Implemented)

- SOC `< 10` -> `CRITICAL` (`Critical SOC`)
- SOC `< 20` -> `WARNING` (`Low SOC`)
- Temp `>= 55C` -> `CRITICAL` (`Thermal Risk`)
- Temp `>= 45C` -> `WARNING` (`High Temperature`)
- Insulation `< 100000 ohm` -> `CRITICAL` (`Insulation Fault`)
- Voltage `< 280V` and not charging -> `WARNING` (`Undervoltage`)

One telemetry packet can create multiple alerts.

## 7. Database Design

Main tables:
- `User`
- `Vehicle`
- `BatteryPack`
- `Telemetry`
- `Alert`

Relationship summary:
- One `Vehicle` has many `Telemetry` rows.
- One `Vehicle` has many `Alert` rows.
- One `Vehicle` has one or more `BatteryPack` records.

## 8. Setup and Run (Ubuntu)

### Prerequisites
- Node.js 20+
- Docker + Docker Compose plugin

### Run commands

```bash
cd ~/ev-monitoring-system

docker compose -f infra/docker-compose.yml up -d

cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open a new terminal:

```bash
cd ~/ev-monitoring-system/frontend
cp .env.example .env
npm install
npm run dev
```

Open:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`

### Optional telemetry simulator

```bash
cd ~/ev-monitoring-system/backend
npm install axios
npm run simulate:telemetry
```
## 10. One-Command Start/Stop (Ubuntu)

```bash
cd ~/ev-monitoring-system
chmod +x start.sh stop.sh
./start.sh
```

Stop app processes:

```bash
./stop.sh
```

Stop DB container too:

```bash
docker compose -f infra/docker-compose.yml down
```

## 11. Default Credentials

- Admin
  - Email: `admin@evmonitor.com`
  - Password: `Admin@123`
- Operator
  - Email: `operator@evmonitor.com`
  - Password: `Operator@123`

## 12. API Summary

Base: `http://localhost:5000/api/v1`

- `POST /auth/login`
- `POST /auth/register`
- `GET /vehicles`
- `POST /vehicles`
- `POST /telemetry/ingest` (header: `x-device-key`)
- `GET /telemetry/latest/:vehicleId`
- `GET /telemetry/history/:vehicleId?hours=24`
- `GET /alerts`
- `PATCH /alerts/:id/ack`
- `GET /dashboard/overview`

See [API.md](./docs/API.md) for details.

## 13. How to View Database Data

### Open PostgreSQL shell

```bash
docker exec -it ev-monitor-postgres psql -U postgres -d ev_monitoring
```

### Useful queries

```sql
\dt
SELECT * FROM "Vehicle";
SELECT * FROM "Telemetry" ORDER BY "timestamp" DESC LIMIT 20;
SELECT * FROM "Alert" ORDER BY "createdAt" DESC LIMIT 20;
```

Exit with `\q`.

## 15. Interview-Ready Notes

- Current version uses rule-based alerting (no ML model yet).
- Real-time behavior is implemented via Socket.IO.
- Data source is simulator now, but architecture is ready for real BMS/device integration.
- Future roadmap: MQTT/Kafka ingestion, anomaly detection, SOH/RUL prediction, cloud deployment.

## 16. License

For educational and portfolio use.
