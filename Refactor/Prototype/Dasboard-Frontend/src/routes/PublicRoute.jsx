import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  if (!isAuthReady) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}