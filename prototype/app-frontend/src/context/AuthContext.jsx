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
  const accessTokenRef = useRef(null);

  // Keep ref updated
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  /* ================================
      Fetch user profile
  ================================= */
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data.data);
    } catch {
      setUser(null);
    }
  }, []);

  /* ================================
      Schedule auto refresh
  ================================= */
  const scheduleRefresh = (token) => {
    try {
      const { exp } = jwtDecode(token);
      const delay = exp * 1000 - Date.now() - 5 * 60 * 1000;

      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }

      refreshTimer.current = setTimeout(() => {
        refreshAccessToken();
      }, Math.max(delay, 5000));
    } catch {}
  };

  /* ================================
      Refresh access token
  ================================= */
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await api.get("/refresh/refreshtoken");
      const token = res.data?.accessToken;
      if (!token) throw new Error();

      setAccessToken(token);
      scheduleRefresh(token);
      await fetchUser();

      return token;
    } catch {
      logout(false);
      return null;
    }
  }, [fetchUser]);

  /* ================================
      Login
  ================================= */
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
  ================================= */
  const logout = async (redirect = true) => {
    try {
      await api.post("/logout");
    } catch {}

    setAccessToken(null);
    setUser(null);

    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }

    localStorage.setItem("auth_event", "logout");

    if (redirect) {
      navigate("/login", { replace: true });
    }
  };

  /* ================================
      Initial auth check
  ================================= */
  useEffect(() => {
    const init = async () => {
      try {
        await refreshAccessToken();
      } finally {
        setIsAuthReady(true);
      }
    };
    init();
  }, []);

  /* ================================
      Attach interceptors ONCE
  ================================= */
  useEffect(() => {
    const eject = attachInterceptors(
      () => accessTokenRef.current,
      refreshAccessToken,
      logout
    );

    return eject;
  }, [refreshAccessToken]);

  /* ================================
      Multi-tab sync
  ================================= */
  useEffect(() => {
    const sync = (e) => {
      if (e.key !== "auth_event") return;
      if (e.newValue === "logout") logout(false);
      if (e.newValue === "login") refreshAccessToken();
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isAuthReady,
        user,
        login,
        logout,
        refreshAccessToken,
        api,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);