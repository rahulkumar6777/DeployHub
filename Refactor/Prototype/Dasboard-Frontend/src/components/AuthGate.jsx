import { useAuth } from "../context/AuthContext";

export default function AuthGate({ children }) {
  const { isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
      </div>
    );
  }

  return children;
}