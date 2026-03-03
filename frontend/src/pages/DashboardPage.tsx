import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { io, Socket } from "socket.io-client";
import { api } from "../services/api";

type Overview = {
  vehicleCount: number;
  activeAlerts: number;
  criticalAlerts: number;
  avgSoc: number;
  latestTelemetry: Array<{
    id: string;
    timestamp: string;
    socPercent: number;
    batteryTempC: number;
    vehicle: { vin: string; model: string; fleetCode: string };
  }>;
};

export function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    let socket: Socket | null = null;

    const fetchOverview = async () => {
      const { data } = await api.get("/dashboard/overview");
      setOverview(data);
    };

    fetchOverview();

    socket = io(import.meta.env.VITE_SOCKET_URL);
    socket.on("telemetry:new", fetchOverview);

    return () => {
      socket?.disconnect();
    };
  }, []);

  const chartData = useMemo(() => {
    if (!overview) return [];
    return [...overview.latestTelemetry]
      .reverse()
      .map((t) => ({
        time: new Date(t.timestamp).toLocaleTimeString(),
        soc: t.socPercent,
        temp: t.batteryTempC
      }));
  }, [overview]);

  if (!overview) return <p style={{ textAlign: "center", marginTop: 100 }}>Loading Dashboard...</p>;

  const theme = {
    background: darkMode
      ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
      : "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
    text: darkMode ? "#ffffff" : "#1b263b",
    cardBg: darkMode
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.7)",
    glow: darkMode
      ? "0 0 20px rgba(0,255,200,0.4)"
      : "0 0 20px rgba(0,119,182,0.3)"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: theme.background,
        color: theme.text,
        fontFamily: "Inter, sans-serif",
        transition: "all 0.4s ease"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}
      >
        <h1 style={{ fontWeight: 600, letterSpacing: "1px" }}>
          ⚡ VoltGuard EV Monitoring
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "10px 18px",
            borderRadius: "25px",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
            background: darkMode ? "#00c6ff" : "#0077b6",
            color: "#fff",
            transition: "0.3s",
            boxShadow: theme.glow
          }}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "35px"
        }}
      >
        {[
          { label: "Vehicles", value: overview.vehicleCount },
          { label: "Active Alerts", value: overview.activeAlerts },
          { label: "Critical Alerts", value: overview.criticalAlerts },
          { label: "Average SOC", value: `${overview.avgSoc}%` }
        ].map((item, index) => (
          <div
            key={index}
            style={{
              padding: "25px",
              borderRadius: "18px",
              background: theme.cardBg,
              backdropFilter: "blur(12px)",
              boxShadow: theme.glow,
              transition: "0.3s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-6px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <p style={{ opacity: 0.7, fontSize: 14 }}>{item.label}</p>
            <h2 style={{ marginTop: 10, fontSize: 28 }}>{item.value}</h2>
          </div>
        ))}
      </div>

      {/* CHART PANEL */}
      <div
        style={{
          padding: "30px",
          borderRadius: "20px",
          background: theme.cardBg,
          backdropFilter: "blur(15px)",
          boxShadow: theme.glow,
          transition: "0.3s"
        }}
      >
        <h2 style={{ marginBottom: 20 }}>
          📈 Battery SOC Trend (Latest Samples)
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#1b263b" : "#ffffff",
                borderRadius: "10px",
                border: "none"
              }}
            />
            <Line
              type="monotone"
              dataKey="soc"
              stroke={darkMode ? "#00f5d4" : "#0077b6"}
              strokeWidth={3}
              dot={false}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
