import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { api, attachInterceptors } from "../api/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const accessTokenRef = useRef(null);
  const navigate = useNavigate();

  /* =====================================
     Keep token ref synced
  ===================================== */
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  /* =====================================
     Fetch current user
  ===================================== */
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/me");
      setUser(res.data?.data || null);
    } catch {
      setUser(null);
    }
  }, []);

  /* =====================================
     Refresh Access Token
  ===================================== */
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await api.get("/refresh/refreshtoken");
      const token = res.data?.accessToken;

      if (!token) throw new Error("No token returned");

      setAccessToken(token);
      await fetchUser();

      return token;
    } catch {
      return null;
    }
  }, [fetchUser]);

  /* =====================================
     Login
  ===================================== */
  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    const token = res.data?.accessToken;

    if (!token) throw new Error("Login failed");

    setAccessToken(token);
    await fetchUser();

    navigate("/", { replace: true });
  };

  /* =====================================
     Logout
  ===================================== */
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {}

    setAccessToken(null);
    setUser(null);

    navigate("/login", { replace: true });
  };

  /* =====================================
     AUTO LOGIN (Run Once)
  ===================================== */
  useEffect(() => {
    const init = async () => {
      if (!accessTokenRef.current) {
        await refreshAccessToken();
      }
      setIsAuthReady(true);
    };

    init();
  }, [refreshAccessToken]);

  /* =====================================
     Attach Interceptors Once
  ===================================== */
  useEffect(() => {
    const eject = attachInterceptors(
      () => accessTokenRef.current,
      refreshAccessToken,
      logout
    );

    return eject;
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isAuthReady,
        user,
        fetchUser,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);