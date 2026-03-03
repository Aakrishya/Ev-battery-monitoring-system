export function StatCard({
  label,
  value,
  emphasis
}: {
  label: string;
  value: string | number;
  emphasis?: "critical" | "normal";
}) {
  return (
    <div className={`stat-card ${emphasis === "critical" ? "critical" : ""}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}
