import { createContext, useContext, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { api } from "../api/client";

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return payload;
  } catch {
    return null;
  }
};

const readClaim = (payload, keys) => {
  for (const key of keys) {
    if (payload?.[key] !== undefined && payload?.[key] !== null) {
      return payload[key];
    }
  }
  return undefined;
};

const fromToken = (token, fallback = {}) => {
  const payload = parseJwt(token);
  if (!payload && !fallback.role) return null;

  const idClaim = readClaim(payload, [
    "nameid",
    "sub",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
  ]);
  const roleClaim = readClaim(payload, [
    "role",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
  ]);
  const nameClaim = readClaim(payload, [
    "unique_name",
    "name",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
  ]);
  const emailClaim = readClaim(payload, [
    "email",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  ]);

  return {
    token,
    id: Number(idClaim ?? fallback.employeeId),
    name: nameClaim ?? fallback.name,
    role: roleClaim ?? fallback.role,
    email: emailClaim ?? fallback.email
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => fromToken(Cookies.get("expense_token")));

  const login = async (email, password) => {
    const { data } = await api.post("/Auth/login", { email, password });
    Cookies.set("expense_token", data.token, {
      secure: false,
      sameSite: "Strict",
      expires: 1
    });
    setUser(fromToken(data.token, data));
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/Auth/logout");
    } catch {
      // Ignore network/logout failures, always clear local state.
    } finally {
      Cookies.remove("expense_token");
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
