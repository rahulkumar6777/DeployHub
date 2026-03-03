import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { api, attachInterceptors } from "../api/apiclient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const accessTokenRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  /* ==============================
     Fetch User
  ============================== */
  const fetchUser = useCallback(async () => {
    const res = await api.get("/me");
    setUser(res.data.data);
  }, []);

  /* ==============================
     Refresh Access Token
  ============================== */
  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await api.get("/refresh/refreshtoken");
      const token = res.data?.accessToken;

      if (!token) throw new Error();

      setAccessToken(token);
      await fetchUser();
      return token;
    } catch {
      return null;
    }
  }, [fetchUser]);

  /* ==============================
     Login
  ============================== */
  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    const token = res.data?.accessToken;

    if (!token) throw new Error("Login failed");

    setAccessToken(token);
    await fetchUser();
    navigate("/", { replace: true });
  };

  /* ==============================
     Logout (HARD)
  ============================== */
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {}

    setAccessToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  };

  /* ==============================
     Attach Interceptors Once
  ============================== */
  useEffect(() => {
    const eject = attachInterceptors(
      () => accessTokenRef.current,
      refreshAccessToken,
      logout
    );

    setIsAuthReady(true);

    return eject;
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        isAuthReady,
        user,
        login,
        logout,
        fetchUser,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);