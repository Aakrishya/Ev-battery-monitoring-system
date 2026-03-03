import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

type Vehicle = {
  id: string;
  vin: string;
  fleetCode: string;
  model: string;
  manufacturer: string;
  telemetry: Array<{ socPercent: number; batteryTempC: number; timestamp: string }>;
  batteryPacks: Array<{ serialNumber: string; chemistry: string; capacityKWh: number; sohPercent: number }>;
};

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/vehicles").then((res) => setVehicles(res.data));
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) =>
      v.vin.toLowerCase().includes(search.toLowerCase()) ||
      v.fleetCode.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
    );
  }, [vehicles, search]);

  const theme = {
    background: darkMode
      ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
      : "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
    text: darkMode ? "#ffffff" : "#1b263b",
    cardBg: darkMode
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.75)",
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
          🚘 Fleet Operations Center
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

      {/* SEARCH PANEL */}
      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          borderRadius: "18px",
          background: theme.cardBg,
          backdropFilter: "blur(12px)",
          boxShadow: theme.glow
        }}
      >
        <input
          type="text"
          placeholder="Search Vehicle ID, Fleet Group, Model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 15px",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            fontSize: "14px"
          }}
        />
      </div>

      {/* TABLE PANEL */}
      <div
        style={{
          padding: "30px",
          borderRadius: "20px",
          background: theme.cardBg,
          backdropFilter: "blur(15px)",
          boxShadow: theme.glow,
          overflowX: "auto"
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.85 }}>
              <th style={thStyle}>Vehicle ID</th>
              <th style={thStyle}>Fleet Group</th>
              <th style={thStyle}>Vehicle Model</th>
              <th style={thStyle}>Battery Configuration</th>
              <th style={thStyle}>State of Charge</th>
              <th style={thStyle}>Battery Temp (°C)</th>
            </tr>
          </thead>

          <tbody>
            {filteredVehicles.map((v) => {
              const latest = v.telemetry[0];
              const pack = v.batteryPacks[0];

              const socColor =
                latest?.socPercent > 60
                  ? "#2ecc71"
                  : latest?.socPercent > 30
                  ? "#f39c12"
                  : "#e74c3c";

              return (
                <tr
                  key={v.id}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    transition: "0.3s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      darkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={tdStyle}>{v.vin}</td>
                  <td style={tdStyle}>{v.fleetCode}</td>
                  <td style={tdStyle}>
                    {v.manufacturer} {v.model}
                  </td>
                  <td style={tdStyle}>
                    {pack?.chemistry} / {pack?.capacityKWh} kWh / SOH {pack?.sohPercent ?? "-"}%
                  </td>
                  <td style={tdStyle}>
                    {latest ? (
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          background: socColor,
                          color: "#fff",
                          fontWeight: 600
                        }}
                      >
                        {latest.socPercent}%
                      </span>
                    ) : "-"}
                  </td>
                  <td style={tdStyle}>
                    {latest ? latest.batteryTempC : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "14px 10px",
  fontWeight: 600
};

const tdStyle = {
  padding: "16px 10px"
};
