import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>EV Monitor</h2>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/vehicles">Vehicles</NavLink>
          <NavLink to="/alerts">Alerts</NavLink>
        </nav>
        <div className="sidebar-user">
          <p>{user?.name}</p>
          <small>{user?.role}</small>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
