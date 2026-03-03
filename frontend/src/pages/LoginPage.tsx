import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("admin@evmonitor.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      navigate("/");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      {/* Animated Glow Background Orbs */}
      <div style={orbStyle1}></div>
      <div style={orbStyle2}></div>

      <div style={cardWrapper}>
        {/* Branding */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={brandStyle}>VoltGuard</h1>
          <p style={{ opacity: 0.6 }}>
            Enterprise EV Fleet Intelligence
          </p>
        </div>

        {/* Login Card */}
        <form onSubmit={onSubmit} style={cardStyle}>
          <h2 style={{ marginBottom: 25, fontWeight: 600 }}>
            Secure Access
          </h2>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20, position: "relative" }}>
            <label style={labelStyle}>Password</label>
            <input
              style={inputStyle}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={toggleStyle}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Authenticating..." : "Enter Dashboard"}
          </button>
        </form>

        <p style={footerStyle}>
          © {new Date().getFullYear()} VoltGuard Technologies
        </p>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "radial-gradient(circle at 30% 30%, #0f3460 0%, transparent 40%), radial-gradient(circle at 70% 70%, #16213e 0%, transparent 40%), #0a192f",
  fontFamily: "Inter, sans-serif",
  color: "#fff",
  overflow: "hidden",
  position: "relative"
};

const cardWrapper: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "420px",
  textAlign: "center"
};

const cardStyle: React.CSSProperties = {
  padding: "40px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(25px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 0 50px rgba(0,255,200,0.2)"
};

const brandStyle: React.CSSProperties = {
  fontSize: "42px",
  fontWeight: 700,
  background: "linear-gradient(90deg,#00f5d4,#00bbf9)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  opacity: 0.7,
  display: "block",
  textAlign: "left"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  outline: "none",
  fontSize: "14px"
};

const toggleStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "38px",
  fontSize: "12px",
  cursor: "pointer",
  opacity: 0.7
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "30px",
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(90deg,#00f5d4,#00bbf9)",
  color: "#000",
  fontWeight: 700,
  fontSize: "14px",
  boxShadow: "0 0 25px rgba(0,255,200,0.6)",
  transition: "0.3s"
};

const errorStyle: React.CSSProperties = {
  marginBottom: "15px",
  padding: "10px",
  borderRadius: "8px",
  background: "rgba(255,0,0,0.2)",
  color: "#ff6b6b",
  fontSize: "13px"
};

const footerStyle: React.CSSProperties = {
  marginTop: "25px",
  fontSize: "12px",
  opacity: 0.4
};

const orbStyle1: React.CSSProperties = {
  position: "absolute",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "radial-gradient(circle,#00f5d4,transparent)",
  top: "-100px",
  left: "-100px",
  filter: "blur(100px)",
  opacity: 0.5
};

const orbStyle2: React.CSSProperties = {
  position: "absolute",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "radial-gradient(circle,#00bbf9,transparent)",
  bottom: "-100px",
  right: "-100px",
  filter: "blur(100px)",
  opacity: 0.5
};
