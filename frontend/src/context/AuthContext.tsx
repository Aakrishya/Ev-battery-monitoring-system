import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR";
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("ev_token"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem("ev_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  const value = useMemo(
    () => ({
      token,
      user,
      login: (nextToken: string, nextUser: AuthUser) => {
        localStorage.setItem("ev_token", nextToken);
        localStorage.setItem("ev_user", JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem("ev_token");
        localStorage.removeItem("ev_user");
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
