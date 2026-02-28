// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { api, attachInterceptors } from "../api/apiclient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const navigate = useNavigate();
  const refreshTimer = useRef(null);

  /* ================================
      Fetch user profile (/me)
     ================================ */
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data.data);
    } catch (err) {
      console.error("User fetch failed");
      setUser(null);
    }
  }, []);

  /* ================================
      Schedule auto token refresh
     ================================ */
  const scheduleRefresh = (token) => {
    try {
      const { exp } = jwtDecode(token);
      const delay = exp * 1000 - Date.now() - 5 * 60 * 1000;

      if (refreshTimer.current) clearTimeout(refreshTimer.current);

      refreshTimer.current = setTimeout(() => {
        refreshAccessToken();
      }, Math.max(delay, 5000));
    } catch {}
  };

  /* ================================
      Refresh access token (cookie)
     ================================ */
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await api.get("/refresh/refreshtoken");
      const token = res.data?.accessToken;
      if (!token) throw new Error();

      setAccessToken(token);
      scheduleRefresh(token);

      await fetchUser();   // 🔥 get fresh user data

      return token;
    } catch {
      logout(false);
      return null;
    }
  }, [fetchUser]);

  /* ================================
      Login
     ================================ */
  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    const token = res.data?.accessToken;
    if (!token) throw new Error("Login failed");

    setAccessToken(token);
    scheduleRefresh(token);

    await fetchUser();

    localStorage.setItem("auth_event", "login");
    navigate("/", { replace: true });
  };

  /* ================================
      Logout
     ================================ */
  const logout = async (redirect = true) => {
    try {
      await api.post("/logout");   // clear refresh cookie
    } catch {}

    setAccessToken(null);
    setUser(null);

    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    localStorage.setItem("auth_event", "logout");

    if (redirect) {
      window.location.href = "/login";
    }
  };

  /* ================================
      Initial auth check
     ================================ */
  const checkAuth = async () => {
    await refreshAccessToken();
    setIsAuthReady(true);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  /* ================================
      Attach axios interceptors
     ================================ */
  useEffect(() => {
    attachInterceptors(
      () => accessToken,
      refreshAccessToken,
      logout
    );
  }, [accessToken, refreshAccessToken]);

  /* ================================
      Multi-tab sync
     ================================ */
  useEffect(() => {
    const sync = (e) => {
      if (e.key !== "auth_event") return;
      if (e.newValue === "logout") logout(false);
      if (e.newValue === "login") checkAuth();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isAuthReady,
        user,               // 🔥 use anywhere
        login,
        logout,
        refreshAccessToken,
        api,
        fetchUser                // authenticated axios
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);