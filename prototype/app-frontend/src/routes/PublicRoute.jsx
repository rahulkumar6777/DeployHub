import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();

  // wait until auth check finishes
  if (!isAuthReady) return null;

  // if already logged in → go to dashboard
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}