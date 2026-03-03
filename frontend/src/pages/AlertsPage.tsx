import { useEffect, useState } from "react";
import { api } from "../services/api";

type AlertItem = {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  description: string;
  isAcknowledged: boolean;
  createdAt: string;
  vehicle: { vin: string; model: string; fleetCode: string };
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const loadAlerts = async () => {
    const { data } = await api.get("/alerts");
    setAlerts(data);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  async function acknowledge(id: string) {
    await api.patch(`/alerts/${id}/ack`);
    await loadAlerts();
  }

  const theme = {
    background: darkMode
      ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
      : "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
    text: darkMode ? "#ffffff" : "#1b263b",
    cardBg: darkMode
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.75)",
    glow: darkMode
      ? "0 0 20px rgba(255,0,100,0.4)"
      : "0 0 20px rgba(220,53,69,0.3)"
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "#e74c3c";
      case "WARNING":
        return "#f39c12";
      case "INFO":
        return "#3498db";
      default:
        return "#6c757d";
    }
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
          🚨 Alert Management Center
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "10px 18px",
            borderRadius: "25px",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
            background: darkMode ? "#ff4d6d" : "#dc3545",
            color: "#fff",
            transition: "0.3s",
            boxShadow: theme.glow
          }}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* ALERT LIST */}
      <div
        style={{
          display: "grid",
          gap: "20px"
        }}
      >
        {alerts.map((a) => (
          <div
            key={a.id}
            style={{
              padding: "25px",
              borderRadius: "20px",
              background: theme.cardBg,
              backdropFilter: "blur(15px)",
              boxShadow: theme.glow,
              transition: "0.3s",
              position: "relative"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-6px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <h3 style={{ margin: 0 }}>{a.title}</h3>

              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: severityColor(a.severity),
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "12px"
                }}
              >
                {a.severity}
              </span>
            </div>

            <p style={{ margin: "10px 0", opacity: 0.85 }}>
              {a.description}
            </p>

            <small style={{ opacity: 0.7 }}>
              Fleet: {a.vehicle.fleetCode} | Vehicle: {a.vehicle.vin} |{" "}
              {new Date(a.createdAt).toLocaleString()}
            </small>

            {/* ACKNOWLEDGE BUTTON */}
            <div style={{ marginTop: "15px" }}>
              {!a.isAcknowledged ? (
                <button
                  onClick={() => acknowledge(a.id)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "20px",
                    border: "none",
                    cursor: "pointer",
                    background: "#28a745",
                    color: "#fff",
                    fontWeight: 600,
                    transition: "0.3s",
                    boxShadow: "0 0 15px rgba(40,167,69,0.4)"
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  ✔ Acknowledge
                </button>
              ) : (
                <span
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    background: "#6c757d",
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: "13px"
                  }}
                >
                  Acknowledged
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
